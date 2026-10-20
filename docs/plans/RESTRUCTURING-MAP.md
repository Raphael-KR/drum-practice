# 구조 개편 이동표와 의존 규칙

기준: main 3dee0a8, 2026-10-21. 사용자 실행 승인. 기계 판독표: [restructuring-map.json](restructuring-map.json).

## 경계

- apps/editor와 apps/player 사이 직접 import 금지. 공통 재생 소유자는 modules/playback/playback-screen.ts 하나.
- model은 UI, 앱, 저장 구현에 의존하지 않는다. audio-beat-grid는 분석 실행 코드가 아닌 박 시각 검증 규칙이므로 model로 이동한다. 번역 함수 의존은 오류 문구 호환을 위해 유지한다.
- platform/storage는 model과 직렬화에 필요한 순수 score/media 계약을 사용한다. modules/library는 저장 정책을 호출한다.
- shared/ui는 도메인 규칙을 소유하지 않는다. 음악 화면별 도움말은 modules/help가 소유하고 shared/ui 말풍선·누르기 도구를 사용한다.
- playback은 audio, score, lyrics, library, help를 조합한다. audio와 score는 model, 저장 캐시, 공통 UI를 사용한다. lyrics는 model과 content를 사용한다.
- content는 승인된 곡별 데이터와 기존 보정 로직이다. 기존 보정의 score/lyrics 참조는 보존한다. 순환 의존을 새로 만들지 않는다.
- 전체 barrel export를 추가하지 않는다. 아래 파일의 기존 named export가 기능별 공개 진입점이다. 앱 전용 파일은 외부 모듈의 진입점이 아니다.
- src/app-versions.json과 HTML 주소, DB·직렬화·패키지 규약은 유지한다.

## 소스 이동 (실행 결과, 참조처는 이동 전 기준)

