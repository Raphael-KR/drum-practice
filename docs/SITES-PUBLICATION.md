# Sites 공개 발행

- 목표: 현재 웹앱 화면과 기능을 유지하여 iPad Safari에서 웹 주소로 사용할 수 있게 한다.
- 범위: 정본 웹앱의 소스/빌드 출력과 실행에 필요한 데모 파일, Sites 발행 사본 및 공개 호스팅.
- 완료 조건: 소스 동일성 확인, Sites 발행 성공, 공개 주소에서 악보 불러오기/재생 확인.
- 제외: 보관함 자동 이전, 서버 저장소 추가, Edge 실기기 오프라인 검증.
- 검증: src 78개 파일 SHA-256 대조, 빌드 성공, 정적 자산 참조 확인, iPad mini Safari 공개 주소 smoke.

## 정본과 발행 경로

정본은 `/Users/raphael/Playground/drum-practice`다. Sites 발행 사본은 `/Users/raphael/Playground/drum-practice/deployment/sites`이며 제품 코드를 독립적으로 수정하지 않는다.
정본 웹앱을 수정하고 빌드한 뒤 `scripts/prepare-sites.mjs`로 발행 사본을 갱신한다. HTML 내보내기 역시 동일한 정본 코드/템플릿을 사용한다.
Sites 사이트 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b`. 새로 만들지 말고 사본의 `.openai/hosting.json`을 사용한다.
공개 주소: https://drum-practice-studio.dgkma.chatgpt.site

## 자산과 데이터

실행 코드/라이선스/HTML 내보내기 템플릿 및 demo의 song.json, score.pdf, score.musicxml, audio.mp3, page-1.png~page-3.png를 발행한다. public/demo/qa와 public/qa 등 개발 검수 자료는 제외한다. 배포는 약14.9MB, 21개 정적 파일이다.
악보 보관함과 편집 내용은 각 브라우저의 IndexedDB에 저장된다. 기존 로컬 주소의 보관함은 공개 주소로 자동 이전되지 않는다.

## 검증 상태

Sites 버전2 발행 성공(2026-09-21 09:29 KST). 발행 소스 커밋은 `59668e84a399b56e8073e4d039dd018a89b3ac7a`. 기존 JS/CSS 그대로이며 브라우저 탭용 드럼 아이콘을 정본에 추가했다. 정본과 사본의 src 78개 및 index.html/빌드 index.html 동일성을 다시 확인했다. iPad mini 시뮬레이터 Safari 공개 주소에서 MusicXML 불러오기, PDF 전환, 네이티브 한 줄/두 줄 스와이프를 확인했다. 상세 기기 검수는 docs/experiments/sites에 기록한다. 실기기 Edge 오프라인 검증을 대신하지 않는다.

## 두 줄 고정 보기 수정 — 버전3

2026-09-21 09:37 KST 발행 성공. 커밋 `aa1dd585ed8fa6cdc12670e8128f2c158d7b9cc4`. 두 줄의 가로 드래그/휠 기능과 가로 이동 좌표를 제거하고 각 행 4마디를 유지한다. 정본 웹앱 수정 → 새 HTML 템플릿 빌드 → Sites 동기화 순서. 전체 238테스트 및 빌드 통과, 고정 행/입력 집중 검사 44개 통과. 이전에 내려받은 HTML은 변경되지 않으므로 최신 웹앱에서 다시 내보내야 한다.

버전4(09:41 KST, `ccf66f9b5c07328985e2eb7ddb56ad2c3640e2c2`)에서는 접근성 안내를 한 줄 보기에서만 가로 탐색이 가능하다고 정정했다. 동작 변경 없이 재빌드/발행 성공. iPad mini 시뮬레이터 Safari에서 좌우 2회 후 행 위치/마디/시간 유지 및 상하 스크롤을 캡처로 확인했다. 증거: docs/experiments/sites/ROWS-FIXED-QA-2026-09-21.md.

## 화면 너비 및 상단 제어

설정 앞에 전체화면/해제, 실제 location.reload 새로고침 아이콘을 공통 구현으로 추가했다. 웹앱과 HTML 동일하다. 전체화면 상태에서는 웹 문서의 핀치/제스처 확대를 억제하고 키보드 이벤트는 가로채지 않는다. Safari 자체 전체화면 해제 버튼·시스템 제스처는 사이트가 잠글 수 없고, 강제 재진입하지 않는다.
루트/앱/본문 너비를 100% 이내로 두고 min-width를 해제했다. 820px 이하에서 상단 제목과 버튼행을 분리하고, 제목은 말줄임 처리한다. 세로 스크롤은 유지한다. 브라우저 자체의 기존 페이지 줌 설정을 강제로 바꾸지는 않는다.
검증: 전체239테스트, 빌드 통과. 키보드 ⌘−를 취소하지 않는 회귀검사 포함.
참조: https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API/Guide , https://webkit.org/blog/7367/new-interaction-behaviors-in-ios-10/

버전5 공개 발행 성공: 2026-09-21 09:48 KST, `f1092e9dd56db2e135a51c8778f574a72cd073f9`. 로컬 정본의 동일 빌드로 iPad mini 가로·세로 폭 맞춤 및 전체화면 진입/앱 상단 탭 유지/해제, reload 후 동일 앱 초기화면을 검수했다. 보고서: docs/experiments/sites/screen-fit-QA-2026-09-21.md. Reload는 문서 교체이므로 전체화면이 해제된다. 핀치 억제와 키보드 비간섭은 자동검사/구현 확인이며, Safari 소유 시스템 제스처 완전 잠금 성공으로 보고하지 않는다.

## 2026-09-21 10:17 KST — UI 표준화
- 재생바 그룹, 공통 명명/번역/접근성 정의 반영. 버전 6, Sites 소스 29c3871249b517f9c78b4fbfdf00cbd4a650ddfe. 배포 succeeded.
- canonical src 80개 파일 mirror 일치. 전체 테스트 242개 통과, build/HTML 제외 검사 통과. 익명 Python URL 조회는 사이트 경계에서 HTTP 403을 반환하여 공개 번들 검증 근거로 사용하지 않았다.

## 2026-09-21 10:56 KST — 전체 UI i18n
- Sites 버전 7, 공개 배포 succeeded.
- 소스 c3f48f2d1c8a873619b35fb673aab6ac36653fc7 (배포 사본 커밋).
- 배포 appgdep_6ab08eb37dbc81919470c96a0368aef6.
- 정본 src 82파일 일치 확인, 703개 메시지·미등록 한국어 UI 0, HTML 사용 문구 184개.
- 정본 저장소의 커밋/제품 버전 변경은 수행하지 않음.

## 2026-09-21 15:58 KST — 0.4.0
- Sites 버전8 공개 배포 succeeded. 배포 appgdep_6ab0d59752788191a6f1c4c4cff74340.
- 배포 사본 소스381bce1480cd19fd07a1403f5d6db2dbe9cf612d, 정본 소스8e015a3. src84파일 바이트 일치 확인.
- 전체251테스트, build, 재생 전용 번들 제외 검사 통과. 기존 공개 접근 범위 유지.
- 웹앱의 실제 HTML 내보내기 경로로 생성한 SVG/PDF 합본11,565,517bytes를 문서/드럼 연습/바람과 언덕의 발라드-0.4.0.html에 저장하고 해시 일치 확인.

## 2026-10-02 23:33 KST — 재생 앱0.4.2
- 기존 공개 주소 유지, Sites 버전9 배포 succeeded. appgdep_6abfc0b9ad588191aa94cdfe13517db2.
- Sites 소스 cacb6ed786c32d19c08951c86da0f32f7d36dab2. 이 배포부터 최신 드럼연습실(재생 앱)만 게시한다. 악보제작기0.4.1은 로컬 전용이다.
- prepare-sites.mjs는 dist/player를 정적 발행 사본으로 옮기고 player.html을 루트 index.html로 연결한다. 이전 제작 앱 미러 소스·불필요한 자산은 사이트의 현재 트리에서 제거하며 Git 이력은 보존한다.
- 바람과 언덕의 발라드 완성 패키지8,363,473bytes 포함(PDF·SVG·음원·가사). 제작 앱 실제 내보내기로 만든 분리 검증 원본 패키지를 사용했고 QA 반복/마커 변경 전 자료다. public/scores에 두되 정본 Git에서는 미디어를 제외한다.
- 빈 보관함에서 악보 불러오기→저장→열기를 Safari 격리 로컬 미리보기로 확인. 기존 연습 기록은 자동 덮어쓰지 않는다. 빌드/타입/i18n/재생 번들 경계, 관련33테스트 통과.
- 서버 게시 완료는 Sites 배포 성공 결과로 확인. 공개 사이트를 추가 브라우저 검수하지 않았다. 곡 포함 HTML 내보내기는 생성하지 않았다.

## 2026-10-03 00:14 KST — 재생 앱0.4.3 / Loveholic
- Sites 버전10 공개 배포 succeeded. 배포 `appgdep_6abfca5730508191a74452a476464b51`, Sites 소스 `d1f6d24654f5fb01f2e590c3261197c3689a2f8d`.
- 기존 곡에 Loveholic123마디 패키지9,953,962bytes를 추가했다. PDF/SVG 각3쪽·음원·인쇄 가사 텍스트·구간 마커 포함. 전체 배포 약18.85MB.
- 제작 세션 감독·독립 대조 중 PDF crop 결함을 발견해 수정받고 Safari 로컬에서 재검수했다. 페이지/줄별 마디32그룹 일치,31개 집중 검사 및 분리 빌드 통과.
- 음원은 신호 추정 타이밍, 가사 음절 싱크는 미확정. half-muted20개 SVG 미표시와 PDF 줄별 배율 차이 등 상세 한계는 `docs/LOVEHOLIC-PUBLICATION.md`에 기록한다.
- 악보제작기0.4.1 로컬 전용 유지. 공개 범위 유지. 곡 포함 HTML 파일은 생성하지 않았다.

## 2026-10-03 00:39 KST — 재생 앱0.4.4
- PDF 오선 정렬을 공통 재생 경로에 적용. 줄별 crop 차이로 생기던 크기/높이 변동을 수정하고 인쇄 가사 영역을 보존한다. 검출 불가 PDF는 기존 crop 표시 유지.
- 70파일330검사, 분리 빌드 통과. Safari iPad mini 응답형 모드 PDF 한줄/두줄·SVG 전환·재생/정지 확인. 시뮬레이터 MCP는 승인 오류로 터치 검증 미수행.
- Sites 버전11, 소스 bda593d5eab00ee29cb18a15f5987f52d67d2bba, 배포 appgdep_6abfd017a2108191b4fe9f73650e3911 succeeded. 기존 악보 두 개와 패키지 해시 유지.
- 제작앱0.4.2는 로컬 전용. 곡 포함 HTML 저장 없음. 상세 반복 검증: LOVEHOLIC-REVIEW.md.


## 2026-10-03 12:20 KST — 브라우저 직접 MusicXML 조판 배포
- Sites 버전14, 배포 `appgdep_6ac074788f288191ac47759bf515610c` succeeded. 기존 공개 주소/공개 범위 유지.
- Sites 소스 `6630b7b19abb197723bbf611b0d65abebf750f19`. 직전 검증된 dist/player 10파일과 배포본 바이트 일치, 루트 index는 player.html과 일치. Loveholic/Real Paradis 패키지 포함.
- 공통 MusicXML 직접 조판·캐시 및 최신 로컬 재생 화면을 게시. 제작앱은 로컬 전용 유지. 배포 성공은 Sites 서버 응답으로 확인했으며 이번 배포 후 별도 공개 브라우저 검수는 수행하지 않았다.
- 사용자 결정: 에이전트의 독립 HTML 재생 파일 생성·저장은 향후 작업 범위에서도 제외. 필요 시 사용자가 앱에서 직접 저장한다. 앱 내 내보내기 기능과 빌드용 템플릿은 유지한다. AGENTS.md에 반영.

## 2026-10-03 17:04 KST — Sites 버전15
- 사용자 게시 요청에 따라 기존 공개 주소와 공개 범위를 유지하여 배포 성공. 배포 ID `appgdep_6ac0b7066a088191939562aab03b495c`, Sites 소스 커밋 `53e779f38c6b83686f461f8dd8fc31a5fb566385`.
- 슬라이더 중앙100%·눈금·흡착, 한 줄 네 마디 기준, 두 줄 읽기 크기·기둥/연결선 보정, 홈 글자 크기와 Loveholic PDF 가사 위치 수정 포함.
- Loveholic 및 바람과 언덕의 발라드 패키지 포함. 원본 public 패키지와 배포 사본 SHA256 일치 확인.
- 전체79파일370테스트, 최신 build:apps 및 앱 경계 검사 통과. Sites 서버의 succeeded 응답으로 게시 확인; 배포 후 공개 브라우저 검수는 별도로 하지 않음.
- 악보제작기은 로컬 전용 유지. 독립 HTML 재생 파일 생성·저장, 정본 저장소 커밋/버전 변경은 수행하지 않음.

## 2026-10-04 10:06 KST — Sites 버전17 게시
- 최신 드럼연습실 게시 성공: https://drum-practice-studio.dgkma.chatgpt.site . 기존 public 범위 유지. 제작앱은 배포하지 않음.
- 마커5개 통합, 구간12개, 균등 모드 및121~123 온쉼표 복구, 화면 정리, 메트로놈 최대 gain1.5 포함.
- 전체88파일417테스트, build:apps 및 앱 경계 검사 통과. 배포 정적11파일은 dist/player와 SHA256/바이트 일치 확인.
- Sites 소스 커밋 c82a274886c95e43d113fc19b9b757317c1c6c2b, version17, deployment appgdep_6ac1a67f31a081919ca45c1a4bd6de98 succeeded. 서버 응답으로 게시 확인; 게시 후 실제 iPad 재생 검수는 별도.
- 정본 저장소의 작업 변경은 미커밋 상태로 보존. Sites 배포 사본만 helper로 커밋·push.

### 2026-10-04 12:56 KST — Sites 버전18 게시
- 세로 상단 제목/조작부 두 줄 배치 및50~300% 확대 게시. 기존 public 범위와 player-only 대상 유지. 앱 표시0.6.0.
- 전체88파일417테스트, build:apps 및 앱 경계 검사 통과. 배포11파일 바이트/해시 정본 일치.
- Sites source c57ce6d95b4b76035ff605c8ddae975d783efd04, deployment appgdep_6ac1ce67f79c8191859cb5aeec55ecd0 succeeded. https://drum-practice-studio.dgkma.chatgpt.site . 배포 서버 확인이며 게시 후 실기기 재검수는 별도.

### 2026-10-04 13:07 KST —0.6.1 / Sites19 게시
- 정본 커밋 d9225f0. 전체417테스트 및 build:apps 통과. Sites source fc56acc74fd0365ad81a899cd7870f1f1aa10a31, deployment appgdep_6ac1d101bbf88191b3bff0597c6816d5 succeeded. 기존 공개 주소/범위 유지. 제목 흐림의 실기기 해소 여부는 사용자 확인 필요.

### 2026-10-04 13:17 KST —0.6.2 / Sites20 게시
- 구역 배색 복원 커밋6681cae. 전체417테스트, TypeScript, build:apps 및 앱 경계 검사 통과.
- Sites source8f5c994442336416a8c26802884c38ce58b40a03, deployment appgdep_6ac1d34ba5b08191aeb1a6c7dcf87c51 succeeded. 기존 공개 주소와 player-only 범위 유지.

## 2026-10-04 13:44 KST — 0.6.3 / Sites 21
- 구역별 배경색을 화면 양끝까지 연결, 구역 바깥 여백 제거. 제목 안전 여백 유지 및 theme-color 일치.
- 417테스트, TypeScript, Safari 레이아웃 검사, build:apps 통과.
- source5588d2cf735b68ca01b26eb8d988ee3aa27deb3d, deployment appgdep_6ac1d97c5fb881918f544cf01e1ea0b4 succeeded. 실제 iPad 상태바 색상은 사용자 캡처 확인 필요.

## 2026-10-04 13:51 KST — 0.6.4 / Sites 22
- 구역 가로 구분선 복원, 제목 상단 추가 안전 여백 제거(기본8px 유지).
- 417테스트·TypeScript·Safari 계산 스타일·build:apps 통과. 실제 iPad 흐림 비교는 미확인.
- source099536c9ca525fb1473153e71d9b10a8191a8cdf, deployment appgdep_6ac1db5adc4c8191aee4ded7bf0a6cd6 succeeded.

## 2026-10-04 14:05 KST — 0.6.5 / Sites 23
- 제목21px 통일 및 Safari 페이지 당김 제한 해제. 417테스트·TypeScript·build:apps 통과.
- sourceebaed064b592db1d25c67c5c4021f729b15c0f22, deployment appgdep_6ac1de8b7e6c8191a9030119f7cbe2f8 succeeded. 실제 iPad 탄성 동작과 제목 흐림은 후속 확인 대상.

## 2026-10-04 14:11 KST — 0.6.6 / Sites 24
- 바깥 html/body 흰색과 앱 배경 분리. 417테스트·TypeScript·Safari 스타일·build:apps 통과.
- sourced820a0858ea25a52839b79b6a960c334c8fb4e2a, deployment appgdep_6ac1e005595c819187f64eb59e349456 succeeded. 공개/player-only 유지.

## 2026-10-04 14:19 KST — 0.6.7 / Sites 25
- 제목바 및 theme-color #b8d4f5 적용. 417테스트·TypeScript·Safari 스타일·build:apps 통과.
- source622952ed8bf00c2ccec33622147aa1d5eac17697, deployment appgdep_6ac1e1e1509c819199e72705363cb0c6 succeeded.

## 2026-10-04 14:28 KST — 0.6.8 / Sites 26
- 동문회와 동일한 sticky top0 불투명 제목바 적용. 417테스트·TypeScript·Safari 스타일·build:apps 통과.
- sourceb58db49c721361265e9c9b1376653bc9908f3dab, deployment appgdep_6ac1e3f5fbe881919729c91d43ad5d30 succeeded. 실제 iPad 상태바 색상은 미확인.

## 2026-10-04 14:39 KST — 0.6.9 / Sites 27
- html 파랑 배경 및 헤더 내부 safe-area 적용. body 흰색 유지.
- 417테스트·TypeScript·Safari 스타일·build:apps 통과. 실제 iPad 상태바 배색과 흐림은 미확인.
- source95d737441877f5b21d9dc76d0f8fa1faf695e3e3, deployment appgdep_6ac1e66d234c8191aa65836ecefacb34 succeeded.

## 2026-10-04 14:43 KST — 0.6.10 / Sites 28
- viewport-fit=cover 제거 단일 변수 비교. 417테스트·TypeScript·build:apps 통과.
- sourcec77e8cb0c005e3d575914f5cca05fa6efe704c1a, deployment appgdep_6ac1e76beaec8191b2af135fa5224079 succeeded. 실제 iPad 결과 미확인.

## 2026-10-04 14:52 KST — player 0.6.11 / Sites 29
- 제목 옆 빌드표시 v0.6.11 · build 66e993d6. 제목바 높이 유지 확인. 417테스트·build:apps 통과.
- sourced4ec5c978b833cc0762eda92f7ae49e8a4153bb8, deployment appgdep_6ac1e977f55881919670c59028cbbd9f succeeded.

## 2026-10-04 15:36 KST — 0.6.12 / Sites30
- source2e7678326d77c5865e7a1e750a01da518229fe33, deployment appgdep_6ac1f3e30ed08191934e1b57f960367d succeeded. build73c9afd1.
-417테스트/build:apps 통과. 로컬 가로→세로 전환에서는 Safari 배색 적용됐지만 게시본 세로 첫 진입은 흰색으로 남음. 해결 완료 아님. 세로 첫 진입을 기준으로 추가 비교 진행.

## 2026-10-04 15:57 KST — Sites32 / player0.6.14

- 직전 Sites31(player0.6.13, source aca57a3cb0af969a3a9ae8fef4fbea38fee5d2ed)은 배포 성공했으나 native iPad Safari 상단 tint 검증 실패. 타이머 방식 철회.
- Sites32 source: 69eee47775c12a7fc2f85d32cebbfabdba35dcfe
- version: appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_38d62ea1b26881919e8ed2197fc204ef
- deployment: appgdep_6ac1f8bff6cc8191be6b26a1e4ce04e9 — succeeded (2026-10-04T06:57:20.233601+00:00)
- URL: https://drum-practice-studio.dgkma.chatgpt.site
- 표시: v0.6.14 · build 2a211ebd. dist/player만 배포, 공개 범위 유지.
- 15:58–15:59 KST iPad mini(A17 Pro), iPadOS27 native Safari 공개 URL 목록→악보→목록 전환에서 상태바/주소창/탭 파란색 유지 및 제목 선명 확인. 실제 사용자 iPad 홈 화면 실행은 별도 확인 필요.
- 418 tests/89 files 및 build:apps 통과. 진단 상세: IPAD-STATUS-BAR-DIAGNOSIS.md.

## 2026-10-04 16:07–16:09 KST — Sites33/34 세로 여백과 두 줄 바로가기

- Sites33: player0.6.15 build8c600335, source f31d8ec2ad5bc04fdb76ab688b6449966094a9d6, deployment appgdep_6ac1fb1b7e948191afb95d6b856db8f7 succeeded. 상단2px/하단16px, 세로 조작판290px.
- Sites34: player0.6.16 build4dd2ab2c, source cc5ada4cf54662bef3966b0d95409a7ad9437e03.
- version: appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_db3d5662d98481919af908afaa2283ae
- deployment: appgdep_6ac1fb9fe3348191865295abbba09db6 succeeded (2026-10-04T07:09:36.236818+00:00).
- URL: https://drum-practice-studio.dgkma.chatgpt.site
- 추가 요청: portrait에서 섹션명 위/마디수 아래, landscape 한 줄 유지. dist/player만 배포. build:apps PASS.
- 16:10 KST 공개 URL native iPad mini iPadOS27 portrait Safari에서 v0.6.16 build4dd2ab2c 확인: 바로가기 섹션명/마디수 두 줄, 축소된 제목 여백, 조작판 아래 여백, 파란 Safari chrome 유지. 현재 시뮬레이터는 두 줄 악보 모드이며 사용자 실제 iPad 한 줄/홈 화면 결과는 별도 확인 대상이다.

## 2026-10-04 20:03 KST — Sites35 / player0.6.17

- build25814550, source34d4f7aa50a77f007f4589331e91495c346357ac
- version appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_e103d61b99a4819188c8ec27d42a2185
- deployment appgdep_6ac232746b4081918056250420ba6130 succeeded (2026-10-04T11:03:32.286046+00:00).
- URL https://drum-practice-studio.dgkma.chatgpt.site
- 바로가기 중앙 정렬/empty, 설정 도움말 상단 이동. dist/player만 게시. 418 tests/89 files, build:apps PASS.
- 공개 Safari MCP에서 v0.6.17 build25814550 로드/ready=true, 설정 open=true, 도움말 parent=dialoghead 확인. Device Hub 창 부재로 native iPad 확인은 미실행.

## 2026-10-04 20:22 KST — Sites36 / player0.6.18

- build ba493cf8, source 8ed319f89691449c5b86f9b77a34cef2e9b48067.
- version appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_53e61d3cb7088191bccaa0af9603d05a
- deployment appgdep_6ac236d311f0819189b639bb8d36a949 succeeded (2026-10-04T11:22:13.170394+00:00).
- URL https://drum-practice-studio.dgkma.chatgpt.site
- 세로 8줄 범례, 가로 원본 유지. dist/player만 게시. 공개 Safari MCP v0.6.18 buildba493cf8와 범례 열기/두 방향 27항목 확인. 실제 iPad 후속 확인 필요.

## 2026-10-04 20:45 KST — Sites37 / player0.6.19

- build0eb99202, source43947cdf72ba80e91519192a5b258edb924c3171.
- version appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_9c6fc42e368c819195e3af98cd66b306
- deployment appgdep_6ac23c41b4d4819184c13bae21c11b84 succeeded (2026-10-04T11:45:22.022581+00:00).
- 가로 버전/빌드 표시를 제목 아래로 이동. 제목바 높이57px 유지(Safari MCP 로컬 수정 전후 실측), 세로 inline 유지. dist/player만 게시.

## 2026-10-04 22:15 KST — Sites38 / player0.6.20
- build7e6a94b2, source3064e235c416f85ab4e950243e176568554036da.
- deployment appgdep_6ac25143c9408191a8cac19e0eea71e2 succeeded. 공개/player-only 유지.
- 정본 기능 커밋 c470012 main push 완료. 드럼438테스트/89파일 및 build:apps 통과.
- 공개 Safari에서 신규 빌드와 제목바 보기 버튼 로드 확인. 일반 Python HTTP 접근은403 응답이어서 Safari로 확인. 실제 iPad 추가 검수는 미실시.

## 2026-10-04 22:26 KST — Sites39 / player0.6.21
- build1409bbc0, source900acf85f878cf0fb05f1ea12e5466b5aea17d8f.
- deployment appgdep_6ac253d6e62481919f2b70b44bc99263 succeeded. 공개/player-only 유지.
- 정본 기능 커밋933c425 main push 완료. TypeScript/build:apps/앱 경계 검사 및 아이콘5개 바이트 대조 통과.
- 공개 Safari에서 v0.6.21/build1409bbc0, 아이콘 링크와 앱명 드럼연습실 확인. PNG 아이콘180/32/192px 로드 확인. 실제 iPad 홈 화면 아이콘 갱신은 미검증.

## 2026-10-04 22:46 KST — Sites40 / player0.6.22
- 사용자 발행 요청에 따라 기존 검증 빌드57ef6876 게시. 정본 커밋e984125.
- source4303bb883afa2cb1b517352bc09c6d67759d427b, deployment appgdep_6ac2589acf548191a3f7d6977d6f377d succeeded.
- 기존 public 유지, dist/player만 발행. 제작기는 로컬 유지.

## 2026-10-04 23:42 KST — Sites41 / player0.6.23
- buildf4ee39b7, sourcec2717d139241709e7fdd706897271ccaf97e6d6d.
- deployment appgdep_6ac265b81ef8819188915097fd520a1d succeeded. 공개/player-only 유지.
- 정본 c8d2fff main push 완료.441테스트/분리 빌드 통과. 카운트오프 수정 및 제작 프로세스 문서 포함. 실제 iPad 청취 확인은 별도.
- 공개 URL을 Safari에서 열고 곡 진입 후 `v0.6.23 · build f4ee39b7` 표시를 확인했다.

## 2026-10-05 00:27 KST — Sites42 / player0.6.24
- build bbb7a769, source 50661aeb41128e111457def83d0b377f1f9c9a1e.
- deployment appgdep_6ac2705276908191ab0c74b8d194a2d2 succeeded. 공개/player-only 유지.
- 정본 2660dab main push 완료. 116→117마디 불완전 행 빈 칸 보존 수정. 443개 테스트 및 분리 빌드 통과.

## 2026-10-05 01:21 KST — Sites43 / player0.6.25
- build cdffdb8c, source 2df1b682e3dfca5d952187bd9d0e278c32346a61.
- deployment appgdep_6ac27cdf20ec8191b6c214940f66078c succeeded. 공개/player-only 유지.
- 정본 7aea646 main push 완료. 북마크 시작 마디 바로가기의 빨강/흰 글씨 표시 반영. 444개 테스트 및 분리 빌드 통과.

## 2026-10-05 02:18 KST — Sites44 / player0.6.26
- build 8c5fea89, source 1c494e59d0f3205813c9d6ec5993174c6a2605e4.
- deployment appgdep_6ac28a4626988191a5f41b0792aeda02 succeeded. 공개/player-only 유지.
- 정본 2b211b4 main push 완료. 섹션 점등·모달·도움말·호버·숫자판 전체 드래그 개선. 446개 테스트 및 분리 빌드 통과.

## 2026-10-05 02:26 KST — Sites45 / player0.6.27
- build 688631c6, source 72957b86781305bd9bb89fc4a400e71eac9e6a1b.
- deployment appgdep_6ac28c54e8608191afd223f6fc619a79 succeeded. 공개/player-only 유지.
- 정본 cf1d6a2 main push 완료. 악보 선택 화면 새로고침·드럼치는공방 예약 링크 추가. 446개 테스트와 분리 빌드 통과. 운영 HTTP 직접 검증은 403으로 제한됨. Sites의 succeeded 결과로 발행 확인. Safari 운영 화면에서 새로고침·예약 버튼 노출 확인.

## 2026-10-06 00:03 KST — Sites46 / player0.6.28
- build 77cf94bc, source 00fe94e0e103283b71396b58dc70b89b07036830.
- deployment appgdep_6ac3bc2a63a88191900b4147553b3f52 succeeded. 공개/player-only 유지.
- 정본 db62ca6 main push 완료. 악보 목록 중복 방지·로딩 안내·단계별 시간 측정 포함. 450개 테스트 및 버전 갱신 분리 빌드 통과.

## 2026-10-06 00:13 KST — Sites47 / player0.6.29
- build b13e624d, source 1f9e5335356591a5d2e5dd29b2e98c954e35cb98.
- deployment appgdep_6ac3bea618f48191bd8489a6eab381bd succeeded. 공개/player-only 유지.
- 정본 e81d977 main push 완료. 기본 제공 악보 다운로드 진행률 표시. 전체 456개 테스트 및 분리 빌드 통과.
- Safari 일반 URL 첫 탐색은 이전 빌드 캐시 표시. release 쿼리로 새 탐색 후 v0.6.29/build b13e624d 확인. 실제 진행률·저장 동작은 발행 전 로컬 Safari 검증.

## 2026-10-06 00:44 KST — Sites48 / player0.6.30
- build 001979ac, source b934a8971fe5db9062d273fb99fc441012e34a13.
- deployment appgdep_6ac3c5c2117c8191b6e85bc1921512ed succeeded. 공개/player-only 유지.
- 정본 ac7721d main push 완료. 재생 화면 및 관련 창 툴팁 보완. 전체 458개 테스트 및 분리 빌드 통과.
- Safari 공개 URL에서 v0.6.30/build 001979ac 확인.

## 2026-10-06 05:25 KST — player0.6.31
- 소스 main: da838eb, origin/main push 완료. editor0.6.26(공통 R/L 표시 수정), player0.6.31, build a75928bc0fc8.
- 목록 제목·툴팁·빈 목록 안내·불러오기 오류 표시 및 탐탐 무빙 기본 연습곡(SoCal MP3) 반영. 전체461테스트, 분리 빌드/경계 검사 통과.
- Sites version49: appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_cb1805a405e48191bf790eab53af727d
- mirror SHA: eccd8e6470cda273520c945fb0f095e7342af506
- deployment: appgdep_6ac407b2aa7c8191a4ee2504e2103f98, succeeded, 2026-10-05T20:25:39.610224+00:00.
- URL: https://drum-practice-studio.dgkma.chatgpt.site
- 공개 범위 유지, dist/player만 발행. 포함된 tom-moving.drumscore SHA256: 0030b4c53d65b678981bb0272425694fd9353be9d03393fe1cfd8da36429e9b3.
- 검증은 native Sites 성공 응답과 로컬 빌드/패키지 일치 기준. 실물 iPad·음질 청취·카운트오프 ON 실제 비교 미검증은 유지.

## 2026-10-06 07:04 KST — player0.6.32
- 정본 main4e413f1 origin/main push 완료. editor0.6.26 유지, build79ad2ba18640.
- 기본 연습곡/내 악보 목록 분리, 탐탐 무빙28마디·Portland MP3 교정본 반영. 전체462테스트 및 분리 빌드/타입/i18n/경계 검사 통과. XML/MIDI/음원/패키지 재검증 통과.
- Sites version50: appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_a88ed50563088191abc79f03e077a53a
- mirror SHA: 8e0f6d1f838b0c26e8a3aa3525b50826cb15f482
- deployment: appgdep_6ac41ed854548191a5c41070c3957013, succeeded, 2026-10-05T22:04:25.978716+00:00.
- URL: https://drum-practice-studio.dgkma.chatgpt.site
- 기존 공개 범위 유지, dist/player만 발행. tom-moving.drumscore SHA256 1eb7214b7e637ece8a0a97772ede30a28ca145df261742482f386b8c419b9c2e, public/dist 일치.
- native 성공 응답으로 발행 확인. 실물 iPad·주관적 음질 청취는 이번 검사 범위 밖.

## 2026-10-06 14:14 KST — player0.6.34
- main a1e1c52 push 완료(선행0.6.33 명칭 변경 포함). player0.6.34/editor0.6.26, build991259aac3e8.
- 시작전 손플기96마디를 기본 연습곡 첫 번째로 수록.28마디 탐탐 유지,16마디 신규 제공 대체·기존 기록 보존. 악보 메타데이터 최신본 포함.
- 전체464테스트·분리 빌드/타입/i18n/경계 검사 통과. 패키지 public/dist SHA256 e070249500dc0fb42c559919045b5d116b884e2ae16d7ee3e8f42c344d2c8c97 일치. Safari 로컬 첫 순서/불러오기·저장·96마디 열기·재생 버튼 일시정지 상태 전환 및 정지 확인. 실제 시간 진행/청취/iPad 검증은 별도 미확인.
- Sites version51: appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_6ff4f211e36c81918e0e9b7e469ec67c
- mirror SHA 078f0dcd917b6d36141a25a94da661f27bf795b3
- deployment appgdep_6ac483af74788191962141b31becce40, succeeded, 2026-10-06T05:14:44.965226+00:00.
- URL https://drum-practice-studio.dgkma.chatgpt.site. 기존 공개 범위 유지, dist/player만 발행, native 성공 응답 확인.

## 2026-10-06 21:45 KST — player0.6.35
- 소스 main75b3fdf push 완료. player0.6.35/editor0.6.27, build289d5147163a.
- 촘촘한 악보 목록·제목 없는 최상단 즐겨찾기·공통 제목 순서 설정·목록 설정·공통 분할 선택 UI·도움말 현행화 포함.
- 전체94파일470테스트 및 분리 빌드/타입/i18n/앱 경계 검사 통과. 제작자 진행 중인 문서·생성기 변경은 보존하고 앱 커밋에서 제외.
- Sites version52: appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_f20ed3aebd308191964415b59e6a5fe2
- mirror SHA faa533f3c7e8144e818444de022f7254db9290fe
- deployment appgdep_6ac4ed3eab0c8191a6aba8289ea88ed8, succeeded, 2026-10-06T12:45:09.867806+00:00.
- URL https://drum-practice-studio.dgkma.chatgpt.site. 공개 범위 유지, dist/player만 발행. native 성공 응답으로 발행 확인.
- 시작전 손플기 SoCal 메타정보 정정 패키지 public/dist SHA256 8994b17b75385fd0fc46ebf954506ef352297c05b51f5581160fa260a59e0c04 일치.
