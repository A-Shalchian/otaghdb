import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const ROOT = new URL("../../", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);
const USED = new Set([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
const path = (url) => decodeURIComponent(url.pathname).replace(/^\/([A-Za-z]:)/, "$1");

const require = createRequire(new URL("package.json", ROOT));
const Database = require("better-sqlite3");
const db = new Database(path(new URL("data/otaghdb.sqlite", ROOT)), { readonly: true });
const items = db
  .prepare(
    `select i.id, i.name, i.category, i.color, i.tags_json, i.grid_x, i.grid_y,
            r.name as room, s.name as spot, f.name as furniture
       from items i
       join rooms r on r.id = i.room_id
       left join spots s on s.id = i.spot_id
       left join furniture f on f.id = s.furniture_id
      order by i.id`,
  )
  .all()
  .filter((item) => USED.has(item.id))
  .map(({ tags_json, ...item }) => ({ ...item, tags: JSON.parse(tags_json ?? "[]") }));
db.close();

mkdirSync(new URL("items/", PUBLIC), { recursive: true });
for (const item of items) {
  const from = new URL(`data/images/${item.id}/`, ROOT);
  if (existsSync(from)) cpSync(from, new URL(`items/${item.id}/`, PUBLIC), { recursive: true });
}
writeFileSync(new URL("../captures/items.json", import.meta.url), JSON.stringify(items, null, 2));
console.log(`exported ${items.length} items`);
