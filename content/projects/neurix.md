---
title: "Neurix"
headline: "Neurix: a Scratch-style editor where AI writes blocks you can edit"
summary: "Neurix is a Scratch-style block editor where an AI turns a prompt into editable blocks and a validator checks each one. It imports Scratch .sb3 files."
kind: "Web app"
platform: "Web"
status: "Open source"
category: "EducationalApplication"
license: "AGPL-3.0"
publishedAt: "2026-08-29"
updatedAt: "2026-11-09"
site: "https://neurix.hridya.tech"
repo: "https://github.com/hridaya423/neurix"
image: "/projects/neurix.jpg"
---

A model that writes code gives a 12-year-old a file to paste. A model that writes blocks gives them something they can drag and change. Neurix is a block editor in the style of Scratch. Its AI writes blocks from a plain-English prompt and explains the blocks you have.

The AI never writes code. It returns a description of blocks, and Neurix checks that description before anything reaches your project. I am aiming Neurix at ages 10 to 14, and it is early.

## The model returns blocks as data

You type an idea for a custom block. Neurix sends it to a model with a list of every block the AI may use: 33 statements and 10 conditions. The instructions tell the model to return JSON only, with no Markdown and no JavaScript, in fewer than 40 blocks.

For the idea "patrol the stage", a valid reply has this shape:

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

The `ast` field is a syntax tree. Each node is one block, and a `body` holds the blocks inside a loop.

The model is x-ai/grok-4.3. Neurix reaches it through the OpenRouter SDK and a Hack Club proxy.

## The validator does not trust the reply

A model can ignore its instructions, so a validator reads each node before Neurix accepts it. These cases come from its tests.

| The model returns | The validator keeps |
|---|---|
| `{ "type": "playSound", "soundId": "meow" }` | Nothing. The type is not in the list. |
| `{ "type": "turn", "degrees": 99999 }` | `{ "type": "turn", "degrees": 360 }` |
| `{ "type": "setSize", "size": -50 }` | `{ "type": "setSize", "size": 0 }` |
| `{ "type": "repeat", "times": 2.7 }` | A repeat of 3 times |
| A key named `"Space"` | `" "`, the value a browser reports for that key |
| A check for touching `"Sprite7"` | A check for touching `"edge"` |
| A condition of an unknown type | The comparison `0 = 0` |
| JSON inside a Markdown code fence | The JSON |

The validator also stops at 100 nodes and at 10 levels of nesting. If no usable block remains, Neurix shows an error and adds nothing.

One test compares the block list in the prompt with the list in the validator. If I add a block to one list and not the other, that test fails.

The valid tree becomes Blockly blocks under your custom block. You edit them like any other blocks. The explain and ask features use the same model, and they get the syntax tree of the selected sprite.

## One tree for the AI, the editor and the runtime

The AI does not have a private format. Blockly 12 draws the blocks, and a compiler turns the workspace into the same typed tree that the AI returns.

An interpreter walks that tree against a small runtime interface: wait, next frame, key down, touching and sprite getters. Scripts start from the green flag, broadcasts, backdrop changes, clone starts, key presses, and clicks on a sprite or the stage. A second step turns the tree into JavaScript text, and that step has tests.

A project file can hold at most 200 sprites, 64 levels of block nesting and 700 KiB.

Neurix has the other Scratch parts: a stage, sprites, costumes, backdrops, sounds, variables and lists. It generates sprite art with openai/gpt-image-2 and sound clips with google/lyria-3-clip-preview. It imports and exports Scratch `.sb3` files, and it keeps the data that only Neurix uses on export.

## Why Neurix keeps the Scratch model

Scratch is the starting point because its model is good: blocks, sprites, immediate feedback and a simple stage. Neurix keeps that shape and aims for a higher ceiling, an editor that stays useful after the beginner demos.

Neurix cannot make real games today. That is the goal, not the current state.

## Limits of Neurix

- AI changes appear in the project at once, with no preview and no undo.
- The AI sees the syntax tree of one sprite, not the whole project.
- The AI cannot write blocks for variables, lists, sounds or broadcasts.
- There is no guided first project, and no way to publish or remix.
- Sign-up has no age or guardian handling, and the AI has no usage quotas.
- Some Scratch blocks and behaviours still differ from Scratch.
- The editor needs an account. There is no guest mode.
- I have no user numbers and no analytics.

Library-backed blocks such as Three.js and Matter.js, 3D, multiplayer and templates are plans.

## Neurix compared with Scratch, MakeCode Arcade, GDevelop and Construct

- **Scratch** is free, has a very large community, and supports publishing and remixing. It has no AI, and its ceiling is low. Neurix opens its files but has no community.
- **MakeCode Arcade** switches between blocks and JavaScript or TypeScript, in the browser and on handheld devices.
- **GDevelop** is a real game engine with visual events, export to web, mobile and desktop, and an AI agent. It is much more mature than Neurix.
- **Construct** is a polished event-sheet game engine with paid tiers.

I did not test these tools for this page.

## Try Neurix

Go to [neurix.hridya.tech](https://neurix.hridya.tech) and choose "Start building". Sign-up needs a name, an email and a password. Neurix is free, and projects save to your account.

Source: [github.com/hridaya423/neurix](https://github.com/hridaya423/neurix) (AGPL-3.0).
