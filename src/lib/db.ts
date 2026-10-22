import Database from "better-sqlite3";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

export const DATA_DIR = path.join(process.cwd(), "data");

const STARTER_ROOMS = ["bedroom", "living room", "kitchen", "bathroom", "office"];

function open() {
  mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(path.join(DATA_DIR, "otaghdb.sqlite"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf8"));

  const { count } = db.prepare("select count(*) as count from rooms").get() as {
    count: number;
  };
  if (count === 0) {
    const insert = db.prepare("insert into rooms (name) values (?)");
    for (const name of STARTER_ROOMS) insert.run(name);
  }
  return db;
}

const cache = globalThis as unknown as { otaghdb?: Database.Database };

export const db = cache.otaghdb ?? (cache.otaghdb = open());
