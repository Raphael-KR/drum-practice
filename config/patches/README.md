# OSMD의 JSZip 공유·줄기 폭 초기화 패치

OSMD 2.3.0의 `build/opensheetmusicdisplay.min.js`에는 JSZip 3.10.2와 그 하위 코드가 내장되어 있다. 앱도 중앙 catalog의 JSZip 3.10.2를 사용하므로 같은 기능이 중복된다.

`opensheetmusicdisplay@2.3.0.patch`는 다음 두 곳을 변경한다. 나머지 코드는 원본과 동일하며 pnpm이 마지막 줄바꿈 1바이트를 추가한다.

1. Webpack 모듈 `1710`을 `1710(t){t.exports=require("jszip")}`로 교체한다. 압축 MusicXML을 포함한 OSMD의 ZIP 호출을 앱과 같은 JSZip으로 연결한다.
2. `VexFlowMusicSheetCalculator.initGraphicalMeasuresCreation()`에서 `Flow.STEM_WIDTH`를 `EngravingRules.StemWidth × unitInPixels`로 초기화한다. 설치 파일의 해당 문장은 `S.STEM_WIDTH=this.rules.StemWidth*E.unitInPixels`다. 기존 OSMD 규칙과 단위 상수를 사용하며, 음표 생성과 빔 계산 전에 적용한다.

OSMD는 원래 그리기 단계에서 줄기 폭을 적용하지만, 빔 계산은 그보다 먼저 실행된다. 앱이 지정한 폭은 1px이고 VexFlow 초기값은 1.5px이므로 첫 조판에서 줄기 끝이 재열기보다 0.25px 달라질 수 있었다. 초기화 시점을 앞당겨 첫 조판부터 같은 규칙을 사용한다. 앱의 악보·저장 형식은 유지한다.

- 원본 SHA-256: `20cf7cd331637af5ef5786cfdfb67e106a181ba5c6a5c4c86adee4b96a7c6639`
- 설치 후 SHA-256: `435f65dcfaf00ce0c55de2908487ca41033f315e14370cd7648b0f54731e3434`
- 패치 파일 SHA-256·lockfile의 patch hash: `964f4840e646ba72af37fa621dff4d3984f0871dc16a0eed14b2793376491792`
- 원본 1,459,236바이트 → 1,362,671바이트, 96,565바이트 감소. 이는 OSMD 파일 크기이며 최종 앱 압축 전송량의 측정값은 아니다.

2.2.1용 패치는 2.3.0용으로 교체했다. 버전 갱신과 모듈 외 바이트 대조·검증 결과는 [동기화 기록](../../docs/records/archive/pnpm-catalog-sync-20261108.md)에 남긴다.

pnpm의 `patchedDependencies`와 lockfile이 설치 시 패치를 적용한다. `pnpm-workspace.yaml`의 `opensheetmusicdisplay>jszip: catalog:` override는 별도로 설치되는 의존성도 공통 버전에 맞춘다. 패치는 프로젝트에만 적용하며 공통 store 원본이나 다른 프로젝트를 덮어쓰지 않는다. 앱 빌드번호의 소스 해시에도 패치 파일을 포함한다. upstream 파일이 한 줄로 압축되어 있어 패치 파일의 diff는 크지만 실제 변경 범위는 위 두 곳이다. 줄기 폭 초기화 반영 시 파생 캐시 정책을 `drum-print-ribbon-v47-stem-initialization`으로 올렸다.

OSMD를 갱신할 때는 새 배포 파일의 내장 ZIP 여부와 줄기 폭 적용 순서를 각각 확인한다. upstream에서 해결된 항목은 패치에서 제외한다. 패치가 필요한 항목만 다음 순서로 갱신한다.

1. `pnpm --config.patches-dir=config/patches patch opensheetmusicdisplay@<새 버전> --edit-dir .tmp/<작업 폴더>`로 준비한다.
2. AST로 확인한 JSZip 모듈을 공통 `require("jszip")` 참조로 교체하고, 줄기 폭은 기존 초기화 훅·규칙·단위 상수를 통해 빔 계산 전에 적용한다. 새 버전의 모듈 번호와 내부 이름을 다시 확인한다.
3. 위 변경 외의 바이트 일치와 JavaScript 문법을 확인한다. `pnpm --config.patches-dir=config/patches patch-commit <작업 폴더> --patches-dir config/patches`로 패치와 lockfile을 갱신하고 설치 결과의 해시·크기를 대조한다. `patch-commit`은 pnpm 패치 파일 생성 명령이다.
4. 조판 결과에 영향을 주는 변경이면 파생 캐시 정책을 갱신한다. 실행 중인 개발 서버의 사전 번들에도 새 초기화 코드가 반영됐는지 확인한다.

정적 검사는 `pnpm run check:dependencies`로 공유 의존성 경로·내장 ZIP 제거·라이선스 항목을 확인하고, 변경 범위의 타입·Lint·서식 검사를 적용한다. 실제 출력 검증이 승인된 경우 새 브라우저 문서의 첫 조판과 같은 XML의 재열기를 비교한다. 음표의 경로·좌표는 허용 오차 없이 대조하고 자동 생성 SVG ID만 비교에서 정규화한다. 첫 조판 전 별도 준비용 렌더를 넣지 않는다. 2026-11-12에는 실제 탐탐 악보의 첫 인쇄 조판·반복 인쇄 조판·공통 재생 렌더러에서 음표 요소 624개가 일치했고, 첫 줄기 끝 좌표도 모두 211이었다.

릴리스 검사는 [검사 카탈로그](../../docs/reference/engineering/check-catalog.md)에서 변경 영향에 따라 선택한다. ZIP 연결 변경은 압축 MusicXML·drumscore·백업의 저장/읽기를, 조판 변경은 두 앱의 공통 렌더링과 빌드 영향을 확인한다. 정적 검사와 실제 출력 확인 결과는 구분한다.

근거: [pnpm patch](https://pnpm.io/cli/patch), [pnpm overrides](https://pnpm.io/settings/dependency-resolution#overrides).
