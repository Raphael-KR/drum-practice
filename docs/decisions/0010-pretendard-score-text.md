---
status: accepted
date: 2026-10-23
---

# 모든 악보 텍스트는 Pretendard로 측정하고 표시한다

## Context and Problem Statement

2026-10-23 generic sans-serif의 환경별 폭 차이로 섹션 오른쪽 숫자·기호가 테두리 밖으로 나갔다. 사용자는 섹션·연주 지시·가사·제목을 포함한 모든 악보 텍스트의 통일을 선택했다.

## Considered Options

* generic/설치 글꼴을 유지하거나 고정폭 글꼴로 바꾼다.
* Pretendard를 로컬 제공하고 측정·native 출력·독립 SVG에 동일하게 적용한다.

## Decision Outcome

Pretendard를 채택한다. 음악 기호 전용 글리프는 유지하고 악보 텍스트에만 적용한다. 일반 앱 UI로 범위를 확대하지 않는다.

### Consequences

글꼴 로딩 전 측정을 금지하고 독립 SVG에도 자산·라이선스를 포함해야 한다. 글꼴이 바뀌면 지시문 최소 offset을 다시 계산한다. 이전 스티킹 serif 지정도 이 텍스트 규칙을 따른다.

### Confirmation

현재 기준은 [SVG 규칙](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙)을 따른다. 아래 검증·버전·수치는 당시 기록이며 이번 문서 이관에서 시험을 재실행한 결과가 아니다.

## More Information

아래는 분리 전 혼합 문서에서 옮긴 원문이다. 원문의 날짜·버전 순서와 위 Decision Outcome을 함께 읽는다. 과거의 ‘현재’, ‘미구현’, 초안 수치와 PASS는 당시 범위에만 적용한다.

#### 악보 텍스트 글꼴 — 사용자 결정 (2026-10-23)

- 섹션·연주 지시·가사·제목을 포함한 악보 텍스트는 **Pretendard**로 통일한다. 음악 기호는 악기·주법 전용 글리프를 유지한다. 일반 앱 UI 글꼴까지 변경하는 결정은 아니다.
- 공식 Pretendard 1.3.9 Regular/Bold WOFF2를 로컬 자산으로 제공하고 측정 전 로딩을 기다린다. DefaultFontFamily·VexFlowTextFontFamily·native rehearsal의 측정/출력과 HTML 가사에 같은 글꼴을 사용한다. generic sans-serif나 사용자 설치 글꼴만으로 프레임 폭을 측정하지 않는다.
- MusicXML에는 word-font/lyric-font 및 텍스트 font-family로 이름을 기록한다. XML의 글꼴명은 바이너리 내장을 뜻하지 않는다. 이 프로젝트의 독립 SVG에는 사용한 원본 WOFF2와 OFL 고지를 포함하므로 파일 단독으로도 같은 글꼴을 사용한다.
- 최종 검사에는 독립 SVG의 섹션 글자 포함, ko/en/언어 미지정 환경의 동일 폭을 추가한다. HTML 안의 프레임/지시문 겹침 검사만으로 내보낸 파일 검수를 대체하지 않는다. 글꼴 변경 시 최소 표시 offset도 다시 계산한다.
- 캐시 정책은 `v26-pretendard-1.3.9`다. v24는 위치 지원 당시, v25는 Arial 진단 후보 기록이다. 원인·선택한 자산·검증 근거는 [글꼴 수정 기록](../records/archive/rendering-experiments.md#rehearsal-font-fix-20261023--섹션-테두리의-글꼴-측정출력-일치)을 따른다.
