# PNG / SVG 비교 실험 — 2026-09-19

- 목표: 동일 MusicXML의 페이지 이미지 생성·저장·재표시 비용 비교.
- 범위: OSMD 2.1.2, 110마디 드럼 악보, Mac Chromium 및 iPad mini 시뮬레이터 Safari.
- 완료 조건: 형식별 3회 측정, 입력 해시 일치, 110마디/4페이지 생성, 오류 없는 저장·읽기·디코딩.
- 제외: 앱 렌더링 방식 변경, 사용자 악보 데이터 수정, 실제 iPad 하드웨어 속도 보증.
- 검증: 브라우저 실측 JSON, 마디 영역 비교, Safari 화면 확인. STT/AFM은 수치 측정에 필요하지 않아 사용하지 않았다.

## 방법

`node scripts/build-renderer-benchmark.mjs` → `python3 scripts/benchmark-renderer-server.py`.
로컬 브라우저에서 `http://127.0.0.1:5187/?run=desktop` 또는 `?run=simulator`를 연다. 결과는 docs/experiments/renderer-benchmark에 저장된다. 원본 자료와 실험 출력은 Git에서 제외한다.

입력: public/demo/qa/musicxml-candidate.musicxml. SHA-256: `9d55247e7a12898d711e7f7da3da5cafc2a3f402e47a9920041c649d6e7802b7`.
OSMD A4_P, 폭 1100 CSS px, DPR 2, 시스템당 4마디, 가사 별도 표시를 전제로 drawLyrics=false. PNG는 canvas.toBlob, SVG는 XMLSerializer 원문이다. SVG 최적화는 하지 않았다. 생성 시간은 파싱+OSMD load+render+이미지 인코딩이며 JS 번들 다운로드/초기화는 제외한다.

저장은 별도 IndexedDB의 바이트 배열, 읽기는 Blob 복원 후 새로운 이미지 URL의 decode를 기다린다. 재표시 시간은 읽기+디코딩+8마디 배치+두 번의 requestAnimationFrame이다. SVG를 이미지로 재사용하며 전체 SVG DOM을 앱에 계속 유지하지 않는다. gzip은 페이지별 압축 가능 용량으로, 현행 앱의 실제 저장 형식이 아니다.

## 측정 결과

각 3회 중앙값. MB는 1,000,000바이트. 첫 회도 포함하며 PNG/SVG 순서를 번갈아 실행했다.

| 환경 | 형식 | 생성 ms | 원본 MB | gzip MB | 디코딩 ms | 재표시 ms |
|---|---|---:|---:|---:|---:|---:|
| Mac Chromium | PNG | 288.1 | 1.223 | 0.959 | 25.5 | 1718.6 (판정 제외) |
| Mac Chromium | SVG | 218.2 | 3.771 | 0.641 | 32.6 | 1767.5 (판정 제외) |
| iPad mini Simulator Safari | PNG | 288.0 | 1.329 | 0.998 | 55.0 | 153.0 |
| iPad mini Simulator Safari | SVG | 187.0 | 3.771 | 0.655 | 47.0 | 70.0 |

## 움직임과 정확성

- iOS 27.0 iPad mini (A17 Pro) 시뮬레이터 Safari, CSS viewport 1133×612, DPR 2. Safari UA의 OS 18_7 문자열 대신 simctl runtime iOS 27.0을 기준으로 기록했다.
- 6초씩 3회, 고정된 8마디 배경 위에 진행선/음영을 이동했다. 두 형식 모두 중앙 프레임 간격 17ms(약 60fps). 음악·가사·전체 앱 재생 부하는 포함하지 않은 미세 실험이다.
- Mac Chromium은 RAF가 약 1초마다 호출되어 화면 갱신 제한의 영향을 받았다. 이 환경의 재표시·프레임 수치는 성능 판정에서 제외한다. 초기 진행 보고의 'SVG 재표시가 더 오래 걸렸다'는 관찰도 이 이유로 근거로 사용하지 않는다.
- 모든 12회에서 110마디/4페이지 생성 및 저장·읽기·디코딩 성공. PNG와 SVG의 정규화 영역 최대 차이는 0.0001234, 페이지 높이 기준 약 0.2 CSS px. canvas 높이 정수 반올림과 SVG 소수 viewBox 차이가 있다.
- Safari SVG 41–48마디 화면에서 음표/쉼표/기호 표시 확인: `docs/experiments/renderer-benchmark/ipad.png`. 110마디의 모든 기호를 시각적으로 대조한 것은 아니다.

## 판단

SVG는 생성 단계에서 PNG 인코딩을 줄이며 확대 시 벡터를 유지한다. 이 표본에서 생성은 더 빠르고 시뮬레이터의 재표시도 더 빨랐다. 하지만 SVG 원문은 PNG의 약 2.8–3.1배다. gzip으로 저장하면 SVG가 PNG보다 약 33–34% 작아진다. 단순 SVG 교체만으로 저장 공간이 줄어든다고 볼 수 없다.

따라서 권장 후보는 **MusicXML 정본 + 압축 SVG 표시 캐시**다. 전환 전 압축 해제 비용·독립 HTML·실제 iPad·전체 재생 흐름을 추가로 검증해야 한다. 이번에는 비교 도구와 기록만 추가했고 앱은 기존 PNG 방식을 유지했다. 한 곡, 형식별 3회이므로 다른 악보 전체로 일반화하지 않는다. PNG 인코더/브라우저 차이 때문에 같은 악보도 환경별 바이트 수가 달랐다.
