# 프로젝트 청소와 문서 정리 — 2026-10-27~28

- 목표: 완료된 검증의 설치·빌드 복사본과 오래된 배포 압축본을 정리하고 문서 진입점과 완료 상태를 맞춘다.
- 범위: 프로젝트 내부 `.tmp/`의 재생성 가능한 설치·빌드 출력, `local-archives/releases/`의 0.8.9~0.8.17 압축본, 문서 안내·기록 목록·완료 계획 안내.
- 완료 조건: 지정 산출물만 제거하고 최신 0.8.18 묶음·현재 개발/배포 환경·원본·검증 증거와 기존 안내문 커밋을 보존한다.
- 제외: 앱 코드·버전·의존성 버전 변경, 공통 pnpm store·중앙 YAML 정리, Git 브랜치 삭제·커밋·푸시·발행, 서버 재시작.
- 검증: 삭제 전 목록·크기·사용 여부 확인, 보존 파일 해시 대조, 문서 상대 링크·변경 문단 앵커·기록 목록·diff 공백 검사.

## 기준과 보존 범위

시작 브랜치는 `codex/shared-catalog-guide`, HEAD는 `1b53be6`이며 작업 트리는 깨끗했다. 이전 사용자의 캐시·구형 빌드·오래된 배포 아카이브 삭제 승인 범위 안에서 수행한다. Git 제외 여부만으로 삭제 대상을 정하지 않는다.

- 최신 릴리스 `local-archives/releases/release-0.8.18.tar.gz`, 현재 `dist/editor/`·`dist/player/`, `deployment/sites/`, 활성 의존성은 유지한다.
- `data/`·`public/`·`local-libraries/`의 원본, `0.8.13-package-inputs/`의 원래 패키지, Git 이력을 가진 `sites-upload-failed-0.8.13/`는 유지한다.
- `.tmp/`의 로그·캡처·검사 결과·해시·소스 사본·이전 lockfile은 보존한다. 임시 설치본 안의 패키지 파일과 빌드 복사본만 대상으로 한다.
- pnpm store를 prune하거나 프로젝트 밖 중앙 YAML을 변경하지 않는다. 다른 프로젝트·사용자 브라우저 데이터·실행 중 프로세스도 변경하지 않는다.

조사는 2026-10-27 KST에 시작했고 삭제와 최종 확인은 10월 28일에 수행했다. 상세 실행 목록과 보존 대조는 `.tmp/project-cleanup-20261027/`에 기록한다.

## 정리한 산출물

삭제 전에 대상에 열린 파일이 없고, 현재 설치·소스가 대상에 연결되어 있지 않음을 확인했다. 임시 검증 폴더 사이의 구형 `node_modules` 링크 3개는 대상 설치본과 함께 삭제했다. 소스·Git 이력이 있는 폴더 전체를 지우지 않았다.

| 분류 | 대상 경로 수 | 파일·링크 수 | 논리 크기 합계 |
| --- | ---: | ---: | ---: |
| 임시 의존성 설치본 | 10 | 55,359 | 3,181,836,897바이트 |
| 임시 `dist`·`player-assets` | 16 | 735 | 897,376,324바이트 |
| 구형 설치본 연결 | 3 | 3 | 280바이트 |
| 0.8.9~0.8.17 배포 압축본 | 9 | 9 | 447,776,742바이트 |
| 합계 | 38 | 56,106 | 4,526,990,243바이트(약 4.22GiB) |

위 크기는 삭제된 파일·링크의 논리 크기다. pnpm hard link와 APFS 공유 블록을 고려한 실제 디스크 회수량으로 해석하지 않는다.

