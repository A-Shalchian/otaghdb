<h1 align="center">OtaghDB</h1>

<p align="center">
  <b>Your room as a searchable database.</b><br>
  Photograph your things as you put them away. Ask where they are later.<br>
  Every AI step runs on open-weight models on your own laptop.
</p>

<p align="center">
  <img src="docs/demo.gif" width="800" alt="A bedroom photo goes in. Qwen3.5 draws a box around each of eight objects, and SAM 2.1 cuts them all out into item cards.">
</p>

<table align="center">
  <tr>
    <td align="center" width="150"><img src="docs/logos/qwen.svg" width="40" height="40" alt="Qwen"><br><b>Qwen3.5 9B</b><br><sub>names, boxes, chat</sub></td>
    <td align="center" width="150"><img src="docs/logos/meta.svg" width="40" height="40" alt="Meta"><br><b>SAM 2.1</b><br><sub>cutouts</sub></td>
    <td align="center" width="150"><img src="docs/logos/google.svg" width="40" height="40" alt="Google"><br><b>SigLIP 2</b><br><sub>search by look</sub></td>
    <td align="center" width="150"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/logos/ollama-dark.svg"><img src="docs/logos/ollama.svg" width="40" height="40" alt="Ollama"></picture><br><b>Ollama</b><br><sub>runs Qwen on the GPU</sub></td>
    <td align="center" width="150"><img src="docs/logos/huggingface.svg" width="40" height="40" alt="Hugging Face"><br><b>Transformers</b><br><sub>runs SAM and SigLIP</sub></td>
  </tr>
  <tr>
    <td align="center" width="150"><img src="docs/logos/pytorch.svg" width="40" height="40" alt="PyTorch"><br><b>PyTorch</b><br><sub>vision on the CPU</sub></td>
    <td align="center" width="150"><img src="docs/logos/fastapi.svg" width="40" height="40" alt="FastAPI"><br><b>FastAPI</b><br><sub>vision service</sub></td>
    <td align="center" width="150"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/logos/nextjs-dark.svg"><img src="docs/logos/nextjs.svg" width="40" height="40" alt="Next.js"></picture><br><b>Next.js 16</b><br><sub>the app</sub></td>
    <td align="center" width="150"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/logos/sqlite-dark.svg"><img src="docs/logos/sqlite.svg" width="40" height="40" alt="SQLite"></picture><br><b>SQLite</b><br><sub>items and search</sub></td>
    <td align="center" width="150"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/logos/tailscale-dark.svg"><img src="docs/logos/tailscale.svg" width="40" height="40" alt="Tailscale"></picture><br><b>Tailscale</b><br><sub>phone camera link</sub></td>
  </tr>
</table>

<p align="center">
  <a href="#what-it-does">What it does</a> · <a href="#how-it-works">How it works</a> · <a href="#run-it">Run it</a> · <a href="LICENSE">MIT license</a>
</p>

*Otagh* is Persian for room. OtaghDB started with a move into a new place and too many things to remember where they went. You photograph a thing, or a whole open drawer, as you put it away. Local models cut each object out, name it and file it under a room, a piece of furniture and its compartment, like "bedroom, desk, top drawer". Later you ask "where is my passport?" or "I'm going camping for 3 days" and it answers from your own database.

There are no API keys and no cloud calls, and it keeps working with the wifi off. Photos of your things never leave the laptop.

## What it does

- **Add one thing from a photo.** U2-Net removes the background, and Qwen fills in the name, category, color, tags and a short description. You pick the room, and the form suggests the furniture and compartment inside it. If the wrong object was cut out, tap the right one and SAM 2.1 cuts that one instead. The form also warns you when you may already own the thing.
- **Add a whole drawer from one photo.** Qwen finds every object and draws a box around it, and SAM 2.1 cuts them all out in one request. Untick mistakes, tap anything it missed, and save the batch.
- **Furniture with compartments.** A closet, desk, dresser, nightstand, bathroom cabinet, kitchen cabinet or bookshelf comes with its usual compartments. Each compartment knows what normally goes there and warns when something unusual lands in it. Things can also hold other things, like a pouch inside a backpack, and the contents move with their container.
- **A closet view for clothes.** The hanging rod scrolls sideways, folded clothes sit in stacks you tap to open, and filters narrow it down by type, color and what you might give away.
- **Search by name or by look.** "charger" matches names, tags, colors and notes. "something green and leafy" finds the plants through SigLIP 2 image vectors, even when no name matches.
- **Do I already own this?** Point the phone at something in a store. The app shows the closest things you own, each with a similarity score and where it is.
- **Ask and act.** A chat answers from your database and can change it: move things, retag them, add a spot or a compartment, and plan a packing list. Every change shows as a card first, and nothing is saved until you press Apply.
- **Packing lists.** A list groups what you own by room so you can check things off as you pack, and lists the rest as things to buy.

## Coming next

**Pixel room.** Each item already gets a 16-color sprite made from its own cutout. You can drag the sprites around a grid of the room, and their positions save. For now every room gets the same plain grid. Next, the grid becomes a real floor plan with the furniture drawn in.

