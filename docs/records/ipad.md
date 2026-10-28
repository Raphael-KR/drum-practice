# iPad 환경과 진단 기록

문서 역할: **사실·연구 기록**. 원문 날짜·입력·환경·결과·실패·미확인은 각 절의 당시 상태다. 이번 통합에서 과거 검증을 재실행하지 않았으며, 기록의 “현재”는 원래 작성 시점이다. [기록 안내](README.md)와 [현행 정본](../RULES-INDEX.md)을 구분한다.

<a id="safari-responsive-mode-20261028"></a>

## Safari 응답형 디자인 모드 직접 제어 검증 — 2026-10-28

- 사용자 요청으로 macOS Safari 27.0.1의 별도 검사 창에서 로컬 `player.html?rdm-check=20261028`을 열었다. 앱은 0.9.1·소스 빌드 `6fa6969d`이며 앞선 상단바 CSS 수정이 반영된 상태다. 사용자 기존 응답형 창은 보존했다.
- 네이티브 GUI 제어(`cua_repl`)로 `개발자용 → 응답형 디자인 모드 시작`을 직접 선택했다. 프리셋·회전·크기 필드와 앱의 접근성 트리가 노출되고, 검사 창의 PNG 캡처도 성공했다. 처음 기존 창의 캡처에서 `Screenshot unavailable`이 한 번 반환됐으나 새 검사 창에서는 캡처가 정상 반환됐다. 원인은 확정하지 않았다.
- 프리셋과 회전 뒤 확인한 도구 막대 값은 아래와 같다. 값은 응답형 모드 UI에서 읽었으며 해당 창의 JavaScript `innerWidth` 측정값으로 바꾸어 보고하지 않는다. 확대 비율은 Mac 창에 맞춘 미리보기 배율이다.

| 프리셋·방향 | 폭×높이 | 픽셀 비율 | 미리보기 배율 |
| --- | --- | --- | --- |
| iPhone 세로 | 393×852 | 3x | 82% |
| iPhone 가로 | 852×393 | 3x | 100% |
| iPad mini 가로 | 1133×744 | 2x | 94% |
| iPad mini 세로 | 744×1133 | 2x | 62% |

