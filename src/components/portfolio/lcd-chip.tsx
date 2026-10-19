"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { GLYPH_CHARACTERS, GLYPH_HEIGHT, GLYPH_WIDTH, glyphRows } from "./dot-matrix-font";

const PAD = 2;

const fit = (text: string, columns: number, align: "left" | "center") => {
  const trimmed = text.toUpperCase().slice(0, columns);
  const left = align === "center" ? Math.floor((columns - trimmed.length) / 2) : 0;
  return (" ".repeat(left) + trimmed).padEnd(columns, " ");
};

/**
 * A single line of the site's dot-matrix display: light shining through a
 * perforated surface, as on the tray's front and across the finale's wall.
 * Text changes scramble into place; `hoverText` shows while the nearest
 * `[data-lcd-host]` ancestor is hovered or holds focus.
 */
export function LcdChip({
  text,
  hoverText,
  columns,
  dot = 2.4,
  align = "center",
  className,
  label,
}: {
  text: string;
  hoverText?: string;
  columns: number;
  dot?: number;
  align?: "left" | "center";
  className?: string;
  /** Accessible text; omit when the chip repeats nearby content. */
  label?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setTarget = useRef<((value: string) => void) | null>(null);
  const width = (columns * (GLYPH_WIDTH + 1) - 1 + PAD * 2) * dot;
  const height = (GLYPH_HEIGHT + PAD * 2) * dot;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    let target = fit(text, columns, align);
    let shown = target.split("");
    let settle = new Array<number>(columns).fill(0);
    let frame = 0;

    const draw = () => {
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const radius = dot * 0.36;
      // Only lit dots show, as on the tray's front: unlit, the surface looks blank.
      const lit: [number, number][] = [];
      shown.forEach((character, column) => {
        const rows = glyphRows(character);
        for (let y = 0; y < GLYPH_HEIGHT; y++) for (let x = 0; x < GLYPH_WIDTH; x++) {
          if (rows[y][x] === "1")
            lit.push([(PAD + column * (GLYPH_WIDTH + 1) + x + 0.5) * dot, (PAD + y + 0.5) * dot]);
        }
      });
      // Light behind the metal: a soft haze, the lit hole, and a hot centre.
      const layer = (fill: string, size: number, blur = 0) => {
        context.save();
        context.fillStyle = fill;
        if (blur) {
          context.shadowColor = "rgba(255, 92, 36, 0.55)";
          context.shadowBlur = blur * ratio;
        }
        context.beginPath();
        for (const [cx, cy] of lit) {
          context.moveTo(cx + size, cy);
          context.arc(cx, cy, size, 0, Math.PI * 2);
        }
        context.fill();
        context.restore();
      };
      layer("#e85d2a", radius * 1.05, dot * 1.4);
      layer("#ff8a55", radius * 0.62);
      canvas.dataset.ready = "true";
    };

    const tick = (now: number) => {
      frame = 0;
      let moving = false;
      shown = shown.map((character, column) => {
        if (now >= settle[column]) return target[column];
        moving = true;
        return target[column] === " " && Math.random() < 0.5
          ? " "
          : GLYPH_CHARACTERS[1 + Math.floor(Math.random() * (GLYPH_CHARACTERS.length - 2))];
      });
      draw();
      if (moving) frame = requestAnimationFrame(tick);
    };

    setTarget.current = (value) => {
      const next = fit(value, columns, align);
      if (next === target) return;
      target = next;
      if (reduced.matches) {
        shown = target.split("");
        draw();
        return;
      }
      const now = performance.now();
      settle = settle.map((_, column) =>
        shown[column] === target[column] ? 0 : now + 90 + column * 38 + Math.random() * 60,
      );
      if (!frame) frame = requestAnimationFrame(tick);
    };

    draw();
    const host = hoverText ? canvas.closest<HTMLElement>("[data-lcd-host]") : null;
    const enter = () => setTarget.current?.(hoverText ?? text);
    const leave = () => {
      if (host?.matches(":hover, :focus-within")) return;
      setTarget.current?.(text);
    };
    host?.addEventListener("pointerenter", enter);
    host?.addEventListener("pointerleave", leave);
    host?.addEventListener("focusin", enter);
    host?.addEventListener("focusout", leave);
    return () => {
      cancelAnimationFrame(frame);
      setTarget.current = null;
      host?.removeEventListener("pointerenter", enter);
      host?.removeEventListener("pointerleave", leave);
      host?.removeEventListener("focusin", enter);
      host?.removeEventListener("focusout", leave);
    };
    // The canvas is set up once per geometry; text changes go through setTarget.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, dot, width, height, align, hoverText]);

  useEffect(() => {
    setTarget.current?.(text);
  }, [text]);

  return (
    <span
      className={`lcd-chip${className ? ` ${className}` : ""}`}
      style={{ "--lcd-w": `${width}px`, "--lcd-h": `${height}px` } as CSSProperties}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <canvas ref={canvasRef} />
      <span className="lcd-chip-fallback">{text}</span>
    </span>
  );
}
