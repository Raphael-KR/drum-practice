# 0.10.2 의존성·보안 릴리스

- 목표: pnpm 실행 버전·중앙 카탈로그 설치·OSMD 패치·minimatch 보안 수정을 검증된 main 코드로 공개 반영한다.
- 범위: 이전 두 로컬 커밋과 이번 의존성/설정/호환성 검사/문서 변경, 두 앱 공통 버전, GitHub PR·CI·main 병합, 기존 player Site 발행.
- 완료 조건: 전체 로컬 검사와 변경 영향의 브라우저 검수·PR/main CI·독립 Sites 빌드·공개 파일 대조가 통과하고 결과 기록 및 병합 브랜치 정리를 마친다. Safari MCP 실패 시 프로젝트가 허용한 대체 경로와 한계를 기록한다.
- 제외 범위: 제작기 공개, 새 사용자 기능, 원본 악보·저장 스키마 변경, 공개 범위 변경, iOS/iPadOS 실기기·시뮬레이터 검증, 유보된 iPhone 재로드 진단.
- 검증: 기존 실제 자산의 `pnpm run verify`, audit·frozen 설치·카탈로그/패치/악보 보존, Safari 두 앱 악보 렌더링/재생, Sites의 소스·자산·공개 응답 대조.

## 후보와 버전 선택

- 시작 HEAD는 `dd0b120`이며 main이 origin/main보다 두 커밋 앞선 상태다. `507d079`는 제작기 PC 전용 문서, `dd0b120`은 카탈로그 갱신 작업 상태 보관이다. 이번 릴리스 브랜치에서 두 커밋과 승인된 미커밋 변경을 함께 검토한다.
- 새 기능이나 저장 계약 변경을 추가하지 않는 기존 실행·보안 보완이므로 두 앱 0.10.1 → 0.10.2 patch를 선택한다. 공용 `package.json` 버전은 앱 표시 버전으로 사용하지 않는다.
- 세부 개발 근거는 [pnpm·카탈로그·OSMD 동기화](pnpm-catalog-sync-20261108.md), [minimatch 보안 수정](minimatch-security-20261108.md)을 따른다. 해당 기록의 이전 빌드·검사 결과와 이번 릴리스 후보를 구분한다.
- 릴리스 UI 확인은 로컬 실제 자료를 사용한다. OSMD 2.3.0 변경의 두 앱 렌더링·1줄/2줄 전환·재생 진행을 집중 확인하며 실제 기기·사람 청취 검수로 확대하지 않는다.

## 실행 결과

### 로컬 후보 검증

- 두 앱 0.10.2, 소스 빌드 `6a539cdfde15`. Node 26.13.0·pnpm 12.18.0의 `pnpm run verify`가 통과했다: lint·445파일 서식·앱/도구/hosting 타입·의존 경계·154문서·17로컬 자산·131파일 797테스트·두 앱 빌드. `.tmp/release-0.10.2/verify.log`에 보존했다.
- 전체 의존성 audit의 모든 심각도가 0건이다. 중앙 YAML/사본 일치와 OSMD의 JSZip 공유 검사도 통과했다. 수록 악보 6개의 원본 해시는 이전 단계와 같고 OSMD 설치 파일 해시는 `518fb32b825513b5d301595593f5f52af0034c41bde8a7950ab35eaf7db198ad`를 유지한다.
- Safari MCP는 새 탭을 `visibilityState=hidden`, active=false로 열어 앱의 첫 `requestAnimationFrame`이 진행하지 않았다. 실제 오류/경고 로그는 없었으며, 별도 사용자 Safari 창을 변경하거나 종료하지 않았다. 프로젝트의 대체 경로 기준에 따라 ego-browser를 사용했고 생성한 Safari 검수 탭만 닫았다.
- ego-browser/Chromium의 실제 viewport 685×941에서 두 앱의 Loveholic MusicXML 123마디 표시와 1줄/2줄 전환을 확인했다. 실제 렌더 정책은 `osmd-2.3.0:drum-print-ribbon-v36-wedge-stop-anchor:svg1500:quarter-native:rows4`였다. 화면 크기 모사를 Safari/iPad 검증으로 간주하지 않는다.
- 드럼연습실의 실제 재생 버튼으로 AudioContext `running`·1→41마디 진행·일시정지를 확인했다. 처음/1줄 보기로 돌린 뒤 목록 저장·재열기에서 Loveholic·123마디·1마디·ribbon 유지도 확인했다.
- 제작기에서 편집 열기와 MusicXML 표시를 확인하고 내용 변경 없이 편집 창을 닫았다. 실제 재생 버튼으로 AudioContext `running`·위치 0→2.05초 진행·일시정지와 2줄 표시를 확인한 뒤 처음/1줄 보기·목록으로 복귀했다. 계측은 실제 플레이어의 컨텍스트를 관측했고 별도 플레이어를 생성하지 않았다.
- 초기 검수 스크립트는 두 호스트의 제목/위치 ID와 ready 조건을 혼용해 대기 시간초과가 났다. 실제 DOM·소스를 확인해 검수 식별자를 정정했으며 앱 코드는 변경하지 않았다. 임시 오디오 계측은 페이지 종료로 정리했다. 캡처·관측 JSON은 `.tmp/release-0.10.2/`에 보존했다.
- 실제 iOS/iPadOS 기기·시뮬레이터·사람 청취와 유보된 iPhone 재로드 진단은 수행하지 않았다. Ego Lite 0.6.2.5의 업데이트 알림은 앱 릴리스와 분리하며 도구를 임의 업그레이드하지 않는다.

