# Loveholic PDF → MusicXML 작업

## 이 기록의 범위

| 상태 | 내용 |
|---|---|
| 로컬 제작 완료 | 123마디·492박 MusicXML과 PDF·전체 음원을 포함한 패키지. 파일·해시는 아래 “확정 산출물” 절 |
| 반열림 출력 | 초기 결과에서는 원 안 ＋ 20개 미표시. 2026-10-03 공식 타악기 SMuFL 기호 지정·앱 보완으로 새 패키지 20/20 출력 검증. 아래 후속 기록 참조 |
| 인쇄 가사 | 표준 XML은 standard-lyrics-final-package-20261003에 원문353문자·269단위 표준 가사 XML과 시간 비례 SVG 캐시 수록. 265직접대응·4추정 구분. 로컬 ribbon123개·가사269표시 검증 완료. 최신 실제 PDF 수록본은 [PDF 가사 위치 수정](LOVEHOLIC-PDF-LYRIC-PLACEMENT.md)의 pdf-note-lyrics-package-20261003 |
| 판독·연결 근거 | 음원 연결은 신호 분석 추정. 가사4개 위치는 악보 판독 추정. 실제 가창 싱크·길이는 최신 악보 우선 결정에 따라 추가 완료 과제에서 제외 |
| 후속 작업 | 공개 수록은 [배포 기록](LOVEHOLIC-PUBLICATION.md), 이후 재생 화면 개선은 별도 재검토 기록과 history.md |

아래 수치와 제한은 이 패키지 제작·검증 시점의 결과다. 후속 코드 변경이나 새 배포 상태를 이 기록의 테스트 통과로 대신하지 않는다.

## 제작 범위와 완료 조건

- 목표: 사용자 제공 Loveholic 드럼 PDF를 음악적 의미를 보존한 MusicXML로 변환하고 제공 MP3와의 연결 근거를 남긴다.
- 범위: 원본 읽기, 이번 Opus 벡터 양식의 구조 추출, 원본 대조·교정, MusicXML 및 로컬 검증 산출물. 실제 루트는 `/Users/raphael/Playground/drum-practice`.
- 완료 조건: 대표 2~3줄 평가 후 전체 마디·음가·동시음·악기·주법·구간 표시 보존, MusicXML 4.0 규격 및 재렌더링 검사, 음원 정보/연결 근거와 미확정 사항 기록.
- 제외: 원본 및 기존 자료 덮어쓰기, 과거 곡 전용 예외의 무검증 적용, 새 매핑 임의 승인, 공개·배포·push, 재생 HTML 생성.
- 검증: 원본 객체/시각 대조, 마디 길이·글리프 개수·XML 재읽기·오류 주입 검사, OSMD 표시 확인, 입력 해시 재확인. 음원 연결점은 분석 근거와 정확성 한계를 구분한다.

## 입력과 방식

2026-10-02 입력 확인. 원본은 사용자 지정 Documents 파일을 읽기만 한다. 작업 산출물은 Git 제외 `docs/experiments/loveholic-20261002/`에 저장한다.

- PDF SHA256: `003e2b2a6db24c34f5d37847940098a34bcd368956ded94f0dd0f8b9541b8625`.
- MP3 SHA256: `ed2c7052c12e64f0a67cf3927dcd249c50493b27a19b60ab9597d8df1b08309b`.
- PDF 3쪽, Opus 음악 글꼴/오선·줄기 선/빔 사각형을 가진 벡터 악보. 음원 221.042375초, 악보 인쇄 템포 136 BPM.
- `MUSICXML-CONVERSION-POLICY.md`에 따라 Codex 구조 추출을 먼저 평가한다. 첫 3줄의 도입부·기본 패턴·필인을 표본으로 사용한다.
- 악기·주법은 `SCORE-MUSICXML-OSMD-MAPPING.md`, 출력은 `SVG-SCORE-RULES.md`, 음원 연결은 `MUSICXML-CANONICAL.md`를 따른다. 과거 지원 계획과 실험 기록은 최신 정본을 덮어쓰지 않는다.
- STT는 인쇄 음표/빔의 판독 근거가 아니다. 가사 정렬이 필요할 때만 Apple 로컬 워크플로우의 원문 보존·시간 검토 계약을 적용한다.

