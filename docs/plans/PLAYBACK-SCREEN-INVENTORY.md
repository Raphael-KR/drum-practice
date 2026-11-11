# 공통 재생 화면 소유권

상태: 화면 분리 설계 참고표. 2026-11-11부터 고정 ID 31개 존재 검사는 제거했으며 실제 호출·의존 경계는 공통 정적 검사가 확인한다. 기존 표와 참조 경로는 보존한다.

- 목표: 악보제작기와 드럼연습실이 하나의 재생 화면·조작 구현을 사용한다.
- 범위: main.ts와 player-app.ts → playback-runtime.ts, 공통 재생 UI 및 자산 처리.
- 완료 조건: 두 호스트가 createPlaybackScreen을 각각 한 번 호출하고 아래 기능 소유권을 유지한다.
- 제외: 독립 HTML 내보내기는 제공하지 않는다. 제작 데이터와 .drumscore 저장은 유지한다.
- 검증: playback-screen·공통 UI·저장 왕복 테스트, 타입 검사, 앱 빌드와 경계 검사. 실행 결과는 history.md에 기록한다.

## 현재 호출 구조

`main.ts`와 `playback-runtime.ts`가 공통 `playback-screen.ts`를 호출한다. 드럼연습실 진입점 `player-app.ts`는 `mountPlaybackRuntime`을 호출한다. `webPlaybackBindings`는 제작기, `playerPlaybackBindings`는 연습실의 컨트롤 ID를 연결한다.

화면 마크업은 playback-forms/playback-ui, 설정 카드 선택·스크롤은 playback-settings-layout, 설정 동기화는 playback-settings, 화면 조립은 playback-shell, 자산 수명주기는 playback-assets가 소유한다. 반복 구간 콘텐츠는 호스트가 기존 `loopExtra` 슬롯으로 전달한다. 스타일은 playback-base.css/playback-ui.css와 연습실 전용 player.css를 사용한다. 세부 책임은 [구조 정본의 공통 모듈 책임](../reference/engineering/architecture.md#project-structure--의존-규칙)을 따른다.

`playback-screen`이 `playback-track`·`playback-display`·`playback-navigation`을 각각 한 번 생성한다. track은 배치 상태, display는 표시 동기화, navigation은 입력 연결을 담당하며 선택·재생·스크럽·반복 상태와 이벤트 수명은 screen에 남긴다. navigation의 제스처 등록과 나머지 입력 등록 사이에 screen이 반복 구간을 연결하며, 등록·해제 순서를 유지한다. 두 앱은 내부 모듈을 별도 mount하지 않는다.

| ID | 소유자 / 환경 연결 |
|---|---|
| P01 | playback-screen의 renderTrack → playback-track의 widthOf/position |
| P02 | playback-track의 measureHTML + playback-measure |
| P03 | playback-track의 renderRows 및 rows 배치 상태; 무효화는 playback-screen |
| P04 | frame/onState/progress |
| P05 | playback-screen의 scrub/native 상태; playback-navigation의 제스처·휠·스크롤 연결 |
| P06 | playback-navigation의 progress 숫자 드래그; playback-screen의 공통 컨트롤 입력 |
| P07 | playback-navigation의 installPlaybackKeys 및 stage 접근성 click |
| P08 | toggle/play/pause/onState |
| P09 | home/rewind 바인딩 및 범위 검증 |
| P10 | playbackPosition/copyPosition |
| P11 | openTempo/rate + tempoFieldsHTML |
| P12 | 공통 sound/metronome change + soundFieldsHTML |
| P13 | playback-settings의 view/zoom change + playback-display의 syncDisplay |
| P14 | quickRepeat/useLoop/stopLoop |
| P15 | 구간 선택·저장: `mountLoopSlots`(loop-slots); 적용·검증: `useLoop`(playback-screen) → `changePlaybackLoop`(playback-actions); 콘텐츠: playback-shell의 `loopExtra` 슬롯 |
| P16 | mark/renderLists + marker-ui |
| P17 | settingsFrameHTML/selectPlaybackSettings |
| P18 | 공통 preference 입력; read/write만 주입 |
| P19 | installScreenControls 및 display adapter |
| P20 | playback-settings의 highlight change + playback-display의 syncDisplay |
| P21 | playback-display의 sync / playback-screen의 onState + playbackBrandHTML |
| P22 | 공통 forms/ui/base.css/ui.css |
| P23 | 공통 installNumericInputs/installHelp/installUIStandard |
| P24 | 공통 dialogHeader/closeDialogOnBackdrop 및 close 리스너 |
| P25 | playback-screen의 RAF/ResizeObserver/dispose; playback-navigation의 visibility 연결과 공통 해제 목록 사용 |
| E01 | main → editor-record-preparation: 제작 기록 검증·준비; 활성 기록/저장 큐/자산 교체는 main / player-app → playback-runtime: 연습 자료·자산 공급 |
| E02 | main prefer-pdf / playback-runtime pdf-view: 자산 준비·교체 |
| E03 | main이 editor-import·editor-score-files·editor-management-actions·editor-file-transfer·editor-original-view·editor-sections를 조립; DB·백업/복원·내보내기·drumscore 저장 계약 유지 |
| E04 | main의 editor/review/library 및 compare hook |
| E05 | listsChanged/loopDraft/markerName/initialLastLoop와 각 앱 저장소 |
| E06 | appInfoHTML 공통 표현과 앱 라이선스 데이터 공급 |

## 재발 방지

- `scripts/checks/check-playback-architecture.mjs`: 각 호스트의 단일 mount, screen 내부 track/display/navigation의 단일 생성, 핵심 재생 연산의 담당 모듈과 직접 저장소 의존 금지를 검사한다.
- `scripts/checks/check-source-boundaries.mjs`: 공통 모듈의 앱 의존 금지와 app/model/shared 경계를 검사한다.
- `scripts/checks/check-common-components.mjs`: 공통 폼·바이너리 인코더·아이콘 소유권을 검사한다.
- `scripts/checks/check-app-boundaries.mjs`: 별도 editor/player 빌드에서 제작 코드 유입 여부를 검사한다.
- `tests/local-media/playback-screen.test.ts`: web/player 연결로 재생·탐색·구간·설정 동작을 검사한다.
- `record-serialization.ts`는 제작 ZIP 백업에 필요한 데이터 직렬화만 담당한다. HTML 셸·실행기·내장 Worker 생성은 지원하지 않는다.

자동 검사는 실기기 음질·터치·OS 권한 검증을 대신하지 않는다.