- 같은 응답형 창에서 기존 Loveholic 열기, `1줄 → 2줄 → 1줄` 전환, 도움말 열기·닫기를 직접 실행하고 접근성 선택 상태·화면 변화를 확인했다. iPhone 가로와 iPad mini 세로에서 제목·버전 첫 줄/버튼 둘째 줄 배치를 캡처로 확인했다. 기기 실물 재생·오디오·터치 성능 검사는 수행하지 않았다.
- 현재 Safari MCP의 17개 도구에는 네이티브 메뉴·응답형 프리셋 명령이 없다. 일반 Safari 검사 창을 열고 iPhone 프리셋을 적용한 상태에서 MCP `list_tabs`에는 MCP가 생성한 자동화 탭 하나만 표시됐다. MCP의 URL에는 검사 쿼리가 없고 `innerWidth=1024`, `innerHeight=664`, DPR=2 및 목록 제목을 반환해 응답형 창과 다른 페이지 상태임을 확인했다. 네이티브 GUI 제어 성공과 해당 창의 MCP DOM 연결은 구분하며, 이번 연결에서는 동일 창을 MCP로 제어하지 못했다.
- 후속 사용자 제안으로 MCP 검사 탭에서 `keyPress`에 `Control+Command+R`을 전달했다. 도구는 유효한 키가 아니어서 문자열을 한 글자씩 입력했다고 반환했고, 뷰포트는 1024×664·DPR=2로 유지됐다. `window.focus()` 뒤에도 `document.hasFocus()`는 false였으며 네이티브 Safari 제어는 기존 사용자 창을 선택했다. 대상이 일치하지 않아 OS 조합키는 보내지 않았다. **조합키 전달 자체가 확인되지 않았으므로 MCP 창에서 응답형 모드가 금지된다는 증거는 아니다.** 실제 OS 단축키로 MCP 창에 진입하고 MCP 연결을 유지할 수 있는지는 미검증이다. 해당 검사 탭만 닫았으며 근거는 `mcp-shortcut-attempt.json`이다.
- **후속 수동 단축키 검증:** MCP가 `player.html?mcp-manual-rdm=20261028`을 열고 사용자가 해당 창에서 ⌃⌘R로 진입했다고 확인했다. 같은 MCP 탭 핸들·URL을 유지한 채 실제 `innerWidth/innerHeight`가 1024×664에서 750×1130(DPR=2)으로 바뀌었고 DOM·요소 좌표 읽기, 페이지 PNG 캡처, 도움말 버튼 클릭(`expanded=true`·dialog 표시)이 성공했다. 따라서 위 미검증 중 **MCP 창에서 응답형 모드와 페이지 제어를 함께 사용하는 경로는 확인됐다.** 다만 사용자 보고로 MCP 제어 UI가 상단 응답형 도구 막대를 가렸으며, Computer Use는 계속 기존 일반 Safari 창을 선택해 이 가림을 직접 캡처하지 못했다. OS 단축키 자동 전달과 가려진 기기 메뉴 제어는 여전히 미검증이다. 시험 도움말 닫기 요청은 stale UID로 실패했지만 재조회에서는 도움말이 없고 뷰포트가 955×927인 것을 확인했다. 검사 창은 사용자의 추가 조작을 위해 열어두었다. 근거는 `mcp-manual-verification.json`, `mcp-manual-after-shortcut.png`, `mcp-rdm-help-open.png`다.
- 원래 1줄 보기를 복원하고 검사 창·MCP 생성 탭을 닫았다. 기존 Safari 창의 iPhone SE 667×375, 2x 및 기존 곡·1줄 보기 상태가 유지된 것을 확인했다. 증거는 로컬 `.tmp/safari-responsive-mode-20261028/`의 `iphone-landscape-two-line.png`, `ipad-mini-landscape.png`, `ipad-mini-portrait.png`, 도움말 캡처·접근성 트리, `mcp-separation.json`이다.
- **후속 신규 연결·가려진 메뉴 검증:** 사용자의 Safari 전체 종료 및 MCP 신규 연결 승인에 따라 Safari 종료를 확인한 뒤 공식 `/usr/bin/safaridriver --mcp`에 별도 stdio 연결을 만들었다. 기존 등록 도구는 `Transport closed` 상태였으며 이 연결의 복구를 주장하지 않는다. 새 연결의 `list_tabs`에는 `player.html?mcp-rdm-single=20261028` 탭 하나만 있었고, Computer Use도 같은 URL·창을 선택했다. 네이티브 `ctrl+super+r`로 응답형 모드에 진입했고, 창 캡처로 MCP 배너가 상단 도구 막대를 가리는 현상을 직접 확인했다.
- **가려져도 조작 가능:** 접근성 트리의 `ViewportPresetButton`을 눌러 iPhone·iPad mini 메뉴를 선택하고 `뷰포트 회전`을 눌러 방향을 바꿨다. iPhone UI는 393×852→852×393·3x, 실제 MCP DOM은 392×851→851×393·DPR=3이었다. iPad mini UI는 1133×744→744×1133·2x, 마지막 DOM은 744×1132·DPR=2였다. 이 1px 차이의 원인은 확정하지 않았다. 같은 MCP 연결의 도움말 클릭도 `successful=1`, `expanded=true`로 확인했다. 위 OS 단축키·가려진 메뉴 미검증은 이번 결과로 해소됐으며 iOS 실물·터치·오디오 성능 검증을 뜻하지 않는다. 근거는 `mcp-single-rdm-toolbar.png`, `mcp-single-iphone-landscape.ax.txt`, `mcp-single-ipad-portrait.ax.txt`, `mcp-single-verification.json`이다. 새 검사 창은 사용자가 계속 볼 수 있게 유지한다.
- 실행 절차는 [iPad 검수 안내](../how-to/verify-ipad.md)에 반영했다. 이번 작업은 도구·검수 경로 확인이며 앱 코드·버전 변경, 커밋·푸시·발행은 하지 않았다.

<a id="ipad-simulator-history--ipad-시뮬레이터-설치연결-기록"></a>

## iPad 시뮬레이터 설치·연결 기록

문서 역할: **사실 기록**. 날짜·입력·버전·한계는 당시 관측이다. 현행 요구는 [Rule 목록](../RULES-INDEX.md), 실행 순서는 [절차 목록](../README.md)을 따른다. 아래 검증을 이번 문서 정리에서 다시 실행하지 않았다. 삭제된 Git 제외 증거의 존재를 보장하지 않는다.


