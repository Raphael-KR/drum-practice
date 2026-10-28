# 코드와 화면 검증

문서 역할: **실행 절차**. 현재 요청과 전역·프로젝트 지침의 승인 범위 안에서 수행한다. [정본 목록](../RULES-INDEX.md)과 [작업별 안내](../README.md)를 먼저 확인한다. 예시 명령·과거 기록은 이번 실행의 성공 증거가 아니다.

<a id="testing--개발-검사와-로컬-자산-준비"></a>

## 개발 검사와 로컬 자산 준비

문서 역할: **실행 절차**. 요구·허가 경계·판정 기준은 [검증 Rule](../reference/engineering/verification.md#verification-rules--검증-범위와-증거), 당시 도입·검증 결과는 [ADR-0027](../decisions/0027-verification-scope-and-device-evidence.md)에 둔다.

<a id="testing--실행-범위"></a>

### 실행 범위

모든 명령은 프로젝트 루트에서 실행한다. Node.js 22 LTS(22.13 이상, `.nvmrc`)와 `pnpm install --frozen-lockfile`로 설치한 의존성을 사용한다. Vitest는 이 저장소의 `tests/{unit,integration,local-media}`만 검사한다. 별도 checkout·배포 사본·기타 프로젝트는 포함하지 않는다.

- `pnpm run test:portable`: 로컬 악보 없이 실행 가능한 unit 및 integration 검사. 기존 테스트의 메모리 저장소·DOM·mock을 재사용한다.
- `pnpm run test:local-media`: 보존된 실제 악보·음원 자료를 사용하는 검사. 자료가 없으면 명시적으로 실패한다.
- `pnpm run test:drum`: 두 범위를 모두 실행하는 전체 회귀. 릴리스 필수 범위를 축소하지 않는다.
- `pnpm run check:playback`: 재생 소유권, 공통 컴포넌트와 소스 경계 검사. `src/` 전체를 재귀 탐색한다.
- `pnpm run build:apps`: 타입·i18n·재생/소스 경계 검사 후 두 앱을 빌드하고 player 번들의 제작 기능 유입을 검사한다.
- `pnpm run test:local`: 기존 Apple 보조 도구의 Python 단위 검사. STT/AFM 실행이나 음원 전송은 포함하지 않는다.

`pretest`, `pretest:drum`, `pretest:portable`, `pretest:local-media`가 라이선스와 빌드번호를 생성한다. `pnpm exec vitest`를 직접 사용할 때는 먼저 `pnpm run pretest`를 실행한다. 타입만 검사할 때도 새 checkout에서는 생성 파일이 필요하다.

<a id="testing--공통-검사와-ci"></a>

### 공통 검사와 CI

- 최초 준비: `pnpm install --frozen-lockfile`. 루트와 hosting을 한 번에 설치하며 Git에 보관한 `config/shared-catalog.yaml` 사본과 공용 잠금 파일을 사용한다. 개인 중앙 경로는 필요하지 않다. 버전 갱신과 로컬 정본 대조는 [카탈로그 동기화 절차](develop.md#공유-의존성과-중앙-버전-갱신)를 따른다.
- `pnpm run generate`: 라이선스·소스 빌드번호 생성. 모든 개발 진입점과 테스트·앱/도구 타입 검사의 pre 단계가 재사용한다.
- `pnpm run check`: ESLint, 코드/설정 서식, 앱·도구·hosting 타입, i18n, 모듈 경계, 생성 UI 문서·상대 파일 링크 검사.
- `pnpm run verify:portable`: 공통 검사와 portable 테스트. `.github/workflows/check.yml`도 같은 명령을 실행한다. CI는 원본 미디어를 업로드/생성하지 않으며 두 앱 빌드·local-media 회귀를 대체하지 않는다.
- `pnpm run verify`: 공통 검사, 전체 회귀, 분리 빌드. 릴리스의 로컬 검증 명령이다.
- `pnpm run build`는 `build:apps`와 동일하다. 구형 통합 dist 빌드는 사용하지 않는다. 빌드 중 문서는 수정하지 않고 `check:docs`로 생성 문서의 일치를 확인한다.
- `pnpm run typecheck`: 앱(`tsconfig.json`), 브라우저 제작 도구(`tsconfig.tools.json`), hosting 빌드 설정(`hosting/tsconfig.json`)을 각각 검사한다. hosting의 설치된 Vite/Cloudflare 타입을 사용한다.
- `pnpm run format:check`: Git 추적 파일과 아직 추가하지 않은 비제외 파일 중 JS/TS/JSON/CSS/HTML/YAML을 검사한다. Markdown·Python과 pnpm이 생성하는 `pnpm-lock.yaml`은 Prettier 대상이 아니다. 잠금 파일은 `pnpm install --frozen-lockfile`로 선언·카탈로그와의 일치를 검사한다. `.prettierrc.json`과 고정한 Prettier 버전을 사용한다.
- `pnpm run check:docs`: 생성 UI 문서와 Markdown의 상대 파일 링크만 검사한다. 실제 존재와 Git 추적/비제외 신규 파일 포함 여부를 함께 검사해 로컬/CI에서 같은 기준을 사용한다. 외부 URL·절대 로컬 경로·앵커 내용은 검사하지 않는다. Git 제외·삭제된 실험 증거는 클릭 링크 대신 보존 경로와 로컬/삭제 상태로 기록한다.
- 원격 CI 결과는 push 이후 별도로 확인한다. 로컬 통과를 원격 CI 실행 성공으로 기록하지 않는다.

<a id="testing--eslint"></a>

### ESLint

`eslint.config.mjs`의 flat config를 사용한다. ESLint 10과 typescript-eslint 8의 `recommended` 규칙을 JS·TS에 적용하며, 타입 정보를 사용하는 추가 규칙은 아직 켜지 않았다. 타입 검사는 기존 `tsc --noEmit`이 맡는다. 설정 방식은 [typescript-eslint 공식 안내](https://typescript-eslint.io/getting-started/)를 따른다.

- `pnpm run lint`: 전체 검사. 오류 또는 경고가 있으면 실패한다.
- `pnpm run lint:fix`: 자동 수정 가능한 항목을 수정한 뒤 같은 기준으로 검사한다. 실행 후 diff를 검토한다.
- 범위: 두 앱의 `src/`, `tests/`, `server/`, `scripts/`, JS 제작 도구, `hosting/`와 루트 설정 파일. 생성 파일·외부 의존성·미디어·배포 사본·실험 출력은 제외한다. HTML 내부 스크립트와 Python은 이 검사 대상이 아니다.
- 환경: 앱은 browser, 서버·개발 도구는 Node.js, 테스트는 Node.js와 DOM이다. MusicXML 제작 도구는 `page.evaluate()` 콜백을 포함하므로 browser 전역도 허용한다.
- Prettier: 마지막에 `eslint-config-prettier`를 적용해 서식 규칙 충돌을 막는다. ESLint 명령이 Prettier를 실행하는 것은 아니다.
- 규칙: 미사용 변수, 명시적 `any`, 재할당 없는 `let`, 빈 블록 등을 권장 규칙 그대로 검사한다. 사용되지 않는 `eslint-disable`도 오류로 처리한다. 검사 설정 변경의 경계는 [검증 Rule](../reference/engineering/verification.md#verification-rules--범위와-필수-경계)을 확인한다.

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

[UX Rule](../reference/product/ux.md#ux-principles--팀-ux-원칙과-맥락형-도움말), [SVG Rule](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙), [검증 Rule](../reference/engineering/verification.md#verification-rules--검증-범위와-증거)을 먼저 읽는다. GUI·시험은 현재 전역·프로젝트 지침의 허가 범위 안에서 수행한다. 이 절차를 읽는 것 자체가 실행 승인은 아니다.

1. 실제 대상 앱/origin·입력/패키지 해시·버전/빌드·현재 저장 상태를 기록한다. 순수 문서 변경이면 앱을 실행하지 않고 문서·보존 검사로 범위를 맞춘다.
2. 화면 검수는 기본적으로 [Safari MCP 창의 응답형 디자인 모드](verify-ipad.md#safari-responsive-mode)를 사용한다. 같은 창에서 Computer Use로 기기·방향을 설정하고 Safari MCP로 화면·버튼을 확인한다. 제품 검수는 변경에 맞춰 공통 카탈로그·설정·도움말·닫기·포커스·터치 영역과 해당 흐름을 확인한다. 실제 화면·지원하지 않는 브라우저 기능·미확인을 구분한다.
3. 악보 표시·PDF/SVG 비교는 [악보 검수](review-score.md#원본과-제작기-화면-대조)를 따른다.
4. 저장/재열기와 재생은 [기존 실제 패키지 검사 순서](verify.md#testing--곡-수록-후-개발-검증)를 따른다. 실제 AudioContext와 위치 진행 후 배속·반복·카운트오프를 관측한다. 수치·화면·사람 청취를 별도 기록한다.
5. 일시 검수 DOM/URL·계측 래퍼·검증용 구간과 설정은 시작 상태에 맞게 정리한다. 다른 곡·기존 사용자 데이터를 초기화하지 않는다. 검사 결과·캡처·한계·다음 조치를 기록한다.

검수 질문은 처음 보는 사람의 시작, 반복 사용의 수고, 오조작 후 결과 이해/복귀다. iPad는 [지정 절차](verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차)로 확인하고 Chromium 크기 모사를 실제 Safari 실기기 결과로 쓰지 않는다. 과거 가독성 계산식·후보·실측은 [ADR-0005](../decisions/0005-practice-layout-and-spacing.md)에 보존한다.
