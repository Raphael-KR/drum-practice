# 기기 내부 처리와 보안

문서 역할: **현행 Rule**. 현재 요구·계약과 지원 한계를 다룬다. [전체 정본](../../RULES-INDEX.md), [실행 안내](../../README.md), [결정 이력](../../decisions/README.md)을 함께 참고한다.

<a id="site-security-hardening--공개-사이트-보안과-음원-분석-경계"></a>

## 공개 사이트 보안과 음원 분석 경계

결정 근거: [ADR-0026](../../decisions/0026-device-local-audio-analysis.md). 실행: [절차](../../how-to/release.md#sites-publication--sites-발행-절차).

개인 음원·곡명·가수·박자 분석과 캐시는 현재 브라우저 내부에서만 처리한다. 서버 분석정보 저장·조회·익명 등록·검토/승인 UI는 제공하지 않는다. 서버 악보 다운로드는 유지한다.

<a id="site-security-hardening--보호-조치"></a>

### 보호 조치

- `server/player-worker.ts`는 HTML 문서와 정적 자산만 제공한다. `/api/` 요청은 404이며 분석정보 읽기/쓰기 경로가 없다. 서버 악보 다운로드는 유지한다.
- Worker 문서 응답: nosniff, Referrer-Policy, X-Frame-Options, HTTPS HSTS. CSP의 frame-ancestors/object/base는 강제하고 전체 리소스 CSP는 보고 전용이다. JS/CSS 정적 전달에도 모두 같은 헤더가 적용된다고 보증하지 않는다.
- 음원 사전 검사: 전체 읽기 전 100MiB, 디코딩 전 30분/2채널/32kHz PCM 256MiB 상한. 메타정보가 거짓일 수 있으므로 디코더의 모든 메모리 사용을 보증하지 않는다.
- 브라우저 캐시: 분석기 버전·해시·유효 숫자/박 배열 검사. 저장 실패 시 기기에서 분석하며 네트워크로 우회하지 않는다. 음원 원본과 기존 보관함·수동 설정은 보존한다.

<a id="site-security-hardening--마이그레이션과-배포-경계"></a>

### 마이그레이션과 배포 경계

기존 마이그레이션 이력은 보존한다. 이력에 있는 DROP을 롤백·새 시험의 삭제 명령으로 실행하지 않는다. D1 바인딩·마이그레이션 도구와 런타임 읽기/쓰기를 구분하며 Worker는 DB를 사용하지 않는다. 적용 식별자·당시 요청은 [ADR-0026](../../decisions/0026-device-local-audio-analysis.md)을 따른다.

원격 자료 삭제는 실제 환경의 확인이 있어야 보고한다. 삭제 관측은 [발행 기록](../../records/releases.md#sites-publication-history--sites-발행공개-확인-기록)에서 확인한다. 공급자 내부 보존본·백업까지 삭제했다고 주장하지 않는다.
