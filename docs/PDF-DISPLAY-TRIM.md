# PDF 연습 화면 표시용 자르기

2026-10-03 표시 수정·배포 완료. 음원에서 추출한 가사 타이밍은 미확정이며, 악보 기반 가사 수록의 선행 조건은 아니다. 원본 PDF·MusicXML을 변경하지 않고 재생 화면에서 줄 앞 타악기 표시와 여백을 스킵한다. 그 과정의 인쇄 가사·마디 번호 잘림은 사용자 승인 범위다. 두 줄 재생은 행당 4마디, 전체 SVG 출력은 원본 줄 구성이다.

## 완료 조건

- 제작 세션이 원본에서 확인한 줄별 경계를 사용한다. 기존 다른 곡의 수치를 재사용하지 않는다.
- 확인된 PDF 영역에만 적용하고 SVG 및 사용자가 수정한 다른 영역에는 적용하지 않는다.
- 박 기준점의 원본 페이지 좌표, 첫 음표·박자표·실제 마디선, 원본 파일을 보존한다.
- 한줄/두줄 공통 화면, 진행선과 탐색 좌표를 검사하고 Safari 화면으로 검수한다.
- 단위/회귀 검사와 분리 빌드를 통과한다. 구현 상태와 배포 상태를 구분한다.

## 진행·실패 기록

- 기존 `displayRegion`은 Real Paradis 전용15pt 자르기였다. Loveholic 적용 경계는 제작 세션에서 독립 확인 중이다.
- 공통 `trimRegionLeft`를 분리하고 PDF 처리가 SVG에 적용되지 않도록 했다. 자르기 전 박 기준점은 음수 표시 좌표로 보존하며 왼쪽으로 강제로 붙이지 않는다. 입력 Region은 수정하지 않는다.
- `score-view`7검사 및 공통 화면10검사 통과. 곡별 새 경계가 들어오기 전 단계이며 최종 검증은 아니다.
- Safari evaluate의 문서상 `$uid` 참조가 `Can't find variable: $uid`로 실패했다. 지원되는 `page_interactions`의 node UID로 같은 버튼 조작에 성공했다. 원래 evaluate 매크로 복구로 표현하지 않는다.
- 전체 검사와 빌드를 동시에 실행하자 build-info 생성 파일이 검사 중 바뀌어 UI 버전 해시 기대값이 달라졌고 후속 UI 검사도 실패했다. 생성 파일을 쓰는 빌드와 이를 읽는 테스트는 독립 작업이 아니다. 빌드 종료 후 전체 검사를 순차 재실행한다. 향후 같은 조합을 병렬 실행하지 않는다.

## 최종 검증과 배포

- Loveholic32줄의 원본 region fingerprint에만 crop을 적용했다. PDF 박 좌표 오차 최대5.56e-17, SVG 우회, 원본파일 보존. Safari iPad mini 응답형 화면에서4마디×2행, 첫4/4 보존, 한줄/두줄 표시와 재생·정지를 검수했다.
- half-muted의 명시적 pictHalfOpen1만 공식 Bravura U+E7F6 path로 보완한다. 원본 글리프의 임의 도형 재현이 아니다. OFL과 원본 SHA는 src/vendor에 보존, 앱 및 portable 템플릿 라이선스에 포함. 기본 brass half-muted는 변경하지 않는다.
- 제작 세션의 새 패키지 SHA256: ab36ce61084b9d619520b1ded8cd6a26aa7745a9bcc92b1698fc8078b8e71a1f. Safari 보관함 재읽기20/20glyph,123마디 확인. 33–35마디의 표기를 직접 캡처 검수했다.
- 이미 가져온 번들 악보가 자동 갱신되지 않는 경로를 발견했다. 공통 import/merge를 사용하는 악보 업데이트 버튼을 추가했고, Safari에서 실제 클릭 전후 설정·위치·마커·반복 정보가 동일함을 확인했다. 강제 덮어쓰기 대신 기존 구조 충돌 처리도 재사용한다.
- 전후 비교를 window 변수에 두자 개발 서버 HMR로 변수가 소실됐다. sessionStorage에 QA snapshot을 두고 재검증하여 보존 true를 확인했다. 기록 손실로 오판하지 않는다.
- npm test는 별도 guitar-practice 프로젝트까지 수집해 해당 fixture 누락 등으로 실패했다. 프로젝트의 test:drum으로 범위를 지정하여70파일334테스트 통과. 분리 빌드와 tsc도 통과. 다른 프로젝트의 실패는 이번 변경의 통과로 덮지 않는다.
- Sites 자격 증명 만료는 같은 Site의 새 단기 자격 증명을 발급받아 복구했다. 기존 audience 유지, 공식 site-workflow로 source push/archive 검증 후 배포했다.
- player0.4.5/editor0.4.3. Sites 버전12, source1ff02ccc59327d1dcf1b94529484e73c94ecb17f, deployment appgdep_6abfd9e2db0081919150df69415c7813 succeeded(2026-10-03 01:21KST). 악보제작기은 로컬 전용. 곡 포함 HTML 파일 생성/저장 없음.
- 근거: docs/experiments/loveholic-20261002/display-crop-review-20261003/의 build-final.log, full-tests-drum-release.log, player-pdf-rows-final.png, player-pdf-first-system.png, player-svg-bars33-40.png. 원본/패키지 전곡검증은 half-open-package-20261003/에 보존.
- 남은 항목: 가사 음절/행 타이밍은 로컬 STT·보컬 분리·두 Whisper 모델·CTC 및 공개 시간 자료 조사 후에도 미확정이다. 대표 전체 구절 채택0/3이며 전곡 실패로 확대하지 않는다. 상세 근거와 미채택 이유는 [가사 시각 검토](LOVEHOLIC-LYRICS-REVIEW.md)에 남겼다. 검증된 동일 녹음 시간 가사 또는 청취로 확인된 구절/음절 경계가 필요하며, 추정값을 패키지에 넣어 해결 완료로 간주하지 않는다.

## 2026-10-03 가사 작업 전제 정정

- 사용자 확인: 이번 악보의 인쇄 가사를 기준으로 수록한다. 외부 시간 가사나 자동 음원 정렬 성공을 기다리지 않는다.
- 지난 구현 근거: history.md의 2026-09-19 「MusicXML 정본 및 독립 가사 리듬 성부」, src/lyric-score.ts의 projectLyrics, src/canonical-xml.ts의 저장·복원. 가사 음악적 위치는 정본이며 초 단위 시간은 음원 연결에서 계산한다.
- 원인: 별도 음원 정렬 실험의 미해결을 악보 기반 가사 제작의 차단으로 확대했다. 해결 방향: 기존 위치 저장 경로를 재사용하고 제작 세션이 인쇄 가사와 마디·음표를 대조한다. 박 위치를 입증할 수 없는 경우 임의 음절 타이밍을 만들지 않고 마디 단위 표시를 구분한다.
- 현재 상태: 기존 경로 확인 및 제작 세션에 방향 전달. 새 악보 가사 수록·패키지·배포 완료를 뜻하지 않는다.
