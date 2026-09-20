# 첨부 드럼 표기법: MusicXML / OSMD 검수

2026-09-20. PR 제출 전 조사 요청. 공개 제출은 보류 중이다.

> 이 문서는 조사 당시의 사실과 이력을 보존한다. 현재 채택 정책은 [악보의 MusicXML · OSMD 매핑 방식](SCORE-MUSICXML-OSMD-MAPPING.md)을 따른다. 오픈 하이햇은 circle-x, 스티킹은 words를 사용하며 빈 타원 재현 패치는 필수가 아니다.

## 범위와 검증

- 사용자 TIFF(악기 배치 그림)와 PNG(드럼 악보 표기법)를 직접 확인했다.
- 목표: 첨부된 모든 위치·음표머리·주법 표기의 MusicXML 표현과 OSMD 실제 SVG 출력을 구분한다.
- 설치된 OSMD 2.1.2 원본과 develop 0502732 + b62a6ca 패치를 Safari 27에서 비교했다. 앱의 SVG 보정은 사용하지 않았다.
- 20개 합성 사례: `/qa/drum-notation-audit.html` (원본), `?patched=1` (직전 패치).
- 5선 유지: PercussionOneLineCutoff=0, PercussionUseXMLDisplayStep=true. 테스트 라벨 가독성을 위해 패치 화면은 4마디 단위로 배치했다.
- 공개 제안 코드, 앱 정본 악보 및 재생 기능은 변경하지 않았다. 음색·MIDI 재생은 이 조사에서 검증하지 않았다.

## 중요한 구분

MusicXML은 악기 의미(instrument), 표시 높이(unpitched/display-step/display-octave), 모양(notehead), 주법(technical 등)을 분리한다. 악기 이름만 Open hi-hat으로 저장한다고 원이나 ×가 자동 지정되는 계약은 아니다. 드럼 음자리표의 표시 좌표는 높은음자리표의 음 이름을 기준으로 표현하며, 실제 유음고를 뜻하지 않는다. 악기별 위치 하나를 강제하는 형식도 아니다. 첨부 범례를 이 프로젝트의 표기 규칙으로 사용하는 것은 가능하다.

이번 범례의 오픈 하이햇은 `circle-x`이다. 기존 PDF의 빈 타원은 `normal filled="no"`이다. 둘은 별도 표현이며 기존 filled 수정은 여전히 필요한 유효한 수정이다.

## 위치 / 머리 모양

선은 아래부터 제1선~제5선이다. 두 첨부의 기본 높이 배치는 일치한다. 크래시 머리 모양은 도해에서 ×, 범례에서 원 안의 ×로 조금 다르므로 아래는 상세 범례 기준이다.

| 항목 | 위치 / MusicXML display | 머리 모양 | OSMD 원본 및 패치 |
|---|---|---|---|
| 베이스 드럼 | 제1~2선 사이 F4 | normal, 아래 줄기 | 정상 |
| 스네어 | 제3~4선 사이 C5 | normal | 정상 |
| 크로스 스틱 | 스네어와 같은 C5 | x | 정상 |
| 고스트 노트 | 스네어와 같은 C5 | normal, parentheses="yes" | 두 버전 모두 괄호 누락 |
| 탐 1 | 제4~5선 사이 E5 | normal | 정상 |
| 탐 2 | 제4선 D5 | normal | 정상 |
| 플로어 탐 | 제2~3선 사이 A4 | normal | 정상 |
| 하이햇 | 제5선 바로 위 공간 G5 | x | 정상 |
| 오픈 하이햇(첨부) | G5 | circle-x | 정상 |
| 하이햇 열기 | G5 | x + technical/open-string | 위에 ○ 표시 |
| 하이햇 닫기 | G5 | x + technical/stopped | 위에 ＋ 표시 |
| 풋 하이햇 | 제1선 아래 공간 D4 | x, 아래 줄기 | 정상 |
| 크래시 | 위쪽 첫 덧줄 A5 | circle-x | 정상, 덧줄 포함 |
| 라이드 | 제5선 F5 | x | 정상 |
| 라이드 벨 | 제5선 F5 | triangle filled="yes" | 삼각형 계열 표시; 폰트 윤곽은 원본과 다름 |
| R/L | 해당 음표 위 | words 또는 fingering | 표시됨 |
| R/L | 해당 음표 위 | other-technical | 두 버전 모두 누락 |
| 빈 타원 오픈 하이햇(기존 PDF) | G5 | normal filled="no" | 원본: 검게 채워짐. 직전 패치: 빈 타원 정상 |

