# 공통 재생 화면 통합·전수 대조

## 작업 계약
- 목표: 웹앱과 HTML이 같은 재생 화면 및 동작 구현을 호출한다.
- 범위: 재생 화면, 설정·소리·템포·반복 조작과 양쪽 진입점. 기존 편집 기능을 보존한다.
- 완료 조건: 아래 모든 항목의 소유자·호출부·검증을 대조한다. 환경 차이는 명시적인 연결 지점으로 한정한다.
- 제외: 곡을 포함한 HTML 생성·저장, 배포, 커밋, 데이터 삭제.
- 검증: 계약/동작 테스트, 전체 앱 테스트, 타입·번들 검사, 로컬 실행 확인. 미검증은 통과로 표시하지 않는다.

## 변경 전 기능·호출부 목록

| ID | 기능 | 웹앱 호출부 | HTML 호출부 | 통합 목표 |
|---|---|---|---|---|
| P01 | 악보 트랙 생성·마디 폭·위치 | main: widthOf/measureHTML/renderTrack | portable: 같은 함수 | 공통 화면 |
| P02 | SVG/PDF 마디·가사·하이라이트 | main: renderMeasure/lyricMeasureId | portable: renderMeasure/time filter | 공통 화면, 자산만 주입 |
| P03 | 두 줄 렌더링·4마디 창 | main: renderRows/rowWindow | portable: renderRows/rowWindow | 공통 상태 |
| P04 | 프레임·진행선·반복 강조 | main: frame/updateScoreFrame | portable: frame/updateScoreFrame | 공통 상태 |
| P05 | 스크롤·드래그·탭·취소 | main: gestureScrub/scoreGestures | portable: gestureScrub/scoreGestures | 공통 수명주기 |
| P06 | 진행률 드래그·마커창 열기 | main: progress-percent binding | portable: percent binding | 공통 조작 |
| P07 | 키보드·보조기술 조작 | main: installPlaybackKeys/stage click | portable: installPlaybackKeys | 공통 조작 |
| P08 | 재생·정지·상태 아이콘 | main: toggle/engine.onstate | portable: play/onstate | 공통 조작; 비교화면 훅 |
| P09 | 처음·되감기 | main: home/jump | portable: home/rewind | 공통 검증·목적지 |
| P10 | 위치 표시·복사 | main: playbackPosition/copyPosition | portable: 자체 문자열/clipboard | 공통 정밀도·fallback |
| P11 | 템포 UI·검증·변경·초기화 | main: openTempo/rate | portable: rate/tempo dialog | 공통 UI·동작 |
| P12 | 메트로놈·음량 | main: generic onchange | portable: click/volume handlers | 공통 상태 변경 |
| P13 | 악보보기·확대율 | main: generic onchange/syncSettings | portable: view/zoom handlers | 공통 변경, 비교보기 검증 훅 |
| P14 | 반복 프리셋·재중심·해제 | main: quickRepeat/useLoop | portable: preset/setLoop | 공통 상태·동작 |
| P15 | 반복 정밀 범위·적용 | main: loopPoint/fillLoop/loopFromForm | portable: repeatPoint/apply-loop | 공통 폼·검증 |
| P16 | 마커 추가·빠른 목록·표시 | main: addMarker/renderLists | portable: mark/renderLists | 공통 기본 조작 |
| P17 | 설정 메뉴 선택·접근성 | workspace: selectSettingsCategory | portable: settings | 공통 내비게이션 |
| P18 | 재시작·카운트인 선호 | main: savePlaybackPreferences | portable: prefs | 공통 입력, 저장 어댑터 |
| P19 | 전체화면·새로고침 | fullscreen + main preference handler | fullscreen + portable handler | 공통 화면 제어 |
| P20 | 하이라이트 설정 | main: note-highlight | portable: highlight | 공통 입력, 가용성 훅 |
| P21 | 제목·BPM·상태 | main: updateSongHeading/status | portable: title/sync/status | 공통 표시, 오류 전달 훅 |
| P22 | 공통 레이아웃·아이콘·CSS | playback-ui + workspace/style | playback-ui + portable/css | 단일 템플릿·CSS |
| P23 | 숫자 조작·도움말·i18n | numeric-drag/help/ui-standard | 같은 모듈 | 화면에서 설치 |
| P24 | 모달 닫기·배경·포커스 | dialog-ui + workspace | dialog-ui + portable | 공통 닫기 계약 |
| P25 | 리사이즈·숨김·해제 | main: resize/visibility/HMR | portable: observer/pagehide | 공통 화면 수명주기 |
| E01 | 자료 로딩·자산 생성/해제 | main: activate/renderScore | portable: readPlaybackData/preparePages | 환경 어댑터 유지 |
| E02 | SVG/PDF 전환 | main: prefer-pdf | portable: pdf-view | 자산 전환 어댑터 유지 |
| E03 | 저장·백업·내보내기 | main: persist/portableBlob | 없음 | 웹앱 전용 유지 |
| E04 | 편집·악보 비교·라이브러리 | main/editor/review/workspace | 없음 | 웹앱 전용 유지 |
| E05 | 마커·반복 이름/삭제/영구 저장 | main: list management | 일시적 사용만 | 웹앱 확장 슬롯 유지 |
| E06 | 라이선스·빌드 정보 데이터 공급 | workspace: licenseSection | embedded license JSON | 데이터 공급만 차이 |

