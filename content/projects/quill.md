---
title: "Quill"
headline: "Quill: hold a key, say the change, and your agent edits the note"
summary: "Quill is a free Mac Markdown editor. Hold a key and say the change, and Claude Code, Codex or Cursor rewrites your note in place for you to keep or revert."
kind: "macOS app"
platform: "macOS 26 or later"
status: "Open source"
category: "UtilitiesApplication"
license: "Apache-2.0"
publishedAt: "2026-11-02"
updatedAt: "2026-11-09"
site: "https://quill.hridya.tech"
repo: "https://github.com/hridaya423/quill"
image: "/projects/quill.jpg"
---

Quill is a Mac Markdown editor where the coding agent you already use edits your draft in place. I built it to stop a loop: paste a draft into a chatbot, edit the answer, paste it back. You hold a key and say the change. Then you watch a line strike through the old words while the new words appear.

## Talking to a file

The talk key is right Option by default. `App.swift` watches modifier-key events. While you hold the key, a microphone tap feeds `SpeechAnalyzer` and `SpeechTranscriber` from Apple, and Quill shows partial text as you speak.

Release the key, and the transcript becomes the request. Press any other key while you hold the talk key, and Quill cancels. If you prefer to type, ⌘K opens a box.

The agent never touches your note. In `Workspace.swift`, Quill writes a working copy into its support folder and points the agent at that folder. The agent edits the copy like any other file. Claude Code connects over the Agent Client Protocol, and Codex connects over `codex app-server`.

Quill then compares the copy with your note word by word. It plays each difference into the editor as a pending change. ⌘↩︎ keeps one change, ⌘⌫ reverts it, and ⌘Z reverts the whole request. If you type while the agent works, Quill merges the two versions before you review.

## What else Quill does

- Quill has ten co-writers built in: Claude Code, Codex, Cursor, Gemini CLI, Grok Build, OpenCode, Antigravity, Devin, Pi and fx. You can also enter any OpenAI-compatible or Anthropic URL and key. The agents sign in through their own tools, so the plan you pay for covers the edits.
- **Also Ask** sends one request to several co-writers. Quill merges their copies line by line, and each change shows who wrote it.
- `Voice.md` in your notes folder holds style rules, and the agent reads them before each edit. Quill never changes the section called "My rules". It also checks each answer for stock AI phrases. If it finds one, it asks the agent to rewrite once.
- Notes stay plain `.md` files. The editor draws Obsidian callouts, embeds, properties and math, and Mermaid diagrams as you type. Open any folder as a window with ⌘O or `quill .`, and that folder becomes the context of the agent.

My own benchmark used a note of 92,000 characters. The mean cost of a keystroke in the editor went from 3.1 ms to 1.6 ms for prose. In a notes folder it went from 5.0 ms to 1.5 ms. Both figures are from a release build.

## Limits of Quill

- Quill needs macOS 26 or later and works on Mac only.
- Claude Code, Gemini CLI, Grok Build and Pi need Node. Codex needs `npm install -g @openai/codex`, and Cursor needs `cursor-agent login`.
- Speech uses the Apple recogniser and asks for microphone access.
- The agent can still get an edit wrong. For that reason, each change waits for you.
- I have not compared Quill side by side with Obsidian, and I have not benchmarked it against other tools.

## Quill compared with Obsidian, Cursor, Wispr Flow and Superwhisper

Obsidian is a general notes app with plugins. Quill reads the same plain files and syntax, so you can open one folder in both.

Cursor is a code editor. In Quill, Cursor is one of the co-writers, not a competitor.

Wispr Flow and Superwhisper turn speech into typed text in any app. Speech in Quill is a command about text that is already on the page.

I have not tested any of these tools against Quill, so I make no claim about speed or accuracy.

## Try Quill

Download [Quill.dmg](https://github.com/hridaya423/quill/releases/latest/download/Quill.dmg), drag it into Applications and open it. The first run asks for a folder, then a co-writer, and opens a practice email. Hold right Option, say "make it direct", and press ⌘↩︎ to keep the result.

Site: [quill.hridya.tech](https://quill.hridya.tech). Source: [github.com/hridaya423/quill](https://github.com/hridaya423/quill) (Apache-2.0).
