# 시각 QA 수정·재검수 기준

- 목표: QA-VISUAL-SAFARI-2026-09-20.md의 V01–V12를 모두 해소한다.
- 범위: 앱의 레이아웃·폼·가사 읽기 표시와 관련 테스트, 같은 Safari 1180×820 화면.
- 완료: 12항목 각각 구현 근거·DOM 실측·육안 증거를 기록하고 기능 회귀 테스트와 빌드 통과.
- 제외: 악보·가사 정본 내용/위치 변경, 배포, 실제 iPad 전 방향·모든 파일 조합의 무결점 보증.
- 검증: 1차 수정 → Safari 캡처/크기/스크롤 재검수 → 실패 항목 재수정 → 동일 기준 재검사. 테스트 자료 편집은 별도 QA 곡에서 수행하고 사용자 곡은 보존한다.

| ID | 통과 기준 |
|---|---|
| V01 | 원본 보기 ≤60px 도구줄, 미리보기/마디 편집 병렬 배치 |
| V02 | 편집 select 높이 ≥44px, 가사 위치 두 입력과 다른 열이 겹치지 않음 |
| V03 | 긴 본문 하단에서도 닫기/설정 탐색이 화면 안에 있음 |
| V04 | 목록/요약 자료 유형별 같은 색상 사용 |
| V05 | 요약과 액션이 세로 배치, 액션이 본문 폭 사용 |
| V06 | 소형440/일반640/편집 확장 폭, 공통 우상단 닫기, 확인창은 계속 편집 기본 초점 |
| V07 | 메타데이터 2열, 타이밍 별도 그룹 |
| V08 | 음절 사이 불필요한 공백과 영어 분할 제거, 명시된 줄바꿈 보존, 원문/시간 변경 없음 |
| V09 | 라벨과 입력 묶음, 파트 미선택 안내, 제출 우측 정렬 |
| V10 | 시작/끝 입력 x좌표 일치, 중복 설명 제거, 하단 액션 분리 |
| V11 | 화면에 원곡 복귀 버튼 한 개 |
| V12 | 악보 크기 유지, 남는 세로 공간은 악보 주위로 배분, 컨트롤 하단 정렬 |

## 최종 판정 — 2026-09-20

**V01–V12: 12/12 PASS.** 판정 범위는 기존 보고서의 12개 시각 결함과 같은 Safari 1180×820 CSS px / DPR 2이다. 원본 보고서는 최초 발견 기록으로 유지한다. 실기 iPad·모든 방향·모든 곡의 무결점 판정은 아니다.

### 반복 과정

1. 1차: 편집 그리드, 본문 스크롤, 자료 색상, 폼/보조 창, 반복 설정, BPM 중복, 한 줄 여백을 수정했다.
2. 재검수: Safari 네이티브 select는 min-height만으로 높이가 바뀌지 않아 23px로 남았다. `appearance:none`과 명시적 높이/화살표를 적용하고 48px로 재측정했다. [1차 실패](experiments/fix1-lyrics.png) → [재수정](experiments/final-lyrics-bottom.png).
3. 가사 공백을 제거한 첫 출력은 한 문단으로 길었다. 정본 MusicXML의 실제 rehearsal 경계로 문단을 나눴다. Intro/Interlude/Ending/Outro는 가사 구절 경계로 사용하지 않는다. 원문, 음절 순서, 위치는 수정하지 않는다. 명시적 가사 문서/줄바꿈이 있으면 그것을 우선한다. [최종](experiments/final-full-lyrics.png).
4. 전체 테스트에서 BPM 프리셋 6개를 기대하던 기존 검사가 실패했다. 원곡 중복 제거 요구에 맞춰 5개와 독립 원곡 복귀 버튼을 검사하도록 변경했다. 앞 테스트 중단으로 남은 모달에 따른 후속 키보드 테스트 실패도 함께 해소됐다. 재실행 51파일/210테스트 통과.
5. 같은 Safari에서 변경 창의 상단/하단, 파일→하위창→파일→설정 복귀, PDF/SVG 한 줄·두 줄·비교를 다시 확인했다. 실패 항목이 없어 종료했다.

### 항목별 증거

