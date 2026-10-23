# iPad 환경 확인과 검수

문서 역할: **실행 절차**. 현재 요청과 전역·프로젝트 지침의 승인 범위 안에서 수행한다. [정본 목록](../RULES-INDEX.md)과 [작업별 안내](../README.md)를 먼저 확인한다. 예시 명령·과거 기록은 이번 실행의 성공 증거가 아니다.

<a id="ipad-simulator--ipad-mini-검증-실행-절차"></a>

## iPad mini 검증 실행 절차

문서 역할: **실행 절차**. 검증 판정은 [Rule](../reference/engineering/verification.md#verification-rules--검증-범위와-증거), 선택 이유는 [ADR-0027](../decisions/0027-verification-scope-and-device-evidence.md), 설치·권한·실측 이력은 [사실 기록](../records/ipad.md#ipad-simulator-history--ipad-시뮬레이터-설치연결-기록)에 둔다. 여기에 기록된 기기가 현재 실행 중이라는 뜻은 아니다.

<a id="ipad-simulator--기록된-대상과-사전-확인"></a>

### 기록된 대상과 사전 확인

- 지정 대상: iPad mini (A17 Pro), iOS 27.0, UDID `9ECBE1E1-D908-45A7-AF31-5F9FEAB568E2`.
- 사용자 지정 경로: Safari 응답형 디자인 모드 및 Apple iPad Simulator.
- 대상 앱: `http://127.0.0.1:5173/`, 실제 프로젝트 `src/`의 웹앱.
- 이전 기기·삭제된 런타임은 [환경 기록](../records/ipad.md#ipad-simulator-history--ipad-시뮬레이터-설치연결-기록)에서 조회하고 아래 명령의 대상은 실제 가용 목록과 대조한다.

1. `xcrun simctl list devices available`로 실제 설치·가용 상태와 UDID를 확인한다. 런타임 설치·삭제·초기화가 필요하면 해당 요청 범위를 별도로 확인한다.
2. GUI 사용과 제어 도구의 실제 승인 상태를 확인한다. 과거 승인·도구 목록 조회를 현재 터치 권한으로 간주하지 않는다.
3. Safari 응답형 모드로 레이아웃을 확인한 뒤, 시뮬레이터에서 Safari 툴바·전체화면·회전·한 줄/두 줄·재생·탐색·반복을 필요한 범위로 검수한다.

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
