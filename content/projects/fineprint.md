---
title: "Fineprint"
headline: "Fineprint: a 1.2B model that flags unfair terms on your own laptop"
summary: "Fineprint is a Chrome extension with a fine-tuned 1.2B model that flags costly clauses in terms of service on your machine and grades the page A to E."
kind: "On-device AI"
platform: "Chrome"
status: "Hackathon build"
publishedAt: "2026-10-22"
updatedAt: "2026-11-04"
repo: "https://github.com/hridaya423/fineprint"
award: "White Circle track winner, 2nd overall at Moonfire Build Night"
---

Fineprint is a Chrome extension and a fine-tuned 1.2B-parameter model that reads a terms-of-service page on your own machine. It quotes each clause that costs you money or rights and grades the page from A to E. It's for people who click "I agree", and nothing leaves the device.

I built the model, data, evaluation and pipeline. Mukesh Agrawal built the Chrome extension. We made Fineprint at Moonfire Build Night in London on 22 October 2026, a 3-hour hackathon, and it won the White Circle track and placed 2nd overall.

## What it flags

Free trials that turn into paid plans, no refunds, price rises, hard cancellation, forced arbitration, data shared for ads. The labels have 18 categories, and 7 are red flags. The grade depends only on how many distinct red flags the page has. It isn't legal advice.

On real pages from the README, Spotify Premium terms get a D, and the New York Times and Netflix get a C.

## Why it's fast

The model has one narrow job: answer one question per clause, in a fixed format.

1. The extension splits the page into clauses and lowercases them, because the training text is lowercase.
2. The model is fully fine-tuned on a 12-word system prompt: "Flag this Terms of Service or privacy policy clause as JSON." A longer instruction used to cost about 210 tokens per request. The short one costs about 80 and made it about 3 times faster.
3. The reply is `{"flags":[...],"plain":"..."}`. The request sets a stop string, so a harmless clause ends right after `{"flags": []`, about 5 output tokens.
4. The extension sends 32 clauses at a time to a local llama-server.
5. Clauses with money words (renew, trial, cancel, refund, fee, arbitration) go first, so the first red card shows up in 1 to 2 seconds.

Clicking a card highlights the clause with the CSS Custom Highlight API, so the page itself doesn't change.

## Where the labels come from

Expert-labelled public datasets: UNFAIR-ToS (via LexGLUE), extra online terms, and OPP-115 privacy policies. I added 503 clauses from 20 real subscription services and 1,200 synthetic ones. Claude Sonnet 5.5 wrote the plain-English sentence for each clause and didn't choose any flags.

## Scores

I scored the quantized GGUF model through llama-server, so the numbers match what runs on a laptop. The test set is 1,607 clauses from UNFAIR-ToS.

| Model | Micro-F1 | Unfair-detection F1 | Harmless clauses flagged |
|---|---|---|---|
| Base LFM2.5-1.2B | 0.056 | 0.216 | 970 of 1,435 |
| Fineprint v1 | 0.778 | 0.823 | 21 |

The base model, with no fine-tuning, flags most harmless clauses, so most of what it flags is wrong. Fineprint v1 is a full fine-tune: 3 epochs at a learning rate of 2e-5, on White Circle's Halo tool and one H200. Its weakest category is arbitration, at 0.667 F1.

The shipped model is v5. The README scores it on a validation set and the repo has no metrics file for it, so I'm not reporting its scores here.

On an M4 Pro with the Q4_K_M model (about 700 MB), the 170-clause Spotify Premium terms take about 14 seconds. My first version took 56 seconds on a similar page. That's one run on one machine.

## Limits

- The fine-tuned model file isn't in the repo, and the README has no download link, so you can't run the fine-tuned model from the README alone. I still need to host it.
- It sorts clauses into a fixed set of 18 labels. It doesn't write free-form summaries.
- The extension doesn't read iframes, shadow DOM or the PDF viewer, so a page that builds its terms with JavaScript can come back empty.
- The clause splitter breaks after "e.g.".
- It needs llama-server running on your machine.
- The labels come from 50 mostly English terms-of-service documents.

## Against cloud summarizers

Cloud AI summarizers write free-form summaries, which Fineprint doesn't, and they send every page to a third party. Fineprint gives up the flexibility to keep the text on your machine.

## Try it

Source: https://github.com/hridaya423/fineprint. The packaged extension is in the v1.0 release as `fineprint-extension.zip`.

```
brew install llama.cpp
llama-server -m fineprint-v5-Q4_K_M.gguf --port 8081 -np 32 -c 32768 -b 4096 -ub 2048 -fa on
```

Then open chrome://extensions, turn on Developer mode, and choose Load unpacked on the `chrome/` folder. Open a terms page, click the icon, choose Fine-tuned, and click "Check this page".

For an offline demo, run `python3 -m http.server 8765 --bind 127.0.0.1 -d chrome/fixtures` and open `spotify_premium.html`.