## 초기 확정 산출물 — 2026-10-03 KST

로컬 변환·검증과 패키지 생성 완료. 공개 수록·배포는 별도 개발 세션이 소유하며 이 기록의 완료 범위에 포함하지 않는다.

| 파일 | 용도 | SHA256 |
|---|---|---|
| `docs/experiments/loveholic-20261002/Loveholic-final.musicxml` | 최종 MusicXML. 실제 드럼 P1 및 앱 음원 연결 메타데이터 | `1dfbd34e7325be0dc61e69b2c4080d71baafc2590bdf2c56056b3fbc7fe29063` |
| `docs/experiments/loveholic-20261002/Loveholic.drumscore` | 9,953,962바이트. MusicXML·SVG 3쪽·원본 PDF와 PNG 3쪽·전체 MP3·마디 연결 | `e94f9e2a54ab584061778a8db3f8418e92247774d15a1d3fc632bf19a8347916` |

`canonical.musicxml`은 최종 XML과 같은 바이트다. `loveholic.musicxml`은 앱 정본 메타데이터를 넣기 전의 전사 결과다. 두 파일의 P1 파트는 XML 정규화 후 바이트까지 일치한다. 정본에는 앱 계약에 따른 별도 `DrumPracticeLyrics` 쉼표 파트가 있으므로 모든 파트의 마디 수를 합산하지 않는다. 실제 드럼은 123마디다.

최종 내보내기 이름은 `Loveholic-final.musicxml`로 고정했다. macOS에서 `Loveholic.musicxml`과 `loveholic.musicxml`은 같은 파일이므로 대소문자만으로 생성용/최종 파일을 구분하지 않는다. 재생성 검사 후 패키지 XML과 내보낸 파일의 원시 바이트 일치를 다시 확인했다.

## 구조 추출과 교정

- 대표 첫 3줄 10마디·129개 음표머리 평가 후 전체 3쪽·32줄·123마디를 추출했다. 마디는 모두 4/4, 총 492개 4분음표 박이다.
- 음표머리는 일반 824개, × 667개, 원 안 × 89개로 총 1,580개다. 14개 쉼표, 9개 악센트, 열기 ○ 36개, 닫기 ＋ 1개, 원 안 ＋ 20개, 크레셴도 5개를 보존했다.
- 글자 bounding box 대신 PDF 문자 행렬의 원점을 오선 좌표에 맞췄다. 공유 줄기는 동시음으로 묶고 실제 빔 사각형·독립 깃발에서 음가를 읽었다. 음표 X간격이나 마디 합을 맞추는 보정으로 음가를 만들지 않았다.
- Opus 머리별 줄기 오프셋과 독립 깃발의 원점 오프셋을 원본에서 교정했다. 깃발 원점은 줄기 끝보다 약 4.9603pt 아래다. 인접 겹세로줄 획은 한 마디 경계로 묶었다.
- 악기 위치·음표머리·열기/닫기는 확정 범례를 그대로 적용했다. F5 ×는 Ride, G5 ×는 Closed Hi-Hat, G5 원 안 ×는 Open Hi-Hat이다. 소리나 다른 출판사의 관례로 Crash라고 바꾸지 않았다.
- 구간 시작은 1/21/37/53/63/80/96/112마디, 크레셴도는 36/62/79/95/119마디다. 반복·붙임줄·연음·장식음은 이 원본에서 관측되지 않았다. 모든 마디를 한 성부로 복원했다.

## 원 안 ＋ 표기의 보존과 표시 한계

