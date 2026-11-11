# 검사 카탈로그

문서 역할: **실행 항목 참조**. 검사 선택·허가·판정의 정본은 [검증 Rule](verification.md), 명령 구현은 [package.json](../../../package.json)과 [CI 설정](../../../.github/workflows/check.yml)이다. 이 목록은 모든 명령을 차례로 실행하는 체크리스트가 아니다. 준비와 실행 방법은 [검사 절차](../../how-to/verify.md), 릴리스 단계는 [발행 절차](../../how-to/release.md)를 따른다.

별도 표시가 없으면 저장소 루트에서 실행한다. Node는 `.nvmrc`의 기본 환경 또는 `package.json`의 `engines`를 만족하는 검증된 기존 환경, pnpm은 `packageManager`의 지정 버전을 사용한다. 실제 경로·버전·설치 의존성을 확인하고 기록한다. CI는 아래에 명시한 자체 환경을 사용하며, 도구 버전이 다른 결과를 같은 환경의 결과로 취급하지 않는다.

## 선택과 기록

1. 변경 파일뿐 아니라 호출부·공통 모듈·의존성·저장 형식·수록 자산의 영향을 확인한다. 코드 릴리스는 아래 공통 필수 검사를 적용하고, 문서만 변경한 작업은 문서·링크·앵커·diff 검사로 한정한다.
2. 변경 영향별 선택 항목에서 실행 조건에 해당하는 것만 추가한다. 해당 조건을 충족하면 이번 범위의 필수 검사다. 영향을 판단할 수 없으면 범위를 넓히며, 모든 화면·곡·도구 검사를 관행적으로 추가하지 않는다.
3. 각 항목을 `실행`, `결과 재사용`, `비대상`, `보류`로 정한다. 선택/비대상 이유, 명령·대상·환경·부수 효과와 허가 범위를 기존 작업 기록이나 릴리스 기록에 적는다. 별도 계획 파일이나 고정 개수 검사를 만들 필요는 없다.
4. 실행한 항목에는 통과/실패와 로그·입력 식별자를, 재사용에는 원래 결과와 입력 동일성 근거를 연결한다. 조건에 해당하지만 허가·자료·환경이 없는 경우는 `비대상`이 아니라 `보류`이며, 필요한 릴리스 단계를 완료했다고 표시하지 않는다.

