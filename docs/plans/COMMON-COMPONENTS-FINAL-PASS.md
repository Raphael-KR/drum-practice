# 공통 구현 6항목 통합 (2026-10-02)

목표: 화면 조립·악보 자산·모달·아이콘 버튼·다운로드·보조 함수의 중복 책임 제거.
범위: 웹앱과 portable 진입점, workspace 및 관련 UI 유틸리티.
완료 조건: 공통 소유자에 연결하고 호출부/덮어쓰기 대조 및 집중·전체 테스트, 실행 확인.
제외: 곡 포함 HTML 생성/저장, 배포/커밋, 악보 표기 변경, 기존 dirty 변경 취소.
검증: 소스 패턴과 실제 호출부 대조, 실패 시 자산 해제/기존 상태 보존, DOM 계약, 빌드 및 로컬 실행.

## 재확인한 대상
1. main+workspace와 portable-player의 화면 조립
2. main activate/형식 전환, portable preparePages의 공통 이미지 준비
3. dialog-ui 외부의 편집 이력/도움말/교체/보컬 모달
4. playbackButton과 icons.iconButton 및 arrangeIcons의 공통 버튼 재작성
5. main 다운로드 4곳과 licenses 다운로드
6. score-management.escapeHTML, portable와 playback-export Base64 codec

환경별 자료 조회·저장, authoring 슬롯, SVG 입력 신뢰 검증은 경계를 유지한다.

## 통합 결과

| 대상 | 공통 소유자 | 호출부 대조 |
|---|---|---|
| 화면 조립 | playback-shell.ts | workspace / portable-player 각각 한 번; brand·transport·반복·폼·설정·안내문 공통 생성 |
| 악보 자산 준비 | playback-assets.ts | main 로드/형식 전환, portable 로드/전환; 준비 실패 시 새 URL 해제, 성공 후 이전 자산 해제 |
| 모달 | dialog-ui.ts | shell·교체·보컬 가져오기·편집 이력·도움말 공통 헤더/닫기; 이력 갱신 시 헤더 보존 |
| 아이콘 버튼 | icon-button.ts / icon-svg.ts | playbackButton·icons.iconButton·상태/전체화면 갱신 연결; arrangeIcons의 공통 버튼 덮어쓰기 차단 |
| 다운로드 | download.ts | main의 일반/PNG/ZIP/XML 및 licenses; 파일명과 URL 수명 공통 처리 |
| 보조 함수 | html.ts / binary-asset.ts | score-management escape 재수출, portable·playback-export codec 공통 호출 |

재대조 중 안내문이 HTML에서 재생바 앞에 생기는 차이와 악보 분류 아이콘이 마커로 바뀌는 차이를 발견해 공통 조립/아이콘 정의에서 수정했다. 안내문 순서는 양쪽 DOM 계약 테스트에도 포함했다.

## 검증

- `check-common-components.mjs`: src 최상위 TypeScript 97개, primitive 호출 152개 목록화. 이름을 정규화한 100토큰 이상 함수 구조 비교에서 교차 파일 후보 0개. 문자열 소유권/호스트 mount/codec primitive 검사 포함. 의미상 모든 중복 부재의 자동 증명은 아니며 호출 목록과 수동 검토를 병행했다.
- 기존 31개 기능 목록 및 공통 재생 연산 소유권 검사 유지. 공통 결과 재작성은 icons와 workspace 경로를 대조했다.
- 최종 드럼 앱 테스트: `npx vitest run --exclude 'guitar-practice/**'` — 64파일/286개 통과. 빌드·타입·i18n·호출부/번들·diff 검사 통과.
- 제한 없는 `npm test`는 별도 하위 guitar-practice 프로젝트까지 수집해 fixture 경로 실패를 일으켰다. 해당 프로젝트는 변경하지 않았으며 위 드럼 앱 범위를 별도로 전수 실행했다. 초기 build/test 동시 실행 실패도 있었으므로 최종 검증은 순차 실행했다.
- HTML 빌드 템플릿 283807bytes, 런타임 47모듈. 편집/저장소/소스 렌더러 제외 검사 통과. 기존 대용량 청크 경고 유지.
- Safari: 로컬 dev5173 및 최종 빌드5188 악보 로드, 템포 모달, 반복, 설정 확인. 메모리 HTTP5189에서 기존110마디 데이터+최신 템플릿으로 HTML 런타임 로드,75→94 BPM 복원·반복·두줄 전환 확인. 양쪽 중복 ID 없음, 확인 시 viewport/문서 폭1024px 일치.
- Safari selectMenuItem 도구가 선택을 실패시키고 $uid JS 치환도 지원되지 않아 실제 select ID에 change 이벤트를 보내 보기 전환을 확인했다. iPad 터치 검증을 의미하지 않는다.
- 캡처 및 로그: ignored docs/experiments/common-web.png, common-portable.png, common-build.log, common-final-tests.log, common-unscoped-tests.log, common-components-audit.json.

## 남긴 환경 차이와 검증 한계

- 웹 DB/원본 로딩·저장·편집·검수·목록, HTML 내장 데이터/오디오 decode 및 메모리 선호값은 호스트 어댑터다.
- portable SVG 입력 검증 및 MIME/오류 계약은 경계에 유지하고 이미지 준비/인코딩 본체만 공유한다.
- main 편집 캔버스와 score-review 원본 이미지 decode는 재생 이미지와 용도가 달라 유지했다. 라이선스 링크의 download 속성은 링크 메타 정보이며 실제 다운로드는 공통 함수다.
- 모달별 본문과 편집 종료의 저장/폐기/취소 선택은 기능 고유 내용이다. 기존 portable 호환 API도 유지했다.
- 다운로드 파일 저장 자체, 실제 iPad, 오디오 출력 품질, OS 전체화면·클립보드 권한은 이번 실행 검증에 포함하지 않았다. 다운로드 수명/실패 경로는 자동 테스트했다.
- 곡 포함 HTML 파일은 생성·저장하지 않았다. 빌드용 빈 템플릿만 갱신했고 QA 응답은 메모리에서만 조합했다. 커밋·배포하지 않았다.
