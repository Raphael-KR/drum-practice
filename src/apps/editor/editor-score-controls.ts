import {
  clamp,
  locate,
  reflow,
  validateSong,
  type Song,
} from "../../model/model";
import type { RecordData } from "../../model/record";
import { estimateTempo } from "../../modules/audio/analysis";
import { synchronizeLyricGrid } from "../../modules/lyrics/lyric-grid";
import {
  migrateLyricPositions,
  projectLyrics,
} from "../../modules/lyrics/lyric-score";
import { writeCanonical } from "../../modules/score/canonical-xml";
import { t as i18nText } from "../../shared/i18n/i18n";
import { Player } from "./audio";
import { $, num, val } from "./editor-dom";
import type { editorSession } from "./editor-session";
interface ScoreEditorHost {
  cancelGestures(): void;
  selected: number;
  readonly record: RecordData | undefined;
  readonly session: ReturnType<typeof editorSession> | undefined;
  song(): Song;
  engine(): Player;
  renderCurrentLyrics(): void;
  renderLists(): void;
  queueSave(): void;
  updateSongHeading(): void;
  action(id: string, fn: () => unknown): void;
  tell(message: string): void;
  error(error: unknown): void;
  refreshGeometry(): Promise<void>;
}
export function createScoreEditor(h: ScoreEditorHost) {
  const { song, engine, action, tell, updateSongHeading } = h;
  async function openEditor() {
    if (!h.record) return;
    h.selected = clamp(
      locate(song(), engine().current()).index,
      0,
      song().measures.length - 1,
    );
    for (const [id, key] of [
      ["edit-title", "title"],
      ["edit-original-title", "originalTitle"],
      ["edit-artist", "artist"],
      ["edit-lyricist", "lyricist"],
      ["edit-composer", "composer"],
      ["edit-bpm", "bpm"],
      ["edit-first", "firstBeat"],
    ] as const)
      val(id).value = String(song()[key] ?? "");
    $("editor-dialog").hidden = false;
    h.renderCurrentLyrics();
    h.session?.begin();
  }
  function updateMeasureForm() {
    h.renderCurrentLyrics();
  }
  function edit(mut: (s: Song) => void, work?: RecordData["lyricWork"]) {
    h.cancelGestures();
    const draft = structuredClone(song());
    mut(draft);
    if (draft.lyricGridEnabled) synchronizeLyricGrid(draft);
    migrateLyricPositions(draft);
    projectLyrics(draft);
    validateSong(draft);
    const canonicalXML = writeCanonical(draft, h.record!.canonicalXML);
    engine().pause();
    h.session?.before();
    if (work) h.record!.lyricWork = work;
    h.record!.song = draft;
    h.record!.canonicalXML = canonicalXML;
    engine().song = draft;
    engine().loop = undefined;
    h.selected = clamp(h.selected, 0, draft.measures.length - 1);
    h.renderLists();
    h.queueSave();
    h.session?.changed();
    void h.refreshGeometry().catch(h.error);
  }
  action("reflow", () => {
    if (!confirm(i18nText("main.message176"))) return;
    edit((s) => {
      s.title = val("edit-title").value;
      s.artist = val("edit-artist").value;
      s.bpm = num("edit-bpm");
      s.firstBeat = num("edit-first");
      reflow(s);
    });
    updateSongHeading();
  });
  action("estimate-tempo", () => {
    const p = engine();
    if (!p.original) return;
    const a = estimateTempo(
      p.original.getChannelData(0),
      p.original.sampleRate,
    );
    if (a.confidence < 0.08) {
      tell(i18nText("main.message313"));
      return;
    }
    val("edit-bpm").value = String(a.bpm);
    val("edit-first").value = String(a.firstBeat);
    $("tap-result").textContent = i18nText("main.message314", {
      value1: a.bpm,
      value2: a.firstBeat,
    });
  });
  let taps: number[] = [];
  action("tap-tempo", () => {
    const now = performance.now();
    if (taps.length && now - taps.at(-1)! > 2500) taps = [];
    taps.push(now);
    taps = taps.slice(-9);
    if (taps.length > 2) {
      const bpm = 60_000 / ((taps.at(-1)! - taps[0]) / (taps.length - 1));
      val("edit-bpm").value = String(Math.round(clamp(bpm, 20, 300)));
      $("tap-result").textContent = i18nText("main.message315", {
        value1: Math.round(bpm),
      });
    }
  });
  return { openEditor, updateMeasureForm, edit };
}
