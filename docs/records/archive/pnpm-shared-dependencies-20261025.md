# pnpm 공유 저장소와 중앙 버전 목록 전환 — 2026-10-25 완료

- 목표: 앱·Sites 빌드의 라이브러리 파일을 pnpm 공통 저장소에서 공유하고 사용 버전을 한곳에서 관리한다.
- 범위: 루트와 `hosting` workspace, 의존성 선언/잠금 파일, 개발·검사·빌드·CI·Sites 준비 절차와 관련 현행 문서.
- 완료 조건: 두 패키지가 같은 카탈로그를 사용하고 고정 설치, 전체 회귀, 두 앱 및 독립 Sites 빌드가 성공한다.
- 제외 범위: 다른 프로젝트 변경, 앱/저장 기능 변경, 앱 버전 인상, 커밋·push·PR·발행.
- 검증: 이전 직접 의존성 버전과 수록 자료 해시 보존, 실제 공유 경로, lint·서식·세 타입 검사·전체 테스트·두 앱 빌드·독립 Sites 빌드·로컬 실행 확인.

## 설계

이번 작업은 이 프로젝트부터 적용한다. `pnpm-workspace.yaml`의 `catalog`를 직접 의존성 버전의 정본으로 하고 루트와 `hosting/package.json`은 `catalog:`를 참조한다. `pnpm-lock.yaml` 하나가 두 패키지의 실제 의존성 그래프를 기록한다. 다른 저장소는 아직 전환하지 않는다.

첫 카탈로그는 직전 릴리스에서 검증한 실제 설치 버전으로 시작한다. 전환 자체와 무관한 라이브러리 대규모 업그레이드를 섞지 않는다. 이후 중앙 목록을 갱신하고 설치·호환성 수정·검증을 함께 수행한다. 기존 하위 의존성의 보안 override는 workspace 설정으로 이전한다.

pnpm 12.15.0을 사용하고 사용자 기본 공통 저장소를 재사용한다. 프로젝트별 전용 store를 만들지 않는다. 같은 컴퓨터의 다른 pnpm 프로젝트도 같은 저장소를 사용할 수 있으며 CI는 자기 환경의 저장소와 동일한 잠금 파일을 사용한다.

Sites는 canonical `hosting` 패키지를 pnpm의 배포용 의존성 내보내기로 준비한다. 중앙 목록을 해석한 독립 manifest/잠금 파일을 생성하고 player 빌드와 Worker 소스만 기존 Sites 준비 경로에 담는다. 프로젝트 밖의 `node_modules` 링크를 발행 소스에 넣지 않는다.

## 진행 기록

- 시작: main `b5bc6977f68540b02eec664b742aa59e87803611`, 작업 트리 clean, 두 앱 0.8.16.
- 이전 잠금 파일·직접 의존성·라이선스 고지·수록 파일 해시는 `.tmp/pnpm-migration-20261024/`에 보존했다.

## 반영 결과

- `packageManager`는 pnpm 12.15.0으로 고정했다. 사용자 기본 저장소는 `/Users/raphael/Library/pnpm/store/v11`이며 별도의 프로젝트 전용 저장소를 만들지 않았다.
- 중앙 카탈로그 25개 버전을 루트·hosting의 26개 직접 선언에서 참조한다. 기존 25개 선언의 실제 설치 버전은 모두 유지했다. 두 패키지의 Vite는 같은 `node_modules/.pnpm/vite@8.3.5_…/node_modules/vite` 실경로를 참조한다. 파일 공유는 확인했지만 디스크 절감량은 측정하지 않았다.
- pnpm의 엄격한 모듈 탐색에서 PDF 검수 도구·테스트가 쓰는 미선언 `@napi-rs/canvas`가 드러났다. 이전에도 설치되어 있던 1.0.13을 직접 개발 의존성과 카탈로그에 명시했다. 검사 규칙과 앱 동작은 유지했다.
- 두 npm 잠금 파일은 공용 `pnpm-lock.yaml`로 전환했다. 빌드 식별자 입력·CI 설치/캐시·현행 개발/검사/발행 명령을 함께 바꿨다. pnpm이 생성하는 잠금 파일은 Prettier로 다시 쓰지 않고 frozen 설치로 검증한다.
- pnpm 링크 구조에서도 하위 패키지의 고지를 찾도록 라이선스 수집의 기준 경로를 `realpath`로 해석한다. 전후 고지 47개 이름·버전과 SoundTouch 소스가 같다.
- Sites 준비는 `pnpm deploy`로 hosting 전용 의존성 그래프를 내보내고 pnpm 자체 버전 고정 정보도 오프라인으로 기록한다. 앱 라이브러리 그래프는 이 단계 전후 동일하다. 완성된 manifest·잠금 파일·설정만 복사하므로 기존 workspace 설치 없이 독립 설치할 수 있다.
- 원래 npm `node_modules` 두 디렉터리는 증거 폴더의 `npm-root-node_modules`, `npm-hosting-node_modules`로 옮겨 보존했다. 원본 자료·기존 배포 checkout·앱 버전은 유지했다.

