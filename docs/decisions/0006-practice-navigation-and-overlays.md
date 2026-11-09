---
status: accepted
date: 2026-11-09
---

# 재생 위치·선택·구간 표시를 분리한다

## Context and Problem Statement

2026-10-03~13에 마커·선택·구간 입력과 두 줄 탐색을 정정했다. 정지 선택과 실제 재생 시각을 함께 움직이거나 드래그를 구간 등록으로 해석하면 사용자의 탐색을 방해했다.

## Considered Options

* 정지 선택을 재생 위치와 결합하고 구간을 드래그로 등록한다.
* 재생·선택을 분리하고 탭/클릭·더블클릭·Enter로 구간을 등록한다.

## Decision Outcome

후자를 채택한다. 마커는 빨강, 구간은 오렌지, 선택은 파란 테두리다. 화면 유지·마지막 줄·가사 앵커·음표 빛나기의 현행 조건은 규칙 §8·9를 따른다.

### Consequences

초기 선택 파란 배경과 정지 더블클릭 재생, 구간 드래그는 후속 결정으로 대체되었다. 원본 SVG에 UI 표시를 굽지 않는다.

### Confirmation

현재 기준은 [SVG 규칙](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙)을 따른다. 아래 검증·버전·수치는 당시 기록이며 이번 문서 이관에서 시험을 재실행한 결과가 아니다.

## More Information

[이관 원문과 당시 검증 기록](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md)을 별도 보존한다. 결정 요약과 승인 범위는 유지하며, 과거 원문은 현재 동작이나 이번 검증 결과가 아니다.

<details>
<summary>기존 원문 문단 주소</summary>