원문 출처: `docs/records/IPAD-SIMULATOR-HISTORY.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="ipad-simulator-history--이관-원문--ipad-simulatormd--1"></a>

#### 이관 원문 — IPAD-SIMULATOR.md / 1

출처: [docs/operations/IPAD-SIMULATOR.md](../how-to/verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="ipad-simulator-history--ipad-mini-검증-환경"></a>

##### iPad mini 검증 환경

현재 유지 환경: iOS 27.0 / iPad mini `9ECBE1E1-D908-45A7-AF31-5F9FEAB568E2`.
사용자 요청으로 iOS 18.6 런타임과 해당 기기 데이터는 삭제했다. 아래 18.6 관련 내용·명령은 과거 기록이며 재실행 대상이 아니다.

사용자 지정 도구: Safari 개발자 메뉴의 응답형 디자인 모드 및 Apple iPad Simulator.
대상 웹앱: http://127.0.0.1:5173/ (소스는 src/, 내보낸 HTML 아님).

2026-09-18 확인:
- Xcode 선택 경로: /Applications/Xcode.app/Contents/Developer
- 설치 런타임: iOS 18.6 (22G86)
- 기기: Drum Practice — iPad mini A17 Pro
- UDID: CAC78C7B-F71D-4C5B-B03E-734479387F43
- 기기 유형: com.apple.CoreSimulator.SimDeviceType.iPad-mini-A17-Pro
- 부팅 완료, simctl openurl로 Safari에서 웹앱 열기 성공.
- simctl screenshot에서 1488×2266 세로 화면의 웹앱 첫 화면 확인. 증거: docs/experiments/ipad-mini-first-launch.png (로컬 전용).

```sh
xcrun simctl list devices available
# 종료 상태일 때만 boot 실행
xcrun simctl boot CAC78C7B-F71D-4C5B-B03E-734479387F43
xcrun simctl bootstatus CAC78C7B-F71D-4C5B-B03E-734479387F43 -b
xcrun simctl openurl CAC78C7B-F71D-4C5B-B03E-734479387F43 http://127.0.0.1:5173/
```

향후 레이아웃은 Safari 응답형 모드에서 빠르게 확인하고, iPad 시뮬레이터에서 가로 방향, Safari 툴바/전체화면, 한 줄/두 줄 악보, 재생·탐색·반복을 검증한다. 실제 기기의 오디오 지연·성능·연주 평가는 별도다.

<a id="ipad-simulator-history--이관-원문--ipad-simulatormd--2"></a>

#### 이관 원문 — IPAD-SIMULATOR.md / 2

출처: [docs/operations/IPAD-SIMULATOR.md](../how-to/verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="ipad-simulator-history--device-hub-재시작-및-제어-경로-2026-09-18"></a>

###### Device Hub 재시작 및 제어 경로 (2026-09-18)

- macOS 27.0 / Xcode 27.0에서 앱 경로는 `/Applications/Xcode.app/Contents/Applications/DeviceHub.app`, bundle ID는 `com.apple.dt.Devices`다. 기존 Simulator.app 이름/경로 탐색 실패는 이 경로로 정정한다.
- 사용자는 Device Hub 창이 보인다고 확인했다. Computer Use의 앱 바인딩은 경로·bundle ID·이름에서 `timeoutReached`를 반환한다. 창 부재나 앱 미실행으로 단정하지 않는다.
- 사용자 요청으로 Device Hub를 종료·재실행했다. SIGTERM 후에도 종료되지 않아 해당 프로세스만 SIGKILL 후 다시 실행했다. PID 96680 → 97314. 기기 데이터 초기화는 수행하지 않았다. 재실행 후에도 Computer Use 연결은 시간 초과했다.
- CLI `devicectl`로 `landscapeLeft` 회전 설정 및 재조회 성공. 2266×1488 캡처에서 localhost 웹앱 첫 화면을 확인했다. 증거: `docs/experiments/ipad-mini-landscape-cli.png`.
- 로컬 `xcrun mcpbridge`에서 initialize/tools-list 성공. Xcode MCP의 DeviceInteractionStartSession, DeviceInteractionSynthesize, DeviceInteractionEndSession을 확인했다. Codex 전역 MCP 설정은 변경하지 않았다. 실제 StartSession은 “This agent isn't approved to use Xcode's tools yet”로 거부되었다. 서버는 XcodeOpenWorkspace 또는 XcodeNewProject를 통한 프로젝트 폴더 접근 승인이 필요하다고 안내한다. 도구 목록 조회 성공을 터치 제어 성공으로 간주하지 않는다. 이 검사를 위해 프로젝트를 새로 생성하거나 권한 설정을 변경하지 않았다.

```sh
open /Applications/Xcode.app/Contents/Applications/DeviceHub.app
xcrun devicectl device orientation set --device CAC78C7B-F71D-4C5B-B03E-734479387F43 landscapeLeft
xcrun devicectl device orientation get --device CAC78C7B-F71D-4C5B-B03E-734479387F43
xcrun simctl io CAC78C7B-F71D-4C5B-B03E-734479387F43 screenshot /tmp/ipad-mini.png
```

Safari 응답형 디자인 모드, 전체 연습 흐름, 실제 기기의 성능은 별도 검증 대상이다. Chromium viewport 검증을 iPad Safari 검증으로 소급하지 않는다.

Apple 공식 안내: https://developer.apple.com/documentation/safari-developer-tools/adding-additional-simulators

<a id="ipad-simulator-history--이관-원문--ipad-simulatormd--3"></a>

#### 이관 원문 — IPAD-SIMULATOR.md / 3

출처: [docs/operations/IPAD-SIMULATOR.md](../how-to/verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="ipad-simulator-history--승인-후-재검사"></a>

###### 승인 후 재검사

사용자가 Xcode 승인 완료를 알린 뒤 기존 클라이언트로 재시도했으나 같은 승인 오류가 났다. `DrumPractice.xcworkspace`를 생성해 XcodeOpenWorkspace로 열고 사용자가 표시된 요청을 승인한 뒤, StartSession의 승인 오류는 사라졌다. 웹 소스를 참조하는 작업공간이며 네이티브 앱 타깃은 없다. OpenWorkspace는 실행 대상 해석 시간 초과를 반환했지만 후속 기기 요청은 승인 단계를 통과했다.

새 차단 사유: Device Interaction은 iOS/watchOS/tvOS **27.0 이상 시뮬레이터**를 요구한다. 설치된 런타임은 iOS 18.6뿐이어서 터치 세션은 생성되지 않았다. iOS 27.0 arm64 (24A434) 다운로드를 시도했으나 다운로드 크기 8.05 GB 대비 디스크 여유가 약 12 GiB여서 설치 공간 확보 전 중단했다. 기존 런타임/사용자 파일은 삭제하지 않았다. 다음 단계는 충분한 디스크 공간을 확보하고 iOS 27을 설치한 뒤 프로젝트 전용 iPad mini 기기로 재검사하는 것이다.

<a id="ipad-simulator-history--이관-원문--ipad-simulatormd--4"></a>

#### 이관 원문 — IPAD-SIMULATOR.md / 4

출처: [docs/operations/IPAD-SIMULATOR.md](../how-to/verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="ipad-simulator-history--ios-27-설치-완료-2026-09-18"></a>

###### iOS 27 설치 완료 (2026-09-18)

사용자의 디스크 재확인·설치 요청 후 APFS 여유 26.0 GB(약 24 GiB)를 확인했다. `xcodebuild -downloadPlatform iOS -buildVersion 27.0 -architectureVariant arm64`가 Done/exit 0으로 완료됐다. 별도 simctl 조회에서 iOS 27.0 (24A434), `com.apple.CoreSimulator.SimRuntime.iOS-27-0`, `isAvailable: true`를 확인했다. 설치 직후 남은 공간은 약 16 GiB. iOS 18.6과 기존 기기는 보존했다. iOS 27용 기기 생성·부팅 및 MCP 터치 재검증은 아직 수행하지 않았다.

<a id="ipad-simulator-history--이관-원문--ipad-simulatormd--5"></a>

#### 이관 원문 — IPAD-SIMULATOR.md / 5

출처: [docs/operations/IPAD-SIMULATOR.md](../how-to/verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="ipad-simulator-history--ios-27-mcp-터치-검증-성공-2026-09-18"></a>

###### iOS 27 MCP 터치 검증 성공 (2026-09-18)

현재 검증 기기: iPad mini (A17 Pro), iOS 27.0, UDID `9ECBE1E1-D908-45A7-AF31-5F9FEAB568E2`. 설치 시 생성된 기기를 부팅해 사용했다. 기존 iOS 18.6 기기는 보존. devicectl로 landscapeLeft 설정, Vite localhost:5173 재실행 및 HTTP 200 확인.

Xcode MCP StartSession 성공 후 Safari hierarchy와 screenshot을 확보했다. hierarchy의 hitPoint로 예제 곡 열기, 화면 메뉴 열기, 닫기를 실행하고 각 결과를 확인했다. 1133×744 가로 화면에서 악보·94 BPM·하단 컨트롤이 표시됐다. 증거는 로컬 전용 `docs/experiments/ios27-capture01`~`05`의 screenshot/hierarchy 파일이다. 즉시 캡처에서는 곡 로딩이 끝나지 않아 후속 캡처에서 완료를 확인했다.

MCP applicationState 메타데이터는 NotRun으로 반환됐지만 Safari hierarchy·화면 변화로 실제 동작을 검증했다. 이번 검증은 연결·기본 터치 smoke 범위이며 오디오 재생·전체화면·반복·두 줄 모드 전체 QA를 뜻하지 않는다. Computer Use의 Device Hub 바인딩 문제 해결과도 별개다.


당시 후속 검증에서는 다음을 확인했다. 상세 QA 보관본은 2026-10-13 사용자 요청으로 삭제했다. 재생·반복·마커·전체화면·저장 재열기를 검사했고, 회차24에서 탐색표시·전체화면배치·Safari미디어저장 방식을 수정했다.

<a id="ipad-simulator-history--이관-원문--ipad-simulatormd--6"></a>

#### 이관 원문 — IPAD-SIMULATOR.md / 6

출처: [docs/operations/IPAD-SIMULATOR.md](../how-to/verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="ipad-simulator-history--device-hub-제어-승인-유효기간-2026-09-20"></a>

###### Device Hub 제어 승인 유효기간 (2026-09-20)

사용자 제공 정보: Device Hub 제어는 한 번 허용하면 **24시간 동안만 유효**하다. 이후 제어 도구가 승인을 다시 요구하면 승인 만료 가능성을 먼저 확인한다. 과거 승인을 영구 승인으로 간주하지 않으며, 실제 도구의 승인 상태를 확인한 뒤 필요한 경우에만 재승인을 요청한다. 24시간 경과 자체를 이번 실험에서 검증한 것은 아니다.

<a id="ipad-simulator-history--rule-재점검-원문--ux-principlesmd--11"></a>

#### Rule 재점검 원문 — UX-PRINCIPLES.md / 11

출처: [docs/product/UX-PRINCIPLES.md](../reference/product/ux.md#ux-principles--팀-ux-원칙과-맥락형-도움말). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> ### 연속 배경
> 재생 화면의 악보는 흰색, 재생바는 기존 회색, 조작판은 기존 연녹색 배경으로 구분한다. 바깥 테두리·모서리·그림자 제거. 개별 버튼, 오선, 선택 마디 강조는 유지한다. 세로 제목 위 내부 여백24px로 시스템 상단 효과와 거리를 확보한다. 실제 iPad 흐림 해소는 사용자 재확인 대상이다.

<a id="ipad-simulator-history--rule-재점검-원문--audio-practicemd--12"></a>

#### Rule 재점검 원문 — AUDIO-PRACTICE.md / 12

출처: [docs/product/AUDIO-PRACTICE.md](../reference/product/audio-practice.md#audio-practice--음원-연습). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> ### 박자 맞추기 전용 메트로놈 (2026-10-15)
> - 목표: 파형의 박 위치와 실제 음원을 클릭 소리로 비교한다.
> - 범위: `[여기를 첫박으로]` 줄 맨 오른쪽에 연습 화면과 같은 메트로놈 아이콘 버튼을 배치한다. 박자 맞추기 전용이며 기본 켜짐이다.
> - 동작: 기존 재생기의 클릭·스틱 음색을 사용하고, 첫 박 전 마지막 네 박의 카운트오프와 이후 메트로놈을 음원의 현재 시각에 맞춘다. 창을 처음 열면 가능한 카운트오프 시작 위치부터 듣는다. 중간 탐색 시 남은 박만 재생하며 음원을 지연시키지 않는다.
> - 설정 경계: 저장 시 연습 화면의 메트로놈 켜짐 상태와 카운트오프 설정을 변경하지 않는다. 박자 맞추기의 아이콘 버튼 하나로 클릭·카운트오프를 함께 제어한다.
> - 검증: 소스 시각·속도·첫 박 기준 갱신, 탐색·일시정지·체크 해제·닫기의 예약 취소, 저장 설정 보존을 집중 검사한다. 실제 Safari/iPad 출력 청취는 별도 확인이 필요하다.

<a id="ipad-status-bar-diagnosis--ipad-상태바-배색제목-흐림-재조사"></a>

## iPad 상태바 배색·제목 흐림 재조사

문서 역할: **기록·참고**. 당시 화면 진단 기록. 옛 포트 5174/5175는 현행 설정이 아니다. 현재는 5173과 [iPad 절차](../how-to/verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차)를 따른다.

2026-10-04, 기준 player 0.6.8. 이번 작업은 조사이며 제품 변경·추가 배포 없음.


원문 출처: `docs/operations/IPAD-STATUS-BAR-DIAGNOSIS.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="ipad-status-bar-diagnosis--확인한-사실"></a>

