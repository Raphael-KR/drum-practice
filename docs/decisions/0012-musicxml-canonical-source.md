---
status: accepted
date: 2026-10-23
---

# MusicXML 원문을 정본으로 보존하고 Song을 파생한다

## Context and Problem Statement

악보·가사·음원 연결을 화면 모델이나 렌더러 출력에서 다시 만들면 원문과 앱 확장 필드가 소실될 수 있었다. 기존 정본 전환은 XML 원문 보존과 저장/복원 계약을 선택했다.

## Considered Options

* Song 또는 렌더러 재출력을 저장의 원천으로 사용한다.
* canonicalXML 원문을 보존하고 화면/재생 모델을 복원한다.

## Decision Outcome

RecordData.canonicalXML을 정본으로 유지한다. 렌더러로 XML을 재생성하지 않으며 안정 마디 ID·음원 해시·연결점·확장 필드를 보존한다. 저장/교환과 편집 경계는 정본 계약을 따른다.

### Consequences

과거 단일 HTML의 보존·검증 문구는 당시 기록이다. 2026-10-13 독립 HTML 기능 폐기 후에는 IndexedDB·ZIP·MusicXML 내보내기의 계약을 현행으로 유지한다. 과거114검사를 이번 분리의 앱 검증으로 사용하지 않는다.

### Confirmation

현재 계약은 [MusicXML 정본](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약), 입력은 [매핑 Rule](../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙)을 따른다. 아래 PASS·측정·기기 결과는 당시 범위이며 이번 문서 분리에서 앱 시험을 재실행하지 않았다.

## More Information

