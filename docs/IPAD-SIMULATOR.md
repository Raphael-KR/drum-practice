# iPad mini 검증 환경

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

## Device Hub 재시작 및 제어 경로 (2026-09-18)

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


## 승인 후 재검사

사용자가 Xcode 승인 완료를 알린 뒤 기존 클라이언트로 재시도했으나 같은 승인 오류가 났다. `DrumPractice.xcworkspace`를 생성해 XcodeOpenWorkspace로 열고 사용자가 표시된 요청을 승인한 뒤, StartSession의 승인 오류는 사라졌다. 웹 소스를 참조하는 작업공간이며 네이티브 앱 타깃은 없다. OpenWorkspace는 실행 대상 해석 시간 초과를 반환했지만 후속 기기 요청은 승인 단계를 통과했다.

새 차단 사유: Device Interaction은 iOS/watchOS/tvOS **27.0 이상 시뮬레이터**를 요구한다. 설치된 런타임은 iOS 18.6뿐이어서 터치 세션은 생성되지 않았다. iOS 27.0 arm64 (24A434) 다운로드를 시도했으나 다운로드 크기 8.05 GB 대비 디스크 여유가 약 12 GiB여서 설치 공간 확보 전 중단했다. 기존 런타임/사용자 파일은 삭제하지 않았다. 다음 단계는 충분한 디스크 공간을 확보하고 iOS 27을 설치한 뒤 프로젝트 전용 iPad mini 기기로 재검사하는 것이다.


## iOS 27 설치 완료 (2026-09-18)

사용자의 디스크 재확인·설치 요청 후 APFS 여유 26.0 GB(약 24 GiB)를 확인했다. `xcodebuild -downloadPlatform iOS -buildVersion 27.0 -architectureVariant arm64`가 Done/exit 0으로 완료됐다. 별도 simctl 조회에서 iOS 27.0 (24A434), `com.apple.CoreSimulator.SimRuntime.iOS-27-0`, `isAvailable: true`를 확인했다. 설치 직후 남은 공간은 약 16 GiB. iOS 18.6과 기존 기기는 보존했다. iOS 27용 기기 생성·부팅 및 MCP 터치 재검증은 아직 수행하지 않았다.


## iOS 27 MCP 터치 검증 성공 (2026-09-18)

현재 검증 기기: iPad mini (A17 Pro), iOS 27.0, UDID `9ECBE1E1-D908-45A7-AF31-5F9FEAB568E2`. 설치 시 생성된 기기를 부팅해 사용했다. 기존 iOS 18.6 기기는 보존. devicectl로 landscapeLeft 설정, Vite localhost:5173 재실행 및 HTTP 200 확인.

Xcode MCP StartSession 성공 후 Safari hierarchy와 screenshot을 확보했다. hierarchy의 hitPoint로 예제 곡 열기, 화면 메뉴 열기, 닫기를 실행하고 각 결과를 확인했다. 1133×744 가로 화면에서 악보·94 BPM·하단 컨트롤이 표시됐다. 증거는 로컬 전용 `docs/experiments/ios27-capture01`~`05`의 screenshot/hierarchy 파일이다. 즉시 캡처에서는 곡 로딩이 끝나지 않아 후속 캡처에서 완료를 확인했다.

MCP applicationState 메타데이터는 NotRun으로 반환됐지만 Safari hierarchy·화면 변화로 실제 동작을 검증했다. 이번 검증은 연결·기본 터치 smoke 범위이며 오디오 재생·전체화면·반복·두 줄 모드 전체 QA를 뜻하지 않는다. Computer Use의 Device Hub 바인딩 문제 해결과도 별개다.


후속 기능 검증과 수정 결과는 [IPAD-QA.md](IPAD-QA.md)를 따른다. 재생·반복·마커·전체화면·저장 재열기를 검사했고, 회차24에서 탐색표시·전체화면배치·Safari미디어저장 방식을 수정했다.
