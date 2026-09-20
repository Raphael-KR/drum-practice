# 실험 기록

## 완료 판단 규칙

PRD F01–F14와 Q01–Q10을 유지한다. 구현 여부, 자동 검사, 브라우저 실행, 실제 iPad, 사용자 연주 평가는 서로 다른 증거다. 미검증은 PASS가 아니다. 기준을 낮춰 100%를 만들지 않는다.

## 회차 1 — 2026-09-18 / 원샷 v1

- 입력: PRD v0.1, 원본 PDF·MP3, 기존 로컬 분석 자료.
- 현재 상태: PRD만 존재, Git 저장소 없음. 기존 파일 보존.
- 목표: 자료 보존, 실행 가능한 웹앱, 순수 시간 모델과 테스트, 직접 편집·저장 흐름.
- 실행·변경·검증: 아래에서 실제 결과를 기록한다.
- GUI 및 iPad 검증: 아직 승인/접근 없음. 사용자 연주 평가는 미실시.

### 회차 1 결과

- 구현: TypeScript/Vite 웹앱, PDF.js 마디 후보 검출과 영역 편집, 기존 곡 110마디/441박/556개 가사 음절 보존, 로컬 IndexedDB 저장·ZIP 백업, 재생·속도·반복·마커·가사 수정 화면.
- 실행: `npm install`, `python scripts/prepare_demo.py`, `npm run build`, `npm run test`, `npm audit`.
- 첫 빌드: PDF.js 타입에서 지원하지 않는 옵션을 제거한 후 통과.
- 첫 테스트: 9개 중 8개 통과, 알려진 100 BPM 펄스를 템포 추정기가 50 BPM으로 판정하여 1개 실패.
- 의존성 감사: 최초 high 1/moderate 2. PDF.js 패치 및 테스트 도구 업데이트 진행.
- 평가: 완료 아님. 박의 절반/배수 후보 처리, 음악 음정·트랜지언트 위치, 브라우저 실행 및 실기기 검증 필요.
- 원샷 수정: v2에서 실제 신호로 속도 변경 후 트랜지언트 위치와 음정 검증을 추가하고 템포 배수 오류를 수정한다. GUI 검증 승인을 요청했으며 승인 전에는 브라우저를 열지 않는다.

## 회차 2 — 원샷 v2 / 2026-09-18

- 변경: 템포 추정의 절반 주기 선택 오류 수정. PDF.js·Vitest를 보안 수정 버전으로 업데이트. PDF 분석 코드를 지연 로딩하여 초기 JS를 약 141kB로 분리.
- 실제 신호 검사: 기본 WSOLA 설정의 타격음 오차 47.69ms로 30ms 기준 실패. 짧은 설정에서는 음정 테스트도 실패. `scripts/tune-stretch.mjs`로 18개 설정을 비교해 40/15/8ms 설정을 선택.
- 결과: 합성 신호의 최대 타격음 오차 23.69ms, 주파수 교차 계수 차이 최대 1Hz(16kHz 테스트 신호). 이것을 실제 곡 전체·기기 스피커 지연 결과로 확대하지 않는다.
- 검증: `round2-final-tests.txt` 11개 PASS, `round2-final-build.txt` 빌드 PASS, `audit-final.json` 취약점 0.
- 평가: 모델·신호 단위 검증 통과. 실제 GUI·iPad·연주 수용 기준은 미검증.

## 회차 3 — 실행과 입력 경계 검증 / 2026-09-18

- 변경: 음원 로드 중 이전 곡의 위치가 새 곡 설정을 덮어쓸 수 있는 알림 경로 수정. 음표 종횡비 유지 계산 추가. 실제 AudioContext 호출을 모사한 반복·취소 검사 및 독립 합성 악보의 마디 검출 검사 추가.
- 실행: `npm run dev -- --port 5173`; 127.0.0.1에만 바인딩. 외부 공개·LAN 공개 없음.
- 검증: `round3-tests.txt` 13개 PASS. CLI HTTP GET으로 앱 HTML과 110마디 데이터 응답 확인(`http-index.html`, `http-song.json`).
- 미검증: HTTP 응답은 브라우저에서 실행되었다는 증거가 아니다. 사용자에게 로컬 GUI 검증 승인을 요청한 상태다.

### 회차 3 추가 결과

- `round3-dom-tests.txt`: 15개 PASS. 두 번째 곡 생성은 jsdom에서 PDF/Audio 경계를 모사한 폼 계약 검증이다. 실제 브라우저 파일 읽기·오디오 재생 증거가 아니다.
- 저장된 반복 구간의 범위 수정 기능 추가. 브라우저 타이머가 반복 경계를 크게 놓치면 어긋난 상태로 계속하지 않고 일시정지하도록 수정.
- 기본 악보와 가사 크기 계산 및 다마디 쉼표 이미지 분할을 보정.

## 회차 4 — 실제 PDF 파이프라인 / 2026-09-18

- `scripts/check-pdf.mjs`로 실제 원본 PDF를 PDF.js와 네이티브 캔버스로 CLI 렌더링한 후 앱의 마디 검출 함수를 실행했다. GUI는 사용하지 않았다.
- 최초 실패: 얇고 회색인 오선이 빠져 67개 영역만 제안했다. 합성 검사는 통과했으나 실제 PDF에서 누락이 발견됨.
- 수정: 안티앨리어싱 임계값과 오선 간격 패턴 탐색을 보정했다. 다마디 쉼표의 굵은 가로선도 처리.
- 재검증: 3쪽에서 33/40/34 = 107개 인쇄 영역, 28개 줄 검출. 첫 다마디 쉼표를 4마디로 펼치면 연주 순서는 110마디다. 좌표 범위 검사는 모두 통과(`actual-pdf.json`). 마디 수 일치만으로 모든 음표 크롭을 시각 검증한 것으로 간주하지 않는다.
- 추가 수정: 현재 열려 있는 곡 삭제 후 자동 저장에 의해 복원될 수 있는 경로 차단, 마지막 마디 끝의 반복 경계 입력 허용, 가져오기 메타데이터 검증 보강.

### 회차 4 최종 평가와 다음 반복

- 최종 CLI 증거: `final-tests.txt`의 6개 파일/15개 테스트 PASS, `final-build.txt`의 TypeScript·Vite 빌드 PASS. `audit-final.json` 취약점 0.
- 문서 변경: PRD v0.2에 후속 구현 요청과 실제 상태 반영. 원본 v0.1 보존. `docs/acceptance.md`에 F01–F14/Q01–Q10별 증거와 미검증을 기록. 원샷 v4 누적본과 스냅샷 보존.
- 평가: 100% 미달. 자동 검사의 통과는 실제 브라우저·음원 청감·iPad·사용자 연주 수용을 대체하지 않는다.
- 현재 제약: 로컬 GUI 검증 승인을 이미 요청했으며 답변 대기. 전역 AGENTS의 “GUI 사용 전에는 작업을 멈추고 사용자에게 명시적 승인을 받는다”에 따라 GUI는 사용하지 않았다. iPad 접속·실기기 접근 및 사용자 연주 평가도 아직 없다.
- 다음 실행: 승인된 로컬 GUI 검증 → 재현 결함 수정 → 집중 재검증 → 원샷 지시문 갱신. 이후 실제 iPad·연주 수용 평가. 기준을 낮추거나 무의미한 동일 테스트 반복으로 완료를 만들지 않는다.
- 운영 상태: 로컬 개발 서버만 실행, 외부 배포·미디어 전송 없음. Git 커밋·push·PR 없음.

## 회차 5 — 승인된 로컬 GUI 검증 / 2026-09-18

- 사용자 승인: “로컬 GUI 검증 승인.” ego-browser TaskSpace 1에서 127.0.0.1:5173만 조작. 외부 전송 없음.
- 실제 브라우저: 예제 음원 디코딩·재생 위치 진행, 80%→81%→100% 변경 및 75.2/76.14/94 BPM 표시 확인. 출력 장치에서 들리는 소리의 청감 평가는 아님.
- 발견/수정: 후렴의 가사 음절 겹침(`gui-chorus.png`). 시간 기준의 가로 위치를 유지하고 충돌 음절을 아래로 배치, 악보 창 높이를 확장. 전체 556개 음절의 DOM 사각형 교차 0, 최대 아래 좌표 538px < 악보 창 하단 560px. `gui-lyrics-fixed.png`에서 확인.
- 자동 회귀 검사 중 DOM 테스트가 곡 저장 완료 전 속도 버튼을 누르는 경합 발견. 준비 완료 상태를 기다리도록 변경; `round5-retest.txt` 15개 PASS, `round5-build.txt` 빌드 PASS. 실패 기록은 `round5-tests.txt`에 유지.
- 실제 ZIP 다운로드·가져오기 성공. 마커 “GUI 검증 마커”, 반복 “GUI 후렴 4마디”가 복원됨. 미디어 포함 백업은 `gui-backup.zip`이며 로컬 증거 전용.
- 실제 PDF·MP3 파일 선택으로 별도 곡 “GUI 원본 가져오기 검증” 생성. Chromium 캔버스에서는 113개 영역 제안(CLI 네이티브 캔버스 107개와 차이). 자동 영역은 확정 정렬이 아님. `gui-import-regions.json`에 비교 자료 저장.
- 별도 곡에서 마디 이름 “GUI 수정 1”, 가사 “수정한 검증 가사”, 확인 체크를 변경하고 분할→병합 후 새로고침·다시 열기. 이름·가사·확인 체크·113마디 유지 확인.
- 진행 중: 실제 브라우저 4마디 20회 반복, 전체 곡·변박·카운트인·화면 크기 검사.

## 회차 6 — 마디 경계·서로 다른 PDF 렌더러 보정

- 실제 반복: `gui-20-loops.json`에 20회 되감김과 AudioBufferSource 예약을 기록. 동일 구간 시작 21개(20회 간격), 주기 10.2125236294초, 예약 시각의 누적 오차는 부동소수점 수준. 마지막 조작 중 별도 부분 구간 시작 1개도 원시 기록에 남겼으며 동일 구간 통계에 섞지 않음(`gui-loop-summary.json`). 출력 장치의 실제 소리는 별도 검증 필요.
- 화면 결함: 26/27마디 경계에서 약 28~32px 이동. 앞 마디 끝과 다음 첫 박의 인쇄 여백을 한 번에 건너뛰던 계산을 수정. 이전 마지막 박부터 다음 첫 박까지 연속 보간하고 가사에도 같은 좌표를 적용. 109개 경계 연속성 회귀 검사 추가.
- PDF 결함: Chromium 렌더러에서 음표 기둥을 마디선으로 오검출. 오선 위로 이어지는 기둥 제외 후 원본 33/40/34=107영역 확인. 별도 합성 PDF의 소수점 오선 간격을 놓쳐 0마디가 된 문제도 재현하고 보정. 이후 실제 파일 폼에서 100 BPM·8마디·19초 합성곡 생성 성공.
- 검증: `round6-tests.txt` 16개 PASS, `round6-build.txt` 빌드 PASS. 원본 PDF CLI 검사도 107영역 유지.
- 원샷 v5: 렌더링된 가사 충돌/잘림, 실제 마디 경계 연속성, 두 렌더러 차이, 독립 입력, 실제 오디오 예약과 청감 구분을 추가.
- 전체 원곡 100% + 2마디 카운트인 재생을 시작했고, 재생 중 1024×768/768×1024로 화면 크기를 변경. 가로 넘침 0, 보이는 버튼 높이 44px 이상. 이는 Chromium 크기 모사이며 iPad 실기기 검증은 아님.

### 회차 6의 추가 발견

- 원곡 100% 전체 재생 중 84마디에서 5/4 표시 확인(`gui-bar84.png`).
- 카운트인 결함: 마지막 준비 클릭 8.455979초 → 곡 첫 클릭 9.483233초로 1.027254초 간격. 박 간격 0.638283초보다 음원 첫 박 여백 0.388971초만큼 길었다. 원곡 앞 여백과 박 중간 진입에서 카운트인 위상을 실제 다음 박에 연결하는 수정 필요.

## 회차 7 — 카운트인 위상·곡 전환·최종 로컬 재검증

- 전체 원곡 기록: `gui-full-song.json`, 요약 `gui-full-summary.json`. 296.881625초 원곡을 100%로 끝까지 실행, 110마디 표시, 음악 클릭 441개 + 카운트인 8개, 음악 소스 1개. 예약 클릭은 곡 시간 모델과 부동소수점 오차 내 일치, 지연 예약 0. 이는 실제 AudioContext 호출 관측이며 출력 장치의 청감 측정은 아님.
- 화면 결과: 정상 관측 프레임(dt<100ms)의 경계 이동 최대 7.2px. 화면 크기 모사 전환 부근 44마디에 1010.9ms 프레임 간격/91.8px 이동도 관측됨. 이를 제외한 값만 전체 성능으로 제시하지 않는다. 실기기 회전 성능은 남아 있다.
- 수정: 준비 클릭 시작 위상을 실제 다음 박에 연결. 첫 박 전 여백과 박 중간 시작의 회귀 검사 추가. 음악 시작 위치·원본 시간을 자르거나 변경하지 않음.
- 재검증: `gui-countin-fixed.json`의 준비8클릭→곡4클릭 간격 모두 0.6382827268초. `gui-countin-five.json`은 준비10클릭 후 곡 5박과 85마디 첫 박을 관측; 강조 인덱스 1/6/11/16. 클릭 간격 오차는 부동소수점 수준.
- 테스트 도구 관찰: ego-browser 고수준 클릭 때 잠깐 화면 이탈 이벤트가 발생하여 앱의 안전 일시정지가 먼저 동작하고, 이어진 토글 클릭이 재생을 다시 시작하는 경우를 관측. 정지 검사는 현재 상태를 읽고 DOM 클릭으로 종료했으며 이를 실제 사용자 기기 동작으로 일반화하지 않음. 원시 데이터의 추가 부분 소스는 보존.
- 수정: 곡 로드 때 이전 활성 루프 해제. 백업 재연결 창을 닫으면 임시 복원 상태 해제. 두 줄 보기에서도 음표 종횡비 유지.
- 실제 곡 전환 검증: 예제 25~29마디 반복 활성화 → 독립 합성곡 열기 → 처음부터 재생 → 1.05초 진행 확인.
- 실제 편집 검증: 합성곡 PDF의 첫 영역을 마우스 드래그해 적용, 새로고침 후 재열기·IndexedDB 좌표 대조. `gui-crop-restored.json`.
- 속도 위치: 정지 위치 215.41초에서 80%→81% 변경 후 215.41초 유지, BPM 75.2→76.14 확인.
- 최종 자동 검사: `round7-final-tests.txt` 19개 PASS, `round7-final-build.txt` 빌드 PASS.
- 원샷 v6 갱신. 최종 화면 `gui-final.png`, 두 줄 화면 `gui-two-rows.png`. 테스트용 곡은 GUI 이름으로 구분하여 보존. 원본 악보·음원은 변경하지 않음.
- 최종 판단: 로컬 GUI 검증 진전 및 결함 수정 완료. 전체 제품 100% 수용은 미완료. 실제 iPad Safari·오디오 중단/무선 출력·청감 및 사용자 드럼 연주 검증이 필요. 미디어 없는 백업의 다른 파일 연결 방지와 모든 편집 경계 조합도 추가 확인 대상. 외부 배포·미디어 업로드는 하지 않음.

## 회차 8 — 가사를 읽는 시선 재평가

- 회차 5의 여러 행 충돌 회피는 글자 겹침은 없앴지만 가사를 지그재그로 읽게 했다. 사용자가 제기한 시선 문제에 맞지 않아 이 방식을 폐기했다.
- 변경: 같은 악보 줄의 가사를 한 기준선에 배치하고, 충돌하는 글자 상자만 최소 제곱 방식으로 좌우 조정. 가사 시각·음악 재생선·음표 좌표는 바꾸지 않음.
- 실제 1024px 화면: 556음절, 겹침 0, 기준선 1개, 최대 글자 이동 18.1058px, 최대 아래 좌표 388.81px < 악보 창 하단 505.5px. `gui-single-line.json`, `gui-final-single-line.png`.
- 검증: `round8-tests.txt` 20개 PASS, `round8-build.txt` 빌드 PASS.

## 회차 9 — 미디어 없는 백업·파일 정본 대조

- 변경: 새 백업에 PDF·음원 SHA-256을 넣고, 파일 포함 복원과 재연결에서 대조. 같은 크기의 다른 파일을 거부하는 회귀 검사 추가. 이전 백업은 해시가 없어 동일한 보증을 제공하지 않음.
- 실제 브라우저: 독립 합성곡의 미디어 없는 ZIP 다운로드 → 테스트용 합성곡만 라이브러리에서 삭제 → ZIP 가져오기 → 다른 PDF 선택 시 거부 메시지 확인(현재 예제곡 보존) → 동일 PDF·음원 선택 시 8마디와 편집 내용 복원. 원본 사용자 곡은 삭제하지 않음.
- `gui-metadata-backup.zip`, `gui-metadata-restore.json`에 증거 보존. 원본을 포함한 백업은 로컬 전용이며 Git 제외.
- 최종 검증: `round9-tests.txt` 8파일/21테스트 PASS, `round9-build.txt` 빌드 PASS.
- 원샷 v7: 단순 겹침 해소뿐 아니라 한 줄 읽기 유지와 백업 원본 정체성 대조를 다음 반복 기준으로 추가.
- 로컬 GUI 검증 범위 종료. 결과 화면은 예제곡 25마디/100%/정지 상태로 남긴다. 실제 iPad 사용을 위한 동일 Wi-Fi 여부 질문은 답변 대기. 수용 기준을 바꾸지 않았으며 제품 전체 100% 완료를 선언하지 않는다.

## 회차 10 — 노래별 독립 HTML 내보내기

- 사용자 후속 요청: 곡마다 HTML 한 파일로 보관하고 그 안에서 JavaScript가 실행되도록 변경. iPad 파일 실행 지원은 실기기에서 따로 확인해야 함을 설명.
- 변경: 상단 HTML 저장 버튼, 음원/PDF/페이지/곡 데이터를 Base64+JSON으로 묶기, JS·CSS·속도 처리 Worker 인라인 포함, 독립 파일 자동 곡 열기. 변경 시 HTML을 다시 저장하도록 안내. 파일 모드는 IndexedDB를 사용하지 않음. 원본 파일·기존 ZIP 백업 기능 보존.
- 빌드: esbuild를 명시적 개발 의존성으로 추가. 0.28.0 설치 시 low 1 감사 결과를 보고 기존 환경과 같은 0.28.2로 맞춤. 최종 감사 0. 템플릿 생성은 predev/build에 연결.
- 산출물: `exports/바람과 언덕의 발라드-드럼연습.html`, 10,833,534 bytes. 110마디/556음절/3쪽, 원본 음원 포함. 외부 script 태그 없음.
- 실제 GUI: ego-browser TaskSpace 2에서 `file://` 직접 열기→재생 위치 진행→80% 75.2 BPM 확인. 네트워크 차단 후 재열기→마커·반복 생성→81% 처리→HTML 재저장→그 파일에서 마커·반복·81%·61.66초 복원→재생 성공. 추가 페이지 리소스 요청 0.
- 웹앱 경로: 실제 상단 버튼으로 HTML 다운로드→file URL 재열기→110마디 확인. CLI로만 만든 파일의 성공을 UI 내보내기 증거로 대신하지 않음.
- 검증: `round10-final-tests.txt` 24개 PASS, `round10-final-build.txt` 빌드 PASS, `round10-audit.json` 취약점 0. `portable-verification.json`, `portable-file.png` 보존.
- 범위: 독립 파일은 기존 곡 연습·편집·재저장용이다. 새 곡/PDF 입력과 라이브러리는 웹앱에서 제공. 외부 전송·배포 없음.
- 평가: F15/F16의 Mac 로컬 파일 실행·재저장 검증 통과. 실제 iPad 파일 앱/Safari/HTML 실행 앱의 동작과 연주 평가는 미검증. 단일 HTML이 iPad 기본 미리보기의 실행 제한까지 해결했다고 주장하지 않음. 이전 동일 Wi-Fi 질문은 이 요청의 필수 전제가 아님.

## 회차 11 — iPad mini 가로 화면, 마디 탐색, 파란색 팔레트

