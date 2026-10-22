import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  it,
  vi,
} from "vitest";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { readScorePackage } from "../../src/modules/library/score-package";
import type { RecordData } from "../../src/model/record";
import {
  mountScoreReview,
  planScoreReview,
  REVIEW_ANCHOR_TOLERANCE_PX,
  type MountedScoreReview,
} from "../../tools/score-production/musicxml/common/review.mjs";

let ioi: RecordData;
let loveholic: RecordData;
let warmup: RecordData;
const dom = new JSDOM("<!doctype html><body></body>", {
  url: "http://127.0.0.1:5173/editor.html",
});
const blobs = new Map<string, Blob>();
const reviews: MountedScoreReview[] = [];
let decodeFailureAt = Infinity;
let decodeCount = 0;
const createURL = URL.createObjectURL.bind(URL);
const revokeURL = URL.revokeObjectURL.bind(URL);

// JSDOM has no image decoder or layout engine. Read dimensions from the existing
// real page bytes to exercise DOM construction; Safari must verify rendered ink.
class PackagePageImage {
  src = "";
  naturalWidth = 0;
  naturalHeight = 0;
  async decode() {
    if (++decodeCount === decodeFailureAt) throw Error("image decode failure");
    const blob = blobs.get(this.src)!;
    if (blob.type === "image/png") {
      const bytes = await blob.arrayBuffer();
      const view = new DataView(bytes);
      expect(view.getUint32(0)).toBe(0x89504e47);
      this.naturalWidth = view.getUint32(16);
      this.naturalHeight = view.getUint32(20);
    } else {
      expect(blob.type).toBe("image/svg+xml");
      const xml = new DOMParser().parseFromString(
        await blob.text(),
        "image/svg+xml",
      );
      expect(xml.querySelector("parsererror")).toBeNull();
      const view = xml.documentElement
        .getAttribute("viewBox")!
        .split(/\s+/)
        .map(Number);
      this.naturalWidth = view[2];
      this.naturalHeight = view[3];
    }
  }
}

beforeAll(async () => {
  vi.stubGlobal("document", dom.window.document);
  vi.stubGlobal("DOMParser", dom.window.DOMParser);
  vi.stubGlobal("XMLSerializer", dom.window.XMLSerializer);
  vi.stubGlobal("Image", PackagePageImage);
  // Only emulate native dialog lifecycle, never pretend JSDOM measures layout.
  dom.window.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  dom.window.HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
  const load = async (path: string) =>
    readScorePackage(new Blob([readFileSync(path)]));
  [ioi, loveholic, warmup] = await Promise.all([
    load(
      "data/production/ioi-suddenly-20261023/package-v1/ioi-suddenly.drumscore",
    ),
    load("public/scores/loveholic.drumscore"),
    load("public/scores/preplay-warmup.drumscore"),
  ]);
});
beforeEach(() => {
  decodeFailureAt = Infinity;
  decodeCount = 0;
  document.body.innerHTML =
    '<main id="editor"><button>기존 편집 화면</button></main>';
  vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
    if (!(blob instanceof Blob))
      throw Error("Review must create URLs only for page blobs");
    const url = createURL(blob);
    blobs.set(url, blob);
    return url;
  });
  vi.spyOn(URL, "revokeObjectURL").mockImplementation((url) => {
    blobs.delete(url);
    revokeURL(url);
  });
});
afterEach(() => {
  reviews.splice(0).forEach((review) => review.dispose());
  expect(blobs.size).toBe(0);
  vi.restoreAllMocks();
});
afterAll(() => {
  vi.unstubAllGlobals();
  dom.window.close();
});
async function mount(
  record: RecordData,
  options: Parameters<typeof mountScoreReview>[1] = {},
) {
  const review = await mountScoreReview(record, options);
  reviews.push(review);
  return review;
}

it("keeps actual source systems, including two, three and five measure rows", () => {
  const a = planScoreReview(ioi);
  expect(a.source.format).toBe("pdf");
  expect(a.alternateIndex).toBe(0);
  expect(a.groups.flat()).toEqual(ioi.song.measures.map((_, i) => i));
  expect(a.groups.map((g) => g.length)).toContain(2);
  expect(a.groups.map((g) => g.length)).toContain(3);
  expect(planScoreReview(loveholic).groups.map((g) => g.length)).toContain(5);
  expect(planScoreReview(warmup).source.format).toBe("musicxml");
  expect(planScoreReview(warmup).alternateIndex).toBeNull();
});

