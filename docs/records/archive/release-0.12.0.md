# 0.12.0 릴리스

상태: 2026-11-21 16:21:49 KST, 드럼연습실 0.12.0 발행·공개 확인 통과. 두 앱 버전 0.12.0, 소스 빌드 `acef6395a0b1`. 제작기는 로컬 전용이다. 결과 문서 통합 후 Git 최종 상태는 `final-state.json`에 남긴다.

- 목표: 누적된 공통 조판·제작 작업대·파일 프로젝트 변경을 검증해 두 앱 0.12.0으로 릴리스한다.
- 범위: 시작 시 전체 미커밋 소스·설정·문서·테스트, 기존 수록 패키지와 원격 main/PR 상태를 대조한다.
- 완료 조건: 필요한 검사와 PR/main CI, player Sites 발행·공개 파일 일치, 결과 문서 및 브랜치 정리까지 확인한다.
- 제외: 제작기 공개, 원본·제작 작업 파일 삭제, 원격 DB 변경, 실계정 QA·iOS 실기기, 승인 없는 실제 제작 메시지 시험.
- 검증: 공통 정적 검사·전체 Vitest·두 앱 빌드, 변경된 제작 도구 검사, 저장/가사/조판의 실제 로컬 화면·파일 왕복을 구분한다.

## 시작 상태와 버전

- 기준 main: `0d74c288ddeb4c274ddef14cdbdd2360a3e28b18` (0.11.5).
- 작업 브랜치: `codex/release-0.12.0`. 기존 worktree 1개, 로컬/원격 기존 브랜치는 main, 열린 PR 없음.
- 전체 변경 목록: `.tmp/release-0.12.0/initial-status.txt`, 추적 파일 diff 통계: `initial-diff-numstat.txt`.
- 새 제작 작업대·직접 가사 교정·곡별 파일 저장/공동작업은 독립된 새 사용 흐름이므로 minor를 선택했다. 이미 승인된 정본 v3/패키지 v2와 활성 저장 초기화 전환도 포함하며 원본·제작 기록 보존 계약은 유지한다.
- 실행 환경: `/opt/homebrew/bin/node` 26.13.0, `/opt/homebrew/bin/pnpm` 12.18.0. 로컬 필수 자산 24개 존재 확인은 통과했으며 내용 검증은 회귀 실행과 구분한다.

## 정리 검토

- 제거된 요청 모달의 호출 없는 브라우저 요청 작성·결과 읽기/미리보기/반영 4파일, 전달 재시도 UI, 전용 IndexedDB 함수 2개와 문구 62개를 제거했다. 실제 사용하는 가사 교정 이력 표시는 `lyric-correction-history.ts`로 분리했다.
- 요청 결과 미리보기만 사용하던 전체 SVG의 `cache: none` 선택 인자를 제거했다. 두 앱의 현재 전체 보기는 기존 공통 파생 캐시 경로를 유지한다. 파일 형식·조판 문서도 제거된 UI와 현재 파일 프로젝트를 구분했다.
- 기존 요청 파일을 읽는 서버·CLI, 보존된 교정 봉투의 읽기, 확정 교정 이력·직렬화 필드는 기존 기록 재사용에 필요하므로 유지했다. 현재 파일 프로젝트의 head/초안 충돌 검사는 공통 store가 담당한다.
- 과거 요청 모달 검증 기록은 당시 기록임을 명시하고 원문을 유지했다. 아키텍처의 낡은 결과 반영 경로·schema 전환 설명을 현행 코드에 맞췄다.
- UI·세션·카탈로그 검사는 이미 현재 작업대 진입점으로 이동했다. 실제 저장·조판·격자 동작을 확인하는 회귀는 유지하며 실패 여부와 무관하게 제거하지 않는다.

## 검사 선택과 진행

