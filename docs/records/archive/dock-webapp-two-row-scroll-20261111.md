# Dock 웹앱의 정지·2줄 보기 관성 스크롤 진단

문서 역할: **진단·일시 비교와 후속 구현 기록**. 브라우저 임시 비교와 이후 앱 코드의 정적 검사 결과를 구분하며, 릴리스 완료 기록은 아니다.

## 목표·범위

- 목표: 일반 Chrome/Safari에서는 괜찮고 Safari의 ‘Dock에 추가’ 웹앱에서만 한 줄마다 걸리는 현상의 앱 쪽 유발 조건을 확인한다. 사용자가 재확인한 요구는 **관성 이동을 유지하면서 멈출 때 행 경계에 맞추는 것**이다.
- 범위: 사용자 영상, 공통 스크롤 코드와 실제 Dock 웹앱의 정지된 ‘바람과 언덕의 발라드’ 2줄 보기를 비교한다.
- 완료 조건: 실제 적용 CSS와 입력 처리를 확인하고, 한 가지 조건만 바꾼 직접 트랙패드 비교 결과와 미확정 범위를 구분한다.
- 보존·제외: 승인된 Dock 진단·임시 비교 범위에서 현재 페이지의 CSS·진단 listener와 기존 wheel listener 등록 방식만 일시 비교한다. 앱 파일·악보·저장 데이터·브라우저 설정·캐시·버전과 기존 미커밋 작업은 변경하지 않는다. 커밋·푸시·발행은 하지 않는다.
- 검증: 영상/소스 확인 → Dock 웹앱 개발자 도구 연결 → 스냅 해제 비교 → 행 맞춤을 유지한 스크롤 경계/이벤트 등록 방식 비교 → 원래 CSS와 listener 복원 → 진단 문서 정적 검사.

## 환경과 코드 확인

- macOS 27.2.1, Safari 27.2. Dock 앱은 사용자 Applications의 ‘드럼 연습실.app’이며, 연결 주소는 `https://drum-practice-studio.dgkma.chatgpt.site/`다.
- 사용자 영상과 실제 Dock 화면은 모두 `v0.11.2 · build 61e52ba4`. 로컬의 같은 빌드 배포본에서도 아래 스냅 규칙을 확인했다.
- [공통 CSS](../../../src/modules/playback/styles/05-dock.css)의 `.drawer-playback .two-rows .stage.paused-score-scroll`에 `scroll-snap-type: y mandatory`, 각 `.browse-row`에 `scroll-snap-align: start`가 적용돼 있다. `scroll-snap-stop: always`는 지정되어 있지 않다.
- 실제 stage는 `snap: y mandatory`, `overscroll-behavior-y: contain`, 높이 367 CSS px, 행 간격 약 182.41 CSS px, 28개 행이었다. Dock 앱에서도 `(display-mode: standalone)` 값은 `false`였으므로 이 조건만으로 해당 앱을 구별할 수 없다.
- [휠 처리](../../../src/modules/playback/playback-actions.ts)는 정지·2줄·세로 우세 입력을 기본 스크롤로 넘긴다. [행 배치](../../../src/modules/playback/playback-layout.ts)는 같은 선택/폭에서 `scrollTop`을 매번 다시 쓰지 않고, [프레임 처리](../../../src/modules/playback/playback-screen.ts)도 정지 상태가 그대로이면 표시 갱신을 건너뛴다.

## 실제 비교 결과

Safari의 ‘개발자용 → 앱 및 기기 검사’에서 Dock 앱의 페이지에 연결했다. 사용자에게 두 단계의 실제 트랙패드 동작을 요청하고, 원래 stage의 inline style을 보관한 뒤 두 번째 단계에서만 `scroll-snap-type: none !important`를 적용했다. 악보·JavaScript·나머지 CSS는 그대로 두었다.

| 조건 | 사용자의 직접 트랙패드 결과 | 관찰된 wheel 취소 |
| --- | --- | --- |
| 원래 `y mandatory` | “한 줄에서 걸림” | 731건 중 `defaultPrevented` 0건 |
| 스냅만 `none` | “끊김 없이 계속 넘어감” | 1,041건 중 `defaultPrevented` 0건 |

