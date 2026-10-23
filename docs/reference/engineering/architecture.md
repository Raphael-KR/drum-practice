# 프로젝트 구조와 책임

문서 역할: **현행 Rule**. 현재 요구·계약과 지원 한계를 다룬다. [전체 정본](../../RULES-INDEX.md), [실행 안내](../../README.md), [결정 이력](../../decisions/README.md)을 함께 참고한다.

<a id="project-structure--프로젝트-구조"></a>

## 프로젝트 구조

결정 근거: [ADR-0023](../../decisions/0023-shared-module-boundaries.md). 실행: [절차](../../how-to/verify.md#testing--개발-검사와-로컬-자산-준비).

<a id="project-structure--책임과-진입점"></a>

### 책임과 진입점

| 위치 | 책임 |
|---|---|
| `src/apps/editor/main.ts` | 로컬 제작기 조립, 편집 세션·저장 큐·미디어 수명·화면 전환 |
| `src/apps/editor/editor-*.ts` | 화면 구성, 보관함, 악보·가사 편집, 검수, 폼 반영 |
| `src/apps/editor/editor-file-transfer.ts` | 개별 악보 백업·원본 재연결·패키지 입출력 이벤트; 저장·편집 세션은 main의 host 사용 |
| `src/apps/player/player-app.ts` | 연습실 조립, 목록·가져오기·재생 진입 |
| `src/modules/playback/` | 두 앱이 공유하는 재생 화면·제어·구간·마커·BPM |
| `src/modules/audio/` | 음원 분석·변환·파형·첫 박 조정 |
| `src/modules/score/` | MusicXML·악보 렌더링·캐시 |
| `src/modules/lyrics/` | 가사 배치·타이밍·보정 |
| `src/modules/library/` | 패키지·가져오기·목록 정책 |
| `src/modules/help/` | 음악 화면의 도움말 내용 |
| `src/model/` | 공통 자료형과 박 시각·편집 규칙 |
| `src/platform/storage/` | IndexedDB·설정·직렬화·캐시 |
| `src/platform/browser/` | 브라우저 다운로드·전체화면 등 |
| `src/shared/` | 도메인 규칙 없는 UI·스타일·번역 |
| `src/content/` | 수록곡 목록과 승인된 곡별 보정 |
| `src/generated/` | 생성하는 라이선스·빌드번호; Git 제외 |
| `scripts/{build,checks,release}/` | 제품 빌드·검사·릴리스 도구 |
| `tools/` | 악보 제작·벤치마크·Apple 로컬 보조 도구 |

HTML 주소는 `index.html`, `editor.html`, `player.html`을 유지한다. `src/app-versions.json`이 버전 정본이다. 독립 HTML 내보내기는 추가하지 않는다.

<a id="project-structure--의존-규칙"></a>

### 의존 규칙

제작기와 연습실은 서로 import하지 않는다. 앱은 공통 모듈을 조립하며, 재생 화면의 소유자는 `playback-screen.ts` 하나다. 분리한 BPM 모듈과 `playback-settings.ts`의 음량·보기·사용자 설정 바인딩은 같은 host와 이벤트 등록·해제 경로를 사용한다. 설정 모듈이 별도 화면 상태나 저장소를 만들지 않는다.

섹션·반복 구간 버튼판의 콘텐츠는 `playback-shell.ts`가 `playback-panel-content` 클래스로 연결한다. 호스트가 전달한 태그(`section`/`div`)에 레이아웃을 의존하지 않는다. 제작기 PDF 검수도 공통 dock의 3행·높이 배분 규칙을 따르며, 비교 캔버스는 렌더러의 최소 높이 220px을 확보한다.

악보 목록 구성은 `modules/library/score-catalog.ts`가 소유한다. 저장 자료와 번들 카탈로그를 ID로 합쳐 기본 연습곡·내 악보·음원으로 분류하고 기본 연습곡 순서와 구획 제목/구조를 공유한다. 연습실과 제작기 홈은 이 결과를 사용하며, 제작기는 음원 전용 항목을 제외한다. 저장된 악보는 수정본을 사용하고, 미저장 번들은 제작기에서 다운로드·패키지 검증·저장 후 편집한다. DB 이름·스키마·저장 형식은 바꾸지 않는다.

model은 앱·UI·저장 구현에 의존하지 않는다. 기존 오류 문구를 위한 i18n 의존만 유지한다. shared는 음악 기능 모듈을 참조하지 않는다. 모듈별 named export를 직접 사용하며 전체를 모은 barrel을 추가하지 않는다.

저장 계층은 model과 직렬화에 필요한 순수 악보·미디어 계약을 사용하고, library는 저장 정책을 호출한다. playback은 audio·score·lyrics·library·help를 조합한다. audio와 score는 model·저장 캐시·공통 UI를, lyrics는 model·content를 사용한다. content의 승인된 곡별 보정에 필요한 기존 score·lyrics 참조는 유지하며 새 순환 의존을 만들지 않는다. help는 음악 화면의 도움말을 소유하고 shared/ui의 공통 표시 도구를 사용한다. 구조 개편 당시의 이동표는 [구조 개편 기록](../../records/archive/project-restructuring.md#restructuring-map--경계)에 보존한다.

<a id="project-structure--호환성과-스타일"></a>

### 호환성과 스타일

DB 이름·버전·저장 키, bytes-v1 직렬화, `.drumscore`, snapshot·큐·트랜잭션을 유지한다. `RecordData`와 `AudioBarOne`의 자료형 선언은 model에 두고 기존 모듈의 type 재수출을 유지한다. 이 구조에 따른 저장 데이터 마이그레이션을 요구하지 않는다.

기능 CSS는 해당 모듈 가까이에 둔다. 두 큰 CSS는 기존 순서대로 조각을 import한다. CSS 분리 시 원문 결합 순서·선택자·규칙 우선순위를 유지한다.

`hosting`, `server`, `deployment`의 운영 역할은 유지한다. 배포 사본은 직접 수정하지 않는다. 공개 배포 대상은 계속 `dist/player`이며 제작기는 로컬 전용이다.

<a id="project-structure--검사-누락-방지"></a>

### 검사 누락 방지

`scripts/checks/source-files.mjs`가 src 전체를 재귀 탐색한다. 공통 UI, i18n, 재생 소유권, app/model/shared 경계를 검사하며 두 앱 빌드 뒤 player 번들의 제작 기능 유입을 차단한다.

테스트는 unit·integration·local-media로 구분한다. 로컬 미디어가 없으면 필요한 검사가 실패하며 조용히 건너뛰지 않는다. 자세한 자산 목록과 실행 조건은 [검사 문서](../../how-to/verify.md#testing--개발-검사와-로컬-자산-준비)를 따른다.

개발·테스트 진입점은 `npm run generate`로 생성 파일을 준비한다. 기본 `build`는 두 앱 분리 빌드이며, 앱·도구·hosting의 타입 환경은 각각 검사한다. Git에 기록할 파일을 대상으로 서식·문서 링크를 검사하고, `verify:portable`은 원본 미디어 없는 CI에서도 실행한다. 검증 범위·기록 항목은 [검증 Rule](verification.md)을 따르며 새 실행 결과는 `history.md`와 [해당 주제의 기록](../../records/README.md#주제별-기록)에 남긴다.

목록 카드와 즐겨찾기/제목 순서 표시는 `modules/library/library-presentation.ts`, 두 홈 화면의 크기·간격은 `modules/library/player-library.css`를 공유한다. 동작 버튼은 각 앱이 제공한다. 공통 색상 변수는 `shared/styles/controls.css`, 제작기의 오렌지 팔레트는 `apps/editor/styles/07-theme.css`에 정의한다.

제작기의 ‘내 악보 목록’은 재생 중지·현재 기록 저장·재생 자원 해제 후 공통 홈으로 돌아간다. 별도 목록 모달은 제공하지 않는다. 삭제는 홈 카드, 전체 백업/복원은 설정의 악보 영역 안 `library-backup`, 패키지 가져오기는 새 곡 준비 창을 사용한다. 전체 백업은 곡을 열지 않아도 접근할 수 있으며, 숨겨진 구형 개별 곡 도구(`backup-dialog`)와 분리한다.

목록 상단바는 `library-header-actions` 안에 주 작업(`library-import`), 앱 전환(`library-app-link`), 공통 컨트롤(`library-common-actions`)을 배치한다. 제작기도 기존 새로고침·설정·도움말 컨트롤을 사용하며 공방 예약만 연습실에 둔다. 모양·간격은 공통 목록 CSS, 색상은 앱별 변수로 결정한다.

## 코드가 읽는 화면 소유권 표

[P01–P25·E01–E06 표](../../plans/PLAYBACK-SCREEN-INVENTORY.md)는 `scripts/checks/check-playback-architecture.mjs`의 입력이므로 기존 경로에 둔다. 이 파일에 동일 표를 복제하지 않는다. 경로 이동은 소비 코드와 관련 검사까지 함께 바꾸는 별도 작업에서 수행한다.

[생성 UI 참조](../../product/UI-COMPONENTS.md), [범례 자산](../../design/legend-diagram/README.md), [글꼴 배치](../../../src/modules/score/vendor/pretendard/README.md)도 생성·배치 경로를 유지한다.
