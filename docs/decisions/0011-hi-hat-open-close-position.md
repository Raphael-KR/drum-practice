---
status: accepted
date: 2026-10-23
---

# O+를 같은 음표 harmonic·stopped와 XML 위치로 가로 표시한다

## Context and Problem Statement

2026-10-23 붉은 노을의 O+가 위아래로 조판되었다. 사용자는 open 후보를 harmonic으로 정정하고 이후 악보에도 같은 음표 harmonic·stopped의 가로 배치를 적용하도록 확정했다.

## Considered Options

* open 후보 또는 일반 텍스트/도형으로 두 기호를 대신한다.
* 같은 음표의 harmonic·stopped native 글리프에 XML 좌표를 연결한다.

## Decision Outcome

후자를 채택한다. ○ 왼쪽/＋ 오른쪽·같은 높이와 실제 잉크 간격을 확인한다. 일반 MusicXML harmonic 의미와 이 프로젝트에서 승인한 하이햇 용도는 구분한다.

### Consequences

default-x/y·relative-x/y를 native 계산 전에 반영한다. 검증한 한 VoiceEntry의 각1개 기호 범위를 반복 chord member의 일반 지원으로 확대하지 않는다. 도움말은 닫기→열었다 닫기→반열림 순서다.

### Confirmation

현재 기준은 [SVG 규칙](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙)을 따른다. 아래 검증·버전·수치는 당시 기록이며 이번 문서 이관에서 시험을 재실행한 결과가 아니다.

## More Information

아래는 분리 전 혼합 문서에서 옮긴 원문이다. 원문의 날짜·버전 순서와 위 Decision Outcome을 함께 읽는다. 과거의 ‘현재’, ‘미구현’, 초안 수치와 PASS는 당시 범위에만 적용한다.

#### 공통 도움말 범례

공통 도움말의 ‘드럼 악보 기호’는 2026-10-23부터 28개 항목이다. 하이햇 닫기와 반열림 사이에 ‘하이햇 열었다 닫기’를 두고, 같은 음표의 harmonic·stopped native ○＋ 경로를 가로로 표시한다. 정적 가로·세로 범례의 생성 원본·재생성은 [범례 그림 문서](../design/legend-diagram/README.md)를 따른다. 악보 재생용 SVG의 음표·주법 좌표를 이 정적 그림으로 보정하지 않는다.

### 명시적 harmonic·stopped 위치 — 2026-10-23

