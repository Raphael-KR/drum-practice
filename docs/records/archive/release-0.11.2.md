# 0.11.2 릴리스 실행 기록

문서 역할: **사실 기록**. 2026-11-11 릴리스 요청의 범위·검증·발행 결과를 기록한다. 과거 통과 결과와 이번 실행을 구분한다.

## 범위와 후보

- 기준 main: `11d82e3084b80806bb2fceae3469e71facbd0a0c` (0.11.1 결과 문서 병합).
- 기존 작업 커밋: `0247a72d206d17f7858a1e01878e57642ab2e139`, 작업 브랜치 `codex/cleanup-0.11.2`. 시작 시 미커밋 17파일, 별도 worktree·stash·원격 작업 브랜치·열린 PR 없음.
- 두 앱 0.11.2는 기존 커밋에서 올린 patch를 사용한다. 버전 중복 인상 없이 공통 SVG 가사의 중복 파싱·빈 문구 훅·불필요한 객체 복사/CSS/export, 관련 주석·문서와 검사 정리를 포함한다.
- 기존 기능·배치·정본·저장 스키마·수록 패키지는 유지한다. 공개 대상은 player이며 editor는 PC 로컬 전용이다.

## 코드와 검사 검토

- 전체 보기에서 선택 파트 파싱이 보존한 manifest를 재사용한다. 구형 v1 가사 읽기/표시용 전환과 v2 소유 성부 판별은 현재 사용 경로와 회귀검사가 있어 유지했다.
- 사용처 없는 HTML overlay 클래스/위치 속성·타입 export와 PDF 열람기의 Song 복사를 정리했다. URL 해제·화면 순서·음절/마디 문구 처리를 보존했다. [상세 근거](../code-maintenance.md#release-code-cleanup-20261111).
- `verify`의 빌드 전 정적 검사 반복, 전체 파일 해시 고정과 구현을 복제한 기대값, 중복 저장 왕복/열람기 assertion을 통합했다. [앞선 정리](../code-maintenance.md#release-check-cleanup-20261111).
- 후속 정리에서는 정상 정적 검사 재실행 5개·구현 문자열 검사 2개를 제거하고 중복 assertion·백업 왕복을 통합했다. 앱 의존 검사는 공통 소스 경계로 맡기고 고정 설계표 ID 검사를 제거했다. 수동 감사는 `--audit`로 분리하고 CI는 PR과 main push에 실행한다. [내역과 유지 근거](../code-maintenance.md#all-check-cleanup-20261111).
- 실제 소유권·경계 위반 9사례·저장/보안/실제 악보 회귀·두 앱 번들 경계·Sites 자산/보안 확인은 유지한다. 코드·의존성·설정·자산 입력이 같은 main에서는 로컬 검사 결과를 재사용하되 번들은 새로 생성한다.

## 이번 검증과 발행

- Node 22.22.2·pnpm 12.18.0과 기존 로컬 자산으로 `pnpm run verify` 통과: 정적 검사, Vitest 131파일/809테스트, editor/player 빌드와 번들 경계. 소요 23.85초는 이번 실행 기록이며 이전 실행과의 성능 비교는 아니다.
- lint 오류·경고 없음, 477파일 서식, 앱/테스트/도구/hosting 타입, 155문서·4,537로컬 링크·3,354앵커 검사 통과. 이후 결과 문서 변경은 문서·diff 검사로 별도 확인한다.
- Safari MCP는 로컬 목록·가져오기까지 동작했지만 `visibilityState=hidden`에서 악보 준비가 대기했고 탭 전환으로도 해소되지 않았다. 사용자 Safari 창과 자료를 보존하고 ego-browser Chromium으로 검수했다. Safari/iOS 출력 성공으로 해석하지 않는다.
- ego-browser의 릴리스 전용 IndexedDB 접두사와 메모리 설정으로 `갑자기`를 열었다. 드럼연습실과 제작기 편집 탭에서 실제 SVG 전체 보기·닫기·다시 열기를 확인했다. 두 화면 모두 1개 연속 SVG, 가사, 제목·기본 BPM·노래·각 줄 마디 번호가 보였으며 내부 SVG 식별자·HTML 쪽 번호는 없었다. 별도 실행 오류는 없었다. 화면은 macOS 데스크톱 창(768×609 CSS px)에서 확인했다.
- 드럼연습실의 PDF 전체 보기 2쪽 이미지 로드와 SVG 닫기 뒤 이전 URL 해제를 확인했다. 검사 전용 DB 3개와 이번 Safari MCP에서 추가한 시험 곡만 정리했다. 원래 DB 전체 초기화·삭제는 하지 않았다.
- 사용자는 이번 릴리스의 메모리 시험 데이터·fake-indexeddb·임시 SQLite DB를 허용했다. 기록은 `.tmp/release-0.11.2/verify.log`, `verify-result.json`, `player-ui.json`, `editor-ui.json`, 두 SVG 캡처와 `browser-cleanup.json`에 보존한다.
- 기존 큰 번들 및 Node SQLite 실험 경고는 비차단으로 유지한다. 개선 기준은 [경고 보류 기준](../../reference/engineering/verification.md#verification-rules--유지하는-번들sqlite-경고)을 따른다.
- 최종 작업 head `0d819018b4a37f1c6bcc2e6610af60dc56dc134a`를 자체 검토했으며 차단 지적은 없었다. 독립 검토로 주장하지 않는다. [PR #48](https://github.com/Raphael-KR/drum-practice/pull/48)의 [최신 head CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42896609741)가 통과한 뒤 병합했다.
- 제품 main `b7825a6097244c6ed9e86ad9fe8cdae0eaa9eaad`의 [main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42896894418)도 통과했다. 검증 입력 746파일·악보 6개의 동일성을 확인해 앞선 정적 검사·테스트를 재사용했다. `pnpm run generate`와 `pnpm run bundle:apps`는 main에서 새로 실행했고 소스 빌드는 `61e52ba44f51`이다.
- 기존 Sites 저장소를 열어 별도 변경이 없음을 확인한 뒤 배포 사본을 준비했다. frozen 설치·Sites 빌드·정본/사본/Worker의 48파일 해시 일치 검사가 통과했다. 처음 helper를 정본 루트에서 실행했을 때 Sites 설정이 없어 중단됐으며, 올바른 기존 `deployment/sites/`에서 다시 열어 진행했다. 이 실패로 소스 변경은 없었다.
- Sites 소스 `c2fb338f4162e6cfaab9b0f02522a4c41c2d8135`, 저장 버전103 (`appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_4f6b2112c19c81918a5b773d6ad1fda2`), 배포 `appgdep_6af38119e0608191911e3213717f873e`: **succeeded**, **2026-11-11 05:40:10 KST**. 기존 public Site에 player만 발행했다.
- [공개 사이트](https://drum-practice-studio.dgkma.chatgpt.site/) 읽기 52항목 통과: HTML 3경로의 현재 진입점·보안 헤더, 자산 46파일의 해시(악보 6개 포함), 폐기 API 3경로의 404. 공개 재생·사람 청취를 검사한 결과는 아니다.
- 최신 아카이브 `local-archives/releases/drum-practice-0.11.2-sites.tar.gz`: 56,114,473바이트, SHA256 `d25a31083ea4b7208652a4e7a7ec57903ab92664b3e3b0a4a1a311938395b0b4`. Sites가 저장한 tar의 해시는 별도 변환 산출물이다. GitHub CI·main 입력 동일성·Sites 발행·공개 해시 근거는 `.tmp/release-0.11.2/`의 `pr-ci.json`, `main-ci.json`, `main-inputs.json`, `main-build.json`, `sites-build.json`, `parity.json`, `sites-publication.json`, `smoke.json`, `archive.json`에 보존한다.

iOS/iPadOS 실기기·시뮬레이터 및 사람의 청취는 이번 범위에서 제외한다. 실제 측정하지 않은 속도·메모리 개선이나 모든 기기의 동작을 주장하지 않는다.

## 발행 후 정리

공개 확인 후 기존 기록의 해시와 일치하고 열린 파일이 없는 구형 배포 아카이브 두 개를 삭제했다. 확보 공간은 **112,239,210바이트(107.04MiB)**다.

| 삭제 경로 | SHA256 | 바이트 |
| --- | --- | ---: |
| `local-archives/releases/drum-practice-0.11.0-sites.tar.gz` | `64bc060a97d9d6b74f1256727790c6ab6729d41b29de3c5702db24a85bc9ff86` | 56,124,392 |
| `local-archives/releases/drum-practice-0.11.1-sites.tar.gz` | `61322247bd1a9fb9aa2e9e9bcca11edf2247c89c8a0f2a60fdd0546f065d258b` | 56,114,818 |

- 최신 0.11.2 아카이브·두 앱 빌드·Sites checkout, 원본/사용자 자료, 기존 검증과 과거 기록, 현재 Node 런타임·의존성·5173 서버는 보존했다. 사용 중인 캐시와 검증 입력이 섞인 `.tmp/`는 일괄 삭제하지 않았다. 추가 제품 코드 수정은 없다.
- `cleanup-candidates.json`과 `cleanup-result.json`에 삭제 근거·공간·보존 대상을 기록했다. 과거 릴리스의 원래 경로·해시 기록은 유지하며 파일이 삭제됐다는 현재 상태를 이 절에서 명시한다.
- 발행 결과 문서만 별도 PR로 main에 반영한다. 제품 입력이 같으므로 앱 버전·사이트 발행을 반복하지 않는다. 결과 PR 병합 뒤 확인할 로컬/GitHub main 동일성·전체 브랜치 정리·미커밋 여부는 `.tmp/release-0.11.2/final-state.json`에 최종 SHA와 함께 기록한다. 이 문서 커밋 자체를 그 후속 확인의 완료 증거로 사용하지 않는다.
