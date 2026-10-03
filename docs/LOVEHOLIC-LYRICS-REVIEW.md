# Loveholic 인쇄 가사 제작과 과거 시각 시험 — 2026-10-03

최신 실제 수록·PDF 좌표 수정은 [PDF 가사 위치 수정](LOVEHOLIC-PDF-LYRIC-PLACEMENT.md)을 따른다. 아래 패키지 제작 검증과 실제 앱 수록 상태를 구분한다.

## 최신 결정: 악보가 가사 기준 (2026-10-03)

사용자가 실제 가창 시각·길이는 기록하지 않아도 되며 가수가 악보와 다르게 부르는 것은 무시하라고 결정했다. 현재269단위 가사 위치·음가는 악보 기준으로 유지한다. 실제 가창 시각·길이 측정, STT·강제 정렬·시간 가사 검색은 추가 완료 과제가 아니다. 과거 음원 시험은 아래에 이력으로 보존한다.48/99/107/109마디4개 위치는 악보 판독상의 추정으로 계속 명시한다. 음원 재생 연결·초 단위 파생 캐시는 기존 계약대로 유지한다. 저장 구조는 별도 DrumPracticeLyrics이며 드럼 P1 음표에 직접 붙인 구조로 바꾸라는 결정은 아니다.

## 최신 재생 캐시 패키지 (2026-10-03)

개발 세션의 시간 비례 SVG 렌더러 검증 후 새 폴더 `docs/experiments/loveholic-20261002/standard-lyrics-final-package-20261003/`에 재패키징했다. 기존 검증 XML을 바이트 그대로 사용하고 캐시만 갱신했다. `Loveholic.drumscore` SHA256 `3bbb8ba0013e38e8f652c432b3f8f76591df453f8a796c0698a193c4bcaf409a`,10,483,505바이트. `Loveholic-final.musicxml` SHA256 `e84578fe97421141fe6944f6a18aa72fdce746fb788ee2bc1ffcd082110f6df8`은 이전 검증본과 같다.

실제 저장 패키지를 재읽고 공통 preparePlaybackAssets에서 ribbon123개·staff좌표123개 확인. 공통 renderMeasure/layoutScoreLyrics의 한 줄 보기269표시·겹침0, 박당 너비 편차5.68e-14px·오선 간격 편차1.78e-15px. 두 줄 QA31행269표시·겹침0. XML 캐시 비운 복원·음원 연결+5초·재저장 후269개 음악적 위치 불변. XSD4.0/ZIP CRC/원본PDF·MP3/PDF variant/마디 시각·가사·드럼 입력 보존 통과. XML1580음표머리·14쉼표, 인쇄/재생SVG 모두VexFlow notehead그룹1594개(쉼표 포함), half-open20개. 인쇄3쪽·재생8쪽 캐시. ZIP변경 항목은 score/pages/0와manifest뿐이다.

근거: 새 폴더 `final-validation.json`, `ribbon-browser-validation.json`, `rows-browser-validation.json`, `ribbon-lyrics.png`, `rows-ending.png`. Safari 로컬 화면에서 가사 위치와 마지막 마디를 직접 확인했다. IndexedDB 쓰기0이며 저장 곡 import·실제 재생·공개 수록/배포는 개발 세션의 후속 검증 범위다. 이전 모든 산출물은 보존한다. 아래 최초 표준 가사 제작의 잠정 캐시는 이 최신 결과로 대체한다.

## 표준 가사 성부 전환 결과 (2026-10-03)

- 목표: 사용자 요청에 따라 Real Paradis와 같은 표준 note/lyric 및 독립 DrumPracticeLyrics 성부로 Loveholic 가사를 저장한다.
- 범위: 원본 문자·음표/쉼표 귀속 대조, 제작 스크립트, 새 MusicXML/패키지 및 근거. 공통 앱 코드는 개발 세션이 소유한다.
- 완료 조건: 원문353문자·269단위 보존, 가사별 마디·박·표시용 음가 XML왕복, 드럼/미디어/기존 결과 보존과 실제 화면 검수.
- 제외: 보컬 음높이 생성, 음원 STT 성공을 선행 조건으로 삼기, 미확인 값을 청취 확정으로 보고, 기존 수록본 덮어쓰기/공개 배포.
- 검증: 대표3줄 및 전25줄 대조,15fixture, XSD·캐시 없이 복원·음원 연결 이동·패키지 재읽기·공통 표시 통과. XML 제작 검증과 공통 렌더 캐시 갱신 상태는 아래에서 구분한다.

