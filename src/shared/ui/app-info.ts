import { formatDate, t } from "../i18n/i18n";
import { formatAppBuildLabel } from "./app-build-label";
import { escapeHTML } from "./html";
import { licenseSection } from "./licenses";

type BuildInfo = { source: string; builtAt: string };

export function appInfoHTML(
  version: string,
  build: BuildInfo,
  { scoreInfo = false }: { scoreInfo?: boolean } = {},
) {
  return `<section class="settings-group app-info">${scoreInfo ? '<p id="recording-tempo-info" class="subtle" hidden></p>' : ""}<dl><dt>${t("playback.message456")}</dt><dd id="app-version">${escapeHTML(formatAppBuildLabel(version, build.source))}</dd><dt>${t("playback.message457")}</dt><dd id="app-built-at">${escapeHTML(formatDate(new Date(build.builtAt), { timeZone: "Asia/Seoul", year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }))} KST</dd></dl></section>`;
}

/** App metadata and offline licenses, shared by library and score settings. */
export function appInfoContent(
  version: string,
  build: BuildInfo,
  options: { scoreInfo?: boolean } = {},
) {
  const template = document.createElement("template");
  template.innerHTML = appInfoHTML(version, build, options);
  template.content.append(licenseSection());
  return template.content;
}
