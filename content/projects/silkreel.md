---
title: "silk reel"
headline: "silk reel: one command turns a KiCad board into a 12-second film"
summary: "silk reel turns a KiCad .kicad_pcb into a 12-second film of the real copper, parts and silkscreen. A trace render takes about 30 s on an M4 Pro."
kind: "Command-line tool"
platform: "Node 22 or later with ffmpeg, or a web browser"
status: "Open source"
category: "MultimediaApplication"
license: "Apache-2.0"
publishedAt: "2026-08-24"
updatedAt: "2026-11-09"
site: "https://silkreel.hridya.tech"
repo: "https://github.com/hridaya423/silkreel"
image: "/projects/silkreel.jpg"
---

silk reel turns a KiCad `.kicad_pcb` file into a 12-second film. It builds the film from the real copper, parts and silkscreen of the board. silk reel is for hardware makers who have finished a board and need a video for the launch post. You need no animation skills. The same board and flags always give the same film.

![The silk reel site: the line "A circuit board in. A film out." over curved strips of film frames, with the command npm run reel -- board.kicad_pcb.](/projects/silkreel.jpg)

## From S-expressions to a timeline

silk reel does not animate a picture of your board. It reads the board, finds what each part of it is, and compiles a timeline from that data.

1. **Parse.** `parseKicadPcb()` in `packages/ingest` reads the file (KiCad 4 and later). It builds a model of the outline, the copper on each layer, the footprints and the silkscreen. In the browser studio, this step runs in a worker, so the board never leaves your computer.
2. **Pick a hero part.** The default is the IC with the most pads. If that IC is on the back copper, the whole film shows the back side.
3. **Classify nets.** `netKind()` sorts nets by name into ground, power, clock, differential pair, bus and signal. The role of a net decides when it lights after power-on.
4. **Compile.** The trace film is one arc on a grid of 24 beats. It draws the copper (beats 0 to 5.5), places the parts (10 to 13.5) and powers on (16 to 22). Four camera shots cut at beats 10, 15 and 20.
5. **Load real part bodies.** silk reel reads the STEP model paths from the board as KiCad does. It tessellates the models with occt-import-js. A model must cover 75% of the pads of the part. If it does not, the part keeps an estimated body.
6. **Render and encode.** The trace look renders a lit WebGL2 plate on a studio floor, with instanced part meshes, depth of field, bloom and motion blur. Remotion and ffmpeg write the file. They place bundled CC0 sound on score events and master it to -14 LUFS.

Two other looks, `glyph` and `plot`, draw on Canvas2D. Pick a look with `--style trace|glyph|plot`. The output is MP4, GIF, WebM with alpha or ProRes 4444 with alpha.

## What a render costs

A trace render takes about 30 seconds on my Apple M4 Pro and produces a file of about 8 MB. The format sizes below come from `scripts/films.sh`.

| Format, one 11.2 s glyph film, 16:9 | Size |
|---|---|
| MP4 | 2.4 MB |
| GIF (720x405) | 88 KB |
| WebM with alpha | 163 KB |
| ProRes 4444 | 38.6 MB |

## Limits of silk reel

- silk reel reads KiCad 4 and later only. It does not read Gerber, Eagle or Altium files.
- The browser studio previews and records WebM only, and it shows estimated part bodies. Other formats and real STEP models need the CLI. The CLI needs Node 22 or later with `ffmpeg` and `ffprobe` on the path.
- The trace look puts a heavy load on the GPU. Without a GPU, set `SILK_REEL_GL=swangle`. On my machine, high concurrency crashed the renderer.
- In my view on 20 October 2026, the trace look was still weak.
- Tests do not check visual quality. I review the films by eye.

## silk reel compared with the KiCad 3D viewer and Blender

The 3D viewer in KiCad is free and exact. It orbits a board and renders ray-traced stills. It has no authored camera, timeline or sound, so a video needs a screen recording or a script.

A manual Blender pipeline gives more control and a higher limit on quality. You export STEP or VRML from KiCad, then you light, animate and render the scene yourself. Stills from KiCad, cut together in a video editor, also work.

silk reel is better only on effort: one command gives a film that you can post.

## Try silk reel

In the browser, open [silkreel.hridya.tech/studio](https://silkreel.hridya.tech/studio). The tab reads your board file and does not upload it. It records WebM, saves stills and writes the matching CLI command.

Locally, you need Node 22 or later and ffmpeg:

```sh
git clone https://github.com/hridaya423/silkreel && cd silkreel && npm ci
npm run reel -- path/to/your-board.kicad_pcb --title "Your Board" --version v1.0
```

The first render downloads headless Chrome, about 90 MB. Other flags include `--aspect 4:5|1:1|9:16|16:9`, `--format mp4|gif|webm-alpha|prores-alpha` and `--hero U3`.

Source: [github.com/hridaya423/silkreel](https://github.com/hridaya423/silkreel) (Apache-2.0).
