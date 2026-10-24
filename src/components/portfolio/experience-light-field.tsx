"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { getStage, type Frame } from "./gl/stage";

const vertex = `
in vec3 position;
void main() { gl_Position = vec4(position, 1.0); }
`;

const fragment = `
precision highp float;
uniform vec2 resolution;
uniform vec2 size;
uniform float slit;
uniform float openTo;
uniform int count;
uniform sampler2D rows;
out vec4 color;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}
void main() {
  vec2 p = vec2(gl_FragCoord.x / resolution.x, 1.0 - gl_FragCoord.y / resolution.y) * size;
  float scale = 1536.0 / size.x;
  p *= scale;
  float height = size.y * scale;
  float seam = slit * scale;
  vec3 background = vec3(239.0/255.0,239.0/255.0,240.0/255.0);
  vec3 surface = background;
  float cloud = noise(p * .004) * .6 + noise(p * .013) * .4;
  surface += (cloud - .5) * .006;
  float grain = (hash(p * 1.37) - .5) * .005;
  surface += grain;
  float first = texelFetch(rows, ivec2(0,0), 0).x * scale;
  vec4 lastRow = texelFetch(rows, ivec2(count-1,0), 0) * scale;
  float beginning = max(20.0, first - 110.0);
  float ending = lastRow.x + lastRow.y + 60.0;
  float reach = openTo * scale;
  float along = smoothstep(beginning, beginning + 90.0, p.y) * (1.0 - smoothstep(ending - 35.0, ending + 100.0, p.y));
  along *= 1.0 - smoothstep(reach - 60.0, reach + 60.0, p.y);
  float bow = 3.0 * sin(clamp((p.y-beginning)/(ending-beginning),0.0,1.0)*3.14159);
  float dx = p.x - seam + bow;
  float recess = exp(-pow((dx + 4.0) / 3.4, 2.0)) * along;
  float occlusion = exp(-pow((dx + 10.0) / 15.0, 2.0)) * along;
  surface -= recess * .17 + occlusion * .032;
  float lip = exp(-pow((dx - .7) / 1.35, 2.0)) * along;
  surface += vec3(.025,.022,.014) * lip;
  float emitted = 0.0;
  for (int i = 0; i < count; i++) {
    vec4 raw = texelFetch(rows, ivec2(i,0), 0);
    vec4 row = raw * scale;
    float lit = raw.z;
    if (lit < .001) continue;
    // Rows are the roles' text blocks: each beam opens on its text and stays centred on it.
    float middle = row.x + row.y * .5;
    float start = middle - row.y * .34;
    float end = middle + row.y * .34;
    float x = max(0.0, dx);
    float upper = start - x * .17;
    float lower = end + x * .3;
    float penumbra = 2.0 + x * .052;
    float visibility = smoothstep(upper - penumbra, upper + penumbra, p.y) * (1.0 - smoothstep(lower - penumbra * 1.7, lower + penumbra * 1.7, p.y));
    float falloff = exp(-x / 940.0);
    float bounce = exp(-x / 120.0) * exp(-pow((p.y - (start + end)*.5) / (row.y*.42),2.0));
    float nearSource = exp(-x / 270.0);
    float light = visibility * falloff * (.74 + nearSource * .26) * smoothstep(-1.0, 3.0, dx);
    float beamCenter = (upper + lower) * .5;
    float centerWidth = max(42.0, (lower-upper) * .48);
    float centerGlow = visibility * exp(-pow((p.y-beamCenter) / centerWidth, 2.0)) * exp(-x / 720.0);
    float shadowWidth = 11.0 + x * .045;
    float outsideLowerEdge = smoothstep(lower - penumbra * .2, lower + penumbra * .65, p.y);
    float edgeShadow = outsideLowerEdge * exp(-max(0.0, p.y-lower) / shadowWidth) * exp(-x / 1050.0) * smoothstep(1.0, 14.0, x);
    float lightTexture = (noise(p * .018) - .5) * .004 * visibility;
    // Each beam travels outward from the slit as its role is lit.
    float travel = smoothstep(lit * 1800.0 - 300.0, lit * 1800.0, x) ;
    float beam = lit * (1.0 - travel);
    surface += vec3(.082, .066, .019) * light * beam;
    surface += vec3(.020, .015, .002) * centerGlow * beam;
    surface += vec3(.017, .013, .003) * bounce * smoothstep(-2.0, 5.0, dx) * lit;
    surface += lightTexture * beam;
    surface -= vec3(.021, .022, .024) * edgeShadow * beam;
    float opening = smoothstep(start-5.0, start+5.0, p.y) * (1.0-smoothstep(end-5.0,end+5.0,p.y)) * lit;
    emitted += opening;
  }
  float coreWidth = max(2.6, .95 * scale);
  float aperture = (1.0 - smoothstep(coreWidth * .45, coreWidth, abs(dx - 1.2))) * along;
  float emission = .95 + min(1.0, emitted) * .05;
  surface = mix(surface, vec3(1.0,.998,.972), aperture * emission);
  float halo = exp(-abs(dx - 1.2)/10.0) * along * (.8 + emitted * .2);
  surface += vec3(.044,.033,.009) * halo;
  float edge = max(160.0, 72.0 * scale);
  float fade = smoothstep(0.0, edge, p.y) * (1.0-smoothstep(height-edge*1.5,height,p.y));
  float sides = smoothstep(-180.0,240.0,p.x) * (1.0-smoothstep(1296.0,1716.0,p.x));
  color = vec4(mix(background, surface, fade*sides),1.0);
}
`;

