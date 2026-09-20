# Safari 응답형 화면 시각 QA — 2026-09-20

> 후속 수정·재검수: [V01–V12 최종 판정과 캡처](VISUAL-QA-REMEDIATION.md). 아래는 수정 전 최초 QA 기록입니다.

## 판정과 범위

**시각 품질: 수정 필요.** 새 파일/내보내기 화면과 기본 설정은 비교적 일관되지만, 편집과 기존 보조 창에 레이아웃·조작 크기·색상 규칙 불일치가 남아 있다. 기능 테스트 통과를 디자인 승인으로 간주할 수 없다.

- 기준 소스: main / `60f01a4`, 제품 0.2.0. QA 시작 시 working tree clean.
- 대상: 사용자가 열어 둔 Safari MCP의 `http://127.0.0.1:5173/`. 페이지 실측 **1180×820 CSS px, DPR 2**. 화면 크기 및 RDM 설정은 변경하지 않았다. 사용자는 iPad mini 모드라고 지정했으나 정확한 기기 프리셋은 별도 확인하지 않았으며 실기 iPad 검증으로 부르지 않는다.
- 방법: 실제 화면 열기, 렌더링 안정화 후 스크린샷 육안 검사, DOM 크기/스크롤 측정, 관련 CSS/구조 대조. 파일 제출·다운로드·삭제·복원 실행은 이번 시각 QA 범위 밖이다.
- 앱 소스는 수정하지 않았다. 아래 제안은 미적용 상태다.
- 스크린샷은 로컬 `docs/experiments/`에 보관한다. Git 제외 자료이므로 문서만 다른 환경에 옮기면 이미지가 없다.

## 수정 목록

P1은 편집 사용을 직접 방해하는 문제, P2는 일관성·가독성·접근성 개선, P3는 정리 제안이다.

