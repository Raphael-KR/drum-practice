# 확정 범례 OSMD 실제 출력 결과

2026-09-20 · 설치 OSMD 2.1.2 · Safari · 앱의 SVG 보정 없음.

재현: http://127.0.0.1:5173/qa/drum-key-final-audit.html?v=3
소스: public/qa/drum-key-final-audit.html
증거: docs/experiments/drum-key-final-audit.png 및 .json (입력 XML/노트 정보).

## 실제 확인

24개 개별 사례를 렌더링하고 Safari 전체 스크린샷과 SVG/OSMD 노트 정보를 확인했다.

- 정상 표시: China 원 안 ×, Splash 빈 마름모, Cowbell 채운 삼각형.
- 정상 표시: Snare Doubles 세 빗금, Snare Buzz의 버즈 롤 기호.
- 정상 표시: Hi-Hat Splash 원 안 ×와 Pedal ×의 구분.
- 정상 위치: Tom 3 B4 / Tom 4 A4 / Tom 5 G4, 오른발 F4 / 왼발 E4.
- 정상 표시: Closed/Open Hi-Hat G5에서 ×/circle-x, Ride F5 ×, Ride Bell F5 triangle, Crash A5 ×.
- 정상 표시: 별도 Hi-Hat Open 동작 ○ / Close 동작 ＋.
- 정상 표시: words로 넣은 각각의 R과 L.
- 누락 재현: Ghost note parentheses=yes의 괄호. 보통 머리만 표시.
- 누락 재현: other-technical로 넣은 R. 라벨과 달리 실제 주법 R은 출력되지 않음.

## 저장/표시 주의점

- Choked Crash: staccato의 점은 기본 배치에서 음표 아래로 나왔다. placement=above를 지정한 뒤 위쪽 점을 확인했다. 외형 테스트 성공이며, staccato가 초크 주법 자체를 의미하거나 재생한다는 뜻은 아니다. 이 인코딩을 실제 곡의 초크 의미 저장 정본으로 자동 채택하지 않는다.
- Snare Doubles: tremolo single=3의 빗금 외형 확인이다. RRLL 손기술/재생을 검사한 것은 아니다.
- triangle은 OSMD 음악 폰트의 윤곽(아래쪽이 약간 굽은 삼각형)이다. 별도 SVG 도형으로 덮지 않았다.
- 마지막 줄의 긴 검사 라벨/words는 OSMD의 충돌 회피로 높이가 달라진다. R/L은 표시되지만 실제 곡에서 일정한 스티킹 줄 배치는 별도 레이아웃 검증이 필요하다.
- 이번 테스트는 개별 노트의 범례 표시다. 복수 성부 동시 타격의 모든 충돌 조합, 리사이즈, 음향 재생을 전수 검증한 것은 아니다.

## 결론과 적용 범위

검사한 범례 기호는 고스트 괄호와 other-technical 텍스트를 제외하고 출력된다. words 경로로 R/L은 출력할 수 있다. 신규 누락은 발견하지 않았다. 초크/더블 스트로크는 기호 표시와 연주 의미 저장의 차이를 유지해야 한다.

검증 페이지/기록만 추가했다. 실제 곡 XML·메인 앱 렌더러·확정 매핑 방식은 변경하지 않았다.
