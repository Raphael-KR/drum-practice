# 문서 재구성 계획과 실행 이력

문서 역할: **사실·연구 기록**. 원문 날짜·입력·환경·결과·실패·미확인은 각 절의 당시 상태다. 이번 통합에서 과거 검증을 재실행하지 않았으며, 기록의 “현재”는 원래 작성 시점이다. [기록 안내](../README.md)와 [현행 정본](../../RULES-INDEX.md)을 구분한다.

<a id="rule-documentation-reorganization--프로젝트-rule-문서-정리"></a>

## 프로젝트 Rule 문서 정리

- 목표: 프로젝트 전체의 현행 Rule·실행 절차·결정 이력을 각각 찾을 수 있게 한다.
- 범위: Markdown 문서 목록화, 혼합 문서 분리, 기존 ADR 재사용, 참조 경로 유지.
- 완료 조건: 모든 대상 문서의 역할을 분류하고, 이관한 원문과 현행 규칙·링크의 보존을 확인한다.
- 제외: 앱 코드·설정·악보·미디어·생성 자산 수정, 앱 실행·배포·커밋·푸시.
- 검증: 변경 전 해시와 원문 대조, 현행 계약 값·기존 앵커·로컬 링크·MADR 구조·목록 누락 검사, 문서 검사와 공백 검사.


원문 출처: `docs/plans/RULE-DOCUMENTATION-REORGANIZATION.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="rule-documentation-reorganization--분리-기준"></a>

### 분리 기준

1. Rule은 지금 따라야 하는 요구·금지·계약을 담는다. 이미 정리된 정본은 유지한다.
2. 실행 절차는 입력·순서·명령·완료 확인을 담는다. 기존 프로세스·운영 문서를 우선 재사용한다.
3. ADR은 선택 이유·대안·대체 경로를 담는다. 같은 결정은 기존 ADR에 연결한다.
4. 배포 식별자·실측값·검수 로그·곡별 산출물은 사실 기록이다. 결정으로 꾸미지 않고 기록/참고 문서로 구분한다.
5. 과거 내용은 이관 원문과 출처를 보존하고, 현행 문서의 기존 경로와 필요한 문단 앵커는 유지한다.

<a id="rule-documentation-reorganization--결과"></a>

### 결과

[Rule 목록](../../RULES-INDEX.md)에 Markdown 146개를 분류하고, 현행 Rule 35개·[실행 절차](../../README.md) 17개·[결정 이력](../../decisions/README.md) 27개를 연결했다. 기존 ADR 16개는 재사용하고 나머지 11개는 이미 결정된 다른 주제를 이관했다.

이관 원문 338개와 현행 문구 75개, 주요 계약 값·기존 앵커·로컬 링크·변경 범위를 대조했다. [검증 기록](../documentation.md#rule-documentation-verification-20261023--프로젝트-rule-문서-정리-검증--2026-10-23)에 실행 명령·결과·한계를 남겼다. 앱 코드·설정·악보와 기존 미커밋 변경은 보존했다.

<a id="rule-documentation-reorganization--현행-rule-잔여-이력-재점검"></a>

### 현행 Rule 잔여 이력 재점검

- 목표: 전체 Rule의 결정 이유·폐기 시안·날짜별 검증 잔여물을 제거한다.
- 범위: 현행 Rule 35개를 본문 단위로 재검토하고 기존 ADR·사실 기록·실행 절차로 분리한다.
- 완료 조건: 35개별 판정, 이관 원문·현재 계약·기존 문단 주소 보존, 전체 목록/링크 검사.
- 제외: 앱 코드·설정·스킬·악보·미디어·생성 자산 변경, 앱 실행·배포·커밋·푸시.
- 검증: 이번 시작 상태의 684개 파일 해시·146개 Markdown 원문과 대조하고 원문·계약·MADR·앵커·링크·문서 범위를 검사한다.

결과: 31개 Rule의 잔여 서술을 정리하고 4개는 그대로 유지했다. 기존 ADR 27개를 재사용했으며 새 ADR은 없다. 현재 문서는 재점검 기록을 포함하여 148개다. [35개 파일별 판정과 검증](../documentation.md#rule-residue-audit-20261023--현행-rule-잔여-이력-재점검--2026-10-23)에 세부 범위·원문 보존·미실행 항목을 기록했다. 앞선 검증 수치를 이번 실행으로 덮어쓰지 않는다.

최종 문서 수에는 다른 작업에서 추가한 [미착수 통합 계획](documentation-reorganization.md#documentation-consolidation--프로젝트-문서-구조-통합-실행-계획) 1개도 포함한다. 해당 계획의 본문과 실행 상태는 변경하지 않았다.

**실행은 완료되었다.** 아래는 승인된 설계 시점 원문(당시 미착수 상태·체크리스트 포함)이며, 실제 완료 판정은 [통합 실행 기록](../documentation.md#통합-실행--2026-10-23)을 따른다.

<a id="documentation-consolidation--프로젝트-문서-구조-통합-실행-계획"></a>

## 프로젝트 문서 구조 통합 실행 계획


- 상태: 실행 계획 작성. 문서 통합·이동은 미착수.
- 작성일: 2026-10-23.
- 작업 루트: `/Users/raphael/Playground/drum-practice`.
- 목표: 현행 정본 35개를 약 20개 주제로 통합하고 작업별 읽기 경로를 짧게 만든다.
- 범위: Markdown의 내용 통합·이관·참조 갱신, 프로젝트 지침과 스킬의 문서 참조 갱신, 기존 ADR 재사용.
- 완료 조건: 기존 규칙·계약·기록의 의미와 출처가 보존되고, 모든 대상의 이전 위치·새 위치·처리 상태가 확인되며, 링크와 코드 의존 경로가 유효하다.
- 제외: 앱·검사·제작 도구 코드, 설정·의존성·버전, 악보·음원·생성 자산 변경, 실행 서버 조작, 커밋·push·merge·배포.
- 검증: 현재 작업 상태와 파일 해시 확보 → 원문·계약·참조 대조 → 문서 검사 → 비대상 변경 여부 확인.


원문 출처: `docs/plans/documentation-consolidation.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="documentation-consolidation--1-적용-상태와-선행-작업"></a>

### 1. 적용 상태와 선행 작업

이 문서는 사이드 대화에서 요청된 구조안을 실행할 수 있게 구체화한 계획이다. 이번 요청으로 작성하는 파일은 이 계획 한 개다. 계획 작성은 통합 실행이나 기존 파일 삭제의 완료를 뜻하지 않는다.

