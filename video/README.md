# OtaghDB demo video

The 83-second narrated demo video, written in code with [Remotion](https://www.remotion.dev). Every name, box, cutout, answer and score on screen is real output from the running app and its local models. The video animates that output; it does not mock it.

## Render

```bash
npm install
npm run render
```

The MP4 lands in `out/otaghdb-demo.mp4`. Rendering takes about 5 minutes on the laptop in the main README. `npm run studio` opens the Remotion editor with a timeline.

To check single frames without a full render:

```bash
node scripts/stills.mjs 60 500 1000
```

## Voice, sound effects and music

The narrator is [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache 2.0), an open-weight text-to-speech model that runs on the CPU. The sound effects and the music bed are synthesized in Python by `audio/sounds.py`, so they need no license. The generated files are committed in `public/audio/`, so a render does not need Python.

To change the narration, edit `src/narration.json` and regenerate the voice. Each line has a scene and the frame in that scene where it starts.

```bash
py -3.10 -m venv audio/.venv
audio/.venv/Scripts/pip install torch==2.14.1 --index-url https://download.pytorch.org/whl/cpu
audio/.venv/Scripts/pip install kokoro==0.9.4 soundfile==0.13.1 scipy==1.15.3
npm run voice
npm run sounds
```

`npm run voice` writes one WAV per line and `src/voice-durations.json`, which the soundtrack uses to lower the music while the narrator speaks. Pass another Kokoro voice name to `audio/narrate.py` to change the narrator (the default is `af_heart`). `npm run render` mixes everything and normalizes the result to -16 LUFS with ffmpeg.

## Where the content comes from

- `captures/` holds the raw responses from the app: the drawer analysis (`/api/scenes/analyze`), two chat answers (`/api/chat`), the photo match (`/api/check`) and the items table.
- `public/drawer/` and `public/data/` hold the photos and cutouts from those same responses.
- `scripts/collect-assets.mjs` copies the cutouts and sprites of the items in the video from `data/images` and exports their rows to `captures/items.json`.
- `src/data.ts` holds the values the scenes animate.

The photos are from the COCO dataset (CC BY 4.0).

Remotion uses its own license: it is free for individuals and companies with up to 3 people. Only this video uses it; the app does not.
