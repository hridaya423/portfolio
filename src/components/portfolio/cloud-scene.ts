import * as THREE from "three";

export class CloudScene {
  readonly renderer: THREE.WebGLRenderer;
  readonly uniforms;
  private scene = new THREE.Scene();
  private camera = new THREE.Camera();
  private geometry = new THREE.BufferGeometry();
  private material: THREE.RawShaderMaterial;
  private glyph = new THREE.DataTexture(new Uint8Array([255]), 1, 1, THREE.RedFormat);
  private fields = new THREE.Data3DTexture(new Uint8Array(4), 1, 1, 1);
  private airflow: THREE.Data3DTexture;

  constructor(canvas: HTMLCanvasElement, vertex: string, fragment: string, flow: { width: number; height: number; depth: number; pixels: Float32Array }, capture: boolean) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: capture });
    this.renderer.setClearColor(0, 0);
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.airflow = new THREE.Data3DTexture(flow.pixels, flow.width, flow.height, flow.depth);
    this.airflow.format = THREE.RGBAFormat;
    this.airflow.type = THREE.FloatType;
    this.airflow.minFilter = this.airflow.magFilter = THREE.LinearFilter;
    this.uniforms = {
      glyph: { value: this.glyph }, fields: { value: this.fields }, airflow: { value: this.airflow },
      time: { value: 0 }, steps: { value: 96 }, diagnostic: { value: 0 }, flowEnabled: { value: 1 }, cloudScale: { value: 1 },
      viewSize: { value: new THREE.Vector2(6.8, 2.55) },
    };
    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    this.material = new THREE.RawShaderMaterial({ vertexShader: vertex.replace("#version 300 es", ""), fragmentShader: fragment.replace("#version 300 es", ""), glslVersion: THREE.GLSL3, uniforms: this.uniforms, depthTest: false, depthWrite: false, blending: THREE.NoBlending });
    const quad = new THREE.Mesh(this.geometry, this.material);
    quad.frustumCulled = false;
    this.scene.add(quad);
  }

  setCloud(mask: { width: number; height: number; distance: Uint8Array }, bytes: ArrayBuffer) {
    this.glyph.image = { data: mask.distance, width: mask.width, height: mask.height };
    this.glyph.minFilter = this.glyph.magFilter = THREE.LinearFilter;
    this.glyph.needsUpdate = true;
    this.fields.image = { data: new Uint8Array(bytes), width: 64, height: 64, depth: 64 };
    this.fields.format = THREE.RGBAFormat;
    this.fields.minFilter = this.fields.magFilter = THREE.LinearFilter;
    this.fields.wrapS = this.fields.wrapT = this.fields.wrapR = THREE.RepeatWrapping;
    this.fields.needsUpdate = true;
  }

  resize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
  }

  draw(time: number, flowEnabled: boolean) {
    this.uniforms.time.value = time;
    this.uniforms.flowEnabled.value = flowEnabled ? 1 : 0;
    this.airflow.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.glyph.dispose();
    this.fields.dispose();
    this.airflow.dispose();
    this.material.dispose();
    this.geometry.dispose();
    this.renderer.dispose();
  }
}
