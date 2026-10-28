# 0.10.1 폰 가로 설정과 공통 조작 개선 릴리스

- 목표: 승인된 폰 가로 설정 계획과 누적된 공통 조작 개선을 기존 공개 드럼연습실에 발행한다.
- 범위: 폰 가로 설정의 단일 카드·메트로놈·연습 BPM, 모드 한정 MusicXML·음표 빛나기, 폰 반복 구간 비활성화, 고정 메트로놈 음량, 공통 Liquid Glass·도움말·버전 표시와 관련 문서.
- 완료 조건: 로컬 검사와 Safari 화면·조작 확인, PR 자체 검토·CI·main 병합·CI, main 재빌드·Sites 발행·공개 읽기 확인, 결과 기록과 병합 브랜치 정리.
- 제외 범위: 제작기 공개, 저장 형식 변경, 원본 자료 정리, iOS·iPadOS 실기기·시뮬레이터 검증. 마지막 항목은 사용자 별도 지시가 있을 때만 수행한다.

## 버전과 구현 검토

- 두 앱 0.10.0 → 0.10.1 patch. 기존 폰 가로 연습 흐름의 설정·조작 개선이므로 patch를 선택했고 공용 개발 패키지 버전은 유지했다.
- [구현 계획](../../plans/phone-landscape-settings-20261029.md)을 기준으로 신규 공통 설정 레이아웃 모듈, 양쪽 앱의 연결, 상태 복원, 저장값과 모드 유효값 분리, 관련 문서와 검사 대상 포함 여부를 자체 검토했다. 독립 검토로 표현하지 않는다.
- DB·설정 저장 키·패키지 형식은 유지한다. 폰 가로의 MusicXML·음표 빛나기 ON과 메트로놈 음량 100%는 저장된 선호를 덮어쓰지 않는다. 폰 반복 구간은 조작·표시·재생 적용을 막고 기존 저장 구간은 유지한다.

## 로컬 검증

- macOS arm64, Node 26.12.1·pnpm 12.15.0에서 `pnpm run verify` 통과: ESLint·445파일 서식·앱/도구/hosting 타입·공통 구조/의존성/i18n·150문서 링크·로컬 자산 17개·131파일 797테스트·두 앱 빌드와 player 경계 검사.
- macOS Safari 응답형 디자인 모드의 667×375·852×393에서 화면/BPM 카드와 상단 음량 정렬·초기 포커스를 육안 확인했다. 768×1024 복귀 시 일반 설정 메뉴와 항목 복원을 확인했다.
- 별도 Safari MCP 창의 두 앱에서 실제 Loveholic 저장 자료 재열기, 폰 가로 1줄/2줄 전환, 단일 설정 카드, 69 BPM 프리셋과 원곡 복귀, 카운트오프·재생 진행·일시정지를 확인했다. 두 가로 크기의 BPM 카드에서 `clientHeight=scrollHeight`, 중복 ID 없음, 회전 후 같은 입력 DOM 복원을 확인했다.
- 드럼연습실에서 메트로놈 4분/8분/끄기 전환, 저장된 PDF·빛나기 OFF가 가로에서 MusicXML·ON으로만 유효하고 세로에서 복귀하는 것을 확인했다. 시험 전 설정을 복원했다. 2줄 가로 도움말은 악보 조작 본문 카드와 닫기만 표시한다.
- MCP 창을 네이티브 창 목록에 연결하지 못해 응답형 외형 검수와 MCP 기능 검수를 분리했다. MCP 지정 창 높이와 실제 viewport 높이가 104px 달라 `innerWidth/innerHeight`로 보정했다. 브라우저 크기 검증을 iOS 기기·터치·실제 청취 검증으로 확대하지 않는다.
- OSMD 정적/동적 import·큰 청크·Node localStorage 실험 API 경고는 비차단으로 기록한다. 규칙·기대값·시간 제한을 완화하지 않았다.

## PR·main과 발행

- 구현 `86cfc0304cc56d9b72b85e3dc72039df77150b86`, [PR #28](https://github.com/Raphael-KR/drum-practice/pull/28), 제품 main `c3d77588fb83bb9674a0832c7dc282fc236ee943`.
- [push CI](https://github.com/Raphael-KR/drum-practice/actions/runs/40724642239), [PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/40724724570), [병합 main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/40724984097)가 통과했다. 검토한 PR head와 main의 tree는 `91c7e6271814e93954ce13a3d2ad3e7fcbb860a5`로 같다. 동일한 설치·검사 자산 상태에서 로컬 전체 결과를 재사용하고 main에서 두 앱을 재빌드했다.
- 소스 빌드 `e93a87c7a9da`, main 재빌드 시각 `2026-10-28T16:20:44.418Z`. 기존 clean Sites checkout을 공식 helper로 열고 player만 준비·frozen install·빌드·패키징했다. 정본 player·Sites 사본·Worker 45파일 SHA256이 같다.
- 기존 Site `appgprj_6ab0790baa048191aaee49f58c1ffe7b`의 public audience·주소를 유지했다. Sites 소스 `36a43745d93538caf2baa0368441f562588b0e21`, 저장 버전 93 (`appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_a13f300341608191a43826b299808050`), 배포 `appgdep_6ae2220c149c81918b38f2e121b20f6a`: **succeeded**, **2026-10-29 01:26:05 KST** / `2026-10-28T16:26:05.690183+00:00`.
- 아카이브 `local-archives/releases/release-0.10.1.tar.gz` SHA256 `d27fd4dd38f0872d31e598e190da08394688ff1c14f66dd765c44b6d25100020`. Sites tar content hash `sha256:65a0a3cc84325d3e100b41cc3fadcc120423f3fd386bf066c30f87c2ae2dfdd9`와 구분한다.
- [공개 드럼연습실](https://drum-practice-studio.dgkma.chatgpt.site)의 읽기 검사 49항목 통과: HTML 3경로의 최신 번들·보안 헤더, 정적 43파일 전체 SHA256(수록 6곡·폰트·JS/CSS·Worker), 폐기 API 3경로 404. 공개 파일 일치를 공개 재생·청취 성공으로 확대하지 않는다.
- 로컬 근거는 `.tmp/release-0.10.1/`의 verify·UI·PR/main CI·main/Sites 빌드·parity·smoke·site-result에 보존한다. 결과 문서는 별도 PR로 반영하며 앱 버전·발행을 반복하지 않는다. 병합된 작업 브랜치 정리와 최종 main 일치는 로컬 receipt에 기록한다.
