# 0.8.17 릴리스 완료 기록

- 목표: pnpm 공통 저장소·중앙 버전 카탈로그 전환을 검증한 main으로 발행한다.
- 범위: 루트/hosting 의존성·개발/검사/CI/Sites 준비 절차, 관련 문서, 두 앱 버전 0.8.16 → 0.8.17.
- 완료 조건: 전체 로컬 검사와 PR/main CI 통과, 검증한 main의 player만 기존 공개 Site에 발행, 공개 파일 일치 확인, 결과 문서 반영과 병합 브랜치 정리.
- 제외 범위: 다른 프로젝트 전환, 앱 기능·저장 형식·수록 자료 변경, editor 공개, 무관한 파일/브랜치 정리.
- 검증: frozen 설치·audit·lint/서식/세 타입/구조/문서·전체 미디어 회귀·두 앱 및 Sites 빌드, 코드/자료 동일성, 공개 HTML/보안 헤더/정적 파일/폐기 API 확인.

문서 역할: **완료된 실행 기록**. 아래 목표와 계획은 당시 승인 범위다. 제품 main `7894821a0e894b5161be7d833cabb091f69f2c6a`·빌드 `e4d576e55da5`로 player만 Sites 버전87에 발행했다. [발행 식별자와 검증](../releases.md#release-0-8-17-20261025)을 따른다.

## 변경 판단

기능 추가나 저장 계약 변경 없이 패키지 공유·버전 관리·빌드 경로를 개선하므로 patch를 선택한다. `src/app-versions.json`의 두 앱만 0.8.17로 올리고 공용 개발 패키지 버전은 유지한다.

[전환 완료 기록](pnpm-shared-dependencies-20261025.md)과 [ADR-0028](../../decisions/0028-shared-dependency-store-and-catalog.md)을 기준으로 기존 직접 의존성 버전·보안 override·라이선스 고지·수록 파일을 보존한다. 잠금 파일/manifest 일치 검사는 `pnpm install --frozen-lockfile`로 로컬과 CI에서 재사용한다.

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
- 기존 OSMD 청크/크기 경고와 Node 실험 기능 경고는 유지한다. PR·main·Sites·공개 확인은 아직 실행 전이며 결과는 [릴리스 기록](../releases.md)에 남긴다.


## 최종 결과

- 구현 `0f8060c114d18da04b20e3d44f51e8b0e8e0f36c`, [PR #16](https://github.com/Raphael-KR/drum-practice/pull/16), 제품 main `7894821a0e894b5161be7d833cabb091f69f2c6a`. PR head/main tree `67229a81f92f930bb663c6a5cc1bf3bcff69977c`와 검사/자료 147파일 해시가 같아 전체 로컬 결과를 재사용했다. main에서 두 앱을 다시 빌드했다.
- [PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/40109368788), [push CI](https://github.com/Raphael-KR/drum-practice/actions/runs/40109343657), [병합 main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/40109460041)가 성공했다. Linux Node22.23.3/pnpm12.15.0에서 고정 설치·공통 검사·portable83파일422테스트를 통과했다. macOS Node26의 전체129파일767테스트/두 앱 빌드와 구분한다. 검토는 Codex 자체 검토다.
- 기존 Sites checkout을 공식 helper로 열고 canonical 준비 스크립트·공식 설치/빌드 helper로 독립 frozen 설치와 빌드를 확인했다. 원래 npm node_modules는 `.tmp/release-0.8.17/pre-pnpm-sites-node_modules`에 보존했다. 설치된 보안 override esbuild0.25.12/Undici7.30.1 유지, Sites audit0건, player45파일 세 곳 해시 일치와 editor 미포함을 확인했다.
- Sites 소스 `485f55dc9e8d069849c14f01f80851cacad837b9`, 버전87·배포 `appgdep_6adcd691cdf48191b961785255a5d07f`가 **2026-10-25 01:02:42 KST**에 succeeded다. 기존 Site ID·public audience·공개 주소를 유지했다.
- 공개 읽기49항목을 통과했다. HTML3경로의 최신 번들/보안 헤더, 정적43파일 전체 SHA256(수록6곡·폰트·renderer/Worker 포함), 폐기 API3경로404를 확인했다. 공개 재생·청취·iPad·Safari 장기 안정성은 이번 검증에 포함하지 않는다.
- 기존 OSMD 청크/크기·Node 경고, GitHub Actions checkout/setup-node v4의 Node20→24 이행 안내는 비차단 경고다. 검사 규칙·기대값을 끄지 않았다. Sites 설치 버전 확인용 보조 명령은 drizzle-kit의 package.json export 제한 때문에 한 번 실패했고 실제 패키지 경로 기준으로 재조회해 확인했다. 앱/빌드 오류가 아니다.
- 결과 기록은 별도 문서 PR로 반영하며 제품 소스·버전·발행물을 바꾸지 않는다. 이번에 병합된 브랜치만 정리하고 최종 main/원격·clean 상태와 CI·배포·공개 결과는 `.tmp/release-0.8.17/receipt.json`에 확인한다.
