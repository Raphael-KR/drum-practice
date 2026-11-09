# 화면 준비 경로 개선과 전후 비교

- 목표: 실제 저장 악보의 화면 준비 비용을 분석하고 출력·기능·저장 호환성을 유지하면서 불필요한 반복 처리를 줄인다.
- 범위: 두 앱 공통 playback 자산/글꼴 준비, 기존 실제 자료를 이용한 프로파일과 수정 전후 production player 로딩 비교.
- 완료 조건: 같은 악보·환경·캐시 조건의 전후 측정, 표시 자산과 설정/원본 보존, 관련 회귀·정적 검사·두 앱 빌드 결과를 확보한다.
- 제외: 기존 미커밋 변경 삭제, 저장 스키마/정본/악보 패키지 변경, 보안 검사 완화, 새 시험 DB·무허가 합성 자료, 커밋·푸시·발행·iOS 실기기/시뮬레이터.
- 검증: 실제 Loveholic와 기존 수록/제작 자산, 브라우저 프로파일 및 같은 조건 3회 로딩 비교를 사용한다. 계측용 제한·자료와 실제 제품 동작을 구분한다.

## 시작 상태

main `1fe915bcd40e560e100eb62d49e5bb1341609eef`, 두 앱 0.10.2, source `843cb6507da6`다. 앞선 jsdom/TypeScript 업데이트와 Node·OSMD 경고 수정 등 19개 미커밋 파일을 보존한다. [직전 로딩 관측](runtime-loading-cost-20261109.md)은 조사 출발점이며 이번 전후 비교의 새 baseline으로 대신하지 않는다.

## 실행 기록

수정 전 계측·원인·구현·검증·수정 후 비교를 순서대로 기록한다. 실행 원자료는 `.tmp/screen-preparation-20261109/`에 둔다.

### 원인과 구현

실제 Loveholic 캐시를 연 production player의 CPU 프로파일에서 SVG 파싱 30회·68,587,304문자·781.2ms를 확인했다. 계측된 screen 1,462.9ms 중 약 53%다. CSS 문자열 재생성보다 native XML 파서가 큰 텍스트를 읽는 비용이 지배적이었다. 이 값은 계측 overhead가 있으므로 전후 로딩 수치로 사용하지 않는다.

공통 `playback-svg.ts`는 16KiB 이상인 내장 글꼴 style·timeline metadata의 단순 문자 데이터만 임시 표식으로 교체해 마크업을 파싱한다. 표준 엔티티를 정확히 복원한 뒤 모든 소비자에게 같은 Document를 넘긴다. 알 수 없는/숫자 엔티티·잘못된 XML 문자·CR·주석/CDATA/선언·표식 충돌은 원래 native 파서에 맡긴다. 마크업/속성/실행 코드/외부 URL 검사와 실제 글꼴 바이트·라이선스 전체 일치 검사는 변경하지 않았다. 검증 전에 원문을 돌려놓으므로 글꼴 표식만으로 CSS를 허용하지 않는다.

사용자는 이번 작업에 한해 실제 SVG의 메모리 오류 주입 검사를 승인했다. 신규 DB·사용자 원본 변경은 포함하지 않는다. 실제 붉은 노을 제작 SVG의 native 직렬화 SHA 일치와 1회 파싱, 엔티티/제어 문자/CDATA 등의 native 의미 보존, 실제 Pretendard 바이트 변경·외부 URL·중복 CSS 선언 차단을 검사한다. 저장 스키마·원본/정본·조판 정책·완성 SVG 형식은 유지한다.

### 같은 조건의 수정 전후 로딩

macOS Darwin 27.2/Apple M4 Pro·12 logical CPU·24GiB, Ego Chrome 156, 697×975 viewport에서 같은 origin `127.0.0.1:5173`의 production player를 사용했다. Safari MCP가 지원하지 않는 CDP CPU 제한·CPU 프로파일에 Ego를 사용했다. Safari/iOS 실기기 결과로 간주하지 않는다.

실제 저장 Loveholic·123마디·동일 render cache hit와 보통 HTTP 캐시를 유지했다. 각 소스의 모듈·글꼴을 먼저 준비하고, 같은 페이지에서 목록 → 실제 열기 버튼 → 준비 완료 → 목록 복귀를 조건별 3회씩 실행했다. 캐시·DB를 삭제하지 않았다. 비교 수치에는 프로파일러·DOM API 계측을 끼우지 않았다. 표는 3회 중앙값이다.

| 조건·지표 | 수정 전 `843cb6507da6` | 수정 후 `bafd7bde5196` | 감소 |
| --- | ---: | ---: | ---: |
| 로컬 CPU, 화면 준비 | 1,336.6ms | 1,010.2ms | 24.4% |
| 로컬 CPU, 전체 열기 | 1,895.0ms | 1,657.7ms | 12.5% |
| CPU 4배 제한, 화면 준비 | 5,500.0ms | 4,013.4ms | 27.0% |
| CPU 4배 제한, 전체 열기 | 7,538.6ms | 5,997.0ms | 20.4% |

화면 준비의 범위는 자산 파싱·강조/연습 복제본·검증·화면 생성이며, 전체 열기는 기존 opening/read/conversion/rendering/screen/audio를 포함한다. 소스 악보를 처음 조판하는 시간, 차가운 HTTP 캐시 다운로드, 공개 사이트·iPhone 성능은 측정하지 않았다. opening 단계의 기존 약 1초 대기와 conversion 변동이 전체 값에 섞이므로 화면 준비의 개선율과 구분한다. 원시 표본은 `baseline-times.json`, `candidate-times.json`, 집계는 `comparison.json`이다.

