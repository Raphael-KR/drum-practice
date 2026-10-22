# 제작 계측·검수·인계 재사용

2026-10-23 사용자 승인에 따른 구현. 시작 HEAD `911d7cd`.

- 목표: 악보의 검증 수준을 유지하면서 계측·검수 화면·인계문을 곡마다 새로 작성하는 작업을 줄인다.
- 범위: `tools/score-production/musicxml` 공통 도구, 제작 스킬과 절차 문서. 기존 I.O.I 결과와 다른 곡의 보존 자료로 검증한다.
- 완료 조건: 과거 실측의 동일 집계, 공통 검수 화면의 실제 표시/해제, 파일·검증 근거에서 인계문 생성, 기존 악보/패키지 바이트 보존.
- 제외: 새 악보 생성, 앱 소스·보관함·수록곡 변경, 원본/기존 산출물 덮어쓰기, 자동 전송·커밋·push·발행.
- 검증: 실제 로그·기존 완성 패키지 기반 집중 검사, Safari 화면 확인, 규격/패키지 기존 집중 검사·문서/스킬 검사. 규격·원본 의미·표시·청취는 별도 상태로 유지한다.

## 도구 경계

- `measure_production.py`: 실제 작업 시작 기록 → 필요한 단계의 명시적 기록 → 종료 시 토큰/비용 참고 환산 집계. 정형 집계에 별도 AI 작업자를 만들거나 계속 polling하지 않는다.
- `common/review.mjs`: 실제 앱의 표시 함수를 쓰는 일시 검수 화면. 원본 줄 구성·선택 마디·가사 앵커를 확인하고, 종료 시 DOM·임시 URL을 정리한다. DB·악보 데이터는 수정하지 않는다.
- `handoff_production.py`: 곡별 인계 설정과 실제 파일/검증 보고서에서 절대경로·SHA·상태·한계를 포함하는 본문을 생성한다. 자동 전송하지 않으며 기존 승인된 전달 도구로 보낸 뒤 접수 상태를 별도 기록한다.

곡별 판단은 반복 순서, 독립 원본 기대값, 특수 주법, 가사 예외, 음원 연결 근거와 다음 조치에 남는다. 해시/개수·XSD·패키지 왕복을 원본 의미 대조나 실제 청취로 대체하지 않는다. 변경이 없는 단계의 검사를 반복하지 않고, 교정한 입력에 의존하는 결과와 검사는 갱신한다.

## 1. 계측

```bash
python3 tools/score-production/musicxml/measure_production.py start --help
python3 tools/score-production/musicxml/measure_production.py mark --help
python3 tools/score-production/musicxml/measure_production.py finish --help
```

`start`에는 새 `--out`, 곡명 `--label`, 실제 현재 세션의 `--root-log`와 `--root-turn-id`를 전달한다. 시작 시각은 로그의 해당 작업 시작에서 읽는다. 로그가 오래된 날짜 디렉터리에 있어도 경로를 그대로 사용한다. 다른 곡의 세션 ID·시각을 복사하지 않는다.

`mark --out ... --stage ... --status ... --evidence ...`로 실제 완료/실패/미확정 단계와 근거를 남긴다. 원본 식별, 대표 구간 판독, 최종 XML, 패키지 왕복, 화면 검수, 인계 접수 등 의미 있는 단계만 기록한다. 병행 단계의 소요 시간을 더해 전체 경과 시간으로 쓰지 않는다.

`finish --out ...`는 한 번 집계하고 `report.json`, `report.md`, `usage-records.json`을 쓴다. 재현 비교에는 `--cutoff`으로 관측 종료 시각을 고정한다. 단가는 확인 날짜와 근거가 있는 `--pricing` 파일로 별도 전달한다. 단가 미제공/미지원 모델을 실제 비용 0으로 보고하지 않는다. 실제 청구액, 공개 단가 참고 환산, 미가격 토큰을 구분한다.

root turn ID는 기존 다른 담당 채팅으로 전달한 후속 작업에도 전파될 수 있다. 제작 담당·하위 검토 범위와 인계 후 수신자 범위를 구분하고 탐색한 로그 경로/범위를 보고한다. 시작 날짜 폴더만 탐색한 결과를 모든 관련 세션의 전수 집계로 표현하지 않는다. 원시 대화·비공개 추론을 출력/보존하지 않으며 사용량 메타데이터만 남긴다. 최종 보고문 등 집계 이후 사용량은 제외될 수 있음을 명시한다.

