---
title: "Perry"
headline: "Perry: a Mac helper in your notch that points at the button, or clicks it for you"
summary: "A free, open-source macOS app tucked into the notch. Ask how to do something and it highlights each control in turn, or takes over and completes the task while you watch."
kind: "macOS app"
platform: "macOS 14 or later, Apple silicon"
status: "Public beta"
category: "UtilitiesApplication"
license: "AGPL-3.0"
publishedAt: "2026-11-04"
updatedAt: "2026-11-21"
site: "https://perry.hridya.tech"
repo: "https://github.com/hridaya423/perry"
image: "/projects/perry.jpg"
---

Perry is a free, open-source Mac helper that lives in the notch. Ask how to do something in any app and it draws a pointer directly onto the first control, waits for you to click it, then moves to the next one. Ask it to just do the task and it works through it while you watch, with a Stop button always within reach.

Hold Control + Option to talk, or double-tap Control to type. There's no Perry account or subscription: it runs on the ChatGPT or Claude plan you already pay for, an API key, or a local server such as Ollama.

![The Perry workspace opened from the notch, showing an "Ask Perry anything" input alongside Tasks, Routines, Files, Suggestions and History.](/projects/perry/hero.jpg)

## Guiding a click, or doing the whole task

When you ask a normal chatbot where a setting lives, you get six lines of menu names that moved two updates ago. In guide mode, Perry points straight at one control on your screen and waits for the UI to change before highlighting the next step. Clicking **Do it for me** at any point hands the rest of the task over to Perry.

![A Perry guide step inside the notch: "Step 2, Choose the project folder in the sidebar", with Done and Do it for me buttons.](/projects/perry/guide.jpg)

In task mode, Perry runs in the background while logging every step, and you can pause, take over or stop whenever you want. It can also answer questions about whatever window is in front of you, or watch you perform a task once and save it as a routine.

![A running Perry task in the notch: "Preparing meeting notes, Writing the outline", with a progress bar and Pause, Take over and Stop controls.](/projects/perry/task.jpg)

The core interaction builds on earlier projects: [clicky](https://github.com/farzaa/clicky) showed how good a voice helper that draws on screen feels, and [openclicky](https://github.com/jasonkneen/openclicky) pushed that toward agents. Perry adds a tiered trust model, BYO models, and a faster execution stack.

## Pairing two desktop drivers

Perry plans with your chosen model, drives macOS through [agent-desktop](https://github.com/vercel-labs/agent-desktop), and checks the screen after each step. Whenever `agent-desktop` misses a click or drag, [cua-driver](https://github.com/trycua/cua) handles it without moving your physical mouse cursor.

I tested that pairing against `cua` on its own using a 32-case torture fixture, three runs each, on a Mac mini:

| Driver setup | Passed | Median action latency |
|---|---|---|
| `cua` alone | 65 / 96 | 520 ms |
| `agent-desktop` 1.0.2 + `cua` | 71 / 96 | 229 ms |
| `agent-desktop` 1.1.0 + `cua` | 74 / 96 | 387 ms |

I stayed on `agent-desktop` 1.0.2 because 1.1.0 only passed three extra cases while adding 100–160 ms to every call.

That torture suite also caught a bad retry bug: Perry was repeating any click that `agent-desktop` returned as `delivered_unverified`, which happens to be what working buttons report, turning 20 clicks into 40. Now Perry only retries clicks marked `not_delivered`. A few OS quirks still trip both drivers: buttons that falsely report a press, canvas input sent to background windows getting dropped, and windows sitting in the Stage Manager strip staying unreachable.

## Giving Chrome its own lane

Clicking through web apps via the macOS accessibility tree is slow and fragile. To see how much it cost, I ran 12 difficult web tasks against [browser-harness](https://github.com/browser-use/browser-harness) (which drives Chrome over the DevTools Protocol), giving both sides Claude Sonnet 5.5 and the exact same prompt. The tasks included closed shadow-DOM comboboxes, a 10,000-row virtual list, a drag-and-drop kanban board, a canvas chart with peaks 0.1 kW apart, and a layout shift hiding a destructive decoy button.

| Setup | Passed | Median time | Total cost |
|---|---|---|---|
| `browser-harness` | 12 / 12 | 20 s | $0.63 |
| Perry (clicking the screen) | 7 / 12 | 38 s | $3.64 |
| Perry with browser lane | 11 / 12 | 14 s | $0.72 |

On one invoice task, screen-clicking Perry took 313 seconds scrolling manually while `browser-harness` set the scroll offset from JavaScript and finished in 31 seconds. Porting `browser-harness` to Swift as 17 `browser.*` tools over one WebSocket to Chrome brought Perry up to 11/12 at a fifth of the cost. The single miss was a checkout flow that Perry refuses on purpose.

## What Perry won't touch

Every action gets sorted into a tier before it runs:

| Tier | Examples | Behaviour |
|---|---|---|
| Green | Move pointer, highlight, read a window | Goes ahead |
| Yellow | Type, click, create a file | Goes ahead and logs it |
| Orange | Send a message, move to Trash, overwrite a file | Asks once |
| Red | Empty Trash, make a purchase, touch credentials | Asks and shows the full path |

Banking sites, password managers and checkout windows are blocked at every tier; Perry refuses to capture them at all, and treats all text on a page strictly as content rather than instructions.

Rules like that only hold if tests guard them. My first version of `browser.connect` fell back to "the first running browser" and turned on remote debugging in my personal Chrome window on the Mac mini. I shut that back off, locked Perry to only the browser you name or the frontmost browser, and wrote a test for it.

## Grounding with small local models

Before picking defaults, I checked how well small vision models locate UI click targets across 60 ScreenSpot-Pro samples (Word, Excel, VS Code, PyCharm, DaVinci Resolve and macOS) on an M4 Pro. Image resolution mattered more than parameter count:

| Model | Image tokens | Targets found |
|---|---|---|
| `Holo-3.1-4B` | 2048 | 31 / 60 |
| `Holo-3.1-9B` | 1024 | 20 / 60 |
| `Holo-3.1-9B` | 2048 | 30 / 60 |

At 2048 image tokens, the 9B model found one fewer target than the 4B model while taking 1.7x longer per step. Cloud models stay the default for now (without one configured, Perry replies in text), though local servers like Ollama also work.

## Limits

Perry is a public beta (`0.1.0`) for Apple silicon Macs on macOS 14 or later—bug reports go in [Issues](https://github.com/hridaya423/perry/issues). Background drags don't reach Chrome yet, and after a rapid burst of 50 scrolls Chrome stopped answering the accessibility API for about a minute. The download is 132 MB because it bundles a pinned Codex runtime to support ChatGPT subscriptions.

## Try it

Download `Perry-0.1.0.dmg` from the [latest release](https://github.com/hridaya423/perry/releases/latest) and drag it to Applications. Perry explains Accessibility, Screen Recording and Microphone access before macOS prompts for each one, ships signed and notarized, and pulls updates through its built-in updater.

Site: [perry.hridya.tech](https://perry.hridya.tech). Source: [github.com/hridaya423/perry](https://github.com/hridaya423/perry) (AGPL-3.0).