## 통합 후 전수 대조 (2026-09-23)

두 진입점은 각각 `createPlaybackScreen`을 한 번 호출한다. 아래의 화면 함수는 모두 `src/playback-screen.ts`에 있으며, 마크업은 `src/playback-forms.ts`/`src/playback-ui.ts`, 스타일은 `src/playback-base.css`/`src/playback-ui.css`가 소유한다. 웹앱의 편집·저장 기능은 삭제하거나 숨겨 공통 번들에 넣지 않는다.

검증 기호: T=자동 테스트, S=소스/호출부 대조, R=로컬 Chromium 실행 확인. R은 실제 iPad Safari 검증을 의미하지 않는다.

| ID | 최종 소유자 / 환경 연결 | 대조 근거 |
|---|---|---|
| P01 | renderTrack/widthOf/position | S: 호스트 호출 제거, T: playback-screen/playback-ui |
| P02 | measureHTML/layoutLyrics + playback-measure | S: 공통 가사 매핑, T: shared-playback-components, R: 양쪽 악보 |
| P03 | renderRows 및 rows 상태 | T: 두 호스트 rows 동작, R: 양쪽 두 줄 캡처 |
| P04 | frame/onState/progress | T: playback-screen, R: 웹앱 재생 위치 변화 |
| P05 | gestures/scrub/native 상태·리스너 | T: score-gestures/playback-actions/playback-screen |
| P06 | progress 입력 바인딩 | T: 두 호스트 progress 탐색 |
| P07 | installPlaybackKeys 및 stage 접근성 click | T: playback-actions/playback-ui, S: 단일 설치 |
| P08 | toggle/play/pause/onState | T: 두 호스트 재생·정지, R: 양쪽 실제 실행 |
| P09 | home/rewind 바인딩 및 범위 검증 | T: 두 호스트 rewind, S: 동일 구현 |
| P10 | playbackPosition/copyPosition | T: playback-position 및 두 호스트 copy |
| P11 | openTempo/rate + tempoFieldsHTML | T: 두 호스트 잘못된 값/범위, R: 양쪽 프리셋 |
| P12 | 공통 sound/metronome change + soundFieldsHTML | T: 두 호스트 음량/선호 상태, S: 단일 폼 |
| P13 | view/zoom change + syncDisplay | T: 두 호스트 rows, R: 양쪽 설정·보기 |
| P14 | quickRepeat/useLoop/stopLoop | T: 두 호스트 중심 반복, R: HTML 프리셋 |
| P15 | fillLoop/loopFromForm/bounds + loopFieldsHTML | T: 소수 박 범위 보존, R: HTML 조정창 |
| P16 | mark/renderLists + marker-ui | T: marker-slots 및 두 호스트 marker, R: 양쪽 붉은 마커 |
| P17 | settingsFrameHTML/selectPlaybackSettings | S: 두 호스트 동일 함수, R: 양쪽 설정 분류 |
| P18 | 공통 preference 입력; read/write만 주입 | T: playback-preferences 및 두 호스트 설정 |
| P19 | installScreenControls 및 display adapter | T: fullscreen, S: 공통 설치; iPad 전체화면 재검증 제외 |
| P20 | highlight change 및 syncDisplay | S: 동일 입력 동작; 자산/설정 저장만 주입 |
| P21 | sync/onState + playbackBrandHTML | T: playback-screen, R: 양쪽 제목·BPM·버튼 이름 |
| P22 | 공통 forms/ui/base.css/ui.css | S: 호스트의 중복 폼/CSS 제거, R: 양쪽 캡처 |
| P23 | 공통 installNumericInputs/installHelp/installUIStandard | T: numeric/ui-standard 관련 기존 테스트, S: 단일 설치 |
| P24 | 공통 dialogHeader/closeDialogOnBackdrop 및 close 리스너 | S: 중복 backdrop 설치 방지, R: tempo/settings/loop 닫기 |
| P25 | 공통 RAF/ResizeObserver/visibility/dispose | T: dispose 이후 무반응, S: HMR/pagehide 어댑터 |
| E01 | main의 저장 자료 로딩 / portable의 embedded decode·자산 준비 | S: 실제 데이터 공급 차이; R: 양쪽 110마디 |
| E02 | main prefer-pdf / portable pdf-view: 자산 준비·교체만 | S: portable 강제 pause 제거, R: PDF/SVG 전환·반복 보존; 재생 중 연속성 실측은 아래 제한 |
| E03 | main의 DB·백업·HTML 내보내기 | S: 기존 핸들러 보존, T: playback-export; 실제 내보내기 실행 안 함 |
| E04 | main의 editor/review/library 및 compare hook | S: authoring 유지, T: score-management 등 기존 테스트 |
| E05 | listsChanged/loopDraft/markerName/initialLastLoop | S: 웹 이름/삭제·저장 유지, HTML 기존 반복 범위 초기값 보존 |
| E06 | appInfoHTML 공통 표현 + 각 라이선스 데이터 공급 | S: 번들 포함/제외 검사, R: 설정 메뉴 존재 |