it("supports explicit numbers/IDs and alternate selection without changing source records", () => {
  const before = JSON.stringify(ioi);
  const result = planScoreReview(ioi, {
    measureGroups: [
      [1, ioi.song.measures[4].id, 93],
      [33, 34, 35],
    ],
    alternateIndex: 0,
  });
  expect(result.groups).toEqual([
    [0, 4, 92],
    [32, 33, 34],
  ]);
  expect(planScoreReview(ioi, { alternateIndex: null }).source.format).toBe(
    "musicxml",
  );
  expect(JSON.stringify(ioi)).toBe(before);
  expect(() => planScoreReview(ioi, { alternateIndex: 1 })).toThrow(
    "alternateIndex",
  );
  expect(() => planScoreReview(ioi, { alternateIndex: -1 })).toThrow(
    "alternateIndex=-1",
  );
  expect(() => planScoreReview(ioi, { measureGroups: [[94]] })).toThrow(
    "Unknown",
  );
  expect(() => planScoreReview(ioi, { measureGroups: [[1, 1]] })).toThrow(
    "Duplicate",
  );
  expect(() => planScoreReview(ioi, { measureGroups: [] })).toThrow("group");
});

it("fits mounted rows to the document viewport while honoring explicit widths and pure plan defaults", async () => {
  const viewport = vi.spyOn(document.documentElement, "clientWidth", "get");
  for (const [available, expected] of [
    [1024, 984],
    [1440, 1200],
    [220, 200],
  ]) {
    viewport.mockReturnValue(available);
    const review = await mount(warmup, {
      measureGroups: [[1]],
      showSVGPages: false,
    });
    expect(
      review.root.querySelector<HTMLElement>(".review-row")!.style.width,
    ).toBe(`${expected}px`);
    expect(planScoreReview(warmup).rowWidth).toBe(1200);
    review.dispose();
  }
  viewport.mockReturnValue(1024);
  const explicit = await mount(warmup, {
    measureGroups: [[1]],
    showSVGPages: false,
    rowWidth: 1200,
  });
  expect(
    explicit.root.querySelector<HTMLElement>(".review-row")!.style.width,
  ).toBe("1200px");
}, 30000);

it("renders all real PDF anchors and package SVG pages with explicit row/cell heights", async () => {
  const before = JSON.stringify(ioi);
  const review = await mount(ioi, { requirePDFAnchors: true });
  const report = review.report();
  expect(report.failures).toEqual([]);
  expect(report.anchors).toMatchObject({
    expected: 301,
    checked: 301,
    unanchored: 0,
  });
  expect(report.anchors.maxErrorPx).toBeLessThan(REVIEW_ANCHOR_TOLERANCE_PX);
  expect(report.svgPages).toHaveLength(ioi.pages.length);
  expect(report.layoutObserved).toBe(false);
  expect(report.status).toBe("unmeasured");
  expect(review.root.querySelectorAll(".measure")).toHaveLength(93);
  expect(review.root.querySelectorAll(".review-page")).toHaveLength(
    ioi.pages.length,
  );
  for (const row of review.root.querySelectorAll<HTMLElement>(".review-row")) {
    const height = parseFloat(row.style.height);
    for (const measure of row.querySelectorAll<HTMLElement>(".measure")) {
      const crop = measure.querySelector<HTMLElement>(".crop")!;
      const lyrics = measure.querySelector<HTMLElement>(".lyrics")!;
      expect(parseFloat(measure.style.height)).toBeGreaterThan(
        parseFloat(crop.style.height),
      );
      expect(height).toBeGreaterThan(parseFloat(measure.style.height));
      expect(parseFloat(lyrics.style.top)).toBeGreaterThan(
        parseFloat(crop.style.height),
      );
      expect(measure.querySelector(".label")?.textContent).toContain("마디");
    }
  }
  expect(JSON.stringify(ioi)).toBe(before);
}, 30000);

