# 기기 내부 처리와 보안

문서 역할: **현행 Rule**. 현재 요구·계약과 지원 한계를 다룬다. [전체 정본](../../RULES-INDEX.md), [실행 안내](../../README.md), [결정 이력](../../decisions/README.md)을 함께 참고한다.

<a id="site-security-hardening--공개-사이트-보안과-음원-분석-경계"></a>

## 공개 사이트 보안과 음원 분석 경계

결정 근거: [ADR-0026](../../decisions/0026-device-local-audio-analysis.md). 실행: [절차](../../how-to/release.md#sites-publication--sites-발행-절차).

개인 음원·곡명·가수·박자 분석과 캐시는 현재 브라우저 내부에서만 처리한다. 서버 분석정보 저장·조회·익명 등록·검토/승인 UI는 제공하지 않는다. 서버 악보 다운로드는 유지한다.

<a id="site-security-hardening--보호-조치"></a>

### 보호 조치

- `server/player-worker.ts`는 HTML 문서와 정적 자산만 제공한다. `/api/` 요청은 404이며 분석정보 읽기/쓰기 경로가 없다. 서버 악보 다운로드는 유지한다.
- 로컬 제작 전용 예외는 [파일 프로젝트 저장·확정 교정 접수와 제작 요청](architecture.md#project-structure--의존-규칙)이다. 기존 5173 Vite 개발 서버의 같은 origin에서만 기록을 받고, 공개 Worker·preview·player 모드에는 연결하지 않는다. 자료는 공개 자산과 분리된 `data/production/projects/`와 구형 `data/production/lyric-corrections/`·`data/production/requests/`에 둔다. 프로젝트 쓰기는 512 MiB로 제한하고 곡/저장 ID·자산 상대 경로·바이트 해시·읽었던 저장본과 초안을 대조한다. 프로젝트 폴더 열기는 검증한 곡 ID에서 유도한 경로만 shell 없이 전달한다.
- 제작 요청의 첨부는 서버에서 최대 512 MiB로 제한하고 크기·SHA를 확인한다. 요청/결과 경로와 symlink가 요청 폴더를 벗어나지 않게 검사한다. 결과 파일 응답은 MIME 실행 없이 첨부로 제공한다. 미리보기는 검증한 패키지에서 공통 SVG 조판을 사용하며 보고서는 텍스트로 표시한다. 폴더 열기는 same-origin POST에서 요청 ID로 확인한 `result/`만 고정 `/usr/bin/open -a Finder`에 인자로 전달한다. 임의 경로·명령을 받거나 shell을 사용하지 않는다. 사용자의 전송 클릭은 고정된 악보제작자 하나만 대상으로 하며, 메시지는 shell 보간 없이 설치 CLI의 stdin으로 전달한다. `accepted`와 실제 작업 시작을 구분하고, timeout·불확실 송신은 자동 재전송하지 않는다. 기존 Bridge 원장과 프로젝트 전용 설정을 사용하며 외부·유료 작업이나 배포의 추가 권한을 부여하지 않는다.
- Worker 문서 응답: nosniff, Referrer-Policy, X-Frame-Options, HTTPS HSTS. CSP의 frame-ancestors/object/base는 강제하고 전체 리소스 CSP는 보고 전용이다. JS/CSS 정적 전달에도 모두 같은 헤더가 적용된다고 보증하지 않는다.
- 음원 사전 검사: 전체 읽기 전 100MiB, 디코딩 전 30분/2채널/32kHz PCM 256MiB 상한. 메타정보가 거짓일 수 있으므로 디코더의 모든 메모리 사용을 보증하지 않는다.
- 브라우저 캐시: 분석기 버전·해시·유효 숫자/박 배열 검사. 저장 실패 시 기기에서 분석하며 네트워크로 우회하지 않는다. 음원 원본과 기존 보관함·수동 설정은 보존한다.

<a id="site-security-hardening--마이그레이션과-배포-경계"></a>

### 마이그레이션과 배포 경계

과거 마이그레이션 SQL·스냅샷·저널은 [보관 디렉터리](../../records/archive/server-analysis-migrations/)에 바이트 그대로 보존한다. SQL을 운영 명령으로 다시 실행하지 않는다. 실행·지원 경로 종료에 따라 [과거 SQL 삭제 회귀검사도 종료](verification.md#verification-rules--과거-폐기-sql-검사-종료)했다. 기존 원격 삭제 확인 기록과 현재 상태를 구분한다.

D1 바인딩과 Drizzle 의존성·설정·생성 스크립트는 제거했다. Sites 준비·Vite 구성·메타데이터 복사·발행 검사도 DB 없는 Worker 계약을 사용한다. Worker 보안 헤더와 정본 player 자산 SHA-256 일치 검사는 유지한다. 이번 정리는 원격 DB 변경·삭제를 포함하지 않으며 새 발행·사이트 갱신 검증은 릴리스에서 수행한다. [지원 종료 기록](../../records/code-maintenance.md#retired-support-20261110)을 따른다.

폐기 API 차단은 Worker의 실제 404 응답으로 검사한다. 완성 번들에 옛 테이블명·파일명 문자열이 없는지만 확인하는 검사는 사용하지 않는다. 배포 마무리에서는 DB 없는 manifest, player 자산 일치와 HTML의 Worker 경유를 확인한다. [검사 재검토 기록](../../records/check-audit-20261111.md)에 변경 근거와 미실행 범위를 구분했다.

원격 자료 삭제는 실제 환경의 확인이 있어야 보고한다. 삭제 관측은 [발행 기록](../../records/releases.md#sites-publication-history--sites-발행공개-확인-기록)에서 확인한다. 공급자 내부 보존본·백업까지 삭제했다고 주장하지 않는다.
