# 버전 갱신과 Sites 발행

문서 역할: **실행 절차**. 현재 요청과 전역·프로젝트 지침의 승인 범위 안에서 수행한다. [정본 목록](../RULES-INDEX.md)과 [작업별 안내](../README.md)를 먼저 확인한다. 예시 명령·과거 기록은 이번 실행의 성공 증거가 아니다.

<a id="app-versioning--앱-버전-갱신-절차"></a>

## 앱 버전 갱신 절차

[버전 Rule](../reference/engineering/release.md#app-versions--앱-공통-버전)과 프로젝트 지침을 먼저 확인한다. 문서만 변경하면 이 명령을 실행하지 않는다.

1. 사용자 커밋 지시 범위와 실제 앱 변경을 확인하고 minor/patch/major 선택 이유를 변경 기록에 적는다.
2. 기본 명령 `pnpm run version:app both patch`에서 승인 범위에 맞는 단계를 선택한다.
3. 앱 수정의 소스 빌드는 `node scripts/build/build-info.mjs`로 갱신한다.
4. 두 앱 표시 번호와 변경 파일을 확인하고 관련 검증 결과를 기록한다. 커밋·푸시·발행은 각각 승인된 범위에서만 수행한다.
5. 전체 릴리스는 [release-drum-practice](../../.agents/skills/release-drum-practice/SKILL.md), Sites 세부 실행은 [발행 절차](release.md#sites-publication--sites-발행-절차)를 따른다.

과거 버전·공개 결과는 [사실 기록](../records/releases.md#app-version-history--앱-릴리스-번호와-정정-기록)이며 현재 서버를 새로 조회한 상태가 아니다.

<a id="sites-publication--sites-발행-절차"></a>

## Sites 발행 절차

문서 역할: **실행 절차**. 범위와 소스 권위는 [배포 Rule](../reference/engineering/release.md#deployment-rules--배포-범위와-소스-권위), 선택 이유는 [ADR-0020](../decisions/0020-local-editor-and-public-player.md)을 따른다. 당시 발행·배포 식별자·HTTP/API 결과는 [사실 기록](../records/releases.md#sites-publication-history--sites-발행공개-확인-기록)에 분리했다.

<a id="sites-publication--실행-대상"></a>

### 실행 대상

- 개발 정본: `/Users/raphael/Playground/drum-practice`
- 배포 사본: `deployment/sites/` — 제품 소스를 독립 수정하지 않는다.
- 기존 Sites 프로젝트: `appgprj_6ab0790baa048191aaee49f58c1ffe7b`
- 공개 주소: [드럼연습실](https://drum-practice-studio.dgkma.chatgpt.site)
- 정적 앱 입력: `dist/player/`. `dist/editor/`나 원본 미디어 폴더 전체를 발행하지 않는다.
- 서버 입력: `server/player-worker.ts`. 서버·DB·개인정보의 허용 범위는 [배포 Rule](../reference/engineering/release.md#deployment-rules--배포-범위와-소스-권위)을 확인한다.

<a id="sites-publication--발행-순서"></a>

### 발행 순서

사용자가 요청한 경우에만 commit, push, 공개 발행을 수행한다. 변경 범위와 기존 dirty 파일을 확인하고 이번 릴리스에 필요한 검사를 먼저 끝낸다.

전체 릴리스의 변경 검토·작업 브랜치·PR 검토·CI·main 병합·공개 확인·브랜치 정리는 [프로젝트 릴리스 스킬](../../.agents/skills/release-drum-practice/SKILL.md)을 따른다. 아래는 검증된 main 코드에 적용하는 빌드·Sites 발행 세부 절차다.

1. `src/app-versions.json`과 [버전 정책](../reference/engineering/release.md#app-versions--앱-공통-버전)을 확인한다. 문서만 변경하면 버전을 올리지 않는다.
2. 드럼 회귀와 분리 빌드를 검사한다.

   패키지의 반복 렌더 캐시가 배포 크기를 늘리는 경우 먼저 `scripts/release/compact-score-packages.mjs <새 출력 폴더> <실제 패키지>...`로 후보를 만든다. 원본 패키지를 보존하고 ZIP 엔트리·manifest·인쇄 잉크·공통 재읽기를 대조한 뒤 수록본에 적용한다. canonical XML이 있는 MusicXML 페이지의 알려진 버전1 timeline metadata만 생략하며 동봉 글꼴·원음원·가사는 제거하지 않는다. 변경한 패키지 해시와 실제 회귀 입력을 갱신하고 아래 검사를 수행한다.

   ```sh
   pnpm run test:drum
   pnpm run build:apps
   pnpm run check:playback
   ```

3. 정본의 `scripts/release/prepare-sites.mjs`로 기존 사본을 준비한다. pnpm이 검증된 커밋의 `config/shared-catalog.yaml` 사본과 lockfile을 해석하고 hosting 전용 manifest·잠금 파일·설정을 내보낸다. 개인 중앙 YAML을 이 단계에서 다시 동기화하지 않는다. 사본에서 의존성 버전을 독립 수정하지 않는다. 이 스크립트는 이전 생성 사본을 교체하므로 프로젝트 ID·경로와 사본의 별도 수정 유무를 먼저 확인한다.

   ```sh
   node scripts/release/prepare-sites.mjs
   pnpm --dir deployment/sites install --frozen-lockfile
   pnpm --dir deployment/sites run build
   ```

4. 현재 Sites 스킬과 노출된 도구 계약을 읽고 기존 프로젝트에 소스를 저장·발행한다. 새 사이트를 만들거나 공개 범위를 확대하지 않는다. Git push만으로 Sites 발행이 완료되지는 않는다.
5. `source-parity.json` 기준으로 `dist/player`, 사본의 `player-assets`, Worker의 `dist/client` 정적 파일을 대조한다. `index.html`은 준비 스크립트가 `player.html`에서 만드는 진입점이다.
6. 배포가 `succeeded`인지 확인한 뒤 공개 HTML·주요 JS/CSS·분석/변환 Worker와 `.drumscore` 다운로드, 폐기된 API의 404를 확인한다. 기존 값을 바꾸는 smoke 요청은 피하고, 쓰기 검증이 필요하면 별도 시험 해시와 처리 범위를 정한다.
7. 구현 커밋, push, Sites 소스/버전/배포 ID, 빌드 식별자, HTTP/API 결과와 수행한 화면 검수의 환경·결과를 기록한다. iOS·iPadOS 실기기·시뮬레이터 검증은 릴리스 범위에서 제외하고, 사용자가 별도로 지시해 수행한 경우에만 해당 결과를 추가한다.

DB 관련 작업이 포함되면 [저장·마이그레이션 경계](../reference/engineering/security.md)를 확인한 뒤 별도 요청 범위를 대조한다.

<a id="sites-publication--오픈소스-고지-생성과-확인"></a>

### 오픈소스 고지 생성과 확인

설치된 lockfile의 의존성을 준비한 뒤 기존 `pnpm run generate`가 고지를 생성한다. 원문 누락이면 빌드 실패를 해결하고, `pnpm run check:docs`는 생성 UI 문서·파일 링크만 검사하므로 라이선스 검토를 대신하지 않는다. 공개 발행은 [발행 절차](release.md#sites-publication--sites-발행-절차)의 요청·확인 범위에서만 수행한다.
