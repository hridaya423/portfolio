"use client";

import { useEffect, useRef } from "react";
import { CloudScene } from "./cloud-scene";

const vertex = `
in vec3 position;
out vec2 uv;
void main() {
  uv = position.xy * .5 + .5;
  gl_Position = vec4(position, 1.);
}`;

const fragment = `
precision highp float;
precision highp sampler3D;
in vec2 uv;
out vec4 color;
uniform sampler3D fields;
uniform float time;
uniform float reveal;
uniform float cursor;
uniform float aspect;
uniform float gust;
float puff(vec3 p, vec3 center, vec3 radius) {
  return (length((p - center) / radius) - 1.) * min(radius.x, min(radius.y, radius.z));
}
float density(vec3 p) {
  vec3 q = vec3((p.x - cursor) * aspect, p.y / max(reveal, .001), p.z);
  q.x /= mix(.3, 1., reveal);
  q.x += gust * q.y * 1.8;
  float lift = sin(time * .95) * .016;
  float shape = puff(q, vec3(-.08, .006, 0.), vec3(.72, .012, .045));
  shape = min(shape, puff(q, vec3(-.34, .016, .01), vec3(.16, .03, .065)));
  shape = min(shape, puff(q, vec3(-.12 + sin(time * .7) * .025, .04 - lift * .5, -.01), vec3(.13, .062, .085)));
  shape = min(shape, puff(q, vec3(.025, .07 + lift, .015), vec3(.11, .094 + lift * .5, .085)));
  shape = min(shape, puff(q, vec3(.13 + cos(time * .8) * .035, .035 - lift * .6, .04), vec3(.10, .047, .07)));
  shape = min(shape, puff(q, vec3(.27, .015, -.01), vec3(.13, .027, .05)));
  float drift = fract(time * .18);
  float wisp = puff(q, vec3(.15 + drift * .46, .025 + sin(drift * 3.14159) * .05, .025), vec3(.09, .022, .035));
  shape = min(shape, wisp + abs(drift - .5) * .055);
  vec4 n = texture(fields, q * .85 + vec3(time * .024, -time * .036, .3));
  vec4 fine = texture(fields, q * 2.2 + vec3(.3, .7, time * .018));
  shape += (n.g - .45) * .032 + (fine.g - .45) * .008;
  float edge = smoothstep(.01, .08, p.x) * (1. - smoothstep(.92, .99, p.x));
  return (1. - smoothstep(-.008, .01, shape)) * edge * smoothstep(-.016, .008, p.y) * 12.;
}
void main() {
  vec2 p = vec2(uv.x, uv.y * .48 - .06);
  vec3 light = normalize(vec3(-.5, .8, .65));
  float transmission = 1.;
  vec3 radiance = vec3(0.);
  for (int i = 0; i < 40; i++) {
    vec3 samplePoint = vec3(p, .24 - (float(i) + .5) * .012);
    float rho = density(samplePoint);
    if (rho < .01) continue;
    float shadow = 0.;
    for (int j = 1; j <= 4; j++) {
      shadow += density(samplePoint + light * float(j) * .045) * .045;
    }
    vec3 lighting = vec3(.69, .75, .83) + vec3(.31, .25, .17) * exp(-shadow * 1.4);
    float opacity = 1. - exp(-rho * .012 * 2.8);
    radiance += transmission * opacity * lighting;
    transmission *= 1. - opacity;
    if (transmission < .01) break;
  }
  color = vec4(radiance, 1. - transmission) * smoothstep(0., .18, reveal);
}`;

