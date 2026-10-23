# 버전과 공개 범위

문서 역할: **현행 Rule**. 현재 요구·계약과 지원 한계를 다룬다. [전체 정본](../../RULES-INDEX.md), [실행 안내](../../README.md), [결정 이력](../../decisions/README.md)을 함께 참고한다.

<a id="app-versions--앱-공통-버전"></a>

## 앱 공통 버전

결정 근거: [ADR-0025](../../decisions/0025-shared-app-release-version.md). 실행: [절차](../../how-to/release.md#app-versioning--앱-버전-갱신-절차).

앱 표시 버전 정본은 [src/app-versions.json](../../../src/app-versions.json)이다. `package.json`은 공용 개발 패키지 버전으로 구분한다. 두 앱은 같은 소스 릴리스 번호로 맞추는 것이 기본이며 한쪽 전용 변경은 변경 기록에 대상을 명시한다. 독립 릴리스가 필요한 예외만 따로 판단한다.

<a id="app-versions--증가-기준과-시점"></a>

### 증가 기준과 시점

- 독립된 새 사용자 기능·흐름은 minor, 기존 기능의 완성·보완·오류·화면/조작 개선은 patch다. 0.x에서도 patch를 기계적으로 선택하지 않는다. 호환성을 깨는 변경·1.0 전환은 영향과 출시 범위를 먼저 판단한다.
- 사용자가 커밋을 요청했을 때 앱 변경 버전을 함께 올린다. 별도 버전 정정·동기화 요청은 해당 범위를 따른다. 문서만 고칠 때는 앱 버전을 유지한다.
- 앱 수정 시 `node scripts/build/build-info.mjs`로 소스 빌드 식별자를 갱신한다. 문서만 수정하면 빌드번호를 갱신하지 않는다.
- 공통 버전은 같은 소스 릴리스 기준이라는 뜻이다. 두 앱 검증 완료·공개 발행을 뜻하지 않으며 제작기는 로컬 전용이다.
- 버전 상승·검사·commit·push·PR·merge·Sites 발행·공개 확인은 별도 상태로 기록한다. 자동 커밋·푸시·발행하지 않는다.

<a id="app-versions--정정-번호와-식별자-보존"></a>

### 정정 번호와 식별자 보존

문서의 릴리스 제목과 앱 표시에는 정정 번호를 사용한다. 과거 표시 번호는 배포 추적용이다. SHA·배포 ID·빌드 식별자·원본 로그 경로와 의존성 버전은 번호 정정으로 바꾸지 않는다. 정정 대응표와 개별 발행은 [릴리스 사실 기록](../../records/releases.md#app-version-history--앱-릴리스-번호와-정정-기록)에 보존한다.

<a id="deployment-rules--배포-범위와-소스-권위"></a>

## 배포 범위와 소스 권위

문서 역할: **현행 Rule**. [ADR-0020](../../decisions/0020-local-editor-and-public-player.md), [발행 절차](../../how-to/release.md#sites-publication--sites-발행-절차), [발행 기록](../../records/releases.md#sites-publication-history--sites-발행공개-확인-기록)을 구분한다.

<a id="deployment-rules--정본과-공개-경계"></a>

### 정본과 공개 경계

- 개발 정본: `/Users/raphael/Playground/drum-practice`
- 배포 사본: `deployment/sites/` — 제품 소스를 독립 수정하지 않는다.
- 기존 Sites 프로젝트: `appgprj_6ab0790baa048191aaee49f58c1ffe7b`
- 공개 주소: [드럼연습실](https://drum-practice-studio.dgkma.chatgpt.site)
- 정적 앱 입력: `dist/player/`. `dist/editor/`나 원본 미디어 폴더 전체를 발행하지 않는다.
- 서버: `server/player-worker.ts`가 HTML/보안 헤더와 정적 자산을 전달한다. `hosting/`의 D1 바인딩은 과거 분석 테이블 삭제 마이그레이션 적용을 위해서만 유지한다.
- 파일 해시·곡명·가수·분석 결과는 브라우저 내부에서만 처리한다. 자세한 필드·제한은 [음원 연습](../product/audio-practice.md#audio-practice--음원-연습)을 따른다.

사용자가 요청한 단계만 commit·push·PR·merge·발행·브랜치 정리한다. 과거 실행 기록을 현재 릴리스 절차로 대신하지 않는다. 전체 흐름은 [릴리스 스킬](../../../.agents/skills/release-drum-practice/SKILL.md)을 따른다.

<a id="deployment-rules--자산과-검증"></a>

### 자산과 검증

배포 파일을 checkout 외부의 심볼릭 링크로 대체하지 않는다. 배포에 필요한 실제 내용을 Git 빌드 입력에 포함한다. hosting은 설정 원본이며 실제 배포 의존성은 deployment/sites에 필요할 때 준비한다. 기존 사본을 교체하기 전에 프로젝트 ID·경로·별도 수정 유무를 확인한다.

HTML 진입점은 Worker가 반환한다. 준비 스크립트가 player HTML을 `server/player-document.ts`에 포함하고 finalize가 해시 대조 뒤 `dist/client/index.html`·`player.html`을 제외한다. 나머지 정적 자산의 바이트는 유지한다. 전체 정적 응답이 문서와 같은 보안 헤더를 갖는다고 확대하지 않는다.

배포 응답 `succeeded`와 공개 파일 제공을 구분한다. 정본/배포 사본/Worker 정적 파일을 대조하고 공개 HTML·JS/CSS·Worker·.drumscore·폐기 API 404를 실제 확인한 범위로 기록한다. 네트워크·쓰기·시험의 권한은 현행 전역·프로젝트 지침을 따른다. 브라우저 보관함은 로컬/공개 주소 간 자동 이전되지 않는다.
