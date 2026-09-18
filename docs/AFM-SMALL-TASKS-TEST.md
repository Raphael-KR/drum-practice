# AFM small-task usefulness test — 2026-09-19

Goal: find a useful bounded delegation role for the available local AFM 3 Core Advanced after broad lyric alignment failed. Scope: local synthetic/user-supplied text cases, no audio changes or production execution. Success: compare schema-constrained outputs with expected answers specified before each run; report errors and wall latency, without claiming general reliability. Clinic source remained unchanged.

## Method

Swift FoundationModels, SystemLanguageModel.default, a fresh LanguageModelSession for each case, typed @Generable output, temperature 0. Reading classification output capped at 128 tokens; command extraction 192; note routing 96. Same model variant reported in all 28 results. Tests were sequential; no prompt refinement after seeing a task's answers. Reference labels were authored for this small test, not an independent corpus. Median latency includes per-request session/generation/encoding overhead, excludes compilation. Cache/load state affects timing.

| Task | Exact match | Median seconds | Slowest seconds |
|---|---:|---:|---:|
| Japanese pronunciation equivalence | 6/8 | 0.334 | 1.050 |
| Korean practice command extraction | 5/8 | 0.680 | 0.753 |
| Korean feedback-note routing | 11/12 | 0.365 | 0.939 |

## Useful role demonstrated

Feedback-note routing into lyric timing, audio, layout, feature request, mixed, other. Examples: a lyric appearing early → lyricTiming; inaudible metronome → audio; narrow score-row spacing → layout; weekly practice statistics request → featureRequest. Classification metadata can group original notes for a human/Codex reviewer. Preserve every note and its original identifier. Do not discard, suppress or automatically execute anything based on the label. This test demonstrates a promising small classifier, not an end-to-end productivity gain or production-quality acceptance.

## Failures and constraints

- Reading: correctly equated 全て/すべて, 今/いま, 向こう/むこう and 記憶/きおく, and distinguished の/も and 旅鳥/通り. Incorrectly equated 正しい/正しか; gave differentReading rather than uncertain for context-dependent 生/せい. Do not use it to silently dismiss lyric discrepancies.
- Commands: extracted explicit BPM and loop bounds and rejected relative tempo and negated tempo requests. For marker24 and seek37, action was right but number went into endMeasure instead of startMeasure. Also treated a score-size complaint as loopMeasures with zero bounds. Do not directly execute outputs. Simpler action-specific schema could be a later experiment, not a verified fix.
- Routing: mistook clipped lyric text after resizing for lyric timing instead of layout. This keyword confusion is observable; model certainty was not measured. All other 11 predefined cases matched.

## Recommendation

Delegate narrow, reversible annotation such as preliminary grouping of many short notes, then let Codex inspect original text and make final decisions. Avoid AFM for syllable timestamps, exact alignment, automatic code fixes or unsupervised commands. Its local role can reduce external raw-data exposure and repeated categorization work, but the total time/token benefit for a real workflow has not been measured. For a handful of notes, the extra orchestration may cost more than direct review.

## Reproduction

Ignored local folder docs/experiments/afm-small-tasks contains Probe.swift, compiled probe, cases.json (16 labeled cases), routing-cases.json (12 labeled cases), results.jsonl, routing-results.jsonl and evaluation.json. Each output includes variant, case ID, latency and typed result. These probes do not load any patient data or send text to a remote service. No application code or lyric timestamps changed.
