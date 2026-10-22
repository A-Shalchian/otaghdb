import Database from "better-sqlite3";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

export const DATA_DIR = path.join(process.cwd(), "data");

const STARTER_ROOMS = ["bedroom", "living room", "kitchen", "bathroom", "office"];

type Db = Database.Database;

// Each entry upgrades a database created by an older schema.sql. New
// databases get the full schema directly and skip all of them.
const MIGRATIONS: ((db: Db) => void)[] = [
  (db) => {
    db.exec(`
      create table spots_new (
        id integer primary key,
        room_id integer not null references rooms(id) on delete cascade,
        furniture_id integer references furniture(id) on delete cascade,
        name text not null collate nocase,
        style text,
        holds_json text not null default '[]',
        sort_order integer not null default 0
      );
      insert into spots_new (id, room_id, name) select id, room_id, name from spots;
      drop table spots;
      alter table spots_new rename to spots;
      alter table items add column clothing_type text;
    `);
  },
];

function tableExists(db: Db, name: string) {
  return Boolean(db.prepare("select 1 from sqlite_master where name = ?").get(name));
}

function migrate(db: Db) {
  const schema = readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf8");
  const fresh = !tableExists(db, "rooms");
  const hadSearchIndex = tableExists(db, "items_fts");

  if (fresh) {
    db.exec(schema);
    db.pragma(`user_version = ${MIGRATIONS.length}`);
    return;
  }

  const version = db.pragma("user_version", { simple: true }) as number;
  if (version < MIGRATIONS.length) {
    db.pragma("foreign_keys = OFF");
    db.transaction(() => {
      for (const step of MIGRATIONS.slice(version)) step(db);
      db.pragma(`user_version = ${MIGRATIONS.length}`);
    })();
    db.pragma("foreign_keys = ON");
  }
  db.exec(schema);
  if (!hadSearchIndex) db.exec("insert into items_fts (items_fts) values ('rebuild')");
}

function open() {
  mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(path.join(DATA_DIR, "otaghdb.sqlite"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);

  const { count } = db.prepare("select count(*) as count from rooms").get() as {
    count: number;
  };
  if (count === 0) {
    const insert = db.prepare("insert into rooms (name) values (?)");
    for (const name of STARTER_ROOMS) insert.run(name);
  }
  return db;
}

const cache = globalThis as unknown as { otaghdb?: Db };

export const db = cache.otaghdb ?? (cache.otaghdb = open());
