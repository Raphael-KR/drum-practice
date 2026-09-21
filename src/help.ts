import { t as i18nText } from './i18n';

/** Shared entry point; contextual help pages will replace the placeholder. */
export function installHelp(root: HTMLElement) {
  if (document.getElementById('app-help-button')) return;
  const style = document.createElement('style');
  style.textContent = `
    #app-help-button{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:20;width:44px;height:44px;border-radius:50%;border:1px solid #c7d4e8;background:#fff;color:#304563;font:600 22px -apple-system,sans-serif;box-shadow:0 2px 8px #24304418;cursor:pointer}
    #app-help-button:focus-visible{outline:3px solid #2563eb;outline-offset:3px}
    #app-help-dialog{width:min(360px,calc(100vw - 48px));padding:24px;border:1px solid #d5dfed;border-radius:20px;background:#f7f9fd;color:#243044}
    #app-help-dialog::backdrop{background:#15243c66}
    #app-help-dialog .help-head{display:flex;align-items:center;justify-content:space-between;gap:16px}
    #app-help-dialog h2{margin:0;font-size:20px}
    #app-help-dialog button{width:44px;height:44px;border-radius:50%;border:1px solid #d5dfed;background:white;font-size:24px;color:#243044}
  `;
  const button = document.createElement('button');
  button.id = 'app-help-button';
  button.type = 'button';
  button.textContent = '?';
  button.title = button.ariaLabel = i18nText('help.title');
  button.setAttribute('aria-haspopup', 'dialog');
  const dialog = document.createElement('dialog');
  dialog.id = 'app-help-dialog';
  dialog.setAttribute('aria-labelledby', 'app-help-title');
  const head = document.createElement('div');
  head.className = 'help-head';
  const title = document.createElement('h2');
  title.id = 'app-help-title';
  title.textContent = i18nText('help.title');
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = '×';
  close.ariaLabel = i18nText('editor-session.message042');
  close.onclick = () => dialog.close();
  const text = document.createElement('p');
  text.textContent = i18nText('help.pending');
  head.append(title, close);
  dialog.append(head, text);
  dialog.addEventListener('close', () => button.focus({preventScroll:true}));
  button.onclick = () => dialog.showModal();
  root.append(style, button, dialog);
}
