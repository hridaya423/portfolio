---
title: "Quill"
headline: "Quill: hold a key, say the change, and your agent edits the note"
summary: "Quill is a free Mac Markdown editor. Hold a key and say the change, and Claude Code, Codex or Cursor rewrites your note in place for you to keep or revert."
kind: "Mac app"
platform: "macOS 26 or later"
status: "Open source"
publishedAt: "2026-11-02"
updatedAt: "2026-11-04"
site: "https://quill.hridya.tech"
repo: "https://github.com/hridaya423/quill"
image: "/projects/quill.jpg"
---

Quill is a Mac Markdown editor where the coding agent you already use edits your draft in place. I built it to stop the loop of pasting a draft into a chatbot, editing the answer and pasting it back. You hold a key, say the change, and watch the old words strike through as new ones type in.

## Talking to a file

The talk key is right Option by default. `App.swift` watches modifier-key events, and holding the key starts a microphone tap into Apple's `SpeechAnalyzer` and `SpeechTranscriber`, with partial text shown as you speak. Release the key and the transcript becomes the request. Press any other key while holding and Quill cancels. If you'd rather type, ⌘K opens a box.

The agent never touches your note. In `Workspace.swift`, Quill writes a working copy into its support folder, points the agent at that folder and lets it edit the file like any other. Claude Code connects over the Agent Client Protocol, and Codex over `codex app-server`.

Quill then compares the copy with your note word by word and plays each difference into the editor as a pending change. ⌘↩︎ keeps one, ⌘⌫ reverts it, and ⌘Z takes back the whole request. If you type while the agent works, Quill merges the two versions before you review.

## What else it does

- Ten co-writers are built in: Claude Code, Codex, Cursor, Gemini CLI, Grok Build, OpenCode, Antigravity, Devin, Pi and fx. You can also enter any OpenAI-compatible or Anthropic URL and key. The agents sign in through their own tools, so the plan you pay for covers the edits.
- **Also Ask** sends one request to several co-writers. Quill merges their copies line by line, and each change shows who wrote it.
- `Voice.md` in your notes folder holds style rules that are read before every edit. Quill never changes the section called "My rules". It also checks each answer for stock AI phrases and asks the agent to rewrite once if it finds one.
- Notes stay plain `.md` files. The editor draws Obsidian callouts, embeds, properties and math, and Mermaid diagrams as you type. Open any folder as a window with ⌘O or `quill .`, and that folder becomes the agent's context.

On my own benchmark with a 92,000-character note, the editor's mean keystroke cost went from 3.1 ms to 1.6 ms for prose. In a notes folder it went from 5.0 ms to 1.5 ms, release build.

## Where it falls short

Quill needs macOS 26 or later and works on Mac only. Claude Code, Gemini CLI, Grok Build and Pi need Node. Codex needs `npm install -g @openai/codex`, and Cursor needs `cursor-agent login`. Speech uses Apple's recogniser and asks for microphone access. The agent can still get an edit wrong, which is why every change waits for you. I haven't compared it side by side with Obsidian, and I haven't benchmarked it against other tools.

## Quill and the tools beside it

Obsidian is a general notes app with plugins. Quill reads the same plain files and syntax, so you can open one folder in both. Cursor is a code editor, and in Quill it's one of the co-writers rather than a rival. Wispr Flow and Superwhisper turn speech into typed text in any app. Quill's speech is a command about text that's already on the page. I haven't tested any of them against Quill, so I make no claim about speed or accuracy.

## Try Quill

Download [Quill.dmg](https://github.com/hridaya423/quill/releases/latest/download/Quill.dmg), drag it into Applications and open it. The first run asks for a folder, then a co-writer, and opens a practice email. Hold right Option, say "make it direct", and press ⌘↩︎ to keep the result.

Source: [github.com/hridaya423/quill](https://github.com/hridaya423/quill) (Apache-2.0). Site: [quill.hridya.tech](https://quill.hridya.tech).