it("detects missing rendered anchors and incorrect coordinates, accepting CSS decimal serialization", async () => {
  const review = await mount(ioi, {
    measureGroups: [[9, 10, 11]],
    requirePDFAnchors: true,
  });
  const span = review.root.querySelector<HTMLElement>(
    '[data-pdf-lyric-anchor="true"]',
  )!;
  expect(span).not.toBeNull();
  const left = parseFloat(span.style.left);
  span.style.left = `${Number(left.toFixed(4))}px`;
  expect(review.report().failures).toEqual([]);
  span.style.left = `${left + 3}px`;
  expect(
    review.report().failures.some((f) => f.code === "anchor-position-error"),
  ).toBe(true);
  span.style.left = `${left}px`;
  span.removeAttribute("data-pdf-lyric-anchor");
  expect(
    review.report().failures.some((f) => f.code === "anchor-not-rendered"),
  ).toBe(true);
}, 30000);

it("detects omitted source anchors and stale musical positions in an existing score", async () => {
  const source = ioi.otherScores![0];
  const originalRegion = source.regions.find((r) => r.lyricAnchors?.length)!;
  const regionIndex = source.regions.indexOf(originalRegion);
  const firstAnchor = originalRegion.lyricAnchors![0];
  const measure =
    source.measures.findIndex((m) => m.regionId === originalRegion.id) + 1;
  for (const stale of [false, true]) {
    const regions = structuredClone(source.regions);
    if (stale) regions[regionIndex].lyricAnchors![0].quarterOffset += 0.25;
    else regions[regionIndex].lyricAnchors!.shift();
    const record = { ...ioi, otherScores: [{ ...source, regions }] };
    const review = await mount(record, {
      measureGroups: [[measure]],
      requirePDFAnchors: true,
    });
    expect(review.report().failures).toContainEqual(
      expect.objectContaining({
        code: stale ? "anchor-score-position-mismatch" : "anchor-missing",
        lyricId: firstAnchor.lyricId,
      }),
    );
    review.dispose();
  }
}, 30000);

it("fails an insufficient parent or row allocation instead of claiming overlapping rows are valid", async () => {
  const review = await mount(ioi, {
    measureGroups: [
      [9, 10],
      [11, 12],
    ],
    showSVGPages: false,
  });
  expect(review.report().failures).toEqual([]);
  const cell = review.root.querySelector<HTMLElement>(".measure")!;
  const row = review.root.querySelector<HTMLElement>(".review-row")!;
  const previous = cell.style.height;
  cell.style.height = "1px";
  expect(review.report().status).toBe("failed");
  expect(
    review.report().failures.some((f) => f.code === "row-height-insufficient"),
  ).toBe(true);
  cell.style.height = previous;
  row.style.height = "1px";
  expect(
    review.report().failures.some((f) => f.code === "row-height-insufficient"),
  ).toBe(true);
}, 30000);

it("disposes only its temporary DOM and object URLs, preserving the editor node and listeners", async () => {
  const original = document.body.firstElementChild;
  const html = document.body.innerHTML;
  const button = document.querySelector("button")!;
  const click = vi.fn();
  button.addEventListener("click", click);
  button.focus();
  const review = await mount(warmup, {
    measureGroups: [[1, 2, 3]],
    showSVGPages: false,
  });
  expect(blobs.size).toBeGreaterThan(0);
  expect(review.report().anchors.expected).toBe(0);
  const replacement = await mount(warmup, {
    measureGroups: [[4, 5]],
    showSVGPages: false,
  });
  expect(review.report().status).toBe("disposed");
  expect(
    document.querySelectorAll("[data-score-production-review]"),
  ).toHaveLength(1);
  replacement.dispose();
  replacement.dispose();
  expect(blobs.size).toBe(0);
  expect(document.body.firstElementChild).toBe(original);
  expect(document.body.innerHTML).toBe(html);
  expect(document.activeElement).toBe(button);
  button.click();
  expect(click).toHaveBeenCalledOnce();
}, 30000);

it("releases already-created URLs and preserves an existing review when page decoding fails", async () => {
  const review = await mount(ioi, {
    measureGroups: [[1]],
    showSVGPages: false,
  });
  const liveURLs = [...blobs.keys()];
  const html = document.body.innerHTML;
  decodeFailureAt = decodeCount + 2;
  await expect(mountScoreReview(ioi)).rejects.toThrow("decode failed");
  expect([...blobs.keys()]).toEqual(liveURLs);
  expect(document.body.innerHTML).toBe(html);
  expect(review.element.isConnected).toBe(true);
}, 30000);
