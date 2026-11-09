---
title: "Fineprint"
headline: "Fineprint: a 1.2B model that flags unfair terms on your own laptop"
summary: "Fineprint is a Chrome extension with a fine-tuned 1.2B model that flags costly clauses in terms of service on your machine and grades the page A to E."
kind: "Browser extension"
platform: "Chrome"
status: "Hackathon build"
category: "BrowserApplication"
license: "Apache-2.0"
publishedAt: "2026-10-22"
updatedAt: "2026-11-09"
repo: "https://github.com/hridaya423/fineprint"
award: "White Circle track winner, 2nd overall at Moonfire Build Night"
---

Fineprint is a Chrome extension and a fine-tuned model with 1.2B parameters. It reads a terms-of-service page on your own machine. It quotes each clause that costs you money or rights and grades the page from A to E. Fineprint is for people who click "I agree", and no text leaves the device.

I built the model, the data, the evaluation and the pipeline. Mukesh Agrawal built the Chrome extension. We made Fineprint at Moonfire Build Night in London on 22 October 2026, a 3-hour hackathon. It won the White Circle track and placed 2nd overall.

## What Fineprint flags

Fineprint flags free trials that turn into paid plans, no refunds, price rises, hard cancellation, forced arbitration and data shared for ads. The labels have 18 categories, and 7 of them are red flags.

The grade depends only on the number of distinct red flags on the page. On real pages, the Spotify Premium terms get a D, and the New York Times and Netflix terms get a C. The grade is not legal advice.

## Why Fineprint is fast

The model has one narrow job: it answers one question for each clause, in a fixed format.

1. The extension splits the page into clauses and makes them lowercase, because the training text is lowercase.
2. The model is a full fine-tune on a 12-word system prompt: "Flag this Terms of Service or privacy policy clause as JSON." A longer instruction cost about 210 tokens for each request. The short one costs about 80 and made the model about 3 times faster.
3. The reply is `{"flags":[...],"plain":"..."}`. The request sets a stop string, so a harmless clause ends immediately after `{"flags": []`, at about 5 output tokens.
4. The extension sends 32 clauses at a time to a local llama-server.
5. Clauses with money words (renew, trial, cancel, refund, fee, arbitration) go first. So the first red card appears in 1 to 2 seconds.

A click on a card highlights the clause with the CSS Custom Highlight API, so the page itself does not change.

## Where the labels come from

The labels come from public datasets that experts labelled: UNFAIR-ToS (through LexGLUE), extra online terms, and the OPP-115 privacy policies. I added 503 clauses from 20 real subscription services and 1,200 synthetic clauses. Claude Sonnet 5.5 wrote the plain-English sentence for each clause. It did not choose a flag.

## How Fineprint scores

I scored the quantized GGUF model through llama-server, so the numbers match what runs on a laptop. The test set is 1,607 clauses from UNFAIR-ToS, and 1,435 of them are harmless.

| Model | Micro-F1 | Unfair-detection F1 | Harmless clauses flagged |
|---|---|---|---|
| Base LFM2.5-1.2B | 0.056 | 0.216 | 970 of 1,435 |
| Fineprint v1 | 0.778 | 0.823 | 21 of 1,435 |

The base model, with no fine-tuning, flags most harmless clauses, so most of its flags are wrong. Fineprint v1 is a full fine-tune: 3 epochs at a learning rate of 2e-5, on the Halo tool from White Circle and one H200. Its weakest category is arbitration, at 0.667 F1.

The shipped model is v5. I scored v5 only on a validation set, so I do not report its scores here.

On an M4 Pro with the Q4_K_M model (about 700 MB), the Spotify Premium terms have 170 clauses and take about 14 seconds. My first version took 56 seconds on a similar page. That is one run on one machine.

## Limits of Fineprint

- The fine-tuned model file is not public. The repository has the code, the data pipeline and the extension, but not the weights.
- Fineprint sorts clauses into a fixed set of 18 labels. It does not write free-form summaries.
- The extension does not read iframes, shadow DOM or the PDF viewer. A page that builds its terms with JavaScript can return nothing.
- The clause splitter breaks after "e.g.".
- Fineprint needs llama-server on your machine.
- The labels come from 50 terms-of-service documents, most of them in English.

## Fineprint compared with cloud AI summarizers

Cloud AI summarizers write free-form summaries, which Fineprint does not. They also send each page to a third party. Fineprint is less flexible, and it keeps the text on your machine.

## Try Fineprint

The packaged extension is in the v1.0 release as `fineprint-extension.zip`. The steps below need the model file `fineprint-v5-Q4_K_M.gguf`, which is not public. Start the local server first:

```sh
brew install llama.cpp
llama-server -m fineprint-v5-Q4_K_M.gguf --port 8081 -np 32 -c 32768 -b 4096 -ub 2048 -fa on
```

Then open `chrome://extensions`, turn on Developer mode, and choose Load unpacked on the `chrome/` folder. Open a terms page, click the icon, choose Fine-tuned, and click "Check this page".

For an offline demo, run `python3 -m http.server 8765 --bind 127.0.0.1 -d chrome/fixtures` and open `spotify_premium.html`.

Source: [github.com/hridaya423/fineprint](https://github.com/hridaya423/fineprint) (Apache-2.0).
