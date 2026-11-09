---
title: "Locus"
headline: "Locus: search 891k omics datasets in plain English, counted by code"
summary: "Locus searches 891,000 public omics datasets from a plain-English question, counts case and control samples with code, and writes nf-core samplesheets."
kind: "Web app"
platform: "Web"
status: "Hackathon build"
category: "ReferenceApplication"
license: "Apache-2.0"
publishedAt: "2026-10-18"
updatedAt: "2026-11-09"
repo: "https://github.com/hridaya423/locus"
award: "1st place, Reinvent the Wheel (London)"
image: "/projects/locus.jpg"
---

Locus finds public omics datasets from a plain-English question. Then it counts the case and control samples in each dataset with code, not with a model. It searches 891,000 datasets across 18 repositories. Locus is for biologists who now search GEO, PRIDE and ENA by hand.

We built Locus as a team at Reinvent the Wheel, a Tools for Science hackathon in London, from 16 to 18 October 2026. It won 1st place. I wrote most of the commits. jurilw added the processing pipeline, the figures, the proteomics sample counts and the explanation step. Charlotte Ellison also contributed.

## A model never writes a number

A chatbot can name good datasets, but it guesses how many samples each one holds. So in Locus a model plans the search and picks one field, and code does the count.

1. Claude Sonnet 5.5 plans the search: synonyms, organism, and which assays must come from the same samples.
2. SQLite full-text search (BM25) and PubMedBERT embeddings each rank the datasets. Reciprocal rank fusion merges the two lists.
3. Claude Haiku 5.5 triages the candidates.
4. For GEO, the model only chooses which field in the sample records separates case from control.
5. Code in `omics_agent/samples.py` counts the samples. Counted facts override any model answer.
6. Code grades each dataset "usable as is" or "close match". It names which of four checks failed: topic, material, data type or controls.

Accessions come only from repository records. Locus shows a quote only if the quote appears word for word in the metadata.

## An example: mTOR inhibition

The query was "Matched RNA-seq and Ribo-seq before and after mTOR inhibition". Locus ranked GSE36892 second and GSE35469 seventh. GEO DataSets and OmicsDI returned nothing.

Locus counted GSE36892 as 4 plus 4 Ribo-seq libraries and 2 plus 2 RNA-seq libraries. It warned that 4 Ribo-seq libraries have no matching RNA-seq. A chatbot with web search guessed 8 plus 8. We counted four studies again by hand, and all four Locus counts matched.

## Strict on purpose

A Ribo-seq library pairs with an RNA-seq library only if two things match: the titles, after Locus removes the assay words, and the characteristics. An unclear pair gets an `_unpaired` suffix.

Locus writes a contrast only with at least 2 pairs on each side. It refuses GSE129816, where untreated and Torin1-treated wild-type samples both have the label "control".

## How well Locus works

I compared Locus with Claude Opus 5.5 with web search, on 8 harness questions (`docs/evaluation.md`). Opus named 34 datasets that Locus indexes. Locus returned 15 of them, and 12 graded strong.

Locus is no better than Opus at the choice of datasets. Opus chose better datasets on 2 of the 8 questions, and Locus misses PXD020186, GSE100007 and PXD058312. Locus is better at the counts.

Samplesheets for 10 GEO Ribo-seq studies all pass the pipeline input schema. In 3 biologist interviews, the biologists finished 10 of 10 tasks inside Locus. Two of those tasks needed sources other than the named dataset.

## The laptop RNA-seq pipeline

During the hackathon we added `omics process`. It reads the first 2,000,000 reads of each FASTQ file and runs salmon, tximport, DESeq2 and apeglm. Then it draws five figures and writes a short explanation. Code checks each number in the explanation and drops a number that it cannot verify.

The first run builds an index in about 7 minutes and uses 3.3 GB of RAM on an 8-core ARM machine. After that, a 6-sample study takes about three minutes. The worked example is GSE273888: HeLa cells with 100 nM rapamycin against no treatment.

## Limits of Locus

- The pipeline reads a subsample. It handles one contrast for each dataset, with at most 4 samples on each side, and supports only human and mouse.
- Locus counts sample records, not patients.
- The model picks the case and control field, so a wrong pick gives a wrong contrast.
- Locus does not cache the triage step, so the same query can return different results.
- Most ENA, EGA and dbGaP records have no species. Proteomics counts cover about 28% of PRIDE.
- Controlled-access data (EGA, dbGaP) gets a link only.
- No wet-lab scientist has reviewed the biology of the worked example.
- The first look is a Welch t-test screen, not DESeq2.

## Locus compared with GEO DataSets, OmicsDI, chatbots and nf-core

GEO DataSets search and OmicsDI work well for exact keywords, but they returned nothing for the plain-English example above. Chatbots with web search find good datasets, sometimes better datasets than Locus finds, but they guess sample counts.

The nf-core pipelines riboseq and rnaseq run the real analysis. Locus only writes their inputs or runs a subsampled preview.

## Try Locus

The source is at [github.com/hridaya423/locus](https://github.com/hridaya423/locus) under Apache-2.0. There is no hosted demo. You need uv, Node 20 or later, and an Anthropic API key.

```sh
uv sync
cp .env.example .env
uv run omics "I work on lung fibrosis in humans and need single-cell and proteomics data from patients and healthy controls"
```

Without the 1.3 GB local index, Locus searches only the live GEO, PRIDE and CELLxGENE APIs. To add Locus as an MCP server for agents, run `claude mcp add locus -- uv run --directory "$PWD" omics-mcp`.