별도 프로파일에서는 파싱 30회를 유지하면서 native XML 입력이 68,587,304 → 7,495,613문자(89.1% 감소), 파싱 시간이 781.2 → 115.8ms로 줄었다. 대신 분리한 본문을 DOM에 복원하는 비용이 있으며, 이를 포함한 최종 효과는 위의 독립된 로딩 비교를 따른다. 폰트 파일·완성 SVG·JS 렌더러를 제거한 작업이 아니며 큰 chunk 경고의 기준도 그대로다. 실행·진입 JS 파일은 새 helper로 약 0.9kB 늘었고 번들 용량 감소를 성과로 주장하지 않는다. RSS/장기 재생 메모리 감소는 이번에 측정하지 않았다.

### 출력·기능·저장 보존

- 실제 Loveholic의 표시 자산 30개·합계 37,121,546바이트가 수정 전후 모두 같은 크기·MIME·SHA-256이었다. 인쇄·한 줄·두 줄·균등 보기 자산의 직렬화 결과를 바꾸지 않았다. 비교 원자료는 `baseline-prepared.json`, `candidate-prepared.json`이다.
- 실제 붉은 노을 제작 패키지의 timeline 포함 SVG를 native XML 파서와 비교해 직렬화 해시·JSON 본문 일치, 1회 파싱과 기존 변박/오선 비율을 확인했다. 현재 글꼴 CSS·라이선스·바이트 전체 검사를 유지하며, 변조 바이트·외부 URL·중복 CSS 선언·이벤트 속성·CSS import를 차단했다. 서로 다른 요소에 중복된 정상 내장 CSS를 두는 기존 허용 동작도 보존했다.
- actual player가 생성한 AudioContext 1개에서 `running`, 마디 1 → 2 진행·일시정지와 1줄/2줄 전환을 관측했다. GUI 검사 첫 시도는 대기 시간 안에 기대한 정지 상태를 얻지 못했고, 포인터 재시도 직후에도 재생 상태가 유지됐다. 네이티브 키보드 Space로 재생/정지를 확인했다. 포인터 결과의 원인은 미확인이며 모든 포인터 버튼이 통과했다고 기록하지 않는다. 앱 오류 메시지는 없었다. `functional.json`에 확인 행동과 상태를 저장했다. 사람의 청취·전곡 연속 재생을 대신하지 않는다.
- 원래 ribbon 보기·position 0으로 돌아간 뒤 닫기/flush를 완료했다. 실제 저장 Song 전체, canonicalXML SHA, 음원·원본 점수 파일·페이지 5개의 타입/크기/SHA, 앱 선호 원문과 기존 DB 이름·버전이 시작 상태와 일치했다. AudioContext는 닫혔다. 신규 시험 DB·저장 스키마 변경·패키지 재작성은 없었다. 원자료 `browser-before.json`, `browser-after.json`, `preservation.json`을 따른다.
- 앱 표시 버전 0.10.2, 저장 DB v4·bytes-v1·구형 Blob 호환 경로·render cache 정책을 유지했다. 앞선 19개 미커밋 파일의 바이트를 확인했으며 기록 목록/history에는 이번 문단만 추가한다.

### 검사와 작업 종료

- `pnpm exec vitest run tests/local-media/playback-svg.test.ts tests/integration/playback-runtime.test.ts tests/local-media/score-recording-grid.test.ts tests/integration/common-components.test.ts tests/integration/note-highlight.test.ts`: 5파일·30검사 통과. 실제 SVG 비교/메모리 오류 주입, 공통 자산 수명·실패 정리·강조·변박 경로를 포함한다.
- `pnpm exec vitest run tests/local-media/record-serialization.test.ts tests/local-media/score-package.test.ts tests/local-media/score-package-release.test.ts tests/integration/practice-staff-layout.test.ts`: 4파일·29검사 통과. 기존 저장/패키지 왕복·수록 자료·오선 배치를 확인했다. 두 실행 모두 실제 DB를 생성하거나 SQLite를 사용하지 않는다.
- `pnpm run check`: ESLint·447파일 서식·app/tools/hosting 타입·의존성/공통 구조·187소스 경계·157문서 파일 링크 검사 통과. `pnpm run build`: PC editor/공개용 player 분리 빌드와 앱 경계 검사 통과. Node 저장소·OSMD 중복 import 경고는 없고 기존 500kB chunk 경고만 남는다. 로그는 `focused-tests.log`, `compat-tests.log`, `check-final.log`, `build.log`다.
- 전체 회귀·Safari 화면·iOS 실기기/시뮬레이터·원격 CI·공개 배포는 이번 집중 검증 범위에 포함하지 않았다. 유보된 iPhone 재로드 진단을 재개하지 않았다.
- 계측용 TaskSpace 2를 한 번 종료했고 제한 설정을 해제했다. 작업용 5173 preview 프로세스도 중단했다. `baseline-player/`는 비교용 기존 production 파일의 hard link 사본이며 소스·운영 배포를 되돌리지 않았다.
- 커밋·푸시·버전 인상·PR/merge·발행은 수행하지 않았다.
