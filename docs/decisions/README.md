# 프로젝트 결정 기록

현행 계약은 [Rule 목록](../RULES-INDEX.md), 수행 순서는 [실행 절차](../README.md), 실측·배포·곡별 검증은 [사실 기록](../records/README.md)을 따른다. 이 목록은 왜 선택했고 무엇을 대체했는지 찾는 진입점이다.

## 형식과 상태

- [MADR 4.0.0](https://github.com/adr/madr/tree/4.0.0/template)을 사용하며 파일명은 `NNNN-title-with-dashes.md`다. 이 프로젝트 범위의 문서 형식이며 전역 표준을 새로 강제하지 않는다.
- YAML `status`는 결정 상태, `date`는 마지막 갱신일이다. 원래 결정 시기는 본문과 원문에 남긴다. `accepted`는 구현·전곡·기기·청취·발행 검증 완료를 뜻하지 않는다.
- Context and Problem Statement, Considered Options, Decision Outcome, Consequences, Confirmation, More Information을 사용한다. 대안은 확인한 채택/대체 경로이며 별도 합의 회의를 추정하지 않는다.
- 최초 이관은 주제별 기존 최종 결정을 기록하고 대체 전 원문·검증을 More Information에 보존한다. 실제 새 결정이 기존 결정을 대체하면 새 ADR과 이전 status·대체 링크를 갱신한다.
- 같은 주제는 기존 ADR을 재사용한다. 배포/테스트 수·해시·측정값을 건별 ‘결정’으로 만들지 않는다. 이번 문서 이관은 앱·악보의 새 검증이 아니다.

## 목록

| ADR | 결정 | 상태 | 원래 범위/시기 |
| --- | --- | --- | --- |
| 0001 | [SVG 현행 규칙과 결정 이력을 분리한다](0001-separate-svg-rules-and-decisions.md) | accepted | 2026-10-23 |
| 0002 | [전체 페이지 출력과 원본 의미를 분리한다](0002-svg-page-output.md) | accepted | 2026-09-21 이후 |
| 0003 | [원본 줄 구성과 연습용 자르기의 범위를 구분한다](0003-source-systems-and-cropping.md) | accepted | 2026-10-03 최종 정정·10-21 검수 |
| 0004 | [두 앱은 정본 XML과 공통 native 조판을 사용한다](0004-browser-native-score-rendering.md) | accepted | 2026-10-03 |
| 0005 | [연습 배치는 native 비율과 보기별 간격 정책을 사용한다](0005-practice-layout-and-spacing.md) | accepted | 2026-10-03~04 |
| 0006 | [재생 위치·선택·구간 표시를 분리한다](0006-practice-navigation-and-overlays.md) | accepted | 2026-10-03~13 |
| 0007 | [확정 범례와 음악 구조를 유지하며 native 기호를 보완한다](0007-native-drum-notation.md) | accepted | 2026-10-03~15 |
| 0008 | [재생용 여러 마디 wedge를 연속 기하로 연결한다](0008-continuous-playback-wedges.md) | accepted | 2026-10-03·10-23 |
| 0009 | [섹션과 연주 지시를 분리하고 XML로 배치 의도를 보존한다](0009-musicxml-section-direction-layout.md) | accepted | 2026-10-23 |
| 0010 | [모든 악보 텍스트는 Pretendard로 측정하고 표시한다](0010-pretendard-score-text.md) | accepted | 2026-10-23 |
| 0011 | [O+를 같은 음표 harmonic·stopped와 XML 위치로 가로 표시한다](0011-hi-hat-open-close-position.md) | accepted | 2026-10-23 |
| 0012 | [MusicXML 원문을 정본으로 보존하고 Song을 파생한다](0012-musicxml-canonical-source.md) | accepted | 기존 정본 전환·원결정일 미기재 |
| 0013 | [가사는 악보 위치와 음가를 정본으로 저장한다](0013-score-based-lyric-positions.md) | accepted | 기존 정본 전환·2026-10-03 |
| 0014 | [일반 곡의 가수와 연습 악보의 드럼킷을 구분해 저장한다](0014-score-artist-and-kit-metadata.md) | accepted | 2026-10-06 공통화 |
| 0015 | [악보 템포와 원곡 측정값을 분리한다](0015-score-tempo-and-recording-estimates.md) | accepted | 2026-10-13 |
| 0016 | [명시적 beatTimes를 보존하며 연습 박은 일정하게 유지한다](0016-explicit-recording-beat-connections.md) | accepted | 2026-10-15 |
| 0017 | [입력 유형에 맞춰 변환 경로를 선택하고 원본으로 검증한다](0017-source-dependent-musicxml-conversion.md) | accepted | 원결정 시기는 본문·이관 원문 참조 |
| 0018 | [공통 제작 코드를 재사용하고 곡별 판단과 인계를 분리한다](0018-reusable-score-production-and-handoff.md) | accepted | 원결정 시기는 본문·이관 원문 참조 |
| 0019 | [보존된 SoCal·Portland에서 목적에 맞는 드럼킷을 선택한다](0019-preserved-drum-kit-selection.md) | accepted | 원결정 시기는 본문·이관 원문 참조 |
| 0020 | [로컬 제작기와 공개 연습실의 운영 범위를 구분한다](0020-local-editor-and-public-player.md) | accepted | 원결정 시기는 본문·이관 원문 참조 |
| 0021 | [공통 UI와 맥락형 도움말로 반복 조작 부담을 줄인다](0021-contextual-help-and-shared-ui.md) | accepted | 원결정 시기는 본문·이관 원문 참조 |
| 0022 | [완성 악보 패키지와 음원 연습 정보 파일의 계약을 구분한다](0022-portable-score-and-practice-files.md) | accepted | 원결정 시기는 본문·이관 원문 참조 |
| 0023 | [두 앱을 공통 기능·모델·저장 계층으로 조립한다](0023-shared-module-boundaries.md) | accepted | 원결정 시기는 본문·이관 원문 참조 |
| 0024 | [한국어 메시지 정본과 안정적인 키를 공유한다](0024-korean-message-catalog.md) | accepted | 원결정 시기는 본문·이관 원문 참조 |
| 0025 | [두 앱은 같은 릴리스 번호와 소스 빌드 식별자를 사용한다](0025-shared-app-release-version.md) | accepted | 원결정 시기는 본문·이관 원문 참조 |
| 0026 | [개인 음원과 분석 캐시는 기기 내부에서 처리한다](0026-device-local-audio-analysis.md) | accepted | 원결정 시기는 본문·이관 원문 참조 |
| 0027 | [검증 범위와 실제 환경의 증거를 구분한다](0027-verification-scope-and-device-evidence.md) | accepted | 원결정 시기는 본문·이관 원문 참조 |
| 0028 | [pnpm 공유 저장소와 중앙 버전 카탈로그를 사용한다](0028-shared-dependency-store-and-catalog.md) | accepted | 2026-10-25 |

기존 0001~0016을 재사용했다. 0003 자르기·0004 공통 조판·0005 배치·0006 탐색·0007 범례·0009 섹션·0011 O+·0012 정본·0013 가사·0014 메타정보·0015 템포·0016 박 연결의 결정 식별자와 기존 주소를 유지한다. 현행 Rule 본문은 [주제별 정본](../RULES-INDEX.md)으로 통합했고, 옛 문서 주소는 문단별 이전 안내다. 0017~0027은 기존 다른 문서에서 확인한 변환/제작·키트·제품·공통 UX·파일·구조·문구·버전·로컬 분석·검증 선택을 분리한 것이다.
## 이전 문단 링크

<a id="악보-정본-결정-기록"></a>

[이관한 원문과 근거](0001-separate-svg-rules-and-decisions.md)를 확인한다.
