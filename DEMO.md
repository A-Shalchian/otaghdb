# OtaghDB demo guide

This file is the script for showing OtaghDB live: what to start, what to click, what to say, and what is happening underneath. The build plan and design reasons are in [PLAN.md](PLAN.md).

## What runs where

Everything runs on one laptop (RTX 4060 with 8 GB, 16 GB RAM). Nothing calls the internet.

| Part | Runs on | Address | Job |
|---|---|---|---|
| Qwen3.5 9B in Ollama | GPU, 5.6 GB | `localhost:11434` | names items, finds objects and their boxes in a photo, runs the chat and its tools |
| Vision service (Python) | CPU, 2.6 GB RAM | `localhost:7000` | U2-Net cutouts, SAM 2.1 tap-to-cut and box cutouts, SigLIP 2 vectors |
| Next.js app | CPU | `localhost:3100` | pages, server actions, the chat loop, SQLite |
| SQLite file | disk | `data/otaghdb.sqlite` | items, rooms, furniture, lists, keyword index, vectors |

## Before the demo

1. Close LM Studio and Bionic, or unload their models. Any other model on the GPU pushes Qwen partly onto the CPU and every answer gets several times slower.
2. In PowerShell at the repo root, run `.\start.ps1`. It starts Ollama and the vision service if they are not running, loads Qwen onto the GPU, prints `ollama ps`, then starts the app. The `ollama ps` line must say `100% GPU`. If it does not, the script prints a warning.
3. Open `http://localhost:3100/app`.
4. For the phone camera, run `tailscale serve --bg 3100` and open the HTTPS address it prints on the phone. Phone browsers only allow the camera on HTTPS. The upload button works without it.
5. Add one item by hand to warm everything up. The first AI call after loading takes about 15 seconds; later ones take 3 to 5.
6. Have about 30 real items in the database. The fastest way is "Add a whole drawer" on a few drawers and shelves.
7. Copy the database as a backup: `copy data\otaghdb.sqlite data\backups\demo.sqlite`. To restore, stop the app and copy it back.
8. Keep the backup video open in another tab.

## The demo, step by step

### 1. Photograph a messy desk drawer

Click Add, then "Photograph a whole drawer instead". Take the photo on the phone.

On screen, after about 10 seconds the photo shows a numbered box on every object, and below it a card per object with its cutout and a name. Untick one wrong card, tap a pen the AI missed, and it appears as a new card a few seconds later. Pick "desk, top drawer" once for the whole batch and press Save.

Underneath, four things happen.

- The server shrinks the photo to 1280 pixels and sends it to Qwen with a JSON schema. Qwen returns every object with a name, category, color and a box on a 0 to 1000 scale (about 3.5 seconds).
- The server drops broken boxes and boxes covering most of the photo, converts the rest to pixels, and sends all of them to SAM 2.1 in one request. SAM returns one cutout per box (about 3 seconds for a batch).
- A tap sends one point to SAM, then the cutout to Qwen for a name.
- Saving stores each cutout, a crop of the original, a 16-color sprite and a SigLIP vector.

### 2. "Where is my passport?"

Open Ask and type the question, or click the suggestion.

On screen, status lines appear ("Searched for passport"), then a one-sentence answer with the full location and a card for the passport. About 2 to 3 seconds.

Underneath, Qwen calls the `search_items` tool. The server answers from SQLite with keyword search plus SigLIP look matching, and gives back each item with its location chain (container, furniture and compartment, room). Qwen writes the answer and marks each item it mentions as `[[id]]`. The server drops any id that does not exist, so the model cannot point at a made-up item, and turns the rest into cards.

### 3. "Move everything in the backpack to the closet top shelf"

On screen, a card says "Move 3 items (...) to closet, top shelf · bedroom" with an Apply button. Nothing has moved yet. Press Apply.

Underneath, Qwen chains four tools in about 5 seconds: `search_items` to find the backpack, `items_in` for its contents, `list_places` for the shelf id, then `move_items`. Tools that change data only build a proposal. Apply sends it to a server action that checks it again and moves the items in one transaction. Things inside a container always move with it.

### 4. "I'm going camping for 3 days"

On screen, a card says "Make the list Camping, 3 days with N things you own and M you don't". Press Apply, then "Open it". The list page groups what you own by room and furniture, so one walk through the house collects it all, and lists what you would need to buy. Ticks are saved.

Underneath, Qwen calls `plan_packing_list` with a title and the 10 to 20 things the trip needs (about 5 seconds). The server matches each need strictly: every word must appear in a name, tag or note, or the item must clearly look like it to SigLIP. Anything else goes on the missing list, because packing the wrong thing is worse than buying one.

### 5. "Do I already own this?"

Open "Do I own this?" and point the phone at a hoodie or anything else you own.

On screen, the cutout appears, then "Yes, you already own this: ..." with a percentage and where it is.

Underneath, U2-Net cuts the photo out, SigLIP turns it into a vector, and the server compares it with every saved item. Above 85% similarity is very likely the same thing. In testing the same basket scored 90% while other things in the room scored 72 to 74%.

The same check runs when you add an item: the add form warns "You may already own this".

### 6. The closet

Open Closet.

On screen, the hanging rod is a row of clothes on hangers that you swipe through, shelves as stacks you tap to open, shoes in a row on the floor, filters by clothing type, color and "would discard", and an "Elsewhere" row of clothes that live outside this closet.

Underneath, a closet is furniture made from a template. Each compartment knows what usually goes in it, so the add form suggests "closet, hanging rod" for a jacket and shows a gentle note if a cable lands on the rod.

### 7. The pixel room

Open a room, then "pixel room". Press "Arrange" if items are not placed yet.

On screen, the room is a pixel-art floor with each item as its own sprite. Drag one somewhere else; tap one to see its name.

No AI runs here. `sharp` shrinks each cutout to 48 pixels (64 for jewelry), makes the edges hard and cuts it to 16 colors. Positions are saved per item.

### 8. Turn the wifi off

Turn wifi off and add one more item. It still cuts out, gets named and saves, because every model runs on the laptop.

## Numbers measured on this laptop

| Step | Time |
|---|---|
| Cutout with U2-Net | 0.7 s |
| SAM 2.1, one tap | 3 s |
| SAM 2.1, a batch of boxes in one request | 3 s |
| SigLIP vector for an image | 0.5 to 0.9 s |
| SigLIP vector for text | 0.3 s |
| Qwen names one item | 3 to 5 s |
| Qwen finds every object in a photo | 3.5 to 5 s |
| Chat question with one tool call | 2 to 3 s |
| Chat move with four tool calls | 5 s |
| First Qwen call after loading from disk | 14 to 75 s |

## If something goes wrong

| Problem | What to do |
|---|---|
| Answers take 20 seconds or more | Run `ollama ps`. If it does not say `100% GPU`, unload models in LM Studio or Bionic and run `.\start.ps1` again. |
| "The vision service is not running" | Run `services\vision\start.ps1` and wait until `http://localhost:7000/health` shows `"ok": true`. Adding still works without it, but without cutouts. |
| "Ollama is not running" | Open the Ollama app. The add form still saves; fill the name yourself. |
| The AI cut out the wrong thing | Press "Wrong thing? Tap it on the photo" and tap the right object. |
| A drawer photo misses something | Tap it on the photo. |
| The chat misunderstands | Proposals change nothing until Apply. Press Dismiss and rephrase. |
| Phone cannot reach the laptop | Use the upload button with photos already on the laptop. |
| The live demo fails | Play the backup video, or restore `data\backups\demo.sqlite`. |
