# 시작전 손플기 — 독립 손 준비 연습곡

사용자 결정: 2026-10-06. 제목은 요청한 **시작전 손플기** 그대로 사용한다.

- 목표: 기존 탐탐 무빙 16마디판을 대체할, 한 번의 연주로 연결되는 새 손 준비 곡을 작곡한다.
- 범위: 원곡과 별개의 96마디 MusicXML, 같은 이벤트의 MIDI·SoCal MP3와 재생 패키지.
- 완료 조건: 양손·악기별 타격 균형, 완만한 이동/밀도 진행, 규격·음원·패키지 재읽기와 실제 SVG 검수.
- 제외: 앱 기능 개발·배속/반복 설정 지시·인쇄 PDF·HTML·자동 커밋·배포. 기존 16/28마디 자료를 보존한다.
- 검증: 독립 작곡 명세와 마디/박/손/악기 대조, MusicXML 4.0 XSD, MIDI 재읽기, 샘플 매핑/음원 길이, 공통 renderer/package 왕복, 실제 SVG.

## 작곡 의도와 명세

전곡 4/4·80 BPM, 96마디·384박·4분48초. 템포 변경이나 외부 반복 없이 아래 순서를 한 번 연주한다. R/L은 실제 손 지정이다. 부드럽고 고른 타격과 자연스러운 반동을 유지하도록 첫 부분에 지시를 넣는다. 신체가 충분히 풀렸는지는 개인·환경에 따라 다르므로 전체 숙련도의 신체 효과를 실측했다고 주장하지 않는다.

| 마디 | 단계 | 리듬·이동 의도 |
|---|---|---|
| 1–16 | A. 한 곳에서 준비 | 스네어 오른손/왼손 각각 8타, 이후 교대 8분음표 |
| 17–32 | B. 손 순서 정리 | 스네어 더블·패러디들 8분음표, 2박에만 짧은 16분음표 4타 |
| 33–48 | C. 가까운 탐 이동 | 먼저 S↔H, H↔M, 뒤에 S→H→M→F와 역방향; 탐을 건너뛰지 않음 |
| 49–64 | D. 짧은 밀도 확장 | 1–2박 16분음표, 3–4박 8분음표; 악기마다 한 박 유지 |
| 65–80 | E. 혼합 리듬 연결 | 8분+16분+16분 / 16분+16분+8분; RRL/LLR·RLR/LRL 균형 |
| 81–96 | F. 정리 | 8분음표로 탐 순회 후 스네어 4분음표로 마무리 |

매 두 마디가 같은 악기/음가의 반대 손 시작 쌍이다. 양손 총량뿐 아니라 각 악기의 R/L 수가 같아야 한다. 음표·손·음가의 명세는 `scripts/musicxml/fixtures/preplay_warmup.json`에 명시한다. 이것은 원본 영상 채보가 아닌 사용자 요청에 따른 독립 작곡이다. 쉼표/악센트·킥/하이햇 협응을 필수 과제로 추가하지 않는다. 음악적 밀도 감소 구간으로 연결한다.

## 음원과 표기

키트는 현재 보존된 **SoCal**을 선택한다. [키트 소개/선택 정본](GARAGEBAND-DRUM-KITS.md)에 따른 자연스러운 범용 키트이며, 이번 곡의 고른 스네어/탐 타격 확인과 기존 16마디판의 음색 연속성에 맞춘 선택이다. Portland와 청취 우열 비교를 했다는 뜻은 아니다.

S=C5/GM38, H=E5/GM50, M=D5/GM47, F=A4/GM43. SoCal 내부 하이 탐 key48은 음원 adapter에서만 쓰고 MusicXML/MIDI의 GM50은 유지한다. 가수·세션·강사 이름은 넣지 않으며 이번 신규 독립 연습곡의 artist는 비워 둔다. 키트는 음원명/설명에 기록한다. 기존 16/28마디 artist 예외를 새 곡으로 확대하지 않는다.

부드럽게·고르게라는 지시와 R/L은 표준 MusicXML direction/words, 악기는 승인 범례를 사용한다. 원음원 없는 독립 연습곡이므로 가사나 가상 보컬 파트가 필요하지 않다. 렌더러는 앱 공통 API를 이용한다.

## 참고 근거

