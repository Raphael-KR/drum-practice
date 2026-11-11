# 0.11.5 릴리스 실행 기록

문서 역할: **사실 기록**. 2026-11-12 사용자의 전체 릴리스 요청에 따른 실행 상태를 기록한다.

- 목표: 정본 교정 6곡과 64분음표 입력·조판 보완을 기존 드럼연습실 Site에 발행한다.
- 범위: 시작 시 저장소의 모든 미커밋 소스·설정·문서·테스트. 기존 기능의 정확도·저장·표시 개선이므로 두 앱을 patch 0.11.5로 맞춘다.
- 완료 조건: 전체 변경 검토, 공통·영향 검사, PR/main CI, 검증된 main 빌드, Sites 발행·공개 자산 일치, 결과 문서 통합과 main 외 브랜치 정리.
- 보존·제외: 원본·정본·인계본·사용자 자료·검증 근거를 보존한다. 제작기는 PC 로컬 전용, player만 공개한다. 사용자 DB·원본 변경, iOS/iPadOS 실기기·시뮬레이터와 청취 평가는 제외한다.
- 검증: [검사 카탈로그](../../reference/engineering/check-catalog.md)를 적용한다. 증거는 `.tmp/release-0.11.5-20261112/`에 둔다. 2026-11-12 사용자가 전체 회귀의 메모리 시험자료·fake-indexeddb·검사 전용 임시 파일 사용을 명시적으로 승인했다. 실제 사용자 DB와 원본은 변경하지 않는다.

## 시작 상태

`main` HEAD `1a49a2b489e68bbc9b8d965db558685d0d679dfe`, 두 앱 0.11.4에서 시작했다. 최초 로컬·추적 원격 브랜치는 main뿐이고 작업 트리는 한 개다. GitHub 조회와 fetch에서도 원격 main만 확인했으며 열린 PR은 없었다. `codex/release-0.11.5`에서 기존 변경을 보존하고 릴리스를 준비한다. 시작 파일 목록·해시는 `git-before.txt`, `source-before.json`, `packages-before.json`에 보존한다.

## 검사 선택

| 항목                                        | 선택·이유                                                                                                                             | 현재 상태                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 공통 정적·전체 Vitest·두 앱 번들            | 코드 릴리스. Node 26.13.0, pnpm 12.18.0, 기존 설치·실제 로컬 자산                                                                     | 최종 `verify` 통과: 129파일·809검사와 두 앱 빌드            |
| 정본·원본·패키지·SVG                        | 제작자의 정확한 입력 해시와 [교정 검증](canonical-corrections-20261112.md)을 재사용. 배포용 캐시 축약 시 실제 패키지 보존을 추가 대조 | 6패키지 축약·전체 자산/인쇄 내용·공통 reader 대조 통과. 인계본 보존 |
| 앱 화면·가사 입력·진행선                    | 변경된 두 앱 경로를 검토하고 같은 입력의 기존 화면 증거를 재사용. 남은 실제 조작만 추가                                               | Safari 입력 목록·길이 step 확인 및 기존 실제 조판/재생 증거 재사용 |
| Python 제작 도구                            | 변경된 도구·기존 실제 자료와 승인된 64분음표 집중 결과. 정적 검사 및 입력 동일성 대조                                                 | 9파일 구문/Black 통과. 보완한 수신기 실제 자료 회귀 1개 통과        |
| 스킬 문법·Rule 참조                         | 제작 스킬 변경의 정적 검증                                                                                                            | 제작 스킬 quick_validate 통과                                       |
| PR/main CI·main 빌드·Sites·공개 읽기        | 이번 전체 릴리스에 포함된 원격 통합·발행 단계                                                                                         | PR/main CI·main 빌드·Sites105·공개 18항목 통과 |
| Apple 모델·중앙 카탈로그 동기화·실기기·청취 | 이번 변경의 검증에 필요하지 않거나 별도 요청이 없음                                                                                   | 비대상                                                              |

## 코드·검사 검토

가사 입력→편집 폼→MusicXML writer, 균등 좌표→진행선→마디 crop, OSMD 초기화·R/L 글꼴, 제작기 판독·offset·전송 경로를 자체 검토했다. 구형 가사의 읽기/이관을 편집 전에 수행하는 실제 진입점을 확인했다. 기존 tick 저장 단위와 연음의 정확한 값, 두 앱의 공통 모듈 사용을 유지한다. crop 변경의 중복 dock CSS는 공통 재생 CSS로 통합된 상태이며 추가 삭제 대상은 찾지 못했다.

