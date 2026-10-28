# 개발 환경과 공통 문구 작업

문서 역할: **실행 절차**. 현재 요청과 전역·프로젝트 지침의 승인 범위 안에서 수행한다. [정본 목록](../RULES-INDEX.md)과 [작업별 안내](../README.md)를 먼저 확인한다. 예시 명령·과거 기록은 이번 실행의 성공 증거가 아니다.

<a id="i18n--앱-문구-변경-절차"></a>

## 앱 문구 변경 절차

실행 절차다. 요구·예외는 [i18n Rule](../reference/engineering/i18n.md#i18n--사용자-표시-문구와-i18n)을 따른다.

1. 기존 키와 UI 카탈로그 연결을 찾고 한국어 정본에서 재사용/추가한다.
2. 화면·접근성 이름에서 공통 API를 사용한다. 사용자 곡 콘텐츠 예외는 정확한 리터럴만 별도로 검토한다.
3. 현재 [검사 실행 계약](verify.md#testing--개발-검사와-로컬-자산-준비)에 따라 `pnpm run check:i18n`과 변경 범위 검사를 실행한다. 전체 검증이 필요하면 `pnpm run verify`를 사용한다. 명령의 영향·허가는 전역/프로젝트 지침을 따른다.
4. 정적 키·변수·UI 연결·콘텐츠 예외를 확인하고 실제 실행 범위와 미검증을 기록한다. 영어 화면 전체 검수는 번역 추가 때 수행한다.

<a id="readme--개발과-검증"></a>

## 개발과 검증

[소스 권위](../reference/engineering/release.md#deployment-rules--배포-범위와-소스-권위)를 확인한 뒤 실제 프로젝트 루트에서 실행한다.

```sh
pnpm install --frozen-lockfile
pnpm run verify:portable  # 로컬 악보 없이 코드·문서·타입·회귀 검사
pnpm run verify           # 로컬 악보를 포함한 전체 회귀와 두 앱 빌드
```

ESLint는 JS·TS의 코드 규칙을, Prettier는 서식을 검사합니다. `pnpm run lint:fix`는 자동 수정 가능한 ESLint 항목을 수정합니다. 설정과 검사 범위는 [개발 검사](../../docs/how-to/verify.md#testing--eslint)를 참고합니다.

`pnpm run build`와 `build:apps`는 같은 분리 빌드로 `dist/editor/`, `dist/player/`를 생성합니다. `dev`, `dev:editor`, `dev:player`는 같은 생성 준비 단계를 사용합니다. `pnpm run preview`는 player 빌드를 미리 봅니다. 공개 대상은 **player만**이며 발행 절차는 [Sites 발행](../../docs/how-to/release.md#sites-publication--sites-발행-절차)을 따릅니다. 검사 범위는 이 프로젝트의 `tests/`로 한정합니다. `pnpm run test:portable`은 로컬 악보 없이 실행하며, 전체 `test:drum`은 로컬 자료를 포함합니다. [검사·자산 준비](../../docs/how-to/verify.md#testing--개발-검사와-로컬-자산-준비)를 따릅니다.

실행 결과는 `history.md`에 남기고, 공개 반영은 [발행 기록](../records/releases.md#sites-publication-history--sites-발행공개-확인-기록), 실기기 확인은 [검증 현황](../records/acceptance.md#acceptance--검증-현황)에 연결한다.

## 실행 환경과 빠른 시작

루트 [README](../../README.md#로컬-실행)의 Node 요구와 설치·5173 실행 절차를 따른다. 현재 환경과 `.nvmrc`·`package.json`의 지원 범위를 대조하고, 이미 실행 중인 5173 서버를 재사용한다. 기본 개발 소스는 `src/`다. 운영·발행 사본을 별도 개발 정본으로 사용하지 않는다.

## 공유 의존성과 중앙 버전 갱신

다른 프로젝트를 같은 구조로 전환할 때는 [공통 저장소·중앙 YAML 전환 안내](adopt-shared-pnpm-catalog.md)를 따른다. 아래 내용은 이 프로젝트의 실제 운영 절차다.

설치 관리자는 `package.json`의 `packageManager`에 지정한 pnpm이다. 최초 한 번 `npm install --global --allow-scripts=pnpm pnpm@12.15.0`으로 준비한다. npm 12에서도 pnpm 자체의 네이티브 실행 파일 설치만 허용하며, 전역 스크립트 정책은 변경하지 않는다. 각 프로젝트의 라이브러리를 npm 전역 경로에서 직접 import하지 않는다.

- 중앙 정본: `/Users/raphael/Library/Preferences/pnpm/shared-catalog.yaml`의 `catalog`. 별도 저장소나 프로젝트는 만들지 않는다. 중앙 파일에는 버전 목록만 두고 프로젝트별 override·설치 정책은 workspace에 유지한다.
- 프로젝트 사본: `config/shared-catalog.yaml`. `pnpm-workspace.yaml`의 `include`가 이 파일의 `catalog`를 읽으며 앱과 `hosting`의 모든 직접 의존성은 `catalog:`로 참조한다. 사본은 심볼릭 링크가 아닌 일반 파일로 Git에 기록한다.
- 실제 버전·무결성·하위 관계: `pnpm-lock.yaml` 하나. 설치는 루트에서 `pnpm install --frozen-lockfile` 한 번으로 두 패키지를 준비한다.
- 공통 파일: `pnpm store path`가 출력하는 사용자 기본 저장소. 프로젝트 전용 store 경로를 지정하지 않는다. 다른 기기·CI는 자기 저장소를 사용하며 잠금 파일은 같다.
- 기존 npm 잠금 파일을 새로 생성하지 않는다. `npm ci` 대신 pnpm 설치를 사용한다. `predev`·`pretest` 등 기존 생성 단계는 `enablePrePostScripts`로 유지한다.
- 설치 시 esbuild·workerd·fsevents의 기존 플랫폼 준비 스크립트를 허용한다. 브라우저 앱과 기존 검사에서 쓰지 않는 선택적 headless WebGL `gl`의 빌드는 실행하지 않는다.

업데이트는 다음 순서로 수행한다.

1. `pnpm outdated --recursive --include-workspace-root`와 `pnpm audit`로 새 버전과 알려진 취약점을 확인한다. 보안 수정은 우선 처리하고 일반 업데이트도 지속적으로 반영한다.
2. 중앙 YAML의 대상 버전을 최신 안정 버전의 정확한 번호로 바꾸고 `pnpm run catalog:sync`를 실행한다. 이 명령은 pnpm 설정 파서로 중앙 파일과 필요한 항목을 확인하고 사본을 복사한 다음 `pnpm install`로 연결과 잠금 파일을 갱신한다. 중앙 파일을 역으로 덮어쓰지 않는다. 설치가 실패하면 갱신된 사본과 실제 오류를 확인해 해결한 뒤 다시 실행한다. 하위 보안 override는 상위 패키지에 수정이 포함됐는지 확인한 뒤 조정한다.
3. 필요한 호환성 코드를 수정하고 `pnpm run verify`를 실행한다. Sites 입력도 [발행 준비 절차](release.md#sites-publication--발행-순서)로 새로 내보내 독립 설치·빌드를 확인한다.
4. 변경 버전·영향·검사 결과를 기록한다. 공개 앱은 사용자 발행 요청 후 새 빌드가 배포되어야 업데이트가 반영된다.

새 의존성도 중앙 `catalog`에 먼저 추가한 뒤 해당 `package.json`에서 `catalog:`로 참조하고 동기화한다. `catalogMode: strict`를 유지한다. `pnpm add`·`pnpm update`가 프로젝트 사본을 수정할 수 있으므로 버전 변경은 중앙 파일에서 시작한다. 사본만 수정된 경우 차이를 검토하고 승인된 값을 중앙에 반영한 뒤 다시 동기화한다.

```sh
pnpm run catalog:sync   # 중앙 YAML 검사·사본 복사 후 설치 및 lockfile 갱신
pnpm run catalog:check  # 중앙 YAML과 사본의 바이트 일치만 검사
pnpm install --frozen-lockfile  # 사본과 lockfile의 설치 정합성 검사
```

`catalog:check`는 lockfile·호환성 검사를 대신하지 않는다. 두 명령의 기본 중앙 경로는 현재 사용자 홈 아래 `Library/Preferences/pnpm/shared-catalog.yaml`이며, 다른 기기에서는 `PNPM_SHARED_CATALOG` 환경 변수로 소스를 명시할 수 있다. 파일이 없으면 해당 경로를 포함한 오류를 보고하며 중앙 목록을 임의 생성하지 않는다.

CI·새 checkout·일반 설치는 저장소의 사본과 lockfile만 사용한다. 중앙 파일이 없어도 실행되며 설치 전에 자동 동기화하지 않는다. `catalog:check`는 중앙 목록과 비교하려는 로컬 작업에서만 호출한다. 저장소에는 검증한 사본·lockfile·호환성 수정을 함께 기록한다. 중앙 파일은 별도로 보관해야 하며 각 저장소의 사본은 당시 검증 버전의 기록이다.

다른 프로젝트도 같은 중앙 YAML을 자기 저장소의 사본으로 동기화하고 그 사본을 `include`로 참조할 수 있다. 자기 manifest에는 필요한 라이브러리만 선언한다. 중앙 목록에 항목이 있다는 이유만으로 모든 패키지가 설치되지는 않는다. 이번 실제 연결 범위는 드럼 프로젝트의 앱·Sites 빌드 두 패키지이며 다른 프로젝트는 아직 변경하지 않았다.
