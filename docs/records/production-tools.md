# 제작 도구 검증과 계측

문서 역할: **사실·연구 기록**. 원문 날짜·입력·환경·결과·실패·미확인은 각 절의 당시 상태다. 이번 통합에서 과거 검증을 재실행하지 않았으며, 기록의 “현재”는 원래 작성 시점이다. [기록 안내](README.md)와 [현행 정본](../RULES-INDEX.md)을 구분한다.

<a id="production-tool-validation--공통-제작-도구-검증계측-기록"></a>

## 공통 제작 도구 검증·계측 기록

문서 역할: **사실 기록**. 날짜·입력·버전·한계는 당시 관측이다. 현행 요구는 [Rule 목록](../RULES-INDEX.md), 실행 순서는 [절차 목록](../README.md)을 따른다. 아래 검증을 이번 문서 정리에서 다시 실행하지 않았다. 삭제된 Git 제외 증거의 존재를 보장하지 않는다.


원문 출처: `docs/records/PRODUCTION-TOOL-VALIDATION.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="production-tool-validation--이관-원문--common-toolsmd--7"></a>

#### 이관 원문 — COMMON-TOOLS.md / 7

출처: [docs/score-production/COMMON-TOOLS.md](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="production-tool-validation--검증-결과--2026-10-23"></a>

###### 검증 결과 — 2026-10-23

환경: 시작 HEAD `8caa377`, 번들 Python 3.12(`lxml`/`numpy`/`pdfplumber`/`Pillow`), 설치된 ffmpeg/Poppler, 저장소 Node 의존성. 스킬 검증에는 PyYAML이 있는 시스템 Python 3.14를 사용했다.

- Python 집중 검사 13개 통과: 기존 원본 오류 검출 9개 + 공통 규격/시간·MIDI·결과 저장 4개. Real Paradis 110마디/441박, Loveholic 123/492, 붉은 노을 137/550, 손풀기 96/384, 탐탐 28/112의 최종 MusicXML을 확인했다.
- TypeScript 4파일 40개 통과: 기존 canonical/XML/package 검사와 실제 완성 패키지 4곡의 공통 코드 왕복 5개. 전체 Song·가사·시각·XML·원본 음원/악보·모든 페이지·대체 악보가 유지되며 다른 곡/음원/페이지 대입은 검출했다.
- 손풀기·탐탐: 변경 전 코드와 같은 입력으로 생성한 XML·MIDI·이벤트 JSON·구성 JSON·생성 감사 JSON이 각각 바이트 일치. SoCal·Portland WAV/MP3는 보존 음원과 바이트 일치.
- Loveholic·붉은 노을: 변경 전/후 XML exporter의 같은 입력 결과가 바이트 일치. Loveholic은 PDF 전체 재추출·123마디 검증·독립 대표 리듬·기존 오류 주입 5종도 통과.
- 음원 분석: Loveholic 전곡 분석 JSON의 변경 전/후 바이트 일치. 붉은 노을의 변경된 특징 추출 부분은 전체 음원의 시각·특징 배열·길이가 정확히 일치. 자유 엔딩 판단을 새로 확정하지 않았다.
- 가사: Loveholic `printed-note-lyrics.json`과 원본 위치 검수 PNG 3장이 변경 전/후 바이트 일치.
- 최초 보존 목록에 있는 XML/MIDI/MP3/drumscore 25파일은 작업 후 모두 같은 해시. 새 결과는 별도 검증 폴더에만 저장.
- 변경 JS/TS lint, 도구 TypeScript 검사, 소스 경계 검사, 문서 링크 검사, 스킬 구조 검사, `git diff --check` 통과.

근거: 로컬 `data/production/common-refactor-20261023/verification-summary.json`, `generation-comparison.json`, `adapter-comparison.json`, `lyrics-comparison.json`, `original-hashes.json`. 새 출력과 변경 전 소스도 같은 폴더에 보존한다. 패키지 ZIP은 생성 시각 때문에 컨테이너 해시 대신 재읽은 의미와 모든 자산 바이트를 비교했다. GUI 화면 재검수·실기기 청취·앱 수록·공개 배포는 이번 코드 보존 검사의 범위가 아니다.

<a id="production-tool-validation--이관-원문--common-toolsmd--8"></a>

#### 이관 원문 — COMMON-TOOLS.md / 8

출처: [docs/score-production/COMMON-TOOLS.md](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="production-tool-validation--검증-중-확인한-재현-조건"></a>

###### 검증 중 확인한 재현 조건

- 시스템 Python에는 lxml이, 번들 Python에는 PyYAML이 없었다. 도구별로 실제 의존성이 있는 인터프리터를 사용했으며 설치나 전역 환경 변경은 하지 않았다.
- Loveholic 판독기는 원본 래스터 페이지와 PDF/음원 해시 provenance를 선행 입력으로 요구한다. 처음 재실행에서 해당 파일 누락을 확인했고, 공통 `prepare_inputs.py --audio ... --raster-dpi 144`로 준비한 새 폴더에서 전곡 재생성·검증했다. PDF만 준비하면 이 곡 어댑터가 요구하는 음원 해시는 채워지지 않는다.
- 오래된 보존 초벌과 최신 생성 코드가 이미 달랐다. 손풀기 초벌에는 키트 가수란이 없었고, Loveholic 초벌에는 승인 전 Crash 분류와 half-open 처리 기록이 남아 있었다. 이 차이를 이번 리팩터링 회귀로 오인하지 않도록 변경 전 소스 재생성과 현재 완성 패키지를 기준으로 비교했다. 과거 파일은 수정하지 않았다.
- 공통 시간 검사에서 더 이른 단계에 ValueError가 발생한 두 기존 오류 주입 사례는 과거 `verify()`의 AssertionError 계약을 유지하도록 진입점에서 변환했다. 오류 판정 근거는 그대로 보존하고 기존 9검사를 다시 통과했다.

<a id="production-tool-validation--이관-원문--reusable-production-workflowmd--6"></a>

#### 이관 원문 — REUSABLE-PRODUCTION-WORKFLOW.md / 6

출처: [docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md](../how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="production-tool-validation--검증-보존"></a>

###### 검증 보존

이번 구현 검증 자료는 `data/production/workflow-reuse-20261023/`에 별도 보존한다. 기존 I.O.I MusicXML/패키지/실측 스냅샷과 Loveholic·붉은 노을·손풀기·탐탐 패키지 7파일의 시작/종료 SHA256이 모두 일치한다(`preserved-hashes-final.json`). 기존 원본 판독·음원 분석·청취를 다시 수행한 것으로 보고하지 않는다.

<a id="production-tool-validation--이관-원문--reusable-production-workflowmd--7"></a>

#### 이관 원문 — REUSABLE-PRODUCTION-WORKFLOW.md / 7

출처: [docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md](../how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="production-tool-validation--2026-10-23-검증-결과"></a>

###### 2026-10-23 검증 결과

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

<a id="production-tool-validation--이관-원문--reusable-production-workflowmd--8"></a>

#### 이관 원문 — REUSABLE-PRODUCTION-WORKFLOW.md / 8

출처: [docs/score-production/REUSABLE-PRODUCTION-WORKFLOW.md](../how-to/produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

<a id="production-tool-validation--회고-중-확인한-집계-범위-보완"></a>

###### 회고 중 확인한 집계 범위 보완

과거 스냅샷과 같은 종료 시각 `2026-10-22T16:58:43.232879+00:00`으로 재현했다. 기존 제작 측 246요청·27,840,157토큰·공개 단가 참고 환산 `$74.181708`은 그대로 일치한다. 로그 전체 탐색에서는 오래된 날짜 폴더의 수신자 채팅에 연결된 추가 3요청·449,550토큰·`$3.366168`도 확인했다. 제작 측과 인계 후 수신자 범위 합계는 249요청·28,289,707토큰·`$77.547876`이다.

이는 **집계 범위 차이**이며 제작 성능 개선 수치가 아니다. 미가격 3,121,966토큰과 종료 후 응답은 별도이며 실제 청구액은 확인되지 않았다. 과거 단가를 재현용으로 사용했고 현재 단가로 단정하지 않는다. 과거 스냅샷은 보존하고 `data/production/ioi-suddenly-20261023/metrics-reuse-check/scope-comparison.json`에 추가 요청의 메타데이터만 기록했다.

해결 기준: 시작 날짜 폴더만 탐색하지 않고 명시한 세션 범위에서 root turn과 인과관계를 함께 확인한다. 정형 집계는 종료 때 코드로 한 번 처리한다. 이번 전체 125로그의 로컬 집계 시간은 약 2.08초였지만 전체 제작 시간·토큰 절감률은 다음 실제 제작에서 같은 검증 범위로 측정해야 한다. 반복 화면 작성·측정 전담 AI·수작업 인계 조립을 제거한 효과를 아직 측정하지 않은 백분율로 보고하지 않는다.

<a id="score-process-evidence--확인한-자료와-현재-미확인-사항--2026-10-04"></a>

###### 확인한 자료와 현재 미확인 사항 — 2026-10-04

이번 문서 정비에서 제작 문서·history·정본·기존 도구 인터페이스와 보존된 원시 자료를 읽었다. 위 두 제작 세션의 보존 요약도 대조했다. 전체 과거 대화를 다시 전수 열람하거나 악보를 재생성하지는 않았다.

- Real Paradis 보존 후보 `experiments/musicxml/real-paradis-110-candidate.musicxml`의 현재 해시가 기록의 `d5033d473bef0a63d2ded5f2e09234b168b7306d1872fdce9981d9864516f8f6`와 일치한다. 재현 폴더와 Audiveris 원시 보고서도 존재한다. 이는 현재 앱의 XML을 이 과거 후보로 교체하라는 뜻이 아니다.
- Loveholic의 최초/재생성 `verification.json`, 표준 가사 `printed-note-lyrics.json` 및 실제 표시 `note-centre-alignment-after.json`을 확인했다. 최종 표시 자료는269개·문자 불일치0·최대0.0972342316px,25–32마디27개 최대0.0229176475px다. 당시 패키지 해시18c741…는 보존된 그 시점의 결과다.
- 현재 로컬 수록 ZIP을 읽은 결과 Loveholic123마디/269가사/firstBeat0.193초/BPM136, Real Paradis110마디/515가사/firstBeat0.38897134124462235초/BPM94다. 수록 해시는 각각 `2a544df486c26feca450e7021787e43c4ad6db4fc8f8be1dc6d49d5f4cbcaf50`, `9673fb348e3c84f9f7789ccdc07fffcea414d36161fcb3496047e0fec3fca8e4`로 초기 제작 패키지와 다르다. 현재 파일의 존재/메타데이터 확인이며 새 재생 검수가 아니다.
- 카운트오프 로컬 수정은 현재 미커밋 `src/model/model.ts`에 있으며 history에90파일441테스트·build26dbe96c 기록이 있다. 이번 문서 작업에서 테스트를 다시 실행하지 않았다. 실물 iPad OFF/ON 청취·이 수정의 공개 배포는 미확인이다.
- 두 곡 전곡의 독립 외부 이중 전사, 스캔·사진 신규 곡에서 위 경로의 전체 제작 성공, 모든 새 양식/주법·다른 소비자에서의 렌더/확장 필드 왕복은 확인하지 않았다. 현재 방식은 두 벡터 PDF의 경험을 일반화한 절차이며 성능·정확도 보증이 아니다.
- 이번 작업은 문서 정비다. 실제 앱 재생·기기 청취·새 패키지 생성·수록 교체·commit·push·발행은 수행하지 않았다. 다음 곡에서는 그 곡의 실제 환경·입력으로 각 단계의 근거를 새로 만든다.
