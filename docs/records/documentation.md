# 문서 정리와 검증 기록

## 문서 진입점과 완료 상태 정리 — 2026-10-27~28

루트 README의 시작 링크를 현행 문서 안내로 바로잡고, 완료 기록 목록에서 빠진 릴리스·pnpm·성능 기록 6개를 연결했다. 메모리 개선의 계획 다섯 항목은 원문 그대로 실행 기록에 옮기고 이전 주소에는 완료 상태와 후속 발행·검증 한계만 남겼다. 문서 안내는 완료 계획의 이전 주소를 진행 중 계획과 구분한다.

문서 파일 삭제나 주소 변경 없이 정리했으며, 기존 Rule·승인 범위·실측·실패·미확정 기록을 유지했다. 구형 설치·빌드·배포 묶음 청소와 보존 범위, 문서별 변경·검증 근거는 [이번 작업 기록](archive/project-cleanup-20261027.md)에 함께 보존한다.

## 실행 절차·악보 제작 스킬의 정본 중복 정리 — 2026-10-23

- 목표: 실행 절차와 제작 스킬에 복제된 Rule·승인 경위·날짜별 결과를 정리한다.
- 범위: `docs/how-to/`의 9개 문서와 `.agents/skills/produce-drum-score/SKILL.md` 전체. 대응하는 현행 Rule·기존 ADR·곡별/환경 기록을 대조했다.
- 완료 기준: 규칙은 정본 참조로, 결정·관측은 기존 기록으로 연결한다. 실제 입력·순서·명령·검수 항목·완료 조건과 권한 경계는 유지한다.
- 제외: Rule 내용 변경, 앱·설정·악보·미디어 변경, 실제 제작·시험 재실행·메시지 전달·Git 통합.
- 검증: 변경 전 원문·해시, 규칙/이력의 목적지, 명령 예시·앵커·스킬 메타정보·문서 링크와 비대상 파일을 대조한다.

### 파일별 처리

| 대상 | 정리 내용 | 유지한 실행 정보 |
| --- | --- | --- |
| produce-score.md | 승인 날짜·입력 확장 경위, 메타정보·인계 권한 중복, 과거 판독/실패 서술을 정본·기록 참조로 교체. 키트 선택과 음원 검증을 ADR 이관 원문 대신 현행 Rule/절차로 연결 | 접수부터 인계까지 단계, 도구 명령·입력 스키마, 담당 연락처 확인, 실제 전송/접수, 오류 조사·기록 순서 |
| correct-lyrics.md | 저장 구조·보컬 입력 계약의 복제 문장을 정본 참조와 실제 조작/재읽기 순서로 정리. 특정 곡 사례는 목록으로 연결 | 원문/음표 대조·추정표·교체 확인·이전 가사 보존·수동 피드백 처리 |
| review-score.md | 7원칙 수치 복제와 폐기 UI 경위 제거. 카운트오프의 제품 동작 서술은 정본 대조 작업으로 전환 | OFF/ON 표, 왕복/표시/저장 검수, 실제 회귀 입력, 검수 화면 API 예시·해제 |
| develop.md | 구형 명령 경위 제거, 소스 권위는 정본 참조. 발행 결과를 절차 파일에 기록하던 링크를 records/releases로 수정 | 개발·서식·검증 명령과 환경 확인 |
| release.md | 서버/DB/개인정보 계약 중복과 과거 직접 push 서술을 정본 참조로 정리 | 실제 프로젝트·배포 ID/주소·대상 경로, 빌드·발행·공개 확인 순서와 변경 직전 권한/대상 확인 |
| render-drum-audio.md | 과거 샘플/앱 설치 제외 서술을 라이브러리 Rule 참조와 누락/해시 대조 작업으로 정리 | 키트 선택·지원 확인·이벤트 렌더·재읽기·인계 |
| use-apple-local-tools.md | 과거 11구간·69후보 수치를 기존 관측 기록에 맡김 | SDK/모델 확인, CLI·manifest/anchors 예시, 새 실행 결과 기록 |
| verify-ipad.md | 삭제된 구형 UDID와 사용자 제공 24시간 승인 정보·당시 미검증은 환경 기록으로 연결 | 지정 대상과 실제 가용 목록 대조, CLI 예시, 현재 권한 확인, 기기별 검수 |
| verify.md | 과거 172오류·이동 전 121개 테스트 수와 도입 서술 제거. 설정 변경 경계는 검증 Rule 참조 | 명령별 검사 범위, 로컬 자산 목록, Safari 실제 조작/오디오 상태 확인, 수록·화면 검수 순서 |
| produce-drum-score 스킬 | 원본 경로 결정 날짜, 7원칙·O+·가수란·상시 인계 결정의 복제 본문과 곡별 과거 결과를 정본/기록 링크로 교체 | 입력별 분기·영상 판독 절차, 공통 도구 호출, 교정·검증·실제 인계 실행 안내. 스킬 이름·설명·호출 범위 유지 |

실행 중 바로 대조해야 하는 입력 필드·지원 조건·검수 기대값과 변경 직전 대상/권한 확인은 작업 단계에 남겼다. 이런 짧은 확인을 제거해 실행 절차를 링크 목록만으로 만들지 않았다. 기존 곡의 명령 예시·회귀 입력은 재현 목적을 명시한 상태로 보존했다.

규칙 원문은 현행 `reference/`에 그대로 있으며, 결정/과거 관측은 기존 ADR-0017·0018·0027, 곡별 Loveholic·탐탐 무빙·붉은 노을 기록, Apple 로컬 도구·iPad 기록에 남아 있다. 새 ADR이나 같은 과거 결과의 복사본을 추가하지 않았다. 스킬의 상세도는 skill-creator 지침에 맞춰 조정했다.

### 검증과 한계

- 문서 102개의 파일·문단 링크, 기존 앵커·중복 앵커·공백 검사 통과. 대상 10개 문서의 코드 블록 예시와 스킬 frontmatter가 변경 전과 동일하다.
- 스킬 `quick_validate.py` 통과. 실제 악보 제작·영상 조회·음원 렌더·앱 수록·외부 메시지는 실행하지 않았다. 형식/참조 검증을 제작 동작 검증으로 보고하지 않는다.
- 기존 삭제 61개만 반영한 임시 Git 인덱스로 `npm run check:docs` 통과. 실제 인덱스 해시와 검사 코드 유지. 기본 검사기의 미스테이징 삭제 처리 한계는 남아 있다.
- 비 Markdown 538개·보호 문서 4개·지정 MusicXML/SVG 2개의 해시 유지. 현행 Rule·기존 ADR·곡별/환경 기록도 변경하지 않았다. 이번 변경은 절차 9개·스킬 1개·이 작업 기록과 history다.
- `git diff --check` 통과. 변경 전 원문·수정 대응·검사 결과는 `.tmp/procedure-rule-dedup-20261023/`의 `before.json`, `edits.json`, `review.diff`, `checks.json`, `preservation.json`, `doc-check.json`에 보존한다.

## 공통 Rule의 사례 안내 재검토 — 2026-10-23

- 목표·범위: 현행 Rule 21개에서 특정 곡을 기본 사례로 고정한 안내, 과거 기록을 현행 계약이나 새 기록 목적지로 사용한 표현을 재검토한다.
- 완료 기준: 일반 제작 사례는 기존 곡별 목록으로 연결하고, 승인된 적용 범위·호환성 계약·성능 기준과 원문 기록은 유지한다.
- 제외: 앱 코드·설정·악보·미디어·버전·Git 통합. 기존 dirty 변경을 보존한다.
- 검증 방법: 변경 전 원문·해시 대조, 문서 파일/앵커·기존 앵커·공백 검사, 생성 UI 문서 일치와 비대상 파일 보존 확인.

### 수정과 유지 판단

