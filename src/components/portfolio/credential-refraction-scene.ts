import * as THREE from "three";

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
    float amplitude = .00105 / (1. + band * .60);
    float phase = dot(source, direction) * frequency + band * 3.7 + dot(lightPosition, direction) * .9 - time * (.22 + band * .075);
    height += amplitude * sin(phase);
    slope += amplitude * frequency * cos(phase) * direction;
  }
  float wavelength = .40 + float(gl_InstanceID) / 8. * .30;
  float index = 1.30 + .024 / (wavelength * wavelength);
  vec3 normal = normalize(vec3(-slope, 1.));
  vec3 incident = normalize(vec3(.65, -.35, -1.));
  vec3 direction = refract(incident, normal, 1. / index);
  vec3 centralRay = refract(incident, vec3(0., 0., 1.), 1. / 1.3793);
  landing = source + (direction.xy / -direction.z - centralRay.xy / -centralRay.z) * (.28 + height + (1. - focus) * .12);
  float t = float(gl_InstanceID) / 8.;
  spectralPower = exp(-.5 * pow((t - vec3(.80, .46, .16)) / vec3(.25, .20, .18), vec3(2.))) / vec3(4.23, 3.99, 3.34);
  gl_Position = vec4(landing / vec2(.72, .36), 0., 1.);
}`;

const photonFragment = `
precision highp float;
uniform sampler2D inscription;
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
  color = vec4(spectralPower * mask * density, 1.);
}`;

const fragment = `
precision highp float;
uniform vec2 resolution;
uniform vec3 paper;
uniform sampler2D caustics;
uniform float focus;
uniform float compact;
in vec2 uv;
out vec4 color;
vec3 light(vec2 p, float lod) {
  return textureLod(caustics, p / vec2(1.44, .72) + .5, lod).rgb;
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
  vec3 surface = paper * (1. - wash * .20);
  vec3 radiance = surface + (rays * .20 + spill) * mix(.25, 1., focus);
  color = vec4(pow(max(radiance, vec3(0.)), vec3(1. / 2.2)), 1.);
}`;

export class CredentialRefractionScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.Camera();
  private geometry = new THREE.BufferGeometry();
  private photonGeometry = new THREE.PlaneGeometry(1.44, .72, 256, 128);
  private photonScene = new THREE.Scene();
  private photonMaterial: THREE.RawShaderMaterial;
  private caustics = new THREE.WebGLRenderTarget(2048, 1024, { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearMipmapLinearFilter, generateMipmaps: true });
  private material: THREE.RawShaderMaterial;
  private texture = new THREE.CanvasTexture(document.createElement("canvas"));
  private uniforms = {
    resolution: { value: new THREE.Vector2(1, 1) },
    lightPosition: { value: new THREE.Vector2() },
    paper: { value: new THREE.Vector3() },
    inscription: { value: this.texture },
    caustics: { value: this.caustics.texture },
    focus: { value: 1 },
    time: { value: 0 },
    compact: { value: 0 },
  };

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    this.material = new THREE.RawShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, glslVersion: THREE.GLSL3, uniforms: this.uniforms, depthTest: false, depthWrite: false });
    const mesh = new THREE.Mesh(this.geometry, this.material);
    mesh.frustumCulled = false;
    this.scene.add(mesh);
    this.photonMaterial = new THREE.RawShaderMaterial({ vertexShader: photonVertex, fragmentShader: photonFragment, glslVersion: THREE.GLSL3, uniforms: this.uniforms, depthTest: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const photons = new THREE.InstancedMesh(this.photonGeometry, this.photonMaterial, 9);
    photons.frustumCulled = false;
    this.photonScene.add(photons);
  }

  setInscription(label: string, font: string) {
    const canvas = this.texture.image as HTMLCanvasElement;
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = `400 380px ${font}`;
    const scale = Math.min(1, 1820 / context.measureText(label).width);
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(scale, scale * 1.5625);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "white";
    context.fillText(label, 0, 15);
    this.texture.needsUpdate = true;
  }

  resize(width: number, height: number, compact: boolean, surface: string) {
    const ratio = Math.min(devicePixelRatio, 1.5);
    this.renderer.setSize(Math.round(width * ratio), Math.round(height * ratio), false);
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
    this.renderer.setClearColor(0x000000, 0);
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
    this.renderer.dispose();
  }
}
