import {readFile,writeFile} from 'node:fs/promises';
const c=JSON.parse(await readFile('src/ui-catalog.json','utf8'));
const ko=JSON.parse(await readFile('src/locales/ko.json','utf8'));
const body=`# UI 컴포넌트 기준\n\n정본: src/ui-catalog.json. 이 문서는 npm run ui:docs로 생성한다. 수동으로 표를 수정하지 않는다.\n\n한국어가 기본이다. 영어 이름과 공통 상태 문구는 준비했지만 전체 앱 번역은 완료되지 않았으므로 언어 선택기는 아직 제공하지 않는다. 안정적인 ID를 코드·QA·협업에 사용한다.\n\n재생바는 재생1바와 재생2바를 함께 감싸는 영역이다. 하위 바는 일반 group이며 toolbar 전용 방향키 동작을 암시하지 않는다. 버튼은 Tab과 Enter/Space, 대화상자는 Escape와 브라우저 기본 모달 포커스를 사용한다. 동적 재생·전체화면 상태는 상태 소유 코드에서 공통 문구를 호출한다.\n\n| ID | 협업 이름 | 접근성 이름 | English | 상위 ID |\n|---|---|---|---|---|\n`+c.components.map(x=>`| ${x.id} | ${ko[x.name.ko]} | ${ko[x.accessible.ko]} | ${x.name.en} | ${x.parent||'—'} |`).join('\n')+'\n';
if(process.argv.includes('--check')) {if(await readFile('docs/UI-COMPONENTS.md','utf8')!==body) throw Error('UI documentation is stale');}
else await writeFile('docs/UI-COMPONENTS.md',body);
