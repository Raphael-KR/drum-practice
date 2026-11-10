# 0.11.0 릴리스 후 프로젝트 청소 — 2026-11-10

- 목표: 릴리스가 끝난 뒤 불필요해진 설치·빌드 복사본과 캐시를 정리한다.
- 범위: 사용하지 않는 프로젝트 내부 임시 설치본, 구형 빌드, 0.8.18~0.10.8 배포 압축본, Python·포매터 캐시와 Finder 메타데이터.
- 완료 조건: 지정한 산출물만 제거하고 최신 0.11.0 릴리스·원본·검증 기록·현재 실행 환경을 보존한다.
- 제외: 앱 코드·버전·의존성·악보·저장 데이터 변경, 공통 pnpm 저장소·중앙 YAML 정리, Git 이력·브랜치 삭제, 서버 재시작, 커밋·푸시·발행.
- 검증: 삭제 전 사용 여부·연결·Git 추적 여부 확인, 보존 파일 SHA256 대조, 문서·상대 링크·앵커와 diff 공백 검사.

## 삭제 전 확인

작업 시작은 `main`의 `1038c7e`이며 작업 트리는 깨끗했다. 이번 사용자의 청소 요청에 따라 삭제 대상을 정했다. Git에서 제외되었다는 이유만으로 파일을 지우지 않는다.

- 삭제 후보 62경로에 열린 파일과 보존 경로에서 들어오는 심볼릭 링크가 없음을 확인했다.
- 최신 아카이브는 `local-archives/releases/drum-practice-0.11.0-sites.tar.gz`이다. SHA256은 발행 기록과 같은 `64bc060a97d9d6b74f1256727790c6ab6729d41b29de3c5702db24a85bc9ff86`이다.
- `.tmp/release-0.10.5/toolchain/`은 현재 Node 22.22.2 실행에 사용하므로 보존한다. pnpm 12.18.0과 현재 프로젝트·hosting·Sites 설치본, 포매터의 Python 환경도 유지한다.
- `.tmp/release-0.11.0/`와 과거 검사 로그·캡처·JSON 결과·입력 사본, `data/`·`public/`·`local-libraries/`·`exports/`의 원본·검증 자료를 보존한다.
- 구형 Sites checkout의 Git 이력·소스·추적 중인 `player-assets/`는 보존하고, 추적되지 않는 `node_modules/`·`dist/`만 정리한다. 현재 `deployment/sites/`와 `dist/`는 보존한다.

정확한 후보 경로·파일 수·크기·구형 압축본 해시·사용 여부는 `.tmp/project-cleanup-20261110/before.json`에 기록했다.

## 정리 결과

| 분류 | 경로 수 | 파일·링크 수 | 논리 크기 |
| --- | ---: | ---: | ---: |
| 임시 의존성 설치본 | 4 | 20,331 | 2,403,979,543바이트 |
| 구형 빌드 복사본 | 5 | 262 | 369,336,191바이트 |
| 0.8.18~0.10.8 배포 압축본 | 13 | 13 | 729,684,791바이트 |
| 캐시·Finder 메타데이터 | 40 | 403 | 12,854,004바이트 |
| 합계 | 62 | 21,009 | 3,515,854,529바이트(약 3.27GiB) |

파일 크기의 합계이며, pnpm hard link와 APFS 공유 블록을 고려한 실제 디스크 회수량으로 해석하지 않는다. 프로젝트 밖의 공통 pnpm 저장소는 정리하지 않았다.

| 상위 위치 | 제거한 산출물 |
| --- | --- |
| `.tmp/minimatch-security-20261108/sites-build/` | `node_modules/`, `dist/`, `player-assets/` |
| `.tmp/pnpm-catalog-sync-20261108/sites-build/` | `node_modules/`, `dist/`, `player-assets/` |
| `.tmp/sites-dependencies-53x0sw/hosting/` | `node_modules/` |
| `local-archives/releases/sites-upload-failed-0.8.13/` | Git에서 추적하지 않는 `node_modules/`, `dist/` |
| `local-archives/releases/` | 최신 0.11.0을 제외한 구형 배포 압축본 13개 |
| 프로젝트 내부 | `__pycache__/` 19개, `.DS_Store` 19개, 완료된 포매터 검사의 `black-cache/`·`uv-cache/` |

임시 검증의 소스·manifest·lockfile·검사 결과는 남아 있다. 같은 검증을 다시 실행하려면 삭제한 설치본·빌드 출력을 재생성해야 한다. 구형 배포 압축본 자체는 삭제했으며 과거 발행 기록과 해시는 유지한다. `uv-cache/sdists-v10/.git`은 0바이트 캐시 표식으로 확인했고 Git 저장소나 이력은 삭제하지 않았다.

## 보존 확인

- 삭제 직후 보존 대상 30,627개 파일·링크의 내용과 연결이 모두 동일했고, 삭제 대상 62경로가 모두 없음을 확인했다. 이후 이 기록·기록 목록·발행 보존 안내·`history.md` 네 문서만 갱신했다.
- 보존 대조에는 원본 음원·악보·검증 기록, 최신 릴리스 압축본, 현재 두 앱 빌드, 현재 설치본·실행 도구가 포함된다. Git 내부 파일 전체의 해시 검사는 하지 않았으며 삭제 대상에서 제외하고 HEAD·작업 트리 상태를 확인했다.
- `main` HEAD는 `1038c7e`, 현재 Sites checkout은 `574e9e0`, 구형 Sites checkout은 `945b6f5`로 유지했다. 두 Sites checkout의 작업 트리는 깨끗하다.
- 두 앱 버전 `0.11.0`, 빌드 `bb8b549b70f7`, 5173 개발 서버의 PID `63827`을 유지했다. 서버 재시작·앱 코드 변경·전체 테스트·빌드·화면 검사·공개 사이트 검사·커밋·푸시·발행은 하지 않았다.

근거는 `.tmp/project-cleanup-20261110/`의 `before.json`, `removed.json`, `protected-before.json`, `preservation.json`에 있다. 문서·상대 링크·앵커 검사는 `docs-check.log`, 최종 문서 변경 범위와 과거 기록 대조는 `final-check.json`에 기록한다. 이 기록은 이번 청소의 실행 결과이며 상시 자동 삭제 정책이 아니다.