| ID | 우선 | 관찰과 근거 | 개선 방향 |
|---|---|---|---|
| V01 | P1 | 악보 편집의 ‘원본 악보 보기’가 **519×326px** 거대 버튼으로 왼쪽 그리드 칸을 차지한다. PDF는 오른쪽, 마디 편집은 아래로 밀린다. [화면](experiments/vqa-editor-score.png). `score-management.ts:169`의 prepend와 `style.css:740`의 2열 grid가 결합한 결과. | 원본 보기 액션을 별도 도구줄로 배치하고 미리보기/편집 패널의 grid 영역을 명시한다. |
| V02 | P1 | 가사 시작 마디/박 select는 높이 **21px**, 악보 페이지/마디/박자 select는 **23px**. 주변 입력은 44–48px다. 가사 길이 입력은 293px인데 핵심 위치 select는 77–79px다. [가사](experiments/vqa-editor-lyrics.png), [악보](experiments/vqa-editor-score.png). | 입력 컨트롤 높이를 통일하고 위치 선택에 폭을 배분한다. checkbox의 시각 크기만으로 터치 영역 실패라고 판정하지는 않았다. |
| V03 | P2 | 편집에서 아래로 스크롤하면 제목과 닫기 버튼이 화면 밖으로 사라진다. 라이선스 하단에서도 닫기 버튼 top=-2464px, 왼쪽 메뉴도 사라진다. [편집 하단](experiments/vqa-editor-lyrics-bottom.png), [라이선스 하단](experiments/vqa-licenses-bottom.png). | 모달 머리글/닫기와 설정 탐색은 고정하고 본문만 스크롤한다. |
| V04 | P2 | 자료 칩 의미 색상이 화면마다 다르다. 설정은 MusicXML 파랑·PDF 빨강·가사 초록, 목록은 MusicXML 분홍·PDF 보라·가사 파랑이다. [설정](experiments/vqa-settings-score.png), [목록](experiments/vqa-library.png). `style.css:1227–1229`의 기존 색과 asset 색 정의가 별개다. | 공통 자료 유형 색상 토큰 사용. 버튼형 칩과 상태 칩의 역할 차이는 유지하되 색상 의미는 동일하게 한다. |
| V05 | P2 | 설정 > 악보는 곡 요약 옆 좁은 칸에 편집/파일이 나란히 들어가고 아래는 크게 빈다. 액션 폭158px, 높이79px. 곡을 열지 않은 상태도 같은 좁은 구조다. [곡 있음](experiments/vqa-settings-score.png), [없음](experiments/vqa-home-settings-score.png). | 요약을 위 전체 폭으로, 편집/파일을 아래 행으로 배열한다. 창 높이 고정의 안정성은 살리되 정보 밀도와 정렬을 개선한다. |
| V06 | P2 | 모달 너비와 닫기 규칙이 불일치한다. 파일640px·BPM440px에 비해 소리860×150px, 이전 저장본1133×174px, 저장 확인1133×159px다. 이전 저장본의 닫기는 제목 아래 왼쪽 작은 사각 버튼이다. [소리](experiments/vqa-sound.png), [이전 저장본](experiments/vqa-versions.png), [저장 확인](experiments/vqa-dirty-prompt.png). | 소형/일반/편집용 너비 단계와 공통 머리글·하단 액션 규칙을 정한다. 저장 확인은 안전한 ‘계속 편집’에 기본 초점을 둔다. |
| V07 | P2 | 곡 정보 편집은 필드와 재배치 버튼이 위에서 임의로 줄바꿈되고 아래가 빈다. 메타데이터와 템포/타이밍 변경이 섞인다. [화면](experiments/vqa-editor-meta.png). | 정렬된 2열 필드, 메타데이터와 타이밍 설정 분리. |
| V08 | P2 | 전체 가사 보기는 음절별 공백이 있는 긴 단락으로 출력되어 읽기 어렵다. `once a- gain` 같은 분할도 그대로 노출된다. `lyricText`가 없을 때 음절을 공백으로 연결하는 fallback이 원인이다. [화면](experiments/vqa-lyrics-full.png), `score-management.ts:15–19`. | MusicXML의 실제 구절/행 정보를 이용해 문장 형태로 재구성. 근거 없는 절/후렴 이름이나 임의의 원문 복원은 하지 않는다. |
| V09 | P2 | 가사 업로드의 ‘가사 텍스트’ 라벨이 파일 선택 옆으로 붙고 textarea는 다음 행에 있다. 보컬 업로드에는 작은 빈 파트 select가 노출된다. 새 곡 폼도 라벨/필드 간격과 select 크기가 혼재한다. [가사](experiments/vqa-lyric-upload.png), [보컬](experiments/vqa-vocal-import.png), [새 곡](experiments/vqa-new.png). | 라벨을 각 입력 바로 위에 묶고, 파일 선택 전 파트 선택은 숨기거나 설명 있는 비활성 상태로 표시. 제출 위치 통일. |
| V10 | P2 | 반복 구간에서 시작/끝 마디 입력과 ‘현재 마디’ 버튼의 시작 x좌표가 다르다. 오른쪽은 비고 아래 이름/액션4개가 몰린다. 정밀 모드의 설명도 두 줄로 중복된다. [화면](experiments/vqa-loop-precise-clear.png). | 고정 라벨 열 + 동일 폭 입력, 시작/끝 대칭 배치, 주 실행과 보조 동작 분리. |
| V11 | P3 | BPM 화면에서 ‘94 BPM · 원곡’ 프리셋과 하단 ‘원곡94 BPM’이 같은 동작을 중복한다. [화면](experiments/vqa-tempo.png). | 원곡 복귀 진입점 하나로 정리. |
| V12 | P3 | 한 줄 보기에서는 하단 넓은 빈 영역이 남는다. 잘림은 아니며 두 줄 보기와 비교해 공간 활용 차이가 크다. [PDF](experiments/vqa-pdf-ribbon-clear.png), [SVG](experiments/vqa-svg-ribbon-clear.png). | 사용자가 고른 악보 크기는 유지하되 세로 공간·컨트롤 배치 원칙을 정한다. 무조건 확대하지 않는다. |

## 화면별 확인 범위

