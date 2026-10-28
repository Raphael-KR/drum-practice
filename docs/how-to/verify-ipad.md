# iPad 환경 확인과 검수

문서 역할: **실행 절차**. 현재 요청과 전역·프로젝트 지침의 승인 범위 안에서 수행한다. [정본 목록](../RULES-INDEX.md)과 [작업별 안내](../README.md)를 먼저 확인한다. 예시 명령·과거 기록은 이번 실행의 성공 증거가 아니다.

<a id="ipad-simulator--ipad-mini-검증-실행-절차"></a>

## iPad mini 검증 실행 절차

문서 역할: **실행 절차**. 검증 판정은 [Rule](../reference/engineering/verification.md#verification-rules--검증-범위와-증거), 선택 이유는 [ADR-0027](../decisions/0027-verification-scope-and-device-evidence.md), 설치·권한·실측 이력은 [사실 기록](../records/ipad.md#ipad-simulator-history--ipad-시뮬레이터-설치연결-기록)에 둔다. 여기에 기록된 기기가 현재 실행 중이라는 뜻은 아니다.

릴리스의 화면 검수는 아래 [Safari 응답형 디자인 모드](#safari-responsive-mode)를 사용한다. iOS·iPadOS 실기기·시뮬레이터 검증은 사용자가 해당 검증을 명시적으로 지시한 경우에만 수행한다. 일반 릴리스에서는 기기 조회·연결·부팅 등 기기 검증 준비도 시작하지 않는다.

<a id="ipad-simulator--기록된-대상과-사전-확인"></a>

### 별도 지시 시 시뮬레이터 대상과 사전 확인

- 지정 대상: iPad mini (A17 Pro), iOS 27.0, UDID `9ECBE1E1-D908-45A7-AF31-5F9FEAB568E2`.
- 시뮬레이터 검증 경로: Apple iPad Simulator.
- 대상 앱: `http://127.0.0.1:5173/`, 실제 프로젝트 `src/`의 웹앱.
- 이전 기기·삭제된 런타임은 [환경 기록](../records/ipad.md#ipad-simulator-history--ipad-시뮬레이터-설치연결-기록)에서 조회하고 아래 명령의 대상은 실제 가용 목록과 대조한다.

1. `xcrun simctl list devices available`로 실제 설치·가용 상태와 UDID를 확인한다. 런타임 설치·삭제·초기화가 필요하면 해당 요청 범위를 별도로 확인한다.
2. GUI 사용과 제어 도구의 실제 승인 상태를 확인한다. 과거 승인·도구 목록 조회를 현재 터치 권한으로 간주하지 않는다.
3. 시뮬레이터에서 Safari 툴바·전체화면·회전·한 줄/두 줄·재생·탐색·반복 중 사용자가 지시한 범위를 검수한다. 응답형 화면 검수 뒤에 자동으로 이어서 수행하지 않는다.

<a id="safari-responsive-mode"></a>

### Safari MCP 창의 응답형 디자인 모드 검사

웹앱 화면 검수의 기본 경로다. Safari MCP로 페이지를 제어하고, 같은 창에서 Computer Use로 응답형 모드와 기기 프리셋을 조작한다. [2026-10-28 실측 기록](../records/ipad.md#safari-responsive-mode-20261028)에서 가려진 도구 막대 조작과 앱 버튼 클릭을 확인했다.

1. 기존 사용자 창을 보존하고 Safari MCP로 검사 탭을 연다. Computer Use의 Safari 접근성 트리에서 URL을 확인해 MCP 탭과 **같은 창**을 선택한다. 필요하면 검사 탭에만 식별용 쿼리를 붙인다.
2. 같은 창의 네이티브 제어에서 ⌃⌘R(`cua_repl`의 `ctrl+super+r`)을 보내거나 `개발자용 → 응답형 디자인 모드 시작`을 선택한다. 접근성 트리에서 `뷰포트 크기`, `폭`, `높이`, `픽셀 비율`이 나타나는지 확인한다. MCP `keyPress`의 `Control+Command+R` 문자열은 당시 조합키로 인식되지 않았으므로 네이티브 입력과 구분한다.
3. MCP 제어 배너가 도구 막대를 가려도 접근성 트리의 `ViewportPresetButton`을 눌러 필요한 기기 프리셋을 선택하고, `뷰포트 회전`을 눌러 방향을 바꾼다. 동작마다 트리를 다시 읽고 최신 요소 번호를 사용한다. 회전 버튼의 on/off 대신 표시된 **폭·높이**로 방향을 확인한다.
4. 같은 MCP 탭에서 페이지를 읽고 버튼을 조작하며 화면을 캡처한다. MCP의 페이지 캡처와 Computer Use의 Safari 창 캡처를 구분한다. 프리셋 표시 크기·페이지의 `innerWidth/innerHeight`·픽셀 비율·미리보기 배율은 각각 기록한다. 이번 검사에서는 프리셋과 실제 페이지 크기가 1px 다르게 관측된 경우가 있다.
5. 연결이 실패하면 실제 오류와 사용한 대체 경로를 기록한다. 승인된 범위에서 공식 `/usr/bin/safaridriver --mcp`의 새 연결을 사용할 수 있으며, 이를 기존 연결의 복구로 기록하지 않는다. 기존 사용자 창·세션을 임의로 종료하지 않는다.
6. 변경한 보기 상태를 복원하고 검사에 생성한 창·탭만 닫는다. 사용자가 창을 유지해 달라고 요청한 경우는 그대로 둔다. 기존 사용자 창과 자료는 보존한다.

이 경로는 macOS Safari의 응답형 레이아웃·기본 조작 검사다. iOS Safari의 주소 막대, 터치 제스처, 오디오 지연·성능 검증을 대신하지 않는다. Simulator 또는 실물 기기 검증은 사용자가 명시적으로 지시한 경우에만 수행한다.

<a id="ipad-simulator--승인-범위-내-cli-예"></a>

### 승인 범위 내 CLI 예

```sh
xcrun simctl list devices available
# 확인한 대상이 종료 상태일 때만 boot한다.
xcrun simctl boot 9ECBE1E1-D908-45A7-AF31-5F9FEAB568E2
xcrun simctl bootstatus 9ECBE1E1-D908-45A7-AF31-5F9FEAB568E2 -b
xcrun simctl openurl 9ECBE1E1-D908-45A7-AF31-5F9FEAB568E2 http://127.0.0.1:5173/
```

설치·제어 복구는 [과거 연결 기록](../records/ipad.md#ipad-simulator-history--ipad-시뮬레이터-설치연결-기록)의 조건을 현재 환경과 대조한 뒤 판단한다. 옛 SIGKILL·런타임 다운로드를 일반 실행 단계로 반복하지 않는다.

<a id="ipad-simulator--승인과-증거의-한계"></a>

### 승인과 증거의 한계

Device Hub 도구가 승인을 요구하면 실제 상태와 기존 승인 범위를 확인하고 필요한 경우에만 재승인을 요청한다. 승인 유효기간에 관한 사용자 제공 정보와 당시 미검증 범위는 [환경 기록](../records/ipad.md#ipad-simulator-history--ipad-시뮬레이터-설치연결-기록)에서 확인한다. 기록된 DeviceHub 경로는 `/Applications/Xcode.app/Contents/Applications/DeviceHub.app`, bundle ID는 `com.apple.dt.Devices`다.

Safari 응답형·Simulator·실물 iPad·Chromium의 결과를 구분한다. 실제 기기 오디오 지연·성능·터치·연주 체감은 시뮬레이터 성공으로 대신하지 않는다. 환경·실제 viewport·수행 행동·증거·미확인을 [검사 절차](verify.md#testing--개발-검사와-로컬-자산-준비)에 따라 기록한다.

Apple 참고: [추가 시뮬레이터 사용](https://developer.apple.com/documentation/safari-developer-tools/adding-additional-simulators).
