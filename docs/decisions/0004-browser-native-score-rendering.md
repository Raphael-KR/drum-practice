---
status: accepted
date: 2026-11-09
---

# 두 앱은 정본 XML과 공통 native 조판을 사용한다

## Context and Problem Statement

초기 재생 경로는 제작앱이 만든 SVG에 의존했다. 2026-10-03 브라우저 직접 조판 승인 이후 두 앱이 같은 renderer와 파생 캐시를 사용한다.

## Considered Options

* 재생앱은 동봉 SVG만 사용하고 renderer를 포함하지 않는다.
* 두 앱이 정본 MusicXML로 같은 renderMusicXML을 호출한다.

## Decision Outcome

후자를 채택한다. 원문·파트·실제 OSMD 버전·표시 정책으로 파생 캐시를 식별한다. MusicXML·사용자 연습 상태를 캐시 DB에 쓰지 않는다.

### Consequences

renderer-free 제한은 재생앱에 한해 대체되었다. 편집/제작 모듈 경계와 저장 형식은 별도 계약으로 유지한다.

### Confirmation

현재 기준은 [SVG 규칙](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙)을 따른다. 아래 검증·버전·수치는 당시 기록이며 이번 문서 이관에서 시험을 재실행한 결과가 아니다.

## More Information

[이관 원문과 당시 검증 기록](../records/archive/adr-0004-browser-native-score-rendering-sources.md)을 별도 보존한다. 결정 요약과 승인 범위는 유지하며, 과거 원문은 현재 동작이나 이번 검증 결과가 아니다.

<details>
<summary>기존 원문 문단 주소</summary>

