# iPad 상태바 배색·제목 흐림 재조사

2026-10-04, 기준 player 0.6.8. 이번 작업은 조사이며 제품 변경·추가 배포 없음.

## 확인한 사실
- 실제 iPad 캡처에서 파란 제목바 상단은 여전히 흐리고 상태바는 밝다. sticky 추가로 해결되지 않았다.
- 0.6.7 게시 HTML의 theme-color는 이미 #b8d4f5였다. 메타 미배포로 설명할 수 없다.
- 로컬 Safari 27.0.1에서 0.6.8 제목바는 sticky, top0, #b8d4f5, backdrop-filter:none이다. 조상에도 transform/filter/backdrop-filter/contain이 없다.
- 로컬 viewport1188×796: html/body/app 높이796, scrollHeight796. 문서의 실제 스크롤 범위는0. scrollingElement는HTML이다. body 계산 overflow는 hidden scroll이다. 이 측정은 실제 iPad 내부 상태를 대신하지 않는다.
- 동문회는 일반 긴 문서 + sticky 헤더이고 viewport-fit=cover가 없다. 드럼은 cover +100dvh 앱 +내부 악보 스크롤이다.

## 엔진 근거와 한계
- https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/LocalFrameView.cpp 의 fixedContainerEdges는 화면 가장자리 hit test를 수행하고 fixed/sticky, 폭, 높이, 투명도, 배경 필터 등을 검사한다. CSS position 속성이 일치한다는 것만으로 시스템 배색 성공을 증명하지 못한다.
- https://github.com/WebKit/WebKit/blob/main/Source/WebCore/rendering/RenderLayer.cpp 의 ForFixedContainerSampling 경로는 일부 레이어를 건너뛴다.
- https://bugs.webkit.org/show_bug.cgi?id=319479 는 참고용 미해결 보고다. 담당자의 macOS 재현 실패 댓글도 있으므로 확정 원인 근거로 사용하지 않는다.
- main 브랜치 소스와 실제 iPadOS 빌드가 동일하다고 가정하지 않는다. 정확한 탈락 조건은 아직 미확정이다.

## 대책: 변수를 분리한 실기기 비교
1. 현재0.6.8을 기준군으로 보존한다.
2. 첫 비교는 viewport-fit=cover만 제거한다. 색상·sticky·높이·여백은 동일하게 두고 상태바 색/제목 흐림/가로 잘림을 확인한다.
3. 효과 없으면 원복 후 문서 스크롤 구조만 비교한다. body 고정 높이·overflow를 해제하고 자연 문서 흐름의 sticky 제목바가 상태바에 잡히는지 확인한다. 악보 내부 스크롤·조작판 터치 영향도 검사한다.
4. 두 구조 비교 이후에만 별도 viewport-fixed 배경 요소를 검토한다. 가짜 상태바나 추가 상단 공백으로 해결을 주장하지 않는다.
5. iPadOS 빌드, 홈화면 실행/일반 Safari/전체화면 진입 상태, 같은 새로고침 조건을 기록한다. 각 후보별 상태바·정지 제목·당김/복귀·가로화면 캡처를 비교한다.

원인은 현재 'Safari의 시스템 상단 합성과 앱 레이아웃 상호작용' 범위까지 좁혔으며, cover 또는 스크롤 구조 중 하나로 확정하지 않았다. 기존417테스트와 데스크톱 계산 스타일은 네이티브 상태바 검증을 대신하지 않는다.

## 사용자 추가 제안에 따른 비교 (2026-10-04)
- 최신 사용자 제안에 따라 0.6.9에서 html 배경을 제목바와 같은 #b8d4f5로 변경하고 header 안에 env(safe-area-inset-top)+8px을 적용한다. body 흰색은 유지한다.
- cover 제거안은 미실시. black-translucent는 현행 설정에 없으며 추가하지 않는다. theme-color는 이미 일치한다. 실기기 결과는 미확인.

