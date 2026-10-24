# Apple 로컬 도구 사용

문서 역할: **실행 절차**. 현재 요청과 전역·프로젝트 지침의 승인 범위 안에서 수행한다. [정본 목록](../RULES-INDEX.md)과 [작업별 안내](../README.md)를 먼저 확인한다. 예시 명령·과거 기록은 이번 실행의 성공 증거가 아니다.

<a id="apple-local-workflow--apple-로컬-검토-실행-절차"></a>

## Apple 로컬 검토 실행 절차

문서 역할: **실행 절차**. [로컬 검토 계약](../reference/score/tools.md#apple-local-review--apple-로컬-가사-검토-계약)의 출력/판정과 [검증 Rule](../reference/engineering/verification.md#verification-rules--검증-범위와-증거)의 허가 범위를 먼저 확인한다. STT·AFM 의견은 악보 위치나 가창 시각을 자동 확정하지 않는다.

<a id="apple-local-workflow--실행"></a>

### 실행

프로젝트 루트 `/Users/raphael/Playground/drum-practice`에서 실행한다. 현재 Mac/Xcode의 Speech 및 FoundationModels SDK, 설치된 일본어 STT 자산과 사용 가능한 로컬 모델, ffmpeg, Python 3가 필요하다. 도구는 모델을 자동 다운로드하지 않는다.

```sh
pnpm run review:local \
  --audio public/demo/audio.mp3 \
  --manifest data/reference/apple-stt-manifest.json \
  --song public/demo/song.json \
  --out docs/experiments/apple-workflow-03
```

출력 경로는 존재하지 않는 새 디렉터리여야 한다. 기존 실행·소스·song.json을 덮어쓰지 않는다. 원본 가사 및 음원은 Git 제외 경로에 유지한다. 새 곡은 아래 형식의 manifest를 제공한다. `song`은 마디 번호 연결을 위한 선택 입력이다.

```json
{"locale":"ja_JP","segments":[
  {"id":"verse1","start":10,"end":25,"reference":"사용자가 제공한 해당 구간의 일본어 가사"}
]}
```

구간 경계·가사 자체의 정확성도 검토 대상이다. 인접 구간이 겹치면 같은 발음이 중복 인식될 수 있다. 누락된 원문 부분에는 시각을 만들어 넣지 않는다.

<a id="apple-local-workflow--확인과-종료"></a>

### 확인과 종료

출력 파일·시간/ID/enum·누락/중복·실패 기록과 원본 보존을 확인한다. 경계 재검토의 anchors는 원래 STT와 별도로 전달하며 원본·confirmed 값을 바꾸지 않는다. 관련 기존 단위 검사는 `pnpm run test:local`을 사용한다. STT/AFM 실실행과 단위 검사를 구분하고 허가된 범위에서 수행한다.

새 실행 결과는 [로컬 도구 기록](../records/apple-local-tools.md#apple-local-review-history--apple-로컬-가사-검토-실측-기록)에 입력·환경·판정과 함께 남긴다. 공유 대상 여부는 프로젝트 지침을 확인한다.

<a id="apple-local-workflow--청취-앵커-입력"></a>

### 청취 앵커 입력

manifest의 `anchors`에 사용자가 확인한 구간 ID·글자·시각·출처를 기록한다. 아래는 기존 자료의 입력 예시이며 새 음원에 복사할 기본값이 아니다. 계약은 [로컬 검토 Rule](../reference/score/tools.md#apple-local-review--경계-후보의-의미)을 따른다.

```json
{"anchors":[{"id":"user-bar15-ko","segmentId":"part01","text":"こ","time":37.09022813444695,"reviewer":"user","source":"15마디 네 번째 팔분음표"}]}
```