| ID | 판정 | 실측·검수 결과 | 캡처 |
|---|---|---|---|
| V01 | PASS | 원본 보기 48px. 미리보기/편집 패널 x=41/598, y=275 공통, 폭 각각541px. 도구줄이 별도 전체 행을 사용한다. | [악보 편집](experiments/final-editor-score.png) |
| V02 | PASS | 악보 select 3개 모두48px. 가사 위치 select 각각110×48px. 본문 가로 넘침 없음. | [가사 편집 하단](experiments/final-lyrics-bottom.png) |
| V03 | PASS | 편집 하단 닫기 top=35px. 라이선스 본문 scrollTop=13345에서도 닫기 top=119px, 탐색 top=179px 유지. | [편집](experiments/final-lyrics-bottom.png), [라이선스](experiments/final-license-bottom.png) |
| V04 | PASS | 목록/요약 MusicXML RGB(228,238,255), PDF(255,232,231), 가사(224,243,232) 일치. 음원도 공통 보라색 토큰 사용. | [목록](experiments/final-library.png), [요약](experiments/final-settings-score.png) |
| V05 | PASS | 곡 요약 아래 편집/파일 두 행이 전체 본문 폭을 사용. 설명과 칩 겹침 없음. | [악보 설정](experiments/final-settings-score.png) |
| V06 | PASS | 소리440px, 파일·가져오기640px, 편집확장. 이력은 우상단 아이콘 닫기. 확인창은 계속 편집에 기본 초점. | [소리](experiments/final-sound.png), [이력](experiments/fix2-versions.png), [확인](experiments/fix2-exit.png) |
| V07 | PASS | 곡 정보 2열, 메타데이터 적용 아래 음원/악보 연결 별도 그룹. 숫자와 텍스트 필드 겹침 없음. | [곡 정보](experiments/final-meta.png) |
| V08 | PASS | CJK 음절 간 공백 제거, `a- gain`→`again`, 실제 구간별 문단. 명시적 줄바꿈·원문 유지 및 정본 무변경을 테스트. | [전체 가사](experiments/final-full-lyrics.png) |
| V09 | PASS | 라벨/입력 수직 묶음, 박자와 분모 분리, 미선택 파트는 안내문+disabled+48px, 제출 우측. | [새 곡](experiments/final-new.png), [가사](experiments/final-upload.png), [악보](experiments/final-score-upload.png), [보컬](experiments/final-vocal.png) |
| V10 | PASS | 시작/끝 마디 입력 x=389px 일치. 정밀 안내는 하나, 이름/주 실행/보조 실행 별도 행. | [기본](experiments/final-loop.png), [정밀](experiments/final-loop-precise.png) |
| V11 | PASS | ‘원곡’ 버튼 DOM 1개. 연습 프리셋 5개. | [BPM](experiments/final-tempo.png) |
| V12 | PASS | zoom=.95 유지. PDF 한 줄 stage 높이226.42px, 위/아래 margin 각각155.48px, 연주 컨트롤 y=636.39px. SVG에도 동일 원칙 적용. | [PDF 한 줄](experiments/final-pdf-ribbon.png), [SVG 한 줄](experiments/final-svg-ribbon.png) |

### 회귀 검증과 한계

- `npm test -- --maxWorkers=2`: 51개 파일, 210개 테스트 통과. 마지막 가사 경계 조정 후 관련 2파일/7테스트도 통과했다.
- `npm run build`: HTML 템플릿 생성, TypeScript 검사, Vite 최종 빌드 성공. [빌드 로그](experiments/visual-qa-build.log). 기존 IIFE의 import.meta 및 번들 크기 경고는 남으며 실행 실패는 아니다.
- 기존 보기 회귀: [SVG 두 줄](experiments/final-svg-rows.png), [PDF 두 줄](experiments/final-pdf-rows.png), [PDF/SVG 비교](experiments/final-compare.png). 해당 61–68마디 화면에서 악보 잘림/컨트롤 겹침 없음. 음표 전수 정확성 검수와는 별개다.
- [초기 화면 설정](experiments/final-home-settings.png), [파일](experiments/final-files.png), [내보내기](experiments/final-export.png) 확인. 파일→하위창→파일→설정 닫기 복귀도 확인했다.
- 확인창은 외형 검사를 위해 직접 열었다. 실제 저장/버리기/복구 동작은 자동 테스트 증거와 구분한다. 사용자 곡 편집·업로드·삭제·백업 복원은 실행하지 않았다.
- 종료 시 DB 확인: 마커 `k9/k25/k41/k73/k84/k85` 6개, 가사515개, 편집 초안 없음. PDF 두 줄, 위치157.35초, zoom=.95, 공통 PDF=true 및 마지막 설정=score로 복귀했다.
- 화면 크기·Safari RDM 설정은 바꾸지 않았다. 실기 터치·세로모드·VoiceOver·네이티브 파일 선택창·내보낸 HTML 실제 실행은 이번 시각 기준에 포함되지 않는다.
- 캡처는 로컬 `docs/experiments/`에 있으며 Git 제외 자료다.
