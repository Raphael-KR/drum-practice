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

현재 한계: 이 회차는 시뮬레이터 첫 화면만 확인했다. GUI 제어 도구에서 Simulator 앱 이름/기존 경로를 찾지 못했으며 창 표시·회전 및 연습 기능 검증은 아직 수행하지 않았다. Safari 응답형 디자인 모드도 아직 조작하지 않았다. Chromium viewport 검증을 iPad Safari 검증으로 소급하지 않는다.

Apple 공식 안내: https://developer.apple.com/documentation/safari-developer-tools/adding-additional-simulators
