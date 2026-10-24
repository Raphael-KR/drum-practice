# 악보 접수부터 제작과 인계까지

문서 역할: **실행 절차**. 현재 요청과 전역·프로젝트 지침의 승인 범위 안에서 수행한다. [정본 목록](../RULES-INDEX.md)과 [작업별 안내](../README.md)를 먼저 확인한다. 예시 명령·과거 기록은 이번 실행의 성공 증거가 아니다.

## 작업 순서 바로가기

1. 접수·보존과 PDF 유형 평가, 구조·악기·주법 교정은 아래 단계 1–3을 수행한다.
2. [4. 인쇄 가사와 음악적 위치](correct-lyrics.md#score-production-process--4-인쇄-가사-대조와-음악적-위치-저장)를 확인한다. 수동 가창 피드백은 별도 요청에만 적용한다.
3. 아래 단계 5로 음원의 첫 박·BPM·마디 연결을 확인한다.
4. [6. 조판·패키지](review-score.md#score-production-process--6-svg-조판재생-캐시완성-패키지), [7. 실제 앱 검수](review-score.md#score-production-process--7-실제-앱-수록본과-저장-곡-검수), [완료 판정](review-score.md#score-production-process--완료-판정과-필수-근거)을 채운다.
5. 아래 단계 8에 따라 기존 개발자에게 인계한다. 앱 반영·청취가 남으면 그 상태와 다음 확인을 함께 전달한다.

<a id="score-production-process--악보-제작-프로세스"></a>

## 악보 제작 프로세스

대상: 사용자 제공 PDF·음원·영상으로 악보를 제작하는 작업. [접수·출력 범위](../reference/score/production.md#score-production-rules--접수와-출력)를 확인한 뒤 이번 요청에 해당하는 단계만 수행한다.

- 목표: 다음 곡을 접수부터 검수·인계까지 재현 가능한 순서로 제작한다.
- 범위: 원본 보존, 변환·교정, 가사, 음원 연결, 공통 조판·패키지, 로컬 앱 수록과 근거 기록.
- 완료 조건: 아래 단계별 검사와 실제 앱 저장·재열기를 확인하고, 원본 보존·추정·미검증·앱 문제를 구분해 인계한다.
- 범위 확인: 요청된 산출물과 실행 권한을 [제작 Rule](../reference/score/production.md#score-production-rules--접수와-출력)에 대조한다.
- 검증: 구조·규격·왕복·원본 대조, 실제 표시와 재생·청취를 각각 확인한다. 수치 검사만으로 청취 완료를 선언하지 않는다.

문서 역할은 **실행 절차**이며 **전체 작업 순서의 단일 진입점**이다. 제작 범위·출력·보존·상시 인계는 [제작 Rule](../reference/score/production.md#score-production-rules--악보-제작-범위와-보존-rule)을 따른다. 변환 방법·매핑·저장·표시 규칙 자체는 아래 정본에서 관리한다. 규칙 변경 시 해당 정본을 먼저 수정하며, 이 문서에 다른 규칙을 만들지 않는다. 현재 사용자 결정과 승인 정본을 과거 제작 코드·검수 기록보다 우선한다.

프로젝트 등록 스킬: [악보 제작 — produce-drum-score](../../.agents/skills/produce-drum-score/SKILL.md). PDF·음원·유튜브 요청에서 이 정본으로 연결하며, 별도의 매핑·저장 규칙을 만들지 않는다.

<a id="score-production-process--시작-전에-읽을-문서"></a>

### 시작 전에 읽을 문서

| 목적 | 정본과 진입점 |
|---|---|
| 작업 위치·보존·권한 | [전역 지침](/Users/raphael/AGENTS.md), [프로젝트 지침](../../AGENTS.md) |
| PDF 유형별 변환, 문제 해결, 첫 박·카운트오프, 악보 우선 가사 | [변환 정책](../reference/score/production.md#musicxml-conversion-policy--pdf--musicxml-변환-정책) |
| 악기·주법·쉼표·스티킹·가사 입력 | [MusicXML·OSMD 매핑](../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙) |
| 전체 SVG·연습 화면·자르기·캐시 | [SVG 출력 규칙](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙), [브라우저 공통 조판](../reference/score/rendering.md#browser-musicxml-rendering--브라우저-공통-musicxml-조판-계약) |
| XML 정본·가사 음악적 위치·음원 연결 | [MusicXML 저장 계약](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약) |
| 새 드럼 음원 제작 시 라이브러리 선택 | [GarageBand 드럼킷 소개·선택 기준](../reference/score/drum-kits.md#garageband-drum-kits--드럼킷-선택과-보존-라이브러리) |
| 완성 파일·업데이트·구조 충돌 | [패키지 계약](../reference/score/file-formats.md#score-package--완성-악보-파일-계약--drumscore-v1), [제작/재생 앱 범위](../../PRD.md#앱과-입력) |
| 공통 코드·곡별 설정·판독 어댑터 | [공통 제작 도구](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독) |
| 실패의 재현과 해결 | [문제 해결 기록](../records/archive/musicxml-evaluation.md#musicxml-troubleshooting--악보-변환-문제-해결-기록), [history](../../history.md) |

읽은 정본의 날짜·Git HEAD·이번 곡에 적용할 사용자 결정을 곡별 제작 문서에 남긴다. 문서 간 모순은 변환 정책의 확인 순서를 따른다. 이미 확정된 악기나 가사 정책을 사용자에게 다시 묻지 않는다.

<a id="score-production-process--유튜브-참고-자료로-제작할-때"></a>

### 유튜브 참고 자료로 제작할 때

[원본 판단 기준](../reference/score/production.md#score-production-rules--원본-판단과-재사용)에 따라 실제 연주 채보와 영상 참고 새 연습곡 제작 중 이번 요청의 방식을 확인하고 곡별 문서에 기록한다.

1. 영상 URL·채널·제목·확인 시점과 실제 확인 방법을 남긴다. 웹 본문 조회가 막혀도 사용자가 승인한 Safari MCP 경로로 본문·설명·스크립트·대표 재생 프레임을 확인할 수 있다. 자동 생성 스크립트는 오인식을 감안하며 정확한 타격 채보의 근거를 대신하지 않는다. 확인하지 못한 음향·구간은 구분한다.
2. 새 연습곡이라면 개념의 근거 구간과 독립적인 마디별 구성·손·시작·음가를 먼저 명시한다. 참고 영상의 악보·연주 녹음과 신규 결과를 구별하며, 영상 음원 추출·재사용은 실제 요청 범위를 확인한다. 새 음원을 만들면 이벤트와 같은 시간표를 사용하고 합성 방법·입력/샘플 출처·재생성 해시를 남긴다.
3. 아래 접수·보존, 매핑·XSD·독립 기대값, 첫 박·카운트오프, SVG·패키지·앱 검수·인계를 적용한다. PDF 유형 판별과 PDF 가사 대조는 해당 입력이 있을 때만 수행한다. 앱 수록을 다른 개발 작업이 소유하면 생성·왕복·공통 렌더 근거와 실제 수록/청취 대기를 구분해 인계한다.
4. 막힘과 해결을 곡별 문서/문제 해결 기록 및 history.md에 남긴다. 웹 조회 실패 자체를 모든 확인 경로의 실패로 보고하지 않는다.

실제 연주 채보는 대표 구간의 악보 화면·타격 장면·음향을 판독해 영상 시각과 마디/박을 연결한 이벤트 표·독립 fixture를 먼저 만든다. 가려진 손·불분명한 타격은 후보로 기록하고 추가 근거로 교정한다. 자동 스크립트나 제목만으로 음가·악기·손을 확정하지 않는다. 탐색 직후 이전 프레임이 남을 수 있어 실제 재생 시각과 화면 변경을 확인한다. 기존 판독·교정 사례는 [곡별 제작 기록 목록](../records/README.md#곡별-제작-기록)에서 찾는다. 기본 패턴 재현과 연습용 템포/반복 정리는 전체 영상 전곡 채보와 구분한다. 영상 기반 요청을 임의 작곡 모드로 대체하지 않으며, 해시·음표 개수·규격 통과를 원본 대조 통과로 보고하지 않는다.

<a id="score-production-process--단계별-작업"></a>

### 단계별 작업

순서는 `접수·보존 → 유형 평가 → 구조 변환 → 가사 → 음원 연결 → 조판·패키지 → 실제 앱 검수 → 인계`다. 실패한 단계로 돌아가 수정·재검증하며, 후속 산출물도 수정된 입력으로 갱신한다. 원인 없이 같은 시도를 반복하지 않는다.

계측이 요청되면 [재사용 실행 안내](produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용)의 시작/단계/종료 CLI를 사용한다. 공통 검수 화면과 인계문 생성기도 같은 문서에 있다. 반복 보고·화면 구현을 줄이되 아래 원본 대조·규격·왕복·실제 표시·청취 조건은 유지한다. 바뀐 입력에 의존하는 결과만 재생성/재검증하고, 변경 없는 검사를 반복 실행하지 않는다.

<a id="score-production-process--1-자료-접수와-원본-보존"></a>

### 1. 자료 접수와 원본 보존

**입력:** 사용자가 지정한 PDF·음원, 곡명·제작자 정보, 기존 XML·패키지·교정본과 이번 작업 범위.

**곡 정보:** [메타정보 저장 기준](../reference/score/musicxml.md#musicxml-canonical--저장-계약)과 [키트 선택 기준](../reference/score/drum-kits.md#garageband-drum-kits--드럼킷-선택과-보존-라이브러리)을 확인해 곡별 입력을 준비한다. 저장 후 MusicXML `creator type="artist"`, `Song.artist`, 패키지의 내장 정본/메타정보를 재읽고 선택한 값과 대조한다.

**수행 방법·도구:** 실제 루트 `/Users/raphael/Playground/drum-practice`에서 `pwd`, `git status --short --branch`, `git rev-parse HEAD`를 확인한다. 자료의 SHA256, 파일 크기, PDF 쪽 수, 음원 길이·채널·샘플레이트를 `shasum -a 256`, `pdfinfo`, `ffprobe`와 기존 분석 도구로 기록한다. 원본은 읽기만 하며 프로젝트 안의 Git 제외 제작 폴더에 사본을 둔다. 새 시도는 새로운 하위 폴더에서 수행한다. 같은 내용의 재접수 여부도 해시로 확인한다.

**산출물:** 곡별 `docs/records/songs/<곡 식별자>.md`, 로컬 `data/production/<곡 식별자>-<접수일>/`의 원본 사본·provenance·이전 결과 목록. provenance에는 원본 경로/해시, 사본 경로/해시, 접수일, 도구 버전, 실행 명령과 출력 폴더를 기록한다.

**완료 조건:** 원본과 사본 바이트가 같고 기존 결과의 보존 위치가 확인된다. 원본·자동 초벌·교정·최종 파일을 서로 구별할 수 있다. 미디어·실험 자료가 Git 제외 대상인지 확인하며 자동 stage하지 않는다. 출력명은 `source-transcription.musicxml`과 `score-final.musicxml`처럼 역할로 구분한다. 대소문자만 다른 이름은 쓰지 않는다.

**실패 시 확인:** 프로젝트 지침과 [통합·자료 보존 기록](../records/archive/musicxml-evaluation.md#musicxml-integration--pdf--musicxml-main-통합). 과거 worktree·이동된 venv를 현재 실행 경로로 가정하지 않는다. 기존 파일이 있는 출력 경로는 새 폴더로 바꾸고, 사용자 자료를 지우거나 덮어써서 해결하지 않는다.

<a id="score-production-process--2-pdf-유형과-변환-경로-결정"></a>

### 2. PDF 유형과 변환 경로 결정

**입력:** 보존한 원본, 페이지별 글리프·글꼴·선/이미지 조사 결과.

**수행 방법·도구:** [변환 정책](../reference/score/production.md#musicxml-conversion-policy--선택-순서)에 따라 벡터/스캔/사진/혼합을 구별한다. `pdfplumber`로 문자 행렬·좌표·오선·줄기·빔을 조사하고 원본 렌더와 대조한다. 선택한 경로로 정책에 정한 대표 구간을 시험하고 일반 패턴·필인·박자/주법 예외의 판독 결과를 비교한다.

**산출물:** 페이지 유형표, 대표 원본 crop, 교정 전 출력/로그, 오류 목록, 선택한 경로와 선택 이유. 대표 구간의 위치와 집계 기준을 고정한다.

**완료 조건:** 대표 구간의 음표·쉼표·동시음·음가와 중요한 예외를 실제로 판독할 수 있다. 누락·애매한 항목 및 필요한 교정량을 기록한 뒤 전체 확장 경로를 결정한다. 낮은 표본 오류율을 전곡 정확도로 표현하지 않는다.

**실패 시 확인:** [문제 조사 순서](../reference/score/production.md#musicxml-conversion-policy--막힘과-문서-모순)에 따라 [곡별 기록 목록](../records/README.md#곡별-제작-기록)에서 원본 형식·판독 문제가 유사한 사례를 찾는다. 기존 코드의 해시 가드를 해제해 다른 곡을 통과시키지 않는다.

<a id="score-production-process--3-musicxml-구조와-악기주법-교정"></a>

### 3. MusicXML 구조와 악기·주법 교정

**입력:** 원본 구조, 대표 판독 근거, 추출한 마디별 이벤트 또는 보존한 자동 인식 초벌.

**수행 방법·도구:** 실제 마디 경계·박자표·템포·성부·동시음·음가·쉼표·점·붙임줄·연음·장식음·반복·구간 지시를 원본과 대조한다. 기존 `tools/score-production/musicxml/`의 추출/내보내기/검증 구조를 참고하되 새 곡의 글꼴·좌표·예외에 맞는 판독과 fixture를 만든다. 악기 이름·MIDI·오선 위치·음표머리·주법은 [확정 매핑](../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙)을 따른다. 원본 성부·화음·기둥 구성을 임의로 공통화하지 않는다.

독립적으로 원본에서 읽은 대표 fixture와 XML 재읽기를 비교한다. 마디 합계가 맞는지뿐 아니라 각 시작·길이·화음·악기·표기를 검사한다. 로컬 MusicXML 4.0 XSD와 기존 `verify.py`의 의존 스키마 resolver를 사용한다. 변환 코드를 바꾸면 누락·잘못된 음가/악기/박자·동시음 분해 등의 오류 주입으로 검출 능력을 확인한다.

**산출물:** 추출 IR/원본 객체, 교정 목록, 마디별 판독 상태, MusicXML 후보, fixture, XSD·재읽기·오류 주입 결과. 번호 연속성·드럼 파트의 마디 수·총 사분음표 길이·머리/쉼표/주법 개수도 기록한다.

**완료 조건:** 원본과 이벤트가 대응하고 의도된 성부별 박 합계·규격·재읽기를 통과한다. 여러 파트의 마디 수를 합쳐 전곡 길이를 계산하지 않는다. 반복 표기와 실제 재생 순서는 현재 [정본 계약](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약)의 지원 범위를 확인한다. 미확정 의미·렌더링 미지원·표시 성공을 서로 구분한다.

**실패 시 확인:** 매핑 정본과 그 승인 이력 → 곡별 제작 문서·원본 fixture → 과거 제작 세션 → MusicXML/OSMD/Audiveris 공식 자료. PDF X간격이나 마디 합계를 맞추기 위한 임의 음가 조정은 하지 않는다. 새 대체 매핑이 필요하면 매핑 정본의 보고·사용자 결정 절차를 따른다.

<a id="score-production-process--5-음원-첫-박bpm마디-시간-연결"></a>

### 5. 음원 첫 박·BPM·마디 시간 연결

**새 드럼 음원을 제작하는 경우:** [보존 드럼킷 제작 절차](render-drum-audio.md#drum-audio--보존-드럼킷으로-음원-제작)를 수행한다. 아래 연결 절차는 제공된 원음원을 사용하는 경우에 적용한다.

**입력:** 원음원 전체, 검증한 마디/박자표, 악보 템포, 판독한 타격 시작, 음원 분석 결과.

**수행 방법·도구:** [첫 박·카운트오프 기준](../reference/score/production.md#musicxml-conversion-policy--첫-박과-카운트오프)과 [음원 연결 계약](../reference/score/musicxml.md#musicxml-canonical--음원-템포와-연습-박)에 따라 연결할 항목·추정 범위를 확인한다. `ffprobe`, 앱 템포 추정/박자 탭, `loveholic_audio.py`의 PCM·spectral-flux/타격 대조 방식을 참고한다. 계산에는 임시 디코딩을 사용할 수 있으나 원음원을 자르거나 재인코딩해 대체하지 않는다. 음원0초와 악보 첫 박을 구분하고 `firstBeat`·첫 마디 start를 맞춘다. 인쇄 BPM과 실연 템포/마디별 연결값이 다르면 각각 기록한다.

초반·중간·후반의 특징적인 타격/필인과 박자 변화·휴지 뒤 시작을 비교한다. 경쟁하는 ±박 위상과 누적 드리프트를 점검한다. 국소 상관값·주변 피크는 추정 근거이며 실제 드럼 타격이나 청취 오차의 확정값이 아니다. 마지막 쉼표와 원음원 끝부분도 보존한다. XML의 안정 마디 ID·음원 해시·시작/끝 연결과 파생 Song을 왕복 대조한다. 국소 연결을 단일 BPM으로 덮어쓰지 않는다.

**산출물:** 음원 연결 JSON/정본 메타데이터, 첫 박·인쇄 BPM·실연 추정·마디 start/end·근거·불확실성, 아래 재생 검수표. 가사 초 단위 캐시는 이 연결에서 계산하며 실제 가창 전사로 표시하지 않는다.

**완료 조건:** 첫 박·템포·시간표의 근거와 원음원 보존을 확인하고, OFF/ON·배속·반복을 실제 재생/청취에서 대조한다. 코드 수치/자동 검사와 기기 청취를 별도 결과로 남긴다. 청취가 없으면 패키지의 재생 검증은 미완료로 표시한다.

**실패 시 확인:** 아래 책임 구분 → 해당 곡 제작 기록과 history → 정본 연결 계약·공통 재생 예약 코드 → 과거 세션 → 공식 자료. OFF 정상·ON 실패를 곡 데이터나 음원 자르기로 우회하지 않는다.

<a id="score-production-process--8-결과-인계와-제작-종료"></a>

### 8. 결과 인계와 제작 종료

**입력:** 원본/최종 해시, 단계별 검사 결과, 해결·추정·미검증 목록, 실제 작업/수록/배포 상태.

**수행 방법·도구:** 곡별 제작 문서와 `history.md`를 갱신한다. 해결한 문제는 원인·수정·검증·다음 적용 조건을 문제 해결 기록에 연결한다. 전달받은 세션의 성공 보고만으로 상태를 확정하지 않고 필요한 최종 파일/핵심 근거를 직접 확인한다.

[공통 인계 준비 순서](produce-score.md#reusable-production-workflow--3-인계문)에 따라 추가·수정한 제작 JSON·스크립트의 서식·관련 코드 검사와 서식 수정 전후 값/제작 결과 보존을 확인한다. 최신 파일과 검증 보고서가 준비되면 `handoff_production.py build`로 경로·해시·범위·미검증을 포함한 초안을 만든다. 검증 결과의 후보 해시를 실제 전달 파일과 대조하며, 해시 결합 없는 과거 기록은 현재 후보의 통과 근거로 승격하지 않는다. 곡별 설정에는 판단·한계·다음 조치를 명시한다. 자동 생성 뒤 본문을 검토하고 아래 실제 전송 절차를 수행한다.

**인계 실행:** [완성 악보의 상시 인계 규칙](../reference/score/production.md#score-production-rules--완성-악보의-상시-인계)에 따라 아래 절차를 수행한다. 적용 대상과 권한 범위는 해당 Rule을, 승인 날짜와 결정 경위는 [ADR-0018](../decisions/0018-reusable-score-production-and-handoff.md#decision-outcome)을 참조한다.

1. 기존 담당은 **드럼연습실 웹앱 개발**, 현재 `threadId=01a0afc9-ca21-7371-9390-06eb07c017e9`, `hostId=local`이다. `read_thread` 등 지원 도구로 실제 담당·프로젝트·연락 경로를 확인한다. 사용자 확정 없이 새 담당자나 새 채팅을 만들지 않는다.
2. 최신 산출물·인계 문서의 실제 존재와 식별을 확인하고 아래 인계 항목을 준비한다. 요청 범위 밖의 음원·패키지를 새로 만들 필요는 없다. 앱 수록·표시·청취가 남아 있으면 그 상태와 다음 조치를 명시하며 앱 반영을 기다리느라 제작 결과 인계를 미루지 않는다.
3. `send_message_to_thread`로 최신 파일의 절대경로·곡 ID·해시, 검증 결과·변경점·음원 연결·미해결 문제와 인계 문서를 전달한다. 인계 Rule에 연결된 승인 근거를 명시한다.
4. 도구의 전송 접수 결과를 확인하고 지원되는 상태 조회로 수신자의 접수·처리 상태를 확인한다. 응답을 확인하지 못했으면 미확인으로 기록한다. 실제 전달 본문·수신처·시각·승인 근거·접수/처리 증거를 곡별 제작 기록에 남긴다. 전송 실패는 준비된 본문·차단 사유·다음 조치를 사용자에게 보고한다.

**산출물:** 다음 담당자가 이전 대화 없이 사용할 인계: 정확한 원본/최종 파일 경로·SHA256, 생성 코드·버전·명령·의존 파일·새 출력 폴더, 실제 마디/총 길이, 가사/주법 상태, 첫 박/BPM·연결표, 실제 앱 origin/빌드·수록/재열기·청취 결과, 보존 자료, 앱 결함·추정·미검증과 다음 조치.

**완료 조건:** 아래 완료 판정표의 상태를 모두 채우고, 기존 개발자에게 실제 전달한 결과를 기록했다. 미검증은 이유와 담당/다음 확인을 명시한다. 메시지 전송 접수·수신자 검토 착수·앱 반영 완료와 commit·push·수록·deploy·청취는 별개 상태로 보고한다. 자료 보존은 [제작 Rule](../reference/score/production.md#score-production-rules--접수와-출력), 앱 변경이 포함된 경우의 빌드번호·버전 처리는 [갱신 절차](release.md#app-versioning--앱-버전-갱신-절차)를 따른다.

**실패 시 확인:** 인계 파일의 실제 존재·해시·Git 상태부터 재확인한다. 사라진 worktree, 절대 경로가 남은 venv, 불완전한 로컬 원본 때문에 재현할 수 없으면 그 선행 조건을 적는다. 별도 요청 없는 원격 통합·배포로 인계 누락을 덮지 않는다.

<a id="score-production-process--기존-도구의-재사용-범위"></a>

### 기존 도구의 재사용 범위

반복 입출력·검사·패키지·MIDI·샘플 렌더링은 [공통 제작 도구](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독)의 실제 코드로 재사용한다. 곡 설정과 판독 근거를 분리하며, 새 곡용 범용 자동 판독 CLI가 완성됐다는 뜻은 아니다. 아래 곡별 도구는 원본 양식별 어댑터와 재현 진입점이다. 새 양식의 추출·fixture·메타데이터·패키지 helper를 이번 입력에 맞게 작성/검증한 뒤 곡별 문서에 **실제로 실행한 명령**을 남겨야 처음부터 재현할 수 있다.

| 도구·코드 | 확인한 인터페이스와 선행 조건 | 새 곡에서의 적용 |
|---|---|---|
| `tools/score-production/musicxml/convert.py` → `export.py` → `verify.py` | convert: `--pdf --geometry --out`; export: `--input --out`; verify: `--xml --ir --schema --out`. Real Paradis 해시/geometry·전용 예외에 결합 | 구조를 참고. 새 입력에 그대로 실행하지 않음 |
| `tools/score-production/musicxml/loveholic.py`, `verify_loveholic.py` | `--pdf --out`, `--dir`. 원본 해시, provenance, Poppler 페이지, 로컬 XSD, 원본 fixture 필요 | Opus 좌표·마디 예외를 새로 평가. 보존 결과에 재실행하지 않음 |
| `loveholic_printed_lyrics.py`, `loveholic_lyric_notes.py` | 원본 문자 bbox·이벤트와 동일 원본 해시. 후자 `--dir --out` | 직접 음표 대응/추정표의 검증 방법을 참고 |
| `loveholic_audio.py` | `--audio --bars --out`; ffmpeg·numpy 필요. 신호 분석 추정 출력 | 새 곡의 위상·템포·변화 구간을 다시 검증 |
| `loveholic_package.mjs` | Vite 브라우저 모듈, 특정 곡 경로/해시/개수·loopback 수신기에 결합 | 범용 명령으로 제시하지 않음. 공통 API 사용 방법을 참고 |
| `src/modules/score/canonical-xml.ts`, `src/modules/score/musicxml.ts`, `src/modules/library/score-package.ts` | 브라우저 DOM/Blob 계약, 현재 공통 정본/조판/ZIP API | 새 곡도 공통 계약으로 저장·렌더·재읽기 |
| `src/modules/score/browser-score.ts`, `src/platform/storage/practice-library.ts` | 공통 조판 결과와 실제 저장/업데이트 계약 | 실제 앱 수록·재열기에 사용 |

실행 환경에는 Node/package lock, Python interpreter·라이브러리, Poppler/ffmpeg, 로컬 XSD의 `musicxml.xsd/xml.xsd/xlink.xsd`, 사용한 Audiveris/OSMD 버전을 기록한다. `tools/score-production/musicxml/requirements.txt`의 기존 환경에 numpy·ffmpeg까지 포함된다고 가정하지 않는다. 이동된 venv는 별도 재생성하거나 정상 interpreter를 확인한다. [Loveholic 재현 절](../records/songs/loveholic.md#loveholic-conversion--근거재현-경로)은 해당 곡의 정확한 선행 파일과 명령 예다.

변환/저장 코드 변경에는 관련 `musicxml`, `canonical-xml`, `score-package` 테스트부터 실행하고, 영향 범위에 따라 `pnpm run test:drum`·TypeScript·관련 Python 검사를 수행한다. 실제 fixture가 없는 실패를 삭제로 우회하지 않는다. 현재 테스트는 `tests/{unit,integration,local-media}`만 수집한다. `pnpm run build`는 두 앱을 분리 빌드하며 독립 HTML 내보내기 템플릿은 생성하지 않는다. 문서만 변경한 작업에는 악보 재생성·앱 빌드·청취를 실행한 것처럼 기록하지 않는다.

<a id="score-production-process--문제-조사와-과거-근거"></a>

### 문제 조사와 과거 근거

막히면 [변환 정책의 확인 순서](../reference/score/production.md#musicxml-conversion-policy--막힘과-문서-모순)를 따른다. 실제 증상·재현 조건·입력 식별·환경/버전·실패 명령/구간을 기록하고 해당 순서로 근거를 좁힌다. 과거 세션이 접근되지 않으면 제작 문서로 대조하고 한계를 남긴다.

해결 후 확인한 원인·바꾼 코드/설정/명령/경로·보존한 원본·실제 대조/재실행/규격/재읽기/화면 증거·재사용 조건·금지할 재시도·남은 한계를 해당 곡의 `docs/records/songs/<곡 식별자>.md` 또는 공통 [제작 도구 기록](../records/production-tools.md)에 남기고 history에 연결한다. 원인 미확정인 실행 회복을 근본 해결로 보고하지 않는다.

이전 제작 경험은 [곡별 기록 목록](../records/README.md#곡별-제작-기록)과 [제작 프로세스 정리 근거](../records/archive/musicxml-evaluation.md#score-process-evidence--제작-프로세스-정리-당시-근거)에서 조회한다.

<a id="score-production-process--악기주법-선택과-보고"></a>

### 악기·주법 선택과 보고

[매핑의 적용·변경 기준](../reference/score/notation.md#score-musicxml-osmd-mapping--문서-변경과-실행-순서)을 먼저 확인한다.

1. 원본의 악기·주법을 식별하고 확정 매핑에서 해당 항목을 찾는다.
2. 새 항목이면 OSMD 소스·공식 문서에서 전용 표기 규칙과 지원 버전을 조사한다. 검사한 MusicXML·실제 렌더 결과를 기록한다.
3. 규칙 미확인과 렌더링 미지원을 구분하여 보고한다. 대체안을 제안할 때는 악기/주법·표시·저장 방식·의미와 호환성 한계를 적고, 매핑 Rule의 사용자 결정 절차를 거친다.
4. 확정된 범위의 정본을 갱신한 뒤 MusicXML에 적용한다. OSMD 원생 출력과 승인된 앱 보완 출력을 각각 검사한다.
5. 항목·의미·OSMD 버전·시도한 XML·실제 결과·재현 근거를 제작 기록에 남긴다. 현행 표현은 매핑 Rule, 선택 근거는 기존 ADR, 검증 결과는 제작 기록과 history에 연결한다.

<a id="reusable-production-workflow--제작-계측검수인계-재사용"></a>

## 제작 계측·검수·인계 재사용

문서 역할: **실행 절차**. [제작 Rule](../reference/score/production.md#score-production-rules--악보-제작-범위와-보존-rule)과 [공통 코드 계약](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독)을 따른다. 당시 구현·검증·집계 범위 보완은 [사실 기록](../records/production-tools.md#production-tool-validation--공통-제작-도구-검증계측-기록), 선택 이유는 [ADR-0018](../decisions/0018-reusable-score-production-and-handoff.md)에서 확인한다.

<a id="reusable-production-workflow--도구-경계"></a>

### 도구 경계

- `measure_production.py`: 실제 작업 시작 기록 → 필요한 단계의 명시적 기록 → 종료 시 토큰/비용 참고 환산 집계. 정형 집계에 별도 AI 작업자를 만들거나 계속 polling하지 않는다.
- `common/review.mjs`: 실제 앱의 표시 함수를 쓰는 일시 검수 화면. 원본 줄 구성·선택 마디·가사 앵커를 확인하고, 종료 시 DOM·임시 URL을 정리한다. DB·악보 데이터는 수정하지 않는다.
- `handoff_production.py`: 곡별 인계 설정과 실제 파일/검증 보고서에서 절대경로·SHA·상태·한계를 포함하는 본문을 생성한다. 자동 전송하지 않으며 기존 승인된 전달 도구로 보낸 뒤 접수 상태를 별도 기록한다.

곡별 판단은 반복 순서, 독립 원본 기대값, 특수 주법, 가사 예외, 음원 연결 근거와 다음 조치에 남는다. 해시/개수·XSD·패키지 왕복을 원본 의미 대조나 실제 청취로 대체하지 않는다. 변경이 없는 단계의 검사를 반복하지 않고, 교정한 입력에 의존하는 결과와 검사는 갱신한다.

<a id="reusable-production-workflow--1-계측"></a>

### 1. 계측

```bash
python3 tools/score-production/musicxml/measure_production.py start --help
python3 tools/score-production/musicxml/measure_production.py mark --help
python3 tools/score-production/musicxml/measure_production.py finish --help
```

`start`에는 새 `--out`, 곡명 `--label`, 실제 현재 세션의 `--root-log`와 `--root-turn-id`를 전달한다. 시작 시각은 로그의 해당 작업 시작에서 읽는다. 로그가 오래된 날짜 디렉터리에 있어도 경로를 그대로 사용한다. 다른 곡의 세션 ID·시각을 복사하지 않는다.

`mark --out ... --stage ... --status ... --evidence ...`로 실제 완료/실패/미확정 단계와 근거를 남긴다. 원본 식별, 대표 구간 판독, 최종 XML, 패키지 왕복, 화면 검수, 인계 접수 등 의미 있는 단계만 기록한다. 병행 단계의 소요 시간을 더해 전체 경과 시간으로 쓰지 않는다.

`finish --out ...`는 한 번 집계하고 `report.json`, `report.md`, `usage-records.json`을 쓴다. 재현 비교에는 `--cutoff`으로 관측 종료 시각을 고정한다. 단가는 확인 날짜와 근거가 있는 `--pricing` 파일로 별도 전달한다. 단가 미제공/미지원 모델을 실제 비용 0으로 보고하지 않는다. 실제 청구액, 공개 단가 참고 환산, 미가격 토큰을 구분한다.

root turn ID는 기존 다른 담당 채팅으로 전달한 후속 작업에도 전파될 수 있다. 제작 담당·하위 검토 범위와 인계 후 수신자 범위를 구분하고 탐색한 로그 경로/범위를 보고한다. 시작 날짜 폴더만 탐색한 결과를 모든 관련 세션의 전수 집계로 표현하지 않는다. 원시 대화·비공개 추론을 출력/보존하지 않으며 사용량 메타데이터만 남긴다. 최종 보고문 등 집계 이후 사용량은 제외될 수 있음을 명시한다.

<a id="reusable-production-workflow--3-인계문"></a>

### 3. 인계문

인계 초안을 만들기 전에 제작 JSON·스크립트의 수정을 마치고 [기존 검사 계약](verify.md#testing--개발-검사와-로컬-자산-준비)에 따라 `pnpm run format:check`와 변경 범위의 코드 검사를 완료한다. 전체 공통 검사에는 `pnpm run check`를 사용한다. 프로젝트 서식 검사는 Python·Markdown을 포함하지 않으므로 해당 파일까지 검사됐다고 보고하지 않는다.

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

<a id="reusable-production-workflow--근거와-이전-결과"></a>

### 근거와 이전 결과

과거 Python/TypeScript/Safari 실행·기존 결과 해시·요청/토큰/비용·집계 범위 차이는 [당시 검증 기록](../records/production-tools.md#production-tool-validation--공통-제작-도구-검증계측-기록)에 분리했다. 전체 제작 시간·토큰 절감률을 아직 실측하지 않은 백분율로 보고하지 않는다. 새 실행은 본문 CLI로 실제 입력과 범위를 기록한다.

<a id="score-tools--공통-제작-도구-사용-절차"></a>

## 공통 제작 도구 사용 절차

계약은 [공통 도구 Rule](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독), 전체 단계는 [제작 프로세스](produce-score.md#score-production-process--악보-제작-프로세스), 계측·검수·인계는 [재사용 절차](produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용)를 따른다.

<a id="score-tools--새-곡에서-할-일"></a>

### 새 곡에서 할 일

반복 계측·검수 화면·인계 준비는 [실행 안내](produce-score.md#reusable-production-workflow--제작-계측검수인계-재사용)를 따른다. 공통화의 선택 근거는 [ADR-0018](../decisions/0018-reusable-score-production-and-handoff.md)에 둔다.

1. 원본·기존 결과를 식별하고, `profiles/songs.json`에 이번 작업에 필요한 설정만 추가한다. 다른 곡의 `firstBeat`나 BPM을 기본값으로 복사하지 않는다.
2. 새로운 PDF 양식이면 대표 구간을 판독하고, 필요할 때 양식별 어댑터를 만든다. 음표 시작/길이·악기·성부를 해독한 데이터와 독립 원본 기대값을 별도로 보존한다.
3. 확인한 가사 위치·음원 연결·교정 사항과 불확실성을 곡별 근거에 적는다. 후보 계산은 공통 코드에, 후보 채택 이유는 판독 자료에 둔다.
4. 공통 규격 검사·정본/패키지 API를 호출한다. 확정된 입력으로 새 폴더에 생성하고 기존 결과와 검증한다.
5. 제작 완료 후 자동 인계 절차를 따른다. 도구 리팩터링만으로 새 악보를 제작/수록한 것으로 간주하지 않는다.

<a id="score-tools--실행-예시"></a>

### 실행 예시

저장소 루트에서 실행한다. `python3`는 `lxml`, `numpy`, `pdfplumber`, `Pillow`가 설치된 인터프리터여야 한다. `ffmpeg`, `ffprobe`, 원본 래스터가 필요한 어댑터에는 `pdftoppm`도 필요하다. 기본 시스템 Python에 패키지가 없으면 확인된 번들 Python이나 프로젝트 환경을 사용한다.

```bash
python3 tools/score-production/musicxml/prepare_inputs.py --pdf data/production/loveholic/source/source.pdf --audio data/production/loveholic/audio/source.mp3 --out .tmp/loveholic-new-input --raster-dpi 144
python3 tools/score-production/musicxml/loveholic.py --pdf .tmp/loveholic-new-input/source.pdf --out .tmp/loveholic-new-input
python3 tools/score-production/musicxml/preplay_warmup.py --out .tmp/preplay-new
python3 tools/score-production/musicxml/render_socal_warmup.py --events .tmp/preplay-new/midi-events.json --xml .tmp/preplay-new/preplay-warmup-source.musicxml --out .tmp/preplay-audio
python3 -m unittest discover -s tools/score-production/musicxml -p 'test_*.py'
node node_modules/vitest/vitest.mjs run tests/local-media/score-production-common.test.ts tests/local-media/canonical-xml.test.ts tests/local-media/score-package.test.ts tests/local-media/musicxml.test.ts
```

명령의 출력 폴더는 매 실행 새 경로로 지정한다. 위 예시는 실제 보존된 곡용이며, 다른 곡을 Loveholic 판독기에 넣는 방법이 아니다. 생성기 내부 기존 오류 주입 검사는 원본의 변경본을 임시 메모리/검증 폴더에서만 사용한다. 공개 앱·DB에 시험 자료를 저장하지 않는다.

<a id="score-tools--확인과-기록"></a>

### 확인과 기록

독립 원본·정본·패키지·음원/가사 및 실제 화면/청취를 해당 범위로 구분한다. 과거 공통화의 바이트 보존·계측 비용은 [당시 검증 기록](../records/production-tools.md#production-tool-validation--공통-제작-도구-검증계측-기록)에 보존했다. 명령 예시를 이번 실행의 결과로 쓰지 않는다.

<a id="musicxml-troubleshooting--먼저-볼-근거"></a>

### 먼저 볼 근거

- 지침: `/Users/raphael/AGENTS.md`, 프로젝트 `AGENTS.md`.
- 입력 의미: [확정 매핑](../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙), [정본 XML 계약](../reference/score/musicxml.md#musicxml-canonical--musicxml-정본-계약).
- 출력: [SVG 규칙](../reference/score/rendering.md#svg-score-rules--svg-전체-악보-생성-규칙), [확정 표기 매핑](../reference/score/notation.md#score-musicxml-osmd-mapping--악보의-musicxml--osmd-매핑-규칙).
- 제작 사례: [곡별 제작 기록 목록](../records/README.md#곡별-제작-기록)에서 같은 입력 양식·문제의 기록을 찾는다.
- 조사 순서와 승인 우선순위: [문제·문서 모순 확인 기준](../reference/score/production.md#musicxml-conversion-policy--막힘과-문서-모순)을 확인한다.

<a id="musicxml-troubleshooting--실행-회복과-미해결-항목을-구분"></a>

### 실행 회복과 미해결 항목을 구분

실패한 명령과 재시도 결과를 나란히 기록하고, 원인을 확인했는지 또는 실행만 회복했는지 구분한다. 매핑 미확인·조판 미지원·음원 분석 추정·실제 청취 미확인을 각 항목에 표시한다. 당시 재시도·반열림 교정·음원/가사 상태는 [문제 해결 기록](../records/archive/musicxml-evaluation.md#musicxml-troubleshooting--악보-변환-문제-해결-기록)에서 조회한다.

<a id="musicxml-troubleshooting--새-사례-기록-형식"></a>

### 새 사례 기록 형식

기존 조사 방법·실패 결과는 [곡별 제작 기록](../records/README.md#곡별-제작-기록)에서 확인하고, 이번 사례에는 아래 항목을 작성한다.

해결한 날, 곡/원본 식별, 환경·버전, 증상·재현 조건, 확인된 원인, 문서→과거 세션→웹에서 확인한 근거, 수정·명령·경로, 실제 검증과 잔여 한계, 다음 적용 기준을 적는다. 확인하지 않은 단계는 확인한 것처럼 쓰지 않는다. 해당 곡 제작 문서와 `history.md`에서 이 기록을 연결한다.
