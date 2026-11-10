# 현행 악보의 같은 보표 가사 성부 전환 — 2026-11-10

- 목표: ADR-0029에 따라 현행 제작 정본을 공통 작성기로 v2 전환한다.
- 범위: 6곡의 별도 제작 후보, 곡별 기록, 인벤토리·검증·인계 증거.
- 완료 조건: 드럼·가사 시각/음가·겹침·마디 연장·ID·확정 상태·메타정보·음원 연결을 보존한다.
- 제외: src/public/history.md/공통 Rule 수정, 과거 자료 재작성, GUI·렌더링·재생·커밋·푸시·배포.
- 검증: 기존 실제 자료의 XSD·유리수 시간축·원본 드럼 XML·가사 구간·전체 Song 왕복·재직렬화 동등성.

## 입력 식별과 보존

현재 public 패키지 source·manifest.canonicalXML과 최신 로컬 제작 XML이 바이트까지 같은 6곡을 선정했다. 기존 입력은 덮어쓰지 않았다. `data/production`, `data/reference`, `docs/experiments`의 기존 MusicXML 108개를 조사했으며 파일별 SHA·분류는 `data/production/shared-staff-lyrics-20261110/inventory.json`에 있다. 이 범위 밖 사용자 저장본이나 모든 파일시스템을 조사했다는 뜻은 아니다. 수록 외 별개의 현행 곡 정본은 확인되지 않았으며, 같은 곡의 생산 입력·과거 후보는 일괄 전환하지 않았다.

분류 집계: superseded-or-experiment-preserved=93, selected-current-canonical=6, same-bytes-alias-preserved=2, producer-input-preserved=7.

## 새 현행 제작 정본

아래 경로는 새 제작 정본이며 앱 수록본 반영은 개발 담당자가 수행한다. 기존 기록의 이전 날짜 “현재”는 당시 상태로 보존한다.

| 곡 | 마디 | 가사 단위 / 구간 | 가사 성부 | 새 정본 | SHA256 |
|---|---:|---:|---|---|---|
| 갑자기 | 93 | 301 / 301 | 2 | `data/production/shared-staff-lyrics-20261110/ioi-suddenly/score.musicxml` | `4984e748a45468d91f1d5e2be0663a8ff758deb2871c3c6aaf0eea41af8dd8f4` |
| Loveholic | 123 | 269 / 269 | 2 | `data/production/shared-staff-lyrics-20261110/loveholic/score.musicxml` | `785b487ad7723083f677d29dea9515ee915f82ce271866380f200ef8a427567c` |
| 바람과 언덕의 발라드 | 110 | 515 / 561 | 3, 4 | `data/production/shared-staff-lyrics-20261110/real-paradis/score.musicxml` | `45b1f48399ece2d5c124955ab709f075f39f4fbf88b3a7327c64e048d6043cb6` |
| 붉은 노을 | 137 | 0 / 0 | 없음 | `data/production/shared-staff-lyrics-20261110/red-sunset/score.musicxml` | `ef2524aeef2b986aff3c452d13355cdc249842a661e12b9a29eff23408a6e3cc` |
| 시작전 손플기 | 96 | 0 / 0 | 없음 | `data/production/shared-staff-lyrics-20261110/preplay-warmup/score.musicxml` | `af65c59f6aa8f2b5e869bd1f91d284959515ddd0e8cb85dfdb53170999ec580f` |
| 탐탐 무빙 연습 | 28 | 0 / 0 | 없음 | `data/production/shared-staff-lyrics-20261110/tom-moving/score.musicxml` | `8beb89826461eb7fd65bff16244e74c4cd01b9478f1656c487650fa876842839` |

## 수행과 검증