265단위는 실제 드럼 음표/쉼표의 시작과 인쇄 underlay를 직접 대응한다. 48/99/107의 마지막 럼과109의 어는 드럼 4분음표 내부에 인쇄돼 있다. 평행 구절40/83/91/50의 명시적8분음표 대응을 참고한3.5박(0기준)은 추정으로 별도 표시한다. 화면용 가사 성부 길이는 기준 음표/쉼표 음가이며 실제 보컬 발음 끝을 측정한 값이 아니다. 기존 Real Paradis도 가사 음가 저장과 실제 청취 검증을 구분한다. 모든 confirmed=false를 유지한다.

현재 확인: 원문353문자/269단위 동일,265직접대응 및4추정 구분, 전25줄 source-note-contact3쪽 시각 대조와15fixture 통과. 코드 `scripts/musicxml/loveholic_lyric_notes.py`, 새 근거 `standard-lyrics-review-20261003/printed-note-lyrics.json`. 원본과 기존 중앙 가사 패키지 보존.

XML: `docs/experiments/loveholic-20261002/standard-lyrics-package-20261003/Loveholic-final.musicxml`, SHA256 `e84578fe97421141fe6944f6a18aa72fdce746fb788ee2bc1ffcd082110f6df8`. P1은 재추출 원본과 XML 정규화 후 동일하다. 별도 DrumPracticeLyrics123마디에269개 lyric/text를 저장한다. 보컬 pitch는 생성하지 않는다. MusicXML4.0 XSD,123마디492박1580머리/20half-muted, ZIP CRC와 XML원시 바이트·원본PDF/MP3 보존 통과.

Safari의 실제 저장 패키지 재읽기와 공통 preparePlaybackAssets/renderMeasure/layoutScoreLyrics 검수에서 SVG/PDF 각각269개 표시·31행·겹침0. XML에서 캐시를 비우고269개 위치·길이 복원, 음원 연결 전체+5초 후 음악적 위치 유지, 두 번째 XML저장/복원 일치 확인. IndexedDB 쓰기0이며 저장 곡 import·실제 재생/iPad/배포 검증을 대신하지 않는다. 근거: 같은 폴더 `final-validation.json`, `svg-browser-validation.json`, `pdf-browser-validation.json`, `svg-opening.png`, `svg-inferred.png`, `pdf-opening.png`. 집중 canonical-xml/score-package/musicxml 3파일35테스트 통과.

같은 폴더의 패키지 SHA256 `54282a19b08b6210a08af37cdadfd6283a6d318056b0e6c2068d63d4482094e4`는 잠정 렌더 캐시다. 병행 개발의 박 간격 렌더러 변경으로 이전 패키지 대비SVG영역36개의 y/h가 바뀌었다. PDF variant·마디 시각·드럼 입력은 그대로다. 개발 세션의 렌더러 검증 후 캐시를 갱신하며 현재 패키지를 최종 공개 수록본으로 보고하지 않는다.

## 이전 결과: 원본 인쇄 가사 77마디 수록

사용자 정정에 따라 STT·강제 정렬을 인쇄 가사 수록의 선행 조건에서 제외했다. 원본에는 드럼 성부와 인쇄 가사가 있으며 보컬 음가를 입증하는 독립 성부는 없다. 따라서 [마디 가사 계약](MEASURE-LYRICS.md)의 measure-center로 저장했다. 아래 음원 시험 실패는 이 제작 경로를 막지 않는다.

`scripts/musicxml/loveholic_printed_lyrics.py`가 원본 PDF 문자 bbox와 실제 마디 경계를 대조했다. 25줄·269문자/영어단어 단위·공백 제외353문자를 77마디에 귀속했고 경계를 가로지른 단위는0개다. 원문 문자·좌표·행 공백을 별도 근거에 보존했다. 전25줄의3쪽 contact sheet를 직접 대조했다. 37번 줄의 첫 가사는39마디,80번 줄은82마디에 있다. 줄 시작번호는 가사 시작번호가 아니다.

