# 공통 범례 그림 시안 — 2026-10-04

사용자 요청: 모든 범례를 오선 위에 그리고 연결선으로 명칭과 설명을 붙인다.

- 정본: docs/SCORE-MUSICXML-OSMD-MAPPING.md 확정 범례 27개.
- 결과: common-legend.svg(벡터), common-legend.png(2400px 미리보기).
- 하이햇·심벌 9 / 드럼·킥 9 / 주법·손 지시 9. 하이햇 스플래시는 첫 그룹으로 배치.
- 실제 악보 변경이 아닌 도움말 배치 시안. 앱·Sites에는 아직 적용하지 않음.
- Bravura 공식 폰트의 음표머리·반열림·트레몰로·버즈 롤 윤곽을 사용. OFL 동봉. 선·오선·연결선은 SVG 벡터.
- 버즈 롤 근거: https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/tremolo/ 및 https://www.w3.org/2019/03/smufl13/tables/tremolos.html
- draw.py는 fontTools와 Bravura.otf 경로 인수를 사용한다. 프로젝트 런타임 의존성 추가 없음.
- 검수: 27개 도해·이름·설명 확인, PNG 전체 화면 시각 확인. Quick Look SVG thumbnail이 오른쪽을 자르는 문제는 resvg 렌더링으로 해결했다.

## 4줄 시안
- `common-legend-four-staves.svg` / `.png`: 긴 공통 오선 네 줄에 8+8+5+6=27개 범례를 배치. 연결선 없이 음표와 하단 명칭·설명을 정렬.
- `draw-four-staves.py`로 생성. 네 줄 오선 간격과 글리프 크기를 동일하게 유지. 2400px PNG의 전체 표기·잘림·겹침을 시각 확인했다.
- 앞선 개별 오선 시안은 비교용으로 보존. 현재 앱에는 적용하지 않은 디자인 시안이다.

## SVG 내부 유리 효과
- 사용자 제공 feTurbulence → feGaussianBlur → feDisplacementMap 구조를 SVG defs에 반영. baseFrequency 0.015, octaves 3, blur 8, displacement 40, 고정 seed 7.
- 필터는 내부 청색·연보라색 배경층에만 적용하고 음표·오선·문자는 필터 밖에 둔다. 반투명 면과 가장자리 반사, 카드 밖 투명 영역을 유지한다.
- standalone SVG는 외부 웹페이지 픽셀을 SourceGraphic으로 읽지 않는다. 페이지 배경 흐림은 모달 CSS backdrop-filter 역할이다. 정적 시안이며 움직이는 배경은 추가하지 않았다.
- 투명도 줄이기·대비 증가 CSS 대체 배경 포함. XML 구문, 27개 명칭, 필터 내부 텍스트 없음 검사와 PNG 시각 확인 완료.

## 앱 적용 후 유리 두께 조정
- 4줄 범례는 현재 앱 공통 범례에 적용됨. 각 판 하단 단면(4px), 옅은 그림자(7px), 이중 반사 테두리로 두께를 표현한다. 추가 SVG 필터 없이 정적 벡터로 구현한다.