### 확인한 사실
- 실제 iPad 캡처에서 파란 제목바 상단은 여전히 흐리고 상태바는 밝다. sticky 추가로 해결되지 않았다.
- 0.6.7 게시 HTML의 theme-color는 이미 #b8d4f5였다. 메타 미배포로 설명할 수 없다.
- 로컬 Safari 27.0.1에서 0.6.8 제목바는 sticky, top0, #b8d4f5, backdrop-filter:none이다. 조상에도 transform/filter/backdrop-filter/contain이 없다.
- 로컬 viewport1188×796: html/body/app 높이796, scrollHeight796. 문서의 실제 스크롤 범위는0. scrollingElement는HTML이다. body 계산 overflow는 hidden scroll이다. 이 측정은 실제 iPad 내부 상태를 대신하지 않는다.
- 동문회는 일반 긴 문서 + sticky 헤더이고 viewport-fit=cover가 없다. 드럼은 cover +100dvh 앱 +내부 악보 스크롤이다.

<a id="ipad-status-bar-diagnosis--엔진-근거와-한계"></a>

### 엔진 근거와 한계
- https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/LocalFrameView.cpp 의 fixedContainerEdges는 화면 가장자리 hit test를 수행하고 fixed/sticky, 폭, 높이, 투명도, 배경 필터 등을 검사한다. CSS position 속성이 일치한다는 것만으로 시스템 배색 성공을 증명하지 못한다.
- https://github.com/WebKit/WebKit/blob/main/Source/WebCore/rendering/RenderLayer.cpp 의 ForFixedContainerSampling 경로는 일부 레이어를 건너뛴다.
- https://bugs.webkit.org/show_bug.cgi?id=319479 는 참고용 미해결 보고다. 담당자의 macOS 재현 실패 댓글도 있으므로 확정 원인 근거로 사용하지 않는다.
- main 브랜치 소스와 실제 iPadOS 빌드가 동일하다고 가정하지 않는다. 정확한 탈락 조건은 아직 미확정이다.