새 패키지 폴더는 `docs/experiments/loveholic-20261002/printed-lyrics-package-20261003/`이다. 패키지 SHA256 `26b97bd8b5a1611c4667d42a3fa9205cc6190a8c469000aec9944f45d689fcc1`, XML `c2dcf86e50805d0dfa1f01ca5cfda398cd045c5df3475266f64c4d5a8cba503a`. 77항목은 Song.measureLyrics 및 정본 manifest에 저장·복원되고 lyrics=[]는 유지한다. 가창 시각이나 가짜 보컬 음가를 생성하지 않는다.

검증: 원문353문자 동일, P1드럼 성부 동일,123마디492박1580머리/half-open20개 XSD·재읽기 통과. ZIP CRC·원본 PDF/MP3 바이트·PDF variant·마디 시각/영역/연습 설정 보존. 실제 공통 renderMeasure의 SVG77개 중앙 표시와 XML 캐시를 비운 뒤 복원 일치 확인. 집중3파일31테스트 통과. Safari MCP의 Transport closed 때문에 승인된 ego-browser를 사용했다. QA grid의 높이0px 및 고정 PDF비율 오류를 바로잡아 실제 SVG page비율로 검수했다. 앱 저장 곡 import·iPad·배포 검증은 개발 세션 담당이며 이 grid 검수와 구분한다.

근거: 형제 `printed-lyrics-review-20261003/printed-measure-lyrics.json`, `printed-lyrics-validation.json`,3쪽 contact sheet. 새 패키지 폴더의 `package-audit.json`, `final-validation.json`, `preservation-validation.json`, `printed-browser-validation.json`, `printed-77-browser.png`와 opening/middle/ending 캡처. 기존 패키지와 모든 음원 시각 시험 결과는 보존한다.

## 과거 음원 시각 시험의 범위

- 목표: 사용자 원본 PDF의 인쇄 가사를 보존하고, 가창 구절 시작·끝과 음절 시각을 구분해 음원에서 확인한다.
- 범위: 로컬 분리 보컬·STT·정렬 후보·측정 기록. 원본 MP3와 기존/새 패키지를 보존한다.
- 완료 조건: 원본 구절 대응, 구간·모델을 바꾼 교차 검증, 미확인 항목 식별. 숫자가 반복된다는 이유만으로 확인 완료로 삼지 않는다.
- 제외: PDF X좌표를 가창 박으로 사용, 균등 음절 분할, 오인식으로 가사 정본 변경, 원음원 외부 전송.
- 검증: 대표 3줄을 먼저 시험했다. 줄의 시작·끝과 각 음절의 결과를 별도로 기록했다. 아래 음원 시각 후보는 패키지에 적용하지 않았다. 현재 인쇄 가사 수록 여부는 위 절을 따른다.

## 기준과 과거 근거

확정 매핑·변환 정책·[Apple 로컬 실행 계약](APPLE-LOCAL-WORKFLOW.md)을 읽었다. 과거 제작의 [가사 v2 기록](LYRICS-V2-REVIEW.md)과 `scripts/apple-local/align_syllables.py`, `docs/experiments/lyrics-v2/align-short.py`를 대조했다. 구간 첫 음절이 Whisper DTW 클립 시작에 붙는 현상은 당시에도 있었다. 과거 구절 앵커나 모델 정확도를 새 곡의 근거로 재사용하지 않는다.

원본 가사는 `printed-lyric-cues.json`의 25개 인쇄 행이다. PDF 행은 구절의 음악적 마디 기준 근처 검색 범위를 정하는 데만 사용한다. 행 시작 X좌표·마디 첫 박을 가창 시작으로 간주하지 않는다. 끝까지 없는 가사를 생성하거나 침묵의 인식 환각을 적용하지 않는다.

## 환경·자료