- 목표: 사용자 승인 O+ 복합 지시를 같은 음표의 native ○·＋로 그리며, MusicXML 위치 속성만으로 재생성한다.
- 범위: [입력 매핑 정본](../reference/score/notation.md#score-musicxml-osmd-mapping--o-복합-지시의-승인-범위)에 따른 `technical/harmonic`·`technical/stopped`의 `default-x/y`·`relative-x/y`. 공통 `technical-position.ts`와 기존 음표별 렌더 토큰을 사용한다.
- 완료 조건: print·timeline·rows·grid에서 정확한 chord member 위에 ○ 왼쪽/＋ 오른쪽, 같은 중심 높이, 실제 잉크 경계 겹침 없음. 상대/부분 좌표의 native 기본값 유지와 위치 미지정 주법 보존을 코드에서 확인한다.
- 제외: open 파서 추가, 일반 도형/텍스트 대체, 곡명/마디별 하드코딩, 외부 좌표표·완성 SVG 좌표 수정, 원본 XML·음가·성부·재생 시점/음원 변경, 수록 패키지 교체·발행.
- 검증: 제작자의 실제 붉은 노을 후보와 기존 패키지로 Safari native 기하·관련 회귀·전체 검사/두 앱 빌드를 수행한다. 새 합성 악보·DB를 만들지 않는다. history.md의 전체 제작 기록은 제작 담당이 취합한다.

#### native 조판 계약

OSMD2.2.1 reader는 harmonic→naturalharmonic, stopped→lefthandpizzicato로 읽지만 위치 속성은 보존하지 않는다. 앱은 native VexFlow `ah`/`vb9`와 `a+`/`v8b` 글리프를 유지한다. [공식 reader](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/blob/2.2.1/src/MusicalScore/ScoreIO/MusicSymbolModules/ArticulationReader.ts), [MusicXML harmonic](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/harmonic/), [stopped](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/stopped/)를 근거로 한다. harmonic의 일반 의미와 이 프로젝트의 승인된 하이햇 용도는 구분한다.

명시적 좌표가 있는 개체에만 native `getXShift()`·`getRenderY()`를 연결한다. geometric skyline 계산 전에 설치하므로 native 경계·충돌 계산과 최종 그리기가 같은 좌표를 사용한다. SVG를 만든 뒤 도형을 옮기지 않는다. 좌표가 없는 개체는 기존 native 경로를 그대로 사용한다.

X 원점은 정확한 해당 음표머리의 왼쪽이고 Y 원점은 오선 맨 위 선이다. tenths는 현재 오선 간격/10으로 환산한다. 각 글리프의 중심을 XML 좌표에 연결하는 것은 이 앱의 공통 앵커 정책이며, 같은 default-y는 서로 다른 기호의 중심 높이를 맞춘다. Y 양수는 위쪽이고 relative-x/y는 각 default/native 위치에 더한다. 단순 chord 왼쪽이 아닌 native `note_heads[index]`의 실제 위치를 사용한다.

OSMD가 VoiceEntry의 같은 종류 articulation을 하나로 합치는 제한은 유지한다. 이번 지원은 한 VoiceEntry에 harmonic·stopped가 각각 하나인 입력을 검증했으며, 같은 종류를 여러 chord member에 반복 지정하는 일반 지원을 의미하지 않는다. 새로운 SVG 검사 속성은 추가하지 않았다. 검사에는 native modifier type `ah`/`a+`, `getModifierSVGs()`의 `.vf-modifiers` path 경계를 사용한다.

#### 실제 결과와 보존 범위

- 최종 후보 XML SHA-256 `7947d0b62c99f614445bb685d18c86b842b13db0d203e5180e0f7f4edf3d1048`, harmonic x2.6/y50, stopped x13/y50. 6곳×네 경로=24쌍에서 X·Y 반영과 ○ 왼쪽/＋ 오른쪽을 확인했다. 실제 잉크 간격은 약2.71182~2.71194 SVG단위, 중심Y 오차는 최대0.00000763이다. 두 native path는 stroke=none인 채움 글리프이므로 실제 외곽에 추가 stroke 여유를 빼지 않았다.
- 10.9 후보의 간격은 약0.61184였고 제작자가 XML만13으로 바꾼 뒤 약2.71184로 증가했다. 앱 코드에 간격값이나 대상 마디 번호를 넣지 않았다.
- 기존 수록 붉은 노을의 위치 미지정 stopped6개/open-string14개는 그대로다. 기존 붉은 노을의 세 연주 조판과 러브홀릭 네 조판은 보완 전/후 SVG가 동일했다. 붉은 노을 인쇄 첫 비교4쪽의 차이는 새 Safari 탭에서 **이 보완을 설치하지 않은 동일 baseline을 두 번 호출해도** 재현됐다. 각 페이지의 최초 차이는 stem 끝점0.25 SVG단위다. 이후 baseline/새 코드 비교4쪽은 동일했다. 설치 bundle의 drawer는 전역 STEM_WIDTH를 rules.StemWidth×10으로 설정하며, 기본1.5와 현재1의 반폭 차이0.25와 일치한다. 새 보완의 회귀와 구분하고 기존 첫 조판 초기화 문제의 재현을 보존한다. 이번 작업에서 이를 수정하거나 모든 호출의 바이트 동일성을 주장하지 않는다.
- 캐시 정책v27로 새 조판을 구분하고 Pretendard·rehearsal·다중 마디 wedge 지원을 유지한다. 저장/타임라인 메타데이터 스키마는 바꾸지 않는다. 실제 수록·저장·재열기·청취·iPad 검수는 이번 조판 검사에 포함하지 않는다.
- 로컬 근거: `.tmp/technical-position-results.json`, `.tmp/technical-position-{verify,legacy,diff,show}.mjs`, `.tmp/technical-render.ts`, `.tmp/technical-baseline.ts`, `.tmp/technical-position-final-safari.png`, `.tmp/technical-position-focused.log`, `.tmp/technical-position-verify.log`. Git 제외 자료이며 새 checkout에 있다고 전제하지 않는다.
- 전체 검사: lint·418파일 서식·앱/도구/hosting 타입·다국어·문서/구조·126파일756검사·두 앱 빌드/경계 통과. 관련4파일25검사도 통과했다. 기존 큰 청크·Node localStorage 경고는 유지한다. 초기 비교 차이의 baseline-only 재현과 이후 동일성은 `.tmp/technical-position-legacy-results.json`, 변경 소스/검사 로그 해시는 `.tmp/technical-position-handoff.json`에 연결한다. 버전 인상·커밋·푸시·발행은 하지 않았다.

### MusicXML 입력 매핑·정본 계약에서 옮긴 근거 — 2026-10-23 이관

아래 원문은 당시 문맥·승인/검증 범위를 보존한다. 과거의 미확인·보류·HTML·시안 수치를 현재 지원이나 새 실행으로 해석하지 않는다. 현행 규칙은 입력 매핑·정본 계약·SVG Rule에서 확인한다.

##### O+ 복합 지시의 승인 범위 — 2026-10-23

- **현재 공통 제작 규칙:** 사용자는 붉은 노을6곳의 교정·검증 후 같은 음표의 `technical/harmonic`·`technical/stopped`와 XML 위치 속성에 의한 O+ 가로 배치를 악보 제작 스킬에 기록하고 다음 악보에도 적용하도록 확정했다. 원본의 한 음표에 붙은 O+를 새로 제작·교정할 때 이 규칙을 따른다. 기존 악보 전체를 일괄 수정한다는 뜻은 아니다.
- 원래 하이햇 음표의 같은 `note/notations/technical`에 `harmonic`, `stopped`를 순서대로 기록한다. 두 요소의 `default-y`를 같게 두고, `default-x`로 ○ 왼쪽·＋ 오른쪽을 지정한다. 겹치면 `stopped`의 `default-x`를 조정한다. 위치는 XML에 저장하고 제작기·재생기 공통 조판에서 반영한다. 곡별 외부 좌표표나 완성 SVG 위치 수정으로 대신하지 않는다.
- 두 요소의 `default-x`는 해당 음표 왼쪽 기준 tenths, `default-y`는 오선 맨 위 선 기준 tenths다. 같은 높이·가로 간격의 구체적 해석은 [공통 조판 계약](../reference/score/rendering.md#svg-score-rules--native-조판-계약)을 따른다. 실제 기호의 잉크 경계·크기와 주변 음표/주법을 보고 간격을 정하며, 아래 예시 좌표를 모든 곡에 고정하지 않는다.
- 원래 음가·박·성부·화음·타격 수를 보존한다. 서로 다른 음표에 따로 표기된 열기·닫기는 원래 연결을 유지하고, 단독 열기/닫기와 반열림은 각자의 확정 범례를 따른다. XML 나열 순서나 가로 간격을 닫는 재생 시점으로 해석하지 않으며, 원본에 없는 닫기 시각·지연 길이·추가 타격을 만들지 않는다.
- 저장 후 MusicXML 규격, 음표 시간표·타격 수와 대상 외 음악 데이터 보존, 공통 조판으로 재생성한 SVG의 모든 O+를 확인한다. 실제 표시에서 같은 높이·○ 왼쪽/＋ 오른쪽·잉크 경계와 주변 요소의 겹침 없음을 검증하고 새 곡의 결과를 해당 제작 기록에 남긴다. 기존6곳의 검증을 다음 곡의 검증으로 대신하지 않는다.
- 최초 적용 이력: 붉은 노을3·5·7·127·129·131마디에서 최초 open 후보 뒤에 사용자가 **open 대신 harmonic**을 지정했다. 최종 위치는 harmonic x2.6/y50, stopped x13/y50이며, 이는 해당 조판에서 검증한 예시다. 음가·박을 유지한 실제 네 조판 경로24쌍과 확대6곳의 결과는 [제작 기록](../records/songs/red-sunset.md#red-sunset-open-close-20261023--붉은-노을-o-가로-배치-교정)에 보존한다.
- OSMD 2.2.1 공식 ArticulationReader와 설치 번들은 `harmonic`을 naturalharmonic으로 읽으며 주석에 open hi-hat 사용 예를 명시한다. `stopped`도 native articulation으로 읽지만, 이 기호들의 x/y 위치 속성은 읽지 않는다. `open`은 reader 목록에 없다. MusicXML harmonic의 본래 정의와 프로젝트의 사용자 승인 하이햇 용도, OSMD의 native 기호 경로를 구별한다. 공통 위치 해석 보완·실제 출력 검증은 [이번 제작 기록](../records/songs/red-sunset.md#red-sunset-open-close-20261023--붉은-노을-o-가로-배치-교정)을 따른다. [공식 reader](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/blob/2.2.1/src/MusicalScore/ScoreIO/MusicSymbolModules/ArticulationReader.ts), [harmonic](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/harmonic/), [stopped](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/stopped/).


### Rule 재점검 원문 — SVG-SCORE-RULES.md / 2

출처: [docs/architecture/SVG-SCORE-RULES.md](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> - harmonic·stopped는 native VexFlow ah/vb9·a+/v8b glyph를 유지한다. 일반 harmonic 의미와 이 프로젝트의 승인된 하이햇 용도는 [입력 매핑](../reference/score/notation.md#score-musicxml-osmd-mapping--o-복합-지시의-승인-범위)에서 구분한다.
> - 명시 좌표가 있는 개체만 getXShift/getRenderY에 연결하고 geometric skyline 계산 전에 설치한다. 완성 SVG를 옮기지 않으며 좌표가 없으면 native 기본값을 유지한다.
> - X 원점은 정확한 chord member 머리 왼쪽, Y 원점은 오선 맨 위 선이다. 오선 간격/10으로 tenths를 환산한다. glyph 중심을 XML 좌표에 연결하며 같은 default-y는 중심 높이를 맞춘다. Y 양수는 위쪽, relative-x/y는 default/native 값에 더한다.
> - 지원 검증은 한 VoiceEntry에 harmonic·stopped가 각각 하나인 입력 범위다. 같은 종류를 여러 chord member에 반복 지정하는 일반 지원을 뜻하지 않는다.


### Rule 재점검 원문 — SCORE-MUSICXML-OSMD-MAPPING.md / 5

출처: [docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md](../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> - 원본의 한 음표에 붙은 O+를 새로 제작·교정할 때 같은 음표의 `technical/harmonic`·`technical/stopped`와 XML 위치 속성으로 가로 배치한다. 기존 악보 전체의 일괄 변경으로 확대하지 않는다.
> - 원래 하이햇 음표의 같은 `note/notations/technical`에 `harmonic`, `stopped`를 순서대로 기록한다. 두 요소의 `default-y`를 같게 두고, `default-x`로 ○ 왼쪽·＋ 오른쪽을 지정한다. 겹치면 `stopped`의 `default-x`를 조정한다. 위치는 XML에 저장하고 제작기·재생기 공통 조판에서 반영한다. 곡별 외부 좌표표나 완성 SVG 위치 수정으로 대신하지 않는다.
> - 두 요소의 `default-x`는 해당 음표 왼쪽 기준 tenths, `default-y`는 오선 맨 위 선 기준 tenths다. 같은 높이·가로 간격의 구체적 해석은 [공통 조판 계약](../reference/score/rendering.md#svg-score-rules--native-조판-계약)을 따른다. 실제 기호의 잉크 경계·크기와 주변 음표/주법을 보고 간격을 정하며, 과거 검증의 예시 좌표를 모든 곡에 고정하지 않는다.
> - 원래 음가·박·성부·화음·타격 수를 보존한다. 서로 다른 음표에 따로 표기된 열기·닫기는 원래 연결을 유지하고, 단독 열기/닫기와 반열림은 각자의 확정 범례를 따른다. XML 나열 순서나 가로 간격을 닫는 재생 시점으로 해석하지 않으며, 원본에 없는 닫기 시각·지연 길이·추가 타격을 만들지 않는다.
> - 저장 후 MusicXML 규격, 음표 시간표·타격 수와 대상 외 음악 데이터 보존, 공통 조판으로 재생성한 SVG의 모든 O+를 확인한다. 실제 표시에서 같은 높이·○ 왼쪽/＋ 오른쪽·잉크 경계와 주변 요소의 겹침 없음을 검증하고 새 곡의 결과를 해당 제작 기록에 남긴다. 기존6곳의 검증을 다음 곡의 검증으로 대신하지 않는다.
