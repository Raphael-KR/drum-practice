# 붉은 노을 크레센도 교정본의 앱 수록

문서 역할: **로컬 앱 수록·검증 기록**. 개인 저장곡 교체와 공개 발행은 포함하지 않는다.

- 목표: 승인된112–113마디 교정본과 공통v36 조판을 실제 앱 수록 패키지에 반영한다.
- 범위: `public/scores/red-sunset.drumscore`와 필요한 실제 패키지 회귀·문서. 기존 공통 조판·패키지·배포 캐시 생략 API를 사용하고 기존 미커밋 작업과 원본을 보존한다.
- 완료 조건: source/canonical이 최종27cd2812… XML과 같고 인쇄4쪽·137마디·112/2박→113/2.5박 crescendo를 공통 재읽기와 로컬 화면에서 확인한다. 음원·대체 PDF·가사·안정ID·시간표·마커·반복·설정을 유지한다.
- 제외: 개인 저장곡의 자동 교체·새 음원 분석/청취·합성 악보·새 시험DB·앱 버전 인상·커밋·push·발행. 현재 사용자 라이브러리는 읽기만 한다.
- 검증: 이전 파일/원본 보존 → common API 후보 생성·왕복 → 중복 캐시 생략/독립ZIP·XML 대조 → 새 수록본 공통 로딩·네 조판/실제 화면 → 관련 집중/전체 검사·두 앱 빌드와 산출물 해시 대조.

## 입력·수록 결과

- 최종 입력은 `data/production/red-sunset-crescendo-20261024-final/score.musicxml`이며 source/canonical SHA256은 `27cd2812c64eaa455399a7e8400e5feb4d26ffe06cdd6b5e233eb64bbebd1a68`다. 진단v2를 사용하지 않았다. 제작자의 최종 verification.json이 현재 공통 renderer 소스와 일치하는지 확인했다.
- `readScorePackage` → 공통 `renderMusicXML`/`replaceWithMusicXML` → `createVerifiedPackage`/`verifyPackage`로 교체·왕복했다. 기존 `compact-score-packages.mjs`로 재생성 가능한 버전1 timeline metadata만 생략했다. 전용 패키지 형식·SVG 좌표 보정·곡별 renderer는 추가하지 않았다.
- 새 수록본은13,559,217bytes, SHA256 `cf57783b65f512ccd67506481971044495952bdc088a41e986b544773496af14`다. 기존13,557,768bytes/SHA256 `1e59302e2e439eb8bd69a8dff0c92d61ede25d201d8648894304b0584a85b670`는 실행 근거의 before 폴더에 보존한다. 생략 전57,178,233bytes 후보도 남긴다.
- 137마디/4쪽, 곡ID `yb-red-sunset-20f9b136`, BPM134·첫 박11.27을 유지했다. Song의 표시 기하 외 전체 데이터와 원음원·대체PDF/4페이지를 이전 패키지와 독립 ZIP 대조했다. 112/113 wedge direction 외 XML도 같으며 음표·가사·마디/박 시각·마커·반복·설정은 변하지 않았다.
- 생략 전후 인쇄4쪽의 잉크/글꼴은 같다. 수록된3쪽은 최종 제작SVG SHA256 `ce09e9cb083e8872db5e6485da495c3a9f54403b92da6f5c9713a2c87e0019bc`와 자동 생성ID만 제외하고 트리·좌표·잉크가 같다. 실제 끝점의 음표머리 차이와 원인·다른 곡 회귀는 [공통 renderer 기록](wedge-endpoint-20261024.md)을 따른다.

## 로컬 실제 실행 검증

- Safari의 `http://127.0.0.1:5173/player.html`에서 실제 `/scores/red-sunset.drumscore`를 다시 받아 SHA256을 확인했다. 공통 패키지 재읽기·재저장·재읽기로 모든 자산을 대조하고 `prepareBrowserScore`로 ribbon/rows/grid 각각137마디를 재생성했다.
- 공통 `mountPlaybackRuntime`에 실제 준비된 패키지를 열어 ready와 음원 디코딩을 확인했다. 저장 콜백 없이 일시 미리보기만 사용했다. 실제1줄/2줄 버튼을 조작해112마디2박→113마디2.5박 크레센도를 화면에서 대조했다. 루프백 수송기는 패키지와 감사 JSON만 수신하며 개발·미리보기 서버는 기존5173을 사용했다.
- 실제 IndexedDB의 해당 곡을 readonly transaction으로 전후 비교해 사용자 저장본의 XML·Song·설정 지문이 같음을 확인했다. 새 DB/사용자 레코드를 만들지 않았다. 기존 저장곡의 source SHA256은 계속 `992ad594b496a0932957271e10273afb98aa184f9207c328cf52ab36606bf382`다. **이미 저장된 개인 곡을 열 때 새 수록 파일로 자동 대체하지 않는다.**
- 파일 반영/HMR 뒤 첫 Safari 평가가 browsing context unload 오류로 끊겨 같은 탭을 다시 선택하고 재실행했다. 최종 재읽기·화면 확인은 통과했으며 실패를 제품 오류나 저장 성공으로 해석하지 않았다. 검수 후 미리보기 runtime을 dispose하고 원래 앱 화면으로 복구했다.
- 실제 재생 청취·배속/반복/카운트오프의 추가 GUI 검사·iPad·공개 사이트 검사는 수행하지 않았다. 앱 저장 스키마·버전·공개 사이트는 변경하지 않았다.

## 검사와 근거

- 실제 public 패키지의 source/canonical 해시·112/113 방향/offset·137마디·곡ID/BPM/첫 박을 확인하는 `tests/local-media/red-sunset-bundle.test.ts`를 추가했다. 공통 캐시 생략·recording grid·wedge endpoint와 함께 집중4파일11검사가 통과했다.
- 최종 `npm run verify`129파일763검사·lint·서식433파일·타입·구조·문서·두 앱 빌드/경계 통과. 기존 Node localStorage 실험 경고와 Vite500kB 청크 경고는 남지만 검사 실패는 없다. 앱0.8.13·소스 빌드 `9240c536bcb7`를 유지한다.
- `dist/player/scores/red-sunset.drumscore`의 SHA256은 새 public 파일과 같다. 다른 수록5곡은 이전 릴리스와 바이트가 같다. 최초 대조에서 editor에도 파일이 있을 것으로 가정해 FileNotFound가 났으나, 실제 Vite 설정은 publicDir=false이며 player 빌드만 수록 패키지를 복사한다. 설정을 바꾸지 않고 해당 계약으로 최종 대조했다.
- Git 제외 실행 근거는 `.tmp/red-sunset-crescendo-bundle-20261024/`에 보존한다. `on-disk-checks.json`, `print-page-match.json`, `runtime-check.json`, `compact.jsonl`, 실제 두 화면·이전/전체/압축 후보·집중/전체 로그가 포함된다. 원본과 기존 미커밋 renderer/제작 변경을 보존했다.
