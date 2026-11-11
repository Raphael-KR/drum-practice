# 0.11.4 릴리스 실행 기록

문서 역할: **사실 기록**. 2026-11-11 요청으로 시작한 릴리스의 범위·검사 선택·결과를 기록한다.

- 목표: SVG 가사·오류 복사·정지 2줄 스크롤과 검사 정리를 검증해 기존 드럼연습실 Site에 발행한다.
- 범위: 공개 0.11.2 이후 `fa776b6`, `9be4195`와 이번 검증에서 필요한 보완. 이미 커밋한 두 앱 0.11.4를 유지한다. 기존 표시·조작 개선이므로 patch이며 중복 인상하지 않는다.
- 완료 조건: 로컬 공통/영향 검사, PR/main CI, main 빌드, Sites 발행·공개 자산 일치, 결과 문서 통합과 main 외 브랜치 정리.
- 보존·제외: 원본·수록 패키지·사용자 저장 데이터·과거 기록을 보존한다. 제작기는 PC 로컬 전용, player만 공개한다. iOS/iPadOS 실기기·시뮬레이터, 실계정 QA, 청취 평가와 유보된 iPhone 재로드 조사는 제외한다.
- 검증: [검사 카탈로그](../../reference/engineering/check-catalog.md)에 따라 아래 범위를 선택한다. 증거는 `.tmp/release-0.11.4-20261111/`에 보존한다. 사용자가 이번 릴리스의 메모리 시험 데이터·fake-indexeddb·검사 전용 임시 파일을 허용했다. 폐기 SQL/SQLite 검사는 실행하지 않는다.

## 시작 상태와 검토

- HEAD `9be4195fa3bc475d5376c84e59b806f777f87baa`, 원격 main `f4b0b05aecba5cf299692d75eb9447103b4e0d02`. 작업 트리·index는 깨끗하고 stash·열린 PR·추가 worktree는 없다. 로컬 `main`과 `codex/release-0.11.3`의 두 미발행 커밋을 함께 통합한다.
- HTML 가사·전체 가사 메뉴·관련 CSS/검사를 제거한 경로와 두 앱의 공통 SVG 조판·13pt 파란색·크롭/간격·새 캐시 정책을 검토했다. 구형 v1의 읽기용 사본 전환, v2 독립 가사 성부, 마디 문구와 제작기의 가사 편집·저장 경로는 호환성을 위해 유지한다. 원본이나 Song의 가사 필드를 삭제하지 않는다.
- 오류 복사 공통 모듈과 Clipboard API 실패 시 선택 복사, 팝업 수명·닫기 분리 및 정지 2줄 wheel의 상태 전환·dispose 경로를 검토했다. 행 스냅은 유지한다.
- 폐기 SQL·옛 UI 부재 검사·중복 준비/대기·중복 가사 사례 정리는 [검사 감사](../check-audit-20261111.md)와 현재 호출부를 대조했다. 현재 저장/백업/패키지·Worker 응답/보안·배포 자산 일치 검사는 유지한다. 추가로 제거할 제품 코드나 검사는 확인되지 않았다.

## 검사 선택과 진행

| 항목 | 선택·이유와 환경/부수 효과 | 결과 |
| --- | --- | --- |
| 공통 정적·전체 Vitest·두 앱 번들 | 실행. `pnpm run verify`, Node 26.13.0·pnpm 12.18.0 기존 설치, 실제 로컬 자산. 생성 파일·dist·시험 메모리/임시 파일 사용 | 아래 결과 참조 |
| Safari UI·SVG·재생 | 실행. 5173 실제 곡의 전체/1줄/2줄/균등 가사, PDF 중복 부재, 오류 복사와 자동 닫힘, 두 앱 진입점 확인. 파생 캐시·캡처, 시작 설정 보존 | 아래 결과 참조 |
| 스크롤·렌더 실측 | 실행. 실제 렌더 완료/캐시와 정지 2줄 스크롤·행 정렬, 재생/1줄 전환 확인. 이전 임시 비교는 원인 근거로만 사용 | 아래 결과 참조 |
| 저장 호환 회귀 | 전체 Vitest에 포함. v1/v2·독립 리듬·마디 문구·패키지 왕복. 별도 실계정 저장 QA는 비대상 | 아래 결과 참조 |
| 스킬 문법·절차 | 실행. 변경된 릴리스 스킬의 quick_validate와 Rule/카탈로그 대조. 정적 읽기 | 아래 결과 참조 |
| Python/Swift·Apple·중앙 카탈로그 | 비대상. 관련 코드·의존성 변경 없음. 무관한 도구 실행·카탈로그 동기화 없음 | 비대상 |
| 별도 중복/호출 감사 | 비대상. 변경 경로 직접 대조와 공통 경계 검사로 확인. 보고서 재생성 필요 없음 | 비대상 |
| PR/main CI·main 빌드·Sites·공개 읽기 | 실행. 승인된 원격 통합/발행 단계. 새 CI와 hosting frozen 설치, 자산 해시·보안 응답 대조 | 아래 결과 참조 |

