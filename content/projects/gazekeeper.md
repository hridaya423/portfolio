---
title: "GazeKeeper"
headline: "GazeKeeper: a Mac break reminder that waits for you to stop typing"
summary: "GazeKeeper is a free macOS menu-bar app for 20-20-20 eye breaks. It holds them during calls and screen shares, then waits for a gap in your typing."
kind: "Menu-bar app"
platform: "macOS 14+"
status: "Open source"
publishedAt: "2026-10-22"
updatedAt: "2026-11-04"
repo: "https://github.com/hridaya423/gazekeeper"
site: "https://gazekeeper.hridya.tech"
image: "/projects/gazekeeper/og.png"
---

GazeKeeper is a free break reminder for macOS 14 and later, for people who follow the 20-20-20 pattern: every 20 minutes, look into the distance for 20 seconds. It never fires in the middle of a call or a screen share, and it waits until you stop typing before the break appears.

![The GazeKeeper card, set as an eye chart with the line "A break reminder for Mac that waits for the right moment" on the 20/20 row.](/projects/gazekeeper/og.png)

## How GazeKeeper knows when a break would be rude

Four detectors read system state and never read content.

- Camera: it listens to CoreMediaIO for "a camera device is running somewhere". No polling, and it re-checks when the set of cameras changes, for example when an iPhone connects as a Continuity Camera.
- Microphone: it checks whether the default audio input is running.
- Screen sharing: it looks for on-screen windows owned by system sharing daemons such as `screensharingd` and `replayd`, through `CGWindowListCopyWindowInfo`. That needs no screen-recording permission.
- Fullscreen: it checks whether the front window covers at least 90% of a screen. This runs only when a break is within two minutes.

When one fires, the countdown pauses and later resumes where it stopped. A hold doesn't use up a snooze.

## Why GazeKeeper waits for a typing lull

Sixty seconds before a break, a heads-up pill appears ("Break in 1:00", with Start now and Snooze 5m). From then on GazeKeeper reads `CGEventSource.secondsSinceLastEventType`, which says how long ago the last input happened. It needs no Accessibility permission and never sees a keystroke.

The break starts after 2 seconds without input. If you keep typing, it starts 30 seconds after the heads-up anyway.

## GazeKeeper's defaults

The numbers below come from reading the code, not from a stopwatch. A break comes every 20 minutes and lasts 20 seconds. The heads-up is 60 seconds, the cooldown after a break is 30 seconds, and each due break allows 2 snoozes (5, 10 or 15 minutes from the menu). The skip button appears after 3 seconds.

One idle minute or more counts as a break. A calendar rule, off by default, moves a break that falls in the last 2 minutes before a meeting to 3 minutes before it.

## What GazeKeeper doesn't do

- The DMG is Apple silicon only.
- It has no accounts, so settings don't sync between Macs, and there's no iPhone or iPad version.
- The fullscreen check runs only near a break, so a fullscreen app that starts early in an interval goes unseen until then.
- The health benefit is uncertain. The project documentation cites studies where reminders reduced symptoms, and one 2023 study that found no benefit from 20-20-20. A break app can't promise to protect your vision.
- I haven't checked whether a signed and notarized release is published, so building from source is the safe route.

## GazeKeeper compared with Stretchly, Time Out and LookAway

I checked these on 21 October 2026. Stretchly is free, open source and built on Electron, and it runs on macOS, Windows and Linux. Pick it if you need more than a Mac. Time Out by Dejal is in the Mac App Store and has optional paid supporter plans. LookAway is paid and syncs to iPhone and iPad, which GazeKeeper doesn't. GazeKeeper is free and Mac-only, and it times breaks around your typing and your calendar.

## Try GazeKeeper

The site is at https://gazekeeper.hridya.tech. GazeKeeper is Swift 6 with SwiftUI and AppKit, under Apache-2.0, and you can build it yourself:

```sh
brew install xcodegen
git clone https://github.com/hridaya423/gazekeeper
cd gazekeeper/gazekeeper
xcodegen generate
open GazeKeeper.xcodeproj
```

Source: https://github.com/hridaya423/gazekeeper
