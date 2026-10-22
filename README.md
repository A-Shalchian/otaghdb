# OtaghDB

Your room as a searchable database. *Otagh* is Persian for room.

OtaghDB started with a move into a new place and too many things to remember where they went. You photograph a thing, or a whole open drawer, as you put it away. Local models cut each object out, name it and file it under a room, a piece of furniture and its compartment, like "bedroom, desk, top drawer". Later you ask "where is my passport?" or "I'm going camping for 3 days" and it answers from your own database.

Every AI step runs on open-weight models on the laptop. No API keys, no cloud, and it keeps working with the wifi off.

## What it does

- **Add one thing.** Take a photo. The background disappears, Qwen fills in the name, category, color and tags, and the form suggests where it goes. If the wrong object was cut out, tap the right one.
- **Add a whole drawer.** One photo of a drawer or shelf. Qwen finds every object and its box, SAM 2.1 cuts them all out in one pass, and you untick mistakes and save the batch.
- **Furniture and a closet.** Add a closet, desk or dresser and it comes with its usual compartments, each knowing what normally goes there. The closet has a clothes-only view: swipe the hanging rod, open stacks on the shelves, filter by type and color.
- **Search by name or by look.** "charger" finds names and tags. "something green and leafy" finds the plants by how they look, using SigLIP 2.
- **Do I already own this?** Point the phone at something in a store and see the closest thing you own, with a similarity score.
- **Ask and act.** A chat that answers from the database and can make changes: move things, retag them, add spots, plan a packing list. Every change shows as a card you approve first.
- **Pixel room.** Each item becomes a 16-color sprite made from its own cutout. Drag them around a pixel-art floor plan of the room.

## Open-weight models

| Job | Model | License | Runs on |
|---|---|---|---|
| Naming, object detection with boxes, chat and tool calls | Qwen3.5 9B through Ollama | Apache 2.0 | GPU |
| Background removal | U2-Net through rembg | Apache 2.0 | CPU |
| Tap-to-cut and box cutouts | SAM 2.1 hiera-small | Apache 2.0 | CPU |
| Search by look, duplicate check | SigLIP 2 base | Apache 2.0 | CPU |

The app is Next.js 16 with SQLite (keyword search with FTS5, vectors stored as blobs). The Python vision service is FastAPI with Hugging Face Transformers.

## Run it

You need Windows with an 8 GB NVIDIA GPU (or change the model to `qwen3.5:4b`), [Ollama](https://ollama.com), Python 3.10, Node 20 or newer, and pnpm.

1. Pull the model:

   ```bash
   ollama pull qwen3.5:9b
   ```

2. Install the vision service. The CPU build of PyTorch is much smaller than the CUDA one.

   ```bash
   py -3.10 -m venv services/vision/.venv
   ```

   ```bash
   services/vision/.venv/Scripts/pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
   ```

   ```bash
   services/vision/.venv/Scripts/pip install -r services/vision/requirements.txt
   ```

3. Install the app:

   ```bash
   pnpm install
   ```

4. Start everything:

   ```powershell
   .\start.ps1
   ```

   The script starts Ollama and the vision service if needed, loads Qwen onto the GPU, checks it fits fully, builds the app once and serves it at http://localhost:3100. Use `.\start.ps1 -Dev` while developing. The first vision service start downloads about 2 GB of models.

Photos and the database live in `data/`, which is not committed, so pictures of your things never leave the laptop.

## More

- [DEMO.md](DEMO.md) is the live demo script, with what happens underneath each step and measured timings.
- [PLAN.md](PLAN.md) is the build plan: why each tool was picked, the data model, the memory budget and the risks.

## License

MIT
