# 서버 분석 마이그레이션 보관

과거 D1 분석 테이블의 생성·변경·폐기 SQL과 Drizzle 스냅샷·저널을 보관한다. 2026-11-10에 `hosting/drizzle/`에서 내용 변경 없이 옮겼다. 활성 빌드·발행·빌드번호 계산에 포함하지 않으며 원격 DB에 재적용하지 않는다.

SQL의 실행·지원 경로가 종료되어 2026-11-11에 시험용 메모리 DB를 사용하던 폐기 회귀검사도 제거했다. SQL·스냅샷·저널과 당시 검증·배포 기록은 보존한다. [검사 종료 기준](../../../reference/engineering/verification.md#verification-rules--과거-폐기-sql-검사-종료)과 [배포 지원 종료 기록](../../code-maintenance.md#retired-support-20261110)을 참고한다.
