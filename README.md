# 드럼연습실

악보와 음원으로 드럼을 연습하는 웹앱입니다. 악보 없이 기기의 MP3만 불러와서도 연습할 수 있습니다. 악보제작기는 로컬 전용이며 두 앱은 공통 재생 코드를 사용합니다.

- 공개 드럼연습실: [drum-practice-studio.dgkma.chatgpt.site](https://drum-practice-studio.dgkma.chatgpt.site)
- 앱 버전 정본: [app-versions.json](src/app-versions.json) — [버전·발행 상태](docs/reference/engineering/release.md#app-versions--앱-공통-버전)
- 문서 시작점: [문서 안내](docs/records/archive/documentation-reorganization.md)
- 제품 범위: [PRD](PRD.md), 변경 기록: [history](history.md)

## 로컬 실행

기준 개발 환경은 `.nvmrc`의 **Node.js 22 LTS(22.13 이상)**입니다. 지원 범위는 `package.json`의 `engines`를 따릅니다. 앱의 음원 분석정보는 브라우저 IndexedDB에 저장합니다. `node:sqlite`는 과거 서버 테이블 제거를 확인하는 회귀 검사에만 사용합니다.

```sh
cd /Users/raphael/Playground/drum-practice
npm ci
npm run dev
```

- 드럼연습실: `http://127.0.0.1:5173/player.html`
- 악보제작기: `http://127.0.0.1:5173/editor.html`
- 개발·미리보기 포트는 **5173**으로 고정합니다. 이미 실행 중이면 같은 서버를 사용합니다. 다른 포트로 자동 전환하지 않습니다.
- `127.0.0.1`은 같은 기기 전용입니다. iPhone/iPad에서는 공개 사이트를 사용합니다.

## 사용과 저장

서버 목록의 **악보 불러오기**는 음원이 포함된 `.drumscore`를 내려받습니다. **음원 불러오기**는 기기의 MP3에서 메타정보를 읽고 박 시각과 템포를 분석합니다. 박자는 기본 4/4이며 자동 판별하지 않습니다. 목록의 **조정**에서 보정합니다.

원곡 모드는 실제 음원을 1배속으로 재생하고, 박 시각이 있으면 메트로놈이 템포 변화를 따릅니다. 연습 BPM 모드는 음정을 유지하면서 박 간격을 일정하게 맞춥니다. 연주 시작 이전의 음원도 보존하며, 카운트오프를 켜면 연주 전 마지막 네 박에 카운트 소리를 겹칩니다. 자세한 동작은 [음원 연습](docs/reference/product/audio-practice.md#audio-practice--음원-연습)을 따릅니다.

음원·악보·개인 설정은 해당 브라우저에 저장됩니다. 같은 MP3의 해시·곡명·가수·박자 분석정보도 해당 브라우저 안에서 저장·재사용하며 **서버로 전송하지 않습니다**. 기기·브라우저·접속 주소가 바뀌면 개인 보관함은 별개입니다. 드럼연습실의 악보 백업·복원·업데이트 기능은 제거했습니다. 악보제작기의 전체 곡 백업·작업 이력은 별도로 유지합니다.

## 개발과 검증

환경·검사 명령·공통 문구 작업은 [개발 절차](docs/how-to/develop.md), 검증 범위·자산 준비는 [검사 절차](docs/how-to/verify.md)를 따른다.

## 제작 자료와 라이선스

악보 제작은 [제작 프로세스](docs/how-to/produce-score.md#score-production-process--악보-제작-프로세스)에서 시작합니다. 최신 제작 원본은 `data/production/`, 변환·검사 입력은 `data/reference/`에 로컬 보존하며 Git에 넣지 않습니다. 과거 실험 출력·로그·캡처·임시 환경은 2026-10-13 사용자 요청으로 삭제했습니다. 독립 HTML 저장 기능과 템플릿·생성물은 폐기했습니다. 악보는 `.drumscore`로 저장하고 드럼연습실에서 재생합니다.

사용 라이브러리의 라이선스는 [오픈소스 고지](docs/reference/engineering/third-party-notices.md#open-source-notices--오픈소스-고지-계약)를 참고합니다. 원본 악보와 음원의 이용 범위는 개별 자료의 조건을 따릅니다.
