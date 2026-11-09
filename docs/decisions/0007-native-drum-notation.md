---
status: accepted
date: 2026-11-09
---

# 확정 범례와 음악 구조를 유지하며 native 기호를 보완한다

## Context and Problem Statement

2026-10-03에 원 안 X·오픈 하이햇 예외와 공통 범례 적용 범위를 정정했다. 후속 작업은 스티킹 줄기 좌표와 반복 연음 숫자를 보완했다.

## Considered Options

* 곡별 빈 머리·원 확대 예외를 적용하고 성부를 자동 재구성한다.
* 확정 범례만 표준화하고 성부·화음·줄기·빔·쉼표 구조는 보존한다.

## Decision Outcome

후자를 채택한다. v16 공통 범례와 v17 구조 보존이 v12/v13/v15의 기호 예외 및 v16 자동 킥 성부 분리를 대체한다. 보완의 범위는 규칙 §5를 따른다.

### Consequences

고스트·스티킹·SMuFL 보완은 승인 범위에서만 사용한다. 과거 표의16px serif 지정은 이후 모든 악보 텍스트 Pretendard 결정(ADR-0010)으로 대체되며 스티킹의 크기·음표 연결은 유지한다.

### Confirmation

현재 기준은 [SVG 규칙](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙)을 따른다. 아래 검증·버전·수치는 당시 기록이며 이번 문서 이관에서 시험을 재실행한 결과가 아니다.

## More Information

[이관 원문과 당시 검증 기록](../records/archive/adr-0007-native-drum-notation-sources.md)을 별도 보존한다. 결정 요약과 승인 범위는 유지하며, 과거 원문은 현재 동작이나 이번 검증 결과가 아니다.

<details>
<summary>기존 원문 문단 주소</summary>

