---
status: accepted
date: 2026-10-23
---

# 두 앱은 정본 XML과 공통 native 조판을 사용한다

## Context and Problem Statement

초기 재생 경로는 제작앱이 만든 SVG에 의존했다. 2026-10-03 브라우저 직접 조판 승인 이후 두 앱이 같은 renderer와 파생 캐시를 사용한다.

## Considered Options

* 재생앱은 동봉 SVG만 사용하고 renderer를 포함하지 않는다.
* 두 앱이 정본 MusicXML로 같은 renderMusicXML을 호출한다.

## Decision Outcome

후자를 채택한다. 원문·파트·실제 OSMD 버전·표시 정책으로 파생 캐시를 식별한다. MusicXML·사용자 연습 상태를 캐시 DB에 쓰지 않는다.

### Consequences

renderer-free 제한은 재생앱에 한해 대체되었다. 편집/제작 모듈 경계와 저장 형식은 별도 계약으로 유지한다.

### Confirmation

현재 기준은 [SVG 규칙](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙)을 따른다. 아래 검증·버전·수치는 당시 기록이며 이번 문서 이관에서 시험을 재실행한 결과가 아니다.

## More Information

아래는 분리 전 혼합 문서에서 옮긴 원문이다. 원문의 날짜·버전 순서와 위 Decision Outcome을 함께 읽는다. 과거의 ‘현재’, ‘미구현’, 초안 수치와 PASS는 당시 범위에만 적용한다.

### 10. 저장·캐시·안전

- 저장 캐시는 gzip SVG (`application/vnd.drum-practice.svg+gzip`). 표시할 때 image/svg+xml로 풀어 사용한다.
- 현재 페이지 버전: data-rest-layout=`svg-geometry-sync-v17`, 음표 메타데이터: data-note-highlight=`2`.
- 생성 규칙 변경으로 기존 파일이 달라지면 캐시 버전을 올려 이전 페이지와 마디 영역을 함께 다시 만든다.
- 현재 갱신 코드는 첫 페이지의 버전을 검사한다. 재생성 후 마디 식별자의 일치를 검증하고 페이지 수와 마디 영역을 함께 갱신한다.
- XML의 script, foreignObject, image, link, opus 및 이벤트/href 속성을 차단한다. 활성 콘텐츠를 SVG에 유입하지 않는다.
- 재생 강조 overlay는 허용된 벡터 도형과 기하 속성만 복사한다.

### 브라우저 직접 조판 (2026-10-03 최신 승인)

드럼연습실도 제작실과 같은 `renderMusicXML`을 호출한다. 완성 패키지의 MusicXML(canonicalXML 우선)을 정본으로 사용하고, 동봉된 인쇄 SVG를 최신 조판의 정본으로 삼지 않는다. 한 줄 시간 비례 규칙, 두 줄4마디, 인쇄 XML 줄/페이지 구성은 유지한다. `score-render-cache.ts`의 키는 원문·파트·실제 OSMD 버전·표시 정책이다. 표기/배치 구현 변경 시 정책 버전도 올린다. 화면 크기/BPM/보기 전환은 벡터 조판 입력을 바꾸지 않으므로 같은 결과에서 공통 화면 배치만 갱신한다. 조판이 반환한 오선 좌표를 재사용하고 새 SVG에서 픽셀 오선을 다시 탐지하지 않는다. PDF/구형 SVG만 탐지 경로를 유지한다. 원본과 연습 상태는 캐시 DB에 쓰지 않는다.

검증·성능·예외 정본: [브라우저 직접 조판 전환](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약). 기존 renderer-free 빌드 제한은 재생앱에 한해 폐기하며 편집/제작 모듈 금지는 유지한다. 독립 HTML 생성은 이번 범위가 아니다.

