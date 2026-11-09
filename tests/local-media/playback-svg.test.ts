import { beforeAll, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { JSDOM } from "jsdom";
import { readScorePackage } from "../../src/modules/library/score-package";
import { displayPage } from "../../src/modules/score/score-pages";
import { parsePlaybackSVG } from "../../src/modules/playback/playback-svg";

let source: string;
beforeAll(async () => {
  const { window } = new JSDOM();
  Object.assign(globalThis, {
    DOMParser: window.DOMParser,
    XMLSerializer: window.XMLSerializer,
    document: window.document,
  });
  const record = await readScorePackage(
    new Blob([
      readFileSync(
        "data/production/red-sunset/final/build-03/red-sunset.drumscore",
      ),
    ]),
  );
  source = await (await displayPage(record.pages[0])).text();
});
const serializedHash = (doc: Document) =>
  createHash("sha256")
    .update(new XMLSerializer().serializeToString(doc))
    .digest("hex");

it("preserves the actual production SVG and timeline while parsing less XML", () => {
  const expected = new DOMParser().parseFromString(source, "image/svg+xml");
  const parse = vi.spyOn(DOMParser.prototype, "parseFromString");
  let actual: Document;
  try {
    actual = parsePlaybackSVG(source);
    expect(parse).toHaveBeenCalledTimes(1);
    expect(String(parse.mock.calls[0][0]).length).toBeLessThan(
      source.length / 2,
    );
  } finally {
    parse.mockRestore();
  }
  expect(actual!.querySelector("parsererror")).toBeNull();
  expect(serializedHash(actual!)).toBe(serializedHash(expected));
  expect(actual!.querySelector("metadata")!.textContent).toBe(
    expected.querySelector("metadata")!.textContent,
  );
});

const metadata = '<metadata data-ribbon-timeline="1">';
const variants: [string, (svg: string) => string][] = [
  ["unknown entity", (svg) => svg.replace(metadata, metadata + "&unknown;")],
  ["numeric entity", (svg) => svg.replace(metadata, metadata + "&#13;")],
  ["carriage return", (svg) => svg.replace(metadata, metadata + "\r")],
  ["null", (svg) => svg.replace(metadata, metadata + String.fromCharCode(0))],
  ["surrogate", (svg) => svg.replace(metadata, metadata + "\uD800")],
  ["CDATA close", (svg) => svg.replace(metadata, metadata + "]]>")],
  ["placeholder", (svg) => svg.replace(metadata, metadata + "drum-svg-text:")],
  [
    "comment",
    (svg) =>
      svg.replace(metadata, "<!-- unchanged character data -->" + metadata),
  ],
  [
    "CDATA",
    (svg) =>
      svg.replace(metadata, metadata + "<![CDATA[<style>unchanged</style>]]>"),
  ],
  [
    "standard entities",
    (svg) => svg.replace(metadata, metadata + "&amp;lt;&quot;&apos;😀"),
  ],
  [
    "encoded duplicate placeholder",
    (svg) =>
      svg.replace(
        "</svg>",
        '<metadata data-ribbon-timeline="1">drum&#45;svg&#45;text:0</metadata></svg>',
      ),
  ],
];
it.each(variants)(
  "retains native XML semantics for %s in the production SVG",
  (_name, change) => {
    const input = change(source);
    const expected = new DOMParser().parseFromString(input, "image/svg+xml");
    const actual = parsePlaybackSVG(input);
    // Parser-error text may quote the original input differently; its presence
    // must agree. Valid documents must remain byte-identical after serialization.
    expect(!!actual.querySelector("parsererror")).toBe(
      !!expected.querySelector("parsererror"),
    );
    if (!expected.querySelector("parsererror"))
      expect(serializedHash(actual)).toBe(serializedHash(expected));
  },
);