- <a id="5-음표주법-보완"></a>[5. 음표·주법 보완 원문](../records/archive/adr-0007-native-drum-notation-sources.md#5-음표주법-보완)
- <a id="드럼-연결선의-높이-방향-2026-10-03-승인적용"></a>[드럼 연결선의 높이 방향 (2026-10-03 승인·적용) 원문](../records/archive/adr-0007-native-drum-notation-sources.md#드럼-연결선의-높이-방향-2026-10-03-승인적용)
- <a id="원-안-x의-가독성-2026-10-03-사용자-승인"></a>[원 안 X의 가독성 (2026-10-03 사용자 승인) 원문](../records/archive/adr-0007-native-drum-notation-sources.md#원-안-x의-가독성-2026-10-03-사용자-승인)
- <a id="심벌하프오픈-기호의-세로-여백-2026-10-03-승인"></a>[심벌·하프오픈 기호의 세로 여백 (2026-10-03 승인) 원문](../records/archive/adr-0007-native-drum-notation-sources.md#심벌하프오픈-기호의-세로-여백-2026-10-03-승인)
- <a id="2026-10-03-바람과-언덕-오픈-하이햇-복원-v15"></a>[2026-10-03 바람과 언덕 오픈 하이햇 복원 (v15) 원문](../records/archive/adr-0007-native-drum-notation-sources.md#2026-10-03-바람과-언덕-오픈-하이햇-복원-v15)
- <a id="2026-10-03-공통-범례-복구-v16-앞선-v12v13v15-기호-예외-대체"></a>[2026-10-03 공통 범례 복구 (v16, 앞선 v12/v13/v15 기호 예외 대체) 원문](../records/archive/adr-0007-native-drum-notation-sources.md#2026-10-03-공통-범례-복구-v16-앞선-v12v13v15-기호-예외-대체)
- <a id="2026-10-03-범례-적용-범위-정정-v17"></a>[2026-10-03 범례 적용 범위 정정 (v17) 원문](../records/archive/adr-0007-native-drum-notation-sources.md#2026-10-03-범례-적용-범위-정정-v17)
- <a id="2026-10-06-탐탐-무빙-스티킹-줄기-위치-교정"></a>[2026-10-06 탐탐 무빙 스티킹 줄기 위치 교정 원문](../records/archive/adr-0007-native-drum-notation-sources.md#2026-10-06-탐탐-무빙-스티킹-줄기-위치-교정)
- <a id="musicxml-입력-매핑정본-계약에서-옮긴-근거--2026-10-23-이관"></a>[MusicXML 입력 매핑·정본 계약에서 옮긴 근거 — 2026-10-23 이관 원문](../records/archive/adr-0007-native-drum-notation-sources.md#musicxml-입력-매핑정본-계약에서-옮긴-근거--2026-10-23-이관)
- <a id="악보의-musicxml--osmd-매핑-방식"></a>[악보의 MusicXML · OSMD 매핑 방식 원문](../records/archive/adr-0007-native-drum-notation-sources.md#악보의-musicxml--osmd-매핑-방식)
- <a id="읽는-순서와-상태-구분"></a>[읽는 순서와 상태 구분 원문](../records/archive/adr-0007-native-drum-notation-sources.md#읽는-순서와-상태-구분)
- <a id="확정-범례--사용자-결정-2026-09-20"></a>[확정 범례 — 사용자 결정 2026-09-20 원문](../records/archive/adr-0007-native-drum-notation-sources.md#확정-범례--사용자-결정-2026-09-20)
- <a id="반열림-하이햇의-공식-표기-경로--2026-10-03"></a>[반열림 하이햇의 공식 표기 경로 — 2026-10-03 원문](../records/archive/adr-0007-native-drum-notation-sources.md#반열림-하이햇의-공식-표기-경로--2026-10-03)
- <a id="한쪽-범례에만-있는-항목"></a>[한쪽 범례에만 있는 항목 원문](../records/archive/adr-0007-native-drum-notation-sources.md#한쪽-범례에만-있는-항목)
- <a id="목적과-적용-원칙"></a>[목적과 적용 원칙 원문](../records/archive/adr-0007-native-drum-notation-sources.md#목적과-적용-원칙)
- <a id="문서-변경과-실행-순서"></a>[문서 변경과 실행 순서 원문](../records/archive/adr-0007-native-drum-notation-sources.md#문서-변경과-실행-순서)
- <a id="선택과-보고-절차"></a>[선택과 보고 절차 원문](../records/archive/adr-0007-native-drum-notation-sources.md#선택과-보고-절차)
- <a id="과거-실험-기록--위-확정-범례와-구분"></a>[과거 실험 기록 — 위 확정 범례와 구분 원문](../records/archive/adr-0007-native-drum-notation-sources.md#과거-실험-기록--위-확정-범례와-구분)
- <a id="쉼표"></a>[쉼표 원문](../records/archive/adr-0007-native-drum-notation-sources.md#쉼표)
- <a id="rl-스티킹--현재-승인-규칙"></a>[R/L 스티킹 — 현재 승인 규칙 원문](../records/archive/adr-0007-native-drum-notation-sources.md#rl-스티킹--현재-승인-규칙)
- <a id="지원-경계-osmd-자체와-앱-보완"></a>[지원 경계: OSMD 자체와 앱 보완 원문](../records/archive/adr-0007-native-drum-notation-sources.md#지원-경계-osmd-자체와-앱-보완)
- <a id="근거와-관리"></a>[근거와 관리 원문](../records/archive/adr-0007-native-drum-notation-sources.md#근거와-관리)
- <a id="2026-09-20--고스트와-스티킹-출력-확정"></a>[2026-09-20 — 고스트와 스티킹 출력 확정 원문](../records/archive/adr-0007-native-drum-notation-sources.md#2026-09-20--고스트와-스티킹-출력-확정)
- <a id="사용자-시각-검수-최종-승인"></a>[사용자 시각 검수 최종 승인 원문](../records/archive/adr-0007-native-drum-notation-sources.md#사용자-시각-검수-최종-승인)
- <a id="2026-09-20--앱-적용"></a>[2026-09-20 — 앱 적용 원문](../records/archive/adr-0007-native-drum-notation-sources.md#2026-09-20--앱-적용)
- <a id="2026-10-03-사용자-승인-바람과-언덕의-발라드-오픈-하이햇-복원"></a>[2026-10-03 사용자 승인: 바람과 언덕의 발라드 오픈 하이햇 복원 원문](../records/archive/adr-0007-native-drum-notation-sources.md#2026-10-03-사용자-승인-바람과-언덕의-발라드-오픈-하이햇-복원)
- <a id="2026-10-03-최종-재확인-모든-곡에-확정-범례-적용"></a>[2026-10-03 최종 재확인: 모든 곡에 확정 범례 적용 원문](../records/archive/adr-0007-native-drum-notation-sources.md#2026-10-03-최종-재확인-모든-곡에-확정-범례-적용)
- <a id="rule-재점검-원문--score-reviewmd--2"></a>[Rule 재점검 원문 — SCORE-REVIEW.md / 2 원문](../records/archive/adr-0007-native-drum-notation-sources.md#rule-재점검-원문--score-reviewmd--2)
- <a id="rule-재점검-원문--score-musicxml-osmd-mappingmd--7"></a>[Rule 재점검 원문 — SCORE-MUSICXML-OSMD-MAPPING.md / 7 원문](../records/archive/adr-0007-native-drum-notation-sources.md#rule-재점검-원문--score-musicxml-osmd-mappingmd--7)
- <a id="rule-재점검-원문--score-musicxml-osmd-mappingmd--10"></a>[Rule 재점검 원문 — SCORE-MUSICXML-OSMD-MAPPING.md / 10 원문](../records/archive/adr-0007-native-drum-notation-sources.md#rule-재점검-원문--score-musicxml-osmd-mappingmd--10)

</details>