## How it works

### The models

Four open-weight models each do one job. None of them calls the internet.

| Model | Made by | License | What it does in OtaghDB |
|---|---|---|---|
| Qwen3.5 9B | Alibaba Qwen team | Apache 2.0 | The language model, and the only one that understands what things are. It reads a cutout and writes the name, category, color, tags and a short description. In a drawer photo it lists every object and draws a box around each one. It runs the chat: it picks which tool to call, then writes the answer. It sees images itself, so no separate vision model is needed. |
| U2-Net | Xuebin Qin et al. | Apache 2.0 | Removes the background when you add one thing. It finds the most prominent object in the photo and drops everything else. It does not know what the object is. |
| SAM 2.1 hiera-small | Meta | Apache 2.0 | Cuts out exactly the object it is pointed at. It never chooses on its own. It needs a point or a box. A tap sends a point when U2-Net cut out the wrong thing. In a drawer photo, Qwen's boxes go to SAM, which cuts all of them out in one pass. |
| SigLIP 2 base | Google | Apache 2.0 | Turns a photo or a sentence into a vector, a list of numbers, in the same space. Photos and words can then be compared directly. This is how "something green and leafy" finds the plants, how the add form warns "you may already own this", and how the "Do I own this?" check scores matches. |

### What runs the models

