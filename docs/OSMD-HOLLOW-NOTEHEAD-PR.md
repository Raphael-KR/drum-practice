MusicXML `<notehead filled="no">normal</notehead>` is parsed as `Notehead.Filled === false`, but quarter, eighth and sixteenth notes still render with solid heads. This is observable with unpitched percussion notes, including open hi-hats, without any application post-processing. Conversely, `filled="yes"` on a half note is ignored.

`NoteHeadCode()` currently discards the fill setting for NORMAL. The quarter-length workaround changes key properties after notehead creation and does not change the rendered glyph; it also applies to every member of the chord.

This change routes differing normal-head fill through the existing per-key custom notehead mechanism, adding N1/N2 to OSMD's VexFlow patch table. It preserves the written rhythmic type, ticks, stems, and default whole/half heads, and removes the ineffective quarter workaround. Written TypeLength is used instead of performed length when deciding the default fill.

Seven synthetic MusicXML rendering tests cover hollow quarter/eighth/sixteenth notes, mixed-fill chord members, default half/whole heads, and filled half notes. No copyrighted score or audio is included.

Validation on Safari 27.0 against develop `0502732adb3d352705af18d353849130f46503b2`:
- Unmodified source: 5 of these 7 regression tests fail; patched source: all 7 pass.
- Focused suite including existing Notehead and NoteType tests: 21 pass.
- Full suite: 418 pass, 2 skipped, 1 failure. The remaining `GeometricSkyBottomLineCalculation` tablature-with-effects comparison also fails on the unmodified base with exactly the same measurement (0.014285714285714285 vs threshold 0.012). The base plus new regression tests yields 413 pass, 2 skipped, 6 failures.
- TypeScript check, ESLint and production build pass (Webpack emits existing bundle-size warnings).
- Built SVG inspected visually: hollow heads for each explicit `filled="no"` note, solid default controls; quarter/eighth/sixteenth rhythmic shapes retained.

MusicXML reference: https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/notehead/