| 범위 | 판단·명령 | 현재 상태 |
| --- | --- | --- |
| 공통 정적·전체 회귀·두 앱 빌드 | `pnpm run verify`, `git diff --check` | 정적 검사·131파일 791회귀·두 앱 번들/공개 경계 통과. 중단 후 통과한 단계는 재사용하고 남은 단계만 실행 |
| 제작 도구 | 변경 Python 정적·unittest, 변경 CLI `node --check`, 제작 스킬 문법 | 정적 검사는 11월 17일 결과 재사용. 도구 입력 불변. 11월 21일 unittest 23 PASS·과거 실측 opt-in 1 skip |
| 저장·작업대·가사 | 임시 프로젝트에서 초안/확정/충돌/재열기, SVG 드래그·격자·병합/분리 | 집중 회귀 및 실제 Safari/ego 조작 통과. 실제 사용자 프로젝트 이관·제작자 송신은 제외 |
| 공통 조판·재생 | Safari 전체 SVG·1/2줄, 변박/가사/지시문/쉼표·진행선 | 아래 실제 출력 결과 참조 |
| PR/main·Sites·공개 | 최신 SHA CI, main 빌드, 별도 배포 소스/자산 대응과 공개 읽기 | PR #54/main CI·main 두 앱 빌드·Sites 106 발행·48파일 일치·공개 읽기 21항목 통과 |
| 비대상 | 중앙 의존성 갱신, Apple STT/AFM 실행, 과거 벤치마크 재현, 실계정/iOS 실기기 | 관련 변경·별도 요청 없음 |

### 11월 17일 정적 준비 기록


- `.tmp/release-0.12.0/check.log`: Lint·코드 서식·앱/도구/hosting 타입·JSZip·i18n·공통 모듈/소스 경계·문서 링크/앵커 검사 통과. 당시 문서 188개·링크 5,036개·앵커 3,577개를 확인했다.
- `.tmp/release-0.12.0/typecheck-app-final.log`: 미사용 캐시 인자 제거 후 생성 파일·소스 빌드번호 갱신과 앱 타입 검사 통과. 해당 두 파일의 ESLint·Prettier도 통과했다.
- Python 3.14.10의 `ast.parse`와 기존 `.tmp/slop-cleanup-20261110/python-format/bin/black` 26.10.1로 변경한 Python 4파일을 확인했다. 존재하지 않는 옛 MusicXML venv를 새로 만들지 않았다. 향후 도구 실행에 필요한 lxml·Pillow·NumPy는 기존 bundled Python 3.12.14에서 사용 가능함을 확인했다.
- `node --check`로 변경·신규 제작 CLI를 포함한 18파일을 확인했고, Python 3.14/PyYAML과 설치된 `skill-creator/scripts/quick_validate.py`로 제작 스킬 문법을 확인했다.
- `.tmp/release-0.12.0/bundle-apps.log`: 두 앱 번들·player 공개 경계 통과. 기존 500 kB 번들 경고는 남아 있으며 런타임 실패를 뜻하지 않는다. 후속 소스 정리 뒤 최종 후보 빌드 결과는 별도로 남긴다.
- `.tmp/release-0.12.0/bundle-apps-final.log`: 후속 소스 정리·빌드번호 갱신 후 두 앱 빌드와 player 공개 경계 통과. 소스 빌드번호 `d5fd08efaf2a`이며 기존 번들 크기 경고는 유지한다.
- `.tmp/release-0.12.0/check-docs-final.log`: 최종 문서 188개·링크 5,038개·앵커 3,578개 통과. `git diff --check`도 통과했다.

위 기록은 11월 17일 당시 결과다. 아래 11월 21일 실행과 구분하며 최종 후보 판정은 후속 결과를 따른다.

## 2026-11-21 회귀·실제 화면 검증

사용자가 이번 릴리스의 메모리 자료·fake-indexeddb·임시 파일/프로젝트 사용을 허용했다. Python은 기존 bundled 3.12.14와 설치된 lxml/Pillow/NumPy를 사용했다. 시험 중 정본과 실제 사용자 DB를 변경하지 않았다.

### 회귀에서 확인한 변경

