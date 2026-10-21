# 개발 검사와 로컬 자산 준비

## 실행 범위

모든 명령은 프로젝트 루트에서 실행한다. Node.js 22 LTS(22.13 이상, `.nvmrc`)와 `npm ci`로 설치한 의존성을 사용한다. Vitest는 이 저장소의 `tests/{unit,integration,local-media}`만 검사한다. 별도 checkout·배포 사본·기타 프로젝트는 포함하지 않는다.

- `npm run test:portable`: 로컬 악보 없이 실행 가능한 unit 및 integration 검사. 기존 테스트의 메모리 저장소·DOM·mock을 재사용한다.
- `npm run test:local-media`: 보존된 실제 악보·음원 자료를 사용하는 검사. 자료가 없으면 명시적으로 실패한다.
- `npm run test:drum`: 두 범위를 모두 실행하는 전체 회귀. 릴리스 필수 범위를 축소하지 않는다.
- `npm run check:playback`: 재생 소유권, 공통 컴포넌트와 소스 경계 검사. `src/` 전체를 재귀 탐색한다.
- `npm run build:apps`: 타입·i18n·재생/소스 경계 검사 후 두 앱을 빌드하고 player 번들의 제작 기능 유입을 검사한다.
- `npm run test:local`: 기존 Apple 보조 도구의 Python 단위 검사. STT/AFM 실행이나 음원 전송은 포함하지 않는다.

`pretest`, `pretest:drum`, `pretest:portable`, `pretest:local-media`가 라이선스와 빌드번호를 생성한다. `npx vitest`를 직접 사용할 때는 먼저 `npm run pretest`를 실행한다. 타입만 검사할 때도 새 checkout에서는 생성 파일이 필요하다.

## 공통 검사와 CI

- 최초 준비: `npm ci`와 `npm ci --prefix hosting`. 두 패키지의 lockfile을 사용한다. 로컬 hosting 의존성 링크가 이미 설치되어 있으면 재설치는 필요 없다.
- `npm run generate`: 라이선스·소스 빌드번호 생성. 모든 개발 진입점과 테스트·앱/도구 타입 검사의 pre 단계가 재사용한다.
- `npm run check`: ESLint, 코드/설정 서식, 앱·도구·hosting 타입, i18n, 모듈 경계, 생성 UI 문서·상대 파일 링크 검사.
- `npm run verify:portable`: 공통 검사와 portable 테스트. `.github/workflows/check.yml`도 같은 명령을 실행한다. CI는 원본 미디어를 업로드/생성하지 않으며 두 앱 빌드·local-media 회귀를 대체하지 않는다.
- `npm run verify`: 공통 검사, 전체 회귀, 분리 빌드. 릴리스의 로컬 검증 명령이다.
- `npm run build`는 `build:apps`와 동일하다. 구형 통합 dist 빌드는 사용하지 않는다. 빌드 중 문서는 수정하지 않고 `check:docs`로 생성 문서의 일치를 확인한다.
- `npm run typecheck`: 앱(`tsconfig.json`), 브라우저 제작 도구(`tsconfig.tools.json`), hosting 빌드 설정(`hosting/tsconfig.json`)을 각각 검사한다. hosting의 설치된 Vite/Cloudflare 타입을 사용한다.
- `npm run format:check`: Git 추적 파일과 아직 추가하지 않은 비제외 파일 중 JS/TS/JSON/CSS/HTML/YAML을 검사한다. Markdown·Python은 서식 검사 대상이 아니다. `.prettierrc.json`과 고정한 Prettier 버전을 사용한다.
- `npm run check:docs`: 생성 UI 문서와 Markdown의 상대 파일 링크만 검사한다. 외부 URL·절대 로컬 경로·앵커 내용은 검사하지 않는다. 삭제된 실험 증거는 클릭 링크 대신 과거 경로와 삭제 상태로 기록한다.
- 원격 CI 결과는 push 이후 별도로 확인한다. 로컬 통과를 원격 CI 실행 성공으로 기록하지 않는다.

## ESLint

