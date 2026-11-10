# 0.11.1 — OSMD 전체 악보와 가사 성부 · 2026-11-11

이 문서는 이번 릴리스의 실행 기록이다. 현행 출력 계약은 [조판 Rule](../../reference/score/rendering.md), 저장 계약은 [MusicXML Rule](../../reference/score/musicxml.md)을 따른다.

## 범위와 버전

- 두 앱 0.11.0→0.11.1 patch. 기존 SVG 전체 보기의 표시·저장 호환성을 개선하며 새 독립 사용자 흐름을 추가하지 않는다.
- 가사와 각 줄 첫 마디 번호를 OSMD의 SVG 출력으로 표시한다. 1번·섹션 있는 줄도 번호를 포함하며 내부 SVG 식별자·HTML 번호 overlay를 사용하지 않는다.
- 원본 줄 구성을 유지하는 연속 SVG, 표기 경계 사이 두 칸 여백, 중복 없는 제목/부제, 굵은 `♩ = BPM`·`노래 - 가수`를 공통 조판으로 제공한다.
- 제작자가 전환한 같은 드럼 보표의 v2 가사 성부 정본 6곡과 시작 전 손 풀기 제목 교정을 수록한다. 구형 v1 파일 읽기·새 형식 저장, 독립 가사 리듬·마디 문구와 제작기 쉼표 교정의 소유 성부 구분을 유지한다.
- 공개 배포는 드럼연습실만, 악보제작기는 PC 로컬 전용이다. 릴리스 중 원본·수록 패키지 6개의 바이트는 변경하지 않았다.

## 로컬 검증과 보완

- Node22.22.2·pnpm12.18.0, `pnpm run verify` 통과. lint·477파일 서식·앱/도구/hosting 타입·의존/공통 구조·문서/링크/앵커, 131파일 816테스트와 두 앱 빌드·player 경계 검사를 포함한다. 스킵으로 통과시키지 않았다.
- 첫 전체 검사에서 발견한 오래된 패키지 해시와 v1 회귀 입력을 현행 수록본·보존된 실제 v1 원본으로 정리했다. v1 호환 검사를 삭제하지 않았고, 전용 fixture를 로컬 필수 자산에 포함했다.
- 실제 OSMD 출력에서 바람과 언덕의 발라드 96마디가 자동으로 새 줄에 내려가는 것을 발견했다. XML에 없는 줄바꿈이 생긴 경우에만 native 최소 폭·시작/끝 지시 폭·여백을 합산해 다시 조판한다. 이 곡은 1643px·28줄, 다른 5곡은 1500px를 유지한다. 전체 보기 캐시 v10을 사용한다.
- 수록 6곡 전체를 실제 브라우저 엔진으로 생성해 원본의 151개 줄 구성, 각 줄 번호 하나·첫 번호1·섹션 있는 줄의 번호55개, 내부 ID 미노출을 확인했다. 줄 사이 여백은 native 오선 간격의 2.0~2.097배였다. 가사·마디 문구 저장/재읽기와 반복 저장도 일치했다.
- 표시제목/원제가 같은 경우·다른 경우·표시제목 없음·공백/NFC 비교 4경우를 공통 함수로 확인했다. 메타정보의 부제목 크기/Bold와 가사의 공통 글자 크기도 native 라벨에서 확인했다.
- Safari MCP는 `Transport closed`로 연결하지 못해 ego-browser Chromium을 사용했다. 별도 접두사의 시험 IndexedDB와 메모리 local/sessionStorage로 기존 사용자 DB를 보존했다.
- PC 1366×900에서 두 앱의 SVG 전체 보기·가사·번호·제목·부제·메타정보를 캡처해 확인했다. 제작기에서 Real Paradis를 열고 시험본 제목 변경→저장→페이지 재진입→다시 열기로 저장 결과를 확인한 뒤 원래 제목으로 저장했다. 가사 515개와 오류 없는 전체 보기를 확인했다.
- 드럼연습실에서 1줄/2줄 전환, 실제 재생의 5마디 통과·후속 마디 진행, AudioContext running, BPM94→47 변환과 94 복귀를 확인했다. 소리의 사람 청취나 실제 iOS/iPadOS 검증으로 확대하지 않는다.
- PR 최종 자체 검토에서 제작기의 가사를 모두 지운 경우에만 저장 전 전체 보기가 이전 가사를 사용하던 조건문을 제거했다. 항상 현재 편집 상태의 조판용 사본을 만든다. 변경 파일 lint·서식·앱 타입과 관련 3파일 14테스트를 통과했고, 실제 Real Paradis의 가사 515개→0개 사본을 native SVG로 출력해 원본 보존과 가사 제거를 확인했다. 전체 검사 이후의 이 집중 검사 근거는 `empty-lyrics-focused.log`, `empty-lyrics-output.json`이다.

