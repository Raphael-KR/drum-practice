# 전반 QA — 2026-09-20

목표: 주요 연습 흐름과 PDF/MusicXML 비교 화면의 회귀 결함 확인 및 수정.
범위: 로컬 웹앱, Safari, 기존 예제 악보, 테스트와 빌드.
완료 조건: 시나리오별 관측 결과 기록, 재현 결함 수정 후 재검증.
제외: 사용자 악보 삭제, 외부 게시, 음원 전 음절 청취 판정.
검증: Safari 상호작용과 화면, 저장 데이터 무결성, 자동 테스트, production build.

## 실행 결과

환경: http://127.0.0.1:5173, macOS Safari MCP. 실제 viewport 1133×744 및 744×1133 CSS px. Safari 창 크기 변경으로 확인했으며 실제 iPad 기기 검증과 구분한다.

| 항목 | 결과와 근거 |
|---|---|
| 홈/최근 악보 재열기 | 곡 제목 표시와 기존 위치·BPM 복원 확인 |
| 내 악보 목록 | 한 곡 카드의 PDF/MusicXML/가사 버튼 확인; MusicXML 전환 성공 |
| 세 가지 보기 | 라디오 선택, 한줄/두줄/검수 전환 확인; 악보 크기 입력은 한줄만 노출 |
| PDF/SVG 전체 처리 | 110마디, 28개 비교 구간 draw 호출 성공; PDF 3쪽, SVG 4쪽, 각 110영역; 범위 밖 영역 0 |
| 가로/세로 화면 | 비교 9–12마디, SVG 두줄 9–16 및 81–88마디 화면 확인; 수평 overflow 없음 |
| 재생·정지·재개 | 재생 중 시간 증가; 10마디 후반 일시정지 후 재개 시 23.37초/10마디 1박으로 복귀 |
| BPM | +5로 94→99, 원곡 버튼으로 94 복원; 프리셋 목록 확인. 초기 백그라운드에서 합성 클릭을 연달아 실행한 결과는 판정에서 제외하고 전면 재열기 후 재검증 |
| 검수 캡처 | 버튼 및 실제 Space 입력으로 정지·캡처 복사 성공 메시지 확인; 재생→Space 정지 후 13마디 위치 유지 |
| 박자표 | 84마디 5/4 및 다음 85마디 4/4 출력 확인 |
| 가사 구조 | 515개 모두 scorePosition 존재; 영문 once/a-/gain/bright 표시 확인. 청취 정확도 검증은 아님 |
| 도구 대화상자 | 반복/마커/소리/화면/파일 열기·닫기 확인. 사용자 반복/마커 생성·삭제는 실행하지 않음 |
| 자동검사 | 39파일 133테스트 통과; TypeScript/production build 통과; Safari console error 조회 0 |

## 발견 후 수정

1. 세로 744px에서 위치 버튼 오른쪽 367px, 재생 왼쪽 348px로 19px 겹침. 좁은 화면의 마디 선택 폭과 왼쪽 flex 배분 수정 후 위치 버튼 끝 340px, 재생 시작 348px로 8px 간격 확보.
2. MusicXML 직접 두줄 보기에서 마디 원본 폭에 따라 악보 전체를 균등 확대해 오선 높이가 제각각이 됨. 원본 오선을 감지해 공통 수직 간격으로 맞추고, 가로는 마디 셀 전체를 채우도록 변경. CSS SVG 배경의 preserveAspectRatio 여백도 표시용 Blob에서 제거. 저장 원본·마디 시간·가사는 변경하지 않음.
3. 되감기 수 선택의 접근성 문구가 '앞으로 이동할 마디 수'로 남아 있어 실제 동작에 맞게 '되감을 마디 수'로 정정.

## 증거와 한계

- docs/experiments/qa-general/rows-landscape.png
- docs/experiments/qa-general/compare-portrait.png
- docs/experiments/qa-general/svg-rows-portrait.png (수정 전)
- docs/experiments/qa-general/svg-rows-portrait-fixed.png
- docs/experiments/qa-general/svg-rows-landscape-84.png
- docs/experiments/qa-general/tests.log, build.log

실제 iPad 터치/출력 음량·음질 청취, 전 음표 음악적 PDF 대조, 신규 파일 업로드/다운로드 후 재실행은 이번 Safari QA에서 확인하지 않았다. 백업/HTML/MusicXML 데이터 왕복은 기존 자동 테스트로 확인했다. 빌드의 큰 번들 경고는 남아 있으며 빌드 실패는 아니다.
