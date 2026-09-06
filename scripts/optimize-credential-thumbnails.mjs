import sharp from "sharp";
import { mkdir } from "node:fs/promises";

await mkdir("public/credential-thumbnails", { recursive: true });
for (const name of [
  "az-900",
  "dp-900",
  "ai-900",
  "sc-900",
  "pl-900",
  "pl-100",
  "pega",
  "e",
  "g-found",
]) {
  await sharp(`public/${name}.png`)
    .resize(144, 144, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(`public/credential-thumbnails/${name}.webp`);
}
