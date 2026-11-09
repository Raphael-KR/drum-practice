---
status: accepted
date: 2026-11-09
---

# 개인 음원과 분석 캐시는 기기 내부에서 처리한다

## Context and Problem Statement

서버 분석 공유·익명 등록·검토/승인과 개인 음원 연습의 운영 경계를 단순화하기로 했다. 원래 결정 시기는 2026-10-14~15이며, YAML 날짜는 이번 문서 정리일이다.

## Considered Options

* 분석 API·서버 DB·승인 UI를 유지한다.
* 분석과 해시 기반 재사용을 현재 브라우저 안에서만 수행한다.

## Decision Outcome

2026-10-14 사용자 최종 결정으로 후자를 채택한다. 서버 .drumscore 다운로드는 유지하고 서버 분석 API·자료·인증 경로는 폐기한다. 로컬 캐시 실패가 네트워크 우회로 이어지지 않는다.

### Consequences

과거 원격 DROP 적용·테이블 확인은 배포 기록에 보존한다. 공급자 내부 백업까지 삭제됐다고 주장하지 않는다. 디코딩 상한은 메모리 전체 보증과 다르다. 새 기능·삭제·전송·배포 승인을 추가하지 않는다.

### Confirmation

현행 계약과 실행 절차는 [음원 Rule](../reference/product/audio-practice.md#audio-practice--음원-연습), [보안 Rule](../reference/engineering/security.md#site-security-hardening--공개-사이트-보안과-음원-분석-경계), [발행 기록](../records/releases.md#sites-publication-history--sites-발행공개-확인-기록)에서 확인한다. 아래 당시 검증 수치·실패·미확인은 해당 환경의 기록이며 이번 작업에서 앱·악보 검증을 다시 수행한 결과가 아니다.

## More Information

[이관 원문과 당시 검증 기록](../records/archive/adr-0026-device-local-audio-analysis-sources.md)을 별도 보존한다. 결정 요약과 승인 범위는 유지하며, 과거 원문은 현재 동작이나 이번 검증 결과가 아니다.

<details>
<summary>기존 원문 문단 주소</summary>

- <a id="이관-원문--site-security-hardeningmd--1"></a>[이관 원문 — SITE-SECURITY-HARDENING.md / 1 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--site-security-hardeningmd--1)
- <a id="공개-사이트-보안과-음원-분석-경계"></a>[공개 사이트 보안과 음원 분석 경계 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#공개-사이트-보안과-음원-분석-경계)
- <a id="이관-원문--site-security-hardeningmd--2"></a>[이관 원문 — SITE-SECURITY-HARDENING.md / 2 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--site-security-hardeningmd--2)
- <a id="남기는-보호-조치"></a>[남기는 보호 조치 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#남기는-보호-조치)
- <a id="이관-원문--site-security-hardeningmd--3"></a>[이관 원문 — SITE-SECURITY-HARDENING.md / 3 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--site-security-hardeningmd--3)
- <a id="폐기와-배포-경계"></a>[폐기와 배포 경계 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#폐기와-배포-경계)
- <a id="이관-원문--site-security-hardeningmd--4"></a>[이관 원문 — SITE-SECURITY-HARDENING.md / 4 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--site-security-hardeningmd--4)
- <a id="079-공개-확인"></a>[0.7.9 공개 확인 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#079-공개-확인)
- <a id="이관-원문--ux-principlesmd--70"></a>[이관 원문 — UX-PRINCIPLES.md / 70 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--ux-principlesmd--70)
- <a id="2026-10-13--음원-불러오기-통합-가져오기-결정-변경"></a>[2026-10-13 — 음원 불러오기 (통합 가져오기 결정 변경) 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#2026-10-13--음원-불러오기-통합-가져오기-결정-변경)
- <a id="이관-원문--ux-principlesmd--73"></a>[이관 원문 — UX-PRINCIPLES.md / 73 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--ux-principlesmd--73)
- <a id="음원-파형-스크롤-2026-10-13"></a>[음원 파형 스크롤 (2026-10-13) 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#음원-파형-스크롤-2026-10-13)
- <a id="이관-원문--ux-principlesmd--77"></a>[이관 원문 — UX-PRINCIPLES.md / 77 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--ux-principlesmd--77)
- <a id="음원-1마디-시작-기준-2026-10-13"></a>[음원 1마디 시작 기준 (2026-10-13) 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#음원-1마디-시작-기준-2026-10-13)
- <a id="이관-원문--ux-principlesmd--84"></a>[이관 원문 — UX-PRINCIPLES.md / 84 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--ux-principlesmd--84)
- <a id="박자-맞추기-파형과-시작점-2026-10-15"></a>[박자 맞추기 파형과 시작점 (2026-10-15) 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#박자-맞추기-파형과-시작점-2026-10-15)
- <a id="이관-원문--ux-principlesmd--85"></a>[이관 원문 — UX-PRINCIPLES.md / 85 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--ux-principlesmd--85)
- <a id="박자-맞추기의-메트로놈-2026-10-15"></a>[박자 맞추기의 메트로놈 (2026-10-15) 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#박자-맞추기의-메트로놈-2026-10-15)
- <a id="이관-원문--ux-principlesmd--86"></a>[이관 원문 — UX-PRINCIPLES.md / 86 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--ux-principlesmd--86)
- <a id="박자-맞추기-재생바-속도-2026-10-15"></a>[박자 맞추기 재생바 속도 (2026-10-15) 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#박자-맞추기-재생바-속도-2026-10-15)
- <a id="이관-원문--ux-principlesmd--87"></a>[이관 원문 — UX-PRINCIPLES.md / 87 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--ux-principlesmd--87)
- <a id="박자-맞추기-설명-순서-2026-10-15"></a>[박자 맞추기 설명 순서 (2026-10-15) 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#박자-맞추기-설명-순서-2026-10-15)
- <a id="이관-원문--audio-practicemd--1"></a>[이관 원문 — AUDIO-PRACTICE.md / 1 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--audio-practicemd--1)
- <a id="음원-연습--현재-동작"></a>[음원 연습 — 현재 동작 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#음원-연습--현재-동작)
- <a id="이관-원문--audio-practicemd--2"></a>[이관 원문 — AUDIO-PRACTICE.md / 2 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--audio-practicemd--2)
- <a id="가져오기와-곡-정보"></a>[가져오기와 곡 정보 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#가져오기와-곡-정보)
- <a id="이관-원문--audio-practicemd--3"></a>[이관 원문 — AUDIO-PRACTICE.md / 3 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--audio-practicemd--3)
- <a id="박자와-템포"></a>[박자와 템포 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#박자와-템포)
- <a id="이관-원문--audio-practicemd--4"></a>[이관 원문 — AUDIO-PRACTICE.md / 4 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--audio-practicemd--4)
- <a id="기기-내-분석정보-재사용-2026-10-14-079-공개-반영"></a>[기기 내 분석정보 재사용 (2026-10-14, 0.7.9 공개 반영) 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#기기-내-분석정보-재사용-2026-10-14-079-공개-반영)
- <a id="이관-원문--audio-practicemd--5"></a>[이관 원문 — AUDIO-PRACTICE.md / 5 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--audio-practicemd--5)
- <a id="연주-전과-1마디-1박"></a>[연주 전과 1마디 1박 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#연주-전과-1마디-1박)
- <a id="이관-원문--audio-practicemd--6"></a>[이관 원문 — AUDIO-PRACTICE.md / 6 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--audio-practicemd--6)
- <a id="검증과-한계"></a>[검증과 한계 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#검증과-한계)
- <a id="이관-원문--audio-practicemd--9"></a>[이관 원문 — AUDIO-PRACTICE.md / 9 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--audio-practicemd--9)
- <a id="박자-맞추기-파형-조작-2026-10-15"></a>[박자 맞추기 파형 조작 (2026-10-15) 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#박자-맞추기-파형-조작-2026-10-15)
- <a id="이관-원문--audio-practicemd--10"></a>[이관 원문 — AUDIO-PRACTICE.md / 10 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--audio-practicemd--10)
- <a id="박자-맞추기-전용-메트로놈-2026-10-15"></a>[박자 맞추기 전용 메트로놈 (2026-10-15) 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#박자-맞추기-전용-메트로놈-2026-10-15)
- <a id="이관-원문--audio-practicemd--11"></a>[이관 원문 — AUDIO-PRACTICE.md / 11 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--audio-practicemd--11)
- <a id="박자-맞추기-재생-속도-2026-10-15"></a>[박자 맞추기 재생 속도 (2026-10-15) 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#박자-맞추기-재생-속도-2026-10-15)
- <a id="이관-원문--audio-practicemd--12"></a>[이관 원문 — AUDIO-PRACTICE.md / 12 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--audio-practicemd--12)
- <a id="악보-bpm박자-선택-2026-10-15"></a>[악보 BPM·박자 선택 (2026-10-15) 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#악보-bpm박자-선택-2026-10-15)
- <a id="이관-원문--audio-practicemd--13"></a>[이관 원문 — AUDIO-PRACTICE.md / 13 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#이관-원문--audio-practicemd--13)
- <a id="조정-제목줄-동작-2026-10-15"></a>[조정 제목줄 동작 (2026-10-15) 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#조정-제목줄-동작-2026-10-15)
- <a id="rule-재점검-원문--prdmd--3"></a>[Rule 재점검 원문 — PRD.md / 3 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#rule-재점검-원문--prdmd--3)
- <a id="음원-분석의-기기-내부-처리-2026-10-14-최신-결정"></a>[음원 분석의 기기 내부 처리 (2026-10-14 최신 결정) 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#음원-분석의-기기-내부-처리-2026-10-14-최신-결정)
- <a id="rule-재점검-원문--prdmd--5"></a>[Rule 재점검 원문 — PRD.md / 5 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#rule-재점검-원문--prdmd--5)
- <a id="rule-재점검-원문--ux-principlesmd--14"></a>[Rule 재점검 원문 — UX-PRINCIPLES.md / 14 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#rule-재점검-원문--ux-principlesmd--14)
- <a id="박자-맞추기-설명-순서"></a>[박자 맞추기 설명 순서 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#박자-맞추기-설명-순서)
- <a id="rule-재점검-원문--audio-practicemd--11"></a>[Rule 재점검 원문 — AUDIO-PRACTICE.md / 11 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#rule-재점검-원문--audio-practicemd--11)
- <a id="rule-재점검-원문--site-security-hardeningmd--3"></a>[Rule 재점검 원문 — SITE-SECURITY-HARDENING.md / 3 원문](../records/archive/adr-0026-device-local-audio-analysis-sources.md#rule-재점검-원문--site-security-hardeningmd--3)

</details>
