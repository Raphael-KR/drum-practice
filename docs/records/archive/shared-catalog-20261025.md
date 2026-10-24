# 공통 YAML 버전 목록 분리 — 2026-10-25 완료

- 목표: 별도 프로젝트 없이 여러 저장소가 참조할 중앙 버전 목록을 분리한다.
- 범위: `/Users/raphael/Library/Preferences/pnpm/shared-catalog.yaml`, 프로젝트 사본, pnpm 설정·동기화 도구·CI·관련 문서.
- 완료 조건: 기존 버전과 lockfile 그래프를 유지하고 중앙 파일 동기화 및 개인 경로 없는 설치·빌드를 확인한다.
- 제외 범위: 다른 프로젝트 변경, 앱 기능·저장 형식·버전 변경, 커밋·push·PR·발행.
- 검증: 중앙 파일·사본 일치, frozen 설치, lint·서식·세 타입·전체 회귀·두 앱 빌드, 독립 설치와 Sites 빌드.

## 설계

중앙 YAML은 `catalog`만 소유한다. 프로젝트의 `config/shared-catalog.yaml`은 Git으로 보관하는 정확한 사본이다. `pnpm-workspace.yaml`은 pnpm 12.15의 `include`로 이 사본만 참조한다. 프로젝트별 override·설치 정책은 기존 workspace에 둔다.

동기화는 명시적인 `catalog:sync` 명령으로 수행한다. pnpm 자체 설정 파서로 중앙 파일을 확인하고 사본을 갱신한 다음 `pnpm install`로 lockfile과 연결을 갱신한다. 중앙 파일은 동기화 명령이 수정하지 않는다. 중앙 목록과 사본만 비교하는 `catalog:check`도 제공한다.

일반 설치·검사·빌드·CI는 개인 중앙 경로에 접근하지 않는다. CI는 저장소의 사본과 lockfile로 frozen 설치한다. Sites 의존성 내보내기도 같은 사본을 사용한다. 중앙 목록 갱신이 검증된 과거 checkout이나 공개 앱에 자동 반영되지 않게 한다.

## 시작 상태

- main `94f7c8e0b90924fe4ed422b99649568df943f40d`, working tree clean, 두 앱 0.8.17.
- Node 26.12.1, pnpm 12.15.0, 기존 store `/Users/raphael/Library/pnpm/store/v11`.
- 기존 catalog 25개와 루트·hosting의 직접 의존성 26개 선언을 유지한다.
- 사용자 요청에 따라 지정한 중앙 경로 쓰기와 로컬 lint·타입·테스트·빌드를 수행한다.

## 결과

- 중앙 파일과 Git 사본을 생성하고 workspace의 catalog 본문을 사본 `include`로 바꿨다. 기존 25개 정확한 버전·26개 직접 선언·보안 override·공유 저장소를 유지했다. YAML 검사는 이미 설치된 pnpm 파서를 재사용하며 새 패키지를 추가하지 않았다.
- `pnpm run catalog:sync`는 중앙 파일을 검증·복사한 뒤 설치와 lockfile을 동기화한다. `catalog:check`는 두 파일의 바이트를 비교한다. 소스 경로는 `PNPM_SHARED_CATALOG`로 명시할 수 있다. 일반 개발·설치·CI에는 중앙 파일 접근을 추가하지 않았다.
- 사본을 소스 빌드번호 입력에 포함했다. 두 앱 버전 0.8.17을 유지하고 빌드 `ded505d776b6`를 생성했다. CI의 frozen 설치 입력을 명시하고 개발·검증·Sites 절차와 ADR-0028을 갱신했다.
- 중앙/사본 SHA-256: `cfb2bb5a62eaaab076fbe8696da241673c4f7918cb2351311a872fe255848f78`.
- lockfile SHA-256: `d1327ba33a161b567d2c71e373e55b658cf3d8c132d243acdea3dc8a265ce12f`. 이전 파일과 새 독립 설치 후 파일이 바이트 단위로 같다. 버전 변경이 없어 lockfile diff는 생기지 않았다.

## 검증

환경은 macOS arm64·Node 26.12.1·pnpm 12.15.0이다. 근거는 Git 제외 폴더 `.tmp/shared-catalog-20261025/`에 보존했다.

| 검사 | 실제 결과 |
| --- | --- |
| 중앙 → 사본 동기화 | `catalog:sync` 및 `catalog:check` 성공. 같은 내용의 반복 동기화 뒤에도 버전·lockfile 유지 |
| 실패 시 사본 보존 | 없는 소스, 다른 내용의 소스 비교, `include`가 들어간 잘못된 중앙 설정은 오류로 반환하고 사본 유지. 기존 실제 파일을 입력으로 재사용 |
| 고정 설치 | 루트 및 manifest·사본·lockfile만 복사한 별도 폴더에서 `--offline --frozen-lockfile` 성공. 없는 중앙 경로를 환경 변수로 지정해도 일반 설치 성공 |
| 공통 검사 | `pnpm run verify` exit 0. ESLint, 434개 코드/설정 서식, 앱·도구·hosting 타입, i18n·구조·문서 검사 통과 |
| 전체 회귀 | 129개 파일·767개 테스트 통과. 기존 실제 미디어 검사 포함 |
| 두 앱 빌드 | editor/player 분리 빌드와 공개 player의 제작 기능 유입 검사 통과 |
| Sites 독립 준비 | 기존 prepare 도구가 catalog를 해석한 manifest·잠금 파일을 내보냄. 개인 경로·외부 catalog 참조 없음 |
| Sites 설치·빌드 | 별도 로컬 폴더에서 frozen/offline 설치·Worker 빌드 성공. player 45개 파일과 canonical 입력/정적 출력 해시 일치 |
| 앱·자료 보존 | 생성 메타정보를 제외한 src 및 수록 자료 220파일의 이전 SHA-256 일치. 앱/저장/재생 소스와 수록곡 수정 없음 |

주요 근거: `sync.log`, `focused-results.json`, `ci-install.log`, `ci-no-central.log`, `verify.log`, `sites-prepare.log`, `sites-install.log`, `sites-build.log`, `final-proof.json`.

## 한계와 다음 운영

원격 GitHub Actions/Linux Node 22 실행, GUI·청취·iPad·공개 사이트 검사는 수행하지 않았다. CI 재현성은 같은 저장소 입력과 frozen 설치의 로컬 실행으로 확인했으며 원격 CI 통과로 표현하지 않는다. 기존 OSMD 동적 import·청크 크기 및 Node localStorage 경고는 그대로 남아 있다.

중앙 YAML은 Git 저장소 밖에 있으며 프로젝트 사본이 검증한 버전 이력을 남긴다. 다른 프로젝트는 각자 사본·lockfile 동기화와 호환성 검증을 거쳐 연결해야 한다. 이번에는 다른 프로젝트·기존 배포 checkout·전역 pnpm 설정을 수정하지 않았다. HEAD는 시작과 같으며 커밋·push·PR·발행을 수행하지 않았다.
