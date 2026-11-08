# minimatch 보안 수정과 호환성 검증

- 목표: 개발 도구의 간접 의존성 minimatch 경고 1건을 실제 수정 버전으로 해결한다.
- 범위: 프로젝트의 제한된 pnpm override·lockfile·변경 기록과 호환성 검사.
- 완료 조건: 전체/실행 의존성 audit 0건, 기존 lint 대상 보존, lint·서식·타입·전체 테스트·두 앱 및 Sites용 빌드 통과.
- 제외 범위: 커밋·푸시·발행, 중앙 카탈로그/다른 프로젝트 변경, 사용자 악보·저장 형식 변경, 화면·기기 검증.
- 검증: 기존 파일을 이용한 lint 대상 전후 대조, `pnpm run verify`, frozen 설치·OSMD/카탈로그 보존, 독립 Sites 빌드와 보안 재검사.

## 원인과 적용 계획

- [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)는 minimatch 7.0.0 이상 11.0.1 미만의 패턴 증폭 문제다. 이번 설치의 해당 패키지는 10.2.6이며 ESLint·@eslint/config-array·@typescript-eslint/typescript-estree를 통해서만 사용한다.
- 공식 npm 레지스트리에서 2026-11-08 최신 안정판 11.0.5를 확인했다. [공식 배포 manifest](https://github.com/isaacs/minimatch/blob/v11.0.5/package.json)의 Node 요구는 `20 || >=22`이며 프로젝트의 지원 Node 범위와 맞는다. CommonJS/ESM과 `Minimatch`·`match` 호출을 지원한다.
- 최신 ESLint 10.14.0과 typescript-eslint 8.72.1도 아직 minimatch 10.x를 요구한다. 모든 도구를 추가 갱신하는 대신, [pnpm 버전 선택 override](https://pnpm.io/settings/dependency-resolution#overrides)로 이 프로젝트의 minimatch 10.x 경로만 11.0.5에 연결한다. 중앙 카탈로그는 직접 의존성 버전을 유지하고 보안 override는 기존 정책대로 프로젝트 workspace에 둔다.
- 메이저 변경에 따른 glob 해석 차이를 확인하기 위해, 업데이트 전 실제 저장소의 ESLint 결과와 검사 파일 목록을 `.tmp/minimatch-security-20261108/eslint-before.json`에 보존한다. 같은 경로를 업데이트 후 대조하며 검사 규칙·제외 범위·오류 기대값을 완화하지 않는다.
- 이전 pnpm 전환의 미커밋 변경은 그대로 보존한다. 작업 시작 HEAD는 `dd0b120`, 잠금 파일 SHA256은 `b4f32801cb535693ea64a9868655fe875966bd6bf0fd39c805081eb1e1343c33`이다. 기존 파일·수록 악보 해시는 같은 작업 폴더의 `baseline.json`에 남긴다.

## 실행 결과

`pnpm-workspace.yaml`에 `"minimatch@10": 11.0.5`를 추가하고 pnpm 12.18.0으로 설치·잠금 파일을 갱신했다. 기존 보안 override와 OSMD 패치는 그대로다. 보안 예외·경고 무시·검사 skip은 추가하지 않았다.

- 잠금 파일에서는 minimatch 10.2.6을 제거하고 11.0.5 및 필요한 `@isaacs/nonrecursive-glob-match` 1.1.0을 추가했다. 기존 `brace-expansion` 5.0.12는 재사용한다.
- 기존 package 항목의 버전·무결성은 바꾸지 않았다. snapshot 변경은 ESLint·@eslint/config-array·@typescript-eslint/typescript-estree의 minimatch 연결 세 곳뿐이다. 직접 의존성 importers·catalogs·patchedDependencies는 작업 시작 때와 동일하다.
- 실제 세 소비자의 `require` 경로가 같은 minimatch 11.0.5를 가리키며 `minimatch` 함수와 `Minimatch` 클래스를 제공하는지 확인했다.
- 업데이트 전후 실제 ESLint 검사 대상은 모두 370파일이며 추가·누락 0개, 오류·경고 0개다. 기존 검사 설정·규칙·제외 범위·테스트 기대값은 변경하지 않았다.

## 검증 결과

환경은 macOS arm64, Node 26.13.0, pnpm 12.18.0이다. 실행 증거는 `.tmp/minimatch-security-20261108/`에 보존한다.

| 검사 | 결과와 증거 |
| --- | --- |
| 전체 `pnpm audit --json` | 모든 심각도 0건, `audit.json` |
| 실행 의존성 `pnpm audit --prod --json` | 모든 심각도 0건, `audit-prod.json` |
| 실제 lint 대상·오류·경고 전후 대조 | 370파일 동일, `eslint-before.json`·`eslint-after.json` |
| 직접/간접 의존 관계 대조 | 세 소비자 모두 11.0.5, 원래 직접 버전·카탈로그·OSMD 패치 보존, `dependency-paths.json`·`lockfile-change-scope.json` |
| `pnpm install --frozen-lockfile --offline` | 두 workspace 성공, `frozen-install.log` |
| 중앙 YAML 없는 임시 CI 입력의 frozen/offline lockfile 검사 | 저장소 사본·패치·lockfile만으로 성공, `ci-input.log`. 실제 Linux CI 실행은 아님 |
| `pnpm run verify` | lint·445파일 서식·앱/도구/hosting 타입·의존 경계·153문서·17로컬 자산·131파일 797테스트·두 앱 빌드 통과, `verify.log` |
| Sites용 독립 frozen 설치·빌드 | Worker와 player 48파일 해시 대조 통과, `sites-prepare.log`·`sites-install.log`·`sites-build.log` |
| Sites 내보낸 잠금 파일 대조 | package/snapshot 각 178개와 직접 버전이 원본과 일치, `sites-lock-parity.json` |

카탈로그 정본과 사본은 SHA256 `23a8a538b78fa82b11415075e5daf4246ce1a05fdc8689696176cf7f534ed108`을 유지했다. 기존 수록 악보 6개와 수정 대상 밖의 미커밋 파일 9개를 시작 시점의 해시로 대조해 모두 같음을 확인했다. 설치된 OSMD 패치 해시도 유지됐다. `preservation.json`에 보존 결과를 남겼으며 최종 잠금 파일 SHA256은 `c47b5c6e0ab52609ca64ed92608e1b0797081922f1e56eef19b6d79241e2754b`다. 앱·사용자 저장 형식은 변경하지 않았다.

앱 버전은 두 앱 모두 0.10.1을 유지한다. 최종 소스 빌드는 `514ca42f94cd`다. 커밋·푸시·발행과 브라우저 화면·기기 검증은 수행하지 않았다. 이전부터 있는 deprecated 하위 패키지 3개·Node localStorage·OSMD 정적/동적 import·큰 청크 경고는 보안 취약점 audit와 구분한다.

## 후속 유지 기준

세 상위 소비자가 수정된 minimatch를 정식 지원하면 임시 `minimatch@10` override를 제거하고 잠금 파일·audit·동일 lint 대상·전체 검사를 다시 확인한다. 중앙 YAML의 다른 패키지나 다른 프로젝트에 이 메이저 override를 자동 적용하지 않는다.