export function CloudDivider() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const summary = canvas?.closest("summary");
    const details = summary?.closest("details");
    if (!canvas || !summary || !details) return;
    const abort = new AbortController();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = matchMedia("(hover: hover)");
    let scene: CloudScene | undefined;
    let loading = false, disposed = false, visible = true;
    let hovered = false, focused = false, frame = 0, previous = 0, time = 0;
    let targetX = .6;
    const uniforms = { reveal: { value: 0 }, cursor: { value: .6 }, aspect: { value: 8 }, gust: { value: 0 } };
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      scene?.resize(Math.round(bounds.width * Math.min(devicePixelRatio, 1.5)), Math.round(bounds.height * Math.min(devicePixelRatio, 1.5)));
      uniforms.aspect.value = bounds.width / bounds.height * .48;
    };
    const tick = (now: number) => {
      frame = 0;
      if (!scene || disposed || !visible || document.hidden) { previous = 0; return; }
      const active = !details.open && (hovered || focused);
      const dt = previous ? Math.min((now - previous) / 1000, .05) : 1 / 60;
      previous = now;
      const still = reduced.matches || (focused && !hovered);
      uniforms.reveal.value = still ? Number(active) : uniforms.reveal.value + (Number(active) - uniforms.reveal.value) * (1 - Math.exp(-dt * (active ? 6 : 3.5)));
      uniforms.cursor.value += (targetX - uniforms.cursor.value) * (1 - Math.exp(-dt * 7));
      const gust = Math.max(-1, Math.min(1, (targetX - uniforms.cursor.value) * uniforms.aspect.value * 3));
      uniforms.gust.value += ((still ? 0 : gust) - uniforms.gust.value) * (1 - Math.exp(-dt * 4));
      if (!still) time += dt;
      if (!active && uniforms.reveal.value < .003) uniforms.reveal.value = 0;
      scene.draw(still ? 0 : time, false);
      if (!still && (active || uniforms.reveal.value > 0)) frame = requestAnimationFrame(tick);
      else previous = 0;
    };
    const wake = () => {
      if (scene && !frame && !disposed) frame = requestAnimationFrame(tick);
    };
    const activate = () => {
      wake();
      if (scene || loading || details.open || !(hovered || focused)) return;
      loading = true;
      fetch("/materials/cloud-noise.bin", { signal: abort.signal }).then(response => {
        if (!response.ok) throw new Error("Cloud divider density unavailable");
        return response.arrayBuffer();
      }).then(bytes => {
        if (disposed) return;
        if (bytes.byteLength !== 64 ** 3 * 4) throw new Error("Invalid cloud density fields");
        scene = new CloudScene(canvas, vertex, fragment, { width: 1, height: 1, depth: 1, pixels: new Float32Array(4) }, false);
        Object.assign(scene.uniforms, uniforms);
        scene.setCloud({ width: 1, height: 1, distance: new Uint8Array([255]) }, bytes);
        resize();
        wake();
      }).catch(() => { loading = false; });
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !finePointer.matches) return;
      const bounds = summary.getBoundingClientRect();
      targetX = Math.max(.12, Math.min(.88, (event.clientX - bounds.left) / bounds.width));
      if (!hovered) uniforms.cursor.value = targetX;
      hovered = true;
      activate();
    };
    const leave = () => { hovered = false; wake(); };
    const focus = () => { focused = summary.matches(":focus-visible"); activate(); };
    const blur = () => { focused = false; wake(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); });
    observer.observe(summary);
    const size = new ResizeObserver(() => { resize(); wake(); });
    size.observe(canvas);
    summary.addEventListener("pointermove", move);
    summary.addEventListener("pointerleave", leave);
    summary.addEventListener("focus", focus);
    summary.addEventListener("blur", blur);
    details.addEventListener("toggle", wake);
    reduced.addEventListener("change", wake);
    document.addEventListener("visibilitychange", wake);
    return () => {
      disposed = true;
      abort.abort();
      cancelAnimationFrame(frame);
      observer.disconnect();
      size.disconnect();
      summary.removeEventListener("pointermove", move);
      summary.removeEventListener("pointerleave", leave);
      summary.removeEventListener("focus", focus);
      summary.removeEventListener("blur", blur);
      details.removeEventListener("toggle", wake);
      reduced.removeEventListener("change", wake);
      document.removeEventListener("visibilitychange", wake);
      scene?.dispose();
    };
  }, []);
  return <canvas ref={ref} className="cloud-divider" aria-hidden="true" />;
}
