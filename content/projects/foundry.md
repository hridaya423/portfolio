---
title: "Foundry"
headline: "Foundry: a native Mac launcher that uses 81% less memory than Raycast"
summary: "A free, open-source macOS launcher written in pure Swift. Apps, files, clipboard history and snippets, using roughly 81% less RAM than Raycast in my benchmarks."
kind: "macOS app"
platform: "macOS 14 or later"
status: "Open source"
category: "DesktopEnhancementApplication"
license: "MIT"
publishedAt: "2026-06-12"
updatedAt: "2026-11-21"
site: "https://foundry.hridya.tech"
repo: "https://github.com/hridaya423/foundry"
image: "/foundry-hero.png"
---

One afternoon I checked Activity Monitor and noticed Raycast sitting idle at more than 600 MB of memory. I liked using it, so I wanted to see how small a native macOS launcher could stay if I wrote it in pure Swift with no third-party dependencies.

Foundry is what came out of that: a free, open-source launcher for macOS 14 and newer that covers apps, file search, clipboard history, snippet expansion and window management, while using around 81% less memory than Raycast in my benchmarks.

![The Foundry site: "The app you never open. Opens everything." alongside a launcher panel showing search, clipboard history, window management and AI chat.](/foundry-hero.png)

## 59–115 MB against 591–620 MB

On 29 September 2026, I measured Foundry 1.1.0 against Raycast 2.5.3.0 on the same MacBook Pro (Apple M4 Pro, macOS 27.0, plugged into AC power). Launch order actually shifted the numbers, so I ran the test twice and swapped which app went first:

| Run order | Foundry p50 | Raycast p50 | Difference |
|---|---|---|---|
| Foundry first | 59.3 MB | 591.3 MB | 90.0% less |
| Raycast first | 115.2 MB | 620.2 MB | 81.4% less |

For the headline I used the worse run and rounded down, so it says 81% instead of 90%. An earlier August test (Foundry 1.0 against Raycast 2.1.2.0) measured 68.9%, and this run replaces it.

Each app ran alone for 5 warmup panel cycles and 30 measured cycles. The script then waited 2 seconds and recorded 15 memory samples, one second apart, with the panel hidden. Memory here is the Summary Footprint from macOS's `footprint` tool across the app and its child processes, including the WebKit helpers Raycast spawns after launch. I kept resident set size only as a cross-check because RSS counts shared pages more than once.

On disk, `du -sk` puts Foundry 1.1.0 at 16,152 KB versus Raycast 2.5.3 at 224,088 KB (a 13.8x ratio). The runner lives in `scripts/benchmark-launchers.swift` and the raw logs are in `docs/benchmarks/`.

## Keeping search responsive

In `Sources/Foundry/Commands/Search/CommandSearchCoordinator.swift`, every keystroke increments a `generation` counter and cancels the previous search task. Fast providers run first; slower ones run at `.utility` priority so a cancelled query never delays the next keypress. Before results hit the UI, the coordinator checks the generation ID and drops anything stale.

When you press the hotkey, the panel paints a cached home snapshot immediately before running a query, so it never flashes blank. Providers also precompute normalised text and a character mask up front, letting a cheap `probableMatch` check throw out impossible rows before scoring begins.

In an in-process test on an Apple M4 (version 1.2.0, 132 samples), the search engine took 16.82 ms at p50 and 35.6 ms at p95. That measures engine work only, not the full time to a drawn frame.

## Where Raycast and Tinycast beat it

Foundry has no extension store, and it isn't trying to rebuild Raycast's ecosystem. An earlier Foundry release build also took longer to register its window on hotkey than Raycast (99.9–104.4 ms versus 17.5–17.9 ms, measured up to window registration rather than first painted frame).

Tinycast 0.11.3 is lighter still: 13.6 MB on disk and about 40 MB in memory on battery, where Foundry measured 60.5–120.0 MB. A diagnostic Foundry build that kept its panel mapped opened 3.4–3.8x faster than Tinycast, though that build isn't what ships today.

I haven't timed Alfred or Spotlight. Foundry can import Alfred and Raycast snippets along with Raycast quicklinks, and onboarding can take over Cmd+Space from Spotlight if you want it to.

A few things the benchmark doesn't cover: it's one machine and two runs (I haven't tested a second Mac yet), the Raycast numbers come from my daily install rather than a clean profile with extensions logged, run order noticeably swings Foundry's footprint (41.5 to 115.5 MB in the Raycast-first run), and a couple of built-in utilities rely on Homebrew tools (`yt-dlp` for YouTube downloads and some file conversions).

## Try it

Download [Foundry.dmg](https://github.com/hridaya423/foundry/releases/latest/download/Foundry.dmg), drag it to Applications, and press Cmd+Space. Releases since 1.3.0 are Developer ID signed and notarized by Apple, and setup can move Raycast or Alfred to Option+Space.

To build from source, run `./scripts/build-app.sh` with Swift 6.1 or newer (6.2 for Liquid Glass). There's no Homebrew formula and no third-party Swift dependencies.

Site: [foundry.hridya.tech](https://foundry.hridya.tech). Source: [github.com/hridaya423/foundry](https://github.com/hridaya423/foundry) (MIT).
