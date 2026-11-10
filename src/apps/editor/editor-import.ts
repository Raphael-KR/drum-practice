import {
  beatTime,
  clamp,
  defaults,
  reflow,
  uid,
  type Song,
} from "../../model/model";
import type { RecordData } from "../../model/record";
import { importedCanonical } from "../../modules/score/canonical-xml";
import { applyXMLTiming, scoreFormat } from "../../modules/score/score-import";
import { t as i18nText } from "../../shared/i18n/i18n";
import { escapeHTML as esc } from "../../shared/ui/html";
import { $, num, val } from "./editor-dom";
import type { EditorScoreRenderer } from "./editor-record-preparation";

interface EditorImportHost {
  busy: boolean;
  status(message: string): void;
  tell(message: string): void;
  error(error: unknown): void;
  activate(record: RecordData): Promise<void>;
  openEditor(): Promise<void>;
  renderScore: EditorScoreRenderer;
}
const xmlModule = () => import("../../modules/score/musicxml");

/** Bind import forms once; read busy state from the live host inside each handler. */
export function installEditorImport(h: EditorImportHost) {
  const { status, tell, error, activate, openEditor, renderScore } = h;

  let inspectGeneration = 0;
  val("pdf-file").onchange = async () => {
    const generation = ++inspectGeneration,
      file = val("pdf-file").files?.[0];
    $("xml-part-row").hidden = true;
    $("xml-part").innerHTML = "";
    const isXML = !!file && scoreFormat(file.name) === "musicxml";
    val("new-beats").disabled = isXML;
    val("new-denominator").disabled = isXML;
    if (!file || scoreFormat(file.name) !== "musicxml") return;
    try {
      const xml = await xmlModule(),
        text = await xml.readMusicXML(file),
        info = xml.parseMusicXML(text, undefined, true);
      if (generation !== inspectGeneration) return;
      $("xml-part").innerHTML = info.parts
        .map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`)
        .join("");
      $("xml-part-row").hidden = false;
      if (info.title) val("new-title").value = info.title;
      if (info.bpm) val("new-bpm").value = String(info.bpm);
    } catch (e) {
      if (generation === inspectGeneration) error(e);
    }
  };
  val("xml-part").onchange = async () => {
    const file = val("pdf-file").files?.[0];
    if (!file) return;
    try {
      const xml = await xmlModule(),
        info = xml.parseMusicXML(
          await xml.readMusicXML(file),
          val("xml-part").value,
        );
      if (info.bpm) val("new-bpm").value = String(info.bpm);
    } catch (e) {
      error(e);
    }
  };
  $("new-form").onsubmit = async (e) => {
    e.preventDefault();
    if (h.busy) return;
    h.busy = true;
    try {
      const pdf = val("pdf-file").files?.[0],
        audio = val("audio-file").files?.[0];
      if (!pdf || !audio) throw Error(i18nText("main.message293"));
      status(i18nText("main.message294"));
      const format = scoreFormat(pdf.name);
      const result = await renderScore(
        pdf,
        format,
        val("xml-part").value || undefined,
      );
      const { pages, regions } = result;
      const s: Song = {
        version: 1,
        id: uid(),
        title: val("new-title").value,
        artist: val("new-artist").value,
        bpm: result.parsed?.bpm ?? num("new-bpm"),
        firstBeat: num("new-first"),
        pageCount: pages.length,
        regions,
        measures: regions.map((r, i) => ({
          id: uid(),
          regionId: r.id,
          label: String(i + 1),
          beats: num("new-beats"),
          denominator: num("new-denominator"),
          start: 0,
          end: 1,
        })),
        lyrics: [],
        markers: [],
        loops: [],
        settings: defaults(),
        scoreFormat: format,
        scorePartId: result.parsed ? result.parsed.partId : undefined,
        pdfName: pdf.name,
        audioName: audio.name,
      };
      if (result.parsed) applyXMLTiming(s, result.parsed);
      else reflow(s);
      s.lyricText = val("new-lyrics").value.trim() || undefined;
      if (result.parsed)
        s.lyrics = result.parsed.lyrics
          .map((l) => {
            const m = s.measures[l.measure],
              beat = clamp(l.beat, 0, m.beats);
            return {
              id: uid(),
              text: l.text,
              time: beatTime(m, beat),
              end: beatTime(m, Math.min(m.beats, beat + l.duration)),
              confirmed: false,
              scorePosition: {
                measureId: m.id,
                quarterOffset: (l.beat * 4) / m.denominator,
                durationQuarters: Math.max(
                  0.0001,
                  (l.duration * 4) / m.denominator,
                ),
              },
            };
          })
          .sort((a, b) => a.time - b.time);
      const canonicalXML =
        format === "musicxml"
          ? importedCanonical(await (await xmlModule()).readMusicXML(pdf), s)
          : undefined;
      await activate({ song: s, pdf, audio, pages, canonicalXML });
      $<HTMLDialogElement>("new-dialog").close();
      await openEditor();
      tell(
        result.parsed
          ? i18nText("main.message295", {
              value1: regions.length,
              value2: result.parsed.warnings.join(" "),
            })
          : i18nText("main.message296", { value1: regions.length }),
      );
    } catch (e) {
      error(e);
    } finally {
      h.busy = false;
    }
  };
}