- 입력: 상단 가수-곡명/원곡 음표 BPM, 손잡이 위 마디 풍선 탐색, RGB(63,116,212), 가로 전체화면 조작 재배치. 후속 지시: 악보는 축소하지 말고 아래 여백부터 줄인다.
- 설계: `docs/IPAD-LANDSCAPE-UX.md`. 기본 crop 배율 산식을 유지하고 stage의 310px 하한 제거, 여분 125→94px, 가사 간격 12→6px. 8개 명시적 기능 버튼과 자주 쓰는 마커 바로가기. 기능은 열기→조작, 긴 목록은 페이지 이동. 가수 선택 필드를 기존 자료와 호환되게 추가하고 메타데이터 저장을 전체 시간 재정렬과 분리했다.
- 구현: `src/workspace.ts`에 기존 DOM 조작을 재배치하는 모듈 추가. 반복/마커/소리/화면/파일은 개별 dialog, 악보·가사·곡 정보 편집은 직접 열기와 탭. 마커/반복·가사·원본 PDF 페이지 넘김. slider는 input 시 악보 탐색, pointer 종료 시 기존 재생 상태 복원. 포커스가 남아 있어도 진행 갱신. `#3f74d4` 강조색, 44px 이상 기본 조작, safe-area와 dvh 대응. 웹앱/단일 HTML 공통 UI.
- 실행: 기존 개발 서버가 내려가 있어 127.0.0.1:5173 연결 거부를 확인한 후 `npm run dev`로 기동. ego-browser TaskSpace 3에서 사용자 승인 범위의 로컬 웹앱/파일 GUI만 사용했다. 외부 업로드/배포 없음. 저장소는 Git 저장소가 아님.
- 첫 평가: 1133×744에서 페이지 넘침 없음, 기본 crop 133.640625px 유지. 마우스 드래그 73마디, touch CDP 드래그 88마디에서 풍선과 실제 마디 일치. 재생 중 탐색 완료 후 재생 복귀 및 seek 포커스 유지 중 값 증가 확인. 강제 count-in 재시작 없이 `play(false)`로 재개.
- 발견/수정: 1133×660에서 가사 편집 dialog 내용이 20px 넘침 → 한 화면 항목 수 계산 수정(4개), 최종 scrollHeight=clientHeight=626. 두 줄 보기의 마디 라벨/가사 및 활성 밑줄 겹침 → 행 간격·라벨 위치·활성 표시 조정. 악보·가사·메타데이터 직접 버튼으로 기능 접근 깊이 단축. 원샷 v9에 이 기준과 검증 범위를 추가.
- 테스트 반복: 기존 24개 통과 후 DOM 회귀 1개 추가. 최초 예상 시각 61.66초가 정확한 25마디 시작 직전이어서 실패 → 경계에서 벗어난 62초로 테스트 입력을 고침. 최종 10파일/25개 PASS (`round11-final-tests.txt`), TS/Vite/portable 빌드 PASS (`round11-final-build.txt`). 테스트 기준을 낮추거나 실제 iPad로 대체하지 않았다.
- 최종 GUI: file URL 실행, 1133×744/660 기본 한 줄 화면 scroll 크기=viewport, 잘린 기본 버튼 0, 높이 44px 미만 기본 버튼 0. 마지막 너비 검사에서 처음으로 아이콘 버튼이 44px 미만으로 발견되어 모든 버튼의 min-width를 44px로 보정했다. 보정 후 CSS cascade 검사에서 min-width/min-height=44px 확인(`round11-target-size.json`); 이 마지막 3px 너비 보정 이후 GUI 재측정은 하지 않았다. computed color는 `rgb(63, 116, 212)`. 660 높이에서 반복/마커/소리/화면/악보/곡 정보/파일 dialog 조작 잘림 0; 가사 넘침 수정 후 재확인. 원본/편집 동작은 기존 ID와 이벤트를 유지.
- 내보내기: 실제 HTML 저장 버튼 → `exports/round11-reexport.html` → 재열기에서 Real Paradis 곡명, ♩=94, 저장한 73마디 위치 확인. 배포할 기본 파일은 `exports/바람과 언덕의 발라드-드럼연습.html`로 재생성했다. 테스트 파일을 기본 곡의 정본으로 사용하지 않음.
- 증거: `round11-layout.json`, `round11-final.png`, `round11-final-scrub.png`, editor/lyrics/rows 개선 전후 이미지. 결과 탭은 최종 기본 HTML의 25마디/100%/정지 상태로 남겼다.
- 평가: F17–F20의 로컬 기본 배율 UI/탐색/파일 실행 확인. Q14 페이지 넘침/버튼 잘림 없음 확인; 마지막 최소 버튼 너비 보정은 CSS 검사 통과, 보정 후 GUI 재측정은 남음. 실제 iPad Safari/HTML 실행 앱, 온스크린 키보드 사용, 드럼 연주 평가는 미검증. 모든 기기·사용자가 임의 확대하는 모든 배율에서의 무스크롤을 확인한 것은 아니다. 제품 전체 100% 완료는 선언하지 않는다.

## 회차 12 — 두 줄 보기 선택 복구

- 사용자: 두 줄을 동시에 보는 뷰가 사라졌다고 보고.
- 원인: 렌더링 기능은 남아 있었지만 회차 11에서 표시 방식 선택을 화면 설정 dialog 안으로 이동하여 주 화면에서 보이지 않았다.
- 변경: 보기 선택을 악보 위 상태줄에 다시 상시 노출. 옵션명을 ‘두 줄 함께 보기’로 명확히 바꿈. 기존 두 줄 렌더러·저장 설정 유지, 단일 HTML 재생성.
- 검증: 주 화면 선택기의 위치와 rows 변경 시 two-rows 적용을 기존 DOM 회귀 검사에 추가. `round12-tests.txt`, `round12-build.txt`에 결과 기록. 이번 작은 배치 복구는 GUI/실기기 재검증 없이 DOM 및 빌드로 확인했다.

## 회차 13 — 직전 인터페이스로 되돌리기

- 사용자: 두 줄 보기가 화면 설정에 있음을 이해했고 이전 인터페이스를 선호하여 되돌리기 요청.
- 변경: 회차 12의 보기 선택기 상시 노출을 취소하고 회차 11처럼 하단 ‘화면’ dialog 안으로 복원. 옵션명도 ‘두 줄 고정 비교’로 복원. 두 줄 렌더러와 다른 개선은 유지했다.
- 문서: 원샷 v11에 v10 철회를 명시하고 UX 문서의 화면 메뉴 설명을 복원.
- 검증: 보기 선택기의 screen-dialog 위치와 두 줄 모드 변경 DOM 검사 포함 25개 PASS, 빌드 PASS. `round13-tests.txt`, `round13-build.txt`. 단일 HTML 재생성. GUI 재검증은 수행하지 않음.

## 회차 14 — 초기 하단 안내 문구 제거

- 사용자 요청에 따라 곡 활성화 완료 시 ‘준비되었습니다. 가사 위치는 필요하면 보정하세요.’를 표시하지 않도록 상태 텍스트를 비웠다. 다른 로딩·저장·오류 상태 동작은 유지.
- 기존 DOM 검사의 로드 대기 조건은 제거된 문구 대신 실제 110마디 렌더링으로 변경. 새 테스트 추가 없음.
- 검증: `round14-tests.txt` 25개 PASS, `round14-build.txt` 빌드 PASS. 단일 HTML 재생성. GUI 재검증 없음.

## 회차 15 — 작업 상태를 파일·안내 안의 로그로 이동

- 사용자 제안: 상태 문구가 꼭 필요하면 파일·안내 메뉴 안에 로그로 배치.
- 변경: 기존 하단 상태 요소를 ‘파일 · 안내 → 최근 작업 기록’으로 옮김. 연습 화면의 상태 줄과 예약 높이 제거. 시각과 함께 최근 5건을 보관하고 연속 중복 메시지는 생략. 빈 상태 갱신은 기록을 지우지 않음. 기록은 현재 실행 메모리에만 유지하며 파일에 저장하지 않음.
- 오류는 기존 잠깐 표시되는 알림을 유지하면서 로그에도 기록. 일반 자동저장·준비 메시지는 화면 하단에 표시하지 않음.
- 검증: 기존 25개 테스트 PASS 및 빌드 PASS (`round15-tests.txt`, `round15-build.txt`), 단일 HTML 재생성. 이번 변경은 GUI 재검증 없이 소스·회귀 검사로 확인.

## 회차 16 — 누르면 닫히는 한 줄 오류 알림

- 사용자 요구: 잠깐 뜨는 오류 대신 악보 위 여유 공간에 ‘알림’ 버튼을 한 줄로 표시하고 누르면 닫기.
- 변경: 하단 toast/자동 타이머 제거. 악보 위 상태줄 가운데에 ‘알림 · 오류 내용 · ×’ 버튼 표시. nowrap과 ellipsis로 긴 메시지도 한 줄 유지, 전체 내용은 title/접근성 이름과 작업 기록에서 확인. 오류만 노출하고 성공 안내는 파일·안내 기록에 남김.
- 편집 창이 열려 있으면 해당 창 상단에서 알림을 표시하며, 창을 닫으면 악보 위로 복귀. 곡을 열기 전 오류는 main에 표시. 클릭/키보드 활성화로 닫을 때까지 유지.
- 검증: 잘못된 마디 번호로 오류 발생 → 상태줄 버튼 표시/문구 → 클릭 닫기를 기존 DOM 검사에 추가. `round16-tests.txt` 25개 PASS, `round16-build.txt` 빌드 PASS. 독립 HTML 재생성. GUI 레이아웃 재검증은 수행하지 않음.

## 회차 17 — 한 줄 보기에서만 크기 조절 노출

- 사용자 결정: 악보 크기 기능은 유지하되 한 줄 보기 선택 시에만 메뉴 표시.
- 변경: 악보 렌더링 시 표시 방식에 따라 크기 슬라이더의 라벨 전체를 hidden 처리. 두 줄 보기에서는 숨기고 한 줄로 전환하면 다시 표시. 저장된 배율은 보존하며 곡을 다시 열 때도 선택된 모드에 맞춰 적용.
- 검증: 기존 DOM 검사에 두 줄 전환 시 숨김/한 줄 복귀 시 표시 확인 추가. `round17-tests.txt` 25개 PASS, `round17-build.txt` 빌드 PASS. 단일 HTML 재생성. GUI 재검증 없음.

## 회차 18 — 웹앱 중심 개발로 전환 및 Git 초기화

- 사용자 요청: HTML 파일 갱신 중심으로 진행하지 말고 http://127.0.0.1:5173 웹앱을 대상으로 개발, Git 관리.
- 기존 구조 확인: 웹앱은 이미 src/를 Vite로 제공하며 개발 서버 HTTP 200. 원래 Git 저장소가 없어 main 브랜치로 초기화했다.
- 작업 지침: AGENTS.md, README, 원샷 v15에 웹앱 정본 및 요청 시에만 예제 HTML 내보내기를 명시. 이번 회차는 예제 HTML을 재생성하지 않았다. 내보내기 기능 자체는 유지.
- Git 범위: 소스·문서·테스트·설정 44개 파일. 미디어·분석 자료·로컬 실험 출력·생성 HTML은 ignore하고 기존 파일은 보존. 원격 저장소 미설정, push/공개 없음.
- 검증: 25개 테스트 PASS (`round18-tests.txt`), TypeScript 검사 PASS. 서버가 제공하는 /src/main.ts에서도 현재 한 줄 모드 크기 메뉴 조건을 확인했다. GUI 재검증 없음.

## 회차 19 — Apple iPad mini 시뮬레이터 준비

- 사용자 지정 Safari 응답형 디자인 모드/Simulator를 향후 개발·검증 경로로 채택.
- Apple 공식 문서 확인, 설치된 iOS 18.6 런타임과 iPad mini A17 Pro 기기 유형 확인. 새 프로젝트 전용 시뮬레이터 생성·부팅, Safari로 localhost 웹앱 열기, 1488×2266 첫 화면 캡처 확인.
- Simulator 앱 GUI 제어는 이름/예전 경로에서 Invalid app. 부팅·웹앱 로드는 simctl 경로로 확인했지만 가로 회전·연습 기능 및 Safari 응답형 모드 조작은 미검증. docs/IPAD-SIMULATOR.md에 현재 상태와 후속 검증 기록.
- 앱 코드/HTML 변경 없음. 문서만 Git 기록. 원격 push 없음.


## 회차 20 — Device Hub 재시작과 제어 경로 재검사

- 목표: 사용자에게 보이는 Device Hub를 종료·재실행하고 Computer Use·CLI·Xcode MCP 제어 가능 여부를 실제로 구분한다.
- 범위: 프로젝트 전용 iPad mini 시뮬레이터와 localhost 웹앱. 완료 조건은 재실행 및 각 제어 경로의 관측 결과 기록. 앱 코드·HTML·기기 데이터 초기화·전역 권한 변경은 제외.
- 실행: 사용자 요청으로 Device Hub PID 96680에 TERM, 종료되지 않아 해당 PID에 KILL 후 재실행. 새 PID 97314 확인. 기존 기기 데이터와 부팅 상태 유지.
- Computer Use: 경로·bundle ID·앱 이름을 통한 연결이 재실행 후에도 timeoutReached. 사용자는 창이 보인다고 확인했으므로 창 부재로 단정하지 않는다.
- CLI: devicectl orientation set/get으로 landscapeLeft 설정·조회 성공. simctl screenshot의 2266×1488 이미지에서 iPad Safari localhost 첫 화면 확인. HTTP 200 확인. 증거: docs/experiments/ipad-mini-landscape-cli.png.
- Xcode MCP: xcrun mcpbridge initialize와 tools/list 성공. Apple device-interaction 스킬에 따라 세션 시작 검사를 수행했으나 “This agent isn't approved to use Xcode's tools yet”로 거부. 프로젝트 열기/생성에 따른 Xcode 승인이 필요하다는 서버 안내. 터치·메뉴 조작은 실행하지 못했으며 성공으로 보고하지 않는다. 세션 키는 발급되지 않았다.
- 결과: 재시작 완료. CLI 회전·캡처는 사용 가능, Computer Use 연결은 미해결, Xcode MCP 터치는 승인 단계에서 차단. docs/IPAD-SIMULATOR.md 갱신, 문서 diff 검사. 소스 변경이 없어 앱 테스트는 재실행하지 않았다. 원격 push 없음.


## 회차 21 — Xcode 승인 반영 및 런타임 요구 확인

- 사용자 승인 후 MCP 재시도. 초기에는 동일 승인 거부였으나 웹 소스 참조용 DrumPractice.xcworkspace를 열어 요청을 연결하고 사용자가 승인한 뒤 권한 오류 해소.
- XcodeOpenWorkspace 자체는 네이티브 타깃 없는 작업공간의 실행 대상 해석 시간 초과. 후속 StartSession은 권한 오류 대신 iOS 27.0+ 필요 오류를 반환. 현재 설치 iOS 18.6이므로 세션/터치 실행 없음.
- iOS 27.0 arm64 다운로드 시작, 실제 다운로드 8.05 GB 확인. 여유 약 12 GiB로 설치 공간 충분성을 보장할 수 없어 해당 다운로드 프로세스에 SIGINT로 중단. 다른 파일/런타임 삭제 없음.
- 승인 해결과 실제 제어 성공을 구분한다. 잔여 조건은 공간 확보 및 iOS 27 런타임 설치. 앱 코드/HTML 변경 없음. 작업공간 XML 파싱과 git diff 검사 수행.


## 회차 22 — 디스크 재확인 및 iOS 27 설치

- 사용자 요청: 여유 공간 확인 후 가능하면 설치. 시작 시 APFS 여유 26.0 GB(24 GiB) 확인.
- iOS 27.0 arm64 런타임 8.05 GB 다운로드 및 설치 Done, exit 0. 별도 simctl 조회에서 빌드 24A434/isAvailable true 확인. 증거: docs/experiments/ios27-install.json.
- 설치 후 여유 약 16 GiB. 기존 iOS 18.6·시뮬레이터 데이터·사용자 파일 삭제 없음. 앱 코드 변경 없음.
- 런타임 설치 완료와 MCP 터치 검증을 구분하며, 후자는 아직 미수행. 문서 diff 검사 후 Git 기록.


## 회차 23 — iOS 27 iPad mini MCP 터치 smoke

- 사용자 요청에 따라 설치된 iOS 27 iPad mini(9ECBE1E1-D908-45A7-AF31-5F9FEAB568E2)를 부팅, 가로 방향 설정. 멈춰 있던 Vite 서버 재실행 후 localhost HTTP 200 확인.
- Apple device-interaction 절차로 MCP 세션 시작 성공, Safari 화면·hierarchy 확보. 실제 hitPoint 터치로 예제 곡 로드 → 화면 설정 열기 → 닫기 성공. 루트 에이전트도 캡처 01/04/05를 직접 확인했다.
- 악보/94 BPM/하단 메뉴 표시 확인. 캡처 applicationState NotRun과 실제 Safari UI 상태 차이는 도구 메타데이터 한계로 기록. 재생/전체화면/두 줄 모드 전체 QA는 미실행.
- 앱 소스·예제 HTML 변경 없음. 증거는 docs/experiments/ios27-capture01~05, 문서는 docs/IPAD-SIMULATOR.md.
- 검증 후 DeviceInteractionEndSession의 `Session stopped` 확인. 세션 키는 로그·Git에 저장하지 않았다.

## 회차 24 — iPad Safari 연습 기능 검증·수정 반복

- 목표/범위: iOS 27 iPad mini 가로 Safari localhost 웹앱에서 재생·탐색·속도·반복·마커·보기·전체화면·도구 메뉴를 직접 조작. 실제 전후 화면/계층을 완료 근거로 삼고 원본 편집·실물 청감 평가는 제외.
- 초기 실행: 재생/정지, 메트로놈 스위치, 99→100% 속도, 두 줄 악보·가사 및 zoom 숨김, 반복25~29 첫박 복귀, 마커 생성/이동/삭제, 각 편집/정보 메뉴 확인. 속도 최초 표시 차이는 처리 중 상태이며 정착 후99 확인.
- 발견/수정1: Safari range에서 손을 놓아도 마디 풍선이 남음 → change에서도 숨김. 현재 위치가 바뀌어도 aria-valuetext가 옛 마디에 남음 → frame에서 현재마디 갱신. 시뮬레이터 재검증 통과.
- 발견/수정2: 전체화면 두 줄 모드의 하단버튼 잘림·네이티브 종료 버튼의 제목 가림 → 높이800까지 compact 간격 적용, 전체화면 제목 시작 여백. 악보 크기 유지. 최종 캡처에서 8버튼 y666~710, 제목x88 확인.
- 발견/수정3: 설정 저장/새로고침 후 저장된 악보 Blob이 Loading error, arrayBuffer도 The object can not be found here 반환. 내부 브라우저 원인은 미확정. 저장 매체를 ArrayBuffer+MIME(bytes-v1)로 변경, 기존 Blob 읽기 호환 유지. 읽기 실패는 쓰기 전 거부해 기존 곡 보존. 반복 저장·재읽기 및 실패보존 테스트 추가.
- 예제복구: 임시 localhost 복구 페이지로 real-paradis 미디어만 public/demo 원본에서 복구. song JSON 백업 후 post-read 비교 동일true, 페이지3 확인. 다른 곡/원본파일 삭제 없음. 임시 페이지는 public에서 제거하고 실험 증거로만 보관.
- 회귀:26테스트 PASS, TypeScript 포함 build PASS. 원샷프롬프트 v16/v17에 실제 iPad조작·전체화면·저장재열기 기준 반영. 자세한 시나리오와 한계는 docs/IPAD-QA.md. 증거 docs/experiments/round24*. 기존 exports HTML 재생성 없음.
- 최종GUI: bytes-v1저장후Safari새로고침→내곡재열기/악보표시PASS. seek59→home1 접근성 갱신PASS. 한줄·100%·클릭on·1마디·일시정지복원, 테스트마커/반복삭제, MCP Session stopped. 루트도최종캡처직접확인.


## 회차 25 — 최신 수정본 단일 HTML 내보내기

- 사용자 요청에 따라 scripts/build-portable.mjs --demo 실행. exports/바람과 언덕의 발라드-드럼연습.html 재생성(10.35 MiB).
- 최신 템플릿과 내장 JavaScript/CSS 일치 확인, PDF·음원·3페이지 이미지 포함 및 110마디/가사 데이터/94 BPM 확인. 예제 원본 public/demo 데이터를 사용하며 브라우저별 개인 저장 상태는 포함하지 않는다.
- 이번 검증은 생성물 구조·코드 동일성 검사이며 file URL/iPad 파일 실행 GUI는 재검증하지 않았다. HTML은 Git 제외, 내보내기 기록만 커밋.

## 회차 26 — 무음 모드에서도 음악 재생용 세션 요청

- 실물 iPad에서 사용자가 무음 모드를 끄면 소리가 나는 것을 확인. 사용자 요청으로 Web Audio 재생 직전 지원 환경의 navigator.audioSession.type을 playback으로 설정하도록 변경했다. 음악·메트로놈은 같은 AudioContext이므로 둘에 적용된다. 기기 무음 설정/볼륨 자체는 변경하지 않는다.
- 매 재생 시 resume 전에 요청한다. API 미지원/설정 거부 시 기존 재생 경로를 유지하며 초기 로드에서 다른 앱의 오디오 세션을 건드리지 않는다. WebKit 근거: https://bugs.webkit.org/show_bug.cgi?id=237322#c6
- 지원/미지원/거부 환경 및 두 번째 재생의 호출 순서 검사 추가.29테스트 PASS, TypeScript 포함 build PASS. 예제 HTML 재생성(10.35 MiB), 최신 템플릿 런타임 동일 및 audioSession 설정 포함 확인.
- 실물 Edge/Sitecase에서 새 HTML로 무음 모드 청취는 아직 미검증. 기존에 복사한 파일에는 자동 반영되지 않으므로 새 파일 교체가 필요하다. 브라우저별 개인 연습 상태는 이번 예제 내보내기에 포함하지 않는다.


## 회차 27 — iOS 18.6 환경 삭제

