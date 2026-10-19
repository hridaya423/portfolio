import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { GLYPH_CHARACTERS, GLYPH_HEIGHT, glyphAtlas } from "./dot-matrix-font";

/** Characters per module line, lines per module, and the repeating wall size in modules. */
export const MODULE_COLUMNS = 8;
export const MODULE_ROWS = 2;
export const WALL = 9;

// Module geometry in dot units: 5×7 glyphs on a 6×9 pitch, a padded screen,
// a bezel, and a groove between modules.
const CHAR = [6, 9];
const PAD = 2.5;
const BEZEL = 1.6;
const SCREEN = [MODULE_COLUMNS * CHAR[0] - 1 + PAD * 2, MODULE_ROWS * CHAR[1] - 2 + PAD * 2];
const OUTER = [SCREEN[0] + BEZEL * 2, SCREEN[1] + BEZEL * 2];
export const PITCH = [OUTER[0] + 1.2, OUTER[1] + 1.2];

/** The wall is rotated on its surface, then foreshortened: a dimetric view. */
export const ANGLE = -0.52;
export const SQUASH = 0.6;

const vertex = `
in vec3 position;
void main() { gl_Position = vec4(position, 1.); }`;

// Palette in linear space, written from the page's sRGB values.
const linear = (hex: string) => {
  const c = new THREE.Color(hex);
  return `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`;
};

const surface = `
precision highp float;
precision highp int;
uniform vec2 resolution;
uniform vec2 origin;
uniform vec2 light;
uniform float dotSize;
uniform float time;
uniform vec2 hover;
uniform float hoverAmount;
uniform sampler2D text;
uniform sampler2D glyphs;
out vec4 color;

const vec2 CHAR = vec2(${CHAR[0].toFixed(1)}, ${CHAR[1].toFixed(1)});
const vec2 SCREEN = vec2(${SCREEN[0].toFixed(2)}, ${SCREEN[1].toFixed(2)});
const vec2 OUTER = vec2(${OUTER[0].toFixed(2)}, ${OUTER[1].toFixed(2)});
const vec2 PITCH = vec2(${PITCH[0].toFixed(2)}, ${PITCH[1].toFixed(2)});
const float PAD = ${PAD.toFixed(2)};
const float BEZEL = ${BEZEL.toFixed(2)};
const float ANGLE = ${ANGLE.toFixed(4)};
const float SQUASH = ${SQUASH.toFixed(4)};
const vec3 METAL = ${linear("#e2e4e5")};
const vec3 GROOVE = ${linear("#bfc2c4")};
const vec3 RIM = ${linear("#e2511c")};
const vec3 CORE = ${linear("#ff6f33")};
const vec3 HAZE = ${linear("#ff7a40")};

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1.)), f.x), f.y);
}

float box(vec2 p, vec2 extent, float radius) {
  vec2 q = abs(p) - extent + radius;
  return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - radius;
}

vec2 toSurface(vec2 pixel) {
  vec2 d = (pixel - origin) / dotSize;
  d.y /= SQUASH;
  float c = cos(-ANGLE), s = sin(-ANGLE);
  return mat2(c, s, -s, c) * d;
}

/** Brightness of one dot, by its position on the module's dot grid. */
float energyAt(ivec2 dotPosition, ivec2 wallIndex) {
  ivec2 character = dotPosition / ivec2(CHAR);
  ivec2 inside = dotPosition - character * ivec2(CHAR);
  if (dotPosition.x < 0 || dotPosition.y < 0 || character.x >= ${MODULE_COLUMNS} || character.y >= ${MODULE_ROWS}
    || inside.x > 4 || inside.y > 6) return 0.;
  vec4 data = texelFetch(text, ivec2(wallIndex.x * ${MODULE_COLUMNS} + character.x, wallIndex.y * ${MODULE_ROWS} + character.y), 0);
  int code = int(data.r * 255. + .5);
  int bits = int(texelFetch(glyphs, ivec2(code, inside.y), 0).r * 255. + .5);
  return float((bits >> (4 - inside.x)) & 1) * data.g;
}

void main() {
  vec2 pixel = vec2(gl_FragCoord.x, resolution.y - gl_FragCoord.y);
  vec2 p = toSurface(pixel) + OUTER * .5;
  float aa = length(fwidth(p));
  vec2 module = floor(p / PITCH);
  vec2 local = p - module * PITCH;
  ivec2 wallIndex = ivec2(mod(module, ${WALL}.));
  float panelSeed = hash(vec2(wallIndex));

  // Each module is a tile of brushed aluminium, like the tray, set in a groove.
  vec2 q = local - OUTER * .5;
  float outer = box(q, OUTER * .5, 1.1);
  float e = .08;
  vec2 normal = vec2(box(q + vec2(e, 0.), OUTER * .5, 1.1) - box(q - vec2(e, 0.), OUTER * .5, 1.1),
                     box(q + vec2(0., e), OUTER * .5, 1.1) - box(q - vec2(0., e), OUTER * .5, 1.1)) / (2. * e);
  float tile = 1. - smoothstep(-aa, aa, outer);
  float bevel = smoothstep(-.9, 0., outer) * tile;
  float facing = dot(normal, normalize(vec2(-.45, -1.)));

  float brushed = noise(vec2(p.x * .05, p.y * 4.)) * .6 + noise(vec2(p.x * .02, p.y * 1.3)) * .4;
  vec2 toLight = (pixel - light) / resolution.y;
  float sheen = exp(-dot(toLight, toLight) * 2.4);
  vec3 metal = METAL * (.955 + .05 * brushed + .025 * panelSeed + .07 * sheen);
  metal *= 1. + bevel * facing * .16;
  vec3 groove = GROOVE * (.86 + .14 * smoothstep(0., .6, outer));
  vec3 result = mix(groove, metal, tile);

  // Perforations on a 6×9 pitch; light shows through the lit ones.
  vec2 cell = local - BEZEL - PAD;
  ivec2 dotPosition = ivec2(floor(cell));
  vec2 inDot = fract(cell) - .5;
  float near = hoverAmount * (1. - smoothstep(0., 1.6, length((module - hover) * vec2(1., 1.3))));
  float boost = (1. + near * .5) * (.97 + .03 * sin(time * 50. + panelSeed * 40.));
  float own = 0.;
  float haze = 0.;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    ivec2 neighbour = dotPosition + ivec2(x, y);
    float energy = energyAt(neighbour, wallIndex);
    if (x == 0 && y == 0) own = energy;
    vec2 offset = inDot - vec2(x, y);
    haze += energy * exp(-dot(offset, offset) * 1.6);
  }
  ivec2 inside = dotPosition - (dotPosition / ivec2(CHAR)) * ivec2(CHAR);
  bool onGrid = cell.x >= 0. && cell.y >= 0. && cell.x < CHAR.x * ${MODULE_COLUMNS}. && cell.y < CHAR.y * ${MODULE_ROWS}.
    && inside.x < 5 && inside.y < 7;
  float hole = onGrid ? (1. - smoothstep(-aa * .7, aa * .7, length(inDot) - .34)) * tile : 0.;
  // An unlit hole is a dark pit, its upper lip in shadow.
  result *= 1. - hole * (.075 + .05 * smoothstep(.2, -.3, inDot.y));
  result = mix(result, HAZE, clamp(haze * boost * .4, 0., .6) * tile);
  float lit = clamp(own * boost, 0., 1.3) * hole;
  vec3 emission = mix(RIM, CORE, 1. - smoothstep(.05, .32, length(inDot)));
  result = mix(result, emission, clamp(lit, 0., 1.));
  color = vec4(result, 1.);
}`;

