# 프로젝트 구조 개편 기록

문서 역할: **사실·연구 기록**. 원문 날짜·입력·환경·결과·실패·미확인은 각 절의 당시 상태다. 이번 통합에서 과거 검증을 재실행하지 않았으며, 기록의 “현재”는 원래 작성 시점이다. [기록 안내](../README.md)와 [현행 정본](../../RULES-INDEX.md)을 구분한다.

<a id="project-restructuring--중형-프로젝트-구조-개편-제안"></a>

## 중형 프로젝트 구조 개편 제안

문서 역할: **기록·참고**. 완료된 구조 개편 계획·검증 기록. 현재 책임/의존 경계는 [구조 Rule](../../reference/engineering/architecture.md#project-structure--프로젝트-구조)을 따른다.

작성일: 2026-10-21

상태: **1~6단계 구조 개편과 로컬 검증 완료. 기존 검수 오류 1건은 아래에 별도 기록**. 실행 기준은 `main`의 `3dee0a8`이며 시작 작업 트리는 깨끗했다. 구조 개편 검증 후 사용자가 버전 관리·커밋·push·merge·발행을 승인했다. 릴리스 결과는 history.md와 Sites 발행 기록을 따른다. 아래 조사 수치는 제안 작성 당시 기록이며, 실제 이동 결과는 [이동표](project-restructuring.md#restructuring-map--구조-개편-이동표와-의존-규칙)와 [현재 구조](../../reference/engineering/architecture.md#project-structure--프로젝트-구조)를 따른다.


원문 출처: `docs/plans/PROJECT-RESTRUCTURING.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="project-restructuring--목표와-범위"></a>

### 목표와 범위

- 목표: 기존 동작을 유지하면서 앱·기능·공통 코드·제작 도구의 책임과 위치를 명확하게 한다.
- 범위: 소스, 검사 스크립트, 테스트 구성, 문서, 제작 도구의 분류 및 관련 경로 참조.
- 완료 조건: 파일 책임과 의존 규칙이 명확하고, 이동 전 검사 범위를 보존하며, 두 앱과 기존 저장 자료가 동일하게 동작한다.
- 제외: 기능·디자인 변경, 저장 형식 변경, 원본 자료 삭제, 프레임워크 교체, 공개 범위 확대. 버전 변경·커밋·push·발행은 별도 요청을 따른다.
- 검증: 단계별 정적 검사·집중 테스트, 최종 전체 회귀·분리 빌드·앱 경계·로컬 화면 확인. 시험과 GUI의 실제 수행 범위는 실행 시 최신 지침 및 사용자 승인에 대조한다.

<a id="project-restructuring--조사-기준과-현황"></a>

### 조사 기준과 현황

프로젝트 루트: `/Users/raphael/Playground/drum-practice`

구조 조사는 `main`, `f21a7c3` 기준 작업 트리에서 읽기 전용으로 수행했다. 아래 수치는 조사 당시이며 테스트 성공 수가 아니다. 문서 저장 직전 HEAD는 `5edbb1c`로 바뀌어 있었다. 메인 작업자는 실행 전에 최신 HEAD·작업 트리·현황을 다시 확인해야 한다.

| 영역 | 조사 결과 |
| --- | --- |
| Git 추적 파일 | 483개 |
| 소스 | `src` 173개 중 168개가 바로 아래 위치 |
| TypeScript | 선언 파일 제외 153개, 물리적 줄 수 22,551줄 |
| 앱 진입점 | `main.ts` 2,800줄, `player-app.ts` 686줄 |
| 공통 재생 화면 | `playback-screen.ts` 1,097줄 |
| CSS | 총 6,075줄. `playback-ui.css` 2,914줄, `style.css` 2,057줄 |
| 테스트 | `tests` 추적 파일 122개. 테스트 파일 121개가 바로 아래 위치 |
| 문서 | `docs` 추적 파일 74개 중 66개가 바로 아래 위치 |
| 스크립트 | 70개. 앱 개발·검사·악보 제작 도구 포함 |

기존 장점은 유지한다.

- TypeScript·Vite 기반의 앱 개발 경로.
- 제작기와 연습실의 분리 빌드.
- 두 앱이 공유하는 재생 화면과 공통 UI.
- 재생 소유권 검사와 제작 기능의 player 번들 유입 방지 검사.
- 공통 미디어 직렬화와 별도의 제작기·연습실 저장 정책.

<a id="project-restructuring--먼저-해결할-구조적-문제"></a>

#### 먼저 해결할 구조적 문제

1. 조사 당시 `scripts/check-common-components.mjs`와 `scripts/check-i18n.mjs`는 `src` 바로 아래 파일만 탐색한다. 먼저 하위 폴더까지 검사하도록 보강하지 않으면 이동한 파일이 검사에서 빠진다.
2. 재생 구조·앱 경계 검사는 기존 파일명을 직접 참조한다. 경로 이동과 함께 검사 참조를 갱신하되 금지 의존성과 소유권 검사의 의미를 약화시키면 안 된다.
3. 조사 당시 공통 `RecordData` 자료형이 `src/storage.ts`에 있었다. 여러 기능이 저장 구현 파일에서 자료형을 가져오므로 공통 모델로 분리할 후보이다. `storage.ts`와 `song-scores.ts`의 상호 참조에는 `import type`이 포함되어 있다. 실행 시 순환 오류로 단정하지 않는다.
4. 일부 테스트는 Git에서 제외된 `public/demo`, `public/scores`, `data/reference`를 읽는다. 새 checkout만으로 실행 가능한 검사와 로컬 자료가 필요한 검사를 명시적으로 구분한다.
5. 빌드 또한 로컬 `public/scores` 패키지를 사용한다. 깨끗한 환경에서의 검증에는 필요한 자산 목록과 준비 절차를 문서화해야 한다. 원본 미디어를 임의로 Git에 추가하지 않는다.
6. README의 앱 버전은 조사 당시 0.7.7, 버전 정본은 0.8.3이었다. 서버 분석 저장소 설명 등 현행 코드와 어긋난 문구도 정리 대상이다.

<a id="project-restructuring--설계-방향"></a>

### 설계 방향

단일한 국제 표준 폴더명은 없다. 이 제안은 기능 응집도, 일관된 의존 방향, 재현 가능한 검사, 생성물과 정본의 구분을 이 프로젝트에 적용한 것이다.

앱 소스는 우선 기존 단일 패키지를 유지한다. 폴더 정리를 위해 프레임워크나 모노레포 도구를 도입하지 않는다. `hosting`의 별도 빌드 패키지는 역할을 유지한다.

```text
drum-practice/
├── src/
│   ├── apps/
│   │   ├── editor/          # 제작기 시작·화면 구성·편집 작업 흐름
│   │   └── player/          # 연습실 시작·목록·화면 전환
│   ├── modules/
│   │   ├── playback/        # 두 앱이 공유하는 재생 기능
│   │   ├── audio/           # 분석·템포 변환·파형·음원 조정
│   │   ├── score/           # MusicXML·악보 표시·렌더링 캐시
│   │   ├── lyrics/          # 가사 배치·타이밍·보정
│   │   └── library/         # 악보·음원 목록과 가져오기
│   ├── model/              # 공통 자료형과 규칙
│   ├── platform/
│   │   ├── storage/        # IndexedDB·설정 저장·직렬화
│   │   └── browser/        # 전체화면·다운로드 등 브라우저 기능
│   ├── shared/
│   │   ├── ui/             # 버튼·모달·말풍선·아이콘
│   │   ├── styles/         # 색상·간격·공통 컨트롤
│   │   └── i18n/           # 번역 함수·언어 파일
│   ├── content/            # 수록곡 목록·승인된 곡별 보정 자료
│   ├── generated/          # 빌드번호·라이선스 생성 파일
│   └── app-versions.json   # 두 앱의 버전 정본 유지
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── local-media/
│   └── fixtures/
├── scripts/
│   ├── build/
│   ├── checks/
│   └── release/
├── tools/
│   ├── score-production/
│   └── apple-local/
├── docs/
├── server/
├── hosting/
├── public/
├── data/
├── deployment/
└── index.html / editor.html / player.html
```

실제 책임과 파일 수에 따라 하위 폴더를 만든다. 빈 계층을 일괄 생성하지 않는다. 위 트리는 제안 당시 목표 분류다. 파일별 실행 결과는 이동표에 기록했다.

<a id="project-restructuring--대표-이동-후보"></a>

#### 대표 이동 후보

| 현행 | 목표 후보 | 주의점 |
| --- | --- | --- |
| `src/main.ts` | `src/apps/editor/main.ts` | 먼저 이동하고 나중에 역할별 분리 |
| `src/player-app.ts` | `src/apps/player/player-app.ts` | 목록·파일 선택 잠금·세대 관리·저장 흐름 보존 |
| `src/playback-*.ts` | `src/modules/playback/` | 이름만으로 일괄 이동하지 않고 실제 책임 확인 |
| `src/audio-*.ts`, `stretch*.ts` | `src/modules/audio/` | Worker·동적 import·URL 참조 함께 갱신 |
| `src/musicxml.ts`, 렌더링 관련 파일 | `src/modules/score/` | 제작 전용 코드의 공개 번들 유입 방지 |
| `src/lyric-*.ts` | `src/modules/lyrics/` 또는 `src/content/` | 일반 로직과 곡별 보정 자료를 구분 |
| `RecordData` 등 공통 자료형 | `src/model/` | 저장 구현에서 자료형만 분리, 직렬화 규약 유지 |
| 공통 버튼·모달·도움말 | `src/shared/ui/` | 음악 기능에 종속된 도움말 내용은 소유 모듈에서 공급하도록 검토 |
| 저장 구현 | `src/platform/storage/` | DB 이름·버전·키·트랜잭션·호환 유지 |
| 제작용 Python·곡별 생성기 | `tools/score-production/` | 실행 경로와 제작 스킬·문서 참조 동시 갱신 |

<a id="project-restructuring--의존성과-파일-구성-규칙"></a>

### 의존성과 파일 구성 규칙

1. 제작기와 연습실은 서로 직접 참조하지 않는다. 공통 기능은 모듈을 통해 사용한다.
2. 재생 화면과 제어의 소유자는 하나로 유지한다. 각 앱은 초기 상태·저장·종료 등의 앱별 연결을 담당한다.
3. 공통 UI에 BPM 계산이나 곡별 보정 같은 음악 규칙을 넣지 않는다.
4. 공통 모델은 앱 진입점과 UI·저장 구현에 의존하지 않도록 단계적으로 분리한다. 현행 `model.ts`의 분석·번역 의존성은 이동 전에 분류한다.
5. 모듈 간 허용 의존성과 공개 진입점을 대응표에 명시한다. 모든 모듈을 한 `index.ts`에서 내보내는 방식은 강제하지 않는다.
6. CSS는 기능 가까이에 둔다. 공통 토큰·컨트롤만 `shared/styles`로 모으고 이동 단계에서는 적용 순서·선택자·화면 동작을 보존한다.
7. `main.ts`는 보관함·악보 편집·가사 편집·검수·저장 흐름을 분리해 앱 조립 역할로 줄인다. 목표 줄 수보다 책임과 상태 소유권을 기준으로 나눈다.
8. `playback-screen.ts`도 내부 역할은 분리할 수 있지만 공통 재생 소유권을 앱별로 분산하지 않는다.
9. 곡별 승인 보정 자료는 삭제하지 않는다. 곡 식별 조건·근거·적용 경로를 보존한다.
10. 생성물은 생성 스크립트로 갱신한다. `deployment/sites`는 배포 사본이며 제품 소스를 독립 수정하지 않는다.

<a id="project-restructuring--문서검사도구-정리"></a>

### 문서·검사·도구 정리

문서는 다음 역할로 나눈다.

- `docs/product/`: 제품 범위·UX·사용 동작.
- `docs/architecture/`: 구조·의존 규칙·저장 형식·중요 설계 결정.
- `docs/operations/`: 개발·발행·검증·기기 설정.
- `docs/score-production/`: 제작 정책·표기 정본·곡별 기록.

`AGENTS.md`, `PRD.md`, `history.md`, README는 우선 기존 진입점을 유지한다. 기존 표기·저장·SVG 정본의 경로 변경은 링크, 스킬, 검사 스크립트 등 참조처를 함께 갱신한 뒤 수행한다. 현재 규칙과 과거 기록을 구분하며 정본 복제는 하지 않는다.

테스트의 `unit`, `integration`, `local-media`는 실제 의존과 수행 내용으로 분류한다. 로컬 파일이 없을 때 필수 검사를 조용히 skip하지 않고 필요한 자료와 미실행 범위를 명시한다. 로컬 악보 검사는 릴리스에 필요한 경우 계속 필수로 유지한다.

앱 빌드·검사·릴리스 도구는 `scripts`, 악보 제작과 Apple 보조 도구는 `tools`로 나눈다. 명령·상대경로·스킬 참조를 함께 바꾼다. 기존 사용 명령은 필요하면 얇은 진입점으로 유지한다.

<a id="project-restructuring--이전-순서와-완료-조건"></a>

### 이전 순서와 완료 조건

| 단계 | 작업 | 완료 조건 |
| --- | --- | --- |
| 1 | 최신 상태 확인, 파일별 이동 대응표·의존 규칙 기록 | 대상 파일·책임·새 경로·주요 참조처를 확인 |
| 2 | 검사 스크립트 재귀 탐색·경계 규칙 보강 | 하위 폴더와 기존 대상 전체를 검사, 범위 축소 없음 |
| 3 | 기능별 파일 이동 | 동작 변경 없이 타입·집중 검사·두 앱 빌드·경계 검사 유지 |
| 4 | 큰 파일·CSS 역할 분리 | 기존 상태 수명·저장·조작·화면 유지 |
| 5 | 테스트·문서·제작 도구 정리 | 실행 조건·정본·참조 경로 명확화 |
| 6 | 전체 회귀·로컬 화면 검증 | 기존 기능·자료 호환·공개 번들 경계 유지 증거 확보 |

추천은 1차에 검사 보강과 기능별 이동, 2차에 대형 파일 분리이다. 물리적 이동과 로직 리팩터링을 같은 변경 덩어리에 섞지 않는다.

<a id="project-restructuring--반드시-보존할-계약"></a>

#### 반드시 보존할 계약

- 제작기는 로컬 전용, 공개 대상은 `dist/player`만.
- 개발 포트 5173과 HTML 진입 주소.
- 기존 기능·디자인·키보드·터치·길게 누르기 도움말 동작.
- IndexedDB 이름·버전·저장 키·`bytes-v1` 형식·이전 자료 호환.
- 저장 전 snapshot·큐·트랜잭션과 제작기/연습실의 서로 다른 저장 정책.
- `.drumscore` 형식, 곡별 승인 보정과 원본 미디어.
- 공통 재생 소유권과 공통 UI 재사용.
- 버전 정본, 라이선스 고지, 생성물 제외, player 전용 발행 절차.

<a id="project-restructuring--경로-변경-시-확인할-곳"></a>

#### 경로 변경 시 확인할 곳

HTML 진입점, Vite·TypeScript·Vitest 설정, Worker 생성 URL, 동적 import, CSS 자산 참조, 테스트 import·mock·파일 읽기 경로, 정적 자산 카탈로그, i18n 예외 목록, UI 문서 생성, 빌드번호 해시 입력, 라이선스 생성, 버전 증가 도구, Sites 사본 준비, 제작 스크립트, 스킬과 정본 문서 링크.

<a id="project-restructuring--최종-검증-대상"></a>

#### 최종 검증 대상

- 재생·정지·탐색·BPM 직접 입력/프리셋·원곡 모드·메트로놈·카운트오프.
- 음원 가져오기·중복 확인·조정 화면·첫 박·파형·곡 정보·저장 후 재열기.
- 구간·마커·도움말·공통 모달·키보드와 터치 조작.
- 제작기 편집·가사·검수·저장, 기존 패키지 읽기와 저장 호환.
- 전체 검사와 두 앱 분리 빌드, 제작 기능의 player 번들 유입 금지.
- 경로 변경으로 검사 대상이 빠지지 않았는지 이동 전후 대상 목록 대조.

배포 검증은 별도 발행 요청이 있을 때 수행한다. 이 제안 저장 과정에서는 테스트·빌드·브라우저 조작을 실행하지 않았다.

<a id="project-restructuring--메인-대화에서-시작할-때"></a>

### 메인 대화에서 시작할 때

이 문서를 읽고 최신 전역·프로젝트 지침과 Git 상태를 확인한다. 사용자에게 실제 실행 지시를 받은 범위만 진행한다. 이 문서는 제안이며 실행 승인 기록을 대신하지 않는다. 이전 대화에서 제시한 실행 지시 예문도 실제 승인으로 간주하지 않는다.

저장 직전 확인된 기존 미추적 자료는 `docs/design/legend-diagram/common-legend*.png`, `docs/design/legend-diagram/common-legend*.svg`, `exports/`였다. 제작 지침 변경은 `5edbb1c`에 기록된 상태였다. 이 상태는 관측 기록이며 실행 시 다시 확인하고 다른 작업의 변경을 보존한다.

<a id="project-restructuring--참고"></a>

### 참고

- [Vite 다중 HTML 진입점](https://vite.dev/guide/build#multi-page-app): 기존 진입점을 유지할 근거.
- [Vitest 검사 구성](https://vitest.dev/guide/index.html): 검사 범위를 기존 도구에서 분리할 수 있는 근거.
- 목표 폴더 트리는 공식 도구가 강제하는 표준이 아니라 이 저장소의 조사 결과에 따른 제안이다.

<a id="project-restructuring--실행-기록--2026-10-21"></a>

### 실행 기록 — 2026-10-21

단계 순서를 유지하여 기준 검사 → 검사 범위 보강 → 파일 이동 → 역할 분리 → 지원 자료 정리 → 최종 회귀 순으로 수행했다. 각 단계의 로컬 증거는 `.tmp/restructuring/`에 보관한다.

| 단계 | 실행 결과 | 검증 근거 |
|---|---|---|
| 1 | 파일별 이동표·모듈 경계·기준 상태 기록 | 기준 121개 파일/699개 테스트 통과 |
| 2 | 재귀 탐색·실제 import 경로 검사·model/shared/app 경계 보강 | 하위 폴더 금지 의존·미등록 번역·중복 구현의 음성 검사 |
| 3 | 앱·기능·공통·저장·content·generated 이동 | 타입, 집중 6파일/99테스트, 두 앱 빌드와 경계 검사 통과 |
| 4 | 제작기 보관함/악보/가사/검수/폼, 공통 BPM, 큰 CSS 분리 | 집중 5파일/104테스트 및 후속 3파일/99테스트; CSS 원문 결합 동일 |
| 5 | 기존 121개 테스트·문서·도구 분류, 명령·스킬 참조 갱신 | 경로 감사, Python 40파일 문법, Apple 보조 도구 15테스트 통과 |
| 6 | 전체 회귀·분리 빌드·Safari 로컬 확인 | 최종 결과는 아래 검증 기록에 기입 |

검사 이동 과정에서 테스트가 참조하던 루트 경로를 바로잡았다. BPM UI 검사는 입력 숫자의 즉시 변경과 비동기 변환 완료를 구분해 다음 조작 전에 헤더 반영과 busy 해제를 기다리도록 수정했다. 검사 조건을 삭제하거나 실패를 skip하지 않았다.

검사 파일 수는 121개를 유지한다. 구조 가드의 실패 사례를 독립 테스트로 분리해 테스트 수는 699개에서 708개로 늘었다. 새 음원·악보나 합성 미디어를 생성하지 않았다. 실제 iPad 터치·청취와 공개 배포 확인은 이번 로컬 구조 개편 검증과 구분한다.

<a id="project-restructuring--최종-검사-중-발견과-대조"></a>

#### 최종 검사 중 발견과 대조

일괄 경로 이동 중 경로가 아닌 `.`·`..` 문자열도 변경된 곳을 발견했다. 패키지 안전 경로 검증, MusicXML 경로 검증, 버전 숫자 구분자와 소스 경계 resolver를 수정한 뒤 소스 전체의 일반 문자열 변화를 대조했다. 마지막 결과에는 의도한 동적 import 경로와 타입 추출만 남았다. 같은 폴더 `./`와 상위 폴더 `../` import가 모두 해석되는 집중 검사를 추가했다.

저장·DB·설정·직렬화·미디어·연습 목록·패키지의 8개 모듈은 import와 자료형 선언을 제외한 실행 구문을 TypeScript AST로 비교해 이동 전과 동일함을 확인했다. 패키지/저장 회귀 검사도 함께 통과했다.

Safari의 러브홀릭 PDF·MusicXML 검수는 `PDF loveholic-m103마디의 오선 위치를 찾지 못했습니다`로 실패했다. 원본 HEAD `3dee0a8`의 검수 코드와 같은 기존 패키지로 독립 실행하여 동일 오류를 재현했다. 구조 개편 회귀와 구분하며, 이 작업에서 곡 데이터나 오선 판별 알고리즘은 바꾸지 않았다. 검수 화면의 전체 성공으로 보고하지 않는다. 근거: `.tmp/restructuring/browser-review-comparison.json`, `editor-review.png`.

<a id="project-restructuring--최종-결과"></a>

#### 최종 결과

- `npm run test:drum`: **121개 파일, 708개 테스트 통과**. 기존 테스트 파일을 모두 보존했다.
- `npm run build:apps`: 타입, i18n, 재생 소유권·공통 UI·소스 경계, 두 앱 빌드, player 번들 경계 통과. 166개 TS 파일·615개 해석된 참조를 검사한다. 238개 공통 primitive 사용처를 유지하며 미등록 UI 문구는 0개다.
- Python 도구 40개 구문 검사, Apple 보조 도구 15개 단위 검사 통과. 제작·STT·AFM 자체 실행이나 원본 미디어 변경은 하지 않았다.
- 소스 171개, 지원 파일 258개의 이동 목적지가 모두 존재한다. Git에 삭제로 표시되는 이전 경로 424개는 이동표에 전부 대응된다. 새 경로는 아직 미추적 상태이며 커밋하지 않았다.
- CSS 두 파일의 분리 조각 결합은 원본과 바이트 단위 동일하다. 저장 관련 8개 모듈의 실행 구문 동일성과 경로·문서 링크 검사를 확인했다.
- 버전은 두 앱 **0.8.3** 유지, 최종 빌드 **caaf355bc4d3**. HEAD **3dee0a8** 유지. 배포 사본·hosting·버전 정본 변경, commit·push·발행 없음.

Safari 로컬 `127.0.0.1:5173` 확인:

| 흐름 | 관측 결과 |
|---|---|
| 기존 패키지 재열기 | Loveholic 읽기와 MusicXML 악보 표시 |
| BPM | 프리셋 69, 숫자 방향키 70, 원곡 136.0 반영 및 모달 닫기 |
| 재생 | 1/2줄 보기, 53마디 마커 탐색, 52~54 반복·재생·카운트오프 표시·일시정지·처음 이동 |
| 도움말 | 재생바 위 안내와 우상단 공통 닫기 표시 |
| 제작기 | 공유 보관함에서 같은 악보 읽기, 곡 정보·악보 편집·가사 탭 표시, 기존 내용 저장·닫기 |
| 음원 | 기존 `public/demo/audio.mp3` 가져오기·분석·파형 표시 |
| 조정 | 첫 박 7.576 지정·스페이스 재생·정지·저장 후 재열기에서 7.576 유지 |
| 중복 | 같은 음원의 중복 확인 팝업 표시·취소 |
| PDF/MusicXML 검수 | Loveholic 103마디 기존 오류, 기준 소스와 동일하게 재현. 정상 검수 완료로 포함하지 않음 |

화면 증거는 `.tmp/restructuring/player-tempo.png`, `player-help.png`, `editor-score.png`, `editor-lyrics.png`, `audio-adjust.png`다. Safari 도구의 일부 UID가 화면 재구성 뒤 만료되어 최신 DOM을 다시 읽고 진행했다. 개발 WebSocket의 브라우저 suspension 메시지도 관측했으며 앱 오류와 구분한다. `$uid` 매크로 호출은 도구에서 지원되지 않아 해당 진단은 완료 근거로 사용하지 않았다.

실제 iPad 터치·하드웨어 음량·청취 품질과 공개 사이트 검증은 수행하지 않았다. 기존 단위/통합 검사는 길게 누르기·키보드·음원 스케줄링·저장 실패/동시성 등을 다루지만 실기기 검증을 대신하지 않는다. 번들 크기 경고는 유지하며 이번 구조 개편에서 임의의 번들 재분할로 변경 범위를 넓히지 않았다.

<a id="restructuring-map--구조-개편-이동표와-의존-규칙"></a>

## 구조 개편 이동표와 의존 규칙

기준: main 3dee0a8, 2026-10-21. 사용자 실행 승인. 기계 판독표: [restructuring-map.json](../../plans/restructuring-map.json).


원문 출처: `docs/plans/RESTRUCTURING-MAP.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="restructuring-map--경계"></a>

### 경계

- apps/editor와 apps/player 사이 직접 import 금지. 공통 재생 소유자는 modules/playback/playback-screen.ts 하나.
- model은 UI, 앱, 저장 구현에 의존하지 않는다. audio-beat-grid는 분석 실행 코드가 아닌 박 시각 검증 규칙이므로 model로 이동한다. 번역 함수 의존은 오류 문구 호환을 위해 유지한다.
- platform/storage는 model과 직렬화에 필요한 순수 score/media 계약을 사용한다. modules/library는 저장 정책을 호출한다.
- shared/ui는 도메인 규칙을 소유하지 않는다. 음악 화면별 도움말은 modules/help가 소유하고 shared/ui 말풍선·누르기 도구를 사용한다.
- playback은 audio, score, lyrics, library, help를 조합한다. audio와 score는 model, 저장 캐시, 공통 UI를 사용한다. lyrics는 model과 content를 사용한다.
- content는 승인된 곡별 데이터와 기존 보정 로직이다. 기존 보정의 score/lyrics 참조는 보존한다. 순환 의존을 새로 만들지 않는다.
- 전체 barrel export를 추가하지 않는다. 아래 파일의 기존 named export가 기능별 공개 진입점이다. 앱 전용 파일은 외부 모듈의 진입점이 아니다.
- src/app-versions.json과 HTML 주소, DB·직렬화·패키지 규약은 유지한다.

<a id="restructuring-map--소스-이동-실행-결과-참조처는-이동-전-기준"></a>

### 소스 이동 (실행 결과, 참조처는 이동 전 기준)

| 이전 | 새 경로 / 책임 영역 | 직접 참조처 |
|---|---|---|
| `src/main.ts` | `src/apps/editor/main.ts` | HTML / tool / asset reference |
| `src/workspace.ts` | `src/apps/editor/workspace.ts` | `src/main.ts`, `src/score-management.ts` |
| `src/editor-session.ts` | `src/apps/editor/editor-session.ts` | `src/main.ts` |
| `src/audio.ts` | `src/apps/editor/audio.ts` | `src/main.ts` |
| `src/score-editor-layout.ts` | `src/apps/editor/score-editor-layout.ts` | `src/score-management.ts` |
| `src/score-management.ts` | `src/apps/editor/score-management.ts` | `src/main.ts` |
| `src/score-review.ts` | `src/apps/editor/score-review.ts` | `src/main.ts` |
| `src/section-editor.ts` | `src/apps/editor/section-editor.ts` | `src/main.ts` |
| `src/style.css` | `src/apps/editor/style.css` | `src/main.ts` |
| `src/player-app.ts` | `src/apps/player/player-app.ts` | HTML / tool / asset reference |
| `src/player.css` | `src/apps/player/player.css` | `src/player-app.ts` |
| `src/player-library-view.ts` | `src/apps/player/player-library-view.ts` | `src/player-app.ts` |
| `src/player-library.css` | `src/modules/library/player-library.css` | `src/main.ts`, `src/player-app.ts` |
| `src/model.ts` | `src/model/model.ts` | `src/audio-core.ts`, `src/audio-practice-setup.ts`, `src/audio-practice-view.ts`, `src/audio-practice.ts`, `src/audio-preview-metronome.ts`, `src/audio-time-map.ts`, `src/canonical-xml.ts`, `src/edit-history.ts`, `src/english-lyrics.ts`, `src/library-backup.ts`, `src/listening-alignment.ts`, `src/listening-revision.ts`, `src/loop-slots.ts`, `src/lyric-bar34-review.ts`, `src/lyric-feedback-batch.ts`, `src/lyric-feedback-followup.ts`, `src/lyric-feedback-m32.ts`, `src/lyric-feedback-m36.ts`, `src/lyric-feedback-m39.ts`, `src/lyric-feedback-m48.ts`, `src/lyric-grid.ts`, `src/lyric-reading.ts`, `src/lyric-revision.ts`, `src/lyric-score.ts`, `src/lyric-tail-shift.ts`, `src/lyric-timing.ts`, `src/main.ts`, `src/marker-slots.ts`, `src/marker-ui.ts`, `src/musicxml.ts`, `src/pdf.ts`, `src/playback-actions.ts`, `src/playback-assets.ts`, `src/playback-frame.ts`, `src/playback-frame.ts`, `src/playback-layout.ts`, `src/playback-measure.ts`, `src/playback-position.ts`, `src/playback-runtime.ts`, `src/playback-screen.ts`, `src/playback-screen.ts`, `src/playback-ui.ts`, `src/practice-controls.ts`, `src/practice-file.ts`, `src/practice-library.ts`, `src/practice-management.ts`, `src/practice-staff-layout.ts`, `src/record-serialization.ts`, `src/repeat-ui.ts`, `src/ribbon-timeline.ts`, `src/score-import.ts`, `src/score-package.ts`, `src/score-reader.ts`, `src/score-render-cache.ts`, `src/score-rest-correction.ts`, `src/score-review.ts`, `src/score-view.ts`, `src/section-editor.ts`, `src/section-shortcuts.ts`, `src/song-scores.ts`, `src/storage.ts` |
| `src/edit-history.ts` | `src/model/edit-history.ts` | `src/editor-session.ts`, `src/main.ts`, `src/storage.ts`, `src/storage.ts`, `src/storage.ts`, `src/storage.ts` |
| `src/audio-beat-grid.ts` | `src/model/audio-beat-grid.ts` | `src/audio-analysis-contract.ts`, `src/audio-beat-tracking.ts`, `src/audio-practice.ts`, `src/model.ts` |
| `src/audio-analysis-contract.ts` | `src/model/audio-analysis-contract.ts` | `src/audio-analysis-cache.ts`, `src/audio-practice.ts` |
| `src/storage.ts` | `src/platform/storage/storage.ts` | `src/audio-practice-setup.ts`, `src/audio-practice.ts`, `src/browser-score.ts`, `src/bundled-score.ts`, `src/canonical-xml.ts`, `src/editor-session.ts`, `src/library-backup.ts`, `src/main.ts`, `src/player-app.ts`, `src/practice-file-controls.ts`, `src/practice-file.ts`, `src/practice-library.ts`, `src/practice-metadata-upgrade.ts`, `src/record-serialization.ts`, `src/recording-tempo.ts`, `src/score-assets.ts`, `src/score-management.ts`, `src/score-package.ts`, `src/score-preference.ts`, `src/score-rest-correction.ts`, `src/score-review.ts`, `src/song-scores.ts` |
| `src/score-database.ts` | `src/platform/storage/score-database.ts` | `src/audio-analysis-cache.ts`, `src/player-app.ts`, `src/practice-library.ts`, `src/storage.ts` |
| `src/preference-storage.ts` | `src/platform/storage/preference-storage.ts` | `src/fullscreen.ts`, `src/song-title.ts` |
| `src/record-serialization.ts` | `src/platform/storage/record-serialization.ts` | `src/library-backup.ts`, `src/main.ts` |
| `src/stored-media.ts` | `src/platform/storage/stored-media.ts` | `src/practice-library.ts`, `src/storage.ts` |
| `src/binary-asset.ts` | `src/platform/storage/binary-asset.ts` | `src/record-serialization.ts` |
| `src/audio-analysis-cache.ts` | `src/platform/storage/audio-analysis-cache.ts` | `src/audio-practice.ts`, `src/practice-file.ts`, `src/practice-library.ts` |
| `src/practice-library.ts` | `src/platform/storage/practice-library.ts` | `src/player-app.ts` |
| `src/download.ts` | `src/platform/browser/download.ts` | `src/licenses.ts`, `src/main.ts`, `src/practice-file-controls.ts` |
| `src/fullscreen.ts` | `src/platform/browser/fullscreen.ts` | `src/main.ts`, `src/playback-screen.ts` |
| `src/landscape-keyboard.ts` | `src/platform/browser/landscape-keyboard.ts` | `src/player-app.ts` |
| `src/load-timing.ts` | `src/platform/browser/load-timing.ts` | `src/player-app.ts` |
| `src/dialog-transition.ts` | `src/shared/ui/dialog-transition.ts` | `src/help.ts` |
| `src/dialog-ui.ts` | `src/shared/ui/dialog-ui.ts` | `src/audio-duplicate-dialog.ts`, `src/audio-practice-setup.ts`, `src/editor-session.ts`, `src/help.ts`, `src/main.ts`, `src/playback-forms.ts`, `src/playback-screen.ts`, `src/playback-shell.ts`, `src/player-app.ts`, `src/score-management.ts`, `src/score-reader.ts` |
| `src/html.ts` | `src/shared/ui/html.ts` | `src/audio-practice-setup.ts`, `src/dialog-ui.ts`, `src/icon-button.ts`, `src/loop-slots.ts`, `src/main.ts`, `src/marker-ui.ts`, `src/playback-forms.ts`, `src/playback-measure.ts`, `src/player-app.ts`, `src/player-library-view.ts`, `src/practice-management.ts`, `src/score-management.ts`, `src/score-management.ts`, `src/section-editor.ts`, `src/settings-ui.ts` |
| `src/icon-button.ts` | `src/shared/ui/icon-button.ts` | `src/audio-practice-setup.ts`, `src/audio-preview-controls.ts`, `src/dialog-ui.ts`, `src/fullscreen.ts`, `src/icons.ts`, `src/playback-forms.ts`, `src/playback-screen.ts`, `src/playback-ui.ts`, `src/player-app.ts` |
| `src/icon-svg.ts` | `src/shared/ui/icon-svg.ts` | `src/audio-practice-setup.ts`, `src/audio-preview-controls.ts`, `src/dialog-ui.ts`, `src/icons.ts`, `src/playback-forms.ts`, `src/playback-screen.ts`, `src/playback-ui.ts`, `src/player-app.ts`, `src/player-library-view.ts`, `src/score-reader.ts` |
| `src/icons.ts` | `src/shared/ui/icons.ts` | `src/fullscreen.ts`, `src/main.ts`, `src/score-management.ts` |
| `src/numeric-drag.ts` | `src/shared/ui/numeric-drag.ts` | `src/playback-screen.ts`, `src/score-editor-layout.ts`, `src/score-management.ts` |
| `src/settings-ui.ts` | `src/shared/ui/settings-ui.ts` | `src/playback-forms.ts` |
| `src/top-edge-header.ts` | `src/shared/ui/top-edge-header.ts` | `src/playback-runtime.ts`, `src/player-app.ts` |
| `src/ui-standard.ts` | `src/shared/ui/ui-standard.ts` | `src/fullscreen.ts`, `src/playback-forms.ts`, `src/playback-screen.ts`, `src/score-management.ts`, `src/workspace.ts` |
| `src/ui-catalog.json` | `src/shared/ui/ui-catalog.json` | `src/ui-standard.ts` |
| `src/licenses.ts` | `src/shared/ui/licenses.ts` | `src/workspace.ts` |
| `src/help-bubble.ts` | `src/shared/ui/help-bubble.ts` | `src/help-controls.ts`, `src/help.ts` |
| `src/help-placement.ts` | `src/shared/ui/help-placement.ts` | `src/help-bubble.ts` |
| `src/help-hold.ts` | `src/shared/ui/help-hold.ts` | `src/help.ts` |
| `src/i18n.ts` | `src/shared/i18n/i18n.ts` | `src/audio-core.ts`, `src/audio-duplicate-dialog.ts`, `src/audio-import-limits.ts`, `src/audio-practice-setup.ts`, `src/audio-practice-view.ts`, `src/audio-practice.ts`, `src/audio-preview-controls.ts`, `src/browser-score.ts`, `src/bundled-score.ts`, `src/canonical-xml.ts`, `src/dialog-ui.ts`, `src/drum-notation.ts`, `src/editor-session.ts`, `src/fullscreen.ts`, `src/help-content.ts`, `src/help-controls.ts`, `src/help-legend.ts`, `src/help.ts`, `src/icons.ts`, `src/library-backup.ts`, `src/licenses.ts`, `src/listening-alignment.ts`, `src/loop-slots.ts`, `src/lyric-bar34-review.ts`, `src/lyric-feedback-batch.ts`, `src/lyric-feedback-followup.ts`, `src/lyric-feedback-m32.ts`, `src/lyric-feedback-m36.ts`, `src/lyric-feedback-m39.ts`, `src/lyric-feedback-m48.ts`, `src/lyric-grid.ts`, `src/lyric-revision.ts`, `src/lyric-score.ts`, `src/lyric-tail-shift.ts`, `src/lyric-timing.ts`, `src/main.ts`, `src/marker-slots.ts`, `src/marker-ui.ts`, `src/media.ts`, `src/model.ts`, `src/musicxml.ts`, `src/pdf.ts`, `src/playback-drawer.ts`, `src/playback-forms.ts`, `src/playback-frame.ts`, `src/playback-measure.ts`, `src/playback-position.ts`, `src/playback-runtime.ts`, `src/playback-screen.ts`, `src/playback-shell.ts`, `src/playback-ui.ts`, `src/player-app.ts`, `src/player-library-view.ts`, `src/practice-controls.ts`, `src/practice-file-controls.ts`, `src/practice-file.ts`, `src/practice-library.ts`, `src/practice-management.ts`, `src/practice-staff-layout.ts`, `src/record-serialization.ts`, `src/repeat-ui.ts`, `src/score-database.ts`, `src/score-editor-layout.ts`, `src/score-import.ts`, `src/score-management.ts`, `src/score-preference.ts`, `src/score-reader.ts`, `src/score-rest-correction.ts`, `src/score-review.ts`, `src/score-system-layout.ts`, `src/section-editor.ts`, `src/song-scores.ts`, `src/ui-standard.ts`, `src/workspace.ts` |
| `src/help.ts` | `src/modules/help/help.ts` | `src/playback-screen.ts`, `src/player-app.ts` |
| `src/help-content.ts` | `src/modules/help/help-content.ts` | `src/help-controls.ts` |
| `src/help-controls.ts` | `src/modules/help/help-controls.ts` | `src/help.ts` |
| `src/help-legend.ts` | `src/modules/help/help-legend.ts` | `src/help.ts` |
| `src/help.css` | `src/modules/help/help.css` | `src/main.ts`, `src/player-app.ts` |
| `src/bundled-score.ts` | `src/modules/library/bundled-score.ts` | `src/main.ts` |
| `src/download-score.ts` | `src/modules/library/download-score.ts` | `src/player-app.ts` |
| `src/library-backup.ts` | `src/modules/library/library-backup.ts` | `src/main.ts` |
| `src/practice-file.ts` | `src/modules/library/practice-file.ts` | `src/player-app.ts`, `src/practice-file-controls.ts` |
| `src/practice-file-controls.ts` | `src/modules/library/practice-file-controls.ts` | `src/playback-runtime.ts`, `src/player-app.ts` |
| `src/practice-metadata-upgrade.ts` | `src/modules/library/practice-metadata-upgrade.ts` | `src/practice-library.ts` |
| `src/recent-score.ts` | `src/modules/library/recent-score.ts` | `src/main.ts` |
| `src/score-assets.ts` | `src/modules/library/score-assets.ts` | `src/main.ts`, `src/score-management.ts`, `src/score-management.ts` |
| `src/score-package.ts` | `src/modules/library/score-package.ts` | `src/main.ts`, `src/player-app.ts`, `src/practice-library.ts` |
| `src/score-preference.ts` | `src/modules/library/score-preference.ts` | `src/main.ts` |
| `src/song-title.ts` | `src/modules/library/song-title.ts` | `src/playback-position.ts`, `src/playback-screen.ts`, `src/player-app.ts`, `src/score-review.ts` |
| `src/browser-score.ts` | `src/modules/score/browser-score.ts` | `src/main.ts`, `src/main.ts`, `src/main.ts`, `src/player-app.ts` |
| `src/canonical-xml.ts` | `src/modules/score/canonical-xml.ts` | `src/bundled-score.ts`, `src/main.ts` |
| `src/drum-beams.ts` | `src/modules/score/drum-beams.ts` | `src/musicxml.ts` |
| `src/drum-legend.ts` | `src/modules/score/drum-legend.ts` | `src/browser-score.ts`, `src/drum-notation.ts`, `src/musicxml.ts` |
| `src/drum-notation.ts` | `src/modules/score/drum-notation.ts` | `src/musicxml.ts`, `src/score-rest-correction.ts` |
| `src/full-score-labels.ts` | `src/modules/score/full-score-labels.ts` | `src/score-management.ts`, `src/score-reader.ts` |
| `src/legacy-drum-identity.ts` | `src/modules/score/legacy-drum-identity.ts` | `src/drum-legend.ts` |
| `src/note-highlight.ts` | `src/modules/score/note-highlight.ts` | `src/main.ts`, `src/musicxml.ts`, `src/playback-assets.ts`, `src/playback-frame.ts`, `src/playback-measure.ts`, `src/playback-runtime.ts`, `src/playback-screen.ts` |
| `src/note-highlight-preference.ts` | `src/modules/score/note-highlight-preference.ts` | `src/main.ts` |
| `src/pdf.ts` | `src/modules/score/pdf.ts` | `src/main.ts`, `src/main.ts` |
| `src/practice-staff-layout.ts` | `src/modules/score/practice-staff-layout.ts` | `src/main.ts`, `src/playback-assets.ts`, `src/playback-layout.ts`, `src/playback-measure.ts`, `src/playback-runtime.ts`, `src/playback-screen.ts`, `src/ribbon-timeline.ts` |
| `src/ribbon-engraving.ts` | `src/modules/score/ribbon-engraving.ts` | `src/musicxml.ts` |
| `src/ribbon-timeline.ts` | `src/modules/score/ribbon-timeline.ts` | `src/musicxml.ts`, `src/playback-assets.ts`, `src/playback-frame.ts`, `src/playback-screen.ts`, `src/ribbon-engraving.ts` |
| `src/score-gestures.ts` | `src/modules/score/score-gestures.ts` | `src/loop-slots.ts`, `src/playback-actions.ts` |
| `src/score-import.ts` | `src/modules/score/score-import.ts` | `src/bundled-score.ts`, `src/main.ts` |
| `src/score-pages.ts` | `src/modules/score/score-pages.ts` | `src/main.ts`, `src/musicxml.ts`, `src/musicxml.ts`, `src/note-highlight.ts`, `src/playback-assets.ts`, `src/practice-staff-layout.ts`, `src/score-management.ts`, `src/score-reader.ts`, `src/score-review.ts` |
| `src/score-reader.ts` | `src/modules/score/score-reader.ts` | `src/playback-runtime.ts` |
| `src/score-render-cache.ts` | `src/modules/score/score-render-cache.ts` | `src/musicxml.ts` |
| `src/score-rest-correction.ts` | `src/modules/score/score-rest-correction.ts` | `src/main.ts` |
| `src/score-view.ts` | `src/modules/score/score-view.ts` | `src/playback-assets.ts`, `src/playback-frame.ts`, `src/playback-layout.ts`, `src/playback-screen.ts` |
| `src/score-zoom.ts` | `src/modules/score/score-zoom.ts` | `src/playback-forms.ts`, `src/playback-screen.ts` |
| `src/staff-geometry.ts` | `src/modules/score/staff-geometry.ts` | `src/practice-staff-layout.ts`, `src/score-review.ts` |
| `src/whole-rest-layout.ts` | `src/modules/score/whole-rest-layout.ts` | `src/musicxml.ts` |
| `src/musicxml.ts` | `src/modules/score/musicxml.ts` | `src/browser-score.ts`, `src/bundled-score.ts`, `src/canonical-xml.ts`, `src/canonical-xml.ts`, `src/main.ts`, `src/main.ts`, `src/score-import.ts`, `src/score-rest-correction.ts` |
| `src/song-scores.ts` | `src/modules/score/song-scores.ts` | `src/browser-score.ts`, `src/bundled-score.ts`, `src/main.ts`, `src/player-app.ts`, `src/practice-library.ts`, `src/record-serialization.ts`, `src/score-assets.ts`, `src/score-management.ts`, `src/score-package.ts`, `src/score-preference.ts`, `src/score-rest-correction.ts`, `src/score-review.ts`, `src/storage.ts` |
| `src/loop-slots.ts` | `src/modules/playback/loop-slots.ts` | `src/playback-frame.ts`, `src/playback-screen.ts` |
| `src/marker-icon.ts` | `src/shared/ui/marker-icon.ts` | `src/audio-practice-view.ts`, `src/icon-svg.ts`, `src/marker-ui.ts`, `src/playback-measure.ts`, `src/score-review.ts` |
| `src/marker-slots.ts` | `src/modules/playback/marker-slots.ts` | `src/audio-practice-view.ts`, `src/marker-ui.ts`, `src/playback-measure.ts`, `src/playback-screen.ts`, `src/practice-management.ts`, `src/score-review.ts` |
| `src/marker-ui.ts` | `src/modules/playback/marker-ui.ts` | `src/playback-screen.ts` |
| `src/practice-controls.ts` | `src/modules/playback/practice-controls.ts` | `src/playback-actions.ts`, `src/playback-screen.ts`, `src/repeat-ui.ts` |
| `src/practice-management.ts` | `src/modules/playback/practice-management.ts` | `src/main.ts`, `src/playback-runtime.ts` |
| `src/repeat-ui.ts` | `src/modules/playback/repeat-ui.ts` | `src/playback-screen.ts` |
| `src/section-shortcuts.ts` | `src/modules/playback/section-shortcuts.ts` | `src/main.ts`, `src/playback-screen.ts`, `src/practice-management.ts`, `src/section-editor.ts` |
| `src/lyric-grid.ts` | `src/modules/lyrics/lyric-grid.ts` | `src/lyric-bar34-review.ts`, `src/lyric-feedback-batch.ts`, `src/lyric-feedback-followup.ts`, `src/lyric-feedback-m32.ts`, `src/lyric-feedback-m36.ts`, `src/lyric-feedback-m39.ts`, `src/lyric-feedback-m48.ts`, `src/lyric-score.ts`, `src/lyric-tail-shift.ts`, `src/main.ts`, `src/playback-position.ts`, `src/playback-screen.ts` |
| `src/lyric-layout.ts` | `src/modules/lyrics/lyric-layout.ts` | `src/playback-layout.ts` |
| `src/lyric-reading.ts` | `src/modules/lyrics/lyric-reading.ts` | `src/main.ts` |
| `src/lyric-revision.ts` | `src/modules/lyrics/lyric-revision.ts` | `src/main.ts` |
| `src/lyric-score.ts` | `src/modules/lyrics/lyric-score.ts` | `src/canonical-xml.ts`, `src/main.ts` |
| `src/lyric-timing.ts` | `src/modules/lyrics/lyric-timing.ts` | `src/listening-revision.ts`, `src/lyric-reading.ts`, `src/lyric-revision.ts`, `src/main.ts` |
| `src/listening-alignment.ts` | `src/modules/lyrics/listening-alignment.ts` | `src/listening-revision.ts` |
| `src/bundled-practice-metadata.json` | `src/content/bundled-practice-metadata.json` | `src/practice-metadata-upgrade.ts` |
| `src/bundled-recording-tempo.json` | `src/content/bundled-recording-tempo.json` | `src/recording-tempo.ts` |
| `src/bundled-scores.json` | `src/content/bundled-scores.json` | `src/player-app.ts` |
| `src/pdf-display-crops.json` | `src/content/pdf-display-crops.json` | `src/score-view.ts` |
| `src/svg-display-crops.json` | `src/content/svg-display-crops.json` | `src/score-view.ts` |
| `src/score-system-layout.ts` | `src/content/score-system-layout.ts` | `src/bundled-score.ts`, `src/score-rest-correction.ts` |
| `src/score-anchor-data.ts` | `src/content/score-anchor-data.ts` | `src/score-view.ts` |
| `src/recording-tempo.ts` | `src/content/recording-tempo.ts` | `src/playback-screen.ts`, `src/player-app.ts` |
| `src/english-lyrics.ts` | `src/content/english-lyrics.ts` | `src/main.ts` |
| `src/listening-revision.ts` | `src/content/listening-revision.ts` | `src/main.ts` |
| `src/lyric-bar34-review.ts` | `src/content/lyric-bar34-review.ts` | `src/main.ts` |
| `src/lyric-feedback-batch.ts` | `src/content/lyric-feedback-batch.ts` | `src/main.ts` |
| `src/lyric-feedback-followup.ts` | `src/content/lyric-feedback-followup.ts` | `src/main.ts` |
| `src/lyric-feedback-m32.ts` | `src/content/lyric-feedback-m32.ts` | `src/main.ts` |
| `src/lyric-feedback-m36.ts` | `src/content/lyric-feedback-m36.ts` | `src/main.ts` |
| `src/lyric-feedback-m39.ts` | `src/content/lyric-feedback-m39.ts` | `src/main.ts` |
| `src/lyric-feedback-m48.ts` | `src/content/lyric-feedback-m48.ts` | `src/main.ts` |
| `src/lyric-reading-data.ts` | `src/content/lyric-reading-data.ts` | `src/english-lyrics.ts`, `src/listening-revision.ts`, `src/lyric-reading.ts` |
| `src/lyric-revision-data.ts` | `src/content/lyric-revision-data.ts` | `src/lyric-revision.ts` |
| `src/lyric-tail-shift.ts` | `src/content/lyric-tail-shift.ts` | `src/main.ts` |
| `src/lyric-timing-data.ts` | `src/content/lyric-timing-data.ts` | `src/lyric-timing.ts` |
| `src/lyric-timing-refinement.ts` | `src/content/lyric-timing-refinement.ts` | `src/main.ts` |
| `src/build-info.generated.json` | `src/generated/build-info.generated.json` | `src/playback-runtime.ts`, `src/player-app.ts`, `src/workspace.ts` |
| `src/third-party.generated.json` | `src/generated/third-party.generated.json` | `src/licenses.ts`, `src/player-app.ts` |
| `src/analysis.ts` | `src/modules/audio/analysis.ts` | `src/main.ts` |
| `src/audio-anchor-wave.ts` | `src/modules/audio/audio-anchor-wave.ts` | `src/audio-practice-setup.ts` |
| `src/audio-bar-one.ts` | `src/modules/audio/audio-bar-one.ts` | `src/audio-practice.ts`, `src/model.ts` |
| `src/audio-beat-analysis.ts` | `src/modules/audio/audio-beat-analysis.ts` | `src/audio-practice.ts` |
| `src/audio-beat-tracking.ts` | `src/modules/audio/audio-beat-tracking.ts` | `src/audio-beat-worker.ts` |
| `src/audio-beat-worker.ts` | `src/modules/audio/audio-beat-worker.ts` | `src/audio-beat-analysis.ts` |
| `src/audio-core.ts` | `src/modules/audio/audio-core.ts` | `src/audio-preview-metronome.ts`, `src/audio.ts`, `src/playback-runtime.ts`, `src/playback-screen.ts` |
| `src/audio-duplicate-dialog.ts` | `src/modules/audio/audio-duplicate-dialog.ts` | `src/player-app.ts` |
| `src/audio-import-limits.ts` | `src/modules/audio/audio-import-limits.ts` | `src/audio-practice.ts`, `src/player-app.ts`, `src/practice-file.ts` |
| `src/audio-levels.ts` | `src/modules/audio/audio-levels.ts` | `src/audio-core.ts` |
| `src/audio-metadata.ts` | `src/modules/audio/audio-metadata.ts` | `src/audio-practice.ts` |
| `src/audio-practice-setup.ts` | `src/modules/audio/audio-practice-setup.ts` | `src/player-app.ts` |
| `src/audio-practice-view.ts` | `src/modules/audio/audio-practice-view.ts` | `src/playback-screen.ts` |
| `src/audio-practice.css` | `src/modules/audio/audio-practice.css` | `src/player-app.ts` |
| `src/audio-practice.ts` | `src/modules/audio/audio-practice.ts` | `src/audio-practice-setup.ts`, `src/player-app.ts`, `src/player-library-view.ts`, `src/practice-file-controls.ts` |
| `src/audio-preview-controls.ts` | `src/modules/audio/audio-preview-controls.ts` | `src/audio-practice-setup.ts` |
| `src/audio-preview-metronome.ts` | `src/modules/audio/audio-preview-metronome.ts` | `src/audio-practice-setup.ts` |
| `src/audio-tempo.ts` | `src/modules/audio/audio-tempo.ts` | `src/audio-practice.ts` |
| `src/audio-time-map.ts` | `src/modules/audio/audio-time-map.ts` | `src/audio-core.ts`, `src/playback-screen.ts`, `src/stretch-warp.ts` |
| `src/media.ts` | `src/modules/audio/media.ts` | `src/main.ts` |
| `src/playback-actions.ts` | `src/modules/playback/playback-actions.ts` | `src/playback-screen.ts` |
| `src/playback-assets.ts` | `src/modules/playback/playback-assets.ts` | `src/main.ts`, `src/main.ts`, `src/playback-runtime.ts`, `src/playback-runtime.ts`, `src/playback-screen.ts` |
| `src/playback-base.css` | `src/shared/styles/controls.css` | `src/main.ts`, `src/player-app.ts` |
| `src/playback-drawer.ts` | `src/modules/playback/playback-drawer.ts` | `src/playback-screen.ts` |
| `src/playback-forms.ts` | `src/modules/playback/playback-forms.ts` | `src/main.ts`, `src/playback-runtime.ts`, `src/playback-screen.ts`, `src/playback-shell.ts`, `src/player-app.ts`, `src/workspace.ts` |
| `src/playback-frame.ts` | `src/modules/playback/playback-frame.ts` | `src/playback-screen.ts` |
| `src/playback-initial.ts` | `src/modules/playback/playback-initial.ts` | `src/playback-runtime.ts`, `src/player-app.ts` |
| `src/playback-layout.ts` | `src/modules/playback/playback-layout.ts` | `src/playback-frame.ts`, `src/playback-screen.ts` |
| `src/playback-measure.ts` | `src/modules/playback/playback-measure.ts` | `src/playback-screen.ts` |
| `src/playback-position.ts` | `src/modules/playback/playback-position.ts` | `src/playback-screen.ts`, `src/score-review.ts` |
| `src/playback-preferences.ts` | `src/modules/playback/playback-preferences.ts` | `src/audio-core.ts`, `src/audio.ts`, `src/main.ts` |
| `src/playback-runtime.ts` | `src/modules/playback/playback-runtime.ts` | `src/player-app.ts` |
| `src/playback-screen.ts` | `src/modules/playback/playback-screen.ts` | `src/main.ts`, `src/playback-runtime.ts`, `src/practice-management.ts` |
| `src/playback-shell.ts` | `src/modules/playback/playback-shell.ts` | `src/audio-practice-setup.ts`, `src/playback-runtime.ts`, `src/workspace.ts` |
| `src/playback-ui.css` | `src/modules/playback/playback-ui.css` | `src/main.ts`, `src/player-app.ts` |
| `src/playback-ui.ts` | `src/modules/playback/playback-ui.ts` | `src/main.ts`, `src/playback-drawer.ts`, `src/playback-forms.ts`, `src/playback-frame.ts`, `src/playback-runtime.ts`, `src/playback-screen.ts`, `src/playback-shell.ts`, `src/workspace.ts` |
| `src/playback-wake-lock.ts` | `src/modules/playback/playback-wake-lock.ts` | `src/playback-screen.ts` |
| `src/stick-click.ts` | `src/modules/audio/stick-click.ts` | `src/audio-core.ts` |
| `src/stretch-warp.ts` | `src/modules/audio/stretch-warp.ts` | `src/stretch-worker.ts` |
| `src/stretch-worker.ts` | `src/modules/audio/stretch-worker.ts` | `src/audio-core.ts` |
| `src/stretch.ts` | `src/modules/audio/stretch.ts` | `src/stretch-warp.ts`, `src/stretch-worker.ts` |
| `src/locales/ko.json` | `src/shared/i18n/locales/ko.json` | `src/i18n.ts` |
| `src/vendor/score-legend-svg.ts` | `src/modules/score/vendor/score-legend-svg.ts` | `src/help-legend.ts` |
| `src/vendor/score-legend-portrait-svg.ts` | `src/modules/score/vendor/score-legend-portrait-svg.ts` | `src/help-legend.ts` |
| `src/vendor/pict-half-open.json` | `src/modules/score/vendor/pict-half-open.json` | `src/drum-notation.ts` |
| `src/vendor/Bravura-OFL.txt` | `src/modules/score/vendor/Bravura-OFL.txt` | HTML / tool / asset reference |

<a id="restructuring-map--테스트문서도구-이동"></a>

### 테스트·문서·도구 이동

| 이전 | 새 경로 |
|---|---|
| `docs/APP-VERSIONS.md` | `docs/operations/APP-VERSIONS.md` |
| `docs/APPLE-LOCAL-WORKFLOW.md` | `docs/operations/APPLE-LOCAL-WORKFLOW.md` |
| `docs/AUDIO-PRACTICE.md` | `docs/product/AUDIO-PRACTICE.md` |
| `docs/BEAT-ANCHOR-AUDIT.md` | `docs/score-production/BEAT-ANCHOR-AUDIT.md` |
| `docs/BROWSER-MUSICXML-RENDERING.md` | `docs/architecture/BROWSER-MUSICXML-RENDERING.md` |
| `docs/CODE-MAINTENANCE.md` | `docs/architecture/CODE-MAINTENANCE.md` |
| `docs/DEPENDENCY-SECURITY.md` | `docs/operations/DEPENDENCY-SECURITY.md` |
| `docs/GARAGEBAND-DRUM-KITS.md` | `docs/score-production/GARAGEBAND-DRUM-KITS.md` |
| `docs/I18N.md` | `docs/architecture/I18N.md` |
| `docs/IPAD-LANDSCAPE-UX.md` | `docs/product/IPAD-LANDSCAPE-UX.md` |
| `docs/IPAD-SIMULATOR.md` | `docs/operations/IPAD-SIMULATOR.md` |
| `docs/IPAD-STATUS-BAR-DIAGNOSIS.md` | `docs/operations/IPAD-STATUS-BAR-DIAGNOSIS.md` |
| `docs/JAPANESE-CANONICAL-READINGS.md` | `docs/score-production/JAPANESE-CANONICAL-READINGS.md` |
| `docs/LOAD-TIMING.md` | `docs/architecture/LOAD-TIMING.md` |
| `docs/LOVEHOLIC-CONVERSION.md` | `docs/score-production/LOVEHOLIC-CONVERSION.md` |
| `docs/LOVEHOLIC-LYRICS-REVIEW.md` | `docs/score-production/LOVEHOLIC-LYRICS-REVIEW.md` |
| `docs/LOVEHOLIC-PDF-LYRIC-PLACEMENT.md` | `docs/score-production/LOVEHOLIC-PDF-LYRIC-PLACEMENT.md` |
| `docs/LOVEHOLIC-PUBLICATION.md` | `docs/score-production/LOVEHOLIC-PUBLICATION.md` |
| `docs/LOVEHOLIC-REVIEW.md` | `docs/score-production/LOVEHOLIC-REVIEW.md` |
| `docs/LYRIC-ACCURACY-REVIEW.md` | `docs/score-production/LYRIC-ACCURACY-REVIEW.md` |
| `docs/LYRIC-ALIGNMENT-AUDIT.md` | `docs/score-production/LYRIC-ALIGNMENT-AUDIT.md` |
| `docs/LYRIC-SYNC-CORRECTION.md` | `docs/score-production/LYRIC-SYNC-CORRECTION.md` |
| `docs/LYRIC-SYNC-FEEDBACK.md` | `docs/score-production/LYRIC-SYNC-FEEDBACK.md` |
| `docs/LYRIC-SYNC-REVIEW-EVIDENCE.md` | `docs/score-production/LYRIC-SYNC-REVIEW-EVIDENCE.md` |
| `docs/LYRIC-SYNC-SUSPECTS-V1.md` | `docs/score-production/LYRIC-SYNC-SUSPECTS-V1.md` |
| `docs/LYRIC-SYNC-SUSPECTS.md` | `docs/score-production/LYRIC-SYNC-SUSPECTS.md` |
| `docs/LYRICS-JAPANESE-COMPARISON.md` | `docs/score-production/LYRICS-JAPANESE-COMPARISON.md` |
| `docs/MARKER-SLOTS.md` | `docs/product/MARKER-SLOTS.md` |
| `docs/MEASURE-LYRICS.md` | `docs/architecture/MEASURE-LYRICS.md` |
| `docs/MUSICXML-CANONICAL.md` | `docs/architecture/MUSICXML-CANONICAL.md` |
| `docs/MUSICXML-COMPARISON.md` | `docs/score-production/MUSICXML-COMPARISON.md` |
| `docs/MUSICXML-CONVERSION-POLICY.md` | `docs/score-production/MUSICXML-CONVERSION-POLICY.md` |
| `docs/MUSICXML-CONVERSION.md` | `docs/score-production/MUSICXML-CONVERSION.md` |
| `docs/MUSICXML-INTEGRATION.md` | `docs/architecture/MUSICXML-INTEGRATION.md` |
| `docs/MUSICXML-SUPPORT.md` | `docs/architecture/MUSICXML-SUPPORT.md` |
| `docs/MUSICXML-TROUBLESHOOTING.md` | `docs/score-production/MUSICXML-TROUBLESHOOTING.md` |
| `docs/NOTE-PLAYBACK-HIGHLIGHT.md` | `docs/product/NOTE-PLAYBACK-HIGHLIGHT.md` |
| `docs/OPEN-SOURCE-NOTICES.md` | `docs/operations/OPEN-SOURCE-NOTICES.md` |
| `docs/PAUSED-SCORE-SCROLL.md` | `docs/product/PAUSED-SCORE-SCROLL.md` |
| `docs/PDF-DISPLAY-TRIM.md` | `docs/architecture/PDF-DISPLAY-TRIM.md` |
| `docs/PRACTICE-FILE.md` | `docs/architecture/PRACTICE-FILE.md` |
| `docs/PREPLAY-WARMUP-PRODUCTION.md` | `docs/score-production/PREPLAY-WARMUP-PRODUCTION.md` |
| `docs/RECORDING-TEMPO-APP.md` | `docs/architecture/RECORDING-TEMPO-APP.md` |
| `docs/RED-SUNSET-APP-INTEGRATION.md` | `docs/score-production/RED-SUNSET-APP-INTEGRATION.md` |
| `docs/RED-SUNSET-BEAT-41.md` | `docs/score-production/RED-SUNSET-BEAT-41.md` |
| `docs/RED-SUNSET-BEAT-COMPARISON.md` | `docs/score-production/RED-SUNSET-BEAT-COMPARISON.md` |
| `docs/RED-SUNSET-LATE-AUDIO-ANALYSIS.md` | `docs/score-production/RED-SUNSET-LATE-AUDIO-ANALYSIS.md` |
| `docs/RED-SUNSET-PRODUCTION.md` | `docs/score-production/RED-SUNSET-PRODUCTION.md` |
| `docs/RIBBON-READABILITY.md` | `docs/product/RIBBON-READABILITY.md` |
| `docs/SCORE-MUSICXML-OSMD-MAPPING.md` | `docs/score-production/SCORE-MUSICXML-OSMD-MAPPING.md` |
| `docs/SCORE-PACKAGE.md` | `docs/architecture/SCORE-PACKAGE.md` |
| `docs/SCORE-PRODUCTION-PROCESS.md` | `docs/score-production/SCORE-PRODUCTION-PROCESS.md` |
| `docs/SCORE-REVIEW.md` | `docs/product/SCORE-REVIEW.md` |
| `docs/SCORE-WORKSPACE.md` | `docs/product/SCORE-WORKSPACE.md` |
| `docs/SETTINGS-PLAYBACK.md` | `docs/product/SETTINGS-PLAYBACK.md` |
| `docs/SITE-SECURITY-HARDENING.md` | `docs/operations/SITE-SECURITY-HARDENING.md` |
| `docs/SITES-PUBLICATION.md` | `docs/operations/SITES-PUBLICATION.md` |
| `docs/SVG-RENDERING.md` | `docs/architecture/SVG-RENDERING.md` |
| `docs/SVG-SCORE-RULES.md` | `docs/architecture/SVG-SCORE-RULES.md` |
| `docs/TOM-MOVING-PRODUCTION.md` | `docs/score-production/TOM-MOVING-PRODUCTION.md` |
| `docs/UI-COMPONENTS.md` | `docs/product/UI-COMPONENTS.md` |
| `docs/UX-PRINCIPLES.md` | `docs/product/UX-PRINCIPLES.md` |
| `docs/acceptance.md` | `docs/operations/acceptance.md` |
| `docs/lyric-review-targets.json` | `docs/score-production/lyric-review-targets.json` |
| `docs/osmd-normal-notehead-fill.patch` | `docs/score-production/osmd-normal-notehead-fill.patch` |
| `scripts/apple-local/Review.swift` | `tools/apple-local/Review.swift` |
| `scripts/apple-local/SpeechBridge.swift` | `tools/apple-local/SpeechBridge.swift` |
| `scripts/apple-local/align_syllables.py` | `tools/apple-local/align_syllables.py` |
| `scripts/apple-local/boundaries.py` | `tools/apple-local/boundaries.py` |
| `scripts/apple-local/reconcile_alignment.py` | `tools/apple-local/reconcile_alignment.py` |
| `scripts/apple-local/test_boundaries.py` | `tools/apple-local/test_boundaries.py` |
| `scripts/apple-local/test_reconcile_alignment.py` | `tools/apple-local/test_reconcile_alignment.py` |
| `scripts/apple-local/test_workflow.py` | `tools/apple-local/test_workflow.py` |
| `scripts/apple-local/workflow.py` | `tools/apple-local/workflow.py` |
| `scripts/benchmark-renderer-server.py` | `tools/score-production/benchmark/benchmark-renderer-server.py` |
| `scripts/benchmark-renderer.html` | `tools/score-production/benchmark/benchmark-renderer.html` |
| `scripts/benchmark-renderer.ts` | `tools/score-production/benchmark/benchmark-renderer.ts` |
| `scripts/build-info.mjs` | `scripts/build/build-info.mjs` |
| `scripts/build-portrait-legend.mjs` | `tools/score-production/build-portrait-legend.mjs` |
| `scripts/build-renderer-benchmark.mjs` | `tools/score-production/benchmark/build-renderer-benchmark.mjs` |
| `scripts/bump-app-version.mjs` | `scripts/release/bump-app-version.mjs` |
| `scripts/check-app-boundaries.mjs` | `scripts/checks/check-app-boundaries.mjs` |
| `scripts/check-common-components.mjs` | `scripts/checks/check-common-components.mjs` |
| `scripts/check-i18n.mjs` | `scripts/checks/check-i18n.mjs` |
| `scripts/check-pdf.mjs` | `tools/score-production/check-pdf.mjs` |
| `scripts/check-playback-architecture.mjs` | `scripts/checks/check-playback-architecture.mjs` |
| `scripts/i18n-content-exceptions.json` | `scripts/checks/i18n-content-exceptions.json` |
| `scripts/inventory-i18n.mjs` | `scripts/checks/inventory-i18n.mjs` |
| `scripts/musicxml/compare.py` | `tools/score-production/musicxml/compare.py` |
| `scripts/musicxml/convert.py` | `tools/score-production/musicxml/convert.py` |
| `scripts/musicxml/export.py` | `tools/score-production/musicxml/export.py` |
| `scripts/musicxml/fixtures/preplay_warmup.json` | `tools/score-production/musicxml/fixtures/preplay_warmup.json` |
| `scripts/musicxml/fixtures/tom_moving_video.json` | `tools/score-production/musicxml/fixtures/tom_moving_video.json` |
| `scripts/musicxml/loveholic.py` | `tools/score-production/musicxml/loveholic.py` |
| `scripts/musicxml/loveholic_audio.py` | `tools/score-production/musicxml/loveholic_audio.py` |
| `scripts/musicxml/loveholic_ctc_review.py` | `tools/score-production/musicxml/loveholic_ctc_review.py` |
| `scripts/musicxml/loveholic_evidence_server.py` | `tools/score-production/musicxml/loveholic_evidence_server.py` |
| `scripts/musicxml/loveholic_lyric_notes.py` | `tools/score-production/musicxml/loveholic_lyric_notes.py` |
| `scripts/musicxml/loveholic_lyrics_review.py` | `tools/score-production/musicxml/loveholic_lyrics_review.py` |
| `scripts/musicxml/loveholic_package.mjs` | `tools/score-production/musicxml/loveholic_package.mjs` |
| `scripts/musicxml/loveholic_pdf_crop.py` | `tools/score-production/musicxml/loveholic_pdf_crop.py` |
| `scripts/musicxml/loveholic_printed_lyrics.py` | `tools/score-production/musicxml/loveholic_printed_lyrics.py` |
| `scripts/musicxml/loveholic_recording_tempo.py` | `tools/score-production/musicxml/loveholic_recording_tempo.py` |
| `scripts/musicxml/loveholic_standard_lyrics_qa.mjs` | `tools/score-production/musicxml/loveholic_standard_lyrics_qa.mjs` |
| `scripts/musicxml/preplay_warmup.py` | `tools/score-production/musicxml/preplay_warmup.py` |
| `scripts/musicxml/preplay_warmup_evidence_server.py` | `tools/score-production/musicxml/preplay_warmup_evidence_server.py` |
| `scripts/musicxml/preplay_warmup_package.mjs` | `tools/score-production/musicxml/preplay_warmup_package.mjs` |
| `scripts/musicxml/red_sunset.py` | `tools/score-production/musicxml/red_sunset.py` |
| `scripts/musicxml/red_sunset_app.mjs` | `tools/score-production/musicxml/red_sunset_app.mjs` |
| `scripts/musicxml/red_sunset_audio.py` | `tools/score-production/musicxml/red_sunset_audio.py` |
| `scripts/musicxml/red_sunset_package.mjs` | `tools/score-production/musicxml/red_sunset_package.mjs` |
| `scripts/musicxml/red_sunset_receiver.py` | `tools/score-production/musicxml/red_sunset_receiver.py` |
| `scripts/musicxml/red_sunset_verify.py` | `tools/score-production/musicxml/red_sunset_verify.py` |
| `scripts/musicxml/render.py` | `tools/score-production/musicxml/render.py` |
| `scripts/musicxml/render_portland_exercise.py` | `tools/score-production/musicxml/render_portland_exercise.py` |
| `scripts/musicxml/render_socal_warmup.py` | `tools/score-production/musicxml/render_socal_warmup.py` |
| `scripts/musicxml/requirements.txt` | `tools/score-production/musicxml/requirements.txt` |
| `scripts/musicxml/review.py` | `tools/score-production/musicxml/review.py` |
| `scripts/musicxml/song-metadata.json` | `tools/score-production/musicxml/song-metadata.json` |
| `scripts/musicxml/test_verification.py` | `tools/score-production/musicxml/test_verification.py` |
| `scripts/musicxml/tom-moving-versions.json` | `tools/score-production/musicxml/tom-moving-versions.json` |
| `scripts/musicxml/tom_moving_corrected.py` | `tools/score-production/musicxml/tom_moving_corrected.py` |
| `scripts/musicxml/tom_moving_corrected_package.mjs` | `tools/score-production/musicxml/tom_moving_corrected_package.mjs` |
| `scripts/musicxml/tom_moving_corrected_verify.py` | `tools/score-production/musicxml/tom_moving_corrected_verify.py` |
| `scripts/musicxml/tom_moving_evidence_server.py` | `tools/score-production/musicxml/tom_moving_evidence_server.py` |
| `scripts/musicxml/verify.py` | `tools/score-production/musicxml/verify.py` |
| `scripts/musicxml/verify_loveholic.py` | `tools/score-production/musicxml/verify_loveholic.py` |
| `scripts/musicxml/xml_helpers.py` | `tools/score-production/musicxml/xml_helpers.py` |
| `scripts/prepare-sites.mjs` | `scripts/release/prepare-sites.mjs` |
| `scripts/prepare_demo.py` | `tools/score-production/prepare_demo.py` |
| `scripts/prepare_qa_fixture.py` | `tools/score-production/prepare_qa_fixture.py` |
| `scripts/score/build-anchor-corrections.py` | `tools/score-production/corrections/build-anchor-corrections.py` |
| `scripts/third-party.mjs` | `scripts/build/third-party.mjs` |
| `scripts/tune-stretch.mjs` | `tools/audio/tune-stretch.mjs` |
| `scripts/ui-docs.mjs` | `scripts/build/ui-docs.mjs` |
| `tests/analysis-retirement.test.ts` | `tests/integration/analysis-retirement.test.ts` |
| `tests/app-separation.test.ts` | `tests/local-media/app-separation.test.ts` |
| `tests/audio-analysis-cache.test.ts` | `tests/integration/audio-analysis-cache.test.ts` |
| `tests/audio-analysis-import.test.ts` | `tests/integration/audio-analysis-import.test.ts` |
| `tests/audio-bar-one.test.ts` | `tests/integration/audio-bar-one.test.ts` |
| `tests/audio-beat-grid.test.ts` | `tests/unit/audio-beat-grid.test.ts` |
| `tests/audio-beat-tracking.test.ts` | `tests/unit/audio-beat-tracking.test.ts` |
| `tests/audio-beat-worker.test.ts` | `tests/integration/audio-beat-worker.test.ts` |
| `tests/audio-duplicate-dialog.test.ts` | `tests/integration/audio-duplicate-dialog.test.ts` |
| `tests/audio-import-limits.test.ts` | `tests/integration/audio-import-limits.test.ts` |
| `tests/audio-levels.test.ts` | `tests/unit/audio-levels.test.ts` |
| `tests/audio-metadata.test.ts` | `tests/unit/audio-metadata.test.ts` |
| `tests/audio-practice-setup.test.ts` | `tests/integration/audio-practice-setup.test.ts` |
| `tests/audio-practice.test.ts` | `tests/integration/audio-practice.test.ts` |
| `tests/audio-preview-controls.test.ts` | `tests/integration/audio-preview-controls.test.ts` |
| `tests/audio-preview-metronome.test.ts` | `tests/integration/audio-preview-metronome.test.ts` |
| `tests/audio-tempo.test.ts` | `tests/unit/audio-tempo.test.ts` |
| `tests/audio-time-map.test.ts` | `tests/unit/audio-time-map.test.ts` |
| `tests/browser-score.test.ts` | `tests/integration/browser-score.test.ts` |
| `tests/bundled-score.test.ts` | `tests/local-media/bundled-score.test.ts` |
| `tests/canonical-xml.test.ts` | `tests/local-media/canonical-xml.test.ts` |
| `tests/common-components.test.ts` | `tests/integration/common-components.test.ts` |
| `tests/dialog-transition.test.ts` | `tests/integration/dialog-transition.test.ts` |
| `tests/download-score.test.ts` | `tests/integration/download-score.test.ts` |
| `tests/drum-beams.test.ts` | `tests/unit/drum-beams.test.ts` |
| `tests/drum-legend.test.ts` | `tests/local-media/drum-legend.test.ts` |
| `tests/drum-notation.test.ts` | `tests/integration/drum-notation.test.ts` |
| `tests/editor-session.test.ts` | `tests/local-media/editor-session.test.ts` |
| `tests/english-lyrics.test.ts` | `tests/unit/english-lyrics.test.ts` |
| `tests/full-score-labels.test.ts` | `tests/integration/full-score-labels.test.ts` |
| `tests/fullscreen.test.ts` | `tests/integration/fullscreen.test.ts` |
| `tests/help-placement.test.ts` | `tests/unit/help-placement.test.ts` |
| `tests/help.test.ts` | `tests/integration/help.test.ts` |
| `tests/i18n.test.ts` | `tests/integration/i18n.test.ts` |
| `tests/landscape-keyboard.test.ts` | `tests/integration/landscape-keyboard.test.ts` |
| `tests/licenses.test.ts` | `tests/integration/licenses.test.ts` |
| `tests/listening-alignment.test.ts` | `tests/unit/listening-alignment.test.ts` |
| `tests/listening-revision.test.ts` | `tests/unit/listening-revision.test.ts` |
| `tests/load-timing.test.ts` | `tests/unit/load-timing.test.ts` |
| `tests/loop-slots.test.ts` | `tests/local-media/loop-slots.test.ts` |
| `tests/lyric-bar34-review.test.ts` | `tests/local-media/lyric-bar34-review.test.ts` |
| `tests/lyric-feedback-batch.test.ts` | `tests/local-media/lyric-feedback-batch.test.ts` |
| `tests/lyric-feedback-followup.test.ts` | `tests/local-media/lyric-feedback-followup.test.ts` |
| `tests/lyric-feedback-m32.test.ts` | `tests/local-media/lyric-feedback-m32.test.ts` |
| `tests/lyric-feedback-m36.test.ts` | `tests/local-media/lyric-feedback-m36.test.ts` |
| `tests/lyric-feedback-m39.test.ts` | `tests/local-media/lyric-feedback-m39.test.ts` |
| `tests/lyric-feedback-m48.test.ts` | `tests/local-media/lyric-feedback-m48.test.ts` |
| `tests/lyric-grid.test.ts` | `tests/unit/lyric-grid.test.ts` |
| `tests/lyric-layout.test.ts` | `tests/unit/lyric-layout.test.ts` |
| `tests/lyric-reading.test.ts` | `tests/unit/lyric-reading.test.ts` |
| `tests/lyric-revision.test.ts` | `tests/unit/lyric-revision.test.ts` |
| `tests/lyric-tail-shift.test.ts` | `tests/unit/lyric-tail-shift.test.ts` |
| `tests/lyric-timing.test.ts` | `tests/unit/lyric-timing.test.ts` |
| `tests/lyric-upload-entry.test.ts` | `tests/integration/lyric-upload-entry.test.ts` |
| `tests/marker-slots.test.ts` | `tests/local-media/marker-slots.test.ts` |
| `tests/measure-lyrics.test.ts` | `tests/local-media/measure-lyrics.test.ts` |
| `tests/media.test.ts` | `tests/unit/media.test.ts` |
| `tests/model.test.ts` | `tests/local-media/model.test.ts` |
| `tests/musicxml.test.ts` | `tests/local-media/musicxml.test.ts` |
| `tests/note-highlight-preference.test.ts` | `tests/integration/note-highlight-preference.test.ts` |
| `tests/note-highlight.test.ts` | `tests/integration/note-highlight.test.ts` |
| `tests/numeric-drag.test.ts` | `tests/integration/numeric-drag.test.ts` |
| `tests/pdf-lyric-layout.test.ts` | `tests/integration/pdf-lyric-layout.test.ts` |
| `tests/pdf.test.ts` | `tests/integration/pdf.test.ts` |
| `tests/playback-actions.test.ts` | `tests/integration/playback-actions.test.ts` |
| `tests/playback-architecture-guards.test.ts` | `tests/integration/playback-architecture-guards.test.ts` |
| `tests/playback-position.test.ts` | `tests/integration/playback-position.test.ts` |
| `tests/playback-preferences.test.ts` | `tests/integration/playback-preferences.test.ts` |
| `tests/playback-runtime.test.ts` | `tests/integration/playback-runtime.test.ts` |
| `tests/playback-screen.test.ts` | `tests/local-media/playback-screen.test.ts` |
| `tests/playback-ui.test.ts` | `tests/local-media/playback-ui.test.ts` |
| `tests/playback-wake-lock.test.ts` | `tests/integration/playback-wake-lock.test.ts` |
| `tests/player-library-render.test.ts` | `tests/integration/player-library-render.test.ts` |
| `tests/player-recovery-removal.test.ts` | `tests/integration/player-recovery-removal.test.ts` |
| `tests/player-worker.test.ts` | `tests/integration/player-worker.test.ts` |
| `tests/player.test.ts` | `tests/local-media/player.test.ts` |
| `tests/practice-controls.test.ts` | `tests/unit/practice-controls.test.ts` |
| `tests/practice-file-controls.test.ts` | `tests/integration/practice-file-controls.test.ts` |
| `tests/practice-file.test.ts` | `tests/integration/practice-file.test.ts` |
| `tests/practice-library.test.ts` | `tests/integration/practice-library.test.ts` |
| `tests/practice-management.test.ts` | `tests/local-media/practice-management.test.ts` |
| `tests/practice-metadata-upgrade.test.ts` | `tests/local-media/practice-metadata-upgrade.test.ts` |
| `tests/practice-staff-layout.test.ts` | `tests/integration/practice-staff-layout.test.ts` |
| `tests/recent-score.test.ts` | `tests/integration/recent-score.test.ts` |
| `tests/record-serialization.test.ts` | `tests/local-media/record-serialization.test.ts` |
| `tests/recording-tempo.test.ts` | `tests/local-media/recording-tempo.test.ts` |
| `tests/retired-score.test.ts` | `tests/integration/retired-score.test.ts` |
| `tests/ribbon-density.test.ts` | `tests/unit/ribbon-density.test.ts` |
| `tests/ribbon-engraving.test.ts` | `tests/unit/ribbon-engraving.test.ts` |
| `tests/score-gestures.test.ts` | `tests/integration/score-gestures.test.ts` |
| `tests/score-management.test.ts` | `tests/local-media/score-management.test.ts` |
| `tests/score-package.test.ts` | `tests/local-media/score-package.test.ts` |
| `tests/score-pages.test.ts` | `tests/local-media/score-pages.test.ts` |
| `tests/score-preference.test.ts` | `tests/local-media/score-preference.test.ts` |
| `tests/score-reader.test.ts` | `tests/integration/score-reader.test.ts` |
| `tests/score-recording-grid.test.ts` | `tests/local-media/score-recording-grid.test.ts` |
| `tests/score-render-cache.test.ts` | `tests/integration/score-render-cache.test.ts` |
| `tests/score-rest-correction.test.ts` | `tests/local-media/score-rest-correction.test.ts` |
| `tests/score-review.test.ts` | `tests/local-media/score-review.test.ts` |
| `tests/score-system-layout.test.ts` | `tests/integration/score-system-layout.test.ts` |
| `tests/score-view.test.ts` | `tests/local-media/score-view.test.ts` |
| `tests/score-zoom.test.ts` | `tests/unit/score-zoom.test.ts` |
| `tests/section-editor.test.ts` | `tests/integration/section-editor.test.ts` |
| `tests/section-shortcuts.test.ts` | `tests/integration/section-shortcuts.test.ts` |
| `tests/security-headers.test.ts` | `tests/unit/security-headers.test.ts` |
| `tests/shared-playback-components.test.ts` | `tests/local-media/shared-playback-components.test.ts` |
| `tests/shared-score-library.test.ts` | `tests/local-media/shared-score-library.test.ts` |
| `tests/song-scores.test.ts` | `tests/local-media/song-scores.test.ts` |
| `tests/song-title.test.ts` | `tests/integration/song-title.test.ts` |
| `tests/staff-geometry.test.ts` | `tests/unit/staff-geometry.test.ts` |
| `tests/stick-click.test.ts` | `tests/unit/stick-click.test.ts` |
| `tests/storage.test.ts` | `tests/local-media/storage.test.ts` |
| `tests/stretch-warp.test.ts` | `tests/unit/stretch-warp.test.ts` |
| `tests/stretch.test.ts` | `tests/unit/stretch.test.ts` |
| `tests/tom-moving-package-update.test.ts` | `tests/local-media/tom-moving-package-update.test.ts` |
| `tests/top-edge-header.test.ts` | `tests/integration/top-edge-header.test.ts` |
| `tests/ui-standard.test.ts` | `tests/integration/ui-standard.test.ts` |
| `tests/ui.test.ts` | `tests/local-media/ui.test.ts` |
| `tests/wedge-end-offset.test.ts` | `tests/unit/wedge-end-offset.test.ts` |
| `tests/whole-rest-geometry.test.ts` | `tests/unit/whole-rest-geometry.test.ts` |
| `tests/whole-rest-layout.test.ts` | `tests/integration/whole-rest-layout.test.ts` |
| `scripts/source-files.mjs` | `scripts/checks/source-files.mjs` |
| `scripts/check-source-boundaries.mjs` | `scripts/checks/check-source-boundaries.mjs` |

<a id="restructuring-map--역할-분리와-최종-배치"></a>

### 역할 분리와 최종 배치

- `apps/editor/editor-view.ts`: 기존 정적 화면 구성.
- `editor-library.ts`: 목록과 최근 항목. 활성 자료·URL 수명은 main 소유.
- `editor-score-controls.ts`: 악보 영역 편집·마디 조작. 편집 세션과 저장 큐는 main에서 주입.
- `editor-lyrics.ts`: 가사 목록·페이지·편집 동작.
- `editor-review.ts`: 검수 렌더러·비동기 세대·캡처 해제.
- `editor-form.ts`: 입력값 수집·미반영 변경 판정·flush. snapshot과 저장 순서는 유지.
- `modules/playback/playback-tempo.ts`: BPM 표시·직접 입력·프리셋·변환의 공통 경로. 화면과 player의 소유자는 playback-screen으로 유지.
- `model/record.ts`, `model/audio-bar-one.ts`: 저장 구현과 분석 구현에서 공통 자료형만 추출. 기존 모듈의 type 재수출 유지.
- `shared/styles/controls.css`와 `modules/library/player-library.css`: 양쪽 앱이 직접 사용하던 CSS를 공통 위치로 배치.
- `shared/ui/marker-icon.ts`: 재생 기능에 의존하지 않는 공통 아이콘.
- 큰 CSS 두 개는 각각 인접한 styles 폴더의 6개 파일로 나누고 원래 순서로 import한다. 조각을 합친 바이트가 이동 전 CSS와 동일함을 SHA-256으로 확인했다.

제작기 진입점의 세션·미디어·저장·화면 전환은 앱 조립 계층에 남긴다. 줄 수를 줄이기 위해 수명과 저장 책임을 별도 전역 객체로 분산하지 않는다.

<a id="code-maintenance--코드-정리--2026-10-13"></a>

## 코드 정리 — 2026-10-13

문서 역할: **기록·참고**. 완료된 코드 정리 기록. 현행 구조는 [구조 Rule](../../reference/engineering/architecture.md#project-structure--프로젝트-구조)을 따른다.

- 목표: 기존 동작을 유지하며 중복 저장 변환·구간 처리와 불명확한 상수, 읽기 어려운 목록/조작 코드를 정리한다.
- 범위: src/platform/storage/storage.ts·practice-library.ts의 미디어 codec, player-app.ts의 목록 마크업/표시 helper, loop-slots.ts·marker-slots.ts·section-shortcuts.ts·score-gestures.ts의 가독성·상수.
- 완료 조건: 저장 bytes-v1 호환, 큐/트랜잭션 경계, 기존 목록 DOM/이벤트, 구간 FIFO·정렬·제스처를 보존하며 중복 경로를 공통 함수로 교체한다.
- 제외: 음원 분석 알고리즘·곡별 승인 보정 데이터 변경, 저장 데이터 마이그레이션/삭제, 화면 디자인 변경, 전면 포맷팅, 버전 상승·커밋·push·배포.
- 검증: diff·호출부 대조 후 사용자 허가 범위에서 타입 검사, 기존 집중 테스트, 전체 드럼 테스트, editor/player 빌드와 경계 검사를 수행한다. 허가 전 시험은 실행하지 않는다.


원문 출처: `docs/architecture/CODE-MAINTENANCE.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="code-maintenance--판단"></a>

### 판단

실제 중복인 Blob/ArrayBuffer 변환만 공통화한다. 제작기와 연습실의 snapshot 시점·저장 정책·트랜잭션은 각각 보존한다. 공통 값이더라도 서로 다른 제품 의미를 가진 마커 수·구간 수·섹션 수는 별도 상수로 유지한다. 곡별 마디·가사 보정은 단순 하드코딩으로 보고 삭제하지 않는다.

<a id="code-maintenance--적용-내용"></a>

### 적용 내용

- `src/platform/storage/stored-media.ts`: 두 저장소에서 반복하던 Blob/ArrayBuffer 변환과 PDF·음원·페이지 묶음 변환을 공통화했다. `bytes-v1` 형식, 대체 악보, 기존 Blob 레코드 읽기, 저장 전 snapshot/큐/트랜잭션은 유지했다.
- `src/modules/playback/loop-slots.ts`: 구간 등록·삭제 경로를 각각 한 함수로 모았다. 화면 정렬과 등록 시점 순서를 분리하는 기존 동작, 9개 표시 슬롯과 과거 10~12번 슬롯 호환을 유지했다. 슬롯 HTML은 상태별로 분리했다.
- 구간·바로가기 개수, 길게 누르기 시간, 터치 이동 기준, 끝마디 판정 여유값에 이름과 단위를 붙였다. 악보 터치 이동 기준은 선택/일반 제스처가 같은 상수를 참조한다.
- `src/apps/player/player-library-view.ts`: 한 줄에 몰려 있던 목록 화면 마크업을 별도 함수로 옮겼다. 목록 갱신 세대, 파일 선택 잠금, 이벤트와 저장 처리는 `player-app.ts`에 그대로 둔다.
- `src/apps/player/player-app.ts`: 다운로드 진행 문구와 제목 표시 순서를 공통 처리한다. 기본 악보 내용 비교는 별도 이름의 함수로 분리했다. 설정/즐겨찾기 저장 키를 상수화했다.
- 수정한 저장·슬롯·제스처·목록 파일만 포맷을 정리했다. 스타일·버전·데이터는 변경하지 않았다.

<a id="code-maintenance--검증-과정"></a>

### 검증 과정

사용자가 이번 코드 정리의 검사·테스트·빌드를 명시 허가했다. 기존 회귀 테스트를 사용했으며 테스트 조건이나 시간 제한을 완화하지 않았다.

첫 집중 검사에서 목록 상태 영역에 들어간 줄바꿈을 기존 테스트가 검출했다. 빈 요소는 계속 비어 있도록 수정했다. 첫 전체 실행의 BPM UI 테스트 1건은 빌드 동시 실행 중 5초 제한으로 시간 초과했다. 해당 UI·목록·구간 3파일 61테스트의 별도 재실행은 통과했다. 빌드 없이 재실행한 전체 테스트에서도 같은 UI 파일의 저장 대기가 시간 초과했고, 다음 테스트는 미복구된 BPM 상태로 실패했다. 시간 초과의 원인은 단정하지 않는다. 테스트 조건·시간 제한·전체 대상은 그대로 유지하고 동시 worker 수만 2로 제한하여 전체를 재실행했다.


전체 재실행(`npm run test:drum -- --maxWorkers=2`)은 111파일 629테스트가 모두 통과했다(36.98초). 기본 병렬 실행의 시간 초과와 구분해서 기록한다. 별도 실기기 GUI 검증은 수행하지 않았다.
최종 타입·i18n 검사, editor/player 빌드·경계 검사, 공통 재생/컴포넌트 검사가 통과했다. 기존 대형 번들 경고와 Node localStorage 경고는 남아 있다. 검사에서 생성한 JSON 보고서 4개는 결과 기록 후 삭제했다. 소스 빌드번호는 `4aada550473a`이며 앱 버전·커밋·push·발행은 변경하지 않았다.
