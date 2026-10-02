# SVG 화면 캡처 QA — 2026-09-21

## Safari 연결

기존 노출된 Safari MCP 호출은 `Transport closed`로 실패했다. 설정의 `/usr/bin/safaridriver --mcp` 명령은 유효했고, 새 stdio 연결에서는 초기화·도구 목록·탭 생성·JavaScript 실행·스크린샷 저장이 성공했다. Safari 27.0 (22625.1.29.11.27), MCP 서버 Safari 1.0.0.

복구한 것은 새 Safari MCP 세션이다. 기존 Codex 도구 바인딩이 다시 연결된 것은 아니다. 처음 연결이 끊긴 원인은 현재 증거로 특정하지 못했다. 기존 Safari와 다른 작업의 드라이버 프로세스를 종료하지 않았다.

## 캡처에서 발견하고 수정한 문제

| 문제 | 수정 및 검수 |
|---|---|
| 한 줄 보기 4→5마디의 오선 크기와 높이가 달라짐 | crop 높이 대신 오선 간격으로 배율 계산. 수정 후 오선이 이어지는 캡처 확인 |
| 전체 SVG 81마디 Interlude와 빔 겹침 | 구간 표시를 제5선 위 70 SVG 단위로 이동. 최종 캡처에서 분리 확인 |
| 두 줄 정지 화면 아래 다음 줄 마디 번호가 비침 | 하단 여백 마스킹. 최종 1–8마디 캡처에서 다음 줄 번호가 보이지 않음 |
| 전체 SVG 고정 헤더 위로 악보 조각이 비침 | 헤더 상단 덮개 적용. 최종 3쪽 캡처 확인 |

캡처는 실제 Safari 데스크톱 1024×664 CSS px, 출력 2048×1328이다. 사용자가 열어 두었던 iPad mini 응답형 디자인 세션의 검증으로 대체해서 주장하지 않는다.

## 증거

- [오선 정렬 수정 전](experiments/qa-m3-before.png)
- [오선 정렬 수정 후](experiments/qa-ribbon-fixed.png): 공통 상단 여백을 추가하기 전 배율 수정 검수
- [전체 SVG 3쪽 수정 전](experiments/qa-full-p3.png)
- [전체 SVG 3쪽 수정 후](experiments/qa-full-p3-fixed.png)
- [두 줄 보기 최종](experiments/qa-rows-final.png)
- [PDF와 SVG 행 구성 대조](experiments/pdf-rows-verified.json): 3쪽, 28줄, 110마디
- [테스트 로그](experiments/qa-final-tests.log): 55개 파일, 228개 테스트 통과
- [빌드 로그](experiments/qa-final-build.log): 성공, 번들 크기 경고 유지

## 검증 한계

전체 SVG 각 페이지의 대표 구간과 앱 한 줄·두 줄 보기를 캡처 검수했다. 모든 110마디의 각 음표, 재생 중 전 구간, iPad mini 터치 동작까지 전수 검수한 것은 아니다. XML system-distance를 OSMD가 그대로 반영하지 못하는 기존 한계도 남아 있다. 위 수정으로 모든 악보 문제를 해결했다고 판정하지 않는다.

SVG 출력 규칙은 [SVG-SCORE-RULES.md](SVG-SCORE-RULES.md)에 반영했다. 이번 작업에서 커밋·버전 변경·배포·HTML 내보내기는 하지 않았다.

## 후속 요청 — 제목 여백·84마디·페이지 하단

- 제목 아래: 첫 마디 XML top-system-distance=180, 렌더 배치 연결. [실제 캡처](experiments/title-gap-final.png).
- 84마디: 오른쪽 light-light를 XML에 기록. 5/4 뒤 겹세로줄과 다음 4/4 표시를 [캡처](experiments/bar84-double-final.png)에서 확인.
- 하단: 마지막 기호 아래 30 SVG 단위를 남김. [1→2쪽 경계 캡처](experiments/page-bottom-final.png).
- 실제 출력 크기: 1500×1623, 1500×1682, 1500×1541. 3쪽과 모든 줄 시작 마디는 기존 PDF 대응 목록과 동일.
- 전체 테스트는 동시 실행에서 bundled-score 테스트의 5초 시간 초과가 두 번 발생했다. 단독 진단 실행은 3.32초에 통과했다. 제한 시간을 바꾸지 않은 순차 전체 실행(`npx vitest run --maxWorkers=1`)에서 55개 파일/228개 테스트 모두 통과했다. [최종 테스트](experiments/title-layout-tests-final.log), [빌드](experiments/title-layout-build.log).
