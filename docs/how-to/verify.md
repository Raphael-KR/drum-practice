# 코드와 화면 검증

문서 역할: **실행 절차**. 현재 요청과 전역·프로젝트 지침의 승인 범위 안에서 수행한다. [정본 목록](../RULES-INDEX.md)과 [작업별 안내](../README.md)를 먼저 확인한다. 예시 명령·과거 기록은 이번 실행의 성공 증거가 아니다.

<a id="testing--개발-검사와-로컬-자산-준비"></a>

## 개발 검사와 로컬 자산 준비

문서 역할: **실행 절차**. 요구·허가 경계·판정 기준은 [검증 Rule](../reference/engineering/verification.md#verification-rules--검증-범위와-증거), 항목별 목적·실행 조건·명령·환경·부수 효과·재사용 입력은 [검사 카탈로그](../reference/engineering/check-catalog.md), 당시 도입·검증 결과는 [ADR-0027](../decisions/0027-verification-scope-and-device-evidence.md)에 둔다.

<a id="testing--실행-범위"></a>

### 실행 범위

모든 명령은 프로젝트 루트에서 실행한다. [작업 전 환경 확인](develop.md#development--작업-전-조회와-실행-환경)을 거쳐 `.nvmrc`의 기본 Node.js 22 LTS(22.22.2 이상) 또는 `package.json`의 `engines`를 만족하는 검증된 기존 환경과 지정 pnpm·설치 의존성을 재사용한다. 실제 환경은 결과에 기록한다. 최초 준비나 의존성 변경으로 설치가 필요할 때 `pnpm install --frozen-lockfile`을 사용한다. Vitest는 이 저장소의 `tests/{unit,integration,local-media}`만 검사한다. 별도 checkout·배포 사본·기타 프로젝트는 포함하지 않는다.

`test:portable`은 로컬 악보 없이 unit/integration을, `test:local-media`는 보존된 실제 자료의 회귀를, `test:drum`은 둘을 모두 검사한다. 모두 `pnpm run`으로 실행하며, 실제 자료가 없으면 명시적으로 실패한다. 테스트·Python 보조 도구·브라우저 검사는 카탈로그의 조건과 현재 허가를 확인한 뒤 선택한다.

`pretest`, `pretest:drum`, `pretest:portable`, `pretest:local-media`가 라이선스와 빌드번호를 생성한다. `pnpm exec vitest`를 직접 사용할 때는 생성 파일이 현재 입력에 맞는지 확인하고, 준비되지 않았다면 `pnpm run pretest`를 실행한다. 앱/테스트 타입 검사는 `pretypecheck:app`이 생성 파일을 준비한다. 도구·hosting 타입 검사는 이 생성 파일에 의존하지 않는다.

<a id="testing--공통-검사와-ci"></a>

### 공통 검사와 CI

웹앱 개발 중에는 [변경 영향과 검사 선택](../reference/engineering/verification.md#verification-rules--변경-영향과-검사-선택)에 따라 필요한 정적 검사부터 실행한다. 코드 릴리스에는 공통 필수 자동검증을 적용하고, 화면·기능·성능·악보/제작 도구 검사는 [카탈로그의 실행 조건](../reference/engineering/check-catalog.md#변경-영향별-선택-검사)에 맞춰 추가한다. 문서만 바뀌면 문서·링크·앵커·diff와 보존 확인으로 한정한다. 별도 사용자 요청과 [실행 범위·허가 경계](../reference/engineering/verification.md#verification-rules--범위와-필수-경계)를 따른다.

실행 전에 기존 작업·릴리스 기록에 대상과 `실행/결과 재사용/비대상/보류`, 이유·환경·부수 효과를 적는다. 같은 입력의 통과 결과는 [재사용 기준](../reference/engineering/verification.md#verification-rules--결과-재사용)에 따라 연결한다. 결과를 재사용하려고 별도 환경이나 시험 자료를 만들지 않으며, 입력 동일성을 확인할 수 없으면 해당 검사를 다시 수행한다. 현재 요청이 정적 검사만 허용하면 동적 검증은 보류로 남긴다.

릴리스 검증 전 [검사 정리와 기준 변경](../reference/engineering/verification.md#verification-rules--검사-정리와-기준-변경)에 따라 영향받는 테스트·정적 검사·CI를 검토한다. 정당한 삭제·통합·축소는 관련 문서와 실행 경로에 함께 반영한 뒤 개정된 기준의 필수 검사를 수행한다. 검사 실패를 숨기는 생략과 구분해 정리 이유·유지 근거·검증 공백·실행 결과를 남긴다.

| 상황 | 실행 묶음 | 적용 기준 |
| --- | --- | --- |
| 문서·지침 변경 | `pnpm run check:docs`, `git diff --check` | 스킬 수정 시 해당 정적 검증 추가. 생성·테스트·빌드 없음 |
| 코드의 전체 정적 검사가 필요한 개발 | `pnpm run check` | lint·서식·앱/도구/hosting 타입·공유 JSZip·i18n·재생/공통 UI/소스 경계·문서 검사. 앱 타입의 생성 pre 단계 포함 |
| 코드 릴리스의 공통 자동검증 | `pnpm run verify` | `check` → `test:drum` → `bundle:apps`. 전체 Vitest와 두 앱 번들·player 경계 포함 |
| PR/main CI | `pnpm run verify:portable` | `check`와 unit/integration. local-media·두 앱 빌드의 대체 결과가 아님 |
| 앞선 검사가 유효한 main 발행 빌드 | `pnpm run generate` 후 `pnpm run bundle:apps` | [입력 대조·발행 순서](release.md#sites-publication--발행-순서)를 따른다. 단독 빌드 성공을 전체 검증으로 보고하지 않음 |

최초 준비 또는 의존성 변경 때의 frozen 설치, 생성 준비, 개별 명령과 보고서 쓰기는 [카탈로그](../reference/engineering/check-catalog.md)를 따른다. `verify` 성공 뒤 같은 후보에 `check`·`test:drum`·`build:apps`를 연속 실행하지 않는다. 독립 `build`/`build:apps`는 사전 검사를 포함하므로 전체 검증 뒤의 추가 단계로 사용하지 않는다. 카탈로그와 실제 package/pre 명령이 달라지면 실행 전에 확인하고 관련 문서를 갱신한다.

CI는 `pull_request`와 `main`의 `push`에서 실행한다. PR이 열린 작업 브랜치의 push와 PR 갱신에 같은 검사를 두 번 예약하지 않는다. PR 전 작업 브랜치의 push·태그 push는 자동 검사 대상이 아니며 필요한 로컬 검사는 `verify:portable`로 수행한다. PR의 병합 예정 코드와 병합된 main은 입력이 다르므로 두 검증은 유지한다.

정상 소스의 i18n·재생 소유권·공통 컴포넌트·소스 경계 검사는 `check`가 한 번 담당한다. 테스트에서는 같은 스크립트의 정상 통과를 재실행하지 않고 위반을 탐지하는 회귀와 실제 UI·저장 동작을 확인한다. `test:portable`·`test:drum`만 실행한 결과는 공통 정적 검사까지 통과한 결과가 아니다.

함수 중복 후보·호출 목록의 수동 감사는 [카탈로그](../reference/engineering/check-catalog.md#변경-영향별-선택-검사)의 조건에 해당할 때만 실행한다. 생성된 후보 수를 제품 통과 조건으로 사용하지 않는다.

CI의 `actions/checkout@v7`·`actions/setup-node@v7`·`pnpm/action-setup@v6`는 액션 자체를 Node 24로 실행한다. 프로젝트 검사에 사용하는 Node는 별도로 `.nvmrc`의 22 LTS를 따르며, pnpm 버전·frozen 설치·잠금 파일 기반 캐시·검사 명령은 기존 설정을 유지한다. 액션 런타임의 Node 20 폐기 경고를 없애려고 앱의 Node 버전을 바꾸거나 경고 억제 환경변수를 넣지 않는다.

Vite의 500kB 청크 경고는 현재 유지한다. 당장 수정하지 않는 이유와 재검토·개선 기준은 [번들 경고 기준](../reference/engineering/verification.md#verification-rules--유지하는-번들sqlite-경고)을 따른다. 실제 검사 실패와 안내 경고를 구분하며 경고 출력을 숨기지 않는다. 과거 폐기 SQL의 실행·지원 경로가 종료되어 [SQLite 회귀검사도 종료](../reference/engineering/verification.md#verification-rules--과거-폐기-sql-검사-종료)했다. 현재 브라우저 저장·백업·복원과 Worker 보안 검사는 유지한다.

<a id="testing--eslint"></a>

### ESLint

`eslint.config.mjs`의 flat config를 사용한다. ESLint 10과 typescript-eslint 8의 `recommended` 규칙을 JS·TS에 적용하며, 타입 정보를 사용하는 추가 규칙은 아직 켜지 않았다. 타입 검사는 TypeScript 7의 `tsc --noEmit`이 맡는다. 설정 방식은 [typescript-eslint 공식 안내](https://typescript-eslint.io/getting-started/)를 따른다.

TypeScript 7의 네이티브 컴파일러는 기존 JavaScript compiler API를 제공하지 않는다. `pnpm-workspace.yaml`은 typescript-eslint 8의 TypeScript peer를 공식 `@typescript/typescript6` API 패키지의 직접 의존성으로 교체한다. 프로젝트의 AST 검사·분석 도구도 같은 API 패키지를 명시적으로 import한다. 루트 `typescript`와 `tsc`는 7을 사용하며 API를 사용하는 도구는 6으로 분리한다. 검사 규칙·경고를 끄거나 지원 범위를 허위로 넓히지 않는다. [공식 병행 사용 안내](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)와 [pnpm peer → 직접 의존성 전환](https://pnpm.io/settings/dependency-resolution#overriding-peer-dependencies)을 따른다.

- `pnpm run lint`: 전체 검사. 오류 또는 경고가 있으면 실패한다.
- `pnpm run lint:fix`: 자동 수정 가능한 항목을 수정한 뒤 같은 기준으로 검사한다. 실행 후 diff를 검토한다.
- 범위: 두 앱의 `src/`, `tests/`, `server/`, `scripts/`, JS 제작 도구, `hosting/`와 루트 설정 파일. 생성 파일·외부 의존성·미디어·배포 사본·실험 출력은 제외한다. HTML 내부 스크립트와 Python은 이 검사 대상이 아니다.
- 환경: 앱은 browser, 서버·개발 도구는 Node.js, 테스트는 Node.js와 DOM이다. MusicXML 제작 도구는 `page.evaluate()` 콜백을 포함하므로 browser 전역도 허용한다.
- Prettier: 마지막에 `eslint-config-prettier`를 적용해 서식 규칙 충돌을 막는다. ESLint 명령이 Prettier를 실행하는 것은 아니다.
- 규칙: 미사용 변수, 명시적 `any`, 재할당 없는 `let`, 빈 블록 등을 권장 규칙 그대로 검사한다. 사용되지 않는 `eslint-disable`도 오류로 처리한다. 검사 설정 변경은 [필수 경계](../reference/engineering/verification.md#verification-rules--범위와-필수-경계)와 [기준 변경 절차](../reference/engineering/verification.md#verification-rules--검사-정리와-기준-변경)를 따른다.

빌드 명령은 lint를 자동 실행하지 않는다. 필요한 전체 공통 검사에는 `pnpm run check`를 사용하고, 직접 lint가 필요한 경우 `pnpm run lint`를 실행한다.

<a id="testing--로컬-자료"></a>

### 로컬 자료

원본 미디어는 Git에 넣거나 자동 다운로드하지 않는다. 기존 자료 보관처에서 아래 경로로 준비한다. `node scripts/checks/check-local-assets.mjs`는 누락 경로를 출력하고 실패한다. 존재 검사는 내용 검증을 대신하지 않는다.

| 위치 | 필요 자료 / 준비 경로 |
|---|---|
| `public/demo/` | `song.json`, `score.pdf`, `score.musicxml`, `audio.mp3`, song.pageCount에 해당하는 `page-N.png`. 기존 변환 회귀용 데모 묶음을 그대로 복사한다. |
| `public/scores/` | `src/content/bundled-scores.json`의 모든 `.drumscore`. 승인된 `data/production/<곡>/final/` 결과 또는 기존 로컬 배포용 자산을 복사한다. 새 악보를 임의 생성하지 않는다. |
| `data/reference/grid_verified.json` | 보존된 가사/박자 검수 입력. |
| `data/reference/test-fixtures/musicxml-candidate.musicxml` | 쉼표 보정 회귀 입력. |
| `data/reference/test-fixtures/tom-moving-28-portland.drumscore` | 구형 패키지 교체 호환 회귀 입력. |
| `data/reference/test-fixtures/ioi-suddenly-canonical-v1.musicxml` | 같은 보표 전환 전 갑자기 v1 정본. 보존된 `data/production/shared-staff-lyrics-20261110/ioi-suddenly/before.musicxml`의 바이트 사본이며 SHA256은 `8f3ad3a47aa4453dc19fb71a514761f0665d9a429327478712c352852de6eaaf`다. 구형 읽기/전환과 현행 v2 수록본의 반복 저장을 별도로 검사한다. |
| `data/reference/test-fixtures/red-sunset-wedge-native-20261024.json` | 실제 Safari/OSMD2.2.1의 붉은 노을113마디 인쇄·한 줄·두 줄·균등 조판 좌표. `data/production/red-sunset-crescendo-20261024/score.musicxml`(SHA256 `27cd2812c64eaa455399a7e8400e5feb4d26ffe06cdd6b5e233eb64bbebd1a68`)의 실측이며 생성한 합성 악보가 아니다. 기존 검증 자료에서 복사하며 측정 전후 근거는 `.tmp/wedge-endpoint-20261024/`다. |

player 빌드에는 위 카탈로그의 패키지와 Git에 있는 `public/icons/`가 필요하다. 로컬 미디어가 없는 환경은 portable 검사까지만 검증됐다고 보고한다. 패키지 회귀나 player 빌드를 통과했다고 보고하지 않는다.

<a id="testing--호환성과-검사-범위"></a>

### 호환성과 검사 범위

- DB 이름·버전·저장 키, bytes-v1, 구형 Blob 복원, 저장 전 snapshot·큐·원자적 트랜잭션은 storage/shared-score-library/record-serialization/editor-session 검사로 확인한다.
- `.drumscore` 읽기·쓰기와 제작기→연습실 전달은 score-package/app-separation/tom-moving-package-update 검사로 확인한다.
- 변경한 모듈의 책임·의존 경계는 [구조 Rule](../reference/engineering/architecture.md#project-structure--의존-규칙)과 대조한다. 이동 이력을 조사할 때만 [구조 개편 기록](../records/archive/project-restructuring.md#restructuring-map--구조-개편-이동표와-의존-규칙)·[기계 판독 목록](../plans/restructuring-map.json)을 조회한다.
- 로컬 화면 검수와 실제 iPad 터치·청취는 구분한다. 브라우저에서 확인한 화면만 기록하며 unit 성공을 실기기 성공으로 대신하지 않는다.

<a id="testing--곡-수록-후-개발-검증"></a>

### 곡 수록 후 개발 검증

제작 담당은 원본 대조·패키지 생성/왕복·제작 검증과 한계를 인계하고, 개발 담당은 공통 카탈로그 연결과 실제 앱 저장·재열기·재생을 확인한다. 공통 제작·인계 절차는 [제작 프로세스](produce-score.md#score-production-process--악보-제작-프로세스)를 따른다.

새 곡을 수록할 때는 기존 카탈로그·패키지·저장 경로를 사용하고, 전달받은 ID·메타정보·파일 해시를 확인한다. 목록 테스트의 기대값은 곡 식별자·분류·중복 여부를 기준으로 정한다. 저장된 같은 ID의 레코드가 우선하고 목록에 중복 표시되지 않는지도 확인한다. `tests/local-media/editor-catalog.test.ts`의 개인 목록 검사는 이미 이 기준을 사용하므로 곡 추가마다 고정 개수를 고치거나 같은 테스트를 새로 만들지 않는다.

교정될 수 있는 패키지 전체·정본 XML의 특정 릴리스 해시를 회귀검사에 고정하지 않는다. 인계·릴리스에서는 승인된 입력 해시를 기록하고 main 빌드·발행 자산과 대조한다. 회귀검사는 source와 canonicalXML의 일치, 곡 식별·메타정보, 수정 대상의 음악적 의미, 저장 왕복을 확인한다. 변경하지 않기로 한 원본 음원이나 구형 호환 fixture를 식별하는 해시는 유지한다. [0.11.1 이후 검사 정리](../records/code-maintenance.md#release-check-cleanup-20261111)에 적용 범위와 남은 검증을 기록했다.

<a id="testing--safari의-실제-재생-시작"></a>

#### Safari의 실제 재생 시작

같은 로컬 앱·자료에 대한 기존 GUI 승인 범위에서 프로젝트 지침에 따라 Safari MCP를 사용한다. 재생 조작의 순서는 다음과 같다.

1. 페이지와 악보 로드가 끝났는지 확인하고, Safari MCP의 실제 재생 버튼 조작으로 재생을 시작한다. `element.click()`이나 스크립트 이벤트 발생만으로 사용자 활성화가 확보됐다고 간주하지 않는다.
2. 실제 플레이어의 `AudioContext.state`가 `running`이고 재생 위치가 시간에 따라 진행하는지 확인한 다음 배속·반복·카운트오프를 검사한다. 화면의 재생 아이콘만으로 재생 성공을 판정하지 않는다.
3. 오디오 컨텍스트가 `suspended`이거나 재생 요청이 대기하면 조작 방식·페이지 활성 상태·컨텍스트/위치·오류를 기록한다. 사용자 활성화가 필요한 상태에서는 실제 버튼 조작을 확인하고, 기존 요청 대기로 조작이 막혔다면 시험 상태를 보존한 뒤 페이지를 다시 열어 재검증할 수 있다. 검증을 위해 자동 재생 제한을 해제하지 않는다.

자동화 입력에서만 발생한 실패와 실제 버튼 조작에서도 재현되는 앱 결함을 구분한다. 자동화 실패만으로 앱 재생 코드를 수정하지 않는다. 임시 계측이 필요하면 실제 플레이어의 상태·출력을 관측하며, 별도 플레이어의 성공을 앱 동작의 증거로 사용하지 않는다. Safari MCP 실패 후의 대체 브라우저 사용은 프로젝트 지침을 따른다.

<a id="testing--수록-후-확인-순서"></a>

#### 수록 후 확인 순서

기존 실제 패키지로 아래 흐름을 확인한다. UI 조작 결과와 필요한 시간·저장 근거를 함께 남긴다.

| 순서 | 확인 내용 |
| --- | --- |
| 저장·다시 열기 | 목록에서 불러와 저장하고 페이지를 다시 연 뒤 해당 곡을 연다. ID·곡명·가수·BPM·마디·악보/가사/음원 자산과 기존 저장 정보 유지 여부를 확인한다. |
| 원곡·배속 재생 | 원곡, 지원 범위의 느린/빠른 BPM에서 모달·상단 표시와 실제 적용 배속, 재생 위치 진행이 맞는지 확인한다. 고정 대기 시간 대신 변환 완료를 확인한 뒤 재생한다. |
| 반복 | 주변 마디 반복의 경계와 해제, 저장 반복 구간의 재열기 유지, 재생 중 같은 구간을 다시 눌렀을 때 처음으로 복귀하는 동작을 확인한다. |
| 카운트오프 | 설정 켜기·끄기에 따른 시작 지연·박 수를 확인한다. 반복 재시작과 자연 반복의 카운트 동작은 현재 제품 결정·기존 테스트를 기준으로 대조한다. |
| 끝과 시험 상태 정리 | 마지막 마디와 음원 잔향까지 재생한 뒤 종료 위치를 확인한다. 검증을 위해 만든 구간과 변경한 설정은 기록한 시험 시작 상태와 대조해 정리하며, 기존 사용자 구간·다른 곡을 일괄 삭제하거나 초기화하지 않는다. |

집중 테스트와 필요한 공통 코드 검사는 기존 명령을 사용한다. 전체 코드 검사는 `pnpm run check`이며, 이는 unit/local-media 테스트·빌드·실제 앱 검증을 대신하지 않는다. 검사 실패는 대상 파일과 실제 원인을 기록하고, 관련 없는 동시 작업을 덮어쓰지 않는다. 수정 후에는 영향을 받은 검사를 다시 확인한다.

결과에는 곡 ID·패키지 해시·환경·확인한 기능·실행 명령·증거 위치와 미확인 항목을 남긴다. 코드 검사, 실제 앱 기능, 화면 배치, 실제 청취는 각각의 관측 범위로 보고한다. 오디오 출력 신호나 예약 시각 확인을 사람이 들은 음질·음악적 싱크 검수로 표현하지 않는다. 공개 사이트·iPad 실기기·청취는 실제로 확인한 경우에만 완료로 기록한다.

[검증 범위 Rule](../reference/engineering/verification.md#verification-rules--범위와-필수-경계)에 따라 변경 영향에 맞는 검사만 실행하고 결과를 기록한다.

<a id="testing--제작-도구"></a>

### 제작 도구

`tools/score-production/`는 MusicXML 생성·검수, 범례 그림, renderer benchmark 도구를 소유한다. `tools/apple-local/`는 로컬 STT/AFM 보조 도구다. 도구 이동은 제작·원본 자료 수정·유료 호출의 실행 지시가 아니다. 실행 계약은 [제작 프로세스](produce-score.md#score-production-process--악보-제작-프로세스)와 [Apple 로컬 절차](use-apple-local-tools.md#apple-local-workflow--apple-로컬-검토-실행-절차)를 따른다.

<a id="ui-review--화면악보재생-검수-절차"></a>

## 화면·악보·재생 검수 절차

웹앱 개발 변경의 화면 테스트는 릴리스 때 이 절차로 수행한다. 악보 제작·검수 등 별도로 요청된 작업의 검사 범위는 해당 요청과 정본 절차를 따른다.

[UX Rule](../reference/product/ux.md#ux-principles--팀-ux-원칙과-맥락형-도움말), [SVG Rule](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙), [검증 Rule](../reference/engineering/verification.md#verification-rules--검증-범위와-증거)을 먼저 읽는다. GUI·시험은 현재 전역·프로젝트 지침의 허가 범위 안에서 수행한다. 이 절차를 읽는 것 자체가 실행 승인은 아니다.

1. 실제 대상 앱/origin·입력/패키지 해시·버전/빌드·현재 저장 상태를 기록한다. 순수 문서 변경이면 앱을 실행하지 않고 문서·보존 검사로 범위를 맞춘다.
2. 화면 검수는 기본적으로 [Safari MCP 창의 응답형 디자인 모드](verify-ipad.md#safari-responsive-mode)를 사용한다. 같은 창에서 Computer Use로 기기·방향을 설정하고 Safari MCP로 화면·버튼을 확인한다. 제품 검수는 변경에 맞춰 공통 카탈로그·설정·도움말·닫기·포커스·터치 영역과 해당 흐름을 확인한다. 실제 화면·지원하지 않는 브라우저 기능·미확인을 구분한다.
3. 악보 표시·PDF/SVG 비교는 [악보 검수](review-score.md#원본과-제작기-화면-대조)를 따른다.
4. 저장/재열기와 재생은 [기존 실제 패키지 검사 순서](verify.md#testing--곡-수록-후-개발-검증)를 따른다. 실제 AudioContext와 위치 진행 후 배속·반복·카운트오프를 관측한다. 수치·화면·사람 청취를 별도 기록한다.
5. 일시 검수 DOM/URL·계측 래퍼·검증용 구간과 설정은 시작 상태에 맞게 정리한다. 다른 곡·기존 사용자 데이터를 초기화하지 않는다. 검사 결과·캡처·한계·다음 조치를 기록한다.

검수 질문은 처음 보는 사람의 시작, 반복 사용의 수고, 오조작 후 결과 이해/복귀다. iOS·iPadOS 실기기·시뮬레이터 검증은 릴리스에 포함하지 않으며, 사용자가 해당 검증을 명시적으로 지시한 경우에만 [지정 절차](verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차)를 수행한다. 응답형 화면이나 Chromium 크기 모사를 실제 Safari 실기기 결과로 쓰지 않는다. 과거 가독성 계산식·후보·실측은 [ADR-0005](../decisions/0005-practice-layout-and-spacing.md)에 보존한다.
