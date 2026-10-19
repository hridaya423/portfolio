"use client";

import { useEffect, useRef } from "react";
import { GLYPH_HEIGHT, dotMatrix } from "./dot-matrix-font";

const WORD = "HELLO";
const PAD_X = 3;
const PAD_Y = 2;
const { dots: LIT, columns: WORD_COLUMNS } = dotMatrix(WORD);
const COLUMNS = WORD_COLUMNS + PAD_X * 2;
const ROWS = GLYPH_HEIGHT + PAD_Y * 2;
const LIT_SET = new Set(LIT.map(([x, y]) => (y + PAD_Y) * COLUMNS + x + PAD_X));

/** Large LED panel that bookends the tray's "HELLO" display. */
export function HelloBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const board = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !board || !context) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const count = COLUMNS * ROWS;
    const word = new Float32Array(count);
    const trail = new Float32Array(count);
    let width = 0, height = 0, pitch = 0, ratio = 1;
    let frame = 0, previous = 0, visible = false, booted = false, bootStart = 0;
    let pointerX = -1e4, pointerY = -1e4, pointerInside = false;
    const ripples: { x: number; y: number; start: number }[] = [];
    const glow = document.createElement("canvas");

    const paintGlow = () => {
      const size = Math.max(8, Math.round(pitch * 2.4 * ratio));
      glow.width = glow.height = size;
      const g = glow.getContext("2d")!;
      const gradient = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, "rgba(236, 112, 66, .55)");
      gradient.addColorStop(0.35, "rgba(232, 104, 60, .18)");
      gradient.addColorStop(1, "rgba(232, 104, 60, 0)");
      g.fillStyle = gradient;
      g.fillRect(0, 0, size, size);
    };

    const resize = () => {
      const bounds = board.getBoundingClientRect();
      if (!bounds.width) return;
      ratio = Math.min(devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      pitch = width / COLUMNS;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      paintGlow();
      draw(performance.now());
    };

    const draw = (now: number) => {
      const radius = pitch * 0.34;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      for (let i = 0; i < count; i++) {
        const x = (i % COLUMNS + 0.5) * pitch;
        const y = (Math.floor(i / COLUMNS) + 0.5) * (height / ROWS);
        // Recessed, unlit socket.
        context.fillStyle = "rgba(24, 25, 24, .05)";
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        let near = 0;
        if (pointerInside) {
          const distance = Math.hypot(x - pointerX, y - pointerY) / pitch;
          near = Math.max(0, 1 - distance / 2.6);
        }
        let ring = 0;
        for (const ripple of ripples) {
          const front = ((now - ripple.start) / 1000) * 26;
          const distance = Math.hypot(x - ripple.x, y - ripple.y) / pitch;
          const fade = Math.max(0, 1 - (now - ripple.start) / 1400);
          ring = Math.max(ring, Math.exp(-((distance - front) ** 2) / 2.2) * fade);
        }
        const light = Math.min(1, word[i] + trail[i] * 0.7 + ring * 0.85);
        if (light < 0.01) continue;
        const swell = 1 + near * 0.16 * word[i];
        context.globalAlpha = light;
        const glowSize = pitch * 2.4 * swell;
        context.drawImage(glow, x - glowSize / 2, y - glowSize / 2, glowSize, glowSize);
        context.fillStyle = "rgb(222, 98, 58)";
        context.beginPath();
        context.arc(x, y, radius * swell, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = light * 0.75;
        context.fillStyle = "rgb(255, 196, 160)";
        context.beginPath();
        context.arc(x - radius * 0.22, y - radius * 0.26, radius * 0.38 * swell, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
      }
    };

    const tick = (now: number) => {
      frame = 0;
      if (!visible || document.hidden) { previous = 0; return; }
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 1 / 60;
      previous = now;
      // Keep running for the whole power-on sweep, padding columns included.
      let active = booted && now - bootStart < COLUMNS * 26 + 400;
      for (let i = 0; i < count; i++) {
        const column = i % COLUMNS;
        const target = LIT_SET.has(i) && booted && now - bootStart > column * 26 ? 1 : 0;
        if (target && word[i] < 1) {
          // A brief flicker as each column powers on, then a settle.
          const age = now - bootStart - column * 26;
          word[i] = age < 90 ? (Math.random() > 0.4 ? 0.85 : 0.25) : Math.min(1, word[i] + delta * 6);
          active = true;
        }
        if (pointerInside) {
          const x = (column + 0.5) * pitch;
          const y = (Math.floor(i / COLUMNS) + 0.5) * (height / ROWS);
          const distance = Math.hypot(x - pointerX, y - pointerY) / pitch;
          if (distance < 0.9) trail[i] = Math.max(trail[i], 1 - distance / 0.9);
        }
        if (trail[i] > 0.005) {
          trail[i] *= Math.exp(-delta * 2.6);
          active = true;
        } else trail[i] = 0;
      }
      while (ripples.length && now - ripples[0].start > 1400) ripples.shift();
      draw(now);
      if (active || ripples.length || pointerInside) frame = requestAnimationFrame(tick);
      else previous = 0;
    };

    const wake = () => {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(tick);
    };

    const local = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      return [event.clientX - bounds.left, event.clientY - bounds.top] as const;
    };
    const move = (event: PointerEvent) => {
      if (reduced.matches || event.pointerType === "touch") return;
      [pointerX, pointerY] = local(event);
      pointerInside = true;
      wake();
    };
    const leave = () => { pointerInside = false; wake(); };
    const press = (event: PointerEvent) => {
      if (reduced.matches) return;
      const [x, y] = local(event);
      ripples.push({ x, y, start: performance.now() });
      wake();
    };

    const showAll = () => {
      booted = true;
      for (const index of LIT_SET) word[index] = 1;
      draw(performance.now());
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !booted && entry.intersectionRatio > 0.45) {
        if (reduced.matches) showAll();
        else { booted = true; bootStart = performance.now(); }
      }
      wake();
    }, { threshold: [0, 0.45] });
    const sizes = new ResizeObserver(resize);
    sizes.observe(board);
    observer.observe(board);
    board.addEventListener("pointermove", move);
    board.addEventListener("pointerleave", leave);
    board.addEventListener("pointerdown", press);
    document.addEventListener("visibilitychange", wake);
    if (reduced.matches) showAll();
    canvas.dataset.ready = "true";

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      sizes.disconnect();
      board.removeEventListener("pointermove", move);
      board.removeEventListener("pointerleave", leave);
      board.removeEventListener("pointerdown", press);
      document.removeEventListener("visibilitychange", wake);
    };
  }, []);

  return (
    <div
      className="hello-board"
      style={{ aspectRatio: `${COLUMNS} / ${ROWS}` }}
      aria-hidden="true"
    >
      <svg className="hello-fallback" viewBox={`0 0 ${COLUMNS} ${ROWS}`}>
        {Array.from({ length: COLUMNS * ROWS }, (_, index) => (
          <circle
            key={index}
            cx={(index % COLUMNS) + 0.5}
            cy={Math.floor(index / COLUMNS) + 0.5}
            r={0.34}
            data-lit={LIT_SET.has(index) || undefined}
          />
        ))}
      </svg>
      <canvas ref={canvasRef} />
    </div>
  );
}