- 사용자 명시 요청으로 iOS 18.6(22G86) 런타임과 연결된 Drum Practice iPad mini(CAC78C7B-F71D-4C5B-B03E-734479387F43) 삭제. 대상 기기는 Shutdown 확인, runtime delete dry-run으로18.6만 대상임을 확인 후 simctl 공식 삭제 명령 실행.
- 재조회에서18.6 런타임/기기 없음, 기기 데이터 디렉터리 없음 확인. iOS27 런타임 및 iPad mini(9ECBE1E1-D908-45A7-AF31-5F9FEAB568E2) 유지. 실물 iPad 조작 없음.
- df 여유공간 약7.3GiB→13GiB. APFS/캐시 등으로 표시량은 시점에 따라 변할 수 있다.

## 회차 28 — 두 줄 현재 마디 전체 음영 복원

- 사용자 지적: 현재 마디 음영이 악보에서는 사라지고 아래 가사 쪽에만 보임.
- 원인: .measure.active 배경 위에 불투명한 흰 종이를 포함한 .crop 배경 이미지가 그려져 악보 영역의 음영을 가림. 최초 Git 등록본부터 해당 구조였으므로 그 이전 정확한 변경 시점은 특정하지 않음.
- 수정: 활성 마디의 .crop에도 accent-soft 배경색과 background-blend-mode:multiply 적용. 검은 음표 대비·악보 배율·가사 위치·탐색 동작 유지, 비활성 마디는 흰색 유지.
- 검증: TypeScript 포함 build PASS. iOS27 iPad mini Safari 두줄25마디 스크린샷에서 악보전체 파란음영·인접마디 흰색·검은음표 확인. 로컬 증거 docs/experiments/round28*. 예제 exports HTML은 요청이 없어 재생성하지 않음.
- 추가 검증: 26마디 터치 후 25마디는 흰색으로 복원되고 26마디 전체로 음영 이동. 두 스크린샷을 직접 확인. 원래 한 줄 보기·1마디·일시정지로 복원하고 DeviceInteraction 세션 종료 확인.

## 회차 29 — 속도 조절을 BPM으로 변경

- 목표·범위: 웹앱 재생 속도 입력의 퍼센트 표기를 BPM으로 교체. 원곡 BPM은 유지하고 버튼은 ±1 BPM, 숫자 입력은 재생 BPM을 지정한다.
- 구현: 입력 BPM / 원곡 BPM을 오디오 재생 비율로 전달. 기존 1% 반올림을 제거해 94→93 BPM이 정확히 적용되며 기존 저장 비율은 BPM으로 환산해 표시한다. 지원 범위(원곡의 0.5~1.2배)를 유지하고 곡별 입력 범위도 갱신한다. 잘못된 숫자는 오류로 안내한다.
- 완료 조건·검증: 94→93 BPM, 직접 80 BPM 입력→81 BPM 버튼 변경, 저장 비율 81/94 및 상한112.8 BPM 확인. 전체 30테스트 PASS, TypeScript 포함 build PASS. 이번 변경의 GUI 검증은 수행하지 않음.
- PRD 갱신. 예제 HTML 재생성 및 외부 배포는 수행하지 않음.

## 회차 30 — 중복 재생 BPM 표시 제거

- 사용자 요청으로 악보 상단의 `xx BPM · 재생` 요소와 매 프레임 갱신 코드를 제거했다. BPM 속도 입력과 제목의 원곡 BPM은 유지한다.
- 검증: 전체 30테스트 및 TypeScript 포함 build PASS. 예제 HTML은 재생성하지 않음.

## 회차 31 — 일시정지 후 현재 마디 처음부터 재생

- 사용자 요청: 재생 버튼으로 다시 시작할 때 현재 마디 시작으로 이동한 뒤 음악·메트로놈을 같은 기준으로 예약한다. 준비 카운트 설정은 유지한다. 재생 중 속도 변경·탐색의 내부 재시작은 기존 위치를 유지한다.
- 검증: 마디 중간 일시정지→재생 시 시작 위치, 음원 시작 오프셋, 첫 메트로놈 시각을 준비 카운트 0/2마디에서 검사. 최초 테스트의 카운트 단위를 박으로 가정한 오류를 실제 설정 단위인 마디로 수정했다. 전체32테스트 및 build PASS. 실물 청취 검증은 수행하지 않음. 예제 HTML 재생성 없음.

## 회차 32 — 지정 마디 수만큼 앞부분으로 이동

- 절대 마디 번호 이동 입력을 상대 이동으로 변경. 사용자 방향 정정에 따라 25마디에서 4 입력 시 21마디 첫 박으로 돌아간다. 첫 마디를 넘으면 첫 마디에 멈춘다. 입력은 1 이상의 정수만 허용한다.
- 검증: 마디 중간에서 4마디 돌아가기 및 시작 경계 확인. 최초 검사는 다른 곡으로 전환된 뒤 실행되어 실패했고, 예제 곡 활성 상태에서 검사하도록 위치를 수정했다. 전체33테스트 및 build PASS. GUI 검증·예제 HTML 재생성 없음.

## 회차 33 — 악보 가까이 현재 마디·박 표시

- 상단의 독립 마디/박/박자표를 제거. 두 줄 보기는 활성 마디 위에 박 숫자와 박자표를 표시하고 현재 마디 변경을 따라간다. 한 줄 이어보기는 재생선과 같은 33.333% 위치에 표시를 고정하여 악보와 함께 흘러가지 않도록 한다. 준비 카운트도 같은 위치에 표시한다.
- 악보 이미지 크기는 유지하며 기존 마디 라벨 공간을 사용한다. 숨겨진 오류 알림 영역의 상단 여백을 축소한다.
- 검증: 두 줄25마디2박 표시, 한 줄 전환 후 고정 표시의 DOM 위치 및 내용 검사. 전체34테스트 및 build PASS. 실제 iPad 화면의 겹침/가독성은 이번 회차 미검증. 예제 HTML 재생성 없음.

## 회차 34 — 두 줄 보기의 모든 마디 박자표 복원

- 사용자 설명에 따라 박 카운터가 아닌 4/4·5/4 박자표 누락을 수정했다. 회차33에서 비활성 마디의 박자표까지 숨긴 것이 원인. 두 줄 보기에서는 모든 마디의 박자표를 표시하고 활성 마디는 라벨 글자색을 상속하여 대비를 확보한다.
- 전체34테스트 및 TypeScript 포함 build PASS. 예제 HTML 재생성 없음.
- iOS27 iPad mini Safari 실제 화면에서 84마디의 5/4와 인접81–83·85–88마디의4/4 모두 표시·잘림 없음 확인. 주 에이전트도 docs/experiments/round30-signature84-screenshot.png를 직접 확인했다.

## 회차 35 — 헤더 4분음표 모양 개선

- 원곡 BPM의 글꼴 음표를 SVG로 교체. 기울어진 꽉 찬 타원 음표 머리와 일정한 굵기의 기둥으로 표시한다. 기존 파란색과 BPM 숫자 유지, 접근성 이름에 4분음표와 BPM 제공.
- 전체34테스트 및 TypeScript 포함 build PASS. 예제 HTML 재생성 없음.
- iPad mini Safari 캡처에서 도톰한 머리·기둥 및 숫자 정렬, 잘림 없음 직접 확인. 증거 docs/experiments/round31-header-screenshot.png. 기존 상태 유지 및 세션 종료 확인.

## 회차 36 — 마디 수 터치 선택

- 마디 수 숫자 입력을 1~10 네이티브 선택 메뉴로 변경. iPad의 기본 선택 UI를 사용하며 키보드 입력이 필요 없다. 선택 영역 최소높이44px, 기본값1, 기존 앞으로 이동 버튼 유지.
- 범위 검증을1~10으로 제한하고 기존 경계 검사를 새 선택 범위에 맞게 갱신. 전체34테스트 및 build PASS. 예제 HTML 재생성 없음.
- iPad Safari에서 키보드 없이1~10 메뉴 및4선택/1복원 확인. 주 에이전트도 round32-picker-screenshot.png 확인. 세션 종료. 네이티브 선택의 AX 높이가42px로 보고되어 min-height 외에 명시적 height48px도 적용(최종 높이 실기 재측정은 미수행).

## 회차 37 — 두 줄 악보 행간 확대

- 악보 이미지·마디 크기를 유지하면서 두 줄 사이 간격을32px 확대. 악보 표시 영역 높이도32px 함께 늘려 아래 가사 공간을 보존한다. 일반/가로 압축 레이아웃 모두 적용.
- TypeScript 포함 build PASS. 예제 HTML 재생성 없음.
- iPad mini Safari 두줄25마디 화면에서 상단 가사와 하단 마디 라벨 사이 여백 확대 및 하단8버튼 전체 표시를 직접 확인. docs/experiments/round33-rows25-screenshot.png. 화면높이744에서 스크롤 없이 버튼이718 이내에 들어옴.

## 회차 38 — 두 줄 누적 진행 음영

- 기존 현재 마디 전체 배경을 제거하고 매 프레임 음악 시각·악보 박 위치에 따른 누적 음영과 진행선 적용. 이미 지난 마디는100%, 현재 위치 이후는0%. multiply 합성으로 흰 종이에도 색을 입히고 검은 음표 대비 유지.
- 같은 줄의 마디 간 여백은 continuousX로 이어서 이동하며 줄 전환은 각 줄 좌표로 재시작. 탐색/반복은 매 프레임 현재 시각을 기준으로 계산하여 이전 음영이 남지 않는다.
- 검증: 이전/현재/미래 마디 채움, 마디 중간 연속 증가, 마디 경계 연속성, 되감기 후 음영 제거 검사. 전체35테스트 및 build PASS. 예제 HTML 재생성 없음.
- iPad mini Safari 실제 재생 캡처에서25마디부분음영 및 진행선,29·30지난마디전체음영/31현재부분/미래흰색 확인. 앞으로1마디로30마디시작 이동 시31음영제거 확인. 주 에이전트도 round34-playing25/advance1/rewind 스크린샷 직접 확인. 최종두줄30마디일시정지, 세션종료. 실제 프레임레이트 정량측정은 수행하지 않음.

## 회차 39 — 터치용 픽토그램 버튼

- 사용자 승인한 Apple식 동작 비유에 맞춰 자체 SVG 아이콘 모듈 추가. Apple SF Symbols 원본 파일이나 전용 글꼴은 사용하지 않고, 단일 HTML에 내장되는 경로로 표현했다.
- 헤더4개 및 재생도구는 아이콘 중심, 하단8개는 아이콘+짧은이름. 메트로놈 체크박스는 접근성을 유지한48px 토글로 변경. 반복활성은 파란색, 재생/정지 및 전체화면은 상태별아이콘. aria-label/title 제공.
- 최초 전체테스트에서 데모 활성화 완료 전 속도버튼을 누르는 기존 비동기 경쟁으로1건 실패, 재실행통과. 테스트가 초기저장완료를 기다리도록 수정. 아이콘접근성이름·재생전환·메트로놈토글 검사 추가 후36테스트PASS, build PASS. 예제 HTML 재생성 없음.
- iPad mini Safari 두줄 화면에서 헤더·재생도구·하단8개버튼 fit, 재생/일시정지아이콘, 메트로놈on/off 색상, 화면메뉴열림 확인. 주 에이전트도 round35-paused-on 및 playing-off 캡처 직접 확인. 실물 iPad 오디오검증은 별개.

## 회차 40 — 내 악보 목록과 곡 추가 위치

- 내 곡 버튼의 접근성 이름·도움말 및 목록 제목을 내 악보 목록으로 변경. 헤더의 곡 추가를 목록 상단으로 옮기고 +아이콘과 곡 추가 글자를 표시한다. 추가 폼을 열 때 목록을 닫아 대화상자가 겹치지 않게 한다.
- 목록열기→곡추가→추가폼 테스트 포함36테스트 및 build PASS. 예제 HTML 재생성 없음.
- iPad mini Safari에서 헤더+제거/목록제목변경/+곡추가로폼열림 확인. 실제 곡추가 없음. 주 에이전트도 round36-library-screenshot.png 직접 확인.

## 회차 41 — 반복 시작 음자리표와 여백 잘라내기

- 원본 페이지를 직접 확인: 사용자 지칭 ||는 각 단 처음의 타악기 음자리표. 제공된 Real Paradis 악보에서 시작x54pt 영역의 앞15pt를 표시용으로 제거한다. 박자표 시작 전69pt에서 멈춰 첫음표·박자표는 보존한다. 다른 곡에는 이 수치를 추정 적용하지 않는다.
- 표시 전용 displayRegion으로 잘라낸 영역·박좌표를 파생하여 한줄폭/가사/진행선/두줄음영 계산에 반영. 원본PDF·저장영역·편집좌표·음원시각 변경 없음. 마디번호라벨 유지.
- 좌표검사 최초실패는 원본54.03pt를54로 가정한 테스트 오차로 실제좌표+15 기준 수정. 원본불변/박의원본페이지좌표유지/다른곡미적용 포함38테스트 및 build PASS. 예제HTML재생성없음.
- iPad Safari 한줄/두줄25마디에서||제거·첫음표/가사유지 직접확인(round37-ribbon25/rows25). 첫마디Intro글자잘림 발견하여 첫마디는원본유지 예외추가(반복시작기호만제거). 첫마디불변검사 포함39테스트 및 build PASS. 시뮬레이터세션종료확인.

## 회차 42 — 재생 버튼 중앙 배치와 숫자 정리

- 재생 버튼을 조작 바 중앙의 독립 grid 칸으로 이동. 좌우 동일폭으로 다른 버튼 수와 무관하게 정중앙 유지. 왼쪽 처음/마디수/되감기, 오른쪽BPM/메트로놈.
- 마디수 옆 마디 글자 제거, select 기본 화살표와 BPM number 스피너 숨김. 마디수 터치선택 및 BPM 숫자입력/±버튼 유지.
- 전체39테스트 및 build PASS. 예제HTML재생성없음.
- iPad mini Safari 화면에서 재생 중심x566.5(1133폭의정중앙), 마디글자/숫자화살표제거 및겹침없음 직접확인. docs/experiments/round38-transport-screenshot.png.

## 회차 43 — 헤더 원곡 BPM으로 리셋

- 헤더♩=BPM을48px터치버튼으로 변경하여 원곡속도로복귀. 기존rate처리 사용으로재생중현재위치유지, 곡없을때비활성. 접근성이름·도움말·누름반응 제공.
- 80→헤더클릭→94복귀 및70초위치유지 UI계약검사 추가. 전체40테스트 및 build PASS. 예제HTML재생성없음.
- iPad mini Safari에서 -1후93 접근성값, 헤더터치후94복귀 및정지/1마디유지 확인. round39-reset-screenshot.png 직접확인. 세션종료확인.

## 회차 44 — BPM 프리셋·±5·숫자 드래그

- 조절순서 BPM/−5/숫자/+5. BPM버튼 프리셋dialog, 원곡기준 느린연습5개+원곡. readonly숫자에 pointercapture 및 가로8px당1BPM 미리보기, 놓을때적용, 취소복원. 오디오 시간확장 연산을 매move마다 수행하지 않는다. slider접근성값/키보드방향키1BPM지원.
- ±5테스트갱신, 프리셋75선택/16px드래그77/놓기전미적용/취소복원검사. jsdom의onpointer속성자동dispatch미지원으로 테스트는 등록된핸들러호출로보정. 전체41테스트 및 build PASS. 예제HTML재생성없음.
- iPad mini Safari에서 프리셋75→가로16pt드래그77→+5=82 실제화면/계층 확인. 재생버튼중앙·컨트롤fit 확인. 주 에이전트도 round40-presets 및 drag77 캡처 직접확인. 연산중숫자는직전값이일시보일수있으며완료후목표값확인.

## 회차 45 — BPM 숫자 두 번 탭으로 원곡 복귀

- 숫자 영역350ms내 두번탭 및 마우스dblclick을 원곡BPM복귀로 연결. 단일탭은 속도재처리하지 않으며 드래그·취소·길게누름을두번탭에서분리. 기존헤더복귀유지. 도움말/접근성이름갱신.
- 기존드래그검사에단일탭77유지→두번탭94복귀검사추가. 전체41테스트 및 build PASS. 예제HTML재생성없음.
- iPad Safari -5로89→단일탭89유지→더블탭94복귀 화면/계층확인. round41-double94 캡처직접확인. 정지94 및세션종료확인.

## 회차 46 — 드럼 연습실 홈 화면

- 사용자확정앱명 드럼 연습실을 초기헤더·중앙박스제목으로사용. 기존소개문구는부제유지. 초기BPM빈음표숨김, 곡활성시곡명/BPM표시. 활성곡삭제후홈도앱명복원.
- 예제버튼과악보추가사이에헤더와동일아이콘의내악보목록버튼추가. 내악보로시작→+악보추가. 단일HTML에서는새홈버튼도숨겨기존범위유지.
- 홈제목/버튼순서/아이콘동일성/목록열림검사 포함42테스트 및 build PASS. 예제HTML재생성없음.
- iPad mini Safari 홈제목/세버튼배치/BPM숨김 및가운데목록열기닫기 확인. 주 에이전트 round42-final-screenshot.png 직접확인. 추가삭제재생없음,세션종료.

## 회차 47 — 최근 연습 악보 이어 열기

- 홈주버튼을고정RealParadis연결에서최근활성악보연결로변경. 성공적로드/저장후악보ID최근순을localStorage에보관하고홈시작시저장곡제목으로표시. 삭제된ID는건너뛰고이전기록선택. 기록없는기존설치는저장목록첫곡으로초기화, 저장곡이없으면기본악보열기명시. 저장차단시현재세션메모리유지. 단일HTML동작유지.
- 최근순/재열기/삭제스킵/빈목록 및두번째곡열기버튼제목·연결검사포함44테스트PASS, build PASS. 예제HTML재생성없음.
- iPad Safari 기존곡열기→새로고침→홈제목버튼→동일곡재열기확인. round43-home 캡처직접확인. 다른곡전환은자동테스트로검증. 새곡생성없음,정지및세션종료.

## 회차 48 — 프로젝트 경로 변경

- 사용자 요청으로 drum-practice-web → /Users/raphael/Playground/drum-practice 이동. 대상은 빈 디렉터리임을 확인. 기존 .git, 전체커밋, 원본미디어·내보내기·무시파일 모두 그대로 보존. AGENTS/README 현재경로 수정.
- 기존 main/HEAD fb2564e 및 clean 상태 확인 후 이동. 원격등록 없음. Git 재초기화 대신 기존 저장소 유지.
- 이동후 Git HEAD동일/fsck정상,44테스트 및 build PASS. 새경로에서개발서버재시작후 HTTP200확인.

## 회차 49 — 전 음절 청취 보정 요청과 기존 정렬 감사

- 사용자는556음절모두실제음악청취로확인하여보정요청. 도구조사결과현재세션은직접오디오청취/발음경계판정불가. 전음절청취보정은미완료이며자동분석을그대신완료로간주하지않음.
- 기존스크립트확인: 보컬분리+MLXWhisper정렬후140토큰의306음절균등분배. 48마디오모도120.4~121.42구간균등분배. 전체토큰감사목록작성, docs/LYRIC-ALIGNMENT-AUDIT.md에근거와후속완료기준기록. 가사데이터변경/확정플래그승격없음.

## Apple local STT feasibility — 2026-09-19

- Goal: assess whether clinic-ai Apple STT can assist Japanese sung-lyric alignment. Scope: read-only clinic implementation; standalone local probe in docs/experiments/apple-stt. Success: actual transcription with audio timestamps. No production lyric edits or clinic changes.
- Found session 한의원 AI 로컬 구축 (01a0aa61-7284-7960-9536-e5d7c134f6c9) and clinic_ai/native/SpeechBridge.swift: SpeechAnalyzer + SpeechTranscriber, audioTimeRange and transcriptionConfidence.
- Compiled a Japanese-only copy using installed Xcode SDK. Runtime available=true, japaneseSupported=true; initially only ko_KR installed. AssetInventory installed ja_JP successfully (114 GiB free before installation).
- Tested original mixture audio 113–129 seconds (16 s, mono 16 kHz). Local transcription returned Japanese text with per-run time ranges. The target 思い上がってた was recognized. Absolute start times: 思120.32, い121.58, 上121.76, が121.94, っ122.12, て122.48, た122.66.
- Feasibility: useful independent recognition/timing evidence. Not proof of all-syllable accuracy: 思 covers two morae, and nearby 壁 / 旅鳥 were mistranscribed. Confidence is recognition confidence, not timestamp accuracy. No listening-based verification claimed. Original song.json unchanged.
- Reproducible probe source, binary, sample and JSON retained locally under ignored docs/experiments/apple-stt/. No audio uploaded.

## Local STT + AFM preprocessing benchmark — 2026-09-19

