# 탐탐 무빙 연습 제작

2026-10-06. 새로 작곡한 앱 전용 기본 연습곡. 최초 source-02 음원은 절차적 합성이고, 이후 사용자 요청으로 MIDI와 설치된 GarageBand SoCal Kit 샘플을 사용한 MP3를 별도로 만들었다. 영상 채보·영상 음원 추출 작업이 아니다.

**현재 산출물:** SoCal MP3가 연결된 `garageband-package-01/tom-moving-final.musicxml`과 `tom-moving.drumscore`를 사용한다. 같은 패키지가 public 및 기존 dist/player에 반영되어 있다. 사용자 최신 요청으로 이전 절차적 WAV/MP3와 이를 담은 구형 패키지·백업은 삭제했다. 아래 이전 음원 보존·해시·검증·재현 경로는 당시의 기록이며 현재 파일 존재를 뜻하지 않는다. MusicXML·MIDI·구성표·검증 기록은 유지한다.

**현재 음원 재현 입력:** GarageBand 일반 키트 라이브러리를 프로젝트 `local-libraries/garageband-drum-kits/`에 해시 검증하여 복사한 뒤, 사용자 결정으로 SoCal·Portland 두 키트만 남겼다. 현재 `render_socal_toms.py`는 이 복사본만 사용한다. 앱·시스템 원본이 없고 나머지 키트를 삭제한 상태에서도 재생성 WAV/MP3 해시가 기존 결과와 일치했다. 보존 범위·실행 조건·한계는 [라이브러리 보존 기록](GARAGEBAND-DRUM-KITS.md#프로젝트에-보존한-라이브러리--2026-10-06)을 따른다. 아래 설치 경로는 최초 제작의 출처 기록이다.

## 2026-10-06 MIDI 추가

사용자의 MIDI 제작 요청에 따라 기존 MusicXML의 P1에서 Standard MIDI File 1을 별도로 생성했다. 파일은 docs/experiments/tom-moving-20261006/midi-01/tom-moving.mid, 근거는 같은 폴더 midi-audit.json이다. 기존 MusicXML·WAV/MP3·재생 패키지는 교체하지 않았다.

- 80BPM·4/4·16마디·192타격, PPQ480, 템포/구간 트랙과 드럼 트랙의2트랙. General MIDI 채널10, 고음 탐50/중음 탐47/플로어 탐43. 음표 시작과 note-off를 악보의 시작·음가로 기록하고 A–D 마커를 보존했다. R/L 조판은 MusicXML에 유지하며 MIDI 표준 손 지시로 바꾸지 않았다.
- MIDI 첫 음표는 악보의1마디 첫 박인0초이며, 음악적 끝은48초다. DAW에서 마디 격자로 편집하기 위한 출력이다. 기존 WAV는 첫 박 앞0.25초와 끝 잔향을 보존한49.05초 파일이므로 MIDI와 WAV를 직접 겹치려면 MIDI의 첫 박을 WAV0.25초에 놓는다. 기존 앱의 firstBeat는 변경하지 않았다.
- scripts/musicxml/tom_moving_midi.py는 표준 라이브러리로 이 검증된 단일 성부 탐 악보를 출력한다. 새로운 출력 파일에만 쓰며 같은 이름은 덮어쓰지 않는다. 재현: `python3 scripts/musicxml/tom_moving_midi.py --xml docs/experiments/tom-moving-20261006/final-02/tom-moving-final.musicxml --out docs/experiments/tom-moving-20261006/midi-01/tom-moving.mid` (이 경로는 이미 생성되어 재실행하면 거부; 재생성은 새 파일명 사용).
- 별도 프로젝트 임시 venv의 mido1.3.3으로 재읽어 헤더·2트랙·템포·박자·192 note-on/off·악기별48/84/60개·마커·끝48초와 source-02/composition.json의 전체 시작/음가/velocity가 일치함을 검사했다. 재생성 바이트도 일치했다. 실제 DAW 가져오기·MIDI 음색 청취는 수행하지 않았다. MIDI는 녹음된 음색 자체를 저장하지 않으며 재생 장치의 드럼 음원을 사용한다.

## 최초 제작의 목표와 범위

- 목표: 세 가지 탐의 이동을 단계별로 연습할 MusicXML·음원·완성 패키지를 제작한다.
- 범위: 생성 스크립트, 새 악보/합성 음원/패키지, 공통 렌더 검수와 인계 근거.
- 완료 조건: 16마디·4/4·80BPM, 확정 탐 매핑·R/L, XML 규격/왕복·192타격/음원 시각 일치, 실제 공통 조판/패키지 검수.
- 제외: 사용자 정정에 따라 인쇄용 PDF 생성 제외. 영상 패턴 복사, 타인 녹음/샘플 이용, 앱 수록·UI 수정·commit/push/발행.
- 검증: 이벤트/독립 기대값·MusicXML XSD·음원 샘플 시각·반복 생성·패키지 왕복·실제 SVG 화면 대조. 기기 청취는 수치 검사와 구분한다.

## 참고와 새 자료의 구분

참고 링크: https://www.youtube.com/watch?v=ZUTH2p9C-YM . 제목 ‘드럼기초 탐무빙의 비밀: 연주하기전에 이것부터 연습하세요’, 채널 ‘탁선생의 쿵치타치 : 드럼기초레슨’. 초기 웹 본문 열기는 `Online fetch throttled`였지만 사용자 승인 후 Safari MCP에서 설명·챕터·한국어 자동 생성 스크립트 및 대표 재생 프레임을 직접 확인했다. 따라서 현재 확인 상태는 ‘제목만 확인’이 아니다. 제목만 확인한 초기 구성은 source-01에 보존했다.

| 영상 구간 | 직접 확인한 교육 내용 | 새 연습곡 반영 |
|---|---|---|
| 00:47–01:19 | 오른손만으로 8분 이동, 이어 왼손만으로 이동 | A: R만/L만 교대 마디 |
| 01:20–02:06 | 일정한 오른손 사이에 왼손을 더해 16분으로 확장 | B: R/L 16분 교대 |
| 02:07–03:00 | 8분 하나+16분 둘 및 16분 둘+8분 | C/D: 두 혼합 리듬 |
| 03:01–05:37 | 발로 4분 박 추가, 자유로운 이동·천천히 연습 | 이번 악보는 세 탐과 손 연습에 한정; 발/킥은 추가하지 않음 |

자동 스크립트에는 음표 명칭 오인식이 있다. 설명의 음표 명칭·챕터·문맥과 함께 대조했다. 정확한 영상 타격 순서를 전사했다거나 영상 전곡을 청취했다고 주장하지 않는다. 대표 재생 프레임의 실제 확인 시각은 약98.88초·147.73초·55.68초이며 로컬 reference-review에 보존했다. 초기 seek 직후 스크린샷은 영상이 아직 썸네일이거나 이전 프레임일 수 있어 타격 근거로 사용하지 않았다.

새 악보는 아래 독립 구성표에서 만들었다. 최초 source-02 음원은 같은 이벤트 목록에서 절차적으로 합성했고 외부 악보/영상 프레임/연주 녹음/드럼 샘플을 포함하지 않았다. 이후 GarageBand 라이브러리 사용 요청은 아래 별도 기록의 범위다. 원본 생성 입력·이전 시도·최종 해시를 별도 보존한다. 이번에는 Safari 스크립트와 명시적 이벤트가 있어 로컬 STT/AFM은 필요하지 않다.

## 구성

80BPM / 4/4 / 16마디 / 64사분음표 길이 / 48초 연주. 첫 박은 파일0.25초, 후미0.80초를 보존해 WAV 전체49.05초. 음원에 준비 카운트/메트로놈을 굽지 않는다. 앱의 클릭·카운트오프를 사용한다.

| 구간 | 마디 | 음가 | 독립 구성 |
|---|---|---|---|
| A - 한 손 이동 | 1–4 | 8분×2/박 | R만/L만/R만/L만; 매 박 두 타 후 이동 |
| B - 양손 이동 | 5–8 | 16분×4/박 | R/L/R/L; 매 박 네 타 후 이동 |
| C - 앞을 길게 | 9–12 | 8분+16분+16분/박 | R/R/L; 오른손은 8분 간격 |
| D - 뒤를 길게 | 13–16 | 16분+16분+8분/박 | R/L/R; 오른손은 8분 간격 |

각 구간의 네 마디 이동 경로는 H-M-F-M, F-M-H-M, M-F-H-M, H-F-M-F로 새로 구성했다. H=고음 탐, M=중음 탐, F=플로어 탐. 각 마디의 네 박에 한 경로를 적용하며 해당 박의 모든 타격을 같은 탐에서 연주한다. 총 R112/L80. B/C/D에서 오른손의 시작은 모두 반 박 간격이다.

단일 성부·일반 음표머리·위 기둥. Tom1=E5 / Tom2=D5 / Tom4(Floor)=A4를 확정 매핑대로 사용한다. GM0-based50/47/43, MusicXML midi-unpitched51/48/44. 음원은 각각 기본 주파수180/135/90Hz의 감쇠/피치하강·배음·짧은 노이즈로 만든다. 전 타격 velocity76, 임의 악센트는 추가하지 않았다. 첫 타의 attack 샘플과 음악적 이벤트 시작을 맞춘다. 가사·보컬 음높이·킥·스네어는 없다. 앱 canonical 작성기는 저장 계약에 따라 가사가 없는 독립 DrumPracticeLyrics에 전마디 쉼표를 자동 생성하며, 드럼 음표 수는 P1만 센다.

## 실행·검증·인계

기본 제작 정본: [전체 프로세스](SCORE-PRODUCTION-PROCESS.md), [매핑](SCORE-MUSICXML-OSMD-MAPPING.md), [SVG](SVG-SCORE-RULES.md), [패키지](SCORE-PACKAGE.md).

### 검증된 결과

- source-02와 최종 canonical: MusicXML4.0 XSD, 16마디·64사분음표·192타격·R112/L80, 박별 혼합 음가 독립 fixture 통과. 음가/악기/손/오선 위치 오류 주입 4개 모두 검출. reproduction-02로 MusicXML/WAV/MP3/구성 JSON을 다시 생성해 바이트와 SHA256 일치. 최종 ZIP CRC·XML/WAV 내장 바이트도 원본과 일치.
- WAV: stereo PCM16 44,100Hz, 49.05초, 첫 박0.25초 이전 비영 샘플0, 최대 진폭0.77997, 타격 시각 샘플 반올림 오차 최대0.01134ms. Safari AudioContext의 실제 WAV 디코딩 길이49.05초. 음원에는 카운트오프를 굽지 않았다.
- 공통 renderer/package: Safari27.0.1에서 1 SVG·16 regions·data-sticking192개 확인, 전체 Song/XML/WAV 바이트 보존 왕복 통과. makeCycle의 OFF/ON×0.75/1/1.25배 6가지에서 첫 박 기대 시각 일치. 수치 scheduling 검사이며 실제 청취 검사가 아니다.
- 실제 브라우저 prepareBrowserScore 경로에서도 P1의192타격과 마디 시각 유지. normalizeDrumScore는 note 자식 순서를 재배열해 XML 공백/직렬화가 달라질 수 있으므로 의미 필드·시간표를 비교한다.

### 개발 소유자에게 넘길 표시 문제와 미검증

Safari 전체 SVG 화면에서 일부 R/L이 빔 아래·줄기 옆에 나타났다. SVG 규칙은 ‘줄기/머리 중 높은 위치보다9 SVG 단위 위’이며 data-sticking192개는 모두 존재한다. 현재 src/drum-notation.ts는 stem path.getBBox()로 높이를 얻는다. 빔에 연결된 줄기의 실제 끝점과 이 bbox의 차이가 원인 후보이며 수정/재검증은 재생 앱 개발 작업의 범위다. 음가·탐·손 순서가 누락된 문제가 아니다. 근거: final-02/safari-score.png와 osmd-render/page-1.svg. 이번 작업에서는 앱 소스와 SVG 정본 규칙을 바꾸지 않았다.

패키지 생성·왕복과 공통 표시 검수까지 수행했다. 기존 보관함에는 쓰지 않았다. 앱 기본 제공 수록·저장/재열기·실제 카운트오프 청취·음질 주관 검수·iPad 재생은 개발 소유자의 다음 검수다. 실제 청취/정확한 영상 채보 완료로 보고하지 않는다.

### 재현과 산출물

- Python 런타임: /Users/raphael/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3. lxml/numpy 및 ffmpeg libmp3lame 사용.
- 새 출력 폴더로 `scripts/musicxml/tom_moving.py --out <새 폴더>` 실행. 기존 폴더이면 거부한다. source-01/02·reproduction-02·최종 출력을 덮어쓰지 않는다.
- 검증 실행: `scripts/musicxml/tom_moving_verify.py --dir docs/experiments/tom-moving-20261006`. 초기 검증기가 모든 part의 마디를 합산해 실패한 것을 P1만 검사하도록 교정했다. 이는 가사가 있는 악보에서도 기존 제작 정책의 드럼 파트 길이 기준을 그대로 적용해야 하는 이유다.
- localhost Vite5173과 `scripts/musicxml/tom_moving_evidence_server.py --out <새 폴더> --port 5188`를 준비하고 Safari에서 `scripts/musicxml/tom_moving_package.mjs`의 build를 호출했다. helper는 고정 source-02 입력에 대한 재현 도구이며 DB에 쓰지 않는다.
- 최종 악보: docs/experiments/tom-moving-20261006/final-02/tom-moving-final.musicxml.
- 최초 패키지/음원(후속 사용자 요청으로 삭제): final-02/tom-moving.drumscore 및 source-02/tom-moving.wav/mp3. 현재 패키지는 문서 맨 앞의 현재 산출물을 따른다.
- 근거: final-verification-02.json, source-02/generation-audit.json, final-02/package-audit.json, final-02/osmd-render/render.json 및 화면. 로컬 산출물은 Git 제외, 스크립트·본 문서·프로세스·history만 소스/문서 변경이다. 인쇄 PDF·재생 HTML·commit/push/발행 없음.

## 2026-10-06 웹앱 수록 및 표시 보정
- public/scores/tom-moving.drumscore와 bundled-scores 목록에 기본 연습곡으로 추가. 기존 두 사용자 악보와 구분해 ‘기본 연습곡’ 문구를 표시한다.
- 빔 줄기가 음표 SVG 그룹 밖에 있어 getBBox 조회가 비던 문제를 실제 VexFlow 줄기 좌표로 교정. 전체 악보 R/L192개와 Safari 재생 화면의 줄기 위 표시를 확인했다. 캐시 정책 v21-sticking-stem.
- 제작 원본 final-02는 보존. 수정된 공통 렌더러로 prepareBrowserScore→createScorePackage를 수행한 수록본 SHA256: 9967d9b5a6e280e35f48de13973cbdac18393c8da9c5a19a393e162be6ce21c9. 내장 audio/source 바이트와 BPM/첫 박/마디 시간/마커 유지 확인. ZIP CRC 통과. dist/player 패키지도 같은 해시.
- 로컬 Safari5174에서 불러오기→저장→열기 및 페이지 재로딩 후 재열기를 확인. 16마디/80BPM과 A–D 바로가기 표시. 증거 .tmp/tom-moving-app-review/playback.png.
- 전체461테스트, TypeScript, i18n, 제작기/연습실 분리 빌드·경계 검사 통과. 재생 버튼 조작 후 진행 시간0초로 남아 실제 ON/OFF 재생 검수는 통과로 처리하지 않음. 음질 청취와 실물 iPad 검수도 미완료. 카운트오프 설정을 true로 복구하고 목록으로 복귀.
- 수록은 로컬 소스/빌드까지만 적용. 버전 상승·commit/push/발행 없음.
- 재생 추가 진단: 해당 Safari 세션에서 AudioContext.resume 호출 직전 state=suspended였고 promise가 완료되지 않았다. 악보 로드 ready=true 이후 오디오 컨텍스트 시작을 기다리는 상태임을 확인. 자동화/브라우저 정책 등 구체적 원인은 확정하지 않았다. 진단용 resume 래퍼는 복구하고 재생 세션을 닫았다.

## 2026-10-06 GarageBand 사운드라이브러리로 MP3 제작

사용자 요청에 따라 이 Mac에 설치된 GarageBand 10.4.14의 **SoCal Kit 실제 탐 녹음 샘플**로 새 음원을 만들었다. 기존 MusicXML·GM MIDI·source-02 음원·앱 수록 패키지를 보존했다. GarageBand 앱의 프로젝트 bounce가 아니라 설치된 샘플과 EXS 구간 정보를 사용하는 CLI 렌더링이다. GarageBand의 Drum Kit Designer 엔진·채널 이펙트·마스터 이펙트를 동일하게 재현한 결과로 해석하지 않는다.

### 확인한 입력과 연결

- GarageBand 앱 내부 `Contents/Resources/Patches/Instrument/Drum Kit/SoCal.patch/#Root.cst`에서 `SoCal Kit.exs` 참조를 확인했다. 공유 사운드 폴더가 Logic이라는 이름으로 설치되어 있어도 이 앱 패치가 해당 키트를 직접 참조한다.
- EXS: `/Library/Application Support/Logic/Sampler Instruments/03 Drums & Percussion/04 Drum Kit Designer/Drum Kit Designer/Stereo/SoCal Kit.exs`.
- 녹음: `/Library/Application Support/Logic/EXS Factory Samples/Drum Kit Designer Consolidated/Drum Kit Designer/Stereo/SoCal Kit Toms_consolidated.caf`. 44,100Hz stereo. 프리셋과 CAF·패치 해시는 `garageband-02/render-audit.json`에 기록했다. 설치된 원본은 읽기만 했다.
- 기존 MIDI의 192 note-on을 mido1.3.3으로 읽어 `garageband-01/midi-events.json`에 기록했다. MIDI 첫 박0초를 음원0.25초에 놓아 기존 악보/앱의 첫 박과 맞췄다.

| 원본 GM MIDI | EXS 내부 키 | 이름 | velocity76에 해당하는 원본 CAF 프레임 구간 | 타격 수 |
|---|---|---|---|---|
| 50 | 48 | TomHi | 13209600–13253700 (끝 제외) | 48 |
| 47 | 47 | TomMidHi | 9262080–9306180 (끝 제외) | 84 |
| 43 | 43 | TomLo | 4928512–4972612 (끝 제외) | 60 |

SoCal EXS에는 키50 zone이 없고 고음 탐 zone은 키48이다. 위 연결은 이번 **음색 재생에만** 적용하며, 승인된 MusicXML/GM 악기 표기 정본과 원본 MIDI를 변경하지 않았다. root/fine/coarse/pan, velocity 범위, one-shot·loop·group 조건을 확인한 구간만 사용했다. 추정으로 CAF 전체를 하나의 타격으로 재생하지 않는다.

### 막힌 경로와 해결·다음 적용 기준

1. Apple `AVAudioUnitSampler.loadInstrument(at:)`의 EXS 지원을 공식 API 문서와 설치 SDK에서 확인하고 오프라인 렌더링을 시험했다. 첫 probe는 엔진에 노드를 붙이기 전에 load해 `_engine != nil` 예외로 종료했다. 엔진 attach 이후 호출해야 한다.
2. attach→connect→load 및 attach→load→connect 모두 이 SoCal 프리셋에서 `com.apple.coreaudio.avfaudio -10868`을 반환했다. 연결 순서 수정으로 해결되지 않았고, 이 프리셋의 정확한 실패 원인은 미확정이다. 다른 EXS나 모든 GarageBand 악기까지 지원 불가라고 일반화하지 않는다. 실패 Swift와 입력은 `garageband-01`에 보존했다.
3. EXS zone/CAF 구간을 직접 확인해 설치된 세 탐 샘플을 혼합했다. 원본 EXS의 zone gain(-6/-7dB), 동일 velocity76/127, stereo를 적용하고 전체 피크를 -3dBFS로 맞췄다. zone 끝이 비영 샘플이라 마지막20ms만 감쇠해 끝 클릭을 줄였다. 전 타격이 one-shot이므로 MIDI note-off로 녹음 잔향을 끊지 않았다. GarageBand의 전체 envelope/효과 체인은 재현하지 않았다.
4. 시스템 `python3`에는 numpy가 없어 probe가 실패했다. 기존 번들 Python/numpy로 해결했으며 전역 패키지를 설치하지 않았다.

다음에는 먼저 실제 앱 패치와 샘플 존재·프리셋 load 가능 여부를 확인한다. 네이티브 로드에 성공하면 해당 경로를 사용한다. 동일 실패면 검증 가능한 zone/구간과 필요한 음색 범위가 있는지 확인한다. 이번 renderer는 탐3종·velocity76·192타격 전용이며 새 곡의 모든 악기/주법 지원으로 일반화하지 않는다. 전체 GarageBand 믹스가 필요한 경우 GUI 승인 범위를 확인하고 앱에서 따로 bounce한다.

근거: [Apple EXS 로드 API](https://developer.apple.com/documentation/avfaudio/avaudiounitsampler/loadinstrument(at:)), [Apple 오프라인 오디오 처리](https://developer.apple.com/documentation/avfaudio/performing-offline-audio-processing). EXS 바이트 필드는 제작자 저장소의 [renoise-exs24 parser](https://github.com/matt-allan/renoise-exs24/blob/main/exs.lua)와 [EXS24 format reference](https://github.com/asatamax/tonverk-elmulti-converter/blob/main/docs/EXS24_FORMAT_SPEC.md)를 대조했다. 외부 코드를 실행하지 않고 관련 필드만 독립 구현했으며 참고 사본은 실험 폴더에 보존했다.

### 산출물·검증·재현

- 새 MP3: `docs/experiments/tom-moving-20261006/garageband-02/tom-moving-socal.mp3`. 50.25초, stereo44,100Hz, MP3 192kbps, **1,207,678bytes**. SHA256 `e5aedf61f5723decba9c68aa835f319ee95be19ac29d4ef4db1fb69bc046ef8e`.
- PCM24 WAV: 같은 폴더 `tom-moving-socal.wav`. SHA256 `9919436a8da1029408e153f8d431357c6347a6edf87c4074dd4c5a55cf23e499`.
- 최종 MusicXML P1의16마디·64사분음표·192타격과 입력 MIDI의 전체 시작 프레임/악기가 일치. 전 일정은0.25초를 기준으로 유지했다. WAV 첫 비영 샘플0.250022676초, 첫 박 앞11,025프레임 무음, 마지막1초 무음. 전체 길이는2,216,025프레임이고 MP3 디코딩 길이도50.25초.
- WAV 피크0.7079457, MP3 디코딩 피크0.689616, 유한 샘플·클리핑 없음. WAV/MP3 파형 상관0.999899. 별도 `garageband-reproduction-02` 재생성에서 두 파일 바이트/해시 일치. 근거 `garageband-02/verification.json`, `render-audit.json`.
- 수치 검사와 실제 청취는 구분한다. 이번 실제 기기 청취·GarageBand GUI export는 수행하지 않았다. 앱 패키지/수록 음원을 자동 교체하지 않았다.
- 재현: 기존 번들 Python으로 `scripts/musicxml/render_socal_toms.py --events docs/experiments/tom-moving-20261006/garageband-01/midi-events.json --out <새 폴더>` 실행. 기존 출력 폴더이면 거부한다. numpy/ffmpeg가 필요하며 설치된 SoCal EXS/CAF를 읽는다.
- 출력/실패 근거는 Git 제외 대상. 앱 소스·버전·빌드번호 수정, 인쇄 PDF/재생 HTML 생성, GUI 실행, commit/push/발행 없음. 다른 개발 작업의 변경을 보존했다.

## 2026-10-06 SoCal MP3를 악보 음원으로 교체

- 사용자 요청: 방금 제작한 SoCal Kit MP3를 탐탐 무빙 악보의 음원으로 사용한다.
- 범위: 현재 표시 보정이 적용된 `public/scores/tom-moving.drumscore`의 음원 및 연결 메타정보. 기존 `dist/player/scores/tom-moving.drumscore`에도 같은 새 자산을 반영했다. 앱 로직·악보 음표·표시 조판을 수정하지 않았다.
- 보존: 교체 전 수록본과 기존 player 빌드 자산을 `docs/experiments/tom-moving-20261006/garageband-package-01/previous-tom-moving.drumscore` 및 `previous-dist-tom-moving.drumscore`로 보존했다. 두 이전 파일의 SHA256은 `9967d9b5a6e280e35f48de13973cbdac18393c8da9c5a19a393e162be6ce21c9`다. source-02/final-02/원본 MIDI는 교체하지 않았다.
- 실제 공통 `readScorePackage` → `writeCanonical` → `createScorePackage` → `readScorePackage` 경로를 사용했다. audioName은 `tom-moving-socal.mp3`, MIME은 `audio/mpeg`, 내장 음원1,207,678bytes, XML 음원 해시는 `e5aedf61f5723decba9c68aa835f319ee95be19ac29d4ef4db1fb69bc046ef8e`로 연결했다. 과거 ‘외부 녹음 없음’ rights 문구를 새 음원 출처에 맞게 갱신했다.
- 새 패키지 SHA256: `0030b4c53d65b678981bb0272425694fd9353be9d03393fe1cfd8da36429e9b3`, 크기1,322,418bytes. 새 독립 최종 XML·패키지는 `garageband-package-01/tom-moving-final.musicxml`, `tom-moving.drumscore`에 저장했다.
- 검사: P1 전체 XML 동일, SVG 자산 바이트 동일, 전체 Song에서 audioName만 변경, 곡ID·16마디·80BPM·첫 박0.25초·마디시간·A–D마커·설정·반복 유지. XML4.0 XSD, 새 음원 hash 검증, 패키지 왕복·ZIP CRC, public/dist 내장 MP3 동일. countoff OFF/ON ×0.75/1/1.25배 ×파일 처음/첫 마디/9마디의18가지 수치 시각 검사 통과. 근거 `garageband-package-01/package-audit.json`.
- 집중 테스트: `npx vitest run tests/score-package.test.ts tests/canonical-xml.test.ts tests/practice-library.test.ts --exclude 'guitar-practice/**'`, 3파일36개 통과. 초기 필터 실행은 별도 guitar-practice의 동명 테스트도 수집해 기존 fixture ENOENT9개가 발생했다. 문서화된 제외 범위를 적용해 드럼 테스트만 다시 실행했으며 guitar 프로젝트는 변경하지 않았다.
- Safari MCP `list_tabs`는 `Transport closed`; CLI로 확인한 Safari는 미실행(-600)이었다. 승인된 로컬 검수 범위에서 ego-browser로5173을 사용했다. 브라우저 공통 API로 저장된 새 음원 이름/MIME/bytes/SHA·16마디·첫 박을 재조회했고 AudioContext MP3 디코딩50.25초를 확인했다. 재생 활성 상태와 진행 시각은 실제 청취와 구분한다. 상세 후속 결과는 `browser-playback.json`과 아래 기록을 따른다.
- 생성/교체 helper는 `.tmp/tom-socal-package/replace.mjs`; 공통 모듈을 esbuild로 묶어 Node/jsdom에서 실행했다. esbuild define에 괄호 표현식은 허용되지 않아 JSON 리터럴로 교정했다. helper 사본은 실험 폴더에 보존했다. 출력 폴더는 새로 생성하며 public 교체 직전 이전 해시를 재확인해 다른 작업의 동시 수정은 덮어쓰지 않는다.
- `node scripts/build-info.mjs` 실행. 앱 버전 상승·전체 웹앱 재빌드·인쇄PDF/독립재생HTML·commit/push/발행 없음. 기존 다른 개발 변경·연습자료 보존.

### 이번 교체의 브라우저 검수 결과

- ego5173에서 새 기본 제공 악보를 불러온 뒤 저장된 MP3 hash 검증·디코딩과 표시를 확인했다. 페이지 재로딩 후 다시 열어 `tom-moving-socal.mp3`, audio1,207,678bytes, firstBeat0.25, P1음표192개를 재확인. 화면 근거 `garageband-package-01/player.png`, build842fd479/v0.6.30.
- countoff OFF·파일 처음에서 재생 버튼 조작 후 실제 진행이 `1/16 · 0:01 / 0:50`으로 바뀌었다. 일시정지 버튼 뒤 상태 변경 대기는3초 timeout이었다. 앞선 같은 검사도4초 timeout이었다. 버튼에 대응하는 native 동작·앱/도구 원인을 확정하지 않았다. 음원 교체 실패나 음원 시각 불일치라고 판단할 근거는 없다.
- ON 및 첫 마디/중간 마디에서의 실제 진행 비교는 이 지점에서 미검증으로 남겼다.18가지 수치 시각 검사는 통과했지만 실제 재생 검수와 동일하지 않다. 주관적 음질·기기 청취는 이번에 수행하지 않았다.
- 종료 전 countoff를 기존true로 복구하고 내 악보 목록으로 돌아가 재생 컨텍스트를 닫았다. 재열기 확인 후 목록으로 복귀하고 검수 TaskSpace1을 정상 종료했다. 사용자 소유 다른 악보와 브라우저 설정을 삭제/정리하지 않았다.

## 2026-10-06 이전 음원 삭제 — 최신 사용자 결정

사용자가 ‘기존 음원 삭제하라. 보존할 가치가 없다’고 명시했다. 이 곡의 이전 음원 보존 결정을 종료하고 파일을 직접 삭제했다. 휴지통 이동이나 새 백업은 만들지 않았다.

- source-01/source-02/reproduction-02의 `tom-moving.wav`·`tom-moving.mp3` 6개 삭제.
- 이전 WAV가 내장된 final-02 패키지, .tmp/tom-moving-app-review 패키지, garageband-package-01의 previous/previous-dist 백업 패키지 4개 삭제.
- 합계10개·59,364,417bytes. 대상은 삭제 직전 경로·해시·곡ID·내장 음원으로 식별했으며 Git 추적 파일은 아니었다. 목록/해시와 삭제 검증은 `docs/experiments/tom-moving-20261006/previous-audio-deletion.json`에 기록했다.
- 현재 SoCal WAV/MP3 및 재생성본, 새 최종·public·dist 패키지, 모든 기존 MusicXML·MIDI의 해시 불변을 확인했다. 세 현재 패키지의 CRC 및 내장 SoCal MP3 해시를 다시 확인했다.
- 과거 합성 음원 생성기·검증기·패키징 helper는 제작 이력으로 유지한다. 그 helper가 요구하는 구형 음원/패키지는 이제 존재하지 않으므로 과거 전체 검사 명령을 현재 완료 검사로 사용하지 않는다. 구형 음원을 자동 재생성하거나 보존 정책으로 되살리지 않는다.
- 다른 곡 음원·악보, 설치된 GarageBand 라이브러리, 앱 소스/버전, 다른 개발 변경은 건드리지 않았다. commit/push/발행 없음.
