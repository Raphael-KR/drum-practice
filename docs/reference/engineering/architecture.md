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
| `src/apps/editor/editor-file-transfer.ts` | `.drumscore` 패키지 입출력 이벤트; 저장·편집 세션은 main의 host 사용 |
| `src/apps/editor/editor-import.ts`·`editor-score-files.ts` | 새 곡 가져오기·악보 교체/내보내기·보컬 파일 입력; 현재 기록과 busy 상태는 host에서 읽음 |
| `src/apps/editor/editor-record-preparation.ts`·`editor-management-actions.ts` | 기존 기록 검증/준비 순서와 보관함 입출력 콜백; 활성 기록·저장 큐·미디어 교체 책임은 main에 유지 |
| `src/apps/editor/editor-original-view.ts`·`editor-sections.ts` | 원본 악보 페이지 보기와 섹션 편집 연결; 현재 기록·편집 이력·저장 큐·재생 자산은 main의 host 사용 |
| `src/apps/player/player-app.ts` | 연습실 조립, 목록·가져오기·재생 진입 |
| `src/modules/playback/` | 두 앱이 공유하는 재생 화면·제어·구간·마커·BPM |
| `src/modules/audio/` | 음원 분석·변환·파형·첫 박 조정 |
| `src/modules/score/` | MusicXML·악보 렌더링·캐시 |
| `src/modules/lyrics/` | 가사 배치·타이밍·보정 |
| `src/modules/library/` | 패키지·가져오기·목록 정책 |
| `src/modules/help/` | 음악 화면의 도움말 내용 |
| `src/model/` | 공통 자료형과 박 시각·편집 규칙 |
| `src/platform/storage/` | IndexedDB·설정·직렬화·캐시 |
| `src/platform/browser/` | 브라우저 다운로드·전체화면·공통 SHA-256 등 |
| `src/shared/` | 도메인 규칙 없는 UI·스타일·번역 |
| `src/content/` | 수록곡 목록·녹음 분석 메타정보·기존 호환 자료 |
| `src/generated/` | 생성하는 라이선스·빌드번호; Git 제외 |
| `config/shared-catalog.yaml` | 중앙 의존성 버전 목록의 Git 사본; CI·설치 입력 |
| `scripts/{build,checks,dependencies,release}/` | 제품 빌드·검사·의존성 동기화·릴리스 도구 |
| `tools/` | 악보 제작·벤치마크·Apple 로컬 보조 도구 |
| `exports/` | 보존된 범례 SVG·과거 화면 검수 자료. [자료 안내](../../../exports/README.md)를 따르며 빌드/임시 출력 위치로 사용하지 않음 |

HTML 주소는 `index.html`, `editor.html`, `player.html`을 유지한다. `src/app-versions.json`이 버전 정본이다. 독립 HTML 내보내기는 추가하지 않는다.

<a id="project-structure--의존-규칙"></a>

### 의존 규칙

개발 패키지는 pnpm workspace로 관리한다. 중앙 버전 정본은 사용자 공통 YAML `/Users/raphael/Library/Preferences/pnpm/shared-catalog.yaml`이며 프로젝트의 `config/shared-catalog.yaml`은 검증·Git 기록용 사본이다. 루트 앱과 `hosting`은 `pnpm-workspace.yaml`이 include한 사본의 정확한 `catalog` 버전을 참조한다. 실제 그래프는 `pnpm-lock.yaml` 하나에 기록한다. 일반 설치·CI·Sites 준비는 사본과 잠금 파일만 읽고 개인 중앙 파일에 의존하지 않는다. 프로젝트별 override·설치 정책은 workspace에 둔다.

