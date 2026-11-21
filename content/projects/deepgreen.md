---
title: "Deep Green"
headline: "Deep Green: a 6 MB neural network that plays certified-optimal Wordle"
summary: "A 6.2 MB neural network running in your browser that matches an exact optimal Wordle solver move for move across all 5,022 test words, with zero search."
kind: "Web app"
platform: "Web"
status: "Open source"
category: "GameApplication"
license: "Apache-2.0"
publishedAt: "2026-09-23"
updatedAt: "2026-11-21"
site: "https://deepgreen.hridya.tech"
repo: "https://github.com/hridaya423/deepgreen"
image: "/projects/deepgreen.jpg"
---

How small can a neural network get and still match an exact game-tree solver move for move? Deep Green is a 6.2 MB network running in TypeScript in your browser that plays Wordle with zero tree search and no lookup tables. Across its entire 5,022-word benchmark, it picks the exact same guess as a certified optimal solver at every reachable board position.

![The Deep Green Challenge screen with CRANE entered and a Solve my word button.](/projects/deepgreen/challenge.png)

In the Challenge tab you can type any of the 5,022 words (normal or hard mode) and watch the network solve it live.

## One forward pass, board only

Deep Green never sees candidate lists or hidden solver state. Its only input is the public board: the guesses played so far and the tile colours they got back.

The network has 1,550,400 parameters (`6,203,736` bytes in `float32`). Letter, colour and position embeddings feed into row mixers, followed by a board layer with a turn gate. At the end, a bilinear scorer scores every word in the vocabulary against the board state and plays the top word in a single forward pass.

To get optimal ground truth, I used Alex Selby's exact Wordle solver (vendored in the repo) to build an optimal strategy tree for both normal and hard modes. I trained the network on that tree with behaviour cloning followed by rounds of DAgger. The strategy tree trains and verifies the weights, then never ships in the app.

## What "certified" actually covers

Every reachable position in the benchmark census was checked exhaustively: the network's chosen move equals the optimal tree's move everywhere. The public proof receipt (`web/model/proof.json`) records that exact action parity, with the largest floating-point logit difference against the NumPy reference measuring `6.26e-07`. A separate firewall audit passed 9 checks confirming the model only reads the public board and never touches sealed evaluation data, and the release carries a hash seal with a clean-room reproduction gate.

Playing all 5,022 words in `OpenWordle-v1` as the secret answer (totals taken from the verification report and divided by 5,022 for the mean):

| Mode | Losses | Total guesses | Mean guesses | Worst case |
|---|---|---|---|---|
| Normal | 0 | 18,742 | 3.732 | 6 |
| Hard | 0 | 20,278 | 4.038 | 6 |

In normal mode, solves break down as 1 word in 1 guess, 77 in 2, 1,873 in 3, 2,463 in 4, 532 in 5, and 76 in 6.

## Word lists and limits

`OpenWordle-v1` is a frozen dictionary of 5,022 five-letter lemmas from SCOWL and WordNet 3.0 under a uniform prior (losses scored as 7). That certification says nothing about the New York Times answer list or today's puzzle—which is why the Assist tab stamps suggestions for live games as `EXHIBITION`.

Because the word sets differ, you shouldn't compare the means directly against classic Wordle figures either. On the 2,315-word NYT list, Cunanan and Thielscher (IJCAI 2023) proved `SALET` optimal at 3.421 guesses in normal mode (I haven't run Deep Green on that list). Talon Townsend's `wordle-neural-solver`—another board-only network, 2.9M parameters—reports 99.56% wins across 14,855 words. Traditional search solvers prove optimality by walking the tree; Deep Green compresses that policy into 6 MB of weights and one forward pass.

## Try it

Open [deepgreen.hridya.tech](https://deepgreen.hridya.tech) (the About page runs a live solve and displays the proof receipt), or serve it locally:

```sh
uv sync --extra dev
cd web && npm ci && npm run build
uv run wordle play serve --port 3101
```

Source: [github.com/hridaya423/deepgreen](https://github.com/hridaya423/deepgreen) (Apache-2.0).
