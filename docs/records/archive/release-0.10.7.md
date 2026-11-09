# 0.10.7 섹션 줄 간격 릴리스

- 목표: ‘갑자기’ 37마디 아래의 다음 줄 [A] 조각과 38마디 위의 이전 줄 오선이 연습 화면에 섞이는 문제를 수정해 공개한다.
- 범위: 두 앱의 공통 조판·렌더 캐시 정책·정본 문서·공통 버전, 전체 검사·1줄/2줄 화면·PR/CI·main 병합·기존 Sites player 발행·공개 읽기 확인·병합 브랜치 정리.
- 완료 조건: 섹션과 음표의 원래 의미·제3선 정렬·저장 호환성을 유지하고, 실제 37·38마디 표시와 검증한 코드의 공개 파일 일치를 확인한다.
- 제외: 원본 XML/PDF·수록 패키지·개인 저장 악보 덮어쓰기, 제작기 공개, iOS/iPadOS 실기기·시뮬레이터 검증.
- 검증: 사용자가 이번 릴리스의 기존 fixture·메모리 fake-indexeddb·임시 SQLite DB·섹션 간격 회귀 데이터 사용을 허용했다. 근거는 Git 제외 `.tmp/release-0.10.7/`에 보존한다.

## 원인과 변경

이전 실제 SVG에서 37마디 맨 아래 오선과 다음 시스템의 38마디 [A] 윗변이 모두 Y=1458.5였다. 섹션의 최종 위치는 위로 이동했지만 native 줄 간격 계산에 그 높이가 반영되지 않았다. 연습 화면의 사각 crop에 이웃 줄 잉크가 들어온 원인이다.

공통 `rehearsal-layout`에서 섹션이 있는 StaffLine을 추적하고, 최종 words 배치 후 native 줄/페이지 Y 계산 전에 줄 전체 폭의 skyline을 최소 위 8칸으로 확보한다. 더 높은 기존 기호의 경계는 유지한다. 섹션 위치는 위 7칸, 오선 제3선 정렬·음표 크기·XML 줄 시작 지정은 그대로다. 필요한 세로 공간에 따라 페이지 배치는 달라질 수 있다. 캐시 정책은 v40으로 올려 기존 파생 SVG를 재사용하지 않게 했다. 원본 악보·저장 스키마·의존성은 변경하지 않았다.

기존 기능의 표시 오류 수정이므로 두 앱을 0.10.6에서 0.10.7로 patch 증가했다. 시작 main은 `1fa18a1620eb1992b7bf28c76d6ffb7ac96c3997`, 작업 브랜치는 기존 `codex/fix-section-system-spacing`이다.

## 로컬 검사와 실제 화면

- Node 22.22.2(darwin-arm64)·pnpm 12.18.0에서 `pnpm run verify` 통과: lint·447파일 서식·앱/도구/hosting 타입·i18n·구조/162문서·17로컬 자산·132파일 817테스트·두 앱 빌드/공개 경계. 문서 갱신 후 링크와 diff 검사도 통과했다.
- frozen 설치는 처음 오프라인 캐시 누락으로 실패했으며, 같은 lockfile의 일반 frozen 설치로 해결했다. 보안 기준이나 버전 pin을 바꾸지 않았다. 루트와 Sites audit은 모두 0건이다.
- Safari MCP의 새 연결에는 기존 저장 악보가 없었다. ‘악보 불러오기’는 로컬 저장 변경 우려로 자동 승인 검토가 거절했고, 이후 browsing context도 유실됐다. 새 악보를 저장하는 방식으로 재시도하지 않고 기존 저장본을 사용할 수 있는 ego-browser로 전환했다.
- ego-browser/Chromium 156의 PC 화면에서 연습실 1143×975와 제작기 1131×997을 확인했다. 검수 대상은 기존 개인 저장 `ioi-suddenly-25750839`의 93마디본이다. 현재 수록본으로 덮어쓰지 않았고, 사용자 요청의 37·38마디가 있는 실제 저장본을 사용했다.
- 두 앱 모두 1줄·2줄에서 **37마디 아래 [A] 조각이 없고, 38마디 [A] 위의 이전 줄 오선도 없으며, [A] 전체와 오선 정렬이 유지되는 것**을 직접 확인했다. 캡처는 `player-37-38-one.png`, `player-37-38-two.png`, `editor-37-38-one.png`, `editor-37-38-two.png`다. 제작기는 편집창을 닫은 공통 악보 화면에서 검사했다.
- 실제 표시 SVG `actual-page-37-38.svg`의 SHA256은 `67c4a3626a95dabcb8dc6109f6a87d47aa744fab9e59e9baf02fb6fb26370b38`이다. 표시 좌표는 `player-geometry.json`에 보존했다. 검사 후 두 앱의 보기/마디 선택을 2줄·8마디로 복원하고 검사 창을 닫았다.
- 이번 화면 증거는 PC Chromium 환경이다. Safari 응답형·실기기·시뮬레이터·실제 재생/청취·전곡 검수로 확대하지 않는다. 구형 개인 저장본의 섹션/지시문 내용 차이는 이번 수정과 별개다.
- 기존 큰 청크 경고(player 약 711.61kB, MusicXML 약 1380.09kB; gzip 194.81/360.66kB), Node SQLite 실험 안내, Sites 도구의 punycode 사용 중단 안내는 비차단으로 구분한다.

