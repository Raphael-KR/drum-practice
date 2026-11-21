# 악보 패키지와 음원 연습 파일

문서 역할: **현행 Rule**. 현재 요구·계약과 지원 한계를 다룬다. [전체 정본](../../RULES-INDEX.md), [실행 안내](../../README.md), [결정 이력](../../decisions/README.md)을 함께 참고한다.

<a id="score-package--완성-악보-파일-계약--drumscore-v1"></a>

## 완성 악보 파일 계약 — .drumscore v2

결정 근거: [ADR-0022](../../decisions/0022-portable-score-and-practice-files.md), [현행 조판·저장 전환](../../decisions/0034-time-proportional-engraving.md). 실행: [절차](../../how-to/produce-score.md#score-production-process--악보-제작-프로세스).

- 목표: 제작 앱의 완성 정본·음원·PDF를 전달하고, MusicXML 표시는 두 앱이 현재 공통 정책으로 조판한다.
- 범위: `src/modules/library/score-package.ts`가 ZIP 쓰기·읽기·구조 비교를 단독 소유한다.
- 완료 조건: 같은 곡 ID·최종 가사·리듬/음원 연결·원본·PDF 자산이 왕복 보존된다. MusicXML 파생 페이지·영역과 제작 작업 자료는 완성 패키지에 넣지 않는다.
- 제외: HTML 재생 파일 생성, 실제 보관함 이전, 외부 업로드는 이 계약에 포함하지 않는다.
- 검증: `tests/local-media/score-package.test.ts`의 왕복·잘못된 입력·압축 해제 제한 검사.

<a id="score-package--공개-api"></a>

### 공개 API

```ts
createScorePackage(record: RecordData): Promise<Blob>
readScorePackage(blob: Blob): Promise<RecordData>
scoreStructureSignature(song: Song): string
```

파일 MIME은 `application/vnd.drum-practice.score+zip`이다. 확장자는 발견용이며 읽기는 내부 버전과 자산을 검사한다. 기존 보관함의 `RecordData`를 직접 받을 수 있고 읽은 결과도 같은 타입이다. 저장·교체와 기록 보존 결정은 호스트의 책임이다. 이 모듈은 DB에 쓰지 않는다.

<a id="score-package--zip-내용"></a>

### ZIP 내용

`manifest.json`의 최상위 `format`은 `drumscore`, `version`은 `2`다. 구형 v1을 포함한 다른 버전은 거부한다.

- `song`: 제목·원제·가수·작사·작곡·마디·박자·음원 시각·최종 가사 위치·마커·반복·현행 재생 설정을 보존한다. `package-song.ts::packageRecord`가 MusicXML의 pageCount/regions/regionId와 제작용 원문·가사 보관 이력만 출력 사본에서 제외한다. 음악적 마디 ID·박자·시각은 유지한다.
- `source`, `audio`, `pages`: `{ path, type, size }` 자산 참조. 바이너리는 ZIP 엔트리로 저장하며 base64를 사용하지 않는다.
- `canonicalXML`: 존재하면 그대로 보존하는 정본 XML 문자열.
- `otherScores`: 다른 악보 형식의 이름·파트·원본 자산과 마디 연결. PDF의 페이지·영역은 보존하고 MusicXML의 파생 페이지·영역은 본 악보와 같이 비운다. 현재 PDF와 MusicXML 한 쌍까지 지원한다.

엔트리 경로는 `score/source`, `score/pages/0`, `audio/source`, `alternates/0/source`, `alternates/0/pages/0` 형식이다. DEFLATE로 압축한다. 편집 중 draft와 수정 이력은 완성 파일의 대상이 아니며 제작 보관함에 남긴다.

확정 가사 교정 이력과 제작 자료 전달 봉투도 `.drumscore`와 MusicXML에 넣지 않는다. 최종 가사의 현재 문구·위치·확인 상태는 기존 정본 계약으로 보존한다.

MusicXML 패키지는 `pages: []`, `pageCount: 0`, `regions: []`, 빈 `regionId`로 저장한다. `prepareBrowserScore`가 활성화할 때 정본 v3와 현재 정책으로 SVG·좌표를 생성한다. 렌더 결과는 파생 캐시이며 완성 패키지의 정본이 아니다. 원음절·전체 가사·보컬 원본은 제작 작업 파일과 보관함의 `lyricWork`에 남긴다. 이 정규화는 제작 도구와 앱이 공통 모듈을 사용한다.

<a id="score-package--유효성-및-자원-제한"></a>

### 유효성 및 자원 제한

Song은 기존 `validateSong`을 통과해야 한다. 마디가 하나 이상이고 실제 페이지 수가 Song.pageCount와 같아야 한다. MusicXML의 미조판 상태는 0페이지·빈 영역을 허용하고 PDF는 페이지를 요구한다. 모든 자산은 비어 있지 않아야 한다.

- PDF 원본: `application/pdf`. 페이지: PNG/JPEG/WebP.
- MusicXML 원본: Recordare MusicXML 또는 XML MIME. 완성 패키지에는 파생 SVG 페이지를 넣지 않는다.
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


<a id="local-score-projects"></a>

## 로컬 제작 프로젝트

악보제작기는 `data/production/projects/<songId>/`를 기본 편집 저장소로 사용한다. 앱의 로컬 API와 제작 CLI가 `server/score-project-store.ts`를 공유한다. 드럼연습실의 IndexedDB 저장과 완성 `.drumscore` 계약은 유지한다. 절차는 [공동작업 안내](../../how-to/collaborate-on-score.md), CLI는 [공통 제작 도구](tools.md#local-score-project-cli)를 따른다.

| 파일 | 계약 |
| --- | --- |
| `project.json` | version 1, 곡 ID, 최신 저장 UUID, 저장 시각·작성 경로, 제목·가수. 모든 저장 파일을 쓰고 자산을 다시 읽어 확인한 뒤 마지막에 갱신한다. |
| `saves/<UUID>/record.json` | 이전 저장 UUID와 해당 저장의 head·전체 제작 record. 기존 저장본은 덮어쓰지 않는다. |
| `saves/<UUID>/canonical.musicxml` | 해당 저장본의 음악 정본. record의 경로·크기·SHA-256 참조와 대조한다. |
| `assets/<SHA-256>` | 원본 PDF·음원·페이지 등 바이너리. 같은 바이트는 재사용하며 MIME·크기·해시를 참조에 보존한다. |
| `draft.json` | version 1, 초안 UUID·기준 head·저장 시각·record·EditDraft. 아직 확정하지 않은 form·되돌리기 기준·가사 구성 자료를 확정본과 구분한다. |
| `work/drafts/<UUID>.json` | 기준 저장본이나 자산이 바뀌거나 저장이 확정될 때 보존하는 이전 초안. 확정 저장이 소비한 초안은 다시 미확정 편집으로 제시하지 않는다. |
| `work.json` | 진행·질문·답장·요청과 전달 상태. 항목 ID·작성자·시각·질문 ID·기준 저장 UUID를 기록한다. 결과와 검증 한계는 제작자의 진행 항목으로 남긴다. |
| `work/`, `review/`, `output/` | 제작 판독·원음절과 위치·검증 근거·요청된 산출물. 필요한 자료만 만들며 빈 폴더나 결과를 강제로 채우지 않는다. |

- 확정 저장은 읽었던 `base.revision`과 `expectedDraft`를 모두 대조한다. 다른 탭·제작자가 먼저 저장하면 충돌로 중단하며 최신 저장본을 덮지 않는다. 오래된 기준의 초안은 보존할 수 있지만 그대로 확정할 수 없다. 프로젝트별 잠금으로 앱·CLI 쓰기를 직렬화한다.
- 제작자가 새 확정본을 저장해도 사용자 초안을 자동 적용하거나 삭제하지 않는다. 앱은 파일 변경 알림 또는 수동 새로고침으로 변경 요약을 표시하고, 초안이 있으면 새 확정본 열기를 사용자가 선택한다. 새 기준으로 다시 편집할 때 이전 초안은 별도로 보존한다.
- 처음 편집하는 기존 브라우저 악보는 전체 record·원본·정본·초안·가사 작업 자료·교정 이력·이전 스냅샷을 저장하고 재조회해 대조한 뒤 파일 프로젝트로 연다. 기존 DB 자료는 삭제하지 않는다. 파일 프로젝트가 있으면 같은 곡 ID의 브라우저 사본보다 우선한다.
- 프로젝트 record는 `SerializedRecord<ProjectAsset>`와 선택적인 canonical 참조를 사용한다. API/CLI 읽기는 자산을 기존 packed version 2로 복원한다. 쓰기는 packed 자산 또는 해당 프로젝트의 검증 가능한 자산 참조를 받는다. 실제 Song·MusicXML 의미 검증은 기존 읽기·조판 경로에서 수행한다.
- 완성 `.drumscore`는 제작 프로젝트의 백업이 아니다. 제작 전체 백업은 현재 record와 편집 자료를 포함하지만 프로젝트의 전체 저장 디렉터리·work/review/output까지 복제하지 않는다. 그 기록까지 보존하려면 프로젝트 폴더를 보관한다.
- 구현과 정적 검사, 실제 자료 이관·저장 왕복·제작자 연결 검증은 구분한다. 2026-11-14 구현 작업에서는 실제 사용자 자료 이관과 화면·송신 시험을 실행하지 않았다.

<a id="confirmed-lyric-corrections"></a>

### 확정 가사 교정 이력과 제작 자료

- `RecordData.lyricCorrections`는 저장 확정 순서의 누적 이력이다. 각 항목은 교정 ID·곡 ID·확정 시각·`source: "editor" | "producer"`·전후 XML SHA-256·가사별 `before`/`after`를 가진다. 가사 상태는 ID·문구·확인 상태·`measureId`·`quarterOffset`·`durationQuarters`이며 추가/삭제는 한쪽 상태가 없다. 재생 초와 SVG 좌표를 위치 정본으로 삼지 않는다.
- 제작 재생성은 현재 프로젝트의 누적 이력과 마지막 가사 교정의 해시에 대응하는 보존 XML을 공통 store에서 읽는다. 메타정보만 달라진 최신 XML이나 초안으로 바꾸지 않는다. 프로젝트가 없을 때만 구형 봉투 경로를 사용한다.
- `revisions`의 최근 10개 스냅샷과 별도로 보존한다. 이전 저장본을 복원해도 누적 이력은 되돌리지 않으며, 복원 내용을 저장 확정하면 새 교정이 된다. 현행 제작기는 MusicXML·누적 이력을 같은 파일 저장본에 기록한다. 앱과 제작 CLI는 공통 가사 차이 계산을 사용하며 제작자 저장은 이전 이력의 누락·변경을 거부한다. 기존 DB schema 5와 제작 전체 백업 version 2의 선택 필드도 보존해 읽는다.

다음 봉투·접수증 규칙은 **기존 브라우저 저장과 요청별 전달 자료**의 읽기·복원 계약이다. 아래 전달 대기·재전달 버튼 설명은 제거된 UI의 과거 동작이며 현행 기능이 아니다. 현행 파일 프로젝트는 같은 저장본에 교정 이력과 XML을 기록한다.

- `lyricCorrectionDelivery.envelope`는 직전 확정 교정의 XML과 누적 이력을 동결한 사본이다. 전체 제작 백업은 이력·봉투·접수증을 함께 보존한다. 임시 편집 중 재전달해도 이 확정 사본만 사용한다. 곡 저장 성공 뒤 로컬 전달을 시도하고, 실패하면 확정 저장은 보존한 채 전달 대기와 재전달 버튼을 표시한다.
- `.drumscore` 재가져오기에서 같은 곡 ID를 교체할 때는 공통 앞부분이 일치하는 더 긴 교정 이력과 해당 전달 봉투·접수증을 유지한다. 공통 재적용 함수로 가사 사본을 대조해 최신 확정값이 이미 반영된 입력만 저장한다. 과거 가사로 되돌아가거나 다른 가지의 이력이면 저장 전에 중단하며, 입력 가사를 추정 교정하거나 기존 곡을 덮지 않는다. 제작기의 같은 ID 가져오기는 기존처럼 새 ID의 사본을 만들어 원래 곡과 이력을 보존한다.
- 사용자가 승인한 제작 전체 백업 복원은 백업 당시의 악보·교정 이력·봉투·접수증을 복원한다. 현재 로컬 이력을 강제 병합하거나 그 차이만으로 복원을 막지 않는다. 프로젝트의 최신 접수 파일은 후퇴시키지 않으며, 복원 이후 다른 이력 가지가 전달되면 접수 단계에서 거절하고 전달 대기로 표시한다.
- 이전 전달 중 새 저장을 확정하면 새 확정 봉투를 대기시켜 이어서 전달한다. 대기 봉투를 아직 확정하지 않은 편집 내용으로 다시 만들지 않는다.
- 봉투 형식은 `format: "drum-practice-lyric-corrections"`, `version: 1`, `songId`, `canonicalXML`, `canonicalSHA256`, `corrections`다. 최신 교정의 결과 해시와 XML 해시가 일치해야 한다. 로컬 접수 파일은 `data/production/lyric-corrections/<encodeURIComponent(songId)>/latest.json`이며 전체 누적 이력을 포함한다.
- 접수는 기존/입력 이력의 공통 앞부분을 비교한다. 동일/이전 저장본의 재전달은 최신 XML을 덮지 않고, 새 교정이 이어진 경우에만 원자적으로 교체한다. 다른 가지의 이력이나 같은 ID의 다른 내용은 거절하고 전달 대기로 남긴다. 저장 시각으로 이력 순서를 추측하지 않는다.
- `접수됨`은 해당 파일이 프로젝트에 저장된 증거다. Codex 채팅 전달·제작 재적용·앱 수록은 별도의 인계와 검증으로 확인한다. 절차와 분담은 [공동 계획](../../plans/confirmed-lyric-corrections-20261113.md)을 따른다.

<a id="score-production-requests"></a>

### 담당 세션의 제작·교정 요청

아래는 보존된 요청별 파일·결과를 읽는 구형 계약이다. 새 작업은 [로컬 제작 프로젝트](#local-score-projects)와 [공동작업 절차](../../how-to/collaborate-on-score.md#shared-score-workflow)를 사용한다. 요청 종류·내용·첨부를 다시 입력하는 UI는 제공하지 않는다.

PC 로컬 제작기의 요청 자료는 `src/model/production-request.ts` version 1 계약과 `server/production-request-store.ts`를 앱·제작 CLI가 공유한다. 음악 정본·Song·완성 `.drumscore`와 별도로 `data/production/requests/<요청 UUID>/`에 보존한다. 이미 생성된 자료는 [기존 요청 확인 절차](../../how-to/collaborate-on-score.md#legacy-production-requests)를 따른다. 방향 변경의 이유는 [ADR-0035](../../decisions/0035-score-session-collaboration.md)에 둔다.

| 파일 | 소유자와 내용 |
| --- | --- |
| `request.json`, `input/` | 앱이 요청 종류·설명·곡 ID·기준 정본 SHA·선택 마디 ID·첨부 경로/크기/SHA를 동결한다. 교정 요청에는 최신 확정 MusicXML·원본 패키지·존재하는 확정 가사 교정 봉투를 포함한다. 저장한 입력은 덮어쓰지 않는다. |
| `dispatch.json` | 앱의 전달 시도 UUID·시각·본문과 `attempting/accepted/unknown/not_sent`, 명시적 결과 반영 접수증. 채팅 접수와 제작 완료는 구분한다. |
| `progress.json` | 제작자의 `working/question/completed/failed`, 질문 UUID, 결과 요약·검증별 `passed/not-run/failed`와 산출물 목록. |
| `answers/<질문 UUID>.json` | 사용자가 확정한 답변 UUID·질문 ID·내용·시각. 같은 질문의 확정 답변은 덮어쓰지 않는다. |
| `result/` | 실제 크기·SHA를 확인한 MusicXML·`.drumscore`·SVG·검토 보고서. 반영용 `primary`는 `.drumscore` 하나만 지정할 수 있다. |

- 입력은 최대 16개·앱 기준 합계 500 MiB이며 서버 multipart 한도는 512 MiB다. manifest·상태·경로·실제 파일 해시를 공통 store에서 검증하며 경로 이탈과 요청 디렉터리의 심볼릭 링크를 거부한다. 입력이 전부 기록된 임시 폴더를 원자적으로 확정한다.
- 실제 전송은 사용자 전송/답변 버튼으로만 시작한다. 기존 Session Bridge에 고정 담당자·stdin JSON을 전달하고 시도 UUID를 기존 원장과 연결한다. `accepted/unknown/attempting`은 자동 재전송하지 않는다. 확인된 `not_sent`만 사용자가 새 시도로 재시도한다. 상태 조회·SSE·일반 저장은 제작 채팅을 호출하지 않는다.
- 구형 요청 모달의 결과 미리보기·수락과 전용 IndexedDB 쓰기는 제거했다. 과거 동작은 [당시 계획과 검증 기록](../../plans/score-session-collaboration-20261113.md)에 보존한다. 현재 제작 결과는 같은 파일 프로젝트에 저장하며 head·초안 대조와 교정 이력 보존은 [로컬 제작 프로젝트](#local-score-projects)를 따른다.
- 로컬 `POST /api/score-requests/:id/open-result-folder`는 빈 JSON 본문만 받는다. 요청 ID로 고정 `result/` 디렉터리를 찾고 실제 경로·디렉터리 여부를 확인한 뒤 macOS Finder로 연다. 호출자가 지정한 경로·명령을 실행하지 않으며 기존 same-origin 제한을 유지한다.
- `RecordData.productionReceipts`에는 과거 모달에서 **실제로 저장한** 요청 ID·산출물 SHA·곡 ID·반영 시각이 남는다. 서버의 기존 접수증 확인 경로는 같은 접수증을 중복 기록하지 않고 다른 접수증은 충돌로 처리한다. 제작 전체 백업과 같은 ID 패키지 교체에서 이 증거를 보존하되 MusicXML·완성 `.drumscore`에는 넣지 않는다. 현행 UI는 새 접수증을 생성하거나 재전달하지 않는다.

### 앱 저장소와 구형 자료 정리

- 드럼연습실과 제작기의 기존 자료 읽기는 동일 origin의 `drum-practice` DB schema 5를 사용한다. 새 제작 편집 저장은 위 로컬 파일 프로젝트로 전환한다. packed record와 제작기 전체 백업은 version 2이며 구형 전체 백업은 거부한다.
- schema 전환 시 기존 곡의 원본 XML·PDF·음원·대체 악보 원본·제작 초안·수정 이력·가사 작업 자료를 `sourceFiles`에 보존한 뒤 활성 곡·이전 분석 캐시·이관 표식을 초기화한다. 보존본은 목록으로 자동 복원하지 않는다. 이전에 삭제 승인된 `tom-moving-original-v1`은 되살리지 않는다.
- 옛 `drum-practice-player` DB도 원본/제작 기록 보존 후 삭제를 요청한다. 열려 있는 옛 탭이 있으면 삭제 완료가 지연될 수 있다. 구형 데이터 정리는 새 앱을 실제로 열 때 실행되며 코드의 정적 검사만으로 실행 완료로 보고하지 않는다.
- 렌더 캐시 DB schema 2와 새 정책 키로 이전 SVG 캐시를 폐기한다. 로컬 원본·제작 작업 파일·검증/발행 기록은 삭제하지 않는다. 구형 로컬 수록 패키지는 전환된 정본으로 다시 만들고 PDF·음원 자산의 바이트를 대조한다.
- 이번 전환의 사용자 승인은 개발 단계의 구형 앱 자료에 한정한다. 음원 연습 JSON의 현행 기능과 원본 음원은 유지한다.

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

- 곡별 `settings.click`을 유지하고 선택적인 `clickDivision: 4 | 8`을 추가한다. 현재 Song/음원 연습 JSON은 버전1, 완성 패키지는 버전2다. 클릭 설정의 의미는 조판·저장 형식 전환과 독립적으로 유지한다. 누적 클릭 위치는 재생 세션에서만 관리하며 저장하지 않는다.
- 필드가 없는 구형 파일은 경고 없이 4분으로 해석한다. `click: false`는 끄기다. 숫자 4·8은 그대로 왕복 저장한다. 새 악보·음원 가져오기는 기존 연습 기본값과 4분 켜짐을 적용하며, 저장곡·명시적 백업 복원은 선택값을 보존한다.
- 공통 정규화는 `.drumscore`, 저장곡(제작 초안·수정 이력 포함), 연습 JSON과 제작 백업을 읽을 때 잘못된 분할 값만 **작업 사본에서 4로 보정**한다. 원본 파일이나 기존 레코드는 읽기 보정만으로 덮어쓰지 않는다. 다른 필드 검증은 유지하고 정상적인 후속 저장에는 보정값을 반영한다.
- 읽기 작업의 보정 결과를 모아 기존 상태 알림에 한 번 안내한다. 진단에는 식별자·필드·기대값·제한된 실제 값/타입·적용값을 기록하며 전체 곡이나 음원을 출력하지 않는다. 설명 팝업·설정 행 우측 설명을 추가하지 않는다.
- 지원하는 파일에서 클릭 분할의 저장·복원을 확인한다. 구버전 앱과 완성 패키지 v1의 상호 읽기는 지원하지 않는다. UI·재생 의미는 [재생 계약](../product/playback.md)을 따른다.

<a id="practice-file--설정-ui"></a>

### 설정 UI

목록 설정의 화면·백업 섹션은 같은 배경·안쪽 여백·모서리·테두리와 공통 제목 스타일을 사용한다. 목록·재생 설정의 섹션 제목과 재생 설정 바로가기는 ‘백업’으로 표시한다. 백업 영역의 상시 설명은 표시하지 않는다. 상세 복원 조건은 도움말과 실제 원본 연결 단계에서 안내한다.

버튼과 행은 화면 설정의 `settings-choice-row`·`settings-choice-buttons segmented-control` 공통 CSS를 직접 사용한다. 백업·복원은 실행 동작이므로 선택 상태를 표시하지 않는다.

<a id="practice-file--동일-음원-중복-등록-방지"></a>

#### 동일 음원 중복 등록 방지
- 음원 불러오기와 백업 복원은 내 음원 목록의 파일 바이트 SHA-256을 비교한다. 이름이 달라도 같은 파일이면 음원 불러오기에서 파일명과 함께 중복 추가 확인 팝업을 표시한다. [추가]는 별도 항목 추가, [취소]·Esc는 취소다. 기존 항목·보정·마커·구간을 보존한다. 같은 이름의 다른 파일과 악보 패키지에 포함된 음원은 충돌로 보지 않는다.
- 백업 내 동일 음원 또는 기존 음원과의 중복이 하나라도 있으면 복원 묶음 전체를 저장하지 않는다. 이미 등록된 중복 항목을 자동 삭제하지 않는다.
