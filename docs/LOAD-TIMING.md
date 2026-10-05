# 악보 열기 시간 측정

악보 목록의 열기부터 로딩 안내 종료까지 `performance.now()`로 측정한다. 서버 전송이나 저장 악보 변경은 없다. 최근 10회만 현재 탭 메모리의 `window.drumLoadTimings`에 남기고 콘솔에 `[drum-load]`로 출력한다. 새로고침하면 지워진다. 곡명·음원·악보 내용은 기록하지 않는다.

각 결과는 build, outcome(success/error), totalMs, stagesMs를 가진다. 단위는 밀리초다.

- opening: 최초 안내 표시 대기와 이전 재생 세션 정리.
- read: `loadPracticeRecord` 호출부터 반환까지. IndexedDB 조회와 레코드 복원 포함.
- conversion: 준비 모듈 로드, MusicXML 읽기와 정규화.
- rendering: `renderMusicXML` 렌더링/캐시 경로 및 결과 기하정보 적용. 캐시 적중 시 짧을 수 있다. OSMD 내부의 순수 그리기 시간만을 의미하지 않는다.
- screen: 재생 화면과 악보 표시 자산 준비. 음원 준비 전후의 구간을 합산한다.
- audio: `player.load` 음원 준비/디코딩.

이 수치는 경과 시간이며 진행률이 아니다. 실패 시 실패 지점까지 기록하고 오류 후 목록 복구 시간은 제외한다. 최종 화면의 픽셀이 실제 표시된 시각이나 오디오 출력 지연을 측정하지 않는다.

## Site 비교

동일한 악보를 열어 첫 실행과 반복 실행을 각각 수집한다. 빌드번호와 단계별 ms, outcome을 비교한다. 첫 실행과 반복 실행의 캐시 차이를 구분한다. Site에서 실제 측정하기 전에는 병목을 단정하지 않는다.
