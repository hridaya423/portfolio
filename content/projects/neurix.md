---
title: "Neurix"
headline: "Neurix: a Scratch-style editor where AI writes blocks you can actually edit"
summary: "A Scratch-style block editor where an AI turns plain-English prompts into validated, draggable Blockly blocks instead of opaque code, with .sb3 import and export."
kind: "Web app"
platform: "Web"
status: "Open source"
category: "EducationalApplication"
license: "AGPL-3.0"
publishedAt: "2026-08-29"
updatedAt: "2026-11-21"
site: "https://neurix.hridya.tech"
repo: "https://github.com/hridaya423/neurix"
image: "/projects/neurix.jpg"
---

When a 12-year-old asks a chatbot to help build a game and gets 200 lines of JavaScript back, they mostly just paste it and hope nothing breaks. If the AI hands them blocks instead, they can pull them apart, swap a number, and see what changes right away.

Neurix is an early, open-source block editor built along the lines of Scratch (aimed roughly at ages 10 to 14). Its AI never writes raw code: it returns a description of blocks that Neurix validates before dropping onto your canvas, and it can explain the blocks you already have.

## Blocks as JSON, checked before they land

Describe a custom block and Neurix sends your prompt to `x-ai/grok-4.3` (through the OpenRouter SDK and a Hack Club proxy) alongside the full list of blocks it's allowed to use: 33 statements and 10 conditions, JSON only, no Markdown, no JavaScript, and fewer than 40 blocks.

For *"patrol the stage"*, a valid reply looks like this:

```json
{
  "name": "patrol",
  "explanation": "Moves forward and turns round at the edge.",
  "ast": [
    {
      "type": "forever",
      "body": [
        { "type": "move", "steps": 5 },
        { "type": "ifOnEdgeBounce" }
      ]
    }
  ]
}
```

Each entry in `ast` is one block, and `body` holds the nested blocks inside a loop.

Models ignore instructions all the time, so a validator walks every node before anything reaches the workspace. Real cases from its tests:

| What the model returns | What the validator keeps |
|---|---|
| `{ "type": "playSound", "soundId": "meow" }` | Dropped (type not in the allowed list) |
| `{ "type": "turn", "degrees": 99999 }` | `{ "type": "turn", "degrees": 360 }` |
| `{ "type": "setSize", "size": -50 }` | `{ "type": "setSize", "size": 0 }` |
| `{ "type": "repeat", "times": 2.7 }` | Repeat 3 times |
| Key named `"Space"` | `" "` (what browsers report for Space) |
| Touching `"Sprite7"` | Touching `"edge"` |
| Condition of an unknown type | `0 = 0` |
| JSON inside a Markdown fence | The unwrapped JSON |

The validator caps trees at 100 nodes and 10 levels of nesting, showing an error and adding nothing if no usable blocks survive. A unit test checks that the prompt's block list and the validator's block list stay identical so adding a block to one breaks the test if you forget the other. Valid trees convert straight into draggable Blockly blocks, and the **explain** and **ask** helpers run through the same model using the selected sprite's syntax tree.

## One syntax tree everywhere

The AI doesn't speak a separate format. Blockly 12 renders the visual workspace and compiles it into that same typed syntax tree. An interpreter walks the tree against a small runtime (`wait`, `next frame`, `key down`, `touching`, sprite getters) triggered by green flags, broadcasts, backdrop changes, clone starts, key presses and clicks, and a second tested pass compiles the tree into JavaScript text. Project files allow up to 200 sprites, 64 levels of nesting and 700 KiB.

Around the blocks sit the standard Scratch pieces—stage, sprites, costumes, backdrops, sounds, variables and lists—plus optional sprite generation (`openai/gpt-image-2`) and sound clips (`google/lyria-3-clip-preview`). Neurix imports and exports `.sb3` files while keeping its own extra metadata intact on export.

## Where it stands right now

Scratch got the basics right: sprites, a simple stage, immediate feedback. The long-term aim for Neurix is raising the ceiling past beginner demos (with library-backed blocks like Three.js and Matter.js, 3D, multiplayer and templates planned). Today, though, it's early and can't build full real games yet.

A few gaps still to fix: AI edits apply straight to the workspace with no preview or undo; the AI only sees one sprite's AST at a time and can't emit variables, lists, sounds or broadcasts; there's no guided first project, guest mode, publishing or remixing; sign-up has no age or guardian handling and AI calls have no usage quotas; and some Scratch blocks still behave slightly differently from Scratch itself.

Next to existing tools: Scratch is free with a huge community and remixing (no AI, lower ceiling); MakeCode Arcade switches neatly between blocks and JS/TS; and GDevelop and Construct are mature visual game engines far ahead of where Neurix is today.

## Try it

Visit [neurix.hridya.tech](https://neurix.hridya.tech) and click **Start building**. It's free, and signing up (name, email, password) saves projects to your account.

Source: [github.com/hridaya423/neurix](https://github.com/hridaya423/neurix) (AGPL-3.0).