- 최초 전체 회귀는 129파일 중 12파일, 787검사 중 17검사가 실패했다(`test-drum-20261121.log`). 이 실패는 기록에 보존한다. v1 파생 페이지·구형 DB 버전·이전 가사 구조를 전제로 한 항목을 현재 계약으로 옮겼다.
- 폐기된 상시 복구 검사와 개별 이관 검사를 현재 schema 전환 검사 `score-database-reset.test.ts`로 통합했다. 원본·편집 이력·초안·가사 작업 자료 보존, 활성/파생 자료 초기화, 폐기 연습곡 제외, 다시 열 때 현행 자료 유지까지 확인한다. 과거 픽셀 crop 검사는 보존된 Loveholic 제작 패키지를 명시적 입력으로 사용한다.
- 패키지 v2의 파생 페이지 제외, 최종 묶음/작업 자료 분리, 실제 source/canonical 왕복 보존에 맞춰 관련 검사를 수정했다. 음악적 의미·정밀 시간·wedge 구간 검사는 유지한다. 초안 상태를 무시하고 MusicXML 가사만 확인하던 목록의 `hasLyrics`는 `lyricWork.text`도 반영하도록 고쳤다.
- 파일 프로젝트 store의 충돌/자산/이력 경계와 가사 묶기·분리·순서 보존을 집중 검사로 추가했다. 기존 전체 회귀 경로에서 실행하며 별도 상시 검사 층은 만들지 않았다.
- 집중 결과: `regression-repair-20261121.log` 12파일 42검사, `project-lyric-regression.log` 2파일 5검사 통과. Python `python-tests-20261121.log`는 23통과·1건 skip이며 skip은 checkpoint/report/pricing을 요구하는 과거 실측 재현으로 이번 릴리스 대상이 아니다.

### 실제 화면에서 고친 두 결함

1. OSMD 가사 라벨의 `SVGClass`에 공백과 이전 pass의 토큰을 누적하여 native `classList.add`가 `InvalidCharacterError`를 냈다. 공통 가사 ID 인코더의 단일 토큰으로 지정하고 캐시 정책을 v62로 갱신했다. 3회 pass의 native DOMTokenList 검사와 실제 Safari 재열기를 통과했다(`lyric-svg-regression.log`, 2파일 8검사).
2. 새 제작 작업대에서 제거된 설정 버튼을 구형 아이콘 초기화기가 참조해 `replaceChildren` 예외로 앱 초기화가 멈췄다. 사용처 없는 초기화 모듈과 문구 6개를 제거하고 현재 버튼은 공통 icon/iconButtonHTML/setIconButton 경로를 사용한다. 현행 제작기 마크업과 아이콘 교체 검사 2파일 13검사 및 Safari 진입·재열기가 통과했다(`editor-start-regression.log`).

### 실제 조작과 출력

