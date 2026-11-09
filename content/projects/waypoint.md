---
title: "Waypoint"
headline: "Waypoint: London bus guidance on Even G2 glasses (prototype)"
summary: "Waypoint is a prototype that guides London walks and bus rides on Even G2 glasses. It detects boarding and stops with no taps. It is not yet tested on glasses."
kind: "Smart-glasses app"
platform: "Even G2 glasses"
status: "Prototype"
category: "TravelApplication"
license: "Apache-2.0"
publishedAt: "2026-10-03"
updatedAt: "2026-11-09"
repo: "https://github.com/hridaya423/waypoint-g2"
image: "/projects/waypoint.jpg"
---

Waypoint is an Even Hub app that guides London walks and bus rides on Even G2 smart glasses. You walk to the stop, follow the ride, get a reminder before your stop, then walk to the destination. Waypoint is for a G2 wearer in London who wants the phone to stay in a pocket. It detects from your movement that you boarded, so you never tap.

![A 576 by 288 simulator frame in green on black. It shows a walk step, "Continue to Trafalgar Square, 60 m", beside a street map drawn from OpenStreetMap data.](/projects/waypoint/map-walk.png)

## How Waypoint knows you boarded the bus

The journey engine in `src/journey.ts` is plain TypeScript. It does not depend on React, the network or the glasses SDK, and each rule below is in that file.

Waypoint treats you as on the bus only when all of these conditions are true:

- The stop is part of a validated TfL bus stop sequence.
- A location fix is within 25 m of the boarding stop, with an accuracy of 20 m or better.
- At least 3 movement samples then span 12 seconds and 90 m, at 5 to 25 m/s, with gaps of 8 seconds or less.
- The destination is more than 100 m away.

A regression with jogging is the reason for the lower limit of 5 m/s. Waypoint detects the final walk from several samples at walking speed that move at least 30 m away from the bus route.

If Waypoint guesses wrong, you can undo the guess. An undo turns off further inference for that leg. Rail is always manual.

Each threshold is a field assumption that I have not calibrated.

## Why Waypoint reconciles TfL stop IDs

The TfL Journey API gave a boarding ID of `490013767A`. The line sequence called the same physical stop `490013767C`.

Waypoint now accepts a match only when the two stops are within 20 m and share the same non-empty stop letter. The ordered intermediate stop names, the count and the route geometry must also agree. A mutation-checked regression test covers this rule.

## How Waypoint draws one display for the phone and the glasses

One canvas in `src/renderHud.ts` feeds both the phone preview and the glasses. The G2 display is 576 by 288 pixels, but the SDK limits one image to 288 by 144.

So `src/glasses.ts` sends four tiles. It skips tiles that did not change and merges updates that are still pending. The tiles arrive one after another, so you can see a mixed frame for a moment.

A blank text container that covers the full display captures touch. A small container received taps but not swipes.

![A contact sheet of Waypoint simulator frames: route choice, walk step, boarding, riding with stops left, press stop, get off and arrived.](/projects/waypoint/glasses-contact-sheet.png)

## What the Waypoint tests show

Waypoint has 38 automated tests and 22 simulator HUD cases. A rehearsal also sends 31 synthetic GPS fixes through the real engine, from walk to arrival, with no taps.

The rehearsal shows that the engine follows a scripted journey. It does not show that detection works in the real world.

## Limits of Waypoint

- I have not tested Waypoint on physical G2 glasses. Wake and display behaviour, phone lock, Bluetooth reconnect, the microphone, stop-reminder timing, battery, legibility and location accuracy are all untested.
- Stop predictions do not identify your vehicle, and Waypoint does not guarantee underground alerts. New routes need a connection.
- Waypoint covers London only. It has no voice destinations and no rerouting after disruption.
- Anonymous TfL access and the public Overpass service are pilot dependencies. From a terminal, I saw 429, 406 and timeout responses.

## Waypoint compared with Google Maps, Apple Maps and Citymapper

On a phone, all three are more complete and cover many more places. Waypoint does not replace them. It adds stop-by-stop bus reminders and automatic boarding and alighting detection on glasses, in London.

## Try Waypoint

You need Node 22.18 or later. Waypoint needs no API keys and no backend.

```sh
git clone https://github.com/hridaya423/waypoint-g2
cd waypoint-g2
npm ci
npm run dev
```

Open `http://localhost:5173/?rehearsal=full-trip` and press "Advance journey" for a demo without GPS. `npm run sim` starts the official Even Hub simulator on Apple silicon Macs.

Source: [github.com/hridaya423/waypoint-g2](https://github.com/hridaya423/waypoint-g2) (Apache-2.0).
