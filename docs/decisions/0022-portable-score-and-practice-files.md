---
status: accepted
date: 2026-10-23
---

# 완성 악보 패키지와 음원 연습 정보 파일의 계약을 구분한다

## Context and Problem Statement

완성 악보 전달과 개인 음원 연습 설정 복원은 포함할 자산과 충돌 정책이 다르다. 원래 결정 시기는 기존 .drumscore v1 도입(원결정일 미기재)·2026-10-13~15이며, YAML 날짜는 이번 문서 정리일이다.

## Considered Options

* 같은 파일에 모든 개인 음원과 작업 이력을 포함한다.
* 완성 .drumscore ZIP과 음원을 제외한 연습 JSON을 용도별로 구분한다.

## Decision Outcome

후자를 채택한다. .drumscore v1은 전체 Song·정본 XML·자산을 보존하고 모듈이 DB에 쓰지 않는다. 연습 JSON은 해시로 모든 음원을 연결한 뒤 새 ID로 원자 복원하며 중복이 있으면 묶음 전체를 거부한다.

### Consequences

기존 곡·설정을 임의로 덮어쓰거나 파일명만으로 연결하지 않는다. 정본 XML 권위는 ADR-0012를 재사용한다. 새 기능·삭제·전송·배포 승인을 추가하지 않는다.

### Confirmation

