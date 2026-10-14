# Sites 발행

공개 대상은 **드럼연습실(player)**이다. 악보제작기는 로컬 전용이다. 최근 변경과 배포 결과는 [개발 기록](../history.md)에 있다.

## 정본과 배포 구조

- 개발 정본: `/Users/raphael/Playground/drum-practice`
- 배포 사본: `deployment/sites/` — 제품 소스를 독립 수정하지 않는다.
- 기존 Sites 프로젝트: `appgprj_6ab0790baa048191aaee49f58c1ffe7b`
- 공개 주소: [드럼연습실](https://drum-practice-studio.dgkma.chatgpt.site)
- 정적 앱 입력: `dist/player/`. `dist/editor/`나 원본 미디어 폴더 전체를 발행하지 않는다.
- 서버: `server/player-worker.ts`가 HTML/보안 헤더와 정적 자산을 전달한다. `hosting/`의 D1 바인딩은 과거 분석 테이블 삭제 마이그레이션 적용을 위해서만 유지한다.
- 파일 해시·곡명·가수·분석 결과는 브라우저 내부에서만 처리한다. 자세한 필드·제한은 [음원 연습](AUDIO-PRACTICE.md)을 따른다.

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
6. 배포가 `succeeded`인지 확인한 뒤 공개 HTML·주요 JS/CSS·분석/변환 Worker와 `.drumscore` 다운로드, 폐기된 API의 404를 확인한다. 기존 값을 바꾸는 smoke 요청은 피하고, 쓰기 검증이 필요하면 별도 시험 해시와 처리 범위를 정한다.
7. 구현 커밋, push, Sites 소스/버전/배포 ID, 빌드 식별자, HTTP/API 결과와 실기기 검증 여부를 기록한다.

로컬 분석 DB/인증키는 삭제했다. 공개 DB의 3개 분석 테이블은 다음 발행에서 0002 마이그레이션으로 삭제한다. 브라우저의 기존 보관함은 로컬 주소와 공개 주소 사이에 자동 이전되지 않는다.

## 과거 발행 기록 (당시 구조이며 현행 설계 아님)

다음 기록의 분석 API·검토/승인 구조는 기기 내부 처리 결정으로 폐기됐다. 공개 환경은 다음 발행 전까지 0.7.8이다.

### 이전 발행 — 0.7.7

기록 시점: 2026-10-14 KST. 아래는 해당 릴리스의 확인 결과이며 문서를 읽을 때마다 운영 상태를 새로 측정한 결과가 아니다.

| 항목 | 결과 |
| --- | --- |
| 정본 구현 커밋 | `50050ce` — main push 완료 |
| 앱 버전 / 소스 빌드 | 두 앱 0.7.7 / `07714ed08b63` |
| 공개 앱 | player만 |
| Sites 저장 버전 | 63 |
| Sites 소스 | `d999cb0daaacadf4d64eed29fb946965931e48fa` |
| 배포 | `appgdep_6acee90c17b08191a3529c0b9145f776` — succeeded |
| 완료 시각 | 2026-10-14T02:29:51.513529Z (11:29:51 KST) |
| 로컬 검사 | 드럼 111파일·629테스트, 타입·문구·분리 빌드·공통 재생 검사 통과 |
| 자산 대조 | player/사본/Worker 정적 출력 35파일 SHA-256 일치 |
| 공개 확인 | 홈 200, player JS/CSS·분석/변환 Worker 4파일 해시 일치, 기존 분석정보 조회 200/578박, 없는 해시 404 |
| HTML 차이 | Cloudflare가 응답에 보안 스크립트 1개를 추가함. 해당 삽입부 외에는 로컬 HTML과 일치 |
| 패키지 해시 | `sha256:dadb4a67862a2d5f34ed134d4739dfd1431b7c9238a7b8ca1920c61f597c631e` |

공개 smoke는 사용자 허가 후 GET만 사용했다. 서버 분석정보와 음원은 쓰거나 업로드하지 않았다. 첫 Python HTTP 요청은 403이었고 curl 요청은 200이었다. 로컬에만 있던 첫 조회 해시는 404였으며, 이전 공개 검증에 사용한 578박 기록은 200으로 확인했다. 이를 저장소 연결 실패로 해석하지 않는다. 배포 의존성 설치 시 기존 lockfile에서 취약점 경고 11건(중간 4, 높음 7)이 나왔으며 이번 정리 릴리스에서 의존성 버전을 바꾸지는 않았다.

실제 iPhone/iPad 재검증과 청취는 이번 발행 smoke와 구분한다. 상세 범위는 [검증 현황](acceptance.md)을 참고한다.

## 로컬 용량 정리 — 2026-10-13

hosting/deployment/sites의 `node_modules`, Sites의 `dist`, `player-assets`, 이전 `public` 사본, `.sites-runtime`, `.wrangler`를 정리했다. 원본 설정·lockfile·서버 소스와 `.openai/hosting.json`, Sites Git 이력은 유지한다. 정리 직후 배포 checkout은 생성 자산이 없는 준비 전 상태였으며, 2026-10-14의 0.7.7 발행 때 필요한 의존성과 생성 자산을 다시 준비했다. 위 발행 순서대로 `dist/player`를 준비하고 `prepare-sites` → `npm ci` → 빌드를 수행한 후에만 발행한다.

배포 파일을 checkout 외부 경로의 심볼릭 링크로 대체하지 않는다. Git에는 링크 대상의 내용이 함께 저장되지 않으므로 공개 빌드의 입력을 보장할 수 없다. hosting은 설정 원본이며 별도 의존성을 상시 설치할 필요가 없다. 배포 의존성은 실제 빌드를 수행하는 deployment/sites에 필요할 때 설치한다.

## 분석정보 검토 경계 (0.7.8, 2026-10-14 발행)

- `hosting/drizzle/0001_whole_doctor_faustus.sql`이 대기/요청 제한 테이블과 인덱스를 추가한다. 기존 분석 테이블은 삭제하지 않지만 새 공개 API의 승인 원천으로 사용하지 않는다.
- `prepare-sites.mjs`는 `scripts/export-reviewed-analysis.mjs`로 로컬 `audio_analysis_approved`만 정적 JSON/해시 인덱스로 내보낸다. 미승인/기존 캐시를 자동 승격하지 않는다.
- 로컬 `data/runtime/analysis-review-token`은 최초 준비/검토 시 생성하는 비밀 키다. 권한 0600, Git 제외. 배포 소스에는 검증용 SHA-256만 넣고 비밀 키·로컬 API·검토 UI는 넣지 않는다. 키 교체는 검증값 재발행이 필요하다.
- 로컬 승인/반려 후 전용 인증으로 해당 revision의 서버 대기 후보를 삭제한다. 실패하면 로컬 결정은 유지하고 경고한다. 승인 자료 자체는 다음 발행에서 공개된다.
- 배포 전 `approvedCount`를 확인한다. 0이면 공개 분석 캐시도 비어 시작하므로 먼저 검토할 자료가 있는지 확인한다. 현재 공개 서비스에 새 정책이 적용됐다는 뜻은 아니다.
- 정책·한도·잔여 위험은 [보안 보강](SITE-SECURITY-HARDENING.md)을 따른다.

### HTML 보안 헤더 전달

Sites 공개 자산 우선 라우팅 때문에 run_worker_first 설정만으로 홈페이지 헤더 적용을 보장하지 못했다. 준비 스크립트는 빌드한 player HTML을 `server/player-document.ts`로 포함하고, finalize는 해시 대조 후 `dist/client/index.html`과 `player.html`을 제외한다. 두 문서와 `/`는 Worker가 반환한다. 나머지 정적 자산은 기존 바이트를 유지한다.

## 최근 확인된 발행 — 0.7.8

- 정본 구현 `f6c529b`, 공개 HTML 응답 보완 `afc7f7a`: main push 완료.
- 공통 앱 버전 0.7.8, 소스 빌드 `3ef76af78a19`. player만 공개.
- Sites 소스 `756eadcbeb02d37f9e5d94ba19c21b7475a94b1a`, 저장 버전 65.
- 배포 `appgdep_6acf68ef88e08191ab5be50030fea556`: succeeded, 2026-10-14T11:35:32.773583Z / 20:35:32 KST.
- 아카이브 SHA-256 `70715fb4354a9a96dfb39bdeef272da3e7644691603de00b90382bc8fe21a2a6`.
- 최초 Sites64에서 정적 홈페이지 헤더 누락을 발견했다. HTML 진입점은 Worker 응답으로 옮기고 Sites65에 보완 발행했다. 과거 Site를 되돌리지 않았다.
- 공개 smoke: 홈 200, 홈페이지 nosniff/X-Frame-Options/CSP/HSTS 확인, JS/CSS/박 분석/변환 Worker 4파일 SHA-256 일치. 없는/미승인 분석정보 404, 인증 없는 검토 API 404. 로컬 검토 API의 remoteAvailable=true 및 후보 3건 확인. 공개 데이터 쓰기/음원 업로드/실제 후보 승인·반려 없음.
- 전체 117파일647테스트, 최종 응답 경로 보완 집중 3파일12테스트, 타입/i18n/분리 빌드/앱 경계/공통 구조/배포 빌드 통과. root/배포 npm audit 0건. 청크 크기/Node localStorage 경고 유지.
- 승인된 공용 분석정보는 아직 0건이다. 로컬에서 검토·승인 후 다음 발행에 포함한다. 기존 기기 보관 음원은 유지한다. 실기기 청취·공개 부하/공격 시험은 하지 않았다.
