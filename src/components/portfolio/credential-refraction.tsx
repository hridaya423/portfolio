"use client";

import { useEffect, useRef } from "react";
import type * as THREE from "three";
import { CredentialRefractionScene } from "./credential-refraction-scene";
import { getStage, type Frame, type ViewHandle } from "./gl/stage";

export function CredentialRefraction({ inscription }: { inscription: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialLabel = useRef(inscription);
  const changeRef = useRef<((label: string) => void) | null>(null);

  useEffect(() => { changeRef.current?.(inscription); }, [inscription]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const area = canvas?.parentElement;
    const stage = getStage();
    if (!canvas || !area || !stage) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");
    let scene: CredentialRefractionScene | undefined;
    let handle: ViewHandle | undefined;
    let disposed = false, touching = false, surfaceDirty = true;
    let changeTime = 0, size = "";
    let x = 0, y = 0, targetX = 0, targetY = 0;
    let current = initialLabel.current, pending = initialLabel.current;
    const font = getComputedStyle(area).fontFamily;

    const render = (renderer: THREE.WebGLRenderer, frame: Frame) => {
      if (!scene) {
        scene = new CredentialRefractionScene(renderer, frame.settings.caustics);
        current = pending;
        scene.setInscription(current, font);
      }
      const key = `${frame.cssWidth}x${frame.cssHeight}`;
      if (key !== size || surfaceDirty) {
        size = key;
        surfaceDirty = false;
        const surface = getComputedStyle(area).getPropertyValue("--paper").trim() || "#efeff0";
        scene.resize(frame.cssWidth, frame.cssHeight, frame.cssWidth < 700, surface);
      }
      const now = frame.now;
      // Without a pointer the light wanders on its own, so phones see the water move too.
      if (coarse.matches && !touching && !reduced.matches) {
        targetX = Math.sin(now * .00023) * .45;
        targetY = Math.sin(now * .00017 + 1) * .3;
      }
      const follow = reduced.matches ? 1 : 1 - Math.exp(-Math.min(frame.delta, .05) * 9);
      x += (targetX - x) * follow;
      y += (targetY - y) * follow;
      const progress = reduced.matches ? 1 : Math.min(1, (now - changeTime) / 550);
      if (current !== pending && progress >= .32) {
        current = pending;
        scene.setInscription(current, font);
      }
      const focus = progress < .32 ? 1 - progress / .32 : Math.min(1, (progress - .32) / .68);
      const moving = Math.abs(targetX - x) + Math.abs(targetY - y) > .0005 || progress < 1;
      scene.draw(x, y, focus, reduced.matches ? 0 : now / 1000);
      canvas.dataset.moving = String(moving);
      return moving || !reduced.matches;
    };

    changeRef.current = label => { pending = label; changeTime = performance.now(); handle?.wake(); };
    const pointer = (event: PointerEvent) => {
      if (reduced.matches) return;
      touching = event.pointerType !== "mouse";
      const bounds = area.getBoundingClientRect();
      targetX = (event.clientX - bounds.left) / bounds.width * 2 - 1;
      targetY = (event.clientY - bounds.top) / bounds.height * 2 - 1;
      handle?.wake();
    };
    const reset = () => { touching = false; targetX = 0; targetY = 0; handle?.wake(); };
    const theme = new MutationObserver(() => { surfaceDirty = true; handle?.wake(); });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    area.addEventListener("pointermove", pointer);
    area.addEventListener("pointerleave", reset);
    area.addEventListener("pointercancel", reset);
    area.addEventListener("pointerup", reset);
    reduced.addEventListener("change", reset);
    document.fonts.load(`500 380px ${font}`).catch(() => {}).then(() => {
      if (disposed) return;
      handle = stage.add({
        placeholder: canvas,
        ratio: () => Math.min(devicePixelRatio, 1.5),
        fps: settings => settings.caustics.fps,
        priority: () => touching ? 3 : 1,
        render,
      });
    });
    return () => {
      disposed = true;
      theme.disconnect();
      area.removeEventListener("pointermove", pointer);
      area.removeEventListener("pointerleave", reset);
      area.removeEventListener("pointercancel", reset);
      area.removeEventListener("pointerup", reset);
      reduced.removeEventListener("change", reset);
      changeRef.current = null;
      handle?.remove();
      scene?.dispose();
    };
  }, []);

  return <>
    <canvas ref={canvasRef} className="credential-refraction" aria-hidden="true" />
    <span className="credential-refraction-fallback" aria-hidden="true">{inscription}</span>
  </>;
}
