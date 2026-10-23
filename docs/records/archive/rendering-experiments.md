# 조판 시안과 검증 기록

문서 역할: **사실·연구 기록**. 원문 날짜·입력·환경·결과·실패·미확인은 각 절의 당시 상태다. 이번 통합에서 과거 검증을 재실행하지 않았으며, 기록의 “현재”는 원래 작성 시점이다. [기록 안내](../README.md)와 [현행 정본](../../RULES-INDEX.md)을 구분한다.

아래 `data/production/` 자료는 로컬에 보존한 Git 제외 증거다. CI나 원격 저장소에서 열 수 있는 링크로 제공하지 않으며, 원래 경로와 당시 검증 의미를 기록한다.

<a id="musicxml-troubleshooting--독립-svg에서-섹션-끝-숫자가-박스를-벗어남-2026-10-23"></a>

### 독립 SVG에서 섹션 끝 숫자가 박스를 벗어남 (2026-10-23)

- 원인: 한국어 앱에서 generic sans-serif로 계산한 글자 폭과 언어 정보가 없는 독립 SVG의 실제 글자 폭이 다르다. Chorus 1은49.859375→57.796875로 커졌다. VexFlow의 박스 계산 자체와 실제 출력 글꼴 선택이 다른 문제다.
- 승인된 해결: 악보의 모든 텍스트를 Pretendard로 통일했다. 공식 WOFF2를 공통 조판 전에 로딩하고 native 측정/출력·HTML 가사에 같은 글꼴을 사용한다. 독립 SVG에는 실제 폰트와 고지를 내장하고 XML에는 표준 글꼴 이름을 기록한다. 음악 기호 전용 글리프는 유지한다.
- 검증: 실제 두 곡6쪽·81언어/섹션 조합, 네 경로108섹션과 과거 숫자/기호60위치의 프레임 포함, HTML 가사·XML 음악 보존 및 전체756테스트 통과. 고정폭 글꼴이나 문자열 생략으로 해결하지 않았다.
- 다음 기준: 폰트/폭 변경 시 최소 표시 offset 재탐색. 한국어 HTML 안의 경계 검사만으로 독립 SVG 검수를 대신하지 않는다. Error.stack만 남기면 Safari에서 실제 메시지가 빠질 수 있으므로 오류 message와 stack을 함께 기록한다.
- 상세: [원인·자산·시행 기록](rendering-experiments.md#rehearsal-font-fix-20261023--섹션-테두리의-글꼴-측정출력-일치), [최신 전체 결과](rendering-experiments.md#section-direction-final-20261023--갑자기붉은-노을-전체-재조판).

<a id="load-timing--악보-열기-시간-측정"></a>

## 악보 열기 시간 측정

문서 역할: **기록·참고**. 당시 로딩 시간 관측. 현재 성능 보증이나 검증 결과가 아니다.

악보 목록의 열기부터 로딩 안내 종료까지 `performance.now()`로 측정한다. 서버 전송이나 저장 악보 변경은 없다. 최근 10회만 현재 탭 메모리의 `window.drumLoadTimings`에 남기고 콘솔에 `[drum-load]`로 출력한다. 새로고침하면 지워진다. 곡명·음원·악보 내용은 기록하지 않는다.

각 결과는 build, outcome(success/error), totalMs, stagesMs를 가진다. 단위는 밀리초다.

- opening: 최초 안내 표시 대기와 이전 재생 세션 정리.
- read: `loadPracticeRecord` 호출부터 반환까지. IndexedDB 조회와 레코드 복원 포함.
- conversion: 준비 모듈 로드, MusicXML 읽기와 정규화.
- rendering: `renderMusicXML` 렌더링/캐시 경로 및 결과 기하정보 적용. 캐시 적중 시 짧을 수 있다. OSMD 내부의 순수 그리기 시간만을 의미하지 않는다.
- screen: 재생 화면과 악보 표시 자산 준비. 음원 준비 전후의 구간을 합산한다.
- audio: `player.load` 음원 준비/디코딩.

이 수치는 경과 시간이며 진행률이 아니다. 실패 시 실패 지점까지 기록하고 오류 후 목록 복구 시간은 제외한다. 최종 화면의 픽셀이 실제 표시된 시각이나 오디오 출력 지연을 측정하지 않는다.


원문 출처: `docs/architecture/LOAD-TIMING.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="load-timing--site-비교"></a>

### Site 비교

동일한 악보를 열어 첫 실행과 반복 실행을 각각 수집한다. 빌드번호와 단계별 ms, outcome을 비교한다. 첫 실행과 반복 실행의 캐시 차이를 구분한다. Site에서 실제 측정하기 전에는 병목을 단정하지 않는다.

<a id="load-timing--2026-10-06-0007-kst--公開-site-safari-실측"></a>

### 2026-10-06 00:07 KST — 公開 Site Safari 실측

- 대상: 공개 Site, player 0.6.28 / build 77cf94bc2e4f. Mac Safari MCP 탭. iPad 실측 아님.
- 이 브라우저의 Site 저장소가 비어 있어 기본 제공 바람과 언덕의 발라드를 가져온 후 열기 측정. 가져오기 네트워크 요청은 4571ms로 별도 구간이며 아래 열기 시간에 포함하지 않는다.
- 전 회 성공. 기록은 ms.

| 회차 | 최초 표시/정리 | 읽기 | 변환 | 렌더링 | 화면 준비 | 음원 | 합계 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 첫 열기(숨겨진 탭에서 시작) | 23004 | 18 | 102 | 1807 | 1056 | 309 | 26296 |
| 다시 열기(visible) | 4 | 22 | 31 | 40 | 994 | 288 | 1379 |
| 다시 열기(visible) | 2 | 27 | 25 | 38 | 1014 | 300 | 1406 |

첫 열기는 document.visibilityState=hidden 상태에서 시작했다. 로딩 안내는 “악보 읽는 중…”이었지만 실제 읽기 전 requestAnimationFrame 대기였다. Safari 활성화 및 탭 선택 후 visible이 되면서 완료됐다. 첫 열기 전체 26.296초를 일반적인 visible 로딩으로 해석하지 않는다. 표시/정리 대기를 제외한 첫 실행 처리 합계는 3292ms다.

이 환경의 읽기는 18~27ms로 병목이 아니었다. 첫 렌더링 1807ms, 반복 렌더링 38~40ms. 반복 열기의 대부분은 화면 준비 994~1014ms였다. 사용자 기기의 원인으로 일반화할 수 없다. 발견된 별도 문제는 읽기 전 표시 대기에도 읽기 문구가 나오는 점과 hidden 탭의 rAF 대기다. 이 측정 작업에서는 코드 수정·발행하지 않았다.

<a id="osmd-upgrade-20261023--osmd-221-업데이트"></a>

## OSMD 2.2.1 업데이트

- 목표: 사용자 요청에 따라 OSMD 2.1.2를 확인된 최신 안정판 2.2.1로 업데이트한다.
- 범위: 루트 npm 의존성·lockfile·로컬 설치, 필요한 호환성 수정과 생성 정보·검증 기록.
- 완료 조건: 설치/lockfile 버전 일치, 관련 검사와 두 앱 빌드, 실제 악보의 공통 조판·섹션 XML 위치·지시문 offset·크레센도 확인.
- 제외: 기존 악보·음원·패키지 교체, 새 작곡·최소 offset 탐색 기능, 앱 릴리스 버전 변경·커밋·push·발행.
- 검증: 기존 테스트와 실제 보존 XML을 사용한다. 기존 섹션·크레센도 개발 변경을 보존하고 업데이트 전/후 근거를 `.tmp/osmd-upgrade-20261023/`에 기록한다.


원문 출처: `docs/architecture/OSMD-UPGRADE-20261023.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="osmd-upgrade-20261023--대상-버전"></a>

### 대상 버전

설치본과 lockfile은 2.1.2였다. 앞선 GitHub `/releases/latest` 조회는 2.2.0으로 연결됐지만, 이번 공식 npm `latest` 재조회는 **2.2.1**을 반환했다. [공식 2.2.1 릴리스](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/releases/tag/2.2.1)에서도 2026-10-12 공개를 확인했다. 실제 배포 metadata·다운로드 무결성과 설치 결과가 일치했다.

2.2.1은 direction/words의 offset 계산, 타악기 오선 수, rehearsal 테두리 크기 등 관련 조판 수정이 포함된다. 업데이트만으로 모든 MusicXML 위치 속성이 지원되지는 않는다. 설치된 native rehearsal reader에는 여전히 가로 위치 속성 지원이 없어 현재 앱의 XML rehearsal 공통 보완과 크레센도 처리를 유지했다.

<a id="osmd-upgrade-20261023--실행검증"></a>

### 실행·검증

`npm install opensheetmusicdisplay@^2.2.1 --ignore-scripts --no-audit --no-fund`로 패키지 1개를 변경했다. `package.json`·lockfile·로컬 설치본 모두 2.2.1이며 전이 의존성 변경은 없다. npm 배포 metadata의 무결성 값과 lockfile이 일치했다. 실제 번들 SHA-256은 `224ee5bee61d31ff3d07ade025f931a6cecd394cb54d2e39b1e7af2f0c7f1f5d`다.

- `npm run verify` 통과: lint, 413파일 서식, 앱/도구/hosting 타입, i18n·playback·문서/구조 검사, **126파일 756테스트**, editor/player 빌드와 player 경계 검사. 기존 큰 청크·Node localStorage 경고는 남는다.
- 실제 Safari 공통 renderer의 16회 native 조판에서 `2.2.1-release`를 확인했다. 캐시 정책에는 `osmd-2.2.1`이 자동 반영되어 구 버전 캐시와 구분됐다.
- 갑자기 93마디·붉은 노을 137마디의 print/timeline/rows/grid에서 섹션 108위치를 확인했다. 보존된 위치 비교 입력 2개까지 포함한 총 **228위치**가 XML 속성에 맞았다. 붉은 노을 26·134마디의 `default-x` 0→100은 섹션 바깥선을 정확히 100 SVG 단위 이동했다.
- 동일 두 마디의 표시 offset 1.5→1.5625박은 지시문을 각각 5.125/11.734375 SVG 단위 이동했다. 새 엔진에서도 **0.0625박 간격이 실제 SVG에 반영**됐다. 전곡 최소 충돌 offset을 결정한 결과는 아니다.
- 갑자기 1–4마디 크레센도가 세 연주 pass에서 이어졌고, 여러 마디 wedge 경계·표시 폭을 검사했다. 4입력 모두 즉시 재열기 시 추가 native 조판 0회였다.
- Safari에서 갑자기 1·5마디, 붉은 노을 26·134마디를 확인했다. 인쇄용 SVG 6쪽과 대표 화면을 보존했다. 실제 iPad·청취·모든 주법의 전수 대조는 이번 범위에 포함하지 않았다.

업데이트 전/후 해시로 공통 조판 코드·앱 버전 파일 5개, 기존 수록 패키지 6개, 원본 후보 XML 2개의 보존을 확인했다. 기존 working tree와 diff도 보존했다. 소스 빌드번호는 `4d301e67e263`으로 갱신됐고, 두 앱 릴리스 버전은 0.8.12를 유지했다. 커밋·push·발행은 수행하지 않았다.

로컬 근거는 `.tmp/osmd-upgrade-20261023/`의 `before.json`, `working-tree-before.patch`, `installation.json`, `verify.log`, `runtime-summary.json`, `runtime/osmd-render/render.json`, `runtime/osmd-render/page-1.svg`부터 `page-6.svg`, `safari-preview-final.png`다. 구 번들도 같은 폴더에 보존했으며 원복은 실행하지 않았다.

기존 `드럼연습실 웹앱 개발` 작업(`01a0afc9-ca21-7371-9390-06eb07c017e9`)에 버전·검증·캐시 문제·범위와 근거를 전달했다. 추가 구현이나 같은 검사의 반복은 요청하지 않았다. 검증용 Safari 탭은 종료했다.

<a id="osmd-upgrade-20261023--개발-서버-캐시-문제와-해결"></a>

### 개발 서버 캐시 문제와 해결

설치 직후 기존 5173 서버의 Vite 사전 번들이 2.1.2를 유지했다. 최초 Safari 검사에서 실제 인스턴스 버전이 `2.1.2-release`여서 중단한 근거를 보존했다. 패키지 설치 성공을 새 엔진 실행으로 간주하지 않았다.

`vite.config.ts`의 내용은 유지하고 수정 시각만 갱신해 기존 Vite 서버의 설정 감지·의존성 재최적화를 유도했다. 사전 번들과 새 Safari 문서의 실제 인스턴스가 모두 `2.2.1-release`인 것을 확인한 뒤 위 검사를 완료했다. 같은 5173 서버를 사용했고 보관함·원본·곡 데이터는 초기화하지 않았다.

다음 업데이트에서도 lockfile·설치본뿐 아니라 개발 서버 사전 번들과 브라우저 인스턴스 버전을 대조한다. 불일치하면 해당 파생 번들 갱신 후 확인하며 악보 데이터나 전체 저장소를 지우는 방식으로 해결하지 않는다.

<a id="rehearsal-font-fix-20261023--섹션-테두리의-글꼴-측정출력-일치"></a>

## 섹션 테두리의 글꼴 측정·출력 일치

- 목표: 숫자·기호로 끝나는 섹션을 포함해 글자가 테두리를 벗어나는 문제를 재현·수정한다.
- 범위: 악보의 모든 텍스트(섹션·연주 지시·가사·제목)를 Pretendard로 통일하고, 파생 SVG 캐시와 글자 포함 검사를 갱신해 두 곡을 재생성한다.
- 완료 조건: 한국어 앱/독립 SVG/영어 문서에서 섹션 글자 폭이 일치하고 테두리 안에 들어간다. 오선 시작 좌측 정렬과 최소 표시 offset·원래 적용 박을 유지한다.
- 제외: 섹션 이름 수정·박 이동·음원/기존 패키지 교체, 새 PDF·패키지, 앱 릴리스 인상·커밋·push·발행.
- 검증: 실제 기존 두 곡과 과거 숫자/기호 섹션, 공통 네 경로·독립 SVG 언어 전환·전체 표시·XML/기타 자산 보존 및 관련/전체 코드 검사.

시작 HEAD `91a4e5b`, 브랜치 `codex/fix-playback-wedges`. 전역/프로젝트 지침과 현재 SVG 규칙·기존 조판/검수 기록을 확인했다. 기존 dirty 변경은 보존한다. 로컬 근거와 새 악보는 `data/production/section-direction-review-20261023/full-v10/`에 둔다.


원문 출처: `docs/architecture/REHEARSAL-FONT-FIX-20261023.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="rehearsal-font-fix-20261023--재현된-원인"></a>

### 재현된 원인

기존 출력의 `Chorus 1`은 같은 `font-size="10pt" font-weight="bold" font-family="sans-serif"`인데도 문서 언어가 ko이면 폭49.859375, en/미지정이면57.796875 SVG단위다. 기존 프레임은 폭55.859375이고 글자 시작은54이므로 독립 SVG의 글자 오른쪽은111.796875, 프레임 경로 오른쪽106.859375와 stroke 포함 바깥선107.859375를 넘는다. 숫자가 제거되거나 파싱에서 분리된 결과가 아니다.

VexFlow의 native StaveSection은 현재 문서에 임시 SVG text를 넣은 getBBox 값으로 프레임을 계산한다. 제작기/재생기는 html lang=ko이고 SVG에는 언어가 저장되지 않아 독립 파일의 generic sans-serif 실제 선택이 달라진다. 이전 검수는 같은 한국어 문서 안의 프레임·지시문 경계만 검사해 이 차이를 놓쳤다. 앞으로 내보낸 SVG의 독립 표시와 섹션 글자 포함 여부도 확인한다.

<a id="rehearsal-font-fix-20261023--승인된-해결-방법"></a>

### 승인된 해결 방법

사용자가 2026-10-23 악보의 모든 텍스트에 Pretendard를 적용하기로 확정했다. 앱 일반 UI의 글꼴은 이 범위에 포함하지 않는다. 고정폭 글꼴로 바꾸거나 섹션 문자열을 줄이지 않는다.

공식 Pretendard 1.3.9의 Regular/Bold WOFF2 원본을 프로젝트에 보존한다. 공통 조판 전에 두 굵기의 로딩을 기다리고, OSMD 일반 텍스트와 VexFlow 텍스트 및 native rehearsal의 측정·출력에 같은 이름을 지정한다. 음악 기호는 기존 전용 글리프를 유지한다. 악보 마디에 표시되는 HTML 가사도 같은 글꼴을 사용한다. 두 결과 MusicXML은 표준 word-font/lyric-font와 개별 텍스트 font-family에 선택을 기록한다.

독립 SVG에는 사용된 굵기의 원본 글꼴과 OFL 고지를 포함한다. 폰트 설치·문서 언어·외부 CDN에 의존하지 않는다. 공식 바이너리를 수정하지 않았으며, 출처·해시는 src/modules/score/vendor/pretendard/README.md에 기록한다. 파생 캐시 정책은 v26-pretendard-1.3.9다. 기존 v8은 글꼴 문제 발견 전 검수, v9는 Arial 진단 후보이며 최신 결과는 v10이다.

<a id="rehearsal-font-fix-20261023--검증-상태"></a>

### 검증 상태

완료. 최종 파일·수치·한계는 [전체 제작 기록](rendering-experiments.md#section-direction-final-20261023--갑자기붉은-노을-전체-재조판)을 따른다. 갑자기93마디/2쪽과 붉은 노을137마디/4쪽의 새 XML은 XSD·시간표·독립 적용 박 및 글꼴/words 표시 offset 외 XML 동일성을 통과했다. 최소 offset은 새 글꼴로0부터 다시 계산했다.

- 독립 SVG6쪽의27섹션 × ko/en/언어 미지정3조합81건에서 글꼴과 폭이 같고 글자가 프레임 안에 들어간다. Pretendard의 Chorus 1 폭55.171875, 글자 오른쪽109.171875, stroke 포함 프레임 오른쪽113.1875다.
- print/timeline/rows/grid의108섹션은 프레임 포함·Pretendard·좌측 정렬을 통과했다. 기존 패키지의 숫자·기호·화살표 포함 섹션 문자열60위치도 포함 검사를 통과했다. 원본 문구를 잘라내지 않았다.
- 실제 공통 HTML 가사29개의 글꼴과 위치를 확인했다. 모든6쪽 SVG의 텍스트 font-family는 Pretendard이며 페이지1 내장 두 폰트의 SHA가 로컬 공식 자산과 일치한다.
- 최종 npm run verify:126파일756테스트, lint/서식/타입/문서/두 앱 빌드와 경계 검사 통과. 근거 .tmp/pretendard-verify-20261023.log 및 full-v10/code-checks.json. 현재 앱0.8.12, 커밋·push·발행 없음.

<a id="rehearsal-font-fix-20261023--시행-중-확인한-한계와-다음-기준"></a>

### 시행 중 확인한 한계와 다음 기준

처음 로컬 base64 변환 구현은 프로젝트 공통 바이너리 코덱 사용 검사에 걸렸다. 별도 예외를 추가하지 않고 기존 encodeAsset을 재사용해 전체 검사를 통과했다.

첫 전체 탐색에서 coverage 미완료가1회 관측됐다. 당시 Safari Error.stack만 저장해 기대/실제 개수를 확보하지 못했으며 원인은 미확정이다. 로컬 실행부는 error.message와 stack을 함께 보존하도록 고쳤다. 이후 같은 공통 코드로0부터 전체 재탐색, 최종 XML 재열기, 별도6쪽 및 네 경로 검사를 통과했다. 이1회의 발생 원인이 해결됐다고 단정하지 않는다. 재발 시 실제 기대/관측 개수와 빠진 마디·페이지를 먼저 확보한다.

로컬 수신기 최초 실행은 sandbox bind 제한으로 실패했다. 승인된 loopback 쓰기 범위로 재실행했다. 실패 시 생긴 빈 evidence 폴더는 보존하고 실제 출력은 evidence-safari에 분리했다. MusicXML XSD에는 lxml이 있는 번들 Python을 쓰고, 단순 글꼴 해시 확인은 표준 ElementTree를 사용했다.

이후 검수는 한국어 앱 안의 경계뿐 아니라 내보낸 파일의 문서 언어·실제 글꼴 바이너리·독립 표시를 확인한다. 폰트나 폭이 바뀌면 표시 offset을 다시 계산한다. 기존 연주 적용 박은 유지한다.

<a id="words-position-20261023--연주-지시-words-세로-위치-지원--2026-10-23"></a>

## 연주 지시 words 세로 위치 지원 — 2026-10-23

- 목표: XML `words`의 `default-y`·`relative-y`를 제작기·재생기의 공통 native 조판에 반영한다.
- 범위: 공통 MusicXML renderer·조판 모듈·파생 캐시 정책과 출력 규칙. 제작 담당의 실제 붉은 노을 입력/진단 XML을 읽기 전용으로 사용한다.
- 완료 조건: 같은 XML에서 세로 위치가 재현되고, 위치 미지정 지시·가로 위치/적용 박·음표·rehearsal·technical을 보존한다. 완성 SVG 이동이나 곡별 좌표표를 추가하지 않는다.
- 제외: 곡별 XML·제작 도구·기존 수록 패키지/음원·저장 원본 변경, 버전 상승·커밋·push·발행.
- 검증: 실제 두 XML의 native 조판 비교, 기존 악보 회귀와 필요한 집중 검사·전체 검사·두 앱 빌드. Safari로 실제 위치·인접 요소를 확인한다. 새 합성 악보/시험 DB는 만들지 않는다.


원문 출처: `docs/architecture/WORDS-POSITION-20261023.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="words-position-20261023--근거와-현재-진단"></a>

### 근거와 현재 진단

사용자 확정 [섹션·연주 지시 7원칙](../../reference/score/rendering.md#svg-score-rules--섹션연주-지시-7가지-원칙)의 5·6번 및 2026-10-23 붉은 노을 전곡 재제작 요청을 따른다. 제작 담당은 `tools/score-production/musicxml/common/direction-offset.mjs`와 곡별 제작을 맡고, 개발 담당은 공통 앱 조판을 맡는다.

실제 입력은 로컬 `data/production/red-sunset-rebuild-20261023/input.musicxml`과 `words-y-diagnostic.musicxml`이다. 진단본은 105마디의 기존 words에 `relative-y="20"`을 지정했다. 제작 담당이 두 값의 동일한 경계를 보고했으며 개발 측에서 재현 후 결과를 기록한다.

MusicXML [words 공식 정의](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/words/)에서 `default-y`의 기준은 오선 맨 위 선이며 양수는 위쪽이다. `relative-y`는 프로그램이 계산한 기본 위치 또는 `default-y` 지정 위치에서 추가로 이동한다. 위치 지정은 음악적 적용 박을 바꾸지 않는다.

설치본 OSMD 2.2.1의 native expression·label 경로를 먼저 확인한다. 세로 위치는 native label 계산과 skyline 갱신 전에 반영하며, 위치가 없는 입력은 기존 경로를 그대로 따른다.

<a id="words-position-20261023--구현"></a>

### 구현

- `src/modules/score/words-position.ts`는 위치가 명시된 렌더 복제본 words에 충돌 없는 임시 색을 지정해 정확한 native expression 객체를 연결한다. 원래 색을 복원하며 반복 문구·마디 번호로 매칭하지 않는다.
- 해당 인스턴스의 `calculateMoodAndUnknownExpression` 안에서만 native `calculateLabel`의 skyline 질의를 조정한다. native 라벨 계산과 skyline 갱신이 같은 Y를 사용한다. `calculateLabel`, skyline 함수, 기존 default-y 단축 경로의 임시 변경은 `finally`에서 복원한다. 전역 prototype이나 완성 SVG 좌표를 바꾸지 않는다.
- native 단위는 오선 한 간격이 1이다. 상대 위치는 `nativeY − relativeY/10`, 절대 위치는 `staff.TopLineOffset − (defaultY + relativeY)/10`이다. 숫자 0·소수·음수를 유효한 좌표로 읽으며, 텍스트의 기존 정렬·X좌표와 음악적 적용 박은 유지한다.
- `musicxml.ts`의 기존 시스템 경계 계산에 위치 지정된 native 텍스트의 실제 `getBBox()`를 포함한다. 주법·음표를 옮기지 않고 재생 영역이 새 높이의 글자를 자르지 않도록 한다. 위치 미지정 입력의 SVG·영역은 기존과 같다.
- 파생 캐시는 `v28-words-position`이다. 원본 MusicXML·Song·저장 형식은 바꾸지 않는다.

<a id="words-position-20261023--지원-경계"></a>

### 지원 경계

OSMD가 mood/unknown 텍스트로 조판하는 일반 연주 지시를 지원한다. OSMD가 템포·다이내믹으로 인식한 words, words와 symbol이 섞인 라벨, 서로 다른 Y의 여러 지시를 한 라벨로 합친 경우에는 해당 라벨의 기존 native 배치를 유지하고 기대값·실제값을 경고한다. 다른 지원 가능한 지시와 악보 전체는 계속 조판한다. 템포 등 다른 경로에 전달된 임시 색도 복원한다. 이를 지원 완료로 보고하거나 첫 지시의 Y를 전체에 강제로 적용하지 않는다.

이번 실제 입력의 16개 words는 모두 일반 unknown 텍스트이며 이 제한에 해당하지 않는다. 별도 위치를 지정하지 않은 입력에는 보완을 적용하지 않는다. 폰트·조판 폭·XML의 표시 offset 및 사운드 적용 위치 규칙은 기존 정본을 따른다.

<a id="words-position-20261023--실제-입력-검증"></a>

### 실제 입력 검증

- 붉은 노을 입력 SHA-256: `69453605951019b9114e17ab38bf7c1aa737a38994b9ebb80b25114cebb02e38`.
- 진단 입력 SHA-256: `803553d0b596ccb1fbbfadf1766dec4f88153f7fc8c956b09df25da3ac3ece89`. 원본 두 파일은 수정하지 않았다.
- 기존 native 경로에서 원본/진단의 105마디 라벨과 SVG가 같아 `relative-y` 무시를 재현했다. 보완 후 인쇄·ribbon·rows·grid 모두 라벨 Y가 −4.45에서 −6.45로 바뀌었다. X·음가·타격 순서·rehearsal·O+ 상대 좌표를 유지했다. 타격 좌표 차이는 부동소수 연산 수준의 최대 `1.1546319456101628e-14` native 단위였다.
- 네 경로 모두 위치 미지정 원본의 기존/보완 SVG 및 regions가 동일했다. 지정된 글자 위 경계보다 crop 위 경계가 6 SVG 단위 위에 있어 세로 잘림을 피한다. 같은 지시가 있는 이후 시스템의 페이지 Y 이동은 native skyline에 따른 시스템 배치이며 음악적 위치 이동이 아니다.
- 기존 갑자기 후보 `data/production/section-direction-review-20261023/ioi-m5-right-v1/candidate.musicxml`의 `default-y="55"`는 native Y −5.5로 표시됐다. 러브홀릭 기존 실물 XML의 3쪽 SVG·regions는 동일했다. 새 합성 악보·시험 DB를 생성하지 않았다.
- Safari27에서 원생 SVG의 105마디를 오선 기준으로 나란히 대조했다. 실제 음표·기호 경로를 옮기지 않고 비교용 viewBox만 사용했다. 검증 JSON·화면과 임시 진단 모듈은 로컬 `.tmp/words-position/`에 보존한다. 공유 Vite HMR로 초기화된 임시 결과는 단위별 JSON 저장 후 재실행하여 보완했다.

전체 `npm run verify` 통과:126파일756테스트·lint·424파일 서식·앱/도구/hosting 타입·i18n·구조/문서·두 앱 빌드/경계. 기존 Node localStorage·큰 청크 경고는 유지한다. 빌드 `c6fbe4385d68`, 두 앱0.8.12 유지. 소스/입력/로그/화면 SHA와 검사 결과는 로컬 `.tmp/words-position/receipt.json`에 기록했다. 이 확인은 음원 청취·최종 붉은 노을 재제작·수록 교체를 뜻하지 않는다.

<a id="section-direction-final-20261023--갑자기붉은-노을-전체-재조판"></a>

## 갑자기·붉은 노을 전체 재조판

이 문서의 당시 결과는 **Pretendard 적용 v10**이다. 붉은 노을의 현재 최신판은 [7원칙·O+ 전곡 재제작](../songs/red-sunset.md#red-sunset-rebuild-20261023--붉은-노을--최신-제작-원칙-전곡-재제작)이며, 갑자기는 이 v10 이후 7원칙 전체 재제작을 아직 수행하지 않았다. v8은 독립 SVG의 글꼴 차이 발견 전 결과, v9는 Arial 진단 후보로 보존한다.

**후속 최종 원칙과의 차이:** v10은 추가 여백0·같은 마디 내 탐색 당시 결과이며 붉은 노을의 임의 표제 `기보된 카운트`가 남아 있다. 이후 확정한 [7가지 원칙](../../reference/score/rendering.md#svg-score-rules--4-구간-시작-표시)의 최소 여백·같은 줄 탐색/높이 분리·원본 표제 제한을 적용한 재제작본은 아니다. 이번 반영은 문서·스킬에 한하며 실제 XML/SVG·코드·패키지는 유지했다.

- 목표: OSMD 2.2.1로 두 곡 전체 MusicXML/SVG를 만들고 숫자·기호 섹션의 테두리 넘침을 해결한다.
- 범위: 악보의 모든 텍스트를 Pretendard로 통일하고, 섹션 좌측 정렬과 0.0625박 단위 최소 표시 offset을 XML에 기록한다. 공통 글꼴 로딩·SVG 내장·캐시와 제작 검수도 갱신한다.
- 완료 조건: 전 마디·27섹션·17지시문을 표시하며, 독립 SVG 언어별 글자 포함·정렬·최소값·XML/음악 내용 보존과 실제 가사 표시를 확인한다.
- 제외: 새 PDF·음원·패키지 생성, 보관함/수록 패키지 교체, 일반 앱 UI 글꼴 변경·버전 인상·커밋·push·발행.
- 검증: 실제 원본에서 만든 기존 XML로 전체 격자 탐색·독립 SVG·공통 네 조판 경로·규격/시간표·전체 코드 검사를 수행하고 기존 개발자에게 인계한다.

시작 HEAD `91a4e5b`, 브랜치 `codex/fix-playback-wedges`. 기존 dirty 변경·원본·과거 결과를 보존했다. 최신 출력은 `data/production/section-direction-review-20261023/full-v10/`이다.

2026-10-23 후속: 붉은 노을의 O+6곳은 [별도 harmonic·stopped 가로 교정본](../songs/red-sunset.md#red-sunset-open-close-20261023--붉은-노을-o-가로-배치-교정)으로 갱신했다. 아래 v10은 그 기준본이며 새 O+ 교정의 음가·박은 유지한다. 이 후속도 최종7원칙 전체 구현이나 기존 수록 패키지 교체를 뜻하지 않는다.


원문 출처: `docs/score-production/SECTION-DIRECTION-FINAL-20261023.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="section-direction-final-20261023--전체-결과"></a>

### 전체 결과

| 곡 | 전체 SVG | MusicXML | 드럼 파트 길이 | 섹션·지시문 |
|---|---|---|---|---|
| 갑자기 | 전체 2쪽 (로컬 `data/production/section-direction-review-20261023/full-v10/ioi-suddenly/full-score.svg`) | 정본 (로컬 `data/production/section-direction-review-20261023/full-v10/ioi-suddenly/score.musicxml`) | 93마디·372사분음표 | 12·1 |
| 붉은 노을 | 전체 4쪽 (로컬 `data/production/section-direction-review-20261023/full-v10/red-sunset/full-score.svg`) | 정본 (로컬 `data/production/section-direction-review-20261023/full-v10/red-sunset/score.musicxml`) | 137마디·550사분음표 | 15·16 |

`full-score.svg`는 원생 페이지를 세로로 연결한 열람용 합본이다. 원생 `page-N.svg`와 Safari `page-N.png`, 공통 가사/마디 표시 `review.png`를 각 곡 폴더에 보존했다. 음표·글자 좌표를 곡별로 후처리하지 않았다. 실제 수록 패키지는 유지했다.

<a id="section-direction-final-20261023--글꼴과-넘침-원인"></a>

### 글꼴과 넘침 원인

사용자는 악보의 섹션·연주 지시·가사·제목을 Pretendard로 통일하기로 확정했다. 공통 조판기는 공식 1.3.9 Regular/Bold 원본 WOFF2를 측정 전에 로딩하고 native rehearsal도 같은 글꼴로 측정·출력한다. HTML 가사도 같은 글꼴이다. 음악 기호는 전용 글리프를 유지한다.

v8의 generic sans-serif는 한국어 앱에서 `Chorus 1` 폭49.859375였으나 독립 SVG에서는57.796875였다. 문서 언어에 따른 실제 선택 글꼴 차이가 박스를 벗어나는 원인이다. v10은 같은 문자열이 ko/en/언어 미지정에서 모두55.171875이고 테두리 안에 들어간다. 자세한 원인·코드/자산·재현은 [글꼴 수정 기록](rendering-experiments.md#rehearsal-font-fix-20261023--섹션-테두리의-글꼴-측정출력-일치), 수정 전 (로컬 `data/production/section-direction-review-20261023/full-v10/chorus-1-before.png`)·수정 후 (로컬 `data/production/section-direction-review-20261023/full-v10/chorus-1-pretendard.png`) 화면을 따른다.

MusicXML은 word-font/lyric-font와 rehearsal/words/lyric text의 font-family에 선택을 저장한다. XML에는 글꼴 바이너리를 넣지 않는다. 프로젝트 SVG는 사용한 굵기의 WOFF2와 OFL 고지를 내장해 독립 파일에서도 같은 바이트로 표시한다. 두 로컬 폰트는 합계1,557,048바이트이며, 내장 후 원생6쪽 SVG는 합계17,426,633바이트다. SVG 이식성을 위해 파일 크기가 늘었다. 외부 앱이 MusicXML을 조판할 때는 해당 글꼴 지원/설치가 필요하다.

<a id="section-direction-final-20261023--최소-표시-offset"></a>

### 최소 표시 offset

| 곡·마디 | 추가 표시 offset(사분음표 박) |
|---|---:|
| 갑자기 5 | 0.4375 |
| 붉은 노을 26, 34, 58, 66, 82, 106 | 1.0625 |
| 붉은 노을 50, 74, 134 | 1.125 |
| 붉은 노을 114 | 1.3125 |
| 붉은 노을 30, 54, 78, 105, 118, 136 | 0 |

divisions96에서 한 단계는6 divisions다. 과거 +1/+1.5박 후보를 정답으로 복사하지 않고 0부터 순차 탐색했다. 이동한11지시문은 더 작은 모든 단계와 최종값 직전 단계에서 겹쳤다. 최종 지시문끼리도 겹치지 않는다. 추가 고정 여백을 강제하지 않은 실제 경계의 최소값이다.

이 값은 전체 SVG 폭1500·현재 폰트/조판 정책의 최소값이다. 다른 폭·다른 소비자의 최소값으로 일반화하지 않는다. print/timeline/rows/grid에서는 섹션의 글자 포함·글꼴·좌측 정렬을 검사했으며, 세 연주용 배치의 지시문 최소화까지 검사한 것은 아니다.

<a id="section-direction-final-20261023--검증과-보존"></a>

### 검증과 보존

- MusicXML4.0 로컬 XSD, 유리수 음표 시간표·원래 적용 박과 XML 전체 비교 통과. 허용한 차이는 텍스트 글꼴 속성/기본 글꼴 요소와 words의 표시 전용 offset이다. wedge offset·note·가사 내용·메타정보·템포·반복/페이지/시스템 정보는 동일하다. 드럼 note 요소는 쉼표 포함1047/1563개다.
- direction의 원래 cursor·voice·staff를 보존하고 `offset sound="no"`만 표시용으로 사용했다. 독립 원본 audit의17개 적용 첫 박과 일치한다. 음원 첫 박·BPM·연결을 새로 분석하거나 변경하지 않았다.
- 실제 OSMD `2.2.1-release`, 정책 `v26-pretendard-1.3.9`. 독립 SVG6쪽·27섹션의3언어 조합81건에서 동일 폭·박스 포함을 확인했다. 원생6쪽과 공통 검수 화면도 직접 보았다.
- 네 조판 경로의108섹션에서 글자 포함·Pretendard·마디 오선 시작 좌측 정렬을 확인했다. 최대 수치 오차0.000008965 SVG단위로 기존1e-5 허용치 이내다. 기존 수록곡의 숫자/기호/화살표가 포함된 섹션·지시가 합쳐진 기존 문자열60위치도 네 경로에서 프레임 안에 들어갔다. 문자열을 새로 만들어 검사하지 않았다.
- 공통 검수의 갑자기8마디에서 실제 HTML 가사29개·Pretendard를 확인했다. 붉은 노을 대표12마디와 이미지 디코딩/표시도 통과했다. 두 검수 dialog와 임시 URL은 dispose했다. 원본을 새로 전수 채보하거나 실물 iPad·청취·실제 앱 저장을 검수한 결과가 아니다.
- 최종 앱 코드의 `npm run verify` 통과: lint·416파일 서식·앱/도구/hosting 타입·i18n/playback/구조/문서·126파일756테스트·두 앱 빌드·player 경계. 근거 `.tmp/pretendard-verify-20261023.log`, 후보 소스 해시는 `full-v10/code-checks.json`이다. 기존 큰 청크·Node localStorage 경고는 유지된다.
- 시작 전 기록한 기존6수록 패키지·v8 XML2개·의존성2파일의10해시를 보존했다. 앱 버전은 두 앱 모두0.8.12다. 별도 버전 인상·커밋·push·발행은 하지 않았다.

XML SHA-256: 갑자기 `8f3ad3a47aa4453dc19fb71a514761f0665d9a429327478712c352852de6eaaf`, 붉은 노을 `d010258530d72451c283f7b046c1c23092ff2c10711f8bf43309859d4e8311ce`.

<a id="section-direction-final-20261023--재현과-근거"></a>

### 재현과 근거

공통 탐색은 `tools/score-production/musicxml/common/direction-offset.mjs::fitDirectionOffsets`다. 입력/엔진 기대값은 로컬 `full-v10/run.mjs`, 구조 비교는 `audit-xml.py`, 실제 네 경로/HTML 검수는 `review-font.mjs`, 독립 언어 검수는 `inspect-svg.mjs`에 분리했다. 표준 XML 사본과 실제 앱 renderer를 쓰며 원본을 덮어쓰지 않는다.

구조 검사는 번들 Python3.12와 프로젝트 로컬 schema를 쓴다. 탐색 결과는 `evidence-safari/osmd-render/render.json`, 곡별 `report.json`·`regions.json`, `summary.json`이며 독립 표시·공통 화면은 `standalone-svg-check.json`, `review-font.json`, `legacy-font-check.json`, `browser-check.json`에 보존했다. 보고서는 XML/소스 SHA와 결합한다.

과거 v8의 제작/인계 근거는 `full-v8/`에 보존한다. 05:18:18 KST 개발 접수와 해시 확인은 v8에 대한 것이며 이번 v10 접수로 대신 쓰지 않는다. v9 Arial은 진단 후보다.

<a id="section-direction-final-20261023--개발-인계"></a>

### 개발 인계

공통 인계 도구로 실제 파일·XML/코드 해시에 결합된4검사 근거에서 초안을 조립했다. 두 곡 제목·기존 음원 메타정보와 전송용 본문을 검토했다. 2026-10-23 05:59:34 KST에 기존 개발자 `01a0afc9-ca21-7371-9390-06eb07c017e9`로 전송 접수를 확인했다. 실제 본문은 `full-v10/handoff/handoff.md`, 본문 SHA와 도구 접수는 `delivery.json`에 보존했다. 기존 수록 패키지는 유지하며, 전송 접수를 앱 반영·청취 완료로 해석하지 않는다.

검수용 Safari 탭은 닫았고 두 공통 overlay/URL과8917 파일 수신기를 정리했다. 다른 사용자 탭은 유지했다.

수신자 turn `01a16569-1c22-7ea0-811d-56e954100c0d`에서 v10 산출물/공통 글꼴 변경의 파일·해시 확인에 착수했다. 재시험이나 수록 교체를 하지 않겠다고 확인했다. 관측 상태는 검토 착수이며 앱 반영 완료와 구분한다.

<a id="section-direction-layout-review--섹션-표제연주-지시의-svg-공동-검토"></a>

## 섹션 표제·연주 지시의 SVG 공동 검토

최신 결과: [OSMD2.2.1 전체 재조판·최소 표시 offset](rendering-experiments.md#section-direction-final-20261023--갑자기붉은-노을-전체-재조판). 두 곡 전체 SVG·MusicXML과 최종 검증은 이 문서를 따른다. 아래 v1~v7은 당시 시안·조사/표본 기록으로 보존한다.

2026-10-23 사용자 결정. 조사 시작 HEAD `91a4e5b`.

- 목표: 섹션 표제와 연주 지시를 분리하면서 겹치지 않게 배치할 방법을 사용자와 비교한다.
- 범위: 보존된 SVG 18파일과 현재 수록 패키지 6곡의 MusicXML 및 내장 SVG 19쪽을 조회했다.
- 완료 조건: 관련 페이지 링크와 과거/현재/검토 후보의 구분, 결정의 정본 반영.
- 제외: 새 조판 방식 확정, 기존 악보·앱·패키지 교정, 커밋·push·발행.
- 확인: 실제 패키지 내장 SVG의 압축만 풀어 별도 폴더에 보존했다. 악보를 재생성하지 않았으며 새 화면/청취 검사는 하지 않았다.


원문 출처: `docs/score-production/SECTION-DIRECTION-LAYOUT-REVIEW.md`. 원래 날짜·상태·실행 경로는 위 원문 기준이다.

<a id="section-direction-layout-review--초기-의미-결정과-후속-배치-승인"></a>

### 초기 의미 결정과 후속 배치 승인

섹션은 `rehearsal`, 별도 텍스트 연주 지시는 별도 `words`로 보존한다. 겹침을 피하려고 둘을 하나의 섹션 이름으로 합치지 않는다. 구체적인 가로/세로 위치와 충돌 해결 방식은 이 자료를 함께 보며 정한다. [입력 의미](../../reference/score/notation.md#score-musicxml-osmd-mapping--섹션-표제와-연주-지시)와 [SVG 규칙](../../reference/score/rendering.md#svg-score-rules--4-구간-시작-표시)을 따른다.

후속 사용자 승인: 섹션 테두리를 해당 마디의 오선 시작점에 좌측 정렬한다. 연주 지시는 기준 음표 머리 중심에서 시작하고, 섹션과 겹치면 같은 줄에서 처음으로 여백을 확보하는 다음 음표에 표시한다. 적용 마디·박은 유지한다. 자리가 없는 경우 별도 높이를 사용한다. 아래 전체 v2는 이 승인에 따른 결과다. 이 문서 앞부분의 제외/조사 범위와 v1의 미확정 설명은 당시 상태다.

<a id="section-direction-layout-review--분리-교정이-필요한-현재-수록본"></a>

### 분리 교정이 필요한 현재 수록본

현재판은 두 문구를 합쳐 놓은 상태이므로 이것을 실제 겹침이 있는 판과 혼동하지 않는다.

| 곡 | 해당 마디 | 실제 수록 패키지에서 추출한 SVG |
|---|---|---|
| 갑자기 | 5: `A · Closed H.H →` | 1쪽 (로컬 `data/production/section-direction-review-20261023/current/ioi-suddenly/page-1.svg`) |
| 붉은 노을 | 26·34 / 50·58·66·74 / 82·106·114 / 134 | 1쪽 (로컬 `data/production/section-direction-review-20261023/current/red-sunset/page-1.svg`) · 2쪽 (로컬 `data/production/section-direction-review-20261023/current/red-sunset/page-2.svg`) · 3쪽 (로컬 `data/production/section-direction-review-20261023/current/red-sunset/page-3.svg`) · 4쪽 (로컬 `data/production/section-direction-review-20261023/current/red-sunset/page-4.svg`) |

붉은 노을 134마디에는 `Ending · 손발 안맞춰도 좋으니 맘껏 후려주세요!`도 포함된다. H.H 표기만의 문제가 아니다.

<a id="section-direction-layout-review--보존된-과거판과-제작-출력"></a>

### 보존된 과거판과 제작 출력

build-01은 분리 표기와 겹침이 남아 있는 초기 출력이다. build-02/03과 app-01은 합쳐 놓은 후속 출력이다. 제작 문서의 겹침 기록과 SVG 텍스트 위치를 대조했으며, 모든 텍스트의 픽셀 경계를 새 브라우저에서 전수 검사한 것은 아니다.

| 곡/보존 버전 | 상태 | SVG 전체 링크 |
|---|---|---|
| 붉은 노을 build-01 | 분리 표기·겹침 원인 비교 | 1쪽 (로컬 `data/production/red-sunset/final/build-01/osmd-render/page-1.svg`) · 2쪽 (로컬 `data/production/red-sunset/final/build-01/osmd-render/page-2.svg`) · 3쪽 (로컬 `data/production/red-sunset/final/build-01/osmd-render/page-3.svg`) · 4쪽 (로컬 `data/production/red-sunset/final/build-01/osmd-render/page-4.svg`) |
| 붉은 노을 build-02 | 합친 표제 비교 | 1쪽 (로컬 `data/production/red-sunset/final/build-02/osmd-render/page-1.svg`) · 2쪽 (로컬 `data/production/red-sunset/final/build-02/osmd-render/page-2.svg`) · 3쪽 (로컬 `data/production/red-sunset/final/build-02/osmd-render/page-3.svg`) · 4쪽 (로컬 `data/production/red-sunset/final/build-02/osmd-render/page-4.svg`) |
| 붉은 노을 build-03 | 합친 표제 비교 | 1쪽 (로컬 `data/production/red-sunset/final/build-03/osmd-render/page-1.svg`) · 2쪽 (로컬 `data/production/red-sunset/final/build-03/osmd-render/page-2.svg`) · 3쪽 (로컬 `data/production/red-sunset/final/build-03/osmd-render/page-3.svg`) · 4쪽 (로컬 `data/production/red-sunset/final/build-03/osmd-render/page-4.svg`) |
| 붉은 노을 app-01 | 합친 표제 비교 | 1쪽 (로컬 `data/production/red-sunset/final/app-01/page-1.svg`) · 2쪽 (로컬 `data/production/red-sunset/final/app-01/page-2.svg`) · 3쪽 (로컬 `data/production/red-sunset/final/app-01/page-3.svg`) · 4쪽 (로컬 `data/production/red-sunset/final/app-01/page-4.svg`) |
| 갑자기 package-v1 | 합친 표제, 5마디 | 1쪽 (로컬 `data/production/ioi-suddenly-20261023/package-v1/osmd-render/page-1.svg`) |

갑자기의 합치기 전 SVG 파일은 이번 보존 경로에서 찾지 못했다. 현재 코드를 바꿔 과거 SVG인 것처럼 재생성하지 않는다. 원본 표기는 원본 확대 이미지 (로컬 `data/production/ioi-suddenly-20261023/review/page1-upper.png`)에서 `A`와 그 오른쪽 지시문으로 구분된다.

<a id="section-direction-layout-review--추가-의미-검토-후보"></a>

### 추가 의미 검토 후보

다음은 새 연습곡에서 처음부터 설명형 섹션 이름으로 작성한 항목이다. 실제 겹침이 확인됐거나 원본의 두 요소를 합친 사례라고 단정하지 않는다. 섹션 이름으로 둘 설명과 별도 연주 지시로 나눌 내용을 함께 검토할 대상이다.

| 곡 | 현재 표제 예 | SVG 전체 링크 |
|---|---|---|
| 시작전 손플기 | `A. 부드럽게 · 고르게 · 자연스러운 반동`, B–F 설명형 표제 | 1쪽 (로컬 `data/production/section-direction-review-20261023/current/preplay-warmup/page-1.svg`) · 2쪽 (로컬 `data/production/section-direction-review-20261023/current/preplay-warmup/page-2.svg`) · 3쪽 (로컬 `data/production/section-direction-review-20261023/current/preplay-warmup/page-3.svg`) · 4쪽 (로컬 `data/production/section-direction-review-20261023/current/preplay-warmup/page-4.svg`) · 5쪽 (로컬 `data/production/section-direction-review-20261023/current/preplay-warmup/page-5.svg`) · 6쪽 (로컬 `data/production/section-direction-review-20261023/current/preplay-warmup/page-6.svg`) |
| 탐탐 무빙 연습 | `A · 한 손 8분`, `B · 오른손→양손 16분` 등 | 1쪽 (로컬 `data/production/section-direction-review-20261023/current/tom-moving/page-1.svg`) |

Loveholic과 바람과 언덕의 발라드는 현재 수록 XML의 섹션명에서 이번과 같은 연주 지시 합침을 찾지 못했다. 모든 종류의 SVG 겹침이 없다는 판정은 아니다.

<a id="section-direction-layout-review--조사-근거와-다음-단계"></a>

### 조사 근거와 다음 단계

- 내장 SVG 추출 및 원본 패키지/페이지 SHA256: `data/production/section-direction-review-20261023/inventory.json`.
- 현재 수록 패키지 6개와 기존 SVG를 수정하지 않았다. 추출 경로는 `data/production/section-direction-review-20261023/current/`이며 Git 제외 자료다.
- 우선 갑자기 5마디와 붉은 노을 build-01의 26마디를 비교한다. 같은 줄에서 좌우로 띄우기, 높이를 달리하기 등 실제 적용 가능성을 연구한 뒤 방식을 확정한다.
- 배치가 정해지면 분리된 MusicXML, 섹션명 재읽기, 실제 SVG/연습 화면, 기존 음가·주법·가사·음원/패키지 보존을 확인한다. 그때 제작 변경과 앱 렌더러 변경의 담당을 구분한다.

<a id="section-direction-layout-review--갑자기-5마디-오른쪽-배치-시안-v1"></a>

### 갑자기 5마디 오른쪽 배치 시안 v1

후속 사용자 요청으로 5마디만 검토했다. 아래는 위 초기 목록 조사와 구분되는 새 검토용 렌더이며 최종 악보/앱 적용본은 아니다.

- 입력: 보존된 최종 XML의 5마디 `A · Closed H.H →`를 `rehearsal=A`와 별도 `words=Closed H.H →`로 분리했다. 검토용 MusicXML (로컬 `data/production/section-direction-review-20261023/ioi-m5-right-v1/candidate.musicxml`).
- 기존 공통 조판기로 93마디·2쪽을 렌더했다. 5마디 words에 준 표준 위치 속성(default-x/default-y/relative-x)이 이 경로에서 의도한 오른쪽 위치로 반영되지 않아 A와 겹쳤다. XML 속성만으로 해결됐다고 보고하지 않는다.
- 시안은 실제 SVG의 A 테두리 경계를 읽어 원생 words 텍스트 2노드(엔진 중복 출력)를 모두 오른쪽으로 이동했다. 지시문 세로 중심을 테두리에 맞췄고 다른 음표·마디·섹션을 이동하지 않았다. A 테두리의 stroke를 포함한 오른쪽 끝 x=90, 지시문 왼쪽 x=102, 간격=12 SVG 단위. 배치 측정 (로컬 `data/production/section-direction-review-20261023/ioi-m5-right-v1/layout-check.json`).
- 결과: 실제 화면 PNG (로컬 `data/production/section-direction-review-20261023/ioi-m5-right-v1/preview.png`), 5–8마디 확대 SVG (로컬 `data/production/section-direction-review-20261023/ioi-m5-right-v1/measure-5-8.svg`), 1쪽 전체 SVG 시안 (로컬 `data/production/section-direction-review-20261023/ioi-m5-right-v1/page-1-right.svg`). XML 분리와 SVG 위치 보정은 각각의 단계다.
- 검증: 기존 common.musicxml의 로컬 schema resolver로 MusicXML 4.0 검사 통과. 분리한 direction을 메모리에서 되돌린 구조가 기존 XML과 완전히 동일함을 확인했다(XML 검사 (로컬 `data/production/section-direction-review-20261023/ioi-m5-right-v1/xml-check.json`)). schema를 resolver 없이 직접 읽으면 xml:lang 선언을 못 찾으므로 기존 공통 검사기를 사용한다.
- 환경/한계: Safari MCP는 Transport closed로 실패해 승인된 ego-browser/Chromium으로 실제 SVG를 확인했다. 병행 앱 수정의 HMR로 임시 검토 DOM이 초기화되어, 저장한 SVG를 정적 페이지로 열어 배치·캡처를 이어갔다. Safari·iPad 검증, 앱 공통 충돌 처리 구현, 현재 패키지 교체는 하지 않았다. 이번 시안의 12단위 간격을 모든 곡의 확정 규칙으로 확대하지 않는다.

<a id="section-direction-layout-review--두-곡-전체-v2--음표-앵커-배치"></a>

### 두 곡 전체 v2 — 음표 앵커 배치

사용자가 위 원칙으로 갑자기와 붉은 노을 전체 악보를 요청했다. 원본 완성 XML을 새 폴더로 읽어 분리한 뒤 현재 공통 조판기로 전체 렌더하고 제작용 SVG 배치 함수를 적용했다. 새 XML의 적용 마디/박은 원래대로 유지한다. 기존 최종 XML·패키지·수록 파일은 교체하지 않았다.

| 곡 | MusicXML | 전체 SVG | 대표 화면 |
|---|---|---|---|
| 갑자기 93마디 | XML (로컬 `data/production/section-direction-review-20261023/full-v2/ioi-suddenly/score.musicxml`) | 1쪽 (로컬 `data/production/section-direction-review-20261023/full-v2/ioi-suddenly/page-1.svg`) · 2쪽 (로컬 `data/production/section-direction-review-20261023/full-v2/ioi-suddenly/page-2.svg`) | 5마디 (로컬 `data/production/section-direction-review-20261023/full-v2/ioi-suddenly/section-preview.png`) |
| 붉은 노을 137마디 | XML (로컬 `data/production/section-direction-review-20261023/full-v2/red-sunset/score.musicxml`) | 1쪽 (로컬 `data/production/section-direction-review-20261023/full-v2/red-sunset/page-1.svg`) · 2쪽 (로컬 `data/production/section-direction-review-20261023/full-v2/red-sunset/page-2.svg`) · 3쪽 (로컬 `data/production/section-direction-review-20261023/full-v2/red-sunset/page-3.svg`) · 4쪽 (로컬 `data/production/section-direction-review-20261023/full-v2/red-sunset/page-4.svg`) | 26마디 (로컬 `data/production/section-direction-review-20261023/full-v2/red-sunset/section-preview.png`) |

<a id="section-direction-layout-review--구현검증"></a>

#### 구현·검증

- 제작 코드: `common/direction-layout.mjs`가 SVG의 실제 경계와 음표 위치를 읽어 배치한다. `section_direction_review.mjs`는 기존 renderer를 호출하는 검토용 진입점이다. 앱 소스는 수정하지 않았다.
- 갑자기: 섹션 12개·지시문 1개. A를 왼쪽으로 옮겨 첫 음표 위에서 지시문이 바로 표시된다.
- 붉은 노을: 섹션 15개·지시문 16개. 26·34·50·58·66·74·82·106마디는 표시만 quarterOffset=0.5, 114·134마디는 표시만 quarterOffset=1 위치로 이동했다. **모든 적용 박은 원래 quarterOffset=0 유지**다. 나머지 6개 지시는 기준 음표 위에 놓았다. 두 곡에서 다른 높이 fallback은 필요하지 않았다.
- 표제/지시문 사이 최소 여백은 8 SVG 단위이며 실제 글자/테두리 경계와 같은 줄 끝을 확인했다. 6쪽을 정적 SVG로 열어 폰트 로딩 후 다시 경계·음표 앵커·표제 좌측 정렬을 검사했고 실패는 0개였다. PNG 6쪽도 직접 확인했다. Chromium 확인이며 Safari/iPad 확인은 아니다.
- XML: 2곡 MusicXML 4.0 XSD 통과. 기존 음표 시간표가 같고, 분리한 direction을 메모리에서 다시 합치면 전체 XML 구조가 원본과 동일하다. 따라서 음표·주법·가사·기존 음악/음원 연결 메타데이터는 변경되지 않았다. 신규 청취·원본 재채보를 수행한 것은 아니다.
- 곡별 생성 코드 `ioi_suddenly_xml.py`, `red_sunset.py`도 별도 words를 만들도록 수정했다. 보존된 실제 추출 데이터로 초기 전사를 생성해 11곳 분리 및 XSD를 확인했다. 완성 가사·패키지 재생성을 대신하는 검사는 아니다.
- 근거: 각 곡 폴더 `xml-audit.json`, `layout-report.json`, `browser-check.json`; 생성 규칙 검사는 `full-v2/generator-check/result.json`. 신규 JS 서식·집중 ESLint, 문서 링크·diff 공백 검사 결과를 확인한다.
- 재실행: `full-v2/prepare.py`가 실제 보존 입력에서 XML과 적용 위치를 준비한다. 로컬 5173 제작기에서 `renderDirectionReview('/data/production/section-direction-review-20261023/full-v2/<곡>')`를 호출하고 반환된 페이지/보고서를 별도 저장한다. 관련 코드 수정·서식을 먼저 마친 후 렌더한다.
- 앱에 같은 결과를 표시하려면 별도 renderer 통합이 필요하다. XML만 가져오면 현재 OSMD 경로는 이 SVG 충돌 배치를 자동 적용하지 않는다. 제작 산출물과 앱 통합 완료를 구분해 인계한다.
- 기존 웹앱 개발자에게 두 곡의 XML/SVG·검사 근거·한계를 전달했고 제작 검토본으로 보존하겠다는 접수 응답을 확인했다. 앱/패키지 반영·커밋·push·발행은 후속 요청 전까지 보류한다. 실제 본문/접수 근거는 `full-v2/handoff-message.md`, `handoff-submission.json`에 보존했다.

<a id="section-direction-layout-review--xml-표시-위치-재조사--2026-10-23"></a>

### XML 표시 위치 재조사 — 2026-10-23

사용자는 SVG 보정본만으로 배치를 완성하면 MusicXML만 가져왔을 때 재현되지 않는다고 지적했다. 이 지적이 맞다. v1의 좌표 속성 시험 실패를 MusicXML의 위치 지정 불가능으로 확대하면 안 된다. v2는 배치 시안이며, XML만으로 해당 배치가 재현되는 제작 완료본은 아니다.

- [W3C direction](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/direction/): 같은 성부의 다음 음표와 direction을 연관시킬 수 있다. 정확한 요소 이름은 `words`다.
- [W3C offset](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/offset/): divisions 단위로 표시 시점을 지정한다. `sound="no"`는 연결된 sound/listening의 적용 시점을 이동하지 않는다(생략 시에도 no). 이것이 임의의 텍스트 주법을 자동으로 재생 명령으로 바꾼다는 뜻은 아니다. 자식 words의 `default-x`가 있으면 표준상 표시 offset보다 우선하므로 혼용에 주의한다.
- [W3C words](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/words/): `default-x`는 마디 시작 기준 좌표, `relative-x`는 기본 위치에서의 이동량이다. `justify`/`halign`으로 텍스트 정렬도 표현할 수 있다. 따라서 표시 의도를 XML에 기록하는 기능 자체는 있다.
- 설치된 OSMD **2.1.2**의 `ExpressionReader.readExpressionParameters/read`는 offset을 읽는다. `interpretWords`는 default-x의 **존재**로 timestamp를 선택하지만 해당 숫자를 x 좌표로 적용하지 않으며, relative-x/justify/halign도 이 경로에서 읽지 않는다. `calculateMoodAndUnknownExpression`은 timestamp로 위치를 구한 뒤 `calculateLabel`의 기본 가운데 정렬과 오선 왼쪽 넘침 보정을 사용한다. 좌표 속성 문제와 음악적 위치 지원을 구분해야 한다.
- 실제 붉은 노을 전체 XML을 현재 앱 공통 renderer에 두 번 입력했다. 26마디 `H.H OPEN (o) →` direction을 원래 위치에 두고 `default-x` 없이 offset만 0 → 48(divisions=96, 0.5박), `sound="no"`로 바꿨다. 별도 SVG 위치 보정 없이 원생 텍스트 x가 **47.1385 → 67.4881**로 이동했다. XML offset은 작동한다. 다만 두 번째 음표 머리 중심 x=139.4704와 글자 왼쪽은 일치하지 않아, 요청한 왼쪽 시작 정렬·충돌 회피까지 해결됐다는 증거는 아니다.
- 두 입력의 전체 note 요소는 동일하다. 실제 재생·sound=no 전체 지원 검사는 수행하지 않았다. 이 예제 direction에는 sound/listening 명령이 없으며 하이햇 주법은 기존 개별 음표 악기/주법이 정본이다. 템포/RL 등 다른 direction 경로로 이번 결과를 일반화하지 않는다.
- 근거: `data/production/section-direction-review-20261023/xml-offset-probe/`의 두 XML·현재 renderer 원생 SVG·`result.json`·`source-evidence.json`. Safari MCP Transport closed의 기존 실패 후 승인된 ego-browser로 확인했다. 앱 소스·기존 완성 XML·패키지는 수정하지 않았다.

다음 적용 기준: **MusicXML에 음악적 위치와 표준 표시 위치를 기록하는 경로를 먼저 검토한다.** 현재 renderer가 반영하지 못하는 정렬은 앱 담당 영역으로 구분한다. XML에서 읽은 의미와 공통 규칙으로 매번 재생성하는 조판 보정과, 별도 곡별 좌표 자료에 의존하는 완성 SVG를 구분한다. v2는 XML에서 추출한 audit를 별도 입력으로 받아 배치하며, 최종 표시 좌표는 XML에 저장하지 않았다. 현재 이를 XML 단독 재현 결과로 인계하거나 보고하지 않는다.

<a id="section-direction-layout-review--대표-마디-v3--xml-offset과-현재-기본-정렬-비교"></a>

### 대표 마디 v3 — XML offset과 현재 기본 정렬 비교

- 목표: 음표 머리 중심에 글자 왼쪽을 강제로 맞추지 않아도 XML offset과 현재 공통 조판기로 읽기 쉬운 배치가 가능한지 비교한다.
- 범위: 갑자기 5마디, 붉은 노을 26·134마디의 표시 offset 0·0.5·1·2박. 분리된 전체 XML을 렌더해 원래 줄 구성을 유지하고 해당 시스템만 잘라 비교한다.
- 완료 조건: 실제 SVG 12표본과 비교판을 제공하고 섹션 겹침 여부를 화면과 경계로 확인한다.
- 제외: 새 정렬 원칙 확정, 앱 코드·최종 악보/패키지 교체, 새 음원·인쇄 PDF·독립 HTML·커밋·배포.
- 검증: 실제 Safari MCP 렌더·화면 확인, 8개 전체 XML의 XSD·음표 시간표·허용한 offset 이외 XML 내용 동일성.

사용자는 더 나은 표준 방식이 있으면 기존 ‘음표에서 글자 왼쪽 시작’ 아이디어를 철회할 수 있다고 했다. 이번 비교에서는 이를 합격 조건으로 강제하지 않았다. **offset은 표준 기능이지만 특정 offset 값이나 OSMD의 기본 가운데 정렬이 모든 악보에 권장되는 표준 배치라는 뜻은 아니다.** 전체 제작 규칙 변경 여부는 비교 결과와 후속 사용자 결정으로 구분한다.

| 표본 | 0박 | +0.5박 | +1박 | +2박 | SVG 비교판 |
|---|---|---|---|---|---|
| 갑자기 5마디, A / Closed H.H → | 겹침 | 겹침 | 겹침 없음 | 겹침 없음 | 4안 비교 (로컬 `data/production/section-direction-review-20261023/offset-native-v3/ioi-suddenly-m5-comparison.svg`) |
| 붉은 노을 26마디, Chorus 1 / H.H OPEN (o) → | 겹침 | 겹침 | 겹침 | 겹침 없음 | 4안 비교 (로컬 `data/production/section-direction-review-20261023/offset-native-v3/red-sunset-m26-comparison.svg`) |
| 붉은 노을 134마디, Ending / 긴 한국어 지시 | 겹침 | 겹침 | 겹침 | 겹침 없음 | 4안 비교 (로컬 `data/production/section-direction-review-20261023/offset-native-v3/red-sunset-m134-comparison.svg`) |

선택한 세 표본 한눈에 보기 (로컬 `data/production/section-direction-review-20261023/offset-native-v3/selected.svg`). 갑자기 +1박, 붉은 노을 두 곳 +2박은 **시험한 값 중** 겹침이 사라진 검토값이다. 더 작은 값의 한계 탐색이나 전곡 공통값 확정은 하지 않았다. 원본의 개별 음표·악기/주법은 동일하며, 텍스트에 sound/listening 명령을 새로 넣지 않았다. 표시는 뒤에 오므로 정확한 적용 시작을 텍스트 위치만으로 전달해야 하는 다른 지시에 기계적으로 적용하지 않는다.

현재 공통 renderer를 수정 없이 사용했다. 추가 SVG 작업은 해당 줄의 복사·viewBox 자르기, 비교용 제목과 행 배치뿐이며 섹션·지시문의 x/y·글꼴·크기를 고치지 않았다. 섹션 오선 시작점 좌측 정렬의 제작용 v2 보정도 이번 표본에는 적용하지 않았다. 기존 renderer 자체의 섹션 Y 보정은 그대로다.

Safari MCP는 이번 실행에서 연결이 정상으로 돌아와 Safari로 렌더하고 비교판 3개를 실제 열어 캡처했다. Chromium 결과를 재사용한 검수가 아니다. 134마디 긴 문구의 x는 offset 0·0.5·1에서 모두 57.19로 유지되다가 2에서 246.92로 이동했다. 기본 가운데 정렬과 오선 왼쪽 넘침 보정 때문에 offset 변화와 최종 x 변화가 선형이 아니었다. 초기 경계 집계에서 마디선 rect를 섹션으로 잘못 잡은 것을 화면 대조로 발견해, 섹션 text 앞 rect(빈 path 건너뜀)로 수정했다. 표와 최종 비교판은 수정된 경계를 사용한다.

근거는 `data/production/section-direction-review-20261023/offset-native-v3/`의 `report.json`, 8개 전체 MusicXML, 12개 원생 시스템 SVG, 비교 SVG/PNG 3개, `selected.svg`, 재실행용 `run.mjs`다. 공통 `common.evidence.serve`로 로컬 결과를 저장했다. `evidence/osmd-render/render.json`은 초기 전송 원자료이며 **수정된 섹션 판정은 최상위 report.json**을 따른다. XML XSD·유리수 음표 시간표·offset 이외 전체 구조 동일성 8건을 확인했다. 기존 최종 악보·음원·패키지는 보존했으며 표본 검수를 전곡 완료로 보고하지 않는다.

<a id="section-direction-layout-review--후속-15박-표본--v4"></a>

#### 후속 +1.5박 표본 — v4

**후속 정정:** v3/v4는 현재 renderer 기본 출력을 비교하면서 이미 확정한 섹션 좌측 정렬을 빠뜨렸다. 지시문의 offset 검토와 섹션 정렬 유지가 별개임을 혼동한 제작 오류다. 아래 v5가 섹션 정렬을 반영한 최신 검토본이다. 과거 ‘SVG 좌표 보정 없음’은 섹션 정렬까지 충족했다는 뜻이 아니다.

사용자 추가 요청으로 붉은 노을 26·134마디만 `offset=144`(divisions=96, `sound="no"`)로 시험했다. 이전 +1/+2박의 원생 SVG는 재사용했고 변경된 +1.5박만 현재 공통 renderer에서 새로 조판했다. 두 곳 모두 섹션과 겹치지 않았다. 섹션 테두리 오른쪽부터 지시문 글자 왼쪽까지의 수평 여백은 26마디 **21.58**, 134마디 **33.98 SVG 단위**다. +2박보다 왼쪽에 놓이면서 겹침을 해소한 추가 검토값이며 전곡 공통값 확정은 아니다.

- 26마디 +1 / +1.5 / +2박 SVG 비교 (로컬 `data/production/section-direction-review-20261023/offset-native-v4/red-sunset-m26-comparison.svg`)
- 134마디 +1 / +1.5 / +2박 SVG 비교 (로컬 `data/production/section-direction-review-20261023/offset-native-v4/red-sunset-m134-comparison.svg`)
- +1.5박 두 표본 SVG (로컬 `data/production/section-direction-review-20261023/offset-native-v4/selected.svg`)

Safari MCP로 새 표본 두 곳을 렌더하고 합본을 열어 화면을 확인했다. SVG 좌표 추가 보정 없음. 전체 XML 1개의 XSD·음표 시간표·두 표시 offset 외 구조 동일성을 확인했다. 근거: `offset-native-v4/report.json`, `red-sunset-offset-1.5.musicxml`, `selected.png`, 원생 시스템 SVG 2개와 `run.mjs`. 기존 악보·음원·패키지·앱 코드는 유지했다.

<a id="section-direction-layout-review--섹션-좌측-정렬-복구--v5"></a>

#### 섹션 좌측 정렬 복구 — v5

사용자가 섹션은 오선 시작점에 좌측 정렬하라고 재확인했다. 기존 공통 제작 함수 `layoutSectionDirections`에 sections만 전달하고 directions는 빈 목록으로 두어, v3 갑자기 5마디(+1박)와 v4 붉은 노을 26·134마디(+1.5박)의 섹션 테두리·글자만 함께 이동했다. 지시문 원생 SVG 노드와 음표 노드의 변경 전/후 outerHTML이 동일함을 확인했다. MusicXML과 음원은 바꾸지 않았다.

세 곳 모두 오선 시작 x=50, 테두리 stroke 포함 왼쪽 x=50으로 오차 0이다. 지시문 겹침 없음과 Safari 실제 화면을 확인했다. 최신 검토 SVG (로컬 `data/production/section-direction-review-20261023/section-left-v5/selected.svg`). 개별 SVG 3개·`report.json`·화면 `selected.png`는 같은 폴더에 보존한다. 섹션은 승인된 SVG 공통 보정을 적용했고 지시문은 XML offset에 따른 원생 배치를 유지했으므로, 이 교정본 전체를 ‘SVG 좌표 보정 없음’ 또는 ‘현재 앱에서 XML만으로 재현됨’으로 보고하지 않는다. 앱 소스·기존 완성 패키지 교체는 하지 않았다.

<a id="section-direction-layout-review--xml-위치-속성-입력과-조판기-미지원-재현--v6"></a>

#### XML 위치 속성 입력과 조판기 미지원 재현 — v6

사용자 최신 목표는 **섹션도 SVG 보정 대신 MusicXML 속성으로 지정해 XML만으로 재현**하는 것이다. [W3C rehearsal](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/rehearsal/)은 마디 시작 기준 `default-x`, 기본 위치에서의 `relative-x`, `halign`·`justify`를 제공한다. `direction directive="yes"`는 박자표/첫 표기와의 정렬이므로 오선 시작과 항상 같다고 간주하지 않는다. 텍스트 정렬점과 enclosure의 padding/외곽은 구분해 검증해야 한다.

갑자기 12개·붉은 노을 15개 rehearsal에 `default-x="0" halign="left" justify="left"`를 넣은 검토 후보를 만들었다. 갑자기 XML (로컬 `data/production/section-direction-review-20261023/xml-position-v6/ioi-suddenly.musicxml`), 붉은 노을 XML (로컬 `data/production/section-direction-review-20261023/xml-position-v6/red-sunset.musicxml`). XSD·음표 시간표·위 세 속성 외 전체 XML 내용 동일성을 확인했다. 이는 **입력 작성 완료이며 현행 앱에서 배치 재현 완료가 아니다.** 이전 대표 지시문 offset(갑자기 5마디 +1박, 붉은 노을 26/134마디 +1.5박)은 유지한다.

설치 OSMD 2.1.2의 `interpretRehearsalMark`는 text/placement만 RehearsalExpression에 저장하고 위치·정렬 속성을 읽지 않는다. 실제 Safari 공통 renderer에서 붉은 노을 26·134마디의 default-x를 0과 100으로 비교해도 모두 **오선 시작 x=50, 섹션 외곽 left=70, text x=74**로 동일했다. 별도 SVG 보정은 사용하지 않았다. 따라서 현행 엔진에서는 XML 속성만 바꿔 원하는 정렬을 얻었다고 보고할 수 없다. 올바른 해결은 XML 속성을 읽는 공통 조판 지원이며, 곡별 완성 SVG나 외부 좌표표가 아니다.

자료: `xml-position-v6/xml-audit.json`(후보 해시·XSD/보존·설치 bundle 해시·reader 발췌), `native-probe/osmd-render/render.json`과 원생 SVG 4쪽. 기존 앱·곡·음원·패키지를 수정하지 않았다. 사용자 상시 개발 인계 범위에 따라 확인된 기존 웹앱 개발 담당에게 두 XML·미지원 재현·최신 완료 조건을 전달했다. 인계 초안은 공통 도구로 조립한 `xml-position-v6/handoff/handoff.md`이며 전송 접수·실제 구현/검증을 구분해 후속 기록한다. 커밋·push·발행 요청은 아니다.

<a id="section-direction-layout-review--제작-svg에서-00625박-offset-확인--v7"></a>

#### 제작 SVG에서 0.0625박 offset 확인 — v7

사용자가 1박의 1/16인 0.0625박 단위 offset이 가능한지 요청했다. 처음 균등모드 표시 검증으로 해석한 것은 범위 오해였다. 사용자는 **지금 제작하는 SVG 악보**에서 보라고 정정했다. 균등모드의 격자나 코드는 변경하지 않는다. 그리드의 과거 32/64분할 기록을 정정하는 작업으로 확대하지 않는다.

실제 붉은 노을 전체 XML에서 26·134마디의 words offset을 **1.5 → 1.5625 → 1.625박**으로 바꿔 공통 print SVG를 렌더했다. divisions=96이므로 XML 정수값은 **144 → 150 → 156**, 한 단계는 6/96=0.0625박이다. words에는 default-x를 지정하지 않았고 `sound="no"`를 유지했다. 별도 지시문 SVG 좌표 보정 없이 아래 x가 반영됐다.

| 마디 | 1.5박 x | 1.5625박 x | 1.625박 x | 0.0625박당 이동 |
|---|---:|---:|---:|---:|
| 26 | 149.4375 | 154.5625 | 159.6875 | 5.125 SVG 단위 |
| 134 | 153.046875 | 164.78125 | 176.515625 | 11.734375 SVG 단위 |

현재 제작 SVG의 musical offset은 0.0625박 단위로 표현·반영된다. 이는 화면 픽셀 단위가 아니며 조판 폭에 따라 SVG 이동량은 다르다. 왼쪽 넘침 보정 등으로 최종 x가 고정되는 영역과 분해능 자체를 구분한다. 별도의 최소 단위로 양자화하거나 새 음표를 추가하지 않았다.

근거: `offset-fine-v7/report.json`, offset별 전체 XML 3개(XSD·음표 시간표·offset 값 이외 XML 내용 동일성 통과), 원생 시스템 SVG 6개. 26마디 비교 (로컬 `data/production/section-direction-review-20261023/offset-fine-v7/red-sunset-m26-comparison.svg`), 134마디 비교 (로컬 `data/production/section-direction-review-20261023/offset-fine-v7/red-sunset-m134-comparison.svg`). Safari 실제 렌더와 26마디 비교 화면을 확인한다. 이 표본은 offset 분해능 검증이며 v6의 섹션 속성 미지원까지 해결한 결과는 아니다. 섹션 XML 지원 보완은 기존 앱 개발자가 별도로 진행 중이다.
