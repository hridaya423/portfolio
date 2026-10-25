"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useReducedMotion } from "motion/react";
import { getStage, type Frame } from "@/components/portfolio/gl/stage";

const vertexSource = `
in vec3 position;
out vec2 uv;
void main() {
  uv = position.xy * .5 + .5;
  gl_Position = vec4(position, 1.);
}`;

const fragmentSource = `
precision highp float;
uniform sampler2D ink;
uniform vec2 size;
uniform vec2 lens;
uniform vec3 color;
uniform float strength;
uniform float phase;
in vec2 uv;
out vec4 fragColor;
void main() {
  vec2 pixel = uv * size;
  vec2 q = pixel - lens;
  float radius = max(size.y * .48, 20.);
  float rn = length(q) / radius;
  float envelope = 1. - smoothstep(.25, 1., rn);
  float ripple = sin(rn * 13. - phase) * .048;
  float mag = 1. + strength * envelope * (.075 * rn * rn + ripple);
  vec2 source = (lens + q / mag) / size;
  vec2 split = q / max(length(q), 1.) * .85 / size * strength * envelope;
  float r = texture(ink, source + split).a;
  float g = texture(ink, source).a;
  float b = texture(ink, source - split).a;
  float alpha = max(r, max(g, b));
  vec3 edge = vec3(r, g, b);
  vec3 chroma = mix(color * alpha, edge, .28 * strength);
  fragColor = vec4(chroma, alpha);
}`;

const OPENING = 1100;
const PADDING = 12;

export function IdeaEffect() {
  const word = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const arrived = useRef(false);
  const reducedMotion = useReducedMotion();
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    let frame = 0;
    const afterLoad = () => {
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setPainted(true));
      });
    };
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", afterLoad);
    };
  }, []);

  useEffect(() => {
    const element = word.current;
    const surface = canvas.current;
    if (!element || !surface || reducedMotion || !painted) return;
    const stage = getStage();
    if (!stage) return;

    const bitmap = document.createElement("canvas");
    const texture = new THREE.CanvasTexture(bitmap);
    texture.minFilter = texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    const uniforms = {
      ink: { value: texture },
      size: { value: new THREE.Vector2(1, 1) },
      lens: { value: new THREE.Vector2() },
      color: { value: new THREE.Vector3() },
      strength: { value: 0 },
      phase: { value: 0 },
    };
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    // Premultiplied output onto a transparent canvas, as the word sits on the page.
    const material = new THREE.RawShaderMaterial({ vertexShader: vertexSource, fragmentShader: fragmentSource, glslVersion: THREE.GLSL3, uniforms, depthTest: false, depthWrite: false, blending: THREE.NoBlending });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    const scene = new THREE.Scene().add(mesh);
    const camera = new THREE.Camera();

    let hovering = false;
    let strength = 0;
    let elapsed = arrived.current ? OPENING : 0;
    let width = 0, height = 0;
    let lensX = 0, lensY = 0, targetX = 0, targetY = 0;
    let rasterized = false;

    function rasterize() {
      // Fonts can finish loading while the page is being swapped out; there's nothing to draw then.
      if (!element!.isConnected) return;
      const style = getComputedStyle(element!);
      const rgb = style.color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
      if (!rgb) return;
      const bounds = element!.getBoundingClientRect();
      width = bounds.width + PADDING * 2;
      height = bounds.height + PADDING * 2;
      const scale = Math.min(window.devicePixelRatio || 1, 2) * 2;
      bitmap.width = Math.ceil(width * scale);
      bitmap.height = Math.ceil(height * scale);
      const context = bitmap.getContext("2d");
      if (!context) return;
      context.scale(scale, scale);
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      context.letterSpacing = style.letterSpacing;
      context.fillStyle = "white";
      const metrics = context.measureText("idea");
      const baseline = (bounds.height - metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent) / 2 + metrics.fontBoundingBoxAscent;
      context.fillText("idea", PADDING, PADDING + baseline);
      texture.dispose();
      texture.needsUpdate = true;
      uniforms.color.value.set(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
      uniforms.size.value.set(width, height);
      lensX = targetX = width * 0.7;
      lensY = targetY = height * 0.5;
      rasterized = true;
      handle.wake();
    }

    const render = (renderer: THREE.WebGLRenderer, frame: Frame) => {
      if (!rasterized) return false;
      const delta = frame.first ? 16 : Math.min(frame.delta * 1000, 40);
      elapsed = Math.min(OPENING, elapsed + delta);
      const opening = elapsed < OPENING;
      const targetStrength = opening ? Math.sin((elapsed / OPENING) * Math.PI) : hovering ? 0.8 : 0;
      strength += (targetStrength - strength) * (1 - Math.exp(-delta / 45));
      lensX += (targetX - lensX) * (1 - Math.exp(-delta / 65));
      lensY += (targetY - lensY) * (1 - Math.exp(-delta / 65));
      if (!opening && !hovering && strength < 0.008) strength = 0;
      uniforms.lens.value.set(opening ? width * (0.2 + (elapsed / OPENING) * 0.65) : lensX, opening ? height * 0.52 : lensY);
      uniforms.strength.value = strength;
      uniforms.phase.value = elapsed / 180;
      renderer.render(scene, camera);
      // Hand over to the lens once and stay there: swapping back to the DOM text
      // after every hover shows as a one-pixel jump between the two renderings.
      if (strength > 0) element.setAttribute("data-lens-ready", "true");
      if (!opening) arrived.current = true;
      const moving = Math.abs(lensX - targetX) + Math.abs(lensY - targetY) > 0.1;
      return opening || Math.abs(targetStrength - strength) > 0.008 || (hovering && moving);
    };

    const handle = stage.add({
      placeholder: surface,
      ratio: () => Math.min(devicePixelRatio || 1, 2),
      priority: () => hovering ? 4 : 1,
      snapshot: false,
      render,
      // Without the live canvas, the DOM word is the only rendering of "idea".
      detach: () => element.removeAttribute("data-lens-ready"),
      fail: () => element.removeAttribute("data-lens-ready"),
    });

    // On touch there's no hover, so a tap sends the lens across the word again.
    function pointerDown(event: PointerEvent) {
      if (event.pointerType === "mouse") return;
      elapsed = 0;
      handle.wake();
    }
    function pointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const bounds = element!.getBoundingClientRect();
      targetX = event.clientX - bounds.left + PADDING;
      targetY = height - (event.clientY - bounds.top + PADDING);
      hovering = true;
      handle.wake();
    }
    function pointerLeave() {
      hovering = false;
      handle.wake();
    }
    const resize = new ResizeObserver(rasterize);
    let disposed = false;
    document.fonts.ready.then(() => {
      if (disposed) return;
      rasterize();
      resize.observe(element);
    });
    document.fonts.addEventListener("loadingdone", rasterize);
    element.addEventListener("pointermove", pointerMove);
    element.addEventListener("pointerleave", pointerLeave);
    element.addEventListener("pointerdown", pointerDown);
    return () => {
      disposed = true;
      resize.disconnect();
      document.fonts.removeEventListener("loadingdone", rasterize);
      element.removeEventListener("pointermove", pointerMove);
      element.removeEventListener("pointerleave", pointerLeave);
      element.removeEventListener("pointerdown", pointerDown);
      handle.remove();
      element.removeAttribute("data-lens-ready");
      texture.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [reducedMotion, painted]);

  return (
    <span className="idea-word" ref={word}>
      <span className="idea-fallback">idea</span>
      <canvas ref={canvas} aria-hidden="true" />
    </span>
  );
}