<a id="ipad-status-bar-diagnosis--대책-변수를-분리한-실기기-비교"></a>

### 대책: 변수를 분리한 실기기 비교
1. 현재0.6.8을 기준군으로 보존한다.
2. 첫 비교는 viewport-fit=cover만 제거한다. 색상·sticky·높이·여백은 동일하게 두고 상태바 색/제목 흐림/가로 잘림을 확인한다.
3. 효과 없으면 원복 후 문서 스크롤 구조만 비교한다. body 고정 높이·overflow를 해제하고 자연 문서 흐름의 sticky 제목바가 상태바에 잡히는지 확인한다. 악보 내부 스크롤·조작판 터치 영향도 검사한다.
4. 두 구조 비교 이후에만 별도 viewport-fixed 배경 요소를 검토한다. 가짜 상태바나 추가 상단 공백으로 해결을 주장하지 않는다.
5. iPadOS 빌드, 홈화면 실행/일반 Safari/전체화면 진입 상태, 같은 새로고침 조건을 기록한다. 각 후보별 상태바·정지 제목·당김/복귀·가로화면 캡처를 비교한다.

원인은 현재 'Safari의 시스템 상단 합성과 앱 레이아웃 상호작용' 범위까지 좁혔으며, cover 또는 스크롤 구조 중 하나로 확정하지 않았다. 기존417테스트와 데스크톱 계산 스타일은 네이티브 상태바 검증을 대신하지 않는다.