- Reused clinic-ai Apple bridges read-only; tested three Japanese singing excerpts and a typed AFM retry. Details: docs/APPLE-LOCAL-PREPROCESSING-TEST.md.
- STT: 13–16 second excerpts took 0.267–0.363 seconds each. AFM existing bridge: 40.099–42.011 seconds, all malformed content. Typed retry: 2.008 seconds, valid shape but incorrect whole-sentence replacement at run0. No AFM output applied.
- Deterministic compact runs + diff: 2300→1264 tokens using Apple's tokenizer (45.0% reduction). This is not measured Codex billing or end-to-end speed. STT/code preprocessing useful; AFM alignment benefit not demonstrated.
- App/source song timing and clinic files unchanged. Probe data stays ignored/local. Verification: actual local runtime outputs, manual comparison against supplied lyrics, tokenCount API, git diff --check.

## AFM bounded helper tasks — 2026-09-19

- Tested AFM 3 Core Advanced on 28 pre-labeled small tasks using typed FoundationModels outputs. Reading equivalence6/8 (median0.334s), command extraction5/8 (0.680s), feedback routing11/12 (0.365s).
- Useful candidate: preserve original feedback and append preliminary category for downstream review. Not safe for direct commands or automatic lyric-error dismissal. One routing error confused clipped text with lyric timing.
- Details and limitations: docs/AFM-SMALL-TASKS-TEST.md. Raw local evidence under ignored docs/experiments/afm-small-tasks. No product or clinic code changes; no measured end-to-end token/speed claim. Verified all expected/actual comparisons and git diff --check.

## Apple local workflow implementation — 2026-09-19

- Added reusable scripts/apple-local Speech/STT bridge, typed AFM review bridge, Python orchestration, and five focused timing/diff tests. npm run review:local and test:local are available. Contract: docs/APPLE-LOCAL-WORKFLOW.md; PRD updated.
- Actual song executed twice across11 vocal windows. Second run STT3.77s total, AFM47 pairs20.91s;69 review candidates preserved. All IDs/time ranges checked, no AFM transport/schema errors. Output correctness remains separately reviewed.
- Codex rejected two sameReading labels (が似/かに and って/らせ). Bar48 思 onset differs120.32 vs121.52sec across windows. No timing overwrite; no confirmed=true. Local review-decisions.json records these findings.
- Verification: five Python tests and all44 app tests passed; both Swift bridges compiled and executed. Existing-output rejection and git diff checks performed. No exports regenerated, clinic code untouched, no external upload.

## Apple local findings shared with team lead — 2026-09-19

- 사용자의 명시적 요청으로 에이전트관리팀장(019fe926-aa3e-7d01-a7cc-25105ef93a95)에 현재 실험값·실패·활용조건·재사용 코드/문서 경로를 send_message_to_thread로 전달했다.
- 전역 활용/후속발견 공유 절차의 정본 반영을 팀장에게 요청했다. 이 프로젝트 AGENTS.md에는 후속 실측 발견 공유 지침을 추가했다. 자동 주기 감시나 외부 서비스 전송은 생성하지 않았다.

## Lyric syllable timing correction — 2026-09-19

- 전체556음절의 균등분할 문제를 음절별 가나 토큰 DTW로 재분석. 보컬2개 문맥, 원곡믹스, 짧은 문맥을 대조해77개 시작 시각 보정. 48마디 모120.91→121.36, 테122.02→122.44초. Apple STT 테122.48초를 추가 근거로 사용.
- src/lyric-timing.ts/data.ts와 활성화 시 마이그레이션 추가. 기존 브라우저 악보도 적용하며 원래 시각/fingerprint가 맞는 미확인 항목만 변경. 사용자 수정·다른 곡·다른 가사판본 보호. public/demo/song.json 반영, exports 미갱신.
- docs/LYRIC-SYNC-CORRECTION.md에 기준과 한계 기록. 미변경479개는 전부 정확하다고 판정한 것이 아니다. 전 음절 청취 확인 및 iPad GUI 재생 검증 미수행, confirmed=false 유지.
- 검증: 신규4개 포함 앱48테스트 PASS, build PASS, 실제자료77개 변경/재적용0개/validateSong PASS, localhost5173 HTTP200. 원본 백업·556개 감사목록·원시실험은 docs/experiments/syllable-sync에 보존.

## Requested listening accuracy validation — 2026-09-19

- 전 음절 직접 청취 검증 경로를 다시 확인했으나 해당 도구 없음. 청취 검증/정답 시각0개로 정확도나 개선율은 산출하지 않았다.
- 실제 적용 시각을556개 감사자료와 대조. 모델4조건 간 차이:100ms이하466개,200ms초과52개,500ms초과24개. 보정77개 자체 일치는 선정근거를 다시 평가하는 순환이므로 정확성 증거로 사용하지 않음.
- docs/LYRIC-ACCURACY-REVIEW.md 및 로컬 listening-review.csv(청취 시각/검토자 빈칸) 기록. 앱 추가변경/되돌림 없음. 이전 보정 문서의 임계값 설명을 실제 선정 코드(짧은창은 중앙값 기준)에 맞게 명확히 함.

## User listening anchor: bar15 코 — 2026-09-19

- 사용자 청취 기준:15마디 코는 네 번째 팔분음표에서 시작. 마디 시작+1.5박=37.090228초. 기존36.220초에서 약0.870초 늦췄다. 뒤 노37.220초는 유지하고 앞 네의 표시 종료만 연결했다.
- applyUserLyricAnchors를 활성화에 연결. 알려진 자동판본에만 적용하여 사용자의 별도 시각 변경을 보존. 코 시작은 사용자 확인 근거로 confirmed=true. 다른 음절의 청취 검증을 뜻하지 않는다.
- 실제 demo자료 적용·validateSong·재적용 방지 확인. 원본 백업은 docs/experiments/syllable-sync/song-before-user-anchor.json.

## Bar15 STT boundary diagnosis — 2026-09-19

- 원곡/보컬×긴창(34–40)/짧은창(36.4–39.5) Apple STT4회. 긴창こ36.16초,짧은창37.12초; 사용자37.090228초 기준 짧은창약30ms차이.
- 보컬RMS상36.25–36.75초는 저에너지무음이 아님(-1.1dB상대);37.0–37.1초에-16.8dB. 이전 지속/경계 영역이 다음토큰에 포함되는 가설을 기록하고 침묵으로 단정하지 않음.
- 약870ms=팔분음표2.73개. 직접청취검증이 아니라 사용자앵커를 기준으로 한 STT 재시험. 앱추가변경없음. 상세 docs/LYRIC-SYNC-CORRECTION.md.

## Boundary-aware local STT workflow — 2026-09-19

- 방금15마디 자료를 반영해 boundaries.py 및 workflow 경계 재전사 단계 구현. 텍스트 일치 여부와 독립적으로0.8초 이상 단일문자/사용자 앵커를 검사하고 두 짧은 창에서 재전사. 클립 시작·중복·누락은 근거 부족,0.2초 초과 변화는 context_sensitive. autoApply=false 유지.
- 전체11구간 실제실행:32후보/64재전사,24문맥민감·8근거부족. 재검사 호출+클립 시간10.61초. 기존 가사값 추가변경없음.
- 최종코드15마디 재실행:36.12초→37.090/37.101초; 사용자37.090228초와 약0~11ms차이. 원시결과/앵커 보존 및 미매칭앵커 없음 확인. 이 결과는 해당1지점만의 실측.
- 집중테스트13개PASS, 실제회귀판정PASS, diff검사PASS. docs/APPLE-LOCAL-WORKFLOW.md와PRD 갱신.

## Apply maximal supported estimates and list uncertainties — 2026-09-19

- 사용자 ‘최대한 반영’ 지시에 따라 앞선 자료를 재평가, 추가57개 시작값을 실제 반영. 짧은창 포함3개이상 일치 후보와18마디コ 두Apple STT 후보를 포함. 사용자15마디 앵커 보존, 추정 confirmed=false. 원본 대비 누적135개 변경.
- src/lyric-timing-refinement.ts 및 활성화 단계 연결. 기존 사용자 수정/확인/다른판본은 기존 guard로 보호. 새원시STT실행은 아니며 기존실험결과 재평가.
- docs/LYRIC-SYNC-SUSPECTS.md에165음절/68마디 의심목록. 적용했지만 독립분석과 충돌하는 값도 목록에 유지. 확정오류수나 청취검증결과로 해석하지 않음.
- 테스트48/build PASS, 실제자료57적용/재적용0/전체갱신체인멱등성/최초저장판본에서동일결과/사용자앵커보존/validateSong PASS. localhost HTTP200. 앱추가보정완료,내보낸HTML미갱신.

## 2026-09-19 현재 재생 위치 복사
- 목표: 사용자가 가사 싱크 위치를 바로 복사해 전달한다.
- 범위: 웹앱 transport, 위치 포맷·클립보드 모듈, 테스트.
- 완료 조건: 되감기 다음 버튼에 마디·¼박 구간 표시, 탭 시 당시 정확한 음원 시간과 곡명 복사.
- 제외: 가사 시각 변경, 생성 HTML 재내보내기.
- 검증: 52 tests 통과, TypeScript/Vite/portable 빌드 통과, localhost:5173 HTTP 200. Clipboard API 및 fallback 성공·실패/정리 검증은 jsdom 계약 테스트이며 실제 iPad 클립보드·레이아웃 검증은 하지 않음.
- 구현: 중앙 재생 grid 유지, 위치 버튼에 1.4초 복사 성공 표시. 화면 위치는 포함하는 ¼박 구간이고, 복사한 초와 소수 박 위치가 보정용 정밀값이다.

## 2026-09-19 의심 목록 고유 번호
- docs/LYRIC-SYNC-SUSPECTS.md 표 첫 열에 001–068 고유 번호 추가.
- 기존 번호 유지·재사용 금지, 새 항목은 069부터 부여하는 규칙 명시.
- 68개 번호의 유일성과 기존 마디·음절·시각·사유가 그대로 보존됨을 검증. 문서만 변경.

## 2026-09-19 사용자 청취 확인 001
- 사용자 전달 위치: 9마디 1박, 음원 20.828초. 001번 첫 ‘아’를 20.580→20.828초(+0.248초), confirmed=true로 반영.
- 복사한 실제 음원 시간을 사용하며 9마디 시작(20.814초)으로 강제 정렬하지 않음.
- 기존 저장 악보에도 알려진 원본 값에 한해 적용; 수동 수정 및 재적용 보호. public/demo/song.json도 갱신.
- 의심 목록의 001을 확인 완료 표로 이동, 다른 번호 유지. 남은 164음절/67마디.
- 검증: 52 테스트 및 빌드 통과. 실데이터 migration/재적용/수동 수정 보존/validateSong 검사 통과 (docs/experiments/user-001/check.ts).

## 2026-09-19 청취 피드백 일괄 반영 방식으로 전환
- 사용자 결정: 개별 위치는 누적하고 요청 시 일괄 반영. 001은 기존 반영 유지.
- 002: 10마디, 24.347초를 docs/LYRIC-SYNC-FEEDBACK.md에 원문과 함께 기록. 사/카 중 대상 음절 미지정 상태 보존.
- 앱 소스·가사 데이터 변경 없음. 문서 diff 검사 완료.

## 2026-09-19 청취 피드백 002 정정
- 최신 사용자 전달에 따라 002 기록을 24.347→24.268초로 대체. 마디 내 0.901초, 박 위치 2.412.
- 대상 음절 미지정 상태 유지. 앱·가사 데이터 미변경. 문서 diff 검사 완료.

## 2026-09-19 청취 위치 전달 규칙 확정
- 사용자가 전달하는 시각은 고유번호 행의 첫 번째 의심 음절 시작으로 해석한다. 별도 지정 없으면 재질문하지 않는다.
- 002의 24.268초를 ‘사’ 시작으로 청취 확인 기록. 앱·가사 데이터는 일괄 반영 요청까지 변경하지 않음.
- 누적 기록 및 의심 목록 안내 갱신, 문서 diff 검사 통과.

## 2026-09-19 청취 피드백 003 누적
- 003 첫 음절 ‘소’ 시작: 11마디, 음원 26.872초, 마디 내 0.952초, 박 위치 2.491. 원문과 함께 누적 기록.
- 앱·가사 데이터 미변경. 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 전체 새 가사 v2 교체 및 재정렬
- 목표: 새 제공 가사와 후렴으로 전체 교체하고 음원 기반 싱크를 다시 계산.
- 범위: 11개 가창 구간, Apple STT/AFM 텍스트 대조, 5조건 phonetic DTW, 웹앱 판본 migration 및 예제 데이터.
- 결과: 556→534 표시 단위. 청취 확정 3개, 003은 새 ‘카’ 구절 시작에 참고 적용. 자동 정렬 의심 136개를 069–204로 기록. 구판 번호/기록 보존.
- 원본 가사·시각은 song.lyricArchive와 로컬 song-before.json에 보존. 개별 피드백 누적 원칙은 유지하며 이번 전체 재싱크 요청으로 002/003도 반영.
- 한계: 직접 전 음절 청취 검증 아님. 구간 첫 음절 DTW clip-start 문제는 기존 위치 유지로 처리, 순서 충돌 보정 6곳 포함 의심 목록 공개. 새 원문 자체의 누락·발음 불일치는 docs/LYRICS-V2-REVIEW.md에 기록.
- 검증: 실데이터 534개 validateSong, 가장 오래된/최근 저장판 migration 결과 일치, archive·재적용·수동 보존 검사. Python 15개 통과. TypeScript 전체 테스트 및 빌드 결과는 아래 최종 검증 기록 참조.
- 최종 검증: TypeScript 55 tests/15 files 통과, Python 15 tests 통과, portable/TypeScript/Vite build 통과. localhost:5173/demo/song.json HTTP 실제 응답의 v2 revision·534개 가사·청취 앵커·556개 보관본 확인. 실제 iPad 화면/전 음절 청취 정확도 검증은 미실시.

## 2026-09-19 J-Lyric 사용자 제공 본문 비교
- v2 일본어와 사용자 붙여넣은 새 본문을 공백 제외 비교: 반복 후렴 포함 23개 차이 구간. 자료·diff는 docs/experiments/lyrics-v3-comparison에 보존.
- 일본어 누락 다수는 한글에는 이미 존재. 현재 표시에서 실질 확인된 수정 후보: 出ていくわ의 마지막 와 추가, 코마라테타→코마라세타, 코토노나이→코토모나이. 장음 표기는 별도 정리 대상.
- docs/LYRICS-JAPANESE-COMPARISON.md에 전체 대조 및 텍스트/발음/타이밍 구분 기록. 비교 요청이므로 앱·가사·싱크 미변경. 문서 diff 검사 통과.

## 2026-09-19 일본어 정본 발음 검수 + 영어 원문 표기
- 목표: 사용자 지정 일본어 정본에 맞게 전체 발음 검수. 진행 중 영어를 영어 그대로 표시하라는 요청 통합.
- 구현: 21개 기존 한글 단위 수정(세/모 2, 장음 9, 촉음 10), 문장 끝 와 1개 복원. 영어 12개 단어는 첫 음절 시작/마지막 음절 종료로 묶음. 최종 513개 표시 단위.
- 기존 시작 시각 보존, 구판 보관 및 일회성 migration. 수동 타이밍과 와 복원이 충돌하면 쿠와를 합쳐 기존 타이밍 유지. 기본 예제 와는 구판 40.820초 추정값, 청취 미확정/의심 205.
- 로컬 STT 38–43초 재분석은 문장 끝 와를 다음 私와 구분하지 못했으므로 새 확정값으로 쓰지 않음. docs/experiments/japanese-canonical에 근거 보관.
- 전체 11개 구간의 수동 검수 한글/영어 문자열과 실제 앱 문자열 일치 검사. 기존 가장 오래된 저장판의 단계별 migration 결과와 최신판 일치, 보관본·재적용 보호 검증.
- 원문은 data/reference/japanese-canonical.json, 검수 대조표 docs/JAPANESE-CANONICAL-READINGS.md. 의심 번호 069–204 유지, 영어 묶임에 따른 중복 지칭 안내.
- 최종 검증: 60 tests/17 files 통과, TypeScript·portable·Vite 빌드 통과. localhost 실제 응답 v4/513단위/영어 12개 단어 확인. UI 배치 변경 없음; 실제 iPad 화면·와 시작 청취 검증은 미실시.

## 2026-09-19 현재 가사 기준 교정 목록 재정리
- 현재 513개 가사 단위와 기존 069–205 검토 행을 텍스트·시각으로 일대일 대응 확인.
- 영어 단어 시작 중복 12개를 합쳐 125개 확인 시작점으로 정리. 137개 기존 번호 모두 대표번호/별칭으로 보존.
- 시간 순서 정렬, 205를 16마디 위치로 이동. 확인할 음절/영어 단어를 굵게 표시하고 앞뒤 각 3개 표시 단위를 함께 제공.
- 기존 사유 상세는 docs/LYRIC-SYNC-REVIEW-EVIDENCE.md에 보존, 현재 목록은 docs/LYRIC-SYNC-SUSPECTS.md. 앱·가사·싱크 변경 및 추가 음원 분석 없음.
- 검증: 각 행의 현재 가사 매칭 유일성, 고유번호 137개 보존, 125개 시작점/12개 중복 통합, 문서 diff 검사 통과.

## 2026-09-19 9마디 な(나) 청취 위치 접수
- 22.095초/마디 내 1.280초/박 위치 3.006 원문 누적(F001). 사용자가 교정 고유번호를 지정하지 않았고 9마디에 나가 두 번 있어 대상 확인 대기로 기록.
- 앱·가사·싱크 미변경. 문서 diff 검사 통과.

## 2026-09-19 069 대상 확정
- 사용자가 첫 번째 나임을 확인. F001을 069(v2-l1)에 연결, 시작 시각 22.095초를 사용자 청취 확인으로 누적.
- 앱·가사·싱크 변경 없이 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 청취 피드백 070 누적
- 070 나다라카나의 카(v2-l4): 10마디 1박, 23.367초를 원문과 함께 기록. 사용자 청취 확인/일괄 반영 대기.
- 기존 다음 나 23.138초와 순서 충돌은 적용 시 검토하도록 기록. 앱·가사 데이터 미변경. 문서 diff 검사 통과.

## 2026-09-19 070 대상 정정 및 전달 규칙 변경
- 사용자 정정: 070은 카가 아니라 문맥 칸 맨 첫 나. 별도 설명 없으면 “확인할 시작과 앞뒤 가사” 칸 맨 첫 가사 시작으로 해석한다. 기존 굵은 음절 기준 폐기.
- 070의 23.367초를 v2-l1로 정정. 069도 명시적으로 첫 나(v2-l1) 22.095초였으므로 두 원문을 보존하고 시각 충돌 상태를 기록. 자동 덮어쓰기/앱 반영 없음.
- 목록 안내와 누적 기록 갱신. 문서 diff 검사 통과.

## 2026-09-19 청취 피드백 071 누적
- 최신 전달 규칙에 따라 071 행 맨 첫 쿠(v2-l9) 시작 25.339초를 기록. 10마디 4박, 마디 내 1.971초, 박 위치 4.089.
- 기존 003의 카 앵커와 구분. 다음 다의 현재 시각 25.310초와 순서 검토 필요 사항 기록. 앱·가사 데이터 미변경, 일괄 반영 대기.
- 현재 가사 ID/표시 대응 및 문서 diff 검사 통과.

## 2026-09-19 청취 앵커 기반 재정렬 준비 (적용 대기)
- 사용자 요청: 누적 확인 위치로 재정렬하고 교정 목록 재생성.
- 069 첫 나 22.095초와 070 첫 나 23.367초가 동일 ID에 충돌하여 선택 질문을 제시. 응답 전 종속 데이터 적용은 보류.
- src/listening-alignment.ts 준비: 확인점 사이 비례 간격 조정, 외부 시각 유지, 역전·미등록·중복 충돌·내부 확인점 이동 거부. 집중 테스트 3개 통과.
- 원본 snapshot과 재개 조건은 docs/experiments/listening-realignment에 보존. 현재 앱 데이터·교정 목록 변경 없음.

## 2026-09-19 청취 앵커 v5 적용 및 목록 재작성
- 사용자 응답으로 충돌 해결: 069 첫 나 22.103초, 070 두 번째 나 23.367초. 071 쿠 25.339초와 함께 확정.
- 10개 시작 시각 재정렬. 3개 새 청취 앵커 고정, 중간 7개는 기존 간격 비례 재배치(추정). 사/카라노/15마디 코 및 카라노 이후 모든 음절 시각 보존. 구판 archive 유지.
- 교정 목록은 확인할 첫 가사/이어지는 가사 칸으로 분리. 069–071 완료, 다른 기존 번호의 문맥 첫 가사 대상은 보존. 새 206–213 추가. 남은 130개 행. docs/lyric-review-targets.json으로 대상 ID 고정.
- 이번 결과는 전곡 같은 오프셋 이동이나 전 음절 청취 검증이 아니다. 재정렬과 관련한 추가 STT/AFM 호출은 필요하지 않아 수행하지 않음.
- 실데이터 순서/앵커/보관본/최초 판본부터 migration 일치/후반 불변 검사 통과. 전체 테스트 및 빌드 결과는 최종 기록 참조.
- 최종 검증: 66 tests/19 files 통과, TypeScript·portable·Vite build 통과. 최초 테스트에서 수동 시각 fixture 자체가 이웃보다 뒤로 가도록 잘못 구성된 것을 확인해 유효한 수동 위치로 고쳐 재검증. 별도 역전 거부 테스트 유지.
- localhost 실제 제공 v5의 3개 청취 앵커 확인. 069–213 전체 번호/별칭의 유일성과 현재 가사 ID 대응 확인. 실제 iPad/전체 청취 정확도 검증은 미실시.

