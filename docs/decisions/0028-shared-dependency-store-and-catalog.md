---
status: accepted
date: 2026-10-25
---

# pnpm 공유 저장소와 중앙 버전 카탈로그를 사용한다

## Context and Problem Statement

사용자는 패키지 파일을 공유하고 공통 버전을 지속적으로 갱신하며, 프로젝트 코드를 그 변화에 맞춰 수정·검증하는 운영을 요청했다. 첫 적용 범위는 이 프로젝트이며 커밋·push·발행은 제외했다. 기존 앱과 Sites 빌드는 별도 npm 잠금 파일로 관리되어 같은 Vite 버전도 두 곳에서 선언했다.

## Considered Options

- npm 전역 설치를 직접 import하도록 프로젝트의 모듈 탐색 경로를 바꾼다.
- pnpm의 공통 저장소·workspace catalog·공용 잠금 파일을 사용한다.

## Decision Outcome

pnpm 방식을 채택한다. 루트와 `hosting`은 직접 의존성을 `catalog:`로 선언하고 중앙 목록에 정확한 버전을 기록한다. 첫 목록은 직전 검증된 설치 버전으로 시작한다. 버전 갱신 시 중앙 목록과 잠금 파일을 함께 갱신하고 기능·보안·타입·테스트·빌드를 확인한다.

2026-10-25 후속 결정: 별도 프로젝트 없이 `/Users/raphael/Library/Preferences/pnpm/shared-catalog.yaml`을 여러 프로젝트가 공유할 버전 정본으로 분리한다. 각 저장소에는 일반 파일 사본을 보관한다. 이 프로젝트는 `config/shared-catalog.yaml`을 pnpm의 `include`로 읽고 lockfile과 함께 Git에 기록한다. `catalog:sync`로 중앙 → 사본 → 설치/lockfile을 명시적으로 갱신한다. CI·Sites는 개인 경로 대신 검증된 저장소 사본을 사용한다. 원래 workspace 안의 중앙 목록에서 확장한 결정이며 다른 프로젝트 전환을 자동 승인하지 않는다.

### Consequences

같은 기기의 pnpm 프로젝트들이 사용자 기본 저장소를 공유할 수 있다. 프로젝트마다 의존성 선언·링크·검증 결과는 필요하다. CI는 동일한 pnpm 버전과 잠금 파일로 자기 환경의 저장소를 구성한다. 같은 패키지의 하위 의존성은 상위 패키지 요구가 다를 수 있으므로 직접 의존성 버전 통일과 모든 전이 의존성의 강제 단일화를 혼동하지 않는다.

Sites 입력은 pnpm의 `deploy`가 카탈로그를 해석하고 생성한 hosting 전용 manifest·잠금 파일·설정으로 준비한다. 로컬 의존성 링크 자체는 배포하지 않는다. 다른 저장소를 이 workspace에 임의로 편입하지 않는다.

### Confirmation

[개발 절차](../how-to/develop.md#공유-의존성과-중앙-버전-갱신)와 [전환 기록](../records/archive/pnpm-shared-dependencies-20261025.md)의 설치·호환성·검사 결과로 확인한다. 이 결정의 accepted 상태는 실제 GitHub CI·공개 발행 완료를 뜻하지 않는다.

후속 중앙 YAML 분리의 입력·동기화·독립 설치·빌드 결과는 [분리 기록](../records/archive/shared-catalog-20261025.md)에 보존한다.

## More Information

- [pnpm 공유 파일과 링크 구조](https://pnpm.io/symlinked-node-modules-structure)
- [중앙 카탈로그](https://pnpm.io/catalogs)
- [YAML 설정 파일 분리](https://pnpm.io/config-includes)
- [workspace 패키지의 독립 배포 준비](https://pnpm.io/cli/deploy)
