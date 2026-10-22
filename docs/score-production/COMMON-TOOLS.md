# 공통 제작 도구와 곡별 판독

2026-10-23 사용자 승인에 따른 구현 기록. 시작 HEAD: `8caa377`.

- 목표: 반복 제작 처리를 공통 코드로 옮기고 곡별 설정·판독을 분리한다.
- 범위: `tools/score-production/musicxml`, 제작 스킬·문서 및 집중 회귀 검사.
- 완료 조건: 기존 실행 진입점 유지, 공통 코드의 실제 호출, 기존 악보·MIDI·음원/패키지 내용 보존 확인.
- 제외: 앱 기능·저장 DB·수록곡 수정, 커밋·푸시·발행, 새 악보 작곡.
- 검증: 보존된 원본/산출물과 변경 전 소스 기준의 재생성 비교, 공통 API 왕복, 기존 검사 및 스킬 검증.

## 구현 순서

1. 패키지 조립·결과 저장과 파일 식별.
2. MusicXML 규격/시간 검사, 곡별 기대값과 설정.
3. MIDI 이벤트/파일 및 SoCal·Portland 렌더링.
4. 음원 특징/가사 후보 계산의 공통 부분, 스킬 연결, 회귀 결과 기록.

기존 산출물과 입력은 변경하지 않고 `data/production/common-refactor-20261023/`에 새 검증 결과를 둔다. 기존 결과의 해시 목록과 변경 전 소스는 이 폴더에 보존했다. 원본에서 독립적으로 읽은 기대값을 생성기 출력으로 대체하지 않는다. PDF 기호 판독과 자유로운 엔딩·가사 위치 판단은 곡별 근거와 함께 유지한다.

## 구현된 경계

| 역할 | 코드/자료 | 입력과 책임 |
|---|---|---|
| 원본 사본·해시·PDF 페이지 준비 | `prepare_inputs.py`, `common/artifacts.py` | 지정한 원본을 새 폴더에 보존. 선택한 DPI로 원본 PDF만 래스터화 |
| 정본 조립·패키지 왕복 | `common/package.mjs` | 기존 앱 API 호출. 전체 Song/XML, 원본 음원·악보, 모든 페이지와 대체 악보 비교 |
| 결과 파일 저장 | `common/evidence.py` | 기존 `/render`, `/package`, `/artifacts` 요청과 로컬 출력명. 앱 서버는 계속 5173이며 별도 포트는 파일 수신기 |
| 제작 계측 | `measure_production.py`, `common/measurement.py` | 실제 시작·단계와 요청별 사용량 메타데이터를 집계. 원시 대화 보존·상시 polling 없음. 단가/로그 범위/마감 시각 명시 |
| 공통 검수 화면 | `common/review.mjs` | 기존 앱 표시 함수와 원본 시스템 구분을 사용하는 일시 화면. 가사 앵커/배치·해제 확인, DB 쓰기 없음 |
| 인계문 조립 | `handoff_production.py`, `common/handoff.py` | 실제 파일·해시와 후보에 결합된 기존 검증 근거. 전송·수신자 수록/청취는 별도 상태 |
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

### 공통 패키지 API

- `prepareCanonical(song, sourceXML, audioHash, editDocument?)`: 기존 정본 writer → 중복 표제 정리 → 선택적 곡 메타정보 부가 → 재읽기/마디 시간 비교. 반환은 `{ canonicalXML, restored }`.
- `bindRenderedScore(song, rendered)`: 현재 앱 renderer의 결과를 기존 마디 ID에 연결. 시작/끝 시각은 유지.
- `createVerifiedPackage(record)`: 기존 앱의 생성/읽기 API를 실행하고 모든 자산과 의미를 비교한 Blob 반환.
- `sha`, `base64`, `saveEvidence`: 바이트 식별·전달 공통 처리. 파일 저장은 현재 로컬 승인 범위에서 별도 호출.

네 곡의 패키지 어댑터가 이 경로를 실제 호출한다. 추가 가사 검수·스티킹 표시·청취 검사는 각 어댑터에 남는다. Loveholic의 초기 `build`와 후속 `refresh`/가사 보정은 각각의 목적을 유지한다. 기존 정본을 가져와 왕복 검사하는 것은 최신 렌더링·청취 검사와 별개다.

후속 실제 변환인 [I.O.I 갑자기](IOI-SUDDENLY-CONVERSION.md)에도 적용했다. 이 곡은 `ioi_suddenly_*` 어댑터와 `profiles/ioi-suddenly-*.json`으로 원본/가사/음원 판독을 분리한다. 실제 Vite 브라우저에서 발견한 `projectBase` 끝 `/` 누락을 공통 모듈에서 보정했고, 기존 패키지 4곡의 5검사를 다시 통과했다. Node 경로 해석만으로 브라우저의 변환 URL 계약을 검증한 것으로 간주하지 않는다.

### 새 곡에서 할 일

반복 계측·검수 화면·인계 준비는 [실행 안내](REUSABLE-PRODUCTION-WORKFLOW.md)를 따른다. I.O.I 회고에서 확인한 임시 화면/경로 오류와 계측 전담 비용을 줄이기 위한 공통 실행 경로이며 음악적 검증 기준을 낮추지 않는다.