| 상위 위치 | 삭제한 하위 경로 |
| --- | --- |
| `.tmp/vite-security-20261024/` | `sites-build/`와 `sites-build-final/`의 `node_modules`, `dist`, `player-assets` |
| `.tmp/dependency-updates-20261024/` | `sites-build/`의 `node_modules` 링크, `dist`, `player-assets` |
| `.tmp/vite8-node26-20261024/` | `sites-build/`의 `node_modules` 링크, `dist`, `player-assets` |
| `.tmp/vitest-security-20261024/` | `sites-build/`의 `node_modules`, `dist`, `player-assets` |
| `.tmp/pnpm-migration-20261024/` | `npm-root-node_modules`, `npm-hosting-node_modules`, `hosting-export/node_modules`, `sites/`의 `node_modules`, `dist`, `player-assets` |
| `.tmp/shared-catalog-20261025/` | `ci-install/node_modules`, `ci-install/hosting/node_modules`, `sites/`의 `node_modules`, `dist`, `player-assets` |
| `.tmp/quality-hosting-build/` | `dist`, `player-assets` |
| `.tmp/release-0.8.17/` | `pre-pnpm-sites-node_modules` |
| `local-archives/releases/` | `release-0.8.9.tar.gz`부터 `release-0.8.17.tar.gz`까지 9개 |

남겨 둔 임시 검증 폴더의 manifest·lockfile·소스·검사 로그·해시는 당시 입력과 결과의 기록이다. 검증을 다시 실행하려면 필요한 의존성과 빌드 출력을 새로 준비해야 한다. 과거 발행 기록의 아카이브 해시를 변경하거나 삭제하지 않았으며, 현재 보존 상태는 [발행 기록](../releases.md)에 별도로 표시했다.

## 문서 정리

- 루트 README의 문서 시작점을 과거 재구성 기록에서 `docs/README.md`로 수정했다.
- 완료 기록 목록을 릴리스·의존성, 재생·조판, 구조·문서 정리로 나눴다. 빠져 있던 0.8.14·0.8.15·0.8.17 릴리스, pnpm 전환, 성능·메모리 기록 6개를 연결했다.
- `docs/plans/runtime-memory-20261024.md`의 당시 계획 다섯 항목을 [메모리 기록](runtime-memory-20261024.md#작업-당시-계획)으로 그대로 옮기고 이전 주소는 완료 안내로 남겼다. 구현 당시 범위와 후속 0.8.15 발행을 구분하고 RSS·장기 안정성의 미확정은 유지했다.
- 문서 안내에서 완료 계획의 이전 주소와 진행 중 계획을 구분했다. 기존 문서 주소·앵커·기계 입력은 삭제하거나 이동하지 않았다.

## 검증 결과

삭제 직후 보존 대상 4,473개 파일의 SHA256이 모두 같고 대상 38개 경로가 없는 것을 확인했다. Git 내부와 의존성 설치 파일 전체를 해시로 대조한 것은 아니며, 해당 경로는 삭제 대상에서 제외하고 활성 연결을 확인했다.

최신 `release-0.8.18.tar.gz`의 SHA256은 `338a88d40c068668ceb501c803bd47a10f2f42a8770075a78a6581a8516a857a`로 기존 발행 기록과 같다.

- 최종 해시 대조에서 이번 문서 9개 외의 4,464개 파일은 변경되지 않았다. 소스·설정·버전·lockfile·원본·현재 빌드·기존 검증 증거가 포함된다. `codex/shared-catalog-guide` HEAD `1b53be6`과 별도 Sites checkout의 깨끗한 상태를 유지했다.
- `pnpm run check:docs`: 생성 UI 문서 일치, Markdown 141개의 상대 파일 링크 검사 통과. 외부 URL·절대경로·앱 실행 검증을 뜻하지 않는다.
- 추가 대조: 새 상대 문단 링크 4개, 기존 문단 앵커 유지, 완료 기록 26개의 목록 포함, 계획 원문 다섯 항목·기존 메모리 검증 본문 보존을 확인했다. `git diff --check`도 통과했다.
- 앱 코드·설정·현재 설치를 바꾸지 않아 전체 앱 테스트·빌드·GUI·공개 사이트 검사는 다시 실행하지 않았다. 두 앱 0.8.18을 유지하며 커밋·푸시·발행은 하지 않았다.

실행 근거는 `.tmp/project-cleanup-20261027/`의 `before.json`(정확한 삭제 경로·크기·구형 압축본 해시·보존 해시), `removed.json`, `preservation.json`, `docs-check.log`, `documentation-check.json`이다. 재생성 가능한 산출물 정리와 과거 증거 보존을 구분하며, 이 기록을 상시 자동 삭제 정책으로 사용하지 않는다.
