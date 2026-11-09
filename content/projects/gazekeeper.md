---
title: "GazeKeeper"
headline: "GazeKeeper: a Mac break reminder that waits for you to stop typing"
summary: "GazeKeeper is a free macOS menu-bar app for 20-20-20 eye breaks. It holds them during calls and screen shares, then waits for a gap in your typing."
kind: "macOS app"
platform: "macOS 14 or later"
status: "Open source"
category: "HealthApplication"
license: "Apache-2.0"
publishedAt: "2026-10-22"
updatedAt: "2026-11-09"
repo: "https://github.com/hridaya423/gazekeeper"
site: "https://gazekeeper.hridya.tech"
image: "/projects/gazekeeper/og.png"
---

A break reminder on a plain timer fires in the middle of a meeting, and then you remove it. GazeKeeper is a free menu-bar app for macOS 14 or later that asks for the same break at a better time. Every 20 minutes it asks you to look into the distance for 20 seconds. It holds the break while you are on a call, share your screen or use a fullscreen app. Then it waits for a pause in your typing.

![The GazeKeeper card, set as an eye chart with the line "A break reminder for Mac that waits for the right moment" on the 20/20 row.](/projects/gazekeeper/og.png)

## A timer does not know what you are doing

A timer knows one thing: 20 minutes have passed. It does not know that your camera is on, or that you are halfway through a sentence.

GazeKeeper keeps the interval and changes two things. It freezes the countdown while a break would cost you something. It starts the break at a pause in your input.