## 2026-09-19 첫 나 재측정과 정확도 해석
- 사용자 재측정 22.097초를 보존. 적용값 22.103초와 6ms 차이, 앱·싱크 변경 없음.
- 사용자 버튼 위치의 반복성과 실제 발음 경계 정확도를 구분. 앞선 사용자 확인 값을 정밀한 확정 시각으로 표현한 한계를 명시. 문서 diff 검사 통과.

## 2026-09-19 두 번째 나 재측정
- 070(v2-l5) 재측정 23.368초 원문 보존. 현재 적용값 23.367초 확인, 차이 +1ms.
- 앱·가사·싱크 미변경. 문서 diff 검사 통과.

## 2026-09-19 ¼박 격자 가사 위치 적용
- 목표: 밀리초 대신 마디/박/¼박 정수 좌표로 가사를 배치·교정.
- 범위: src/lyric-grid.ts, 모델 위치 메타데이터, 활성화/편집 반영, 위치 복사, 가사 편집 마디·박 선택 및 자유 시각 예외. 현재 예제 데이터 및 교정 목록도 격자 기준 갱신.
- 결과: 513개 시작을 가장 가까운 격자로 반올림. 최대 이동 0.079747초. 35개 격자점에 각 2개씩 70개 음절이 같이 위치하며 뒤 박으로 임의 이동하지 않음.
- 첫 나=9마디 3박(22.090584초), 두 번째 나=10마디 1박(23.367150초), 쿠=10마디 4박(25.281998초). 기존 사용자 원음 시각과 archive 보존.
- 재진입 idempotence·원시각 보존·마디 경계 carry·5/4·마디 시간 변경 시 음악 좌표 유지·자유 시각 예외 검사. 위치 표시를 포함 구간 floor에서 nearest round로 변경.
- 한계: 박자 격자 자체가 음원과 어긋난 부분은 별도 교정 필요. 반올림이 청취 정확도 확정은 아님. 예제 HTML 파일 재내보내기/실기기 검증은 범위 밖.
- 최종 검증: 71 tests/20 files 통과, TypeScript·portable·Vite build 통과. DOM 상호작용에서 마디/¼박 변경 저장 및 자유 시각 전환·저장 확인. 테스트는 곡 재열기 완료 전에 편집하던 비동기 대기를 수정해 재검증.
- localhost 실제 응답의 513개 가사가 저장한 measureId/tick으로 계산한 time과 모두 일치함을 확인. 전환 재실행 데이터 동일성 검사 통과. 교정 목록도 초 대신 마디·¼박으로 갱신.

## 2026-09-19 10마디 끝 루 중복 삭제 처리
- 사용자 요청: m10 tick15 루 삭제, 다음 m11 tick0 루 유지.
- 현재 public/demo 정본에는 m11 루만 있음을 확인. 저장 악보 재진입 시 다음 박 루가 있을 때만 앞의 중복 루를 제거하는 일회성 migration 추가, 이전 가사 archive 보존.
- 제거 후 재적용 및 이미 정상인 판본 이후 사용자가 추가한 가사에는 반복 개입하지 않음. 실제 사용자 기기 저장본의 중복 존재/삭제는 미조회.
- 74 tests/21 files 및 TypeScript·portable·Vite build 통과. 중복/유일 음절/다른 곡/정상 판본 보호 검증. 예제 HTML 재내보내기 없음.

## 2026-09-19 마디 경계 루 이중 렌더링 근본 수정
- 사용자 스크린샷에서 동일 루가 인접 마디 양쪽에 보임. 실데이터에서 m10.end - m11.start = 3.552713678800501e-15 확인. 반열린 구간 필터가 동일 가사를 두 마디에 포함.
- lyricMeasureId로 가사 소속 마디를 단일 결정. 격자 measureId 우선, 자유/레거시는 locate의 경계 허용오차 사용. 두줄/한줄 공통 measureHTML에 적용.
- 이전 저장 중복 가설에 따른 삭제 migration 및 테스트는 제거. 원본 루/시각 미변경.
- 회귀: 겹치는 마디 끝, 다음 마디 시작, 이전 마디 끝 좌표의 단일 소속 검사; 실제 DOM에서 m10 루 0개/m11 루 1개 확인. 전체 73 tests/20 files 및 TypeScript·portable·Vite build 통과.

## 2026-09-19 토오쿠 히카루 첫 토 위치 접수
- 구절 지정으로 v2-l25 식별. 13마디 2박(m13/tick4), 원본 재생 31.662초/격자 표시31.665초 누적.
- 현재 m13/tick3 대비 +¼박. 앞 구절 끝 토와 구분. 앱·가사 시각 미변경, 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 토오쿠 이후 전체 +¼박 이동
- 사용자 명시 범위: 첫 토부터 곡 끝까지 모두 +¼박. 이전 구간별 보정/뒤쪽 앵커 보존보다 이번 지시 우선.
- 488개 가사 이동, 앞 25개 완전 동일. 첫 토 m13/tick3→4. 마디 경계와 5/4에서 tick을 다음 마디로 이월. 원본 시각/전환 전 archive 보존.
- 새 첫 토는 확인으로 기록, 나머지 이동된 가사는 이동 후 청취 검증이 아니므로 confirmed 해제. 재적용 방지 marker를 저장해 저장 악보에도 한 번만 적용.
- 현재 교정 목록 마디·박 좌표 갱신. 실데이터 모든 대상의 누적 tick +1, 앞 구간 불변, originalTime 보존, 재적용 데이터 동일성 검사 통과.
- 최종 검증: 전체 76 tests/21 files 및 TypeScript·portable·Vite build 통과. localhost:5173 실제 song.json 응답 200, 첫 토 m13/tick4(31.664825초), 513개 가사 및 일회성 적용 marker 확인. git diff --check 통과. HTML 재내보내기 없음.

## 2026-09-19 206 다 시작 위치 접수
- 고유번호 매핑으로 v2-l2 다 확인. 사용자 좌표 m9/tick10(9마디 3박 +½), 원본22.393초/격자22.410초 보존.
- 현재 m9/tick12 대비 -½박. 피드백 문서에만 누적, 앱/가사/교정 목록 적용 좌표는 유지. 문서 diff 검사 통과.

## 2026-09-19 207 라 시작 위치 접수
- 고유번호 매핑으로 v2-l3 라 확인. 사용자 좌표 m9/tick12(9마디 4박), 원본22.708초/격자22.729초 보존.
- 현재 m9/tick14 대비 -½박. 피드백 문서에만 누적, 앱/가사/교정 목록 적용 좌표는 유지. 문서 diff 검사 통과.

## 2026-09-19 208 카 시작 위치 접수
- 고유번호 208의 v2-l4 카 확인. 사용자 좌표 m9/tick14(9마디 4박 +½), 원본23.098초/격자23.048초 보존.
- 현재 격자 위치와 동일. 피드백 문서에만 누적, 앱/가사/confirmed 상태는 유지. 문서 diff 검사 통과.

## 2026-09-19 209·210·212 현재 위치 확인 접수
- 교정 목록과 고유번호 매핑을 대조하여 209 카(v2-l7), 210 오(v2-l8), 212 루(v2-l11)의 현재 위치 맞음을 기록.
- 이동 요청 없음. 확인 상태만 다음 일괄 반영 대기, 앱/가사 데이터 미변경. 211은 미확인 유지. 문서 diff 검사 통과.

## 2026-09-19 후리카 첫 후 위치 접수
- 구절과 현재 가사 대조로 v2-l19 후 식별. 사용자 좌표 m12/tick6(12마디 2박 +½), 원본29.461초/격자29.431초 보존.
- 현재 m12/tick4 대비 +½박. 피드백만 누적, 앱/가사 미변경. 문서 diff 검사 통과.

## 2026-09-19 072·074 현재 위치 확인 접수
- 고유번호 및 실제 가사 대조: 072 에(v2-l22)=m12/tick11, 074 네(v2-l35)=m14/tick15. 두 위치 맞음을 기록.
- 위치 이동 없이 확인 상태만 다음 일괄 반영 대기. 앱/가사 미변경. 문서 diff 검사 통과.

## 2026-09-19 15마디 첫 코 위치 재확인 접수
- 주변 가사 대조로 v2-l36 코 식별. 사용자 좌표 m15/tick6(15마디 2박 +½), 원본37.106초/격자37.090초 보존.
- 현재 일괄 이동 후 m15/tick7 대비 -¼박. 첫 코의 관측만 누적하고 앱/가사 미변경. 문서 diff 검사 통과.

## 2026-09-19 18마디 코- 시작 및 앞 구간 확인 접수
- v2-l55 코-를 m18/tick6(18마디 2박 +½)으로 접수. 현재 tick4 대비 +½박. 원본44.718초/격자44.750초 보존.
- v2-l54 모까지 앞 구간 맞음으로 누적. 이전 개별 교정값은 유지하며 포괄 확인으로 덮어쓰지 않음. 후속 구간 전체 이동 없음.
- 앱/가사/confirmed 미변경. 문서 diff 검사 통과.

## 2026-09-19 19마디 첫 소- 위치 접수
- 구절 및 실제 가사 대조로 v2-l61 소- 식별. 사용자 좌표 m19/tick6(19마디 2박 +½), 원본47.299초/격자47.303초 보존.
- 현재 m19/tick4 대비 +½박. 피드백만 누적, 앱/가사 미변경. 문서 diff 검사 통과.

## 2026-09-19 순차 청취 확인 규칙 명확화
- 사용자 지시: 틀린 부분만 전달하므로 체크 지점 앞에서 언급하지 않은 가사는 맞음으로 간주.
- 피드백 정본 상단에 규칙 기록. 현재 경계 v2-l61 소- 앞(v2-l60 시까지)을 확인 구간으로 확장하되 이전 개별 교정값 유지. 앞선 비확인 해석은 최신 지시로 대체.
- 이후 구간은 미확인, 앱/가사/confirmed 변경은 일괄 반영 때 수행. 문서 diff 검사 통과.

## 2026-09-19 20마디 카제노츠 시작 위치 접수
- 주변 가사 대조로 v2-l67 카 식별. 사용자 좌표 m20/tick8(20마디 3박), 원본50.153초/격자50.175초 보존. 현재 tick2 대비 +1½박.
- 순차 확인 경계를 v2-l66 시까지 확장, 기존 교정값 유지. 앱/가사/confirmed 미변경. 문서 diff 검사 통과.

## 2026-09-19 21마디 아사가니 시작 위치 접수
- 주변 가사 대조로 v2-l73 아 식별. 사용자 좌표 m21/tick6(21마디 2박 +½), 원본52.380초/격자52.409초 보존. 현재 tick5 대비 +¼박.
- 순차 확인 경계를 v2-l72 이까지 확장, 기존 교정값 유지. 앱/가사/confirmed 미변경. 문서 diff 검사 통과.

## 2026-09-19 22마디 무카이카제우 시작 위치 접수
- 주변 가사 대조로 v2-l80 무 식별. 사용자 좌표 m22/tick14(22마디 4박 +½), 원본56.251초/격자56.239초 보존. 현재 tick13 대비 +¼박.
- 순차 확인 경계를 v2-l79 노까지 확장, 기존 교정값 유지. 앱/가사/confirmed 미변경. 문서 diff 검사 통과.

## 2026-09-19 23마디 마쿠노레루요 위치 접수
- v2-l86 마를 m23/tick15(23마디 4박 +¾)로 접수. 현재 m24/tick0 대비 -¼박. 원본58.877초/격자58.951초 보존.
- 순차 확인 경계를 v2-l85 우까지 확장, 기존 교정값 유지. 구절만 적어도 첫 음절 시작을 뜻한다는 전달 규칙 추가.
- 앱/가사/confirmed 미변경. 문서 diff 검사 통과.

## 2026-09-19 마 위치 +¼박 재정정
- 직전 접수 m23/tick15에 +1 tick을 적용한 최신 목표는 m24/tick0(24마디 1박).
- 현재 앱 위치와 동일하므로 런타임 시각 변경 불필요. 이전 피드백 원문 보존, 누적 목표만 정정. 문서 diff 검사 통과.

## 2026-09-19 24마디 쿠 위치 접수
- v2-l87 쿠를 m24/tick4(24마디 2박)로 접수. 현재 tick2 대비 +½박. 원본59.796초/격자59.749초 보존.
- 순차 확인 경계를 v2-l86 마까지 확장, 기존 교정값 및 마의 최신 목표 유지. 앱/가사/confirmed 미변경. 문서 diff 검사 통과.

## 2026-09-19 24마디 노 위치 접수
- v2-l88 노를 m24/tick9(24마디 3박 +¼)로 접수. 현재 tick6 대비 +¾박. 원본60.471초/격자60.547초 보존.
- 순차 확인 경계를 v2-l87 쿠까지 확장, 이전 개별 교정값 유지. 앱/가사/confirmed 미변경. 문서 diff 검사 통과.

## 2026-09-19 누적 청취 교정 일괄 적용 — 24마디 노까지
- 목표/범위: 최신 개별 좌표 12곳 적용 및 앞 구간 사용자 확인 상태 반영. 뒤 구간/HTML 내보내기 제외.
- 11개 시작 위치 변경, 재정정한 마는 기존 m24/tick0 유지. 앞 90개 confirmed, 뒤 423개 전체 동일. 이전 판본 archive 및 originalTime 보존.
- 기존 저장 악보에도 한 번만 적용하는 migration을 activate에 연결. 교정 목록 완료 25행 제외, 105행 남음. ID 매핑 보존.
- 검증: 집중 회귀(좌표/범위/원시각/재실행/잘못된 대상 보호), 전체 78 tests/22 files 통과. TypeScript·portable·Vite build 통과. localhost song.json HTTP200 및 12개 좌표/뒤 구간 동일성 확인. 실기기 청취 재검증은 수행하지 않음.

## 2026-09-19 케---스 재교정 접수
- 실제 가사와 대조: v2-l17 케-는 m11/tick14로 현재와 동일, v2-l18 스는 m12/tick4로 요청(현재 m11/tick15 대비 +1¼박).
- 새 구체적 교정은 해당 스의 이전 포괄 확인을 대체. 기존 24마디 노까지 확인 경계와 나머지 적용값 유지.
- 원문 시각 보존, 다음 일괄 반영 대기. 앱/가사 미변경. 문서 diff 검사 통과.

## 2026-09-19 16마디 쿄- 재교정 접수
- 실제 가사 대조로 v2-l43 쿄- 식별. 요청 m16/tick6(16마디 2박 +½), 현재 tick7 대비 -¼박. 원본39.723초/격자39.643초 보존.
- 해당 음절의 이전 포괄 확인을 최신 관측으로 대체하고 나머지 확인 구간 유지. 다음 일괄 반영 대기, 앱/가사 미변경. 문서 diff 검사 통과.

## 2026-09-19 21마디 이 재교정 접수
- 명시 음절 및 실제 가사 대조로 v2-l72 이 식별. 요청 m21/tick0(21마디 1박), 현재 tick2 대비 -½박. 원본/격자51.452초 보존.
- 요의 기존 tick0과 같은 좌표임을 기록. 요/뒤 아는 이동하지 않으며 해당 이의 포괄 확인만 최신 교정으로 대체. 다음 일괄 반영 대기, 앱 미변경. 문서 diff 검사 통과.

## 2026-09-19 23마디 우 재교정 접수
- 구절 및 실제 가사 대조로 v2-l85 우 식별. 요청 m23/tick14(23마디 4박 +½), 현재 tick8 대비 +1½박. 원본58.788초/격자58.792초 보존.
- 우의 이전 포괄 확인을 최신 교정으로 대체. 뒤 마 및 기존 개별 적용값 유지. 다음 일괄 반영 대기, 앱 미변경. 문서 diff 검사 통과.

## 2026-09-19 24마디 노 재교정 접수
- 실제 가사 v2-l88 노 확인. 최신 요청 m24/tick8(24마디 3박), 기존 적용 tick9 대비 -¼박. 원본60.399초/격자60.388초 보존.
- 이전 노 교정값은 최신 관측으로 대체하고 원문 보존. 뒤 음절 및 다른 누적 교정값 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 24마디 마지막 요 위치 접수
- 실제 가사와 명시 음절 대조로 v2-l91 요 식별. 요청 m24/tick15(24마디 4박 +¾), 현재 tick13 대비 +½박. 원본61.481초/격자61.505초 보존.
- 순차 확인 경계를 v2-l90 루까지 확장. 레·루 현재 위치 확인, 노 등 최신 누적 교정값 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 재교정 일괄 적용 — 24마디 요까지
- 목표/범위: 케-·스·쿄-·이·우·노·요 최신 좌표 적용 및 24마디 마지막 요까지 확인 완료. 이후 가사 및 HTML 재내보내기는 제외.
- 7개 좌표 중 케-는 유지, 6개 시작 이동. 앞 93개 confirmed, 뒤 420개 전체 동일. 원시각/변경 전 archive 보존 및 일회성 marker 적용.
- 앞서 적용한 migration 뒤에 후속 migration 연결. 교정 목록 남은 104행, 기존 번호 유지.
- 검증: 좌표/원시각/확인 범위/뒤 불변/재실행/대상 보호 집중 회귀 및 전체 80 tests/23 files 통과. TypeScript·portable·Vite build 통과. 실제 localhost HTTP200, 7개 좌표·확인 상태·뒤 420개 불변 확인. 실기기 청취 재검증 없음.

## 2026-09-19 13마디 쿠 재교정 접수
- 명시 음절과 실제 가사 대조로 v2-l27 쿠 식별. 요청 m13/tick10(13마디 3박 +½), 현재 tick8 대비 +½박. 원본32.621초/격자32.622초 보존.
- 해당 음절의 이전 포괄 확인을 최신 교정으로 대체, 다른 가사 및 확인 경계 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 13마디 히 재교정 접수
- 명시 음절과 실제 가사 대조로 v2-l28 히 식별. 요청 m13/tick12(13마디 4박), 현재 tick11 대비 +¼박. 원본32.918초/격자32.941초 보존.
- 해당 음절의 이전 포괄 확인을 최신 교정으로 대체. 쿠 누적 목표 및 다른 가사/확인 경계 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 13마디 카 재교정 접수
- 명시 음절과 실제 가사 대조로 v2-l29 카 식별. 요청 m13/tick14(13마디 4박 +½), 현재 tick13 대비 +¼박. 원본33.266초/격자33.261초 보존.
- 쿠·히 누적 목표 및 다른 가사/확인 경계 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 14마디 아 재교정 접수
- 명시 음절과 실제 가사 대조로 v2-l31 아 식별. 요청 m14/tick8(14마디 3박), 현재 tick7 대비 +¼박. 원본34.868초/격자34.856초 보존.
- 기존 누적 교정값 및 다른 가사/확인 경계 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 20마디 제 재교정 접수
- 명시 음절과 실제 가사 대조로 v2-l68 제 식별. 요청 m20/tick9(20마디 3박 +¼), 현재 tick10 대비 -¼박. 원본50.342초/격자50.335초 보존.
- 기존 누적 교정값 및 다른 가사/확인 경계 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 20마디 노 재교정 접수
- 명시 음절과 실제 가사 대조로 v2-l69 노 식별. 요청 m20/tick12(20마디 4박), 현재 tick11 대비 +¼박. 원본50.792초/격자50.813초 보존.
- 제의 누적 목표 및 다른 교정값/확인 경계 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 20마디 츠 재교정 접수
- 명시 음절과 실제 가사 대조로 v2-l70 츠 식별. 요청 m20/tick14(20마디 4박 +½), 현재 tick13 대비 +¼박. 원본51.197초/격자51.132초 보존.
- 제·노의 누적 목표 및 다른 교정값/확인 경계 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 21마디 이 최신 위치 재접수
- 실제 가사 v2-l72 이 확인. 최신 요청 m21/tick4(21마디 2박), 기존 적용 tick0 대비 +1박. 원본52.095초/격자52.090초 보존.
- 이전 이의 21마디 1박 피드백은 최신값으로 대체하며 이력 보존. 다른 가사/누적 교정값 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 21마디 가 재교정 접수
- 명시 음절과 실제 가사 대조로 v2-l75 가 식별. 요청 m21/tick12(21마디 4박), 현재 tick9 대비 +¾박. 원본53.359초/격자53.366초 보존.
- 이의 최신 목표 및 다른 누적 교정값/확인 경계 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 23마디 이 재교정 접수
- 명시 음절과 실제 가사 대조로 v2-l82 이 식별. 요청 m23/tick4(23마디 2박), 현재 tick1 대비 +¾박. 원본57.167초/격자57.196초 보존.
- 21마디 이와 별개 대상으로 기록. 다른 누적 교정값/확인 경계 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 29마디 라 위치 접수
- 명시 음절과 실제 가사 대조로 v2-l128 라 식별. 요청 m29/tick8(29마디 3박), 현재 tick6 대비 +½박. 원본73.182초/격자73.153초 보존.
- 순차 확인 경계를 v2-l127 나까지 확장, 이전 개별 교정값 유지. 앱/가사/confirmed 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 29마디 마지막 코 위치 접수
- 명시 음절과 실제 가사 대조로 v2-l129 코 식별. 요청 m29/tick14(29마디 4박 +½), 현재 tick11 대비 +¾박. 원본74.142초/격자74.111초 보존.
- 순차 확인 경계를 v2-l128 라까지 확장, 라와 이전 개별 교정값 유지. 앱/가사/confirmed 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 30마디 소 위치 접수
- 명시 음절과 실제 가사 대조로 v2-l135 소 식별. 요청 m30/tick12(30마디 4박), 현재 tick9 대비 +¾박. 원본76.324초/격자76.345초 보존.
- 순차 확인 경계를 v2-l134 루까지 확장, 이전 개별 교정값 유지. 앱/가사/confirmed 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 30마디 니 재교정 접수
- 명시 음절과 실제 가사 대조로 v2-l131 니 식별. 요청 m30/tick2(30마디 1박 +½), 현재 tick1 대비 +¼박. 원본74.727초/격자74.749초 보존.
- 니의 포괄 확인을 최신 교정으로 대체. 소 및 다른 누적 목표/확인 경계 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 30마디 시 위치 접수
- 명시 음절과 실제 가사 대조로 v2-l136 시 식별. 요청 m30/tick14(30마디 4박 +½), 현재 tick13 대비 +¼박. 원본76.621초/격자76.664초 보존.
- 순차 확인 경계를 v2-l135 소까지 확장, 니·소와 이전 개별 교정값 유지. 앱/가사/confirmed 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 30마디 시 위치 확인 접수
- 실제 가사 v2-l136 시 확인. 요청 m30/tick13(30마디 4박 +¼)은 현재와 동일. 원본76.503초/격자76.504초 보존.
- 순차 확인 경계를 v2-l135 소까지 확장, 소·니 등 기존 누적 교정값 유지. 앱 미변경, 확인 상태는 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 30마디 소시테의 테 위치 접수
- 실제 가사 v2-l137 테 확인. 요청 m30/tick14(30마디 4박 +½), 현재 m31/tick0 대비 -½박. 원본76.691초/격자76.664초 보존.
- 순차 확인 경계를 v2-l136 시까지 확장, 기존 개별 교정값 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 31마디 once 위치 접수
- 실제 가사 v2-l138 once 확인. 요청 m31/tick2(31마디 1박 +½), 현재 tick1 대비 +¼박. 원본77.267초/격자77.302초 보존.
- 순차 확인 경계를 v2-l137 테까지 확장, 영어 표기 및 기존 개별 교정값 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 again 두 음절 위치 접수
- 실제 데이터에서 v2-l140 again은 단일 항목 m31/tick7임을 확인. a-=m31/tick5, gain=m31/tick8을 별개 시작 관측으로 기록.
- 원본77.848/78.208초 및 격자77.781/78.259초 보존. 다음 일괄 반영 시 영어 유지·분할 필요를 명시, 하나의 시작값으로 덮어쓰지 않음.
- 확인 경계 gain까지 확장, once 및 기존 교정값 유지. 앱 미변경. 문서 diff 검사 통과.

