# 버전 정정과 발행 기록

문서 역할: **사실·연구 기록**. 원문 날짜·입력·환경·결과·실패·미확인은 각 절의 당시 상태다. 이번 통합에서 과거 검증을 재실행하지 않았으며, 기록의 “현재”는 원래 작성 시점이다. [기록 안내](README.md)와 [현행 정본](../RULES-INDEX.md)을 구분한다.

<a id="release-0-8-18-20261025"></a>

## 0.8.18 — 공통 YAML 버전 목록 분리 · 2026-10-25 발행

- 두 앱 0.8.17 → 0.8.18 patch. 개인 중앙 정본 `/Users/raphael/Library/Preferences/pnpm/shared-catalog.yaml`과 Git 사본 `config/shared-catalog.yaml`을 분리했다. pnpm `include`와 명시적 동기화 명령으로 사본·lockfile을 관리하고 CI·Sites는 개인 파일 없이 재현한다. 기존 25개 버전·26개 직접 선언·lockfile 바이트·보안 override를 유지했다. [분리 기록](archive/shared-catalog-20261025.md), [ADR-0028](../decisions/0028-shared-dependency-store-and-catalog.md).
- 소스 빌드 `8c4041613211`. macOS arm64 Node26.12.1/pnpm12.15.0에서 중앙/사본 대조·frozen 설치·audit 0건·전체 `pnpm run verify`가 통과했다. lint·서식 434파일·앱/도구/hosting 타입·문서/구조·전체 129파일 767테스트·두 앱 빌드/공개 경계를 포함한다. 앱 소스는 버전 외 동일하며 저장 형식·원본·수록 6곡을 보존했다.
- 구현 `790b874819e3af703bbb9bb01dcbe497916bddb5`, [PR #18](https://github.com/Raphael-KR/drum-practice/pull/18), 제품 main `880a2caeaec3517c9d03cf7f23039cc2bcfbb2ed`. [PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/40119438753)와 [병합 main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/40119681286)가 성공했다. Linux Node22.23.3/pnpm12.15.0의 portable 83파일 422테스트와 로컬 전체 검사를 구분한다. PR/main tree와 소스·설정 547파일·수록 6곡 해시가 같아 전체 결과를 재사용하고 main에서 두 앱을 재빌드했다. 검토는 Codex 자체 검토다.
- 기존 clean Sites checkout을 공식 helper로 열고 검증한 main에서 player만 준비했다. 독립 내보낸 manifest·lockfile·설치 설정은 이전 발행과 바이트가 같고 설치도 유지되어 재설치하지 않았다. 중앙 YAML 분리 단계의 독립 frozen 설치 증거와 함께, 이번 공식 Sites 빌드·Sites audit 0건·player 45파일의 정본→사본→Worker SHA256 일치를 확인했다. editor는 로컬 전용이다.
- 기존 Site ID·public audience·주소를 유지했다. Sites 소스 `6db3239679f24271fa89749a89b708c30035b5fa`, 저장 버전88 (`appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_dec030edb2fc8191a11aac55c50b3396`), 배포 `appgdep_6adcf5d2b49081918db8374ed6acbe0b`: **succeeded**, **2026-10-25 03:16:03 KST** / 2026-10-24T18:16:03.895443+00:00. [공개 드럼연습실](https://drum-practice-studio.dgkma.chatgpt.site).
- 아카이브 `local-archives/releases/release-0.8.18.tar.gz` SHA256 `338a88d40c068668ceb501c803bd47a10f2f42a8770075a78a6581a8516a857a`. Sites tar content hash `sha256:0fa1d4ee3d00612c9c0c4b2ec6a5e786150582e7bdf626dd6049511265585a96`는 gzip 파일 해시와 별개다.
- 공개 읽기 49항목 통과: HTML 3경로의 최신 번들·nosniff/프레임/CSP/HSTS, 정적 43파일 전체 SHA256(수록 6곡·폰트·JS/CSS·renderer/Worker), 폐기 API 3경로 404. UI 변경이 없어 새 브라우저 조작 검사는 하지 않았고 공개 파일 확인을 청취·장기 재생·iPad 검증으로 확대하지 않는다.
- 기존 OSMD import/청크 크기·Node 실험 기능·GitHub Actions Node20→24 이행 안내는 비차단 경고다. 원본·개인 저장곡·기존 서버·중앙 파일·다른 프로젝트를 보존했다. 중앙 목록의 다른 프로젝트 실제 연결은 이번 범위가 아니다.
- 근거 `.tmp/release-0.8.18/`의 verify/audit·input-proof/review·PR/main CI·main/Sites 빌드·site-inputs-comparison·사이트 버전/배포·parity·smoke·receipt, [완료 계획](archive/release-0.8.18.md). 결과 문서는 별도 PR로 반영하며 제품 버전·발행을 반복하지 않는다. 이번에 병합된 브랜치만 정리한다.

<a id="release-0-8-17-20261025"></a>

## 0.8.17 — pnpm 공통 저장소·중앙 버전 목록 · 2026-10-25 발행

- 두 앱0.8.16→0.8.17 patch. pnpm12.15.0 workspace와 중앙 catalog25종을 앱/hosting의 직접 선언26개에서 공유한다. 기존25개 선언의 실제 버전을 유지하고 이전 미선언 canvas1.0.13을 명시했다. 새 사용자 기능·저장 계약·수록 자료 변경은 없고 editor는 로컬 전용이다. [전환 기록](archive/pnpm-shared-dependencies-20261025.md), [ADR-0028](../decisions/0028-shared-dependency-store-and-catalog.md).
- 소스 빌드 `e4d576e55da5`, macOS arm64 Node26.12.1/pnpm12.15.0에서 frozen 설치·audit0건·`pnpm run verify`가 통과했다. lint/서식432파일·세 타입·구조/문서·전체129파일767테스트·두 앱 빌드/공개 경계를 포함한다. 라이선스 고지47개·기존 수록6곡 해시를 보존했다.
- 구현 `0f8060c114d18da04b20e3d44f51e8b0e8e0f36c`, [PR #16](https://github.com/Raphael-KR/drum-practice/pull/16), 제품 main `7894821a0e894b5161be7d833cabb091f69f2c6a`. [PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/40109368788), [병합 main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/40109460041)가 성공했다. Linux Node22.23.3/pnpm12.15.0의 portable83파일422테스트와 로컬 전체 검사를 구분한다. PR head/main tree·검사 자료가 같아 전체 결과를 재사용하고 main에서 두 앱을 재빌드했다. 검토는 Codex 자체 검토다.
- Sites manifest/잠금 파일은 중앙 카탈로그에서 독립 입력으로 내보냈다. 공식 helper의 frozen 설치·빌드·Sites audit0건, 설치된 보안 override esbuild0.25.12/Undici7.30.1, player45파일의 원본→사본→Worker SHA256 일치를 확인했다. pnpm 저장소/라이브러리 연결은 로컬 설치 방식이고 발행 파일에 node_modules 링크를 넣지 않는다.
- 기존 Site ID·public audience·주소를 유지했다. Sites 소스 `485f55dc9e8d069849c14f01f80851cacad837b9`, 저장 버전87 (`appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_29c8d6df46b48191a17401948327fd8c`), 배포 `appgdep_6adcd691cdf48191b961785255a5d07f`: **succeeded**, **2026-10-25 01:02:42 KST** / 2026-10-24T16:02:42.339630+00:00. [공개 드럼연습실](https://drum-practice-studio.dgkma.chatgpt.site).
- 아카이브 `local-archives/releases/release-0.8.17.tar.gz` SHA256 `f998b9a68e4d38aa5e2224cae43c8ca8d4cfbc7fbfdd6e831e9d81a07444bb1d`. Sites tar content hash `sha256:8172dc826883a7d3131df93a30972f73efc353dfee9964d67a7d522f8579f21d`는 gzip 파일 해시와 별개다.
- 공개 읽기49항목 통과: HTML3경로 최신 번들·nosniff/프레임/CSP/HSTS, 정적43파일 전체 SHA256(수록6곡·폰트·JS/CSS·renderer/Worker), 폐기 API3경로404. 공개 파일 확인을 공개 재생·청취·iPad·Safari 장기 안정성 검증으로 확대하지 않는다. 직전 Safari의 두 앱 초기화·실제 패키지96마디/6SVG페이지·음원 디코딩 근거는 버전 외 소스 동일성(`215e444fa5d3` 재현)을 확인해 재사용했다.
- OSMD import/크기·Node 실험 기능·GitHub Actions Node20→24 이행 안내는 비차단 경고다. 기존 생성물·원본·개인 저장곡·5173서버를 보존했다. 다른 프로젝트의 중앙 목록 연동이나 디스크 절감량 실측은 이번 범위가 아니다.
- 근거 `.tmp/release-0.8.17/`의 verify/audit/frozen-install·input-proof/review·PR/main CI·main/Sites 빌드·사이트 버전/배포·parity·smoke·receipt, [완료 계획](archive/release-0.8.17.md). 후속 결과 문서는 별도 PR로 반영하고 버전·발행을 반복하지 않는다. 이번에 병합된 브랜치만 정리한다.

<a id="release-0-8-16-20261024"></a>

## 0.8.16 — 의존성 보안 업데이트·Vite8 호환성 · 2026-10-24 발행

- 두 앱0.8.15→0.8.16 patch. 기존 기능의 의존성·보안·빌드 호환성 보완이며 새 사용자 기능·저장 계약 변경은 없다. 개발용/Sites Vite8.3.5, Vitest/mocker/spy5.0.5, Node 타입26.6.5, 승인된 미디어/저장소 시험/서식 도구와 Undici6.29.1/7.30.1을 반영했다. editor는 로컬 전용이며 player만 공개한다.
- Vite의 Rolldown/JSON import/native 경로와 기존 build/css 브라우저 target을 맞췄다. NodeBlob 입력의 테스트 두 곳은 같은 ZIP 바이트를 ArrayBuffer로 받도록 했다. 앱 기능·DB/키·직렬화·검사 규칙·기대값·시간 제한을 바꾸지 않았고 수록6곡 SHA256과 원본/개인 저장 정보를 유지했다.
- 소스 빌드 `de75f325f873`, Node26.12.1/npm12.2.1의 새 전체129파일767검사·lint/서식433파일·앱/도구/hosting 타입·문서/구조·두 앱 빌드/경계가 통과했다. 개발용/Sites audit 모두0건·peer 오류 없음. 같은 lockfile의 fresh Sites 설치와 로컬 빌드도 통과했다.
- 구현 `caf6f0b7b9e3e3ec0bd2853fb11446de9b020463`, [PR #14](https://github.com/Raphael-KR/drum-practice/pull/14), 제품 main `1beda44ec0693b114017fb09a1eed8b74e0725b9`. [PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/40074905780), [병합 main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/40075122870)가 성공했다. PR CI는 Node22.23.3/npm10.9.9에서 공통 검사·portable83파일422검사를 실행했다. 자체 검토이며 독립 승인으로 표현하지 않는다. PR head/main tree·실제 검사 자산이 같아 로컬 전체 결과를 재사용하고 main에서 두 앱을 재빌드했다.
- 기존 public audience·Site ID·주소를 유지했다. 정본 player→배포 사본→Worker 출력의 실제 manifest45파일 SHA256이 같고 HTML 두 파일은 Worker가 전달한다. 청크 분할 변화로 파일 수가 달라졌으며 고정 개수를 성공 기준으로 사용하지 않았다.
- Sites 소스 `f7606bd4cc0ed6f1b09aae0aab3d915f75ba0dd9`, 저장 버전86 (`appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_b9b2aaf6b5408191b0a5fa338bb1cc21`), 배포 `appgdep_6adc626d43ec819183229195534ed7e9`: **succeeded**, **2026-10-24 16:47:10 KST** / 2026-10-24T07:47:10.011650+00:00. [공개 드럼연습실](https://drum-practice-studio.dgkma.chatgpt.site).
- 아카이브 `local-archives/releases/release-0.8.16.tar.gz` SHA256 `1b86915ab3249de7c46c41576c4909cbe4bdd6e9813192b730bd5c9ee1da51b9`. Sites tar content hash `sha256:a39971b8b5a9d37b06dff9a7ae85f43fe92e5f2a9af64d55dc55b0087fb43b59`는 gzip 파일 해시와 별개다.
- 공개 읽기 smoke49항목 통과: HTML3경로의 최신 번들·nosniff/프레임/CSP/HSTS, 정적43파일 전체 SHA256(악보6개·폰트·renderer·JS/CSS·Worker), 폐기 API3경로404. 개인 음원 업로드나 서버 분석 API를 추가하지 않았다.
- 실제 Safari 두 앱 목록/화면과 MP3/PDF/MusicXML 처리는 의존성 최종 조합 `20585a52b084`의 검수다. 이전 앱 버전 바이트로 이 해시를 재현해 이번 후보와의 제품 차이가 앱 버전뿐임을 확인했다. 공개 파일 일치를 공개 재생·청취·iPad 실기기·Safari 장기 안정성으로 확대하지 않는다.
- 기존 OSMD 정적/동적 import·500kB 청크·Node localStorage·npm12 설치 스크립트 허용 목록과 Actions 환경 이행 안내는 비차단 경고다. 허용 정책이나 검사 기준을 끄지 않았으며 실행 결과와 남은 한계를 [의존성 기록](archive/dependency-updates-20261024.md)에서 구분한다.
- 근거 `.tmp/release-0.8.16/`의 verify/audit/의존성·input-proof/review·PR/main CI·main/Sites 빌드·site-package/version/deployment·parity·smoke·receipt. [완료 계획](archive/release-0.8.16.md)과 보안/의존성 기록을 archive로 이관하고 이전 주소·명시 앵커를 유지한다. 후속 결과 문서도 작업 브랜치/PR로 main에 반영하며 제품 소스가 같으면 버전·발행을 반복하지 않는다. 이번에 병합된 브랜치만 정리하고 최종 상태는 receipt에 기록한다.

<a id="release-0-8-15-20261024"></a>

## 0.8.15 — 공통 재생 성능·메모리 개선 · 2026-10-24 발행

- 두 앱0.8.14→0.8.15 patch. 기존 재생의 반복 계산·DOM 쓰기·메모리 복사를 줄이는 보완이며 새로운 사용자 기능·의존성·DB/키·저장 형식 변경은 없다. editor는 로컬 전용이고 player만 공개한다.
- 화면 geometry/BPM snapshot과 SVG 강조 자료를 수명 안에서 재사용하고, 클릭 목록은 cycle당 한 번 준비한다. SVG 준비도 한 문서를 공유해 파싱169→36회, 명시적 바이트 읽기297,635,989→7,992,669bytes로 줄였다. 약276.2MiB는 반복 읽기/복사 총량이며 고정 RSS 감소량이 아니다. [성능](archive/runtime-performance-20261024.md) · [메모리](archive/runtime-memory-20261024.md).
- 릴리스 자체 검토에서 PNG는 Safari의 구형 IndexedDB Blob 복원을 위해 기존 바이트 materialization을 유지하도록 범위를 좁혔다. SVG34장의 출력 해시·내장 글꼴·오선/강조와 수록6곡 SHA256은 유지한다. 개인 저장곡을 교체하거나 원본 자료를 삭제하지 않았다.
- 최초 전체 검사의 BPM 저장 대기1건은 단독25검사에서 통과했다.400ms debounce 뒤 실제 미디어 직렬화가 끝나도록 동일한 엄격 저장값 비교의 한도를 인접 BPM 검사와 같은5초로 맞추고 전체를 재검증했다. 실패 로그를 보존했다. 최종4eba91c4f6d5에서 전체129파일767검사·lint/서식433파일·앱/도구/hosting 타입·문서/구조·두 앱 빌드/경계를 통과했다.
- 구현 `951dca6dfd9fc582042bc177a74ce0bc0bbe80b3`, [PR #12](https://github.com/Raphael-KR/drum-practice/pull/12), 제품 main `d0465365048b146dcec96ac86d6dd0a388aa0743`. [최신 PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/40023822225), [병합 main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/40024010159)가 성공했다. 자체 검토이며 독립 승인으로 표현하지 않는다. head/main tree·의존성/설정·검사 입력이 같아 전체 결과를 재사용하고 main에서 두 앱을 재빌드했다. 최종 소스 빌드 `4eba91c4f6d5`.
- 기존 public audience·Site ID를 유지하고 player만 발행했다. 정본 `dist/player`·배포 사본·Worker 산출물38파일의 SHA256이 같다. HTML 두 파일은 Worker가 제공한다.
- Sites 소스 `7011b12979f256af6983b42dd38a657b6c2a8a99`, 저장 버전85 (`appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_0749775bc87c81918e402f8722534501`), 배포 `appgdep_6adbcc6488848191a0e0b10d4d96fee2`: **succeeded**, **2026-10-24 06:06:59 KST** / 2026-10-23T21:06:59.810536+00:00. [공개 드럼연습실](https://drum-practice-studio.dgkma.chatgpt.site).
- 아카이브 `local-archives/releases/release-0.8.15.tar.gz` SHA256 `2c8f28d1b4774bb66f5a942d31d364afb771a531e63ddb0703c07ef2ff81cd38`. Sites tar content hash `sha256:df9f66baf42068487325febcb3504e1f45bb1a1cdb17db7cdc6b7f8a611998a0`는 gzip 파일 해시와 별개다.
- 공개 읽기 smoke42항목 통과: HTML3경로의 새 번들·nosniff/프레임/CSP/HSTS, 정적36파일 전체 해시(수록6곡·폰트·renderer·JS/CSS·Worker), 폐기 API3경로404. 수록 패키지를 바꾸지 않았다.
- 실제 Safari의 두 줄/한 줄·재생5초360프레임/최대20ms와 출력 동일성 검수는 source2884c75bbd2c다. 두 파일의 직전 바이트로 소스 해시를 재현해 릴리스 후보와의 차이가 앱 버전과 PNG의 기존 호환 복원뿐임을 확인했으며 SVG 경로 관측을 재사용했다. 공개 재생·청취·iPad 실기기·Safari native 충돌 완치·RSS 고정 절감량은 미확정이다.
- Vite 청크 크기·Node localStorage·Actions 환경 이행 안내는 비차단 경고다. 배포 준비 audit은 기존 개발 의존성Vite8.0.16에 high1개 패키지/5개 advisory를 반환했다. 개발 서버/launch-editor 경로이며 공개2804bytes Worker에는 Vite/launch-editor가 없음을 확인했다. 별도 개발 도구 보완 후보로 남기며 audit 통과로 보고하거나 force 업데이트하지 않았다.
- 근거: `.tmp/release-0.8.15/`의 verify/단독 재현·최종 검사·PR/main CI·main 빌드·input-proof·parity·site-package/version/deployment·smoke·hosting-audit·receipt. [완료 계획](archive/release-0.8.15.md)을 이관하고 이전 주소를 유지한다. 후속 결과 문서도 작업 브랜치/PR로 반영하며 제품 소스가 같으면 버전·발행을 반복하지 않는다.

<a id="release-0-8-14-20261024"></a>

## 0.8.14 — 공통 끝점·두 줄 표시 갱신 개선 · 2026-10-24 발행

- 사용자 커밋 요청으로 두 앱0.8.13→0.8.14를 맞췄다. 기존 크레센도/표시 동작의 오류·성능 보완이므로 patch이며 저장 형식·DB·키는 유지한다.
- 공통 native 크레센도 끝점, 붉은 노을112마디2박→113마디2.5박 교정 및 실제 수록본 회귀, 두 앱 공통 텍스트·beam clip의 동일 값 재기록 감소를 포함한다. [끝점](archive/wedge-endpoint-20261024.md) · [수록](archive/red-sunset-crescendo-bundle-20261024.md) · [스크롤](archive/safari-two-row-scroll-20261024.md).
- 원본/수록 파일·실측 fixture는 Git 제외 정책으로 로컬에 보존한다. 최초 사용자 커밋 단계는 로컬만 진행했고, 후속 release-drum-practice 실행에서 아래 push·병합·발행·공개 확인을 수행했다. Safari native 충돌의 최종 해결은 미확정이다.
- 두 앱0.8.14·소스 빌드15ce6955d5d1에서 전체129파일765검사·lint/서식433파일·타입/문서/구조·두 앱 빌드/경계 통과. 버전 인상 전 실제 Safari 관측과 입력/범위는 위 실행 기록을 따른다. 생성기 문법 검사와 수록6곡 보존을 확인했고 실행 로그는 `.tmp/commit-0.8.14/`에 있다.
- 구현 `339e8162a27e12e9c23b12629e7ddacd56dd979d`, 릴리스 계획 `158e9b0b676cc3f8195ffadb486c4730025048c0`를 `codex/release-0.8.14`로 push하고 [PR #10](https://github.com/Raphael-KR/drum-practice/pull/10)을 병합했다. 제품 main `9603dcc834c05289d2e37d7ed6618a81e7ac87e8`. 기존 로컬 커밋·이력은 재작성하지 않았다. 검토는 자체 검토이며 독립 승인으로 표현하지 않는다.
- [최신 PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/40009280589)와 [병합 main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/40009776809)가 성공했다. 구현339e816에서 main까지 릴리스 계획 문서 외 파일이 같고 의존성/설정·실제6곡/fixture가 같아 위 전체 검사 결과를 재사용했다. main에서 두 앱을 다시 빌드해 소스 빌드15ce6955d5d1·타입/문서/공통 경계를 확인했다.
- 기존 public audience·Site ID를 유지하고 player만 발행했다. 정적38파일은 `dist/player`·배포 사본·Worker 산출물 세 곳에서 SHA256이 같다. editor는 로컬 전용이며 개인 저장곡을 자동 교체하지 않는다.
- Sites 소스 `1e8c2143dd1552f8c2a0a3947ac8c0991907c6dd`, 저장 버전84 (`appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_b7696c11234c8191bf961c9e3827b45b`), 배포 `appgdep_6adbb2723e70819199de01069c130e02`: **succeeded**, **2026-10-24 04:16:23 KST** / 2026-10-23T19:16:23.384927+00:00. [공개 드럼연습실](https://drum-practice-studio.dgkma.chatgpt.site).
- 아카이브 `local-archives/releases/release-0.8.14.tar.gz` SHA256 `b2ab92facc970088d006d916baa858dd4398727fd6e967ba8fd5163adb74b532`. Sites tar content hash `sha256:bd5ea9f6468f0c9bf283d7b4e4f73c53e8b7e411a5e5b7db43da22c1913bbf36`는 gzip 파일 해시와 별개다.
- 공개 읽기 smoke42항목 통과: HTML3경로의 새 번들·nosniff/프레임/CSP/HSTS, 정적36파일 전체 SHA256(악보6개·렌더러·폰트·JS/CSS·Worker 포함), 폐기 API3경로404. 교정된 붉은 노을13,559,217bytes/SHA256 `cf57783b65f512ccd67506481971044495952bdc088a41e986b544773496af14`도 일치한다.
- UI는 버전만 다른 같은 제품 소스fbac2388f3bf의 실제 Safari 두 줄 스크롤·112–137마디 재생·한 줄/두 줄 복귀 증거를 재사용했다. 정지 화면1.2초 DOM 변경258→0건을 확인했지만 수정 전후 제한 재생에서 native 충돌이 재현되지 않아 해결 확정으로 보고하지 않는다. 공개 파일 일치는 공개 청취·iPad 실기기 검증을 뜻하지 않는다. Vite 청크 크기·Node localStorage·Actions 환경 이행 안내는 비차단 경고다.
- 근거: `.tmp/commit-0.8.14/`, `.tmp/safari-reload-20261024/`와 `.tmp/release-0.8.14/`의 PR/main CI·main 빌드 로그, `site-package.json`, `parity.json`, `site-version.json`, `site-deployment.json`, `smoke.json`, `receipt.json`. [완료 계획](archive/release-0.8.14.md)을 이관하고 이전 주소/문단 안내를 유지한다. 발행 후 결과 문서도 작업 브랜치·PR로 반영하며 제품 소스 불변이면 버전 재인상·재발행하지 않는다.


<a id="release-0-8-13-20261024"></a>

## 0.8.13 — 공통 악보 조판 보완 · 2026-10-24 발행

- 연속 크레센도·섹션/연주 지시문·Pretendard·하이햇 주법 위치·한 줄 변박 오선 크기와 최신 교정 악보를 반영했다. 기존 연습 흐름의 오류·제작/검수·문서 보완이므로 patch이며 두 앱0.8.13이다. DB·저장 키·파일 형식·원음원·박 시각은 유지한다. 공개는 player뿐이고 editor는 로컬 전용이다.
- 구현 `1e40272be03a27d0aeebbc1289e5e225497afca1`, CI 문서 보완 `e9bb085174a882f2c0dd0b27a0b6039783f76297`, [PR #7](https://github.com/Raphael-KR/drum-practice/pull/7) main `4fbb16b73a2cf6fd75e6e1f1db40ccdee74fe721`. 패키지 보완 `e2556c73039ffc008fa034b02537a382fe4d4f76`, [PR #8](https://github.com/Raphael-KR/drum-practice/pull/8), 최종 제품 main `2a856fbd3c77750550e3dc8c40070f42ec08d9b7`. PR #8 head/main tree `f1c3f274099c44bcdcf1b9b74bdcd9e1cedbcff3` 동일, 소스 빌드 `f6dd74f66c92`다.
- 로컬 최종 `npm run verify`:127파일758검사·lint·서식430파일·앱/도구/hosting 타입·문서/구조·두 앱 빌드/경계 통과. 실제 제작 공통/검증/인계18검사도 번들 Python으로 통과했다. PR #7/#8 head와 각 main CI 성공을 확인하고 최종 main에서 두 앱을 재빌드했다. [최종 main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/39986542431). 검토는 자체 검토이며 독립 승인으로 표현하지 않는다.
- 최초 CI는 Git 제외 로컬 자료의 상대 링크66개 때문에 실패했다. 같은 캡션·경로를 로컬 보존 기록으로 바꾸고 공통 문서 검사가 실제 존재와 Git 소스 포함 여부를 함께 확인하도록 수정했다. 기준을 끄거나 원본 미디어를 Git에 넣지 않았다.
- 최초 Sites push는 `pack member exceeds aggregate working-memory limit`로 거부됐다. canonical XML에서 재생성하는 버전1 timeline metadata만 배포 패키지에서 제외했다. 세 실제 파일의 source/XML·음원·Song·나머지 ZIP 엔트리가 정확히 같고 인쇄 SVG 잉크/글꼴도 동일하다. Safari에서137/93/110개 native 자산 복원을 확인했다. 새 CLI·타입 선언도 공통 검사에 포함했다.
- 원래 세 패키지는 `local-archives/releases/0.8.13-package-inputs/`, 실패한 사본과 미발행 Site 커밋 `945b6f52a9840e04fcfe217e8bfca00a0309a019`는 `local-archives/releases/sites-upload-failed-0.8.13/`에 보존했다. 원격 Site의 실제56de1cd에서 새 사본을 열었으며 reset·강제 push·공개 버전 롤백은 하지 않았다.
- 정적38파일을 정본 빌드·배포 사본·Worker 산출물 세 곳에서 대조했다. HTML 두 파일은 Worker가 제공한다. Sites 소스 `e584b5497b80ba02aaedc79417012c899f2bd192`, 저장 버전83 (`appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_0b66f929c1908191b39df6492212810b`).
- 배포 `appgdep_6adb8b1492b88191b51e8e05b4401523`: **succeeded**, **2026-10-24 01:28:31 KST** / 2026-10-23T16:28:31.067153+00:00. 기존 공개 범위와 [드럼연습실 주소](https://drum-practice-studio.dgkma.chatgpt.site)를 유지했다.
- 아카이브 `local-archives/releases/release-0.8.13.tar.gz`, SHA256 `f795bd4819d95af9c1c4592e9e85bc96128b9ad6c71d26abf85f93a9aaca5255`. Sites tar content hash `sha256:397cf13e5fe99e2a7b7e919970429ddb1d74f692166fb07789c2cbe0a689c399`는 로컬 gzip 파일 해시와 별개다.
- 공개 읽기 smoke42항목 통과: HTML3경로의 새 번들·nosniff/프레임/CSP/HSTS, 정적36파일 전체 SHA256(악보6개·렌더러·폰트·JS/CSS·Worker 포함), 폐기 API3경로404. 공개 파일은 검증한0.8.13 산출물과 같다.
- `red-sunset` 패키지: 56,373,182→13,557,768바이트, 발행 SHA256 `1e59302e2e439eb8bd69a8dff0c92d61ede25d201d8648894304b0584a85b670`. 원본/음악 정보와 인쇄 글꼴·잉크는 유지한다.
- `ioi-suddenly` 패키지: 25,515,619→7,966,184바이트, 발행 SHA256 `d3a64dcf9512cf849801acc9535f7f748ba0cd29f247d36611d7d438738c3323`. 원본/음악 정보와 인쇄 글꼴·잉크는 유지한다.
- `real-paradis` 패키지: 30,113,720→11,476,951바이트, 발행 SHA256 `ac0e9f0828237928993836e01cac1163d8df494b6bae434a01ecf325a154d5cc`. 원본/음악 정보와 인쇄 글꼴·잉크는 유지한다.
- UI는 같은 조판 소스의 로컬 Safari 한 줄/두 줄·확대50/100/200%·지시문 경계·인쇄 음표1,935개 보존과 경량 패키지의 실제 공통 재읽기/복원 근거를 사용했다. 공개 파일 일치를 공개 재생·전곡 청취·iPad 실기기 검증으로 확대하지 않는다. Vite 청크 크기·Node localStorage·Actions 환경 이행 안내는 비차단 경고다.
- 근거: `.tmp/release-0.8.13/`의 `verify-packaging-restored.log`, `production-tests-final.log`, PR/main CI·main/배포 빌드 로그, `compact-evidence.json`, `compact-browser.json`, `parity.json`, `site-version.json`, `site-deployment.json`, `smoke.json`, `receipt.json`. 발행 후 기록/완료 계획 이관 PR은 제품 소스·빌드를 바꾸지 않으며 버전 재인상·재발행하지 않는다.

<a id="app-version-history--앱-릴리스-번호와-정정-기록"></a>

## 앱 릴리스 번호와 정정 기록

문서 역할: **사실 기록**. 날짜·입력·버전·한계는 당시 관측이다. 현행 요구는 [Rule 목록](../RULES-INDEX.md), 실행 순서는 [절차 목록](../README.md)을 따른다. 아래 검증을 이번 문서 정리에서 다시 실행하지 않았다. 삭제된 Git 제외 증거의 존재를 보장하지 않는다.


원문 출처: `docs/records/APP-VERSION-HISTORY.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="app-version-history--이관-원문--app-versionsmd--1"></a>

#### 이관 원문 — APP-VERSIONS.md / 1

출처: [docs/operations/APP-VERSIONS.md](../reference/engineering/release.md#app-versions--앱-공통-버전). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="app-version-history--앱-공통-버전"></a>

##### 앱 공통 버전

악보제작기와 드럼연습실의 현재 정본은 `src/app-versions.json`이며 두 앱 모두 **0.8.12**이다. 한쪽 전용 수정도 기본적으로 같은 릴리스 번호를 쓰고 변경 내용을 구분한다. 새 독립 사용자 기능은 minor, 기존 기능 완성·보완·오류 수정은 patch다. 음원 연습 기능 안정화는0.7.x로 유지한다.

<a id="app-version-history--이관-원문--app-versionsmd--2"></a>

#### 이관 원문 — APP-VERSIONS.md / 2

출처: [docs/operations/APP-VERSIONS.md](../reference/engineering/release.md#app-versions--앱-공통-버전). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="app-version-history--2026-10-13-정정-대응표"></a>

###### 2026-10-13 정정 대응표

| 정정한 공통 버전 | 내용 | 당시 player 표시 | 당시 editor 표시 | 기능 커밋 | Sites 저장 버전 |
| --- | --- | --- | --- | --- | --- |
| 0.7.3 | 음원 템포 추종·고정 박 간격 재생 보완 | 0.8.0 | 0.6.31 | 7e76238 | 59 |
| 0.7.4 | 박 정보 누락·파형 스크롤·파일 선택 복귀 수정 | 0.8.1 | 0.6.32 | 482da36 | 60 |

문서의 릴리스 제목·앱 표시 정본은 정정 번호를 사용한다. 위의 당시 표시 값은 배포 추적용이며 현재 버전 정책이 아니다. 기존 커밋 SHA, Sites 버전/배포 ID, 빌드번호, 원본 검증 로그는 당시 산출물을 가리키므로 유지한다. 검증 로그의 `.tmp/release-0.8.0/` 및 `.tmp/release-0.8.1/` 경로도 그대로다. 의존 라이브러리 버전은 이 정정과 무관하다.

<a id="app-version-history--이관-원문--app-versionsmd--3"></a>

#### 이관 원문 — APP-VERSIONS.md / 3

출처: [docs/operations/APP-VERSIONS.md](../reference/engineering/release.md#app-versions--앱-공통-버전). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="app-version-history--현재-발행-상태와-증가-시점"></a>

###### 현재 발행 상태와 증가 시점

0.8.12는 갑자기 악보를 공통 내 악보 목록에 추가하고 제작 도구·검수·인계 절차를 재사용하도록 정리한 patch다. 기존 악보 연습 흐름의 수록곡·유지보수 보완이며 저장 형식은 유지한다. 두 앱 버전을 맞추되 공개 대상은 player뿐이다. 릴리스 검증과 발행 진행 상태는 변경 기록을 따른다.

현재 공개 버전 0.8.12는 병합 main `902aec5`, 소스 빌드 `f79fd6d87894`, Sites 버전82이다. 2026-10-23 배포 succeeded와 공개 smoke16항목 통과로 갑자기를 포함한 악보6개의 반영을 확인했다. 공개는 player만이며 editor는 로컬 전용이다. PR·CI·배포 ID와 확인 결과는 [Sites 발행](../how-to/release.md#sites-publication--sites-발행-절차)을 따른다.

사용자가 커밋을 요청했을 때 앱 변경의 버전을 올린다. 현재 사용자 결정은 두 앱의 릴리스 번호를 맞추는 것이다. 기존 0.7 음원 기능의 정확도·조작·안정화는 patch이고 독립된 새 사용자 기능은 minor다. 문서만 고칠 때는 앱 버전을 유지한다.

```sh
npm run version:app -- both patch
node scripts/build/build-info.mjs
```

버전 상승은 검사·커밋·push·배포의 성공을 뜻하지 않는다. 각각의 결과를 따로 기록한다.

<a id="app-version-history--이관-원문--app-versionsmd--4"></a>

#### 이관 원문 — APP-VERSIONS.md / 4

출처: [docs/operations/APP-VERSIONS.md](../reference/engineering/release.md#app-versions--앱-공통-버전). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="app-version-history--077--코드-및-프로젝트-정리"></a>

###### 0.7.7 — 코드 및 프로젝트 정리

두 앱의 미디어 저장 변환·구간 처리·목록 코드 공통화, 미사용 코드/테스트 제거, 독립 HTML 내보내기 폐기와 문서/제작 경로 정리를 포함한다. 새 사용자 흐름 추가가 없는 유지보수 릴리스이므로 patch로 올린다. 두 앱을 함께 0.7.7로 맞추며 공개 대상은 player뿐이다. 발행 상태는 Sites 발행 문서에서 별도로 확인한다.

<a id="app-version-history--이관-원문--app-versionsmd--5"></a>

#### 이관 원문 — APP-VERSIONS.md / 5

출처: [docs/operations/APP-VERSIONS.md](../reference/engineering/release.md#app-versions--앱-공통-버전). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="app-version-history--078--음원-분석정보-보안운영-보강"></a>

###### 0.7.8 — 음원 분석정보 보안·운영 보강

기존 음원 분석 공유 기능의 검토/승인 경계, 요청·보관 제한, 의존성 취약점 수정, 보안 헤더와 음원 디코딩 상한을 반영한다. 새 연습 방식을 추가하지 않고 기존 0.7 기능의 안전성과 운영을 보완하므로 patch다. 로컬 검토 UI도 이 보호 절차에 포함된다. 공개 대상은 player이며 editor는 같은 소스 릴리스 번호만 맞춘다.

<a id="app-version-history--이관-원문--app-versionsmd--6"></a>

#### 이관 원문 — APP-VERSIONS.md / 6

출처: [docs/operations/APP-VERSIONS.md](../reference/engineering/release.md#app-versions--앱-공통-버전). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="app-version-history--079--음원-분석의-기기-내부-처리"></a>

###### 0.7.9 — 음원 분석의 기기 내부 처리

기존 0.7 음원 연습 흐름을 단순화하여 곡명·가수·박 분석과 캐시를 각 브라우저 안에서 처리한다. 서버 분석 저장·조회·검토/승인과 자료를 제거하고 서버 악보 다운로드는 유지한다. 새 독립 기능 추가가 없는 기존 기능 보완이므로 patch다. 두 앱 번호를 맞추되 공개 대상은 player뿐이다.

<a id="app-version-history--이관-원문--app-versionsmd--7"></a>

#### 이관 원문 — APP-VERSIONS.md / 7

출처: [docs/operations/APP-VERSIONS.md](../reference/engineering/release.md#app-versions--앱-공통-버전). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="app-version-history--0710--음원-태그재생-레이아웃오류-안내-개선"></a>

###### 0.7.10 — 음원 태그·재생 레이아웃·오류 안내 개선

곡명·가수는 태그 우선으로 읽고 없는 필드는 파일명으로 보완한다. 태그 BPM은 악보 BPM에 반영하고 분석 박 시각과 구분한다. 넓은 세로 창의 제목·재생바 배치와 악보 안 오류 레이어를 개선했다. 기존 음원 연습 기능과 화면의 정확성·사용성 보완이므로 patch로 올린다. 두 앱 번호는 함께 맞추며 공개는 player만 한다.

<a id="app-version-history--이관-원문--app-versionsmd--8"></a>

#### 이관 원문 — APP-VERSIONS.md / 8

출처: [docs/operations/APP-VERSIONS.md](../reference/engineering/release.md#app-versions--앱-공통-버전). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="app-version-history--0711--태블릿-하단-버튼판-높이-개선"></a>

###### 0.7.11 — 태블릿 하단 버튼판 높이 개선

기존 재생 화면의 남는 높이를 바로가기·구간 버튼 3줄에 균등 배분한다. 악보와 재생바 크기, 높이가 부족할 때의 최소 버튼판 높이, iPhone 배치를 유지한다. 기존 화면의 조작 개선이므로 patch이며 두 앱 버전을 맞추고 공개는 player만 한다.

<a id="app-version-history--이관-원문--app-versionsmd--9"></a>

#### 이관 원문 — APP-VERSIONS.md / 9

출처: [docs/operations/APP-VERSIONS.md](../reference/engineering/release.md#app-versions--앱-공통-버전). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="app-version-history--0712--붉은-노을-악보와-박별-재생-보완"></a>

###### 0.7.12 — 붉은 노을 악보와 박별 재생 보완

붉은 노을 137마디 악보를 일반 곡 목록에 추가하고, 제작된 박별 시각을 원곡 메트로놈과 고정 연습 BPM 재생에 연결한다. 연속 셋잇단음표 숫자 누락도 수정한다. 기존 악보·음원 연습 기능의 완성도를 높이는 보완이므로 patch다. 두 앱 버전을 함께 올리며 player만 공개한다. 자유 엔딩 시각의 잠정 상태와 iPad 청취 미확인은 유지한다.

<a id="app-version-history--이관-원문--app-versionsmd--10"></a>

#### 이관 원문 — APP-VERSIONS.md / 10

출처: [docs/operations/APP-VERSIONS.md](../reference/engineering/release.md#app-versions--앱-공통-버전). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="app-version-history--080--사용자-설정-백업복원"></a>

###### 0.8.0 — 사용자 설정 백업·복원

여러 음원의 분석·보정·마커·구간·곡별 설정을 음원 없이 JSON 하나로 백업하고 원본 음원을 연결해 복원하는 독립 사용자 흐름을 추가하므로 minor다. 원곡/악보 BPM 버튼 분리, 내 음원 목록 분리와 설정 디자인 개선도 포함한다. 두 앱 공통 번호를 맞추고 공개는 player만 한다. 과거 0.8.0 표기를 0.7.3으로 정정한 기록과 이번 정식 0.8.0 릴리스는 별개다.

<a id="app-version-history--이관-원문--app-versionsmd--11"></a>

#### 이관 원문 — APP-VERSIONS.md / 11

출처: [docs/operations/APP-VERSIONS.md](../reference/engineering/release.md#app-versions--앱-공통-버전). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="app-version-history--081-릴리스"></a>

###### 0.8.1 릴리스

음원 조정의 파형·재생·첫박·박자·메트로놈 조작 개선, 중복 음원 확인, 맥락형 도움말과 길게 누르기 말풍선, 확인 팝업 공통화를 반영한다. 기존 흐름의 개선이므로 patch다. 두 앱을0.8.1로 맞추며 player만 공개한다. 발행 결과는 Sites 발행 문서를 따른다.

<a id="app-version-history--이관-원문--app-versionsmd--12"></a>

#### 이관 원문 — APP-VERSIONS.md / 12

출처: [docs/operations/APP-VERSIONS.md](../reference/engineering/release.md#app-versions--앱-공통-버전). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="app-version-history--082--bpm-프리셋과-버튼-길게-누르기-보완"></a>

###### 0.8.2 — BPM 프리셋과 버튼 길게 누르기 보완

프리셋과 직접 입력을 같은 BPM 적용 경로로 연결하고, 정수 프리셋이 변환 하한 때문에 소수 BPM으로 바뀌던 오류를 수정한다. 공통 버튼의 글자 선택·Safari 복사 메뉴도 방지한다. 기존 기능의 오류·조작 개선이므로 patch다. 두 앱을0.8.2로 맞추고 player만 공개한다.

<a id="app-version-history--이관-원문--app-versionsmd--13"></a>

#### 이관 원문 — APP-VERSIONS.md / 13

출처: [docs/operations/APP-VERSIONS.md](../reference/engineering/release.md#app-versions--앱-공통-버전). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="app-version-history--083--모달-닫기와-bpm-프리셋-올림"></a>

###### 0.8.3 — 모달 닫기와 BPM 프리셋 올림

모든 모달·팝업에서 도움말 버튼 대신 공통 X를 사용하고 길게 누르기 설명은 유지한다. 정수 BPM 프리셋을 올림해 최저0.5배 설정 검증과 일치시켰다. 기존 기능의 조작·오류 수정이므로 patch이며 두 앱 번호를 맞추고 공개는 player만 한다.

<a id="app-version-history--이관-원문--app-versionsmd--14"></a>

#### 이관 원문 — APP-VERSIONS.md / 14

출처: [docs/operations/APP-VERSIONS.md](../reference/engineering/release.md#app-versions--앱-공통-버전). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="app-version-history--084--프로젝트-구조-개편"></a>

###### 0.8.4 — 프로젝트 구조 개편

앱·기능·공통 코드·저장 계층을 분리하고 큰 파일/CSS, 테스트·문서·제작 도구를 정리했다. 기존 사용자 기능과 저장 형식을 유지하는 유지보수 릴리스이므로 patch다. 두 앱을 함께 올리고 player만 공개한다.

<a id="app-version-history--이관-원문--app-versionsmd--15"></a>

#### 이관 원문 — APP-VERSIONS.md / 15

출처: [docs/operations/APP-VERSIONS.md](../reference/engineering/release.md#app-versions--앱-공통-버전). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="app-version-history--085--공통-목록과-제작기-화면-개선"></a>

###### 0.8.5 — 공통 목록과 제작기 화면 개선

목록 구성·카드·즐겨찾기·버전 표시를 공통화하고, 제작기 오렌지 테마·목록 복귀·편집 전환을 정리한다. 러브홀릭 PDF103마디 오선 검출과 공통 재생 버튼판 높이를 수정한다. 기존 기능의 오류·화면 개선이므로 patch이며 저장 형식은 유지한다. 제작기는 로컬 전용이며 player만 공개한다.

<a id="sites-publication-history--sites-발행공개-확인-기록"></a>

## Sites 발행·공개 확인 기록

문서 역할: **사실 기록**. 날짜·입력·버전·한계는 당시 관측이다. 현행 요구는 [Rule 목록](../RULES-INDEX.md), 실행 순서는 [절차 목록](../README.md)을 따른다. 아래 검증을 이번 문서 정리에서 다시 실행하지 않았다. 삭제된 Git 제외 증거의 존재를 보장하지 않는다.


원문 출처: `docs/records/SITES-PUBLICATION-HISTORY.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="sites-publication-history--이관-원문--sites-publicationmd--4"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 4

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--최신-발행--0812"></a>

###### 최신 발행 — 0.8.12

- I.O.I 갑자기를 공통 내 악보 목록에 추가하고 제작·검수·인계 도구와 회고 개선을 함께 반영했다. 기존 연습 흐름의 곡 추가·유지보수 patch이며 두 앱0.8.12, 저장 형식 유지, player만 공개했다.
- 구현 `7a7f5a1d2808ece502ef745d4e10bfb41ee200cb`, [PR #5](https://github.com/Raphael-KR/drum-practice/pull/5), 병합 main `902aec51f2fa6293e75230234c9d1b7dd2983f19`. PR head/main tree `0b70aad2af982f8518e2cf2d73d510faa859cba8` 동일, 의존성·설정·검사 자산 변경 없이 전체 검사 결과를 재사용하고 main에서 두 앱을 재빌드했다. 소스 빌드 `f79fd6d87894`.
- `npm run verify`: lint·서식409파일·앱/도구/hosting 타입·다국어·문서/구조, 전체126파일756테스트와 두 앱 빌드·player 경계 통과. 기존 실제 자료를 사용하는 제작 공통 Python4검사도 통과했다. 기존 큰 청크·Node localStorage 경고는 유지한다.
- 독립 검토는 위 구현 SHA의 카탈로그·테스트3파일과 공통 저장/다운로드 영향 경로를 대상으로 차단 지적 없음. 제작 helper는 앞선 검토 이후 변경이 없어 기존 결과를 재사용했다. PR 전체70파일의 새 독립 감사로 확대하지 않는다.
- 최종 [push CI](https://github.com/Raphael-KR/drum-practice/actions/runs/39825352612), [PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/39825417189), [병합 main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/39825778001) 성공. Node22/Linux fresh npm ci·verify:portable 확인. 커넥터의 병합 커밋 실행 목록이 비어 있어 GitHub CLI의 실제 실행 상태로 확인했다.
- 배포 빌드와 정적37파일의3곳 대조 통과(HTML은 Worker가 제공). Sites 소스 `56de1cdcf874804b1bc4706cf0c7dd03c376fce9`, 저장 버전82.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_61e2fef4742c81919611c5fec3e83dd9`.
- 배포 ID: `appgdep_6ada4d7c70188191a38e290e0228779f` — succeeded, 2026-10-23 02:53:19 KST.
- 아카이브: `local-archives/releases/release-0.8.12.tar.gz`, SHA-256 `a59aea0a9beeea693f820d6fc8408a57d13728db92fb3c614fba0b08370bea25`. Sites 저장 tar content hash `05e39560ff122d19a1c8927fca53238ddcc95d391a38dee89540ed84e642e85e`은 로컬 gzip 파일 해시와 별개다.
- 공개 읽기 smoke16항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일·악보6개 SHA-256 일치, 폐기 API3경로404. 갑자기 패키지 SHA-256 `82936aae3c92bff84d52c8ae4b3190073e63358ee3cedd4253900707aee7763a`를 포함해 공개 파일이 검증한0.8.12 산출물과 같다.
- UI: 로컬 Safari에서 두 앱의 목록·곡명/가수·0.8.12 표시를 DOM으로 확인했다. 같은 패키지·원음·재생 구현의 기존 Safari 저장/재열기·59/140 BPM·재생·반복·카운트오프·93마디 이후 잔향 종료 증거를 재사용했다. 캡처는 player 설정 화면으로 반환되어 editor 목록의 픽셀 검수 근거로 사용하지 않는다. 새 전곡 청취·공개 청취·iPad 실기기 검증은 하지 않았다.
- 증거: `.tmp/release-0.8.12-{verify,main-build,site-build,production-common}.log`, `.tmp/release-0.8.12-{receipt,parity,smoke}.json`, `.tmp/ioi-app-safari.json`, 로컬 상세 기록 `docs/experiments/ioi-suddenly-app-validation.md`. 발행 후 결과만 추가하는 문서 PR은 제품 소스·버전·산출물을 바꾸지 않는다.

<a id="sites-publication-history--이관-원문--sites-publicationmd--5"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 5

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--이전-발행--0811"></a>

###### 이전 발행 — 0.8.11

- 반복 구간 시작·삭제 조작과 버튼 이동 카운트오프를 통일했다. 두 앱0.8.11, 기존 조작 개선 patch이며 저장 형식은 유지한다. player만 공개했다.
- 구현 `4374088d5c6426008ec35df83e8dde9dfa35818d`, [PR #3](https://github.com/Raphael-KR/drum-practice/pull/3), 병합 main `e0cf3ec9e71190ad5ddf330b695c5892f310a1ca`. PR head/main tree `f975cbada22ee1a255055bff8922587c2764e636` 동일, 의존성·설정·로컬 자산 변경 없이 전체 검사 결과를 재사용하고 main에서 두 앱을 재빌드했다. 소스 빌드 `dc442faf71bc`.
- `npm run verify`: lint·서식394파일·앱/도구/hosting 타입·문서/구조, 전체123파일739테스트와 두 앱 빌드·player 경계 통과. 기존 큰 청크·Node localStorage 경고는 유지한다. 자체 diff 검토이며 독립 리뷰는 아니다.
- 최종 [push CI](https://github.com/Raphael-KR/drum-practice/actions/runs/39776612831), [PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/39776697367), [병합 main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/39777345005) 성공. Node22/Linux fresh npm ci·verify:portable 확인.
- 배포 빌드와 정적36파일의3곳 대조 통과(HTML은 Worker가 제공). Sites 소스 `50f9cec930bd670f7c10d586ebcf96119b9ba4b7`, 저장 버전81.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_a66f624a612881919395b6f2d7496882`.
- 배포 ID: `appgdep_6ad9ffafed748191910532199f1de187` — succeeded, 2026-10-22 21:21:21 KST.
- 아카이브: `local-archives/releases/release-0.8.11.tar.gz`, SHA-256 `a7338e2275b9e3a604718e0428e439bd6fa7f9d068dbf52b56f9488574668952`. Sites 저장 tar content hash `a9df8bb681924d56b6bb817a24cae903a4d3624dbd4e3e10a260351fee9c5ade`은 로컬 gzip 파일 해시와 별개다.
- 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일·악보5개 SHA-256 일치, 폐기 API3경로404. 공개 파일은 검증한0.8.11 산출물과 동일하다.
- UI: 기존 두 앱의 구간 조작 및 Safari 실제 오디오 엔진12상태 결과를 사용했다. 릴리스에서 Chromium의 길게 누르기 후 말풍선 유지·명시적 삭제와 DOM 크기를 추가 확인하고 검증용1~2마디 구간을 삭제했다. Safari 캡처는 흰 화면, Chromium 캡처는 CDP 시간 초과로 픽셀 외형 검수에는 제한이 있다. 실제 iPad 터치·공개 청취는 미검증이다.
- 증거: `.tmp/release-0.8.11-{verify,main-build,site-build}.log`, `.tmp/release-0.8.11-{receipt,parity,smoke}.json`, `.tmp/countoff-safari.json`. 발행 후 기록만 추가하는 문서 PR은 제품 소스·버전·산출물을 바꾸지 않는다.

<a id="sites-publication-history--이관-원문--sites-publicationmd--6"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 6

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--이전-발행--0810"></a>

###### 이전 발행 — 0.8.10

- 공통 도움말의 컴포넌트 테두리 이름·버튼 명칭/설명을 정리했다. 두 앱0.8.10, 기존 도움말 사용성 개선 patch이며 재생·저장 형식은 유지한다. player만 공개했다.
- 구현 `b74cd92c3a99ba0825d2094dde00ff9da7a4657f`, CI 보완 `7fad66e4723aaa23133bb73e111b26bd59c3a40c`, [PR #1](https://github.com/Raphael-KR/drum-practice/pull/1), 병합 main `d0da58c249308d42e790bfec8e77495d85f15601`. PR head와 main의 Git tree 동일성을 확인했다. 소스 빌드 `3da53c88acbe`.
- `npm run verify`: lint·서식394파일·앱/도구/hosting 타입·문서/구조, 전체123파일724테스트와 두 앱 빌드·player 경계 통과. PR CI의 기존 구조 테스트 직렬 CLI 합산5초 초과를 독립 검사별 사례로 분리해 해결했으며 제한·검사 범위는 유지했다. 기존 큰 청크·Node localStorage 경고는 남는다.
- 최종 [push CI](https://github.com/Raphael-KR/drum-practice/actions/runs/39724457240), [PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/39724459987), [병합 main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/39724619926) 성공. Node22/Linux fresh npm ci·verify:portable 확인. 자체 diff 검토이며 독립 리뷰는 아니다.
- 검증한 main에서 두 앱 재빌드 후 배포 빌드 성공. 정적36파일 대조 통과(HTML은 Worker가 제공). Sites 소스 `aa181577f4aa21a8166670f8141e4f2470d73e16`, 저장 버전80.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_07f72c968b2c8191aa282dada80a9783`.
- 배포 ID: `appgdep_6ad996ab4cc88191ab7032632b80708f` — succeeded, 2026-10-22 13:53:15 KST.
- 아카이브: `local-archives/releases/release-0.8.10.tar.gz`, SHA-256 `0149b7dc4b0fd80e85bb6913af281c592c5c2022b2ef51f2af9ca95489517967`. Sites 저장 tar content hash `9155c0222fed8b35239d31c1ae69bc9887ec7530d0f4d85d2b238439c1bf4c57`은 로컬 gzip 파일 해시와 별개다.
- 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일·악보5개 SHA-256 일치, 폐기 API3경로404. 일치한 player 번들에0.8.10·빌드3da53c88acbe를 확인했다.
- UI: 같은 기능 소스로 로컬 Chromium 두 앱의 영역7개·조작10종, 빈 곳 복원·길게 누르기 해제 후 미실행 및768×1024 화면 확인. Safari MCP Transport closed로 fallback을 사용했다. 실제 iPad Safari·공개 청취 검증은 아니다.
- 증거: `.tmp/release-0.8.10-{verify-final,main-build,pr-ci-final,main-ci}.log`, `.tmp/release-0.8.10-{receipt,parity,smoke}.json`, `.tmp/help-component-names/`. 발행 후 이 기록만 추가한 문서 PR은 앱 소스·빌드가 같으므로 재인상·재발행하지 않는다.

<a id="sites-publication-history--이관-원문--sites-publicationmd--7"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 7

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--이전-발행--089"></a>

###### 이전 발행 — 0.8.9

- 개발·검사·빌드 경로 통일, 문서 정리, CI·도구/hosting 타입 검사 확대와 파일 입출력·재생 설정의 책임 분리. 기능·저장 형식을 유지하는 유지보수 patch이며 두 앱0.8.9, 공개는 player만이다.
- 구현 커밋 `7d024173adfe838f28594514cc6475fb96cd0f98` — main push 완료. 소스 빌드 `869aa8c0c892`.
- 직전 전체123파일720테스트, 원본 없는 사본의 portable83파일410테스트 통과. 버전 반영 공통 검사·두 앱 분리 빌드·배포 빌드·정적36파일 해시 일치 통과. 기존 번들 크기·Node localStorage 경고 유지.
- [GitHub CI](https://github.com/Raphael-KR/drum-practice/actions/runs/39539822824): 위 구현 SHA의 Node22/Linux fresh npm ci 및 verify:portable 성공. 로컬 검증에 더해 실제 원격 환경을 확인했다.
- Sites 소스 `8ea58bb3a6d42718e5f4db9a3ece8a4046e25b3b`, 저장 버전79.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_7d50fec553988191a957c4ee0b2a4cc9`.
- 배포 ID: `appgdep_6ad8343d46b08191b2c983b246ce079e` — succeeded, 2026-10-21 12:41:01 KST.
- 로컬 아카이브: `local-archives/releases/release-0.8.9.tar.gz`, SHA-256 `68db03e0942bf8af5f9864eb8dfcd5bd63a8d594358b9efc0b71648e104a5b2d`.
- 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일·악보5개 SHA-256 일치, 폐기 API3경로404. 일치한 player 번들에0.8.9·빌드869aa8c0c892 포함을 확인했다.
- 증거: `.tmp/quality-{tests,portable}.log`, `.tmp/release-0.8.9-{check,build,site-build,ci,ci-full}.log`, `.tmp/release-0.8.9-{parity,smoke}.json`. GUI·iPad 실기기·공개 청취는 이번 릴리스에서 재검증하지 않았다.

<a id="sites-publication-history--이관-원문--sites-publicationmd--8"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 8

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--이전-발행--088"></a>

###### 이전 발행 — 0.8.8

- ESLint 도입과 기존172오류 정리. 규칙 해제·오류 억제 없이 타입·미사용 코드를 정리한 유지보수 patch이며 기능·저장 형식은 유지한다. 두 앱0.8.8, 공개는 player만이다.
- 구현 커밋 `80985bb92180147eebd1fae6dae01c83bfe4adf3` — main push 완료. 소스 빌드 `0883070fa845`.
- 코드 정리 직후123파일720테스트·별도 benchmark 타입 검사·수정58개 소스/설정 Prettier 통과. 버전 반영 후 ESLint0오류·0경고, 타입·i18n·공통/재생/소스 경계·두 앱 빌드·배포 빌드 통과. 기존 청크 크기·Node localStorage 경고 유지.
- Sites 소스 `fc53dc2eeb5c5bbdc91bbb37c5ff54c85ac77c5c`, 저장 버전78.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_bd5e653d8b5081918689d7797c2d5676`.
- 배포 ID: `appgdep_6ad826e5c9988191bcef26762ae22d5a` — succeeded, 2026-10-21 11:44:06 KST.
- 로컬 아카이브 SHA-256: `2ac7a5ebb6ef4e497d985fe6f00344f4772f8c14ccb54ebcdd4b41d67f56282f`.
- 정적36파일 해시 일치. 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일·악보5개 SHA-256 일치, 폐기 API3경로404. 일치한 player 번들에0.8.8·빌드0883070fa845 포함을 확인했다.
- 증거: `.tmp/eslint-cleanup-tests.log`, `.tmp/eslint-benchmark-types.log`, `.tmp/release-0.8.8-{lint,build,site-build}.log`, `.tmp/release-0.8.8-{parity,smoke}.json`. GUI·iPad 실기기·공개 청취는 이번 릴리스에서 재검증하지 않았다.

<a id="sites-publication-history--이관-원문--sites-publicationmd--9"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 9

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--이전-발행--087"></a>

###### 이전 발행 — 0.8.7

- Prettier 형식 정리280파일. 기능·저장 형식 변경 없이 유지보수 patch로 두 앱0.8.7, 공개는 player만이다.
- 구현 커밋 `778dd9100497b8eadf5f249f89301b331020854b` — main push 완료. 소스 빌드 `69f1cf69f1ca`.
- 형식 정리 직후 전체123파일720테스트·379개 Prettier 검사 통과. 버전 반영 후 타입·i18n·공통/재생/소스 경계·분리 빌드·배포 빌드 통과. 기존 청크 크기·Node localStorage 경고 유지.
- Sites 소스 `d4dc3a54b546e49003d9c2278c6812b222bf6b80`, 저장 버전77.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_dcfdd27b38bc8191b1a5e22fec2621fc`.
- 배포 ID: `appgdep_6ad806887b248191abfad6edc710f133` — succeeded, 2026-10-21 09:26:01 KST.
- 로컬 아카이브 SHA-256: `d862ab9c3cbc552ed120257753ec0df6afcf81025dd6ed48ff58fd7b1cc211de`.
- 정적36파일 해시 일치. 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일·악보5개 SHA-256 일치, 폐기 API3경로404.
- 증거: `.tmp/prettier-tests.log`, `.tmp/prettier-commit-check.log`, `.tmp/release-0.8.7-{build,site-build}.log`, `.tmp/release-0.8.7-{parity,smoke}.json`. iPad 실기기·공개 청취는 재검증하지 않았다.

<a id="sites-publication-history--이관-원문--sites-publicationmd--10"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 10

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--이전-발행--086"></a>

###### 이전 발행 — 0.8.6

- 공통 목록 소제목 높이·빌드 글자색·CSS 우선순위 복원, 제작기 백업 접근 수정, 두 앱 상단바 버튼 구성·크기·간격 통일. 기존 기능 보완으로 patch이며 두 앱0.8.6, 공개는 player만이다.
- 구현 커밋 `04198d1fae7f9419863cbf95270039b0308a2bcc` — main 커밋·push 완료. 소스 빌드 `7d67e9d1f686`.
- 전체123파일720테스트·타입·i18n·공통/재생/소스 경계·분리 빌드·배포 빌드 통과. 기존 청크 크기·Node localStorage 경고 유지.
- Sites 소스 `d8f6ae8f8616ebd322714d2eb86a104ed28367c3`, 저장 버전76.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_75dfd557dd948191b77ecad1e55f3ecf`.
- 배포 ID: `appgdep_6ad7be2f12f88191a1582f46d98383c2` — succeeded, 2026-10-21 04:17:19 KST.
- 로컬 아카이브 SHA-256: `9d62d0bbfdb9df5a66a7683cc6d5f7d6ac3df2df3d0fed9de1a3d6064a737b3c`.
- 정적36파일 해시 일치. 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일·악보5개 SHA-256 일치, 폐기 API3경로404.
- 증거: `.tmp/release-0.8.6-{tests,build,site-build}.log`, `.tmp/release-0.8.6-{parity,smoke}.json`. 두 앱 로컬 Safari 폭400/768/1000px 확인은 개별 작업 기록 참조. iPad 실기기·공개 청취는 재검증하지 않았다.

<a id="sites-publication-history--이관-원문--sites-publicationmd--11"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 11

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--이전-발행--085"></a>

###### 이전 발행 — 0.8.5

- 공통 목록·카드·즐겨찾기·버전 표시, 제작기 오렌지 테마·중복 목록 제거·편집 진입 깜빡임 수정, 러브홀릭 PDF103마디 검수와 공통 버튼판 높이 수정. 기존 기능 개선으로 patch이며 두 앱0.8.5, 공개는 player만이다.
- 구현 커밋 `771f6214b3911d778a24eec200d1c8138d032efa` — main 커밋·push 완료. 소스 빌드 `6396bf86bea7`.
- 전체123파일720테스트·타입·i18n·공통/재생/소스 경계·분리 빌드·배포 빌드 통과. 최초 빌드 동시 실행의 UI1건5초 초과는 제한 변경 없이 전체 단독 재실행으로 통과했다. 기존 큰 청크 경고 유지.
- Sites 소스 `197927fd02b90a351b24bbed55e9b8c5a1055c72`, 저장 버전75.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_c2df546ad95081919339ef8eba05bbbe`.
- 배포 ID: `appgdep_6ad7b66410288191a30ede5bf08b69c0` — succeeded, 2026-10-21 03:44:03 KST.
- 아카이브 SHA-256: `41e98928daabb2b4c77daea238d34fe33c1fad0ece63b0ca3f8cf2615c9b292d`.
- 정적36파일 해시 일치. 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일·악보5개 SHA-256 일치, 폐기 API3경로404.
- 증거: `.tmp/release-0.8.5-{tests,tests-rerun,build}.log`, `.tmp/release-0.8.5-{parity,smoke}.json`. 제작기·목록의 로컬 Safari 확인은 개별 작업 기록 참조. iPad 실기기·공개 청취는 재검증하지 않았다.

<a id="sites-publication-history--이관-원문--sites-publicationmd--12"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 12

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--이전-발행--084"></a>

###### 이전 발행 — 0.8.4

- 앱·기능·공통 코드·저장 계층 분리, 큰 파일/CSS 분할, 테스트·문서·제작 도구 정리. 기능과 저장 형식을 유지한 내부 개선이므로 patch다. 두 앱0.8.4이며 player만 공개했다.
- 구현 커밋 `ea64a2198bac2bb8eac8daf380c7e77a90e40d22`. 릴리스 브랜치에서 커밋 후 main으로 fast-forward 병합·push했다. 병합된 임시 브랜치를 삭제해 정본 로컬/원격 모두 main만 남았다.
- 소스 빌드 `7a5169443df3`. 전체121파일708테스트·타입·i18n·공통/재생/소스 경계·두 앱 분리 빌드·배포 빌드 통과. 정적36파일 해시 일치.
- Sites 소스 `01dd1c9347c0dd64f030f3aa596d48f8f89711c8`, 저장 버전74.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_2fcdee73bd7081918cef3f5ffed9e420`.
- 배포 ID: `appgdep_6ad7a7e4182c8191a844a50dc71d8889` — succeeded, 2026-10-21 02:42:13 KST.
- 아카이브 SHA-256: `6c587de90aba63568e6b4795652d2b89d19b0ba6ec336f68d62f881feb35e20d`.
- 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일과 악보5개 SHA-256 일치, 폐기 API3경로404.
- 증거: `.tmp/release-0.8.4-{tests,build,site-build}.log`, `.tmp/release-0.8.4-{parity,smoke}.json`. 기존 청크 크기 경고 유지. 러브홀릭103마디 PDF 검수 오류는 변경 전에도 동일하며 로컬 제작기 기존 문제로 남겼다. iPad 실기기·공개 청취는 이번에 재검증하지 않았다.

<a id="sites-publication-history--이관-원문--sites-publicationmd--13"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 13

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--이전-발행--083"></a>

###### 이전 발행 — 0.8.3

- 모달·팝업의 공통 X와 길게 누르기 설명 유지, 정수 BPM 프리셋 올림 및0.5배 하한 일치. 기존 오류·조작 개선으로 patch이며 두 앱0.8.3, 공개는 player만.
- 정본 구현 `11e2bf8` main 커밋·push 완료. 소스 빌드 `fbcddc134c88`.
- 전체121파일699테스트·타입·i18n·두 앱 분리 빌드·앱 경계·공통 구조·배포 빌드 통과. 정적36파일 해시 일치.
- Sites 소스 `69f658d0865eae3567482d6acbc70f525f385d70`, 저장 버전73.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_40e0ea6ca4148191bdfd6567c3d2065a`.
- 배포 ID: `appgdep_6ad797f433408191a91fc14d8648f1f2` — succeeded, 2026-10-21 01:34:14 KST.
- 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일과 악보5개 SHA-256 일치, 폐기 API3경로404. `.tmp/release-0.8.3-smoke.json`.
- 검사 로그: `.tmp/release-0.8.3-{tests-final,build,site-build}.log`. 기존 청크 크기·Node localStorage 경고 유지. 실제 iPad 터치·공개 청취는 이번에 재검증하지 않았다.
- 브랜치 확인: fetch/prune 및 원격 heads 조회 후 정본 저장소의 로컬/원격 모두 main만 존재했다. 추가 삭제 대상은 없고 별도 악보 제작 변경·범례/exports 파일은 보존했다. Sites 사본도 main만 사용한다.

<a id="sites-publication-history--이관-원문--sites-publicationmd--14"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 14

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--이전-발행--082"></a>

###### 이전 발행 — 0.8.2

- BPM 프리셋과 직접 입력의 처리 경로 통일, 정수 프리셋 변환 하한 수정, 공통 버튼 글자 선택 방지. 기존 오류·조작 개선으로 patch이며 두 앱0.8.2, 공개는 player만.
- 정본 구현 `1217c34` main 커밋·push 완료. 소스 빌드 `ad1018df458e`.
- 전체121파일698테스트·타입·i18n·두 앱 분리 빌드·앱 경계·공통 구조·배포 빌드 통과. 정적36파일 해시 일치.
- Sites 소스 `9de147b8ed9df4498074dd9c4286a8a9b972a122`, 저장 버전72.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_3a5b9ce3a7fc819199a8d6263cce3a63`.
- 배포 ID: `appgdep_6ad79184bba08191af94a2a8f4d70e45` — succeeded, 2026-10-21 01:06:46 KST.
- 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일과 악보5개 SHA-256 일치, 폐기 API3경로404. `.tmp/release-0.8.2-smoke.json`.
- 검사 로그: `.tmp/release-0.8.2-{tests,build,site-build}.log`. 기존 청크 크기·Node localStorage 경고 유지. 실제 iPad 터치·공개 청취는 이번에 재검증하지 않았다.

<a id="sites-publication-history--이관-원문--sites-publicationmd--15"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 15

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--이전-발행--081"></a>

###### 이전 발행 — 0.8.1

- 음원 조정·파형/재생/첫박·메트로놈·박자 선택, 중복 추가 확인, 길게 누르기 말풍선·맥락형 도움말·공통 확인 팝업 개선. 기존 흐름 개선으로 patch, 두 앱0.8.1이며 player만 공개한다.
- 정본 구현 `4e778a4` main 커밋·push 완료. 소스 빌드 `40bf3057fd34`.
- 전체121파일690테스트·타입·i18n·두 앱 분리 빌드·앱 경계·공통 구조·배포 빌드 통과. 정적36파일 해시 일치.
- Sites 소스 `247b896fba2bccd20ecb2722ef14b4bfaaa64d4d`, 저장 버전71.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_5f05cf0fe134819192cd81382df63e4d`.
- 배포 ID: `appgdep_6acff0dd349081919fc2b71b839a0157` — succeeded, 2026-10-15 06:15:27 KST.
- 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일 및 악보5개 SHA-256 일치, 폐기 API3경로404. 증거 `.tmp/release-0.8.1-smoke.json`.
- 이번 세션의 인앱 UI 확인과 공개 HTTP 검사를 구분한다. 실제 iPad/Safari 청취·터치 재검증은 하지 않았다.
- 증거: `.tmp/release-0.8.1-{tests-final,build-final,site-build}.log`. 기존 청크 크기·Node localStorage 경고 유지.

<a id="sites-publication-history--이관-원문--sites-publicationmd--16"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 16

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--이전-발행--080"></a>

###### 이전 발행 — 0.8.0

- 사용자 설정 백업·복원, 내 음원 목록 분리, 원곡/악보 BPM 독립 버튼을 반영한다. 새 독립 기능 추가로 minor이며 제작기는 로컬 전용이다.
- 두 앱0.8.0 / 소스 빌드10daccb6c927. 전체117파일655테스트·타입·i18n·분리 빌드·앱 경계·공통 구조·배포 빌드 통과. 정적36파일 해시 일치.
- 정본 구현 `924869f` — main 커밋·push 완료. Sites 소스 `037e39f225a9e1029ba5182071b3b0f38403546c`, 저장 버전70.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_3c3e949faaa48191ace0b350d1bc83d3`.
- 배포 ID: `appgdep_6acfcc700c1c8191871a24101018f203` — succeeded, 2026-10-15 03:40:03 KST.
- 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일·악보5개 SHA-256 일치, 폐기 API3경로404. 증거: `.tmp/release-0.8.0-backup-smoke.json`.
- 새 백업·복원 흐름의 iPad 실기기 검증은 아직 하지 않았다.
- 증거: `.tmp/release-0.8.0-backup-{tests-final,build,site-build}.log`.

<a id="sites-publication-history--이관-원문--sites-publicationmd--17"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 17

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--이전-발행--0712"></a>

###### 이전 발행 — 0.7.12

- 후속 확인 2026-10-15 02:31:34 KST: 사용자 v0.7.12 표시 확인 후 공개 smoke15항목 통과. HTML3경로 신규 번들·보안 헤더, JS/CSS/Worker4파일 및 악보5개 SHA-256 일치, 폐기 API3경로404. 앞선 공개 반영 미확인은 해소됐다. 배포 성공 응답과 실제 공개 반영 사이의 지연을 관측했으며 정확한 내부 원인은 미확정이다. 붉은 노을 iPad 사용자 확인은 아래 후속 기록을 따른다.

- 정본 구현 `12580ec` — main push 완료. 두 앱0.7.12 / 소스 빌드 `115dee39d643`. player만 공개.
- Sites 소스 `6d02ac48300cfe86d25b40adfae89a1d2c73bf13`, 저장 버전69.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_1cf29c5efa2c8191a62db770ead99c0a`.
- 배포 ID: `appgdep_6acfbac430b0819197f56cc5e6426927` — succeeded, 2026-10-15 02:24:50 KST.
- 같은 저장 버전69 재발행: `appgdep_6acfbba6a3208191a85dc974999b7e68` — succeeded, 02:28:30 KST.
- 공개 확인 실패: 02:28:48 KST 홈페이지는 이전 `player-fKDC2EcG.js`를 참조한다. 기대한 `player-DjONB00x.js`와 `scores/red-sunset.drumscore` 모두404다. 배포 아카이브·저장 버전의 소스와 해시는 일치한다. 원인을 앱 결함이나 단순 캐시 지연으로 확정하지 않으며 Sites 배포/공개 제공 상태 확인이 필요하다. 반복 재배포나 원복은 하지 않는다.
- 전체115파일640테스트, 타입/i18n/분리 빌드/공통 구조/배포 빌드 통과. 정적36파일 일치. 붉은 노을 포함 악보5개.
- 붉은 노을 수록본 SHA-256 `85ba0757df43574f3ca372096590fa27b833ecf646e04d9cb1e56d61ef1676a7`. 자유 엔딩134–137 개별 시각은 잠정값이다. 2026-10-15 사용자가 iPad에서 악보 표시 정상·박자 일치를 확인했다. 범위는 [검증 현황](acceptance.md#acceptance--검증-현황)의 0.7.12 항목을 따른다.
- 증거: `.tmp/release-0.7.12-{tests,build,site-build}.log`, 공개 확인 기록 `.tmp/release-0.7.12-smoke.json`.

<a id="sites-publication-history--이관-원문--sites-publicationmd--18"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 18

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--이전-발행--0711"></a>

###### 이전 발행 — 0.7.11

- 정본 구현 `cc8b677` — main push 완료. 두 앱0.7.11 / 소스 빌드 `9e84b3a09483`. player만 공개.
- Sites 소스 `9f660cb51e54c4ddf65a8acaba1bb12d713f3f0b`, 저장 버전68.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_8869cdbcf33081919f71b3c52a73b43d`.
- 배포 ID: `appgdep_6acf9f7b27908191a3d90a203c5c7a43` — succeeded, 2026-10-15 00:28:22 KST.
- 전체114파일636테스트, 타입/i18n/분리 빌드/공통 구조/배포 빌드 통과. 정적 자산35파일 일치.
- 공개 읽기 smoke14항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/분석·변환 Worker4파일 및 악보4개 SHA-256 일치, 폐기 API3경로404.
- 2026-10-15 사용자 iPad 실기기 확인: 하단 버튼 크기가 개선되었고 정상 동작한다고 보고했다. 이번 하단 버튼판 개선 범위의 확인이며 [검증 현황](acceptance.md#acceptance--검증-현황)에 별도 기록했다.
- 증거: `.tmp/release-0.7.11-{tests,build,site-build}.log`, `.tmp/release-0.7.11-smoke.json`.

<a id="sites-publication-history--이관-원문--sites-publicationmd--19"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 19

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--이전-발행--0710"></a>

###### 이전 발행 — 0.7.10

- 정본 구현 `dd0a37f` — main push 완료. 두 앱 0.7.10 / 소스 빌드 `e57edec37e40`. player만 공개.
- Sites 소스 `c699689d936e452cdca88aebcfcec63c15a688f4`, 저장 버전 67.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_fdca808adc8c81918fc29cc04d554b52`.
- 배포 ID: `appgdep_6acf9b17d9808191a45035b89f628863` — succeeded, 2026-10-15 00:09:35 KST.
- 전체 114파일636테스트, 타입/i18n/분리 빌드/공통 구조/배포 빌드 통과. 정적 자산35파일 일치.
- 공개 읽기 smoke 14항목 통과: HTML 3경로 새 번들·보안 헤더, JS/CSS/분석·변환 Worker와 악보4개 SHA-256 일치, 폐기 분석 API3경로404. 공개 실기기 청취는 미실행.
- 증거: `.tmp/release-0.7.10-{tests-final,build,site-build}.log`, `.tmp/release-0.7.10-smoke.json`.

<a id="sites-publication-history--이관-원문--sites-publicationmd--20"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 20

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--이전-발행--079"></a>

###### 이전 발행 — 0.7.9

- 정본 구현 `935c965` — main push 완료. 두 앱 0.7.9 / 소스 빌드 `8953d8732f2a`. player만 공개.
- Sites 소스 `a1ede96a93248c1319d1d576d2530912ca1d504b`, 저장 버전 66.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_372649b5fdf481919192aa61671e41c5`.
- 배포 ID: `appgdep_6acf91075fc48191b4f0e7a0ba080183` — succeeded, 2026-10-14T14:26:37.227485Z (23:26:37 KST).
- 발행 전 공개 DB: audio_analysis/audio_analysis_pending/audio_analysis_limits. 발행 후 tables=[], 생략 0개로 실제 삭제 확인. D1 바인딩과 마이그레이션 이력만 유지하며 런타임은 사용하지 않는다.
- 공개 읽기 smoke 14항목 통과: HTML 3경로의 새 번들 참조·보안 헤더, JS/CSS/분석·변환 Worker 4개와 악보 4개 HTTP200/SHA256 일치, 폐기 API 3경로404.
- 전체114파일632테스트에 이어 최종 버전 집중5파일18테스트, 타입/i18n/두 앱·배포 빌드/경계 통과. 정적 자산35파일 일치.
- 증거: `.tmp/release-0.7.9-{build,tests,site-build}.log`, `.tmp/release-0.7.9-smoke.json`. 이번 발행 검증은 HTTP/API 기반이며 공개 실기기 청취는 수행하지 않았다.

<a id="sites-publication-history--이관-원문--sites-publicationmd--21"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 21

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--과거-발행-기록-당시-구조이며-현행-설계-아님"></a>

###### 과거 발행 기록 (당시 구조이며 현행 설계 아님)

다음 기록의 분석 API·검토/승인 구조는 기기 내부 처리 결정으로 폐기됐다. 현재 공개 검증 통과 버전은 0.8.3이며 아래는 당시 확인 기록이다.

<a id="sites-publication-history--이관-원문--sites-publicationmd--22"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 22

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--이전-발행--077"></a>

###### 이전 발행 — 0.7.7

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

실제 iPhone/iPad 재검증과 청취는 이번 발행 smoke와 구분한다. 상세 범위는 [검증 현황](acceptance.md#acceptance--검증-현황)을 참고한다.

<a id="sites-publication-history--이관-원문--sites-publicationmd--23"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 23

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--로컬-용량-정리--2026-10-13"></a>

###### 로컬 용량 정리 — 2026-10-13

hosting/deployment/sites의 `node_modules`, Sites의 `dist`, `player-assets`, 이전 `public` 사본, `.sites-runtime`, `.wrangler`를 정리했다. 원본 설정·lockfile·서버 소스와 `.openai/hosting.json`, Sites Git 이력은 유지한다. 정리 직후 배포 checkout은 생성 자산이 없는 준비 전 상태였으며, 2026-10-14의 0.7.7 발행 때 필요한 의존성과 생성 자산을 다시 준비했다. 위 발행 순서대로 `dist/player`를 준비하고 `prepare-sites` → `npm ci` → 빌드를 수행한 후에만 발행한다.

배포 파일을 checkout 외부 경로의 심볼릭 링크로 대체하지 않는다. Git에는 링크 대상의 내용이 함께 저장되지 않으므로 공개 빌드의 입력을 보장할 수 없다. hosting은 설정 원본이며 별도 의존성을 상시 설치할 필요가 없다. 배포 의존성은 실제 빌드를 수행하는 deployment/sites에 필요할 때 설치한다.

<a id="sites-publication-history--이관-원문--sites-publicationmd--24"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 24

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--분석정보-검토-경계-078-2026-10-14-발행"></a>

###### 분석정보 검토 경계 (0.7.8, 2026-10-14 발행)

- `hosting/drizzle/0001_whole_doctor_faustus.sql`이 대기/요청 제한 테이블과 인덱스를 추가한다. 기존 분석 테이블은 삭제하지 않지만 새 공개 API의 승인 원천으로 사용하지 않는다.
- `prepare-sites.mjs`는 `scripts/export-reviewed-analysis.mjs`로 로컬 `audio_analysis_approved`만 정적 JSON/해시 인덱스로 내보낸다. 미승인/기존 캐시를 자동 승격하지 않는다.
- 로컬 `data/runtime/analysis-review-token`은 최초 준비/검토 시 생성하는 비밀 키다. 권한 0600, Git 제외. 배포 소스에는 검증용 SHA-256만 넣고 비밀 키·로컬 API·검토 UI는 넣지 않는다. 키 교체는 검증값 재발행이 필요하다.
- 로컬 승인/반려 후 전용 인증으로 해당 revision의 서버 대기 후보를 삭제한다. 실패하면 로컬 결정은 유지하고 경고한다. 승인 자료 자체는 다음 발행에서 공개된다.
- 배포 전 `approvedCount`를 확인한다. 0이면 공개 분석 캐시도 비어 시작하므로 먼저 검토할 자료가 있는지 확인한다. 현재 공개 서비스에 새 정책이 적용됐다는 뜻은 아니다.
- 정책·한도·잔여 위험은 [보안 보강](../reference/engineering/security.md#site-security-hardening--공개-사이트-보안과-음원-분석-경계)을 따른다.

<a id="sites-publication-history--이관-원문--sites-publicationmd--26"></a>

#### 이관 원문 — SITES-PUBLICATION.md / 26

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="sites-publication-history--최근-확인된-발행--078"></a>

###### 최근 확인된 발행 — 0.7.8

- 정본 구현 `f6c529b`, 공개 HTML 응답 보완 `afc7f7a`: main push 완료.
- 공통 앱 버전 0.7.8, 소스 빌드 `3ef76af78a19`. player만 공개.
- Sites 소스 `756eadcbeb02d37f9e5d94ba19c21b7475a94b1a`, 저장 버전 65.
- 배포 `appgdep_6acf68ef88e08191ab5be50030fea556`: succeeded, 2026-10-14T11:35:32.773583Z / 20:35:32 KST.
- 아카이브 SHA-256 `70715fb4354a9a96dfb39bdeef272da3e7644691603de00b90382bc8fe21a2a6`.
- 최초 Sites64에서 정적 홈페이지 헤더 누락을 발견했다. HTML 진입점은 Worker 응답으로 옮기고 Sites65에 보완 발행했다. 과거 Site를 되돌리지 않았다.
- 공개 smoke: 홈 200, 홈페이지 nosniff/X-Frame-Options/CSP/HSTS 확인, JS/CSS/박 분석/변환 Worker 4파일 SHA-256 일치. 없는/미승인 분석정보 404, 인증 없는 검토 API 404. 로컬 검토 API의 remoteAvailable=true 및 후보 3건 확인. 공개 데이터 쓰기/음원 업로드/실제 후보 승인·반려 없음.
- 전체 117파일647테스트, 최종 응답 경로 보완 집중 3파일12테스트, 타입/i18n/분리 빌드/앱 경계/공통 구조/배포 빌드 통과. root/배포 npm audit 0건. 청크 크기/Node localStorage 경고 유지.
- 승인된 공용 분석정보는 아직 0건이다. 로컬에서 검토·승인 후 다음 발행에 포함한다. 기존 기기 보관 음원은 유지한다. 실기기 청취·공개 부하/공격 시험은 하지 않았다.

<a id="sites-publication-history--rule-재점검-원문--site-security-hardeningmd--4"></a>

#### Rule 재점검 원문 — SITE-SECURITY-HARDENING.md / 4

출처: [docs/operations/SITE-SECURITY-HARDENING.md](../reference/engineering/security.md#site-security-hardening--공개-사이트-보안과-음원-분석-경계). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> 원격 자료 삭제는 실제 환경의 확인이 있어야 보고한다. 과거 활성 DB의 세 테이블 삭제·tables=[] 확인은 [당시 발행 기록](releases.md#sites-publication-history--sites-발행공개-확인-기록)에 보존한다. 공급자 내부 보존본·백업까지 삭제했다고 주장하지 않는다.
