# 0.8.15 릴리스

문서 역할: **완료된 실행 기록**. 아래 목표·시작 상태는 당시의 계획이며 최종 발행 근거는 [0.8.15 기록](../releases.md#release-0-8-15-20261024)에 있다. 제품 main d0465365048b146dcec96ac86d6dd0a388aa0743·소스 빌드4eba91c4f6d5로 player만 발행했다. PR/main CI·main 재빌드·38파일 세 곳 대조와 공개 읽기42항목을 통과했다. Sites 버전85는2026-10-24 06:06:59 KST에 succeeded다. 후속 문서 반영은 버전·발행을 반복하지 않는다.

- 목표: 공통 재생 성능·메모리 개선을 두 앱0.8.15로 기록하고 기존 공개 드럼연습실에 발행한다.
- 범위: codex/runtime-performance의 기존 수정·검증 기록, patch 버전, PR/CI/main 병합, main 빌드와 player Sites 발행이다.
- 완료 조건: 로컬 전체 검사·최신 PR/main CI, 정본/사본/Worker 파일 일치, 배포 succeeded·공개 읽기 확인, 이번 병합 브랜치 정리다.
- 제외: 새 기능·저장 형식 변경·원본/개인 저장곡 교체·editor 공개·RSS 고정 절감/충돌 완치 선언·청취/iPad 시험·강제 push/rollback.
- 검증: 기존 실제 수록 자료로 전체 verify를 실행하고 실제 Safari/동일 출력 검수의 제품 소스 동일성을 확인한다. 공개 읽기 smoke와 산출물 해시를 확인한다.

## 시작 상태와 자체 검토

- HEAD3aa80bfa030e3593ab0cced799b0d64a884779e1, 기존 작업 브랜치 codex/runtime-performance, 변경24파일. 기존 적절한 브랜치를 재사용하며 자료·실행 중5173 서버를 보존한다.
- 기존 동작의 반복 계산·DOM 재기록·클릭 예약 목록·SVG 파싱/Blob 복사를 줄이는 변경이므로 두 앱0.8.14→0.8.15 patch다. 독립 사용자 기능·의존성/CI·DB/키/직렬화 변경은 없다.
- 자체 검토는 오디오 cycle 생성/폐기, 화면 geometry/BPM snapshot 무효화, 강조 WeakMap 수명, 공유 SVG 문서 소유권·안전 검사/글꼴 복원, 제작기 시간 표시와 회귀를 대상으로 했다. 독립 리뷰 승인으로 표현하지 않는다.
- 새 제품 모듈이나 이동 파일은 없다. 두 앱이 공통 playback/score/audio를 사용하며 기존 구조·타입·회귀 검사에서 검증한다. 신규 문서는 계획과 실행 기록 책임으로 나누고 history/정본에서 연결했다.
- 실제 Safari/붉은 노을 재생·보기 전환·전체 높이6691px와 SVG34장 바이트 동일 검수는 빌드2884c75bbd2c다. 릴리스 후보4eba91c4f6d5의 차이는 앱 버전과 아래 PNG 호환 경로 복원뿐이다. 기존 소스 해시 알고리즘에 두 파일의 직전 바이트를 대입해2884c75bbd2c가 재현됨을 확인했다. SVG 경로가 같아 해당 관측을 재사용하고, PNG는 기존0.8.14의 복원 동작과 회귀로 확인한다. RSS 고정 절감량·native 충돌 해결·장기 누수 부재는 미확정이다.
- 기존 Site는 public·버전84, 배포 사본은 main clean이며 프로젝트 ID를 확인했다. 공개 범위를 유지하고 editor를 제외한다.

## 진행 기록

- 최초 전체 검사의 제작기 BPM 저장 회귀가 기본1초 대기 안에 완료되지 않아128파일766검사만 통과했다. 단독25검사는 통과했고 기존400ms debounce 뒤 실제 미디어 직렬화/저장이 이어지는 경로를 확인했다. 저장값의 동일한 엄격 비교는 유지하고 기다리는 한도를 기존 인접 BPM UI 검사와 같은5초로 맞췄다. 실패 로그도 보존한다.
- 자체 검토에서 Safari의 구형 IndexedDB PNG URL을 위해 기존 raster 바이트 materialization은 유지할 필요를 확인했다. SVG의 큰 중복 복사만 제거하고 PNG 복사는0.8.14와 동일하게 유지한다. 기존 PNG 왕복 검사는 바이트 동일성과 별도 Blob 소유를 함께 확인한다. SVG 계측/34장 출력·원음 보존 계약은 같다.
- 최종4eba91c4f6d5에서 `npm run verify` 전체129파일767검사·lint/서식433파일·앱/도구/hosting 타입·구조/문서·두 앱 빌드/경계 통과. 수록6곡 SHA256 불변과 실제 입력 파일 해시를 보존했다. Vite 청크 크기·Node localStorage 안내는 비차단 경고이며 검사 기준을 끄지 않았다.
- 근거는 `.tmp/release-0.8.15/verify-final.log`, `input-proof.json`, 기존 두 성능 기록이다. 아래 PR·병합·발행·공개 확인을 완료했다.

## 최종 결과

- 구현951dca6dfd9fc582042bc177a74ce0bc0bbe80b3, [PR #12](https://github.com/Raphael-KR/drum-practice/pull/12), 제품 main d0465365048b146dcec96ac86d6dd0a388aa0743. head와 main의 tree가 같고 입력6곡이 같아 해당 전체 검사 결과를 재사용했다. main에서 두 앱을 새로 빌드했고 source4eba91c4f6d5를 확인했다.
- PR 최신 head CI40023822225와 push CI40023798729, 병합 main CI40024010159가 성공했다. 자체 검토 결과이며 독립 리뷰 승인으로 표현하지 않는다.
- Sites 소스7011b12979f256af6983b42dd38a657b6c2a8a99·버전85·배포 appgdep_6adbcc6488848191a0e0b10d4d96fee2 succeeded. 기존 public audience·Site ID·주소를 유지했다.
- 정본/사본/Worker38파일 일치, 공개 HTML3경로·정적36파일 전체 SHA256·폐기 API3경로404의42항목이 통과했다. editor는 로컬 전용이며 개인 저장곡을 자동 교체하지 않는다. 공개 파일 일치를 실제 공개 재생·청취·iPad 성공으로 확대하지 않는다.
- 배포 준비의 audit에서 개발 의존성Vite8.0.16에 high1개 패키지 경고가 확인됐다. 상세5개 advisory는 개발 서버/launch-editor 경로이며 공개2804bytes Worker에 Vite/launch-editor 코드는 없다. 기존 의존성을 이번 성능 릴리스에서 강제 갱신하지 않았고, 개발 도구 업데이트는 별도 보완 대상으로 남긴다. 실제 audit 결과는 성공으로 바꾸지 않았다.
- 이번에 병합한 작업/기록 브랜치만 발행·공개 확인 뒤 정리한다. 최종 main/원격 일치와 작업 트리는 로컬 receipt에 기록하며 무관한 브랜치나 자료를 삭제하지 않는다.
