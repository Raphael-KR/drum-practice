import type { MessageKey } from "./i18n";
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
      item("#stage", "help.score", "help.scoreBody"),
      item(".transport", "help.transport", "help.transportBody"),
      item("#playback-drawer", "help.repeat", "help.repeatBody"),
    ];
  return [
    item(
      ".library-main, #home",
      "help.library",
      document.querySelector(".library-main")
        ? "help.libraryBody"
        : "help.authoringHomeBody",
    ),
  ];
}
