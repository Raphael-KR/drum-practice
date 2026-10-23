# 드럼 음원 제작

문서 역할: **실행 절차**. 현재 요청과 전역·프로젝트 지침의 승인 범위 안에서 수행한다. [정본 목록](../RULES-INDEX.md)과 [작업별 안내](../README.md)를 먼저 확인한다. 예시 명령·과거 기록은 이번 실행의 성공 증거가 아니다.

<a id="drum-audio--보존-드럼킷으로-음원-제작"></a>

## 보존 드럼킷으로 음원 제작

새 음원이 요청된 범위에서만 수행한다. [키트 Rule](../reference/score/drum-kits.md#garageband-drum-kits--드럼킷-선택과-보존-라이브러리)·[공통 도구 계약](../reference/score/tools.md#common-tools--공통-제작-도구-계약과-곡별-판독)·[제작 절차](produce-score.md#score-production-process--악보-제작-프로세스)를 따른다.

1. 사용자 지정 또는 곡의 목적·필요 주법을 기준으로 SoCal/Portland를 고르고 실제 manifest/패치/EXS/샘플·음역·velocity 지원을 확인한다. 선택 이유와 소개/청취 근거를 구분한다.
2. 승인된 악보 이벤트·타이밍·GM 매핑을 유지한다. 키트 샘플 선택용 MIDI 변환은 별도 설정으로 남긴다.
3. numpy/lxml 등 실제 필요한 의존성이 있는 Python과 ffmpeg를 확인한다. 예전 SoCal 전용 `render_socal_toms.py --library`나 현재 공통 `common/drum_audio.py`를 해당 곡 설정과 지원 범위에 맞게 사용한다. 모든 주법의 범용 렌더러라고 가정하지 않는다.
4. 새 출력 경로에서 렌더하고 이벤트·시각·파일 식별을 대조한다. 재생성 바이트, 브라우저 디코딩/위치 진행, 사람이 들은 음색·싱크는 각각 기록한다.
5. 연습 악보의 MusicXML artist·Song.artist·패키지가 선택 키트 이름으로 일치하는지 재읽기로 확인하고 기존 개발자에게 완성 결과를 인계한다.

보존본 누락·해시 불일치가 있으면 실제 경로·기대값·관측값을 기록하고 [라이브러리 입력 경계](../reference/score/drum-kits.md#garageband-drum-kits--제작-입력과-경계)를 확인한다. 실제 실행 명령은 곡별 제작 기록에 남기며 호출 방법은 [공통 도구 사용](produce-score.md#score-tools--공통-제작-도구-사용-절차)을 따른다.
