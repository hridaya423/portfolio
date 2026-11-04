---
title: "Waypoint"
headline: "Waypoint: London bus guidance on Even G2 glasses, prototype"
summary: "Waypoint is a prototype that guides London walks and bus rides on Even G2 glasses, detecting boarding and stops without taps. Not yet tested on glasses."
kind: "Smart-glasses app"
platform: "Even G2 glasses"
status: "Prototype"
publishedAt: "2026-10-03"
updatedAt: "2026-11-04"
repo: "https://github.com/hridaya423/waypoint-g2"
image: "/projects/waypoint.jpg"
---

Waypoint is an Even Hub app that guides London walks and bus rides on Even G2 smart glasses. Walk to the stop, follow the ride, get a reminder before yours, then walk to the destination. It's for a G2 wearer in London who wants the phone to stay in a pocket. It works out that you've boarded from your movement, so you never tap.

![A 576 by 288 simulator frame in green on black. It shows a walk step, "Continue to Trafalgar Square, 60 m", beside a street map drawn from OpenStreetMap data.](/projects/waypoint/map-walk.png)

## How Waypoint knows you boarded the bus

The journey engine in `src/journey.ts` is plain TypeScript with no dependency on React, the network or the glasses SDK, and every rule below lives there. Waypoint treats you as on the bus only when all of these hold:

- The stop is part of a validated TfL bus stop sequence.
- A location fix lies within 25 m of the boarding stop, with an accuracy of 20 m or better.
- At least 3 movement samples then span 12 seconds and 90 m, at 5 to 25 m/s, with gaps of 8 seconds or less.
- The destination is more than 100 m away.

A jogging regression is why the floor is 5 m/s. The final walk is detected from several walking-speed samples that move at least 30 m away from the bus route. If a guess is wrong you can undo it, which turns off further inference for that leg. Rail is always manual.

Every threshold is an uncalibrated field assumption.

## Why Waypoint reconciles TfL stop IDs

The TfL Journey API gave a boarding ID of `490013767A`. The line sequence called the same physical stop `490013767C`. Waypoint now accepts a match only when the two stops are within 20 m and share the same non-empty stop letter, and then only if the ordered intermediate stop names, the count and the route geometry also agree. A mutation-checked regression test covers it.

## How Waypoint draws one display for the phone and the glasses

A single canvas in `src/renderHud.ts` feeds both the phone preview and the glasses. The G2 display is 576 by 288 pixels, but the SDK caps one image at 288 by 144, so `src/glasses.ts` sends four tiles, skips unchanged ones and merges updates still pending. Tiles land one after another, so you can see a mixed frame for a moment.
A full-display blank text container captures touch. A small one received taps but not swipes.

![A contact sheet of Waypoint simulator frames: route choice, walk step, boarding, riding with stops left, press stop, get off and arrived.](/projects/waypoint/glasses-contact-sheet.png)

## What Waypoint's tests show

There are 38 automated tests, 22 simulator HUD cases and a rehearsal that pushes 31 synthetic GPS fixes through the real engine, from walk to arrival, with no taps. The rehearsal shows the engine follows a scripted journey. It doesn't show that detection works in the real world.

## Limits of Waypoint

- I haven't tested Waypoint on physical G2 glasses. Wake and display behaviour, phone lock, Bluetooth reconnect, the microphone, stop-reminder timing, battery, legibility and location accuracy are all untried.
- Stop predictions don't identify your vehicle, and underground alerts aren't guaranteed. New routes need a connection.
- It covers London only. Voice destinations and rerouting after disruption aren't built.
- Anonymous TfL access and the public Overpass service are pilot dependencies. From a terminal I saw 429, 406 and timeout responses.

## Waypoint compared with Google Maps, Apple Maps and Citymapper

On a phone, all three are more complete and cover far more places, and Waypoint doesn't replace them. What it adds is stop-by-stop bus reminders and automatic boarding and alighting on glasses, in London.

## Run Waypoint

You need Node 22.18 or later. There are no API keys and no backend.

```sh
git clone https://github.com/hridaya423/waypoint-g2
cd waypoint-g2
npm ci
npm run dev
```

Open http://localhost:5173/?rehearsal=full-trip and press "Advance journey" for a demo without GPS. `npm run sim` starts the official Even Hub simulator on Apple silicon Macs. Source: https://github.com/hridaya423/waypoint-g2
