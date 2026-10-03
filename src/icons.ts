import { t as i18nText } from "./i18n";
import { setIconButton } from "./icon-button";
import { icon as playbackIcon, svgFromPath } from "./icon-svg";
const appPaths: Record<string, string> = {
  pencil: '<path d="m4 16 12-12 4 4L8 20l-5 1Zm10-10 4 4"/>',
  lyrics:
    '<path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM7 8h10M7 12h7"/>',
  folder:
    '<path d="M3 6h7l2 3h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm0 0V4h7l2 2h7a2 2 0 0 1 2 2v1"/>',
  export: '<path d="M8 9H4v12h16V9h-4M12 15V2m-4 4 4-4 4 4"/>',
};
export function icon(name: string) {
  return appPaths[name] ? svgFromPath(appPaths[name]) : playbackIcon(name);
}
export function iconButton(
  id: string,
  name: string,
  label: string,
  caption?: string,
) {
  const b = document.getElementById(id)!;
  setIconButton(b, icon(name), label, caption);
}
export function arrangeIcons() {
  const items = [
    ["home", "start", i18nText("icons.message051")],
    ["play", "play", i18nText("icons.message052")],
    ["jump", "rewind", i18nText("icons.message053")],
    [
      "welcome-library",
      "library",
      i18nText("icons.message054"),
      i18nText("icons.message054"),
    ],
    [
      "welcome-new",
      "plus",
      i18nText("editorHome.new"),
      i18nText("editorHome.new"),
    ],
    ["library-button", "library", i18nText("icons.message054")],
    [
      "new-button",
      "plus",
      i18nText("icons.message056"),
      i18nText("icons.message056"),
    ],
    [
      "save-html",
      "export",
      i18nText("icons.message057"),
      i18nText("icons.message058"),
    ],
    ["open-settings-dialog", "settings", i18nText("icons.message059")],
    [
      "quick-add-marker",
      "plus",
      i18nText("icons.message060"),
      i18nText("icons.message061"),
    ],
    [
      "open-score-settings",
      "library",
      i18nText("icons.message062"),
      i18nText("icons.message063"),
    ],
    [
      "open-playback-settings",
      "play",
      i18nText("icons.message064"),
      i18nText("icons.message052"),
    ],
    [
      "open-info-settings",
      "info",
      i18nText("icons.message065"),
      i18nText("icons.message066"),
    ],
    [
      "open-loop-dialog",
      "repeat",
      i18nText("icons.message067"),
    ],
    [
      "open-marker-dialog",
      "bookmark",
      i18nText("icons.message069"),
      "",
    ],
    [
      "open-screen-dialog",
      "screen",
      i18nText("icons.message071"),
      i18nText("icons.message071"),
    ],
    [
      "edit-button",
      "pencil",
      i18nText("icons.message072"),
      i18nText("icons.message072"),
    ],
    [
      "lyrics-button",
      "lyrics",
      i18nText("icons.message073"),
      i18nText("icons.message073"),
    ],
    [
      "metadata-button",
      "info",
      i18nText("icons.message074"),
      i18nText("icons.message074"),
    ],
  ];
  items.forEach(([id, name, label, caption]) =>
    document.getElementById(id)?.hasAttribute("data-common-icon")
      ? undefined
      : iconButton(id, name, label, caption),
  );
}
