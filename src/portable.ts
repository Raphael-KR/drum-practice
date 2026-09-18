import { validateSong, type Song } from "./model";
import type { RecordData } from "./storage";

export const isPortable =
  typeof document !== "undefined" && !!document.getElementById("portable-data");
interface Asset {
  type: string;
  base64: string;
}
export interface PortableSong {
  version: 1;
  song: Song;
  pdf: Asset;
  audio: Asset;
  pages: Asset[];
}
export interface PortableShell {
  runtime: string;
  css: string;
  worker: string;
  licenses: string;
}
async function encode(blob: Blob): Promise<Asset> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 32768)
    binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return {
    type: blob.type || "application/octet-stream",
    base64: btoa(binary),
  };
}
function decode(asset: Asset) {
  const binary = atob(asset.base64),
    bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: asset.type });
}
export async function packSong(record: RecordData): Promise<PortableSong> {
  validateSong(record.song);
  return {
    version: 1,
    song: structuredClone(record.song),
    pdf: await encode(record.pdf),
    audio: await encode(record.audio),
    pages: await Promise.all(record.pages.map(encode)),
  };
}
export function unpackSong(data: PortableSong): RecordData {
  if (data.version !== 1) throw Error("지원하지 않는 HTML 곡 파일입니다.");
  validateSong(data.song);
  if (data.pages.length !== data.song.pageCount)
    throw Error("악보 페이지가 누락되었습니다.");
  return {
    song: data.song,
    pdf: decode(data.pdf),
    audio: decode(data.audio),
    pages: data.pages.map(decode),
  };
}
function json(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
export function makePortableHTML(
  shell: PortableShell,
  data: PortableSong | null,
) {
  if (/<\/script/i.test(shell.runtime) || /<\/style/i.test(shell.css))
    throw Error("HTML 실행 코드 인코딩 오류");
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>드럼 연습 — 한 곡 파일</title><style id="portable-style">${shell.css}</style></head><body>
<div id="app"><main><h1>드럼 연습곡</h1><p>이 파일에는 음원·악보·가사와 실행 코드가 함께 들어 있습니다.</p><p>이 안내만 보이면 현재 앱이 JavaScript를 실행하지 않는 미리보기일 수 있습니다. JavaScript와 오디오를 지원하는 HTML 실행 앱 또는 웹 브라우저에서 여세요. iPad 파일 앱의 미리보기에서는 실행을 보장하지 않습니다.</p></main></div>
<script id="portable-data" type="application/json">${json(data)}</script>
<script id="portable-worker" type="application/json">${json(shell.worker)}</script>
<script id="portable-licenses" type="application/json">${json(shell.licenses)}</script>
<script id="portable-runtime">${shell.runtime}</script></body></html>`;
}
export function shellFromDocument(doc: Document): PortableShell {
  return {
    runtime: doc.getElementById("portable-runtime")!.textContent!,
    css: doc.getElementById("portable-style")!.textContent!,
    worker: JSON.parse(doc.getElementById("portable-worker")!.textContent!),
    licenses: JSON.parse(doc.getElementById("portable-licenses")!.textContent!),
  };
}
export function portableWorkerURL() {
  const source = document.getElementById("portable-worker");
  return source
    ? URL.createObjectURL(
        new Blob([JSON.parse(source.textContent!)], {
          type: "text/javascript",
        }),
      )
    : undefined;
}