Node 22.22.2의 Vite SSR·JSDOM에서 기존 `readCanonical`/`writeCanonical`을 직접 사용했다. WebSocket/HMR·watch는 끄고 포트를 열지 않았으며 실행 후 종료했다. writer 소스 해시는 conversion.json에 고정했고 전환 중 변경되지 않았다. 제작 측이 공통 작성기나 곡별 우회를 추가하지 않았다. lxml 6.1.1 환경에서 전후 MusicXML 4.0 XSD와 독립 유리수 대조를 수행했다.

6곡 모두 PASS. 소유 가사 블록을 제외한 드럼 XML은 divisions 단위를 정규화하여 동일하며 시간표도 같다. 가사 구간은 onset·길이·텍스트·syllabic·extend를 각각 비교했다. 바람과 언덕의 발라드는 기존 드럼 1·2성부를 유지하고 가사 3·4성부로 겹침과 마디 연장을 보존한다. 나머지 가사 곡은 2성부 하나를 쓴다. 가사 없는 3곡은 빈 파트만 제거하고 빈 가사 성부를 만들지 않는다. 숨긴 가사 음표는 print-object=no·dynamics=0이며 실제 lyric을 가진 음표에 print-lyric=yes가 있다. 전체 canonical Song 객체와 반복 저장 결과도 동일하다. public 패키지 해시는 전환 시 보존되어 있다.

### 검사 진단과 표현 차이

첫 검사에서 가사가 없는 숨긴 쉼표까지 print-lyric=yes를 요구한 것은 잘못된 검사 조건이었다. 실제 lyric 음표와 쉼표를 구분한 뒤 재검사했으며 초기 결과는 verification-initial.json으로 보존했다. 추가 상위 메타정보 검사에서는 기존 movement-title이 없던 5곡을 단순 노드 일치로 실패 처리했다. 공통 writer가 기존 display-title=Song.title과 같은 텍스트를 movement-title에 기록한 것이며, 원래 movement-title이 있던 곡은 그대로다. 제목 의미와 work/defaults/credit/악기 정의/가수/기타 메타정보 보존을 확인했다. 이 표현 추가를 허용한 근거와 실패 보고서 verification-top-level-diagnostic.json을 보존했으며 후보 XML이나 앱 코드는 바꾸지 않았다.

## demo 및 수록 외 범위

`public/demo/score.musicxml`(SHA256 `31d6e7d3eec6655950abf74679595b4b8bfb721d584a1acd3fafd10e7aa3727a`)은 가사·v1 메타정보가 없는 옛 P1 110마디 원시 입력이다. 이를 별도 가사 변환 대상으로 오인하지 않았다. 같은 곡의 최신 정본은 위 real-paradis 후보이며 개발 담당자에게 demo의 기존 PDF 연결을 이 정본으로 바꿀 경우의 대응 경로/해시를 전달한다. 원시 XML과 최신 가사 정본이 같은 바이트 또는 같은 입력이라고 주장하지 않는다.

## 한계와 인계

정적 XML/의미 대조 결과이며 새 SVG·레이아웃·실제 음향·앱 저장/재열기·공개 반영 검증은 수행하지 않았다. public 패키지, demo와 앱 코드의 반영은 개발 담당자 범위다. 원본/과거 실험을 보존하며 사용자 DB는 변경하지 않는다. 인계 대상은 기존 웹앱 개발 채팅 `01a0afc9-ca21-7371-9390-06eb07c017e9`이다.

집계 manifest: `data/production/shared-staff-lyrics-20261110/manifest.json`. 개별 공통 인계 초안과 증거는 각 곡 하위 `handoff/`, 실제 전송 본문과 receipt는 집계 폴더의 `handoff-message.md`·`handoff-receipt.json`으로 구분한다.

개발 담당자는 demo가 이번 가사 저장 형식 전환 대상이 아님을 확인하고 기존 파일 해시·코드 연결을 유지하기로 했다. 위 real-paradis 대응 경로는 최신 정본의 식별이며 demo 교체 지시가 아니다.

