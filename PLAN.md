# OtaghDB plan

OtaghDB turns your room into a searchable database. Photograph one object or a whole drawer. Local models cut each object out, name and tag it, and you file it under a room, a spot, and optionally a container (a backpack, a box). Later you ask "where is my passport?", "what do I bring camping?", or "move everything in the black backpack to the closet", and the app answers or makes the change.

The idea came from moving into a new place with a lot of stuff. You photograph each thing as you put it away, and later the app tells you which closet shelf or desk drawer it went into.

Every AI step runs on open-weight models on this laptop. Cost is $0: no API keys, no credits, no cloud.

## Contents

1. [Rules we must meet](#rules-we-must-meet)
2. [What we are building](#what-we-are-building)
3. [Landing page and distribution](#landing-page-and-distribution)
4. [The stack and why](#the-stack-and-why)
5. [How each feature works](#how-each-feature-works)
6. [Data model](#data-model)
7. [Memory budget](#memory-budget)
8. [Sponsor prizes](#sponsor-prizes)
9. [Folder layout](#folder-layout)
10. [Setup steps](#setup-steps)
11. [Build order](#build-order)
12. [Demo script](#demo-script)
13. [Risks and fallbacks](#risks-and-fallbacks)
14. [Glossary](#glossary)

## Rules we must meet

| Rule | How OtaghDB meets it |
|---|---|
| Open-source or open-weight AI is a key part of how it works | Detection, cutouts, naming, image search and the chat agent all run on open-weight models (Qwen3.5, SAM 2.1, U2-Net, SigLIP 2). |
| Public GitHub repo with an open-source license | New repo under MIT. |
| Agent skills follow the Agent Skill Open Standard | Only if we ship the optional skill. |

## What we are building

1. **Add one item.** Take or upload a photo. The background disappears. The AI fills in name, category, color and tags. If it cut out the wrong thing, tap the right object and it cuts that one instead.
2. **Add many items from one photo.** Photograph a drawer, a shelf or a desk. The AI finds every object, cuts each one out and names it. You untick mistakes, tap anything it missed, and save them all at once.
3. **Browse.** A grid of cutouts, filtered by room, category or tag. Click an item to edit it. Open a container to see what is inside.
4. **Search by look.** Type "something red and round" and it finds items by how they look, even if their names do not match. Point the phone at something in a store and ask "do I already own this?".
5. **Ask and act.** A chat that answers from the database and can change it. "Where is my passport?", "mark every cable as maybe", "move everything in the black backpack to the closet shelf". Changes show as a preview you approve before anything is saved.
6. **Packing lists.** "I'm going camping for 3 days" gives a checklist of things you own, grouped by where they are, plus things you need but do not own.
7. **Pixel room.** Each item gets a pixel-art sprite. Each room shows its items as sprites on a grid.
8. **Furniture and the closet.** Add a closet, a desk or a dresser to a room. Each one comes with its usual compartments (desk drawers, a closet rod and shelves) and knows what usually goes in each, so the app suggests where a new item belongs. The closet has its own clothes-only view that you flip through like a real closet. See [Furniture, compartments and the closet](#furniture-compartments-and-the-closet).

Out of scope: 3D scans, login, multiple users, cloud hosting.

## Landing page and distribution

- The landing page lives at `/` and the app at `/app`. Anyone who clones and runs OtaghDB sees the landing page first, and "Open your room" takes them into the app.
- The wordmark carries one small line under it: "otagh (n.) Persian for room".
- The design is Just ask: the page reads as a chat thread. The hero types sample questions and answers each one with the item card and its location chain. On screens 1024 pixels and wider the hero splits into two columns, the pitch on the left and the live question on the right.
- The copy and facts live in `src/features/landing/content.ts` and the object drawings in `objects.tsx`.
- OtaghDB is distributed as a repo you clone and run. The models are open-weight, so hosting them on a rented GPU server is possible, but it costs money and needs login and per-user data, which are out of scope. Running locally also means photos of your things never leave your laptop.
- The landing page alone can later be exported as a static page and hosted for free, pointing people to the repo.

## The stack and why

| Part | Tool | License |
|---|---|---|
| AI runtime | Ollama | MIT |
| Vision, chat and tool calls | Qwen3.5 9B (fallback 4B) | Apache 2.0 |
| Automatic cutout | rembg with U2-Net | MIT, Apache 2.0 |
| Tap-to-cut and multi-item cutouts | SAM 2.1 | Apache 2.0 |
| Search by look | SigLIP 2 | Apache 2.0 |
| Vision service | Python, FastAPI, Hugging Face Transformers | MIT, Apache 2.0 |
| App | Next.js 16, TypeScript, Tailwind CSS v4 | MIT |
| Database | SQLite through better-sqlite3 | public domain, MIT |

### AI runtime: Ollama

Ollama runs models on your machine and exposes them at `http://localhost:11434`.

- MIT licensed and open source. LM Studio is free but closed source, which is weaker for an open-source AI prize.
- Accepts images in the same request as text.
- Can force replies to match a JSON schema (the `format` field), so we get clean objects instead of free text.
- Supports tool calling with Qwen3.5, which the ask-and-act chat needs.
- Can turn the model's thinking step off (`think: false`), which saves seconds per item.

### Vision, chat and tool calls: Qwen3.5 9B (fallback 4B)

One model looks at photos, finds objects, names them, answers questions and calls tools.

| | qwen3.5:9b | qwen3.5:4b |
|---|---|---|
| Download | about 6.6 GB | about 3.3 GB |
| Sees images | yes, built in | yes, built in |
| Fits the 8 GB GPU | yes, with a short context window | yes, with room to spare |
| Role | default | fallback if 9B is too slow |

- Image support is built in. No separate vision file to manage.
- It can return bounding boxes for the objects it sees, which the multi-item feature needs. Qwen's vision models give boxes on a 0 to 1000 scale, which we convert to pixels.
- The 9B is the largest Qwen3.5 that fits fully on the GPU. A model that spills onto the CPU runs several times slower.
- One model for every language job means it stays loaded instead of swapping in and out of 8 GB.

### Automatic cutout: rembg with U2-Net

Used when you add a single item and do not tap anything.

- rembg finds the main object and removes the background. We call it as a Python library inside the vision service.
- We use `u2net`. It cuts a photo in 0.7 seconds on this laptop's CPU.
- We tried `birefnet-general-lite` first. Its edges were slightly cleaner, but it took 13.7 seconds per photo and grew the vision service to 20 GB of memory. `isnet-general-use` took 1.1 seconds and looked the same as `u2net`.
- Always name the model. rembg's default, `bria-rmbg`, is licensed CC BY-NC (no commercial use), which is not open source.

### Tap-to-cut and multi-item cutouts: SAM 2.1

SAM (Segment Anything Model, by Meta) cuts out exactly the object you point at.

- You tap a point, or the app gives it a box, and it returns the mask for that object. rembg can only guess the main object, which fails on cluttered photos.
- For multi-item photos, Qwen gives one box per object and SAM turns each box into a clean cutout. Boxes alone would leave background in every crop.
- We use the `facebook/sam2.1-hiera-small` checkpoint through Hugging Face Transformers (`Sam2Model`, `Sam2Processor`). Small is fast enough on the CPU. `hiera-tiny` is the fallback if not.

### Search by look: SigLIP 2

SigLIP 2 (by Google) turns images and text into vectors in the same space, so a photo of a red ball and the words "something red and round" land close together.

- Each saved cutout gets an image vector, stored in SQLite.
- A text search compares the text vector against every item's image vector.
- "Do I already own this?" compares a new photo's vector against every item.
- The same check warns you when you add something you already have.
- We use `google/siglip2-base-patch16-224` (0.4B parameters). Base is accurate enough and fast on the CPU.
- Comparing vectors is plain math in TypeScript. Under a few thousand items it takes milliseconds, so no vector database is needed.

### Vision service: Python, FastAPI, Transformers

rembg, SAM 2.1 and SigLIP 2 are Python libraries, so they run together in one small Python web service on `http://localhost:7000`.

- One process, one virtual environment, every model loaded once at startup.
- FastAPI is the simplest way to put Python functions behind HTTP endpoints.
- Everything runs on the CPU so Qwen keeps the whole GPU.
- Python 3.10, because the Python 3.12 install on this laptop is broken.

Endpoints:

| Endpoint | Input | Output |
|---|---|---|
| `POST /cutout` | photo | PNG of the main object (rembg) |
| `POST /segment` | photo plus tap points or boxes | one PNG per object (SAM 2.1) |
| `POST /embed/image` | image | vector (SigLIP 2) |
| `POST /embed/text` | text | vector (SigLIP 2) |

### App: Next.js 16, TypeScript, Tailwind CSS v4

- Same framework as roomche.
- One codebase for screens and the server code that calls Ollama and the vision service.
- `zod` checks every AI reply before it touches the database.
- `sharp` resizes photos and makes the pixel sprites.

### Database: SQLite through better-sqlite3

- One file on disk. No server, no account, no free tier that pauses.
- Works with no internet.
- Built-in keyword search (FTS5): typing "charger" finds every item that mentions it, no AI call.
- Stores the SigLIP vectors as binary columns.

### Images: a local folder

Photos live in `data/images/<item id>/` as `original.jpg`, `cutout.png` and `sprite.png`. Multi-item source photos live in `data/scenes/`. `data/` is in `.gitignore`, so photos of your stuff never reach GitHub.

### Phone camera: Tailscale

Phone browsers only allow the live camera on HTTPS pages. `tailscale serve --bg 3100` gives the laptop an HTTPS address like `laptop.tail1234.ts.net` that only devices on the tailnet can open. The app has no login, so keeping it off the public internet is what keeps the inventory private. Funnel would make it public and is not used.

- `start.ps1` runs `tailscale serve` when Tailscale is signed in and prints the phone address. It gives up after 20 seconds with a hint, because the first serve on a tailnet can stop to ask for HTTPS certificates to be turned on.
- The Phone page (`/app/phone`) reads `tailscale status` and `tailscale serve status` and shows the address as a QR code, or says what is missing.
- `next.config.ts` allows `**.ts.net` for Server Actions and for the dev server, because requests from the phone carry the tailnet address as their origin.
- The Camera button opens a full-screen live viewfinder (`getUserMedia`) with a shutter and a front and back flip. A frame is drawn to a canvas and sent as a JPEG.
- On the add-one screen the camera opens again after each save until you press Close, so adding a pile of things is shoot, check, save, repeat.
- Without HTTPS (plain wifi address) the same button opens the phone's own camera app through a file input, and Choose photo always works.

## How each feature works

### Adding one item

1. Pick the room you are in. Every item you add defaults to it.
2. Take or upload a photo. The server shrinks it to 1024 pixels on the long side.
3. The vision service returns a cutout from rembg. The server keeps the largest object and crops to it.
4. If the cutout is wrong, tap the right object on the original photo. The vision service runs SAM 2.1 on that point and returns a new cutout.
5. The server sends the cutout to Qwen3.5 with this JSON schema:

   ```json
   {
     "name": "black zip hoodie",
     "category": "clothing",
     "color": "black",
     "tags": ["hoodie", "cotton", "zip"],
     "description": "black cotton zip-up hoodie with a front pocket",
     "looks_like_container": false
   }
   ```

   Settings: `think: false`, `temperature: 0`, 4096-token context (`num_ctx`), `keep_alive` 30 minutes so the model stays loaded. 4096 is the largest context that keeps the 9B fully on the GPU. Every request must send the same `num_ctx`, because Ollama reloads the model when it changes.
6. `zod` checks the reply. On failure, retry once, then open the form empty.
7. The vision service returns the cutout's SigLIP vector. If an existing item scores above the match threshold, the form shows "you may already own this" with that item.
8. You fix anything, choose spot and container, optionally fill "why I keep it" and "would I throw it out", and save.

Fixed category list: clothing, shoes, accessories, jewelry, bags, books, documents, electronics, cables, kitchen, tools, desk, decor, sports, toiletries, other.

### Adding many items from one photo

1. Photograph a drawer, shelf or desk. The server keeps two copies: 1280 pixels on the long side for Qwen, and 2048 pixels for SAM to cut from. Qwen keeps the 1280-pixel copy that detection was tested and timed with. SAM cuts from the bigger one so each small object keeps its detail. Boxes are stored in 1280-pixel coordinates and scaled up for every cut.
2. Qwen3.5 gets the photo and this schema, and returns every distinct object:

   ```json
   {
     "objects": [
       { "name": "usb-c cable", "category": "cables", "color": "white", "bbox_2d": [112, 640, 298, 870] },
       { "name": "airpods case", "category": "electronics", "color": "white", "bbox_2d": [520, 410, 610, 505] }
     ]
   }
   ```

3. The server drops boxes outside 0 to 1000 or with zero area, then converts them to pixels.
4. The vision service runs SAM 2.1 on every box in one request and returns one cutout per object.
5. The review screen shows every cutout as a card with its name. You untick wrong ones, rename, and tap the photo to add anything missed (SAM point prompt, then Qwen names it).
6. One room, spot and container apply to the whole batch. If the photo is the inside of a container ("top desk drawer"), you pick it once.
7. Save creates all the items, their vectors and their sprites.

Names come from the detection call itself, so a photo of 12 objects is one Qwen call plus one SAM call, not 12 of each.

### Searching by look

1. You type "something red and round" in the search box.
2. The server runs a keyword search and asks the vision service for the text's SigLIP vector.
3. It compares that vector against every item's image vector. A match needs a cosine of at least 0.08 and must be within 0.025 of the best match.
4. Results merge, with keyword matches first.

The thresholds come from real items. The right item scored cosine 0.084 to 0.158 against its description, wrong items scored at most 0.084, and no wrong item came within 0.025 of the best match. A fixed cutoff alone could not separate them.

Keyword search drops stopwords ("a", "and", "for", "something") first. Before that, "a light for reading" matched the TV remote through the word "for".

"Do I already own this?" works the same way with a photo instead of text: cutout, image vector, closest items with a score. Above 0.85 is very likely the same thing and 0.80 to 0.85 is "maybe". The same basket in two photos scored 0.903, while other things in the same room scored 0.72 to 0.74.

Items saved while the vision service was off have no vector. Each search fills in up to 12 of them.

### Ask and act

The chat runs Qwen3.5 with tools through Ollama. The model decides which tools to call. The server runs them and feeds the results back, up to 6 rounds per message.

Tools that only read run straight away:

| Tool | Does |
|---|---|
| `search_items(queries)` | keyword search plus SigLIP text search, several short searches in one call |
| `get_item(id)` | one item with its full location chain and what it holds |
| `list_places()` | every room, piece of furniture, compartment, loose spot and container, with ids |
| `items_in(container_id or spot_id)` | what is inside something |

Tools that change data only propose:

| Tool | Proposes |
|---|---|
| `move_items(item_ids, container_id or spot_id or room)` | moving items |
| `update_items(item_ids, category?, add_tags?, remove_tags?, would_discard?)` | bulk edits |
| `create_spot(room, name, furniture_id?)` | a new spot, or a new compartment in a piece of furniture |
| `plan_packing_list(title, needs)` | a packing list |

A proposal does not touch the database. The chat shows it as a card ("Move 7 items to closet shelf", with the item list) and an Apply button. The model can misread a request, and a bulk change you did not want is worse than one extra click. Apply sends the proposal to a server action that validates it again before changing anything.

The answer is plain text where every item is marked as `[[id]]` right after its name. The server collects the ids, drops any that do not exist, removes the markers and shows a card per item. A JSON `format` cannot be used here, because constraining the output to JSON stops Qwen from emitting tool calls. The location chain (item, container, furniture and compartment, room) comes from the database. Qwen only phrases the answer.

The context is 4096 tokens and the tool definitions take about 1,000 of them. History is cut to the last 6 messages, and older tool results are shortened once the messages pass about 8,000 characters.

### Packing lists

1. You type "I'm going camping for 3 days".
2. Qwen calls `plan_packing_list` with a title and the 10 to 20 things the trip needs (tent, flashlight, layers, chargers).
3. The server matches each need. An item counts only if every word of the need appears in its name, tags or notes, or if it clearly looks like the need to SigLIP (cosine 0.10 or more). Everything else goes on the missing list ("sleeping bag").
4. After you apply it, the list page shows a checklist grouped by room, then furniture and compartment, so you collect everything in one walk through the house. Ticks are saved.

The first version gave Qwen a `create_packing_list(title, item_ids, missing)` tool and expected it to search first. The 9B model searched, then looked up every result one by one, ran out of rounds, and asked "would you like me to create a packing list?" instead of making one. Matching on the server takes one tool call and about 5 seconds.

### Pixel sprites and the pixel room

No AI. `sharp` shrinks the cutout to 48 pixels (64 for jewelry, so thin chains stay visible) and reduces it to 16 colors. The browser scales it up with `image-rendering: pixelated`. Each room page shows its items as draggable sprites on a grid, and positions are saved per item.

### Furniture, compartments and the closet

A room is too big to search by eye. "Bedroom" can hold 200 things. "Bedroom, desk, top drawer" holds 15. Furniture adds that middle level.

| Place | Moves? | Examples |
|---|---|---|
| Furniture | no | closet, desk, dresser, nightstand |
| Compartment | no, it is part of a piece of furniture | top drawer, hanging rod, top shelf |
| Container | yes, it is an item | backpack, shoebox, pouch |

The location chain becomes item, container, compartment, furniture, room. Spots that belong to no furniture ("floor by the door") still work.

#### Templates

Adding furniture starts with picking a kind. The kind creates its usual compartments, and each compartment lists the categories that usually go in it. You can rename, add or delete compartments afterwards.

| Kind | Compartments and what usually goes in them |
|---|---|
| Closet | Hanging rod: shirts, jackets, dresses. Shelves: folded sweaters, jeans. Top shelf: bags, boxes, off-season clothes. Floor: shoes. Door hooks: belts, scarves, hats. |
| Desk | Desktop: laptop, monitor, lamp. Top drawer: pens, sticky notes, chargers, cables. Middle drawer: notebooks, documents. Bottom drawer: files, tools. |
| Dresser | Top drawer: socks, underwear. Middle drawer: t-shirts. Bottom drawer: pants, sweaters. Top: jewelry, watch, perfume. |
| Nightstand | Top: lamp, charger, glasses. Drawer: medicine, earplugs, books. |
| Bathroom cabinet | Shelves: toiletries, medicine. Under the sink: towels, cleaning supplies. |
| Kitchen cabinet | One compartment per shelf, for kitchen things. |
| Bookshelf | One compartment per shelf, for books and decor. |

Templates live in code (`src/lib/furniture.ts`). Adding furniture copies its template's compartments into `spots`. Each compartment stores its categories, from the fixed category list, in `holds_json`.

What the templates do:

1. **Suggest a place.** After the AI names a new item, the form suggests the compartment in the current room that usually holds its category. A hoodie added in the bedroom suggests "closet, hanging rod". One tap accepts it.
2. **File a whole batch.** Photograph the inside of the top desk drawer and pick "desk, top drawer" once for every item in the photo.
3. **Flag odd places.** Filing a cable on the closet rod shows "this usually holds clothing". It still saves.
4. **Show furniture.** A furniture page shows each compartment as a section with its items, top drawer first.

#### The closet view

Each closet gets a page that shows only clothes, shoes and accessories, laid out like the real closet:

- The hanging rod is one horizontal row of cutouts. You swipe or scroll through it like sliding hangers along a rod.
- Shelves show folded clothes as stacks you can open.
- The floor shows shoes in a row.
- Filters: clothing type, color, and "would discard" (to find what to give away).
- A last row, "elsewhere", shows clothes that are not in this closet, such as in the dresser, a suitcase or the laundry. Tapping one shows where it is.

Clothing type is a new field. Qwen fills it when the category is clothing. Fixed list: t-shirt, shirt, sweater, hoodie, jacket, coat, pants, jeans, shorts, skirt, dress, suit, activewear, sleepwear, underwear, socks.

#### Changes to other features

- `list_places()` returns furniture and compartments, so the chat answers "in the top drawer of the desk, in the bedroom".
- `move_items` accepts a compartment.
- Packing lists group by furniture and compartment, so "camping for 3 days" sends you to the closet once for all the clothes.

#### Open questions to decide before building

1. Furniture as its own table, or as container items? Recommendation: its own table. Furniture does not move, has fixed compartments, and should not show up in the item grid.
2. Can things that are not clothes go in the closet? Recommendation: yes, with the odd-place flag. Real closets hold boxes, bags and a vacuum. The closet view hides them unless you turn on "show everything".
3. More than one closet? Recommendation: yes. Each closet gets its own view, and "elsewhere" covers the rest.

## Data model

```
rooms         id, name
furniture     id, room_id -> rooms, kind, name,         ("closet", "desk")
              sort_order
spots         id, room_id -> rooms,
              furniture_id -> furniture,                (null for a loose spot like "floor by the door")
              name, style, holds_json, sort_order       ("hanging rod", "top drawer")
items         id, name, category, clothing_type,        (clothing_type only for clothing)
              color, description,
              room_id -> rooms, spot_id -> spots,
              container_id -> items,                    (a backpack is an item that holds items)
              is_container, why_kept,
              would_discard ('never' | 'maybe' | 'soon'),
              notes, tags_json, ai_json,
              original_file, cutout_file, sprite_file,
              embedding,                                (SigLIP 2 vector, binary)
              grid_x, grid_y,                           (position in the pixel room)
              created_at, updated_at
items_fts     full-text index over name, category, color, description, tags, notes
lists         id, title, missing_json, created_at
list_items    list_id -> lists, item_id -> items, checked
```

- `tags_json` is a JSON list. Enough for one user, half the code of a tags table.
- `ai_json` keeps the model's raw reply, so you can compare what the AI guessed with what you saved.
- Containers can nest (pouch in backpack in suitcase). An item cannot contain itself.
- A compartment is a spot with a `furniture_id`. An item's furniture comes through its spot, so moving a desk to another room moves every drawer and everything in it.
- A spot's `style` (rod, shelf, drawer, floor, hooks, surface) comes from the furniture template and decides how the closet view draws it.
- Items inside a container always share the container's room and spot. Moving a container moves everything in it, nested containers included.
- `src/lib/db.ts` applies `db/schema.sql` to new databases and runs numbered migrations on older ones, tracked with SQLite's `user_version`.

## Memory budget

RTX 4060 Laptop with 8 GB VRAM, 16 GB RAM.

| What runs | Where | Memory |
|---|---|---|
| qwen3.5:9b, 4096-token context | GPU | 5.6 GB of 8, measured |
| Vision service: U2-Net, SAM 2.1 small, SigLIP 2 base | CPU | 2.6 GB RAM in use, 4.2 GB committed, measured |
| Next.js dev server | CPU | about 0.5 to 1 GB RAM |

The 9B is tight. `ollama ps` shows how much of the model is on the GPU. At 8192 or 6144 tokens of context it puts 12% of itself on the CPU. At 4096 it fits fully.

Any other app holding GPU memory pushes the 9B back onto the CPU. LM Studio and Bionic both load models onto this GPU, so unload their models before using OtaghDB.

First test on one photo: the 9B names an item in 4.5 seconds and found both remotes in a photo of two cats. The 4B takes 2.1 seconds, but it called the cats "kitchen" items and missed the remotes. The 9B stays the default. Decide after timing 10 real photos on each.

## Sponsor prizes

| Prize | Plan | Why |
|---|---|---|
| DigitalOcean, Best Open-Source AI Project | Main target | Four open-weight models doing four different jobs, all local. |
| Solana | Skip | Needs on-chain state or payments, which an inventory app does not need. |
| Steel.dev | Optional stretch | A browser agent looks up resale prices for items you would throw out. Only if it costs nothing. |
| Backboard.io | Skip | Hosted API for paid models. Not needed. |

## Folder layout

```
otaghdb/
  PLAN.md                 this file
  DEMO.md                 the live demo script and what happens underneath
  README.md               for judges
  LICENSE                 MIT
  start.ps1               starts Ollama, the vision service and the app
  db/
    schema.sql            tables, the full-text index and its triggers
  services/
    vision/
      main.py             FastAPI app: cutout, segment, embed
      requirements.txt
      start.ps1           starts the service on port 7000
  src/
    app/                  pages and route handlers (/app/..., /api/..., /images, /staging)
    components/           shared form pieces, photo button, confirm button
    features/
      items/              add one, add many, browse, edit, the place picker
      search/             keyword and look search, "do I own this"
      chat/               ask and act: agent loop, tools, proposals
      lists/              packing lists
      room/               pixel room
      landing/            landing page, copy and object drawings
      furniture/          room page, furniture page, compartments
      closet/             clothes-only closet view
    lib/
      db.ts               SQLite connection and migrations
      ollama.ts           calls to Qwen and the JSON schemas
      vision.ts           calls to the vision service
      vectors.ts          vector similarity and search thresholds
      images.ts           staging, resize, crops, sprites
      places.ts           room, furniture, compartment and container tree, moves
      furniture.ts        furniture templates and compartment suggestions
  skills/
    otaghdb/SKILL.md       stretch: agent skill
  data/                   not in git: otaghdb.sqlite, images/, staging/, backups/
```

## Setup steps

1. Update Ollama to the latest version.
2. Pull the models (about 10 GB, do it on home wifi).

   ```bash
   ollama pull qwen3.5:9b
   ```

   ```bash
   ollama pull qwen3.5:4b
   ```

3. Send the 9B one test photo, then check `ollama ps`.
4. Create the vision service environment and install it. The CPU build of PyTorch is much smaller than the CUDA one.

   ```bash
   py -3.10 -m venv services/vision/.venv
   ```

   ```bash
   services/vision/.venv/Scripts/pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
   ```

   ```bash
   services/vision/.venv/Scripts/pip install -r services/vision/requirements.txt
   ```

5. Start the vision service with `services/vision/start.ps1`. U2-Net, SAM 2.1 and SigLIP 2 download on first start, then load from the cache. The service is ready when `http://localhost:7000/health` returns `"ok": true`.
6. Scaffold the Next.js app, add `better-sqlite3`, `zod` and `sharp`, write `db/schema.sql`.
7. `git init` with the MIT license.

Steps 1 to 5 were done on 2026-10-22 with Ollama 0.40.8, torch 2.14.1 (CPU) and transformers 5.20.2. Measured on two COCO test photos, after the first call warms up:

| Call | Time |
|---|---|
| `/cutout` (U2-Net) | 0.7 s |
| `/segment`, 1 tap point | 3.0 s |
| `/segment`, 3 boxes in one request | 3.2 s |
| `/embed/image` | 0.5 to 0.9 s |
| `/embed/text` | 0.3 s |
| Qwen 9B names one cutout | 4.5 s |
| Qwen 9B detects objects in a full photo | 3.5 s |
| Qwen 9B first load from disk | 14 to 75 s |

- Qwen's `bbox_2d` is on the 0 to 1000 scale. A remote Qwen boxed at [62, 147, 273, 239] converts to pixels [40, 71, 175, 115], and SAM's mask box for it is [41, 74, 175, 117].
- SigLIP ranks "two cats sleeping on a couch" first (0.152) and "a kitchen knife" last (-0.010) against the cat photo. Scores between matching text and an image sit far below 1, so the match threshold must be tuned on real items.
- Every request to the 9B must use `num_ctx` 4096. See [Memory budget](#memory-budget).

## Build order

| Step | Done when | When |
|---|---|---|
| 0. Setup | Qwen names a test photo, the vision service cuts one out. Done 2026-10-22. | Wednesday night |
| 1. Skeleton | Add an item by hand with a photo, see it in a grid by room. Done 2026-10-21. | Wednesday night |
| 2. Add one item with AI | Cutout, tap-to-cut, AI fields, saved. Done 2026-10-22. | Thursday |
| 3. Add many items | Drawer photo becomes reviewed, saved items. Done 2026-10-22. | Thursday |
| 3b. Furniture and closet | Add a desk and a closet from templates, file items into drawers and shelves, swipe through the closet view. Done 2026-10-22. | After step 3 |
| 4. Search by look | Text search by look, "do I own this", duplicate warning. Done 2026-10-22. | Thursday |
| 5. Ask and act | Questions answered, move and edit proposals applied. Done 2026-10-22. | Thursday or Friday morning |
| 6. Packing lists | "Camping for 3 days" gives a grouped checklist. Done 2026-10-22. | Friday morning |
| 7. Pixel room | Sprites on a grid per room, drag to move. Done 2026-10-22. | Friday |
| 8. Demo prep | DEMO.md, README and `start.ps1` done 2026-10-22. Still to do: 30 real items in, repo public, backup video. | Friday by 6 PM |

Stretch goals, in order:

1. **Agent skill.** `skills/otaghdb/SKILL.md` plus a small script so any coding agent can query the inventory. Validated with `skills-ref validate`.
2. **Steel resale price lookup.**

## Demo script

[DEMO.md](DEMO.md) has the full version: the checklist before the demo, what happens underneath each step, measured timings and fallbacks.

1. Photograph a messy desk drawer on the phone. Eight items appear, each cut out and named. Untick one, tap a missed pen, save.
2. Ask "where is my passport?". Answer: "in the black backpack, on the closet shelf, in the bedroom", with both cards.
3. Ask "move everything in the black backpack to the closet shelf". A preview card lists the items. Apply.
4. Ask "I'm going camping for 3 days". A checklist grouped by room, plus "you don't own a sleeping bag".
5. Point the phone at a hoodie and ask "do I already own this?". It shows the match.
6. Open the pixel room.
7. Open the closet view and swipe through the hanging rod. Filter to jackets.
8. Turn wifi off and add one more item. It still works because every model runs on the laptop.

## Risks and fallbacks

| Risk | Fallback |
|---|---|
| qwen3.5:9b spills onto the CPU | Switch to qwen3.5:4b, one config value |
| Broken JSON from the model | JSON schema in `format`, then `zod`, then one retry, then manual entry |
| Qwen's boxes are off or on the wrong scale | The 0 to 1000 scale is confirmed on 1 photo. Validate every box, test the scale on 4 more real photos, tap-to-cut for anything missed. Florence-2 (MIT) is the backup detector. |
| SAM 2.1 small too slow on the CPU | Switch to `hiera-tiny` |
| BiRefNet too slow on the CPU | Happened: 13.7 seconds per photo. Switched to `u2net`, 0.7 seconds. |
| Another app holds GPU memory | Unload models in LM Studio and Bionic before running OtaghDB, then check `ollama ps` shows 100% GPU |
| Tool calls loop or pick the wrong tool | 6-round cap, writes only propose, plain answer if a tool fails |
| SigLIP matches the wrong item | Tune the threshold on real items, always show the score and let you dismiss |
| Bad venue wifi | Everything is local; models pulled at home |
| Phone cannot reach the laptop | Tailscale HTTPS address, or photos already on the laptop |
| Live demo fails | Backup video and a database with 30 items already in it |
| Fonts fail to load offline | `next/font` downloads Google fonts on the first build. Run `pnpm build` at home so the fonts are bundled, and demo with `pnpm start`. |

## Glossary

- **Open-weight model.** A model whose trained weights anyone can download and run. Qwen3.5 is one. Claude and GPT are not.
- **Open-source license.** Lets anyone use, change and share the code or weights. Apache 2.0 and MIT are the two we use. CC BY-NC is not one, because it forbids commercial use.
- **Ollama.** Downloads open models and runs them on your machine behind a local web address.
- **Vision model.** A language model that also accepts images.
- **Parameters (9B, 4B).** Model size in billions of numbers. Bigger usually means smarter and slower.
- **Quantization (Q4, IQ2).** Storing each number with fewer bits so the model fits in less memory. 4-bit keeps most of the quality. 2-bit loses a lot.
- **VRAM.** The GPU's own memory. A model that fits fully in VRAM is fast. One that spills into normal RAM is slow.
- **Context window.** How much text and image the model reads in one request, measured in tokens. Smaller uses less VRAM.
- **Structured output.** Making the model reply in an exact JSON shape so code can read it.
- **Bounding box.** Four numbers marking the rectangle around an object in a photo.
- **Segmentation.** Finding the exact pixels that belong to an object. SAM does this from a tap or a box.
- **Tool calling.** The model replies with "call this function with these arguments" instead of text. Our server runs the function and sends the result back.
- **Embedding (vector).** A list of numbers that represents what an image or text means. Close numbers mean similar things. SigLIP puts images and text in the same space.
- **Full-text search (FTS5).** SQLite's built-in keyword search. Fast, no AI.
- **Background removal.** A model that finds the main object in a photo and makes everything else transparent.
- **Agent skill.** A folder with a `SKILL.md` that teaches an AI agent one task, written to the standard at agentskills.io.
