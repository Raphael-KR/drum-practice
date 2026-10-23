---
status: accepted
date: 2026-10-23
---

# 명시적 beatTimes를 보존하며 연습 박은 일정하게 유지한다

## Context and Problem Statement

2026-10-15 붉은 노을의 재생 문제 수정·수록 범위에서 마디 시작/끝 보간만으로 표현하기 어려운 기존 음원 연결에 선택적 beatTimes를 추가했다. 이는 Loveholic의 일정 연결 정책과 구분된다.

## Considered Options

* 모든 마디를 시작/끝으로만 보간한다.
* 검증된 명시적 beatTimes가 있으면 사용하고 없으면 기존 보간을 유지한다.

## Decision Outcome

후자를 채택한다. 배열 길이·start 일치·엄격한 증가·end 미만 조건을 유지하고 Song.measures로 복원한다. 원곡 연결과 고정 BPM 연습 정규화를 구분한다.

### Consequences

기존 악보에 자동 추정값을 주입하지 않는다. 연결점 편집은 내부 박을 비례 이동하며 명시적 템포 재배치는 배열을 제거한다. recording-grid:v1은 제작 근거로만 보존하고 런타임이 임의 적용하지 않는다.

### Confirmation

현재 계약은 [MusicXML 정본](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약), 입력은 [매핑 Rule](../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙)을 따른다. 아래 PASS·측정·기기 결과는 당시 범위이며 이번 문서 분리에서 앱 시험을 재실행하지 않았다.

## More Information


### MusicXML 입력 매핑·정본 계약에서 옮긴 근거 — 2026-10-23 이관

아래 원문은 당시 문맥·승인/검증 범위를 보존한다. 과거의 미확인·보류·HTML·시안 수치를 현재 지원이나 새 실행으로 해석하지 않는다. 현행 규칙은 입력 매핑·정본 계약·SVG Rule에서 확인한다.

##### 악보의 박별 음원 연결 (2026-10-15)

- 사용자가 붉은 노을의 남은 재생 문제 수정·수록을 승인했다. `drum-practice:score:v1`의 마디에 선택적인 `beatTimes`를 저장하고 `Song.measures`로 복원한다. 배열 길이는 기보 박 수, 첫 값은 `start`, 이후 값은 엄격한 증가이며 모두 `end`보다 작아야 한다. 음가·박자표·가사 위치는 바꾸지 않는다.

- 배열이 없으면 기존 시작/끝 균등 보간을 유지한다. 기존 악보에 자동 추정 박을 주입하지 않는다. 위 Loveholic 일정 연결 정책은 유지한다.

- 원곡은 원본 1배속과 저장된 박 시각을 사용한다. 연습 모드는 박자표 분모를 반영한 사분음표 위치로 음원을 정규화하여 고정 BPM을 사용한다. 원곡의 현재 BPM은 완료된 최근 박 간격에서 계산한다.

- 시작/끝 연결점을 편집하면 내부 박 시각도 같은 비율로 이동한다. 명시적 전체 템포 재배치 및 XML 표준 템포 적용은 박별 배열을 제거하고 균등 연결로 바꾼다. 정본에 배열이 없으면 파생 캐시의 배열도 제거한다.

- 붉은 노을의 `drum-practice:recording-grid:v1`은 제작 추정의 근거만 보존한다. 런타임은 이 필드를 임의 적용하지 않는다. 해당 곡의 엔딩 추정과 실기기 청취 미확인은 [앱 반영 기록](../records/songs/red-sunset.md#red-sunset-app-integration--붉은-노을-앱-반영)에 구분한다.


### Rule 재점검 원문 — MUSICXML-CANONICAL.md / 5

출처: [docs/architecture/MUSICXML-CANONICAL.md](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> - `drum-practice:score:v1`의 마디에 선택적인 `beatTimes`를 저장하고 `Song.measures`로 복원한다. 배열 길이는 기보 박 수, 첫 값은 `start`, 이후 값은 엄격한 증가이며 모두 `end`보다 작아야 한다. 음가·박자표·가사 위치는 바꾸지 않는다.
> - 배열이 없으면 기존 시작/끝 균등 보간을 유지한다. 기존 악보에 자동 추정 박을 주입하지 않는다. 위 Loveholic 일정 연결 정책은 유지한다.
> - 원곡은 원본 1배속과 저장된 박 시각을 사용한다. 연습 모드는 박자표 분모를 반영한 사분음표 위치로 음원을 정규화하여 고정 BPM을 사용한다. 원곡의 현재 BPM은 완료된 최근 박 간격에서 계산한다.
> - 시작/끝 연결점을 편집하면 내부 박 시각도 같은 비율로 이동한다. 명시적 전체 템포 재배치 및 XML 표준 템포 적용은 박별 배열을 제거하고 균등 연결로 바꾼다. 정본에 배열이 없으면 파생 캐시의 배열도 제거한다.
> - 붉은 노을의 `drum-practice:recording-grid:v1`은 제작 추정의 근거만 보존한다. 런타임은 이 필드를 임의 적용하지 않는다.