- 실제 환경: macOS 27.0.1, arm64. Apple SpeechBridge는 로컬 ko_KR 사용 가능·설치 확인.
- 작업 폴더: `docs/experiments/loveholic-20261002/lyrics-review-20261003/`. 모델·분리 보컬·실험 원문은 Git 제외 로컬 자료다.
- Python 3.14.7 로컬 `tools-venv`: mlx-whisper 0.4.3, MLX 0.32.3, Demucs 4.1.0, torch 2.14.1, transformers 5.18.0.
- Whisper turbo 저장소 `mlx-community/whisper-large-v3-turbo`, revision `a4aaeec0636e6fef84abdcbe3544cb2bf7e9f6fb`.
- Whisper large-v3 저장소 `mlx-community/whisper-large-v3-mlx`, revision `49e6aa286ad60c14352c404340ded53710378a11`.
- Korean CTC 저장소 `kresnik/wav2vec2-large-xlsr-korean`, revision `629c9a3501c10ba128bf3fa1eebb12af3be03f61`. `[pad]` ID 1204를 blank로 사용. 프레임 간격 20ms, receptive field 25ms.
- 모델 파일은 다운로드해 로컬 실행했다. 사용자 음원은 외부 업로드하지 않았다. AFM은 음향 시각을 생성하는 데 사용하지 않았다.

## 시험 결과와 채택 범위

| 시험 | 실제 측정 | 판단 |
|---|---|---|
| 원곡 10–40초 Apple STT | 1회 실행, 인식 세그먼트 25개 | 한국어·영어 오인식이 남음. 시각 자동 적용 안 함 |
| 같은 구간 분리 보컬 Apple STT | 1회 실행, 인식 세그먼트 21개 | 원곡보다 일부 표현이 나아졌지만 정본 대응 불충분. 자동 적용 안 함 |
| 원곡 대표 행 7/21/84, turbo 강제 정렬 | 행별 두 검색 범위. 의심 단위 7/3/7개, 최대 시작 차이 0.50/1.12/2.18초 | 첫 토큰 클립 고정과 구간 민감성이 남음 |
| 분리 보컬 대표 행 7/21/84, turbo 강제 정렬 | 행별 두 검색 범위. 의심 단위 4/3/5개, 최대 시작 차이 0.50/0.66/0.50초 | 개선됐으나 첫 단위와 일부 내부 시각은 채택하지 않음 |
| 분리 보컬 대표 행 7/37/84, Korean CTC | 각 두 검색 범위. 낮은 확률 단위 11/13, 6/8, 11/13. 시작 차이 0/0/0.88초 | 같은 숫자라도 인식문과 음절 확률이 맞지 않아 기각 |
| 분리 보컬 전곡 turbo 자유 인식 | 1회 실행, 14.97초, 세그먼트 46개·단어 167개 | 한국어 구절 인식 개선. 첫 구절·영어 오류 및 끝 침묵 환각은 별도 확인 필요 |
| 분리 보컬 전곡 large-v3 자유 인식 | 1회 실행, 24.79초, 세그먼트 45개·단어 174개 | 첫 구절은 개선됐지만 영어 후렴·끝 구절 오인식과 침묵 환각이 남음 |
| large-v3 자유 인식 대표 행 7/37/116 | 각 두 검색 범위, 총 6회·18.79초 | 첫/중간/끝을 별도로 확인. 아래 3행 모두 전체 구절 채택 기준 불충족 |
| large-v3 강제 정렬 대표 행 7/37/116 | 각 두 검색 범위. 의심 단위 5/2/3개, 최대 시작 차이 모두 0.50초 | 첫 음절 클립 고정이 남음. 자유 인식 구절 경계를 대신하지 않음 |

CTC 강제 정렬은 앞·뒤 blank를 허용해 첫 토큰을 클립 시작에 강제하지 않는다. 반복 음절 사이 blank 및 입력 거부를 합성 음향 점수로 검사했다. 이는 정렬 코드의 경계 검사이며 실제 가창 정확도 검사가 아니다. CTC 어휘에 없는 `몹`과 영어를 다른 글자로 치환하지 않았다. 한국어 prefix만 시험한 행은 전체 구절 끝을 검증한 것으로 보고하지 않는다.

