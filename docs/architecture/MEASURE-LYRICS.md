# 마디 단위 인쇄 가사 계약

## 목적과 범위
인쇄 악보에서 마디 귀속만 확인되는 가사를 가창 시작·길이 추정 없이 보존하고 공통 재생 화면 중앙에 표시한다. 기존 음절 가사는 `Song.lyrics`와 `scorePosition`을 유지한다.

## 데이터
`Song.measureLyrics?: { id: string; measureId: string; text: string; placement: "measure-center" }[]`

- 마디 ID는 실제 measures 항목이어야 하며 항목 ID와 마디 귀속은 각각 중복되지 않는다. 한 마디의 문구는 하나의 text로 합친다.
- time/end/quarterOffset/durationQuarters를 갖지 않는다. 음절 강조·가창 길이를 주장하지 않는다.
- canonical MusicXML의 기존 miscellaneous manifest에 선택 필드로 저장한다. 가짜 음표를 생성하지 않는다. 원본 성부는 유지한다. 예전 파일은 필드 없이 호환된다.
- `.drumscore` Song 데이터와 XML 왕복에서 보존한다. 공통 renderMeasure가 PDF/SVG, 한 줄/두 줄에 동일하게 표시한다. 음절 충돌 배치 대상이 아니다.
- 전체 가사 문서가 있으면 그 문서를 표시한다. 없으면 마디 가사를 마디 순서로 표시한다. 박 단위 가사 편집 표는 기존 리듬 가사만 편집하며, 이 마디 문구용 편집 UI는 이번 변경에 포함하지 않는다.

## 검증 2026-10-03
- 집중 4파일30검사, 전체71파일338검사 통과. build:apps 및 TypeScript 통과.
- Safari 로컬 앱에서 공통 renderMeasure를 호출한 합성 fixture: 중앙 정렬, 4마디 중 지정 마디에만 표시, XML 복원 동일, timed lyric note 0개 확인. 캡처 docs/experiments/measure-lyrics-safari.png. 저장 곡 변경 없음. 실제 Loveholic 새 패키지 QA와 구분한다.
- 이전 Safari context가 없어 평가 실패. list_tabs=[] 확인 후 새 로컬 탭 생성으로 검증 재개. 원래 context 복구라고 표현하지 않는다.
- 새 곡 포함 HTML 생성·저장 없음. 공개 배포·버전 변경·커밋은 새 악보 검수와 별도이며 아직 수행하지 않았다.

## 실제 Loveholic 수록 및 배포
- 원본 대조된 77개 마디 가사 패키지 SHA256 26b97bd8b5a1611c4667d42a3fa9205cc6190a8c469000aec9944f45d689fcc1를 직접 ZIP CRC/항목 수 검사한 뒤 public/scores/loveholic.drumscore에 반영했다.
- 로컬 앱의 실제 악보 업데이트 버튼으로 저장 후 재열기 확인. Safari 응답형1133×744(실제 innerWidth1132)에서 PDF/SVG × 한줄/두줄 캡처 검수. 77항목 중앙 정렬, 4마디/행, 페이지 가로 넘침 없음. 캡처 printed-lyrics-package-20261003/player-*.png.
- release 빌드와71파일338검사 통과. player0.4.6/editor0.4.4. Sites 버전13 배포 succeeded, source c5d4260b90ddaea641e5e19aea5c8f9c64c484cc, deployment appgdep_6abfe9dde62081918ecea2119f4a80a4. 2026-10-03 02:29KST. 악보제작기은 공개 배포 제외.
- 새 시간 자료 조사에서는 원문 대조 출처만 확보됐다. 외부 문구로 사용자 악보를 덮어쓰지 않았다. 음원 청취에 의한 음절별 싱크 검증으로 주장하지 않는다.
- 재생 검수: 스크립트 click 후 AudioContext resume이 진행되지 않아 재열기로 초기화하고 실제 Safari 버튼 입력을 사용했다. 재생→일시정지 전환,10→17마디 진행 및 정지 확인. 합성 클릭 실패를 앱 재생 실패로 단정하지 않는다.
