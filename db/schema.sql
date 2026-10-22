create table if not exists rooms (
  id integer primary key,
  name text not null unique collate nocase,
  created_at text not null default (datetime('now'))
);

create table if not exists furniture (
  id integer primary key,
  room_id integer not null references rooms(id) on delete cascade,
  kind text not null,
  name text not null collate nocase,
  sort_order integer not null default 0,
  created_at text not null default (datetime('now'))
);

create table if not exists spots (
  id integer primary key,
  room_id integer not null references rooms(id) on delete cascade,
  furniture_id integer references furniture(id) on delete cascade,
  name text not null collate nocase,
  style text,
  holds_json text not null default '[]',
  sort_order integer not null default 0
);

create table if not exists items (
  id integer primary key,
  name text not null,
  category text not null default 'other',
  clothing_type text,
  color text,
  description text,
  room_id integer references rooms(id) on delete set null,
  spot_id integer references spots(id) on delete set null,
  container_id integer references items(id) on delete set null,
  is_container integer not null default 0,
  why_kept text,
  would_discard text not null default 'never' check (would_discard in ('never', 'maybe', 'soon')),
  notes text,
  tags_json text not null default '[]',
  ai_json text,
  original_file text,
  cutout_file text,
  sprite_file text,
  embedding blob,
  grid_x integer,
  grid_y integer,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists lists (
  id integer primary key,
  title text not null,
  missing_json text not null default '[]',
  created_at text not null default (datetime('now'))
);

create table if not exists list_items (
  list_id integer not null references lists(id) on delete cascade,
  item_id integer not null references items(id) on delete cascade,
  checked integer not null default 0,
  primary key (list_id, item_id)
);

create unique index if not exists spots_loose_name on spots(room_id, name) where furniture_id is null;
create unique index if not exists spots_compartment_name on spots(furniture_id, name) where furniture_id is not null;
create index if not exists furniture_room on furniture(room_id);
create index if not exists items_room on items(room_id);
create index if not exists items_spot on items(spot_id);
create index if not exists items_container on items(container_id);

create virtual table if not exists items_fts using fts5(
  name, category, clothing_type, color, description, tags_json, notes,
  content = 'items', content_rowid = 'id', tokenize = 'porter unicode61'
);

create trigger if not exists items_fts_insert after insert on items begin
  insert into items_fts (rowid, name, category, clothing_type, color, description, tags_json, notes)
  values (new.id, new.name, new.category, new.clothing_type, new.color, new.description, new.tags_json, new.notes);
end;

create trigger if not exists items_fts_delete after delete on items begin
  insert into items_fts (items_fts, rowid, name, category, clothing_type, color, description, tags_json, notes)
  values ('delete', old.id, old.name, old.category, old.clothing_type, old.color, old.description, old.tags_json, old.notes);
end;

create trigger if not exists items_fts_update after update of name, category, clothing_type, color, description, tags_json, notes on items begin
  insert into items_fts (items_fts, rowid, name, category, clothing_type, color, description, tags_json, notes)
  values ('delete', old.id, old.name, old.category, old.clothing_type, old.color, old.description, old.tags_json, old.notes);
  insert into items_fts (rowid, name, category, clothing_type, color, description, tags_json, notes)
  values (new.id, new.name, new.category, new.clothing_type, new.color, new.description, new.tags_json, new.notes);
end;
