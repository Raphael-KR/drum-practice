---
status: accepted
date: 2026-10-23
---

# 재생용 여러 마디 wedge를 연속 기하로 연결한다

## Context and Problem Statement

한 마디 시스템으로 분해한 재생 조판에서 마디 끝 wedge가 축소되거나 여러 마디의 개방 폭이 끊겼다. 2026-10-03 v14 뒤 2026-10-23 v23이 연결을 보완했다.

## Considered Options

* 시스템마다 독립된 wedge 모양을 유지한다.
* 같은 ContinuousDynamic의 실제 시작/끝 박과 마디 폭으로 연결 기하를 계산한다.

## Decision Outcome

후자를 채택한다. native 계산·경계·skyline 단계에서 연결하며 음표·박·원본 XML과 인쇄 조판은 보존한다.

### Consequences

기하 공유점·디크레센도 방향·crop 경계를 함께 처리해야 한다. 곡명·마디별 SVG 좌표 패치를 사용하지 않는다.

### Confirmation

현재 기준은 [SVG 규칙](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙)을 따른다. 아래 검증·버전·수치는 당시 기록이며 이번 문서 이관에서 시험을 재실행한 결과가 아니다.

## More Information

아래는 분리 전 혼합 문서에서 옮긴 원문이다. 원문의 날짜·버전 순서와 위 Decision Outcome을 함께 읽는다. 과거의 ‘현재’, ‘미구현’, 초안 수치와 PASS는 당시 범위에만 적용한다.

#### 2026-10-03 크레셴도 마디 끝 오프셋 (v14)
- 재생용 한 줄/두 줄 조판에서 마디 끝까지 지정된 wedge는 해당 마디 끝까지 펼친다. MusicXML 정본과 인쇄 조판은 변경하지 않는다.
- OSMD 2.1.x의 종료 direction `EndOffsetFraction`이 마디 끝을 가리키면, 재생용 개별 시스템 조판에서 다음 시스템의 시작 좌표로 해석되어 최소 길이로 축소될 수 있다. 네이티브 계산 중 종료 앵커를 마지막 유효 시간 엔트리로 연결하여 OSMD의 마디 끝 확장을 사용한다. 계산 후 Timestamp/offset은 예외 발생 시에도 복원한다. 내부 종료점과 soft accent는 기존 처리 유지.
- 마디 crop에는 `.vf-measure` 바깥의 네이티브 wedge 선 영역도 포함한다. 음표 영역만으로 자르면 긴 wedge 윗선이 사라진다.
- 캐시 정책: `v14-wedge-end-and-crop`. 검증: history.md 및 `docs/experiments/wedge-end-offset-20261003/`.

#### 여러 마디 크레센도·디크레센도 연결 (2026-10-23)

- 연주용 한 마디 시스템은 화면에서 다시 이어지므로, 하나의 MusicXML wedge를 시스템마다 독립된 시작/중간/끝 모양으로 표시하지 않는다.
- 동일한 OSMD ContinuousDynamic으로 묶인 선들은 원래 시작/끝 박의 실제 음표 좌표와 표시 마디 폭을 기준으로 하나의 길이로 계산한다. 마디 경계에서 양쪽 선의 오선 상대 높이·개방 폭이 이어진다. 줄바꿈 시에도 이전 마디의 개방 폭을 유지한다.
- 네이티브 충돌 여유를 공통 오선 상대 중심선에 확보하고, 표현 정렬 후 시스템 높이/네이티브 SVG 생성 전에 OSMD 선 좌표와 경계·skyline을 갱신한다. 곡명·특정 마디 번호로 보정하지 않는다.
- 네이티브 PointF2D의 공유 꼭짓점을 분리하고, 디크레센도의 오른쪽→왼쪽 방향 계약을 유지한다. 한 마디 wedge·soft accent·텍스트 지시와 인쇄 조판은 기존 처리를 사용한다.
- 한 줄·두 줄·균등 간격이 같은 보정을 사용한다. 음표·박 좌표·원본 XML/PDF·저장 상태는 변경하지 않는다. 캐시 정책은 `v23-continuous-wedges`, 메타데이터 스키마 버전은1을 유지한다. 기존 저장곡은 두 앱의 공통 열기 경로에서 새 파생 자산을 생성한다.
- 구현: `src/modules/score/playback-wedges.ts`. 실제 갑자기·붉은 노을·러브홀릭 검증과 한계는 history.md를 따른다.
