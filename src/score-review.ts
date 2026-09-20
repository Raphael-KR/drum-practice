import { markedMeasureIndices } from './marker-slots';
import { detectStaff } from "./staff-geometry";
import { locate, xAtBeat, type Song } from "./model";
import { songScores, type ScoreVariant } from "./song-scores";
import type { RecordData } from "./storage";
import { displayPage } from "./score-pages";
import { playbackPosition } from "./playback-position";

export function reviewPair(record: RecordData): [ScoreVariant, ScoreVariant] {
  const scores = songScores(record),
    pdf = scores.find((s) => s.format === "pdf"),
    xml = scores.find((s) => s.format === "musicxml");
  if (!pdf || !xml)
    throw Error("이 곡에 PDF와 MusicXML 악보를 모두 추가해 주세요.");
  for (const s of [pdf, xml]) {
    if (
      s.measures.length !== record.song.measures.length ||
      s.measures.some(
        (m, i) =>
          m.id !== record.song.measures[i].id ||
          m.beats !== record.song.measures[i].beats ||
          m.denominator !== record.song.measures[i].denominator ||
          !s.regions.some(
            (r) => r.id === m.regionId && r.page < s.pages.length,
          ),
      )
    )
      throw Error("두 악보의 마디 구성이 달라 비교할 수 없습니다.");
  }
  return [pdf, xml];
}
export class ScoreReview {
  private urls: string[] = [];
  private images: HTMLImageElement[][] = [];
  private staffs: { top: number; gap: number }[][] = [];
  private base = document.createElement("canvas");
  private window = -1;
  private markerKey = "";
  private width = 0;
  private height = 0;
  private scale = 2;
  constructor(
    private canvas: HTMLCanvasElement,
    private song: Song,
    private pair: [ScoreVariant, ScoreVariant],
  ) {}
  async load() {
    this.images = await Promise.all(
      this.pair.map((s) =>
        Promise.all(
          s.pages.map(async (b) => {
            const url = URL.createObjectURL(await displayPage(b));
            this.urls.push(url);
            const image = new Image();
            image.src = url;
            await image.decode();
            return image;
          }),
        ),
      ),
    );
    const analyze = (expected?: number[][]) =>
      this.pair.map((score, row) =>
        score.measures.map((m) => {
          const r = score.regions.find((r) => r.id === m.regionId)!,
            image = this.images[row][r.page];
          const c = document.createElement("canvas");
          c.width = Math.max(1, Math.round(r.w * image.naturalWidth));
          c.height = Math.max(1, Math.round(r.h * image.naturalHeight));
          const ctx = c.getContext("2d", { willReadFrequently: true })!;
          ctx.drawImage(
            image,
            r.x * image.naturalWidth,
            r.y * image.naturalHeight,
            r.w * image.naturalWidth,
            r.h * image.naturalHeight,
            0,
            0,
            c.width,
            c.height,
          );
          const staff = detectStaff(
            ctx.getImageData(0, 0, c.width, c.height).data,
            c.width,
            c.height,
            expected?.[row][r.page],
          );
          if (!staff)
            throw Error(
              `${row ? "SVG" : "PDF"} ${m.id}마디의 오선 위치를 찾지 못했습니다.`,
            );
          const ratio = (r.h * image.naturalHeight) / c.height;
          return { top: staff.top * ratio, gap: staff.gap * ratio };
        }),
      );
    const initial = analyze();
    const expected = this.pair.map((score, row) =>
      score.pages.map((_, page) => {
        const gaps = score.measures
          .flatMap((m, i) =>
            score.regions.find((r) => r.id === m.regionId)!.page === page
              ? [initial[row][i].gap]
              : [],
          )
          .sort((a, b) => a - b);
        return gaps[Math.floor(gaps.length / 2)];
      }),
    );
    this.staffs = analyze(expected);
  }

