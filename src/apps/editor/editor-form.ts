import type { EditorForm } from "../../model/edit-history";
import type { Song } from "../../model/model";
import { t as i18nText } from "../../shared/i18n/i18n";
import { val } from "./editor-dom";
export const editorFields = [
  "edit-artist",
  "edit-title",
  "edit-original-title",
  "edit-lyricist",
  "edit-composer",
  "edit-bpm",
  "edit-first",
];
interface FormHost {
  song(): Song;
  selected(): number;
  edit(mut: (song: Song) => void): void;
  renderLyricEditor(): void;
  updateSongHeading(): void;
}
export function createEditorForm(h: FormHost) {
  const { song, edit, renderLyricEditor, updateSongHeading } = h;
  function editorForm(): EditorForm {
    const fields = Object.fromEntries(
      editorFields.map((id) => [id, val(id).value]),
    );
    document
      .querySelectorAll<HTMLInputElement | HTMLSelectElement>(
        "#lyric-editor [data-field]",
      )
      .forEach((el) => {
        const key = `lyric:${el.closest<HTMLElement>("[data-lyric]")!.dataset.lyric}:${el.dataset.field}`;
        fields[key] =
          el instanceof HTMLInputElement && el.type === "checkbox"
            ? String(el.checked)
            : el.value;
      });
    return { selected: h.selected(), fields };
  }
  function fillMetadata() {
    for (const [id, key] of [
      ["edit-title", "title"],
      ["edit-original-title", "originalTitle"],
      ["edit-artist", "artist"],
      ["edit-composer", "composer"],
      ["edit-lyricist", "lyricist"],
      ["edit-bpm", "bpm"],
      ["edit-first", "firstBeat"],
    ] as const)
      val(id).value = String(song()[key] ?? "");
  }
  function pendingEditorValues() {
    const current = editorForm();
    const metadata = {
      title: current.fields["edit-title"].trim() || song().title,
      artist: current.fields["edit-artist"].trim(),
      originalTitle: current.fields["edit-original-title"].trim(),
      lyricist: current.fields["edit-lyricist"].trim(),
      composer: current.fields["edit-composer"].trim(),
    };
    const metaChanged = Object.entries(metadata).some(
      ([k, v]) => v !== String(song()[k as keyof Song] ?? ""),
    );
    const lyrics = song().lyrics.flatMap((l) => {
      const f = (key: string) => current.fields[`lyric:${l.id}:${key}`];
      if (f("text") === undefined) return [];
      const values = {
        id: l.id,
        text: f("text"),
        confirmed: f("confirmed") === "true",
      };
      return values.text !== l.text || values.confirmed !== !!l.confirmed
        ? [values]
        : [];
    });
    const tempoChanged =
      Number(current.fields["edit-bpm"]) !== song().bpm ||
      Number(current.fields["edit-first"]) !== song().firstBeat;
    return {
      metadata,
      metaChanged,
      lyrics,
      tempoChanged,
    };
  }
  function flushEditorForm(requireAppliedTempo = true) {
    const { metadata, metaChanged, lyrics, tempoChanged } =
      pendingEditorValues();
    if (tempoChanged && requireAppliedTempo)
      throw Error(i18nText("main.message366"));
    if (!metaChanged && !lyrics.length) return;
    edit((s) => {
      Object.assign(s, metadata);
      for (const v of lyrics) {
        const l = s.lyrics.find((l) => l.id === v.id)!;
        l.text = v.text;
        l.confirmed = v.confirmed;
      }
    });
    renderLyricEditor();
    updateSongHeading();
  }
  return { editorForm, fillMetadata, pendingEditorValues, flushEditorForm };
}
