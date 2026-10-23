# 악보·패키지·표시 검수

문서 역할: **실행 절차**. 현재 요청과 전역·프로젝트 지침의 승인 범위 안에서 수행한다. [정본 목록](../RULES-INDEX.md)과 [작업별 안내](../README.md)를 먼저 확인한다. 예시 명령·과거 기록은 이번 실행의 성공 증거가 아니다.

<a id="score-production-process--첫-박카운트오프-검수표"></a>

##### 첫 박·카운트오프 검수표

[첫 박·카운트오프 기준](../reference/score/production.md#musicxml-conversion-policy--첫-박과-카운트오프)과 [재생 카운트 계약](../reference/product/playback.md#playback-actions--버튼-이동-카운트오프)을 확인한다. 곡명, PDF/음원 해시, firstBeat, BPM/해당 구간 박 길이, 앱 버전/빌드, 브라우저·기기, 시작 위치, 배속, 카운트 설정, 관측 방법과 결과를 각 행에 기록한다. 수치만 검사했다면 ‘청취 미검증’이라고 적는다.

| 확인 | 시작 위치·조건 | 완료 판단 |
|---|---|---|
| OFF | 곡 처음과 중간 마디, 기본 배속 | 음원·악보·메트로놈의 박이 일치 |
| ON | 음원0초·첫 마디 시작점·중간 마디에서 각각 | 네 번의 사분음표 준비 카운트 다음 박에 실제 첫 박 연결 |
| 느린/빠른 배속 | 같은 시작점에서 OFF/ON 비교 | 마지막 카운트→첫 박이 해당 배속의 사분음표 한 박 |
| 앞부분 | 실제 곡의 첫 박 이전 구간, 긴 앞부분 회귀 사례 | 앞부분 보존, 준비 카운트와 첫 박 정렬; 실제 입력에 없는 긴 앞부분은 코드 회귀 검사로 구분 |
| 반복 | 같은 반복 경계에서 여러 회차 | 박 중복·누락 없이 이어짐 |

| 관측 | 조사 책임과 처리 |
|---|---|
| OFF에서도 어긋남 | 제작 측 첫 박·BPM·마디별 연결을 검토하고 실제 음원/악보와 재대조 |
| OFF 정상, ON만 어긋남 | 앱 카운트오프 예약 문제로 전달. 정상인 곡 시간표는 이동하지 않음 |
| 수치 검사 정상, 청취 미실시 | 수치 통과만 기록. 기기 청취 완료로 표현하지 않음 |
| 시뮬레이터/Chromium만 확인 | 그 환경의 결과로 기록. 실물 iPad Safari·오디오 결과로 대체하지 않음 |

<a id="score-production-process--6-svg-조판재생-캐시완성-패키지"></a>

## 6. SVG 조판·재생 캐시·완성 패키지

**섹션·연주 지시:** [배치 Rule](../reference/score/rendering.md#svg-score-rules--4-구간-시작-표시)과 [공통 도구 계약](../reference/score/tools.md#common-tools--구현된-경계)을 읽는다. 원본 표제·지시 목록, 적용 박, 위치 속성, 후보 탐색·충돌 결과와 XML 재열기 결과를 이번 입력에 결합해 기록한다.

**입력:** 검증한 XML, 음악적 가사·음원 연결, 원본 PDF/음원, 검증한 페이지·마디 영역과 표시 좌표.

**수행 방법·도구:** [SVG 정본](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙)과 [브라우저 조판](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약)을 읽고 공통 `src/modules/score/musicxml.ts::renderMusicXML`을 사용한다. 전체 인쇄 SVG와 연습 화면의 배치를 구분한다. 캐시는 현재 렌더러/표시 정책/원문에 맞게 생성하며, `src/modules/score/browser-score.ts::prepareBrowserScore`의 실제 열기 결과도 검수한다. 기존 동봉 SVG만으로 최신 화면의 모양을 보증하지 않는다. 원문을 렌더러 출력으로 재생성하지 않는다.

`src/modules/score/canonical-xml.ts`의 정본 쓰기·읽기와 `src/modules/library/score-package.ts`의 `createScorePackage → readScorePackage`로 완성 `.drumscore`를 생성·재읽기한다. 곡별 helper는 입력·원본 해시·경로·포트를 검토한 뒤 사용한다. loopback 근거 수신기는 새로운 출력 폴더에서 실행하고 작업 후 그 프로세스만 종료한다. ZIP 감사는 확장자 추정 대신 manifest의 실제 자산 경로를 읽는다.

**산출물:** 최종 MusicXML·전체 SVG/재생 캐시·원본 PDF 페이지·`.drumscore`, 패키지 manifest와 해시·CRC·왕복 보존 보고서, 실제 출력 캡처.

**완료 조건:** Song 전체와 canonicalXML, PDF/음원 원시 바이트, 마디/박자·가사·대체 악보 연결이 왕복 유지된다. 모든 마디와 주법을 실제 렌더에서 확인한다. glyph DOM 개수는 쉼표·꾸밈음 포함 여부를 명시한다. PDF 세로 영역은 자기 줄 내용 포함·이전 줄 혼입 방지, 가로 자르기는 승인된 표시 규칙과 원본 geometry에만 적용한다. 다른 곡의 crop/anchor를 복사하지 않는다.

**실패 시 확인:** 패키지 계약 → SVG/매핑 정본 → 문제 해결 기록. XML 파싱 성공이나 warnings 없음은 주법 출력 성공이 아니다. Poppler/CairoSVG PNG와 실제 Safari SVG의 폰트/잘림 결과를 구별한다. HMR·병행 소스 변경이 있으면 조율해 입력·렌더러 상태를 고정하고 새 증거를 만든다.

<a id="score-production-process--7-실제-앱-수록본과-저장-곡-검수"></a>

## 7. 실제 앱 수록본과 저장 곡 검수

**입력:** 검증한 최종 패키지, 작업 대상 origin/앱·현재 빌드, 기존 저장 곡/수록 파일과 연습 상태.

**수행 방법·도구:** 이미 승인된 로컬 앱 범위에서 Safari MCP로 실제 완성 패키지 가져오기·저장 경로를 사용한다. 대상 곡·origin을 먼저 확인하고 [수정본·연습 기록 계약](../reference/score/file-formats.md#score-package--수정본과-연습-기록)을 대조한다. 제작기 저장/편집 검수와 연습실 재가져오기를 각각 수행하고 적용 결과·보존 상태를 확인한다. Safari 실패는 원인을 기록한 뒤 프로젝트의 대체 브라우저 절차를 따른다.

저장 후 화면을 닫고 다시 연다. 실제 저장 레코드·canonicalXML·음원 해시·마디/가사 개수를 입력 패키지와 대조한다. PDF/SVG × 한 줄/두 줄, 전체 악보의 첫/중간/끝·밀집 필인·주법·가사·페이지 경계를 확인한다. 마디 클릭·진행선·재생/일시정지·배속·반복·마커·보기 전환 후 상태 보존과 5단계의 OFF/ON 청취를 확인한다. 화면에 가사가 있는 것과 PDF 대응 위치가 맞는 것은 별도 검사다.

**산출물:** 실제 저장·재열기 대조, 화면/재생 검수표·캡처, 앱/기기/빌드·원문/패키지 식별, 유지된 연습 상태와 잔여 결함.

**완료 조건:** 생성 파일·실제 수록 파일·실제 저장 곡의 버전이 연결되고 재열기 후 내용과 상태가 유지된다. 합성 fixture나 메모리상의 render 호출만으로 실제 수록 완료를 선언하지 않는다. 제작 검수와 앱 수정·발행 책임을 나누며, 현재 대상 밖의 기존 탭/공개 사이트가 갱신됐다고 가정하지 않는다.

**실패 시 확인:** 패키지 업데이트/구조 충돌 계약, 조판 캐시 키·음원 해시 및 [유사한 제작·교정 기록](../records/README.md#곡별-제작-기록). 오래된 저장 곡·수록 파일·표시 캐시·다른 origin 중 어느 단계인지 확인한다. 데이터와 UI/오디오 예약 결함을 분리해 담당 세션에 정확한 근거를 전달한다.

<a id="score-production-process--완료-판정과-필수-근거"></a>

### 완료 판정과 필수 근거

| 판정 항목 | 남길 근거 | 아직 없을 때의 상태 |
|---|---|---|
| 자료 보존·유형 선택 | provenance, 원본/초벌/이전 결과, 대표 시험·방식 선택 | 접수/방식 평가 중 |
| 전사·가사 의미 | 원본 fixture, 마디/음가/주법·문자 대조, XSD·XML왕복, 추정 목록 | 후보·교정 중 |
| 음원 연결 | 첫 박/BPM·시간표·위상/드리프트 근거·해시 | 분석 추정 또는 연결 미완료 |
| 조판·패키지 | 실제 출력·주법/좌표, 패키지 CRC/원본 바이트/왕복 | 생성 완료와 화면 미검증을 분리 |
| 실제 앱 수록 | 가져오기/저장/재열기, 패키지/저장 레코드 대조, 상태 보존 | 수록 검증 미완료 |
| 재생·청취 | 기기별 OFF/ON·배속·반복 검수표, 수치와 청취 별도 | 청취 미검증 또는 앱 결함 인계 |
| 인계 | 곡별 제작 문서·history·재현 명령/환경·남은 일, 기존 개발자에게 실제 전달한 본문·접수/처리 상태 | 인계 미완료 또는 전송 실패/수신 상태 미확인 |

검증된 단계만 완료라고 쓴다. 앱 결함 때문에 청취 검증이 남으면 ‘전사·패키지 생성 완료 / 실제 재생 검증 대기’처럼 구분한다.  전체 외부 이중 전사·실물 연주 정확도까지 확인했다고 주장하지 않는다.

<a id="score-production-process--첫-박카운트오프-상세-점검"></a>

### 첫 박·카운트오프 상세 점검

1. **첫 박 확정:** 음원 파일의 0초와 악보 1마디 첫 박을 구분한다. 실제 첫 박의 초 단위 위치를 확인하고 `firstBeat` 및 첫 마디 `start`와 대조한다. 첫 박 앞의 무음·도입 소리도 원본 음원의 일부로 보존한다.
2. **카운트오프 OFF 확인:** 곡 처음과 중간 마디에서 재생하여 음원·악보·메트로놈의 박이 맞는지 확인한다. OFF에서도 어긋나면 첫 박·BPM·마디별 시간표를 제작기에서 검토한다.
3. **카운트오프 ON 확인:** 같은 시작 위치에서 네 번의 4분음표 준비 카운트 다음 박에 실제 첫 박이 이어지는지 확인한다. 곡 처음(음원0초), 첫 마디 시작점, 중간 마디에서 각각 비교한다.
4. **앞부분 길이 대조:** 음원 시작·카운트 시작/종료·악보 첫 박 시각을 기록하고 [재생 계약](../reference/product/playback.md#playback-actions--버튼-이동-카운트오프)과 비교한다. 앞부분이 짧은 경우와 준비 카운트보다 긴 경우의 정렬을 각각 확인한다. 원음원·정상인 곡 타이밍의 보존 여부도 대조한다.
5. **배속·반복 검증:** 기본 배속과 느린/빠른 배속에서 마지막 카운트→첫 박 간격이 해당 배속의 4분음표 한 박인지 확인한다. 반복 경계의 박 중복·누락도 점검한다.
6. **책임 구분과 기록:** OFF는 정상이고 ON에서만 어긋나면 앱의 카운트오프 예약 로직 문제로 분류한다. 곡 제작자가 데이터로 우회 보정하지 않는다. 곡명·첫 박 위치·BPM·배속·앱 버전/빌드·기기·ON/OFF 결과를 해당 곡 제작 기록에 남긴다. 수치/자동 테스트와 실제 청취 결과를 분리하며, 청취하지 않았다면 미검증으로 기록한다.

<a id="reusable-production-workflow--2-공통-검수-화면"></a>

### 2. 공통 검수 화면

코드/프로필 수정과 서식 정리를 마친 뒤 현재 로컬 5173 제작기에서 실제 패키지를 읽는다. 새 앱·독립 HTML을 만들지 않는다. 다음은 보존된 I.O.I 패키지의 적용 예다.

```javascript
const { readScorePackage } = await import('/src/modules/library/score-package.ts');
const { mountScoreReview } = await import('/tools/score-production/musicxml/common/review.mjs');
const response = await fetch('/data/production/ioi-suddenly-20261023/package-v1/ioi-suddenly.drumscore');
if (!response.ok) throw new Error(`Package read failed: status=${response.status}`);
const record = await readScorePackage(await response.blob());
window.scoreReview = await mountScoreReview(record, {
  alternateIndex: 0,
  measureGroups: [[21, 22, 23, 24], [29, 30, 31, 32], [71, 72, 73, 74]],
  requirePDFAnchors: true,
});
window.scoreReview.report();
// 표시 대조·화면 기록 후:
window.scoreReview.dispose();
```

숫자는 현재 `record.song.measures`의 1부터 시작하는 위치이며 원본 인쇄 번호와 다를 수 있다. 고유 마디 ID도 사용할 수 있다. `measureGroups`를 생략하면 원본 영역의 page/y/h/x 시스템 경계를 따른다. 반복을 펼친 악보의 부분 시스템도 현재 연주 순서대로 보존한다. 원본 가사 행을 PDF 이미지로 확인하고, 파란 가사의 음표 대응·겹침을 대조한다. SVG 페이지도 같은 패키지 자산으로 확인한다. 기본 행 너비는 현재 창 너비에서 여백 40px을 뺀 값이며 200~1200px 범위다. 특정 폭 비교가 필요할 때만 `rowWidth`를 명시한다.

`report()`의 배치/앵커 결과는 자동 기하 검증이다. 실제 음표 의미·눈으로 본 화면·청취 완료를 뜻하지 않는다. JSDOM처럼 실제 배치값이 없는 환경은 `unmeasured`로 남긴다. 캡처가 필요하면 현재 프로젝트의 Safari MCP 승인을 따르고, 검수 종료 시 `dispose()` 또는 화면 닫기로 임시 DOM/URL을 해제한다. 생성 도중 모듈을 수정해 Vite 재로드가 발생했다면 현재 결과를 재확인한 후 검수를 재개한다.

<a id="practice-files--완성-악보와-연습-정보-파일-사용-절차"></a>

## 완성 악보와 연습 정보 파일 사용 절차

요구·자원 제한은 [.drumscore 계약](../reference/score/file-formats.md#score-package--완성-악보-파일-계약--drumscore-v1)과 [음원 연습 JSON 계약](../reference/score/file-formats.md#practice-file--음원-연습-파일)을 따른다. 두 파일의 목적과 충돌 정책을 혼용하지 않는다.

<a id="practice-files--완성-악보"></a>

### 완성 악보

제작은 [제작 프로세스](produce-score.md#score-production-process--악보-제작-프로세스)의 정본 조립 → 공통 패키지 API → 재읽기 → 파일 식별 → 기존 담당 인계를 따른다. 모듈 호출 성공은 앱 저장·실제 청취를 뜻하지 않는다.

<a id="practice-files--사용자-음원-연습-정보"></a>

### 사용자 음원 연습 정보

1. 목록 설정 또는 음원 재생 설정 > 백업에서 내 음원 목록 전체의 JSON을 저장한다.
2. 복원할 JSON을 선택한다. 기기에 같은 원본이 없으면 안내된 음원을 함께 선택한다.
3. 크기·SHA-256·중복 여부를 모두 확인한 후 일괄 복원한다. 취소·불일치·중복이면 기존 자료를 유지한다.
4. 새 항목과 분석·수동 보정·마커·구간·곡별 설정을 확인한다. 원본 파일명만으로 연결하거나 가져온 박 정보를 자동 재분석하지 않는다.

구현 검증은 [검사 절차](verify.md#testing--개발-검사와-로컬-자산-준비), 당시 결과는 [ADR-0022](../decisions/0022-portable-score-and-practice-files.md)에 둔다.

<a id="ui-review--조판-회귀-대상"></a>

### 조판 회귀 대상

브라우저 공통 조판의 대표 회귀에서는 Loveholic 2/10마디의 동일 너비와 120–123마디의 오선 크기를 확인한다. 변박·꾸밈음·쉼표·빔·주법도 확인한다. 해당 입력이 없거나 실행하지 않으면 미확인으로 기록한다. 공통 수용 기준은 [브라우저 조판 Rule](../reference/score/rendering.md#browser-musicxml-rendering--검증-기준)을 따른다.

## 원본과 제작기 화면 대조

1. 악보는 [제작 프로세스](produce-score.md#score-production-process--악보-제작-프로세스)와 [공통 검수 화면](review-score.md#reusable-production-workflow--2-공통-검수-화면)을 재사용한다. 원본 줄·마디/가사 대응·첫/중간/끝·밀집 기호·주법·섹션/지시·XML 재열기를 확인한다. 전체 SVG와 연습 배치를 혼용하지 않는다.
2. 제작기 PDF/SVG 비교는 같은 마디/박과 실제 Canvas를 확인한다. 스페이스 정지·PNG 복사·실패 시 캡처 저장을 해당 환경에서 확인한다. 클립보드 실패를 성공으로 표시하지 않는다.
