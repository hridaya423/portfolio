---
title: "Cue"
headline: "Cue: a Mac clipboard that pastes only the part a field wants"
summary: "Cue is a macOS menu-bar clipboard that reads the focused field and pastes the part of your clipboard that fits, such as just the email. A model only picks."
kind: "macOS app"
platform: "macOS 15 or later"
status: "Early release"
category: "UtilitiesApplication"
license: "MIT"
publishedAt: "2026-09-20"
updatedAt: "2026-11-09"
site: "https://cue.hridya.tech"
repo: "https://github.com/hridaya423/cue"
image: "/cue-site.png"
---

Cue is a macOS menu-bar clipboard. It reads the field you are about to paste into and pastes only the part of your clipboard that fits. Copy a chat message, focus the To field of an email, and Cue pastes only the address. Cue is for people who copy a block of text and paste pieces of it into forms all day.

![A chat message is copied, then Cue pastes only the email address into the To field.](/projects/cue/demo.gif)

I rebuilt Cue as a real background app from a demo that @marcus_lowe posted on X. The first commit is from 20 September 2026, under the name SmartCopyPaste. I renamed it Cue the next day.

## The model picks, and never writes

Cue reads the focused field through the macOS Accessibility API. It builds candidate pastes from your clipboard history and asks a model to choose one. The model cannot write text. It can only choose from clips that you copied.

The reader is `ContextCaptor` in `Sources/CueKit/Context.swift`. It captures the frontmost app, the window title and the focused element: its role, label, placeholder, nearby text and web host. Each Accessibility message has a limit of 50 ms.

Chromium and Electron apps hide their pages from Accessibility. So Cue sets `AXManualAccessibility` when one of those apps becomes active. Without that attribute, a browser field has no label.

The options come from your last 20 clips and your pins, with a limit of 20. Each clip gives its whole text plus each email, phone number, URL and code span inside it. So "only the email" is one option among the others.

The model returns a probability for each option in one forward pass. Cue pastes at once when the first option passes a confidence threshold and a margin over the second. In other cases, it shows a chooser at the caret with up to nine ranked rows. Keys 1 to 9 or Return pick a row, and Esc pastes plain text.

Some cases never reach the model.

- A field of a clear type (email, phone or URL) with exactly one matching clip pastes with no model call.
- Cmd+V skips the model if the latest clip fits.
- Password fields get a plain paste, and Cue never reads their value.
- Each failure ends in a plain paste. If the model is not available, Cue shows a chooser of recent history.

Cue can run the model on your Mac. It installs `uv` and a model (0.7 to 4 GB of memory) and fetches the answer in advance when you switch apps or copy. Remote providers see clip text only after an on-device CoreML model (about 12 MB) redacts it. If the redaction fails, Cue sends nothing.

## 110 test cases, 89% resolved with the default model

I built CueEval for this: 110 synthetic cases that run through the real decision engine on Apple silicon.

A case is "resolved" if the paste is exactly right or the right answer shows in the chooser. A case is "wrong" if Cue pastes the wrong thing with confidence, or shows a chooser when plain paste was right. The spread between runs is about 4 points on resolved and 2 on wrong. Each row is one run, and I did not run them again for this page.

| Local model | Resolved | Wrong | p95 latency | Memory |
|---|---|---|---|---|
| Decider 0.8B | 92% | 1% | 249 ms | 3.0 GB |
| Kev 0.8B | 90% | 5% | 249 ms | 4.0 GB |
| JevK5-Lite (default) | 89% | 4% | 353 ms | 0.7 GB |
| system-one Qwen3 0.6B | 83% | 4% | 199 ms | 2.7 GB |

On 19 October 2026 I also drove real Chrome, Safari, TextEdit and Terminal with real keystrokes.

| Scenario | Steps | Correct | Trimmed | Wrong or missed |
|---|---|---|---|---|
| A day of a recruiter | 45 | 43 | 1 | 1 |
| A day of an engineer | 44 | 42 | 0 | 2 |

The hotkey wait had a p50 of 107 to 116 ms.

## What Cue gets wrong

- Cue needs Accessibility permission. A field that does not expose itself to Accessibility does not work.
- The chooser appears too often with the 0.8B models. My target was a chooser on at most 20% of unambiguous cases. Three models missed that target, at 45%, 50% and 78%. Later, the Decider 0.8B measured 17 to 20%.
- Cue stores history as plain JSON without encryption. It never records concealed or transient clipboard types.
- Smart paste writes plain text. In my last review, it lost RTF, HTML and image formats and left the clipboard changed.
- I have no data from real users, and I did not benchmark the hosted model option.

## Cue compared with Maccy, Paste, Raycast and Alfred

Maccy, Paste, Raycast Clipboard History, the Alfred clipboard and the Spotlight clipboard history in macOS 26 all show your history and let you pick. Cue picks for you and can paste one span of a clip. When it is not sure, it shows a short list.

Those tools are more mature. Paste syncs between devices, and Raycast keeps rich formats. I have not timed Cue against manual picking, so I make no speed claim.

## Try Cue

Download [Cue.dmg](https://github.com/hridaya423/cue/releases/latest/download/Cue.dmg) and drag Cue to Applications. Open it, grant Accessibility and pick a model in onboarding. Cue needs macOS 15 or later, and the DMG is signed and notarized. Smart paste is Ctrl+Opt+V, and plain paste is Ctrl+Opt+Shift+V.

To build from source, use Xcode 26 and `Scripts/bundle.sh`. Site: [cue.hridya.tech](https://cue.hridya.tech). Source: [github.com/hridaya423/cue](https://github.com/hridaya423/cue) (MIT).
