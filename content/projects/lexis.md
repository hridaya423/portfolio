---
title: "Lexis"
headline: "Lexis: a local model writes the command, plain code decides if it runs"
summary: "Lexis turns plain English into one shell command with a small model on your machine. A rule-based policy runs it only if it is read-only or you approve."
kind: "Command-line tool"
platform: "macOS, Linux and Windows"
status: "Open source"
category: "DeveloperApplication"
license: "Apache-2.0"
publishedAt: "2026-03-31"
updatedAt: "2026-11-09"
site: "https://lexis.hridya.tech"
repo: "https://github.com/hridaya423/lexis"
image: "/lexis-hero.png"
---

Lexis turns plain English that you type in a terminal into one shell command. A small model on your own computer writes the command. Lexis is for developers who know what they want but do not know the flags for `find`, `tar` or `lsof`. The model never decides what runs. A command runs only if code proves it is read-only or you approve it.

![The Lexis site: the request "start my repo fresh" shown above the command it produced, rm -rf .git && git init.](/lexis-hero.png)

## The model proposes, code decides

Three times, the 1.5b model answered a harmless question with a drastic command. For "disk usage of /" it proposed a remount of `/` as noexec. So Lexis treats the output of the model as a suggestion, and ordinary code decides what happens next.

A shell hook catches each line that is not a real command. The local model (llama.cpp, `llama-server`) returns one command. The policy engine in `lexis/src/policy.mjs` gives that command a risk level.

A command that code proves read-only runs at once. Each other command shows an approval card: Enter runs it, `e` edits it and Esc cancels. A critical command makes you type `yes`.

The model cannot lower a risk floor, and no flag skips the critical confirmation. `sudo`, a service stop and a package removal raise the floor. A remote script piped to a shell, or an encoded command, always asks. `rm -rf` on your home directory, the root or a wildcard is critical. The card then shows the blast radius: the number of items and the number of bytes.

The hook leaves real commands alone. A line with a real command, flags or paths goes straight to the shell, so a missing `gh` still prints "command not found". Piped shells and shells that an agent starts never reach Lexis.

## 757 of 919, and how I counted

I measured these numbers. The full method is in `lexis/model-cards/METHODOLOGY.md`.

I froze the test cases before training and picked the models on a separate selection half. The final half, 919 cases, ran once for each model. A case passes only if the first command is right. The grader accepts known-good forms and sometimes runs the command in a container. It understates accuracy slightly.

| Model | Final half, 919 cases | Warm p50 latency | Size |
|---|---|---|---|
| lexis-1.5b | 757 (82.4%) | about 0.25 s | 986 MB |
| lexis-0.5b | 714 (77.7%) | about 0.1 s | 398 MB |
| Qwen2.5-Coder-0.5B-Instruct, untrained | 188 (20.5%) | not measured | not measured |

Latency is from one machine, an Apple M4 Pro, with the Q4_K_M files. Seed noise on the selection score is about 15 cases.

Both models are a full fine-tune of Qwen2.5-Coder, one epoch, on about 140,000 rows. Each row passed checks on its target OS: valid syntax, a command that exists, and each flag present in the man page or `--help`. A sample also ran in a Docker container as an unprivileged user. I dropped rows that overlap the test sets.

In one targeted round, 3,591 rows went in and 2,711 passed the checks. A coding agent wrote 62,502 of the rows, and those rows passed the same checks.

## What did not help

Model size gave the largest gain: 5 points for 1.5b over 0.5b on the same data. Most of the other changes did nothing.

- More epochs and a higher learning rate overfit.
- Two rounds of DPO raised pair accuracy from 66% to 77%. The selection score went from 836 to 835.
- Targeted data gained 5 and 9 cases on the final half, which is inside the noise. The 1.5b model ships without that data because the data lowered its Windows score.

## Where Lexis still gets it wrong

I read 217 failures of the 1.5b model.

| Failure | Cases |
|---|---|
| A tool the model did not know | about 40 |
| An invented command or flag, such as `rm -sf` and `dnf ininstall` | about 30 |
| A missed detail | about 25 |
| A write when the request was to look | about 12 |
| Broken syntax | about 8 |

Lexis has three more limits.

- Web search is on by default in `auto` mode and sends queries to DuckDuckGo. To turn it off, run `lx config set webSearch.enabled false`.
- The `apple-fm` provider is experimental and weaker.
- I have not published the training data, so you cannot rebuild the models from the repository.

## Lexis compared with GitHub Copilot CLI and Warp AI

GitHub Copilot CLI and Warp AI are cloud assistants. A larger hosted model may handle more requests than a 1.5b model. I ran no head-to-head test, so I claim no accuracy advantage.

Lexis offers four things. The model runs on your device. Lexis needs no account and no API key. It has no telemetry. The policy engine is separate from the model.

## Try Lexis

- macOS or Linux: `curl -fsSL https://lexis.hridya.tech/install.sh | bash`
- Windows: `irm https://lexis.hridya.tech/win.ps1 | iex`
- npm, with Node 20 or later: `npm install -g @hridyacodes/lexis`, then `lexis setup`

Then run `lx plan "biggest 10 files in my Downloads"` or `lx explain 'rm -rf ~'`. The demo on the site matches fixed example requests to fixed commands, and nothing runs on your computer.

Source: [github.com/hridaya423/lexis](https://github.com/hridaya423/lexis) (Apache-2.0). Models: [lexis-1.5b](https://huggingface.co/hridya423/lexis-1.5b-GGUF) and [lexis-0.5b](https://huggingface.co/hridya423/lexis-0.5b-GGUF). Full method: [METHODOLOGY.md](https://github.com/hridaya423/lexis/blob/main/lexis/model-cards/METHODOLOGY.md).