## 2. 공통 검수 화면

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

## 3. 인계문

인계 초안을 만들기 전에 제작 JSON·스크립트의 수정을 마치고 [기존 검사 계약](../operations/TESTING.md)에 따라 `npm run format:check`와 변경 범위의 코드 검사를 완료한다. 전체 공통 검사에는 `npm run check`를 사용한다. 프로젝트 서식 검사는 Python·Markdown을 포함하지 않으므로 해당 파일까지 검사됐다고 보고하지 않는다.

서식 수정 시 JSON은 수정 전후 파싱한 데이터 값을 비교하고, 스크립트는 diff에서 서식 외 변경이 없는지와 관련 집중 검사 결과를 확인한다. 보존된 제작 결과의 해시도 대조한다. 의미가 달라졌으면 영향받은 생성·음악 검증을 다시 수행한다. 이미 같은 입력/코드로 통과한 검사나 음악 검증을 인계문 작성만을 위해 반복하지 않는다.

그다음 아래 `build`를 실행한다. `evidence`의 이름·범위와 곡별 제작 문서에 실행 명령, 검사 결과, 근거 경로를 연결하고, `limitations`·`nextActions`에는 남은 항목과 다음 확인을 넣는다. 코드 검사, 원본 대조, 패키지 왕복, 화면 확인, 실제 청취, 앱 수록 검증은 각각 기록한다. 일부 미완료를 숨기거나 다른 검사 통과로 대신하지 않는다.

```bash
python3 tools/score-production/musicxml/handoff_production.py build --manifest tools/score-production/musicxml/profiles/ioi-suddenly-handoff.json --out .tmp/ioi-handoff-new
python3 tools/score-production/musicxml/handoff_production.py receipt --help
```

새 곡은 곡별 JSON에 다음만 지정한다. `profiles/ioi-suddenly-handoff.json`은 실제 기존 자료를 사용하는 예시이며 다른 곡의 정답이 아니다.

- `recipient`: 확인한 기존 담당 이름·thread ID·host. 이 값이 전송 권한이나 새 담당자 배정을 만들지 않는다.
- `productionDocument`: 현재 제작 기록 경로.
- `artifacts`: `musicxml` 필수. 요청한 경우에만 `package`, `sourceAudio`, `sourcePdf` 또는 추가 파일을 지정한다. 실제 파일에서 크기·SHA를 계산한다.
- `evidence`: 검사 이름·범위·보고서 경로. `expect`는 JSON pointer와 기대 상태, `bind`는 보고서의 해시 pointer와 전달 artifact 이름이다. 곡별 검사 내용을 공통 코드에 복제하지 않는다.
- `observations`, `limitations`, `nextActions`: 곡별 판독·변경점·미확정·남은 일. 청취가 없으면 그대로 적는다.

`passed`는 기존 보고서의 기대 결과와 전달 파일 SHA가 일치한다는 뜻이다. `recorded`는 근거 파일/과거 결과만 확인했고 현재 후보와 결합하지 못한 상태, `unverified`는 근거 미확보/필드 미확인, `failed`는 실제 불일치다. 초안 생성이 원본 대조·전체 패키지 API 왕복·실제 앱 검사를 새로 실행하지 않는다. XML 단독 제작에도 쓸 수 있으며 요청하지 않은 패키지/음원을 요구하지 않는다.

생성한 `handoff.md`를 검토하고 기존 상시 위임 범위의 실제 전달 도구로 보낸다. 코드 공통화만 한 경우 새 악보를 만든 것처럼 같은 결과를 재전송하지 않는다. `receipt`에는 **실제 관측한** 수신자·시각·접수 근거를 전달한다. `delivery.json`은 최종 본문 해시와 접수를 연결하며 자동 전송·수록·청취 성공을 만들지 않는다.

## 검증 보존

이번 구현 검증 자료는 `data/production/workflow-reuse-20261023/`에 별도 보존한다. 기존 I.O.I MusicXML/패키지/실측 스냅샷과 Loveholic·붉은 노을·손풀기·탐탐 패키지 7파일의 시작/종료 SHA256이 모두 일치한다(`preserved-hashes-final.json`). 기존 원본 판독·음원 분석·청취를 다시 수행한 것으로 보고하지 않는다.