- Safari 27.2 / WebKit 605.1.15, 로컬 5173, 1440px 데스크톱 화면. `.tmp/release-0.12.0/browser/`의 시험 진입점은 실제 앱 모듈을 그대로 실행하되 DB/localStorage 이름에 `release-qa-20261121:` 접두어를 붙인다. API는 시험 프로젝트 ID만 허용하며 제작자 송신과 실제 프로젝트 접근을 차단한다. 실제 사용자 DB를 건드릴 수 있던 최초 열기 시도는 자동 승인 검토에서 거절되어 실행하지 않았고, 이 격리 경로로 검증했다.
- Real Paradis: 1줄·2줄·전체 SVG, 파란 가사 묶음, 마디 번호·제목/부제·BPM/노래 표기 확인. 81–84마디 초과 줄만 전체 보기에서 0.9024097427602508배, 정상 줄은 1배다. 2줄에서도 해당 줄의 5/4 마디가 넓고 네 마디가 함께 들어간다. 실제 재생 버튼으로 AudioContext running·시각 208→222초·81→87마디 진행 및 진행선 이동을 확인했다. 사람의 청취 결과로 보고하지 않는다.
- 갑자기: 38마디 영역 오류 없이 2줄 진입·전체 SVG 생성. 온쉼표 중앙·가사 문구, 섹션 A와 Closed H.H 지시문의 분리 확인. 실제 캡처 `suddenly-38-two-row.png`, `suddenly-full.png`.
- 붉은 노을: 전체 SVG의 134–135 / 136–137마디가 각 두 마디 한 줄로 전체 폭을 사용하고 섹션·지시문이 분리됨을 확인했다(`red-sunset-ending.png`). 마지막 실제 화면에서 새 콘솔 오류는 0건이다. warm 재열기는 `score-render:cache-hit` 56ms였으며 cold 성능과 구분한다.
- 제작기: 실제 초기화 후 시험용 Real Paradis 사본에서 가사 Ah를 방향키로 0→0.0625 quarter 이동, 임시저장·확정저장·페이지 재열기를 확인했다. Safari MCP가 지원하지 않는 포인터 드래그만 ego-browser 전용 TaskSpace에서 확인했다. 40px 드래그 결과 0.0625→0.625 quarter, 되돌리기 0.0625, 다시 실행 0.625를 카드 표시에서 대조했다. M으로 Ah/나를 `Ah 나`로 묶고 S로 두 항목과 위치를 복원했다. 확정 저장 `21df89bb-3ab8-4bdc-b168-b1231134f952`, 초안 없음·교정 이력 2건을 재조회했다.
- `browser/editor-open.png`, `editor-full.png`, `editor-drag.png`, `player-one-row.png`, `player-two-row.png`, `player-meter-row.png`, `real-paradis-full.png`을 보존한다. 드래그 캡처는 재조판 완료 전일 수 있으므로 이동 수치 판정은 카드/저장 재조회 결과를 사용한다.
- 검사 도구의 잘못된 기대 문자열(`변경됨`, 공백 없는 `Ah나`), stale ref, 재조판 중 없는 노드를 읽은 진단 실패는 제품 실패와 구분했다. 정확한 UI 상태·저장 결과로 후속 확인했다.
- 좁은 화면: Safari MCP의 시험 창이 네이티브 Safari 윈도우 목록/Computer Use에 나타나지 않아 응답형 프리셋 대신 MCP의 viewport 명령을 사용했다. 요청 1024×768의 실제 viewport는 1024×664, 요청 390×844는 390×740, DPR 2였다. 1024px 변박 줄의 네 마디와 진행선, 390px 1/2줄·재생/일시정지·컨트롤 재배치를 확인했다. 페이지 가로 넘침·새 콘솔 오류 0건. `player-1024-meter-row.png`, `player-390-two-row.png`, `player-390-one-row.png` 보존. 기기 프리셋·iPad Safari·터치 제스처 검증으로 보고하지 않는다.
- 실제 제작자 요청/답장, 실제 사용자 자료 이관, iOS/iPadOS 실기기, 청취, 정밀 성능 비교는 이번 검증에 포함하지 않는다. 제작기 최초 cold 값 약 51.6초는 비활성 Safari 탭에서 오디오 초기화가 중단된 실행의 값이므로 성능 기준 통과/실패 근거로 쓰지 않는다. 탭 활성화 후 열기와 warm 재열기는 완료했다.

### 최종 로컬 검사

- `verify-final-20261121.log`는 새 검사 mock의 미사용 인자를 Lint가 검출했다. 타입 선언과 무인자 구현을 분리해 수정했다.
- `verify-final-20261121-2.log`에서 Lint·서식·앱/도구/hosting 타입·JSZip·i18n·공통 모듈/소스 경계가 통과했다. 문서 검사는 과거 검사 기록의 삭제된 파일 링크 1개에서 멈췄다. 기록 원문은 파일명으로 보존하고 현행 schema 전환 검사로의 이동 근거를 덧붙였다.
- 통과한 단계는 반복하지 않고 `check-docs-20261121.log`, `test-drum-final-20261121.log`, `bundle-final-20261121.log`로 남은 단계를 마쳤다. 문서 188개·링크 5,041개·앵커 3,578개, 전체 Vitest **131파일·791검사**, 두 앱 번들·player 공개 경계와 `git diff --check`가 통과했다. `verify` 한 번의 종료 성공으로 보고하지 않는다.
- 기존 500 kB 번들 경고는 유지한다. 이후 기록 문서만 수정하면 문서/링크/diff 검사만 다시 실행한다. main 병합 후 코드·설정·의존성·검사 자산이 같으면 이 결과를 재사용하고 릴리스용 두 앱 빌드는 새로 수행한다.

## 원격 통합과 공개 발행

