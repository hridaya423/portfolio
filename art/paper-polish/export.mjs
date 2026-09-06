import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const modes = process.argv.slice(2);
if (modes.includes('experience')) {
  for (const variant of ['desktop', 'mobile']) {
    const source = new URL(`masters/experience-${variant}.png`, root);
    const {data, info} = await sharp(source.pathname).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    for (let pixel = 3; pixel < data.length; pixel += 4) {
      if (data[pixel] < 250) data[pixel] = Math.round(data[pixel] * 0.55);
    }
    await sharp(data, {raw:info}).linear([1.35, 1.35, 1.35, 1], [-86, -87.5, -88.7, 0]).webp({quality:98, alphaQuality:100, effort:6}).toFile(new URL(`../../public/materials/experience-${variant}.webp`,root).pathname);
  }
}
for (const variant of modes.filter(mode => mode !== 'experience')) {
  const manifest = JSON.parse(await readFile(new URL('../../public/optical-tray/manifest.json',root),'utf8'));
  const geometry = manifest[variant];
  for (const [index, name] of ['Paper_Work','Paper_Play','Paper_About'].entries()) {
    const rect = geometry.tabs[index];
    const source = new URL(`masters/${variant}/${name}.png`,root);
    const image = await sharp(source.pathname).extract({left:Math.round(rect.x*geometry.width),top:Math.round(rect.y*geometry.height),width:Math.round(rect.width*geometry.width),height:Math.round(rect.height*geometry.height)}).webp({quality:98,alphaQuality:100,effort:6}).toBuffer();
    await writeFile(new URL(`../../public/optical-tray/${variant}-${name}.webp`,root),image);
  }
}
