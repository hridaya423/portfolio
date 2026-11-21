---
title: "GazeKeeper"
headline: "GazeKeeper: a Mac break reminder that waits until you actually pause"
summary: "A free macOS menu-bar app for 20-20-20 eye breaks that holds off during calls, screen shares and fullscreen apps, then waits for a natural gap in your typing."
kind: "macOS app"
platform: "macOS 14 or later"
status: "Open source"
category: "HealthApplication"
license: "Apache-2.0"
publishedAt: "2026-10-22"
updatedAt: "2026-11-21"
repo: "https://github.com/hridaya423/gazekeeper"
site: "https://gazekeeper.hridya.tech"
image: "/projects/gazekeeper/og.png"
---

I kept uninstalling break reminders for one reason: a plain 20-minute timer doesn't know you're sharing your screen on a call or halfway through typing a sentence. GazeKeeper is a free, open-source macOS 14+ menu-bar app that keeps the 20-20-20 cycle (every 20 minutes, look away for 20 seconds), pauses the countdown while a break would interrupt something important, and waits for a brief gap in your typing before covering the screen.

![The GazeKeeper social card styled as a Snellen eye chart, with "A break reminder for Mac that waits for the right moment" set on the 20/20 line.](/projects/gazekeeper/og.png)

## Why waiting two seconds changes everything

Waiting for a pause in input isn't just a nice-to-have—[Bailey and Iqbal (ACM TOCHI, 2008)](https://interruptions.net/literature/Bailey-TOCHI08.pdf) found that shifting interruptions to moments when mental workload naturally dips lets people get back to work faster with far less irritation.

Suppose a call starts 12 minutes into a 20-minute session with the default settings:

| Time | What happens | What GazeKeeper does |
|---|---|---|
| 14:00:00 | Interval starts | The menu-bar ring begins emptying silently. |
| 14:12:00 | Camera turns on | Countdown freezes with 8 minutes left. No banner, no sound. |
| 14:19:00 | Call ends | Countdown continues from 8 minutes. |
| 14:26:00 | Heads-up | A small pill reads *"Break in 1:00"*, with **Start now** and **Snooze 5m**. |
| 14:27:00 | Break is due | Waits for 2 seconds without input (up to 30 seconds at most). |
| 14:27:02–14:27:30 | Break runs | Overlay covers every display for 20 seconds. |

A 30-second cooldown follows so nothing fires back to back, and the next 20-minute countdown begins once the break ends.

## Checking system state without reading content

Four hold detectors are on by default in Settings, and every one of them looks at OS state rather than what's on your screen or mic:

| Signal | What GazeKeeper reads | What it never touches |
|---|---|---|
| Camera | Whether any app uses a camera | Video frames |
| Microphone | Whether default audio input is active | Audio |
| Screen sharing | Active `screensharingd` or `replayd` windows | What's being shared |
| Fullscreen | Whether the front window covers ≥90% of a screen | Window contents |
| Per-app rules | Which app is frontmost | What you do in it |
| Typing pause | Seconds since last key or mouse event | Which keys you pressed |
| Calendar (off by default) | Start times of upcoming meetings | Anything else in the event |

The camera check listens to CoreMediaIO notifications instead of polling, re-checking when devices change (including an iPhone joining as Continuity Camera). Checking the default audio input catches audio-only calls. Screen-sharing detection inspects on-screen windows owned by `screensharingd` and `replayd` via `CGWindowListCopyWindowInfo`, which doesn't require screen-recording permission. To stay light, the fullscreen check only wakes up when a break is within two minutes, during heads-up, or during an active break.

You can also set per-app rules: **Pause** holds the timer while that app is focused, and **Ignore** exempts it from the fullscreen check. Holding the timer never burns a snooze; if a call begins mid-break, GazeKeeper ends the break immediately and logs it as interrupted.

Typing-pause detection calls `CGEventSource.secondsSinceLastEventType`, which needs no Accessibility permission and never sees a keystroke. Once the heads-up finishes, 2 seconds of idle time triggers the break. If you're still typing, the pill changes to *"As soon as you pause…"* and waits at most 30 seconds before stepping in so a stuck key can't delay breaks forever.

## Defaults

All timings live in Settings and start from these defaults:

| Setting | Default |
|---|---|
| Interval | 20 minutes (1–240) |
| Break length | 20 seconds (10–600) |
| Heads-up | 60 seconds before the break |
| Cooldown after a break | 30 seconds |
| Snoozes per break | 2 (5, 10 or 15 minutes each) |
| Skip button | Appears 3 seconds into a break |
| Idle time counted as a break | 1 minute without input |
| Calendar rule | Off (when on, shifts breaks due within 2 min of a meeting to 3 min before) |

## What the research actually supports

The evidence for taking occasional breaks is decent; the evidence for the exact "20-20-20" numbers is much thinner. The [American Academy of Ophthalmology](https://www.aao.org/newsroom/news-releases/detail/protect-your-eyes-in-home-office) notes that people blink roughly half as often while staring at screens, drying out their eyes. A study of laptop users with eye strain found look-away reminders eased dry-eye and strain symptoms, though the effect wore off a week after reminders stopped ([Talens-Estarelles et al., *Contact Lens & Anterior Eye*, 2023](https://research.aston.ac.uk/en/publications/the-effects-of-breaks-on-digital-eye-strain-dry-eye-and-binocular/)). A meta-analysis of 22 studies also found short breaks under ten minutes raised energy and cut fatigue, with no significant change in output ([Albulescu et al., *PLOS ONE*, 2022](https://doi.org/10.1371/journal.pone.0272460)). On the other hand, a 2023 tablet-reading study found no benefit from the specific 20-20-20 rule. Both the interval and break length are configurable for that reason, and GazeKeeper doesn't promise to protect your eyesight.

## Limits and other Mac options

GazeKeeper is Mac-only, has no accounts, and doesn't sync settings across devices or to iOS. Because the fullscreen check only runs near a break, it won't pause the timer for a fullscreen app opened early in an interval until that window draws close.

Looking at other break apps on 21 October 2026: **Stretchly** is free, open-source and runs on macOS, Windows and Linux (built on Electron), making it the obvious choice if you work across OSes. **Time Out** by Dejal is on the Mac App Store with optional paid supporter plans, and **LookAway** is a paid Mac app that syncs to iPhone and iPad.

## Try it

Download [GazeKeeper.dmg](https://github.com/hridaya423/gazekeeper/releases/latest/download/GazeKeeper.dmg) (v0.1.0, Apple silicon and Intel, Developer ID signed and notarized) and drag it to Applications.

Or build from source with Xcode and XcodeGen:

```sh
brew install xcodegen
git clone https://github.com/hridaya423/gazekeeper
cd gazekeeper/gazekeeper
xcodegen generate
open GazeKeeper.xcodeproj
```

There's no account and no analytics. Settings and history stay in `~/Library/Application Support/GazeKeeper`, and the only network request is Sparkle checking for updates. Written in Swift 6 with SwiftUI and AppKit under Apache-2.0.

Site: [gazekeeper.hridya.tech](https://gazekeeper.hridya.tech). Source: [github.com/hridaya423/gazekeeper](https://github.com/hridaya423/gazekeeper).