`eslint.config.mjs`의 flat config를 사용한다. ESLint 10과 typescript-eslint 8의 `recommended` 규칙을 JS·TS에 적용하며, 타입 정보를 사용하는 추가 규칙은 아직 켜지 않았다. 타입 검사는 기존 `tsc --noEmit`이 맡는다. 설정 방식은 [typescript-eslint 공식 안내](https://typescript-eslint.io/getting-started/)를 따른다.

- `npm run lint`: 전체 검사. 오류 또는 경고가 있으면 실패한다.
- `npm run lint:fix`: 자동 수정 가능한 항목을 수정한 뒤 같은 기준으로 검사한다. 실행 후 diff를 검토한다.
- 범위: 두 앱의 `src/`, `tests/`, `server/`, `scripts/`, JS 제작 도구, `hosting/`와 루트 설정 파일. 생성 파일·외부 의존성·미디어·배포 사본·실험 출력은 제외한다. HTML 내부 스크립트와 Python은 이 검사 대상이 아니다.
- 환경: 앱은 browser, 서버·개발 도구는 Node.js, 테스트는 Node.js와 DOM이다. MusicXML 제작 도구는 `page.evaluate()` 콜백을 포함하므로 browser 전역도 허용한다.
- Prettier: 마지막에 `eslint-config-prettier`를 적용해 서식 규칙 충돌을 막는다. ESLint 명령이 Prettier를 실행하는 것은 아니다.
- 규칙: 미사용 변수, 명시적 `any`, 재할당 없는 `let`, 빈 블록 등을 권장 규칙 그대로 검사한다. 사용되지 않는 `eslint-disable`도 오류로 처리한다. 기존 지적 사항을 숨기는 baseline이나 일괄 규칙 해제는 두지 않는다.

도입 시점(2026-10-21)에 확인한 172오류는 후속 코드 정리에서 모두 수정했다. 권장 규칙·검사 범위는 유지했고 억제 주석이나 baseline은 추가하지 않았다. 최신 검증은 329파일 0오류·0경고, 타입 검사, 123파일720테스트, 두 앱 빌드 통과다. 별도 제작 벤치마크 도구도 독립 타입 검사를 통과했다. 빌드 명령에 lint를 자동 연결하지 않았으므로 필요할 때 `npm run lint`를 별도로 실행한다. 상세 로컬 결과는 `.tmp/eslint-cleanup-final.json`, `.tmp/eslint-cleanup-{tests,build}.log`, `.tmp/eslint-benchmark-types.log`다.

## 로컬 자료

원본 미디어는 Git에 넣거나 자동 다운로드하지 않는다. 기존 자료 보관처에서 아래 경로로 준비한다. `node scripts/checks/check-local-assets.mjs`는 누락 경로를 출력하고 실패한다. 존재 검사는 내용 검증을 대신하지 않는다.

| 위치 | 필요 자료 / 준비 경로 |
|---|---|
| `public/demo/` | `song.json`, `score.pdf`, `score.musicxml`, `audio.mp3`, song.pageCount에 해당하는 `page-N.png`. 기존 변환 회귀용 데모 묶음을 그대로 복사한다. |
| `public/scores/` | `src/content/bundled-scores.json`의 모든 `.drumscore`. 승인된 `data/production/<곡>/final/` 결과 또는 기존 로컬 배포용 자산을 복사한다. 새 악보를 임의 생성하지 않는다. |
| `data/reference/grid_verified.json` | 보존된 가사/박자 검수 입력. |
| `data/reference/test-fixtures/musicxml-candidate.musicxml` | 쉼표 보정 회귀 입력. |
| `data/reference/test-fixtures/tom-moving-28-portland.drumscore` | 구형 패키지 교체 호환 회귀 입력. |

player 빌드에는 위 카탈로그의 패키지와 Git에 있는 `public/icons/`가 필요하다. 로컬 미디어가 없는 환경은 portable 검사까지만 검증됐다고 보고한다. 패키지 회귀나 player 빌드를 통과했다고 보고하지 않는다.

## 호환성과 검사 범위

- DB 이름·버전·저장 키, bytes-v1, 구형 Blob 복원, 저장 전 snapshot·큐·원자적 트랜잭션은 storage/shared-score-library/record-serialization/editor-session 검사로 확인한다.
- `.drumscore` 읽기·쓰기와 제작기→연습실 전달은 score-package/app-separation/tom-moving-package-update 검사로 확인한다.
- 기능별 이동표는 [이동표](../plans/RESTRUCTURING-MAP.md), 기계 판독 목록은 [JSON](../plans/restructuring-map.json)이다. 이동 전의 121개 테스트 파일을 모두 보존한다.
- 로컬 화면 검수와 실제 iPad 터치·청취는 구분한다. 브라우저에서 확인한 화면만 기록하며 unit 성공을 실기기 성공으로 대신하지 않는다.

## 제작 도구

`tools/score-production/`는 MusicXML 생성·검수, 범례 그림, renderer benchmark 도구를 소유한다. `tools/apple-local/`는 로컬 STT/AFM 보조 도구다. 도구 이동은 제작·원본 자료 수정·유료 호출의 실행 지시가 아니다. 실행 계약은 [제작 프로세스](../score-production/SCORE-PRODUCTION-PROCESS.md)와 [Apple 로컬 절차](APPLE-LOCAL-WORKFLOW.md)를 따른다.
