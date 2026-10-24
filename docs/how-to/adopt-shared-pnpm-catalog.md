# 다른 프로젝트의 pnpm 공통 저장소·중앙 버전 목록 전환 안내

이 안내는 드럼연습실에서 검증한 방식을 다른 Node.js 프로젝트에 적용하는 절차다. 별도 중앙 관리 프로젝트는 만들지 않는다. **패키지 파일은 pnpm 공통 저장소에서 공유하고, 사용할 버전은 공통 YAML에서 관리한다.** 각 프로젝트에는 필요한 의존성 선언·카탈로그 사본·lockfile·연결 정보가 남는다.

- 목표: 대상 프로젝트가 같은 pnpm 저장소와 중앙 버전 목록을 사용하게 한다.
- 범위: 대상 프로젝트의 의존성 선언·카탈로그 사본·동기화·설치·CI·빌드 문서.
- 완료 조건: 중앙 목록과 사본 일치, frozen 설치, 기존 기능·호환성·프로젝트 검사·빌드 통과.
- 제외 범위: 다른 프로젝트의 무단 변경, 기존 자료 삭제, 자동 커밋·푸시·발행.
- 검증: 변경 전후 의존성 대조, 저장소 경로, 중앙 파일 없는 CI 설치, 대상 프로젝트의 기존 검사.

작성 기준은 2026-10-25, 드럼연습실 0.8.18이다. 아래 명령은 **전환할 프로젝트 루트**에서 실행한다. 대상 프로젝트를 실제로 전환한 결과 보고서는 아니다.

## 1. 공유 대상과 프로젝트별 파일

| 구분 | 위치 | 역할 |
| --- | --- | --- |
| 중앙 버전 정본 | `/Users/raphael/Library/Preferences/pnpm/shared-catalog.yaml` | 여러 프로젝트가 맞춰 사용할 정확한 버전 목록 |
| 공통 패키지 파일 | `pnpm store path`의 출력 | pnpm이 관리하는 공유 저장소 |
| 프로젝트 카탈로그 사본 | `config/shared-catalog.yaml` | 중앙 YAML의 일반 파일 사본. Git에 기록 |
| 프로젝트 설정 | `pnpm-workspace.yaml` | 사본을 `include`로 참조. 패키지 구성·설치 정책 유지 |
| 필요한 라이브러리 선언 | 각 `package.json` | 사용하는 항목만 `catalog:`로 참조 |
| 실제 설치 해석 | `pnpm-lock.yaml` | 직접·전이 의존성의 버전·무결성·관계를 고정 |
| 설치 연결 | 프로젝트의 `node_modules` | pnpm이 만들고 관리. Git에서 제외 |

이 Mac에서 확인한 저장소는 `/Users/raphael/Library/pnpm/store/v11`이다. 경로 끝의 `v11`은 설정에 고정하지 않고 `pnpm store path`로 확인한다. 같은 기기·사용자에서 기본 저장소를 재사용하며 프로젝트 전용 `storeDir`을 새로 지정하지 않는다. 다른 기기와 CI는 각 환경의 저장소를 사용한다.

