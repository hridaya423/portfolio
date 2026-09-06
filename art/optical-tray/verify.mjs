import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const publicRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../public/optical-tray');
const manifest = JSON.parse(await readFile(path.join(publicRoot, 'manifest.json'), 'utf8'));
for (const [variant, geometry] of Object.entries(manifest)) {
  const mobile = variant.startsWith('mobile');
  const stageWidth = mobile ? 280 : 504;
  const targets = geometry.tabs.map(rect => ({ left: rect.x * stageWidth, right: (rect.x + rect.width) * stageWidth }));
  for (let index = 0; index < targets.length; index++) {
    const target = targets[index];
    assert(target.right - target.left >= 44, `${variant}: tab too narrow`);
    assert(target.left >= 0 && target.right <= stageWidth, `${variant}: tab outside frame`);
    if (index) assert(target.left > targets[index - 1].right, `${variant}: targets overlap`);
  }
  const layers = ['base', 'lip', 'Paper_Work', 'Paper_Play', 'Paper_About'];
  const sizes = await Promise.all(layers.map(layer => stat(path.join(publicRoot, `${variant}-${layer}.webp`))));
  const bytes = sizes.reduce((total, file) => total + file.size, 0);
  assert(bytes <= (mobile ? 350 : 600) * 1024, `${variant}: artwork exceeds budget`);
  console.log(`${variant}: target spacing and asset budget passed (${Math.round(bytes / 1024)} KB)`);
}
