---
status: accepted
date: 2026-10-23
---

# 검증 범위와 실제 환경의 증거를 구분한다

## Context and Problem Statement

자동 검사·로컬 UI·시뮬레이터·실기기·청취의 성공이 서로 다른 범위인데 같은 완료로 읽힐 수 있었다. 원래 결정 시기는 2026-09-18 이후·10-21~23 정리이며, YAML 날짜는 이번 문서 정리일이다.

## Considered Options

* 자동 검사나 대체 브라우저 결과로 모든 기기 완료를 선언한다.
* 검증 종류·입력·환경·미확인을 구분해 기록하고 변경 없는 증거만 재사용한다.

## Decision Outcome

후자를 채택한다. unit/integration/local-media 및 앱 경계를 유지하고, 누락 자산은 조용히 건너뛰지 않는다. Safari·iPad mini 지정 경로를 우선하고 실제 청취는 별도 근거로 남긴다.

### Consequences

GUI·시험의 권한은 현재 전역·프로젝트 지침을 따르며 이 ADR이 추가 권한을 주지 않는다. 측정값·STT 보조 의견을 원본 의미나 청취 확정으로 대신하지 않는다. 새 기능·삭제·전송·배포 승인을 추가하지 않는다.

### Confirmation

현행 계약과 실행 절차는 [검증 Rule](../reference/engineering/verification.md#verification-rules--검증-범위와-증거), [검사 절차](../how-to/verify.md#testing--개발-검사와-로컬-자산-준비), [iPad 절차](../how-to/verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차)에서 확인한다. 아래 당시 검증 수치·실패·미확인은 해당 환경의 기록이며 이번 작업에서 앱·악보 검증을 다시 수행한 결과가 아니다.

## More Information

대안은 원문에서 확인되는 채택·대체 경로를 정리한 것이다. 별도 회의나 새로운 합의를 추정하지 않는다. 이관 원문에 포함된 대체 전 값은 현행 규칙이 아니다.

### 이관 원문 — TESTING.md / 1

출처: [docs/operations/TESTING.md](../how-to/verify.md#testing--개발-검사와-로컬-자산-준비). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

#### 개발 검사와 로컬 자산 준비

### 이관 원문 — TESTING.md / 2

출처: [docs/operations/TESTING.md](../how-to/verify.md#testing--개발-검사와-로컬-자산-준비). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 실행 범위

모든 명령은 프로젝트 루트에서 실행한다. Node.js 22 LTS(22.13 이상, `.nvmrc`)와 `npm ci`로 설치한 의존성을 사용한다. Vitest는 이 저장소의 `tests/{unit,integration,local-media}`만 검사한다. 별도 checkout·배포 사본·기타 프로젝트는 포함하지 않는다.

- `npm run test:portable`: 로컬 악보 없이 실행 가능한 unit 및 integration 검사. 기존 테스트의 메모리 저장소·DOM·mock을 재사용한다.
- `npm run test:local-media`: 보존된 실제 악보·음원 자료를 사용하는 검사. 자료가 없으면 명시적으로 실패한다.
- `npm run test:drum`: 두 범위를 모두 실행하는 전체 회귀. 릴리스 필수 범위를 축소하지 않는다.
- `npm run check:playback`: 재생 소유권, 공통 컴포넌트와 소스 경계 검사. `src/` 전체를 재귀 탐색한다.
- `npm run build:apps`: 타입·i18n·재생/소스 경계 검사 후 두 앱을 빌드하고 player 번들의 제작 기능 유입을 검사한다.
- `npm run test:local`: 기존 Apple 보조 도구의 Python 단위 검사. STT/AFM 실행이나 음원 전송은 포함하지 않는다.

`pretest`, `pretest:drum`, `pretest:portable`, `pretest:local-media`가 라이선스와 빌드번호를 생성한다. `npx vitest`를 직접 사용할 때는 먼저 `npm run pretest`를 실행한다. 타입만 검사할 때도 새 checkout에서는 생성 파일이 필요하다.

### 이관 원문 — TESTING.md / 3

출처: [docs/operations/TESTING.md](../how-to/verify.md#testing--개발-검사와-로컬-자산-준비). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 공통 검사와 CI

- 최초 준비: `npm ci`와 `npm ci --prefix hosting`. 두 패키지의 lockfile을 사용한다. 로컬 hosting 의존성 링크가 이미 설치되어 있으면 재설치는 필요 없다.
- `npm run generate`: 라이선스·소스 빌드번호 생성. 모든 개발 진입점과 테스트·앱/도구 타입 검사의 pre 단계가 재사용한다.
- `npm run check`: ESLint, 코드/설정 서식, 앱·도구·hosting 타입, i18n, 모듈 경계, 생성 UI 문서·상대 파일 링크 검사.
- `npm run verify:portable`: 공통 검사와 portable 테스트. `.github/workflows/check.yml`도 같은 명령을 실행한다. CI는 원본 미디어를 업로드/생성하지 않으며 두 앱 빌드·local-media 회귀를 대체하지 않는다.
- `npm run verify`: 공통 검사, 전체 회귀, 분리 빌드. 릴리스의 로컬 검증 명령이다.
- `npm run build`는 `build:apps`와 동일하다. 구형 통합 dist 빌드는 사용하지 않는다. 빌드 중 문서는 수정하지 않고 `check:docs`로 생성 문서의 일치를 확인한다.
- `npm run typecheck`: 앱(`tsconfig.json`), 브라우저 제작 도구(`tsconfig.tools.json`), hosting 빌드 설정(`hosting/tsconfig.json`)을 각각 검사한다. hosting의 설치된 Vite/Cloudflare 타입을 사용한다.
- `npm run format:check`: Git 추적 파일과 아직 추가하지 않은 비제외 파일 중 JS/TS/JSON/CSS/HTML/YAML을 검사한다. Markdown·Python은 서식 검사 대상이 아니다. `.prettierrc.json`과 고정한 Prettier 버전을 사용한다.
- `npm run check:docs`: 생성 UI 문서와 Markdown의 상대 파일 링크만 검사한다. 외부 URL·절대 로컬 경로·앵커 내용은 검사하지 않는다. 삭제된 실험 증거는 클릭 링크 대신 과거 경로와 삭제 상태로 기록한다.
- 원격 CI 결과는 push 이후 별도로 확인한다. 로컬 통과를 원격 CI 실행 성공으로 기록하지 않는다.

### 이관 원문 — TESTING.md / 4

출처: [docs/operations/TESTING.md](../how-to/verify.md#testing--개발-검사와-로컬-자산-준비). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### ESLint

`eslint.config.mjs`의 flat config를 사용한다. ESLint 10과 typescript-eslint 8의 `recommended` 규칙을 JS·TS에 적용하며, 타입 정보를 사용하는 추가 규칙은 아직 켜지 않았다. 타입 검사는 기존 `tsc --noEmit`이 맡는다. 설정 방식은 [typescript-eslint 공식 안내](https://typescript-eslint.io/getting-started/)를 따른다.

- `npm run lint`: 전체 검사. 오류 또는 경고가 있으면 실패한다.
- `npm run lint:fix`: 자동 수정 가능한 항목을 수정한 뒤 같은 기준으로 검사한다. 실행 후 diff를 검토한다.
- 범위: 두 앱의 `src/`, `tests/`, `server/`, `scripts/`, JS 제작 도구, `hosting/`와 루트 설정 파일. 생성 파일·외부 의존성·미디어·배포 사본·실험 출력은 제외한다. HTML 내부 스크립트와 Python은 이 검사 대상이 아니다.
- 환경: 앱은 browser, 서버·개발 도구는 Node.js, 테스트는 Node.js와 DOM이다. MusicXML 제작 도구는 `page.evaluate()` 콜백을 포함하므로 browser 전역도 허용한다.
- Prettier: 마지막에 `eslint-config-prettier`를 적용해 서식 규칙 충돌을 막는다. ESLint 명령이 Prettier를 실행하는 것은 아니다.
- 규칙: 미사용 변수, 명시적 `any`, 재할당 없는 `let`, 빈 블록 등을 권장 규칙 그대로 검사한다. 사용되지 않는 `eslint-disable`도 오류로 처리한다. 기존 지적 사항을 숨기는 baseline이나 일괄 규칙 해제는 두지 않는다.

도입 시점(2026-10-21)에 확인한 172오류는 후속 코드 정리에서 모두 수정했다. 권장 규칙·검사 범위는 유지했고 억제 주석이나 baseline은 추가하지 않았다. 최신 검증은 329파일 0오류·0경고, 타입 검사, 123파일720테스트, 두 앱 빌드 통과다. 별도 제작 벤치마크 도구도 독립 타입 검사를 통과했다. 빌드 명령에 lint를 자동 연결하지 않았으므로 필요할 때 `npm run lint`를 별도로 실행한다. 상세 로컬 결과는 `.tmp/eslint-cleanup-final.json`, `.tmp/eslint-cleanup-{tests,build}.log`, `.tmp/eslint-benchmark-types.log`다.

### 이관 원문 — TESTING.md / 5

출처: [docs/operations/TESTING.md](../how-to/verify.md#testing--개발-검사와-로컬-자산-준비). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 로컬 자료

원본 미디어는 Git에 넣거나 자동 다운로드하지 않는다. 기존 자료 보관처에서 아래 경로로 준비한다. `node scripts/checks/check-local-assets.mjs`는 누락 경로를 출력하고 실패한다. 존재 검사는 내용 검증을 대신하지 않는다.

| 위치 | 필요 자료 / 준비 경로 |
|---|---|
| `public/demo/` | `song.json`, `score.pdf`, `score.musicxml`, `audio.mp3`, song.pageCount에 해당하는 `page-N.png`. 기존 변환 회귀용 데모 묶음을 그대로 복사한다. |
| `public/scores/` | `src/content/bundled-scores.json`의 모든 `.drumscore`. 승인된 `data/production/<곡>/final/` 결과 또는 기존 로컬 배포용 자산을 복사한다. 새 악보를 임의 생성하지 않는다. |
| `data/reference/grid_verified.json` | 보존된 가사/박자 검수 입력. |
| `data/reference/test-fixtures/musicxml-candidate.musicxml` | 쉼표 보정 회귀 입력. |
| `data/reference/test-fixtures/tom-moving-28-portland.drumscore` | 구형 패키지 교체 호환 회귀 입력. |

player 빌드에는 위 카탈로그의 패키지와 Git에 있는 `public/icons/`가 필요하다. 로컬 미디어가 없는 환경은 portable 검사까지만 검증됐다고 보고한다. 패키지 회귀나 player 빌드를 통과했다고 보고하지 않는다.

### 이관 원문 — TESTING.md / 6

출처: [docs/operations/TESTING.md](../how-to/verify.md#testing--개발-검사와-로컬-자산-준비). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 호환성과 검사 범위

- DB 이름·버전·저장 키, bytes-v1, 구형 Blob 복원, 저장 전 snapshot·큐·원자적 트랜잭션은 storage/shared-score-library/record-serialization/editor-session 검사로 확인한다.
- `.drumscore` 읽기·쓰기와 제작기→연습실 전달은 score-package/app-separation/tom-moving-package-update 검사로 확인한다.
- 기능별 이동표는 [이동표](../records/archive/project-restructuring.md#restructuring-map--구조-개편-이동표와-의존-규칙), 기계 판독 목록은 [JSON](../plans/restructuring-map.json)이다. 이동 전의 121개 테스트 파일을 모두 보존한다.
- 로컬 화면 검수와 실제 iPad 터치·청취는 구분한다. 브라우저에서 확인한 화면만 기록하며 unit 성공을 실기기 성공으로 대신하지 않는다.

### 이관 원문 — TESTING.md / 7

출처: [docs/operations/TESTING.md](../how-to/verify.md#testing--개발-검사와-로컬-자산-준비). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 곡 수록 후 개발 검증

제작 담당은 원본 대조·패키지 생성/왕복·제작 검증과 한계를 인계하고, 개발 담당은 공통 카탈로그 연결과 실제 앱 저장·재열기·재생을 확인한다. 공통 제작·인계 절차는 [제작 프로세스](../how-to/produce-score.md#score-production-process--악보-제작-프로세스)를 따른다.

새 곡을 수록할 때는 기존 카탈로그·패키지·저장 경로를 사용하고, 전달받은 ID·메타정보·파일 해시를 확인한다. 목록 테스트의 기대값은 곡 식별자·분류·중복 여부를 기준으로 정한다. 저장된 같은 ID의 레코드가 우선하고 목록에 중복 표시되지 않는지도 확인한다. `tests/local-media/editor-catalog.test.ts`의 개인 목록 검사는 이미 이 기준을 사용하므로 곡 추가마다 고정 개수를 고치거나 같은 테스트를 새로 만들지 않는다.

### 이관 원문 — TESTING.md / 8

출처: [docs/operations/TESTING.md](../how-to/verify.md#testing--개발-검사와-로컬-자산-준비). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### Safari의 실제 재생 시작

같은 로컬 앱·자료에 대한 기존 GUI 승인 범위에서 프로젝트 지침에 따라 Safari MCP를 사용한다. 재생 조작의 순서는 다음과 같다.

1. 페이지와 악보 로드가 끝났는지 확인하고, Safari MCP의 실제 재생 버튼 조작으로 재생을 시작한다. `element.click()`이나 스크립트 이벤트 발생만으로 사용자 활성화가 확보됐다고 간주하지 않는다.
2. 실제 플레이어의 `AudioContext.state`가 `running`이고 재생 위치가 시간에 따라 진행하는지 확인한 다음 배속·반복·카운트오프를 검사한다. 화면의 재생 아이콘만으로 재생 성공을 판정하지 않는다.
3. 오디오 컨텍스트가 `suspended`이거나 재생 요청이 대기하면 조작 방식·페이지 활성 상태·컨텍스트/위치·오류를 기록한다. 사용자 활성화가 필요한 상태에서는 실제 버튼 조작을 확인하고, 기존 요청 대기로 조작이 막혔다면 시험 상태를 보존한 뒤 페이지를 다시 열어 재검증할 수 있다. 검증을 위해 자동 재생 제한을 해제하지 않는다.

자동화 입력에서만 발생한 실패와 실제 버튼 조작에서도 재현되는 앱 결함을 구분한다. 자동화 실패만으로 앱 재생 코드를 수정하지 않는다. 임시 계측이 필요하면 실제 플레이어의 상태·출력을 관측하며, 별도 플레이어의 성공을 앱 동작의 증거로 사용하지 않는다. Safari MCP 실패 후의 대체 브라우저 사용은 프로젝트 지침을 따른다.

### 이관 원문 — TESTING.md / 9

출처: [docs/operations/TESTING.md](../how-to/verify.md#testing--개발-검사와-로컬-자산-준비). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 수록 후 확인 순서

기존 실제 패키지로 아래 흐름을 확인한다. UI 조작 결과와 필요한 시간·저장 근거를 함께 남긴다.

| 순서 | 확인 내용 |
| --- | --- |
| 저장·다시 열기 | 목록에서 불러와 저장하고 페이지를 다시 연 뒤 해당 곡을 연다. ID·곡명·가수·BPM·마디·악보/가사/음원 자산과 기존 저장 정보 유지 여부를 확인한다. |
| 원곡·배속 재생 | 원곡, 지원 범위의 느린/빠른 BPM에서 모달·상단 표시와 실제 적용 배속, 재생 위치 진행이 맞는지 확인한다. 고정 대기 시간 대신 변환 완료를 확인한 뒤 재생한다. |
| 반복 | 주변 마디 반복의 경계와 해제, 저장 반복 구간의 재열기 유지, 재생 중 같은 구간을 다시 눌렀을 때 처음으로 복귀하는 동작을 확인한다. |
| 카운트오프 | 설정 켜기·끄기에 따른 시작 지연·박 수를 확인한다. 반복 재시작과 자연 반복의 카운트 동작은 현재 제품 결정·기존 테스트를 기준으로 대조한다. |
| 끝과 시험 상태 정리 | 마지막 마디와 음원 잔향까지 재생한 뒤 종료 위치를 확인한다. 검증을 위해 만든 구간과 변경한 설정은 기록한 시험 시작 상태와 대조해 정리하며, 기존 사용자 구간·다른 곡을 일괄 삭제하거나 초기화하지 않는다. |

집중 테스트와 필요한 공통 코드 검사는 기존 명령을 사용한다. 전체 코드 검사는 `npm run check`이며, 이는 unit/local-media 테스트·빌드·실제 앱 검증을 대신하지 않는다. 검사 실패는 대상 파일과 실제 원인을 기록하고, 관련 없는 동시 작업을 덮어쓰지 않는다. 수정 후에는 영향을 받은 검사를 다시 확인한다.

결과에는 곡 ID·패키지 해시·환경·확인한 기능·실행 명령·증거 위치와 미확인 항목을 남긴다. 코드 검사, 실제 앱 기능, 화면 배치, 실제 청취는 각각의 관측 범위로 보고한다. 오디오 출력 신호나 예약 시각 확인을 사람이 들은 음질·음악적 싱크 검수로 표현하지 않는다. 공개 사이트·iPad 실기기·청취는 실제로 확인한 경우에만 완료로 기록한다.

적용 근거는 2026-10-23 갑자기 앱 수록·재생 검증이며, 로컬 상세 기록은 `docs/experiments/ioi-suddenly-app-validation.md`다. 이 경로와 `.tmp/` 증거는 Git 제외 자료이므로 다른 checkout에서 존재한다고 전제하지 않는다. 문서만 수정하고 검증 대상 코드·패키지가 그대로라면 이미 통과한 음악/재생 검증을 반복하지 않는다. 문서·링크 검사와 변경 범위에 필요한 확인만 실행하고, 과거 실행 결과를 이번 신규 실행으로 보고하지 않는다.

### 이관 원문 — TESTING.md / 10

출처: [docs/operations/TESTING.md](../how-to/verify.md#testing--개발-검사와-로컬-자산-준비). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 제작 도구

`tools/score-production/`는 MusicXML 생성·검수, 범례 그림, renderer benchmark 도구를 소유한다. `tools/apple-local/`는 로컬 STT/AFM 보조 도구다. 도구 이동은 제작·원본 자료 수정·유료 호출의 실행 지시가 아니다. 실행 계약은 [제작 프로세스](../how-to/produce-score.md#score-production-process--악보-제작-프로세스)와 [Apple 로컬 절차](../how-to/use-apple-local-tools.md#apple-local-workflow--apple-로컬-검토-실행-절차)를 따른다.


### Rule 재점검 원문 — APPLE-LOCAL-REVIEW.md / 1

출처: [docs/architecture/APPLE-LOCAL-REVIEW.md](../reference/score/tools.md#apple-local-review--apple-로컬-가사-검토-계약). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> 성공 조건은 모든 지정 구간의 STT 결과, 검사된 시간 범위, AFM 결과/실패 기록, 원본을 보존한 검토 목록 생성이다. 후보 개수를 인식 오류 수로 해석하지 않는다. 이번 구현은 Mac 자료 준비용 CLI이며 웹앱/iPad HTML에서 AFM을 호출하지 않는다.


### Rule 재점검 원문 — APPLE-LOCAL-REVIEW.md / 2

출처: [docs/architecture/APPLE-LOCAL-REVIEW.md](../reference/score/tools.md#apple-local-review--apple-로컬-가사-검토-계약). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> `boundaries.py`를 추가했다. 텍스트가 원문과 같더라도 별도로 시간 경계를 검사한다. 단일 문자 STT run이0.8초 이상이거나 사용자 청취 앵커와 연결되면 검토 대상으로 만든다.0.8초는 의심 후보를 찾는 휴리스틱이며 긴 음절을 오류로 확정하는 기준이 아니다.
