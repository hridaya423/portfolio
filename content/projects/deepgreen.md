---
title: "Deep Green"
headline: "Deep Green: a 6 MB Wordle network that matches the optimal solver"
summary: "A 6.2 MB neural network that picks the same Wordle guess as a certified optimal solver on all 5,022 test words. No search. It runs in your browser."
kind: "Machine learning"
platform: "Web"
status: "Open source"
publishedAt: "2026-09-23"
updatedAt: "2026-11-04"
site: "https://deepgreen.hridya.tech"
repo: "https://github.com/hridaya423/deepgreen"
image: "/projects/deepgreen.jpg"
---

Deep Green is a 6.2 MB neural network that plays Wordle in your browser. On its 5,022-word benchmark it makes the same guess as a certified optimal solver at every position in the census, with no search and no lookup table. It's for anyone curious how small a network can get and still match an exact solver.

![The Deep Green Challenge screen with the word CRANE typed in and a Solve my word button](/projects/deepgreen/challenge.png)

The Challenge tab takes any of the 5,022 words, in normal or hard mode, and shows the network solving it.

## One forward pass per guess

Deep Green sees only the public board: the guesses so far and the colors each one got. It scores every word in the vocabulary and plays the highest score.

The network has 1,550,400 parameters. Embeddings for letters, colors and positions feed row mixers, then a board layer with a turn gate, then a bilinear scorer against each candidate word. The weights are 6,203,736 bytes in float32, and the browser runs them in TypeScript.

## Where the right answers come from

I used Alex Selby's exact solver, vendored in the repo, to build an optimal strategy tree for each mode. The network trained on that tree by behavior cloning, plus rounds of DAgger. The tree trains and scores the network but never plays.

## What "certified" means

The network's choice equals the optimal tree's choice at every position in the census of the 5,022-word benchmark. The public proof receipt (`web/model/proof.json`) records this as exact action parity, with a largest logit difference of 6.26e-07 against the NumPy reference.

A separate firewall audit checked that the network sees only the public board and never touches sealed evaluation data. It passed 9 checks. The release is hash-sealed, and a clean-room reproduction gate passed.

## It never loses on its list

I played every word in the list as the answer. The totals come from the verification report, and I got the means by dividing each total by 5,022.

| Mode | Losses | Total guesses | Mean guesses | Worst case |
|---|---|---|---|---|
| Normal | 0 | 18,742 | 3.732 | 6 |
| Hard | 0 | 20,278 | 4.038 | 6 |

In normal mode the number of words solved in 1 to 6 guesses is 1, 77, 1,873, 2,463, 532 and 76.

The benchmark is OpenWordle-v1: SCOWL and WordNet 3.0 five-letter lemmas, a uniform prior, a loss scored as 7. It isn't the New York Times list.

## Limits

- The certification covers one frozen list of 5,022 words. It says nothing about the New York Times answers or today's puzzle.
- The Assist tab suggests a guess for a real game, but a real game can't be certified, so the page labels those suggestions EXHIBITION.
- The means above are over all 5,022 words as answers. They don't compare with the classic 2,315-answer figures.

## Against other solvers

On the classic 2,315-answer list, Cunanan and Thielscher (IJCAI 2023) prove that SALET is the optimal opener, with a mean of 3.421 guesses in normal mode. I haven't run Deep Green on that list, so I can't say how close it gets.

Talon Townsend's wordle-neural-solver is also a board-only network, at 2.9M parameters. The author reports 99.56% wins on a 14,855-word set. The word sets differ, so those numbers don't compare with mine.

Search-based solvers can prove optimality on a list. Deep Green imitates the optimal tree in one forward pass, in 6 MB.

## Try it

Open [deepgreen.hridya.tech](https://deepgreen.hridya.tech). The About page shows a live solve and the proof status. To run it locally:

```
uv sync --extra dev
cd web && npm ci && npm run build
uv run wordle play serve --port 3101
```

Source: [github.com/hridaya423/deepgreen](https://github.com/hridaya423/deepgreen).
