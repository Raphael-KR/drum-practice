---
status: accepted
date: 2026-10-23
---

# 두 앱을 공통 기능·모델·저장 계층으로 조립한다

## Context and Problem Statement

큰 진입 파일과 중복 목록·재생 코드 때문에 책임과 저장 호환성을 유지하며 구조를 정리해야 했다. 원래 결정 시기는 2026-10-21~23이며, YAML 날짜는 이번 문서 정리일이다.

## Considered Options

* 각 앱이 재생·목록·저장 구현을 별도로 소유한다.
* 앱은 공통 기능을 조립하고 단일 재생 소유권·model/shared 의존 경계를 유지한다.

## Decision Outcome

후자를 채택한다. DB·직렬화·트랜잭션 계약은 유지하고 기존 모듈 협력 경로를 명시한다. 새 추상화나 barrel로 전체를 다시 작성하지 않는다.

### Consequences

계층 경계·생성 파일·빌드 유입 검사를 유지한다. 시각 배치·앱 역할의 결정은 기존 ADR을 재사용한다. 새 기능·삭제·전송·배포 승인을 추가하지 않는다.

### Confirmation

현행 계약과 실행 절차는 [구조 Rule](../reference/engineering/architecture.md#project-structure--프로젝트-구조), [소유권 목록](../plans/PLAYBACK-SCREEN-INVENTORY.md), [검사 절차](../how-to/verify.md#testing--개발-검사와-로컬-자산-준비)에서 확인한다. 아래 당시 검증 수치·실패·미확인은 해당 환경의 기록이며 이번 작업에서 앱·악보 검증을 다시 수행한 결과가 아니다.

## More Information

대안은 원문에서 확인되는 채택·대체 경로를 정리한 것이다. 별도 회의나 새로운 합의를 추정하지 않는다. 이관 원문에 포함된 대체 전 값은 현행 규칙이 아니다.

### 이관 원문 — PROJECT-STRUCTURE.md / 1

출처: [docs/architecture/PROJECT-STRUCTURE.md](../reference/engineering/architecture.md#project-structure--프로젝트-구조). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

#### 프로젝트 구조

2026-10-21 구조 개편 기준. [실행 계획과 결과](../records/archive/project-restructuring.md#project-restructuring--중형-프로젝트-구조-개편-제안), [파일 이동표](../records/archive/project-restructuring.md#restructuring-map--구조-개편-이동표와-의존-규칙), [검사 실행 방법](../how-to/verify.md#testing--개발-검사와-로컬-자산-준비)을 함께 사용한다.

### 이관 원문 — PROJECT-STRUCTURE.md / 2

출처: [docs/architecture/PROJECT-STRUCTURE.md](../reference/engineering/architecture.md#project-structure--프로젝트-구조). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 책임과 진입점

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

### 이관 원문 — PROJECT-STRUCTURE.md / 3

출처: [docs/architecture/PROJECT-STRUCTURE.md](../reference/engineering/architecture.md#project-structure--프로젝트-구조). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 의존 규칙

제작기와 연습실은 서로 import하지 않는다. 앱은 공통 모듈을 조립하며, 재생 화면의 소유자는 `playback-screen.ts` 하나다. 분리한 BPM 모듈과 `playback-settings.ts`의 음량·보기·사용자 설정 바인딩은 같은 host와 이벤트 등록·해제 경로를 사용한다. 설정 모듈이 별도 화면 상태나 저장소를 만들지 않는다.

섹션·반복 구간 버튼판의 콘텐츠는 `playback-shell.ts`가 `playback-panel-content` 클래스로 연결한다. 호스트가 전달한 태그(`section`/`div`)에 레이아웃을 의존하지 않는다. 제작기 PDF 검수도 공통 dock의 3행·높이 배분 규칙을 따르며, 비교 캔버스는 렌더러의 최소 높이 220px을 확보한다.

악보 목록 구성은 `modules/library/score-catalog.ts`가 소유한다. 저장 자료와 번들 카탈로그를 ID로 합쳐 기본 연습곡·내 악보·음원으로 분류하고 기본 연습곡 순서와 구획 제목/구조를 공유한다. 연습실과 제작기 홈은 이 결과를 사용하며, 제작기는 음원 전용 항목을 제외한다. 저장된 악보는 수정본을 사용하고, 미저장 번들은 제작기에서 다운로드·패키지 검증·저장 후 편집한다. DB 이름·스키마·저장 형식은 바꾸지 않는다.

model은 앱·UI·저장 구현에 의존하지 않는다. 기존 오류 문구를 위한 i18n 의존만 유지한다. shared는 음악 기능 모듈을 참조하지 않는다. 모듈별 named export를 직접 사용하며 전체를 모은 barrel을 추가하지 않는다.

모듈 간 기존 협력 경로는 [이동표의 경계](../records/archive/project-restructuring.md#restructuring-map--경계)에 명시한다. 저장 계층이 필요한 순수 악보·미디어 계약을 사용하는 기존 관계는 유지한다. 모든 계층을 새 추상화로 재작성한 구조는 아니다.

### 이관 원문 — PROJECT-STRUCTURE.md / 4

출처: [docs/architecture/PROJECT-STRUCTURE.md](../reference/engineering/architecture.md#project-structure--프로젝트-구조). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 호환성과 스타일

DB 이름·버전·저장 키, bytes-v1 직렬화, `.drumscore`, snapshot·큐·트랜잭션을 유지했다. `RecordData`와 `AudioBarOne`은 자료형 선언만 model로 이동하고 기존 모듈의 type 재수출을 남겼다. 저장 데이터 마이그레이션은 없다.

기능 CSS는 해당 모듈 가까이에 둔다. 두 큰 CSS는 기존 순서대로 조각을 import한다. 원문과 조각 결합의 바이트 동일성을 확인했으며, 선택자와 규칙의 우선순위를 재설계하지 않았다.

`hosting`, `server`, `deployment`의 운영 역할은 유지한다. 배포 사본은 직접 수정하지 않는다. 공개 배포 대상은 계속 `dist/player`이며 제작기는 로컬 전용이다.

### 이관 원문 — PROJECT-STRUCTURE.md / 5

출처: [docs/architecture/PROJECT-STRUCTURE.md](../reference/engineering/architecture.md#project-structure--프로젝트-구조). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 검사 누락 방지

`scripts/checks/source-files.mjs`가 src 전체를 재귀 탐색한다. 공통 UI, i18n, 재생 소유권, app/model/shared 경계를 검사하며 두 앱 빌드 뒤 player 번들의 제작 기능 유입을 차단한다.

기존 121개 테스트 파일은 unit·integration·local-media로 분류했다. 로컬 미디어가 없으면 필요한 검사가 실패하며 조용히 건너뛰지 않는다. 자세한 자산 목록과 실행 조건은 [검사 문서](../how-to/verify.md#testing--개발-검사와-로컬-자산-준비)를 따른다.

개발·테스트 진입점은 `npm run generate`로 생성 파일을 준비한다. 기본 `build`는 두 앱 분리 빌드이며, 앱·도구·hosting의 타입 환경은 각각 검사한다. Git에 기록할 파일을 대상으로 서식·문서 링크를 검사하고, `verify:portable`은 원본 미디어 없는 CI에서도 실행한다. [품질 보완 계획과 결과](../records/archive/project-quality.md#project-quality--프로젝트-품질-보완--2026-10-21)에 검증 범위를 기록한다.

목록 카드와 즐겨찾기/제목 순서 표시는 `modules/library/library-presentation.ts`, 두 홈 화면의 크기·간격은 `modules/library/player-library.css`를 공유한다. 동작 버튼은 각 앱이 제공한다. 공통 색상 변수는 `shared/styles/controls.css`, 제작기의 오렌지 팔레트는 `apps/editor/styles/07-theme.css`에 정의한다.

제작기의 ‘내 악보 목록’은 재생 중지·현재 기록 저장·재생 자원 해제 후 공통 홈으로 돌아간다. 별도 목록 모달은 제거했다. 삭제는 홈 카드, 전체 백업/복원은 설정의 악보 영역 안 `library-backup`, 패키지 가져오기는 새 곡 준비 창을 사용한다. 전체 백업은 곡을 열지 않아도 접근할 수 있으며, 숨겨진 구형 개별 곡 도구(`backup-dialog`)와 분리한다.

목록 상단바는 `library-header-actions` 안에 주 작업(`library-import`), 앱 전환(`library-app-link`), 공통 컨트롤(`library-common-actions`)을 배치한다. 제작기도 기존 새로고침·설정·도움말 컨트롤을 사용하며 공방 예약만 연습실에 둔다. 모양·간격은 공통 목록 CSS, 색상은 앱별 변수로 결정한다.


### Rule 재점검 원문 — PROJECT-STRUCTURE.md / 2

출처: [docs/architecture/PROJECT-STRUCTURE.md](../reference/engineering/architecture.md#project-structure--프로젝트-구조). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> DB 이름·버전·저장 키, bytes-v1 직렬화, `.drumscore`, snapshot·큐·트랜잭션을 유지한다. `RecordData`와 `AudioBarOne`은 자료형 선언만 model로 이동하고 기존 모듈의 type 재수출을 남겼다. 저장 데이터 마이그레이션은 없다.


### Rule 재점검 원문 — PROJECT-STRUCTURE.md / 3

출처: [docs/architecture/PROJECT-STRUCTURE.md](../reference/engineering/architecture.md#project-structure--프로젝트-구조). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> 기능 CSS는 해당 모듈 가까이에 둔다. 두 큰 CSS는 기존 순서대로 조각을 import한다. CSS 분리 시 원문 결합 순서·선택자·규칙 우선순위를 유지한다. 당시 바이트 대조 결과는 ADR의 이관 원문에 둔다.
