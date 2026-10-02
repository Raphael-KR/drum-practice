import { bindNumericDrag } from './numeric-drag';
import { t } from './i18n';

/** Move existing controls without replacing their handlers or editing session. */
export function installScoreEditorLayout() {
  const get = (id: string) => document.getElementById(id)!;
  const pane = get('editor-score');
  const preview = get('edit-canvas').closest('section')!;
  const inspector = get('measure-label').closest('section')!;
  preview.classList.add('score-preview-panel');
  inspector.classList.add('score-inspector');
  const tools = pane.querySelector<HTMLElement>('.score-source-tools')!;
  const selectors = get('editor-page').closest('.flex')!;
  tools.prepend(selectors);
  for (const id of ['original-button', 'svg-full-button']) get(id).className = 'score-view-button';
  const inspectorTitle = inspector.querySelector('h3')!;
  inspectorTitle.classList.add('score-inspector-title');
  const meterRow = get('measure-label').closest('.flex')!;
  meterRow.classList.add('score-meter-fields');
  get('measure-beats').closest('label')!.firstChild!.textContent = t('editor.meter');
  const denominatorLabel = get('measure-denominator').closest('label')!;
  denominatorLabel.firstChild!.textContent = '/';
  get('measure-denominator').setAttribute('aria-label', t('editor.denominator'));
  const apply = get('apply-measure');
  apply.parentElement!.after(apply);
  const details = document.createElement('details');
  details.className = 'score-beat-details';
  const summary = document.createElement('summary');
  summary.textContent = t('editor.beatDetails');
  const positions = get('beat-xs').closest('label')!;
  const note = positions.nextElementSibling!;
  details.append(summary, positions, note);
  const listening = get('preview-measure').closest('.flex')!;
  listening.classList.add('score-listening-tools');
  listening.after(details);
  const structural = get('duplicate').closest('.flex')!;
  structural.classList.add('score-structure-tools');
  structural.after(get('remove-measure'));
  get('add-region').closest('.flex')!.classList.add('score-region-tools');
  bindNumericDrag(get('measure-beats') as HTMLInputElement, { wheel: true });
  bindNumericDrag(get('measure-denominator') as HTMLInputElement, { wheel: true, allowedValues: [2, 4, 8, 16] });
}
