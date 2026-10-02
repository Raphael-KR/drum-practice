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

## Safari MCP 추가 비교 (2026-09-20)

사용자 요청대로 ego는 다시 실행하지 않고 기존 3,141/200 측정값을 재사용했다. macOS Safari MCP에서 localhost:5173 기본 곡을 열고, 기존 ego와 같은 PDF·MusicXML 검수 보기로 준비한 뒤 화면 메뉴 열기 → 세 선택지 확인 → 닫기를 실행했다. 시작/메뉴/종료 세 상태의 entire_page textTree를 사용했으며, page_interactions는 fullText:true로 diff를 끄고 원문 전체를 반환하게 했다. 같은 o200k_base 및 동일 키워드 필터로 본문 content만 계수했다.

| 상태 | 기존 ego | Safari MCP |
|---|---:|---:|
| 시작 | 1,003 | 641 |
| 화면 메뉴 | 1,135 | 824 |
| 닫은 뒤 | 1,003 | 641 |
| 합계 | 3,141 | 2,106 |
| 키워드 필터 합계 | 200 | 207 |

Safari 원문이 32.95% 적었고 필터 후에는 거의 같았다. 두 도구의 표현 형식(들여쓰기, 역할, 속성 중복 등)이 달라 나타나는 출력량 차이다. Safari는 이번 screenshot 호출도 성공했고 직접 이미지로 세 라디오 항목과 검수 선택 상태를 확인했다. 기존 ego 캡처 실패 결과는 재시험하지 않았다.

실제 모델 청구/추론/이미지 토큰·설정 준비·도구 JSON 포장은 여전히 제외한다. Safari는 macOS 데스크톱이며 iPad 검증이 아니다. 곡 위치는 Safari 0초/기존 ego 3.8초, 창 크기는 통제하지 않았다. 단일 시나리오이므로 모든 웹앱에서 Safari가 저렴하다는 결론은 내리지 않는다. 기본 diff 반환을 사용하면 추가 절감 여지가 있지만 이번 수치에는 포함하지 않았다.

이번 결과로 ego가 항상 최저 비용이라는 앞선 가정은 지지되지 않는다. 이 앱의 메뉴 검사에서는 Safari MCP가 더 작은 원문과 성공한 화면 캡처를 제공했다. 원시 증거: docs/experiments/gui-cost/safari-{ready,menu,closed}.txt, safari-counts.json, safari-menu.png. 새로운 Safari 테스트 탭에서만 진행했고 앱 소스는 변경하지 않았다.

## 채택한 운영 지침

2026-09-20 사용자 결정: 앞으로 이 프로젝트의 웹앱 테스트는 Safari MCP를 우선 사용하고, Safari에서 실패하면 ego-browser를 검토한다. 앞선 ego 우선 운용 제안은 이 결정으로 대체한다. iPad 기기 특성의 최종 검증은 기존 Device Hub 절차를 유지한다. 실행 지침은 AGENTS.md에 반영했다.