## 근거와 한계

- 최종 제품 소스 빌드: `23f80934024d`. 증거 폴더: `.tmp/release-0.11.1/`.
- 전체 검사: `verify-release.log`. 실제 6곡 출력: `native-output-final.json`과 `native-output-qa.mjs`. 화면: `editor-full-score.png`, `player-full-score-final.png`. 재생: `playback.json`. 패키지 보존: `assets-before.json`.
- 기존 Vite 큰 청크 경고·Node SQLite experimental 경고는 유지한다. [보류 근거와 재검토 기준](runtime-loading-cost-20261109.md)을 따른다.
- iOS/iPadOS 실기기·시뮬레이터·Safari 응답형 검수는 수행하지 않았다. 공개 파일 확인과 실제 로컬 UI 검증을 구분한다.
- Sites 빌드 도구를 Node22에서 불러올 때 `punycode` 폐기 예정 경고도 발생했다. 도구 import에서 재현했으며 Worker 빌드·자산 일치·공개 확인은 통과했다. 런타임 오류로 취급하지 않으며 별도 의존성 유지보수 대상으로 남긴다. 근거: `sites-node-warning.log`.

## Git·발행·공개 확인

- 구현 `da0f670b037a8a712b4b23c21693a9877712e513`, 가사 전체 삭제 보완을 포함한 최종 head `67938d8992761b720bac03487e354a247172d42e`, [PR #46](https://github.com/Raphael-KR/drum-practice/pull/46). Codex 자체 검토이며 독립 검토와 구분한다. 최신 head의 [PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42862291324)·push CI를 확인한 뒤 merge했다.
- 제품 main `4914d9399746d451f988d9de28f889cfb0505356`의 [CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42862696049) 통과. 최종 PR head와 main의 Git tree가 같고 6개 수록 패키지 SHA가 검증 입력과 같아 로컬 회귀 결과를 재사용했다. main에서 두 앱을 다시 빌드하고 player만 준비했다. `main-inputs.json`, `main-ci.json`, `main-build.log`에 근거를 남긴다.
- Sites 소스 `daf4ac3a134294316b716f8adfdf182101eec5bf`, 저장 버전102 (`appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_4da2a2e3a5088191a415990373fb8658`). 배포 `appgdep_6af3515a30b48191911756746c328ee3`: **succeeded**, **2026-11-11 02:16:29 KST** / `2026-11-10T17:16:29.051701+00:00`.
- [공개 드럼연습실](https://drum-practice-studio.dgkma.chatgpt.site/)의 기존 공개 범위를 유지했다. `dist/player`·Sites 사본·Worker 결과의 48개 파일 SHA를 대조했고, 공개 읽기 52항목(HTML/보안 헤더 3경로·46정적 파일/수록 6곡·폐기 API 3경로 404)을 통과했다. `parity.json`, `smoke.json`, `publication.json` 참조. 공개 사이트에서 실제 재생·저장 쓰기를 수행했다는 뜻은 아니다.
- 아카이브 `local-archives/releases/drum-practice-0.11.1-sites.tar.gz` SHA256 `61322247bd1a9fb9aa2e9e9bcca11edf2247c89c8a0f2a60fdd0546f065d258b`. Sites tar content hash `sha256:8694ff1ddab1778c9b648e516e216ba3715bcc12a957d74082a3f6aa5fb48820`와 구분한다.
- 검수용 접두사 `release-0.11.1-20261111:`의 임시 DB 3개만 정리하고 기존 사용자 DB 3개의 이름/버전 보존을 확인했다(`browser-cleanup.json`). 검수용 ego 작업 공간도 종료했다. 결과 문서는 별도 PR로 반영하며 제품 버전·발행을 반복하지 않는다.
