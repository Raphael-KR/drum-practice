---
status: accepted
date: 2026-10-23
---

# 공통 제작 코드를 재사용하고 곡별 판단과 인계를 분리한다

## Context and Problem Statement

반복되는 패키지·계측·검수·인계 조립을 곡마다 작성하면서 비용과 실수가 늘었다. 원래 결정 시기는 2026-10-06·10-15·10-23이며, YAML 날짜는 이번 문서 정리일이다.

## Considered Options

* 곡마다 입출력·검증·보고 코드를 복제한다.
* 공통 실행은 재사용하고 설정·독립 기대값·판독 판단은 곡별 자료에 둔다.

## Decision Outcome

후자를 채택한다. 역할은 악보 제작이며 PDF·음원·영상의 실제 판독과 신규 작곡을 구분한다. MusicXML을 제작하고 요청 범위의 음원·패키지를 준비한다. 완성 악보는 기존 개발 담당에게 상시 위임 범위로 인계한다.

### Consequences

코드 동등성·원본 의미·패키지 왕복·실제 화면·청취·접수는 서로 다른 증거다. 새 기능·삭제·전송·배포 승인을 추가하지 않는다.

### Confirmation

현행 계약과 실행 절차는 [제작 Rule](../reference/score/production.md#score-production-rules--악보-제작-범위와-보존-rule), [공통 도구](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독), [재사용 절차](../how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용)에서 확인한다. 아래 당시 검증 수치·실패·미확인은 해당 환경의 기록이며 이번 작업에서 앱·악보 검증을 다시 수행한 결과가 아니다.

## More Information

대안은 원문에서 확인되는 채택·대체 경로를 정리한 것이다. 별도 회의나 새로운 합의를 추정하지 않는다. 이관 원문에 포함된 대체 전 값은 현행 규칙이 아니다.

### 이관 원문 — COMMON-TOOLS.md / 1

출처: [docs/score-production/COMMON-TOOLS.md](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

#### 공통 제작 도구와 곡별 판독

2026-10-23 사용자 승인에 따른 구현 기록. 시작 HEAD: `8caa377`.

- 목표: 반복 제작 처리를 공통 코드로 옮기고 곡별 설정·판독을 분리한다.
- 범위: `tools/score-production/musicxml`, 제작 스킬·문서 및 집중 회귀 검사.
- 완료 조건: 기존 실행 진입점 유지, 공통 코드의 실제 호출, 기존 악보·MIDI·음원/패키지 내용 보존 확인.
- 제외: 앱 기능·저장 DB·수록곡 수정, 커밋·푸시·발행, 새 악보 작곡.
- 검증: 보존된 원본/산출물과 변경 전 소스 기준의 재생성 비교, 공통 API 왕복, 기존 검사 및 스킬 검증.

### 이관 원문 — COMMON-TOOLS.md / 2

출처: [docs/score-production/COMMON-TOOLS.md](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 구현 순서

1. 패키지 조립·결과 저장과 파일 식별.
2. MusicXML 규격/시간 검사, 곡별 기대값과 설정.
3. MIDI 이벤트/파일 및 SoCal·Portland 렌더링.
4. 음원 특징/가사 후보 계산의 공통 부분, 스킬 연결, 회귀 결과 기록.

기존 산출물과 입력은 변경하지 않고 `data/production/common-refactor-20261023/`에 새 검증 결과를 둔다. 기존 결과의 해시 목록과 변경 전 소스는 이 폴더에 보존했다. 원본에서 독립적으로 읽은 기대값을 생성기 출력으로 대체하지 않는다. PDF 기호 판독과 자유로운 엔딩·가사 위치 판단은 곡별 근거와 함께 유지한다.

### 이관 원문 — COMMON-TOOLS.md / 3

출처: [docs/score-production/COMMON-TOOLS.md](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 구현된 경계

| 역할 | 코드/자료 | 입력과 책임 |
|---|---|---|
| 원본 사본·해시·PDF 페이지 준비 | `prepare_inputs.py`, `common/artifacts.py` | 지정한 원본을 새 폴더에 보존. 선택한 DPI로 원본 PDF만 래스터화 |
| 정본 조립·패키지 왕복 | `common/package.mjs` | 기존 앱 API 호출. 전체 Song/XML, 원본 음원·악보, 모든 페이지와 대체 악보 비교 |
| 결과 파일 저장 | `common/evidence.py` | 기존 `/render`, `/package`, `/artifacts` 요청과 로컬 출력명. 앱 서버는 계속 5173이며 별도 포트는 파일 수신기 |
| 제작 계측 | `measure_production.py`, `common/measurement.py` | 실제 시작·단계와 요청별 사용량 메타데이터를 집계. 원시 대화 보존·상시 polling 없음. 단가/로그 범위/마감 시각 명시 |
| 공통 검수 화면 | `common/review.mjs` | 기존 앱 표시 함수와 원본 시스템 구분을 사용하는 일시 화면. 가사 앵커/배치·해제 확인, DB 쓰기 없음 |
| 섹션·지시문 표시 offset | `common/direction-offset.mjs` | 실제 공통 renderer로0부터0.0625박씩 탐색하고 XML cursor를 유지한 표시 offset 저장. 실제 잉크/stroke·오선 간격¼ 여백·같은 줄 한계/높이 분리·모든 더 작은 후보와 개별 직전 격자·재열기를 확인. 원본 words 높이는 곡별 판독으로 XML에 기록하며 Pretendard 글꼴을 저장. 자동 native ID는 비교 문자열에서만 정규화하고 내보낸 SVG는 유지 |
| 인계문 조립 | `handoff_production.py`, `common/handoff.py` | 실제 파일·해시와 후보에 결합된 기존 검증 근거. MusicXML 단독 인계의 첫 박은 기존 정본 metadata의 첫 마디 start에서 읽는다. 전송·수신자 수록/청취는 별도 상태 |
| 규격·음악적 시간 검사 | `common/musicxml.py` | 로컬 XSD, divisions·성부·backup/forward·화음·점·연음·꾸밈음의 유리수 시간. 드럼 파트만 집계 |
| MIDI·샘플 이벤트 | `common/midi.py` | BPM·박자·해상도·세기·채널을 명시. 곡별 작곡/스티킹을 결정하지 않음 |
| 드럼킷 음원 | `common/drum_audio.py` | 보존된 EXS/CAF, 키트별 GM 변환, 이벤트. 기존 비루프·무조율 샘플 범위. GarageBand 효과 체인을 재현하지 않음 |
| 음원 특징 | `common/audio_features.py` | PCM 디코딩·대역별 spectral flux. 원곡 연결의 승인/청취 판단은 하지 않음 |
| 가사 후보 | `common/lyrics.py` | 원본 음표/쉼표 좌표에서 위치 후보 반환. 애매한 후보를 자동 확정하지 않음 |
| MScore 벡터 구조 | `common/musescore_pdf.py` | 교정된 프로필의 선·빔·기호를 추출. 알 수 없는 기호는 실패 처리하며 악기 의미·반복·가사 확정은 곡별 판독 |
| 곡 설정 | `profiles/songs.json` | 경로·템포·첫 박·기대 마디 수·음원 설정·결과 이름·수신 포트 |
| 키트·악기 설정 | `profiles/kits.json`, `profiles/exercise-instruments.json` | 기존 SoCal/Portland 샘플 식별과 승인된 연습곡 악기 매핑. 의미 정본은 매핑 문서 |
| 판독 기대값·근거 | `profiles/red-sunset-review.json`, `profiles/loveholic-lyrics.json`, `fixtures/*.json` | 독립 원본 리듬, 135마디 예외, 가사 내부 위치 추정, 연습곡 구성 |
| 곡별 어댑터 | 기존 `loveholic.py`, `red_sunset.py`, `convert.py`, 연습곡 생성기와 `*_package.mjs` | PDF 기호/좌표 판독, 구간 구성·마커, 주법 해석, 자유 엔딩 대응과 추가 검사 |

`xml_helpers.py`의 단순 노드 생성기도 유지한다. Python 판독 어댑터의 곡별 XML 표기·빔·성부 구성까지 기계적으로 통일하지 않는다. 기존 출력 보존과 원본 의미가 우선이다. 가수/제목 정본은 기존 fixture·곡 메타정보에서 읽으며 별도 값을 중복 생성하지 않는다.

### 이관 원문 — COMMON-TOOLS.md / 4

출처: [docs/score-production/COMMON-TOOLS.md](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 공통 패키지 API

- `prepareCanonical(song, sourceXML, audioHash, editDocument?)`: 기존 정본 writer → 중복 표제 정리 → 선택적 곡 메타정보 부가 → 재읽기/마디 시간 비교. 반환은 `{ canonicalXML, restored }`.
- `bindRenderedScore(song, rendered)`: 현재 앱 renderer의 결과를 기존 마디 ID에 연결. 시작/끝 시각은 유지.
- `createVerifiedPackage(record)`: 기존 앱의 생성/읽기 API를 실행하고 모든 자산과 의미를 비교한 Blob 반환.
- `sha`, `base64`, `saveEvidence`: 바이트 식별·전달 공통 처리. 파일 저장은 현재 로컬 승인 범위에서 별도 호출.

네 곡의 패키지 어댑터가 이 경로를 실제 호출한다. 추가 가사 검수·스티킹 표시·청취 검사는 각 어댑터에 남는다. Loveholic의 초기 `build`와 후속 `refresh`/가사 보정은 각각의 목적을 유지한다. 기존 정본을 가져와 왕복 검사하는 것은 최신 렌더링·청취 검사와 별개다.

후속 실제 변환인 [I.O.I 갑자기](../records/songs/ioi-suddenly.md#ioi-suddenly-conversion--ioi--갑자기-제작실측)에도 적용했다. 이 곡은 `ioi_suddenly_*` 어댑터와 `profiles/ioi-suddenly-*.json`으로 원본/가사/음원 판독을 분리한다. 실제 Vite 브라우저에서 발견한 `projectBase` 끝 `/` 누락을 공통 모듈에서 보정했고, 기존 패키지 4곡의 5검사를 다시 통과했다. Node 경로 해석만으로 브라우저의 변환 URL 계약을 검증한 것으로 간주하지 않는다.

### 이관 원문 — COMMON-TOOLS.md / 5

출처: [docs/score-production/COMMON-TOOLS.md](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 새 곡에서 할 일

반복 계측·검수 화면·인계 준비는 [실행 안내](../how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용)를 따른다. I.O.I 회고에서 확인한 임시 화면/경로 오류와 계측 전담 비용을 줄이기 위한 공통 실행 경로이며 음악적 검증 기준을 낮추지 않는다.

1. 원본·기존 결과를 식별하고, `profiles/songs.json`에 이번 작업에 필요한 설정만 추가한다. 다른 곡의 `firstBeat`나 BPM을 기본값으로 복사하지 않는다.
2. 새로운 PDF 양식이면 대표 구간을 판독하고, 필요할 때 양식별 어댑터를 만든다. 음표 시작/길이·악기·성부를 해독한 데이터와 독립 원본 기대값을 별도로 보존한다.
3. 확인한 가사 위치·음원 연결·교정 사항과 불확실성을 곡별 근거에 적는다. 후보 계산은 공통 코드에, 후보 채택 이유는 판독 자료에 둔다.
4. 공통 규격 검사·정본/패키지 API를 호출한다. 확정된 입력으로 새 폴더에 생성하고 기존 결과와 검증한다.
5. 제작 완료 후 자동 인계 절차를 따른다. 도구 리팩터링만으로 새 악보를 제작/수록한 것으로 간주하지 않는다.

### 이관 원문 — COMMON-TOOLS.md / 6

출처: [docs/score-production/COMMON-TOOLS.md](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 실행 예시

저장소 루트에서 실행한다. `python3`는 `lxml`, `numpy`, `pdfplumber`, `Pillow`가 설치된 인터프리터여야 한다. `ffmpeg`, `ffprobe`, 원본 래스터가 필요한 어댑터에는 `pdftoppm`도 필요하다. 기본 시스템 Python에 패키지가 없으면 확인된 번들 Python이나 프로젝트 환경을 사용한다.

```bash
python3 tools/score-production/musicxml/prepare_inputs.py --pdf data/production/loveholic/source/source.pdf --audio data/production/loveholic/audio/source.mp3 --out .tmp/loveholic-new-input --raster-dpi 144
python3 tools/score-production/musicxml/loveholic.py --pdf .tmp/loveholic-new-input/source.pdf --out .tmp/loveholic-new-input
python3 tools/score-production/musicxml/preplay_warmup.py --out .tmp/preplay-new
python3 tools/score-production/musicxml/render_socal_warmup.py --events .tmp/preplay-new/midi-events.json --xml .tmp/preplay-new/preplay-warmup-source.musicxml --out .tmp/preplay-audio
python3 -m unittest discover -s tools/score-production/musicxml -p 'test_*.py'
node node_modules/vitest/vitest.mjs run tests/local-media/score-production-common.test.ts tests/local-media/canonical-xml.test.ts tests/local-media/score-package.test.ts tests/local-media/musicxml.test.ts
```

명령의 출력 폴더는 매 실행 새 경로로 지정한다. 위 예시는 실제 보존된 곡용이며, 다른 곡을 Loveholic 판독기에 넣는 방법이 아니다. 생성기 내부 기존 오류 주입 검사는 원본의 변경본을 임시 메모리/검증 폴더에서만 사용한다. 공개 앱·DB에 시험 자료를 저장하지 않는다.

### 이관 원문 — COMMON-TOOLS.md / 9

출처: [docs/score-production/COMMON-TOOLS.md](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 남겨 둔 곡별 판단

현재 공통 코드는 입력 양식을 자동으로 판독하는 범용 OMR이 아니다. PDF 기호 해석·원본별 성부/빔 구성, 추정 가사 채택, 자유 엔딩 연결, 연습곡 구성과 스티킹은 각각 어댑터·fixture·판독 근거가 맡는다. 해당 판단을 변경할 때에는 새 원본 대조가 필요하며 이번 코드 동등성 검사를 그 근거로 대신하지 않는다.

### 이관 원문 — REUSABLE-PRODUCTION-WORKFLOW.md / 1

출처: [docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md](../how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

#### 제작 계측·검수·인계 재사용

2026-10-23 사용자 승인에 따른 구현. 시작 HEAD `911d7cd`.

- 목표: 악보의 검증 수준을 유지하면서 계측·검수 화면·인계문을 곡마다 새로 작성하는 작업을 줄인다.
- 범위: `tools/score-production/musicxml` 공통 도구, 제작 스킬과 절차 문서. 기존 I.O.I 결과와 다른 곡의 보존 자료로 검증한다.
- 완료 조건: 과거 실측의 동일 집계, 공통 검수 화면의 실제 표시/해제, 파일·검증 근거에서 인계문 생성, 기존 악보/패키지 바이트 보존.
- 제외: 새 악보 생성, 앱 소스·보관함·수록곡 변경, 원본/기존 산출물 덮어쓰기, 자동 전송·커밋·push·발행.
- 검증: 실제 로그·기존 완성 패키지 기반 집중 검사, Safari 화면 확인, 규격/패키지 기존 집중 검사·문서/스킬 검사. 규격·원본 의미·표시·청취는 별도 상태로 유지한다.

### 이관 원문 — REUSABLE-PRODUCTION-WORKFLOW.md / 2

출처: [docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md](../how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 도구 경계

- `measure_production.py`: 실제 작업 시작 기록 → 필요한 단계의 명시적 기록 → 종료 시 토큰/비용 참고 환산 집계. 정형 집계에 별도 AI 작업자를 만들거나 계속 polling하지 않는다.
- `common/review.mjs`: 실제 앱의 표시 함수를 쓰는 일시 검수 화면. 원본 줄 구성·선택 마디·가사 앵커를 확인하고, 종료 시 DOM·임시 URL을 정리한다. DB·악보 데이터는 수정하지 않는다.
- `handoff_production.py`: 곡별 인계 설정과 실제 파일/검증 보고서에서 절대경로·SHA·상태·한계를 포함하는 본문을 생성한다. 자동 전송하지 않으며 기존 승인된 전달 도구로 보낸 뒤 접수 상태를 별도 기록한다.

곡별 판단은 반복 순서, 독립 원본 기대값, 특수 주법, 가사 예외, 음원 연결 근거와 다음 조치에 남는다. 해시/개수·XSD·패키지 왕복을 원본 의미 대조나 실제 청취로 대체하지 않는다. 변경이 없는 단계의 검사를 반복하지 않고, 교정한 입력에 의존하는 결과와 검사는 갱신한다.

### 이관 원문 — REUSABLE-PRODUCTION-WORKFLOW.md / 3

출처: [docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md](../how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 1. 계측

```bash
python3 tools/score-production/musicxml/measure_production.py start --help
python3 tools/score-production/musicxml/measure_production.py mark --help
python3 tools/score-production/musicxml/measure_production.py finish --help
```

`start`에는 새 `--out`, 곡명 `--label`, 실제 현재 세션의 `--root-log`와 `--root-turn-id`를 전달한다. 시작 시각은 로그의 해당 작업 시작에서 읽는다. 로그가 오래된 날짜 디렉터리에 있어도 경로를 그대로 사용한다. 다른 곡의 세션 ID·시각을 복사하지 않는다.

`mark --out ... --stage ... --status ... --evidence ...`로 실제 완료/실패/미확정 단계와 근거를 남긴다. 원본 식별, 대표 구간 판독, 최종 XML, 패키지 왕복, 화면 검수, 인계 접수 등 의미 있는 단계만 기록한다. 병행 단계의 소요 시간을 더해 전체 경과 시간으로 쓰지 않는다.

`finish --out ...`는 한 번 집계하고 `report.json`, `report.md`, `usage-records.json`을 쓴다. 재현 비교에는 `--cutoff`으로 관측 종료 시각을 고정한다. 단가는 확인 날짜와 근거가 있는 `--pricing` 파일로 별도 전달한다. 단가 미제공/미지원 모델을 실제 비용 0으로 보고하지 않는다. 실제 청구액, 공개 단가 참고 환산, 미가격 토큰을 구분한다.

root turn ID는 기존 다른 담당 채팅으로 전달한 후속 작업에도 전파될 수 있다. 제작 담당·하위 검토 범위와 인계 후 수신자 범위를 구분하고 탐색한 로그 경로/범위를 보고한다. 시작 날짜 폴더만 탐색한 결과를 모든 관련 세션의 전수 집계로 표현하지 않는다. 원시 대화·비공개 추론을 출력/보존하지 않으며 사용량 메타데이터만 남긴다. 최종 보고문 등 집계 이후 사용량은 제외될 수 있음을 명시한다.

### 이관 원문 — REUSABLE-PRODUCTION-WORKFLOW.md / 4

출처: [docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md](../how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 2. 공통 검수 화면

코드/프로필 수정과 서식 정리를 마친 뒤 현재 로컬 5173 제작기에서 실제 패키지를 읽는다. 새 앱·독립 HTML을 만들지 않는다. 다음은 보존된 I.O.I 패키지의 적용 예다.

```javascript
const { readScorePackage } = await import('/src/modules/library/score-package.ts');
const { mountScoreReview } = await import('/tools/score-production/musicxml/common/review.mjs');
const response = await fetch('/data/production/ioi-suddenly-20261023/package-v1/ioi-suddenly.drumscore');
if (!response.ok) throw new Error(`Package read failed: status=${response.status}`);
const record = await readScorePackage(await response.blob());
window.scoreReview = await mountScoreReview(record, {
  alternateIndex: 0,
  measureGroups: [[21, 22, 23, 24], [29, 30, 31, 32], [71, 72, 73, 74]],
  requirePDFAnchors: true,
});
window.scoreReview.report();
// 표시 대조·화면 기록 후:
window.scoreReview.dispose();
```

숫자는 현재 `record.song.measures`의 1부터 시작하는 위치이며 원본 인쇄 번호와 다를 수 있다. 고유 마디 ID도 사용할 수 있다. `measureGroups`를 생략하면 원본 영역의 page/y/h/x 시스템 경계를 따른다. 반복을 펼친 악보의 부분 시스템도 현재 연주 순서대로 보존한다. 원본 가사 행을 PDF 이미지로 확인하고, 파란 가사의 음표 대응·겹침을 대조한다. SVG 페이지도 같은 패키지 자산으로 확인한다. 기본 행 너비는 현재 창 너비에서 여백 40px을 뺀 값이며 200~1200px 범위다. 특정 폭 비교가 필요할 때만 `rowWidth`를 명시한다.

`report()`의 배치/앵커 결과는 자동 기하 검증이다. 실제 음표 의미·눈으로 본 화면·청취 완료를 뜻하지 않는다. JSDOM처럼 실제 배치값이 없는 환경은 `unmeasured`로 남긴다. 캡처가 필요하면 현재 프로젝트의 Safari MCP 승인을 따르고, 검수 종료 시 `dispose()` 또는 화면 닫기로 임시 DOM/URL을 해제한다. 생성 도중 모듈을 수정해 Vite 재로드가 발생했다면 현재 결과를 재확인한 후 검수를 재개한다.

### 이관 원문 — REUSABLE-PRODUCTION-WORKFLOW.md / 5

출처: [docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md](../how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 3. 인계문

인계 초안을 만들기 전에 제작 JSON·스크립트의 수정을 마치고 [기존 검사 계약](../how-to/verify.md#testing--개발-검사와-로컬-자산-준비)에 따라 `npm run format:check`와 변경 범위의 코드 검사를 완료한다. 전체 공통 검사에는 `npm run check`를 사용한다. 프로젝트 서식 검사는 Python·Markdown을 포함하지 않으므로 해당 파일까지 검사됐다고 보고하지 않는다.

서식 수정 시 JSON은 수정 전후 파싱한 데이터 값을 비교하고, 스크립트는 diff에서 서식 외 변경이 없는지와 관련 집중 검사 결과를 확인한다. 보존된 제작 결과의 해시도 대조한다. 의미가 달라졌으면 영향받은 생성·음악 검증을 다시 수행한다. 이미 같은 입력/코드로 통과한 검사나 음악 검증을 인계문 작성만을 위해 반복하지 않는다.

그다음 아래 `build`를 실행한다. `evidence`의 이름·범위와 곡별 제작 문서에 실행 명령, 검사 결과, 근거 경로를 연결하고, `limitations`·`nextActions`에는 남은 항목과 다음 확인을 넣는다. 코드 검사, 원본 대조, 패키지 왕복, 화면 확인, 실제 청취, 앱 수록 검증은 각각 기록한다. 일부 미완료를 숨기거나 다른 검사 통과로 대신하지 않는다.

```bash
python3 tools/score-production/musicxml/handoff_production.py build --manifest tools/score-production/musicxml/profiles/ioi-suddenly-handoff.json --out .tmp/ioi-handoff-new
python3 tools/score-production/musicxml/handoff_production.py receipt --help
```

새 곡은 곡별 JSON에 다음만 지정한다. `profiles/ioi-suddenly-handoff.json`은 실제 기존 자료를 사용하는 예시이며 다른 곡의 정답이 아니다.

- `recipient`: 확인한 기존 담당 이름·thread ID·host. 이 값이 전송 권한이나 새 담당자 배정을 만들지 않는다.
- `productionDocument`: 현재 제작 기록 경로.
- `artifacts`: `musicxml` 필수. 요청한 경우에만 `package`, `sourceAudio`, `sourcePdf` 또는 추가 파일을 지정한다. 실제 파일에서 크기·SHA를 계산한다.
- `evidence`: 검사 이름·범위·보고서 경로. `expect`는 JSON pointer와 기대 상태, `bind`는 보고서의 해시 pointer와 전달 artifact 이름이다. 곡별 검사 내용을 공통 코드에 복제하지 않는다.
- `observations`, `limitations`, `nextActions`: 곡별 판독·변경점·미확정·남은 일. 청취가 없으면 그대로 적는다.

`passed`는 기존 보고서의 기대 결과와 전달 파일 SHA가 일치한다는 뜻이다. `recorded`는 근거 파일/과거 결과만 확인했고 현재 후보와 결합하지 못한 상태, `unverified`는 근거 미확보/필드 미확인, `failed`는 실제 불일치다. 초안 생성이 원본 대조·전체 패키지 API 왕복·실제 앱 검사를 새로 실행하지 않는다. XML 단독 제작에도 쓸 수 있으며 요청하지 않은 패키지/음원을 요구하지 않는다.

생성한 `handoff.md`를 검토하고 기존 상시 위임 범위의 실제 전달 도구로 보낸다. 코드 공통화만 한 경우 새 악보를 만든 것처럼 같은 결과를 재전송하지 않는다. `receipt`에는 **실제 관측한** 수신자·시각·접수 근거를 전달한다. `delivery.json`은 최종 본문 해시와 접수를 연결하며 자동 전송·수록·청취 성공을 만들지 않는다.

### 이관 원문 — SCORE-PRODUCTION-PROCESS.md / 1

출처: [docs/score-production/SCORE-PRODUCTION-PROCESS.md](../how-to/produce-score.md#score-production-process--악보-제작-프로세스). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

#### 악보 제작 프로세스

2026-10-04 정리, 2026-10-06 입력 범위 확장. 대상: 사용자 제공 드럼 악보 PDF·음원 또는 유튜브 참고 자료에서 MusicXML·재생용 완성 파일을 만들고 실제 앱까지 검수하는 작업.

- 목표: 다음 곡을 접수부터 검수·인계까지 재현 가능한 순서로 제작한다.
- 범위: 원본 보존, 변환·교정, 가사, 음원 연결, 공통 조판·패키지, 로컬 앱 수록과 근거 기록.
- 완료 조건: 아래 단계별 검사와 실제 앱 저장·재열기를 확인하고, 원본 보존·추정·미검증·앱 문제를 구분해 인계한다.
- 제외: 인쇄용 PDF 생성, 독립 HTML 재생 파일 생성·저장, 자동 커밋·push·공개 배포. 사용자의 최신 결정(2026-10-06)은 악보 출력은 MusicXML만 만드는 것이다. 입력 PDF의 보존·대조·앱 내 표시는 유지한다. 외부 발행은 별도 요청과 검증으로 수행한다.
- 검증: 구조·규격·왕복·원본 대조, 실제 표시와 재생·청취를 각각 확인한다. 수치 검사만으로 청취 완료를 선언하지 않는다.

이 문서는 **전체 작업 순서의 단일 진입점**이다. 변환 방법·매핑·저장·표시 규칙 자체는 아래 정본에서 관리한다. 규칙 변경 시 해당 정본을 먼저 수정하며, 이 문서에 다른 규칙을 만들지 않는다. 현재 사용자 결정과 승인 정본을 과거 제작 코드·검수 기록보다 우선한다.

프로젝트 등록 스킬: [악보 제작 — produce-drum-score](../../.agents/skills/produce-drum-score/SKILL.md). PDF·음원·유튜브 요청에서 이 정본으로 연결하며, 별도의 매핑·저장 규칙을 만들지 않는다.

### 이관 원문 — SCORE-PRODUCTION-PROCESS.md / 2

출처: [docs/score-production/SCORE-PRODUCTION-PROCESS.md](../how-to/produce-score.md#score-production-process--악보-제작-프로세스). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 시작 전에 읽을 문서

| 목적 | 정본과 진입점 |
|---|---|
| 작업 위치·보존·권한 | [전역 지침](/Users/raphael/AGENTS.md), [프로젝트 지침](../../AGENTS.md) |
| PDF 유형별 변환, 문제 해결, 첫 박·카운트오프, 악보 우선 가사 | [변환 정책](../reference/score/production.md#musicxml-conversion-policy--pdf--musicxml-변환-정책) |
| 악기·주법·쉼표·스티킹·가사 입력 | [MusicXML·OSMD 매핑](../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙) |
| 전체 SVG·연습 화면·자르기·캐시 | [SVG 출력 규칙](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙), [브라우저 공통 조판](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약) |
| XML 정본·가사 음악적 위치·음원 연결 | [MusicXML 저장 계약](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약) |
| 새 드럼 음원 제작 시 라이브러리 선택 | [GarageBand 드럼킷 소개·선택 기준](../reference/score/drum-kits.md#garageband-drum-kits--드럼킷-선택과-보존-라이브러리) |
| 완성 파일·업데이트·구조 충돌 | [패키지 계약](../reference/score/file-formats.md#score-package--완성-악보-파일-계약--drumscore-v1), [제작/재생 앱 범위](../../PRD.md#앱과-입력) |
| 공통 코드·곡별 설정·판독 어댑터 | [공통 제작 도구](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독) |
| 실패의 재현과 해결 | [문제 해결 기록](../records/archive/musicxml-evaluation.md#musicxml-troubleshooting--악보-변환-문제-해결-기록), [history](../../history.md) |

읽은 정본의 날짜·Git HEAD·이번 곡에 적용할 사용자 결정을 곡별 제작 문서에 남긴다. 문서 간 모순은 변환 정책의 확인 순서를 따른다. 이미 확정된 악기나 가사 정책을 사용자에게 다시 묻지 않는다.

### 이관 원문 — SCORE-PRODUCTION-PROCESS.md / 3

출처: [docs/score-production/SCORE-PRODUCTION-PROCESS.md](../how-to/produce-score.md#score-production-process--악보-제작-프로세스). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 유튜브 참고 자료로 제작할 때

사용자 결정(2026-10-06): 이 작업은 **악보제작자** 역할이며 PDF 외에 유튜브도 제작 입력으로 다룬다. 영상의 실제 연주를 채보하는 작업과, 교육 개념을 참고해 앱용 새 연습곡·음원을 만드는 작업을 구별하고 이번 요청의 방식을 곡별 문서에 기록한다. 영상 제목만으로 본문이나 패턴을 확인했다고 쓰지 않는다.

1. 영상 URL·채널·제목·확인 시점과 실제 확인 방법을 남긴다. 웹 본문 조회가 막혀도 사용자가 승인한 Safari MCP 경로로 본문·설명·스크립트·대표 재생 프레임을 확인할 수 있다. 자동 생성 스크립트는 오인식을 감안하며 정확한 타격 채보의 근거를 대신하지 않는다. 확인하지 못한 음향·구간은 구분한다.
2. 새 연습곡이라면 개념의 근거 구간과 독립적인 마디별 구성·손·시작·음가를 먼저 명시한다. 참고 영상의 악보·연주 녹음과 신규 결과를 구별하며, 영상 음원 추출·재사용은 실제 요청 범위를 확인한다. 새 음원을 만들면 이벤트와 같은 시간표를 사용하고 합성 방법·입력/샘플 출처·재생성 해시를 남긴다. 탐탐 무빙 사례는 원본 영상 악보·연주 녹음·외부 드럼 샘플을 결과에 포함하지 않고 만들었다. 이 사례의 합성 방식을 모든 새 곡의 필수 방식으로 고정하지 않는다.
3. 아래 접수·보존, 매핑·XSD·독립 기대값, 첫 박·카운트오프, SVG·패키지·앱 검수·인계를 적용한다. PDF 유형 판별과 PDF 가사 대조는 해당 입력이 있을 때만 수행한다. 앱 수록을 다른 개발 작업이 소유하면 생성·왕복·공통 렌더 근거와 실제 수록/청취 대기를 구분해 인계한다.
4. 막힘과 해결을 곡별 문서/문제 해결 기록 및 history.md에 남긴다. 첫 적용 근거: [탐탐 무빙 제작](../records/songs/tom-moving.md#tom-moving-production--탐탐-무빙-연습-제작). 웹 조회 실패 자체를 모든 확인 경로의 실패로 보고하지 않는다.

실제 연주 채보는 대표 구간의 악보 화면·타격 장면·음향을 판독해 영상 시각과 마디/박을 연결한 이벤트 표·독립 fixture를 먼저 만든다. 가려진 손·불분명한 타격은 후보로 기록하고 추가 근거로 교정한다. 자동 스크립트나 제목만으로 음가·악기·손을 확정하지 않는다. 탐색 직후 이전 프레임이 남을 수 있어 실제 재생 시각과 화면 변경을 확인한다. 탐탐 무빙 사례의 기존 검사는 신규 구성의 내부 일치 검사였으며, 2026-10-06 사용자 지적 후 스네어 누락·임의 이동 경로 변경을 확인했다. [원본 재검토](../records/songs/tom-moving.md#tom-moving-production--2026-10-06-원본-재검토와-확인된-차이)를 따른다. 2026-10-06 교정에서는 S→M→H→F로 판독해Portland 음원·28마디 패키지를 제작했으나,2026-10-13 사용자 직접 정정으로 현재 순서는 **S→H→M→F(스네어→탐1→탐2→플로어탐)**다. 현재 fixture·MusicXML·MIDI·Portland 음원을 이 순서로 다시 만들었다. 이번 정정을 영상 재검증으로 표현하지 않는다. 기본 패턴 재현과 연습용 템포/반복 정리는 전체 영상 전곡 채보와 구분한다. 영상 기반 요청을 임의 작곡 모드로 대체하지 않으며, 해시·음표 개수·규격 통과를 원본 대조 통과로 보고하지 않는다.

### 이관 원문 — SCORE-PRODUCTION-PROCESS.md / 4

출처: [docs/score-production/SCORE-PRODUCTION-PROCESS.md](../how-to/produce-score.md#score-production-process--악보-제작-프로세스). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 단계별 작업

순서는 `접수·보존 → 유형 평가 → 구조 변환 → 가사 → 음원 연결 → 조판·패키지 → 실제 앱 검수 → 인계`다. 실패한 단계로 돌아가 수정·재검증하며, 후속 산출물도 수정된 입력으로 갱신한다. 원인 없이 같은 시도를 반복하지 않는다.

계측이 요청되면 [재사용 실행 안내](../how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용)의 시작/단계/종료 CLI를 사용한다. 공통 검수 화면과 인계문 생성기도 같은 문서에 있다. 반복 보고·화면 구현을 줄이되 아래 원본 대조·규격·왕복·실제 표시·청취 조건은 유지한다. 바뀐 입력에 의존하는 결과만 재생성/재검증하고, 변경 없는 검사를 반복 실행하지 않는다.

### 이관 원문 — SCORE-PRODUCTION-PROCESS.md / 5

출처: [docs/score-production/SCORE-PRODUCTION-PROCESS.md](../how-to/produce-score.md#score-production-process--악보-제작-프로세스). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 1. 자료 접수와 원본 보존

**입력:** 사용자가 지정한 PDF·음원, 곡명·제작자 정보, 기존 XML·패키지·교정본과 이번 작업 범위.

**곡 정보:** 드럼 연습 악보는 **가수 칸에 선택하여 사용하는 드럼킷 이름을 반드시 넣는다**(예: SoCal 드럼킷, Portland 드럼킷). 이는 앞으로 만드는 모든 드럼 연습 악보의 공통 규칙이며 개별 곡에 한정하지 않는다. 일반 곡은 실제 가수·작사·작곡 정보를 유지하고, 세션 연주자·강사·영상 채널은 가수로 입력하지 않는다. [메타정보 저장 기준](../reference/score/musicxml.md#musicxml-canonical--저장-계약)을 따른다.

MusicXML `creator type="artist"`와 `Song.artist`, 패키지의 내장 정본/메타정보가 같은 드럼킷 이름인지 저장 후 재읽기로 확인한다. 드럼킷 선택은 [키트 선택 기준](../reference/score/drum-kits.md#garageband-drum-kits--드럼킷-선택과-보존-라이브러리)을 따른다. 이 규칙만으로 음원 제작이나 기존 자료의 일괄 교체를 추가하지 않는다.

**수행 방법·도구:** 실제 루트 `/Users/raphael/Playground/drum-practice`에서 `pwd`, `git status --short --branch`, `git rev-parse HEAD`를 확인한다. 자료의 SHA256, 파일 크기, PDF 쪽 수, 음원 길이·채널·샘플레이트를 `shasum -a 256`, `pdfinfo`, `ffprobe`와 기존 분석 도구로 기록한다. 원본은 읽기만 하며 프로젝트 안의 Git 제외 실험 폴더에 사본을 둔다. 새 시도는 새로운 하위 폴더에서 수행한다. 같은 내용의 재접수 여부도 해시로 확인한다.

**산출물:** 곡별 `docs/<곡 식별자>-CONVERSION.md`, 로컬 `docs/experiments/<곡 식별자>-<접수일>/`의 원본 사본·provenance·이전 결과 목록. provenance에는 원본 경로/해시, 사본 경로/해시, 접수일, 도구 버전, 실행 명령과 출력 폴더를 기록한다.

**완료 조건:** 원본과 사본 바이트가 같고 기존 결과의 보존 위치가 확인된다. 원본·자동 초벌·교정·최종 파일을 서로 구별할 수 있다. 미디어·실험 자료가 Git 제외 대상인지 확인하며 자동 stage하지 않는다. 출력명은 `source-transcription.musicxml`과 `score-final.musicxml`처럼 역할로 구분한다. 대소문자만 다른 이름은 쓰지 않는다.

**실패 시 확인:** 프로젝트 지침과 [통합·자료 보존 기록](../records/archive/musicxml-evaluation.md#musicxml-integration--pdf--musicxml-main-통합). 과거 worktree·이동된 venv를 현재 실행 경로로 가정하지 않는다. 기존 파일이 있는 출력 경로는 새 폴더로 바꾸고, 사용자 자료를 지우거나 덮어써서 해결하지 않는다.

### 이관 원문 — SCORE-PRODUCTION-PROCESS.md / 6

출처: [docs/score-production/SCORE-PRODUCTION-PROCESS.md](../how-to/produce-score.md#score-production-process--악보-제작-프로세스). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 2. PDF 유형과 변환 경로 결정

**입력:** 보존한 원본, 페이지별 글리프·글꼴·선/이미지 조사 결과.

**수행 방법·도구:** [변환 정책](../reference/score/production.md#musicxml-conversion-policy--선택-순서)에 따라 벡터/스캔/사진/혼합을 구별한다. `pdfplumber`로 문자 행렬·좌표·오선·줄기·빔을 조사하고 원본 렌더와 대조한다. 벡터는 구조 추출을 우선하고 스캔·사진은 Audiveris 자동 초벌 후 원본 교정을 먼저 시험한다. 혼합 입력은 페이지별로 평가한다. 새로운 양식은 대표 2~3줄에서 일반 패턴·필인·박자/주법 예외를 포함해 시험한다.

**산출물:** 페이지 유형표, 대표 원본 crop, 교정 전 출력/로그, 오류 목록, 선택한 경로와 선택 이유. 대표 구간의 위치와 집계 기준을 고정한다.

**완료 조건:** 대표 구간의 음표·쉼표·동시음·음가와 중요한 예외를 실제로 판독할 수 있다. 누락·애매한 항목 및 필요한 교정량을 기록한 뒤 전체 확장 경로를 결정한다. 낮은 표본 오류율을 전곡 정확도로 표현하지 않는다.

**실패 시 확인:** [Real Paradis 변환](../records/songs/real-paradis.md#musicxml-conversion--real-paradis-pdf--musicxml)·[비교](../records/archive/musicxml-evaluation.md#musicxml-comparison--두-musicxml의-원본-복원-품질-비교--2026-09-19), [Loveholic 구조 추출](../records/songs/loveholic.md#loveholic-conversion--loveholic-pdf--musicxml-작업), 문제 해결 기록 → 과거 제작 세션 → 공식 웹 자료. 기존 코드의 해시 가드를 해제해 다른 곡을 통과시키지 않는다.

### 이관 원문 — SCORE-PRODUCTION-PROCESS.md / 7

출처: [docs/score-production/SCORE-PRODUCTION-PROCESS.md](../how-to/produce-score.md#score-production-process--악보-제작-프로세스). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 3. MusicXML 구조와 악기·주법 교정

**입력:** 원본 구조, 대표 판독 근거, 추출한 마디별 이벤트 또는 보존한 자동 인식 초벌.

**수행 방법·도구:** 실제 마디 경계·박자표·템포·성부·동시음·음가·쉼표·점·붙임줄·연음·장식음·반복·구간 지시를 원본과 대조한다. 기존 `tools/score-production/musicxml/`의 추출/내보내기/검증 구조를 참고하되 새 곡의 글꼴·좌표·예외에 맞는 판독과 fixture를 만든다. 악기 이름·MIDI·오선 위치·음표머리·주법은 [확정 매핑](../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙)을 따른다. 원본 성부·화음·기둥 구성을 임의로 공통화하지 않는다.

독립적으로 원본에서 읽은 대표 fixture와 XML 재읽기를 비교한다. 마디 합계가 맞는지뿐 아니라 각 시작·길이·화음·악기·표기를 검사한다. 로컬 MusicXML 4.0 XSD와 기존 `verify.py`의 의존 스키마 resolver를 사용한다. 변환 코드를 바꾸면 누락·잘못된 음가/악기/박자·동시음 분해 등의 오류 주입으로 검출 능력을 확인한다.

**산출물:** 추출 IR/원본 객체, 교정 목록, 마디별 판독 상태, MusicXML 후보, fixture, XSD·재읽기·오류 주입 결과. 번호 연속성·드럼 파트의 마디 수·총 사분음표 길이·머리/쉼표/주법 개수도 기록한다.

**완료 조건:** 원본과 이벤트가 대응하고 의도된 성부별 박 합계·규격·재읽기를 통과한다. 여러 파트의 마디 수를 합쳐 전곡 길이를 계산하지 않는다. 반복 표기와 실제 재생 순서는 현재 [정본 계약](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약)의 지원 범위를 확인한다. 미확정 의미·렌더링 미지원·표시 성공을 서로 구분한다.

**실패 시 확인:** 매핑 정본과 그 승인 이력 → 곡별 제작 문서·원본 fixture → 과거 제작 세션 → MusicXML/OSMD/Audiveris 공식 자료. PDF X간격이나 마디 합계를 맞추기 위한 임의 음가 조정은 하지 않는다. 새 대체 매핑이 필요하면 매핑 정본의 보고·사용자 결정 절차를 따른다.

### 이관 원문 — SCORE-PRODUCTION-PROCESS.md / 8

출처: [docs/score-production/SCORE-PRODUCTION-PROCESS.md](../how-to/produce-score.md#score-production-process--악보-제작-프로세스). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 4. 인쇄 가사 대조와 음악적 위치 저장

**입력:** 원본 가사 문자·bbox, 마디 경계, 판독한 음표/쉼표 시작·음가. 제공된 보컬 악보가 있으면 함께 대조한다.

**수행 방법·도구:** [가사 기준](../reference/score/production.md#musicxml-conversion-policy--가사-기준--악보-우선)과 [정본 계약](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약)을 따른다. 문자/음절/영어 단어의 순서·줄·마디를 보존하고 실제 음표 또는 쉼표 underlay에 대응시킨다. 기존 `loveholic_printed_lyrics.py`·`loveholic_lyric_notes.py`는 해당 원본의 재현 도구로만 참고한다. 독립 `DrumPracticeLyrics`의 표준 `note/lyric/text`와 `measureId + quarterOffset + durationQuarters`로 기록하며 없는 보컬 음높이를 만들지 않는다.

판독 추정에는 대상 음절·마디·근거 구절·선택한 위치·다른 가능성을 남긴다. 마디 귀속만 판독되는 경우에는 [마디 가사 계약](../reference/score/musicxml.md#measure-lyrics--마디-단위-인쇄-가사-계약)을 확인하고 그 한계를 보고한다. 음표 대응을 요구한 가사를 중앙 문구만으로 완료 처리하지 않는다. PDF 표시 좌표와 음악적 시작·길이는 별개로 다룬다.

**산출물:** 원문 보존 자료, 음절별 판독/추정표, 표준 가사 XML, 왕복 비교. 필요하면 원본 해시·region geometry와 lyricId/음악적 위치에 묶인 PDF 표시 anchor 근거를 추가한다.

**완료 조건:** 문자·순서·마디·시작·표시 음가가 저장/재읽기 후 유지된다. 드럼 데이터·음원 연결은 가사 추가로 바뀌지 않는다. PDF 음표 중심과 실제 파란 가사를 대조한다. 가수의 실제 발음 시작/끝·길이, STT·CTC·LRC 검색은 완료 조건이 아니다.

**실패 시 확인:** [가사 제작·과거 음원 시험](../records/songs/loveholic.md#loveholic-lyrics-review--loveholic-인쇄-가사-제작과-과거-시각-시험--2026-10-03), [실제 PDF 가사 수정](../records/songs/loveholic.md#loveholic-pdf-lyric-placement--loveholic-pdf-가사-위치-수정--2026-10-03), 문제 해결 기록. 인쇄 위치를 가창 시간 측정으로 해석하거나 PDF의 가로 간격을 그대로 음가로 바꾸지 않는다.

### 이관 원문 — SCORE-PRODUCTION-PROCESS.md / 9

출처: [docs/score-production/SCORE-PRODUCTION-PROCESS.md](../how-to/produce-score.md#score-production-process--악보-제작-프로세스). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 5. 음원 첫 박·BPM·마디 시간 연결

**새 드럼 음원을 제작하는 경우:** [드럼킷 선택 기준](0019-preserved-drum-kit-selection.md#이관-원문--garageband-drum-kitsmd--2)을 먼저 적용한다. 현재 보존된 SoCal·Portland 중 곡·연습 목적에 맞는 키트를 선택하고 프로젝트 복사본의 샘플과 필요한 매핑을 확인한 뒤 악보 이벤트와 같은 시간표로 제작한다. 선택한 키트와 이유·출처·검증을 곡별 문서에 기록한다. 아래 원음원 보존·연결 절차는 제공된 원음원을 사용하는 경우에 적용한다.

**입력:** 원음원 전체, 검증한 마디/박자표, 악보 템포, 판독한 타격 시작, 음원 분석 결과.

**수행 방법·도구:** [변환 정책의 필수 검증](0017-source-dependent-musicxml-conversion.md#이관-원문--musicxml-conversion-policymd--5)을 실행한다. `ffprobe`, 앱 템포 추정/박자 탭, `loveholic_audio.py`의 PCM·spectral-flux/타격 대조 방식을 참고한다. 계산에는 임시 디코딩을 사용할 수 있으나 원음원을 자르거나 재인코딩해 대체하지 않는다. 음원0초와 악보 첫 박을 구분하고 `firstBeat`·첫 마디 start를 맞춘다. 인쇄 BPM과 실연 템포/마디별 연결값이 다르면 각각 기록한다.

초반·중간·후반의 특징적인 타격/필인과 박자 변화·휴지 뒤 시작을 비교한다. 경쟁하는 ±박 위상과 누적 드리프트를 점검한다. 국소 상관값·주변 피크는 추정 근거이며 실제 드럼 타격이나 청취 오차의 확정값이 아니다. 마지막 쉼표와 원음원 끝부분도 보존한다. XML의 안정 마디 ID·음원 해시·시작/끝 연결과 파생 Song을 왕복 대조한다. 국소 연결을 단일 BPM으로 덮어쓰지 않는다.

**산출물:** 음원 연결 JSON/정본 메타데이터, 첫 박·인쇄 BPM·실연 추정·마디 start/end·근거·불확실성, 아래 재생 검수표. 가사 초 단위 캐시는 이 연결에서 계산하며 실제 가창 전사로 표시하지 않는다.

**완료 조건:** 첫 박·템포·시간표의 근거와 원음원 보존을 확인하고, OFF/ON·배속·반복을 실제 재생/청취에서 대조한다. 코드 수치/자동 검사와 기기 청취를 별도 결과로 남긴다. 청취가 없으면 패키지의 재생 검증은 미완료로 표시한다.

**실패 시 확인:** 아래 책임 구분 → 해당 곡 제작 기록과 history → 정본 연결 계약·공통 재생 예약 코드 → 과거 세션 → 공식 자료. OFF 정상·ON 실패를 곡 데이터나 음원 자르기로 우회하지 않는다.

###### 첫 박·카운트오프 검수표

곡명, PDF/음원 해시, firstBeat, BPM/해당 구간 박 길이, 앱 버전/빌드, 브라우저·기기, 시작 위치, 배속, 카운트 설정, 관측 방법과 결과를 각 행에 기록한다. 수치만 검사했다면 ‘청취 미검증’이라고 적는다.

| 확인 | 시작 위치·조건 | 완료 판단 |
|---|---|---|
| OFF | 곡 처음과 중간 마디, 기본 배속 | 음원·악보·메트로놈의 박이 일치 |
| ON | 음원0초·첫 마디 시작점·중간 마디에서 각각 | 네 번의 사분음표 준비 카운트 다음 박에 실제 첫 박 연결 |
| 느린/빠른 배속 | 같은 시작점에서 OFF/ON 비교 | 마지막 카운트→첫 박이 해당 배속의 사분음표 한 박 |
| 앞부분 | 실제 곡의 첫 박 이전 구간, 긴 앞부분 회귀 사례 | 앞부분 보존, 준비 카운트와 첫 박 정렬; 실제 입력에 없는 긴 앞부분은 코드 회귀 검사로 구분 |
| 반복 | 같은 반복 경계에서 여러 회차 | 박 중복·누락 없이 이어짐 |

| 관측 | 조사 책임과 처리 |
|---|---|
| OFF에서도 어긋남 | 제작 측 첫 박·BPM·마디별 연결을 검토하고 실제 음원/악보와 재대조 |
| OFF 정상, ON만 어긋남 | 앱 카운트오프 예약 문제로 전달. 정상인 곡 시간표는 이동하지 않음 |
| 수치 검사 정상, 청취 미실시 | 수치 통과만 기록. 기기 청취 완료로 표현하지 않음 |
| 시뮬레이터/Chromium만 확인 | 그 환경의 결과로 기록. 실물 iPad Safari·오디오 결과로 대체하지 않음 |

### 이관 원문 — SCORE-PRODUCTION-PROCESS.md / 10

출처: [docs/score-production/SCORE-PRODUCTION-PROCESS.md](../how-to/produce-score.md#score-production-process--악보-제작-프로세스). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 6. SVG 조판·재생 캐시·완성 패키지

**섹션·연주 지시:** [최종 7가지 원칙](../reference/score/rendering.md#svg-score-rules--4-구간-시작-표시)을 먼저 적용한다. 원본 표제 대조, 적용 박 보존, 사분음표 기준0.0625박 최소 탐색과 오선 한 간격¼ 여백, 같은 줄 한계/높이 분리, XML 위치 속성과 공통 조판 재현을 확인한다. 과거 v10/현재 도구의 검증 결과를 새 원칙 전체 충족으로 대신하지 않는다.

**입력:** 검증한 XML, 음악적 가사·음원 연결, 원본 PDF/음원, 검증한 페이지·마디 영역과 표시 좌표.

**수행 방법·도구:** [SVG 정본](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙)과 [브라우저 조판](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약)을 읽고 공통 `src/modules/score/musicxml.ts::renderMusicXML`을 사용한다. 전체 인쇄 SVG와 연습 화면의 배치를 구분한다. 캐시는 현재 렌더러/표시 정책/원문에 맞게 생성하며, `src/modules/score/browser-score.ts::prepareBrowserScore`의 실제 열기 결과도 검수한다. 기존 동봉 SVG만으로 최신 화면의 모양을 보증하지 않는다. 원문을 렌더러 출력으로 재생성하지 않는다.

`src/modules/score/canonical-xml.ts`의 정본 쓰기·읽기와 `src/modules/library/score-package.ts`의 `createScorePackage → readScorePackage`로 완성 `.drumscore`를 생성·재읽기한다. 곡별 helper는 입력·원본 해시·경로·포트를 검토한 뒤 사용한다. loopback 근거 수신기는 새로운 출력 폴더에서 실행하고 작업 후 그 프로세스만 종료한다. ZIP 감사는 확장자 추정 대신 manifest의 실제 자산 경로를 읽는다.

**산출물:** 최종 MusicXML·전체 SVG/재생 캐시·원본 PDF 페이지·`.drumscore`, 패키지 manifest와 해시·CRC·왕복 보존 보고서, 실제 출력 캡처.

**완료 조건:** Song 전체와 canonicalXML, PDF/음원 원시 바이트, 마디/박자·가사·대체 악보 연결이 왕복 유지된다. 모든 마디와 주법을 실제 렌더에서 확인한다. glyph DOM 개수는 쉼표·꾸밈음 포함 여부를 명시한다. PDF 세로 영역은 자기 줄 내용 포함·이전 줄 혼입 방지, 가로 자르기는 승인된 표시 규칙과 원본 geometry에만 적용한다. 다른 곡의 crop/anchor를 복사하지 않는다.

**실패 시 확인:** 패키지 계약 → SVG/매핑 정본 → 문제 해결 기록. XML 파싱 성공이나 warnings 없음은 주법 출력 성공이 아니다. Poppler/CairoSVG PNG와 실제 Safari SVG의 폰트/잘림 결과를 구별한다. HMR·병행 소스 변경이 있으면 조율해 입력·렌더러 상태를 고정하고 새 증거를 만든다.

### 이관 원문 — SCORE-PRODUCTION-PROCESS.md / 11

출처: [docs/score-production/SCORE-PRODUCTION-PROCESS.md](../how-to/produce-score.md#score-production-process--악보-제작-프로세스). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 7. 실제 앱 수록본과 저장 곡 검수

**입력:** 검증한 최종 패키지, 작업 대상 origin/앱·현재 빌드, 기존 저장 곡/수록 파일과 연습 상태.

**수행 방법·도구:** 이미 승인된 로컬 앱 범위에서 Safari MCP로 실제 ‘완성 악보 가져오기’ 또는 수록곡 ‘악보 업데이트’를 실행한다. 대상 곡·origin을 먼저 확인하고 기존 자료를 보존한다. 같은 곡 구조의 설정·마커·루프를 유지하는 업데이트 계약을 따른다. 구조가 달라지면 자동 재배치하지 않는다. Safari 실패는 원인을 기록한 뒤 프로젝트의 대체 브라우저 절차를 따른다.

저장 후 화면을 닫고 다시 연다. 실제 저장 레코드·canonicalXML·음원 해시·마디/가사 개수를 입력 패키지와 대조한다. PDF/SVG × 한 줄/두 줄, 전체 악보의 첫/중간/끝·밀집 필인·주법·가사·페이지 경계를 확인한다. 마디 클릭·진행선·재생/일시정지·배속·반복·마커·보기 전환 후 상태 보존과 5단계의 OFF/ON 청취를 확인한다. 화면에 가사가 있는 것과 PDF 대응 위치가 맞는 것은 별도 검사다.

**산출물:** 실제 저장·재열기 대조, 화면/재생 검수표·캡처, 앱/기기/빌드·원문/패키지 식별, 유지된 연습 상태와 잔여 결함.

**완료 조건:** 생성 파일·실제 수록 파일·실제 저장 곡의 버전이 연결되고 재열기 후 내용과 상태가 유지된다. 합성 fixture나 메모리상의 render 호출만으로 실제 수록 완료를 선언하지 않는다. 제작 검수와 앱 수정·발행 책임을 나누며, 현재 대상 밖의 기존 탭/공개 사이트가 갱신됐다고 가정하지 않는다.

**실패 시 확인:** [Loveholic 실제 수록 수정](../records/songs/loveholic.md#loveholic-pdf-lyric-placement--loveholic-pdf-가사-위치-수정--2026-10-03), 패키지 업데이트/구조 충돌 계약, 조판 캐시 키·음원 해시. 오래된 저장 곡·수록 파일·표시 캐시·다른 origin 중 어느 단계인지 확인한다. 데이터와 UI/오디오 예약 결함을 분리해 담당 세션에 정확한 근거를 전달한다.

### 이관 원문 — SCORE-PRODUCTION-PROCESS.md / 12

출처: [docs/score-production/SCORE-PRODUCTION-PROCESS.md](../how-to/produce-score.md#score-production-process--악보-제작-프로세스). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 8. 결과 인계와 제작 종료

**입력:** 원본/최종 해시, 단계별 검사 결과, 해결·추정·미검증 목록, 실제 작업/수록/배포 상태.

**수행 방법·도구:** 곡별 제작 문서와 `history.md`를 갱신한다. 해결한 문제는 원인·수정·검증·다음 적용 조건을 문제 해결 기록에 연결한다. 전달받은 세션의 성공 보고만으로 상태를 확정하지 않고 필요한 최종 파일/핵심 근거를 직접 확인한다.

[공통 인계 준비 순서](../how-to/produce-score.md#reusable-production-workflow--3-인계문)에 따라 추가·수정한 제작 JSON·스크립트의 서식·관련 코드 검사와 서식 수정 전후 값/제작 결과 보존을 확인한다. 최신 파일과 검증 보고서가 준비되면 `handoff_production.py build`로 경로·해시·범위·미검증을 포함한 초안을 만든다. 검증 결과의 후보 해시를 실제 전달 파일과 대조하며, 해시 결합 없는 과거 기록은 현재 후보의 통과 근거로 승격하지 않는다. 곡별 설정에는 판단·한계·다음 조치를 명시한다. 자동 생성 뒤 본문을 검토하고 아래 실제 전송 절차를 수행한다.

**제작 완료 후 자동 인계 — 사용자 상시 위임(2026-10-15):** 앞으로 새 악보나 교정·재제작한 수정본의 제작을 마치면, 사용자가 다시 말하지 않아도 기존 드럼웹앱 제작자에게 실제 메시지로 전달한다. 같은 대상·범위의 전달을 매번 재승인받지 않는다. 파일 링크만 최종 응답에 남기거나 다음 담당자가 알아서 조회할 것이라고 가정하지 않는다.

1. 기존 담당은 **드럼연습실 웹앱 개발**, 현재 `threadId=01a0afc9-ca21-7371-9390-06eb07c017e9`, `hostId=local`이다. `read_thread` 등 지원 도구로 실제 담당·프로젝트·연락 경로를 확인한다. 사용자 확정 없이 새 담당자나 새 채팅을 만들지 않는다.
2. 최신 산출물·인계 문서의 실제 존재와 식별을 확인하고 아래 인계 항목을 준비한다. 요청 범위 밖의 음원·패키지를 새로 만들 필요는 없다. 앱 수록·표시·청취가 남아 있으면 그 상태와 다음 조치를 명시하며 앱 반영을 기다리느라 제작 결과 인계를 미루지 않는다.
3. `send_message_to_thread`로 최신 파일의 절대경로·곡 ID·해시, 검증 결과·변경점·음원 연결·미해결 문제와 인계 문서를 전달한다. 이번 상시 위임이 사용자 승인 근거임을 명시한다.
4. 도구의 전송 접수 결과를 확인하고 지원되는 상태 조회로 수신자의 접수·처리 상태를 확인한다. 응답을 확인하지 못했으면 미확인으로 기록한다. 실제 전달 본문·수신처·시각·승인 근거·접수/처리 증거를 곡별 제작 기록에 남긴다. 전송 실패는 준비된 본문·차단 사유·다음 조치를 사용자에게 보고한다.

이 승인은 기존 개발자에게 해당 악보 제작 결과를 전달하는 범위다. 무관한 외부 메시지, 인력 재배정, 신규 시험, 커밋·push·공개 배포는 별도 승인 범위를 따른다.

**산출물:** 다음 담당자가 이전 대화 없이 사용할 인계: 정확한 원본/최종 파일 경로·SHA256, 생성 코드·버전·명령·의존 파일·새 출력 폴더, 실제 마디/총 길이, 가사/주법 상태, 첫 박/BPM·연결표, 실제 앱 origin/빌드·수록/재열기·청취 결과, 보존 자료, 앱 결함·추정·미검증과 다음 조치.

**완료 조건:** 아래 완료 판정표의 상태를 모두 채우고, 기존 개발자에게 실제 전달한 결과를 기록했다. 미검증은 이유와 담당/다음 확인을 명시한다. 메시지 전송 접수·수신자 검토 착수·앱 반영 완료와 commit·push·수록·deploy·청취는 별개 상태로 보고한다. 실험 자료를 자동 Git 추가하거나 삭제하지 않는다. 앱을 수정했다면 프로젝트 지침의 build-info 갱신을 따르며, 버전 상승은 사용자 커밋 지시 때만 수행한다. 문서 작업만이면 앱 빌드/버전을 바꾸지 않는다.

**실패 시 확인:** 인계 파일의 실제 존재·해시·Git 상태부터 재확인한다. 사라진 worktree, 절대 경로가 남은 venv, 불완전한 로컬 원본 때문에 재현할 수 없으면 그 선행 조건을 적는다. 별도 요청 없는 원격 통합·배포로 인계 누락을 덮지 않는다.

### 이관 원문 — SCORE-PRODUCTION-PROCESS.md / 13

출처: [docs/score-production/SCORE-PRODUCTION-PROCESS.md](../how-to/produce-score.md#score-production-process--악보-제작-프로세스). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 완료 판정과 필수 근거

| 판정 항목 | 남길 근거 | 아직 없을 때의 상태 |
|---|---|---|
| 자료 보존·유형 선택 | provenance, 원본/초벌/이전 결과, 대표 시험·방식 선택 | 접수/방식 평가 중 |
| 전사·가사 의미 | 원본 fixture, 마디/음가/주법·문자 대조, XSD·XML왕복, 추정 목록 | 후보·교정 중 |
| 음원 연결 | 첫 박/BPM·시간표·위상/드리프트 근거·해시 | 분석 추정 또는 연결 미완료 |
| 조판·패키지 | 실제 출력·주법/좌표, 패키지 CRC/원본 바이트/왕복 | 생성 완료와 화면 미검증을 분리 |
| 실제 앱 수록 | 업데이트/저장/재열기, 패키지/저장 레코드 대조, 상태 보존 | 수록 검증 미완료 |
| 재생·청취 | 기기별 OFF/ON·배속·반복 검수표, 수치와 청취 별도 | 청취 미검증 또는 앱 결함 인계 |
| 인계 | 곡별 제작 문서·history·재현 명령/환경·남은 일, 기존 개발자에게 실제 전달한 본문·접수/처리 상태 | 인계 미완료 또는 전송 실패/수신 상태 미확인 |

검증된 단계만 완료라고 쓴다. 앱 결함 때문에 청취 검증이 남으면 ‘전사·패키지 생성 완료 / 실제 재생 검증 대기’처럼 구분한다. 두 곡의 과거 테스트 수를 다음 곡의 성공 조건으로 사용하지 않는다. 전체 외부 이중 전사·실물 연주 정확도까지 확인했다고 주장하지 않는다.

### 이관 원문 — SCORE-PRODUCTION-PROCESS.md / 14

출처: [docs/score-production/SCORE-PRODUCTION-PROCESS.md](../how-to/produce-score.md#score-production-process--악보-제작-프로세스). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 기존 도구의 재사용 범위

2026-10-23: 반복 입출력·검사·패키지·MIDI·샘플 렌더링은 [공통 제작 도구](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독)의 실제 코드로 재사용한다. 곡 설정과 판독 근거를 분리하며, 새 곡용 범용 자동 판독 CLI가 완성됐다는 뜻은 아니다. 아래 곡별 도구는 원본 양식별 어댑터와 재현 진입점이다. 새 양식의 추출·fixture·메타데이터·패키지 helper를 이번 입력에 맞게 작성/검증한 뒤 곡별 문서에 **실제로 실행한 명령**을 남겨야 처음부터 재현할 수 있다.

| 도구·코드 | 확인한 인터페이스와 선행 조건 | 새 곡에서의 적용 |
|---|---|---|
| `tools/score-production/musicxml/convert.py` → `export.py` → `verify.py` | convert: `--pdf --geometry --out`; export: `--input --out`; verify: `--xml --ir --schema --out`. Real Paradis 해시/geometry·전용 예외에 결합 | 구조를 참고. 새 입력에 그대로 실행하지 않음 |
| `tools/score-production/musicxml/loveholic.py`, `verify_loveholic.py` | `--pdf --out`, `--dir`. 원본 해시, provenance, Poppler 페이지, 로컬 XSD, 원본 fixture 필요 | Opus 좌표·마디 예외를 새로 평가. 보존 결과에 재실행하지 않음 |
| `loveholic_printed_lyrics.py`, `loveholic_lyric_notes.py` | 원본 문자 bbox·이벤트와 동일 원본 해시. 후자 `--dir --out` | 직접 음표 대응/추정표의 검증 방법을 참고 |
| `loveholic_audio.py` | `--audio --bars --out`; ffmpeg·numpy 필요. 신호 분석 추정 출력 | 새 곡의 위상·템포·변화 구간을 다시 검증 |
| `loveholic_package.mjs` | Vite 브라우저 모듈, 특정 곡 경로/해시/개수·loopback 수신기에 결합 | 범용 명령으로 제시하지 않음. 공통 API 사용 방법을 참고 |
| `src/modules/score/canonical-xml.ts`, `src/modules/score/musicxml.ts`, `src/modules/library/score-package.ts` | 브라우저 DOM/Blob 계약, 현재 공통 정본/조판/ZIP API | 새 곡도 공통 계약으로 저장·렌더·재읽기 |
| `src/modules/score/browser-score.ts`, `src/platform/storage/practice-library.ts` | 공통 조판 결과와 실제 저장/업데이트 계약 | 실제 앱 수록·재열기에 사용 |

실행 환경에는 Node/package lock, Python interpreter·라이브러리, Poppler/ffmpeg, 로컬 XSD의 `musicxml.xsd/xml.xsd/xlink.xsd`, 사용한 Audiveris/OSMD 버전을 기록한다. `tools/score-production/musicxml/requirements.txt`의 기존 환경에 numpy·ffmpeg까지 포함된다고 가정하지 않는다. 이동된 venv는 별도 재생성하거나 정상 interpreter를 확인한다. [Loveholic 재현 절](../records/songs/loveholic.md#loveholic-conversion--근거재현-경로)은 해당 곡의 정확한 선행 파일과 명령 예다.

변환/저장 코드 변경에는 관련 `musicxml`, `canonical-xml`, `score-package` 테스트부터 실행하고, 영향 범위에 따라 `npm run test:drum`·TypeScript·관련 Python 검사를 수행한다. 실제 fixture가 없는 실패를 삭제로 우회하지 않는다. 현재 테스트는 `tests/{unit,integration,local-media}`만 수집한다. `npm run build`는 두 앱을 분리 빌드하며 독립 HTML 내보내기 템플릿은 생성하지 않는다. 문서만 변경한 작업에는 악보 재생성·앱 빌드·청취를 실행한 것처럼 기록하지 않는다.


### Rule 재점검 원문 — SCORE-PRODUCTION-RULES.md / 1

출처: [docs/score-production/SCORE-PRODUCTION-RULES.md](../reference/score/production.md#score-production-rules--악보-제작-범위와-보존-rule). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> 사용자 상시 위임(2026-10-15)에 따라 새 악보와 교정·재제작한 수정본은 제작을 마치면 기존 **드럼연습실 웹앱 개발** 담당에게 실제 메시지로 전달한다. 동일 대상·범위의 승인을 매번 다시 묻지 않는다. 절차에서 현재 담당·thread ID·host를 확인하고 최종 파일/해시·상태·한계·다음 조치·실제 전송/접수 근거를 남긴다. 파일 링크만 최종 응답에 남겨 전달 완료로 간주하지 않는다.