## 2026-09-19 32마디 아 위치 접수
- 명시 음절과 실제 가사 대조로 v2-l142 아 식별. 요청 m32/tick4(32마디 2박), 현재 tick2 대비 +½박. 원본80.207초/격자80.174초 보존.
- 확인 경계를 아 직전까지 확장, again 분할 목표 및 이전 개별 교정값 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 32마디 키 위치 접수
- 명시 음절과 실제 가사 대조로 v2-l144 키 식별. 요청 m32/tick8(32마디 3박), 현재 tick7 대비 +¼박. 원본80.803초/격자80.813초 보존.
- 확인 경계를 v2-l143 루까지 확장, 루 현재 위치 및 아 등 이전 개별 교정값 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 32마디 다 위치 접수
- 명시 음절과 실제 가사 대조로 v2-l145 다 식별. 요청 m32/tick10(32마디 3박 +½), 현재 tick9 대비 +¼박. 원본81.061초/격자81.132초 보존.
- 확인 경계를 v2-l144 키까지 확장, 키·아 등 기존 개별 교정값 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 32마디 마지막 요 위치 접수
- 명시 음절과 실제 가사 대조로 v2-l147 요 식별. 요청 m32/tick14(32마디 4박 +½), 현재 tick13 대비 +¼박. 원본81.733초/격자81.770초 보존.
- 확인 경계를 v2-l146 스까지 확장, 스 현재 위치 및 아·키·다 등 기존 교정값 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 누적 교정 일괄 적용 — 32마디 요까지
- 목표/범위: 13~32마디 누적 좌표 및 again 두 시작점 반영, 32마디 요까지 사용자 확인. 이후 가사와 HTML 재내보내기는 제외.
- 기존 항목 시작 위치 21개 변경, 시 위치 유지. again→a-/gain 분할로 총514개. 이전 판본/원시각 보존 및 일회성 migration 연결.
- 확인 148개, 뒤366개 전체 동일. 교정 목록94행 및 고유번호 유지.
- 검증: 좌표·영어 분할·ID 유일성·원시각·범위·재실행·대상 보호 회귀 포함 전체82 tests/24 files 통과. TypeScript·portable·Vite build 통과.
- localhost 서버 미실행 확인 후 npm run dev 재실행. 실제 HTTP200, 요청 좌표 및 뒤366개 불변 확인. 실기기 청취 재검증 없음.

## 2026-09-19 35마디 지 위치 접수
- 실제 가사 대조로 v2-l169 지 식별. 요청 m35/tick10(35마디 3박 +½), 현재 tick11 대비 -¼박. 원본88.776초/격자88.791초 보존.
- 확인 경계를 v2-l168 페-까지 확장, 기존 개별 교정값 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 35마디 케 위치 접수
- 실제 가사 대조로 v2-l171 케 식별. 요청 m35/tick14(35마디 4박 +½), 현재 tick13 대비 +¼박. 원본89.350초/격자89.429초 보존.
- 확인 경계를 v2-l170 다까지 확장, 다 현재 위치 및 지 등 기존 교정값 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 35마디 케 최신 위치 재접수
- 동일 v2-l171 케의 최신 목표 m35/tick15(35마디 4박 +¾). 직전 관측 tick14 대비 +¼박, 현재 앱 tick13 대비 +½박. 원본89.532초/격자89.589초 보존.
- 이전 관측 이력 보존, 최신값으로 대체. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 35마디 가 위치 접수
- 실제 가사 v2-l172 가 확인. 요청 m35/tick15(35마디 4박 +¾), 현재 m36/tick0 대비 -¼박. 원본89.642초/격자89.589초 보존.
- 케 최신 목표와 동일 격자임을 명시. 두 음절의 시간은 임의로 벌리지 않고 가로로 이어 표시할 요구 유지. 기존 교정값 유지, 앱 미변경. 문서 diff 검사 통과.

## 2026-09-19 35마디 케 최신 위치 재정정
- v2-l171 케 최신 목표 m35/tick14(35마디 4박 +½). 직전 관측 tick15 대비 -¼박, 현재 앱 tick13 대비 +¼박. 원본89.366초/격자89.429초 보존.
- 가는 m35/tick15 유지. 케·가 동일 격자 묶음 계획은 서로 다른 최신 좌표로 대체. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 36마디 모 위치 접수
- 실제 가사 v2-l178 모 확인. 요청 m36/tick8(36마디 3박), 현재 tick7 대비 +¼박. 원본91.038초/격자91.025초 보존.
- 확인 경계를 v2-l177 테까지 확장, 기존 개별 교정값 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 36마디 코 위치 접수
- 실제 가사 v2-l179 코 확인. 요청 m36/tick14(36마디 4박 +½), 현재 tick11 대비 +¾박. 원본91.947초/격자91.983초 보존.
- 확인 경계를 v2-l178 모까지 확장, 모 및 기존 개별 교정값 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 누적 교정 일괄 적용 — 36마디 코까지
- 목표/범위: 지·케·가·모·코 최신 좌표 적용, 코까지 사용자 확인. 뒤 구간과 HTML 재내보내기는 제외.
- 5개 시작 위치 변경, 케는 최신 m35/tick14 및 가는 tick15. 앞180개 confirmed, 뒤334개 전체 동일. 원시각/변경 전 archive 및 일회성 marker 보존.
- 교정 목록88행, 기존 번호 유지. activate의 이전 migration 뒤에 연결.
- 검증: 좌표·원시각·범위·뒤 불변·재실행·대상 보호 포함 전체84 tests/25 files 통과. TypeScript·portable·Vite build 통과. 실제 localhost HTTP200 및 5개 좌표/뒤334개 불변 확인. 실기기 청취 재검증 없음.

## 2026-09-19 34마디 우 재교정 접수
- 실제 가사 v2-l161 우 확인. 요청 m34/tick8(34마디 3박), 현재 tick9 대비 -¼박. 원본85.893초/격자85.919초 보존.
- 우의 이전 포괄 확인을 최신 관측으로 대체. 다른 가사/확인 경계 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 34마디 첫 스 재교정 접수
- 실제 가사 v2-l157 스 확인. 요청 m34/tick2(34마디 1박 +½), 현재 tick1 대비 +¼박. 원본84.931초/격자84.961초 보존.
- 우 누적 목표 및 다른 가사/확인 경계 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 34마디 테 위치 재확인 접수
- 실제 가사 v2-l159 테 확인. 요청 m34/tick4(34마디 2박)는 현재와 동일하며 이미 확인 상태. 원본85.293초/격자85.281초 보존.
- 스·우 누적 목표 및 기존 확인 경계 유지. 앱 미변경. 문서 diff 검사 통과.

## 2026-09-19 34마디 STT·음원 재검사 및 반영
- 사용자 스·테·우 앵커 기준으로 Apple STT 2문맥, 원음/보컬 DTW 각2조건, 보컬 spectral flux 비교. AFM4건 모두 uncertain으로 시간 결정에서 제외.
- 스/베/테/오/우/시/낫 tick2/3/4/6/8/10/11, 5개 시작 변경. 대상 외 데이터 전체 동일. 베·시·낫은 추정 상태, 새 교정번호214~216. 케이스 근거 docs/BAR34-ACOUSTIC-REVIEW.md.
- 검증: 전체85 tests/26 files, TypeScript·portable·Vite build 통과. HTTP200 응답에서 7좌표 및 대상 외 불변 확인. archive/원시각/재적용 보호 유지. HTML 미내보내기.
- Apple STT 문자 run과 음절 불일치, 시의 원음/보컬 차이 신규 관측을 에이전트관리팀장 작업에 전달. 직접 청취 검증으로 표현하지 않음.

## 2026-09-19 34마디 낫 사용자 재교정 접수
- v2-l163 낫(216)의 목표 m34/tick12(34마디 4박), 자동 추정 tick11 대비 +¼박. 원본86.493초/격자86.557초 보존.
- 사용자 관측 우선, 앞 음절은 순차 확인 규칙 적용. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 35마디 시 재교정 접수
- 실제 가사 v2-l165 시 식별. 요청 m35/tick2(35마디 1박 +½), 현재 tick1 대비 +¼박. 원본87.470초/격자87.515초 보존.
- 낫 누적 목표 및 다른 가사/확인 경계 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 35마디 로 재교정 접수
- 실제 가사 v2-l166 로 확인. 요청 m35/tick3(35마디 1박 +¾), 현재 tick4 대비 -¼박. 원본87.638초/격자87.674초 보존.
- 시·낫 등 기존 누적 교정값과 확인 경계 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 35마디 이 위치 재확인 접수
- 실제 가사 v2-l167 이 확인. 요청 m35/tick4(35마디 2박)는 현재와 동일하며 이미 확인 상태. 원본87.802초/격자87.834초 보존.
- 시·로·낫 등 누적 교정값 및 기존 확인 경계 유지. 앱 미변경. 문서 diff 검사 통과.

## 2026-09-19 36마디 첫 노 재교정 접수
- 실제 가사 v2-l173 노 확인. 요청 m36/tick2(36마디 1박 +½), 현재 tick1 대비 +¼박. 원본90.099초/격자90.068초 보존.
- 기존 누적 교정값 및 확인 경계 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 37마디 무 위치 접수
- 실제 가사 v2-l181 무 확인. 요청 m37/tick6(37마디 2박 +½), 현재 tick1 대비 +1¼박. 원본93.231초/격자93.259초 보존.
- 순차 확인 경계를 v2-l180 노까지 확장, 기존 누적 교정값 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 38마디 노 위치 접수
- 실제 가사 v2-l185 노 확인. 요청 m38/tick4(38마디 2박), 현재 tick2 대비 +½박. 원본95.484초/격자95.493초 보존.
- 순차 확인 경계를 v2-l184 보-까지 확장, 기존 누적 교정값 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 38마디 히 위치 접수
- 실제 가사 v2-l186 히 확인. 요청 m38/tick8(38마디 3박), 현재 tick6 대비 +½박. 원본96.110초/격자96.131초 보존.
- 순차 확인 경계를 v2-l185 노까지 확장, 노 등 기존 누적 교정값 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 38마디 와 위치 접수
- 실제 가사 v2-l187 와 확인. 요청 m38/tick9(38마디 3박 +¼), 현재 tick10 대비 -¼박. 원본96.316초/격자96.291초 보존.
- 순차 확인 경계를 v2-l186 히까지 확장, 노·히 등 기존 누적 교정값 유지. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 38마디 al- 시작 접수
- 실제 데이터 v2-l188 always 단일 항목 확인. al- 요청 m38/tick12(38마디 4박), 현재 단어 tick11 대비 +¼박. 원본/격자96.770초 보존.
- ways 시작은 미제공으로 임의 분할하지 않음. 순차 확인 경계 와까지 확장, 기존 교정값 유지. 앱 미변경. 문서 diff 검사 통과.

## 2026-09-19 38마디 al- 최신 시작 재접수
- al- 명시를 따라 v2-l188 always 시작 목표 m38/tick14로 정정. 이전 접수 tick12 대비 +½박, 현재 앱 tick11 대비 +¾박. 원본97.052초/격자97.089초 보존.
- ways 위치로 오해하지 않고 이전 al- 관측 대체. 앱 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 always 두 음절 위치 접수
- 실제 데이터 v2-l188 always 단일 항목 m38/tick11 확인. al-=m38/tick12, ways=m38/tick14를 별도 시작으로 기록.
- 원본96.770/97.052초 및 격자96.770/97.089초 보존. 다음 일괄 반영 시 영어 유지·분할 필요, 확인 경계 ways까지 확장.
- 기존 개별 교정값 유지, 앱 미변경. 문서 diff 검사 통과.

## 2026-09-19 41마디 가사 잘림/진행선 좌표 수정
- 원인: r41.beatXs=[]로 균등 위치 fallback 사용. 기존 추출기는 8개 심벌 패턴만 인식하여 탐 패턴은 기준점 누락. 절단 좌표 변환 자체는 기존 비어 있지 않은 기준점을 보존함.
- 원본 PDF와 page-2 이미지 확인. 첫 음표 및 정박 notehead 중심77.37/104.70/136.73/164.07pt로 r41 빈 기준점만 display 보정, 원본/사용자 지정 기준점과 음악 시간 유지.
- 가사 중앙 정렬 및 충돌 배치의 음수 왼쪽 좌표가 stage overflow로 잘림. packLabels에 행 시작 경계를 제공, 한줄 뷰는 이동 viewport 대신 전체 ribbon 원점을 사용해 재생 중 가사가 붙어다니지 않도록 함.
- why?=m41/tick0 관측 기록. 다른 누적 가사 교정/HTML 재내보내기는 이번 범위 밖.
- 검증: 원본 좌표/사용자 좌표 보존 및 첫 가사 왼쪽 경계/충돌 회귀 포함87 tests 통과, TypeScript·portable·Vite build 통과. localhost HTTP200. 실기기 화면 재검증은 수행하지 않음.

## 2026-09-19 全110마디 음표 기준점 전수조사
- 조사 요청 범위로 앱/데이터는 미변경. raw beatXs, displayRegion 예외, 원본3쪽 이미지와 PDF 글리프 대조.
- 저장 기준점62개, 없음48개. 41 표시 보정 제외 실미보정47개=실제 음표36 + 다중마디쉼표4 + 반복기호6 + 온마디쉼표1.
- 기존62개는 박 수+1/범위/순서 적합, 음표 중심까지 최대0.608pt. 음가별 전사 정확성 검증과 구분. 84의5/4 기준점6개도 누락.
- docs/BEAT-ANCHOR-AUDIT.md에110행 분류 및36개 보정후보 기록. source JSON/PDF 검사와 집계 일치 확인, git diff --check 통과. 코드 변경 없음.

## 2026-09-19 전체 누락 음표 기준점 앱 반영
- 목표: 누락 영역의 정박 표시 기준 보완, 가사/음원 시각 유지. 정박 사이 세부 음가 전사는 범위 밖.
- 원본 PDF 음표/쉼표 열과 이미지 기준으로37개 패턴의 정박 좌표 생성(41 포함). 기호마디11개는 명시적 균등 기준. 기존62개 보존, 전체110개 beats+1 표시 좌표 확보.
- source crop 완전 일치 및 빈 beatXs 조건으로만 보정. 원본/사용자 지정값 보존. 84마디5/4는6개 좌표.
- 전체88 tests 및 TypeScript·portable·Vite build 통과, localhost 보정모듈 HTTP200 확인. docs/BEAT-ANCHOR-AUDIT.md 갱신. HTML 재내보내기/실기기 검증 미실시.

## 2026-09-19 bright 표기 교정 / 39마디 시작 누적
- 사용자 명시 정정에 따라 첫·마지막 후렴 blight를 bright로 수정. 기존 저장곡에도 활성화 시 적용하며 사용자 편집 텍스트·시간·confirmed와 과거 archive 보존. 로컬 demo 현재 가사 두 항목도 수정.
- bright(v2-l192) 시작 m39/tick0, 원본97.400초/격자97.408초 접수. 위치 및 앞선 누적 싱크는 다음 일괄 반영 대기.
- 영어 교정 회귀 포함89 tests 및 TypeScript·portable·Vite build 통과.


## 2026-09-19 가사 정본 파일 bright 동기화
- 사용자 요청으로 docs/JAPANESE-CANONICAL-READINGS.md 일본어/한글 발음 표의 두 후렴 및 data/reference/japanese-canonical.json 현재 일본어 가사를 always bright로 수정. JSON에 사용자 정정 출처 기록.
- PRD 및 현재 의심 목록 문맥도 동기화. 과거 비교 문서는 원문 유지 후 최신 정정 안내 추가, STT 실험 입력·archive는 보존. 앱 코드와 시간은 미변경.
- 정본 두 후렴 및 한글 발음 표, JSON 파싱과 git diff --check 확인.

## 2026-09-19 39마디 bright까지 누적 일괄 적용
- 최신 사용자 좌표로 기존9개 시작 이동, always를 al-/ways로 분할(1항목 추가), bright=m39/tick0 재확인. 낫·시·로·36마디 노·무·38마디 노/히/와 포함.
- 신규 migration을 활성화 체인 끝에 추가해 기존 저장곡에 한 번 적용. 기존 앞부분 위치와 bright 이후 가사 객체 보존, 원본 archive 기록. 로컬 demo 동일 함수로 적용.
- 확인 목록7행 완료 처리(고유번호 유지), 남은84행. 확인 경계 bright까지 반영.
- 91 tests 통과, TypeScript·portable·Vite build 통과. localhost 신규 모듈 HTTP200. 실기기 청취/GUI 재검증은 하지 않음.


## 2026-09-19 45마디 카 시작 접수
- 현재 가사 v2-l223 카=m45/tick1 확인. 사용자 목표 m45/tick4(2박), +¾박. 원본113.371초/격자113.365초 보존.
- 앞 메까지 순차 확인으로 누적, 기존 개별 교정 유지. 앱·데이터 미변경, 다음 일괄 반영 대기. 문서 diff 검사 통과.


## 2026-09-19 45마디 베 시작 접수
- 현재 v2-l224 베=m45/tick7 확인. 요청 m45/tick10(3박 +½), +¾박. 원본114.326초/격자114.322초 보존.
- 카=m45/tick4 누적 목표 유지, 확인 경계 베까지 확장. 앱·데이터 미변경, 일괄 반영 대기. 문서 diff 검사 통과.


## 2026-09-19 45마디 노 시작 접수
- 현재 v2-l225 노=m45/tick11 확인. 요청 m45/tick12(4박), +¼박. 원본114.640초/격자114.642초 보존.
- 카·베 누적 교정 유지, 확인 경계 노까지 확장. 앱·데이터 미변경, 일괄 반영 대기. 문서 diff 검사 통과.


## 2026-09-19 46마디 코- 시작 접수
- 현재 v2-l227 코-=m45/tick15 확인. 요청 m46/tick0(1박), +¼박. 원본115.308초/격자115.280초 보존.
- 카·베·노 누적 교정 유지, 앞 무 현재 위치 확인으로 접수. 확인 경계 코-까지 확장. 앱·데이터 미변경, 일괄 반영 대기. 문서 diff 검사 통과.


