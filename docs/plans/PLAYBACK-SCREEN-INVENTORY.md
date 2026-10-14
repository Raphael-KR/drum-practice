# 공통 재생 화면 소유권

- 목표: 악보제작기와 드럼연습실이 하나의 재생 화면·조작 구현을 사용한다.
- 범위: main.ts와 player-app.ts → playback-runtime.ts, 공통 재생 UI 및 자산 처리.
- 완료 조건: 두 호스트가 createPlaybackScreen을 각각 한 번 호출하고 아래 기능 소유권을 유지한다.
- 제외: 독립 HTML 내보내기는 2026-10-13에 폐기했다. 제작 데이터와 .drumscore 저장은 유지한다.
- 검증: playback-screen·공통 UI·저장 왕복 테스트, 타입 검사, 앱 빌드와 경계 검사. 실행 결과는 history.md에 기록한다.

## 현재 호출 구조

`main.ts`와 `playback-runtime.ts`가 공통 `playback-screen.ts`를 호출한다. 드럼연습실 진입점 `player-app.ts`는 `mountPlaybackRuntime`을 호출한다. `webPlaybackBindings`는 제작기, `playerPlaybackBindings`는 연습실의 컨트롤 ID를 연결한다.

화면 마크업은 playback-forms/playback-ui, 화면 조립은 playback-shell, 자산 수명주기는 playback-assets가 소유한다. 스타일은 playback-base.css/playback-ui.css와 연습실 전용 player.css를 사용한다.

| ID | 소유자 / 환경 연결 |
|---|---|
| P01 | renderTrack/widthOf/position |
| P02 | measureHTML/layoutLyrics + playback-measure |
| P03 | renderRows 및 rows 상태 |
| P04 | frame/onState/progress |
| P05 | gestures/scrub/native 상태·리스너 |
| P06 | progress 입력 바인딩 |
| P07 | installPlaybackKeys 및 stage 접근성 click |
| P08 | toggle/play/pause/onState |
| P09 | home/rewind 바인딩 및 범위 검증 |
| P10 | playbackPosition/copyPosition |
| P11 | openTempo/rate + tempoFieldsHTML |
| P12 | 공통 sound/metronome change + soundFieldsHTML |
| P13 | view/zoom change + syncDisplay |
| P14 | quickRepeat/useLoop/stopLoop |
| P15 | fillLoop/loopFromForm/bounds + loopFieldsHTML |
| P16 | mark/renderLists + marker-ui |
| P17 | settingsFrameHTML/selectPlaybackSettings |
| P18 | 공통 preference 입력; read/write만 주입 |
| P19 | installScreenControls 및 display adapter |
| P20 | highlight change 및 syncDisplay |
| P21 | sync/onState + playbackBrandHTML |
| P22 | 공통 forms/ui/base.css/ui.css |
| P23 | 공통 installNumericInputs/installHelp/installUIStandard |
| P24 | 공통 dialogHeader/closeDialogOnBackdrop 및 close 리스너 |
| P25 | 공통 RAF/ResizeObserver/visibility/dispose |
| E01 | main: 제작 저장 자료 로딩 / player-app → playback-runtime: 연습 자료·자산 공급 |
| E02 | main prefer-pdf / playback-runtime pdf-view: 자산 준비·교체 |
| E03 | main의 DB·제작 ZIP 백업·MusicXML/PDF/음원 내보내기 및 drumscore 저장 |
| E04 | main의 editor/review/library 및 compare hook |
| E05 | listsChanged/loopDraft/markerName/initialLastLoop와 각 앱 저장소 |
| E06 | appInfoHTML 공통 표현과 앱 라이선스 데이터 공급 |

## 재발 방지

- `scripts/check-playback-architecture.mjs`: 각 호스트의 단일 mount와 핵심 재생 연산의 공통 소유권, 목록 항목, 호스트 의존 금지를 검사한다.
- `scripts/check-common-components.mjs`: 공통 폼·바이너리 인코더·아이콘 소유권을 검사한다.
- `scripts/check-app-boundaries.mjs`: 별도 editor/player 빌드에서 제작 코드 유입 여부를 검사한다.
- `tests/playback-screen.test.ts`: web/player 연결로 재생·탐색·구간·설정 동작을 검사한다.
- `record-serialization.ts`는 제작 ZIP 백업에 필요한 데이터 직렬화만 담당한다. HTML 셸·실행기·내장 Worker 생성은 지원하지 않는다.

자동 검사는 실기기 음질·터치·OS 권한 검증을 대신하지 않는다.