| 화면 | 결과 / 증거 |
|---|---|
| 초기화면 | 메트로놈 숨김, 최근 곡 버튼, 카드 정렬 확인. [화면](experiments/vqa-home.png) |
| 초기화면 설정 4개 | 화면 설명 표시되고 잘못된 ‘이 곡에 악보 추가’ 없음. 악보 관리 비활성 상태 확인. [화면](experiments/vqa-home-settings-screen.png), [재생](experiments/vqa-home-settings-playback.png), [악보](experiments/vqa-home-settings-score.png), [정보](experiments/vqa-home-settings-info.png) |
| 곡 설정 4개 | 화면·재생·정보 기본 크기/정렬은 안정적. 악보는 V05. [화면](experiments/vqa-settings-screen.png), [재생](experiments/vqa-settings-playback.png), [악보](experiments/vqa-settings-score.png), [정보](experiments/vqa-settings-info.png) |
| 라이선스 펼침/하단 | V03. [상단](experiments/vqa-licenses.png), [하단](experiments/vqa-licenses-bottom.png) |
| PDF 한 줄/두 줄 | 현재 구간의 세로 잘림 없음. 한 줄 여백 V12. [한 줄](experiments/vqa-pdf-ribbon-clear.png), [두 줄](experiments/visual-qa-start.png) |
| SVG 한 줄/두 줄, PDF 비교 | 현재 61–68마디 구간에서 상단 빔/하단 음표 잘림 없음. 비교 화면의 동일 마디 열 폭 정렬 확인. 곡 전체 음표 정확성 검수는 아님. [한 줄](experiments/vqa-svg-ribbon-clear.png), [두 줄](experiments/vqa-svg-rows-clear.png), [비교](experiments/vqa-svg-compare-clear.png) |
| BPM, 소리 | V06/V11. [BPM](experiments/vqa-tempo.png), [소리](experiments/vqa-sound.png) |
| 반복 기본/정밀, 마커 관리 | V10. 마커 행 버튼 터치 높이는 충분하나 기존 글리프와 새 아이콘 스타일은 다름. [정밀](experiments/vqa-loop-precise-clear.png), [마커](experiments/vqa-markers-restored.png) |
| 내 악보 목록/백업 관리 펼침 | 줄 넘침 없음. 칩 V04. [목록](experiments/vqa-library.png), [백업](experiments/vqa-backup.png) |
| 새 곡/악보 가져오기/보컬 가져오기 | 기존 폼 스타일 V09. [새 곡](experiments/vqa-new.png), [악보](experiments/vqa-score-upload.png), [보컬](experiments/vqa-vocal-import.png) |
| 편집 악보/가사/곡 정보 | V01/V02/V03/V07. [악보](experiments/vqa-editor-score.png), [가사](experiments/vqa-editor-lyrics.png), [정보](experiments/vqa-editor-meta.png) |
| 원본 PDF/전체 가사 | PDF 종횡비 유지된 중앙 페이지 확인. 가사 V08. [PDF](experiments/vqa-original.png), [가사](experiments/vqa-lyrics-full.png) |
| 이전 저장본/저장 확인 | V06. 이번에는 빈 이력 및 확인창 모양을 열어 검사했으며 수정/버리기/복원을 실행하지 않음. [이력](experiments/vqa-versions.png), [확인](experiments/vqa-dirty-prompt.png) |
| 파일/내보내기/가사 업로드 | 파일·내보내기 행 간격, 선택 구분, 닫기 규칙은 양호. 업로드 V09. [파일](experiments/vqa-files.png), [내보내기](experiments/vqa-export.png), [가사](experiments/vqa-lyric-upload.png) |

## 검증 한계 및 데이터 복구 기록

- 이번 결과는 위 표의 화면/상태에 한한다. 실제 iPad 터치·세로 회전·소프트 키보드·VoiceOver·네이티브 파일 선택창·내보낸 HTML·모든 오류/로딩 상태·PDF만/외부 파일 없는 곡 조합은 검증하지 않았다. 기존 기능 테스트 결과로 이를 대체하지 않는다.
- 일반 경로는 버튼을 열어 확인했다. 마커 관리 및 저장 확인창 일부는 DOM으로 직접 열어 외형을 검사했으므로 진입 동작 검증과 구분한다.
- 검사 중 마커 관리 열기와 즉시 마킹 버튼을 혼동해 62마디 마커가 추가되었다. 기존 6개가 슬롯 정책으로 3개로 줄어든 것을 확인했고, 번들 정본과 대조해 기존 `k9/k25/k41/k73/k84/k85`의 이름·시각을 복구했다. DB 재조회, 새로고침 후 재조회, 곡 재진입 후 6개 유지와 하단73/84/85를 확인했다. [복구 화면](experiments/vqa-markers-restored.png). 이 부수 변경을 숨기거나 무변경 QA라고 표현하지 않는다.
- 종료 시 PDF 두 줄 보기, 기존 공통 설정(prefer-pdf=true, auto-fullscreen=false, 설정 마지막 메뉴=score, 재생 토글 둘 다 켜짐)으로 복귀. 모달 모두 닫힘. 악보/가사/메타데이터 편집은 하지 않았다.
- 세부 DOM 측정: [JSON](experiments/visual-qa-metrics-2026-09-20.json). 비동기 모달 직후의 일부 root 측정은 이전 창을 가리키므로 스크린샷으로 재확인한 수치만 위 판정에 사용했다.

## 권장 적용 순서

1. V01/V02/V03: 편집 그리드·입력 크기·고정 머리글.
2. V04/V05/V06/V09: 색상·창 크기·폼 구조를 공통 컴포넌트 규칙으로 통합.
3. V07/V08/V10: 곡 정보·가사 읽기·반복 설정의 정보 구조 개선.
4. 같은 Safari 상태에서 변경 화면과 진입/복귀/스크롤을 재검사한 뒤 세로 및 실기 터치 검증을 별도로 수행.
