---
title: "Indict"
headline: "Indict: LLM vulnerability hunting where a sandbox decides"
summary: "Indict runs six vulnerability-hunting engines over a repo and marks a finding verified only after a sandboxed proof of concept reaches the reported line."
kind: "Command-line tool"
platform: "Python"
status: "Hackathon build"
category: "SecurityApplication"
license: "Apache-2.0"
publishedAt: "2026-09-20"
updatedAt: "2026-11-09"
repo: "https://github.com/hridaya423/indict"
image: "/projects/indict.jpg"
---

Indict is a command-line tool that runs six vulnerability-hunting engines over a git repository and writes one report. A finding counts as verified only if a proof of concept ran in a sandbox and reached the reported line. Indict is for security researchers and maintainers who want proof for the bugs that a language model finds.

I built Indict for the AI Tinkerers and Superlinked hackathon on 20 September 2026. Judges scored valid vulnerabilities, weighted by significance and checked by hand. I have no placing to report. I prepared before the day, so Indict is not a one-day build.

## The model proposes, mechanics decide

Language models suggest candidate bugs. Mechanical checks accept or reject them. The pipeline runs ten steps: ingest, recon, sweep, rank, engines, consensus, adjudicate, proof of concept, chain and report.

1. Six engines produce candidates. They are a semgrep and bandit sweep, an LLM call-chain hunter, LLM-generated taint rules, a data-flow explorer, git-history variant analysis, and LLM-written fuzz harnesses.
2. The consensus step removes duplicates.
3. An adversarial falsifier tries to reject each candidate that remains. It must cite concrete mechanical evidence, such as "file does not exist". Indict refuses a rejection without that evidence, and each rejection goes into a ledger with its reason.
4. Each candidate that remains gets a proof of concept. It runs in a Docker sandbox with no network, a read-only filesystem, and limits on CPU and memory. The sandbox traces execution.
5. A finding is "verified" only if the traced run reached the reported line and a probe string such as `VULN_CONFIRMED_PROTOTYPE_POLLUTION` fired. The probe output comes from the sandbox, so the model cannot fake it.

Two later steps use verified results. The chain step combines verified pairs into one chained proof of concept. The learn step turns a verified bug into a semgrep rule. Indict stores the rule only if it hits within 10 lines of the known-bad line.

None of the bug-finding ideas is new. The variant engine reads git history for fixes and looks for the same mistake in other places, which is the Big Sleep idea. The other engines borrow from vulnhuntr, IRIS and RepoAudit. My addition is the gate.

## What I measured for Indict

I ran a calibration set of 5 known CVEs: lodash, minimist, moment, pyyaml and requests. Indict found 5 of 5 again, and a proof of concept verified each one. The false-positive rate was 0.0. I turned the learned rules off for this run, so earlier results could not leak in.

That set proves little. The bugs are already public. The run shows that the pipeline works, and it says nothing about new bugs.

On real targets at the hackathon, most findings ended as "adjudicated", not verified. An adjudicated finding survived the falsifier but has no working proof of concept. On one target, 18 findings gave 2 verified.

I have not reported a finding to a maintainer, and no maintainer has confirmed one. I do not list unpatched issues here.

## Limits of Indict

- Indict needs Docker, semgrep, and either API keys or a local 30B model. The local model can crash a laptop.
- The proof-of-concept probes match a bug class, and this method cannot prove some classes.
- The hackathon model endpoint served only 8k tokens of context, so I set `INDICT_MAX_TOKENS=4096` and `INDICT_MAX_FILE_LINES=400`.
- Docker image builds must run one at a time, and they can push the host into swap.
- Learned rules are global, so a rule from one repository applies to the next.

## Indict compared with Semgrep, vulnhuntr, RepoAudit and IRIS

Semgrep, bandit, gosec and osv-scanner are established tools that use no model. Indict runs semgrep and bandit inside its sweep. Vulnhuntr, RepoAudit and IRIS each implement one technique that Indict borrows. Indict adds one shared gate for all of them.

## Try Indict

There is no hosted demo. Install Indict from source:

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

The last command is an offline smoke test. For a real scan, add model keys to `.env` and run this command:

```sh
./indict <git-url-or-path> --engines sweep,hunter --models deepseek,glm --passes 2 --workers 6
```

`bash calibrate/demo.sh` is a 5-second demo, and `./indict --board` opens the dashboard at `127.0.0.1:8404`.

Source: [github.com/hridaya423/indict](https://github.com/hridaya423/indict) (Apache-2.0).
