# 서버 분석 마이그레이션 보관

과거 D1 분석 테이블의 생성·변경·폐기 SQL과 Drizzle 스냅샷·저널을 보관한다. 2026-11-10에 `hosting/drizzle/`에서 내용 변경 없이 옮겼다. 활성 빌드·발행·빌드번호 계산에 포함하지 않으며 원격 DB에 재적용하지 않는다.

[폐기 회귀검사](../../../../tests/integration/analysis-retirement.test.ts)는 이 SQL을 시험용 메모리 DB에서만 읽는다. 실제 실행은 검사 허가와 범위에 따른다. [지원 종료 기록](../../code-maintenance.md#retired-support-20261110)을 참고한다.
