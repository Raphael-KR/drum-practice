---
status: accepted
date: 2026-10-23
---

# 로컬 제작기와 공개 연습실의 운영 범위를 구분한다

## Context and Problem Statement

제작 도구·개인 원본과 공개 재생 배포의 책임 및 저장 기능을 구분해야 했다. 원래 결정 시기는 2026-10-13 이후이며, YAML 날짜는 이번 문서 정리일이다.

## Considered Options

* 제작 기능과 독립 HTML 저장까지 공개 재생 앱에 포함한다.
* 제작기는 로컬 전용으로 두고 player와 지정 자산만 공개한다.

## Decision Outcome

후자를 채택한다. 독립 HTML 저장·내보내기는 폐기하고 웹앱 진입점·제작기 백업·.drumscore는 유지한다. 재생 앱의 자동 보관 이력·복원·업데이트는 제거하되 명시적 음원 JSON 백업은 ADR-0022의 별도 계약이다.

### Consequences

공개 분석 서버 폐기는 ADR-0026, 정본 조판은 ADR-0004를 따른다. 운영 사본은 개발 정본을 독립 수정하지 않는다. 새 기능·삭제·전송·배포 승인을 추가하지 않는다.

### Confirmation

현행 계약과 실행 절차는 [PRD](../../PRD.md), [배포 Rule](../reference/engineering/release.md#deployment-rules--배포-범위와-소스-권위), [발행 절차](../how-to/release.md#sites-publication--sites-발행-절차)에서 확인한다. 아래 당시 검증 수치·실패·미확인은 해당 환경의 기록이며 이번 작업에서 앱·악보 검증을 다시 수행한 결과가 아니다.

## More Information

대안은 원문에서 확인되는 채택·대체 경로를 정리한 것이다. 별도 회의나 새로운 합의를 추정하지 않는다. 이관 원문에 포함된 대체 전 값은 현행 규칙이 아니다.

### 이관 원문 — PRD.md / 1

출처: [PRD.md](../../PRD.md). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

#### 드럼연습실 제품 기준

기준일: 2026-10-14 / 공통 앱 버전 0.7.7. 이 문서는 현재 승인된 제품 범위를 정리한다. 세부 UX·악보 표기·저장 계약은 아래 정본을 따른다.

- 목표: 악보 또는 음원만으로 박자를 따라가며 원하는 마디를 반복 연습한다.
- 범위: 로컬 악보제작기, 공개 드럼연습실, 공통 재생 코드와 자동 분석정보 캐시.
- 완료 조건: 가져오기·탐색·재생·BPM 변환·메트로놈·구간 저장이 일관되게 동작하고 검증 환경과 한계를 기록한다.
- 제외 범위: 제작기 공개, 개인 음원 업로드, 기기 간 개인 설정 동기화, 연주 채점, 공유 메뉴에서 음원 받기.
- 검증: 집중 회귀, 드럼 전체 테스트, 분리 빌드·앱 경계, 필요한 Safari UI/오디오 예약 검사와 발행 후 HTTP/API 확인.

### 이관 원문 — PRD.md / 2

출처: [PRD.md](../../PRD.md). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 앱과 입력

| 앱 | 운영 범위 | 입력과 역할 |
| --- | --- | --- |
| 악보제작기 | 로컬 `editor.html` | PDF·MusicXML·음원·가사 제작/교정, 완성 `.drumscore` 저장 |
| 드럼연습실 | 로컬 및 공개 `player.html` | 서버의 `.drumscore` 다운로드, 기기의 MP3 가져오기, 연습 |

독립 HTML 파일 저장·내보내기는 지원하지 않는다(사용자 결정, 2026-10-13). 웹앱 진입 HTML과 `.drumscore` 패키지, 제작기의 ZIP 백업은 유지한다.

기존 악보·음원 묶음은 유지한다. MP3는 서버에 업로드하지 않는다. 태그·명확한 파일명으로 곡명/가수를 채우고 박자 분석 후 연습할 수 있게 한다. 불확실한 곡 정보나 연주 시작점을 정답으로 단정하지 않는다.

### 이관 원문 — PRD.md / 3

출처: [PRD.md](../../PRD.md). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 악보 선택

- 앱 이름은 **드럼연습실**, 화면과 돌아가기 툴팁은 **악보 선택**이다.
- 즐겨찾기는 섹션 제목 없이 최상단에 모은다. 다음으로 **기본 연습곡**, **내 악보 목록**을 둔다.
- 목록은 페이지 넘김 없이 스크롤한다. 제목/가수 표시 순서는 목록과 재생 화면에 함께 적용한다.
- 목록 설정에는 제목 표시 순서와 내 음원 목록의 사용자 설정 백업·복원를 둔다. 가져오기 실패는 원인을 포함한 빨간 안내로 표시하고 성공 저장 안내는 생략한다.
- 기본 연습곡의 가수란은 드럼킷 이름으로 표시한다. 일반 곡은 실제 가수명을 유지한다.

### 이관 원문 — PRD.md / 4

출처: [PRD.md](../../PRD.md). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 연습과 탐색

- 한 줄 이어 보기와 두 줄 고정 보기, 악보 배율·균등 간격·음표 빛나기, 지원되는 악보 형식 전환을 제공한다.
- 원곡은 1배속, 연습 BPM은 지정 템포로 재생한다. BPM 변환 상태는 숫자 표시와 프리셋 사이에 표시한다.
- 박 시각이 있는 음원은 원곡에서 변화하는 BPM을 소수점 한 자리로 표시한다. 연습 BPM에서는 고정 메트로놈에 맞게 음원의 박 간격을 변환한다.
- 마디 선택과 재생 위치를 분리한다. 방향키로 선택할 때 재생선은 정지 위치에 남고 선택 테두리만 이동한다. 재생은 선택한 마디에서 시작한다.
- 마커는 5개, 구간은 9개다. 구간은 시작 마디 순서로 정렬하고 가득 차면 가장 오래 등록한 구간을 교체한다.
- 구간은 Enter 두 번, 더블클릭 두 번, 또는 빈 슬롯을 누른 뒤 시작·끝 마디를 클릭/터치해 등록한다. 드래그는 구간 등록에 사용하지 않는다.
- 새 곡의 기본값은 음악 50%, 메트로놈 100%, 메트로놈 켜짐이다. 저장된 사용자 설정은 유지한다.
- 연주 전 구간과 1마디 기준, 카운트오프는 [음원 연습](../reference/product/audio-practice.md#audio-practice--음원-연습)과 [설정 정책](../reference/product/playback.md#settings-playback--설정과-재생-정책)을 따른다.

### 이관 원문 — PRD.md / 5

출처: [PRD.md](../../PRD.md). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 기기와 저장

iPhone은 세로 레이아웃을 기준으로 하고 iPad mini와 데스크톱 레이아웃을 유지한다. 재생 중 화면 유지 기능은 지원 브라우저에서 사용한다. OS 알림 차단이나 브라우저의 회전 잠금을 보장하지 않는다.

개인 악보·음원·마커·구간·설정은 브라우저에 보관한다. 파일 해시·곡명·가수·자동 분석 결과도 해당 브라우저 안에서만 저장·재사용한다. 드럼연습실의 자동 백업·이전 버전 복원·악보 업데이트 기능은 제거했다. 사용자 결정(2026-10-15)에 따라 음원 연습 정보의 명시적 JSON 저장·불러오기는 제공한다. 여러 곡의 정보만 하나로 저장하고 음원은 제외하며, 원본 파일의 SHA-256으로 연결한다. 제작기의 백업/작업 이력과 구분한다.

### 이관 원문 — PRD.md / 6

출처: [PRD.md](../../PRD.md). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 정본과 수용 상태

- UI·도움말: [UX 원칙](../reference/product/ux.md#ux-principles--팀-ux-원칙과-맥락형-도움말), [공통 화면 목록](../plans/PLAYBACK-SCREEN-INVENTORY.md)
- 악보 입력: [MusicXML 정본](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약), [표기 매핑](../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙)
- 화면 출력: [SVG 규칙](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙)
- 전달 파일: [악보 패키지](../reference/score/file-formats.md#score-package--완성-악보-파일-계약--drumscore-v1)
- 검증과 발행: [검증 현황](../records/acceptance.md#acceptance--검증-현황), [Sites 발행](../how-to/release.md#sites-publication--sites-발행-절차)

0.7.x는 음원 연습 기능 안정화 단계다. 구현·자동 검사·Safari 검증·실기기 청취·공개 배포는 별도 상태로 기록한다. 과거의 미검증 항목을 일괄 완료하거나 1.0 수용 완료로 간주하지 않는다.

### 이관 원문 — PRD.md / 7

출처: [PRD.md](../../PRD.md). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 음원 분석의 기기 내부 처리 (2026-10-14 최신 결정)

기기 음원의 곡명·가수·박자 분석과 해시 기반 재사용은 기기에서만 처리한다. 서버 분석 저장·조회·익명 등록·검토/승인 기능과 자료는 폐기한다. `.drumscore` 서버 다운로드는 유지한다. 구현·집중/전체 검사·앱/배포 빌드가 이번 완료 조건이며 공개 반영은 다음 명시적 발행 요청 때 수행한다. 상세 저장 계약은 `docs/product/AUDIO-PRACTICE.md`를 따른다.

### 이관 원문 — PRD.md / 8

출처: [PRD.md](../../PRD.md). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 음원 연습 정보 파일 (2026-10-15)

설정에서 내 음원 목록 전체의 분석·수동 보정·마커·구간·곡별 설정을 JSON 파일로 저장하고 원본 음원을 연결하여 복원한다. 서버 전송과 재분석 없이 새 항목으로 일괄 추가한다. 상세 계약과 검증은 [연습 파일](../reference/score/file-formats.md#practice-file--음원-연습-파일)을 따른다.

### 이관 원문 — OPEN-SOURCE-NOTICES.md / 1

출처: [docs/operations/OPEN-SOURCE-NOTICES.md](../reference/engineering/third-party-notices.md#open-source-notices--오픈소스-고지-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

#### 오픈소스 고지

### 이관 원문 — OPEN-SOURCE-NOTICES.md / 2

출처: [docs/operations/OPEN-SOURCE-NOTICES.md](../reference/engineering/third-party-notices.md#open-source-notices--오픈소스-고지-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 배포물의 표시

설정 > 정보 > 오픈소스 라이선스에서 설치 버전, 라이선스, 저작권/면책을 포함한 전문, 프로젝트 소스 링크를 확인한다. 내용은 앱 번들에 포함한다. SoundTouchJS 패키지의 비압축 dist/soundtouch.js도 저장할 수 있다.

직접 의존성:
- OpenSheetMusicDisplay 2.1.2: BSD-3-Clause
- PDF.js (pdfjs-dist) 6.3.289: Apache-2.0
- JSZip 3.10.2: MIT 선택 (원본은 MIT/GPL 선택 라이선스)
- SoundTouchJS 0.3.0: LGPL-2.1

### 이관 원문 — OPEN-SOURCE-NOTICES.md / 3

출처: [docs/operations/OPEN-SOURCE-NOTICES.md](../reference/engineering/third-party-notices.md#open-source-notices--오픈소스-고지-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 생성 및 검증

scripts/build/third-party.mjs가 설치된 런타임 의존성을 따라 패키지 LICENSE/COPYING/NOTICE 전문을 수집한다. 별도 파일이 없는 경우 README의 라이선스 절을 보존한다. OSMD의 VexFlow 등 하위 의존성과 PDF.js 동봉 폰트/CMap/디코더 고지도 포함한다. 추가 고지는 사용 여부보다 넓게 보존할 수 있다. 개발 도구만의 의존성은 대상이 아니다.

pretest, 개발 서버 시작 및 앱 빌드에서 생성한다. 라이선스 원문을 찾지 못하면 빌드가 실패한다. 생성 JSON은 Git에서 제외하며 앱 코드에 HTML로 삽입하지 않고 textContent로 표시한다. 번들의 법적 주석도 보존한다.

### 이관 원문 — OPEN-SOURCE-NOTICES.md / 4

출처: [docs/operations/OPEN-SOURCE-NOTICES.md](../reference/engineering/third-party-notices.md#open-source-notices--오픈소스-고지-계약). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 범위와 외부 배포 확인 항목

이 변경은 고지와 포함된 라이브러리 코드 접근성을 보강한 것이다. 전체 배포 조건의 법률 검토 완료를 뜻하지 않는다. 특히 SoundTouchJS를 앱/worker에 번들링하므로 LGPL 2.1의 라이브러리 수정 후 재결합 조건까지 충족하려면 배포 방식에 따른 대응 소스·빌드 자료 제공 또는 교체 가능한 로딩 구조를 별도로 검증해야 한다. 단순 프로젝트 링크나 비압축 라이브러리 하나만으로 이 조건이 모두 충족된다고 주장하지 않는다.

OSMD의 npm 번들이 참조하는 opensheetmusicdisplay.min.js.LICENSE.txt가 설치 패키지에는 없다. 이번에는 패키지 및 설치된 런타임 의존성의 고지를 수집했으며, 외부 배포 전 번들 내부 자산과 고지의 완전성도 대조해야 한다.

참고: https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html (특히 6절), https://www.gnu.org/licenses/javascript-labels.html

### 이관 원문 — UX-PRINCIPLES.md / 43

출처: [docs/product/UX-PRINCIPLES.md](../reference/product/ux.md#ux-principles--팀-ux-원칙과-맥락형-도움말). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 2026-10-13 드럼연습실 백업·복원·업데이트 제거 (이전 해당 규칙 대체)

현재 재생 앱에는 백업/복원/업데이트 버튼이 없다. 같은 ID의 파일 재가져오기는 새 파일로 바로 교체하고, 삭제는 영구 삭제한다. 기본 연습곡 열기는 제공 중인 최신 파일을 읽으며 변함없는 판의 현재 설정은 유지한다. 현재·구형 재생 보관함의 archives 저장소를 DB v3 업그레이드에서 삭제한다. 악보제작기 전체 백업·작업 이력은 사용자 결정으로 유지한다. 아래/위의 과거 보관·복원 검증 기록은 현행 기능 지시가 아니다.

### 이관 원문 — SITES-PUBLICATION.md / 1

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

#### Sites 발행

공개 대상은 **드럼연습실(player)**이다. 악보제작기는 로컬 전용이다. 최근 변경과 배포 결과는 [개발 기록](../../history.md)에 있다.

### 이관 원문 — SITES-PUBLICATION.md / 2

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 정본과 배포 구조

- 개발 정본: `/Users/raphael/Playground/drum-practice`
- 배포 사본: `deployment/sites/` — 제품 소스를 독립 수정하지 않는다.
- 기존 Sites 프로젝트: `appgprj_6ab0790baa048191aaee49f58c1ffe7b`
- 공개 주소: [드럼연습실](https://drum-practice-studio.dgkma.chatgpt.site)
- 정적 앱 입력: `dist/player/`. `dist/editor/`나 원본 미디어 폴더 전체를 발행하지 않는다.
- 서버: `server/player-worker.ts`가 HTML/보안 헤더와 정적 자산을 전달한다. `hosting/`의 D1 바인딩은 과거 분석 테이블 삭제 마이그레이션 적용을 위해서만 유지한다.
- 파일 해시·곡명·가수·분석 결과는 브라우저 내부에서만 처리한다. 자세한 필드·제한은 [음원 연습](../reference/product/audio-practice.md#audio-practice--음원-연습)을 따른다.

### 이관 원문 — SITES-PUBLICATION.md / 3

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 발행 순서

사용자가 요청한 경우에만 commit, push, 공개 발행을 수행한다. 변경 범위와 기존 dirty 파일을 확인하고 이번 릴리스에 필요한 검사를 먼저 끝낸다.

전체 릴리스의 변경 검토·작업 브랜치·PR 검토·CI·main 병합·공개 확인·브랜치 정리는 [프로젝트 릴리스 스킬](../../.agents/skills/release-drum-practice/SKILL.md)을 따른다. 아래는 검증된 main 코드에 적용하는 빌드·Sites 발행 세부 절차다. 과거의 main 직접 push 기록은 앞으로의 PR 절차를 대체하지 않는다.

1. `src/app-versions.json`과 [버전 정책](../reference/engineering/release.md#app-versions--앱-공통-버전)을 확인한다. 문서만 변경하면 버전을 올리지 않는다.
2. 드럼 회귀와 분리 빌드를 검사한다.

   ```sh
   npm run test:drum
   npm run build:apps
   npm run check:playback
   ```

3. 정본의 `scripts/release/prepare-sites.mjs`로 기존 사본을 준비한다. 이 스크립트는 이전 생성 사본을 교체하므로 프로젝트 ID·경로와 사본의 별도 수정 유무를 먼저 확인한다.

   ```sh
   node scripts/release/prepare-sites.mjs
   npm --prefix deployment/sites ci
   npm --prefix deployment/sites run build
   ```

4. 현재 Sites 스킬과 노출된 도구 계약을 읽고 기존 프로젝트에 소스를 저장·발행한다. 새 사이트를 만들거나 공개 범위를 확대하지 않는다. Git push만으로 Sites 발행이 완료되지는 않는다.
5. `source-parity.json` 기준으로 `dist/player`, 사본의 `player-assets`, Worker의 `dist/client` 정적 파일을 대조한다. `index.html`은 준비 스크립트가 `player.html`에서 만드는 진입점이다.
6. 배포가 `succeeded`인지 확인한 뒤 공개 HTML·주요 JS/CSS·분석/변환 Worker와 `.drumscore` 다운로드, 폐기된 API의 404를 확인한다. 기존 값을 바꾸는 smoke 요청은 피하고, 쓰기 검증이 필요하면 별도 시험 해시와 처리 범위를 정한다.
7. 구현 커밋, push, Sites 소스/버전/배포 ID, 빌드 식별자, HTTP/API 결과와 실기기 검증 여부를 기록한다.

로컬 분석 DB/인증키는 삭제했다. 공개 DB의 3개 분석 테이블은 0.7.9 발행에서 0002 마이그레이션으로 삭제했고 DB 재조회로 확인했다. 브라우저의 기존 보관함은 로컬 주소와 공개 주소 사이에 자동 이전되지 않는다.

### 이관 원문 — SITES-PUBLICATION.md / 25

출처: [docs/operations/SITES-PUBLICATION.md](../how-to/release.md#sites-publication--sites-발행-절차). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### HTML 보안 헤더 전달

Sites 공개 자산 우선 라우팅 때문에 run_worker_first 설정만으로 홈페이지 헤더 적용을 보장하지 못했다. 준비 스크립트는 빌드한 player HTML을 `server/player-document.ts`로 포함하고, finalize는 해시 대조 후 `dist/client/index.html`과 `player.html`을 제외한다. 두 문서와 `/`는 Worker가 반환한다. 나머지 정적 자산은 기존 바이트를 유지한다.


### Rule 재점검 원문 — AGENTS.md / 1

출처: [AGENTS.md](../../AGENTS.md). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> - 전역 `/Users/raphael/AGENTS.md`를 함께 적용한다.
> - 실제 작업 루트는 `/Users/raphael/Playground/drum-practice`이다.
> - 기본 개발·검증 대상은 `http://127.0.0.1:5173/`의 웹앱이다. `src/`를 수정하고 개발 서버에서 반영한다.
> - 로컬 개발·미리보기 서버는 5173만 사용한다. 5174 실행 설정은 폐기했으며 포트 충돌 시 다른 포트로 자동 전환하지 않는다. 기존 5173 서버가 있으면 해당 서버를 사용한다.
> - 사용자 결정(2026-10-13): 독립 HTML 저장·내보내기 기능을 폐기했다. 해당 코드·템플릿·생성물을 다시 만들지 않는다. 웹앱 진입점(index/editor/player.html)과 .drumscore 저장·재생은 유지한다.
> - PRD.md와 사용자의 최신 결정에 따라 구현하며 변경·검증은 history.md에 기록한다.
> - UI·UX 설계, 구현, 검수에는 `docs/product/UX-PRINCIPLES.md`의 팀 UX 원칙과 맥락형 도움말 지침을 적용한다. 잠정 문구와 구현 예정 사항은 확정·구현된 상태와 구분한다.
> - Git에는 소스·설정·문서·테스트를 기록한다. 원본 미디어, 로컬 예제 자료, 분석 자료, 실험 출력, 생성 HTML, node_modules, dist는 제외한다. 제외된 파일은 삭제하지 않는다.
> - 현재 GUI 검증은 같은 로컬 앱·자료 범위에서 이미 승인되어 있다. 외부 공개·배포·원격 push는 별도 요청 없이는 수행하지 않는다.
> - 웹앱의 화면 확인·버튼 조작·기능 테스트는 Safari MCP를 우선 사용한다. Safari MCP가 지원하지 않는 기능은 처음부터 ego-browser를 사용한다. Safari MCP가 지원하는 기능에서 검증이 실패하면 실패 원인을 기록하고 ego-browser 사용을 검토한다. 비교만을 위해 같은 테스트를 두 브라우저에서 반복하지 않는다.
> - iPad 화면 검증은 사용자가 지정한 Safari 응답형 디자인 모드와 iPad mini (A17 Pro) 시뮬레이터를 우선한다. 설정·기기 ID·검증 상태는 docs/operations/IPAD-SIMULATOR.md를 따른다. Chromium 화면 크기 모사를 iPad Safari 검증으로 간주하지 않는다.


### Rule 재점검 원문 — PLAYBACK-SCREEN-INVENTORY.md / 1

출처: [docs/plans/PLAYBACK-SCREEN-INVENTORY.md](../plans/PLAYBACK-SCREEN-INVENTORY.md). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> - 목표: 악보제작기와 드럼연습실이 하나의 재생 화면·조작 구현을 사용한다.
> - 범위: main.ts와 player-app.ts → playback-runtime.ts, 공통 재생 UI 및 자산 처리.
> - 완료 조건: 두 호스트가 createPlaybackScreen을 각각 한 번 호출하고 아래 기능 소유권을 유지한다.
> - 제외: 독립 HTML 내보내기는 2026-10-13에 폐기했다. 제작 데이터와 .drumscore 저장은 유지한다.
> - 검증: playback-screen·공통 UI·저장 왕복 테스트, 타입 검사, 앱 빌드와 경계 검사. 실행 결과는 history.md에 기록한다.


### Rule 재점검 원문 — UX-PRINCIPLES.md / 16

출처: [docs/product/UX-PRINCIPLES.md](../reference/product/ux.md#ux-principles--팀-ux-원칙과-맥락형-도움말). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> - 마커 5개·구간 9개와 M 단축키는 [마커 슬롯](../reference/product/playback.md#marker-slots--마디-마커-슬롯), 이동·카운트오프·구간 시작/삭제는 [재생 이동 Rule](../reference/product/playback.md#playback-actions--재생-이동과-반복-구간-동작)을 따른다.
> - 방향키 선택·재생선·진행 음영·정지 두 줄 스크롤·구간 등록은 [SVG 정본](../reference/score/rendering.md#svg-score-rules--9-음표-따라가기탐색화면-효과)을 따른다. Enter 등록은 정지하고 시작·끝 포함/역방향·같은 마디·FIFO·시작 마디 정렬을 공유하며 숨긴 10~12번 데이터는 삭제하지 않는다.
> - 원곡 1배속·악보/기준 BPM·실제 박 시각·분석 자동 적용·박자 맞추기·프리셋 올림은 [음원 Rule](../reference/product/audio-practice.md#audio-practice--음원-연습)과 [설정](../reference/product/playback.md#settings-playback--설정과-재생-정책)을 따른다. 구형 추종 켜기/끄기·수동 재분석 안내를 새 UI에 추가하지 않는다.
> - 연습실의 과거 자동 보관 이력·복원·업데이트는 [제품 범위](../../PRD.md)에 따라 제거됐다. 음원을 제외한 명시적 JSON 백업과 제작기 백업은 각각의 저장 계약을 따른다.


### Rule 재점검 원문 — DEPLOYMENT-RULES.md / 1

출처: [docs/operations/DEPLOYMENT-RULES.md](../reference/engineering/release.md#deployment-rules--배포-범위와-소스-권위). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> 사용자가 요청한 단계만 commit·push·PR·merge·발행·브랜치 정리한다. 과거 main 직접 push 기록을 현재 PR 절차로 사용하지 않는다. 전체 흐름은 [릴리스 스킬](../../.agents/skills/release-drum-practice/SKILL.md)을 따른다.


### Rule 재점검 원문 — DEPLOYMENT-RULES.md / 2

출처: [docs/operations/DEPLOYMENT-RULES.md](../reference/engineering/release.md#deployment-rules--배포-범위와-소스-권위). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> 배포 파일을 checkout 외부의 심볼릭 링크로 대체하지 않는다. Git에는 대상 내용이 저장되지 않아 공개 빌드 입력을 보장할 수 없다. hosting은 설정 원본이며 실제 배포 의존성은 deployment/sites에 필요할 때 준비한다. 기존 사본을 교체하기 전에 프로젝트 ID·경로·별도 수정 유무를 확인한다.


### Rule 재점검 원문 — OPEN-SOURCE-NOTICES.md / 1

출처: [docs/operations/OPEN-SOURCE-NOTICES.md](../reference/engineering/third-party-notices.md#open-source-notices--오픈소스-고지-계약). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> 직접 의존성의 라이선스는 OSMD BSD-3-Clause, PDF.js Apache-2.0, JSZip MIT 선택(원본 MIT/GPL 선택), SoundTouchJS LGPL-2.1이다. 정확한 설치 버전은 lockfile과 생성 고지를 사용한다. 오래된 소개 표의 OSMD 2.1.2를 현재 설치 버전으로 사용하지 않는다.


### Rule 재점검 원문 — OPEN-SOURCE-NOTICES.md / 3

출처: [docs/operations/OPEN-SOURCE-NOTICES.md](../reference/engineering/third-party-notices.md#open-source-notices--오픈소스-고지-계약). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> 설치된 lockfile의 의존성을 준비한 뒤 기존 `npm run generate`가 고지를 생성한다. 원문 누락이면 빌드 실패를 해결하고, `npm run check:docs`는 생성 UI 문서·파일 링크만 검사하므로 라이선스 검토를 대신하지 않는다. 공개 발행은 [발행 절차](../how-to/release.md#sites-publication--sites-발행-절차)의 요청·확인 범위에서만 수행한다.
