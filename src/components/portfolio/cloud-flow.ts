const WIDTH = 64;
const HEIGHT = 24;
const DEPTH = 16;
const LAYER = WIDTH * HEIGHT;
const SIZE = LAYER * DEPTH;
const NEIGHBORS = [1, WIDTH, LAYER];
const SCALE = WIDTH / 6.8;
const Z_SCALE = DEPTH / 1.6;
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

export class CloudFlow {
  readonly width = WIDTH;
  readonly height = HEIGHT;
  readonly depth = DEPTH;
  readonly pixels = new Float32Array(SIZE * 4);
  private material = new Float32Array(SIZE * 4);
  private velocity = new Float32Array(SIZE * 3);
  private nextVelocity = new Float32Array(SIZE * 3);
  private pressure = new Float32Array(SIZE);
  private nextPressure = new Float32Array(SIZE);
  private divergence = new Float32Array(SIZE);

  clear() {
    for (const field of [this.pixels, this.material, this.velocity, this.nextVelocity, this.pressure, this.nextPressure, this.divergence]) field.fill(0);
  }

  stir(fromX: number, fromY: number, toX: number, toY: number, depth = .3) {
    const dx = toX - fromX, dy = toY - fromY, dz = 0;
    const distance = Math.hypot(dx, dy, dz);
    if (distance < .0001) return;
    const samples = Math.max(1, Math.ceil(distance * SCALE));
    const strength = Math.min(distance * .8, 2) / samples;
    const radius = .22;
    for (let sample = 0; sample < samples; sample++) {
      const t = (sample + .5) / samples;
      const cx = fromX + dx * t, cy = fromY + dy * t, cz = depth;
      const left = clamp(Math.floor((cx - radius + 3.4) * SCALE), 1, WIDTH - 2);
      const right = clamp(Math.ceil((cx + radius + 3.4) * SCALE), 1, WIDTH - 2);
      const bottom = clamp(Math.floor((cy - radius + 1.275) * SCALE), 1, HEIGHT - 2);
      const top = clamp(Math.ceil((cy + radius + 1.275) * SCALE), 1, HEIGHT - 2);
      for (let z = 1; z < DEPTH - 1; z++) for (let y = bottom; y <= top; y++) for (let x = left; x <= right; x++) {
        const i = (z * LAYER + y * WIDTH + x) * 3;
        const ox = (x + .5) / SCALE - 3.4 - cx;
        const oy = (y + .5) / SCALE - 1.275 - cy;
        const oz = (z + .5) / Z_SCALE - .8 - cz;
        const weight = Math.exp(-(ox * ox + oy * oy + oz * oz) / .014) * strength * 18;
        this.velocity[i] += dx / distance * weight;
        this.velocity[i + 1] += dy / distance * weight;
        this.velocity[i + 2] -= weight * .3;
      }
    }
  }

  private sample(field: Float32Array, x: number, y: number, z: number, stride: number, channel: number) {
    x = clamp(x, 0, WIDTH - 1.001);
    y = clamp(y, 0, HEIGHT - 1.001);
    z = clamp(z, 0, DEPTH - 1.001);
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    const fx = x - ix, fy = y - iy, fz = z - iz;
    const i = (iz * LAYER + iy * WIDTH + ix) * stride + channel;
    const row = WIDTH * stride, layer = LAYER * stride;
    const front = (field[i] * (1 - fx) + field[i + stride] * fx) * (1 - fy) + (field[i + row] * (1 - fx) + field[i + row + stride] * fx) * fy;
    const back = (field[i + layer] * (1 - fx) + field[i + layer + stride] * fx) * (1 - fy) + (field[i + layer + row] * (1 - fx) + field[i + layer + row + stride] * fx) * fy;
    return front * (1 - fz) + back * fz;
  }

  step(dt: number) {
    dt = Math.min(dt, 1 / 30);
    const drag = Math.exp(-dt * .65);
    for (let z = 1; z < DEPTH - 1; z++) for (let y = 1; y < HEIGHT - 1; y++) for (let x = 1; x < WIDTH - 1; x++) {
      const i = z * LAYER + y * WIDTH + x;
      const px = x - this.velocity[i * 3] * dt;
      const py = y - this.velocity[i * 3 + 1] * dt;
      const pz = z - this.velocity[i * 3 + 2] * dt;
      for (let c = 0; c < 3; c++) this.nextVelocity[i * 3 + c] = this.sample(this.velocity, px, py, pz, 3, c) * drag;
    }
    [this.velocity, this.nextVelocity] = [this.nextVelocity, this.velocity];
    this.pressure.fill(0);
    for (let z = 1; z < DEPTH - 1; z++) for (let y = 1; y < HEIGHT - 1; y++) for (let x = 1; x < WIDTH - 1; x++) {
      const i = z * LAYER + y * WIDTH + x;
      this.divergence[i] = .5 * (this.velocity[(i + 1) * 3] - this.velocity[(i - 1) * 3] + this.velocity[(i + WIDTH) * 3 + 1] - this.velocity[(i - WIDTH) * 3 + 1] + this.velocity[(i + LAYER) * 3 + 2] - this.velocity[(i - LAYER) * 3 + 2]);
    }
    for (let pass = 0; pass < 12; pass++) {
      for (let z = 1; z < DEPTH - 1; z++) for (let y = 1; y < HEIGHT - 1; y++) for (let x = 1; x < WIDTH - 1; x++) {
        const i = z * LAYER + y * WIDTH + x;
        this.nextPressure[i] = (this.pressure[i - 1] + this.pressure[i + 1] + this.pressure[i - WIDTH] + this.pressure[i + WIDTH] + this.pressure[i - LAYER] + this.pressure[i + LAYER] - this.divergence[i]) / 6;
      }
      [this.pressure, this.nextPressure] = [this.nextPressure, this.pressure];
    }
    for (let z = 1; z < DEPTH - 1; z++) for (let y = 1; y < HEIGHT - 1; y++) for (let x = 1; x < WIDTH - 1; x++) {
      const i = z * LAYER + y * WIDTH + x;
      for (let c = 0; c < 3; c++) this.velocity[i * 3 + c] = clamp(this.velocity[i * 3 + c] - .5 * (this.pressure[i + NEIGHBORS[c]] - this.pressure[i - NEIGHBORS[c]]), -16, 16);
      const px = x - this.velocity[i * 3] * dt;
      const py = y - this.velocity[i * 3 + 1] * dt;
      const pz = z - this.velocity[i * 3 + 2] * dt;
      for (let c = 0; c < 3; c++) {
        const transported = this.sample(this.pixels, px, py, pz, 4, c) - this.velocity[i * 3 + c] * dt / (c === 2 ? Z_SCALE : SCALE);
        const mixed = (this.pixels[(i - 1) * 4 + c] + this.pixels[(i + 1) * 4 + c] + this.pixels[(i - WIDTH) * 4 + c] + this.pixels[(i + WIDTH) * 4 + c] + this.pixels[(i - LAYER) * 4 + c] + this.pixels[(i + LAYER) * 4 + c]) / 6;
        this.material[i * 4 + c] = transported * (1 - dt * .45) + mixed * dt * .45;
      }
    }
    this.pixels.set(this.material);
  }
}
