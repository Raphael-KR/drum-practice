# Sites 발행

공개 대상은 **드럼연습실(player)**이다. 악보제작기는 로컬 전용이다. 최근 변경과 배포 결과는 [개발 기록](../../history.md)에 있다.

## 정본과 배포 구조

- 개발 정본: `/Users/raphael/Playground/drum-practice`
- 배포 사본: `deployment/sites/` — 제품 소스를 독립 수정하지 않는다.
- 기존 Sites 프로젝트: `appgprj_6ab0790baa048191aaee49f58c1ffe7b`
- 공개 주소: [드럼연습실](https://drum-practice-studio.dgkma.chatgpt.site)
- 정적 앱 입력: `dist/player/`. `dist/editor/`나 원본 미디어 폴더 전체를 발행하지 않는다.
- 서버: `server/player-worker.ts`가 HTML/보안 헤더와 정적 자산을 전달한다. `hosting/`의 D1 바인딩은 과거 분석 테이블 삭제 마이그레이션 적용을 위해서만 유지한다.
- 파일 해시·곡명·가수·분석 결과는 브라우저 내부에서만 처리한다. 자세한 필드·제한은 [음원 연습](../product/AUDIO-PRACTICE.md)을 따른다.

## 발행 순서

사용자가 요청한 경우에만 commit, push, 공개 발행을 수행한다. 변경 범위와 기존 dirty 파일을 확인하고 이번 릴리스에 필요한 검사를 먼저 끝낸다.

1. `src/app-versions.json`과 [버전 정책](APP-VERSIONS.md)을 확인한다. 문서만 변경하면 버전을 올리지 않는다.
2. 드럼 회귀와 분리 빌드를 검사한다.

   ```sh
   npm run test:drum
   npm run build:apps
   npm run check:playback
   ```

3. 정본의 `scripts/release/prepare-sites.mjs`로 기존 사본을 준비한다. 이 스크립트는 이전 생성 사본을 교체하므로 프로젝트 ID·경로와 사본의 별도 수정 유무를 먼저 확인한다.

   ```sh
   node scripts/release/prepare-sites.mjs
   npm --prefix deployment/sites ci
   npm --prefix deployment/sites run build
   ```

4. 현재 Sites 스킬과 노출된 도구 계약을 읽고 기존 프로젝트에 소스를 저장·발행한다. 새 사이트를 만들거나 공개 범위를 확대하지 않는다. Git push만으로 Sites 발행이 완료되지는 않는다.
5. `source-parity.json` 기준으로 `dist/player`, 사본의 `player-assets`, Worker의 `dist/client` 정적 파일을 대조한다. `index.html`은 준비 스크립트가 `player.html`에서 만드는 진입점이다.
6. 배포가 `succeeded`인지 확인한 뒤 공개 HTML·주요 JS/CSS·분석/변환 Worker와 `.drumscore` 다운로드, 폐기된 API의 404를 확인한다. 기존 값을 바꾸는 smoke 요청은 피하고, 쓰기 검증이 필요하면 별도 시험 해시와 처리 범위를 정한다.
7. 구현 커밋, push, Sites 소스/버전/배포 ID, 빌드 식별자, HTTP/API 결과와 실기기 검증 여부를 기록한다.

로컬 분석 DB/인증키는 삭제했다. 공개 DB의 3개 분석 테이블은 0.7.9 발행에서 0002 마이그레이션으로 삭제했고 DB 재조회로 확인했다. 브라우저의 기존 보관함은 로컬 주소와 공개 주소 사이에 자동 이전되지 않는다.

## 최신 발행 — 0.8.7

- Prettier 형식 정리280파일. 기능·저장 형식 변경 없이 유지보수 patch로 두 앱0.8.7, 공개는 player만이다.
- 구현 커밋 `778dd9100497b8eadf5f249f89301b331020854b` — main push 완료. 소스 빌드 `69f1cf69f1ca`.
- 형식 정리 직후 전체123파일720테스트·379개 Prettier 검사 통과. 버전 반영 후 타입·i18n·공통/재생/소스 경계·분리 빌드·배포 빌드 통과. 기존 청크 크기·Node localStorage 경고 유지.
- Sites 소스 `d4dc3a54b546e49003d9c2278c6812b222bf6b80`, 저장 버전77.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_dcfdd27b38bc8191b1a5e22fec2621fc`.
- 배포 ID: `appgdep_6ad806887b248191abfad6edc710f133` — succeeded, 2026-10-21 09:26:01 KST.
- 로컬 아카이브 SHA-256: `d862ab9c3cbc552ed120257753ec0df6afcf81025dd6ed48ff58fd7b1cc211de`.
- 정적36파일 해시 일치. 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일·악보5개 SHA-256 일치, 폐기 API3경로404.
- 증거: `.tmp/prettier-tests.log`, `.tmp/prettier-commit-check.log`, `.tmp/release-0.8.7-{build,site-build}.log`, `.tmp/release-0.8.7-{parity,smoke}.json`. iPad 실기기·공개 청취는 재검증하지 않았다.

## 이전 발행 — 0.8.6

- 공통 목록 소제목 높이·빌드 글자색·CSS 우선순위 복원, 제작기 백업 접근 수정, 두 앱 상단바 버튼 구성·크기·간격 통일. 기존 기능 보완으로 patch이며 두 앱0.8.6, 공개는 player만이다.
- 구현 커밋 `04198d1fae7f9419863cbf95270039b0308a2bcc` — main 커밋·push 완료. 소스 빌드 `7d67e9d1f686`.
- 전체123파일720테스트·타입·i18n·공통/재생/소스 경계·분리 빌드·배포 빌드 통과. 기존 청크 크기·Node localStorage 경고 유지.
- Sites 소스 `d8f6ae8f8616ebd322714d2eb86a104ed28367c3`, 저장 버전76.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_75dfd557dd948191b77ecad1e55f3ecf`.
- 배포 ID: `appgdep_6ad7be2f12f88191a1582f46d98383c2` — succeeded, 2026-10-21 04:17:19 KST.
- 로컬 아카이브 SHA-256: `9d62d0bbfdb9df5a66a7683cc6d5f7d6ac3df2df3d0fed9de1a3d6064a737b3c`.
- 정적36파일 해시 일치. 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일·악보5개 SHA-256 일치, 폐기 API3경로404.
- 증거: `.tmp/release-0.8.6-{tests,build,site-build}.log`, `.tmp/release-0.8.6-{parity,smoke}.json`. 두 앱 로컬 Safari 폭400/768/1000px 확인은 개별 작업 기록 참조. iPad 실기기·공개 청취는 재검증하지 않았다.

## 이전 발행 — 0.8.5

- 공통 목록·카드·즐겨찾기·버전 표시, 제작기 오렌지 테마·중복 목록 제거·편집 진입 깜빡임 수정, 러브홀릭 PDF103마디 검수와 공통 버튼판 높이 수정. 기존 기능 개선으로 patch이며 두 앱0.8.5, 공개는 player만이다.
- 구현 커밋 `771f6214b3911d778a24eec200d1c8138d032efa` — main 커밋·push 완료. 소스 빌드 `6396bf86bea7`.
- 전체123파일720테스트·타입·i18n·공통/재생/소스 경계·분리 빌드·배포 빌드 통과. 최초 빌드 동시 실행의 UI1건5초 초과는 제한 변경 없이 전체 단독 재실행으로 통과했다. 기존 큰 청크 경고 유지.
- Sites 소스 `197927fd02b90a351b24bbed55e9b8c5a1055c72`, 저장 버전75.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_c2df546ad95081919339ef8eba05bbbe`.
- 배포 ID: `appgdep_6ad7b66410288191a30ede5bf08b69c0` — succeeded, 2026-10-21 03:44:03 KST.
- 아카이브 SHA-256: `41e98928daabb2b4c77daea238d34fe33c1fad0ece63b0ca3f8cf2615c9b292d`.
- 정적36파일 해시 일치. 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일·악보5개 SHA-256 일치, 폐기 API3경로404.
- 증거: `.tmp/release-0.8.5-{tests,tests-rerun,build}.log`, `.tmp/release-0.8.5-{parity,smoke}.json`. 제작기·목록의 로컬 Safari 확인은 개별 작업 기록 참조. iPad 실기기·공개 청취는 재검증하지 않았다.

## 이전 발행 — 0.8.4

- 앱·기능·공통 코드·저장 계층 분리, 큰 파일/CSS 분할, 테스트·문서·제작 도구 정리. 기능과 저장 형식을 유지한 내부 개선이므로 patch다. 두 앱0.8.4이며 player만 공개했다.
- 구현 커밋 `ea64a2198bac2bb8eac8daf380c7e77a90e40d22`. 릴리스 브랜치에서 커밋 후 main으로 fast-forward 병합·push했다. 병합된 임시 브랜치를 삭제해 정본 로컬/원격 모두 main만 남았다.
- 소스 빌드 `7a5169443df3`. 전체121파일708테스트·타입·i18n·공통/재생/소스 경계·두 앱 분리 빌드·배포 빌드 통과. 정적36파일 해시 일치.
- Sites 소스 `01dd1c9347c0dd64f030f3aa596d48f8f89711c8`, 저장 버전74.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_2fcdee73bd7081918cef3f5ffed9e420`.
- 배포 ID: `appgdep_6ad7a7e4182c8191a844a50dc71d8889` — succeeded, 2026-10-21 02:42:13 KST.
- 아카이브 SHA-256: `6c587de90aba63568e6b4795652d2b89d19b0ba6ec336f68d62f881feb35e20d`.
- 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일과 악보5개 SHA-256 일치, 폐기 API3경로404.
- 증거: `.tmp/release-0.8.4-{tests,build,site-build}.log`, `.tmp/release-0.8.4-{parity,smoke}.json`. 기존 청크 크기 경고 유지. 러브홀릭103마디 PDF 검수 오류는 변경 전에도 동일하며 로컬 제작기 기존 문제로 남겼다. iPad 실기기·공개 청취는 이번에 재검증하지 않았다.

## 이전 발행 — 0.8.3

- 모달·팝업의 공통 X와 길게 누르기 설명 유지, 정수 BPM 프리셋 올림 및0.5배 하한 일치. 기존 오류·조작 개선으로 patch이며 두 앱0.8.3, 공개는 player만.
- 정본 구현 `11e2bf8` main 커밋·push 완료. 소스 빌드 `fbcddc134c88`.
- 전체121파일699테스트·타입·i18n·두 앱 분리 빌드·앱 경계·공통 구조·배포 빌드 통과. 정적36파일 해시 일치.
- Sites 소스 `69f658d0865eae3567482d6acbc70f525f385d70`, 저장 버전73.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_40e0ea6ca4148191bdfd6567c3d2065a`.
- 배포 ID: `appgdep_6ad797f433408191a91fc14d8648f1f2` — succeeded, 2026-10-21 01:34:14 KST.
- 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일과 악보5개 SHA-256 일치, 폐기 API3경로404. `.tmp/release-0.8.3-smoke.json`.
- 검사 로그: `.tmp/release-0.8.3-{tests-final,build,site-build}.log`. 기존 청크 크기·Node localStorage 경고 유지. 실제 iPad 터치·공개 청취는 이번에 재검증하지 않았다.
- 브랜치 확인: fetch/prune 및 원격 heads 조회 후 정본 저장소의 로컬/원격 모두 main만 존재했다. 추가 삭제 대상은 없고 별도 악보 제작 변경·범례/exports 파일은 보존했다. Sites 사본도 main만 사용한다.

## 이전 발행 — 0.8.2

- BPM 프리셋과 직접 입력의 처리 경로 통일, 정수 프리셋 변환 하한 수정, 공통 버튼 글자 선택 방지. 기존 오류·조작 개선으로 patch이며 두 앱0.8.2, 공개는 player만.
- 정본 구현 `1217c34` main 커밋·push 완료. 소스 빌드 `ad1018df458e`.
- 전체121파일698테스트·타입·i18n·두 앱 분리 빌드·앱 경계·공통 구조·배포 빌드 통과. 정적36파일 해시 일치.
- Sites 소스 `9de147b8ed9df4498074dd9c4286a8a9b972a122`, 저장 버전72.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_3a5b9ce3a7fc819199a8d6263cce3a63`.
- 배포 ID: `appgdep_6ad79184bba08191af94a2a8f4d70e45` — succeeded, 2026-10-21 01:06:46 KST.
- 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일과 악보5개 SHA-256 일치, 폐기 API3경로404. `.tmp/release-0.8.2-smoke.json`.
- 검사 로그: `.tmp/release-0.8.2-{tests,build,site-build}.log`. 기존 청크 크기·Node localStorage 경고 유지. 실제 iPad 터치·공개 청취는 이번에 재검증하지 않았다.

## 이전 발행 — 0.8.1

- 음원 조정·파형/재생/첫박·메트로놈·박자 선택, 중복 추가 확인, 길게 누르기 말풍선·맥락형 도움말·공통 확인 팝업 개선. 기존 흐름 개선으로 patch, 두 앱0.8.1이며 player만 공개한다.
- 정본 구현 `4e778a4` main 커밋·push 완료. 소스 빌드 `40bf3057fd34`.
- 전체121파일690테스트·타입·i18n·두 앱 분리 빌드·앱 경계·공통 구조·배포 빌드 통과. 정적36파일 해시 일치.
- Sites 소스 `247b896fba2bccd20ecb2722ef14b4bfaaa64d4d`, 저장 버전71.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_5f05cf0fe134819192cd81382df63e4d`.
- 배포 ID: `appgdep_6acff0dd349081919fc2b71b839a0157` — succeeded, 2026-10-15 06:15:27 KST.
- 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일 및 악보5개 SHA-256 일치, 폐기 API3경로404. 증거 `.tmp/release-0.8.1-smoke.json`.
- 이번 세션의 인앱 UI 확인과 공개 HTTP 검사를 구분한다. 실제 iPad/Safari 청취·터치 재검증은 하지 않았다.
- 증거: `.tmp/release-0.8.1-{tests-final,build-final,site-build}.log`. 기존 청크 크기·Node localStorage 경고 유지.

## 이전 발행 — 0.8.0

- 사용자 설정 백업·복원, 내 음원 목록 분리, 원곡/악보 BPM 독립 버튼을 반영한다. 새 독립 기능 추가로 minor이며 제작기는 로컬 전용이다.
- 두 앱0.8.0 / 소스 빌드10daccb6c927. 전체117파일655테스트·타입·i18n·분리 빌드·앱 경계·공통 구조·배포 빌드 통과. 정적36파일 해시 일치.
- 정본 구현 `924869f` — main 커밋·push 완료. Sites 소스 `037e39f225a9e1029ba5182071b3b0f38403546c`, 저장 버전70.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_3c3e949faaa48191ace0b350d1bc83d3`.
- 배포 ID: `appgdep_6acfcc700c1c8191871a24101018f203` — succeeded, 2026-10-15 03:40:03 KST.
- 공개 읽기 smoke15항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/Worker4파일·악보5개 SHA-256 일치, 폐기 API3경로404. 증거: `.tmp/release-0.8.0-backup-smoke.json`.
- 새 백업·복원 흐름의 iPad 실기기 검증은 아직 하지 않았다.
- 증거: `.tmp/release-0.8.0-backup-{tests-final,build,site-build}.log`.

## 이전 발행 — 0.7.12

- 후속 확인 2026-10-15 02:31:34 KST: 사용자 v0.7.12 표시 확인 후 공개 smoke15항목 통과. HTML3경로 신규 번들·보안 헤더, JS/CSS/Worker4파일 및 악보5개 SHA-256 일치, 폐기 API3경로404. 앞선 공개 반영 미확인은 해소됐다. 배포 성공 응답과 실제 공개 반영 사이의 지연을 관측했으며 정확한 내부 원인은 미확정이다. 붉은 노을 iPad 사용자 확인은 아래 후속 기록을 따른다.

- 정본 구현 `12580ec` — main push 완료. 두 앱0.7.12 / 소스 빌드 `115dee39d643`. player만 공개.
- Sites 소스 `6d02ac48300cfe86d25b40adfae89a1d2c73bf13`, 저장 버전69.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_1cf29c5efa2c8191a62db770ead99c0a`.
- 배포 ID: `appgdep_6acfbac430b0819197f56cc5e6426927` — succeeded, 2026-10-15 02:24:50 KST.
- 같은 저장 버전69 재발행: `appgdep_6acfbba6a3208191a85dc974999b7e68` — succeeded, 02:28:30 KST.
- 공개 확인 실패: 02:28:48 KST 홈페이지는 이전 `player-fKDC2EcG.js`를 참조한다. 기대한 `player-DjONB00x.js`와 `scores/red-sunset.drumscore` 모두404다. 배포 아카이브·저장 버전의 소스와 해시는 일치한다. 원인을 앱 결함이나 단순 캐시 지연으로 확정하지 않으며 Sites 배포/공개 제공 상태 확인이 필요하다. 반복 재배포나 원복은 하지 않는다.
- 전체115파일640테스트, 타입/i18n/분리 빌드/공통 구조/배포 빌드 통과. 정적36파일 일치. 붉은 노을 포함 악보5개.
- 붉은 노을 수록본 SHA-256 `85ba0757df43574f3ca372096590fa27b833ecf646e04d9cb1e56d61ef1676a7`. 자유 엔딩134–137 개별 시각은 잠정값이다. 2026-10-15 사용자가 iPad에서 악보 표시 정상·박자 일치를 확인했다. 범위는 [검증 현황](acceptance.md)의 0.7.12 항목을 따른다.
- 증거: `.tmp/release-0.7.12-{tests,build,site-build}.log`, 공개 확인 기록 `.tmp/release-0.7.12-smoke.json`.

## 이전 발행 — 0.7.11

- 정본 구현 `cc8b677` — main push 완료. 두 앱0.7.11 / 소스 빌드 `9e84b3a09483`. player만 공개.
- Sites 소스 `9f660cb51e54c4ddf65a8acaba1bb12d713f3f0b`, 저장 버전68.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_8869cdbcf33081919f71b3c52a73b43d`.
- 배포 ID: `appgdep_6acf9f7b27908191a3d90a203c5c7a43` — succeeded, 2026-10-15 00:28:22 KST.
- 전체114파일636테스트, 타입/i18n/분리 빌드/공통 구조/배포 빌드 통과. 정적 자산35파일 일치.
- 공개 읽기 smoke14항목 통과: HTML3경로 새 번들·보안 헤더, JS/CSS/분석·변환 Worker4파일 및 악보4개 SHA-256 일치, 폐기 API3경로404.
- 2026-10-15 사용자 iPad 실기기 확인: 하단 버튼 크기가 개선되었고 정상 동작한다고 보고했다. 이번 하단 버튼판 개선 범위의 확인이며 [검증 현황](acceptance.md)에 별도 기록했다.
- 증거: `.tmp/release-0.7.11-{tests,build,site-build}.log`, `.tmp/release-0.7.11-smoke.json`.

## 이전 발행 — 0.7.10

- 정본 구현 `dd0a37f` — main push 완료. 두 앱 0.7.10 / 소스 빌드 `e57edec37e40`. player만 공개.
- Sites 소스 `c699689d936e452cdca88aebcfcec63c15a688f4`, 저장 버전 67.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_fdca808adc8c81918fc29cc04d554b52`.
- 배포 ID: `appgdep_6acf9b17d9808191a45035b89f628863` — succeeded, 2026-10-15 00:09:35 KST.
- 전체 114파일636테스트, 타입/i18n/분리 빌드/공통 구조/배포 빌드 통과. 정적 자산35파일 일치.
- 공개 읽기 smoke 14항목 통과: HTML 3경로 새 번들·보안 헤더, JS/CSS/분석·변환 Worker와 악보4개 SHA-256 일치, 폐기 분석 API3경로404. 공개 실기기 청취는 미실행.
- 증거: `.tmp/release-0.7.10-{tests-final,build,site-build}.log`, `.tmp/release-0.7.10-smoke.json`.

## 이전 발행 — 0.7.9

- 정본 구현 `935c965` — main push 완료. 두 앱 0.7.9 / 소스 빌드 `8953d8732f2a`. player만 공개.
- Sites 소스 `a1ede96a93248c1319d1d576d2530912ca1d504b`, 저장 버전 66.
- 버전 ID: `appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_372649b5fdf481919192aa61671e41c5`.
- 배포 ID: `appgdep_6acf91075fc48191b4f0e7a0ba080183` — succeeded, 2026-10-14T14:26:37.227485Z (23:26:37 KST).
- 발행 전 공개 DB: audio_analysis/audio_analysis_pending/audio_analysis_limits. 발행 후 tables=[], 생략 0개로 실제 삭제 확인. D1 바인딩과 마이그레이션 이력만 유지하며 런타임은 사용하지 않는다.
- 공개 읽기 smoke 14항목 통과: HTML 3경로의 새 번들 참조·보안 헤더, JS/CSS/분석·변환 Worker 4개와 악보 4개 HTTP200/SHA256 일치, 폐기 API 3경로404.
- 전체114파일632테스트에 이어 최종 버전 집중5파일18테스트, 타입/i18n/두 앱·배포 빌드/경계 통과. 정적 자산35파일 일치.
- 증거: `.tmp/release-0.7.9-{build,tests,site-build}.log`, `.tmp/release-0.7.9-smoke.json`. 이번 발행 검증은 HTTP/API 기반이며 공개 실기기 청취는 수행하지 않았다.

## 과거 발행 기록 (당시 구조이며 현행 설계 아님)

다음 기록의 분석 API·검토/승인 구조는 기기 내부 처리 결정으로 폐기됐다. 현재 공개 검증 통과 버전은 0.8.3이며 아래는 당시 확인 기록이다.

### 이전 발행 — 0.7.7

기록 시점: 2026-10-14 KST. 아래는 해당 릴리스의 확인 결과이며 문서를 읽을 때마다 운영 상태를 새로 측정한 결과가 아니다.

| 항목 | 결과 |
| --- | --- |
| 정본 구현 커밋 | `50050ce` — main push 완료 |
| 앱 버전 / 소스 빌드 | 두 앱 0.7.7 / `07714ed08b63` |
| 공개 앱 | player만 |
| Sites 저장 버전 | 63 |
| Sites 소스 | `d999cb0daaacadf4d64eed29fb946965931e48fa` |
| 배포 | `appgdep_6acee90c17b08191a3529c0b9145f776` — succeeded |
| 완료 시각 | 2026-10-14T02:29:51.513529Z (11:29:51 KST) |
| 로컬 검사 | 드럼 111파일·629테스트, 타입·문구·분리 빌드·공통 재생 검사 통과 |
| 자산 대조 | player/사본/Worker 정적 출력 35파일 SHA-256 일치 |
| 공개 확인 | 홈 200, player JS/CSS·분석/변환 Worker 4파일 해시 일치, 기존 분석정보 조회 200/578박, 없는 해시 404 |
| HTML 차이 | Cloudflare가 응답에 보안 스크립트 1개를 추가함. 해당 삽입부 외에는 로컬 HTML과 일치 |
| 패키지 해시 | `sha256:dadb4a67862a2d5f34ed134d4739dfd1431b7c9238a7b8ca1920c61f597c631e` |

공개 smoke는 사용자 허가 후 GET만 사용했다. 서버 분석정보와 음원은 쓰거나 업로드하지 않았다. 첫 Python HTTP 요청은 403이었고 curl 요청은 200이었다. 로컬에만 있던 첫 조회 해시는 404였으며, 이전 공개 검증에 사용한 578박 기록은 200으로 확인했다. 이를 저장소 연결 실패로 해석하지 않는다. 배포 의존성 설치 시 기존 lockfile에서 취약점 경고 11건(중간 4, 높음 7)이 나왔으며 이번 정리 릴리스에서 의존성 버전을 바꾸지는 않았다.

실제 iPhone/iPad 재검증과 청취는 이번 발행 smoke와 구분한다. 상세 범위는 [검증 현황](acceptance.md)을 참고한다.

## 로컬 용량 정리 — 2026-10-13

hosting/deployment/sites의 `node_modules`, Sites의 `dist`, `player-assets`, 이전 `public` 사본, `.sites-runtime`, `.wrangler`를 정리했다. 원본 설정·lockfile·서버 소스와 `.openai/hosting.json`, Sites Git 이력은 유지한다. 정리 직후 배포 checkout은 생성 자산이 없는 준비 전 상태였으며, 2026-10-14의 0.7.7 발행 때 필요한 의존성과 생성 자산을 다시 준비했다. 위 발행 순서대로 `dist/player`를 준비하고 `prepare-sites` → `npm ci` → 빌드를 수행한 후에만 발행한다.

배포 파일을 checkout 외부 경로의 심볼릭 링크로 대체하지 않는다. Git에는 링크 대상의 내용이 함께 저장되지 않으므로 공개 빌드의 입력을 보장할 수 없다. hosting은 설정 원본이며 별도 의존성을 상시 설치할 필요가 없다. 배포 의존성은 실제 빌드를 수행하는 deployment/sites에 필요할 때 설치한다.

## 분석정보 검토 경계 (0.7.8, 2026-10-14 발행)

- `hosting/drizzle/0001_whole_doctor_faustus.sql`이 대기/요청 제한 테이블과 인덱스를 추가한다. 기존 분석 테이블은 삭제하지 않지만 새 공개 API의 승인 원천으로 사용하지 않는다.
- `prepare-sites.mjs`는 `scripts/export-reviewed-analysis.mjs`로 로컬 `audio_analysis_approved`만 정적 JSON/해시 인덱스로 내보낸다. 미승인/기존 캐시를 자동 승격하지 않는다.
- 로컬 `data/runtime/analysis-review-token`은 최초 준비/검토 시 생성하는 비밀 키다. 권한 0600, Git 제외. 배포 소스에는 검증용 SHA-256만 넣고 비밀 키·로컬 API·검토 UI는 넣지 않는다. 키 교체는 검증값 재발행이 필요하다.
- 로컬 승인/반려 후 전용 인증으로 해당 revision의 서버 대기 후보를 삭제한다. 실패하면 로컬 결정은 유지하고 경고한다. 승인 자료 자체는 다음 발행에서 공개된다.
- 배포 전 `approvedCount`를 확인한다. 0이면 공개 분석 캐시도 비어 시작하므로 먼저 검토할 자료가 있는지 확인한다. 현재 공개 서비스에 새 정책이 적용됐다는 뜻은 아니다.
- 정책·한도·잔여 위험은 [보안 보강](SITE-SECURITY-HARDENING.md)을 따른다.

### HTML 보안 헤더 전달

Sites 공개 자산 우선 라우팅 때문에 run_worker_first 설정만으로 홈페이지 헤더 적용을 보장하지 못했다. 준비 스크립트는 빌드한 player HTML을 `server/player-document.ts`로 포함하고, finalize는 해시 대조 후 `dist/client/index.html`과 `player.html`을 제외한다. 두 문서와 `/`는 Worker가 반환한다. 나머지 정적 자산은 기존 바이트를 유지한다.

## 최근 확인된 발행 — 0.7.8

- 정본 구현 `f6c529b`, 공개 HTML 응답 보완 `afc7f7a`: main push 완료.
- 공통 앱 버전 0.7.8, 소스 빌드 `3ef76af78a19`. player만 공개.
- Sites 소스 `756eadcbeb02d37f9e5d94ba19c21b7475a94b1a`, 저장 버전 65.
- 배포 `appgdep_6acf68ef88e08191ab5be50030fea556`: succeeded, 2026-10-14T11:35:32.773583Z / 20:35:32 KST.
- 아카이브 SHA-256 `70715fb4354a9a96dfb39bdeef272da3e7644691603de00b90382bc8fe21a2a6`.
- 최초 Sites64에서 정적 홈페이지 헤더 누락을 발견했다. HTML 진입점은 Worker 응답으로 옮기고 Sites65에 보완 발행했다. 과거 Site를 되돌리지 않았다.
- 공개 smoke: 홈 200, 홈페이지 nosniff/X-Frame-Options/CSP/HSTS 확인, JS/CSS/박 분석/변환 Worker 4파일 SHA-256 일치. 없는/미승인 분석정보 404, 인증 없는 검토 API 404. 로컬 검토 API의 remoteAvailable=true 및 후보 3건 확인. 공개 데이터 쓰기/음원 업로드/실제 후보 승인·반려 없음.
- 전체 117파일647테스트, 최종 응답 경로 보완 집중 3파일12테스트, 타입/i18n/분리 빌드/앱 경계/공통 구조/배포 빌드 통과. root/배포 npm audit 0건. 청크 크기/Node localStorage 경고 유지.
- 승인된 공용 분석정보는 아직 0건이다. 로컬에서 검토·승인 후 다음 발행에 포함한다. 기존 기기 보관 음원은 유지한다. 실기기 청취·공개 부하/공격 시험은 하지 않았다.