원본의 20개 원 안 ＋는 [MusicXML 4.0의 half-muted](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/half-muted/) 요소로 저장하고 원본 글리프·마디·시작 박도 `drum-practice:source-notation` 메타데이터에 남겼다. 표준은 원 안 ＋를 설명하며 기본 SMuFL 글리프는 `brassMuteHalfClosed`다. 이 보존을 OSMD의 하이햇 전용 규칙 확인이나 새 프로젝트 범례 승인으로 보고하지 않는다.

초기 제작 당시 OSMD 2.1.2 번들에는 half-muted 처리 경로가 없어 20개가 SVG에 표시되지 않았다. 파서의 빈 warnings가 주법 전체 출력 성공을 뜻하지 않는다. 초기 결과에 일반 도형·텍스트를 임의로 추가하지 않았으며 원본 PDF 보기에 해당 표기와 인쇄 가사를 보존했다. 2026-10-03에는 공식 타악기용 기호를 확인하고 새 패키지의 앱 보완 출력을 검증했다. 아래 후속 기록과 OSMD 원생 미지원을 구분한다.

## 음원 연결

- ffmpeg로 음원을 11,025Hz mono PCM으로 읽고 세 주파수 대역의 log spectral flux와 전사한 타격 시작 박을 대조했다. 원본 MP3는 재인코딩하지 않았다.
- 첫 박 추정 0.193초, 연주 속도 추정 136.232 BPM. 악보 인쇄값과 Song.bpm은 136을 유지했다. 실제 연결은 각 마디의 추정 start/end와 정본 오디오 앵커로 저장했다. 136과 136.232의 차이는 마지막 타격까지 약 0.36초의 누적 차이를 만든다.
- 80박씩 6개 구간의 최적 국소 위상 이동은 −4/+4/0/0/−8/+8ms였다. 이는 구간별 상관점의 안정성이고 청취로 측정한 동기화 오차가 아니다.
- ±1~4박의 경쟁 시작점을 비교했다. 원래 위상의 전곡 목적함수는 1.1168, ±1박은 0.9034/0.9135, ±4박은 1.0094/1.0131이다. 이 수치는 확률·정확도가 아니다. 1/2/10/36/62/79/119/120마디의 타격 예상점·주변 피크를 별도로 저장했다.
- 첫 필인 2마디 시작은 예상 1.9547초, 주변 피크 1.9621초다. 마지막 120마디 타격 예상 209.8354초의 주변 최대 피크는 209.9084초(+73ms)다. 합주 음원의 주변 피크를 드럼의 실제 시작이라고 단정하거나 이 한 지점으로 전체 정렬을 바꾸지 않았다.
- 121~123마디 온마디쉼표의 시간은 같은 박 흐름으로 외삽했다. 악보 마지막 끝은 약 216.882초이고 원음원 221.042375초를 전부 보존했다.
- 전곡 청취·드럼 분리·실제 악기 음색 확인은 수행하지 않았다. 연결은 신호 분석 추정으로 표시한다.

## 인쇄 가사

초기 패키지는 원본 가사 문자와 PDF 좌표를 `printed-lyric-cues.json`, XML 메타데이터 및 Song.lyricText에 보존했다. 다음 결과는 measureLyrics로77문구를 수록했다. 최신 사용자 요청에 따라269단위를 실제 음표/쉼표 대응과4개의 명시적 추정으로 독립 표준 가사 성부에 저장했다. 단순 X비율로 음가를 생성하지 않으며 표시 성부 음가와 실제 가창 길이를 구분한다. 음원 시각 시험은 인쇄 가사 수록의 선행 조건이 아니다. 현재 제작 결과와 과거 시각 시험은 [가사 제작·검토](LOVEHOLIC-LYRICS-REVIEW.md)에서 구분한다.

## 검증 결과