## PR와 main 검증

- 구현 커밋 `0c8235f8cbb392852f9919c81d14bc693bcee431`을 푸시하고 [PR #40](https://github.com/Raphael-KR/drum-practice/pull/40)의 최종 diff를 자체 검토했다. 독립 리뷰로 표현하지 않는다.
- 같은 head의 [PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42612523787)와 [push CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42612445564)가 통과했다. 저장소 필수 검토/보호 상태를 확인하고 ready 전환 후 해당 head SHA를 지정해 병합했다.
- 제품 main `62c6453ac7ff9a8ece9fac26695a8e7346fe8562`의 [CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42612710955)도 통과했다. 구현과 main의 tree `f04b5eb0fb4e73643113d8f7cde1c3c66ab41adc`가 같아 전체 로컬 검사 결과를 재사용했다.
- main에서 두 앱을 다시 빌드해 소스 `59d159930935`를 재현했다. 최종 빌드 시각은 `2026-11-09T11:55:42.955Z`다.

## 발행과 공개 확인

- 기존 clean Sites 사본을 공식 helper로 열고 검증된 main의 player만 준비했다. frozen 설치·Sites 빌드/finalize·정본/사본/Worker 47파일의 SHA256 대조를 통과했다. 제작기는 로컬 전용이다.
- Sites 소스: `9c427664199e1ba94d843dab6cd0f0f7e7dcb68f`.
- 저장 버전: 99, `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_d8a0dd19cd90819191306ff9f5acbc1b`.
- 배포: `appgdep_6af1b534fbd081918e4612580811265a`, **succeeded**, **2026-11-09 20:57:53 KST** / `2026-11-09T11:57:53.796281+00:00`.
- 기존 Site ID·public 범위·[공개 주소](https://drum-practice-studio.dgkma.chatgpt.site/)와 D1 설정을 유지했다. 실제 사용자 DB 쓰기를 공개 검사에 추가하지 않았다.
- 아카이브: `local-archives/releases/drum-practice-0.10.7-sites.tar.gz`, SHA256 `8b52d886bc3d2b2c68869713d2930f44f63089ae711914d65a68df0e403db8dc`. Sites tar content hash `sha256:8939f6b3a240753619748f808231f48c2240bfa1d7f4fed936e1c95558e9a927`와 구분한다.
- 공개 읽기 **51항목 통과**: HTML 3경로의 최신 JS 진입점·nosniff/DENY/CSP/HSTS, 정적 45파일 SHA256(수록 6곡·글꼴·JS/CSS·Worker 포함), 폐기 API 3경로의 404. 공개 파일 일치를 공개 실제 재생·청취 성공으로 확대하지 않는다.
- Codex 공개 페이지 열기는 `queued`로 반환됐다. 실제 화면이 열렸다는 증거로 사용하지 않는다.

결과 문서는 별도 작업 브랜치/PR로 반영하며 제품 버전과 발행을 반복하지 않는다. 이번에 병합한 브랜치만 정리하고 최종 main의 로컬/원격 일치와 문서 PR 결과는 로컬 receipt에 남긴다. 기존 5173 서버·사용자 자료·중앙 카탈로그와 무관한 작업은 보존한다.
