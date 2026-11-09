# Node·OSMD 경고 수정과 번들 로딩 비용 실측

- 목표: Node 재생 시험의 저장소 경고와 OSMD import 경고를 원인에 맞게 수정하고 큰 번들의 실제 로딩 비용을 보고한다.
- 범위: 기존 재생 테스트의 설정 주입, 지연 로딩되는 MusicXML 모듈 안의 OSMD import 통일, 로컬 production 빌드 계측과 PDF 자산 비중 분석.
- 완료 조건: 기존 재생·저장 설정·MusicXML 회귀와 정적 검사·두 앱 빌드가 통과하고 두 경고가 사라지며 초기/악보 기능 로딩 비용과 한계를 기록한다.
- 제외: 기존 jsdom·TypeScript 미커밋 작업 변경/삭제, 새 사용자 기능·임의 번들 분할·경고 억제·패키지 교체, 새 시험 DB·합성 자료 생성, 커밋·푸시·발행과 iOS 실기기·시뮬레이터.
- 검증: 기존 자료/테스트를 재사용하며 Node 경고 trace와 실제 산출물의 import 그래프, 로컬 5173의 production 빌드 및 브라우저 네트워크/실행 시간으로 판정한다. 공개 서비스는 변경하지 않는다.

## 시작 상태와 방법

- 시작은 main `1fe915bcd40e560e100eb62d49e5bb1341609eef`, 두 앱 0.10.2·소스 빌드 `4b33ee844efd`다. jsdom 31·TypeScript 7 전환과 이전 history 수정은 사용자 소유 미커밋 상태로 보존한다.
- Node 경고는 제작기 adapter의 기본 브라우저 설정 읽기를 사용하는 순수 오디오 테스트에서 발생한다. 해당 테스트만 기존 constructor의 설정 주입을 사용한다. 저장소 adapter를 실제로 검사하는 테스트의 localStorage 대체 함수와 단언은 유지한다.
- 앱이 MusicXML 기능을 지연 로딩한 뒤 OSMD를 이미 정적으로 참조한다. MusicXML 모듈의 OSMD import도 정적으로 맞춰 불필요한 동적 wrapper를 없애며, 앱 진입점의 지연 로딩과 조판 함수/출력 규칙은 유지한다.
- CPU·네트워크 제한과 실행 계측은 Safari MCP의 지원 범위를 넘어 ego-browser의 CDP로 수행한다. 실제 환경을 기록하고 Chromium 측정값을 Safari/iPhone 실측으로 표현하지 않는다. 기존 브라우저 저장 자료를 삭제하거나 새 프로필·시험 DB를 만들지 않는다.
- PDF 분석은 ZIP 확장자 대신 manifest의 format/MIME와 실제 자산을 사용한다. PDF 원본과 PDF용 페이지의 기존 압축 바이트를 합산하며 패키지를 재저장하지 않는다.

## 결과

### 경고 수정과 검증

- `tests/local-media/player.test.ts`의 순수 오디오 테스트 8곳은 기존 constructor에 `restartMeasure/countOff=true`를 주입한다. 실제 브라우저 저장 설정을 검사하는 3곳의 constructor와 localStorage 대체 함수·단언은 그대로다. 앱의 저장 동작·예외 처리·Node 경고 출력 정책은 변경하지 않았다.
- `musicxml.ts`의 OSMD 동적 import를 같은 모듈의 정적 import로 통일했다. `playback-words.ts`가 이미 정적으로 사용하는 동일 엔진이며 앱 → 악보 기능의 동적 import는 유지한다. 새 loader·wrapper·일괄 청크 분할은 추가하지 않았다.
- `NODE_OPTIONS=--trace-warnings pnpm exec vitest run tests/local-media/player.test.ts tests/integration/playback-preferences.test.ts tests/integration/note-highlight-preference.test.ts tests/local-media/musicxml.test.ts`: 4파일·53검사 통과, 해당 Node 저장소 경고 없음. 새 시험 DB·fixture를 추가하지 않고 기존 검사만 실행했다. 이전 업데이트의 전체 797검사를 이번 재실행으로 보고하지 않는다.
- `pnpm run check`와 두 앱 `pnpm run build` 통과. OSMD `INEFFECTIVE_DYNAMIC_IMPORT`가 사라졌고 62바이트 동적 wrapper도 없어졌다. JSZip 공유·앱 경계·기존 저장 계약을 유지한다. 500kB 크기 경고는 그대로이며 기준을 올리거나 로그를 숨기지 않았다.
- 두 앱 0.10.2 유지, 소스 빌드 `843cb6507da6`. app entry의 크기는 editor 832,321B·player 709,459B로 이전과 같고 player MusicXML chunk는 1,380,014 → 1,379,807B다. 경고 제거를 큰 용량/성능 개선으로 표현하지 않는다.

