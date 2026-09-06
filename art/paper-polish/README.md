# Paper assets

Blender 5 scenes for the portfolio’s paper tabs and approved Experience concept 2. Experience uses layered cotton stock, a metal staple and a soft contact shadow. The tab scenes preserve the original tray camera and replace only the three paper sprites.

Rebuild with Blender in background mode, passing `--python art/paper-polish/build.py -- experience` or `-- experience mobile`. For tabs, use `-- tabs` or `-- tabs mobile`. Add `preview` for a faster render.

Run `node art/paper-polish/export.mjs experience desktop-light mobile-light` to export the WebP assets. Tab crops use the existing optical-tray manifest; the base and glass assets stay in their original scene.

The website keeps text and links in HTML. Desktop and mobile renders provide the stationery surface without a WebGL runtime.

The September 6 reference pass matches the supplied 1490 × 1055 concept: a divider at 25% width, first paper at roughly (440, 60), a second sheet offset 20px, and separate card heights of approximately 410px and 350px. HTML supplies the typography and coral underline. The render supplies four paper layers, steel staples, punctures and contact shadows; export reduces the transparent shadow density while preserving opaque paper.

Tab exports hide the glass and its lettering before isolating paper. Leaving those objects in the light paths creates an unwanted dark mark on the Events sprite.

`capture.mjs` uses a local headless Chromium debugging endpoint on port 9337 to capture the live site at a specified width and assert that the page does not overflow horizontally. The comparison and mobile screenshots are saved beside the Blender scenes.
