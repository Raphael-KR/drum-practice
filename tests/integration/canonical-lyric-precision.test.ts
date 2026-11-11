// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { defaults, type Song } from "../../src/model/model";
import {
  createEditorForm,
  editorFields,
} from "../../src/apps/editor/editor-form";
import { projectLyrics } from "../../src/modules/lyrics/lyric-score";
import {
  readCanonical,
  writeCanonical,
} from "../../src/modules/score/canonical-xml";
import { removeLyricVoices } from "../../src/modules/score/canonical-lyric-voice";

function song(): Song {
  return {
    version: 1,
    id: "precision",
    title: "가사 정밀도",
    bpm: 60,
    firstBeat: 0,
    measures: [
      {
        id: "m1",
        regionId: "r1",
        label: "1",
        beats: 4,
        denominator: 4,
        start: 0,
        end: 4,
      },
    ],
    regions: [{ id: "r1", page: 0, x: 0, y: 0, w: 1, h: 1, beatXs: [] }],
    lyrics: [
      {
        id: "lyric",
        text: "가",
        time: 0,
        end: 0,
        confirmed: false,
        scorePosition: {
          measureId: "m1",
          quarterOffset: 1 / 16,
          durationQuarters: 1 / 16,
        },
      },
    ],
    markers: [],
    loops: [],
    settings: defaults(),
    audioName: "",
    pdfName: "",
    pageCount: 1,
  };
}

afterEach(() => document.body.replaceChildren());

it("rescales drum timing exactly and round-trips the first and final 64th-note lyric", () => {
  const s = song();
  s.lyrics.push({
    ...s.lyrics[0],
    id: "last",
    text: "나",
    confirmed: true,
    scorePosition: {
      measureId: "m1",
      quarterOffset: 63 / 16,
      durationQuarters: 1 / 16,
    },
  });
  projectLyrics(s);
  // Divisions 12 carries the existing triplet offset but cannot encode 1/16 quarter.
  const base = `<score-partwise version="4.0">
    <part-list><score-part id="P1"><part-name>Drums</part-name></score-part></part-list>
    <part id="P1"><measure number="1">
      <attributes><divisions>12</divisions><time><beats>4</beats><beat-type>4</beat-type></time></attributes>
      <direction><direction-type><words>poco</words></direction-type><offset>4</offset></direction>
      <note><unpitched><display-step>F</display-step><display-octave>4</display-octave></unpitched><duration>48</duration><voice>1</voice><type>whole</type></note>
      <backup><duration>48</duration></backup>
      <forward><duration>4</duration><voice>2</voice></forward>
      <note><rest/><duration>8</duration><voice>2</voice><type>quarter</type><time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification></note>
      <forward><duration>36</duration><voice>2</voice></forward>
    </measure></part>
  </score-partwise>`;
  const xml = writeCanonical(s, base);
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const part = doc.querySelector("part")!;
  expect(part.querySelector("divisions")!.textContent).toBe("9600");
  expect(
    Array.from(part.querySelectorAll("note:has(lyric) > duration"), (e) =>
      Number(e.textContent),
    ),
  ).toEqual([600, 600]);
  removeLyricVoices(part);
  expect(
    Array.from(part.querySelectorAll("duration, offset"), (e) =>
      Number(e.textContent),
    ),
  ).toEqual([3200, 38400, 38400, 3200, 6400, 28800]);
  expect(part.querySelector("actual-notes")!.textContent).toBe("3");
  expect(part.querySelector("normal-notes")!.textContent).toBe("2");

  const copy = structuredClone(s);
  copy.lyrics = [];
  readCanonical(xml, copy);
  expect(copy.lyrics).toEqual(s.lyrics);
});

it.each([
  { name: "final 64th note", offset: 63 / 16, duration: 1 / 16 },
  { name: "triplet", offset: 1 / 3, duration: 2 / 3 },
])(
  "preserves $name timing when only text or confirmation changes",
  (rhythm) => {
    const s = song();
    s.lyrics[0].scorePosition = {
      measureId: "m1",
      quarterOffset: rhythm.offset,
      durationQuarters: rhythm.duration,
    };
    projectLyrics(s);
    const original = structuredClone(s.lyrics[0]);

    for (const id of editorFields) {
      const input = document.createElement("input");
      input.id = id;
      document.body.append(input);
    }
    const form = createEditorForm({
      song: () => s,
      selected: () => 0,
      edit: (mutate) => mutate(s),
      renderLyricEditor: vi.fn(),
      updateSongHeading: vi.fn(),
    });
    form.fillMetadata();
    const m = s.measures[0];
    for (const [id, value] of Object.entries({
      "measure-label": m.label,
      "measure-beats": String(m.beats),
      "measure-denominator": String(m.denominator),
      "measure-start": m.start.toFixed(3),
      "measure-end": m.end.toFixed(3),
      "beat-xs": "",
    }))
      (document.getElementById(id) as HTMLInputElement).value = value;

    const editor = document.createElement("div");
    editor.id = "lyric-editor";
    editor.dataset.lyric = original.id;
    document.body.append(editor);
    for (const [field, value] of Object.entries({
      text: original.text,
      "grid-measure": "m1",
      "grid-tick": String(rhythm.offset * 4),
      "duration-beats": String(rhythm.duration),
      confirmed: "false",
    })) {
      const input = document.createElement("input");
      input.dataset.field = field;
      input.value = value;
      if (field === "confirmed") input.type = "checkbox";
      editor.append(input);
    }
    expect(form.pendingEditorValues().lyrics).toHaveLength(0);
    editor.querySelector<HTMLInputElement>('[data-field="text"]')!.value = "나";
    form.flushEditorForm();
    expect(s.lyrics[0]).toEqual({ ...original, text: "나" });

    editor.querySelector<HTMLInputElement>(
      '[data-field="confirmed"]',
    )!.checked = true;
    form.flushEditorForm();
    expect(s.lyrics[0]).toEqual({ ...original, text: "나", confirmed: true });
  },
);
