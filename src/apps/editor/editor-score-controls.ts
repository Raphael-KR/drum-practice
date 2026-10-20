import {
  beatTime,
  clamp,
  locate,
  reflow,
  setMeasureTiming,
  uid,
  validateSong,
  type Region,
  type Song,
} from "../../model/model";
import type { RecordData } from "../../model/record";
import { estimateTempo } from "../../modules/audio/analysis";
import { synchronizeLyricGrid } from "../../modules/lyrics/lyric-grid";
import {
  migrateLyricPositions,
  projectLyrics,
} from "../../modules/lyrics/lyric-score";
import {
  hasDrumNotation,
  writeCanonical,
} from "../../modules/score/canonical-xml";
import { t as i18nText } from "../../shared/i18n/i18n";
import { escapeHTML as esc } from "../../shared/ui/html";
import { Player } from "./audio";
import { $, num, val } from "./editor-dom";
import type { editorSession } from "./editor-session";
import { selectEditorPane } from "./workspace";
interface ScoreEditorHost {
  cancelGestures(): void;
  selected: number;
  readonly record: RecordData | undefined;
  readonly urls: string[];
  readonly session: ReturnType<typeof editorSession> | undefined;
  song(): Song;
  engine(): Player;
  renderLyricEditor(near: boolean): void;
  renderCurrentLyrics(): void;
  flushEditorForm(): void;
  renderTrack(): void;
  renderLists(): void;
  queueSave(): void;
  updateSongHeading(): void;
  action(id: string, fn: () => unknown): void;
  error(error: unknown): void;
  tell(message: string): void;
  toggle(): Promise<void>;
}
export function createScoreEditor(h: ScoreEditorHost) {
  const {
    song,
    engine,
    renderLyricEditor,
    flushEditorForm,
    renderTrack,
    renderLists,
    queueSave,
    updateSongHeading,
    action,
    error,
    tell,
    toggle,
  } = h;
  let editorPage = 0,
    drawStart: { x: number; y: number } | undefined;
  async function openEditor() {
    if (!h.record) return;
    h.cancelGestures();
    h.selected = locate(song(), engine().current()).index;
    h.selected = clamp(h.selected, 0, song().measures.length - 1);
    engine().pause();
    val("edit-title").value = song().title;
    val("edit-original-title").value = song().originalTitle || "";
    val("edit-lyricist").value = song().lyricist || "";
    val("edit-composer").value = song().composer || "";
    val("edit-artist").value = song().artist || "";
    val("edit-bpm").value = String(song().bpm);
    val("edit-first").value = String(song().firstBeat);
    $("editor-page").innerHTML = h.urls
      .map(
        (_, i) =>
          '<option value="' +
          String(i) +
          '">' +
          i18nText("main.message297", { value2: i + 1 }) +
          "</option>",
      )
      .join("");
    updateMeasureForm();
    renderLyricEditor(false);
    h.session?.begin();
    const editor = $<HTMLDialogElement>("editor-dialog");
    if (!editor.open) editor.showModal();
    await drawPage();
  }
  action("edit-button", () => {
    selectEditorPane("score");
    return openEditor();
  });
  action("metadata-button", () => {
    selectEditorPane("meta");
    return openEditor();
  });
  action("lyrics-button", () => {
    selectEditorPane("lyrics");
    return openEditor();
  });
  function updateMeasureForm() {
    const s = song();
    $("measure-select").innerHTML = s.measures
      .map(
        (m, i) =>
          '<option value="' +
          String(i) +
          '">' +
          i18nText("main.message299", { value2: i + 1, value3: esc(m.label) }) +
          "</option>",
      )
      .join("");
    val("measure-select").value = String(h.selected);
    const m = s.measures[h.selected];
    if (!m) return;
    const r = s.regions.find((r) => r.id === m.regionId)!;
    editorPage = r.page;
    val("editor-page").value = String(editorPage);
    val("measure-label").value = m.label;
    val("measure-beats").value = String(m.beats);
    val("measure-denominator").value = String(m.denominator);
    val("measure-start").value = m.start.toFixed(3);
    val("measure-end").value = m.end.toFixed(3);
    val("beat-xs").value = r.beatXs.join(",");
  }
  let crop: Omit<Region, "id" | "beatXs"> | undefined;
  async function drawPage() {
    const c = $<HTMLCanvasElement>("edit-canvas");
    const img = new Image();
    img.src = h.urls[editorPage];
    await img.decode();
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const m = song().measures[h.selected],
      r =
        crop ||
        (m ? song().regions.find((r) => r.id === m.regionId) : undefined);
    if (r && r.page === editorPage) {
      ctx.fillStyle = "#3f74d428";
      ctx.strokeStyle = "#3f74d4";
      ctx.lineWidth = 3;
      ctx.fillRect(
        r.x * c.width,
        r.y * c.height,
        r.w * c.width,
        r.h * c.height,
      );
      ctx.strokeRect(
        r.x * c.width,
        r.y * c.height,
        r.w * c.width,
        r.h * c.height,
      );
    }
  }
  val("editor-page").onchange = () => {
    editorPage = num("editor-page");
    crop = undefined;
    void drawPage();
  };
  val("measure-select").onchange = () => {
    if (h.session?.active()) {
      try {
        flushEditorForm();
      } catch (e) {
        val("measure-select").value = String(h.selected);
        error(e);
        return;
      }
    }
    h.selected = num("measure-select");
    crop = undefined;
    updateMeasureForm();
    void drawPage();
    h.renderCurrentLyrics();
  };
  const canvas = $<HTMLCanvasElement>("edit-canvas");
  const pointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: clamp((e.clientX - r.left) / r.width, 0, 1),
      y: clamp((e.clientY - r.top) / r.height, 0, 1),
    };
  };
  canvas.onpointerdown = (e) => {
    drawStart = pointer(e);
    canvas.setPointerCapture(e.pointerId);
  };
  canvas.onpointerup = (e) => {
    if (!drawStart) return;
    const p = pointer(e);
    crop = {
      page: editorPage,
      x: Math.min(p.x, drawStart.x),
      y: Math.min(p.y, drawStart.y),
      w: Math.abs(p.x - drawStart.x),
      h: Math.abs(p.y - drawStart.y),
    };
    drawStart = undefined;
    if (crop.w < 0.01 || crop.h < 0.01) {
      crop = undefined;
      return;
    }
    void drawPage();
  };
  canvas.onpointercancel = () => (drawStart = undefined);
  function edit(mut: (s: Song) => void) {
    const draft = structuredClone(song());
    mut(draft);
    const topology = (s: Song) =>
      JSON.stringify(s.measures.map((m) => [m.id, m.beats, m.denominator]));
    if (topology(draft) !== topology(song())) {
      if (h.record!.canonicalXML && hasDrumNotation(h.record!.canonicalXML))
        throw Error(i18nText("main.message300"));
      for (const l of draft.lyrics) delete l.grid;
    }
    if (draft.lyricGridEnabled) synchronizeLyricGrid(draft);
    migrateLyricPositions(draft);
    projectLyrics(draft);
    validateSong(draft);
    engine().pause();
    const canonicalXML = writeCanonical(draft, h.record!.canonicalXML);
    h.session?.before();
    h.record!.song = draft;
    h.record!.canonicalXML = canonicalXML;
    engine().song = draft;
    engine().loop = undefined;
    h.selected = clamp(h.selected, 0, Math.max(0, draft.measures.length - 1));
    updateMeasureForm();
    renderTrack();
    renderLists();
    queueSave();
    h.session?.changed();
    void drawPage();
  }
  action("add-region", () => {
    if (!crop) throw Error(i18nText("main.message301"));
    const c = crop;
    edit((s) => {
      const r = { ...c, id: uid(), beatXs: [] };
      s.regions.push(r);
      const start = s.measures.at(-1)?.end ?? s.firstBeat;
      s.measures.push({
        id: uid(),
        regionId: r.id,
        label: String(s.measures.length + 1),
        beats: 4,
        denominator: 4,
        start,
        end: start + 240 / s.bpm,
      });
      h.selected = s.measures.length - 1;
    });
    crop = undefined;
  });
  action("apply-crop", () => {
    if (!crop) throw Error(i18nText("main.message302"));
    const c = crop;
    edit((s) => {
      const m = s.measures[h.selected];
      if (!m) throw Error(i18nText("main.message303"));
      const r = s.regions.find((r) => r.id === m.regionId)!;
      Object.assign(r, c);
    });
    crop = undefined;
  });
  action("apply-measure", () =>
    edit((s) => {
      const m = s.measures[h.selected];
      if (!m) throw Error(i18nText("main.message304"));
      setMeasureTiming(m, num("measure-start"), num("measure-end"));
      if (m.beats !== num("measure-beats")) delete m.beatTimes;
      Object.assign(m, {
        label: val("measure-label").value,
        beats: num("measure-beats"),
        denominator: num("measure-denominator"),
        start: num("measure-start"),
        end: num("measure-end"),
      });
      const r = s.regions.find((r) => r.id === m.regionId)!;
      r.beatXs = val("beat-xs").value.trim()
        ? val("beat-xs").value.split(",").map(Number)
        : [];
      if (r.beatXs.length && r.beatXs.length !== m.beats + 1)
        throw Error(i18nText("main.message305", { value1: m.beats + 1 }));
    }),
  );
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
  action("anchor-now", () => {
    const t = engine().current();
    edit((s) => {
      const m = s.measures[h.selected];
      const delta = t - m.start;
      if (h.selected && t <= s.measures[h.selected - 1].start)
        throw Error(i18nText("main.message307"));
      if (h.selected) {
        const previous = s.measures[h.selected - 1];
        setMeasureTiming(previous, previous.start, t);
      } else s.firstBeat = t;
      for (let i = h.selected; i < s.measures.length; i++) {
        const next = s.measures[i];
        setMeasureTiming(next, next.start + delta, next.end + delta);
      }
    });
  });
  action("preview-measure", async () => {
    engine().pause();
    engine().position = song().measures[h.selected].start;
    await engine().play(false);
  });
  action("editor-play", toggle);
  action("duplicate", () =>
    edit((s) => {
      const m = s.measures[h.selected],
        r = s.regions.find((r) => r.id === m.regionId)!;
      const copy = { ...r, id: uid(), beatXs: [...r.beatXs] };
      s.regions.push(copy);
      s.measures.splice(h.selected + 1, 0, {
        ...m,
        id: uid(),
        regionId: copy.id,
        label: m.label + i18nText("main.message308"),
      });
      reflow(s);
      h.selected++;
    }),
  );
  action("split", () =>
    edit((s) => {
      const m = s.measures[h.selected],
        r = s.regions.find((r) => r.id === m.regionId)!;
      if (m.beats % 2) throw Error(i18nText("main.message309"));
      const right = {
        ...r,
        id: uid(),
        x: r.x + r.w / 2,
        w: r.w / 2,
        beatXs: [],
      };
      r.w /= 2;
      r.beatXs = [];
      s.regions.push(right);
      const end = m.end;
      const times = m.beatTimes;
      m.end = beatTime(m, m.beats / 2);
      m.beats /= 2;
      if (times) m.beatTimes = times.slice(0, m.beats);
      s.measures.splice(h.selected + 1, 0, {
        ...m,
        id: uid(),
        regionId: right.id,
        label: m.label + "b",
        start: m.end,
        end,
        ...(times ? { beatTimes: times.slice(m.beats) } : {}),
      });
    }),
  );
  action("merge", () =>
    edit((s) => {
      const a = s.measures[h.selected],
        b = s.measures[h.selected + 1];
      if (!b) throw Error(i18nText("main.message310"));
      const r = s.regions.find((r) => r.id === a.regionId)!,
        z = s.regions.find((r) => r.id === b.regionId)!;
      if (
        r.page !== z.page ||
        Math.abs(r.y - z.y) > 0.025 ||
        a.denominator !== b.denominator
      )
        throw Error(i18nText("main.message311"));
      r.w = Math.max(r.x + r.w, z.x + z.w) - Math.min(r.x, z.x);
      r.x = Math.min(r.x, z.x);
      r.beatXs = [];
      if (a.beatTimes || b.beatTimes)
        a.beatTimes = [
          ...Array.from({ length: a.beats }, (_, i) => beatTime(a, i)),
          ...Array.from({ length: b.beats }, (_, i) => beatTime(b, i)),
        ];
      a.beats += b.beats;
      a.end = b.end;
      s.measures.splice(h.selected + 1, 1);
    }),
  );
  for (const [id, d] of [
    ["move-left", -1],
    ["move-right", 1],
  ] as const)
    action(id, () =>
      edit((s) => {
        const j = h.selected + d;
        if (j < 0 || j >= s.measures.length) return;
        [s.measures[j], s.measures[h.selected]] = [
          s.measures[h.selected],
          s.measures[j],
        ];
        h.selected = j;
        reflow(s);
      }),
    );
  action("remove-measure", () => {
    if (confirm(i18nText("main.message312")))
      edit((s) => {
        s.measures.splice(h.selected, 1);
        reflow(s);
      });
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
  return { openEditor, updateMeasureForm, drawPage, edit };
}