### Git·발행

- 구현 커밋 `797c1d76b0015eaa307f6e5721868ee7c77e2742`를 `codex/release-0.10.2`에 push하고 [PR #30](https://github.com/Raphael-KR/drum-practice/pull/30)의 자체 검토·ready·main 병합을 마쳤다. 앞선 두 로컬 커밋도 포함하며 이력을 재작성하지 않았다. 자체 검토에서는 소스/저장 스키마 보존, 기록 위치, 패치의 JSZip 모듈 외 바이트 일치, minimatch 적용 범위와 검사 대상 보존을 확인했다. 독립 검토로 표현하지 않는다.
- 최신 head의 [PR CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42444227611)와 제품 main `a80d9bf7b1aaf05ad651f2c07e834af71612e3b5`의 [main CI](https://github.com/Raphael-KR/drum-practice/actions/runs/42444489073)가 성공했다. PR head/main Git tree는 `ccf2843217a5e8330ee764f68f123b4f3eee384a`로 같다. 코드·의존성·설정·검사 자산이 같아 위 전체 검사 결과를 재사용하고 main에서 두 앱을 다시 빌드했다. 소스 빌드 `6a539cdfde15`를 재현했다.
- clean으로 확인한 기존 Sites checkout을 공식 helper로 열고 정본 main의 player만 준비했다. pnpm 12.18.0의 공급망 정책 검사·독립 frozen 설치·Sites 빌드와 정본 `dist/player` → 사본 `player-assets` → Worker 출력의 실제 manifest 48파일 SHA256 대조가 통과했다. HTML 두 파일은 Worker가 전달한다. Sites 의존성 audit도 모든 심각도 0건이다.
- Sites 소스 `10a5ecd42b4ead3f4eb9a2fc3222b0f678da1c39`, 저장 버전 94 (`appgprj_6ab0790baa048191aaee49f58c1ffe7b~appgver_c7dda6edbc4881918a150b6902f289f9`), 배포 `appgdep_6aeff2c31aa08191b157b979f1cbc595`: **succeeded**, **2026-11-08 12:56:01 KST** / `2026-11-08T03:56:01.768445+00:00`. 기존 Site ID·public audience·[공개 주소](https://drum-practice-studio.dgkma.chatgpt.site)를 유지했다. 제작기는 공개하지 않았다.
- 아카이브 `local-archives/releases/release-0.10.2.tar.gz` SHA256 `fea7f9970c9616fa2022fc490e2db6adb864dd1e691d3600fee669f3e359ec7d`. Sites tar content hash `sha256:e0af3df8969f4b80ed4f515332c777f04914af4df7ad03adb8568a8dec2268fa`와 gzip 파일 해시는 구분한다.
- 공개 읽기 52항목 통과: HTML 3경로의 최신 번들·nosniff/프레임/CSP/HSTS, 정적 46파일 전체 SHA256(수록 6곡·폰트·JS/CSS·Worker 포함), 폐기 API 3경로 404. 같은 Ego 공간에서 공개 목록과 `v0.10.2 · build 6a539cdf` 표시를 확인한 뒤 검수 공간을 종료했다. 공개 파일 일치를 공개 재생·청취·Safari/iOS 장기 안정성 검증으로 확대하지 않는다.
- 기존 OSMD 정적/동적 import·큰 청크와 Node localStorage 실험 API 경고는 비차단으로 기록했다. 검사 기준·보안 정책을 끄지 않았다. 유보된 iPhone 재로드 원인의 해결을 이번 의존성 갱신으로 주장하지 않는다.
- 근거 `.tmp/release-0.10.2/`: `verify.log`, `audit.json`, 브라우저 캡처/재생 관측, `pr-ci.json`, `main-ci.json`, `main-input-proof.json`, main/Sites 빌드·설치 로그, `sites-audit.json`, `parity.json`, `site-package.json`, `site-version.json`, `site-deployment.json`, `smoke.json`, 최종 `receipt.json`. 결과 문서만 별도 PR로 반영하며 제품 버전·발행을 반복하지 않는다. 이번 병합 브랜치 정리와 최종 main 일치는 receipt에 남긴다.