pnpm 사용자 공통 저장소의 파일을 공유하고 프로젝트에는 필요한 연결을 구성한다. 보안 수정과 일반 업데이트는 중앙 목록 갱신·사본 및 lockfile 동기화·호환성 수정·검증을 함께 수행한다. 과거 검증 버전에 장기간 고정하는 운영으로 사용하지 않는다. 다른 저장소의 전환은 별도 범위이며 실행 방법은 [개발 절차](../../how-to/develop.md#공유-의존성과-중앙-버전-갱신), 선택 이유는 [ADR-0028](../../decisions/0028-shared-dependency-store-and-catalog.md)을 따른다.

제작기와 연습실은 서로 import하지 않는다. 앱은 공통 모듈을 조립하며, 재생 화면의 소유자는 `playback-screen.ts` 하나다. 분리한 BPM 모듈과 `playback-settings.ts`의 음량·보기·사용자 설정 바인딩은 같은 host와 이벤트 등록·해제 경로를 사용한다. 설정 모듈이 별도 화면 상태나 저장소를 만들지 않는다. 제작기의 마디 탐색도 공통 진행률 숫자와 악보 제스처를 사용한다. 제작기 전용 `afterFrame`은 편집창의 현재 시각(`editor-time`)만 갱신한다.

`playback-track.ts`는 마디 위치·폭·가사 배치와 두 줄 보기의 배치 상태를, `playback-display.ts`는 제목·BPM·설정 표시 및 폰 가로 표시 모드 동기화를 맡는다. `playback-navigation.ts`는 제스처·휠·스크롤·숫자 드래그·키보드·문서 이벤트를 연결한다. 세 모듈은 `playback-screen.ts`가 화면당 한 번 생성한다. 선택·스크럽·반복 구간·재생 상태와 리스너 해제 목록은 화면 소유자에 남기고, 변경되는 상태는 getter/setter로 읽고 쓴다. navigation은 제스처 등록 → 화면의 반복 구간 연결 → 나머지 입력 등록 순서를 유지하며 해제 함수를 화면의 공통 목록에 추가한다. 배치 무효화·프레임 요청·종료 여부는 콜백으로 연결하고, host 앱은 이 내부 모듈을 따로 생성하지 않는다.

MusicXML 조판의 공개 진입점은 `musicxml.ts`다. 입력 읽기/검증은 `musicxml-parse.ts`, 엔진 설정과 조판 훅은 `musicxml-engine.ts`, 공통 기호 표시 처리는 `musicxml-glyphs.ts`, SVG 경계·마디/박 좌표 추출은 `musicxml-geometry.ts`가 맡는다. 입력 → 엔진 → 기호 표시 → 경계 확정 → 글꼴 내장/압축 → 좌표 추출 순서를 유지한다. 다중 조판 pass·캐시·임시 host 해제는 진입점에 남기며, 기존 parse/read/type/interpolate export 경로를 유지한다. 출력 규칙은 [조판 정본](../score/rendering.md#browser-musicxml-rendering--구현-경계)을 따른다.

SVG 전체 보기의 표준 음절 가사는 `musicxml-engine.ts`에서 켠 OSMD 기본 기능으로 출력한다. `full-score-lyrics.ts`는 구형 v1의 읽기용 변환과 시간 없는 마디 문구의 native 라벨을 담당한다. 이미 파싱한 문서의 manifest를 재사용하고, 마디 문구가 없으면 추가 배치·그리기 훅을 등록하지 않는다. `canonical-lyric-voice.ts`는 새 정본 작성과 구형 전체 보기의 읽기용 전환을 공유하며, 성부 소유권 판별은 `canonical-metadata.ts`의 v1/v2 계약을 사용한다.

`full-score-view.ts`는 두 앱의 지연 준비·연속 SVG 표시를 공유하고, `full-score-layout.ts`는 원본 줄 구성 위에 일정한 오선 간격과 제목 아래 기본 BPM·가수를 배치한다. 전체 보기의 간격은 연주용 pass로 전달하지 않으며 별도 정책 키로 공통 파생 캐시를 사용한다. 제작기의 미저장 가사 반영만 기존 정본 작성 함수를 사용하고 재생앱에는 제작 의존성을 추가하지 않는다. 배치·마디 문구·글꼴·배율 계약은 [전체 보기 규칙](../score/rendering.md#svg-score-rules--2-전체-페이지-생성)을 따른다.

제작기 입력 모듈은 mount 시점의 기록을 복사하지 않고 host getter로 현재 기록을 읽는다. 기존 정본 검증·구형 기록 이관·저장·음원/자산 교체 순서를 유지하며, 보관함 복원 시 재생 중지·저장 타이머 해제·편집 세션 초기화는 main의 `beforeRestore` 콜백으로 실행한다. 모듈 분리는 기존 호환 경로를 늘리거나 곡별 예외를 추가하는 근거가 아니다.

`score-management.ts`는 파일 작업 버튼을 곡 정보의 연결 영역과 내보내기 영역에 직접 만든다. 임시 파일 팝업에서 옮기거나 표시명을 나중에 덮어쓰지 않는다. DOM 조회는 제작기 공통 `editor-dom.ts`를 사용하며, 버튼 ID·접근성 연결·파일 처리 콜백은 유지한다. UI 카탈로그에는 실제 화면에 남는 컴포넌트만 등록한다.

`editor-original-view.ts`는 원본 페이지 번호·표시 URL과 넘김 버튼을 소유하고, 열 때마다 현재 기록과 선택 마디를 읽는다. `editor-sections.ts`는 섹션 편집기 mount·적용·되돌리기 후 좌표 갱신을 연결한다. 비동기 준비 후 활성 기록/정본 변경 확인, 자산 교체, 편집 이력 및 저장 순서를 유지한다. 두 모듈은 main의 기존 조립 위치에서 한 번 연결하며 별도 편집 세션이나 저장 상태를 만들지 않는다.

`playback-forms.ts`는 공통 폼 HTML과 설정 카드 생성을 담당한다. 설정 카드 선택·스크롤·폰 가로 배치는 `playback-settings-layout.ts`, 메트로놈·선택 버튼의 상태 동기화와 입력 바인딩은 `playback-settings.ts`가 담당한다. 두 앱은 각 기능의 담당 모듈을 직접 사용한다. 재생바의 진행 위치는 `progressFieldHTML()`을 직접 사용하고, 반복 구간 콘텐츠는 기존 `loopExtra` 슬롯으로 전달한다. 빈 HTML 함수나 사용하지 않는 버튼 ID를 중간 인터페이스에 두지 않는다.

재생 BPM 표시의 박 그리드는 화면 소유의 임시 스냅샷이다. Song/BPM/마디 배열/정본 XML 교체와 설정 동기화·track 재배치에서 다시 계산하며, 동일 객체 안의 박 시각 편집도 host의 sync/renderTrack 경로를 사용한다. 전역 Song 캐시나 저장 데이터로 확장하지 않는다. 오디오 클릭 예약 목록은 audio-core의 재생 cycle과 수명을 공유한다. 25ms 예약 확인은 다음 이벤트 위치만 진행하고, seek·배속·새 반복 cycle은 새 목록을 만들며 종료/pause/load에서는 해제한다. 예약 간격과 count-off/강세·원곡/연습 시간 변환은 유지한다.

재생 자산 준비는 SVG 페이지당 하나의 소유 문서를 사용한다. 강조 추출 후 연습용 보정을 적용하고 같은 문서를 안전 검사·크기 계산에 빌려준다. 검사는 내장 글꼴을 잠시 제외해 조사한 뒤 복원하며 외부 참조 차단을 유지한다. 디코딩된 SVG Blob은 불변이므로 복사하지 않지만, PNG 등 raster는 Safari의 구형 IndexedDB Blob URL 호환을 위해 기존 바이트 materialization을 유지한다. 큰 타임라인 메타데이터의 디코딩 사본과 임시 DOM은 준비 후 참조를 놓으며, 전역 비압축 캐시는 추가하지 않는다. 원본/저장 페이지·URL의 수명·자산 교체/실패 시 해제 계약은 유지한다.

섹션·반복 구간 버튼판의 콘텐츠는 `playback-shell.ts`가 `playback-panel-content` 클래스로 연결한다. 호스트가 전달한 태그(`section`/`div`)에 레이아웃을 의존하지 않는다. 제작기 PDF 검수도 공통 dock의 3행·높이 배분 규칙을 따르며, 비교 캔버스는 렌더러의 최소 높이 220px을 확보한다.

악보 목록 구성은 `modules/library/score-catalog.ts`가 소유한다. 저장 자료와 번들 카탈로그를 ID로 합쳐 기본 연습곡·내 악보·음원으로 분류하고 기본 연습곡 순서와 구획 제목/구조를 공유한다. 연습실과 제작기 홈은 이 결과를 사용하며, 제작기는 음원 전용 항목을 제외한다. 저장된 악보는 수정본을 사용하고, 미저장 번들은 제작기에서 다운로드·패키지 검증·저장 후 편집한다. DB 이름·스키마·저장 형식은 바꾸지 않는다.

model은 앱·UI·저장 구현에 의존하지 않는다. 기존 오류 문구를 위한 i18n 의존만 유지한다. shared는 음악 기능 모듈을 참조하지 않는다. 모듈별 named export를 직접 사용하며 전체를 모은 barrel을 추가하지 않는다.

저장 계층은 model과 직렬화에 필요한 순수 악보·미디어 계약을 사용하고, library는 저장 정책을 호출한다. playback은 audio·score·lyrics·library·help를 조합한다. audio와 score는 model·저장 캐시·공통 UI를, lyrics는 model·content를 사용한다. content의 기존 score·lyrics 참조는 호환 자료를 읽는 범위에서 유지하며 새 순환 의존을 만들지 않는다. 이 경로는 새 곡별 보정의 허용 근거가 아니다. MusicXML 오류·누락은 [정본과 앱의 수정 책임](../score/musicxml.md#musicxml-canonical--정본과-앱의-수정-책임)에 따라 정본에서 고친다. help는 음악 화면의 도움말을 소유하고 shared/ui의 공통 표시 도구를 사용한다. 구조 개편 당시의 이동표는 [구조 개편 기록](../../records/archive/project-restructuring.md#restructuring-map--경계)에 보존한다.

<a id="project-structure--호환성과-스타일"></a>

### 호환성과 스타일

DB 이름·버전·저장 키, bytes-v1 직렬화, `.drumscore`, snapshot·큐·트랜잭션을 유지한다. `RecordData`와 `AudioBarOne`의 자료형 선언은 model에 두고 기존 모듈의 type 재수출을 유지한다. 이 구조에 따른 저장 데이터 마이그레이션을 요구하지 않는다. 새 설정에는 사용하지 않는 `countEach`를 생성하지 않지만, 기존 자료의 해당 속성은 구조 복제와 직렬화에서 그대로 보존한다. `countIn`의 기존 저장 검증 계약도 유지하며, 실제 카운트오프는 앱의 재생 선호 설정을 따른다.

지정된 폐기 악보의 존재 검사는 `songs`의 `song.id` 키로 해당 ID만 조회한다. 위치 자동 저장마다 무관한 음원·페이지 레코드 전체를 순회하지 않는다. 기존 16마디 판정·오류 처리·양쪽 DB의 폐기 정책과 원자적 저장은 유지한다.

기능 CSS는 해당 모듈 가까이에 둔다. `modules/playback/playback-ui.css`와 `apps/editor/style.css`는 기존 순서대로 조각을 import한다. CSS 분리 시 원문 결합 순서·선택자·규칙 우선순위를 유지한다.

중복 선언은 같은 파일뿐 아니라 한 진입점에서 항상 함께 읽는 CSS 조각 사이도 확인한다. 같은 조건·선택자에서 뒤의 선언이 덮는 값부터 정리하되 중간의 경쟁 선언·축약/개별 속성·import 순서를 보존한다. 지원 브라우저에서 뒤의 값이 유효하지 않을 때 쓰는 대체값은 남긴다. 제작기 `.pagebox`의 고정 높이 제한은 `dvh` 미지원 시에 사용하는 기존 대체값이다. 파일 길이를 줄이기 위해 조건이나 적용 우선순위를 바꾸지 않는다.

미사용 선택자는 현재 마크업·DOM 조작·동적 클래스와 번들 SVG까지 확인한 뒤 제거한다. 사용 중인 선택자와 묶인 규칙에서는 미사용 분기만 제거한다. `asset-${key}`로 조립하는 자산 유형과 범례 SVG 내부 클래스는 실제 사용 경로이며, 단순 문자열 검색 결과만으로 삭제하지 않는다.

`playback/styles/06-responsive.css`는 기존 import 위치를 보존하는 순서 명세다. 영역 → 악보 리더 → 컨트롤 상태 → 폰 세로 → 간소 설정 → 반응형 dock → 대화상자 → 악보 전용 보기 순서로 불러온다. 상세 규칙은 각 이름의 CSS 파일에서 수정하고, 악보 리더 스타일은 `score/score-reader.css`에 둔다. `playback-settings-compact.css`의 공통 BPM 기준 버튼 규칙은 폰 전용 media query 밖에 유지한다.

### 공통 구현 재사용과 정리 기준

- 동작 아이콘의 도형은 `shared/ui/icon-svg.ts`, 버튼 조립은 `shared/ui/icon-button.ts`를 사용한다. `shared/ui/icons.ts`는 제작기 DOM에 아이콘을 연결하며 기존 `icon` export를 재수출한다. 기능 모듈에 SVG 경로·아이콘 버튼 마크업을 복사하지 않는다. 악보·파형 SVG와 동작 아이콘은 구분한다.
- 음원 식별·분석 캐시·렌더 캐시·정본 검증의 SHA-256은 `platform/browser/sha256.ts`를 사용한다. 입력 바이트 준비·캐시 키 직렬화·Blob별 Promise 캐시·저장/오류 처리는 호출 경계에 유지한다. 공통 결과는 기존과 같은 소문자 16진수 64자리이며 저장 형식이나 캐시 정책을 바꾸지 않는다.
- 브라우저에서 실행하는 제작 도구 `tools/score-production/musicxml/common/package.mjs`도 위 해시와 `platform/storage/binary-asset.ts`의 Base64 인코더를 재사용한다. 기존 `sha`·`base64` API와 문자열 반환 형식은 유지한다. Node 전용 파일 해시 처리는 실행 환경이 달라 이 경로에 합치지 않는다.
- 고정 표시 속성은 소유 컴포넌트 CSS에 둔다. 가사의 긴 문구 스타일은 `lyrics/score-lyrics.css`, 파형 마디의 기본 높이는 두 앱이 읽는 공통 재생 CSS에 둔다. 실행 중 계산하는 위치·폭·비율·SVG 좌표는 기존 동적 스타일을 유지한다. 브라우저별 range 의사 요소나 서로 다른 반응형 조건을 단순 중복으로 합치지 않는다.
- 파일·함수의 크기는 책임 혼재를 찾는 신호로 사용한다. 상태 수명·이벤트 등록/해제·비동기 저장 순서를 먼저 확인하며, 줄 수만 맞추는 전달 모듈이나 전역 상태를 만들지 않는다. 옮긴 코드의 주석은 실제 소유 위치와 적용 이유를 설명하고 빈 구획·과거 위치 설명을 남기지 않는다.
- 미사용 API는 앱 진입점·동적 호출·저장 읽기 계약을 함께 확인한다. 폐기된 UI만 지원하던 함수는 제거하고, 기존 검사의 유효한 저장·경계 검증은 현재 API로 옮긴다. 현재 기능의 시험 정리용 API까지 테스트에서만 호출한다는 이유로 삭제하지 않는다. [2026-11-10 정리 기록](../../records/code-maintenance.md#usage-compatibility-cleanup-20261110)에 제거한 경로와 보존한 호환성 계약을 구분했다.

아이콘 SVG 조립·화면 전환·한국어 로케일과 빌드/라이선스 생성기의 내부 구현은 외부로 export하지 않는다. 현재 호출 함수와 CLI 진입점은 유지한다. Python 제작 도구의 XML `Resolver`는 `common/musicxml.py`에서 직접 가져오며 개별 곡 검증 CLI를 경유하지 않는다. [사용처 재점검 기록](../../records/code-maintenance.md#usage-source-audit-20261110)에 제거한 잔재와 보존 근거를 기록했다.

`hosting`, `server`, `deployment`는 DB 없는 보안 헤더 Worker와 player 자산 전달에 사용한다. 과거 SQL·스냅샷은 `docs/records/archive/server-analysis-migrations/`에 보존하며 활성 배포 입력과 분리한다. 배포 사본은 직접 수정하지 않는다. 공개 배포 대상은 계속 `dist/player`이며 제작기는 로컬 전용이다.

<a id="project-structure--검사-누락-방지"></a>

### 검사 누락 방지

`scripts/checks/source-files.mjs`가 src 전체를 재귀 탐색한다. 공통 UI, i18n, 재생 소유권, app/model/shared 경계를 검사하며 두 앱 빌드 뒤 player 번들의 제작 기능 유입을 차단한다.

공통 컴포넌트 검사는 src TypeScript와 위 브라우저 제작 도구를 대상으로 SHA-256·Base64 직접 계산과 동작 아이콘 경로 조립이 각각의 공통 구현 안에 있는지도 확인한다. 함수 중복 후보와 호출 목록은 [명시적 수동 감사](../../how-to/verify.md#testing--공통-검사와-ci)에서만 생성한다. 최소 토큰 수를 쓰므로 후보 0개가 작은 마크업·CSS 중복까지 없다는 뜻은 아니다. 해당 부분은 선택자·조건·적용 순서와 실제 호출부를 함께 검토한다.

테스트는 unit·integration·local-media로 구분한다. 가사 교정 회귀검사 6개는 `tests/local-media/lyric-feedback-fixture.ts`에서 실제 demo의 교정 전 자료를 준비한다. 각 revision과 기대값·검증 본문은 개별 검사에 유지하며 앱의 저장/이관 코드와 합치지 않는다. 로컬 미디어가 없으면 필요한 검사가 실패하며 조용히 건너뛰지 않는다. 자세한 자산 목록과 실행 조건은 [검사 문서](../../how-to/verify.md#testing--개발-검사와-로컬-자산-준비)를 따른다.

제작기 편집 UI 검사는 실제 설정의 악보 편집 타일(`score-edit-entry`)로 창을 열고 `score-workspace-tabs`의 곡 정보·가사 탭을 선택한다. 목록 검사는 상단의 `library-button`으로 진입한다. 저장·임시저장·편집 이력 검증 본문은 유지하며, 숨겨진 구형 버튼을 직접 클릭하는 경로로 대신하지 않는다. 설정의 `score-open-library`는 현재 `welcome-library`를 대리 호출하므로 해당 제품 연결은 유지한다.

개발·테스트 진입점은 `pnpm run generate`로 생성 파일을 준비한다. 기본 `build`는 두 앱 분리 빌드이며, 앱·도구·hosting의 타입 환경은 각각 검사한다. Git에 기록할 파일을 대상으로 서식·문서 링크를 검사하고, `verify:portable`은 원본 미디어 없는 CI에서도 실행한다. 검증 범위·기록 항목은 [검증 Rule](verification.md)을 따르며 새 실행 결과는 `history.md`와 [해당 주제의 기록](../../records/README.md#주제별-기록)에 남긴다.

목록 카드와 즐겨찾기/제목 순서 표시는 `modules/library/library-presentation.ts`, 두 홈 화면의 크기·간격은 `modules/library/player-library.css`를 공유한다. 동작 버튼은 각 앱이 제공한다. 공통 색상 변수는 `shared/styles/controls.css`, 제작기의 오렌지 팔레트는 `apps/editor/styles/07-theme.css`에 정의한다.

제작기의 ‘내 악보 목록’은 재생 중지·현재 기록 저장·재생 자원 해제 후 공통 홈으로 돌아간다. 별도 목록 모달은 제공하지 않는다. `editor-library.ts`의 홈 카드가 저장 곡을 열고, 저장되지 않은 수록 곡은 패키지를 내려받아 같은 준비·편집 경로로 연결한다. 삭제는 홈 카드, 전체 백업/복원은 설정의 악보 영역 안 `library-backup`, 패키지 가져오기는 새 곡 준비 창을 사용한다. 전체 백업은 곡을 열지 않아도 접근할 수 있다. 구형 개별 ZIP 생성·복원과 숨겨진 백업 도구는 제공하지 않는다. 악보 교체는 `file-xml`과 검수의 추가 버튼에서 공통 교체 함수를 직접 호출하며, 새 악보 입력은 `editor-import.ts`가 단독으로 처리한다.

목록 상단바는 `library-header-actions` 안에 주 작업(`library-import`), 앱 전환(`library-app-link`), 공통 컨트롤(`library-common-actions`)을 배치한다. 제작기도 기존 새로고침·설정·도움말 컨트롤을 사용하며 공방 예약만 연습실에 둔다. 모양·간격은 공통 목록 CSS, 색상은 앱별 변수로 결정한다.

<a id="코드가-읽는-화면-소유권-표"></a>

## 화면 소유권 참고표

[P01–P25·E01–E06 표](../../plans/PLAYBACK-SCREEN-INVENTORY.md)는 화면 분리 설계와 기존 참조를 보존하는 참고표다. 2026-11-11부터 검사 코드가 고정 ID 31개의 존재를 읽지 않는다. 실제 호출 소유권은 `check-playback-architecture.mjs`, 앱 의존 경계는 `check-source-boundaries.mjs`가 검사한다. 표를 복제하거나 행 개수를 제품 검증 기준으로 사용하지 않는다.

[생성 UI 참조](../../product/UI-COMPONENTS.md), [범례 자산](../../design/legend-diagram/README.md), [글꼴 배치](../../../src/modules/score/vendor/pretendard/README.md)도 생성·배치 경로를 유지한다.
