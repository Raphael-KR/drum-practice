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

### 커밋 전 패키지 준비

패키지 변경은 [릴리스 스킬](../../.agents/skills/release-drum-practice/SKILL.md)의 변경 검토·로컬 검증 단계에서 끝낸다. 이후 작업 브랜치 커밋·PR/CI·main 검증이 같은 패키지와 회귀 입력을 대상으로 하도록 한다.

패키지의 반복 렌더 캐시가 배포 크기를 늘려 정리가 필요한 경우 `node scripts/release/compact-score-packages.mjs <새 출력 폴더> <실제 패키지>...`로 후보를 만든다. 원본 패키지를 보존하고 ZIP 엔트리·manifest·인쇄 잉크·공통 재읽기를 대조한 뒤 수록본에 적용한다. canonical XML이 있는 MusicXML 페이지의 알려진 버전1 timeline metadata만 생략하며 동봉 글꼴·원음원·가사는 제거하지 않는다.

변경한 패키지의 승인된 인계 해시와 릴리스 입력 해시를 대조·기록하고 실제 회귀 입력을 갱신한다. `pnpm run verify`로 공통 정적 검사·전체 회귀·두 앱 번들·player 경계를 순서대로 확인한다. 교정 가능한 패키지 전체 해시를 테스트에 고정하는 대신 음악적 의미와 source/정본 일치·왕복 보존을 검사한다. 해시·검증 결과는 관련 문서와 함께 커밋·검토 대상에 포함하되, Git에서 제외된 원본·패키지 파일을 새로 추적하지 않는다. 검증된 패키지는 main 빌드에서도 같은 바이트로 사용한다. CI의 portable 검사는 이 로컬 자산 검증을 대신하지 않는다.

<a id="sites-publication--발행-순서"></a>

### 발행 순서

사용자가 요청한 경우에만 commit, push, 공개 발행을 수행한다. 변경 범위와 기존 dirty 파일을 확인하고 이번 릴리스에 필요한 검사를 먼저 끝낸다.