현행 계약과 실행 절차는 [패키지 Rule](../reference/score/file-formats.md#score-package--완성-악보-파일-계약--drumscore-v1), [연습 파일 Rule](../reference/score/file-formats.md#practice-file--음원-연습-파일)에서 확인한다. 아래 당시 검증 수치·실패·미확인은 해당 환경의 기록이며 이번 작업에서 앱·악보 검증을 다시 수행한 결과가 아니다.

## More Information

대안은 원문에서 확인되는 채택·대체 경로를 정리한 것이다. 별도 회의나 새로운 합의를 추정하지 않는다. 이관 원문에 포함된 대체 전 값은 현행 규칙이 아니다.

### 이관 원문 — SCORE-PACKAGE.md / 1

출처: [docs/architecture/SCORE-PACKAGE.md](../reference/score/file-formats.md#score-package--완성-악보-파일-계약--drumscore-v1). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

#### 완성 악보 파일 계약 — .drumscore v1

- 목표: 제작 앱에서 완성한 악보를 재생 앱이 변환 작업 없이 읽는다.
- 범위: `src/modules/library/score-package.ts`가 ZIP 쓰기·읽기·구조 비교를 단독 소유한다.
- 완료 조건: 같은 곡 ID, 전체 Song 정보, 원본·렌더링 자산이 왕복 보존된다.
- 제외: HTML 재생 파일 생성, 실제 보관함 이전, 외부 업로드는 이 계약에 포함하지 않는다.
- 검증: `tests/local-media/score-package.test.ts`의 왕복·잘못된 입력·압축 해제 제한 검사.

### 이관 원문 — SCORE-PACKAGE.md / 2

출처: [docs/architecture/SCORE-PACKAGE.md](../reference/score/file-formats.md#score-package--완성-악보-파일-계약--drumscore-v1). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 공개 API

```ts
createScorePackage(record: RecordData): Promise<Blob>
readScorePackage(blob: Blob): Promise<RecordData>
scoreStructureSignature(song: Song): string
SCORE_PACKAGE_EXTENSION // ".drumscore"
```

파일 MIME은 `application/vnd.drum-practice.score+zip`이다. 확장자는 발견용이며 읽기는 내부 버전과 자산을 검사한다. 기존 보관함의 `RecordData`를 직접 받을 수 있고 읽은 결과도 같은 타입이다. 저장·교체와 기록 보존 결정은 호스트의 책임이다. 이 모듈은 DB에 쓰지 않는다.

### 이관 원문 — SCORE-PACKAGE.md / 3

출처: [docs/architecture/SCORE-PACKAGE.md](../reference/score/file-formats.md#score-package--완성-악보-파일-계약--drumscore-v1). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### ZIP 내용

`manifest.json`의 최상위 `format`은 `drumscore`, `version`은 `1`이다. 다른 버전은 거부한다.

- `song`: 전체 Song. 제목·원제·가수·작사·작곡·마디·박자·음원 시각·가사 위치·마커·반복·재생 설정을 그대로 보존한다.
- `source`, `audio`, `pages`: `{ path, type, size }` 자산 참조. 바이너리는 ZIP 엔트리로 저장하며 base64를 사용하지 않는다.
- `canonicalXML`: 존재하면 그대로 보존하는 정본 XML 문자열.
- `otherScores`: 다른 악보 형식의 이름·파트·페이지·영역·마디 연결과 원본 자산. 현재 PDF와 MusicXML 한 쌍까지 지원한다.

엔트리 경로는 `score/source`, `score/pages/0`, `audio/source`, `alternates/0/source`, `alternates/0/pages/0` 형식이다. DEFLATE로 압축한다. 편집 중 draft와 수정 이력은 완성 파일의 대상이 아니며 제작 보관함에 남긴다.

### 이관 원문 — SCORE-PACKAGE.md / 4

출처: [docs/architecture/SCORE-PACKAGE.md](../reference/score/file-formats.md#score-package--완성-악보-파일-계약--drumscore-v1). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 유효성 및 자원 제한

Song은 기존 `validateSong`을 통과해야 한다. 마디가 하나 이상이고 실제 페이지 수가 Song.pageCount와 같아야 한다. 모든 자산은 비어 있지 않아야 한다.

- PDF 원본: `application/pdf`. 페이지: PNG/JPEG/WebP.
- MusicXML 원본: Recordare MusicXML 또는 XML MIME. 페이지: SVG 또는 기존 SVG gzip MIME.
- 음원: `audio/*` MIME.
- 대체 악보는 본 악보와 마디 ID·분자·분모의 순서가 같아야 한다. 별도 페이지와 영역은 `validateSong`으로 검사한다.

ZIP은 최대 512 MiB, 확장 후 합계 512 MiB, 엔트리당 256 MiB, manifest 16 MiB, 1,100 엔트리까지다. 중앙 디렉터리의 크기를 압축 해제 전에 검사한다. 압축 해제 시에도 각 엔트리의 실제 출력이 선언된 크기를 넘으면 스트림을 중단한다. 절대 경로·상위 경로·중복 경로·목록에 없는 파일·빠진 파일·다중 디스크·ZIP64·암호화·지원되지 않는 압축 방법을 거부한다. 파일은 디스크에 추출하지 않는다.

MIME과 크기 검사는 원본 음악·이미지 자체의 콘텐츠 진위를 보증하지 않는다. 재생 시 이미지를 디코딩하고 기존 SVG 안전 검증을 적용하는 경계는 재생 호스트가 유지한다. 패키지는 실행 스크립트를 실행하지 않는다.

### 이관 원문 — SCORE-PACKAGE.md / 5

출처: [docs/architecture/SCORE-PACKAGE.md](../reference/score/file-formats.md#score-package--완성-악보-파일-계약--drumscore-v1). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 수정본과 연습 기록

`scoreStructureSignature`는 각 마디의 `[id, beats, denominator]` 순서를 JSON 문자열로 반환한다. 제목·음원 타이밍·페이지 배치는 포함하지 않는다. 같은 곡 ID와 같은 구조인 경우 호스트가 연습 기록을 유지할 수 있다. 드럼연습실은 사용자 결정(2026-10-13)에 따라 구조와 무관하게 같은 ID의 새 파일로 바로 교체한다. 기존 연습 기록의 재배치·자동 백업·복원을 제공하지 않는다. 원래 Song의 마커·반복을 패키지 처리 과정에서 잘라내지 않는다.

### 이관 원문 — SCORE-PACKAGE.md / 6

출처: [docs/architecture/SCORE-PACKAGE.md](../reference/score/file-formats.md#score-package--완성-악보-파일-계약--drumscore-v1). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 기존 제작 파일의 MIME 정규화

브라우저 File의 MIME이 비어 있거나 일반 바이너리 MIME인 경우 생성기는 파일 이름만으로 형식을 단정하지 않는다. PDF 헤더, MusicXML 루트, MP3(ID3/MPEG frame), WAV, FLAC, Ogg Opus/Vorbis, AIFF, M4A 계열, AAC ADTS의 식별 바이트를 확인해 manifest MIME을 채운다. 확인되지 않는 빈 MIME 음원은 거부한다. 브라우저가 이미 부여한 유효 audio MIME은 기존과 같이 유지한다.

압축 MusicXML `.mxl`은 ZIP 내부 `META-INF/container.xml`과 연결된 `score-partwise` XML을 크기 제한 아래 검사한다. 실제 원본 ZIP 바이트는 바꾸지 않고 MIME만 `application/vnd.recordare.musicxml`로 정규화한다. canonicalXML은 별도로 그대로 보존한다. 내부 MXL 디렉터리 엔트리는 허용하지만 경로 탈출은 거부한다. 재생 앱의 reader는 정규화된 manifest MIME만 받는다.

### 이관 원문 — PRACTICE-FILE.md / 1

출처: [docs/architecture/PRACTICE-FILE.md](../reference/score/file-formats.md#practice-file--음원-연습-파일). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

#### 음원 연습 파일 (2026-10-15 사용자 승인)

- 목표: 기기에 맞춘 음원 연습 자료를 파일로 보관하고 다른 기기에서도 그대로 복원한다.
- 범위: 드럼연습실 설정의 저장·불러오기, JSON 파일과 로컬 곡 저장소.
- 완료 조건: 원본 음원 해시, Song의 분석·보정·마디·마커·구간·슬롯·재생 설정이 저장 전후 동일하며 재분석하지 않는다.
- 제외 범위: 서버 전송, 자동 백업 이력, 악보제작기 기능, 버전 변경·커밋·배포.
- 검증: 왕복 저장, 손상·지원하지 않는 파일 거부, 기존 자료 보존, 설정 UI 연결, 타입 검사·관련 테스트·앱 빌드.

### 이관 원문 — PRACTICE-FILE.md / 2

출처: [docs/architecture/PRACTICE-FILE.md](../reference/score/file-formats.md#practice-file--음원-연습-파일). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 저장과 복원

음원 재생 화면의 설정 > 백업에 [사용자 설정 백업]과 [사용자 설정 복원]를 둔다. 빈 목록에서도 복원할 수 있도록 목록 설정에도 저장·불러오기를 제공한다. 내 음원 목록 전체를 JSON 파일 하나로 저장한다. 열려 있는 곡의 아직 저장 대기 중인 설정도 현재 값으로 반영한다. 파일에는 음원 바이트를 넣지 않고 원본 음원의 SHA-256·크기·파일명과 곡명·가수·악보 BPM, 박 시각 배열, 수동 보정과 1마디 기준, 마커·구간·슬롯 및 곡별 재생 설정을 포함한다. 전역 화면 설정은 포함하지 않는다.

버전이 있는 JSON 파일에 연습 정보와 원본 음원 SHA-256을 저장한다. 복원 시 기기에 보관된 동일 음원을 먼저 찾고, 없으면 사용자가 원본 파일을 여러 개 함께 선택한다. 모든 원본이 연결된 뒤 한 트랜잭션으로 복원하며 일부 곡만 저장하지 않는다. 파일명만으로 연결하지 않고 크기·SHA-256 일치를 검사한다. 데이터 구조와 파일 크기를 제한한다. 복원은 새 ID로 별도 항목을 추가하며 기존 곡을 덮어쓰지 않는다. 가져온 박 정보는 자동 재분석·시작점 추정 대상에서 제외하며 명시적인 재분석은 계속 허용한다. 원시 MP3 가져오기 및 서버 `.drumscore` 수신은 유지한다.

파일은 최대 64 MiB·1,000곡이며 곡별 박 배열과 설정을 검증한다. 파일명은 `drumpractice_backup_YYYYMMDD_HHmmss.json`이며 한국시간(Asia/Seoul) 기준 저장 시각을 사용한다. 재생 화면에서는 설정 > 백업, 목록 화면에서는 설정의 백업 섹션에서 사용한다. 복원 완료 시 목록으로 이동한다.

### 이관 원문 — PRACTICE-FILE.md / 3

출처: [docs/architecture/PRACTICE-FILE.md](../reference/score/file-formats.md#practice-file--음원-연습-파일). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 검증 (2026-10-15)

- 사용자 승인 범위의 관련 테스트 9파일 86개, 타입 검사, i18n 검사, 두 앱 분리 빌드·앱 경계 검사 및 공통 재생 구조 검사 통과. 기존 번들 크기 경고는 유지한다.
- 로컬 Chromium에서 실제 MP3 두 곡으로 JSON 불러오기 → 기존 음원 자동 연결·누락 원본 다중 선택 → 목록 등록 → 목록 설정과 음원 재생 설정에서 다시 저장을 확인했다. 새 항목 ID를 제외한 모든 필드가 입력과 일치했다. 재생 설정의 음악37%·메트로놈83%도 유지됐다.
- 음원 합계 13,403,611바이트를 포함하지 않은 JSON은 35,129바이트였다. 원본·입력 JSON·재저장 비교 자료는 `.tmp/practice-file-qa/`에 있다. 검증용으로 복원한 두 항목은 확인 후 삭제했고 기존 악보는 유지했다.
- 잘못된 파일·음원 해시 불일치·슬롯 참조 오류 거부, 원본 미연결 시 일부 복원 방지, 저장 충돌 시 전체 트랜잭션 취소, 복원 후 자동 재분석 차단을 테스트로 확인했다.
- Safari MCP의 탭 조회 결과는 빈 목록이었으며 파일 업로드·다운로드는 지원 도구에 없어 ego-browser를 사용했다. iPad Safari 실기기 검증은 아직 하지 않았다. 버전·커밋·푸시·발행은 이번 작업에 포함하지 않는다.

목록 설정의 화면·백업 섹션은 같은 배경·안쪽 여백·모서리·테두리와 공통 제목 스타일을 사용한다. 목록·재생 설정의 섹션 제목과 재생 설정 바로가기는 ‘백업’으로 표시한다. 백업 영역의 상시 설명은 표시하지 않는다. 상세 복원 조건은 도움말과 실제 원본 연결 단계에서 안내한다.

버튼과 행은 화면 설정의 `settings-choice-row`·`settings-choice-buttons segmented-control` 공통 CSS를 직접 사용한다. 백업·복원은 실행 동작이므로 선택 상태를 표시하지 않는다.

### 이관 원문 — PRACTICE-FILE.md / 4

출처: [docs/architecture/PRACTICE-FILE.md](../reference/score/file-formats.md#practice-file--음원-연습-파일). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 동일 음원 중복 등록 방지 (2026-10-15)
- 음원 불러오기와 백업 복원은 내 음원 목록의 파일 바이트 SHA-256을 비교한다. 이름이 달라도 같은 파일이면 음원 불러오기에서 파일명과 함께 중복 추가 확인 팝업을 표시한다. [추가]는 별도 항목 추가, [취소]·Esc는 취소다. 기존 항목·보정·마커·구간을 보존한다. 같은 이름의 다른 파일과 악보 패키지에 포함된 음원은 충돌로 보지 않는다.
- 백업 내 동일 음원 또는 기존 음원과의 중복이 하나라도 있으면 복원 묶음 전체를 저장하지 않는다. 이미 등록된 중복 항목을 자동 삭제하지 않는다.

### 이관 원문 — UX-PRINCIPLES.md / 82

출처: [docs/product/UX-PRINCIPLES.md](../reference/product/ux.md#ux-principles--팀-ux-원칙과-맥락형-도움말). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 2026-10-15 음원 연습 정보 저장·불러오기

- 목록 설정과 음원 재생 설정 > 백업에 공통 저장·불러오기 버튼을 제공한다. 저장은 내 음원 목록 전체의 정보를 JSON 하나로 묶으며 음원은 제외한다.
- 원본 음원이 없는 경우 필요한 파일명을 표시하고 여러 음원을 함께 선택하게 한다. 취소나 불일치 때 기존 자료는 유지한다. 모두 연결되고 기존 음원 또는 백업 내부의 중복 파일이 없을 때 새 항목으로 일괄 추가하며 재분석하지 않는다. 중복은 SHA-256으로 판정하고 오류를 표시하며 전체 복원을 거부한다.
- 처리 중에는 버튼을 잠그고 진행 안내를 표시한다. 실패는 같은 설정 패널에 빨간색과 원인으로 표시한다. 파일명은 textContent로만 표시한다.

### 이관 원문 — UX-PRINCIPLES.md / 83

출처: [docs/product/UX-PRINCIPLES.md](../reference/product/ux.md#ux-principles--팀-ux-원칙과-맥락형-도움말). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 중복 음원 확인 팝업 (2026-10-15)
- 최대 360px, 화면 좌우 16px 여백 안의 작은 중앙 팝업으로 표시한다. 앱 아이콘 아래에 파일명과 질문을 표시하며 별도 제목은 생략한다. 2026-10-21 결정에 따라 우상단에 공통 × 버튼을 둔다.
- 파일명을 굵게 별도 줄에 표시한다. [추가]·[취소]를 전체 폭의 세로 두 줄로 배치한다. 높이는 최소 48px이며 [추가]는 앱의 기본 강조 색상을 사용한다. 건너뛰기는 제공하지 않는다.
- 처음 열릴 때 대화상자에 초점을 두고, 키보드 이동 시 기존 버튼 포커스 표시를 유지한다. 접근성 이름과 설명을 연결하며 Esc는 취소로 처리한다.

### 이관 원문 — AUDIO-PRACTICE.md / 7

출처: [docs/product/AUDIO-PRACTICE.md](../reference/product/audio-practice.md#audio-practice--음원-연습). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

##### 연습 정보 파일 저장·불러오기 (2026-10-15)

목록 설정 또는 음원 재생의 설정 > 백업에서 내 음원 목록 전체를 `drumpractice_backup_YYYYMMDD_HHmmss.json` 하나로 저장한다. 음원 바이트는 포함하지 않는다. 곡 정보·악보 BPM·박 시각·수동 보정·1마디 기준·마커·구간·슬롯·곡별 재생 설정을 포함한다. 이미 기기에 있는 음원은 크기와 SHA-256으로 연결하고, 없으면 원본 음원 여러 개를 선택한다. 모든 음원이 연결된 뒤 별도 항목으로 일괄 복원하며 기존 자료를 덮어쓰지 않는다. 복원한 박 정보는 자동 재분석 대상에서 제외한다. 상세 계약은 [연습 파일](../reference/score/file-formats.md#practice-file--음원-연습-파일)을 따른다.

### 이관 원문 — AUDIO-PRACTICE.md / 8

출처: [docs/product/AUDIO-PRACTICE.md](../reference/product/audio-practice.md#audio-practice--음원-연습). 문서 정리일: 2026-10-23. 아래는 **당시 원문**이며 현행 지시·새 검증 결과가 아니다.

###### 동일 음원 중복 등록 방지 (2026-10-15)
- 음원 불러오기와 백업 복원은 내 음원 목록의 파일 바이트 SHA-256을 비교한다. 이름이 달라도 같은 파일이면 음원 불러오기에서 파일명과 함께 중복 추가 확인 팝업을 표시한다. [추가]는 별도 항목 추가, [취소]·Esc는 취소다. 기존 항목·보정·마커·구간을 보존한다. 같은 이름의 다른 파일과 악보 패키지에 포함된 음원은 충돌로 보지 않는다.
- 백업 내 동일 음원 또는 기존 음원과의 중복이 하나라도 있으면 복원 묶음 전체를 저장하지 않는다. 이미 등록된 중복 항목을 자동 삭제하지 않는다.


### Rule 재점검 원문 — PRD.md / 2

출처: [PRD.md](../../PRD.md). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> 개인 악보·음원·마커·구간·설정은 브라우저에 보관한다. 파일 해시·곡명·가수·자동 분석 결과도 해당 브라우저 안에서만 저장·재사용한다. 드럼연습실의 자동 백업·이전 버전 복원·악보 업데이트 기능은 제거했다. 사용자 결정(2026-10-15)에 따라 음원 연습 정보의 명시적 JSON 저장·불러오기는 제공한다. 여러 곡의 정보만 하나로 저장하고 음원은 제외하며, 원본 파일의 SHA-256으로 연결한다. 제작기의 백업/작업 이력과 구분한다.


### Rule 재점검 원문 — PRD.md / 4

출처: [PRD.md](../../PRD.md). 2026-10-23 재점검에서 분리한 변경 전 문구다. 당시 문맥·후보·검증 한계의 보존이며 새 승인이나 새 실행 결과가 아니다. 현행 계약은 출처 Rule을 따른다.

> ### 음원 연습 정보 파일 (2026-10-15)
