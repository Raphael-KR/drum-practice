# GarageBand 일반 드럼킷 소개

확인: 2026-10-06 KST. 소개 원천은 당시 설치된 GarageBand 10.4.14이며, 현재 앱과 시스템 Logic 폴더는 없다. 제작용 프로젝트 보존본은 **SoCal·Portland 두 키트만** 남아 있다.

## 제작 시 드럼킷 선택 — 사용자 결정 2026-10-06

악보에 사용할 드럼 음원을 새로 제작할 때는 이 문서를 먼저 읽고, 곡의 장르·분위기·연습 목적과 필요한 악기·주법에 맞게 **보존된 SoCal·Portland 중에서** 선택한다. SoCal을 고정 기본값으로 사용하지 않는다. 사용자가 키트를 지정하면 그 선택을 우선하되, 삭제된 키트는 현재 사용 가능한 후보로 취급하지 않는다.

- 소개 표로 후보를 좁히고, 리듬·탐 높낮이·타격 구분 등 이번 연습에서 잘 들려야 하는 요소를 기준으로 선택한다. 자동 드러머의 연주 스타일과 키트 자체의 음색을 구별한다.
- 아래 프로젝트 보존본에서 실제 사용할 패치·악기 정의·샘플과 필요한 주법·음역·벨로시티 지원을 확인한다. 키트별 샘플 선택용 MIDI 변환이 필요하면 별도로 기록하며 악보의 승인된 MusicXML·GM 매핑을 바꾸지 않는다.
- 선택이 애매하면 같은 악보 이벤트·타이밍·벨로시티로 대표 구간을 비교한다. 소개에 따른 선택과 실제 청취로 확인한 결과를 구분하고, 미청취 결과를 청취 평가로 표현하지 않는다.
- 곡별 제작 기록에 선택한 키트, 선택 이유, 샘플 출처, 매핑·렌더 방식 및 검증 결과를 남긴다. 요청 범위 안의 키트 선택은 제작자가 판단하여 진행한다.
- 제공된 원음원 연결이나 MusicXML만 만드는 작업에 새 음원 제작을 추가하지 않는다. 기존 악보·음원을 이 결정만으로 일괄 교체하지 않는다.

## 프로젝트에 보존한 라이브러리 — 2026-10-06

### 현재 상태: SoCal·Portland만 유지

사용자 최신 결정: 연습용으로 **SoCal과 Portland 두 키트만 남기고 나머지를 삭제한다.** 앞으로 아래 보존본의 두 키트를 제작 입력으로 사용한다.

**위치:** `/Users/raphael/Playground/drum-practice/local-libraries/garageband-drum-kits/`.

- 현재 36파일, 828,562,102bytes(약 0.83GB). 두 키트 패치 6파일, EXS 8개, CAF 샘플 18개, 소개·연결 메타데이터 4개다. 두 키트가 참조하는 공통 클랩·카우벨·셰이커·스틱·탬버린도 필요한 의존성으로 유지했다.
- 나머지 18개 키트의 패치와 불필요한 EXS·샘플 **185파일, 7,999,364,416bytes(약 8.00GB)**를 프로젝트 복사본에서 삭제했다. 삭제 대상 미디어의 별도 백업은 만들지 않았다. 삭제 전 manifest와 삭제 목록·해시는 감사 기록으로 남겼다.
- 삭제 직전 전체 221파일의 해시를 대조했으며 삭제 후 남은 36파일의 크기·SHA256 및 두 키트의 EXS→샘플 참조 완전성을 다시 확인했다. 현재 manifest는 두 키트와 필요한 참조만 포함한다.
- 작업 시작 시 `/Library/Application Support/Logic`은 이미 없었다. GarageBand 앱도 없으며, 이번 작업에서 시스템 원본을 삭제하지 않았다. 다른 악기·다른 위치의 라이브러리는 정리 대상에 포함하지 않았다.
- 삭제 전후 파일시스템 여유 공간은 실측 약 7.71GB 증가했다. 이는 해당 시점의 관측값이며 파일 논리 크기·APFS 공유 블록·스냅샷·동시 작업의 영향을 구별한다.
- 정리 후 프로젝트 복사본만으로 기존 192타격·50.25초 SoCal 연습곡 WAV/MP3를 재생성했고 현재 음원과 SHA256까지 일치했다. Portland는 파일 해시·참조 완전성을 검증했으며 실제 음원 렌더링·청취는 아직 검증하지 않았다.
- 근거: `docs/experiments/garageband-kits-20261006/two-kit-pruning-audit.json`, `two-kit-render-verification.json`, `before-two-kit-manifest.json`.
- `/local-libraries/`는 Git 제외 상태로 유지한다. 샘플을 public·배포 자산에 자동으로 추가하지 않는다.

