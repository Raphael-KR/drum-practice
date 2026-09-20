// @vitest-environment jsdom
import { expect,it } from 'vitest';
import { licenseSection } from '../src/licenses';
import notices from '../src/third-party.generated.json';
it('shows installed versions and full offline notices, never treating notices as HTML',()=>{
  const section=licenseSection();
  for(const name of ['soundtouchjs','opensheetmusicdisplay','pdfjs-dist','jszip','vexflow']){
    const entry=notices.entries.find(e=>e.name===name)!;
    expect(entry.text.length).toBeGreaterThan(200);
    expect(section.textContent).toContain(`${name} ${entry.version}`);
  }
  expect(section.querySelectorAll('pre')).toHaveLength(notices.entries.length);
  expect(section.querySelector('script')).toBeNull();
  expect(notices.soundtouchSource).toContain('SoundTouch');
});