LRCLIB 실제 API에서 러브홀릭·Florist·221.654초 항목 id 18812135를 확인했지만 syncedLyrics는 없었다. 다른 곡의 시간이나 일반 가사 페이지를 이 음원의 동기화 자료로 사용하지 않는다. 검색 결과는 인터넷 전체에 시간 가사가 없다는 증거가 아니다.

## 근거·재현

원곡/분리 보컬 Apple 결과는 `opening-chorus-stt.json`, `opening-vocals-apple.json`. Whisper는 `opening-chorus-whisper.json`, `opening-vocals-whisper.json`, `full-vocals-whisper.json`. 비교 정렬은 `representative-token-alignment.json`, `representative-whisper-vocals.json`, `representative-ctc-vocals.json`. 모델 identity는 `model-provenance.json`, `ctc-model-provenance.json`에 기록했다.

제작 코드 `scripts/musicxml/loveholic_lyrics_review.py`는 `--audio`로 분리 보컬을 선택할 수 있다. `loveholic_ctc_review.py`는 어휘가 확인된 한국어 prefix의 음향 점수를 검사하며 원본 본문·suffix와 미지원 글자를 별도로 남긴다. 모든 후보는 autoApply=false다.

Demucs는 원곡의 시간축을 유지한 `htdemucs` vocals를 생성했다. 두 stem 중 vocals만 저장하고 원음원은 재인코딩하지 않는다. [공식 Demucs](https://github.com/adefossez/demucs), [CTC 모델 카드](https://huggingface.co/kresnik/wav2vec2-large-xlsr-korean), [PyTorch CTC 설명](https://docs.pytorch.org/audio/main/tutorials/ctc_forced_alignment_api_tutorial.html)을 대조했다. 최신 TorchAudio에서 예전 forced_align API가 제거됐으므로 해당 함수 호출을 복사하지 않았다.

## large-v3 구절 경계 판정

검토 후보 채택 기준은 (1) 사용자 원문 구절의 대응과 순서 확인, (2) 검색 범위를 0.5초 바꿔도 구절 시작 차이 0.15초 이하, (3) turbo/large-v3의 해당 경계 차이 0.15초 이하, (4) 낮은 확률·클립 고정·다른 구절/침묵 환각 없음이다. 이 수치는 후보 선별 기준이며 실제 가창 오차 보증이 아니다. 첫/중간/끝 대표 구절을 확인하고 성공 행·실패 행을 분리한다. 모델 종류를 늘린 횟수를 정확성의 근거로 삼지 않는다.

| 원본 행 | 두 자유 인식 조건의 시작 후보 | 판정 |
|---|---|---|
| 7: 첫 한국어 구절 | 10.6432 / 10.7032초, 차이 0.06초 | prefix 후보는 안정적. 전곡 turbo의 시작 11.14초와 약 0.50초 차이. 원문 나/난 차이와 영어 끝 미확인으로 전체 구절 미채택 |
| 37: 중간 한국어 구절 | 67.1542 / 67.6142초, 차이 0.46초 | 두 번째 조건 원문 구절 오인식·시작 민감성으로 미채택 |
| 116: 끝 구절 | 201.2886초 / 해당 prefix 미검출 | 첫 조건 prefix 확률 0.082, 두 번째 조건 다른 가사로 인식. 미채택 |

이는 대표 3행에서 확정 가능한 전체 구절을 얻지 못했다는 결과다. 전곡 25행 모두에 실패가 입증됐다고 확대하지 않는다. 근거 `representative-free-large-v3.json`, `representative-forced-large-v3.json`, `line-boundary-decision.json`, `full-vocals-large-v3.json`. 첫 행의 부분 시작 후보를 전체 구절 끝·음절 리듬의 확인으로 바꾸지 않는다. 임의 평균·박자 양자화와 패키지 자동 적용은 하지 않았다.

마디별 중앙 인쇄 가사는 별도 표시 계약이다. 이 과거 음원 시험은 실제 가창 타이밍을 확정하지 못했다. 최신 표준 가사 성부의 인쇄 악보 위치·표시용 음가는 위 절의 별도 제작 근거를 따르며, 음원 시험 성공으로 해석하지 않는다.

## 공개 시간 자료 추가 조사

프로젝트 `find-timed-lyrics` 스킬과 sources.md를 적용해 LRC뿐 아니라 실제 자막/카라오케 데이터까지 범위를 넓혔다. 같은 제목의 NCT 앨범·Sana 곡·CHUU 리메이크·드라마 회차 자막·다른 Loveholic 노래는 이 원음원 시각으로 사용하지 않았다. 아래는 2026-10-03의 확인 범위다.

| 경로 | 실제 확인 | 판정·근거 파일 |
|---|---|---|
| LRCLIB | 이전 성공 조회의 해당 곡 id 18812135는 syncedLyrics 없음. artist_name/track_name의 영문·한글·혼합 3추가 질의는 HTTP 503 | 오류를 0건으로 간주하지 않음. timed-lyrics-search.json / lrclib-filtered-search.json |
| 공개 웹 LRC/ASS/SRT/VTT/타임자막 검색 | Loveholic+러브홀릭+형식/언어 변형 질의. 동일 곡의 독립 시간 파일은 검색 결과에서 확인 못 함 | 일반 가사/드라마 자막을 성과로 대신하지 않음. 검색 범위 내 미발견이며 인터넷 전체 부재 아님 |
| TypingTube | 사이트 한정 영문·한글 검색에서 해당 곡 페이지 미발견. 현재 홈페이지 검색 input은 disabled, 준비 중 표시 | 내부 전체 카탈로그를 조회했다고 하지 않음 |
| Karaoke Mugen GitHub 미러 | karaokes 30,858개·lyrics 30,827개 파일 tree, 각각 truncated=false. Loveholic/러브홀릭 파일명 미발견 | 파일명 검사 범위이며 다른 제목/alias·GitLab 정본 전체 부재의 증거가 아님. karaoke-mugen-filename-check.json |
| [원곡 가사 영상 PUnE7fOmlcU](https://www.youtube.com/watch?v=PUnE7fOmlcU) | 실제 player metadata OK, 222초, ko 자동인식(asr) 트랙 1개. 제공 URL·json3 요청 모두 HTTP 200/0byte | 자막 metadata와 실제 시간 데이터 구분. 시각 파일 미확인·사용자 MP3 동일 녹음 미검증. youtube-asr-timestamp-check.json / public-video-followup.json |
| [가사 첨부 영상 meDRgBmiU2w](https://www.youtube.com/watch?v=meDRgBmiU2w) | 실제 player metadata OK, 222초, captionTracks 없음 | 해당 공개 player의 독립 자막 목록에 없음. 화면에 구워진 가사 여부/시각 미검수. public-video-candidate-check.json |
| [TJ 공식 노래방 r25ZL9BYvIg](https://www.youtube.com/watch?v=r25ZL9BYvIg) | TJ 원 게시자 곡번호 11305. 실제 player metadata OK, 227초, captionTracks 없음 | 카라오케 반주 버전. 원음원 221.042375초에 직접 적용 불가. 공개 player에서 독립 시간 파일 미확인. public-video-followup.json |
| [MusicSalad 1시간 반복 vreNb18q9S8](https://www.youtube.com/watch?v=vreNb18q9S8) | 제목/앨범 Florist 검색 후보. 실제 player는 ERROR, 이 동영상은 볼 수 없음 | 접근 불가로 실제 시각 미확인. public-video-candidate-check.json |
| [Bilibili 자막 모음 BV1ap421X7zi](https://www.bilibili.com/video/BV1ap421X7zi/) | 검색 후보에는 해당 곡 일반 곡 영상·2003 라이브가 분리돼 있음. 실제 공개 view API는 HTTP 412 | 실제 subtitle cue·원음원 일치 미확인. 라이브 시각은 이 원음원으로 사용하지 않음. bilibili-candidate-check.json |

외부 가사 본문·서명된 자막 URL·쿠키·인증값을 저장하지 않았다. 별도 가사 시간 파일을 얻었다고 보고하지 않으며, 사용자 원음원을 업로드하거나 접근 통제를 우회하지 않았다. 공개 영상의 길이 유사성만으로 같은 녹음·offset을 확정하지 않았다.
