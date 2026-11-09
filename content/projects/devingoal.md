---
title: "/goal for Devin"
headline: "/goal for Devin: keep the agent working until a judge checks the repo"
summary: "/goal for Devin keeps a Devin agent working until a separate read-only judge session verifies the goal in the repository. Open source, MIT."
kind: "Command-line tool"
platform: "Devin CLI, Devin Desktop and ACP sessions"
status: "Open source"
category: "DeveloperApplication"
license: "MIT"
publishedAt: "2026-09-18"
updatedAt: "2026-11-09"
repo: "https://github.com/hridaya423/devingoal"
image: "/projects/devingoal.jpg"
---

Agents stop early. They write half the file, say the task is done, or stall on "waiting for CI". /goal for Devin keeps the Devin agent from Cognition at work until a separate judge session checks the repository and agrees that the goal is done.

It is for people who give Devin long tasks and see it stop early. The idea comes from `/goal` in Codex. I rebuilt it on the hook engine of Devin.

## How /goal for Devin decides a goal is done

The Stop hook does the main work. Each time the agent tries to end its turn, `goalctl stop` runs. If the agent made no completion claim, the turn continues and the hook injects the objective again.

A claim is a call to `goalctl done "<evidence>"`. A claim starts a separate, read-only Devin session as the judge.

The judge gets three things: the objective, the last message of the agent, and the report that the agent keeps at `.devin/goal/report.md`. The prompt labels all three "untrusted evidence". The judge checks files and test output and grades each requirement as proven, contradicted, incomplete, weak or missing.

The judge answers `VERDICT: achieved`, `not_achieved`, `blocked` or `waiting`, plus `EVIDENCE` and `FEEDBACK`. Its rules say that weak, indirect or merely consistent evidence means not achieved. A narrow check cannot prove a broad claim.

Two more hooks make the loop reliable. UserPromptSubmit starts the goal when you send `/goal <objective>`, before the agent acts, so the agent cannot skip it. SessionStart injects the goal into each new session, so the goal survives compaction and restarts.

## The five ways a /goal for Devin run ends

| Exit | Meaning |
|---|---|
| complete | The judge verified the result. |
| waiting | The work of the agent is proven and only external events remain, such as a person who must merge a pull request. |
| blocked | Three claims in a row reached the same impasse. |
| paused | You paused the goal. |
| judge_error | The judge failed three times in a row, and the loop fails open. |

The number of iterations has no limit by design. A second `/goal` in the same directory runs in parallel in its own slot, with its own report and judge log.

## What I measured for /goal for Devin

The suite has 41 tests, and `python3 -m pytest test -q` printed "41 passed in 5.79s". The judge times out at 300 seconds, and the Stop hook times out at 1200 seconds. I have no data on whether the loop improves outcomes.

## Limits of /goal for Devin

- It works only with Devin, and the installer changes your global Devin config. The installer saves a copy of the file as `config.json.goal-bak`.
- The judge is another language model session. It audits evidence and can be wrong. It is not a formal verifier.
- Each completion claim costs extra Devin usage, and nothing limits the iterations.
- Judge authentication through Windsurf credentials can fail with `devin -p`. When it fails, `bin/acp-oneshot` talks to `devin acp` over ACP JSON-RPC.
- I have not listed the Devin versions that work.

## /goal for Devin compared with Codex /goal and a "keep going" prompt

Codex CLI has its own `/goal`, which inspired this one. I have not compared the two in use, so I do not claim that either is better.

A plain "keep going" prompt needs no installation. But the agent that wants to stop is also the agent that decides when to stop. With /goal for Devin, a separate session checks the repository.

## Try /goal for Devin

You need Devin (the CLI, or the binary inside Devin.app) and a Windsurf or Devin credential. The judge reads `WINDSURF_API_KEY` or `~/.local/share/devin/credentials.toml`.

```sh
git clone https://github.com/hridaya423/devingoal && cd devingoal
mkdir -p ~/.agents/skills/goal ~/.local/share/devin/goal
cp -r skills/goal/SKILL.md ~/.agents/skills/goal/
cp -r bin prompts ~/.local/share/devin/goal/
~/.local/share/devin/goal/bin/goalctl install
```

Then send `/goal Migrate the tests to vitest and keep them green`. Send `/goal` alone for status. `goalctl install --project` installs the hooks for one project only.

Source: [github.com/hridaya423/devingoal](https://github.com/hridaya423/devingoal) (MIT).
