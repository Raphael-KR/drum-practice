# 0.10.6 정지 두 줄 스크롤 릴리스

- 목표: 정지 상태의 두 줄 악보에서 불필요한 반복 표시 갱신을 줄이고 선택한 마디를 유지한다.
- 범위: 공통 재생 모듈·회귀검사·표시 정본·두 앱 버전, 로컬 검증·PR/CI·main 병합·기존 Sites player 발행·공개 읽기 검사·병합 브랜치 정리.
- 완료 조건: 정지 스크롤·키보드 선택·재생 재개와 기존 저장 호환성을 유지하고 정확한 후보의 검사와 공개 파일 대조를 통과한다.
- 제외: 원본 악보·저장 형식·의존성 변경, 개인 저장 악보 자동 갱신, 제작기 공개, iOS/iPadOS 실기기·시뮬레이터 검사.
- 검증: 이번 릴리스의 기존 fixture·메모리 fake-indexeddb·임시 SQLite DB·스크롤 회귀 데이터를 사용하도록 명시적 허가받았다. 증거는 Git 제외 `.tmp/release-0.10.6/`에 보존한다.

## 변경과 후보

시작 main은 `fb8b07012753e2249b2debad24d07c05f48fec1b`이며 기존 `codex/fix-paused-row-scroll` 브랜치를 재사용했다. 기존 기능의 성능·조작 오류 수정이므로 두 앱을 0.10.5에서 0.10.6으로 patch 증가했다.

공통 `playback-screen`은 정지 두 줄의 곡·시각·선택·포커스 등이 같으면 자동 frame의 무거운 표시 갱신을 건너뛴다. 상태·목록·설정·배치 변경과 탐색·구간 미리보기, 명시적 frame 및 재생 중 갱신은 유지한다. 세로 휠은 현재 선택 마디를 기준으로 삼으며 멈춘 음원 위치로 선택을 되돌리지 않는다. 진행 음영 CSS 값이 같을 때는 다시 쓰지 않는다.

두 앱의 실제 Song fixture 기반 회귀검사 4개를 추가했다. 의존성·카탈로그·lockfile·MusicXML 렌더러·CSS·서버·hosting 입력을 이번에 변경하지 않았고 SVG 정렬·자르기·악보 원본·저장 계약도 유지한다. 구형 개인 저장 악보의 섹션/지시문·가사와 현행 수록본 차이는 별도 문제이며 자동으로 덮어쓰지 않았다.

## 로컬 검사와 화면

- Node 22.22.2(darwin-arm64)·pnpm 12.18.0의 `pnpm run verify`가 통과했다. lint·447파일 서식·앱/도구/hosting 타입·i18n·구조/문서·17로컬 자산·132파일 817테스트·두 앱 빌드/공개 경계를 확인했다. 루트와 Sites audit은 모두 0건이다.
- Safari MCP가 연결 단계에서 `Transport closed`로 실패해 ego-browser로 이어갔다. Chromium의 실제 PC viewport에서 연습실 1143×975와 제작기 1131×997의 저장 악보를 열었다. 제작기의 편집 모달이 열린 상태에서 첫 입력 대기가 실패했으며, 모달을 닫은 뒤 공통 재생 화면을 검사했다.
- 두 앱 모두 키보드로 12마디를 선택한 뒤 상하 휠을 움직여도 선택 인덱스 11과 정지 음원 시각 16.710097초가 유지됐다. 연습실의 scrollTop은 206.5→869.5→547, 제작기는 205→843.5→576.5로 이동했다. 실제 재생 재개는 각각 22.955295→25.015995초, 22.955295→25.031995초로 진행했고 AudioContext가 running이었다. 확인 후 정지하고 기존 설정·재생 위치를 복원했다.
- 연습실 정지 화면과 음표 표시를 직접 확인했다. 제작기의 마지막 ego 캡처에는 음표가 비어 보이는 장면이 남아 해당 이미지로 정상 판정을 내리지 않았다. 인앱 브라우저에서 같은 로컬 빌드의 제작기를 추가로 열어 두 줄 보기의 재생·정지 후 음표가 표시되는 것을 확인했다. 이 추가 환경에서는 빈 음표를 재현하지 못했으며 원인을 확정하지 않는다. 인앱 검수에서 바꾼 보기 모드는 원래 한 줄로 복원하고 검사 탭을 닫았다.
- ego의 정지 표본은 1.5초 동안 DOM 변경 0건이었지만 rAF도 1회여서 FPS·CPU 개선 수치의 근거로 사용하지 않았다. 이번 결과는 선택/스크롤/재생 동작과 반복 frame 회귀검사의 통과이며 Safari 응답형·실기기 안정성·청취·장시간 재생의 통과를 뜻하지 않는다.
- 기존 큰 청크 경고(player 약 711.61kB, MusicXML 약 1379.85kB; gzip 194.82/360.56kB)를 유지한다. 로컬 Node 22의 SQLite 실험 안내와 Sites 도구의 punycode 사용 중단 안내는 비차단 경고로 구분한다.