최종 인계 본문을 저장하고 기존 개발 채팅에 전송했다. 도구가 대상 threadId와 isError=false를 반환하여 전송 접수를 확인했다. `handoff-receipt.json`에 기록했으며 수신자의 실제 앱 반영 완료를 뜻하지 않는다.

집계 receipt 저장 때 공통 CLI의 --out을 파일 경로로 해석한 첫 호출은 실패했다. 이 도구는 개별 compose 출력 폴더를 받으므로 개별 인계 초안은 공통 도구로 유지하고, 실제 전송한 6곡 집계 본문의 SHA·대상·시각·도구 응답은 별도 집계 receipt로 기록했다. 실패 호출은 전송을 수행하지 않았으며 메시지를 중복 전송하지 않았다.

## 개발 담당의 앱 수록 반영

제작 인계 후 개발 담당이 정본·보고서 해시를 직접 대조하고 `public/scores/`의 현행6패키지에 적용했다. 패키지의 `manifest.canonicalXML`·`score/source`와 XML 자산 크기만 갱신했다. 두 XML은 위 새 정본과 바이트까지 일치한다. 나머지41자산(음원·PDF·페이지)과 전체 `Song`·다른 manifest 필드는 변경 전과 동일하다.

| 패키지 | 반영 후 SHA256 |
|---|---|
| `public/scores/ioi-suddenly.drumscore` | `487e607cdef9a7e7c36c49416d7cd1c6b158d4429c94ce6363da8990d97997b5` |
| `public/scores/loveholic.drumscore` | `170e11e6ae2e9c0e9e205820950c1e1295e52ed508bbcb4e0135516e92fcec46` |
| `public/scores/real-paradis.drumscore` | `f32d6b45cbeb92b84a6146064a7bfba391daf8f64108b65b807eb1f3c0b64570` |
| `public/scores/red-sunset.drumscore` | `749694da9874ee10793d49ee1f0420178b848f793f0f021234a4e1090b5a0e62` |
| `public/scores/preplay-warmup.drumscore` | `d42d654482332f97c620605ed15881b2a4861d6f92c5581a354e40ebe9c2b534` |
| `public/scores/tom-moving.drumscore` | `fbb8400fc63171dc51c91a39f916ff8edc05975de9010e3e0c8d37d935c5d401` |

두 앱의 기존 공통 카탈로그와 패키지 입력을 유지한다. 제작기는 공통 `readCanonical`의 v1/v2 읽기와 `writeCanonical`의 v2 쓰기를 사용하며, 양쪽 전체 SVG는 `prepareFullScore`·OSMD 기본 가사 출력을 공유한다. 연주 조판은 소유 가사 리듬을 제외하고 기존 HTML 가사·마디 좌표 경로를 유지한다. 수록 반영을 위한 앱별 복제 코드나 곡별 보정은 추가하지 않았다.

기존 브라우저 DB·사용자 편집·연습 정보는 일괄 덮어쓰지 않았다. 예전 정본과 전환 전 패키지는 보존하며, 가사 없는 `public/demo/score.musicxml`의 해시·구형 PDF 연결도 유지한다. 변경 전 패키지 복사와 항목별 해시, 스테이징 및 반영 후 대조는 `.tmp/shared-staff-packages-20261110/{before.json,staging-verification.json,applied-verification.json}`에 있다.

Node22.22.2·pnpm12.18.0에서 `pnpm run check`를 통과했다. lint·477파일 서식·앱/도구/hosting 타입·의존성·i18n·공통 모듈 경계·문서/링크/앵커를 검사했으며 `git diff --check`도 통과했다. 로그는 같은 증거 폴더의 `static-check.log`다. 두 앱 버전0.11.0과 소스 빌드 `16ab7d6d603f`를 유지한다.

이 결과는 파일·XML 의미·자산·타입·소스 연결의 정적 검사다. 화면·OSMD 재렌더링·오디오 재생·앱 저장/재열기·시험 DB·번들 빌드·공개 사이트는 검사하지 않았다. 커밋·푸시·발행도 하지 않았다.
