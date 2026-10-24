# Vite·Vitest 보안 수정 버전 업데이트

- 목표: 개발용과 Sites 빌드용 Vite의 알려진 취약점을 수정하고 기존 개발·검증·빌드 호환성을 확인한다.
- 범위: 루트 Vite 7.3.6→7.3.7 및 lockfile, 기존 미커밋 Sites Vite 8.3.5와 관련 의존성의 호환성 검증, Sites 설정의 import 확장자 보완, 빌드번호와 작업 기록.
- 완료 조건: 두 의존성 트리의 Vite audit 경고 해소, peer 의존성 일치, lint·서식·타입·전체 회귀·두 앱 빌드·Sites 로컬 빌드와 정적 자산 일치 확인.
- 제외 범위: 전역 설치, 사용자 저장 데이터·악보·음원 변경, 앱 버전 인상, 커밋·push·PR·공개 발행.
- 검증: `npm run verify`, 두 패키지의 `npm audit --json` 및 `npm ls`, 기존 실제 player 자산을 사용하는 별도 로컬 Sites 빌드. 새 합성 시험자료나 외부 운영 상태를 만들지 않는다.

## 시작 상태와 보존

- 기준 main: `f6088a84d2ff4cb3d3b23887c59f197a3483dc9e`.
- 시작 시 `hosting/package.json`과 `hosting/package-lock.json`에 Vite 8.3.5, Cloudflare 플러그인 1.65.0, Wrangler 4.152.0, Drizzle ORM 0.45.4/Kit 0.31.11 변경이 이미 존재했다. 기존 변경을 덮어쓰지 않고 그 조합을 검증한다.
- 변경 전 네 패키지 파일과 Git 상태는 `.tmp/vite-security-20261024/before/`에 보존했다. 개발 서버는 기존 127.0.0.1:5173을 사용한다.
- 공식 공지의 수정 버전은 7.3.7 및 8.3.3 이상인 해당 계열이다. 개발용은 메이저 업그레이드 없이 7.3.7을 적용하고, Sites는 이미 설치된 8.3.5를 사용한다.
- 근거: [Vite 파일 접근 취약점](https://github.com/vitejs/vite/security/advisories/GHSA-rq7h-c2jc-7f22), [Vite 사용자 지정 미들웨어 취약점](https://github.com/vitejs/vite/security/advisories/GHSA-9jrq-w75r-8gcw), [launch-editor 명령 실행 취약점](https://github.com/vitejs/launch-editor/security/advisories/GHSA-587h-7wmj-h5pm).

## 실행 결과

- 개발용은 `^7.3.7`/설치 7.3.7로 갱신했으며 루트 lockfile의 패키지 버전 변경은 Vite 한 개다. 기존 hosting 패키지 파일 두 개는 시작 시 사본과 바이트가 같다.
- 양쪽 `npm ls --all --json --offline`에서 의존성 오류가 없고 Vite audit 경고도 사라졌다. Sites 전체 audit은0건이다. 개발용 전체 audit에는 이번에 바꾸지 않은 Vitest/@vitest/mocker 5.0.1의 moderate2패키지(별도 공지2건)가 남아 있으며 Vite 경고와 구분한다.
- 첫 `npm run verify`에서 lint·서식433파일·세 타입 검사·전체129파일767검사·두 앱 빌드/경계가 통과했다. 첫 Sites 별도 로컬 빌드와 player38파일 바이트 대조도 통과했다.
- Sites Vite 8.3.5가 `configLoader: 'native'`의 향후 호환성 경고를 출력했다. `hosting/vite.config.ts`의 로컬 플러그인 import에 `.ts`를 명시한다. 기존 TypeScript 설정의 `allowImportingTsExtensions: true`를 사용하며 경고 억제 환경변수는 추가하지 않는다.
- 최종 소스 빌드 `760770bea8a0`, Node.js26.12.1/npm12.2.1에서 `npm run verify`가 다시 통과했다. lint·서식433파일·앱/도구/hosting 타입·문서/구조·전체129파일767검사·두 앱 빌드와 경계를 확인했다. 검사 규칙·기대값·시간 제한은 변경하지 않았다.
- `.tmp/vite-security-20261024/sites-build-final/`에서 canonical 준비 스크립트와 동일한 lockfile로 설치한 의존성을 사용해 Sites Vite8.3.5 빌드를 완료했다. import 경고가 사라졌고 canonical player→Sites 입력→정적 출력38파일(문서2개는 Worker가 전달)의 일치와 Worker HTML 원문 일치를 확인했다. 공개 Site checkout·원격·배포 상태는 바꾸지 않았다.
- 기존5173 프로젝트 Vite PID12448의 경로/cwd를 확인하고 새7.3.7 서버로 재시작했다. 새 PID52309, `127.0.0.1:5173`에서 editor/player HTML2개·Vite client·실제 진입 모듈2개, 총5개 HTTP 검사를 통과했다. 새 브라우저 화면·청취·iPad 조작 검증으로 확대하지 않는다.
- 수록 악보6개와 기존 hosting 패키지 파일2개의 시작 시 바이트를 보존했다. 두 앱 버전0.8.15를 유지했으며 사용자 저장소·원본·앱 재생 소스는 변경하지 않았다. 커밋·push·PR·발행은 수행하지 않았다.

## Vite 단계 당시 남은 경고와 근거

이 절은 Vite 작업 완료 시점의 관측이다. Vitest와 재감사에서 확인한 추가 취약점의 최종 해소 결과는 아래 후속 수정 절을 따른다.

- Vite에 대한 앞선5개 공지는 양쪽 audit에서 사라졌다. Sites 전체 audit0건, 개발용 전체 audit에는 이번 범위 밖인 기존 Vitest/@vitest/mocker5.0.1의 moderate2패키지가 남아 있다. 별도 공지는 [manual mock 등록 코드 주입](https://github.com/advisories/GHSA-qxg6-89mg-rqv8)과 [Windows 경로 우회](https://github.com/advisories/GHSA-xp26-3454-mjgp)다. 전체 개발 의존성이 취약점0건이라고 보고하지 않는다.
- 기존 앱 번들의500kB 청크 경고와 Node26의 실험적 localStorage 경고는 기록했다. npm12는 Sites 임시 설치에서 허용 목록에 없는 일부 의존성의 설치 스크립트를 실행하지 않았으며 그 상태에서 실제 최종 빌드가 통과했다. npm 허용 정책을 바꾸지 않았다.
- 최초 로그: `.tmp/vite-security-20261024/verify.log`, `sites-build.log`. 최종 로그: `verify-final.log`, `sites-build-final.log`, `dev-server.log`.
- 검사 결과: 같은 디렉터리의 `audit-root.json`, `audit-hosting.json`, `dependencies-root.json`, `dependencies-hosting.json`, `dev-smoke.json`, `final-proof.json`. 새 소스의 GitHub CI와 공개 사이트 검사는 수행하지 않았다.

<a id="vitest-security-update-20261024"></a>

## Vitest 취약점 후속 수정

- 목표: 위 단계에서 남은 Vitest 관련 취약점을 해소한다.
- 범위: 루트 Vitest5.0.1→5.0.3, 그와 버전이 묶인 `@vitest/*` 의존성과 lockfile, 재감사에서 확인한 Undici의 호환 보안 패치, 빌드번호·작업 기록. 기존 Vite/hosting 변경을 보존한다.
- 완료 조건: 개발용·Sites audit0건, peer 의존성 일치, lint·서식·타입·전체 테스트·두 앱 및 Sites 빌드 통과.
- 제외 범위: 앱 기능·저장 계약·시험 규칙 변경, 버전 인상, 커밋·push·PR·발행.
- 검증: `npm run verify`, 두 패키지의 audit/의존성 검사, 기존 수록 자료와 canonical player38파일을 사용하는 별도 로컬 Sites 빌드.

공식 [manual mock 코드 주입 공지](https://github.com/vitest-dev/vitest/security/advisories/GHSA-qxg6-89mg-rqv8)와 [Windows 경로 우회 공지](https://github.com/vitest-dev/vitest/security/advisories/GHSA-xp26-3454-mjgp)는5계열 수정 버전을5.0.3으로 명시한다. npm의5.0.3 메타정보에서 Vite7/8과 현재 Node26 지원도 확인했다. 변경 전 패키지 파일/설정·Git 상태는 `.tmp/vitest-security-20261024/before/`에 보존했다.

- Vitest5.0.3 설치 후 해당 공지는 사라졌고 첫 전체 검사는 통과했다. 재감사에서는 기존 Undici6.28.1/7.29.1의 취약점이 추가 검출됐다. 직전 Vite 단계의 audit과 다른 새 관측이며 Vitest가 이 의존성을 추가한 것은 아니다. 이전 lockfile의 실제 버전과 의존 경로를 확인했다.
- 개발용은 OSMD→선택적 gl→node-gyp12.4.0→Undici6.28.1 경로다. node-gyp의 `^6.25.0` 범위 안에서6.29.1로 갱신한다.
- Sites는 최신 Cloudflare 플러그인1.65.0→Miniflare5.20261019.2-beta→Undici7.29.1 경로다. 최신 플러그인도 이 버전을 고정하고 있으므로 기존 플러그인/Wrangler를 유지하고 `miniflare.undici`만7.30.1로 지정하는 override를 적용한다. upstream이 수정 버전을 사용하면 이 지정을 제거할 수 있다. audit의 구형 Cloudflare/Wrangler로 내리라는 제안은 적용하지 않는다.
- 공식 [EventSource 메모리 제한 공지](https://github.com/nodejs/undici/security/advisories/GHSA-4qv8-2p9j-2685)와 [압축 헤더 오류 처리 공지](https://github.com/nodejs/undici/security/advisories/GHSA-xjj6-f33q-929c)는6.29.1/7.30.1을 수정 버전으로 명시한다. Node 요구도 현재 환경과 맞는다.
- 최종 설치 버전은 Vitest/`@vitest/mocker`5.0.3, 개발용 Undici6.29.1, Sites용 Undici7.30.1이다. Vite7.3.7/8.3.5와 기존 hosting의 직접 의존성 버전·Vite 설정을 보존했다. 루트는 Vitest가 선언한 동반 의존성과 Undici만 변경했고 hosting lockfile의 패키지 버전 변경은 Undici 한 개다.
- 최종 audit은 개발용/Sites 모두0건이며, 양쪽 `npm ls --all --json --offline`에서도 의존성 오류가 없다. 취약점 공지·패키지를 숨기거나 검사 규칙·기대값·시간 제한을 바꾸지 않았다.
- Node26.12.1/npm12.2.1, 소스 빌드 `6fdd8220c513`에서 최종 `npm run verify`가 통과했다. lint·서식433파일·앱/도구/hosting 타입·문서/구조·전체129파일767검사·두 앱 빌드/경계를 확인했다. Vitest만 갱신한 첫 검사도 통과했으며, Undici 보완 후 전체를 다시 실행한 결과다.
- 새 `.tmp/vitest-security-20261024/sites-build/`에 최신 hosting lockfile로 `npm ci`한 뒤 canonical 준비 스크립트와 Sites 실제 빌드를 실행했다. player38파일과 Worker HTML이 canonical 출력과 같고 수록6곡의 SHA256도 직전 Vite 단계와 같다. 기존5173서버에서 두 문서·Vite client·진입 모듈2개, 총5개 HTTP 응답을 확인했다.
- 두 앱 버전0.8.15와 앱/저장/악보/시험 소스는 유지했다. 공개 사이트·GitHub CI·새 브라우저 화면/청취·iPad 검증으로 확대하지 않는다. 커밋·push·PR·발행은 수행하지 않았다.
- 근거는 `.tmp/vitest-security-20261024/`의 `audit-root-final.json`, `audit-hosting-final.json`, `dependencies-*-final.json`, `verify-final.log`, `sites-install.log`, `sites-build.log`, `final-proof.json`이다. 최초 감사 로그와 첫 검사도 보존한다. 기존500kB 청크·Node26 localStorage·npm12 설치 스크립트 허용 목록 경고를 기록했으며 최종 빌드는 그 상태에서 통과했다.