- W3C MusicXML 4.0 로컬 XSD: 대표·전곡·최종 정본 모두 통과. 전곡 P1의 모든 마디 4박, 시작·길이·동시음·악기 ID·오선 위치·음표머리 XML 재읽기 일치.
- 별도 원본 읽기 fixture 10마디(1/2/3/4/10/20/36/71/120/123), 세 글리프 전체 개수, 구간·크레셴도 대조 통과. 음표 누락·음가·악기·음표머리·동시음 오류 주입 5개를 모두 거부했다. 내부 검수이며 블라인드 외부 이중 전사는 아니다. 표본 검수를 전곡 100% 정확도로 표현하지 않는다.
- 기존 Python 검증 9개 통과. 관련 앱 `musicxml/canonical-xml/score-package` 테스트 3파일·35개 통과. 변환 스크립트 Python 구문 및 패키지 도우미 JS 구문 검사 통과. 기본 Vitest 필터가 별도 guitar-practice의 동명 테스트도 수집해 해당 하위 fixture 경로 오류가 났다. `--exclude 'guitar-practice/**'`로 드럼 범위를 검증했으며 하위 프로젝트는 수정하지 않았다.
- Safari 27.0.1의 실제 앱 `renderMusicXML`/OSMD 2.1.2로 SVG 3쪽·123마디 영역 생성. 페이지 시작 1/37/80은 원본과 일치한다. 세 페이지 시각 대조에서 음표·필인·끝 쉼표·구간 한글 정상 출력 확인. 원본과 조판 차이가 있으며 가사는 SVG 출력 규칙에 따라 숨긴다.
- PDFium의 원본 3쪽 래스터 일부가 잘리는 문제는 Poppler `pdftoppm -r 140 -png`로 대조해 해결했다. 패키지에는 완전한 Poppler PNG를 사용한다. CairoSVG PNG의 한글 □는 해당 래스터 변환기의 폰트 한계다. 실제 Safari SVG의 한글은 정상이다. 과거 PNG를 최종 Safari 증거로 대신하지 않는다.
- 초기 브라우저 도우미 호출의 일시적 Load failed 후 같은 Safari에서 자산 접근을 확인하고 재실행해 성공했다. 다른 브라우저와 중복 비교하지 않았다.
- 실제 `createScorePackage → readScorePackage`로 Song 전체·canonicalXML·원음원·원본 PDF 해시 일치. 저장된 ZIP을 Python으로 다시 읽어 CRC, XML/MP3/PDF 원시 바이트를 독립 확인했다. ZIP 10개 파일 항목, SVG 3쪽·PDF 3쪽이며 입력 원본 해시는 그대로다.

## PDF 마디 영역 보정

초기 고정 `staff−43…staff+29` 영역은 10마디 가사 아래를 자르고 11마디 위로 이전 줄 가사를 포함했다. 연습 화면 검수에서 발견해 최종 패키지에서 수정했다.

Poppler 원본 래스터의 줄 사이 빈 띠에서 이전 줄 가사 뒤의 경계를 골라 32줄에 적용했다. 인접 줄은 동일한 경계를 공유하며 겹치지 않는다. 마지막 줄은 자기 가사까지 포함하고 페이지 하단 안내문을 제외했다. 음가·MusicXML·음원·SVG에는 변화가 없다. 모든 음표머리·빔·자기 줄 가사 포함 및 줄 경계 비중첩 검사 통과. 7/11/25/33/75/120줄의 원본 잘라보기, Safari 10→11마디를 직접 확인했다.

근거는 로컬 폴더의 `pdf-crop-systems.json`, `pdf-crop-system-*.png`, `safari-pdf-crop-fixed.png`다. 패키지 원본 PDF 파일은 잘라 저장하지 않는다. 연습용 영역만 보정했다.

초기 패키지 제작 시에는 가사 유무에 따라 PDF 영역 높이가 달랐고 `preparePlaybackAssets`의 오선 정렬이 MusicXML에만 적용되어 PDF 줄별 오선 배율·높이 차이가 남았다. 제작 측에서 내용을 잘라 같은 높이로 강제하지 않았다. 이후 개발 세션의 공통 PDF 오선 정렬 수정은 [재검토 기록](LOVEHOLIC-REVIEW.md)과 history.md를 따른다.

