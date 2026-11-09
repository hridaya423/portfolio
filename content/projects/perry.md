---
title: "Perry"
headline: "Perry: AI help in your Mac's notch that points at the button, or clicks it"
summary: "Perry is a free, open-source Mac app in the notch. Ask how to do something and it points at each control in turn, or it does the task while you watch."
kind: "macOS app"
platform: "macOS 14 or later, Apple silicon"
status: "Public beta"
category: "UtilitiesApplication"
license: "AGPL-3.0"
publishedAt: "2026-11-04"
updatedAt: "2026-11-09"
site: "https://perry.hridya.tech"
repo: "https://github.com/hridaya423/perry"
image: "/projects/perry.jpg"
---

Perry is a free, open-source Mac app that runs in the notch. Ask how to do something in any app, and Perry points at the first control. It waits for you to click that control, then points at the next one. Ask Perry to do the task, and it does the work while you watch, with a stop button in reach.

Hold Control and Option and talk, or double-tap Control and type. Perry has no account and no subscription. It uses the ChatGPT or Claude plan that you already pay for, or an API key.

![The Perry workspace opened from the notch, with a greeting, an "Ask Perry anything" field, and Tasks, Routines, Files, Suggestions and History in the sidebar.](/projects/perry/hero.jpg)

## Show me how, or do it for me

Most AI help tells you where a setting is. Then you must find it yourself. Perry draws on your screen.

In a guide, Perry points at one control and waits. When the screen changes, it points at the next control. Click **Do it for me** at any step, and Perry continues the task from there.

![A guide step in the notch: "Step 2, Choose the project folder in the sidebar", with Done and Do it for me buttons.](/projects/perry/guide.jpg)

In a task, Perry works in the background and logs each action. You can pause it, take over or stop it. Perry can also answer a question about the window in front of you. If you show it a task once, it can save that task as a routine.

![A running task in the notch: "Preparing meeting notes, Writing the outline", with a progress bar and Pause, Take over and Stop buttons.](/projects/perry/task.jpg)

The idea is not new. [clicky](https://github.com/farzaa/clicky) showed that people want a voice helper that draws on their screen. [openclicky](https://github.com/jasonkneen/openclicky) took the idea into agents. Perry adds a trust model and works with the model you bring.

## Two drivers beat one

Perry plans with your model, acts through [agent-desktop](https://github.com/vercel-labs/agent-desktop) and checks the screen after each step. [cua-driver](https://github.com/trycua/cua) does the clicks and drags that agent-desktop misses, and it does not move your cursor.

I tested that pair against cua alone with a torture fixture: 32 hard cases, three runs each, on a Mac mini.

| Driver | Passed | p50 for each action |
|---|---|---|
| cua alone | 65 of 96 | 520 ms |
| agent-desktop 1.0.2 + cua | 71 of 96 | 229 ms |
| agent-desktop 1.1.0 + cua | 74 of 96 | 387 ms |

I stayed on 1.0.2. The newer version passed three more cases but was 100 to 160 ms slower for each call.

The fixture also found a serious bug. Perry repeated each click that agent-desktop reported as `delivered_unverified`. A button that works reports exactly that status, so a burst of 20 clicks became 40. Now Perry follows the rule of agent-desktop and retries only a click marked `not_delivered`.

Some cases fail in both drivers, and Perry cannot fix them. A button can report a press that did not work. Canvas input in a background window does not arrive. Windows in the Stage Manager strip stay out of reach.

## The browser needed its own lane

A click on a web page through the accessibility tree is slow and fragile. So I ran 12 hard web tasks against [browser-harness](https://github.com/browser-use/browser-harness), which drives Chrome over the DevTools protocol. Both sides used Claude Sonnet 5.5 with the same prompt.

The tasks include closed shadow-DOM comboboxes, a virtual list of 10,000 rows and a drag-and-drop kanban board. They also include a canvas chart with peaks 0.1 kW apart, and a layout shift that hides a destructive decoy.

| Setup | Passed | Median time | Total cost |
|---|---|---|---|
| browser-harness | 12 of 12 | 20 s | $0.63 |
| Perry, clicking the screen | 7 of 12 | 38 s | $3.64 |
| Perry with a browser lane | 11 of 12 | 14 s | $0.72 |

The browser lane is a Swift port of browser-harness: 17 `browser.*` tools over one WebSocket to Chrome.

Before the lane, one invoice task took Perry 313 s, because it scrolled through the screen. browser-harness did the same task in 31 s, because it set the scroll position from JavaScript. With the lane, the one miss was the checkout task, which Perry refuses on purpose.

## What Perry will not touch

Each action gets a tier before it runs.

| Tier | Examples | What Perry does |
|---|---|---|
| Green | Move the pointer, highlight, read a window | Goes ahead |
| Yellow | Type, click, create a file | Goes ahead and logs it |
| Orange | Send a message, move to Trash, overwrite | Asks once |
| Red | Empty the Trash, buy something, use credentials | Asks and shows the full path |

Perry blocks banking, password manager and checkout windows at every tier. It refuses to capture them at all. Perry treats text on a page as content, never as an instruction.

The rules only work if tests cover them. My first version of `browser.connect` fell back to "the first running browser". It turned on remote debugging in my real Chrome on the Mac mini. I turned it off again. Now Perry only touches the browser you name or the browser in front, and a test covers that rule.

## Small models need bigger pictures

Before I set the defaults, I measured how well small local models find click targets. The models got 60 samples from ScreenSpot-Pro (Word, Excel, VS Code, PyCharm, DaVinci and macOS) on an M4 Pro.

Image detail mattered more than model size.

| Model | Image tokens | Targets found |
|---|---|---|
| Holo-3.1-4B | 2048 | 31 of 60 |
| Holo-3.1-9B | 1024 | 20 of 60 |
| Holo-3.1-9B | 2048 | 30 of 60 |

At 2048 image tokens, the 9B model found one target fewer than the 4B model and took 1.7 times as long for each step.

Cloud models stay the default. Without a cloud model, Perry answers in text. Local servers such as Ollama also work.

## Limits of Perry

- Perry is a public beta, version 0.1.0. Report problems in [Issues](https://github.com/hridaya423/perry/issues).
- It runs only on Apple silicon Macs with macOS 14 or later.
- Background drags do not reach Chrome yet.
- After a burst of 50 scrolls, Chrome stopped answering the accessibility API for about a minute.
- The DMG is 132 MB. It bundles a pinned Codex runtime for ChatGPT plans.

## Try Perry

Download Perry-0.1.0.dmg from the [latest release](https://github.com/hridaya423/perry/releases/latest) and drag Perry to Applications. Perry explains Accessibility, Screen Recording and Microphone access before macOS asks for each one. The app is signed and notarized, and later versions arrive through the built-in updater.

Site: [perry.hridya.tech](https://perry.hridya.tech). Source: [github.com/hridaya423/perry](https://github.com/hridaya423/perry) (AGPL-3.0).