## 주법의 의미와 표시

- 크로스 스틱: 별도 악기 ID/이름 및 MIDI 매핑으로 일반 스네어와 구별하고, 동일 높이의 x로 표시할 수 있다.
- 고스트 노트: 괄호와 작은 음량은 별개다. parentheses="yes"는 시각 표현이며 소리를 자동 줄인다는 의미는 아니다. 음량 정보는 별도로 저장해야 한다. 이번 작은 dynamics 값을 준 사례도 괄호가 표시되지 않았다. OSMD의 실제 음량 처리는 검증하지 않았다.
- 오픈/클로즈: circle-x는 머리 자체의 모양이고, open-string/stopped는 음표 위의 ○/＋다. 열었다 닫는 시점은 서로 다른 악보 위치에 지정해야 한다. open-string은 표준에서 원래 개방현의 0 모양 기호를 뜻하며, OSMD는 이것과 harmonic을 같은 원형 글리프로 매핑한다. 따라서 드럼 악기 의미는 별도 instrument와 함께 보존한다.
- 풋 하이햇/라이드 벨: 서로 다른 악기 ID와 표시 위치/머리 모양을 모두 명시한다. 도형만으로 음색 구현까지 보장되지는 않는다.
- R/L: MusicXML에는 일반 텍스트와 기술 지시를 담을 수 있다. 이 표기의 권장 호환 경로는 words이다. fingering에도 R/L 문자열이 표시되지만 본래 운지 정보라 드럼 손 지정 의미와 완전히 같지는 않다. 테스트의 두 fingering은 원본 그림처럼 R 위, L 아래로 나타났다.

## 추가 발견 / 제출 범위 권고

1. normal filled 결함: 이미 수정 및 회귀 검증됨. 기존 패치 유지.
2. notehead parentheses 누락: 별도 결함. 최신 소스 VoiceGenerator는 notehead의 shape와 filled만 읽고 parentheses는 보존하지 않는다. 실제 두 버전 모두 괄호 없음.
3. other-technical 텍스트 누락: ArticulationReader의 처리 목록에 없고 실제 R이 나오지 않음. words로 표시 가능.
4. circle-x, open-string, stopped, triangle, 기본 오선 위치는 이번 테스트에서 표시됨. 여기에 추가 버그가 있다고 보고하지 않는다.

주제가 다른 2/3을 기존 fill PR에 섞기보다는 독립 재현과 변경으로 다루는 것이 검토하기 쉽다. 현재 사용자는 조사만 요청했으므로 추가 수정이나 공개 제출은 하지 않았다.

## 근거

- https://www.w3.org/2021/06/musicxml40/tutorial/percussion/
- https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/notehead/
- https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/open-string/
- https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/stopped/
- https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/other-technical/
- 로컬 upstream: src/MusicalScore/ScoreIO/VoiceGenerator.ts (notehead 읽기), ScoreIO/MusicSymbolModules/ArticulationReader.ts (technical 매핑), Graphical/VexFlow/VexFlowConverter.ts (X2/X3/T2 및 ○/＋ 변환).
- 실험 출력: docs/experiments/osmd-hollow-report/drum-{stock,patched}.json; drum-audit-{stock,patched}.png.

## 추가 확인: 온마디쉼표 및 스티킹 명칭 정정

### 온마디쉼표 (2026-09-20)

원인은 앱의 SVG 자르기가 아니라 OSMD 2.1.2의 명시적 쉼표 높이 처리 경로로 재현했다. 현재 develop VexFlowConverter.ts에도 같은 조기 break가 있다.

