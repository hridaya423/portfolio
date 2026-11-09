---
title: "Foundry"
headline: "Foundry: a native Mac launcher with 81% less memory than Raycast"
summary: "Foundry is a free, open-source Swift launcher for macOS 14 or later. It used about 81% less memory than Raycast in my benchmark. It has no extension store."
kind: "macOS app"
platform: "macOS 14 or later"
status: "Open source"
category: "DesktopEnhancementApplication"
license: "MIT"
publishedAt: "2026-06-12"
updatedAt: "2026-11-09"
site: "https://foundry.hridya.tech"
repo: "https://github.com/hridaya423/foundry"
image: "/foundry-hero.png"
---

Foundry is a free, open-source launcher for macOS 14 or later, written in native Swift. It opens apps, finds files, keeps clipboard history and expands snippets. It is for Mac users who want a launcher in the style of Raycast that stays small. In my benchmark, Foundry held about 81% less memory than Raycast.

![The Foundry site: the tagline "The app you never open. Opens everything." beside a launcher panel with search, clipboard history, window management and AI chat rows.](/foundry-hero.png)

## 59 to 115 MB against 591 to 620 MB

Foundry 1.1.0 held 59 to 115 MB with its panel hidden. Raycast 2.5.3.0 held 591 to 620 MB. Both ran on one MacBook Pro (Apple M4 Pro, macOS 27.0, on AC power) on 29 September 2026.

I ran the benchmark twice, once with each launcher first, because the order changed the result.

| Run order | Foundry p50 | Raycast p50 | Foundry uses |
|---|---|---|---|
| Foundry first | 59.3 MB | 591.3 MB | 90.0% less |
| Raycast first | 115.2 MB | 620.2 MB | 81.4% less |

The headline takes the worse run and rounds down, so it says 81%, not 90%. An older test (Foundry 1.0 against Raycast 2.1.2.0, 29 August 2026) gave 68.9%. The newer test replaces it.

Each launcher ran alone, with 5 warmup panel cycles and 30 measured cycles. The runner then waited 2 seconds and took 15 memory samples, one second apart, with the panel hidden.

"Memory" is the Summary Footprint from the macOS `footprint` tool, for the app and its child processes. For Raycast, that includes the WebKit helpers that did not run before Raycast started. I kept resident set size only as a cross-check, because it counts shared pages more than once.

The exact flags are in `scripts/benchmark-launchers.swift`, and the raw data is in `docs/benchmarks/`. On disk, Foundry 1.1.0 is 16,152 KB and Raycast 2.5.3 is 224,088 KB (`du -sk`), a ratio of 13.8.

## Why the panel never opens blank

Foundry searches in stages, and each keystroke cancels the search before it. Each keystroke increases a `generation` counter and cancels the previous task.

The new task runs the fast providers first, then the slow providers at `.utility` priority. A cancelled search therefore cannot delay the next keystroke. Before a result reaches the panel, the coordinator checks the generation of that result and drops a stale one.

The panel paints a cached home snapshot the moment it opens, before a search runs. The providers skip work too. Each provider computes normalized text and a character mask in advance. A cheap `probableMatch` check then rejects impossible candidates before scoring starts.

In an in-process test on an Apple M4, the search engine took 16.82 ms p50 and 35.6 ms p95 over 132 samples (version 1.2.0). That is engine time only, not the time to a drawn frame. The code is in `Sources/Foundry/Commands/Search/CommandSearchCoordinator.swift`.

## Foundry compared with Raycast, Tinycast, Alfred and Spotlight

Raycast has an extension store, and Foundry does not. Raycast also opened its panel faster than an earlier Foundry release build. From hotkey to window registered, Raycast took 17.5 to 17.9 ms and Foundry took 99.9 to 104.4 ms. Those timings stop at window registration, not at the first drawn frame.

Tinycast 0.11.3 is lighter than Foundry. It is 13.6 MB on disk and holds about 40 MB of memory on battery, where Foundry measured 60.5 to 120.0 MB. A staged Foundry build that keeps its panel mapped opened 3.4 to 3.8 times faster than Tinycast. That is a diagnostic build, not the build you download.

I have no numbers for Alfred or Spotlight. Foundry imports Alfred and Raycast snippets and Raycast quicklinks. With your consent, it takes Cmd+Space from Spotlight.

Foundry does not aim to match each Raycast extension. It aims to make common Mac actions dependable.

## What the benchmark does not cover

- The benchmark is one machine and two runs. I have not measured a second Mac, a Mac mini, yet.
- I did not record the settings or extensions of Raycast. It was my daily install.
- Run order changes the answer. The footprint of Foundry in the Raycast-first run ranged from 41.5 to 115.5 MB.
- YouTube downloads install `yt-dlp` through Homebrew, and some file conversions need Homebrew tools too.

## Try Foundry

Download [Foundry.dmg](https://github.com/hridaya423/foundry/releases/latest/download/Foundry.dmg), drag Foundry to Applications and press Cmd+Space. Since version 1.3.0, the app has a Developer ID signature and Apple notarization. Setup can move Raycast or Alfred to Option+Space.

To build from source, run `./scripts/build-app.sh` with Swift 6.1 or later (6.2 for the Liquid Glass look). There is no Homebrew formula, and the package has no third-party Swift dependencies.

Site: [foundry.hridya.tech](https://foundry.hridya.tech). Source: [github.com/hridaya423/foundry](https://github.com/hridaya423/foundry) (MIT).
