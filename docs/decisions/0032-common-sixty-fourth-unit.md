---
status: accepted
date: 2026-11-12
---

# 음악적 위치·음가와 표시 이동의 기본 단위를 64분음표로 통일한다

## Context and Problem Statement

[ADR-0031](0031-shared-staff-notation-grid.md)은 모든 오선 부착 표기에 32분음표를 적용했다. 이후 정본 감사에서 이전 64분음표 단위의 표시 offset 9곳을 확인했다. 표시 이동만 64분음표로 두는 방안을 검토했으나, 사용자는 음악적 위치·음가까지 같은 단위로 통일하는 검토를 요청했다.

사용자는 그 검토를 승인하고 “64분음표를 공통기본단위로 하는 기준 문서 변경”을 지시했다. 이는 과거 64분음표 언급의 기억 착오를 정정했던 경위와 구분되는 새 결정이다.

## Considered Options

- 모든 표기의 기본 단위를 32분음표로 유지한다.
- 음악적 위치·음가는 32분음표, 표시 이동은 64분음표로 구분한다.
- 음악적 위치·음가와 허용된 표시 이동의 기본 단위를 64분음표로 통일한다.

## Decision Outcome

세 번째 방식을 채택하고 ADR-0031을 대체한다. 현행 규칙은 [제작 상위 Rule](../reference/score/production.md#score-production-rules--오선-부착-표기의-공통-기본단위)에 둔다. 4/4 한 마디는 64칸이며 기존 32분음표 값도 이동 없이 표현할 수 있다. 가사·균등 보기에만 한정하지 않는다.

이는 기본 표현 간격의 통일이다. 기존 음표·가사를 잘게 나누거나 격자로 반올림하는 결정이 아니다. 원본에 명시된 연음·점음표·더 세밀한 리듬은 정확한 분수로 보존한다. 표시 이동은 음악적 적용 시점을 바꾸지 않는다.

### Consequences

- 단위를 나눈 두 규칙 대신 하나의 기준을 참조한다. 기존 음가·박·원본·메타정보와 단위를 표현할 수 있는 XML은 유지한다.
- MusicXML의 `divisions`는 필요한 분수 리듬을 표현하도록 선택한다. 16으로 일괄 고정하지 않는다.
- 가사 검사·편집 입력·PDF 판독·균등 조판과 진행선의 구현을 함께 대조해야 한다. 문서 승인과 코드 반영·실제 출력 검증은 별도다.
- [ADR-0030](0030-distinct-lyric-onsets.md)의 시작점 중복 금지와 [ADR-0009](0009-musicxml-section-direction-layout.md)의 적용 박 보존·최소 여백·줄 제한은 유지한다. 기존 위치 오류나 판독 근거 부족을 단위 변경으로 해결됐다고 판단하지 않는다.
- 이번 실행 범위는 기준·절차·스킬·결정 이력의 문서화다. 악보·앱·제작 도구 코드·패키지를 자동 변경하지 않는다.

### Confirmation

변경·검증과 구현 미반영 사항은 [문서화 기록](../records/archive/staff-grid64-rule-20261112.md)에 둔다. 기존 6곡의 분수 시간 검토와 원본 대조의 범위를 구분하며, 실제 화면·편집·저장 지원을 검증 완료로 표시하지 않는다.

## More Information

- [대체 전 상위 결정 ADR-0031](0031-shared-staff-notation-grid.md)
- [기존 정본 감사](../records/archive/canonical-rule-audit-20261112.md)
- [MusicXML divisions](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/divisions/): 사분음표 기준의 분수 표현과 연음 고려
- [MusicXML time-modification](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/time-modification/): 연음 등의 음가 비율