pnpm은 저장소의 파일을 재사용하고 의존 관계를 링크로 구성한다. 따라서 프로젝트별 `pnpm install`은 필요하다. 전역 `node_modules`를 직접 import하거나 모든 프로젝트가 하나의 `node_modules`를 공유하게 만들지 않는다. 파일 재사용 방식과 절감량은 파일시스템·설치 환경에 따라 달라진다. [공식 파일·링크 구조](https://pnpm.io/symlinked-node-modules-structure)

## 2. 전환 전 확인

1. 전역·대상 프로젝트의 `AGENTS.md`와 개발/배포 문서를 읽는다. 현재 루트·브랜치·미커밋 변경·실행 중인 서버를 확인하고 기존 작업을 보존한다.
2. 루트와 하위 패키지의 manifest, 기존 lockfile, Node 버전, 패키지 관리자, CI·Docker·호스팅 설치 명령을 확인한다.
3. 각 직접 의존성의 기존 버전과 중앙 목록의 버전을 비교한다. 저장 형식·네이티브 모듈·빌드 도구·peer dependency의 영향도 함께 본다.
4. 중앙에 있는 패키지는 중앙 버전을 적용하고 필요한 호환성 코드를 수정한다. 중앙에 없는 항목은 실제 사용하는 패키지만 정확한 버전으로 추가한다. 기존 중앙 항목을 대상 프로젝트의 옛 버전으로 조용히 덮어쓰지 않는다.
5. 중앙의 기존 항목도 변경해야 한다면 그 항목을 쓰는 다른 프로젝트의 영향과 검증 범위를 정한다. 한 프로젝트의 성공을 전체 프로젝트의 전환 완료로 보고하지 않는다.

```sh
pwd
git status --short --branch
node --version
pnpm --version
pnpm store path
```

현재 검증된 pnpm은 **12.15.0**이다. 이 안내의 파일 분리용 `include`는 이 버전부터 지원한다. 대상 프로젝트의 `packageManager`에 정확한 버전을 기록하고 CI에도 같은 버전을 사용한다. Node는 대상 프로젝트의 `engines`·도구 호환성을 확인해 정한다. pnpm을 준비하기 위해 모든 라이브러리를 전역 설치할 필요는 없다. [공식 include 지원·경로 규칙](https://pnpm.io/config-includes)

## 3. 기존 의존성 해석을 보존하며 pnpm 준비

이미 pnpm을 쓰면 기존 lockfile과 workspace를 유지한다. npm/Yarn에서 옮기면 manifest의 버전을 `catalog:`로 바꾸기 **전에** 기존 lockfile을 기준으로 가져온다.

```sh
pnpm import
```

이 명령은 `package-lock.json`, `npm-shrinkwrap.json`, `yarn.lock`을 지원한다. 모노레포는 실제 하위 패키지 경로를 `pnpm-workspace.yaml`의 `packages`에 먼저 선언한다. 다른 형식의 lockfile은 이 명령이 지원한다고 가정하지 않는다. 가져온 뒤 변경 전후 직접 의존성·주요 전이 의존성을 대조한다. [공식 import 절차](https://pnpm.io/cli/import)

기존 설치 폴더나 lockfile을 먼저 삭제하지 않는다. 필요한 경우 프로젝트 내부 보존 경로로 옮긴 뒤 pnpm 설치를 준비한다. 전환 검증 후 예전 lockfile의 Git 유지 여부를 정하고 설치 진입점은 pnpm으로 통일한다. 기존 서버 재시작·삭제·원복은 대상 프로젝트의 승인 범위를 따른다.

## 4. 중앙 YAML의 사본과 참조 구성

### 카탈로그 사본

중앙 정본이 있는지 확인하고 `config/shared-catalog.yaml`에 내용을 그대로 복사한다. 기존 사본이 있으면 차이를 검토한 뒤 아래 동기화 도구로 갱신한다. 심볼릭 링크를 만들지 않는다. 중앙 목록의 일부만 추려 사본을 만들지도 않는다.

중앙 파일은 다음 구조로 **버전 목록만** 가진다. 패키지별 값은 실제 중앙 파일을 사용하며 이 예시에 새 버전 정본을 만들지 않는다.

```yaml
catalog:
  typescript: "5.9.3"
```

중앙에 대상 프로젝트가 사용하지 않는 항목이 있어도 그 항목이 자동 설치되지는 않는다. 중앙 파일을 다른 프로젝트의 목록으로 통째로 교체하거나 미사용 항목을 임의로 지우지 않는다.

### pnpm-workspace.yaml

다음 설정을 기존 파일에 **병합**한다. 실제 `packages`, override, patch, registry, 네이티브 빌드 정책은 대상 프로젝트에 맞게 유지한다.

```yaml
catalogMode: strict
saveExact: true
include:
  ./config/shared-catalog.yaml: [catalog]
```

루트에 같은 기본 `catalog` 본문을 중복 정의하지 않는다. 중앙 YAML의 절대경로를 `include`에 직접 넣지 않는다. 이미 이름 있는 catalog를 사용하면 각 참조를 먼저 확인하고 이행한다. [설정 소유권과 중복 규칙](https://pnpm.io/config-includes#delegation-and-ownership)

전체 중앙 사본을 유지하므로 `catalogPrune` 또는 이전 이름 `cleanupUnusedCatalogs`로 미사용 항목을 자동 제거하지 않도록 설정을 확인한다. `catalogMode: strict`는 `pnpm add`의 버전 선택을 제어하며, 기존 manifest를 자동으로 전환하는 명령은 아니다. [공식 catalog 설정](https://pnpm.io/catalogs#settings)

### package.json

기존 파일에 아래와 같은 변경을 적용한다. 예제의 패키지가 실제로 필요하지 않다면 추가하지 않는다.

```json
{
  "packageManager": "pnpm@12.15.0",
  "devDependencies": {
    "typescript": "catalog:"
  },
  "scripts": {
    "catalog:sync": "node scripts/dependencies/sync-catalog.mjs && pnpm install",
    "catalog:check": "node scripts/dependencies/sync-catalog.mjs --check"
  }
}
```

일반 registry 의존성은 필요한 항목만 `catalog:`로 바꾼다. 프로젝트 내부 `workspace:`·`file:`·`link:` 참조, alias·Git URL·patch 의미를 일괄 치환하지 않는다. 공개 라이브러리의 `peerDependencies`는 소비자 지원 범위를 뜻하므로 중앙의 단일 실행 버전으로 무조건 좁히지 않는다. [공식 catalog 참조](https://pnpm.io/catalogs#the-catalog-protocol-catalog)

## 5. 동기화 도구 이식

검증된 참고 구현은 `/Users/raphael/Playground/drum-practice/scripts/dependencies/sync-catalog.mjs`다. 이 파일을 대상 프로젝트의 같은 상대경로로 복사하고 그 프로젝트가 소유·관리한다. 매 실행마다 드럼 프로젝트의 스크립트를 절대경로로 호출하는 방식으로 연결하지 않는다.

**현재 구현의 검사 목록은 `package.json`과 `hosting/package.json`으로 고정되어 있다. 복사 후 반드시 대상 프로젝트의 실제 manifest 목록으로 바꾼다.** `hosting` 폴더가 없는 프로젝트에서 그대로 실행하면 실패한다.

```js
// 단일 패키지 프로젝트의 검사 대상
for (const file of ["package.json"]) {
  // 원래 검사 본문 유지
}
```

모노레포라면 `packages`에 속한 실제 manifest를 빠짐없이 포함한다. 경로를 변경하면 스크립트의 프로젝트 루트 계산(`../../`)도 맞춘다. `.mjs`는 별도 YAML 라이브러리를 추가하지 않고 pnpm의 설정 파서를 사용한다.

이식할 때 유지할 동작은 다음과 같다.

- 기본 입력은 사용자 홈 아래 `Library/Preferences/pnpm/shared-catalog.yaml`이다. 필요하면 `PNPM_SHARED_CATALOG`로 명시한다.
- 중앙 파일에서 캡처한 바이트를 검증한 뒤 프로젝트 사본을 갱신한다. 중앙 파일은 수정하지 않는다.
- 임시 파일은 대상 프로젝트의 `.tmp/` 아래에 둔다. 그 폴더는 Git에서 제외한다.
- 필요한 catalog 항목과 YAML 해석을 확인한다. 실패 시 원인·경로·기대/실제 값을 출력하고 기존 사본을 보존한다.
- `--check`는 중앙과 사본의 바이트 일치만 확인한다. 설치·lockfile·앱 호환성 검사는 별도다.

초기 연결과 이후 동기화는 같은 명령으로 실행한다.

```sh
pnpm run catalog:sync
pnpm run catalog:check
pnpm install --frozen-lockfile
```

`catalog:sync`는 사본을 갱신한 다음 설치·lockfile 갱신을 수행한다. 설치가 실패하면 사본은 이미 갱신됐을 수 있다. 해당 오류를 해결하고 설치를 다시 실행한 뒤 사본·lockfile·기능을 확인한다. `catalog:check`만 통과했다고 전환 완료로 판단하지 않는다.

중앙 파일이 없으면 임의로 새 목록을 만들지 않는다. 기존 Git 사본으로 일반 설치·빌드·CI를 계속할 수 있고, 중앙 동기화만 경로를 확보한 뒤 재개한다.

## 6. 기존 실행·빌드·배포 경로 맞추기

- 개발 스크립트·CI·Docker·호스팅의 `npm ci`와 패키지 관리자 호출을 pnpm 방식으로 맞춘다. `npx`는 로컬 실행 목적이면 `pnpm exec` 등 실제 용도에 맞게 바꾼다.
- 기존 `predev`·`pretest` 같은 사용자 스크립트가 필요하면 `enablePrePostScripts` 적용 여부를 확인한다. 생성 단계가 빠진 채 빌드가 통과하지 않도록 한다.
- 네이티브 의존성이 요구하는 설치 스크립트와 기존 빌드 허용 정책을 확인한다. 드럼 프로젝트의 `allowBuilds`·보안 override를 다른 프로젝트에 그대로 복사하지 않는다.
- 기존 hoisting에 기대어 미선언 패키지를 import했다면 실제 소유 패키지의 manifest에 선언한다. 경고를 숨기거나 전역 경로를 끼워 넣어 해결하지 않는다.
- 호스팅이 npm 전용이라면 `catalog:`가 남은 manifest를 그대로 보내지 않는다. 검증한 사본·lockfile에서 해당 배포 패키지의 독립 입력을 내보내고 별도 설치·빌드를 확인한다. 드럼 프로젝트의 Sites 준비 스크립트는 player 전용이므로 다른 앱에 그대로 실행하지 않는다.

## 7. CI 재현성 유지

Git에는 각 manifest, `pnpm-workspace.yaml`, `config/shared-catalog.yaml`, `pnpm-lock.yaml`, 프로젝트용 동기화 도구와 필요한 설정을 함께 기록한다. 개인 중앙 파일과 `node_modules`, 공통 저장소는 넣지 않는다.

CI는 다음 순서로 실행한다. 프로젝트의 기존 workflow를 수정하고 별도 workflow를 중복 생성하지 않는다.

1. 저장소 checkout.
2. `packageManager`에 고정한 pnpm과 대상 프로젝트의 Node 준비.
3. `pnpm-lock.yaml`을 기준으로 pnpm 캐시 연결.
4. `pnpm install --frozen-lockfile`.
5. 기존 lint·서식·타입·테스트·빌드 명령 실행.

설치 예시:

```yaml
- uses: pnpm/action-setup@v6
- uses: actions/setup-node@v4
  with:
    node-version-file: .nvmrc
    cache: pnpm
    cache-dependency-path: pnpm-lock.yaml
- run: pnpm install --frozen-lockfile
```

위 action 버전은 드럼 프로젝트의 검증 구성을 옮긴 예시다. 대상 저장소의 action 고정 정책·Node 설정에 맞춘다. CI·일반 설치·빌드에서는 `catalog:sync`나 개인 경로를 요구하는 `catalog:check`를 자동 실행하지 않는다. 커밋된 사본으로 설치해야 과거 커밋도 다시 빌드할 수 있다.

## 8. 전환 완료 확인

| 확인 항목 | 확인 방법 |
| --- | --- |
| 공통 파일 저장소 | 대상 루트의 `pnpm store path`를 같은 Mac의 기준 출력과 대조 |
| 중앙 버전 일치 | `pnpm run catalog:check`와 manifest의 참조 확인 |
| 설치 재현성 | `pnpm install --frozen-lockfile` 성공, 개인 중앙 경로가 없는 CI에서도 성공 |
| 의존성 호환성 | 변경 전후 직접 버전·peer·엔진·native 모듈·주요 전이 의존성 대조 |
| 코드 품질·기능 | 대상 프로젝트의 lint·서식·타입·관련/전체 테스트·빌드 |
| 런타임 | 영향받는 실제 사용 흐름과 저장 호환성을 승인된 환경에서 확인 |
| 배포 입력 | 별도 배포 패키지가 있으면 독립 설치·빌드 확인 |
| 상태 보고 | 변경 파일·버전 차이·검사 결과·실패/미확인·커밋/배포 여부 기록 |

시험은 전역·대상 프로젝트의 실제 영향별 승인 범위에서 실행한다. 이 안내에 명령이 있다는 이유로 운영 데이터 변경·유료 호출·외부 쓰기를 수행하지 않는다. 문서 링크 검사만으로 다른 프로젝트의 호환성을 확인했다고 보고하지 않는다.

## 9. 이후 버전 갱신

1. `pnpm outdated --recursive --include-workspace-root`와 `pnpm audit`, 관련 공식 릴리스 정보를 확인한다. 이 조회는 외부 registry 연결을 수반한다.
2. 중앙 YAML에서 대상 패키지의 정확한 버전을 갱신한다. 보안 수정과 일반 업데이트를 지속해서 반영한다.
3. 그 패키지를 사용하는 각 프로젝트에서 `catalog:sync`를 실행하고 호환성 코드를 수정한다.
4. 각 프로젝트의 사본·lockfile·검증 결과를 함께 갱신한다. 실패한 프로젝트는 실패 이유와 남은 변경을 기록한다.
5. 각 프로젝트의 승인된 릴리스 절차로 배포한다. 중앙 YAML을 저장하는 것만으로 실행 중 앱이나 공개 사이트가 갱신되지는 않는다.

`pnpm add` 등은 `include`가 가리키는 **프로젝트 사본**을 수정할 수 있다. 사본만 달라졌으면 차이를 검토해 중앙 정본에 필요한 변경을 반영하고 다시 동기화한다. 전이 의존성은 상위 패키지 요구에 따라 여러 버전이 남을 수 있다. 모든 하위 버전을 override로 강제 통일하는 작업과 직접 의존성의 중앙 관리를 구분한다.

## 다른 프로젝트 담당자에게 전달할 지시문

```text
현재 프로젝트를 pnpm 공통 저장소와 /Users/raphael/Library/Preferences/pnpm/shared-catalog.yaml 기반으로 전환해줘.

먼저 /Users/raphael/AGENTS.md와 이 프로젝트의 AGENTS.md를 읽고, 현재 Git 상태·기존 설치/lockfile·CI·배포 경로를 확인해.
/Users/raphael/Playground/drum-practice/docs/how-to/adopt-shared-pnpm-catalog.md를 참고하되, 드럼 프로젝트 전용 설정을 그대로 복사하지 마.

중앙 YAML의 일반 파일 사본을 이 저장소의 config/shared-catalog.yaml에 두고 pnpm include로 참조해. 프로젝트는 필요한 의존성만 catalog:로 선언하고, 사본과 pnpm-lock.yaml을 함께 관리해. 동기화 스크립트의 검사 대상은 이 프로젝트의 실제 모든 package.json으로 맞춰줘. CI·일반 설치는 개인 중앙 파일 없이 frozen 설치가 되어야 해.

기존 기능·저장 호환성과 사용자 변경을 보존하고, 중앙 버전 적용에 필요한 호환성 수정과 lint·서식·타입·테스트·빌드를 확인해. 외부 호출·운영 변경을 포함한 검사는 해당 승인 범위를 먼저 확인해. 기존 중앙 항목 변경이 다른 프로젝트에 영향을 주면 그 범위를 보고해. 커밋·푸시·발행은 아직 하지 마.
```

이 파일을 전달하는 것과 실제 프로젝트 전환·메시지 전송은 별개다. 이번 안내문 작성으로 다른 프로젝트를 수정하지 않았다.

## 참고 구현과 검증 기록

- [드럼 프로젝트 개발·동기화 절차](develop.md#공유-의존성과-중앙-버전-갱신)
- [프로젝트용 동기화 스크립트](../../scripts/dependencies/sync-catalog.mjs)
- [공유 저장소·카탈로그 결정](../decisions/0028-shared-dependency-store-and-catalog.md)
- [중앙 YAML 분리 검증](../records/archive/shared-catalog-20261025.md)
- [0.8.18 발행 기록](../records/releases.md#release-0-8-18-20261025)