- 전체 225파일을 구현 `3161b625091a8873109f2398399541bc0c12cb88`로 커밋·push하고 [PR #54](https://github.com/Raphael-KR/drum-practice/pull/54)로 통합했다. 최종 저장·공통 조판·제작기/공개 경계와 변경 목록을 Codex가 자체 검토했다. 독립 리뷰가 아니며 저장소의 main 보호/필수 리뷰 및 ruleset은 없음을 확인했다.
- 정확한 head의 [PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/44879164044) 성공 후 ready/merge했다. 제품 main `1474ac6383cff17dd783dd476c3b89274459fa40`의 [main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/44879554004)도 통과했다. head/main tracked tree와 소스·설정·검사·공개 자산 등 647개 입력 해시가 같아 로컬 정적·회귀 결과를 재사용했다(`candidate-inputs.json`). main에서 `generate`·`bundle:apps`는 새로 실행해 빌드 `acef6395a0b1`을 확인했다.
- 기존 Sites 소스 checkout을 공식 helper로 먼저 열고 별도 수정 없음 확인 후 player 사본을 준비했다. frozen 설치·Sites 빌드·원본/사본/Worker 48파일과 HTML 응답 일치 검사를 통과했다. source helper는 완료한 빌드를 반복하지 않고 소스 commit/push·아카이브 패키징을 수행했다.
- Sites 소스 `880d58dcc21015bce1f8421d8b1e776f20618f1a`, 버전 **106**, 버전 ID `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_fa5d84b53c248191829eb6d7a238f62b`, 배포 ID `appgdep_6b01467ce0d8819194d6a44fc2b2fce2`: **succeeded, 2026-11-21 16:21:49 KST** / 07:21:49 UTC. 기존 public 범위와 player 전용·DB 바인딩 없음 유지. [공개 드럼연습실](https://drum-practice-studio.dgkma.chatgpt.site).
- 공개 읽기 **21항목** 통과: HTML 3경로의 새 번들과 보안 헤더, 주요 JS/CSS·MusicXML·분석/스트레치 Worker·악보 6개 해시, editor/제작 API/폐기 API의 404. `public-smoke.json`, `sites-parity.json`, `publication-receipt.json`에 근거를 보존한다. 공개 사용자 저장·재생·청취 검증으로 확대하지 않는다.
- 최신 아카이브 `local-archives/releases/drum-practice-0.12.0-sites.tar.gz`: 40,058,795bytes, gzip SHA256 `ee435b2237783128abb05923d6eaa605d23b425b0b99876ccd20ee8384026a78`. Sites tar content hash `e0472eddc9157e019466f62845e1be3d5b2fd1d54e17754898192bb68ec8b350`와 구분한다.
- 비차단 경고: 기존 번들 500 kB 안내와 개발 서버의 향후 Vite native config-loader 확장자 안내가 남아 있다. 현재 빌드/실행은 통과했으며 의존성·로더 변경 시 관련 설정을 다시 확인한다.

## 발행 후 작업 파일 정리

공개 확인 후 경로·보존 범위를 알리고 **94,196,946bytes(89.83MiB)**를 정리했다(`cleanup.json`).

- 구형 `local-archives/releases/drum-practice-0.11.5-sites.tar.gz` 77,081,463bytes: 기록의 SHA256 `148a8c887e5b2ffb31ecd107619283b611e1f4c9a136340689d37580dcc7971d` 일치를 확인하고 최신 0.12.0 보존 후 삭제했다. 과거 발행 기록 원문·해시는 유지한다.
- 이번 검사에서 시작한 5173 Vite 서버만 정상 종료하고 `node_modules/.vite` 캐시 17,115,483bytes를 삭제했다. 설치 의존성과 두 앱의 최신 dist·Sites checkout은 유지한다.
- 시험용 파일 프로젝트 33파일은 해시를 대조해 `.tmp/release-0.12.0/qa-project/`로 이동·보존했다. 일반 제작 프로젝트 목록에서 제거했으며 시험 전후 실제 사용자 프로젝트 파일은 0개로 동일하다. 실제 사용자 DB·원본·제작 입력·검증 기록을 삭제하지 않았다.
- 과거 임시 폴더의 원본/검증 입력과 대용량 자료는 용도 또는 중복성이 확정되지 않아 보존했다. 날짜·Git 제외만으로 삭제하지 않았다. `.tmp/release-0.12.0/`의 로그·캡처·격리 harness·시험 프로젝트와 최신 발행 아카이브를 유지한다.

결과 문서는 별도 작업 브랜치/PR로 통합한다. 제품 소스와 배포 입력이 같으면 앱 버전·전체 회귀·발행을 반복하지 않는다. 병합 후 로컬/GitHub main 일치, Git clean, main 외 브랜치 부재, 제품 입력/최신 아카이브 보존을 `final-state.json`으로 확인한다.