### 과거 기록: 20개 키트 최초 보존

아래는 두 키트만 남기기 **이전**의 복사·검증 기록이다. 현재 보유 목록이나 현재 크기로 해석하지 않는다. 당시 사용자가 GarageBand 앱을 삭제하려 하므로 일반 드럼킷 20개의 필요한 파일을 프로젝트에 복사했다.

- 목표: GarageBand 앱이나 시스템 사운드 라이브러리가 없어도 필요한 드럼 자료를 보존한다.
- 범위: 일반 키트 20개의 기본 패치, 연결된 EXS와 모든 실제 샘플, 소개·연결 메타데이터. 전자 키트와 멀티채널 변형 전체는 포함하지 않는다.
- 완료 조건: 복사본 전체 해시·참조 완전성을 확인하고 현재 SoCal 제작 경로를 복사본만으로 재현한다.
- 제외: 원본 앱·시스템 라이브러리 삭제, 기존 악보·음원 교체, 모든 키트의 범용 렌더러 구현, Git 게시·배포.
- 검증: 아래 전수 SHA256 대조와 원래 경로 접근을 막은 재생성, 누락·해시 불일치 거부 검사.

- 총 221파일, 8,827,926,518bytes(약 8.83GB). 악기 정의 34개, 샘플 123개, 일반 키트 패치 20개와 소개·연결 메타데이터다. 기본 패치에 연결된 공통 퍼커션 정의 및 Blue Ridge/Speakeasy v2 정의, 기존 Stereo 정의도 보존했다.
- `manifest.json`에 원본→복사본 상대 경로, 크기·SHA256, 키트→EXS 및 EXS→샘플 연결을 기록했다. 전체 221파일의 원본/복사본 해시 일치, 샘플 참조 누락 0을 확인했다.
- 같은 APFS 볼륨의 `cp -c -p` 복제를 사용했다. 각 복사본은 원본과 다른 inode이며 symlink/hardlink가 아니다. 원본 파일을 지워도 복사본이 유지되는 독립 파일이다. 복사 전후 `df -h` 표시 여유 공간은 약 27GiB로 유지됐다. 정확한 추가 물리 사용량은 측정하지 않았다.
- `/local-libraries/`는 `.gitignore`로 제외했다. 샘플을 Git·public·배포 자산에 자동으로 추가하지 않는다.

### 앱 없이 사용하는 방법과 검증 한계

EXS 원본 바이트를 그대로 보존했으므로 내부 샘플 경로 문자열은 옛 설치 경로다. 외부 앱에서 EXS를 직접 로드할 때 자동으로 복사본을 찾는다고 가정하지 않는다. CLI 제작에서는 `manifest.json`의 원본 식별자→복사본 경로를 사용한다. 설명의 키트 이름 불일치 해결은 아래 `DefaultPatchGB` 기준을 계속 적용한다.

`scripts/musicxml/render_socal_toms.py`의 기본 입력을 프로젝트 보존본으로 바꾸고 `--library`로 보존 폴더를 지정할 수 있게 했다. 선택한 EXS·패치·샘플은 크기·SHA256을 검사하며 복사본이 누락되거나 달라지면 거부한다. 앱/시스템 원본으로 자동 우회하지 않는다. 원본 절대 경로 상수는 manifest 조회용 식별자이며 실제 읽기 경로가 아니다.