| 이전 | 새 경로 / 책임 영역 | 직접 참조처 |
|---|---|---|
| `src/main.ts` | `src/apps/editor/main.ts` | HTML / tool / asset reference |
| `src/workspace.ts` | `src/apps/editor/workspace.ts` | `src/main.ts`, `src/score-management.ts` |
| `src/editor-session.ts` | `src/apps/editor/editor-session.ts` | `src/main.ts` |
| `src/audio.ts` | `src/apps/editor/audio.ts` | `src/main.ts` |
| `src/score-editor-layout.ts` | `src/apps/editor/score-editor-layout.ts` | `src/score-management.ts` |
| `src/score-management.ts` | `src/apps/editor/score-management.ts` | `src/main.ts` |
| `src/score-review.ts` | `src/apps/editor/score-review.ts` | `src/main.ts` |
| `src/section-editor.ts` | `src/apps/editor/section-editor.ts` | `src/main.ts` |
| `src/style.css` | `src/apps/editor/style.css` | `src/main.ts` |
| `src/player-app.ts` | `src/apps/player/player-app.ts` | HTML / tool / asset reference |
| `src/player.css` | `src/apps/player/player.css` | `src/player-app.ts` |
| `src/player-library-view.ts` | `src/apps/player/player-library-view.ts` | `src/player-app.ts` |
| `src/player-library.css` | `src/modules/library/player-library.css` | `src/main.ts`, `src/player-app.ts` |
| `src/model.ts` | `src/model/model.ts` | `src/audio-core.ts`, `src/audio-practice-setup.ts`, `src/audio-practice-view.ts`, `src/audio-practice.ts`, `src/audio-preview-metronome.ts`, `src/audio-time-map.ts`, `src/canonical-xml.ts`, `src/edit-history.ts`, `src/english-lyrics.ts`, `src/library-backup.ts`, `src/listening-alignment.ts`, `src/listening-revision.ts`, `src/loop-slots.ts`, `src/lyric-bar34-review.ts`, `src/lyric-feedback-batch.ts`, `src/lyric-feedback-followup.ts`, `src/lyric-feedback-m32.ts`, `src/lyric-feedback-m36.ts`, `src/lyric-feedback-m39.ts`, `src/lyric-feedback-m48.ts`, `src/lyric-grid.ts`, `src/lyric-reading.ts`, `src/lyric-revision.ts`, `src/lyric-score.ts`, `src/lyric-tail-shift.ts`, `src/lyric-timing.ts`, `src/main.ts`, `src/marker-slots.ts`, `src/marker-ui.ts`, `src/musicxml.ts`, `src/pdf.ts`, `src/playback-actions.ts`, `src/playback-assets.ts`, `src/playback-frame.ts`, `src/playback-frame.ts`, `src/playback-layout.ts`, `src/playback-measure.ts`, `src/playback-position.ts`, `src/playback-runtime.ts`, `src/playback-screen.ts`, `src/playback-screen.ts`, `src/playback-ui.ts`, `src/practice-controls.ts`, `src/practice-file.ts`, `src/practice-library.ts`, `src/practice-management.ts`, `src/practice-staff-layout.ts`, `src/record-serialization.ts`, `src/repeat-ui.ts`, `src/ribbon-timeline.ts`, `src/score-import.ts`, `src/score-package.ts`, `src/score-reader.ts`, `src/score-render-cache.ts`, `src/score-rest-correction.ts`, `src/score-review.ts`, `src/score-view.ts`, `src/section-editor.ts`, `src/section-shortcuts.ts`, `src/song-scores.ts`, `src/storage.ts` |
| `src/edit-history.ts` | `src/model/edit-history.ts` | `src/editor-session.ts`, `src/main.ts`, `src/storage.ts`, `src/storage.ts`, `src/storage.ts`, `src/storage.ts` |
| `src/audio-beat-grid.ts` | `src/model/audio-beat-grid.ts` | `src/audio-analysis-contract.ts`, `src/audio-beat-tracking.ts`, `src/audio-practice.ts`, `src/model.ts` |
| `src/audio-analysis-contract.ts` | `src/model/audio-analysis-contract.ts` | `src/audio-analysis-cache.ts`, `src/audio-practice.ts` |
| `src/storage.ts` | `src/platform/storage/storage.ts` | `src/audio-practice-setup.ts`, `src/audio-practice.ts`, `src/browser-score.ts`, `src/bundled-score.ts`, `src/canonical-xml.ts`, `src/editor-session.ts`, `src/library-backup.ts`, `src/main.ts`, `src/player-app.ts`, `src/practice-file-controls.ts`, `src/practice-file.ts`, `src/practice-library.ts`, `src/practice-metadata-upgrade.ts`, `src/record-serialization.ts`, `src/recording-tempo.ts`, `src/score-assets.ts`, `src/score-management.ts`, `src/score-package.ts`, `src/score-preference.ts`, `src/score-rest-correction.ts`, `src/score-review.ts`, `src/song-scores.ts` |
| `src/score-database.ts` | `src/platform/storage/score-database.ts` | `src/audio-analysis-cache.ts`, `src/player-app.ts`, `src/practice-library.ts`, `src/storage.ts` |
| `src/preference-storage.ts` | `src/platform/storage/preference-storage.ts` | `src/fullscreen.ts`, `src/song-title.ts` |
| `src/record-serialization.ts` | `src/platform/storage/record-serialization.ts` | `src/library-backup.ts`, `src/main.ts` |
| `src/stored-media.ts` | `src/platform/storage/stored-media.ts` | `src/practice-library.ts`, `src/storage.ts` |
| `src/binary-asset.ts` | `src/platform/storage/binary-asset.ts` | `src/record-serialization.ts` |
| `src/audio-analysis-cache.ts` | `src/platform/storage/audio-analysis-cache.ts` | `src/audio-practice.ts`, `src/practice-file.ts`, `src/practice-library.ts` |
| `src/practice-library.ts` | `src/platform/storage/practice-library.ts` | `src/player-app.ts` |
| `src/download.ts` | `src/platform/browser/download.ts` | `src/licenses.ts`, `src/main.ts`, `src/practice-file-controls.ts` |
| `src/fullscreen.ts` | `src/platform/browser/fullscreen.ts` | `src/main.ts`, `src/playback-screen.ts` |
| `src/landscape-keyboard.ts` | `src/platform/browser/landscape-keyboard.ts` | `src/player-app.ts` |
| `src/load-timing.ts` | `src/platform/browser/load-timing.ts` | `src/player-app.ts` |
| `src/dialog-transition.ts` | `src/shared/ui/dialog-transition.ts` | `src/help.ts` |
| `src/dialog-ui.ts` | `src/shared/ui/dialog-ui.ts` | `src/audio-duplicate-dialog.ts`, `src/audio-practice-setup.ts`, `src/editor-session.ts`, `src/help.ts`, `src/main.ts`, `src/playback-forms.ts`, `src/playback-screen.ts`, `src/playback-shell.ts`, `src/player-app.ts`, `src/score-management.ts`, `src/score-reader.ts` |
| `src/html.ts` | `src/shared/ui/html.ts` | `src/audio-practice-setup.ts`, `src/dialog-ui.ts`, `src/icon-button.ts`, `src/loop-slots.ts`, `src/main.ts`, `src/marker-ui.ts`, `src/playback-forms.ts`, `src/playback-measure.ts`, `src/player-app.ts`, `src/player-library-view.ts`, `src/practice-management.ts`, `src/score-management.ts`, `src/score-management.ts`, `src/section-editor.ts`, `src/settings-ui.ts` |
| `src/icon-button.ts` | `src/shared/ui/icon-button.ts` | `src/audio-practice-setup.ts`, `src/audio-preview-controls.ts`, `src/dialog-ui.ts`, `src/fullscreen.ts`, `src/icons.ts`, `src/playback-forms.ts`, `src/playback-screen.ts`, `src/playback-ui.ts`, `src/player-app.ts` |
| `src/icon-svg.ts` | `src/shared/ui/icon-svg.ts` | `src/audio-practice-setup.ts`, `src/audio-preview-controls.ts`, `src/dialog-ui.ts`, `src/icons.ts`, `src/playback-forms.ts`, `src/playback-screen.ts`, `src/playback-ui.ts`, `src/player-app.ts`, `src/player-library-view.ts`, `src/score-reader.ts` |
| `src/icons.ts` | `src/shared/ui/icons.ts` | `src/fullscreen.ts`, `src/main.ts`, `src/score-management.ts` |
| `src/numeric-drag.ts` | `src/shared/ui/numeric-drag.ts` | `src/playback-screen.ts`, `src/score-editor-layout.ts`, `src/score-management.ts` |
| `src/settings-ui.ts` | `src/shared/ui/settings-ui.ts` | `src/playback-forms.ts` |
| `src/top-edge-header.ts` | `src/shared/ui/top-edge-header.ts` | `src/playback-runtime.ts`, `src/player-app.ts` |
| `src/ui-standard.ts` | `src/shared/ui/ui-standard.ts` | `src/fullscreen.ts`, `src/playback-forms.ts`, `src/playback-screen.ts`, `src/score-management.ts`, `src/workspace.ts` |
| `src/ui-catalog.json` | `src/shared/ui/ui-catalog.json` | `src/ui-standard.ts` |
| `src/licenses.ts` | `src/shared/ui/licenses.ts` | `src/workspace.ts` |
| `src/help-bubble.ts` | `src/shared/ui/help-bubble.ts` | `src/help-controls.ts`, `src/help.ts` |
| `src/help-placement.ts` | `src/shared/ui/help-placement.ts` | `src/help-bubble.ts` |
| `src/help-hold.ts` | `src/shared/ui/help-hold.ts` | `src/help.ts` |
| `src/i18n.ts` | `src/shared/i18n/i18n.ts` | `src/audio-core.ts`, `src/audio-duplicate-dialog.ts`, `src/audio-import-limits.ts`, `src/audio-practice-setup.ts`, `src/audio-practice-view.ts`, `src/audio-practice.ts`, `src/audio-preview-controls.ts`, `src/browser-score.ts`, `src/bundled-score.ts`, `src/canonical-xml.ts`, `src/dialog-ui.ts`, `src/drum-notation.ts`, `src/editor-session.ts`, `src/fullscreen.ts`, `src/help-content.ts`, `src/help-controls.ts`, `src/help-legend.ts`, `src/help.ts`, `src/icons.ts`, `src/library-backup.ts`, `src/licenses.ts`, `src/listening-alignment.ts`, `src/loop-slots.ts`, `src/lyric-bar34-review.ts`, `src/lyric-feedback-batch.ts`, `src/lyric-feedback-followup.ts`, `src/lyric-feedback-m32.ts`, `src/lyric-feedback-m36.ts`, `src/lyric-feedback-m39.ts`, `src/lyric-feedback-m48.ts`, `src/lyric-grid.ts`, `src/lyric-revision.ts`, `src/lyric-score.ts`, `src/lyric-tail-shift.ts`, `src/lyric-timing.ts`, `src/main.ts`, `src/marker-slots.ts`, `src/marker-ui.ts`, `src/media.ts`, `src/model.ts`, `src/musicxml.ts`, `src/pdf.ts`, `src/playback-drawer.ts`, `src/playback-forms.ts`, `src/playback-frame.ts`, `src/playback-measure.ts`, `src/playback-position.ts`, `src/playback-runtime.ts`, `src/playback-screen.ts`, `src/playback-shell.ts`, `src/playback-ui.ts`, `src/player-app.ts`, `src/player-library-view.ts`, `src/practice-controls.ts`, `src/practice-file-controls.ts`, `src/practice-file.ts`, `src/practice-library.ts`, `src/practice-management.ts`, `src/practice-staff-layout.ts`, `src/record-serialization.ts`, `src/repeat-ui.ts`, `src/score-database.ts`, `src/score-editor-layout.ts`, `src/score-import.ts`, `src/score-management.ts`, `src/score-preference.ts`, `src/score-reader.ts`, `src/score-rest-correction.ts`, `src/score-review.ts`, `src/score-system-layout.ts`, `src/section-editor.ts`, `src/song-scores.ts`, `src/ui-standard.ts`, `src/workspace.ts` |
| `src/help.ts` | `src/modules/help/help.ts` | `src/playback-screen.ts`, `src/player-app.ts` |
| `src/help-content.ts` | `src/modules/help/help-content.ts` | `src/help-controls.ts` |
| `src/help-controls.ts` | `src/modules/help/help-controls.ts` | `src/help.ts` |
| `src/help-legend.ts` | `src/modules/help/help-legend.ts` | `src/help.ts` |
| `src/help.css` | `src/modules/help/help.css` | `src/main.ts`, `src/player-app.ts` |
| `src/bundled-score.ts` | `src/modules/library/bundled-score.ts` | `src/main.ts` |
| `src/download-score.ts` | `src/modules/library/download-score.ts` | `src/player-app.ts` |
| `src/library-backup.ts` | `src/modules/library/library-backup.ts` | `src/main.ts` |
| `src/practice-file.ts` | `src/modules/library/practice-file.ts` | `src/player-app.ts`, `src/practice-file-controls.ts` |
| `src/practice-file-controls.ts` | `src/modules/library/practice-file-controls.ts` | `src/playback-runtime.ts`, `src/player-app.ts` |
| `src/practice-metadata-upgrade.ts` | `src/modules/library/practice-metadata-upgrade.ts` | `src/practice-library.ts` |
| `src/recent-score.ts` | `src/modules/library/recent-score.ts` | `src/main.ts` |
| `src/score-assets.ts` | `src/modules/library/score-assets.ts` | `src/main.ts`, `src/score-management.ts`, `src/score-management.ts` |
| `src/score-package.ts` | `src/modules/library/score-package.ts` | `src/main.ts`, `src/player-app.ts`, `src/practice-library.ts` |
| `src/score-preference.ts` | `src/modules/library/score-preference.ts` | `src/main.ts` |
| `src/song-title.ts` | `src/modules/library/song-title.ts` | `src/playback-position.ts`, `src/playback-screen.ts`, `src/player-app.ts`, `src/score-review.ts` |
| `src/browser-score.ts` | `src/modules/score/browser-score.ts` | `src/main.ts`, `src/main.ts`, `src/main.ts`, `src/player-app.ts` |
| `src/canonical-xml.ts` | `src/modules/score/canonical-xml.ts` | `src/bundled-score.ts`, `src/main.ts` |
| `src/drum-beams.ts` | `src/modules/score/drum-beams.ts` | `src/musicxml.ts` |
| `src/drum-legend.ts` | `src/modules/score/drum-legend.ts` | `src/browser-score.ts`, `src/drum-notation.ts`, `src/musicxml.ts` |
| `src/drum-notation.ts` | `src/modules/score/drum-notation.ts` | `src/musicxml.ts`, `src/score-rest-correction.ts` |
| `src/full-score-labels.ts` | `src/modules/score/full-score-labels.ts` | `src/score-management.ts`, `src/score-reader.ts` |
| `src/legacy-drum-identity.ts` | `src/modules/score/legacy-drum-identity.ts` | `src/drum-legend.ts` |
| `src/note-highlight.ts` | `src/modules/score/note-highlight.ts` | `src/main.ts`, `src/musicxml.ts`, `src/playback-assets.ts`, `src/playback-frame.ts`, `src/playback-measure.ts`, `src/playback-runtime.ts`, `src/playback-screen.ts` |
| `src/note-highlight-preference.ts` | `src/modules/score/note-highlight-preference.ts` | `src/main.ts` |
| `src/pdf.ts` | `src/modules/score/pdf.ts` | `src/main.ts`, `src/main.ts` |
| `src/practice-staff-layout.ts` | `src/modules/score/practice-staff-layout.ts` | `src/main.ts`, `src/playback-assets.ts`, `src/playback-layout.ts`, `src/playback-measure.ts`, `src/playback-runtime.ts`, `src/playback-screen.ts`, `src/ribbon-timeline.ts` |
| `src/ribbon-engraving.ts` | `src/modules/score/ribbon-engraving.ts` | `src/musicxml.ts` |
| `src/ribbon-timeline.ts` | `src/modules/score/ribbon-timeline.ts` | `src/musicxml.ts`, `src/playback-assets.ts`, `src/playback-frame.ts`, `src/playback-screen.ts`, `src/ribbon-engraving.ts` |
| `src/score-gestures.ts` | `src/modules/score/score-gestures.ts` | `src/loop-slots.ts`, `src/playback-actions.ts` |
| `src/score-import.ts` | `src/modules/score/score-import.ts` | `src/bundled-score.ts`, `src/main.ts` |
| `src/score-pages.ts` | `src/modules/score/score-pages.ts` | `src/main.ts`, `src/musicxml.ts`, `src/musicxml.ts`, `src/note-highlight.ts`, `src/playback-assets.ts`, `src/practice-staff-layout.ts`, `src/score-management.ts`, `src/score-reader.ts`, `src/score-review.ts` |
| `src/score-reader.ts` | `src/modules/score/score-reader.ts` | `src/playback-runtime.ts` |
| `src/score-render-cache.ts` | `src/modules/score/score-render-cache.ts` | `src/musicxml.ts` |
| `src/score-rest-correction.ts` | `src/modules/score/score-rest-correction.ts` | `src/main.ts` |
| `src/score-view.ts` | `src/modules/score/score-view.ts` | `src/playback-assets.ts`, `src/playback-frame.ts`, `src/playback-layout.ts`, `src/playback-screen.ts` |
| `src/score-zoom.ts` | `src/modules/score/score-zoom.ts` | `src/playback-forms.ts`, `src/playback-screen.ts` |
| `src/staff-geometry.ts` | `src/modules/score/staff-geometry.ts` | `src/practice-staff-layout.ts`, `src/score-review.ts` |
| `src/whole-rest-layout.ts` | `src/modules/score/whole-rest-layout.ts` | `src/musicxml.ts` |
| `src/musicxml.ts` | `src/modules/score/musicxml.ts` | `src/browser-score.ts`, `src/bundled-score.ts`, `src/canonical-xml.ts`, `src/canonical-xml.ts`, `src/main.ts`, `src/main.ts`, `src/score-import.ts`, `src/score-rest-correction.ts` |
| `src/song-scores.ts` | `src/modules/score/song-scores.ts` | `src/browser-score.ts`, `src/bundled-score.ts`, `src/main.ts`, `src/player-app.ts`, `src/practice-library.ts`, `src/record-serialization.ts`, `src/score-assets.ts`, `src/score-management.ts`, `src/score-package.ts`, `src/score-preference.ts`, `src/score-rest-correction.ts`, `src/score-review.ts`, `src/storage.ts` |
| `src/loop-slots.ts` | `src/modules/playback/loop-slots.ts` | `src/playback-frame.ts`, `src/playback-screen.ts` |
| `src/marker-icon.ts` | `src/shared/ui/marker-icon.ts` | `src/audio-practice-view.ts`, `src/icon-svg.ts`, `src/marker-ui.ts`, `src/playback-measure.ts`, `src/score-review.ts` |
| `src/marker-slots.ts` | `src/modules/playback/marker-slots.ts` | `src/audio-practice-view.ts`, `src/marker-ui.ts`, `src/playback-measure.ts`, `src/playback-screen.ts`, `src/practice-management.ts`, `src/score-review.ts` |
| `src/marker-ui.ts` | `src/modules/playback/marker-ui.ts` | `src/playback-screen.ts` |
| `src/practice-controls.ts` | `src/modules/playback/practice-controls.ts` | `src/playback-actions.ts`, `src/playback-screen.ts`, `src/repeat-ui.ts` |
| `src/practice-management.ts` | `src/modules/playback/practice-management.ts` | `src/main.ts`, `src/playback-runtime.ts` |
| `src/repeat-ui.ts` | `src/modules/playback/repeat-ui.ts` | `src/playback-screen.ts` |
| `src/section-shortcuts.ts` | `src/modules/playback/section-shortcuts.ts` | `src/main.ts`, `src/playback-screen.ts`, `src/practice-management.ts`, `src/section-editor.ts` |
| `src/lyric-grid.ts` | `src/modules/lyrics/lyric-grid.ts` | `src/lyric-bar34-review.ts`, `src/lyric-feedback-batch.ts`, `src/lyric-feedback-followup.ts`, `src/lyric-feedback-m32.ts`, `src/lyric-feedback-m36.ts`, `src/lyric-feedback-m39.ts`, `src/lyric-feedback-m48.ts`, `src/lyric-score.ts`, `src/lyric-tail-shift.ts`, `src/main.ts`, `src/playback-position.ts`, `src/playback-screen.ts` |
| `src/lyric-layout.ts` | `src/modules/lyrics/lyric-layout.ts` | `src/playback-layout.ts` |
| `src/lyric-reading.ts` | `src/modules/lyrics/lyric-reading.ts` | `src/main.ts` |
| `src/lyric-revision.ts` | `src/modules/lyrics/lyric-revision.ts` | `src/main.ts` |
| `src/lyric-score.ts` | `src/modules/lyrics/lyric-score.ts` | `src/canonical-xml.ts`, `src/main.ts` |
| `src/lyric-timing.ts` | `src/modules/lyrics/lyric-timing.ts` | `src/listening-revision.ts`, `src/lyric-reading.ts`, `src/lyric-revision.ts`, `src/main.ts` |
| `src/listening-alignment.ts` | `src/modules/lyrics/listening-alignment.ts` | `src/listening-revision.ts` |
| `src/bundled-practice-metadata.json` | `src/content/bundled-practice-metadata.json` | `src/practice-metadata-upgrade.ts` |
| `src/bundled-recording-tempo.json` | `src/content/bundled-recording-tempo.json` | `src/recording-tempo.ts` |
| `src/bundled-scores.json` | `src/content/bundled-scores.json` | `src/player-app.ts` |
| `src/pdf-display-crops.json` | `src/content/pdf-display-crops.json` | `src/score-view.ts` |
| `src/svg-display-crops.json` | `src/content/svg-display-crops.json` | `src/score-view.ts` |
| `src/score-system-layout.ts` | `src/content/score-system-layout.ts` | `src/bundled-score.ts`, `src/score-rest-correction.ts` |
| `src/score-anchor-data.ts` | `src/content/score-anchor-data.ts` | `src/score-view.ts` |
| `src/recording-tempo.ts` | `src/content/recording-tempo.ts` | `src/playback-screen.ts`, `src/player-app.ts` |
| `src/english-lyrics.ts` | `src/content/english-lyrics.ts` | `src/main.ts` |
| `src/listening-revision.ts` | `src/content/listening-revision.ts` | `src/main.ts` |
| `src/lyric-bar34-review.ts` | `src/content/lyric-bar34-review.ts` | `src/main.ts` |
| `src/lyric-feedback-batch.ts` | `src/content/lyric-feedback-batch.ts` | `src/main.ts` |
| `src/lyric-feedback-followup.ts` | `src/content/lyric-feedback-followup.ts` | `src/main.ts` |
| `src/lyric-feedback-m32.ts` | `src/content/lyric-feedback-m32.ts` | `src/main.ts` |
| `src/lyric-feedback-m36.ts` | `src/content/lyric-feedback-m36.ts` | `src/main.ts` |
| `src/lyric-feedback-m39.ts` | `src/content/lyric-feedback-m39.ts` | `src/main.ts` |
| `src/lyric-feedback-m48.ts` | `src/content/lyric-feedback-m48.ts` | `src/main.ts` |
| `src/lyric-reading-data.ts` | `src/content/lyric-reading-data.ts` | `src/english-lyrics.ts`, `src/listening-revision.ts`, `src/lyric-reading.ts` |
| `src/lyric-revision-data.ts` | `src/content/lyric-revision-data.ts` | `src/lyric-revision.ts` |
| `src/lyric-tail-shift.ts` | `src/content/lyric-tail-shift.ts` | `src/main.ts` |
| `src/lyric-timing-data.ts` | `src/content/lyric-timing-data.ts` | `src/lyric-timing.ts` |
| `src/lyric-timing-refinement.ts` | `src/content/lyric-timing-refinement.ts` | `src/main.ts` |
| `src/build-info.generated.json` | `src/generated/build-info.generated.json` | `src/playback-runtime.ts`, `src/player-app.ts`, `src/workspace.ts` |
| `src/third-party.generated.json` | `src/generated/third-party.generated.json` | `src/licenses.ts`, `src/player-app.ts` |
| `src/analysis.ts` | `src/modules/audio/analysis.ts` | `src/main.ts` |
| `src/audio-anchor-wave.ts` | `src/modules/audio/audio-anchor-wave.ts` | `src/audio-practice-setup.ts` |
| `src/audio-bar-one.ts` | `src/modules/audio/audio-bar-one.ts` | `src/audio-practice.ts`, `src/model.ts` |
| `src/audio-beat-analysis.ts` | `src/modules/audio/audio-beat-analysis.ts` | `src/audio-practice.ts` |
| `src/audio-beat-tracking.ts` | `src/modules/audio/audio-beat-tracking.ts` | `src/audio-beat-worker.ts` |
| `src/audio-beat-worker.ts` | `src/modules/audio/audio-beat-worker.ts` | `src/audio-beat-analysis.ts` |
| `src/audio-core.ts` | `src/modules/audio/audio-core.ts` | `src/audio-preview-metronome.ts`, `src/audio.ts`, `src/playback-runtime.ts`, `src/playback-screen.ts` |
| `src/audio-duplicate-dialog.ts` | `src/modules/audio/audio-duplicate-dialog.ts` | `src/player-app.ts` |
| `src/audio-import-limits.ts` | `src/modules/audio/audio-import-limits.ts` | `src/audio-practice.ts`, `src/player-app.ts`, `src/practice-file.ts` |
| `src/audio-levels.ts` | `src/modules/audio/audio-levels.ts` | `src/audio-core.ts` |
| `src/audio-metadata.ts` | `src/modules/audio/audio-metadata.ts` | `src/audio-practice.ts` |
| `src/audio-practice-setup.ts` | `src/modules/audio/audio-practice-setup.ts` | `src/player-app.ts` |
| `src/audio-practice-view.ts` | `src/modules/audio/audio-practice-view.ts` | `src/playback-screen.ts` |
| `src/audio-practice.css` | `src/modules/audio/audio-practice.css` | `src/player-app.ts` |
| `src/audio-practice.ts` | `src/modules/audio/audio-practice.ts` | `src/audio-practice-setup.ts`, `src/player-app.ts`, `src/player-library-view.ts`, `src/practice-file-controls.ts` |
| `src/audio-preview-controls.ts` | `src/modules/audio/audio-preview-controls.ts` | `src/audio-practice-setup.ts` |
| `src/audio-preview-metronome.ts` | `src/modules/audio/audio-preview-metronome.ts` | `src/audio-practice-setup.ts` |
| `src/audio-tempo.ts` | `src/modules/audio/audio-tempo.ts` | `src/audio-practice.ts` |
| `src/audio-time-map.ts` | `src/modules/audio/audio-time-map.ts` | `src/audio-core.ts`, `src/playback-screen.ts`, `src/stretch-warp.ts` |
| `src/media.ts` | `src/modules/audio/media.ts` | `src/main.ts` |
| `src/playback-actions.ts` | `src/modules/playback/playback-actions.ts` | `src/playback-screen.ts` |
| `src/playback-assets.ts` | `src/modules/playback/playback-assets.ts` | `src/main.ts`, `src/main.ts`, `src/playback-runtime.ts`, `src/playback-runtime.ts`, `src/playback-screen.ts` |
| `src/playback-base.css` | `src/shared/styles/controls.css` | `src/main.ts`, `src/player-app.ts` |
| `src/playback-drawer.ts` | `src/modules/playback/playback-drawer.ts` | `src/playback-screen.ts` |
| `src/playback-forms.ts` | `src/modules/playback/playback-forms.ts` | `src/main.ts`, `src/playback-runtime.ts`, `src/playback-screen.ts`, `src/playback-shell.ts`, `src/player-app.ts`, `src/workspace.ts` |
| `src/playback-frame.ts` | `src/modules/playback/playback-frame.ts` | `src/playback-screen.ts` |
| `src/playback-initial.ts` | `src/modules/playback/playback-initial.ts` | `src/playback-runtime.ts`, `src/player-app.ts` |
| `src/playback-layout.ts` | `src/modules/playback/playback-layout.ts` | `src/playback-frame.ts`, `src/playback-screen.ts` |
| `src/playback-measure.ts` | `src/modules/playback/playback-measure.ts` | `src/playback-screen.ts` |
| `src/playback-position.ts` | `src/modules/playback/playback-position.ts` | `src/playback-screen.ts`, `src/score-review.ts` |
| `src/playback-preferences.ts` | `src/modules/playback/playback-preferences.ts` | `src/audio-core.ts`, `src/audio.ts`, `src/main.ts` |
| `src/playback-runtime.ts` | `src/modules/playback/playback-runtime.ts` | `src/player-app.ts` |
| `src/playback-screen.ts` | `src/modules/playback/playback-screen.ts` | `src/main.ts`, `src/playback-runtime.ts`, `src/practice-management.ts` |
| `src/playback-shell.ts` | `src/modules/playback/playback-shell.ts` | `src/audio-practice-setup.ts`, `src/playback-runtime.ts`, `src/workspace.ts` |
| `src/playback-ui.css` | `src/modules/playback/playback-ui.css` | `src/main.ts`, `src/player-app.ts` |
| `src/playback-ui.ts` | `src/modules/playback/playback-ui.ts` | `src/main.ts`, `src/playback-drawer.ts`, `src/playback-forms.ts`, `src/playback-frame.ts`, `src/playback-runtime.ts`, `src/playback-screen.ts`, `src/playback-shell.ts`, `src/workspace.ts` |
| `src/playback-wake-lock.ts` | `src/modules/playback/playback-wake-lock.ts` | `src/playback-screen.ts` |
| `src/stick-click.ts` | `src/modules/audio/stick-click.ts` | `src/audio-core.ts` |
| `src/stretch-warp.ts` | `src/modules/audio/stretch-warp.ts` | `src/stretch-worker.ts` |
| `src/stretch-worker.ts` | `src/modules/audio/stretch-worker.ts` | `src/audio-core.ts` |
| `src/stretch.ts` | `src/modules/audio/stretch.ts` | `src/stretch-warp.ts`, `src/stretch-worker.ts` |
| `src/locales/ko.json` | `src/shared/i18n/locales/ko.json` | `src/i18n.ts` |
| `src/vendor/score-legend-svg.ts` | `src/modules/score/vendor/score-legend-svg.ts` | `src/help-legend.ts` |
| `src/vendor/score-legend-portrait-svg.ts` | `src/modules/score/vendor/score-legend-portrait-svg.ts` | `src/help-legend.ts` |
| `src/vendor/pict-half-open.json` | `src/modules/score/vendor/pict-half-open.json` | `src/drum-notation.ts` |
| `src/vendor/Bravura-OFL.txt` | `src/modules/score/vendor/Bravura-OFL.txt` | HTML / tool / asset reference |

