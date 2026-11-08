# pnpm 실행 버전과 카탈로그·OSMD 패치 동기화

- 목표: 최신 안정 pnpm으로 실행 버전 문제를 해결하고 중앙 카탈로그·프로젝트 사본·잠금 파일·OSMD JSZip 공유 패치를 일치시킨다.
- 범위: 전역 pnpm 설치, 프로젝트 packageManager와 설치 입력, OSMD 패치, 영향받는 호환성 코드·운영 문서.
- 완료 조건: 같은 pnpm 버전으로 include 해석·중앙 사본 대조·frozen 설치가 성공하고 lint·타입·기존 전체 테스트·두 앱 및 Sites용 빌드가 통과한다.
- 제외 범위: 커밋·푸시·발행, iPhone 재로드 진단, 사용자 악보·원본·저장 형식 변경, 브라우저 화면 검증.
- 검증: 기존 `pnpm run verify`, 카탈로그 대조·frozen 설치·JSZip 정적 검사, 기존 실제 자산 해시 대조, hosting 빌드의 독립 설치 재현.

## 시작 상태와 진행 순서

- 시작 HEAD는 `dd0b120`이며 작업 트리는 clean이다. `main`에는 원격 추적 지점보다 로컬 커밋 2개가 있다.
- 공식 npm `latest`와 [pnpm 공식 릴리스](https://github.com/pnpm/pnpm/releases/tag/v12.18.0)에서 최신 안정 12.18.0을 확인했다. 전역 패키지 manifest는 12.18.0인데 실제 명령은 11.25.0이며, 프로젝트의 지정 버전은 12.15.0이다.
- 중앙 `/Users/raphael/Library/Preferences/pnpm/shared-catalog.yaml`과 Git 사본은 SHA256 `23a8a538b78fa82b11415075e5daf4246ce1a05fdc8689696176cf7f534ed108`로 같다. 선언된 새 버전 13개를 기준으로 설치·잠금 파일·패치의 미완료 동기화를 마친다.
- 전역 실행 파일과 프로젝트 pin을 12.18.0으로 맞추고 기존 OSMD 2.2.1 패치를 2.3.0 배포 파일에 맞게 갱신한다. JSZip 모듈 외의 변경 여부와 원본/적용 후 해시를 확인한다.
- 전체 검사 실패는 실제 원인을 수정하고 영향받는 검사를 다시 실행한다. 설치 규칙·회귀 기대값의 임의 완화로 성공 처리하지 않는다. 아래에 실제 실행 결과와 한계를 기록한다.

## 실행 결과

### pnpm 실행 파일과 설치 입력

전역 pnpm의 네이티브 실행 파일이 텍스트 placeholder 상태여서 이전 11.25.0 구현으로 실행됐다. `npm install --global --allow-scripts=pnpm pnpm@12.18.0`으로 pnpm 자체의 설치 스크립트만 허용해 다시 설치했다. 실행 파일이 Mach-O arm64이고 프로젝트 밖과 루트의 실제 명령이 12.18.0임을 확인했다. 전역 스크립트 정책은 변경하지 않았다.

루트 `packageManager`와 잠금 파일의 pnpm pin을 12.18.0으로 맞췄다. 이 버전은 카탈로그 사본의 `include`와 override의 `catalog:`를 정상 해석한다. 중앙 YAML과 프로젝트 사본은 수정하지 않았으며, 두 workspace의 직접 의존성 26개를 설치 버전과 대조했다. 실제 설치와 샌드박스 밖의 `pnpm store path`에서 사용자 공통 저장소 `/Users/raphael/Library/pnpm/store/v11`을 확인했다. 샌드박스 안의 경로 조회는 쓰기 권한 때문에 Playground 아래 fallback을 표시하므로 실제 설치 근거와 구분한다. 기존 `allowBuilds`·override·OSMD 릴리스 나이 예외는 보존했다.

이번 설치에 반영한 중앙 목록의 갱신은 아래 13개다. 비교 기준은 시작 HEAD의 lockfile이며 다른 직접 의존성 버전은 그대로다.

| 패키지 | 이전 설치 | 반영 버전 |
| --- | --- | --- |
| @cloudflare/vite-plugin | 1.65.0 | 1.67.0 |
| @napi-rs/canvas | 1.0.13 | 1.1.0 |
| @types/node | 26.6.5 | 26.6.6 |
| eslint | 10.13.0 | 10.14.0 |
| fake-indexeddb | 6.2.6 | 6.2.7 |
| globals | 17.13.0 | 17.14.0 |
| music-metadata | 12.2.3 | 12.3.5 |
| opensheetmusicdisplay | 2.2.1 | 2.3.0 |
| pdfjs-dist | 6.4.299 | 6.5.438 |
| typescript-eslint | 8.72.0 | 8.72.1 |
| vite | 8.3.5 | 8.3.6 |
| vitest | 5.0.5 | 5.1.0 |
| wrangler | 4.152.0 | 4.158.0 |

### OSMD 공유 패치

OSMD 2.3.0의 내장 JSZip은 3.10.2다. 구버전이라는 초기 추정을 바로잡았으며, 앱과 같은 버전의 중복 코드이므로 기존 공유 연결을 유지했다. TypeScript AST로 확인한 Webpack 모듈 `1710` 하나만 `require("jszip")`으로 교체했다. 해당 모듈 외 바이트는 원본과 같고 pnpm이 마지막 줄바꿈 1바이트를 추가한다. 이전 2.2.1용 패치는 새 패치로 교체했다.

- 원본 SHA256: `20cf7cd331637af5ef5786cfdfb67e106a181ba5c6a5c4c86adee4b96a7c6639`.
- 설치 후 SHA256: `518fb32b825513b5d301595593f5f52af0034c41bde8a7950ab35eaf7db198ad`.
- 파일 크기: 1,459,236 → 1,362,623바이트, 96,613바이트 감소. 최종 전송량 절감 측정으로 간주하지 않는다.
- JS 문법, 앱/OSMD의 실제 JSZip 경로 일치, 내장 코드 제거, 라이선스 항목 하나를 확인했다. 렌더 캐시 키는 기존 `SCORE_RENDER_POLICY`의 OSMD 버전 입력으로 갱신되므로 저장 스키마 변경은 필요 없다.

### 검사·Sites 준비 호환성

첫 전체 검사는 793개 통과·4개 실패였다. Node 26.13.0의 ICU 79.1/CLDR 49는 한국어 날짜를 `/`로 표시하지만 기존 DOM 검사는 `.`을 고정했다. 이 검사 실패로 설정창 종료가 실행되지 않아 후속 조작 검사 3개도 실패했다. 연·월·일·24시간 시·분·KST를 엄격하게 대조하면서 ICU의 두 구분자를 허용하도록 기존 검사만 수정했다. 앱의 날짜 표시 코드·설정·저장 동작은 바꾸지 않았다. 집중 재검사 26개와 전체 797개가 통과해 후속 실패도 해소됐음을 확인했다.

Sites 입력 준비는 `deployment/sites` 대신 작업 전용 `.tmp/pnpm-catalog-sync-20261108/sites-build`에서 실행했다. 새 pnpm의 공급망 검사에 필요한 `workerd` 메타데이터가 없어 기존 `--offline` 강제 단계가 `ERR_PNPM_NO_OFFLINE_META`로 실패했다. pin을 추가하는 lockfile 전용 명령만 `--prefer-offline`으로 바꿔 누락 메타데이터를 읽도록 했다. 공급망·무결성 정책은 유지하며, [pnpm 공식 옵션](https://pnpm.io/cli/install#--prefer-offline)의 동작을 따른다. 원래 `deploy`가 내보낸 의존성을 유지하는지와 최종 frozen 설치·빌드를 확인했다.

일부 최초 CLI 호출은 샌드박스 DNS 제한으로 실패해 중단하고 네트워크가 허용된 같은 명령으로 재실행했다. 프로젝트 설정이나 보안 검사를 우회하지 않았다.

## 검증 결과

환경은 macOS arm64, Node 26.13.0, pnpm 12.18.0이다. 이번 증거는 로컬 CLI 검사이며 원격 CI·Safari 화면·실기기 검증으로 확대하지 않는다.

| 검사 | 결과 |
| --- | --- |
| `pnpm run catalog:check`, 사본/중앙 바이트·설치 대조 | 동일 SHA256, 직접 의존성 26개 일치 |
| `pnpm install --frozen-lockfile --offline` | 두 workspace 성공, 잠금 파일 재해석 불필요 |
| 중앙 파일 경로가 없는 임시 CI 입력의 frozen/offline lockfile 검사 | 저장소 manifest·사본·패치·lockfile만으로 성공. 실제 Linux CI 실행은 아님 |
| `pnpm run verify` | lint·445파일 서식·앱/도구/hosting 타입·공통 구조·152문서·17로컬 자산·131파일 797테스트·두 앱 빌드 통과 |
| Sites 준비 호환성 수정 후 `pnpm run check`, `pnpm run build` | 최종 소스 재검사·두 앱 빌드 통과 |
| Sites용 독립 frozen 설치·`pnpm run build` | Vite 8.3.6 Worker 빌드, 원본과 package/snapshot 각 178개 및 직접 의존성 버전 일치, player 48파일 해시 대조 통과 |
| 기존 수록 `.drumscore` 6개 SHA256 | 시작 시점과 모두 같음 |

로컬 증거는 `.tmp/pnpm-catalog-sync-20261108/`의 `baseline.json`, `resolved-catalog.json`, `installed-catalog-evidence.json`, `osmd-patch-evidence.json`, `frozen-install.log`, `ci-input.log`, `verify.log`, `ui-recheck.log`, `verify-final.log`, `check-final.log`, `build-final.log`, `sites-prepare-final.log`, `sites-install.log`, `sites-build.log`, `sites-lock-parity.json`에 보존했다. 원본 미디어나 사용자 브라우저 저장 자료를 변경하지 않았다.

## 보안 검사와 남은 범위

- 아래 보안 결과는 최초 pnpm 동기화 시점의 기록이다. 이후 사용자 지시로 [minimatch 보안 수정](minimatch-security-20261108.md)을 마쳤고 전체·실행 의존성 audit 0건을 확인했다. 후속 변경·검증은 별도 기록을 따른다.
- `pnpm audit --prod --json`은 알려진 취약점 0건이다. 전체 audit에는 개발 도구 ESLint/typescript-eslint의 간접 의존성 `minimatch` 10.2.6의 moderate 1건이 남았다. [공식 GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)의 수정 버전은 11.0.1 이상이며, 이 작업에서는 중앙 목록 밖의 major override를 추가하지 않았다. `audit.json`과 `audit-prod.json`에 결과를 구분해 남겼다.
- 기존 OSMD 정적/동적 import·큰 청크·Node localStorage 경고는 검사 통과와 구분한다. 경고 억제·검사 skip·오류 숨김은 추가하지 않았다.
- 앱 버전은 두 앱 모두 0.10.1, 최종 소스 빌드는 `e323433349c2`다. 변경은 미커밋 상태로 유지했으며 커밋·푸시·발행은 수행하지 않았다. 공개 앱은 이전 배포 그대로다.
- iPhone Safari 재로드 진단은 문제 기기 확인 전까지 유보한다. 이번 CLI 통과로 해당 현상이 해결됐다고 판단하지 않는다.
