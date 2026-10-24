import * as THREE from "three";
import type { Settings } from "./gl/quality";

const vertex = `
precision highp float;
in vec3 position;
out vec2 uv;
void main() {
  uv = position.xy * .5 + .5;
  gl_Position = vec4(position, 1.);
}`;

const photonVertex = `
precision highp float;
in vec3 position;
uniform vec2 lightPosition;
uniform float time;
uniform float focus;
uniform float bands;
out vec2 source;
out vec2 landing;
flat out vec3 spectralPower;
void main() {
  source = position.xy;
  vec2 slope = vec2(0.);
  float height = 0.;
  for (int i = 0; i < 5; i++) {
    float band = float(i);
    float angle = band * 2.39996 + .3;
    vec2 direction = vec2(cos(angle), sin(angle));
    float frequency = 46. + band * 23.;
    float amplitude = .00085 / (1. + band * .60);
    float phase = dot(source, direction) * frequency + band * 3.7 + dot(lightPosition, direction) * .9 - time * (.22 + band * .075);
    height += amplitude * sin(phase);
    slope += amplitude * frequency * cos(phase) * direction;
  }
  // Fewer wavelength bands on smaller GPUs, each carrying a larger share of the light.
  float t = float(gl_InstanceID) / (bands - 1.);
  float wavelength = .40 + t * .30;
  float index = 1.30 + .024 / (wavelength * wavelength);
  vec3 normal = normalize(vec3(-slope, 1.));
  vec3 incident = normalize(vec3(.65, -.35, -1.));
  vec3 direction = refract(incident, normal, 1. / index);
  vec3 centralRay = refract(incident, vec3(0., 0., 1.), 1. / 1.3793);
  landing = source + (direction.xy / -direction.z - centralRay.xy / -centralRay.z) * (.28 + height + (1. - focus) * .12);
  spectralPower = exp(-.5 * pow((t - vec3(.80, .46, .16)) / vec3(.25, .20, .18), vec3(2.))) / vec3(4.23, 3.99, 3.34) * (9. / bands);
  gl_Position = vec4(landing / vec2(.72, .36), 0., 1.);
}`;

const photonFragment = `
precision highp float;
uniform sampler2D inscription;
uniform float gain;
in vec2 source;
in vec2 landing;
flat in vec3 spectralPower;
out vec4 color;
void main() {
  vec2 st = vec2(source.x + .5, source.y / .32 + .5);
  float mask = texture(inscription, clamp(st, vec2(0.), vec2(1.))).r;
  vec2 dx = dFdx(source), dy = dFdy(source);
  vec2 lx = dFdx(landing), ly = dFdy(landing);
  float sourceArea = abs(dx.x * dy.y - dx.y * dy.x);
  float landingArea = abs(lx.x * ly.y - lx.y * ly.x);
  float density = min(14., sourceArea / max(landingArea, .00000001));
  color = vec4(spectralPower * mask * density * gain, 1.);
}`;

const fragment = `
precision highp float;
uniform vec2 resolution;
uniform vec3 paper;
uniform sampler2D caustics;
uniform float focus;
uniform float compact;
uniform float gain;
uniform float lodShift;
in vec2 uv;
out vec4 color;
// Blur radii are written for a 2048 target; smaller targets reach them a level sooner.
vec3 light(vec2 p, float lod) {
  return textureLod(caustics, p / vec2(1.44, .72) + .5, max(0., lod - lodShift)).rgb / gain;
}
void main() {
  float size = resolution.x * mix(.58, 1.10, compact);
  vec2 p = (uv - vec2(mix(.67, .5, compact), .52)) * resolution / size;
  float angle = -.12;
  p = mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * p;
  p.x += p.y * .30;
  p /= 1. + p.y * .30;
  float blur = (1. - focus) * 4.;
  vec3 rays = light(p, blur);
  vec3 spill = light(p, 4.5 + blur) * .055 + light(p, 6.5) * .06;
  float wash = exp(-dot(p / vec2(.58, .23), p / vec2(.58, .23)) * 1.7);
  // The slab's shadow feathers out before the canvas edge so no box shows.
  vec2 edge = smoothstep(vec2(0.), vec2(.16, .22), uv) * smoothstep(vec2(0.), vec2(.16, .22), 1. - uv);
  wash *= edge.x * edge.y;
  vec3 surface = paper * (1. - wash * .15);
  vec3 radiance = surface + (rays * .20 + spill) * mix(.25, 1., focus);
  color = vec4(pow(max(radiance, vec3(0.)), vec3(1. / 2.2)), 1.);
}`;

