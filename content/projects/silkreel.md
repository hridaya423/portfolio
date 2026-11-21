---
title: "silk reel"
headline: "silk reel: one command turns a KiCad board into a 12-second launch film"
summary: "Drop in a KiCad .kicad_pcb file and render a deterministic 12-second launch film built straight from the board's real copper, parts and silkscreen."
kind: "Command-line tool"
platform: "Node 22 or later with ffmpeg, or a web browser"
status: "Open source"
category: "MultimediaApplication"
license: "Apache-2.0"
publishedAt: "2026-08-24"
updatedAt: "2026-11-21"
site: "https://silkreel.hridya.tech"
repo: "https://github.com/hridaya423/silkreel"
image: "/projects/silkreel.jpg"
---

Give silk reel a KiCad `.kicad_pcb` file and it renders a 12-second video built straight from the board's actual copper, components and silkscreen. Same file and flags, identical render every time, without having to open Blender or animate a single keyframe.

![The silk reel site: "A circuit board in. A film out." over curved film strips, alongside the CLI command npm run reel -- board.kicad_pcb.](/projects/silkreel.jpg)

## From a `.kicad_pcb` file to a 24-beat timeline

Instead of panning across an exported PNG, silk reel parses the board itself and compiles a timed shot list from its geometry.

First, `parseKicadPcb()` in `packages/ingest` reads the S-expressions (KiCad 4 and newer) into a model of the outline, copper layers, footprints and silkscreen. In the browser studio this runs inside a Web Worker so your board file never leaves your laptop. Next, silk reel picks a hero component—by default the IC with the most pads—and if that chip sits on the back copper, the whole film flips to showcase the back of the board.

From there, `netKind()` sorts nets by name into ground, power, clock, differential pair, bus and signal, which decides the order traces light up when power comes on. The `trace` look lays everything onto a 24-beat timeline: copper draws in from beats 0 to 5.5, parts drop onto their pads from 10 to 13.5, and power ripples through the nets from 16 to 22, with four camera cuts at beats 10, 15 and 20.

For 3D component bodies, silk reel resolves the STEP paths embedded in the file just as KiCad does and tessellates them with `occt-import-js`. To avoid floating or mis-scaled parts, a STEP mesh has to cover at least 75% of the footprint's pads; anything that misses falls back to an estimated body. Finally, the `trace` style renders a lit WebGL2 scene on a studio floor with instanced part meshes, depth of field, bloom and motion blur. Remotion and `ffmpeg` encode the output, placing bundled CC0 sound effects on beat markers and mastering the audio to -14 LUFS.

If you want something flatter and quicker, two Canvas2D styles (`glyph` and `plot`) are available via `--style trace|glyph|plot`, exporting to MP4, GIF, WebM with alpha, or ProRes 4444 with alpha.

## Render times and sizes

On my Apple M4 Pro, a `trace` render takes about 30 seconds and lands near 8 MB. The lighter `glyph` style produces much smaller files (measured on an 11.2-second 16:9 film from `scripts/films.sh`):

| Format (11.2 s `glyph`, 16:9) | File size |
|---|---|
| MP4 | 2.4 MB |
| GIF (720×405) | 88 KB |
| WebM with alpha | 163 KB |
| ProRes 4444 | 38.6 MB |

## What's still rough

silk reel only parses KiCad 4 and later, so Gerber, Eagle and Altium boards are out. In the browser studio you only get WebM previews with estimated part bodies; real STEP meshes and MP4, GIF or ProRes exports need the CLI along with Node 22+, `ffmpeg` and `ffprobe`.

The WebGL2 `trace` style hits the GPU fairly hard, and turning concurrency up crashed the renderer on my machine (if you're rendering without a GPU, set `SILK_REEL_GL=swangle`). Visually, I'm still not completely happy with the `trace` look yet, and because automated tests can't check taste, I still inspect renders by eye.

KiCad's own 3D viewer is free, exact, and great for ray-traced stills, though making a video means scripting or screen-recording orbits. A hand-lit Blender scene exported from KiCad will always have a higher visual ceiling if you're willing to spend an afternoon on it. silk reel is strictly for the moment you want one command that gives you a clip ready to post.

## Try it

Open [silkreel.hridya.tech/studio](https://silkreel.hridya.tech/studio) to test a board in your browser without uploading anything; it records WebM, saves stills, and prints the matching CLI command.

Locally (Node 22+ and `ffmpeg`):

```sh
git clone https://github.com/hridaya423/silkreel && cd silkreel && npm ci
npm run reel -- path/to/your-board.kicad_pcb --title "Your Board" --version v1.0
```

The first run downloads headless Chrome (~90 MB). Extra flags include `--aspect 4:5|1:1|9:16|16:9`, `--format mp4|gif|webm-alpha|prores-alpha`, and `--hero U3`.

Source: [github.com/hridaya423/silkreel](https://github.com/hridaya423/silkreel) (Apache-2.0).