<a id="ipad-status-bar-diagnosis--사용자-추가-제안에-따른-비교-2026-10-04"></a>

### 사용자 추가 제안에 따른 비교 (2026-10-04)
- 최신 사용자 제안에 따라 0.6.9에서 html 배경을 제목바와 같은 #b8d4f5로 변경하고 header 안에 env(safe-area-inset-top)+8px을 적용한다. body 흰색은 유지한다.
- cover 제거안은 미실시. black-translucent는 현행 설정에 없으며 추가하지 않는다. theme-color는 이미 일치한다. 실기기 결과는 미확인.

<a id="ipad-status-bar-diagnosis--0610--cover-단일-변수-비교"></a>

### 0.6.10 — cover 단일 변수 비교
- 동문회 게시 HTML과 직접 참조된 JS/CSS 확인: theme-color #1f4d2e, JS에 theme-color/theme_color/manifest 문자열 없음, HTML manifest 연결 없음. 제목바 CSS --dg-brand-bg-dark:#A24617. 동적 메타 변경/manifest 사용 추정은 확인한 코드에서 뒷받침되지 않는다.
- drum 진입 HTML3개에서 viewport-fit=cover만 제거. 확대를 제한하는 maximum-scale=1은 복사하지 않는다. 색상·sticky·safe-area·스크롤 구조 유지.
- 실제 iPad 상태바 및 가로화면 잘림은 게시 후 확인 필요. CSS/단위테스트 성공을 시스템 UI 성공으로 간주하지 않는다.

