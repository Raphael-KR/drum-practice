/** Keep build metadata attached when the song title changes. */
export function showAppBuildLabel(
  root: HTMLElement,
  version: string,
  source: string,
) {
  const title = root.querySelector<HTMLElement>("header h1");
  if (title) title.dataset.appBuild = `v${version} · build ${source.slice(0, 8)}`;
}
