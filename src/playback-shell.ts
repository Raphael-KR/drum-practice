import { createDialog } from "./dialog-ui";
import { t } from "./i18n";
import {
  playbackButton,
  transportHTML,
  type PlaybackBindings,
} from "./playback-ui";
import {
  playbackBrandHTML,
  metronomeControlHTML,
  playbackTransportRightHTML,
  repeatBarHTML,
  soundFieldsHTML,
  tempoFieldsHTML,
  loopFieldsHTML,
  settingsFrameHTML,
  settingsPanel,
  screenSettingsHTML,
  playbackPreferenceFieldsHTML,
  type SettingsCategory,
} from "./playback-forms";
export interface PlaybackShellOptions {
  ids: PlaybackBindings & {
    rewindButton: string;
    mark: string;
    sound: string;
    settings: string;
    radiusAttribute: string;
  };
  screen: { pdf: string; highlight: string; fullscreen: string };
  preferences: { restart: string; countoff: string };
  select: (category: SettingsCategory) => void;
  openSettings: () => void;
  compare?: boolean;
  loopExtra?: HTMLElement;
  markerContent: HTMLElement;
}
/** Sole owner of playback composition. Hosts provide authoring slots, never rearrange common controls. */
export function mountPlaybackShell(
  root: HTMLElement,
  options: PlaybackShellOptions,
) {
  const { ids } = options;
  root.querySelector(".brand")!.innerHTML = playbackBrandHTML(
    ids.title,
    ids.tempo,
  );
  const actions = root.querySelector("header .actions")!;
  actions.insertAdjacentHTML("afterbegin", metronomeControlHTML());
  actions.insertAdjacentHTML(
    "beforeend",
    playbackButton(ids.settings, "settings", t("icons.message059")),
  );
  const gear = root.querySelector<HTMLButtonElement>(`#${ids.settings}`)!;
  gear.setAttribute("aria-haspopup", "dialog");
  gear.onclick = options.openSettings;
  const practice = root.querySelector("#practice")!;
  practice.insertAdjacentHTML(
    "beforeend",
    transportHTML({
      rewindId: ids.rewind,
      rewindButton: ids.rewindButton,
      positionId: ids.position,
      right: playbackTransportRightHTML({
        progress: ids.progress,
        mark: ids.mark,
        sound: ids.sound,
      }),
    }) +
      repeatBarHTML({
        repeat: ids.repeat,
        adjust: ids.adjust,
        markers: ids.markers,
        radiusAttribute: ids.radiusAttribute,
        summaryId: ids.summary,
        stopId: ids.stop,
      }),
  );
  practice.insertAdjacentHTML(
    "beforeend",
    `<p id="score-gesture-hint" class="subtle">${t("workspace.message567")}</p>`,
  );
  root
    .querySelector("#stage")
    ?.setAttribute("aria-describedby", "score-gesture-hint");
  const panel = (name: string, title: string, body: string) => {
    const dialog = createDialog(
      `${name}-dialog`,
      title,
      "tool-dialog",
      root,
      `${name}-close`,
    );
    const content = document.createElement("div");
    content.className = "tool-body";
    content.innerHTML = body;
    dialog.append(content);
    return content;
  };
  panel("tempo", t("main.message208"), tempoFieldsHTML(ids.tempoInput));
  panel("sound", t("icons.message070"), soundFieldsHTML());
  const loop = panel("loop", t("icons.message067"), loopFieldsHTML());
  if (options.loopExtra) loop.append(options.loopExtra);
  panel("marker", t("icons.message069"), "").append(options.markerContent);
  // The settings frame includes its own shared heading.
  const template = document.createElement("template");
  template.innerHTML = `<dialog id="settings-dialog" aria-labelledby="settings-heading">${settingsFrameHTML()}</dialog>`;
  const settings = template.content.firstElementChild as HTMLDialogElement;
  root.append(settings);
  const addSettings = (
    category: SettingsCategory,
    id: string,
    buttonId: string,
  ) => settingsPanel(settings, category, id, buttonId, options.select);
  const screen = addSettings("screen", "screen-dialog", "open-screen-dialog");
  screen.innerHTML = screenSettingsHTML(options.screen, options.compare);
  addSettings(
    "playback",
    "playback-settings",
    "open-playback-settings",
  ).innerHTML = playbackPreferenceFieldsHTML(
    options.preferences.restart,
    options.preferences.countoff,
  );
  return { settings, screen, addSettings };
}
