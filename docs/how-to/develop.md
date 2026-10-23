# 개발 환경과 공통 문구 작업

문서 역할: **실행 절차**. 현재 요청과 전역·프로젝트 지침의 승인 범위 안에서 수행한다. [정본 목록](../RULES-INDEX.md)과 [작업별 안내](../README.md)를 먼저 확인한다. 예시 명령·과거 기록은 이번 실행의 성공 증거가 아니다.

<a id="i18n--앱-문구-변경-절차"></a>

## 앱 문구 변경 절차

실행 절차다. 요구·예외는 [i18n Rule](../reference/engineering/i18n.md#i18n--사용자-표시-문구와-i18n)을 따른다.

1. 기존 키와 UI 카탈로그 연결을 찾고 한국어 정본에서 재사용/추가한다.
2. 화면·접근성 이름에서 공통 API를 사용한다. 사용자 곡 콘텐츠 예외는 정확한 리터럴만 별도로 검토한다.
3. 현재 [검사 실행 계약](verify.md#testing--개발-검사와-로컬-자산-준비)에 따라 `npm run check:i18n`과 변경 범위 검사를 실행한다. 전체 검증이 필요하면 `npm run verify`를 사용한다. 명령의 영향·허가는 전역/프로젝트 지침을 따른다.
4. 정적 키·변수·UI 연결·콘텐츠 예외를 확인하고 실제 실행 범위와 미검증을 기록한다. 영어 화면 전체 검수는 번역 추가 때 수행한다.

<a id="readme--개발과-검증"></a>

## 개발과 검증

[소스 권위](../reference/engineering/release.md#deployment-rules--배포-범위와-소스-권위)를 확인한 뒤 실제 프로젝트 루트에서 실행한다.

```sh
npm ci --prefix hosting
npm run verify:portable  # 로컬 악보 없이 코드·문서·타입·회귀 검사
npm run verify           # 로컬 악보를 포함한 전체 회귀와 두 앱 빌드
```

ESLint는 JS·TS의 코드 규칙을, Prettier는 서식을 검사합니다. `npm run lint:fix`는 자동 수정 가능한 ESLint 항목을 수정합니다. 설정과 검사 범위는 [개발 검사](../../docs/how-to/verify.md#testing--eslint)를 참고합니다.

`npm run build`와 `build:apps`는 같은 분리 빌드로 `dist/editor/`, `dist/player/`를 생성합니다. `dev`, `dev:editor`, `dev:player`는 같은 생성 준비 단계를 사용합니다. `npm run preview`는 player 빌드를 미리 봅니다. 공개 대상은 **player만**이며 발행 절차는 [Sites 발행](../../docs/how-to/release.md#sites-publication--sites-발행-절차)을 따릅니다. 검사 범위는 이 프로젝트의 `tests/`로 한정합니다. `npm run test:portable`은 로컬 악보 없이 실행하며, 전체 `test:drum`은 로컬 자료를 포함합니다. [검사·자산 준비](../../docs/how-to/verify.md#testing--개발-검사와-로컬-자산-준비)를 따릅니다.

실행 결과는 `history.md`에 남기고, 공개 반영은 [발행 기록](../records/releases.md#sites-publication-history--sites-발행공개-확인-기록), 실기기 확인은 [검증 현황](../records/acceptance.md#acceptance--검증-현황)에 연결한다.

## 실행 환경과 빠른 시작

루트 [README](../../README.md#로컬-실행)의 Node 요구와 설치·5173 실행 절차를 따른다. 현재 환경과 `.nvmrc`·`package.json`의 지원 범위를 대조하고, 이미 실행 중인 5173 서버를 재사용한다. 기본 개발 소스는 `src/`다. 운영·발행 사본을 별도 개발 정본으로 사용하지 않는다.