## 2026-09-19 45마디 무 위치 재확인
- v2-l226 무 현재 m45/tick13과 사용자 요청(4박 +¼) 일치. 원본114.878초/격자114.801초 보존, 시각 이동 불필요.
- 카·베·노·코- 누적 교정 및 확인 경계 유지. 앱·데이터 미변경, 일괄 반영 대기. 문서 diff 검사 통과.


## 2026-09-19 45마디 무 시작 재교정 접수
- 현재 v2-l226 무=m45/tick13 확인. 요청 m45/tick14(4박 +½), +¼박. 원본115.014초/격자114.961초 보존.
- 직전 포괄 확인보다 최신 개별 교정 우선. 카·베·노·코- 누적 목표 및 코-까지 확인 경계 유지. 앱·데이터 미변경, 일괄 반영 대기. 문서 diff 검사 통과.


## 2026-09-19 46마디 토 시작 접수
- 현재 v2-l231 토=m46/tick11 확인. 요청 m46/tick12(4박), +¼박. 원본117.151초/격자117.195초 보존.
- 앞 미·타·코 현재 위치 확인으로 누적, 이전 개별 교정 목표 유지. 확인 경계 토까지 확장. 앱·데이터 미변경, 일괄 반영 대기. 문서 diff 검사 통과.


## 2026-09-19 46–48마디 8개 관측 누적
- 실제 ID/문맥 대조: 나233=m46/14, 이234=m47/4, 케235=m47/6, 오242=m48/5, 모243=m48/6, 이244=m48/7, 아245=m48/8, 갓246=m48/10. 갓은 현재와 동일, 나머지7개 변경 목표.
- 각 원본 재생/격자 시각 보존. 갓까지 순차 확인 경계 확장, 기존 누적 목표 유지. 앱·데이터 미변경, 일괄 반영 대기. 문서 diff 검사 통과.

## 2026-09-19 48마디 갓까지 누적 일괄 적용
- 45~48마디14개 관측 적용:13개 시작 위치 변경, 갓은 현 위치 재확인. 기존 미언급 시작 위치·앞선 개별 교정 유지, 갓까지 confirmed 처리.
- 새 migration을 활성화 체인에 추가해 기존 저장곡도 한 번 적용. 원본 archive 보존, 갓 뒤 가사 객체는 그대로 유지. 로컬 demo 동일 함수로 적용.
- 확인 목록15행 완료 처리, 고유번호 매핑 보존. 남은69행. 피드백 문서 최신 경계·적용 상태 갱신.
- 93 tests 통과, TypeScript·portable·Vite build 통과, localhost 신규 모듈 HTTP200. 실기기 청취·GUI 재검증은 수행하지 않음.

## 2026-09-19 MusicXML 악보 지원 확장
- 목표/완료조건/제외범위를 docs/MUSICXML-SUPPORT.md 및 PRD에 기록. 원곡 데이터/교정 시각 미변경.
- OSMD2.1.2로 MusicXML/XML/MXL 파싱·렌더링. 파트 선택, 박자/템포/내장 가사, 그래픽 정박 좌표를 기존 재생 모델에 연결. 여러마디쉼표를 마디별로 표시.
- 파일·안내 → MusicXML로 악보 교체 추가. 마디 수/박자 일치 검사, 기존 싱크·루프·마커 유지. 원본바이트/PNG를 기존 저장 계약에 보존. 백업 원본형식 경로와 페이지 캐시 추가, 구PDF 백업호환. HTML은 사전 렌더링 페이지로 독립 실행.
- 초기 Canvas 영역에 템포/연습표시 상단 잘림 발견 → skyline 포함. iPad 두 줄 가사 겹침 발견 → XML에만 비율 유지 fit 및 진행선/가사 좌표 동일 배율 적용. 기존PDF 표시 유지.
- CLI 및 브라우저 기능 검증: 110마디/84의5/4, 4쪽 렌더링, 입력/저장/재열기/교체/ZIP복원/HTML내보내기. 가사 시작·마디 시간 보존. XML의 반복은 인쇄 순서라는 안내, 지원 밖 못갖춘/다중오선/중간템포 거절.
- Simulator iOS27 iPad mini Safari에서 두 줄 MusicXML+가사 화면 확인. 실기기·가창청취 및 브라우저툴바 포함 무스크롤 전체화면 보장은 이번 증거 범위 밖.
- 101 tests 통과. 라이선스 동봉, npm audit0. 최신 빌드 및 최종 Git 상태는 아래 기록.
- 최종 TypeScript·portable·Vite build 통과, localhost MusicXML 모듈 HTTP200 확인. OSMD 지연 청크 크기 경고만 존재. 변경 파일 diff 검사 통과.

## 2026-09-19 — 곡별 악보 목록과 저장 유형 버튼

- 요청: 곡당 한 카드, 실제 저장된 PDF/MusicXML/가사만 유형별 색상으로 표시.
- 구현: song-scores.ts의 활성/비활성 악보 스냅샷. 공통 음원·가사·마커·반복은 곡에 유지한다. 목록의 유형 버튼으로 악보 전환/가사 편집, 곡 카드의 악보 추가로 다른 형식 보관. 같은 유형 갱신은 확인 후 수행. 기존 단일 형식 데이터와 호환하고 제목으로 자동 병합하지 않는다.
- 보존: 비활성 원본·페이지·영역·마디 대응을 IndexedDB의 owned bytes, 미디어 포함 ZIP의 other-scores.json, 단일 HTML에 포함. HTML에서도 유형 선택 가능. 마디 구성이 바뀌어 대응이 깨지면 전환을 거절한다.
- 검증: 30파일/105테스트 통과. 새 테스트는 양방향 전환·영역 편집·가사/연습 상태 보존·구성 불일치·IndexedDB/HTML/백업 코덱 왕복·실제 유형만 표시하는 DOM 계약. DOM 테스트 첫 실행은 이전 목록을 읽는 대기 조건으로 실패했고, 목록 dialog가 다시 열린 뒤 검사하도록 수정했다. build 통과; 기존 OSMD 청크 크기 경고 유지.
- 실제 localhost UI: 별도 QA 곡에 PDF 이후 110마디 MusicXML 추가, 한 카드의 PDF/MusicXML/가사 버튼 확인, PDF→MusicXML 왕복 후 가사 객체·마디 시간·마커·반복 동일 확인. 가사 버튼으로 편집창 열림 확인. 사용자 원곡 데이터는 바꾸지 않았다.
- iOS27 iPad mini(A17 Pro) Safari: 두 형식 포함 HTML 테스트 산출물의 한 곡 카드/세 유형 버튼 확인. docs/experiments/song-library-ipad.png. QA용 자동 열기 스크립트 최초 삽입은 번들 문자열에도 치환되어 실패, 마지막 body 닫힘에만 삽입하도록 고쳐 재검증했다. 앱 소스 결함과 구분한다.
- 한계: 과거 교체로 이미 사라진 파일은 복구하지 않는다. PDF 감지 마디 수가 다르면 자동 연결하지 않는다. 미디어 없는 백업은 원본 파일 별도 보관 필요. 실제 iPad 파일 앱 검증이나 외부 배포는 수행하지 않았다.

## 2026-09-19 — MusicXML 정본 및 독립 가사 리듬 성부

- 사용자 결정: 가사 초 단위 편집 폐기. 보컬 악보 또는 청취 교정을 악보 위치로 저장. 악보·메타정보·가사와 음원 연결점을 MusicXML 정본에 보존.
- 구현: canonical-xml.ts, lyric-score.ts. XML 원문 보존 + 독립 unpitched 가사 파트 + 메타정보/오디오 연결 확장. Song은 파생 편집/재생 모델. 기존 시각 자유 입력 제거, 길이(박) 추가, 원제/작사/작곡 편집, 보컬 파트 가져오기, XML 직접 저장과 재가져오기, ZIP/HTML/IndexedDB 보존. 원본 음원 SHA-256 대조.
- 보존 검사: 기존 515개 음절 시작 위치 변경 0. 가사/메타정보 캐시를 지운 후 XML에서 복원. 마디-음원 연결을 5초 이동해도 가사의 음악적 위치 불변. 기존 끝 시각은 음악적 길이로 이전하며 청취로 새 발음 길이를 측정한 것으로 주장하지 않는다.
- 집중/전체 검사: 31파일 114테스트 통과. 추가 storage/portable 테스트 첫 실행은 jsdom Blob에 arrayBuffer가 없는 테스트 환경 문제로 실패, Node 표준 Blob을 주입하여 재검증했다. build 통과, 기존 OSMD 청크 크기 경고 유지.
- XSD: 가사 전용 110마디/515음절 및 실제 브라우저의 전체 XML 모두 MusicXML 4.0 스키마 PASS. 최초 스키마 로드는 XML namespace import 로컬 resolver가 없어 실패했고 로컬 xsd resolver를 적용했다. XML 자체의 검사 실패와 구분한다. 증거 docs/experiments/canonical/{xsd.txt,browser-xsd.txt,browser.musicxml}.
- 실제 UI: 기존 별도 QA 곡을 대상으로 이전/재열기, 초 입력 없음, 보컬 파트 가져오기, 이전 가사 이력 보존, 시작 박 수정 후 XML 재읽기 확인. 원곡 사용자 레코드는 이 QA에서 수정하지 않음. iPad mini iOS27 Safari HTML 화면: docs/experiments/canonical/ipad-lyrics.png.
- 경계: PDF만 있는 곡에 드럼 음표를 추정해 만들지 않음. 이미 보관된 MusicXML 악보는 정본 기반으로 보존. 보컬 PDF 채보, 반복 자동 펼치기, 모든 가사의 음원 청취 재검증은 이 작업에 포함하지 않음. OSMD 유지; SVG 전환/Verovio 동일 기기 비교는 미실행. Apple STT/AFM은 결정적인 위치/스키마 변환 작업에 필요하지 않아 사용하지 않았으며 신규 도구 실측 발견 없음.
- 최종 집중 재검증: canonical-xml/lyric-grid/ui 3파일 29테스트 통과(15:33), 이후 build 통과. 스키마/DOM/오디오 위치 근거와 실제 청취·실기기 검증을 구분했다.

## 2026-09-19 — PNG/SVG 동일 악보 비교

- 요청: 렌더링 시간·저장 공간 비교. 앱 소스와 사용자 데이터는 변경하지 않았다.
- 구현: scripts/benchmark-renderer.{ts,html}, build-renderer-benchmark.mjs, benchmark-renderer-server.py. 별도 5187 로컬 서버/IndexedDB에서 동일 110마디 XML을 형식별 3회씩 두 환경에서 측정.
- 결과: Safari iPad mini iOS27 시뮬레이터 중앙값 PNG/SVG 생성 288/187ms, 재표시 153/70ms, 원본 1.329/3.771MB, gzip 0.998/0.655MB. 진행선/음영 미세 실험 둘 다 약 60fps. 실제 iPad 하드웨어 및 전체 음악 재생 부하는 미검증.
- 검증: 12개 표본 모두 오류 없음, 110마디/4페이지, 동일 XML 해시, 이미지 디코딩 성공. 영역 좌표 차이는 약 0.2 CSS px 이내. Safari SVG 화면 확인. 상세 docs/PNG-SVG-BENCHMARK.md, 원시 docs/experiments/renderer-benchmark/{desktop,simulator}.json.
- 실험 문제: 최초 esbuild IIFE에서 top-level await 오류 → async 함수로 감싸 재빌드. Mac 브라우저 RAF ~1Hz 제한으로 재표시/프레임 결과 판정 제외. open -a Simulator는 앱 이름 탐색 실패했으나 부팅된 simulator/simctl 경로의 Safari 검증은 정상 완료.
- 판단: 단순 SVG 교체는 용량 증가. 압축 SVG 캐시를 다음 후보로 권장하되 압축 해제/전체 앱/독립 HTML/실기기 검증 후 전환. 현재 PNG 유지.

## 2026-09-19 — MusicXML SVG 렌더링 적용

- 승인된 비교 결과에 따라 OSMD backend를 SVG로 변경. score-pages.ts에서 gzip 캐시/표시용 압축 해제. 이미지 URL은 image/svg+xml이며 원본 XML은 정본 유지.
- 웹앱에서 기존 MusicXML PNG 캐시를 열 때 갱신. 마디 구성/페이지 수 검증 후 기존 정규화 영역·박 위치 보정·가사·음원 시간을 유지. PDF 및 과거 HTML PNG는 호환.
- ZIP 페이지 manifest로 MIME/경로 보존, 기존 pages/N.png 백업 읽기 유지. HTML/IndexedDB는 기존 바이트 코덱으로 압축 형식 보존. 소스 src/main.ts, src/musicxml.ts, src/score-pages.ts. 계약 docs/SVG-RENDERING.md 및 PRD 반영.
- 검증: 전체 32파일 116테스트 통과. SVG 압축/해제→IndexedDB→HTML 코덱 왕복, 기존 PNG 및 손상된 gzip 실패 검사 추가. 최초 타입 검사에서 optional parsed 오류를 수정한 뒤 build 통과. 기존 OSMD 번들 크기 경고 유지.
- localhost 기존 별도 QA MusicXML 곡 PNG 4쪽→SVG gzip 4쪽(640,977bytes) 갱신, 110마디 음원 시간 및 모든 가사 text/scorePosition 보존 확인. 기존 canonical 재읽기로 파생 originalTime 필드 하나가 제거되었으나 가사 시작·길이·악보 위치 불변. 원곡 사용자 레코드 대신 QA 곡 사용.
- 새 HTML을 file:로 열어 8마디 SVG 이미지 MIME 확인. iOS27 iPad mini Safari 시뮬레이터에서 같은 HTML의 41–48마디·가사·진행선 표시 확인: docs/experiments/renderer-benchmark/svg-app-ipad.png. 테스트 HTML public/demo/qa/svg-portable.html은 Git 제외. 과거 exports 파일은 변경하지 않음.
- 실물 iPad에서의 오프라인 재생/음질은 이번 검증에 포함하지 않음. Apple STT/AFM 신규 실험은 없음.

## 2026-09-19 — PDF / MusicXML 검수 및 스페이스 캡처

- 화면 메뉴에 PDF·MusicXML 검수 모드 추가. 위 PDF, 아래 SVG 같은 네 마디, 독립적인 악보 박 좌표 진행선 및 곡명·마디·박·시각 표시. 두 형식과 마디 구성을 검증한다. PDF 활성 상태에서 남아 있는 XML PNG 캐시도 필요할 때 SVG로 갱신한다.
- 재생 중 스페이스/일시정지 버튼은 정지 후 캡처 복사. 다시 스페이스는 기존 해당 마디 처음부터 재생 규칙 유지. 반복 keydown 무시. 터치 정지·캡처 버튼, 이미지 복사 거부 시 동일 캡처 저장. PNG Promise를 사용자 이벤트 안에서 ClipboardItem에 전달하고 프레임은 즉시 별도 Canvas에 고정한다.
- 검증: 33파일 119테스트, build 통과. 마디 연결/불일치 거부/원본 불변/동기 clipboard.write 호출/미지원 오류 테스트 추가. 기존 번들 크기 경고 유지.
- 실제 localhost QA 곡에서 화면 모드 선택, 재생→물리 키 입력 API Space→정지·복사됨 확인. macOS clipboard info에서 PNGf 197,017 bytes 확인. 검수 Canvas 3052×880의 5–8마디 PDF/SVG 및 정지 위치 시각 확인: docs/experiments/renderer-benchmark/review.png.
- iOS27 iPad mini Safari에서 두 악보를 포함한 새 HTML의 41–44마디 검수 화면 확인: docs/experiments/score-review/ipad.png. 시뮬레이터에서는 표시 확인이며 클립보드 쓰기 성공 증거는 Mac 브라우저 측정이다. 실물 iPad 클립보드 권한/파일 실행 앱 동작은 별도.
- 승인된 local 앱 및 별도 QA 곡만 사용. 사용자 원곡 레코드나 과거 HTML을 덮어쓰지 않았다. 자동 음표 수정/청취 검수는 포함하지 않음. 상세 docs/SCORE-REVIEW.md.

## 2026-09-19 — 보기 라디오 및 기본 곡 MusicXML 누락 수정

- 원인: 비교 기능은 QA 곡에만 PDF/XML을 연결해 확인했고, 사용자의 기본 real-paradis 레코드에는 PDF만 있었다. 이를 사용자가 직접 추가해야 하는 상태로 남긴 구현 누락 수정.
- 화면 보기 세 항목을 라디오 버튼으로 노출. 값/설정 동기화, 기타 곡의 누락 형식 안내 및 직접 추가 경로. 기본 곡에는 변환 작업 14:47 MusicXML을 public/demo/score.musicxml로 제공하고 일치하는 PDF의 기존 곡을 열 때 자동 연결. 기존 사용자 XML은 덮어쓰지 않음.
- 변환 작업 산출물/해시는 docs/SCORE-REVIEW.md에 기록. 미디어는 기존 정책대로 Git 제외. 현재 5173 및 빌드 자료에는 포함.
- 브라우저에서 실제 real-paradis가 PDF만 가진 상태를 재현한 뒤 열어서 PDF+MusicXML(SVG gzip 4쪽) 자동 연결 및 라디오 검수 전환 확인. 음원 마디 시간 불변. 오래 열지 않았던 브라우저 레코드는 기존 앱의 가사 마이그레이션도 함께 실행되었으므로 전체 activate 전후와 XML 첨부 단계 자체를 구분함.
- 테스트: 기존 119개 통과 후 자동 첨부 보존 테스트 추가. 첫 테스트가 writeCanonical의 이전 가사 정규화 부수 효과를 발견해, 첨부 시 복제본에 XML을 작성하도록 수정. PDF/페이지/마디/가사 불변·재첨부 안 함·다른 PDF 제외 및 라디오 DOM 계약 검증.
- 수정 후 집중 2파일 16테스트 통과, 최종 build 통과. 기존 OSMD 큰 청크 경고 유지. 공개 배포나 원격 push 없음.

## 2026-09-19 — 5마디 2·3박 쉼표 표시 교정

- 사용자 캡처에서 5마디 위 성부 8분쉼표와 아래 성부 4분쉼표 겹침 확인. 음가는 올바르지만 XML rest의 display-step/octave가 없어 OSMD 자동 배치가 충돌한 원인.
- 해당 마디의 정확한 성부/음가 구조에서만 위 성부 A5, 아래 성부 D4를 지정. 음가·음표·다른 마디는 변경하지 않음. 사용자 명시 위치가 있으면 보존. 기본 XML 자료와 해시 갱신, 이미 저장된 해당 곡의 XML 정본/소스 및 SVG 캐시도 다음 열기에 교정.
- public/demo/score.musicxml 새 SHA-256: 3f67fc08df3471fba4dc19b4cdf907c45a1f29c835221670ac4be3d303de3fbf. 원 변환 작업의 파일은 수정하지 않았다.
- 35파일/122테스트 및 build 통과. 전후 XML에서 6개 rest의 위치 태그만 제거하면 나머지 XML이 동일함을 검증. 반복 적용 불변·명시 위치 보존 확인. 실제 OSMD 그림에서 8분쉼표 위/4분쉼표 아래 분리 확인: docs/experiments/score-review/rest5.png. 실제 저장 레코드 6개 위치 A5,A5,D4,D4,D4,D4 및 검수 모드 재열기 확인.

## 2026-09-19 — 전체 드럼 쉼표 3단 고정

- 사용자 지정 심벌 상단/드럼 중단/킥 하단을 전체 267개 rest에 적용. 5마디만 보정하던 경로를 전체 곡 교정으로 확장. voice1에는 심벌과 드럼이 혼합되어 있어 원본 PNG 마디별 접촉시트로 1,8,36,39,40,68,72,80,84,91,94,96,107–110의 쉼표 높이를 확인했다. source docs/experiments/score-review/rest-audit.png.
- XML rest display-step/octave 상단 A5 15개, 중단 B4 15개, 하단 D4 237개. 공통 온마디 쉼표는 중단 유지. 저장된 소스·정본·SVG와 기본 자료를 모두 갱신. 원본 변환 작업 파일은 변경하지 않음.
- 35파일 123테스트·build 통과. 전후 XML에서 rest 위치 정보만 제거하면 나머지가 완전히 동일함을 검증. 재적용 불변, 모든 rest의 위치 누락 없음 확인. 실제 저장 레코드에서도 B4:15/A5:15/D4:237 확인. 검수 화면 5–8마디에서 상단/중단/하단 분리 확인: docs/experiments/score-review/rest-three-lanes.png.
- 음가·노트·타이밍·가사 재배치는 하지 않음. 이 곡 전용 매핑이며 다른 MusicXML에 성부 번호 기반 일괄 적용하지 않음.

## 2026-09-20 — PDF·SVG 검수 화면 정렬 및 마디 연결

