# 프로젝트 문서 안내

현재 요구사항은 [Rule 목록](RULES-INDEX.md), 선택 이유는 [결정 이력](decisions/README.md), 실제 수행 결과는 [기록](records/README.md)에서 찾는다. 작업 전 [프로젝트 지침](../AGENTS.md)을 적용한다.

| 할 일 | 시작 절차 | 필요한 정본 |
| --- | --- | --- |
| PDF·음원·유튜브로 악보 제작 | [접수부터 인계까지](how-to/produce-score.md) | [제작 기준](reference/score/production.md) → [MusicXML](reference/score/musicxml.md) → [악기·주법](reference/score/notation.md) → [조판](reference/score/rendering.md) |
| 악보·패키지 검수 | [검수 절차](how-to/review-score.md) | [파일 형식](reference/score/file-formats.md), [검증 기준](reference/engineering/verification.md) |
| 가사 교정 | [교정 절차](how-to/correct-lyrics.md) | [음악적 가사 위치](reference/score/musicxml.md), [선택적 수동 교정 범위](reference/score/production.md) |
| 요청된 드럼 음원 제작 | [음원 제작](how-to/render-drum-audio.md) | [드럼킷](reference/score/drum-kits.md), [공통 도구](reference/score/tools.md) |
| 앱 개발 | [개발 절차](how-to/develop.md) | [구조](reference/engineering/architecture.md) → [UX](reference/product/ux.md) → [재생](reference/product/playback.md)·[음원](reference/product/audio-practice.md)·[제작기](reference/product/editor.md) |
| 다른 프로젝트의 pnpm 전환 | [공통 저장소·중앙 YAML 연결](how-to/adopt-shared-pnpm-catalog.md) | [공유 의존성 결정](decisions/0028-shared-dependency-store-and-catalog.md) |
| 코드·화면 검사 | [검사 절차](how-to/verify.md), [iPad](how-to/verify-ipad.md) | [검증 기준](reference/engineering/verification.md) |
| Apple 로컬 분석 | [로컬 도구 사용](how-to/use-apple-local-tools.md) | [도구 계약](reference/score/tools.md) |
| 승인된 릴리스 | [버전·발행 절차](how-to/release.md) | [릴리스](reference/engineering/release.md), [보안](reference/engineering/security.md), [고지](reference/engineering/third-party-notices.md) |
| 과거 근거 찾기 | [곡·주제별 기록](records/README.md), [ADR 목록](decisions/README.md) | [문서 관리](reference/engineering/documentation.md) |

악보 제작은 첫 행의 네 정본을 기본으로 읽고, 드럼킷·도구·특수 검수는 해당 작업이 필요할 때 추가한다. 과거 후보·검증 수치는 현행 Rule이나 이번 실행의 성공을 대신하지 않는다.

## 유지하는 특수 경로

- [화면 소유권 표](plans/PLAYBACK-SCREEN-INVENTORY.md): 검사 코드가 직접 읽는 유일한 표. `plans/`의 기계 입력 예외다.
- [UI 컴포넌트 목록](product/UI-COMPONENTS.md): 코드 카탈로그에서 생성하는 참조다.
- [범례 자산 안내](design/legend-diagram/README.md), [Pretendard 배치·라이선스](../src/modules/score/vendor/pretendard/README.md): 생성·자산 경로를 유지한다.
- 코드·인계 설정이 참조하는 이전 주소와 과거 문단 진입점은 유지한다. 완료된 작업의 `plans/` 안내 파일은 진행 중 계획이 아니며, 실제 결과는 [완료 기록 목록](records/README.md#완료-계획연구과거-시안)에서 찾는다. 통합 때 삭제한 주소의 새 목적지는 [원문 이전표](records/documentation-migration.md)를 따른다. 새 작업에서는 위 절차와 정본을 사용한다.

<details>
<summary>이전 문단 주소</summary>

- <a id="개발운영"></a>[이전 개발운영](records/archive/documentation-reorganization.md#docs-readme--개발운영)
- <a id="악보-제작표시-정본"></a>[이전 악보-제작표시-정본](records/archive/documentation-reorganization.md#docs-readme--악보-제작표시-정본)
- <a id="보존한-제작-자료"></a>[이전 보존한-제작-자료](records/archive/documentation-reorganization.md#docs-readme--보존한-제작-자료)
- <a id="기록-유지-규칙"></a>[이전 기록-유지-규칙](records/archive/documentation-reorganization.md#docs-readme--기록-유지-규칙)

</details>
