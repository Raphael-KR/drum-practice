---
status: accepted
date: 2026-11-09
---

# 연습 배치는 native 비율과 보기별 간격 정책을 사용한다

## Context and Problem Statement

2026-10-03~04에 두 줄 음표 크기·높이·확대 기준과 균등 모드를 여러 차례 정정했다. 초안의 50% 기준·높이에 맞춘 폭 축소·가변 줄바꿈을 최종 기준과 구분해야 한다.

## Considered Options

* 인쇄 마디를 셀에 비균등 확대하거나 남은 높이에 맞춰 폭을 줄인다.
* native 종횡비와 폭 기준 높이를 유지하고 row/grid를 구분한다.

## Decision Outcome

후자를 채택한다. 확대 중앙은100%, 한 줄 확대 범위는50~300%다. 일반 row와 고정 폭 grid를 구분하며 현재 두 줄은4마디다. 세부값은 규칙 §8을 따른다.

### Consequences

50%에16박을 맞추던 초안, 두 줄에서 한 줄 자산을 무조건 재사용하던 v10, 서랍 높이에 맞춘 폭 축소, 균등 모드의 가변 줄바꿈은 대체된 결정이다. 아래 원문은 적용 순서를 보존한다.

### Confirmation

현재 기준은 [SVG 규칙](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙)을 따른다. 아래 검증·버전·수치는 당시 기록이며 이번 문서 이관에서 시험을 재실행한 결과가 아니다.

## More Information

[이관 원문과 당시 검증 기록](../records/archive/adr-0005-practice-layout-and-spacing-sources.md)을 별도 보존한다. 결정 요약과 승인 범위는 유지하며, 과거 원문은 현재 동작이나 이번 검증 결과가 아니다.

<details>
<summary>기존 원문 문단 주소</summary>

