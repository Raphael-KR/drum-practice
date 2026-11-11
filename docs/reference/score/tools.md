# 공통 제작 도구와 로컬 분석 계약

문서 역할: **현행 Rule**. 공통 도구의 입출력·책임·지원 한계를 정한다.
[전체 정본](../../RULES-INDEX.md) · [실행 안내](../../README.md) · [결정 이력](../../decisions/README.md)

<a id="common-tools--공통-제작-도구-계약과-곡별-판독"></a>

## 공통 제작 도구 계약과 곡별 판독

결정 근거: [ADR-0018](../../decisions/0018-reusable-score-production-and-handoff.md). 실행: [절차](../../how-to/produce-score.md#score-tools--공통-제작-도구-사용-절차).

<a id="common-tools--공통-코드와-곡별-판단"></a>

### 공통 코드와 곡별 판단

반복 입출력·검사·패키지·MIDI·샘플 렌더링은 공통 코드로, 곡별 설정·판독은 별도로 관리한다. 원본 의미·기존 산출물을 보존하며 독립 기대값을 생성기 출력으로 대체하지 않는다.

<a id="common-tools--구현된-경계"></a>

### 구현된 경계

| 역할                           | 코드/자료                                                                           | 입력과 책임                                                                                                                                                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 가사 시작점 검사               | `audit_lyric_onsets.py`, `common/lyric_onsets.py`                                   | 실제 XML의 유리수 시작점·마디 경계·음절 ID·text 없는 extend를 검사. 그리드 판정의 현재 지원 범위는 [이행 기록](../../records/archive/staff-grid64-rule-20261112.md#implementation-status)을 확인하며 자동 교정은 하지 않음 |
| 원본 사본·해시·PDF 페이지 준비 | `prepare_inputs.py`, `common/artifacts.py`                                          | 지정한 원본을 새 폴더에 보존. 선택한 DPI로 원본 PDF만 래스터화                                                                                                                                                             |
| 정본 조립·패키지 왕복          | `common/package.mjs`                                                                | 기존 앱 API 호출. 전체 Song/XML, 원본 음원·악보, 모든 페이지와 대체 악보 비교                                                                                                                                              |
| 결과 파일 저장                 | `common/evidence.py`                                                                | 기존 `/render`, `/package`, `/artifacts` 요청과 로컬 출력명. 앱 서버는 계속 5173이며 별도 포트는 파일 수신기                                                                                                               |
| 제작 계측                      | `measure_production.py`, `common/measurement.py`                                    | 실제 시작·단계와 요청별 사용량 메타데이터를 집계. 원시 대화 보존·상시 polling 없음. 단가/로그 범위/마감 시각 명시                                                                                                          |
| 공통 검수 화면                 | `common/review.mjs`                                                                 | 기존 앱 표시 함수와 원본 시스템 구분을 사용하는 일시 화면. 가사 앵커/배치·해제 확인, DB 쓰기 없음                                                                                                                          |
| 섹션·지시문 표시 offset        | `common/direction-offset.mjs`                                                       | XML cursor를 유지하며 표시 offset을 계산·저장. 단위·충돌 판정은 [지시문 offset 계약](#common-tools--지시문-offset)을 따름                                                                                                  |
| 인계문 조립                    | `handoff_production.py`, `common/handoff.py`                                        | 실제 파일·해시와 후보에 결합된 기존 검증 근거. MusicXML 단독 인계의 첫 박은 기존 정본 metadata의 첫 마디 start에서 읽는다. 전송·수신자 수록/청취는 별도 상태                                                               |
| 규격·음악적 시간 검사          | `common/musicxml.py`                                                                | 로컬 XSD, divisions·성부·backup/forward·화음·점·연음·꾸밈음의 유리수 시간. 드럼 파트만 집계                                                                                                                                |
| MIDI·샘플 이벤트               | `common/midi.py`                                                                    | BPM·박자·해상도·세기·채널을 명시. 곡별 작곡/스티킹을 결정하지 않음                                                                                                                                                         |
| 드럼킷 음원                    | `common/drum_audio.py`                                                              | 보존된 EXS/CAF, 키트별 GM 변환, 이벤트. 기존 비루프·무조율 샘플 범위. GarageBand 효과 체인을 재현하지 않음                                                                                                                 |
| 음원 특징                      | `common/audio_features.py`                                                          | PCM 디코딩·대역별 spectral flux. 원곡 연결의 승인/청취 판단은 하지 않음                                                                                                                                                    |
| 가사 후보                      | `common/lyrics.py`                                                                  | 원본 음표/쉼표 좌표에서 위치 후보 반환. 애매한 후보를 자동 확정하지 않음                                                                                                                                                   |
| MScore 벡터 구조               | `common/musescore_pdf.py`                                                           | 교정된 프로필의 선·빔·기호를 추출. 알 수 없는 기호는 실패 처리하며 악기 의미·반복·가사 확정은 곡별 판독                                                                                                                    |
| 곡 설정                        | `profiles/songs.json`                                                               | 경로·템포·첫 박·기대 마디 수·음원 설정·결과 이름·수신 포트                                                                                                                                                                 |
| 키트·악기 설정                 | `profiles/kits.json`, `profiles/exercise-instruments.json`                          | 기존 SoCal/Portland 샘플 식별과 승인된 연습곡 악기 매핑. 의미 정본은 매핑 문서                                                                                                                                             |
| 판독 기대값·근거               | `profiles/`의 곡별 판독 설정, `fixtures/*.json`                                     | 독립 원본 리듬, 곡별 예외, 가사 내부 위치 추정, 연습곡 구성. 근거는 [곡별 제작 기록](../../records/README.md#곡별-제작-기록)에서 확인                                                                                      |
| 곡별 어댑터                    | 기존 `loveholic.py`, `red_sunset.py`, `convert.py`, 연습곡 생성기와 `*_package.mjs` | PDF 기호/좌표 판독, 구간 구성·마커, 주법 해석, 자유 엔딩 대응과 추가 검사                                                                                                                                                  |

`xml_helpers.py`는 유지하며 곡별 표기·빔·성부를 기계적으로 통일하지 않는다.
새 곡의 제목·가수 입력은 fixture·곡 설정에서 읽는다. 기존 정본 교정은 MusicXML 메타정보를 기준으로 하며 별도 정본을 중복 관리하지 않는다.

<a id="common-tools--지시문-offset"></a>

#### 지시문 offset 계약

요구 기준은 [상위 기본 단위](production.md#score-production-rules--오선-부착-표기의-공통-기본단위)와 [섹션·지시문 배치](rendering.md#svg-score-rules--섹션연주-지시-7가지-원칙)다.

- 공통 렌더러에서 표시 이동 0부터 탐색하며 XML cursor와 음악적 적용 시점을 유지한다.
- 실제 잉크·선 두께와 오선 간격 ¼의 여백, 같은 줄 제한, 높이 분리를 확인한다.
- 선택한 값보다 작은 후보와 바로 앞 격자 후보, 저장 후 재열기를 확인한다.
- 원본 지시 높이는 곡별 판독으로 XML에 기록한다. Pretendard 글꼴도 저장한다.
- 자동 native ID는 비교 문자열에서만 정규화한다. 내보낸 SVG는 유지한다.
- 후보 탐색은 공통 `renderPrintedScore`의 인쇄형 단일 조판을 사용한다. 최종 XML은 `renderMusicXML`로 연주 보기까지 생성하여 재열기·보존을 확인한다. `inspectDirectionLayout`은 XML을 바꾸지 않고 지정한 출력의 배치를 검사한다.
- R/L 스티킹은 전용 조판 경로를 사용하므로 일반 지시문의 표시 offset 탐색 대상에서 제외한다. 원래 타격 위치는 보존한다.

탐색 간격의 일치와 실제 충돌·최소 여백·재열기 검증을 구분한다. 도구별 지원 범위·미반영 항목은 [이행 기록](../../records/archive/staff-grid64-rule-20261112.md#implementation-status)을 확인한다.

<a id="common-tools--공통-패키지-api"></a>

#### 공통 패키지 API

- `prepareCanonical(song, sourceXML, audioHash, editDocument?)`: 정본 writer → 중복 표제 정리 → 선택적 곡 메타정보 → 재읽기·마디 시간 비교. `{ canonicalXML, restored }` 반환.
- `bindRenderedScore(song, rendered)`: 앱 renderer 결과를 기존 마디 ID에 연결하며 시작·끝 시각 유지.
- `createVerifiedPackage(record)`: 앱 생성·읽기 API로 모든 자산·의미를 비교한 Blob 반환.
- `sha`, `base64`: 앱의 `platform/browser/sha256.ts`·`platform/storage/binary-asset.ts`로 소문자 64자리 해시·Base64 문자열 반환. 별도 인코더 금지.
- `saveEvidence`: 기존 로컬 수신기에 결과 전달. 파일 저장은 현재 로컬 승인 범위에서 별도 호출.
- `saveRenderPage`: 압축 SVG의 Base64를 페이지별로 전달한다. 큰 페이지는 16,000,000자씩 나누어 저장하고 순서·길이를 기록한다. 수신기의 `--per-score` 모드는 검증된 `artifactId`마다 새 하위 폴더를 사용한다.
- `common/evidence.py::read_render_gzip`: 분할 결과의 순서·전체 길이·Base64·gzip 무결성을 확인하여 원래 압축 바이트를 복구한다. 수신 한도·Origin 검사·기존 결과 덮어쓰기 금지는 유지한다.

곡별 패키지 어댑터가 공통 API를 호출하고 추가 가사 검수·스티킹·청취 검사를 맡는다. 초기 생성과 기존 정본·가사 갱신 경로를 구분한다. 왕복 검사는 최신 렌더링·청취 검사를 대신하지 않는다.

<a id="common-tools--남겨-둔-곡별-판단"></a>

### 남겨 둔 곡별 판단

PDF 기호·성부/빔, 추정 가사 채택, 자유 엔딩, 연습곡 구성·스티킹은 어댑터·fixture·판독 근거로 결정한다. 변경 시 원본을 다시 대조한다. 공통 코드는 범용 OMR이 아니며 코드 동등성은 판독 근거가 아니다.

<a id="apple-local-review--apple-로컬-가사-검토-계약"></a>

## Apple 로컬 가사 검토 계약

사용자가 **원문·발음·가창 검토를 별도 요청한 범위**에서만 실행하는 보조 도구다. 악보 기반 변환의 완료 조건이 아니다. 기준: [정본](musicxml.md#musicxml-canonical--musicxml-정본-계약)·[ADR-0013](../../decisions/0013-score-based-lyric-positions.md).

실행: [워크플로우](../../how-to/use-apple-local-tools.md#apple-local-workflow--apple-로컬-검토-실행-절차). 실측: [기록](../../records/apple-local-tools.md#apple-local-review-history--apple-로컬-가사-검토-실측-기록).

Mac의 Apple SpeechTranscriber가 음원·시간을 읽고 Python이 사용자 가사와 대조한다. AFM 3의 짧은 발음 비교 의견은 Codex/사람이 원문·음원과 검토한다. 최종 음절 정렬은 별도다.

완료 조건은 지정한 모든 구간의 STT·시간 검사·AFM 결과/실패와 원본을 보존한 검토 목록이다. 후보 수는 인식 오류 수가 아니다. Mac 준비용 CLI이며 웹앱/iPad HTML에서 AFM을 호출하지 않는다.

<a id="apple-local-review--출력-계약"></a>

### 출력 계약

- `*-stt.json`: 원래 STT 텍스트·시각·인식 신뢰도.
- `report.json`: 전체 run 시각, 동일 텍스트 구간, 차이 후보, 주변 문맥, 마디 번호, AFM 의견, 원본/스크립트 해시, 실행 시간.
- `afm-input.json`, `afm-output.jsonl`: 짧은 비교 요청과 모델 이름·응답.
- `review.md`: 검토자가 읽을 목록. 별도 검토 결과는 `review-decisions.json` 등으로 기록한다.

- 시간의 유한성·순서·길이와 AFM의 ID·분류 enum·누락·중복을 검사한다.
- AFM 실패는 명시하고 STT·후보를 보존한다. `sameReading`도 후보를 제거하지 않는다.
- AFM은 시각을 생성하지 않는다. 여러 발음의 STT run은 시간을 균등 분배하지 않는다. `confirmed`는 변경하지 않는다.

<a id="apple-local-review--경계-후보의-의미"></a>

### 경계 후보의 의미

`boundaries.py`는 원문과 텍스트가 같아도 시간 경계를 검사한다. 단일 문자 STT run이 0.8초 이상이거나 사용자 청취 앵커와 연결되면 후보로 삼는다. 0.8초는 오류 확정 기준이 아니다.

기존 시작 부근의 서로 다른 두 지점에서 잘라 재전사한다. 발음이 잘릴 수 있으므로 늦은 결과를 자동 채택하지 않는다. 해당 범위에 동일 문자가 정확히 하나이고 클립 시작에서 0.12초 이상 떨어진 결과만 비교한다. 누락·중복·잘린 시작은 근거 부족으로 남긴다.

- 기존/재전사 시작의 차이가 0.2초를 넘으면 `context_sensitive`.
- 유효 결과가 두 개이고 차이가 작으면 `stable_in_tested_windows`지만 정확성 확인은 아님.
- 다른 경우 `insufficient_evidence`.
- 모든 경계 후보는 `needsReview=true`, `autoApply=false`. AFM 판단이 이를 해제하지 않는다.

사용자 앵커는 manifest의 `anchors` 배열로 제공하며 STT와 합치거나 덮어쓰지 않는다. 미매칭 앵커도 report의 unmatchedListeningAnchors에 남긴다.

앵커 입력 예시는 [워크플로우](../../how-to/use-apple-local-tools.md#apple-local-workflow--청취-앵커-입력)를 따른다.

`tools/apple-local/reconcile_alignment.py`는 호출 방식에 따라 범위가 다르다.

| 호출 방식                              | 입력과 범위                                                                                                                                                                                                |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reconcile(units, runs, anchors)` 함수 | 호출자가 제공한 앵커로 추정 결과를 결합한다.                                                                                                                                                               |
| CLI                                    | Real Paradis v2 당시 결과의 재현용이다. 기존 `--directory` 입출력을 유지하며 [곡별 앵커 프로필](../../../tools/apple-local/profiles/real-paradis-alignment-v2.json)의 확인 시각·글자·`confirmed`를 읽는다. |

이 곡별 프로필은 새 곡의 기본값이 아니다. `review:local`의 manifest 앵커와 구분한다.
사용 범위는 [기존 결과 재현 절차](../../how-to/use-apple-local-tools.md#apple-local-workflow--기존-정렬-결과-재현)를 따른다.

## 제작 도구의 엔진 정보

새 Loveholic 진단은 설치된 `opensheetmusicdisplay/package.json` 버전을 기록한다. 붉은 노을 재제작은 해당 버전의 `-release`와 실제 렌더 관측값을 대조하고 기하·정본 보존을 검사한다. 과거 진단 버전·지원 한계의 최초 발견 시점은 바꾸지 않는다.
