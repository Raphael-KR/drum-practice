/** Landscape numeric controls stay focusable for physical keyboard arrows. */
export function installLandscapeKeyboardGuard(doc: Document = document) {
  const win = doc.defaultView!;
  const media = win.matchMedia('(orientation: landscape)');
  const landscape = () => win.screen.orientation?.type
    ? win.screen.orientation.type.startsWith('landscape') : media.matches;
  const originals = new Map<HTMLInputElement, {readOnly:boolean; inputMode:string}>();
  const syncNumbers = () => {
    const locked = landscape();
    doc.querySelectorAll<HTMLInputElement>('input[data-numeric-drag-bound]').forEach(input => {
      if (!originals.has(input)) originals.set(input, {readOnly:input.readOnly, inputMode:input.inputMode});
      const original = originals.get(input)!;
      input.toggleAttribute('data-gesture-only', locked && !original.readOnly);
      input.readOnly = locked || original.readOnly;
      input.inputMode = locked ? 'none' : original.inputMode;
    });
    for (const input of originals.keys()) if (!input.isConnected) originals.delete(input);
  };
  const observer = new MutationObserver(syncNumbers);
  observer.observe(doc.documentElement, {childList:true, subtree:true, attributes:true, attributeFilter:["data-numeric-drag-bound"]});
  syncNumbers();
  const rotate = syncNumbers;
  media.addEventListener('change', rotate);
  win.screen.orientation?.addEventListener('change', rotate);
  return () => {
    observer.disconnect();
    for (const [input, original] of originals) {
      input.removeAttribute("data-gesture-only");
      input.readOnly = original.readOnly;
      input.inputMode = original.inputMode;
    }
    media.removeEventListener('change', rotate);
    win.screen.orientation?.removeEventListener('change', rotate);
  };
}
