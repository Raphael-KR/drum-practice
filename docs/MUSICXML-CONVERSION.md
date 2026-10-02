# Real Paradis PDF → MusicXML

> 이 문서는 2026-09-19 변환 실험의 재현 기록이다. 새 변환은 [변환 선택 기준](MUSICXML-CONVERSION-POLICY.md)과 최신 `docs/SCORE-MUSICXML-OSMD-MAPPING.md`, `docs/SVG-SCORE-RULES.md`를 먼저 따른다. 아래 전용 코드의 역사적 후보 매핑·Verovio 표시 보정은 현재 웹앱의 승인 규칙을 대체하지 않는다. 기존 산출물을 재현하는 도구이며 앱에 자동 적용하지 않는다.

- 목표: PDF 기호의 음악적 의미를 복원하고 원본 대조 근거를 남긴다.
- 범위: 별도 worktree의 변환 코드, 로컬 산출물, 검증 기록.
- 완료 조건: 대표 마디(9, 12, 84)의 두 성부/음가/악기/박자 합계와 재렌더링 검증 후 전체 확장 판정. 전체 결과는 마디별 검토 상태를 갖는다.
- 제외 범위: 원 저장소 앱·가사 데이터 수정, 서버 재시작, merge/push/deploy.
- 검증: PDF 글리프와 줄기·빔 구조, MusicXML 스키마, 성부별 박자 합계, 독립 악보 렌더러, 원본 crop 대조.

## 입력과 방법

원본 3쪽 PDF와 기존 `data/reference/geometry.json`의 시스템/마디 경계를 읽는다. 기존 beatXs는 음가 인식 근거로 사용하지 않는다. 원본 파일과 분석 결과는 Git 제외 경로에 둔다.

MusicXML 4.0의 `unpitched`, `instrument`, MIDI channel 10을 사용한다. 반복기호는 각 마디의 실제 이벤트를 복사하고 `measure-repeat`로 표기한다. 1–4마디는 실제 네 개의 쉼표 마디와 `multiple-rest`로 표현한다.

