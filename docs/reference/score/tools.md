# 공통 제작 도구와 로컬 분석 계약

문서 역할: **현행 Rule**. 현재 요구·계약과 지원 한계를 다룬다. [전체 정본](../../RULES-INDEX.md), [실행 안내](../../README.md), [결정 이력](../../decisions/README.md)을 함께 참고한다.

<a id="common-tools--공통-제작-도구-계약과-곡별-판독"></a>

## 공통 제작 도구 계약과 곡별 판독

결정 근거: [ADR-0018](../../decisions/0018-reusable-score-production-and-handoff.md). 실행: [절차](../../how-to/produce-score.md#score-tools--공통-제작-도구-사용-절차).

<a id="common-tools--공통-코드와-곡별-판단"></a>

### 공통 코드와 곡별 판단

반복 입출력·검사·패키지·MIDI·샘플 렌더링은 공통 코드가 맡고 곡별 설정·판독 근거를 분리한다. 기존 산출물의 보존과 원본 의미가 우선이다. 독립 기대값을 생성기 출력으로 대체하지 않는다.

<a id="common-tools--구현된-경계"></a>

### 구현된 경계

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
| 판독 기대값·근거 | `profiles/`의 곡별 판독 설정, `fixtures/*.json` | 독립 원본 리듬, 곡별 예외, 가사 내부 위치 추정, 연습곡 구성. 근거는 [곡별 제작 기록](../../records/README.md#곡별-제작-기록)에서 확인 |
| 곡별 어댑터 | 기존 `loveholic.py`, `red_sunset.py`, `convert.py`, 연습곡 생성기와 `*_package.mjs` | PDF 기호/좌표 판독, 구간 구성·마커, 주법 해석, 자유 엔딩 대응과 추가 검사 |

`xml_helpers.py`의 단순 노드 생성기도 유지한다. Python 판독 어댑터의 곡별 XML 표기·빔·성부 구성까지 기계적으로 통일하지 않는다. 기존 출력 보존과 원본 의미가 우선이다. 가수/제목 정본은 기존 fixture·곡 메타정보에서 읽으며 별도 값을 중복 생성하지 않는다.

<a id="common-tools--공통-패키지-api"></a>

#### 공통 패키지 API

- `prepareCanonical(song, sourceXML, audioHash, editDocument?)`: 기존 정본 writer → 중복 표제 정리 → 선택적 곡 메타정보 부가 → 재읽기/마디 시간 비교. 반환은 `{ canonicalXML, restored }`.
- `bindRenderedScore(song, rendered)`: 현재 앱 renderer의 결과를 기존 마디 ID에 연결. 시작/끝 시각은 유지.
- `createVerifiedPackage(record)`: 기존 앱의 생성/읽기 API를 실행하고 모든 자산과 의미를 비교한 Blob 반환.
- `sha`, `base64`, `saveEvidence`: 바이트 식별·전달 공통 처리. 파일 저장은 현재 로컬 승인 범위에서 별도 호출.

곡별 패키지 어댑터가 이 공통 경로를 호출한다. 추가 가사 검수·스티킹 표시·청취 검사는 각 어댑터에 남는다. 곡별 초기 생성과 기존 정본의 갱신·가사 보정 경로는 각각의 목적을 유지한다. 기존 정본을 가져와 왕복 검사하는 것은 최신 렌더링·청취 검사와 별개다.

<a id="common-tools--남겨-둔-곡별-판단"></a>

### 남겨 둔 곡별 판단

현재 공통 코드는 입력 양식을 자동으로 판독하는 범용 OMR이 아니다. PDF 기호 해석·원본별 성부/빔 구성, 추정 가사 채택, 자유 엔딩 연결, 연습곡 구성과 스티킹은 각각 어댑터·fixture·판독 근거가 맡는다. 해당 판단을 변경할 때에는 새 원본 대조가 필요하며 코드 동등성 검사를 원본 판독의 근거로 대신하지 않는다.

<a id="apple-local-review--apple-로컬-가사-검토-계약"></a>

## Apple 로컬 가사 검토 계약

문서 역할: **선택적 로컬 보조 도구 Rule**. 악보 기반 가사 변환의 완료 조건이 아니며 [정본](musicxml.md#musicxml-canonical--musicxml-정본-계약)·[ADR-0013](../../decisions/0013-score-based-lyric-positions.md)을 따른다. 사용자가 원문·발음·가창 검토를 별도로 요청한 범위에서만 실행한다. 절차는 [로컬 워크플로우](../../how-to/use-apple-local-tools.md#apple-local-workflow--apple-로컬-검토-실행-절차), 실측은 [사실 기록](../../records/apple-local-tools.md#apple-local-review-history--apple-로컬-가사-검토-실측-기록)에 둔다.

Mac에서 Apple SpeechTranscriber가 음원과 시간 정보를 읽는다. Python이 사용자 가사와 대조하고, AFM 3가 짧은 문맥 기반 발음 비교 의견을 붙인다. Codex/사람은 원문·음원 범위와 각 의견을 검토한다. 최종 음절 정렬은 별도 작업이다.

성공 조건은 모든 지정 구간의 STT 결과, 검사된 시간 범위, AFM 결과/실패 기록, 원본을 보존한 검토 목록 생성이다. 후보 개수를 인식 오류 수로 해석하지 않는다. 이 도구는 Mac 자료 준비용 CLI이며 웹앱/iPad HTML에서 AFM을 호출하지 않는다.

<a id="apple-local-review--출력-계약"></a>

### 출력 계약

- `*-stt.json`: 원래 STT 텍스트·시각·인식 신뢰도.
- `report.json`: 전체 run 시각, 동일 텍스트 구간, 차이 후보, 주변 문맥, 마디 번호, AFM 의견, 원본/스크립트 해시, 실행 시간.
- `afm-input.json`, `afm-output.jsonl`: 짧은 비교 요청과 모델 이름·응답.
- `review.md`: 검토자가 읽을 목록. 별도 검토 결과는 `review-decisions.json` 등으로 기록한다.

시간의 유한성·순서·길이를 검사한다. AFM의 ID·분류 enum·누락·중복을 검사한다. AFM 실패 시 STT와 후보는 보존하고 실패를 명시한다. `sameReading`도 후보를 제거하지 않는다. AFM이 시각을 생성하는 계약은 없다. 한 STT run이 여러 발음을 포함해도 균등 분배하지 않는다. `confirmed`는 변경하지 않는다.

<a id="apple-local-review--경계-후보의-의미"></a>

### 경계 후보의 의미

`boundaries.py`가 시간 경계 검사를 담당한다. 텍스트가 원문과 같더라도 별도로 시간 경계를 검사한다. 단일 문자 STT run이0.8초 이상이거나 사용자 청취 앵커와 연결되면 검토 대상으로 만든다.0.8초는 의심 후보를 찾는 휴리스틱이며 긴 음절을 오류로 확정하는 기준이 아니다.

각 후보는 기존 시작에서 조금씩 다른 두 지점으로 잘라 다시 전사한다. 이 절차는 실제 발음을 잘라낼 수도 있어 늦은 결과를 자동 채택하지 않는다. 동일 문자가 해당 시간범위에 정확히 하나 있고, 클립 시작에서0.12초 이상 떨어진 결과만 비교한다. 누락·중복·잘린 시작은 근거 부족으로 보존한다.

- 기존/재전사 시작의 차이가0.2초를 넘으면 `context_sensitive`.
- 유효 결과가 두 개이고 차이가 작으면 `stable_in_tested_windows`지만 정확성 확인은 아님.
- 다른 경우 `insufficient_evidence`.
- 모든 경계 후보는 `needsReview=true`, `autoApply=false`. AFM 판단이 이를 해제하지 않는다.

사용자 앵커는 manifest의 별도 `anchors` 배열로 제공한다. STT 출력과 합치거나 덮어쓰지 않는다. 매칭 못 한 앵커도 report의 unmatchedListeningAnchors에 남긴다.

앵커 입력 예시는 [워크플로우](../../how-to/use-apple-local-tools.md#apple-local-workflow--청취-앵커-입력)를 따른다.
