import * as THREE from "three";
import { detectTier, pinnedTier, settingsFor, type Settings } from "./quality";

export type Frame = {
  /** Drawing-buffer size in device pixels. */
  width: number;
  height: number;
  /** The placeholder's size in CSS pixels. */
  cssWidth: number;
  cssHeight: number;
  now: number;
  /** Seconds since this view last drew, capped. */
  delta: number;
  settings: Settings;
  first: boolean;
};

export type ViewSpec = {
  /**
   * The view's own canvas in the document. It keeps the classes, `data-ready`
   * and sibling relationships the CSS relies on; while the view holds the
   * live canvas it is hidden underneath, otherwise it shows the last frame.
   */
  placeholder: HTMLCanvasElement;
  /** CSS-to-device pixel ratio before adaptive scaling. */
  ratio: (settings: Settings, cssWidth: number, cssHeight: number) => number;
  /** Frame cap while animating. */
  fps?: (settings: Settings) => number;
  /** Multiplies the claim on the live canvas, e.g. while being touched. */
  priority?: () => number;
  /** Copy the last frame into the placeholder when the live canvas leaves. */
  snapshot?: boolean;
  /** Draw one frame; return true to be called again. */
  render: (renderer: THREE.WebGLRenderer, frame: Frame) => boolean;
  attach?: () => void;
  detach?: () => void;
  fail?: (error: unknown) => void;
};

export type ViewHandle = {
  wake: () => void;
  remove: () => void;
};

type Entry = ViewSpec & {
  awake: boolean;
  visible: number;
  fraction: number;
  cssWidth: number;
  cssHeight: number;
  rendered: boolean;
  dirty: boolean;
  last: number;
  failed: boolean;
};

// A view showing a valid copy of its last frame loses nothing by giving up the live canvas.
const IDLE_WEIGHT = 0.05;
const HYSTERESIS = 1.25;

/**
 * One WebGL context for every effect on the page.
 *
 * Effects live in different sections and are rarely on screen together, so a
 * single live canvas moves to whichever one matters most right now. The view
 * it leaves keeps a copy of its last frame. No per-frame copies, one set of
 * programs, one drawing buffer, one animation loop, one quality governor.
 */
class Stage {
  readonly canvas = document.createElement("canvas");
  readonly renderer: THREE.WebGLRenderer;
  readonly settings: Settings;
  readonly floatTargets: boolean;
  private quality = 1;
  private readonly adaptive: boolean;
  private entries = new Set<Entry>();
  private holder: Entry | null = null;
  private frame = 0;
  private width = 0;
  private height = 0;
  private lost = false;
  private disposeTimer = 0;
  private samples: number[] = [];
  private previousTick = 0;
  private drewLastTick = false;
  private qualityChanged = 0;
  private visibility: IntersectionObserver;
  private sizes: ResizeObserver;
  private byElement = new Map<Element, Entry>();
  disposed = false;

  constructor() {
    const capture = location.pathname.startsWith("/review/") && new URLSearchParams(location.search).has("cloudCapture");
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: capture,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0, 0);
    this.renderer.toneMapping = THREE.NoToneMapping;
    const extensions = this.renderer.extensions;
    this.floatTargets = extensions.has("EXT_color_buffer_float") || extensions.has("EXT_color_buffer_half_float");
    this.settings = settingsFor(detectTier({ floatTargets: this.floatTargets }));
    this.adaptive = !pinnedTier();
    this.canvas.dataset.stage = "live";
    document.documentElement.dataset.glTier = this.settings.tier;