## PR·main 검증

- 구현 커밋 `7577244d2100eb7033899e1772dc426223cc9fad`를 커밋·푸시하고 [PR #38](https://github.com/Raphael-KR/drum-practice/pull/38)의 최종 diff를 자체 검토했다. 독립 검토로 표현하지 않으며 저장소 필수 승인을 우회하지 않았다.
- 같은 head의 [PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42606199069)와 [push CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42606165248)가 모두 통과했다. 검토한 SHA를 지정해 ready 전환 후 merge했다.
- 제품 main `236454f639b845ef07bc35678d4b443dd72a20a2`의 [CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42606411120)도 통과했다. 구현과 main의 tree `2a327daabb0f63df495d53d40c8b19ce73373132`가 같아 전체 로컬 검사 결과를 재사용했다. main에서 두 앱을 다시 빌드해 소스 식별자 `6df761ec77bf`를 재현했다.

## Sites 발행과 공개 확인

- 기존 clean Sites checkout을 공식 helper로 열고 검증된 main의 player만 준비했다. frozen 설치·Sites 빌드/finalize·정본/사본/Worker 47파일 SHA256 대조를 통과했다. 제작기는 로컬 전용으로 유지한다.
- Sites 소스: `b548379a1b1bf022c7e8573cdc5da88f2966136d`.
- 저장 버전: 98, `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_579e8935b2688191866b108b6bf17adc`.
- 배포: `appgdep_6af1aa40199c8191ae15fb098d3ae0d3`, **succeeded**, **2026-11-09 20:11:09 KST** / `2026-11-09T11:11:09.768122+00:00`.
- 기존 Site ID·public 범위·[공개 주소](https://drum-practice-studio.dgkma.chatgpt.site/)를 유지했다. `.openai/hosting.json`의 D1 설정도 보존했으며 실제 사용자 DB 쓰기를 검사에 추가하지 않았다.
- 아카이브: `local-archives/releases/drum-practice-0.10.6-sites.tar.gz`, SHA256 `7eff001dea56ce9105a7989a4e151ad5e9cdaf63b669b67913f949ef87ced61b`. Sites가 푼 tar의 content hash `sha256:2892bc8d4ff3a854b35dbc5f20d01cf82576fddb21e796815454022fa3e8e2e8`와 구분한다.
- 공개 읽기 51항목이 통과했다. HTML 3경로의 최신 JS 진입점·nosniff/DENY/CSP/HSTS, 정적 45파일의 SHA256(수록 6곡·글꼴·JS/CSS·Worker 포함), 폐기 API 3경로의 404를 확인했다. 공개 파일이 이번 빌드와 같다는 결과이며 공개 사이트에서 실제 재생·청취한 결과로 확대하지 않는다.

발행 결과 문서는 별도 작업 브랜치/PR로 반영하며 제품 버전·발행을 반복하지 않는다. 이번에 병합된 두 브랜치만 정리하고 최종 main의 로컬/원격 일치는 로컬 receipt에 기록한다. 기존 5173 개발 서버·사용자 자료·중앙 카탈로그와 미병합 작업은 보존한다.
