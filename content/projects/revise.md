---
title: "Revise with the Past"
headline: "Revise with the Past: custom GCSE papers cropped straight from real exams"
summary: "Assemble printable GCSE practice papers from real past-exam questions by topic, marks and time, with matching mark schemes across 10 AQA, Edexcel and OCR subjects."
kind: "Web app"
platform: "Web"
status: "Live"
category: "EducationalApplication"
license: "Apache-2.0"
publishedAt: "2026-05-14"
updatedAt: "2026-11-21"
site: "https://revise.hridya.tech"
repo: "https://github.com/hridaya423/revisewiththepast"
image: "/revise-project.jpg"
---

When I was revising for GCSEs, sitting a full past paper usually felt like a waste of time: half of it covered chapters I already knew, and I just wanted twenty marks on the two topics I kept getting wrong. Revise with the Past builds that paper for you out of real past exam questions, paired with the matching mark scheme.

It covers 10 GCSE subjects across AQA, Edexcel and OCR. Pick a board, subject, tier, topics, mark total and time limit; you don't need an account to build a paper. You only need to sign in if you want to photograph your written answers and get suggested marking.

![The Revise with the Past homepage: "Build a paper from what you have studied" beside a generated AQA Business cover page and question sheet.](/revise-project.jpg)

## Cropped from the original pages, never retyped

Retyping exam questions into HTML almost always ruins the diagrams, strips out subtle layout cues, and introduces typos that subtly change what's being asked. Revise with the Past never retypes a question. Instead, it stores the bounding boxes on the original exam PDF (the stem, every figure, and the whole question) and crops those regions directly onto your new paper. Every question looks identical to the way it appeared in the exam hall.

## Getting clean crops out of raw exam PDFs

Exam PDFs don't contain metadata marking where Question 4(b) starts and ends, so a four-step pipeline extracts it.

First, discovery scripts collect past papers, mark schemes and inserts: the discovery file indexes 1,712 documents from 2018 to 2024 (836 question papers, 831 mark schemes and 45 inserts; 981 AQA, 624 Edexcel and 107 OCR), though the live app only exposes enabled courses. Next, `pdfjs` and Python's `pymupdf` read every PDF while keeping bounding boxes for each line of text, and per-board parsers locate question boundaries and strip headers and footers.

An LLM via OpenRouter then tags each question part with its topic, knowledge points, skills, command word and mark value. Plain code sums those marks against the paper's total and marks every part `validated`, `mismatched` or `unknown`. Finally, `generateCustomPaper` picks questions using a seeded random generator to balance topics and question types, renumbers them, renders the cover sheet, question pages and matching mark-scheme excerpts with `pdf-lib`, and runs quality gates before handing back the PDF.

## Suggested marking

After you finish a paper, you can upload photos of your written pages. OCR runs on Replicate (via the Hack Club proxy), and the app sends your answer alongside the question and official mark scheme text to a model on OpenRouter (defaulting to `google/gemini-3.1-flash-lite`).

Every score stays labelled as suggested until you confirm or edit it, and confirmed marks are never overwritten. Questions that ask for a drawing or graph go straight to manual review. On the homepage there's a worked 6-mark example on flood defences receiving a suggested 4/6, showing which points it earned and where it stopped.

I haven't built a formal evaluation set to measure marking accuracy yet, so treat the score as a starting point and double-check it against the mark scheme. Your confirmed marks feed back into future papers, weighting them toward the topics where you dropped points.

## Limits and alternatives

A few practical limits: marking accuracy isn't formally measured; it's GCSE only (Edexcel Physics exists in the codebase but is disabled); saved PDFs live on the Hack Club CDN and are accessible to anyone with the link; account deletion currently requires emailing me; and all exam questions and mark schemes belong to AQA, Edexcel and OCR, with no affiliation or endorsement.

Sites like Save My Exams, Physics & Maths Tutor, Seneca and the exam boards themselves have far larger libraries, human-written notes and broader subject coverage—if you want a complete official paper, go straight to the exam board. Revise with the Past does one specific thing: stitching together a targeted, exam-accurate paper across multiple years for the exact topics and time you have.

## Try it

Build a paper at [revise.hridya.tech/paper-maker](https://revise.hridya.tech/paper-maker), or try answer marking at `/marking`. There's also an MCP endpoint documented at `/docs/mcp` so AI clients can list subjects and topics and request temporary links to papers and mark schemes.

Source: [github.com/hridaya423/revisewiththepast](https://github.com/hridaya423/revisewiththepast) (Apache-2.0). Built with Next.js, React, Convex and Better Auth, deployed on Vercel.