Python에서 `/Applications/GarageBand.app/` 및 `/Library/Application Support/Logic/` 파일 열기를 막은 채 재생성했고, ffmpeg의 샘플 입력도 모두 프로젝트 복사본임을 확인했다. 192타격·50.25초 WAV/MP3가 기존 SoCal 결과와 각각 SHA256까지 일치했다. WAV `9919436a8da1029408e153f8d431357c6347a6edf87c4074dd4c5a55cf23e499`, MP3 `e5aedf61f5723decba9c68aa835f319ee95be19ac29d4ef4db1fb69bc046ef8e`. 누락 항목 및 잘못된 digest 거부 검사도 통과했다. 앱을 실제로 삭제한 시험은 아니다. 현재 renderer는 기존 탐 3종·velocity76 연습곡 전용이며 20개 키트 전체의 모든 주법 재생을 검증한 것은 아니다.

Python은 numpy가 포함된 `/Users/raphael/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3`를 사용한다. 기본 `python3`로 검증 helper를 실행하면 numpy import가 실패한 것을 이 런타임 사용으로 해결했다. ffmpeg도 필요하다.

근거: `docs/experiments/garageband-kits-20261006/library-preservation-audit.json`, `copy-only-render-verification.json`. 이 작업에서 원본 앱·설치 라이브러리와 현재 수록 악보·음원을 삭제하거나 교체하지 않았다.

## 소개 자료와 읽는 법

