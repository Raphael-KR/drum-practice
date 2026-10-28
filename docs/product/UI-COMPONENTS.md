# UI 컴포넌트 기준

정본: src/shared/ui/ui-catalog.json. 이 문서는 pnpm run ui:docs로 생성한다. 수동으로 표를 수정하지 않는다.

한국어가 기본이다. 영어 이름과 공통 상태 문구는 준비했지만 전체 앱 번역은 완료되지 않았으므로 언어 선택기는 아직 제공하지 않는다. 안정적인 ID를 코드·QA·협업에 사용한다.

재생 조작 영역은 재생바와 구간 조작판으로 구성한다. 재생바에는 마커·곡 위치, 재생 조작, 주변 마디 반복을 두고, 구간 조작판에는 섹션 바로가기와 반복 구간을 둔다. 도움말에서는 공통 명칭을 각 영역의 테두리 위에 표시하고, 버튼을 선택하면 영역 이름을 숨겨 버튼 이름과 설명 하나를 표시한다. 빈 곳을 선택하면 영역 이름으로 돌아간다. 하위 영역은 일반 group이며 toolbar 전용 방향키 동작을 암시하지 않는다. 버튼은 Tab과 Enter/Space, 대화상자는 Escape와 브라우저 기본 모달 포커스를 사용한다. 동적 재생·전체화면 상태는 상태 소유 코드에서 공통 문구를 호출한다.

| ID | 협업 이름 | 접근성 이름 | English | 상위 ID |
|---|---|---|---|---|
| header | 상단바 | 상단바 | Header | — |
| score | 악보 영역 | 악보 영역 | Score | — |
| playback | 재생바 | 재생바 | Playback controls | — |
| playback.primary | 재생바 | 재생 및 위치 조절 | Playback and position | playback |
| playback.secondary | 구간 조작판 | 구간 반복 및 마커 | Loop and markers | playback |
| footer | 하단 안내 | 하단 안내 | Help and status | — |
| settings | 설정 | 설정 | Settings | header |
| library | 내 악보 목록 | 내 악보 목록 | Score library | header |
| tempo | 연습 BPM | 연습 BPM | Practice BPM | header |
| metronome | 메트로놈 | 메트로놈 | Metronome | header |
| metronomeChoices | 메트로놈 | 메트로놈 | Metronome | settings.playback |
| fullscreen | 전체화면 | 전체화면 | Fullscreen | header |
| reload | 새로고침 | 새로고침 | Reload | header |
| home | 처음으로 | 처음으로 | Go to beginning | playback.actions |
| play | 재생 | 재생 | Play | playback.actions |
| rewind | 선택한 마디 수만큼 되감기 | 선택한 마디 수만큼 되감기 | Rewind selected measures | playback.actions |
| rewindCount | 되감을 마디 수 | 되감을 마디 수 | Measures to rewind | playback.actions |
| position | 현재 마디와 위치 복사 | 현재 마디와 위치 복사 | Copy current measure and position | playback.primary |
| progress | 현재 마디 | 현재 마디 | Song progress | playback.navigation |
| mark | 현재 마디 마킹 | 현재 마디 마킹 | Mark current measure | playback.primary |
| sound | 소리 | 소리 | Sound | playback.primary |
| loop | 구간 반복 | 반복 켜기·끄기 | Adjust loop | playback.repeat |
| loopOff | 반복 해제 | 반복 해제 | Turn loop off | playback.secondary |
| markers | 마커 버튼 5개 | 마커 버튼 5개 | Five marker slots | playback.navigation |
| view | 악보 스타일 | 악보 스타일 | Score layout | settings |
| zoom | 악보 크기 | 악보 크기 | Score size | settings |
| loopStart | 시작 마디 | 시작 마디 | Loop start measure | loop |
| loopEnd | 끝 마디 | 끝 마디 | Loop end measure | loop |
| loopStartBeat | 시작 박 | 시작 박 | Loop start beat | loop |
| loopEndBeat | 끝 경계 박 | 끝 경계 박 | Loop end boundary beat | loop |
| musicVolume | 음원 음량 | 음원 음량 | Music volume | sound |
| clickVolume | 메트로놈 음량 | 메트로놈 음량 | Metronome volume | sound |
| tempoValue | 연습 BPM | 연습 BPM | Practice BPM | tempo |
| close | 닫기 | 닫기 | Close | — |
| pdf | 악보를 PDF로 보기 | 악보를 PDF로 보기 | Use PDF score | settings |
| highlight | 음표 따라가기 | 음표 따라가기 | Follow notes | settings |
| autoFullscreen | 전체화면으로 악보 보기 | 전체화면으로 악보 보기 | Open scores fullscreen | settings |
| restart | 마디 처음부터 다시 재생 | 마디 처음부터 다시 재생 | Resume from measure start | settings |
| countoff | 카운트오프 (Count-off) | 카운트오프 (Count-off) | Count-off | settings |
| settings.screen | 화면 | 화면 | Display | settings |
| settings.playback | 재생 | 재생 | Playback | settings |
| settings.score | 악보 | 악보 | Score management | settings |
| settings.audio | 백업 | 사용자 설정 백업·복원 | Audio | settings |
| settings.info | 정보 | 정보 | About | settings |
| manage.edit | 편집 | 편집 | Edit | settings.score |
| manage.files | 파일 | 파일 | Files | settings.score |
| file.xml | MusicXML | MusicXML | MusicXML | manage.files |
| file.pdf | 원본 PDF 악보 | 원본 PDF 악보 | Original PDF score | manage.files |
| file.lyrics | 가사 업로드 | 가사 업로드 | Upload lyrics | manage.files |
| file.audio | 원본 음원 | 원본 음원 | Original audio | manage.files |
| file.export | 내보내기 | 내보내기 | Export | manage.files |
| export.selected | 선택한 파일 내보내기 | 선택한 파일 내보내기 | Export selected files | file.export |
| lyrics.all | 전체 가사 보기 | 전체 가사 보기 | All lyrics | settings.score |
| score.pdf | PDF 전체 악보 보기 | PDF 전체 악보 보기 | Full PDF score | settings.score |
| playback.navigation | 마커·곡 위치 | 마커·곡 위치 | Markers and position | playback.primary |
| playback.actions | 재생 조작 | 재생 조작 | Playback actions | playback.primary |
| playback.repeat | 주변 마디 반복 | 주변 마디 반복 | Nearby measure repeat | playback.primary |
| sections | 섹션 바로가기 | 섹션 바로가기 | Section shortcuts | playback.secondary |
| ranges | 반복 구간 | 반복 구간 | Saved loops | playback.secondary |
| library.list | 악보·음원 목록 | 악보·음원 목록 | Score and audio library | — |
| markerSlot | 마커 | 마커 | Marker | playback.navigation |
| repeatPreset | 주변 마디 반복 | 주변 마디 반복 | Nearby measure repeat | playback.repeat |
| sectionShortcut | 섹션 바로가기 | 섹션 바로가기 | Section shortcut | sections |
| loopSlot | 반복 구간 | 반복 구간 | Saved loop | ranges |
