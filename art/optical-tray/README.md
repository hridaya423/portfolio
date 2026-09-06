# Optical tray

The hero uses two Blender render sets, desktop and mobile. Both are light-only, following the updated direction. The glass retains “what if?”; the pencil-loop signature and theme switch are removed.

`build.py` creates the model, materials, lighting, editable lettering, camera, and aligned render layers. `desktop-light.blend` and `mobile-light.blend` contain the editable scenes. `reference.png` is the approved visual reference. PNG originals live in `masters/`.

Run from the repository root:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --factory-startup -b -t 8 --python art/optical-tray/build.py
/Applications/Blender.app/Contents/MacOS/Blender --factory-startup -b -t 8 --python art/optical-tray/build.py -- mobile
node art/optical-tray/export.mjs desktop-light mobile-light
node art/optical-tray/verify.mjs
```

The lettering uses the locally installed Bradley Hand Bold font. The script uses Cycles with 64 samples and denoising. Add `preview` after `--` for a smaller assembled preview; run a full render before exporting.

The exporter bakes the base onto `#efeff0`, matching the page, while preserving transparent tab sprites and the foreground lip. This keeps the clear glass and shadows without carrying noisy alpha data in the base. The exported manifest supplies the tab geometry. Changing the camera requires rerendering and exporting both sets.

Runtime code lives in `src/components/optical-hero/`. HTML anchors own navigation; CSS moves the paper sprites behind the rendered lip. The small WebGL effect samples a rasterized copy of the actual headline font. It waits for the first page paint, runs once, responds to a mouse, and stops when settled. Its semantic text remains available throughout and becomes the visible fallback after any rendering failure.

No Three.js, R3F, GSAP, or new runtime package was added. The theme provider forces light mode. The existing lower-page cards remain; Projects now follows the hero. Credential thumbnails preserve the original artwork at an appropriate delivery size and can be regenerated with `node scripts/optimize-credential-thumbnails.mjs`.

See `qa/verification.md` for browser checks and measured limits. Deployment is outside this change.
