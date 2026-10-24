export type Tier = "low" | "mid" | "high";

export type Settings = {
  tier: Tier;
  /** Lowest adaptive resolution scale the stage may fall back to. */
  minQuality: number;
  cloud: {
    steps: number;
    lightSamples: number;
    lightEvery: number;
    /** Render scale; soft volumes hide a lower resolution well. */
    scale: number;
    /** Frame rate while nothing is touching the clouds; 0 holds a still frame. */
    idleFps: number;
    activeFps: number;
  };
  caustics: { size: number; bands: number; grid: [number, number]; fps: number };
  lcd: { fps: number; taps: number };
  light: { budget: number };
};

const SETTINGS: Record<Tier, Settings> = {
  low: {
    tier: "low",
    minQuality: 0.5,
    cloud: { steps: 40, lightSamples: 3, lightEvery: 3, scale: 0.5, idleFps: 0, activeFps: 30 },
    caustics: { size: 1024, bands: 5, grid: [128, 64], fps: 20 },
    lcd: { fps: 30, taps: 12 },
    light: { budget: 1_000_000 },
  },
  mid: {
    tier: "mid",
    minQuality: 0.55,
    cloud: { steps: 56, lightSamples: 4, lightEvery: 2, scale: 0.6, idleFps: 15, activeFps: 30 },
    caustics: { size: 1024, bands: 7, grid: [192, 96], fps: 24 },
    lcd: { fps: 30, taps: 16 },
    light: { budget: 1_600_000 },
  },
  high: {
    tier: "high",
    minQuality: 0.6,
    cloud: { steps: 128, lightSamples: 6, lightEvery: 2, scale: 1, idleFps: 60, activeFps: 60 },
    caustics: { size: 2048, bands: 9, grid: [256, 128], fps: 30 },
    lcd: { fps: 60, taps: 28 },
    light: { budget: 4_000_000 },
  },
};

const forced = () => {
  const value = new URLSearchParams(location.search).get("quality");
  return value === "low" || value === "mid" || value === "high" ? value : null;
};

/** `?quality=low|mid|high` pins a tier and turns adaptive resolution off. */
export function pinnedTier() {
  return forced();
}

export function detectTier({ floatTargets }: { floatTargets: boolean }): Tier {
  const pinned = forced();
  if (pinned) return pinned;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const touchOnly = matchMedia("(pointer: coarse)").matches && !matchMedia("(any-pointer: fine)").matches;
  if (!touchOnly) return floatTargets ? "high" : "mid";
  const lowMemory = (nav.deviceMemory ?? 8) <= 3;
  return lowMemory || nav.connection?.saveData || !floatTargets ? "low" : "mid";
}

export function settingsFor(tier: Tier) {
  return SETTINGS[tier];
}
