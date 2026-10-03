import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const size = 64;
const pixels = new Uint8Array(size ** 3 * 4);
const hash = (x, y, z, seed) => {
  let n = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647) ^ seed;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};
const wrap = (v, period) => (v + period) % period;
function worley(x, y, z, cells) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  let distance = 3;
  for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const cx = wrap(ix + dx, cells), cy = wrap(iy + dy, cells), cz = wrap(iz + dz, cells);
    const px = ix + dx + hash(cx, cy, cz, 71) - x;
    const py = iy + dy + hash(cx, cy, cz, 239) - y;
    const pz = iz + dz + hash(cx, cy, cz, 997) - z;
    distance = Math.min(distance, px * px + py * py + pz * pz);
  }
  return Math.min(1, Math.sqrt(distance));
}
function value(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const smooth = t => t * t * t * (t * (t * 6 - 15) + 10);
  const sx = smooth(x - ix), sy = smooth(y - iy), sz = smooth(z - iz);
  let result = 0;
  for (let dz = 0; dz <= 1; dz++) for (let dy = 0; dy <= 1; dy++) for (let dx = 0; dx <= 1; dx++) {
    result += hash(wrap(ix + dx, 8), wrap(iy + dy, 8), wrap(iz + dz, 8), 427) *
      (dx ? sx : 1 - sx) * (dy ? sy : 1 - sy) * (dz ? sz : 1 - sz);
  }
  return result;
}
for (let z = 0; z < size; z++) for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
  const i = ((z * size + y) * size + x) * 4;
  pixels[i] = Math.round(value(x / size * 8, y / size * 8, z / size * 8) * 255);
  for (let c = 1; c < 4; c++) {
    const cells = 2 ** (c + 1);
    pixels[i + c] = Math.round(worley(x / size * cells, y / size * cells, z / size * cells, cells) * 255);
  }
}
if (process.argv.includes('--check')) {
  assert.deepEqual(new Uint8Array(readFileSync('public/materials/cloud-noise.bin')), pixels);
  for (const cells of [4, 8, 16]) {
    const sample = worley(.21, .73, .49, cells);
    assert.ok(Math.abs(sample - worley(.21 + cells, .73, .49, cells)) < 1e-12);
    assert.ok(Math.abs(sample - worley(.21, .73 + cells, .49, cells)) < 1e-12);
    assert.ok(Math.abs(sample - worley(.21, .73, .49 + cells, cells)) < 1e-12);
  }
  console.log('Cloud density asset matches its recipe; all Worley bands tile on every axis.');
} else {
  mkdirSync('public/materials', { recursive: true });
  writeFileSync('public/materials/cloud-noise.bin', pixels);
  console.log(`Wrote ${pixels.length} bytes of tileable cloud density fields.`);
}
