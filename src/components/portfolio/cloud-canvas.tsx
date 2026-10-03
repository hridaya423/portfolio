"use client";

import { useEffect, useRef } from "react";
import { CloudFlow } from "./cloud-flow";
import { CloudScene } from "./cloud-scene";

const vertex = `#version 300 es
in vec3 position;
out vec2 uv;
void main() {
  uv = position.xy * .5 + .5;
  gl_Position = vec4(position.xy, 0., 1.);
}`;

const fragment = `#version 300 es
precision highp float;
precision highp sampler3D;
in vec2 uv;
out vec4 color;
uniform sampler2D glyph;
uniform sampler3D fields;
uniform float time;
uniform float steps;
uniform int diagnostic;
uniform sampler3D airflow;
uniform float flowEnabled;
uniform float cloudScale;
uniform vec2 viewSize;
const vec3 sun = vec3(-.55, .68, .48);
float letter(vec2 p) {
  vec2 st = p / viewSize + .5;
  if (any(lessThan(st, vec2(0.))) || any(greaterThan(st, vec2(1.)))) return 1.;
  return texture(glyph, st).r - .5;
}
float density(vec3 p, bool detail) {
  vec4 transport = texture(airflow, p / vec3(viewSize, 1.6) + .5);
  vec3 materialPoint = p + transport.xyz * vec3(1., viewSize.y / 2.55, 1.) * flowEnabled;
  vec3 drift = vec3(time * .006, -time * .009, time * .002);
  vec3 q = p / cloudScale + drift;
  vec4 weather = texture(fields, q * .24 + vec3(.1, .3, .7));
  vec3 warp = weather.rgb - .5;
  float d = letter(materialPoint.xy + warp.xy * .24 * cloudScale) / cloudScale - .035;
  if (d > .27) return 0.;
  q += warp * .16;
  vec4 n = texture(fields, q * .72);
  float radius = .25 + .20 * weather.r;
  float envelope = length(vec2(max(d + radius, 0.), materialPoint.z * .85 / cloudScale)) - radius;
  float billows = .76 * n.g + .18 * n.b + .06 * n.a;
  float shape = envelope + (billows - .46) * .29 + (n.r - .5) * .10;
  if (shape > .11) return 0.;
  if (detail) {
    vec3 convection = vec3(.025 * sin(time * .065 + p.y * 3.), -time * .006, .018 * cos(time * .05 + p.x * 2.));
    vec4 fine = texture(fields, q * 1.7 + convection + vec3(.21, .53, .0));
    float fringe = smoothstep(-.16, .055, envelope);
    shape += (fine.g - .43) * .095;
    shape += (fine.b - .43) * .045;
    shape += (fine.a - .43) * .018 * fringe;
    shape += (texture(fields, q * 4.5 + convection * 2.).g - .42) * .018 * fringe;
  }
  float core = 1. - smoothstep(-.025, .018, shape);
  float vapor = 1. - smoothstep(.005, .065, shape);
  float pockets = smoothstep(.18, .65, weather.r);
  return core * mix(5.6, 8.2, pockets) + vapor * .18;
}
float sunlight(vec3 p) {
  float optical = 0.;
  float distance = .025;
  float stride = .035;
  for (int i = 0; i < 6; i++) {
    optical += density(p + sun * distance, i < 2) * stride;
    distance += stride;
    stride *= 1.65;
  }
  return optical;
}
vec3 toSRGB(vec3 v) {
  return mix(v * 12.92, 1.055 * pow(max(v, vec3(0.)), vec3(1. / 2.4)) - .055, step(vec3(.0031308), v));
}
void main() {
  vec2 p = (uv - .5) * viewSize;
  float stride = 1.7 / steps;
  float midpoint = .5;
  float transmission = 1.;
  vec3 radiance = vec3(0.);
  float opticalSum = 0.;
  float optical = -1.;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= steps || transmission < .008) break;
    float z = .85 - (float(i) + midpoint) * stride;
    vec3 samplePoint = vec3(p * (5. - z) / 5., z);
    float rho = density(samplePoint, true);
    if (rho < .015) { optical = -1.; continue; }
    if (i % 2 == 0 || optical < 0.) {
      optical = sunlight(samplePoint);
    }
    float direct = exp(-optical * 1.35);
    float multiple = exp(-optical * .38);
    float interior = exp(-optical * .065);
    vec3 lighting = vec3(1., .94, .84) * direct * 1.65;
    lighting += vec3(.61, .73, .90) * multiple * .38;
    lighting += vec3(.61, .70, .83) * interior * .46;
    float stepT = exp(-rho * stride * 2.5);
    float weight = transmission * (1. - stepT);
    radiance += weight * lighting;
    opticalSum += weight * optical;
    transmission *= stepT;
  }
  float alpha = 1. - transmission;
  vec3 straight = radiance / max(alpha, .0001);
  straight = vec3(1.) - exp(-straight * 1.4);
  if (diagnostic == 1) straight = vec3(alpha);
  if (diagnostic == 2) straight = vec3(opticalSum / max(alpha, .0001) * .3);
  color = vec4(toSRGB(straight) * alpha, alpha);
}`;

