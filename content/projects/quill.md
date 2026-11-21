---
title: "Quill"
headline: "Quill: hold a key, say the edit, and watch your agent rewrite the note"
summary: "A free Mac Markdown editor built around voice edits. Hold a key, describe the change, and Claude Code, Codex or Cursor rewrites your draft in place for you to keep or revert."
kind: "macOS app"
platform: "macOS 26 or later"
status: "Open source"
category: "UtilitiesApplication"
license: "Apache-2.0"
publishedAt: "2026-11-02"
updatedAt: "2026-11-21"
site: "https://quill.hridya.tech"
repo: "https://github.com/hridaya423/quill"
image: "/projects/quill.jpg"
---

I built Quill because I was tired of pasting a Markdown draft into a chat window, asking for a rewrite, fixing the reply, and pasting it back. Quill is a free, open-source Mac Markdown editor where you hold right Option, say the change you want, and let the coding agent you already use edit the draft in place. Old words strike through as the new ones appear, and you accept or revert each diff right on the page.

## Talking straight to a note

`App.swift` watches modifier-key events for right Option (the default talk key). While you hold it down, a microphone tap streams into Apple's `SpeechAnalyzer` and `SpeechTranscriber`, showing partial text as you speak. Release the key and the transcript becomes an edit request; press any other key while holding it and Quill cancels. If you'd rather type an instruction, `⌘K` opens a small prompt box instead.

The agent never touches your real file directly. `Workspace.swift` writes a working copy into Quill's application support folder and points the agent there (Claude Code connects over the Agent Client Protocol, while Codex speaks over `codex app-server`). When the agent finishes, Quill diffs the copy word by word against your note and streams every change into the editor as a pending edit: `⌘↩︎` keeps a change, `⌘⌫` reverts it, and `⌘Z` undoes the whole request. If you keep typing while the agent is working, Quill merges both sets of edits before you review.

## Co-writers, voice rules and speed

Ten co-writers work out of the box: Claude Code, Codex, Cursor, Gemini CLI, Grok Build, OpenCode, Antigravity, Devin, Pi and `fx`, plus any custom OpenAI-compatible or Anthropic URL and key. Agents sign in through their own CLIs, so your existing subscription covers the edits.

If you want a second opinion, **Also Ask** sends one instruction to several co-writers at once and merges their diffs line by line, showing who wrote each suggestion. You can also drop a `Voice.md` file in your notes folder with style rules the agent reads before every edit (Quill never alters the section titled "My rules"), and Quill runs a pass for stock AI phrasing, asking for a single rewrite if it catches any.

Notes stay plain `.md` files on disk, with live rendering for Obsidian callouts, embeds, properties, math and Mermaid diagrams. Opening any folder with `⌘O` or `quill .` makes that folder the agent's context. On a 92,000-character test note in a release build, tuning the editing path cut mean keystroke latency from 3.1 ms to 1.6 ms in standalone prose, and from 5.0 ms to 1.5 ms inside a full notes folder.

## How it sits next to Obsidian, Cursor and dictation apps

Because Quill reads the same plain Markdown files and syntax as Obsidian, you can open one vault in both without converting anything. Cursor isn't a rival here—inside Quill it's one of the co-writers. And unlike Wispr Flow or Superwhisper, which dictate new text into any app, speech in Quill is an edit command about text already sitting on the page.

## Limits

Quill is Mac-only and needs macOS 26 or later for Apple's newer speech APIs, plus microphone permission. External CLIs keep their own setup requirements: Claude Code, Gemini CLI, Grok Build and Pi need Node, Codex needs `npm install -g @openai/codex`, and Cursor needs `cursor-agent login`. Agents still make clumsy edits now and then, which is why nothing lands permanently without you accepting it.

## Try it

Download [Quill.dmg](https://github.com/hridaya423/quill/releases/latest/download/Quill.dmg), drag it into Applications, and open it. First launch asks for a folder and a co-writer, then opens a practice email: hold right Option, say "make it direct", and press `⌘↩︎` to keep the edit.

Site: [quill.hridya.tech](https://quill.hridya.tech). Source: [github.com/hridaya423/quill](https://github.com/hridaya423/quill) (Apache-2.0).