### 측정 환경과 방법

- macOS Darwin 27.2.0·arm64·Apple M4 Pro 12논리코어/24GiB, Node 26.13.0·pnpm 12.18.0, Ego/Chromium 156.0.8078.74의 실제 viewport 697×975다. 로컬 `vite preview --mode player --outDir dist/player --host 127.0.0.1 --port 5173 --strictPort`가 gzip으로 제공한 production player를 사용했다.
- 초기 목록은 기존 저장 자료를 사용해 6개 카드가 준비된 시각이다. 목록 준비 후 실제 MusicXML chunk를 별도로 import해 전송·압축 해제·초기 실행의 합산 시간을 측정했다. 이 import 측정에는 악보 렌더링·음원 디코딩이 없다. URL의 고유 query로 재사용을 분리하고 각 조건 3회 중 중앙값과 범위를 원자료에 남겼다.
- 각 시도에서 HTTP 캐시 미사용을 지정하고 ResourceTiming의 실제 전송·gzip body 크기로 확인했다. 프로세스는 재사용하므로 완전히 새 브라우저의 cold V8/JIT 상태는 보장하지 않는다. CPU 4배 제한은 CDP의 합성 조건이며 실제 iPhone/Safari 기종을 모사한 결과가 아니다.
- 고수준 `goto()` 사용 시 CDP 설정이 보존되지 않은 초기 관측과, navigation에서 초기화되는 ScriptDuration을 차분해 음수가 된 초안은 최종 수치에서 제외했다. 동일 탭의 직접 `Page.navigate`와 navigation별 누적값/같은 문서 안의 차분으로 보정했다. V8CompileDuration은 0을 반환하므로 별도 컴파일 비용의 증거로 사용하지 않는다.

| 조건 | 초기 목록 준비 중앙값 | 추가 MusicXML import 중앙값 | 초기 JS 실행 중앙값 | 추가 모듈 JS 실행 중앙값 |
|---|---:|---:|---:|---:|
| 로컬·CPU 1배 | 114ms | 130ms | 37ms | 79ms |
| 10Mbps·지연 80ms·CPU 4배 | 556ms | 689ms | 88ms | 232ms |
| 1.6Mbps·지연 150ms·CPU 4배 | 1,588ms | 2,334ms | 96ms | 201ms |

초기 JS gzip body는 player 190,947B + runtime 629B = **191,576B**다. MusicXML은 초기 목록에서 요청하지 않았고 해당 기능에서 추가로 **357,179B**를 전송했다. 파일의 raw 709kB/1.38MB 경고를 실제 네트워크 전송량으로 표현하지 않는다. editor의 정적 gzip 크기는 221,607B이며 이번 브라우저 로딩 계측은 player만 대상으로 했다. 인터넷·Sites CDN·실기기·현장 백분위 성능으로 일반화하지 않는다.

### 실제 저장 악보 열기 관측

기존 Loveholic의 실제 열기 버튼을 사용했고 세 경우 모두 렌더 캐시 hit·123마디·1마디 표시와 준비 완료를 확인했다. 재생은 시작하지 않았으며, 아래는 조건별 단일 관측으로 위 3회 import 측정과 구분한다.

| 조건 | 전체 열기 | conversion | rendering | screen | audio |
|---|---:|---:|---:|---:|---:|
| 로컬·CPU 1배·HTTP 캐시 미사용 | 3,284ms | 232ms | 165ms | 1,575ms | 265ms |
| 1.6Mbps/150ms·CPU 4배·HTTP 캐시 미사용 | 25,555ms | 2,401ms | 490ms | 21,192ms | 295ms |
| 같은 제한·일반 HTTP 캐시 사용 | 8,664ms | 618ms | 477ms | 6,063ms | 307ms |
| 같은 페이지 재열기·로컬·CPU 1배 | 2,782ms | 79ms | 160ms | 1,307ms | 251ms |