## 의도하지 않은 차이 수정

- HTML의 위치 복사도 동일한 박 정밀도·문맥·클립보드 fallback을 사용한다.
- 되감기 입력, 템포 범위/잘못된 값 복구, 템포 프리셋, 키보드/보조기술 조작을 단일 소유자로 옮겼다.
- HTML 형식 전환은 새 자산을 준비한 뒤 교체한다. 임의의 pause를 제거하고 기존 재생기·반복·위치를 유지한다.
- 웹에서만 가능한 비교보기·편집·영구 저장과 HTML의 메모리 선호값/라이선스 공급은 명시적 어댑터로 남긴다.

## 증거·재발 방지와 검증 한계

- `scripts/check-playback-architecture.mjs`: 두 호스트의 단일 mount, 24개 핵심 연산의 공통 소유권, 31개 목록 항목, 공통 모듈의 호스트 의존 금지를 검사한다. 실제 호출부 목록은 ignored `docs/experiments/playback-call-sites.json`에 기록한다. 이름을 바꾼 임의 중복까지 자동 증명하는 검사는 아니므로 이 표의 수동 대조를 함께 유지한다.
- `scripts/check-playback-build.mjs`: 같은 화면 모듈의 HTML 번들 포함과 authoring/storage 모듈 제외를 검사한다. `npm run build`에 두 검사를 연결했다.
- `tests/playback-screen.test.ts`: 웹/HTML ID 연결을 각각 사용해 동일한 4개 계약 시나리오를 실행한다.
- 캡처: ignored `docs/experiments/screen-web-rows.png`, `screen-portable-rows.png`. HTML 화면 document 폭과 scrollWidth 모두 1130px로 확인했다.
- HTML은 기존 데이터와 최신 빈 빌드 템플릿을 HTTP 응답 메모리에서만 결합했다. 곡 포함 HTML을 생성·저장하지 않았다.
- Safari가 hidden 상태여서 시각 QA는 Chromium 대체 경로로 수행했다. 실제 iPad, 오디오 출력 품질, OS 전체화면/클립보드 권한의 실기기 검증은 수행하지 않았다.
- 형식 전환 시 반복 범위 보존과 화면 교체는 확인했으나, 브라우저 자동화 조작 사이 `visibilitychange: hidden → visible`가 반복 발생하고 공통 백그라운드 정지 처리가 실행된 것을 이벤트 기록으로 확인했다. 따라서 전환 전후 재생 연속성 실측은 통과로 기록하지 않는다. 소스에서 형식 전환 자체의 pause가 제거된 것과 실기기 연속 재생 검증은 구분한다.


최종 자동 검증: 63개 파일/279개 테스트 통과. 타입·i18n·빌드·호출부/번들 검사 통과. HTML 런타임 43개 모듈/282052bytes이며 authoring/storage/source renderer 제외를 확인했다. 기존 대용량 청크 경고는 남아 있다.

## 2026-10-02 추가 통합

E01/E02의 이미지 준비 본체는 이제 `playback-assets.ts`가 소유한다. 호스트에는 데이터 공급·검증·저장만 남는다. P17/P21/P22/P24의 조립은 `playback-shell.ts`, 아이콘 갱신은 `icon-button.ts`로 연결했다. 이번 Safari 실행 결과와 6항목 전체 호출부 재검수/예외는 `COMMON-COMPONENTS-FINAL-PASS.md`를 따른다. 위 과거 Chromium/279개 테스트 기록은 당시 기록이며 최신 결과는64파일286개 테스트 및 Safari 검증이다.