const lens = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2(1, 1) },
    focus: { value: new THREE.Vector2(.5, .5) },
    paper: { value: new THREE.Color("#efeff0") },
    blur: { value: 14 },
    time: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform vec2 focus;
    uniform vec3 paper;
    uniform float blur;
    uniform float time;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      // Tilt-shift: a band of focus lying along the wall's text direction.
      vec2 delta = (vUv - focus) * vec2(resolution.x / resolution.y, 1.);
      float c = cos(${(-ANGLE * SQUASH).toFixed(4)}), s = sin(${(-ANGLE * SQUASH).toFixed(4)});
      delta = mat2(c, -s, s, c) * delta;
      float band = length(delta * vec2(.42, 1.55));
      float amount = smoothstep(.14, .7, band);
      float radius = amount * blur;
      vec3 sum = texture2D(tDiffuse, vUv).rgb;
      float weight = 1.;
      if (radius > .35) {
        float spin = hash(gl_FragCoord.xy) * 6.2831;
        for (int i = 1; i < 28; i++) {
          float f = float(i);
          float r = sqrt(f / 28.) * radius;
          float a = f * 2.39996 + spin;
          vec2 offset = vec2(cos(a), sin(a)) * r / resolution;
          sum += texture2D(tDiffuse, vUv + offset).rgb;
          weight += 1.;
        }
      }
      vec3 color = sum / weight;
      color += (hash(vUv * resolution + fract(time) * 91.7) - .5) * .018;
      // No frame: the surface rises out of the page and sinks back into it.
      vec2 edge = min(vUv, 1. - vUv) * vec2(resolution.x / resolution.y, 1.);
      float body = smoothstep(0., .3, edge.y) * smoothstep(0., .22, edge.x);
      gl_FragColor = vec4(mix(paper, max(color, 0.), body), 1.);
    }`,
};

export class LcdWallScene {
  readonly renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private lensPass: ShaderPass;
  private scene = new THREE.Scene();
  private camera = new THREE.Camera();
  private geometry = new THREE.BufferGeometry();
  private material: THREE.RawShaderMaterial;
  readonly textData: Uint8Array;
  private textTexture: THREE.DataTexture;
  private glyphTexture: THREE.DataTexture;
  private uniforms;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
    // No tone mapping, so the faded edges land exactly on the page's paper.
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.textData = new Uint8Array(WALL * MODULE_COLUMNS * WALL * MODULE_ROWS * 4);
    this.textTexture = new THREE.DataTexture(this.textData, WALL * MODULE_COLUMNS, WALL * MODULE_ROWS, THREE.RGBAFormat);
    this.glyphTexture = new THREE.DataTexture(glyphAtlas(), GLYPH_CHARACTERS.length, GLYPH_HEIGHT, THREE.RedFormat);
    this.glyphTexture.unpackAlignment = 1;
    for (const texture of [this.textTexture, this.glyphTexture]) {
      texture.minFilter = texture.magFilter = THREE.NearestFilter;
      texture.needsUpdate = true;
    }
    this.uniforms = {
      resolution: { value: new THREE.Vector2(1, 1) },
      origin: { value: new THREE.Vector2() },
      light: { value: new THREE.Vector2() },
      dotSize: { value: 8 },
      time: { value: 0 },
      hover: { value: new THREE.Vector2(0, 0) },
      hoverAmount: { value: 0 },
      text: { value: this.textTexture },
      glyphs: { value: this.glyphTexture },
    };
    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    this.material = new THREE.RawShaderMaterial({
      vertexShader: vertex,
      fragmentShader: surface,
      glslVersion: THREE.GLSL3,
      uniforms: this.uniforms,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(this.geometry, this.material);
    quad.frustumCulled = false;
    this.scene.add(quad);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.lensPass = new ShaderPass(lens);
    this.composer.addPass(this.lensPass);
    this.composer.addPass(new OutputPass());
  }

  /** Sizes in CSS pixels; `dot` is one LCD pixel on screen. */
  resize(width: number, height: number, ratio: number, dot: number) {
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(width, height, false);
    this.composer.setPixelRatio(ratio);
    this.composer.setSize(width, height);
    this.uniforms.resolution.value.set(width * ratio, height * ratio);
    this.uniforms.origin.value.set(width * ratio * 0.5, height * ratio * 0.5);
    this.uniforms.dotSize.value = dot * ratio;
    this.lensPass.uniforms.resolution.value.set(width * ratio, height * ratio);
    this.lensPass.uniforms.blur.value = Math.min(17, width / 88) * ratio;
  }

  /** Surface position, in modules, under a CSS-pixel point relative to the canvas centre. */
  moduleAt(x: number, y: number, dot: number) {
    const dx = x / dot;
    const dy = y / dot / SQUASH;
    const c = Math.cos(-ANGLE), s = Math.sin(-ANGLE);
    const px = c * dx - s * dy + OUTER[0] / 2;
    const py = s * dx + c * dy + OUTER[1] / 2;
    return [Math.floor(px / PITCH[0]), Math.floor(py / PITCH[1])] as const;
  }

  updateText() {
    this.textTexture.needsUpdate = true;
  }

  draw(time: number, focusX: number, focusY: number, hoverX: number, hoverY: number, hoverAmount: number) {
    this.uniforms.time.value = time;
    this.uniforms.hover.value.set(hoverX, hoverY);
    this.uniforms.hoverAmount.value = hoverAmount;
    this.lensPass.uniforms.focus.value.set(focusX, 1 - focusY);
    // The sheen sits up and left of where you look, as from a window.
    const resolution = this.uniforms.resolution.value;
    this.uniforms.light.value.set((focusX - 0.12) * resolution.x, (focusY - 0.3) * resolution.y);
    this.lensPass.uniforms.time.value = time;
    this.composer.render();
  }

  dispose() {
    this.composer.dispose();
    this.lensPass.dispose();
    this.textTexture.dispose();
    this.glyphTexture.dispose();
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