type Row = { top: number; height: number };

export function ExperienceLightField({ count }: { count: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const section = canvas?.parentElement;
    const stage = getStage();
    if (!canvas || !section || !count || !stage) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    // Per-role light: 0 until the role scrolls into view, then eases to 1 and stays.
    const lit = new Float32Array(count).fill(reduced.matches ? 1 : 0);
    const targets = new Float32Array(count).fill(reduced.matches ? 1 : 0);
    const data = new Float32Array(count * 4);
    const rowTexture = new THREE.DataTexture(data, count, 1, THREE.RGBAFormat, THREE.FloatType);
    rowTexture.minFilter = rowTexture.magFilter = THREE.NearestFilter;
    const uniforms = {
      resolution: { value: new THREE.Vector2(1, 1) },
      size: { value: new THREE.Vector2(1, 1) },
      slit: { value: 0 },
      openTo: { value: 0 },
      count: { value: count },
      rows: { value: rowTexture },
    };
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    const material = new THREE.RawShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, glslVersion: THREE.GLSL3, uniforms, depthTest: false, depthWrite: false });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    const scene = new THREE.Scene().add(mesh);
    const camera = new THREE.Camera();

    // Layout is read when it can change, never per frame.
    let rows: Row[] = [];
    let slit = 0;
    const measure = () => {
      const bounds = section.getBoundingClientRect();
      const bodies = Array.from(section.querySelectorAll<HTMLElement>(".experience-entry"))
        .map(entry => entry.querySelector<HTMLElement>(".experience-body") ?? entry);
      // Layout box, so the reveal's translate doesn't drag the light with it.
      rows = bodies.map(text => {
        const parent = text.offsetParent?.getBoundingClientRect().top ?? bounds.top;
        return { top: parent + text.offsetTop - bounds.top, height: text.offsetHeight };
      });
      const body = bodies[0];
      slit = body ? body.getBoundingClientRect().left - bounds.left - Math.min(72, bounds.width * .06) : bounds.width * .2;
    };

    const render = (renderer: THREE.WebGLRenderer, frame: Frame) => {
      if (!rows.length) measure();
      let moving = false;
      for (let index = 0; index < count; index++) {
        const gap = targets[index] - lit[index];
        if (Math.abs(gap) > .002) {
          lit[index] += gap * (1 - Math.exp(-frame.delta * 2.4));
          moving = true;
        } else lit[index] = targets[index];
      }
      let openTo = 0;
      rows.forEach((row, index) => {
        data[index * 4] = row.top;
        data[index * 4 + 1] = row.height;
        data[index * 4 + 2] = lit[index] ?? 1;
        if (lit[index] > .001) openTo = Math.max(openTo, row.top + row.height * Math.min(1, lit[index] * 1.4));
      });
      rowTexture.needsUpdate = true;
      uniforms.resolution.value.set(frame.width, frame.height);
      uniforms.size.value.set(frame.cssWidth, frame.cssHeight);
      uniforms.slit.value = slit;
      uniforms.openTo.value = openTo;
      uniforms.count.value = Math.min(count, rows.length);
      renderer.render(scene, camera);
      return moving;
    };

    const handle = stage.add({
      placeholder: canvas,
      // Soft light: a fixed pixel budget looks the same and costs a fraction on tall phones.
      ratio: (settings, width, height) => Math.min(devicePixelRatio, 1.5, Math.sqrt(settings.light.budget / (width * height))),
      // A background: whatever sits on top of it gets the canvas first.
      priority: () => 0.3,
      render,
    });
    const aim = () => {
      if (reduced.matches) return;
      let changed = false;
      section.querySelectorAll<HTMLElement>(".experience-entry").forEach((entry, index) => {
        if (!targets[index] && entry.getBoundingClientRect().top < innerHeight * .7) {
          targets[index] = 1;
          changed = true;
        }
      });
      if (changed) handle.wake();
    };
    let near = false;
    const visibility = new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      if (near) aim();
    });
    visibility.observe(section);
    const scroll = () => { if (near) aim(); };
    window.addEventListener("scroll", scroll, { passive: true });
    const relayout = () => { measure(); handle.wake(); };
    const sizes = new ResizeObserver(relayout);
    section.querySelectorAll(".experience-entry").forEach(entry => sizes.observe(entry));
    document.fonts.ready.then(relayout);
    return () => {
      visibility.disconnect();
      sizes.disconnect();
      window.removeEventListener("scroll", scroll);
      handle.remove();
      rowTexture.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [count]);

  return <canvas ref={ref} className="experience-light-field" aria-hidden="true" />;
}
