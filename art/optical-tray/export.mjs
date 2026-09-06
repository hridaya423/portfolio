import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const destination = path.resolve(root, '../../public/optical-tray');
const variants = process.argv.slice(2);
await mkdir(destination, { recursive: true });
const manifest = {};
for (const variant of variants) {
  const source = path.join(root, 'masters', variant);
  const geometry = JSON.parse(await readFile(path.join(source, 'geometry.json'), 'utf8'));
  manifest[variant] = geometry;
  let bytes = 0;
  for (const name of ['base', 'lip', 'Paper_Work', 'Paper_Play', 'Paper_About']) {
    let pipeline = sharp(path.join(source, `${name}.png`));
    if (name === 'base') pipeline = pipeline.flatten({ background: '#efeff0' });
    if (name.startsWith('Paper_')) {
      const index = ['Paper_Work', 'Paper_Play', 'Paper_About'].indexOf(name);
      const rect = geometry.tabs[index];
      const left = Math.floor(rect.x * geometry.width) - 2;
      const top = Math.floor(rect.y * geometry.height) - 2;
      const width = Math.ceil(rect.width * geometry.width) + 4;
      const height = Math.ceil(rect.height * geometry.height) + 4;
      pipeline = pipeline.extract({ left, top, width, height });
      geometry.tabs[index] = { x: left / geometry.width, y: top / geometry.height, width: width / geometry.width, height: height / geometry.height, aspect: width / height };
    }
    const buffer = await pipeline.webp({ quality: 96, alphaQuality: 100, effort: 6 }).toBuffer();
    await writeFile(path.join(destination, `${variant}-${name}.webp`), buffer);
    bytes += buffer.length;
  }
  const points = geometry.glassOutline.map(([x, y]) => `${x * geometry.width},${y * geometry.height}`).join(' ');
  await writeFile(path.join(destination, `${variant}-mask.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${geometry.width} ${geometry.height}"><polygon points="${points}" fill="white"/></svg>`);
  console.log(`${variant}: ${(bytes / 1024).toFixed(1)} KB`);
}
const manifestFile = path.join(destination, 'manifest.json');
let existing = {};
try { existing = JSON.parse(await readFile(manifestFile, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
await writeFile(manifestFile, JSON.stringify({ ...existing, ...manifest }, null, 2) + '\n');