독립 HTML 폐기 근거는 [프로젝트 지침](../../AGENTS.md)과 [개발 기록](../../history.md#2026-10-13-독립-html-저장-기능-폐기)에 있다. 당시 단일 HTML 문구를 현행 계약에서 제외한 이유다.


### MusicXML 입력 매핑·정본 계약에서 옮긴 근거 — 2026-10-23 이관

아래 원문은 당시 문맥·승인/검증 범위를 보존한다. 과거의 미확인·보류·HTML·시안 수치를 현재 지원이나 새 실행으로 해석하지 않는다. 현행 규칙은 입력 매핑·정본 계약·SVG Rule에서 확인한다.

### MusicXML 정본 전환

- 목표: 악보·메타정보·가사 리듬 성부 및 음원 연결점을 MusicXML에 보존한다.

- 범위: 로컬 웹앱의 저장/복원/HTML/가사 편집과 보컬 MusicXML 가져오기. 기존 사용자 교정 보존.

- 완료 조건: 저장 후 MusicXML에서 마디·박 가사를 복원하고 음원 연결 변경에도 악보 위치가 불변. 자유 초 편집 제거.

- 제외: 없는 보컬 음높이 추정, PDF의 무검증 자동 채보, 렌더러 즉시 교체.

- 검증: MusicXML 왕복/가사 위치/메타정보/연결점 보존 회귀 검사, 실제 앱 및 빌드. 렌더러 비교는 기존 렌더러를 유지한 채 근거를 기록한다.

MusicXML 원문은 렌더러로 재생성하지 않고 직접 보존·수정한다. 화면의 Song은 파생 편집 모델이다. 가사 초 단위 값은 재생용 캐시다. 가사 정본은 독립 파트의 음절 시작과 음가다. 기존 PDF만 있는 곡은 채보하지 않은 드럼 음표를 만들지 않으며 가사 성부부터 보존하고 원본 PDF를 유지한다. 변환된 MusicXML이 있는 곡은 그 악보를 기반으로 한다.

#### 저장 계약

- `RecordData.canonicalXML`이 정본이다. 악보 원문을 유지하며 `DrumPracticeLyrics` 파트만 앱이 다시 쓴다. 제목·제작자 변경도 여기에 쓴다. `Song`의 메타정보·가사·재생 시각은 화면/오디오용 파생 모델이고, 열 때 XML에서 다시 복원한다.

- `drum-practice:score:v1` miscellaneous-field에 마디의 안정 ID, 라벨·박자표와 음원 시작/끝 연결점, 음원 SHA-256, 음절 ID·확인 상태를 둔다. 현 앱의 인쇄 순서 재생에 맞춰 occurrence=1이다. 반복 기호의 자동 펼치기는 기존과 같이 지원하지 않는다. 임의 중간 박 앵커 UI는 이번 범위가 아니며 기존 마디 시작/끝 연결로 보간한다.

- XML 음원 해시가 있으면 열 때 실제 음원과 대조한다. 렌더러를 통과해 정본을 다시 만들지 않으므로 앱 전용 확장 필드가 사라지지 않는다.

- IndexedDB, ZIP의 `canonical.musicxml`(미디어 제외 백업에도 포함), 단일 HTML이 정본을 보존한다. 파일·안내 → MusicXML 저장에서 직접 내보낸다. 다시 가져오면 가사·메타정보·연결점을 읽는다.

- MusicXML에 실제 드럼 악보가 있으면 마디 수/박자표를 바꾸는 편집은 원본 악보에서 수행하도록 막는다. 영역과 음원 연결은 앱에서 수정 가능하다. PDF만 있는 곡에서는 PDF를 유지하며 가사 XML부터 생성한다. 이 XML을 드럼 음표까지 채보된 악보라고 표시하지 않는다.

#### 검증

- 31개 테스트 파일, 114개 검사 통과(최종 실행 기록 history.md). 정본 재읽기, 파생 캐시 무시, 동시 음절/마디를 넘는 길이, 보컬 셋잇단음표, 음원 연결 이동, XML 재가져오기, 저장/HTML/유형 전환 보존, 해시 불일치 거절을 검사했다.

- 원곡 515개 시작 위치 이전 변경 0개. 길이는 기존 재생용 끝 시각을 음악적 길이로 변환한 값이며 실제 발음 길이를 새로 청취해 검증한 결과가 아니다.

- 가사 전용 XML 및 실제 UI에서 보컬 파트를 추가한 전체 XML 모두 로컬 W3C MusicXML 4.0 XSD PASS. 외부 프로그램을 거친 앱 확장 필드 보존을 보장하는 결과는 아니다.

- localhost QA 곡에서 보컬 가져오기, 마디/박 변경 후 저장, XML 재읽기 확인. iPad mini(A17 Pro) iOS27 Safari에서 HTML의 가사 편집 화면 확인: `docs/experiments/canonical/ipad-lyrics.png`.


### Rule 재점검 원문 — MUSICXML-CANONICAL.md / 6

출처: [docs/architecture/MUSICXML-CANONICAL.md](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> - `RecordData.canonicalXML`이 정본이다. 악보 원문을 유지하며 `DrumPracticeLyrics` 파트만 앱이 다시 쓴다. 제목·제작자 변경도 여기에 쓴다. `Song`의 메타정보·가사·재생 시각은 화면/오디오용 파생 모델이고, 열 때 XML에서 다시 복원한다.
> - 가사 위치: `measureId + quarterOffset + durationQuarters`. 단위는 사분음표 길이이며 박자표 분모에 따라 화면의 ‘박’으로 변환한다. 기본 편집은 ¼박이고, 보컬 악보의 세부 음가는 그대로 보존한다. XML은 divisions/duration, 독립된 unpitched 음표와 lyric으로 기록한다. 음높이는 추정하지 않는다. 동시 음절은 서로 다른 voice로, 마디를 넘는 길이는 extend로 보존한다.
> - 초 단위 자유 가사 편집과 끝 시각 입력을 제거했다. `time/end/grid`는 재생·기존 표시 코드의 캐시다. 이력의 이전 초 단위 데이터는 복구 근거로만 남긴다. 초기 이전 때 기존 시작 격자를 유지하고 끝 길이는 음악적 단위로 변환한다.
> - 원제는 work-title, 표시 제목은 movement-title 및 `drum-practice:display-title`, 제작자는 artist/composer/lyricist로 저장한다. 원래의 다른 메타정보/파트는 유지한다.
> - **앞으로 제작하는 모든 드럼 연습 악보의 가수란(`artist`)에는 선택하여 사용하는 드럼킷 이름을 반드시 기록한다.** 예: `SoCal 드럼킷`, `Portland 드럼킷`. 개별 세 곡만의 예외가 아닌 공통 제작 규칙이다. 드럼킷은 [선택 기준](../reference/score/drum-kits.md#garageband-drum-kits--드럼킷-선택과-보존-라이브러리)에 따라 정하고 SoCal로 고정하지 않는다.
> - 연습 악보의 키트 이름은 MusicXML `identification/creator type="artist"`와 파생 `Song.artist`에 동일하게 저장한다. 패키지를 만들면 내장 정본 XML과 Song의 값도 동일해야 한다. 제작·교정·재제작·저장 후 재읽기에서 누락이나 불일치를 확인한다. 이 메타정보 규칙이 요청하지 않은 음원 제작을 추가하는 것은 아니다.
> - 일반 곡 악보의 `artist`는 실제 가수·아티스트를 유지한다. 세션 연주자·강사·참고 영상 채널은 가수로 입력하지 않는다. 참고 자료의 출처는 제작 문서에 보존한다.
> - `drum-practice:score:v1` miscellaneous-field에 마디의 안정 ID, 라벨·박자표와 음원 시작/끝 연결점, 음원 SHA-256, 음절 ID·확인 상태를 둔다. 현 앱의 인쇄 순서 재생에 맞춰 occurrence=1이다. 반복 기호의 자동 펼치기는 기존과 같이 지원하지 않는다. 임의 중간 박 앵커 UI는 이번 범위가 아니며 기존 마디 시작/끝 연결로 보간한다.
> - XML 음원 해시가 있으면 열 때 실제 음원과 대조한다. 렌더러를 통과해 정본을 다시 만들지 않으므로 앱 전용 확장 필드가 사라지지 않는다.
> - MusicXML에 실제 드럼 악보가 있으면 마디 수/박자표를 바꾸는 편집은 원본 악보에서 수행하도록 막는다. 영역과 음원 연결은 앱에서 수정 가능하다. PDF만 있는 곡에서는 PDF를 유지하며 가사 XML부터 생성한다. 이 XML을 드럼 음표까지 채보된 악보라고 표시하지 않는다.


### Rule 재점검 원문 — MUSICXML-CANONICAL.md / 7

출처: [docs/architecture/MUSICXML-CANONICAL.md](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> - IndexedDB, ZIP의 `canonical.musicxml`(미디어 제외 백업에도 포함)이 정본을 보존한다. 파일·안내 → MusicXML 저장에서 직접 내보낸다. 다시 가져오면 가사·메타정보·연결점을 읽는다.
> - 독립 HTML 저장·내보내기는 폐기된 기능이다. 관련 과거 문구·검증은 [ADR-0012](0012-musicxml-canonical-source.md)에 보존하며 재도입하지 않는다.
> - 기존 PDF만 있는 곡은 원본 PDF를 유지하고 가사 XML부터 보존한다. 채보하지 않은 드럼 음표를 만들거나 가사 XML을 전체 드럼 채보라고 표시하지 않는다.


### Rule 재점검 원문 — MUSICXML-CANONICAL.md / 8

출처: [docs/architecture/MUSICXML-CANONICAL.md](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> ## 렌더러 결정