## 근거·재현 경로

재발 방지용 증상·원인·해결·검증·다음 적용 기준은 [악보 변환 문제 해결 기록](MUSICXML-TROUBLESHOOTING.md)에 모았다. 다음 변환에서 막히면 이 기록과 현재 정본, 과거 제작 세션, 웹 자료 순서로 확인한다.

- 코드: `scripts/musicxml/loveholic.py`, `loveholic_audio.py`, `verify_loveholic.py`, `loveholic_package.mjs`.
- 원본 해시·파일 정보: `provenance.json`. 교정 전 원시 자료: `page-*-objects.json`. 전사·좌표: `extracted.json`, `geometry.json`. 대표 표본: `representatives.musicxml`.
- 검사: `verification.json`, `final-validation.json`, `audio-alignment.json`, `package-audit.json`, `osmd-render/render.json`.
- 최종 시각 증거: `safari-full-score.png`, `safari-page-{1,2,3}.png`, `safari-pdf-crop-fixed.png`. `verovio-render/` 및 CairoSVG PNG는 중간 실험 자료다.

아래 명령은 저장소 루트에서 새 `reproduce-01` 폴더에 실행한다. 같은 이름의 폴더가 이미 있으면 새 번호를 사용한다. 보존된 초기 산출물 폴더를 출력 대상으로 지정하지 않는다. 생성 스크립트는 기존 생성 파일이 있으면 덮어쓰기를 거부한다. 보존된 `source.pdf/source.mp3`, provenance, Poppler 원본 페이지와 로컬 XSD가 전제다. 음악 글꼴 좌표 추출은 pdfplumber/Pillow/lxml이 있는 기존 venv를 사용하고, 신호 분석은 numpy가 있는 번들 Python을 사용한다. 이동된 venv 활성화 스크립트 대신 bin/python을 직접 실행한다.

```sh
mkdir docs/experiments/loveholic-20261002/reproduce-01
cp docs/experiments/loveholic-20261002/provenance.json docs/experiments/loveholic-20261002/source-poppler-*.png docs/experiments/loveholic-20261002/reproduce-01/
docs/experiments/musicxml/venv/bin/python scripts/musicxml/loveholic.py --pdf docs/experiments/loveholic-20261002/source.pdf --out docs/experiments/loveholic-20261002/reproduce-01
/Users/raphael/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/musicxml/loveholic_audio.py --audio docs/experiments/loveholic-20261002/source.mp3 --bars docs/experiments/loveholic-20261002/reproduce-01/extracted.json --out docs/experiments/loveholic-20261002/reproduce-01/audio-alignment.json
docs/experiments/musicxml/venv/bin/python scripts/musicxml/verify_loveholic.py --dir docs/experiments/loveholic-20261002/reproduce-01
npx vitest run --exclude 'guitar-practice/**' tests/musicxml.test.ts tests/canonical-xml.test.ts tests/score-package.test.ts
```

패키지 도우미는 기존 로컬 Vite editor에서 실행하며 IndexedDB를 쓰지 않는다. 로컬 근거 수신기 `docs/experiments/loveholic-20261002/qa_server.py`의 127.0.0.1:5186으로 결과를 저장한다. Safari에서 `await (await import('/scripts/musicxml/loveholic_package.mjs')).build()`로 생성·재읽기한다. 전곡 원본/PDF·음원·실험 출력은 Git 제외 대상이고 자동 stage하지 않는다. 앱 소스 변경·앱 버전 상승·commit/push/PR/merge/deploy는 이 제작 작업에서 수행하지 않았다. 공유 checkout의 다른 세션 변경은 보존했다.


## 2026-10-03 반열림 표기 해결 및 새 패키지