<a id="ipad-status-bar-diagnosis--0612--production-css-갱신-시점-대조-2026-10-04"></a>

### 0.6.12 — production CSS 갱신 시점 대조 (2026-10-04)
- 목표: 레이아웃/상단 여백을 유지하면서 실제 Safari 상단 배색을 복구한다.
- 범위: 재생 런타임의 헤더 mount 이후 스타일 등록, 종료 시 정리. 앱 버전은 공통 변경으로 양쪽 patch.
- 완료 조건: 로컬 production build와 게시본을 iPad mini (A17 Pro), iPadOS 27.0 Safari에서 확인한다.
- 제외: 악보 렌더링/음향/슬롯 기능, 메타 색상 변경, 인위적 안전 여백 추가.
- 검증: Safari MCP DOM/계산 스타일, 네이티브 Device Hub Safari 상단 캡처, 전체 테스트/빌드.

같은 시뮬레이터에서 Vite dev(5174)는 파란 브라우저 상단, 게시본과 local dist(5175)는 흰 브라우저 상단이었다. 따라서 호스팅만의 차이는 아니다. body overflow visible과 header fixed 단독 변경은 실패했다. 원래 CSS로 복원하고 헤더 mount 후 동일한 sticky/top/background 규칙을 새 style 요소로 등록하자 파란색으로 바뀌었다. 이를 제거한 대조군은 다시 흰색이었다. 동일 배경을 inline style로 재설정하는 시험은 실패했고, 새 stylesheet 등록은 두 번의 requestAnimationFrame 이후에도 성공했다.

최종 구현은 악보 준비 완료 후100ms 단발 timer로 해당 규칙을 등록하고, dispose에서 timer 취소 및 style 제거한다. runtime 내부 requestAnimationFrame 두 번만으로는 갱신에 실패했고100ms 단발 timer에서 성공했다. 반복 polling은 제품 코드에 넣지 않는다. Safari의 정확한 내부 결함은 확정하지 않는다. 위 결과는 스타일 등록 시점에 따른 네이티브 UI 차이를 관측한 것이다. 사용자 실제 iPad 결과와 시뮬레이터 결과는 구분한다.

