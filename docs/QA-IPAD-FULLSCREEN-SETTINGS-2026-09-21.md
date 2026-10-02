# iPad 전체화면 설정창 검수

- 환경: Xcode 27 mcpbridge → Device Hub DeviceInteractionStartSession/Synthesize. iOS 27.0 iPad mini A17 Pro `9ECBE1E1-D908-45A7-AF31-5F9FEAB568E2`, 가로 1133×744. localhost:5173 웹앱.
- 현재 승인으로 세션 시작·캡처·터치 성공. 재승인이나 기기 재시작 없이 검수했다.

## 재현 및 원인

악보 열기 → 설정 → 화면 → 전체화면으로 악보 보기 켜기. 전환 완료 후 UI 계층에는 설정 대화상자와 켜진 토글이 남지만 캡처에는 악보만 보였다.

`requestFullscreen()`이 루트 요소를 기존 모달보다 나중에 top layer에 추가한다. [Fullscreen 표준의 요소 추가 순서](https://fullscreen.spec.whatwg.org/#model)와 실제 시뮬레이터 재현이 일치한다. z-index 조절 문제가 아니다.

## 수정

`src/fullscreen.ts`: 전체화면 진입 완료 후 열린 모달을 닫고 즉시 showModal하여 전체화면 위로 올린다. 이 내부 재배치의 close 이벤트는 사용자 닫기 처리와 구분해 차단하며 입력 내용·스크롤·포커스를 유지한다. 사용자가 실제로 닫을 때는 기존 close 처리가 정상 실행된다.

## 실제 기기 런타임 확인

| 시나리오 | 결과 |
|---|---|
| 설정창에서 전체화면 켜기 | 전환 완료 후 설정창 보임 |
| 전체화면 자동 진입 후 설정 열기 | 보임 |
| 설정에서 전체화면 끄기 → 다시 켜기 | 두 상태 모두 설정창 보임 |
| 전체화면 상태에서 설정 닫기 → 다시 열기 | 정상, 전체화면 토글 켜짐 유지 |

- [수정 전](experiments/ipad-fullscreen-repro.png)
- [수정 후: 설정 안에서 전체화면 진입](experiments/ipad-fullscreen-settings-fixed.png)
- [수정 후: 닫았다가 다시 열기](experiments/ipad-fullscreen-reopen-fixed.png)
- 집중 테스트 4개 통과. jsdom은 실제 top layer를 구현하지 않으므로 모달 API를 모사하여 임시 close 억제·실제 close 전달·입력/스크롤/포커스 보존을 검사했다. 실제 표시 여부는 위 Device Hub 캡처로 확인했다.
- 전체 테스트: 55파일/229테스트 통과. 빌드 통과. 로그: `docs/experiments/fullscreen-all-tests.log`, `fullscreen-build.log`.
- 커밋·버전 변경·HTML 내보내기·배포는 수행하지 않았다.
