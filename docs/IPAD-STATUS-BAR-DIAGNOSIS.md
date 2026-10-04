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
