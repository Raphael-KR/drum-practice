import { t as i18nText } from "../i18n/i18n";
import { setIconButton } from "./icon-button";
import { icon } from "./icon-svg";
export { icon } from "./icon-svg";
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
    ["library-button", "library", i18nText("icons.message054")],
    ["open-settings-dialog", "settings", i18nText("icons.message059")],
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
    ["open-loop-dialog", "repeat", i18nText("icons.message067")],
    [
      "open-screen-dialog",
      "screen",
      i18nText("icons.message071"),
      i18nText("icons.message071"),
    ],
  ];
  items.forEach(([id, name, label, caption]) =>
    document.getElementById(id)?.hasAttribute("data-common-icon")
      ? undefined
      : iconButton(id, name, label, caption),
  );
}
