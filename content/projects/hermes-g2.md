---
title: "Hermes G2"
headline: "Hermes G2: a private Even G2 client for my Hermes agent"
summary: "Hermes G2 lets me talk to and approve actions of my self-hosted Hermes Agent from Even G2 glasses, through a bridge that never exposes the API key."
kind: "Smart-glasses app"
platform: "Even G2 glasses, Android"
status: "Prototype"
category: "CommunicationApplication"
publishedAt: "2026-08-07"
updatedAt: "2026-11-09"
repo: "https://github.com/hridaya423/hermes-even-g2"
image: "/projects/hermes-g2.jpg"
---

The quick way to control an agent from a phone is to put the API key of the agent in the app. Then anyone who takes the phone controls the agent. Hermes G2 is a client for Even G2 smart glasses that lets me talk to my own Hermes Agent, watch it and approve its actions. Hermes Agent is the open agent from Nous Research, and mine runs on a Mac mini.

I have not tested Hermes G2 on physical glasses yet. This page describes the code. Most of it is about the bridge between the glasses and the agent. Hermes G2 is a personal tool for a self-hosted setup, not an official client.

## The master API key stays on the Mac mini

One rule shapes the design: the master API key of Hermes never reaches the glasses or the phone.

```text
Even G2 glasses  ->  Even Hub app  ->  Tailscale Serve  ->  bridge (127.0.0.1)  ->  Hermes (127.0.0.1)
```

Hermes stays bound to the loopback address. A small FastAPI bridge also binds to `127.0.0.1`, and Tailscale Serve is the only path to it from outside the Mac mini.

A device gets access through a pairing code. The command `hermes-g2-bridge pair hub` prints a six-digit code. The app exchanges that code once for a device ID and a random credential. The bridge stores only an Argon2 hash of the credential, so a copy of its database does not give access.

Each kind of device gets a fixed set of scopes. The glasses app can read sessions, send prompts and audio, stop a run and answer an approval. It cannot manage devices or read the audit log. Only the Android app can revoke a device, and a revoked device does not affect the others.

## Each action names its target and carries a key

A radio link drops, and a client that hears no reply sends the request again. An approval that Hermes applies twice is a real fault. So each action carries an idempotency key of at least 8 characters.

```json
{
  "kind": "approveOnce",
  "deviceId": "<device id>",
  "idempotencyKey": "<unique key>",
  "sessionId": "<session id>",
  "runId": "<run id>",
  "createdAt": "2026-08-07T10:15:00Z",
  "payload": { "requestId": "<request id>" }
}
```

The bridge stores a SHA-256 hash of the request body under the device and the key. If the same request arrives again, the bridge returns the stored response and does not run the action again. If the same key arrives with a different body, the bridge answers with status 409.

The protocol has 17 kinds of action. The five that stop a run or answer an approval must name both the session and the run. The bridge also checks that the approval is still pending for that session and run. It rejects an approval that is stale or already resolved.

The glasses show approval choices exactly as Hermes returns them. A choice that persists, or that is sensitive, adds a second confirmation page. Speech can continue a conversation, but speech cannot choose a permission.

## The bridge checks what Hermes can do before it acts

A client must not show a control that the agent cannot perform. The bridge reads the capabilities that Hermes advertises and gates each feature on them.

- The bridge refuses changes to sessions unless Hermes advertises native sessions, streaming and session history.
- The approve and stop controls stay hidden unless Hermes advertises `session_run_control` and `session_approval_response`.
- A patch in `patches/` adds session run control to Hermes. It routes approve and stop through the existing Runs API of Hermes, and the same gate applies to it.

After a Hermes restart, the bridge reads the capabilities again before it rejects an action.

## A dropped connection loses no events

The bridge writes each event to a SQLite log and gives it a cursor, which is a number that only increases. There are 19 kinds of event, such as `run.started`, `tool.completed` and `approval.required`.

The Even Hub app connects over a WebSocket and sends the last cursor it saw. The bridge replays each later event and then streams new ones. The app acknowledges a cursor, and the bridge records it for that device.

## Speech becomes text on the Mac mini

The app sends recorded audio to the bridge. The bridge accepts signed 16-bit PCM at 16 kHz, up to 45 seconds. It rejects a clip that is almost silent. Then it runs a local Whisper binary on the Mac mini with a 30-second limit and deletes the temporary file. No audio goes to a hosted speech service.

## A display of 576 by 288 pixels

The G2 display is black with sixteen levels of green. With no colour, brightness carries state: 100% for text you can act on, 72% for content, 45% for metadata and 24% for rules.

The screen shows the most urgent state first. The order is an approval, a failure, an active checkpoint, then the final response.

## What the audit log keeps

The bridge records each accepted, rejected and failed action in an audit log. Before it writes an entry, it replaces secrets with `<redacted>` and home-directory paths with `<private-path>`.

## The Hermes G2 repository

- `services/bridge`: the FastAPI bridge with the cursor log, pairing, audit and local speech-to-text.
- `apps/hub`: a React and TypeScript Even Hub app on the official Even Hub SDK. It lists sessions, sends prompts and shows approvals.
- `apps/android`: a Kotlin and Compose fallback controller with a persistent event service.
- `packages/protocol`: a versioned JSON Schema for the messages.
- `packages/hermes-plugin`: a plugin that observes Hermes lifecycle events.
- `deploy`: launchd and Tailscale files for the Mac mini.

## Limits of Hermes G2

- I have not tested Hermes G2 on physical Even G2 glasses. Bluetooth timing, the microphone hand-off, power behaviour, gestures and the font glyphs on the real display are all unchecked.
- I have not tested the Android app against Doze, process death or a reboot.
- I have no end-to-end latency figure and no user numbers.
- Setup has external steps: a Mac mini that runs Hermes, Tailscale Serve and the Even Hub app, plus root-owned launch services.
- The repository has no licence, and it is not meant for public installation.

## Hermes G2 compared with the Hermes web and terminal clients

The Hermes web and terminal clients and ordinary phone chat apps are more capable, with a keyboard and a full screen. Hermes G2 offers three things they do not. It gives a hands-free surface on the glasses and approvals you can give there. Its bridge keeps the API key away from the client. It replays missed events from a cursor.

## Read the Hermes G2 code

Nobody can run Hermes G2 end to end without a Hermes instance and G2 glasses. You can run the bridge alone:

```sh
git clone https://github.com/hridaya423/hermes-even-g2
cd hermes-even-g2/services/bridge
uv sync --extra dev
uv run hermes-g2-bridge migrate
uv run hermes-g2-bridge serve
```

Source: [github.com/hridaya423/hermes-even-g2](https://github.com/hridaya423/hermes-even-g2).
