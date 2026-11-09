---
title: "usage-dash"
headline: "usage-dash: coding-agent usage from every machine, in one dashboard"
summary: "usage-dash adds up token and cost usage of coding-agent CLIs across all your machines over SSH, and shows it on a web dashboard and a Mac menu-bar app."
kind: "Web app"
platform: "Web, macOS 14 or later"
status: "Open source"
category: "DeveloperApplication"
license: "MIT"
publishedAt: "2026-09-16"
updatedAt: "2026-11-09"
repo: "https://github.com/hridaya423/usage-dash"
image: "/projects/usage-dash.jpg"
---

usage-dash shows the token and cost usage of your coding-agent CLIs across every machine you own, in one place. It collects the data over SSH from Mac, Linux and Windows machines. It draws dithered charts on a web page and in a menu-bar app called UsageBar. usage-dash is for people who run Claude Code, Codex, Devin or similar tools on several machines.

![The usage-dash web dashboard in dark mode: total cost for 30 days, a per-agent breakdown, a stacked dithered area chart and a bar of cost by source.](/projects/usage-dash/dashboard.png)

## How usage-dash refreshes without a cron job

A request starts the scan. The pattern is stale-while-revalidate, in `lib/usage-cache.ts`.

The server reads `.data/usage-cache.json`. If the file is older than 60 seconds, the server starts one background refresh and returns the cached data at once, marked stale. A `refreshInFlight` guard allows one scan at a time. The response carries an estimated time of arrival, which is the average of the last 5 scan durations.

The refresh runs `scripts/fetch-all.sh`. That script runs `ccusage` locally and on each configured machine in parallel, over `ssh -o BatchMode=yes -o ConnectTimeout=10`. Windows machines use a PowerShell variant. `scripts/merge-usage.ts` merges the results. If a machine does not answer, the scan skips it.

The dashboard offers ranges of 24h, 7d, 30d and 90d. UsageBar polls every 60 seconds.

## How usage-dash counts Devin, which ccusage cannot

Devin is not in `ccusage`. So `scripts/fetch-devin.ts` reads the SQLite file of Devin, `~/.local/share/devin/cli/sessions.db`. It takes the token counts and the model for each message and prices them in `lib/pricing.ts`. An incremental cache in `.data/devin-cache.json` keeps later scans short.

![UsageBar, the macOS menu-bar popover, showing 38.5 billion tokens over 30 days with a per-agent list and a dithered chart.](/projects/usage-dash/menubar.png)

## Limits of usage-dash

- usage-dash needs Bun and key-based SSH to each machine.
- The server has no authentication. Keep it on a trusted network and off a public IP address.
- The costs are estimates at API prices, computed from local transcript files. They are not a bill.
- usage-dash reads only the agents that `ccusage` understands, plus Devin.
- UsageBar needs macOS 14 or later, and you build it from source. There is no prebuilt release.

## usage-dash compared with ccusage and provider dashboards

`ccusage` is the tool that usage-dash wraps. On one machine, `ccusage` alone gives the same report and is simpler to run, so usage-dash is not better there. usage-dash adds the merge across machines and agents, plus a menu-bar view.

The usage pages of the providers show the billed numbers for one provider. usage-dash reads local transcripts, so it covers several tools at once and its figures are estimates.

## Try usage-dash

You need Bun and key-based SSH to each machine. UsageBar needs macOS 14 or later and the Xcode command line tools.

```sh
git clone https://github.com/hridaya423/usage-dash && cd usage-dash
bash scripts/setup.sh
bun start
```

`bun start` serves `http://<your-lan-ip>:3200`. List your machines in `machines.config.json`, then run `bash scripts/authorize.sh` to install your SSH key on each machine. `bash menubar/build.sh` builds `~/Applications/UsageBar.app`. Set the hub URL in its settings.

Source: [github.com/hridaya423/usage-dash](https://github.com/hridaya423/usage-dash) (MIT).
