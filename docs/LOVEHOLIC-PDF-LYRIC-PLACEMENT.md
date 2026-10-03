# Loveholic PDF 가사 위치 수정 — 2026-10-03

- 목표: 사용자25~32마디 캡처의 중앙 가사를 원본 PDF 대응 음표 위치의 음절 표시로 고친다.
- 범위: 기존 수록본 보존, 표준269가사 수록, PDF 표시 좌표269개 추가, 실제 앱 검수. 공통 코드 변경은 개발 세션에 작업 범위를 알리고 이 제작 세션에서 구현했다. Git 통합·앱 버전 관리는 개발 세션에서 수행한다.
- 완료 조건: 실제 수록·저장 곡에서 중앙가사0/음절269, PDF 대응 좌표 일치, XML·미디어·기존 자료 보존.
- 제외: 실제 가창 시각/음가 변경, 드럼/가사 XML 재작성, 외부 배포·HTML 생성.
- 검증: 패키지 비교, 실제 악보 불러오기/업데이트·저장·재열기,25~32마디 좌표와 전269표시 대조.

## 원인과 보존

로컬 `public/scores/loveholic.drumscore`는 이전 중앙가사77개/음절0개였다(SHA25616925715d0fbc386dea1731c36fb021ec9c7f719e1ede63449bdecd001bfa5e7). 제작된269단위 패키지가 수록 파일에 반영되지 않았다. 이전 수록본은 `docs/experiments/loveholic-20261002/lyric-placement-app-fix-20261003/previous-bundled-loveholic.drumscore`에 보존했다. Safari localhost 실제 player의 기존 저장 곡 목록은 비어 있었으며 ‘악보 불러오기’로269가사 저장·재열기를 확인했다. 사용자가 캡처한 탭/배포/저장 곡의 실제 상태와 이 로컬 검수를 같은 상태로 가정하지 않는다.

269가사로 바꾼 뒤 PDF25~32마디27단위의 파란 음절 중앙을 원본 대응 음표 좌표와 측정한 최대차이는7.8446 CSS px였다. 기존 PDF beatXs는 줄기 좌표·정수박 보간이므로 정확한 머리/반박 좌표와 다르다. PDF 표시 전용 `lyricAnchors`(lyricId,quarterOffset,x)를 별도로 기록해 음악적 위치와 진행선은 유지한다.265개는 원본 대응 음표/쉼표 좌표,4추정은 원본 인쇄 단위 중앙을 사용한다. 입력근거 `lyric-placement-app-fix-20261003/pdf-lyric-note-anchors.json`.

## 새 패키지와 현재 검증

`docs/experiments/loveholic-20261002/pdf-note-lyrics-package-20261003/Loveholic.drumscore` SHA25618c7410748b222a6a4fcd6d83d73621200e504b8245b65d099cb6f27c550b80d(10,487,287바이트)를 로컬public에 반영했다. 기존269가사 패키지 대비 manifest만 변경했다. canonicalXML·Song전체·미디어·SVG와 원본 PDF영역의 기존 필드는 동일하며 새좌표269개 왕복 보존을 확인했다. 공통 표시 수정과 실제 앱 재검수를 완료했다. 이전 수록본은 위 별도 백업에 보존했다.

원본·가사 표준 성부의 제작 근거는 [가사 제작 기록](LOVEHOLIC-LYRICS-REVIEW.md)을 따른다.

## 실제 앱 검증 완료

Safari `http://127.0.0.1:5173/player.html`의 실제 악보 업데이트 → 열기 → PDF 두 줄 보기 → 재열기를 수행했다. 저장 곡은 가사269개·중앙 문구0개·PDF 좌표269개이며 canonicalXML 해시는 위 표준 XML과 같다. 기존 설정·마커를 보존했다.

- 전269개 표시: 참조 문자 불일치0, PDF 대응 좌표와 음절 중앙의 최대차이0.0973 CSS px 미만. 265직접대응·4추정 구분을 유지한다.
- 사용자 캡처의25–32마디27개: 최대차이0.023 CSS px 미만. 최종 실제 화면 `lyric-placement-app-fix-20261003/player-pdf-25-32-exact.png`, 전체 좌표 `note-centre-alignment-after.json`.
- `Region.lyricAnchors` 입력 검증, 표시 crop 시 좌표 변환, PDF lyricId/음악적 위치 일치 시 대응 좌표 사용. 가사 위치를 편집했거나 SVG이면 기존 계산으로 돌아간다. PDF 대응 좌표는 일반 겹침 방지의 가로 이동 대상에서 제외한다. 긴 영문도 대응 위치를 중앙으로 유지한다.
- 마디의1px 테두리를 포함한 백분율 좌표와 실제 PDF crop 너비가 달라 남은1px 차이를 확인했고, PDF 전용 좌표는 crop의 실제 px 너비로 계산했다.
- 회귀: crop 전후 절대 페이지 좌표·원본 불변, 두 보기/PDF 선택, SVG·편집 후 fallback, 손상 입력, 겹침 처리의 좌표 보존. 전체77파일362테스트, TypeScript 및 변경 범위 diff check 통과.

이 결과는 로컬 코드·로컬 수록본·실제 로컬 저장 곡의 검증이다. 공개 서버의 파일이나 사용자 기존 탭/별도 저장 파일을 갱신했다는 뜻은 아니다. 공개 배포·push·독립 HTML 생성은 수행하지 않았다. 기존 곡은 앱의 ‘악보 업데이트’로 반영하며 같은 구조의 연습 상태를 보존한다.
