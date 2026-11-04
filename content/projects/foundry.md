---
title: "Foundry"
headline: "Foundry: a native Mac launcher with 81% less memory than Raycast"
summary: "Foundry is a free, open-source Swift launcher for macOS 14+. It used about 81% less memory than Raycast in my benchmark. It has no extension store."
kind: "macOS app"
platform: "macOS 14 or later"
status: "Open source"
publishedAt: "2026-06-12"
updatedAt: "2026-11-04"
site: "https://foundry.hridya.tech"
repo: "https://github.com/hridaya423/foundry"
image: "/foundry-hero.png"
---

Foundry is a free, open-source launcher for macOS 14 or later, written in native Swift. It opens apps, finds files, keeps clipboard history and expands snippets, for Mac users who want a Raycast-style launcher that stays small. In my benchmark Foundry held about 81% less memory than Raycast.

![The Foundry site: the tagline "The app you never open. Opens everything." beside a launcher panel with search, clipboard history, window management and AI chat rows.](/foundry-hero.png)

## 59 to 115 MB against 591 to 620 MB

Foundry 1.1.0 sat at 59 to 115 MB with its panel hidden. Raycast 2.5.3.0 sat at 591 to 620 MB. Both ran on one MacBook Pro (Apple M4 Pro, macOS 27.0, on AC power) on 2026-09-29.

I ran the benchmark twice, once with each launcher first, because the order mattered:

| Run order | Foundry p50 | Raycast p50 | Foundry uses |
|---|---|---|---|
| Foundry first | 59.3 MB | 591.3 MB | 90.0% less |
| Raycast first | 115.2 MB | 620.2 MB | 81.4% less |

The headline takes the worse run and rounds down, so it says 81%, not 90%. An older test (Foundry 1.0 against Raycast 2.1.2.0, 2026-08-29) gave 68.9%. The newer one replaces it.

Each launcher ran alone, with 5 warmup panel cycles and 30 measured ones. The runner then waited 2 seconds and took 15 memory samples, one second apart, with the panel hidden. "Memory" is the Summary Footprint from the macOS `footprint` tool, for the app and its child processes. For Raycast that includes the WebKit helpers that were not running before it started. I kept resident set size only as a cross-check, since it counts shared pages more than once. The exact flags are in `scripts/benchmark-launchers.swift`, and the raw data is in `docs/benchmarks/`.

On disk, Foundry 1.1.0 is 16,152 KB and Raycast 2.5.3 is 224,088 KB (`du -sk`), a ratio of 13.8.

## Why the panel never opens blank

Foundry searches in stages, and every keystroke cancels the search before it. Each keystroke bumps a `generation` counter and cancels the previous task. The new task runs the fast providers first, then the slow ones at `.utility` priority, so a cancelled search can't delay the next keystroke. Before any result reaches the panel, the coordinator checks its generation and drops it if it's stale.

The panel itself paints a cached home snapshot the moment it opens, before any search runs. The providers skip work too: each precomputes normalized text and a character mask, and a cheap `probableMatch` check rejects impossible candidates before scoring starts.

In an in-process test on an Apple M4, the search engine took 16.82 ms p50 and 35.6 ms p95 over 132 samples (version 1.2.0). That's engine time only, not time to a drawn frame. The code is in `Sources/Foundry/Commands/Search/CommandSearchCoordinator.swift`.

## Where Raycast and Tinycast win

Raycast has an extension store and Foundry doesn't. Raycast also opened its panel faster than an earlier Foundry release build: 17.5 to 17.9 ms from hotkey to window registered, against 99.9 to 104.4 ms. Those timings stop at window registration, not at the first drawn frame.

Tinycast 0.11.3 is lighter than Foundry. It's 13.6 MB on disk and about 40 MB of memory on battery, where Foundry measured 60.5 to 120.0 MB. A staged Foundry build that keeps its panel mapped did open 3.4 to 3.8 times faster than Tinycast, but that's a diagnostic build, not what you download.

I have no numbers for Alfred or Spotlight. Foundry imports Alfred and Raycast snippets and Raycast quicklinks, and with your consent it takes Cmd+Space from Spotlight. The roadmap's goal isn't to match every Raycast extension. It's to make common Mac actions dependable.

## What the benchmark doesn't cover

- It's one machine and two runs. A second Mac, a Mac mini, isn't measured yet.
- I didn't record Raycast's settings or extensions. It was my daily install.
- Run order moves the answer. Foundry's footprint in the Raycast-first run ranged from 41.5 to 115.5 MB.
- The docs don't say whether the 1.1.0 DMG is signed and notarized.
- YouTube downloads install `yt-dlp` through Homebrew, and some file conversions need Homebrew tools too.

## Try Foundry

Download [Foundry.dmg](https://github.com/hridaya423/foundry/releases/latest/download/Foundry.dmg), drag Foundry to Applications and press Cmd+Space. Setup can move Raycast or Alfred to Option+Space.

To build from source, run `./scripts/build-app.sh` with Swift 6.1 or later (6.2 for the Liquid Glass look). There's no Homebrew formula, and the package has no third-party Swift dependencies.

Site: [foundry.hridya.tech](https://foundry.hridya.tech). Source: [github.com/hridaya423/foundry](https://github.com/hridaya423/foundry) (MIT).
