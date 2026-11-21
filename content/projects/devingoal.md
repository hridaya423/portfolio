---
title: "/goal for Devin"
headline: "/goal for Devin: don't let the agent quit until a separate judge checks the repo"
summary: "Keeps Cognition's Devin working on long tasks until an independent, read-only judge session inspects the actual repository and verifies the goal is met."
kind: "Command-line tool"
platform: "Devin CLI, Devin Desktop and ACP sessions"
status: "Open source"
category: "DeveloperApplication"
license: "MIT"
publishedAt: "2026-09-18"
updatedAt: "2026-11-21"
repo: "https://github.com/hridaya423/devingoal"
image: "/projects/devingoal.jpg"
---

I liked Codex CLI's `/goal` loop enough that I rebuilt it on top of Devin's hook engine. Coding agents tend to stop early—writing half a file, declaring the task done with broken tests, or stalling on "waiting for CI"—and telling them to "keep going" doesn't fix much when the same agent trying to stop is also grading its own work. `/goal for Devin` keeps Cognition's Devin running until a separate, read-only judge session checks the repository and agrees the goal is done.

## How the hooks keep it moving

Three hooks wire the loop together. `UserPromptSubmit` intercepts `/goal <objective>` before Devin acts so it can't skip setup, and `SessionStart` re-injects active goals across context compaction and restarts.

The `Stop` hook does the actual enforcement. Every time Devin tries to end its turn, `goalctl stop` runs. If the agent hasn't made a formal completion claim, the hook blocks the exit and puts the objective back in front of it.

To claim completion, Devin has to run `goalctl done "<evidence>"`. That spawns an independent, read-only Devin session as a judge and hands it three inputs all explicitly labelled **untrusted evidence**: the objective, Devin's last message, and the report Devin maintains in `.devin/goal/report.md`. The judge inspects real files and test outputs, grades each requirement (`proven`, `contradicted`, `incomplete`, `weak` or `missing`), and replies with `VERDICT: achieved`, `not_achieved`, `blocked` or `waiting` alongside `EVIDENCE` and `FEEDBACK`. Its prompt treats weak, indirect or narrow checks as not achieved.

## The five ways a run ends

Iterations aren't capped by design, and starting a second `/goal` in the same directory puts it in its own slot with a separate report and judge log. A run only stops in one of five states:

| Exit state | Meaning |
|---|---|
| `complete` | The judge verified the result against the repository. |
| `waiting` | Everything in the agent's control is proven; only an external step remains (such as a person merging a PR). |
| `blocked` | Three claims in a row hit the same impasse. |
| `paused` | You paused the goal. |
| `judge_error` | The judge failed three times in a row, so the loop fails open. |

## Tests and trade-offs

The pytest suite has 41 tests (`python3 -m pytest test -q` passes in 5.79 s), with timeouts of 300 seconds for the judge and 1200 seconds for the Stop hook. I haven't run a controlled benchmark against vanilla Devin or Codex's `/goal`, so I don't have hard data on how much it improves completion rates.

It only works with Devin, and `goalctl install` edits your global Devin config (saving a backup as `config.json.goal-bak`; pass `--project` to scope it to one repo). The judge is still another LLM session rather than a formal verifier, so it can still be wrong, and every completion claim burns extra Devin usage with no hard iteration limit. Windsurf credentials can also trip `devin -p`; when that fails, `bin/acp-oneshot` falls back to `devin acp` over ACP JSON-RPC. I haven't pinned a strict list of supported Devin versions yet.

## Try it

Needs Devin (the CLI or the binary inside `Devin.app`) plus `WINDSURF_API_KEY` or `~/.local/share/devin/credentials.toml`:

```sh
git clone https://github.com/hridaya423/devingoal && cd devingoal
mkdir -p ~/.agents/skills/goal ~/.local/share/devin/goal
cp -r skills/goal/SKILL.md ~/.agents/skills/goal/
cp -r bin prompts ~/.local/share/devin/goal/
~/.local/share/devin/goal/bin/goalctl install
```

Send `/goal Migrate the tests to vitest and keep them green`, or `/goal` on its own for status. Use `goalctl install --project` to limit hooks to a single repository.

Source: [github.com/hridaya423/devingoal](https://github.com/hridaya423/devingoal) (MIT).