The second change has research behind it. [Bailey and Iqbal (ACM TOCHI, 2008)](https://interruptions.net/literature/Bailey-TOCHI08.pdf) placed interruptions at the points where mental workload dips. People resumed their task faster and were less annoyed.

## One afternoon with the default settings

A call starts 12 minutes into a 20-minute interval.

| Time | Event | What GazeKeeper does |
|---|---|---|
| 14:00:00 | The countdown starts | The ring in the menu bar starts to empty. Nothing else appears. |
| 14:12:00 | Your camera turns on | The countdown freezes with 8 minutes left. There is no banner and no sound. |
| 14:19:00 | The call ends | The countdown continues from 8 minutes. |
| 14:26:00 | Heads-up | A small pill reads "Break in 1:00", with **Start now** and **Snooze 5m** buttons. |
| 14:27:00 | The break is due | GazeKeeper waits for 2 seconds without input, and for 30 seconds at most. |
| 14:27:02 to 14:27:30 | The break starts | An overlay covers every display for 20 seconds. |

A 30-second cooldown follows the break, and nothing becomes due during it. The next break is due 20 minutes after this one ends.

## Detectors read state and never read content

Four detectors can hold a break. Each one is a switch in Settings, and all four are on by default.

| Signal | What GazeKeeper reads | What it never reads |
|---|---|---|
| Camera | Whether any app uses a camera | The picture |
| Microphone | Whether any app captures audio | The sound |
| Screen sharing | Whether a share or recording runs | What is shared |
| Fullscreen | Whether the front window covers 90% of a screen | Window contents |
| App rules | Which app is in front | What you do in it |
| Typing pause | Seconds since your last key or click | Which keys |
| Calendar (off by default) | Start times of the next meetings | Anything else in the event |

The camera detector listens to CoreMediaIO for the fact that a camera device runs somewhere. It does not poll. It checks again when the set of cameras changes, for example when an iPhone connects as a Continuity Camera.

The microphone detector checks whether the default audio input runs, so an audio-only call counts. The screen-sharing detector looks for on-screen windows that `screensharingd` and `replayd` own, through `CGWindowListCopyWindowInfo`. That call needs no screen-recording permission.

The fullscreen detector checks whether the front window covers at least 90% of one screen. It runs only when a break is within two minutes, during the heads-up, or during a break.

You can also add a rule for one app. **Pause** holds the schedule while that app is in front. **Ignore** makes the fullscreen check skip that app.

When a detector fires, the countdown stops. When the signal clears, the countdown continues from the same point, and the hold does not use a snooze. If a signal starts during a break, the break ends and the log records it as interrupted.

## The pause in typing

GazeKeeper reads `CGEventSource.secondsSinceLastEventType`. That call returns the time since the last keyboard or pointer event. It needs no Accessibility permission, and it never returns a keystroke.

When the heads-up ends, the break starts after 2 seconds without input. If you continue to type, the pill reads "As soon as you pause…". After 30 seconds the break starts in any case, so a stuck key cannot block it.

## The defaults

I took these numbers from the code. I did not time them with a stopwatch.

| Setting | Default |
|---|---|
| Interval | 20 minutes (1 to 240) |
| Break length | 20 seconds (10 to 600) |
| Heads-up | 60 seconds before the break |
| Cooldown after a break | 30 seconds |
| Snoozes for each break | 2, of 5, 10 or 15 minutes each |
| Skip button | Appears 3 seconds into a break |
| Time away that counts as a break | 1 minute without input |
| Calendar rule | Off |

The calendar rule is narrow. A break that is due in the last two minutes before a meeting moves to three minutes before the meeting.

## What the research says

The evidence for break reminders is real, but the evidence for the exact numbers is thin.

- You blink about half as often while you look at a screen, according to the [American Academy of Ophthalmology](https://www.aao.org/newsroom/news-releases/detail/protect-your-eyes-in-home-office). Fewer blinks leave the surface of the eye drier.
- In a study of laptop users with symptoms, reminders to look away reduced dry-eye and strain symptoms. The benefit faded a week after the reminders stopped ([Talens-Estarelles et al., Contact Lens & Anterior Eye, 2023](https://research.aston.ac.uk/en/publications/the-effects-of-breaks-on-digital-eye-strain-dry-eye-and-binocular/)).
- A meta-analysis of 22 samples found that breaks of ten minutes or less raise energy and lower fatigue. The effect on output was not significant ([Albulescu et al., PLOS ONE, 2022](https://doi.org/10.1371/journal.pone.0272460)).
- A 2023 tablet-reading study found no benefit from the 20-20-20 rule. The numbers in the rule are a convention, not a finding.

For that reason the interval and the break length are both settings. A break app cannot promise to protect your vision.

## Limits of GazeKeeper

- GazeKeeper has no accounts, so settings do not sync between Macs. There is no iPhone or iPad version.
- The fullscreen check runs only near a break. GazeKeeper does not see a fullscreen app that opens early in an interval until then.

## GazeKeeper compared with Stretchly, Time Out and LookAway

I checked these tools on 21 October 2026.

- **Stretchly** is free, open source and built on Electron. It runs on macOS, Windows and Linux. Pick it if you need more than a Mac.
- **Time Out** by Dejal is in the Mac App Store and has optional paid supporter plans.
- **LookAway** is paid and syncs to iPhone and iPad, which GazeKeeper does not.

GazeKeeper is free and runs only on the Mac. It times breaks around your typing and your calendar.

## Try GazeKeeper

Download [GazeKeeper.dmg](https://github.com/hridaya423/gazekeeper/releases/latest/download/GazeKeeper.dmg), drag GazeKeeper into Applications and open it. Version 0.1.0 runs on Apple silicon and Intel Macs. It is signed with a Developer ID and notarized by Apple.

To build from source, you need Xcode and XcodeGen.

```sh
brew install xcodegen
git clone https://github.com/hridaya423/gazekeeper
cd gazekeeper/gazekeeper
xcodegen generate
open GazeKeeper.xcodeproj
```

GazeKeeper has no account and no analytics. Settings and break history stay in `~/Library/Application Support/GazeKeeper`. The only network request is the Sparkle update check.

The app is Swift 6 with SwiftUI and AppKit, under Apache-2.0. Site: [gazekeeper.hridya.tech](https://gazekeeper.hridya.tech). Source: [github.com/hridaya423/gazekeeper](https://github.com/hridaya423/gazekeeper).
