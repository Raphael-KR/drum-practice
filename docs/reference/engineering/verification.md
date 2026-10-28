# 검증 범위와 증거

문서 역할: **현행 Rule**. 현재 요구·계약과 지원 한계를 다룬다. [전체 정본](../../RULES-INDEX.md), [실행 안내](../../README.md), [결정 이력](../../decisions/README.md)을 함께 참고한다.

<a id="verification-rules--검증-범위와-증거"></a>

## 검증 범위와 증거

문서 역할: **현행 Rule**. [ADR-0027](../../decisions/0027-verification-scope-and-device-evidence.md), [검사 실행](../../how-to/verify.md#testing--개발-검사와-로컬-자산-준비), [UI 검수](../../how-to/verify.md#ui-review--화면악보재생-검수-절차)를 구분한다. 실행 허가·GUI 권한은 [전역 지침](/Users/raphael/AGENTS.md)과 [프로젝트 지침](../../../AGENTS.md)의 현재 범위를 따른다. 이 문서가 새 권한을 부여하지 않는다.

<a id="verification-rules--범위와-필수-경계"></a>

### 범위와 필수 경계

- 검사는 이 저장소의 `tests/{unit,integration,local-media}`를 사용한다. 다른 프로젝트·checkout·배포 사본은 포함하지 않는다. portable 성공을 local-media·두 앱 빌드 성공으로 대신하지 않는다.
- 실제 자산이 필요한 검사는 없으면 명시적으로 실패한다. 자료를 자동 다운로드·임의 생성·Git 업로드하거나 실패 검사를 삭제/skip하여 통과시키지 않는다.
- 재생 소유권·공통 UI·app/model/shared 경계·player 번들의 제작 코드 유입 차단을 유지한다. ESLint의 억제 baseline·일괄 규칙 해제로 기존 지적을 숨기지 않는다.
- DB 이름·스키마·키·bytes-v1·구형 Blob·snapshot·큐·원자적 저장, 전체 Song/정본/자산과 연습 정보의 보존을 변경 범위에 맞게 확인한다.
- 빌드·테스트가 같은 생성 파일을 쓰거나 읽으면 순차 실행한다. `pretest`·`generate`·build-info 생성의 쓰기를 단순 읽기 검사로 간주하지 않는다.
- 문서만 변경하고 앱·음악 입력이 그대로면 문서·링크·보존을 확인한다. 바뀐 입력에 의존하는 결과만 재생성·재검증하며 과거 PASS를 이번 실행으로 보고하지 않는다.

<a id="verification-rules--환경과-판정"></a>

### 환경과 판정

코드 검사·원본 의미·규격·패키지 왕복·실제 앱 저장/재열기·화면·오디오 예약/출력·사람의 청취는 각각 구분한다. 해시·개수·XSD·렌더 경고 없음은 원본 의미나 모든 주법 지원을 보증하지 않는다. 독립 원본 기대값을 생성기 출력으로 대체하지 않는다.

웹앱 화면 검수는 기본적으로 Safari MCP가 연 창에서 Safari 응답형 디자인 모드를 사용한다. 같은 창의 기기·방향 설정은 Computer Use, 페이지 읽기·조작·캡처는 Safari MCP를 사용한다. 확인할 화면 크기와 기기·방향은 변경 영향과 요청에 맞게 선택한다. 상세 순서는 [응답형 화면 검수](../../how-to/verify-ipad.md#safari-responsive-mode)를 따른다. GUI와 시험은 현재 승인 범위 안에서 수행한다.

Safari MCP의 미지원 기능은 프로젝트 지침에 따라 적합한 도구를 사용하고, 지원 기능의 실패는 원인과 대체 근거를 남긴다. 비교만을 위한 동일 검사 중복은 하지 않는다. iPad는 [지정 환경](../../how-to/verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차)의 Safari 응답형·시뮬레이터·실기기를 구분한다. Chromium viewport를 iPad Safari 검증으로 기록하지 않는다.

실제 재생은 사용자 버튼 조작 후 실제 플레이어 `AudioContext.state=running`과 위치 진행을 확인한다. 다른 인스턴스·합성 click·재생 아이콘만으로 앱 동작을 확정하지 않는다. 오디오 출력 신호·예약 시각은 사람이 들은 음질/싱크와 구분한다.

<a id="verification-rules--결과-기록"></a>

### 결과 기록

입력/후보 해시·명령·버전·환경·대상·수행 행동·관측·실패·증거 경로·미확인과 다음 확인을 기록한다. 로컬 자료 `.tmp/`·`data/production/`의 존재는 다른 checkout에서 전제하지 않는다. 공개 HTTP·실기기·청취·원격 CI는 실제 확인한 경우만 완료로 쓴다. 과거 결과와 이번 재실행을 구분한다.