* [OSMD 2.2.1 업데이트 근거](../records/archive/rendering-experiments.md#osmd-upgrade-20261023--osmd-221-업데이트)

### MusicXML 입력 매핑·정본 계약에서 옮긴 근거 — 2026-10-23 이관

아래 원문은 당시 문맥·승인/검증 범위를 보존한다. 과거의 미확인·보류·HTML·시안 수치를 현재 지원이나 새 실행으로 해석하지 않는다. 현행 규칙은 입력 매핑·정본 계약·SVG Rule에서 확인한다.

#### 렌더러 결정

OpenSheetMusicDisplay를 유지한다. 악보 로드 때 렌더링하고 재생 중에는 기존 표시를 갱신하는 구조는 유지한다. 변환 작업에서 전달한 ‘SVG 렌더링 후 재사용’은 후속 표시 최적화 방향이며 이번 정본 전환에서 캔버스/PNG 렌더링을 SVG로 교체하지 않았다. Verovio의 확장 필드 왕복 소실 조사 결과를 고려해 렌더러 출력으로 XML을 재생성하지 않는다. 두 렌더러의 동일 iPad 성능 비교·채택 변경은 수행하지 않았다.

### 이관 원문 — MUSICXML-SUPPORT.md / 1

출처: [docs/architecture/MUSICXML-SUPPORT.md](../architecture/MUSICXML-SUPPORT.md). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

#### MusicXML 입력 지원 계획

- 목표: MusicXML 악보와 음원을 가져와 기존 연습 화면에서 재생한다.
- 범위: .musicxml/.xml/.mxl, 마디·박자·템포 읽기, 렌더링과 진행 위치, 저장·백업·HTML 호환.
- 완료 조건: 변환된110마디 악보와 작은 회귀 예제의 로드·좌표·박자·보존 검증. 기존 PDF 유지.
- 제외: PDF 자동 변환, 악보 음원 합성, 기존 가사 싱크 자동 재계산. 음원 시간은 첫 박 및 편집 기능으로 보정한다.
- 검증: 파싱/파일형식/저장 회귀 테스트, 실제 렌더링·가져오기, 전체 테스트·빌드.

OpenSheetMusicDisplay를 로컬 번들로 사용한다. 렌더링된 페이지는 기존 PNG 데이터 경로로 보관하고, 원 MusicXML/MXL 바이트를 원본 악보로 보존한다. 기존 RecordData.pdf/pdfName 필드는 호환성을 위한 원본 악보 슬롯이며 scoreFormat으로 형식을 구별한다. 반복 점프는 인쇄 순서로 가져오고 이를 사용자에게 안내한다. 여러 파트는 파트를 선택해 가져온다.

### 이관 원문 — MUSICXML-SUPPORT.md / 2

출처: [docs/architecture/MUSICXML-SUPPORT.md](../architecture/MUSICXML-SUPPORT.md). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 사용 방법

1. 내 악보 목록 → 악보 추가 → 악보 파일에서 `.musicxml`, `.xml`, `.mxl` 선택 → 음원 선택 → 곡 만들기.
2. 여러 악기가 있으면 파트를 선택한다. BPM·마디별 박자표를 읽고, 첫 박(초)은 음원에 맞춰 지정한다. XML에 가사가 있으면 별도 입력 가사가 없는 경우 가져온다. 자동 배치한 가사는 미확인으로 표시한다.
3. 이미 연습 중인 곡은 내 악보 목록의 곡 카드 → **+ 악보 추가** (또는 파일·안내 → **이 곡에 악보 추가**). PDF와 MusicXML을 함께 보관한다. 마디 수와 각 박자표가 일치해야 하며 가사·음원 시각, 마커, 반복 범위는 유지한다.
4. 백업은 원 악보와 렌더링 페이지를 포함한다. PDF 백업도 계속 읽는다. MusicXML 곡도 HTML 한 파일로 저장할 수 있고, HTML에서는 새 파일을 추가하지 않고, 내 악보 목록에서 함께 저장된 유형을 전환해 연습한다.

### 이관 원문 — MUSICXML-SUPPORT.md / 3

출처: [docs/architecture/MUSICXML-SUPPORT.md](../architecture/MUSICXML-SUPPORT.md). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 범위와 한계

- score-partwise / 한 파트의 단일 오선, 박 수1~16 / 분모2·4·8·16, 마디 경계 템포 변경 지원. 12MB 이하 XML/MXL, 최대2000마디.
- 여러 파트 중 선택 가능. piano처럼 한 파트가 여러 오선을 가지는 경우, score-timewise, 못갖춘마디/불완전한 음가 합계, 마디 중간 템포 변경은 오류 안내 후 중단한다.
- 반복·다카포·코다는 인쇄 순서이며 자동 연주 순서 확장을 하지 않는다. 여러 마디 쉼표는 각 마디로 표시한다.
- 악보 문서의 배치와 렌더러 특성에 따라 페이지 수·글자 배치는 원본 PDF와 달라질 수 있다. 예제110마디는4쪽으로 렌더링되었다. 변환 후보 악보의 악기 매핑 정확성은 별도 변환 작업의 검증 대상이다.
- 렌더러의 음표/쉼표 시각 좌표로 정박 기준점을 만들고 박 사이를 보간한다. 완전한 음표별 커서/악보 편집기는 이번 범위가 아니다.
- XML 템포·가사 음가는 녹음의 실제 첫 박/루바토/발음 시각을 증명하지 않는다. 기존 시간 편집 기능으로 보정한다.
- 기존 `pdf` 저장 슬롯을 원본 악보 바이트로 재사용하며 `scoreFormat`/`scorePartId`를 추가한다. 별도 DB 마이그레이션은 필요하지 않다. 실제 MXL은 ZIP 원본 바이트를 유지한다.

### 이관 원문 — MUSICXML-SUPPORT.md / 4

출처: [docs/architecture/MUSICXML-SUPPORT.md](../architecture/MUSICXML-SUPPORT.md). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 구현 근거

OpenSheetMusicDisplay 2.1.2를 지연 로드한다. [공식 데이터 모델 설명](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/wiki/Exploring-the-Demo)의 논리/그래픽 좌표 구분과 설치된 타입 선언을 대조했다. 라이선스는 `public/licenses/opensheetmusicdisplay.txt`에 포함한다. HTML에는 렌더러를 포함하지 않고 이미 렌더링한 PNG·원본·음원·실행 코드를 담는다.

### 이관 원문 — MUSICXML-SUPPORT.md / 5

출처: [docs/architecture/MUSICXML-SUPPORT.md](../architecture/MUSICXML-SUPPORT.md). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 2026-09-19 검증 결과

- 합성3마디(4/4→5/4→6/8, 템포 변경), MXL 압축 입력, 잘못된 XML/파트/박자·음가·템포 거절, 내장 가사, 기존 데이터 보존, HTML 왕복 단위 검사.
- localhost 실제 UI: 110마디 XML + MP3 가져오기, 새 곡 저장/재열기, 파일·안내에서 악보 교체, 미디어 포함 ZIP 내보내기와 다시 가져오기 성공.
- 원곡을 별도 QA 곡으로 복제 후 교체. 마디 타임라인 보존, 가사 시작 변경0. 기본 activate의 기존 격자 정규화로 일부 end가 부동소수점 마지막 자리만 바뀌는 점은 화면 싱크 변경과 구분. 순수 교체 함수와 이후 최신 렌더링 교체는 가사 객체 일치 확인.
- XML 곡에서 재생 시각 증가, 41~42마디 반복 저장/활성화, 마커 추가 경로 확인. 실소리를 직접 청취한 검증은 아님.
- iOS27.0 iPad mini(A17 Pro) 시뮬레이터 Safari에서 MusicXML 기반 단일 HTML의 한 줄/두 줄·가사 표시 확인. 최종 두 줄 증거: docs/experiments/musicxml-ipad-rows-fit.png. 이 증거는 시뮬레이터 화면이며 실제 iPad 로컬파일 앱 테스트가 아니다. Safari 주소/탭 막대가 열려 있을 때 하단 도구 전체가 보이는 전체화면 검증은 별도다.
- XML 두 줄 표시의 이미지/진행선/가사 좌표를 같은 비율로 맞춰 마지막 행 가사 잘림을 해소했다. 줄당4마디 렌더링. 템포/연습 표시는 skyline 범위를 포함해 자른다.
- OSMD 2.1.2는 MusicXML 입력 시에만 지연 로드. npm audit 취약점0. 추가 청크는1.33MB(압축약349KB)이며 Vite 크기 경고는 남는다.
- GUI 스크린샷 API(ego-browser Page.captureScreenshot)는 시간 초과해 화면 판정 근거로 쓰지 않았다. DOM/동작 검사 및 simctl 실제 Simulator 캡처를 사용했다.

### 이관 원문 — MUSICXML-SUPPORT.md / 6

출처: [docs/architecture/MUSICXML-SUPPORT.md](../architecture/MUSICXML-SUPPORT.md). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 곡별 보관 (2026-09-19)

- 곡 ID 하나에 공통 음원·가사·시간축·마커·반복·설정을 둔다. 목록의 유형 버튼은 실제 원본이 보관된 PDF/MusicXML과 비어 있지 않은 가사만 표시한다.
- 활성 악보는 기존 pdf/pages/song.regions 슬롯을 유지한다. 비활성 유형은 RecordData.otherScores에 원본·페이지·영역·마디 ID 대응을 저장한다. 전환 시 현재 영역 편집을 스냅샷으로 보관하고 대상 영역만 교체한다.
- 같은 유형 재추가는 확인 후 그 유형만 갱신한다. 다른 유형은 보존한다. 제목이 같은 별도 곡을 임의로 합치지 않는다.
- 마디 추가/삭제/박자 변경으로 이전 유형과 구성이 달라졌다면 전환을 거절한다. 새 PDF는 감지한 마디 수, XML은 마디 수와 박자표가 현재 곡과 같아야 한다. PDF 감지가 틀렸다면 그대로 연결하지 않는다.
- IndexedDB bytes-v1, 미디어 포함 ZIP(other-scores.json), 단일 HTML이 비활성 악보도 보존한다. HTML 목록에는 파일 추가·삭제 버튼을 노출하지 않는다. 미디어 미포함 ZIP은 종전과 같이 원본 파일을 별도로 보관해야 한다.
- 기존 단일 악보 데이터는 그대로 읽는다. 과거 교체로 사라진 원본은 복구했다고 표시하지 않는다.

### 이관 원문 — SVG-RENDERING.md / 1

출처: [docs/architecture/SVG-RENDERING.md](../architecture/SVG-RENDERING.md). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

#### MusicXML SVG 표시 및 압축 캐시

- 목표: MusicXML 악보를 벡터로 표시하면서 캐시 용량을 줄인다.
- 범위: OSMD 렌더링, 웹앱 열기, IndexedDB, HTML/ZIP 왕복.
- 완료 조건: SVG 이미지 표시, 압축 바이트 보존, 기존 PNG 호환, 가사 음악적 위치 및 음원 마디 시간 보존.
- 제외: PDF 벡터 변환, 가사 재정렬, 원본 MusicXML 음표 수정.
- 검증: 코덱/저장 테스트, 전체 테스트·빌드, 로컬 웹앱과 Safari 시뮬레이터 HTML 표시.

### 이관 원문 — SVG-RENDERING.md / 2

출처: [docs/architecture/SVG-RENDERING.md](../architecture/SVG-RENDERING.md). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 형식

MusicXML → OSMD SVG → gzip Blob(`application/vnd.drum-practice.svg+gzip`). 저장소와 HTML에는 압축된 바이트가 들어간다. 표시 시 한 번 압축을 풀어 `image/svg+xml` Blob URL을 만들고 기존 마디 이미지 배경에서 사용한다. 진행선과 음영은 기존처럼 별도 요소로 움직인다. 원본 XML은 정본으로 유지한다.

ZIP은 `pages/manifest.json`에 페이지 경로와 MIME을 저장한다. SVG gzip은 `.svg.gz`, 기존 PNG는 `.png`. 목록 없는 과거 ZIP은 기존 PNG 규칙으로 복원한다. HTML/IndexedDB는 기존 MIME+바이트 코덱으로 새 형식을 보존한다.

기존 MusicXML PNG 캐시는 웹앱에서 해당 악보를 열면 다시 렌더링한다. 마디 수·박자표가 달라지면 교체를 거부한다. 가사·마커·반복·음원 시간은 유지한다. 기존 정규화 마디 영역과 수동 진행 위치 보정도 유지한다. 페이지 수가 다르면 자동 갱신을 거부한다. PDF와 이미 만들어진 과거 HTML은 PNG로 계속 열 수 있다. 과거 HTML 자체를 자동으로 업데이트하지는 않는다.

캐시를 갱신한 웹앱에서 HTML을 새로 저장하면 압축 SVG가 포함된다. HTML은 SVG를 디코딩해서 표시하며 OSMD 전체를 다시 실행하지 않는다. CompressionStream/DecompressionStream을 제공하는 브라우저가 필요하다.

### 이관 원문 — BROWSER-MUSICXML-RENDERING.md / 1

출처: [docs/architecture/BROWSER-MUSICXML-RENDERING.md](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

#### 브라우저 MusicXML 직접 조판 전환

2026-10-03 사용자 승인. 상태: 로컬 구현 및 아래 범위 검증 완료. 실물 iPad 장시간 재생은 미검증.

현행 엔진(2026-10-23): OSMD **2.2.1**. 전체 검사와 실제 Safari의 섹션 XML 위치·0.0625박 지시문 offset·다중 마디 크레센도·캐시 재사용을 재확인했다. 설치 후 개발 서버의 구 사전 번들 문제와 해결, 정확한 검증 범위는 [OSMD 업데이트 기록](../records/archive/rendering-experiments.md#osmd-upgrade-20261023--osmd-221-업데이트)을 따른다. 아래 2026-10-03 수치는 당시 환경의 실측이며 새 버전의 성능 측정값으로 대체하지 않는다.

- 목표: 드럼연습실이 MusicXML 정본을 공통 엔진으로 직접 조판하고 재사용 가능한 로컬 캐시를 사용한다.
- 범위: 공통 렌더러, 재생앱 로딩, 제작앱 렌더 호출, 캐시·앱 경계 검사와 회귀 검증.
- 완료 조건: Loveholic 비교 후 전체 제공 악보의 음가/표기 정확성, 상태 보존, 캐시 무효화와 iPad mini Safari 실행 확인.
- 제외: 원본 변경, 제작 기능의 재생앱 유입, 독립 HTML 생성·저장, Sites 배포.
- 검증: 캐시·상태 단위 테스트, 전곡 렌더 대조, 첫 표시/캐시 재사용/메모리·재생 실측, 앱 빌드.

### 이관 원문 — BROWSER-MUSICXML-RENDERING.md / 2

출처: [docs/architecture/BROWSER-MUSICXML-RENDERING.md](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 승인된 표시 계약

1. 한 줄은 동일 음가 동일 거리, BPM은 이동 속도만 변경.
2. 두 줄은 한 줄4마디. 인쇄 SVG는 XML 페이지·시스템 구성을 보존.
3. PDF와 원본 XML/PDF를 보존. 표시 자산은 원본에 덮어쓰지 않는다.
4. 현재 마디·박/재생 시각/반복/마커는 조판과 독립. 렌더 결과에서 연습 상태를 복원하거나 초기화하지 않는다.
5. 매 프레임 재조판 금지. 벡터 좌표는 화면 크기와 독립적으로 조판하고, 화면 크기·보기 변경은 공통 화면 배치만 갱신한다. 조판에 영향을 주는 조건은 캐시 키에 포함한다.
6. 제작앱과 재생앱의 렌더러·표기 보완은 같은 구현. 재생앱의 기존 renderer-free 제한은 승인된 변경으로 대체하되 편집/제작/원본 저장 모듈 금지는 유지한다.

### 이관 원문 — BROWSER-MUSICXML-RENDERING.md / 3

출처: [docs/architecture/BROWSER-MUSICXML-RENDERING.md](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 캐시와 입력 권위

완성 패키지 canonicalXML이 있으면 이를 사용하고, 없으면 MusicXML variant source 사용. SHA-256(원문+선택파트+렌더러 버전+표기/배치 정책)이 키다. BPM·재생시각·루프·viewport는 벡터 조판 입력이 아니므로 키에서 제외한다. 조판 변경 시 버전 변경 필수. 캐시는 별도 IndexedDB에 제한된 개수로 저장하며 저장 실패는 정상 렌더 결과 표시를 막지 않는다. 손상 캐시는 재생성한다. 동시 동일 요청은 합친다. 원본 파일·라이브러리 저장 데이터는 변경하지 않는다.

### 이관 원문 — BROWSER-MUSICXML-RENDERING.md / 4

출처: [docs/architecture/BROWSER-MUSICXML-RENDERING.md](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 검증 기준

- 정확성: 마디 수·박자 일치, 원본/가사/음원/연습 상태 불변. Loveholic2/10 동일 너비와120–123오선 크기 유지. 변박·꾸밈음·쉼표·빔·주법 검수.
- 캐시: 최초 miss, 재열기 hit, 원문/파트/정책 변경 miss, BPM 변경 hit. 실패한 렌더는 저장하지 않는다.
- 성능: 동일 환경 기존 캐시 준비와 직접 조판/재사용을 각각 측정. cold 조판 시간은 별도 보고, warm에는 OSMD 조판0회. 123마디 화면 표시 목표 cold10초 이내, warm2초 이내(음원 decode 별도). 초과하면 원인 개선 후 재측정.
- 메모리: 가능하면 실제 프로세스 측정. Safari에서 JS heap API 미제공 시 미측정을 수치로 꾸미지 않는다. DOM/자산 수·반복 열기·닫기 후 자원 해제로 누수도 확인.
- iPad: iPad mini Safari 응답형/시뮬레이터를 구분. 재생·보기전환·회전·루프 보존. 시뮬레이터는 실제 기기 성능을 대신하지 않는다.

### 이관 원문 — BROWSER-MUSICXML-RENDERING.md / 5

출처: [docs/architecture/BROWSER-MUSICXML-RENDERING.md](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 보정 재검토 목록

- 시간 비례 재조판: 유지, OSMD 기본 음표밀도 배치만으로 대체 불가.
- filled=no, ghost, sticking, half-open, 온쉼표: 엔진 지원 공백을 메우는 공통 구현 유지.
- PDF crop/anchor: PDF 경로만 유지.
- 곡별 SVG crop: 새 렌더 좌표에서 공통 해결 여부를 검증한 후 제거 여부 결정. 기존 패키지 호환 경로와 구분.
- 원본 XML 쉼표/메타데이터 교정: 제작 책임, 재생앱에서 실행하지 않는다.

### 이관 원문 — BROWSER-MUSICXML-RENDERING.md / 6

출처: [docs/architecture/BROWSER-MUSICXML-RENDERING.md](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 결과/실패 기록

### 이관 원문 — BROWSER-MUSICXML-RENDERING.md / 7

출처: [docs/architecture/BROWSER-MUSICXML-RENDERING.md](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 구현과 적용 범위

- `src/modules/score/musicxml.ts`가 제작앱/재생앱의 단일 조판 진입점이다. `src/modules/score/browser-score.ts`는 원문을 해석해 표시 좌표만 연결하며 연습 상태는 유지한다.
- `src/modules/score/score-render-cache.ts`: 별도 IndexedDB, 최근 생성 4개, SVG 바이트 SHA-256 검증, 동시 요청 병합, 실패/저장 용량 부족 시 원문 렌더 유지. OSMD 실제 패키지 버전과 정책 버전이 키에 포함된다.
- 화면 크기/BPM/보기는 조판 입력이 아니라 공통 배치/이동 입력이다. 이 변경에는 같은 벡터 캐시를 재사용한다. 새 조판 옵션을 추가하면 반드시 키에 포함한다.
- Loveholic 비교 후 현재 제공되는 두 곡(Loveholic123마디, Real Paradis110마디) 및 MusicXML 가져오기 공통 경로에 적용했다. PDF 전용 악보는 기존 경로를 유지한다.
- 네이티브 오선 좌표를 캐시에 담아 SVG를 다시 래스터화해 오선을 찾는 비용을 제거했다. 이전 패키지는 감지 경로를 유지한다.

### 이관 원문 — BROWSER-MUSICXML-RENDERING.md / 8

출처: [docs/architecture/BROWSER-MUSICXML-RENDERING.md](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 실제 측정

환경: 로컬 개발 서버, iPad mini (A17 Pro) iOS27 시뮬레이터 Safari27. CPU/메모리 성능은 실물 iPad 수치가 아니다. 아래는 단일 실행 관측값이며 통계적 벤치마크가 아니다.

| 악보 | 기존 표시 자산 준비 | 최초 원문 조판·캐시 | 새 표시 자산 준비 | 캐시 재열기 |
| --- | ---: | ---: | ---: | ---: |
| Loveholic | 612ms | 886ms | 374ms | 29ms |
| Real Paradis | 516ms | 837ms | 442ms | 56ms |

`device-cold.json` 기준. 캐시 재열기 시간에는 원문 해석/검증을 포함하며 OSMD 조판은 0회. 최초 조판은 기존 저장 SVG보다 비용이 추가되지만 기준 내이며 재사용 때는 그 비용이 없다. 공통 런타임 mount는 약964ms(음원 준비 등 포함). 네트워크 다운로드 시간은 별도다.

- 메모리: 새 Simulator WebContent 프로세스 PID54022 한 개를 추적. Loveholic 기존 표시 준비 후117056KiB(114.31MiB), 직접 조판·자산 준비 후120352KiB(117.53MiB). 차이 약3.22MiB. 순차 실행 RSS 스냅샷이며 peak/JS heap/강제GC 비교가 아니다. Safari JS heap API는 제공되지 않았다.
- 자산 생명주기: mount11개 → dispose0개 → remount11개의 object URL. 무한 증가 없음.
- 정확성: 233마디 전체 자동 대조, 두 곡 각각1594/1754개 음표머리 개수·크기 분포 일치. 동일 음가 좌표 오차 최대 약1.1e-12. Loveholic2/10/120–123마디 동일 폭, 끝마디 오선 크기 동일. 꾸밈음은 음가0의 별도 위치로 유지한다.
- Safari 실제 재생: 약5초간 마디·박 진행, 조판 호출 증가 없음. 10마디4박+¾와9–11마디 반복을 PDF/SVG 전환 후 보존.
- iPad mini Safari: 80마디1박/79–81마디 반복, 두 줄 보기31행의4칸 배치, PDF/SVG 전환 후 유지. 세로744×1001 → 가로1133×612 회전 후 동일 상태, 가로 overflow0, 추가 조판0회. 이 검증의 제어는 브라우저 내부 QA 호출이며 실물 손가락 제스처/오디오 연속 재생 검증과 구분한다.
- `npm run test:drum -- --maxWorkers=4`:75파일356테스트 통과.
- `npm run build:apps`: 제작/재생 빌드 및 경계 검사 통과.
- `npm run check:playback`:2호스트/1재생소유자,24동작/31목록,189공통 호출부 검사 통과.

### 이관 원문 — BROWSER-MUSICXML-RENDERING.md / 9

출처: [docs/architecture/BROWSER-MUSICXML-RENDERING.md](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 실패와 해결

1. 캐시 보관 테스트에서 같은 ms에 생성한 항목의 순서가 뒤섞였다. 직전 최대 시각보다1 증가하는 순번을 보장해 최신4개 보관을 결정적으로 변경했다.
2. 자산 테스트의 jsdom Blob에 arrayBuffer가 없어 실패했다. 실제 브라우저 Blob 계약에 맞게 Node Blob 테스트 대역을 사용했고, 실패 시 URL 해제 검증은 유지했다.
3. Safari 비활성 창에서 RAF가 멈춘 기록은 재생 증거로 사용하지 않았다. Safari를 활성화한 뒤 재측정했다.
4. Xcode MCP 세션 만료/워크스페이스 해석 시간 초과 및 제공되지 않은 기기 스킬 경로 때문에 직접 기기 제어를 완료하지 못했다. 원래 연결 복구로 표현하지 않고 승인된 simctl/devicectl과 시뮬레이터 Safari의 로컬 QA 모듈 경로를 사용했다.
5. 개발 서버 자동 갱신으로 회전 기록이 덮어써졌다. 코드 변경을 멈추고 세로→가로 실제 크기 변화와 상태를 다시 확인하여 `device-state-final.json`으로 보존했다.

### 이관 원문 — BROWSER-MUSICXML-RENDERING.md / 10

출처: [docs/architecture/BROWSER-MUSICXML-RENDERING.md](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 기존 보정 판단

- 삭제: `ensureCenteredRestCache`의 SVG 버전 표식 기반 갱신. 새 원문/정책/렌더러 해시 캐시가 전체 호출부를 대체한다. 관련 테스트도 새 공통 진입점으로 변경했다.
- 유지: 음가 비례 조판, 악기·주법 보완, 온쉼표, 음표 강조, PDF crop/anchor. 직접 OSMD 호출만으로 해결되지 않는 의미/표시 규칙이다.
- 유지: 기존 인쇄 SVG/패키지의 곡별 crop 호환 보정. 새 한 줄 네이티브 조판은 별도 정확한 좌표를 사용하지만, 기존 인쇄/호환 경로까지 제거할 근거는 없다.
- 유지: 제작앱 원문 교정 책임. 재생앱으로 옮기지 않았다.

### 이관 원문 — BROWSER-MUSICXML-RENDERING.md / 11

출처: [docs/architecture/BROWSER-MUSICXML-RENDERING.md](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 근거와 한계

로컬 근거: `docs/experiments/browser-musicxml-20261003/`의 `audit.json`, `playback.json`, `device-cold.json`, `memory-baseline.jsonl`, `device-state-final.json`, 화면 캡처. 미디어/실험 출력은 Git 제외 정책을 따른다. 실행 로그는 `.tmp/direct-tests.log`, `.tmp/direct-build.log`.

OSMD 청크는 gzip 약349kB 추가이며 지연 로드한다. 물리 iPad의 첫 다운로드, 장시간 음원 재생/열화, 실제 터치 검증은 이번 결과가 대신하지 않는다. 원본 인쇄 PDF와 모든 주법의 사람 전수 대조도 자동 좌표 검증과 구분한다. 독립 HTML 재생 파일 생성·저장, Sites 배포, 원격 push는 수행하지 않았다. 당시 유지했던 독립 HTML 템플릿 생성은 2026-10-13에 폐기했다.


### Rule 재점검 원문 — MUSICXML-INPUT.md / 1

출처: [docs/architecture/MUSICXML-INPUT.md](../reference/score/musicxml.md#musicxml-input--musicxml-입력-계약). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> 문서 역할: **현행 Rule**. 정본 저장은 [canonical 계약](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약), 표기는 [승인 매핑](../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙), 출력은 [SVG 규칙](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙)을 따른다. 초기 PNG·HTML 지원 설계는 [ADR-0004](0004-browser-native-score-rendering.md)에서 확인한다.


### Rule 재점검 원문 — MUSICXML-INPUT.md / 2

출처: [docs/architecture/MUSICXML-INPUT.md](../reference/score/musicxml.md#musicxml-input--musicxml-입력-계약). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> - score-partwise / 한 파트의 단일 오선, 박 수1~16 / 분모2·4·8·16, 마디 경계 템포 변경 지원. 12MB 이하 XML/MXL, 최대2000마디.
> - 여러 파트 중 선택 가능. piano처럼 한 파트가 여러 오선을 가지는 경우, score-timewise, 못갖춘마디/불완전한 음가 합계, 마디 중간 템포 변경은 오류 안내 후 중단한다.
> - 반복·다카포·코다는 인쇄 순서이며 자동 연주 순서 확장을 하지 않는다. 여러 마디 쉼표는 각 마디로 표시한다.
> - 악보 문서의 배치와 렌더러 특성에 따라 페이지 수·글자 배치는 원본 PDF와 달라질 수 있다. 변환 후보 악보의 악기 매핑 정확성은 별도 변환 작업의 검증 대상이다.
> - 렌더러의 음표/쉼표 시각 좌표로 정박 기준점을 만들고 박 사이를 보간한다. 완전한 음표별 커서/악보 편집기는 이번 범위가 아니다.
> - XML 템포·가사 음가는 녹음의 실제 첫 박/루바토/발음 시각을 증명하지 않는다. 기존 시간 편집 기능으로 보정한다.
> - 기존 `pdf` 저장 슬롯을 원본 악보 바이트로 재사용하며 `scoreFormat`/`scorePartId`를 추가한다. 별도 DB 마이그레이션은 필요하지 않다. 실제 MXL은 ZIP 원본 바이트를 유지한다.
