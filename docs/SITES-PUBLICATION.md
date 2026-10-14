# Sites 발행

공개 대상은 **드럼연습실(player)**이다. 악보제작기는 로컬 전용이다. 최근 변경과 배포 결과는 [개발 기록](../history.md)에 있다.

## 정본과 배포 구조

- 개발 정본: `/Users/raphael/Playground/drum-practice`
- 배포 사본: `deployment/sites/` — 제품 소스를 독립 수정하지 않는다.
- 기존 Sites 프로젝트: `appgprj_6ab0790baa048191aaee49f58c1ffe7b`
- 공개 주소: [드럼연습실](https://drum-practice-studio.dgkma.chatgpt.site)
- 정적 앱 입력: `dist/player/`. `dist/editor/`나 원본 미디어 폴더 전체를 발행하지 않는다.
- 서버: `server/audio-analysis-worker.ts`, `hosting/`의 빌드·D1 마이그레이션. DB 바인딩은 `DB`이며 사용자 음원 저장소가 아니다.
- 파일 해시·분석 결과만 서버에 저장한다. 자세한 필드·제한은 [음원 연습](AUDIO-PRACTICE.md)을 따른다.

## 발행 순서

사용자가 요청한 경우에만 commit, push, 공개 발행을 수행한다. 변경 범위와 기존 dirty 파일을 확인하고 이번 릴리스에 필요한 검사를 먼저 끝낸다.

1. `src/app-versions.json`과 [버전 정책](APP-VERSIONS.md)을 확인한다. 문서만 변경하면 버전을 올리지 않는다.
2. 드럼 회귀와 분리 빌드를 검사한다.

   ```sh
   npm run test:drum
   npm run build:apps
   npm run check:playback
   ```

3. 정본의 `scripts/prepare-sites.mjs`로 기존 사본을 준비한다. 이 스크립트는 이전 생성 사본을 교체하므로 프로젝트 ID·경로와 사본의 별도 수정 유무를 먼저 확인한다.

   ```sh
   node scripts/prepare-sites.mjs
   npm --prefix deployment/sites ci
   npm --prefix deployment/sites run build
   ```

4. 현재 Sites 스킬과 노출된 도구 계약을 읽고 기존 프로젝트에 소스를 저장·발행한다. 새 사이트를 만들거나 공개 범위를 확대하지 않는다. Git push만으로 Sites 발행이 완료되지는 않는다.
5. `source-parity.json` 기준으로 `dist/player`, 사본의 `player-assets`, Worker의 `dist/client` 정적 파일을 대조한다. `index.html`은 준비 스크립트가 `player.html`에서 만드는 진입점이다.
6. 배포가 `succeeded`인지 확인한 뒤 공개 HTML·주요 JS/CSS·분석/변환 Worker와 분석정보 조회를 확인한다. 기존 값을 바꾸는 smoke 요청은 피하고, 쓰기 검증이 필요하면 별도 시험 해시와 처리 범위를 정한다.
7. 구현 커밋, push, Sites 소스/버전/배포 ID, 빌드 식별자, HTTP/API 결과와 실기기 검증 여부를 기록한다.

개발 DB는 `data/runtime/audio-analysis.sqlite`에 있다. 공개 D1로 자동 복사하지 않는다. 브라우저의 기존 보관함은 로컬 주소와 공개 주소 사이에 자동 이전되지 않는다.

## 최근 확인된 발행 — 0.7.6

기록 시점: 2026-10-13 17:26 KST. 아래는 해당 릴리스의 확인 결과이며 문서를 읽을 때마다 운영 상태를 새로 측정한 결과가 아니다.

| 항목 | 결과 |
| --- | --- |
| 정본 구현 커밋 | `918fbeb` — main push 완료 |
| 앱 버전 / 소스 빌드 | 두 앱 0.7.6 / `8326bcd8ca83` |
| 공개 앱 | player만 |
| Sites 저장 버전 | 62 |
| Sites 소스 | `4b73a4b22ec22c69230ba245344d9504c184457b` |
| 배포 | `appgdep_6acdeb31cff48191b80c3fa40fa75df0` — succeeded |
| 완료 시각 | 2026-10-13T08:26:44Z |
| 로컬 검사 | 드럼 114파일·636테스트, 분리 빌드·공통 재생 검사 통과 |
| 자산 대조 | player/사본/Worker 정적 출력 35파일 SHA-256 일치 |
| 공개 확인 | 홈 200 및 HTML 일치, 주요 자산 해시 일치, 분석조회 200/578박, 없는 해시 404, 음원 형식 PUT 415 거부 |
| 근거 | 당시 `.tmp/release-0.7.6/smoke.json` 및 릴리스 빌드 로그(2026-10-13 사용자 요청으로 삭제) |

실제 iPhone/iPad 재검증과 청취는 이번 발행 smoke와 구분한다. 상세 범위는 [검증 현황](acceptance.md)을 참고한다.

## 로컬 용량 정리 — 2026-10-13

hosting/deployment/sites의 `node_modules`, Sites의 `dist`, `player-assets`, 이전 `public` 사본, `.sites-runtime`, `.wrangler`를 정리했다. 원본 설정·lockfile·서버 소스와 `.openai/hosting.json`, Sites Git 이력은 유지한다. 현재 배포 checkout은 생성 자산이 없는 준비 전 상태다. 위 발행 순서대로 `dist/player`를 준비하고 `prepare-sites` → `npm ci` → 빌드를 수행한 후에만 발행한다.

배포 파일을 checkout 외부 경로의 심볼릭 링크로 대체하지 않는다. Git에는 링크 대상의 내용이 함께 저장되지 않으므로 공개 빌드의 입력을 보장할 수 없다. hosting은 설정 원본이며 별도 의존성을 상시 설치할 필요가 없다. 배포 의존성은 실제 빌드를 수행하는 deployment/sites에 필요할 때 설치한다.