- 나머지는 앱의 opening/read 단계다. 단계별 값은 기존 `drumLoadTimings`의 wall-clock 관측이며 개별 함수의 CPU 비용과 같지 않다. warm 재열기는 추가 네트워크 요청이 없었고 opening 약 900ms도 남았다. 그 내부 원인은 추가 세부 계측 전 확정하지 않는다.
- HTTP 캐시 미사용에서는 Pretendard 두 파일을 JS의 명시적 fetch와 CSS FontFace가 각각 요청해 총 3,114,096B의 body를 전송했다. 느린 조건의 screen 시간에는 이 대기가 포함된다. 일반 캐시 조건에서는 같은 요청들이 캐시를 재사용했고 ResourceTiming transferSize는 각 300B였다. 캐시 미사용의 25.6초를 보통 사용자의 첫 방문/재열기 시간으로 일반화하지 않는다.
- 실제 OSMD 조판을 새로 수행한 cold-render 비용은 측정하지 않았다. 기존 `score-render:cache-hit`는 로컬 28ms·CPU 4배 제한에서 약 90ms였다. 표시 확인을 청취·전곡 재생·실기기 안정성 보증으로 확대하지 않는다.

### PDF 제외 시 용량

현재 패키지의 manifest와 각 ZIP entry의 압축 바이트를 기준으로 한다. 아래는 PDF 원본 **및 PDF용 페이지**의 합이며, manifest/ZIP 헤더 변화는 제외한 근삿값이다. MB는 1,000,000B다.

| 곡 | 현재 패키지 | PDF 관련 압축 바이트 | 예상 감소 비율 |
|---|---:|---:|---:|
| 바람과 언덕의 발라드 | 11.48MB | 0.50MB | 4.4% |
| Loveholic | 10.96MB | 0.49MB | 4.4% |
| 붉은 노을 | 13.56MB | 0.29MB | 2.2% |
| 갑자기 | 7.97MB | 0.47MB | 5.9% |

기본 연습곡 2개에는 PDF가 없다. 수록 6곡 합계 53,779,164B 중 PDF 관련 압축 바이트는 1,748,118B로 약 **3.25%**다. 음원과 MusicXML용 SVG가 더 큰 비중이다. 초기 목록에서는 패키지를 다운로드하지 않으며 player 빌드에는 이미 PDF 렌더러가 없다. PDF를 제외해도 초기 JS/MusicXML JS 청크 크기는 줄지 않는다. 패키지·원본·선호를 실제로 제거/교체하지 않았다.

### 판단과 후속 우선순위

1. 초기 JS는 이미 압축·지연 로딩 경계가 작동한다. 이번 근거만으로 500kB 이하를 맞추는 추가 분할을 우선하지 않는다. 느린 네트워크의 MusicXML import 2.3초는 후속 최적화 후보지만 기능 전체의 병목과 분리해 판단한다.
2. 일반 캐시에서도 screen 약 6.1초, 네트워크 요청 없는 로컬 재열기에서도 screen 약 1.3초가 남았다. 다음 성능 작업은 SVG/DOM·글꼴 준비를 포함한 **screen 단계**와 opening 단계의 세부 비용을 먼저 계측하는 것이 적절하다. 이 요청에서는 추가 성능 개편을 구현하지 않았다.
3. 글꼴 중복 요청은 캐시 정책별 차이를 확인했으므로, 요청/임베딩을 줄일 수 있는지 후속 검토할 가치가 있다. Pretendard와 독립 SVG의 글꼴·출력 계약을 유지해야 하며 무조건 중복 body 전송이라고 판정하지 않는다.
4. PDF 제외는 선택한 곡의 최초 다운로드/저장 공간을 소폭 줄이는 후보이며 JS 로딩 문제의 해법으로 사용하지 않는다. 별도 결정 전 현 패키지와 PDF 보기 호환성을 유지한다.

실행 근거는 `.tmp/loading-cost-20261109/`의 focused-tests/check/build 로그, chunk graph 전후·프로필별 3회 원자료·`loading-summary.json`, 실제 열기 JSON 3개·`score-asset-breakdown.json`, 브라우저 보존 확인에 있다. 시험 전후 악보 설정/위치·앱 선호·DB 목록이 같고 목록으로 복귀한 뒤 전용 TaskSpace를 종료했다. 커밋·푸시·발행·새 시험 DB 생성은 하지 않았다.
