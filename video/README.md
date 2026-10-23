# OtaghDB demo video

The 85-second narrated demo video, written in code with [Remotion](https://www.remotion.dev). After the opening, every name, box, cutout, answer and score on screen is real output from the running app and its local models. The video animates that output; it does not mock it.

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

`npm run voice` writes one WAV per line and `src/voice-durations.json`, which the soundtrack uses to lower the music while the narrator speaks. To redo only some lines, pass the voice and the line ids, like `npm run voice -- af_heart hook-2`. Pass another Kokoro voice name to `audio/narrate.py` to change the narrator (the default is `af_heart`). `npm run render` mixes everything and normalizes the result to -16 LUFS with ffmpeg.

## Where the content comes from

- `captures/` holds the raw responses from the app: the drawer analysis (`/api/scenes/analyze`), two chat answers (`/api/chat`), the photo match (`/api/check`) and the items table.
- `public/drawer/` and `public/data/` hold the photos and cutouts from those same responses.
- `scripts/collect-assets.mjs` copies the cutouts and sprites of the items in the video from `data/images` and exports their rows to `captures/items.json`.
- `src/data.ts` holds the values the scenes animate.

The room and item photos are from the COCO dataset (CC BY 4.0).

The six things in the opening are photos from Wikimedia Commons, cut out by the app's vision service (U2-Net, or SAM 2.1 for the headphones). They are in `public/hook/`.

| File | Photo | Author | License |
|---|---|---|---|
| `keys.png` | [1970s SAAB car key](https://commons.wikimedia.org/wiki/File:1970s_SAAB_car_key_manufactured_by_the_Swedish_lock_company_Assa.jpg) | R. Henrik Nilsson | CC BY 4.0 |
| `charger.png` | [Pisen MF-08EU USB charger](https://commons.wikimedia.org/wiki/File:Pisen_MF-08EU_12W_USB_charger-0.jpg) | Imgrenb | CC0 |
| `headphones.png` | [Black brown headphones](https://commons.wikimedia.org/wiki/File:Black_brown_headphones_wired.jpg) | Marcus-richardson | CC BY 4.0 |
| `wallet.png` | [Slim wallet](https://commons.wikimedia.org/wiki/File:Flap_Boy_Slim_Wallet_from_JAIMIE_JACOBS_03.jpg) | www.kartenetui.info | CC BY 4.0 |
| `sunglasses.png` | [Aviator sunglasses](https://commons.wikimedia.org/wiki/File:RayBanAviator.jpg) | Rich Niewiroski Jr. | CC BY 2.5 |
| `passport.png` | [US passport cover](https://commons.wikimedia.org/wiki/File:Us-passport.jpg) | Robert Rexach | Public domain |

Remotion uses its own license: it is free for individuals and companies with up to 3 people. Only this video uses it; the app does not.
