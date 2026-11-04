---
title: "Hermes G2"
headline: "Hermes G2: a private Even G2 client for my Hermes agent"
summary: "Hermes G2 lets me talk to and approve actions of my self-hosted Hermes Agent from Even G2 glasses, through a bridge that never exposes the API key."
kind: "Smart-glasses client"
platform: "Even G2 glasses, Android"
status: "Prototype"
publishedAt: "2026-08-07"
updatedAt: "2026-11-04"
repo: "https://github.com/hridaya423/hermes-even-g2"
image: "/projects/hermes-g2.jpg"
---

Hermes G2 lets me talk to my own Hermes Agent, watch it and approve its actions from Even G2 smart glasses. Hermes Agent is the open agent from Nous Research, and mine runs on a Mac mini. This is a personal tool for a self-hosted setup, not an official client. The part worth reading on for is the bridge in the middle, which keeps the agent's API key off the glasses and the phone.

## How the Hermes G2 bridge protects the agent

A small FastAPI bridge sits between the glasses and Hermes. Neither the glasses nor the phone ever holds the key to the agent.

- Hermes stays bound to the loopback address. Only the bridge is exposed, through Tailscale Serve.
- The master API key of Hermes never reaches the Android app or the Even Hub app.
- The bridge binds to `127.0.0.1`, accepts only hashed per-device bearer credentials, enforces scopes and requires an idempotency key on actions. It redacts audit metadata, including secrets and home-directory paths.

It also checks what Hermes can do before it acts. It refuses changes to sessions unless Hermes advertises native sessions, streaming and session history. The approve and stop controls stay hidden unless Hermes advertises `session_run_control` and `session_approval_response`. A patch in `patches/` adds session run control to Hermes and is gated the same way.

## How Hermes G2 recovers events after a dropped connection

The bridge writes every event to a SQLite log with a cursor. The Even Hub app stores the last cursor it saw and sends it on reconnect, and the bridge replays what it missed. The hub app reaches the bridge over a WebSocket. Speech becomes text on the Mac mini, where the bridge runs a local speech-to-text binary on the recorded audio.

## What's in the Hermes G2 repository

- `services/bridge`: the FastAPI bridge with the cursor log, pairing, audit and local speech-to-text.
- `apps/hub`: a React and TypeScript Even Hub app on the official Even Hub SDK. It lists sessions, sends prompts and shows approvals.
- `apps/android`: a Kotlin and Compose fallback controller with a persistent event service.
- `packages/protocol` and `packages/hermes-plugin`: a versioned JSON Schema for the messages, and a plugin that observes Hermes lifecycle events.

The default GitHub branch is `codex/hermes-g2`.

## What Hermes G2 hasn't been tested on

- I haven't tested Hermes G2 on physical Even G2 glasses. Bluetooth timing, the microphone hand-off, power behaviour, gestures and the font glyphs on the real display are all unchecked.
- I haven't tested the Android app against Doze, process death or a reboot.
- I have no end-to-end latency figure and no user numbers.
- Setup has external steps: a Mac mini running Hermes, Tailscale Serve and the Even Hub app, plus root-owned launch services.
- The repository shows no licence on GitHub, and it isn't meant for public install.

## Hermes G2 compared with the Hermes web and phone clients

The Hermes web and terminal clients and ordinary phone chat apps are more capable, with a keyboard and a full screen. Hermes G2 offers what they don't: a hands-free surface on the glasses, approvals you can give there, and a bridge that keeps the API key away from the client. It also replays missed events from a cursor.

## Read the Hermes G2 code

Nobody can run Hermes G2 end to end without a Hermes instance and G2 glasses. The README gives the local bridge loop:

```sh
git clone https://github.com/hridaya423/hermes-even-g2
cd hermes-even-g2/services/bridge
uv sync --extra dev
uv run hermes-g2-bridge migrate
uv run hermes-g2-bridge serve
```

Source: https://github.com/hridaya423/hermes-even-g2