- 목표: 원본 반열림 표기 20개의 공식 타악기 전용 경로를 확인하고, 음악 정보·원본·기존 결과를 보존한 새 패키지를 검증한다.
- 범위: 제작 스크립트·곡별 근거·새 XML/패키지. 공통 src 렌더러는 드럼 연습실 개발 세션이 담당했다.
- 완료 조건: 공식 기호와 라이선스 확인, 전곡 XSD/재읽기, SVG 20/20 출력 및 시각 대조, 패키지 재읽기·원본 바이트 보존.
- 제외: 일반 도형·일반 텍스트 대체, 기존 산출물 덮어쓰기, 근거 없는 보컬 박 생성. 제작 측의 공개 수록·배포는 수행하지 않는다.
- 검증: 아래 파일·해시·규격/구조 검사와 Chromium 실제 출력. 개발 세션의 Safari/iPad/전체 앱 테스트는 별도 책임·증거다.

기존 half-muted는 원 안 ＋를 보존했지만 기본 SMuFL 기호는 금관악기용 brassMuteHalfClosed였다. 공식 SMuFL 1.4의 타악기 주법 기호 pictHalfOpen1(U+E7F6)을 확인했다. MusicXML half-muted의 smufl 속성으로 이를 명시한 후보는20개 속성 이외의 XML 트리 차이가 없고 XSD·음악 정보 재읽기를 통과했다. OSMD 2.1.2와2.2.0의 공식 ArticulationReader에 half-muted 분기가 없으므로 버전 상승만으로 해결되지 않는다. 개발 세션이 정확한 공식 Bravura 글리프 경로를 앱에서 보완했다.

