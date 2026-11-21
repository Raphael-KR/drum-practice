# 최종 가사 묶음 정본 전환 — 2026-11-13

## 범위와 결과

[승인된 제작 계획](../../plans/canonical-lyric-groups-20261113.md)에 따라 활성 6곡을 v3로 전환했다. 정본·작업 파일의 정적 구조와 보존 검사는 통과했다. GUI·렌더링·회귀·빌드·커밋·푸시·발행은 실행하지 않았다. 앱 패키지·저장 데이터·캐시는 웹앱 개발 담당 범위다.

- 시작 Git: `main`, `0d74c288ddeb4c274ddef14cdbdd2360a3e28b18`. 기존 개발 변경을 보존했다.
- 입력: `data/production/canonical-corrections-20261112/<id>/score.musicxml`. 6곡 모두 시작 시 수록 `score/source`와 바이트가 같았다.
- 출력·작업 파일: `data/production/lyric-groups-20261113/<id>/`.
- 인벤토리: 기존 전수 조사와 현재 6곡 제작 기록·수록본을 대조했다. 이전 판본·보존 사본은 활성 정본으로 중복 집계하지 않았다. 사용자 브라우저 DB와 프로젝트 밖 파일은 조사하지 않았다.

| 곡 ID | 마디 | 원음절 → 최종 묶음 | 실제 병합 묶음 | 시간 없는 마디 문구 |
| --- | ---: | ---: | ---: | ---: |
| `ioi-suddenly` | 93 | 301 → 301 | 0 | 7 |
| `loveholic` | 123 | 269 → 269 | 0 | 0 |
| `real-paradis` | 110 | 515 → 480 | 31 | 0 |
| `red-sunset` | 137 | 0 → 0 | 0 | 0 |
| `tom-moving` | 28 | 0 → 0 | 0 | 0 |
| `preplay-warmup` | 96 | 0 → 0 | 0 | 0 |

총 587마디·원음절 1,085개를 1,050개 최종 항목으로 기록했다. Real Paradis의 병합 31묶음은 최대 3음절이며 첫 ID·시작점과 가장 늦은 끝을 사용한다. 다른 곡은 원래 글자 영역이 겹치지 않아 임의 병합하지 않았다. 이 결과를 화면 충돌 0건이나 원본 판독 정확도 향상으로 해석하지 않는다.

## 재현 입력과 공통 코드

- 곡 목록·경로: `tools/score-production/musicxml/profiles/lyric-groups-20261113.json`.
- 보존·정적 대조: `lyric_groups.py prepare|verify`, `common/lyric_onsets.py`, `common/musicxml.py`.
- 실제 제작 변환: `group_canonical_lyrics.mjs`. 앱의 `lyric-groups.ts`, `time-spacing.ts`, `writeLyricVoices`를 재사용한다.
- Node `v26.13.0`, `@napi-rs/canvas` `1.1.0`, 번들 Python `3.12.14`·`lxml` `6.1.1`을 사용했다. 기존 `esbuild`는 가사 writer의 확장자 없는 TS import를 Node에서 읽기 위한 메모리 변환에만 썼다. 앱 빌드·조판은 실행하지 않았다.
- Pretendard Regular WOFF2 등록이 성공했다. 13pt, 공통 사분음표당 64 SVG 단위와 시작 여백을 사용했다. 폰트 SHA256: `fad853f7f47c6c8b103171e7193fa095708cdcd70850a71d93aa5379e8a61d63`.
- 이후 공통 투영을 `common/lyric-group-data.mjs`로 분리해 기존 5개 제작 어댑터에도 연결했다. `prepareProductionCanonical`은 원본 Song/XML·대응표를 `lyricWork`로 반환하고 기존 수신기가 패키지 밖 `package-audit.json`에 저장한다. 이 브라우저 제작 경로는 이번에 정적 검사만 했다.
- 패키지 기대값은 앱의 `packageRecord`를 재사용한다. source-only package v2의 캐시 제거를 제작 도구에 복제하지 않는다. 기존 원본 Song 비교는 공통 검사로 통합했다.

