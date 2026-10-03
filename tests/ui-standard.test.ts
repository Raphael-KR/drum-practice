// @vitest-environment jsdom
import {describe,it,expect} from 'vitest';
import catalog from '../src/ui-catalog.json';
import {installUIStandard,uiText,componentName} from '../src/ui-standard';
describe('shared UI standard',()=>{
 it('has unique stable IDs, translated names and valid parent links',()=>{
  const ids=catalog.components.map(x=>x.id);
  expect(new Set(ids).size).toBe(ids.length);
  for(const x of catalog.components){expect(x.name.ko).toBeTruthy();expect(x.name.en).toBeTruthy();if(x.parent)expect(ids).toContain(x.parent);}
  expect(uiText('pause','en')).toBe('Pause');
  expect(componentName('playback.primary')).toBe('재생1바');
  expect(componentName('playback.primary','ko',true)).toBe('재생 및 위치 조절');
 });
 for(const surface of ['web','portable'] as const) it(`groups existing controls without replacing their handlers (${surface})`,()=>{
  document.body.innerHTML=`<main id="app"><div id="stage"></div><div class="transport"><button id="home">Home</button></div><section id="repeat-controls" class="repeat-controls"></section><dialog id="settings-dialog"><h2>설정</h2></dialog></main>`;
  const root=document.getElementById('app')!;
  let clicks=0;document.getElementById('home')!.onclick=()=>clicks++;
  installUIStandard(surface,root);installUIStandard(surface,root);
  expect(root.querySelectorAll('.playback-group')).toHaveLength(1);
  expect(root.querySelector('.playback-group')!.children).toHaveLength(2);
  document.getElementById('home')!.click();expect(clicks).toBe(1);
  expect(document.getElementById('home')!.getAttribute('aria-label')).toBe('처음으로');
  expect(document.getElementById('stage')!.getAttribute('aria-describedby')).toBeNull();
  expect(root.querySelector('dialog')!.getAttribute('aria-labelledby')).toBe('settings-dialog-title');
 });
});

it("keeps the web footer after the playback group", () => {
  document.body.innerHTML = '<div id="app"><section id="practice"><div id="stage"></div><div class="transport"></div><section id="repeat-controls"></section><p id="footer">Help</p></section></div>';
  const root = document.getElementById("app")!;
  installUIStandard("web", root);
  expect(root.querySelector(".playback-group")!.nextElementSibling?.id).toBe("footer");
});
