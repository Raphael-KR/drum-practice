# 탐탐 무빙 연습 제작

## 현재 결과 — 원본 기본 연습 교정 + Portland 음원 (2026-10-06)

사용자 최신 요청은 원본 영상에 맞게 악보를 교정한 뒤 **교정 이벤트의 음원**을 Portland로 만드는 것이다. 아래 과거 독립 작곡·SoCal 제작 기록은 보존 이력이며 현재 수록본이 아니다.

- 목표: 스네어 누락·임의 경로를 고치고 원본 기본 연습의 음가·손·이동 및 오른발 박을 반영한 MusicXML과 Portland MP3를 제작한다.
- 범위: 영상00:47–03:50의 기본 연습, 제작 스크립트/fixture, 새 음원·MIDI·패키지, 로컬 기본 제공 악보 및 실제 Safari 검수.
- 완료 조건: 원본 타격 근거→교정 기대값→MusicXML 재읽기→동일 이벤트 Portland 렌더→공통 조판·패키지/보관함 재열기 일치.
- 제외:04:00 이후 자유 즉흥과06:11 쿠키 연주 전곡 채보, 원본 영상 녹음의 결과물 재사용, 인쇄 PDF·독립 HTML, commit/push/공개 배포.
- 검증: 아래 원본 연속 프레임·음향 근거, MusicXML4.0 XSD·336이벤트·오류 주입, 재생성 바이트, 실제 SVG·패키지·Safari 저장/재생 검사. 주관적 청취·실물 iPad는 별도 미검증이다.

### 원본 대조와 교정 내용

