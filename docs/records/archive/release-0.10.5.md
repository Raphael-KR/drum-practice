# 0.10.5 MusicXML 경계·정렬·상단 여백 릴리스

- 목표: 실제 시스템 경계, 오선 제3선 정렬, 섹션 높이와 최소8칸/SVG 상단 공간 수정을 검증해 공개 반영한다.
- 범위: 승인된 악보 표시 변경과 관련 회귀검사, 두 앱 공통 버전, 로컬 전체 검증·Safari 우선 화면/조작·PR/CI·main 병합·기존 Sites player 발행·공개 읽기·이번 병합 브랜치 정리.
- 완료 조건: 원본·저장 호환성과 공통 모듈을 유지하고 전체 검사, 1마디 Intro/주법/섹션·오선 표시, 최신 PR/main CI, 산출물 대조·공개 파일 검사를 통과한다.
- 제외 범위: 제작기 공개, 원본 XML/패키지 교정·저장 스키마·기호 매핑·새 사용자 기능·공개 범위 변경, iOS/iPadOS 기기·시뮬레이터·사람 청취.
- 검증: 사용자가 이번 릴리스의 기존 fixture·메모리 fake-indexeddb·검사용 임시 SQLite DB와 상단 여백/음표 효과용 회귀 메모리 데이터를 명시적으로 허가했다. `pnpm run verify`, 원본/의존성 보존, 두 앱 Safari 검수, 정본/사본/Worker/공개 파일 대조를 수행한다.

## 후보와 버전

- 시작 main `9b9c2b664ce2f5f77444f4da5c0b1c8e2b540f40`과 원격 main이 같고 열린 PR·stash·별도 worktree는 없다. 기존 `codex/fix-musicxml-crop-bounds`를 재사용한다.
- 기존 악보 표시의 오류·완성도 보완이므로 두 앱0.10.4→0.10.5 patch를 선택한다. 렌더 파생 캐시는 v39이며 원본 MusicXML·저장 DB·패키지 스키마는 유지한다.
- 실행 증거는 Git 제외 `.tmp/release-0.10.5/`에 보존한다. 이전 개발 검수의 PASS를 이번 릴리스 후보의 검증으로 대신하지 않는다.

## 로컬 검증과 화면

- Node22.22.2(darwin-arm64, 공식 SHA256 대조)·pnpm12.18.0으로 frozen 설치와 `pnpm run verify`를 통과했다. lint·447파일 서식·앱/도구/hosting 타입·i18n·715참조 구조·161문서·17로컬 자산·132파일813테스트·두 앱 빌드/공개 경계를 확인했다. 루트 audit은0건이다. 소스 빌드는 `02dae729e4a1`이다.
- 처음 제한된 executor의 offline 설치는 공통 저장소 hardlink 권한과 캐시 누락으로 실패했다. 같은 lockfile로 승인된 executor에서 기존 공통 저장소를 사용해 frozen 설치를 완료했고 전체 검사를 다시 통과했다. 카탈로그·lockfile·패키지 원본 변경은 없다.
- Safari MCP의 릴리스 전용 탭은 `visibilityState=hidden`으로 유지돼 첫 requestAnimationFrame을 기다리는 악보 열기가 진행되지 않았다. 5173 서버의 실제 응답200과 DB/네트워크 상태를 확인했고, native 창 목록에서도 MCP 창을 찾지 못했다. 사용자 Safari 창·서버를 종료하거나 제품 코드를 바꿔 검수를 우회하지 않고 해당 시험 탭만 닫았다. 이 실패를 기록하고 프로젝트가 허용한 ego-browser로 검수를 이어갔다.
- ego-browser(Chromium, 연습실1143×975·제작기1131×997/DPR2)에서 현재 빌드의 두 앱을 실제로 열었다. 갑자기93마디와12섹션의 1줄·2줄 표시 좌표를 각각 대조했으며 제3선 기준 최대 오차는5e-13 CSS px 미만이고 섹션은 모두 native 위7간격이다. 첫 SVG 원점은−11로 확장됐고 Intro 테두리Y−0.5가 원본/표시 양쪽에 포함된다. 표시 프레임의 위8간격과 실제 ink+5 여유를 확인했다.
- 연습실의 1줄 Intro·5마디 섹션·8/9마디 ○/＋와 두 앱2줄의 5~12마디 화면을 직접 확인했다. 상단 글자는 완전하게 보이고 아래쪽에 이웃 시스템의 음표가 유입되지 않는다. 실제 재생은1→6마디로 진행했고 정지/보기 전환을 확인했다. 음표 효과는 원점 투영 회귀검사와 실제 화면 표시로 확인했으며 사람이 소리를 듣거나 실제 iPhone 재로드 해결을 판정한 것은 아니다.
- 큰 청크 경고는 유지된다(player 약711.25kB, MusicXML 약1379.85kB; gzip194.66/360.56kB). Safari 응답형·iOS/iPadOS 실기기·시뮬레이터 통과로 확대하지 않는다. 화면·좌표 JSON과 검사 로그는 `.tmp/release-0.10.5/`에 보존한다.