## 검증 결과

환경: macOS arm64, Node 26.12.1, pnpm 12.15.0. 두 앱 0.8.16, 소스 빌드 `215e444fa5d3`.

| 확인 | 결과·근거 |
| --- | --- |
| 고정 설치 | 루트 workspace와 별도 Sites 폴더에서 `pnpm install --frozen-lockfile` 성공 |
| lint·서식·타입·구조·문서 | `pnpm run check` 통과. 앱·도구·hosting 타입 포함, 코드/설정 432개 서식 검사 |
| 전체 회귀 | `pnpm run test:drum`: 129개 파일·767개 테스트 통과. 기존 실제 미디어 검사 포함 |
| 두 앱 빌드 | `pnpm run build`: editor/player 및 공개 번들 경계 검사 통과 |
| Sites 독립 빌드 | `.tmp/pnpm-migration-20261024/sites`에 준비한 소스로 frozen 설치·빌드 성공. player 45개 파일/Worker HTML이 canonical 빌드와 같고 editor 미포함 |
| 중앙 버전·보안 | 모든 직접 선언이 catalog와 일치. 기존 esbuild 0.25.12·Miniflare 하위 Undici 7.30.1 보안 override 유지. workspace `pnpm audit` 취약점 0건 |
| 원본·저장 호환성 | 수록 6곡 SHA-256 보존. 앱·모델·저장·재생 소스와 기존 테스트 소스 변경 없음 |
| Safari 로컬 실행 | 개발·빌드 player/editor의 목록 초기화. 실제 수록 패키지를 공통 읽기/렌더러로 처리해 96마디 유지·SVG 6페이지 확인, 음원 290.25초/44.1kHz/2채널 디코딩. 사용자 악보 목록에는 저장하지 않음 |

검사 로그·이전 입력·실경로·해시 대조는 `.tmp/pnpm-migration-20261024/`에 보존한다. 주요 근거는 `check.log`, `tests.log`, `build.log`, `sites-prepare.log`, `sites-install.log`, `sites-build.log`, `audit.json`, `resolution.json`, `final-proof.json`, `safari-probe.json`과 Safari 목록 추출이다.

## 확인한 설치·검증 이슈

- npm 12가 pnpm 네이티브 바이너리 설치 스크립트를 기본 차단해 셸에서는 실행되지만 Node의 직접 실행은 macOS `ENOEXEC`로 실패했다. pnpm 설치에만 `--allow-scripts=pnpm`을 적용해 정상 바이너리를 설치했고 전역 보안 정책은 변경하지 않았다. 초기 설치 명령에도 반영했다.
- `pnpm deploy` 결과에 `packageManager`만 덧붙이면 pnpm 자체 버전이 잠금 파일에 없어 frozen 설치가 실패했다. pnpm의 오프라인 잠금 파일 생성 단계로 이를 기록한 뒤 독립 frozen 설치로 확인했다. 실제 의존성 그래프의 버전/무결성은 전후 같았다.
- 브라우저 검증 도우미의 첫 패키지 URL은 잘못된 `/demo/scores/`를 사용해 Vite HTML을 읽었다. 실제 카탈로그의 `/scores/` 경로로 수정한 후 패키지 읽기와 렌더링이 통과했다. 앱 오류로 처리하지 않았다.
- 기존 OSMD 청크/크기 경고와 Node의 sqlite·localStorage 경고, 페이지 이동 시 Safari 개발 HMR 연결의 suspension 로그는 남아 있다. 검사 설정이나 앱 코드를 바꿔 숨기지 않았다.

## 범위와 남은 확인

GitHub Actions는 pnpm 설치·캐시·기존 portable 검사를 사용하도록 변경했지만 원격 CI는 실행하지 않았다. 이번 검증은 로컬 macOS/Node 26 결과이며 Linux/Node 22 CI, 공개 Sites Worker 실행, iPad, 실제 청취·장기 재생 검증은 포함하지 않는다. 다른 프로젝트의 버전 목록 연동은 아직 적용하지 않았다. 커밋·push·PR·발행과 앱 버전 인상은 수행하지 않았다.