- **첫 비교에서 확인한 유발 조건:** 기존 wheel 등록 방식과 강제 행 맞춤이 함께 적용된 Dock 웹앱에서 끊김이 생기며, 스냅 CSS만 해제하면 증상이 사라졌다. 아래 후속 비교에서 스냅을 유지해도 이벤트 등록 방식을 바꾸면 해결됨을 확인했으므로 스냅 자체를 없애야 한다는 결론으로 사용하지 않는다.
- 첫 비교 시점에서 일반 Safari/Chrome의 정상 동작 근거는 사용자 보고였다. 아래 후속 비교에서 일반 Safari의 실제 설정을 확인했고, 이후 조건부 passive 시험은 별도 절에 기록했다. 같은 곡·창 크기·물리 입력을 모두 맞춘 성능 비교나 Dock 앱과 일반 Safari의 WebKit 내부 처리 차이까지 확정한 것은 아니다.
- 기록된 입력은 사용자가 움직인 실제 이벤트이며 방향·횟수·기간이 같지 않다. 이벤트 수·이동 거리로 성능 향상률을 계산하지 않는다. CPU·메모리 부하도 이번 비교에서 측정하지 않았다.
- Computer Use의 자동 스크롤은 `deltaY: 2355`인 단일 wheel 이벤트로 전달됐고 17마디 부근에서 69마디 부근까지 이동했다. 따라서 그 결과를 실제 트랙패드 관성 재현으로 간주하지 않고 사용자 직접 동작으로 비교했다.

## 행 맞춤을 유지한 후속 진단

- 사용자는 스냅을 없애 행 중간에서 멈추게 하는 해결책을 거절했다. 스냅 해제 결과는 원인을 좁힌 진단 근거로만 사용한다.
- 일반 Safari도 `v0.11.2 · build 61e52ba4`와 같은 `player-BuaOssR6.css`를 사용했다. 실제 stage의 `y mandatory`, 행의 `start`·`scroll-snap-stop: normal`, `overscroll-behavior: contain`, `scroll-behavior: auto`, `touch-action: pan-y`, `mask: none`은 Dock 앱과 같았다.
- 두 환경의 UA·DPR 2·reduced-motion false도 같았으며, `(display-mode: standalone)`은 둘 다 false였다. 이 값으로 Dock 전용 분기를 만들 근거는 없다.
- 이때 Safari는 Loveholic·984×710 viewport, Dock 앱은 바람과 언덕의 발라드·957×753 viewport였다. 곡·크기를 통제한 비교나 브라우저 엔진 내부 분석으로 확대 해석하지 않는다.
- Dock 앱에서 `y mandatory`를 유지하고 `overscroll-behavior`만 `auto !important`로 잠시 바꿨으나, 사용자는 **“여전히 한 줄씩 걸림”**을 확인했다. 원래 inline style을 복원한 뒤 `contain`·`y mandatory`를 재확인했다. 이 설정 변경만으로는 해결되지 않는다.
- stage부터 window까지 실제 wheel listener는 stage의 1개뿐이며 `passive: false`, `useCapture: false`, `once: false`였다. 세로 입력의 `preventDefault()`가 관측되지 않았다는 사실과 브라우저가 non-passive listener를 기다리는 등록 방식은 구분한다.
- 원래 `contain`·`y mandatory`·행의 `start`를 유지한 채, **같은 함수 객체**를 `passive: true`로 다시 등록했다. 함수 내용·CSS·악보·행 간격은 바꾸지 않았다. 사용자는 직접 트랙패드 비교에서 **“여러 줄을 지나고 행에 맞춰 멈춤”**을 확인했다.
- 비교 후 `sameStage: true`, `sameListener: true`, `passive: true`, `snap: y mandatory`를 확인하고, 보관한 원래 함수와 `passive: false`·`capture: false`·`once: false`로 복원했다. listener가 1개이며 원래 함수 객체와 같고 임시 객체가 제거됐음을 재조회했다. 인스펙터·앱 및 기기 검사 창도 닫았다.
- **판정:** 이 Dock 환경에서는 non-passive wheel 등록과 CSS 행 맞춤의 조합이 끊김에 관여한다. 행 맞춤을 포기하지 않고 브라우저의 스크롤을 차단하지 않는 등록 방식으로 원하는 동작이 나왔다. 일반 Safari와 Dock의 WebKit 내부 경로가 왜 다르게 반응하는지까지 밝혀낸 것은 아니며, 실제 다른 기기·곡·보기의 회귀 검증 결과도 아니다.

