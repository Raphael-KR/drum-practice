# Drum Key 확장 항목 조사

2026-09-20. 조사 결과이며 매핑 결정 문서가 아니다. SCORE-MUSICXML-OSMD-MAPPING.md 및 앱/곡 데이터는 변경하지 않았다.

## 조사 범위와 한계

첨부 Drum Key와 기존 목록의 차이 항목을 OSMD 로컬 소스, 공식 API 문서, MusicXML 표준과 대조했다. 로컬 앱 의존성 2.1.2, upstream checkout b62a6ca1d451e8cb5e9e70b271cb520ff1526e2c (develop 0502732 기반, normal-fill 패치 포함)를 확인했다. 최신 원격 HEAD 전체와 동일하다고 주장하지 않는다. 이번에는 소스 조사이며 새 렌더링/소리 재생 실험은 하지 않았다.

## 핵심 구조

OSMD에는 XML의 악기 이름만으로 드럼 키의 모든 모양/높이를 정하는 표준 드럼 키트를 확인하지 못했다. SubInstrument는 이름과 MIDI 정보를 보관하고, MusicSheetReader는 midi-unpitched를 fixedKey로 읽는다. VexflowStafflineNoteCalculator는 기본적으로 XML display-step/octave를 사용한다. 별도 Cajon 2-note 옵션은 있지만 이번 드럼 키트 목록의 악기 전용 매핑 근거는 아니다. notehead는 별도 XML 입력으로 변환된다.

따라서 'OSMD에서 악기 이름을 확인하면 전용 모양이 정해진다'는 앞선 설명은 부정확했다. 일반 도형 표시 기능은 풍부하지만, 현재 정책에서 그 기능만으로 매핑을 확정할 수 없다. 이것은 곧바로 렌더러 버그나 악기 자체 미지원이라는 뜻도 아니다.

## 추가 항목 조사 결과

| 항목 | 확인 결과 | 판정/남은 일 |
|---|---|---|
| China | 해당 악기 전용 모양/위치 선택 규칙을 조사 소스와 공식 API에서 찾지 못함 | 전용 규칙 미확인. 원 안의 × 자동 채택 금지 |
| Splash | 동일 | 전용 규칙 미확인. 빈 마름모 자동 채택 금지 |
| Cowbell | 동일. MusicXML 공식 타악기 예제에는 별도 1선 보표의 카우벨이 있으나 OSMD 전용 드럼 키트 삼각형 규칙은 아님 | 전용 규칙 미확인 |
| Choked Crash | choke 전용 처리 경로를 찾지 못함. 그림의 점을 staccato로 읽을 수 있다는 것과 choke 의미를 지원한다는 것은 다름 | 전용 규칙 미확인. 점으로 대체하지 않음 |
| Snare Doubles | OSMD는 tremolo 스트로크를 읽어 VF.Tremolo로 표시함. 그러나 이것이 더블 스트로크 손기술을 보장하지 않음 | 반복음 표기는 구현됨. Doubles 전용 의미/규칙 미확인 |
| Snare Buzz | InstrumentReader가 tremolo type=unmeasured를 읽고, Drawer.drawBuzzRolls가 전용 기호를 그림. 드럼 전용 upstream 예제도 있음 | 버즈 롤 주법 구현 확인. 새 실제 앱 렌더링은 미검증 |
| Tom 3·4·5 | 악기 번호에 따른 전용 위치/모양 규칙을 찾지 못함 | 전용 규칙 미확인. 기존 플로어 탐과의 실제 악기 대응도 원본별 확인 필요 |
| Right Bass·Left Bass | 오른발/왼발 킥을 자동 분리하는 전용 표기 규칙을 찾지 못함 | 전용 규칙 미확인. MIDI의 서로 다른 베이스드럼 음색을 오른발/왼발로 추정하지 않음 |
| Hi-Hat Splash | 페달 스플래시 전용 모양/위치 매핑을 찾지 못함 | 전용 규칙 미확인. 일반 페달 하이햇으로 합치지 않음 |

