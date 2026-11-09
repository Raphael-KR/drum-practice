---
status: accepted
date: 2026-11-09
---

# 로컬 제작기와 공개 연습실의 운영 범위를 구분한다

## Context and Problem Statement

제작 도구·개인 원본과 공개 재생 배포의 책임 및 저장 기능을 구분해야 했다. 원래 결정 시기는 2026-10-13 이후이며, YAML 날짜는 이번 문서 정리일이다.

## Considered Options

* 제작 기능과 독립 HTML 저장까지 공개 재생 앱에 포함한다.
* 제작기는 로컬 전용으로 두고 player와 지정 자산만 공개한다.

## Decision Outcome

후자를 채택한다. 독립 HTML 저장·내보내기는 폐기하고 웹앱 진입점·제작기 백업·.drumscore는 유지한다. 재생 앱의 자동 보관 이력·복원·업데이트는 제거하되 명시적 음원 JSON 백업은 ADR-0022의 별도 계약이다.

### Consequences

공개 분석 서버 폐기는 ADR-0026, 정본 조판은 ADR-0004를 따른다. 운영 사본은 개발 정본을 독립 수정하지 않는다. 새 기능·삭제·전송·배포 승인을 추가하지 않는다.

### Confirmation

현행 계약과 실행 절차는 [PRD](../../PRD.md), [배포 Rule](../reference/engineering/release.md#deployment-rules--배포-범위와-소스-권위), [발행 절차](../how-to/release.md#sites-publication--sites-발행-절차)에서 확인한다. 아래 당시 검증 수치·실패·미확인은 해당 환경의 기록이며 이번 작업에서 앱·악보 검증을 다시 수행한 결과가 아니다.

## More Information

[이관 원문과 당시 검증 기록](../records/archive/adr-0020-local-editor-and-public-player-sources.md)을 별도 보존한다. 결정 요약과 승인 범위는 유지하며, 과거 원문은 현재 동작이나 이번 검증 결과가 아니다.

<details>
<summary>기존 원문 문단 주소</summary>

- <a id="이관-원문--prdmd--1"></a>[이관 원문 — PRD.md / 1 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#이관-원문--prdmd--1)
- <a id="드럼연습실-제품-기준"></a>[드럼연습실 제품 기준 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#드럼연습실-제품-기준)
- <a id="이관-원문--prdmd--2"></a>[이관 원문 — PRD.md / 2 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#이관-원문--prdmd--2)
- <a id="앱과-입력"></a>[앱과 입력 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#앱과-입력)
- <a id="이관-원문--prdmd--3"></a>[이관 원문 — PRD.md / 3 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#이관-원문--prdmd--3)
- <a id="악보-선택"></a>[악보 선택 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#악보-선택)
- <a id="이관-원문--prdmd--4"></a>[이관 원문 — PRD.md / 4 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#이관-원문--prdmd--4)
- <a id="연습과-탐색"></a>[연습과 탐색 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#연습과-탐색)
- <a id="이관-원문--prdmd--5"></a>[이관 원문 — PRD.md / 5 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#이관-원문--prdmd--5)
- <a id="기기와-저장"></a>[기기와 저장 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#기기와-저장)
- <a id="이관-원문--prdmd--6"></a>[이관 원문 — PRD.md / 6 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#이관-원문--prdmd--6)
- <a id="정본과-수용-상태"></a>[정본과 수용 상태 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#정본과-수용-상태)
- <a id="이관-원문--prdmd--7"></a>[이관 원문 — PRD.md / 7 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#이관-원문--prdmd--7)
- <a id="음원-분석의-기기-내부-처리-2026-10-14-최신-결정"></a>[음원 분석의 기기 내부 처리 (2026-10-14 최신 결정) 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#음원-분석의-기기-내부-처리-2026-10-14-최신-결정)
- <a id="이관-원문--prdmd--8"></a>[이관 원문 — PRD.md / 8 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#이관-원문--prdmd--8)
- <a id="음원-연습-정보-파일-2026-10-15"></a>[음원 연습 정보 파일 (2026-10-15) 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#음원-연습-정보-파일-2026-10-15)
- <a id="이관-원문--open-source-noticesmd--1"></a>[이관 원문 — OPEN-SOURCE-NOTICES.md / 1 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#이관-원문--open-source-noticesmd--1)
- <a id="오픈소스-고지"></a>[오픈소스 고지 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#오픈소스-고지)
- <a id="이관-원문--open-source-noticesmd--2"></a>[이관 원문 — OPEN-SOURCE-NOTICES.md / 2 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#이관-원문--open-source-noticesmd--2)
- <a id="배포물의-표시"></a>[배포물의 표시 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#배포물의-표시)
- <a id="이관-원문--open-source-noticesmd--3"></a>[이관 원문 — OPEN-SOURCE-NOTICES.md / 3 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#이관-원문--open-source-noticesmd--3)
- <a id="생성-및-검증"></a>[생성 및 검증 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#생성-및-검증)
- <a id="이관-원문--open-source-noticesmd--4"></a>[이관 원문 — OPEN-SOURCE-NOTICES.md / 4 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#이관-원문--open-source-noticesmd--4)
- <a id="범위와-외부-배포-확인-항목"></a>[범위와 외부 배포 확인 항목 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#범위와-외부-배포-확인-항목)
- <a id="이관-원문--ux-principlesmd--43"></a>[이관 원문 — UX-PRINCIPLES.md / 43 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#이관-원문--ux-principlesmd--43)
- <a id="2026-10-13-드럼연습실-백업복원업데이트-제거-이전-해당-규칙-대체"></a>[2026-10-13 드럼연습실 백업·복원·업데이트 제거 (이전 해당 규칙 대체) 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#2026-10-13-드럼연습실-백업복원업데이트-제거-이전-해당-규칙-대체)
- <a id="이관-원문--sites-publicationmd--1"></a>[이관 원문 — SITES-PUBLICATION.md / 1 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#이관-원문--sites-publicationmd--1)
- <a id="sites-발행"></a>[Sites 발행 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#sites-발행)
- <a id="이관-원문--sites-publicationmd--2"></a>[이관 원문 — SITES-PUBLICATION.md / 2 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#이관-원문--sites-publicationmd--2)
- <a id="정본과-배포-구조"></a>[정본과 배포 구조 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#정본과-배포-구조)
- <a id="이관-원문--sites-publicationmd--3"></a>[이관 원문 — SITES-PUBLICATION.md / 3 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#이관-원문--sites-publicationmd--3)
- <a id="발행-순서"></a>[발행 순서 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#발행-순서)
- <a id="이관-원문--sites-publicationmd--25"></a>[이관 원문 — SITES-PUBLICATION.md / 25 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#이관-원문--sites-publicationmd--25)
- <a id="html-보안-헤더-전달"></a>[HTML 보안 헤더 전달 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#html-보안-헤더-전달)
- <a id="rule-재점검-원문--agentsmd--1"></a>[Rule 재점검 원문 — AGENTS.md / 1 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#rule-재점검-원문--agentsmd--1)
- <a id="rule-재점검-원문--playback-screen-inventorymd--1"></a>[Rule 재점검 원문 — PLAYBACK-SCREEN-INVENTORY.md / 1 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#rule-재점검-원문--playback-screen-inventorymd--1)
- <a id="rule-재점검-원문--ux-principlesmd--16"></a>[Rule 재점검 원문 — UX-PRINCIPLES.md / 16 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#rule-재점검-원문--ux-principlesmd--16)
- <a id="rule-재점검-원문--deployment-rulesmd--1"></a>[Rule 재점검 원문 — DEPLOYMENT-RULES.md / 1 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#rule-재점검-원문--deployment-rulesmd--1)
- <a id="rule-재점검-원문--deployment-rulesmd--2"></a>[Rule 재점검 원문 — DEPLOYMENT-RULES.md / 2 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#rule-재점검-원문--deployment-rulesmd--2)
- <a id="rule-재점검-원문--open-source-noticesmd--1"></a>[Rule 재점검 원문 — OPEN-SOURCE-NOTICES.md / 1 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#rule-재점검-원문--open-source-noticesmd--1)
- <a id="rule-재점검-원문--open-source-noticesmd--3"></a>[Rule 재점검 원문 — OPEN-SOURCE-NOTICES.md / 3 원문](../records/archive/adr-0020-local-editor-and-public-player-sources.md#rule-재점검-원문--open-source-noticesmd--3)

</details>