function glyphDistance(fontFamily: string, city: string) {
  const lines = city.split("\n");
  const width = 1024, height = lines.length > 1 ? 640 : 384;
  const mask = document.createElement("canvas");
  mask.width = width;
  mask.height = height;
  const context = mask.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Cloud glyph canvas unavailable");
  context.font = `900 300px ${fontFamily}`;
  const measurements = lines.map(line => context.measureText(line));
  const capHeight = Math.max(...measurements.map(metrics => metrics.actualBoundingBoxAscent));
  const lineHeight = capHeight * 1.35;
  const blockHeight = capHeight + (lines.length - 1) * lineHeight;
  const scale = Math.min(width * .85 / Math.max(...measurements.map(metrics => metrics.width)), height * .74 / blockHeight);
  context.translate(width / 2, (height - blockHeight * scale) / 2);
  context.scale(scale, scale);
  context.lineWidth = 25;
  context.lineJoin = "round";
  lines.forEach((line, index) => {
    const x = -measurements[index].width / 2;
    const y = capHeight + index * lineHeight;
    context.strokeText(line, x, y);
    context.fillText(line, x, y);
  });
  const pixels = context.getImageData(0, 0, width, height).data;
  const inside = new Float32Array(width * height);
  const outside = new Float32Array(width * height);
  for (let i = 0; i < inside.length; i++) {
    const filled = pixels[i * 4 + 3] > 127;
    inside[i] = filled ? 10000 : 0;
    outside[i] = filled ? 0 : 10000;
  }
  for (const field of [inside, outside]) {
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (x) field[i] = Math.min(field[i], field[i - 1] + 1);
      if (y) field[i] = Math.min(field[i], field[i - width] + 1);
      if (x && y) field[i] = Math.min(field[i], field[i - width - 1] + Math.SQRT2);
      if (x < width - 1 && y) field[i] = Math.min(field[i], field[i - width + 1] + Math.SQRT2);
    }
    for (let y = height - 1; y >= 0; y--) for (let x = width - 1; x >= 0; x--) {
      const i = y * width + x;
      if (x < width - 1) field[i] = Math.min(field[i], field[i + 1] + 1);
      if (y < height - 1) field[i] = Math.min(field[i], field[i + width] + 1);
      if (x < width - 1 && y < height - 1) field[i] = Math.min(field[i], field[i + width + 1] + Math.SQRT2);
      if (x && y < height - 1) field[i] = Math.min(field[i], field[i + width - 1] + Math.SQRT2);
    }
  }
  const distance = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = y * width + x;
    distance[(height - y - 1) * width + x] = Math.round(Math.max(0, Math.min(1, .5 + (outside[i] - inside[i]) * 6.8 / width)) * 255);
  }
  return { width, height, distance, cloudScale: Math.min(1, capHeight * scale / (384 * .66)) };
}

