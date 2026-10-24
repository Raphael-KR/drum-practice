# 의존성 업데이트와 최종 Vite8 호환성 검증

문서 역할: **완료된 업데이트·호환성 검증 기록**. 아래 실측은 각 단계의 당시 환경과 입력에 한정한다. 최종 조합은 두 앱0.8.16으로 [발행했다](../releases.md#release-0-8-16-20261024). 발행 시 Node22 CI·main 재빌드·공개 파일 확인은 릴리스 기록에서 구분한다.

아래 첫 단계는 여섯 패키지의 당시 검증 기록이다. 현재 최종 버전과 검증은 [추가 승인: Vite8·Node26 타입](#vite8-node26-update-20261024)을 따른다.

- 목표: 사용자가 지정한 여섯 패키지를 목표 버전으로 갱신하고 최종 조합의 호환성을 검증한다.
- 범위: music-metadata12.2.3, pdfjs-dist6.4.299, @types/node22.20.5, fake-indexeddb6.2.6, Prettier3.9.10, Vitest5.0.5와 필요한 동반 의존성·lockfile·호환성 수정·빌드번호·작업 기록.
- 완료 조건: 실제 설치/잠금 버전 일치, 기존 Vite/Undici 보안 수정 보존, 양쪽 audit/의존성 정합성, lint·서식·타입·전체 테스트·두 앱/Sites 빌드 통과와 player 자산 보존.
- 제외 범위: 앱 기능·저장 계약 변경, 전역 설치, 앱 버전 인상, 커밋·push·PR·발행.
- 검증: `npm run verify`, audit/의존성 검사, 실제 기존 PDF·MP3 읽기의 전후 비교, 별도 로컬 Sites 빌드와 실제 player 파일 목록 대조. 새 합성 자료·시험 DB·운영 상태를 만들지 않는다.

## 승인과 시작 상태

- 사용자 요청은 전달 원본 세션의 최근 사용자 메시지에서 확인했다. 현재 개발 세션에 남은 업데이트 전체 적용·필요 검증 마무리와 커밋·push·발행 금지가 명시되어 있다.
- 기준 main은 `f6088a84d2ff4cb3d3b23887c59f197a3483dc9e`다. 기존 Vite/Vitest/Undici 보안 변경과 관련 미커밋 문서를 보존한다. 변경 전 파일·Git 상태는 `.tmp/dependency-updates-20261024/before/`에 보관했다.
- Vite7.3.7/hosting8.3.5, Undici6.29.1/hosting7.30.1 및 hosting의 Miniflare override는 유지한다. Prettier의 정확 버전 고정 방식도 유지한다.
- npm 메타정보에서 여섯 목표 버전의 존재와 현재 Node26.12.1/Vite7·8 호환 범위를 확인했다. PDF.js6.4.299의 Node 요구는22.13이상/24이상으로 프로젝트 요구와 맞는다.

| 패키지 | 시작 설치 | 목표 |
| --- | --- | --- |
| music-metadata | 12.2.0 | 12.2.3 |
| pdfjs-dist | 6.3.289 | 6.4.299 |
| @types/node | 22.20.3 | 22.20.5 |
| fake-indexeddb | 6.2.5 | 6.2.6 |
| prettier | 3.9.7 | 3.9.10 |
| vitest | 5.0.3 | 5.0.5 |

공식 변경 내용: [music-metadata](https://github.com/Borewit/music-metadata/releases/tag/v12.2.3), [PDF.js](https://github.com/mozilla/pdf.js/releases/tag/v6.4.299), [Prettier](https://github.com/prettier/prettier/releases/tag/3.9.10), [Vitest](https://github.com/vitest-dev/vitest/releases/tag/v5.0.5).

## 실행 결과

- 여섯 패키지 모두 위 목표와 실제 설치/lockfile 버전이 일치한다. Prettier는 정확 버전 `3.9.10` 고정을 유지했다. Vite7.3.7/hosting8.3.5, Undici6.29.1/hosting7.30.1과 hosting의 기존 세 파일은 시작 상태와 같다.
- 개발용·Sites 전체 audit이 모두0건이고 두 의존성 트리의 peer 오류도 없다. Vitest는 동반 mocker/spy5.0.5를 사용한다. 앱/저장/테스트 소스와 검사 규칙·시간 제한·기대값은 변경하지 않았다.
- Node26.12.1/npm12.2.1, 소스 빌드 `3aea0c4afd76`에서 `npm run verify`가 통과했다. lint·Prettier3.9.10 서식433파일·앱/도구/hosting 타입·문서/구조·전체129파일767검사·두 앱 빌드/경계가 통과했다. 서식이나 기능 코드의 추가 보완은 필요하지 않았다.
- 실제 기존 `public/demo/audio.mp3`를 갱신 전12.2.0/후12.2.3의 `parseBlob`으로 읽었다. 선택한 title/artist/BPM과 container/codec/sampleRate/channels/duration 값이 모두 같다. 실제 MP3 하나의 호환성 근거이며 모든 형식 검수로 확대하지 않는다.
- 실제 기존 `public/demo/score.pdf`3페이지를 갱신 전6.3.289/후6.4.299의 Node legacy renderer로1.8배 렌더링했다. 페이지 수와1102×1426 크기가 같다. PNG 해시 차이를 실제 RGBA로 대조해 페이지별0.2102/0.2625/0.2318% 픽셀에서 채널 최대2/255 차이만 확인했고 첫 페이지 전후 표시를 직접 확인했다. 브라우저/Safari/iPad의 실제 PDF 가져오기 검증과 구분한다.
- 별도 `.tmp/dependency-updates-20261024/sites-build/`에서 canonical 준비 스크립트와 Sites 빌드를 실행했다. hosting lockfile/설치 의존성이 직전 검증과 같아 그 `npm ci` 설치를 링크로 재사용했다. Worker HTML과 player39파일이 canonical 출력과 같다. 기존38개에서 추가된 논리 파일은 music-metadata의 동적 `EmbeddedID3v2` 청크 하나이며, 고정 개수가 아닌 실제 manifest의 경로/해시를 비교했다.
- 수록6곡의 SHA256은 직전 보안 수정 단계와 같다. 기존5173서버에서 두 문서·Vite client·두 진입 모듈, 총5개 HTTP 응답을 확인했다. 앱 버전0.8.15와 기존 미커밋 보안 작업을 보존했으며 커밋·push·PR·발행은 수행하지 않았다.
- 기존500kB 청크 및 Node26 localStorage 경고를 기록했다. 공개 확인·GitHub CI·실제 브라우저 음원/PDF 가져오기·청취/iPad 검증으로 확대하지 않는다.

## 검증 근거

모두 `.tmp/dependency-updates-20261024/`에 로컬 보존한다. 소스/운영 데이터와 구분한다.

- `install.log`, `audit-root.json`, `audit-hosting.json`, `dependencies-root.json`, `dependencies-hosting.json`.
- `verify.log`, `sites-build.log`, `final-proof.json` 및 `sites-build/source-parity.json`.
- `media-probe.mjs`, `media-before.log`, `media-after.log`, `before/media.json`, `after/media.json`, `media-comparison.json`, `pdf-pixel-comparison.json`과 전후 실제 렌더 PNG.

<a id="vite8-node26-update-20261024"></a>

## 추가 승인: Vite8·Node26 타입

- 목표: 사용자가 메이저 제한 없이 승인한 최신 안정판 Vite8.3.5와 @types/node26.6.5를 적용한다.
- 범위: 두 의존성·필요한 lockfile과 Vite 설정의 호환성 보완, 앞선 여섯 패키지와 Undici 보안 수정 보존, 빌드번호·기록.
- 완료 조건: 최종 조합에서 audit/의존성 정합성, lint·서식·타입·전체 테스트·두 앱/Sites 빌드와 실제 로컬 앱 확인.
- 제외 범위: 사용자 데이터/저장 계약 변경, 전역 Node 설치·교체, 앱 버전 인상, 커밋·push·PR·발행.
- 검증: 전체 `npm run verify`, 로컬 Sites 빌드·실제 파일/악보 대조, 같은5173서버에서 두 앱의 브라우저 동작 확인. 기존 같은 로컬 앱·자료의 GUI 승인 범위에서 Safari MCP를 우선한다.

- 사용자 최신 메시지에서 개발 세션에 두 메이저 업그레이드를 전달하라는 직접 지시를 확인했다. npm `latest` 조회도8.3.5/26.6.5이며 기존 Node26과 Vitest5.0.5의 지원 범위에 맞는다.
- 변경 전 파일/실제 Vite7의 resolved 설정은 `.tmp/vite8-node26-20261024/before/`에 보존했다. [공식 Vite8 마이그레이션 안내](https://vite.dev/guide/migration)에 따라 Rolldown/Oxc 전환과 기본 브라우저 최소 버전 상승을 검토했다.
- 기존 resolved build/css target인 Chrome107/Edge107/Firefox104/Safari16을 두 앱에 명시해 기존 브라우저 하한을 유지한다. 설정의 `rollupOptions`를 `rolldownOptions`로 옮기고 JSON import 속성을 명시한다. Node 런타임 요구 범위는 설치 위치·타입 선언 버전과 구분한다.

### 최종 실행 결과

- 실제 설치/lockfile은 Vite8.3.5·@types/node26.6.5이며 앞선 music-metadata12.2.3·PDF.js6.4.299·fake-indexeddb6.2.6·Prettier3.9.10·Vitest/mocker/spy5.0.5를 유지한다. 개발용 Undici6.29.1과 Sites7.30.1도 그대로다. 개발용·Sites audit 모두0건, 두 의존성 트리의 peer 오류도 없다.
- 첫 전체 검사에서 Node26 타입의 더 엄격한 BlobPart 판정으로 기존 테스트 두 곳이 실패했다. 실제 ZIP 바이트를 `uint8array` 대신 `arraybuffer`로 받도록 바꿔 NodeBlob 입력을 명확히 했다. 타입 단언·기대값·시간 제한·검사 규칙은 추가하거나 완화하지 않았고 앱/저장/재생 소스도 바꾸지 않았다.
- Node26.12.1/npm12.2.1·소스 빌드 `20585a52b084`에서 최종 `npm run verify`가 통과했다. lint·Prettier433파일·앱/도구/hosting 타입·문서/구조·전체129파일767검사·두 앱 빌드/경계가 통과했다. Vite8의 Rolldown/Oxc로 빌드하되 기존 build/css 브라우저 target을 보존했다. 이는 구형 Safari 실기기 검증을 뜻하지 않는다.
- 별도 `.tmp/vite8-node26-20261024/sites-build/`에서 canonical 준비와 Sites 빌드가 통과했다. hosting 설정/lockfile이 시작 상태와 같아 앞선 fresh `npm ci` 설치를 재사용했다. 실제 manifest45파일의 canonical/staging/client 해시와 Worker HTML을 대조했다. 청크 분할 변화로39→45파일이며 개수 자체를 고정하지 않았다. 수록6곡 SHA256과 앱 버전0.8.15는 같다.
- 5173 서버를 해당 프로젝트의 Vite8.3.5로 재시작하고 두 문서·Vite client·두 진입 모듈의 HTTP200/내용 형식을 확인했다. Safari에서 두 개발 문서와 두 빌드 문서의 목록 초기화, 빌드 화면의 player 블루/editor 오렌지·공통 목록/버튼 표시를 확인했다. 기존 실제 MP3의 메타정보 읽기, 앱의 PDF 처리3페이지 PNG1101×1425와107개 자동 영역 제안, OSMD의 실제 MusicXML 렌더1SVG/4197path를 확인했다. 영역 제안 수를 확정 마디 수로 간주하지 않는다. 새 라이브러리 레코드를 저장하거나 원본/사용자 저장곡을 바꾸지 않았다.
- 최초 Safari 측정 도우미는 최적화 import URL의 작은따옴표를 처리하지 못해 OSMD를 찾지 못했다. 도우미만 보완한 뒤 실제 Vite CJS interop 경로로 재확인했고 제품 코드 변경은 필요하지 않았다. 최종 파일 대조 도우미의 백업 경로 오기도 실제 백업 파일명에 맞춰 수정해 대조를 통과했다. 앞선 PDF Node 렌더의 ceil 크기와 브라우저의 canvas 정수 크기 차이는 서로 다른 경로의 관측으로 구분한다.
- 기존 OSMD 정적/동적 import·500kB 청크·Node26 localStorage 경고를 유지한다. 빌드 문서를 개발 서버로 다시 처리할 때는 soundtouch의 원래 sourceMappingURL 파일 누락 안내가 있었고, Safari 이동 중 개발용 HMR WebSocket suspension 로그도 관측했다. 두 앱 초기화/실제 자료 처리는 성공했으나 이 관측을 HMR 장기 안정성 보장으로 확대하지 않는다. 경고를 숨기는 설정은 추가하지 않았다.
- 공개 사이트/실제 Sites Worker 구동·청취/재생·iPad·Node22 실행·GitHub CI는 이번에 검증하지 않았다. 로컬 전용 editor·기존 자료·미커밋 보안 변경을 보존하고 main HEAD `f6088a84d2ff4cb3d3b23887c59f197a3483dc9e`를 유지한다. 커밋·push·PR·발행은 수행하지 않는다.

### 최종 검증 근거

`.tmp/vite8-node26-20261024/`에 변경 전 파일/설정, `install.log`, `audit-root.json`, `audit-hosting.json`, 양쪽 `dependencies-*.json`, 최초 `verify.log`와 통과한 `verify-final.log`, `sites-build.log`, `final-proof.json`, `safari-final-proof.json`, 두 앱 PNG·개발 서버 로그를 보존했다. 공개/운영 검증과 구분한다.
