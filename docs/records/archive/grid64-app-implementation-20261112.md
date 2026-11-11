# 64분음표 공통 기본 단위 — 앱 반영

현재 상태(2026-11-12): [줄기 폭 초기화 보완과 최종 6곡의 로컬 수록](#grid64-app-final-local-integration)까지 확인했다. 아래 내용은 단계별 당시 범위·결과이며, 초기의 public 교체 제외와 읽기 전용 조사 상태를 최종 상태로 해석하지 않는다. 공개 배포와 사용자 보관함 갱신은 수행하지 않았다.

- 목표: [승인된 공통 기본 단위](../../reference/score/production.md#score-production-rules--오선-부착-표기의-공통-기본단위)를 두 앱의 균등 조판과 가사 편집에 반영한다.
- 범위: [후속 교정 계획](../../plans/canonical-corrections-20261112.md)의 앱 담당 항목인 공통 좌표·진행선·캐시, 가사 위치/길이 입력·저장 연결과 관련 기존 검사.
- 완료 조건: 사분음표당16칸의 같은 좌표식을 소비하고 1/16 quarter와 기존 분수 위치·길이를 편집/저장 경로에서 임의 반올림하지 않는다. 기존 `grid.tick` 저장 단위와 정본 소유권은 유지한다.
- 제외: 정본·제작 도구·Rule·history.md의 동시 수정, public 패키지 교체, 사용자 DB 변경, 버전 인상·커밋·push·배포.
- 검증: 변경 코드 집중 lint·서식, 앱/테스트 타입·구조·i18n·문서·링크·앵커 정적 검사와 실제 입력의 읽기 전용 대조. 새 합성 데이터/시험 DB·화면·청취·실행 회귀는 이번 앱 단계에서 생성/수행하지 않는다.

## 시작 상태

- 작업 루트: `/Users/raphael/Playground/drum-practice`, `main`, HEAD `1a49a2b489e68bbc9b8d965db558685d0d679dfe`.
- 기존 미커밋 Rule·제작 도구·기록은 제작자가 관리한다. 앱 소스·수록본의 변경 전 해시는 `.tmp/grid64-app-20261112/before.json`에 보존한다.
- Node26.13.0·pnpm12.18.0, 설치된 TypeScript·OSMD·기존 의존성을 사용한다. 추가 설치나 다른 개발 포트는 사용하지 않는다.

## 확인한 경로

- 균등 음표/가사 배치는 `ribbon-engraving.ts`의 `gridPosition`을, 진행선은 `playback-track.ts`·`playback-frame.ts`에서 `gridPhase`를 공유한다. 기본 시간 간격은 공통 상수로 연결하고, 저장된 SVG·좌표의 캐시 정책도 함께 바꾼다.
- 가사 편집의 선택 목록과 `editor-form.ts`의 저장 전 반영은 ¼박 간격과 마디 끝−1tick을 가정했다. `scorePosition`에서 정확한 위치를 먼저 읽고, 저장된 tick의 단위(박의¼)는 유지한 채 분수 tick으로 64분음표 위치를 표현한다.
- `nearestQuarterBeat`는 기존 시간 기반 이관·위치 복사의 빠른 조작 단위다. 새 입력 정밀도와 분리하고 기존 이관/교정 자료의 tick을 재해석하지 않는다.

## 결과

### 코드 변경

- `src/model/notation-grid.ts`의 `NOTATION_STEPS_PER_QUARTER=16`을 균등 조판과 가사 편집이 함께 사용한다. `gridPhase`는 `(quarter×16+0.5)/(duration×16)`이며 분수 quarter를 반올림하지 않는다. `gridPosition`을 사용하는 native 음표/가사와 기존 진행선 두 경로가 같은 식을 사용한다. 기호의 native 시간 앵커는 이 조판의 좌표를 소비하며 개별 픽셀 보정은 추가하지 않았다.
- `musicxml-geometry.ts`도 `gridPhase`를 직접 사용한다. 머리 왼쪽 위치에 다시 고정6을 더하던 중복 환산을 제거했다. `score-render-cache.ts`의 공통 정책을 `v45-grid64`로 올려 전체 보기와 연주용 파생 자료의 이전 캐시 키를 구분한다. 마디/음표 원본 데이터와 ribbon 메타데이터 형식은 유지한다.
- `lyric-grid.ts`에 정확한 `scorePosition` 우선 조회, 64분음표 선택 목록, 박자별 tick 변환과 다른 마디로 이동할 때의 범위 처리를 모았다. 4/4에서는 기존tick의¼, 6/8에서는½이 한64분음표다. 기존 정수 tick·시간 기반 이관·빠른 위치 복사는 다른 의미로 바꾸지 않았다.
- `editor-lyrics.ts`는 64분음표 목록에 원본의 분수 위치·마디 끝 값을 별도 반올림 없이 포함한다. 길이 입력은 박자에 맞는64분음표 step을 사용하고 기존 분수 리듬에는 `step="any"`를 적용한다. 마디를 옮겨도 새 마디 범위 안에 있는 더 세밀한 위치를 자르지 않는다.
- `editor-form.ts`의 저장 전 반영도 같은 helper를 쓴다. 문구·확인 상태만 바뀌었으면 시작/길이를 재작성하지 않는다. 현재 마디 마지막¼박 안의 위치를 이전 한계로 자르는 처리를 제거했다.
- 기존 `ribbon-density.test.ts`의32분음표 기대값을64분음표로 갱신했다. 새 fixture·DB·시험용 악보는 만들지 않았으며 해당 회귀의 실행 결과로 보고하지 않는다. `model.ts`의 tick 단위 주석과 위치 오류 문구도 실제 계약에 맞췄다.

### 저장 경로 검토와 실제 자료 대조

- `canonical-lyric-voice.ts`는 변경하지 않았다. 현재 `LYRIC_DIVISIONS=9600`에서64분음표는600단위이며, 기존 divisions와 공통배수를 구해 음표 duration·backup·forward·direction offset을 함께 환산하는 경로를 확인했다. 기존 단위가 가사 경계를 표현할 수 있으면 그대로 사용한다. `canonical-lyric-read.ts`도 duration/divisions와 소유 note ID로 읽으며 새 격자에 맞추는 반올림을 하지 않는다.
- `.tmp/grid64-app-20261112/source-inspection.json`에서 수록6패키지·587마디·1,085음절을 읽었다. source와 canonicalXML 일치,64분음표 기준 가사 위치/길이 이탈0, 기존 divisions4·48·96과9600의 공통배수 관계를 확인했다.6패키지는 시작 해시와 같다.
- 이 실제 가사는 모두32분음표 단위로도 표현 가능하다. 따라서 이 대조를 **새64분음표 가사 입력·저장 왕복의 실행 검증**으로 확대하지 않는다. 셋잇단 등 기존 분수 리듬의 실제 저장 왕복과 새 조판 화면은 이번에 실행하지 않았다.

### 정적 검사와 남은 확인

- 통과: 변경 코드 ESLint·Prettier, `pnpm run typecheck:app`의 앱/테스트 타입, `pnpm run check:playback`의 재생 소유권·공통 컴포넌트·소스 경계, `pnpm run check:i18n`. 최종 경계 처리 보완 뒤 관련lint·타입을 다시 확인했으며 변경 없는 다른 검사 결과는 재사용했다.
- 문서·링크·앵커·diff와 변경 범위 보존도 통과했다. 문서170개·로컬 링크4,777개·Markdown 앵커3,467개를 확인했으며 검사 범위 밖의 외부/절대경로와 보존된 과거 주소는 별도다. 로그와 최종 입력 해시는 `.tmp/grid64-app-20261112/`에 둔다.
- 앱 버전은0.11.4를 유지한다. 소스 빌드번호는 타입 검사 준비 단계의 `scripts/build/build-info.mjs`로 갱신했다. 검사 시 빌드번호는 `5cb605629fbe`이며 동시 진행 중인 제작 도구 변경을 포함한 최종 통합 단계에서는 새 입력 기준으로 갱신해야 한다.
- 정본·public·DB·Rule·history.md를 수정하지 않았고 GUI·실행 회귀·두 앱 번들 빌드·커밋·push·발행은 하지 않았다. 제작자는 이 결과를 통합 기록에 반영하고 코드가 고정된 후보로 SVG/영향 보기 검수를 이어간다.

## 후속: 제작 검수용 인쇄형 조판 진입점

- 목표: 표시 offset 후보 탐색에서 사용하지 않는 연주 보기 3개의 반복 생성을 생략한다.
- 범위: `src/modules/score/musicxml.ts`와 이 기록. 제작 도구의 호출 변경은 악보제작자가 담당한다.
- 완료 조건: 공개 `renderPrintedScore(blob, progress, partId?)`가 기존 인쇄형 경로로 한 번 조판하고, 기존 전체 API는 같은 준비 함수를 재사용한다.
- 제외: 조판 규칙·정본·수록 패키지·Rule·history.md·UI·기존 캐시 계약 변경, 새 시험 자료 생성, 커밋·push·발행.
- 검증: 집중 ESLint·Prettier, 앱 타입·소스 경계·문서 링크 정적 검사. 실제 후보 탐색 시간과 최종 XML의 전체 보기 출력은 제작자의 후속 검수에서 확인한다.

`prepareMusicXMLRenderer`에 기존 `prepareScoreLyrics` 준비와 `renderMusicXMLPass` 호출을 그대로 모았다. 새 공개 API는 MusicXML/MXL Blob과 선택 파트를 읽고 이 함수를 timeline 없이 한 번 호출한다. 반환값은 기존 인쇄형 pass의 `pages`, `regions`, `parsed`, `staffs`, `spacing`이며, 첫 SVG에 연주용 timeline metadata를 추가하지 않고 영속 캐시도 읽거나 쓰지 않는다. 글꼴 로딩·임베딩·압축·좌표 추출·임시 host 정리는 기존 pass를 재사용한다.

`renderMusicXML`의 기존 네 보기 생성·metadata 구성·캐시 키와 `renderFullScore`의 연속 보기 경로는 유지했다. 이 보완은 제작용 후보 탐색 API이며, 최종 정본은 기존 전체 API로 다시 열어 모든 보기를 검수해야 한다. 근거와 검사 로그는 `.tmp/grid64-app-20261112/printed-entry/`에 기록한다.

집중 ESLint·Prettier, `typecheck:app`, `check:structure`, `check:docs`, `git diff --check`를 통과했다. 소스 경계는 209개 파일·866개 참조, 문서는 171개·로컬 링크 4,786개·앵커 3,469개를 확인했다. 이 추가 작업의 소스 빌드번호는 `3ecc966f2695`다. 앱 버전은 0.11.4이며, 새 조판 API의 실제 실행·속도·출력 비교와 제작 도구의 호출 전환은 이번 정적 검사 결과에 포함하지 않는다.

## 후속: 가사 기본 글꼴의 저장 왕복

- 목표: 가사 소유 성부를 다시 쓸 때 정본의 기본 글꼴을 가사 텍스트에도 기록한다.
- 범위: `canonical-lyric-voice.ts`와 이 기록. 정본·수록 패키지·제작 도구·Rule·history.md는 악보제작자가 담당한다.
- 완료 조건: `defaults > lyric-font/@font-family`를 새 `lyric > text`에 기록하고, 기본 글꼴이 없는 입력의 기존 출력은 유지한다. 위치·길이·ID·확인 상태·드럼은 바꾸지 않는다.
- 제외: 앱 전역 글꼴 강제 지정, 새 합성 자료·시험 DB 생성, GUI·정본·public 변경, 커밋·push·배포.
- 검증: 실제 조판 XML과 기존 정본의 메모리 왕복, 기존 정본 검사, 집중 lint·서식·타입·문서 검사. 소스 수정은 진행 중인 조판의 `render.json` 저장 후에만 시작한다.

`data/production/canonical-corrections-20261112/layout-artifacts/osmd-render/render.json`이 2026-11-12 05:06:47 KST에 7,104,879바이트로 저장된 것을 확인했다. 보고서 전체 상태는 `PARTIAL`이며, 이번 검사에는 가사 있는 세 곡의 저장된 XML을 사용한다. 이는 다른 두 연습곡의 조판 실패를 통과로 바꾸는 검사가 아니다.

수정 전 실제 조판 XML을 읽고 다시 쓰면 Real Paradis 515개·Loveholic 269개·갑자기 301개의 명시적 가사 글꼴이 모두 사라지는 것을 재현했다. 기본 글꼴 없는 기존 Real Paradis·Loveholic 정본도 비교 대상으로 확보했다. writer는 기본 글꼴 문자열만 읽어 새 가사 텍스트 속성에 전달하며, 전역 `SCORE_TEXT_FONT_FAMILY`를 참조하거나 기본값을 만들어 넣지 않는다. 근거와 검사 로그는 `.tmp/grid64-app-20261112/lyric-font/`에 둔다.

수정 후 세 곡의 1,085개 글꼴 속성이 모두 보존됐다. 실제 입력 5건 모두 전체 `Song` 재읽기(가사 위치·길이·ID·확인 상태 포함), 드럼 표기, 반복 저장을 통과했다. 수정 전후 writer 출력의 XML 구조를 비교해 가사 `font-family` 이외 차이가 없음을 확인했고, 기본 글꼴 없는 두 입력은 출력 바이트도 동일했다. `canonical-shared-voice.test.ts`의 기존 실제 자료 검사 3개(v1 전환·반복 저장·구형 조판용 사본)도 통과했다. 새 합성 입력이나 DB는 생성하지 않았으며 XML·Song 변환은 메모리에서만 수행했다.

집중 ESLint·Prettier, `typecheck:app`, `check:docs`, `git diff --check`를 통과했다. 문서 171개·로컬 링크 4,788개·앵커 3,469개를 확인했다. 소스 빌드번호는 `b7d12b09c6ca`, 앱 버전은 0.11.4다. 이번 단계는 실제 저장 왕복과 정적 검증이며, 새 화면 조판·전체 릴리스 검사·커밋·push·발행은 실행하지 않았다.

## 후속: 승인된 64분음표 정밀도 검사

- 목표: 앞선 실제 자료에 없었던 64분음표 가사 위치·길이와 편집 보존 경로를 검증한다.
- 범위: `tests/unit/lyric-grid.test.ts`의 집중 보완, `tests/integration/canonical-lyric-precision.test.ts`, 기존 3연음 왕복 검사 1개와 이 기록.
- 완료 조건: 1/16 quarter 시작·길이, 마디 마지막 1/16 quarter, divisions 환산, 기존 3연음 분수와 문구·확인 상태 변경 시 시간값을 보존한다.
- 제외: 앱 소스·빌드번호·정본·public·제작 도구·Rule·history.md 변경, 시험 DB·사용자 보관함, GUI·전체 회귀·버전 인상·커밋·push·발행.
- 검증 허가: 악보제작자 채팅의 사용자 메시지 `01a1cc4b-bf93-7f61-a495-da9bd53535a4`에서 앞서 질의한 세 항목을 모두 승인했다. 세 번째인 최소 64분음표 합성 자료의 로컬 검사에 따라 메모리 Song·XML·JSDOM만 사용했다. PDF 네 빔·깃발·쉼표 검사는 제작자가 담당한다.

최초 조판 대기 파일 `final-render-artifacts/preplay-warmup/osmd-render/render.json`은 2026-11-12 05:28:33 KST에 626,930바이트로 저장된 것을 확인했다. 이후 제작자가 승인 후 두 곡을 다시 조판하면서 `final-render-artifacts/ioi-suddenly-approved/osmd-render/render.json` 저장까지 소스·빌드번호 변경을 미루도록 요청했다. 이번 검사는 테스트·기록만 수정했으며 생성 준비나 HMR을 유발하는 앱 수정은 수행하지 않았다.

| 검사                                      | 확인한 경로                                                                                                                                                                                           | 실행 결과                          |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `lyric-grid.test.ts`                      | 4/4·6/8의 64분음표 선택 간격·마지막 위치, 오래된 grid/time보다 scorePosition 우선, 3연음 분수 선택·이동, 마디 변경 시 범위 처리                                                                       | 기존 5개 + 추가 4개 통과           |
| `canonical-lyric-precision.test.ts`       | 같은 4/4 마디의 1/16·63/16 quarter 시작과 1/16 quarter 길이 저장·재읽기. divisions 12→9600 환산 후 가사 duration 600, 기존 드럼 duration·backup·forward·direction offset과 3:2 time-modification 보존 | 추가 1개 통과                      |
| 같은 파일의 편집 폼 검사                  | 마디 마지막 64분음표와 3연음에서 문구만 수정, 이어서 확인 상태만 수정. `flushEditorForm` 전후 가사 시작·길이·time/end·grid가 그대로인지 전체 Lyric 비교                                               | 추가 2개 통과                      |
| `canonical-xml.test.ts`의 기존 3연음 항목 | 1/3 quarter 시작·2/3 quarter 길이를 가져오기→저장→재읽기에서 유지                                                                                                                                     | 선택한 1개 통과, 나머지 8개 비실행 |

실행한 명령은 다음과 같다. 총 13개가 통과했으며 3연음 writer 검사는 기존 항목을 사용해 새 검사와 중복시키지 않았다.

```sh
pnpm exec vitest run tests/unit/lyric-grid.test.ts tests/integration/canonical-lyric-precision.test.ts
pnpm exec vitest run tests/local-media/canonical-xml.test.ts -t "imports exact vocal triplet rhythm"
pnpm exec eslint tests/unit/lyric-grid.test.ts tests/integration/canonical-lyric-precision.test.ts
pnpm exec tsc --noEmit
```

Node 26.13.0·pnpm 12.18.0·Vitest 5.1.0을 사용했다. 집중 ESLint와 앱·테스트 타입 검사를 통과했다. 타입 검사는 기존 생성 입력을 사용해 `typecheck:app`의 본체인 `tsc --noEmit`만 실행하고, 빌드번호를 다시 쓰는 `pretypecheck:app`은 실행하지 않았다. 실제 화면 조판·편집 UI 조작·PDF 판독의 성공을 이 결과로 대신하지 않는다. 승인·대기 파일·변경 전 해시, 명령별 결과와 로그는 `.tmp/grid64-app-20261112/precision/`에 보존한다.

테스트·기록의 Prettier, `check:docs`, `git diff --check`도 통과했다. 문서 171개·로컬 링크 4,789개·Markdown 앵커 3,470개를 확인했다. 이번 검사 시작 시 기록한 소스 해시는 그대로이며, 빌드정보 `bf7d7fcab846`의 수정 시각도 검사 시작 전인 05:18:19 KST로 유지됐다. 앱 수정이 필요한 검사 실패는 없었다. 신규 검사 파일을 포함한 이번 변경은 테스트 2개와 이 기록뿐이며, 앞선 앱 구현과 제작자의 동시 변경은 보존했다.

## 후속: 균등 보기 경계와 R/L 공통 글꼴

- 목표: 64분음표 균등 보기에서 첫 음표머리의 잘림을 없애고 R/L에 승인된 공통 글꼴을 적용한다.
- 범위: 공통 마디 표시·행 폭·CSS, R/L 글꼴 상수와 파생 캐시 정책, 집중 회귀와 이 기록. 제작자가 정본·전체 SVG·최종 패키지·Rule·history.md를 담당한다.
- 완료 조건: `gridPhase(0, 4)=1/128`과 원본 SVG 좌표를 유지하고 표시 경계의 잉크만 허용한다. R/L의 16px·중앙 정렬·실제 음표 기둥 기준 위치는 유지한다.
- 제외: XML·정본·public·원본 음원·사용자 DB 변경, 앱 버전 인상·커밋·push·발행. 전체 SVG 재생성은 제작자가 이어서 수행한다.
- 검증: 제작자가 요청한 실제 후보의 SVG/DOM·화면 비교, 앞서 승인한 최소 메모리 검사와 집중 정적 검사. iOS·청취·실계정 QA나 전체 릴리스 검사로 확대하지 않는다.

### 원인과 변경

Real Paradis 17마디의 native grid SVG는 폭 1,565이며 마디 왼쪽 경계는 `x=50`이다. 첫 X 음표머리의 `getBBox()`는 `x=46.880001…`, 폭 `11.399997…`로 원본 안에 완전하게 남아 있다. 300px 마디에서는 왼쪽 약 2.54px가 표시 경계 밖이다. 마디의 가로 `clip-path`와 안쪽 SVG의 기본 `overflow:hidden`이 이를 잘랐다. 정본·가사 시작값·그리드 좌표 오류가 아니다.

`practiceStaffLayout`이 계산한 화면상 오선 한 칸을 재사용해 균등 SVG에만 좌우 잉크 여유를 준다. 세로 마스크와 `<image>` 좌표·SVG viewBox·진행선 계산은 바꾸지 않는다. 2줄의 바깥 화면 경계에서도 잘리지 않도록 네 마디와 좌우 한 칸이 화면 폭 안에 함께 들어가게 계산한다. 기존 행 폭 CSS를 공통 위치로 옮겨 두 호스트가 같은 계산을 쓴다. 1줄의 스크롤과 일반 모드·PDF의 마디 폭은 유지한다. 페이지 Blob 공유와 현재 마디의 음표 효과 SVG 재사용도 유지한다.

R/L은 정본의 글꼴과 무관하게 `drum-notation.ts`에서 `serif`를 지정하고 있었다. 이를 기존 `SCORE_TEXT_FONT_FAMILY`(`Pretendard`)로 바꿨다. 크기 16px, `text-anchor="middle"`, `getStemX()`와 기둥 상단에서 9단위 위의 위치는 그대로다.

### v45 출력 재사용 판정

캐시 정책을 `drum-print-ribbon-v46-sticking-font`로 갱신했다. 이는 R/L 글꼴 변경을 위한 갱신이다. crop 변경은 런타임 DOM/CSS이며 생성된 SVG 바이트를 바꾸지 않는다. 정책 문자열은 캐시 키에만 들어가며 SVG 본문에는 기록하지 않는다.

실제 후보의 XML과 파생 SVG를 읽어 일반 4곡(Real Paradis·갑자기·붉은 노을·Loveholic)의 R/L 지시문과 `data-sticking`이 모두 0개임을 확인했다. v45 이후 조판 출력 경로의 변경은 `rule.sticking` 분기 안의 글꼴 속성 한 곳뿐이다. 따라서 같은 입력·환경의 이 네 곡은 그 변경 분기를 실행하지 않으며, **v45 SVG 파일의 기존 바이트를 그대로 재사용할 수 있다**. 이는 입력·코드 영향에 따른 재사용 판정이다. v46으로 네 곡을 다시 조판해 바이트를 대조한 실행 결과를 뜻하지 않는다.

두 연습곡에는 R/L이 각각 288개·880개(합계 1,168개) 있어 재생성이 필요하다. 기존 패키지의 네 보기에는 각각 1,152개·3,520개의 `data-sticking`이 있었다. 제작자는 두 곡의 전체 SVG와 연주용 파생 출력을 재생성하고 최종 패키지의 policy·검증 해시를 기록한다. 앱의 전역 캐시 키는 네 일반 곡에도 변경되므로 기존 브라우저 v45 캐시는 다음 조판에서 사용되지 않는다. DB를 삭제하거나 저장 악보를 이관하지 않는다.

### 검증과 한계

집중 회귀 23개를 통과했다: 새 crop 검사 3개, 기존 R/L 4개, staff 배치 10개, ribbon 좌표 6개. 새 검사는 1줄·2줄의 좌우 잉크 허용, 세로 마스크·SVG 좌표 보존, 일반/PDF 제외, 네 동일 폭 마디와 양끝 여유, `1/128` 진행선 위치를 확인한다. 최초 실행의 새 테스트에서 CSSOM의 inset 축약·반올림과 불완전 Song 타입 선언 문제가 나와 검사 코드를 수정했고, 실패한 파일만 재실행해 3개를 통과했다. 앱 타입 검사도 다시 통과했다. 시험 DB는 만들지 않았다.

Safari MCP에서는 실제 SVG/DOM 좌표를 확인했지만 캡처가 검정 화면으로 나와 시각 검증 증거로 사용하지 않았다. `ego-browser` Chromium에서 같은 로컬 실제 후보와 운영 공통 track/CSS를 사용하는 메모리 화면으로 이어서 확인했다. 전체 앱 부팅이나 보관함 쓰기는 하지 않았다.

| 실제 후보·보기                    | 확인한 내용                                                                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Real Paradis 17–24마디, 2줄 균등  | 좁은 665px·넓은 1,248px stage에서 첫 X 전체가 보인다. 넓은 화면의 마디 폭 307.828877px·바깥 여유 약 8.34225px·시작 비율 0.0078125. |
| Real Paradis 17마디부터, 1줄 균등 | 첫 X 전체 노출. SVG 좌표·중앙 진행 위치를 유지한다.                                                                                |
| 갑자기 37–44마디, 2줄 균등        | 쉼표·38마디 A·가사·42마디 첫 X를 확인했다. 인접 시스템의 불필요한 표기는 유입되지 않는다.                                          |
| 붉은 노을 105–112마디, 2줄 균등   | 첫 X·Chorus 5·지시문·다음 줄을 확인했다. 정지와 재생 상태의 배치 모두 두 줄이다.                                                   |

재생 상태는 공통 컴포넌트의 배치 확인이며 실제 오디오 재생·연속 행 전환·관성 스크롤 검사가 아니다. 검사 화면의 최초 재생 배치는 `uniform-spacing` 클래스 누락으로 잘못 보였고, 실제 앱과 같은 클래스를 적용한 `red-sunset-playing-layout-final.png`를 최종 근거로 삼았다. 전곡 가사의 글자 충돌 여부나 R/L 새 출력의 시각 검수를 이번 crop 결과로 대신하지 않는다.

집중 ESLint·Prettier, 앱/테스트 타입, `check:playback`, `git diff --check`를 통과했다. 통합 `check:docs`는 동시 작성 중인 [제작 기록](canonical-corrections-20261112.md)의 65–70행에 추가된 추적 제외 자료 링크 18개 때문에 실패했다. 대상은 여섯 곡의 로컬 XML·전체 SVG·패키지다. 해당 파일의 존재와 Git 소스 스냅샷에 포함되는지는 서로 다른 조건이다. 제작자가 로컬 근거를 일반 경로 표기로 정리하는 등 문서 검사 계약에 맞춰 마무리해야 하며, 이번 앱 수정에서 그 담당 기록은 바꾸지 않았다. 문서 검사를 통과로 보고하지 않는다.

코드·검사·화면의 근거는 `.tmp/grid64-app-20261112/crop/`의 변경 전 사본, 실행 로그, `sticking-input-audit.json`, 화면 계측 JSON과 PNG에 둔다. 후보·public 패키지 12개의 해시는 변경 전과 같다. 앱 버전은 0.11.4, 이번 소스 빌드번호는 `b1e973a67886`이다. 소스·빌드번호 변경은 여기서 종료하며 제작자의 후속 두 연습곡 조판과 병행해 이 기록·검사 로그만 정리한다.

## 후속: 탐탐 재조판의 냉시작 차이 — 읽기 전용 조사

제작자는 `font-refresh-first-attempt.json`에 탐탐 첫 후보와 public renderer 재열기의 음표 노드 624개 중 8번 줄기 경로가 `M133 245.5L133 211.25` → `M133 245.5L133 211`로 달라진 실패를 보존했다. 같은 Safari 페이지의 후속 print-only 2회는 줄기 끝 211과 전체 서명 `dc545db4406ae3de5ad1c462c5e14695e7ba847d7e8d6b877761b8d2a0c54b56`이 같았다고 인계했다. 최초 실패 파일은 직접 읽었고, 후속 2회의 실행은 제작자 보고이며 이 앱 단계에서 다시 실행하지 않았다.

범위는 설치된 OSMD 2.3.0/VexFlow와 공통 조판 코드의 읽기 전용 조사다. 앱 소스·빌드번호·정본·제작 도구·비교 허용치를 변경하지 않는다. 확인된 근거는 다음과 같다.

1. VexFlow의 모듈 공용 `STEM_WIDTH` 초기값은 1.5다. `Stem.WIDTH` getter가 이 값을 읽는다. 앱은 `musicxml-engine.ts`에서 OSMD 인스턴스의 `EngravingRules.StemWidth`를 0.1로 설정한다.
2. OSMD `VexFlowMusicSheetDrawer.drawSheet()`가 `Flow.STEM_WIDTH = rules.StemWidth * unitInPixels`를 수행한다. `unitInPixels=10`이므로 실제 전역 값은 1이 된다. 앱의 규칙 대입 시점에 이 전역 변수가 즉시 변경되는 코드는 없다.
3. OSMD `render()`는 `graphic.reCalculate()` 뒤에 `drawer.drawSheet()`를 호출한다. 앞선 레이아웃 경로에는 빔의 `postFormat()`을 실행하는 경로가 있다. VexFlow `Beam.applyStemExtensions()`는 줄기의 `renderHeightAdjustment=-Stem.WIDTH/2`를 저장하며, `postFormat()`은 `postFormatted`이면 다시 계산하지 않는다. 그리기 때 줄기 끝에는 저장된 `renderHeightAdjustment`가 적용된다.
4. 따라서 첫 조판의 1.5/2와 이후 조판의 1/2 보정 차이는 정확히 0.25다. **전역 줄기 폭이 레이아웃 이후에 갱신되는 실행 순서가 가장 구체적인 원인 후보**이며, 제작자의 냉시작 211.25·후속 211 관측과 일치한다. 이 조사에서는 실제 최초 호출의 전역 값·빔 보정값을 계측하지 않았으므로 실행 인과 확정과 구분한다.

이 빔 처리·전역 설정 코드는 프로젝트 OSMD 패치의 변경 전과 후 모두에 있다. 이번 R/L 글꼴 변경이 새로 만든 전역 설정은 아니다. 공통 `installDrumBeams`는 해당 OSMD 계산기·마디·빔 인스턴스를 감싸며 전역 `STEM_WIDTH`를 설정하지 않는다.

두 공개 조판 진입점은 모두 `renderMusicXMLPass`에서 `loadScoreTextFonts()`를 기다린 뒤 엔진을 실행한다. 이 함수는 Pretendard 400·700의 `document.fonts.load()` 완료와 실제 글꼴 face 존재를 확인한다. R/L 텍스트 추가는 `osmd.render()` 뒤다. 현재 근거로는 Pretendard 로딩이나 R/L 글꼴을 줄기 경로 차이의 원인으로 단정할 수 없다.

제작 측에서 추가로 좁힐 값은 새 페이지의 첫 빔 `postFormat` 전후 `Stem.WIDTH`·`renderHeightAdjustment`, 첫 `drawSheet` 전후 전역 폭, 같은 XML의 두 번째 호출이다. 비교 조건을 느슨하게 하거나 숨은 준비 조판을 추가해 실패를 감추지 않는다. 수정이 필요하면 초기 전역 설정을 조판 이전에 일관되게 적용하는 공통 경로를 별도 범위로 다룬다. 근거 스니펫·설치 번들 SHA·읽기 전용 입력 해시는 `.tmp/grid64-app-20261112/beam-readonly/`에 보존했다. 앱 빌드는 `b1e973a67886`으로 유지했다.

## 후속: 첫 조판 전 줄기 폭 초기화 — 수정과 실제 출력 확인

위 조사 뒤 기존 `EngravingRules.StemWidth=0.1`이 빔 계산 전에 적용되도록 공통 OSMD 패치를 보완했다. `VexFlowMusicSheetCalculator.initGraphicalMeasuresCreation()`에 `Flow.STEM_WIDTH=rules.StemWidth×unitInPixels` 한 문장을 연결한다. 같은 OSMD의 초기화 훅·규칙·단위 상수를 사용하며, 첫 조판 전 준비용 렌더나 SVG 좌표 보정을 추가하지 않았다. 패치의 기존 JSZip 공유 부분은 그대로다. 변경 내용·설치 파일 해시·크기·갱신 절차는 [OSMD 패치 안내](../../../config/patches/README.md)에 기록했다.

공통 파생 캐시 정책은 `osmd-2.3.0:drum-print-ribbon-v47-stem-initialization:svg1500:quarter-native:rows4`다. lockfile은 패치 해시 3곳만 바뀌었고 다른 의존성 버전과 workspace 설정은 같다. 초기 개발 서버가 이전 사전 번들을 제공한 시도는 검증 결과에서 제외했다. 사전 번들과 기존 5173 서버의 설정을 다시 읽힌 뒤 새 Safari 문서에서 실제 탐탐 XML로 검사했다.

- 실제 출력: 첫 인쇄 조판·반복 인쇄 조판·공통 재생 렌더러 재열기의 음표 요소 624개가 모두 일치했다. 첫 줄기 경로는 모두 `M133 245.5L133 211`이다. 비교에서 자동 생성 `vf-auto` ID만 정규화했으며 경로·좌표 허용 오차는 두지 않았다.
- 두 print-only 결과는 비교용 SVG 문자열도 일치했다. print-only와 공통 재생 렌더러 간에는 음표 요소 일치를 확인했으며, SVG 전체 바이트 일치로 보고하지 않는다.
- 정적 검사: 앱 타입·집중 ESLint·Prettier·공유 JSZip 검사·diff 검사를 통과했다. 설치 파일에서 추가 문장만 되돌린 비교용 바이트가 이전 설치 파일과 같은 것도 확인했다. 실제 설치를 롤백한 것은 아니다.
- 실행 경계: 실제 후보만 읽었고 IndexedDB 접근을 차단했다. 검사에서 저장소 접근 시도 2건은 차단됐으며 DB를 만들거나 쓰지 않았다. 정본·public·후보 패키지 18개는 이 수정 단계 전후에 같은 해시였다.

증거는 `.tmp/grid64-app-20261112/beam-fix/result.json`과 `browser-result.json`, `installed-patch.json`, 각 검사 로그다. 앱 버전은 0.11.4, 소스 빌드는 `e7d7331bf3d4`다. 이후 앱 소스·빌드번호를 고정하고 제작자의 출력 비교를 진행했다. 제작자는 붉은 노을·갑자기의 이전 줄기 차이를 확인해 전체/연주 출력을 갱신했다. Loveholic·Real Paradis·손 풀기는 새 인쇄 음표 서명과 일치한 범위에서 출력을 재사용했다. 이 판단은 앞의 v46 R/L 분기 영향 판단과 별도이며, 전곡의 v47 SVG 바이트 일치를 뜻하지 않는다. 자세한 생성 정책·검사 범위는 [제작 교정 기록](canonical-corrections-20261112.md)에 둔다.

<a id="grid64-app-final-local-integration"></a>

## 후속: 최종 6곡 로컬 앱 수록

- 목표: 악보제작자의 최종 정본·패키지를 두 앱이 사용하는 로컬 수록 경로에 반영한다.
- 범위: `public/scores/`의 해당 6개 패키지와 이 앱 이행 기록. 인계 근거는 `data/production/canonical-corrections-20261112/<곡 ID>/handoff-final/handoff.json`이다.
- 완료 조건: 인계 패키지·실제 수록 파일·5173 HTTP 응답이 바이트 단위로 같고, 공통 읽기 함수의 정본·Song·자산과 카탈로그 경로가 일치한다.
- 제외: 정본 재교정, 앱 코드 변경, 보관함 DB·원본 미디어 변경, 새 조판·청취·전곡 화면 재시험, 버전 인상·커밋·push·공개 발행.
- 검증: 해시에 결합된 제작 근거와 기존 public 사본을 확인한 뒤 파일을 그대로 복사하고, 실제 수록본을 `readScorePackage`로 읽어 원본 및 인계 자료와 대조한다.

제작자가 보존한 `public-before/manifest.json`의 기존 파일 6개와 백업 사본은 모두 시작 SHA256과 같았다. 인계문은 생성 시점에 `draft`로 기록되지만, 최종 전송 결과와 이 채팅의 실제 접수를 별도로 확인했다. 각 산출물의 크기·SHA256, 각 검증 파일의 SHA256도 인계문과 일치했다. 접수 후 다음 파일들을 **재압축하지 않고 인계본 그대로** 수록했다.

| 수록 파일                                | 최종 패키지 SHA256                                                 |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `public/scores/red-sunset.drumscore`     | `8aa3862ecc31f1e4b6fa3004872c486cb03a4e37ba0f5e6b2735ebd9a70b222a` |
| `public/scores/loveholic.drumscore`      | `ab37d29a55d169f5b9710fe6194811c2fb228362cbdd8e8b7f165989055173f3` |
| `public/scores/real-paradis.drumscore`   | `241958bb633df6899a883ef4d8d6d6f3c2ca1441418690820fe0f7b5230a7362` |
| `public/scores/ioi-suddenly.drumscore`   | `36b7c3f05242067b2595dd2075793ba618bad58ebdc46fa3929cdec1740e1fd2` |
| `public/scores/tom-moving.drumscore`     | `dda59c47147fa6fca7203eb5f6a0f7b303741aaef96d09ba6490fb64ef4d82c1` |
| `public/scores/preplay-warmup.drumscore` | `bec14a04c3fe1364dfe404415a4bcb3553306c8950746dda12601789efd4fe75` |

실제 수록본 6개를 두 앱의 공통 `readScorePackage`로 읽었다. 587마디·가사 1,085개·시간 없는 마디 문구 7개를 확인했다. `canonicalXML`과 source는 전달된 XML 바이트와 같고, 전체 Song은 전달된 `song.json`과 같다. 각 인쇄/연주 페이지의 해시도 전달된 gzip SVG와 일치한다. 기존 수록본과 비교해 곡 ID·각 마디의 음악/시각 필드·가사 ID/위치/길이/문구·BPM·음원 연결은 유지했다. 가사 확인 상태는 승인된 Real Paradis 22개만 `true→false`다. 새 조판의 region 연결은 전달된 Song을 사용한다. 원음원과 모든 대체 악보의 메타정보·source·페이지는 기존 수록본과 해시까지 일치했다.

`src/content/bundled-scores.json`의 6개 ID·경로는 인계본과 맞아 변경하지 않았다. 제작기와 연습실의 수록본 로딩이 이 카탈로그와 `readScorePackage`를 사용하는 것도 확인했다. 기존 `127.0.0.1:5173/scores/<곡 ID>.drumscore` 6개 응답은 모두 HTTP 200이며 본문 SHA256이 위 수록 파일과 같다. 최초 샌드박스 시도는 localhost 연결 `EPERM`으로 끝났고 통과로 집계하지 않았다. 허용된 localhost 접근 환경에서 실행한 결과를 최종 근거로 삼았다.

수록·대조 근거는 `.tmp/grid64-app-20261112/app-integration/`의 `preflight.json`, `applied.json`, `verification.json`, 실행 로그다. 이전 public 패키지, 제작 정본과 검증 기록은 보존했다. 문서 링크·앵커·서식 검사는 이 후속 기록까지 포함해 확인하며, 앱 타입 등 변경 없는 앞 단계 결과는 재사용한다. 초기 crop 단계의 문서 링크 실패는 제작자의 경로 정리 뒤 해소됐다.

실제 보관함 DB 저장·청취·이번 수록 후 GUI 확인·공개 사이트 반영은 수행하지 않았다. 이미 저장된 사용자 악보를 자동 교체한 것으로 보고하지 않는다. Real Paradis 30쌍의 원본 가사 위치 근거, Loveholic 추정 4곳, 갑자기의 시간 없는 7문구는 제작 인계의 미확정 상태를 유지한다. 앱 소스·버전·빌드번호와 다른 미커밋 변경은 그대로다.
