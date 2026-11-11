# 드럼 악기와 주법 표기

문서 역할: **현행 Rule**. 드럼 악기·주법의 의미, 오선 위치와 승인된 MusicXML 표현을 정한다.
[전체 정본](../../RULES-INDEX.md) · [제작 절차](../../how-to/produce-score.md) · [결정 이력](../../decisions/README.md)

**작성 상위 기준:** [64분음표 공통 기본 단위](production.md#score-production-rules--오선-부착-표기의-공통-기본단위). 이 문서의 모든 오선 부착 표기에도 적용한다.

<a id="score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙"></a>

## 악보의 MusicXML · OSMD 매핑 규칙

**매핑은 이 문서를 따른다.** 출력: [SVG Rule](rendering.md#svg-score-rules--svg-전체-악보-생성-규칙). 저장: [정본 계약](musicxml.md#musicxml-canonical--musicxml-정본-계약). 결정·대체·실험 이력: [ADR](../../decisions/README.md).
일반 도형·텍스트 대체는 [변경 승인](#score-musicxml-osmd-mapping--문서-변경과-실행-순서) 후 적용한다.

<a id="score-musicxml-osmd-mapping--읽는-순서와-상태-구분"></a>

### 읽는 순서와 상태 구분

- 확정 범례·쉼표·스티킹·메타정보/가사 규칙을 적용한다.
- 사용자 승인·MusicXML 표준 의미·OSMD 원생 지원·앱 보완·곡별 검증은 별도 상태다. 승인된 표현도 전용 규칙 미확인이면 그대로 보고한다.
- 현행 값은 이 Rule, 이유·과거 검증은 ADR을 따른다. 과거 철회·보류·미적용 기록으로 후속 승인을 취소하지 않는다.

<a id="score-musicxml-osmd-mapping--목적과-적용-원칙"></a>

### 목적과 적용 원칙

**OSMD의 악기·주법 전용 매핑 또는 공식 표기 규칙을 먼저 확인한다.** 원본 PDF의 외형보다 연주 의미를 기준으로 유효한 MusicXML을 작성한다.

- 적용 범위: 드럼 악기, 오선 위치, 음표머리, 주법, 쉼표, 스티킹 및 가사 저장.
- 완료 기준: 연주 의미가 구분되고 저장한 XML을 OSMD로 다시 열어 선택한 표기가 표시된다.
- 문서 변경과 구현·곡별 적용을 구분한다. 실제 입력·출력·버전·날짜·검증 범위를 기록한다. 새 항목·OSMD 버전 변경은 재검증한다.
- 악기 ID·표시 위치·음표머리를 각각 명시한다. 이름만으로 기호를 정하거나 표시 편의로 악기·리듬·연주 의미를 바꾸지 않는다.
- 일반 도형의 출력 성공은 전용 지원의 증거가 아니다. 근거 없는 항목은 자동 채택하지 않으며 승인된 대체 표현도 전용 규칙과 구분한다.

<a id="score-musicxml-osmd-mapping--문서-변경과-실행-순서"></a>

### 문서 변경과 실행 순서

- 대화·조사·시험표·임의 코드 매핑으로 이 정본을 대신하지 않는다.
- 대체 매핑의 제안·실험은 조사 문서에 둔다. 사용자 결정 전에는 현행 규칙으로 추가·대체하지 않는다.
- 대체 매핑은 **보고 → 사용자의 명시적 결정 → 매핑 문서 변경 → 문서에 따른 구현/데이터 적용 → 검증** 순서로 진행한다.
- 대상·방식·MusicXML 표현·범위는 Rule, 결정 근거·대체 이력은 ADR, 적용 검증은 history.md·제작/개발 기록에 둔다.
- 일반 정책 승인은 특정 대체 매핑의 승인이 아니다. 미확정 항목은 적용을 보류하고 보고한다.

<a id="score-musicxml-osmd-mapping--선택과-보고-절차"></a>

### 선택과 보고 절차

[선택·보고 절차](../../how-to/produce-score.md#score-production-process--악기주법-선택과-보고)를 실행하되 범례·지원 판정·승인 기준은 이 문서를 따른다.

<a id="score-musicxml-osmd-mapping--섹션-표제와-연주-지시"></a>

### 섹션 표제와 연주 지시

배치는 [섹션·연주 지시 7원칙](rendering.md#svg-score-rules--4-구간-시작-표시)을 따른다.

- 섹션은 `direction/direction-type/rehearsal`, 텍스트 지시는 별도 `direction/direction-type/words`로 저장한다. 예: `A`와 `Closed H.H →`. 같은 마디·겹침을 이유로 하나의 rehearsal 문자열로 합치지 않는다.
- 원본의 섹션 이름·순서·적용 마디와 지시문·음악적 위치를 보존한다. 교정할 때 임의 추가 표제만 제거하고 마디·음표는 유지한다.
- 마디 시작 기준 위치는 `rehearsal`의 `default-x`, 정렬은 `halign`·`justify`, 높이 분리는 words의 relative-y 등으로 기록한다. 표시 offset과 words의 default-x를 병용하지 않는다.
- 테두리 여백·외곽선 정렬·충돌·최소 여백·같은 줄 범위를 공통 조판으로 확인한다. 속성 저장만으로 지원을 확정하거나 SVG 수정·곡별 외부 좌표표로 대신하지 않는다.

악기 주법의 전용 인코딩은 아래 범례를 따른다. 이 절의 words는 텍스트 지시다.

<a id="score-musicxml-osmd-mapping--확정-범례"></a>

### 확정 범례

프로젝트 승인 표기이며 전용 표준 확인과는 구분한다. 근거: [ADR-0007](../../decisions/0007-native-drum-notation.md).

선과 칸은 아래부터 센다. 이 프로젝트에서 **제5칸은 제5선 바로 위 공간(G5)**이다. 위 첫째 덧줄은 A5다. 표시 좌표는 실제 음높이가 아닌 percussion clef의 MusicXML 좌표다.

| 항목                                        | 확정 위치·모양                            | MusicXML 표현/적용 상태                                                                                                                             |
| ------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Closed Hi-Hat / 기본 하이햇                 | 제5칸 ×                                   | G5, notehead=x                                                                                                                                      |
| Open Hi-Hat                                 | 제5칸 원 안 ×                             | G5, notehead=circle-x                                                                                                                               |
| Hi-Hat Open 동작                            | 제5칸의 하이햇 음표 위 ○                  | 승인된 open-string 표현. 열린 상태와 구분                                                                                                           |
| Hi-Hat Close 동작                           | 제5칸의 하이햇 음표 위 ＋                 | 승인된 stopped 표현. 닫힌 상태와 구분                                                                                                               |
| Hi-Hat Open → Close 복합 지시 / O+          | 제5칸 하이햇의 같은 음표 위 ○＋ 가로 배치 | 같은 note/notations/technical의 harmonic·stopped. XML 위치·보존·검증은 [O+ 승인 범위](#score-musicxml-osmd-mapping--o-복합-지시의-승인-범위)를 따름 |
| Hi-Hat Half-Open 동작                       | 제5칸 하이햇 음표 위 원 안 ＋             | technical/half-muted smufl="pictHalfOpen1". 공식 타악기 주법 기호. OSMD 원생 지원과 앱의 전용 글리프 보완을 구분                                    |
| Ride                                        | 제5선 ×                                   | F5, notehead=x                                                                                                                                      |
| Ride Bell                                   | 제5선 ▲                                   | F5, notehead=triangle, filled=yes                                                                                                                   |
| Crash                                       | 위 첫째 덧줄 ×, 원 없음                   | A5, notehead=x                                                                                                                                      |
| Tom 1 / Tom 2                               | 제4칸 / 제4선, 일반 머리                  | E5 / D5                                                                                                                                             |
| Tom 3                                       | 제3선, 일반 머리                          | B4                                                                                                                                                  |
| Tom 4 = 플로어 탐                           | 제2칸, 일반 머리                          | A4. 같은 항목의 별칭으로 관리                                                                                                                       |
| Tom 5                                       | 제2선, 일반 머리                          | G4                                                                                                                                                  |
| Right Bass / 싱글 킥                        | 제1칸, 일반 머리                          | F4. 싱글 킥 구성에서는 이 항목만 사용                                                                                                               |
| Left Bass                                   | 제1선, 일반 머리                          | E4. 더블 킥 구성에서 추가                                                                                                                           |
| Snare / Cross Stick(Rim Click) / Ghost Note | 제3칸의 일반 머리 / × / 괄호 머리         | C5. 고스트는 parentheses=yes 저장, 앱에서 누락 괄호 보완. OSMD 자체 미지원과 구분                                                                   |
| Hi-Hat Pedal / 풋 하이햇                    | 아래 첫째 덧칸 ×                          | D4                                                                                                                                                  |

각 음표의 `instrument`는 곡의 `score-instrument` ID를 참조한다. 소리/MIDI 재생 지원은 시각 표기 지원과 별도로 검증한다.

#### 타격 없는 하이햇 닫기

- 원본이 하이햇 타격 없이 닫기 동작만 지시하면 해당 시점의 기존 음표에 `technical/stopped`를 연결한다. 연결 음표의 악기·음가를 바꾸거나 하이햇 타격을 추가하지 않는다.
- 연결 음표가 스네어·킥·크래시라는 사실과 닫는 대상이 하이햇이라는 사실을 구분한다. 원본의 동작·연결 사건·대상 악기·추가 타격 없음과 근거를 제작 메타정보 또는 판독 기록에 남긴다.
- `stopped`만으로 외부 재생기가 하이햇 닫기 대상을 해석한다고 보장하지 않는다. 기존 승인 표기의 보존 범위이며 새로운 기호·음표 대체나 일반적인 타격 생성 규칙이 아니다.

<a id="score-musicxml-osmd-mapping--o-복합-지시의-승인-범위"></a>

#### O+ 복합 지시의 승인 범위

새 제작·교정에서 원본의 한 음표에 붙은 O+를 아래와 같이 기록한다. 기존 악보 전체를 자동으로 일괄 변경하지 않는다.

| 항목      | 규칙                                                                |
| --------- | ------------------------------------------------------------------- |
| 저장 요소 | 같은 `note/notations/technical`에 `harmonic`, `stopped` 순서로 기록 |
| 세로 위치 | 두 요소의 `default-y`를 동일하게 지정                               |
| 가로 위치 | `default-x`로 ○ 왼쪽·＋ 오른쪽을 지정. 겹치면 `stopped`의 값을 조정 |
| 좌표 단위 | X는 해당 음표 왼쪽, Y는 오선 맨 위 선을 기준으로 한 tenths          |
| 보존 대상 | 원래 음가·박·성부·화음·타격 수                                      |

XML 좌표는 두 앱의 [공통 조판](rendering.md#svg-score-rules--native-조판-계약)으로 반영한다. 실제 잉크 경계·크기·주변 요소로 간격을 정한다. 예시 좌표의 전곡 고정, 외부 좌표표·완성 SVG 수정은 금지한다.

별도 음표의 열기·닫기는 원래 연결을 유지한다. 단독 열기·닫기·반열림은 각 범례를 따른다.
XML 순서·가로 간격은 닫기 시각이 아니다. 원본에 없는 닫기 시각·지연·추가 타격을 만들지 않는다.

저장 후 다음을 검증한다.

- MusicXML 규격, 음표 시간표·타격 수와 대상 외 음악 데이터의 보존.
- 공통 조판으로 재생성한 모든 O+의 같은 높이, ○ 왼쪽·＋ 오른쪽, 기호·주변 요소 사이의 겹침 여부.
- 새 곡의 결과를 해당 제작 기록에 남긴다. 이전 곡의 검증을 새 곡의 통과 근거로 사용하지 않는다.

<a id="score-musicxml-osmd-mapping--반열림-하이햇의-공식-표기-경로"></a>

#### 반열림 하이햇의 공식 표기 경로

- [SMuFL 1.4 타악기 주법 표](https://www.w3.org/2021/03/smufl14/tables/percussion-playing-technique-pictograms.html)의 `pictHalfOpen1`(U+E7F6, Half-open)을 사용한다. 원 안 ＋이며 일반 원/십자 도형이나 일반 텍스트로 그리지 않는다.
- [MusicXML half-muted](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/half-muted/)의 `smufl` 속성으로 해당 기호를 지정한다. 속성 없는 half-muted의 기본은 `brassMuteHalfClosed`이므로 다른 악기나 일반 half-muted를 반열림 하이햇으로 자동 바꾸지 않는다.
- 앱 보완은 정확히 half-muted[smufl="pictHalfOpen1"]인 입력만 공식 Bravura glyph로 표시한다. 공식 SMuFL 기호와 OSMD 전용 하이햇 파서 지원은 구분한다. 원생 지원·당시 검증은 [ADR-0007](../../decisions/0007-native-drum-notation.md)에 보존한다.

<a id="score-musicxml-osmd-mapping--한쪽-범례에만-있는-항목"></a>

#### 한쪽 범례에만 있는 항목

두 범례 중 한쪽에만 있는 항목도 삭제·병합하지 않는다. 아래는 시각 표기 승인 범위이며 인코딩·OSMD 출력·음향 검증 완료를 뜻하지 않는다.

| 출처            | 항목                | 채택할 범례 표기                                                                 |
| --------------- | ------------------- | -------------------------------------------------------------------------------- |
| 승인된 Drum Key | China               | 위 첫째 덧줄의 원 안 ×                                                           |
| 승인된 Drum Key | Splash              | 위 첫째 덧줄의 빈 마름모                                                         |
| 승인된 Drum Key | Cowbell             | 위 첫째 덧줄의 채운 삼각형                                                       |
| 승인된 Drum Key | Choked Crash        | 위 첫째 덧줄 × 위 점. 초크 의미 유지; 단순 staccato 의미로 치환하지 않음         |
| 승인된 Drum Key | Snare Doubles       | 제3칸 스네어 음표 줄기의 세 빗금. 더블 스트로크 주법 의미 유지                   |
| 승인된 Drum Key | Snare Buzz          | 스틱을 튀겨 만든 지속음. 제3칸 스네어, tremolo type=unmeasured 표준 경로         |
| 승인된 Drum Key | Hi-Hat Splash       | 아래 첫째 덧칸의 원 안 ×. 풋 하이햇과 별도 주법                                  |
| 이전 상세 범례  | Hi-Hat Open / Close | 위 표의 열기 ○ / 닫기 ＋ 동작 지시                                               |
| 이전 상세 범례  | R/L sticking        | 각 해당 타격의 R 또는 L. 손 지시를 유지; words 출력 경로는 의미 자동 인식과 구분 |

서로 모순되지 않는 낮은 탐·킥 구성은 모두 유지한다.

<a id="score-musicxml-osmd-mapping--쉼표"></a>

### 쉼표

쉼표는 기본 악보 요소다. 악기 기호의 임의 도형 대체 금지를 쉼표·음가·박자·가사·메타정보의 금지로 확대하지 않는다.

| 상황                             | 저장/표시 규칙                                                                                             |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 전체 마디가 쉼                   | `rest measure="yes"`를 사용하고 display-step/display-octave를 넣지 않는다. OSMD 기본 중앙 배치를 사용한다. |
| 다른 성부가 연주하는 마디의 쉼표 | 심벌=상단, 드럼=중단, 킥=하단 역할 높이를 유지한다. 전체 쉼 마디와 구분한다.                               |
| 일반 2분·점2분 등 부분 쉼표      | 음가와 시작 박 위치를 보존한다. 긴 쉼표라는 이유만으로 쉬는 구간 가운데로 옮기지 않는다.                   |

온마디쉼표 높이 미지정은 프로젝트의 OSMD 호환 정책이며 MusicXML의 높이 지정 금지를 뜻하지 않는다.

<a id="score-musicxml-osmd-mapping--rl-스티킹--현재-승인-규칙"></a>

### R/L 스티킹 — 현재 승인 규칙

- R=오른손, L=왼손. 명칭은 sticking이며 fingering(손가락 운지)으로 저장하지 않는다.
- `direction/direction-type/words`를 단일 저장 경로로 사용한다. 앱은 각 타격의 줄기 위에 R 또는 L 하나를 배치한다.
- 서로 다른 타격의 R/L을 한 음표에 쌓지 않는다. 성부와 대상 음표의 위치를 유지한다.
- **전용 sticking 규칙은 미확인이다.** words는 프로젝트 승인 표현이며 타 소프트웨어의 손 지시 자동 인식을 보장하지 않는다.
- `other-technical` 문자열과 fingering 우회는 채택하지 않는다.

<a id="score-musicxml-osmd-mapping--메타-정보와-가사"></a>

### 메타 정보와 가사

- 악보·원제·표시제목·가수·작사·작곡·가사 성부는 해당 MusicXML의 [저장 계약](musicxml.md#musicxml-canonical--저장-계약)을 따른다. `lyric/text`는 같은 드럼 파트·보표의 독립 가사 성부에 연결한다.
- 보컬 악보는 그 리듬을, 인쇄 드럼 악보는 음표·쉼표와 가사의 대응을 사용한다. 근거가 부족한 위치는 미확정으로 남긴다.
- [악보 우선 가사 기준](production.md#musicxml-conversion-policy--가사-기준--악보-우선)을 따른다. 실연 차이로 위치·음가를 바꾸거나 실제 가창 측정·STT 성공을 요구하지 않는다.
- 음원 연결과 가사 위치를 구분한다. 마디 귀속만 확인되면 [마디 가사 계약](musicxml.md#measure-lyrics--마디-단위-인쇄-가사-계약)으로 저장하며 음절 위치·음가는 만들지 않는다.
- 영어는 영어로 유지한다. 이 문서는 기존 가사 싱크나 메타데이터 필드 이름을 새로 변경하지 않는다.

<a id="score-musicxml-osmd-mapping--지원-경계-osmd-자체와-앱-보완"></a>

### 지원 경계: OSMD 자체와 앱 보완

- 고스트 입력은 `<notehead parentheses="yes">normal</notehead>`를 유지한다. 앱은 누락된 괄호를 해당 머리 경계에 연결해 보완하며 임의의 일반 괄호 텍스트를 놓는 것으로 대신하지 않는다.
- 내부 GhostNote 클래스는 보이지 않는 리듬 공간이며 드럼 고스트 주법 지원이 아니다. 괄호 표시와 작은 음량 재생도 별개다.
- 라이드 벨 등 악기별 도형/좌표와 words 스티킹의 프로젝트 승인으로 OSMD 전용 표준이 확인됐다고 보고하지 않는다. 미확인을 기능 부재·버그로 단정하지 않는다.
- 가사 정본은 [서로 다른 음절의 시작점 계약](musicxml.md#musicxml-canonical--서로-다른-음절의-시작점)을 따른다. 구형 동시 시작을 읽는 것과 새 가사 정본의 작성 적합성을 구분한다.
- 위치·기호의 공통화와 성부·화음·기둥·빔·쉼표 구조의 보존을 구분한다. 미등록 악기는 임의로 변환하지 않는다.
- XML의 percussion 음자리표·악기 정보는 유지한다. 앱 SVG의 clef 숨김과 실제 세로줄·반복기호 보존은 SVG Rule을 따른다.

<a id="score-musicxml-osmd-mapping--2026-10-03-최종-재확인-모든-곡에-확정-범례-적용"></a>

<a id="score-musicxml-osmd-mapping--확정-범례의-적용-범위"></a>

#### 확정 범례의 적용 범위

- Crash=A5 x, Open Hi-Hat=G5 circle-x를 모든 곡의 공통 기준으로 사용한다. 특정 곡의 빈 머리 예외·circle-x 전체를 크래시로 보는 보정을 사용하지 않는다.
- 성부 구성·화음·기둥 방향·연결선·쉼표와 backup/forward를 원본대로 유지하고 킥을 공통 분리하지 않는다.
- 공통 범례 실행은 drum-legend.ts를 따른다. 알려진 입력의 오분류 이관은 원본 식별 근거로 한정하며 임의 ID/도형에서 추측하지 않는다.
- 공통 범례의 승인·교정 근거와 곡별 오분류 사례는 [ADR-0007의 최종 재확인 원문](../../records/archive/adr-0007-native-drum-notation-sources.md#2026-10-03-최종-재확인-모든-곡에-확정-범례-적용)에 보존한다.

<a id="score-musicxml-osmd-mapping--근거와-관리"></a>

### 근거와 관리

- MusicXML 표준은 [percussion](https://www.w3.org/2021/06/musicxml40/tutorial/percussion/), [notehead](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/notehead/), [rest](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/rest/)를 따른다. 프로젝트 채택과 전용 표준 확인을 구분한다.
- 과거 조사 보관본·QA 파일의 존재나 예전 버전 PASS를 새 지원 판정으로 사용하지 않는다. 새 항목/엔진 버전은 실제 근거와 한계를 기록한다.

| 주제               | 결정 이력                                                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| 범례·고스트·스티킹 | [ADR-0007](../../decisions/0007-native-drum-notation.md)                                                                           |
| 섹션·텍스트 지시   | [ADR-0009](../../decisions/0009-musicxml-section-direction-layout.md)                                                              |
| O+                 | [ADR-0011](../../decisions/0011-hi-hat-open-close-position.md)                                                                     |
| 가사 저장 위치     | [ADR-0029](../../decisions/0029-shared-staff-lyric-voices.md)                                                                      |
| 가사 기준·메타정보 | [ADR-0013](../../decisions/0013-score-based-lyric-positions.md), [ADR-0014](../../decisions/0014-score-artist-and-kit-metadata.md) |