[Mark Wessels / Vic Firth, A Fresh Approach to the Drumset — Lessons 1–2](https://ae.vicfirth.com/wp-content/uploads/FA-Drumset-Lessons-1-2.pdf)의 반동·이완, 양손의 고른 소리, 한 손 8타·반대 손 시작 원칙을 참고했다. 공개 교재의 연습 페이지를 복제한 곡이 아니다. 마디별 전개와 이동·음가 배치는 이번에 작곡한다. 이전 검토의 배속/반복 운용 제안은 사용자 제외 결정에 따라 새 곡의 실행 요구에 넣지 않는다.

## 진행 상태

작곡·MusicXML/MIDI·SoCal 음원·패키지 생성과 검증 완료. 앱 목록 수록은 개발 담당자에게 인계했다. 구체적인 검증 범위와 미확인 항목은 아래 결과를 따른다.

## 최종 제작 결과 — 2026-10-06

완성 파일 위치: `/Users/raphael/Playground/drum-practice/docs/experiments/preplay-warmup-20261006/final-01/`.

| 파일 | 용도 | SHA256 |
|---|---|---|
| preplay-warmup-final.musicxml | 정본, 96마디·384박 | 19081fbf5f28c695276585dad065ee3c1d614c66b02b30de5b472fdb1b533ef9 |
| preplay-warmup.mid | GM 드럼 channel10·880타격 | f4079a616fbaf33eaaba31dfa17192f7fbd8fc071ad48a5c81d1952c63922ce5 |
| preplay-warmup-socal.mp3 | SoCal, 44.1kHz stereo·192kbps | 62403ce46ffbe9c532485f04c983623419615305064e52f00d643bb1fddcc1eb |
| preplay-warmup.drumscore | XML·음원·6쪽 SVG·시간표 | e070249500dc0fb42c559919045b5d116b884e2ae16d7ee3e8f42c344d2c8c97 |

새 ID `preplay-hand-warmup-v1`. 음악 구간4분48초, 파일 길이290.25초(첫 박0.25초 + 음악288초 + 후미2초). MP3 6,967,990바이트, 패키지7,520,656바이트. 외부 반복 설정 없이1–96마디를 차례대로 연주한다. 새 artist는 비어 있고 composer는 독립 제작 표시 `Drum Practice`다.

검증:

- 정본 XSD 및 작곡 명세 대조 통과. 각 마디4박,96마디,880음표, R440/L440. 음가·악기·손·좌표·템포·MIDI 매핑 훼손6종을 거부.
- S 각188회, H 각92회, M 각108회, F 각52회(각각 오른손/왼손). 모든16마디 단계도 양손 총량 동일. 8분560개·16분288개·4분32개.
- MIDI를 별도 파서로 다시 읽어880 note-on과 모든 시작/길이/GM 악기를 XML 이벤트와 대조했다.
- SoCal 스네어는 EXS key38/`AnKit2:Sn1:all:Pr`, 세 탐은 검증된 내부48/47/43을 사용. 해당 velocity76의 유일한 zone·region·group 조건을 검사했다. 모든 샘플 입력은 manifest 해시를 대조한 프로젝트 복사본이다. GarageBand 앱/원본 Logic을 읽지 않으며, GarageBand의 이펙트 체인을 재현한 bounce가 아니다.
- `composition-02`/`reproduction-01`의 XML·MIDI·이벤트와 `socal-01`/`socal-reproduction-01`의 WAV·MP3가 각각 바이트 일치. 이후 표제/설명 배치 수정한 `composition-03`의 이벤트는 동일하고, 해당 XML을 직접 대조한 `socal-final-01` MP3도 재생성본과 바이트 일치.
- 실제 공통 `renderMusicXML`, `writeCanonical`, `createScorePackage`/`readScorePackage`로 Song·XML·음원 전체 왕복 통과. 최종 ZIP CRC·내장 XML/음원과 제공 파일 바이트·모든 캐시 SVG와 검수 SVG 바이트 일치. 렌더 warning 없음.
- Safari27.0.1 첫 제작 검증 후, 최종 패키지는 ego-browser Chrome152에서 생성·디코딩·검수. `package-02/review-page-1.png`부터6까지 실제 출력의 R/L 위치·빔·탐 높이·단계/마침줄을 확인했다.
- 실제 `makeCycle`의 파일0초/첫 마디0.25초/49마디144.25초, 카운트OFF/ON, 배속0.75/1/1.25의18가지 첫 박 예약 수치 일치. 배속은 검증 조건이며 사용자의 연습 운용 요구가 아니다.
- 실측 근거: `final-01/verification.json`, `composition-03/generation-audit.json`, `socal-final-01/render-audit.json`, `package-02/package-audit.json`, `package-02/osmd-render/render.json`.

주관적 음질 청취·개인별 신체 효과·실제 iPad 재생은 확인하지 않았다. 앱 목록 수록은 웹앱 개발 담당자의 후속 작업으로 구분한다. 앱 소스·목록 DB는 수정하지 않았다. 기존16/28마디 패키지와 `public/scores/tom-moving.drumscore`의28마디 원본은 기존 SHA256 유지 확인했다. 새 곡으로 대체할 대상은 기존16마디판이며28마디판은 유지한다.

## 이번에 해결한 문제와 다음 적용 기준

1. **설명/RL 겹침:** 공통 렌더에서 첫 마디의 일반 설명 direction/words와 줄기 위 R/L이 같은 높이에 겹쳤다(`package-01/ego-page-1.png`). 설명은 XML의 단계 rehearsal `A. 부드럽게 · 고르게 · 자연스러운 반동`으로 옮기고 중복 설명 words를 제거했다. SVG를 직접 옮기지 않았다. 재생성한6쪽 실제 검수와 XSD 통과. 앞으로 긴 연주 지시는 스티킹과 겹치지 않는 표준 방향 표제로 분리하고 실제 첫 줄을 확인한다.
2. **검수 자료/캐시 차이:** source 렌더와 canonical 렌더를 각각 생성했는데, 최초 검수용 SVG는 source 쪽이고 패키지 캐시는 canonical 쪽이었다. 음표/배치는 같아도 SVG 바이트가 달랐다. 최종에서는 canonical의 `finalRender.pages`만 캐시·검수·내보내기에 사용했고6쪽 바이트 일치를 확인했다. 향후 별도 두 렌더 결과를 혼용하지 않는다.
3. **동일 제목 이중 표기:** 공통 canonical writer가 work-title과 동일한 movement-title을 생성한다. 새 작품의 선택적 중복 movement-title만 제거하고 work-title과 canonical display-title은 유지했다. MusicXML 규격·앱 metadata 재읽기·전체 패키지 왕복으로 동일 제목을 확인했다. 기존 악보나 공통 writer를 변경한 것이 아니다.
4. **Safari 컨텍스트 소실:** 첫 제작/검수 후 evaluate/screenshot이 `Could not find browsing context`, list_tabs는빈목록이었다. 일부 캡처가 빈 화면/직전 페이지여서 완료 증거로 사용하지 않았다. 소실 원인은 미확정. 프로젝트 규칙에 따라 ego-browser의 같은 로컬 자료로 남은 검수와 최종 생성 수행. 전환 후 첫 build evaluate는15초 timeout이었으나 후속 read에서 패키지·6개 이미지 생성 완료를 확인했다. 재빌드 POST를 반복하지 않았다. 앞으로 타임아웃 뒤 저장 여부/실행 상태를 읽고 뒤늦은 중복 저장을 피한다.
5. **오류 주입은 실제 변경이어야 함:** 첫 MIDI 훼손 검사는 스네어 midi-unpitched의 원래39에39를 다시 써 no-op이었다.40으로 수정한 뒤 해당 훼손의 거부를 확인했다. 실패한 `composition-01`도 보존한다.

## 재제작 경로

소스는 `scripts/musicxml/preplay_warmup.py`, 작곡 fixture `scripts/musicxml/fixtures/preplay_warmup.json`, 음원 `scripts/musicxml/render_socal_warmup.py`, 패키지 `scripts/musicxml/preplay_warmup_package.mjs`, 수신기 `scripts/musicxml/preplay_warmup_evidence_server.py`다. Python은 lxml/numpy가 있는 `/Users/raphael/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3`를 사용한다. 각 CLI의 `--out`은 항상 새 폴더여야 한다. 음원은 `--xml`과 `--events` 모두 지정한다. 패키지 helper의 입력 경로는 현재 검증한 composition-03/socal-final-01이며, 새 변형에서는 검증된 새 입력으로 바꾼다. Vite localhost5173과 localhost5191 수신기를 사용하고 승인된 별도 탭에서 helper를 호출한다. 기존의192/336타격용 generator/renderer 가드를 제거하지 않는다.

## 개발 인계

2026-10-06 기존 사용자 위임 범위에 따라 `드럼연습실 웹앱 개발` 작업 `01a0afc9-ca21-7371-9390-06eb07c017e9`에 최종 경로·해시·검증·수록 경계와 기존16마디 대체/28마디 유지 대상을 전달했다. 메시지 전송 성공을 확인했으며 앱 수록 완료를 확인한 것은 아니다.
