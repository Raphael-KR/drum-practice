import {
  practiceLoopHTML,
  practiceMarkerHTML,
} from "../../modules/playback/practice-management";
import { t as i18nText } from "../../shared/i18n/i18n";
import { dialogHeader } from "../../shared/ui/dialog-ui";

import { scoreStageHTML } from "../../modules/playback/playback-ui";

export function editorHTML() {
  return (
    '\n<header><div class="brand"></div><div class="actions"><button id="library-button">' +
    i18nText("icons.message054") +
    '</button><button id="edit-button" hidden>' +
    i18nText("main.message099") +
    '</button><a class="editor-player-link" href="/player.html">' +
    i18nText("editorHome.playerLink") +
    '</a></div></header>\n<main><section class="welcome editor-home" id="welcome"><div class="editor-home-heading library-heading"><h2>' +
    i18nText("editorHome.listTitle") +
    '</h2><button class="primary" id="welcome-new">' +
    i18nText("editorHome.new") +
    '</button></div><div id="editor-home-list" class="practice-records" aria-live="polite"></div><button id="demo-button" hidden></button><button id="welcome-library" hidden></button><p class="subtle">' +
    i18nText("main.message106") +
    '</p></section>\n<div id="busy" role="status" aria-live="polite"></div>\n<section id="practice" hidden><div class="statusline"><div class="flex"><button id="original-button">' +
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
    '\n<div class="seekrow"><span id="elapsed">0:00</span><input id="seek" aria-label="' +
    i18nText("main.message117") +
    '" type="range" min="0" max="300" step="0.01" value="0"><span id="duration">0:00</span></div>\n' +
    '<div class="panels"><section class="panel">' +
    practiceLoopHTML(true) +
    '</section><section class="panel">' +
    practiceMarkerHTML(true) +
    "<details><summary>" +
    i18nText("main.message146") +
    '</summary><p class="subtle">' +
    i18nText("main.message147") +
    '</p><label><input id="include-media" type="checkbox" checked>' +
    i18nText("main.message148") +
    '</label><div class="flex"><button id="export">' +
    i18nText("main.message149") +
    "</button><label>" +
    i18nText("main.message150") +
    '<input id="restore" type="file" accept=".zip"></label></div></details></section></div><p class="keyboard">' +
    i18nText("main.message151") +
    '</p><p class="subtle" id="alignment-note">' +
    i18nText("main.message152") +
    '</p></section></main>\n<dialog id="library-dialog">' +
    dialogHeader(
      i18nText("icons.message054"),
      "",
      "library-dialog",
      "",
      '<button id="new-button">' + i18nText("main.message153") + "</button>",
    ) +
    '<div id="library-list"></div></dialog>\n<dialog id="new-dialog">' +
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
    '</button></form></dialog>\n<dialog id="editor-dialog">' +
    dialogHeader(i18nText("main.message099"), "", "editor-dialog", "") +
    '<div class="flex"><label>' +
    i18nText("main.message156") +
    '<input id="edit-artist" type="text"></label><label>' +
    i18nText("main.message169") +
    '<input id="edit-title" type="text"></label><label>' +
    i18nText("main.message170") +
    '<input id="edit-original-title" type="text"></label><label>' +
    i18nText("main.message171") +
    '<input id="edit-lyricist" type="text"></label><label>' +
    i18nText("main.message172") +
    '<input id="edit-composer" type="text"></label><label>BPM <input id="edit-bpm" type="number" min="20" max="300"></label><label>' +
    i18nText("main.message162") +
    '<input id="edit-first" data-numeric-drag="off" type="number" min="0" step="0.001"></label><button id="reflow">' +
    i18nText("main.message173") +
    '</button><button id="estimate-tempo">' +
    i18nText("main.message174") +
    '</button><button id="tap-tempo">' +
    i18nText("main.message175") +
    '</button><span id="tap-result"></span></div><div class="editor"><section><div class="flex"><label>' +
    i18nText("main.message177") +
    '<select id="editor-page"></select></label><label>' +
    i18nText("main.message178") +
    '<select id="measure-select"></select></label></div><p class="subtle">' +
    i18nText("main.message179") +
    '</p><div class="pagebox"><canvas id="edit-canvas"></canvas></div><div class="flex"><button id="add-region">' +
    i18nText("main.message180") +
    '</button><button id="apply-crop">' +
    i18nText("main.message181") +
    "</button></div></section><section><h3>" +
    i18nText("main.message182") +
    '</h3><div class="flex"><label>' +
    i18nText("main.message183") +
    '<input id="measure-label" type="text" style="width:95px"></label><label>' +
    i18nText("main.message184") +
    '<input id="measure-beats" type="number" min="1" max="16"></label><label>' +
    i18nText("main.message164") +
    '<input id="measure-denominator" type="number" min="2" max="16" value="4"></label></div><div class="flex"><label>' +
    i18nText("main.message185") +
    '<input id="measure-start" data-numeric-drag="off" type="number" min="0" step="0.001"></label><label>' +
    i18nText("main.message186") +
    '<input id="measure-end" data-numeric-drag="off" type="number" min="0" step="0.001"></label><button id="apply-measure">' +
    i18nText("main.message187") +
    "</button></div><label>" +
    i18nText("main.message188") +
    '<input id="beat-xs" type="text" placeholder="0,0.25,0.5,0.75,1" style="width:100%"></label><p class="subtle">' +
    i18nText("main.message189") +
    '</p><div class="flex"><button id="preview-measure">' +
    i18nText("main.message190") +
    '</button><button id="anchor-now">' +
    i18nText("main.message191") +
    '</button><button id="editor-play">' +
    i18nText("main.message192") +
    '</button><span id="editor-time"></span></div><div class="flex"><button id="duplicate">' +
    i18nText("main.message193") +
    '</button><button id="split">' +
    i18nText("main.message194") +
    '</button><button id="merge">' +
    i18nText("main.message195") +
    '</button><button id="move-left">' +
    i18nText("main.message119") +
    '</button><button id="move-right">' +
    i18nText("main.message196") +
    '</button><button id="remove-measure" class="danger">' +
    i18nText("main.message197") +
    "</button></div><h3>" +
    i18nText("canonical-xml.message014") +
    '</h3><p class="subtle">' +
    i18nText("main.message198") +
    '</p><div class="flex"><button id="add-lyric">' +
    i18nText("main.message199") +
    '</button><button id="show-near">' +
    i18nText("main.message200") +
    '</button><button id="show-all">' +
    i18nText("main.message201") +
    '</button></div><div class="scroll"><table><thead><tr><th>' +
    i18nText("main.message202") +
    "</th><th>" +
    i18nText("main.message203") +
    "</th><th>" +
    i18nText("main.message204") +
    "</th><th>" +
    i18nText("main.message205") +
    '</th><th></th></tr></thead><tbody id="lyric-editor"></tbody></table></div></section></div></dialog>\n<dialog id="original-dialog">' +
    dialogHeader(i18nText("main.message206"), "", "original-dialog", "") +
    '<div id="page-original"></div></dialog><button id="error-notice" class="error-notice" hidden type="button"><strong>' +
    i18nText("main.message207") +
    '</strong><span id="error-message" role="alert"></span><span aria-hidden="true">×</span></button>'
  );
}