export class CredentialRefractionScene {
  private scene = new THREE.Scene();
  private camera = new THREE.Camera();
  private geometry = new THREE.BufferGeometry();
  private photonGeometry: THREE.PlaneGeometry;
  private photonScene = new THREE.Scene();
  private photonMaterial: THREE.RawShaderMaterial;
  private caustics: THREE.WebGLRenderTarget;
  private material: THREE.RawShaderMaterial;
  private texture = new THREE.CanvasTexture(document.createElement("canvas"));
  private uniforms;

  constructor(private renderer: THREE.WebGLRenderer, { size, bands, grid }: Settings["caustics"]) {
    // Additive light wants a float target. Many phones can't draw into one, so
    // those get an 8-bit target with the light scaled down to stay in range.
    const extensions = renderer.extensions;
    const floatTarget = extensions.has("EXT_color_buffer_float") || extensions.has("EXT_color_buffer_half_float");
    this.caustics = new THREE.WebGLRenderTarget(size, size / 2, {
      type: floatTarget ? THREE.HalfFloatType : THREE.UnsignedByteType,
      depthBuffer: false,
      minFilter: THREE.LinearMipmapLinearFilter,
      generateMipmaps: true,
    });
    this.photonGeometry = new THREE.PlaneGeometry(1.44, .72, grid[0], grid[1]);
    this.uniforms = {
      resolution: { value: new THREE.Vector2(1, 1) },
      lightPosition: { value: new THREE.Vector2() },
      paper: { value: new THREE.Vector3() },
      inscription: { value: this.texture },
      caustics: { value: this.caustics.texture },
      focus: { value: 1 },
      time: { value: 0 },
      compact: { value: 0 },
      bands: { value: bands },
      gain: { value: floatTarget ? 1 : 1 / 12 },
      lodShift: { value: Math.log2(2048 / size) },
    };
    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    this.material = new THREE.RawShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, glslVersion: THREE.GLSL3, uniforms: this.uniforms, depthTest: false, depthWrite: false });
    const mesh = new THREE.Mesh(this.geometry, this.material);
    mesh.frustumCulled = false;
    this.scene.add(mesh);
    this.photonMaterial = new THREE.RawShaderMaterial({ vertexShader: photonVertex, fragmentShader: photonFragment, glslVersion: THREE.GLSL3, uniforms: this.uniforms, depthTest: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const photons = new THREE.InstancedMesh(this.photonGeometry, this.photonMaterial, bands);
    photons.frustumCulled = false;
    this.photonScene.add(photons);
    // Prove the target is drawable before claiming to be ready; a blank slab is worse than the fallback text.
    renderer.setRenderTarget(this.caustics);
    const gl = renderer.getContext();
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    renderer.setRenderTarget(null);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      this.dispose();
      throw new Error(`Caustics target incomplete (0x${status.toString(16)})`);
    }
  }

  setInscription(label: string, font: string) {
    const canvas = this.texture.image as HTMLCanvasElement;
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = `500 380px ${font}`;
    const scale = Math.min(1, 1820 / context.measureText(label).width);
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(scale, scale * 1.5625);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "white";
    context.fillText(label, 0, 15);
    this.texture.needsUpdate = true;
  }

  /** Sizes in CSS pixels. */
  resize(width: number, height: number, compact: boolean, surface: string) {
    this.uniforms.resolution.value.set(width, height);
    this.uniforms.compact.value = compact ? 1 : 0;
    const color = new THREE.Color(surface).convertLinearToSRGB();
    this.uniforms.paper.value.set(color.r ** 2.2, color.g ** 2.2, color.b ** 2.2);
  }

  draw(x: number, y: number, focus: number, time: number) {
    this.uniforms.lightPosition.value.set(x, y);
    this.uniforms.focus.value = focus;
    this.uniforms.time.value = time;
    this.renderer.setRenderTarget(this.caustics);
    this.renderer.render(this.photonScene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.caustics.dispose();
    this.photonGeometry.dispose();
    this.photonMaterial.dispose();
    this.texture.dispose();
    this.geometry.dispose();
    this.material.dispose();
  }
}
