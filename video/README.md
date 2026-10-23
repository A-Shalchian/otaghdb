# OtaghDB demo video

The 83-second demo video, written in code with [Remotion](https://www.remotion.dev). Every name, box, cutout, answer and score on screen is real output from the running app and its local models. The video animates that output; it does not mock it.

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

## Where the content comes from

- `captures/` holds the raw responses from the app: the drawer analysis (`/api/scenes/analyze`), two chat answers (`/api/chat`), the photo match (`/api/check`) and the items table.
- `public/drawer/` and `public/data/` hold the photos and cutouts from those same responses.
- `scripts/collect-assets.mjs` copies the cutouts and sprites of the items in the video from `data/images` and exports their rows to `captures/items.json`.
- `src/data.ts` holds the values the scenes animate.

The photos are from the COCO dataset (CC BY 4.0).

Remotion uses its own license: it is free for individuals and companies with up to 3 people. Only this video uses it; the app does not.
