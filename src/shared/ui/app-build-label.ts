export function formatAppBuildLabel(version: string, source: string) {
  return `v${version} · build ${source.slice(0, 8)}`;
}

/** Selectable build metadata, separate from the changing song title. */
export function showAppBuildLabel(
  root: HTMLElement,
  version: string,
  source: string,
) {
  const title = root.querySelector<HTMLElement>("header h1");
  if (!title) return;
  title.dataset.appBuild = formatAppBuildLabel(version, source);
  const label =
    title.querySelector<HTMLElement>(".app-build-label") ??
    document.createElement("span");
  label.className = "app-build-label";
  const versionText = `v${version}`;
  const sourceLabel = document.createElement("span");
  sourceLabel.className = "app-build-source";
  sourceLabel.textContent = title.dataset.appBuild.slice(versionText.length);
  label.replaceChildren(versionText, sourceLabel);
  label.oncontextmenu = () => {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(label);
    selection.removeAllRanges();
    selection.addRange(range);
    // Leave the browser's native context menu and Copy action available.
  };
  if (!label.parentElement) title.append(label);
}
