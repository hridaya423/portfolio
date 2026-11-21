---
title: "Waypoint"
headline: "Waypoint: hands-free London bus guidance for Even G2 smart glasses"
summary: "A prototype Even Hub app for Even G2 glasses that guides London walks and bus rides, detects boarding and alighting from GPS movement, and nudges you before your stop."
kind: "Smart-glasses app"
platform: "Even G2 glasses"
status: "Prototype"
category: "TravelApplication"
license: "Apache-2.0"
publishedAt: "2026-10-03"
updatedAt: "2026-11-21"
repo: "https://github.com/hridaya423/waypoint-g2"
image: "/projects/waypoint.jpg"
---

Waypoint is a prototype Even Hub app for Even G2 smart glasses that handles London walks and bus rides without making you pull your phone out of your pocket. It guides you to the stop, detects from your movement that you've boarded, counts down stops along the ride, nudges you before yours, and switches back to walking directions once you step off.

I haven't tested Waypoint on physical G2 glasses yet; everything here runs against the official Even Hub simulator and scripted GPS replays.

![A 576×288 green-on-black simulator frame showing a walking prompt ("Continue to Trafalgar Square, 60 m") beside a live street map drawn from OpenStreetMap data.](/projects/waypoint/map-walk.png)

## Figuring out when you got on the bus

The journey engine in `src/journey.ts` is plain TypeScript with no dependencies on React, the network or the glasses SDK. To treat you as boarded without any tap, all four conditions have to hold:

- Your boarding stop belongs to a validated TfL bus stop sequence.
- You got a GPS fix within 25 m of that stop with 20 m accuracy or better.
- At least three movement samples then span 12 seconds and 90 m at 5–25 m/s, with gaps of 8 seconds or less.
- The destination is still more than 100 m away.

That 5 m/s floor came from a regression where jogging looked like boarding a slow bus. Detecting the final walk works in reverse: several walking-speed fixes moving at least 30 m off the bus route switch the HUD back to street directions. If Waypoint ever guesses wrong, undoing the guess disables automatic inference for the rest of that leg, and rail legs stay manual. Every threshold here is an uncalibrated assumption until I take it onto real buses.

## Why TfL stop IDs needed reconciling

Early on, TfL's Journey API gave a boarding stop ID of `490013767A`, while the line sequence endpoint called the exact same physical stop `490013767C`. Rather than trusting raw IDs, Waypoint only reconciles two stops if they sit within 20 m of each other, share the same non-empty stop letter, and match on ordered intermediate stop names, stop count and route geometry. A mutation-checked regression test guards that rule.

## Fitting a 576×288 HUD over four tiles

One canvas in `src/renderHud.ts` renders both the phone preview and the glasses HUD. Because the G2 screen is 576×288 pixels while the Even SDK limits a single image transfer to 288×144, `src/glasses.ts` cuts each frame into four tiles, skips unchanged tiles, and merges pending updates. Since tiles arrive one after another, you can occasionally catch a split frame mid-transition.

Touch gestures had a small surprise too: a small interactive widget caught taps fine but ignored swipes, so Waypoint places an invisible blank text container over the full 576×288 display to receive swipes cleanly.

![A contact sheet of Waypoint simulator screens walking through an entire trip: route selection, walking step, boarding, riding with stops remaining, press stop, get off and arrived.](/projects/waypoint/glasses-contact-sheet.png)

## Tested in simulation, untested on real hardware

The repo has 38 automated tests, 22 simulator HUD cases, and a full-trip rehearsal that feeds 31 synthetic GPS fixes through the engine from start to arrival with zero taps. That confirms the state machine follows a scripted journey, not that noisy real-world GPS in central London will cooperate.

Everything tied to physical hardware is still unchecked: wake and display behaviour, locked-phone backgrounding, Bluetooth reconnects, the microphone, stop-reminder timing, battery life, daylight legibility and real GPS drift. TfL stop predictions also don't identify your specific vehicle, underground alerts aren't guaranteed, new routes require a connection, and there's no voice destination entry or disruption rerouting yet. It's London-only, and hitting anonymous TfL access plus the public Overpass API from a terminal has already turned up 429, 406 and timeout responses.

Google Maps, Apple Maps and Citymapper are obviously far more complete on a phone. Waypoint isn't trying to replace them; it's an experiment in seeing how quiet transit directions can get when they live on glasses.

## Try the simulator

Needs Node 22.18 or later, with no API keys or backend:

```sh
git clone https://github.com/hridaya423/waypoint-g2
cd waypoint-g2
npm ci
npm run dev
```

Open `http://localhost:5173/?rehearsal=full-trip` and click **Advance journey** to step through a trip without GPS. On Apple silicon Macs, `npm run sim` launches the official Even Hub simulator.

Source: [github.com/hridaya423/waypoint-g2](https://github.com/hridaya423/waypoint-g2) (Apache-2.0).
