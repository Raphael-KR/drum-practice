# Sites 공개 발행

- 목표: 현재 웹앱 화면과 기능을 유지하여 iPad Safari에서 웹 주소로 사용할 수 있게 한다.
- 범위: 정본 웹앱의 소스/빌드 출력과 실행에 필요한 데모 파일, Sites 발행 사본 및 공개 호스팅.
- 완료 조건: 소스 동일성 확인, Sites 발행 성공, 공개 주소에서 악보 불러오기/재생 확인.
- 제외: 보관함 자동 이전, 서버 저장소 추가, Edge 실기기 오프라인 검증.
- 검증: src 78개 파일 SHA-256 대조, 빌드 성공, 정적 자산 참조 확인, iPad mini Safari 공개 주소 smoke.

## 정본과 발행 경로

정본은 `/Users/raphael/Playground/drum-practice`다. Sites 발행 사본은 `/Users/raphael/Playground/drum-practice-sites`이며 제품 코드를 독립적으로 수정하지 않는다.
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
