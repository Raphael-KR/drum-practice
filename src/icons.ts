// Original SVG drawings using familiar Apple-style action metaphors.
// Embedded paths work offline and do not depend on an installed symbol font.
const paths: Record<string, string> = {
  play: '<path d="m8 4 13 8-13 8Z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M7 5h3v14H7zm7 0h3v14h-3z" fill="currentColor" stroke="none"/>',
  start: '<path d="M5 5v14m14-14L8 12l11 7Z"/>',
  rewind: '<path d="M8 3 3 8l5 5M3 8h10a7 7 0 1 1-6 11"/>',
  minus: '<path d="M5 12h14"/>', plus: '<path d="M5 12h14M12 5v14"/>',
  metronome: '<path d="m8 3-5 18h18L16 3ZM12 17l7-12M7 17h10"/>',
  repeat: '<path d="m16 3 4 4-4 4M4 11V9a2 2 0 0 1 2-2h14M8 21l-4-4 4-4m12 0v2a2 2 0 0 1-2 2H4"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4Z"/>',
  sliders: '<path d="M5 3v5m0 4v9M12 3v10m0 4v4M19 3v2m0 4v12M2 8h6v4H2zm7 5h6v4H9zm7-8h6v4h-6z"/>',
  screen: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 12h18"/>',
  pencil: '<path d="m4 16 12-12 4 4L8 20l-5 1Zm10-10 4 4"/>',
  lyrics: '<path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM7 8h10M7 12h7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.2"/>',
  folder: '<path d="M3 6h7l2 3h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm0 0V4h7l2 2h7a2 2 0 0 1 2 2v1"/>',
  library: '<path d="M3 5h10M3 10h7M3 15h7M18 17V4l4-1"/><ellipse cx="15" cy="18" rx="3" ry="2"/>',
  export: '<path d="M8 9H4v12h16V9h-4M12 15V2m-4 4 4-4 4 4"/>',
  expand: '<path d="M9 3H3v6m0-6 7 7m5 11h6v-6m0 6-7-7"/>',
  collapse: '<path d="M3 10h7V3m0 7L3 3m18 11h-7v7m0-7 7 7"/>',
};
export function icon(name: string) {
  return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name] || paths.info}</svg>`;
}
export function iconButton(id: string, name: string, label: string, caption?: string) {
  const b = document.getElementById(id)!;
  b.innerHTML = icon(name) + (caption ? `<span class="icon-caption">${caption}</span>` : '');
  b.setAttribute('aria-label', label);
  b.title = label;
  b.classList.add('icon-button');
}
export function arrangeIcons() {
  const items = [
    ['home','start','처음으로'], ['play','play','재생'], ['jump','rewind','선택한 마디 수만큼 되감기'],
    ['slower','minus','1 BPM 느리게'], ['faster','plus','1 BPM 빠르게'],
    ['library-button','library','내 곡'], ['new-button','plus','곡 추가'],
    ['save-html','export','HTML 한 파일로 저장'], ['fullscreen','expand','전체화면'],
    ['open-loop-dialog','repeat','구간 반복','반복'], ['open-marker-dialog','bookmark','마커','마커'],
    ['open-sound-dialog','sliders','소리·준비','소리'], ['open-screen-dialog','screen','화면','화면'],
    ['edit-button','pencil','악보 편집','악보'], ['lyrics-button','lyrics','가사 편집','가사'],
    ['metadata-button','info','곡 정보','정보'], ['open-backup-dialog','folder','파일·안내','파일'],
  ];
  items.forEach(([id,name,label,caption]) => iconButton(id,name,label,caption));
  const input = document.getElementById('click') as HTMLInputElement;
  const label = input.closest('label')!;
  label.classList.add('metronome-toggle');
  label.title = '메트로놈 켜기/끄기';
  input.setAttribute('aria-label', '메트로놈');
  for (const child of [...label.childNodes]) if (child !== input) child.remove();
  label.insertAdjacentHTML('beforeend', icon('metronome'));
  document.addEventListener('fullscreenchange', () => iconButton('fullscreen', document.fullscreenElement ? 'collapse' : 'expand', document.fullscreenElement ? '전체화면 종료' : '전체화면'));
}
