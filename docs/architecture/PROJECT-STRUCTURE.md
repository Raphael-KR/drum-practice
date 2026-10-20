# 프로젝트 구조

2026-10-21 구조 개편 기준. [실행 계획과 결과](../plans/PROJECT-RESTRUCTURING.md), [파일 이동표](../plans/RESTRUCTURING-MAP.md), [검사 실행 방법](../operations/TESTING.md)을 함께 사용한다.

## 책임과 진입점

| 위치 | 책임 |
|---|---|
| `src/apps/editor/main.ts` | 로컬 제작기 조립, 편집 세션·저장 큐·미디어 수명·화면 전환 |
| `src/apps/editor/editor-*.ts` | 화면 구성, 보관함, 악보·가사 편집, 검수, 폼 반영 |
| `src/apps/player/player-app.ts` | 연습실 조립, 목록·가져오기·재생 진입 |
| `src/modules/playback/` | 두 앱이 공유하는 재생 화면·제어·구간·마커·BPM |
| `src/modules/audio/` | 음원 분석·변환·파형·첫 박 조정 |
| `src/modules/score/` | MusicXML·악보 렌더링·캐시 |
| `src/modules/lyrics/` | 가사 배치·타이밍·보정 |
| `src/modules/library/` | 패키지·가져오기·목록 정책 |
| `src/modules/help/` | 음악 화면의 도움말 내용 |
| `src/model/` | 공통 자료형과 박 시각·편집 규칙 |
| `src/platform/storage/` | IndexedDB·설정·직렬화·캐시 |
| `src/platform/browser/` | 브라우저 다운로드·전체화면 등 |
| `src/shared/` | 도메인 규칙 없는 UI·스타일·번역 |
| `src/content/` | 수록곡 목록과 승인된 곡별 보정 |
| `src/generated/` | 생성하는 라이선스·빌드번호; Git 제외 |
| `scripts/{build,checks,release}/` | 제품 빌드·검사·릴리스 도구 |
| `tools/` | 악보 제작·벤치마크·Apple 로컬 보조 도구 |

HTML 주소는 `index.html`, `editor.html`, `player.html`을 유지한다. `src/app-versions.json`이 버전 정본이다. 독립 HTML 내보내기는 추가하지 않는다.

## 의존 규칙

제작기와 연습실은 서로 import하지 않는다. 앱은 공통 모듈을 조립하며, 재생 화면의 소유자는 `playback-screen.ts` 하나다. 분리한 BPM 모듈은 같은 host와 이벤트 등록·해제 경로를 사용한다.

model은 앱·UI·저장 구현에 의존하지 않는다. 기존 오류 문구를 위한 i18n 의존만 유지한다. shared는 음악 기능 모듈을 참조하지 않는다. 모듈별 named export를 직접 사용하며 전체를 모은 barrel을 추가하지 않는다.

모듈 간 기존 협력 경로는 [이동표의 경계](../plans/RESTRUCTURING-MAP.md#경계)에 명시한다. 저장 계층이 필요한 순수 악보·미디어 계약을 사용하는 기존 관계는 유지한다. 모든 계층을 새 추상화로 재작성한 구조는 아니다.

## 호환성과 스타일

DB 이름·버전·저장 키, bytes-v1 직렬화, `.drumscore`, snapshot·큐·트랜잭션을 유지했다. `RecordData`와 `AudioBarOne`은 자료형 선언만 model로 이동하고 기존 모듈의 type 재수출을 남겼다. 저장 데이터 마이그레이션은 없다.

기능 CSS는 해당 모듈 가까이에 둔다. 두 큰 CSS는 기존 순서대로 조각을 import한다. 원문과 조각 결합의 바이트 동일성을 확인했으며, 선택자와 규칙의 우선순위를 재설계하지 않았다.

`hosting`, `server`, `deployment`의 운영 역할은 유지한다. 배포 사본은 직접 수정하지 않는다. 공개 배포 대상은 계속 `dist/player`이며 제작기는 로컬 전용이다.

## 검사 누락 방지

`scripts/checks/source-files.mjs`가 src 전체를 재귀 탐색한다. 공통 UI, i18n, 재생 소유권, app/model/shared 경계를 검사하며 두 앱 빌드 뒤 player 번들의 제작 기능 유입을 차단한다.

기존 121개 테스트 파일은 unit·integration·local-media로 분류했다. 로컬 미디어가 없으면 필요한 검사가 실패하며 조용히 건너뛰지 않는다. 자세한 자산 목록과 실행 조건은 [검사 문서](../operations/TESTING.md)를 따른다.
