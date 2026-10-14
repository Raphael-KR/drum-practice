# 의존성 보안 점검 — 2026-10-14

- 목표: 0.7.7 발행 때 보고된 배포 의존성 11건의 실제 사용 경로를 확인하고 수정한다.
- 범위: 정본 package-lock.json, hosting 패키지/lockfile 및 생성 배포 사본. npm 감사와 상위 프로젝트 보안 공지를 대조한다.
- 완료 조건: 해당 경고 제거, 의존성 트리 유효, 앱/배포 빌드와 관련 회귀 검사 통과.
- 제외: 공개 서버 데이터 변경, 자동 커밋·push·발행, 앱 버전 상승.
- 검증: 사용자가 이번 타입 검사·관련 테스트·앱/배포 빌드를 명시 허가했다. 합성 공격 재현이나 공개 서버 쓰기는 하지 않는다.

## 조사 결과

npm audit의 11건은 독립된 CVE 수가 아니라 영향받는 패키지 수다. hosting과 deployment/sites 모두 높음 7개, 중간 4개가 재현됐다. 앱 정본에는 별도로 source-map-js 1건(높음)이 발견됐다. 상세 패키지/영향/수정 버전과 최종 검증은 아래와 같다.

## 영향 패키지 11개와 수정

| 패키지 | 기존 버전 / 심각도 | 문제와 실제 사용 경로 | 수정 후 |
| --- | --- | --- | --- |
| @cloudflare/vite-plugin | 1.37.1 / 높음 | miniflare·wrangler·ws 문제의 상위 영향 패키지. Worker 빌드 도구 | 1.63.2 |
| wrangler | 4.92.0 / 높음 | miniflare와 esbuild 문제의 상위 영향 패키지. 배포/개발 도구 | 4.150.0 |
| miniflare | 4.20260515.0 / 높음 | sharp·undici·ws를 사용하는 로컬 Worker 에뮬레이터 | 5.20261006.2-beta (공식 stable Cloudflare 도구가 지정하는 의존성) |
| sharp | 0.34.5 / 높음 | libvips·libheif·librsvg의 메모리 안전성 문제. 에뮬레이터의 이미지 처리 | 0.35.5 |
| undici | 7.24.8 / 높음 | 특정 TLS/프록시 설정 누락, HTTP 헤더·쿠키·캐시 처리, WebSocket/압축 응답 DoS 등. 에뮬레이터 HTTP 클라이언트 | 7.29.1 |
| ws | 8.18.0 / 높음 | 미초기화 메모리 노출, 작은 WebSocket 프래그먼트에 의한 메모리 고갈 | 8.21.0 |
| vite | 8.0.13 / 높음 | Windows 개발 서버의 파일 접근 차단 우회·UNC 경로 NTLM 정보 노출 | 8.0.16 |
| esbuild | 0.18.20 및 0.27.3 / 중간 | 구버전 serve의 CORS 허용에 의한 소스 노출 및 Windows 개발 서버 파일 읽기 문제. 빌드·TS 변환 도구 | 0.25.12 및 0.28.2 |
| @esbuild-kit/core-utils | 3.3.2 / 중간 | esbuild 0.18.20을 가져오는 Drizzle TS 로더 내부 유틸리티 | 본체 유지, esbuild만 0.25.12로 scoped override |
| @esbuild-kit/esm-loader | 2.6.5 / 중간 | core-utils를 통한 간접 영향. Drizzle 설정/스키마 로딩 | 수정된 하위 의존성 사용 |
| drizzle-kit | 0.31.10 / 중간 | esm-loader를 통한 간접 영향. SQL 마이그레이션 생성 도구 | 본체 유지, 수정된 하위 의존성 사용 |

추가 발견: 앱 정본의 Vite → PostCSS → **source-map-js 1.2.1**에서 비정상 indexed source map의 section offset 처리에 의한 이벤트 루프 DoS가 보고됐다. lockfile에서 **1.2.2**로 갱신했다. 앱 직접 의존성/API는 변경하지 않았다.

### 공개 앱에 미치는 실제 영향