기존 결과를 재사용하면 입력 동일성과 원래 근거를 아래 결과에 명시한다. 미실행 검사를 통과로 처리하지 않는다.

## 로컬 검증 결과

- Node 26.13.0·pnpm 12.18.0. `verify.log`의 공통 정적 검사는 통과, 전체 Vitest 126파일 798개 중 2개가 이전 동작을 기대해 실패했다. 오류 복사 버튼 안에서 HTML 삽입 없이 전문 보존, 정지 2줄의 passive 입력과 seek 방지 목적을 유지하도록 두 기대값을 갱신했고 `regression-recheck.log`의 해당 2파일 42개가 통과했다. 실패한 검사를 제거하지 않았다.
- Safari 검수에서 Real Paradis 9마디의 아래 줄기와 가사 겹침을 발견했다. 좁은 시간축 배치의 native X 구간 충돌 검사가 줄기 하단을 놓쳤다. 조판 직전의 마디 native bottomline 아래로 가사 최소 여백을 확보하고 모든 절을 같은 양만큼 옮겼다. 공통 `installScoreLyrics`를 재사용하고 전체 보기 native 배치·정본·Song은 유지한다. 캐시 v44로 이전 파생물을 구분한다.
- 수정 후 `lyrics-recheck.log`: 관련 5파일 25검사 통과. 새 회귀는 줄기 충돌·복수 절 간격·재조판 누적 방지·충분한 여백과 전체 보기 유지의 한 동작을 검사한다. 전체 799개 중 최종 변경 영향 검사는 다시 실행하고 나머지 동일 입력의 성공을 재사용했다. `check-final.log`, `bundle-final.log`: 최종 lint·서식·앱/도구/hosting 타입·의존성·i18n·경계·문서/링크/앵커 및 두 앱 빌드·player 경계 통과. 기존 500kB 번들 경고는 수용된 기준에 따라 유지한다.
- 릴리스 스킬 quick_validate 통과. 현재 Rule·카탈로그와 필수/선택/재사용 순서를 대조했다.

## Safari 실제 확인

- Safari MCP 27.2 / WebKit 605.1.15, macOS, 기존 5173 개발 서버. 제작기는 PC 1280×796, player는 같은 크기와 852×393 좁은 가로 창을 사용했다. iPhone/iPad 실기기·시뮬레이터 확인이 아니다.
- 갑자기: 전체·1줄·2줄·균등 SVG에 파란 가사와 마디 문구, PDF에는 인쇄 가사만 표시됨을 확인했다. 전체 SVG의 native 파란 텍스트 308개(음절301+문구7), 17⅓px=13pt, 색 `#3f74d4`; HTML 가사 중복 없음. 전체 가사 메뉴 제거 확인. `suddenly-*.png` 보존.
- Real Paradis: 제작기 편집 열기 성공. 9마디 겹침 수정 전후의 화면과 1줄·2줄·균등·전체 보기 `real-paradis-*-fixed.png` 보존. 가사와 음표 줄기 분리, 전체 보기 제목/부제·BPM·노래·번호와 native 가사 배치 유지 확인.
- 두 앱의 오류 버튼을 실제 클릭해 시험 문구가 OS 클립보드와 일치함을 확인했다. player 팝업은 MutationObserver로 약2503ms 후 제거, 제작기도 복사 안내와 오류 닫기 확인. 시험 알림/계측 코드는 페이지 수명 안에서만 사용했다.
- 1줄 passive=false → 정지2줄 true → 재생 false → 정지 true 전환 확인. 정지의 mandatory snap, 재생의 snap 해제, 실제 AudioContext running과 재생 위치 진행 확인. 정지 스크롤은 여러 줄 이동 후 행 맞춤하고 재생 위치는 유지했다. 물리 트랙패드 비교의 기존 사용자 확인은 원인 근거로만 사용했다.
- 갑자기 첫 렌더4642ms, 캐시54ms(가사 하한 보완 전 동일 13pt 경로); Real Paradis 첫 렌더6384ms. 정지 스크롤 계측130프레임에서 p95/max15ms. 특정 로컬 창에서의 실측이며 iPhone 재로드 해결이나 모든 기기의 성능 보증은 아니다.

