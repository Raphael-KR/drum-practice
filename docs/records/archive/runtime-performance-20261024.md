# 앱 실행 반복 작업 점검 · 2026-10-24

문서 역할: **1차 실행·검증 기록**. 이 결과는 아래 로컬 자료·브라우저·코드에 한정한다. 메모리의 장기 안정성이나 Safari native 충돌 해결을 확정하지 않는다.

## 목표와 범위

실제 실행에서 불필요한 프레임 계산·DOM 재기록과 오디오 예약 목록 재생성을 줄인다. 두 앱 공통 모듈과 제작기 고유 시간 표시를 수정한다. 기존 음악 시각·원본/수록 패키지·DB/키·저장 형식·UI 배치를 유지한다. 커밋·버전 인상·push·공개 발행은 하지 않는다.

시작 main `3aa80bfa030e3593ab0cced799b0d64a884779e1`, 기준 빌드15ce6955d5d1. 작업 브랜치 `codex/runtime-performance`, 앱0.8.14 유지. 최종 제품 소스 빌드5041ab539b9d이며 앱 코드에 상시 profiler를 넣지 않았다. [조판 Rule](../../reference/score/rendering.md#browser-musicxml-rendering--승인된-표시-계약)과 [책임/캐시 수명](../../reference/engineering/architecture.md#project-structure--의존-규칙)을 함께 갱신했다.

## 확인한 중복과 수정

| 경로 | 기존 반복 | 최종 동작·무효화 |
| --- | --- | --- |
| playback-screen의 두 줄 높이 | 매 프레임 전곡 regions/필요 시 마디별 공통 높이 재계산 | track 배치·보기/확대/폭/자산 변경·reset에서 계산. 초기 폭 변화도 직접 감지하고, crop 크기 쓰기 뒤에 fitted geometry를 적용해 첫 프레임부터 기존 배치 유지 |
| playback-tempo | 원곡의 전체 박 그리드 배열 재생성, 연습 BPM의 같은 XML 재파싱 | 화면 수명의 스냅샷과 sync/renderTrack·Song/BPM/마디 배열/XML 변경 시 갱신. 같은 객체 내부 박 시각 편집은 host sync/renderTrack 계약 유지 |
| note-highlight | 같은 SVG의 음표 목록/onset 정렬·beam JSON 해석 반복 | SVG 수명 안의 WeakMap. 교체된 줄은 새 키를 쓰고 제거된 줄을 전역 strong 참조로 보관하지 않음. 박/펄스 변화 시만 다시 계산하고 같은 style/clip 값은 재기록하지 않음 |
| 공통 위치/진행 표시 | 없는 위치 복사 버튼의 전곡 좌표·복사용 문구 생성, 같은 접근성 속성 쓰기 | 버튼이 존재할 때만 좌표 문구 계산. 숫자/ARIA는 실제 값이 변할 때 기록하며 포커스/드래그 중 입력 보존 |
| audio-core의25ms tick | 같은 cycle 전체 count-off/클릭 목록과 원음→출력 시각을 매 tick 재생성 | cycle 생성 때 한 번 계산. tick은 기존150ms 예약 범위/5ms 지각 허용과 cursor만 사용. 새 cycle/seek/배속은 새 목록, 종료/pause/load는 함께 해제 |
| 제작기 시간 표시 | 정지 중 같은 elapsed/editor-time 텍스트 교체·seek ARIA 쓰기 | 실제 값이 달라질 때만 기록. 현재 위치·마디·스크럽 동작 유지 |

기존 실제 자료·DOM/AudioContext 시험 틀을 확장해 같은 프레임에서의 무변경과 입력 변경 후 갱신을 같이 검사한다. 새 곡/시험 DB/합성 악보는 만들지 않았다. 기존 반복/배속/시킹 검사는 beatEvents 호출이 새 cycle 생성 횟수와 같고 실제 예약 시각/중복 방지가 유지됨을 확인한다.

## Safari의 수정 전후 계측

사용자 추가 지시로 Safari MCP를 사용했다. 기준은 HEAD의 src를 `.tmp/runtime-performance-20261024/baseline/`에 읽기 전용 측정 사본으로 꺼낸 것이다. 현재 작업 소스를 reset/rollback하지 않았다. generated 라이선스 입력은 동일하고 기준 빌드 metadata는 직전 실제0.8.14 커밋 영수증을 사용했다. 두 측정 모두 같은 로컬 origin·최신 붉은 노을 패키지·112마디 시작·두 줄·음량0이다. 임시 runtime은 실제 공통 패키지/조판/플레이어를 사용하며 저장 callback을 주지 않아 개인 저장곡/설정을 쓰지 않는다.

계측은 실제 song 배열 메서드·DOM query를 원래 구현에 그대로 위임하는 임시 wrapper로 호출 횟수를 센다. MutationObserver와 rAF도 같은 조건으로 적용하고 모두 해제했다. 이 수치는 연산 감소의 증거이며 CPU 사용률 감소 비율과 동일하지 않다.

| 관측 | 수정 전 | 최종 |
| --- | ---: | ---: |
| 정지4초 rAF | 288 | 288 |
| 정지 전곡 regions.map | 288 | 0 |
| 정지 마디 배열 iterator | 288 | 0 |
| 정지 querySelectorAll | 1,440 | 864 |
| 정지 stage DOM mutation | 0 | 0 |
| 재생4초 rAF | 288 | 285 |
| 재생 전곡 regions.map | 288 | 0 |
| 재생 beatEvents용 마디 filter | 142 | 0 |
| 재생 마디 배열 iterator | 576 | 0 |
| 재생 querySelectorAll | 1,450 | 871 |

정지 query 호출은40% 감소했다. 재생은 카운트오프/박 위치·프레임 수가 조금 달라 전체 CPU/페인팅 개선율로 환산하지 않는다. 기준 재생의 최대 프레임 간격22ms, 최종4초는52ms 1회가 있었으므로 전체 프레임 지연 개선을 확정하지 않는다. 후속 실제 반복10초는721프레임·최대17ms·50ms 초과0회였고 클릭 목록을 새 cycle용으로2회만 만들었다.

원곡 재생은 Safari MCP의 실제 재생 버튼 입력 뒤 해당 runtime AudioContext가 running이고 위치가 전진함을 확인했다. 반복10초의 위치212.726→208.086 복귀와 자연 반복·카운트오프 표시를 확인했다. 반복 해제 후 한 줄/두 줄 전환·정지 스크롤에서도 위치212.062초가 유지됐다. 실제 화면 캡처를 열어 음표/강조·마디 배치를 확인했다. 제작기 실제 화면은 이번 Safari runtime 검수 범위에 없고 공통 두 host·제작기 UI 회귀로 확인했다.

화면 대조 중 crop 크기 계산이 row CSS를 덮어쓰는 초기 적용 순서 차이를 발견했다. fitted geometry를 crop 계산 뒤 적용하고 폭도 확인하도록 보완했다. 최종 stage1024×385px·마디256px·row163.12px·pitch191.12px·전체 높이6691px로 기준의 화면 높이/스크롤 구조와 같다. 이 관계와 폭 변화 후 재계산 회귀를 추가했다. 조판 출력/파생 정책v36·공개 패키지는 바꾸지 않았다.

Safari native evaluate의 비동기 시작만 반환한 첫 요청은 뒤 호출에서 상태를 유지하지 못했고, Promise 자체를 반환해 완료까지 기다리는 지원 경로로 수정했다. source 수정 직후의 HMR unload 오류는 페이지 완료를 확인한 뒤 이어갔다. 자동화 때문에 재생 코드를 수정하거나 자동 재생 제한을 해제하지 않았다.

## Ego의 실제 재생·메모리/프로세스

사용자가 지정한 ego-browser 스킬/설치 가이드를 읽고 TaskSpace11의 한 페이지를 재사용했다. 첫 접속은5173 서버가 없어 거부됐고 그 포트로 개발 서버를 시작한 뒤 이어갔다. SystemInfo/Browser window CDP 일부는 Ego의 지원 경계에서 거부돼 OS 프로세스 읽기와 페이지 Performance/Memory 지표로 구분했다. 임시 Player prototype 계측은 모듈 인스턴스 차이로0회를 반환해 근거에서 제외했고, 실제 AudioContext.resume/오디오 타이머의 원래 구현을 그대로 호출하는 관측으로 확인했다.

- Ego는 문서 visible/focused 상태에서도 rAF가 약1Hz였다. 이 환경의 CPU/프레임 값을 실제 사용자72fps나 Safari와 비교하지 않는다. JS heap/DOM/프로세스 값은 별도로 보존한다.
- 최종 실제 재생: 동일 runtime context running, AudioContext6.860→11.912초, 음악 위치206.736→211.764초. 25ms 타이머는 시작/대기 포함309회 관측했다. 실제 decode된32kHz PCM은68,565,368bytes(약65.4MiB)다.
- 자연 재생 관측의 JS heap은 약10.8MiB, 해당 renderer의5초 CPU 누적 증가130ms였다. rAF 제한 환경이므로 일반 재생 CPU 요구량으로 확대하지 않는다.
- 뷰 왕복3회·진단용 강제 GC 후 JS heap은9,087,944→9,129,248→9,217,900→9,253,960bytes(약8.67→8.83MiB). GC 사용 관측은 자연 메모리 동작/장기 누수 부재의 증거가 아니다. bounded 검수에서 큰 선형 증가를 확정하지 못했다.
- 페이지 CDP ProcessTime34.068681초와 OS 누적 CPU34.07초가 일치하는 renderer PID12255의 RSS는약816.7MiB였다. JS heap과 PCM 외 메모리의 상세 소유자는 미확정이며 이 전체를 앱의 제거 가능한 메모리라고 보지 않는다. 그렇다고 작은 heap만으로 전체 메모리가 가볍다고 보고하지 않는다.
- TaskSpace 종료/자원 해제 후 해당 PID가 존재하지 않음을 OS에서 확인했다. 종료된 측정 탭의 renderer가 계속 남는 현상은 이 범위에서 관측되지 않았다. 다른 Ego/Safari 프로세스는 종료하지 않았다.
- Ego Lite0.6.0.16의 업데이트 알림을 받았으나 업그레이드하지 않았다. TaskSpace는 finish(keep:[])로 한 번 종료했다.

## 검증과 보존

- 초기 공통 변경은 전체129파일767검사와 두 앱 빌드/경계를 통과했다. 화면에서 발견한 최종 배치 순서·폭 보완 후 집중4파일150검사도 통과했다.
- 최종 소스5041ab539b9d에서 `npm run verify` 전체129파일767검사·ESLint·서식433파일·앱/도구/hosting 타입·문서/구조·두 앱 빌드/경계 통과. 최종 로그는 `verify-complete.log`다. Vite 청크 크기와 Node localStorage 안내는 비차단 경고이며 검사 기준을 끄지 않았다.
- public6곡의 모든 SHA256은 시작과 같다. 붉은 노을 `cf57783b65f512ccd67506481971044495952bdc088a41e986b544773496af14`. DB·키·직렬화·원음원·정본 XML·가사/박 시각·개인 저장곡을 변경하지 않았다.
- 실제 runtime과 임시 계측을 해제하고 직접 만든 Safari 탭만 닫았다.5173 서버는 유지했다. 커밋·push·발행·공개 사이트 시험·iPad·청취는 하지 않았다. Safari native 충돌 최종 해결도 이번 결과로 확정하지 않는다.
- 근거는 Git 제외 `.tmp/runtime-performance-20261024/`의 baseline/candidate/ego-final JSON, baseline-gc JSON, safari-initial/safari-final JSON, 최종 두 화면 PNG, 집중/전체 로그와 receipt에 있다. 과거 실패/중간 결과는 최종 성공과 구분해 보존한다.

## 남은 검토 후보

1. RSS의 큰 부분을 차지할 수 있는 native SVG/글꼴/이미지·음원 메모리를 항목별로 계측할 필요가 있다. 현재816.7MiB의 세부 원인이나 장시간 증가 여부는 미확정이다. 보기별 자산을 지연 준비하는 변경은 첫 로드·보기 전환·복구 계약을 먼저 정한 뒤 별도 진행한다.
2. 첫 박 조정 파형은 매 프레임 전체 SVG/버튼을 교체한다. 같은 창/파형 구간에서 cursor만 바꾸는 개선 후보이나 이번 실제 악보 재생 경로와 별개여서 변경하지 않았다.
3. 정지 rAF/전체 마디 DOM 순회는 남아 있다. 즉시 DOM 재기록은0이지만 이벤트 기반 전환에는 외부 편집·포커스·복사 완료·선택/범위 preview 무효화 계약이 필요하다. 무리한 프레임 속도 제한으로 애니메이션이나 오디오 정확도를 낮추지 않았다.

## 최초 계획

### 앱 실행의 반복 작업 점검

- 목표: 실제 재생에서 불필요한 계산·DOM 재기록을 줄여 두 앱의 실행 부담을 낮춘다.
- 범위: 두 앱 공통 playback·score·audio UI의 프레임 경로와 기존 조정 파형. 실제 수록 자료를 사용하는 로컬 ego-browser와 프로세스 관측을 포함한다.
- 완료 조건: 수정 전후 같은 곡·보기·구간의 관측, 중복 작업 감소 근거, 재생·보기·탐색·반복·강조의 기존 동작과 저장 호환성 유지다.
- 제외 범위: 새 프레임워크·저장 마이그레이션·개인 저장곡 교체·오디오 스케줄 정확도 저하·버전 인상·commit/push/발행·Safari 충돌 완치 선언.
- 검증: 실제 붉은 노을의 정지/재생/보기전환에서 CDP 작업시간·JS heap/DOM·앱 renderer 프로세스 RSS/CPU를 구분해 비교한다. 기존 자료 기반 회귀와 필요한 전체 검사를 실행하며 강제 GC 실험은 자연 메모리 관측과 구분한다. Chromium 결과를 iPad/Safari 검증으로 확대하지 않는다.

#### 1차 코드 조사

아래는 측정 전 후보이며 성능 원인으로 확정하지 않는다.

- 두 줄 `renderRows`는 매 프레임 `rowCellWidth`를 호출해 전곡 영역의 공통 조판 높이를 다시 계산한다.
- `updateScoreFrame`은 매 프레임 전곡 마디 DOM을 순회해 진행률·선택/반복 클래스를 쓰며 저장 구간을 다시 정렬한다.
- 음표 강조는 매 프레임 같은 SVG의 음표·onset과 beam JSON을 다시 읽는다.
- 헤더 원곡 BPM은 매 프레임 실제 박 그리드를 새 배열로 만들고, 연습 모드의 원음 BPM은 반복 XML 파싱 가능성이 있다.
- 첫 박 조정 파형은 재생 프레임마다 전체 SVG·박 버튼을 교체한다. 이 경로는 실제 필요/효과와 변경 범위를 별도로 판단한다.
- audio-core의25ms tick은 같은 cycle의 전체 클릭 목록을 다시 만든다. cycle의 고정된 예약 시각을 한 번 계산해 재사용할 수 있는지 기존 반복/배속/카운트오프 검사로 확인한다.

#### 실행 환경

- 시작 main `3aa80bfa030e3593ab0cced799b0d64a884779e1`, 두 앱0.8.14·소스 빌드15ce6955d5d1, 작업 트리 clean. `codex/runtime-performance`에서 진행한다.
- ego-browser 첫 로컬 진입은 ERR_CONNECTION_REFUSED였다. 먼저5173 서버 상태를 확인하고 같은 TaskSpace에서 이어간다. 실행 근거는 Git 제외 `.tmp/runtime-performance-20261024/`에 보존한다.
- STT·AFM은 결정적 프레임/메모리 계측에 도움이 없어 이번 경로에는 사용하지 않는다.