64분음표·마디 경계·정밀한 값 보존·crop 검사는 서로 다른 회귀를 확인하므로 유지했다. MusicXML 구조·원본 의미·화면은 각각 검증 역할이 달라 합치지 않았다. 표기 단위를 바꾼 기대값은 현행 64분음표 계약과 대조했다. 기존 회귀를 제거하거나 실패를 skip하지 않았다. 이 검토를 독립 리뷰어의 검토로 표시하지 않는다.

제작 수신기의 새 오류 문구에 기대값과 실제 artifact ID·분할 순서·개수·길이를 추가했다. Base64 악보 본문은 로그에 넣지 않는다. 가사 감사 CLI는 Black 서식만 정리했다. 처음 정적 스킬 검사에 필요한 PyYAML이 없었으므로 프로젝트 임시 폴더에 PyYAML 6.0.2만 설치한 뒤 공식 검사기를 재실행했다. 전역 Python과 제품 의존성은 변경하지 않았다.

## 배포용 패키지

기존 `compact-score-packages.mjs`로 알려진 v1 연주 렌더 캐시만 생략했다. 제작자 인계본은 `data/production/canonical-corrections-20261112/`에 그대로 보존하고, 검증한 축약본만 `public/scores/`에 적용했다. 합계 크기는 271,329,910→74,725,921바이트다.

6개 모두 ZIP 엔트리 목록, 정본 XML, 전체 Song, 원음원·대체 악보가 같고, manifest는 실제 페이지 크기만 바뀌었다. 인쇄 SVG는 해당 캐시 metadata를 제외한 전체 바이트가 같다. 공통 `readScorePackage`로 다시 읽어 같은 정본·음악·가사임을 대조했다. `compact.log`, `compact-verification.json`, `compact-applied.json`에 제작 인계 해시와 릴리스 입력 해시를 연결했다. 이 처리는 기존 인계본의 교정이 아니다.

## 실행 결과

두 앱 버전은 0.11.5다. `pnpm run check`의 lint·서식·타입·의존성·i18n·구조·문서 검사를 통과했고, `bundle:apps`의 두 앱 번들과 공개 player 경계를 확인했다. 기존 큰 번들 경고는 비차단으로 유지한다. Python 구문/서식, 제작 스킬 문법과 기존 실제 자료 기반 수신기 회귀도 통과했다.

사용자 승인 후 처음 전체 회귀는 808/809개가 통과했다. 실패한 `ribbon-engraving` 검사는 이전 32칸의 시작 중심 5px를 기대했다. 현행 Rule의 4/4 64칸·320px에서 첫/마지막 머리 중심 2.5/317.5px와 마디 경계 간격 5px를 확인하도록 밀집 입력과 기대값을 갱신했다. 제품 좌표를 테스트에 맞춰 변경하거나 검사를 제거하지 않았다.

Safari에서 가사 입력 선택지 64개와 길이 step 0.0625를 확인하며 표 머리글의 옛 ‘¼박’을 발견했다. ‘시작 · 64분음표’로 정정했다. 두 후속 변경 후 `verify-final.log`의 **최종 전체 `pnpm run verify`가 통과**했다: 129파일·809검사, 정적 검사 전부, editor/player 번들과 공개 player 경계. 소스 빌드번호는 `5acdc40953fe`이며 정확한 생성값은 체크포인트에 보존한다.

## 화면·저장 검증 범위

- Safari MCP 27.2 / WebKit 605.1.15, macOS 1024×664에서 수록 Loveholic을 열어 실제 가사 입력의 64개 위치와 길이 step을 확인했다. 이 과정의 화면 확인으로 실제 편집 저장 성공을 대신하지 않는다.
- 자동 승인 검토가 실제 브라우저 DB에 시작·길이 시험값을 저장하는 동작을 차단했다. 이 릴리스 시험 승인은 사용자 DB 변경을 제외한다. 해당 저장을 실행하거나 우회하지 않았고, 승인된 메모리/fake-indexeddb의 편집·직렬화·재읽기 및 실제 6패키지 전체 자산/공통 reader 대조를 사용했다. 브라우저에 불러온 Loveholic의 원래 값은 유지한다. 실제 사용자 저장소의 편집 저장 QA는 미수행이다.
- 저장소가 없는 검사 전용 페이지에서 실제 `createLyricEditor`에 수록 Loveholic의 메모리 사본을 연결했다. 위치·길이 0.0625와 확인 변경 이벤트 후 공통 XML writer/reader로 다시 읽어 같은 값임을 확인했다. `safari-memory-result.json`과 `lyric-memory.html` 보존. 편집 이력용 `originalTime`은 이 XML 투영에 포함되지 않아 전체 객체의 바이트 일치로 표시하지 않는다. 시험 탭은 닫았으며 처음 불러온 원래 Loveholic 사본의 값은 바꾸지 않았다.
- 앞선 정본 제작 검수와 `.tmp/grid64-app-20261112/crop/playing-layout-final.json`, `beam-fix/result.json`의 실제 조판/재생 위치 증거는 해당 제품 입력이 같아 재사용한다. 이번 후속 제품 변경은 표 머리글뿐이다. Safari 캡처의 일부 실패와 ego 대체 검수는 원래 기록의 환경·한계를 유지하며 실기기/청취 성공으로 확대하지 않는다.