실행 순서는 [가사 제작 절차](../../how-to/correct-lyrics.md#final-lyric-groups)에 있다. 현재 결과의 실제 측정·생산 코드와 글꼴 해시는 각 `groups.json`에 결합돼 있다. 후속 코드 정리 자체를 출력 재생성·왕복 시험의 통과로 표시하지 않는다.

## 보존과 정적 검사

각 곡 폴더:

- `before.musicxml`, `before-song.json`: 이전 바이트 사본.
- `work.json`: 원음절 ID·문자·분수 시작/음가·확인 상태·기존 manifest·제거 필드.
- `groups.json`: 원래 글자 폭·연속 X·음악적 위치·묶음과 `sourceIds` 대응, 코드/폰트/결과 해시.
- `score.musicxml`: 가로 좌측 정렬을 기록한 v3 정본.
- `static-verification.json`: 후보 해시에 결합된 아래 대조 결과.

6곡 모두 MusicXML 4.0 XSD, 64분음표 그리드·시작점 중복, 묶음의 첫 시작·끝·문구·확인 상태, 원음절 ID의 순서/완전 대응 검사를 통과했다. 소유 가사 블록·manifest 버전/가사 항목·제거 대상 근거 필드를 제외한 전체 XML 구조는 이전과 같다. 다른 manifest 값도 같다. 따라서 드럼 음표·쉼표·주법·기호·리듬·메타정보·음원 연결은 변경되지 않았다.

제작 도구 8개 JS의 ESLint·Prettier, 3개 Python의 AST·Black, 곡 설정 JSON 구문과 제작 스킬 `quick_validate`를 확인했다. 문서 검사는 176개 Markdown·4,857개 로컬 링크·3,499개 앵커를 통과했다. 퇴역 주소의 과거 링크 119개는 기존 기록으로 구분되며 외부 URL·절대경로는 이 검사 대상이 아니다. 전체 앱 정적 검사는 개발 담당이 맡는다.

원음절의 `confirmed`를 모두 보존하고, 묶음은 구성 항목이 모두 `true`일 때만 `true`로 했다. 기존 미확정·추정 근거를 확인 완료로 승격하지 않았다. 갑자기의 시간 없는 마디 문구 7개도 같은 문구·귀속으로 유지했다.

원래 제작 패키지에 있는 음원 SHA256은 각 v3의 `audioSHA256`과 같다. 원래 패키지·대체 PDF 해시도 `handoff-index.json`에 기록했다. 미디어를 다시 인코딩하거나 교체하지 않았다.

## 정본 SHA256

| ID | SHA256 |
| --- | --- |
| `ioi-suddenly` | `eb156be249a7e196c0f566ed3c18b471c8f04699b9a17601eaca4d58eef6b8de` |
| `loveholic` | `d3396d46a363b657b2ca2e6cd5302695c4d70da0e739acc056ca28d5efd9f57e` |
| `real-paradis` | `2a6c0092a28169700d58ebd48553a20c48f0be4fb652b11b4df1fbe85f082d1e` |
| `red-sunset` | `abcd533aa36bf9d270d662ee506b5a8d7626cce8657844a5100b06974d337a5a` |
| `tom-moving` | `7385b414cecd1f35445081e907c1f9f6de646d855cf20fea80c28fd0717f6c66` |
| `preplay-warmup` | `17bf9ee1522f2dfac300cad7d7ff77da830ac157cee945979605b81b594ff3f9` |

## 문제 해결과 다음 적용

구판 Rule은 원음절과 전체 원문을 정본에 보존하고 읽기 호환을 유지하도록 돼 있었다. 새 사용자 결정과 충돌하므로 [정본 계약](../../reference/score/musicxml.md)·[제작 기준](../../reference/score/production.md)·절차·스킬을 [ADR-0033](../../decisions/0033-final-lyric-groups.md)에 따라 갱신했다. 기존 ADR과 원문 자료는 삭제하지 않았다.

생산 당시 전체 원문은 Loveholic의 `drum-practice:lyric-text`, 원음절 근거는 Loveholic·갑자기의 `printed-lyric-*` 필드에 있었다. 이 필드를 작업 자료로 옮겼다. 원래 전체 가사 필드가 없는 곡의 가사 순서를 새 원문 전사라고 꾸미지 않았다.

신규 제작도 원음절 판독 → 작업 자료 보존 → 공통 묶음 → v3 정본의 순서를 사용한다. 묶음 경계를 곡마다 별도 계산하거나, 이미 완성한 묶음을 원음절처럼 다시 병합하지 않는다. 실제 겹침·줄 경계 문제는 후속 표시 검수에서 확인하며 사전 폭 제한을 추가하지 않는다.

## 인계와 남은 검증

정본 경로와 정적 검사 결과를 기존 웹앱 개발 채팅(`local`, `01a0afc9-ca21-7371-9390-06eb07c017e9`)에 전달했고 수신자가 6곡 생성 경로를 확인했다. 최종 인계 본문·해시는 출력 루트의 인계 파일에 남긴다. 앱 반영 완료는 개발 담당의 실제 패키지/경로 대조와 구분한다.

최종 전송 접수: 2026-11-13 02:40:42 KST(2026-11-12 17:40:42 UTC). `handoff/handoff.md`의 실제 본문과 `handoff/delivery.json`의 도구 접수 근거를 보존했다. 본문 SHA256은 `598fa7c5e73cb03c04ed994d1e10165a440815dc7fe3573c08602e2acb599c5b`이며 전달 직후 6정본의 해시가 인계 목록과 같음을 다시 확인했다. 수신자는 앱 수록본의 해시 일치를 보고했고 전체 정적 검사를 진행 중이다.

제작자도 수록 6개 ZIP을 읽기 전용으로 대조했다. 모두 package v2이며 정본·음원 해시가 인계/보존 근거와 같고 MusicXML 캐시 `pages`·`regions`는 0개다. `app-package-static-readback.json`에 기록했다. 이 확인은 실제 앱 실행·조판·저장 검사가 아니다.

표시·연주·청취, GUI 저장/재열기, 회귀 실행, 새 브라우저 제작/패키지 API 실행은 이번 승인 범위에서 제외했다. 정적 통과를 해당 실행의 통과로 표시하지 않는다.

## 후속: 소스 전용 패키지의 검수 도구 연결

개발 담당의 후속 요청으로 패키지 v2를 읽은 뒤 페이지·영역을 직접 사용하는 경로를 정적으로 확인했다. 이번 후속 작업도 정적 검사만 수행했다. 이미 완료된 0.11.5 릴리스의 회귀검사 승인을 이번 작업에 재사용하지 않았다.

| 대상 | 원인과 수정 |
| --- | --- |
| `common/review.mjs`·`review.d.mts` | `mountScoreReview`가 빈 MusicXML 영역으로 바로 계획을 계산했다. 주 악보·대체 악보에서 페이지 또는 영역이 비어 있으면 앱의 `prepareBrowserScore`를 먼저 호출한다. 이미 준비한 결과와 PDF 자료는 재사용한다. 순수 `planScoreReview`는 준비된 기하정보를 받는 계약으로 유지한다. |
| `ioi_suddenly_package.mjs` | 재읽은 소스 전용 패키지를 검수용 전역 값에 반환했다. 이미 조판한 `record`를 반환하고 중복 재읽기를 제거했다. 패키지 자체의 재읽기·대조는 `createVerifiedPackage`가 담당한다. |
| `red_sunset_app.mjs` | 렌더링한 Song과 캐시가 제거된 패키지 Song을 그대로 비교했다. 공통 `verifyPackage`로 바꾸어 앱의 `packageRecord`와 같은 기대값을 사용한다. SVG 출력은 계속 이미 조판한 `record.pages`를 사용한다. |
| `loveholic_standard_lyrics_qa.mjs` | `prepareBrowserScore` 연결은 이미 있었다. 기본 입력을 현재 `/scores/loveholic.drumscore`로 변경하고, 저장 영향 표기를 `libraryWrites: 0`과 파생 캐시 사용으로 구분했다. |

공통 조판기는 `drum-score-render-cache`를 읽거나 쓸 수 있다. 따라서 공통 검수 도구의 주석·타입 안내·[도구 계약](../../reference/score/tools.md)은 라이브러리·패키지 저장과 파생 캐시를 구분하도록 수정했다. 이번에는 해당 경로를 실행하지 않아 DB·캐시 접근이 발생하지 않았다.

나머지 4개 패키지 어댑터의 검수용 반환값은 이미 조판한 `record`다. Loveholic PDF 앵커 경로가 읽는 대체 PDF 페이지·영역은 v2에서도 보존된다. 과거 고정 입력의 `red_sunset_app.build()`와 `loveholic_package.refresh()`는 특정 제작 실험용이며 새 패키지 재생성의 검증된 진입점으로 보증하지 않는다. 구형 패키지를 앱에서 다시 지원하도록 바꾸지 않았다.

검증 결과: 변경한 JS 4개·타입 선언 1개의 ESLint·Prettier, JS 4개의 `node --check`, `tsc --noEmit`, 대상 `git diff --check`를 통과했다. 문서 링크 검사도 통과했다. 렌더러·브라우저·Vitest·메모리 DB·패키지 API는 실행하지 않았다. 실제 주/대체 MusicXML 준비와 화면 검수는 후속 실행 검증에서 확인해야 한다.

`src/`, 수록 패키지·정본·원본, `history.md`, `review-score.md`는 이번 후속에서 수정하지 않았다. 개발 담당에게 변경 범위·정적 결과·파생 캐시 영향·미실행 항목을 전달했다. 도구 접수 시각은 2026-11-13 02:56:01 KST이며 본문과 접수 기록은 출력 루트의 `handoff/tools-followup.md`, `handoff/tools-followup-delivery.json`에 보존했다. 개발 담당의 실행 안내·통합 기록 갱신 완료 여부와 구분한다.
