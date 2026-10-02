# 탐색 경로와 확인 방법

이 문서의 서비스 동작은 2026-09-20~21 세션 관측이다. 현재 페이지·API·클라이언트 구현을 다시 확인하고 사용한다. 과거 성공을 현재 가용성으로 간주하지 않는다.

## LRCLIB

- 문서: https://lrclib.net/docs
- 읽기 검색: `https://lrclib.net/api/search?q=<URL-encoded query>`
- 일본어 제목, 로마자 제목, 가수명을 독립적으로 조회한다. 결과에서 `trackName`, `artistName`, `albumName`, `duration`, `syncedLyrics` 존재 여부를 확인한다. 요약 로그에는 가사 내용을 출력하지 않는다.
- `q`는 앨범명이 일치하는 다른 곡도 반환할 수 있다. 「風と丘のバラード」 검색에서 같은 앨범의 `L.M.L.`이 나온 사례가 있었다.
- HTTP 오류는 0건과 다르다. 장애를 검색 실패로 기록한다.

## 공개 파일·저장소

- 검색 조합: 원어/로마자 곡명 + `lrc`, `synced lyrics`, `karaoke ass`, `ssa`, `srt`, `vtt`, `ttml`, `歌詞 タイムタグ`, `歌词 lrc下载`.
- ASS는 Aegisub 문서의 karaoke timing 규칙을 기준으로 검사한다: https://aeg-dev.github.io/AegiSite/docs/3.0/Karaoke_Timing_Tutorial/
- Karaoke Mugen: https://github.com/karamoe/karaokebase 는 GitLab 정본의 백업 미러다. 미러 조회 결과를 정본의 완전한 최신 상태라고 표현하지 않는다.
- GitHub tree API를 사용하면 `truncated`를 확인한다. 전체 트리가 잘리면 root tree에서 `karaokes`, `lyrics`의 SHA를 얻어 각각 recursive tree를 조회한다. 파일명이 무관하면 노래 메타데이터의 제목/별칭 구조도 고려한다. 존재 확인만을 위해 미디어 전체를 다운로드하지 않는다.
- 앨범 트랙명의 `(KARAOKE)`는 반주 음원일 수 있다. 타이밍 가사 파일이라는 의미가 아니다.
- 애니메이션 대사 자막 묶음은 기본 탐색 대상에서 제외한다. 해당 곡의 노래 타이밍이 포함된다는 구체 증거가 있을 때만 노래 구간을 제한적으로 검사한다. ASSRT 403은 데이터 부재가 아니라 접근 실패다.

## TypingTube

- 해당 곡의 `/movie/show/<id>` 페이지를 찾고 제목과 연결된 YouTube 영상 ID를 확인한다.
- 독립 LRC 파일이 없어도 행 단위 시간이 있는 내부 데이터가 있을 수 있다. 페이지 HTML만 보고 실제 타이밍을 확인했다고 하지 않는다.
- 공개 클라이언트의 현재 `lyrics_scroll_controller` 구현에서 데이터 조회·파싱 계약을 확인한다. 해시가 붙은 JS URL을 과거 값으로 고정하지 말고 현재 HTML에서 찾는다.
- 관측 당시 일반 페이지 세션에서 쿠키, `game-token`, CSRF 값을 받아 `POST /api/lyrics/<id>?token=...`로 읽었다. 해당 POST는 가사 조회였으며 `/api/play` 등 재생 기록 쓰기는 호출하지 않았다.
- 응답은 평문 TSV 또는 브라우저가 표시용으로 해석하는 JSON 포장이었다. 브라우저와 동일한 정상 표시 절차만 사용하고 인증·접근 제한·보호 장치를 우회하지 않는다. 쿠키·토큰·표시 키를 로그나 파일에 출력하지 않는다.
- 당시 파서는 첫 줄을 제외하고 탭으로 나누어 `(초 단위 시각, 텍스트, 읽기)`를 읽었다. 빈 텍스트와 `end` 표식은 가사 시작 시각과 구분한다. 현재 스키마가 다르면 이 계약을 재검증한다.
- 타이밍 전용 산출물에는 시작 시각만 저장한다. 원문 응답이나 가사 전체를 출력·저장하지 않는다. 문구 대응이 필요한 사용자 제공 가사 변환에서는 확인 가능한 대응만 사용한다.

### 이번 세션의 확인 사례

- 곡: Real Paradis with のだめオーケストラ — 風と丘のバラード
- 페이지: https://typing-tube.net/movie/show/29197
- 연결 영상 ID: `fEtcDr8TArQ`
- 숫자 시각 행 40개: 비어 있지 않은 가사 행 35개, 빈 행 4개, 종료 행 1개.
- 가사 첫 시작 20.70초, 마지막 시작 245.91초. 종료 표식 288초는 마지막 가사의 종료 시각이라는 증거가 아니다.
- 행 단위이며 음절 타임스탬프는 확인되지 않았다. 연습 음원과 싱크는 미검증.
- 로컬 타임스탬프: `data/reference/lyrics-timing/real-paradis-kaze-to-oka-no-ballad-typingtube-29197.timestamps.txt`.
- 과거 대화의 LRC 코드는 구절 대응을 별도로 검증하지 않은 초안이다. 문자 수만으로 경계를 추측한 매핑을 정답 예제로 재사용하지 않는다.
