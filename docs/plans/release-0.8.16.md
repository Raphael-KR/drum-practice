# 0.8.16 릴리스

- 목표: 승인된 의존성·보안 업데이트를 두 앱0.8.16으로 기록하고 기존 공개 드럼연습실에 발행한다.
- 범위: 기존 미커밋 개발/Sites 의존성·Vite 설정·테스트 호환성·검증 문서, patch 버전, 작업 브랜치/PR/CI/main 병합과 main player Sites 발행이다.
- 완료 조건: 로컬 전체 검사·최신 PR/main CI·검토, main 산출물/사본/Worker 일치, 배포 succeeded·공개 읽기 확인과 이번 병합 브랜치 정리다.
- 제외: 새 기능·저장 계약 변경·원본/사용자 저장곡 교체·editor 공개·청취/iPad·강제 push·별도 승인 없는 rollback.
- 검증: 기존 실제 자료로 전체 `npm run verify`, audit/의존성 정합성, main 두 앱 재빌드와 Sites 빌드/파일 대조, 기존 public 범위의 읽기 smoke를 실행한다.

## 시작 상태와 버전 판단

- main/원격 기준 `f6088a84d2ff4cb3d3b23887c59f197a3483dc9e`, 별도 worktree/열린 PR 없음. 기존 대상 미커밋11파일을 보존해 `codex/release-0.8.16`에서 진행한다. 원본과 실행 중5173서버·로컬 배포 사본을 보존한다.
- 두 앱0.8.15→0.8.16 patch다. Vite 메이저 상승 자체를 제품 minor로 환산하지 않는다. 이번 제품 변경은 기존 기능의 의존성/보안·빌드 호환성 보완이며 독립 사용자 기능·저장 형식 변경은 없다.
- 개발용 Vite8.3.5·Vitest/mocker/spy5.0.5·@types/node26.6.5, music-metadata12.2.3·PDF.js6.4.299·fake-indexeddb6.2.6·Prettier3.9.10, 개발용 Undici6.29.1·Sites7.30.1을 포함한다. 기존 Sites 플러그인/빌드 의존성 변경도 보존한다.
- 실제 수정은 두 package/lockfile·Vite 설정과 NodeBlob 입력의 테스트 두 곳이다. 기존 브라우저 build/css target을 유지하고 앱/저장/재생 소스·검사 규칙·기대값은 바꾸지 않는다. 새 제품 모듈/이동 파일은 없고 기존 공통 타입·경계·검증을 재사용한다.
- 앞선 [보안 검증](vite-security-update-20261024.md)과 [최종 의존성 검증](dependency-updates-20261024.md#vite8-node26-update-20261024)을 보존한다. Safari 두 앱 초기화/화면과 실제 MP3/PDF/MusicXML 처리는 최종 의존성 조합에서 이미 확인했으며 이번 버전 변경 외 제품 소스의 동일성을 대조한다. 공개 파일 일치를 실제 재생·청취·iPad 검증으로 확대하지 않는다.
- 현재 Site는 기존 ID `appgprj_6ab0790baa048191aaee49f58c1ffe7b`, public·버전85·owner다. 배포 사본은 main clean·Sites 소스 `7011b12979f256af6983b42dd38a657b6c2a8a99`다. player만 기존 주소에 발행하고 새 사이트/접근 정책은 만들지 않는다.

## 진행 상태

버전 갱신 뒤 로컬 검사, 작업 브랜치 커밋/푸시·PR 검토/CI·main 병합/CI, main 빌드·Sites 발행·공개 확인·브랜치 정리를 순서대로 기록한다. 시작 전 diff와 상태는 `.tmp/release-0.8.16/`에 보존했다.

- 두 앱0.8.16·소스 빌드 `de75f325f873`, Node26.12.1/npm12.2.1에서 새 `npm run verify`가 통과했다. lint·서식433파일·앱/도구/hosting 타입·문서/구조·전체129파일767검사·두 앱 빌드/경계가 통과했다. 양쪽 최신 audit0건·peer 오류 없음. 로그 `verify.log`, `audit-*.json`, `dependencies-*.json`.
- 같은 빌드 입력에 이전 앱 버전 바이트만 대입해 Safari 검수 소스 `20585a52b084`를 재현했다. 이번 버전 변경 외 제품 소스가 같아 앞선 두 앱 화면·MP3/PDF/MusicXML 처리 관측을 재사용한다. 기존6곡/검사 자산 해시를 `input-proof.json`에 보존했다. 공개 청취·iPad로 확대하지 않는다.
- 자체 diff 검토: 루트/Sites 의존성 범위·lockfile·Miniflare에 한정한 Undici override, Vite JSON/native import·기존 브라우저 target, 테스트 두 곳의 같은 ZIP 바이트/엄격 기대값 보존, 생성물/원본 제외·문서 위치/링크를 확인했다. 새 제품 모듈/저장 계약 변경이 없어 기존 타입/구조/저장/패키지 회귀를 사용한다. 필수 검사를 끄거나 새로운 차단 기준을 추가하지 않았다. 자체 검토이며 독립 리뷰 승인으로 표현하지 않는다.
- 기존 OSMD 정적/동적 import·청크 크기·Node26 localStorage 안내는 비차단 경고다. 아직 push·PR/CI·main 병합·새 Sites 발행은 실행하지 않았다.
