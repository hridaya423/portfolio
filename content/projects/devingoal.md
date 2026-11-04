---
title: "/goal for Devin"
headline: "/goal for Devin: keep the agent working until a judge checks the repo"
summary: "/goal for Devin keeps a Devin agent working until a separate read-only judge session verifies the goal in the repository. Open source, MIT."
kind: "Agent tool"
platform: "Devin CLI, Devin Desktop and ACP sessions"
status: "Open source"
publishedAt: "2026-09-18"
updatedAt: "2026-11-04"
repo: "https://github.com/hridaya423/devingoal"
image: "/projects/devingoal.jpg"
---

/goal for Devin keeps Cognition's Devin agent working until a separate judge session checks the repository and agrees the goal is done. It's for people who give Devin long tasks and are tired of it stopping early. The idea comes from Codex's `/goal`, rebuilt on Devin's hook engine.

The README puts the problem in three short sentences. Agents stop early. They write half the file, declare victory, or stall on "waiting for CI".

## How /goal for Devin decides a goal is done

The Stop hook does the real work. Every time the agent tries to end its turn, `goalctl stop` runs. With no completion claim, the turn continues and the objective is injected again. A claim is a call to `goalctl done "<evidence>"`, and that starts a separate, read-only Devin session as the judge.

The judge's prompt holds the objective, the agent's last message and the report the agent keeps at `.devin/goal/report.md`, all labelled "untrusted evidence". The judge grades each requirement as proven, contradicted, incomplete, weak or missing, checking files and test output. It answers `VERDICT: achieved`, `not_achieved`, `blocked` or `waiting`, plus `EVIDENCE` and `FEEDBACK`. Its rules say weak, indirect or merely consistent evidence means not achieved, and a narrow check can't prove a broad claim.

Two more hooks keep the loop honest. UserPromptSubmit starts the goal when you send `/goal <objective>`, before the agent acts, so the agent can't skip it. SessionStart injects the goal into each new session, so it survives compaction and restarts.


## The five ways a /goal for Devin run ends

| Exit | Meaning |
|---|---|
| complete | The judge verified the result. |
| waiting | The agent's side is proven and only external events remain, such as a person merging a pull request. |
| blocked | Three claims in a row hit the same impasse. |
| paused | You paused the goal. |
| judge_error | The judge failed three times in a row, and the loop fails open. |

Iterations are unbounded by design. A second `/goal` in the same directory runs in parallel in its own slot, with its own report and judge log.

## What I measured for /goal for Devin

The suite has 41 tests, and `python3 -m pytest test -q` printed "41 passed in 5.79s". The judge times out at 300 seconds and the Stop hook at 1200. I have no data on whether the loop improves outcomes.

## Limits of /goal for Devin

- It works only with Devin, and installing it changes your global Devin config. The installer backs the file up to `config.json.goal-bak`.
- The judge is another language model session. It audits evidence and can be wrong. It isn't a formal verifier.
- Each completion claim costs extra Devin usage, and nothing caps the iterations.
- Judge authentication through Windsurf credentials can fail with `devin -p`. When it does, `bin/acp-oneshot` talks to `devin acp` over ACP JSON-RPC instead.
- The README doesn't say which Devin versions work.

## /goal for Devin compared with Codex /goal and a "keep going" prompt

Codex CLI has its own `/goal`, which inspired this one. I haven't compared the two in use, so I won't claim either is better. A plain "keep going" prompt needs no install, but the agent that wants to stop is the one deciding when to stop. /goal for Devin has a separate session check the repository instead.

## Install /goal for Devin

You need Devin (the CLI, or the binary bundled in Devin.app) and a Windsurf or Devin credential. The judge reads `WINDSURF_API_KEY` or `~/.local/share/devin/credentials.toml`.

```sh
git clone https://github.com/hridaya423/devingoal && cd devingoal
mkdir -p ~/.agents/skills/goal ~/.local/share/devin/goal
cp -r skills/goal/SKILL.md ~/.agents/skills/goal/
cp -r bin prompts ~/.local/share/devin/goal/
~/.local/share/devin/goal/bin/goalctl install
```

Then send `/goal Migrate the tests to vitest and keep them green`. Send `/goal` alone for status. `goalctl install --project` arms one project only. MIT licensed: https://github.com/hridaya423/devingoal
