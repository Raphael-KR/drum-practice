# GUI 도구 반환 텍스트 비교 — 2026-09-20

목표: ego-browser와 Device Hub의 실제 로컬 앱 확인·조작에서 모델이 읽을 텍스트 양 비교.
범위: localhost:5173, 화면 메뉴 열기·세 가지 보기 확인·닫기. 앱 코드/사용자 데이터 변경 없음.
완료 기준: 양쪽 조작 성공과 전/중/후 상태 저장, 동일 tokenizer로 계수.
제외: 실제 과금·내부 추론·이미지 입력 토큰의 정확한 측정.
검증: ego full_page snapshot, Xcode DeviceInteractionSynthesize hierarchy/screenshot.

| 세 상태 합계 | ego | Device Hub |
|---|---:|---:|
| 원문 텍스트 토큰 | 3,141 | 47,865 |
| 같은 키워드 필터 적용 | 200 | 967 |
| 메뉴 열기/닫기 | 성공 | 성공 |
| 전체 화면 스크린샷 | Page.captureScreenshot 시간 초과 | 성공, 직접 시각 확인 |

계수는 tiktoken o200k_base다. 현재 모델의 청구 토큰과 같다는 뜻이 아니다. 본문 문자열만 계산했고 도구 인자·JSON 포장·이미지·재시도·연결 준비·추론은 제외했다. 원문은 ego가 93.4% 적다(약 15.2배 차이). 키워드 필터 이후 차이는 약 4.8배다. Device Hub는 파일 경로만 반환하므로 원문 전체를 모델에게 읽히지 않으면 47,865토큰이 실제 소비되는 것은 아니다.

동일 메뉴 동작이지만 저장된 보기 설정은 ego 검수 / iPad 한 줄 보기로 다르고, viewport·Safari 도구막대·열린 탭·AX 시스템 트리가 다르다. 단일 회차의 도구 출력량 실험이며 엄밀한 동일 화면 반복 A/B 또는 전체 작업 비용 우열 증명은 아니다. 최초 내 악보 목록 테스트는 저장된 테스트 곡 수가 달라 비교 집계에서 제외하고, 화면 메뉴 시나리오로 좁혔다. ego viewport snapshot은 스크롤 위치에 따라 내용이 달라져 full_page로 재측정했다.

Device Hub는 Xcode 접근 승인 후 실제 iPad mini A17 Pro 시뮬레이터에서 연결했다. 종료 응답 Session stopped 확인. ego 스크린샷 실패 때문에 완전한 시각검증 비용 비교는 미완료다. 메뉴 조작 및 세 라디오 선택지 존재는 양쪽 의미 트리로 확인했고, Device Hub 스크린샷에서도 확인했다. 오디오·재생·전체 앱 QA를 수행했다는 의미는 아니다.

운용 판단: 반복적인 DOM/버튼 검사는 ego에서 필요한 상태만 반환하면 텍스트 비용을 줄일 수 있다. iPad Safari의 실제 화면·터치·오디오 검증은 Device Hub에서 수행하고 hierarchy를 로컬에서 필터링한다. 같은 해상도 이미지를 같은 횟수로 읽을 때의 이미지 토큰 차이는 이번 측정으로 알 수 없다.

로컬 원시 증거 및 계수 스크립트: docs/experiments/gui-cost/ (Git 제외). counts.json, ego-{ready,menu,closed}.txt, device-{ready,menu,closed}.txt, device-menu.png. 승인/초기 연결 실험은 별도 JSON에 보존.
