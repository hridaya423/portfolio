"use client";

import { useEffect, useRef } from "react";
import type * as THREE from "three";
import { LcdWallScene } from "./lcd-wall-scene";
import { getStage, type Frame } from "./gl/stage";
import { GLYPH_CHARACTERS, glyphCode } from "./dot-matrix-font";
import { LedText } from "./led-text";

const COLUMNS = 8;
const ROWS = 2;
const WALL = 9;

// Everything the page has said, as the modules around the greeting read it.
const WORDS: [string, string][] = [
  ["LEXIS", "ASK->RUN"],
  ["FOUNDRY", "-69% RAM"],
  ["CUE", "PASTE AI"],
  ["REVISE", "PAST QS"],
  ["LOCUS", "1ST £1K"],
  ["891K", "DATASETS"],
  ["SILVER", "SUITS AI"],
  ["10K+", "CALLS"],
  ["VOICE", "AGENTS"],
  ["UNDEAD", "COURIER"],
  ["100 HRS", "SHANGHAI"],
  ["WHISPER", "TOKYO"],
  ["120 HRS", "ARCADE"],
  ["OPEN", "SAUCE"],
  ["SAN FRAN", "JUL 2026"],
  ["9 CERTS", "BY 13"],
  ["AZ-900", "AGE 11"],
  ["HACKCLUB", "REVIEWS"],
  ["WHAT IF?", ""],
  ["AN IDEA", "-> WORKS"],
  ["LONDON", "UK"],
  ["SHIP IT", ""],
];
const GREETING = " HELLO! ";
// Seven characters at most, leaving room for the cursor.
const MESSAGES = ["SAY HI", "IDEAS?", "BUILD?", "HRIDYA"];

const pad = (text: string) => {
  const trimmed = text.slice(0, COLUMNS);
  const left = Math.floor((COLUMNS - trimmed.length) / 2);
  return (" ".repeat(left) + trimmed).padEnd(COLUMNS, " ");
};
const randomGlyph = () => 1 + Math.floor(Math.random() * (GLYPH_CHARACTERS.length - 2));
const wrap = (value: number) => ((value % WALL) + WALL) % WALL;
const BLANK: [string, string] = ["", ""];