## 테스트·문서·도구 이동

| 이전 | 새 경로 |
|---|---|
| `docs/APP-VERSIONS.md` | `docs/operations/APP-VERSIONS.md` |
| `docs/APPLE-LOCAL-WORKFLOW.md` | `docs/operations/APPLE-LOCAL-WORKFLOW.md` |
| `docs/AUDIO-PRACTICE.md` | `docs/product/AUDIO-PRACTICE.md` |
| `docs/BEAT-ANCHOR-AUDIT.md` | `docs/score-production/BEAT-ANCHOR-AUDIT.md` |
| `docs/BROWSER-MUSICXML-RENDERING.md` | `docs/architecture/BROWSER-MUSICXML-RENDERING.md` |
| `docs/CODE-MAINTENANCE.md` | `docs/architecture/CODE-MAINTENANCE.md` |
| `docs/DEPENDENCY-SECURITY.md` | `docs/operations/DEPENDENCY-SECURITY.md` |
| `docs/GARAGEBAND-DRUM-KITS.md` | `docs/score-production/GARAGEBAND-DRUM-KITS.md` |
| `docs/I18N.md` | `docs/architecture/I18N.md` |
| `docs/IPAD-LANDSCAPE-UX.md` | `docs/product/IPAD-LANDSCAPE-UX.md` |
| `docs/IPAD-SIMULATOR.md` | `docs/operations/IPAD-SIMULATOR.md` |
| `docs/IPAD-STATUS-BAR-DIAGNOSIS.md` | `docs/operations/IPAD-STATUS-BAR-DIAGNOSIS.md` |
| `docs/JAPANESE-CANONICAL-READINGS.md` | `docs/score-production/JAPANESE-CANONICAL-READINGS.md` |
| `docs/LOAD-TIMING.md` | `docs/architecture/LOAD-TIMING.md` |
| `docs/LOVEHOLIC-CONVERSION.md` | `docs/score-production/LOVEHOLIC-CONVERSION.md` |
| `docs/LOVEHOLIC-LYRICS-REVIEW.md` | `docs/score-production/LOVEHOLIC-LYRICS-REVIEW.md` |
| `docs/LOVEHOLIC-PDF-LYRIC-PLACEMENT.md` | `docs/score-production/LOVEHOLIC-PDF-LYRIC-PLACEMENT.md` |
| `docs/LOVEHOLIC-PUBLICATION.md` | `docs/score-production/LOVEHOLIC-PUBLICATION.md` |
| `docs/LOVEHOLIC-REVIEW.md` | `docs/score-production/LOVEHOLIC-REVIEW.md` |
| `docs/LYRIC-ACCURACY-REVIEW.md` | `docs/score-production/LYRIC-ACCURACY-REVIEW.md` |
| `docs/LYRIC-ALIGNMENT-AUDIT.md` | `docs/score-production/LYRIC-ALIGNMENT-AUDIT.md` |
| `docs/LYRIC-SYNC-CORRECTION.md` | `docs/score-production/LYRIC-SYNC-CORRECTION.md` |
| `docs/LYRIC-SYNC-FEEDBACK.md` | `docs/score-production/LYRIC-SYNC-FEEDBACK.md` |
| `docs/LYRIC-SYNC-REVIEW-EVIDENCE.md` | `docs/score-production/LYRIC-SYNC-REVIEW-EVIDENCE.md` |
| `docs/LYRIC-SYNC-SUSPECTS-V1.md` | `docs/score-production/LYRIC-SYNC-SUSPECTS-V1.md` |
| `docs/LYRIC-SYNC-SUSPECTS.md` | `docs/score-production/LYRIC-SYNC-SUSPECTS.md` |
| `docs/LYRICS-JAPANESE-COMPARISON.md` | `docs/score-production/LYRICS-JAPANESE-COMPARISON.md` |
| `docs/MARKER-SLOTS.md` | `docs/product/MARKER-SLOTS.md` |
| `docs/MEASURE-LYRICS.md` | `docs/architecture/MEASURE-LYRICS.md` |
| `docs/MUSICXML-CANONICAL.md` | `docs/architecture/MUSICXML-CANONICAL.md` |
| `docs/MUSICXML-COMPARISON.md` | `docs/score-production/MUSICXML-COMPARISON.md` |
| `docs/MUSICXML-CONVERSION-POLICY.md` | `docs/score-production/MUSICXML-CONVERSION-POLICY.md` |
| `docs/MUSICXML-CONVERSION.md` | `docs/score-production/MUSICXML-CONVERSION.md` |
| `docs/MUSICXML-INTEGRATION.md` | `docs/architecture/MUSICXML-INTEGRATION.md` |
| `docs/MUSICXML-SUPPORT.md` | `docs/architecture/MUSICXML-SUPPORT.md` |
| `docs/MUSICXML-TROUBLESHOOTING.md` | `docs/score-production/MUSICXML-TROUBLESHOOTING.md` |
| `docs/NOTE-PLAYBACK-HIGHLIGHT.md` | `docs/product/NOTE-PLAYBACK-HIGHLIGHT.md` |
| `docs/OPEN-SOURCE-NOTICES.md` | `docs/operations/OPEN-SOURCE-NOTICES.md` |
| `docs/PAUSED-SCORE-SCROLL.md` | `docs/product/PAUSED-SCORE-SCROLL.md` |
| `docs/PDF-DISPLAY-TRIM.md` | `docs/architecture/PDF-DISPLAY-TRIM.md` |
| `docs/PRACTICE-FILE.md` | `docs/architecture/PRACTICE-FILE.md` |
| `docs/PREPLAY-WARMUP-PRODUCTION.md` | `docs/score-production/PREPLAY-WARMUP-PRODUCTION.md` |
| `docs/RECORDING-TEMPO-APP.md` | `docs/architecture/RECORDING-TEMPO-APP.md` |
| `docs/RED-SUNSET-APP-INTEGRATION.md` | `docs/score-production/RED-SUNSET-APP-INTEGRATION.md` |
| `docs/RED-SUNSET-BEAT-41.md` | `docs/score-production/RED-SUNSET-BEAT-41.md` |
| `docs/RED-SUNSET-BEAT-COMPARISON.md` | `docs/score-production/RED-SUNSET-BEAT-COMPARISON.md` |
| `docs/RED-SUNSET-LATE-AUDIO-ANALYSIS.md` | `docs/score-production/RED-SUNSET-LATE-AUDIO-ANALYSIS.md` |
| `docs/RED-SUNSET-PRODUCTION.md` | `docs/score-production/RED-SUNSET-PRODUCTION.md` |
| `docs/RIBBON-READABILITY.md` | `docs/product/RIBBON-READABILITY.md` |
| `docs/SCORE-MUSICXML-OSMD-MAPPING.md` | `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md` |
| `docs/SCORE-PACKAGE.md` | `docs/architecture/SCORE-PACKAGE.md` |
| `docs/SCORE-PRODUCTION-PROCESS.md` | `docs/score-production/SCORE-PRODUCTION-PROCESS.md` |
| `docs/SCORE-REVIEW.md` | `docs/product/SCORE-REVIEW.md` |
| `docs/SCORE-WORKSPACE.md` | `docs/product/SCORE-WORKSPACE.md` |
| `docs/SETTINGS-PLAYBACK.md` | `docs/product/SETTINGS-PLAYBACK.md` |
| `docs/SITE-SECURITY-HARDENING.md` | `docs/operations/SITE-SECURITY-HARDENING.md` |
| `docs/SITES-PUBLICATION.md` | `docs/operations/SITES-PUBLICATION.md` |
| `docs/SVG-RENDERING.md` | `docs/architecture/SVG-RENDERING.md` |
| `docs/SVG-SCORE-RULES.md` | `docs/architecture/SVG-SCORE-RULES.md` |
| `docs/TOM-MOVING-PRODUCTION.md` | `docs/score-production/TOM-MOVING-PRODUCTION.md` |
| `docs/UI-COMPONENTS.md` | `docs/product/UI-COMPONENTS.md` |
| `docs/UX-PRINCIPLES.md` | `docs/product/UX-PRINCIPLES.md` |
| `docs/acceptance.md` | `docs/operations/acceptance.md` |
| `docs/lyric-review-targets.json` | `docs/score-production/lyric-review-targets.json` |
| `docs/osmd-normal-notehead-fill.patch` | `docs/score-production/osmd-normal-notehead-fill.patch` |
| `scripts/apple-local/Review.swift` | `tools/apple-local/Review.swift` |
| `scripts/apple-local/SpeechBridge.swift` | `tools/apple-local/SpeechBridge.swift` |
| `scripts/apple-local/align_syllables.py` | `tools/apple-local/align_syllables.py` |
| `scripts/apple-local/boundaries.py` | `tools/apple-local/boundaries.py` |
| `scripts/apple-local/reconcile_alignment.py` | `tools/apple-local/reconcile_alignment.py` |
| `scripts/apple-local/test_boundaries.py` | `tools/apple-local/test_boundaries.py` |
| `scripts/apple-local/test_reconcile_alignment.py` | `tools/apple-local/test_reconcile_alignment.py` |
| `scripts/apple-local/test_workflow.py` | `tools/apple-local/test_workflow.py` |
| `scripts/apple-local/workflow.py` | `tools/apple-local/workflow.py` |
| `scripts/benchmark-renderer-server.py` | `tools/score-production/benchmark/benchmark-renderer-server.py` |
| `scripts/benchmark-renderer.html` | `tools/score-production/benchmark/benchmark-renderer.html` |
| `scripts/benchmark-renderer.ts` | `tools/score-production/benchmark/benchmark-renderer.ts` |
| `scripts/build-info.mjs` | `scripts/build/build-info.mjs` |
| `scripts/build-portrait-legend.mjs` | `tools/score-production/build-portrait-legend.mjs` |
| `scripts/build-renderer-benchmark.mjs` | `tools/score-production/benchmark/build-renderer-benchmark.mjs` |
| `scripts/bump-app-version.mjs` | `scripts/release/bump-app-version.mjs` |
| `scripts/check-app-boundaries.mjs` | `scripts/checks/check-app-boundaries.mjs` |
| `scripts/check-common-components.mjs` | `scripts/checks/check-common-components.mjs` |
| `scripts/check-i18n.mjs` | `scripts/checks/check-i18n.mjs` |
| `scripts/check-pdf.mjs` | `tools/score-production/check-pdf.mjs` |
| `scripts/check-playback-architecture.mjs` | `scripts/checks/check-playback-architecture.mjs` |
| `scripts/i18n-content-exceptions.json` | `scripts/checks/i18n-content-exceptions.json` |
| `scripts/inventory-i18n.mjs` | `scripts/checks/inventory-i18n.mjs` |
| `scripts/musicxml/compare.py` | `tools/score-production/musicxml/compare.py` |
| `scripts/musicxml/convert.py` | `tools/score-production/musicxml/convert.py` |
| `scripts/musicxml/export.py` | `tools/score-production/musicxml/export.py` |
| `scripts/musicxml/fixtures/preplay_warmup.json` | `tools/score-production/musicxml/fixtures/preplay_warmup.json` |
| `scripts/musicxml/fixtures/tom_moving_video.json` | `tools/score-production/musicxml/fixtures/tom_moving_video.json` |
| `scripts/musicxml/loveholic.py` | `tools/score-production/musicxml/loveholic.py` |
| `scripts/musicxml/loveholic_audio.py` | `tools/score-production/musicxml/loveholic_audio.py` |
| `scripts/musicxml/loveholic_ctc_review.py` | `tools/score-production/musicxml/loveholic_ctc_review.py` |
| `scripts/musicxml/loveholic_evidence_server.py` | `tools/score-production/musicxml/loveholic_evidence_server.py` |
| `scripts/musicxml/loveholic_lyric_notes.py` | `tools/score-production/musicxml/loveholic_lyric_notes.py` |
| `scripts/musicxml/loveholic_lyrics_review.py` | `tools/score-production/musicxml/loveholic_lyrics_review.py` |
| `scripts/musicxml/loveholic_package.mjs` | `tools/score-production/musicxml/loveholic_package.mjs` |
| `scripts/musicxml/loveholic_pdf_crop.py` | `tools/score-production/musicxml/loveholic_pdf_crop.py` |
| `scripts/musicxml/loveholic_printed_lyrics.py` | `tools/score-production/musicxml/loveholic_printed_lyrics.py` |
| `scripts/musicxml/loveholic_recording_tempo.py` | `tools/score-production/musicxml/loveholic_recording_tempo.py` |
| `scripts/musicxml/loveholic_standard_lyrics_qa.mjs` | `tools/score-production/musicxml/loveholic_standard_lyrics_qa.mjs` |
| `scripts/musicxml/preplay_warmup.py` | `tools/score-production/musicxml/preplay_warmup.py` |
| `scripts/musicxml/preplay_warmup_evidence_server.py` | `tools/score-production/musicxml/preplay_warmup_evidence_server.py` |
| `scripts/musicxml/preplay_warmup_package.mjs` | `tools/score-production/musicxml/preplay_warmup_package.mjs` |
| `scripts/musicxml/red_sunset.py` | `tools/score-production/musicxml/red_sunset.py` |
| `scripts/musicxml/red_sunset_app.mjs` | `tools/score-production/musicxml/red_sunset_app.mjs` |
| `scripts/musicxml/red_sunset_audio.py` | `tools/score-production/musicxml/red_sunset_audio.py` |
| `scripts/musicxml/red_sunset_package.mjs` | `tools/score-production/musicxml/red_sunset_package.mjs` |
| `scripts/musicxml/red_sunset_receiver.py` | `tools/score-production/musicxml/red_sunset_receiver.py` |
| `scripts/musicxml/red_sunset_verify.py` | `tools/score-production/musicxml/red_sunset_verify.py` |
| `scripts/musicxml/render.py` | `tools/score-production/musicxml/render.py` |
| `scripts/musicxml/render_portland_exercise.py` | `tools/score-production/musicxml/render_portland_exercise.py` |
| `scripts/musicxml/render_socal_warmup.py` | `tools/score-production/musicxml/render_socal_warmup.py` |
| `scripts/musicxml/requirements.txt` | `tools/score-production/musicxml/requirements.txt` |
| `scripts/musicxml/review.py` | `tools/score-production/musicxml/review.py` |
| `scripts/musicxml/song-metadata.json` | `tools/score-production/musicxml/song-metadata.json` |
| `scripts/musicxml/test_verification.py` | `tools/score-production/musicxml/test_verification.py` |
| `scripts/musicxml/tom-moving-versions.json` | `tools/score-production/musicxml/tom-moving-versions.json` |
| `scripts/musicxml/tom_moving_corrected.py` | `tools/score-production/musicxml/tom_moving_corrected.py` |
| `scripts/musicxml/tom_moving_corrected_package.mjs` | `tools/score-production/musicxml/tom_moving_corrected_package.mjs` |
| `scripts/musicxml/tom_moving_corrected_verify.py` | `tools/score-production/musicxml/tom_moving_corrected_verify.py` |
| `scripts/musicxml/tom_moving_evidence_server.py` | `tools/score-production/musicxml/tom_moving_evidence_server.py` |
| `scripts/musicxml/verify.py` | `tools/score-production/musicxml/verify.py` |
| `scripts/musicxml/verify_loveholic.py` | `tools/score-production/musicxml/verify_loveholic.py` |
| `scripts/musicxml/xml_helpers.py` | `tools/score-production/musicxml/xml_helpers.py` |
| `scripts/prepare-sites.mjs` | `scripts/release/prepare-sites.mjs` |
| `scripts/prepare_demo.py` | `tools/score-production/prepare_demo.py` |
| `scripts/prepare_qa_fixture.py` | `tools/score-production/prepare_qa_fixture.py` |
| `scripts/score/build-anchor-corrections.py` | `tools/score-production/corrections/build-anchor-corrections.py` |
| `scripts/third-party.mjs` | `scripts/build/third-party.mjs` |
| `scripts/tune-stretch.mjs` | `tools/audio/tune-stretch.mjs` |
| `scripts/ui-docs.mjs` | `scripts/build/ui-docs.mjs` |
| `tests/analysis-retirement.test.ts` | `tests/integration/analysis-retirement.test.ts` |
| `tests/app-separation.test.ts` | `tests/local-media/app-separation.test.ts` |
| `tests/audio-analysis-cache.test.ts` | `tests/integration/audio-analysis-cache.test.ts` |
| `tests/audio-analysis-import.test.ts` | `tests/integration/audio-analysis-import.test.ts` |
| `tests/audio-bar-one.test.ts` | `tests/integration/audio-bar-one.test.ts` |
| `tests/audio-beat-grid.test.ts` | `tests/unit/audio-beat-grid.test.ts` |
| `tests/audio-beat-tracking.test.ts` | `tests/unit/audio-beat-tracking.test.ts` |
| `tests/audio-beat-worker.test.ts` | `tests/integration/audio-beat-worker.test.ts` |
| `tests/audio-duplicate-dialog.test.ts` | `tests/integration/audio-duplicate-dialog.test.ts` |
| `tests/audio-import-limits.test.ts` | `tests/integration/audio-import-limits.test.ts` |
| `tests/audio-levels.test.ts` | `tests/unit/audio-levels.test.ts` |
| `tests/audio-metadata.test.ts` | `tests/unit/audio-metadata.test.ts` |
| `tests/audio-practice-setup.test.ts` | `tests/integration/audio-practice-setup.test.ts` |
| `tests/audio-practice.test.ts` | `tests/integration/audio-practice.test.ts` |
| `tests/audio-preview-controls.test.ts` | `tests/integration/audio-preview-controls.test.ts` |
| `tests/audio-preview-metronome.test.ts` | `tests/integration/audio-preview-metronome.test.ts` |
| `tests/audio-tempo.test.ts` | `tests/unit/audio-tempo.test.ts` |
| `tests/audio-time-map.test.ts` | `tests/unit/audio-time-map.test.ts` |
| `tests/browser-score.test.ts` | `tests/integration/browser-score.test.ts` |
| `tests/bundled-score.test.ts` | `tests/local-media/bundled-score.test.ts` |
| `tests/canonical-xml.test.ts` | `tests/local-media/canonical-xml.test.ts` |
| `tests/common-components.test.ts` | `tests/integration/common-components.test.ts` |
| `tests/dialog-transition.test.ts` | `tests/integration/dialog-transition.test.ts` |
| `tests/download-score.test.ts` | `tests/integration/download-score.test.ts` |
| `tests/drum-beams.test.ts` | `tests/unit/drum-beams.test.ts` |
| `tests/drum-legend.test.ts` | `tests/local-media/drum-legend.test.ts` |
| `tests/drum-notation.test.ts` | `tests/integration/drum-notation.test.ts` |
| `tests/editor-session.test.ts` | `tests/local-media/editor-session.test.ts` |
| `tests/english-lyrics.test.ts` | `tests/unit/english-lyrics.test.ts` |
| `tests/full-score-labels.test.ts` | `tests/integration/full-score-labels.test.ts` |
| `tests/fullscreen.test.ts` | `tests/integration/fullscreen.test.ts` |
| `tests/help-placement.test.ts` | `tests/unit/help-placement.test.ts` |
| `tests/help.test.ts` | `tests/integration/help.test.ts` |
| `tests/i18n.test.ts` | `tests/integration/i18n.test.ts` |
| `tests/landscape-keyboard.test.ts` | `tests/integration/landscape-keyboard.test.ts` |
| `tests/licenses.test.ts` | `tests/integration/licenses.test.ts` |
| `tests/listening-alignment.test.ts` | `tests/unit/listening-alignment.test.ts` |
| `tests/listening-revision.test.ts` | `tests/unit/listening-revision.test.ts` |
| `tests/load-timing.test.ts` | `tests/unit/load-timing.test.ts` |
| `tests/loop-slots.test.ts` | `tests/local-media/loop-slots.test.ts` |
| `tests/lyric-bar34-review.test.ts` | `tests/local-media/lyric-bar34-review.test.ts` |
| `tests/lyric-feedback-batch.test.ts` | `tests/local-media/lyric-feedback-batch.test.ts` |
| `tests/lyric-feedback-followup.test.ts` | `tests/local-media/lyric-feedback-followup.test.ts` |
| `tests/lyric-feedback-m32.test.ts` | `tests/local-media/lyric-feedback-m32.test.ts` |
| `tests/lyric-feedback-m36.test.ts` | `tests/local-media/lyric-feedback-m36.test.ts` |
| `tests/lyric-feedback-m39.test.ts` | `tests/local-media/lyric-feedback-m39.test.ts` |
| `tests/lyric-feedback-m48.test.ts` | `tests/local-media/lyric-feedback-m48.test.ts` |
| `tests/lyric-grid.test.ts` | `tests/unit/lyric-grid.test.ts` |
| `tests/lyric-layout.test.ts` | `tests/unit/lyric-layout.test.ts` |
| `tests/lyric-reading.test.ts` | `tests/unit/lyric-reading.test.ts` |
| `tests/lyric-revision.test.ts` | `tests/unit/lyric-revision.test.ts` |
| `tests/lyric-tail-shift.test.ts` | `tests/unit/lyric-tail-shift.test.ts` |
| `tests/lyric-timing.test.ts` | `tests/unit/lyric-timing.test.ts` |
| `tests/lyric-upload-entry.test.ts` | `tests/integration/lyric-upload-entry.test.ts` |
| `tests/marker-slots.test.ts` | `tests/local-media/marker-slots.test.ts` |
| `tests/measure-lyrics.test.ts` | `tests/local-media/measure-lyrics.test.ts` |
| `tests/media.test.ts` | `tests/unit/media.test.ts` |
| `tests/model.test.ts` | `tests/local-media/model.test.ts` |
| `tests/musicxml.test.ts` | `tests/local-media/musicxml.test.ts` |
| `tests/note-highlight-preference.test.ts` | `tests/integration/note-highlight-preference.test.ts` |
| `tests/note-highlight.test.ts` | `tests/integration/note-highlight.test.ts` |
| `tests/numeric-drag.test.ts` | `tests/integration/numeric-drag.test.ts` |
| `tests/pdf-lyric-layout.test.ts` | `tests/integration/pdf-lyric-layout.test.ts` |
| `tests/pdf.test.ts` | `tests/integration/pdf.test.ts` |
| `tests/playback-actions.test.ts` | `tests/integration/playback-actions.test.ts` |
| `tests/playback-architecture-guards.test.ts` | `tests/integration/playback-architecture-guards.test.ts` |
| `tests/playback-position.test.ts` | `tests/integration/playback-position.test.ts` |
| `tests/playback-preferences.test.ts` | `tests/integration/playback-preferences.test.ts` |
| `tests/playback-runtime.test.ts` | `tests/integration/playback-runtime.test.ts` |
| `tests/playback-screen.test.ts` | `tests/local-media/playback-screen.test.ts` |
| `tests/playback-ui.test.ts` | `tests/local-media/playback-ui.test.ts` |
| `tests/playback-wake-lock.test.ts` | `tests/integration/playback-wake-lock.test.ts` |
| `tests/player-library-render.test.ts` | `tests/integration/player-library-render.test.ts` |
| `tests/player-recovery-removal.test.ts` | `tests/integration/player-recovery-removal.test.ts` |
| `tests/player-worker.test.ts` | `tests/integration/player-worker.test.ts` |
| `tests/player.test.ts` | `tests/local-media/player.test.ts` |
| `tests/practice-controls.test.ts` | `tests/unit/practice-controls.test.ts` |
| `tests/practice-file-controls.test.ts` | `tests/integration/practice-file-controls.test.ts` |
| `tests/practice-file.test.ts` | `tests/integration/practice-file.test.ts` |
| `tests/practice-library.test.ts` | `tests/integration/practice-library.test.ts` |
| `tests/practice-management.test.ts` | `tests/local-media/practice-management.test.ts` |
| `tests/practice-metadata-upgrade.test.ts` | `tests/local-media/practice-metadata-upgrade.test.ts` |
| `tests/practice-staff-layout.test.ts` | `tests/integration/practice-staff-layout.test.ts` |
| `tests/recent-score.test.ts` | `tests/integration/recent-score.test.ts` |
| `tests/record-serialization.test.ts` | `tests/local-media/record-serialization.test.ts` |
| `tests/recording-tempo.test.ts` | `tests/local-media/recording-tempo.test.ts` |
| `tests/retired-score.test.ts` | `tests/integration/retired-score.test.ts` |
| `tests/ribbon-density.test.ts` | `tests/unit/ribbon-density.test.ts` |
| `tests/ribbon-engraving.test.ts` | `tests/unit/ribbon-engraving.test.ts` |
| `tests/score-gestures.test.ts` | `tests/integration/score-gestures.test.ts` |
| `tests/score-management.test.ts` | `tests/local-media/score-management.test.ts` |
| `tests/score-package.test.ts` | `tests/local-media/score-package.test.ts` |
| `tests/score-pages.test.ts` | `tests/local-media/score-pages.test.ts` |
| `tests/score-preference.test.ts` | `tests/local-media/score-preference.test.ts` |
| `tests/score-reader.test.ts` | `tests/integration/score-reader.test.ts` |
| `tests/score-recording-grid.test.ts` | `tests/local-media/score-recording-grid.test.ts` |
| `tests/score-render-cache.test.ts` | `tests/integration/score-render-cache.test.ts` |
| `tests/score-rest-correction.test.ts` | `tests/local-media/score-rest-correction.test.ts` |
| `tests/score-review.test.ts` | `tests/local-media/score-review.test.ts` |
| `tests/score-system-layout.test.ts` | `tests/integration/score-system-layout.test.ts` |
| `tests/score-view.test.ts` | `tests/local-media/score-view.test.ts` |
| `tests/score-zoom.test.ts` | `tests/unit/score-zoom.test.ts` |
| `tests/section-editor.test.ts` | `tests/integration/section-editor.test.ts` |
| `tests/section-shortcuts.test.ts` | `tests/integration/section-shortcuts.test.ts` |
| `tests/security-headers.test.ts` | `tests/unit/security-headers.test.ts` |
| `tests/shared-playback-components.test.ts` | `tests/local-media/shared-playback-components.test.ts` |
| `tests/shared-score-library.test.ts` | `tests/local-media/shared-score-library.test.ts` |
| `tests/song-scores.test.ts` | `tests/local-media/song-scores.test.ts` |
| `tests/song-title.test.ts` | `tests/integration/song-title.test.ts` |
| `tests/staff-geometry.test.ts` | `tests/unit/staff-geometry.test.ts` |
| `tests/stick-click.test.ts` | `tests/unit/stick-click.test.ts` |
| `tests/storage.test.ts` | `tests/local-media/storage.test.ts` |
| `tests/stretch-warp.test.ts` | `tests/unit/stretch-warp.test.ts` |
| `tests/stretch.test.ts` | `tests/unit/stretch.test.ts` |
| `tests/tom-moving-package-update.test.ts` | `tests/local-media/tom-moving-package-update.test.ts` |
| `tests/top-edge-header.test.ts` | `tests/integration/top-edge-header.test.ts` |
| `tests/ui-standard.test.ts` | `tests/integration/ui-standard.test.ts` |
| `tests/ui.test.ts` | `tests/local-media/ui.test.ts` |
| `tests/wedge-end-offset.test.ts` | `tests/unit/wedge-end-offset.test.ts` |
| `tests/whole-rest-geometry.test.ts` | `tests/unit/whole-rest-geometry.test.ts` |
| `tests/whole-rest-layout.test.ts` | `tests/integration/whole-rest-layout.test.ts` |
| `scripts/source-files.mjs` | `scripts/checks/source-files.mjs` |
| `scripts/check-source-boundaries.mjs` | `scripts/checks/check-source-boundaries.mjs` |

