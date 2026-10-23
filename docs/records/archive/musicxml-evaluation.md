# MusicXML 비교·통합·문제 해결 기록

문서 역할: **사실·연구 기록**. 원문 날짜·입력·환경·결과·실패·미확인은 각 절의 당시 상태다. 이번 통합에서 과거 검증을 재실행하지 않았으며, 기록의 “현재”는 원래 작성 시점이다. [기록 안내](../README.md)와 [현행 정본](../../RULES-INDEX.md)을 구분한다.

<a id="musicxml-integration--pdf--musicxml-main-통합"></a>

## PDF → MusicXML main 통합

문서 역할: **기록·참고**. 과거 통합·자료 보존 기록. 실제 현재 루트와 Git 상태는 새 작업에서 다시 확인한다.

> 2026-10-02 통합 당시의 Git·검증·자료 보존 기록이다. 아래 HEAD·브랜치·clean 상태·테스트 수는 당시 결과이며 현재 checkout 상태를 뜻하지 않는다. 새 작업은 실제 루트 `/Users/raphael/Playground/drum-practice`에서 상태를 다시 확인하고 [변환 정책](../../reference/score/production.md#musicxml-conversion-policy--pdf--musicxml-변환-정책)을 따른다. 정리한 과거 작업 트리를 재생성하지 않는다.

- 목표: 전용 변환 도구·검증·실험 문서를 최신 main에 통합한다.
- 범위: codex/pdf-musicxml의 main 미포함 커밋 및 통합 검증.
- 완료 조건: main 병합, 집중 테스트·웹앱 테스트·HTML 생성 없는 빌드 통과, 로컬 자료 보존 후 작업 트리·브랜치 정리.
- 제외: GitHub·push·배포·HTML 재생 파일 생성/저장.
- 검증: XML 규격/리듬 검사, 오류 주입 및 XML 주석 회귀 검사, Vitest, TypeScript, Vite(publicDir 복사 제외).

시작 main d18f669, 변환 브랜치 2da4b58. main에 없는 커밋은1개. 두 작업 트리 tracked/untracked 상태는 깨끗했다. 변환 정책은 내용이 같아 최신 main 그대로 유지한다. 변환 코드는 곡 해시에 결합된 역사적 재현 도구이며 최신 웹앱 매핑/렌더러를 변경하지 않는다.

검토 수정: Audiveris XML의 part 아래 주석을 measure로 처리하던 비교 발췌 오류를 수정하고 회귀 검사를 추가했다.

현재 `npm run build`는 앱 코드만 빌드한다. 독립 HTML 템플릿 생성 단계는 제거했다. Vite의 index.html은 웹앱 진입점이다. 아래 검증 기록은 당시 실행 결과다.


원문 출처: `docs/architecture/MUSICXML-INTEGRATION.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="musicxml-integration--검증-결과와-자료-보존"></a>

### 검증 결과와 자료 보존

- main 통합 커밋: 3949f3c (d18f669를 부모로 포함하는 병합을 fast-forward 적용).
- 최신 웹앱 src/, package.json, AGENTS.md 및 변환 정책: 시작 main과 diff 없음.
- Python9검사 통과, 110마디/441박 MusicXML4.0 검증 통과.
- 원본 PDF에서 재추출·재출력한 MusicXML SHA256: d5033d473bef0a63d2ded5f2e09234b168b7306d1872fdce9981d9864516f8f6. 기존 후보와 동일.
- main의 드럼 앱 Vitest:64파일286테스트 통과 (`npm test -- --exclude 'guitar-practice/**'`). 단순 npm test는 별도 하위 guitar-practice 테스트까지 수집하여 다른 프로젝트의 fixture 경로 오류로 실패했으므로 해당 프로젝트만 제외했다. 이전 작업 트리 테스트는 누락된 Git 제외 데모/참조 자료를 연결한 뒤 통과했다.
- i18n 검사, TypeScript, playback 구조/공통컴포넌트/기존 번들 검사 통과. Vite publicDir:false 웹앱 빌드 통과(기존 큰 청크 경고). npm run build/portable 및 HTML 검토 생성기는 실행하지 않았다.
- 기존 로컬 자료5397파일을 해시 검증해 `/Users/raphael/Playground/drum-practice-local-archives/pdf-musicxml-worktree-20261002`에 보존했다. 2026-10-03 현재 보존 위치는 `/Users/raphael/Playground/drum-practice/local-archives/pdf-musicxml-worktree-20261002`다. manifest는 backup-manifest.json. 재사용할 실험자료는 실제 프로젝트 docs/experiments/musicxml 및 musicxml-comparison에도 복사했다. 보관된 venv의 절대 shebang은 역사 자료로 그대로 유지하며 실행환경으로 쓰지 않는다. 실행이 필요하면 현재 프로젝트에서 별도 가상환경을 재생성한다.
- 새 검증 로그는 docs/experiments/audiveris-20261002/, 재현 출력은 docs/experiments/pdf-musicxml-integration-repro/, 웹앱 빌드는 docs/experiments/pdf-musicxml-integration-build/에 보존한다.
- 남은 악보 품질 한계는 변환/비교 문서의 범위 그대로다. 이번 작업은 앱 재배포나 새 악보 확정이 아니다.

<a id="musicxml-comparison--두-musicxml의-원본-복원-품질-비교--2026-09-19"></a>

## 두 MusicXML의 원본 복원 품질 비교 — 2026-09-19

> Real Paradis 「風と丘のバラード」의 당시 두 결과물을 비교한 기록이다. 7마디·92음표 표본 점수는 전곡 정확도나 모델 전체 성능이 아니다. 과거 후보 매핑은 현재 [확정 매핑](../../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙)을 대체하지 않는다. 후속 Audiveris 비교와 새 변환 방식은 [변환 정책](../../reference/score/production.md#musicxml-conversion-policy--pdf--musicxml-변환-정책)을 따른다.

- 목표: 제공된 Claude 결과와 이 작업의 Codex 결과를 원본 PDF 기준으로 수치 비교한다.
- 범위: 두 파일 읽기, 스키마/구조 검사, 원본 표본 판독, 같은 렌더러의 발췌 대조.
- 완료 조건: 동일 산식, 분모/표본 공개, 구체 오류와 재현 가능한 검사 결과.
- 제외: 두 입력 악보 수정, 앱/가사/서버 변경, 모델 전체 성능 순위 추정.
- 검증: 원본 PDF를 기준으로 기록한 표본과 XML의 음표 이벤트 대조, XSD와 성부 길이 검사, PNG 직접 확인.


원문 출처: `docs/score-production/MUSICXML-COMPARISON.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="musicxml-comparison--결론"></a>

### 결론

**이 두 결과물에서는 Codex 파일이 원본 드럼 악보 복원에 뚜렷하게 우수하다.** Claude 파일의 주된 문제는 파일 서식보다 음악 내용의 단순화·변경이다. 마디별 박자 합계가 맞아도 원래 리듬과 같지는 않다.

제공 파일이 어떤 Claude 모델로, 어떤 프롬프트/입력 범위로 제작됐는지는 검증하지 않았다. 아래 판단은 `/Users/raphael/Downloads/kaze_to_oka_no_ballad_drums.musicxml` 파일 자체에만 적용한다.

<a id="musicxml-comparison--핵심-수치"></a>

### 핵심 수치

| 평가 항목 | Claude 제공 파일 | Codex 후보 파일 |
|---|---:|---:|
| 마디 포함 | 107/110 (97.3%) | 110/110 (100%) |
| 포함된 마디의 성부 길이·연속성 | 107/107 (100%) | 110/110 (100%) |
| 94 BPM·84마디 5/4 | 모두 보존 | 모두 보존 |
| 표본 음표 시작 위치 F1 | 67.03% | 100% |
| **표본 시작 위치 + 음가 F1** | **41.08%** | **100%** |
| 표본 시작 위치 + 음가 + 관례상 GM 악기 F1 | 16.22% | 100% |
| 원본 오선 위치·머리 형태까지 일치하는 표본 F1 | 10.81% | 100% |
| MusicXML 4.0 XSD | 실패 | 통과 |
| 72·100마디 6연음 표기/비율 | 0/2 | 2/2 |
| 7마디 장식음·붙임줄·트레몰로 | 0/3 | 3/3 |
| 반복기호 마디의 표기 | 0/6 | 6/6 |
| 첫 4마디 다중마디쉼표 표기 | 없음 | 있음 |

마디 포함 여부와 길이·메타데이터·기호 유무는 전체 파일을 검사했다. F1은 **5·7·9·12·72·84·100의 7개 표본 마디**에 한정한다. 일반 패턴, 도입부, 필인, 장식음, 5/4와 6연음을 의도적으로 포함한 진단 표본이며 무작위 표본이 아니다.

표본의 원본 일반 음표 머리는 92개다. 7마디 장식음 1개는 실제 연주 시점이 미지정이라 F1에서 제외하고 별도 보존 여부를 평가했다. Claude 표본에는 일반 머리 93개, Codex에는 92개가 있다.

주 지표는 `F1 = 2 × 일치한 음표 수 ÷ (원본 음표 수 + 후보 음표 수)`다. 마디와 분수 단위의 시작 위치/음가가 정확히 같아야 한다. 동시음의 머리는 각각 센다. 쉼표의 분할 방식이나 성부 ID의 이름은 주 지표에 포함하지 않아 동등한 표현을 불필요하게 감점하지 않는다. 시작 위치는 **기보상 음표 시작 위치**이며 붙임줄의 연결 음표도 포함한다. 실제 소리의 타격 수를 측정한 값은 아니다.

- Claude: 38개 일치, precision 38/93=40.86%, recall 38/92=41.30%, F1=76/185=41.08%.
- Codex: 92개 일치, precision/recall/F1 모두 100%.

원본에 악기 범례가 없으므로 GM 악기 지표는 관례에 따른 후보 매핑을 조건으로 한다. 특히 Ride/Cross stick/탐의 실제 종류는 확정하지 않았다. 오선 위치를 바꾼 동등한 악보도 있을 수 있으므로 엄격한 오선 위치 지표를 음악적 정확도의 주 지표로 사용하지 않는다. 주 결론은 이런 악기·배치 가정을 제외한 시작 위치+음가에서도 성립한다.

**100%는 이 표본과 평가 항목의 일치를 뜻한다. 전체 110마디의 음악적 정확도 100%나 외부 독립 심사 결과가 아니다.** 표본은 두 XML이나 기존 `extracted.json`에서 자동 생성하지 않고 원본 이미지를 확인해 별도 코드에 기록했다. 다만 같은 Codex 검토자가 자신의 기존 작업도 평가한 것이므로, 외부 검토자의 블라인드 평가와는 구분한다. 임의 가중치의 종합 품질 총점은 만들지 않았다.

<a id="musicxml-comparison--마디별-리듬-점수"></a>

### 마디별 리듬 점수

시작 위치+음가 F1. 악기 가정과 오선 위치를 제외한 값이다.

| 마디 | 원본의 특징 | 원본 머리 수 | Claude 머리 수 | Claude 점수 | Codex 점수 |
|---:|---|---:|---:|---:|---:|
| 5 | 점음표·쉼표가 섞인 도입부 | 6 | 13 | 21.05% | 100% |
| 7 | 트레몰로·붙임줄·장식음 | 7 + 장식음1 | 11 | 33.33% | 100% |
| 9 | 일반 패턴과 스네어 세부 음가 | 14 | 10 | 66.67% | 100% |
| 12 | 16분음표 필인 | 15 | 13 | 42.86% | 100% |
| 72 | 마지막 박 6연음 | 15 | 11 | 23.08% | 100% |
| 84 | 5/4와 스네어·탐 동시음 | 19 | 24 | 60.47% | 100% |
| 100 | 탐 필인과 6연음 | 16 | 11 | 22.22% | 100% |

<a id="musicxml-comparison--실제로-확인한-차이"></a>

### 실제로 확인한 차이

1. **끝 3마디 없음:** Claude XML은 1–107마디만 있다. 108·109·110은 없다. 합계는 429박이며 원본/Codex의 441박보다 12박 짧다. 처음 진행 안내에서 110마디라고 언급한 것은 실제 집계 전의 잘못된 설명이며 이 결과로 정정한다.
2. **9마디:** 원본의 C5 일반 머리 네 개가 있는 위치를 Claude가 재현하지 못했다. 상성부는 8분 심벌 8개로 단순화했다. 원본의 3박 뒤 반 박 위치에 있는 F4 킥은 Claude에서 스네어 음색/다른 오선 위치로 들어가 있다.
3. **84마디:** 박자표는 둘 다 5/4다. 그러나 원본은 상성부의 C5+A4 일반 머리 코드와 마지막 16분음표, 하성부 킥으로 이루어진다. Claude는 크래시 8회와 킥/스네어 동시음을 일정한 8분음표로 기록했다. 5박을 채웠다는 사실과 패턴 복원은 별개다.
4. **72·100마디:** 원본에 인쇄된 6연음 2개가 Claude에 없다. 두 곳 모두 다른 단순 패턴이다.
5. **기호:** Claude는 파일 전체에 점·장식음·붙임줄·트레몰로·튜플릿·반복표기·빔 요소가 없다. 빔은 렌더러가 자동 생성할 수도 있으므로 부재 자체를 틀린 음가로 계산하지 않았다. 이번 Verovio 발췌 렌더에서는 개별 깃발로 나타난다.
6. **스키마:** Claude 파일 35행의 두 번째 `score-instrument`가 이미 시작된 `midi-instrument` 뒤에 나온다. MusicXML 4.0 XSD의 요소 순서에 어긋난다. 입력 파일을 고치지 않은 채 Verovio가 받아들이기는 했으므로, 모든 악보 프로그램에서 열리지 않는다고 주장하지 않는다. 이 구조 오류를 수정해도 앞의 음악 내용 차이는 남는다.
7. **침묵과 반복:** Claude가 첫 4마디를 개별 4분쉼표들로 쓴 것은 소리의 침묵 자체를 바꾸지는 않는다. 다중마디쉼표 표기 충실도 차이다. 반복기호가 없다는 것과 해당 마디 자체가 없다는 것도 구분했다.

<a id="musicxml-comparison--렌더-대조와-보존"></a>

### 렌더 대조와 보존

동일 Verovio `6.3.0-425dd7b`와 같은 크기·설정으로 9·12·84마디를 발췌해 비교했다. 발췌 사본에서 두 파일 모두 제목/가사/방향 텍스트를 제거하고 같은 시스템 구분 및 필요한 divisions/time/clef를 제공했다. 음표·음가·악기·성부·빔은 바꾸지 않았다. 다중마디쉼표 같은 해당 구간 밖의 속성은 복사하지 않는다. 원본 두 파일의 해시는 실행 전후 동일하다.

출력은 worktree의 `docs/experiments/musicxml-comparison/`:

- `comparison.json`: 원시 측정값, 분모, 표본별 결과, 입력 해시.
- `comparison.html`: 원본 및 두 발췌 렌더를 읽는 대조 문서.
- `claude-render/page-1.png`, `codex-render/page-1.png`: 같은 조건의 3마디 렌더.
- `claude-excerpt.musicxml`, `codex-excerpt.musicxml`: 비교용 발췌 사본이며 원본을 대체하지 않는다.

입력 해시:

- Claude `0b9e83f23569c876c1f74d9a1ada1efbf903864bb443a318562db3a7f29d1381`.
- Codex `9d55247e7a12898d711e7f7da3da5cafc2a3f402e47a9920041c649d6e7802b7`.
- 기준 PDF `33a98caa89daee7c5d9d56f272f73f0f8f6e9cb6526fe80af6c5f798807bcefd`.

재현:

```sh
docs/experiments/musicxml/venv/bin/python tools/score-production/musicxml/compare.py \
  --claude /Users/raphael/Downloads/kaze_to_oka_no_ballad_drums.musicxml \
  --codex data/reference/musicxml/real-paradis-110-candidate.musicxml \
  --out docs/experiments/musicxml-comparison
```

현재 목적의 원본 복원 기반으로는 Codex 파일을 선택하는 것이 타당하다. Codex 역시 악기 매핑 확정, 전체 별도 수동 재전사에 의한 이중 검증, 다른 소비자의 재생 확인은 남아 있다.

후속 상태: 사용자 제공 제목·제작자 정보 반영으로 현재 Codex MusicXML 메타데이터가 변경됐다. 이 비교에 사용한 정확한 파일은 `docs/experiments/musicxml/before-creator-metadata/real-paradis-110-candidate.musicxml`에 보존되어 있다. 음악 데이터(`part`, `part-list`)는 변경되지 않았다. 이 문서의 비교 해시는 비교 당시 상태를 유지한다.

<a id="musicxml-troubleshooting--악보-변환-문제-해결-기록"></a>

## 악보 변환 문제 해결 기록

2026-10-03 사용자 지시로 관리 시작. 막히면 **정본 문서 → 과거 악보 제작 세션 → 웹** 순서로 확인하고 해결한 내용을 반드시 기록한다. 상세 절차는 [변환 정책](../../reference/score/production.md#musicxml-conversion-policy--pdf--musicxml-변환-정책)을 따른다.


원문 출처: `docs/score-production/MUSICXML-TROUBLESHOOTING.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="score-process-evidence--제작-프로세스-정리-당시-근거"></a>

## 제작 프로세스 정리 당시 근거

문서 역할: **사실 기록**. 날짜·입력·버전·한계는 당시 관측이다. 현행 요구는 [Rule 목록](../../RULES-INDEX.md), 실행 순서는 [절차 목록](../../README.md)을 따른다. 아래 검증을 이번 문서 정리에서 다시 실행하지 않았다. 삭제된 Git 제외 증거의 존재를 보장하지 않는다.


원문 출처: `docs/records/SCORE-PROCESS-EVIDENCE.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="score-process-evidence--이관-원문--score-production-processmd--15"></a>

#### 이관 원문 — SCORE-PRODUCTION-PROCESS.md / 15

출처: [docs/score-production/SCORE-PRODUCTION-PROCESS.md](../../how-to/produce-score.md#score-production-process--악보-제작-프로세스). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="score-process-evidence--두-제작에서-확인한-근거와-재발-방지"></a>

###### 두 제작에서 확인한 근거와 재발 방지

아래는 **그 시점의 경험과 교훈**이다. 현재 정본의 매핑·조판 정책이나 현재 수록 파일 해시를 대신하지 않는다.

곡별 표의 원문 행은 [Real Paradis](../songs/real-paradis.md#score-process-evidence--real-paradis-comparison)와 [Loveholic](../songs/loveholic.md#score-process-evidence--loveholic-comparison)에 분리했다. 동일 행을 이곳에 복제하지 않는다.

<a id="score-process-evidence--이관-원문--score-production-processmd--16"></a>

#### 이관 원문 — SCORE-PRODUCTION-PROCESS.md / 16

출처: [docs/score-production/SCORE-PRODUCTION-PROCESS.md](../../how-to/produce-score.md#score-production-process--악보-제작-프로세스). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="score-process-evidence--확인한-자료와-현재-미확인-사항--2026-10-04"></a>

### 두 곡 공동 관측 범위

[2026-10-04 당시 공동 확인·미확인 원문](../production-tools.md#score-process-evidence--확인한-자료와-현재-미확인-사항--2026-10-04). 이 문서의 조회 상태와 당시 관측을 구분한다.
