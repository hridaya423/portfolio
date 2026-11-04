---
title: "Lexis"
headline: "Lexis: a local model writes the command, plain code decides if it runs"
summary: "Lexis turns plain English into one shell command with a small model on your machine. A rule-based policy runs it only if it is read-only or you approve."
kind: "Command-line tool"
platform: "macOS, Linux and Windows"
status: "Open source"
publishedAt: "2026-03-31"
updatedAt: "2026-11-04"
site: "https://lexis.hridya.tech"
repo: "https://github.com/hridaya423/lexis"
image: "/lexis-hero.png"
---

Lexis turns plain English typed in a terminal into one shell command, written by a small model on your own computer. It's for developers who know what they want but not the flags for `find`, `tar` or `lsof`. The model never decides what runs: a command executes only if code proves it read-only or you approve it.

![The Lexis site: the request "start my repo fresh" shown above the command it produced, rm -rf .git && git init.](/lexis-hero.png)

## The model proposes, code decides

Three times, the 1.5b model answered a harmless question with a drastic command. For "disk usage of /" it proposed remounting `/` as noexec. So Lexis treats the model as a suggestion box, and ordinary code decides what happens next.

A shell hook catches any line that isn't a real command. The local model (llama.cpp, `llama-server`) returns one command, and the policy engine in `lexis/src/policy.mjs` assigns it a risk level. A command proven read-only runs at once. Anything else shows an approval card: Enter runs it, `e` edits it, Esc cancels. A critical command makes you type `yes`.

The model can't lower a risk floor, and no flag skips the critical confirmation. `sudo`, stopping a service and removing a package raise the floor. A remote script piped to a shell, or an encoded command, always asks. `rm -rf` on your home directory, the root or a wildcard is critical, and the card shows the blast radius: how many items and how many bytes.

The hook leaves real commands alone. A line with a real command, flags or paths goes straight to the shell, so a missing `gh` still prints "command not found". Piped and agent-spawned shells never reach Lexis.

## 757 of 919, and how I counted

These numbers are mine, from the README and `lexis/model-cards/METHODOLOGY.md`. I froze the test cases before training and picked the models on a separate selection half. The final half, 919 cases, ran once per model. A case passes only if the first command is right. The grader accepts known-good forms and sometimes runs the command in a container, and the methodology file says it understates accuracy slightly.

| Model | Final half, 919 cases | Warm p50 latency | Size |
|---|---|---|---|
| lexis-1.5b | 757 (82.4%) | about 0.25 s | 986 MB |
| lexis-0.5b | 714 (77.7%) | about 0.1 s | 398 MB |
| Qwen2.5-Coder-0.5B-Instruct, untrained | 188 (20.5%) | not measured | not measured |

Latency is from one machine, an Apple M4 Pro, with the Q4_K_M files. Seed noise on the selection score is about 15 cases.

Both models are a full fine-tune of Qwen2.5-Coder, one epoch, on about 140,000 rows. Every row passed checks on its target OS: valid syntax, a command that exists, and every flag present in the man page or `--help`. A sample also ran in a Docker container as an unprivileged user, and rows overlapping the test sets were dropped. In one targeted round, 3,591 rows went in and 2,711 survived the checks. A coding agent wrote 62,502 of the rows, which passed the same checks.

## What didn't help

Model size gave the biggest gain: 5 points for 1.5b over 0.5b on the same data. Most of the rest did nothing.

- More epochs and a higher learning rate overfit.
- Two rounds of DPO raised pair accuracy from 66% to 77%. The selection score went from 836 to 835.
- Targeted data gained 5 and 9 cases on the final half, inside the noise. The 1.5b model ships without it because it lost ground on Windows.

## Where Lexis still gets it wrong

I read 217 failures of the 1.5b model. About 40 were unknown tools. About 30 were invented commands or flags, like `rm -sf` and `dnf ininstall`. About 25 missed a detail, about 12 wrote when asked to look, and about 8 had broken syntax.

Web search is on by default in `auto` mode and sends queries to DuckDuckGo. Turn it off with `lx config set webSearch.enabled false`. The `apple-fm` provider is experimental and weaker. The training data isn't published, so you can't rebuild the models from the repository.

## Lexis against cloud shell assistants

GitHub Copilot CLI and Warp AI are cloud assistants, and a larger hosted model may handle more requests than a 1.5b one. I ran no head-to-head test, so I claim no accuracy advantage. What Lexis offers is documented: the model runs on your device, it needs no account or API key, it has no telemetry, and the policy engine is separate from the model.

## Try Lexis

- macOS or Linux: `curl -fsSL https://lexis.hridya.tech/install.sh | bash`
- Windows: `irm https://lexis.hridya.tech/win.ps1 | iex`
- npm, with Node 20 or later: `npm install -g @hridyacodes/lexis`, then `lexis setup`

Then run `lx plan "biggest 10 files in my Downloads"` or `lx explain 'rm -rf ~'`. The demo on the site matches fixed example requests to fixed commands, and nothing runs on your computer.

Source: [github.com/hridaya423/lexis](https://github.com/hridaya423/lexis) (Apache-2.0). Models: [lexis-1.5b](https://huggingface.co/hridya423/lexis-1.5b-GGUF) and [lexis-0.5b](https://huggingface.co/hridya423/lexis-0.5b-GGUF). Full method: [METHODOLOGY.md](https://github.com/hridaya423/lexis/blob/main/lexis/model-cards/METHODOLOGY.md).
