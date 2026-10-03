"use client";

import { useEffect, useRef } from "react";
import type { CredentialRefractionScene } from "./credential-refraction-scene";

export function CredentialRefraction({ inscription }: { inscription: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialLabel = useRef(inscription);
  const changeRef = useRef<((label: string) => void) | null>(null);

  useEffect(() => { changeRef.current?.(inscription); }, [inscription]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const area = canvas.parentElement;
    if (!area) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let scene: CredentialRefractionScene | undefined;
    let disposed = false, visible = false, loading = false, contextLost = false;
    let frame = 0, previous = 0, changeTime = 0;
    let x = 0, y = 0, targetX = 0, targetY = 0;
    let current = initialLabel.current, pending = initialLabel.current;
    const font = getComputedStyle(area).fontFamily;
    const draw = (now: number) => {
      frame = 0;
      if (!scene || disposed || contextLost || !visible || document.hidden) { previous = 0; return; }
      if (!reduced.matches && previous && now - previous < 32) { frame = requestAnimationFrame(draw); return; }
      const delta = previous ? Math.min((now - previous) / 1000, .05) : 1 / 60;
      previous = now;
      const follow = reduced.matches ? 1 : 1 - Math.exp(-delta * 9);
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
      canvas.dataset.ready = "true";
      canvas.dataset.moving = String(moving);
      if (moving || !reduced.matches) frame = requestAnimationFrame(draw);
      else previous = 0;
    };
    const wake = () => {
      if (!frame && scene && visible && !document.hidden && !disposed && !contextLost) frame = requestAnimationFrame(draw);
    };
    const resize = () => {
      if (!scene) return;
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const surface = getComputedStyle(area).getPropertyValue("--paper").trim() || "#efeff0";
      scene.resize(bounds.width, bounds.height, bounds.width < 700, surface);
      wake();
    };
    const initialize = async () => {
      if (loading || scene || disposed) return;
      loading = true;
      try {
        const [{ CredentialRefractionScene }] = await Promise.all([
          import("./credential-refraction-scene"), document.fonts.load(`400 380px ${font}`),
        ]);
        if (disposed) return;
        scene = new CredentialRefractionScene(canvas);
        current = pending;
        scene.setInscription(current, font);
        resize();
      } catch {
        canvas.dataset.ready = "false";
      }
    };
    changeRef.current = label => { pending = label; changeTime = performance.now(); wake(); };
    const pointer = (event: PointerEvent) => {
      if (reduced.matches || event.pointerType === "touch") return;
      const bounds = area.getBoundingClientRect();
      targetX = (event.clientX - bounds.left) / bounds.width * 2 - 1;
      targetY = (event.clientY - bounds.top) / bounds.height * 2 - 1;
      wake();
    };
    const reset = () => { targetX = 0; targetY = 0; wake(); };
    const lost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      canvas.dataset.ready = "false";
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const restored = () => { contextLost = false; resize(); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { void initialize(); wake(); }
      else { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    }, { rootMargin: "150px" });
    observer.observe(canvas);
    const size = new ResizeObserver(resize);
    size.observe(canvas);
    const theme = new MutationObserver(resize);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    area.addEventListener("pointermove", pointer);
    area.addEventListener("pointerleave", reset);
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    document.addEventListener("visibilitychange", wake);
    reduced.addEventListener("change", reset);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect(); size.disconnect(); theme.disconnect();
      area.removeEventListener("pointermove", pointer);
      area.removeEventListener("pointerleave", reset);
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
      document.removeEventListener("visibilitychange", wake);
      reduced.removeEventListener("change", reset);
      changeRef.current = null;
      scene?.dispose();
    };
  }, []);

  return <>
    <canvas ref={canvasRef} className="credential-refraction" aria-hidden="true" />
    <span className="credential-refraction-fallback" aria-hidden="true">{inscription}</span>
  </>;
}
