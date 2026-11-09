# 0.10.8 문서·공통 재생 코드 정리 릴리스

## 범위와 완료 조건

- 목표: 문서의 불일치와 공통 재생 코드 중복 정리를 검증하고 기존 Sites에 발행한다.
- 범위: 문서·앵커 공통 검사/CI, 긴 ADR·완료 계획 원문 분리, 공통 재생 폼·설정 모듈 책임 정리, 두 앱 버전과 릴리스 기록.
- 완료 조건: 기존 기능·저장 호환성을 유지하고 전체 검사·두 앱 빌드·관련 공통 UI 조작·PR/main CI·공개 파일 대조를 통과한다.
- 제외: 악보/사용자 저장 데이터 변경, 새로운 기능·전체 구조 개편, 제작기 공개, iOS/iPadOS 실기기·시뮬레이터 검증.
- 검증: 이번 릴리스 전체 검사의 기존 fixture·메모리 데이터·fake-indexeddb·임시 SQLite DB 사용을 승인받았다. 근거는 `.tmp/release-0.10.8/`에 보존한다.

## 버전과 검토

두 앱을 0.10.7에서 0.10.8로 함께 올린다. 새로운 사용자 기능이나 저장 계약 변경이 없는 코드 정리와 검사 개선이므로 patch를 선택했다. 개발 패키지 버전은 유지한다.

빈 반복 폼 함수와 진행 위치 전달 함수를 제거하고 실제 공통 폼을 직접 호출한다. 설정 선택/스크롤은 설정 레이아웃 모듈, 메트로놈/선택 표시 동기화는 설정 모듈이 소유한다. 이전 정적 대조에서 이동 함수 3개의 본문과 관련 10개 앱 소스의 나머지 실행 문장 보존을 확인했다. 이번 릴리스에서는 실행 회귀와 두 앱 사용 경로를 추가 검증한다.

문서의 현행 규칙과 과거 기록을 구분하고 기존 문단 주소를 유지했다. Markdown 파서는 설치된 Prettier를 재사용하며 공통 검사와 기존 CI 경로에서 로컬 파일·앵커 누락을 확인한다. 검증·Git·발행 결과는 아래에 기록한다.

## 로컬 검사와 화면 확인

- Node22.22.2(darwin-arm64)·pnpm12.18.0에서 `pnpm run verify` 통과: lint·448파일 서식·앱/도구/hosting 타입·i18n·공통 구조·177문서/로컬 링크4,456개/문단 링크3,375개·17로컬 자산·132파일817테스트·두 앱 빌드/공개 경계.
- frozen 설치는 처음 sandbox DNS 제한으로 실패했고, 승인된 네트워크 접근으로 같은 lockfile 설치를 완료했다. 루트 audit 취약점0건. 카탈로그·lockfile·의존성 버전과 수록 패키지6개의 바이트를 유지했다.
- Safari MCP는 `Transport closed`로 탭 조회부터 실패했다. 프로젝트 기준에 따라 ego-browser로 전환하여 macOS Chromium PC1143×975에서 기존 저장된 ‘갑자기’93마디본을 사용했다. 원본이나 수록본으로 교체하지 않았다.
- 드럼연습실과 악보제작기에서 공통 설정 카드 이동, 메트로놈 설정/상단 표시 동기화와 0.10.8·빌드90b12fc3 표시를 확인했다. 연습실에서는4분→8분→끄기→4분 순환과 실제 재생 진행/일시정지, 공통 진행 위치의 키보드 조절을 확인했다. 사람 청취·전곡 안정성·Safari 및 iOS 결과로 확대하지 않는다.
- 기존 큰 청크 경고와 Node SQLite 실험 API 경고는 비차단이다. UI·audit·보존·전체 검사 로그는 `.tmp/release-0.10.8/`에 보존한다.
- Chromium852×393 화면 크기 모사에서 폰 가로의 메트로놈·연습 BPM·화면 카드를 차례로 선택하고 각 카드만 표시됨을 확인했다. 캡처3장(`player-settings.png`, `editor-settings.png`, `player-phone-settings.png`)과 `ui.json`을 보존했다. 검사 후4분 메트로놈·정지·37마디를 복원하고 검사 창을 닫았다. iOS/iPadOS 실기기·시뮬레이터는 수행하지 않았다.

