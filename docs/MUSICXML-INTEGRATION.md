# PDF → MusicXML main 통합

- 목표: 전용 변환 도구·검증·실험 문서를 최신 main에 통합한다.
- 범위: codex/pdf-musicxml의 main 미포함 커밋 및 통합 검증.
- 완료 조건: main 병합, 집중 테스트·웹앱 테스트·HTML 생성 없는 빌드 통과, 로컬 자료 보존 후 작업 트리·브랜치 정리.
- 제외: GitHub·push·배포·HTML 재생 파일 생성/저장.
- 검증: XML 규격/리듬 검사, 오류 주입 및 XML 주석 회귀 검사, Vitest, TypeScript, Vite(publicDir 복사 제외).

시작 main d18f669, 변환 브랜치 2da4b58. main에 없는 커밋은1개. 두 작업 트리 tracked/untracked 상태는 깨끗했다. 변환 정책은 내용이 같아 최신 main 그대로 유지한다. 변환 코드는 곡 해시에 결합된 역사적 재현 도구이며 최신 웹앱 매핑/렌더러를 변경하지 않는다.

검토 수정: Audiveris XML의 part 아래 주석을 measure로 처리하던 비교 발췌 오류를 수정하고 회귀 검사를 추가했다.

기본 npm run build는 portable HTML을 생성하므로 실행하지 않는다. 대신 i18n, 기존 출력에 대한 playback 검사, TypeScript, Vite build(publicDir:false)를 실행한다. Vite의 앱 index.html은 웹앱 빌드이며 HTML 재생 파일이 아니다. 기존 재생 HTML은 재생성하지 않는다.