원본 [탁선생의 탐무빙 기초 레슨](https://www.youtube.com/watch?v=ZUTH2p9C-YM), ID ZUTH2p9C-YM, 412.621초. Safari27.0.1에서 실제53.6초 프레임을 확인했다. 이번 교정에는 공개 영상 스트림·한국어 자동 자막을 로컬 분석용으로 확보하고 `source-review-03`에 원본/해시/로그를 보존했다. 영상과 녹음은 완성 악보·Portland 음원·패키지에 넣지 않았다.

**판독 결과: 스네어(S) → 중간 탐(M, Tom2) → 높은 탐(H, Tom1) → 플로어(F).** 한 악기에서 한 박의 리듬을 친 다음 이동한다. 화면 왼쪽의 큰 랙 탐은 M이고, 오른쪽의 작은 랙 탐은 H다. 큰 랙/작은 랙을 카메라 좌우만으로 바꾸지 않는다. 원본의 오른손·왼손 한 손 연습 모두 같은 경로다. 종전 HMFM/FMHM/MFHM/HFMF 임의 경로를 제거했다.

| 패턴 | 음가/손 | 대표 한 마디의 원본 공격 앵커(초) | 교정 반영 |
|---|---|---|---|
| R8 | 8분 둘, RR |52.74–55.54|SSMMHHFF|
| L8 | 8분 둘, LL |68.72–71.33|SSMMHHFF|
| 양손16분 |16분 넷, RLRL|96.32–98.99|SSSSMMMMHHHHFFFF|
| 앞을 길게 |8분+16분 둘, RRL|144.22–146.84|SSSMMMHHHFFF|
| 뒤를 길게 |16분 둘+8분, RLR|173.16–175.51|SSSMMMHHHFFF|
| 오른발 추가 |위 세 리듬+4분 킥|187.96–190.04 설명,191–230 시연|매 박 GM36 킥·아래 줄기 voice2|

공격 앵커는 음원에서 찾은 근사 시각이다. 연속 프레임에서 악기/손을 대조했다(`one-hand-sheet.png`, `both-sheet.png`, `mixed-sheet.png`, `foot-sheet.png`). 52.74–55.54의 반복되는 음원 스펙트럼과 타격 간격으로 두 타 후 이동을 교차 확인했다. 자동 자막의 팔부분/밟음표 오인식은 화면·음가 그림·챕터와 대조하여8분으로 읽었다. 121초 설명과 실제 시연대로 오른손8분 한 바퀴 다음에 왼손을 삽입한다. 제목이나 자막만으로 타격을 확정하지 않았다.

대표 원본 기대값은 `scripts/musicxml/fixtures/tom_moving_video.json`이다. 실제 영상의 미세한 템포 변동·말하는 공백·시연 반복 횟수 전체를 그대로 재생하는 파일은 아니다. **기본 연습 패턴을 옮기고, 각 준비/적용 두 마디를 두 번 반복한28마디·일정80BPM**으로 정리했다. 80BPM·반복 길이·4마디씩 줄 구분은 연습용 편집 선택이며 영상의 문자 그대로인 전체 채보로 부르지 않는다. 즉흥 시연의 임의 이동을 기본 경로로 덮어쓰지 않는다.

### 현재 구성과 산출물

| 구간 | 마디 | 구성 |
|---|---|---|
|A|1–4|R8→L8, 두 번|
|B|5–8|R8→RLRL16분, 두 번|
|C|9–12|R8→RRL 혼합, 두 번|
|D|13–16|R8→RLR 혼합, 두 번|
|B+|17–20|B+오른발4분|
|C+|21–24|C+오른발4분|
|D+|25–28|D+오른발4분|

28마디·112사분음표·84초 음악 길이. 손288타격(R208/L80), S/M/H/F 각72개, 킥48개, 총336개. 승인 표기 S=C5/GM38, M=D5/GM47, H=E5/GM50, F=A4/GM43, K=F4/GM36. 손은 각 음표 위 R/L, 킥은 별도 voice2·아래 줄기이며 손 문자를 붙이지 않는다.

- 정본 MusicXML: `docs/experiments/tom-moving-20261006/corrected-package-01/tom-moving-final.musicxml`, SHA256 `7eb59bd1f2fef3dd7a526ef5dbe70190653a51ca148b314a2e1d90b879ae9788`.
- Portland MP3: `docs/experiments/tom-moving-20261006/portland-01/tom-moving-portland.mp3`, SHA256 `b4c2e8de8a4ce808d53dadeaf8386c348bbee6d747cec5a3265ef5f330e69f3d`, 2,071,605bytes, stereo44.1kHz/192kbps·86.25초.
- 재생 패키지: `docs/experiments/tom-moving-20261006/corrected-package-01/tom-moving.drumscore`, SHA256 `1eb7214b7e637ece8a0a97772ede30a28ca145df261742482f386b8c419b9c2e`. 같은 바이트를 로컬 `public/scores/tom-moving.drumscore`에 반영했다.
- 원본 교정 XML·MIDI·구성/이벤트표: `corrected-01/`. MIDI는 첫 음표0초, PPQ480/SMF0, GM 채널10·336타격; 음원과 겹칠 때 MIDI 첫 박을0.25초에 놓는다.
- 이전 SoCal 패키지: `corrected-package-01/previous-socal-tom-moving.drumscore`에 별도 보존했고 과거 source/SoCal 파일을 삭제하지 않았다.

마디 구조가16→28로 바뀌므로 song ID를 `tom-moving-video-v2`로 바꿨다. 기존 `tom-moving-original-v1` 연습 기록을 새 마디에 잘못 이식하지 않는다. 기존 배포 dist/player는 갱신하지 않았다. 앱 버전0.6.31은 유지하고, 로컬 목록 변경에 따른 소스 빌드번호는 `cd680bd033cf`로 갱신했다.

### Portland 선택과 재현

사용자 지정 키트이며 [키트 선택 정본](GARAGEBAND-DRUM-KITS.md)을 확인했다. GarageBand 앱이나 `/Library/.../Logic` 원본을 읽지 않고 프로젝트 보존본의 Portland patch/EXS/CAF만 해시 검증해 사용했다. GM36/38/47/43은 같은 EXS key, 고음 탐 GM50만 EXS key48로 연결한다. 악보/MIDI의 승인 GM 번호는 유지한다. velocity76의 각 악기에 유일한 zone을 확인했다. 그룹은 Bd1/Sn2/TomMidHi/TomHi/TomLo이고 샘플은 Portland Kit Kick/Snare/Toms_consolidated.caf다.

EXS의 정확한 시작/끝 프레임·zone gain을 사용한 stereo one-shot 믹스다. 끝20ms fade, velocity/127, 전체 peak -3dBFS. GarageBand 프로젝트의 EQ/컴프레서/공간 효과까지 복제한 bounce는 아니다. 원본 유튜브 음향이 아니라 이 **교정 이벤트**에서 새로 렌더한 Portland 녹음 샘플이다.

최종 재읽기/오디오/패키지 검사는 `tom_moving_corrected_verify.py --root docs/experiments/tom-moving-20261006`로 재실행하며 `corrected-final-verification.json`에 기록한다. 재현은 기존 폴더를 덮어쓰지 않고 새 출력 폴더로 실행한다.

```sh
/Users/raphael/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/musicxml/tom_moving_corrected.py --out docs/experiments/tom-moving-20261006/corrected-new
/Users/raphael/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/musicxml/render_portland_exercise.py --events docs/experiments/tom-moving-20261006/corrected-new/midi-events.json --out docs/experiments/tom-moving-20261006/portland-new
```

브라우저 패키지 helper는 이번 검증 입력/port5190에 한정된 `tom_moving_corrected_package.mjs`다. 실제 localhost5173 공통 renderer/package API를 사용한다. 재현할 때 입력 폴더와 새 evidence 수신 폴더/port를 함께 지정한다. 구형 `tom_moving.py`·`tom_moving_package.mjs`는 과거 독립 구성용이며 교정본 생성에 쓰지 않는다.

### 검증과 해결 기록

- 원본/교정 의미: 위 다섯 대표 마디의 악기·손·음가·시작 fixture를 XML 재읽기와 비교. 전체28마디의 킥 성부·박 합계·오선 위치·336타격 및 MusicXML4.0 XSD 통과. 음가/악기/손/좌표/backup5개 오류 주입 모두 검출.
- 재생성: `corrected-reproduction-01`의 XML·MIDI·이벤트/구성 JSON, `portland-reproduction-01`의 WAV/MP3가 각각 바이트와 해시까지 일치. renderer는 XML에서 재읽은 공격 목록과 events가 다르면 거부하며 옛192타격을 새 음색만으로 바꾸지 않는다.
- 음원: WAV/MP3 모두 decoded86.25초. WAV0.25초 이전 비영 샘플0, 첫0.001 이상 공격0.250068초. peak WAV0.707946/MP30.687901, clipping 없음. 음원에 카운트오프를 굽지 않았다. EXS/CAF source 해시와 zone/이벤트 근거는 `portland-01/render-audit.json`.
- 공통 앱 경로: 1전체SVG·28regions·R208/L80, 7시스템의 실제 Safari 화면에서 줄기/빔 위 손 표시와 아래 킥 성부 확인, 경고0. 전체 Song/XML/audio 왕복·ZIP CRC·canonical XSD 통과. `prepareBrowserScore`→package 재읽기/audio검증에서도28마디·336타격·손/성부·시간표 유지.
- 첫 박:0.25초, 카운트오프 OFF/ON×0.75/1/1.25배×음원0/첫 마디/중간 마디18경우 수치 검사 통과. 실제 청취의 박 일치는 수치 검사와 구별한다.
- 실제 Safari 연습실: 기본 악보 불러오기→저장→열기에서28마디/80BPM/Portland 내장 해시와7구간 바로가기 확인. 페이지 재로딩 후 저장된 악보·동일 음원 해시를 재조회하고 다시 열었다. ON 준비 표시 후 진행률0:02까지 실제 재생 전진 확인. OFF 첫 마디0:03, OFF/ON17마디0:50까지 각각 재생 진행을 확인하고 ON·첫 마디·일시정지 상태로 복원했다. 주관적 음질·청취·실물 iPad는 검증하지 않았다.
- TypeScript noEmit 통과. 관련 Vitest7파일64테스트 통과(`--exclude 'guitar-practice/**'`와 대상6경로). 첫 명령에서 제외 옵션을 빠뜨려 별도 guitar fixture경로 실패20건을 수집했다. 다른 프로젝트는 변경하지 않고 범위를 바로잡아 재실행했다.

**막힘 해결:** 이전 Safari browsing context가 없어졌을 때 목록이 빈 것을 확인하고 원본 URL을 다시 열었다. 자막 패널 loading/빈 fetch를 완전한 스크립트로 간주하지 않고 공개 ASR VTT를 로컬로 확보했다. 정지 프레임만으로 반복 수를 정하지 않고 분석용 음원 공격 시각과 연속 영상 프레임을 연결했다. 브라우저 작업을 fire-and-forget import로 시작했을 때 result/progress가 없던 시도는 성공으로 처리하지 않았고, awaited import/build로 산출물을 실제 수신·재읽어 검증했다. 다음 영상에서도 실제 시각·프레임/음향 근거→기대값→XML/음원을 분리해 기록한다.

Apple 로컬 STT/AFM은 검토했으나 이번에는 완전한 한국어 자막을 확보했고 타격 의미는 모델의 언어 출력으로 확정할 수 없어 새 실험을 넣지 않았다. 새 Apple 실측/발견이 없어 팀장에게 반복 보고하지 않았다.

**교정 전 2026-10-06 원본 재검토 기록:** 당시 수록본은 영상의 실제 기본 연습을 충실하게 옮긴 악보가 아니다. 스네어를 빠뜨리고 세 탐의 이동 경로를 임의로 작곡했다. 아래 192타격·해시·규격 검사는 해당 임의 구성의 내부 일치 검사이며 영상 일치 검사가 아니다. 이번 재검토에서는 차이와 교정 기준을 기록했으며 MusicXML·음원·수록 패키지 수정 완료로 처리하지 않는다.

## 2026-10-06 원본 재검토와 확인된 차이

- 목표: 사용자 지적에 따라 원본 유튜브를 다시 확인하고 현재 수록 MusicXML과의 차이를 확인한다.
- 범위: 승인된 Safari MCP의 동일 영상, 제작 코드·기록, 현재 public 수록 패키지의 MusicXML.
- 완료 조건: 실제 원본 근거와 현재 파일의 차이를 대응시켜 기록한다.
- 제외: 이번 재검토를 근거로 확인하지 않은 타격 순서를 새로 확정하거나, 음원·패키지를 자동 교체하거나, 앱 개발·발행을 수행하지 않는다.
- 검증: seek 완료·실제 시각·화면을 확인한 원본 프레임, 화면 자막·리듬 삽입 그림, 현재 MusicXML 악기·음표 집계 및 기존 코드 대조.

원본: [탁선생의 탐무빙 기초 레슨](https://www.youtube.com/watch?v=ZUTH2p9C-YM). 00:47–01:19의 한 손 연습, 01:20–02:06의 왼손 추가 설명·시연, 02:07 이후 두 혼합 리듬과 03:01 이후 오른발 박 추가 설명을 Safari에서 다시 확인했다. 전체 연주를 음향으로 듣고 모든 타격을 전사한 검토는 아니다.

| 원본에서 확인한 내용 | 현재 악보와의 차이 | 근거 |
|---|---|---|
| 스네어와 세 탐을 오가는 한 손 이동 시연 | 현재 P1에는 탐1 48개·탐2 84개·플로어 탐60개뿐이며 스네어가 없다. 스네어를 제외한다는 사용자 확정 근거 없이 제작자가 세 탐으로 축소했다. | reference-review-02의 52.8초·53.25초·54.75초·55.25초 및 왼손68.5–71.3초 프레임, 현재 패키지 XML |
| 오른손의 동일한 8분 박을 유지하고 사이에 왼손을 추가하며 오른손 이동을 따라가는 설명 | 음가 종류와 오른손 박 간격은 반영했지만, 이동을 HMFM/FMHM/MFHM/HFMF 네 경로로 임의 변경했다. 원본의 이동을 검증한 결과가 아니다. | 92초·121초·139초 설명 프레임, tom_moving.py composition() |
| 양손16분, 8분 하나+16분 둘, 16분 둘+8분 리듬과 뒤쪽의 오른발 박 추가 연습 | 앞의 리듬 종류는 있으나 손·악기 이동의 원본 대응은 별도 검증이 필요하다. 발 연습은 이전 제작자가 제외한 범위이며 영상 전체 연습을 포함한 결과가 아니다. | 151초·165초 리듬 그림, 191초 오른발 설명 |

**원인:** 교육 개념을 읽은 뒤 사용자의 영상 기반 악보 요청을 독립 작곡 모드로 처리했다. 대표 프레임 확인을 실제 타격 순서의 판독·독립 fixture로 연결하지 않았다. 생성 이벤트와 XML의 내부 일치·반복 생성·해시 일치가 원본 충실도를 보증한다고 해석하면 안 된다.

**다음 교정 기준:** 먼저 스네어를 포함한 각 기본 연습의 실제 타격 수·음가·이동 순서·R/L을 연속 프레임 및 필요한 음향 근거로 판독해 원본 기대값을 만든다. 대표 정지 화면의 손 위치만으로 타격 순간·반복 횟수를 확정하지 않는다. 독립 작곡과 영상 패턴 정리는 별도 요청 모드로 구별하며, 사용자가 원본 기반 제작을 요구하면 임의 작곡으로 바꾸지 않는다. 발 연습의 포함 여부와 연습용 템포·반복 길이는 원본 재현 내용과 구별한다. XML이 바뀌면 음원·MIDI·패키지도 같은 교정 이벤트에서 검증한다.

근거: `docs/experiments/tom-moving-20261006/reference-review-02/source-comparison.json`과 같은 폴더의 원본 화면. 현재 수록본 SHA256 `0030b4c53d65b678981bb0272425694fd9353be9d03393fe1cfd8da36429e9b3`을 재확인했다. 스크립트 패널은 loading 상태였고 관찰한 한국어 자막 URL의 fetch는 HTTP200/빈 본문이므로 전체 스크립트 재조회 성공으로 보고하지 않는다. 버퍼링 중인129초 화면은 자막 설명만 참조하며 타격 근거로 쓰지 않는다. requested89초→실제61.03초였던 화면 및 seeking=true인188초 화면은 타격 근거에서 제외했다.

## 아래 기록의 범위

아래는 기존 임의 구성의 제작·검증 이력이다. 원본 충실도에 관한 현재 판정은 위 재검토 결과를 따른다.

2026-10-06. 새로 작곡한 앱 전용 기본 연습곡. 최초 source-02 음원은 절차적 합성이고, 이후 사용자 요청으로 MIDI와 설치된 GarageBand SoCal Kit 샘플을 사용한 MP3를 별도로 만들었다. 영상 채보·영상 음원 추출 작업이 아니다.

**교정 이전 산출물(보존):** SoCal MP3가 연결된 `garageband-package-01/tom-moving-final.musicxml`과 `tom-moving.drumscore`를 사용한다. 같은 패키지가 public 및 기존 dist/player에 반영되어 있다. 사용자 최신 요청으로 이전 절차적 WAV/MP3와 이를 담은 구형 패키지·백업은 삭제했다. 아래 이전 음원 보존·해시·검증·재현 경로는 당시의 기록이며 현재 파일 존재를 뜻하지 않는다. MusicXML·MIDI·구성표·검증 기록은 유지한다.

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
