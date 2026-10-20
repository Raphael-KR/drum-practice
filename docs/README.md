# 프로젝트 문서 안내

현재 제품 기준은 [PRD](../PRD.md), 최근 변경은 [개발 기록](../history.md)에서 확인한다. 이 목록은 현재 작업의 진입점이다.

## 개발·운영

| 문서 | 용도 |
| --- | --- |
| [프로젝트 README](../README.md) | 실행 주소·명령·앱 역할 |
| [프로젝트 구조](architecture/PROJECT-STRUCTURE.md) | 앱·기능·저장·공통 계층과 의존 규칙 |
| [검사 실행 방법](operations/TESTING.md) | 전체·휴대 가능한 검사·로컬 자료 준비 |
| [UX 원칙](product/UX-PRINCIPLES.md) | 승인된 UI와 도움말 기준 |
| [음원 연습](product/AUDIO-PRACTICE.md) | 자동 곡 정보·박자·로컬 캐시·연주 시작·카운트오프 |
| [설정과 재생](product/SETTINGS-PLAYBACK.md) | 기본값·설정 범위·BPM·재개 정책 |
| [마커 슬롯](product/MARKER-SLOTS.md) | 5개 슬롯과 추가/삭제 동작 |
| [공통 화면 목록](plans/PLAYBACK-SCREEN-INVENTORY.md) | 코드 검사에서 사용하는 화면·컴포넌트 ID |
| [UI 컴포넌트](product/UI-COMPONENTS.md) | 소스에서 생성하는 컴포넌트 목록 |
| [앱 버전](operations/APP-VERSIONS.md) | 현재 버전·증가 기준·과거 번호 정정 |
| [검증 현황](operations/acceptance.md) | 최근 릴리스 근거와 미확인 범위 |
| [Sites 발행](operations/SITES-PUBLICATION.md) | player 전용 발행 절차·최근 배포 |
| [iPad 시뮬레이터](operations/IPAD-SIMULATOR.md) | 지정 기기와 검증 환경 |
| [Apple 로컬 활용](operations/APPLE-LOCAL-WORKFLOW.md) | STT/AFM 실행·검증 계약 |
| [다국어](architecture/I18N.md) | 번역 키 관리 |
| [오픈소스 고지](operations/OPEN-SOURCE-NOTICES.md) | 의존성 라이선스 |

## 악보 제작·표시 정본

1. [제작 프로세스](score-production/SCORE-PRODUCTION-PROCESS.md)에서 입력·원본·검증 순서를 확인한다.
2. 변환은 [변환 정책](score-production/MUSICXML-CONVERSION-POLICY.md), 표기는 [MusicXML/OSMD 매핑](score-production/SCORE-MUSICXML-OSMD-MAPPING.md)을 따른다.
3. 저장은 [MusicXML 정본](architecture/MUSICXML-CANONICAL.md), 출력은 [SVG 규칙](architecture/SVG-SCORE-RULES.md), 인계는 [악보 패키지](architecture/SCORE-PACKAGE.md)를 따른다.
4. 문제 해결은 [변환 문제 기록](score-production/MUSICXML-TROUBLESHOOTING.md), 드럼킷 선택은 [GarageBand 드럼킷](score-production/GARAGEBAND-DRUM-KITS.md)을 확인한다.

2026-10-13 실험 자료를 삭제했다. 최신 제작 원본은 `data/production/`, 변환 입력·MusicXML 스키마·회귀 검사 입력은 `data/reference/`에 보존했다. 곡별 제작 문서는 유지한다. 예: [시작전 손풀기](score-production/PREPLAY-WARMUP-PRODUCTION.md), [탐탐 무빙](score-production/TOM-MOVING-PRODUCTION.md), [Loveholic](score-production/LOVEHOLIC-CONVERSION.md), [바람과 언덕의 발라드](score-production/MUSICXML-CONVERSION.md).

## 기록 유지 규칙

- 현재 동작을 바꾸면 해당 정본과 `history.md`를 함께 갱신한다. 이전 결정을 새 지시와 섞지 않는다.
- 2026-10-13 사용자 요청으로 기존 문서 보관본을 모두 삭제했다. 현재 문서에서 삭제된 자료를 필수 참조로 사용하지 않는다.
- 반복 설명은 현재 정본을 연결한다. 자동 생성 문서는 생성 스크립트를 통해 갱신한다.
- 소스·문서와 원본 미디어·생성 파일의 보존 정책을 구분한다. 악보 원본·사용자 저장소는 유지한다. 실험 출력은 이번 사용자 요청에 따라 삭제했다.

## 보존한 제작 자료

- `data/production/loveholic/`: source(PDF·변환 XML·가사 매핑), audio(MP3·박자 분석), final(최종 MusicXML·패키지).
- `data/production/preplay-warmup/`: source(작곡 원본·MIDI), audio(SoCal WAV·MP3), final(최종 악보·패키지).
- `data/production/tom-moving/`: source(작곡 입력·MIDI·reference 참고 영상), audio(Portland 음원), final(최종 MusicXML·패키지).
- `data/reference/`: 실제 변환 입력·MusicXML XSD·자동 회귀 검사에서 사용하는 악보.

생성 검증 보고서도 삭제했다. 시작전 손풀기·탐탐 무빙 패키지를 다시 제작할 때는 사용자 시험 허가를 받은 뒤 해당 생성기를 먼저 실행해 `generation-audit.json`을 재생성한다. 기존 PASS 기록을 임의로 복구하거나 검사를 생략하지 않는다. 현재 배포 악보 재생에는 이 보고서가 필요하지 않다.