### 버즈 롤의 확인된 표준 입력

음표의 notations 아래에 다음을 기록하는 경로가 구현되어 있다. 일반 Z 문자나 도형을 임의로 그리는 대체가 아니다. 이 문서는 조사이므로 확정 매핑 정본에는 아직 추가하지 않았다.

```xml
<notations>
  <ornaments>
    <tremolo type="unmeasured">0</tremolo>
  </ornaments>
</notations>
```

MusicXML 표준은 unmeasured의 값 0 및 기본 buzzRoll 글리프를 명시한다. OSMD는 tremoloUnmeasured 값을 저장하고 drawBuzzRolls에서 줄기 위치에 버즈 기호를 그린다. 드럼 예제 test/data/test_tremolo_unmeasured_buzz_roll_drums.musicxml에서도 같은 인코딩을 사용한다. 표시 구현 확인과 실제 롤 음향 재생 지원은 다르다.

Snare Doubles의 세 빗금은 일반적인 반복음 tremolo 경로로 표시할 수 있으나, 그 자체가 RRLL 더블 스트로크를 명시하지 않는다. 더블노트 tremolo(두 음 사이 교대) 역시 더블 스트로크와 같은 의미가 아니다.

## 기존 항목과의 중복/차이

- Rim Click: 그림은 기존 크로스 스틱과 유사한 범례지만 OSMD 전용 동의어/매핑 근거는 찾지 못했다. 이름만으로 정본 항목을 병합하지 않는다.
- Hi-Hat Pedal: 기존 풋 하이햇 대응 항목으로 검토하되 그림의 Hi-Hat Splash는 별도 주법으로 남긴다.
- Ride Bell: 이번 그림은 채운 마름모, 이전 그림은 삼각형이다. 어느 쪽도 OSMD 전용 규칙으로 확인되지 않았다. 두 도형 모두 자동 채택하지 않는다.

## 근거

현재 로컬 checkout: /Users/raphael/Playground/drum-practice/dependencies/osmd-hollow-fix (2026-10-03 경로 정리, 조사 당시 commit 유지).

- src/MusicalScore/SubInstrument.ts: midiInstrument 이름 사전, name/fixedKey 필드.
- src/MusicalScore/ScoreIO/MusicSheetReader.ts:962: midi-unpitched 읽기.
- src/MusicalScore/Graphical/VexFlow/VexflowStafflineNoteCalculator.ts:96–125: XML 위치 및 Cajon 옵션.
- src/MusicalScore/ScoreIO/InstrumentReader.ts:1564 이후: getTremoloInfo, unmeasured 처리.
- src/MusicalScore/VoiceData/Note.ts:368: Buzz roll 의미 주석.
- src/MusicalScore/Graphical/VexFlow/VexFlowMusicSheetDrawer.ts:296: drawBuzzRolls.
- src/MusicalScore/Graphical/VexFlow/VexFlowConverter.ts:701: 일반 tremolo 처리.
- test/data/test_tremolo_unmeasured_buzz_roll_drums.musicxml:215: 공식 저장소 드럼 예제.
- [OSMD Instrument API](https://opensheetmusicdisplay.github.io/classdoc/classes/Instrument.html)
- [OSMD SubInstrument API](https://opensheetmusicdisplay.github.io/classdoc/classes/SubInstrument.html)
- [MusicXML tremolo](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/tremolo/)
- [MusicXML 타악기](https://www.w3.org/2021/06/musicxml40/tutorial/percussion/)

## 후속 경계

일반 도형 대체 방식을 사용하려면 구체적인 방식을 보고하고 사용자 결정 후 매핑 정본을 먼저 변경한다. 이번 조사 요청을 일반 도형 매핑 승인으로 간주하지 않는다. 전용 규칙을 찾지 못했다는 결과는 조사 범위 내 판단이며 절대적인 부재 증명으로 표현하지 않는다.
