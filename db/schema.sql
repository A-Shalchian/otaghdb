create table if not exists rooms (
  id integer primary key,
  name text not null unique collate nocase,
  created_at text not null default (datetime('now'))
);

create table if not exists spots (
  id integer primary key,
  room_id integer not null references rooms(id) on delete cascade,
  name text not null collate nocase,
  unique (room_id, name)
);

create table if not exists items (
  id integer primary key,
  name text not null,
  category text not null default 'other',
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

create index if not exists items_room on items(room_id);
create index if not exists items_container on items(container_id);
