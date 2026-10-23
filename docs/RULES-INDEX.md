# 현행 Rule 목록

루트 지침·제품 기준 2개와 분야별 정본 18개, 총 **20개 주 진입점**이다. 실행 순서는 [작업별 안내](README.md), 선택 이유는 [ADR](decisions/README.md), 실제 결과는 [기록](records/README.md)에서 찾는다.

현재 사용자 요청·이미 승인된 결정을 범위 안에서 우선하며, [전역 지침](/Users/raphael/AGENTS.md)과 가장 가까운 [프로젝트 지침](../AGENTS.md)을 적용한다. 과거 후보·기록이 정본을 덮어쓰지 않는다. 기계 원천인 앱 버전·UI/i18n 카탈로그·스키마·lockfile의 값을 이 목록에 복제하지 않는다.

| 분야 | 정본 |
| --- | --- |
| 실행 | [프로젝트 지침](../AGENTS.md) |
| 제품 | [제품 목표·범위·수용 기준](../PRD.md) |
| 개발·운영 | [프로젝트 구조와 책임](reference/engineering/architecture.md) |
| 개발·운영 | [문서 관리](reference/engineering/documentation.md) |
| 개발·운영 | [한국어 문구와 국제화](reference/engineering/i18n.md) |
| 개발·운영 | [버전과 공개 범위](reference/engineering/release.md) |
| 개발·운영 | [기기 내부 처리와 보안](reference/engineering/security.md) |
| 개발·운영 | [오픈소스 고지](reference/engineering/third-party-notices.md) |
| 개발·운영 | [검증 범위와 증거](reference/engineering/verification.md) |
| 제품 | [음원 연습](reference/product/audio-practice.md) |
| 제품 | [제작기 편집과 악보 검수 화면](reference/product/editor.md) |
| 제품 | [재생 설정과 탐색](reference/product/playback.md) |
| 제품 | [UX와 공통 화면](reference/product/ux.md) |
| 악보 | [드럼킷 선택과 보존](reference/score/drum-kits.md) |
| 악보 | [악보 패키지와 음원 연습 파일](reference/score/file-formats.md) |
| 악보 | [MusicXML 입력과 정본 계약](reference/score/musicxml.md) |
| 악보 | [드럼 악기와 주법 표기](reference/score/notation.md) |
| 악보 | [악보 제작 기준](reference/score/production.md) |
| 악보 | [악보 조판과 표시](reference/score/rendering.md) |
| 악보 | [공통 제작 도구와 로컬 분석 계약](reference/score/tools.md) |

## 기계 입력 예외

[화면 소유권 표](plans/PLAYBACK-SCREEN-INVENTORY.md)의 P01–P25·E01–E06은 검사 코드가 직접 읽으므로 원래 경로와 표를 유지한다. 정본 20개 외의 별도 기계 입력이며 두 번째 사본을 만들지 않는다. 생성 UI·자산 문서는 [문서 안내](README.md#유지하는-특수-경로)를 따른다. 전체 원문 분류와 이관 검증은 [문서 기록](records/documentation.md)에 두며 여기에는 나열하지 않는다.

<details>
<summary>이전 문단 주소</summary>

- <a id="프로젝트-전체-rule-목록"></a>[이전 프로젝트-전체-rule-목록](records/archive/documentation-reorganization.md#rules-index--프로젝트-전체-rule-목록)
- <a id="적용-순서와-권위"></a>[이전 적용-순서와-권위](records/archive/documentation-reorganization.md#rules-index--적용-순서와-권위)
- <a id="현행-rule"></a>[이전 현행-rule](records/archive/documentation-reorganization.md#rules-index--현행-rule)
- <a id="전체-markdown-문서-분류"></a>[이전 전체-markdown-문서-분류](records/archive/documentation-reorganization.md#rules-index--전체-markdown-문서-분류)
- <a id="유지와-검증"></a>[이전 유지와-검증](records/archive/documentation-reorganization.md#rules-index--유지와-검증)

</details>