선행 작업은 [Rule·절차·이력 분리 계획](documentation-reorganization.md#rule-documentation-reorganization--프로젝트-rule-문서-정리)이다. 해당 작업의 잔여물 재검토와 동시에 같은 문서를 편집하지 않는다. 실행 시 최신 파일과 [현행 목록](../../RULES-INDEX.md)을 다시 읽고, 이미 완료된 이관을 반복하지 않는다. 이전 검증 수나 임시 스냅샷을 새 작업의 기준으로 그대로 사용하지 않는다.

작성 시 저장소에는 앱·악보 도구·문서의 기존 미커밋 변경이 있다. 실행자는 `pwd`, 브랜치·HEAD·working tree를 다시 확인한다. 기존 변경을 정리·되돌리거나 이 계획의 변경으로 보고하지 않는다. 대상 문서가 다른 작업에서 계속 수정 중이면 해당 파일의 통합을 유보하고 독립적인 파일부터 처리한다.

<a id="documentation-consolidation--2-설계-기준"></a>

### 2. 설계 기준

| 근거 | 적용 | 적용하지 않는 해석 |
| --- | --- | --- |
| [ISO/IEC/IEEE 15289:2019](https://www.iso.org/standard/74909.html) | 목적과 내용이 같은 정보 항목을 프로젝트 필요에 맞게 통합·분할 | 특정 폴더명·파일 수가 ISO 의무라는 주장, 전체 규격 준수 인증 |
| [Diátaxis](https://diataxis.fr/start-here/) | 기술 참조와 실행 방법, 배경 설명을 독자의 목적에 맞게 구분 | 네 종류의 빈 폴더나 문서를 의무적으로 생성 |
| [MADR 4.0](https://adr.github.io/madr/) | 중요한 결정의 맥락·대안·선택·결과를 기존 ADR에 기록 | 모든 검증·작업 로그를 새 ADR로 생성 |

폴더 구조와 통합 수는 이 프로젝트의 설계 선택이다. 규칙 20개는 목표 주제 수이며 강제 상한이나 검증 통과 조건이 아니다. 독립된 계약을 숫자에 맞추려고 삭제하거나 모호하게 합치지 않는다.

- 현재 요구·금지·필드·지원 범위는 `reference/`에 둔다.
- 입력·순서·실행 명령·종료 확인은 `how-to/`에 둔다.
- 결정의 이유·고려한 대안·대체 관계는 `decisions/`에 둔다.
- 실제 수행·검증·측정·발행 결과는 `records/`에 둔다.
- 곡별 값·예외·판독·인계는 `records/songs/`에 둔다. 다른 곡의 공통 기본값으로 승격하지 않는다.
- 완료된 계획·과거 연구·폐기된 시안은 `records/archive/`에 둔다. 진행 중인 계획만 `plans/`에 남긴다.
- 규칙 본문은 한 곳에 둔다. 다른 문서는 링크로 연결한다. 스킬은 작업 순서를 제공하며 정본의 긴 규칙을 복제하지 않는다.

<a id="documentation-consolidation--3-목표-파일-구조"></a>

### 3. 목표 파일 구조

일반 신규 문서는 소문자·하이픈을 사용한다. 루트 관례 파일과 기존 ADR 파일명은 유지한다. 아래는 목표 구조이며, 코드 의존·생성 문서·기존 링크를 위한 예외 파일은 7절에 따른다. 빈 폴더나 빈 문서는 만들지 않는다.

```text
drum-practice/
├── AGENTS.md
├── README.md
├── PRD.md
├── history.md
├── .agents/skills/                         # 기존 스킬 경로 유지
│   ├── produce-drum-score/SKILL.md
│   ├── release-drum-practice/SKILL.md
│   └── find-timed-lyrics/
│       ├── SKILL.md
│       └── references/sources.md
└── docs/
    ├── README.md                          # 작업별 안내
    ├── RULES-INDEX.md                     # 현행 정본 목록
    ├── reference/
    │   ├── product/
    │   │   ├── ux.md
    │   │   ├── playback.md
    │   │   ├── audio-practice.md
    │   │   └── editor.md
    │   ├── score/
    │   │   ├── musicxml.md
    │   │   ├── notation.md
    │   │   ├── rendering.md
    │   │   ├── production.md
    │   │   ├── tools.md
    │   │   ├── drum-kits.md
    │   │   └── file-formats.md
    │   └── engineering/
    │       ├── architecture.md
    │       ├── i18n.md
    │       ├── verification.md
    │       ├── release.md
    │       ├── security.md
    │       ├── third-party-notices.md
    │       └── documentation.md
    ├── how-to/
    │   ├── produce-score.md
    │   ├── review-score.md
    │   ├── render-drum-audio.md
    │   ├── correct-lyrics.md
    │   ├── develop.md
    │   ├── verify.md
    │   ├── release.md
    │   ├── verify-ipad.md
    │   └── use-apple-local-tools.md
    ├── decisions/
    │   ├── README.md
    │   ├── 0001-separate-svg-rules-and-decisions.md
    │   ├── 0002-svg-page-output.md
    │   ├── 0003-source-systems-and-cropping.md
    │   ├── 0004-browser-native-score-rendering.md
    │   ├── 0005-practice-layout-and-spacing.md
    │   ├── 0006-practice-navigation-and-overlays.md
    │   ├── 0007-native-drum-notation.md
    │   ├── 0008-continuous-playback-wedges.md
    │   ├── 0009-musicxml-section-direction-layout.md
    │   ├── 0010-pretendard-score-text.md
    │   ├── 0011-hi-hat-open-close-position.md
    │   ├── 0012-musicxml-canonical-source.md
    │   ├── 0013-score-based-lyric-positions.md
    │   ├── 0014-score-artist-and-kit-metadata.md
    │   ├── 0015-score-tempo-and-recording-estimates.md
    │   ├── 0016-explicit-recording-beat-connections.md
    │   ├── 0017-source-dependent-musicxml-conversion.md
    │   ├── 0018-reusable-score-production-and-handoff.md
    │   ├── 0019-preserved-drum-kit-selection.md
    │   ├── 0020-local-editor-and-public-player.md
    │   ├── 0021-contextual-help-and-shared-ui.md
    │   ├── 0022-portable-score-and-practice-files.md
    │   ├── 0023-shared-module-boundaries.md
    │   ├── 0024-korean-message-catalog.md
    │   ├── 0025-shared-app-release-version.md
    │   ├── 0026-device-local-audio-analysis.md
    │   └── 0027-verification-scope-and-device-evidence.md
    ├── records/
    │   ├── README.md
    │   ├── acceptance.md
    │   ├── releases.md
    │   ├── production-tools.md
    │   ├── apple-local-tools.md
    │   ├── ipad.md
    │   ├── documentation.md
    │   ├── songs/
    │   │   ├── real-paradis.md
    │   │   ├── loveholic.md
    │   │   ├── red-sunset.md
    │   │   ├── ioi-suddenly.md
    │   │   ├── tom-moving.md
    │   │   └── preplay-warmup.md
    │   └── archive/
    │       ├── project-restructuring.md
    │       ├── project-quality.md
    │       ├── documentation-reorganization.md
    │       ├── musicxml-evaluation.md
    │       ├── lyrics-research.md
    │       └── rendering-experiments.md
    └── plans/
        └── documentation-consolidation.md
```

ADR은 [기존 목록](../../decisions/README.md)의 실제 파일 27개를 그대로 사용한다. 다른 작업에서 ADR이 추가됐다면 그 식별자도 유지한다. 이 구조 변경은 기존 ADR-0001에 변경 근거를 보완하며, 파일 수를 맞추기 위해 기존 결정들을 합치거나 재번호화하지 않는다.

<a id="documentation-consolidation--4-현행-rule-이전표"></a>

### 4. 현행 Rule 이전표

출발 경로는 저장소 루트 기준이다. 도착 경로는 `docs/reference/` 기준이며, 루트 유지 항목은 별도 표기했다. 같은 도착 파일 안에서도 하위 계약은 독립 제목·앵커로 구분한다. 표는 최초 목록의 Rule 35개를 모두 대응한다.

| 도착 정본 | 출발 문서 | 통합 시 보존할 경계 |
| --- | --- | --- |
| 루트 `AGENTS.md` 유지 | `AGENTS.md` | 실행·권한 지침 유지. 이전 후 문서 경로만 갱신 |
| 루트 `PRD.md` 유지 | `PRD.md` | 제품 목표·범위·수용 조건. 세부 규칙 중복은 정본 링크로 대체 |
| `product/ux.md` | `docs/product/UX-PRINCIPLES.md` | 공통 UX·도움말·모달·반응형 규칙 |
| `product/playback.md` | `docs/product/SETTINGS-PLAYBACK.md`, `MARKER-SLOTS.md`, `PLAYBACK-ACTIONS.md`, `NOTE-PLAYBACK-HIGHLIGHT.md`, `PAUSED-SCORE-SCROLL.md` | 설정·마커·반복·카운트오프·탐색·강조. SVG 기하 계약은 rendering으로 연결 |
| `product/audio-practice.md` | `docs/product/AUDIO-PRACTICE.md` | 음원 분석·원곡/연습 템포·첫 박·파형·사용자 보정 |
| `product/editor.md` | `docs/product/SCORE-WORKSPACE.md`, `SCORE-REVIEW.md` | 편집 화면·폼 저장·PDF/XML 비교·캡처 동작 |
| `score/musicxml.md` | `docs/architecture/MUSICXML-INPUT.md`, `MUSICXML-CANONICAL.md`, `MEASURE-LYRICS.md` | 지원 입력·정본 원천·메타정보·음절/마디 가사·음원 연결. 각 저장 스키마 구분 |
| `score/notation.md` | `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md` | 승인 악기·주법·MusicXML 의미. 일반 도형 대체 승인 경계 |
| `score/rendering.md` | `docs/architecture/SVG-SCORE-RULES.md`, `BROWSER-MUSICXML-RENDERING.md`, `PDF-DISPLAY-TRIM.md` | 전체 페이지·연습 화면·PDF 자르기·공통 조판·캐시를 별도 절로 유지 |
| `score/production.md` | `docs/score-production/SCORE-PRODUCTION-RULES.md`, `MUSICXML-CONVERSION-POLICY.md`, `LYRIC-FEEDBACK-RULES.md` | 원본별 제작 경로·보존·악보 우선·인계. 별도 가사 싱크 요청을 일반 변환 의무와 분리 |
| `score/tools.md` | `docs/score-production/COMMON-TOOLS.md`, `docs/architecture/APPLE-LOCAL-REVIEW.md` | 공통 API·곡별 설정·독립 판독. STT/AFM은 선택적 보조이며 자동 확정 금지 |
| `score/drum-kits.md` | `docs/score-production/GARAGEBAND-DRUM-KITS.md` | SoCal/Portland 선택·보존본·주법 지원 한계 |
| `score/file-formats.md` | `docs/architecture/SCORE-PACKAGE.md`, `PRACTICE-FILE.md` | ZIP .drumscore와 음원 제외 JSON의 필드·상한·교체·복원 계약을 각각 유지 |
| `engineering/architecture.md` | `docs/architecture/PROJECT-STRUCTURE.md`, `docs/plans/PLAYBACK-SCREEN-INVENTORY.md` | 모듈 책임·의존·공통 화면 소유권. 기계 입력 표의 이전은 7절 예외 적용 |
| `engineering/i18n.md` | `docs/architecture/I18N.md` | 한국어 정본·문구 API·정확한 콘텐츠 예외 |
| `engineering/verification.md` | `docs/operations/VERIFICATION-RULES.md` | 검사 범위·영향별 승인·증거·실제 환경과 모사 구분 |
| `engineering/release.md` | `docs/operations/APP-VERSIONS.md`, `DEPLOYMENT-RULES.md` | 버전 정본·상승 기준·빌드·로컬 제작기/공개 player 경계 |
| `engineering/security.md` | `docs/operations/SITE-SECURITY-HARDENING.md` | 로컬 처리·외부 송신·입력 자원 제한·보안 헤더 |
| `engineering/third-party-notices.md` | `docs/operations/OPEN-SOURCE-NOTICES.md` | 라이선스 원문·고지 생성·배포 포함 범위 |
| `engineering/documentation.md` | `docs/DOCUMENTATION-RULES.md` | 문서 역할·권위·수명·변경·출처·링크 보존 |

<a id="documentation-consolidation--5-실행-절차-이전표"></a>

### 5. 실행 절차 이전표

아래 도착 경로는 `docs/how-to/` 기준이다. 실제 절차를 옮기되 규칙·결정·과거 결과를 함께 복사하지 않는다. 여러 도착 문서로 나눌 때는 원문 절별 대응을 기록한다.

| 도착 | 출발과 처리 |
| --- | --- |
| `produce-score.md` | `docs/score-production/SCORE-PRODUCTION-PROCESS.md`, `REUSABLE-PRODUCTION-WORKFLOW.md`, `docs/procedures/SCORE-TOOLS.md`: 접수·대표 평가·변환·계측·곡별 설정·인계 순서 통합 |
| `review-score.md` | 위 제작 절차의 검수·패키지 검사, `docs/procedures/UI-REVIEW.md`의 악보 검수, `PRACTICE-FILES.md`의 저장·재읽기 절차 |
| `render-drum-audio.md` | `docs/procedures/DRUM-AUDIO.md`: 요청된 음원 제작 절차 |
| `correct-lyrics.md` | 제작 절차와 `docs/score-production/LYRIC-SYNC-FEEDBACK.md`의 재사용 가능한 접수·교정 절차만. 곡별 피드백 표·검수 결과는 records로 이동 |
| `develop.md` | 루트 README의 상세 개발 절차, `docs/procedures/I18N.md`: 환경·문구·공통 UI 작업. 루트 README는 빠른 시작과 이 파일 링크 유지 |
| `verify.md` | `docs/operations/TESTING.md`, `docs/procedures/UI-REVIEW.md`의 공통 UI 검수: 명령·입력·종료 조건. 실제 통과 기록은 records로 이동 |
| `release.md` | `docs/procedures/APP-VERSIONING.md`, `docs/operations/SITES-PUBLICATION.md`: 버전·검증·발행 순서. 과거 발행 ID는 records로 이동 |
| `verify-ipad.md` | `docs/operations/IPAD-SIMULATOR.md`: 기기 식별·연결·검수 절차. 특정 날짜의 설치·권한·결과는 records로 이동 |
| `use-apple-local-tools.md` | `docs/operations/APPLE-LOCAL-WORKFLOW.md`: STT/AFM 실행·출력 확인 순서 |

`docs/procedures/README.md`의 역할은 `docs/README.md`의 작업별 안내로 흡수한다. 기존 스킬 3개는 기존 경로에 두고 새 정본·절차 링크로 갱신한다. 외부 설치본·심볼릭 링크·전역 스킬은 이 작업에서 변경하지 않는다.

<a id="documentation-consolidation--6-기록과거-문서-이전표"></a>

### 6. 기록·과거 문서 이전표

아래 도착 경로는 `docs/records/` 기준이다. 기본은 날짜별 절로 묶되 원래 문서명·기록일·입력·환경·결과·미확인·증거 경로를 보존한다. 내용을 요약해 원본 수치나 실패 기록을 버리지 않는다. 현행 기록과 폐기 시안을 같은 상태로 표시하지 않는다.

| 도착 | 주요 출발 문서/분류 |
| --- | --- |
| `acceptance.md` | `docs/operations/acceptance.md`: 수용 상태 유지 |
| `releases.md` | `docs/records/APP-VERSION-HISTORY.md`, `SITES-PUBLICATION-HISTORY.md`: 버전 정정과 실제 발행 기록을 별도 절로 병합 |
| `production-tools.md` | `docs/records/PRODUCTION-TOOL-VALIDATION.md`: 도구 검증·계측 |
| `apple-local-tools.md` | `docs/records/APPLE-LOCAL-REVIEW-HISTORY.md`: 실측·제약 |
| `ipad.md` | `docs/records/IPAD-SIMULATOR-HISTORY.md`, `docs/operations/IPAD-STATUS-BAR-DIAGNOSIS.md`: 기기·진단 기록 |
| `documentation.md` | `docs/records/DOCUMENTATION-RECONCILIATION-20261023.md`, `RULE-DOCUMENTATION-VERIFICATION-20261023.md` 및 선행 잔여물 감사 기록: 날짜별 이관·검증·모순 조정 |
| `songs/real-paradis.md` | `docs/score-production/MUSICXML-CONVERSION.md`, `docs/records/SCORE-PROCESS-EVIDENCE.md`의 Real Paradis 부분 |
| `songs/loveholic.md` | `docs/score-production/LOVEHOLIC-*.md`, `SCORE-PROCESS-EVIDENCE.md`의 Loveholic 부분 |
| `songs/red-sunset.md` | `docs/score-production/RED-SUNSET-*.md`: 제작·41마디·박 대조·O+·재제작·앱 인계 |
| `songs/ioi-suddenly.md` | `docs/score-production/IOI-SUDDENLY-CONVERSION.md` |
| `songs/tom-moving.md` | `docs/score-production/TOM-MOVING-PRODUCTION.md` |
| `songs/preplay-warmup.md` | `docs/score-production/PREPLAY-WARMUP-PRODUCTION.md` |
| 위 곡별 파일 또는 `archive/lyrics-research.md` | `docs/score-production/LYRIC-*.md`, `LYRICS-JAPANESE-COMPARISON.md`, `JAPANESE-CANONICAL-READINGS.md`: 곡별 확정 기록과 공통 연구를 절별 분리. 현행 LYRIC-FEEDBACK-RULES는 4절의 production으로 이동 |
| 위 곡별 파일 또는 `archive/musicxml-evaluation.md` | `docs/score-production/BEAT-ANCHOR-AUDIT.md`, `MUSICXML-COMPARISON.md`, `MUSICXML-TROUBLESHOOTING.md`: 실제 곡 근거는 곡별, 비교 연구는 archive, 현재 재사용 해결 절차는 how-to로 이동 |
| `archive/project-restructuring.md` | `docs/plans/PROJECT-RESTRUCTURING.md`, `RESTRUCTURING-MAP.md`, `docs/architecture/CODE-MAINTENANCE.md`: 완료 여부 확인 후 이관 |
| `archive/project-quality.md` | `docs/plans/PROJECT-QUALITY.md`, `docs/operations/DEPENDENCY-SECURITY.md`: 완료된 계획/당시 진단만 이관 |
| `archive/documentation-reorganization.md` | 선행 `docs/plans/RULE-DOCUMENTATION-REORGANIZATION.md`와 이 계획: 각 실행이 끝난 뒤 날짜별 별도 절로 보존 |
| `archive/musicxml-evaluation.md` | `docs/architecture/MUSICXML-INTEGRATION.md`의 과거 평가·통합 기록 |
| `archive/rendering-experiments.md` | `docs/architecture/LOAD-TIMING.md`, `OSMD-UPGRADE-20261023.md`, `REHEARSAL-FONT-FIX-20261023.md`, `WORDS-POSITION-20261023.md`, `docs/score-production/SECTION-DIRECTION-*.md`: 연구·시안·검증. 최신 결정은 기존 ADR을 연결 |

기존 이력 진입점 7개(`MUSICXML-SUPPORT.md`, `SVG-RENDERING.md`, `RECORDING-TEMPO-APP.md`, `IPAD-LANDSCAPE-UX.md`, `RIBBON-READABILITY.md`, `COUNT-OFF-NAVIGATION.md`, `REPEAT-RANGE-ACTIONS.md`)는 이미 연결된 ADR과 원문을 재사용한다. 같은 원문을 새 archive에 다시 복제하지 않는다. 참조가 남아 있으면 짧은 이전 안내로 유지한다.

표의 패턴은 실행할 때 실제 파일 목록으로 확정한다. 각 원문 절에는 하나의 주 보존 목적지를 지정하고 다른 목적지는 링크만 둔다. 표에 없는 새 문서, 여러 곡이 섞인 파일, 아직 진행 중인 계획은 내용을 확인해 이전표에 추가한다. 이름만 보고 완료·폐기·특정 곡을 추정하지 않는다.

<a id="documentation-consolidation--7-이동-예외와-링크-호환성"></a>

### 7. 이동 예외와 링크 호환성

<a id="documentation-consolidation--71-코드가-읽는-화면-소유권-표"></a>

#### 7.1 코드가 읽는 화면 소유권 표

`scripts/checks/check-playback-architecture.mjs`는 `docs/plans/PLAYBACK-SCREEN-INVENTORY.md`를 직접 읽고 P01~P25·E01~E06 행을 검사한다.

- 코드 변경이 없는 이번 통합 단계에서는 해당 파일과 실제 표를 기존 경로에 유지한다.
- `reference/engineering/architecture.md`에서 그 표를 유일한 기계 입력으로 연결한다. 동일 표를 새 위치에 복사하여 두 정본으로 만들지 않는다.
- `plans/`에는 진행 중 계획만 둔다는 원칙의 명시적 예외로 목록에 표시한다. 문서 20개는 주 진입점 수이며 이 예외 파일까지 제거했다는 뜻이 아니다.
- 이후 코드 경로 수정이 명시적으로 허용된 작업에서만 표 이동·소비 코드 수정·관련 검사까지 함께 처리한다. 이 계획 저장만으로 코드 수정 권한을 얻지 않는다.

<a id="documentation-consolidation--72-생성-문서와-자산"></a>

#### 7.2 생성 문서와 자산

`docs/product/UI-COMPONENTS.md`, `docs/design/legend-diagram/`의 안내·코드·자산, `src/modules/score/vendor/pretendard/README.md`와 라이선스는 기존 생성·배치 경로에 유지한다. 상위 안내에서 연결한다. 문서 구조를 맞추려고 생성 코드·정본 카탈로그·SVG·폰트·이미지를 이동하거나 재생성하지 않는다.

<a id="documentation-consolidation--73-기존-주소와-원문-보존"></a>

#### 7.3 기존 주소와 원문 보존

- 실행 기준 목록에 `기존 경로#앵커 → 새 경로#앵커 → 처리 상태`를 기록한다. 파일 병합 시 제목이 같으면 출처/주제로 구분한 안정된 앵커를 사용한다.
- 현재 내부 참조는 새 정본으로 갱신한다. Markdown 링크뿐 아니라 AGENTS·스킬·명령 문자열·스크립트가 쓰는 경로도 검색한다. 코드 내부 경로는 이번 범위에서 수정하지 않고 예외 처리한다.
- 과거 대화·외부 링크에서 사용할 수 있는 기존 문서는 제목·이전 안내·기존 앵커별 목적지 링크만 남긴다. Markdown 파일 자체에 자동 HTTP 리다이렉트가 있다고 가정하지 않는다.
- 이전 안내 파일에 현행 규칙을 다시 복사하지 않는다. 링크 연결 문서 수와 실제 정본 수를 구분해 보고한다.
- 기존 파일의 물리 삭제를 완료 조건으로 두지 않는다. 외부 참조 보존 필요가 사라졌는지와 삭제 권한이 확인된 별도 정리 범위에서만 제거한다.
- 원문 전체는 실행 전 로컬 스냅샷으로 보존하고, 이관 내용과 의미를 확인한다. Git에 기록되지 않은 기존 변경의 보존을 Git 이력만으로 대신하지 않는다.
- ADR의 기존 결정·상태·날짜·출처는 의미를 바꾸지 않는다. 상대 링크는 새 위치로 연결할 수 있으나, 인용된 과거 명령·증거 경로를 현재 경로로 소급 바꾸지 않는다. 필요하면 현재 참조를 별도 덧붙인다.

<a id="documentation-consolidation--8-실행-순서와-완료-조건"></a>

### 8. 실행 순서와 완료 조건

<a id="documentation-consolidation--단계-0--최신-상태와-이전표-확정"></a>

#### 단계 0 — 최신 상태와 이전표 확정

1. 전역·프로젝트 AGENTS, 선행 분리/잔여물 감사 결과, 최신 Rule 목록을 읽는다.
2. 브랜치·HEAD·dirty 상태를 기록한다. Git 추적 및 비제외 미추적 문서, 코드 의존 경로, 생성 문서, 스킬을 목록화한다.
3. `.tmp/documentation-consolidation-<실행 식별자>/`에 실제 원문·파일 해시·앵커·참조 목록을 보존한다. 기존 스냅샷을 덮어쓰지 않는다. Git 제외 미디어 전체를 복사하지 않는다.
4. 이 계획의 이전표를 실제 파일/절 목록으로 구체화한다. 각 항목에 원문, 목적지, 역할, 처리 상태, 코드/생성 의존 여부를 둔다.

완료 조건: 모든 현행 Rule과 이관 대상 문서가 이전표에 포함되고, 충돌 중인 파일·경로 유지 예외·제외 대상이 구분되어 있다.

<a id="documentation-consolidation--단계-1--현행-정본-통합"></a>

#### 단계 1 — 현행 정본 통합

1. 4절 순서로 관련 문서를 묶어 새 정본을 작성한다. 기존 정본을 먼저 지우지 않는다.
2. 각 문서의 역할·범위·관련 절차/ADR를 짧게 표시한다. 현재 규칙과 지원 한계만 본문에 둔다.
3. 중복은 의미가 같을 때만 합친다. 서로 다른 권한·조건·수치·형식은 별도 항목으로 유지한다.
4. 이유·폐기 시안은 기존 ADR, 실제 결과는 records로 연결한다. 후보·예외를 승인된 공통 규칙으로 바꾸지 않는다.
5. 새 문서별 원문 대조가 끝난 단위부터 내부 참조와 기존 경로 안내를 전환한다.

완료 조건: 모든 현재 규칙이 하나의 주 정본에 있고, 필드·수치·적용 범위·예외가 보존된다. 실제 원문 차이가 있는 항목은 근거와 상태를 남긴다.

<a id="documentation-consolidation--단계-2--절차와-기록-통합"></a>

#### 단계 2 — 절차와 기록 통합

1. 5절에 따라 실행 절차를 묶는다. 명령·입력·승인 범위·출력·검증 조건을 함께 보존한다.
2. 6절에 따라 기록을 날짜·곡·목적으로 묶는다. 실패·미실행·미확인 기록을 유지한다.
3. 완료 계획만 archive로 옮긴다. 미완료 항목은 현재 계획에 남기거나 후속 계획의 정확한 위치로 연결한다.
4. ADR-0001에 통합 이유·예외·관련 경로를 보완한다. 다른 ADR은 식별자와 결정 내용 유지, 필요한 참조만 갱신한다.

완료 조건: 실행 순서·결정 이유·실제 증거가 역할별로 분리되고, 같은 원문을 여러 기록 파일에 중복 저장하지 않는다.

<a id="documentation-consolidation--단계-3--탐색과-참조-전환"></a>

#### 단계 3 — 탐색과 참조 전환

1. `docs/README.md`를 악보 제작·앱 개발·검증·발행·과거 기록 찾기의 작업별 입구로 만든다.
2. `docs/RULES-INDEX.md`에는 현행 정본 약 20개와 코드 의존 예외만 안내한다. 전체 문서 전수 목록을 본문에서 제거한다.
3. ADR 목록은 결정 중심으로, records 목록은 곡·주제 중심으로 유지한다. 각 절차/정본에 관련 기록 링크를 둔다.
4. 루트 README, 프로젝트 AGENTS, 로컬 스킬의 문서 참조를 전환한다. 권한·역할·스킬 동작을 바꾸지 않는다.
5. 기존 경로 안내와 원문 이관표를 확인하고 활성 문서가 폐기된 경로를 직접 실행 입력으로 안내하지 않게 한다.

완료 조건: 악보 제작자는 제작 기준 → MusicXML 계약 → 매핑 → 표시 계약을 바로 찾고, 필요할 때만 드럼킷·도구·검수 절차를 추가로 연다. 앱 개발자는 구조 → 해당 제품 규칙 → 검증 절차를 바로 찾는다.

<a id="documentation-consolidation--단계-4--검증과-결과-기록"></a>

#### 단계 4 — 검증과 결과 기록

9절 검증을 수행하고 오류가 있는 문서/참조만 수정한다. 기록은 `records/documentation.md`, 실제 변경 요약은 `history.md`에 남긴다. 계획을 완료로 표시하는 시점은 검증과 결과 기록까지 끝난 뒤다. 코드 의존 파일 유지와 호환 안내 잔존 수는 완료 보고의 예외 항목으로 공개한다.

<a id="documentation-consolidation--9-검증-항목"></a>

### 9. 검증 항목

| 검사 | 통과 조건 |
| --- | --- |
| 범위 | 실행 전후 비교에서 문서 및 허용된 문서 참조 외 앱·도구 코드·설정·악보·음원·생성 자산 변경이 없음. 동시 작업의 변경은 별도 식별 |
| 내용 추적 | 이전표의 모든 원문 절이 정본·절차·ADR·기록 중 한 주 목적지 또는 유지 예외와 연결됨. 누락·미분류 항목이 없음 |
| 규칙 의미 | 필드명·타입·단위·수치·음가/박 기준·권한·예외·지원 한계가 일치. 해시/문자열 일치만으로 의미 보존을 단정하지 않음 |
| 이력 보존 | 원문 날짜·입력·환경·해시·결과·실패·미확인과 출처가 유지됨. 후보나 과거 통과를 현재 규칙/이번 통과로 바꾸지 않음 |
| 링크 | 로컬 파일·상대 링크·절대경로·문단 앵커, 같은 이름의 병합 제목, 기존 주소 안내를 확인. 외부 URL은 재확인한 범위만 보고 |
| 역할 분리 | 현재 Rule에 날짜별 검증·폐기 시안·선택 이유의 본문이 남지 않음. ADR/기록 링크와 필요한 현재 호환 계약은 허용 |
| 기계 입력 | P01~P25·E01~E06 표와 소비 경로, 자동 생성 문서·생성 경로가 유지됨 |
| MADR | 기존 ADR 식별자·상태·결정 의미·관련 링크가 유지되고 중복 결정 파일을 만들지 않음 |
| 탐색 | Rule 목록에 기록 전체를 다시 나열하지 않음. 작업별 필요한 정본·절차를 관련 기록까지 추적할 수 있음 |

현재 사용할 문서 검사 명령은 다음과 같다. 실행 전 스크립트가 새로 바뀌지 않았는지와 부수 효과를 확인한다.

```sh
npm run check:docs
git diff --check
```

`check:docs`는 현재 생성 UI 문서 일치와 상대 파일 링크를 검사한다. 절대경로·앵커·원문 의미·정본 권위·앱 동작은 별도 대조가 필요하다. 신규 미추적 문서는 `git diff --check`에 빠질 수 있으므로 실제 대상 파일의 공백과 내용을 따로 확인한다.

기존 작업의 임시 검증 스크립트는 파일 수·경로·보호 파일을 고정했을 수 있다. 새 목표와 기존 보호 계약을 대조한 후 재사용하며, 단순 통과를 위해 보존 검사를 제거하지 않는다. 이번에는 문서 대조용 읽기 전용 검사만 실행한다. 앱 테스트·빌드·악보 재생성·실기기 검수를 문서 이전의 통과 조건으로 추가하지 않는다. 검사 코드 경로 수정은 별도 범위로 남긴다.

<a id="documentation-consolidation--10-실행-결과에-남길-내용"></a>

### 10. 실행 결과에 남길 내용

- 실행 시작·종료 시점의 브랜치·HEAD와 기준 파일 목록.
- 통합 전후 정본 주제 수, 실제 Markdown 수, 호환 안내 수, 기계/생성 경로 유지 예외 수.
- 원문 절별 이전표와 새 정본 위치, 보존 확인 결과.
- 실행한 검사·범위·결과·남은 오류와 미확인.
- 앱·악보·미디어·기존 미커밋 변경 보존 여부.
- 문서 작성, 통합 실행, 검증, 커밋·push·배포를 구분한 상태.

<a id="documentation-consolidation--11-실행-체크리스트"></a>

### 11. 실행 체크리스트

- [ ] 단계 0: 최신 원문·기준 스냅샷·파일/절별 이전표 확정.
- [ ] 단계 1: 현행 정본 통합과 규칙 의미 대조.
- [ ] 단계 2: 절차·기록 통합과 기존 ADR 재사용.
- [ ] 단계 3: 작업별 입구·목록·스킬·기존 주소 갱신.
- [ ] 단계 4: 원문·링크·범위 검증과 결과 기록.

이 체크리스트는 실행자가 실제 수행 후 갱신한다. 계획 작성만으로 체크하지 않는다. 현재 문서 정리 원칙은 [문서 관리 Rule](../../reference/engineering/documentation.md#documentation-rules--프로젝트-문서-관리-rule), 선행 근거는 [문서 이관 검증 기록](../documentation.md#rule-documentation-verification-20261023--프로젝트-rule-문서-정리-검증--2026-10-23)에서 확인한다.

<a id="docs-readme--프로젝트-문서-안내"></a>

## 프로젝트 문서 안내

현재 계약은 [전체 Rule 목록](../../RULES-INDEX.md), 실행 순서는 [절차 목록](../../README.md), 이유·대체 과정은 [MADR 결정 이력](../../decisions/README.md), 당시 실측·배포·검증은 [사실 기록](../README.md)에서 찾는다. 실제 변경은 [history](../../../history.md)에 기록한다. 문서 갱신은 [문서 관리 Rule](../../reference/engineering/documentation.md#documentation-rules--프로젝트-문서-관리-rule)을 따른다.


원문 출처: `docs/README.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="docs-readme--개발운영"></a>

### 개발·운영

- 제품·앱 역할: [PRD](../../../PRD.md), [구조](../../reference/engineering/architecture.md#project-structure--프로젝트-구조), [UX](../../reference/product/ux.md#ux-principles--팀-ux-원칙과-맥락형-도움말), [공통 화면 소유권](../../plans/PLAYBACK-SCREEN-INVENTORY.md), [생성 UI 목록](../../product/UI-COMPONENTS.md).
- 실행/검증: [README](../../../README.md), [검사 절차](../../how-to/verify.md#testing--개발-검사와-로컬-자산-준비), [검증 현황](../acceptance.md#acceptance--검증-현황), [iPad](../../how-to/verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차), [Apple 로컬](../../how-to/use-apple-local-tools.md#apple-local-workflow--apple-로컬-검토-실행-절차).
- 운영: [버전 Rule](../../reference/engineering/release.md#app-versions--앱-공통-버전), [배포 Rule](../../reference/engineering/release.md#deployment-rules--배포-범위와-소스-권위), [Sites 절차](../../how-to/release.md#sites-publication--sites-발행-절차), [릴리스 스킬](../../../.agents/skills/release-drum-practice/SKILL.md).

<a id="docs-readme--악보-제작표시-정본"></a>

### 악보 제작·표시 정본

1. [제작 Rule](../../reference/score/production.md#score-production-rules--악보-제작-범위와-보존-rule)과 [제작 프로세스](../../how-to/produce-score.md#score-production-process--악보-제작-프로세스)에서 요청 범위·입력·보존·종료/인계를 확인한다.
2. [변환 정책](../../reference/score/production.md#musicxml-conversion-policy--pdf--musicxml-변환-정책), [확정 매핑](../../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙), [정본 계약](../../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약), [SVG 규칙](../../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙)을 각각 적용한다.
3. [패키지 계약](../../reference/score/file-formats.md#score-package--완성-악보-파일-계약--drumscore-v1)과 [재사용 계측·검수·인계](../../how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용)를 따른다.
4. 막힘은 [문제 해결 기록](musicxml-evaluation.md#musicxml-troubleshooting--악보-변환-문제-해결-기록), 새 음원은 [키트 선택 Rule](../../reference/score/drum-kits.md#garageband-drum-kits--드럼킷-선택과-보존-라이브러리)을 확인한다.

<a id="docs-readme--보존한-제작-자료"></a>

### 보존한 제작 자료

2026-10-13 사용자 요청으로 실험 출력·문서 보관본·생성 보고서를 정리한 기록이 있다. 최신 제작 입력/결과는 Git 제외 `data/production/`, 재사용 원본·XSD·회귀 입력은 `data/reference/`에 보존한다. 삭제된 `docs/experiments/` 증거를 현재 필수 입력으로 쓰지 않는다. Git 제외 자료의 현재 존재는 실행 전에 확인한다.

- `data/production/loveholic/`: PDF·변환 XML·가사 매핑, 원음·분석, 최종 XML·패키지.
- `data/production/preplay-warmup/`: 작곡 원본·MIDI, SoCal 음원, 최종 악보·패키지.
- `data/production/tom-moving/`: 작곡/영상 참고 입력·MIDI, Portland 음원, 최종 악보·패키지.
- `data/reference/`: 실제 변환 입력·MusicXML XSD·회귀 검사 악보.

곡별 제작 문서는 당시 해시·판독·미확인을 유지한다. [손풀기](../songs/preplay-warmup.md#preplay-warmup-production--시작전-손플기--독립-손-준비-연습곡), [탐탐 무빙](../songs/tom-moving.md#tom-moving-production--탐탐-무빙-연습-제작), [Loveholic](../songs/loveholic.md#loveholic-conversion--loveholic-pdf--musicxml-작업), [Real Paradis](../songs/real-paradis.md#musicxml-conversion--real-paradis-pdf--musicxml), [갑자기](../songs/ioi-suddenly.md#ioi-suddenly-conversion--ioi--갑자기-제작실측), [붉은 노을](../songs/red-sunset.md#red-sunset-rebuild-20261023--붉은-노을--최신-제작-원칙-전곡-재제작)을 참조한다.

재제작에 generation-audit가 필요한 경우 현재 전역 지침의 영향별 허가 범위와 제작 절차에 따라 새 경로에서 생성한다. 과거 PASS를 복구하거나 검사를 생략하지 않는다. 현재 패키지 재생에는 이 제작 보고서가 필요하지 않다.

<a id="docs-readme--기록-유지-규칙"></a>

### 기록 유지 규칙

[문서 관리 Rule](../../reference/engineering/documentation.md#documentation-rules--프로젝트-문서-관리-rule)과 [정리 근거](../documentation.md#documentation-reconciliation-20261023--문서-모순역할-정리-근거--2026-10-23)를 따른다. 문서만 변경한 작업에서 앱 버전·소스 빌드·악보를 다시 생성하거나 배포하지 않는다.

<a id="rules-index--프로젝트-전체-rule-목록"></a>

## 프로젝트 전체 Rule 목록

검토 범위: 변경 시작 시 Markdown **109개**, 정리 후 **148개**. Git 추적 파일과 아직 추가하지 않은 비제외 Markdown을 포함한다. 원본 미디어·생성 악보·실험 출력·로컬 라이브러리·의존성·배포 사본 등 Git 제외 자료는 문서 목록의 범위 밖이며 보존한다.

현행 Rule **35개**의 진입점이다. 요구·금지는 아래 정본에서, 순서·명령은 [실행 절차](../../README.md), 이유·대체 과정은 [MADR](../../decisions/README.md), 당시 실측/검수/배포는 [기록](../README.md)에서 읽는다. 모든 Markdown을 Rule로 취급하지 않는다. 아래 번호는 목록 식별자이며 우선순위나 새로운 정책 번호가 아니다.


원문 출처: `docs/RULES-INDEX.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="rules-index--적용-순서와-권위"></a>

### 적용 순서와 권위

현재 사용자 명시 요청·이미 승인된 결정을 범위 안에서 우선 적용한다. [전역 지침](/Users/raphael/AGENTS.md)과 가장 가까운 [프로젝트 지침](../../../AGENTS.md)을 먼저 읽고 제품·해당 도메인 정본을 적용한다. 과거 ADR/곡별 기록·연구 후보가 현행 Rule을 덮어쓰지 않는다. 충돌은 [확인 순서](../../reference/score/production.md#musicxml-conversion-policy--막힘과-문서-모순)로 조사하고 이유를 기록한다.

`src/app-versions.json`, UI/i18n 카탈로그, 스키마·lockfile 등은 해당 계약의 기계 원천이다. 이 목록이 별도 값을 복제하지 않는다. 문서에 기록된 구현과 실제 실행/배포 상태도 구분한다.

<a id="rules-index--현행-rule"></a>

### 현행 Rule

| 목록 ID | 정본 | 적용 범위 | 실행 절차/기록 | ADR |
| --- | --- | --- | --- | --- |
| R01 | [AGENTS.md](../../../AGENTS.md) | 프로젝트 실행·권한·보존·역할 | [TESTING.md](../../how-to/verify.md#testing--개발-검사와-로컬-자산-준비) | 상위 사용자/실행 지침 |
| R02 | [PRD.md](../../../PRD.md) | 제품·두 앱·입력·목록·저장·제외 범위 | [SITES-PUBLICATION.md](../../how-to/release.md#sites-publication--sites-발행-절차) | [0020](../../decisions/0020-local-editor-and-public-player.md) · [0026](../../decisions/0026-device-local-audio-analysis.md) |
| R03 | [DOCUMENTATION-RULES.md](../../reference/engineering/documentation.md#documentation-rules--프로젝트-문서-관리-rule) | 문서 역할·갱신·원문/링크 보존 | [README.md](../../README.md) | [0001](../../decisions/0001-separate-svg-rules-and-decisions.md) |
| R04 | [PROJECT-STRUCTURE.md](../../reference/engineering/architecture.md#project-structure--프로젝트-구조) | 책임·의존·저장 호환·스타일·공통 목록 | [TESTING.md](../../how-to/verify.md#testing--개발-검사와-로컬-자산-준비) | [0023](../../decisions/0023-shared-module-boundaries.md) |
| R05 | [PLAYBACK-SCREEN-INVENTORY.md](../../plans/PLAYBACK-SCREEN-INVENTORY.md) | 기계 검사에 쓰이는 공통 화면 소유권·ID | [TESTING.md](../../how-to/verify.md#testing--개발-검사와-로컬-자산-준비) | [0004](../../decisions/0004-browser-native-score-rendering.md) · [0023](../../decisions/0023-shared-module-boundaries.md) |
| R06 | [I18N.md](../../reference/engineering/i18n.md#i18n--사용자-표시-문구와-i18n) | 한국어 키·문구 API·콘텐츠 예외 | [I18N.md](../../how-to/develop.md#i18n--앱-문구-변경-절차) | [0024](../../decisions/0024-korean-message-catalog.md) |
| R07 | [UX-PRINCIPLES.md](../../reference/product/ux.md#ux-principles--팀-ux-원칙과-맥락형-도움말) | 8가지 UX·공통 목록·도움말·모달·화면 배치 | [UI-REVIEW.md](../../how-to/verify.md#ui-review--화면악보재생-검수-절차) | [0005](../../decisions/0005-practice-layout-and-spacing.md) · [0006](../../decisions/0006-practice-navigation-and-overlays.md) · [0021](../../decisions/0021-contextual-help-and-shared-ui.md) |
| R08 | [SETTINGS-PLAYBACK.md](../../reference/product/playback.md#settings-playback--설정과-재생-정책) | 설정 범위·순서·기본값·재생 정책 | [UI-REVIEW.md](../../how-to/verify.md#ui-review--화면악보재생-검수-절차) | [0006](../../decisions/0006-practice-navigation-and-overlays.md) · [0015](../../decisions/0015-score-tempo-and-recording-estimates.md) · [0021](../../decisions/0021-contextual-help-and-shared-ui.md) |
| R09 | [MARKER-SLOTS.md](../../reference/product/playback.md#marker-slots--마디-마커-슬롯) | 마커 5·구간 9·M·정렬/FIFO·입력 보호 | [UI-REVIEW.md](../../how-to/verify.md#ui-review--화면악보재생-검수-절차) | [0006](../../decisions/0006-practice-navigation-and-overlays.md) |
| R10 | [PLAYBACK-ACTIONS.md](../../reference/product/playback.md#playback-actions--재생-이동과-반복-구간-동작) | 버튼 이동·카운트오프·구간 시작/삭제 | [UI-REVIEW.md](../../how-to/verify.md#ui-review--화면악보재생-검수-절차) | [0006](../../decisions/0006-practice-navigation-and-overlays.md) |
| R11 | [AUDIO-PRACTICE.md](../../reference/product/audio-practice.md#audio-practice--음원-연습) | 로컬 음원·정보·박·원곡/연습·조정 UI | [PRACTICE-FILES.md](../../how-to/review-score.md#practice-files--완성-악보와-연습-정보-파일-사용-절차) | [0015](../../decisions/0015-score-tempo-and-recording-estimates.md) · [0016](../../decisions/0016-explicit-recording-beat-connections.md) · [0022](../../decisions/0022-portable-score-and-practice-files.md) · [0026](../../decisions/0026-device-local-audio-analysis.md) |
| R12 | [SCORE-WORKSPACE.md](../../reference/product/editor.md#score-workspace--악보제작기-편집-화면) | 제작기 편집 탭·파일 연결·저장 | [UI-REVIEW.md](../../how-to/verify.md#ui-review--화면악보재생-검수-절차) | [0021](../../decisions/0021-contextual-help-and-shared-ui.md) · [0023](../../decisions/0023-shared-module-boundaries.md) |
| R13 | [SCORE-REVIEW.md](../../reference/product/editor.md#score-review--pdf--musicxml-검수-계약) | PDF/SVG 비교·오선 정렬·정지 캡처 | [UI-REVIEW.md](../../how-to/verify.md#ui-review--화면악보재생-검수-절차) | [0003](../../decisions/0003-source-systems-and-cropping.md) · [0005](../../decisions/0005-practice-layout-and-spacing.md) |
| R14 | [NOTE-PLAYBACK-HIGHLIGHT.md](../../reference/product/playback.md#note-playback-highlight--음표-따라가기) | 음표 순간 강조·적용 형식·설정 보존 | [UI-REVIEW.md](../../how-to/verify.md#ui-review--화면악보재생-검수-절차) | [0006](../../decisions/0006-practice-navigation-and-overlays.md) |
| R15 | [PAUSED-SCORE-SCROLL.md](../../reference/product/playback.md#paused-score-scroll--정지된-두-줄-악보의-세로-탐색) | 정지 두 줄 읽기·선택·스크롤 | [UI-REVIEW.md](../../how-to/verify.md#ui-review--화면악보재생-검수-절차) | [0005](../../decisions/0005-practice-layout-and-spacing.md) · [0006](../../decisions/0006-practice-navigation-and-overlays.md) |
| R16 | [MUSICXML-INPUT.md](../../reference/score/musicxml.md#musicxml-input--musicxml-입력-계약) | 입력 형식·한계·복수 악보 연결 | [SCORE-PRODUCTION-PROCESS.md](../../how-to/produce-score.md#score-production-process--악보-제작-프로세스) | [0004](../../decisions/0004-browser-native-score-rendering.md) · [0012](../../decisions/0012-musicxml-canonical-source.md) |
| R17 | [MUSICXML-CANONICAL.md](../../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약) | 원문 권위·가사·메타정보·음원/박 연결 | [SCORE-PRODUCTION-PROCESS.md](../../how-to/produce-score.md#score-production-process--악보-제작-프로세스) | [0012](../../decisions/0012-musicxml-canonical-source.md) · [0013](../../decisions/0013-score-based-lyric-positions.md) · [0014](../../decisions/0014-score-artist-and-kit-metadata.md) · [0015](../../decisions/0015-score-tempo-and-recording-estimates.md) · [0016](../../decisions/0016-explicit-recording-beat-connections.md) |
| R18 | [MEASURE-LYRICS.md](../../reference/score/musicxml.md#measure-lyrics--마디-단위-인쇄-가사-계약) | 음절 시각과 구분한 마디 귀속 가사 | [SCORE-PRODUCTION-PROCESS.md](../../how-to/produce-score.md#score-production-process--악보-제작-프로세스) | [0013](../../decisions/0013-score-based-lyric-positions.md) |
| R19 | [SCORE-PACKAGE.md](../../reference/score/file-formats.md#score-package--완성-악보-파일-계약--drumscore-v1) | .drumscore v1·전체 자산·제한·MIME·교체 | [PRACTICE-FILES.md](../../how-to/review-score.md#practice-files--완성-악보와-연습-정보-파일-사용-절차) | [0012](../../decisions/0012-musicxml-canonical-source.md) · [0020](../../decisions/0020-local-editor-and-public-player.md) · [0022](../../decisions/0022-portable-score-and-practice-files.md) |
| R20 | [PRACTICE-FILE.md](../../reference/score/file-formats.md#practice-file--음원-연습-파일) | 음원 제외 JSON·해시 연결·원자 복원·중복 | [PRACTICE-FILES.md](../../how-to/review-score.md#practice-files--완성-악보와-연습-정보-파일-사용-절차) | [0022](../../decisions/0022-portable-score-and-practice-files.md) |
| R21 | [SVG-SCORE-RULES.md](../../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙) | 전체 출력·주법·7원칙·폰트·배치·캐시·안전 | [UI-REVIEW.md](../../how-to/verify.md#ui-review--화면악보재생-검수-절차) | [0002](../../decisions/0002-svg-page-output.md) · [0003](../../decisions/0003-source-systems-and-cropping.md) · [0005](../../decisions/0005-practice-layout-and-spacing.md) · [0006](../../decisions/0006-practice-navigation-and-overlays.md) · [0007](../../decisions/0007-native-drum-notation.md) · [0008](../../decisions/0008-continuous-playback-wedges.md) · [0009](../../decisions/0009-musicxml-section-direction-layout.md) · [0010](../../decisions/0010-pretendard-score-text.md) · [0011](../../decisions/0011-hi-hat-open-close-position.md) |
| R22 | [BROWSER-MUSICXML-RENDERING.md](../../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약) | 두 앱 공통 조판·입력 권위·캐시·성능 기준 | [UI-REVIEW.md](../../how-to/verify.md#ui-review--화면악보재생-검수-절차) | [0004](../../decisions/0004-browser-native-score-rendering.md) |
| R23 | [PDF-DISPLAY-TRIM.md](../../reference/score/rendering.md#pdf-display-trim--pdf-연습-화면-표시용-자르기) | PDF 표시용 prefix 자르기·원본/좌표 보존 | [UI-REVIEW.md](../../how-to/verify.md#ui-review--화면악보재생-검수-절차) | [0003](../../decisions/0003-source-systems-and-cropping.md) |
| R24 | [SCORE-PRODUCTION-RULES.md](../../reference/score/production.md#score-production-rules--악보-제작-범위와-보존-rule) | 제작 역할·원본 폴더·출력·보존·상시 인계 | [SCORE-PRODUCTION-PROCESS.md](../../how-to/produce-score.md#score-production-process--악보-제작-프로세스) | [0018](../../decisions/0018-reusable-score-production-and-handoff.md) |
| R25 | [MUSICXML-CONVERSION-POLICY.md](../../reference/score/production.md#musicxml-conversion-policy--pdf--musicxml-변환-정책) | 유형별 경로·대조·악보 우선·문제 해결 | [SCORE-PRODUCTION-PROCESS.md](../../how-to/produce-score.md#score-production-process--악보-제작-프로세스) | [0013](../../decisions/0013-score-based-lyric-positions.md) · [0017](../../decisions/0017-source-dependent-musicxml-conversion.md) |
| R26 | [SCORE-MUSICXML-OSMD-MAPPING.md](../../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙) | 확정 범례·주법·악기·입력 의미 | [SCORE-PRODUCTION-PROCESS.md](../../how-to/produce-score.md#score-production-process--악보-제작-프로세스) | [0007](../../decisions/0007-native-drum-notation.md) · [0009](../../decisions/0009-musicxml-section-direction-layout.md) · [0011](../../decisions/0011-hi-hat-open-close-position.md) |
| R27 | [GARAGEBAND-DRUM-KITS.md](../../reference/score/drum-kits.md#garageband-drum-kits--드럼킷-선택과-보존-라이브러리) | SoCal/Portland 선택·보존본·주법 경계 | [DRUM-AUDIO.md](../../how-to/render-drum-audio.md#drum-audio--보존-드럼킷으로-음원-제작) | [0014](../../decisions/0014-score-artist-and-kit-metadata.md) · [0019](../../decisions/0019-preserved-drum-kit-selection.md) |
| R28 | [COMMON-TOOLS.md](../../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독) | 공통 코드 API·설정/독립 판독 경계 | [SCORE-TOOLS.md](../../how-to/produce-score.md#score-tools--공통-제작-도구-사용-절차) | [0018](../../decisions/0018-reusable-score-production-and-handoff.md) |
| R29 | [LYRIC-FEEDBACK-RULES.md](../../reference/score/production.md#lyric-feedback-rules--수동-가사-싱크-피드백-접수) | 별도 요청한 수동 싱크 접수·일괄 반영 | [LYRIC-SYNC-FEEDBACK.md](../songs/real-paradis.md#lyric-sync-feedback--가사-싱크-청취-피드백-누적) | [0013](../../decisions/0013-score-based-lyric-positions.md) |
| R30 | [APPLE-LOCAL-REVIEW.md](../../reference/score/tools.md#apple-local-review--apple-로컬-가사-검토-계약) | 선택적 STT/AFM 후보·경계 검사·자동 적용 금지 | [APPLE-LOCAL-WORKFLOW.md](../../how-to/use-apple-local-tools.md#apple-local-workflow--apple-로컬-검토-실행-절차) | [0013](../../decisions/0013-score-based-lyric-positions.md) · [0027](../../decisions/0027-verification-scope-and-device-evidence.md) |
| R31 | [VERIFICATION-RULES.md](../../reference/engineering/verification.md#verification-rules--검증-범위와-증거) | 검사 범위·자료·실제 환경·증거·재사용 | [TESTING.md](../../how-to/verify.md#testing--개발-검사와-로컬-자산-준비) | [0027](../../decisions/0027-verification-scope-and-device-evidence.md) |
| R32 | [APP-VERSIONS.md](../../reference/engineering/release.md#app-versions--앱-공통-버전) | 버전 정본·동기화·증가·빌드·정정 | [APP-VERSIONING.md](../../how-to/release.md#app-versioning--앱-버전-갱신-절차) | [0025](../../decisions/0025-shared-app-release-version.md) |
| R33 | [DEPLOYMENT-RULES.md](../../reference/engineering/release.md#deployment-rules--배포-범위와-소스-권위) | 소스 정본·player 공개·사본·자산 경계 | [SITES-PUBLICATION.md](../../how-to/release.md#sites-publication--sites-발행-절차) | [0020](../../decisions/0020-local-editor-and-public-player.md) |
| R34 | [SITE-SECURITY-HARDENING.md](../../reference/engineering/security.md#site-security-hardening--공개-사이트-보안과-음원-분석-경계) | 기기 내부 처리·API 폐기·헤더·입력 상한 | [SITES-PUBLICATION.md](../../how-to/release.md#sites-publication--sites-발행-절차) | [0026](../../decisions/0026-device-local-audio-analysis.md) |
| R35 | [OPEN-SOURCE-NOTICES.md](../../reference/engineering/third-party-notices.md#open-source-notices--오픈소스-고지-계약) | 고지 전문·생성·포함 경계·배포 확인 | [SITES-PUBLICATION.md](../../how-to/release.md#sites-publication--sites-발행-절차) | [0020](../../decisions/0020-local-editor-and-public-player.md) |

별도 승인된 원본/곡별 판독 값은 제작 문서가 해당 곡의 근거다. 공통 Rule과 곡별 근거를 구분하고 다른 곡의 수치/예외를 기본값으로 복사하지 않는다. 수동 가사 싱크 Rule은 별도 교정 요청에만 적용하며 PDF 변환에 가창 측정 의무를 추가하지 않는다.

<a id="rules-index--전체-markdown-문서-분류"></a>

### 전체 Markdown 문서 분류

이 표는 위 검토 범위의 모든 문서를 정확히 한 번 분류한다. Rule 본문을 복제하지 않는다. 생성 참조는 생성 스크립트로 관리하고 기록·참고 문서의 ‘현재/최신’은 당시 날짜와 후속 정본을 대조해 읽는다.

| 문서 | 역할 |
| --- | --- |
| [SKILL.md](../../../.agents/skills/find-timed-lyrics/SKILL.md) | 실행 절차 |
| [sources.md](../../../.agents/skills/find-timed-lyrics/references/sources.md) | 계획 이력·참고 |
| [SKILL.md](../../../.agents/skills/produce-drum-score/SKILL.md) | 실행 절차 |
| [SKILL.md](../../../.agents/skills/release-drum-practice/SKILL.md) | 실행 절차 |
| [AGENTS.md](../../../AGENTS.md) | 현행 Rule |
| [PRD.md](../../../PRD.md) | 현행 Rule |
| [README.md](../../../README.md) | 실행 절차 |
| [DOCUMENTATION-RULES.md](../../reference/engineering/documentation.md#documentation-rules--프로젝트-문서-관리-rule) | 현행 Rule |
| [README.md](../../README.md) | 목록 |
| [RULES-INDEX.md](../../RULES-INDEX.md) | 목록 |
| [APPLE-LOCAL-REVIEW.md](../../reference/score/tools.md#apple-local-review--apple-로컬-가사-검토-계약) | 현행 Rule |
| [BROWSER-MUSICXML-RENDERING.md](../../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약) | 현행 Rule |
| [CODE-MAINTENANCE.md](project-restructuring.md#code-maintenance--코드-정리--2026-10-13) | 계획 이력·참고 |
| [I18N.md](../../reference/engineering/i18n.md#i18n--사용자-표시-문구와-i18n) | 현행 Rule |
| [LOAD-TIMING.md](rendering-experiments.md#load-timing--악보-열기-시간-측정) | 계획 이력·참고 |
| [MEASURE-LYRICS.md](../../reference/score/musicxml.md#measure-lyrics--마디-단위-인쇄-가사-계약) | 현행 Rule |
| [MUSICXML-CANONICAL.md](../../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약) | 현행 Rule |
| [MUSICXML-INPUT.md](../../reference/score/musicxml.md#musicxml-input--musicxml-입력-계약) | 현행 Rule |
| [MUSICXML-INTEGRATION.md](musicxml-evaluation.md#musicxml-integration--pdf--musicxml-main-통합) | 계획 이력·참고 |
| [MUSICXML-SUPPORT.md](../../architecture/MUSICXML-SUPPORT.md) | 이력 진입점 |
| [OSMD-UPGRADE-20261023.md](rendering-experiments.md#osmd-upgrade-20261023--osmd-221-업데이트) | 계획 이력·참고 |
| [PDF-DISPLAY-TRIM.md](../../reference/score/rendering.md#pdf-display-trim--pdf-연습-화면-표시용-자르기) | 현행 Rule |
| [PRACTICE-FILE.md](../../reference/score/file-formats.md#practice-file--음원-연습-파일) | 현행 Rule |
| [PROJECT-STRUCTURE.md](../../reference/engineering/architecture.md#project-structure--프로젝트-구조) | 현행 Rule |
| [RECORDING-TEMPO-APP.md](../../architecture/RECORDING-TEMPO-APP.md) | 이력 진입점 |
| [REHEARSAL-FONT-FIX-20261023.md](rendering-experiments.md#rehearsal-font-fix-20261023--섹션-테두리의-글꼴-측정출력-일치) | 계획 이력·참고 |
| [SCORE-PACKAGE.md](../../reference/score/file-formats.md#score-package--완성-악보-파일-계약--drumscore-v1) | 현행 Rule |
| [SVG-RENDERING.md](../../architecture/SVG-RENDERING.md) | 이력 진입점 |
| [SVG-SCORE-RULES.md](../../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙) | 현행 Rule |
| [WORDS-POSITION-20261023.md](rendering-experiments.md#words-position-20261023--연주-지시-words-세로-위치-지원--2026-10-23) | 계획 이력·참고 |
| [0001-separate-svg-rules-and-decisions.md](../../decisions/0001-separate-svg-rules-and-decisions.md) | MADR 결정 이력 |
| [0002-svg-page-output.md](../../decisions/0002-svg-page-output.md) | MADR 결정 이력 |
| [0003-source-systems-and-cropping.md](../../decisions/0003-source-systems-and-cropping.md) | MADR 결정 이력 |
| [0004-browser-native-score-rendering.md](../../decisions/0004-browser-native-score-rendering.md) | MADR 결정 이력 |
| [0005-practice-layout-and-spacing.md](../../decisions/0005-practice-layout-and-spacing.md) | MADR 결정 이력 |
| [0006-practice-navigation-and-overlays.md](../../decisions/0006-practice-navigation-and-overlays.md) | MADR 결정 이력 |
| [0007-native-drum-notation.md](../../decisions/0007-native-drum-notation.md) | MADR 결정 이력 |
| [0008-continuous-playback-wedges.md](../../decisions/0008-continuous-playback-wedges.md) | MADR 결정 이력 |
| [0009-musicxml-section-direction-layout.md](../../decisions/0009-musicxml-section-direction-layout.md) | MADR 결정 이력 |
| [0010-pretendard-score-text.md](../../decisions/0010-pretendard-score-text.md) | MADR 결정 이력 |
| [0011-hi-hat-open-close-position.md](../../decisions/0011-hi-hat-open-close-position.md) | MADR 결정 이력 |
| [0012-musicxml-canonical-source.md](../../decisions/0012-musicxml-canonical-source.md) | MADR 결정 이력 |
| [0013-score-based-lyric-positions.md](../../decisions/0013-score-based-lyric-positions.md) | MADR 결정 이력 |
| [0014-score-artist-and-kit-metadata.md](../../decisions/0014-score-artist-and-kit-metadata.md) | MADR 결정 이력 |
| [0015-score-tempo-and-recording-estimates.md](../../decisions/0015-score-tempo-and-recording-estimates.md) | MADR 결정 이력 |
| [0016-explicit-recording-beat-connections.md](../../decisions/0016-explicit-recording-beat-connections.md) | MADR 결정 이력 |
| [0017-source-dependent-musicxml-conversion.md](../../decisions/0017-source-dependent-musicxml-conversion.md) | MADR 결정 이력 |
| [0018-reusable-score-production-and-handoff.md](../../decisions/0018-reusable-score-production-and-handoff.md) | MADR 결정 이력 |
| [0019-preserved-drum-kit-selection.md](../../decisions/0019-preserved-drum-kit-selection.md) | MADR 결정 이력 |
| [0020-local-editor-and-public-player.md](../../decisions/0020-local-editor-and-public-player.md) | MADR 결정 이력 |
| [0021-contextual-help-and-shared-ui.md](../../decisions/0021-contextual-help-and-shared-ui.md) | MADR 결정 이력 |
| [0022-portable-score-and-practice-files.md](../../decisions/0022-portable-score-and-practice-files.md) | MADR 결정 이력 |
| [0023-shared-module-boundaries.md](../../decisions/0023-shared-module-boundaries.md) | MADR 결정 이력 |
| [0024-korean-message-catalog.md](../../decisions/0024-korean-message-catalog.md) | MADR 결정 이력 |
| [0025-shared-app-release-version.md](../../decisions/0025-shared-app-release-version.md) | MADR 결정 이력 |
| [0026-device-local-audio-analysis.md](../../decisions/0026-device-local-audio-analysis.md) | MADR 결정 이력 |
| [0027-verification-scope-and-device-evidence.md](../../decisions/0027-verification-scope-and-device-evidence.md) | MADR 결정 이력 |
| [README.md](../../decisions/README.md) | 목록 |
| [README.md](../../design/legend-diagram/README.md) | 실행 절차 |
| [APP-VERSIONS.md](../../reference/engineering/release.md#app-versions--앱-공통-버전) | 현행 Rule |
| [APPLE-LOCAL-WORKFLOW.md](../../how-to/use-apple-local-tools.md#apple-local-workflow--apple-로컬-검토-실행-절차) | 실행 절차 |
| [DEPENDENCY-SECURITY.md](project-quality.md#dependency-security--의존성-보안-점검--2026-10-14) | 계획 이력·참고 |
| [DEPLOYMENT-RULES.md](../../reference/engineering/release.md#deployment-rules--배포-범위와-소스-권위) | 현행 Rule |
| [IPAD-SIMULATOR.md](../../how-to/verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차) | 실행 절차 |
| [IPAD-STATUS-BAR-DIAGNOSIS.md](../ipad.md#ipad-status-bar-diagnosis--ipad-상태바-배색제목-흐림-재조사) | 계획 이력·참고 |
| [OPEN-SOURCE-NOTICES.md](../../reference/engineering/third-party-notices.md#open-source-notices--오픈소스-고지-계약) | 현행 Rule |
| [SITE-SECURITY-HARDENING.md](../../reference/engineering/security.md#site-security-hardening--공개-사이트-보안과-음원-분석-경계) | 현행 Rule |
| [SITES-PUBLICATION.md](../../how-to/release.md#sites-publication--sites-발행-절차) | 실행 절차 |
| [TESTING.md](../../how-to/verify.md#testing--개발-검사와-로컬-자산-준비) | 실행 절차 |
| [VERIFICATION-RULES.md](../../reference/engineering/verification.md#verification-rules--검증-범위와-증거) | 현행 Rule |
| [acceptance.md](../acceptance.md#acceptance--검증-현황) | 사실 기록 |
| [COUNT-OFF-NAVIGATION.md](../../plans/COUNT-OFF-NAVIGATION.md) | 이력 진입점 |
| [PLAYBACK-SCREEN-INVENTORY.md](../../plans/PLAYBACK-SCREEN-INVENTORY.md) | 현행 Rule |
| [PROJECT-QUALITY.md](project-quality.md#project-quality--프로젝트-품질-보완--2026-10-21) | 계획 이력·참고 |
| [PROJECT-RESTRUCTURING.md](project-restructuring.md#project-restructuring--중형-프로젝트-구조-개편-제안) | 계획 이력·참고 |
| [REPEAT-RANGE-ACTIONS.md](../../plans/REPEAT-RANGE-ACTIONS.md) | 이력 진입점 |
| [RESTRUCTURING-MAP.md](project-restructuring.md#restructuring-map--구조-개편-이동표와-의존-규칙) | 계획 이력·참고 |
| [RULE-DOCUMENTATION-REORGANIZATION.md](documentation-reorganization.md#rule-documentation-reorganization--프로젝트-rule-문서-정리) | 실행 계획·결과 |
| [documentation-consolidation.md](documentation-reorganization.md#documentation-consolidation--프로젝트-문서-구조-통합-실행-계획) | 실행 계획·미착수 |
| [APP-VERSIONING.md](../../how-to/release.md#app-versioning--앱-버전-갱신-절차) | 실행 절차 |
| [DRUM-AUDIO.md](../../how-to/render-drum-audio.md#drum-audio--보존-드럼킷으로-음원-제작) | 실행 절차 |
| [I18N.md](../../how-to/develop.md#i18n--앱-문구-변경-절차) | 실행 절차 |
| [PRACTICE-FILES.md](../../how-to/review-score.md#practice-files--완성-악보와-연습-정보-파일-사용-절차) | 실행 절차 |
| [README.md](../../README.md) | 목록 |
| [SCORE-TOOLS.md](../../how-to/produce-score.md#score-tools--공통-제작-도구-사용-절차) | 실행 절차 |
| [UI-REVIEW.md](../../how-to/verify.md#ui-review--화면악보재생-검수-절차) | 실행 절차 |
| [AUDIO-PRACTICE.md](../../reference/product/audio-practice.md#audio-practice--음원-연습) | 현행 Rule |
| [IPAD-LANDSCAPE-UX.md](../../product/IPAD-LANDSCAPE-UX.md) | 이력 진입점 |
| [MARKER-SLOTS.md](../../reference/product/playback.md#marker-slots--마디-마커-슬롯) | 현행 Rule |
| [NOTE-PLAYBACK-HIGHLIGHT.md](../../reference/product/playback.md#note-playback-highlight--음표-따라가기) | 현행 Rule |
| [PAUSED-SCORE-SCROLL.md](../../reference/product/playback.md#paused-score-scroll--정지된-두-줄-악보의-세로-탐색) | 현행 Rule |
| [PLAYBACK-ACTIONS.md](../../reference/product/playback.md#playback-actions--재생-이동과-반복-구간-동작) | 현행 Rule |
| [RIBBON-READABILITY.md](../../product/RIBBON-READABILITY.md) | 이력 진입점 |
| [SCORE-REVIEW.md](../../reference/product/editor.md#score-review--pdf--musicxml-검수-계약) | 현행 Rule |
| [SCORE-WORKSPACE.md](../../reference/product/editor.md#score-workspace--악보제작기-편집-화면) | 현행 Rule |
| [SETTINGS-PLAYBACK.md](../../reference/product/playback.md#settings-playback--설정과-재생-정책) | 현행 Rule |
| [UI-COMPONENTS.md](../../product/UI-COMPONENTS.md) | 생성 참조 |
| [UX-PRINCIPLES.md](../../reference/product/ux.md#ux-principles--팀-ux-원칙과-맥락형-도움말) | 현행 Rule |
| [APP-VERSION-HISTORY.md](../releases.md#app-version-history--앱-릴리스-번호와-정정-기록) | 사실 기록 |
| [APPLE-LOCAL-REVIEW-HISTORY.md](../apple-local-tools.md#apple-local-review-history--apple-로컬-가사-검토-실측-기록) | 사실 기록 |
| [DOCUMENTATION-RECONCILIATION-20261023.md](../documentation.md#documentation-reconciliation-20261023--문서-모순역할-정리-근거--2026-10-23) | 사실 기록 |
| [IPAD-SIMULATOR-HISTORY.md](../ipad.md#ipad-simulator-history--ipad-시뮬레이터-설치연결-기록) | 사실 기록 |
| [PRODUCTION-TOOL-VALIDATION.md](../production-tools.md#production-tool-validation--공통-제작-도구-검증계측-기록) | 사실 기록 |
| [README.md](../README.md) | 목록 |
| [RULE-DOCUMENTATION-VERIFICATION-20261023.md](../documentation.md#rule-documentation-verification-20261023--프로젝트-rule-문서-정리-검증--2026-10-23) | 사실 기록 |
| [RULE-RESIDUE-AUDIT-20261023.md](../documentation.md#rule-residue-audit-20261023--현행-rule-잔여-이력-재점검--2026-10-23) | 사실 기록 |
| [SCORE-PROCESS-EVIDENCE.md](musicxml-evaluation.md#score-process-evidence--제작-프로세스-정리-당시-근거) | 사실 기록 |
| [SITES-PUBLICATION-HISTORY.md](../releases.md#sites-publication-history--sites-발행공개-확인-기록) | 사실 기록 |
| [BEAT-ANCHOR-AUDIT.md](../songs/real-paradis.md#beat-anchor-audit--전체-110마디-음표-위치-기준점-감사) | 곡별/조사·해결 기록 |
| [COMMON-TOOLS.md](../../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독) | 현행 Rule |
| [GARAGEBAND-DRUM-KITS.md](../../reference/score/drum-kits.md#garageband-drum-kits--드럼킷-선택과-보존-라이브러리) | 현행 Rule |
| [IOI-SUDDENLY-CONVERSION.md](../songs/ioi-suddenly.md#ioi-suddenly-conversion--ioi--갑자기-제작실측) | 곡별/조사·해결 기록 |
| [JAPANESE-CANONICAL-READINGS.md](../songs/real-paradis.md#japanese-canonical-readings--일본어-정본과-검수한-한글-발음) | 곡별/조사·해결 기록 |
| [LOVEHOLIC-CONVERSION.md](../songs/loveholic.md#loveholic-conversion--loveholic-pdf--musicxml-작업) | 곡별/조사·해결 기록 |
| [LOVEHOLIC-LYRICS-REVIEW.md](../songs/loveholic.md#loveholic-lyrics-review--loveholic-인쇄-가사-제작과-과거-시각-시험--2026-10-03) | 곡별/조사·해결 기록 |
| [LOVEHOLIC-PDF-LYRIC-PLACEMENT.md](../songs/loveholic.md#loveholic-pdf-lyric-placement--loveholic-pdf-가사-위치-수정--2026-10-03) | 곡별/조사·해결 기록 |
| [LOVEHOLIC-PUBLICATION.md](../songs/loveholic.md#loveholic-publication--loveholic-제작-감독-및-드럼연습실-수록) | 곡별/조사·해결 기록 |
| [LOVEHOLIC-REVIEW.md](../songs/loveholic.md#loveholic-review--loveholic-재검토) | 곡별/조사·해결 기록 |
| [LYRIC-ACCURACY-REVIEW.md](../songs/real-paradis.md#lyric-accuracy-review--가사-시각-정확성-감사--2026-09-19) | 곡별/조사·해결 기록 |
| [LYRIC-ALIGNMENT-AUDIT.md](../songs/real-paradis.md#lyric-alignment-audit--가사-정렬-검증-상태--2026-09-19) | 곡별/조사·해결 기록 |
| [LYRIC-FEEDBACK-RULES.md](../../reference/score/production.md#lyric-feedback-rules--수동-가사-싱크-피드백-접수) | 현행 Rule |
| [LYRIC-SYNC-CORRECTION.md](../songs/real-paradis.md#lyric-sync-correction--가사-싱크-보정--2026-09-19) | 곡별/조사·해결 기록 |
| [LYRIC-SYNC-FEEDBACK.md](../songs/real-paradis.md#lyric-sync-feedback--가사-싱크-청취-피드백-누적) | 곡별/조사·해결 기록 |
| [LYRIC-SYNC-REVIEW-EVIDENCE.md](../songs/real-paradis.md#lyric-sync-review-evidence--교정-목록-재정리-전-근거-069205) | 곡별/조사·해결 기록 |
| [LYRIC-SYNC-SUSPECTS-V1.md](../songs/real-paradis.md#lyric-sync-suspects-v1--남은-가사-싱크-의심-목록) | 곡별/조사·해결 기록 |
| [LYRIC-SYNC-SUSPECTS.md](../songs/real-paradis.md#lyric-sync-suspects--가사-싱크-교정-목록--¼박-격자-기준) | 곡별/조사·해결 기록 |
| [LYRICS-JAPANESE-COMPARISON.md](../songs/real-paradis.md#lyrics-japanese-comparison--일본어-가사-대조--사용자-제공-j-lyric-본문) | 곡별/조사·해결 기록 |
| [MUSICXML-COMPARISON.md](musicxml-evaluation.md#musicxml-comparison--두-musicxml의-원본-복원-품질-비교--2026-09-19) | 곡별/조사·해결 기록 |
| [MUSICXML-CONVERSION-POLICY.md](../../reference/score/production.md#musicxml-conversion-policy--pdf--musicxml-변환-정책) | 현행 Rule |
| [MUSICXML-CONVERSION.md](../songs/real-paradis.md#musicxml-conversion--real-paradis-pdf--musicxml) | 곡별/조사·해결 기록 |
| [MUSICXML-TROUBLESHOOTING.md](musicxml-evaluation.md#musicxml-troubleshooting--악보-변환-문제-해결-기록) | 곡별/조사·해결 기록 |
| [PREPLAY-WARMUP-PRODUCTION.md](../songs/preplay-warmup.md#preplay-warmup-production--시작전-손플기--독립-손-준비-연습곡) | 곡별/조사·해결 기록 |
| [RED-SUNSET-APP-INTEGRATION.md](../songs/red-sunset.md#red-sunset-app-integration--붉은-노을-앱-반영) | 곡별/조사·해결 기록 |
| [RED-SUNSET-BEAT-41.md](../songs/red-sunset.md#red-sunset-beat-41--붉은-노을-41마디-박-위치-조사) | 곡별/조사·해결 기록 |
| [RED-SUNSET-BEAT-COMPARISON.md](../songs/red-sunset.md#red-sunset-beat-comparison--붉은-노을--기존-자동-분석과-새-악보-박-시각-전곡-비교) | 곡별/조사·해결 기록 |
| [RED-SUNSET-LATE-AUDIO-ANALYSIS.md](../songs/red-sunset.md#red-sunset-late-audio-analysis--붉은-노을-후반-음원-단독-재분석) | 곡별/조사·해결 기록 |
| [RED-SUNSET-OPEN-CLOSE-20261023.md](../songs/red-sunset.md#red-sunset-open-close-20261023--붉은-노을-o-가로-배치-교정) | 곡별/조사·해결 기록 |
| [RED-SUNSET-PRODUCTION.md](../songs/red-sunset.md#red-sunset-production--yb-붉은-노을-악보-제작) | 곡별/조사·해결 기록 |
| [RED-SUNSET-REBUILD-20261023.md](../songs/red-sunset.md#red-sunset-rebuild-20261023--붉은-노을--최신-제작-원칙-전곡-재제작) | 곡별/조사·해결 기록 |
| [REUSABLE-PRODUCTION-WORKFLOW.md](../../how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용) | 실행 절차 |
| [SCORE-MUSICXML-OSMD-MAPPING.md](../../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙) | 현행 Rule |
| [SCORE-PRODUCTION-PROCESS.md](../../how-to/produce-score.md#score-production-process--악보-제작-프로세스) | 실행 절차 |
| [SCORE-PRODUCTION-RULES.md](../../reference/score/production.md#score-production-rules--악보-제작-범위와-보존-rule) | 현행 Rule |
| [SECTION-DIRECTION-FINAL-20261023.md](rendering-experiments.md#section-direction-final-20261023--갑자기붉은-노을-전체-재조판) | 곡별/조사·해결 기록 |
| [SECTION-DIRECTION-LAYOUT-REVIEW.md](rendering-experiments.md#section-direction-layout-review--섹션-표제연주-지시의-svg-공동-검토) | 곡별/조사·해결 기록 |
| [TOM-MOVING-PRODUCTION.md](../songs/tom-moving.md#tom-moving-production--탐탐-무빙-연습-제작) | 곡별/조사·해결 기록 |
| [history.md](../../../history.md) | 사실 기록 |
| [README.md](../../../src/modules/score/vendor/pretendard/README.md) | 계획 이력·참고 |

<a id="rules-index--유지와-검증"></a>

### 유지와 검증

문서 추가·역할 변경 때 이 목록과 [절차 목록](../../README.md)을 함께 갱신한다. Rule·ADR·원문/링크 보존 방식은 [문서 관리 Rule](../../reference/engineering/documentation.md#documentation-rules--프로젝트-문서-관리-rule)을 따른다. 이번 정리의 계획과 실제 검증 범위는 [정리 계획](documentation-reorganization.md#rule-documentation-reorganization--프로젝트-rule-문서-정리), [조정 근거](../documentation.md#documentation-reconciliation-20261023--문서-모순역할-정리-근거--2026-10-23), [history](../../../history.md)에 둔다. 앱 코드·악보 변경과 앱/오디오 검증을 문서 검증으로 대신하지 않는다.

Rule 본문의 잔여 이력 재점검은 [35개 파일별 결과](../documentation.md#rule-residue-audit-20261023--현행-rule-잔여-이력-재점검--2026-10-23)를 따른다.

<a id="docs-procedures-readme--실행-절차-목록"></a>

## 실행 절차 목록

입력·선행 조건·수행 순서·명령·완료 확인을 찾는 목록이다. 요구·금지는 [Rule 목록](../../RULES-INDEX.md), 선택 이유는 [ADR](../../decisions/README.md), 실측·배포는 [기록](../README.md)으로 구분한다. 절차에 있는 명령을 모두 실행하라는 지시가 아니며, 실제 사용자 요청과 전역/프로젝트 권한을 먼저 적용한다.

| 절차 | 실행 범위 |
| --- | --- |
| [README.md](../../../README.md) | 프로젝트 시작·개발 명령 |
| [SCORE-PRODUCTION-PROCESS.md](../../how-to/produce-score.md#score-production-process--악보-제작-프로세스) | 접수 → 평가 → 변환 → 가사 → 연결 → 조판/패키지 → 앱 검수 → 인계 |
| [REUSABLE-PRODUCTION-WORKFLOW.md](../../how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용) | 계측 start/mark/finish·공통 검수·인계문/접수 |
| [SCORE-TOOLS.md](../../how-to/produce-score.md#score-tools--공통-제작-도구-사용-절차) | 새 곡 설정·기존 어댑터·실행 예 |
| [DRUM-AUDIO.md](../../how-to/render-drum-audio.md#drum-audio--보존-드럼킷으로-음원-제작) | 보존 키트 확인·이벤트/샘플 렌더·메타정보 |
| [PRACTICE-FILES.md](../../how-to/review-score.md#practice-files--완성-악보와-연습-정보-파일-사용-절차) | 완성 패키지/사용자 음원 연습 정보 저장·복원 |
| [I18N.md](../../how-to/develop.md#i18n--앱-문구-변경-절차) | 문구 추가·정본/예외·집중 검사 |
| [UI-REVIEW.md](../../how-to/verify.md#ui-review--화면악보재생-검수-절차) | 화면·비교·실제 저장/재생·종료 상태 확인 |
| [TESTING.md](../../how-to/verify.md#testing--개발-검사와-로컬-자산-준비) | 의존성/생성 준비·검사 명령·실제 자산·수록 QA |
| [IPAD-SIMULATOR.md](../../how-to/verify-ipad.md#ipad-simulator--ipad-mini-검증-실행-절차) | 기록된 iPad 대상·실제 가용/권한 확인·CLI·검수 |
| [APPLE-LOCAL-WORKFLOW.md](../../how-to/use-apple-local-tools.md#apple-local-workflow--apple-로컬-검토-실행-절차) | 별도 요청된 로컬 STT/AFM 실행·출력 확인 |
| [APP-VERSIONING.md](../../how-to/release.md#app-versioning--앱-버전-갱신-절차) | 승인 범위의 버전/빌드 식별자 갱신 |
| [SITES-PUBLICATION.md](../../how-to/release.md#sites-publication--sites-발행-절차) | 검증 main의 player 발행·자산 대조·공개 확인 |
| [SKILL.md](../../../.agents/skills/produce-drum-score/SKILL.md) | 악보 제작 등록 스킬 |
| [SKILL.md](../../../.agents/skills/release-drum-practice/SKILL.md) | 변경 검토·PR/CI/main·발행·브랜치 정리 등록 스킬 |
| [SKILL.md](../../../.agents/skills/find-timed-lyrics/SKILL.md) | 별도 요청한 시간 가사 탐색 등록 스킬 |
| [README.md](../../design/legend-diagram/README.md) | 범례 SVG의 제작/생성 안내; 이번에는 생성물 미변경 |

곡별 생성 명령·독립 판독 기대값·파일 해시는 해당 곡 제작 기록을 따른다. 과거 다른 곡의 값·포트·삭제된 worktree·가상환경을 그대로 복사하지 않는다.

원문 출처: `docs/procedures/README.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="docs-records-readme--사실-기록과-참고-자료"></a>

## 사실 기록과 참고 자료

기록은 당시 입력·환경·버전·관측과 한계를 담는다. 새 실행 성공이나 승인 Rule이 아니다. 결정의 이유는 [ADR](../../decisions/README.md), 지금 적용할 계약은 [Rule 목록](../../RULES-INDEX.md), 실행은 [절차](../../README.md)를 따른다.

| 기록 | 내용 |
| --- | --- |
| [앱 릴리스 번호와 정정 기록](../releases.md#app-version-history--앱-릴리스-번호와-정정-기록) | 원문 날짜·해시·검증 범위·미확인을 보존 |
| [Apple 로컬 가사 검토 실측 기록](../apple-local-tools.md#apple-local-review-history--apple-로컬-가사-검토-실측-기록) | 원문 날짜·해시·검증 범위·미확인을 보존 |
| [문서 모순·역할 정리 근거 — 2026-10-23](../documentation.md#documentation-reconciliation-20261023--문서-모순역할-정리-근거--2026-10-23) | 원문 날짜·해시·검증 범위·미확인을 보존 |
| [iPad 시뮬레이터 설치·연결 기록](../ipad.md#ipad-simulator-history--ipad-시뮬레이터-설치연결-기록) | 원문 날짜·해시·검증 범위·미확인을 보존 |
| [공통 제작 도구 검증·계측 기록](../production-tools.md#production-tool-validation--공통-제작-도구-검증계측-기록) | 원문 날짜·해시·검증 범위·미확인을 보존 |
| [프로젝트 Rule 문서 정리 검증 — 2026-10-23](../documentation.md#rule-documentation-verification-20261023--프로젝트-rule-문서-정리-검증--2026-10-23) | 원문 날짜·해시·검증 범위·미확인을 보존 |
| [제작 프로세스 정리 당시 근거](musicxml-evaluation.md#score-process-evidence--제작-프로세스-정리-당시-근거) | 원문 날짜·해시·검증 범위·미확인을 보존 |
| [Sites 발행·공개 확인 기록](../releases.md#sites-publication-history--sites-발행공개-확인-기록) | 원문 날짜·해시·검증 범위·미확인을 보존 |

곡별 제작·가사 교정·문제 해결·의존성 진단·검증 현황·완료된 계획은 기존 경로를 유지한다. [전체 문서 분류](documentation-reorganization.md#rules-index--전체-markdown-문서-분류)에서 빠짐없이 찾을 수 있다. `history.md`는 실제 변경/검증의 누적 기록이며 ADR을 대신하지 않는다. Git 제외 자료나 과거 삭제된 캡처의 현재 존재는 별도로 확인한다.

- [현행 Rule 잔여 이력 재점검](../documentation.md#rule-residue-audit-20261023--현행-rule-잔여-이력-재점검--2026-10-23): 35개 파일별 판정·이관·계약과 링크 보존 결과.

원문 출처: `docs/records/README.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="prd-before-consolidation"></a>

## PRD 상세 참조 전환 전 — 2026-10-23

다음은 통합 전 제품 개요의 중복 설명이다. 현행 계약은 [재생](../../reference/product/playback.md), [탐색·좌표](../../reference/score/rendering.md), [음원 연습](../../reference/product/audio-practice.md)에 있다. 숫자·기능 변경 없이 제품 개요를 링크로 전환했다.

## 연습과 탐색

- 한 줄 이어 보기와 두 줄 고정 보기, 악보 배율·균등 간격·음표 따라가기, 지원되는 악보 형식 전환을 제공한다.
- 원곡은 1배속, 연습 BPM은 지정 템포로 재생한다. BPM 변환 상태는 숫자 표시와 프리셋 사이에 표시한다.
- 박 시각이 있는 음원은 원곡에서 변화하는 BPM을 소수점 한 자리로 표시한다. 연습 BPM에서는 고정 메트로놈에 맞게 음원의 박 간격을 변환한다.
- 마디 선택과 재생 위치를 분리한다. 방향키로 선택할 때 재생선은 정지 위치에 남고 선택 테두리만 이동한다. 재생은 선택한 마디에서 시작한다.
- 마커는 5개, 구간은 9개다. 구간은 시작 마디 순서로 정렬하고 가득 차면 가장 오래 등록한 구간을 교체한다.
- 구간은 Enter 두 번, 더블클릭 두 번, 또는 빈 슬롯을 누른 뒤 시작·끝 마디를 클릭/터치해 등록한다. 드래그는 구간 등록에 사용하지 않는다.
- 새 곡의 기본값은 음악 50%, 메트로놈 100%, 메트로놈 켜짐이다. 저장된 사용자 설정은 유지한다.
- 연주 전 구간과 1마디 기준, 카운트오프는 [음원 연습](../../reference/product/audio-practice.md#audio-practice--음원-연습)과 [설정 정책](../../reference/product/playback.md#settings-playback--설정과-재생-정책)을 따른다.