| 대상 | 판단·처리 |
| --- | --- |
| production의 Real Paradis 110마디·Loveholic 123마디 사례 표 | [곡별 제작 기록 목록](README.md#곡별-제작-기록) 하나로 연결. 새 곡도 목록에서 찾고 원본 형식·판독 문제·검증 범위로 선택 |
| 같은 표의 이전 main 통합 | 정책 표에서 제거. 실제 [통합 원문](archive/musicxml-evaluation.md#musicxml-integration--pdf--musicxml-main-통합)과 [비교 원문](archive/musicxml-evaluation.md#musicxml-comparison--두-musicxml의-원본-복원-품질-비교--2026-09-19)은 유지 |
| production의 Real Paradis 청취 피드백 사례 | 목록으로 연결. 확인 경계는 해당 곡에 기록하고 과거 확인값을 새 곡에 복사하지 않는 계약 유지 |
| tools의 판독 설정·초기 생성/갱신 안내 | 공통 책임과 곡별 설정 위치로 표현. 이전 예시는 `profiles/red-sunset-review.json`, `profiles/loveholic-lyrics.json`, 135마디 예외, Loveholic 초기 `build`와 후속 `refresh`/가사 보정이었다. 실제 파일/API와 곡별 판독은 변경하지 않음 |
| notation의 이전 링크·Loveholic 오분류 문구 | 범례 승인·교정 근거와 곡별 사례라는 역할로 표현. ADR-0007 원문 링크와 기존 앵커 유지 |
| architecture의 구조 개편 이동표 참조 | 해당 기록에 있던 기존 모듈 협력 경계를 현행 Rule 본문에서 읽을 수 있게 정리. 이동표는 당시 기록으로 명시. 의존 관계 변경 없음 |
| architecture의 과거 품질 계획에 새 검증을 기록하라는 안내 | 검증 Rule로 기준을 연결하고 history·주제별 records에 새 결과를 남기도록 수정. 과거 계획 원문 유지 |
| documentation의 사례 연결 기준 | 사례 목록을 기본 입구로 사용하되, 승인 예외·호환성·성능 범위를 식별하는 참조는 유지하도록 명시. 기존 ADR-0001의 역할 분리 원칙 적용이며 새 ADR 생성 없음 |
| MusicXML의 Loveholic 일정 연결과 붉은 노을 recording-grid 필드 | 승인된 곡별 적용 범위와 런타임 사용 금지 계약이므로 유지. 일반 제작 사례 안내와 구별 |
| rendering의 123마디 성능 기준·OSMD 업데이트 증거 | 정량 기준의 입력 규모와 과거 검증 출처이므로 유지. 전체 악보의 보편 성능 보장으로 확대하지 않음 |
| 나머지 Rule의 과거 저장 데이터·DB 마이그레이션·릴리스 식별자·고지·ADR 참조 | 호환성·보존·권한 또는 선택 근거를 설명하므로 유지. 특정 곡을 기본 사례로 요구하거나 archive에 새 결과를 쓰라는 안내와 구별 |

원문 곡별 제작 기록·archive·기존 ADR은 수정하지 않았다. 코드 진입점을 식별하는 어댑터 파일명과 SoCal/Portland 지원 키트명도 유지했다. 전체 Rule 재검토는 참조의 역할·적용 범위에 대한 문서 검토이며 앱 기능을 재실행한 결과가 아니다.

### 검증 결과

- 문서 102개의 로컬 파일·문단 링크 3,393개(절대경로 6개 포함), 중복/누락 앵커·공백 검사 통과. 기존 문서·앵커 삭제 없음.
- 비 Markdown 538개, 보호 문서 4개와 지정 MusicXML/SVG 2개의 해시 유지. 이번 변경은 Rule 5개와 작업 기록·history, 총 Markdown 7개다.
- 이전 정리에서 삭제한 61개 경로만 임시 Git 인덱스에 반영한 `npm run check:docs` 통과. 실제 인덱스 해시 유지. 기본 검사기의 미스테이징 삭제 파일 처리 한계는 남아 있으며 검사 코드·스테이징 상태를 바꾸지 않았다.
- `git diff --check` 통과. 원문 스냅샷·차이·결과는 `.tmp/rule-case-routing-20261023/`의 `before.json`, `review.diff`, `checks.json`, `doc-check.json`에 보존한다. 외부 URL 재조회·앱 실행 검사는 수행하지 않았다.

## 현행 Rule 전체 명료성 재검토 — 2026-10-23

- 목표: 현행 Rule 전체의 중복·모순·모호한 표현·불필요한 내용과 탐색 경로를 점검한다.
- 범위: Rule 목록의 주 정본 20개와 기계 입력 예외 1개 전부. 연결된 ADR·history·관련 코드, 제작 절차·스킬의 기록 위치도 대조한다.
- 완료 조건: 각 파일의 검토 결과를 남기고 기존 결정으로 해결되는 문구만 정리한다. 정책 미확정과 구현 확인 필요는 별도로 기록한다.
- 제외: 앱 코드·설정·악보·미디어·런타임·버전·커밋·원격 작업. 문서와 코드 차이를 이번 작업의 앱 수정 승인으로 해석하지 않는다.
- 검증: 변경 전 원문·해시, 변경 문구와 기존 결정 대조, 로컬 파일·문단 링크, 기존 앵커, 생성 문서 일치, 공백과 비대상 파일 보존.

### 판정과 수정 근거

Rule·절차·결정·실측의 큰 분리는 유지할 수 있다. 다만 여러 문서를 합친 뒤 남은 반복 서문 19개, 같은 중복 등록 정책의 복사본, 모호한 사후 보충문과 몇 가지 오래된 표현을 정리했다. 숫자가 있거나 기술적으로 상세하다는 이유만으로 저장 계약·권한·지원 한계·검증 조건을 삭제하지 않았다.

| 발견 | 처리와 근거 |
| --- | --- |
| PRD의 ‘전체 Rule’이 archive로 연결 | 현행 RULES-INDEX로 수정. 파일 존재 검사만으로는 찾을 수 없는 의미상 오연결 |
| 설정의 ‘내 음원 목록’과 ‘백업’ 혼재 | 10/15 history의 ‘설정 백업 제목 간소화’, file-formats의 현행 UI 계약에 맞춰 **백업**으로 통일. 곡 목록의 내 음원 목록 명칭은 유지 |
| iPad 세로 적용 폭 720~850/899 혼재 | 10/14 history의 넓은 세로 배치 결정·ADR-0021·`06-responsive.css`의 최종 media query에 맞춰 **720~899px**로 통일 |
| 카운트오프 네 박/한 마디 혼재 | 10/15 박자 선택 통합과 `model.ts::preludeCountBeats`, `audio-preview-metronome.ts` 대조. **일반 시작은 4분음표 네 번**, 음원 연주 전 겹침은 **선택 박자의 한 마디분**으로 구분. 분석·음원·재생 동작 변경 없음 |
| 박자 조작을 두 입력으로 설명 | history의 박자 선택 통합과 음원 Rule에 맞춰 하나의 [박자] 선택으로 안내 |
| 연습 파일의 ‘명시적 재분석 허용’과 제거된 UI | 현재 수동 재분석 버튼 없음과 직접 보정 가능을 명시. 복원 데이터 자동 재분석 금지는 유지 |
| archive에 새 문제를 쓰라는 지시와 맨 끝의 반대 보충문 | 새 곡별 문제는 records/songs, 공통 도구 문제는 records/production-tools로 본문에 통합. archive는 조회용. 같은 잔여 지시가 있던 제작 절차·스킬도 기록 목적지만 맞춤 |
| 모든 가사 피드백을 Real Paradis 문서에 쓰는 표현 | 해당 곡 기록을 사용하고 Real Paradis는 사례임을 명시 |
| 모든 가사를 음표에 연결한다는 문장과 measureLyrics 계약 | 음표 대응을 판독한 가사와 마디 귀속만 확인한 문구의 적용 범위를 구분. 새 음가를 추측하지 않으며 기존 두 저장 방식 유지 |
| 드럼킷의 ‘소개 표’ 위치 불명확 | 기존 ADR-0019의 실제 표로 직접 연결. 제작 후보는 보존된 두 키트만 유지 |
| PDF 없는 제작에도 원본 PDF 줄을 요구하는 표 | PDF 변환은 원본 줄, 영상·새 작곡은 해당 XML 시스템 구성을 사용한다고 범위를 명시. 기존 제작 스킬의 PDF 없는 제작 기준과 일치 |
| 변경 가능한 엔진·폰트·캐시 번호 중복 | lockfile·폰트 배치 문서·SCORE_RENDER_POLICY를 직접 참조. 실제 버전이나 캐시 정책은 변경하지 않음 |
| 구형 MusicXML 내보내기 메뉴 이름 | XML 직접 저장 계약을 유지하고 오래된 ‘파일·안내’ 메뉴 경로는 제거. 아래 구현 확인 항목으로 분리 |

### 파일별 전수 검토

아래 표의 ‘유지’는 문서 의미 검토 결과이며 해당 앱 기능을 새로 실행해 통과했다는 뜻이 아니다. 경로는 프로젝트 루트 기준이다.

| 파일 | 검토 결과 |
| --- | --- |
| AGENTS.md | 역할·권한·버전·보존 경계 유지. ‘새 문서’라는 모호한 지칭과 반복 기록 안내 정리 |
| PRD.md | 제품 범위·저장/자동 분석·명시적 백업의 구분 유지. 현행 목록 링크와 조사 오기 수정 |
| docs/reference/engineering/architecture.md | 앱/공통 모듈 소유권·호환성·기계 입력 예외 유지. 반복 서문 축약 |
| docs/reference/engineering/documentation.md | Rule/절차/ADR/사실 구분, 승인된 안내 삭제 예외 적절. 변경 없음 |
| docs/reference/engineering/i18n.md | 앱 문구와 곡 콘텐츠·외부 원문 예외 명확. 반복 서문만 축약 |
| docs/reference/engineering/release.md | 버전 증가 시점·단계별 권한·로컬/공개 경계 유지. 반복 서문만 축약 |
| docs/reference/engineering/security.md | 기기 내부 처리·입력 제한·보호 한계·과거 DB 이력과 런타임 구분 유지. 반복 서문만 축약 |
| docs/reference/engineering/third-party-notices.md | 고지 수집·외부 배포의 미확인 범위를 유지. 법적 검토를 새로 완료했다고 판단하지 않음. 반복 서문 축약 |
| docs/reference/engineering/verification.md | 변경 영향·환경별 증거·미실행/실패 구분 적절. 변경 없음 |
| docs/reference/product/audio-practice.md | 일반 연습/원곡/조정의 범위 유지. 연주 전 카운트 기준 정리, 중복 등록 규칙은 파일 정본으로 연결 |
| docs/reference/product/editor.md | 편집 세션·저장·검수 Canvas와 원본 보존 계약 유지. 반복 서문만 축약 |
| docs/reference/product/playback.md | 설정 명칭·카운트 범위·네 종류 버튼을 명확화. 마커5/구간9·FIFO·정지 탐색 유지 |
| docs/reference/product/ux.md | 태블릿 폭·박자 선택·악보 이전 버전 복원 미지원의 범위를 정리. 터치 크기·상태·도움말 예외 유지 |
| docs/reference/score/drum-kits.md | 보존 두 키트·샘플 검사·메타정보·음원 요청 범위 유지. 소개표 직접 연결 |
| docs/reference/score/file-formats.md | ZIP/JSON API·제한·원자적 복원·중복 정책 유지. 제거된 수동 재분석 UI와 구분 |
| docs/reference/score/musicxml.md | XML 정본·파생값·박/초 단위·가사/음원 연결 유지. 구형 내보내기 메뉴 경로 정리 |
| docs/reference/score/notation.md | 승인 범례·O+·음가/성부·일반 대체의 승인 경계 유지. 마디 가사와 음절 가사 구분 |
| docs/reference/score/production.md | 원본 분류·표본 평가·보존·상시 인계 범위 유지. 기록 목적지와 곡별 피드백 적용 범위 정리 |
| docs/reference/score/rendering.md | 최종7원칙·최소 offset·텍스트·PDF/연습 화면 구분 유지. PDF 없는 제작과 구현 식별자의 권위 명확화 |
| docs/reference/score/tools.md | 공통 코드/곡별 판단·API·선택적 STT/AFM·실패 처리 유지. 반복 서문만 축약 |
| docs/plans/PLAYBACK-SCREEN-INVENTORY.md | 기계 입력 P01–P25/E01–E06·공통 책임표 검토. 파일 전체 바이트 유지 |

전체 페이지는 원본 줄 구성, 기본 두 줄 연습은 4마디라는 구분은 ADR-0005에 명시된 후속 결정과 일치한다. 균등 모드의 사분음표당 8칸과 연주 지시의 0.0625 사분음표 표시 offset도 서로 다른 계약이므로 임의로 같게 만들지 않았다. 원곡 1배속·선택한 연습 BPM의 일정 박, 음원 단독 자동 분석·기존 악보의 명시적 beatTimes 허용도 적용 대상이 달라 유지했다.

### 남은 정책·구현 확인 항목

1. 전체 SVG 내부의 **가수·드럼킷 표시**는 현재 규칙에서 미확정이다. BPM 숨김은 현재 규칙으로 명시돼 있다. 앱 상단 표시와 독립 SVG의 표시를 섞지 않았고 새 표시 결정을 만들지 않았다.
2. MusicXML 내보내기 UI: 소스에서 `main.ts`가 `export-musicxml`을 구형 `backup-dialog`에 넣고 `score-management.ts`는 그 영역을 숨긴다. 문서의 이전 메뉴 경로를 현행 이용 가능 경로로 보장할 수 없어 제거했다. 실제 UI 접근 가능 여부와 수정 필요는 개발 작업에서 확인해야 한다. XML 저장 계약 자체는 유지했고 이번에는 앱 코드·GUI를 변경/시험하지 않았다.
3. 기본 `check:docs`의 미스테이징 삭제 파일 처리 한계는 직전 정리 때와 같다. 문서/Rule 문제가 아닌 검사 도구의 파일 목록 처리 문제이며 아래 임시 인덱스 검사와 구분한다.

### 검증 근거

- 21개 검토 대상의 전체 본문을 읽고 기존 결정·관련 구현을 대조했다. 문서 102개의 로컬 파일/문단 링크·중복 앵커·기존 앵커 보존·공백 검사 통과. 규칙 표의 변경은 위에 설명한 카운트 버튼 이름·원본 구분·기록 위치·구현 식별자 참조뿐이다.
- 비 Markdown 538개, 기계 입력/생성 문서 4개, 지정 붉은노을 MusicXML·SVG 2개는 시작 해시와 일치했다. 파일 추가·삭제는 없다. ADR 27개 원문은 변경하지 않았다.
- 기존 삭제 파일만 제외한 임시 Git 인덱스로 `npm run check:docs`를 실행해 생성 UI 문서 일치와 상대 파일 링크 검사 통과. 실제 인덱스는 해시가 같으며 검사 코드는 변경하지 않았다. 기본 인덱스에서의 삭제 파일 처리 한계는 그대로다.
- `git diff --check`에서 중복 보충문 제거 뒤 남은 EOF 빈 줄 2곳을 확인해 정리한 후 재검사했다. 앱 테스트/빌드·GUI·음원·외부 URL 응답 검사는 실행하지 않았다.

시작 시점 원문·해시는 `.tmp/rule-clarity-review-20261023/before.json`, 개별 교정 메모는 `edits.json`, 전체 문서 diff는 `review.diff`, 검사 결과는 `checks.json`·`doc-check.json`에 보존한다. 판단 근거는 기존 history·ADR와 위에 특정한 코드의 읽기 결과이며 새 기능 승인이나 새 런타임 검증을 뜻하지 않는다.


## 이전 주소 안내와 임시파일 정리 — 2026-10-23

- 목표: 통합 후 불필요한 이전 주소 안내와 일회성 작업 파일을 제거한다.
- 범위: 사용자가 삭제를 승인한 안내 98개, 관련 문서 링크·이전표·관리 규칙·ADR-0001, 이번 통합의 임시파일.
- 완료 조건: 코드·인계 설정이 참조하는 안내는 보존하고, 삭제한 안내의 내부 링크는 새 목적지로 연결한다.
- 제외: 앱 코드·설정·악보·미디어·런타임·기존 dirty 변경, 별도 이력 진입점 7개, 다른 작업의 임시자료, Git commit/push/merge.
- 검증: 문서 파일·문단 앵커 검사, 생성 문서 일치, 공백 검사, 비 Markdown·보호 문서·악보 해시 대조.

### 정리 결과

- 안내 98개 중 92개를 삭제하고 6개를 유지했다. 프로젝트 Markdown은 194개에서 102개가 됐다. 삭제한 주소·앵커는 [이전표](documentation-migration.md)에 문자로 남기고 새 주 목적지 링크를 유지했다. 과거 대화의 삭제된 파일 링크는 연결되지 않는다.
- 유지한 안내: `docs/operations/TESTING.md`, `docs/score-production/IOI-SUDDENLY-CONVERSION.md`, `RED-SUNSET-OPEN-CLOSE-20261023.md`, `RED-SUNSET-REBUILD-20261023.md`, `LYRIC-SYNC-SUSPECTS.md`, `LYRIC-SYNC-CORRECTION.md`(마지막 5개는 같은 `docs/score-production/` 폴더). 검사 코드·인계 프로필·가사 코드 주석의 기존 참조를 보존한다.
- 일회성 `migrate.py`, `refine.py`, `polish.py`, `ledger.py`, `split-evidence.py`와 `active-refs.txt`, `code-refs.txt`, `content-differences.json`을 삭제했다. 안내 208,060바이트와 임시파일 137,225바이트를 제거했다.
- 원문 `before.json`, 대응표 `mapping.json`, 원문 대조 자료와 최종 `checks.json`·`fidelity.json`은 `.tmp/documentation-consolidation-20261023-execution/`에 보존한다. 기존 `check.py`·`fidelity.py`는 안내 삭제 전 통합 검증용이며, 정리 이후 검사는 `cleanup-check.py`로 구분한다.
- `docs/plans/restructuring-map.json`은 이전 구조 개편의 출발/도착 경로 기록이다. 실행 코드의 파일 입력이 아니므로 당시 경로를 소급 수정하지 않았다.

### 정리 후 검증

- `cleanup-check.py`: 남은 Markdown 102개 전체의 로컬 파일·절대경로·문단 앵커·중복 앵커·공백 검사 통과. 비 Markdown 538개, 기계/생성 문서 4개, 유지 안내 6개, 지정 MusicXML·SVG 2개의 해시가 정리 시작 시점과 같다. 승인 목록 밖 삭제와 새 비 Markdown 파일은 없다.
- `npm run check:docs`: 실제 인덱스에서는 미스테이징 삭제 파일을 읽어 `ENOENT`로 중단됐다. `projectFiles()`가 Git 목록의 삭제 파일을 걸러내지 않는 것이 원인이다. 실제 인덱스를 복사한 임시 인덱스에서 승인된 92개 삭제 경로만 제외하고 같은 명령을 실행해 생성 UI 문서 일치와 102개 Markdown 상대 파일 링크 검사 통과를 확인했다. 실제 인덱스는 해시가 같고 검사 코드는 변경하지 않았다. 기본 명령은 삭제를 스테이징하기 전까지 같은 한계가 남는다.
- 이전표의 자기 자신을 가리키던 옛 UX 링크 1개는 기존 ADR-0006의 원문 59로 연결했다. 과거 출발 경로와 당시 결정 내용은 유지했다.
- `git diff --check` 통과. 앱 테스트·빌드·악보 재생성·외부 링크 응답 검사는 수행하지 않았다.

이번 정리의 기준 해시·삭제 목록·검사 결과는 같은 임시 폴더의 `cleanup-before.json`, `cleanup-actions.json`, `cleanup-checks.json`, `cleanup-doc-check.json`에 기록한다. 아래 통합/재점검 결과는 삭제 전 시점의 기록으로 보존한다.


문서 역할: **사실·연구 기록**. 원문 날짜·입력·환경·결과·실패·미확인은 각 절의 당시 상태다. 이번 통합에서 과거 검증을 재실행하지 않았으며, 기록의 “현재”는 원래 작성 시점이다. [기록 안내](README.md)와 [현행 정본](../RULES-INDEX.md)을 구분한다.

## 통합 실행 — 2026-10-23

상태: **문서 통합·보존 대조·문서 검사 완료**. 승인 근거는 사용자의 `documentation-consolidation.md`에 따른 재정리 요청이다. [계획 원문](archive/documentation-reorganization.md#documentation-consolidation--프로젝트-문서-구조-통합-실행-계획)과 [파일·문단별 이전표](documentation-migration.md)를 따른다.

### 실행 범위와 결과

- 시작: 2026-10-23 17:43:15 KST. 종료: 2026-10-23 18:05:13 KST 결과 기록 시점; 이후 최종 문서 검사. 브랜치 `codex/fix-playback-wedges`, HEAD `91a4e5bd647880a84406071c8594c20082befaa7`는 시작·종료에 동일하다.
- 기준 파일 686개 중 Markdown 148개를 목록화했다. 101개 이관 대상과 기존 위치 유지 47개를 모두 분류했다. 원문·SHA·Git 상태는 `.tmp/documentation-consolidation-20261023-execution/before.json`에 저장했다.
- 이전 Rule 35개는 **20개 주 진입점(루트 2+분야별 18)**과 기계 입력 표 1개로 찾는다. 현행 요구·필드·단위·지원 한계를 유지했다. 상세 파일 형식, XML/가사 위치, 전체 SVG와 연습 화면 계약은 서로 섞지 않았다.
- 실행 절차 **9개**, 곡별 기록 **6개**와 주제별 기록·연구를 작업 목적별로 연결했다. 기존 ADR **27개**를 재사용하며 ADR-0001에 이번 통합 이유와 예외를 덧붙였다.
- 실제 Markdown은 **148→194개**다. 새 정본·절차·기록과 이전표를 추가하고 옛 주소를 남겼으므로 물리 파일 수가 줄었다는 의미가 아니다. 이번 **이전 안내 98개**, 기존 이력 진입점 7개를 유지한다. 새 본문은 한 주 목적지에 두고 안내에는 복제하지 않는다.
- 경로 예외는 기계 입력 표 1개와 생성·자산 안내 3개다. P01–P25·E01–E06, 생성 UI 목록, 범례·Pretendard 경로의 전체 바이트를 유지했다. 코드·JSON 프로필이 가리키는 기존 주소는 안내로 연결한다. `restructuring-map.json`도 유지했다.
- 프로젝트 AGENTS·루트 README·PRD와 로컬 제작/릴리스 스킬의 참조를 전환했다. 시간 가사 스킬은 변경할 기존 문서 참조가 없어 그대로 유지했다. 전역 지침·외부 설치 스킬은 변경하지 않았다.

### 내용과 의미 대조

850개 제목 단위 본문 중 **842개는 링크 경로·제목 단계·앵커·공백을 정규화한 전체 내용 일치**를 확인했다. 나머지 8개는 [이전표의 본문 재구성](documentation-migration.md#본문을-재구성한-항목)대로 개별 대조했다. 단순 문자열 검사만으로 의미 보존을 단정하지 않고 다음 경계를 함께 확인했다.

- 음량 중복은 재생 정본에 통합하며 50%/100%/켜짐·서버 패키지 기본값·저장/복원값 조건을 보존했다.
- 문서 위치 정책만 승인된 계획으로 갱신했다. 원본 자료 폴더·악보 생성·검사·인계 권한을 변경하지 않았다.
- 제작 접수 경로는 곡별 records로, UI의 악보 검수 두 항목은 review-score로 옮겼다. 누락된 검수 단계가 없도록 제작 순서에 바로가기를 추가했다.
- Real Paradis/Loveholic 경험 표의 10개 데이터 행을 4행/6행으로 분리해 각각 한 번 보존했다. 두 곡 공동 관측의 해시·미확인은 production-tools에 한 번 두고 곡별 기록에서 연결했다.
- Rule의 코드·자료형 예제, XML 확장 필드와 가사 성부, 0.0625박·XML 위치/offset, 표기·패키지 제한과 권한 경계를 대조했다. 후보/미지원·곡별 예외를 공통 승인으로 바꾸지 않았다.
- ADR 27개의 원래 본문·YAML 상태/날짜를 보존했다. 링크 전환과 ADR-0001 추가 외에 결정 내용은 바꾸지 않았다. ADR-0021의 과거 인용에 있던 중복 HTML 앵커 39개는 표시 문자로 보존해 원래 제목 앵커와 충돌하지 않게 했다.

### 검증과 발견한 문제

- `npm run check:docs`: **통과**, 194개 Markdown의 상대 파일 링크와 생성 UI 문서 일치. 스크립트를 먼저 읽어 `--check`의 읽기 전용 경로를 확인했다.
- 별도 문서 대조: **통과**, 로컬 파일/절대 링크·문단 앵커·중복 앵커·기존 주소·미추적 문서의 공백 검사. 초기 가사 기록 앵커 오기 1개와 재작성 목록의 옛 앵커 누락 10개를 수정했다. 이관표 작성 전의 대상 없음 2개는 실제 이전표를 작성한 뒤 재확인했다.
- `git diff --check`: **통과**. 신규 미추적 Markdown은 별도 공백 대조에 포함했다.
- 보호 범위: 기준의 비 Markdown **538개**, 기계/생성·자산 안내 **4개**, 지정 붉은 노을 XML/SVG **2개**의 SHA-256이 시작과 동일하다. 기존 미커밋 코드·설정·도구와 로컬 악보를 보존했다. 이번 추가 파일은 Markdown뿐이다.
- 기록 스냅샷·이전표·개별 재구성 근거·검사 결과는 로컬 `.tmp/documentation-consolidation-20261023-execution/`의 `mapping.json`, `refinements.json`, `polish.json`, `evidence-splits.json`, `fidelity.json`, `checks.json`에 있다. 상시 제품 코드를 새로 만들지 않았다.

### 한계와 다음 작업

외부 URL의 현재 응답은 재확인하지 않았다. 문서 검사는 앱 동작·실기기·청취·악보 조판의 새 검증이 아니다. 서버 실행·앱 시험·빌드·패키지/악보 재생성·공개 전송·커밋·push·merge·배포는 수행하지 않았다. 작업 트리에는 이전 작업과 이번 문서 변경이 미커밋 상태로 남는다.

기계 입력 표/생성 경로의 물리 이동과 코드·인계 설정 경로 갱신은 이번 범위 밖이며, 관련 소비 코드 변경이 허용된 작업에서만 다룬다. 이전 안내는 기존 대화·외부 주소 보존을 위해 유지한다.


<a id="documentation-reconciliation-20261023--문서-모순역할-정리-근거--2026-10-23"></a>

## 문서 모순·역할 정리 근거 — 2026-10-23

문서 정리의 근거 기록이다. 새 기능·정책 승인이나 앱 실행 검증을 만들지 않는다. 현재 Rule은 [목록](../RULES-INDEX.md), 분리 방식은 [ADR-0001](../decisions/0001-separate-svg-rules-and-decisions.md)을 따른다.

| 발견한 혼합/모순 | 확인 근거와 정리 |
| --- | --- |
| PRD 0.7.7·음원 문서 0.7.9를 현재 버전처럼 표시 | history의 0.8.12 기록 → APP-VERSIONS 및 src/app-versions.json. 정본 버전 파일로 연결하고 당시 발행은 별도 기록. 버전 파일은 수정하지 않음 |
| 입력/i18n/검수/캐시의 독립 HTML 저장 안내 | history의 2026-10-13 독립 HTML 저장 폐기 → AGENTS·PRD·TESTING. 옛 안내는 ADR-0020/0024 및 기존 조판 ADR 원문에 보존하고 현재 실행에서 제거 |
| 제작 프로세스의 연습실 ‘악보 업데이트’·구조 기반 연습 기록 보존 | history의 2026-10-13 저장 정책 → PRD·SCORE-PACKAGE. 제작기 편집과 연습실 같은 ID 새 파일 교체를 구분. 현행 패키지 계약을 연결하고 기존 데이터/패키지는 변경하지 않음 |
| 도움말 페이지 분할·모달 (?)·서랍·섹션별 즐겨찾기 | UX 문서 자체 후속 승인 및 history의 10-15/10-21/10-22 → 공통 UX·SVG·설정/마커 계약. 포커스 설명·공통 X·통합 즐겨찾기·고정 조작판을 유지하고 대체 전 시안은 기존 ADR-0005/0006 및 ADR-0021에 보존 |
| 범례 상단 닫기 제거와 나중의 모든 모달 X | 2026-10-21 공통 X와 10-23 O+ 범례 추가 지시 → 현행 UX/매핑. 공통 X·최신 승인 항목을 따르고 옛 27항목/헤더 제거 시안을 소급 수정하지 않음 |
| 조정 창 추종 토글/수동 재분석과 후속 자동 적용 | AUDIO-PRACTICE·UX의 후속 결정. 현행 자동 박 시각 적용과 숫자 보정 경로만 안내하고 구형 토글 제안은 당시 원문으로 분리 |
| 정지 스크롤의 항상 위줄 시작·좌우 탐색·하단 28px | SVG 현행 Rule 및 ADR-0005/0006. 위/아래줄 유지·두 줄 좌우 탐색 제거·현재 여백을 정본으로 연결하고 당시 실측은 이력으로 유지 |
| 편집창 네 탭과 나중의 파일 탭 제거 | SCORE-WORKSPACE의 후속 파일 작업 통합 → 구조/UX 문서. 기본 편집 탭·곡 정보 연결 영역을 유지. SVG 정본과 현재 main.ts의 기존 섹션 편집 탭도 유지하고 총 세 탭으로 제한하지 않음 |
| iOS 18.6 명령과 iOS 27 현재 대상 | IPAD-SIMULATOR의 후속 설치·기기/삭제 기록 → AGENTS 지정 도구. 옛 명령은 사실 기록으로 옮기고 현재 기록된 UDID의 조회/실행 절차를 구분 |
| 공통 도구 검증 수·비용·배포 번호를 현행 성공으로 읽을 여지 | 원문 날짜·해시·입력·미확인 범위 그대로 records/ADR에 보존. 새 결과로 재실행했다고 보고하지 않음 |

프로젝트 문서·history와 최신 사용자 결정으로 충돌을 해소할 수 있어 과거 채팅 재열람·웹 재검색은 필요하지 않았다. 원천 결정이 확인되지 않은 날짜·승인자·성능 개선율을 추정해서 추가하지 않았다. 곡별 가사·실제 악보·앱 소스·제작 산출물은 수정하지 않았다.

원문 출처: `docs/records/DOCUMENTATION-RECONCILIATION-20261023.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="rule-documentation-verification-20261023--프로젝트-rule-문서-정리-검증--2026-10-23"></a>

## 프로젝트 Rule 문서 정리 검증 — 2026-10-23

[정리 계획](archive/documentation-reorganization.md#rule-documentation-reorganization--프로젝트-rule-문서-정리)에 따른 문서 이관 검증 기록이다. 앱 동작·악보 정확도·기기·배포를 다시 검증한 기록은 아니다.


원문 출처: `docs/records/RULE-DOCUMENTATION-VERIFICATION-20261023.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="rule-documentation-verification-20261023--결과와-범위"></a>

### 결과와 범위

- [전체 목록](../RULES-INDEX.md): Markdown 146개를 빠짐없이 분류했다. 현행 Rule 35개, 실행 절차 진입점 17개를 각각 연결한다.
- [결정 이력](../decisions/README.md): 기존 ADR 0001~0016을 재사용하고, 다른 문서에 있던 기존 결정을 0017~0027로 분리했다. 총 27개이며 기존 16개 본문은 변경 전 내용을 접두부 그대로 보존했다.
- 과거 배포·실측·검수 사실은 [사실 기록](README.md)과 기존 곡별 문서에 두었다. 과거 성공을 이번 실행 결과로 취급하지 않는다.
- 모순된 현재 표현은 history와 최신 정본을 대조해 정리했으며, [조정 근거](documentation.md#documentation-reconciliation-20261023--문서-모순역할-정리-근거--2026-10-23)에 기록했다.

<a id="rule-documentation-verification-20261023--보존-검사"></a>

### 보존 검사

작업 시작 때 비제외 Git 파일 647개의 SHA-256과 Markdown 109개의 원문을 확보했다. 기존 미커밋 변경을 포함한 시작 시점과 비교했다.

1. 이관 원문 338개 단위의 원본 해시·출처·목적지 내용을 대조했다. 문단 제목 단계와 상대 링크만 이관 위치에 맞추고, 코드 블록 내부 내용은 보존했다.
2. 현행 문구 75개 단위를 목적지와 대조하고, 저장 형식·공개 API·제한 크기·BPM·시간·메타정보 등 주요 계약 값을 별도로 확인했다. 현재/과거 표현을 바로잡은 항목은 조정 근거에 구분했다.
3. 수정한 기존 문서의 모든 제목 앵커·명시적 앵커를 보존했다. 옮긴 문단은 기존 앵커에서 해당 ADR/기록 원문으로 안내한다.
4. 146개 Markdown의 로컬 파일 링크와 문단 앵커를 대조했다. 누락된 파일·앵커 및 새로 발생한 링크 오류가 없다. 외부 웹 URL의 응답 상태는 검사 범위에 포함하지 않았다.
5. ADR 27개의 번호·메타정보·MADR 절 구성을 확인했다. 코드 블록의 주석은 Markdown 제목으로 세지 않았다.
6. 변경·추가 파일은 허용된 Markdown 범위에 한정됐다. 앱 소스·설정·악보 도구·기존 생성 자산은 시작 시점의 해시와 일치한다. AGENTS·악보 제작 스킬 및 SVG/매핑/MusicXML 정본 세 문서도 이번 정리에서 변경하지 않았다.
7. 최종 붉은노을 MusicXML·SVG 두 파일의 SHA-256이 시작 시점과 일치한다.

| 보존 산출물 | SHA-256 |
| --- | --- |
| `data/production/red-sunset-rebuild-20261023/score.musicxml` | `4c45ae6ed0443a79e65dc095971b564f501a9afd4dcd4472f7b809ce9c909c89` |
| `data/production/red-sunset-rebuild-20261023/full-score.svg` | `1c11378542ff200233d5c1e18efab00dfe33c3f7def5b1ec8619c00e96c23e3b` |

<a id="rule-documentation-verification-20261023--실행한-문서-검사"></a>

### 실행한 문서 검사

- `python3 .tmp/project-rule-docs-20261023/verify.py`: 원문·현행 문구·계약 값·기존 앵커·로컬 링크·MADR 구조·목록 완전성·변경 범위 대조 통과.
- `npm run check:docs`: 생성 UI 문서 일치와 상대 파일 링크 검사 통과.
- `git diff --check`: 공백 검사 통과.

로컬 대조 자료는 `.tmp/project-rule-docs-20261023/`의 `before.json`, `source-manifest.json`, `current-clauses.json`, `inventory.json`, `verification.json`에 있다. 임시 자료는 Git 제외 대상이며 이 문서가 검증 범위·결과의 영구 기록이다. 앱 테스트·빌드·음원 분석·악보 재생성·버전 갱신·커밋·push·배포는 수행하지 않았다.

<a id="rule-residue-audit-20261023--현행-rule-잔여-이력-재점검--2026-10-23"></a>

## 현행 Rule 잔여 이력 재점검 — 2026-10-23

[정리 계획](archive/documentation-reorganization.md#rule-documentation-reorganization--프로젝트-rule-문서-정리)에 따라 [현행 Rule 35개](../RULES-INDEX.md)를 본문까지 다시 읽었다. 앞선 검사는 이관 원문·주요 계약·링크 보존을 확인했으나, 모든 Rule의 잔여 서술을 충분히 분리하지 못했다. 이번에는 날짜별 변경·잠정 문구·폐기된 시안·곡별 수치·당시 검증 상태를 내용별로 재점검했다.


원문 출처: `docs/records/RULE-RESIDUE-AUDIT-20261023.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="rule-residue-audit-20261023--판정-기준"></a>

### 판정 기준

- 현재 요구·금지·기본값·저장/표시 계약·지원 경계·호환 규칙·검증해야 할 조건은 Rule에 유지한다.
- 결정 날짜·선택 이유·대체 전 시안·일회성 구현 경위는 같은 주제의 기존 ADR에 보존한다. 새 ADR이나 새 승인을 만들지 않는다.
- 당시 측정·삭제 관측·기기 미확인 상태는 사실 기록에 둔다. 입력·조사·보고·명령의 순서는 실행 절차에 둔다.
- 기존 문단 주소·ADR/기록으로 가는 링크 제목은 호환용 참조다. 그 제목에 남은 날짜를 현재 Rule 본문의 이력 서술로 보지 않는다. 현재 지원 경계와 검사 요구를 과거 검증 결과와 혼동하지 않는다.
- 곡별 승인 예외는 수치·경위를 옮기더라도 Rule에서 계속 연결한다. 다른 곡에 적용할 기본값으로 바꾸지 않는다.

<a id="rule-residue-audit-20261023--파일별-확인"></a>

### 파일별 확인

31개 파일에서 이력 잔여물 또는 과거 변경을 설명하는 문구를 정리했다. 4개는 잔여 이력이 없어 본문을 유지했다. 아래 표는 전체 35개를 한 번씩 포함한다.

| ID | Rule | 확인·정리 결과 | 근거·이관 대상 |
| --- | --- | --- | --- |
| R01 | [AGENTS.md](../../AGENTS.md) | 포트 폐기 경위·사용자 결정 날짜·과거 릴리스 정정은 ADR-0020/0025로 분리. 현재 실행·권한 조건 유지. | [0020](../decisions/0020-local-editor-and-public-player.md) · [0025](../decisions/0025-shared-app-release-version.md) |
| R02 | [PRD.md](../../PRD.md) | 기능 폐기·승인 날짜를 ADR-0020/0022/0026으로 분리. 입력·보관·제품 범위 유지. | [0020](../decisions/0020-local-editor-and-public-player.md) · [0022](../decisions/0022-portable-score-and-practice-files.md) · [0026](../decisions/0026-device-local-audio-analysis.md) |
| R03 | [DOCUMENTATION-RULES.md](../reference/engineering/documentation.md#documentation-rules--프로젝트-문서-관리-rule) | 이번 최초 이관이라는 일회성 문맥을 ADR-0001로 분리. 일반 문서 관리 계약 유지. | [0001](../decisions/0001-separate-svg-rules-and-decisions.md) |
| R04 | [PROJECT-STRUCTURE.md](../reference/engineering/architecture.md#project-structure--프로젝트-구조) | 모듈 이동·재수출·모달 제거의 구현 경위를 ADR-0023으로 분리. 책임·타입·저장 계약 유지. | [0023](../decisions/0023-shared-module-boundaries.md) |
| R05 | [PLAYBACK-SCREEN-INVENTORY.md](../plans/PLAYBACK-SCREEN-INVENTORY.md) | HTML 폐기 날짜를 ADR-0020으로 분리. 기계 검사에 쓰는 P/E ID 표 전체 유지. | [0020](../decisions/0020-local-editor-and-public-player.md) |
| R06 | [I18N.md](../reference/engineering/i18n.md#i18n--사용자-표시-문구와-i18n) | 키 등록·오류 이전·HTML 폐기의 완료 서술을 ADR-0024로 분리. 문구 계약 유지. | [0024](../decisions/0024-korean-message-catalog.md) |
| R07 | [UX-PRINCIPLES.md](../reference/product/ux.md#ux-principles--팀-ux-원칙과-맥락형-도움말) | 잠정 슬로건·폐기된 페이지/범례 시안·사용자 선택 이유·승인 날짜를 기존 ADR에 분리. iPad 미확인 상태는 기기 기록으로 이동. | [0005](../decisions/0005-practice-layout-and-spacing.md) · [0020](../decisions/0020-local-editor-and-public-player.md) · [0021](../decisions/0021-contextual-help-and-shared-ui.md) · [0026](../decisions/0026-device-local-audio-analysis.md) · [IPAD-SIMULATOR-HISTORY](ipad.md#ipad-simulator-history--ipad-시뮬레이터-설치연결-기록) |
| R08 | [SETTINGS-PLAYBACK.md](../reference/product/playback.md#settings-playback--설정과-재생-정책) | 승인 날짜·폐기된 현재 위치 유지 시안을 ADR-0006으로 분리. 현행 재생 이동 Rule로 직접 연결. | [0006](../decisions/0006-practice-navigation-and-overlays.md) |
| R09 | [MARKER-SLOTS.md](../reference/product/playback.md#marker-slots--마디-마커-슬롯) | 잔여 이력 없음. 마커 수·위치·정렬·키보드 계약 유지. | 본문 변경 없음 |
| R10 | [PLAYBACK-ACTIONS.md](../reference/product/playback.md#playback-actions--재생-이동과-반복-구간-동작) | 이전 위치 유지 규칙을 대체한다는 경위를 ADR-0006으로 분리. 버튼 동작과 예외 유지. | [0006](../decisions/0006-practice-navigation-and-overlays.md) |
| R11 | [AUDIO-PRACTICE.md](../reference/product/audio-practice.md#audio-practice--음원-연습) | 날짜별 UI 추가·변경 표현과 과거 청취 미확인 상태를 ADR/기기 기록으로 분리. 입력·시간·속도·캐시·프리셋 계약 유지. | [0022](../decisions/0022-portable-score-and-practice-files.md) · [0026](../decisions/0026-device-local-audio-analysis.md) · [IPAD-SIMULATOR-HISTORY](ipad.md#ipad-simulator-history--ipad-시뮬레이터-설치연결-기록) |
| R12 | [SCORE-WORKSPACE.md](../reference/product/editor.md#score-workspace--악보제작기-편집-화면) | 날짜별 승인·참고 설계 이유·가사/파일 목업 폐기를 ADR-0021로 분리. 탭·저장·연결 영역 유지. | [0021](../decisions/0021-contextual-help-and-shared-ui.md) |
| R13 | [SCORE-REVIEW.md](../reference/product/editor.md#score-review--pdf--musicxml-검수-계약) | 초기 곡 전용 교정 경위를 ADR-0007로 분리. 검수 진입 조건과 원본/Canvas 계약 유지. | [0005](../decisions/0005-practice-layout-and-spacing.md) · [0007](../decisions/0007-native-drum-notation.md) |
| R14 | [NOTE-PLAYBACK-HIGHLIGHT.md](../reference/product/playback.md#note-playback-highlight--음표-따라가기) | 잔여 이력 없음. 과거 검증은 기존 링크로만 연결하고 현재 표시·검수 기준 유지. | 본문 변경 없음 |
| R15 | [PAUSED-SCORE-SCROLL.md](../reference/product/playback.md#paused-score-scroll--정지된-두-줄-악보의-세로-탐색) | 28px 여백·무조건 위줄 이동 시안 경고를 ADR-0006으로 분리. 현행 배치 정본 연결 유지. | [0006](../decisions/0006-practice-navigation-and-overlays.md) |
| R16 | [MUSICXML-INPUT.md](../reference/score/musicxml.md#musicxml-input--musicxml-입력-계약) | 초기 설계·일회성 추가 문맥을 ADR-0004로 분리. 형식·슬롯·입력 제한 유지. | [0004](../decisions/0004-browser-native-score-rendering.md) |
| R17 | [MUSICXML-CANONICAL.md](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약) | 가사 편집 전환 경위·곡별 템포 수치·승인 날짜를 기존 ADR로 분리. Loveholic 예외를 계속 연결하며 보컬 조작 순서는 제작 절차로 이동. | [0012](../decisions/0012-musicxml-canonical-source.md) · [0013](../decisions/0013-score-based-lyric-positions.md) · [0014](../decisions/0014-score-artist-and-kit-metadata.md) · [0015](../decisions/0015-score-tempo-and-recording-estimates.md) · [0016](../decisions/0016-explicit-recording-beat-connections.md) |
| R18 | [MEASURE-LYRICS.md](../reference/score/musicxml.md#measure-lyrics--마디-단위-인쇄-가사-계약) | 이번 변경의 범위 표현을 ADR-0013으로 분리. 현재 데이터 계약과 편집 지원 경계 유지. | [0013](../decisions/0013-score-based-lyric-positions.md) |
| R19 | [SCORE-PACKAGE.md](../reference/score/file-formats.md#score-package--완성-악보-파일-계약--drumscore-v1) | 사용자 결정 날짜를 ADR-0022로 분리. 공개 API·ZIP·제한·교체 계약 유지. | [0022](../decisions/0022-portable-score-and-practice-files.md) |
| R20 | [PRACTICE-FILE.md](../reference/score/file-formats.md#practice-file--음원-연습-파일) | 일회성 버전/커밋/배포 제외 문맥을 ADR-0022로 분리. 저장·복원·중복 계약 본문 그대로 유지. | [0022](../decisions/0022-portable-score-and-practice-files.md) |
| R21 | [SVG-SCORE-RULES.md](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙) | 승인 날짜·당시 지원 검증 표현을 ADR-0009/0011로 분리. 7원칙·표·좌표·렌더 범위 유지. | [0009](../decisions/0009-musicxml-section-direction-layout.md) · [0011](../decisions/0011-hi-hat-open-close-position.md) |
| R22 | [BROWSER-MUSICXML-RENDERING.md](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약) | renderer-free 대체 경위를 ADR-0004로 분리. 곡별 회귀 대상은 UI 검수 절차로 이동하고 공통 수용 기준 유지. | [0004](../decisions/0004-browser-native-score-rendering.md) |
| R23 | [PDF-DISPLAY-TRIM.md](../reference/score/rendering.md#pdf-display-trim--pdf-연습-화면-표시용-자르기) | 과거 가창 실험 미완료 문맥을 ADR-0013으로 분리. 가창 검증이 필수 조건이 아니라는 현재 범위 유지. | [0013](../decisions/0013-score-based-lyric-positions.md) |
| R24 | [SCORE-PRODUCTION-RULES.md](../reference/score/production.md#score-production-rules--악보-제작-범위와-보존-rule) | 상시 위임 날짜는 ADR-0018로 연결. 인계 대상·시점·승인 범위 유지. | [0018](../decisions/0018-reusable-score-production-and-handoff.md) |
| R25 | [MUSICXML-CONVERSION-POLICY.md](../reference/score/production.md#musicxml-conversion-policy--pdf--musicxml-변환-정책) | 문서 안내 표의 날짜별 실험/통합 설명을 ADR-0017로 분리. 원래 기록 링크와 변환 정책 유지. | [0017](../decisions/0017-source-dependent-musicxml-conversion.md) |
| R26 | [SCORE-MUSICXML-OSMD-MAPPING.md](../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙) | 승인 날짜·예외 채택/실험 이유·기존 6곳 검증을 기존 ADR로 분리. 표기 표 유지, 조사·보고 단계는 제작 절차로 이동. | [0007](../decisions/0007-native-drum-notation.md) · [0009](../decisions/0009-musicxml-section-direction-layout.md) · [0011](../decisions/0011-hi-hat-open-close-position.md) |
| R27 | [GARAGEBAND-DRUM-KITS.md](../reference/score/drum-kits.md#garageband-drum-kits--드럼킷-선택과-보존-라이브러리) | 36파일·0.83GB 실측·20개 소개/18개 삭제·선택 경위를 ADR-0019로 분리. SoCal/Portland 후보와 입력 경로 유지. | [0019](../decisions/0019-preserved-drum-kit-selection.md) |
| R28 | [COMMON-TOOLS.md](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독) | 이번 코드 동등성 검사라는 시점 표현을 ADR-0018로 분리. 공통 API와 곡별 판독 책임 유지. | [0018](../decisions/0018-reusable-score-production-and-handoff.md) |
| R29 | [LYRIC-FEEDBACK-RULES.md](../reference/score/production.md#lyric-feedback-rules--수동-가사-싱크-피드백-접수) | 잔여 이력 없음. 별도 요청 범위의 접수·확인 계약 유지. | 본문 변경 없음 |
| R30 | [APPLE-LOCAL-REVIEW.md](../reference/score/tools.md#apple-local-review--apple-로컬-가사-검토-계약) | 구현 추가 경위를 ADR-0027로, 곡별 앵커 예시는 로컬 실행 절차/사실 기록으로 분리. 임계값과 검토 상태 유지. | [0027](../decisions/0027-verification-scope-and-device-evidence.md) · [APPLE-LOCAL-REVIEW-HISTORY](apple-local-tools.md#apple-local-review-history--apple-로컬-가사-검토-실측-기록) |
| R31 | [VERIFICATION-RULES.md](../reference/engineering/verification.md#verification-rules--검증-범위와-증거) | 잔여 이력 없음. 검증 요구·환경 구분·기록 의무는 현행 규칙으로 유지. | 본문 변경 없음 |
| R32 | [APP-VERSIONS.md](../reference/engineering/release.md#app-versions--앱-공통-버전) | 이번 정리 문맥·과거 버전 번호를 ADR-0025로 분리. 번호 정정·식별자 보존 계약 유지. | [0025](../decisions/0025-shared-app-release-version.md) |
| R33 | [DEPLOYMENT-RULES.md](../reference/engineering/release.md#deployment-rules--배포-범위와-소스-권위) | 과거 실행을 따른다는 오독 방지 문구와 선택 이유는 ADR-0020에 보존. 배포 범위·빌드 입력·권한 계약 유지. | [0020](../decisions/0020-local-editor-and-public-player.md) |
| R34 | [SITE-SECURITY-HARDENING.md](../reference/engineering/security.md#site-security-hardening--공개-사이트-보안과-음원-분석-경계) | 특정 마이그레이션 적용 경위·테이블 삭제 관측을 ADR-0026/발행 기록으로 분리. 이력 보존·실행 권한·API 경계 유지. | [0026](../decisions/0026-device-local-audio-analysis.md) · [SITES-PUBLICATION-HISTORY](releases.md#sites-publication-history--sites-발행공개-확인-기록) |
| R35 | [OPEN-SOURCE-NOTICES.md](../reference/engineering/third-party-notices.md#open-source-notices--오픈소스-고지-계약) | 과거 라이브러리 버전·보강 경위를 ADR-0020으로 분리. 생성 명령은 발행 절차로 옮기고 고지 계약 유지. | [0020](../decisions/0020-local-editor-and-public-player.md) |

<a id="rule-residue-audit-20261023--원문과-규칙-보존"></a>

### 원문과 규칙 보존

- 변경 전 684개 비제외 파일의 해시와 Markdown 146개 원문을 확보했다. 외부 원본·앱 DB·운영 상태를 변경하지 않았다.
- 편집 119건에 대응하는 원문 110개 단위를 대조했다. 51개는 기존 기록의 원문을 재사용했고, 59개는 기존 ADR/사실 기록에 추가 보존했다. 본문 인용은 당시 문맥이며 새 승인·검증 성공이 아니다.
- 기존 ADR 27개 본문은 변경 전 내용을 접두부 그대로 유지했다. 번호·상태·MADR 절 구성도 유지했다.
- SVG 7원칙, 범례 표, 화면 소유권 ID 표, 공통 도구 표, 패키지 API/자원 제한, 연습 파일 저장/복원 계약, 박별 연결 필드를 대조했다. 수치가 빠진 항목은 승인 날짜·폐기 시안·과거 버전·곡별 측정/예시이며 각 기록 또는 절차에서 보존했다.
- 문단 제목 변경 뒤 기존 앵커를 유지했다. 현재 문서 148개의 로컬 파일·문단 링크와 전체 목록 포함 여부를 확인했다.
- 앱 코드·설정·스킬·악보 도구와 기존 생성 자산은 시작 시점의 해시와 같다. 최종 붉은노을 MusicXML·SVG도 별도 SHA-256 대조로 보존을 확인했다. 프로젝트 AGENTS는 날짜·이력 분리만 수행하고 실행·권한 조건은 유지했다.

<a id="rule-residue-audit-20261023--검사-결과와-한계"></a>

### 검사 결과와 한계

- `python3 .tmp/rule-residue-audit-20261023/verify.py`: 원문 보존·기존 ADR 접두부·MADR 구조·핵심 계약·기존 앵커·로컬 링크·목록·변경 범위 검사 통과.
- `npm run check:docs`: 생성 UI 문서 일치와 Markdown 상대 파일 링크 검사 통과.
- `git diff --check`: 공백 검사 통과.

잔여물 판정은 35개 본문의 내용 검토로 수행했다. 날짜·과거 결과 표현 검색은 보조 검사이며 검색 결과가 없다는 사실만으로 의미 보존을 판정하지 않았다. 자동 대조의 첫 실행에서는 연습 파일 계약의 빈 줄 차이가 검출되어 원래 본문 간격까지 맞춘 뒤 다시 확인했다. 앱 실행·빌드·음원 분석·악보 재생성·외부 URL 응답 검사는 수행하지 않았다.

로컬 대조 자료는 `.tmp/rule-residue-audit-20261023/`의 `before.json`, `edits.json`, `evidence.json`, `verification.json`에 있다. 기존 미커밋 작업은 보존했으며 커밋·push·배포는 수행하지 않았다.

최종 검사 중 다른 작업의 [문서 통합 계획](archive/documentation-reorganization.md#documentation-consolidation--프로젝트-문서-구조-통합-실행-계획)이 추가되어 전체 목록에 미착수 계획으로 포함했다. 이 파일의 본문은 수정하지 않았고 그 계획의 실행도 이번 작업에 포함하지 않았다. 따라서 시작 146개에서 이번 검토 기록 1개와 별도 계획 1개를 더한 148개가 최종 링크 검사 범위다.
