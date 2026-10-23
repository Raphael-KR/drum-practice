# 문서 통합 원문 이전표

2026-10-23 통합 실행의 원문/목적지 대조표다. 정책 목록이 아닌 이관 기록이며, 현재 Rule은 [정본 목록](../RULES-INDEX.md)에서 찾는다. 실행 전 원문과 해시는 로컬 `.tmp/documentation-consolidation-20261023-execution/before.json`에 보존했다. 기존 미추적 문서도 포함하며 원문을 Git 이력에만 의존하지 않는다.

## 범위와 처리 상태

아래 통합 시점 기록 뒤 사용자가 이전 주소 안내 정리를 승인했다. 안내 98개 중 코드·인계 설정 참조 6개를 유지하고 92개를 삭제했다. 삭제된 출발 경로는 표의 첫 열에 문자로 보존하고 새 목적지만 연결한다. 과거 주소의 외부 링크는 연결되지 않는다. [정리 결과](documentation.md#이전-주소-안내와-임시파일-정리--2026-10-23)를 함께 참고한다.

- 기준: Git 추적 및 비제외 미추적 파일 686개, Markdown 148개. 브랜치 `codex/fix-playback-wedges`, HEAD `91a4e5bd647880a84406071c8594c20082befaa7`.
- 문서 101개를 45개 주제/절차/기록 목적지로 이관했다. 850개 제목 단위 본문과 기존 앵커를 대조하며 아래 표는 호환 앵커도 포함한다.
- 현행 요구는 18개 분야별 Rule와 루트 AGENTS·PRD, 총 20개 진입점이다. 기계 입력 표 1개를 별도 유지한다.
- 날짜·수치·실패·미확인·당시 명령은 기록 원문을 보존한다. 링크 경로와 제목 계층·명시적 앵커는 새 위치에 맞춰 바꿨다. 모든 Markdown 파일을 Rule로 해석하지 않는다.
- 기존 내비게이션 4개는 원문을 완료 계획 기록에 보존했다. `docs/README.md`, `docs/RULES-INDEX.md`, `docs/records/README.md`는 현행 탐색 입구로 재작성했고 이전 앵커를 유지했다. `docs/procedures/README.md`는 이전 안내다.

## 본문을 재구성한 항목

| 원문 | 주 목적지·보존 방식 | 대조한 의미 |
| --- | --- | --- |
| UX의 음량 기본값 | [재생 기본값](../reference/product/playback.md#settings-playback--기본값과-재생) | 음악 50%, 메트로놈 100%·켜짐, 서버 패키지 제작자 볼륨 대신 기본값, 저장·복원값 보존. UX는 링크만 유지 |
| 문서 역할·목록 정책 | [문서 관리](../reference/engineering/documentation.md), [ADR-0001](../decisions/0001-separate-svg-rules-and-decisions.md) | 이번 승인 계획의 reference/how-to/records·호환 주소 정책으로 갱신. 음악·제품 규칙 변경 없음 |
| 제작 접수의 출력 경로 | [접수](../how-to/produce-score.md#score-production-process--1-자료-접수와-원본-보존) | 곡별 문서는 `records/songs/<곡 식별자>.md`, 미디어는 기존 `data/production/` 유지 |
| UI 검수의 악보 항목 3·4 | [악보 검수](../how-to/review-score.md#원본과-제작기-화면-대조) | 원본 줄·마디·가사·주법·섹션·XML 재열기, 실제 Canvas·PNG 복사·실패 기록 보존 |
| PRD 연습·탐색 상세 | [재생](../reference/product/playback.md), [조판 탐색](../reference/score/rendering.md#svg-score-rules--9-음표-따라가기탐색화면-효과), [음원](../reference/product/audio-practice.md) | 마커5/구간9·FIFO·정렬·등록 조작·선택/정지 위치·원곡/고정 연습·기본값. [전환 전 원문](archive/documentation-reorganization.md#prd-before-consolidation) 보존 |
| 루트 README 개발·검증 | [개발 절차](../how-to/develop.md#readme--개발과-검증) | npm 명령·환경·검사/빌드 범위·미확인 유지. 루트는 빠른 시작과 링크 |
| 두 곡 비교표 | [Real Paradis 4행](songs/real-paradis.md#score-process-evidence--real-paradis-comparison), [Loveholic 6행](songs/loveholic.md#score-process-evidence--loveholic-comparison) | 표의 10개 데이터 행을 곡별로 한 번 보존. 열 제목은 각 표의 해석을 위해 유지 |
| 두 곡 공동 관측 | [공동 제작 기록](production-tools.md#score-process-evidence--확인한-자료와-현재-미확인-사항--2026-10-04) | 함께 대조한 해시·메타정보·미검증은 하나의 원문으로 보존. 곡별 문서는 링크 |
| ADR-0021의 인용된 앵커 | 같은 ADR | 과거 인용 안의 중복 HTML 앵커 39개를 문자로 보존. 실제 원문 제목의 앵커·결정 본문은 유지 |

기존 Rule의 나머지 필드·수치·조건은 본문 대조와 경로/제목 서식만 정규화한 전체 절 비교로 확인한다. 문자열 검사는 의미 검토의 보조이며 규칙 승인이나 앱 동작의 검증을 대신하지 않는다.

## 파일·문단별 이전

각 펼침의 SHA-256은 통합 전 파일이다. 원문 경로·앵커는 출처이며 현재 파일의 존재를 뜻하지 않는다. 삭제된 안내의 출발 경로는 링크 대신 문자로 남겼다. 제목이 같은 문단은 원문 파일 접두어를 붙인 명시적 앵커로 구분한다. “이전 문단 링크”는 규칙 본문을 복사하지 않고 기존 이관 기록에 연결한다.

<details>
<summary>docs/product/UX-PRINCIPLES.md</summary>

원문 SHA-256: `69dcba24585f8d770e8f401728fd0c1c340ed01862804544523ca94c6b6a3a17`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/product/UX-PRINCIPLES.md#팀-ux-원칙과-맥락형-도움말` | [docs/reference/product/ux.md#ux-principles--팀-ux-원칙과-맥락형-도움말](../reference/product/ux.md#ux-principles--팀-ux-원칙과-맥락형-도움말) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#목적과-적용-범위` | [docs/reference/product/ux.md#ux-principles--목적과-적용-범위](../reference/product/ux.md#ux-principles--목적과-적용-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#선호-원칙-8가지` | [docs/reference/product/ux.md#ux-principles--선호-원칙-8가지](../reference/product/ux.md#ux-principles--선호-원칙-8가지) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#설계와-리뷰의-태도` | [docs/reference/product/ux.md#ux-principles--설계와-리뷰의-태도](../reference/product/ux.md#ux-principles--설계와-리뷰의-태도) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#적용-사례--맥락형-도움말` | [docs/reference/product/ux.md#ux-principles--적용-사례--맥락형-도움말](../reference/product/ux.md#ux-principles--적용-사례--맥락형-도움말) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#역할` | [docs/reference/product/ux.md#ux-principles--역할](../reference/product/ux.md#ux-principles--역할) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#동작과-구성` | [docs/reference/product/ux.md#ux-principles--동작과-구성](../reference/product/ux.md#ux-principles--동작과-구성) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#공통-검수-질문` | [docs/reference/product/ux.md#ux-principles--공통-검수-질문](../reference/product/ux.md#ux-principles--공통-검수-질문) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#관련-문서와-변경-관리` | [docs/reference/product/ux.md#ux-principles--관련-문서와-변경-관리](../reference/product/ux.md#ux-principles--관련-문서와-변경-관리) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#악보를-미리-읽을-여유` | [docs/reference/product/ux.md#ux-principles--악보를-미리-읽을-여유](../reference/product/ux.md#ux-principles--악보를-미리-읽을-여유) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#설정-화면의-연속-탐색` | [docs/reference/product/ux.md#ux-principles--설정-화면의-연속-탐색](../reference/product/ux.md#ux-principles--설정-화면의-연속-탐색) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#화면-설정의-선택-버튼` | [docs/reference/product/ux.md#ux-principles--화면-설정의-선택-버튼](../reference/product/ux.md#ux-principles--화면-설정의-선택-버튼) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#4줄-svg-범례-적용` | [docs/reference/product/ux.md#ux-principles--4줄-svg-범례-적용](../reference/product/ux.md#ux-principles--4줄-svg-범례-적용) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#범례-중앙-배치전체-클릭-닫기` | [docs/reference/product/ux.md#ux-principles--범례-중앙-배치전체-클릭-닫기](../reference/product/ux.md#ux-principles--범례-중앙-배치전체-클릭-닫기) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#모달-애니메이션` | [docs/reference/product/ux.md#ux-principles--모달-애니메이션](../reference/product/ux.md#ux-principles--모달-애니메이션) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#설정-사이드바-볼륨` | [docs/reference/product/ux.md#ux-principles--설정-사이드바-볼륨](../reference/product/ux.md#ux-principles--설정-사이드바-볼륨) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#범례-가독성` | [docs/reference/product/ux.md#ux-principles--범례-가독성](../reference/product/ux.md#ux-principles--범례-가독성) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#연속-배경` | [docs/reference/product/ux.md#ux-principles--연속-배경](../reference/product/ux.md#ux-principles--연속-배경) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#마디-위치-숫자판` | [docs/reference/product/ux.md#ux-principles--마디-위치-숫자판](../reference/product/ux.md#ux-principles--마디-위치-숫자판) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#조작판9칸` | [docs/reference/product/ux.md#ux-principles--조작판9칸](../reference/product/ux.md#ux-principles--조작판9칸) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#드럼연습실-화면-명칭` | [docs/reference/product/ux.md#ux-principles--드럼연습실-화면-명칭](../reference/product/ux.md#ux-principles--드럼연습실-화면-명칭) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#악보-선택-상단-공통-버튼` | [docs/reference/product/ux.md#ux-principles--악보-선택-상단-공통-버튼](../reference/product/ux.md#ux-principles--악보-선택-상단-공통-버튼) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#다수-악보용-목록-밀도` | [docs/reference/product/ux.md#ux-principles--다수-악보용-목록-밀도](../reference/product/ux.md#ux-principles--다수-악보용-목록-밀도) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#제목-표시-순서-설정` | [docs/reference/product/ux.md#ux-principles--제목-표시-순서-설정](../reference/product/ux.md#ux-principles--제목-표시-순서-설정) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#양자-선택-공통-분할-버튼` | [docs/reference/product/ux.md#ux-principles--양자-선택-공통-분할-버튼](../reference/product/ux.md#ux-principles--양자-선택-공통-분할-버튼) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#악보-선택-설정-진입` | [docs/reference/product/ux.md#ux-principles--악보-선택-설정-진입](../reference/product/ux.md#ux-principles--악보-선택-설정-진입) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#아이폰-세로-전용-화면` | [docs/reference/product/ux.md#ux-principles--아이폰-세로-전용-화면](../reference/product/ux.md#ux-principles--아이폰-세로-전용-화면) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#재생-중-화면-유지` | [docs/reference/product/ux.md#ux-principles--재생-중-화면-유지](../reference/product/ux.md#ux-principles--재생-중-화면-유지) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#선택-마디-원클릭원터치-재생` | [docs/reference/product/ux.md#ux-principles--선택-마디-원클릭원터치-재생](../reference/product/ux.md#ux-principles--선택-마디-원클릭원터치-재생) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#아이폰-상단-조작-버튼-우측-정렬` | [docs/reference/product/ux.md#ux-principles--아이폰-상단-조작-버튼-우측-정렬](../reference/product/ux.md#ux-principles--아이폰-상단-조작-버튼-우측-정렬) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#아이폰-재생-버튼-중심북마크-줄` | [docs/reference/product/ux.md#ux-principles--아이폰-재생-버튼-중심북마크-줄](../reference/product/ux.md#ux-principles--아이폰-재생-버튼-중심북마크-줄) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#ipad-mini-세로-재생바-두-줄-배치` | [docs/reference/product/ux.md#ux-principles--ipad-mini-세로-재생바-두-줄-배치](../reference/product/ux.md#ux-principles--ipad-mini-세로-재생바-두-줄-배치) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#마디-숫자판-중앙-구분자` | [docs/reference/product/ux.md#ux-principles--마디-숫자판-중앙-구분자](../reference/product/ux.md#ux-principles--마디-숫자판-중앙-구분자) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#아이폰-세로-볼륨-두-줄` | [docs/reference/product/ux.md#ux-principles--아이폰-세로-볼륨-두-줄](../reference/product/ux.md#ux-principles--아이폰-세로-볼륨-두-줄) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#아이폰-세로-악보-선택-상단-버튼` | [docs/reference/product/ux.md#ux-principles--아이폰-세로-악보-선택-상단-버튼](../reference/product/ux.md#ux-principles--아이폰-세로-악보-선택-상단-버튼) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#iphoneipad-음원-파일-선택` | [docs/reference/product/ux.md#ux-principles--iphoneipad-음원-파일-선택](../reference/product/ux.md#ux-principles--iphoneipad-음원-파일-선택) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#음원-파형-스크롤` | [docs/reference/product/ux.md#ux-principles--음원-파형-스크롤](../reference/product/ux.md#ux-principles--음원-파형-스크롤) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#음악메트로놈-기본값-및-아이폰-곡-목록` | [docs/reference/product/ux.md#ux-principles--음악메트로놈-기본값-및-아이폰-곡-목록](../reference/product/ux.md#ux-principles--음악메트로놈-기본값-및-아이폰-곡-목록) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#넓은-브라우저의-재생-배치` | [docs/reference/product/ux.md#ux-principles--넓은-브라우저의-재생-배치](../reference/product/ux.md#ux-principles--넓은-브라우저의-재생-배치) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#재생-오류-안내` | [docs/reference/product/ux.md#ux-principles--재생-오류-안내](../reference/product/ux.md#ux-principles--재생-오류-안내) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#태블릿-하단-버튼판의-남는-높이` | [docs/reference/product/ux.md#ux-principles--태블릿-하단-버튼판의-남는-높이](../reference/product/ux.md#ux-principles--태블릿-하단-버튼판의-남는-높이) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#내-음원-목록-분리` | [docs/reference/product/ux.md#ux-principles--내-음원-목록-분리](../reference/product/ux.md#ux-principles--내-음원-목록-분리) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#중복-음원-확인-팝업` | [docs/reference/product/ux.md#ux-principles--중복-음원-확인-팝업](../reference/product/ux.md#ux-principles--중복-음원-확인-팝업) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#박자-맞추기-설명-순서` | [docs/reference/product/ux.md#ux-principles--박자-맞추기-설명-순서](../reference/product/ux.md#ux-principles--박자-맞추기-설명-순서) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#도움말-도구-위치` | [docs/reference/product/ux.md#ux-principles--도움말-도구-위치](../reference/product/ux.md#ux-principles--도움말-도구-위치) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#연습-화면-도움말-안내-바-위치` | [docs/reference/product/ux.md#ux-principles--연습-화면-도움말-안내-바-위치](../reference/product/ux.md#ux-principles--연습-화면-도움말-안내-바-위치) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#모든-모달팝업-공통-닫기` | [docs/reference/product/ux.md#ux-principles--모든-모달팝업-공통-닫기](../reference/product/ux.md#ux-principles--모든-모달팝업-공통-닫기) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#탐색반복템포의-정본` | [docs/reference/product/ux.md#ux-principles--탐색반복템포의-정본](../reference/product/ux.md#ux-principles--탐색반복템포의-정본) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#도움말의-범례와-확인-팝업` | [docs/reference/product/ux.md#ux-principles--도움말의-범례와-확인-팝업](../reference/product/ux.md#ux-principles--도움말의-범례와-확인-팝업) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#이전-문단-링크` | [docs/reference/product/ux.md#ux-principles--팀-ux-원칙과-맥락형-도움말](../reference/product/ux.md#ux-principles--팀-ux-원칙과-맥락형-도움말) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#팀-ux-원칙과-맥락형-도움말-설계-지침` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--1](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--1) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#설계의-이유` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--9](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--9) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#이전-구현-기록-2026-10-15-포커스-방식으로-대체` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--10](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--10) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#악보를-미리-읽을-여유-2026-10-03-승인` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--13](../decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--13) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#설정-화면의-연속-탐색-2026-10-03-승인구현` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--14](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--14) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#화면-설정의-선택-버튼-2026-10-03` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--15](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--15) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-03-도움말-공통-범례` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--16](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--16) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-04-도움말-하단-조작부` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--17](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--17) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-04-4줄-svg-범례-적용` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--18](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--18) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-04-버튼--도움말범례-모달-전환` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--19](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--19) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-04-범례-중앙-배치전체-클릭-닫기` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--20](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--20) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-04-설정-사이드바-볼륨` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--22](../decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--22) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#악보제작기-시작-화면` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--23](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--23) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-04-재생바와-하단-서랍` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--24](../decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--24) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-04-범례-가독성` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--25](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--25) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-04-고정-조작판으로-전환-이전-서랍-토글-규칙-대체` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--26](../decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--26) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-04-섹션-바로가기-조작판-마커-관리-규칙-대체` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--27](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--27) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-04-세로-화면-상단-정리` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--28](../decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--28) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-04-연속-배경` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--29](../decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--29) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-04-도움말-위치-보완` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--30](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--30) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-04-앞뒤-반복의-재생-시작점` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--31](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--31) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-04-마디-위치-숫자판` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--32](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--32) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-04-조작판9칸-이전12칸-표시-대체` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--33](../decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--33) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#드럼연습실-화면-명칭-2026-10-06` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--34](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--34) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-06-악보-선택-상단-공통-버튼` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--35](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--35) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-06-다수-악보용-목록-밀도` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--36](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--36) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-06-악보-즐겨찾기` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--37](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--37) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-06-즐겨찾기-최상단-통합-직전-섹션별-정렬-규칙-대체` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--38](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--38) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-06-제목-표시-순서-설정` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--39](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--39) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-06-양자-선택-공통-분할-버튼` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--40](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--40) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-06-도움말-현행화` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--41](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--41) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-06-악보-선택-설정-진입` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--42](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--42) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-13-드럼연습실-백업복원업데이트-제거-이전-해당-규칙-대체` | [docs/decisions/0020-local-editor-and-public-player.md#이관-원문--ux-principlesmd--43](../decisions/0020-local-editor-and-public-player.md#이관-원문--ux-principlesmd--43) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-13-2줄-보기-키보드-이동` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--44](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--44) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-13-enter-반복-구간-등록과-정렬-기존-슬롯-위치-고정-규칙-대체` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--45](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--45) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-13-m-마커-단축키` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--46](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--46) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-13-2줄-보기의-선택-이동-시-화면-유지` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--47](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--47) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#재생-위치와-키보드-선택-분리-2026-10-13` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--48](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--48) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#선택-마디-테두리만-표시-2026-10-13` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--49](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--49) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#두-줄-방향키-탐색의-줄-위치-유지-2026-10-13` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--50](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--50) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#저장한-연습-구간-표시-2026-10-13` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--51](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--51) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#태블릿-구간-등록-2026-10-13` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--52](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--52) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#구간-버튼-시작삭제-2026-10-22-사용자-결정` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--53](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--53) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#마커구간-색상-통일-2026-10-13-사용자-정정` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--54](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--54) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#빈-구간-슬롯-2026-10-13` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--55](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--55) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#구간-선택-진입-시-화면-위치-유지-2026-10-13` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--56](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--56) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#정지-중-더블클릭-구간-등록-2026-10-13` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--57](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--57) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#빈-슬롯의-태블릿-구간-선택-2026-10-13` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--58](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--58) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#구간-선택에서-마우스-원클릭-등록-2026-10-13` | [ADR-0006 원문 59](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--59) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#아이폰-세로-전용-화면-2026-10-13` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--60](../decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--60) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#재생-중-화면-유지-2026-10-13` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--61](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--61) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#선택-마디-원클릭원터치-재생-2026-10-13` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--62](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--62) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#아이폰-상단-조작-버튼-우측-정렬-2026-10-13` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--63](../decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--63) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#아이폰-재생-버튼-중심북마크-줄-2026-10-13` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--64](../decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--64) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#원곡-버튼-악보-bpm-2026-10-13` | [docs/decisions/0015-score-tempo-and-recording-estimates.md#이관-원문--ux-principlesmd--65](../decisions/0015-score-tempo-and-recording-estimates.md#이관-원문--ux-principlesmd--65) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#ipad-mini-세로-재생바-두-줄-배치-2026-10-13` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--66](../decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--66) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#마디-숫자판-중앙-구분자-2026-10-13` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--67](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--67) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#아이폰-세로-볼륨-두-줄-2026-10-13` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--68](../decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--68) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#아이폰-세로-악보-선택-상단-버튼-2026-10-13` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--69](../decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--69) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-13--음원-불러오기-통합-가져오기-결정-변경` | [docs/decisions/0026-device-local-audio-analysis.md#이관-원문--ux-principlesmd--70](../decisions/0026-device-local-audio-analysis.md#이관-원문--ux-principlesmd--70) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-13--iphoneipad-음원-파일-선택` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--71](../decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--71) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#원곡연습-템포-구분-2026-10-13` | [docs/decisions/0015-score-tempo-and-recording-estimates.md#이관-원문--ux-principlesmd--72](../decisions/0015-score-tempo-and-recording-estimates.md#이관-원문--ux-principlesmd--72) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#음원-파형-스크롤-2026-10-13` | [docs/decisions/0026-device-local-audio-analysis.md#이관-원문--ux-principlesmd--73](../decisions/0026-device-local-audio-analysis.md#이관-원문--ux-principlesmd--73) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#파일-선택창-복귀-2026-10-13` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--74](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--74) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#연습-bpm-변환-상태-2026-10-13` | [docs/decisions/0015-score-tempo-and-recording-estimates.md#이관-원문--ux-principlesmd--75](../decisions/0015-score-tempo-and-recording-estimates.md#이관-원문--ux-principlesmd--75) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#음악메트로놈-기본값-및-아이폰-곡-목록-2026-10-13` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--76](../decisions/0005-practice-layout-and-spacing.md#이관-원문--ux-principlesmd--76) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#음원-1마디-시작-기준-2026-10-13` | [docs/decisions/0026-device-local-audio-analysis.md#이관-원문--ux-principlesmd--77](../decisions/0026-device-local-audio-analysis.md#이관-원문--ux-principlesmd--77) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-14-넓은-브라우저의-재생-배치` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--78](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--78) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#태블릿-하단-버튼판의-남는-높이-2026-10-15` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--80](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--80) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-15-내-음원-목록-분리` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--81](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--81) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-15-음원-연습-정보-저장불러오기` | [docs/decisions/0022-portable-score-and-practice-files.md#이관-원문--ux-principlesmd--82](../decisions/0022-portable-score-and-practice-files.md#이관-원문--ux-principlesmd--82) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#중복-음원-확인-팝업-2026-10-15` | [docs/decisions/0022-portable-score-and-practice-files.md#이관-원문--ux-principlesmd--83](../decisions/0022-portable-score-and-practice-files.md#이관-원문--ux-principlesmd--83) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#박자-맞추기-파형과-시작점-2026-10-15` | [docs/decisions/0026-device-local-audio-analysis.md#이관-원문--ux-principlesmd--84](../decisions/0026-device-local-audio-analysis.md#이관-원문--ux-principlesmd--84) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#박자-맞추기의-메트로놈-2026-10-15` | [docs/decisions/0026-device-local-audio-analysis.md#이관-원문--ux-principlesmd--85](../decisions/0026-device-local-audio-analysis.md#이관-원문--ux-principlesmd--85) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#박자-맞추기-재생바-속도-2026-10-15` | [docs/decisions/0026-device-local-audio-analysis.md#이관-원문--ux-principlesmd--86](../decisions/0026-device-local-audio-analysis.md#이관-원문--ux-principlesmd--86) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#박자-맞추기-설명-순서-2026-10-15` | [docs/decisions/0026-device-local-audio-analysis.md#이관-원문--ux-principlesmd--87](../decisions/0026-device-local-audio-analysis.md#이관-원문--ux-principlesmd--87) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#2026-10-15-말풍선-도움말-이전-구현-기록` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--88](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--88) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#도움말-도구-위치-정정-2026-10-15` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--89](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--89) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#포커스길게-누르고-있기-도움말-2026-10-15` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--90](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--90) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#연습-화면-도움말-안내-바-위치-2026-10-15` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--91](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--91) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#도움말이-있는-일반-모달-닫기-2026-10-15-과거-구현-2026-10-21-대체` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--92](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--92) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#일반-모달과-확인-팝업의-도움말-구분-2026-10-15-과거-결정-2026-10-21-대체` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--93](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--93) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#확인-팝업-디자인-통일-2026-10-15` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--94](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--94) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#연습-bpm-입력-경로-통일-2026-10-21` | [docs/decisions/0015-score-tempo-and-recording-estimates.md#이관-원문--ux-principlesmd--95](../decisions/0015-score-tempo-and-recording-estimates.md#이관-원문--ux-principlesmd--95) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#모든-모달팝업-공통-닫기-2026-10-21` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--96](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--ux-principlesmd--96) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#버튼-이동-카운트오프-2026-10-22` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--97](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--ux-principlesmd--97) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#도움말-도구-위치-정정` | [docs/reference/product/ux.md#ux-principles--도움말-도구-위치](../reference/product/ux.md#ux-principles--도움말-도구-위치) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#모달-애니메이션-정정` | [docs/reference/product/ux.md#ux-principles--모달-애니메이션](../reference/product/ux.md#ux-principles--모달-애니메이션) | 이관·안내 삭제(사용자 승인) |
| `docs/product/UX-PRINCIPLES.md#잠정-유지하는-표현` | [docs/decisions/0005-practice-layout-and-spacing.md#](../decisions/0005-practice-layout-and-spacing.md) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/product/SETTINGS-PLAYBACK.md</summary>

원문 SHA-256: `5b57e7c944706a35f6d1e670a0e4ebb24ebe75ca8a0eb36abb54ba40c5dfd26b`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/product/SETTINGS-PLAYBACK.md#설정과-재생-정책` | [docs/reference/product/playback.md#settings-playback--설정과-재생-정책](../reference/product/playback.md#settings-playback--설정과-재생-정책) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SETTINGS-PLAYBACK.md#설정-범위` | [docs/reference/product/playback.md#settings-playback--설정-범위](../reference/product/playback.md#settings-playback--설정-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SETTINGS-PLAYBACK.md#기본값과-재생` | [docs/reference/product/playback.md#settings-playback--기본값과-재생](../reference/product/playback.md#settings-playback--기본값과-재생) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SETTINGS-PLAYBACK.md#검증` | [docs/reference/product/playback.md#settings-playback--검증](../reference/product/playback.md#settings-playback--검증) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/product/MARKER-SLOTS.md</summary>

원문 SHA-256: `fba746041d194e5665d42b64fcb370150a68570f9eeac608571cf8c7d5cee615`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/product/MARKER-SLOTS.md#마디-마커-슬롯` | [docs/reference/product/playback.md#marker-slots--마디-마커-슬롯](../reference/product/playback.md#marker-slots--마디-마커-슬롯) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/product/PLAYBACK-ACTIONS.md</summary>

원문 SHA-256: `74958fe15999f8b16f4ad64f02b1c761185e9d3d13489d3691329fd957d39dbc`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/product/PLAYBACK-ACTIONS.md#재생-이동과-반복-구간-동작` | [docs/reference/product/playback.md#playback-actions--재생-이동과-반복-구간-동작](../reference/product/playback.md#playback-actions--재생-이동과-반복-구간-동작) | 이관·안내 삭제(사용자 승인) |
| `docs/product/PLAYBACK-ACTIONS.md#버튼-이동-카운트오프` | [docs/reference/product/playback.md#playback-actions--버튼-이동-카운트오프](../reference/product/playback.md#playback-actions--버튼-이동-카운트오프) | 이관·안내 삭제(사용자 승인) |
| `docs/product/PLAYBACK-ACTIONS.md#저장-구간-시작과-삭제` | [docs/reference/product/playback.md#playback-actions--저장-구간-시작과-삭제](../reference/product/playback.md#playback-actions--저장-구간-시작과-삭제) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/product/NOTE-PLAYBACK-HIGHLIGHT.md</summary>

원문 SHA-256: `90d72aa5b144ef03c81556f831533e8d0c450cabafc6e2f1c754b4520116ce80`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/product/NOTE-PLAYBACK-HIGHLIGHT.md#음표-따라가기` | [docs/reference/product/playback.md#note-playback-highlight--음표-따라가기](../reference/product/playback.md#note-playback-highlight--음표-따라가기) | 이관·안내 삭제(사용자 승인) |
| `docs/product/NOTE-PLAYBACK-HIGHLIGHT.md#이전-문단-링크` | [docs/reference/product/playback.md#note-playback-highlight--음표-따라가기](../reference/product/playback.md#note-playback-highlight--음표-따라가기) | 이관·안내 삭제(사용자 승인) |
| `docs/product/NOTE-PLAYBACK-HIGHLIGHT.md#2026-09-21-검증-결과` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--note-playback-highlightmd--2](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--note-playback-highlightmd--2) | 이관·안내 삭제(사용자 승인) |
| `docs/product/NOTE-PLAYBACK-HIGHLIGHT.md#pdf-보기에서-켜짐으로-오인한-문제-수정` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--note-playback-highlightmd--3](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--note-playback-highlightmd--3) | 이관·안내 삭제(사용자 승인) |
| `docs/product/NOTE-PLAYBACK-HIGHLIGHT.md#순간-점등-방식으로-변경` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--note-playback-highlightmd--4](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--note-playback-highlightmd--4) | 이관·안내 삭제(사용자 승인) |
| `docs/product/NOTE-PLAYBACK-HIGHLIGHT.md#흰-중심과-청록-광륜` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--note-playback-highlightmd--5](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--note-playback-highlightmd--5) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/product/PAUSED-SCORE-SCROLL.md</summary>

원문 SHA-256: `24d58338987af6c07e97b4693633cb298badb4c5162410547a5b97cf55288d78`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/product/PAUSED-SCORE-SCROLL.md#정지된-두-줄-악보의-세로-탐색` | [docs/reference/product/playback.md#paused-score-scroll--정지된-두-줄-악보의-세로-탐색](../reference/product/playback.md#paused-score-scroll--정지된-두-줄-악보의-세로-탐색) | 이관·안내 삭제(사용자 승인) |
| `docs/product/PAUSED-SCORE-SCROLL.md#이전-문단-링크` | [docs/reference/product/playback.md#paused-score-scroll--정지된-두-줄-악보의-세로-탐색](../reference/product/playback.md#paused-score-scroll--정지된-두-줄-악보의-세로-탐색) | 이관·안내 삭제(사용자 승인) |
| `docs/product/PAUSED-SCORE-SCROLL.md#구현` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--paused-score-scrollmd--2](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--paused-score-scrollmd--2) | 이관·안내 삭제(사용자 승인) |
| `docs/product/PAUSED-SCORE-SCROLL.md#검증` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--paused-score-scrollmd--3](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--paused-score-scrollmd--3) | 이관·안내 삭제(사용자 승인) |
| `docs/product/PAUSED-SCORE-SCROLL.md#두-줄-공통-간격-2026-09-21` | [docs/decisions/0006-practice-navigation-and-overlays.md#이관-원문--paused-score-scrollmd--4](../decisions/0006-practice-navigation-and-overlays.md#이관-원문--paused-score-scrollmd--4) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/product/AUDIO-PRACTICE.md</summary>

원문 SHA-256: `485e34aed5708b2f809865185cabc5d6f4dcc575808119f20f92babb0da92335`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/product/AUDIO-PRACTICE.md#음원-연습` | [docs/reference/product/audio-practice.md#audio-practice--음원-연습](../reference/product/audio-practice.md#audio-practice--음원-연습) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#가져오기와-곡-정보` | [docs/reference/product/audio-practice.md#audio-practice--가져오기와-곡-정보](../reference/product/audio-practice.md#audio-practice--가져오기와-곡-정보) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#박자와-템포` | [docs/reference/product/audio-practice.md#audio-practice--박자와-템포](../reference/product/audio-practice.md#audio-practice--박자와-템포) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#기기-내-분석정보-재사용` | [docs/reference/product/audio-practice.md#audio-practice--기기-내-분석정보-재사용](../reference/product/audio-practice.md#audio-practice--기기-내-분석정보-재사용) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#연주-전과-1마디-1박` | [docs/reference/product/audio-practice.md#audio-practice--연주-전과-1마디-1박](../reference/product/audio-practice.md#audio-practice--연주-전과-1마디-1박) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#검증과-한계` | [docs/reference/product/audio-practice.md#audio-practice--검증과-한계](../reference/product/audio-practice.md#audio-practice--검증과-한계) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#연습-정보-파일-저장불러오기` | [docs/reference/product/audio-practice.md#audio-practice--연습-정보-파일-저장불러오기](../reference/product/audio-practice.md#audio-practice--연습-정보-파일-저장불러오기) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#동일-음원-중복-등록-방지` | [docs/reference/product/audio-practice.md#audio-practice--동일-음원-중복-등록-방지](../reference/product/audio-practice.md#audio-practice--동일-음원-중복-등록-방지) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#박자-맞추기-파형-조작` | [docs/reference/product/audio-practice.md#audio-practice--박자-맞추기-파형-조작](../reference/product/audio-practice.md#audio-practice--박자-맞추기-파형-조작) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#박자-맞추기-전용-메트로놈` | [docs/reference/product/audio-practice.md#audio-practice--박자-맞추기-전용-메트로놈](../reference/product/audio-practice.md#audio-practice--박자-맞추기-전용-메트로놈) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#박자-맞추기-재생-속도` | [docs/reference/product/audio-practice.md#audio-practice--박자-맞추기-재생-속도](../reference/product/audio-practice.md#audio-practice--박자-맞추기-재생-속도) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#악보-bpm박자-선택` | [docs/reference/product/audio-practice.md#audio-practice--악보-bpm박자-선택](../reference/product/audio-practice.md#audio-practice--악보-bpm박자-선택) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#조정-제목줄-동작` | [docs/reference/product/audio-practice.md#audio-practice--조정-제목줄-동작](../reference/product/audio-practice.md#audio-practice--조정-제목줄-동작) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#bpm-입력과-프리셋` | [docs/reference/product/audio-practice.md#audio-practice--bpm-입력과-프리셋](../reference/product/audio-practice.md#audio-practice--bpm-입력과-프리셋) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#이전-문단-링크` | [docs/reference/product/audio-practice.md#audio-practice--음원-연습](../reference/product/audio-practice.md#audio-practice--음원-연습) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#음원-연습--현재-동작` | [docs/decisions/0026-device-local-audio-analysis.md#이관-원문--audio-practicemd--1](../decisions/0026-device-local-audio-analysis.md#이관-원문--audio-practicemd--1) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#기기-내-분석정보-재사용-2026-10-14-079-공개-반영` | [docs/decisions/0026-device-local-audio-analysis.md#이관-원문--audio-practicemd--4](../decisions/0026-device-local-audio-analysis.md#이관-원문--audio-practicemd--4) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#동일-음원-중복-등록-방지-2026-10-15` | [docs/reference/product/audio-practice.md#audio-practice--동일-음원-중복-등록-방지](../reference/product/audio-practice.md#audio-practice--동일-음원-중복-등록-방지) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#박자-맞추기-재생-속도-2026-10-15` | [docs/reference/product/audio-practice.md#audio-practice--박자-맞추기-재생-속도](../reference/product/audio-practice.md#audio-practice--박자-맞추기-재생-속도) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#박자-맞추기-전용-메트로놈-2026-10-15` | [docs/reference/product/audio-practice.md#audio-practice--박자-맞추기-전용-메트로놈](../reference/product/audio-practice.md#audio-practice--박자-맞추기-전용-메트로놈) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#박자-맞추기-파형-조작-2026-10-15` | [docs/reference/product/audio-practice.md#audio-practice--박자-맞추기-파형-조작](../reference/product/audio-practice.md#audio-practice--박자-맞추기-파형-조작) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#악보-bpm박자-선택-2026-10-15` | [docs/reference/product/audio-practice.md#audio-practice--악보-bpm박자-선택](../reference/product/audio-practice.md#audio-practice--악보-bpm박자-선택) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#연습-정보-파일-저장불러오기-2026-10-15` | [docs/reference/product/audio-practice.md#audio-practice--연습-정보-파일-저장불러오기](../reference/product/audio-practice.md#audio-practice--연습-정보-파일-저장불러오기) | 이관·안내 삭제(사용자 승인) |
| `docs/product/AUDIO-PRACTICE.md#조정-제목줄-동작-2026-10-15` | [docs/reference/product/audio-practice.md#audio-practice--조정-제목줄-동작](../reference/product/audio-practice.md#audio-practice--조정-제목줄-동작) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/product/SCORE-WORKSPACE.md</summary>

원문 SHA-256: `e1a5bec3c2fe7a45d27db1e80bc7f6e5336adaeaf6f926b0fcff7ea95523be71`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/product/SCORE-WORKSPACE.md#악보제작기-편집-화면` | [docs/reference/product/editor.md#score-workspace--악보제작기-편집-화면](../reference/product/editor.md#score-workspace--악보제작기-편집-화면) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-WORKSPACE.md#편집-화면` | [docs/reference/product/editor.md#score-workspace--편집-화면](../reference/product/editor.md#score-workspace--편집-화면) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-WORKSPACE.md#곡-정보-시각-체계` | [docs/reference/product/editor.md#score-workspace--곡-정보-시각-체계](../reference/product/editor.md#score-workspace--곡-정보-시각-체계) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-WORKSPACE.md#설정-진입-타일` | [docs/reference/product/editor.md#score-workspace--설정-진입-타일](../reference/product/editor.md#score-workspace--설정-진입-타일) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-WORKSPACE.md#악보-편집-탭` | [docs/reference/product/editor.md#score-workspace--악보-편집-탭](../reference/product/editor.md#score-workspace--악보-편집-탭) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-WORKSPACE.md#곡-정보와-저장` | [docs/reference/product/editor.md#score-workspace--곡-정보와-저장](../reference/product/editor.md#score-workspace--곡-정보와-저장) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-WORKSPACE.md#파일-작업-통합` | [docs/reference/product/editor.md#score-workspace--파일-작업-통합](../reference/product/editor.md#score-workspace--파일-작업-통합) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-WORKSPACE.md#이전-문단-링크` | [docs/reference/product/editor.md#score-workspace--악보제작기-편집-화면](../reference/product/editor.md#score-workspace--악보제작기-편집-화면) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-WORKSPACE.md#통합-악보-화면` | [docs/decisions/0021-contextual-help-and-shared-ui.md#이관-원문--score-workspacemd--1](../decisions/0021-contextual-help-and-shared-ui.md#이관-원문--score-workspacemd--1) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-WORKSPACE.md#곡-정보--2026-09-21-저장-통합` | [docs/reference/product/editor.md#score-workspace--곡-정보와-저장](../reference/product/editor.md#score-workspace--곡-정보와-저장) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-WORKSPACE.md#설정-진입-타일--2026-09-21-승인-반영` | [docs/reference/product/editor.md#score-workspace--설정-진입-타일](../reference/product/editor.md#score-workspace--설정-진입-타일) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-WORKSPACE.md#악보-편집-탭--승인-배치-적용` | [docs/reference/product/editor.md#score-workspace--악보-편집-탭](../reference/product/editor.md#score-workspace--악보-편집-탭) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-WORKSPACE.md#파일-작업-통합--2026-09-21` | [docs/reference/product/editor.md#score-workspace--파일-작업-통합](../reference/product/editor.md#score-workspace--파일-작업-통합) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/product/SCORE-REVIEW.md</summary>

원문 SHA-256: `9d81ea1548dd2d5a89fbd09c229fb8f0e4178e20c07ef984ca60ff920b45819f`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/product/SCORE-REVIEW.md#pdf--musicxml-검수-계약` | [docs/reference/product/editor.md#score-review--pdf--musicxml-검수-계약](../reference/product/editor.md#score-review--pdf--musicxml-검수-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-REVIEW.md#화면과-캡처` | [docs/reference/product/editor.md#score-review--화면과-캡처](../reference/product/editor.md#score-review--화면과-캡처) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-REVIEW.md#오선-정렬` | [docs/reference/product/editor.md#score-review--오선-정렬](../reference/product/editor.md#score-review--오선-정렬) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-REVIEW.md#이전-문단-링크` | [docs/reference/product/editor.md#score-review--pdf--musicxml-검수-계약](../reference/product/editor.md#score-review--pdf--musicxml-검수-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-REVIEW.md#pdf--musicxml-검수-모드` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--1](../decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--1) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-REVIEW.md#사용` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--2](../decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--2) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-REVIEW.md#기본-곡-자동-준비-2026-09-19` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--3](../decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--3) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-REVIEW.md#채보-검수-교정-001--5마디-23박` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--4](../decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--4) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-REVIEW.md#교정-002--전체-쉼표-3단-배치` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--5](../decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--5) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-REVIEW.md#2026-09-20-검수-화면-마디-정렬` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--6](../decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--6) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-REVIEW.md#2026-09-20-마디-전체-쉼표-중앙-배치` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--7](../decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--7) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-REVIEW.md#2026-09-20-오픈-하이햇의-빈-음표머리` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--8](../decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--8) | 이관·안내 삭제(사용자 승인) |
| `docs/product/SCORE-REVIEW.md#2026-10-21--러브홀릭-103마디-오선-검출-수정` | [docs/decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--9](../decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--9) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/architecture/MUSICXML-INPUT.md</summary>

원문 SHA-256: `4d314a9efc23c680c12a9597bae3b91243ecfd6542a5f9f52bcb4211f90bc877`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/architecture/MUSICXML-INPUT.md#musicxml-입력-계약` | [docs/reference/score/musicxml.md#musicxml-input--musicxml-입력-계약](../reference/score/musicxml.md#musicxml-input--musicxml-입력-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MUSICXML-INPUT.md#형식과-지원-경계` | [docs/reference/score/musicxml.md#musicxml-input--형식과-지원-경계](../reference/score/musicxml.md#musicxml-input--형식과-지원-경계) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MUSICXML-INPUT.md#곡별-악보-형식` | [docs/reference/score/musicxml.md#musicxml-input--곡별-악보-형식](../reference/score/musicxml.md#musicxml-input--곡별-악보-형식) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MUSICXML-INPUT.md#실행` | [docs/reference/score/musicxml.md#musicxml-input--실행](../reference/score/musicxml.md#musicxml-input--실행) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/architecture/MUSICXML-CANONICAL.md</summary>

원문 SHA-256: `9fa021c54273ae8bd3022b44758ad72ea526c8eb84d73cb3991ca84fe5836a14`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/architecture/MUSICXML-CANONICAL.md#musicxml-정본-계약` | [docs/reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MUSICXML-CANONICAL.md#현재-가사-제작-기준` | [docs/reference/score/musicxml.md#musicxml-canonical--현재-가사-제작-기준](../reference/score/musicxml.md#musicxml-canonical--현재-가사-제작-기준) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MUSICXML-CANONICAL.md#저장-계약` | [docs/reference/score/musicxml.md#musicxml-canonical--저장-계약](../reference/score/musicxml.md#musicxml-canonical--저장-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MUSICXML-CANONICAL.md#음원-템포와-연습-박` | [docs/reference/score/musicxml.md#musicxml-canonical--음원-템포와-연습-박](../reference/score/musicxml.md#musicxml-canonical--음원-템포와-연습-박) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MUSICXML-CANONICAL.md#악보의-박별-음원-연결` | [docs/reference/score/musicxml.md#musicxml-canonical--악보의-박별-음원-연결](../reference/score/musicxml.md#musicxml-canonical--악보의-박별-음원-연결) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MUSICXML-CANONICAL.md#보컬-악보-입력` | [docs/reference/score/musicxml.md#musicxml-canonical--보컬-악보-입력](../reference/score/musicxml.md#musicxml-canonical--보컬-악보-입력) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MUSICXML-CANONICAL.md#보존과-교환` | [docs/reference/score/musicxml.md#musicxml-canonical--보존과-교환](../reference/score/musicxml.md#musicxml-canonical--보존과-교환) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MUSICXML-CANONICAL.md#렌더러-계약` | [docs/reference/score/musicxml.md#musicxml-canonical--렌더러-계약](../reference/score/musicxml.md#musicxml-canonical--렌더러-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MUSICXML-CANONICAL.md#검증` | [docs/reference/score/musicxml.md#musicxml-canonical--검증](../reference/score/musicxml.md#musicxml-canonical--검증) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MUSICXML-CANONICAL.md#결정-근거` | [docs/reference/score/musicxml.md#musicxml-canonical--결정-근거](../reference/score/musicxml.md#musicxml-canonical--결정-근거) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MUSICXML-CANONICAL.md#이전-문단-링크` | [docs/reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MUSICXML-CANONICAL.md#렌더러-결정` | [docs/reference/score/musicxml.md#musicxml-canonical--렌더러-계약](../reference/score/musicxml.md#musicxml-canonical--렌더러-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MUSICXML-CANONICAL.md#악보의-박별-음원-연결-2026-10-15` | [docs/reference/score/musicxml.md#musicxml-canonical--악보의-박별-음원-연결](../reference/score/musicxml.md#musicxml-canonical--악보의-박별-음원-연결) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/architecture/MEASURE-LYRICS.md</summary>

원문 SHA-256: `bed7a9b9d4f41ba3c0e0070aa1e037e46ec541bba0e091c11a13377d834581d8`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/architecture/MEASURE-LYRICS.md#마디-단위-인쇄-가사-계약` | [docs/reference/score/musicxml.md#measure-lyrics--마디-단위-인쇄-가사-계약](../reference/score/musicxml.md#measure-lyrics--마디-단위-인쇄-가사-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MEASURE-LYRICS.md#목적과-범위` | [docs/reference/score/musicxml.md#measure-lyrics--목적과-범위](../reference/score/musicxml.md#measure-lyrics--목적과-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MEASURE-LYRICS.md#데이터` | [docs/reference/score/musicxml.md#measure-lyrics--데이터](../reference/score/musicxml.md#measure-lyrics--데이터) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MEASURE-LYRICS.md#이전-문단-링크` | [docs/reference/score/musicxml.md#measure-lyrics--마디-단위-인쇄-가사-계약](../reference/score/musicxml.md#measure-lyrics--마디-단위-인쇄-가사-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MEASURE-LYRICS.md#검증-2026-10-03` | [docs/decisions/0013-score-based-lyric-positions.md#이관-원문--measure-lyricsmd--4](../decisions/0013-score-based-lyric-positions.md#이관-원문--measure-lyricsmd--4) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MEASURE-LYRICS.md#실제-loveholic-수록-및-배포` | [docs/decisions/0013-score-based-lyric-positions.md#이관-원문--measure-lyricsmd--5](../decisions/0013-score-based-lyric-positions.md#이관-원문--measure-lyricsmd--5) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md</summary>

원문 SHA-256: `6a4e9152c46f24e6a2b0acd701e622e23789492cc00d4b85e0909a6e8b3da58e`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#악보의-musicxml--osmd-매핑-규칙` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙](../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#읽는-순서와-상태-구분` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--읽는-순서와-상태-구분](../reference/score/notation.md#score-musicxml-osmd-mapping--읽는-순서와-상태-구분) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#섹션-표제와-연주-지시` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--섹션-표제와-연주-지시](../reference/score/notation.md#score-musicxml-osmd-mapping--섹션-표제와-연주-지시) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#확정-범례` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--확정-범례](../reference/score/notation.md#score-musicxml-osmd-mapping--확정-범례) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#o-복합-지시의-승인-범위` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--o-복합-지시의-승인-범위](../reference/score/notation.md#score-musicxml-osmd-mapping--o-복합-지시의-승인-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#반열림-하이햇의-공식-표기-경로` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--반열림-하이햇의-공식-표기-경로](../reference/score/notation.md#score-musicxml-osmd-mapping--반열림-하이햇의-공식-표기-경로) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#한쪽-범례에만-있는-항목` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--한쪽-범례에만-있는-항목](../reference/score/notation.md#score-musicxml-osmd-mapping--한쪽-범례에만-있는-항목) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#목적과-적용-원칙` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--목적과-적용-원칙](../reference/score/notation.md#score-musicxml-osmd-mapping--목적과-적용-원칙) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#문서-변경과-실행-순서` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--문서-변경과-실행-순서](../reference/score/notation.md#score-musicxml-osmd-mapping--문서-변경과-실행-순서) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#선택과-보고-절차` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--선택과-보고-절차](../reference/score/notation.md#score-musicxml-osmd-mapping--선택과-보고-절차) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#쉼표` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--쉼표](../reference/score/notation.md#score-musicxml-osmd-mapping--쉼표) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#rl-스티킹--현재-승인-규칙` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--rl-스티킹--현재-승인-규칙](../reference/score/notation.md#score-musicxml-osmd-mapping--rl-스티킹--현재-승인-규칙) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#메타-정보와-가사` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--메타-정보와-가사](../reference/score/notation.md#score-musicxml-osmd-mapping--메타-정보와-가사) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#지원-경계-osmd-자체와-앱-보완` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--지원-경계-osmd-자체와-앱-보완](../reference/score/notation.md#score-musicxml-osmd-mapping--지원-경계-osmd-자체와-앱-보완) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#확정-범례의-적용-범위` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--확정-범례의-적용-범위](../reference/score/notation.md#score-musicxml-osmd-mapping--확정-범례의-적용-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#근거와-관리` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--근거와-관리](../reference/score/notation.md#score-musicxml-osmd-mapping--근거와-관리) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#이전-문단-링크` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙](../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#2026-10-03-최종-재확인-모든-곡에-확정-범례-적용` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--2026-10-03-최종-재확인-모든-곡에-확정-범례-적용](../reference/score/notation.md#score-musicxml-osmd-mapping--2026-10-03-최종-재확인-모든-곡에-확정-범례-적용) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#o-복합-지시의-승인-범위--2026-10-23` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--o-복합-지시의-승인-범위](../reference/score/notation.md#score-musicxml-osmd-mapping--o-복합-지시의-승인-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#반열림-하이햇의-공식-표기-경로--2026-10-03` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--반열림-하이햇의-공식-표기-경로](../reference/score/notation.md#score-musicxml-osmd-mapping--반열림-하이햇의-공식-표기-경로) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#섹션-표제와-연주-지시--사용자-결정-2026-10-23` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--섹션-표제와-연주-지시](../reference/score/notation.md#score-musicxml-osmd-mapping--섹션-표제와-연주-지시) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md#확정-범례--사용자-결정-2026-09-20` | [docs/reference/score/notation.md#score-musicxml-osmd-mapping--확정-범례](../reference/score/notation.md#score-musicxml-osmd-mapping--확정-범례) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/architecture/SVG-SCORE-RULES.md</summary>

원문 SHA-256: `47d34176085066de3f4647b870760adad1f23c6bc7d6f89c0b26c7f2bf92fe06`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/architecture/SVG-SCORE-RULES.md#svg-전체-악보-생성-규칙` | [docs/reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#1-범위와-원본-보존` | [docs/reference/score/rendering.md#svg-score-rules--1-범위와-원본-보존](../reference/score/rendering.md#svg-score-rules--1-범위와-원본-보존) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#2-전체-페이지-생성` | [docs/reference/score/rendering.md#svg-score-rules--2-전체-페이지-생성](../reference/score/rendering.md#svg-score-rules--2-전체-페이지-생성) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#3-타악기-음자리표와-세로줄` | [docs/reference/score/rendering.md#svg-score-rules--3-타악기-음자리표와-세로줄](../reference/score/rendering.md#svg-score-rules--3-타악기-음자리표와-세로줄) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#4-구간-시작-표시` | [docs/reference/score/rendering.md#svg-score-rules--4-구간-시작-표시](../reference/score/rendering.md#svg-score-rules--4-구간-시작-표시) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#섹션연주-지시-7가지-원칙` | [docs/reference/score/rendering.md#svg-score-rules--섹션연주-지시-7가지-원칙](../reference/score/rendering.md#svg-score-rules--섹션연주-지시-7가지-원칙) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#공통-xml-위치-계약` | [docs/reference/score/rendering.md#svg-score-rules--공통-xml-위치-계약](../reference/score/rendering.md#svg-score-rules--공통-xml-위치-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#악보-텍스트-글꼴` | [docs/reference/score/rendering.md#svg-score-rules--악보-텍스트-글꼴](../reference/score/rendering.md#svg-score-rules--악보-텍스트-글꼴) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#5-음표주법-보완` | [docs/reference/score/rendering.md#svg-score-rules--5-음표주법-보완](../reference/score/rendering.md#svg-score-rules--5-음표주법-보완) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#native-조판-계약` | [docs/reference/score/rendering.md#svg-score-rules--native-조판-계약](../reference/score/rendering.md#svg-score-rules--native-조판-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#6-쉼표` | [docs/reference/score/rendering.md#svg-score-rules--6-쉼표](../reference/score/rendering.md#svg-score-rules--6-쉼표) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#7-마디-좌표와-자르기` | [docs/reference/score/rendering.md#svg-score-rules--7-마디-좌표와-자르기](../reference/score/rendering.md#svg-score-rules--7-마디-좌표와-자르기) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#8-연습-화면-전용-배치` | [docs/reference/score/rendering.md#svg-score-rules--8-연습-화면-전용-배치](../reference/score/rendering.md#svg-score-rules--8-연습-화면-전용-배치) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#균등-간격-모드` | [docs/reference/score/rendering.md#svg-score-rules--균등-간격-모드](../reference/score/rendering.md#svg-score-rules--균등-간격-모드) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#9-음표-따라가기탐색화면-효과` | [docs/reference/score/rendering.md#svg-score-rules--9-음표-따라가기탐색화면-효과](../reference/score/rendering.md#svg-score-rules--9-음표-따라가기탐색화면-효과) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#10-저장캐시안전` | [docs/reference/score/rendering.md#svg-score-rules--10-저장캐시안전](../reference/score/rendering.md#svg-score-rules--10-저장캐시안전) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#11-변경-검증` | [docs/reference/score/rendering.md#svg-score-rules--11-변경-검증](../reference/score/rendering.md#svg-score-rules--11-변경-검증) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#현재-구현-참조` | [docs/reference/score/rendering.md#svg-score-rules--현재-구현-참조](../reference/score/rendering.md#svg-score-rules--현재-구현-참조) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#이전-문단-링크` | [docs/reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SVG-SCORE-RULES.md#섹션연주-지시-7가지-최종-원칙--사용자-확정-2026-10-23` | [docs/reference/score/rendering.md#svg-score-rules--섹션연주-지시-7가지-원칙](../reference/score/rendering.md#svg-score-rules--섹션연주-지시-7가지-원칙) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/architecture/BROWSER-MUSICXML-RENDERING.md</summary>

원문 SHA-256: `24e2b43f4ca598f2d67e005fffc4db4ae72db05eaa8255218690b21b5c139863`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/architecture/BROWSER-MUSICXML-RENDERING.md#브라우저-공통-musicxml-조판-계약` | [docs/reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/BROWSER-MUSICXML-RENDERING.md#승인된-표시-계약` | [docs/reference/score/rendering.md#browser-musicxml-rendering--승인된-표시-계약](../reference/score/rendering.md#browser-musicxml-rendering--승인된-표시-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/BROWSER-MUSICXML-RENDERING.md#캐시와-입력-권위` | [docs/reference/score/rendering.md#browser-musicxml-rendering--캐시와-입력-권위](../reference/score/rendering.md#browser-musicxml-rendering--캐시와-입력-권위) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/BROWSER-MUSICXML-RENDERING.md#검증-기준` | [docs/reference/score/rendering.md#browser-musicxml-rendering--검증-기준](../reference/score/rendering.md#browser-musicxml-rendering--검증-기준) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/BROWSER-MUSICXML-RENDERING.md#보정-유지-조건` | [docs/reference/score/rendering.md#browser-musicxml-rendering--보정-유지-조건](../reference/score/rendering.md#browser-musicxml-rendering--보정-유지-조건) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/BROWSER-MUSICXML-RENDERING.md#구현-경계` | [docs/reference/score/rendering.md#browser-musicxml-rendering--구현-경계](../reference/score/rendering.md#browser-musicxml-rendering--구현-경계) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/BROWSER-MUSICXML-RENDERING.md#이전-문단-링크` | [docs/reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/BROWSER-MUSICXML-RENDERING.md#브라우저-musicxml-직접-조판-전환` | [docs/decisions/0004-browser-native-score-rendering.md#이관-원문--browser-musicxml-renderingmd--1](../decisions/0004-browser-native-score-rendering.md#이관-원문--browser-musicxml-renderingmd--1) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/BROWSER-MUSICXML-RENDERING.md#결과실패-기록` | [docs/decisions/0004-browser-native-score-rendering.md#이관-원문--browser-musicxml-renderingmd--6](../decisions/0004-browser-native-score-rendering.md#이관-원문--browser-musicxml-renderingmd--6) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/BROWSER-MUSICXML-RENDERING.md#구현과-적용-범위` | [docs/decisions/0004-browser-native-score-rendering.md#이관-원문--browser-musicxml-renderingmd--7](../decisions/0004-browser-native-score-rendering.md#이관-원문--browser-musicxml-renderingmd--7) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/BROWSER-MUSICXML-RENDERING.md#실제-측정` | [docs/decisions/0004-browser-native-score-rendering.md#이관-원문--browser-musicxml-renderingmd--8](../decisions/0004-browser-native-score-rendering.md#이관-원문--browser-musicxml-renderingmd--8) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/BROWSER-MUSICXML-RENDERING.md#실패와-해결` | [docs/decisions/0004-browser-native-score-rendering.md#이관-원문--browser-musicxml-renderingmd--9](../decisions/0004-browser-native-score-rendering.md#이관-원문--browser-musicxml-renderingmd--9) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/BROWSER-MUSICXML-RENDERING.md#기존-보정-판단` | [docs/decisions/0004-browser-native-score-rendering.md#이관-원문--browser-musicxml-renderingmd--10](../decisions/0004-browser-native-score-rendering.md#이관-원문--browser-musicxml-renderingmd--10) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/BROWSER-MUSICXML-RENDERING.md#근거와-한계` | [docs/decisions/0004-browser-native-score-rendering.md#이관-원문--browser-musicxml-renderingmd--11](../decisions/0004-browser-native-score-rendering.md#이관-원문--browser-musicxml-renderingmd--11) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/BROWSER-MUSICXML-RENDERING.md#보정-재검토-목록` | [docs/reference/score/rendering.md#browser-musicxml-rendering--보정-유지-조건](../reference/score/rendering.md#browser-musicxml-rendering--보정-유지-조건) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/architecture/PDF-DISPLAY-TRIM.md</summary>

원문 SHA-256: `a299b638898bfbae87049731e9538a0b2b49525036652986d584ded45fc4db65`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/architecture/PDF-DISPLAY-TRIM.md#pdf-연습-화면-표시용-자르기` | [docs/reference/score/rendering.md#pdf-display-trim--pdf-연습-화면-표시용-자르기](../reference/score/rendering.md#pdf-display-trim--pdf-연습-화면-표시용-자르기) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/PDF-DISPLAY-TRIM.md#적용-계약` | [docs/reference/score/rendering.md#pdf-display-trim--적용-계약](../reference/score/rendering.md#pdf-display-trim--적용-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/PDF-DISPLAY-TRIM.md#이전-문단-링크` | [docs/reference/score/rendering.md#pdf-display-trim--pdf-연습-화면-표시용-자르기](../reference/score/rendering.md#pdf-display-trim--pdf-연습-화면-표시용-자르기) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/PDF-DISPLAY-TRIM.md#완료-조건` | [docs/decisions/0003-source-systems-and-cropping.md#이관-원문--pdf-display-trimmd--2](../decisions/0003-source-systems-and-cropping.md#이관-원문--pdf-display-trimmd--2) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/PDF-DISPLAY-TRIM.md#진행실패-기록` | [docs/decisions/0003-source-systems-and-cropping.md#이관-원문--pdf-display-trimmd--3](../decisions/0003-source-systems-and-cropping.md#이관-원문--pdf-display-trimmd--3) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/PDF-DISPLAY-TRIM.md#최종-검증과-배포` | [docs/decisions/0003-source-systems-and-cropping.md#이관-원문--pdf-display-trimmd--4](../decisions/0003-source-systems-and-cropping.md#이관-원문--pdf-display-trimmd--4) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/PDF-DISPLAY-TRIM.md#2026-10-03-가사-작업-전제-정정` | [docs/decisions/0003-source-systems-and-cropping.md#이관-원문--pdf-display-trimmd--5](../decisions/0003-source-systems-and-cropping.md#이관-원문--pdf-display-trimmd--5) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/SCORE-PRODUCTION-RULES.md</summary>

원문 SHA-256: `b3eceff28544f37c20ec27b07c8bbf676e0a827662b8692b0465952cb79cf83b`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/SCORE-PRODUCTION-RULES.md#악보-제작-범위와-보존-rule` | [docs/reference/score/production.md#score-production-rules--악보-제작-범위와-보존-rule](../reference/score/production.md#score-production-rules--악보-제작-범위와-보존-rule) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-RULES.md#접수와-출력` | [docs/reference/score/production.md#score-production-rules--접수와-출력](../reference/score/production.md#score-production-rules--접수와-출력) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-RULES.md#원본-판단과-재사용` | [docs/reference/score/production.md#score-production-rules--원본-판단과-재사용](../reference/score/production.md#score-production-rules--원본-판단과-재사용) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-RULES.md#검증과-종료` | [docs/reference/score/production.md#score-production-rules--검증과-종료](../reference/score/production.md#score-production-rules--검증과-종료) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-RULES.md#완성-악보의-상시-인계` | [docs/reference/score/production.md#score-production-rules--완성-악보의-상시-인계](../reference/score/production.md#score-production-rules--완성-악보의-상시-인계) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/MUSICXML-CONVERSION-POLICY.md</summary>

원문 SHA-256: `85ae7c223dc65bd148df9b16e33a9348271b45175f6f899e202aea843f04dbbf`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/MUSICXML-CONVERSION-POLICY.md#pdf--musicxml-변환-정책` | [docs/reference/score/production.md#musicxml-conversion-policy--pdf--musicxml-변환-정책](../reference/score/production.md#musicxml-conversion-policy--pdf--musicxml-변환-정책) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION-POLICY.md#문서의-역할` | [docs/reference/score/production.md#musicxml-conversion-policy--문서의-역할](../reference/score/production.md#musicxml-conversion-policy--문서의-역할) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION-POLICY.md#선택-순서` | [docs/reference/score/production.md#musicxml-conversion-policy--선택-순서](../reference/score/production.md#musicxml-conversion-policy--선택-순서) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION-POLICY.md#보존과-검증` | [docs/reference/score/production.md#musicxml-conversion-policy--보존과-검증](../reference/score/production.md#musicxml-conversion-policy--보존과-검증) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION-POLICY.md#첫-박과-카운트오프` | [docs/reference/score/production.md#musicxml-conversion-policy--첫-박과-카운트오프](../reference/score/production.md#musicxml-conversion-policy--첫-박과-카운트오프) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION-POLICY.md#가사-기준--악보-우선` | [docs/reference/score/production.md#musicxml-conversion-policy--가사-기준--악보-우선](../reference/score/production.md#musicxml-conversion-policy--가사-기준--악보-우선) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION-POLICY.md#막힘과-문서-모순` | [docs/reference/score/production.md#musicxml-conversion-policy--막힘과-문서-모순](../reference/score/production.md#musicxml-conversion-policy--막힘과-문서-모순) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION-POLICY.md#이전-문단-링크` | [docs/reference/score/production.md#musicxml-conversion-policy--pdf--musicxml-변환-정책](../reference/score/production.md#musicxml-conversion-policy--pdf--musicxml-변환-정책) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION-POLICY.md#pdf--musicxml-변환-방식-선택-기준` | [docs/decisions/0017-source-dependent-musicxml-conversion.md#이관-원문--musicxml-conversion-policymd--1](../decisions/0017-source-dependent-musicxml-conversion.md#이관-원문--musicxml-conversion-policymd--1) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION-POLICY.md#초기-악보음원-제작-필수-검증--첫-박과-카운트오프` | [docs/decisions/0017-source-dependent-musicxml-conversion.md#이관-원문--musicxml-conversion-policymd--5](../decisions/0017-source-dependent-musicxml-conversion.md#이관-원문--musicxml-conversion-policymd--5) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION-POLICY.md#막혔을-때-확인-순서와-해결-기록` | [docs/decisions/0017-source-dependent-musicxml-conversion.md#이관-원문--musicxml-conversion-policymd--7](../decisions/0017-source-dependent-musicxml-conversion.md#이관-원문--musicxml-conversion-policymd--7) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION-POLICY.md#문서-정리와-모순-해결` | [docs/decisions/0017-source-dependent-musicxml-conversion.md#이관-원문--musicxml-conversion-policymd--8](../decisions/0017-source-dependent-musicxml-conversion.md#이관-원문--musicxml-conversion-policymd--8) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION-POLICY.md#방식-선택의-과거-근거--real-paradis` | [docs/decisions/0017-source-dependent-musicxml-conversion.md#이관-원문--musicxml-conversion-policymd--9](../decisions/0017-source-dependent-musicxml-conversion.md#이관-원문--musicxml-conversion-policymd--9) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/LYRIC-FEEDBACK-RULES.md</summary>

원문 SHA-256: `1357466f89dbfcea17f5bcaf2eca98465d4282d0db0f163ac5736af63c9b9065`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/LYRIC-FEEDBACK-RULES.md#수동-가사-싱크-피드백-접수` | [docs/reference/score/production.md#lyric-feedback-rules--수동-가사-싱크-피드백-접수](../reference/score/production.md#lyric-feedback-rules--수동-가사-싱크-피드백-접수) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/COMMON-TOOLS.md</summary>

원문 SHA-256: `f078d7afb3c696c66d516e01645396d92bde35a161ca8db576ca28ff7a93892a`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/COMMON-TOOLS.md#공통-제작-도구-계약과-곡별-판독` | [docs/reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/COMMON-TOOLS.md#공통-코드와-곡별-판단` | [docs/reference/score/tools.md#common-tools--공통-코드와-곡별-판단](../reference/score/tools.md#common-tools--공통-코드와-곡별-판단) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/COMMON-TOOLS.md#구현된-경계` | [docs/reference/score/tools.md#common-tools--구현된-경계](../reference/score/tools.md#common-tools--구현된-경계) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/COMMON-TOOLS.md#공통-패키지-api` | [docs/reference/score/tools.md#common-tools--공통-패키지-api](../reference/score/tools.md#common-tools--공통-패키지-api) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/COMMON-TOOLS.md#남겨-둔-곡별-판단` | [docs/reference/score/tools.md#common-tools--남겨-둔-곡별-판단](../reference/score/tools.md#common-tools--남겨-둔-곡별-판단) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/COMMON-TOOLS.md#이전-문단-링크` | [docs/reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/COMMON-TOOLS.md#공통-제작-도구와-곡별-판독` | [docs/decisions/0018-reusable-score-production-and-handoff.md#이관-원문--common-toolsmd--1](../decisions/0018-reusable-score-production-and-handoff.md#이관-원문--common-toolsmd--1) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/COMMON-TOOLS.md#구현-순서` | [docs/decisions/0018-reusable-score-production-and-handoff.md#이관-원문--common-toolsmd--2](../decisions/0018-reusable-score-production-and-handoff.md#이관-원문--common-toolsmd--2) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/COMMON-TOOLS.md#새-곡에서-할-일` | [docs/decisions/0018-reusable-score-production-and-handoff.md#이관-원문--common-toolsmd--5](../decisions/0018-reusable-score-production-and-handoff.md#이관-원문--common-toolsmd--5) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/COMMON-TOOLS.md#실행-예시` | [docs/decisions/0018-reusable-score-production-and-handoff.md#이관-원문--common-toolsmd--6](../decisions/0018-reusable-score-production-and-handoff.md#이관-원문--common-toolsmd--6) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/COMMON-TOOLS.md#검증-결과--2026-10-23` | [docs/records/production-tools.md#production-tool-validation--이관-원문--common-toolsmd--7](production-tools.md#production-tool-validation--이관-원문--common-toolsmd--7) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/COMMON-TOOLS.md#검증-중-확인한-재현-조건` | [docs/records/production-tools.md#production-tool-validation--이관-원문--common-toolsmd--8](production-tools.md#production-tool-validation--이관-원문--common-toolsmd--8) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/architecture/APPLE-LOCAL-REVIEW.md</summary>

원문 SHA-256: `c682455358a305702ecab6c412b4eb47a9bb7eac39e8ade3daaacd2d8cfd0b3f`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/architecture/APPLE-LOCAL-REVIEW.md#apple-로컬-가사-검토-계약` | [docs/reference/score/tools.md#apple-local-review--apple-로컬-가사-검토-계약](../reference/score/tools.md#apple-local-review--apple-로컬-가사-검토-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/APPLE-LOCAL-REVIEW.md#출력-계약` | [docs/reference/score/tools.md#apple-local-review--출력-계약](../reference/score/tools.md#apple-local-review--출력-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/APPLE-LOCAL-REVIEW.md#경계-후보의-의미` | [docs/reference/score/tools.md#apple-local-review--경계-후보의-의미](../reference/score/tools.md#apple-local-review--경계-후보의-의미) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/GARAGEBAND-DRUM-KITS.md</summary>

원문 SHA-256: `ab5ff64f9079b57bc5781e1e6786fc35778e468e88e234a97b840de259cfef87`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/GARAGEBAND-DRUM-KITS.md#드럼킷-선택과-보존-라이브러리` | [docs/reference/score/drum-kits.md#garageband-drum-kits--드럼킷-선택과-보존-라이브러리](../reference/score/drum-kits.md#garageband-drum-kits--드럼킷-선택과-보존-라이브러리) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/GARAGEBAND-DRUM-KITS.md#선택-기준` | [docs/reference/score/drum-kits.md#garageband-drum-kits--선택-기준](../reference/score/drum-kits.md#garageband-drum-kits--선택-기준) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/GARAGEBAND-DRUM-KITS.md#제작-입력과-경계` | [docs/reference/score/drum-kits.md#garageband-drum-kits--제작-입력과-경계](../reference/score/drum-kits.md#garageband-drum-kits--제작-입력과-경계) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/GARAGEBAND-DRUM-KITS.md#소개와-실측-이력` | [docs/reference/score/drum-kits.md#garageband-drum-kits--소개와-실측-이력](../reference/score/drum-kits.md#garageband-drum-kits--소개와-실측-이력) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/GARAGEBAND-DRUM-KITS.md#이전-문단-링크` | [docs/reference/score/drum-kits.md#garageband-drum-kits--드럼킷-선택과-보존-라이브러리](../reference/score/drum-kits.md#garageband-drum-kits--드럼킷-선택과-보존-라이브러리) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/GARAGEBAND-DRUM-KITS.md#garageband-일반-드럼킷-소개` | [docs/decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--1](../decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--1) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/GARAGEBAND-DRUM-KITS.md#제작-시-드럼킷-선택--사용자-결정-2026-10-06` | [docs/decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--2](../decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--2) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/GARAGEBAND-DRUM-KITS.md#프로젝트에-보존한-라이브러리--2026-10-06` | [docs/decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--3](../decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--3) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/GARAGEBAND-DRUM-KITS.md#현재-상태-socalportland만-유지` | [docs/decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--4](../decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--4) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/GARAGEBAND-DRUM-KITS.md#과거-기록-20개-키트-최초-보존` | [docs/decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--5](../decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--5) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/GARAGEBAND-DRUM-KITS.md#앱-없이-사용하는-방법과-검증-한계` | [docs/decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--6](../decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--6) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/GARAGEBAND-DRUM-KITS.md#소개-자료와-읽는-법` | [docs/decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--7](../decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--7) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/GARAGEBAND-DRUM-KITS.md#로컬-근거` | [docs/decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--8](../decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--8) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/GARAGEBAND-DRUM-KITS.md#발견한-불일치와-다음-적용-기준` | [docs/decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--9](../decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--9) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/GARAGEBAND-DRUM-KITS.md#공통-음색-조절` | [docs/decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--10](../decisions/0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--10) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/architecture/SCORE-PACKAGE.md</summary>

원문 SHA-256: `89596ba3b7546aab1a0563058f16e165b9b5c7b1a81172487f6805b30a027231`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/architecture/SCORE-PACKAGE.md#완성-악보-파일-계약--drumscore-v1` | [docs/reference/score/file-formats.md#score-package--완성-악보-파일-계약--drumscore-v1](../reference/score/file-formats.md#score-package--완성-악보-파일-계약--drumscore-v1) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SCORE-PACKAGE.md#공개-api` | [docs/reference/score/file-formats.md#score-package--공개-api](../reference/score/file-formats.md#score-package--공개-api) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SCORE-PACKAGE.md#zip-내용` | [docs/reference/score/file-formats.md#score-package--zip-내용](../reference/score/file-formats.md#score-package--zip-내용) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SCORE-PACKAGE.md#유효성-및-자원-제한` | [docs/reference/score/file-formats.md#score-package--유효성-및-자원-제한](../reference/score/file-formats.md#score-package--유효성-및-자원-제한) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SCORE-PACKAGE.md#수정본과-연습-기록` | [docs/reference/score/file-formats.md#score-package--수정본과-연습-기록](../reference/score/file-formats.md#score-package--수정본과-연습-기록) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/SCORE-PACKAGE.md#기존-제작-파일의-mime-정규화` | [docs/reference/score/file-formats.md#score-package--기존-제작-파일의-mime-정규화](../reference/score/file-formats.md#score-package--기존-제작-파일의-mime-정규화) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/architecture/PRACTICE-FILE.md</summary>

원문 SHA-256: `56bcdc4dd46c494f53c76919ae993fdf87839429aab817731201fd773f979d42`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/architecture/PRACTICE-FILE.md#음원-연습-파일` | [docs/reference/score/file-formats.md#practice-file--음원-연습-파일](../reference/score/file-formats.md#practice-file--음원-연습-파일) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/PRACTICE-FILE.md#저장과-복원` | [docs/reference/score/file-formats.md#practice-file--저장과-복원](../reference/score/file-formats.md#practice-file--저장과-복원) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/PRACTICE-FILE.md#설정-ui` | [docs/reference/score/file-formats.md#practice-file--설정-ui](../reference/score/file-formats.md#practice-file--설정-ui) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/PRACTICE-FILE.md#동일-음원-중복-등록-방지` | [docs/reference/score/file-formats.md#practice-file--동일-음원-중복-등록-방지](../reference/score/file-formats.md#practice-file--동일-음원-중복-등록-방지) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/PRACTICE-FILE.md#이전-문단-링크` | [docs/reference/score/file-formats.md#practice-file--음원-연습-파일](../reference/score/file-formats.md#practice-file--음원-연습-파일) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/PRACTICE-FILE.md#음원-연습-파일-2026-10-15-사용자-승인` | [docs/decisions/0022-portable-score-and-practice-files.md#이관-원문--practice-filemd--1](../decisions/0022-portable-score-and-practice-files.md#이관-원문--practice-filemd--1) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/PRACTICE-FILE.md#검증-2026-10-15` | [docs/decisions/0022-portable-score-and-practice-files.md#이관-원문--practice-filemd--3](../decisions/0022-portable-score-and-practice-files.md#이관-원문--practice-filemd--3) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/PRACTICE-FILE.md#동일-음원-중복-등록-방지-2026-10-15` | [docs/decisions/0022-portable-score-and-practice-files.md#이관-원문--practice-filemd--4](../decisions/0022-portable-score-and-practice-files.md#이관-원문--practice-filemd--4) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/architecture/PROJECT-STRUCTURE.md</summary>

원문 SHA-256: `55e3f4e421588c3342f29ca5c65ca5505b686c96af7a69fb85b07c2f1d1ada14`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/architecture/PROJECT-STRUCTURE.md#프로젝트-구조` | [docs/reference/engineering/architecture.md#project-structure--프로젝트-구조](../reference/engineering/architecture.md#project-structure--프로젝트-구조) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/PROJECT-STRUCTURE.md#책임과-진입점` | [docs/reference/engineering/architecture.md#project-structure--책임과-진입점](../reference/engineering/architecture.md#project-structure--책임과-진입점) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/PROJECT-STRUCTURE.md#의존-규칙` | [docs/reference/engineering/architecture.md#project-structure--의존-규칙](../reference/engineering/architecture.md#project-structure--의존-규칙) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/PROJECT-STRUCTURE.md#호환성과-스타일` | [docs/reference/engineering/architecture.md#project-structure--호환성과-스타일](../reference/engineering/architecture.md#project-structure--호환성과-스타일) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/PROJECT-STRUCTURE.md#검사-누락-방지` | [docs/reference/engineering/architecture.md#project-structure--검사-누락-방지](../reference/engineering/architecture.md#project-structure--검사-누락-방지) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/architecture/I18N.md</summary>

원문 SHA-256: `7dd000d11cabb8bee8a7395b5e9d9084fdb4b2a4c3278a4226dcfedb7b274274`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/architecture/I18N.md#사용자-표시-문구와-i18n` | [docs/reference/engineering/i18n.md#i18n--사용자-표시-문구와-i18n](../reference/engineering/i18n.md#i18n--사용자-표시-문구와-i18n) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/I18N.md#정본과-호출` | [docs/reference/engineering/i18n.md#i18n--정본과-호출](../reference/engineering/i18n.md#i18n--정본과-호출) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/I18N.md#문구-계약` | [docs/reference/engineering/i18n.md#i18n--문구-계약](../reference/engineering/i18n.md#i18n--문구-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/I18N.md#콘텐츠-예외` | [docs/reference/engineering/i18n.md#i18n--콘텐츠-예외](../reference/engineering/i18n.md#i18n--콘텐츠-예외) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/I18N.md#빌드의-문구-포함-범위` | [docs/reference/engineering/i18n.md#i18n--빌드의-문구-포함-범위](../reference/engineering/i18n.md#i18n--빌드의-문구-포함-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/I18N.md#검수-범위` | [docs/reference/engineering/i18n.md#i18n--검수-범위](../reference/engineering/i18n.md#i18n--검수-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/I18N.md#이전-문단-링크` | [docs/reference/engineering/i18n.md#i18n--사용자-표시-문구와-i18n](../reference/engineering/i18n.md#i18n--사용자-표시-문구와-i18n) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/I18N.md#새-문구와-변경` | [docs/decisions/0024-korean-message-catalog.md#이관-원문--i18nmd--3](../decisions/0024-korean-message-catalog.md#이관-원문--i18nmd--3) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/I18N.md#html의-문구-포함-범위` | [docs/decisions/0024-korean-message-catalog.md#이관-원문--i18nmd--5](../decisions/0024-korean-message-catalog.md#이관-원문--i18nmd--5) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/operations/VERIFICATION-RULES.md</summary>

원문 SHA-256: `0f9861232b34f69af8fa275c0601590e8f4a282b1ad95fd73139786319c40c52`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/operations/VERIFICATION-RULES.md#검증-범위와-증거` | [docs/reference/engineering/verification.md#verification-rules--검증-범위와-증거](../reference/engineering/verification.md#verification-rules--검증-범위와-증거) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/VERIFICATION-RULES.md#범위와-필수-경계` | [docs/reference/engineering/verification.md#verification-rules--범위와-필수-경계](../reference/engineering/verification.md#verification-rules--범위와-필수-경계) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/VERIFICATION-RULES.md#환경과-판정` | [docs/reference/engineering/verification.md#verification-rules--환경과-판정](../reference/engineering/verification.md#verification-rules--환경과-판정) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/VERIFICATION-RULES.md#결과-기록` | [docs/reference/engineering/verification.md#verification-rules--결과-기록](../reference/engineering/verification.md#verification-rules--결과-기록) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/operations/APP-VERSIONS.md</summary>

원문 SHA-256: `9b1745711e2e5d67261b486a6fef11426a62935847372f3b9f9e9b41d2a0561f`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/operations/APP-VERSIONS.md#앱-공통-버전` | [docs/reference/engineering/release.md#app-versions--앱-공통-버전](../reference/engineering/release.md#app-versions--앱-공통-버전) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#증가-기준과-시점` | [docs/reference/engineering/release.md#app-versions--증가-기준과-시점](../reference/engineering/release.md#app-versions--증가-기준과-시점) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#정정-번호와-식별자-보존` | [docs/reference/engineering/release.md#app-versions--정정-번호와-식별자-보존](../reference/engineering/release.md#app-versions--정정-번호와-식별자-보존) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#이전-문단-링크` | [docs/reference/engineering/release.md#app-versions--앱-공통-버전](../reference/engineering/release.md#app-versions--앱-공통-버전) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#2026-10-13-정정-대응표` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--2](releases.md#app-version-history--이관-원문--app-versionsmd--2) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#현재-발행-상태와-증가-시점` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--3](releases.md#app-version-history--이관-원문--app-versionsmd--3) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#077--코드-및-프로젝트-정리` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--4](releases.md#app-version-history--이관-원문--app-versionsmd--4) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#078--음원-분석정보-보안운영-보강` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--5](releases.md#app-version-history--이관-원문--app-versionsmd--5) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#079--음원-분석의-기기-내부-처리` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--6](releases.md#app-version-history--이관-원문--app-versionsmd--6) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#0710--음원-태그재생-레이아웃오류-안내-개선` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--7](releases.md#app-version-history--이관-원문--app-versionsmd--7) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#0711--태블릿-하단-버튼판-높이-개선` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--8](releases.md#app-version-history--이관-원문--app-versionsmd--8) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#0712--붉은-노을-악보와-박별-재생-보완` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--9](releases.md#app-version-history--이관-원문--app-versionsmd--9) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#080--사용자-설정-백업복원` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--10](releases.md#app-version-history--이관-원문--app-versionsmd--10) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#081-릴리스` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--11](releases.md#app-version-history--이관-원문--app-versionsmd--11) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#082--bpm-프리셋과-버튼-길게-누르기-보완` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--12](releases.md#app-version-history--이관-원문--app-versionsmd--12) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#083--모달-닫기와-bpm-프리셋-올림` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--13](releases.md#app-version-history--이관-원문--app-versionsmd--13) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#084--프로젝트-구조-개편` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--14](releases.md#app-version-history--이관-원문--app-versionsmd--14) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#085--공통-목록과-제작기-화면-개선` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--15](releases.md#app-version-history--이관-원문--app-versionsmd--15) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APP-VERSIONS.md#과거-번호-정정` | [docs/reference/engineering/release.md#app-versions--정정-번호와-식별자-보존](../reference/engineering/release.md#app-versions--정정-번호와-식별자-보존) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/operations/DEPLOYMENT-RULES.md</summary>

원문 SHA-256: `089d5e0c1f6777533a0c0004b74cfbc969d3fc083debbcd5249b19894e0071c2`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/operations/DEPLOYMENT-RULES.md#배포-범위와-소스-권위` | [docs/reference/engineering/release.md#deployment-rules--배포-범위와-소스-권위](../reference/engineering/release.md#deployment-rules--배포-범위와-소스-권위) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/DEPLOYMENT-RULES.md#정본과-공개-경계` | [docs/reference/engineering/release.md#deployment-rules--정본과-공개-경계](../reference/engineering/release.md#deployment-rules--정본과-공개-경계) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/DEPLOYMENT-RULES.md#자산과-검증` | [docs/reference/engineering/release.md#deployment-rules--자산과-검증](../reference/engineering/release.md#deployment-rules--자산과-검증) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/operations/SITE-SECURITY-HARDENING.md</summary>

원문 SHA-256: `af1510b8c6710483f728d04172cf525ae93d105b50c7281fe09965489666dbf8`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/operations/SITE-SECURITY-HARDENING.md#공개-사이트-보안과-음원-분석-경계` | [docs/reference/engineering/security.md#site-security-hardening--공개-사이트-보안과-음원-분석-경계](../reference/engineering/security.md#site-security-hardening--공개-사이트-보안과-음원-분석-경계) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITE-SECURITY-HARDENING.md#보호-조치` | [docs/reference/engineering/security.md#site-security-hardening--보호-조치](../reference/engineering/security.md#site-security-hardening--보호-조치) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITE-SECURITY-HARDENING.md#마이그레이션과-배포-경계` | [docs/reference/engineering/security.md#site-security-hardening--마이그레이션과-배포-경계](../reference/engineering/security.md#site-security-hardening--마이그레이션과-배포-경계) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITE-SECURITY-HARDENING.md#이전-문단-링크` | [docs/reference/engineering/security.md#site-security-hardening--공개-사이트-보안과-음원-분석-경계](../reference/engineering/security.md#site-security-hardening--공개-사이트-보안과-음원-분석-경계) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITE-SECURITY-HARDENING.md#079-공개-확인` | [docs/decisions/0026-device-local-audio-analysis.md#이관-원문--site-security-hardeningmd--4](../decisions/0026-device-local-audio-analysis.md#이관-원문--site-security-hardeningmd--4) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITE-SECURITY-HARDENING.md#남기는-보호-조치` | [docs/reference/engineering/security.md#site-security-hardening--보호-조치](../reference/engineering/security.md#site-security-hardening--보호-조치) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITE-SECURITY-HARDENING.md#폐기와-배포-경계` | [docs/reference/engineering/security.md#site-security-hardening--마이그레이션과-배포-경계](../reference/engineering/security.md#site-security-hardening--마이그레이션과-배포-경계) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/operations/OPEN-SOURCE-NOTICES.md</summary>

원문 SHA-256: `43840d6029292f0a7a540029a6412b9c8ac4ff521612ab89f0d3e47670b801f1`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/operations/OPEN-SOURCE-NOTICES.md#오픈소스-고지-계약` | [docs/reference/engineering/third-party-notices.md#open-source-notices--오픈소스-고지-계약](../reference/engineering/third-party-notices.md#open-source-notices--오픈소스-고지-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/OPEN-SOURCE-NOTICES.md#배포물의-표시` | [docs/reference/engineering/third-party-notices.md#open-source-notices--배포물의-표시](../reference/engineering/third-party-notices.md#open-source-notices--배포물의-표시) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/OPEN-SOURCE-NOTICES.md#수집-계약` | [docs/reference/engineering/third-party-notices.md#open-source-notices--수집-계약](../reference/engineering/third-party-notices.md#open-source-notices--수집-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/OPEN-SOURCE-NOTICES.md#범위와-외부-배포-확인-항목` | [docs/reference/engineering/third-party-notices.md#open-source-notices--범위와-외부-배포-확인-항목](../reference/engineering/third-party-notices.md#open-source-notices--범위와-외부-배포-확인-항목) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/OPEN-SOURCE-NOTICES.md#실행-순서` | [docs/reference/engineering/third-party-notices.md#open-source-notices--실행-순서](../reference/engineering/third-party-notices.md#open-source-notices--실행-순서) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/OPEN-SOURCE-NOTICES.md#이전-문단-링크` | [docs/reference/engineering/third-party-notices.md#open-source-notices--오픈소스-고지-계약](../reference/engineering/third-party-notices.md#open-source-notices--오픈소스-고지-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/OPEN-SOURCE-NOTICES.md#오픈소스-고지` | [docs/decisions/0020-local-editor-and-public-player.md#이관-원문--open-source-noticesmd--1](../decisions/0020-local-editor-and-public-player.md#이관-원문--open-source-noticesmd--1) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/OPEN-SOURCE-NOTICES.md#생성-및-검증` | [docs/decisions/0020-local-editor-and-public-player.md#이관-원문--open-source-noticesmd--3](../decisions/0020-local-editor-and-public-player.md#이관-원문--open-source-noticesmd--3) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/DOCUMENTATION-RULES.md</summary>

원문 SHA-256: `a2a0e22cc0504f3c127e3b2b2ab6c94400e090b456eac5eb8fc2d5bae2376795`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/DOCUMENTATION-RULES.md#프로젝트-문서-관리-rule` | [docs/reference/engineering/documentation.md#documentation-rules--프로젝트-문서-관리-rule](../reference/engineering/documentation.md#documentation-rules--프로젝트-문서-관리-rule) | 이관·안내 삭제(사용자 승인) |
| `docs/DOCUMENTATION-RULES.md#문서-역할` | [docs/reference/engineering/documentation.md#documentation-rules--문서-역할](../reference/engineering/documentation.md#documentation-rules--문서-역할) | 이관·안내 삭제(사용자 승인) |
| `docs/DOCUMENTATION-RULES.md#변경과-보존` | [docs/reference/engineering/documentation.md#documentation-rules--변경과-보존](../reference/engineering/documentation.md#documentation-rules--변경과-보존) | 이관·안내 삭제(사용자 승인) |
| `docs/DOCUMENTATION-RULES.md#문서-변경-검증` | [docs/reference/engineering/documentation.md#documentation-rules--문서-변경-검증](../reference/engineering/documentation.md#documentation-rules--문서-변경-검증) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/SCORE-PRODUCTION-PROCESS.md</summary>

원문 SHA-256: `ea29b77f26d32d30b08fa37f4b2d759a362a10b520a0a9bc336cd1f6e045378d`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#악보-제작-프로세스` | [docs/how-to/produce-score.md#score-production-process--악보-제작-프로세스](../how-to/produce-score.md#score-production-process--악보-제작-프로세스) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#시작-전에-읽을-문서` | [docs/how-to/produce-score.md#score-production-process--시작-전에-읽을-문서](../how-to/produce-score.md#score-production-process--시작-전에-읽을-문서) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#유튜브-참고-자료로-제작할-때` | [docs/how-to/produce-score.md#score-production-process--유튜브-참고-자료로-제작할-때](../how-to/produce-score.md#score-production-process--유튜브-참고-자료로-제작할-때) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#단계별-작업` | [docs/how-to/produce-score.md#score-production-process--단계별-작업](../how-to/produce-score.md#score-production-process--단계별-작업) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#1-자료-접수와-원본-보존` | [docs/how-to/produce-score.md#score-production-process--1-자료-접수와-원본-보존](../how-to/produce-score.md#score-production-process--1-자료-접수와-원본-보존) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#2-pdf-유형과-변환-경로-결정` | [docs/how-to/produce-score.md#score-production-process--2-pdf-유형과-변환-경로-결정](../how-to/produce-score.md#score-production-process--2-pdf-유형과-변환-경로-결정) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#3-musicxml-구조와-악기주법-교정` | [docs/how-to/produce-score.md#score-production-process--3-musicxml-구조와-악기주법-교정](../how-to/produce-score.md#score-production-process--3-musicxml-구조와-악기주법-교정) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#4-인쇄-가사-대조와-음악적-위치-저장` | [docs/how-to/correct-lyrics.md#score-production-process--4-인쇄-가사-대조와-음악적-위치-저장](../how-to/correct-lyrics.md#score-production-process--4-인쇄-가사-대조와-음악적-위치-저장) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#5-음원-첫-박bpm마디-시간-연결` | [docs/how-to/produce-score.md#score-production-process--5-음원-첫-박bpm마디-시간-연결](../how-to/produce-score.md#score-production-process--5-음원-첫-박bpm마디-시간-연결) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#첫-박카운트오프-검수표` | [docs/how-to/review-score.md#score-production-process--첫-박카운트오프-검수표](../how-to/review-score.md#score-production-process--첫-박카운트오프-검수표) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#6-svg-조판재생-캐시완성-패키지` | [docs/how-to/review-score.md#score-production-process--6-svg-조판재생-캐시완성-패키지](../how-to/review-score.md#score-production-process--6-svg-조판재생-캐시완성-패키지) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#7-실제-앱-수록본과-저장-곡-검수` | [docs/how-to/review-score.md#score-production-process--7-실제-앱-수록본과-저장-곡-검수](../how-to/review-score.md#score-production-process--7-실제-앱-수록본과-저장-곡-검수) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#8-결과-인계와-제작-종료` | [docs/how-to/produce-score.md#score-production-process--8-결과-인계와-제작-종료](../how-to/produce-score.md#score-production-process--8-결과-인계와-제작-종료) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#완료-판정과-필수-근거` | [docs/how-to/review-score.md#score-production-process--완료-판정과-필수-근거](../how-to/review-score.md#score-production-process--완료-판정과-필수-근거) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#기존-도구의-재사용-범위` | [docs/how-to/produce-score.md#score-production-process--기존-도구의-재사용-범위](../how-to/produce-score.md#score-production-process--기존-도구의-재사용-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#문제-조사와-과거-근거` | [docs/how-to/produce-score.md#score-production-process--문제-조사와-과거-근거](../how-to/produce-score.md#score-production-process--문제-조사와-과거-근거) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#첫-박카운트오프-상세-점검` | [docs/how-to/review-score.md#score-production-process--첫-박카운트오프-상세-점검](../how-to/review-score.md#score-production-process--첫-박카운트오프-상세-점검) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#이전-문단-링크` | [docs/how-to/produce-score.md#score-production-process--악보-제작-프로세스](../how-to/produce-score.md#score-production-process--악보-제작-프로세스) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#보컬-musicxml-입력` | [docs/how-to/correct-lyrics.md#score-production-process--보컬-musicxml-입력](../how-to/correct-lyrics.md#score-production-process--보컬-musicxml-입력) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#악기주법-선택과-보고` | [docs/how-to/produce-score.md#score-production-process--악기주법-선택과-보고](../how-to/produce-score.md#score-production-process--악기주법-선택과-보고) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#두-제작에서-확인한-근거와-재발-방지` | [docs/records/archive/musicxml-evaluation.md#score-process-evidence--이관-원문--score-production-processmd--15](archive/musicxml-evaluation.md#score-process-evidence--이관-원문--score-production-processmd--15) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SCORE-PRODUCTION-PROCESS.md#확인한-자료와-현재-미확인-사항--2026-10-04` | [docs/records/archive/musicxml-evaluation.md#score-process-evidence--이관-원문--score-production-processmd--16](archive/musicxml-evaluation.md#score-process-evidence--이관-원문--score-production-processmd--16) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md</summary>

원문 SHA-256: `c65563302de246776d0b27b11cd10460e68205f0b16033382183ccd6ef12a4f5`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md#제작-계측검수인계-재사용` | [docs/how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용](../how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md#도구-경계` | [docs/how-to/produce-score.md#reusable-production-workflow--도구-경계](../how-to/produce-score.md#reusable-production-workflow--도구-경계) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md#1-계측` | [docs/how-to/produce-score.md#reusable-production-workflow--1-계측](../how-to/produce-score.md#reusable-production-workflow--1-계측) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md#2-공통-검수-화면` | [docs/how-to/review-score.md#reusable-production-workflow--2-공통-검수-화면](../how-to/review-score.md#reusable-production-workflow--2-공통-검수-화면) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md#3-인계문` | [docs/how-to/produce-score.md#reusable-production-workflow--3-인계문](../how-to/produce-score.md#reusable-production-workflow--3-인계문) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md#근거와-이전-결과` | [docs/how-to/produce-score.md#reusable-production-workflow--근거와-이전-결과](../how-to/produce-score.md#reusable-production-workflow--근거와-이전-결과) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md#이전-문단-링크` | [docs/how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용](../how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md#검증-보존` | [docs/records/production-tools.md#production-tool-validation--이관-원문--reusable-production-workflowmd--6](production-tools.md#production-tool-validation--이관-원문--reusable-production-workflowmd--6) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md#2026-10-23-검증-결과` | [docs/records/production-tools.md#production-tool-validation--이관-원문--reusable-production-workflowmd--7](production-tools.md#production-tool-validation--이관-원문--reusable-production-workflowmd--7) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md#회고-중-확인한-집계-범위-보완` | [docs/records/production-tools.md#production-tool-validation--이관-원문--reusable-production-workflowmd--8](production-tools.md#production-tool-validation--이관-원문--reusable-production-workflowmd--8) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/procedures/SCORE-TOOLS.md</summary>

원문 SHA-256: `362383f7ecf78facd38447a298cb2cac039f76d5c5ed693057a0f0f537a4aa83`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/procedures/SCORE-TOOLS.md#공통-제작-도구-사용-절차` | [docs/how-to/produce-score.md#score-tools--공통-제작-도구-사용-절차](../how-to/produce-score.md#score-tools--공통-제작-도구-사용-절차) | 이관·안내 삭제(사용자 승인) |
| `docs/procedures/SCORE-TOOLS.md#새-곡에서-할-일` | [docs/how-to/produce-score.md#score-tools--새-곡에서-할-일](../how-to/produce-score.md#score-tools--새-곡에서-할-일) | 이관·안내 삭제(사용자 승인) |
| `docs/procedures/SCORE-TOOLS.md#실행-예시` | [docs/how-to/produce-score.md#score-tools--실행-예시](../how-to/produce-score.md#score-tools--실행-예시) | 이관·안내 삭제(사용자 승인) |
| `docs/procedures/SCORE-TOOLS.md#확인과-기록` | [docs/how-to/produce-score.md#score-tools--확인과-기록](../how-to/produce-score.md#score-tools--확인과-기록) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/procedures/PRACTICE-FILES.md</summary>

원문 SHA-256: `e3738ad21461ab2c93d81916f36eedf4141dfd6d17daae370ecc7c39c642394d`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/procedures/PRACTICE-FILES.md#완성-악보와-연습-정보-파일-사용-절차` | [docs/how-to/review-score.md#practice-files--완성-악보와-연습-정보-파일-사용-절차](../how-to/review-score.md#practice-files--완성-악보와-연습-정보-파일-사용-절차) | 이관·안내 삭제(사용자 승인) |
| `docs/procedures/PRACTICE-FILES.md#완성-악보` | [docs/how-to/review-score.md#practice-files--완성-악보](../how-to/review-score.md#practice-files--완성-악보) | 이관·안내 삭제(사용자 승인) |
| `docs/procedures/PRACTICE-FILES.md#사용자-음원-연습-정보` | [docs/how-to/review-score.md#practice-files--사용자-음원-연습-정보](../how-to/review-score.md#practice-files--사용자-음원-연습-정보) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/procedures/DRUM-AUDIO.md</summary>

원문 SHA-256: `7a51ba413b58ee9f4c7d86b908e9a40d30484392277f6dce1bc1f8ef69874f8a`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/procedures/DRUM-AUDIO.md#보존-드럼킷으로-음원-제작` | [docs/how-to/render-drum-audio.md#drum-audio--보존-드럼킷으로-음원-제작](../how-to/render-drum-audio.md#drum-audio--보존-드럼킷으로-음원-제작) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/procedures/I18N.md</summary>

원문 SHA-256: `3a7629deb0d7750da98cca2c5754dc64e2fbb30a01c5cd132ff5ed7ce4279ffc`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/procedures/I18N.md#앱-문구-변경-절차` | [docs/how-to/develop.md#i18n--앱-문구-변경-절차](../how-to/develop.md#i18n--앱-문구-변경-절차) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/operations/TESTING.md</summary>

원문 SHA-256: `c7f6625bd18c6b017db7e6769140006bb58c21f548e2a3096f4637e85fa780f1`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| [docs/operations/TESTING.md#개발-검사와-로컬-자산-준비](../operations/TESTING.md#개발-검사와-로컬-자산-준비) | [docs/how-to/verify.md#testing--개발-검사와-로컬-자산-준비](../how-to/verify.md#testing--개발-검사와-로컬-자산-준비) | 이관·기존 주소 보존 |
| [docs/operations/TESTING.md#실행-범위](../operations/TESTING.md#실행-범위) | [docs/how-to/verify.md#testing--실행-범위](../how-to/verify.md#testing--실행-범위) | 이관·기존 주소 보존 |
| [docs/operations/TESTING.md#공통-검사와-ci](../operations/TESTING.md#공통-검사와-ci) | [docs/how-to/verify.md#testing--공통-검사와-ci](../how-to/verify.md#testing--공통-검사와-ci) | 이관·기존 주소 보존 |
| [docs/operations/TESTING.md#eslint](../operations/TESTING.md#eslint) | [docs/how-to/verify.md#testing--eslint](../how-to/verify.md#testing--eslint) | 이관·기존 주소 보존 |
| [docs/operations/TESTING.md#로컬-자료](../operations/TESTING.md#로컬-자료) | [docs/how-to/verify.md#testing--로컬-자료](../how-to/verify.md#testing--로컬-자료) | 이관·기존 주소 보존 |
| [docs/operations/TESTING.md#호환성과-검사-범위](../operations/TESTING.md#호환성과-검사-범위) | [docs/how-to/verify.md#testing--호환성과-검사-범위](../how-to/verify.md#testing--호환성과-검사-범위) | 이관·기존 주소 보존 |
| [docs/operations/TESTING.md#곡-수록-후-개발-검증](../operations/TESTING.md#곡-수록-후-개발-검증) | [docs/how-to/verify.md#testing--곡-수록-후-개발-검증](../how-to/verify.md#testing--곡-수록-후-개발-검증) | 이관·기존 주소 보존 |
| [docs/operations/TESTING.md#safari의-실제-재생-시작](../operations/TESTING.md#safari의-실제-재생-시작) | [docs/how-to/verify.md#testing--safari의-실제-재생-시작](../how-to/verify.md#testing--safari의-실제-재생-시작) | 이관·기존 주소 보존 |
| [docs/operations/TESTING.md#수록-후-확인-순서](../operations/TESTING.md#수록-후-확인-순서) | [docs/how-to/verify.md#testing--수록-후-확인-순서](../how-to/verify.md#testing--수록-후-확인-순서) | 이관·기존 주소 보존 |
| [docs/operations/TESTING.md#제작-도구](../operations/TESTING.md#제작-도구) | [docs/how-to/verify.md#testing--제작-도구](../how-to/verify.md#testing--제작-도구) | 이관·기존 주소 보존 |

</details>

<details>
<summary>docs/procedures/UI-REVIEW.md</summary>

원문 SHA-256: `a61493e2f9afebbdec8baf465cc28e9c391d83468e27636e41889ae0509b40f7`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/procedures/UI-REVIEW.md#화면악보재생-검수-절차` | [docs/how-to/verify.md#ui-review--화면악보재생-검수-절차](../how-to/verify.md#ui-review--화면악보재생-검수-절차) | 이관·안내 삭제(사용자 승인) |
| `docs/procedures/UI-REVIEW.md#조판-회귀-대상` | [docs/how-to/review-score.md#ui-review--조판-회귀-대상](../how-to/review-score.md#ui-review--조판-회귀-대상) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/procedures/APP-VERSIONING.md</summary>

원문 SHA-256: `7ae863a7680bafb78845b97297606d0bcd96e7c0826c49318e3c8ebec7dbb7c5`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/procedures/APP-VERSIONING.md#앱-버전-갱신-절차` | [docs/how-to/release.md#app-versioning--앱-버전-갱신-절차](../how-to/release.md#app-versioning--앱-버전-갱신-절차) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/operations/SITES-PUBLICATION.md</summary>

원문 SHA-256: `745b499adc04068529ae4410fa885fc7366a32f28b566ee834411ab5926ef769`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/operations/SITES-PUBLICATION.md#sites-발행-절차` | [docs/how-to/release.md#sites-publication--sites-발행-절차](../how-to/release.md#sites-publication--sites-발행-절차) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#실행-대상` | [docs/how-to/release.md#sites-publication--실행-대상](../how-to/release.md#sites-publication--실행-대상) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#발행-순서` | [docs/how-to/release.md#sites-publication--발행-순서](../how-to/release.md#sites-publication--발행-순서) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-문단-링크` | [docs/how-to/release.md#sites-publication--sites-발행-절차](../how-to/release.md#sites-publication--sites-발행-절차) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#오픈소스-고지-생성과-확인` | [docs/how-to/release.md#sites-publication--오픈소스-고지-생성과-확인](../how-to/release.md#sites-publication--오픈소스-고지-생성과-확인) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#sites-발행` | [docs/decisions/0020-local-editor-and-public-player.md#이관-원문--sites-publicationmd--1](../decisions/0020-local-editor-and-public-player.md#이관-원문--sites-publicationmd--1) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#정본과-배포-구조` | [docs/decisions/0020-local-editor-and-public-player.md#이관-원문--sites-publicationmd--2](../decisions/0020-local-editor-and-public-player.md#이관-원문--sites-publicationmd--2) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#최신-발행--0812` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--4](releases.md#sites-publication-history--이관-원문--sites-publicationmd--4) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-발행--0811` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--5](releases.md#sites-publication-history--이관-원문--sites-publicationmd--5) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-발행--0810` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--6](releases.md#sites-publication-history--이관-원문--sites-publicationmd--6) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-발행--089` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--7](releases.md#sites-publication-history--이관-원문--sites-publicationmd--7) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-발행--088` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--8](releases.md#sites-publication-history--이관-원문--sites-publicationmd--8) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-발행--087` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--9](releases.md#sites-publication-history--이관-원문--sites-publicationmd--9) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-발행--086` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--10](releases.md#sites-publication-history--이관-원문--sites-publicationmd--10) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-발행--085` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--11](releases.md#sites-publication-history--이관-원문--sites-publicationmd--11) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-발행--084` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--12](releases.md#sites-publication-history--이관-원문--sites-publicationmd--12) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-발행--083` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--13](releases.md#sites-publication-history--이관-원문--sites-publicationmd--13) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-발행--082` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--14](releases.md#sites-publication-history--이관-원문--sites-publicationmd--14) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-발행--081` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--15](releases.md#sites-publication-history--이관-원문--sites-publicationmd--15) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-발행--080` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--16](releases.md#sites-publication-history--이관-원문--sites-publicationmd--16) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-발행--0712` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--17](releases.md#sites-publication-history--이관-원문--sites-publicationmd--17) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-발행--0711` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--18](releases.md#sites-publication-history--이관-원문--sites-publicationmd--18) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-발행--0710` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--19](releases.md#sites-publication-history--이관-원문--sites-publicationmd--19) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-발행--079` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--20](releases.md#sites-publication-history--이관-원문--sites-publicationmd--20) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#과거-발행-기록-당시-구조이며-현행-설계-아님` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--21](releases.md#sites-publication-history--이관-원문--sites-publicationmd--21) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#이전-발행--077` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--22](releases.md#sites-publication-history--이관-원문--sites-publicationmd--22) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#로컬-용량-정리--2026-10-13` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--23](releases.md#sites-publication-history--이관-원문--sites-publicationmd--23) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#분석정보-검토-경계-078-2026-10-14-발행` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--24](releases.md#sites-publication-history--이관-원문--sites-publicationmd--24) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#html-보안-헤더-전달` | [docs/decisions/0020-local-editor-and-public-player.md#이관-원문--sites-publicationmd--25](../decisions/0020-local-editor-and-public-player.md#이관-원문--sites-publicationmd--25) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/SITES-PUBLICATION.md#최근-확인된-발행--078` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--26](releases.md#sites-publication-history--이관-원문--sites-publicationmd--26) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/operations/IPAD-SIMULATOR.md</summary>

원문 SHA-256: `302aef8a77b5b0b3ea1f1c3e1f361475b2eea2ceb7664448c26c74887092ad7e`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/operations/IPAD-SIMULATOR.md#ipad-mini-검증-실행-절차` | [docs/how-to/verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차](../how-to/verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-SIMULATOR.md#기록된-대상과-사전-확인` | [docs/how-to/verify-ipad.md#ipad-simulator--기록된-대상과-사전-확인](../how-to/verify-ipad.md#ipad-simulator--기록된-대상과-사전-확인) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-SIMULATOR.md#승인-범위-내-cli-예` | [docs/how-to/verify-ipad.md#ipad-simulator--승인-범위-내-cli-예](../how-to/verify-ipad.md#ipad-simulator--승인-범위-내-cli-예) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-SIMULATOR.md#승인과-증거의-한계` | [docs/how-to/verify-ipad.md#ipad-simulator--승인과-증거의-한계](../how-to/verify-ipad.md#ipad-simulator--승인과-증거의-한계) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-SIMULATOR.md#이전-문단-링크` | [docs/how-to/verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차](../how-to/verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-SIMULATOR.md#ipad-mini-검증-환경` | [docs/records/ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--1](ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--1) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-SIMULATOR.md#device-hub-재시작-및-제어-경로-2026-09-18` | [docs/records/ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--2](ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--2) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-SIMULATOR.md#승인-후-재검사` | [docs/records/ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--3](ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--3) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-SIMULATOR.md#ios-27-설치-완료-2026-09-18` | [docs/records/ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--4](ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--4) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-SIMULATOR.md#ios-27-mcp-터치-검증-성공-2026-09-18` | [docs/records/ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--5](ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--5) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-SIMULATOR.md#device-hub-제어-승인-유효기간-2026-09-20` | [docs/records/ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--6](ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--6) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/operations/APPLE-LOCAL-WORKFLOW.md</summary>

원문 SHA-256: `32f559b6ae89ee4e5ceb59873e3e2d8e0ee6a9775a1aeb6d813de853d1c03576`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/operations/APPLE-LOCAL-WORKFLOW.md#apple-로컬-검토-실행-절차` | [docs/how-to/use-apple-local-tools.md#apple-local-workflow--apple-로컬-검토-실행-절차](../how-to/use-apple-local-tools.md#apple-local-workflow--apple-로컬-검토-실행-절차) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APPLE-LOCAL-WORKFLOW.md#실행` | [docs/how-to/use-apple-local-tools.md#apple-local-workflow--실행](../how-to/use-apple-local-tools.md#apple-local-workflow--실행) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APPLE-LOCAL-WORKFLOW.md#확인과-종료` | [docs/how-to/use-apple-local-tools.md#apple-local-workflow--확인과-종료](../how-to/use-apple-local-tools.md#apple-local-workflow--확인과-종료) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APPLE-LOCAL-WORKFLOW.md#이전-문단-링크` | [docs/how-to/use-apple-local-tools.md#apple-local-workflow--apple-로컬-검토-실행-절차](../how-to/use-apple-local-tools.md#apple-local-workflow--apple-로컬-검토-실행-절차) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APPLE-LOCAL-WORKFLOW.md#청취-앵커-입력` | [docs/how-to/use-apple-local-tools.md#apple-local-workflow--청취-앵커-입력](../how-to/use-apple-local-tools.md#apple-local-workflow--청취-앵커-입력) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APPLE-LOCAL-WORKFLOW.md#apple-로컬-전처리--검토-워크플로우` | [docs/decisions/0013-score-based-lyric-positions.md#이관-원문--apple-local-workflowmd--1](../decisions/0013-score-based-lyric-positions.md#이관-원문--apple-local-workflowmd--1) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APPLE-LOCAL-WORKFLOW.md#역할과-완료-조건` | [docs/decisions/0013-score-based-lyric-positions.md#이관-원문--apple-local-workflowmd--2](../decisions/0013-score-based-lyric-positions.md#이관-원문--apple-local-workflowmd--2) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APPLE-LOCAL-WORKFLOW.md#산출물과-검사` | [docs/decisions/0013-score-based-lyric-positions.md#이관-원문--apple-local-workflowmd--4](../decisions/0013-score-based-lyric-positions.md#이관-원문--apple-local-workflowmd--4) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APPLE-LOCAL-WORKFLOW.md#이-곡의-실제-실행-및-후처리` | [docs/records/apple-local-tools.md#apple-local-review-history--이관-원문--apple-local-workflowmd--5](apple-local-tools.md#apple-local-review-history--이관-원문--apple-local-workflowmd--5) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/APPLE-LOCAL-WORKFLOW.md#경계-오류-재검사--15마디-사례-반영` | [docs/records/apple-local-tools.md#apple-local-review-history--이관-원문--apple-local-workflowmd--6](apple-local-tools.md#apple-local-review-history--이관-원문--apple-local-workflowmd--6) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/operations/acceptance.md</summary>

원문 SHA-256: `b3b90fa7e82b530e3ff9815d92670345f0f028215cd690cbec9d48bcbe27fcbd`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/operations/acceptance.md#검증-현황` | [docs/records/acceptance.md#acceptance--검증-현황](acceptance.md#acceptance--검증-현황) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/acceptance.md#0712--붉은-노을-ipad-실기기-사용자-확인` | [docs/records/acceptance.md#acceptance--0712--붉은-노을-ipad-실기기-사용자-확인](acceptance.md#acceptance--0712--붉은-노을-ipad-실기기-사용자-확인) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/acceptance.md#0711--ipad-실기기-사용자-확인` | [docs/records/acceptance.md#acceptance--0711--ipad-실기기-사용자-확인](acceptance.md#acceptance--0711--ipad-실기기-사용자-확인) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/acceptance.md#076--과거-검증-기록-2026-10-13` | [docs/records/acceptance.md#acceptance--076--과거-검증-기록-2026-10-13](acceptance.md#acceptance--076--과거-검증-기록-2026-10-13) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/acceptance.md#당시-릴리스-근거` | [docs/records/acceptance.md#acceptance--당시-릴리스-근거](acceptance.md#acceptance--당시-릴리스-근거) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/acceptance.md#남은-확인-범위` | [docs/records/acceptance.md#acceptance--남은-확인-범위](acceptance.md#acceptance--남은-확인-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/acceptance.md#과거-검사-취급` | [docs/records/acceptance.md#acceptance--과거-검사-취급](acceptance.md#acceptance--과거-검사-취급) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/acceptance.md#실험-자료-정리-중-실행-결과` | [docs/records/acceptance.md#acceptance--실험-자료-정리-중-실행-결과](acceptance.md#acceptance--실험-자료-정리-중-실행-결과) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/records/APP-VERSION-HISTORY.md</summary>

원문 SHA-256: `9af67585bdbcfa32c2ec771d304f9df2a4e25f3312ba605ac0d6dc83fd7d5ac9`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/records/APP-VERSION-HISTORY.md#앱-릴리스-번호와-정정-기록` | [docs/records/releases.md#app-version-history--앱-릴리스-번호와-정정-기록](releases.md#app-version-history--앱-릴리스-번호와-정정-기록) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#이관-원문--app-versionsmd--1` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--1](releases.md#app-version-history--이관-원문--app-versionsmd--1) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#앱-공통-버전` | [docs/records/releases.md#app-version-history--앱-공통-버전](releases.md#app-version-history--앱-공통-버전) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#이관-원문--app-versionsmd--2` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--2](releases.md#app-version-history--이관-원문--app-versionsmd--2) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#2026-10-13-정정-대응표` | [docs/records/releases.md#app-version-history--2026-10-13-정정-대응표](releases.md#app-version-history--2026-10-13-정정-대응표) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#이관-원문--app-versionsmd--3` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--3](releases.md#app-version-history--이관-원문--app-versionsmd--3) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#현재-발행-상태와-증가-시점` | [docs/records/releases.md#app-version-history--현재-발행-상태와-증가-시점](releases.md#app-version-history--현재-발행-상태와-증가-시점) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#이관-원문--app-versionsmd--4` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--4](releases.md#app-version-history--이관-원문--app-versionsmd--4) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#077--코드-및-프로젝트-정리` | [docs/records/releases.md#app-version-history--077--코드-및-프로젝트-정리](releases.md#app-version-history--077--코드-및-프로젝트-정리) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#이관-원문--app-versionsmd--5` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--5](releases.md#app-version-history--이관-원문--app-versionsmd--5) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#078--음원-분석정보-보안운영-보강` | [docs/records/releases.md#app-version-history--078--음원-분석정보-보안운영-보강](releases.md#app-version-history--078--음원-분석정보-보안운영-보강) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#이관-원문--app-versionsmd--6` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--6](releases.md#app-version-history--이관-원문--app-versionsmd--6) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#079--음원-분석의-기기-내부-처리` | [docs/records/releases.md#app-version-history--079--음원-분석의-기기-내부-처리](releases.md#app-version-history--079--음원-분석의-기기-내부-처리) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#이관-원문--app-versionsmd--7` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--7](releases.md#app-version-history--이관-원문--app-versionsmd--7) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#0710--음원-태그재생-레이아웃오류-안내-개선` | [docs/records/releases.md#app-version-history--0710--음원-태그재생-레이아웃오류-안내-개선](releases.md#app-version-history--0710--음원-태그재생-레이아웃오류-안내-개선) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#이관-원문--app-versionsmd--8` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--8](releases.md#app-version-history--이관-원문--app-versionsmd--8) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#0711--태블릿-하단-버튼판-높이-개선` | [docs/records/releases.md#app-version-history--0711--태블릿-하단-버튼판-높이-개선](releases.md#app-version-history--0711--태블릿-하단-버튼판-높이-개선) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#이관-원문--app-versionsmd--9` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--9](releases.md#app-version-history--이관-원문--app-versionsmd--9) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#0712--붉은-노을-악보와-박별-재생-보완` | [docs/records/releases.md#app-version-history--0712--붉은-노을-악보와-박별-재생-보완](releases.md#app-version-history--0712--붉은-노을-악보와-박별-재생-보완) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#이관-원문--app-versionsmd--10` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--10](releases.md#app-version-history--이관-원문--app-versionsmd--10) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#080--사용자-설정-백업복원` | [docs/records/releases.md#app-version-history--080--사용자-설정-백업복원](releases.md#app-version-history--080--사용자-설정-백업복원) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#이관-원문--app-versionsmd--11` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--11](releases.md#app-version-history--이관-원문--app-versionsmd--11) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#081-릴리스` | [docs/records/releases.md#app-version-history--081-릴리스](releases.md#app-version-history--081-릴리스) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#이관-원문--app-versionsmd--12` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--12](releases.md#app-version-history--이관-원문--app-versionsmd--12) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#082--bpm-프리셋과-버튼-길게-누르기-보완` | [docs/records/releases.md#app-version-history--082--bpm-프리셋과-버튼-길게-누르기-보완](releases.md#app-version-history--082--bpm-프리셋과-버튼-길게-누르기-보완) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#이관-원문--app-versionsmd--13` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--13](releases.md#app-version-history--이관-원문--app-versionsmd--13) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#083--모달-닫기와-bpm-프리셋-올림` | [docs/records/releases.md#app-version-history--083--모달-닫기와-bpm-프리셋-올림](releases.md#app-version-history--083--모달-닫기와-bpm-프리셋-올림) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#이관-원문--app-versionsmd--14` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--14](releases.md#app-version-history--이관-원문--app-versionsmd--14) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#084--프로젝트-구조-개편` | [docs/records/releases.md#app-version-history--084--프로젝트-구조-개편](releases.md#app-version-history--084--프로젝트-구조-개편) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#이관-원문--app-versionsmd--15` | [docs/records/releases.md#app-version-history--이관-원문--app-versionsmd--15](releases.md#app-version-history--이관-원문--app-versionsmd--15) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APP-VERSION-HISTORY.md#085--공통-목록과-제작기-화면-개선` | [docs/records/releases.md#app-version-history--085--공통-목록과-제작기-화면-개선](releases.md#app-version-history--085--공통-목록과-제작기-화면-개선) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/records/SITES-PUBLICATION-HISTORY.md</summary>

원문 SHA-256: `e14f87c6bbe7a3a09960fe0767b0e2161a85862ac6bb1817878556b5fdffb1c7`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/records/SITES-PUBLICATION-HISTORY.md#sites-발행공개-확인-기록` | [docs/records/releases.md#sites-publication-history--sites-발행공개-확인-기록](releases.md#sites-publication-history--sites-발행공개-확인-기록) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--4` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--4](releases.md#sites-publication-history--이관-원문--sites-publicationmd--4) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#최신-발행--0812` | [docs/records/releases.md#sites-publication-history--최신-발행--0812](releases.md#sites-publication-history--최신-발행--0812) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--5` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--5](releases.md#sites-publication-history--이관-원문--sites-publicationmd--5) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이전-발행--0811` | [docs/records/releases.md#sites-publication-history--이전-발행--0811](releases.md#sites-publication-history--이전-발행--0811) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--6` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--6](releases.md#sites-publication-history--이관-원문--sites-publicationmd--6) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이전-발행--0810` | [docs/records/releases.md#sites-publication-history--이전-발행--0810](releases.md#sites-publication-history--이전-발행--0810) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--7` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--7](releases.md#sites-publication-history--이관-원문--sites-publicationmd--7) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이전-발행--089` | [docs/records/releases.md#sites-publication-history--이전-발행--089](releases.md#sites-publication-history--이전-발행--089) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--8` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--8](releases.md#sites-publication-history--이관-원문--sites-publicationmd--8) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이전-발행--088` | [docs/records/releases.md#sites-publication-history--이전-발행--088](releases.md#sites-publication-history--이전-발행--088) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--9` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--9](releases.md#sites-publication-history--이관-원문--sites-publicationmd--9) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이전-발행--087` | [docs/records/releases.md#sites-publication-history--이전-발행--087](releases.md#sites-publication-history--이전-발행--087) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--10` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--10](releases.md#sites-publication-history--이관-원문--sites-publicationmd--10) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이전-발행--086` | [docs/records/releases.md#sites-publication-history--이전-발행--086](releases.md#sites-publication-history--이전-발행--086) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--11` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--11](releases.md#sites-publication-history--이관-원문--sites-publicationmd--11) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이전-발행--085` | [docs/records/releases.md#sites-publication-history--이전-발행--085](releases.md#sites-publication-history--이전-발행--085) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--12` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--12](releases.md#sites-publication-history--이관-원문--sites-publicationmd--12) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이전-발행--084` | [docs/records/releases.md#sites-publication-history--이전-발행--084](releases.md#sites-publication-history--이전-발행--084) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--13` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--13](releases.md#sites-publication-history--이관-원문--sites-publicationmd--13) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이전-발행--083` | [docs/records/releases.md#sites-publication-history--이전-발행--083](releases.md#sites-publication-history--이전-발행--083) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--14` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--14](releases.md#sites-publication-history--이관-원문--sites-publicationmd--14) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이전-발행--082` | [docs/records/releases.md#sites-publication-history--이전-발행--082](releases.md#sites-publication-history--이전-발행--082) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--15` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--15](releases.md#sites-publication-history--이관-원문--sites-publicationmd--15) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이전-발행--081` | [docs/records/releases.md#sites-publication-history--이전-발행--081](releases.md#sites-publication-history--이전-발행--081) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--16` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--16](releases.md#sites-publication-history--이관-원문--sites-publicationmd--16) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이전-발행--080` | [docs/records/releases.md#sites-publication-history--이전-발행--080](releases.md#sites-publication-history--이전-발행--080) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--17` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--17](releases.md#sites-publication-history--이관-원문--sites-publicationmd--17) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이전-발행--0712` | [docs/records/releases.md#sites-publication-history--이전-발행--0712](releases.md#sites-publication-history--이전-발행--0712) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--18` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--18](releases.md#sites-publication-history--이관-원문--sites-publicationmd--18) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이전-발행--0711` | [docs/records/releases.md#sites-publication-history--이전-발행--0711](releases.md#sites-publication-history--이전-발행--0711) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--19` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--19](releases.md#sites-publication-history--이관-원문--sites-publicationmd--19) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이전-발행--0710` | [docs/records/releases.md#sites-publication-history--이전-발행--0710](releases.md#sites-publication-history--이전-발행--0710) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--20` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--20](releases.md#sites-publication-history--이관-원문--sites-publicationmd--20) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이전-발행--079` | [docs/records/releases.md#sites-publication-history--이전-발행--079](releases.md#sites-publication-history--이전-발행--079) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--21` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--21](releases.md#sites-publication-history--이관-원문--sites-publicationmd--21) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#과거-발행-기록-당시-구조이며-현행-설계-아님` | [docs/records/releases.md#sites-publication-history--과거-발행-기록-당시-구조이며-현행-설계-아님](releases.md#sites-publication-history--과거-발행-기록-당시-구조이며-현행-설계-아님) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--22` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--22](releases.md#sites-publication-history--이관-원문--sites-publicationmd--22) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이전-발행--077` | [docs/records/releases.md#sites-publication-history--이전-발행--077](releases.md#sites-publication-history--이전-발행--077) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--23` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--23](releases.md#sites-publication-history--이관-원문--sites-publicationmd--23) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#로컬-용량-정리--2026-10-13` | [docs/records/releases.md#sites-publication-history--로컬-용량-정리--2026-10-13](releases.md#sites-publication-history--로컬-용량-정리--2026-10-13) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--24` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--24](releases.md#sites-publication-history--이관-원문--sites-publicationmd--24) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#분석정보-검토-경계-078-2026-10-14-발행` | [docs/records/releases.md#sites-publication-history--분석정보-검토-경계-078-2026-10-14-발행](releases.md#sites-publication-history--분석정보-검토-경계-078-2026-10-14-발행) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#이관-원문--sites-publicationmd--26` | [docs/records/releases.md#sites-publication-history--이관-원문--sites-publicationmd--26](releases.md#sites-publication-history--이관-원문--sites-publicationmd--26) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#최근-확인된-발행--078` | [docs/records/releases.md#sites-publication-history--최근-확인된-발행--078](releases.md#sites-publication-history--최근-확인된-발행--078) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SITES-PUBLICATION-HISTORY.md#rule-재점검-원문--site-security-hardeningmd--4` | [docs/records/releases.md#sites-publication-history--rule-재점검-원문--site-security-hardeningmd--4](releases.md#sites-publication-history--rule-재점검-원문--site-security-hardeningmd--4) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/records/PRODUCTION-TOOL-VALIDATION.md</summary>

원문 SHA-256: `48f02560c911c698fee1c41e0e7ccb4b03966bd7879cbaea12eacab9ccdde050`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/records/PRODUCTION-TOOL-VALIDATION.md#공통-제작-도구-검증계측-기록` | [docs/records/production-tools.md#production-tool-validation--공통-제작-도구-검증계측-기록](production-tools.md#production-tool-validation--공통-제작-도구-검증계측-기록) | 이관·안내 삭제(사용자 승인) |
| `docs/records/PRODUCTION-TOOL-VALIDATION.md#이관-원문--common-toolsmd--7` | [docs/records/production-tools.md#production-tool-validation--이관-원문--common-toolsmd--7](production-tools.md#production-tool-validation--이관-원문--common-toolsmd--7) | 이관·안내 삭제(사용자 승인) |
| `docs/records/PRODUCTION-TOOL-VALIDATION.md#검증-결과--2026-10-23` | [docs/records/production-tools.md#production-tool-validation--검증-결과--2026-10-23](production-tools.md#production-tool-validation--검증-결과--2026-10-23) | 이관·안내 삭제(사용자 승인) |
| `docs/records/PRODUCTION-TOOL-VALIDATION.md#이관-원문--common-toolsmd--8` | [docs/records/production-tools.md#production-tool-validation--이관-원문--common-toolsmd--8](production-tools.md#production-tool-validation--이관-원문--common-toolsmd--8) | 이관·안내 삭제(사용자 승인) |
| `docs/records/PRODUCTION-TOOL-VALIDATION.md#검증-중-확인한-재현-조건` | [docs/records/production-tools.md#production-tool-validation--검증-중-확인한-재현-조건](production-tools.md#production-tool-validation--검증-중-확인한-재현-조건) | 이관·안내 삭제(사용자 승인) |
| `docs/records/PRODUCTION-TOOL-VALIDATION.md#이관-원문--reusable-production-workflowmd--6` | [docs/records/production-tools.md#production-tool-validation--이관-원문--reusable-production-workflowmd--6](production-tools.md#production-tool-validation--이관-원문--reusable-production-workflowmd--6) | 이관·안내 삭제(사용자 승인) |
| `docs/records/PRODUCTION-TOOL-VALIDATION.md#검증-보존` | [docs/records/production-tools.md#production-tool-validation--검증-보존](production-tools.md#production-tool-validation--검증-보존) | 이관·안내 삭제(사용자 승인) |
| `docs/records/PRODUCTION-TOOL-VALIDATION.md#이관-원문--reusable-production-workflowmd--7` | [docs/records/production-tools.md#production-tool-validation--이관-원문--reusable-production-workflowmd--7](production-tools.md#production-tool-validation--이관-원문--reusable-production-workflowmd--7) | 이관·안내 삭제(사용자 승인) |
| `docs/records/PRODUCTION-TOOL-VALIDATION.md#2026-10-23-검증-결과` | [docs/records/production-tools.md#production-tool-validation--2026-10-23-검증-결과](production-tools.md#production-tool-validation--2026-10-23-검증-결과) | 이관·안내 삭제(사용자 승인) |
| `docs/records/PRODUCTION-TOOL-VALIDATION.md#이관-원문--reusable-production-workflowmd--8` | [docs/records/production-tools.md#production-tool-validation--이관-원문--reusable-production-workflowmd--8](production-tools.md#production-tool-validation--이관-원문--reusable-production-workflowmd--8) | 이관·안내 삭제(사용자 승인) |
| `docs/records/PRODUCTION-TOOL-VALIDATION.md#회고-중-확인한-집계-범위-보완` | [docs/records/production-tools.md#production-tool-validation--회고-중-확인한-집계-범위-보완](production-tools.md#production-tool-validation--회고-중-확인한-집계-범위-보완) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/records/APPLE-LOCAL-REVIEW-HISTORY.md</summary>

원문 SHA-256: `f87f5225ea42516a4dfa50373a8a26705ddee8ebc20410b2e0ec3c6907e9fad3`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/records/APPLE-LOCAL-REVIEW-HISTORY.md#apple-로컬-가사-검토-실측-기록` | [docs/records/apple-local-tools.md#apple-local-review-history--apple-로컬-가사-검토-실측-기록](apple-local-tools.md#apple-local-review-history--apple-로컬-가사-검토-실측-기록) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APPLE-LOCAL-REVIEW-HISTORY.md#이관-원문--apple-local-workflowmd--5` | [docs/records/apple-local-tools.md#apple-local-review-history--이관-원문--apple-local-workflowmd--5](apple-local-tools.md#apple-local-review-history--이관-원문--apple-local-workflowmd--5) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APPLE-LOCAL-REVIEW-HISTORY.md#이-곡의-실제-실행-및-후처리` | [docs/records/apple-local-tools.md#apple-local-review-history--이-곡의-실제-실행-및-후처리](apple-local-tools.md#apple-local-review-history--이-곡의-실제-실행-및-후처리) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APPLE-LOCAL-REVIEW-HISTORY.md#이관-원문--apple-local-workflowmd--6` | [docs/records/apple-local-tools.md#apple-local-review-history--이관-원문--apple-local-workflowmd--6](apple-local-tools.md#apple-local-review-history--이관-원문--apple-local-workflowmd--6) | 이관·안내 삭제(사용자 승인) |
| `docs/records/APPLE-LOCAL-REVIEW-HISTORY.md#경계-오류-재검사--15마디-사례-반영` | [docs/records/apple-local-tools.md#apple-local-review-history--경계-오류-재검사--15마디-사례-반영](apple-local-tools.md#apple-local-review-history--경계-오류-재검사--15마디-사례-반영) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/records/IPAD-SIMULATOR-HISTORY.md</summary>

원문 SHA-256: `e4b8cd262b1d525772d3a352d2b03f8ecd20fdaaa1edda2dd60f6cd50acd822a`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/records/IPAD-SIMULATOR-HISTORY.md#ipad-시뮬레이터-설치연결-기록` | [docs/records/ipad.md#ipad-simulator-history--ipad-시뮬레이터-설치연결-기록](ipad.md#ipad-simulator-history--ipad-시뮬레이터-설치연결-기록) | 이관·안내 삭제(사용자 승인) |
| `docs/records/IPAD-SIMULATOR-HISTORY.md#이관-원문--ipad-simulatormd--1` | [docs/records/ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--1](ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--1) | 이관·안내 삭제(사용자 승인) |
| `docs/records/IPAD-SIMULATOR-HISTORY.md#ipad-mini-검증-환경` | [docs/records/ipad.md#ipad-simulator-history--ipad-mini-검증-환경](ipad.md#ipad-simulator-history--ipad-mini-검증-환경) | 이관·안내 삭제(사용자 승인) |
| `docs/records/IPAD-SIMULATOR-HISTORY.md#이관-원문--ipad-simulatormd--2` | [docs/records/ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--2](ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--2) | 이관·안내 삭제(사용자 승인) |
| `docs/records/IPAD-SIMULATOR-HISTORY.md#device-hub-재시작-및-제어-경로-2026-09-18` | [docs/records/ipad.md#ipad-simulator-history--device-hub-재시작-및-제어-경로-2026-09-18](ipad.md#ipad-simulator-history--device-hub-재시작-및-제어-경로-2026-09-18) | 이관·안내 삭제(사용자 승인) |
| `docs/records/IPAD-SIMULATOR-HISTORY.md#이관-원문--ipad-simulatormd--3` | [docs/records/ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--3](ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--3) | 이관·안내 삭제(사용자 승인) |
| `docs/records/IPAD-SIMULATOR-HISTORY.md#승인-후-재검사` | [docs/records/ipad.md#ipad-simulator-history--승인-후-재검사](ipad.md#ipad-simulator-history--승인-후-재검사) | 이관·안내 삭제(사용자 승인) |
| `docs/records/IPAD-SIMULATOR-HISTORY.md#이관-원문--ipad-simulatormd--4` | [docs/records/ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--4](ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--4) | 이관·안내 삭제(사용자 승인) |
| `docs/records/IPAD-SIMULATOR-HISTORY.md#ios-27-설치-완료-2026-09-18` | [docs/records/ipad.md#ipad-simulator-history--ios-27-설치-완료-2026-09-18](ipad.md#ipad-simulator-history--ios-27-설치-완료-2026-09-18) | 이관·안내 삭제(사용자 승인) |
| `docs/records/IPAD-SIMULATOR-HISTORY.md#이관-원문--ipad-simulatormd--5` | [docs/records/ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--5](ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--5) | 이관·안내 삭제(사용자 승인) |
| `docs/records/IPAD-SIMULATOR-HISTORY.md#ios-27-mcp-터치-검증-성공-2026-09-18` | [docs/records/ipad.md#ipad-simulator-history--ios-27-mcp-터치-검증-성공-2026-09-18](ipad.md#ipad-simulator-history--ios-27-mcp-터치-검증-성공-2026-09-18) | 이관·안내 삭제(사용자 승인) |
| `docs/records/IPAD-SIMULATOR-HISTORY.md#이관-원문--ipad-simulatormd--6` | [docs/records/ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--6](ipad.md#ipad-simulator-history--이관-원문--ipad-simulatormd--6) | 이관·안내 삭제(사용자 승인) |
| `docs/records/IPAD-SIMULATOR-HISTORY.md#device-hub-제어-승인-유효기간-2026-09-20` | [docs/records/ipad.md#ipad-simulator-history--device-hub-제어-승인-유효기간-2026-09-20](ipad.md#ipad-simulator-history--device-hub-제어-승인-유효기간-2026-09-20) | 이관·안내 삭제(사용자 승인) |
| `docs/records/IPAD-SIMULATOR-HISTORY.md#rule-재점검-원문--ux-principlesmd--11` | [docs/records/ipad.md#ipad-simulator-history--rule-재점검-원문--ux-principlesmd--11](ipad.md#ipad-simulator-history--rule-재점검-원문--ux-principlesmd--11) | 이관·안내 삭제(사용자 승인) |
| `docs/records/IPAD-SIMULATOR-HISTORY.md#rule-재점검-원문--audio-practicemd--12` | [docs/records/ipad.md#ipad-simulator-history--rule-재점검-원문--audio-practicemd--12](ipad.md#ipad-simulator-history--rule-재점검-원문--audio-practicemd--12) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/operations/IPAD-STATUS-BAR-DIAGNOSIS.md</summary>

원문 SHA-256: `45527df9f2072abd29cfe83c08fc92a5ce7437d629f290f7dc3d6d423f263c4a`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/operations/IPAD-STATUS-BAR-DIAGNOSIS.md#ipad-상태바-배색제목-흐림-재조사` | [docs/records/ipad.md#ipad-status-bar-diagnosis--ipad-상태바-배색제목-흐림-재조사](ipad.md#ipad-status-bar-diagnosis--ipad-상태바-배색제목-흐림-재조사) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-STATUS-BAR-DIAGNOSIS.md#확인한-사실` | [docs/records/ipad.md#ipad-status-bar-diagnosis--확인한-사실](ipad.md#ipad-status-bar-diagnosis--확인한-사실) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-STATUS-BAR-DIAGNOSIS.md#엔진-근거와-한계` | [docs/records/ipad.md#ipad-status-bar-diagnosis--엔진-근거와-한계](ipad.md#ipad-status-bar-diagnosis--엔진-근거와-한계) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-STATUS-BAR-DIAGNOSIS.md#대책-변수를-분리한-실기기-비교` | [docs/records/ipad.md#ipad-status-bar-diagnosis--대책-변수를-분리한-실기기-비교](ipad.md#ipad-status-bar-diagnosis--대책-변수를-분리한-실기기-비교) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-STATUS-BAR-DIAGNOSIS.md#사용자-추가-제안에-따른-비교-2026-10-04` | [docs/records/ipad.md#ipad-status-bar-diagnosis--사용자-추가-제안에-따른-비교-2026-10-04](ipad.md#ipad-status-bar-diagnosis--사용자-추가-제안에-따른-비교-2026-10-04) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-STATUS-BAR-DIAGNOSIS.md#0610--cover-단일-변수-비교` | [docs/records/ipad.md#ipad-status-bar-diagnosis--0610--cover-단일-변수-비교](ipad.md#ipad-status-bar-diagnosis--0610--cover-단일-변수-비교) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-STATUS-BAR-DIAGNOSIS.md#0612--production-css-갱신-시점-대조-2026-10-04` | [docs/records/ipad.md#ipad-status-bar-diagnosis--0612--production-css-갱신-시점-대조-2026-10-04](ipad.md#ipad-status-bar-diagnosis--0612--production-css-갱신-시점-대조-2026-10-04) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-STATUS-BAR-DIAGNOSIS.md#0613--세로-첫-진입-추가-대조` | [docs/records/ipad.md#ipad-status-bar-diagnosis--0613--세로-첫-진입-추가-대조](ipad.md#ipad-status-bar-diagnosis--0613--세로-첫-진입-추가-대조) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/IPAD-STATUS-BAR-DIAGNOSIS.md#2026-10-04-0614-sampled-header-identity-유지` | [docs/records/ipad.md#ipad-status-bar-diagnosis--2026-10-04-0614-sampled-header-identity-유지](ipad.md#ipad-status-bar-diagnosis--2026-10-04-0614-sampled-header-identity-유지) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/records/DOCUMENTATION-RECONCILIATION-20261023.md</summary>

원문 SHA-256: `13c800081658c5edba17d58b980ed6dc058ed567873235cf35529a23dbbab274`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/records/DOCUMENTATION-RECONCILIATION-20261023.md#문서-모순역할-정리-근거--2026-10-23` | [docs/records/documentation.md#documentation-reconciliation-20261023--문서-모순역할-정리-근거--2026-10-23](documentation.md#documentation-reconciliation-20261023--문서-모순역할-정리-근거--2026-10-23) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/records/RULE-DOCUMENTATION-VERIFICATION-20261023.md</summary>

원문 SHA-256: `963e12035f983bdaede11d2f1a3d6620b72d0aed92a5d5422c290b0d5632a7b3`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/records/RULE-DOCUMENTATION-VERIFICATION-20261023.md#프로젝트-rule-문서-정리-검증--2026-10-23` | [docs/records/documentation.md#rule-documentation-verification-20261023--프로젝트-rule-문서-정리-검증--2026-10-23](documentation.md#rule-documentation-verification-20261023--프로젝트-rule-문서-정리-검증--2026-10-23) | 이관·안내 삭제(사용자 승인) |
| `docs/records/RULE-DOCUMENTATION-VERIFICATION-20261023.md#결과와-범위` | [docs/records/documentation.md#rule-documentation-verification-20261023--결과와-범위](documentation.md#rule-documentation-verification-20261023--결과와-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/records/RULE-DOCUMENTATION-VERIFICATION-20261023.md#보존-검사` | [docs/records/documentation.md#rule-documentation-verification-20261023--보존-검사](documentation.md#rule-documentation-verification-20261023--보존-검사) | 이관·안내 삭제(사용자 승인) |
| `docs/records/RULE-DOCUMENTATION-VERIFICATION-20261023.md#실행한-문서-검사` | [docs/records/documentation.md#rule-documentation-verification-20261023--실행한-문서-검사](documentation.md#rule-documentation-verification-20261023--실행한-문서-검사) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/records/RULE-RESIDUE-AUDIT-20261023.md</summary>

원문 SHA-256: `9356051604cfa0550080d0e7e66061aebeefd7e948f011a5e3bfb5b28fcb16c9`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/records/RULE-RESIDUE-AUDIT-20261023.md#현행-rule-잔여-이력-재점검--2026-10-23` | [docs/records/documentation.md#rule-residue-audit-20261023--현행-rule-잔여-이력-재점검--2026-10-23](documentation.md#rule-residue-audit-20261023--현행-rule-잔여-이력-재점검--2026-10-23) | 이관·안내 삭제(사용자 승인) |
| `docs/records/RULE-RESIDUE-AUDIT-20261023.md#판정-기준` | [docs/records/documentation.md#rule-residue-audit-20261023--판정-기준](documentation.md#rule-residue-audit-20261023--판정-기준) | 이관·안내 삭제(사용자 승인) |
| `docs/records/RULE-RESIDUE-AUDIT-20261023.md#파일별-확인` | [docs/records/documentation.md#rule-residue-audit-20261023--파일별-확인](documentation.md#rule-residue-audit-20261023--파일별-확인) | 이관·안내 삭제(사용자 승인) |
| `docs/records/RULE-RESIDUE-AUDIT-20261023.md#원문과-규칙-보존` | [docs/records/documentation.md#rule-residue-audit-20261023--원문과-규칙-보존](documentation.md#rule-residue-audit-20261023--원문과-규칙-보존) | 이관·안내 삭제(사용자 승인) |
| `docs/records/RULE-RESIDUE-AUDIT-20261023.md#검사-결과와-한계` | [docs/records/documentation.md#rule-residue-audit-20261023--검사-결과와-한계](documentation.md#rule-residue-audit-20261023--검사-결과와-한계) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/MUSICXML-CONVERSION.md</summary>

원문 SHA-256: `0c955069cfe045f94334fe819a95fb62964e0985b4722360c96e7f30b1dbdcd7`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/MUSICXML-CONVERSION.md#real-paradis-pdf--musicxml` | [docs/records/songs/real-paradis.md#musicxml-conversion--real-paradis-pdf--musicxml](songs/real-paradis.md#musicxml-conversion--real-paradis-pdf--musicxml) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION.md#현재-아티스트-표기-2026-10-06` | [docs/records/songs/real-paradis.md#musicxml-conversion--현재-아티스트-표기-2026-10-06](songs/real-paradis.md#musicxml-conversion--현재-아티스트-표기-2026-10-06) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION.md#입력과-방법` | [docs/records/songs/real-paradis.md#musicxml-conversion--입력과-방법](songs/real-paradis.md#musicxml-conversion--입력과-방법) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION.md#2026-09-19-실행-결과` | [docs/records/songs/real-paradis.md#musicxml-conversion--2026-09-19-실행-결과](songs/real-paradis.md#musicxml-conversion--2026-09-19-실행-결과) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION.md#음가-복원과-예외` | [docs/records/songs/real-paradis.md#musicxml-conversion--음가-복원과-예외](songs/real-paradis.md#musicxml-conversion--음가-복원과-예외) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION.md#악기-매핑과-확정-범위` | [docs/records/songs/real-paradis.md#musicxml-conversion--악기-매핑과-확정-범위](songs/real-paradis.md#musicxml-conversion--악기-매핑과-확정-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION.md#렌더링-한계` | [docs/records/songs/real-paradis.md#musicxml-conversion--렌더링-한계](songs/real-paradis.md#musicxml-conversion--렌더링-한계) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION.md#산출물` | [docs/records/songs/real-paradis.md#musicxml-conversion--산출물](songs/real-paradis.md#musicxml-conversion--산출물) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION.md#재현` | [docs/records/songs/real-paradis.md#musicxml-conversion--재현](songs/real-paradis.md#musicxml-conversion--재현) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION.md#남은-확인` | [docs/records/songs/real-paradis.md#musicxml-conversion--남은-확인](songs/real-paradis.md#musicxml-conversion--남은-확인) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-CONVERSION.md#2026-09-19-사용자-제공-제작자제목-정보-반영` | [docs/records/songs/real-paradis.md#musicxml-conversion--2026-09-19-사용자-제공-제작자제목-정보-반영](songs/real-paradis.md#musicxml-conversion--2026-09-19-사용자-제공-제작자제목-정보-반영) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/BEAT-ANCHOR-AUDIT.md</summary>

원문 SHA-256: `7611f42347c82fd6aa4b50af34b6097cd9f5dc48c500fa88ddbbf4d0ad164962`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/BEAT-ANCHOR-AUDIT.md#전체-110마디-음표-위치-기준점-감사` | [docs/records/songs/real-paradis.md#beat-anchor-audit--전체-110마디-음표-위치-기준점-감사](songs/real-paradis.md#beat-anchor-audit--전체-110마디-음표-위치-기준점-감사) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/BEAT-ANCHOR-AUDIT.md#앱-반영-결과` | [docs/records/songs/real-paradis.md#beat-anchor-audit--앱-반영-결과](songs/real-paradis.md#beat-anchor-audit--앱-반영-결과) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/LOVEHOLIC-CONVERSION.md</summary>

원문 SHA-256: `6774b07e0ca4a649bc573f0aaebefff5f3f1cf36288e9102d29701230da0bd90`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#loveholic-pdf--musicxml-작업` | [docs/records/songs/loveholic.md#loveholic-conversion--loveholic-pdf--musicxml-작업](songs/loveholic.md#loveholic-conversion--loveholic-pdf--musicxml-작업) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#현재-원곡-속도-정보--사용자-결정-2026-10-13` | [docs/records/songs/loveholic.md#loveholic-conversion--현재-원곡-속도-정보--사용자-결정-2026-10-13](songs/loveholic.md#loveholic-conversion--현재-원곡-속도-정보--사용자-결정-2026-10-13) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#이-기록의-범위` | [docs/records/songs/loveholic.md#loveholic-conversion--이-기록의-범위](songs/loveholic.md#loveholic-conversion--이-기록의-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#제작-범위와-완료-조건` | [docs/records/songs/loveholic.md#loveholic-conversion--제작-범위와-완료-조건](songs/loveholic.md#loveholic-conversion--제작-범위와-완료-조건) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#입력과-방식` | [docs/records/songs/loveholic.md#loveholic-conversion--입력과-방식](songs/loveholic.md#loveholic-conversion--입력과-방식) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#초기-확정-산출물--2026-10-03-kst` | [docs/records/songs/loveholic.md#loveholic-conversion--초기-확정-산출물--2026-10-03-kst](songs/loveholic.md#loveholic-conversion--초기-확정-산출물--2026-10-03-kst) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#구조-추출과-교정` | [docs/records/songs/loveholic.md#loveholic-conversion--구조-추출과-교정](songs/loveholic.md#loveholic-conversion--구조-추출과-교정) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#원-안--표기의-보존과-표시-한계` | [docs/records/songs/loveholic.md#loveholic-conversion--원-안--표기의-보존과-표시-한계](songs/loveholic.md#loveholic-conversion--원-안--표기의-보존과-표시-한계) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#음원-연결` | [docs/records/songs/loveholic.md#loveholic-conversion--음원-연결](songs/loveholic.md#loveholic-conversion--음원-연결) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#인쇄-가사` | [docs/records/songs/loveholic.md#loveholic-conversion--인쇄-가사](songs/loveholic.md#loveholic-conversion--인쇄-가사) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#검증-결과` | [docs/records/songs/loveholic.md#loveholic-conversion--검증-결과](songs/loveholic.md#loveholic-conversion--검증-결과) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#pdf-마디-영역-보정` | [docs/records/songs/loveholic.md#loveholic-conversion--pdf-마디-영역-보정](songs/loveholic.md#loveholic-conversion--pdf-마디-영역-보정) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#근거재현-경로` | [docs/records/songs/loveholic.md#loveholic-conversion--근거재현-경로](songs/loveholic.md#loveholic-conversion--근거재현-경로) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#2026-10-03-반열림-표기-해결-및-새-패키지` | [docs/records/songs/loveholic.md#loveholic-conversion--2026-10-03-반열림-표기-해결-및-새-패키지](songs/loveholic.md#loveholic-conversion--2026-10-03-반열림-표기-해결-및-새-패키지) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#pdf-줄-앞-자르기-근거` | [docs/records/songs/loveholic.md#loveholic-conversion--pdf-줄-앞-자르기-근거](songs/loveholic.md#loveholic-conversion--pdf-줄-앞-자르기-근거) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#2026-10-03-최신-표준-가사-재생-패키지` | [docs/records/songs/loveholic.md#loveholic-conversion--2026-10-03-최신-표준-가사-재생-패키지](songs/loveholic.md#loveholic-conversion--2026-10-03-최신-표준-가사-재생-패키지) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#2026-10-03-최초-표준-가사-musicxml` | [docs/records/songs/loveholic.md#loveholic-conversion--2026-10-03-최초-표준-가사-musicxml](songs/loveholic.md#loveholic-conversion--2026-10-03-최초-표준-가사-musicxml) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#2026-10-03-이전-마디-중앙-인쇄-가사-패키지` | [docs/records/songs/loveholic.md#loveholic-conversion--2026-10-03-이전-마디-중앙-인쇄-가사-패키지](songs/loveholic.md#loveholic-conversion--2026-10-03-이전-마디-중앙-인쇄-가사-패키지) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#2026-10-13-악보-템포와-원곡-추정-템포-분리--최종-사용자-결정` | [docs/records/songs/loveholic.md#loveholic-conversion--2026-10-13-악보-템포와-원곡-추정-템포-분리--최종-사용자-결정](songs/loveholic.md#loveholic-conversion--2026-10-13-악보-템포와-원곡-추정-템포-분리--최종-사용자-결정) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-CONVERSION.md#2026-10-13-추가-결정--연습은-일정한-메트로놈-기준` | [docs/records/songs/loveholic.md#loveholic-conversion--2026-10-13-추가-결정--연습은-일정한-메트로놈-기준](songs/loveholic.md#loveholic-conversion--2026-10-13-추가-결정--연습은-일정한-메트로놈-기준) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/LOVEHOLIC-LYRICS-REVIEW.md</summary>

원문 SHA-256: `b31ded17728e4a73a24767f33b40246e99a49213b69fa5463d4a7199b92234f0`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/LOVEHOLIC-LYRICS-REVIEW.md#loveholic-인쇄-가사-제작과-과거-시각-시험--2026-10-03` | [docs/records/songs/loveholic.md#loveholic-lyrics-review--loveholic-인쇄-가사-제작과-과거-시각-시험--2026-10-03](songs/loveholic.md#loveholic-lyrics-review--loveholic-인쇄-가사-제작과-과거-시각-시험--2026-10-03) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-LYRICS-REVIEW.md#최신-결정-악보가-가사-기준-2026-10-03` | [docs/records/songs/loveholic.md#loveholic-lyrics-review--최신-결정-악보가-가사-기준-2026-10-03](songs/loveholic.md#loveholic-lyrics-review--최신-결정-악보가-가사-기준-2026-10-03) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-LYRICS-REVIEW.md#최신-재생-캐시-패키지-2026-10-03` | [docs/records/songs/loveholic.md#loveholic-lyrics-review--최신-재생-캐시-패키지-2026-10-03](songs/loveholic.md#loveholic-lyrics-review--최신-재생-캐시-패키지-2026-10-03) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-LYRICS-REVIEW.md#표준-가사-성부-전환-결과-2026-10-03` | [docs/records/songs/loveholic.md#loveholic-lyrics-review--표준-가사-성부-전환-결과-2026-10-03](songs/loveholic.md#loveholic-lyrics-review--표준-가사-성부-전환-결과-2026-10-03) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-LYRICS-REVIEW.md#이전-결과-원본-인쇄-가사-77마디-수록` | [docs/records/songs/loveholic.md#loveholic-lyrics-review--이전-결과-원본-인쇄-가사-77마디-수록](songs/loveholic.md#loveholic-lyrics-review--이전-결과-원본-인쇄-가사-77마디-수록) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-LYRICS-REVIEW.md#과거-음원-시각-시험의-범위` | [docs/records/songs/loveholic.md#loveholic-lyrics-review--과거-음원-시각-시험의-범위](songs/loveholic.md#loveholic-lyrics-review--과거-음원-시각-시험의-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-LYRICS-REVIEW.md#기준과-과거-근거` | [docs/records/songs/loveholic.md#loveholic-lyrics-review--기준과-과거-근거](songs/loveholic.md#loveholic-lyrics-review--기준과-과거-근거) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-LYRICS-REVIEW.md#환경자료` | [docs/records/songs/loveholic.md#loveholic-lyrics-review--환경자료](songs/loveholic.md#loveholic-lyrics-review--환경자료) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-LYRICS-REVIEW.md#시험-결과와-채택-범위` | [docs/records/songs/loveholic.md#loveholic-lyrics-review--시험-결과와-채택-범위](songs/loveholic.md#loveholic-lyrics-review--시험-결과와-채택-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-LYRICS-REVIEW.md#근거재현` | [docs/records/songs/loveholic.md#loveholic-lyrics-review--근거재현](songs/loveholic.md#loveholic-lyrics-review--근거재현) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-LYRICS-REVIEW.md#large-v3-구절-경계-판정` | [docs/records/songs/loveholic.md#loveholic-lyrics-review--large-v3-구절-경계-판정](songs/loveholic.md#loveholic-lyrics-review--large-v3-구절-경계-판정) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-LYRICS-REVIEW.md#공개-시간-자료-추가-조사` | [docs/records/songs/loveholic.md#loveholic-lyrics-review--공개-시간-자료-추가-조사](songs/loveholic.md#loveholic-lyrics-review--공개-시간-자료-추가-조사) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/LOVEHOLIC-PDF-LYRIC-PLACEMENT.md</summary>

원문 SHA-256: `f7b5e1e8e5f1d87c5fb4fb7575c585fbe943e267fe0625850cfcc02acb3e1f43`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/LOVEHOLIC-PDF-LYRIC-PLACEMENT.md#loveholic-pdf-가사-위치-수정--2026-10-03` | [docs/records/songs/loveholic.md#loveholic-pdf-lyric-placement--loveholic-pdf-가사-위치-수정--2026-10-03](songs/loveholic.md#loveholic-pdf-lyric-placement--loveholic-pdf-가사-위치-수정--2026-10-03) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-PDF-LYRIC-PLACEMENT.md#원인과-보존` | [docs/records/songs/loveholic.md#loveholic-pdf-lyric-placement--원인과-보존](songs/loveholic.md#loveholic-pdf-lyric-placement--원인과-보존) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-PDF-LYRIC-PLACEMENT.md#새-패키지와-현재-검증` | [docs/records/songs/loveholic.md#loveholic-pdf-lyric-placement--새-패키지와-현재-검증](songs/loveholic.md#loveholic-pdf-lyric-placement--새-패키지와-현재-검증) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-PDF-LYRIC-PLACEMENT.md#실제-앱-검증-완료` | [docs/records/songs/loveholic.md#loveholic-pdf-lyric-placement--실제-앱-검증-완료](songs/loveholic.md#loveholic-pdf-lyric-placement--실제-앱-검증-완료) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/LOVEHOLIC-PUBLICATION.md</summary>

원문 SHA-256: `89d24c8762122a8a245f5ced96ccee74063e8bd3a49760d77363b6336266a081`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/LOVEHOLIC-PUBLICATION.md#loveholic-제작-감독-및-드럼연습실-수록` | [docs/records/songs/loveholic.md#loveholic-publication--loveholic-제작-감독-및-드럼연습실-수록](songs/loveholic.md#loveholic-publication--loveholic-제작-감독-및-드럼연습실-수록) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-PUBLICATION.md#역할` | [docs/records/songs/loveholic.md#loveholic-publication--역할](songs/loveholic.md#loveholic-publication--역할) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-PUBLICATION.md#중간-검수` | [docs/records/songs/loveholic.md#loveholic-publication--중간-검수](songs/loveholic.md#loveholic-publication--중간-검수) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-PUBLICATION.md#상태` | [docs/records/songs/loveholic.md#loveholic-publication--상태](songs/loveholic.md#loveholic-publication--상태) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-PUBLICATION.md#2026-10-03-독립-플레이어-검수` | [docs/records/songs/loveholic.md#loveholic-publication--2026-10-03-독립-플레이어-검수](songs/loveholic.md#loveholic-publication--2026-10-03-독립-플레이어-검수) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-PUBLICATION.md#최종-수록--2026-10-03-0014-kst` | [docs/records/songs/loveholic.md#loveholic-publication--최종-수록--2026-10-03-0014-kst](songs/loveholic.md#loveholic-publication--최종-수록--2026-10-03-0014-kst) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/LOVEHOLIC-REVIEW.md</summary>

원문 SHA-256: `463f751f72c88de5cfb480247fc7d23201874506c288e48568dbcc17ccd435ec`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/LOVEHOLIC-REVIEW.md#loveholic-재검토` | [docs/records/songs/loveholic.md#loveholic-review--loveholic-재검토](songs/loveholic.md#loveholic-review--loveholic-재검토) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-REVIEW.md#기준과-순서` | [docs/records/songs/loveholic.md#loveholic-review--기준과-순서](songs/loveholic.md#loveholic-review--기준과-순서) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-REVIEW.md#발견` | [docs/records/songs/loveholic.md#loveholic-review--발견](songs/loveholic.md#loveholic-review--발견) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-REVIEW.md#반복-검증-기록` | [docs/records/songs/loveholic.md#loveholic-review--반복-검증-기록](songs/loveholic.md#loveholic-review--반복-검증-기록) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-REVIEW.md#다음-작업에서-재사용할-해결예방-절차` | [docs/records/songs/loveholic.md#loveholic-review--다음-작업에서-재사용할-해결예방-절차](songs/loveholic.md#loveholic-review--다음-작업에서-재사용할-해결예방-절차) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-REVIEW.md#남는-경계` | [docs/records/songs/loveholic.md#loveholic-review--남는-경계](songs/loveholic.md#loveholic-review--남는-경계) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-REVIEW.md#최종-상태` | [docs/records/songs/loveholic.md#loveholic-review--최종-상태](songs/loveholic.md#loveholic-review--최종-상태) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LOVEHOLIC-REVIEW.md#후속-해결--2026-10-03-0121kst` | [docs/records/songs/loveholic.md#loveholic-review--후속-해결--2026-10-03-0121kst](songs/loveholic.md#loveholic-review--후속-해결--2026-10-03-0121kst) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/RED-SUNSET-APP-INTEGRATION.md</summary>

원문 SHA-256: `843b23cb280ce4290fe30dfd2cf5c2458094c884de3e6ba21f4968a351ae09ac`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/RED-SUNSET-APP-INTEGRATION.md#붉은-노을-앱-반영` | [docs/records/songs/red-sunset.md#red-sunset-app-integration--붉은-노을-앱-반영](songs/red-sunset.md#red-sunset-app-integration--붉은-노을-앱-반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-APP-INTEGRATION.md#적용-기준` | [docs/records/songs/red-sunset.md#red-sunset-app-integration--적용-기준](songs/red-sunset.md#red-sunset-app-integration--적용-기준) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-APP-INTEGRATION.md#발행-전-반영-결과와-검증` | [docs/records/songs/red-sunset.md#red-sunset-app-integration--발행-전-반영-결과와-검증](songs/red-sunset.md#red-sunset-app-integration--발행-전-반영-결과와-검증) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-APP-INTEGRATION.md#공개-0712--ipad-사용자-확인-2026-10-15` | [docs/records/songs/red-sunset.md#red-sunset-app-integration--공개-0712--ipad-사용자-확인-2026-10-15](songs/red-sunset.md#red-sunset-app-integration--공개-0712--ipad-사용자-확인-2026-10-15) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/RED-SUNSET-BEAT-41.md</summary>

원문 SHA-256: `75604b40cdc6caf0d397106839bf7c43a434e9504ff91c77fed79d6fc29f77de`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/RED-SUNSET-BEAT-41.md#붉은-노을-41마디-박-위치-조사` | [docs/records/songs/red-sunset.md#red-sunset-beat-41--붉은-노을-41마디-박-위치-조사](songs/red-sunset.md#red-sunset-beat-41--붉은-노을-41마디-박-위치-조사) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-BEAT-41.md#사용자-관측` | [docs/records/songs/red-sunset.md#red-sunset-beat-41--사용자-관측](songs/red-sunset.md#red-sunset-beat-41--사용자-관측) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-BEAT-41.md#로컬-재현` | [docs/records/songs/red-sunset.md#red-sunset-beat-41--로컬-재현](songs/red-sunset.md#red-sunset-beat-41--로컬-재현) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-BEAT-41.md#보정-후보의-한계` | [docs/records/songs/red-sunset.md#red-sunset-beat-41--보정-후보의-한계](songs/red-sunset.md#red-sunset-beat-41--보정-후보의-한계) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-BEAT-41.md#전체-악보-제작-의뢰--2026-10-15` | [docs/records/songs/red-sunset.md#red-sunset-beat-41--전체-악보-제작-의뢰--2026-10-15](songs/red-sunset.md#red-sunset-beat-41--전체-악보-제작-의뢰--2026-10-15) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/RED-SUNSET-BEAT-COMPARISON.md</summary>

원문 SHA-256: `3732be90b8071a3e471bba26b2caad7ce9f76fd59cbe6e24ca5959d51899b124`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/RED-SUNSET-BEAT-COMPARISON.md#붉은-노을--기존-자동-분석과-새-악보-박-시각-전곡-비교` | [docs/records/songs/red-sunset.md#red-sunset-beat-comparison--붉은-노을--기존-자동-분석과-새-악보-박-시각-전곡-비교](songs/red-sunset.md#red-sunset-beat-comparison--붉은-노을--기존-자동-분석과-새-악보-박-시각-전곡-비교) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-BEAT-COMPARISON.md#입력과-대응-기준` | [docs/records/songs/red-sunset.md#red-sunset-beat-comparison--입력과-대응-기준](songs/red-sunset.md#red-sunset-beat-comparison--입력과-대응-기준) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-BEAT-COMPARISON.md#전체-결과` | [docs/records/songs/red-sunset.md#red-sunset-beat-comparison--전체-결과](songs/red-sunset.md#red-sunset-beat-comparison--전체-결과) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-BEAT-COMPARISON.md#차이가-큰-지점과-회복-위치` | [docs/records/songs/red-sunset.md#red-sunset-beat-comparison--차이가-큰-지점과-회복-위치](songs/red-sunset.md#red-sunset-beat-comparison--차이가-큰-지점과-회복-위치) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-BEAT-COMPARISON.md#악보-없이-찾은-첫-박-후보와의-교차-확인` | [docs/records/songs/red-sunset.md#red-sunset-beat-comparison--악보-없이-찾은-첫-박-후보와의-교차-확인](songs/red-sunset.md#red-sunset-beat-comparison--악보-없이-찾은-첫-박-후보와의-교차-확인) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-BEAT-COMPARISON.md#해석과-한계` | [docs/records/songs/red-sunset.md#red-sunset-beat-comparison--해석과-한계](songs/red-sunset.md#red-sunset-beat-comparison--해석과-한계) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-BEAT-COMPARISON.md#재현-자료` | [docs/records/songs/red-sunset.md#red-sunset-beat-comparison--재현-자료](songs/red-sunset.md#red-sunset-beat-comparison--재현-자료) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/RED-SUNSET-LATE-AUDIO-ANALYSIS.md</summary>

원문 SHA-256: `57ec3baad6d80cefb75aa9e1d9ee166b7fbd44c119238931ffe17ee65d2fdd0d`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/RED-SUNSET-LATE-AUDIO-ANALYSIS.md#붉은-노을-후반-음원-단독-재분석` | [docs/records/songs/red-sunset.md#red-sunset-late-audio-analysis--붉은-노을-후반-음원-단독-재분석](songs/red-sunset.md#red-sunset-late-audio-analysis--붉은-노을-후반-음원-단독-재분석) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-LATE-AUDIO-ANALYSIS.md#결론` | [docs/records/songs/red-sunset.md#red-sunset-late-audio-analysis--결론](songs/red-sunset.md#red-sunset-late-audio-analysis--결론) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-LATE-AUDIO-ANALYSIS.md#음원-단독-분석-계약과-재현` | [docs/records/songs/red-sunset.md#red-sunset-late-audio-analysis--음원-단독-분석-계약과-재현](songs/red-sunset.md#red-sunset-late-audio-analysis--음원-단독-분석-계약과-재현) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-LATE-AUDIO-ANALYSIS.md#어디서-경로가-갈라지는가` | [docs/records/songs/red-sunset.md#red-sunset-late-audio-analysis--어디서-경로가-갈라지는가](songs/red-sunset.md#red-sunset-late-audio-analysis--어디서-경로가-갈라지는가) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-LATE-AUDIO-ANALYSIS.md#왜-기존-경로가-계속-늦어지는가` | [docs/records/songs/red-sunset.md#red-sunset-late-audio-analysis--왜-기존-경로가-계속-늦어지는가](songs/red-sunset.md#red-sunset-late-audio-analysis--왜-기존-경로가-계속-늦어지는가) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-LATE-AUDIO-ANALYSIS.md#경쟁-경로를-지지하는-별도-음원-신호` | [docs/records/songs/red-sunset.md#red-sunset-late-audio-analysis--경쟁-경로를-지지하는-별도-음원-신호](songs/red-sunset.md#red-sunset-late-audio-analysis--경쟁-경로를-지지하는-별도-음원-신호) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-LATE-AUDIO-ANALYSIS.md#마디별-첫-박의-후보-차이` | [docs/records/songs/red-sunset.md#red-sunset-late-audio-analysis--마디별-첫-박의-후보-차이](songs/red-sunset.md#red-sunset-late-audio-analysis--마디별-첫-박의-후보-차이) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-LATE-AUDIO-ANALYSIS.md#배제한-설명과-남은-판단` | [docs/records/songs/red-sunset.md#red-sunset-late-audio-analysis--배제한-설명과-남은-판단](songs/red-sunset.md#red-sunset-late-audio-analysis--배제한-설명과-남은-판단) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-LATE-AUDIO-ANALYSIS.md#재현-자료` | [docs/records/songs/red-sunset.md#red-sunset-late-audio-analysis--재현-자료](songs/red-sunset.md#red-sunset-late-audio-analysis--재현-자료) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/RED-SUNSET-OPEN-CLOSE-20261023.md</summary>

원문 SHA-256: `e03ae3566f9a6dd64f81eb4e70274e8ab44aa1e7a68a268bfb8e8861eb1fe897`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| [docs/score-production/RED-SUNSET-OPEN-CLOSE-20261023.md#붉은-노을-o-가로-배치-교정](../score-production/RED-SUNSET-OPEN-CLOSE-20261023.md#붉은-노을-o-가로-배치-교정) | [docs/records/songs/red-sunset.md#red-sunset-open-close-20261023--붉은-노을-o-가로-배치-교정](songs/red-sunset.md#red-sunset-open-close-20261023--붉은-노을-o-가로-배치-교정) | 이관·기존 주소 보존 |
| [docs/score-production/RED-SUNSET-OPEN-CLOSE-20261023.md#입력승인](../score-production/RED-SUNSET-OPEN-CLOSE-20261023.md#입력승인) | [docs/records/songs/red-sunset.md#red-sunset-open-close-20261023--입력승인](songs/red-sunset.md#red-sunset-open-close-20261023--입력승인) | 이관·기존 주소 보존 |
| [docs/score-production/RED-SUNSET-OPEN-CLOSE-20261023.md#재현검사](../score-production/RED-SUNSET-OPEN-CLOSE-20261023.md#재현검사) | [docs/records/songs/red-sunset.md#red-sunset-open-close-20261023--재현검사](songs/red-sunset.md#red-sunset-open-close-20261023--재현검사) | 이관·기존 주소 보존 |
| [docs/score-production/RED-SUNSET-OPEN-CLOSE-20261023.md#조판-지원과-인계-진행](../score-production/RED-SUNSET-OPEN-CLOSE-20261023.md#조판-지원과-인계-진행) | [docs/records/songs/red-sunset.md#red-sunset-open-close-20261023--조판-지원과-인계-진행](songs/red-sunset.md#red-sunset-open-close-20261023--조판-지원과-인계-진행) | 이관·기존 주소 보존 |
| [docs/score-production/RED-SUNSET-OPEN-CLOSE-20261023.md#최종-결과](../score-production/RED-SUNSET-OPEN-CLOSE-20261023.md#최종-결과) | [docs/records/songs/red-sunset.md#red-sunset-open-close-20261023--최종-결과](songs/red-sunset.md#red-sunset-open-close-20261023--최종-결과) | 이관·기존 주소 보존 |
| [docs/score-production/RED-SUNSET-OPEN-CLOSE-20261023.md#해결-기록과-한계](../score-production/RED-SUNSET-OPEN-CLOSE-20261023.md#해결-기록과-한계) | [docs/records/songs/red-sunset.md#red-sunset-open-close-20261023--해결-기록과-한계](songs/red-sunset.md#red-sunset-open-close-20261023--해결-기록과-한계) | 이관·기존 주소 보존 |
| [docs/score-production/RED-SUNSET-OPEN-CLOSE-20261023.md#최종-개발-인계](../score-production/RED-SUNSET-OPEN-CLOSE-20261023.md#최종-개발-인계) | [docs/records/songs/red-sunset.md#red-sunset-open-close-20261023--최종-개발-인계](songs/red-sunset.md#red-sunset-open-close-20261023--최종-개발-인계) | 이관·기존 주소 보존 |

</details>

<details>
<summary>docs/score-production/RED-SUNSET-PRODUCTION.md</summary>

원문 SHA-256: `f3937ab3cb702294af3559604d4e65a3a75039e1fd9670315127c04f05b34d36`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/RED-SUNSET-PRODUCTION.md#yb-붉은-노을-악보-제작` | [docs/records/songs/red-sunset.md#red-sunset-production--yb-붉은-노을-악보-제작](songs/red-sunset.md#red-sunset-production--yb-붉은-노을-악보-제작) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-PRODUCTION.md#입력과-권위` | [docs/records/songs/red-sunset.md#red-sunset-production--입력과-권위](songs/red-sunset.md#red-sunset-production--입력과-권위) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-PRODUCTION.md#벡터-추출과-해결-기록` | [docs/records/songs/red-sunset.md#red-sunset-production--벡터-추출과-해결-기록](songs/red-sunset.md#red-sunset-production--벡터-추출과-해결-기록) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-PRODUCTION.md#음원-연결--추정과-한계` | [docs/records/songs/red-sunset.md#red-sunset-production--음원-연결--추정과-한계](songs/red-sunset.md#red-sunset-production--음원-연결--추정과-한계) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-PRODUCTION.md#원본에-없는-시작-표제--2026-10-23-경위-확인` | [docs/records/songs/red-sunset.md#red-sunset-production--원본에-없는-시작-표제--2026-10-23-경위-확인](songs/red-sunset.md#red-sunset-production--원본에-없는-시작-표제--2026-10-23-경위-확인) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-PRODUCTION.md#svg의-bpm가수-표시-경위--2026-10-23-조회` | [docs/records/songs/red-sunset.md#red-sunset-production--svg의-bpm가수-표시-경위--2026-10-23-조회](songs/red-sunset.md#red-sunset-production--svg의-bpm가수-표시-경위--2026-10-23-조회) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-PRODUCTION.md#표시-검수와-해결-기록` | [docs/records/songs/red-sunset.md#red-sunset-production--표시-검수와-해결-기록](songs/red-sunset.md#red-sunset-production--표시-검수와-해결-기록) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-PRODUCTION.md#개발-인계` | [docs/records/songs/red-sunset.md#red-sunset-production--개발-인계](songs/red-sunset.md#red-sunset-production--개발-인계) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/RED-SUNSET-PRODUCTION.md#2026-10-15-0207-kst--실제-개발-인계` | [docs/records/songs/red-sunset.md#red-sunset-production--2026-10-15-0207-kst--실제-개발-인계](songs/red-sunset.md#red-sunset-production--2026-10-15-0207-kst--실제-개발-인계) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/RED-SUNSET-REBUILD-20261023.md</summary>

원문 SHA-256: `ac2a91e78777d06f4cb4d3f87ccceb4cf95d7faf21540b94f394dea4f8146866`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| [docs/score-production/RED-SUNSET-REBUILD-20261023.md#붉은-노을--최신-제작-원칙-전곡-재제작](../score-production/RED-SUNSET-REBUILD-20261023.md#붉은-노을--최신-제작-원칙-전곡-재제작) | [docs/records/songs/red-sunset.md#red-sunset-rebuild-20261023--붉은-노을--최신-제작-원칙-전곡-재제작](songs/red-sunset.md#red-sunset-rebuild-20261023--붉은-노을--최신-제작-원칙-전곡-재제작) | 이관·기존 주소 보존 |
| [docs/score-production/RED-SUNSET-REBUILD-20261023.md#원본과-음악-데이터](../score-production/RED-SUNSET-REBUILD-20261023.md#원본과-음악-데이터) | [docs/records/songs/red-sunset.md#red-sunset-rebuild-20261023--원본과-음악-데이터](songs/red-sunset.md#red-sunset-rebuild-20261023--원본과-음악-데이터) | 이관·기존 주소 보존 |
| [docs/score-production/RED-SUNSET-REBUILD-20261023.md#확인한-조판-문제와-처리](../score-production/RED-SUNSET-REBUILD-20261023.md#확인한-조판-문제와-처리) | [docs/records/songs/red-sunset.md#red-sunset-rebuild-20261023--확인한-조판-문제와-처리](songs/red-sunset.md#red-sunset-rebuild-20261023--확인한-조판-문제와-처리) | 이관·기존 주소 보존 |
| [docs/score-production/RED-SUNSET-REBUILD-20261023.md#재현-절차](../score-production/RED-SUNSET-REBUILD-20261023.md#재현-절차) | [docs/records/songs/red-sunset.md#red-sunset-rebuild-20261023--재현-절차](songs/red-sunset.md#red-sunset-rebuild-20261023--재현-절차) | 이관·기존 주소 보존 |
| [docs/score-production/RED-SUNSET-REBUILD-20261023.md#최종-결과와-검증](../score-production/RED-SUNSET-REBUILD-20261023.md#최종-결과와-검증) | [docs/records/songs/red-sunset.md#red-sunset-rebuild-20261023--최종-결과와-검증](songs/red-sunset.md#red-sunset-rebuild-20261023--최종-결과와-검증) | 이관·기존 주소 보존 |
| [docs/score-production/RED-SUNSET-REBUILD-20261023.md#해결한-문제와-다음-적용-기준](../score-production/RED-SUNSET-REBUILD-20261023.md#해결한-문제와-다음-적용-기준) | [docs/records/songs/red-sunset.md#red-sunset-rebuild-20261023--해결한-문제와-다음-적용-기준](songs/red-sunset.md#red-sunset-rebuild-20261023--해결한-문제와-다음-적용-기준) | 이관·기존 주소 보존 |
| [docs/score-production/RED-SUNSET-REBUILD-20261023.md#도구-검사와-개발-인계](../score-production/RED-SUNSET-REBUILD-20261023.md#도구-검사와-개발-인계) | [docs/records/songs/red-sunset.md#red-sunset-rebuild-20261023--도구-검사와-개발-인계](songs/red-sunset.md#red-sunset-rebuild-20261023--도구-검사와-개발-인계) | 이관·기존 주소 보존 |

</details>

<details>
<summary>docs/score-production/IOI-SUDDENLY-CONVERSION.md</summary>

원문 SHA-256: `db844e49ea2a505063766af061708982282dc98222fb33b5f488b6dc37475573`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| [docs/score-production/IOI-SUDDENLY-CONVERSION.md#ioi--갑자기-제작실측](../score-production/IOI-SUDDENLY-CONVERSION.md#ioi--갑자기-제작실측) | [docs/records/songs/ioi-suddenly.md#ioi-suddenly-conversion--ioi--갑자기-제작실측](songs/ioi-suddenly.md#ioi-suddenly-conversion--ioi--갑자기-제작실측) | 이관·기존 주소 보존 |
| [docs/score-production/IOI-SUDDENLY-CONVERSION.md#원본과-실행-기준](../score-production/IOI-SUDDENLY-CONVERSION.md#원본과-실행-기준) | [docs/records/songs/ioi-suddenly.md#ioi-suddenly-conversion--원본과-실행-기준](songs/ioi-suddenly.md#ioi-suddenly-conversion--원본과-실행-기준) | 이관·기존 주소 보존 |
| [docs/score-production/IOI-SUDDENLY-CONVERSION.md#계측-범위](../score-production/IOI-SUDDENLY-CONVERSION.md#계측-범위) | [docs/records/songs/ioi-suddenly.md#ioi-suddenly-conversion--계측-범위](songs/ioi-suddenly.md#ioi-suddenly-conversion--계측-범위) | 이관·기존 주소 보존 |
| [docs/score-production/IOI-SUDDENLY-CONVERSION.md#최종-산출물](../score-production/IOI-SUDDENLY-CONVERSION.md#최종-산출물) | [docs/records/songs/ioi-suddenly.md#ioi-suddenly-conversion--최종-산출물](songs/ioi-suddenly.md#ioi-suddenly-conversion--최종-산출물) | 이관·기존 주소 보존 |
| [docs/score-production/IOI-SUDDENLY-CONVERSION.md#원본-의미와-판독-결정](../score-production/IOI-SUDDENLY-CONVERSION.md#원본-의미와-판독-결정) | [docs/records/songs/ioi-suddenly.md#ioi-suddenly-conversion--원본-의미와-판독-결정](songs/ioi-suddenly.md#ioi-suddenly-conversion--원본-의미와-판독-결정) | 이관·기존 주소 보존 |
| [docs/score-production/IOI-SUDDENLY-CONVERSION.md#가사](../score-production/IOI-SUDDENLY-CONVERSION.md#가사) | [docs/records/songs/ioi-suddenly.md#ioi-suddenly-conversion--가사](songs/ioi-suddenly.md#ioi-suddenly-conversion--가사) | 이관·기존 주소 보존 |
| [docs/score-production/IOI-SUDDENLY-CONVERSION.md#음원](../score-production/IOI-SUDDENLY-CONVERSION.md#음원) | [docs/records/songs/ioi-suddenly.md#ioi-suddenly-conversion--음원](songs/ioi-suddenly.md#ioi-suddenly-conversion--음원) | 이관·기존 주소 보존 |
| [docs/score-production/IOI-SUDDENLY-CONVERSION.md#검증과-해결-기록](../score-production/IOI-SUDDENLY-CONVERSION.md#검증과-해결-기록) | [docs/records/songs/ioi-suddenly.md#ioi-suddenly-conversion--검증과-해결-기록](songs/ioi-suddenly.md#ioi-suddenly-conversion--검증과-해결-기록) | 이관·기존 주소 보존 |
| [docs/score-production/IOI-SUDDENLY-CONVERSION.md#재현-경로와-공통-코드-경계](../score-production/IOI-SUDDENLY-CONVERSION.md#재현-경로와-공통-코드-경계) | [docs/records/songs/ioi-suddenly.md#ioi-suddenly-conversion--재현-경로와-공통-코드-경계](songs/ioi-suddenly.md#ioi-suddenly-conversion--재현-경로와-공통-코드-경계) | 이관·기존 주소 보존 |
| [docs/score-production/IOI-SUDDENLY-CONVERSION.md#개발-인계와-남은-범위](../score-production/IOI-SUDDENLY-CONVERSION.md#개발-인계와-남은-범위) | [docs/records/songs/ioi-suddenly.md#ioi-suddenly-conversion--개발-인계와-남은-범위](songs/ioi-suddenly.md#ioi-suddenly-conversion--개발-인계와-남은-범위) | 이관·기존 주소 보존 |

</details>

<details>
<summary>docs/score-production/TOM-MOVING-PRODUCTION.md</summary>

원문 SHA-256: `0f9d1e477a90c0838a04c010d68f50e075c40d1c0b844a48f2420906757e9b7e`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#탐탐-무빙-연습-제작` | [docs/records/songs/tom-moving.md#tom-moving-production--탐탐-무빙-연습-제작](songs/tom-moving.md#tom-moving-production--탐탐-무빙-연습-제작) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#현재-제목악기-순서--사용자-정정-2026-10-13` | [docs/records/songs/tom-moving.md#tom-moving-production--현재-제목악기-순서--사용자-정정-2026-10-13](songs/tom-moving.md#tom-moving-production--현재-제목악기-순서--사용자-정정-2026-10-13) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#현재-상태--16마디판-삭제-사용자-결정-2026-10-13` | [docs/records/songs/tom-moving.md#tom-moving-production--현재-상태--16마디판-삭제-사용자-결정-2026-10-13](songs/tom-moving.md#tom-moving-production--현재-상태--16마디판-삭제-사용자-결정-2026-10-13) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#과거-곡-정보--두-버전-제목드럼킷-표기-2026-10-06-당시` | [docs/records/songs/tom-moving.md#tom-moving-production--과거-곡-정보--두-버전-제목드럼킷-표기-2026-10-06-당시](songs/tom-moving.md#tom-moving-production--과거-곡-정보--두-버전-제목드럼킷-표기-2026-10-06-당시) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#가수-표기-정정-이력--후속-결정-이전-2026-10-06` | [docs/records/songs/tom-moving.md#tom-moving-production--가수-표기-정정-이력--후속-결정-이전-2026-10-06](songs/tom-moving.md#tom-moving-production--가수-표기-정정-이력--후속-결정-이전-2026-10-06) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#현재-결과--원본-기본-연습-교정--portland-음원-2026-10-06` | [docs/records/songs/tom-moving.md#tom-moving-production--현재-결과--원본-기본-연습-교정--portland-음원-2026-10-06](songs/tom-moving.md#tom-moving-production--현재-결과--원본-기본-연습-교정--portland-음원-2026-10-06) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#원본-대조와-교정-내용` | [docs/records/songs/tom-moving.md#tom-moving-production--원본-대조와-교정-내용](songs/tom-moving.md#tom-moving-production--원본-대조와-교정-내용) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#현재-구성과-산출물` | [docs/records/songs/tom-moving.md#tom-moving-production--현재-구성과-산출물](songs/tom-moving.md#tom-moving-production--현재-구성과-산출물) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#portland-선택과-재현` | [docs/records/songs/tom-moving.md#tom-moving-production--portland-선택과-재현](songs/tom-moving.md#tom-moving-production--portland-선택과-재현) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#검증과-해결-기록` | [docs/records/songs/tom-moving.md#tom-moving-production--검증과-해결-기록](songs/tom-moving.md#tom-moving-production--검증과-해결-기록) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#2026-10-06-원본-재검토와-확인된-차이` | [docs/records/songs/tom-moving.md#tom-moving-production--2026-10-06-원본-재검토와-확인된-차이](songs/tom-moving.md#tom-moving-production--2026-10-06-원본-재검토와-확인된-차이) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#아래-기록의-범위` | [docs/records/songs/tom-moving.md#tom-moving-production--아래-기록의-범위](songs/tom-moving.md#tom-moving-production--아래-기록의-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#2026-10-06-midi-추가` | [docs/records/songs/tom-moving.md#tom-moving-production--2026-10-06-midi-추가](songs/tom-moving.md#tom-moving-production--2026-10-06-midi-추가) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#최초-제작의-목표와-범위` | [docs/records/songs/tom-moving.md#tom-moving-production--최초-제작의-목표와-범위](songs/tom-moving.md#tom-moving-production--최초-제작의-목표와-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#참고와-새-자료의-구분` | [docs/records/songs/tom-moving.md#tom-moving-production--참고와-새-자료의-구분](songs/tom-moving.md#tom-moving-production--참고와-새-자료의-구분) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#구성` | [docs/records/songs/tom-moving.md#tom-moving-production--구성](songs/tom-moving.md#tom-moving-production--구성) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#실행검증인계` | [docs/records/songs/tom-moving.md#tom-moving-production--실행검증인계](songs/tom-moving.md#tom-moving-production--실행검증인계) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#검증된-결과` | [docs/records/songs/tom-moving.md#tom-moving-production--검증된-결과](songs/tom-moving.md#tom-moving-production--검증된-결과) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#개발-소유자에게-넘길-표시-문제와-미검증` | [docs/records/songs/tom-moving.md#tom-moving-production--개발-소유자에게-넘길-표시-문제와-미검증](songs/tom-moving.md#tom-moving-production--개발-소유자에게-넘길-표시-문제와-미검증) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#재현과-산출물` | [docs/records/songs/tom-moving.md#tom-moving-production--재현과-산출물](songs/tom-moving.md#tom-moving-production--재현과-산출물) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#2026-10-06-웹앱-수록-및-표시-보정` | [docs/records/songs/tom-moving.md#tom-moving-production--2026-10-06-웹앱-수록-및-표시-보정](songs/tom-moving.md#tom-moving-production--2026-10-06-웹앱-수록-및-표시-보정) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#2026-10-06-garageband-사운드라이브러리로-mp3-제작` | [docs/records/songs/tom-moving.md#tom-moving-production--2026-10-06-garageband-사운드라이브러리로-mp3-제작](songs/tom-moving.md#tom-moving-production--2026-10-06-garageband-사운드라이브러리로-mp3-제작) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#확인한-입력과-연결` | [docs/records/songs/tom-moving.md#tom-moving-production--확인한-입력과-연결](songs/tom-moving.md#tom-moving-production--확인한-입력과-연결) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#막힌-경로와-해결다음-적용-기준` | [docs/records/songs/tom-moving.md#tom-moving-production--막힌-경로와-해결다음-적용-기준](songs/tom-moving.md#tom-moving-production--막힌-경로와-해결다음-적용-기준) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#산출물검증재현` | [docs/records/songs/tom-moving.md#tom-moving-production--산출물검증재현](songs/tom-moving.md#tom-moving-production--산출물검증재현) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#2026-10-06-socal-mp3를-악보-음원으로-교체` | [docs/records/songs/tom-moving.md#tom-moving-production--2026-10-06-socal-mp3를-악보-음원으로-교체](songs/tom-moving.md#tom-moving-production--2026-10-06-socal-mp3를-악보-음원으로-교체) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#이번-교체의-브라우저-검수-결과` | [docs/records/songs/tom-moving.md#tom-moving-production--이번-교체의-브라우저-검수-결과](songs/tom-moving.md#tom-moving-production--이번-교체의-브라우저-검수-결과) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#2026-10-06-이전-음원-삭제--최신-사용자-결정` | [docs/records/songs/tom-moving.md#tom-moving-production--2026-10-06-이전-음원-삭제--최신-사용자-결정](songs/tom-moving.md#tom-moving-production--2026-10-06-이전-음원-삭제--최신-사용자-결정) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#2026-10-06-16마디판-손풀기-적합성-검토--개선-제안-미적용` | [docs/records/songs/tom-moving.md#tom-moving-production--2026-10-06-16마디판-손풀기-적합성-검토--개선-제안-미적용](songs/tom-moving.md#tom-moving-production--2026-10-06-16마디판-손풀기-적합성-검토--개선-제안-미적용) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#2026-10-06-16마디판의-후속-독립-작곡` | [docs/records/songs/tom-moving.md#tom-moving-production--2026-10-06-16마디판의-후속-독립-작곡](songs/tom-moving.md#tom-moving-production--2026-10-06-16마디판의-후속-독립-작곡) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#2026-10-13-제작-자료-삭제-검증` | [docs/records/songs/tom-moving.md#tom-moving-production--2026-10-13-제작-자료-삭제-검증](songs/tom-moving.md#tom-moving-production--2026-10-13-제작-자료-삭제-검증) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/TOM-MOVING-PRODUCTION.md#2026-10-13-제목탐-이동-순서-정정--제작검증-완료` | [docs/records/songs/tom-moving.md#tom-moving-production--2026-10-13-제목탐-이동-순서-정정--제작검증-완료](songs/tom-moving.md#tom-moving-production--2026-10-13-제목탐-이동-순서-정정--제작검증-완료) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/PREPLAY-WARMUP-PRODUCTION.md</summary>

원문 SHA-256: `5edf673b3eb2c2a40a483c53b0d8e8d2ada01fff701dd572495f0396da5e7201`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/PREPLAY-WARMUP-PRODUCTION.md#시작전-손플기--독립-손-준비-연습곡` | [docs/records/songs/preplay-warmup.md#preplay-warmup-production--시작전-손플기--독립-손-준비-연습곡](songs/preplay-warmup.md#preplay-warmup-production--시작전-손플기--독립-손-준비-연습곡) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/PREPLAY-WARMUP-PRODUCTION.md#현재-폴더-구성` | [docs/records/songs/preplay-warmup.md#preplay-warmup-production--현재-폴더-구성](songs/preplay-warmup.md#preplay-warmup-production--현재-폴더-구성) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/PREPLAY-WARMUP-PRODUCTION.md#현재-결과--가수란-정정-2026-10-06` | [docs/records/songs/preplay-warmup.md#preplay-warmup-production--현재-결과--가수란-정정-2026-10-06](songs/preplay-warmup.md#preplay-warmup-production--현재-결과--가수란-정정-2026-10-06) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/PREPLAY-WARMUP-PRODUCTION.md#작곡-의도와-명세` | [docs/records/songs/preplay-warmup.md#preplay-warmup-production--작곡-의도와-명세](songs/preplay-warmup.md#preplay-warmup-production--작곡-의도와-명세) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/PREPLAY-WARMUP-PRODUCTION.md#음원과-표기` | [docs/records/songs/preplay-warmup.md#preplay-warmup-production--음원과-표기](songs/preplay-warmup.md#preplay-warmup-production--음원과-표기) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/PREPLAY-WARMUP-PRODUCTION.md#참고-근거` | [docs/records/songs/preplay-warmup.md#preplay-warmup-production--참고-근거](songs/preplay-warmup.md#preplay-warmup-production--참고-근거) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/PREPLAY-WARMUP-PRODUCTION.md#진행-상태` | [docs/records/songs/preplay-warmup.md#preplay-warmup-production--진행-상태](songs/preplay-warmup.md#preplay-warmup-production--진행-상태) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/PREPLAY-WARMUP-PRODUCTION.md#초판-제작-결과--2026-10-06-final-01-artist-정정-전` | [docs/records/songs/preplay-warmup.md#preplay-warmup-production--초판-제작-결과--2026-10-06-final-01-artist-정정-전](songs/preplay-warmup.md#preplay-warmup-production--초판-제작-결과--2026-10-06-final-01-artist-정정-전) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/PREPLAY-WARMUP-PRODUCTION.md#이번에-해결한-문제와-다음-적용-기준` | [docs/records/songs/preplay-warmup.md#preplay-warmup-production--이번에-해결한-문제와-다음-적용-기준](songs/preplay-warmup.md#preplay-warmup-production--이번에-해결한-문제와-다음-적용-기준) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/PREPLAY-WARMUP-PRODUCTION.md#재제작-경로` | [docs/records/songs/preplay-warmup.md#preplay-warmup-production--재제작-경로](songs/preplay-warmup.md#preplay-warmup-production--재제작-경로) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/PREPLAY-WARMUP-PRODUCTION.md#개발-인계` | [docs/records/songs/preplay-warmup.md#preplay-warmup-production--개발-인계](songs/preplay-warmup.md#preplay-warmup-production--개발-인계) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/PREPLAY-WARMUP-PRODUCTION.md#2026-10-13-이전16마디-자료-삭제` | [docs/records/songs/preplay-warmup.md#preplay-warmup-production--2026-10-13-이전16마디-자료-삭제](songs/preplay-warmup.md#preplay-warmup-production--2026-10-13-이전16마디-자료-삭제) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/plans/PROJECT-RESTRUCTURING.md</summary>

원문 SHA-256: `618b69b5d6c78c832f11907cbe9683a2d7a4a3c68b0ed009cc79c06d9accffed`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/plans/PROJECT-RESTRUCTURING.md#중형-프로젝트-구조-개편-제안` | [docs/records/archive/project-restructuring.md#project-restructuring--중형-프로젝트-구조-개편-제안](archive/project-restructuring.md#project-restructuring--중형-프로젝트-구조-개편-제안) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-RESTRUCTURING.md#목표와-범위` | [docs/records/archive/project-restructuring.md#project-restructuring--목표와-범위](archive/project-restructuring.md#project-restructuring--목표와-범위) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-RESTRUCTURING.md#조사-기준과-현황` | [docs/records/archive/project-restructuring.md#project-restructuring--조사-기준과-현황](archive/project-restructuring.md#project-restructuring--조사-기준과-현황) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-RESTRUCTURING.md#먼저-해결할-구조적-문제` | [docs/records/archive/project-restructuring.md#project-restructuring--먼저-해결할-구조적-문제](archive/project-restructuring.md#project-restructuring--먼저-해결할-구조적-문제) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-RESTRUCTURING.md#설계-방향` | [docs/records/archive/project-restructuring.md#project-restructuring--설계-방향](archive/project-restructuring.md#project-restructuring--설계-방향) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-RESTRUCTURING.md#대표-이동-후보` | [docs/records/archive/project-restructuring.md#project-restructuring--대표-이동-후보](archive/project-restructuring.md#project-restructuring--대표-이동-후보) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-RESTRUCTURING.md#의존성과-파일-구성-규칙` | [docs/records/archive/project-restructuring.md#project-restructuring--의존성과-파일-구성-규칙](archive/project-restructuring.md#project-restructuring--의존성과-파일-구성-규칙) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-RESTRUCTURING.md#문서검사도구-정리` | [docs/records/archive/project-restructuring.md#project-restructuring--문서검사도구-정리](archive/project-restructuring.md#project-restructuring--문서검사도구-정리) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-RESTRUCTURING.md#이전-순서와-완료-조건` | [docs/records/archive/project-restructuring.md#project-restructuring--이전-순서와-완료-조건](archive/project-restructuring.md#project-restructuring--이전-순서와-완료-조건) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-RESTRUCTURING.md#반드시-보존할-계약` | [docs/records/archive/project-restructuring.md#project-restructuring--반드시-보존할-계약](archive/project-restructuring.md#project-restructuring--반드시-보존할-계약) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-RESTRUCTURING.md#경로-변경-시-확인할-곳` | [docs/records/archive/project-restructuring.md#project-restructuring--경로-변경-시-확인할-곳](archive/project-restructuring.md#project-restructuring--경로-변경-시-확인할-곳) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-RESTRUCTURING.md#최종-검증-대상` | [docs/records/archive/project-restructuring.md#project-restructuring--최종-검증-대상](archive/project-restructuring.md#project-restructuring--최종-검증-대상) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-RESTRUCTURING.md#메인-대화에서-시작할-때` | [docs/records/archive/project-restructuring.md#project-restructuring--메인-대화에서-시작할-때](archive/project-restructuring.md#project-restructuring--메인-대화에서-시작할-때) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-RESTRUCTURING.md#참고` | [docs/records/archive/project-restructuring.md#project-restructuring--참고](archive/project-restructuring.md#project-restructuring--참고) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-RESTRUCTURING.md#실행-기록--2026-10-21` | [docs/records/archive/project-restructuring.md#project-restructuring--실행-기록--2026-10-21](archive/project-restructuring.md#project-restructuring--실행-기록--2026-10-21) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-RESTRUCTURING.md#최종-검사-중-발견과-대조` | [docs/records/archive/project-restructuring.md#project-restructuring--최종-검사-중-발견과-대조](archive/project-restructuring.md#project-restructuring--최종-검사-중-발견과-대조) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-RESTRUCTURING.md#최종-결과` | [docs/records/archive/project-restructuring.md#project-restructuring--최종-결과](archive/project-restructuring.md#project-restructuring--최종-결과) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/plans/RESTRUCTURING-MAP.md</summary>

원문 SHA-256: `175aafd31b72ba509232a07fd56509ab8c57a6203fcb86b384becaad4d133781`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/plans/RESTRUCTURING-MAP.md#구조-개편-이동표와-의존-규칙` | [docs/records/archive/project-restructuring.md#restructuring-map--구조-개편-이동표와-의존-규칙](archive/project-restructuring.md#restructuring-map--구조-개편-이동표와-의존-규칙) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/RESTRUCTURING-MAP.md#경계` | [docs/records/archive/project-restructuring.md#restructuring-map--경계](archive/project-restructuring.md#restructuring-map--경계) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/RESTRUCTURING-MAP.md#소스-이동-실행-결과-참조처는-이동-전-기준` | [docs/records/archive/project-restructuring.md#restructuring-map--소스-이동-실행-결과-참조처는-이동-전-기준](archive/project-restructuring.md#restructuring-map--소스-이동-실행-결과-참조처는-이동-전-기준) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/RESTRUCTURING-MAP.md#테스트문서도구-이동` | [docs/records/archive/project-restructuring.md#restructuring-map--테스트문서도구-이동](archive/project-restructuring.md#restructuring-map--테스트문서도구-이동) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/RESTRUCTURING-MAP.md#역할-분리와-최종-배치` | [docs/records/archive/project-restructuring.md#restructuring-map--역할-분리와-최종-배치](archive/project-restructuring.md#restructuring-map--역할-분리와-최종-배치) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/architecture/CODE-MAINTENANCE.md</summary>

원문 SHA-256: `ac836e3541c70ae514f361891fe6d5d124b6111c175907666d42079364e177dc`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/architecture/CODE-MAINTENANCE.md#코드-정리--2026-10-13` | [docs/records/archive/project-restructuring.md#code-maintenance--코드-정리--2026-10-13](archive/project-restructuring.md#code-maintenance--코드-정리--2026-10-13) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/CODE-MAINTENANCE.md#판단` | [docs/records/archive/project-restructuring.md#code-maintenance--판단](archive/project-restructuring.md#code-maintenance--판단) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/CODE-MAINTENANCE.md#적용-내용` | [docs/records/archive/project-restructuring.md#code-maintenance--적용-내용](archive/project-restructuring.md#code-maintenance--적용-내용) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/CODE-MAINTENANCE.md#검증-과정` | [docs/records/archive/project-restructuring.md#code-maintenance--검증-과정](archive/project-restructuring.md#code-maintenance--검증-과정) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/plans/PROJECT-QUALITY.md</summary>

원문 SHA-256: `0578b3c0b20301ab525114217a9d11164ccbdd9a15278db71cf0b0c0ef40dd8c`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/plans/PROJECT-QUALITY.md#프로젝트-품질-보완--2026-10-21` | [docs/records/archive/project-quality.md#project-quality--프로젝트-품질-보완--2026-10-21](archive/project-quality.md#project-quality--프로젝트-품질-보완--2026-10-21) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-QUALITY.md#순서` | [docs/records/archive/project-quality.md#project-quality--순서](archive/project-quality.md#project-quality--순서) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-QUALITY.md#결과` | [docs/records/archive/project-quality.md#project-quality--결과](archive/project-quality.md#project-quality--결과) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/PROJECT-QUALITY.md#후속-릴리스-검증` | [docs/records/archive/project-quality.md#project-quality--후속-릴리스-검증](archive/project-quality.md#project-quality--후속-릴리스-검증) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/operations/DEPENDENCY-SECURITY.md</summary>

원문 SHA-256: `1b800c7ed6f0f51f2b76c4cdcb3c826d1a77f33b2816676094eaf0eab64d32ce`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/operations/DEPENDENCY-SECURITY.md#의존성-보안-점검--2026-10-14` | [docs/records/archive/project-quality.md#dependency-security--의존성-보안-점검--2026-10-14](archive/project-quality.md#dependency-security--의존성-보안-점검--2026-10-14) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/DEPENDENCY-SECURITY.md#조사-결과` | [docs/records/archive/project-quality.md#dependency-security--조사-결과](archive/project-quality.md#dependency-security--조사-결과) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/DEPENDENCY-SECURITY.md#영향-패키지-11개와-수정` | [docs/records/archive/project-quality.md#dependency-security--영향-패키지-11개와-수정](archive/project-quality.md#dependency-security--영향-패키지-11개와-수정) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/DEPENDENCY-SECURITY.md#공개-앱에-미치는-실제-영향` | [docs/records/archive/project-quality.md#dependency-security--공개-앱에-미치는-실제-영향](archive/project-quality.md#dependency-security--공개-앱에-미치는-실제-영향) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/DEPENDENCY-SECURITY.md#수정-선택-근거` | [docs/records/archive/project-quality.md#dependency-security--수정-선택-근거](archive/project-quality.md#dependency-security--수정-선택-근거) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/DEPENDENCY-SECURITY.md#검증-결과` | [docs/records/archive/project-quality.md#dependency-security--검증-결과](archive/project-quality.md#dependency-security--검증-결과) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/DEPENDENCY-SECURITY.md#상위-프로젝트-근거` | [docs/records/archive/project-quality.md#dependency-security--상위-프로젝트-근거](archive/project-quality.md#dependency-security--상위-프로젝트-근거) | 이관·안내 삭제(사용자 승인) |
| `docs/operations/DEPENDENCY-SECURITY.md#운영-반영` | [docs/records/archive/project-quality.md#dependency-security--운영-반영](archive/project-quality.md#dependency-security--운영-반영) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/plans/RULE-DOCUMENTATION-REORGANIZATION.md</summary>

원문 SHA-256: `8fa46a40ba6d3e1e73feca6d2c6f740eb904b43570ced062a282bc0863139774`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/plans/RULE-DOCUMENTATION-REORGANIZATION.md#프로젝트-rule-문서-정리` | [docs/records/archive/documentation-reorganization.md#rule-documentation-reorganization--프로젝트-rule-문서-정리](archive/documentation-reorganization.md#rule-documentation-reorganization--프로젝트-rule-문서-정리) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/RULE-DOCUMENTATION-REORGANIZATION.md#분리-기준` | [docs/records/archive/documentation-reorganization.md#rule-documentation-reorganization--분리-기준](archive/documentation-reorganization.md#rule-documentation-reorganization--분리-기준) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/RULE-DOCUMENTATION-REORGANIZATION.md#결과` | [docs/records/archive/documentation-reorganization.md#rule-documentation-reorganization--결과](archive/documentation-reorganization.md#rule-documentation-reorganization--결과) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/RULE-DOCUMENTATION-REORGANIZATION.md#현행-rule-잔여-이력-재점검` | [docs/records/archive/documentation-reorganization.md#rule-documentation-reorganization--현행-rule-잔여-이력-재점검](archive/documentation-reorganization.md#rule-documentation-reorganization--현행-rule-잔여-이력-재점검) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/architecture/MUSICXML-INTEGRATION.md</summary>

원문 SHA-256: `c94163bc35a166429afc9f7a19d09793e3a4881b53067bdcd01e0e178d22ec8c`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/architecture/MUSICXML-INTEGRATION.md#pdf--musicxml-main-통합` | [docs/records/archive/musicxml-evaluation.md#musicxml-integration--pdf--musicxml-main-통합](archive/musicxml-evaluation.md#musicxml-integration--pdf--musicxml-main-통합) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/MUSICXML-INTEGRATION.md#검증-결과와-자료-보존` | [docs/records/archive/musicxml-evaluation.md#musicxml-integration--검증-결과와-자료-보존](archive/musicxml-evaluation.md#musicxml-integration--검증-결과와-자료-보존) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/MUSICXML-COMPARISON.md</summary>

원문 SHA-256: `d99d7f64d24c869b6a5b11ea239458288f937dbf2b6964b78d0aae1e459aed78`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/MUSICXML-COMPARISON.md#두-musicxml의-원본-복원-품질-비교--2026-09-19` | [docs/records/archive/musicxml-evaluation.md#musicxml-comparison--두-musicxml의-원본-복원-품질-비교--2026-09-19](archive/musicxml-evaluation.md#musicxml-comparison--두-musicxml의-원본-복원-품질-비교--2026-09-19) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-COMPARISON.md#결론` | [docs/records/archive/musicxml-evaluation.md#musicxml-comparison--결론](archive/musicxml-evaluation.md#musicxml-comparison--결론) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-COMPARISON.md#핵심-수치` | [docs/records/archive/musicxml-evaluation.md#musicxml-comparison--핵심-수치](archive/musicxml-evaluation.md#musicxml-comparison--핵심-수치) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-COMPARISON.md#마디별-리듬-점수` | [docs/records/archive/musicxml-evaluation.md#musicxml-comparison--마디별-리듬-점수](archive/musicxml-evaluation.md#musicxml-comparison--마디별-리듬-점수) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-COMPARISON.md#실제로-확인한-차이` | [docs/records/archive/musicxml-evaluation.md#musicxml-comparison--실제로-확인한-차이](archive/musicxml-evaluation.md#musicxml-comparison--실제로-확인한-차이) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-COMPARISON.md#렌더-대조와-보존` | [docs/records/archive/musicxml-evaluation.md#musicxml-comparison--렌더-대조와-보존](archive/musicxml-evaluation.md#musicxml-comparison--렌더-대조와-보존) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/MUSICXML-TROUBLESHOOTING.md</summary>

원문 SHA-256: `ee8ef317a0512c7475454db2c76810ffc8e81b9bc7dce76cc7a67a5a96247224`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#악보-변환-문제-해결-기록` | [docs/records/archive/musicxml-evaluation.md#musicxml-troubleshooting--악보-변환-문제-해결-기록](archive/musicxml-evaluation.md#musicxml-troubleshooting--악보-변환-문제-해결-기록) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#지시문-높이재열기-내부-id-차이-2026-10-23` | [docs/records/songs/red-sunset.md#musicxml-troubleshooting--지시문-높이재열기-내부-id-차이-2026-10-23](songs/red-sunset.md#musicxml-troubleshooting--지시문-높이재열기-내부-id-차이-2026-10-23) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#하이햇-o의-연속-동작과-musicxml-개별-기호를-혼동함-2026-10-23` | [docs/records/songs/red-sunset.md#musicxml-troubleshooting--하이햇-o의-연속-동작과-musicxml-개별-기호를-혼동함-2026-10-23](songs/red-sunset.md#musicxml-troubleshooting--하이햇-o의-연속-동작과-musicxml-개별-기호를-혼동함-2026-10-23) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#독립-svg에서-섹션-끝-숫자가-박스를-벗어남-2026-10-23` | [docs/records/archive/rendering-experiments.md#musicxml-troubleshooting--독립-svg에서-섹션-끝-숫자가-박스를-벗어남-2026-10-23](archive/rendering-experiments.md#musicxml-troubleshooting--독립-svg에서-섹션-끝-숫자가-박스를-벗어남-2026-10-23) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#먼저-볼-근거` | [docs/how-to/produce-score.md#musicxml-troubleshooting--먼저-볼-근거](../how-to/produce-score.md#musicxml-troubleshooting--먼저-볼-근거) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#loveholic에서-해결한-사례` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--loveholic에서-해결한-사례](songs/loveholic.md#musicxml-troubleshooting--loveholic에서-해결한-사례) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#현재-기준-가창-차이로-악보-가사를-보정하지-않음` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--현재-기준-가창-차이로-악보-가사를-보정하지-않음](songs/loveholic.md#musicxml-troubleshooting--현재-기준-가창-차이로-악보-가사를-보정하지-않음) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#인쇄-가사-수록을-음원-인식-성공에-종속시킴` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--인쇄-가사-수록을-음원-인식-성공에-종속시킴](songs/loveholic.md#musicxml-troubleshooting--인쇄-가사-수록을-음원-인식-성공에-종속시킴) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#인쇄-음절-대응과-가창-길이를-혼동함--표준-가사-성부-후속` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--인쇄-음절-대응과-가창-길이를-혼동함--표준-가사-성부-후속](songs/loveholic.md#musicxml-troubleshooting--인쇄-음절-대응과-가창-길이를-혼동함--표준-가사-성부-후속) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#svg-음표머리-개수에-쉼표가-포함됨` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--svg-음표머리-개수에-쉼표가-포함됨](songs/loveholic.md#musicxml-troubleshooting--svg-음표머리-개수에-쉼표가-포함됨) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#확정-악기-매핑을-다시-질문함` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--확정-악기-매핑을-다시-질문함](songs/loveholic.md#musicxml-troubleshooting--확정-악기-매핑을-다시-질문함) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#opus-줄기깃발-좌표-때문에-음가가-맞지-않음` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--opus-줄기깃발-좌표-때문에-음가가-맞지-않음](songs/loveholic.md#musicxml-troubleshooting--opus-줄기깃발-좌표-때문에-음가가-맞지-않음) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#로컬-musicxml-xsd-import-실패` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--로컬-musicxml-xsd-import-실패](songs/loveholic.md#musicxml-troubleshooting--로컬-musicxml-xsd-import-실패) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#pdf-원본-래스터가-잘리거나-png-한글이-로-보임` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--pdf-원본-래스터가-잘리거나-png-한글이-로-보임](songs/loveholic.md#musicxml-troubleshooting--pdf-원본-래스터가-잘리거나-png-한글이-로-보임) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#pdf-연습-영역에서-이전-줄-가사-혼입자기-가사-잘림` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--pdf-연습-영역에서-이전-줄-가사-혼입자기-가사-잘림](songs/loveholic.md#musicxml-troubleshooting--pdf-연습-영역에서-이전-줄-가사-혼입자기-가사-잘림) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#드럼-집중-테스트가-guitar-practice의-동명-테스트도-수집함` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--드럼-집중-테스트가-guitar-practice의-동명-테스트도-수집함](songs/loveholic.md#musicxml-troubleshooting--드럼-집중-테스트가-guitar-practice의-동명-테스트도-수집함) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#생성용최종-xml-파일명이-macos에서-충돌함` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--생성용최종-xml-파일명이-macos에서-충돌함](songs/loveholic.md#musicxml-troubleshooting--생성용최종-xml-파일명이-macos에서-충돌함) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#실행-회복과-미해결-항목을-구분` | [docs/how-to/produce-score.md#musicxml-troubleshooting--실행-회복과-미해결-항목을-구분](../how-to/produce-score.md#musicxml-troubleshooting--실행-회복과-미해결-항목을-구분) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#줄별-마디-구성과-줄-앞-타악기-표기의-과거-결정-대조` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--줄별-마디-구성과-줄-앞-타악기-표기의-과거-결정-대조](songs/loveholic.md#musicxml-troubleshooting--줄별-마디-구성과-줄-앞-타악기-표기의-과거-결정-대조) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#2026-10-03-반열림-전용-기호와-pdf-표시-경계-해결` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--2026-10-03-반열림-전용-기호와-pdf-표시-경계-해결](songs/loveholic.md#musicxml-troubleshooting--2026-10-03-반열림-전용-기호와-pdf-표시-경계-해결) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#half-muted-보존만으로는-타악기-주법이-출력되지-않음` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--half-muted-보존만으로는-타악기-주법이-출력되지-않음](songs/loveholic.md#musicxml-troubleshooting--half-muted-보존만으로는-타악기-주법이-출력되지-않음) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#다른-곡의-pdf-자르기-좌표를-재사용할-수-없음` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--다른-곡의-pdf-자르기-좌표를-재사용할-수-없음](songs/loveholic.md#musicxml-troubleshooting--다른-곡의-pdf-자르기-좌표를-재사용할-수-없음) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#재현-명령이-초기-산출물을-덮어쓸-수-있음` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--재현-명령이-초기-산출물을-덮어쓸-수-있음](songs/loveholic.md#musicxml-troubleshooting--재현-명령이-초기-산출물을-덮어쓸-수-있음) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#zip-미디어를-파일-확장자로-찾을-수-없음` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--zip-미디어를-파일-확장자로-찾을-수-없음](songs/loveholic.md#musicxml-troubleshooting--zip-미디어를-파일-확장자로-찾을-수-없음) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#새-사례-기록-형식` | [docs/how-to/produce-score.md#musicxml-troubleshooting--새-사례-기록-형식](../how-to/produce-score.md#musicxml-troubleshooting--새-사례-기록-형식) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#2026-10-03-문서-모순범위-정리` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--2026-10-03-문서-모순범위-정리](songs/loveholic.md#musicxml-troubleshooting--2026-10-03-문서-모순범위-정리) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#2026-10-03-loveholic-pdf-가사-중앙-표시와-음표-좌표-차이` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--2026-10-03-loveholic-pdf-가사-중앙-표시와-음표-좌표-차이](songs/loveholic.md#musicxml-troubleshooting--2026-10-03-loveholic-pdf-가사-중앙-표시와-음표-좌표-차이) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/MUSICXML-TROUBLESHOOTING.md#pdf-검수-러브홀릭-103마디에서-중단-2026-10-21` | [docs/records/songs/loveholic.md#musicxml-troubleshooting--pdf-검수-러브홀릭-103마디에서-중단-2026-10-21](songs/loveholic.md#musicxml-troubleshooting--pdf-검수-러브홀릭-103마디에서-중단-2026-10-21) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/records/SCORE-PROCESS-EVIDENCE.md</summary>

원문 SHA-256: `6a6b19c62771601875ae89590355aa64891df89f95561c1aa909602a791ede44`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/records/SCORE-PROCESS-EVIDENCE.md#제작-프로세스-정리-당시-근거` | [docs/records/archive/musicxml-evaluation.md#score-process-evidence--제작-프로세스-정리-당시-근거](archive/musicxml-evaluation.md#score-process-evidence--제작-프로세스-정리-당시-근거) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SCORE-PROCESS-EVIDENCE.md#이관-원문--score-production-processmd--15` | [docs/records/archive/musicxml-evaluation.md#score-process-evidence--이관-원문--score-production-processmd--15](archive/musicxml-evaluation.md#score-process-evidence--이관-원문--score-production-processmd--15) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SCORE-PROCESS-EVIDENCE.md#두-제작에서-확인한-근거와-재발-방지` | [docs/records/archive/musicxml-evaluation.md#score-process-evidence--두-제작에서-확인한-근거와-재발-방지](archive/musicxml-evaluation.md#score-process-evidence--두-제작에서-확인한-근거와-재발-방지) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SCORE-PROCESS-EVIDENCE.md#이관-원문--score-production-processmd--16` | [docs/records/archive/musicxml-evaluation.md#score-process-evidence--이관-원문--score-production-processmd--16](archive/musicxml-evaluation.md#score-process-evidence--이관-원문--score-production-processmd--16) | 이관·안내 삭제(사용자 승인) |
| `docs/records/SCORE-PROCESS-EVIDENCE.md#확인한-자료와-현재-미확인-사항--2026-10-04` | [docs/records/archive/musicxml-evaluation.md#score-process-evidence--확인한-자료와-현재-미확인-사항--2026-10-04](archive/musicxml-evaluation.md#score-process-evidence--확인한-자료와-현재-미확인-사항--2026-10-04) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/architecture/LOAD-TIMING.md</summary>

원문 SHA-256: `edf2890c92d66d61f8383118402f58842532abd92c96c7d1be76d1f06f6b6ab3`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/architecture/LOAD-TIMING.md#악보-열기-시간-측정` | [docs/records/archive/rendering-experiments.md#load-timing--악보-열기-시간-측정](archive/rendering-experiments.md#load-timing--악보-열기-시간-측정) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/LOAD-TIMING.md#site-비교` | [docs/records/archive/rendering-experiments.md#load-timing--site-비교](archive/rendering-experiments.md#load-timing--site-비교) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/LOAD-TIMING.md#2026-10-06-0007-kst--公開-site-safari-실측` | [docs/records/archive/rendering-experiments.md#load-timing--2026-10-06-0007-kst--公開-site-safari-실측](archive/rendering-experiments.md#load-timing--2026-10-06-0007-kst--公開-site-safari-실측) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/architecture/OSMD-UPGRADE-20261023.md</summary>

원문 SHA-256: `e55fe8a99fd3570991834b73d6ce5483015ea6527a85183daac906ce8b05bbd4`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/architecture/OSMD-UPGRADE-20261023.md#osmd-221-업데이트` | [docs/records/archive/rendering-experiments.md#osmd-upgrade-20261023--osmd-221-업데이트](archive/rendering-experiments.md#osmd-upgrade-20261023--osmd-221-업데이트) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/OSMD-UPGRADE-20261023.md#대상-버전` | [docs/records/archive/rendering-experiments.md#osmd-upgrade-20261023--대상-버전](archive/rendering-experiments.md#osmd-upgrade-20261023--대상-버전) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/OSMD-UPGRADE-20261023.md#실행검증` | [docs/records/archive/rendering-experiments.md#osmd-upgrade-20261023--실행검증](archive/rendering-experiments.md#osmd-upgrade-20261023--실행검증) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/OSMD-UPGRADE-20261023.md#개발-서버-캐시-문제와-해결` | [docs/records/archive/rendering-experiments.md#osmd-upgrade-20261023--개발-서버-캐시-문제와-해결](archive/rendering-experiments.md#osmd-upgrade-20261023--개발-서버-캐시-문제와-해결) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/architecture/REHEARSAL-FONT-FIX-20261023.md</summary>

원문 SHA-256: `cf79429cb91a55a60e17164c988b1b0eb693592221d417c463c2a304c87105c5`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/architecture/REHEARSAL-FONT-FIX-20261023.md#섹션-테두리의-글꼴-측정출력-일치` | [docs/records/archive/rendering-experiments.md#rehearsal-font-fix-20261023--섹션-테두리의-글꼴-측정출력-일치](archive/rendering-experiments.md#rehearsal-font-fix-20261023--섹션-테두리의-글꼴-측정출력-일치) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/REHEARSAL-FONT-FIX-20261023.md#재현된-원인` | [docs/records/archive/rendering-experiments.md#rehearsal-font-fix-20261023--재현된-원인](archive/rendering-experiments.md#rehearsal-font-fix-20261023--재현된-원인) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/REHEARSAL-FONT-FIX-20261023.md#승인된-해결-방법` | [docs/records/archive/rendering-experiments.md#rehearsal-font-fix-20261023--승인된-해결-방법](archive/rendering-experiments.md#rehearsal-font-fix-20261023--승인된-해결-방법) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/REHEARSAL-FONT-FIX-20261023.md#검증-상태` | [docs/records/archive/rendering-experiments.md#rehearsal-font-fix-20261023--검증-상태](archive/rendering-experiments.md#rehearsal-font-fix-20261023--검증-상태) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/REHEARSAL-FONT-FIX-20261023.md#시행-중-확인한-한계와-다음-기준` | [docs/records/archive/rendering-experiments.md#rehearsal-font-fix-20261023--시행-중-확인한-한계와-다음-기준](archive/rendering-experiments.md#rehearsal-font-fix-20261023--시행-중-확인한-한계와-다음-기준) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/architecture/WORDS-POSITION-20261023.md</summary>

원문 SHA-256: `71ba398e486b96294f1a7a607c62381193127d4f20e35b5f386cb25c8e500dce`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/architecture/WORDS-POSITION-20261023.md#연주-지시-words-세로-위치-지원--2026-10-23` | [docs/records/archive/rendering-experiments.md#words-position-20261023--연주-지시-words-세로-위치-지원--2026-10-23](archive/rendering-experiments.md#words-position-20261023--연주-지시-words-세로-위치-지원--2026-10-23) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/WORDS-POSITION-20261023.md#근거와-현재-진단` | [docs/records/archive/rendering-experiments.md#words-position-20261023--근거와-현재-진단](archive/rendering-experiments.md#words-position-20261023--근거와-현재-진단) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/WORDS-POSITION-20261023.md#구현` | [docs/records/archive/rendering-experiments.md#words-position-20261023--구현](archive/rendering-experiments.md#words-position-20261023--구현) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/WORDS-POSITION-20261023.md#지원-경계` | [docs/records/archive/rendering-experiments.md#words-position-20261023--지원-경계](archive/rendering-experiments.md#words-position-20261023--지원-경계) | 이관·안내 삭제(사용자 승인) |
| `docs/architecture/WORDS-POSITION-20261023.md#실제-입력-검증` | [docs/records/archive/rendering-experiments.md#words-position-20261023--실제-입력-검증](archive/rendering-experiments.md#words-position-20261023--실제-입력-검증) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/SECTION-DIRECTION-FINAL-20261023.md</summary>

원문 SHA-256: `8a38b49f9a4041abcc916b012f2aefca6ddeff1aad8b9303f3fc888a4355949a`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/SECTION-DIRECTION-FINAL-20261023.md#갑자기붉은-노을-전체-재조판` | [docs/records/archive/rendering-experiments.md#section-direction-final-20261023--갑자기붉은-노을-전체-재조판](archive/rendering-experiments.md#section-direction-final-20261023--갑자기붉은-노을-전체-재조판) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-FINAL-20261023.md#전체-결과` | [docs/records/archive/rendering-experiments.md#section-direction-final-20261023--전체-결과](archive/rendering-experiments.md#section-direction-final-20261023--전체-결과) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-FINAL-20261023.md#글꼴과-넘침-원인` | [docs/records/archive/rendering-experiments.md#section-direction-final-20261023--글꼴과-넘침-원인](archive/rendering-experiments.md#section-direction-final-20261023--글꼴과-넘침-원인) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-FINAL-20261023.md#최소-표시-offset` | [docs/records/archive/rendering-experiments.md#section-direction-final-20261023--최소-표시-offset](archive/rendering-experiments.md#section-direction-final-20261023--최소-표시-offset) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-FINAL-20261023.md#검증과-보존` | [docs/records/archive/rendering-experiments.md#section-direction-final-20261023--검증과-보존](archive/rendering-experiments.md#section-direction-final-20261023--검증과-보존) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-FINAL-20261023.md#재현과-근거` | [docs/records/archive/rendering-experiments.md#section-direction-final-20261023--재현과-근거](archive/rendering-experiments.md#section-direction-final-20261023--재현과-근거) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-FINAL-20261023.md#개발-인계` | [docs/records/archive/rendering-experiments.md#section-direction-final-20261023--개발-인계](archive/rendering-experiments.md#section-direction-final-20261023--개발-인계) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/SECTION-DIRECTION-LAYOUT-REVIEW.md</summary>

원문 SHA-256: `d9346da1e51560ea4a9b9339bf176f09d9c922718963b907a9ee9db7a669b34b`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/SECTION-DIRECTION-LAYOUT-REVIEW.md#섹션-표제연주-지시의-svg-공동-검토` | [docs/records/archive/rendering-experiments.md#section-direction-layout-review--섹션-표제연주-지시의-svg-공동-검토](archive/rendering-experiments.md#section-direction-layout-review--섹션-표제연주-지시의-svg-공동-검토) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-LAYOUT-REVIEW.md#초기-의미-결정과-후속-배치-승인` | [docs/records/archive/rendering-experiments.md#section-direction-layout-review--초기-의미-결정과-후속-배치-승인](archive/rendering-experiments.md#section-direction-layout-review--초기-의미-결정과-후속-배치-승인) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-LAYOUT-REVIEW.md#분리-교정이-필요한-현재-수록본` | [docs/records/archive/rendering-experiments.md#section-direction-layout-review--분리-교정이-필요한-현재-수록본](archive/rendering-experiments.md#section-direction-layout-review--분리-교정이-필요한-현재-수록본) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-LAYOUT-REVIEW.md#보존된-과거판과-제작-출력` | [docs/records/archive/rendering-experiments.md#section-direction-layout-review--보존된-과거판과-제작-출력](archive/rendering-experiments.md#section-direction-layout-review--보존된-과거판과-제작-출력) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-LAYOUT-REVIEW.md#추가-의미-검토-후보` | [docs/records/archive/rendering-experiments.md#section-direction-layout-review--추가-의미-검토-후보](archive/rendering-experiments.md#section-direction-layout-review--추가-의미-검토-후보) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-LAYOUT-REVIEW.md#조사-근거와-다음-단계` | [docs/records/archive/rendering-experiments.md#section-direction-layout-review--조사-근거와-다음-단계](archive/rendering-experiments.md#section-direction-layout-review--조사-근거와-다음-단계) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-LAYOUT-REVIEW.md#갑자기-5마디-오른쪽-배치-시안-v1` | [docs/records/archive/rendering-experiments.md#section-direction-layout-review--갑자기-5마디-오른쪽-배치-시안-v1](archive/rendering-experiments.md#section-direction-layout-review--갑자기-5마디-오른쪽-배치-시안-v1) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-LAYOUT-REVIEW.md#두-곡-전체-v2--음표-앵커-배치` | [docs/records/archive/rendering-experiments.md#section-direction-layout-review--두-곡-전체-v2--음표-앵커-배치](archive/rendering-experiments.md#section-direction-layout-review--두-곡-전체-v2--음표-앵커-배치) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-LAYOUT-REVIEW.md#구현검증` | [docs/records/archive/rendering-experiments.md#section-direction-layout-review--구현검증](archive/rendering-experiments.md#section-direction-layout-review--구현검증) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-LAYOUT-REVIEW.md#xml-표시-위치-재조사--2026-10-23` | [docs/records/archive/rendering-experiments.md#section-direction-layout-review--xml-표시-위치-재조사--2026-10-23](archive/rendering-experiments.md#section-direction-layout-review--xml-표시-위치-재조사--2026-10-23) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-LAYOUT-REVIEW.md#대표-마디-v3--xml-offset과-현재-기본-정렬-비교` | [docs/records/archive/rendering-experiments.md#section-direction-layout-review--대표-마디-v3--xml-offset과-현재-기본-정렬-비교](archive/rendering-experiments.md#section-direction-layout-review--대표-마디-v3--xml-offset과-현재-기본-정렬-비교) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-LAYOUT-REVIEW.md#후속-15박-표본--v4` | [docs/records/archive/rendering-experiments.md#section-direction-layout-review--후속-15박-표본--v4](archive/rendering-experiments.md#section-direction-layout-review--후속-15박-표본--v4) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-LAYOUT-REVIEW.md#섹션-좌측-정렬-복구--v5` | [docs/records/archive/rendering-experiments.md#section-direction-layout-review--섹션-좌측-정렬-복구--v5](archive/rendering-experiments.md#section-direction-layout-review--섹션-좌측-정렬-복구--v5) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-LAYOUT-REVIEW.md#xml-위치-속성-입력과-조판기-미지원-재현--v6` | [docs/records/archive/rendering-experiments.md#section-direction-layout-review--xml-위치-속성-입력과-조판기-미지원-재현--v6](archive/rendering-experiments.md#section-direction-layout-review--xml-위치-속성-입력과-조판기-미지원-재현--v6) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/SECTION-DIRECTION-LAYOUT-REVIEW.md#제작-svg에서-00625박-offset-확인--v7` | [docs/records/archive/rendering-experiments.md#section-direction-layout-review--제작-svg에서-00625박-offset-확인--v7](archive/rendering-experiments.md#section-direction-layout-review--제작-svg에서-00625박-offset-확인--v7) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/plans/documentation-consolidation.md</summary>

원문 SHA-256: `b592582f4caf47e42ef6941c92fa0e2c3db1c221e3450dd6aef265e8bf91f441`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/plans/documentation-consolidation.md#프로젝트-문서-구조-통합-실행-계획` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--프로젝트-문서-구조-통합-실행-계획](archive/documentation-reorganization.md#documentation-consolidation--프로젝트-문서-구조-통합-실행-계획) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#1-적용-상태와-선행-작업` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--1-적용-상태와-선행-작업](archive/documentation-reorganization.md#documentation-consolidation--1-적용-상태와-선행-작업) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#2-설계-기준` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--2-설계-기준](archive/documentation-reorganization.md#documentation-consolidation--2-설계-기준) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#3-목표-파일-구조` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--3-목표-파일-구조](archive/documentation-reorganization.md#documentation-consolidation--3-목표-파일-구조) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#4-현행-rule-이전표` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--4-현행-rule-이전표](archive/documentation-reorganization.md#documentation-consolidation--4-현행-rule-이전표) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#5-실행-절차-이전표` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--5-실행-절차-이전표](archive/documentation-reorganization.md#documentation-consolidation--5-실행-절차-이전표) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#6-기록과거-문서-이전표` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--6-기록과거-문서-이전표](archive/documentation-reorganization.md#documentation-consolidation--6-기록과거-문서-이전표) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#7-이동-예외와-링크-호환성` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--7-이동-예외와-링크-호환성](archive/documentation-reorganization.md#documentation-consolidation--7-이동-예외와-링크-호환성) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#71-코드가-읽는-화면-소유권-표` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--71-코드가-읽는-화면-소유권-표](archive/documentation-reorganization.md#documentation-consolidation--71-코드가-읽는-화면-소유권-표) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#72-생성-문서와-자산` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--72-생성-문서와-자산](archive/documentation-reorganization.md#documentation-consolidation--72-생성-문서와-자산) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#73-기존-주소와-원문-보존` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--73-기존-주소와-원문-보존](archive/documentation-reorganization.md#documentation-consolidation--73-기존-주소와-원문-보존) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#8-실행-순서와-완료-조건` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--8-실행-순서와-완료-조건](archive/documentation-reorganization.md#documentation-consolidation--8-실행-순서와-완료-조건) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#단계-0--최신-상태와-이전표-확정` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--단계-0--최신-상태와-이전표-확정](archive/documentation-reorganization.md#documentation-consolidation--단계-0--최신-상태와-이전표-확정) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#단계-1--현행-정본-통합` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--단계-1--현행-정본-통합](archive/documentation-reorganization.md#documentation-consolidation--단계-1--현행-정본-통합) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#단계-2--절차와-기록-통합` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--단계-2--절차와-기록-통합](archive/documentation-reorganization.md#documentation-consolidation--단계-2--절차와-기록-통합) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#단계-3--탐색과-참조-전환` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--단계-3--탐색과-참조-전환](archive/documentation-reorganization.md#documentation-consolidation--단계-3--탐색과-참조-전환) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#단계-4--검증과-결과-기록` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--단계-4--검증과-결과-기록](archive/documentation-reorganization.md#documentation-consolidation--단계-4--검증과-결과-기록) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#9-검증-항목` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--9-검증-항목](archive/documentation-reorganization.md#documentation-consolidation--9-검증-항목) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#10-실행-결과에-남길-내용` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--10-실행-결과에-남길-내용](archive/documentation-reorganization.md#documentation-consolidation--10-실행-결과에-남길-내용) | 이관·안내 삭제(사용자 승인) |
| `docs/plans/documentation-consolidation.md#11-실행-체크리스트` | [docs/records/archive/documentation-reorganization.md#documentation-consolidation--11-실행-체크리스트](archive/documentation-reorganization.md#documentation-consolidation--11-실행-체크리스트) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/README.md</summary>

원문 SHA-256: `7a83cb8dad5f07d0911bf1e2605d892d4e8dcb44562427662c1278c66d6c486c`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| [docs/README.md#프로젝트-문서-안내](../README.md#프로젝트-문서-안내) | [docs/records/archive/documentation-reorganization.md#docs-readme--프로젝트-문서-안내](archive/documentation-reorganization.md#docs-readme--프로젝트-문서-안내) | 이관·기존 주소 보존 |
| [docs/README.md#개발운영](../README.md#개발운영) | [docs/records/archive/documentation-reorganization.md#docs-readme--개발운영](archive/documentation-reorganization.md#docs-readme--개발운영) | 이관·기존 주소 보존 |
| [docs/README.md#악보-제작표시-정본](../README.md#악보-제작표시-정본) | [docs/records/archive/documentation-reorganization.md#docs-readme--악보-제작표시-정본](archive/documentation-reorganization.md#docs-readme--악보-제작표시-정본) | 이관·기존 주소 보존 |
| [docs/README.md#보존한-제작-자료](../README.md#보존한-제작-자료) | [docs/records/archive/documentation-reorganization.md#docs-readme--보존한-제작-자료](archive/documentation-reorganization.md#docs-readme--보존한-제작-자료) | 이관·기존 주소 보존 |
| [docs/README.md#기록-유지-규칙](../README.md#기록-유지-규칙) | [docs/records/archive/documentation-reorganization.md#docs-readme--기록-유지-규칙](archive/documentation-reorganization.md#docs-readme--기록-유지-규칙) | 이관·기존 주소 보존 |

</details>

<details>
<summary>docs/RULES-INDEX.md</summary>

원문 SHA-256: `33d7ec2f2669f30cd5f16e84fec8b11f77a8a7c1331b7fab22a8b0ca4a0bb9ee`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| [docs/RULES-INDEX.md#프로젝트-전체-rule-목록](../RULES-INDEX.md#프로젝트-전체-rule-목록) | [docs/records/archive/documentation-reorganization.md#rules-index--프로젝트-전체-rule-목록](archive/documentation-reorganization.md#rules-index--프로젝트-전체-rule-목록) | 이관·기존 주소 보존 |
| [docs/RULES-INDEX.md#적용-순서와-권위](../RULES-INDEX.md#적용-순서와-권위) | [docs/records/archive/documentation-reorganization.md#rules-index--적용-순서와-권위](archive/documentation-reorganization.md#rules-index--적용-순서와-권위) | 이관·기존 주소 보존 |
| [docs/RULES-INDEX.md#현행-rule](../RULES-INDEX.md#현행-rule) | [docs/records/archive/documentation-reorganization.md#rules-index--현행-rule](archive/documentation-reorganization.md#rules-index--현행-rule) | 이관·기존 주소 보존 |
| [docs/RULES-INDEX.md#전체-markdown-문서-분류](../RULES-INDEX.md#전체-markdown-문서-분류) | [docs/records/archive/documentation-reorganization.md#rules-index--전체-markdown-문서-분류](archive/documentation-reorganization.md#rules-index--전체-markdown-문서-분류) | 이관·기존 주소 보존 |
| [docs/RULES-INDEX.md#유지와-검증](../RULES-INDEX.md#유지와-검증) | [docs/records/archive/documentation-reorganization.md#rules-index--유지와-검증](archive/documentation-reorganization.md#rules-index--유지와-검증) | 이관·기존 주소 보존 |

</details>

<details>
<summary>docs/procedures/README.md</summary>

원문 SHA-256: `74030c643bd34722ae5c350c558022fee2be0a587f754c0f0d5ccc0bdd761279`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/procedures/README.md#실행-절차-목록` | [docs/records/archive/documentation-reorganization.md#docs-procedures-readme--실행-절차-목록](archive/documentation-reorganization.md#docs-procedures-readme--실행-절차-목록) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/records/README.md</summary>

원문 SHA-256: `d915eaa5db76125bb337530ff29780a0d93328de8098263b11a32690d1295f9c`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| [docs/records/README.md#사실-기록과-참고-자료](README.md#사실-기록과-참고-자료) | [docs/records/archive/documentation-reorganization.md#docs-records-readme--사실-기록과-참고-자료](archive/documentation-reorganization.md#docs-records-readme--사실-기록과-참고-자료) | 이관·기존 주소 보존 |

</details>

<details>
<summary>docs/score-production/JAPANESE-CANONICAL-READINGS.md</summary>

원문 SHA-256: `9e909e585039289c1cadea08a34e1094e961ae8f02f41575c8a67230dddac91b`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/JAPANESE-CANONICAL-READINGS.md#일본어-정본과-검수한-한글-발음` | [docs/records/songs/real-paradis.md#japanese-canonical-readings--일본어-정본과-검수한-한글-발음](songs/real-paradis.md#japanese-canonical-readings--일본어-정본과-검수한-한글-발음) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/JAPANESE-CANONICAL-READINGS.md#반영-내역과-싱크-경계` | [docs/records/songs/real-paradis.md#japanese-canonical-readings--반영-내역과-싱크-경계](songs/real-paradis.md#japanese-canonical-readings--반영-내역과-싱크-경계) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/LYRIC-ACCURACY-REVIEW.md</summary>

원문 SHA-256: `126274b10eaaad5148b1fcb27cd28eba9b47d11979917072d2c4b3fb94024f38`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/LYRIC-ACCURACY-REVIEW.md#가사-시각-정확성-감사--2026-09-19` | [docs/records/songs/real-paradis.md#lyric-accuracy-review--가사-시각-정확성-감사--2026-09-19](songs/real-paradis.md#lyric-accuracy-review--가사-시각-정확성-감사--2026-09-19) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-ACCURACY-REVIEW.md#결론` | [docs/records/songs/real-paradis.md#lyric-accuracy-review--결론](songs/real-paradis.md#lyric-accuracy-review--결론) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-ACCURACY-REVIEW.md#현재-자료-대조` | [docs/records/songs/real-paradis.md#lyric-accuracy-review--현재-자료-대조](songs/real-paradis.md#lyric-accuracy-review--현재-자료-대조) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-ACCURACY-REVIEW.md#48마디` | [docs/records/songs/real-paradis.md#lyric-accuracy-review--48마디](songs/real-paradis.md#lyric-accuracy-review--48마디) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-ACCURACY-REVIEW.md#실제-정확도-평가에-필요한-자료` | [docs/records/songs/real-paradis.md#lyric-accuracy-review--실제-정확도-평가에-필요한-자료](songs/real-paradis.md#lyric-accuracy-review--실제-정확도-평가에-필요한-자료) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-ACCURACY-REVIEW.md#후속-사용자-청취-기준` | [docs/records/songs/real-paradis.md#lyric-accuracy-review--후속-사용자-청취-기준](songs/real-paradis.md#lyric-accuracy-review--후속-사용자-청취-기준) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/LYRIC-ALIGNMENT-AUDIT.md</summary>

원문 SHA-256: `21fc16871c99ab477366b241facabbd44e6b33c96f0dd66429daa77234ba9f4c`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/LYRIC-ALIGNMENT-AUDIT.md#가사-정렬-검증-상태--2026-09-19` | [docs/records/songs/real-paradis.md#lyric-alignment-audit--가사-정렬-검증-상태--2026-09-19](songs/real-paradis.md#lyric-alignment-audit--가사-정렬-검증-상태--2026-09-19) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-ALIGNMENT-AUDIT.md#확인된-방법과-한계` | [docs/records/songs/real-paradis.md#lyric-alignment-audit--확인된-방법과-한계](songs/real-paradis.md#lyric-alignment-audit--확인된-방법과-한계) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-ALIGNMENT-AUDIT.md#48마디` | [docs/records/songs/real-paradis.md#lyric-alignment-audit--48마디](songs/real-paradis.md#lyric-alignment-audit--48마디) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-ALIGNMENT-AUDIT.md#후속-완료-기준` | [docs/records/songs/real-paradis.md#lyric-alignment-audit--후속-완료-기준](songs/real-paradis.md#lyric-alignment-audit--후속-완료-기준) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/LYRIC-SYNC-CORRECTION.md</summary>

원문 SHA-256: `5935c1634c547e5d3162dacc5ea034f7bf71c2abb9f6a9e5706b2dea80c55508`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| [docs/score-production/LYRIC-SYNC-CORRECTION.md#가사-싱크-보정--2026-09-19](../score-production/LYRIC-SYNC-CORRECTION.md#가사-싱크-보정--2026-09-19) | [docs/records/songs/real-paradis.md#lyric-sync-correction--가사-싱크-보정--2026-09-19](songs/real-paradis.md#lyric-sync-correction--가사-싱크-보정--2026-09-19) | 이관·기존 주소 보존 |
| [docs/score-production/LYRIC-SYNC-CORRECTION.md#반영-결과](../score-production/LYRIC-SYNC-CORRECTION.md#반영-결과) | [docs/records/songs/real-paradis.md#lyric-sync-correction--반영-결과](songs/real-paradis.md#lyric-sync-correction--반영-결과) | 이관·기존 주소 보존 |
| [docs/score-production/LYRIC-SYNC-CORRECTION.md#판단과-근거](../score-production/LYRIC-SYNC-CORRECTION.md#판단과-근거) | [docs/records/songs/real-paradis.md#lyric-sync-correction--판단과-근거](songs/real-paradis.md#lyric-sync-correction--판단과-근거) | 이관·기존 주소 보존 |
| [docs/score-production/LYRIC-SYNC-CORRECTION.md#앱-적용과-사용자-수정-보존](../score-production/LYRIC-SYNC-CORRECTION.md#앱-적용과-사용자-수정-보존) | [docs/records/songs/real-paradis.md#lyric-sync-correction--앱-적용과-사용자-수정-보존](songs/real-paradis.md#lyric-sync-correction--앱-적용과-사용자-수정-보존) | 이관·기존 주소 보존 |
| [docs/score-production/LYRIC-SYNC-CORRECTION.md#검증재현](../score-production/LYRIC-SYNC-CORRECTION.md#검증재현) | [docs/records/songs/real-paradis.md#lyric-sync-correction--검증재현](songs/real-paradis.md#lyric-sync-correction--검증재현) | 이관·기존 주소 보존 |
| [docs/score-production/LYRIC-SYNC-CORRECTION.md#15마디-사용자-기준으로-다시-시험한-결과](../score-production/LYRIC-SYNC-CORRECTION.md#15마디-사용자-기준으로-다시-시험한-결과) | [docs/records/songs/real-paradis.md#lyric-sync-correction--15마디-사용자-기준으로-다시-시험한-결과](songs/real-paradis.md#lyric-sync-correction--15마디-사용자-기준으로-다시-시험한-결과) | 이관·기존 주소 보존 |
| [docs/score-production/LYRIC-SYNC-CORRECTION.md#추가-반영--사용자-최대-반영-지시](../score-production/LYRIC-SYNC-CORRECTION.md#추가-반영--사용자-최대-반영-지시) | [docs/records/songs/real-paradis.md#lyric-sync-correction--추가-반영--사용자-최대-반영-지시](songs/real-paradis.md#lyric-sync-correction--추가-반영--사용자-최대-반영-지시) | 이관·기존 주소 보존 |

</details>

<details>
<summary>docs/score-production/LYRIC-SYNC-FEEDBACK.md</summary>

원문 SHA-256: `485670098dc41d467a55f45bbc38e08013a6584cf0a38810e718a1689940c27b`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#가사-싱크-청취-피드백-누적` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--가사-싱크-청취-피드백-누적](songs/real-paradis.md#lyric-sync-feedback--가사-싱크-청취-피드백-누적) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#002-전달-원문` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--002-전달-원문](songs/real-paradis.md#lyric-sync-feedback--002-전달-원문) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#003-전달-원문` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--003-전달-원문](songs/real-paradis.md#lyric-sync-feedback--003-전달-원문) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#069-전달-원문-접수-f001-이후-대상-확정` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--069-전달-원문-접수-f001-이후-대상-확정](songs/real-paradis.md#lyric-sync-feedback--069-전달-원문-접수-f001-이후-대상-확정) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#070-전달-원문` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--070-전달-원문](songs/real-paradis.md#lyric-sync-feedback--070-전달-원문) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#071-전달-원문` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--071-전달-원문](songs/real-paradis.md#lyric-sync-feedback--071-전달-원문) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#069070-최종-재확인-및-v5-적용` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--069070-최종-재확인-및-v5-적용](songs/real-paradis.md#lyric-sync-feedback--069070-최종-재확인-및-v5-적용) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#069-첫-나-재측정--22097초-앱-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--069-첫-나-재측정--22097초-앱-미반영](songs/real-paradis.md#lyric-sync-feedback--069-첫-나-재측정--22097초-앱-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#070-두-번째-나-재측정--23368초-앱-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--070-두-번째-나-재측정--23368초-앱-미반영](songs/real-paradis.md#lyric-sync-feedback--070-두-번째-나-재측정--23368초-앱-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#¼박-격자-적용-이후-전달-규칙` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--¼박-격자-적용-이후-전달-규칙](songs/real-paradis.md#lyric-sync-feedback--¼박-격자-적용-이후-전달-규칙) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#10마디-4박--¾-루-중복-삭제-요청` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--10마디-4박--¾-루-중복-삭제-요청](songs/real-paradis.md#lyric-sync-feedback--10마디-4박--¾-루-중복-삭제-요청) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#스크린샷-후-원인-확정--앞선-가설-정정` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--스크린샷-후-원인-확정--앞선-가설-정정](songs/real-paradis.md#lyric-sync-feedback--스크린샷-후-원인-확정--앞선-가설-정정) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-토오쿠-히카루의-첫-토--13마디-2박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-토오쿠-히카루의-첫-토--13마디-2박-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-토오쿠-히카루의-첫-토--13마디-2박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#토오쿠-기준-뒤-전체-¼박-일괄-반영-완료` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--토오쿠-기준-뒤-전체-¼박-일괄-반영-완료](songs/real-paradis.md#lyric-sync-feedback--토오쿠-기준-뒤-전체-¼박-일괄-반영-완료) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#206--나다라카나의-다-시작-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--206--나다라카나의-다-시작-미반영](songs/real-paradis.md#lyric-sync-feedback--206--나다라카나의-다-시작-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#207--나다라카나의-라-시작-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--207--나다라카나의-라-시작-미반영](songs/real-paradis.md#lyric-sync-feedback--207--나다라카나의-라-시작-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#208--나다라카나의-카-시작-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--208--나다라카나의-카-시작-미반영](songs/real-paradis.md#lyric-sync-feedback--208--나다라카나의-카-시작-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#209210212--현재-위치-맞음-확인-상태-반영-대기` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--209210212--현재-위치-맞음-확인-상태-반영-대기](songs/real-paradis.md#lyric-sync-feedback--209210212--현재-위치-맞음-확인-상태-반영-대기) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-후리카에루토의-첫-후--12마디-2박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-후리카에루토의-첫-후--12마디-2박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-후리카에루토의-첫-후--12마디-2박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#072074--현재-위치-맞음-확인-상태-반영-대기` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--072074--현재-위치-맞음-확인-상태-반영-대기](songs/real-paradis.md#lyric-sync-feedback--072074--현재-위치-맞음-확인-상태-반영-대기) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-코노-오카노-이에의-첫-코--15마디-2박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-코노-오카노-이에의-첫-코--15마디-2박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-코노-오카노-이에의-첫-코--15마디-2박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#18마디-코--시작-정정-및-그-앞-구간-확인-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--18마디-코--시작-정정-및-그-앞-구간-확인-미반영](songs/real-paradis.md#lyric-sync-feedback--18마디-코--시작-정정-및-그-앞-구간-확인-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-소-얏테이쿠시의-첫-소---19마디-2박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-소-얏테이쿠시의-첫-소---19마디-2박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-소-얏테이쿠시의-첫-소---19마디-2박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-카제노츠의-첫-카--20마디-3박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-카제노츠의-첫-카--20마디-3박-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-카제노츠의-첫-카--20마디-3박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-아사가니의-첫-아--21마디-2박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-아사가니의-첫-아--21마디-2박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-아사가니의-첫-아--21마디-2박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-무카이카제우의-첫-무--22마디-4박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-무카이카제우의-첫-무--22마디-4박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-무카이카제우의-첫-무--22마디-4박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-마쿠노레루요의-첫-마--23마디-4박-¾-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-마쿠노레루요의-첫-마--23마디-4박-¾-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-마쿠노레루요의-첫-마--23마디-4박-¾-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#마-위치-재정정--24마디-1박-최신값` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--마-위치-재정정--24마디-1박-최신값](songs/real-paradis.md#lyric-sync-feedback--마-위치-재정정--24마디-1박-최신값) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-쿠--노--레--루--요의-첫-쿠--24마디-2박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-쿠--노--레--루--요의-첫-쿠--24마디-2박-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-쿠--노--레--루--요의-첫-쿠--24마디-2박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-노--레--루--요의-첫-노--24마디-3박-¼-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-노--레--루--요의-첫-노--24마디-3박-¼-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-노--레--루--요의-첫-노--24마디-3박-¼-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#누적-교정-일괄-반영-완료--24마디-노까지` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--누적-교정-일괄-반영-완료--24마디-노까지](songs/real-paradis.md#lyric-sync-feedback--누적-교정-일괄-반영-완료--24마디-노까지) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#일괄-반영-후-재교정-케---스-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--일괄-반영-후-재교정-케---스-미반영](songs/real-paradis.md#lyric-sync-feedback--일괄-반영-후-재교정-케---스-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#일괄-반영-후-재교정-쿄-데테이쿠와의-첫-쿄--미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--일괄-반영-후-재교정-쿄-데테이쿠와의-첫-쿄--미반영](songs/real-paradis.md#lyric-sync-feedback--일괄-반영-후-재교정-쿄-데테이쿠와의-첫-쿄--미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#일괄-반영-후-재교정-요이아사가니의-이-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--일괄-반영-후-재교정-요이아사가니의-이-미반영](songs/real-paradis.md#lyric-sync-feedback--일괄-반영-후-재교정-요이아사가니의-이-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#일괄-반영-후-재교정-우마쿠노레루요의-첫-우-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--일괄-반영-후-재교정-우마쿠노레루요의-첫-우-미반영](songs/real-paradis.md#lyric-sync-feedback--일괄-반영-후-재교정-우마쿠노레루요의-첫-우-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#일괄-반영-후-재교정-노레루요의-첫-노-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--일괄-반영-후-재교정-노레루요의-첫-노-미반영](songs/real-paradis.md#lyric-sync-feedback--일괄-반영-후-재교정-노레루요의-첫-노-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#일괄-반영-후-교정-노레루요의-마지막-요-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--일괄-반영-후-교정-노레루요의-마지막-요-미반영](songs/real-paradis.md#lyric-sync-feedback--일괄-반영-후-교정-노레루요의-마지막-요-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재교정-일괄-반영-완료--24마디-마지막-요까지` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재교정-일괄-반영-완료--24마디-마지막-요까지](songs/real-paradis.md#lyric-sync-feedback--재교정-일괄-반영-완료--24마디-마지막-요까지) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재교정-토오쿠히카의-쿠--13마디-3박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재교정-토오쿠히카의-쿠--13마디-3박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--재교정-토오쿠히카의-쿠--13마디-3박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재교정-토오쿠히카의-히--13마디-4박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재교정-토오쿠히카의-히--13마디-4박-미반영](songs/real-paradis.md#lyric-sync-feedback--재교정-토오쿠히카의-히--13마디-4박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재교정-토오쿠히카의-카--13마디-4박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재교정-토오쿠히카의-카--13마디-4박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--재교정-토오쿠히카의-카--13마디-4박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재교정-루아카이야네의-아--14마디-3박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재교정-루아카이야네의-아--14마디-3박-미반영](songs/real-paradis.md#lyric-sync-feedback--재교정-루아카이야네의-아--14마디-3박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재교정-카제노츠의-제--20마디-3박-¼-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재교정-카제노츠의-제--20마디-3박-¼-미반영](songs/real-paradis.md#lyric-sync-feedback--재교정-카제노츠의-제--20마디-3박-¼-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재교정-카제노츠의-노--20마디-4박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재교정-카제노츠의-노--20마디-4박-미반영](songs/real-paradis.md#lyric-sync-feedback--재교정-카제노츠의-노--20마디-4박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재교정-카제노츠의-츠--20마디-4박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재교정-카제노츠의-츠--20마디-4박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--재교정-카제노츠의-츠--20마디-4박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재교정-요이아사가니의-이--21마디-2박-최신값미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재교정-요이아사가니의-이--21마디-2박-최신값미반영](songs/real-paradis.md#lyric-sync-feedback--재교정-요이아사가니의-이--21마디-2박-최신값미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재교정-요이아사가니의-가--21마디-4박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재교정-요이아사가니의-가--21마디-4박-미반영](songs/real-paradis.md#lyric-sync-feedback--재교정-요이아사가니의-가--21마디-4박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재교정-카이카제우의-이--23마디-2박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재교정-카이카제우의-이--23마디-2박-미반영](songs/real-paradis.md#lyric-sync-feedback--재교정-카이카제우의-이--23마디-2박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-코코로나라코의-라--29마디-3박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-코코로나라코의-라--29마디-3박-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-코코로나라코의-라--29마디-3박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-코코로나라코의-마지막-코--29마디-4박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-코코로나라코의-마지막-코--29마디-4박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-코코로나라코의-마지막-코--29마디-4박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-코니탓테루소시의-소--30마디-4박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-코니탓테루소시의-소--30마디-4박-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-코니탓테루소시의-소--30마디-4박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재교정-코니탓테루소시의-니--30마디-1박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재교정-코니탓테루소시의-니--30마디-1박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--재교정-코니탓테루소시의-니--30마디-1박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-코니탓테루소시의-시--30마디-4박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-코니탓테루소시의-시--30마디-4박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-코니탓테루소시의-시--30마디-4박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-코니탓테루소시의-시--30마디-4박-¼-확인-상태-반영-대기` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-코니탓테루소시의-시--30마디-4박-¼-확인-상태-반영-대기](songs/real-paradis.md#lyric-sync-feedback--구절-지정-코니탓테루소시의-시--30마디-4박-¼-확인-상태-반영-대기) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-소시테의-테--30마디-4박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-소시테의-테--30마디-4박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-소시테의-테--30마디-4박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-once--31마디-1박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-once--31마디-1박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-once--31마디-1박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#again-음절-분할-교정--a---gain-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--again-음절-분할-교정--a---gain-미반영](songs/real-paradis.md#lyric-sync-feedback--again-음절-분할-교정--a---gain-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-아루키다스요의-첫-아--32마디-2박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-아루키다스요의-첫-아--32마디-2박-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-아루키다스요의-첫-아--32마디-2박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-아루키다스요의-키--32마디-3박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-아루키다스요의-키--32마디-3박-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-아루키다스요의-키--32마디-3박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-아루키다스요의-다--32마디-3박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-아루키다스요의-다--32마디-3박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-아루키다스요의-다--32마디-3박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-아루키다스요의-마지막-요--32마디-4박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-아루키다스요의-마지막-요--32마디-4박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-아루키다스요의-마지막-요--32마디-4박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#누적-교정-일괄-반영-완료--32마디-마지막-요까지` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--누적-교정-일괄-반영-완료--32마디-마지막-요까지](songs/real-paradis.md#lyric-sync-feedback--누적-교정-일괄-반영-완료--32마디-마지막-요까지) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-페-지의-지--35마디-3박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-페-지의-지--35마디-3박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-페-지의-지--35마디-3박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-페-지다케가의-케--35마디-4박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-페-지다케가의-케--35마디-4박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-페-지다케가의-케--35마디-4박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#케-위치-재정정--35마디-4박-¾-최신값미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--케-위치-재정정--35마디-4박-¾-최신값미반영](songs/real-paradis.md#lyric-sync-feedback--케-위치-재정정--35마디-4박-¾-최신값미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-다케가의-가--35마디-4박-¾-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-다케가의-가--35마디-4박-¾-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-다케가의-가--35마디-4박-¾-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#케-위치-재정정--35마디-4박-½-최신값미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--케-위치-재정정--35마디-4박-½-최신값미반영](songs/real-paradis.md#lyric-sync-feedback--케-위치-재정정--35마디-4박-½-최신값미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-노코사레테모코의-모--36마디-3박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-노코사레테모코의-모--36마디-3박-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-노코사레테모코의-모--36마디-3박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-노코사레테모-다음-코--36마디-4박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-노코사레테모-다음-코--36마디-4박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-노코사레테모-다음-코--36마디-4박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#누적-교정-일괄-반영-완료--36마디-코까지` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--누적-교정-일괄-반영-완료--36마디-코까지](songs/real-paradis.md#lyric-sync-feedback--누적-교정-일괄-반영-완료--36마디-코까지) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재교정-스베테오우시낫의-우--34마디-3박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재교정-스베테오우시낫의-우--34마디-3박-미반영](songs/real-paradis.md#lyric-sync-feedback--재교정-스베테오우시낫의-우--34마디-3박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재교정-스베테오우시낫의-첫-스--34마디-1박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재교정-스베테오우시낫의-첫-스--34마디-1박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--재교정-스베테오우시낫의-첫-스--34마디-1박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재확인-스베테오우시낫의-테--34마디-2박` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재확인-스베테오우시낫의-테--34마디-2박](songs/real-paradis.md#lyric-sync-feedback--재확인-스베테오우시낫의-테--34마디-2박) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#34마디-stt음원-재검사-적용-완료` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--34마디-stt음원-재검사-적용-완료](songs/real-paradis.md#lyric-sync-feedback--34마디-stt음원-재검사-적용-완료) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#216-낫--34마디-4박-사용자-재교정미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--216-낫--34마디-4박-사용자-재교정미반영](songs/real-paradis.md#lyric-sync-feedback--216-낫--34마디-4박-사용자-재교정미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재교정-테시로이페-지다케가의-시--35마디-1박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재교정-테시로이페-지다케가의-시--35마디-1박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--재교정-테시로이페-지다케가의-시--35마디-1박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재교정-시로이의-로--35마디-1박-¾-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재교정-시로이의-로--35마디-1박-¾-미반영](songs/real-paradis.md#lyric-sync-feedback--재교정-시로이의-로--35마디-1박-¾-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재확인-시로이의-이--35마디-2박` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재확인-시로이의-이--35마디-2박](songs/real-paradis.md#lyric-sync-feedback--재확인-시로이의-이--35마디-2박) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#재교정-노코사레테모코의-첫-노--36마디-1박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--재교정-노코사레테모코의-첫-노--36마디-1박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--재교정-노코사레테모코의-첫-노--36마디-1박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-노무네키의-무--37마디-2박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-노무네키의-무--37마디-2박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-노무네키의-무--37마디-2박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-보-노히와의-노--38마디-2박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-보-노히와의-노--38마디-2박-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-보-노히와의-노--38마디-2박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-보-노히와의-히--38마디-3박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-보-노히와의-히--38마디-3박-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-보-노히와의-히--38마디-3박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#구절-지정-보-노히와의-와--38마디-3박-¼-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--구절-지정-보-노히와의-와--38마디-3박-¼-미반영](songs/real-paradis.md#lyric-sync-feedback--구절-지정-보-노히와의-와--38마디-3박-¼-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#always의-al--시작--38마디-4박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--always의-al--시작--38마디-4박-미반영](songs/real-paradis.md#lyric-sync-feedback--always의-al--시작--38마디-4박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#al--시작-재정정--38마디-4박-½-최신값미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--al--시작-재정정--38마디-4박-½-최신값미반영](songs/real-paradis.md#lyric-sync-feedback--al--시작-재정정--38마디-4박-½-최신값미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#always-음절-분할-교정--al---ways-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--always-음절-분할-교정--al---ways-미반영](songs/real-paradis.md#lyric-sync-feedback--always-음절-분할-교정--al---ways-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#why-시작-관측-및-41마디-표시-문제` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--why-시작-관측-및-41마디-표시-문제](songs/real-paradis.md#lyric-sync-feedback--why-시작-관측-및-41마디-표시-문제) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#bright-오기-수정-및-39마디-시작-접수` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--bright-오기-수정-및-39마디-시작-접수](songs/real-paradis.md#lyric-sync-feedback--bright-오기-수정-및-39마디-시작-접수) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#2026-09-19-누적-일괄-반영-완료--39마디-bright까지` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--2026-09-19-누적-일괄-반영-완료--39마디-bright까지](songs/real-paradis.md#lyric-sync-feedback--2026-09-19-누적-일괄-반영-완료--39마디-bright까지) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#카베노무코-의-카--45마디-2박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--카베노무코-의-카--45마디-2박-미반영](songs/real-paradis.md#lyric-sync-feedback--카베노무코-의-카--45마디-2박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#카베노무코-의-베--45마디-3박-½-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--카베노무코-의-베--45마디-3박-½-미반영](songs/real-paradis.md#lyric-sync-feedback--카베노무코-의-베--45마디-3박-½-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#카베노무코-의-노--45마디-4박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--카베노무코-의-노--45마디-4박-미반영](songs/real-paradis.md#lyric-sync-feedback--카베노무코-의-노--45마디-4박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#카베노무코-의-코---46마디-1박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--카베노무코-의-코---46마디-1박-미반영](songs/real-paradis.md#lyric-sync-feedback--카베노무코-의-코---46마디-1박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#카베노무코-의-무--45마디-4박-¼-위치-재확인일괄-반영-대기` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--카베노무코-의-무--45마디-4박-¼-위치-재확인일괄-반영-대기](songs/real-paradis.md#lyric-sync-feedback--카베노무코-의-무--45마디-4박-¼-위치-재확인일괄-반영-대기) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#카베노무코-의-무--45마디-4박-½-미반영최신-개별-교정` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--카베노무코-의-무--45마디-4박-½-미반영최신-개별-교정](songs/real-paradis.md#lyric-sync-feedback--카베노무코-의-무--45마디-4박-½-미반영최신-개별-교정) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#미타코토모나이의-토--46마디-4박-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--미타코토모나이의-토--46마디-4박-미반영](songs/real-paradis.md#lyric-sync-feedback--미타코토모나이의-토--46마디-4박-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#4648마디-나이케--오모이아갓--8개-관측-미반영` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--4648마디-나이케--오모이아갓--8개-관측-미반영](songs/real-paradis.md#lyric-sync-feedback--4648마디-나이케--오모이아갓--8개-관측-미반영) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#2026-09-19-일괄-반영-완료--48마디-갓까지` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--2026-09-19-일괄-반영-완료--48마디-갓까지](songs/real-paradis.md#lyric-sync-feedback--2026-09-19-일괄-반영-완료--48마디-갓까지) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#이전-문단-링크` | [docs/records/songs/real-paradis.md#lyric-sync-feedback--가사-싱크-청취-피드백-누적](songs/real-paradis.md#lyric-sync-feedback--가사-싱크-청취-피드백-누적) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-FEEDBACK.md#순차-청취-확인-규칙-최신-사용자-지시` | [docs/decisions/0013-score-based-lyric-positions.md#이관-원문--lyric-sync-feedbackmd--1](../decisions/0013-score-based-lyric-positions.md#이관-원문--lyric-sync-feedbackmd--1) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/LYRIC-SYNC-REVIEW-EVIDENCE.md</summary>

원문 SHA-256: `05caab3d415968ef6f851bad1cd627ab94fa5e7ed87895fd9150f7487666c104`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/LYRIC-SYNC-REVIEW-EVIDENCE.md#교정-목록-재정리-전-근거-069205` | [docs/records/songs/real-paradis.md#lyric-sync-review-evidence--교정-목록-재정리-전-근거-069205](songs/real-paradis.md#lyric-sync-review-evidence--교정-목록-재정리-전-근거-069205) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/LYRIC-SYNC-SUSPECTS-V1.md</summary>

원문 SHA-256: `1fcd3262ed9b600898795f7ab2672050dde0aa9da687294a29154fe145f7c25a`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/LYRIC-SYNC-SUSPECTS-V1.md#남은-가사-싱크-의심-목록` | [docs/records/songs/real-paradis.md#lyric-sync-suspects-v1--남은-가사-싱크-의심-목록](songs/real-paradis.md#lyric-sync-suspects-v1--남은-가사-싱크-의심-목록) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRIC-SYNC-SUSPECTS-V1.md#청취-확인-완료-고유-번호-유지` | [docs/records/songs/real-paradis.md#lyric-sync-suspects-v1--청취-확인-완료-고유-번호-유지](songs/real-paradis.md#lyric-sync-suspects-v1--청취-확인-완료-고유-번호-유지) | 이관·안내 삭제(사용자 승인) |

</details>

<details>
<summary>docs/score-production/LYRIC-SYNC-SUSPECTS.md</summary>

원문 SHA-256: `3d067a8a4e1f50e480bb92fd5cbc5a0cc3d3e301d8e76726b62679396286e8a1`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| [docs/score-production/LYRIC-SYNC-SUSPECTS.md#가사-싱크-교정-목록--¼박-격자-기준](../score-production/LYRIC-SYNC-SUSPECTS.md#가사-싱크-교정-목록--¼박-격자-기준) | [docs/records/songs/real-paradis.md#lyric-sync-suspects--가사-싱크-교정-목록--¼박-격자-기준](songs/real-paradis.md#lyric-sync-suspects--가사-싱크-교정-목록--¼박-격자-기준) | 이관·기존 주소 보존 |
| [docs/score-production/LYRIC-SYNC-SUSPECTS.md#확인-방법](../score-production/LYRIC-SYNC-SUSPECTS.md#확인-방법) | [docs/records/songs/real-paradis.md#lyric-sync-suspects--확인-방법](songs/real-paradis.md#lyric-sync-suspects--확인-방법) | 이관·기존 주소 보존 |
| [docs/score-production/LYRIC-SYNC-SUSPECTS.md#반영-완료--번호-유지](../score-production/LYRIC-SYNC-SUSPECTS.md#반영-완료--번호-유지) | [docs/records/songs/real-paradis.md#lyric-sync-suspects--반영-완료--번호-유지](songs/real-paradis.md#lyric-sync-suspects--반영-완료--번호-유지) | 이관·기존 주소 보존 |

</details>

<details>
<summary>docs/score-production/LYRICS-JAPANESE-COMPARISON.md</summary>

원문 SHA-256: `7750b5c9b2bac112b8d0026f77c11237fab5c2c9986df8ee2c344a64e5d9a395`

| 기존 경로·앵커 | 새 주 목적지 | 처리 |
| --- | --- | --- |
| `docs/score-production/LYRICS-JAPANESE-COMPARISON.md#일본어-가사-대조--사용자-제공-j-lyric-본문` | [docs/records/songs/real-paradis.md#lyrics-japanese-comparison--일본어-가사-대조--사용자-제공-j-lyric-본문](songs/real-paradis.md#lyrics-japanese-comparison--일본어-가사-대조--사용자-제공-j-lyric-본문) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRICS-JAPANESE-COMPARISON.md#일본어-누락깨짐-복원` | [docs/records/songs/real-paradis.md#lyrics-japanese-comparison--일본어-누락깨짐-복원](songs/real-paradis.md#lyrics-japanese-comparison--일본어-누락깨짐-복원) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRICS-JAPANESE-COMPARISON.md#현재-앱의-한글-발음과-실제로-다른-내용` | [docs/records/songs/real-paradis.md#lyrics-japanese-comparison--현재-앱의-한글-발음과-실제로-다른-내용](songs/real-paradis.md#lyrics-japanese-comparison--현재-앱의-한글-발음과-실제로-다른-내용) | 이관·안내 삭제(사용자 승인) |
| `docs/score-production/LYRICS-JAPANESE-COMPARISON.md#이번-자료만으로-바꾸지-않을-내용` | [docs/records/songs/real-paradis.md#lyrics-japanese-comparison--이번-자료만으로-바꾸지-않을-내용](songs/real-paradis.md#lyrics-japanese-comparison--이번-자료만으로-바꾸지-않을-내용) | 이관·안내 삭제(사용자 승인) |

</details>

## 기존 경로에 남긴 문서

| 문서 | 역할·처리 |
| --- | --- |
| [.agents/skills/find-timed-lyrics/SKILL.md](../../.agents/skills/find-timed-lyrics/SKILL.md) | 로컬 스킬·참고, 문서 참조 갱신 또는 그대로 유지; 외부 설치본 변경 없음 |
| [.agents/skills/find-timed-lyrics/references/sources.md](../../.agents/skills/find-timed-lyrics/references/sources.md) | 로컬 스킬·참고, 문서 참조 갱신 또는 그대로 유지; 외부 설치본 변경 없음 |
| [.agents/skills/produce-drum-score/SKILL.md](../../.agents/skills/produce-drum-score/SKILL.md) | 로컬 스킬·참고, 문서 참조 갱신 또는 그대로 유지; 외부 설치본 변경 없음 |
| [.agents/skills/release-drum-practice/SKILL.md](../../.agents/skills/release-drum-practice/SKILL.md) | 로컬 스킬·참고, 문서 참조 갱신 또는 그대로 유지; 외부 설치본 변경 없음 |
| [AGENTS.md](../../AGENTS.md) | 루트 실행 지침 유지, 문서 참조 위치만 전환 |
| [PRD.md](../../PRD.md) | 제품 목표·범위·수용 유지, 상세 중복은 정본으로 연결 |
| [README.md](../../README.md) | 빠른 시작 유지, 상세 개발 절차 이관 |
| [docs/architecture/MUSICXML-SUPPORT.md](../architecture/MUSICXML-SUPPORT.md) | 기존 이력 진입점 유지, 동일 원문 재복제 없이 참조만 갱신 |
| [docs/architecture/RECORDING-TEMPO-APP.md](../architecture/RECORDING-TEMPO-APP.md) | 기존 이력 진입점 유지, 동일 원문 재복제 없이 참조만 갱신 |
| [docs/architecture/SVG-RENDERING.md](../architecture/SVG-RENDERING.md) | 기존 이력 진입점 유지, 동일 원문 재복제 없이 참조만 갱신 |
| [docs/decisions/0001-separate-svg-rules-and-decisions.md](../decisions/0001-separate-svg-rules-and-decisions.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0002-svg-page-output.md](../decisions/0002-svg-page-output.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0003-source-systems-and-cropping.md](../decisions/0003-source-systems-and-cropping.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0004-browser-native-score-rendering.md](../decisions/0004-browser-native-score-rendering.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0005-practice-layout-and-spacing.md](../decisions/0005-practice-layout-and-spacing.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0006-practice-navigation-and-overlays.md](../decisions/0006-practice-navigation-and-overlays.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0007-native-drum-notation.md](../decisions/0007-native-drum-notation.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0008-continuous-playback-wedges.md](../decisions/0008-continuous-playback-wedges.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0009-musicxml-section-direction-layout.md](../decisions/0009-musicxml-section-direction-layout.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0010-pretendard-score-text.md](../decisions/0010-pretendard-score-text.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0011-hi-hat-open-close-position.md](../decisions/0011-hi-hat-open-close-position.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0012-musicxml-canonical-source.md](../decisions/0012-musicxml-canonical-source.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0013-score-based-lyric-positions.md](../decisions/0013-score-based-lyric-positions.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0014-score-artist-and-kit-metadata.md](../decisions/0014-score-artist-and-kit-metadata.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0015-score-tempo-and-recording-estimates.md](../decisions/0015-score-tempo-and-recording-estimates.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0016-explicit-recording-beat-connections.md](../decisions/0016-explicit-recording-beat-connections.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0017-source-dependent-musicxml-conversion.md](../decisions/0017-source-dependent-musicxml-conversion.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0018-reusable-score-production-and-handoff.md](../decisions/0018-reusable-score-production-and-handoff.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0019-preserved-drum-kit-selection.md](../decisions/0019-preserved-drum-kit-selection.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0020-local-editor-and-public-player.md](../decisions/0020-local-editor-and-public-player.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0021-contextual-help-and-shared-ui.md](../decisions/0021-contextual-help-and-shared-ui.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0022-portable-score-and-practice-files.md](../decisions/0022-portable-score-and-practice-files.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0023-shared-module-boundaries.md](../decisions/0023-shared-module-boundaries.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0024-korean-message-catalog.md](../decisions/0024-korean-message-catalog.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0025-shared-app-release-version.md](../decisions/0025-shared-app-release-version.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0026-device-local-audio-analysis.md](../decisions/0026-device-local-audio-analysis.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/0027-verification-scope-and-device-evidence.md](../decisions/0027-verification-scope-and-device-evidence.md) | MADR 원문·식별자·상태 유지, 현재 참조만 전환 |
| [docs/decisions/README.md](../decisions/README.md) | 결정 목록 유지, 참조 전환 |
| [docs/design/legend-diagram/README.md](../design/legend-diagram/README.md) | 생성·자산 경로 예외, 전체 바이트 유지 |
| [docs/plans/COUNT-OFF-NAVIGATION.md](../plans/COUNT-OFF-NAVIGATION.md) | 기존 이력 진입점 유지, 동일 원문 재복제 없이 참조만 갱신 |
| [docs/plans/PLAYBACK-SCREEN-INVENTORY.md](../plans/PLAYBACK-SCREEN-INVENTORY.md) | 기계 입력 예외, 전체 바이트 유지 |
| [docs/plans/REPEAT-RANGE-ACTIONS.md](../plans/REPEAT-RANGE-ACTIONS.md) | 기존 이력 진입점 유지, 동일 원문 재복제 없이 참조만 갱신 |
| [docs/product/IPAD-LANDSCAPE-UX.md](../product/IPAD-LANDSCAPE-UX.md) | 기존 이력 진입점 유지, 동일 원문 재복제 없이 참조만 갱신 |
| [docs/product/RIBBON-READABILITY.md](../product/RIBBON-READABILITY.md) | 기존 이력 진입점 유지, 동일 원문 재복제 없이 참조만 갱신 |
| [docs/product/UI-COMPONENTS.md](../product/UI-COMPONENTS.md) | 생성·자산 경로 예외, 전체 바이트 유지 |
| [history.md](../../history.md) | 과거 기록·증거 경로 유지, 현재 실행 기록 추가 |
| [src/modules/score/vendor/pretendard/README.md](../../src/modules/score/vendor/pretendard/README.md) | 생성·자산 경로 예외, 전체 바이트 유지 |

## 코드·설정 참조 유지

| 소비자 | 유지한 문서 경로 | 처리 |
| --- | --- | --- |
| `scripts/checks/check-playback-architecture.mjs` 및 회귀 테스트 | `docs/plans/PLAYBACK-SCREEN-INVENTORY.md` | P01–P25·E01–E06 포함 전체 바이트 유지, architecture 정본은 링크만 |
| `scripts/build/ui-docs.mjs` | `docs/product/UI-COMPONENTS.md` | 생성 결과 전체 바이트 유지, --check만 실행 |
| `scripts/checks/check-local-assets.mjs` | `docs/operations/TESTING.md` | 오류 안내의 기존 경로 유지, 이전 안내에서 verify로 연결 |
| I.O.I·붉은 노을 인계 프로필 3개 | 기존 `IOI-SUDDENLY-CONVERSION.md`, `RED-SUNSET-OPEN-CLOSE-20261023.md`, `RED-SUNSET-REBUILD-20261023.md` | productionDocument 경로·JSON 값 유지, 이전 안내에서 곡별 원문으로 연결 |
| 가사 데이터 소스 주석 2개 | 기존 `LYRIC-SYNC-SUSPECTS.md`, `LYRIC-SYNC-CORRECTION.md` | 소스 주석은 변경하지 않고 기존 주소에서 곡별 기록 연결 |

`docs/plans/restructuring-map.json`도 Markdown 이전 대상이 아닌 기존 자료로 유지한다. 생성 자산·도구·체크 코드의 수정이나 경로 전환 시험은 이번 통합에 포함하지 않았다.
