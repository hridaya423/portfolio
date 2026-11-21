---
title: "usage-dash"
headline: "usage-dash: every machine's coding-agent usage in one dashboard"
summary: "Pulls token and cost estimates for Claude Code, Codex, Devin and other CLI agents across all your machines over SSH, displayed on a web dashboard and a Mac menu-bar popover."
kind: "Web app"
platform: "Web, macOS 14 or later"
status: "Open source"
category: "DeveloperApplication"
license: "MIT"
publishedAt: "2026-09-16"
updatedAt: "2026-11-21"
repo: "https://github.com/hridaya423/usage-dash"
image: "/projects/usage-dash.jpg"
---

Running Claude Code, Codex and Devin across a couple of laptops and a Mac mini makes it surprisingly annoying to answer a basic question: how many tokens did I burn this month? `usage-dash` collects CLI usage over SSH from every Mac, Linux and Windows machine you own and shows it in one spot—a web dashboard with dithered charts and a native macOS menu-bar popover called UsageBar.

![The usage-dash web dashboard in dark mode showing 30-day total cost, a per-agent breakdown, a stacked dithered area chart and cost by source.](/projects/usage-dash/dashboard.png)

## Refreshing without a cron job

Rather than running a background scheduler, `lib/usage-cache.ts` uses stale-while-revalidate. Each request reads `.data/usage-cache.json`; if the file is more than 60 seconds old, the server immediately returns the cached data marked stale so the UI stays snappy, starts one background scan behind a `refreshInFlight` lock, and attaches an ETA averaged from the last five scans.

The scan runs `scripts/fetch-all.sh`, calling `ccusage` locally and across every configured machine in parallel via `ssh -o BatchMode=yes -o ConnectTimeout=10` (with a PowerShell variant for Windows). `scripts/merge-usage.ts` combines the JSON and skips any machine that's asleep or offline. The dashboard covers 24h, 7d, 30d and 90d ranges, and UsageBar polls every 60 seconds.

Since `ccusage` doesn't parse Devin, `scripts/fetch-devin.ts` reads Devin's local SQLite file (`~/.local/share/devin/cli/sessions.db`) directly, pulling per-message token counts and models, pricing them through `lib/pricing.ts`, and saving an incremental cache in `.data/devin-cache.json` so later scans finish quickly.

![UsageBar in the macOS menu bar displaying 38.5 billion tokens over 30 days with a per-agent breakdown and dithered chart.](/projects/usage-dash/menubar.png)

## Limits

If you only work on one computer, you're better off running `ccusage` directly—it's simpler and reports the same numbers. Also keep in mind that `usage-dash` estimates API-equivalent spend from local transcript files rather than pulling real invoices; for exact billing, check your provider's dashboard.

It needs Bun and key-based SSH to each machine, only supports agents `ccusage` understands plus Devin, and has no authentication on the server, so keep it on a trusted LAN or Tailscale network and off any public IP. UsageBar requires macOS 14+ and has to be built from source since there's no prebuilt release.

## Running it

Needs Bun and key-based SSH (plus Xcode command line tools on macOS 14+ for UsageBar):

```sh
git clone https://github.com/hridaya423/usage-dash && cd usage-dash
bash scripts/setup.sh
bun start
```

`bun start` serves `http://<your-lan-ip>:3200`. List your hosts in `machines.config.json` and run `bash scripts/authorize.sh` to copy your SSH key across. `bash menubar/build.sh` builds `~/Applications/UsageBar.app`; point its settings at your hub URL.

Source: [github.com/hridaya423/usage-dash](https://github.com/hridaya423/usage-dash) (MIT).
