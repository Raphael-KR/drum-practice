# MusicXML SVG 표시 및 압축 캐시

- 목표: MusicXML 악보를 벡터로 표시하면서 캐시 용량을 줄인다.
- 범위: OSMD 렌더링, 웹앱 열기, IndexedDB, HTML/ZIP 왕복.
- 완료 조건: SVG 이미지 표시, 압축 바이트 보존, 기존 PNG 호환, 가사 음악적 위치 및 음원 마디 시간 보존.
- 제외: PDF 벡터 변환, 가사 재정렬, 원본 MusicXML 음표 수정.
- 검증: 코덱/저장 테스트, 전체 테스트·빌드, 로컬 웹앱과 Safari 시뮬레이터 HTML 표시.

## 형식

MusicXML → OSMD SVG → gzip Blob(`application/vnd.drum-practice.svg+gzip`). 저장소와 HTML에는 압축된 바이트가 들어간다. 표시 시 한 번 압축을 풀어 `image/svg+xml` Blob URL을 만들고 기존 마디 이미지 배경에서 사용한다. 진행선과 음영은 기존처럼 별도 요소로 움직인다. 원본 XML은 정본으로 유지한다.

ZIP은 `pages/manifest.json`에 페이지 경로와 MIME을 저장한다. SVG gzip은 `.svg.gz`, 기존 PNG는 `.png`. 목록 없는 과거 ZIP은 기존 PNG 규칙으로 복원한다. HTML/IndexedDB는 기존 MIME+바이트 코덱으로 새 형식을 보존한다.

기존 MusicXML PNG 캐시는 웹앱에서 해당 악보를 열면 다시 렌더링한다. 마디 수·박자표가 달라지면 교체를 거부한다. 가사·마커·반복·음원 시간은 유지한다. 기존 정규화 마디 영역과 수동 진행 위치 보정도 유지한다. 페이지 수가 다르면 자동 갱신을 거부한다. PDF와 이미 만들어진 과거 HTML은 PNG로 계속 열 수 있다. 과거 HTML 자체를 자동으로 업데이트하지는 않는다.

캐시를 갱신한 웹앱에서 HTML을 새로 저장하면 압축 SVG가 포함된다. HTML은 SVG를 디코딩해서 표시하며 OSMD 전체를 다시 실행하지 않는다. CompressionStream/DecompressionStream을 제공하는 브라우저가 필요하다.
