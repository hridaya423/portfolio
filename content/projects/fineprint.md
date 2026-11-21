---
title: "Fineprint"
headline: "Fineprint: a 1.2B local model that spots unfair clauses in terms of service"
summary: "A Chrome extension backed by a fine-tuned 1.2B model running locally on your laptop. It highlights costly clauses in terms of service and grades the page A to E."
kind: "Browser extension"
platform: "Chrome"
status: "Hackathon build"
category: "BrowserApplication"
license: "Apache-2.0"
publishedAt: "2026-10-22"
updatedAt: "2026-11-21"
repo: "https://github.com/hridaya423/fineprint"
award: "White Circle track winner, 2nd overall at Moonfire Build Night"
---

Mukesh Agrawal and I built Fineprint in three hours at Moonfire Build Night in London on 22 October 2026, where it won the White Circle track and placed 2nd overall. I handled the dataset, fine-tuning, evaluation and local serving pipeline, and Mukesh built the Chrome extension.

Open any terms-of-service page, click the extension icon, and a fine-tuned 1.2-billion-parameter model running on your laptop scans the page locally. It pulls out clauses that cost you money or rights, explains each one in plain English, and grades the agreement A to E without sending any text off your machine.

## What gets flagged

The classifier covers 18 clause categories, 7 of which count as red flags: free trials that roll into paid plans, no refunds, unilateral price rises, hard-to-cancel subscriptions, forced arbitration, and sharing data for ads.

The page grade depends strictly on how many distinct red flags appear. On live agreements, Spotify Premium gets a D while the New York Times and Netflix get a C. (It's a quick consumer sanity check, not legal advice.)

## Getting a 170-clause contract down to 14 seconds

Scanning a whole contract clause by clause with a local model started out taking 56 seconds. Cutting that down to about 14 seconds on an M4 Pro (`Q4_K_M`, ~700 MB, single run on Spotify Premium's 170 clauses) came from a handful of small optimisations stacked together.

First, the extension splits the page into individual clauses and lowercases them to match the training data. Instead of sending a verbose rubric every call, we fine-tuned directly against a 12-word system prompt (*"Flag this Terms of Service or privacy policy clause as JSON."*), which shrank each prompt from ~210 tokens to ~80 and sped inference up by roughly 3x.

Since most clauses in a terms page are harmless boilerplate, we also set a stop string on the JSON output `{"flags":[...],"plain":"..."}` so harmless clauses stop immediately after `{"flags": []`, costing about 5 output tokens. The extension sends 32 clauses concurrently to local `llama-server` and sorts clauses containing money-related words (`renew`, `trial`, `cancel`, `refund`, `fee`, `arbitration`) to the front of the queue so the first red flag pops up in 1 to 2 seconds. Clicking a card highlights that exact sentence on the page with the CSS Custom Highlight API without modifying the DOM.

## Training data and test scores

Labels come from expert-annotated public datasets (`UNFAIR-ToS` via LexGLUE, extra online terms, and `OPP-115` privacy policies), plus 503 clauses from 20 real subscription services and 1,200 synthetic clauses. Claude Sonnet 5.5 wrote the one-line plain-English explanation for each labelled clause without choosing any flags itself.

I scored the quantised GGUF model directly through `llama-server` on 1,607 test clauses from `UNFAIR-ToS` (1,435 of them harmless) so the numbers reflect real laptop inference:

| Model | Micro-F1 | Unfair-detection F1 | Harmless clauses flagged |
|---|---|---|---|
| Base `LFM2.5-1.2B` | 0.056 | 0.216 | 970 / 1,435 |
| Fineprint v1 | 0.778 | 0.823 | 21 / 1,435 |

Without fine-tuning, the base model flags roughly two-thirds of harmless clauses. Fineprint v1 (a 3-epoch full fine-tune at learning rate `2e-5` trained with White Circle's Halo on one H200) drops false flags from 970 to 21, with arbitration as its weakest category at 0.667 F1. The latest `v5` model was only scored on a validation set, so I'm reporting v1's test scores here.

## Limits

The repository has the extension, data pipeline and training scripts, though the fine-tuned weights (`fineprint-v5-Q4_K_M.gguf`) aren't hosted publicly yet. Unlike cloud AI summarisers that write free-form summaries (while sending the page to a third party), Fineprint only classifies into its 18 fixed labels, trained across 50 mostly English agreements, and needs `llama-server` running locally. On the browser side, the extension doesn't read iframes, shadow DOM or Chrome's PDF viewer, pages that render terms dynamically via JavaScript can return nothing, and the clause splitter breaks after `"e.g."`.

## Running it

The packaged extension is `fineprint-extension.zip` in the `v1.0` release. Once you have the model file locally, start `llama-server`:

```sh
brew install llama.cpp
llama-server -m fineprint-v5-Q4_K_M.gguf --port 8081 -np 32 -c 32768 -b 4096 -ub 2048 -fa on
```

Open `chrome://extensions`, turn on **Developer mode**, and click **Load unpacked** on the `chrome/` folder. Visit a terms page, click the extension icon, pick **Fine-tuned**, and hit **Check this page**.

For an offline demo, run `python3 -m http.server 8765 --bind 127.0.0.1 -d chrome/fixtures` and open `spotify_premium.html`.

Source: [github.com/hridaya423/fineprint](https://github.com/hridaya423/fineprint) (Apache-2.0).