## 0.6.10 — cover 단일 변수 비교
- 동문회 게시 HTML과 직접 참조된 JS/CSS 확인: theme-color #1f4d2e, JS에 theme-color/theme_color/manifest 문자열 없음, HTML manifest 연결 없음. 제목바 CSS --dg-brand-bg-dark:#A24617. 동적 메타 변경/manifest 사용 추정은 확인한 코드에서 뒷받침되지 않는다.
- drum 진입 HTML3개에서 viewport-fit=cover만 제거. 확대를 제한하는 maximum-scale=1은 복사하지 않는다. 색상·sticky·safe-area·스크롤 구조 유지.
- 실제 iPad 상태바 및 가로화면 잘림은 게시 후 확인 필요. CSS/단위테스트 성공을 시스템 UI 성공으로 간주하지 않는다.

## 0.6.12 — production CSS 갱신 시점 대조 (2026-10-04)
- 목표: 레이아웃/상단 여백을 유지하면서 실제 Safari 상단 배색을 복구한다.
- 범위: 재생 런타임의 헤더 mount 이후 스타일 등록, 종료 시 정리. 앱 버전은 공통 변경으로 양쪽 patch.
- 완료 조건: 로컬 production build와 게시본을 iPad mini (A17 Pro), iPadOS 27.0 Safari에서 확인한다.
- 제외: 악보 렌더링/음향/슬롯 기능, 메타 색상 변경, 인위적 안전 여백 추가.
- 검증: Safari MCP DOM/계산 스타일, 네이티브 Device Hub Safari 상단 캡처, 전체 테스트/빌드.

같은 시뮬레이터에서 Vite dev(5174)는 파란 브라우저 상단, 게시본과 local dist(5175)는 흰 브라우저 상단이었다. 따라서 호스팅만의 차이는 아니다. body overflow visible과 header fixed 단독 변경은 실패했다. 원래 CSS로 복원하고 헤더 mount 후 동일한 sticky/top/background 규칙을 새 style 요소로 등록하자 파란색으로 바뀌었다. 이를 제거한 대조군은 다시 흰색이었다. 동일 배경을 inline style로 재설정하는 시험은 실패했고, 새 stylesheet 등록은 두 번의 requestAnimationFrame 이후에도 성공했다.

최종 구현은 악보 준비 완료 후100ms 단발 timer로 해당 규칙을 등록하고, dispose에서 timer 취소 및 style 제거한다. runtime 내부 requestAnimationFrame 두 번만으로는 갱신에 실패했고100ms 단발 timer에서 성공했다. 반복 polling은 제품 코드에 넣지 않는다. Safari의 정확한 내부 결함은 확정하지 않는다. 위 결과는 스타일 등록 시점에 따른 네이티브 UI 차이를 관측한 것이다. 사용자 실제 iPad 결과와 시뮬레이터 결과는 구분한다.

로컬 최종 후보의 네이티브 확인: 15:33 KST 가로/세로 일반 Safari에서 상태바·주소바·탭바 모두 파랑, 제목 선명. 전체화면 진입 시 제목은 선명하고 슬롯4행 표시 유지. 시뮬레이터 전체화면에서는 시스템 시계/상태바 자체가 숨겨지므로 사용자의 상태바가 남는 실행 형태까지 입증한 것은 아니다.

## 0.6.13 — 세로 첫 진입 추가 대조
0.6.12의100ms 단발 갱신은 가로 진입 후 회전에서는 작동했지만, 게시본과 로컬 모두 세로 첫 진입에서 실패했다. 3초 단발 갱신만으로도 세로 첫 진입은 실패했다. body overflow를 visible로 바꾸고3초 갱신을 함께 적용하면 성공했다(15:42,15:44 KST). CSS만 적용하고 갱신을 제거한 대조군은 실패했다(15:43). 따라서 최종 후보는 두 처리를 함께 유지한다. 앞선 '타이밍만의 문제' 해석은 불충분했다.
- body의 hidden/scroll 별도 스크롤 컨테이너 해제. 높이·악보 내부 스크롤·제목 위치는 유지.
- 악보 준비 후3초에 헤더 규칙을 한 번 등록. 화면 배치/재생을 기다리게 하지 않지만 브라우저 색 갱신은 지연될 수 있다. dispose 취소/정리 유지.
- iPadOS WebKit 내부 원인의 확정이 아니라 조건별 재현 결과에 근거한 호환성 처리다.