- <a id="8-연습-화면-전용-배치"></a>[8. 연습 화면 전용 배치 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#8-연습-화면-전용-배치)
- <a id="2026-09-21-캡처-검수-보정"></a>[2026-09-21 캡처 검수 보정 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#2026-09-21-캡처-검수-보정)
- <a id="한-줄-보기의-좁은-마디-배율-2026-10-03"></a>[한 줄 보기의 좁은 마디 배율 (2026-10-03) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#한-줄-보기의-좁은-마디-배율-2026-10-03)
- <a id="svg-한-줄-보기의-시간-비례-배치--2026-10-03-승인구현"></a>[SVG 한 줄 보기의 시간 비례 배치 — 2026-10-03 승인·구현 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#svg-한-줄-보기의-시간-비례-배치--2026-10-03-승인구현)
- <a id="한-줄-보기의-읽기-편한-밀도이동-2026-10-03-사용자-승인"></a>[한 줄 보기의 읽기 편한 밀도·이동 (2026-10-03 사용자 승인) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#한-줄-보기의-읽기-편한-밀도이동-2026-10-03-사용자-승인)
- <a id="2026-10-03-구현-기준-확정"></a>[2026-10-03 구현 기준 확정 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#2026-10-03-구현-기준-확정)
- <a id="두-줄-보기의-음표-비율과-기둥-2026-10-03-v10-초안아래-v11로-보완"></a>[두 줄 보기의 음표 비율과 기둥 (2026-10-03, v10 초안·아래 v11로 보완) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#두-줄-보기의-음표-비율과-기둥-2026-10-03-v10-초안아래-v11로-보완)
- <a id="두-줄-가독성-보완-v11-2026-10-03"></a>[두 줄 가독성 보완 v11 (2026-10-03) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#두-줄-가독성-보완-v11-2026-10-03)
- <a id="배율-중앙-기준-정정-2026-10-03-사용자-최신-결정"></a>[배율 중앙 기준 정정 (2026-10-03 사용자 최신 결정) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#배율-중앙-기준-정정-2026-10-03-사용자-최신-결정)
- <a id="2026-10-04-서랍과-두-줄-악보-높이-이전-방식-아래-폭-기준-정책으로-대체"></a>[2026-10-04 서랍과 두 줄 악보 높이 (이전 방식; 아래 폭 기준 정책으로 대체) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#2026-10-04-서랍과-두-줄-악보-높이-이전-방식-아래-폭-기준-정책으로-대체)
- <a id="두-줄-재생-영역-여백-2026-10-04"></a>[두 줄 재생 영역 여백 (2026-10-04) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#두-줄-재생-영역-여백-2026-10-04)
- <a id="두-줄-폭-기준-고정-높이-2026-10-04"></a>[두 줄 폭 기준 고정 높이 (2026-10-04) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#두-줄-폭-기준-고정-높이-2026-10-04)
- <a id="두-줄-보기의-마지막-줄-2026-10-04"></a>[두 줄 보기의 마지막 줄 (2026-10-04) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#두-줄-보기의-마지막-줄-2026-10-04)
- <a id="한-줄-보기-100-크기-기준-2026-10-04"></a>[한 줄 보기 100% 크기 기준 (2026-10-04) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#한-줄-보기-100-크기-기준-2026-10-04)
- <a id="한-줄두-줄-동일-svg-사용-2026-10-04-위-세로-배율-보정-대체"></a>[한 줄/두 줄 동일 SVG 사용 (2026-10-04, 위 세로 배율 보정 대체) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#한-줄두-줄-동일-svg-사용-2026-10-04-위-세로-배율-보정-대체)
- <a id="한-줄-보기-세로-중앙-정렬-2026-10-04"></a>[한 줄 보기 세로 중앙 정렬 (2026-10-04) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#한-줄-보기-세로-중앙-정렬-2026-10-04)
- <a id="한-줄-상단-여유-2026-10-04"></a>[한 줄 상단 여유 (2026-10-04) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#한-줄-상단-여유-2026-10-04)
- <a id="한-줄-진행선-등속-이동-2026-10-04"></a>[한 줄 진행선 등속 이동 (2026-10-04) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#한-줄-진행선-등속-이동-2026-10-04)
- <a id="음표-간격-균등-모드-2026-10-04"></a>[음표 간격 균등 모드 (2026-10-04) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#음표-간격-균등-모드-2026-10-04)
- <a id="균등-모드-최종-정정-고정-마디32분-격자-2026-10-04"></a>[균등 모드 최종 정정: 고정 마디·32분 격자 (2026-10-04) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#균등-모드-최종-정정-고정-마디32분-격자-2026-10-04)
- <a id="2026-10-04-확대-범위-확장"></a>[2026-10-04 확대 범위 확장 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#2026-10-04-확대-범위-확장)
- <a id="두-줄-진행선의-표시-좌표-일치-2026-10-04"></a>[두 줄 진행선의 표시 좌표 일치 (2026-10-04) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#두-줄-진행선의-표시-좌표-일치-2026-10-04)
- <a id="한-줄두-줄-외부-배치-통일-2026-10-04"></a>[한 줄·두 줄 외부 배치 통일 (2026-10-04) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#한-줄두-줄-외부-배치-통일-2026-10-04)
- <a id="이관-원문--ribbon-readabilitymd--1"></a>[이관 원문 — RIBBON-READABILITY.md / 1 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ribbon-readabilitymd--1)
- <a id="한-줄-악보-가독성의-정량화-검토"></a>[한 줄 악보 가독성의 정량화 검토 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#한-줄-악보-가독성의-정량화-검토)
- <a id="이관-원문--ribbon-readabilitymd--2"></a>[이관 원문 — RIBBON-READABILITY.md / 2 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ribbon-readabilitymd--2)
- <a id="목표와-범위"></a>[목표와 범위 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#목표와-범위)
- <a id="이관-원문--ribbon-readabilitymd--3"></a>[이관 원문 — RIBBON-READABILITY.md / 3 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ribbon-readabilitymd--3)
- <a id="승인-원칙"></a>[승인 원칙 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#승인-원칙)
- <a id="이관-원문--ribbon-readabilitymd--4"></a>[이관 원문 — RIBBON-READABILITY.md / 4 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ribbon-readabilitymd--4)
- <a id="현재-근거"></a>[현재 근거 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#현재-근거)
- <a id="이관-원문--ribbon-readabilitymd--5"></a>[이관 원문 — RIBBON-READABILITY.md / 5 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ribbon-readabilitymd--5)
- <a id="측정-단위와-계산식"></a>[측정 단위와 계산식 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#측정-단위와-계산식)
- <a id="이관-원문--ribbon-readabilitymd--6"></a>[이관 원문 — RIBBON-READABILITY.md / 6 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ribbon-readabilitymd--6)
- <a id="첫-비교-구현의-수치-후보--미확정"></a>[첫 비교 구현의 수치 후보 — 미확정 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#첫-비교-구현의-수치-후보--미확정)
- <a id="이관-원문--ribbon-readabilitymd--7"></a>[이관 원문 — RIBBON-READABILITY.md / 7 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ribbon-readabilitymd--7)
- <a id="피할-수-없는-제약과-해결-순서"></a>[피할 수 없는 제약과 해결 순서 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#피할-수-없는-제약과-해결-순서)
- <a id="이관-원문--ribbon-readabilitymd--8"></a>[이관 원문 — RIBBON-READABILITY.md / 8 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ribbon-readabilitymd--8)
- <a id="후속-검증-방법"></a>[후속 검증 방법 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#후속-검증-방법)
- <a id="이관-원문--ribbon-readabilitymd--9"></a>[이관 원문 — RIBBON-READABILITY.md / 9 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ribbon-readabilitymd--9)
- <a id="2026-10-03-구현-기준-확정-1"></a>[2026-10-03 구현 기준 확정 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#2026-10-03-구현-기준-확정-1)
- <a id="이관-원문--ribbon-readabilitymd--10"></a>[이관 원문 — RIBBON-READABILITY.md / 10 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ribbon-readabilitymd--10)
- <a id="구현검증-결과-2026-10-03-로컬"></a>[구현·검증 결과 (2026-10-03 로컬) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#구현검증-결과-2026-10-03-로컬)
- <a id="이관-원문--ribbon-readabilitymd--11"></a>[이관 원문 — RIBBON-READABILITY.md / 11 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ribbon-readabilitymd--11)
- <a id="간격-계측과-해결"></a>[간격 계측과 해결 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#간격-계측과-해결)
- <a id="이관-원문--ribbon-readabilitymd--12"></a>[이관 원문 — RIBBON-READABILITY.md / 12 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ribbon-readabilitymd--12)
- <a id="실행-결과"></a>[실행 결과 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#실행-결과)
- <a id="이관-원문--ribbon-readabilitymd--13"></a>[이관 원문 — RIBBON-READABILITY.md / 13 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ribbon-readabilitymd--13)
- <a id="실패해결-및-남은-한계"></a>[실패·해결 및 남은 한계 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#실패해결-및-남은-한계)
- <a id="이관-원문--ipad-landscape-uxmd--1"></a>[이관 원문 — IPAD-LANDSCAPE-UX.md / 1 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ipad-landscape-uxmd--1)
- <a id="ipad-mini-가로-연습-화면"></a>[iPad mini 가로 연습 화면 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#ipad-mini-가로-연습-화면)
- <a id="이관-원문--score-reviewmd--1"></a>[이관 원문 — SCORE-REVIEW.md / 1 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--score-reviewmd--1)
- <a id="pdf--musicxml-검수-모드"></a>[PDF / MusicXML 검수 모드 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#pdf--musicxml-검수-모드)
- <a id="이관-원문--score-reviewmd--2"></a>[이관 원문 — SCORE-REVIEW.md / 2 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--score-reviewmd--2)
- <a id="사용"></a>[사용 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#사용)
- <a id="이관-원문--score-reviewmd--3"></a>[이관 원문 — SCORE-REVIEW.md / 3 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--score-reviewmd--3)
- <a id="기본-곡-자동-준비-2026-09-19"></a>[기본 곡 자동 준비 (2026-09-19) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#기본-곡-자동-준비-2026-09-19)
- <a id="이관-원문--score-reviewmd--4"></a>[이관 원문 — SCORE-REVIEW.md / 4 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--score-reviewmd--4)
- <a id="채보-검수-교정-001--5마디-23박"></a>[채보 검수 교정 001 — 5마디 2·3박 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#채보-검수-교정-001--5마디-23박)
- <a id="이관-원문--score-reviewmd--5"></a>[이관 원문 — SCORE-REVIEW.md / 5 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--score-reviewmd--5)
- <a id="교정-002--전체-쉼표-3단-배치"></a>[교정 002 — 전체 쉼표 3단 배치 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#교정-002--전체-쉼표-3단-배치)
- <a id="이관-원문--score-reviewmd--6"></a>[이관 원문 — SCORE-REVIEW.md / 6 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--score-reviewmd--6)
- <a id="2026-09-20-검수-화면-마디-정렬"></a>[2026-09-20: 검수 화면 마디 정렬 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#2026-09-20-검수-화면-마디-정렬)
- <a id="이관-원문--score-reviewmd--7"></a>[이관 원문 — SCORE-REVIEW.md / 7 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--score-reviewmd--7)
- <a id="2026-09-20-마디-전체-쉼표-중앙-배치"></a>[2026-09-20: 마디 전체 쉼표 중앙 배치 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#2026-09-20-마디-전체-쉼표-중앙-배치)
- <a id="이관-원문--score-reviewmd--8"></a>[이관 원문 — SCORE-REVIEW.md / 8 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--score-reviewmd--8)
- <a id="2026-09-20-오픈-하이햇의-빈-음표머리"></a>[2026-09-20: 오픈 하이햇의 빈 음표머리 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#2026-09-20-오픈-하이햇의-빈-음표머리)
- <a id="이관-원문--score-reviewmd--9"></a>[이관 원문 — SCORE-REVIEW.md / 9 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--score-reviewmd--9)
- <a id="2026-10-21--러브홀릭-103마디-오선-검출-수정"></a>[2026-10-21 — 러브홀릭 103마디 오선 검출 수정 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#2026-10-21--러브홀릭-103마디-오선-검출-수정)
- <a id="이관-원문--ux-principlesmd--13"></a>[이관 원문 — UX-PRINCIPLES.md / 13 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ux-principlesmd--13)
- <a id="악보를-미리-읽을-여유-2026-10-03-승인"></a>[악보를 미리 읽을 여유 (2026-10-03 승인) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#악보를-미리-읽을-여유-2026-10-03-승인)
- <a id="이관-원문--ux-principlesmd--22"></a>[이관 원문 — UX-PRINCIPLES.md / 22 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ux-principlesmd--22)
- <a id="2026-10-04-설정-사이드바-볼륨"></a>[2026-10-04 설정 사이드바 볼륨 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#2026-10-04-설정-사이드바-볼륨)
- <a id="이관-원문--ux-principlesmd--24"></a>[이관 원문 — UX-PRINCIPLES.md / 24 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ux-principlesmd--24)
- <a id="2026-10-04-재생바와-하단-서랍"></a>[2026-10-04 재생바와 하단 서랍 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#2026-10-04-재생바와-하단-서랍)
- <a id="이관-원문--ux-principlesmd--26"></a>[이관 원문 — UX-PRINCIPLES.md / 26 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ux-principlesmd--26)
- <a id="2026-10-04-고정-조작판으로-전환-이전-서랍-토글-규칙-대체"></a>[2026-10-04 고정 조작판으로 전환 (이전 서랍 토글 규칙 대체) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#2026-10-04-고정-조작판으로-전환-이전-서랍-토글-규칙-대체)
- <a id="이관-원문--ux-principlesmd--28"></a>[이관 원문 — UX-PRINCIPLES.md / 28 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ux-principlesmd--28)
- <a id="2026-10-04-세로-화면-상단-정리"></a>[2026-10-04 세로 화면 상단 정리 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#2026-10-04-세로-화면-상단-정리)
- <a id="이관-원문--ux-principlesmd--29"></a>[이관 원문 — UX-PRINCIPLES.md / 29 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ux-principlesmd--29)
- <a id="2026-10-04-연속-배경"></a>[2026-10-04 연속 배경 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#2026-10-04-연속-배경)
- <a id="이관-원문--ux-principlesmd--33"></a>[이관 원문 — UX-PRINCIPLES.md / 33 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ux-principlesmd--33)
- <a id="2026-10-04-조작판9칸-이전12칸-표시-대체"></a>[2026-10-04 조작판9칸 (이전12칸 표시 대체) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#2026-10-04-조작판9칸-이전12칸-표시-대체)
- <a id="이관-원문--ux-principlesmd--60"></a>[이관 원문 — UX-PRINCIPLES.md / 60 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ux-principlesmd--60)
- <a id="아이폰-세로-전용-화면-2026-10-13"></a>[아이폰 세로 전용 화면 (2026-10-13) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#아이폰-세로-전용-화면-2026-10-13)
- <a id="이관-원문--ux-principlesmd--63"></a>[이관 원문 — UX-PRINCIPLES.md / 63 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ux-principlesmd--63)
- <a id="아이폰-상단-조작-버튼-우측-정렬-2026-10-13"></a>[아이폰 상단 조작 버튼 우측 정렬 (2026-10-13) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#아이폰-상단-조작-버튼-우측-정렬-2026-10-13)
- <a id="이관-원문--ux-principlesmd--64"></a>[이관 원문 — UX-PRINCIPLES.md / 64 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ux-principlesmd--64)
- <a id="아이폰-재생-버튼-중심북마크-줄-2026-10-13"></a>[아이폰 재생 버튼 중심·북마크 줄 (2026-10-13) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#아이폰-재생-버튼-중심북마크-줄-2026-10-13)
- <a id="이관-원문--ux-principlesmd--66"></a>[이관 원문 — UX-PRINCIPLES.md / 66 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ux-principlesmd--66)
- <a id="ipad-mini-세로-재생바-두-줄-배치-2026-10-13"></a>[iPad mini 세로 재생바 두 줄 배치 (2026-10-13) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#ipad-mini-세로-재생바-두-줄-배치-2026-10-13)
- <a id="이관-원문--ux-principlesmd--68"></a>[이관 원문 — UX-PRINCIPLES.md / 68 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ux-principlesmd--68)
- <a id="아이폰-세로-볼륨-두-줄-2026-10-13"></a>[아이폰 세로 볼륨 두 줄 (2026-10-13) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#아이폰-세로-볼륨-두-줄-2026-10-13)
- <a id="이관-원문--ux-principlesmd--69"></a>[이관 원문 — UX-PRINCIPLES.md / 69 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ux-principlesmd--69)
- <a id="아이폰-세로-악보-선택-상단-버튼-2026-10-13"></a>[아이폰 세로 악보 선택 상단 버튼 (2026-10-13) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#아이폰-세로-악보-선택-상단-버튼-2026-10-13)
- <a id="이관-원문--ux-principlesmd--71"></a>[이관 원문 — UX-PRINCIPLES.md / 71 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ux-principlesmd--71)
- <a id="2026-10-13--iphoneipad-음원-파일-선택"></a>[2026-10-13 — iPhone/iPad 음원 파일 선택 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#2026-10-13--iphoneipad-음원-파일-선택)
- <a id="이관-원문--ux-principlesmd--76"></a>[이관 원문 — UX-PRINCIPLES.md / 76 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#이관-원문--ux-principlesmd--76)
- <a id="음악메트로놈-기본값-및-아이폰-곡-목록-2026-10-13"></a>[음악·메트로놈 기본값 및 아이폰 곡 목록 (2026-10-13) 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#음악메트로놈-기본값-및-아이폰-곡-목록-2026-10-13)
- <a id="rule-재점검-원문--ux-principlesmd--12"></a>[Rule 재점검 원문 — UX-PRINCIPLES.md / 12 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#rule-재점검-원문--ux-principlesmd--12)
- <a id="아이폰-세로-전용-화면"></a>[아이폰 세로 전용 화면 원문](../records/archive/adr-0005-practice-layout-and-spacing-sources.md#아이폰-세로-전용-화면)

</details>
