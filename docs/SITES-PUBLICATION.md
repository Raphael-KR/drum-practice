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