## 원격 통합·발행

- 구현 head `8eebb8495e509a96473498a7f5e67d5aa9831c41`, [PR #50](https://github.com/Raphael-KR/drum-practice/pull/50), 제품 main `6e71bbf76350ea79443d8dde8a8b90919904a757`. 자체 diff 검토·미해결 review 0건·[PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/43025537864)·[main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/43025844127) 성공 후 병합/발행했다. 독립 검토로 표현하지 않는다.
- PR head와 main의 tracked tree가 같고, 시작 시 752파일 입력 해시에서 변경된 8파일 외에는 동일했다. 수록 6개 패키지 해시도 모두 유지했다(`input-comparison.json`). 영향 검사와 정적 검사 결과를 재사용하고 main에서 `generate`, `bundle:apps`를 새로 실행했다. 소스 빌드 `de781bc6b608`.
- Sites 기존 소스 열기 → 반환 checkout의 별도 변경 없음 확인 → main player 사본 준비 → frozen 설치 → Sites 빌드 → 48파일 원본/사본/배포 산출물 해시 대조 → source push → 버전 저장/발행 순서로 진행했다. source helper에 완료한 검사는 다시 넣지 않았다.
- Sites 소스 `a36bc44cbde094fefea7ddfe55c27327688bf1e3`, 저장 버전104, 버전 ID `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_2b17439fdd58819197ae4082e4979a26`, 배포 ID `appgdep_6af4691fb64c8191b4d7791505b20c14`. **succeeded, 2026-11-11 22:10:07 KST**. [기존 공개 주소](https://drum-practice-studio.dgkma.chatgpt.site)의 public 범위를 유지했다.
- 공개 읽기18항목 통과: HTML3경로의 새 번들·보안 헤더, player JS/CSS·MusicXML renderer·분석/스트레치 Worker·악보6개 SHA256 일치, editor와 폐기 API3개404. `public-smoke.mjs/json` 보존. 공개 실제 재생·로그인·저장 QA를 수행한 것으로 확대하지 않는다.
- 아카이브 `local-archives/releases/drum-practice-0.11.4-sites.tar.gz`: 56,115,422bytes, gzip SHA256 `c307273e17feccf54646e4b0144c12932aae1b8806870348a4222c83660510a2`. Sites tar content hash `d2a5de6c9a641a8809d1a53ba54fdebffdd5cb8dc903834feb8bcaab7f936e84`와 구분한다. helper의 최초 출력 경로에서 저장 성공 후 보존 폴더로 이동했으며 바이트는 같다.

## 발행 후 정리와 한계

- 기존 기록과 SHA256이 일치한 `local-archives/releases/drum-practice-0.11.2-sites.tar.gz` 56,114,473bytes와 `.tmp/release-0.10.2/sites-0.10.2.tar.gz` 56,130,118bytes를 삭제했다. 총112,244,591bytes(약107.05MiB) 확보. `cleanup.json`에 삭제 전 해시와 최신 보존본 해시를 남겼다.
- `.tmp/release-0.8.8-sites.tar.gz`는 과거 발행 기록의 gzip 해시와 달라 보존했다. retained-checkouts·원본·검증 캡처/로그·현재 node_modules·실행 중인5173·최신 dist·Sites 소스는 보존했다. 근거가 불명확한 파일이나 활성 캐시를 임의로 지우지 않았다.
- Safari 시험 창은 시작 시 저장곡이 없었다. 이번에 추가한 갑자기·Real Paradis 두 사본만 앱의 삭제 경로로 제거해 저장곡0을 재확인하고 시험 탭을 닫았다. 실제 사용자 DB·원본 패키지는 변경하지 않았다. main 전환 도중 Vite HMR이 일시 실패했으며 재접속으로 복구됐고 배포 번들과는 별개다.
- 추가 관찰: Real Paradis14마디의 **균등 모드**에서는 짧은 인접 가사 일부가 붙어 보인다(`player-real-paradis-fixed.png`). 일반2줄에서는 분리돼 보인다(`player-real-paradis-normal-fixed.png`). 이번 공통 하단 여백 수정은 수직 충돌을 해결하며 고정 박 격자·13pt·음악 시각을 바꾸지 않는다. 균등 모드의 수평 밀도 개선은 후속 검토로 남긴다.
- 결과 문서만 후속 PR로 반영한다. 제품 입력이 같으므로 앱 버전·빌드번호·발행은 반복하지 않는다. PR 병합 후 로컬/원격 main 일치·clean·main 외 브랜치 삭제를 최종 확인한다. 최종 SHA·CI·확인 결과는 `final-state.json`과 최종 보고에 기록한다.
