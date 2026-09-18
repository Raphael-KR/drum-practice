# drum-practice-web 작업 지침

- 전역 `/Users/raphael/AGENTS.md`를 함께 적용한다.
- 실제 작업 루트는 `/Users/raphael/Playground/drum-practice-web`이다.
- 기본 개발·검증 대상은 `http://127.0.0.1:5173/`의 웹앱이다. `src/`를 수정하고 개발 서버에서 반영한다.
- `exports/*.html`을 개발 정본으로 삼거나 매 변경마다 예제 HTML을 재생성하지 않는다. 사용자가 요청하면 내보낸다. 기존 앱의 HTML 저장 기능과 빌드용 템플릿 생성은 유지한다.
- PRD.md와 사용자의 최신 결정에 따라 구현하며 변경·검증은 history.md에 기록한다.
- Git에는 소스·설정·문서·테스트를 기록한다. 원본 미디어, 로컬 예제 자료, 분석 자료, 실험 출력, 생성 HTML, node_modules, dist는 제외한다. 제외된 파일은 삭제하지 않는다.
- 현재 GUI 검증은 같은 로컬 앱·자료 범위에서 이미 승인되어 있다. 외부 공개·배포·원격 push는 별도 요청 없이는 수행하지 않는다.
