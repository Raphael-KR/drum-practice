# MusicXML 공식 표준 기준 Drum Key 조사

2026-09-20. MusicXML 4.0 공식 문서와 v4.0 schema/musicxml.xsd, sounds.xml 기준. 조사 보고서이며 확정 매핑 문서·앱·곡 데이터는 변경하지 않았다.

## 결론

MusicXML은 악기 식별과 시각 표기를 분리하는 교환 형식이다. score-instrument/instrument-name/instrument-sound 및 note/instrument로 악기를 식별하고, unpitched/display-step/display-octave와 notehead로 표기를 기록한다. 악기별 유일한 오선 높이/머리 모양을 강제하는 드럼 키트 표준은 아니다. 공식 타악기 예제도 여러 악기를 같은 높이에 다른 머리 모양으로 표시하는 방식과 카우벨 1선 보표를 보여 준다.

따라서 circle-x, triangle, diamond 같은 notehead 사용은 MusicXML의 정식 저장 기능이다. 다만 '어느 악기에 어느 모양을 배정하는가'는 이 요소 자체가 결정하지 않는다. 프로젝트의 승인 절차는 유지되며 표준 요소라는 이유만으로 임의 매핑을 적용하지 않는다.

## 확장 대상

| 항목 | 공식 식별/표현 근거 | 표준이 정하지 않는 것 |
|---|---|---|
| China | sounds.xml에 metal.cymbal.chinese가 있음. instrument-name으로 원본 China 명칭 보존 가능 | 해당 용어와 원본 악기의 대응 확인은 필요. 원 안의 × 및 높이를 강제하지 않음 |
| Splash | metal.cymbal.splash | 빈 마름모/높이 규칙 없음 |
| Cowbell | metal.bells.cowbell. percussion/metal의 cowbell 픽토그램도 존재 | 픽토그램은 direction 기호이며 음표머리 삼각형을 뜻하지 않음 |
| Choked Crash | 기본 악기는 metal.cymbal.crash. 조사한 4.0 XSD에 cymbal choke 전용 요소는 확인되지 않음 | 그림의 점을 choke 전용 기호로 규정하지 않음. other-technical 등 확장 표현은 별도 결정 필요 |
| Snare Doubles | drum.snare-drum + tremolo로 반복음 빗금 저장 가능 | 세 빗금 자체는 RRLL 더블 스트로크 손기술을 보장하지 않음. double-note tremolo도 두 음 교대이지 더블 스트로크와 다름 |
| Snare Buzz | ornaments/tremolo type=unmeasured, 값 0. smufl 생략 시 buzzRoll가 기본 | 음원에서의 버즈 롤 재생이나 OSMD의 모든 동작을 보장하지 않음 |
| Tom 3·4·5 | drum.tom-tom + 각각 별도의 score-instrument ID/이름으로 구별 가능 | Tom 3/4/5의 크기·높이·오선 위치 고정 규칙 없음 |
| Right/Left Bass | drum.kick-drum 또는 drum.bass-drum. 별도 ID/이름으로 구별은 가능 | 오른발/왼발 자동 의미 및 고정 높이 규칙 없음. 서로 다른 MIDI 킥 음색을 좌우 발로 간주하지 않음 |
| Hi-Hat Splash | metal.hi-hat. 별도 이름/ID와 주법 정보로 세분화 가능 | 표준 sounds.xml에는 pedal splash 세부 식별자가 없음. circle-x를 해당 주법으로 고정하지 않음 |

이 표에서 '저장 가능'은 OSMD에서 표시/재생 확인을 마쳤다는 뜻이 아니다. 사용자 승인된 매핑으로 승격한 것도 아니다.

## 기존 항목 재확인

- Ride Bell: sounds.xml에 metal.cymbal.ride는 있으나 ride-bell 세부 식별자는 없다. instrument-name은 Ride Bell로 보존할 수 있다. triangle/diamond를 악기 전용 표준으로 강제하지 않는다.
- Open/Closed/Pedal Hi-Hat: sounds.xml의 기본 식별자는 metal.hi-hat이다. instrument-name, 개별 ID, 필요 시 midi-unpitched 등으로 구분할 수 있지만 notehead/위치와는 별도다. GM 음색 번호와 MusicXML의 midi-unpitched 값은 범위가 다를 수 있으므로 임의 숫자 매핑하지 않는다.
- Ghost Note: notehead parentheses="yes"는 정식 괄호 표기 속성이다. 고스트 연주의 작은 음량까지 의미하거나 자동 적용하지 않는다.
- Rim Click/Cross Stick: 별도 이름/ID를 기록할 수 있다. stick-location의 rim은 타격 위치 픽토그램이며 이를 크로스 스틱 주법 전체와 동일시하지 않는다.
- R/L sticking: 전용 sticking 요소는 4.0 스키마에 없다. words 또는 other-technical 같은 확장 경로와 구분해야 한다. stick 요소는 스틱 재질/형태 픽토그램이며 R/L 손 지시가 아니다.

## 혼동하면 안 되는 표준 요소

- percussion: 악기/도구 픽토그램을 표시하는 direction-type 자식이다. 음표마다 악기 전용 머리 모양을 자동 정하는 맵이 아니다.
- damp: 공식 정의가 하프 댐핑 마크다. 이를 이름만 보고 cymbal choke 전용 표준으로 적용하지 않는다.
- handbell: 핸드벨/핸드차임 주법 요소다. 다른 악기의 음소거 기호로 무조건 재사용하지 않는다.
- other-technical: 아직 전용 요소가 없는 주법의 확장 표현. 표준이 허용하지만 프로그램 간 의미/표시 호환성은 별도이며 일반 문자열만으로 상호운용을 보장하지 않는다.
- notehead의 shape, filled, parentheses: 모두 표준 기능이다. 표준 기능의 지원과 악기-모양의 공식 대응은 서로 다른 주장이다.

## 확인된 버즈 롤 예

```xml
<notations>
  <ornaments>
    <tremolo type="unmeasured">0</tremolo>
  </ornaments>
</notations>
```

문서 예시일 뿐 기존 곡에 적용하지 않았다.

## 공식 출처

- [타악기 저장 구조](https://www.w3.org/2021/06/musicxml40/tutorial/percussion/)
- [공식 음색 식별자 목록](https://www.w3.org/2021/06/musicxml40/listings/sounds.xml/)
- [instrument-sound](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/instrument-sound/)
- [notehead](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/notehead/)
- [tremolo](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/tremolo/)
- [percussion](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/percussion/)
- [metal-value](https://www.w3.org/2021/06/musicxml40/musicxml-reference/data-types/metal-value/)
- [stick](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/stick/)
- [damp](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/damp/)
- [other-technical](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/other-technical/)
- [공식 v4.0 XSD](https://github.com/w3c/musicxml/blob/v4.0/schema/musicxml.xsd)

검증: 공식 페이지 재조회, 공식 v4.0 sounds.xml과 XSD에서 식별자/요소 대조. 원본 조회 자료는 docs/experiments/musicxml40-sounds.xml 및 musicxml40.xsd에 보관한다. OSMD 실행/GUI/음향 검증은 이번 범위에 포함하지 않았다.