재사용은 [공통 재사용 기준](verification.md#verification-rules--결과-재사용)을 모두 충족해야 한다. 아래 각 행의 재사용 열은 추가로 비교할 입력과 한계다. 테스트나 생성 파일을 함께 쓰는 명령은 순차 실행한다.

## 공통 필수 검사

코드 릴리스의 로컬 기본 명령은 **`pnpm run verify`**다. `check` → `test:drum` → `bundle:apps`를 실행한다. 공통 정적 검사·전체 Vitest 회귀·두 앱 빌드를 유지하며, 같은 후보에 `check`, `test:portable`, `test:local-media`, `build:apps`를 다시 붙여 실행하지 않는다. 개발 단계의 집중 검사와 병합 후 결과 재사용에는 아래 구성 항목을 사용한다.

| 검사·목적 | 실행 조건·명령 | 환경·입력 | 부수 효과·허가 | 결과 재사용 시 대조 |
| --- | --- | --- | --- | --- |
| 문서·링크·앵커·변경 공백 | 모든 변경의 관련 문서. `pnpm run check:docs`, `git diff --check` | 저장소의 Markdown·생성 UI 문서·참조 파일, Node/pnpm/Git. [검사 제외 범위](documentation.md#documentation-rules--문서-변경-검증) 적용 | 읽기만 수행. 외부 URL 접속·실제 화면 확인 없음 | 문서·앵커 대상·파일 이동/삭제·UI 카탈로그·검사기와 diff가 같아야 한다. 새 결과를 문서에 적었으면 그 문서 변경분만 다시 확인한다. |
| Lint: 미사용·잘못된 코드 패턴 | 코드 릴리스, 개발 중 관련 JS/TS 변경. `pnpm run lint` | ESLint 설정·설치 버전·대상 소스 | 읽기만 수행. `lint:fix`는 수정 명령이므로 별도 판단 | 대상 소스·ESLint 설정·플러그인/버전 |
| 코드·설정 서식 | 코드 릴리스, 개발 중 해당 형식 변경. `pnpm run format:check` | Prettier 설정·버전, 추적/비제외 신규 JS/TS/JSON/CSS/HTML/YAML | 읽기만 수행. Markdown·Python·pnpm lockfile은 대상 아님 | 대상 파일 목록·내용·설정·Prettier 버전 |
| 앱·도구·hosting 타입 계약 | 코드 릴리스는 `pnpm run typecheck`. 집중 검사는 `typecheck:app`, `typecheck:tools`, `typecheck:hosting`을 `pnpm run`으로 실행 | 각 tsconfig의 소스 그래프·타입 의존성·TypeScript. 앱 범위는 테스트·server도 포함 | 앱 pre 단계가 라이선스·빌드번호를 `src/generated/`에 쓴다. tools/hosting은 생성 준비 없음. 타입 검사는 emit 없음 | 관련 소스 그래프·tsconfig·타입/컴파일러·생성 입력. 문서만 바뀌면 실행하지 않는다. |
| 공유 JSZip·OSMD 패치/고지 | 코드 릴리스, 관련 의존성/패치 변경. `pnpm run check:dependencies` | 설치된 OSMD/JSZip, 패치·lockfile·생성 고지 | 읽기/구문 분석만 수행. 설치나 renderer 실행 없음. 고지는 준비돼 있어야 한다. | 실제 설치 경로/바이트·패치·lockfile·고지 생성 입력 |
| i18n 문구 계약 | 코드 릴리스, UI 문구/키 변경. `pnpm run check:i18n` | 소스·메시지 카탈로그·문구 예외·검사기 | 기본 검사는 읽기만 수행 | 검색 대상 소스·카탈로그·예외·검사 규칙 |
| 재생 소유권·공통 UI·소스 경계 | 코드 릴리스, 관련 구조 변경. `pnpm run check:playback` | 재생·공통 컴포넌트·소스 경계 검사와 `src/` 그래프 | 기본 검사는 읽기만 수행. `check:structure`가 포함되므로 별도로 반복하지 않는다. `--audit` 보고서는 아래 선택 항목이다. | 소스 그래프·소유권/경계 규칙·검사기·AST 의존성 |
| 전체 자동 회귀 | 코드 릴리스. `pnpm run test:drum` (`verify`에 포함) | 현재 `tests/{unit,integration,local-media}`, Vitest·DOM/mock·fake-indexeddb·[보존된 로컬 자산](../../how-to/verify.md#testing--로컬-자료) | pre 단계의 생성 쓰기, 메모리 시험 자료/DB·검사 전용 `.tmp` 사본·도구 캐시 사용. 실제 사용자 DB·원본은 변경하지 않는다. 현재 시험 허가 확인 | 앱/검사 코드·fixture·실제 자산·의존성·설정·환경. 입력 누락은 실패로 남기며 portable 통과로 대체하지 않는다. |
| 두 앱 빌드·player 공개 경계 | 코드 릴리스. `pnpm run bundle:apps` (`verify`에 포함). 독립 빌드가 필요하면 사전 검사를 포함한 `pnpm run build:apps` | Vite·생성 파일·버전·코드·설정·수록 패키지·공개 자산 | `dist/editor`, `dist/player` 생성/교체와 빌드 캐시 사용. 끝의 `check-app-boundaries.mjs`가 player의 제작 코드 유입 검사. 발행하지 않음 | 빌드 입력·모드·환경·산출물 해시. 발행할 main 빌드는 아래 단계 기준 적용. 기존 큰 번들 경고만으로 실패 처리하지 않는다. |

`pnpm run test`는 로컬 자산 사전 확인 없는 Vitest 전체 실행, `pnpm run build`는 `build:apps`의 별칭이다. 별도 검사 층으로 계산하지 않는다. 공통 검사에 없는 Python 도구·실제 브라우저·실측은 다음 표에서 선택한다. 폐기 SQL·SQLite 검사는 [지원 종료](verification.md#verification-rules--과거-폐기-sql-검사-종료) 상태다.

## 변경 영향별 선택 검사

명령에서 `변경파일`·`선택한-검사경로` 등은 실제 확인한 경로로 바꾼다. 각 기능 행의 Vitest는 첫 행의 집중 회귀 명령을 사용한다. 브라우저 항목에는 단일 셸 명령이 없으며 지정 도구의 조작과 연결된 절차를 실행한다. 정적 검사만 지시된 작업에서는 테스트·빌드·GUI·실측을 보류한다.

| 검사·목적 | 실행 조건·명령 또는 조작 | 환경·입력 | 부수 효과·허가 | 결과 재사용 시 대조 |
| --- | --- | --- | --- | --- |
| 집중 회귀·실패 재검사 | 관련 코드·검사 수정, 또는 병합으로 일부 입력만 변경. `pnpm exec vitest run 선택한-검사경로...`. portable 전체는 `pnpm run test:portable`, 미디어 범위 전체는 `pnpm run test:local-media` | 선택 파일과 실제 import/호출부. 예: [최근 15파일의 대상 변경](../../records/check-audit-20261111.md#파일별-판단). 생성 입력이 없거나 낡았으면 `pnpm run pretest`로 준비 | 해당 테스트의 메모리 DB·임시 파일·캐시. 직접 Vitest 호출은 pre 단계가 자동 실행되지 않는다. 현재 시험 허가 확인 | 선택한 파일뿐 아니라 제품 호출부·공통 의존성·fixture까지 비교. 전체 회귀가 이미 이 입력을 검사했다면 다시 실행하지 않는다. 집중 성공만으로 전체 회귀 성공을 선언하지 않는다. |
| UI·설정·도움말·입력 | 화면/공통 CSS/이벤트/설정 변경. Safari MCP의 해당 화면 열기·버튼/키보드/터치 조작, [UI 절차](../../how-to/verify.md#ui-review--화면악보재생-검수-절차) | 같은 로컬 앱 5173·실제 자료·브라우저 버전·viewport/방향. editor PC, player 영향받는 PC/폰/태블릿 보기만 | 브라우저 캐시·설정·시험 상태가 바뀔 수 있다. 시작 상태 보존과 변경 상태 정리. GUI 허가 범위 적용 | 코드·CSS·자료·브라우저·보기·초기 상태와 실제 행동이 같을 때만. DOM mock 통과는 화면 증거가 아니다. 공통 화면 변경은 영향받는 두 앱으로 확대 |
| 저장·복원·패키지/목록 연결 | DB·직렬화·백업/복원·패키지·목록 진입점 변경. 해당 storage/record-serialization/shared-score-library/score-package 검사 선택 후, 필요 시 Safari MCP에서 저장→재열기·해당 가져오기/복원 | 승인된 로컬 origin·보존 입력, 지원하는 구형/현행 형식. [호환성 범위](../../how-to/verify.md#testing--호환성과-검사-범위) | 자동 검사는 메모리 DB, GUI는 브라우저 저장소를 쓴다. 실제 사용자 자료의 덮어쓰기·삭제나 실계정 QA는 별도 범위 확인 | 저장 계약·입력 형식·초기 DB·앱/브라우저·경로. codec/메모리 DB 성공으로 실제 앱 저장 결과를 대신하지 않는다. |
| 재생·배속·반복·카운트오프 | 오디오·타이밍·재생 제어/입력 binding 변경. 관련 Vitest + Safari MCP의 [실제 재생 시작](../../how-to/verify.md#testing--safari의-실제-재생-시작)과 영향받는 조작 | 5173·기존 곡/음원·선택한 보기·브라우저·오디오 환경 | 음원 재생·설정/반복 구간 변경 가능. 승인 범위 안에서 원래 상태 보존 | 곡·템포·보기·오디오 경로/환경·코드. AudioContext/위치 진행·출력 신호·사람 청취는 서로 다른 증거 |
| MusicXML·SVG·수록 악보 | renderer·OSMD·글꼴·정본 읽기/쓰기·가사·제목/번호·수록 패키지 변경. 관련 Vitest + Safari MCP의 [악보 대조](../../how-to/review-score.md#원본과-제작기-화면-대조) | 실제 수정 곡/대표 구간·표시 모드·정본/패키지 해시·OSMD/글꼴. 제작 담당의 XSD·원본 의미 근거와 앱 출력 근거 구분 | 파생 렌더 캐시·캡처 생성. 정본 교정·새 악보 생성은 이 검사에 포함하지 않고 제작자 담당 유지 | 조판 입력·OSMD 패치·폰트·캐시 버전·브라우저·배율/보기. XSD 성공으로 실제 SVG를 확인했다고 하지 않는다. 공통 렌더러 변경은 영향받는 표기/줄 경계로 확대 |
| 로딩·스크롤·CPU/메모리 실측 | 반복되는 지연/재로딩, 로딩 경로·대형 의존성·렌더/스크롤 변경, 또는 성능 개선 요청. Safari MCP·브라우저 성능 계측으로 [번들 재조사 조건](verification.md#verification-rules--유지하는-번들sqlite-경고)의 전후 측정 | 동일 곡·보기·브라우저·CPU/네트워크·캐시 조건. 코드·자산과 측정 방법 기록 | 로컬 캐시·임시 계측·결과 기록. 계측 해제 후 기존 상태 복구. 자동 상시 벤치마크/새 CI 차단 기준 추가 없음 | 조건이 같고 경로가 바뀌지 않은 측정만 비교 근거로 사용. 과거 수치를 새 후보 성능으로 표시하지 않는다. Vitest 시간은 브라우저 성능이 아니다. |
| 제작/Apple 보조 도구 단위 검사 | 해당 Python 도구·공통 계약 변경. `python3 -m unittest discover -s tools/score-production/musicxml -p 'test_*.py'`, Apple 도구는 `pnpm run test:local` | [검증한 Python·필수 모듈·기존 입력](../../how-to/produce-score.md#score-tools--실행-예시). 일반 탐색에 포함되지 않는 과거 실측 재현은 별도 요청 대상 | 메모리 fixture·임시 폴더/파일·Python 캐시. 시험 허가 적용. STT/AFM 호출·음원 생성·정본 수정과 별개 | 관련 도구/검사·Python/모듈·입력·외부 도구 버전. 앱 Vitest가 이 도구 검사를 대신하지 않는다. 무관한 앱 릴리스에는 비대상 |
| Python/Swift 정적 검사 | 해당 언어 변경. 확인한 환경에서 `black --check 변경파일`, Python은 `ast.parse`로 구문 확인, Swift는 `swift-format lint 변경파일`·`swiftc -frontend -parse 변경파일` | 실제 사용 가능한 formatter/컴파일러·버전·SDK·변경 파일. [환경 확인](../../how-to/develop.md#development--작업-전-조회와-실행-환경) | 수정/분석/모델 호출 없이 정적 검사. 도구 캐시 가능. 자동 수정은 별도 판단 | 변경 파일·formatter 설정·컴파일러/SDK. 구문 성공을 실행/음원 결과로 확대하지 않는다. |
| 수동 중복·호출 감사 | 공통 UI·재생 소유권/구조 정리에서 추가 조사 필요. `node scripts/checks/check-common-components.mjs --audit`, `node scripts/checks/check-playback-architecture.mjs --audit` | 현재 소스·AST 의존성·검사기 | `docs/experiments/common-components-audit.json`, `playback-call-sites.json` 생성/교체. 기본 공통 검사는 이 보고서를 쓰지 않는다. | 대상 소스·AST/검사기·보고서 입력. 후보 개수 0을 제품 통과 조건으로 만들지 않는다. |
| 중앙 카탈로그 대조 | 의존성 갱신·카탈로그 동기화 작업. `pnpm run catalog:check` | 로컬 중앙 YAML과 `config/shared-catalog.yaml`, Node. CI에는 개인 중앙 경로 없음 | 읽기만 수행. `catalog:sync`는 사본/설치 변경이므로 검사에 포함하지 않음 | 두 YAML의 바이트·검사기. 일반 릴리스는 커밋된 사본과 lockfile을 사용하며 중앙 최신판으로 자동 갱신하지 않는다. |
| 스킬 문법·실행 계약 | 해당 `SKILL.md` 변경. `python3 <skill-creator경로>/scripts/quick_validate.py <스킬폴더>` 실행과 Rule·카탈로그의 순서/조건 대조 | 현재 설치된 skill-creator의 실제 스크립트, Python·PyYAML. [릴리스 스킬](../../../.agents/skills/release-drum-practice/SKILL.md) | 정적 읽기만 수행. 스킬에 적힌 릴리스 명령은 실행하지 않음 | 스킬·검사기·참조 Rule/카탈로그. 문법 성공만으로 절차의 의미가 맞다고 판정하지 않는다. |

과거 renderer benchmark·계측 기록 재현, STT/AFM 실제 실행, 사람의 청취, iOS/iPadOS 실기기·시뮬레이터와 실계정 QA는 일반 릴리스에서 일괄 실행하지 않는다. 요청된 경우에만 해당 절차·실제 명령·환경·쓰기/외부 호출·보존 범위를 먼저 확정한다. 기존 도구가 남아 있다는 사실이 실행 조건은 아니다.

## CI·빌드·발행 단계 검사

아래는 해당 단계를 수행할 때 필요한 검사다. 로컬 선택 검사의 성공으로 생략하지 않는다. 릴리스·원격 작업이 요청되지 않았거나 사용자가 보류했으면 실행하지 않는다.

| 검사·목적 | 실행 조건·명령 또는 조작 | 환경·입력 | 부수 효과·허가 | 결과 재사용 시 대조 |
| --- | --- | --- | --- | --- |
| 의존성 설치·잠금 일치 | 새 checkout 또는 의존성/설치 상태 변경. `pnpm install --frozen-lockfile` | 루트·hosting manifest, workspace/catalog 사본·patch·lockfile·지정 pnpm | registry 읽기, pnpm store/node_modules 쓰기, 허용된 설치 스크립트. lockfile 갱신 없음 | 같은 manifest/lock/patch·플랫폼·pnpm·실제 설치 상태이면 로컬 재설치 불필요. 새 CI/배포 checkout은 frozen 설치 수행 |
| PR/main CI | PR 및 main push 시 `.github/workflows/check.yml`의 `pnpm run verify:portable` | GitHub Ubuntu·`.nvmrc` Node·지정 pnpm·frozen 설치·해당 SHA. 로컬 미디어 없이 unit/integration | CI checkout·의존성/생성 파일·메모리 DB/임시 파일·캐시/로그. 원격 실행은 승인된 push/PR 단계 | 해당 PR head/병합 예정 코드와 main SHA의 실제 CI 결과 확인. 로컬 PASS나 이전 head PASS로 대체하지 않는다. local-media·두 앱 빌드는 별도 |
| 검증된 main의 발행 빌드 | main 병합·CI 확인 후 발행 후보 준비. 입력 대조 후 `pnpm run generate`, `pnpm run bundle:apps` | 고정한 main·같은 패키지/lock/환경·실제 소스 빌드번호 | 생성 파일·두 앱 dist 교체. 앞의 정적/회귀 검사 결과는 동일성 확인 후 재사용 | 발행 후보 main 산출물은 새로 생성. 그 후보로 이미 만든 동일 입력의 성공 빌드는 재개 시 재사용 가능. source/빌드번호·해시가 다른 과거 dist는 금지 |
| Sites 패키징·자산/보안 경계 | 승인된 발행의 반환 checkout에 `node scripts/release/prepare-sites.mjs <checkout>`, `pnpm --dir <checkout> install --frozen-lockfile`, `pnpm --dir <checkout> run build` | 현재 Sites 계약·검증된 player/main·hosting/Worker·source-parity.json. [발행 순서](../../how-to/release.md#sites-publication--발행-순서) 적용 | 배포 사본·의존성·Worker/client 산출물 생성/교체, registry 읽기 가능. 이 명령과 소스 push/발행은 별도 단계 | 이번 후보의 player/사본/Worker 정적 자산 해시·보안 설정 검사 결과. 같은 사본의 성공 빌드를 Sites helper에서 반복하지 않음. 앱 빌드로 패키징 검사를 대체하지 않음 |
| 공개 읽기 확인 | 승인된 배포 성공 후 현재 Sites 상태 조회와 HTTP GET/HEAD: HTML·보안 헤더·JS/CSS/Worker·패키지·폐기 API 404 | 해당 배포 ID·공개 URL·기대 파일/빌드 해시 | 공개 요청만 수행. 로그인·업로드·저장/복원·실계정 상태 변경 없음 | 이전 배포의 응답은 재사용 불가. 이번 배포에서 이미 확인한 동일 파일/상태의 증거는 재개 시 상태 불변 확인 후 재사용. 실제 재생/청취·실계정 QA와 구분 |

## 재검토 시점

새 검사·실행 조건·환경·부수 효과 또는 npm script/CI의 실행 구성이 바뀌면 해당 행과 [검증 Rule](verification.md#verification-rules--검사-정리와-기준-변경)·[릴리스 스킬](../../../.agents/skills/release-drum-practice/SKILL.md#release-check-cleanup)을 함께 대조한다. 단순 테스트 파일 추가마다 전체 목록이나 고정 테스트 수를 복제하지 않는다. 과거 실행 기록은 당시 결과로 보존한다.
