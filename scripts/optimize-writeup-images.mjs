import sharp from "sharp";
import { stat } from "node:fs/promises";

// Write-ups show images in a 700px column, so 1600px covers a 2x screen.
const MAX_WIDTH = 1600;

for (const file of [
  "public/foundry-hero.png",
  "public/cue-site.png",
  "public/revise-project.jpg",
  "public/projects/silkreel.jpg",
  "public/projects/perry.jpg",
  "public/projects/perry/hero.jpg",
  "public/projects/cue/demo.gif",
]) {
  const animated = file.endsWith(".gif");
  const target = file.replace(/\.[^.]+$/, ".webp");
  const image = sharp(file, { animated, limitInputPixels: !animated });
  if (!animated) image.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  await image.webp({ quality: 80, effort: 6 }).toFile(target);
  const [before, after] = await Promise.all([stat(file), stat(target)]);
  console.log(`${target}: ${Math.round(before.size / 1024)} KB -> ${Math.round(after.size / 1024)} KB`);
}