- 목표: 첫 SVG 마디 오선 정렬, 가로·세로 셀 너비 채우기, 마디 사이 공백 제거.
- 원인: 이미지 전체 영역별 contain 배율이 제목·템포 등 상단 영역 크기에 따라 달라졌고, 마디별 8px 여백이 있었다.
- 변경: 오선 감지와 페이지별 간격 중앙값으로 세로 기준 통일, 셀 전체 너비로 렌더링 및 진행선 좌표 통일. 원본 데이터 변경 없음.
- 실험: PDF 9마디 회색 선과 100마디 음표에 합쳐진 선에서 감지 실패를 발견해 밝기 기준·페이지 간격 기반 탐색을 보정했다. 세로 높이만으로 크기를 정하면 글자가 과도하게 늘어나는 문제도 셀 너비 제한으로 수정했다.
- 검증: 로컬 Chromium 캔버스 1133/744px 너비, 첫 4마디 및 97–100마디 렌더링 확인. 두 악보 220마디 감지 완료. 실제 iPad Safari 회전 검증은 이번 회차에서 미실시.
- 증거: docs/experiments/score-review/ 아래 aligned 이미지, final-fill.png 및 alignment-tests.log, alignment-build.log. HTML 내보내기는 별도 요청 때 생성한다.

## 2026-09-20 — ego / Device Hub GUI 반환 텍스트 비용 비교

화면 메뉴 열기·확인·닫기를 양쪽에서 실행했다. full_page snapshot/hierarchy 세 상태를 o200k_base로 계수: ego 3,141, Device Hub 47,865 토큰. 같은 키워드 필터 적용 후 200/967. 실제 청구·추론·이미지 토큰은 측정하지 못했다. ego 전체 캡처 시간 초과, Device Hub 캡처 성공 및 시각 확인. 연결 세션 종료 확인. 자세한 조건·한계·증거는 docs/GUI-COST-COMPARISON.md. 앱 코드와 사용자 설정은 변경하지 않음.

## 2026-09-20 — Device Hub 승인 유효기간 기록

사용자가 알려준 Device Hub 제어 승인 24시간 유효기간을 docs/IPAD-SIMULATOR.md 및 명시적으로 요청한 지속 기억 업데이트 노트에 기록했다. 사용자 제공 정보와 실측 검증을 구분했다.

## 2026-09-20 — Safari MCP와 기존 ego 측정값 비교

ego 재실행 없이 기존 결과 재사용. Safari MCP에서 같은 검수 보기의 화면 메뉴 열기/세 선택지 확인/닫기 성공. 전체 반환 텍스트 2,106토큰(기존 ego 3,141), 동일 필터 후 207(ego 200). Safari 스크린샷 성공 및 직접 시각 확인. 실제 과금/이미지/추론 제외와 단일 시나리오 한계를 docs/GUI-COST-COMPARISON.md에 기록. 앱 소스 변경 없음.

## 2026-09-20 — Safari 우선 테스트 지침 채택

사용자 요청에 따라 AGENTS.md를 Safari MCP 우선, 실패 시 ego-browser 검토로 변경했다. 비교 보고서에도 최종 결정을 기록했다. iPad 기기 검증 절차는 유지한다. 문서 diff 확인 완료; 앱 코드 변경 없음.

## 2026-09-20 — Safari 미지원 기능의 직접 ego 사용

사용자 보완 결정: Safari MCP 미지원 기능은 실패를 기다리지 않고 처음부터 ego-browser를 사용한다. 지원 기능의 실패 시 ego 검토 규칙과 구분해 AGENTS.md에 반영했다.

## 2026-09-20 — 마디 전체 쉼표 중앙 배치

- 요청: 연속 쉼을 개별 마디로 표시할 때 마디 전체 쉼표를 중앙 배치.
- 변경: OSMD SVG 생성 뒤 해당 쉼표 기호의 수평 좌표만 중앙으로 보정. 부분 쉼표·세로 위치·재생 앵커 보존. 기존 저장 곡의 SVG 캐시 자동 갱신 및 버전 확인 추가.
- 검증: Safari MCP에서 기존 곡 재열기 → 1~4마디 중앙 배치 직접 화면 확인. 저장 SVG 전체 4페이지에서 중앙 배치 표식 4/0/0/1개 확인. 테스트 37파일/128개 및 빌드 통과. 캐시 갱신 후 원본·음원·가사·수동 영역 보존 및 재열기 중복 생성 방지 테스트 포함.
- 증거: docs/experiments/gui-cost/centered-rests.png, rest-tests.log, rest-build.log. 앱 개발 소스 반영이며 기존 내보낸 HTML은 재생성하지 않음.

## 2026-09-20 — 오픈 하이햇 빈 머리 렌더링 수정

MusicXML에는 Open hi-hat 및 filled=no가 이미 존재했으나 OSMD SVG가 검은 머리로 출력했다. 짧은 normal 음표의 명시적 빈 머리를 SVG에서 보정하고 기존 캐시 갱신 버전을 변경했다. Safari 15·16마디에서 빈 하이햇/검은 스네어 구분 직접 확인. 원본 빈 머리 지정 268개와 SVG 표식 268개 일치. 테스트 128개 및 빌드 통과. 원본/정본 MusicXML 변경 없음. 증거: docs/experiments/gui-cost/open-hihat.png, hihat-tests.log, hihat-build.log.


## 2026-09-20 — OSMD upstream hollow normal notehead fix and proposal

- User requested confirmation/report of the open-hi-hat rendering defect, then a source fix proposed upstream. OSMD is BSD-3-Clause. Investigation: docs/OSMD-HOLLOW-NOTEHEAD-INVESTIGATION.md.
- Isolated upstream checkout: /Users/raphael/Playground/osmd-hollow-fix, base 0502732adb3d352705af18d353849130f46503b2, source commit b62a6ca on fix/normal-notehead-fill. App workaround/dependency unchanged.
- NORMAL dropped fill override; removed ineffective chord-wide late quarter-head mutation and routed mismatched fill through per-note N1/N2 glyphs. Added seven synthetic rendering regressions.
- Safari: new tests baseline 2 pass/5 fail, fixed 7 pass; focused 21 pass. Full suite fixed 418 pass/2 skipped/1 fail vs baseline 413 pass/2 skipped/6 fail. Same unrelated tablature geometric/raster test fails identically in both versions.
- TypeScript, ESLint and production build pass (three bundle warnings). Build originally lacked optional jsPDF demo dependencies; installed locally without package changes. Manual Karma start/run sequencing corrected before final suite comparison.
- Compiled SVG screenshot inspected: explicit hollow heads remain hollow with duration-specific stems/flags, controls stay filled. Evidence: docs/experiments/osmd-hollow-report/fixed.png.
- Local patch and exact PR body prepared: docs/osmd-normal-notehead-fill.patch and docs/OSMD-HOLLOW-NOTEHEAD-PR.md. No copyrighted song/audio included. Public fork/push/PR not yet performed; awaiting final-body approval required by user external communication instructions.

## 2026-09-20 — 첨부 드럼 표기 범례 지원 조사 (제출 보류)

- 사용자 요청에 따라 upstream PR 제출을 보류하고 TIFF/PNG 범례를 확인했다.
- MusicXML 공식 문서와 OSMD 소스 조사 후 합성 20사례를 Safari에서 원본 2.1.2 / develop+fill 패치로 실제 SVG 렌더링하고 스크린샷과 내부 glyph/위치 값을 비교했다.
- 기본 악기 위치, x/circle-x/triangle, 위쪽 원/플러스 정상. 첨부 open hi-hat은 circle-x로, 기존 PDF의 normal filled=no와 다름.
- 추가 누락 확인: parentheses=yes 고스트 괄호, other-technical R 텍스트. words/fingering의 R/L은 표시됨. 별도 수정은 수행하지 않았다.
- 조사 정본 docs/DRUM-NOTATION-SUPPORT-AUDIT.md, 재현 public/qa/drum-notation-audit.html, 실험 출력 docs/experiments/osmd-hollow-report/drum-*.json 및 drum-audit-*.png.
- 앱 소스/곡 데이터/기존 upstream 패치 변경 없음. 재생 음색 검증 없음. 이 조사는 STT/AFM 추론보다 표준 문서·소스·SVG 실행 증거가 직접적이어서 로컬 AI는 사용하지 않았다.

## 2026-09-20 — 온마디쉼표 원인 확정 및 sticking 정정

- 사용자 요청에 따라 인터넷 공식 표준/교육 자료와 로컬 OSMD 소스를 비교했다.
- 앱 보정 없는 OSMD 2.1.2에서 높이 미지정 온마디쉼표는 center=true, B4 지정은 center=false로 재현. sourceNote.Pitch 분기의 조기 break가 중앙 정렬을 건너뛴다. 실제 곡 1~4마디에 B4 rest display가 존재한다. 앱의 자르기 이전에 발생하는 OSMD 결함이며 앱의 중앙 이동 보정은 우회책이다.
- R/L의 명칭은 sticking. 앞선 fingering 명칭/한 음표에 R/L을 쌓은 시연의 한계를 정정했다. words로 네 음표에 R L R L을 각각 배치한 Safari SVG 확인.
- 재현 public/qa/rest-sticking-audit.html, 상세 docs/DRUM-NOTATION-SUPPORT-AUDIT.md에 추가. 화면 docs/experiments/osmd-hollow-report/rest-sticking.png. 앱/악보/기존 upstream 패치 변경 및 공개 제출 없음.

## 2026-09-20 — 온마디쉼표 높이 제거 적용

- 승인된 결정에 따라 bundled score.musicxml의 1,2,3,4,110마디 총 5개 온마디쉼표 display 높이를 제거하고 bundled SHA256을 갱신했다. 그 밖의 악기별 쉼표 위치/음표/박자/가사 유지.
- fixAllDrumRestPositions는 전체 쉼 마디의 measure=yes rest를 높이 미지정으로 유지한다. 다른 성부가 연주하는 마디는 기존 lane 규칙을 유지한다. 저장된 곡 및 canonicalXML에도 곡 열기 시 적용한다.
- src/musicxml.ts의 수동 중앙 이동은 explicit Pitch가 있는 경우만 적용. 높이 없는 온마디쉼표는 OSMD 기본 중앙 배치. 캐시 default-full-rest-v3으로 갱신.
- 테스트 초기 bundled hash 불일치 검출 후 새 자료 해시 반영. 전체 37 files / 129 tests 통과, build 통과. 높이 제거의 멱등성과 다른 성부 높이 보존 회귀 검사 추가.
- Safari에서 실제 곡 열기와 저장 결과 확인: 5개 높이 비어 있음, 최신 SVG 캐시, 수동 중앙 이동 0개. 실제 PDF/MusicXML 비교 1~4마디 화면 확인. docs/experiments/osmd-hollow-report/rest-default-app-start.png.
- 로컬 앱 반영. 기존 export HTML 재생성 및 upstream 제출 없음.

## 2026-09-20 — MusicXML · OSMD 매핑 정책 정본 작성

- 사용자 승인 원칙: OSMD가 지원하는 의미상 적절한 표기를 먼저 선택하고 해당 유효 MusicXML로 저장. 의미를 보존하는 표시 방법이 없는 경우만 보고.
- docs/SCORE-MUSICXML-OSMD-MAPPING.md 신설: 악기별 좌표/머리/주법, 쉼표 예외, words 스티킹, 독립 가사 성부, 버전별 검증 근거와 갱신 절차 정리. 현재 미지원은 고스트 괄호.
- AGENTS.md에 정본 연결, 이전 조사 문서에 현재 정책 링크 추가. 원본 외형과 악기 의미, 전용 기능과 표시 가능 여부를 구분.
- 검증: 기존 조사 문서와 매핑 대조, 문서 로컬 링크 존재 및 git diff --check 확인. 문서만 변경하므로 앱 테스트/GUI 재실행 없음. 기존 곡의 circle-x 변환 및 렌더러 변경은 이번에 수행하지 않음.

## 2026-09-20 — 악기 전용 매핑과 일반 도형 지원 구분 정정

- 사용자 결정에 따라 매핑 정본·AGENTS·과거 조사 상단 안내를 정정했다. OSMD 전용 매핑/공식 표기 규칙 확인 → MusicXML 저장 → 렌더링 검증 순서로 변경.
- 라이드 벨 triangle 채택 철회. 기존 표의 “지원”을 일반 표시 성공/전용 규칙 미확인으로 구분. circle-x와 words도 표시 성공만으로 공식 악기/주법 규칙으로 확정하지 않는다.
- 고스트 괄호의 실제 렌더링 미지원과 악기 전용 규칙 미확인을 분리한다. 규칙 미확인은 부재 확정이 아니다.
- 문서 대조 및 git diff --check 통과. 문서만 변경했으며 앱/악보 데이터/기존 실험 결과는 보존. 앱 테스트 재실행 없음.

## 2026-09-20 — 전용 표기만 사용 원칙 재확인

- 재독 결과 circle-x/words를 후보로 부르는 표현과 일반 텍스트 배치 지시가 남아 있어 정정했다.
- 매핑 정본 상단에 전용 규칙만 사용, 일반 도형/일반 텍스트 대체 매핑은 후보·fallback으로도 사용 금지를 명시했다. 기존 시험표는 적용 목록이 아닌 이력으로 표시했다.
- AGENTS에도 같은 원칙 반영. 기본 악보 요소인 쉼표·가사·메타데이터와 악기 기호 대체를 구분했다.
- 문서 대조 및 git diff --check 통과. 앱/기존 XML 미변경.

## 2026-09-20 — 사용자 결정에 따른 대체 매핑 예외 허용

- 일반 도형/텍스트 대체 매핑은 구체적인 대상·방식·한계를 보고한 뒤 사용자가 해당 방식을 명시적으로 선택한 경우에만 적용하도록 정책을 변경했다.
- 매핑 정본 및 AGENTS의 금지/후보 표현을 일관되게 수정. 결정과 적용 범위 및 검증 결과 기록 의무 명시. 이번 정책 수정은 개별 대체 매핑 승인으로 취급하지 않음.
- 문서 diff와 git diff --check 확인. 앱/악보 데이터 변경 없음.

## 2026-09-20 — 확정 매핑 문서를 실행 기준으로 고정

- 사용자 지시에 따라 모든 매핑은 확정 문서 기반으로 실행하도록 정본/AGENTS를 수정했다.
- 일반 도형 대체 매핑은 보고 및 명시적 사용자 결정 후에만 매핑 문서 규칙 변경 가능. 문서 갱신이 구현/데이터 적용보다 선행하도록 순서를 명시했다.
- 미승인 제안·실험은 별도 조사 문서에 두고 실행 규칙으로 승격하지 않는다. 이번 수정은 절차 확정이며 개별 매핑 승인이 아니다.
- 문서 일관성 및 git diff --check 확인. 앱/악보 데이터 변경 없음.

## 2026-09-20 — Drum Key 확장 항목 조사

- OSMD 소스/공식 API/MusicXML 대조 결과를 docs/DRUM-KEY-EXTENSION-RESEARCH.md에 기록. 버즈 롤의 전용 XML 파싱/그리기/드럼 예제 확인. Doubles는 일반 tremolo와 더블 스트로크 의미를 구분. 나머지 추가 항목은 악기 전용 모양/위치 규칙 미확인.
- 매핑 정본·앱·악보 데이터 변경 없음. 이번 검증은 소스와 표준 조사이며 새 GUI/재생 실험은 하지 않음. 문서 diff 검사 완료.

## 2026-09-20 — MusicXML 공식 표준 재조사

- 공식 4.0 문서/sounds.xml/XSD로 Drum Key 추가 항목 재조사. docs/MUSICXML-DRUM-KEY-STANDARD-RESEARCH.md에 악기 식별·모양/위치·주법 의미를 분리 기록.
- 표준 식별자가 있어도 악기별 고정 머리/높이를 강제하지 않음. 버즈 롤/괄호는 표준 표현. 픽토그램·하프 damp를 드럼 음표/초크와 혼동하지 않도록 명시.
- 조사 문서만 추가. 확정 매핑·앱·곡 데이터 변경 없음. 공식 소스 대조 및 git diff --check 확인.

## 2026-09-20 — 두 Drum Key Safari 시각 비교

- public/qa/drum-key-comparison.html 추가. 이전 상세 범례와 최신 Drum Key를 동일 오선 간격/음표 크기의 SVG로 나란히 비교. 하이햇 상태와 동작 지시는 별도 행으로 구분.
- 첨부 범례 재도식이며 OSMD 출력/확정 매핑이 아님을 화면에 명시. 앱/곡/매핑 정본 변경 없음.
- Safari에서 페이지 표시와 전체 스크린샷 직접 확인. 초기 고음 좌표 반칸 간격 수정 후 재확인. 증거 docs/experiments/drum-key-comparison.png. git diff --check 확인.

## 2026-09-20 — 범례 충돌에 대한 사용자 선택 확정

- 하이햇 제5칸, 라이드 제5선 ×, 벨 제5선 ▲, 크래시 위 첫째 덧줄 ×로 확정. 상태/동작 하이햇 구분 유지.
- Tom 4=플로어 탐, 싱글 킥=Right Bass/더블 킥에 Left Bass 추가. 한쪽만 있는 항목은 해당 범례를 따르는 사용자 결정을 정본에 기록.
- 문서 갱신 후 비교 페이지에 확정 기준 추가. 원본 두 열은 비교용으로 보존. 기존 곡 변환 및 OSMD 미지원 주법 구현은 수행하지 않음.
- 검증: Safari에서 확정 기준/원본 비교 구분과 Tom 4 별칭 표시 확인. git diff --check 통과.

## 2026-09-20 — 확정 범례 24개 Safari 렌더링 검증

- OSMD 2.1.2 원본으로 MusicXML 24개 사례 렌더링. 추가 악기/탐/킥/하이햇 상태 및 동작/롤/RL 검사.
- 실제 스크린샷과 노트 속성 확인. Ghost 괄호와 other-technical R 누락 재현; words R/L 및 나머지 기호 표시 확인. 초크 점은 placement=above 필요. 의미/음향 검증과 구분.
- 결과 docs/DRUM-KEY-RENDER-RESULTS.md, 재현 public/qa/drum-key-final-audit.html. 증거 docs/experiments/drum-key-final-audit.{png,json}. 실제 곡/매핑 정본 변경 없음.

## 2026-09-20 — 검수 화면 고스트/스티킹 교정

- 사용자 지시에 따라 정본에 words 단일 경로, 음표 줄기 위 한 글자, 머리 양옆 괄호 규칙 기록 후 검수 페이지 수정.
- 진단 라벨과 other-technical 사례 제거. parentheses=yes 대상 머리 bbox에 괄호 경로 보완. words 출력은 stem bbox 위로 정렬하고 이 예제의 동일 글자 중복 SVG 제거.
- Safari 재검증: 괄호 2개, R/L 각각 1개, 스크린샷 확인. 증거 docs/experiments/drum-key-ghost-sticking-fixed.png. 이번 구현은 검수 예제에 한정하며 메인 앱/실제 곡 및 upstream OSMD는 변경하지 않음.

## 2026-09-20 — 고스트/스티킹 사용자 최종 승인

- 사용자가 Safari 수정 화면 확인 후 “그래 이제 되었다 확정”으로 승인.
- 확정 매핑 정본에 승인 화면/구현 커밋/표기 및 words 단일 저장 결정을 기록했다.
- 이번 턴은 승인 기록만 변경. 메인 앱/곡 적용 상태와 구분. git diff --check 확인.

## 2026-09-20 — 확정 범례 메인 앱 적용

- src/drum-notation.ts: 고스트 parentheses=yes 음표머리 양옆 괄호, words R/L을 시간/성부로 대상 음표에 연결하여 줄기 위 한 글자 배치. XML 복제본에 임시 식별색을 주고 정확한 glyph를 찾은 뒤 원래 색 복원. 저장 정본/가사는 보존.
- src/musicxml.ts 렌더링에 연결. 예제 곡 정상화는 ID+악기명 일치 시에만 하이햇/라이드/크래시 적용. 기존 source/canonicalXML 및 캐시 갱신 경로에 연결.
- 회귀검사: 성부/backup 타이밍과 가사 보존, 알 수 없는 악기 보존, 정규화 멱등성. 전체 38 files / 131 tests 통과. 최종 문서 복제 수정 후 build 재통과.
- Safari 실제 renderMusicXML 결과에서 고스트 괄호 2개, R/L 각각 1개 출력 및 스크린샷 확인. docs/experiments/production-drum-notation.png.
- 메인 앱 곡 열기 후 저장 데이터 확인: 오픈 하이햇 268개 모두 circle-x, approved-drum-notation-v4 캐시 확인.
- standalone HTML 재내보내기/원격 push/upstream 제출 없음. 단위 범례와 앱 저장 갱신 검증이며 모든 합주 성부 충돌 조합/음향 주법 합성을 검증한 것은 아님.

## 2026-09-20 SVG 비교 상단 잘림 수정
- 원인: 표기 변경으로 SVG의 시스템 세로 위치가 이동했지만 캐시 갱신은 이전 마디 crop 영역을 유지했다. 실제 9마디 y는 0.297854에서 0.284356으로 변경됨.
- SVG 재생성 시 pages와 regions를 함께 적용하고 마디 ID 구성을 검증한다. 원본 MusicXML, 가사, 음원 시간은 유지한다. 캐시 v5로 기존 저장 악보도 재생성한다.
- Safari 실제 ScoreReview에서 22.094초, 9–12마디 상단 연결선 출력 확인: docs/experiments/svg-crop-fixed.png.
- 38개 파일 131개 테스트 통과, production build 통과. HTML 별도 내보내기 없음.