export function CloudCanvas({ fontFamily, city, playing }: { fontFamily: string; city: string; playing: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playingRef = useRef(playing);
  const wakeRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    playingRef.current = playing;
    wakeRef.current?.();
  }, [playing]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const review = window.location.pathname.startsWith("/review/");
    const params = new URLSearchParams(window.location.search);
    const flow = new CloudFlow();
    let scene: CloudScene;
    try {
      scene = new CloudScene(canvas, vertex, fragment, flow, review && params.has("cloudCapture"));
    } catch {
      return;
    }
    const gl = scene.renderer.getContext();
    const abort = new AbortController();
    let disposed = false;
    let frame = 0;
    const dispose = () => {
      disposed = true;
      abort.abort();
      cancelAnimationFrame(frame);
      wakeRef.current = null;
      scene.dispose();
    };
    const profiling = review && params.has("cloudProfile");
    let frameTotal = 0, frameSamples = 0;
    const frozen = review && params.has("cloudTime");
    const requestedTime = Number(params.get("cloudTime"));
    let elapsed = frozen && Number.isFinite(requestedTime) ? requestedTime : 0;
    scene.uniforms.diagnostic.value = review ? Number(params.get("cloudDebug")) || 0 : 0;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const details = canvas.closest("details");
    let ready = false, visible = false, previous = 0;
    let width = 0, height = 0;
    const artwork = canvas.parentElement;
    if (!artwork) { dispose(); return; }
    let pointerX = 20, pointerY = 20, pointerActive = 0;
    let cursorX = 20, cursorY = 20, cursorAmount = 0;
    let flowTime = 0;
    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !playingRef.current || reduced.matches) return;
      const bounds = artwork.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - .5) * 6.8;
      const y = (.5 - (event.clientY - bounds.top) / bounds.height) * 2.55;
      if (!pointerActive) { cursorX = x; cursorY = y; }
      pointerX = x; pointerY = y; pointerActive = 1;
    };
    const pointerLeave = () => { pointerActive = 0; };
    artwork.addEventListener("pointermove", pointerMove);
    artwork.addEventListener("pointerleave", pointerLeave);
    const tick = (now: number) => {
      frame = 0;
      if (disposed || !ready || !visible || document.hidden || (details && !details.open) || gl.isContextLost()) { previous = 0; return; }
      const moving = playingRef.current && !reduced.matches && !frozen;
      if (profiling && previous && moving && frameSamples < 180) {
        frameTotal += now - previous;
        frameSamples++;
        canvas.dataset.frameMs = (frameTotal / frameSamples).toFixed(2);
      }
      const delta = previous ? Math.min((now - previous) / 1000, .1) : 1 / 60;
      if (previous && moving) elapsed += delta;
      if (moving) {
        const follow = 1 - Math.exp(-delta * 9);
        const previousX = cursorX, previousY = cursorY;
        cursorX += (pointerX - cursorX) * follow;
        cursorY += (pointerY - cursorY) * follow;
        if (pointerActive) flow.stir(previousX, previousY, cursorX, cursorY, .3 * scene.uniforms.cloudScale.value);
        cursorAmount += (pointerActive - cursorAmount) * (1 - Math.exp(-delta * 8));
        flowTime += delta;
        let substeps = 0;
        while (flowTime >= 1 / 60 && substeps < 4) {
          flow.step(1 / 60);
          flowTime -= 1 / 60;
          substeps++;
        }
        flowTime = Math.min(flowTime, 1 / 60);
      }
      previous = moving ? now : 0;
      scene.draw(elapsed, !reduced.matches);
      canvas.dataset.ready = "true";
      if (review) {
        canvas.dataset.cloudTime = elapsed.toFixed(3);
        canvas.dataset.cursor = cursorAmount.toFixed(3);
      }
      if (moving) frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame && !disposed) frame = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const ratio = Math.min(devicePixelRatio, bounds.width > 900 ? 1 : 1.25);
      const nextWidth = Math.round(bounds.width * ratio);
      const nextHeight = Math.round(bounds.height * ratio);
      if (nextWidth === width && nextHeight === height) return;
      canvas.dataset.ready = "false";
      width = nextWidth;
      height = nextHeight;
      scene.resize(width, height);
      scene.uniforms.steps.value = bounds.width < 600 ? 96 : 128;
      wake();
    };
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(canvas);
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; previous = 0; wake(); });
    visibility.observe(canvas);
    const lost = () => { canvas.dataset.ready = "false"; cancelAnimationFrame(frame); frame = 0; };
    canvas.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", wake);
    details?.addEventListener("toggle", wake);
    reduced.addEventListener("change", wake);
    Promise.all([
      document.fonts.load(`900 300px ${fontFamily}`),
      fetch("/materials/cloud-noise.bin", { signal: abort.signal }).then(response => {
        if (!response.ok) throw new Error("Cloud density fields unavailable");
        return response.arrayBuffer();
      }),
    ]).then(([, bytes]) => {
      if (disposed || gl.isContextLost()) return;
      if (bytes.byteLength !== 64 ** 3 * 4) throw new Error("Invalid cloud density fields");
      const mask = glyphDistance(fontFamily, city);
      scene.uniforms.cloudScale.value = mask.cloudScale;
      scene.uniforms.viewSize.value.set(6.8, 6.8 * mask.height / mask.width);
      flow.clear();
      scene.setCloud(mask, bytes);
      ready = true;
      resize();
      wake();
    }).catch(error => {
      if (!disposed) {
        canvas.dataset.ready = "false";
        console.error("Cloud artwork unavailable:", error);
      }
    });
    return () => {
      artwork.removeEventListener("pointermove", pointerMove);
      artwork.removeEventListener("pointerleave", pointerLeave);
      sizeObserver.disconnect();
      visibility.disconnect();
      canvas.removeEventListener("webglcontextlost", lost);
      document.removeEventListener("visibilitychange", wake);
      details?.removeEventListener("toggle", wake);
      reduced.removeEventListener("change", wake);
      canvas.dataset.ready = "false";
      dispose();
    };
  }, [fontFamily, city]);
  return <canvas ref={canvasRef} className="cloud-canvas" aria-hidden="true" />;
}
