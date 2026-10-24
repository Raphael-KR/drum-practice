# 0.8.18 릴리스 계획

- 목표: 중앙 버전 YAML 분리 변경을 검증한 main으로 발행한다.
- 범위: 중앙 목록 사본·동기화 도구·pnpm 설정·CI/빌드 입력·관련 문서, 두 앱 0.8.17 → 0.8.18.
- 완료 조건: 로컬 전체 검사·PR/main CI, main의 player 발행·공개 파일 확인, 결과 기록·병합 브랜치 정리.
- 제외 범위: 다른 프로젝트 전환, 라이브러리 버전 변경, 앱 기능·저장/수록 자료 변경, editor 공개.
- 검증: 중앙/사본 일치·frozen 설치·audit·lint/서식/세 타입/문서/구조·전체 회귀·두 앱/Sites 빌드·산출물 대조·공개 읽기 smoke.

## 변경 검토와 버전 판단

[중앙 YAML 분리 기록](../records/archive/shared-catalog-20261025.md)과 [ADR-0028](../decisions/0028-shared-dependency-store-and-catalog.md)을 따른다. 기존 기능의 개발·발행 재현성을 개선하며 새 사용자 기능·저장 계약 변경이 없으므로 patch를 선택한다. 공용 개발 패키지 버전과 직접 의존성 25개 버전은 유지한다.

개인 중앙 파일은 `/Users/raphael/Library/Preferences/pnpm/shared-catalog.yaml`이며 Git에는 `config/shared-catalog.yaml` 사본과 lockfile을 보관한다. 일반 설치·CI·Sites 준비는 개인 파일을 읽지 않는다. 버전 외 앱 소스·수록 자료·기존 테스트를 보존한다. 새 동기화 스크립트는 pnpm의 설정 파서를 재사용하며 기존 lint/서식 검사에 포함된다.

## 실행 순서

1. main `94f7c8e0b90924fe4ed422b99649568df943f40d`에서 `codex/release-0.8.18`로 기존 미커밋 변경을 보존한다.
2. 두 앱 버전·빌드번호와 변경 기록을 갱신하고 전체 로컬 검사를 실행한다.
3. 최종 diff 자체 검토 후 커밋·push·Draft PR을 만들고 최신 head CI·필수 승인 조건을 확인해 ready·merge한다.
4. 병합 main의 CI·소스/자료 동일성을 확인하고 main 코드로 두 앱을 빌드한다. 기존 Sites checkout을 공식 helper로 열고 player만 준비·검증·발행한다.
5. 공개 HTML·보안 헤더·정적 파일·폐기 API를 확인한다. 결과 문서를 별도 PR로 반영하고 이번에 병합된 브랜치만 정리한다.

근거는 `.tmp/release-0.8.18/`에 보존한다. UI 변경은 없으므로 새 화면·청취·iPad 검증을 수행했다고 표현하지 않는다. 자체 검토와 독립 승인, 정적 공개 파일 일치와 실제 재생 확인을 구분한다.

## 진행 결과

- macOS arm64 / Node26.12.1 / pnpm12.15.0, 빌드 `8c4041613211`에서 frozen 설치·중앙/사본 일치·audit0건·전체 `pnpm run verify`가 통과했다. lint·434개 서식·세 타입·문서/구조·129파일767테스트·두 앱 빌드/경계를 포함한다.
- 자체 검토에서 새 config/도구의 책임·명명·pnpm 파서 재사용·서식/lint 포함·빌드 해시 포함과 CI의 개인 경로 비의존을 확인했다. 기존 저장/앱 소스는 버전 외 동일하고 lockfile·수록6곡·기존 검사 자료 해시가 유지됐다. 검토를 독립 승인으로 표현하지 않는다.
- GitHub main protection은 미설정, 적용 branch rules는 빈 목록이다. 최신 head/main CI 통과를 확인한 뒤 병합·발행한다. 기존 OSMD/Node 경고는 숨기지 않았다.
- PR·main·Sites·공개 결과는 수행 후 [릴리스 기록](../records/releases.md)에 추가한다.
