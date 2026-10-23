# I.O.I 갑자기 제작과 검수 기록

문서 역할: **사실·연구 기록**. 원문 날짜·입력·환경·결과·실패·미확인은 각 절의 당시 상태다. 이번 통합에서 과거 검증을 재실행하지 않았으며, 기록의 “현재”는 원래 작성 시점이다. [기록 안내](../README.md)와 [현행 정본](../../RULES-INDEX.md)을 구분한다.

<a id="ioi-suddenly-conversion--ioi--갑자기-제작실측"></a>

## I.O.I — 갑자기 제작·실측

2026-10-23 최신 글꼴 교정: 악보의 모든 텍스트를 Pretendard로 통일한 **v10**이 최신이다. 이전 v8은 독립 SVG의 글꼴 차이 발견 전 기록이다. 최소 표시 offset과 원생 전체 SVG·MusicXML·검증·인계 상태는 [최종 제작 기록](../archive/rendering-experiments.md#section-direction-final-20261023--갑자기붉은-노을-전체-재조판)을 따른다.


2026-10-23 후속 조판: OSMD2.2.1로 전체93마디/2쪽을 재생성하고 섹션12개를 마디 오선 시작에 좌측 정렬했다.5마디 지시문은 적용 첫 박을 유지한 채 최소 표시 offset0.375박을 XML에 기록했다. 규격·기타XML·음악 시간 보존과 실제 Safari 검수는 [최종 제작 기록](../archive/rendering-experiments.md#section-direction-final-20261023--갑자기붉은-노을-전체-재조판)을 따른다. 기존 수록 패키지 교체와 구분한다.

2026-10-23. 시작 HEAD `911d7cd`, 실제 루트 `/Users/raphael/Playground/drum-practice`. 악보·패키지 제작 및 아래 범위 검증을 마쳤다. 실제 보관함 수록·사용자 청취는 별도 개발 인계 대상이다.

- 목표: 제공된 PDF·MP3에서 가사·음원 연결을 갖춘 MusicXML과 재생용 패키지를 제작하고 제작 시간·토큰·비용 식별 범위를 실측한다.
- 범위: 원본 보존, 벡터 구조 판독, 반복 순서·가사, 음원 연결, 공통 조판/패키지 검증, 기존 웹앱 개발자 인계. 제작 스킬에 원본 기본 폴더도 반영한다.
- 완료 조건: 대표 원본 독립 대조, 전곡 구조/규격/가사/패키지 왕복, 출력 확인과 인계 증거. 청취·실제 수록은 별도 상태로 기록한다.
- 제외: 인쇄용 PDF·독립 HTML 생성, 앱 소스/보관함/수록곡 변경, 자동 커밋·push·발행, 원음원 변경.
- 검증: 로컬 원본의 좌표·기호와 독립 fixture, MusicXML 4.0 XSD, 현재 앱의 공통 API, 음원 수치 분석. 수치 일치를 실제 청취로 표현하지 않는다.


원문 출처: `docs/score-production/IOI-SUDDENLY-CONVERSION.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="ioi-suddenly-conversion--원본과-실행-기준"></a>

### 원본과 실행 기준

- 기본 원본 폴더: `/Users/raphael/Documents/드럼 악보` (이번 사용자 명시 결정). PDF·MP3를 이름의 한글 정규화까지 고려하여 검색한다. 원본은 읽기 전용으로 취급한다.
- 로컬 작업/보존: `data/production/ioi-suddenly-20261023/`; 원본 사본·해시·음원 정보·원본 페이지 PNG는 `input/provenance.json` 및 같은 폴더.
- 읽은 정본: 전역/프로젝트 AGENTS, 제작 프로세스, 변환 정책, 확정 악기 매핑, SVG 규칙, canonical 및 패키지 계약, COMMON-TOOLS, 제작/스킬작성/PDF/OpenAI 문서 스킬.
- PDF 2쪽의 MScore 기호·선·빔을 추출할 수 있어 벡터 경로를 선택한다. 원본 79마디, 4/4, ♩=117. 반복/괄호는 독립 원본 검토 후 연주 순서와 대응표로 보존한다.
- 현재 앱은 반복 기호 자동 펼치기를 지원하지 않는다. 인쇄 순서 MusicXML은 보존하고, 원음원 연결용 MusicXML에는 확인한 반복 순서를 명시적으로 펼쳐 저장한다. 원본 PDF의 대응 마디 영역도 반복 재사용한다.

<a id="ioi-suddenly-conversion--계측-범위"></a>

### 계측 범위

이번 곡 지정 요청부터 제작·검증·인계까지를 관측한다. 문서 확인·스킬 수정·계측 준비, 실제 제작, 재시도/검증을 구분하고 병행 작업의 소요 시간을 중복하여 합산하지 않는다. 토큰은 세션 사용량 메타데이터에서 주 작업과 참여 에이전트 요청을 식별하여 집계한다. 원시 대화/비공개 추론은 프로젝트 기록에 복사하지 않는다. 실제 청구액과 공식 API 단가 참고 환산은 구분하며, 확인할 수 없는 비용은 미확인으로 남긴다.

계측 정본은 로컬 `data/production/ioi-suddenly-20261023/metrics/report.md`와 시점별 JSON이다. 시작은 2026-10-23 01:28:07.442 KST이다. 최종 보고에는 집계 마감 시각을 명시하며 그 이후 응답 토큰을 포함했다고 주장하지 않는다. 공통 코드 적용 전의 다른 곡과 난이도·검수 범위가 다르므로 이 한 건으로 속도 향상률을 산정하지 않는다.

<a id="ioi-suddenly-conversion--최종-산출물"></a>

### 최종 산출물

아래 경로는 모두 로컬 보존 폴더 `data/production/ioi-suddenly-20261023/` 아래다. 원본 미디어와 실험·산출물은 Git 제외 상태를 유지한다.

| 용도 | 상대 경로 | 내용 |
|---|---|---|
| 전달용 MusicXML | `package-v1/ioi-suddenly-final.musicxml` | 갑자기 / I.O.I, 93마디·372박, 악보 117 BPM, 가사·음원 연결 메타정보 |
| 전달용 패키지 | `package-v1/ioi-suddenly.drumscore` | 6,591,601바이트. 원본 MP3·PDF, SVG 2쪽, PDF 대체 악보와 정본 XML |
| 원본 순서 보존 | `xml-final/source-transcription.musicxml` | 79마디·316박. 원래 반복·괄호·줄 구분 유지 |
| 연주 순서 | `xml-final/measure-order.json` | 원본→재생 마디 대응 |
| 독립 원본 판독 | `review/independent-source-review.json` | 생성 결과를 보지 않고 읽은 대표 21마디·155이벤트와 구조 |
| 가사 판독 | `lyrics/final3/printed-note-lyrics.json` | 원본 좌표, 연결 음표/쉼표 좌표, 선택 근거와 마디 문구 |
| 음원 연결 | `audio-analysis/audio-alignment.json` | 첫 박·일정 템포·93마디 시작/끝·원본 해시 |

SHA256:

- 원본 PDF: `257508398e03aab7e8f567df9175cac52a438f16e7d690d6e424a7f07ac8532c`
- 원본 MP3: `fc06ded4e04abb219401b84caf4be6a9be6dc45607e1234b5748e7aec20e8031`
- 최종 MusicXML: `aa0714c8a9c4b0d4b54938f97b056009b4e23f6169631535a345056ce7612072`
- 최종 패키지: `82936aae3c92bff84d52c8ae4b3190073e63358ee3cedd4253900707aee7763a`

Song ID는 `ioi-suddenly-25750839`, 가수는 실제 가수 `I.O.I`다. 원곡 MP3를 그대로 사용했으므로 연습곡의 드럼킷 가수란 규칙은 적용하지 않는다.

<a id="ioi-suddenly-conversion--원본-의미와-판독-결정"></a>

### 원본 의미와 판독 결정

- 인쇄 마디 순서의 줄 시작은 `1,5,9,13,17,21,25,29,31,35 / 39,43,47,51,56,60,64,68,72,76`이다. 29마디 줄은 2마디, 51마디 줄은 5마디다.
- 재생 순서는 `1..28 → 21..27 → 29..54 → 47..53 → 55..79`다. 1·2번 괄호에 따라 다른 가사 행을 선택한다. PDF 영역도 이 순서로 대응시키되 각 재생 마디의 region ID는 고유하다.
- 원본 590이벤트·838음표머리·11쉼표·열기/닫기 64기호를 구조 추출했다. 원본 좌표/글리프 전수 대조에서 누락·중복이 없으며, 모든 원본 마디 길이는 4박이다. 독립 수동 판독은 대표 21마디이며 전곡의 모든 의미를 이중 판독했다는 뜻은 아니다.
- 4/20/46/63마디의 후반은 스네어+플로어탐, 12/38마디는 탐1→탐2, 56–62마디 C5×는 크로스스틱이다. 승인된 악기 매핑으로 저장했다.
- 72–79마디의 일부 `+`는 하이햇 음표머리가 없는 킥/스네어 사건 위에 있다. 원본에 없는 하이햇 타격을 추가하지 않고 해당 사건에 닫기 주법을 보존했다. `drum-practice:source-hihat-actions:v1`에 원본 마디·위치·대상 하이햇·새 타격 추가 없음도 저장했다. 표준 `stopped` 자체는 다른 음표에 붙었을 때 대상 하이햇을 모든 프로그램에서 특정하지 못하므로 이 의미의 프로그램 간 호환성에는 한계가 있다. [MusicXML stopped 정의](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/stopped/)와 원본을 함께 참고한다.

<a id="ioi-suddenly-conversion--가사"></a>

#### 가사

가창 시각을 분석하지 않고 PDF의 음표·쉼표 아래 배치를 기준으로 301개 가사 단위를 연결했다. 기존 canonical 계약에 따라 MusicXML 표준 가사와 타악기 기반 보조 가사 파트로 저장한다. 보컬 멜로디나 실제 가창 길이를 생성하지 않는다. 원본 비공백 428문자와 반복 2절 선택을 보존했고 독립 가사 사례 15개 및 중복 위치 검사를 통과했다.

원본 20,31,32,33,34,46,56마디의 7문구는 세부 박을 확정할 근거가 부족해 `measureLyrics`로 보존했다. 20/46마디는 긴 쉼표·마지막 4분음표 안의 세부 음절, 31–33은 온쉼표, 34는 마지막 음표 내부, 56은 두 8분음표 사이의 애매한 음절이 원인이다. 추정 박으로 강제하지 않는다. 57–59마디의 붙어 있는 음절은 원본 글자 묶음 중심·음표 거리를 근거로 그룹화했다.

PDF 대체 악보에는 별도로 301개의 음표 좌표 앵커를 저장했다. 실제 공통 `renderMeasure`의 배치와 대응 좌표를 대조했고 최대 CSS 직렬화 오차는 0.0000005px 미만이다. Safari 화면에서 첫 절·반복 2절·조밀한 가사 구간을 확인했다. 증거 `review/pdf-lyric-placement-final.png`. 이 화면은 공통 컴포넌트를 사용하는 일시 검수 화면이며 보관함에 수록한 화면은 아니다.

<a id="ioi-suddenly-conversion--음원"></a>

#### 음원

악보 BPM은 **117**을 유지한다. 원음 분석은 첫 박 **약 0.391초**, 일정 연주 템포 **약 116.999 BPM**으로 추정했다. 372박 전체에서 117 BPM과 차이는 약 1.63ms로 실질적인 템포 차이를 주장할 수준이 아니다. 10ms 특징에서 최적화한 수치를 1ms 측정 정확도로 해석하지 않는다.

추정 악보 끝은 191.161861초, MP3 전체는 195.047625초이며 약 3.886초의 끝 여운을 보존한다. 7구간 위상 차이 −3..+2ms는 진단용으로만 남겼다. 마디별 실연 흔들림을 연습 시계에 반영하지 않았다. 원곡 템포 모드는 패키지에 설정했으며 원본 MP3 바이트는 바꾸지 않았다. 음성 인식/STT·AFM은 이 신호 분석의 근거로 사용하지 않았다.

<a id="ioi-suddenly-conversion--검증과-해결-기록"></a>

### 검증과 해결 기록

- MusicXML 4.0 XSD, 79/93마디 전체 시간·악기·승인 오선 위치 대조 통과. 최종 93마디의 드럼 음표머리는 1,036개다. 악기·길이·표시 위치·겹세로줄 오류를 메모리에 주입한 4종 검사가 모두 거부했다. `review/canonical-final-audit.json`.
- 실제 앱 renderer로 SVG 2쪽·93영역, 경고 0. 최종 SVG를 Safari에서 확인했다. `package-v1/osmd-render/`, `review/safari-final-white.png`.
- 공통 패키지 API의 전체 Song/XML·원본 MP3/PDF·모든 페이지 자산 저장/재읽기 대조 통과. ZIP 8항목 CRC와 원본 MP3 SHA를 별도로 확인했다. `package-v1/package-audit.json`.
- 기존 TypeScript 4파일 40검사 통과. 공통 경로 수정 후 기존 완성 패키지 4곡의 5검사를 다시 통과했다. 로그는 `review/common-tests.log`, `review/common-path-regression.log`에 보존한다. 변경 JS lint, 제작 스킬 구조, 83개 Markdown 상대 링크와 diff 공백 검사도 통과했다.
- 정식 음원 CLI로 새 폴더에 재실행한 연결 JSON·초기 분석·요약·특징 NPZ 4파일은 최초 결과와 바이트 일치. 잘못된 원본 해시·기존 출력 폴더 거부 확인. `audio-reproduction/reproduction-verification.json`.
- 현재 공통 `makeCycle`을 사용하여 0.8/1/1.2배속 × 시작 0초/첫 박/중간 마디의 9조합에서 카운트오프 ON 4박과 마지막 카운트→첫 박 간격, OFF 즉시 시작을 수치 검증했다. `review/browser-components.json`. 실제 스피커 청취와는 구분한다.

이번에 해결한 문제와 다음 적용 기준:

1. **반복 악보:** 앱이 반복을 자동 해석하지 않으므로 원본 순서와 음원용 펼친 순서를 별도 보존하고 마디 대응표를 저장한다. 반복 횟수는 원본 괄호·음원 전체 길이로 확인한다.
2. **겹세로줄 누락:** 독립 원본 대조에서 4/12/20/30/38/46/55/63/71마디 누락을 발견해 고쳤다. 리듬 총길이 검사만으로 검출되지 않아 별도 원본 기대값과 오류 검사를 추가했다.
3. **가사 밀집/쉼표:** 문자 중심과 음표 후보를 근거로 묶음을 판독한다. 세부 리듬이 없는 마디는 문구로 보존하며 시간으로 가사를 균등 배분하지 않는다.
4. **구간명 겹침 — 과거 임시 처리:** SVG의 A와 Closed H.H 문구가 겹쳐 제작자가 `A · Closed H.H →`로 한 줄에 합쳤다. 이는 사용자 확정 규칙이 아니며 섹션명과 연주 지시의 구분을 훼손했다. 사용자 결정(2026-10-23)에 따라 별도 rehearsal/words로 보존해야 한다. 현재 산출물은 아직 이 결정대로 교정하지 않았으며 [SVG 공동 검토](../archive/rendering-experiments.md#section-direction-layout-review--섹션-표제연주-지시의-svg-공동-검토) 후 배치를 수정한다.
5. **공통 브라우저 파일 경로:** Vite가 변환한 `new URL(...).pathname`에 끝 `/`가 없어 `drum-practicedata/...` 요청과 JSON 파싱 실패가 발생했다. `common/package.mjs`에서 디렉터리 구분자를 명시적으로 정규화했다. 실제 브라우저의 올바른 JSON 조회·잘못된 결합 거부 및 기존 패키지 5검사로 확인했다.
6. **검수 화면/재시도:** 컴포넌트 단독 화면에서는 절대 배치 crop에 맞는 부모 높이를 지정해야 한다. 최초 임시 검수 화면의 줄 겹침을 수정한 후 다시 캡처했다. 실제 앱/산출물 수정은 아니다. 생성 중 모듈 서식 저장은 Vite 재로드를 일으키므로 모듈 변경을 마친 뒤 생성하고 결과를 저장한다.

<a id="ioi-suddenly-conversion--재현-경로와-공통-코드-경계"></a>

### 재현 경로와 공통 코드 경계

`common/musescore_pdf.py`는 교정된 MScore PDF 프로필로 선·빔·기호를 추출한다. 새로운 양식의 의미를 자동 확정하는 범용 OMR은 아니다. 이 곡의 원본 해시·글리프·줄 시작은 `profiles/ioi-suddenly-source.json`, 가사 예외는 `profiles/ioi-suddenly-lyrics.json`, 음원 탐색·독립 판독 근거는 `profiles/ioi-suddenly-audio.json`에 분리했다. 악기/반복/구간명은 곡 어댑터에서 정본에 따라 결정한다.

저장소 루트에서 의존성 `pdfplumber`, `lxml`, `numpy`, `Pillow`가 있는 Python과 ffmpeg/Poppler를 사용한다. 출력 경로는 매번 새로 지정한다.

```bash
python3 tools/score-production/musicxml/ioi_suddenly_extract.py --pdf data/production/ioi-suddenly-20261023/input/source.pdf --out .tmp/ioi-new-extraction
python3 tools/score-production/musicxml/ioi_suddenly_xml.py --ir .tmp/ioi-new-extraction/extracted.json --pdf data/production/ioi-suddenly-20261023/input/source.pdf --out .tmp/ioi-new-xml
python3 tools/score-production/musicxml/ioi_suddenly_lyrics.py --dir data/production/ioi-suddenly-20261023 --out .tmp/ioi-new-lyrics
python3 tools/score-production/musicxml/ioi_suddenly_pdf_regions.py --ir .tmp/ioi-new-extraction/extracted.json --lyrics .tmp/ioi-new-lyrics/printed-note-lyrics.json --out .tmp/ioi-new-pdf-regions.json
python3 tools/score-production/musicxml/ioi_suddenly_audio.py --audio data/production/ioi-suddenly-20261023/input/source.mp3 --out .tmp/ioi-new-audio
python3 tools/score-production/musicxml/verify_ioi_suddenly.py --xml data/production/ioi-suddenly-20261023/package-v1/ioi-suddenly-final.musicxml --ir data/production/ioi-suddenly-20261023/extraction/extracted.json --fixture data/production/ioi-suddenly-20261023/review/independent-source-review.json --out .tmp/ioi-new-verification.json
```

패키지 어댑터는 `ioi_suddenly_package.mjs`의 `build({xmlDirectory, lyricFile, pdfRegionsFile})`다. 현재 로컬 5173의 앱 API를 사용하고 공통 evidence 수신기 5192에 저장한다. 5192는 앱 미리보기 포트가 아니다. 정식 인자는 `xml-final`, `lyrics/final3/printed-note-lyrics.json`, `pdf-regions-final.json`. 재생성 시 프로필 입력·새 출력 수신 폴더를 명시적으로 준비하고 기존 산출물을 덮어쓰지 않는다.

<a id="ioi-suddenly-conversion--개발-인계와-남은-범위"></a>

### 개발 인계와 남은 범위

기존 담당 채팅 **드럼연습실 웹앱 개발**, ID `01a0afc9-ca21-7371-9390-06eb07c017e9`에 사용자의 상시 인계 지시에 따라 2026-10-23 01:57:59 KST에 전달했다. 도구 접수 성공 후 담당자가 파일·문서·미커밋 변경 검토를 시작한 것을 확인했다. 수신 turn ID는 `01a1648c-4f2d-7631-ac05-4e0d67a8c9aa`. 정확한 본문·접수 결과는 로컬 `handoff.md`, `handoff-result.json`에 기록한다. 이 접수는 실제 앱 수록 완료를 뜻하지 않는다.

제작 단계의 규격·공통 API 왕복·렌더링·수치 검증은 완료했다. 실제 악보 목록 수록, 보관함 저장 후 재열기, 실제 청취에 의한 시작/끝·배속·반복·카운트오프 확인, iPad 확인은 개발 담당 후속 범위다. 이번 작업에서는 DB·앱 소스·수록곡·앱 버전을 변경하지 않았고 커밋·push·발행을 실행하지 않았다.
