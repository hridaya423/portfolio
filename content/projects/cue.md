---
title: "Cue"
headline: "Cue: a Mac clipboard that pastes just the piece a field expects"
summary: "A macOS menu-bar clipboard that inspects the focused field and pastes only the matching slice of your clipboard, like an email address pulled from a chat message."
kind: "macOS app"
platform: "macOS 15 or later"
status: "Early release"
category: "UtilitiesApplication"
license: "MIT"
publishedAt: "2026-09-20"
updatedAt: "2026-11-21"
site: "https://cue.hridya.tech"
repo: "https://github.com/hridaya423/cue"
image: "/cue-site.png"
---

On 20 September 2026 I saw a demo [@marcus_lowe posted on X](https://x.com/marcus_lowe) of a smart clipboard and decided to rebuild it as a proper macOS background app. I called it `SmartCopyPaste` for a day before renaming it Cue.

Cue lives in your menu bar and looks at the input field your cursor is sitting in before pasting. If you copy a whole chat message and paste into an email's To field, only the email address drops in.

![A chat message is copied, then Cue pastes just the email address straight into the To field.](/projects/cue/demo.gif)

## Selecting from what you copied, never generating

Letting a language model rewrite clipboard text is a quick way to end up with a hallucinated digit in a phone number. Cue never lets the model generate text; it only scores candidates pulled directly from your clipboard history.

When you trigger a paste, `ContextCaptor` (`Sources/CueKit/Context.swift`) queries the macOS Accessibility API for the frontmost app, window title, and the focused element's role, label, placeholder, nearby text and web host, keeping each Accessibility call under a 50 ms budget. Because Chromium and Electron apps hide their page structure from Accessibility by default, Cue sets `AXManualAccessibility` whenever one of them becomes active; without that, browser fields show up with no label at all.

Next, Cue pulls your last 20 clips and pinned items (capped at 20 total). Each clip contributes its full text alongside any email addresses, phone numbers, URLs and code spans extracted from it, so "just the email" sits alongside the raw message as its own option.

A small model scores every candidate in a single forward pass. If the top pick clears a confidence threshold and a margin over second place, Cue pastes immediately. Otherwise it opens a small chooser right at the caret with up to nine ranked rows: press `1`–`9` or Return to pick, or Esc to paste plain text.

A lot of pastes never even wake the model. If a field clearly expects an email, phone number or URL and only one clip matches, Cue pastes straight away. Normal `Cmd+V` skips the model when your latest clip already fits. Password fields always receive a plain paste and Cue never reads their value. Any error falls back to plain paste, or a recent-history chooser if the model is offline.

Cue can run everything locally on your Mac by installing `uv` and a small model (0.7 to 4 GB of memory), prefetching answers whenever you copy or switch apps so the hotkey stays quick. If you choose a remote provider instead, an on-device CoreML model (~12 MB) redacts clip text first, and if redaction fails, nothing is sent.

## Benchmarks: synthetic cases and real windows

To measure the decision engine, I built `CueEval`: 110 synthetic cases run through the real macOS pipeline on Apple silicon. A case counts as **resolved** if the paste is exact or the right option appears in the chooser, and **wrong** if Cue pastes the wrong thing with confidence or opens a chooser when a plain paste was right. Variance between runs is about 4 points on resolved and 2 on wrong; each row below is a single run:

| Local model | Resolved | Wrong | p95 latency | Memory |
|---|---|---|---|---|
| Decider 0.8B | 92% | 1% | 249 ms | 3.0 GB |
| Kev 0.8B | 90% | 5% | 249 ms | 4.0 GB |
| JevK5-Lite (default) | 89% | 4% | 353 ms | 0.7 GB |
| system-one Qwen3 0.6B | 83% | 4% | 199 ms | 2.7 GB |

On 19 October 2026 I also drove real Chrome, Safari, TextEdit and Terminal windows with simulated keystrokes across two multi-step workflows:

| Scenario | Steps | Correct | Trimmed | Wrong or missed |
|---|---|---|---|---|
| A recruiter's day | 45 | 43 | 1 | 1 |
| An engineer's day | 44 | 42 | 0 | 2 |

Median hotkey wait across those live runs was 107 to 116 ms.

## What doesn't work well yet

Cue depends on macOS Accessibility, so any app with custom non-accessible inputs won't expose its fields. Early on, the chooser also popped up far too often: my target was a chooser on at most 20% of unambiguous cases, and three of the 0.8B models hit 45%, 50% and 78% before Decider 0.8B brought it down to 17–20%.

Clipboard history is currently saved as plain unencrypted JSON on disk (concealed and transient clipboard types are never recorded). Smart paste also writes plain text right now, dropping RTF, HTML and images while leaving the system clipboard modified. I don't have real-world user data yet, and I haven't benchmarked the hosted-model path.

Tools like Maccy, Paste, Raycast Clipboard History, Alfred and macOS 26's Spotlight clipboard are much more mature—Paste syncs across devices and Raycast keeps rich formats intact. They're built around showing you a list to pick from, whereas Cue tries to pick and slice automatically. I haven't timed Cue head-to-head against manual clipboard picking, so I make no speed claim there.

## Try it

Download [Cue.dmg](https://github.com/hridaya423/cue/releases/latest/download/Cue.dmg) (macOS 15+, signed and notarized), drag it to Applications, grant Accessibility permission, and choose a model during onboarding. Smart paste is `Ctrl+Opt+V`, and plain paste is `Ctrl+Opt+Shift+V`.

To build from source, use Xcode 26 and `Scripts/bundle.sh`. Site: [cue.hridya.tech](https://cue.hridya.tech). Source: [github.com/hridaya423/cue](https://github.com/hridaya423/cue) (MIT).