  dispose() {
    this.urls.forEach((u) => URL.revokeObjectURL(u));
    this.urls = [];
  }
  draw(time: number) {
    if (!this.images.length) return;
    const w = Math.max(320, this.canvas.clientWidth),
      h = Math.max(220, this.canvas.clientHeight),
      loc = locate(this.song, time),
      start = Math.floor(loc.index / 4) * 4;
    const marked=markedMeasureIndices(this.song), markerKey=[...marked].join(",");
    if (start !== this.window || w !== this.width || h !== this.height || markerKey !== this.markerKey) {
      this.markerKey=markerKey;
      this.window = start;
      this.width = w;
      this.height = h;
      this.canvas.width = this.base.width = Math.round(w * this.scale);
      this.canvas.height = this.base.height = Math.round(h * this.scale);
      const c = this.base.getContext("2d")!;
      c.scale(this.scale, this.scale);
      c.fillStyle = "white";
      c.fillRect(0, 0, w, h);
      c.fillStyle = "#233047";
      c.font = "bold 16px system-ui";
      c.fillText(
        `${this.song.artist ? this.song.artist + " - " : ""}${this.song.title}`,
        12,
        23,
        w - 24,
      );
      const rowH = (h - 62) / 2,
        cellW = (w - 24) / 4,
        staffGap = Math.min((rowH - 44) / 13, cellW / 25);
      this.pair.forEach((score, row) => {
        const y = 62 + row * rowH;
        c.fillStyle = "#3f74d4";
        c.font = "bold 13px system-ui";
        c.fillText(row ? "MusicXML · SVG" : "PDF", 12, y + 16);
        for (let j = 0; j < 4 && start + j < this.song.measures.length; j++) {
          const m = score.measures[start + j],
            r = score.regions.find((r) => r.id === m.regionId)!,
            image = this.images[row][r.page];
          const x = 12 + j * cellW,
            sw = r.w * image.naturalWidth,
            sh = r.h * image.naturalHeight,
            staff = this.staffs[row][start + j],
            scaleY = staffGap / staff.gap;
          c.fillStyle = "#627189";
          c.font = "12px system-ui";
          c.fillText(
            `${marked.has(start+j) ? "⚑ " : ""}${this.song.measures[start + j].label} 마디 · ${m.beats}/${m.denominator}`,
            x,
            y + 34,
          );
          c.save();
          c.beginPath();
          c.rect(x, y + 40, cellW, rowH - 40);
          c.clip();
          c.drawImage(
            image,
            r.x * image.naturalWidth,
            r.y * image.naturalHeight,
            sw,
            sh,
            x,
            y + 40 + 5 * staffGap - staff.top * scaleY,
            cellW,
            sh * scaleY,
          );
          c.restore();
          c.strokeStyle = "#d5dfed";
          c.beginPath();
          c.moveTo(x, y + 38);
          c.lineTo(x, y + rowH - 3);
          c.stroke();
        }
      });
    }
    const c = this.canvas.getContext("2d")!;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    c.drawImage(this.base, 0, 0);
    c.scale(this.scale, this.scale);
    c.fillStyle = "#3f74d4";
    c.font = "14px system-ui";
    c.fillText(
      `${playbackPosition(this.song, time).label} · 음원 ${time.toFixed(3)}초`,
      12,
      46,
    );
    const rowH = (h - 62) / 2,
      cellW = (w - 24) / 4,
      j = loc.index - start;
    this.pair.forEach((score, row) => {
      const m = score.measures[loc.index],
        r = score.regions.find((r) => r.id === m.regionId)!,
        x = 12 + j * cellW,
        y = 62 + row * rowH + 40;
      c.fillStyle = "rgba(63,116,212,0.10)";
      c.fillRect(x, y, cellW, rowH - 40);
      const px =
        x + xAtBeat(r, this.song.measures[loc.index], loc.beat) * cellW;
      c.strokeStyle = "#3f74d4";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(px, y);
      c.lineTo(px, y + rowH - 40);
      c.stroke();
    });
  }
  snapshot(time: number): Promise<Blob> {
    this.draw(time);
    // Copy pixels synchronously: later animation/seek cannot change this capture.
    const frozen = document.createElement("canvas");
    frozen.width = this.canvas.width;
    frozen.height = this.canvas.height;
    frozen.getContext("2d")!.drawImage(this.canvas, 0, 0);
    return new Promise((ok, no) =>
      frozen.toBlob(
        (b) => (b ? ok(b) : no(Error("악보 캡처에 실패했습니다."))),
        "image/png",
      ),
    );
  }
}
export function copyReviewImage(png: Promise<Blob>): Promise<void> {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined")
    return Promise.reject(
      Error(
        "이미지 복사를 지원하지 않는 환경입니다. 캡처 저장 버튼으로 이미지를 저장해 주세요.",
      ),
    );
  // Call clipboard.write inside the key/click gesture, including on Safari.
  return navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
}
