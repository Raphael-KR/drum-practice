import type { MessageKey } from "../../shared/i18n/i18n";
export interface HelpItem {
  target: string;
  title: MessageKey;
  body: MessageKey;
}
export function helpItems(context?: HTMLElement): HelpItem[] {
  const item = (target: string, title: MessageKey, body: MessageKey) => ({
    target,
    title,
    body,
  });
  if (context?.id === "editor-dialog")
    return [
      item(".editor-tabs", "help.editTabs", "help.editTabsBody"),
      item(".editor-history-tools", "help.save", "help.saveBody"),
      item("#editor-meta", "help.metadata", "help.metadataBody"),
      item("#editor-score", "help.scoreEdit", "help.scoreEditBody"),
      item("#editor-lyrics", "help.lyrics", "help.lyricsBody"),
    ];
  if (context?.id === "settings-dialog")
    return [
      item("[data-title-order]", "settings.titleOrder", "help.tipTitleOrder"),
      item("[data-practice-save]", "practiceFile.save", "help.tipBackup"),
      item("[data-practice-load]", "practiceFile.load", "help.tipRestore"),
      item(
        "[data-settings-category]",
        "icons.message059",
        "help.tipSettingsTabs",
      ),
      item("#music-volume", "main.message129", "help.tipMusicVolume"),
      item("#click-volume", "workspace.message548", "help.tipClickVolume"),
    ];
  if (context?.id === "audio-practice-setup")
    return [
      item("[data-first]", "audioPractice.here", "help.tipFirstBeat"),
      item(".metronome-toggle", "audioPractice.click", "help.tipPreviewClick"),
      item("[name=bpm]", "audioPractice.bpm", "help.tipScoreBpm"),
      item("[name=meter]", "audioPractice.meter", "help.tipMeter"),
    ];
  if (context) {
    const bodies: Record<string, MessageKey> = {
      "settings-dialog": "help.settingsBody",
      "loop-dialog": "help.loopBody",
      "marker-dialog": "help.markerBody",
      "tempo-dialog": "help.tempoBody",
      "sound-dialog": "help.soundBody",
      "library-dialog": "help.libraryBody",
    };
    return [
      item(
        ".tool-body, section:not([hidden]), form, .dialoghead",
        "help.current",
        bodies[context.id] || "help.dialogBody",
      ),
    ];
  }
  if (document.querySelector("#practice")?.getClientRects().length)
    return [
      document.querySelector(".audio-practice")
        ? item("#stage", "audioPractice.timeline", "audioPractice.help")
        : item("#stage", "help.score", "help.scoreBody"),
      item(".transport", "help.transport", "help.transportBody"),
      item("#playback-drawer", "help.repeat", "help.repeatBody"),
    ];
  if (document.querySelector(".library-main"))
    return [
      item("#import-package", "audioPractice.import", "help.tipImport"),
      item(".library-favorite", "help.favorites", "help.tipFavorite"),
      item(
        "[data-score-download]",
        "separation.loadBundled",
        "help.tipDownload",
      ),
      item("[data-open]", "separation.open", "help.tipOpen"),
      item("[data-audio-setup]", "audioPractice.setup", "help.tipAdjust"),
      item("[data-remove]", "separation.remove", "help.tipDelete"),
      item("#library-settings", "icons.message059", "help.tipSettings"),
      item("#library-refresh", "library.refresh", "help.tipRefresh"),
    ];
  return [
    item(
      ".library-main, #home",
      document.querySelector(".library-main")
        ? "library.screenName"
        : "help.library",
      document.querySelector(".library-main")
        ? "help.libraryBody"
        : "help.authoringHomeBody",
    ),
  ];
}
