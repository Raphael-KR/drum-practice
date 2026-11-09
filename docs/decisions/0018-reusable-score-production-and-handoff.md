---
status: accepted
date: 2026-11-09
---

# 공통 제작 코드를 재사용하고 곡별 판단과 인계를 분리한다

## Context and Problem Statement

반복되는 패키지·계측·검수·인계 조립을 곡마다 작성하면서 비용과 실수가 늘었다. 원래 결정 시기는 2026-10-06·10-15·10-23이며, YAML 날짜는 이번 문서 정리일이다.

## Considered Options

* 곡마다 입출력·검증·보고 코드를 복제한다.
* 공통 실행은 재사용하고 설정·독립 기대값·판독 판단은 곡별 자료에 둔다.

## Decision Outcome

후자를 채택한다. 역할은 악보 제작이며 PDF·음원·영상의 실제 판독과 신규 작곡을 구분한다. MusicXML을 제작하고 요청 범위의 음원·패키지를 준비한다. 완성 악보는 기존 개발 담당에게 상시 위임 범위로 인계한다.

### Consequences

코드 동등성·원본 의미·패키지 왕복·실제 화면·청취·접수는 서로 다른 증거다. 새 기능·삭제·전송·배포 승인을 추가하지 않는다.

### Confirmation

현행 계약과 실행 절차는 [제작 Rule](../reference/score/production.md#score-production-rules--악보-제작-범위와-보존-rule), [공통 도구](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독), [재사용 절차](../how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용)에서 확인한다. 아래 당시 검증 수치·실패·미확인은 해당 환경의 기록이며 이번 작업에서 앱·악보 검증을 다시 수행한 결과가 아니다.

## More Information

[이관 원문과 당시 검증 기록](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md)을 별도 보존한다. 결정 요약과 승인 범위는 유지하며, 과거 원문은 현재 동작이나 이번 검증 결과가 아니다.

<details>
<summary>기존 원문 문단 주소</summary>

- <a id="이관-원문--common-toolsmd--1"></a>[이관 원문 — COMMON-TOOLS.md / 1 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--common-toolsmd--1)
- <a id="공통-제작-도구와-곡별-판독"></a>[공통 제작 도구와 곡별 판독 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#공통-제작-도구와-곡별-판독)
- <a id="이관-원문--common-toolsmd--2"></a>[이관 원문 — COMMON-TOOLS.md / 2 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--common-toolsmd--2)
- <a id="구현-순서"></a>[구현 순서 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#구현-순서)
- <a id="이관-원문--common-toolsmd--3"></a>[이관 원문 — COMMON-TOOLS.md / 3 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--common-toolsmd--3)
- <a id="구현된-경계"></a>[구현된 경계 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#구현된-경계)
- <a id="이관-원문--common-toolsmd--4"></a>[이관 원문 — COMMON-TOOLS.md / 4 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--common-toolsmd--4)
- <a id="공통-패키지-api"></a>[공통 패키지 API 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#공통-패키지-api)
- <a id="이관-원문--common-toolsmd--5"></a>[이관 원문 — COMMON-TOOLS.md / 5 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--common-toolsmd--5)
- <a id="새-곡에서-할-일"></a>[새 곡에서 할 일 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#새-곡에서-할-일)
- <a id="이관-원문--common-toolsmd--6"></a>[이관 원문 — COMMON-TOOLS.md / 6 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--common-toolsmd--6)
- <a id="실행-예시"></a>[실행 예시 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#실행-예시)
- <a id="이관-원문--common-toolsmd--9"></a>[이관 원문 — COMMON-TOOLS.md / 9 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--common-toolsmd--9)
- <a id="남겨-둔-곡별-판단"></a>[남겨 둔 곡별 판단 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#남겨-둔-곡별-판단)
- <a id="이관-원문--reusable-production-workflowmd--1"></a>[이관 원문 — REUSABLE-PRODUCTION-WORKFLOW.md / 1 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--reusable-production-workflowmd--1)
- <a id="제작-계측검수인계-재사용"></a>[제작 계측·검수·인계 재사용 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#제작-계측검수인계-재사용)
- <a id="이관-원문--reusable-production-workflowmd--2"></a>[이관 원문 — REUSABLE-PRODUCTION-WORKFLOW.md / 2 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--reusable-production-workflowmd--2)
- <a id="도구-경계"></a>[도구 경계 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#도구-경계)
- <a id="이관-원문--reusable-production-workflowmd--3"></a>[이관 원문 — REUSABLE-PRODUCTION-WORKFLOW.md / 3 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--reusable-production-workflowmd--3)
- <a id="1-계측"></a>[1. 계측 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#1-계측)
- <a id="이관-원문--reusable-production-workflowmd--4"></a>[이관 원문 — REUSABLE-PRODUCTION-WORKFLOW.md / 4 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--reusable-production-workflowmd--4)
- <a id="2-공통-검수-화면"></a>[2. 공통 검수 화면 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#2-공통-검수-화면)
- <a id="이관-원문--reusable-production-workflowmd--5"></a>[이관 원문 — REUSABLE-PRODUCTION-WORKFLOW.md / 5 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--reusable-production-workflowmd--5)
- <a id="3-인계문"></a>[3. 인계문 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#3-인계문)
- <a id="이관-원문--score-production-processmd--1"></a>[이관 원문 — SCORE-PRODUCTION-PROCESS.md / 1 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--score-production-processmd--1)
- <a id="악보-제작-프로세스"></a>[악보 제작 프로세스 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#악보-제작-프로세스)
- <a id="이관-원문--score-production-processmd--2"></a>[이관 원문 — SCORE-PRODUCTION-PROCESS.md / 2 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--score-production-processmd--2)
- <a id="시작-전에-읽을-문서"></a>[시작 전에 읽을 문서 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#시작-전에-읽을-문서)
- <a id="이관-원문--score-production-processmd--3"></a>[이관 원문 — SCORE-PRODUCTION-PROCESS.md / 3 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--score-production-processmd--3)
- <a id="유튜브-참고-자료로-제작할-때"></a>[유튜브 참고 자료로 제작할 때 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#유튜브-참고-자료로-제작할-때)
- <a id="이관-원문--score-production-processmd--4"></a>[이관 원문 — SCORE-PRODUCTION-PROCESS.md / 4 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--score-production-processmd--4)
- <a id="단계별-작업"></a>[단계별 작업 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#단계별-작업)
- <a id="이관-원문--score-production-processmd--5"></a>[이관 원문 — SCORE-PRODUCTION-PROCESS.md / 5 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--score-production-processmd--5)
- <a id="1-자료-접수와-원본-보존"></a>[1. 자료 접수와 원본 보존 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#1-자료-접수와-원본-보존)
- <a id="이관-원문--score-production-processmd--6"></a>[이관 원문 — SCORE-PRODUCTION-PROCESS.md / 6 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--score-production-processmd--6)
- <a id="2-pdf-유형과-변환-경로-결정"></a>[2. PDF 유형과 변환 경로 결정 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#2-pdf-유형과-변환-경로-결정)
- <a id="이관-원문--score-production-processmd--7"></a>[이관 원문 — SCORE-PRODUCTION-PROCESS.md / 7 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--score-production-processmd--7)
- <a id="3-musicxml-구조와-악기주법-교정"></a>[3. MusicXML 구조와 악기·주법 교정 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#3-musicxml-구조와-악기주법-교정)
- <a id="이관-원문--score-production-processmd--8"></a>[이관 원문 — SCORE-PRODUCTION-PROCESS.md / 8 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--score-production-processmd--8)
- <a id="4-인쇄-가사-대조와-음악적-위치-저장"></a>[4. 인쇄 가사 대조와 음악적 위치 저장 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#4-인쇄-가사-대조와-음악적-위치-저장)
- <a id="이관-원문--score-production-processmd--9"></a>[이관 원문 — SCORE-PRODUCTION-PROCESS.md / 9 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--score-production-processmd--9)
- <a id="5-음원-첫-박bpm마디-시간-연결"></a>[5. 음원 첫 박·BPM·마디 시간 연결 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#5-음원-첫-박bpm마디-시간-연결)
- <a id="첫-박카운트오프-검수표"></a>[첫 박·카운트오프 검수표 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#첫-박카운트오프-검수표)
- <a id="이관-원문--score-production-processmd--10"></a>[이관 원문 — SCORE-PRODUCTION-PROCESS.md / 10 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--score-production-processmd--10)
- <a id="6-svg-조판재생-캐시완성-패키지"></a>[6. SVG 조판·재생 캐시·완성 패키지 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#6-svg-조판재생-캐시완성-패키지)
- <a id="이관-원문--score-production-processmd--11"></a>[이관 원문 — SCORE-PRODUCTION-PROCESS.md / 11 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--score-production-processmd--11)
- <a id="7-실제-앱-수록본과-저장-곡-검수"></a>[7. 실제 앱 수록본과 저장 곡 검수 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#7-실제-앱-수록본과-저장-곡-검수)
- <a id="이관-원문--score-production-processmd--12"></a>[이관 원문 — SCORE-PRODUCTION-PROCESS.md / 12 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--score-production-processmd--12)
- <a id="8-결과-인계와-제작-종료"></a>[8. 결과 인계와 제작 종료 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#8-결과-인계와-제작-종료)
- <a id="이관-원문--score-production-processmd--13"></a>[이관 원문 — SCORE-PRODUCTION-PROCESS.md / 13 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--score-production-processmd--13)
- <a id="완료-판정과-필수-근거"></a>[완료 판정과 필수 근거 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#완료-판정과-필수-근거)
- <a id="이관-원문--score-production-processmd--14"></a>[이관 원문 — SCORE-PRODUCTION-PROCESS.md / 14 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#이관-원문--score-production-processmd--14)
- <a id="기존-도구의-재사용-범위"></a>[기존 도구의 재사용 범위 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#기존-도구의-재사용-범위)
- <a id="rule-재점검-원문--score-production-rulesmd--1"></a>[Rule 재점검 원문 — SCORE-PRODUCTION-RULES.md / 1 원문](../records/archive/adr-0018-reusable-score-production-and-handoff-sources.md#rule-재점검-원문--score-production-rulesmd--1)

</details>
