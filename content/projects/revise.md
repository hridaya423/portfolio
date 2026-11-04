---
title: "Revise with the Past"
headline: "Revise with the Past: GCSE papers cropped from real exam pages"
summary: "Revise with the Past builds a printable GCSE paper from real questions cropped from past exam pages, with a mark scheme. 10 AQA, Edexcel and OCR courses."
kind: "Web app"
platform: "Web"
status: "Live"
publishedAt: "2026-05-14"
updatedAt: "2026-11-04"
site: "https://revise.hridya.tech"
repo: "https://github.com/hridaya423/revisewiththepast"
image: "/revise-project.jpg"
---

Revise with the Past builds a printable GCSE practice paper out of real past exam questions, cropped straight from the original pages, with the matching mark scheme. It's for GCSE students in England who want practice on their own topics, marks and time. It covers 10 courses across AQA, Edexcel and OCR.

![The Revise with the Past home page: the line "Build a paper from what you have studied" beside a generated AQA Business paper cover and a question page.](/revise-project.jpg)

You pick a board, subject, tier, topics, marks and time. Building a paper needs no account. Afterwards you can photograph your answers and get suggested marks, which does need a sign-in.

## Cropped, not retyped

Revise with the Past never retypes a question. It stores the region of the original page where each question stem, figure and whole question sits, and crops the page image. So every question looks like the original.

Getting those regions takes a pipeline:

1. **Source.** Scripts find past-paper PDFs and mark schemes. The discovery file has 1,712 records from 2018 to 2024: 836 question papers, 831 mark schemes and 45 inserts. By board, 981 are AQA, 624 are Edexcel and 107 are OCR. That's a discovery count, not what's in the app, which has only the enabled courses.
2. **Extract.** pdfjs and the Python library pymupdf read each PDF and keep text lines with their bounding boxes. Per-board parsers find where each question and part begins, and headers and footers are stripped.
3. **Tag.** A language model, called through OpenRouter, tags each question part with a topic, knowledge points, skills, a command word and its marks. The marks are checked against the paper total, and each part is marked validated, mismatched or unknown.
4. **Assemble.** `generateCustomPaper` picks questions by topic, marks and time with a seeded random generator. It balances the spread of topics and question types, renumbers the questions, and draws the cover and pages with pdf-lib. The mark scheme is built from the matching mark-scheme pages. Quality gates run before the paper reaches you.

## How far to trust the marking

You upload photos of your answer pages. OCR runs through Replicate, using the Hack Club proxy. The app finds the mark scheme text for each question and sends the question, that slice and the OCR text to a model, `google/gemini-3.1-flash-lite` by default, through OpenRouter. Questions that need a drawing or graph go to manual review.

Revise with the Past keeps the model's marks as "suggested" until you confirm or edit them, and it never overwrites a confirmed score. I haven't measured marking accuracy, and the repository has no evaluation set. Treat the marks as a first draft.

## What's rough in Revise with the Past

- My October audit called the app a "PDF vending machine with a marking form attached". It listed public Convex queries that expose the question corpus and a save endpoint that accepts any PDF. Newer work may have fixed some of that. I haven't rechecked.
- The new marking features aren't proven against a real Convex backend yet, and two navigation end-to-end tests fail.
- There's no account deletion in the app. You ask by email.
- A lawyer hasn't reviewed the legal pages.
- The exam boards own the question and mark scheme content. The terms say the app is not part of any exam board and that none approves it. I haven't found a licence statement for the source papers.
- Saved PDFs are public by link on the Hack Club CDN.
- Edexcel Physics exists in the code but is disabled. The app covers GCSE only.

## Against Save My Exams, Physics & Maths Tutor, Seneca and the exam boards

Those sites give you whole papers or topic questions, often with a human-written mark scheme. Their content is larger, checked by people and covers more subjects. If you want a full, official paper, go to the exam board.

Revise with the Past does one different thing: it assembles a new paper from many past papers by topic, marks and time, then suggests marks for photographed answers.

## Try Revise with the Past

Open [revise.hridya.tech/paper-maker](https://revise.hridya.tech/paper-maker) and choose your board, subject, tier, topics, marks and time. Marking is at `/marking`. The app also runs an MCP endpoint, so AI clients can request papers and get temporary links, documented at `/docs/mcp`.

Source: [github.com/hridaya423/revisewiththepast](https://github.com/hridaya423/revisewiththepast). The stack is Next.js, React, Convex and Better Auth, deployed on Vercel.