### 2026-10-23 검증 결과

- Python 13검사: 계측 4, 인계 5, 기존 공통 4 통과. 실제 과거 요청별 사용량 재현, 단가 미확인 구분, 잘못 연결한 파일/근거 거부, 기존 5곡 규격·시간과 2개 연습곡 MIDI·이벤트 및 결과 보존을 확인했다. 계측 검사는 일반 unittest discovery에서 생략되므로 아래처럼 실제 자료 경로를 지정해 실행한다.
- TypeScript 49검사: 새 검수 화면 9, 기존 공통/정본 XML/패키지/MusicXML 4파일 40 통과. 실제 기존 패키지로 원본 5마디 줄, 반복 부분 줄, 가사 앵커 누락/오류, 이미지 해독 실패 정리와 창 너비 적용을 확인했다. DOM만 있는 환경의 검수 결과는 `unmeasured`다.
- Safari 실제 5173 제작기: I.O.I 93마디·24줄의 가사 앵커 301/301, 최대 오차 `0.000000494px`(허용 `0.05px`), 행 겹침 없음. 창 1024px에서 행 984px·스크롤 폭 1024px로 가로 넘침이 없다. 대표 PDF/파란 가사 행과 패키지 SVG 표시를 캡처해 확인했다. 종료 후 Song 내용·body 자식 수·이전 포커스가 유지됐고 임시 검수 dialog는 0개다. `browser-final.json`, `review-screen-final.png`, `review-svg-final.png` 참조. 새 전곡 의미 대조·실기기 청취를 뜻하지 않는다.
- 집중 ESLint·TypeScript, 문서 링크·스킬 구조·변경 파일 서식·diff 공백 검사 통과. 앱 소스/버전·DB·기존 산출물을 변경하거나 새 악보를 인계하지 않았다.

```bash
python3 tools/score-production/musicxml/test_measurement.py --legacy data/production/ioi-suddenly-20261023/metrics-reuse-original-scope/report.json --complete data/production/ioi-suddenly-20261023/metrics-reuse-check/report.json --reference data/production/ioi-suddenly-20261023/metrics/final-checkpoint.json --reference-records data/production/ioi-suddenly-20261023/metrics/final-checkpoint-records.json --pricing data/production/ioi-suddenly-20261023/metrics/pricing.json
python3 tools/score-production/musicxml/test_handoff.py
# lxml이 있는 프로젝트 실행 환경에서 실행:
python3 tools/score-production/musicxml/test_common.py
node node_modules/vitest/vitest.mjs run tests/local-media/score-production-review.test.ts
```

### 회고 중 확인한 집계 범위 보완

과거 스냅샷과 같은 종료 시각 `2026-10-22T16:58:43.232879+00:00`으로 재현했다. 기존 제작 측 246요청·27,840,157토큰·공개 단가 참고 환산 `$74.181708`은 그대로 일치한다. 로그 전체 탐색에서는 오래된 날짜 폴더의 수신자 채팅에 연결된 추가 3요청·449,550토큰·`$3.366168`도 확인했다. 제작 측과 인계 후 수신자 범위 합계는 249요청·28,289,707토큰·`$77.547876`이다.

이는 **집계 범위 차이**이며 제작 성능 개선 수치가 아니다. 미가격 3,121,966토큰과 종료 후 응답은 별도이며 실제 청구액은 확인되지 않았다. 과거 단가를 재현용으로 사용했고 현재 단가로 단정하지 않는다. 과거 스냅샷은 보존하고 `data/production/ioi-suddenly-20261023/metrics-reuse-check/scope-comparison.json`에 추가 요청의 메타데이터만 기록했다.

해결 기준: 시작 날짜 폴더만 탐색하지 않고 명시한 세션 범위에서 root turn과 인과관계를 함께 확인한다. 정형 집계는 종료 때 코드로 한 번 처리한다. 이번 전체 125로그의 로컬 집계 시간은 약 2.08초였지만 전체 제작 시간·토큰 절감률은 다음 실제 제작에서 같은 검증 범위로 측정해야 한다. 반복 화면 작성·측정 전담 AI·수작업 인계 조립을 제거한 효과를 아직 측정하지 않은 백분율로 보고하지 않는다.
