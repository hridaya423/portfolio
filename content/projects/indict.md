---
title: "Indict"
headline: "Indict: LLM vulnerability hunting where a sandbox has the final word"
summary: "A CLI that runs six vulnerability-hunting engines over a git repository and only marks a finding verified once a sandboxed proof of concept actually hits the reported line."
kind: "Command-line tool"
platform: "Python"
status: "Hackathon build"
category: "SecurityApplication"
license: "Apache-2.0"
publishedAt: "2026-09-20"
updatedAt: "2026-11-21"
repo: "https://github.com/hridaya423/indict"
image: "/projects/indict.jpg"
---

I built Indict for the AI Tinkerers and Superlinked hackathon on 20 September 2026, where judges checked reported vulnerabilities by hand and weighted them by severity. I didn't place, and I built parts of the harness ahead of the day, so it isn't a one-day project.

The problem it tries to solve is simple: ask an LLM to audit a codebase and you'll drown in plausible-sounding false positives. Indict runs six vulnerability-hunting engines over a git repo and writes one report, refusing to mark any bug as **verified** until a proof of concept runs inside a locked-down Docker sandbox and proves it hit the exact line.

## Models suggest, the sandbox decides

A full run moves through ten stages: `ingest`, `recon`, `sweep`, `rank`, `engines`, `consensus`, `adjudicate`, `poc`, `chain` and `report`.

Six engines generate candidates in parallel: a `semgrep` and `bandit` sweep, an LLM call-chain hunter, LLM-generated taint rules, a data-flow explorer, git-history variant analysis, and LLM-written fuzz harnesses. A consensus pass deduplicates overlaps across engines.

Next, an adversarial falsifier tries to knock out each remaining candidate, with one strict rule: it has to cite concrete mechanical evidence (such as a missing file or unreachable symbol). Unsupported dismissals get rejected, and every accepted dismissal goes into a ledger with its reason.

Whatever survives gets a proof of concept executed inside a Docker sandbox with no network, a read-only filesystem, strict CPU and memory limits, and execution tracing turned on. A bug only upgrades to **verified** when tracing confirms execution reached the reported line *and* the sandbox prints a probe string such as `VULN_CONFIRMED_PROTOTYPE_POLLUTION`. Because that output comes from the sandbox runtime, the model can't fake it.

Two optional stages follow verification: `chain` attempts to combine verified pairs into a single chained exploit, and `learn` converts a confirmed bug into a `semgrep` rule, storing it only if it matches within 10 lines of the known vulnerable line.

None of the individual hunting ideas are new—scanning git history for past fixes to spot unpatched siblings is Google's Big Sleep idea, the other engines borrow from `vulnhuntr`, `IRIS` and `RepoAudit`, and deterministic tools like `semgrep`, `bandit`, `gosec` and `osv-scanner` do the static work. Indict's piece is putting one shared mechanical gate in front of all of them.

## Calibration vs real repositories

On a calibration set of 5 known CVEs (`lodash`, `minimist`, `moment`, `pyyaml` and `requests`), with learned rules turned off so nothing leaked from previous runs, Indict rediscovered and verified 5 of 5 with a 0.0 false-positive rate.

Public CVEs only prove the plumbing works, not that it finds fresh zero-days. On live repos at the hackathon, most candidates stalled at **adjudicated** (survived the falsifier, no working proof of concept): on one target, 18 findings produced 2 verified bugs. I haven't reported any finding to a maintainer or had one externally confirmed, and I don't list unpatched bugs here.

## Limits

Running Indict locally takes Docker, `semgrep`, and either API keys or a local 30B model (which can easily crash a laptop). Proof-of-concept probes only cover certain bug classes, leaving plenty of flaws outside what the sandbox can prove automatically. Because the hackathon endpoint capped context at 8k tokens, I set `INDICT_MAX_TOKENS=4096` and `INDICT_MAX_FILE_LINES=400`. Docker image builds also have to run serially and can still push a machine into swap, and rules written by the `learn` step apply globally across future repos rather than staying scoped per project.

## Running it

There's no hosted demo; install from source:

```sh
uv sync
brew install semgrep universal-ctags
uv tool install osv-scanner
uv tool install bandit
bash sandbox/build_images.sh
cp .env.example .env
./indict --doctor
./indict --no-llm calibrate/smoke/vulnapp
```

That last line runs an offline smoke test. For a real scan, add model keys to `.env`:

```sh
./indict <git-url-or-path> --engines sweep,hunter --models deepseek,glm --passes 2 --workers 6
```

`bash calibrate/demo.sh` runs a 5-second demo, and `./indict --board` opens the local dashboard at `127.0.0.1:8404`.

Source: [github.com/hridaya423/indict](https://github.com/hridaya423/indict) (Apache-2.0).
