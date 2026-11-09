# jsdom 31·TypeScript 7 개발 의존성 전환

## 목표와 범위

- 목표: 사용자 요청에 따라 jsdom·TypeScript의 최신 안정판과 필요한 호환성 수정을 로컬에 적용한다.
- 범위: 중앙 catalog와 사본·공유 lockfile, TypeScript compiler/API 사용처, Node 개발 환경, 기존 검사와 앱 빌드.
- 완료 조건: 실제 버전·peer graph·기존 규칙 유지·frozen 설치·보안 감사와 영향 범위 회귀 확인.
- 제외: 기존 미커밋 변경 삭제, 새 시험 DB/합성 자료의 무허가 생성, 검사 규칙/경고 억제, 앱 버전 변경·커밋·push·발행·운영 연결·롤백.
- 검증: 기존 소스·미디어를 사용한다. 사용자가 2026-11-09 “허용 — 전체 회귀 검사 실행”으로 기존 회귀의 임시 메모리 SQLite DB와 `.tmp` 검사 복사본 생성을 별도 승인했다. 운영 DB·원본 자료는 변경하지 않았다.

## 변경

- 중앙 `~/Library/Preferences/pnpm/shared-catalog.yaml`과 저장소 사본의 jsdom 26.1.0 → 31.0.0, TypeScript 5.9.3 → 7.0.2를 동기화했다.
- jsdom 31의 요구에 맞춰 개발 Node 범위를 `^22.22.2 || ^24.15.0 || >=26.0.0`로 정정했다. `.nvmrc`의 `22`는 최신 22 LTS를 선택하므로 유지했다. 실제 검증 환경은 공통 Homebrew Node 26.13.0·pnpm 12.18.0이다.
- TypeScript 7은 네이티브 컴파일러이며 기존 compiler API를 제공하지 않는다. 공식 `@typescript/typescript6` 호환 패키지 6.0.2를 catalog/direct dev dependency로 추가했다. 이 패키지가 재노출하는 실제 API는 6.0.3이다.
- ESLint에는 `typescript-eslint@8`의 TypeScript peer를 제거하고 공식 호환 API를 직접 공급하는 pnpm package extension을 적용했다. 루트 `typescript`와 `tsc`는 7.0.2이며 다른 버전으로 위장하거나 peer 범위를 허위로 넓히지 않는다.
- i18n·경계·재생 구조·공통 컴포넌트 검사와 악보 범례 도구의 TypeScript API import 6곳을 `@typescript/typescript6`로 변경했다. 원래 import 한 줄을 제외한 바이트가 HEAD와 같고, 실제 소스의 API 파싱 진단도 0건임을 확인했다.
- 최초 설치의 peer 충돌은 직접 의존성 전환으로 해결했다. `pnpm peers check --json`의 bad/missing/conflicts는 루트·hosting 모두 없다.
- 중앙 버전 항목·잠금 파일·OSMD JSZip 패치·보안 override·설치 스크립트 정책은 함께 보존했다. Node·compiler를 프로젝트별로 별도 설치하지 않고 기존 공통 Node에서 패키지의 도구를 실행한다.

## 검증 결과

- `pnpm run check`: lint·445파일 서식·앱/도구/hosting 타입·i18n·구조·문서 검사 통과.
- `pnpm exec tsc --version`: 실제 `Version 7.0.2`.
- `pnpm run build`: editor/player 두 앱과 번들 경계 검사 통과. 앱 버전은 두 앱 모두 0.10.2, 소스 빌드는 `4b33ee844efd`다. 공개 배포는 수행하지 않았다.
- `pnpm install --frozen-lockfile --offline`: 통과. 중앙 catalog/사본 일치.
- `pnpm audit --json`: 알려진 취약점 0건.
- 기존 큰 chunk·OSMD 정적/동적 import 경고와 @esbuild-kit 하위 의존성 deprecation은 별도로 남아 있다. 경고 임계값·제외·검사 규칙은 완화하지 않았다.
- 전체 `pnpm run test:drum`: 131파일·797테스트 통과(14.33초). 최초 실행은 도움말 포커스 2건이 실패했다. jsdom 31의 기본 CSS는 닫힌 popover를 숨기지만 `showPopover()` API는 제공하지 않는다. 기존 시험용 함수가 dataset만 설정해 닫힌 상태로 남은 것이 원인이다. 이 함수에 표시 상태만 추가했고 실제 앱 코드·포커스 단언은 변경하지 않았다. 집중 19테스트와 전체 회귀를 다시 통과했다.
- Sites 입력은 운영 발행 사본과 다른 새 `.tmp/major-upgrade-sites-*` 경로로 내보냈다. 독립 `pnpm install --frozen-lockfile --offline`과 `pnpm run build`가 통과했고 player 48파일 해시 일치·Worker 보안/폐기 API 경계 검사도 통과했다. 원격 발행·D1 명령은 실행하지 않았다.
- Node 26의 localStorage 실험 경고는 회귀 실행에 남아 있다. 경고를 숨기거나 불필요한 localStorage 파일을 만들어 회피하지 않았다.
- 실제 GUI·재생·실기기·Linux CI·원격 발행은 수행하지 않았다. 기존 미커밋 history 변경을 보존했다.

## 공식 근거와 실행 기록

- [TypeScript 7과 공식 API 병행 사용](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [jsdom 31 변경 사항](https://github.com/jsdom/jsdom/releases/tag/v31.0.0)
- [typescript-eslint 지원 범위](https://typescript-eslint.io/users/dependency-versions/)
- [pnpm peer를 직접 의존성으로 전환](https://pnpm.io/settings/dependency-resolution#overriding-peer-dependencies)

로컬 실행 로그·설치/컴파일러/API 증거·기존 파일 보존본은 `/Users/raphael/Playground/local-project-maintenance/runs/major-upgrade-20261109-fdYve8/`에 있다. 이전 실패 로그와 최종 성공 로그는 구분한다. 최초 실패 로그와 수정 뒤 집중·전체 회귀의 성공 로그를 함께 보존했다.
