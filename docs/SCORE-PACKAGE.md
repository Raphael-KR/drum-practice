# 완성 악보 파일 계약 — .drumscore v1

- 목표: 제작 앱에서 완성한 악보를 재생 앱이 변환 작업 없이 읽는다.
- 범위: `src/score-package.ts`가 ZIP 쓰기·읽기·구조 비교를 단독 소유한다.
- 완료 조건: 같은 곡 ID, 전체 Song 정보, 원본·렌더링 자산이 왕복 보존된다.
- 제외: HTML 재생 파일 생성, 실제 보관함 이전, 외부 업로드는 이 계약에 포함하지 않는다.
- 검증: `tests/score-package.test.ts`의 왕복·잘못된 입력·압축 해제 제한 검사.

## 공개 API

```ts
createScorePackage(record: RecordData): Promise<Blob>
readScorePackage(blob: Blob): Promise<RecordData>
scoreStructureSignature(song: Song): string
SCORE_PACKAGE_EXTENSION // ".drumscore"
```

파일 MIME은 `application/vnd.drum-practice.score+zip`이다. 확장자는 발견용이며 읽기는 내부 버전과 자산을 검사한다. 기존 보관함의 `RecordData`를 직접 받을 수 있고 읽은 결과도 같은 타입이다. 저장·교체와 기록 보존 결정은 호스트의 책임이다. 이 모듈은 DB에 쓰지 않는다.

## ZIP 내용

`manifest.json`의 최상위 `format`은 `drumscore`, `version`은 `1`이다. 다른 버전은 거부한다.

- `song`: 전체 Song. 제목·원제·가수·작사·작곡·마디·박자·음원 시각·가사 위치·마커·반복·재생 설정을 그대로 보존한다. 축약 HTML용 `playbackSong`은 사용하지 않는다.
- `source`, `audio`, `pages`: `{ path, type, size }` 자산 참조. 바이너리는 ZIP 엔트리로 저장하며 base64를 사용하지 않는다.
- `canonicalXML`: 존재하면 그대로 보존하는 정본 XML 문자열.
- `otherScores`: 다른 악보 형식의 이름·파트·페이지·영역·마디 연결과 원본 자산. 현재 PDF와 MusicXML 한 쌍까지 지원한다.

엔트리 경로는 `score/source`, `score/pages/0`, `audio/source`, `alternates/0/source`, `alternates/0/pages/0` 형식이다. DEFLATE로 압축한다. 편집 중 draft와 수정 이력은 완성 파일의 대상이 아니며 제작 보관함에 남긴다.

## 유효성 및 자원 제한

Song은 기존 `validateSong`을 통과해야 한다. 마디가 하나 이상이고 실제 페이지 수가 Song.pageCount와 같아야 한다. 모든 자산은 비어 있지 않아야 한다.

- PDF 원본: `application/pdf`. 페이지: PNG/JPEG/WebP.
- MusicXML 원본: Recordare MusicXML 또는 XML MIME. 페이지: SVG 또는 기존 SVG gzip MIME.
- 음원: `audio/*` MIME.
- 대체 악보는 본 악보와 마디 ID·분자·분모의 순서가 같아야 한다. 별도 페이지와 영역은 `validateSong`으로 검사한다.

ZIP은 최대 512 MiB, 확장 후 합계 512 MiB, 엔트리당 256 MiB, manifest 16 MiB, 1,100 엔트리까지다. 중앙 디렉터리의 크기를 압축 해제 전에 검사한다. 압축 해제 시에도 각 엔트리의 실제 출력이 선언된 크기를 넘으면 스트림을 중단한다. 절대 경로·상위 경로·중복 경로·목록에 없는 파일·빠진 파일·다중 디스크·ZIP64·암호화·지원되지 않는 압축 방법을 거부한다. 파일은 디스크에 추출하지 않는다.

MIME과 크기 검사는 원본 음악·이미지 자체의 콘텐츠 진위를 보증하지 않는다. 재생 시 이미지를 디코딩하고 기존 SVG 안전 검증을 적용하는 경계는 재생 호스트가 유지한다. 패키지는 실행 스크립트를 실행하지 않는다.

## 수정본과 연습 기록

`scoreStructureSignature`는 각 마디의 `[id, beats, denominator]` 순서를 JSON 문자열로 반환한다. 제목·음원 타이밍·페이지 배치는 포함하지 않는다. 같은 곡 ID와 같은 구조인 경우 호스트가 연습 기록을 유지할 수 있다. 구조가 다르면 자동으로 기록을 재배치하지 않고 기존 기록을 보존한 채 사용자의 선택을 받는다. 원래 Song의 마커·반복을 패키지 처리 과정에서 잘라내지 않는다.

## 기존 제작 파일의 MIME 정규화

브라우저 File의 MIME이 비어 있거나 일반 바이너리 MIME인 경우 생성기는 파일 이름만으로 형식을 단정하지 않는다. PDF 헤더, MusicXML 루트, MP3(ID3/MPEG frame), WAV, FLAC, Ogg Opus/Vorbis, AIFF, M4A 계열, AAC ADTS의 식별 바이트를 확인해 manifest MIME을 채운다. 확인되지 않는 빈 MIME 음원은 거부한다. 브라우저가 이미 부여한 유효 audio MIME은 기존과 같이 유지한다.

압축 MusicXML `.mxl`은 ZIP 내부 `META-INF/container.xml`과 연결된 `score-partwise` XML을 크기 제한 아래 검사한다. 실제 원본 ZIP 바이트는 바꾸지 않고 MIME만 `application/vnd.recordare.musicxml`로 정규화한다. canonicalXML은 별도로 그대로 보존한다. 내부 MXL 디렉터리 엔트리는 허용하지만 경로 탈출은 거부한다. 재생 앱의 reader는 정규화된 manifest MIME만 받는다.
