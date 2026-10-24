import * as THREE from "three";
import { cloudFields } from "./gl/cloud-fields";

type Flow = { width: number; height: number; depth: number; pixels: Float32Array };

/** A full-screen cloud shader drawn on the page's shared renderer. */
export class CloudScene {
  readonly uniforms;
  private scene = new THREE.Scene();
  private camera = new THREE.Camera();
  private geometry = new THREE.BufferGeometry();
  private material: THREE.RawShaderMaterial;
  private glyph = new THREE.DataTexture(new Uint8Array([255]), 1, 1, THREE.RedFormat);
  private airflow: THREE.Data3DTexture;
  private halves: Uint16Array | null;

  constructor(renderer: THREE.WebGLRenderer, vertex: string, fragment: string, private flow: Flow) {
    // Half floats filter everywhere; full floats only with an extension many phones lack.
    const filterable = renderer.extensions.has("OES_texture_float_linear");
    this.halves = filterable ? null : new Uint16Array(flow.pixels.length);
    this.airflow = new THREE.Data3DTexture(this.halves ?? flow.pixels, flow.width, flow.height, flow.depth);
    this.airflow.format = THREE.RGBAFormat;
    this.airflow.type = filterable ? THREE.FloatType : THREE.HalfFloatType;
    this.airflow.minFilter = this.airflow.magFilter = THREE.LinearFilter;
    this.airflow.needsUpdate = true;
    this.glyph.needsUpdate = true;
    this.uniforms = {
      glyph: { value: this.glyph }, fields: { value: cloudFields(renderer) }, airflow: { value: this.airflow },
      time: { value: 0 }, steps: { value: 96 }, diagnostic: { value: 0 }, flowEnabled: { value: 1 }, cloudScale: { value: 1 },
      viewSize: { value: new THREE.Vector2(6.8, 2.55) },
      lightSamples: { value: 6 }, lightEvery: { value: 2 }, lightGrowth: { value: 1.65 }, jitter: { value: 0 },
    };
    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    this.material = new THREE.RawShaderMaterial({ vertexShader: vertex.replace("#version 300 es", ""), fragmentShader: fragment.replace("#version 300 es", ""), glslVersion: THREE.GLSL3, uniforms: this.uniforms, depthTest: false, depthWrite: false, blending: THREE.NoBlending });
    const quad = new THREE.Mesh(this.geometry, this.material);
    quad.frustumCulled = false;
    this.scene.add(quad);
  }

  setGlyph(mask: { width: number; height: number; distance: Uint8Array }) {
    this.glyph.image = { data: mask.distance, width: mask.width, height: mask.height };
    this.glyph.minFilter = this.glyph.magFilter = THREE.LinearFilter;
    this.glyph.needsUpdate = true;
  }

  /** Fewer light samples reach as far into the cloud by growing each stride more. */
  setLighting(samples: number, every: number) {
    let growth = 1.65;
    if (samples < 6) {
      const reach = (1.65 ** 6 - 1) / 0.65;
      let low = 1.65, high = 12;
      for (let i = 0; i < 40; i++) {
        growth = (low + high) / 2;
        if ((growth ** samples - 1) / (growth - 1) < reach) low = growth;
        else high = growth;
      }
    }
    this.uniforms.lightSamples.value = samples;
    this.uniforms.lightEvery.value = every;
    this.uniforms.lightGrowth.value = growth;
  }

  /** 0 marches from the middle of each step; any other value offsets steps per pixel, varying with the seed. */
  setJitter(seed: number) {
    this.uniforms.jitter.value = seed;
  }

  draw(renderer: THREE.WebGLRenderer, time: number, flowEnabled: boolean, flowChanged: boolean) {
    this.uniforms.time.value = time;
    this.uniforms.flowEnabled.value = flowEnabled ? 1 : 0;
    if (flowChanged) {
      if (this.halves) {
        const source = this.flow.pixels, halves = this.halves;
        for (let i = 0; i < source.length; i++) halves[i] = THREE.DataUtils.toHalfFloat(source[i]);
      }
      this.airflow.needsUpdate = true;
    }
    renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.glyph.dispose();
    this.airflow.dispose();
    this.material.dispose();
    this.geometry.dispose();
  }
}