- <a id="10-저장캐시안전"></a>[10. 저장·캐시·안전 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#10-저장캐시안전)
- <a id="브라우저-직접-조판-2026-10-03-최신-승인"></a>[브라우저 직접 조판 (2026-10-03 최신 승인) 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#브라우저-직접-조판-2026-10-03-최신-승인)
- <a id="musicxml-입력-매핑정본-계약에서-옮긴-근거--2026-10-23-이관"></a>[MusicXML 입력 매핑·정본 계약에서 옮긴 근거 — 2026-10-23 이관 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#musicxml-입력-매핑정본-계약에서-옮긴-근거--2026-10-23-이관)
- <a id="렌더러-결정"></a>[렌더러 결정 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#렌더러-결정)
- <a id="이관-원문--musicxml-supportmd--1"></a>[이관 원문 — MUSICXML-SUPPORT.md / 1 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--musicxml-supportmd--1)
- <a id="musicxml-입력-지원-계획"></a>[MusicXML 입력 지원 계획 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#musicxml-입력-지원-계획)
- <a id="이관-원문--musicxml-supportmd--2"></a>[이관 원문 — MUSICXML-SUPPORT.md / 2 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--musicxml-supportmd--2)
- <a id="사용-방법"></a>[사용 방법 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#사용-방법)
- <a id="이관-원문--musicxml-supportmd--3"></a>[이관 원문 — MUSICXML-SUPPORT.md / 3 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--musicxml-supportmd--3)
- <a id="범위와-한계"></a>[범위와 한계 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#범위와-한계)
- <a id="이관-원문--musicxml-supportmd--4"></a>[이관 원문 — MUSICXML-SUPPORT.md / 4 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--musicxml-supportmd--4)
- <a id="구현-근거"></a>[구현 근거 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#구현-근거)
- <a id="이관-원문--musicxml-supportmd--5"></a>[이관 원문 — MUSICXML-SUPPORT.md / 5 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--musicxml-supportmd--5)
- <a id="2026-09-19-검증-결과"></a>[2026-09-19 검증 결과 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#2026-09-19-검증-결과)
- <a id="이관-원문--musicxml-supportmd--6"></a>[이관 원문 — MUSICXML-SUPPORT.md / 6 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--musicxml-supportmd--6)
- <a id="곡별-보관-2026-09-19"></a>[곡별 보관 (2026-09-19) 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#곡별-보관-2026-09-19)
- <a id="이관-원문--svg-renderingmd--1"></a>[이관 원문 — SVG-RENDERING.md / 1 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--svg-renderingmd--1)
- <a id="musicxml-svg-표시-및-압축-캐시"></a>[MusicXML SVG 표시 및 압축 캐시 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#musicxml-svg-표시-및-압축-캐시)
- <a id="이관-원문--svg-renderingmd--2"></a>[이관 원문 — SVG-RENDERING.md / 2 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--svg-renderingmd--2)
- <a id="형식"></a>[형식 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#형식)
- <a id="이관-원문--browser-musicxml-renderingmd--1"></a>[이관 원문 — BROWSER-MUSICXML-RENDERING.md / 1 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--browser-musicxml-renderingmd--1)
- <a id="브라우저-musicxml-직접-조판-전환"></a>[브라우저 MusicXML 직접 조판 전환 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#브라우저-musicxml-직접-조판-전환)
- <a id="이관-원문--browser-musicxml-renderingmd--2"></a>[이관 원문 — BROWSER-MUSICXML-RENDERING.md / 2 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--browser-musicxml-renderingmd--2)
- <a id="승인된-표시-계약"></a>[승인된 표시 계약 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#승인된-표시-계약)
- <a id="이관-원문--browser-musicxml-renderingmd--3"></a>[이관 원문 — BROWSER-MUSICXML-RENDERING.md / 3 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--browser-musicxml-renderingmd--3)
- <a id="캐시와-입력-권위"></a>[캐시와 입력 권위 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#캐시와-입력-권위)
- <a id="이관-원문--browser-musicxml-renderingmd--4"></a>[이관 원문 — BROWSER-MUSICXML-RENDERING.md / 4 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--browser-musicxml-renderingmd--4)
- <a id="검증-기준"></a>[검증 기준 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#검증-기준)
- <a id="이관-원문--browser-musicxml-renderingmd--5"></a>[이관 원문 — BROWSER-MUSICXML-RENDERING.md / 5 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--browser-musicxml-renderingmd--5)
- <a id="보정-재검토-목록"></a>[보정 재검토 목록 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#보정-재검토-목록)
- <a id="이관-원문--browser-musicxml-renderingmd--6"></a>[이관 원문 — BROWSER-MUSICXML-RENDERING.md / 6 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--browser-musicxml-renderingmd--6)
- <a id="결과실패-기록"></a>[결과/실패 기록 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#결과실패-기록)
- <a id="이관-원문--browser-musicxml-renderingmd--7"></a>[이관 원문 — BROWSER-MUSICXML-RENDERING.md / 7 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--browser-musicxml-renderingmd--7)
- <a id="구현과-적용-범위"></a>[구현과 적용 범위 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#구현과-적용-범위)
- <a id="이관-원문--browser-musicxml-renderingmd--8"></a>[이관 원문 — BROWSER-MUSICXML-RENDERING.md / 8 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--browser-musicxml-renderingmd--8)
- <a id="실제-측정"></a>[실제 측정 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#실제-측정)
- <a id="이관-원문--browser-musicxml-renderingmd--9"></a>[이관 원문 — BROWSER-MUSICXML-RENDERING.md / 9 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--browser-musicxml-renderingmd--9)
- <a id="실패와-해결"></a>[실패와 해결 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#실패와-해결)
- <a id="이관-원문--browser-musicxml-renderingmd--10"></a>[이관 원문 — BROWSER-MUSICXML-RENDERING.md / 10 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--browser-musicxml-renderingmd--10)
- <a id="기존-보정-판단"></a>[기존 보정 판단 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#기존-보정-판단)
- <a id="이관-원문--browser-musicxml-renderingmd--11"></a>[이관 원문 — BROWSER-MUSICXML-RENDERING.md / 11 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#이관-원문--browser-musicxml-renderingmd--11)
- <a id="근거와-한계"></a>[근거와 한계 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#근거와-한계)
- <a id="rule-재점검-원문--musicxml-inputmd--1"></a>[Rule 재점검 원문 — MUSICXML-INPUT.md / 1 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#rule-재점검-원문--musicxml-inputmd--1)
- <a id="rule-재점검-원문--musicxml-inputmd--2"></a>[Rule 재점검 원문 — MUSICXML-INPUT.md / 2 원문](../records/archive/adr-0004-browser-native-score-rendering-sources.md#rule-재점검-원문--musicxml-inputmd--2)

</details>
