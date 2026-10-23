# 명시된 크레센도 끝점의 박 위치

문서 역할: **완료된 개발 실행 기록**. 제작 최종 SVG/앱 수록 상태와 구분한다.

- 목표: 붉은 노을112마디2박→113마디2.5박의 크레센도 끝점이 실제2.5박 음표까지 도달하도록 공통 native 조판을 수정한다.
- 범위: 두 앱의 공통 wedge 끝점 계산·파생 캐시·실제 악보 집중 회귀와 출력 규칙/기록. 사용자 원본과 제작자가 수정한3파일을 보존한다.
- 완료 조건: 인쇄와 한 줄·두 줄·균등 조판에서 `Timestamp + EndOffsetFraction`의 끝점과 해당 음표 앵커가 일치하고110–111의 마디끝·타곡 wedge·음표/박 시각은 보존된다.
- 제외: 정본 XML의 시각 왜곡, 진단v2 입력 수록, 완성 SVG 좌표 편집, 저장본/공개 패키지 교체, 버전 인상·커밋·push·발행.
- 검증: 기존 실제 교정 XML의 native c/m/b/g/S 및 최종 선/음표 좌표 전후 대조, Safari 출력·보기/인쇄 회귀, 필요한 집중 검사와 전체 lint·타입·테스트·두 앱 빌드. 새 합성 악보/시험 DB를 만들지 않는다.

## 실행 결과

- 제작 채팅의 사용자 메시지 `01a169e0-9068-7ac3-8f89-58d53bf1bc42`의 수정 요청과 `01a169e5-0787-7213-b641-572160475c6e`의110–111 비교 요청을 직접 확인했다. 이번 작업은 공통 renderer 개발이며 제작 XML을 다시 교정하지 않았다.
- OSMD2.2.1의 공식 태그 소스와 실제 runtime을 대조했다. end absolute time `c`와 직전 음가 `m`에서 `b=c+m+EndOffsetFraction`을 구하고, g→S 사이를 factor1.75로 나누는 native padding 계산이112–113 끝점을 당겼다.110–111의 offset1whole은 마디끝 분기로 가므로 같은 오차가 드러나지 않았다.
- 공통 native 끝점/앵커 모듈을 설치하고 재생 wedge도 같은 앵커를 재사용했다. 음표가 없는 중간 시각은 실제 인접 좌표 사이를 보간한다. 마디끝·soft accent·verbal dynamic·전역 factor1.75/margin0.6을 보존했다. SVG 후처리·정본 시각 변경은 하지 않는다.
- 인쇄1124.630059447→1163.293322016,2.5박 머리 오른쪽1162.964379226으로 차이0.328943px. 한 줄/두 줄은163.606760/163.615880, 균등은181.009120/181.018240으로 차이0.009120px다. 최종4회 fresh 조판의 실제 SVG path에서 확인했고 Safari 네 보기의 시각 검수도 마쳤다.
- 실제4곡의 fresh 전후 비교에서 pass별 붉은 노을1,317·갑자기886·바람과 언덕의 발라드2,058·Loveholic1,325개 음표/빔 노드의 잉크가 동일했다. wedge 수·음악 시각도 그대로다. 기존 마디 내부 보간 오류가 같은 갑자기 인쇄1곳과Loveholic119마디의 끝점은 동일 규칙으로 달라진다. 타곡 끝점을 무조건 그대로 두는 대신 명시된 실제 시각에 맞추는 공통 수정 범위이며 음표/시각을 보존했다.
- 실제 Safari 좌표만 로컬 회귀 입력으로 보존하고 집중7검사 통과. 최종 전체128파일762검사·lint·서식432파일·타입/문서/구조·두 앱 빌드/경계 통과. 정책v36, 빌드 `9240c536bcb7`, 두 앱0.8.13 유지다.
- 승인 입력27cd2812…와 여섯 public 패키지의 바이트/해시를 보존했다. 기존 미커밋 제작 코드와 기록도 보존했다. 수록 패키지·사용자 저장본 교체, 청취/iPad·공개 시험, 커밋·push·발행은 하지 않았다. 제작자의 최종 SVG 재생성/사용자 확인과 앱 수록 적용은 별도 상태다.
- 근거는 Git 제외 `.tmp/wedge-endpoint-20261024/`: `before.json`, `after.json`, `final-native-svg.json`, `other-regressions.json`, `focused.log`, `verify.log`, Safari 두 캡처와 `diagnostic-notes.txt`. 진단 도구 실패·재시도·캐시 hit의0회 캡처는 최종 통과와 구분해 기록했다.
- 공식 코드 근거: [OSMD2.2.1 MusicSheetCalculator](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/blob/2.2.1/src/MusicalScore/Graphical/MusicSheetCalculator.ts#L1535), [ExpressionReader](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/blob/2.2.1/src/MusicalScore/ScoreIO/MusicSymbolModules/ExpressionReader.ts#L838).

## 최종 제작 인계 접수

기존 제작자가 같은27cd2812… XML로 최종4쪽SVG를 재생성하고 PDF/해당 음표와 재검수했다. 개발에서도 최종 MusicXML·3쪽SVG·검수crop·원본PDF crop·renderer 소스3파일의 해시를 직접 대조하고 두 crop을 확인했다. `data/production/red-sunset-crescendo-20261024-final/verification.json`은 현재 조판 코드와 동일하며 실제 종료점 차이0.328967 SVG단위다. 최종3쪽 SHA256 `ce09e9cb083e8872db5e6485da495c3a9f54403b92da6f5c9713a2c87e0019bc`. 앞의 제작 재생성 대기는 이 접수로 해소했다. 앱 수록 패키지/저장본 교체와 공개 발행은 수행하지 않았다.