## 복원과 후속 수정 기준

- 원래 inline style을 정확히 복원하고 `scroll-snap-type: y mandatory`를 재확인했다. 임시 wheel/scroll listener와 `window.__dockScrollCheck`를 제거한 뒤 인스펙터와 앱 검사 창을 닫았다.
- 앞선 강제 스냅 제거 제안은 채택하지 않는다. 영구 수정의 완료 기준은 **빠른 트랙패드 입력으로 여러 행을 지나고, 이동이 끝나면 행 경계에 정렬되는 것**이다. 재생 중 두 줄 교체와 선택/키보드 이동도 유지해야 한다.
- 우선 검토할 수정은 **정지·2줄 보기에서만 wheel을 passive로 처리하는 것**이었다. 기존 처리기는 재생 중 입력 억제와 1줄 보기의 가로 이동에서도 `preventDefault()`를 사용하므로 모든 상태를 일괄 `passive: true`로 바꾸면 안 된다. 보기·재생 상태 전환 때 listener 중복/누락이 없도록 기존 수명 관리와 함께 설계한다. 이 진단 단계에서는 영구 구현을 하지 않았으며 이후 반영은 아래 별도 절에 기록한다.
- `proximity` 변경이나 스크롤 종료 후 별도 정렬은 이번에 검증하지 않았다. Dock 전용 UA 분기나 새로운 JavaScript 관성 스크롤 구현을 근거 없이 추가하지 않는다. [CSS Scroll Snap 표준](https://www.w3.org/TR/css-scroll-snap-1/#scroll-snap-stop)의 `normal`은 중간 정렬점을 지나갈 수 있도록 하며, `mandatory`는 스크롤이 끝났을 때 정렬을 요구한다. 실제 관성·정렬 애니메이션의 구현 방식은 브라우저에 맡겨져 있다.
- 이번 작업은 진단까지이며 영구 수정·새 빌드·배포는 수행하지 않았다. 과거 [Safari 재생 충돌 기록](safari-two-row-scroll-20261024.md)과 이번 관성 끊김을 같은 장애로 단정하지 않는다.

영상 프레임과 최초 `docs-check.log`는 `.tmp/dock-scroll-20261111/`에 보관한다. 후속 진단 문서의 검사 로그는 `docs-followup-check.log`로 구분한다. Node 26.13.0·pnpm 12.18.0에서 문서·링크·앵커 검사(158문서·4,611개 로컬 링크·3,382개 앵커 링크)와 `git diff --check`가 통과했다. 실제 트랙패드 결과는 위 사용자 비교이며 정적 검사를 화면 검증으로 간주하지 않는다. 앱 소스와 수록 자료는 변경하지 않았다.

## Safari·Chrome 계열의 조건부 passive 비교

### 범위와 방법

- 사용자 요청에 따라 Safari는 Safari MCP, Chrome 계열은 지정된 ego-browser로 검사한다. 두 브라우저의 같은 발행 빌드 `v0.11.2 · build 61e52ba4`와 수록곡 ‘바람과 언덕의 발라드’를 사용한다.
- 현재 페이지에서 기존 wheel 함수 객체를 유지하면서 **정지·2줄 상태만 passive**로 등록하는 임시 진단 코드를 적용한다. 재생 중이거나 1줄 보기이면 원래 non-passive 등록으로 돌아간다. CSS의 `y mandatory`·행 시작점 정렬과 함수 내용은 유지한다.
- 완료 조건은 사용자의 실제 트랙패드 관성 이동과 마지막 행 정렬, 보기·재생 상태 전환에 따른 등록값 확인, 임시 코드 복원이다. 물리 입력 결과와 자동 입력 결과를 구분한다.
- 이 임시 코드는 stage 클래스 변화를 관찰하는 시험용이다. 앱의 수명 관리에 반영한 영구 구현이나 새로운 빌드의 검증 결과가 아니다. 앱 소스·정본·기존 사용자 저장 자료를 변경하지 않고 커밋·푸시·발행도 하지 않는다.

### Safari 결과

- 환경: Safari 27.2, viewport 1024×710 CSS px, DPR 2. 실제 화면은 28행이며 행 간격 약 191.12px다.
- 사용자 직접 입력 결과: **“여러 줄을 지나고 행에 맞춰 멈춤”**. 실제 wheel 703건은 모두 취소되지 않았고, 이동 범위는 -23~2,867px, 마지막 위치는 764px, 행 정렬 오차는 0px였다. 음수 위치는 위쪽 탄성 이동 중 기록이며 종료 위치가 아니다.
- 재생 버튼 → 일시정지 → 1줄 → 2줄의 실제 UI 전환을 확인했다. 재생 중 `passive: false`·스냅 없음, 정지·1줄도 false, 정지·2줄 복귀 시 true·`y mandatory`이며 정렬 오차 0px였다.
- 수집한 미처리 JavaScript 오류는 0건이다. 콘솔에는 페이지 로드 시점의 CSP report-only 및 `styleMedia` 폐기 예정 메시지가 있었으며, passive listener의 취소 경고는 없었다. 콘솔 전체가 깨끗했다는 뜻은 아니다.
- MCP의 자동 scroll 명령은 wheel 이벤트 없이 `scrollTop`을 바꿨으므로 실제 관성·행 정렬 판정에 쓰지 않았다. 위 성공 판정은 사용자 직접 조작과 그 이벤트 기록에 근거한다.
- 원래 wheel 등록 옵션으로 복원하고 진단 객체 제거를 확인한 뒤 이번에 만든 Safari 시험 탭을 닫았다. 상태별 결과는 `.tmp/dock-scroll-20261111/safari-passive-results.json`에 보관한다.

### ego-browser 결과

- 환경: Chromium 156, 실제 viewport 685×997 CSS px. 별도 Google Chrome 앱을 제어한 결과가 아니라 사용자가 지정한 ego-browser의 Chromium 결과다. Safari와 같은 창 크기의 성능 비교는 아니다.
- 짧은 자동 wheel 입력에서는 12개 이벤트로 948px를 이동하고 정렬 오차 0px로 멈췄다. 자동 입력 결과는 `ego-automated-wheel.json`에 보관하며, 실제 트랙패드 관성 성공으로 간주하지 않는다.
- 사용자에게 시험 창을 넘긴 실제 트랙패드 결과도 **“여러 줄을 지나고 행에 맞춰 멈춤”**이었다. 실제 wheel 857건 중 취소 0건, 이동 범위 158~3,468px, 마지막 위치 2,370px, 행 간격 158px, 정렬 오차 0px였다. 원시 요약은 `ego-physical-passive.json`에 보관한다.
- 실제 UI로 재생 → 정지 → 1줄 → 2줄 전환을 확인했다. 재생 중·1줄은 `passive: false`, 정지·2줄 복귀는 true·`y mandatory`, 복귀 후 정렬 오차는 0px였다. 수집한 미처리 JavaScript 오류는 0건이며 상태별 결과는 `ego-state-transitions.json`에 보관한다. 재생 상태가 바뀌며 만료된 자동화 버튼 참조는 현재 화면을 재조회한 뒤 의미 기반 선택자로 이어 갔다. 이 도구 참조 오류를 앱 오류로 집계하지 않는다.
- 원래 listener 옵션으로 복원하고 진단 객체 제거를 확인했다(`ego-restored.json`). 이번 TaskSpace와 시험 페이지는 `finish({ keep: [] })`로 닫았다.

### 판정과 한계

- **확인한 범위에서는 통과:** Safari MCP와 ego-browser에서 정지·2줄에만 passive를 임시 적용해도 실제 관성 이동과 마지막 행 맞춤이 유지됐다. 재생·보기 전환에 따른 등록값도 의도한 조건과 일치했다.
- 두 브라우저의 실제 창 크기와 사용자 입력 횟수·길이가 다르므로 이벤트 수나 이동 거리를 성능 비교로 사용하지 않는다. 재생 중·1줄에서의 전체 조작 회귀나 다른 곡·기기까지 확인한 결과가 아니다.
- 영구 구현 시에는 기존 재생/보기 수명 관리에 조건부 등록을 연결하고, 정지·2줄의 가로 우세 입력 분기에 남아 있는 `preventDefault()` 호출도 함께 검토해야 한다. 이번 성공은 실제 세로 트랙패드 동작에 대한 것이며, 임시 observer를 그대로 제품 코드에 넣겠다는 결정이 아니다.
- 임시 변경은 두 브라우저 모두 복원했고 앱 소스·수록 악보에는 변경이 없다. Node 26.13.0·pnpm 12.18.0에서 문서·링크·앵커 검사(158문서·4,612개 로컬 링크·3,383개 앵커 링크)와 `git diff --check`가 통과했다. 검사 로그는 `.tmp/dock-scroll-20261111/docs-browser-check.log`에 보관한다. 앱 코드 변경이 없으므로 새 빌드·앱 테스트·발행은 수행하지 않았다.

## 정지·2줄 passive의 앱 코드 반영

- 목표: 위에서 임시 비교한 정지·2줄 passive 처리를 두 앱의 공통 재생 화면에 반영하고 관성 이동과 마지막 행 정렬을 유지한다.
- 범위: `playback-actions.ts`의 wheel 등록/해제, `playback-navigation.ts`의 입력 연결, `playback-screen.ts`의 재생·보기 변경 경로와 기존 helper 테스트 호출부, [현행 표시 Rule](../../reference/score/rendering.md#svg-score-rules--9-음표-따라가기탐색화면-효과) 및 history다.
- 완료 조건: 정지·2줄에만 passive를 적용하고 상태 변경 때 같은 listener를 중복 없이 갱신한다. 재생 중 입력 억제·1줄 가로 탐색·행 스냅 CSS와 저장 계약을 유지한다.
- 보존·제외: 기존 미커밋 작업·악보·사용자 저장 자료·과거 기록·앱 버전을 보존한다. 사용자 요청대로 정적 검사만 수행하고 회귀 실행·새 화면 검수·앱 빌드·커밋·푸시·발행은 하지 않는다.
- 검증 계획: Node 26.13.0·pnpm 12.18.0에서 변경 TS의 lint·서식, 앱/테스트 타입, 재생 소유권·공통 경계, 문서·링크·앵커와 diff를 확인한다. 타입 검사 pre 단계의 기존 생성 경로로 소스 빌드번호를 갱신하고 근거는 `.tmp/paused-rows-passive-20261111/`에 둔다.

### 구현

- 공통 wheel 설치 함수가 `setPassive`와 `dispose`를 제공한다. 옵션이 같으면 등록을 건드리지 않고 변경 때 같은 함수를 제거/재등록한다. dispose 이후의 갱신은 listener를 다시 설치하지 않는다.
- navigation의 기존 bind 시점에 등록과 초기 상태를 맞추고, 공통 화면의 `onState`·`renderTrack`에서 현재 ready/playing/view 값으로 동기화한다. busy나 매 프레임의 DOM 상태를 새 구독 대상으로 삼지 않는다.
- 정지·2줄은 세로 우세 입력의 기존 탐색을 유지하고 가로 우세 입력도 `preventDefault()` 없이 종료한다. 가로 입력은 재생 위치를 바꾸지 않으며 기존 `overflow-x: hidden`과 `y mandatory` CSS는 그대로다. 재생 중·1줄·검수의 기존 취소/탐색 분기는 유지한다.
- 기존 wheel 단위 검사에는 반환형과 상태 갱신 호출만 반영했다. 새 fixture·시험 DB나 별도 검사 모음을 추가하지 않았다. 이번에는 해당 테스트를 실행하지 않는다.

### 검증 상태

- 정적 검사 통과: 변경 TS 4파일의 ESLint·Prettier, `pnpm run typecheck:app`(앱/테스트 포함), `pnpm run check:playback`(재생 소유권·공통 컴포넌트·소스 경계), `pnpm run check:docs`(158문서·4,615개 로컬 링크·3,386개 앵커 링크), `git diff --check`. 실제 로그는 이 절의 작업 폴더에 보관한다.
- 보존 대조: 이번 7파일 외 기존 739파일과 HEAD를 보존했고 CSS·수록 악보·앱 버전에는 변경이 없다. 기존 생성 경로로 소스 빌드번호만 `135e0298da0b`로 갱신했다. 두 앱 버전은 `0.11.2`를 유지한다. 파일 해시 대조는 `preservation.json`에 기록했다.
- 위 Safari/Dock/ego-browser 결과는 이전 발행 빌드의 임시 코드 비교 증거다. 이번 영구 코드의 실제 브라우저 성공으로 재사용하지 않는다. 새 구현의 화면·관성 검수는 미실행이며, 릴리스 또는 별도 요청 시 확인한다.