## 원격 통합·발행

- 전체 79파일을 구현 `09adc220f93c0f81737b0e4f650dfcf7d89c64b9`, [PR #52](https://github.com/Raphael-KR/drum-practice/pull/52)로 통합했다. 최종 diff 자체 검토, 리뷰/미해결 스레드 0건과 main 보호/필수 리뷰 규칙을 확인했다. [PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/43114836037) 성공 후 ready/merge했다. 독립 리뷰로 표시하지 않는다.
- 제품 main `adce481291bed0780aad6fceeeba3f6794ee0b42`의 [main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/43115020279)도 성공했다. 검증한 head와 main의 tracked tree가 같고, 소스·패키지 773개 해시가 같아 정적/회귀 결과를 재사용했다. main에서 `generate`와 두 앱 번들을 새로 만들었다. 빌드 `5acdc40953fe`, 생성 시각 2026-11-12 07:56:30 KST.
- 기존 Sites checkout의 별도 변경 없음 확인 → main player 사본 → frozen 설치 → Worker 빌드 → 원본/사본/Worker 48파일 및 HTML 응답 대조 → 소스 push → 버전 저장 → 발행 순서로 진행했다. 완료한 빌드를 source helper에서 반복하지 않았다. public·player 전용 범위와 DB 바인딩 없음이 유지됐다.
- Sites 소스 `16d11543eaa64233a6cfed586a98bbf6aa6e670b`, 버전105, 버전 ID `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_4726a6f0ce20819182d96d148419f7f2`, 배포 ID `appgdep_6af4f332fef481918536eded09edeee4`. **succeeded, 2026-11-12 07:59:21 KST**. [공개 드럼연습실](https://drum-practice-studio.dgkma.chatgpt.site).
- 공개 읽기18항목 통과: HTML3경로의 새 번들·보안 헤더, JS/CSS·MusicXML renderer·분석/스트레치 Worker·악보6개 해시, editor/폐기 API의404. 증거는 `public-smoke.json`, `sites-parity.json`, `publication.json`이다. 공개 실제 재생·청취·로그인/저장 QA로 확대하지 않는다.
- 최신 아카이브 `local-archives/releases/drum-practice-0.11.5-sites.tar.gz`: 77,081,463bytes, gzip SHA256 `148a8c887e5b2ffb31ecd107619283b611e1f4c9a136340689d37580dcc7971d`. Sites tar content hash `59db538d18084a93a5748223505cedded3326a049677e2ec987aebe6f256c1e0`와 구분한다.


## 발행 후 작업 파일 정리

최신 발행 아카이브와 공개 확인 성공 후 정리 범위를 알리고 다음 대상만 삭제했다. 총 **130,841,343bytes(124.78MiB)**를 확보했다.

- `local-archives/releases/drum-practice-0.11.4-sites.tar.gz`: 기존 기록과 일치하는 56,115,422bytes, SHA256 `c307273e17feccf54646e4b0144c12932aae1b8806870348a4222c83660510a2`. 최신0.11.5 보존 후 구형 배포 압축본을 삭제했다.
- `.tmp/release-0.11.5-20261112/compact/`: `public/scores`와 파일별 해시가 같은 6개 임시 배포 사본 74,725,921bytes. 비교/적용 로그·재현 스크립트와 제작 원본은 보존했다.

`cleanup.json`에 삭제 전 해시·바이트와 최신 보존본 해시를 기록했다. 원본·정본/인계본·공개 수록본·최신 dist·Sites checkout·검증 자료·현재 의존성과5173 서버는 유지한다. 용도/참조가 불명확한 과거 임시 파일과 `.tmp/retained-checkouts`는 삭제하지 않았다. 실제 사용자 DB를 정리하지 않았다.

결과 문서는 별도 PR로 통합한다. 제품 입력이 같으므로 버전·발행을 반복하지 않는다. 병합 후 로컬/GitHub main SHA·tracked clean·main 외 브랜치 부재와 공개 입력 일치를 `final-state.json`에 기록한다.
