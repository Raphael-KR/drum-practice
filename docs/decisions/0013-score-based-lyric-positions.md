---
status: accepted
date: 2026-10-23
---

# 가사는 악보 위치와 음가를 정본으로 저장한다

## Context and Problem Statement

초 단위 가사 편집과 실연 가창의 차이가 악보 위치와 혼동되었다. 2026-10-03 사용자는 악보를 기준으로 하고 실제 가창 시각·길이 측정을 추가하지 않도록 확정했다.

## Considered Options

* 실제 발음 시각·길이를 가사 정본으로 둔다.
* 독립 가사 리듬 성부의 마디/사분음표 위치·음가를 정본으로 둔다.

## Decision Outcome

후자를 채택한다. measureId·quarterOffset·durationQuarters와 DrumPracticeLyrics를 유지하고 time/end/grid는 재생 캐시로 취급한다. 보컬 입력은 원래 리듬을 읽고 DrumPracticeVocalSource도 보존한다.

### Consequences

없는 보컬 음높이를 추정하거나 드럼 PDF를 자동 채보했다고 표시하지 않는다. 실제 가창 차이·STT 성공을 제작 완료의 추가 조건으로 만들지 않는다.

### Confirmation

현재 계약은 [MusicXML 정본](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약), 입력은 [매핑 Rule](../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙)을 따른다. 아래 PASS·측정·기기 결과는 당시 범위이며 이번 문서 분리에서 앱 시험을 재실행하지 않았다.

## More Information


### MusicXML 입력 매핑·정본 계약에서 옮긴 근거 — 2026-10-23 이관

아래 원문은 당시 문맥·승인/검증 범위를 보존한다. 과거의 미확인·보류·HTML·시안 수치를 현재 지원이나 새 실행으로 해석하지 않는다. 현행 규칙은 입력 매핑·정본 계약·SVG Rule에서 확인한다.

#### 메타 정보와 가사

