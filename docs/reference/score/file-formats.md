# 악보 패키지와 음원 연습 파일

문서 역할: **현행 Rule**. 현재 요구·계약과 지원 한계를 다룬다. [전체 정본](../../RULES-INDEX.md), [실행 안내](../../README.md), [결정 이력](../../decisions/README.md)을 함께 참고한다.

<a id="score-package--완성-악보-파일-계약--drumscore-v1"></a>

## 완성 악보 파일 계약 — .drumscore v1

결정 근거: [ADR-0022](../../decisions/0022-portable-score-and-practice-files.md). 실행: [절차](../../how-to/produce-score.md#score-production-process--악보-제작-프로세스).

- 목표: 제작 앱에서 완성한 악보를 재생 앱이 변환 작업 없이 읽는다.
- 범위: `src/modules/library/score-package.ts`가 ZIP 쓰기·읽기·구조 비교를 단독 소유한다.
- 완료 조건: 같은 곡 ID, 전체 Song 정보, 원본·렌더링 자산이 왕복 보존된다.
- 제외: HTML 재생 파일 생성, 실제 보관함 이전, 외부 업로드는 이 계약에 포함하지 않는다.
- 검증: `tests/local-media/score-package.test.ts`의 왕복·잘못된 입력·압축 해제 제한 검사.

<a id="score-package--공개-api"></a>

### 공개 API

```ts
createScorePackage(record: RecordData): Promise<Blob>
readScorePackage(blob: Blob): Promise<RecordData>
scoreStructureSignature(song: Song): string
SCORE_PACKAGE_EXTENSION // ".drumscore"
```

파일 MIME은 `application/vnd.drum-practice.score+zip`이다. 확장자는 발견용이며 읽기는 내부 버전과 자산을 검사한다. 기존 보관함의 `RecordData`를 직접 받을 수 있고 읽은 결과도 같은 타입이다. 저장·교체와 기록 보존 결정은 호스트의 책임이다. 이 모듈은 DB에 쓰지 않는다.

<a id="score-package--zip-내용"></a>

### ZIP 내용

`manifest.json`의 최상위 `format`은 `drumscore`, `version`은 `1`이다. 다른 버전은 거부한다.

- `song`: 전체 Song. 제목·원제·가수·작사·작곡·마디·박자·음원 시각·가사 위치·마커·반복·재생 설정을 그대로 보존한다.
- `source`, `audio`, `pages`: `{ path, type, size }` 자산 참조. 바이너리는 ZIP 엔트리로 저장하며 base64를 사용하지 않는다.
- `canonicalXML`: 존재하면 그대로 보존하는 정본 XML 문자열.
- `otherScores`: 다른 악보 형식의 이름·파트·페이지·영역·마디 연결과 원본 자산. 현재 PDF와 MusicXML 한 쌍까지 지원한다.

엔트리 경로는 `score/source`, `score/pages/0`, `audio/source`, `alternates/0/source`, `alternates/0/pages/0` 형식이다. DEFLATE로 압축한다. 편집 중 draft와 수정 이력은 완성 파일의 대상이 아니며 제작 보관함에 남긴다.

배포용 MusicXML 패키지는 canonical XML에서 재생성하는 `metadata[data-ribbon-timeline="1"]` 캐시를 SVG 페이지에서 생략할 수 있다. 원본/XML·음원·Song 전체·대체 악보·인쇄 SVG의 글꼴/잉크는 유지하고 변경된 page 자산의 size만 갱신한다. 파일 형식과 버전은 그대로다. 기존 캐시 포함 패키지도 지원하며 앱은 두 경우 모두 canonical XML과 현재 조판 정책으로 표시를 준비한다.

<a id="score-package--유효성-및-자원-제한"></a>

### 유효성 및 자원 제한

Song은 기존 `validateSong`을 통과해야 한다. 마디가 하나 이상이고 실제 페이지 수가 Song.pageCount와 같아야 한다. 모든 자산은 비어 있지 않아야 한다.

- PDF 원본: `application/pdf`. 페이지: PNG/JPEG/WebP.
- MusicXML 원본: Recordare MusicXML 또는 XML MIME. 페이지: SVG 또는 기존 SVG gzip MIME.
- 음원: `audio/*` MIME.
- 대체 악보는 본 악보와 마디 ID·분자·분모의 순서가 같아야 한다. 별도 페이지와 영역은 `validateSong`으로 검사한다.

ZIP은 최대 512 MiB, 확장 후 합계 512 MiB, 엔트리당 256 MiB, manifest 16 MiB, 1,100 엔트리까지다. 중앙 디렉터리의 크기를 압축 해제 전에 검사한다. 압축 해제 시에도 각 엔트리의 실제 출력이 선언된 크기를 넘으면 스트림을 중단한다. 절대 경로·상위 경로·중복 경로·목록에 없는 파일·빠진 파일·다중 디스크·ZIP64·암호화·지원되지 않는 압축 방법을 거부한다. 파일은 디스크에 추출하지 않는다.

MIME과 크기 검사는 원본 음악·이미지 자체의 콘텐츠 진위를 보증하지 않는다. 재생 시 이미지를 디코딩하고 기존 SVG 안전 검증을 적용하는 경계는 재생 호스트가 유지한다. 패키지는 실행 스크립트를 실행하지 않는다.

<a id="score-package--수정본과-연습-기록"></a>

### 수정본과 연습 기록

`scoreStructureSignature`는 각 마디의 `[id, beats, denominator]` 순서를 JSON 문자열로 반환한다. 제목·음원 타이밍·페이지 배치는 포함하지 않는다. 같은 곡 ID와 같은 구조인 경우 호스트가 연습 기록을 유지할 수 있다. 드럼연습실은 구조와 무관하게 같은 ID의 새 파일로 바로 교체한다. 기존 연습 기록의 재배치·자동 백업·복원을 제공하지 않는다. 원래 Song의 마커·반복을 패키지 처리 과정에서 잘라내지 않는다.

<a id="score-package--기존-제작-파일의-mime-정규화"></a>

### 기존 제작 파일의 MIME 정규화

브라우저 File의 MIME이 비어 있거나 일반 바이너리 MIME인 경우 생성기는 파일 이름만으로 형식을 단정하지 않는다. PDF 헤더, MusicXML 루트, MP3(ID3/MPEG frame), WAV, FLAC, Ogg Opus/Vorbis, AIFF, M4A 계열, AAC ADTS의 식별 바이트를 확인해 manifest MIME을 채운다. 확인되지 않는 빈 MIME 음원은 거부한다. 브라우저가 이미 부여한 유효 audio MIME은 기존과 같이 유지한다.

압축 MusicXML `.mxl`은 ZIP 내부 `META-INF/container.xml`과 연결된 `score-partwise` XML을 크기 제한 아래 검사한다. 실제 원본 ZIP 바이트는 바꾸지 않고 MIME만 `application/vnd.recordare.musicxml`로 정규화한다. canonicalXML은 별도로 그대로 보존한다. 내부 MXL 디렉터리 엔트리는 허용하지만 경로 탈출은 거부한다. 재생 앱의 reader는 정규화된 manifest MIME만 받는다.

<a id="practice-file--음원-연습-파일"></a>

## 음원 연습 파일

결정 근거: [ADR-0022](../../decisions/0022-portable-score-and-practice-files.md). 실행: [절차](../../how-to/review-score.md#practice-files--완성-악보와-연습-정보-파일-사용-절차).

- 목표: 기기에 맞춘 음원 연습 자료를 파일로 보관하고 다른 기기에서도 그대로 복원한다.
- 범위: 드럼연습실 설정의 저장·불러오기, JSON 파일과 로컬 곡 저장소.
- 완료 조건: 원본 음원 해시, Song의 분석·보정·마디·마커·구간·슬롯·재생 설정이 저장 전후 동일하며 재분석하지 않는다.
- 제외 범위: 서버 전송, 자동 백업 이력, 악보제작기 기능.
- 검증: 왕복 저장, 손상·지원하지 않는 파일 거부, 기존 자료 보존, 설정 UI 연결, 타입 검사·관련 테스트·앱 빌드.

<a id="practice-file--저장과-복원"></a>

### 저장과 복원

음원 재생 화면의 설정 > 백업에 [사용자 설정 백업]과 [사용자 설정 복원]를 둔다. 빈 목록에서도 복원할 수 있도록 목록 설정에도 저장·불러오기를 제공한다. 내 음원 목록 전체를 JSON 파일 하나로 저장한다. 열려 있는 곡의 아직 저장 대기 중인 설정도 현재 값으로 반영한다. 파일에는 음원 바이트를 넣지 않고 원본 음원의 SHA-256·크기·파일명과 곡명·가수·악보 BPM, 박 시각 배열, 수동 보정과 1마디 기준, 마커·구간·슬롯 및 곡별 재생 설정을 포함한다. 전역 화면 설정은 포함하지 않는다.

버전이 있는 JSON 파일에 연습 정보와 원본 음원 SHA-256을 저장한다. 복원 시 기기에 보관된 동일 음원을 먼저 찾고, 없으면 사용자가 원본 파일을 여러 개 함께 선택한다. 모든 원본이 연결된 뒤 한 트랜잭션으로 복원하며 일부 곡만 저장하지 않는다. 파일명만으로 연결하지 않고 크기·SHA-256 일치를 검사한다. 데이터 구조와 파일 크기를 제한한다. 복원은 새 ID로 별도 항목을 추가하며 기존 곡을 덮어쓰지 않는다. 가져온 박 정보는 자동 재분석·시작점 추정 대상에서 제외한다. 현재 UI에는 수동 재분석 버튼이 없으며, [조정 계약](../product/audio-practice.md#audio-practice--박자와-템포)에 따른 직접 보정은 유지한다. 원시 MP3 가져오기 및 서버 `.drumscore` 수신은 유지한다.

파일은 최대 64 MiB·1,000곡이며 곡별 박 배열과 설정을 검증한다. 파일명은 `drumpractice_backup_YYYYMMDD_HHmmss.json`이며 한국시간(Asia/Seoul) 기준 저장 시각을 사용한다. 재생 화면에서는 설정 > 백업, 목록 화면에서는 설정의 백업 섹션에서 사용한다. 복원 완료 시 목록으로 이동한다.

<a id="metronome-settings--메트로놈-설정-호환성"></a>

### 메트로놈 설정 호환성

- 곡별 `settings.click`을 유지하고 선택적인 `clickDivision: 4 | 8`을 추가한다. Song/패키지/연습 JSON 버전은 기존 1이며 저장소 스키마는 바꾸지 않는다. 누적 클릭 위치는 재생 세션에서만 관리하며 저장하지 않는다.
- 필드가 없는 구형 파일은 경고 없이 4분으로 해석한다. `click: false`는 끄기다. 숫자 4·8은 그대로 왕복 저장한다. 새 악보·음원 가져오기는 기존 연습 기본값과 4분 켜짐을 적용하며, 저장곡·명시적 백업 복원은 선택값을 보존한다.
- 공통 정규화는 `.drumscore`, 저장곡(제작 초안·수정 이력 포함), 연습 JSON과 제작 백업을 읽을 때 잘못된 분할 값만 **작업 사본에서 4로 보정**한다. 원본 파일이나 기존 레코드는 읽기 보정만으로 덮어쓰지 않는다. 다른 필드 검증은 유지하고 정상적인 후속 저장에는 보정값을 반영한다.
- 읽기 작업의 보정 결과를 모아 기존 상태 알림에 한 번 안내한다. 진단에는 식별자·필드·기대값·제한된 실제 값/타입·적용값을 기록하며 전체 곡이나 음원을 출력하지 않는다. 설명 팝업·설정 행 우측 설명을 추가하지 않는다.
- 구버전 앱은 새 필드를 무시할 수 있다. 구버전의 8분 동작과 재저장 시 새 필드 보존은 보장하지 않는다. UI·재생 의미는 [재생 계약](../product/playback.md)을 따른다.

<a id="practice-file--설정-ui"></a>

### 설정 UI

목록 설정의 화면·백업 섹션은 같은 배경·안쪽 여백·모서리·테두리와 공통 제목 스타일을 사용한다. 목록·재생 설정의 섹션 제목과 재생 설정 바로가기는 ‘백업’으로 표시한다. 백업 영역의 상시 설명은 표시하지 않는다. 상세 복원 조건은 도움말과 실제 원본 연결 단계에서 안내한다.

버튼과 행은 화면 설정의 `settings-choice-row`·`settings-choice-buttons segmented-control` 공통 CSS를 직접 사용한다. 백업·복원은 실행 동작이므로 선택 상태를 표시하지 않는다.

<a id="practice-file--동일-음원-중복-등록-방지"></a>

#### 동일 음원 중복 등록 방지
- 음원 불러오기와 백업 복원은 내 음원 목록의 파일 바이트 SHA-256을 비교한다. 이름이 달라도 같은 파일이면 음원 불러오기에서 파일명과 함께 중복 추가 확인 팝업을 표시한다. [추가]는 별도 항목 추가, [취소]·Esc는 취소다. 기존 항목·보정·마커·구간을 보존한다. 같은 이름의 다른 파일과 악보 패키지에 포함된 음원은 충돌로 보지 않는다.
- 백업 내 동일 음원 또는 기존 음원과의 중복이 하나라도 있으면 복원 묶음 전체를 저장하지 않는다. 이미 등록된 중복 항목을 자동 삭제하지 않는다.
