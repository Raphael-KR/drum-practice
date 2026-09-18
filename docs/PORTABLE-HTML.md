# 노래별 HTML 한 파일

## 사용

웹앱에서 곡을 열고 상단 **HTML 한 파일로 저장**을 누른다. 음원, 원본 PDF, 악보 이미지, 가사·마디 정렬, 마커, 반복 구간, 재생 설정, 실행 코드가 함께 저장된다. 생성된 파일 자체에는 서버·CDN·외부 JavaScript 연결이 필요하지 않다.

예제: `exports/바람과 언덕의 발라드-드럼연습.html` (10,833,534 bytes, 약 10.3 MiB).

HTML 안에서 연습하거나 기존 악보 영역·가사를 수정할 수 있다. 새 곡을 준비하거나 다른 PDF를 가져오는 작업은 원래 웹앱에서 한다. HTML의 변경 내용은 현재 화면의 메모리에만 유지된다. **HTML 한 파일로 저장을 다시 눌러 새 파일을 보관해야 한다.** 원래 파일을 자동으로 덮어쓰거나, 파일 URL의 브라우저 저장소에 저장했다고 표시하지 않는다.

## iPad에서 여는 방법의 한계

단일 파일 패키징과 운영체제의 파일 실행은 별개다. Apple의 [Quick Look 문서](https://developer.apple.com/documentation/quicklook)는 HTML을 포함한 파일 미리보기를 설명한다. 미리보기 화면이 Safari의 JavaScript·오디오 실행 환경과 같다는 보장은 없다. 실제 iPad에서 파일 앱으로 탭하는 것만으로 작동한다고 검증하지 않았다.

JavaScript·Web Audio·Blob Worker를 지원하는 HTML 실행 앱/웹 브라우저에서 열어야 한다. 실행되지 않는 미리보기에서는 HTML에 넣어 둔 정적 안내가 표시된다. 특정 iPad 앱의 지원 여부, 다운로드·다시 저장 흐름과 파일 크기 한계는 실기기에서 확인해야 한다. 이 기능을 위해 앱 설치·외부 업로드·배포는 수행하지 않았다.

## 구현

- `src/portable.ts`: 파일 묶기·풀기, 안전한 JSON 삽입, 독립 HTML 셸.
- `scripts/build-portable.mjs`: 같은 앱 소스를 IIFE로 묶고 CSS와 음정 유지 Worker 코드를 인라인으로 포함. PDF 신규 입력 모듈은 단일 곡 파일의 범위에서 제외.
- `src/storage.ts`: 단일 파일 모드에서는 IndexedDB 없이 메모리 사용.
- `src/audio.ts`: 단일 파일에 들어 있는 코드를 Blob Worker로 실행.
- `public/portable-template.html`: 자동 생성된 내보내기 템플릿. 원본 소스가 아니다.
- 라이브러리 라이선스와 SoundTouchJS 원본 코드도 HTML 내부에 포함.

```sh
npm run portable          # 템플릿 생성
npm run portable -- --demo # 현재 예제곡 HTML도 생성
npm run build            # 템플릿 생성 + 타입 검사 + 웹앱 빌드
```

`npm run dev` 시작 전에 템플릿을 자동 생성한다. 개발 서버를 켠 채 소스를 변경했다면 HTML 내보내기 검사 전에 `npm run portable`을 다시 실행한다. `exports/`, 내보내기 템플릿, 예제 미디어는 Git 제외 대상이다. 생성 파일에 전체 음원이 포함되므로 공개 배포는 별도로 결정한다.

## 검증

Mac Chromium에서 실제 `file://`로 열기·재생·80/81% 속도 처리, 네트워크 차단 후 재열기·재생, 마커/반복/81%/위치를 담은 재저장 HTML 복원을 확인했다. 페이지의 추가 리소스 요청은 0개였다. 웹앱의 내보내기 버튼으로 받은 HTML도 다시 열어 110마디를 확인했다.

브라우저 저장소 거부 조건, 바이너리 왕복, 누락 페이지 거부, `</script>` 형태의 가사/제목 삽입 방지를 자동 검사한다. 실제 iPad 검증은 남아 있다. 상세 증거는 `docs/experiments/portable-verification.json`, 회차 10 로그와 `history.md`에 있다.