로컬 최종 후보의 네이티브 확인: 15:33 KST 가로/세로 일반 Safari에서 상태바·주소바·탭바 모두 파랑, 제목 선명. 전체화면 진입 시 제목은 선명하고 슬롯4행 표시 유지. 시뮬레이터 전체화면에서는 시스템 시계/상태바 자체가 숨겨지므로 사용자의 상태바가 남는 실행 형태까지 입증한 것은 아니다.

<a id="ipad-status-bar-diagnosis--0613--세로-첫-진입-추가-대조"></a>

### 0.6.13 — 세로 첫 진입 추가 대조
0.6.12의100ms 단발 갱신은 가로 진입 후 회전에서는 작동했지만, 게시본과 로컬 모두 세로 첫 진입에서 실패했다. 3초 단발 갱신만으로도 세로 첫 진입은 실패했다. body overflow를 visible로 바꾸고3초 갱신을 함께 적용하면 성공했다(15:42,15:44 KST). CSS만 적용하고 갱신을 제거한 대조군은 실패했다(15:43). 따라서 최종 후보는 두 처리를 함께 유지한다. 앞선 '타이밍만의 문제' 해석은 불충분했다.
- body의 hidden/scroll 별도 스크롤 컨테이너 해제. 높이·악보 내부 스크롤·제목 위치는 유지.
- 악보 준비 후3초에 헤더 규칙을 한 번 등록. 화면 배치/재생을 기다리게 하지 않지만 브라우저 색 갱신은 지연될 수 있다. dispose 취소/정리 유지.
- iPadOS WebKit 내부 원인의 확정이 아니라 조건별 재현 결과에 근거한 호환성 처리다.

<a id="ipad-status-bar-diagnosis--2026-10-04-0614-sampled-header-identity-유지"></a>

### 2026-10-04 0.6.14: sampled header identity 유지

- 목표: 목록에서 처음 채집한 Safari 상단 색을 곡 열기/닫기에도 유지한다.
- 범위: player 목록 CSS, 공통 runtime header rendering, timer 제거. 재생 조작/악보 레이아웃은 유지한다.
- 완료 조건: native iPad Safari에서 목록 → 곡 → 목록의 chrome 색 유지, 같은 header DOM identity 확인.
- 제외: 동문회 사이트 수정, iPadOS 설정 변경, editor 공개 배포.
- 검증: header detach 회귀 검사, 전체 테스트/앱 빌드, Safari MCP DOM, iPad mini 27 native chrome.

사용자가 전달한 Claude 분석을 WebKit Page.cpp updateFixedContainerEdges(5289–5322행, main 2026-10-04)와 대조했다. canSampleTopEdge는 사용자 조작/스크롤 이후 재채집을 제한하되 설정 및 parsing 예외가 있다. 이전 색상 요소의 renderer가 남아 있으면 참조를 유지하는 분기가 있다. 따라서 '첫 터치 전에만 읽음'은 절대 규칙으로 기록하지 않는다.
출처: https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/Page.cpp

0.6.13/Sites31의 타이머+overflow 수정은 공개 주소의 portrait 첫 진입에서 실패했다(15:49 KST). 0.6.14에서는 타이머를 삭제하고 목록부터 전체 폭 sticky 파란 header를 표시한다. 화면 문자열을 template에서 파싱하고 기존 header 자체는 root에서 분리하지 않으며 속성/자식만 교체한다. dispose에서도 빈 header를 남긴다.

로컬 검증(15:54–15:56 KST): 418 tests/89 files PASS, build:apps PASS. Safari MCP에서 목록 → 악보 → 목록의 header === 초기 header, x/y=0, width=1188 확인. iPad mini iPadOS27 native Safari에서 세 단계 모두 파란 chrome 확인. build 2a211ebd.

공개 검증(15:58–15:59 KST): Sites32 공개 URL을 iPad mini 27 Safari에서 직접 열어 v0.6.14 build2a211ebd 확인. 목록/Real Paradis 두 줄 악보/목록 복귀 모두 status/address/tab 영역이 파란색으로 유지됨. 이전 Sites31 동일 기기/공개 origin 두 줄 악보는 흰색이었다. 제목 선명. 사용자 실제 iPad 홈 화면 실행은 미확인이고 시뮬레이터 Safari 결과로 대체하지 않는다.
