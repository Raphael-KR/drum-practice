# 0.10.4 상단 주법 표시·Actions 런타임 릴리스

- 목표: MusicXML 연습 화면의 하이햇 주법 상단 표시와 GitHub Actions의 Node 20 경고 수정을 검증해 공개 반영한다.
- 범위: 승인된 미커밋 5경로, 두 앱 버전, 전체 로컬 검사·실제 8/9마디 화면, PR/CI·main 병합·기존 Sites player 발행·공개 확인·이번 병합 브랜치 정리.
- 완료 조건: 원본·저장 호환성을 유지하고 두 앱 공통 표시·전체 검사·최신 PR/main CI·Sites 파일 대조·공개 읽기 검사를 통과한다. CI의 Node 20 액션 경고가 새 실행에서 제거됐는지도 확인한다.
- 제외 범위: 제작기 공개, 악보/기호 매핑·저장 형식 변경, 새 사용자 기능·공개 범위 변경, iOS/iPadOS 기기·시뮬레이터·사람 청취 검증.
- 검증: 사용자가 이번 릴리스의 기존 fixture·메모리 fake-indexeddb·임시 SQLite DB 사용을 명시적으로 허가했다. `pnpm run verify`, actionlint·원본/의존성 보존, Safari 우선 두 앱 검수, 기존 Site의 정본/사본/Worker/공개 파일 확인을 수행한다.

## 후보와 버전

- 시작 main은 `5c9019b2d81200abd355fb0091bc9ce6d8f9612f`다. 기존 미커밋 변경을 보존해 `codex/release-0.10.4`에서 진행하며 다른 브랜치·stash·worktree와 열린 PR은 없다.
- 기존 기능의 잘림/실행 호환성 개선으로 두 앱 0.10.3 → 0.10.4 patch를 선택했다. 앱 Node 22·pnpm 12.18.0과 캐시/검사 설정을 유지한다.
- MusicXML의 공통 상단 clip을 8 CSS px 더 열었다. 배율·위치·프레임 높이·하단·PDF 표시·원본 SVG/캐시는 유지한다. 아래 실제 화면 검수에서 효과와 기존 잔상을 구분했다.
- Actions의 checkout/setup-node는 Node 24를 사용하는 v7로 교체했다. 기존 실행 경고와 이번 후보의 CI 검증을 구분한다.

## 로컬 검증과 화면

- `pnpm run verify` 통과: lint·447파일 서식·앱/도구/hosting 타입·구조/문서 검사, 132파일의 810테스트와 editor/player 분리 빌드. 테스트 개수를 고정 성공 기준으로 사용하지 않았다. 루트 `pnpm audit`는 0건이며 중앙 카탈로그와 사본 해시도 일치한다.
- 공식 체크섬을 확인한 임시 actionlint 1.7.12가 현재 워크플로를 통과했다. 프로젝트 Node 22·pnpm pin·frozen 설치·캐시·검사 명령은 유지한다. 원격 액션 실행 성공과 Node 20 경고 제거도 아래 최신 CI에서 확인했다.
- macOS Safari MCP, Safari 27.2 UA·실제 viewport 1024×664에서 기존 수록 ‘갑자기’를 불러와 두 앱의 1줄/2줄 8·9마디를 확인했다. 8마디 ○와 9마디 ＋의 위쪽이 모두 보인다. DOM에서 기존 상단 clip만 재현했을 때 U/T 모양 잘림이 다시 나타나고, 수정 clip 복원 후 온전한 표시를 확인했다. 악보·음표 위치를 바꾼 비교가 아니다.
- 검수 후 1줄·1마디로 되돌렸으며 제작기 검수 전후 원본 XML·PDF/음원·페이지·편집 draft/revision을 포함하는 Song 외 필드의 정규화 SHA256은 `93fcfd9cc51f2424810e4fcdb78dde6f5e3fd17b29fc5a38da69e236fd3678bf`로 일치했다. 기존 사용자 자료를 덮어쓰거나 삭제하지 않았다.
- 실행 근거와 캡처는 Git 제외 `.tmp/release-0.10.4/`에 보존한다. 기존 5173 서버 PID 63827을 재사용했다. iPad 프리셋·iOS/iPadOS 기기·시뮬레이터·사람 청취 검증은 수행하지 않았다.
- 기존 clip을 재현한 비교 화면에도 같은 하단의 작은 기호 잔상이 보인다. 이번 상단 8px 변경으로 새로 생긴 현상은 아니며 하단 자르기·원본 SVG 변경은 별도 작업으로 남긴다. 기존 대형 청크 경고도 유지하며 기준을 올려 숨기지 않는다.

## 원격 검증과 발행

- 구현 `0eb528cb7ec26804d9d5c2b946a45ec2a87a4903`·[PR #34](https://github.com/Raphael-KR/drum-practice/pull/34)의 최종 8경로 diff를 Codex가 자체 검토했다. 독립 검토로 표현하지 않는다. 최신 [PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42562904202)와 [push CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42562866612)는 통과했다(portable 85파일·444테스트).
- 제품 main `52e1a0191441e8772b40bab931fb91d0876fff41`의 [CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42563077698)도 성공했다. PR head/main의 tree는 `866841f72a1547381fa28084c8649ec0d14dbc8b`로 같아 전체 로컬 결과를 재사용했고, main에서 두 앱을 재빌드하여 소스 `fa70002157b8`을 재현했다.
- 새 CI에서 checkout/setup-node v7 실행이 성공했고 Node 20 폐기 경고가 없다. PR·push·main의 annotation은 Ubuntu 26 이미지 전환 notice뿐이며 프로젝트 Node와 액션 Node를 구분한다.
- 기존 Site ID·public audience를 유지해 player만 발행했다. 공식 helper로 clean 사본을 열고 준비·frozen 설치·빌드·audit 0건·47파일 세 위치 SHA256 대조를 통과했다. 제작기 공개와 제품 코드의 사본 독립 수정은 없다.
- Sites 소스 `42dbf6ac8015eaae93622d7b7fbe294b164dbf59`, 저장 버전96 (`appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_a7cf2a73cd888191999f09f2cdba9be3`), 배포 `appgdep_6af14f75244881918eeac31df6a29c2a`: **succeeded**, **2026-11-09 13:43:46 KST** / `2026-11-09T04:43:46.139546+00:00`. [공개 드럼연습실](https://drum-practice-studio.dgkma.chatgpt.site/).
- 아카이브 `local-archives/releases/release-0.10.4.tar.gz` SHA256 `100c5071fe72b7e6743010a3a132ba574ecba8c6bd6f558482d0bac0c94aa75b`. Sites tar content hash `sha256:8519d2e92bf1151680e929ab318645619feb6a9ed63178a92b0a0cf9344fb902`와 구분한다.
- 공개 읽기 51항목 통과: HTML 3경로 최신 번들·nosniff/프레임/CSP/HSTS, 정적 45파일 SHA256(수록 6곡 포함), 폐기 API 3경로 404. Safari에서 공개 `v0.10.4 · build fa700021` 표시도 확인했다. 공개 데이터 쓰기·실제 공개 재생/청취·전곡 안정성 확인으로 확대하지 않는다.
- 제품 소스가 같으므로 결과 문서만 별도 브랜치/PR로 반영하며 버전·발행을 반복하지 않는다. 결과 문서 병합 후 이번 릴리스의 병합 브랜치만 정리하고 최종 Git 상태를 로컬 receipt에 기록한다. 재사용한 5173 서버와 사용자 Safari 창은 보존하고 이번 MCP 검사 탭만 닫았다.
