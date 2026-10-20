import { escapeHTML as escape } from './html';
export function settingsSwitch(
  id: string,
  title: string,
  description: string,
  checked = false,
  options: { rowId?: string; descriptionId?: string; disabled?: boolean } = {},
) {
  const descId = options.descriptionId ?? `${id}-description`;
  return `<label title="${escape(title)}" class="settings-switch" ${options.rowId ? `id="${escape(options.rowId)}"` : ""}><span><strong>${escape(title)}</strong><small id="${escape(descId)}">${escape(description)}</small></span><input id="${escape(id)}" type="checkbox" role="switch" aria-describedby="${escape(descId)}" ${checked ? "checked" : ""} ${options.disabled ? "disabled" : ""}></label>`;
}
