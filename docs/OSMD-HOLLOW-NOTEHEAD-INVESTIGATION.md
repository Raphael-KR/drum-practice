# OSMD normal notehead fill investigation

## Goal and scope
- Goal: reproduce and fix MusicXML `normal` notehead `filled="no"` in upstream OSMD.
- Scope: isolated upstream checkout (current path: `/Users/raphael/Playground/drum-practice/dependencies/osmd-hollow-fix`); converter, VexFlow patch table, regression tests. The checkout moved on 2026-10-03 without changing the investigated commit.
- Acceptance: clean upstream fails regression tests, fixed source passes; real SVG visual check and build.
- Exclusions: copyrighted song/audio/lyrics in public contribution; no replacement of the app's OSMD dependency in this task.
- Verification: Safari MCP / Karma and production build; public proposal status recorded separately.

## Upstream evidence
- Repository: https://github.com/opensheetmusicdisplay/opensheetmusicdisplay (BSD-3-Clause).
- Tested installed package: 2.1.2, SVG backend, Safari 27.0.
- Upstream checkout: develop at `0502732adb3d352705af18d353849130f46503b2`, package version 2.1.3.
- MusicXML reference: https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/notehead/
- OSMD reads `Notehead.Filled=false`, but `VexFlowConverter.NoteHeadCode` returns an empty suffix for NORMAL.
- VexFlow therefore chooses a duration-dependent default head. The quarter-length workaround mutates key properties after head creation and does not fix the rendered head; it also loops over all chord members.
- Clean reproduction contains only synthetic quarter/eighth/sixteenth percussion notes and default-filled controls. No application post-processing.
- Local evidence: `docs/experiments/osmd-hollow-report/{repro.musicxml,observed.json,repro.png}` (ignored experimental outputs).
- Duplicate search found related closed #325 and #1562, but no exact matching open issue in the searches performed.

## Proposed fix
- Add N1 (hollow normal) and N2 (filled normal) to the existing VexFlow patch custom-head table.
- Use these per-note keys only when the requested fill differs from the written duration's default. Preserve whole/breve head shape when no override is needed.
- Use written TypeLength rather than performed length for tuplets/tremolos.
- Remove the ineffective chord-wide quarter workaround. Durations, ticks, stems and chord membership are not changed.

## Regression evidence
- Same seven Safari tests on unmodified upstream: 2 pass, 5 fail (quarter/eighth/sixteenth hollow, mixed chord, filled half).
- With patch: 7 pass. Half/whole default heads remain unchanged and rhythmic ticks match controls.
- The manually connected Safari disconnects when single-run Karma shuts down; recorded assertion results are distinct from that teardown warning.
- Focused suite: 21 pass. Full suite: 418 pass, 2 skipped, 1 failure. Unmodified base plus new tests: 413 pass, 2 skipped, 6 failures.
- Remaining failure is the same tablature geometric/raster comparison on both versions, with the same measured discrepancy (0.014285714285714285 vs threshold 0.012).
- `npm run build` passed with three Webpack bundle warnings; TypeScript and ESLint passed. Initial omitted optional demo dependencies were installed locally without changing package.json.
- Manual non-single-run Karma requires `karma run` after Safari connects. The initial idle connection timeout was a harness-start issue, resolved before the full comparison above.
- Visual inspection of `docs/experiments/osmd-hollow-report/fixed.png`: all three explicitly hollow heads render as outlined ovals; default controls remain solid. Screenshot uses compiled upstream library, no app workaround.
- Source commit: `b62a6ca`, branch `fix/normal-notehead-fill` in isolated checkout. Patch: `docs/osmd-normal-notehead-fill.patch`.
- PR target: opensheetmusicdisplay/opensheetmusicdisplay, develop. Title: `fix: honor normal MusicXML notehead fill overrides`. Exact body: `docs/OSMD-HOLLOW-NOTEHEAD-PR.md`.
- Build reproduction page: copy isolated checkout's `build/opensheetmusicdisplay.min.js` to `public/qa/osmd-upstream-fixed.js`, then open `/qa/osmd-hollow-fixed.html`. Generated bundle is locally excluded from Git.

## Publication boundary
The code and final PR text are prepared locally first. External submission needs approval of the final authored text under the user's External Communication Approval instructions. No issue/PR has been submitted at this stage.
