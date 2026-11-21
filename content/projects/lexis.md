---
title: "Lexis"
headline: "Lexis: a local model drafts the command, plain code decides if it runs"
summary: "Describe what you want in your terminal and a small local model writes the shell command. A rule-based policy engine runs it only if it's read-only or you approve it."
kind: "Command-line tool"
platform: "macOS, Linux and Windows"
status: "Open source"
category: "DeveloperApplication"
license: "Apache-2.0"
publishedAt: "2026-03-31"
updatedAt: "2026-11-21"
site: "https://lexis.hridya.tech"
repo: "https://github.com/hridaya423/lexis"
image: "/lexis-hero.png"
---

Early in testing Lexis, I asked the 1.5-billion-parameter model for "disk usage of /". It calmly suggested remounting `/` as `noexec`. That happened three times across harmless prompts, and it settled the design immediately: a small local model can draft shell commands, and ordinary code decides whether anything runs.

Lexis sits in your terminal so you can type what you're after in plain English when you can't remember the exact flags for `find`, `tar` or `lsof`. A local model writes one command for your OS, and a deterministic policy engine decides what happens next.

![The Lexis homepage showing an approval-card example: "start my repo fresh" translated to rm -rf .git && git init.](/lexis-hero.png)

## How the safety gate works

A shell hook catches lines that aren't real commands and passes them to a local `llama-server` (`llama.cpp`). The model sends back a single command, which goes straight into `lexis/src/policy.mjs`.

If the policy engine can prove the command is read-only, it runs immediately. Anything else pauses on an approval card where Enter runs it, `e` lets you edit it, and Esc cancels. Critical commands require typing `yes` in full.

The model has no way to lower a risk floor, and there isn't a flag to skip the critical prompt. Things like `sudo`, stopping a service or removing a package automatically push the risk floor up. Remote scripts piped straight to a shell and encoded commands always stop for approval. Any `rm -rf` touching your home directory, root or a wildcard is treated as critical, and before you confirm, the card counts up the blast radius in items and bytes.

Staying out of the way matters just as much. If a line already begins with a real command, flags or file paths, the hook hands it straight to your shell untouched, so a missing `gh` binary still prints a normal "command not found". Piped shells and shells spawned by coding agents never hit Lexis at all.

## 757 out of 919

I froze the test set before training anything, splitting it into a selection half for comparing checkpoints and a 919-case final half that I ran once per model. A case only passes if the very first command is right. The grader accepts known-good variants and occasionally executes commands inside a container, which slightly understates accuracy when a valid alternative isn't in the rubric. The full write-up is in `lexis/model-cards/METHODOLOGY.md`.

| Model | Final half (919 cases) | Warm p50 latency | Size |
|---|---|---|---|
| `lexis-1.5b` | 757 (82.4%) | ~0.25 s | 986 MB |
| `lexis-0.5b` | 714 (77.7%) | ~0.1 s | 398 MB |
| `Qwen2.5-Coder-0.5B-Instruct` (base) | 188 (20.5%) | — | — |

Latency comes from an Apple M4 Pro running the `Q4_K_M` weights. Seed noise on the selection score sits around 15 cases.

Both models are single-epoch full fine-tunes of `Qwen2.5-Coder` on roughly 140,000 rows. Every training row had to pass checks on its target OS: valid syntax, a command that actually exists, and every flag verified in the man page or `--help`, with a sample also executed inside an unprivileged Docker container. Anything overlapping the test sets was removed. A coding agent generated 62,502 of those rows and went through the same filter. In one targeted data pass, 3,591 rows went in and 2,711 survived.

## What didn't help

Moving from 0.5B to 1.5B on the same dataset bought five percentage points. Most of the training tweaks I tried didn't move the score:

- More epochs and higher learning rates just overfit.
- Two rounds of DPO lifted pair accuracy from 66% to 77%, while the actual selection score ticked down from 836 to 835.
- Targeted synthetic data added 5 and 9 cases on the final half, inside seed noise, and lowered the Windows score, so `lexis-1.5b` ships without it.

## Reading 217 failures

I went through 217 failed prompts from the 1.5B model by hand to see what was going wrong:

| Failure mode | Approximate cases |
|---|---|
| A tool the model simply didn't know | ~40 |
| Invented commands or flags (`rm -sf`, `dnf ininstall`) | ~30 |
| Missed a detail from the request | ~25 |
| Proposed a write when asked to inspect | ~12 |
| Broken syntax | ~8 |

A few other limits to know: web search is on by default in `auto` mode and queries DuckDuckGo (turn it off with `lx config set webSearch.enabled false`); the `apple-fm` provider is experimental and noticeably weaker; and I haven't published the training data, so you can't rebuild the weights from the repo alone.

Cloud tools like GitHub Copilot CLI and Warp AI sit on much larger hosted models, so they'll naturally handle a wider spread of obscure requests than a 1.5B model on your laptop. I haven't benchmarked Lexis against them. The reason to pick Lexis is local execution, no account or API key, zero telemetry, and a safety layer that lives in code outside the model.

## Install

On macOS or Linux:

```sh
curl -fsSL https://lexis.hridya.tech/install.sh | bash
```

On Windows (PowerShell):

```powershell
irm https://lexis.hridya.tech/win.ps1 | iex
```

Or via npm (Node 20+): `npm install -g @hridyacodes/lexis`, then `lexis setup`.

Try `lx plan "biggest 10 files in my Downloads"` or `lx explain 'rm -rf ~'`. The demo on the website uses fixed example pairs and doesn't run anything on your machine.

Source: [github.com/hridaya423/lexis](https://github.com/hridaya423/lexis) (Apache-2.0). Models: [lexis-1.5b](https://huggingface.co/hridya423/lexis-1.5b-GGUF) and [lexis-0.5b](https://huggingface.co/hridya423/lexis-0.5b-GGUF). Full method: [METHODOLOGY.md](https://github.com/hridaya423/lexis/blob/main/lexis/model-cards/METHODOLOGY.md).
