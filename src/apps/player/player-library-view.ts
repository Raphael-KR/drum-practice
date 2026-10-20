import { librarySectionHTML } from "../../modules/library/score-catalog";
import { AUDIO_FILE_ACCEPT } from "../../modules/audio/audio-practice";
import { escapeHTML } from "../../shared/ui/html";
import { icon } from "../../shared/ui/icon-svg";
import { t } from "../../shared/i18n/i18n";

const BOOKING_URL =
  "https://m.booking.naver.com/booking/6/bizes/1512990?theme=place&entry=pll&lang=ko&area=pll";

/** Library markup only. Loading, event handlers and render epochs belong to player-app. */
export function libraryHTML(showEditor: boolean): string {
  const editorLink = showEditor
    ? `<a class="library-booking library-editor" title="${escapeHTML(t("separation.openEditor"))}" href="./editor.html">${escapeHTML(t("separation.openEditor"))}</a>`
    : "";
  return `<header class="library-header">
    <h1>${escapeHTML(t("separation.appTitle"))}</h1>
    <div class="library-header-actions">
      <div class="library-import">
        <button id="import-package" class="primary" title="${escapeHTML(t("library.tipImport"))}">${escapeHTML(t("audioPractice.import"))}</button>
        <p id="library-empty-hint" class="library-empty-hint" hidden>${escapeHTML(t("separation.empty"))}</p>
      </div>
      <a title="${escapeHTML(t("library.tipBooking"))}" class="library-booking" href="${escapeHTML(BOOKING_URL)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t("library.booking"))}</a>
      ${editorLink}
      <div class="actions library-common-actions">
        <button id="library-refresh" type="button" aria-label="${escapeHTML(t("library.refresh"))}" title="${escapeHTML(t("library.refresh"))}">${icon("reload")}</button>
        <button id="library-settings" class="icon-button" type="button" title="${escapeHTML(t("icons.message059"))}" aria-label="${escapeHTML(t("icons.message059"))}">${icon("settings")}</button>
      </div>
    </div>
  </header>
  <main class="library-main" aria-label="${escapeHTML(t("library.screenName"))}">
    <input type="file" id="package-file" accept="${AUDIO_FILE_ACCEPT}" hidden>
    <p id="library-status" role="status"></p>
    <div id="practice-records" class="library-sections">
      <div id="favorite-practice-records" class="practice-records" hidden></div>
      ${librarySectionHTML("basic", "basic-practice-records", "basic-library-title")}
      ${librarySectionHTML("personal", "personal-practice-records", "personal-library-title")}
      ${librarySectionHTML("audio", "audio-practice-records", "audio-library-title", "", true)}
    </div>
  </main>`;
}
