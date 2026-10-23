# Loveholic 제작·가사·검수 기록

문서 역할: **사실·연구 기록**. 원문 날짜·입력·환경·결과·실패·미확인은 각 절의 당시 상태다. 이번 통합에서 과거 검증을 재실행하지 않았으며, 기록의 “현재”는 원래 작성 시점이다. [기록 안내](../README.md)와 [현행 정본](../../RULES-INDEX.md)을 구분한다.

<a id="loveholic-conversion--loveholic-pdf--musicxml-작업"></a>

## Loveholic PDF → MusicXML 작업

> 2026-10-13 정리: 최신 제작 파일은 `data/production/loveholic/final/`에 보존했다. 아래 과거 실험 경로·보고서·초판 보존 기록은 당시 이력이다. 별도로 보존한 원본 외 실험 자료는 삭제했으며, 과거 검사 통과는 이번 정리 후 재검사를 뜻하지 않는다.

현재 제작 폴더는 `source/`(PDF·변환 XML·추출 자료), `audio/`(MP3·박자 분석), `final/`(최종 MusicXML·drumscore)로 나뉜다. 가사 매핑 입력 세 파일은 `source/lyrics/`에 모았다. `source/canonical.musicxml`과 `source/loveholic.musicxml`은 최종본과 내용이 다른 제작 입력으로 보존한다.

제작 helper의 경로 기준은 `data/production/loveholic/`이다. `build`의 기본 XML은 `source/loveholic.musicxml`이며 가사 인자는 `source/lyrics/printed-measure-lyrics.json` 또는 `source/lyrics/printed-note-lyrics.json`, PDF 앵커 인자는 `source/lyrics/pdf-lyric-note-anchors.json`이다. Python 가사 제작 도구의 `--folder`에는 `source/`를 준다. 과거 실험에서 삭제된 `pdf-crop-systems.json` 등 추가 산출물은 패키지 재제작 전 별도 재생성이 필요하다. 이번 정리에서 재생성·패키징 시험은 실행하지 않았다.

