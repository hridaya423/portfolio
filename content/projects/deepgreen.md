---
title: "Deep Green"
headline: "Deep Green: a 6 MB Wordle network that matches the optimal solver"
summary: "A 6.2 MB neural network that picks the same Wordle guess as a certified optimal solver on all 5,022 test words. No search. It runs in your browser."
kind: "Web app"
platform: "Web"
status: "Open source"
category: "GameApplication"
license: "Apache-2.0"
publishedAt: "2026-09-23"
updatedAt: "2026-11-09"
site: "https://deepgreen.hridya.tech"
repo: "https://github.com/hridaya423/deepgreen"
image: "/projects/deepgreen.jpg"
---

Deep Green is a 6.2 MB neural network that plays Wordle in your browser. On its benchmark of 5,022 words, it makes the same guess as a certified optimal solver at each position in the census. It uses no search and no lookup table. Deep Green is for anyone who wants to know how small a network can be and still match an exact solver.

![The Deep Green Challenge screen with the word CRANE typed in and a Solve my word button.](/projects/deepgreen/challenge.png)

The Challenge tab takes any of the 5,022 words, in normal or hard mode, and shows how the network solves it.

## One forward pass for each guess

Deep Green sees only the public board: the guesses so far and the colours that each guess got. It scores each word in the vocabulary and plays the word with the highest score.

The network has 1,550,400 parameters. Embeddings for letters, colours and positions feed row mixers, then a board layer with a turn gate. A bilinear scorer then compares the board with each candidate word. The weights are 6,203,736 bytes in float32, and the browser runs them in TypeScript.

## Where the right answers come from

I used the exact solver by Alex Selby, vendored in the repository, to build an optimal strategy tree for each mode. The network trained on that tree by behaviour cloning, plus rounds of DAgger. The tree trains and scores the network but never plays.

## What "certified" means

At each position in the census of the benchmark, the choice of the network equals the choice of the optimal tree. The public proof receipt (`web/model/proof.json`) records this as exact action parity. The largest logit difference against the NumPy reference is 6.26e-07.

A separate firewall audit checked that the network sees only the public board and never reads sealed evaluation data. It passed 9 checks. The release has a hash seal, and a clean-room reproduction gate passed.

## Deep Green never loses on its list

I played each word in the list as the answer. The totals come from the verification report. I divided each total by 5,022 to get the means.

| Mode | Losses | Total guesses | Mean guesses | Worst case |
|---|---|---|---|---|
| Normal | 0 | 18,742 | 3.732 | 6 |
| Hard | 0 | 20,278 | 4.038 | 6 |

In normal mode, the number of words solved in 1 to 6 guesses is 1, 77, 1,873, 2,463, 532 and 76.

The benchmark is OpenWordle-v1: five-letter lemmas from SCOWL and WordNet 3.0, a uniform prior, and a loss scored as 7. It is not the New York Times list.

## Limits of Deep Green

- The certification covers one frozen list of 5,022 words. It says nothing about the New York Times answers or the puzzle of today.
- The Assist tab suggests a guess for a real game. A real game cannot be certified, so the page labels those suggestions EXHIBITION.
- The means above are over all 5,022 words as answers. They do not compare with the classic figures for 2,315 answers.

## Deep Green compared with SALET, wordle-neural-solver and search-based solvers

On the classic list of 2,315 answers, Cunanan and Thielscher (IJCAI 2023) prove that SALET is the optimal opener. Its mean is 3.421 guesses in normal mode. I have not run Deep Green on that list, so I cannot say how near it gets.

wordle-neural-solver by Talon Townsend is also a board-only network, with 2.9M parameters. The author reports 99.56% wins on a set of 14,855 words. The word sets differ, so those numbers do not compare with mine.

Search-based solvers can prove optimality on a list. Deep Green imitates the optimal tree in one forward pass, in 6 MB.

## Try Deep Green

Open [deepgreen.hridya.tech](https://deepgreen.hridya.tech). The About page shows a live solve and the proof status. To run Deep Green locally:

```sh
uv sync --extra dev
cd web && npm ci && npm run build
uv run wordle play serve --port 3101
```

Source: [github.com/hridaya423/deepgreen](https://github.com/hridaya423/deepgreen) (Apache-2.0).
