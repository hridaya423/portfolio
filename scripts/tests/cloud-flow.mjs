import assert from 'node:assert/strict';
import { CloudFlow } from '../../src/components/portfolio/cloud-flow.ts';

const flow = new CloudFlow();
const resting = flow.pixels.slice();
flow.step(1 / 60);
assert.deepEqual(flow.pixels, resting, 'Resting volume must not invent motion');
flow.stir(-.2, 0, .2, 0);
for (let i = 0; i < 30; i++) flow.step(1 / 60);
const afterGesture = flow.pixels.slice();
assert.ok(afterGesture.some((value, index) => index % 4 < 3 && Math.abs(value) > .01), 'Pointer motion must transport vapor');
const depthEnergy = z => {
  let total = 0;
  for (let i = z * flow.width * flow.height * 4; i < (z + 1) * flow.width * flow.height * 4; i++) if (i % 4 < 3) total += Math.abs(flow.pixels[i]);
  return total;
};
assert.ok(depthEnergy(10) > depthEnergy(3) * 2, 'Hover must be local in depth, rather than a flat screen distortion');
for (let i = 0; i < 30; i++) flow.step(1 / 60);
assert.ok(flow.pixels.some((value, index) => index % 4 < 3 && Math.abs(value - afterGesture[index]) > .001), 'Vapor must continue moving after the pointer stops');
const energy = () => flow.pixels.reduce((sum, value, index) => sum + (index % 4 < 3 ? value * value : 0), 0);
for (let i = 0; i < 300; i++) flow.step(1 / 60);
const peak = energy();
const recoverySteps = process.argv.includes('--long') ? 7200 : 600;
for (let i = 0; i < recoverySteps; i++) flow.step(1 / 60);
assert.ok(flow.pixels.every(Number.isFinite), 'Recovery must remain finite');
assert.ok(energy() < peak, 'Transport and mixing must dissipate the disturbance');
if (process.argv.includes('--long')) assert.ok(energy() < peak * .15, 'The volume must recover over two minutes');
flow.clear();
assert.deepEqual(flow.pixels, resting, 'Reset must restore an undisturbed volume');
console.log('3D cloud flow: rest, localized hover, transported vapor, persistence, mixing and reset passed.');

for (let stroke = 0; stroke < 8; stroke++) {
  flow.stir(stroke % 2 ? .2 : -.2, 0, stroke % 2 ? -.2 : .2, 0);
  for (let frame = 0; frame < 20; frame++) flow.step(1 / 60);
}
let hoverMaximum = 0;
for (let i = 0; i < flow.pixels.length; i += 4) hoverMaximum = Math.max(hoverMaximum, Math.hypot(flow.pixels[i], flow.pixels[i + 1], flow.pixels[i + 2]));
assert.ok(hoverMaximum < .18, 'Repeated hover strokes must remain subtle');
console.log('Repeated hover displacement:', hoverMaximum.toFixed(3));

const shallow = new CloudFlow();
const deep = new CloudFlow();
shallow.stir(-.2, 0, .2, 0, .12);
deep.stir(-.2, 0, .2, 0);
for (let frame = 0; frame < 30; frame++) {
  shallow.step(1 / 60);
  deep.step(1 / 60);
}
const frontLayerEnergy = volume => {
  let sum = 0;
  const start = 9 * volume.width * volume.height * 4;
  for (let i = start; i < start + volume.width * volume.height * 4; i += 4) sum += Math.abs(volume.pixels[i]);
  return sum;
};
assert.ok(frontLayerEnergy(shallow) > frontLayerEnergy(deep) * 1.3, 'Shallow cloud letters must receive the gesture at their own surface depth');
