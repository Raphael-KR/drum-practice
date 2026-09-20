# 오픈소스 고지

## 배포물의 표시

설정 > 정보 > 오픈소스 라이선스에서 설치 버전, 라이선스, 저작권/면책을 포함한 전문, 프로젝트 소스 링크를 확인한다. 내용은 번들에 포함하므로 내보낸 HTML에서도 오프라인으로 읽을 수 있다. SoundTouchJS 패키지의 비압축 dist/soundtouch.js도 저장할 수 있다.

직접 의존성:
- OpenSheetMusicDisplay 2.1.2: BSD-3-Clause
- PDF.js (pdfjs-dist) 6.3.289: Apache-2.0
- JSZip 3.10.2: MIT 선택 (원본은 MIT/GPL 선택 라이선스)
- SoundTouchJS 0.3.0: LGPL-2.1

## 생성 및 검증

scripts/third-party.mjs가 설치된 런타임 의존성을 따라 패키지 LICENSE/COPYING/NOTICE 전문을 수집한다. 별도 파일이 없는 경우 README의 라이선스 절을 보존한다. OSMD의 VexFlow 등 하위 의존성과 PDF.js 동봉 폰트/CMap/디코더 고지도 포함한다. 추가 고지는 사용 여부보다 넓게 보존할 수 있다. 개발 도구만의 의존성은 대상이 아니다.

pretest 및 portable 빌드에서 생성한다. 라이선스 원문을 찾지 못하면 빌드가 실패한다. 생성 JSON은 Git에서 제외하며 앱 코드에 HTML로 삽입하지 않고 textContent로 표시한다. 기존 portable-licenses 데이터와 법적 주석도 보존한다.

## 범위와 외부 배포 확인 항목

이 변경은 고지와 포함된 라이브러리 코드 접근성을 보강한 것이다. 전체 배포 조건의 법률 검토 완료를 뜻하지 않는다. 특히 SoundTouchJS를 앱/worker에 번들링하므로 LGPL 2.1의 라이브러리 수정 후 재결합 조건까지 충족하려면 배포 방식에 따른 대응 소스·빌드 자료 제공 또는 교체 가능한 로딩 구조를 별도로 검증해야 한다. 단순 프로젝트 링크나 비압축 라이브러리 하나만으로 이 조건이 모두 충족된다고 주장하지 않는다.

OSMD의 npm 번들이 참조하는 opensheetmusicdisplay.min.js.LICENSE.txt가 설치 패키지에는 없다. 이번에는 패키지 및 설치된 런타임 의존성의 고지를 수집했으며, 외부 배포 전 번들 내부 자산과 고지의 완전성도 대조해야 한다.

참고: https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html (특히 6절), https://www.gnu.org/licenses/javascript-labels.html