- 해당 곡의 MusicXML에 악보, 원제·표시제목·가수·작사·작곡 등의 메타 정보, 가사 리듬 성부를 모아 관리한다. 기존 프로젝트의 MusicXML 저장 계약을 유지한다.
- 가사는 드럼과 독립된 가사 리듬 성부의 음표에 `lyric/text`로 연결한다. 보컬 악보가 있으면 그 리듬을 사용한다. 인쇄 드럼 악보에서는 가사와 실제 음표/쉼표의 대응을 판독해 음악적 위치와 표시 음가를 저장한다. 추정 위치는 제작 근거에 따로 남긴다. 2026-10-03 Loveholic도 Real Paradis와 같은 표준 가사 기능으로 처리하라는 사용자 요청을 반영했다.
- 2026-10-03 최신 결정은 악보 우선이다. 가수의 실제 가창이 악보와 달라도 가사 위치·음가를 바꾸지 않는다. 실제 가창 시각·길이 측정·기록과 STT 성공을 요구하지 않는다. [변환 정책의 가사 기준](../reference/score/production.md#musicxml-conversion-policy--가사-기준--악보-우선)을 따른다.
- 가사 위치 정본은 초 단위 타임스탬프가 아니라 악보 위치다. 음원과 악보의 재생 동기화 정보는 이와 별개다.
- 영어는 영어로 유지한다. 이 문서는 기존 가사 싱크나 메타데이터 필드 이름을 새로 변경하지 않는다.

#### 현재 가사 제작 기준

2026-10-03 사용자 확정: 악보가 표준이다. 가사 위치·음가는 원본 악보를 기준으로 저장하며, 가수의 실제 가창 차이를 반영하지 않는다. 실제 가창 시각·길이의 측정·기록은 요구하지 않는다. `time/end/grid`는 악보 위치와 음원 연결에서 계산한 재생 캐시이며 실제 발음의 전사 값이 아니다. 별도 `DrumPracticeLyrics`는 기존 저장 구조로 유지한다. 아래 과거 이전·검증 기록은 당시 사실이며 현재의 추가 가창 검증 과제가 아니다. 자세한 기준은 [변환 정책](../reference/score/production.md#musicxml-conversion-policy--가사-기준--악보-우선)을 따른다.

- 가사 위치: `measureId + quarterOffset + durationQuarters`. 단위는 사분음표 길이이며 박자표 분모에 따라 화면의 ‘박’으로 변환한다. 기본 편집은 ¼박이고, 보컬 악보의 세부 음가는 그대로 보존한다. XML은 divisions/duration, 독립된 unpitched 음표와 lyric으로 기록한다. 음높이는 추정하지 않는다. 동시 음절은 서로 다른 voice로, 마디를 넘는 길이는 extend로 보존한다.

- 초 단위 자유 가사 편집과 끝 시각 입력을 제거했다. `time/end/grid`는 재생·기존 표시 코드의 캐시다. 이력의 이전 초 단위 데이터는 복구 근거로만 남긴다. 초기 이전 때 기존 시작 격자를 유지하고 끝 길이는 음악적 단위로 변환한다.

#### 보컬 악보 입력

가사 편집 → 보컬 MusicXML 가져오기 → 파트 선택. 마디 수와 각 박자표를 검사하고, 전주/반복 순서는 사용자에게 맞추도록 안내한다. 가사가 있는 음표의 리듬을 읽어 독립 가사 파트에 기록하며 원래의 보컬 파트도 `DrumPracticeVocalSource`로 보존한다. 가사 교체 전 확인하고 이전 가사는 이력에 보관한다. PDF 보컬 악보의 자동 채보, 음절별 노래 청취 검증은 이번 입력 기능과 구분한다.

### 이관 원문 — MEASURE-LYRICS.md / 1

출처: [docs/architecture/MEASURE-LYRICS.md](../reference/score/musicxml.md#measure-lyrics--마디-단위-인쇄-가사-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

#### 마디 단위 인쇄 가사 계약

### 이관 원문 — MEASURE-LYRICS.md / 2

출처: [docs/architecture/MEASURE-LYRICS.md](../reference/score/musicxml.md#measure-lyrics--마디-단위-인쇄-가사-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 목적과 범위
인쇄 악보에서 마디 귀속만 확인되는 가사를 가창 시작·길이 추정 없이 보존하고 공통 재생 화면 중앙에 표시한다. 기존 음절 가사는 `Song.lyrics`와 `scorePosition`을 유지한다.

### 이관 원문 — MEASURE-LYRICS.md / 3

출처: [docs/architecture/MEASURE-LYRICS.md](../reference/score/musicxml.md#measure-lyrics--마디-단위-인쇄-가사-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 데이터
`Song.measureLyrics?: { id: string; measureId: string; text: string; placement: "measure-center" }[]`

- 마디 ID는 실제 measures 항목이어야 하며 항목 ID와 마디 귀속은 각각 중복되지 않는다. 한 마디의 문구는 하나의 text로 합친다.
- time/end/quarterOffset/durationQuarters를 갖지 않는다. 음절 강조·가창 길이를 주장하지 않는다.
- canonical MusicXML의 기존 miscellaneous manifest에 선택 필드로 저장한다. 가짜 음표를 생성하지 않는다. 원본 성부는 유지한다. 예전 파일은 필드 없이 호환된다.
- `.drumscore` Song 데이터와 XML 왕복에서 보존한다. 공통 renderMeasure가 PDF/SVG, 한 줄/두 줄에 동일하게 표시한다. 음절 충돌 배치 대상이 아니다.
- 전체 가사 문서가 있으면 그 문서를 표시한다. 없으면 마디 가사를 마디 순서로 표시한다. 박 단위 가사 편집 표는 기존 리듬 가사만 편집하며, 이 마디 문구용 편집 UI는 이번 변경에 포함하지 않는다.

### 이관 원문 — MEASURE-LYRICS.md / 4

출처: [docs/architecture/MEASURE-LYRICS.md](../reference/score/musicxml.md#measure-lyrics--마디-단위-인쇄-가사-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 검증 2026-10-03
- 집중 4파일30검사, 전체71파일338검사 통과. build:apps 및 TypeScript 통과.
- Safari 로컬 앱에서 공통 renderMeasure를 호출한 합성 fixture: 중앙 정렬, 4마디 중 지정 마디에만 표시, XML 복원 동일, timed lyric note 0개 확인. 캡처 docs/experiments/measure-lyrics-safari.png. 저장 곡 변경 없음. 실제 Loveholic 새 패키지 QA와 구분한다.
- 이전 Safari context가 없어 평가 실패. list_tabs=[] 확인 후 새 로컬 탭 생성으로 검증 재개. 원래 context 복구라고 표현하지 않는다.
- 새 곡 포함 HTML 생성·저장 없음. 공개 배포·버전 변경·커밋은 새 악보 검수와 별도이며 아직 수행하지 않았다.

### 이관 원문 — MEASURE-LYRICS.md / 5

출처: [docs/architecture/MEASURE-LYRICS.md](../reference/score/musicxml.md#measure-lyrics--마디-단위-인쇄-가사-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 실제 Loveholic 수록 및 배포
- 원본 대조된 77개 마디 가사 패키지 SHA256 26b97bd8b5a1611c4667d42a3fa9205cc6190a8c469000aec9944f45d689fcc1를 직접 ZIP CRC/항목 수 검사한 뒤 public/scores/loveholic.drumscore에 반영했다.
- 로컬 앱의 실제 악보 업데이트 버튼으로 저장 후 재열기 확인. Safari 응답형1133×744(실제 innerWidth1132)에서 PDF/SVG × 한줄/두줄 캡처 검수. 77항목 중앙 정렬, 4마디/행, 페이지 가로 넘침 없음. 캡처 printed-lyrics-package-20261003/player-*.png.
- release 빌드와71파일338검사 통과. player0.4.6/editor0.4.4. Sites 버전13 배포 succeeded, source c5d4260b90ddaea641e5e19aea5c8f9c64c484cc, deployment appgdep_6abfe9dde62081918ecea2119f4a80a4. 2026-10-03 02:29KST. 악보제작기은 공개 배포 제외.
- 새 시간 자료 조사에서는 원문 대조 출처만 확보됐다. 외부 문구로 사용자 악보를 덮어쓰지 않았다. 음원 청취에 의한 음절별 싱크 검증으로 주장하지 않는다.
- 재생 검수: 스크립트 click 후 AudioContext resume이 진행되지 않아 재열기로 초기화하고 실제 Safari 버튼 입력을 사용했다. 재생→일시정지 전환,10→17마디 진행 및 정지 확인. 합성 클릭 실패를 앱 재생 실패로 단정하지 않는다.

### 이관 원문 — APPLE-LOCAL-WORKFLOW.md / 1

출처: [docs/operations/APPLE-LOCAL-WORKFLOW.md](../how-to/use-apple-local-tools.md#apple-local-workflow--apple-로컬-검토-실행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

#### Apple 로컬 전처리 → 검토 워크플로우

### 이관 원문 — APPLE-LOCAL-WORKFLOW.md / 2

출처: [docs/operations/APPLE-LOCAL-WORKFLOW.md](../how-to/use-apple-local-tools.md#apple-local-workflow--apple-로컬-검토-실행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 역할과 완료 조건

Mac에서 Apple SpeechTranscriber가 음원과 시간 정보를 읽는다. Python이 사용자 가사와 대조하고, AFM 3가 짧은 문맥 기반 발음 비교 의견을 붙인다. Codex/사람은 원문·음원 범위와 각 의견을 검토한다. 최종 음절 정렬은 별도 작업이다.

성공 조건은 모든 지정 구간의 STT 결과, 검사된 시간 범위, AFM 결과/실패 기록, 원본을 보존한 검토 목록 생성이다. 후보 개수를 인식 오류 수로 해석하지 않는다. 이번 구현은 Mac 자료 준비용 CLI이며 웹앱/iPad HTML에서 AFM을 호출하지 않는다.

### 이관 원문 — APPLE-LOCAL-WORKFLOW.md / 3

출처: [docs/operations/APPLE-LOCAL-WORKFLOW.md](../how-to/use-apple-local-tools.md#apple-local-workflow--apple-로컬-검토-실행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 실행

프로젝트 루트 `/Users/raphael/Playground/drum-practice`에서 실행한다. 현재 Mac/Xcode의 Speech 및 FoundationModels SDK, 설치된 일본어 STT 자산과 사용 가능한 로컬 모델, ffmpeg, Python 3가 필요하다. 도구는 모델을 자동 다운로드하지 않는다.

```sh
npm run review:local -- \
  --audio public/demo/audio.mp3 \
  --manifest data/reference/apple-stt-manifest.json \
  --song public/demo/song.json \
  --out docs/experiments/apple-workflow-03
```

출력 경로는 존재하지 않는 새 디렉터리여야 한다. 기존 실행·소스·song.json을 덮어쓰지 않는다. 원본 가사 및 음원은 Git 제외 경로에 유지한다. 새 곡은 아래 형식의 manifest를 제공한다. `song`은 마디 번호 연결을 위한 선택 입력이다.

```json
{"locale":"ja_JP","segments":[
  {"id":"verse1","start":10,"end":25,"reference":"사용자가 제공한 해당 구간의 일본어 가사"}
]}
```

구간 경계·가사 자체의 정확성도 검토 대상이다. 인접 구간이 겹치면 같은 발음이 중복 인식될 수 있다. 누락된 원문 부분에는 시각을 만들어 넣지 않는다.

### 이관 원문 — APPLE-LOCAL-WORKFLOW.md / 4

출처: [docs/operations/APPLE-LOCAL-WORKFLOW.md](../how-to/use-apple-local-tools.md#apple-local-workflow--apple-로컬-검토-실행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 산출물과 검사

- `*-stt.json`: 원래 STT 텍스트·시각·인식 신뢰도.
- `report.json`: 전체 run 시각, 동일 텍스트 구간, 차이 후보, 주변 문맥, 마디 번호, AFM 의견, 원본/스크립트 해시, 실행 시간.
- `afm-input.json`, `afm-output.jsonl`: 짧은 비교 요청과 모델 이름·응답.
- `review.md`: 검토자가 읽을 목록. 별도 검토 결과는 `review-decisions.json` 등으로 기록한다.

시간의 유한성·순서·길이를 검사한다. AFM의 ID·분류 enum·누락·중복을 검사한다. AFM 실패 시 STT와 후보는 보존하고 실패를 명시한다. `sameReading`도 후보를 제거하지 않는다. AFM이 시각을 생성하는 계약은 없다. 한 STT run이 여러 발음을 포함해도 균등 분배하지 않는다. `confirmed`는 변경하지 않는다.

```sh
npm run test:local
```

### 이관 원문 — LYRIC-SYNC-FEEDBACK.md / 1

출처: [docs/score-production/LYRIC-SYNC-FEEDBACK.md](../records/songs/real-paradis.md#lyric-sync-feedback--가사-싱크-청취-피드백-누적). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

#### 가사 싱크 청취 피드백 누적

현재 전달 기준: 구절만 전달해도 그 구절의 첫 음절 시작 위치로 해석한다. “시작 지점” 문구는 생략 가능하다. 별도 설명이 없으면 [교정 목록](../records/songs/real-paradis.md#lyric-sync-suspects--가사-싱크-교정-목록--¼박-격자-기준)의 현재 목록의 “확인할 첫 가사” 시작이다. 굵은 글씨는 대상 선택 기준이 아니다. 통합한 기존번호도 같은 행으로 접수한다.

사용자가 “모은 것 반영해줘”라고 요청할 때 일괄 적용한다. 위치 전달만으로 앱·가사 데이터를 수정하지 않는다. 사용자가 고유번호와 함께 보내는 위치는 해당 행의 “확인할 첫 가사”가 시작하는 순간이다. 음절을 명시하면 그 지정을 우선한다. 별도 지정이 없으면 이 규칙을 적용하며 음절을 다시 묻지 않는다. 001은 이미 반영했다. 이후 전체 가사 교체·재싱크 요청에 따라 002·003도 v2에 반영했다. 앞으로 들어오는 개별 위치는 계속 누적한다.

##### 순차 청취 확인 규칙 (최신 사용자 지시)

사용자는 곡을 순서대로 들으며 틀린 부분만 전달한다. 새로 체크한 지점보다 앞에 있는 가사 중 별도 교정 요청이 없는 것은 현재 위치가 맞는 것으로 기록한다. 앞서 전달한 개별 교정값은 그대로 유지하며, 포괄 확인으로 취소하거나 덮어쓰지 않는다. 체크한 지점 자체는 전달된 좌표로 교정하고, 그 뒤 구간은 아직 확인된 것으로 취급하지 않는다. 앱의 위치 및 confirmed 반영은 계속 일괄 적용 요청 때 수행한다.

현재 확인 경계는 48마디 갓(v2-l246, m48/tick10)이다. 앞 구간은 누적 개별 교정을 적용한 위치로 확인했다. 이 규칙은 앞선 개별 기록의 ‘앞 구간 추가 확인을 의미하지 않는다’는 해석을 대체한다.


### Rule 재점검 원문 — MUSICXML-CANONICAL.md / 1

출처: [docs/architecture/MUSICXML-CANONICAL.md](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> - `RecordData.canonicalXML`이 정본이다. 악보 원문을 유지하며 `DrumPracticeLyrics` 파트만 앱이 다시 쓴다. 제목·제작자 변경도 여기에 쓴다. `Song`의 메타정보·가사·재생 시각은 화면/오디오용 파생 모델이고, 열 때 XML에서 다시 복원한다.
> - 가사 위치: `measureId + quarterOffset + durationQuarters`. 단위는 사분음표 길이이며 박자표 분모에 따라 화면의 ‘박’으로 변환한다. 기본 편집은 ¼박이고, 보컬 악보의 세부 음가는 그대로 보존한다. XML은 divisions/duration, 독립된 unpitched 음표와 lyric으로 기록한다. 음높이는 추정하지 않는다. 동시 음절은 서로 다른 voice로, 마디를 넘는 길이는 extend로 보존한다.
> - 초 단위 자유 가사 편집과 끝 시각 입력을 제거했다. `time/end/grid`는 재생·기존 표시 코드의 캐시다. 이력의 이전 초 단위 데이터는 복구 근거로만 남긴다. 초기 이전 때 기존 시작 격자를 유지하고 끝 길이는 음악적 단위로 변환한다.
> - 원제는 work-title, 표시 제목은 movement-title 및 `drum-practice:display-title`, 제작자는 artist/composer/lyricist로 저장한다. 원래의 다른 메타정보/파트는 유지한다.
> - **앞으로 제작하는 모든 드럼 연습 악보의 가수란(`artist`)에는 선택하여 사용하는 드럼킷 이름을 반드시 기록한다.** 예: `SoCal 드럼킷`, `Portland 드럼킷`. 개별 세 곡만의 예외가 아닌 공통 제작 규칙이다. 드럼킷은 [선택 기준](../reference/score/drum-kits.md#garageband-drum-kits--드럼킷-선택과-보존-라이브러리)에 따라 정하고 SoCal로 고정하지 않는다.
> - 연습 악보의 키트 이름은 MusicXML `identification/creator type="artist"`와 파생 `Song.artist`에 동일하게 저장한다. 패키지를 만들면 내장 정본 XML과 Song의 값도 동일해야 한다. 제작·교정·재제작·저장 후 재읽기에서 누락이나 불일치를 확인한다. 이 메타정보 규칙이 요청하지 않은 음원 제작을 추가하는 것은 아니다.
> - 일반 곡 악보의 `artist`는 실제 가수·아티스트를 유지한다. 세션 연주자·강사·참고 영상 채널은 가수로 입력하지 않는다. 참고 자료의 출처는 제작 문서에 보존한다.
> - `drum-practice:score:v1` miscellaneous-field에 마디의 안정 ID, 라벨·박자표와 음원 시작/끝 연결점, 음원 SHA-256, 음절 ID·확인 상태를 둔다. 현 앱의 인쇄 순서 재생에 맞춰 occurrence=1이다. 반복 기호의 자동 펼치기는 기존과 같이 지원하지 않는다. 임의 중간 박 앵커 UI는 이번 범위가 아니며 기존 마디 시작/끝 연결로 보간한다.
> - XML 음원 해시가 있으면 열 때 실제 음원과 대조한다. 렌더러를 통과해 정본을 다시 만들지 않으므로 앱 전용 확장 필드가 사라지지 않는다.
> - MusicXML에 실제 드럼 악보가 있으면 마디 수/박자표를 바꾸는 편집은 원본 악보에서 수행하도록 막는다. 영역과 음원 연결은 앱에서 수정 가능하다. PDF만 있는 곡에서는 PDF를 유지하며 가사 XML부터 생성한다. 이 XML을 드럼 음표까지 채보된 악보라고 표시하지 않는다.


### Rule 재점검 원문 — PDF-DISPLAY-TRIM.md / 1

출처: [docs/architecture/PDF-DISPLAY-TRIM.md](../reference/score/rendering.md#pdf-display-trim--pdf-연습-화면-표시용-자르기). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> 가사는 [정본 계약](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약)의 악보 위치를 따른다. 과거 가창 타이밍 실험의 미완료를 PDF 가사 제작의 차단 사유로 삼지 않는다.