## Git 검토와 main 검증

- 구현 커밋 `ca1c23e350ff4eec225d92ce961a4b63be43e013`, [PR #42](https://github.com/Raphael-KR/drum-practice/pull/42). 해당 커밋의 전체 diff를 자체 검토했다. 독립 검토로 표시하지 않는다.
- [PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42627589756)와 [브랜치 push CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42627534088)가 통과한 뒤 ready 전환과 merge를 수행했다. 저장소 보호 규칙·필수 승인을 우회하지 않았다.
- 제품 main은 `615764c339534033ac21c8ca8e74467d76b8028c`. 구현과 main의 Git tree가 `3d4b89c61b6d92ac9cc430c853ec0da2065cfb7c`로 같아 로컬 검사 결과를 재사용했고, [main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42627788287) 통과 후 두 앱을 다시 빌드했다.
- main 재빌드의 소스 빌드는 `90b12fc30945`, 시각은 `2026-11-09T13:42:34.255Z`(22:42:34 KST)다. 버전·빌드 입력과 수록 패키지 6개가 검증한 상태와 같음을 확인했다.

## Sites 발행과 공개 확인

- 기존 public Site `appgprj_6ab0790baa048191aaee49f58c1ffe7b`에 player만 발행했다. [공개 드럼연습실](https://drum-practice-studio.dgkma.chatgpt.site/). 제작기는 로컬 전용을 유지한다.
- 정본 main에서 배포 사본을 준비하고 frozen 설치·Sites 빌드·루트/Sites audit(각 취약점 0건)을 완료했다. 정본 player·배포 사본·Worker 산출물의 파일 47개를 SHA256으로 대조했다. 원본 악보나 수록 패키지를 다시 가공하지 않았다.
- Sites 소스 `350ba06d2f7ae2e84822d437ca5c6837cb7c6aa9`, 저장 버전 **100**, 버전 ID `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_e60b26a8a70481918fb1057bc4085733`.
- 배포 `appgdep_6af1ce59b2c0819190fab32f27b847d3`: **succeeded**, **2026-11-09 22:45:12 KST** / `2026-11-09T13:45:12.456394+00:00`.
- 아카이브 `local-archives/releases/drum-practice-0.10.8-sites.tar.gz` SHA256은 `3123838b7102d86a4a725938ba3ad519812a74f6ef85464e384dc523d891b758`이다. Sites tar content hash `sha256:b74750a1535abc2f6ced07e351c65ecc34b73d9485ead60f3457cb4bf46f603f`와 구분한다.
- 공개 읽기 smoke **51항목 통과**: HTML 3경로의 현재 진입점·보안 헤더, 정적 파일 45개의 SHA256(수록 6곡 포함), 폐기 API 3경로의 404. 완료 시각 `2026-11-09T13:45:48.673Z`(22:45:48 KST). 공개 저장소 쓰기는 수행하지 않았으며 이 검사를 공개 사이트 실제 청취·전곡 안정성의 증거로 확대하지 않는다.
- `receipt.json`, `parity.json`, `smoke.json`과 전체 검사·UI 근거를 `.tmp/release-0.10.8/`에 보존한다. 기존 큰 번들 경고(player 약 711kB, 렌더러 약 1,380kB, editor 약 834kB)와 Node SQLite 실험 API 경고는 비차단이다.

## 결과 기록과 브랜치 정리 범위

발행 후 변경은 이 기록·발행 목록·history의 세 Markdown 파일뿐이다. 결과 기록도 별도 작업 브랜치와 PR/CI를 통해 main에 반영하며 제품 소스가 같으면 버전 갱신·재발행을 반복하지 않는다. 정리 대상은 이번에 생성하고 병합한 `codex/release-0.10.8`과 `codex/release-0.10.8-results`뿐이며, 다른 작업·stash·로컬 자료는 보존한다. 최종 병합 SHA·CI·정리 결과는 로컬 `receipt.json`과 완료 보고에 남긴다.
