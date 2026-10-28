# OSMD의 JSZip 공유 패치

OSMD 2.2.1의 `build/opensheetmusicdisplay.min.js`에는 JSZip 3.10.1과 그 하위 코드가 내장되어 있다. 앱은 중앙 catalog의 JSZip 3.10.2를 사용하므로 같은 기능이 중복된다.

`opensheetmusicdisplay@2.2.1.patch`는 Webpack 모듈 `1710`만 `1710(t){t.exports=require("jszip")}`로 교체한다. 해당 모듈 외의 코드는 원본과 동일하며 pnpm이 마지막 줄바꿈 1바이트를 추가한다. 압축 MusicXML을 포함한 OSMD의 ZIP 호출도 앱과 같은 JSZip으로 연결하므로 기능을 비활성화하는 stub은 사용하지 않는다. 앱의 악보·저장 형식과 OSMD 렌더링 코드는 바꾸지 않는다.

- 원본 SHA-256: `224ee5bee61d31ff3d07ade025f931a6cecd394cb54d2e39b1e7af2f0c7f1f5d`
- 설치 후 SHA-256: `188143ec32993942bf7826eb7445bd6ae4a568be01fdf887681f566f23ea6c88`
- 원본 1,420,444바이트 → 1,323,982바이트, 96,462바이트 감소. 이는 OSMD 파일 크기이며 최종 앱 압축 전송량의 측정값은 아니다.

pnpm의 `patchedDependencies`와 lockfile이 설치 시 패치를 적용한다. `pnpm-workspace.yaml`의 `opensheetmusicdisplay>jszip: catalog:` override는 별도로 설치되는 의존성도 공통 버전에 맞춘다. 패치는 프로젝트에만 적용하며 공통 store 원본이나 다른 프로젝트를 덮어쓰지 않는다. 앱 빌드번호의 소스 해시에도 패치 파일을 포함한다. upstream 파일이 한 줄로 압축되어 있어 패치 파일의 diff는 크지만 실제 변경 범위는 위 모듈 하나다.

OSMD를 갱신할 때는 새 배포 파일의 내장 ZIP 여부부터 확인한다. 아직 내장되어 있으면 `pnpm patch opensheetmusicdisplay@<새 버전> --edit-dir .tmp/<작업 폴더>`로 준비하고, AST로 확인한 JSZip 모듈만 공통 `require("jszip")` 참조로 교체한다. 새 버전에서 모듈 번호가 같다고 가정하지 않는다. 나머지 코드의 바이트 일치와 문법을 확인한 뒤 `pnpm patch-commit <작업 폴더> --patches-dir config/patches`로 패치를 갱신한다. pnpm 명령 이름의 `patch-commit`은 패치 파일 생성이며 Git 커밋이 아니다.

개발 중에는 생성 고지를 갱신한 후 `pnpm run check`로 공유 의존성 경로·내장 구버전 제거·라이선스 항목과 코드 품질을 검사한다. 릴리스에서는 기존 압축 MusicXML·drumscore·백업의 저장/읽기, 두 앱의 악보 렌더링과 빌드 결과를 함께 확인한다. 정적 검사 성공을 기능·화면 검증 완료로 보고하지 않는다.

근거: [pnpm patch](https://pnpm.io/cli/patch), [pnpm overrides](https://pnpm.io/settings/dependency-resolution#overrides).