    this.visibility = new IntersectionObserver(records => {
      for (const record of records) {
        const entry = this.byElement.get(record.target);
        if (!entry) continue;
        entry.visible = record.isIntersecting ? record.intersectionRect.width * record.intersectionRect.height : 0;
        entry.fraction = record.isIntersecting ? record.intersectionRatio : 0;
      }
      this.schedule();
    }, { threshold: [0, 0.05, 0.15, 0.3, 0.5, 0.75, 1] });
    this.sizes = new ResizeObserver(records => {
      for (const record of records) {
        const entry = this.byElement.get(record.target);
        if (!entry) continue;
        const box = record.borderBoxSize?.[0];
        entry.cssWidth = box ? box.inlineSize : record.contentRect.width;
        entry.cssHeight = box ? box.blockSize : record.contentRect.height;
        entry.dirty = true;
      }
      this.schedule();
    });
    this.canvas.addEventListener("webglcontextlost", this.onLost);
    this.canvas.addEventListener("webglcontextrestored", this.onRestored);
    document.addEventListener("visibilitychange", this.schedule);
  }

  add(spec: ViewSpec): ViewHandle {
    clearTimeout(this.disposeTimer);
    const entry: Entry = { ...spec, awake: true, visible: 0, fraction: 0, cssWidth: 0, cssHeight: 0, rendered: false, dirty: true, last: 0, failed: false };
    this.entries.add(entry);
    this.byElement.set(spec.placeholder, entry);
    this.visibility.observe(spec.placeholder);
    this.sizes.observe(spec.placeholder);
    return {
      wake: () => {
        if (entry.failed || !this.entries.has(entry)) return;
        entry.awake = true;
        this.schedule();
      },
      remove: () => this.remove(entry),
    };
  }

  private remove(entry: Entry) {
    if (!this.entries.delete(entry)) return;
    this.byElement.delete(entry.placeholder);
    this.visibility.unobserve(entry.placeholder);
    this.sizes.unobserve(entry.placeholder);
    if (this.holder === entry) {
      entry.placeholder.style.visibility = "";
      entry.detach?.();
      this.holder = null;
      this.canvas.remove();
      this.schedule();
    }
    if (!this.entries.size) this.disposeTimer = window.setTimeout(() => this.dispose(), 4000);
  }

  readonly schedule = () => {
    if (!this.frame && !this.disposed) this.frame = requestAnimationFrame(this.tick);
  };

  private score(entry: Entry) {
    if (entry.failed || entry.visible <= 0 || !entry.cssWidth || !entry.cssHeight) return 0;
    // Visible area, discounted for views mostly off screen, like a section-tall background.
    return entry.visible * (0.5 + 0.5 * entry.fraction) * (this.wanting(entry) ? 1 : IDLE_WEIGHT) * (entry.priority?.() ?? 1);
  }

  private wanting(entry: Entry) {
    return entry.awake || !entry.rendered || entry.dirty;
  }

  private pick() {
    let best: Entry | null = null;
    let bestScore = 0;
    for (const entry of this.entries) {
      const score = this.score(entry);
      if (score > bestScore) { best = entry; bestScore = score; }
    }
    const current = this.holder;
    if (current && best && best !== current) {
      const held = this.score(current);
      // Moving the canvas only pays when the newcomer has something new to draw.
      if (held > 0 && (!this.wanting(best) || held * HYSTERESIS >= bestScore)) return current;
    }
    return best;
  }

  private tick = (now: number) => {
    this.frame = 0;
    if (this.disposed || this.lost || document.hidden) { this.previousTick = 0; return; }
    const next = this.pick();
    if (next !== this.holder) this.handoff(next, now);
    const entry = this.holder;
    let drew = false;
    if (entry) {
      const interval = 1000 / Math.min(60, entry.fps?.(this.settings) ?? 60);
      const due = !entry.rendered || entry.dirty || (entry.awake && now - entry.last >= interval - 4);
      if (due) drew = this.draw(entry, now);
    }
    this.govern(now, drew);
    const othersWaiting = [...this.entries].some(other => other !== entry && this.score(other) > 0 && (other.awake || !other.rendered));
    if ((entry && (entry.awake || entry.dirty)) || othersWaiting) this.frame = requestAnimationFrame(this.tick);
  };

  private draw(entry: Entry, now: number) {
    if (!entry.cssWidth || !entry.cssHeight) return false;
    const ratio = entry.ratio(this.settings, entry.cssWidth, entry.cssHeight) * this.quality;
    const width = Math.max(1, Math.round(entry.cssWidth * ratio));
    const height = Math.max(1, Math.round(entry.cssHeight * ratio));
    if (width !== this.width || height !== this.height) {
      this.width = width;
      this.height = height;
      this.renderer.setSize(width, height, false);
    }
    this.renderer.setRenderTarget(null);
    this.renderer.setViewport(0, 0, width, height);
    const frame: Frame = {
      width, height, cssWidth: entry.cssWidth, cssHeight: entry.cssHeight, now,
      delta: entry.last ? Math.min((now - entry.last) / 1000, 0.1) : 1 / 60,
      settings: this.settings, first: !entry.rendered,
    };
    let again: boolean;
    try {
      again = entry.render(this.renderer, frame);
    } catch (error) {
      this.fail(entry, error);
      return false;
    }
    entry.last = now;
    entry.awake = again;
    entry.dirty = false;
    if (!entry.rendered) {
      entry.rendered = true;
      entry.placeholder.dataset.ready = "true";
      if (this.holder === entry) this.canvas.dataset.ready = "true";
    }
    return true;
  }

  private handoff(next: Entry | null, now: number) {
    const previous = this.holder;
    if (previous) {
      let copied = false;
      if (previous.snapshot !== false && previous.rendered && previous.visible > 0 && !this.lost) {
        // The drawing buffer is only readable in the task that drew it.
        if (this.draw(previous, now)) {
          previous.placeholder.width = this.width;
          previous.placeholder.height = this.height;
          const context = previous.placeholder.getContext("2d");
          if (context) {
            context.globalCompositeOperation = "copy";
            context.drawImage(this.canvas, 0, 0);
            copied = true;
          }
        }
      }
      // Without a copy it has nothing to show, so it asks for the canvas back when seen.
      if (!copied && previous.snapshot !== false) previous.dirty = true;
      previous.placeholder.style.visibility = "";
      previous.detach?.();
    }
    this.holder = next;
    if (!next) { this.canvas.remove(); return; }
    const placeholder = next.placeholder;
    this.canvas.style.transition = "none";
    this.canvas.className = placeholder.className;
    this.canvas.dataset.ready = next.rendered ? "true" : "false";
    placeholder.parentNode?.insertBefore(this.canvas, placeholder);
    void this.canvas.offsetWidth;
    this.canvas.style.transition = "";
    placeholder.style.visibility = "hidden";
    next.dirty = true;
    next.attach?.();
  }

  private fail(entry: Entry, error: unknown) {
    entry.failed = true;
    entry.awake = false;
    entry.placeholder.dataset.ready = "false";
    entry.placeholder.style.visibility = "";
    if (this.holder === entry) {
      this.holder = null;
      this.canvas.remove();
    }
    console.error("WebGL view unavailable:", error);
    entry.fail?.(error);
    this.schedule();
  }

  /** Drops resolution quickly when frames run long, restores it slowly. */
  private govern(now: number, drew: boolean) {
    if (this.adaptive && this.drewLastTick && this.previousTick) {
      this.samples.push(now - this.previousTick);
      if (this.samples.length >= 24) {
        const sorted = [...this.samples].sort((a, b) => a - b);
        const typical = sorted[Math.floor(sorted.length * 0.6)];
        this.samples.length = 0;
        let next = this.quality;
        if (typical > 21) next = Math.max(this.settings.minQuality, this.quality * 0.82);
        else if (typical < 17.6 && now - this.qualityChanged > 4000) next = Math.min(1, this.quality * 1.08);
        if (Math.abs(next - this.quality) > 0.01 && now - this.qualityChanged > 1200) {
          this.quality = next;
          this.qualityChanged = now;
          this.canvas.dataset.quality = next.toFixed(2);
          if (this.holder) this.holder.dirty = true;
        }
      }
    }
    this.previousTick = now;
    this.drewLastTick = drew;
  }

  private onLost = (event: Event) => {
    event.preventDefault();
    this.lost = true;
    this.canvas.dataset.ready = "false";
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  };

  private onRestored = () => {
    this.lost = false;
    for (const entry of this.entries) entry.dirty = true;
    if (this.holder?.rendered) this.canvas.dataset.ready = "true";
    this.schedule();
  };

  private dispose() {
    if (this.entries.size) return;
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.visibility.disconnect();
    this.sizes.disconnect();
    document.removeEventListener("visibilitychange", this.schedule);
    this.canvas.removeEventListener("webglcontextlost", this.onLost);
    this.canvas.removeEventListener("webglcontextrestored", this.onRestored);
    this.canvas.remove();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    if (instance === this) instance = null;
  }
}

let instance: Stage | null = null;

/** The page's shared WebGL stage, or null where WebGL2 is unavailable. */
export function getStage() {
  if (instance && !instance.disposed) return instance;
  try {
    instance = new Stage();
  } catch {
    instance = null;
  }
  return instance;
}

export type { Stage };
