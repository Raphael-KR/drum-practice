# 0.10.0 폰 가로 악보 전용 모드와 화면 정리 릴리스

- 목표: 누적된 화면 개선과 의존성·라이선스 정리를 검증하여 기존 공개 드럼연습실에 발행한다.
- 범위: 폰 가로 자동 악보 전용 모드, 공통 유리 효과·설정·정보·상단바·조작판, 섹션 바로가기 가로 순서, JSZip 공유와 PDF.js 고지 묶음, 관련 문서와 두 앱 버전.
- 완료 조건: 전체 로컬 검사·화면 확인, PR 자체 검토·CI와 main 병합·CI, 검증된 main 빌드·Sites 발행·공개 읽기 검사, 결과 기록과 병합 브랜치 정리.
- 제외 범위: 제작기 공개, 사용자 악보·저장 형식·오디오 예약 변경, 관련 없는 작업과 원본 자료 정리.
- 검증: `pnpm run verify`, Safari MCP 기능 확인과 Safari 응답형 모드 화면 확인, PR/main CI, 정본·Sites 사본·공개 파일 해시 비교.

## 후보와 검토

- 시작 main과 origin/main은 `f640c3f`이며 열린 PR은 없다. `codex/release-0.10.0`에서 사용자가 요청한 누적 변경을 보존하여 진행한다.
- 두 앱 0.9.2 → 0.10.0. 폰 가로에서 자동으로 진입하는 악보 전용 사용 흐름이 추가되어 minor를 선택했다. 공용 개발 패키지 버전은 유지한다.
- 공유 pnpm catalog·잠금 파일·OSMD 패치의 일관성과 공통 UI 사용 경로를 검토한다. 검토는 Codex 자체 검토이며 독립 검토로 표현하지 않는다.
- 기존 공개 Site와 배포 사본의 식별자·공개 범위를 유지한다. 배포 사본은 시작 시 clean이다.

## 로컬 검증과 자체 검토

- `pnpm run verify` 최종 실행 통과: lint·443파일 서식·앱/도구/hosting 타입·문서/구조·의존성·i18n 검사,131파일796테스트,editor/player 빌드와 player 경계 검사. Node26.12.1·pnpm12.15.0·macOS에서 실행했다.
- 첫 전체 실행은 세 파일에서 시간초과 및 후속 상태 오류13개가 발생했다. 같은 세 파일의 집중 재실행36테스트와 같은 전체 명령 재실행796테스트가 모두 통과했다. 코드·시간 제한·규칙을 바꾸지 않았으며 최초 실패 원인은 확정하지 않았다. 로컬 근거는 `.tmp/release-0.10.0/verify.log`, `focused-failures.log`, `verify-rerun.log`에 보존한다.
- JSZip3.10.2를 앱과 OSMD가 같은 설치 경로로 참조하고, OSMD 내장3.10.1 모듈만 외부 참조로 교체했음을 확인했다. 설치 파일은96,462바이트 감소했다. 패치·lockfile·공통 검사·CI 참조를 검토했고 저장 형식은 변경하지 않는다.
- PDF.js 고지는 UI에서 한 그룹으로 묶되46개 원문을 보존한다. 초기 설정의 버전/빌드, 악보 정보 제외, 이동 메뉴 생략, JSZip 단일 항목과 SoundTouchJS 내부 소스 링크를 Safari MCP DOM으로 확인했다.
- 새 Safari 창의 응답형 모드에서 폰 세로393×852 상단 두 줄, iPhone SE375×667 초기 설정의 한 화면 수용, 세로 조작판 하단 채움·섹션 가로 순서를 육안 확인했다.667×375 가로 한 줄에서 자동 악보 전용 진입·하단 기존 재생바·주변 반복 숨김과 세로 복귀를 확인했다. iPad mini744×1133 목록 화면도 확인했다.
- Safari MCP에서는 수록 갑자기 패키지 불러오기·악보 열기, 실제 재생 버튼의 카운트오프, AudioContext `running`과0:00→0:24 재생 진행, 일시정지를 확인했다. 섹션 좌표는 첫 줄1·5·13마디, 둘째 줄21·29·38마디, 셋째 줄46·54·62마디로 가로 순서다. 제작기 목록·편집 열기·공통 버전 표시도 확인했다.
- 환경 한계: MCP 제어 창을 네이티브 창 선택으로 연결하지 못해 MCP 기능 확인과 일반 Safari 창의 응답형 화면 검수를 분리했다. 지정 iPad mini 시뮬레이터가 설치돼 있지 않아 iOS 실기기·시뮬레이터·청취를 확인한 것으로 보고하지 않는다. 기존 OSMD 혼합 import·큰 번들·Node 실험 API 경고는 비차단 경고로 남는다.
- 신규 공통 모듈·CSS·pnpm 패치의 위치와 의존 방향, 두 앱 연결, 정본 문서 일치를 자체 검토했다. 별도 독립 검토는 수행하지 않았다. 원본 미디어·사용자 저장 데이터를 수정하거나 삭제하지 않았다.

## PR·main·발행

- 구현 `6d8bb48b0d8456cb93d772ba156d96ba80422616`, [PR #26](https://github.com/Raphael-KR/drum-practice/pull/26)의 자체 검토·최종 head CI·병합 완료. 제품 main은 `2708ecff4955211fba0f7aea3f463a00d0ff5ec9`다.
- PR head와 main의 tree는 `4e57e16fb348449458b5cfb401e4d5f33d6a4c13`로 같아 전체 로컬 결과를 재사용했다. 같은 로컬 검사 자산·설치 상태를 유지했고 main에서 두 앱을 재빌드했다. [main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/40680125294)도 통과했다(portable85파일443테스트).
- 소스 빌드 `c569f76b36d3`, main 재빌드 시각 `2026-10-28T11:28:05.637Z`. 공식 helper로 기존 clean Sites 사본을 연 뒤 준비·frozen install·빌드·패키징했다. 정본 player·사본·Worker45파일의 SHA256이 모두 일치한다.
- 기존 public audience·Site ID·주소를 유지했다. Sites 소스 `7af157a6447b144ffab44331fb5725336ac29a06`, 버전92 (`appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_6d2f562aafd481918ed101373e2bc5be`), 배포 `appgdep_6ae1dcc5c5c08191a93c5511717c05fb`: **succeeded**,2026-10-28 20:30:33 KST / `2026-10-28T11:30:33.247386+00:00`.
- 아카이브 `local-archives/releases/release-0.10.0.tar.gz` SHA256은 `c5826454c9f173070c0f8519e505a5d35550371f852cdd5f42b4669a0ecd2381`이다. Sites tar content hash `sha256:86928a0a79adb68a8d7ef64b3d92781d0358e29c374f8cb48465bb7713ffcc90`와 구분한다.
- 공개 읽기49항목 통과: HTML3경로의 최신 번들·보안 헤더, 정적43파일 전체 SHA256(수록6곡·폰트·JS/CSS·Worker), 폐기 API3경로404. 이 검사를 공개 재생·청취·실기기 검증으로 확대하지 않는다. 근거 `.tmp/release-0.10.0/parity.json`, `smoke.json`, `site-result.json`과 main CI/빌드 로그를 보존한다.
- 결과 문서는 별도 PR로 반영하며 제품 버전·발행을 반복하지 않는다. 이번에 병합한 브랜치 정리와 최종 main의 로컬/원격 일치는 로컬 receipt에 기록한다.
