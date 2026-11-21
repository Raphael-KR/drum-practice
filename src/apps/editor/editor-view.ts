import { t as i18nText } from "../../shared/i18n/i18n";
import { dialogHeader } from "../../shared/ui/dialog-ui";
import { iconButtonHTML } from "../../shared/ui/icon-button";
import { icon } from "../../shared/ui/icon-svg";

import { scoreStageHTML } from "../../modules/playback/playback-ui";

export function editorHTML() {
  return (
    '\n<header class="library-header"><div class="brand"></div><div class="library-header-actions"><div class="library-import editor-home-action"><button id="welcome-new" class="primary library-primary-action">' +
    i18nText("editorHome.new") +
    '</button></div><a class="editor-player-link library-app-link library-editor" href="/player.html">' +
    i18nText("editorHome.playerLink") +
    '</a><div class="actions library-common-actions">' +
    iconButtonHTML(
      "library-button",
      icon("library"),
      i18nText("icons.message054"),
    ) +
    '</div></div></header>\n<main class="library-main"><section class="welcome editor-home" id="welcome"><div id="editor-home-list" class="library-sections" aria-live="polite"></div><button id="welcome-library" hidden></button></section>\n<div id="busy" role="status" aria-live="polite"></div>\n<section id="practice" hidden><div class="statusline"><div class="flex"><button id="original-button">' +
    i18nText("main.message112") +
    '</button></div></div>\n<div id="review-tools" hidden><span id="review-message">' +
    i18nText("main.message113") +
    '</span><button id="review-copy">' +
    i18nText("main.message114") +
    '</button><button id="review-save" hidden>' +
    i18nText("main.message115") +
    "</button></div>" +
    scoreStageHTML(
      '<canvas id="review-canvas" hidden aria-label="' +
        i18nText("main.message116") +
        '"></canvas>',
    ) +
    '</section></main>\n<dialog id="new-dialog">' +
    dialogHeader(i18nText("main.message154"), "", "new-dialog", "") +
    "<p>" +
    i18nText("main.message155") +
    '</p><form id="new-form"><p><label>' +
    i18nText("main.message156") +
    '<input id="new-artist" type="text"></label><label>' +
    i18nText("main.message157") +
    ('<input id="new-title" required type="text" value="' +
      i18nText("song.newTitle") +
      '"></label></p><p><label>') +
    i18nText("main.message158") +
    '<input id="pdf-file" required type="file" accept="application/pdf,.pdf,.musicxml,.xml,.mxl"></label></p><p id="xml-part-row" hidden><label>' +
    i18nText("main.message159") +
    '<select id="xml-part"></select></label><span class="subtle">' +
    i18nText("main.message160") +
    "</span></p><p><label>" +
    i18nText("main.message161") +
    '<input id="audio-file" required type="file" accept="audio/*,.mp3"></label></p><p><label>BPM <input id="new-bpm" type="number" min="20" max="300" value="94" required></label><label>' +
    i18nText("main.message162") +
    '<input id="new-first" type="number" min="0" step="0.001" value="0" required></label><label>' +
    i18nText("main.message163") +
    '<input id="new-beats" type="number" min="1" max="16" value="4" required></label><label>' +
    i18nText("main.message164") +
    '<select id="new-denominator"><option>4</option><option>8</option><option>2</option><option>16</option></select></label></p><p><label>' +
    i18nText("main.message165") +
    ('</label><textarea id="new-lyrics" placeholder="' +
      i18nText("lyrics.uploadExample") +
      '"></textarea></p><p class="subtle">') +
    i18nText("main.message166") +
    '</p><button type="submit" class="primary">' +
    i18nText("main.message167") +
    '</button></form></dialog><section id="editor-dialog" class="editor-workbench" hidden><div class="editor-body"><div class="editor-content"><section id="editor-lyrics" tabindex="0" aria-label="' +
    i18nText("main.message279") +
    '"><div id="lyric-summary" role="status"></div><div id="lyric-editor" class="lyric-cards"></div></section><section id="editor-meta"><div class="metadata-fields">' +
    (
      [
        ["edit-title", "main.message169"],
        ["edit-original-title", "main.message170"],
        ["edit-artist", "main.message156"],
        ["edit-lyricist", "main.message171"],
        ["edit-composer", "main.message172"],
      ] as const
    )
      .map(
        ([id, key]) =>
          `<label>${i18nText(key)}<input id="${id}" type="text"></label>`,
      )
      .join("") +
    '</div><div class="metadata-timing"><div class="timing-fields"><label>BPM <input id="edit-bpm" type="number" min="20" max="300"></label><label>' +
    i18nText("main.message162") +
    '<input id="edit-first" data-numeric-drag="off" type="number" min="0" step="0.001"></label></div><div class="timing-actions"><button id="reflow">' +
    i18nText("main.message173") +
    '</button><button id="estimate-tempo">' +
    i18nText("main.message174") +
    '</button><button id="tap-tempo">' +
    i18nText("main.message175") +
    '</button><span id="tap-result"></span></div></div></section></div><section id="editor-sections" class="section-editor"></section></div><section id="project-work" aria-live="polite"></section></section><dialog id="original-dialog">' +
    dialogHeader(i18nText("main.message206"), "", "original-dialog", "") +
    '<div id="page-original"></div></dialog><div id="error-notice" class="error-notice" hidden><strong>' +
    i18nText("main.message207") +
    '</strong><span id="error-message" role="alert"></span>' +
    iconButtonHTML(
      "error-notice-close",
      icon("close"),
      i18nText("editor-session.message042"),
    ) +
    "</div>"
  );
}
