---
status: accepted
date: 2026-11-10
---

# 가사는 같은 드럼 파트·보표의 독립 성부에 저장한다

## Context and Problem Statement

독립 가사 파트를 OSMD로 출력하면 보표 하나가 추가되어 드럼 악보·크레센도·가사 사이의 간격이 커졌다. 사용자는 갑자기 한 곡으로 같은 드럼 보표의 가사 성부를 시험했고, 출력 확인 후 이 방식을 정본으로 채택했다.

## Considered Options

- 별도 `DrumPracticeLyrics` 파트와 가사 보표를 유지한다.
- 가사를 가까운 드럼 음표에 옮긴다.
- 같은 드럼 파트·보표 안에 독립 가사 성부를 둔다.

## Decision Outcome

세 번째 방식을 채택한다. 가사 onset·음가를 드럼 리듬과 독립적으로 보존하며 새 저장은 `drum-practice:score:v2`로 구분한다. 순차 가사는 성부를 재사용하고 겹치는 가사는 별도 성부로 나눈다. 표준 숨긴 음표의 `lyric`은 OSMD 기본 기능으로 드럼 보표 아래에 출력한다. 원본 음표로 스냅하거나 숨긴 보표를 SVG에서 지우는 방식은 사용하지 않는다.

[ADR-0012](0012-musicxml-canonical-source.md)의 별도 파트 작성 방식과 [ADR-0013](0013-score-based-lyric-positions.md)의 저장 위치만 대체한다. MusicXML 정본, 악보 기준 가사 위치, 음원 연결·마디 문구·원래 보컬 파트 보존은 유지한다. 악보가 없는 기존 음원/PDF 자료에 드럼 음표를 새로 만들지는 않는다.

### Consequences

- v1을 계속 읽으며 일반 저장 시 공통 작성기를 통해 v2로 전환한다. 열기만으로 기존 파일·패키지·DB를 일괄 덮어쓰지 않는다. 사용자가 별도로 승인한 현행 정본·앱 수록 패키지 전환은 [후속 작업](../plans/shared-staff-lyrics-20261110.md#후속-작업--현행-악보-전체와-두-앱-반영)으로 구분하고, 변환 전 자료와 검증 근거를 보존한다.
- v1 파일의 전체 보기는 같은 성부 작성 모듈을 읽기용 사본에 사용한다. 제작기 전용 저장 모듈은 재생앱에 넣지 않는다.
- 성부 번호와 음절 ID를 분리해야 하며 반복 저장 때 이전 가사 블록만 교체한다.
- 새 v2 정본을 모르는 이전 앱 버전으로 다시 저장하는 것은 지원하지 않는다. 구형 앱에서 사용하던 원본은 그대로 보존한다.

### Confirmation

[시험 기록](../records/archive/suddenly-lyric-voice-trial-20261110.md)은 갑자기의 XSD·음악 의미·301음절·7마디 문구·OSMD 단일 보표 출력을 확인했다. 동시 음절과 마디 연장은 그 곡에 없었다. 운영 구현의 집중 검사 결과와 미실행 범위는 [실행 계획](../plans/shared-staff-lyrics-20261110.md)과 [history](../../history.md)에 별도로 기록한다. 채택 결정은 전곡·실기기·청취·배포 검증 완료를 뜻하지 않는다.

## More Information

- 현행 [저장 계약](../reference/score/musicxml.md#musicxml-canonical--저장-계약), [전체 보기 가사](../reference/score/rendering.md#svg-score-rules--전체-보기-가사).
- MusicXML의 [voice](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/voice/)는 한 파트 안의 독립된 시간 흐름을 구분한다. [note](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/note/)의 `print-object`, `print-lyric`, `dynamics`를 사용하며 비표준 음악 요소를 만들지 않는다.

후속 [ADR-0030](0030-distinct-lyric-onsets.md)은 새 제작 정본의 서로 다른 음절에 같은 시작을 허용하지 않는다. 이 ADR의 독립 성부·길이 중첩 표현과 구형 동시 시작의 읽기/보존은 유지한다.