- <a id="9-음표-빛나기--화면-효과"></a>[9. 음표 빛나기 — 화면 효과 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#9-음표-빛나기--화면-효과)
- <a id="연습-마커-표시"></a>[연습 마커 표시 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#연습-마커-표시)
- <a id="2026-10-03-pdf-대응-음표의-가사-위치"></a>[2026-10-03 PDF 대응 음표의 가사 위치 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#2026-10-03-pdf-대응-음표의-가사-위치)
- <a id="2026-10-03-정지-중-마디-탐색-레이어"></a>[2026-10-03 정지 중 마디 탐색 레이어 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#2026-10-03-정지-중-마디-탐색-레이어)
- <a id="2026-10-03-마디박자-표시-통일"></a>[2026-10-03 마디·박자 표시 통일 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#2026-10-03-마디박자-표시-통일)
- <a id="반복-구간-선택-2026-10-13-드래그-폐기"></a>[반복 구간 선택 (2026-10-13, 드래그 폐기) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#반복-구간-선택-2026-10-13-드래그-폐기)
- <a id="두-줄-일시정지와-탐색-순서-2026-10-04-최종-사용자-승인"></a>[두 줄 일시정지와 탐색 순서 (2026-10-04, 최종 사용자 승인) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#두-줄-일시정지와-탐색-순서-2026-10-04-최종-사용자-승인)
- <a id="두-줄-재생-시작-위치-유지-2026-10-04"></a>[두 줄 재생 시작 위치 유지 (2026-10-04) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#두-줄-재생-시작-위치-유지-2026-10-04)
- <a id="두-줄-정지-탐색의-화면-유지-2026-10-13"></a>[두 줄 정지 탐색의 화면 유지 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#두-줄-정지-탐색의-화면-유지-2026-10-13)
- <a id="재생-위치와-키보드-선택-분리-2026-10-13"></a>[재생 위치와 키보드 선택 분리 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#재생-위치와-키보드-선택-분리-2026-10-13)
- <a id="선택-마디-테두리만-표시-2026-10-13"></a>[선택 마디 테두리만 표시 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#선택-마디-테두리만-표시-2026-10-13)
- <a id="두-줄-방향키-탐색의-줄-위치-유지-2026-10-13"></a>[두 줄 방향키 탐색의 줄 위치 유지 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#두-줄-방향키-탐색의-줄-위치-유지-2026-10-13)
- <a id="저장한-연습-구간-표시-2026-10-13"></a>[저장한 연습 구간 표시 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#저장한-연습-구간-표시-2026-10-13)
- <a id="태블릿-구간-등록-2026-10-13"></a>[태블릿 구간 등록 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#태블릿-구간-등록-2026-10-13)
- <a id="마커구간-색상-통일-2026-10-13-사용자-정정"></a>[마커/구간 색상 통일 (2026-10-13, 사용자 정정) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#마커구간-색상-통일-2026-10-13-사용자-정정)
- <a id="빈-구간-슬롯-2026-10-13"></a>[빈 구간 슬롯 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#빈-구간-슬롯-2026-10-13)
- <a id="구간-선택-진입-시-화면-위치-유지-2026-10-13"></a>[구간 선택 진입 시 화면 위치 유지 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#구간-선택-진입-시-화면-위치-유지-2026-10-13)
- <a id="정지-중-더블클릭-구간-등록-2026-10-13"></a>[정지 중 더블클릭 구간 등록 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#정지-중-더블클릭-구간-등록-2026-10-13)
- <a id="빈-슬롯의-태블릿-구간-선택-2026-10-13"></a>[빈 슬롯의 태블릿 구간 선택 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#빈-슬롯의-태블릿-구간-선택-2026-10-13)
- <a id="구간-선택에서-마우스-원클릭-등록-2026-10-13"></a>[\[구간 선택\]에서 마우스 원클릭 등록 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#구간-선택에서-마우스-원클릭-등록-2026-10-13)
- <a id="이관-원문--note-playback-highlightmd--1"></a>[이관 원문 — NOTE-PLAYBACK-HIGHLIGHT.md / 1 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--note-playback-highlightmd--1)
- <a id="음표-빛나기"></a>[음표 빛나기 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#음표-빛나기)
- <a id="이관-원문--note-playback-highlightmd--2"></a>[이관 원문 — NOTE-PLAYBACK-HIGHLIGHT.md / 2 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--note-playback-highlightmd--2)
- <a id="2026-09-21-검증-결과"></a>[2026-09-21 검증 결과 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#2026-09-21-검증-결과)
- <a id="이관-원문--note-playback-highlightmd--3"></a>[이관 원문 — NOTE-PLAYBACK-HIGHLIGHT.md / 3 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--note-playback-highlightmd--3)
- <a id="pdf-보기에서-켜짐으로-오인한-문제-수정"></a>[PDF 보기에서 켜짐으로 오인한 문제 수정 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#pdf-보기에서-켜짐으로-오인한-문제-수정)
- <a id="이관-원문--note-playback-highlightmd--4"></a>[이관 원문 — NOTE-PLAYBACK-HIGHLIGHT.md / 4 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--note-playback-highlightmd--4)
- <a id="순간-점등-방식으로-변경"></a>[순간 점등 방식으로 변경 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#순간-점등-방식으로-변경)
- <a id="이관-원문--note-playback-highlightmd--5"></a>[이관 원문 — NOTE-PLAYBACK-HIGHLIGHT.md / 5 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--note-playback-highlightmd--5)
- <a id="흰-중심과-청록-광륜"></a>[흰 중심과 청록 광륜 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#흰-중심과-청록-광륜)
- <a id="이관-원문--paused-score-scrollmd--1"></a>[이관 원문 — PAUSED-SCORE-SCROLL.md / 1 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--paused-score-scrollmd--1)
- <a id="정지된-두-줄-악보의-세로-탐색"></a>[정지된 두 줄 악보의 세로 탐색 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#정지된-두-줄-악보의-세로-탐색)
- <a id="이관-원문--paused-score-scrollmd--2"></a>[이관 원문 — PAUSED-SCORE-SCROLL.md / 2 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--paused-score-scrollmd--2)
- <a id="구현"></a>[구현 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#구현)
- <a id="이관-원문--paused-score-scrollmd--3"></a>[이관 원문 — PAUSED-SCORE-SCROLL.md / 3 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--paused-score-scrollmd--3)
- <a id="검증"></a>[검증 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#검증)
- <a id="이관-원문--paused-score-scrollmd--4"></a>[이관 원문 — PAUSED-SCORE-SCROLL.md / 4 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--paused-score-scrollmd--4)
- <a id="두-줄-공통-간격-2026-09-21"></a>[두 줄 공통 간격 (2026-09-21) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#두-줄-공통-간격-2026-09-21)
- <a id="이관-원문--count-off-navigationmd--1"></a>[이관 원문 — COUNT-OFF-NAVIGATION.md / 1 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--count-off-navigationmd--1)
- <a id="버튼-이동과-카운트오프-2026-10-22"></a>[버튼 이동과 카운트오프 (2026-10-22) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#버튼-이동과-카운트오프-2026-10-22)
- <a id="이관-원문--count-off-navigationmd--2"></a>[이관 원문 — COUNT-OFF-NAVIGATION.md / 2 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--count-off-navigationmd--2)
- <a id="승인된-규칙"></a>[승인된 규칙 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#승인된-규칙)
- <a id="이관-원문--count-off-navigationmd--3"></a>[이관 원문 — COUNT-OFF-NAVIGATION.md / 3 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--count-off-navigationmd--3)
- <a id="구현과-검증"></a>[구현과 검증 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#구현과-검증)
- <a id="이관-원문--repeat-range-actionsmd--1"></a>[이관 원문 — REPEAT-RANGE-ACTIONS.md / 1 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--repeat-range-actionsmd--1)
- <a id="반복-구간-시작삭제-동작-2026-10-22"></a>[반복 구간 시작·삭제 동작 (2026-10-22) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#반복-구간-시작삭제-동작-2026-10-22)
- <a id="이관-원문--repeat-range-actionsmd--2"></a>[이관 원문 — REPEAT-RANGE-ACTIONS.md / 2 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--repeat-range-actionsmd--2)
- <a id="승인된-동작"></a>[승인된 동작 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#승인된-동작)
- <a id="이관-원문--repeat-range-actionsmd--3"></a>[이관 원문 — REPEAT-RANGE-ACTIONS.md / 3 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--repeat-range-actionsmd--3)
- <a id="구현검증-기록"></a>[구현·검증 기록 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#구현검증-기록)
- <a id="이관-원문--ux-principlesmd--27"></a>[이관 원문 — UX-PRINCIPLES.md / 27 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--27)
- <a id="2026-10-04-섹션-바로가기-조작판-마커-관리-규칙-대체"></a>[2026-10-04 섹션 바로가기 (조작판 마커 관리 규칙 대체) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#2026-10-04-섹션-바로가기-조작판-마커-관리-규칙-대체)
- <a id="이관-원문--ux-principlesmd--31"></a>[이관 원문 — UX-PRINCIPLES.md / 31 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--31)
- <a id="2026-10-04-앞뒤-반복의-재생-시작점"></a>[2026-10-04 앞뒤 반복의 재생 시작점 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#2026-10-04-앞뒤-반복의-재생-시작점)
- <a id="이관-원문--ux-principlesmd--45"></a>[이관 원문 — UX-PRINCIPLES.md / 45 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--45)
- <a id="2026-10-13-enter-반복-구간-등록과-정렬-기존-슬롯-위치-고정-규칙-대체"></a>[2026-10-13 Enter 반복 구간 등록과 정렬 (기존 슬롯 위치 고정 규칙 대체) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#2026-10-13-enter-반복-구간-등록과-정렬-기존-슬롯-위치-고정-규칙-대체)
- <a id="이관-원문--ux-principlesmd--46"></a>[이관 원문 — UX-PRINCIPLES.md / 46 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--46)
- <a id="2026-10-13-m-마커-단축키"></a>[2026-10-13 M 마커 단축키 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#2026-10-13-m-마커-단축키)
- <a id="이관-원문--ux-principlesmd--48"></a>[이관 원문 — UX-PRINCIPLES.md / 48 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--48)
- <a id="재생-위치와-키보드-선택-분리-2026-10-13-1"></a>[재생 위치와 키보드 선택 분리 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#재생-위치와-키보드-선택-분리-2026-10-13-1)
- <a id="이관-원문--ux-principlesmd--49"></a>[이관 원문 — UX-PRINCIPLES.md / 49 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--49)
- <a id="선택-마디-테두리만-표시-2026-10-13-1"></a>[선택 마디 테두리만 표시 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#선택-마디-테두리만-표시-2026-10-13-1)
- <a id="이관-원문--ux-principlesmd--50"></a>[이관 원문 — UX-PRINCIPLES.md / 50 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--50)
- <a id="두-줄-방향키-탐색의-줄-위치-유지-2026-10-13-1"></a>[두 줄 방향키 탐색의 줄 위치 유지 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#두-줄-방향키-탐색의-줄-위치-유지-2026-10-13-1)
- <a id="이관-원문--ux-principlesmd--51"></a>[이관 원문 — UX-PRINCIPLES.md / 51 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--51)
- <a id="저장한-연습-구간-표시-2026-10-13-1"></a>[저장한 연습 구간 표시 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#저장한-연습-구간-표시-2026-10-13-1)
- <a id="이관-원문--ux-principlesmd--52"></a>[이관 원문 — UX-PRINCIPLES.md / 52 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--52)
- <a id="태블릿-구간-등록-2026-10-13-1"></a>[태블릿 구간 등록 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#태블릿-구간-등록-2026-10-13-1)
- <a id="이관-원문--ux-principlesmd--53"></a>[이관 원문 — UX-PRINCIPLES.md / 53 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--53)
- <a id="구간-버튼-시작삭제-2026-10-22-사용자-결정"></a>[구간 버튼 시작/삭제 (2026-10-22, 사용자 결정) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#구간-버튼-시작삭제-2026-10-22-사용자-결정)
- <a id="이관-원문--ux-principlesmd--54"></a>[이관 원문 — UX-PRINCIPLES.md / 54 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--54)
- <a id="마커구간-색상-통일-2026-10-13-사용자-정정-1"></a>[마커/구간 색상 통일 (2026-10-13, 사용자 정정) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#마커구간-색상-통일-2026-10-13-사용자-정정-1)
- <a id="이관-원문--ux-principlesmd--55"></a>[이관 원문 — UX-PRINCIPLES.md / 55 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--55)
- <a id="빈-구간-슬롯-2026-10-13-1"></a>[빈 구간 슬롯 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#빈-구간-슬롯-2026-10-13-1)
- <a id="이관-원문--ux-principlesmd--56"></a>[이관 원문 — UX-PRINCIPLES.md / 56 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--56)
- <a id="구간-선택-진입-시-화면-위치-유지-2026-10-13-1"></a>[구간 선택 진입 시 화면 위치 유지 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#구간-선택-진입-시-화면-위치-유지-2026-10-13-1)
- <a id="이관-원문--ux-principlesmd--57"></a>[이관 원문 — UX-PRINCIPLES.md / 57 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--57)
- <a id="정지-중-더블클릭-구간-등록-2026-10-13-1"></a>[정지 중 더블클릭 구간 등록 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#정지-중-더블클릭-구간-등록-2026-10-13-1)
- <a id="이관-원문--ux-principlesmd--58"></a>[이관 원문 — UX-PRINCIPLES.md / 58 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--58)
- <a id="빈-슬롯의-태블릿-구간-선택-2026-10-13-1"></a>[빈 슬롯의 태블릿 구간 선택 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#빈-슬롯의-태블릿-구간-선택-2026-10-13-1)
- <a id="이관-원문--ux-principlesmd--59"></a>[이관 원문 — UX-PRINCIPLES.md / 59 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--59)
- <a id="구간-선택에서-마우스-원클릭-등록-2026-10-13-1"></a>[\[구간 선택\]에서 마우스 원클릭 등록 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#구간-선택에서-마우스-원클릭-등록-2026-10-13-1)
- <a id="이관-원문--ux-principlesmd--62"></a>[이관 원문 — UX-PRINCIPLES.md / 62 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--62)
- <a id="선택-마디-원클릭원터치-재생-2026-10-13"></a>[선택 마디 원클릭/원터치 재생 (2026-10-13) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#선택-마디-원클릭원터치-재생-2026-10-13)
- <a id="이관-원문--ux-principlesmd--97"></a>[이관 원문 — UX-PRINCIPLES.md / 97 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#이관-원문--ux-principlesmd--97)
- <a id="버튼-이동-카운트오프-2026-10-22"></a>[버튼 이동 카운트오프 (2026-10-22) 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#버튼-이동-카운트오프-2026-10-22)
- <a id="rule-재점검-원문--settings-playbackmd--1"></a>[Rule 재점검 원문 — SETTINGS-PLAYBACK.md / 1 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#rule-재점검-원문--settings-playbackmd--1)
- <a id="rule-재점검-원문--settings-playbackmd--2"></a>[Rule 재점검 원문 — SETTINGS-PLAYBACK.md / 2 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#rule-재점검-원문--settings-playbackmd--2)
- <a id="rule-재점검-원문--paused-score-scrollmd--1"></a>[Rule 재점검 원문 — PAUSED-SCORE-SCROLL.md / 1 원문](../records/archive/adr-0006-practice-navigation-and-overlays-sources.md#rule-재점검-원문--paused-score-scrollmd--1)

</details>