1. 원본·기존 결과를 식별하고, `profiles/songs.json`에 이번 작업에 필요한 설정만 추가한다. 다른 곡의 `firstBeat`나 BPM을 기본값으로 복사하지 않는다.
2. 새로운 PDF 양식이면 대표 구간을 판독하고, 필요할 때 양식별 어댑터를 만든다. 음표 시작/길이·악기·성부를 해독한 데이터와 독립 원본 기대값을 별도로 보존한다.
3. 확인한 가사 위치·음원 연결·교정 사항과 불확실성을 곡별 근거에 적는다. 후보 계산은 공통 코드에, 후보 채택 이유는 판독 자료에 둔다.
4. 공통 규격 검사·정본/패키지 API를 호출한다. 확정된 입력으로 새 폴더에 생성하고 기존 결과와 검증한다.
5. 제작 완료 후 자동 인계 절차를 따른다. 도구 리팩터링만으로 새 악보를 제작/수록한 것으로 간주하지 않는다.

### 실행 예시

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

## 검증 결과 — 2026-10-23

환경: 시작 HEAD `8caa377`, 번들 Python 3.12(`lxml`/`numpy`/`pdfplumber`/`Pillow`), 설치된 ffmpeg/Poppler, 저장소 Node 의존성. 스킬 검증에는 PyYAML이 있는 시스템 Python 3.14를 사용했다.

- Python 집중 검사 13개 통과: 기존 원본 오류 검출 9개 + 공통 규격/시간·MIDI·결과 저장 4개. Real Paradis 110마디/441박, Loveholic 123/492, 붉은 노을 137/550, 손풀기 96/384, 탐탐 28/112의 최종 MusicXML을 확인했다.
- TypeScript 4파일 40개 통과: 기존 canonical/XML/package 검사와 실제 완성 패키지 4곡의 공통 코드 왕복 5개. 전체 Song·가사·시각·XML·원본 음원/악보·모든 페이지·대체 악보가 유지되며 다른 곡/음원/페이지 대입은 검출했다.
- 손풀기·탐탐: 변경 전 코드와 같은 입력으로 생성한 XML·MIDI·이벤트 JSON·구성 JSON·생성 감사 JSON이 각각 바이트 일치. SoCal·Portland WAV/MP3는 보존 음원과 바이트 일치.
- Loveholic·붉은 노을: 변경 전/후 XML exporter의 같은 입력 결과가 바이트 일치. Loveholic은 PDF 전체 재추출·123마디 검증·독립 대표 리듬·기존 오류 주입 5종도 통과.
- 음원 분석: Loveholic 전곡 분석 JSON의 변경 전/후 바이트 일치. 붉은 노을의 변경된 특징 추출 부분은 전체 음원의 시각·특징 배열·길이가 정확히 일치. 자유 엔딩 판단을 새로 확정하지 않았다.
- 가사: Loveholic `printed-note-lyrics.json`과 원본 위치 검수 PNG 3장이 변경 전/후 바이트 일치.
- 최초 보존 목록에 있는 XML/MIDI/MP3/drumscore 25파일은 작업 후 모두 같은 해시. 새 결과는 별도 검증 폴더에만 저장.
- 변경 JS/TS lint, 도구 TypeScript 검사, 소스 경계 검사, 문서 링크 검사, 스킬 구조 검사, `git diff --check` 통과.

근거: 로컬 `data/production/common-refactor-20261023/verification-summary.json`, `generation-comparison.json`, `adapter-comparison.json`, `lyrics-comparison.json`, `original-hashes.json`. 새 출력과 변경 전 소스도 같은 폴더에 보존한다. 패키지 ZIP은 생성 시각 때문에 컨테이너 해시 대신 재읽은 의미와 모든 자산 바이트를 비교했다. GUI 화면 재검수·실기기 청취·앱 수록·공개 배포는 이번 코드 보존 검사의 범위가 아니다.

### 검증 중 확인한 재현 조건

- 시스템 Python에는 lxml이, 번들 Python에는 PyYAML이 없었다. 도구별로 실제 의존성이 있는 인터프리터를 사용했으며 설치나 전역 환경 변경은 하지 않았다.
- Loveholic 판독기는 원본 래스터 페이지와 PDF/음원 해시 provenance를 선행 입력으로 요구한다. 처음 재실행에서 해당 파일 누락을 확인했고, 공통 `prepare_inputs.py --audio ... --raster-dpi 144`로 준비한 새 폴더에서 전곡 재생성·검증했다. PDF만 준비하면 이 곡 어댑터가 요구하는 음원 해시는 채워지지 않는다.
- 오래된 보존 초벌과 최신 생성 코드가 이미 달랐다. 손풀기 초벌에는 키트 가수란이 없었고, Loveholic 초벌에는 승인 전 Crash 분류와 half-open 처리 기록이 남아 있었다. 이 차이를 이번 리팩터링 회귀로 오인하지 않도록 변경 전 소스 재생성과 현재 완성 패키지를 기준으로 비교했다. 과거 파일은 수정하지 않았다.
- 공통 시간 검사에서 더 이른 단계에 ValueError가 발생한 두 기존 오류 주입 사례는 과거 `verify()`의 AssertionError 계약을 유지하도록 진입점에서 변환했다. 오류 판정 근거는 그대로 보존하고 기존 9검사를 다시 통과했다.

## 남겨 둔 곡별 판단

현재 공통 코드는 입력 양식을 자동으로 판독하는 범용 OMR이 아니다. PDF 기호 해석·원본별 성부/빔 구성, 추정 가사 채택, 자유 엔딩 연결, 연습곡 구성과 스티킹은 각각 어댑터·fixture·판독 근거가 맡는다. 해당 판단을 변경할 때에는 새 원본 대조가 필요하며 이번 코드 동등성 검사를 그 근거로 대신하지 않는다.
