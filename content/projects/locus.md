---
title: "Locus"
headline: "Locus: plain-English search across 891k omics datasets, with sample counts verified by code"
summary: "Describe the biological dataset you need in plain English. Locus searches 891,000 public omics datasets across 18 repositories, counts case and control samples in code, and writes nf-core samplesheets."
kind: "Web app"
platform: "Web"
status: "Hackathon build"
category: "ReferenceApplication"
license: "Apache-2.0"
publishedAt: "2026-10-18"
updatedAt: "2026-11-21"
repo: "https://github.com/hridaya423/locus"
award: "1st place, Reinvent the Wheel (London)"
image: "/projects/locus.jpg"
---

Over a weekend in King's Cross at Reinvent the Wheel (a Tools for Science hackathon, 16–18 October 2026), our team built Locus and won 1st place and the £1,000 grand prize. I wrote most of the commits; `jurilw` built the local processing pipeline, figures, proteomics sample counts and explanation step, and Charlotte Ellison contributed as well.

Locus lets biologists describe the public omics study they need in plain English instead of digging through GEO, PRIDE and ENA by hand. It searches 891,000 datasets across 18 repositories, counts case and control samples with real code rather than letting a model guess, and outputs `nf-core` samplesheets.

## Why models aren't allowed to count

Ask a general chatbot for public sequencing studies and it can often name good accessions, then casually invent how many samples each one holds. In Locus, models only plan the query and pick metadata columns; deterministic code counts every sample and grades every dataset.

Claude Sonnet 5.5 starts by expanding your question into synonyms, organisms, and constraints such as which assays have to come from matched samples. SQLite full-text search (BM25) and PubMedBERT embeddings rank candidates separately, and Reciprocal Rank Fusion merges both lists before Claude Haiku 5.5 triages the top hits. For GEO studies, the model only chooses *which* metadata field separates case from control. From there, `omics_agent/samples.py` counts the actual sample records, and those counts override anything the model said earlier. Plain code then grades each study as **usable as is** or **close match**, naming whichever of four checks failed (topic, material, data type or controls). Accessions come strictly from repository records, and quotes only appear if they exist word for word in the metadata.

## Testing it on mTOR inhibition

When we ran *"Matched RNA-seq and Ribo-seq before and after mTOR inhibition"*, GEO DataSets and OmicsDI both returned zero results. Locus ranked `GSE36892` second and `GSE35469` seventh.

On `GSE36892`, Locus counted 4 + 4 Ribo-seq libraries and 2 + 2 RNA-seq libraries, flagging that four of the Ribo-seq libraries had no matched RNA-seq partner. A web-search chatbot guessed 8 + 8. We audited four studies by hand, and all four of Locus's counts matched.

Pairing is deliberately strict: a Ribo-seq library only pairs with an RNA-seq library if both its title (with assay words stripped out) and its sample characteristics agree, while unclear libraries get an `_unpaired` suffix. Locus won't write a contrast without at least two clean pairs on each side, which is why it refuses `GSE129816`, where untreated and Torin1-treated wild-type samples are both labelled `"control"`.

## Where Opus still beats it

I compared Locus against Claude Opus 5.5 with web search across 8 harness questions (`docs/evaluation.md`). Opus named 34 datasets present in Locus's index; Locus returned 15 of them, 12 graded strong.

Locus does *not* beat Opus on dataset discovery: Opus picked better studies on 2 of the 8 questions, and Locus missed `PXD020186`, `GSE100007` and `PXD058312`. Where Locus wins is sample counts and structured output. Generated samplesheets for 10 GEO Ribo-seq studies all passed the pipeline input schema, and in three biologist interviews, participants finished 10 out of 10 tasks inside Locus (with two tasks needing outside sources beyond the named dataset).

## Quick laptop RNA-seq previews

During the weekend we added `omics process` so you can sanity-check a dataset on a laptop before sending it to a cluster. It takes the first 2,000,000 reads of each FASTQ file, runs `salmon`, `tximport`, `DESeq2` and `apeglm`, draws five plots, and writes a short summary where code checks every number and drops any figure it can't verify. Building the index on the first run takes about 7 minutes and 3.3 GB of RAM on an 8-core ARM machine; after that, a 6-sample study finishes in roughly three minutes. Our worked example is `GSE273888` (HeLa cells with 100 nM rapamycin versus untreated controls).

## Limits

This is a hackathon build with real gaps:

- `omics process` runs on a subsample, handles one contrast per dataset (at most 4 samples per side), and supports human and mouse only. The first look is a Welch t-test screen rather than full `DESeq2`, and no wet-lab scientist has reviewed the biology of the worked example.
- Locus counts sample records rather than unique patients, and if the model picks the wrong case/control column, the contrast comes out wrong.
- Triage isn't cached, so repeating the exact same query can shift results slightly.
- Upstream metadata is uneven: most ENA, EGA and dbGaP records have no species, proteomics sample counting covers around 28% of PRIDE, and controlled-access repositories (EGA, dbGaP) return links only.

GEO DataSets and OmicsDI are still faster when you know exact keywords, web chatbots sometimes find better studies while guessing counts, and `nf-core` (`riboseq`/`rnaseq`) does the real production analysis. Locus just bridges plain-English search and clean inputs.

## Running it

There's no hosted demo. You'll need `uv`, Node 20+, and an Anthropic API key:

```sh
uv sync
cp .env.example .env
uv run omics "I work on lung fibrosis in humans and need single-cell and proteomics data from patients and healthy controls"
```

Without the 1.3 GB local index, Locus searches only the live GEO, PRIDE and CELLxGENE APIs. To hook it up as an MCP server for coding agents, run `claude mcp add locus -- uv run --directory "$PWD" omics-mcp`.

Source: [github.com/hridaya423/locus](https://github.com/hridaya423/locus) (Apache-2.0).