| Tool | License | What it does |
|---|---|---|
| [Ollama](https://ollama.com), built on llama.cpp | MIT | Runs Qwen on the GPU at `localhost:11434`. |
| [Hugging Face Transformers](https://github.com/huggingface/transformers) | Apache 2.0 | Downloads SAM 2.1 and SigLIP 2 from the Hugging Face hub and runs them. |
| [PyTorch](https://pytorch.org), CPU build | BSD-3 | The math under Transformers. It runs on the CPU so the GPU stays free for Qwen. |
| [rembg](https://github.com/danielgatis/rembg) and ONNX Runtime | MIT | rembg wraps U2-Net, and ONNX Runtime runs it. |
| [FastAPI](https://fastapi.tiangolo.com) and Uvicorn | MIT, BSD-3 | Put U2-Net, SAM 2.1 and SigLIP 2 behind one local HTTP service at `localhost:7000`, the vision service in `services/vision`. |

### Why Qwen gets a 4096-token context

A token is about three quarters of a word, and a 1280-pixel photo costs about 1,200 tokens. The context is everything Qwen holds for one request: the instructions, the tool descriptions, the chat so far, the photo and its own answer. Qwen3.5 can take 262,144 tokens, but the memory for that context grows with its size. The test laptop's RTX 4060 has 8 GB of its own memory. At 4096 tokens, the model and its context take 5.6 GB, so all of it stays on the GPU and an answer takes 2 to 5 seconds. A larger context pushes part of the model into normal memory, and every answer gets several times slower. Every request sends the same context size, because Ollama reloads the model when it changes.

### The app

| Tool | License | What it does |
|---|---|---|
| [Next.js 16](https://nextjs.org) and React 19 | MIT | The pages, the forms that save things, the API routes the phone and the chat call, and the chat's tool loop. |
| [SQLite](https://sqlite.org) through better-sqlite3 | Public domain, MIT | The whole database in one file, `data/otaghdb.sqlite`: rooms, furniture, compartments, items, lists, and each item's SigLIP vector. |
| SQLite FTS5 | Public domain | Keyword search over names, colors, tags, descriptions and notes. |
| [sharp](https://sharp.pixelplumbing.com) | Apache 2.0 | All image work in Node: shrinking photos (1024 pixels for one thing; 1280 pixels for Qwen and 2048 pixels for SAM in a drawer), cropping originals, making the 16-color sprites, and checking that a cutout is not empty. |
| [Zod](https://zod.dev) | MIT | Checks every form and every JSON answer from Qwen before anything is saved. |
| Tailwind CSS | MIT | Styling. |
| node-qrcode | MIT | The QR code on the Phone page. |
| [Tailscale](https://tailscale.com) client | BSD-3 | Gives the laptop a private HTTPS address so a phone's live camera works. Only devices signed in to your tailnet can open it. |

### One photo, start to finish

1. sharp shrinks the photo to 1024 pixels.
2. U2-Net cuts out the main object. If the cutout is almost empty, the app keeps the photo and asks you to tap the thing instead, and SAM 2.1 cuts out what you tapped.
3. Qwen reads the cutout and fills in the name, category, color and tags. Zod checks its answer.
4. SigLIP 2 turns the cutout into a vector. The app compares it with every saved item and warns if you may already own it.
5. On save, SQLite stores the item and its vector. The cutout, a crop of the original and a 16-color sprite go to `data/images`.

When you later ask "where is my passport?", Qwen calls the search tool. The app searches SQLite by keyword and by SigLIP vector, then gives Qwen each match with its room, furniture and compartment. Qwen marks each item it mentions with its id, and the server drops any id that does not exist, so the chat cannot point at something you do not own. Tools that change things (move, retag, add a spot, plan a packing list) only build a proposal. Nothing is saved until you press Apply, and the server checks the proposal again first.

Measured on a laptop with an RTX 4060 (8 GB of VRAM):

| Step | Time |
|---|---|
| Add one thing: cutout and name | 7 s |
| Find and cut out 8 objects in one drawer photo | 18 to 22 s |
| Search by name | under 1 s |
| "Do I own this?" check | 1.4 to 2 s |
| Chat move that chains 4 tool calls | 2.7 s |
| Chat packing list for a camping trip | 5.5 s |

[DEMO.md](DEMO.md) has the full demo script with what runs underneath each step.

## Run it

Everything runs on one computer. You need about 8 GB of GPU memory for Qwen, or an Apple Silicon Mac with 16 GB of memory. With less, set `OTAGHDB_MODEL=qwen3.5:4b` and pull that model instead.

The first start of the vision service downloads about 2 GB of models. After that the app works offline.

### Windows

You need Windows 11 with an NVIDIA GPU, [Ollama](https://ollama.com), Python 3.10, Node.js 20.9 or newer, and pnpm.

1. Pull the model:

   ```powershell
   ollama pull qwen3.5:9b
   ```

2. Install the vision service. The CPU build of PyTorch is much smaller than the CUDA one.

   ```powershell
   py -3.10 -m venv services/vision/.venv
   services/vision/.venv/Scripts/pip install torch==2.14.1 torchvision==0.29.1 --index-url https://download.pytorch.org/whl/cpu
   services/vision/.venv/Scripts/pip install -r services/vision/requirements.txt
   ```

3. Install the app and start everything:

   ```powershell
   pnpm install
   .\start.ps1
   ```

`start.ps1` starts Ollama and the vision service if they are not running, loads Qwen onto the GPU and checks that it fits fully. It then builds the app when the code changed and serves it at http://localhost:3100. Use `.\start.ps1 -Dev` while developing.

### macOS

You need an Apple Silicon Mac and [Homebrew](https://brew.sh).

1. Install the tools, start Ollama and pull the model:

   ```bash
   brew install ollama python@3.12 node pnpm
   brew services start ollama
   ollama pull qwen3.5:9b
   ```

2. Install the vision service:

   ```bash
   python3.12 -m venv services/vision/.venv
   services/vision/.venv/bin/pip install torch==2.14.1 torchvision==0.29.1
   services/vision/.venv/bin/pip install -r services/vision/requirements.txt
   ```

3. Install the app and start everything:

   ```bash
   pnpm install
   ./start.sh
   ```

### Linux

You need an x86_64 machine with an NVIDIA GPU and its driver, Python 3.10, 3.11 or 3.12 with the `venv` module, Node.js 20.9 or newer, and pnpm (`npm install -g pnpm`).

1. Install Ollama and pull the model:

   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ollama pull qwen3.5:9b
   ```

2. Install the vision service. The CPU build of PyTorch is much smaller than the CUDA one.

   ```bash
   python3 -m venv services/vision/.venv
   services/vision/.venv/bin/pip install torch==2.14.1 torchvision==0.29.1 --index-url https://download.pytorch.org/whl/cpu
   services/vision/.venv/bin/pip install -r services/vision/requirements.txt
   ```

3. Install the app and start everything:

   ```bash
   pnpm install
   ./start.sh
   ```

`start.sh` does the same as `start.ps1`. It runs Ollama and the vision service in the background if they are not running, and writes their logs to `data/ollama.log` and `data/vision.log`. Ctrl+C stops the app and the services the script started. Use `./start.sh --dev` while developing.

We built and tested OtaghDB on Windows 11. The Mac and Linux steps install the same package versions, and every Python package has a prebuilt wheel for Apple Silicon and Linux x86_64. We have not yet run the whole app on a Mac or Linux machine.

### Phone camera

To take photos with a phone, install [Tailscale](https://tailscale.com/download) on the computer and the phone, and sign both in to the same tailnet. The start script then shares the app at a private HTTPS address, and the Phone page in the app shows it as a QR code. The live camera needs that HTTPS address. On plain wifi, the Camera button opens the phone's camera app instead.

On a Mac, the app needs the `tailscale` command on the PATH. Install the Standalone Tailscale app from the download page and turn on CLI integration in its settings. The Mac App Store version does not add the command.

### Settings

| Variable | Default | What it changes |
|---|---|---|
| `OTAGHDB_MODEL` | `qwen3.5:9b` | The Ollama model for naming, boxes and chat |
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Where the app finds Ollama |
| `VISION_URL` | `http://127.0.0.1:7000` | Where the app finds the vision service |

Photos and the database live in `data/`, which is not committed, so pictures of your things stay on your computer.

## More

- [DEMO.md](DEMO.md) is the live demo script, with what happens underneath each step and measured timings.
- [PLAN.md](PLAN.md) is the build plan: why each tool was picked, the data model, the memory budget and the risks.
- [video/](video/README.md) is the demo video, written in code with Remotion. It animates real output from the app and its models, with a Kokoro voiceover.

## License

OtaghDB is under the [MIT license](LICENSE). The four models are under Apache 2.0. The logos above belong to their owners.
