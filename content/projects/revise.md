---
title: "Revise with the Past"
headline: "Revise with the Past: GCSE papers cropped from real exam pages"
summary: "Revise with the Past builds a printable GCSE paper from real questions cropped from past exam pages, with a mark scheme. 10 subjects from AQA, Edexcel and OCR."
kind: "Web app"
platform: "Web"
status: "Live"
category: "EducationalApplication"
license: "Apache-2.0"
publishedAt: "2026-05-14"
updatedAt: "2026-11-09"
site: "https://revise.hridya.tech"
repo: "https://github.com/hridaya423/revisewiththepast"
image: "/revise-project.jpg"
---

A past paper covers a whole course. Revision usually needs something smaller: the topics you get wrong, a number of marks and a time limit. Revise with the Past builds that paper from real past exam questions and adds the matching mark scheme. It is for GCSE students in England, and it covers 10 subjects from AQA, Edexcel and OCR.

![The Revise with the Past home page: the line "Build a paper from what you have studied" beside a generated AQA Business paper cover and a question page.](/revise-project.jpg)

You pick a board, subject, tier, topics, marks and time. You need no account to build a paper. Afterwards you can photograph your answers and get suggested marks, and that step needs a sign-in.

## Cropped, not retyped

Revise with the Past never retypes a question. A retyped question loses its figures and its layout, and a typing error changes the question.

Instead, the app stores where each question sits on the original page: the stem, each figure and the whole question. To build a paper, it crops those regions from the page image. So each question looks the same as it did in the exam.

## From a PDF to a question you can pick

A crop region for each question does not exist in a PDF. A pipeline of four steps finds it.

1. **Source.** Scripts find past-paper PDFs and mark schemes. The discovery file has 1,712 records from 2018 to 2024: 836 question papers, 831 mark schemes and 45 inserts. By board, 981 are AQA, 624 are Edexcel and 107 are OCR. That is the discovery count. The app holds only the enabled courses.
2. **Extract.** pdfjs and the Python library pymupdf read each PDF and keep each text line with its bounding box. A parser for each board finds where each question and part begins. The step removes headers and footers.
3. **Tag.** A language model, called through OpenRouter, tags each question part with a topic, knowledge points, skills, a command word and its marks. Code checks the marks against the paper total and labels each part validated, mismatched or unknown.
4. **Assemble.** `generateCustomPaper` picks questions by topic, marks and time with a seeded random generator. It balances the topics and the question types, renumbers the questions, and draws the cover and pages with pdf-lib. It builds the mark scheme from the matching mark-scheme pages. Quality gates run before the paper reaches you.

## How far to trust the marking

You upload photos of your answer pages. OCR runs through Replicate, by way of the Hack Club proxy. The app finds the mark scheme text for each question. It sends the question, that text and the OCR text to a model through OpenRouter. The default model is `google/gemini-3.1-flash-lite`.

The model only suggests. Revise with the Past keeps each mark as "suggested" until you confirm it or edit it, and it never overwrites a confirmed mark. Questions that need a drawing or a graph go to manual review.

The home page shows an illustrative example. A 6-mark answer about flood defences gets a suggested 4 out of 6. The example lists the marking points it earned and the reason it stops at 4.

I have not measured marking accuracy, and the repository has no evaluation set. Check each suggested mark against the mark scheme.

Your marking history records confirmed marks and the topics where you lost marks. Those topics feed the next paper you build.

## Limits of Revise with the Past

- Marking accuracy is not measured.
- The app covers GCSE only. Edexcel Physics exists in the code but is disabled.
- Saved PDFs are public to anyone who has the link, on the Hack Club CDN.
- There is no account deletion in the app. You ask by email.
- The exam boards own the question and mark scheme content. The terms say that the app is not part of any exam board and that no exam board approves it.

## Revise with the Past compared with Save My Exams, Physics & Maths Tutor, Seneca and the exam boards

Those sites give you whole papers or topic questions, often with a mark scheme that a person wrote. They hold more content, people check it, and they cover more subjects. If you want a full, official paper, go to the exam board.

Revise with the Past does one different thing. It assembles a new paper from many past papers by topic, marks and time, then suggests marks for photographed answers.

## Try Revise with the Past

Open [revise.hridya.tech/paper-maker](https://revise.hridya.tech/paper-maker) and choose your board, subject, tier, topics, marks and time. Marking is at `/marking`.

The app also runs an MCP endpoint. An AI client can list the subjects and topics, request a paper and get temporary links to the paper and the mark scheme. The documentation is at `/docs/mcp`.

Source: [github.com/hridaya423/revisewiththepast](https://github.com/hridaya423/revisewiththepast) (Apache-2.0). The stack is Next.js, React, Convex and Better Auth, deployed on Vercel.