- `note.sourceNote.Pitch`가 존재하면 keys에 해당 높이를 넣고 break한다.
- 뒤쪽의 온마디쉼표 판정/`alignCenter=true`에 도달하지 못한다.
- public/demo/score.musicxml의 1~4마디에는 `<rest measure="yes"><display-step>B</display-step><display-octave>4</display-octave></rest>`가 실제로 들어 있다.
- 이는 쉼표 높이를 지정하는 유효한 MusicXML이다. 이전 높이 고정 작업이 이 버그의 발생 조건을 만들었지만, 높이 지정 때문에 가로 중앙 정렬까지 없어져서는 안 된다.
- 앱 보정을 전혀 쓰지 않는 `/qa/rest-sticking-audit.html`에서 높이 정보만 다른 온마디쉼표를 렌더링했다.
- 높이 미지정: 두 마디 모두 `isCenterAligned()=true`.
- B4 지정: 두 마디 모두 `isCenterAligned()=false`, noteStartX+12 위치. 두 번째 마디 x는 각각 261.755 / 229.255로 다르다.
- 우리 앱 src/musicxml.ts의 full-bar glyph 중앙 이동은 이 문제를 우회하는 코드다. 이번 조사는 해당 코드를 변경하지 않았다.
- 2분쉼표/점2분쉼표를 일반적으로 쉬는 구간 가운데로 옮긴다는 규칙은 아니다. 이 버그는 온마디쉼표의 중앙 배치에 관한 것이다.
- 근거: https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/rest/

### R/L은 fingering이 아니라 sticking

- 드럼의 오른손/왼손 지시는 **스티킹(sticking)**이다. Fingering은 손가락 운지 지시를 뜻한다.
- 앞선 `R/L fingering` 사례는 XML 요소가 문자열을 출력하는지를 검사한 것으로, 실제 드럼 표기의 권장 인코딩이나 정확한 명칭으로 제시하면 안 된다.
- 앞선 범례 그림의 R/L을 한 음표에 쌓아 놓은 재현은 실제 연주 순서 예제로 부적절했다. 각 타격 음표에 R 또는 L을 연결한다. 범례의 겹친 R/L은 선택 가능한 기호 설명으로 볼 수 있으며, 해당 그림만으로 두 번의 연주 순서를 뜻한다고 볼 수 없다.
- 새 예제는 네 개 사분음표 각각에 R, L, R, L을 words로 배치했다. Safari SVG에서 각각 다른 음표 아래에 네 글자가 대응하는 것을 확인했다.
- 장래 앱 데이터는 `sticking`으로 명명하고 음표 ID/성부/악보 위치에 연결하는 것이 타당하다. words는 시각적 MusicXML 호환 경로이며, 이것만으로 모든 프로그램이 손 의미를 구조적으로 인식한다고 보장하지 않는다.
- Soundslice 공식 설명은 sticking을 given note에 사용할 손으로 정의하며 R/L/B를 구분한다. 다음 음표로 이동하면서 개별 입력하고, MusicXML의 타악기 R/L 텍스트를 인식한다고 명시한다.
- https://www.soundslice.com/blog/212/native-support-for-drum-sticking/
- https://ae.vicfirth.com/education/webrhythms/webrhythms-lesson-04/
- https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/fingering/

실측 화면: docs/experiments/osmd-hollow-report/rest-sticking.png. 공개 PR 제출과 신규 upstream 수정은 이번 조사에서 수행하지 않았다.

## 적용 결정: 전체 마디가 쉬면 높이 미지정 (2026-09-20)

사용자 승인에 따라 현재 곡의 1~4, 110마디 온마디쉼표에서 display-step/display-octave를 제거했다. 별도 성부가 연주하는 마디의 쉼표 높이는 유지한다. 자동 보정기가 다시 높이를 넣지 않도록 수정했으며 저장된 곡의 XML/canonicalXML도 곡 열기 때 갱신한다. 높이 없는 쉼표는 앱의 수동 중앙 이동 대상에서 제외하여 OSMD 기본 배치를 사용한다. SVG 캐시 버전은 default-full-rest-v3이다.

Safari의 실제 저장 곡에서 5개 rest의 높이 값이 모두 비었고, 새 SVG 캐시의 수동 중앙 이동 표시는 0개임을 확인했다. 1~4마디 검수 화면의 중앙 배치를 직접 확인했다. 전체 129 tests, 37 files 및 build 통과. 근거 화면 rest-default-app-start.png. 기존 HTML 내보내기 파일은 재생성하지 않았다.
