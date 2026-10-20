# 개발 검사와 로컬 자산 준비

## 실행 범위

모든 명령은 프로젝트 루트에서 실행한다. Node.js 22.13 이상과 `npm ci`로 설치한 의존성을 사용한다. Vitest는 이 저장소의 `tests/{unit,integration,local-media}`만 검사한다. 별도 checkout·배포 사본·기타 프로젝트는 포함하지 않는다.

- `npm run test:portable`: 로컬 악보 없이 실행 가능한 unit 및 integration 검사. 기존 테스트의 메모리 저장소·DOM·mock을 재사용한다.
- `npm run test:local-media`: 보존된 실제 악보·음원 자료를 사용하는 검사. 자료가 없으면 명시적으로 실패한다.
- `npm run test:drum`: 두 범위를 모두 실행하는 전체 회귀. 릴리스 필수 범위를 축소하지 않는다.
- `npm run check:playback`: 재생 소유권, 공통 컴포넌트와 소스 경계 검사. `src/` 전체를 재귀 탐색한다.
- `npm run build:apps`: 타입·i18n·재생/소스 경계 검사 후 두 앱을 빌드하고 player 번들의 제작 기능 유입을 검사한다.
- `npm run test:local`: 기존 Apple 보조 도구의 Python 단위 검사. STT/AFM 실행이나 음원 전송은 포함하지 않는다.

`pretest`, `pretest:drum`, `pretest:portable`, `pretest:local-media`가 라이선스와 빌드번호를 생성한다. `npx vitest`를 직접 사용할 때는 먼저 `npm run pretest`를 실행한다. 타입만 검사할 때도 새 checkout에서는 생성 파일이 필요하다.

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