## 역할 분리와 최종 배치

- `apps/editor/editor-view.ts`: 기존 정적 화면 구성.
- `editor-library.ts`: 목록과 최근 항목. 활성 자료·URL 수명은 main 소유.
- `editor-score-controls.ts`: 악보 영역 편집·마디 조작. 편집 세션과 저장 큐는 main에서 주입.
- `editor-lyrics.ts`: 가사 목록·페이지·편집 동작.
- `editor-review.ts`: 검수 렌더러·비동기 세대·캡처 해제.
- `editor-form.ts`: 입력값 수집·미반영 변경 판정·flush. snapshot과 저장 순서는 유지.
- `modules/playback/playback-tempo.ts`: BPM 표시·직접 입력·프리셋·변환의 공통 경로. 화면과 player의 소유자는 playback-screen으로 유지.
- `model/record.ts`, `model/audio-bar-one.ts`: 저장 구현과 분석 구현에서 공통 자료형만 추출. 기존 모듈의 type 재수출 유지.
- `shared/styles/controls.css`와 `modules/library/player-library.css`: 양쪽 앱이 직접 사용하던 CSS를 공통 위치로 배치.
- `shared/ui/marker-icon.ts`: 재생 기능에 의존하지 않는 공통 아이콘.
- 큰 CSS 두 개는 각각 인접한 styles 폴더의 6개 파일로 나누고 원래 순서로 import한다. 조각을 합친 바이트가 이동 전 CSS와 동일함을 SHA-256으로 확인했다.

제작기 진입점의 세션·미디어·저장·화면 전환은 앱 조립 계층에 남긴다. 줄 수를 줄이기 위해 수명과 저장 책임을 별도 전역 객체로 분산하지 않는다.
