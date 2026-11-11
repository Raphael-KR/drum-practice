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
- 서버: `server/player-worker.ts`가 HTML/보안 헤더와 정적 자산을 전달한다. `hosting/`은 DB 바인딩 없이 Worker와 player 자산만 준비한다. 보존 SQL은 배포 입력·마이그레이션 복사·빌드번호 계산에서 제외한다. 이전 생성 사본의 DB 설정은 준비 단계에서 제거하며 원격 DB는 조작하지 않는다.
- 파일 해시·곡명·가수·분석 결과는 브라우저 내부에서만 처리한다. 자세한 필드·제한은 [음원 연습](../product/audio-practice.md#audio-practice--음원-연습)을 따른다.

사용자가 요청한 단계만 commit·push·PR·merge·발행·브랜치 정리한다. 과거 실행 기록을 현재 릴리스 절차로 대신하지 않는다. 전체 흐름은 [릴리스 스킬](../../../.agents/skills/release-drum-practice/SKILL.md)을 따른다.

전체 릴리스의 기본 범위는 이 프로젝트의 모든 미커밋 변경과 잔여 브랜치의 고유 변경이다. Git 추적 제외 자료·비밀정보·명시적 제외는 포함하지 않는다. 검토·검증·커밋·PR 병합 후 로컬/GitHub main을 일치시키고 같은 제품 소스의 player를 발행하며, 고유 변경을 main에 보존한 뒤 main 외 로컬·원격 브랜치를 모두 정리한다. Sites 소스 SHA는 정본 Git SHA와 별개이므로 [최종 상태 기준](../../../.agents/skills/release-drum-practice/SKILL.md#release-final-state)에 따라 빌드 입력과 공개 파일로 일치를 확인한다. 미반영 변경이나 잔여 브랜치가 있으면 예외·미완료 범위를 보고한다.

<a id="deployment-rules--자산과-검증"></a>

### 자산과 검증

코드 릴리스는 [검사 카탈로그](check-catalog.md)의 **공통 필수 검사 + 변경 영향별 선택 검사**를 적용한다. 공통 `verify`의 정적 검사·전체 회귀·두 앱 빌드를 유지하고, 화면·기능·성능·악보/제작 도구 검증은 해당 조건에 맞는 범위만 추가한다. 문서만 변경한 후속 커밋은 문서·링크·앵커·diff 검사를 적용하며 앱 빌드·버전 갱신·재발행을 하지 않는다.

릴리스 기록에는 항목별 선택 이유·명령·환경·부수 효과/허가와 `실행/결과 재사용/비대상/보류`를 남긴다. 기존 성공은 [입력 동일성 기준](verification.md#verification-rules--결과-재사용)에 따라 재사용하고, PR/main CI·발행 후보 빌드·Sites 패키징과 공개 읽기 확인은 각 단계의 실제 입력/결과를 확인한다. 필요한 검사가 보류되면 해당 단계는 미완료다. 실계정 QA·운영 데이터 쓰기는 일반 릴리스에 포함하지 않는다.

배포 파일을 checkout 외부의 심볼릭 링크로 대체하지 않는다. 배포에 필요한 실제 내용을 Git 빌드 입력에 포함한다. hosting은 설정 원본이며 실제 배포 의존성은 deployment/sites에 필요할 때 준비한다. 기존 사본을 교체하기 전에 프로젝트 ID·경로·별도 수정 유무를 확인한다.

HTML 진입점은 Worker가 반환한다. 준비 스크립트가 player HTML을 `server/player-document.ts`에 포함하고 finalize가 해시 대조 뒤 `dist/client/index.html`·`player.html`을 제외한다. 나머지 정적 자산의 바이트는 유지한다. 전체 정적 응답이 문서와 같은 보안 헤더를 갖는다고 확대하지 않는다.

배포 응답 `succeeded`와 공개 파일 제공을 구분한다. 정본/배포 사본/Worker 정적 파일을 대조하고 공개 HTML·JS/CSS·Worker·.drumscore·폐기 API 404를 실제 확인한 범위로 기록한다. 네트워크·쓰기·시험의 권한은 현행 전역·프로젝트 지침을 따른다. 브라우저 보관함은 로컬/공개 주소 간 자동 이전되지 않는다.