- 위 11개와 추가 source-map-js는 모두 개발 의존성 트리에 있다. 단순히 devDependency라는 이유만으로 안전하다고 판단하지 않고 실제 코드와 생성물을 대조했다.
- 배포 Worker는 분석정보 JSON 검증과 D1의 prepare/bind/get/put, 정적 자산 전달만 수행한다. 공개 API에 sharp 이미지 변환, Node undici 클라이언트, ws 서버, Vite/esbuild 개발 서버를 노출하는 경로가 없다. 기존 0.7.7 배포 생성 Worker와 수정 후 Worker 모두 외부 패키지 import가 없는 약 5KB의 앱 코드다.
- editor/player의 빌드 모듈 목록에도 해당 취약 패키지는 포함되지 않았다. 악보 렌더러의 브라우저 SVG 표시와 sharp/librsvg 서버 이미지 디코딩은 다른 경로다.
- 이 Mac에서는 Windows 전용 조건이 성립하지 않는다. 구형 esbuild의 serve 기능도 현재 앱 실행 경로에서 사용하지 않는다. 다만 이후 도구 사용 방식이 바뀔 수 있으므로 설치 상태의 취약 버전까지 제거했다.
- **현재 공개 앱에서 이 공지들의 공격 경로는 확인되지 않았다.** 침해 여부를 조사한 것은 아니며, 전체 서비스 보안 보증을 뜻하지 않는다. npm 감사의 0건도 조회 시점에 등록된 알려진 취약점 기준이다.

### 수정 선택 근거

Cloudflare 도구는 공식 stable 태그의 플러그인 1.63.2와 일치하는 Wrangler 4.150.0을 고정했다. 이 조합이 Miniflare beta를 간접 지정한다는 점을 기록하며, 임의로 Miniflare major를 override하지 않았다. Vite는 같은 8.0 계열의 수정 버전 8.0.16을 사용했다.

npm audit fix --force가 제안한 Drizzle 0.18.1 역행은 적용하지 않았다. 최신 0.31.11도 구형 esm-loader를 포함하므로 Drizzle 0.31.10과 스키마 계약은 유지했다. core-utils가 사용하는 esbuild 변환 API에만 0.25.12 override를 걸었다. Drizzle이 이미 사용하는 동일 버전이며 설정·스키마 로딩 및 마이그레이션 생성 명령으로 호환성을 확인했다. 향후 Drizzle이 이 경로를 제거하면 override도 제거할 수 있다.

정본 변경은 hosting/package.json·hosting/package-lock.json·루트 package-lock.json에 있다. deployment/sites는 정본 준비 스크립트로 다시 생성했다. 공개 D1 마이그레이션 적용이나 데이터 변경은 하지 않았다.

## 검증 결과

환경: macOS, Node v26.10.0, npm 12.1.0. 2026-10-14 실행.

- 루트/hosting/deployment/sites 각각 npm audit --package-lock-only: 전체 0건, --omit=dev도 0건. npm registry 감사 응답에 근거한다.
- 루트와 배포 사본의 npm ls --all: exit 0, problems 없음.
- npm run build:apps: TypeScript·i18n·editor/player 분리 빌드·앱 경계 검사 통과. 기존 500KB 청크 경고는 유지.
- 분석 API/캐시/가져오기 기존 집중 시험 3파일19테스트 통과. 이번 변경은 빌드 도구 및 개발 의존성에 한정되어 전체 드럼 회귀는 반복하지 않았다.
- 배포 사본의 npm ci 및 npm run build 통과. Worker/D1 계약과 정본 player 자산 35개 SHA-256 일치.
- npm run db:generate: 기존 audio_analysis 테이블을 읽고 “No schema changes, nothing to migrate” 종료. SQL·스냅샷 변경 없음, DB 연결/적용 없음.
- npm 정책에 따라 설치 스크립트 일부가 차단됐으며 정책을 변경하지 않았다. 제공된 바이너리로 빌드가 통과했다. esm-loader/core-utils의 deprecated 안내는 남지만 알려진 보안 취약점 감사 결과는 0건이다.
- 이번 작업에서 커밋·push·공개 발행은 수행하지 않았다. 공개 사이트는 앞서 발행한 0.7.7 / Sites 63 상태다. 실기기/GUI 및 공개 서버 공격 재현은 수행하지 않았다.

## 상위 프로젝트 근거

- [esbuild 개발 서버 CORS](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99)
- [Vite Windows 파일 접근 차단 우회](https://github.com/vitejs/vite/security/advisories/GHSA-fx2h-pf6j-xcff)
- [ws 프래그먼트 메모리 고갈](https://github.com/websockets/ws/security/advisories/GHSA-96hv-2xvq-fx4p)
- [undici BalancedPool TLS 설정 누락](https://github.com/nodejs/undici/security/advisories/GHSA-w293-vg96-wgc3)
- [sharp librsvg 취약점](https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w)
- [source-map-js indexed map DoS](https://github.com/advisories/GHSA-68fv-2mgg-jv7q)