/** The finale: a wall of LCD character modules that says hello back. */
export function LcdWall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const band = canvas?.parentElement;
    const stage = getStage();
    if (!canvas || !band || !stage) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const modules = WALL * WALL;
    const chars = modules * COLUMNS * ROWS;
    const target = new Uint8Array(chars);
    const settle = new Float64Array(chars);
    const level = new Float32Array(modules);
    const brightness = new Float32Array(modules);
    const home: [string, string][] = [];
    const scene = new LcdWallScene();
    let booted = false;
    let lastDraw = 0, lastIdle = 0, lastScramble = 0, start = 0;
    let width = 0, height = 0, dot = 8, pixels = "";
    let pointerX = 0.5, pointerY = 0.5, focusX = 0.5, focusY = 0.5, pointerInside = false;
    let hoverX = 0, hoverY = 0, hoverAmount = 0, hoverKey = "";
    const timers: { at: number; run: () => void }[] = [];
    let typing = { message: 0, length: 0, phase: "type" as "type" | "hold" | "erase", next: 0 };

    const index = (mx: number, my: number, column: number, row: number) =>
      (my * ROWS + row) * WALL * COLUMNS + mx * COLUMNS + column;
    const isCenter = (mx: number, my: number) => mx === 0 && my === 0;

    /** Write two lines into a module; characters scramble until `delay + stagger`. */
    const write = (mx: number, my: number, lines: [string, string], now: number, delay = 0) => {
      for (let row = 0; row < ROWS; row++) {
        const text = pad(lines[row]);
        for (let column = 0; column < COLUMNS; column++) {
          const i = index(mx, my, column, row);
          target[i] = glyphCode(text[column]);
          settle[i] = reduced.matches ? 0 : now + delay + 140 + column * 34 + row * 60 + Math.random() * 90;
        }
      }
    };

    // Deterministic layout so the wall reads the same on every visit.
    let seed = 7;
    const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let my = 0; my < WALL; my++) for (let mx = 0; mx < WALL; mx++) {
      const words: [string, string] = isCenter(mx, my)
        ? [GREETING, reduced.matches ? "SAY HI" : ""]
        : random() < 0.82 ? WORDS[Math.floor(random() * WORDS.length)] : BLANK;
      home[my * WALL + mx] = words;
      brightness[my * WALL + mx] = isCenter(mx, my) ? 1 : 0.34 + random() * 0.34;
      write(mx, my, words, 0);
    }

    const upload = (now: number) => {
      const data = scene.textData;
      for (let i = 0; i < chars; i++) {
        const scrambling = settle[i] > now;
        const mx = Math.floor((i % (WALL * COLUMNS)) / COLUMNS);
        const my = Math.floor(Math.floor(i / (WALL * COLUMNS)) / ROWS);
        const m = my * WALL + mx;
        data[i * 4] = scrambling ? (target[i] === 0 && Math.random() < 0.5 ? 0 : randomGlyph()) : target[i];
        data[i * 4 + 1] = Math.round(Math.min(1, brightness[m] * level[m] * (scrambling ? 1.18 : 1)) * 255);
      }
      scene.updateText();
    };

    const typeLine = (now: number) => {
      if (reduced.matches || now < typing.next) return;
      const message = MESSAGES[typing.message];
      if (typing.phase === "type") {
        typing.length++;
        if (typing.length >= message.length) { typing.phase = "hold"; typing.next = now + 2400; }
        else typing.next = now + 95 + Math.random() * 60;
      } else if (typing.phase === "hold") {
        typing.phase = "erase";
        typing.next = now + 40;
      } else {
        typing.length--;
        if (typing.length <= 0) {
          typing = { message: (typing.message + 1) % MESSAGES.length, length: 0, phase: "type", next: now + 500 };
        } else typing.next = now + 38;
      }
      const shown = message.slice(0, typing.length);
      const cursor = Math.floor(now / 530) % 2 === 0 ? "█" : " ";
      const line = (shown + (typing.phase === "erase" ? "" : cursor)).slice(0, COLUMNS).padEnd(COLUMNS, " ");
      for (let column = 0; column < COLUMNS; column++) {
        const i = index(0, 0, column, 1);
        target[i] = glyphCode(line[column]);
        settle[i] = 0;
      }
    };

    const boot = (now: number) => {
      booted = true;
      start = now;
      for (let my = 0; my < WALL; my++) for (let mx = 0; mx < WALL; mx++) {
        const dx = Math.min(mx, WALL - mx), dy = Math.min(my, WALL - my);
        const delay = Math.hypot(dx, dy) * 150;
        write(mx, my, home[my * WALL + mx], now, delay);
        timers.push({ at: now + delay, run: () => { level[my * WALL + mx] = 1; } });
      }
      typing.next = now + 1100;
    };

    /** The whole wall answers: a wave of greetings from where you clicked. */
    const ripple = (mx: number, my: number, now: number) => {
      for (let y = 0; y < WALL; y++) for (let x = 0; x < WALL; x++) {
        const dx = Math.min(Math.abs(x - mx), WALL - Math.abs(x - mx));
        const dy = Math.min(Math.abs(y - my), WALL - Math.abs(y - my));
        const distance = Math.hypot(dx, dy * 1.4);
        if (isCenter(x, y)) continue;
        const hello: [string, string] = [GREETING, Math.random() < 0.3 ? ":)" : ""];
        timers.push({ at: now + distance * 85, run: () => write(x, y, hello, performance.now()) });
        timers.push({ at: now + 2200 + distance * 70, run: () => write(x, y, home[y * WALL + x], performance.now()) });
      }
    };

    const step = (now: number) => {
      if (!booted) boot(now);
      for (let i = timers.length - 1; i >= 0; i--) {
        if (timers[i].at <= now) { timers[i].run(); timers.splice(i, 1); }
      }
      if (now - lastIdle > 300) {
        lastIdle = now;
        const mx = Math.floor(Math.random() * WALL), my = Math.floor(Math.random() * WALL);
        if (!isCenter(mx, my) && level[my * WALL + mx] > 0) {
          const next = Math.random() < 0.85 ? WORDS[Math.floor(Math.random() * WORDS.length)] : BLANK;
          home[my * WALL + mx] = next;
          write(mx, my, next, now);
        }
      }
      typeLine(now);
      const follow = 1 - Math.exp(-(now - (lastDraw || now)) / 220);
      lastDraw = now;
      focusX += ((pointerInside ? pointerX : 0.5) - focusX) * follow;
      focusY += ((pointerInside ? pointerY : 0.5) - focusY) * follow;
      hoverAmount += ((pointerInside ? 1 : 0) - hoverAmount) * follow;
      if (now - lastScramble > 45) { lastScramble = now; upload(now); }
    };

    const render = (renderer: THREE.WebGLRenderer, frame: Frame) => {
      const key = `${frame.width}x${frame.height}`;
      if (key !== pixels) {
        pixels = key;
        width = frame.cssWidth;
        height = frame.cssHeight;
        dot = Math.max(5, Math.min(11, width / 136));
        scene.resize(frame.width, frame.height, frame.width / width, dot, frame.settings.lcd.taps);
      }
      if (reduced.matches) {
        for (let m = 0; m < modules; m++) level[m] = 1;
        upload(0);
        scene.draw(renderer, 0, 0.5, 0.5, 0, 0, 0);
        return false;
      }
      step(frame.now);
      scene.draw(renderer, (frame.now - start) / 1000, focusX, focusY, hoverX, hoverY, hoverAmount);
      return true;
    };
    const handle = stage.add({
      placeholder: canvas,
      ratio: (_, cssWidth) => Math.min(devicePixelRatio || 1, cssWidth < 700 ? 1.25 : 1.5),
      fps: settings => settings.lcd.fps,
      priority: () => pointerInside ? 3 : 1,
      render,
    });

    const local = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      return [event.clientX - bounds.left, event.clientY - bounds.top] as const;
    };
    const move = (event: PointerEvent) => {
      if (reduced.matches || !fine.matches || !width) return;
      const [x, y] = local(event);
      pointerX = x / width;
      pointerY = y / height;
      pointerInside = true;
      const [mx, my] = scene.moduleAt(x - width / 2, y - height / 2, dot);
      hoverX = mx;
      hoverY = my;
      const key = `${mx},${my}`;
      if (key !== hoverKey) {
        hoverKey = key;
        const wx = wrap(mx), wy = wrap(my);
        if (!isCenter(wx, wy)) write(wx, wy, home[wy * WALL + wx], performance.now());
      }
    };
    const leave = () => { pointerInside = false; hoverKey = ""; };
    const press = (event: PointerEvent) => {
      if (reduced.matches || !width) return;
      const [x, y] = local(event);
      const [mx, my] = scene.moduleAt(x - width / 2, y - height / 2, dot);
      ripple(wrap(mx), wrap(my), performance.now());
      handle.wake();
    };
    const wake = () => handle.wake();
    band.addEventListener("pointermove", move);
    band.addEventListener("pointerleave", leave);
    band.addEventListener("pointerdown", press);
    reduced.addEventListener("change", wake);

    return () => {
      band.removeEventListener("pointermove", move);
      band.removeEventListener("pointerleave", leave);
      band.removeEventListener("pointerdown", press);
      reduced.removeEventListener("change", wake);
      handle.remove();
      scene.dispose();
    };
  }, []);

  return (
    <div className="lcd-wall" aria-hidden="true">
      <LedText text="HELLO!" capacity={6} className="lcd-fallback" />
      <canvas ref={canvasRef} />
      <p className="lcd-hint">
        <span className="lcd-hint-fine">Click</span>
        <span className="lcd-hint-touch">Tap</span> the wall to say hello back
      </p>
    </div>
  );
}
