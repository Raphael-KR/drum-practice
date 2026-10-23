# 프로젝트 품질과 의존성 점검 기록

문서 역할: **사실·연구 기록**. 원문 날짜·입력·환경·결과·실패·미확인은 각 절의 당시 상태다. 이번 통합에서 과거 검증을 재실행하지 않았으며, 기록의 “현재”는 원래 작성 시점이다. [기록 안내](../README.md)와 [현행 정본](../../RULES-INDEX.md)을 구분한다.

<a id="project-quality--프로젝트-품질-보완--2026-10-21"></a>

## 프로젝트 품질 보완 — 2026-10-21

문서 역할: **기록·참고**. 완료된 품질 보완 계획·검증 기록. 현재 실행은 [검사 절차](../../how-to/verify.md#testing--개발-검사와-로컬-자산-준비)를 따른다.

- 목표: 기존 앱과 저장 호환성을 유지하며 실행·검사의 재현성과 문서 정확성을 높인다.
- 범위: npm 명령·개발 환경 선언·CI·타입/서식/문서 검사, 문서 링크와 현행 안내, 제작기 파일 입출력·재생 설정 바인딩의 책임 분리.
- 완료 조건: 공통 검사와 전체 회귀·분리 빌드 통과, 14개 끊어진 링크 해소, 초기 생성 경로 일치, 저장 형식·UI 동작 유지.
- 제외: 버전 인상·커밋·push·공개 발행·의존성 신규 도입·원본 자료 변경·프레임워크 교체.
- 검증: lint·서식·타입(앱/도구/hosting)·문서·아키텍처·portable/전체 기존 테스트·두 앱 빌드. CI는 파일 구성과 로컬 동일 명령을 확인하고 원격 실행 성공과 구분한다.


원문 출처: `docs/plans/PROJECT-QUALITY.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="project-quality--순서"></a>

### 순서

1. 공통 생성 명령을 모든 개발·검사 진입점에서 재사용하고 기본 빌드를 분리 빌드로 통일한다.
2. README의 버전 중복과 과거 절차를 정리하고 삭제된 증거는 과거 기록으로 표시한다.
3. 환경별 타입 검사와 공통 검사, portable CI를 추가한다. 로컬 악보를 CI로 업로드하거나 임의 생성하지 않는다.
4. 제작기의 백업·복원과 패키지 가져오기/내보내기, 공통 재생 화면의 설정 이벤트를 분리한다. 기존 함수 본문·등록 순서·이벤트 해제 소유권을 유지한다.
5. 기존 검사를 실행하고 결과와 한계를 기록한다. 앞선 청소의 history.md 변경은 보존한다.

<a id="project-quality--결과"></a>

### 결과

- 실행 경로: 개발 진입점 3개에서 생성 파일이 없는 상태의 재생성을 확인했다. `build`는 `build:apps`를 호출하고 `preview`는 player 출력을 사용한다.
- 문서: 처음 확인한 끊어진 링크 14개를 정리했다. 원본 없는 소스 사본 검사에서 추가 발견한 `.tmp` 증거 링크 10개는 Git에 포함하지 않는 로컬 경로로 명시했다. 기존 증거 파일은 보존했다.
- 검사: ESLint·392개 코드/설정 서식·앱/도구/hosting 타입·i18n·아키텍처·문서 링크 검사를 통과했다. hosting 설정의 배포 전용 manifest 읽기를 실행 시점으로 옮기고 Vite 반환 타입을 명시했다.
- 회귀: 전체 123파일 720테스트 통과. Git 대상 소스만 복사한 별도 작업 폴더에서 `verify:portable`과 83파일 410테스트 통과. 의존성은 설치된 동일 버전을 링크했으며 신규 설치·Linux·Node 22 실행을 검증한 것은 아니다(실행 환경: macOS, Node 26.11.1).
- 빌드: 두 앱 분리 빌드·player 경계 통과. 별도 임시 폴더의 hosting 빌드와 player 36파일 일치 통과. 실제 Sites 사본과 공개 배포는 변경하지 않았다.
- 책임 분리: editor main의 백업/복원·패키지 이벤트를 `editor-file-transfer.ts`로, 공통 재생 화면의 설정 바인딩을 `playback-settings.ts`로 옮겼다. 기존 저장·세션·이벤트 해제 주체를 유지했다. 큰 진입 파일 전체를 분해한 것은 아니며 추가 분리는 후속 변경별로 진행한다.
- CI: Node 22 기반 GitHub Actions를 설정했다. 원격 실행은 아직 수행하지 않았다. 실기기·GUI·청취 검증은 이번 구조 보완에서 수행하지 않았다.
- 증거: `.tmp/quality-{check,tests,portable,build,site-build,dev-hooks}.log`. 기존 번들 크기·Node localStorage 경고는 남아 있다.

<a id="project-quality--후속-릴리스-검증"></a>

### 후속 릴리스 검증

사용자 후속 발행 지시로 공통0.8.9를 발행했다. 구현 SHA `7d024173adfe838f28594514cc6475fb96cd0f98`의 GitHub Actions에서 Node22/Linux·두 패키지 fresh npm ci·verify:portable이 성공했다. 위 초기 로컬 검증의 원격 환경 미확인 항목을 해소했으며 실기기·GUI·청취는 미검증으로 유지한다. [발행 기록](../../how-to/release.md#sites-publication--sites-발행-절차)을 참조한다.

<a id="dependency-security--의존성-보안-점검--2026-10-14"></a>

## 의존성 보안 점검 — 2026-10-14

문서 역할: **기록·참고**. 과거 의존성 보안 조사·수정 기록. 현재 설치 버전이나 신규 보안 감사 결과가 아니다.

- 목표: 0.7.7 발행 때 보고된 배포 의존성 11건의 실제 사용 경로를 확인하고 수정한다.
- 범위: 정본 package-lock.json, hosting 패키지/lockfile 및 생성 배포 사본. npm 감사와 상위 프로젝트 보안 공지를 대조한다.
- 완료 조건: 해당 경고 제거, 의존성 트리 유효, 앱/배포 빌드와 관련 회귀 검사 통과.
- 제외: 공개 서버 데이터 변경, 자동 커밋·push·발행, 앱 버전 상승.
- 검증: 사용자가 이번 타입 검사·관련 테스트·앱/배포 빌드를 명시 허가했다. 합성 공격 재현이나 공개 서버 쓰기는 하지 않는다.


원문 출처: `docs/operations/DEPENDENCY-SECURITY.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="dependency-security--조사-결과"></a>

### 조사 결과

npm audit의 11건은 독립된 CVE 수가 아니라 영향받는 패키지 수다. hosting과 deployment/sites 모두 높음 7개, 중간 4개가 재현됐다. 앱 정본에는 별도로 source-map-js 1건(높음)이 발견됐다. 상세 패키지/영향/수정 버전과 최종 검증은 아래와 같다.

<a id="dependency-security--영향-패키지-11개와-수정"></a>

### 영향 패키지 11개와 수정

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

<a id="dependency-security--공개-앱에-미치는-실제-영향"></a>

#### 공개 앱에 미치는 실제 영향

- 위 11개와 추가 source-map-js는 모두 개발 의존성 트리에 있다. 단순히 devDependency라는 이유만으로 안전하다고 판단하지 않고 실제 코드와 생성물을 대조했다.
- 배포 Worker는 분석정보 JSON 검증과 D1의 prepare/bind/get/put, 정적 자산 전달만 수행한다. 공개 API에 sharp 이미지 변환, Node undici 클라이언트, ws 서버, Vite/esbuild 개발 서버를 노출하는 경로가 없다. 기존 0.7.7 배포 생성 Worker와 수정 후 Worker 모두 외부 패키지 import가 없는 약 5KB의 앱 코드다.
- editor/player의 빌드 모듈 목록에도 해당 취약 패키지는 포함되지 않았다. 악보 렌더러의 브라우저 SVG 표시와 sharp/librsvg 서버 이미지 디코딩은 다른 경로다.
- 이 Mac에서는 Windows 전용 조건이 성립하지 않는다. 구형 esbuild의 serve 기능도 현재 앱 실행 경로에서 사용하지 않는다. 다만 이후 도구 사용 방식이 바뀔 수 있으므로 설치 상태의 취약 버전까지 제거했다.
- **현재 공개 앱에서 이 공지들의 공격 경로는 확인되지 않았다.** 침해 여부를 조사한 것은 아니며, 전체 서비스 보안 보증을 뜻하지 않는다. npm 감사의 0건도 조회 시점에 등록된 알려진 취약점 기준이다.

<a id="dependency-security--수정-선택-근거"></a>

#### 수정 선택 근거

Cloudflare 도구는 공식 stable 태그의 플러그인 1.63.2와 일치하는 Wrangler 4.150.0을 고정했다. 이 조합이 Miniflare beta를 간접 지정한다는 점을 기록하며, 임의로 Miniflare major를 override하지 않았다. Vite는 같은 8.0 계열의 수정 버전 8.0.16을 사용했다.

npm audit fix --force가 제안한 Drizzle 0.18.1 역행은 적용하지 않았다. 최신 0.31.11도 구형 esm-loader를 포함하므로 Drizzle 0.31.10과 스키마 계약은 유지했다. core-utils가 사용하는 esbuild 변환 API에만 0.25.12 override를 걸었다. Drizzle이 이미 사용하는 동일 버전이며 설정·스키마 로딩 및 마이그레이션 생성 명령으로 호환성을 확인했다. 향후 Drizzle이 이 경로를 제거하면 override도 제거할 수 있다.

정본 변경은 hosting/package.json·hosting/package-lock.json·루트 package-lock.json에 있다. deployment/sites는 정본 준비 스크립트로 다시 생성했다. 공개 D1 마이그레이션 적용이나 데이터 변경은 하지 않았다.

<a id="dependency-security--검증-결과"></a>

### 검증 결과

환경: macOS, Node v26.10.0, npm 12.1.0. 2026-10-14 실행.

- 루트/hosting/deployment/sites 각각 npm audit --package-lock-only: 전체 0건, --omit=dev도 0건. npm registry 감사 응답에 근거한다.
- 루트와 배포 사본의 npm ls --all: exit 0, problems 없음.
- npm run build:apps: TypeScript·i18n·editor/player 분리 빌드·앱 경계 검사 통과. 기존 500KB 청크 경고는 유지.
- 분석 API/캐시/가져오기 기존 집중 시험 3파일19테스트 통과. 이번 변경은 빌드 도구 및 개발 의존성에 한정되어 전체 드럼 회귀는 반복하지 않았다.
- 배포 사본의 npm ci 및 npm run build 통과. Worker/D1 계약과 정본 player 자산 35개 SHA-256 일치.
- npm run db:generate: 기존 audio_analysis 테이블을 읽고 “No schema changes, nothing to migrate” 종료. SQL·스냅샷 변경 없음, DB 연결/적용 없음.
- npm 정책에 따라 설치 스크립트 일부가 차단됐으며 정책을 변경하지 않았다. 제공된 바이너리로 빌드가 통과했다. esm-loader/core-utils의 deprecated 안내는 남지만 알려진 보안 취약점 감사 결과는 0건이다.
- 이번 작업에서 커밋·push·공개 발행은 수행하지 않았다. 공개 사이트는 앞서 발행한 0.7.7 / Sites 63 상태다. 실기기/GUI 및 공개 서버 공격 재현은 수행하지 않았다.

<a id="dependency-security--상위-프로젝트-근거"></a>

### 상위 프로젝트 근거

- [esbuild 개발 서버 CORS](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99)
- [Vite Windows 파일 접근 차단 우회](https://github.com/vitejs/vite/security/advisories/GHSA-fx2h-pf6j-xcff)
- [ws 프래그먼트 메모리 고갈](https://github.com/websockets/ws/security/advisories/GHSA-96hv-2xvq-fx4p)
- [undici BalancedPool TLS 설정 누락](https://github.com/nodejs/undici/security/advisories/GHSA-w293-vg96-wgc3)
- [sharp librsvg 취약점](https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w)
- [source-map-js indexed map DoS](https://github.com/advisories/GHSA-68fv-2mgg-jv7q)

<a id="dependency-security--운영-반영"></a>

### 운영 반영

2026-10-14 공통 앱 0.7.8 / Sites65에 의존성 보강을 포함해 발행했다. 발행 시 root 및 배포 npm audit 0건을 재확인했다. 배포·공개 확인은 SITES-PUBLICATION.md를 따른다.
