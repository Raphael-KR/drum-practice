---
status: accepted
date: 2026-10-23
---

# 일반 곡의 가수와 연습 악보의 드럼킷을 구분해 저장한다

## Context and Problem Statement

가수 없는 연습 악보의 빈칸·개별 곡 키트 표기에서 출발해 2026-10-06 모든 드럼 연습 악보에 선택 키트를 기록하는 규칙으로 일반화했다.

## Considered Options

* 연습 악보의 artist를 비우거나 특정 곡에만 키트를 쓴다.
* 모든 연습 악보에는 선택 드럼킷, 일반 곡에는 실제 아티스트를 쓴다.

## Decision Outcome

후자를 채택한다. MusicXML creator type=artist·Song.artist·패키지 내장 정본의 값을 일치시킨다. work-title·movement-title·display-title 및 작사/작곡 필드도 정본 계약대로 저장한다.

### Consequences

SoCal로 고정하지 않고 키트 선택 근거를 따른다. 강사·세션·참고 채널을 일반 곡 가수로 넣지 않는다. 과거 작품명/키트 목록은 당시 이력이며 삭제된16마디 작품의 복원이나 새 음원 제작을 지시하지 않는다.

### Confirmation

현재 계약은 [MusicXML 정본](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약), 입력은 [매핑 Rule](../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙)을 따른다. 아래 PASS·측정·기기 결과는 당시 범위이며 이번 문서 분리에서 앱 시험을 재실행하지 않았다.

## More Information


### MusicXML 입력 매핑·정본 계약에서 옮긴 근거 — 2026-10-23 이관

아래 원문은 당시 문맥·승인/검증 범위를 보존한다. 과거의 미확인·보류·HTML·시안 수치를 현재 지원이나 새 실행으로 해석하지 않는다. 현행 규칙은 입력 매핑·정본 계약·SVG Rule에서 확인한다.

- 원제는 work-title, 표시 제목은 movement-title 및 `drum-practice:display-title`, 제작자는 artist/composer/lyricist로 저장한다. 원래의 다른 메타정보/파트는 유지한다.

- **최신 사용자 결정(2026-10-06): 앞으로 제작하는 모든 드럼 연습 악보의 가수란(`artist`)에는 선택하여 사용하는 드럼킷 이름을 반드시 기록한다.** 예: `SoCal 드럼킷`, `Portland 드럼킷`. 개별 세 곡만의 예외가 아닌 공통 제작 규칙이다. 드럼킷은 [선택 기준](../reference/score/drum-kits.md#garageband-drum-kits--드럼킷-선택과-보존-라이브러리)에 따라 정하고 SoCal로 고정하지 않는다.

- 연습 악보의 키트 이름은 MusicXML `identification/creator type="artist"`와 파생 `Song.artist`에 동일하게 저장한다. 패키지를 만들면 내장 정본 XML과 Song의 값도 동일해야 한다. 제작·교정·재제작·저장 후 재읽기에서 누락이나 불일치를 확인한다. 이 메타정보 규칙이 요청하지 않은 음원 제작을 추가하는 것은 아니다.

- 일반 곡 악보의 `artist`는 실제 가수·아티스트를 유지한다. 세션 연주자·강사·참고 영상 채널은 가수로 입력하지 않는다. 참고 자료의 출처는 제작 문서에 보존한다.

- 결정 이력: 처음에는 가수 없는 연습악보를 비우기로 했으나, 탐탐 무빙16/28마디와 시작전 손플기에 드럼킷을 표기한 뒤 모든 드럼 연습 악보로 일반화했다. 이전 빈칸/개별 곡 한정 지침은 현재 제작 기준이 아니다. 기존 작품의 키트는 탐탐 무빙16마디/시작전 손플기=SoCal, 탐탐 무빙28마디=Portland이며 ID는 유지한다.


### Rule 재점검 원문 — MUSICXML-CANONICAL.md / 2

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