공식 URL은 [SMuFL 타악기 주법 표](https://www.w3.org/2021/03/smufl14/tables/percussion-playing-technique-pictograms.html), [MusicXML half-muted](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/half-muted/), [OSMD 2.1.2 ArticulationReader](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/blob/2.1.2/src/MusicalScore/ScoreIO/MusicSymbolModules/ArticulationReader.ts)다. Bravura OTF revision37b194378b710cc40e406ab6c4b07608bb9548ae, SHA256cdf0f893ee1fdb64b7f6713d71ee0dcfc349c0ac01429a8e451b01a9e79f5f3b, SIL OFL1.1. fontTools4.66.1로 cmap U+E7F6→uniE7F6의 실제 path를 추출했다. 재사용시 bbox0,0,286,286 및 Y축 방향을 확인한다.

새 산출물 폴더는 `docs/experiments/loveholic-20261002/half-open-package-20261003/`다.

| 산출물 | SHA256 |
|---|---|
| Loveholic.drumscore | ab36ce61084b9d619520b1ded8cd6a26aa7745a9bcc92b1698fc8078b8e71a1f |
| Loveholic-final.musicxml | 2f5e346d571a1fc8eca404d40e117b94526b349030d0a1520a055d9fa7923802 |

현재 앱 renderMusicXML→createScorePackage→readScorePackage로 새 폴더에 생성했다. SVG3쪽·PDF3쪽·123마디492박1580머리, half-muted20개 전곡 재읽기와 XSD 통과.20개 data-smufl=pictHalfOpen1 출력 및 페이지 바깥 기호0개를 확인했다. 실제 브라우저에서20개를 확대해 잘림·충돌이 보이지 않음을 확인했다. 원본PDF/MP3바이트, PDF variant manifest, 마디 재생 시각, 인쇄 가사는 기존 패키지와 같으며 가사 타이밍은 새로 만들지 않았다. 기존 최종XML/패키지는 보존했다.

검증 파일은 `final-validation.json`, `package-audit.json`, `half-open-20-browser.png`, `osmd-render/`다. 공식 글리프/후보 근거는 형제 폴더 `notation-review-20261003/`의 `official-glyph-provenance.json`, `pictHalfOpen1-path.json`, `Bravura-LICENSE.txt`, `half-open-candidate-validation.json`이다. Safari MCP create_tab은 Transport closed로 실패했고 허용된 ego-browser로 전환했다. 검수용 DOM의 HMR 초기화와 이동된 SVG 문서의 clone 대상 오류를 수정해 실제 검수 화면을 만들었다. 기존 브라우저 저장 자료는 변경하지 않았다.

후속 최종 재현은 `source-regeneration-review-20261003/`에서 수행했다. 원본 PDF를 다시 추출한 123마디 데이터는 초기 extracted.json과 같았다. 최신 generator의 MusicXML 전곡 XSD·재읽기·10개 원본 fixture 및 5개 오류 주입 거부를 통과했다. 20개 half-muted 모두 pictHalfOpen1을 명시했다. 같은 출력에 재실행하면 기존 파일을 바꾸기 전에 종료 코드 2로 거부하며 전 파일 해시가 유지됐다. `verification.json`, `preservation-check.json`, `final-preservation-check.json`이 근거다. 원본/초기/새 패키지 해시, ZIP CRC 및 manifest 경로로 읽은 PDF/MP3·canonicalXML 바이트를 최종 확인했다. 새 generator의 설명 메타데이터는 후속 실행용이며 이미 검증·수록된 ab36ce61… 패키지를 덮어쓰지 않았다.

### PDF 줄 앞 자르기 근거

새 `scripts/musicxml/loveholic_pdf_crop.py`가 원본 구조를 다시 읽어32개 줄의 안전한 경계를 계산했다. 첫 줄은65.18531113141441pt, 나머지는68.3631315438144pt. 각각 타악기 글리프 오른쪽과 가장 가까운 보호 음악 기호 사이를 선택했다. 첫 줄4/4박자표·첫 음표·실제 마디선 보존, 오선 외 잉크를 가르지 않는 래스터 경계 검사와 변환 beatXs의 원본 페이지 좌표 보존 검사 통과.32줄 contact sheet를 직접 대조했다.

근거는 `display-crop-review-20261003/loveholic-pdf-display-crops.json`이다. 원본 패키지 PDF variant123개 region과 줄 시작32개의 sourceRegion(id/page/x/y/w/h) 및 normalized left를 개발 세션에 전달했다. 정확한 원본 fingerprint 일치 시 PDF 표시용으로만 적용한다. 다른 곡·사용자가 편집한 영역·SVG로 추정 확대하지 않는다. 제작 측은 PDF·패키지 영역을 변경하지 않았다. 후속 공통 표시 구현·검증은 개발 세션의 [PDF 표시 자르기 기록](PDF-DISPLAY-TRIM.md)과 [Loveholic 재검토](LOVEHOLIC-REVIEW.md)를 따른다.


## 2026-10-03 최신 표준 가사 재생 패키지

시간 비례 공통 렌더러 검증 후 새 `docs/experiments/loveholic-20261002/standard-lyrics-final-package-20261003/`에 재패키징. 패키지 SHA256 `3bbb8ba0013e38e8f652c432b3f8f76591df453f8a796c0698a193c4bcaf409a`, XML `e84578fe97421141fe6944f6a18aa72fdce746fb788ee2bc1ffcd082110f6df8`(아래 최초 표준 가사 검증본과 원시 바이트 동일). 공통 preparePlaybackAssets ribbon123개 및123staff좌표, 한 줄/두 줄 각각269표시·겹침0, 박당 너비·오선 간격 일정. XSD/CRC/원본 미디어·PDF variant·음표·가사·마디 시각 보존. 변경 ZIP항목은 score/pages/0와manifest뿐. 상세 [가사 기록의 최신 캐시 절](LOVEHOLIC-LYRICS-REVIEW.md#최신-재생-캐시-패키지-2026-10-03)과 해당 폴더 final-validation/browser-validation/capture 참조. 개발 세션에 경로·해시 전달. public/배포/HTML은 제작 측에서 수행하지 않았다.

## 2026-10-03 최초 표준 가사 MusicXML

사용자 요청에 따라 Real Paradis처럼 독립 `DrumPracticeLyrics` 성부의 `note/lyric/text`에 원문353문자·269단위를 저장했다. 원본 음표/쉼표와265단위 직접 대응,48/99/107/109마디의4단위는 평행 구절에 따른3.5박 추정으로 명시한다. 표시 성부 길이는 기준 음가이며 실제 보컬 길이를 검증한 값이 아니다. 모든 confirmed=false. 원문, 초기/반열림/중앙 가사 결과와 원본 PDF/MP3를 보존했다.

XML: `docs/experiments/loveholic-20261002/standard-lyrics-package-20261003/Loveholic-final.musicxml`, SHA256 `e84578fe97421141fe6944f6a18aa72fdce746fb788ee2bc1ffcd082110f6df8`. 원본 재추출 P1과 동일, XSD4.0 통과. 독립 XML타임라인 읽기269개 일치 및 누락/텍스트/음가/시작4가지 오류 주입 모두 거부. 공통 저장 계약의269개 복원·음원 연결+5초 후 악보 위치 유지·재저장 동일, SVG/PDF 각각269표시/겹침0, 집중3파일35테스트·Python/JS구문·diff검사 통과.

근거: `standard-lyrics-review-20261003/printed-note-lyrics.json`과3쪽 원본 contact sheet, 새 패키지 폴더의 `final-validation.json`, `lyric-position-validation.json`, `preservation-validation.json`, SVG/PDF browser검사·캡처. [상세 가사 기록](LOVEHOLIC-LYRICS-REVIEW.md) 참조. 같은 폴더 `.drumscore`는 공통 박 간격 렌더러가 병행 변경 중인 잠정 캐시이며 최종 공개 수록본이 아니다. 검증된 XML/근거를 개발 세션에 전달했다. 공통 렌더 캐시 갱신·저장 곡 import·실제 재생·공개 수록은 그 세션에서 별도로 검증한다.

## 2026-10-03 이전 마디 중앙 인쇄 가사 패키지

원본 PDF의25개 인쇄줄을 실제 마디에 대조해77마디·353문자를 저장했다. 줄 시작과 가사 시작이 다른37→39,80→82 사례를 교정했다. 원본 문자 bbox·공백·음표 근접 후보를 근거로 남기되 가창 시각/음가를 생성하지 않는다. 코드 `scripts/musicxml/loveholic_printed_lyrics.py`; 저장 계약 `docs/MEASURE-LYRICS.md`.

새 폴더 `docs/experiments/loveholic-20261002/printed-lyrics-package-20261003/`:

| 파일 | SHA256 |
|---|---|
| Loveholic.drumscore | 26b97bd8b5a1611c4667d42a3fa9205cc6190a8c469000aec9944f45d689fcc1 |
| Loveholic-final.musicxml | c2dcf86e50805d0dfa1f01ca5cfda398cd045c5df3475266f64c4d5a8cba503a |

최신 generator의 원본 재추출 MusicXML을 사용했다. P1드럼 성부 동일,123마디492박1580머리·20half-muted XSD/재읽기 통과. package read/write 전체 동일,77문구 canonical manifest 복원 동일,원본PDF/MP3·PDF variant/pages·마디시각/영역·설정 보존. 실제 공통 renderMeasure SVG77중앙 표시, 원문 대조와 집중3파일31테스트 통과. IndexedDB 저장 곡은 수정하지 않았다. 앱 전체 import/iPad/배포는 개발 세션의 별도 검증이다.

원본 귀속/문자 증거는 `printed-lyrics-review-20261003/`, 패키지 검사와 실제 브라우저 캡처는 새 패키지 폴더에 보존했다. 자세한 현재 상태·과거 음원 정렬 실패의 구분은 [가사 제작 기록](LOVEHOLIC-LYRICS-REVIEW.md)을 따른다. 기존 초기/반열림 패키지와 원음원은 덮어쓰지 않았다.
