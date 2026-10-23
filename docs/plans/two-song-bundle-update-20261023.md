# 두 곡 최신 교정본의 앱 수록 반영

- 목표: 붉은 노을과 바람과 언덕의 발라드의 접수된 최신 MusicXML을 실제 기본 제공 패키지에 반영한다.
- 범위: `public/scores/red-sunset.drumscore`, `public/scores/real-paradis.drumscore`, 실제 열기를 막는 공통 글꼴/SVG 검증 호환성 보완과 이번 실행 기록. 기존 공통 canonical/package/render API를 사용한다.
- 완료 조건: 정본과 원본 XML이 전달된 해시와 같고, SVG·마디 영역을 함께 재생성하며, 패키지 왕복과 로컬 앱 저장·재열기에서 최신 악보를 확인한다. 기존 음원·PDF·가사·마디 ID·박 시각·마커·반복·설정을 보존한다.
- 제외: 다른 미커밋 작업 변경, 새 채보·음원 분석·청취 판정, 새 앱 기능 추가, 버전 상승·커밋·push·공개 배포.
- 검증: 입력/이전 패키지 해시와 사본 보존 → 공통 조판·패키지 저장/재읽기 → 원본 자산·정본 의미·연습 데이터 대조 → 필요한 기존 집중 검사와 Safari 로컬 앱 표시·재열기. 실제 기기·공개 사이트 검증과 구분한다.

사용자 승인 근거: 악보제작자 채팅의 사용자 메시지 `01a168bb-058c-7e60-aa0c-633de94569de`를 직접 조회했다. 기존 담당에게 두 최신 교정본의 앱 수록 반영을 전달하라는 요청이다.

입력은 각각 `data/production/red-sunset-direction-fix-20261023/score.musicxml` 및 `data/production/real-paradis-sections-20261023/score.musicxml`이다. 제작 담당의 기존 검사와 이번 개발 실행의 검증을 구분한다. 실행 결과는 곡별 제작 기록과 `history.md`에 남긴다.

실제 앱 검수에서 공통 조판기가 내장한 Pretendard CSS를 기존 SVG URL 검사에서 외부 참조로 거부하는 충돌이 재현됐다. 수록본을 실제로 열 수 있도록 공통 글꼴 모듈의 정확한 내장 바이트·CSS와 일치하는 경우만 구분하며 기존 외부 URL·이벤트·실행 코드 차단은 유지한다. 원본·캐시 SVG의 변경 없이 검사 복제본에만 적용하고 기존 보안 회귀와 두 실제 곡의 Safari 열기로 검증한다.

## 실행 결과

두 곡의 수록·패키지 왕복·로컬 저장/재열기는 확인했다. 상세 해시·보존·검사 결과는 [붉은 노을 기록](../records/songs/red-sunset.md#red-sunset-bundle-update-20261023)과 [바람과 언덕의 발라드 기록](../records/songs/real-paradis.md#real-paradis-bundle-update-20261023)을 따른다. 붉은 노을134마디는 연습 두 보기에서 긴 문구와 Ending이 겹치므로 표시 수용은 미완료다. 인쇄 경로의 제작 통과와 구분하며 이번 수록에서 정본을 임의 교정하지 않았다.