전체 릴리스에서는 작성 세션·작업 주제와 관계없이 이 프로젝트의 [모든 미커밋 변경과 잔여 브랜치 변경](../../.agents/skills/release-drum-practice/SKILL.md#release-git-scope)을 검토·커밋·PR로 main에 통합한다. 발행과 결과 문서 반영 뒤에는 [최종 상태 기준](../../.agents/skills/release-drum-practice/SKILL.md#release-final-state)으로 로컬/GitHub main·공개 산출물 일치, 미커밋 변경 없음, main 외 로컬·원격 브랜치 정리를 확인한다. Git 추적 제외 자료·명시적 제외와 미완료 항목은 구분해 보고한다.

전체 릴리스의 변경 검토·작업 브랜치·PR 검토·CI·main 병합·공개 확인·브랜치 정리는 [프로젝트 릴리스 스킬](../../.agents/skills/release-drum-practice/SKILL.md)을 따른다. [코드·문서 정리](../../.agents/skills/release-drum-practice/SKILL.md#release-code-cleanup)에서 변경 전후의 실제 사용처와 남은 코드를 검토한다. 영향받는 테스트·정적 검사·CI도 [검사 정리 절차](../../.agents/skills/release-drum-practice/SKILL.md#release-check-cleanup)에 따라 정리한 뒤, 최종 코드에 개정된 기준의 lint 등 필수 검사를 수행한다. [작업 파일 정리](../../.agents/skills/release-drum-practice/SKILL.md#release-workfile-cleanup)는 발행·공개 확인 후에 수행한다. 코드·문서·검사의 정리 결과, 보존·보류 이유, 남은 검증 공백과 검사 결과를 발행 기록에 함께 남긴다. 패키지 변경은 위 [커밋 전 준비](#커밋-전-패키지-준비)에서 끝낸다. 아래는 검증된 main 코드와 준비된 자산에 적용하는 빌드·Sites 발행 세부 절차다.

1. `src/app-versions.json`과 [버전 정책](../reference/engineering/release.md#app-versions--앱-공통-버전)을 확인한다. 문서만 변경하면 버전을 올리지 않는다.
2. 병합된 main의 CI를 확인하고, 앞서 통과한 로컬 검사의 코드·의존성·설정·패키지/회귀 입력·실행 환경이 같은지 대조한다. 같으면 정적 검사·테스트 결과를 근거와 함께 재사용한다. 변경이 있으면 영향받는 검사를 다시 수행하고 필요한 경우 전체 검사를 확대한다. 검증된 main의 생성 파일을 준비하고 두 앱을 새로 빌드한다. 아래는 검사 재사용이 확인된 경우의 빌드 명령이며, 단독 성공을 전체 검증으로 보고하지 않는다.

   ```sh
   pnpm run generate
   pnpm run bundle:apps
   ```

   발행 단계에서 패키지를 다시 정리하거나 해시·회귀 입력을 수정하지 않는다. 입력 변경이 필요하면 [커밋 전 준비](#커밋-전-패키지-준비)와 관련 커밋·PR/CI·main 검증을 거쳐 새 후보를 확정한다. 입력이 같은 상태에서 `test:drum`·`build:apps`·`check:playback`을 추가로 반복하지 않는다.

3. **사본 준비 전에** 현재 Sites 스킬과 노출된 도구 계약을 읽고 기존 Site를 조회한다. 같은 Site의 소스 접근 권한으로 source helper의 열기 단계를 실행해 기존 저장소를 연다. 열기에는 `archivePath`를 지정하지 않으며 반환된 `checkout_path`를 이후 준비·설치·빌드 대상으로 사용한다. 프로젝트 ID·공개 범위·경로와 별도 수정 유무를 확인하고 기존 변경을 덮어쓰지 않는다. 이 단계는 기존 소스 확인이며, 새 소스의 push·버전 저장·발행은 준비와 빌드 후에 수행한다.

4. 정본의 `scripts/release/prepare-sites.mjs`로 확인한 checkout에 사본을 준비한다. pnpm이 검증된 커밋의 `config/shared-catalog.yaml` 사본과 lockfile을 해석하고 hosting 전용 manifest·잠금 파일·설정을 내보낸다. 개인 중앙 YAML을 이 단계에서 다시 동기화하지 않는다. 생성 사본에서 D1 바인딩·Drizzle 설정과 마이그레이션을 제거하며, SQL 기록은 내보내지 않는다. 원격 DB를 변경하거나 삭제하는 단계는 없다. 사본에서 의존성 버전을 독립 수정하지 않는다.

   pnpm 버전 pin을 포함하는 잠금 파일 생성은 캐시를 우선 사용하되, 빠진 공급망 검사 메타데이터는 레지스트리에서 읽을 수 있다. 완전 오프라인을 강제해 검사를 실패시키거나 보안 정책을 끄지 않는다. 생성 후 아래의 frozen 설치로 manifest·lockfile 일치를 확인한다.

   다음은 반환된 checkout이 기본 경로 `deployment/sites/`인 경우다. 다른 경로를 반환했으면 세 명령의 대상을 모두 그 경로로 바꾼다.

   ```sh
   node scripts/release/prepare-sites.mjs deployment/sites
   pnpm --dir deployment/sites install --frozen-lockfile
   pnpm --dir deployment/sites run build
   ```

5. `source-parity.json` 기준으로 `dist/player`, 사본의 `player-assets`, Worker의 `dist/client` 정적 파일을 대조한다. `index.html`은 준비 스크립트가 `player.html`에서 만드는 진입점이다.
6. 같은 소스 열기 결과를 Sites helper에 전달해 준비된 소스를 커밋·push하고 해당 소스의 배포 아카이브를 만든다. 입력이 그대로인 성공한 검사·빌드는 `commands`에 다시 넣지 않으며, 남은 명령이 없으면 빈 목록을 사용한다. 현재 Sites 계약에 따라 반환된 소스 SHA와 아카이브로 기존 프로젝트에 버전을 저장·발행한다. 새 사이트를 만들거나 공개 범위를 확대하지 않는다. Git push만으로 Sites 발행이 완료되지는 않는다.
7. 배포가 `succeeded`인지 확인한 뒤 공개 HTML·주요 JS/CSS·분석/변환 Worker와 `.drumscore` 다운로드, 폐기된 API의 404를 확인한다. 기존 값을 바꾸는 smoke 요청은 피하고, 쓰기 검증이 필요하면 별도 시험 해시와 처리 범위를 정한다.
8. 구현 커밋, push, Sites 소스/버전/배포 ID, 빌드 식별자, HTTP/API 결과와 수행한 화면 검수의 환경·결과를 기록한다. 재사용한 검사 결과와 이번에 실행한 검사를 구분한다. iOS·iPadOS 실기기·시뮬레이터 검증은 릴리스 범위에서 제외하고, 사용자가 별도로 지시해 수행한 경우에만 해당 결과를 추가한다.

DB 관련 작업이 포함되면 [저장·마이그레이션 경계](../reference/engineering/security.md)를 확인한 뒤 별도 요청 범위를 대조한다.

<a id="sites-publication--오픈소스-고지-생성과-확인"></a>

### 오픈소스 고지 생성과 확인

설치된 lockfile의 의존성을 준비한 뒤 기존 `pnpm run generate`가 고지를 생성한다. 원문 누락이면 빌드 실패를 해결하고, `pnpm run check:docs`는 생성 UI 문서·파일 링크·Markdown 문단 앵커를 검사하므로 라이선스 검토를 대신하지 않는다. 공개 발행은 [발행 절차](release.md#sites-publication--sites-발행-절차)의 요청·확인 범위에서만 수행한다.