새 곡의 전체 순서는 [악보 제작 프로세스](../../how-to/produce-score.md#score-production-process--악보-제작-프로세스)를 따른다. 아래는 단계별 제작 이력이며 초기 산출물과 후속 수정본을 구별한다. 초기 ‘G5 원 안 ×=Open Hi-Hat’ 분류는 후속 사용자 확인에서 해당 Y89개를 Crash로 교정했다. 현재 실행에는 [매핑 정본의 최종 재확인](../../reference/score/notation.md#score-musicxml-osmd-mapping--2026-10-03-최종-재확인-모든-곡에-확정-범례-적용)을 적용한다. 성부·화음·기둥의 원본 구성은 유지한다.


원문 출처: `docs/score-production/LOVEHOLIC-CONVERSION.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="loveholic-conversion--현재-원곡-속도-정보--사용자-결정-2026-10-13"></a>

### 현재 원곡 속도 정보 — 사용자 결정 2026-10-13

- 목표: 악보에 인쇄된136 BPM을 유지하고 원곡 음원 측정값을 별도로 저장·표시한다. ‘원곡’ 선택은 음원의 배속1.0이다.
- 범위: 새 MusicXML·drumscore의 별도 측정 메타정보와 재제작 helper, 앱 개발자 인계.
- 완료 조건: 악보/Song.bpm=136, 원곡 추정값136.232·첫 박0.193을 재읽기로 확인하고 기존 음원·악보 의미·마디/가사 시각을 보존.
- 제외: 앱 코드/DB·public/dist 변경, 재분석·재인코딩·PDF/HTML 생성·커밋/배포. 기존 파일과 중간 시도 보존.
- 검증: XSD·ZIP CRC·전후 데이터 대조·실제 공통 canonical/package API 저장/재읽기. 화면 표시와 원곡 버튼의 실제 동작은 개발 담당자 검증 범위.

최신 제작 파일: `/Users/raphael/Playground/drum-practice/data/production/loveholic/final/`.

- `Loveholic-final.musicxml`: SHA256 `af81c955e5056a9c0445ceec7733da067bb238695a0b24f86c1a0850c04fb481`.
- `Loveholic.drumscore`: SHA256 `26c73ab7a3e772422251e632f6e58af2284bfb739ca60c09921c1296ee947d93`.
- MusicXML `sound@tempo`/`metronome/per-minute`와 Song.bpm은136을 유지한다.
- 별도 `identification/miscellaneous/miscellaneous-field name="drum-practice:recording-tempo:v1"`에 `scoreBpm=136`, `bpmEstimate=136.232`, `firstBeatEstimateSeconds=0.193`, 음원SHA256·분석 방법·추정 상태를 JSON으로 저장한다.
- 근거는 기존 `audio-alignment.json`과 음원SHA256 `ed2c7052c12e64f0a67cf3927dcd249c50493b27a19b60ab9597d8df1b08309b`다. 새 분석이나 정확도 보증이 아니다.

검증 결과와 자료 보존은 아래 제작 기록을 따른다. 앱 반영 완료는 별도 확인한다.

<a id="loveholic-conversion--이-기록의-범위"></a>

### 이 기록의 범위

| 상태 | 내용 |
|---|---|
| 로컬 제작 완료 | 123마디·492박 MusicXML과 PDF·전체 음원을 포함한 패키지. 파일·해시는 아래 “확정 산출물” 절 |
| 반열림 출력 | 초기 결과에서는 원 안 ＋ 20개 미표시. 2026-10-03 공식 타악기 SMuFL 기호 지정·앱 보완으로 새 패키지 20/20 출력 검증. 아래 후속 기록 참조 |
| 인쇄 가사 | 표준 XML은 standard-lyrics-final-package-20261003에 원문353문자·269단위 표준 가사 XML과 시간 비례 SVG 캐시 수록. 265직접대응·4추정 구분. 로컬 ribbon123개·가사269표시 검증 완료. 최신 실제 PDF 수록본은 [PDF 가사 위치 수정](loveholic.md#loveholic-pdf-lyric-placement--loveholic-pdf-가사-위치-수정--2026-10-03)의 pdf-note-lyrics-package-20261003 |
| 판독·연결 근거 | 음원 연결은 신호 분석 추정. 가사4개 위치는 악보 판독 추정. 실제 가창 싱크·길이는 최신 악보 우선 결정에 따라 추가 완료 과제에서 제외 |
| 후속 작업 | 공개 수록은 [배포 기록](loveholic.md#loveholic-publication--loveholic-제작-감독-및-드럼연습실-수록), 이후 재생 화면 개선은 별도 재검토 기록과 history.md |

아래 수치와 제한은 이 패키지 제작·검증 시점의 결과다. 후속 코드 변경이나 새 배포 상태를 이 기록의 테스트 통과로 대신하지 않는다.

<a id="loveholic-conversion--제작-범위와-완료-조건"></a>

### 제작 범위와 완료 조건

- 목표: 사용자 제공 Loveholic 드럼 PDF를 음악적 의미를 보존한 MusicXML로 변환하고 제공 MP3와의 연결 근거를 남긴다.
- 범위: 원본 읽기, 이번 Opus 벡터 양식의 구조 추출, 원본 대조·교정, MusicXML 및 로컬 검증 산출물. 실제 루트는 `/Users/raphael/Playground/drum-practice`.
- 완료 조건: 대표 2~3줄 평가 후 전체 마디·음가·동시음·악기·주법·구간 표시 보존, MusicXML 4.0 규격 및 재렌더링 검사, 음원 정보/연결 근거와 미확정 사항 기록.
- 제외: 원본 및 기존 자료 덮어쓰기, 과거 곡 전용 예외의 무검증 적용, 새 매핑 임의 승인, 공개·배포·push, 재생 HTML 생성.
- 검증: 원본 객체/시각 대조, 마디 길이·글리프 개수·XML 재읽기·오류 주입 검사, OSMD 표시 확인, 입력 해시 재확인. 음원 연결점은 분석 근거와 정확성 한계를 구분한다.

<a id="loveholic-conversion--입력과-방식"></a>

### 입력과 방식

2026-10-02 입력 확인. 원본은 사용자 지정 Documents 파일을 읽기만 한다. 작업 산출물은 Git 제외 `docs/experiments/loveholic-20261002/`에 저장한다.

- PDF SHA256: `003e2b2a6db24c34f5d37847940098a34bcd368956ded94f0dd0f8b9541b8625`.
- MP3 SHA256: `ed2c7052c12e64f0a67cf3927dcd249c50493b27a19b60ab9597d8df1b08309b`.
- PDF 3쪽, Opus 음악 글꼴/오선·줄기 선/빔 사각형을 가진 벡터 악보. 음원 221.042375초, 악보 인쇄 템포 136 BPM.
- `MUSICXML-CONVERSION-POLICY.md`에 따라 Codex 구조 추출을 먼저 평가한다. 첫 3줄의 도입부·기본 패턴·필인을 표본으로 사용한다.
- 악기·주법은 `SCORE-MUSICXML-OSMD-MAPPING.md`, 출력은 `SVG-SCORE-RULES.md`, 음원 연결은 `MUSICXML-CANONICAL.md`를 따른다. 과거 지원 계획과 실험 기록은 최신 정본을 덮어쓰지 않는다.
- STT는 인쇄 음표/빔의 판독 근거가 아니다. 초기 가사 시각 시험에서는 Apple 로컬 워크플로우도 검토했지만, 최신 악보 우선 결정에서 실제 가창 시각·STT·강제 정렬은 제작 완료 조건에서 제외했다. [현재 가사 기준](../../reference/score/production.md#musicxml-conversion-policy--가사-기준--악보-우선)을 따른다.

<a id="loveholic-conversion--초기-확정-산출물--2026-10-03-kst"></a>

### 초기 확정 산출물 — 2026-10-03 KST

로컬 변환·검증과 패키지 생성 완료. 공개 수록·배포는 별도 개발 세션이 소유하며 이 기록의 완료 범위에 포함하지 않는다.

| 파일 | 용도 | SHA256 |
|---|---|---|
| `docs/experiments/loveholic-20261002/Loveholic-final.musicxml` | 최종 MusicXML. 실제 드럼 P1 및 앱 음원 연결 메타데이터 | `1dfbd34e7325be0dc61e69b2c4080d71baafc2590bdf2c56056b3fbc7fe29063` |
| `docs/experiments/loveholic-20261002/Loveholic.drumscore` | 9,953,962바이트. MusicXML·SVG 3쪽·원본 PDF와 PNG 3쪽·전체 MP3·마디 연결 | `e94f9e2a54ab584061778a8db3f8418e92247774d15a1d3fc632bf19a8347916` |

`canonical.musicxml`은 최종 XML과 같은 바이트다. `loveholic.musicxml`은 앱 정본 메타데이터를 넣기 전의 전사 결과다. 두 파일의 P1 파트는 XML 정규화 후 바이트까지 일치한다. 정본에는 앱 계약에 따른 별도 `DrumPracticeLyrics` 쉼표 파트가 있으므로 모든 파트의 마디 수를 합산하지 않는다. 실제 드럼은 123마디다.

최종 내보내기 이름은 `Loveholic-final.musicxml`로 고정했다. macOS에서 `Loveholic.musicxml`과 `loveholic.musicxml`은 같은 파일이므로 대소문자만으로 생성용/최종 파일을 구분하지 않는다. 재생성 검사 후 패키지 XML과 내보낸 파일의 원시 바이트 일치를 다시 확인했다.

<a id="loveholic-conversion--구조-추출과-교정"></a>

### 구조 추출과 교정

- 대표 첫 3줄 10마디·129개 음표머리 평가 후 전체 3쪽·32줄·123마디를 추출했다. 마디는 모두 4/4, 총 492개 4분음표 박이다.
- 음표머리는 일반 824개, × 667개, 원 안 × 89개로 총 1,580개다. 14개 쉼표, 9개 악센트, 열기 ○ 36개, 닫기 ＋ 1개, 원 안 ＋ 20개, 크레셴도 5개를 보존했다.
- 글자 bounding box 대신 PDF 문자 행렬의 원점을 오선 좌표에 맞췄다. 공유 줄기는 동시음으로 묶고 실제 빔 사각형·독립 깃발에서 음가를 읽었다. 음표 X간격이나 마디 합을 맞추는 보정으로 음가를 만들지 않았다.
- Opus 머리별 줄기 오프셋과 독립 깃발의 원점 오프셋을 원본에서 교정했다. 깃발 원점은 줄기 끝보다 약 4.9603pt 아래다. 인접 겹세로줄 획은 한 마디 경계로 묶었다.
- 악기 위치·음표머리·열기/닫기는 확정 범례를 그대로 적용했다. F5 ×는 Ride, G5 ×는 Closed Hi-Hat, G5 원 안 ×는 Open Hi-Hat이다. 소리나 다른 출판사의 관례로 Crash라고 바꾸지 않았다.
- 구간 시작은 1/21/37/53/63/80/96/112마디, 크레셴도는 36/62/79/95/119마디다. 반복·붙임줄·연음·장식음은 이 원본에서 관측되지 않았다. 모든 마디를 한 성부로 복원했다.

<a id="loveholic-conversion--원-안--표기의-보존과-표시-한계"></a>

### 원 안 ＋ 표기의 보존과 표시 한계

원본의 20개 원 안 ＋는 [MusicXML 4.0의 half-muted](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/half-muted/) 요소로 저장하고 원본 글리프·마디·시작 박도 `drum-practice:source-notation` 메타데이터에 남겼다. 표준은 원 안 ＋를 설명하며 기본 SMuFL 글리프는 `brassMuteHalfClosed`다. 이 보존을 OSMD의 하이햇 전용 규칙 확인이나 새 프로젝트 범례 승인으로 보고하지 않는다.

초기 제작 당시 OSMD 2.1.2 번들에는 half-muted 처리 경로가 없어 20개가 SVG에 표시되지 않았다. 파서의 빈 warnings가 주법 전체 출력 성공을 뜻하지 않는다. 초기 결과에 일반 도형·텍스트를 임의로 추가하지 않았으며 원본 PDF 보기에 해당 표기와 인쇄 가사를 보존했다. 2026-10-03에는 공식 타악기용 기호를 확인하고 새 패키지의 앱 보완 출력을 검증했다. 아래 후속 기록과 OSMD 원생 미지원을 구분한다.

<a id="loveholic-conversion--음원-연결"></a>

### 음원 연결

- ffmpeg로 음원을 11,025Hz mono PCM으로 읽고 세 주파수 대역의 log spectral flux와 전사한 타격 시작 박을 대조했다. 원본 MP3는 재인코딩하지 않았다.
- 첫 박 추정 0.193초, 연주 속도 추정 136.232 BPM. 악보 인쇄값과 Song.bpm은 136을 유지했다. 2026-10-13에는 추정 BPM과 첫 박을 별도 메타정보로 명시했다(위 최신 기록). 실제 연결은 각 마디의 추정 start/end와 정본 오디오 앵커로 저장했다. 136과 136.232의 차이는 마지막 타격까지 약 0.36초의 누적 차이를 만든다.
- 80박씩 6개 구간의 최적 국소 위상 이동은 −4/+4/0/0/−8/+8ms였다. 이는 구간별 상관점의 안정성이고 청취로 측정한 동기화 오차가 아니다.
- ±1~4박의 경쟁 시작점을 비교했다. 원래 위상의 전곡 목적함수는 1.1168, ±1박은 0.9034/0.9135, ±4박은 1.0094/1.0131이다. 이 수치는 확률·정확도가 아니다. 1/2/10/36/62/79/119/120마디의 타격 예상점·주변 피크를 별도로 저장했다.
- 첫 필인 2마디 시작은 예상 1.9547초, 주변 피크 1.9621초다. 마지막 120마디 타격 예상 209.8354초의 주변 최대 피크는 209.9084초(+73ms)다. 합주 음원의 주변 피크를 드럼의 실제 시작이라고 단정하거나 이 한 지점으로 전체 정렬을 바꾸지 않았다.
- 121~123마디 온마디쉼표의 시간은 같은 박 흐름으로 외삽했다. 악보 마지막 끝은 약 216.882초이고 원음원 221.042375초를 전부 보존했다.
- 전곡 청취·드럼 분리·실제 악기 음색 확인은 수행하지 않았다. 연결은 신호 분석 추정으로 표시한다.

<a id="loveholic-conversion--인쇄-가사"></a>

### 인쇄 가사

초기 패키지는 원본 가사 문자와 PDF 좌표를 `printed-lyric-cues.json`, XML 메타데이터 및 Song.lyricText에 보존했다. 다음 결과는 measureLyrics로77문구를 수록했다. 최신 사용자 요청에 따라269단위를 실제 음표/쉼표 대응과4개의 명시적 추정으로 독립 표준 가사 성부에 저장했다. 단순 X비율로 음가를 생성하지 않으며 표시 성부 음가와 실제 가창 길이를 구분한다. 음원 시각 시험은 인쇄 가사 수록의 선행 조건이 아니다. 현재 제작 결과와 과거 시각 시험은 [가사 제작·검토](loveholic.md#loveholic-lyrics-review--loveholic-인쇄-가사-제작과-과거-시각-시험--2026-10-03)에서 구분한다.

<a id="loveholic-conversion--검증-결과"></a>

### 검증 결과

- W3C MusicXML 4.0 로컬 XSD: 대표·전곡·최종 정본 모두 통과. 전곡 P1의 모든 마디 4박, 시작·길이·동시음·악기 ID·오선 위치·음표머리 XML 재읽기 일치.
- 별도 원본 읽기 fixture 10마디(1/2/3/4/10/20/36/71/120/123), 세 글리프 전체 개수, 구간·크레셴도 대조 통과. 음표 누락·음가·악기·음표머리·동시음 오류 주입 5개를 모두 거부했다. 내부 검수이며 블라인드 외부 이중 전사는 아니다. 표본 검수를 전곡 100% 정확도로 표현하지 않는다.
- 기존 Python 검증 9개 통과. 관련 앱 `musicxml/canonical-xml/score-package` 테스트 3파일·35개 통과. 변환 스크립트 Python 구문 및 패키지 도우미 JS 구문 검사 통과. 기본 Vitest 필터가 별도 guitar-practice의 동명 테스트도 수집해 해당 하위 fixture 경로 오류가 났다. `--exclude 'guitar-practice/**'`로 드럼 범위를 검증했으며 하위 프로젝트는 수정하지 않았다.
- Safari 27.0.1의 실제 앱 `renderMusicXML`/OSMD 2.1.2로 SVG 3쪽·123마디 영역 생성. 페이지 시작 1/37/80은 원본과 일치한다. 세 페이지 시각 대조에서 음표·필인·끝 쉼표·구간 한글 정상 출력 확인. 원본과 조판 차이가 있으며 가사는 SVG 출력 규칙에 따라 숨긴다.
- PDFium의 원본 3쪽 래스터 일부가 잘리는 문제는 Poppler `pdftoppm -r 140 -png`로 대조해 해결했다. 패키지에는 완전한 Poppler PNG를 사용한다. CairoSVG PNG의 한글 □는 해당 래스터 변환기의 폰트 한계다. 실제 Safari SVG의 한글은 정상이다. 과거 PNG를 최종 Safari 증거로 대신하지 않는다.
- 초기 브라우저 도우미 호출의 일시적 Load failed 후 같은 Safari에서 자산 접근을 확인하고 재실행해 성공했다. 다른 브라우저와 중복 비교하지 않았다.
- 실제 `createScorePackage → readScorePackage`로 Song 전체·canonicalXML·원음원·원본 PDF 해시 일치. 저장된 ZIP을 Python으로 다시 읽어 CRC, XML/MP3/PDF 원시 바이트를 독립 확인했다. ZIP 10개 파일 항목, SVG 3쪽·PDF 3쪽이며 입력 원본 해시는 그대로다.

<a id="loveholic-conversion--pdf-마디-영역-보정"></a>

### PDF 마디 영역 보정

초기 고정 `staff−43…staff+29` 영역은 10마디 가사 아래를 자르고 11마디 위로 이전 줄 가사를 포함했다. 연습 화면 검수에서 발견해 최종 패키지에서 수정했다.

Poppler 원본 래스터의 줄 사이 빈 띠에서 이전 줄 가사 뒤의 경계를 골라 32줄에 적용했다. 인접 줄은 동일한 경계를 공유하며 겹치지 않는다. 마지막 줄은 자기 가사까지 포함하고 페이지 하단 안내문을 제외했다. 음가·MusicXML·음원·SVG에는 변화가 없다. 모든 음표머리·빔·자기 줄 가사 포함 및 줄 경계 비중첩 검사 통과. 7/11/25/33/75/120줄의 원본 잘라보기, Safari 10→11마디를 직접 확인했다.

근거는 로컬 폴더의 `pdf-crop-systems.json`, `pdf-crop-system-*.png`, `safari-pdf-crop-fixed.png`다. 패키지 원본 PDF 파일은 잘라 저장하지 않는다. 연습용 영역만 보정했다.

초기 패키지 제작 시에는 가사 유무에 따라 PDF 영역 높이가 달랐고 `preparePlaybackAssets`의 오선 정렬이 MusicXML에만 적용되어 PDF 줄별 오선 배율·높이 차이가 남았다. 제작 측에서 내용을 잘라 같은 높이로 강제하지 않았다. 이후 개발 세션의 공통 PDF 오선 정렬 수정은 [재검토 기록](loveholic.md#loveholic-review--loveholic-재검토)과 history.md를 따른다.

<a id="loveholic-conversion--근거재현-경로"></a>

### 근거·재현 경로

재발 방지용 증상·원인·해결·검증·다음 적용 기준은 [악보 변환 문제 해결 기록](../archive/musicxml-evaluation.md#musicxml-troubleshooting--악보-변환-문제-해결-기록)에 모았다. 다음 변환에서 막히면 이 기록과 현재 정본, 과거 제작 세션, 웹 자료 순서로 확인한다.

- 코드: `tools/score-production/musicxml/loveholic.py`, `loveholic_audio.py`, `verify_loveholic.py`, `loveholic_package.mjs`.
- 원본 해시·파일 정보: `provenance.json`. 교정 전 원시 자료: `page-*-objects.json`. 전사·좌표: `extracted.json`, `geometry.json`. 대표 표본: `representatives.musicxml`.
- 검사: `verification.json`, `final-validation.json`, `audio-alignment.json`, `package-audit.json`, `osmd-render/render.json`.
- 최종 시각 증거: `safari-full-score.png`, `safari-page-{1,2,3}.png`, `safari-pdf-crop-fixed.png`. `verovio-render/` 및 CairoSVG PNG는 중간 실험 자료다.

아래 명령은 저장소 루트에서 새 `reproduce-01` 폴더에 실행한다. 같은 이름의 폴더가 이미 있으면 새 번호를 사용한다. 보존된 초기 산출물 폴더를 출력 대상으로 지정하지 않는다. 생성 스크립트는 기존 생성 파일이 있으면 덮어쓰기를 거부한다. 보존된 `source.pdf/source.mp3`, provenance, Poppler 원본 페이지와 로컬 XSD가 전제다. 음악 글꼴 좌표 추출은 pdfplumber/Pillow/lxml이 있는 기존 venv를 사용하고, 신호 분석은 numpy가 있는 번들 Python을 사용한다. 이동된 venv 활성화 스크립트 대신 bin/python을 직접 실행한다.

```sh
mkdir docs/experiments/loveholic-20261002/reproduce-01
cp data/production/loveholic/source/provenance.json docs/experiments/loveholic-20261002/source-poppler-*.png docs/experiments/loveholic-20261002/reproduce-01/
docs/experiments/musicxml/venv/bin/python tools/score-production/musicxml/loveholic.py --pdf data/production/loveholic/source/source.pdf --out docs/experiments/loveholic-20261002/reproduce-01
/Users/raphael/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 tools/score-production/musicxml/loveholic_audio.py --audio data/production/loveholic/audio/source.mp3 --bars docs/experiments/loveholic-20261002/reproduce-01/extracted.json --out docs/experiments/loveholic-20261002/reproduce-01/audio-alignment.json
docs/experiments/musicxml/venv/bin/python tools/score-production/musicxml/verify_loveholic.py --dir docs/experiments/loveholic-20261002/reproduce-01
npx vitest run --exclude 'guitar-practice/**' tests/local-media/musicxml.test.ts tests/local-media/canonical-xml.test.ts tests/local-media/score-package.test.ts
```

패키지 도우미는 기존 로컬 Vite editor에서 실행하며 IndexedDB를 쓰지 않는다. 로컬 근거 수신기 `docs/experiments/loveholic-20261002/qa_server.py`의 127.0.0.1:5186으로 결과를 저장한다. Safari에서 `await (await import('/tools/score-production/musicxml/loveholic_package.mjs')).build()`로 생성·재읽기한다. 전곡 원본/PDF·음원·실험 출력은 Git 제외 대상이고 자동 stage하지 않는다. 앱 소스 변경·앱 버전 상승·commit/push/PR/merge/deploy는 이 제작 작업에서 수행하지 않았다. 공유 checkout의 다른 세션 변경은 보존했다.

<a id="loveholic-conversion--2026-10-03-반열림-표기-해결-및-새-패키지"></a>

### 2026-10-03 반열림 표기 해결 및 새 패키지

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

<a id="loveholic-conversion--pdf-줄-앞-자르기-근거"></a>

#### PDF 줄 앞 자르기 근거

새 `tools/score-production/musicxml/loveholic_pdf_crop.py`가 원본 구조를 다시 읽어32개 줄의 안전한 경계를 계산했다. 첫 줄은65.18531113141441pt, 나머지는68.3631315438144pt. 각각 타악기 글리프 오른쪽과 가장 가까운 보호 음악 기호 사이를 선택했다. 첫 줄4/4박자표·첫 음표·실제 마디선 보존, 오선 외 잉크를 가르지 않는 래스터 경계 검사와 변환 beatXs의 원본 페이지 좌표 보존 검사 통과.32줄 contact sheet를 직접 대조했다.

근거는 `display-crop-review-20261003/loveholic-pdf-display-crops.json`이다. 원본 패키지 PDF variant123개 region과 줄 시작32개의 sourceRegion(id/page/x/y/w/h) 및 normalized left를 개발 세션에 전달했다. 정확한 원본 fingerprint 일치 시 PDF 표시용으로만 적용한다. 다른 곡·사용자가 편집한 영역·SVG로 추정 확대하지 않는다. 제작 측은 PDF·패키지 영역을 변경하지 않았다. 후속 공통 표시 구현·검증은 개발 세션의 [PDF 표시 자르기 기록](../../reference/score/rendering.md#pdf-display-trim--pdf-연습-화면-표시용-자르기)과 [Loveholic 재검토](loveholic.md#loveholic-review--loveholic-재검토)를 따른다.

<a id="loveholic-conversion--2026-10-03-최신-표준-가사-재생-패키지"></a>

### 2026-10-03 최신 표준 가사 재생 패키지

시간 비례 공통 렌더러 검증 후 새 `docs/experiments/loveholic-20261002/standard-lyrics-final-package-20261003/`에 재패키징. 패키지 SHA256 `3bbb8ba0013e38e8f652c432b3f8f76591df453f8a796c0698a193c4bcaf409a`, XML `e84578fe97421141fe6944f6a18aa72fdce746fb788ee2bc1ffcd082110f6df8`(아래 최초 표준 가사 검증본과 원시 바이트 동일). 공통 preparePlaybackAssets ribbon123개 및123staff좌표, 한 줄/두 줄 각각269표시·겹침0, 박당 너비·오선 간격 일정. XSD/CRC/원본 미디어·PDF variant·음표·가사·마디 시각 보존. 변경 ZIP항목은 score/pages/0와manifest뿐. 상세 [가사 기록의 최신 캐시 절](loveholic.md#loveholic-lyrics-review--최신-재생-캐시-패키지-2026-10-03)과 해당 폴더 final-validation/browser-validation/capture 참조. 개발 세션에 경로·해시 전달. public/배포/HTML은 제작 측에서 수행하지 않았다.

<a id="loveholic-conversion--2026-10-03-최초-표준-가사-musicxml"></a>

### 2026-10-03 최초 표준 가사 MusicXML

사용자 요청에 따라 Real Paradis처럼 독립 `DrumPracticeLyrics` 성부의 `note/lyric/text`에 원문353문자·269단위를 저장했다. 원본 음표/쉼표와265단위 직접 대응,48/99/107/109마디의4단위는 평행 구절에 따른3.5박 추정으로 명시한다. 표시 성부 길이는 기준 음가이며 실제 보컬 길이를 검증한 값이 아니다. 모든 confirmed=false. 원문, 초기/반열림/중앙 가사 결과와 원본 PDF/MP3를 보존했다.

XML: `docs/experiments/loveholic-20261002/standard-lyrics-package-20261003/Loveholic-final.musicxml`, SHA256 `e84578fe97421141fe6944f6a18aa72fdce746fb788ee2bc1ffcd082110f6df8`. 원본 재추출 P1과 동일, XSD4.0 통과. 독립 XML타임라인 읽기269개 일치 및 누락/텍스트/음가/시작4가지 오류 주입 모두 거부. 공통 저장 계약의269개 복원·음원 연결+5초 후 악보 위치 유지·재저장 동일, SVG/PDF 각각269표시/겹침0, 집중3파일35테스트·Python/JS구문·diff검사 통과.

근거: `standard-lyrics-review-20261003/printed-note-lyrics.json`과3쪽 원본 contact sheet, 새 패키지 폴더의 `final-validation.json`, `lyric-position-validation.json`, `preservation-validation.json`, SVG/PDF browser검사·캡처. [상세 가사 기록](loveholic.md#loveholic-lyrics-review--loveholic-인쇄-가사-제작과-과거-시각-시험--2026-10-03) 참조. 같은 폴더 `.drumscore`는 공통 박 간격 렌더러가 병행 변경 중인 잠정 캐시이며 최종 공개 수록본이 아니다. 검증된 XML/근거를 개발 세션에 전달했다. 공통 렌더 캐시 갱신·저장 곡 import·실제 재생·공개 수록은 그 세션에서 별도로 검증한다.

<a id="loveholic-conversion--2026-10-03-이전-마디-중앙-인쇄-가사-패키지"></a>

### 2026-10-03 이전 마디 중앙 인쇄 가사 패키지

원본 PDF의25개 인쇄줄을 실제 마디에 대조해77마디·353문자를 저장했다. 줄 시작과 가사 시작이 다른37→39,80→82 사례를 교정했다. 원본 문자 bbox·공백·음표 근접 후보를 근거로 남기되 가창 시각/음가를 생성하지 않는다. 코드 `tools/score-production/musicxml/loveholic_printed_lyrics.py`; 저장 계약 `docs/architecture/MEASURE-LYRICS.md`.

새 폴더 `docs/experiments/loveholic-20261002/printed-lyrics-package-20261003/`:

| 파일 | SHA256 |
|---|---|
| Loveholic.drumscore | 26b97bd8b5a1611c4667d42a3fa9205cc6190a8c469000aec9944f45d689fcc1 |
| Loveholic-final.musicxml | c2dcf86e50805d0dfa1f01ca5cfda398cd045c5df3475266f64c4d5a8cba503a |

최신 generator의 원본 재추출 MusicXML을 사용했다. P1드럼 성부 동일,123마디492박1580머리·20half-muted XSD/재읽기 통과. package read/write 전체 동일,77문구 canonical manifest 복원 동일,원본PDF/MP3·PDF variant/pages·마디시각/영역·설정 보존. 실제 공통 renderMeasure SVG77중앙 표시, 원문 대조와 집중3파일31테스트 통과. IndexedDB 저장 곡은 수정하지 않았다. 앱 전체 import/iPad/배포는 개발 세션의 별도 검증이다.

원본 귀속/문자 증거는 `printed-lyrics-review-20261003/`, 패키지 검사와 실제 브라우저 캡처는 새 패키지 폴더에 보존했다. 자세한 현재 상태·과거 음원 정렬 실패의 구분은 [가사 제작 기록](loveholic.md#loveholic-lyrics-review--loveholic-인쇄-가사-제작과-과거-시각-시험--2026-10-03)을 따른다. 기존 초기/반열림 패키지와 원음원은 덮어쓰지 않았다.

<a id="loveholic-conversion--2026-10-13-악보-템포와-원곡-추정-템포-분리--최종-사용자-결정"></a>

### 2026-10-13 악보 템포와 원곡 추정 템포 분리 — 최종 사용자 결정

사용자는 최초136.232 기준 변경 요청을 후속으로 정정했다. 최종 요구는 **악보136 유지, 원곡 측정136.232 표시, 원곡 선택 시 배속1.0**이다. 중간 final-02의 표준 템포136.232 변경안은 미적용·미인계 시도로 보존하고 final-03만 최신 결과로 사용한다. public/원음원·기존 제작 파일을 덮어쓰지 않았다.

- 최초 입력 패키지 SHA256 `2a544df486c26feca450e7021787e43c4ad6db4fc8f8be1dc6d49d5f4cbcaf50`을 `final-03/Loveholic-before.drumscore`로 보존했다. 표준 템포 두 곳·메트로놈 두 곳136, Song 전체(설정 rate1 포함) 그대로. 음원·PDF 대체본·SVG 캐시·마디/가사 시각 전부 동일 바이트/값이다. canonical은 측정 miscellaneous-field 하나만 추가했다.
- 입력의 `score/source`는 authoritative canonicalXML과 불일치했다. 앞서 확정한 Crash 교정 등 최신 내용은 canonical에 있으므로 이것을 정본으로 삼고 새 primary source를 동일 XML로 저장했다. canonical의 음표·주법·가사 내용은 변경하지 않았다. 기존 파일을 보존했으며, 임의로 과거 source의 악기 분류로 돌아가지 않는다.
- MusicXML4XSD·ZIP CRC·전후 XML/전체Song·미변경 자산 대조 통과. 실제 공통 `readCanonical`, `writeCanonical`, `createScorePackage`, `readScorePackage`를 CLI로 실행하여 메타정보/마디/가사/음원 왕복과 측정 필드의 재저장 보존을 확인했다. 근거 `final-03/verification.json`, `final-03/common-api-validation.json`. 메타정보 변경으로 기존 SVG를 재생성하지 않았으며 실제 화면/청취 검증은 앱 담당자의 후속 범위다.
- 재제작: `tools/score-production/musicxml/loveholic_recording_tempo.py --input <검증한 이전 패키지> --alignment data/production/loveholic/audio/audio-alignment.json --out <새 폴더>`. 실제 Python은 lxml을 가진 bundled runtime을 사용한다. 기존 `loveholic_package.mjs` build에도 alignment 해시 대조와 별도 필드 저장을 적용해 재제작 때 누락하지 않는다.
- 해결한 검증 문제: zipfile.writestr에 입력 ZipInfo 객체를 그대로 넘기면 header_offset이 바뀌어 열린 입력 ZIP의 후속 읽기가 `Bad magic number for file header`로 실패한다. `copy.copy(info)`로 출력 객체를 분리하고 원본/출력 CRC·자산 비교를 통과했다. final-01 실패 시도는 보존. 공통 package 왕복은 JSON 계약이므로 undefined 선택 속성은 직렬화에서 생략된다. 비교 기대값을 JSON 직렬화된 전체Song으로 정규화하여 실제 정의된 필드·전체 내용을 검사했다.
- 개발 인계 요구: 측정값은 추정 정보로 구분해 표시한다. 원곡 버튼에136.232를 넣어 기존 `bpm / Song.bpm`으로 계산하면1.0017이 되므로, 원곡 동작은 명시적인 `setRate(1)` 또는 동등한 처리를 사용한다. 이미 저장된 러브홀릭의 악보BPM136·시간표·연습기록은 보존하고 측정정보를 안전하게 추가한다. 앱 수정·패키지 public 수록·기존 DB 반영은 웹앱 개발자가 소유한다.

개발 인계: 2026-10-13 사용자 지정 `드럼연습실 웹앱 개발` 작업 `01a0afc9-ca21-7371-9390-06eb07c017e9`의 현재 metadata/연락 경로 확인 후 최종 결정·필드 계약·final-03 경로/해시·검증·앱 범위를 전달 성공. 제작 측 완료와 실제 앱 수정/반영/청취는 별도 상태다.

<a id="loveholic-conversion--2026-10-13-추가-결정--연습은-일정한-메트로놈-기준"></a>

### 2026-10-13 추가 결정 — 연습은 일정한 메트로놈 기준

사용자가 마디·박별 추가 분석은 과하다고 판단하고, 연습은 메트로놈을 기준으로 하며 실연의 그루브를 넣지 않도록 정했다. 선택한 연습 속도의 균등한 박을 유지한다. 실제 타격의 미세한 앞섬/늦음을 따라 박 격자를 비균등하게 교정하지 않는다. 기보된 리듬은 보존한다. Loveholic의 기존 첫 박0.193초·일정한136.232 BPM 기반 연결 시간표와 final-03 자료를 유지한다. 악보136·원곡 추정136.232 별도 표시·원곡 배속1.0은 그대로다. 추가 분석/박별 교정은 진행하지 않았고 이번 변경은 문서에만 반영했다.

<a id="loveholic-lyrics-review--loveholic-인쇄-가사-제작과-과거-시각-시험--2026-10-03"></a>

## Loveholic 인쇄 가사 제작과 과거 시각 시험 — 2026-10-03

최신 실제 수록·PDF 좌표 수정은 [PDF 가사 위치 수정](loveholic.md#loveholic-pdf-lyric-placement--loveholic-pdf-가사-위치-수정--2026-10-03)을 따른다. 아래 패키지 제작 검증과 실제 앱 수록 상태를 구분한다.


원문 출처: `docs/score-production/LOVEHOLIC-LYRICS-REVIEW.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="loveholic-lyrics-review--최신-결정-악보가-가사-기준-2026-10-03"></a>

### 최신 결정: 악보가 가사 기준 (2026-10-03)

사용자가 실제 가창 시각·길이는 기록하지 않아도 되며 가수가 악보와 다르게 부르는 것은 무시하라고 결정했다. 현재269단위 가사 위치·음가는 악보 기준으로 유지한다. 실제 가창 시각·길이 측정, STT·강제 정렬·시간 가사 검색은 추가 완료 과제가 아니다. 과거 음원 시험은 아래에 이력으로 보존한다.48/99/107/109마디4개 위치는 악보 판독상의 추정으로 계속 명시한다. 음원 재생 연결·초 단위 파생 캐시는 기존 계약대로 유지한다. 저장 구조는 별도 DrumPracticeLyrics이며 드럼 P1 음표에 직접 붙인 구조로 바꾸라는 결정은 아니다.

<a id="loveholic-lyrics-review--최신-재생-캐시-패키지-2026-10-03"></a>

### 최신 재생 캐시 패키지 (2026-10-03)

개발 세션의 시간 비례 SVG 렌더러 검증 후 새 폴더 `docs/experiments/loveholic-20261002/standard-lyrics-final-package-20261003/`에 재패키징했다. 기존 검증 XML을 바이트 그대로 사용하고 캐시만 갱신했다. `Loveholic.drumscore` SHA256 `3bbb8ba0013e38e8f652c432b3f8f76591df453f8a796c0698a193c4bcaf409a`,10,483,505바이트. `Loveholic-final.musicxml` SHA256 `e84578fe97421141fe6944f6a18aa72fdce746fb788ee2bc1ffcd082110f6df8`은 이전 검증본과 같다.

실제 저장 패키지를 재읽고 공통 preparePlaybackAssets에서 ribbon123개·staff좌표123개 확인. 공통 renderMeasure/layoutScoreLyrics의 한 줄 보기269표시·겹침0, 박당 너비 편차5.68e-14px·오선 간격 편차1.78e-15px. 두 줄 QA31행269표시·겹침0. XML 캐시 비운 복원·음원 연결+5초·재저장 후269개 음악적 위치 불변. XSD4.0/ZIP CRC/원본PDF·MP3/PDF variant/마디 시각·가사·드럼 입력 보존 통과. XML1580음표머리·14쉼표, 인쇄/재생SVG 모두VexFlow notehead그룹1594개(쉼표 포함), half-open20개. 인쇄3쪽·재생8쪽 캐시. ZIP변경 항목은 score/pages/0와manifest뿐이다.

근거: 새 폴더 `final-validation.json`, `ribbon-browser-validation.json`, `rows-browser-validation.json`, `ribbon-lyrics.png`, `rows-ending.png`. Safari 로컬 화면에서 가사 위치와 마지막 마디를 직접 확인했다. IndexedDB 쓰기0이며 저장 곡 import·실제 재생·공개 수록/배포는 개발 세션의 후속 검증 범위다. 이전 모든 산출물은 보존한다. 아래 최초 표준 가사 제작의 잠정 캐시는 이 최신 결과로 대체한다.

<a id="loveholic-lyrics-review--표준-가사-성부-전환-결과-2026-10-03"></a>

### 표준 가사 성부 전환 결과 (2026-10-03)

- 목표: 사용자 요청에 따라 Real Paradis와 같은 표준 note/lyric 및 독립 DrumPracticeLyrics 성부로 Loveholic 가사를 저장한다.
- 범위: 원본 문자·음표/쉼표 귀속 대조, 제작 스크립트, 새 MusicXML/패키지 및 근거. 공통 앱 코드는 개발 세션이 소유한다.
- 완료 조건: 원문353문자·269단위 보존, 가사별 마디·박·표시용 음가 XML왕복, 드럼/미디어/기존 결과 보존과 실제 화면 검수.
- 제외: 보컬 음높이 생성, 음원 STT 성공을 선행 조건으로 삼기, 미확인 값을 청취 확정으로 보고, 기존 수록본 덮어쓰기/공개 배포.
- 검증: 대표3줄 및 전25줄 대조,15fixture, XSD·캐시 없이 복원·음원 연결 이동·패키지 재읽기·공통 표시 통과. XML 제작 검증과 공통 렌더 캐시 갱신 상태는 아래에서 구분한다.

265단위는 실제 드럼 음표/쉼표의 시작과 인쇄 underlay를 직접 대응한다. 48/99/107의 마지막 럼과109의 어는 드럼 4분음표 내부에 인쇄돼 있다. 평행 구절40/83/91/50의 명시적8분음표 대응을 참고한3.5박(0기준)은 추정으로 별도 표시한다. 화면용 가사 성부 길이는 기준 음표/쉼표 음가이며 실제 보컬 발음 끝을 측정한 값이 아니다. 기존 Real Paradis도 가사 음가 저장과 실제 청취 검증을 구분한다. 모든 confirmed=false를 유지한다.

현재 확인: 원문353문자/269단위 동일,265직접대응 및4추정 구분, 전25줄 source-note-contact3쪽 시각 대조와15fixture 통과. 코드 `tools/score-production/musicxml/loveholic_lyric_notes.py`, 새 근거 `standard-lyrics-review-20261003/printed-note-lyrics.json`. 원본과 기존 중앙 가사 패키지 보존.

XML: `docs/experiments/loveholic-20261002/standard-lyrics-package-20261003/Loveholic-final.musicxml`, SHA256 `e84578fe97421141fe6944f6a18aa72fdce746fb788ee2bc1ffcd082110f6df8`. P1은 재추출 원본과 XML 정규화 후 동일하다. 별도 DrumPracticeLyrics123마디에269개 lyric/text를 저장한다. 보컬 pitch는 생성하지 않는다. MusicXML4.0 XSD,123마디492박1580머리/20half-muted, ZIP CRC와 XML원시 바이트·원본PDF/MP3 보존 통과.

Safari의 실제 저장 패키지 재읽기와 공통 preparePlaybackAssets/renderMeasure/layoutScoreLyrics 검수에서 SVG/PDF 각각269개 표시·31행·겹침0. XML에서 캐시를 비우고269개 위치·길이 복원, 음원 연결 전체+5초 후 음악적 위치 유지, 두 번째 XML저장/복원 일치 확인. IndexedDB 쓰기0이며 저장 곡 import·실제 재생/iPad/배포 검증을 대신하지 않는다. 근거: 같은 폴더 `final-validation.json`, `svg-browser-validation.json`, `pdf-browser-validation.json`, `svg-opening.png`, `svg-inferred.png`, `pdf-opening.png`. 집중 canonical-xml/score-package/musicxml 3파일35테스트 통과.

같은 폴더의 패키지 SHA256 `54282a19b08b6210a08af37cdadfd6283a6d318056b0e6c2068d63d4482094e4`는 잠정 렌더 캐시다. 병행 개발의 박 간격 렌더러 변경으로 이전 패키지 대비SVG영역36개의 y/h가 바뀌었다. PDF variant·마디 시각·드럼 입력은 그대로다. 개발 세션의 렌더러 검증 후 캐시를 갱신하며 현재 패키지를 최종 공개 수록본으로 보고하지 않는다.

<a id="loveholic-lyrics-review--이전-결과-원본-인쇄-가사-77마디-수록"></a>

### 이전 결과: 원본 인쇄 가사 77마디 수록

사용자 정정에 따라 STT·강제 정렬을 인쇄 가사 수록의 선행 조건에서 제외했다. 원본에는 드럼 성부와 인쇄 가사가 있으며 보컬 음가를 입증하는 독립 성부는 없다. 따라서 [마디 가사 계약](../../reference/score/musicxml.md#measure-lyrics--마디-단위-인쇄-가사-계약)의 measure-center로 저장했다. 아래 음원 시험 실패는 이 제작 경로를 막지 않는다.

`tools/score-production/musicxml/loveholic_printed_lyrics.py`가 원본 PDF 문자 bbox와 실제 마디 경계를 대조했다. 25줄·269문자/영어단어 단위·공백 제외353문자를 77마디에 귀속했고 경계를 가로지른 단위는0개다. 원문 문자·좌표·행 공백을 별도 근거에 보존했다. 전25줄의3쪽 contact sheet를 직접 대조했다. 37번 줄의 첫 가사는39마디,80번 줄은82마디에 있다. 줄 시작번호는 가사 시작번호가 아니다.

새 패키지 폴더는 `docs/experiments/loveholic-20261002/printed-lyrics-package-20261003/`이다. 패키지 SHA256 `26b97bd8b5a1611c4667d42a3fa9205cc6190a8c469000aec9944f45d689fcc1`, XML `c2dcf86e50805d0dfa1f01ca5cfda398cd045c5df3475266f64c4d5a8cba503a`. 77항목은 Song.measureLyrics 및 정본 manifest에 저장·복원되고 lyrics=[]는 유지한다. 가창 시각이나 가짜 보컬 음가를 생성하지 않는다.

검증: 원문353문자 동일, P1드럼 성부 동일,123마디492박1580머리/half-open20개 XSD·재읽기 통과. ZIP CRC·원본 PDF/MP3 바이트·PDF variant·마디 시각/영역/연습 설정 보존. 실제 공통 renderMeasure의 SVG77개 중앙 표시와 XML 캐시를 비운 뒤 복원 일치 확인. 집중3파일31테스트 통과. Safari MCP의 Transport closed 때문에 승인된 ego-browser를 사용했다. QA grid의 높이0px 및 고정 PDF비율 오류를 바로잡아 실제 SVG page비율로 검수했다. 앱 저장 곡 import·iPad·배포 검증은 개발 세션 담당이며 이 grid 검수와 구분한다.

근거: 형제 `printed-lyrics-review-20261003/printed-measure-lyrics.json`, `printed-lyrics-validation.json`,3쪽 contact sheet. 새 패키지 폴더의 `package-audit.json`, `final-validation.json`, `preservation-validation.json`, `printed-browser-validation.json`, `printed-77-browser.png`와 opening/middle/ending 캡처. 기존 패키지와 모든 음원 시각 시험 결과는 보존한다.

<a id="loveholic-lyrics-review--과거-음원-시각-시험의-범위"></a>

### 과거 음원 시각 시험의 범위

- 목표: 사용자 원본 PDF의 인쇄 가사를 보존하고, 가창 구절 시작·끝과 음절 시각을 구분해 음원에서 확인한다.
- 범위: 로컬 분리 보컬·STT·정렬 후보·측정 기록. 원본 MP3와 기존/새 패키지를 보존한다.
- 완료 조건: 원본 구절 대응, 구간·모델을 바꾼 교차 검증, 미확인 항목 식별. 숫자가 반복된다는 이유만으로 확인 완료로 삼지 않는다.
- 제외: PDF X좌표를 가창 박으로 사용, 균등 음절 분할, 오인식으로 가사 정본 변경, 원음원 외부 전송.
- 검증: 대표 3줄을 먼저 시험했다. 줄의 시작·끝과 각 음절의 결과를 별도로 기록했다. 아래 음원 시각 후보는 패키지에 적용하지 않았다. 현재 인쇄 가사 수록 여부는 위 절을 따른다.

<a id="loveholic-lyrics-review--기준과-과거-근거"></a>

### 기준과 과거 근거

확정 매핑·변환 정책·[Apple 로컬 실행 계약](../../how-to/use-apple-local-tools.md#apple-local-workflow--apple-로컬-검토-실행-절차)을 읽었다. 과거 제작의 가사 v2 기록(보관본은 2026-10-13 사용자 요청으로 삭제)과 `tools/apple-local/align_syllables.py`, `docs/experiments/lyrics-v2/align-short.py`를 대조했다. 구간 첫 음절이 Whisper DTW 클립 시작에 붙는 현상은 당시에도 있었다. 과거 구절 앵커나 모델 정확도를 새 곡의 근거로 재사용하지 않는다.

원본 가사는 `printed-lyric-cues.json`의 25개 인쇄 행이다. PDF 행은 구절의 음악적 마디 기준 근처 검색 범위를 정하는 데만 사용한다. 행 시작 X좌표·마디 첫 박을 가창 시작으로 간주하지 않는다. 끝까지 없는 가사를 생성하거나 침묵의 인식 환각을 적용하지 않는다.

<a id="loveholic-lyrics-review--환경자료"></a>

### 환경·자료

- 실제 환경: macOS 27.0.1, arm64. Apple SpeechBridge는 로컬 ko_KR 사용 가능·설치 확인.
- 작업 폴더: `docs/experiments/loveholic-20261002/lyrics-review-20261003/`. 모델·분리 보컬·실험 원문은 Git 제외 로컬 자료다.
- Python 3.14.7 로컬 `tools-venv`: mlx-whisper 0.4.3, MLX 0.32.3, Demucs 4.1.0, torch 2.14.1, transformers 5.18.0.
- Whisper turbo 저장소 `mlx-community/whisper-large-v3-turbo`, revision `a4aaeec0636e6fef84abdcbe3544cb2bf7e9f6fb`.
- Whisper large-v3 저장소 `mlx-community/whisper-large-v3-mlx`, revision `49e6aa286ad60c14352c404340ded53710378a11`.
- Korean CTC 저장소 `kresnik/wav2vec2-large-xlsr-korean`, revision `629c9a3501c10ba128bf3fa1eebb12af3be03f61`. `[pad]` ID 1204를 blank로 사용. 프레임 간격 20ms, receptive field 25ms.
- 모델 파일은 다운로드해 로컬 실행했다. 사용자 음원은 외부 업로드하지 않았다. AFM은 음향 시각을 생성하는 데 사용하지 않았다.

<a id="loveholic-lyrics-review--시험-결과와-채택-범위"></a>

### 시험 결과와 채택 범위

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

<a id="loveholic-lyrics-review--근거재현"></a>

### 근거·재현

원곡/분리 보컬 Apple 결과는 `opening-chorus-stt.json`, `opening-vocals-apple.json`. Whisper는 `opening-chorus-whisper.json`, `opening-vocals-whisper.json`, `full-vocals-whisper.json`. 비교 정렬은 `representative-token-alignment.json`, `representative-whisper-vocals.json`, `representative-ctc-vocals.json`. 모델 identity는 `model-provenance.json`, `ctc-model-provenance.json`에 기록했다.

제작 코드 `tools/score-production/musicxml/loveholic_lyrics_review.py`는 `--audio`로 분리 보컬을 선택할 수 있다. `loveholic_ctc_review.py`는 어휘가 확인된 한국어 prefix의 음향 점수를 검사하며 원본 본문·suffix와 미지원 글자를 별도로 남긴다. 모든 후보는 autoApply=false다.

Demucs는 원곡의 시간축을 유지한 `htdemucs` vocals를 생성했다. 두 stem 중 vocals만 저장하고 원음원은 재인코딩하지 않는다. [공식 Demucs](https://github.com/adefossez/demucs), [CTC 모델 카드](https://huggingface.co/kresnik/wav2vec2-large-xlsr-korean), [PyTorch CTC 설명](https://docs.pytorch.org/audio/main/tutorials/ctc_forced_alignment_api_tutorial.html)을 대조했다. 최신 TorchAudio에서 예전 forced_align API가 제거됐으므로 해당 함수 호출을 복사하지 않았다.

<a id="loveholic-lyrics-review--large-v3-구절-경계-판정"></a>

### large-v3 구절 경계 판정

검토 후보 채택 기준은 (1) 사용자 원문 구절의 대응과 순서 확인, (2) 검색 범위를 0.5초 바꿔도 구절 시작 차이 0.15초 이하, (3) turbo/large-v3의 해당 경계 차이 0.15초 이하, (4) 낮은 확률·클립 고정·다른 구절/침묵 환각 없음이다. 이 수치는 후보 선별 기준이며 실제 가창 오차 보증이 아니다. 첫/중간/끝 대표 구절을 확인하고 성공 행·실패 행을 분리한다. 모델 종류를 늘린 횟수를 정확성의 근거로 삼지 않는다.

| 원본 행 | 두 자유 인식 조건의 시작 후보 | 판정 |
|---|---|---|
| 7: 첫 한국어 구절 | 10.6432 / 10.7032초, 차이 0.06초 | prefix 후보는 안정적. 전곡 turbo의 시작 11.14초와 약 0.50초 차이. 원문 나/난 차이와 영어 끝 미확인으로 전체 구절 미채택 |
| 37: 중간 한국어 구절 | 67.1542 / 67.6142초, 차이 0.46초 | 두 번째 조건 원문 구절 오인식·시작 민감성으로 미채택 |
| 116: 끝 구절 | 201.2886초 / 해당 prefix 미검출 | 첫 조건 prefix 확률 0.082, 두 번째 조건 다른 가사로 인식. 미채택 |

이는 대표 3행에서 확정 가능한 전체 구절을 얻지 못했다는 결과다. 전곡 25행 모두에 실패가 입증됐다고 확대하지 않는다. 근거 `representative-free-large-v3.json`, `representative-forced-large-v3.json`, `line-boundary-decision.json`, `full-vocals-large-v3.json`. 첫 행의 부분 시작 후보를 전체 구절 끝·음절 리듬의 확인으로 바꾸지 않는다. 임의 평균·박자 양자화와 패키지 자동 적용은 하지 않았다.

마디별 중앙 인쇄 가사는 별도 표시 계약이다. 이 과거 음원 시험은 실제 가창 타이밍을 확정하지 못했다. 최신 표준 가사 성부의 인쇄 악보 위치·표시용 음가는 위 절의 별도 제작 근거를 따르며, 음원 시험 성공으로 해석하지 않는다.

<a id="loveholic-lyrics-review--공개-시간-자료-추가-조사"></a>

### 공개 시간 자료 추가 조사

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

<a id="loveholic-pdf-lyric-placement--loveholic-pdf-가사-위치-수정--2026-10-03"></a>

## Loveholic PDF 가사 위치 수정 — 2026-10-03

- 목표: 사용자25~32마디 캡처의 중앙 가사를 원본 PDF 대응 음표 위치의 음절 표시로 고친다.
- 범위: 기존 수록본 보존, 표준269가사 수록, PDF 표시 좌표269개 추가, 실제 앱 검수. 공통 코드 변경은 개발 세션에 작업 범위를 알리고 이 제작 세션에서 구현했다. Git 통합·앱 버전 관리는 개발 세션에서 수행한다.
- 완료 조건: 실제 수록·저장 곡에서 중앙가사0/음절269, PDF 대응 좌표 일치, XML·미디어·기존 자료 보존.
- 제외: 실제 가창 시각/음가 변경, 드럼/가사 XML 재작성, 외부 배포·HTML 생성.
- 검증: 패키지 비교, 실제 악보 불러오기/업데이트·저장·재열기,25~32마디 좌표와 전269표시 대조.


원문 출처: `docs/score-production/LOVEHOLIC-PDF-LYRIC-PLACEMENT.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="loveholic-pdf-lyric-placement--원인과-보존"></a>

### 원인과 보존

로컬 `public/scores/loveholic.drumscore`는 이전 중앙가사77개/음절0개였다(SHA25616925715d0fbc386dea1731c36fb021ec9c7f719e1ede63449bdecd001bfa5e7). 제작된269단위 패키지가 수록 파일에 반영되지 않았다. 이전 수록본은 `docs/experiments/loveholic-20261002/lyric-placement-app-fix-20261003/previous-bundled-loveholic.drumscore`에 보존했다. Safari localhost 실제 player의 기존 저장 곡 목록은 비어 있었으며 ‘악보 불러오기’로269가사 저장·재열기를 확인했다. 사용자가 캡처한 탭/배포/저장 곡의 실제 상태와 이 로컬 검수를 같은 상태로 가정하지 않는다.

269가사로 바꾼 뒤 PDF25~32마디27단위의 파란 음절 중앙을 원본 대응 음표 좌표와 측정한 최대차이는7.8446 CSS px였다. 기존 PDF beatXs는 줄기 좌표·정수박 보간이므로 정확한 머리/반박 좌표와 다르다. PDF 표시 전용 `lyricAnchors`(lyricId,quarterOffset,x)를 별도로 기록해 음악적 위치와 진행선은 유지한다.265개는 원본 대응 음표/쉼표 좌표,4추정은 원본 인쇄 단위 중앙을 사용한다. 입력근거 `lyric-placement-app-fix-20261003/pdf-lyric-note-anchors.json`.

<a id="loveholic-pdf-lyric-placement--새-패키지와-현재-검증"></a>

### 새 패키지와 현재 검증

`docs/experiments/loveholic-20261002/pdf-note-lyrics-package-20261003/Loveholic.drumscore` SHA25618c7410748b222a6a4fcd6d83d73621200e504b8245b65d099cb6f27c550b80d(10,487,287바이트)를 로컬public에 반영했다. 기존269가사 패키지 대비 manifest만 변경했다. canonicalXML·Song전체·미디어·SVG와 원본 PDF영역의 기존 필드는 동일하며 새좌표269개 왕복 보존을 확인했다. 공통 표시 수정과 실제 앱 재검수를 완료했다. 이전 수록본은 위 별도 백업에 보존했다.

원본·가사 표준 성부의 제작 근거는 [가사 제작 기록](loveholic.md#loveholic-lyrics-review--loveholic-인쇄-가사-제작과-과거-시각-시험--2026-10-03)을 따른다.

<a id="loveholic-pdf-lyric-placement--실제-앱-검증-완료"></a>

### 실제 앱 검증 완료

Safari `http://127.0.0.1:5173/player.html`의 실제 악보 업데이트 → 열기 → PDF 두 줄 보기 → 재열기를 수행했다. 저장 곡은 가사269개·중앙 문구0개·PDF 좌표269개이며 canonicalXML 해시는 위 표준 XML과 같다. 기존 설정·마커를 보존했다.

- 전269개 표시: 참조 문자 불일치0, PDF 대응 좌표와 음절 중앙의 최대차이0.0973 CSS px 미만. 265직접대응·4추정 구분을 유지한다.
- 사용자 캡처의25–32마디27개: 최대차이0.023 CSS px 미만. 최종 실제 화면 `lyric-placement-app-fix-20261003/player-pdf-25-32-exact.png`, 전체 좌표 `note-centre-alignment-after.json`.
- `Region.lyricAnchors` 입력 검증, 표시 crop 시 좌표 변환, PDF lyricId/음악적 위치 일치 시 대응 좌표 사용. 가사 위치를 편집했거나 SVG이면 기존 계산으로 돌아간다. PDF 대응 좌표는 일반 겹침 방지의 가로 이동 대상에서 제외한다. 긴 영문도 대응 위치를 중앙으로 유지한다.
- 마디의1px 테두리를 포함한 백분율 좌표와 실제 PDF crop 너비가 달라 남은1px 차이를 확인했고, PDF 전용 좌표는 crop의 실제 px 너비로 계산했다.
- 회귀: crop 전후 절대 페이지 좌표·원본 불변, 두 보기/PDF 선택, SVG·편집 후 fallback, 손상 입력, 겹침 처리의 좌표 보존. 전체77파일362테스트, TypeScript 및 변경 범위 diff check 통과.

이 결과는 로컬 코드·로컬 수록본·실제 로컬 저장 곡의 검증이다. 공개 서버의 파일이나 사용자 기존 탭/별도 저장 파일을 갱신했다는 뜻은 아니다. 공개 배포·push·독립 HTML 생성은 수행하지 않았다. 기존 곡은 앱의 ‘악보 업데이트’로 반영하며 같은 구조의 연습 상태를 보존한다.

<a id="loveholic-publication--loveholic-제작-감독-및-드럼연습실-수록"></a>

## Loveholic 제작 감독 및 드럼연습실 수록

- 목표: 제작 세션의 완성 악보를 독립 검수하고 로컬 드럼연습실과 기존 Sites에 수록한다.
- 범위: 세션 `01a0fd08-ba73-7482-b10e-40e637a1efc0` 감독·지도, `.drumscore` 수령, 플레이어 카탈로그·버전·배포. 사용자가 2026-10-02 명시적으로 승인했다.
- 완료 조건: 패키지 재읽기, 악보/음원/마디 연결 검증, 로컬 플레이어 불러오기 및 재생 확인, Sites 성공 배포.
- 제외: 악보제작기 공개, 원본 또는 사용자 보관함 덮어쓰기, 재생 HTML 생성·저장, 미승인 표기 대체.
- 검증: 제작 근거 문서와 파일 해시, 독립 패키지 검사, 집중 테스트·빌드, 로컬 Safari 동작, Sites 배포 상태.


원문 출처: `docs/score-production/LOVEHOLIC-PUBLICATION.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="loveholic-publication--역할"></a>

### 역할

제작 세션은 Loveholic 변환 스크립트와 제작 기록을 소유한다. 이 세션은 `src/content/bundled-scores.json`, 플레이어 버전, 수록 파일 및 Sites 배포를 소유한다. 동일 checkout의 다른 변경은 보존한다.

<a id="loveholic-publication--중간-검수"></a>

### 중간 검수

- 123마디·492박·음표머리 1,580개 추출 및 OSMD 3쪽 출력 결과를 확인했다. 아직 최종 패키지 독립 검수를 의미하지 않는다.
- 인쇄 136 BPM과 신호 추정 136.232 BPM을 구분하도록 지도했다. 음원 마디 연결은 추정 start/end를 사용하고 인쇄 BPM은 유지한다.
- half-muted 20개는 MusicXML 의미 저장과 OSMD 표시 미지원을 구분하고 원본 PDF를 함께 수록하도록 지도했다. 대체 기호를 임의 승인하지 않았다.
- 감독 heartbeat `loveholic`: 이 스레드에서 10분 간격으로 새 진행을 점검한다. 변화 없는 상태는 알리지 않으며 최종 수록·배포 후 중지한다.

<a id="loveholic-publication--상태"></a>

### 상태

최종 패키지 수령·독립 검수·로컬 수록·Sites 배포 완료. 상세 증거와 한계는 아래 최종 수록 기록을 따른다.

<a id="loveholic-publication--2026-10-03-독립-플레이어-검수"></a>

### 2026-10-03 독립 플레이어 검수

- 후보 패키지 `ad0b05c7e8ce7debf3a91eaca2e3d0a105a2ee2e5d5ff9698959dac0fe9114c1`, 9,953,560bytes. ZIP 무결성 및 123마디/두 형식/원본 해시 확인.
- 원본과 SVG의 32개 시스템을 전수 대조: 페이지 나눔과 각 줄 마디 그룹 모두 일치. `supervisor-structural-check.json` 기록.
- Safari27.0.1 격리 로컬5182에서 기존 곡 보존, Loveholic 불러오기·저장·열기, 재생0:11→0:17 및 정지,112마디3:15 이동, SVG/PDF 전체 각3쪽 이미지 로드, 인쇄 가사 텍스트 확인.
- PDF crop 결함 발견:10→11마디에서 이전 줄 가사가 위에 들어오고 현재 가사가 하단에서 잘린다. `player-pdf.png` 근거로 제작 세션에 패키지 geometry 수정 지시. 수정 전 배포 보류.
- SVG 한글 구간명은 실제 Safari 캡처에서 정상. 보조 PNG 변환기의 폰트 문제를 실제 SVG 결함과 구분했다.
- 패키지18검사·보관함/분리/관리13검사 통과. 타입/i18n/앱 분리 빌드 통과. 재생앱 후보0.4.3, 제작앱0.4.1 유지.

<a id="loveholic-publication--최종-수록--2026-10-03-0014-kst"></a>

### 최종 수록 — 2026-10-03 00:14 KST

- 최종 패키지 SHA256: `e94f9e2a54ab584061778a8db3f8418e92247774d15a1d3fc632bf19a8347916`, 9,953,962bytes. 제작 결과/로컬 public/플레이어 빌드/Sites 사본 일치.
- SVG·원본 PDF 각3쪽,123마디,원본 음원,인쇄 가사 텍스트,구간 마커8개 포함. 보컬 음절 싱크는 미확정이므로 만들지 않았다.
- PDF32줄 crop을 원본 내용 기준으로 수정했다. 격리 Safari5183에서 최종본을 새로 불러오고10→11마디 혼입·잘림 해소를 캡처로 확인했다: `docs/experiments/loveholic-20261002/player-pdf-fixed.png`.
- 남은 표시 차이: PDF는 기존 플레이어가 crop 높이에 맞춰 확대하므로 줄마다 오선 크기가 다소 달라진다. SVG는 오선 정렬을 사용한다. half-muted20개는 XML에 보존되지만 OSMD2.1.2에서 표시되지 않으며 원본 PDF로 확인한다.
- 음원 연결은 첫 박0.193초·136.232BPM 신호 추정값이다. 원본 인쇄136BPM 유지. 전체 구간 및 특징적 필인의 위상 대조를 통과했지만 청취 확정으로 표현하지 않는다.
- 드럼연습실0.4.3, 악보제작기0.4.1(로컬 전용 유지). 기존 바람과 언덕의 발라드 및 사용자 보관함을 보존한다.
- Sites 버전10, 소스 `d1f6d24654f5fb01f2e590c3261197c3689a2f8d`, 배포 `appgdep_6abfca5730508191a74452a476464b51`, 상태 succeeded.
- URL: https://drum-practice-studio.dgkma.chatgpt.site
- 배포 성공은 Sites 응답으로 검증. 게시 URL을 별도 GUI 검수한 것으로 보고하지 않는다. HTML 재생 파일은 생성·저장하지 않았다.

<a id="loveholic-review--loveholic-재검토"></a>

## Loveholic 재검토

2026-10-03. 사용자 요청: 이전 제작 세션 01a0b7de-deef-7572-8833-02cf6080ddb1과 정본을 대조하고 개선 가능한 결함을 수정한다.


원문 출처: `docs/score-production/LOVEHOLIC-REVIEW.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="loveholic-review--기준과-순서"></a>

### 기준과 순서

1. 과거 과정에서 검증된 방법과 현재 정본을 대조한다. 표본 정확도를 전곡 정확도로 표현하지 않는다.
2. 원본→XML→패키지의 마디·주법·가사·음원 연결 근거를 분리해 확인한다.
3. 재생 표시 결함은 공통 재생 코드에서 수정하고 기존 기능 회귀를 검사한다.
4. PC에서 악보를 검수하고 iPad Safari에서 플레이어를 확인한다. 대체 환경 결과를 iPad 결과로 보고하지 않는다.
5. 실패와 수정·재검증을 아래에 기록한다. 미승인 주법 대체나 미확인 보컬 박을 만들지 않는다.

<a id="loveholic-review--발견"></a>

### 발견

- 과거 세션은 XML 음악적 위치와 녹음 시각을 별도 계약으로 유지하고 SVG는 로드 시 생성하여 재사용하도록 결정했다. 현재 방식 유지가 적절하다.
- PDF 오선 크기 차이는 기존 공통 오선 정렬의 MusicXML 조건 때문에 발생한다. PDF도 검출 가능한 오선을 정렬하되 가사 포함 원본 영역을 보존해야 한다. 검출 불가능한 PDF는 기존 표시로 안전하게 돌아가야 한다.
- half-muted는 XML 보존과 전용 주법 렌더링 승인을 구분해야 한다. 과거 일반 도형 실험은 현재 매핑 승인이 아니다.
- 인쇄 가사 좌표와 보컬 박은 같지 않다. 기존 자료의 마디별 표시 계약이 실제 구현되어 있는지 확인한 뒤 적용 여부를 판단한다.

<a id="loveholic-review--반복-검증-기록"></a>

### 반복 검증 기록

- 1차: 기존 검출기를 PDF에 적용하면 123개 중 5개에서 실패. 오선의 인접 픽셀 간격을 4배해 누적되는 반올림 오차를 발견했다.
- 2차: 오선 전체 폭으로 간격을 구해 4개를 해결. 좁은 103마디는 빔/음표 때문에 실패하여 동일 줄 전체 폭을 사용하고 결과를 캐시했다. 123/123 검출.
- 3차: 자산 준비 후에도 화면에 차이가 남음. `playback-screen.ts`의 두 곳에서도 MusicXML만 정렬하는 조건이 남아 있었다. 공통 화면 조립부까지 수정하고 web/player × 한줄/두줄 회귀 검사를 추가했다.
- PDF는 줄별 crop 높이가 아니라 검출한 오선 간격으로 배율을 정한다. 모든 원본 영역을 포함하는 공통 위/아래 여백을 계산한다. 검출 실패 시 전체 PDF를 기존 crop 방식으로 표시하여 일부만 다른 배율이 되는 일을 피한다.
- 실제 Loveholic123마디 계산 검사: 오선 간격8.50746px 동일, 기준선75.22388px 동일, 영역 잘림0(250px셀/150px높이 기준). 벡터 원본32줄과 검출 top 오차 최대1.62 원본 이미지px. 래스터 오차를 0으로 주장하지 않는다.
- Safari 응답형 디자인 모드의 iPad mini 프리셋(1133×744, 실제 페이지1130×750)을 확인. PDF 한줄/두줄, 가사 포함, 재생0:14→0:23 및 정지, 화면 가로 넘침 없음 확인. screenshots `review-pdf-ipad-responsive-final.png`, `review-pdf-rows.png`.
- Device Hub MCP는 이번 에이전트 승인 오류를 반환했다. 기존 권한을 우회하지 않고 이미 승인된 Safari 응답형 경로로 검증했다. iPad 시뮬레이터 터치 검증과 동일하다고 보고하지 않는다.
- 전체 테스트의 초기15실패는 PDF 검출 도입으로 테스트 canvas mock에 getImageData가 없었던 문제와 기존 제작앱 명칭/버전 기대값이었다. mock과 앱별 기대값 수정 후 1건 저장타이밍 검사가 70worker 병렬에서 timeout. 4worker 전체 실행328/328 통과. 공통 화면 호출부 추가회귀2개도 통과.
- 원본 독립 fixture10마디·음표 개수·음가·매핑·오류주입5개·PDF32줄 경계 검사를 재실행해 통과했다. 원본과 패키지 음악 데이터는 변경하지 않았다.

<a id="loveholic-review--다음-작업에서-재사용할-해결예방-절차"></a>

### 다음 작업에서 재사용할 해결·예방 절차

해결 커밋: `4ce2d10`. 이 기록은 작업 순서뿐 아니라 다음 작업자가 같은 실패를 피하는 기준이다. 새 사례도 **증상 → 확인된 원인(미확정은 명시) → 실패한 시도 → 해결 → 검증 근거 → 재발 방지** 순서로 남긴다.

| 막힌 부분 | 해결과 재발 방지 |
| --- | --- |
| PDF 5마디 오선 검출 실패 | 인접 선 간격의 반올림 오차가 누적됐다. 전체 오선 간격으로 추정하고, 좁은 마디는 같은 줄 영역을 합쳐 검출했다. `tests/unit/staff-geometry.test.ts`의 subpixel 검사와 실제 전곡 검출 수를 함께 확인한다. 다른 PDF에서도 123/123을 보장한다고 해석하지 않는다. |
| 자산 검출 성공 후에도 화면 배율이 그대로 | 자산 준비만 수정하고 화면 조립부 두 곳의 MusicXML 조건을 놓쳤다. `preparePlaybackAssets → createPlaybackScreen → scoreLayout/measureWidth` 호출 경로를 끝까지 추적한다. `tests/local-media/playback-screen.test.ts`에서 web/player 모두 PDF 공통 배율을 사용하는지 검사하고 한줄·두줄을 실제 화면에서 확인한다. |
| 오선 정렬 과정에서 인쇄 가사 잘림 위험 | 고정 15간격 프레임을 PDF에 강제하지 않고 원본 crop 전체를 포함하는 공통 프레임을 계산했다. `tests/integration/practice-staff-layout.test.ts`에서 가사 포함 영역과 검출 불가 시 전체 fallback을 검사한다. 배율 통일을 위해 원본 내용을 자르지 않는다. |
| PDF 검출 추가 후 테스트 실패 | canvas mock에 새로 호출하는 `getImageData`가 없었다. 테스트 환경을 보완하고 제작앱 명칭·버전 기대값을 실제 앱별 정의에 연결했다. 제품 코드 실패와 mock/기대값 실패를 분리해 확인한다. |
| 대량 병렬 테스트에서 저장 검사 timeout | 70 worker 실행에서 발생하고 4 worker 전체 실행은 통과했다. 자원 경합은 추정이며 원인 확정으로 기록하지 않는다. 재현 시 worker 수·실행 로그를 함께 보존하고 `npx vitest run --maxWorkers=4`로 전체 결과를 확인한다. timeout 확대만으로 해결했다고 하지 않는다. |
| Device Hub 에이전트 승인 실패 | 원래 연결은 복구되지 않았다. 승인된 Safari 응답형 경로로 표시 검증을 수행했다. 이를 시뮬레이터 터치 검증으로 바꾸어 보고하지 않는다. |
| Sites 스킬/스크립트 경로 소실 | 재탐색 후에도 찾지 못했고 원인은 미확정이다. 사용 가능한 connector 계약으로 원격 HEAD 확인→정적 소스 커밋·push→SHA 재조회→동일 SHA archive→버전 저장·배포를 수행했다. 예전 자격 증명은 재사용하지 않고 새 계약·권한을 확인한다. 배포 성공과 기존 도구 복구를 구분한다. |

최종 검사 로그: `docs/experiments/loveholic-20261002/review-tests-final.log`(330개), `review-build.log`, `review-transcription.log`. 화면 근거는 위 반복 검증 기록과 같은 폴더에 있다. 로컬 실험 근거는 Git 제외 자료이므로 코드 회귀 테스트도 함께 유지한다.

<a id="loveholic-review--남는-경계"></a>

### 남는 경계

- 가사의 마디 중앙 배치는 현재 Lyric/정본에 별도 표현 계약이 없고 모든 행이 마디·박·길이로 저장된다. PDF의 인쇄 X위치를 확정 보컬 박으로 넣으면 기존 계약을 훼손한다. 이번에는 원문/PDF를 보존하고 음절 타이밍을 만들지 않았다. 별도 bar-text 계약 도입은 기존 데이터/편집/왕복 형식을 함께 설계해야 한다.
- half-muted는 W3C 표준에서 원 안 ＋ 및 brassMuteHalfClosed를 지정하지만 이것이 OSMD 하이햇 전용 승인 규칙은 아니다. 2026-10-03 공식 develop ArticulationReader의 기술 기호 매핑에도 해당 항목은 없다. 현재 확정 범례를 우회하는 일반 도형 추가는 하지 않았다.
  - https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/half-muted/
  - https://raw.githubusercontent.com/opensheetmusicdisplay/opensheetmusicdisplay/develop/src/MusicalScore/ScoreIO/MusicSymbolModules/ArticulationReader.ts
- 과거 표본 F1은 이번 곡 전곡 정확도 근거가 아니다. 전곡 청취 확정과 보컬 음절 싱크를 완료라고 표시하지 않는다.

<a id="loveholic-review--최종-상태"></a>

### 최종 상태

- 70개 테스트 파일330개 검사 통과(`--maxWorkers=4`), 타입/i18n 및 editor/player 분리 빌드 통과. SVG123마디 두줄 표시·PDF 전환 후 복귀도 Safari 응답형에서 확인했다.
- 악보제작기0.4.2 / 드럼연습실0.4.4. 새로 만든 HTML 재생 파일 없음. 원본/패키지 해시는 e94f9e2a…로 유지한다.
- Sites 버전11, 소스 bda593d5eab00ee29cb18a15f5987f52d67d2bba, 배포 appgdep_6abfd017a2108191b4fe9f73650e3911 succeeded(2026-10-03 00:39 KST). 악보제작기은 로컬 전용 유지.
- 기존 Sites 스킬/스크립트 경로가 현재 파일시스템에서 사라져 재탐색했으나 찾지 못했다. 원인을 추측하지 않았다. 기존 connector의 명시적 Git/version/archive/deploy 계약으로 배포했다. 임시 자격 증명은 메모리·자식프로세스 환경에서만 사용하고 파일에 저장하지 않았다. 원격 HEAD 일치→정적 사본 커밋→push→원격SHA 재조회→같은SHA archive→save/deploy 순서를 지켰다.

<a id="loveholic-review--후속-해결--2026-10-03-0121kst"></a>

### 후속 해결 — 2026-10-03 01:21KST

위 최종 상태와 남는 경계는0.4.4 당시 기록이다. 이후0.4.5에서 PDF32줄 시작 trim, 공식 pictHalfOpen1 20개 표시, 기존 보관 악보 업데이트를 해결했다. 커밋536d0f3, Sites버전12. 원본 PDF·음원·마디/박 보존과 Safari 검증, 실패/복구 근거는 [PDF 표시 검증 기록](../../reference/score/rendering.md#pdf-display-trim--pdf-연습-화면-표시용-자르기)에 있다. 음절 가사 타이밍은 여전히 별도 검수 중이다.

<a id="musicxml-troubleshooting--loveholic에서-해결한-사례"></a>

### Loveholic에서 해결한 사례

<a id="musicxml-troubleshooting--현재-기준-가창-차이로-악보-가사를-보정하지-않음"></a>

#### 현재 기준: 가창 차이로 악보 가사를 보정하지 않음

- 증상: 가사 저장 결과를 설명하며 실제 가창 시각·길이 미검증을 반복해 남은 작업처럼 전달했다.
- 해결:2026-10-03 사용자가 악보를 표준으로 확정했다. 가수의 가창 차이를 반영하지 않으며 실제 가창 시각·길이 측정·기록은 요구하지 않는다. 변환 정책·매핑·정본 계약과 Loveholic 현재 상태에 반영했다.
- 다음 적용: 원본 악보의 문자·마디·박·음가 대응과 XML 저장/복원을 검증한다. 악보 판독 추정은 구분하되 STT·강제 정렬을 추가 완료 조건으로 두지 않는다. 재생용 음원 연결·파생 캐시와 실제 가창 전사는 구분한다. 아래 음원 조사와 실패는 과거 이력이다.

<a id="musicxml-troubleshooting--인쇄-가사-수록을-음원-인식-성공에-종속시킴"></a>

#### 인쇄 가사 수록을 음원 인식 성공에 종속시킴

- 증상: 이미 PDF에 인쇄된 가사가 있는데 STT/강제 정렬 실패 때문에 새 가사 패키지 제작을 보류했다.
- 원인: 악보상 마디 귀속과 실제 가창 시작·길이를 혼동했다. 이전 정본 가사의 scorePosition 저장 경로는 재사용 가능하지만 durationQuarters가 필요한 음절 계약에 마디 문구를 억지로 넣으면 가짜 음가를 만든다.
- 해결: history.md의2026-09-19 정본 구현, 현재 model/lyric-score/canonical 경로와 과거 제작 세션을 재확인했다. 개발 세션이 [마디 중앙 가사 계약](../../reference/score/musicxml.md#measure-lyrics--마디-단위-인쇄-가사-계약)을 추가했다. 제작 측은 원본353문자를77마디에 저장하며 기존 음표·음절 리듬은 보존했다.
- 검증: 원본 bbox/경계 대조25줄,13개 읽기 fixture, 문자열 동일, 마디 경계 가로지름0. 새 패키지 XML왕복·XSD·원음원/PDF 보존·실제 공통 renderMeasure77중앙 표시 및 관련31테스트 통과. [현재 가사 제작 기록](loveholic.md#loveholic-lyrics-review--loveholic-인쇄-가사-제작과-과거-시각-시험--2026-10-03) 참조.
- 다음 적용: 인쇄 가사 존재와 음악적 귀속부터 확인한다. 줄 시작번호를 가사 시작으로 쓰지 않는다(이번37번줄→39마디,80번줄→82마디). 명확한 음절 음가가 있으면 기존 계약, 마디만 확인되면 마디 문구 계약을 사용한다. 별도 음원 시각 시험의 미확인을 인쇄 가사 미수록 사유로 사용하지 않는다.

<a id="musicxml-troubleshooting--인쇄-음절-대응과-가창-길이를-혼동함--표준-가사-성부-후속"></a>

#### 인쇄 음절 대응과 가창 길이를 혼동함 — 표준 가사 성부 후속

- 증상: 최초77마디 중앙 가사 수록 후 사용자가 Real Paradis처럼 표준 가사 기능으로 처리하라고 요청했다. 원본에는269단위의 음표/쉼표 underlay 대응이 있다.
- 원인: 인쇄 악보에 따른 표시 성부와 음원에서 측정하는 가창 리듬을 같은 검증 계약으로 취급했다. 기존 매핑 문서의 ‘보컬 악보가 없으면 음원’만으로 읽히는 문구도 이 혼동을 만들었다.
- 해결: history/정본 저장 코드/과거 Real Paradis 실제 수록본과 W3C lyric 표준을 확인했다. 원본 PDF bbox를 실제 음표/쉼표 이벤트에 직접 대응해265단위를 정하고,4개는 명시적 평행 구절 추정으로 구분했다. 독립 DrumPracticeLyrics의 note/lyric/text에269단위를 저장했다. 표시 음가는 기준 음표/쉼표 길이이며 실제 가창 길이로 주장하지 않는다. 매핑 문서 가사 절도 최신 사용자 요청 범위에서 정정했다.
- 검증: 전25줄 시각 대조·15fixture, 원문353문자, XSD4.0·P1 동일·원본 미디어/기존 결과 보존·269개 XML왕복·음원 연결+5초 후 악보 위치 유지·SVG/PDF 각각269개/겹침0. 상세 [표준 가사 제작 기록](loveholic.md#loveholic-lyrics-review--loveholic-인쇄-가사-제작과-과거-시각-시험--2026-10-03) 참조.
- 다음 적용: 먼저 실제 음표/쉼표 underlay 대응이 있는지 본다. PDF가로 간격을 선형 음가로 바꾸지 않는다. 쉼표 기준 위치도 포함한다(79마디 I'm은1박,113마디 다는0박).265직접 대응과48/99/107/109의4추정을 구분한다. 실제 가창 시작/끝은 별도 검증이다.
- 실행 문제: XML왕복의 JSON전체 비교는 속성 순서만 달라도 거짓 불일치를 낸다. 필요한 가사 필드를 순서 고정 서명으로 비교해 해결했다. 공통 파일 HMR 중 일시 Loading error는 자산HTTP200 확인 후 재호출에 성공했으며 정확한 원인은 미확정이다. 공통 렌더러가 병행 변경 중이면 입력XML 검증과 렌더 캐시 완성을 구분하고 개발 세션의 검증 후 새 폴더에 재생성한다.

<a id="musicxml-troubleshooting--svg-음표머리-개수에-쉼표가-포함됨"></a>

#### SVG 음표머리 개수에 쉼표가 포함됨

- 증상: 새 재생 캐시 검수에서 XML음표머리1580개를 SVG의 .vf-notehead 개수와 비교해 실패했다.
- 원인: 이VexFlow 출력은14쉼표에도 .vf-notehead 그룹을 사용한다. 인쇄/재생SVG 모두1594그룹이며1580머리+14쉼표와 일치했다.
- 해결·검증: XML의 unpitched/rest를 분리 세고 SVG그룹은 포함 범위를 명시해 인쇄/재생 동일1594개 확인. XSD·원본XML동일·269가사·half-open20개도 별도로 검증. 근거 `standard-lyrics-final-package-20261003/final-validation.json`.
- 다음 적용: DOM class이름을 음악적 음표머리의 정의로 가정하지 않는다. 그룹·실제 음표·쉼표·꾸밈음의 집계 기준을 맞춘다.

<a id="musicxml-troubleshooting--확정-악기-매핑을-다시-질문함"></a>

#### 확정 악기 매핑을 다시 질문함

- 증상: 1마디 × 위 ○와 이후 원 안 ×의 악기 식별을 사용자에게 다시 질문했다.
- 원인: 최신 확정 범례를 판단 근거로 먼저 적용하지 않았다. 사용자가 이미 문서화한 결정임을 지적했다.
- 해결: 확정 문서의 G5 ×/원 안 ×는 Closed/Open Hi-Hat, F5 ×는 Ride로 적용했다. 과거 미확정 후보와 일반 출판 관례를 실행 기준으로 사용하지 않았다.
- 검증: 전곡 1,580개 머리의 악기 ID·오선 위치·음표머리 XML 재읽기 및 원본 대표 fixture 대조 통과. 근거는 `verification.json`, `final-validation.json`.
- 다음 적용: 질문 전에 확정 범례와 변경 승인 이력을 읽는다. 기존 결정과 실제 원본이 충돌하거나 미결정 항목일 때만 그 차이를 특정한다.

<a id="musicxml-troubleshooting--opus-줄기깃발-좌표-때문에-음가가-맞지-않음"></a>

#### Opus 줄기·깃발 좌표 때문에 음가가 맞지 않음

- 증상: 음악 문자 bounding box/advance와 줄기 끝을 기준으로 잡으면 머리·줄기 결합이나 독립 깃발 인식이 틀렸다.
- 원인: Opus 글꼴의 sidebearing과 실제 잉크/원점 위치가 다르다. 독립 깃발의 문자 원점은 줄기 끝과 같지 않았다.
- 해결: `page.height−char.matrix[5]`를 오선 좌표에 대응시켰다. 머리별 줄기 X 오프셋은 œ=6.665pt, ×=5.115pt, 원 안 ×=6.510pt였다. 독립 깃발 원점의 줄기 끝 대비 Y 오프셋은 약 4.9603pt였다. 실제 빔 사각형·공유 줄기에서 음가와 동시음을 읽었다.
- 검증: 대표 3줄 10마디 평가와 전곡 123마디 모두 4박, 원본 fixture와 재읽기 일치. 코드 `tools/score-production/musicxml/loveholic.py`, 원시 근거 `page-*-objects.json`.
- 다음 적용: 이 수치는 해당 PDF 해시에 묶인 Opus 양식 전용이다. 새 양식에서 다시 측정한다. X간격이나 4박 합을 맞추는 임의 음가 보정으로 해결하지 않는다.

<a id="musicxml-troubleshooting--로컬-musicxml-xsd-import-실패"></a>

#### 로컬 MusicXML XSD import 실패

- 증상: 상위 musicxml.xsd만 읽으면 의존 스키마 import를 해석하지 못했다.
- 해결 근거: 이전 검증 코드 `tools/score-production/musicxml/verify.py`의 `Resolver`가 의존 파일명을 로컬 스키마 폴더로 연결한다.
- 해결: 해당 resolver를 사용하고 `docs/experiments/musicxml/schema/{musicxml,xml,xlink}.xsd`를 함께 읽었다. Loveholic 파서는 `no_network=True`로 검사한다.
- 검증: 대표·전곡·최종 정본 MusicXML 4.0 XSD 통과.
- 다음 적용: 의존 스키마와 기존 resolver를 먼저 확인한다. 검증을 생략하거나 오류를 무시하지 않는다.

<a id="musicxml-troubleshooting--pdf-원본-래스터가-잘리거나-png-한글이-로-보임"></a>

#### PDF 원본 래스터가 잘리거나 PNG 한글이 □로 보임

- 증상: PDFium 원본 3쪽 래스터 일부가 잘렸다. CairoSVG로 만든 악보 PNG에서는 한글이 □로 보였다.
- 원인 구분: 전자는 래스터 경로에서 발생한 잘림이며 세부 라이브러리 원인은 확정하지 않았다. 후자는 CairoSVG 래스터 변환기의 폰트 환경 한계로 실제 Safari SVG와 결과가 달랐다.
- 해결: 원본은 `pdftoppm -r 140 -png`의 Poppler 페이지로 대조해 패키지에 사용했다. 최종 SVG 시각 검수는 실제 Safari에서 수행했다.
- 검증: `source-poppler-{1,2,3}.png`, `safari-page-{1,2,3}.png`. 실제 SVG의 B(후렴)/O(엔딩) 한글 정상 확인.
- 다음 적용: 원본 PDF·XML, SVG, PNG 중 어느 단계에서 문제가 생기는지 분리한다. 한 경로의 실패를 다른 단계의 결함으로 단정하지 않는다. 중간 PNG를 최종 화면 증거로 대신하지 않는다.

<a id="musicxml-troubleshooting--pdf-연습-영역에서-이전-줄-가사-혼입자기-가사-잘림"></a>

#### PDF 연습 영역에서 이전 줄 가사 혼입·자기 가사 잘림

- 증상: 고정 `staff−43…staff+29` 영역은 10마디 자기 가사 아래를 자르고 11마디 위에 이전 줄 가사를 포함했다.
- 원인: 가사와 주법을 포함한 줄별 실제 내용 범위를 고정 높이로 처리했다.
- 해결: 원본 Poppler 래스터에서 이전 가사 뒤의 빈 띠를 찾아 32줄의 상하 경계로 사용했다. 인접 줄은 같은 경계를 공유하고 마지막 줄에서는 자기 가사를 포함하면서 하단 안내문을 제외했다.
- 검증: 모든 머리·빔·자기 줄 가사 포함, 인접 줄 비중첩 검사와 Safari 10→11 직접 대조 통과. `pdf-crop-systems.json`, `safari-pdf-crop-fixed.png` 참조.
- 다음 적용: 세로 줄 경계는 실제 가사·주법을 포함한 범위를 먼저 잡는다. 동일 오선 크기를 맞추려고 상하 내용을 잘라내지 않는다. 이는 줄 앞 타악기 표기·여백의 가로 자르기와 별개다. 그 앞부분의 인쇄 가사·마디 숫자 손실 허용은 [SVG 규칙 §3](../../reference/score/rendering.md#svg-score-rules--3-타악기-음자리표와-세로줄)을 따른다. 표시 배율 개선은 별도 재생 코드 검증으로 다룬다.

<a id="musicxml-troubleshooting--드럼-집중-테스트가-guitar-practice의-동명-테스트도-수집함"></a>

#### 드럼 집중 테스트가 guitar-practice의 동명 테스트도 수집함

- 증상: Vitest 파일명 필터가 하위 프로젝트의 동명 파일을 수집해 `tests/local-fixtures/drum-demo/song.json` 경로 오류가 났다.
- 원인: 필터는 저장소 루트의 특정 파일 경로만을 의미하지 않았고 하위 테스트도 포함했다.
- 해결: `npx vitest run --exclude 'guitar-practice/**' tests/local-media/musicxml.test.ts tests/local-media/canonical-xml.test.ts tests/local-media/score-package.test.ts`로 드럼 범위를 지정했다.
- 검증: 관련 3파일·35테스트 통과. 별도 하위 프로젝트는 변경하지 않았다.
- 다음 적용: 실패 테스트의 소속과 실제 수집 목록을 먼저 확인한다. 제외 실행의 범위를 보고하고 전체 저장소가 통과했다고 표현하지 않는다.

<a id="musicxml-troubleshooting--생성용최종-xml-파일명이-macos에서-충돌함"></a>

#### 생성용·최종 XML 파일명이 macOS에서 충돌함

- 증상: `loveholic.musicxml`과 `Loveholic.musicxml`을 다른 파일로 취급해 최종 내보내기 사본이 재생성 시 바뀌었다.
- 원인: 현재 파일시스템에서는 대소문자만 다른 두 경로가 같은 파일이었다. `Path.samefile()`로 확인했다.
- 해결: 최종 이름을 `Loveholic-final.musicxml`로 고정했다. 생성용 `loveholic.musicxml`, 정본 `canonical.musicxml`과 실제로 다른 이름을 사용한다.
- 검증: 최종 XML과 패키지 XML 원시 바이트 일치. 최종 XML SHA256 `1dfbd34e7325be0dc61e69b2c4080d71baafc2590bdf2c56056b3fbc7fe29063`, 패키지 SHA256 `e94f9e2a54ab584061778a8db3f8418e92247774d15a1d3fc632bf19a8347916`. `final-validation.json` 참조.
- 다음 적용: 역할별 파일명은 대소문자뿐 아니라 접미사로 구분한다. 재생성 후 최종 파일과 패키지 내용의 해시를 다시 대조한다.

<a id="musicxml-troubleshooting--줄별-마디-구성과-줄-앞-타악기-표기의-과거-결정-대조"></a>

### 줄별 마디 구성과 줄 앞 타악기 표기의 과거 결정 대조

2026-10-03 사용자 요청에 따라 `history.md` → SVG 규칙 등 관련 문서 → 과거 세션의 사용자 원문을 대조했다. 사용자 결정의 출처를 웹의 일반 관례로 대신하지 않았다. 대상 세션은 `01a0afc9-ca21-7371-9390-06eb07c017e9`이며 이전 변환 세션 `01a0b7de-deef-7572-8833-02cf6080ddb1`도 조회했다.

| 시각(KST) | 확인한 사용자 원문·적용 범위 |
|---|---|
| 2026-09-19 02:04:02 | “반복되는 시작 세로줄과 여백을 함께 잘라내고, 마디 번호는 유지” 승인. 후속 원본 확인에서 `||`는 타악기 음자리표로 식별됐다. 당시 첫 마디 Intro 보존 예외도 구현 기록에 남았다. |
| 2026-09-21 01:46:57 | 전체 SVG에 “페이지 나눔”, “맨 줄의 첫 시작 마디”, “한줄에 들어가는 마디”를 PDF와 동일하게 요구. “한줄에 4마디가 들어가야 한다 → 폐기”라고 명시했다. |
| 2026-09-21 09:33:37 | 두 줄 재생 화면의 좌우 드래그·스크롤 삭제 요청. 당시 화면의 “4마디 고정보기가 깨져서” 불편하다는 설명이 있었다. 전체 SVG 줄 구성과 적용 화면이 달랐다. |
| 2026-10-03 중간 해석 — 철회 | 두 줄 재생도 원본 줄 구성을 따른다고 기록했으나 사용자가 명시적으로 정정했다. 실행 기준으로 사용하지 않는다. |
| 2026-10-03 최종 정정 | 두 줄 보기는 4마디. 전체 SVG 출력은 원본 줄별 마디 구성. PDF 보기에서는 타악기 표시·여백 스킵 중 인쇄 가사·마디 번호 잘림 허용. 원본 PDF·MusicXML 보존. |
| 2026-10-03 후속 확정 | “타악기 표시 자르기를 하고, 그걸 하면서 가사나 숫자가 잘려도 괜찮다”를 최신 결정으로 기록하라고 명시했다. 이 자르기에는 과거의 마디 번호 유지 조건보다 최신 결정이 우선한다. |

- 원인: 전체 SVG의 원본 줄 구성, 재생 화면의 과거 4마디 고정, PDF 상하 crop의 가사 보존, 줄 앞 가로 자르기를 범위 없이 읽으면 서로 다른 결정이 섞인다.
- 확인 한계: “가사·마디 숫자가 잘려도 괜찮다”는 과거 사용자 원문은 이번 조회에서 찾지 못했다. 오늘의 명시적 요청을 최신 기준으로 기록하며 과거에도 동일한 허용이 확인됐다고 소급하지 않는다.
- 해결: 두 줄 재생의 4마디 고정을 현재 규칙으로 복원하고 전체 SVG 원본 줄 구성과 분리했다. PDF 줄 앞 가로 자르기 허용은 상하 프레임 보존과 구분했다.
- 검증 범위: 사용자 원문·history·정본 문서 대조 및 문서 diff 검사. 이번 결정 조회는 공통 재생 코드나 악보 패키지 변경·화면 검증을 포함하지 않는다.
- 재발 방지: 새 곡의 원본 시스템별 시작/끝 마디를 먼저 확인한다. 전체 SVG에 재생 화면의 4마디 고정을 적용하지 않는다. Real Paradis 전용 15pt 자르기 수치를 다른 곡에 추정 적용하지 않는다. 자르기를 구현할 때 표시 영역·박 좌표·진행선을 함께 검증한다.

<a id="musicxml-troubleshooting--2026-10-03-반열림-전용-기호와-pdf-표시-경계-해결"></a>

### 2026-10-03 반열림 전용 기호와 PDF 표시 경계 해결

<a id="musicxml-troubleshooting--half-muted-보존만으로는-타악기-주법이-출력되지-않음"></a>

#### half-muted 보존만으로는 타악기 주법이 출력되지 않음

- 증상: 원본 원 안 ＋ 20개가 XML에는 있지만 SVG에는 없었다.
- 원인: MusicXML half-muted의 기본 기호는 금관악기용 brassMuteHalfClosed다. OSMD 2.1.2와 2.2.0의 공식 ArticulationReader 모두 half-muted 분기가 없었다. XML 요소의 유효성과 렌더러 지원은 별개다.
- 근거 확인: 확정 매핑·SVG 규칙과 과거 제작의 원생 미지원 사례를 읽은 뒤, [공식 SMuFL 타악기 주법 표](https://www.w3.org/2021/03/smufl14/tables/percussion-playing-technique-pictograms.html)의 pictHalfOpen1(U+E7F6) 및 [MusicXML smufl 속성](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/half-muted/)을 확인했다.
- 해결: half-muted에 `smufl="pictHalfOpen1"`을 명시한다. 개발 세션이 공식 Bravura 글리프 경로를 해당 표기에만 보완했다. 일반 도형 대체가 아니며, 다른 half-muted를 일괄 변경하지 않는다.
- 제작 검증: 후보는 20개 속성 외 XML 트리 차이 없음. 새 패키지 전곡 XSD·123마디/492박/1,580머리 재읽기, SVG 20/20 출력, 실제 브라우저 확대 대조 및 원본 PDF/MP3 바이트 보존 통과. 기존 산출물은 보존했다.
- 다음 적용: 공식 의미·전용 기호·폰트 라이선스를 먼저 확인한다. OSMD 원생 지원과 앱 보완을 구분한다. 새 XML과 패키지의 출력 개수 및 내용 보존을 함께 검사한다.
- 상세 해시·환경·파일: [Loveholic 후속 제작 기록](loveholic.md#loveholic-conversion--2026-10-03-반열림-표기-해결-및-새-패키지), 공통 구현·Safari 검증은 [개발 세션 기록](../../reference/score/rendering.md#pdf-display-trim--pdf-연습-화면-표시용-자르기).

<a id="musicxml-troubleshooting--다른-곡의-pdf-자르기-좌표를-재사용할-수-없음"></a>

#### 다른 곡의 PDF 자르기 좌표를 재사용할 수 없음

- 증상: Real Paradis의 15pt 표시 자르기를 Loveholic에 그대로 적용하면 첫 음악 기호 손실 여부를 보장할 수 없다.
- 해결: 원본 해시에 묶인 구조를 다시 읽어 32개 줄의 타악기 표시와 가장 가까운 보호 기호 사이 경계를 구했다. 첫 줄 65.18531113141441pt, 나머지 31줄 68.3631315438144pt다.
- 제작 검증: 4/4·첫 음표·실제 마디선 보존, 오선 외 잉크 경계 검사, 32줄 시각 대조, 원본 페이지에서 박 좌표 유지 통과. PDF variant 123개 원본 영역 fingerprint와 함께 개발 세션에 전달했다.
- 다음 적용: 실제 PDF·MusicXML을 잘라 저장하지 않는다. 정확한 원본 영역이 일치할 때만 재생기의 표시용 자르기를 적용하고 진행선 좌표도 검증한다. 다른 곡에 좌표를 추정 적용하지 않는다.

<a id="musicxml-troubleshooting--재현-명령이-초기-산출물을-덮어쓸-수-있음"></a>

#### 재현 명령이 초기 산출물을 덮어쓸 수 있음

- 발견: 초기 재현 예제의 출력 경로가 보존된 결과 폴더를 가리켰다. 최종 검증에서는 새 폴더를 사용했지만 안내 자체를 수정해야 했다.
- 해결: Loveholic CLI는 생성 대상 파일이 이미 있으면 추출·쓰기 전에 거부한다. 제작 문서의 재현 명령은 provenance/Poppler만 준비한 새 폴더를 사용한다.
- 검증: 원본에서 새로 생성한 extracted.json은 초기 자료와 같고 XSD/fixture/5개 오류 주입 검사를 통과했다. 동일 출력 재실행은 코드 2로 거부하며 전 파일 해시가 유지됐다.
- 다음 적용: 원본·이전 결과·교정 전 결과를 보존한다. 새 렌더링·메타데이터 검증은 새 폴더로 수행하고 기존 결과를 조용히 교체하지 않는다.

<a id="musicxml-troubleshooting--zip-미디어를-파일-확장자로-찾을-수-없음"></a>

#### ZIP 미디어를 파일 확장자로 찾을 수 없음

- 증상: PDF/MP3 확장자로 ZIP 항목을 찾는 재검사에서 미디어 존재 assertion이 실패했다.
- 원인: 패키지의 실제 파일은 `alternates/0/source`, `audio/source`처럼 확장자 없는 경로다. MusicXML 정본은 manifest의 canonicalXML 문자열에도 있다.
- 해결·검증: `manifest.json`의 otherScores/source/audio 경로와 canonicalXML 계약으로 읽어 원본 PDF/MP3 및 최종 XML 바이트 일치를 확인했다. ZIP CRC·원본/초기/새 결과 해시 모두 유지.
- 다음 적용: 저장 계약을 먼저 읽는다. 파일명 추정 실패를 데이터 손실로 보고하지 않는다. manifest 전체의 canonicalXML·가사·대용량 배열을 로그에 출력하지 않고 필요한 키·해시만 출력한다.

<a id="musicxml-troubleshooting--2026-10-03-문서-모순범위-정리"></a>

### 2026-10-03 문서 모순·범위 정리

범위는 지침·변환 정책·확정 매핑·SVG 규칙·곡별 제작/비교·통합 기록이다. 악보 의미·파일·앱 구현은 이번 문서 정리에서 변경하지 않았다.

| 헷갈리거나 모순된 안내 | 확인 근거 | 수정 |
|---|---|---|
| words 스티킹이 승인됐는데 앞 절은 여전히 보류로 안내 | history.md의 2026-09-20 검수 교정 → 사용자 최종 승인 → 메인 앱 적용, 매핑 문서의 후속 기록 | 현재 R/L 절에 words 단일 저장과 타격별 배치를 명시. 승인 전 보류는 과거 이력으로 구분 |
| 고스트 “OSMD 미지원”이 앱에서도 안 보인다는 뜻으로 읽힘 | 같은 날 history의 앱 보완 적용, 매핑/SVG 규칙, src/modules/score/drum-notation.ts | 원생 처리 미지원과 승인된 앱 괄호 보완을 분리. 승인 단계의 “검수 화면만 적용”에 당시 시점을 명시 |
| 모든 조사에서 보정 없는 출력만 허용하는 것처럼 읽힘 | 사용자 승인된 고스트/스티킹 보완과 SVG 출력 정본 | 새 항목의 원생 지원 조사와 이미 승인된 앱 보완 적용을 구분 |
| SVG의 “현재 곡” 페이지 1–36/37–76/77–110을 새 곡에도 적용할 수 있음 | history.md의 2026-09-21 Real Paradis 줄별 정정, Loveholic 제작 기록의 1/37/80 시작 | 곡명·마디 수·검증 날짜를 명시하고 Loveholic 별도 배치를 연결 |
| “이번 악보”, 당시 HEAD/clean/테스트 수가 현재 전체 상태처럼 읽힘 | history의 변환·비교·통합 기록, 과거 제작 세션의 인계, 현재 checkout 별도 확인 | 정책의 비교 근거에 Real Paradis를 명시. 비교/통합 문서에 역사적 기록임을 표시 |
| 긴 곡별 제작 문서에서 완료와 미확정·후속 개선이 섞임 | Loveholic 제작/배포 문서와 history의 작업 범위 분리 | 상단에 완료·출력 한계·미확정·후속 작업 표를 추가. 제작 당시 증거임을 명시 |

과거 세션 `01a0b7de-deef-7572-8833-02cf6080ddb1`의 인계와 작업 디렉터리 경고 대응을 재조회했다. 실제 프로젝트 보존·통합 완료와 삭제된 과거 작업 트리 경로를 구분했고, 과거 후보 매핑이 최신 승인 규칙을 덮어쓰지 않는 원칙을 대조했다. 승인/앱 적용의 구체 순서는 위 history와 프로젝트 정본에서 확인했다.

웹은 2026-10-03 W3C MusicXML 4.0 공식 자료를 대조했다. [notehead](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/notehead/)는 parentheses 속성을, [words](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/words/)는 일반 텍스트 지시를, [half-muted](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/half-muted/)는 원 안 ＋ 기호와 기본 brassMuteHalfClosed 글리프를 설명한다. 표준 요소의 존재만으로 특정 OSMD 버전의 출력 지원이나 하이햇 전용 승인 규칙을 확정하지 않았다.

다음 적용: 문서에는 현재 실행 기준을 먼저 보여주고 과거 이력에 시점·곡·버전·적용 범위를 붙인다. 승인된 의미나 검증 수치를 임의로 바꾸지 않는다. 후속 구현이 진행 중이면 과거 한계를 조용히 완료 상태로 바꾸지 않는다.

<a id="musicxml-troubleshooting--2026-10-03-loveholic-pdf-가사-중앙-표시와-음표-좌표-차이"></a>

### 2026-10-03 Loveholic PDF 가사 중앙 표시와 음표 좌표 차이

- 증상: 제작 패키지에269단위 표준 가사가 있어도 실제 앱은77개 중앙 문구를 표시했다. 로컬 수록 파일이 이전 결과였고 제작 검수만으로 실제 수록을 완료로 판단했다.
- 확인: 최신 가사 제작 문서·패키지/수록 ZIP·공통 표시 계약을 대조했다. 실제 앱 업데이트/저장/재열기 전후를 별도로 검증했다. 새 매핑이나 웹 조사는 필요하지 않았다.
- 추가 원인: PDF 정수박/줄기 보간은 대응 음표 중심과 최대7.8446 CSS px 차이. 표시1px 테두리와 crop 너비의 차이, 일반 겹침 회피 이동도 정확한 대응을 바꿀 수 있었다.
- 해결: 원본 식별·region geometry·lyricId/quarterOffset에 묶인269개 PDF 표시 좌표를 추가했다. 음악적 가사 위치와 XML·미디어는 유지했고, crop 변환과 실제 crop px 너비로 적용했다. SVG/편집된 위치는 기존 fallback. 이전 수록본은 별도 보존했다.
- 검증: 실제 Safari 수록 업데이트·재열기269/중앙0, 전269문자 일치·최대0.0973px,25–32마디0.023px 미만.77파일362테스트/TypeScript 통과. 상세 경로·해시는 [PDF 가사 위치 수정](loveholic.md#loveholic-pdf-lyric-placement--loveholic-pdf-가사-위치-수정--2026-10-03).
- 다음 적용: 산출물 생성/캐시 시험/실제 수록·저장·재열기/공개 배포는 각기 검증한다. PDF 대응 음표 좌표를 일반 진행선의 박 보간으로 대신하지 않는다. 다른 PDF에 좌표를 재사용하지 않는다.

<a id="musicxml-troubleshooting--pdf-검수-러브홀릭-103마디에서-중단-2026-10-21"></a>

### PDF 검수: 러브홀릭 103마디에서 중단 (2026-10-21)

밀집된 음표·빔 때문에 마디 하나의 래스터 오선 검출이 실패했다. 일반 연습 화면은 같은 인쇄 줄 전체에서 검출했지만 검수 경로가 이를 사용하지 않았다. 검수도 동일 페이지·y·높이의 PDF 영역을 합쳐 검사하고 결과를 공유하도록 수정했다. 검출 임계값 완화나 특정 곡/마디 좌표 하드코딩은 사용하지 않았다. 실제 패키지123마디, Safari103마디 표시, 오선 없는 영역의 실패 보존을 검증했다. 다음 적용 시 마디별 검출 실패를 원본 악보 오류로 단정하지 말고 동일 인쇄 줄의 검출 결과와 비교한다. 상세: [PDF/MusicXML 검수](../../decisions/0005-practice-layout-and-spacing.md#이관-원문--score-reviewmd--9).

<a id="score-process-evidence--loveholic-comparison"></a>

## 제작 프로세스 정리 당시 경험과 근거 — 2026-10-04

출처: `docs/records/SCORE-PROCESS-EVIDENCE.md`의 두 곡 비교표 중 이 곡의 행. 당시 경험과 교훈이며 현재 정본·수록 상태·새 검증 결과가 아니다.

| 경험 | 실제 근거 | 다음 곡에 적용할 기준 |
|---|---|---|
| Loveholic 다른 글꼴/좌표·영역 | [제작 기록](loveholic.md#loveholic-conversion--loveholic-pdf--musicxml-작업): 대표3줄→123마디492사분음표 길이·1580머리14쉼표. Opus 원점/빔/깃발·겹세로줄, PDF 세로 영역/Poppler 교정 | bbox/원점/잉크를 구별. 글꼴별 수치·crop은 원본에 묶고 새 곡에서 재측정 |
| 제작 초기의 악기 오분류와 후속 승인 | [확정 매핑 후속 기록](../../reference/score/notation.md#score-musicxml-osmd-mapping--2026-10-03-최종-재확인-모든-곡에-확정-범례-적용), history의 ‘공통 악보 범례 복구’·‘범례 적용 범위 정정’: Loveholic Y89개 Crash로 교정. 킥 강제 성부 분리는 최종 결정에서 철회 | 초기 제작 문서/fixture가 현재 승인을 대신하지 않음. 악기 의미와 성부 구성·표시 정책을 구분하고 최신 승인 이력까지 확인 |
| half-muted 의미 보존과 출력 미지원 | Loveholic 초기20개 미표시 → 공식 `pictHalfOpen1`·승인 앱 보완으로20/20 검증. [매핑의 공식 경로](../../reference/score/notation.md#score-musicxml-osmd-mapping--반열림-하이햇의-공식-표기-경로) | XML 저장·OSMD 원생 지원·앱 보완 출력을 별도 확인. 임의 일반 도형으로 숨기지 않음 |
| 인쇄 underlay와 가창 시간 혼동 | [가사 기록](loveholic.md#loveholic-lyrics-review--loveholic-인쇄-가사-제작과-과거-시각-시험--2026-10-03):353문자269단위,265직접 대응·48/99/107/109마디4추정. STT/CTC/LRC의 과거 시험 | 악보 우선. 실패한 음원 가사 정렬을 제작 완료의 선행 조건으로 삼지 않음 |
| 최신 패키지가 실제 수록에 미반영 | [PDF 가사 수정](loveholic.md#loveholic-pdf-lyric-placement--loveholic-pdf-가사-위치-수정--2026-10-03): 옛77중앙 문구 발견, 실제269개 저장·재열기. 표시 보간 최대7.8446px → 전269대응 최대0.0973px 미만 | 패키지 생성과 수록/저장/재열기 검증 분리. 음악적 위치와 PDF 표시 anchor 분리 |
| 음원 추정과 청취 근거 차이 | Loveholic 첫 박0.193초·실연136.232BPM 추정, 인쇄136 유지. 국소 위상·피크와 청취 오차 구분 | 초/중/끝 드리프트와 경쟁 위상 확인. 신호 목적함수를 정확도·청취 검증으로 보고하지 않음 |

두 곡을 함께 확인한 당시 해시·수록 메타정보와 미확인 범위는 [공동 제작 관측](../production-tools.md#score-process-evidence--확인한-자료와-현재-미확인-사항--2026-10-04)에 한 번 보존한다.
