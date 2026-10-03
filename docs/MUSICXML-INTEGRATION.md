# PDF → MusicXML main 통합

> 2026-10-02 통합 당시의 Git·검증·자료 보존 기록이다. 아래 HEAD·브랜치·clean 상태·테스트 수는 당시 결과이며 현재 checkout 상태를 뜻하지 않는다. 새 작업은 실제 루트 `/Users/raphael/Playground/drum-practice`에서 상태를 다시 확인하고 [변환 정책](MUSICXML-CONVERSION-POLICY.md)을 따른다. 정리한 과거 작업 트리를 재생성하지 않는다.

- 목표: 전용 변환 도구·검증·실험 문서를 최신 main에 통합한다.
- 범위: codex/pdf-musicxml의 main 미포함 커밋 및 통합 검증.
- 완료 조건: main 병합, 집중 테스트·웹앱 테스트·HTML 생성 없는 빌드 통과, 로컬 자료 보존 후 작업 트리·브랜치 정리.
- 제외: GitHub·push·배포·HTML 재생 파일 생성/저장.
- 검증: XML 규격/리듬 검사, 오류 주입 및 XML 주석 회귀 검사, Vitest, TypeScript, Vite(publicDir 복사 제외).

시작 main d18f669, 변환 브랜치 2da4b58. main에 없는 커밋은1개. 두 작업 트리 tracked/untracked 상태는 깨끗했다. 변환 정책은 내용이 같아 최신 main 그대로 유지한다. 변환 코드는 곡 해시에 결합된 역사적 재현 도구이며 최신 웹앱 매핑/렌더러를 변경하지 않는다.

검토 수정: Audiveris XML의 part 아래 주석을 measure로 처리하던 비교 발췌 오류를 수정하고 회귀 검사를 추가했다.

기본 npm run build는 portable HTML을 생성하므로 실행하지 않는다. 대신 i18n, 기존 출력에 대한 playback 검사, TypeScript, Vite build(publicDir:false)를 실행한다. Vite의 앱 index.html은 웹앱 빌드이며 HTML 재생 파일이 아니다. 기존 재생 HTML은 재생성하지 않는다.

## 검증 결과와 자료 보존

- main 통합 커밋: 3949f3c (d18f669를 부모로 포함하는 병합을 fast-forward 적용).
- 최신 웹앱 src/, package.json, AGENTS.md 및 변환 정책: 시작 main과 diff 없음.
- Python9검사 통과, 110마디/441박 MusicXML4.0 검증 통과.
- 원본 PDF에서 재추출·재출력한 MusicXML SHA256: d5033d473bef0a63d2ded5f2e09234b168b7306d1872fdce9981d9864516f8f6. 기존 후보와 동일.
- main의 드럼 앱 Vitest:64파일286테스트 통과 (`npm test -- --exclude 'guitar-practice/**'`). 단순 npm test는 별도 하위 guitar-practice 테스트까지 수집하여 다른 프로젝트의 fixture 경로 오류로 실패했으므로 해당 프로젝트만 제외했다. 이전 작업 트리 테스트는 누락된 Git 제외 데모/참조 자료를 연결한 뒤 통과했다.
- i18n 검사, TypeScript, playback 구조/공통컴포넌트/기존 번들 검사 통과. Vite publicDir:false 웹앱 빌드 통과(기존 큰 청크 경고). npm run build/portable 및 HTML 검토 생성기는 실행하지 않았다.
- 기존 로컬 자료5397파일을 해시 검증해 `/Users/raphael/Playground/drum-practice-local-archives/pdf-musicxml-worktree-20261002`에 보존했다. 2026-10-03 현재 보존 위치는 `/Users/raphael/Playground/drum-practice/local-archives/pdf-musicxml-worktree-20261002`다. manifest는 backup-manifest.json. 재사용할 실험자료는 실제 프로젝트 docs/experiments/musicxml 및 musicxml-comparison에도 복사했다. 보관된 venv의 절대 shebang은 역사 자료로 그대로 유지하며 실행환경으로 쓰지 않는다. 실행이 필요하면 현재 프로젝트에서 별도 가상환경을 재생성한다.
- 새 검증 로그는 docs/experiments/audiveris-20261002/, 재현 출력은 docs/experiments/pdf-musicxml-integration-repro/, 웹앱 빌드는 docs/experiments/pdf-musicxml-integration-build/에 보존한다.
- 남은 악보 품질 한계는 변환/비교 문서의 범위 그대로다. 이번 작업은 앱 재배포나 새 악보 확정이 아니다.
