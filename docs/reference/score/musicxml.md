# MusicXML 입력과 정본 계약

문서 역할: **현행 Rule**. 현재 요구·계약과 지원 한계를 다룬다. [전체 정본](../../RULES-INDEX.md), [실행 안내](../../README.md), [결정 이력](../../decisions/README.md)을 함께 참고한다.

<a id="musicxml-input--musicxml-입력-계약"></a>

## MusicXML 입력 계약

문서 역할: **현행 Rule**. 정본 저장은 [canonical 계약](musicxml.md#musicxml-canonical--musicxml-정본-계약), 표기는 [승인 매핑](notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙), 출력은 [SVG 규칙](rendering.md#svg-score-rules--svg-전체-악보-생성-규칙)을 따른다. 결정 근거는 [ADR-0004](../../decisions/0004-browser-native-score-rendering.md)에서 확인한다.

<a id="musicxml-input--형식과-지원-경계"></a>

### 형식과 지원 경계

입력 확장자는 `.musicxml`, `.xml`, `.mxl`이다. 여러 파트는 선택해서 가져오며 원래 MXL ZIP 바이트를 보존한다.

- score-partwise / 한 파트의 단일 오선, 박 수1~16 / 분모2·4·8·16, 마디 경계 템포 변경 지원. 12MB 이하 XML/MXL, 최대2000마디.
- 여러 파트 중 선택 가능. piano처럼 한 파트가 여러 오선을 가지는 경우, score-timewise, 못갖춘마디/불완전한 음가 합계, 마디 중간 템포 변경은 오류 안내 후 중단한다.
- 반복·다카포·코다는 인쇄 순서이며 자동 연주 순서 확장을 하지 않는다. 여러 마디 쉼표는 각 마디로 표시한다.
- 악보 문서의 배치와 렌더러 특성에 따라 페이지 수·글자 배치는 원본 PDF와 달라질 수 있다. 변환 후보 악보의 악기 매핑 정확성은 별도 변환 작업의 검증 대상이다.
- 렌더러의 음표/쉼표 시각 좌표로 정박 기준점을 만들고 박 사이를 보간한다. 완전한 음표별 커서/악보 편집기는 이 입력 계약에 포함하지 않는다.
- XML 템포·가사 음가는 녹음의 실제 첫 박/루바토/발음 시각을 증명하지 않는다. 기존 시간 편집 기능으로 보정한다.
- 원본 악보 바이트는 기존 `pdf` 저장 슬롯에, 형식과 선택 파트는 `scoreFormat`/`scorePartId`에 저장한다. 이 입력 경로에 별도 DB 마이그레이션을 요구하지 않는다. 실제 MXL은 ZIP 원본 바이트를 유지한다.

<a id="musicxml-input--곡별-악보-형식"></a>

### 곡별 악보 형식

- 곡 ID 하나에 공통 음원·가사·시간축·마커·반복·설정을 둔다. 목록의 유형 버튼은 실제 원본이 보관된 PDF/MusicXML과 비어 있지 않은 가사만 표시한다.
- 활성 악보는 기존 pdf/pages/song.regions 슬롯을 유지한다. 비활성 유형은 RecordData.otherScores에 원본·페이지·영역·마디 ID 대응을 저장한다. 전환 시 현재 영역 편집을 스냅샷으로 보관하고 대상 영역만 교체한다.
- 같은 유형 재추가는 확인 후 그 유형만 갱신한다. 다른 유형은 보존한다. 제목이 같은 별도 곡을 임의로 합치지 않는다.
- 마디 추가/삭제/박자 변경으로 이전 유형과 구성이 달라졌다면 전환을 거절한다. 새 PDF는 감지한 마디 수, XML은 마디 수와 박자표가 현재 곡과 같아야 한다. PDF 감지가 틀렸다면 그대로 연결하지 않는다.

PDF/MusicXML의 비활성 원본·페이지·영역·마디 대응은 `RecordData.otherScores`에 보존한다. bytes-v1과 제작 ZIP 백업의 원본 자산 보존을 유지한다. 독립 HTML 저장은 지원하지 않는다. 기존 단일 악보 데이터는 계속 읽으며 과거 소실된 원본을 복구했다고 표시하지 않는다.

<a id="musicxml-input--실행"></a>

### 실행

[제작·검수 절차](../../how-to/produce-score.md#score-production-process--악보-제작-프로세스)와 [완성 파일 사용](../../how-to/review-score.md#practice-files--완성-악보와-연습-정보-파일-사용-절차)을 따른다. 입력 파싱 성공은 채보 정확성·주법 렌더링 성공의 증거가 아니다.

<a id="musicxml-canonical--musicxml-정본-계약"></a>

## MusicXML 정본 계약

현재 저장·복원·가사·메타정보·음원 연결의 Rule이다. 악보 입력은 [매핑 정본](notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙), 출력은 [SVG Rule](rendering.md#svg-score-rules--svg-전체-악보-생성-규칙)을 따른다. 선택 이유·이전/폐기·당시 검증은 [결정 기록](../../decisions/README.md)에서 확인한다.

<a id="musicxml-canonical--현재-가사-제작-기준"></a>

### 현재 가사 제작 기준

악보가 표준이다. 가사 위치·음가는 원본 악보를 기준으로 저장하며, 가수의 실제 가창 차이를 반영하지 않는다. 실제 가창 시각·길이의 측정·기록은 요구하지 않는다. `time/end/grid`는 악보 위치와 음원 연결에서 계산한 재생 캐시이며 실제 발음의 전사 값이 아니다. 별도 `DrumPracticeLyrics`는 기존 저장 구조로 유지한다. 자세한 기준은 [변환 정책](production.md#musicxml-conversion-policy--가사-기준--악보-우선)을 따른다.

<a id="musicxml-canonical--저장-계약"></a>

### 저장 계약

- `RecordData.canonicalXML`이 정본이다. 악보 원문을 유지하며 `DrumPracticeLyrics` 파트만 앱이 다시 쓴다. 제목·제작자 변경도 여기에 쓴다. `Song`의 메타정보·가사·재생 시각은 화면/오디오용 파생 모델이고, 열 때 XML에서 다시 복원한다.
- 가사 위치: `measureId + quarterOffset + durationQuarters`. 단위는 사분음표 길이이며 박자표 분모에 따라 화면의 ‘박’으로 변환한다. 기본 편집은 ¼박이고, 보컬 악보의 세부 음가는 그대로 보존한다. XML은 divisions/duration, 독립된 unpitched 음표와 lyric으로 기록한다. 음높이는 추정하지 않는다. 동시 음절은 서로 다른 voice로, 마디를 넘는 길이는 extend로 보존한다.
- 초 단위 자유 가사 편집과 끝 시각 입력은 제공하지 않는다. `time/end/grid`는 재생·기존 표시 코드의 캐시다. 이력의 이전 초 단위 데이터는 복구 근거로만 남긴다. 초기 이전 때 기존 시작 격자를 유지하고 끝 길이는 음악적 단위로 변환한다.
- 원제는 work-title, 표시 제목은 movement-title 및 `drum-practice:display-title`, 제작자는 artist/composer/lyricist로 저장한다. 원래의 다른 메타정보/파트는 유지한다.
- **앞으로 제작하는 모든 드럼 연습 악보의 가수란(`artist`)에는 선택하여 사용하는 드럼킷 이름을 반드시 기록한다.** 예: `SoCal 드럼킷`, `Portland 드럼킷`. 드럼킷은 [선택 기준](drum-kits.md#garageband-drum-kits--드럼킷-선택과-보존-라이브러리)에 따라 정하고 SoCal로 고정하지 않는다.
- 연습 악보의 키트 이름은 MusicXML `identification/creator type="artist"`와 파생 `Song.artist`에 동일하게 저장한다. 패키지를 만들면 내장 정본 XML과 Song의 값도 동일해야 한다. 제작·교정·재제작·저장 후 재읽기에서 누락이나 불일치를 확인한다. 이 메타정보 규칙이 요청하지 않은 음원 제작을 추가하는 것은 아니다.
- 일반 곡 악보의 `artist`는 실제 가수·아티스트를 유지한다. 세션 연주자·강사·참고 영상 채널은 가수로 입력하지 않는다. 참고 자료의 출처는 제작 문서에 보존한다.
- `drum-practice:score:v1` miscellaneous-field에 마디의 안정 ID, 라벨·박자표와 음원 시작/끝 연결점, 음원 SHA-256, 음절 ID·확인 상태를 둔다. 현 앱의 인쇄 순서 재생에 맞춰 occurrence=1이다. 반복 기호의 자동 펼치기는 기존과 같이 지원하지 않는다. 임의 중간 박 앵커 UI는 제공하지 않으며 기존 마디 시작/끝 연결로 보간한다.
- XML 음원 해시가 있으면 열 때 실제 음원과 대조한다. 렌더러를 통과해 정본을 다시 만들지 않으므로 앱 전용 확장 필드가 사라지지 않는다.
- MusicXML에 실제 드럼 악보가 있으면 마디 수/박자표를 바꾸는 편집은 원본 악보에서 수행하도록 막는다. 영역과 음원 연결은 앱에서 수정 가능하다. PDF만 있는 곡에서는 PDF를 유지하며 가사 XML부터 생성한다. 이 XML을 드럼 음표까지 채보된 악보라고 표시하지 않는다.

<a id="musicxml-canonical--음원-템포와-연습-박"></a>

### 음원 템포와 연습 박

- **연습 박은 선택한 연습 속도에 따른 일정한 메트로놈 박을 기준으로 한다.** 실연의 개별 타격이 앞서거나 늦는 그루브를 박별 시간표에 반영해 연습 격자를 흔들지 않는다. 악보에 기보된 리듬·음가·박자 변경은 보존한다. 승인된 곡별 일정 연결 정책을 자동 실연 추종으로 바꾸지 않는다. Loveholic의 고정 연결·추가 추종 분석 제외 범위와 수치는 [ADR-0015](../../decisions/0015-score-tempo-and-recording-estimates.md#context-and-problem-statement)를 따른다.
- 악보 템포와 음원 측정값은 분리한다. `drum-practice:recording-tempo:v1` miscellaneous-field에는 `version`, `scoreBpm`, `bpmEstimate`, `firstBeatEstimateSeconds`, `audioSHA256`, `method`, `status`를 JSON으로 둔다. 앱은 원곡 추정값을 표시하되 ‘원곡’ 재생은 배속1.0으로 한다. 이 필드가 있다는 이유로 표준 악보 템포나 기존 마디 시각을 덮어쓰지 않는다. 측정값은 해당 음원 해시와 결합된 추정치이며 일반 MusicXML 앱의 필수 기능이 아닌 이 프로젝트의 메타정보다.

<a id="musicxml-canonical--악보의-박별-음원-연결"></a>

#### 악보의 박별 음원 연결

- `drum-practice:score:v1`의 마디에 선택적인 `beatTimes`를 저장하고 `Song.measures`로 복원한다. 배열 길이는 기보 박 수, 첫 값은 `start`, 이후 값은 엄격한 증가이며 모두 `end`보다 작아야 한다. 음가·박자표·가사 위치는 바꾸지 않는다.
- 배열이 없으면 기존 시작/끝 균등 보간을 유지한다. 기존 악보에 자동 추정 박을 주입하지 않는다. 승인된 곡별 일정 연결 정책은 유지한다.
- 원곡은 원본 1배속과 저장된 박 시각을 사용한다. 연습 모드는 박자표 분모를 반영한 사분음표 위치로 음원을 정규화하여 고정 BPM을 사용한다. 원곡의 현재 BPM은 완료된 최근 박 간격에서 계산한다.
- 시작/끝 연결점을 편집하면 내부 박 시각도 같은 비율로 이동한다. 명시적 전체 템포 재배치 및 XML 표준 템포 적용은 박별 배열을 제거하고 균등 연결로 바꾼다. 정본에 배열이 없으면 파생 캐시의 배열도 제거한다.
- 붉은 노을의 `drum-practice:recording-grid:v1`은 제작 추정의 근거만 보존한다. 런타임은 이 필드를 임의 적용하지 않는다.

<a id="musicxml-canonical--보컬-악보-입력"></a>

### 보컬 악보 입력

보컬 MusicXML의 선택 파트는 마디 수·각 박자표가 일치하고 전주·반복 순서가 확인되어야 한다. 가사가 있는 음표의 리듬을 독립 가사 파트에 기록하고 원래 보컬 파트는 `DrumPracticeVocalSource`로 보존한다. 가사 교체에는 사전 확인이 필요하며 이전 가사는 이력에 보관한다. PDF 보컬 악보의 자동 채보와 음절별 노래 청취는 이 입력 계약에 포함하지 않는다. 조작 순서는 [보컬 입력 절차](../../how-to/correct-lyrics.md#score-production-process--보컬-musicxml-입력)를 따른다.

<a id="musicxml-canonical--보존과-교환"></a>

### 보존과 교환

- IndexedDB, ZIP의 `canonical.musicxml`(미디어 제외 백업에도 포함)이 정본을 보존한다. MusicXML 내보내기는 정본 XML을 직접 저장한다. 다시 가져오면 가사·메타정보·연결점을 읽는다.
- 독립 HTML 저장·내보내기는 제공하지 않는다.
- 기존 PDF만 있는 곡은 원본 PDF를 유지하고 가사 XML부터 보존한다. 채보하지 않은 드럼 음표를 만들거나 가사 XML을 전체 드럼 채보라고 표시하지 않는다.

<a id="musicxml-canonical--렌더러-계약"></a>

### 렌더러 계약

- OpenSheetMusicDisplay와 두 앱의 공통 조판 경로를 유지한다. MusicXML 원문은 렌더러 출력으로 재생성하지 않는다. Song·초 단위 가사·SVG는 각각 편집/재생/표시의 파생 모델이다.
- native 조판·파생 캐시는 [브라우저 계약](rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약), 선택 이유는 기존 [ADR-0004](../../decisions/0004-browser-native-score-rendering.md)와 [ADR-0012](../../decisions/0012-musicxml-canonical-source.md)를 따른다.

<a id="musicxml-canonical--검증"></a>

### 검증

- 저장 후 실제 정본을 재읽어 마디 ID/박자·메타정보·가사 위치/음가·음원 해시·연결점과 선택적 beatTimes를 비교한다. 파생 캐시가 정본의 누락값을 다시 주입하지 않게 한다.
- 동시 음절·마디를 넘는 길이·보컬 세부 음가와 연결점 편집 후 음악적 위치 보존을 확인한다.
- MusicXML 규격과 실제 저장/재읽기 결과를 구분한다. 외부 프로그램의 확장 필드 보존은 별도 검증 없이는 보장하지 않는다.
- 실제 검사 범위·정확한 입력·환경·한계는 제작/개발 기록과 history.md에 남긴다. 과거 검사·시작 위치 이전·기기 검증을 이번 실행의 통과로 사용하지 않는다.

<a id="musicxml-canonical--결정-근거"></a>

### 결정 근거

- [ADR-0012](../../decisions/0012-musicxml-canonical-source.md): 정본 원천·저장·교환과 과거 전환 검증.
- [ADR-0013](../../decisions/0013-score-based-lyric-positions.md): 악보 우선 가사·독립 성부·보컬 입력.
- [ADR-0014](../../decisions/0014-score-artist-and-kit-metadata.md): 제목·가수·연습 드럼킷 메타정보.
- [ADR-0015](../../decisions/0015-score-tempo-and-recording-estimates.md): 악보 템포와 음원 추정값 분리.
- [ADR-0016](../../decisions/0016-explicit-recording-beat-connections.md): 명시적 박 연결과 고정 연습 박.

<a id="measure-lyrics--마디-단위-인쇄-가사-계약"></a>

## 마디 단위 인쇄 가사 계약

결정 근거: [ADR-0013](../../decisions/0013-score-based-lyric-positions.md). 실행: [절차](../../how-to/produce-score.md#score-production-process--악보-제작-프로세스).

<a id="measure-lyrics--목적과-범위"></a>

### 목적과 범위
인쇄 악보에서 마디 귀속만 확인되는 가사를 가창 시작·길이 추정 없이 보존하고 공통 재생 화면 중앙에 표시한다. 기존 음절 가사는 `Song.lyrics`와 `scorePosition`을 유지한다.

<a id="measure-lyrics--데이터"></a>

### 데이터
`Song.measureLyrics?: { id: string; measureId: string; text: string; placement: "measure-center" }[]`

- 마디 ID는 실제 measures 항목이어야 하며 항목 ID와 마디 귀속은 각각 중복되지 않는다. 한 마디의 문구는 하나의 text로 합친다.
- time/end/quarterOffset/durationQuarters를 갖지 않는다. 음절 강조·가창 길이를 주장하지 않는다.
- canonical MusicXML의 기존 miscellaneous manifest에 선택 필드로 저장한다. 가짜 음표를 생성하지 않는다. 원본 성부는 유지한다. 예전 파일은 필드 없이 호환된다.
- `.drumscore` Song 데이터와 XML 왕복에서 보존한다. 공통 renderMeasure가 PDF/SVG, 한 줄/두 줄에 동일하게 표시한다. 음절 충돌 배치 대상이 아니다.
- 전체 가사 문서가 있으면 그 문서를 표시한다. 없으면 마디 가사를 마디 순서로 표시한다. 박 단위 가사 편집 표는 기존 리듬 가사만 편집하며, 마디 문구용 편집 UI는 제공하지 않는다.