Apple 공식 [장르와 드러머 선택 가이드](https://support.apple.com/guide/garageband/gbnd657799c4/mac)는 각 드러머에 기본 키트와 고유 연주 스타일이 연결되며, 이름 위에 포인터를 두면 스타일 설명이 나온다고 안내한다. 검색한 공식 웹 가이드에서는 20개 키트의 음색 설명을 한데 모은 표는 확인하지 못했다.

아래는 당시 설치된 앱의 Apple 제공 드러머 소개를 요약하고 실제 기본 키트 경로와 대조한 **과거 20개 키트 참고표**다. 현재 제작에 사용할 수 있는 키트는 SoCal·Portland뿐이며 나머지 18개 자료는 삭제했다. 음색과 자동 드러머의 연주 스타일이 함께 담겨 있다. 같은 MIDI를 키트만 바꿔 재생할 때 드러머의 리듬·필인 스타일이 자동으로 생기는 것은 아니다. 직접 청취한 평가나 키트별 우열 판단도 아니다.

| 키트 | 기본 드러머 | 스타일 | 소개 요약 |
|---|---|---|---|
| Blue Ridge | Austin | 루츠·포크·아메리카나 | 브러시 계열의 간결한 그루브와 기차처럼 밀고 가는 리듬 |
| Bluebird | Darcy | 팝·송라이터 | 자연스러운 음색, 곡을 받쳐주는 절제된 팝 연주 |
| Brooklyn | Gavin | 인디 록 | 거친 질감의 키트와 복잡한 인디 록 리듬 |
| Detroit Garage | Zak | 개러지 록 | 가공을 덜 한 듯한 날것의 음색과 몰아치는 비트 |
| East Bay | Max | 펑크 록 | 펀치감 있는 음색과 빠르고 힘찬 리듬 |
| Four on the Floor | Nikki | 인디 디스코·댄스 록 | 가공된 강한 타격감과 탄력 있는 댄스 비트 |
| Heavy | Anders | 하드 록 | 육중하고 규모감 있는 음색 |
| Liverpool | Parker | 1960년대 영국 록 | 먹먹하게 뮤트된 빈티지 음색과 강조된 탐 필인 |
| Manchester | Ian | 브릿팝·사이키델릭 록 | 큰 공연장 느낌의 키트와 세밀한 그루브 |
| Motown Revisited | Benny | 모타운·R&B | 빈티지 음색, 타이트한 펑키 비트와 적은 필인 |
| Neo Soul | Curtis | 네오 소울·R&B·힙합 | 강한 타격감, 재즈 감각을 섞은 리듬과 독특한 필인 |
| Portland | Aidan | 인디 팝 | 자연스러운 음색과 의도적으로 단순한 연주 |
| Retro Rock | Logan | 복고풍 록 | 복고풍 음색과 여백 있는 강한 비트 |
| Roots | Mason | 아메리카나·클래식 R&B | 빈티지 음색과 느슨하고 여유 있는 그루브 |
| Scientific Method | Graham | 실험적 송라이터 | 가공된 음색과 여러 장르를 혼합한 리듬 |
| Slow Jam | Rose | 모던 R&B | 건조하고 자연스러운 음색, 크로스스틱 중심의 느긋한 그루브 |
| Smash | Jesse | 펑크(Funk) 록 | 타이트한 음색과 전면에 드러나는 강한 비트 |
| SoCal | Kyle | 팝 록·범용 | 자연스럽고 다양한 장르에 쓰기 좋은 키트, 단순하고 직접적인 록 비트 |
| Speakeasy | Tyrell | 조용한 팝·발라드·재즈 브러시 | 브러시로 만드는 부드럽게 휘감기는 질감 |
| Sunset | Levi | 펑키 팝·송라이터 | 자연스러운 음색과 느긋한 팝 그루브 |

## 로컬 근거

- 설명: `/Applications/GarageBand.app/Contents/Resources/en.lproj/LocalizableDrummerStrings.plist`의 `Characters → Identifier → _LOCALIZABLE_ → Description`. 한국어 리소스도 대조하되 영문 설명을 기준으로 자연스럽게 요약했다.
- 연결: `/Applications/GarageBand.app/Contents/Resources/GI/Drummer.glibb/genreCharacterMap.plist`의 `DefaultPatchGB`.
- 범위: `Patches/Instrument/Drum Kit/*.patch`의 모든 일반 키트가 메타데이터 연결 및 소개와 대응함을 확인했다. 멀티채널·전자 드럼은 이 표의 범위 밖이다.
- 재조회 근거: `docs/experiments/garageband-kits-20261006/intro-audit.json`에 앱 버전, 원천 경로·SHA256, 식별자, 패치 연결, 요약을 기록했다. 원천 설명 전문은 복제하지 않았다.

## 발견한 불일치와 다음 적용 기준

원인: 일부 설명 리소스의 `DrumKitName` 필드가 실제 기본 패치 경로와 다르다. Ian 설명은 Smash지만 `DefaultPatchGB`는 Manchester, Parker 설명은 Roots지만 실제 연결은 Liverpool, Tyrell 설명은 Brush지만 실제 연결은 Speakeasy다. 원인이 번역 잔재인지 공유 리소스 관리 문제인지는 확인하지 않았다.

해결: 드러머→키트 연결은 이름 문자열이 아니라 `genreCharacterMap.plist`의 동일 `Identifier`에 있는 `DefaultPatchGB`를 사용하고 설치된 패치 존재와 대조했다. 앱 원천 파일은 수정하지 않았다.

Blue Ridge의 설명은 브러시라고 표현하지만 메타데이터의 `BrushType`은 `Rods`다. Speakeasy는 `Brushes`다. Blue Ridge를 전통 재즈 브러시와 동일하다고 단정하지 않는다.

다음 적용: 이 표는 제작 시 후보를 좁히는 자료다. 곡에 가장 적합한 키트 선정은 실제 같은 음표·타이밍으로 청취 비교하고 필요한 주법·샘플 매핑을 검증한 뒤 판단한다. SoCal은 자연스러운 범용 키트라는 소개가 확인됐지만, 이전 선택은 로컬 제작 경로를 먼저 검증한 데 따른 선택이었다. 뒤늦게 확인한 소개를 당시 선정 근거로 소급하지 않는다.

## 공통 음색 조절

Apple 공식 [Smart Control 유형](https://support.apple.com/guide/garageband/gbndf553bab8/mac)은 어쿠스틱 키트의 개별 소리 믹스, 컴프레션, 톤, 룸 조절을 설명한다. 이 프리셋의 전체 효과를 외부 샘플 믹서가 그대로 재현한다고 가정하지 않는다.
