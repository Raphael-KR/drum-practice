# 0.8.17 릴리스 계획

- 목표: pnpm 공통 저장소·중앙 버전 카탈로그 전환을 검증한 main으로 발행한다.
- 범위: 루트/hosting 의존성·개발/검사/CI/Sites 준비 절차, 관련 문서, 두 앱 버전 0.8.16 → 0.8.17.
- 완료 조건: 전체 로컬 검사와 PR/main CI 통과, 검증한 main의 player만 기존 공개 Site에 발행, 공개 파일 일치 확인, 결과 문서 반영과 병합 브랜치 정리.
- 제외 범위: 다른 프로젝트 전환, 앱 기능·저장 형식·수록 자료 변경, editor 공개, 무관한 파일/브랜치 정리.
- 검증: frozen 설치·audit·lint/서식/세 타입/구조/문서·전체 미디어 회귀·두 앱 및 Sites 빌드, 코드/자료 동일성, 공개 HTML/보안 헤더/정적 파일/폐기 API 확인.

## 변경 판단

기능 추가나 저장 계약 변경 없이 패키지 공유·버전 관리·빌드 경로를 개선하므로 patch를 선택한다. `src/app-versions.json`의 두 앱만 0.8.17로 올리고 공용 개발 패키지 버전은 유지한다.

[전환 완료 기록](../records/archive/pnpm-shared-dependencies-20261025.md)과 [ADR-0028](../decisions/0028-shared-dependency-store-and-catalog.md)을 기준으로 기존 직접 의존성 버전·보안 override·라이선스 고지·수록 파일을 보존한다. 잠금 파일/manifest 일치 검사는 `pnpm install --frozen-lockfile`로 로컬과 CI에서 재사용한다.

## 순서와 증거

1. 기존 main `b5bc6977f68540b02eec664b742aa59e87803611`에서 `codex/release-0.8.17`을 만들고 변경 범위를 검토한다.
2. 두 앱 버전·빌드번호를 갱신하고 `pnpm run verify` 및 고정 설치/audit를 실행한다.
3. 자체 diff 검토를 기록하고 작업 브랜치를 커밋·push한다. Draft PR의 최신 head CI를 확인한 뒤 ready·merge한다. 자체 검토는 독립 검토와 구분한다.
4. main CI와 검증 입력의 동일성을 확인한 뒤 main으로 두 앱을 빌드한다. 기존 Site의 clean checkout을 공식 helper로 연 뒤 canonical player/hosting을 준비하고 독립 설치·빌드·파일 일치를 검증한다.
5. Sites 소스 push·버전 저장·공개 배포·읽기 smoke를 각각 확인한다. 결과 문서는 별도 PR로 반영하고 이번에 병합된 브랜치만 정리한다.

근거는 `.tmp/release-0.8.17/`에 남긴다. UI 소스 변경이 없으므로 직전 Safari 두 앱 초기화·실제 패키지 렌더/음원 디코딩 근거는 버전 외 소스와 검사 자료의 동일성 확인 후 재사용한다. 공개 정적 파일 검사를 실제 청취·장기 재생·iPad 검증으로 확대하지 않는다.

## 진행 상태

- macOS arm64 / Node 26.12.1 / pnpm 12.15.0에서 frozen 설치와 audit(0건), `pnpm run verify`가 통과했다. lint·서식 432파일·세 타입·구조/문서·전체 129파일 767테스트·두 앱 빌드/경계를 포함한다. 소스 빌드는 `e4d576e55da5`다.
- 이전 Safari 검증 소스와 버전 외 입력이 같음을 빌드 입력 374파일의 가상 이전 버전 해시 `215e444fa5d3`으로 확인했다. 테스트/자료 147파일과 수록 6곡을 기록했고 직접 의존성 26개 및 Vite 실경로 공유를 대조했다.
- 자체 검토에서 앱/저장/재생 소스는 버전 파일 외 변경이 없고 pnpm 선언·고지·Sites 내보내기·CI가 일관됨을 확인했다. GitHub의 main branch protection/rules 응답상 추가 필수 승인 규칙은 없으며 CI 통과 후 merge한다.
- 기존 OSMD 청크/크기 경고와 Node 실험 기능 경고는 유지한다. PR·main·Sites·공개 확인은 아직 실행 전이며 결과는 [릴리스 기록](../records/releases.md)에 남긴다.
