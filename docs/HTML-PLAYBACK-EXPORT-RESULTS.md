# HTML 재생 전용 내보내기 — 제품 검수 현황

2026-09-21, main/8d09129 기반 미커밋 구현. **완료 아님. 엄격한 전체 행 기준 이전 개별 형식 기준20/100(합본 전체 기준 재평가 전).** 부분 성공을 행 전체 통과로 올리지 않는다.

| 기준 | 점수 | 확인 결과 / 남은 검수 |
|---|---:|---|
| R01 | 10 | 허용 목록 테스트 및 합본 번들 감사 통과. 관리·저장소·원본 렌더러 제외; SVG/PDF 전환 코드는 최신 승인에 따라 포함 |
| R02 | 10 | 두 형식 실제 Safari file 실행에서 첫정지·즉시정지·탭선택·화면유지·이중탭재생·선택마디 상단배치 통과 |
| R03 | 0 | 세로스크롤과 퍼센트 확인. iPad mini 시뮬레이터 네이티브 터치:한 줄 좌우,두 줄 좌우/상하 검수 진행 및 capture 결함 수정. 실기기 Edge는 별도 |
| R04 | 0 | Worker BPM, 양축 숫자드래그, 카운트오프 on/off 및 음량값 확인. 2×2 조합 전체와 피치/스틱 소리 검수 남음 |
| R05 | 0 | 반경1–4, 시작/끝 경계, 3슬롯 교체·정렬 확인. 실제 반복 경계와 슬롯 이동 전체 재검수 남음 |
| R06 | 0 | SVG 강조 on/off, PDF 전용코드 없음 확인. 최종 후보의 두 형식×두 스타일,84→85,가사없음 화면 전체 검수 남음 |
| R07 | 0 | iPad Safari HTTP 가로/세로/전체화면 모달 확인. 선택 실행환경 Edge의 실제 파일·포커스/키보드 검수 남음 |
| R08 | 0 | Mac Safari file 실행·외부 요청 없음 확인. 사용자 실기기 Edge 실행 피드백 있음. 자동 실기기 터치 제어는 불가하여 직접 검수 증거 없음 |
| R09 | 0 | payload/버전/좌표/음원없음/문자열 경계 단위테스트 통과. 실제 오류 UI·취소·중복실행 시나리오 전체 검수 남음 |
| R10 | 0 | 전체233테스트·빌드·용량·5회 시작시간 통과. 별도 보관함의 실제 편집→백업→복원 왕복 검수 남음 |

## 산출물과 성능

- 최종 템플릿 PDF184,928 bytes, SVG132,012 bytes. 포함 모듈 PDF17개, SVG21개.
- 동일 자산 기준 전체HTML: PDF12,255,440→10,342,629bytes, SVG29,875,770→10,801,871bytes(측정 당시 산출물). 음원/페이지 바이트 일치.
- 시작시간 중앙값: PDF508→541ms, SVG785→748ms. 기존 대비 허용 기준 이내. 계측 실패한 첫 측정은 사용하지 않음.
- 전체 테스트56파일/233개 PASS, 빌드 PASS. 웹앱 대형청크 경고는 존재.

## 재현과 증거

`npm test`, `npm run build`, `node scripts/check-playback-build.mjs`.

로컬 증거: `docs/experiments/html-playback/`의 `runtime-visible.json`, `startup-visible.json`, `size-evidence.json`, `app-export.json`, `tests-final.log`, `build-final.log`, `safari-final.png`, `ipad-fullscreen.png`, `ipad-portrait-settled.png`.

실험 이력은 `HTML-PLAYBACK-EXPORT-HISTORY.md`, 승인·변경 계획은 `HTML-PLAYBACK-EXPORT-PLAN.md`가 정본이다. Edge 실기기 준비를 기다리는 동안에도 나머지 미검수 항목은 남은 작업이며 완료로 취급하지 않는다.

## 2026-09-21 합본 터치 수정 후 추가 증거

- 네이티브 입력 검수 상세: [QA-IPAD-HTML-TOUCH-2026-09-21.md](QA-IPAD-HTML-TOUCH-2026-09-21.md). 시뮬레이터 Safari HTTP 결과이며 실기기 Edge 오프라인 결과가 아니다.
- 56파일236테스트, TypeScript/Vite/합본 빌드 및 미사용 관리 코드 미포함 감사 통과. 로그 touch-tests-final.log/touch-build-final.log.
- 합본 템플릿207,544bytes. 기존 개별형식 측정은 과거기준선으로 유지한다. 전체payload gzip 미적용 결정은 HISTORY의동일합본비교3.97% 결과를 따른다.
- 전체 제품 QA 항목의 미실행 하위 시나리오는 그대로 남는다. 이번 터치 검수로 전체100점을 선언하지 않는다.
