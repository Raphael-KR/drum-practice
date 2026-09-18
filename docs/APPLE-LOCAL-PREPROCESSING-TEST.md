# Apple local preprocessing experiment — 2026-09-19

## Goal and scope

Test whether the installed Apple SpeechTranscriber and AFM 3 Core Advanced can preprocess Japanese singing for lyric alignment, reducing downstream material and latency. Success requires actual local execution, measured latency, usable results and preservation of source timestamps. The clinic project was read-only; production lyrics and UI were not changed. All audio remained local.

## Setup

Reused clinic-ai/clinic_ai/native/SpeechBridge.swift (ja_JP instead of ko_KR) and FoundationBridge.swift. Runtime reported AFM 3 Core Advanced, available, contextSize=8192. Three original-mixture audio excerpts: 113–129 s, 61–74 s, 184–198 s. Runs were sequential. These are one-shot measurements, not a statistical benchmark; model load/cache may affect future timings.

## Results

| Case | Audio duration | STT wall seconds | Existing AFM bridge wall seconds | AFM result |
|---|---:|---:|---:|---|
| Verse / bar48 | 16 | 0.363 | 42.011 | content was only `{`; invalid JSON payload |
| Chorus | 13 | 0.305 | 40.281 | same failure |
| Bridge | 14 | 0.267 | 40.099 | same failure |

STT returned text and timing runs in all three cases, but mistranscribed or omitted words. Bar48 phrase was recognized. Japanese kanji runs may include multiple sung syllables, so run timestamps are not proof of syllable timing.

An additional typed @Generable mismatch-array probe on the verse returned in 2.008 s and was valid JSON. Semantically it failed: it assigned the entire reference sentence as replacement for input run ID0, rather than locating individual mismatches. This result must not update lyric timing or text. The first failure is specific to the reused document bridge/prompt shape, not evidence that every AFM task fails. The typed result also does not establish reliable alignment quality.

## Reduction without a generative model

A deterministic local script retained each recognized text run and rounded start/end timestamps to hundredths of a second, removed recognition-confidence/metadata fields, and added a reference-text diff. Diff execution was under 0.1 ms per excerpt. Diffs flag spelling differences and clip boundaries too; they are review candidates, not verified errors. Rounding has at most 5 ms impact and is for review packaging only, not production timing changes.

Token counts were measured with the current Apple model.tokenCount API on compact JSON in both variants:

| Case | Full STT JSON tokens | Compact runs + diff tokens |
|---|---:|---:|
| Verse | 926 | 507 |
| Chorus | 758 | 429 |
| Bridge | 616 | 328 |
| Total | 2300 | 1264 |

45.0% fewer tokens by the Apple tokenizer, while retaining time anchors and adding diffs. This is not a measured Codex tokenizer, billing reduction, or end-to-end speed comparison. The raw original JSON is retained for reference.

## Decision

Use local STT + deterministic packaging for preprocessing; provide only uncertain spans, time anchors and disagreements to Codex for review. AFM is not yet reliable enough to be a mandatory step for this alignment task. It should not invent phoneme timestamps, split kanji durations equally and call them verified, or overwrite production alignment based on confidence alone. Real end-to-end alignment accuracy and speed are still unmeasured; human/listening ground truth is absent.

Reproduction sources, request files, audio excerpts and machine outputs are retained locally in ignored docs/experiments/apple-stt/: benchmark.py, SpeechBridge.swift, FoundationBridge.swift, StructuredReview.swift, Count.swift, benchmark.json, structured-result.json, deterministic.json and per-case JSON. No clinic data was read or copied.
