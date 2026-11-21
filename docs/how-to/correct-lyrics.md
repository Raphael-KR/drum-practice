# 요청된 가사 교정

문서 역할: **실행 절차**. 현재 요청과 전역·프로젝트 지침의 승인 범위 안에서 수행한다. [정본 목록](../RULES-INDEX.md)과 [작업별 안내](../README.md)를 먼저 확인한다. 예시 명령·과거 기록은 이번 실행의 성공 증거가 아니다.

<a id="score-production-process--4-인쇄-가사-대조와-음악적-위치-저장"></a>

## 4. 인쇄 가사 대조와 음악적 위치 저장

**입력:** 원본 가사 문자·bbox, 마디 경계, 판독한 음표/쉼표 시작·음가. 제공된 보컬 악보가 있으면 함께 대조한다.

**수행 방법·도구:** [가사 기준](../reference/score/production.md#musicxml-conversion-policy--가사-기준--악보-우선)과 [정본 계약](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약)을 따른다. 문자/음절/영어 단어의 순서·줄·마디를 보존하고 실제 음표 또는 쉼표 underlay에 대응시킨다. 기존 `loveholic_printed_lyrics.py`·`loveholic_lyric_notes.py`는 해당 원본의 재현 도구로만 참고한다. 판독한 대응값은 [저장 계약](../reference/score/musicxml.md#musicxml-canonical--저장-계약)의 필드로 기록한다.

판독 추정에는 대상 음절·마디·근거 구절·선택한 위치·다른 가능성을 남긴다. 마디 귀속만 판독되는 경우에는 [마디 가사 계약](../reference/score/musicxml.md#measure-lyrics--마디-단위-인쇄-가사-계약)을 확인하고 그 한계를 보고한다. 음표 대응을 요구한 가사를 중앙 문구만으로 완료 처리하지 않는다. PDF 표시 좌표와 음악적 시작·길이는 별개로 다룬다.

**산출물:** 원문 보존 자료, 음절별 판독/추정표, 아래 절차로 확정한 묶음 XML과 대응표. 필요하면 원본 해시·region geometry와 lyricId/음악적 위치에 묶인 PDF 표시 anchor 근거를 작업 파일에 추가한다.

**완료 조건:** 묶기 전 문자·순서·마디·시작·음가는 작업 파일에 보존되고, 정본에는 최종 묶음 문구·첫 시작·필요 음가가 저장된다. 드럼 데이터·음원 연결은 가사 추가로 바뀌지 않는다. 허용된 표시 검수에서는 원본과 최종 묶음의 기준점을 대조한다. 가수의 실제 발음 시작/끝·길이, STT·CTC·LRC 검색은 완료 조건이 아니다.

**실패 시 확인:** [곡별 제작 기록 목록](../records/README.md#곡별-제작-기록)에서 인쇄 위치·문자 추출 등 같은 문제의 판독/교정 근거를 찾는다. 인쇄 위치를 가창 시간 측정으로 해석하거나 PDF의 가로 간격을 그대로 음가로 바꾸지 않는다.

<a id="final-lyric-groups"></a>

### 최종 가사 묶음 작성과 v3 전환

[최종 묶음 계약](../reference/score/musicxml.md#musicxml-canonical--최종-가사-묶음)을 읽고 다음 순서로 진행한다.

1. 현재 정본의 해시·마디·가사 수와 수록 목록을 대조한다. 원문·원음절 위치·확인 상태를 새 작업 폴더에 보존한다. v2 입력은 `lyric_groups.py prepare`로 XML 원문과 선택적 Song 사본, 분수 위치·음가와 메타정보를 추출한다.
2. `group_canonical_lyrics.mjs`로 공통 `groupLyrics`·`timePosition`·`timeMeasureWidth`를 호출한다. 저장소 Pretendard Regular를 설치된 `@napi-rs/canvas`에 등록해 실제 문구 폭을 측정한다. 글꼴 등록이 실패하면 다른 글꼴로 조용히 대체하지 않는다. 곡 ID는 보존한 `before-song.json`에서 읽으며, Song 사본이 없다면 한 작업 폴더에 `--song-id`를 명시한다.
3. 같은 도구가 [확정 교정](#confirmed-lyric-corrections)을 적용하고 앱의 `writeLyricVoices`로 v3 정본을 쓴다. `groups.json`의 구성 ID·측정 폭·좌표·문구와 코드/폰트 해시, 교정 적용 보고서, `work.json`의 원래 음절·제거 메타정보를 보존한다. 접수 자료가 있으면 `corrections.json`에 원본 바이트를 보존한다. 충돌 시 `candidate.musicxml`만 생성하고 실패로 종료한다. 가사 없는 곡은 빈 성부를 만들지 않고 manifest만 전환한다.
4. `lyric_groups.py verify`로 XSD·묶음의 시작/끝/문구/확인 상태, 원음절 ID의 완전 대응, 그리드·중복, 드럼/기타 XML·음원 연결 보존을 정적으로 대조한다. 실제 화면·앱 저장·패키지 검수는 현재 승인 범위에서 별도로 수행하고 미실행을 명시한다.
5. 새 정본·작업 파일·검사 보고서·한계를 기존 앱 담당에게 인계한다. 구형 앱 데이터·패키지·캐시 정리는 앱 담당이 맡는다.

```sh
python3 tools/score-production/musicxml/lyric_groups.py prepare --xml /absolute/v2-score.musicxml --song /absolute/song.json --out /absolute/new-work-directory
node tools/score-production/musicxml/group_canonical_lyrics.mjs /absolute/new-work-directory
python3 tools/score-production/musicxml/lyric_groups.py verify --out /absolute/new-work-directory --schema data/reference/musicxml/schema
```

`python3`는 [검증된 실행 환경](produce-score.md#score-tools--실행-예시)을 뜻한다. 기존 곡의 전환 목록은 `profiles/lyric-groups-20261113.json`에 있으며, 다른 곡에 고정 경로를 복사하지 않는다. v2는 제작 중간 자료일 뿐 앱 수록용 최종 형식이 아니다.

신규 판독 어댑터의 브라우저 제작 경로는 `prepareProductionCanonical`을 사용한다. 반환된 `lyricWork`를 로컬 근거 수신기로 전달해 작업 파일에 보존한다. 기존 5개 패키지 어댑터는 이를 `package-audit.json`에 저장한다. 이미 확정한 묶음은 `prepareCanonical`로 저장하며 원음절로 취급해 다시 묶지 않는다. 신규 제작과 기존 v2 이전 모두 `common/lyric-group-data.mjs`를 통해 앱의 묶음·좌표 함수를 사용한다.

<a id="confirmed-lyric-corrections"></a>

### 악보제작기에서 확정한 교정을 재제작에 반영

[확정 교정 저장 계약](../reference/score/file-formats.md#confirmed-lyric-corrections)을 읽고 아래 순서로 진행한다. 현행 구현 상태는 [작업대·파일 저장 계획](../plans/score-editor-workflow-20261114.md), 구형 봉투 도입 기록은 [이전 계획](../plans/confirmed-lyric-corrections-20261113.md)을 확인한다.

사용자의 전체 검수와 직접 편집 또는 채팅 지시를 통한 가사 교정은 [공동작업 워크플로우](collaborate-on-score.md#shared-score-workflow)를 따른다. 아래 재적용 경로는 곡별 파일 프로젝트의 확정 이력을 먼저 읽고, 프로젝트가 없을 때만 구형 접수 봉투를 읽는다. 이 기술 절차를 사용자가 다시 작성하는 요청서로 만들지 않는다.

1. 작업대에서 저장을 확정한다. 변경 전후 위치·문구·확정 시각은 같은 프로젝트 저장본의 가사 교정 이력에 기록한다. 파일 저장과 제작자 알림은 구분한다.
2. 안정된 곡 ID로 `data/production/projects/<songId>/project.json`의 확정 저장본과 누적 교정을 읽는다. 공통 store가 마지막 가사 교정의 결과 해시와 일치하는 보존 XML을 찾아 같은 검증 봉투로 제공한다. 후속 메타정보 저장·초안을 교정 XML로 대체하지 않는다. 프로젝트가 없을 때만 `data/production/lyric-corrections/<encodeURIComponent(songId)>/latest.json`으로 넘어간다. 교정 없음과 손상·읽기 실패를 구분한다.
3. 원본 판독 결과를 공통 함수로 묶은 뒤 확정 교정을 적용한다. 현행 정본의 묶음을 교정할 때는 원음절로 재해석해 다시 묶지 않는다. 시간 정보는 음원 초나 SVG 좌표가 아닌 마디 ID·사분음표 기준 시작/길이를 사용한다.
4. 적용·이미 반영·충돌 결과를 작업 보고서에 보존한다. 대상 ID나 이전 문구·위치가 달라진 항목은 기록된 이전/새 값과 현재값을 대조한다. 문자열 유사도로 대상을 바꾸거나 다른 가사까지 같은 만큼 이동하지 않는다. 충돌 없는 항목은 진행하고 충돌이 남은 후보를 완성본으로 인계하지 않는다.
5. 새 정본을 재읽어 확정 위치와 대조하고 기존 드럼·다른 가사·음원 연결을 확인한다. 실제 수행한 검사 범위와 미검증을 기록한 뒤 [완성본 인계](produce-score.md#score-production-process--8-결과-인계와-제작-종료)를 따른다. 프로젝트의 파일 접수를 채팅 전달·앱 수록 완료로 표시하지 않는다.

현행 v3 정본에는 다음 CLI를 사용한다. 출력 디렉터리는 존재하지 않는 새 경로를 지정한다.

```sh
node tools/score-production/musicxml/apply_lyric_corrections.mjs --xml /absolute/current-score.musicxml --song-id ioi-suddenly-25750839 --out /absolute/new-corrected-score
```

곡 ID는 입력 정본과 연결된 실제 Song에서 확인한다. 위 ID는 갑자기 예시이며 다른 곡에 복사하지 않는다. 자동 프로젝트/구형 접수 조회 대신 보존한 봉투를 명시하려면 `--corrections /absolute/latest.json`, 판본 변경으로 승인된 ID 대응이 있으면 `--id-map /absolute/approved-id-map.json`을 추가한다. 대응 파일은 `{"이전 ID":"현재 ID"}` 형태이며 이름·문구 유사도로 자동 작성하지 않는다.

- `before.musicxml`, `corrections.json`, 선택적 `id-map.json`: 실행에 사용한 자료 사본.
- `correction-report.json`: 입력/출력·접수 자료·코드 해시, 적용·이미 반영·충돌, 실제 전후 변경.
- `score.musicxml`: 충돌 없는 결과. 파일 프로젝트에 확정 가사 이력이 없거나 프로젝트와 구형 봉투 모두 없으면 `status: none`으로 원본을 그대로 보존한다.
- `candidate.musicxml`: 일부 충돌이 남은 결과. 종료 코드 2이며 완성본 인계 대상이 아니다. 현재 위치와 이력을 대조한 뒤 명시적 대응 또는 사용자 판단으로 해결한다.

브라우저 제작은 `/api/score-projects/:id/corrections`로 같은 확정 교정 입력을 읽고 `prepareProductionCanonical`에서 공통 적용 함수를 호출한다. 프로젝트가 없는 명시적 404만 구형 봉투 조회로 넘기며 다른 오류는 누락으로 취급하지 않는다. 충돌 보고서가 있는 오류가 발생하면 패키지 생성을 중단하고 위 CLI의 후보·보고서 경로로 검토한다. `package-audit.json`의 `lyricWork`에는 접수 봉투와 적용 보고서가 함께 보존된다. 이 절은 실행 절차이며 형식은 공통 타입과 [완성 파일 계약](../reference/score/file-formats.md)을 따른다.

<a id="lyric-onset-audit"></a>

### 현행 정본의 가사 시작점 검사와 교정

1. 곡별 기록의 최신 제작 경로·파일 해시·수록 XML을 대조한다. 수록 외 제작 중 정본도 목록에 포함하고, 원본/구판/실험/복사 별칭의 포함·제외 근거를 남긴다.
2. [시작점 계약](../reference/score/musicxml.md#musicxml-canonical--서로-다른-음절의-시작점)에 따라 아래 공통 CLI로 실제 XML을 검사한다. 보관 v1·v2는 원음절, v3는 최종 묶음이 검사 단위다. 실행 전 [구현 상태](../records/archive/staff-grid64-rule-20261112.md#implementation-status)와 결과 JSON의 기준 단위를 확인한다. 곡·마디·ID·유리수 시작값과 음가 이탈을 확인하고 독립된 곡은 계속한다.

   ```sh
   python3 tools/score-production/musicxml/audit_lyric_onsets.py /absolute/current-score.musicxml --out /absolute/audit.json
   ```

   현재 `grid64`는 시작·길이를 사분음표의 1/16로 판정한다. 과거 `grid32` 보고서는 당시 결과로 보존한다. 이탈은 원본의 연음·세부 리듬인지 확인하고 근거를 남긴다. 그리드 판정만으로 정본을 옮기거나 반올림하지 않는다.

3. 원본·구절 순서·과거 판독/교정 기록을 대조하고 곡별 교정표에 ID·이전/새 위치·필요한 길이·판단 근거를 기록한다. 검사기는 위치를 자동 결정하지 않는다. 이미 중복 없는 음절의 위치를 함께 재양자화하지 않는다.
4. 원본을 보존한 새 경로에서 [최종 묶음 작성](#final-lyric-groups)과 공통 정본 writer/reader를 사용한다. XSD·시작점 재검사·원문/묶음 대응·길이/마디 연장·드럼 시간축·음원/메타정보를 대조한다. 같은 시작점과 길이 중첩을 별도로 보고한다. 반복 저장과 실제 표시는 허용된 검사 범위에서 확인한다.
5. 곡별 최종 경로·SHA·잔여 중복·검사 범위와 실제 출력/청취 미검증을 구분해 기존 앱 담당에게 인계한다. app/public/DB에 임의 적용하지 않는다.

<a id="score-production-process--보컬-musicxml-입력"></a>

### 보컬 MusicXML 입력

[보컬 입력 계약](../reference/score/musicxml.md#musicxml-canonical--보컬-악보-입력)을 확인한 뒤 가사 편집 → 보컬 MusicXML 가져오기 → 파트 선택 순서로 진행한다. 마디 수·박자표·전주/반복 순서를 대조하고 교체 확인을 받는다. 원래 보컬 파트·이전 가사·음절별 리듬을 작업 파일에 보존하고 [최종 묶음](#final-lyric-groups)을 같은 드럼 보표의 독립 가사 성부에 저장한다. 구판은 제작 단계에서 전환하며 앱에서 열기만으로 몰래 갱신하지 않는다.

## 수동 피드백을 별도로 요청받았을 때

1. [선택적 수동 교정 계약](../reference/score/production.md#lyric-feedback-rules--수동-가사-싱크-피드백-접수)을 확인한다. 일반 PDF 변환에 실제 가창 검증을 추가하지 않는다.
2. 곡·판본·마디·박·음절 ID와 사용자 전달 원문을 해당 곡의 기록에 접수한다. 인쇄 위치 교정과 음원 시각 피드백을 구분한다.
3. [피드백 Rule](../reference/score/production.md#lyric-feedback-rules--수동-가사-싱크-피드백-접수)의 누적·일괄 적용 범위와 최신 확인 경계를 대조한다. 중복·이전 접수와 최신 정정을 기록하고, 사용자 요청과 확인된 범위대로 적용한다.
4. 적용을 요청받으면 정본의 음악적 위치와 파생 캐시를 함께 확인하고 저장·재읽기, 실제 표시를 검수한다. 미반영·추정·청취 미확인을 완료로 바꾸지 않는다.

이전 접수·교정 사례는 [곡별 제작 기록 목록](../records/README.md#곡별-제작-기록)에서 확인한다.