## 원격 검증과 발행

- 구현 `301901fbe8fc95d67625c09eafe96243b71810fb`을 작업 브랜치에 커밋·푸시하고 [PR #36](https://github.com/Raphael-KR/drum-practice/pull/36)의 최종 diff와 head를 자체 검토했다. 독립 검토와 구분하며 필수 승인을 우회하지 않았다. [PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42597524560)와 같은 head의 push CI42597483843이 통과했다.
- 제품 main `53b7276ce9d2333e60ba06303896091fb7ad6886`의 [CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42597759013)도 통과했다. 구현/병합 tree `f160c1687be15ff453fad6c2d4c15b02fdcd92b5`가 같아 전체 로컬 결과를 재사용했고 main에서 두 앱을 재빌드해 `02dae729e4a1`을 재현했다. CI의 Ubuntu26 이미지 전환 안내는 비차단이다.
- 기존 clean Sites checkout을 공식 helper로 연 뒤 검증된 main의 player만 준비했다. frozen 설치·Sites 빌드/finalize·audit0건과 정본/사본/Worker47파일 해시 대조를 통과했다. 제작기는 공개하지 않았다. Node22의 Sites 도구에서 `punycode` 사용 중단 경고가 있으며 빌드 실패나 취약점으로 판단하지 않는다.
- Sites 소스 `41abe715152c934723cd01eceb736149ab54fd7b`, 저장 버전97 (`appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_8c14ccf93c048191859e5722aa6067d2`), 배포 `appgdep_6af19abae3488191956e618f8bacb754`: **succeeded**, **2026-11-09 19:04:56 KST** / `2026-11-09T10:04:56.788082+00:00`. 기존 Site ID·public 범위·[공개 주소](https://drum-practice-studio.dgkma.chatgpt.site/)를 유지했다.
- 아카이브 `local-archives/releases/drum-practice-0.10.5-sites.tar.gz`의 SHA256은 `fbf046836fbb96e5346d14c2c6e592cabbb068bd1ecca47d692bffdd274c6fac`이다. Sites가 푼 tar content hash `sha256:9683911cf58b4973ecd7bc62d3fc49f253af228cf9ad030c9271ce409e0ab1ac`와 구분한다.
- 공개 읽기51항목이 통과했다. HTML3경로의 최신 진입점·nosniff/DENY/CSP/HSTS, 정적45파일 SHA256(수록6곡·글꼴·JS/CSS·Worker 포함), 폐기 API3경로404를 확인했다. 로컬에서 확인한 버전/빌드를 포함하는 공개 번들의 바이트가 이번 산출물과 같다. 공개 재생·Safari 장기 안정성·청취 검증으로 확대하지 않는다.
- 결과 문서는 별도 작업 브랜치/PR로 반영하며 제품 버전이나 발행을 반복하지 않는다. 이번에 병합된 브랜치만 정리하고 최종 main 일치는 로컬 receipt에 기록한다. 사용자 기존5173 서버·원본 자료·다른 프로젝트와 개인 중앙 카탈로그는 보존했다.