공식 계약: [Percussion](https://www.w3.org/2021/06/musicxml40/tutorial/percussion/), [measure-repeat](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/measure-repeat/), [Verovio](https://book.verovio.org/toolkit-reference/toolkit-methods.html).

Apple 도구 검토: STT는 인쇄된 리듬·드럼 악기·빔 판독에 직접적인 근거를 제공하지 않는다. 기존 AFM 텍스트 비교 계약도 음악 기호의 이미지 판독을 보증하지 않는다. 이 변환에서는 벡터 분석과 원본 시각 대조를 사용한다.

## 2026-09-19 실행 결과

대표 9·12·84마디를 먼저 변환하고 Verovio로 렌더링하여 원본 crop과 대조했다. 이 결과를 근거로 전체 110마디의 **변환 후보**까지 확장했다. 기준점 보간을 음악적 인식으로 취급하지 않았다.

- 110마디, 전체 441개의 4분음표 박, 94 BPM. 84마디만 5/4, 85마디부터 4/4.
- 원본 음표 머리 1,407개를 보존. 반복 확장 후 음표 머리는 1,487개. 쉼표와 장식음을 포함한 XML `note` 요소는 1,754개.
- 두 성부의 박자 합계, 연속성, 같은 시작 시각의 원본 x좌표 정렬, 원본 머리 개수 보존, XML 재읽기 이벤트 대조 PASS.
- W3C MusicXML 4.0 XSD 검증 PASS. 대표 3마디는 원본에서 따로 읽어 적은 음가·악기 위치 fixture와 비교했다.
- 8개 오류 주입 검사 PASS: 음표 누락, 악기 변경, 6연음 비율 누락, 동시음을 순차음으로 변경, 84마디 박자 변경, BPM 변경, 오선 위치 변경, 반복 표기 누락을 거부했다.
- Verovio `6.3.0-425dd7b`가 원본과 같은 3쪽, 같은 시스템 분할(1/5/9…33, 37…73, 77…101/105/107)을 생성했다. PNG 3쪽 및 대표 마디 이미지를 직접 확인했다.
- 앱 코드·가사·서버를 변경하지 않았으므로 앱 테스트/서버 재시작은 실행하지 않았다. commit/push/PR/merge/deploy는 수행하지 않았다.

### 음가 복원과 예외

글리프의 모양·오선 위치, 줄기의 방향/연결, 직선으로 닫힌 빔 사각형을 읽는다. 빔 위치는 해당 줄기 끝의 방향을 제한해 다음 시스템의 빔과 혼동하지 않는다. 곡선 붙임줄은 빔 개수에서 제외한다. 음가를 마디 총합에 맞추기 위해 임의 조정하는 규칙은 없다.

| 대상 | 원본에서 확인한 처리 |
|---|---|
| 1–4 | 4개 실제 쉼표 마디 + `multiple-rest=4` |
| 6, 43, 44, 47, 51, 103 | 직전 마디 실제 이벤트 복사 + `measure-repeat`; 44는 43을 거쳐 42의 패턴 |
| 7 | 점4분 크래시의 3획 트레몰로, 다음 8분음표와 붙임줄, 스네어 앞 작은 슬래시 장식음 |
| 8 | 첫 8분쉼표를 두 성부가 공유; 아래 성부에 숨긴 동등한 쉼표 기록 |
| 72, 100 | 마지막 16분음표 6개에 인쇄된 `6`; 6:4 비율, 각 1/6박 |
| 84 | 5/4, 마지막 4분쉼표 공유; 두 성부 모두 5박 |
| 94, 96 | 깃발 옆 멀리 배치된 점을 같은 코드의 점8분음표로 연결 |
| 107–109 | 아래 성부의 생략된 공유 쉼표를 보충; 보이는 원본 쉼표는 유지 |
| 110 | 온마디 쉼표와 종지선 |

### 악기 매핑과 확정 범위

표의 위치는 원본 오선의 가장 위 F5선을 0으로 하는 온음계 칸이다. MIDI 번호는 GM의 0–127 번호이며 MusicXML에는 규격대로 1을 더해 쓴다.

| 기호/칸 | 표시 위치 | 후보 악기 | GM MIDI |
|---|---|---|---:|
| œ / 7 | F4 | Bass drum | 36 |
| œ / 3 | C5 | Snare | 38 |
| œ / 1, 2, 5 | E5, D5, A4 | High / Mid / Low tom | 50 / 47 / 43 |
| x / -1 | G5 | Closed hi-hat | 42 |
| o / -1 | G5 | Open hi-hat | 46 |
| x / 0 | F5 | Ride | 51 |
| x / -2 | A5 | Crash | 49 |
| x / 3 | C5 | Cross stick | 37 |

**원본에는 악기 범례가 없다.** 악보의 기호·오선 위치 보존과 실제 악기 이름/GM 음색의 확정은 별개다. 악기명이 정답이라고 확정하지 않았으며 음표가 있는 각 마디의 `audit.json`에 미확정 상태를 기록했다. 특히 x/F5, x/C5와 탐의 실제 튜닝/종류는 연주자 확인이 필요하다. 오선 위치와 기호가 남아 있어 매핑만 변경할 수 있다.

7마디의 장식음 재생 시점과 트레몰로 타격 속도는 원본에 수치로 지정되어 있지 않다. 기호를 보존했으며 임의의 MIDI 연타로 바꾸지 않았다. 전체 음원과의 청취 검증, 다른 악보 프로그램의 드럼 음색 재생 검증은 수행하지 않았다.

검토 수준도 구분했다. 9·12·84는 세부 수동 fixture와 렌더 대조, 7·72·100은 예외 기호 집중 대조, 나머지는 전수 구조 검사와 3쪽 전체 시각 대조다. 모든 마디를 별도 수작업으로 재전사해 이중 검증한 것은 아니다.

### 렌더링 한계

MusicXML은 실제 반복 음표를 갖지만 Verovio는 반복기호 마디 폭을 좁게 조판하고 2/3 같은 반복 회수 숫자를 추가한다. 빈 원본 마디 폭과 같지 않다. 원본의 둥근 o 머리는 비어 있는 일반 머리로 표현한다. 빔 기울기, 기본 음표 간격, 제목/첫 Intro의 표시도 원본과 다르다. 원본 제목·구간명은 XML에 보존되어 있으나 Verovio의 다중마디 쉼표 처리에서 첫 Intro가 렌더링되지 않는다. BPM은 XML 1마디에 있으며 렌더에서 읽을 수 있도록 5마디에도 표시한다.

SVG의 텍스트 글꼴만 `YuMincho`로 지정하고 `サビ`를 기존 프레임에 맞게 줄여 Cairo의 일본어 네모 표시를 해결했다. 음악 글리프 경로는 수정하지 않았다. 이 결과는 음악 데이터 검토용이며 원본과 픽셀이 같은 복제 PDF가 아니다.

## 산출물

모두 이 worktree의 Git 제외 `docs/experiments/musicxml/` 아래에 있다. 원본/생성 악보를 Git에 추가하지 않는다.

- `real-paradis-110-candidate.musicxml`: 전체 110마디 후보.
- `representatives.musicxml`: 원래 번호를 유지한 9·12·84마디.
- `review.html`: 원본/변환 3쪽, 대표 원본 crop, 110행 검토·미확정 목록. 외부 네트워크 요청 없음.
- `audit.json`, `representatives-audit.json`: 검사 범위, 결과, 파일 해시와 마디별 미확정.
- `full-render/page-{1,2,3}.{svg,png}`, `representatives-render/page-1.{svg,png}`.
- `extracted.json`: 글리프/오선 위치/줄기/빔/음가/성부/예외 근거를 가진 중간 표현.
- `provenance.json`: 원본 PDF·geometry 해시. PDF SHA-256 `33a98caa89daee7c5d9d56f272f73f0f8f6e9cb6526fe80af6c5f798807bcefd`.

작업 브랜치: `codex/pdf-musicxml`, 기반 HEAD `c30d58e8a613e658f80bb070d1e073827c50b474`.

## 재현

통합된 프로젝트 루트에서 실행한다. 원본 PDF는 읽기만 한다. 이 코드는 해당 PDF 해시에 결합한 전용 변환기이며 다른 곡에 수동 예외를 적용하지 않는다. Python/Cairo와 YuMincho가 있는 현재 macOS 환경 기준이다.

```sh
python3 -m venv docs/experiments/musicxml/venv
docs/experiments/musicxml/venv/bin/pip install -r scripts/musicxml/requirements.txt
cp /Users/raphael/Playground/drum-practice/data/reference/geometry.json docs/experiments/musicxml/geometry.json
mkdir -p docs/experiments/musicxml/schema
curl -fsSL https://raw.githubusercontent.com/w3c/musicxml/v4.0/schema/musicxml.xsd -o docs/experiments/musicxml/schema/musicxml.xsd
curl -fsSL https://raw.githubusercontent.com/w3c/musicxml/v4.0/schema/xml.xsd -o docs/experiments/musicxml/schema/xml.xsd
curl -fsSL https://raw.githubusercontent.com/w3c/musicxml/v4.0/schema/xlink.xsd -o docs/experiments/musicxml/schema/xlink.xsd
```

이하 `PY`는 위 가상환경 Python 경로, `OUT`은 산출물 경로다. 임의의 사용자 파일이 있는 디렉터리를 OUT으로 지정하지 않는다.

```sh
PY=docs/experiments/musicxml/venv/bin/python
OUT=docs/experiments/musicxml
SCORE_PDF='/Users/raphael/Documents/드럼 악보/Real paradis-風と丘のバラード.pdf'
"$PY" scripts/musicxml/convert.py --pdf "$SCORE_PDF" --geometry "$OUT/geometry.json" --out "$OUT"
"$PY" scripts/musicxml/export.py --input "$OUT/extracted.json" --out "$OUT/representatives.musicxml" --representatives
"$PY" scripts/musicxml/verify.py --xml "$OUT/representatives.musicxml" --ir "$OUT/extracted.json" --schema "$OUT/schema" --out "$OUT/representatives-audit.json"
"$PY" scripts/musicxml/render.py "$OUT/representatives.musicxml" --out "$OUT/representatives-render"
"$PY" scripts/musicxml/export.py --input "$OUT/extracted.json" --out "$OUT/real-paradis-110-candidate.musicxml"
"$PY" scripts/musicxml/verify.py --xml "$OUT/real-paradis-110-candidate.musicxml" --ir "$OUT/extracted.json" --schema "$OUT/schema" --out "$OUT/audit.json"
"$PY" scripts/musicxml/test_verification.py
"$PY" scripts/musicxml/render.py "$OUT/real-paradis-110-candidate.musicxml" --out "$OUT/full-render"
"$PY" scripts/musicxml/review.py --pdf "$SCORE_PDF" --out "$OUT"
```

## 남은 확인

1. 원본 제작자 범례 또는 사용자의 드럼 악기 배정으로 후보 매핑 확정.
2. 7마디 장식음/트레몰로의 의도와 재생 프로그램 해석 확인.
3. 필요하면 MuseScore 등 두 번째 MusicXML 소비자에서 가져오기·재생 대조. 현재 Verovio의 렌더 성공을 다른 프로그램의 동작 보증으로 사용하지 않는다.

## 2026-09-19 사용자 제공 제작자·제목 정보 반영

`scripts/musicxml/song-metadata.json`을 재생성 메타데이터 정본으로 추가했다. 사용자가 직접 제공한 정보이며 링크의 내용을 별도로 검증한 결과로 표시하지 않는다.

- 원제(`work-title`): 風と丘のバラード
- 표시 제목(`movement-title`, title credit): 바람과 언덕의 발라드
- 노래(`creator type="artist"`): Real Paradis with のだめオーケストラ
- 작사(`creator type="lyricist"`): Jane Su
- 작곡(`creator type="composer"`): 野村陽一郎
- 제공된 노래·작사 링크는 `miscellaneous-field`로 보존했다.

전체/대표 MusicXML을 같은 경로에 재생성했다. 두 파일의 `part`와 `part-list`를 변경 전 사본과 비교해 음악 데이터가 동일함을 확인했고, 메타데이터 재읽기와 MusicXML 4.0 스키마/기존 리듬 검사가 통과했다. 가사는 추가하지 않았다. 기존 렌더는 header/footer를 숨기는 검토용 설정이므로 제작자·표시제목의 악보 프로그램별 실제 표시를 보증하지 않는다.

변경 전 파일은 `docs/experiments/musicxml/before-creator-metadata/`에 보존했다. 기존 Claude 비교 보고서의 Codex 해시는 이 변경 전 파일을 가리키며, 현재 파일 해시는 최신 `audit.json`에서 확인한다.
