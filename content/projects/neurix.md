---
title: "Neurix"
headline: "Neurix: a Scratch-style editor where AI writes blocks you can edit"
summary: "Neurix is a Scratch-style block editor where an AI turns a prompt into editable blocks, explains them, and imports Scratch .sb3 files. It's early."
kind: "Creative tool"
platform: "Web"
status: "Open source"
publishedAt: "2026-08-29"
updatedAt: "2026-11-04"
site: "https://neurix.hridya.tech"
repo: "https://github.com/hridaya423/neurix"
image: "/projects/neurix.jpg"
---

Neurix is a block editor in the style of Scratch, with an AI that writes blocks from a plain-English prompt and explains the ones you already have. The AI never writes code. It writes a description of blocks, and Neurix validates that before anything lands in your project. I'm aiming it at ages 10 to 14, and it's early.

It has the Scratch parts: a stage, sprites, costumes, backdrops, sounds, variables and lists.

## The model never writes code

1. You type a prompt. Neurix sends it to a model along with a schema of every statement and condition the editor supports.
2. The model has to answer with JSON only: a typed syntax tree of blocks.
3. A validator checks each node against the supported list and rejects any node it doesn't know.
4. The valid tree becomes Blockly blocks, and you edit them like any others.

The model is x-ai/grok-4.3, reached through OpenRouter's SDK and a Hack Club proxy. Explain and ask use the same model and get the syntax tree of the selected sprite.

## How the blocks run

Blockly 12 draws the blocks. A compiler turns the workspace into the same typed tree, and an interpreter walks that tree against a small runtime interface: wait, next frame, key down, touching, sprite getters. Scripts start from the green flag, broadcasts, backdrop changes, clone starts, key presses, and clicks on a sprite or the stage. A second step turns the tree into JavaScript text, and that step has tests. A project file can hold at most 200 sprites, 64 levels of block nesting and 700 KiB.

Neurix also generates sprite art with openai/gpt-image-2 and sound clips with google/lyria-3-clip-preview. It imports and exports Scratch `.sb3` files and keeps Neurix-only data on export.

## Why keep the Scratch model

The README says Scratch is the starting point because its model is good: blocks, sprites, immediate feedback, a simple stage. Neurix keeps that shape and wants a higher ceiling, an editor that stays useful past the beginner demos. It can't make real games today. That's the goal, not the current state.

## What doesn't work yet

This list comes from my own audit of the project.

- AI changes appear in the project at once, with no preview and no undo.
- The AI sees one sprite's syntax tree, not the whole project.
- There's no guided first project, and no way to publish or remix.
- Sign-up has no age or guardian handling, and the AI has no usage quotas.
- Some Scratch blocks and behaviors still differ from Scratch.
- The landing page says blocks grow into real code. My audit marks that as overstated.
- The editor needs an account. I found no guest mode.
- I have no user numbers and no analytics.

Library-backed blocks such as Three.js and Matter.js, 3D, multiplayer and templates are plans.

## Against other tools

- **Scratch** is free, has a huge community, and supports publishing and remixing. It has no AI, and its ceiling is low. Neurix opens its files but has no community.
- **MakeCode Arcade** switches between blocks and JavaScript or TypeScript, in the browser and on handheld devices.
- **GDevelop** is a real game engine with visual events, export to web, mobile and desktop, and an AI agent. It's far more mature than Neurix.
- **Construct** is a polished event-sheet game engine with paid tiers.

I took these summaries from general knowledge and didn't test the tools for this page.

## Try it

Go to [neurix.hridya.tech](https://neurix.hridya.tech) and choose "Start building". Sign-up needs a name, an email and a password. The site says it's free, and projects save to your account. Source: [github.com/hridaya423/neurix](https://github.com/hridaya423/neurix) (AGPL-3.0).
