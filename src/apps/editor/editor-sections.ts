import type { RecordData } from "../../model/record";
import type { Player } from "./audio";
import {
  preparePlaybackAssets,
  releasePlaybackAssets,
  replacePlaybackAssets,
  type PlaybackAssets,
} from "../../modules/playback/playback-assets";
import type { SectionShortcut } from "../../modules/playback/section-shortcuts";
import { t as i18nText } from "../../shared/i18n/i18n";
import { $ } from "./editor-dom";
import type { editorSession } from "./editor-session";
import { mountSectionEditor, writeSections } from "./section-editor";

interface SectionWorkflowHost {
  readonly record: RecordData | undefined;
  busy: boolean;
  readonly session: ReturnType<typeof editorSession> | undefined;
  assets(): PlaybackAssets;
  engine(): Player;
  status(message: string): void;
  flushEditorForm(): void;
  renderTrack(): void;
  renderLists(): void;
  geometryChanged(): void;
  queueSave(): void;
}

/** Connect section editing to the host's existing draft, save queue and asset lifetime. */
export function installEditorSections(h: SectionWorkflowHost) {
  const {
    engine,
    status,
    flushEditorForm,
    renderTrack,
    renderLists,
    geometryChanged,
    queueSave,
  } = h;
  const sectionPane = $("editor-sections");
  const sectionEditor = mountSectionEditor(sectionPane, {
    song: () => h.record?.song,
    xml: () => h.record?.canonicalXML,
    apply: async (sections: SectionShortcut[]) => {
      if (!h.record || h.busy || h.session?.saving())
        throw Error(i18nText("sectionEditor.busy"));
      flushEditorForm();
      const original = h.record;
      const xml = writeSections(
        original.canonicalXML!,
        sections,
        original.song.measures.length,
        original.song.scorePartId,
      );
      h.busy = true;
      try {
        const next = await (
          await import("../../modules/score/browser-score")
        ).prepareBrowserScore({ ...original, canonicalXML: xml }, status);
        const prepared = await preparePlaybackAssets(next.pages, next.song);
        if (h.record !== original) {
          releasePlaybackAssets(prepared);
          throw Error(i18nText("sectionEditor.changed"));
        }
        engine().pause();
        h.session?.before();
        Object.assign(original, next);
        engine().song = original.song;
        replacePlaybackAssets(h.assets(), prepared);
        renderTrack();
        renderLists();
        geometryChanged();
        h.session?.changed();
        queueSave();
      } finally {
        h.busy = false;
      }
    },
  });
  async function refreshSectionGeometry(original: RecordData) {
    const expectedXML = original.canonicalXML;
    const next = await (
      await import("../../modules/score/browser-score")
    ).prepareBrowserScore(
      { ...original, song: structuredClone(original.song) },
      status,
    );
    const prepared = await preparePlaybackAssets(next.pages, next.song);
    if (h.record !== original || original.canonicalXML !== expectedXML) {
      releasePlaybackAssets(prepared);
      return;
    }
    original.pages = next.pages;
    original.otherScores = next.otherScores;
    original.song.regions = next.song.regions;
    original.song.pageCount = next.song.pageCount;
    original.song.measures.forEach(
      (m, i) => (m.regionId = next.song.measures[i].regionId),
    );
    replacePlaybackAssets(h.assets(), prepared);
    sectionEditor.refresh();
    renderTrack();
    renderLists();
  }

  return { refreshSectionGeometry, refresh: () => sectionEditor.refresh() };
}
