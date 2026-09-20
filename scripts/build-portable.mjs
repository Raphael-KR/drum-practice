import { writeBuildInfo } from "./build-info.mjs";
await writeBuildInfo();
import { build } from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const worker = await build({
  entryPoints: ["src/stretch-worker.ts"],
  bundle: true,
  write: false,
  minify: true,
  format: "iife",
  platform: "browser",
  target: "es2022",
  legalComments: "inline",
});
const runtime = await build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  write: false,
  minify: true,
  format: "iife",
  platform: "browser",
  target: "es2022",
  legalComments: "inline",
  define: {
    "import.meta.env.BASE_URL": '"./"',
    "import.meta.url": '"file:///portable.html"',
  },
  plugins: [
    {
      name: "portable-authoring-boundary",
      setup(b) {
        b.onLoad({ filter: /\.css$/ }, () => ({ contents: "", loader: "js" }));
        b.onResolve({ filter: /^\.\/musicxml$/ }, () => ({path: "musicxml", namespace: "portable-xml"}));
        b.onLoad({filter: /.*/, namespace: "portable-xml"}, () => ({contents: 'export async function renderMusicXML(){throw Error("MusicXML 가져오기는 원래 웹앱에서 해 주세요.")} export const readMusicXML=renderMusicXML; export const parseMusicXML=renderMusicXML;',loader: "js"}));
        b.onResolve({ filter: /^\.\/pdf$/ }, () => ({
          path: "pdf",
          namespace: "portable",
        }));
        b.onLoad({ filter: /.*/, namespace: "portable" }, () => ({
          contents:
            'export async function renderPDF(){throw Error("새 PDF 가져오기는 원래 웹앱에서 해 주세요.")}',
          loader: "js",
        }));
      },
    },
  ],
});
const format = await build({
  entryPoints: ["src/portable.ts"],
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
  target: "es2022",
});
const { makePortableHTML } = await import(
  "data:text/javascript;base64," +
    Buffer.from(format.outputFiles[0].text).toString("base64")
);
const licenses = [
  "Drum Practice Web portable export. Includes SoundTouchJS 0.3.0 (LGPL-2.1) and JSZip (MIT).",
  "SoundTouchJS source: https://github.com/cutterbl/SoundTouchJS/tree/v0.3.0",
  await readFile("node_modules/soundtouchjs/LICENSE", "utf8"),
  await readFile("node_modules/jszip/LICENSE.markdown", "utf8"),
  "SoundTouchJS source included below for the bundled library:",
  await readFile("node_modules/soundtouchjs/dist/soundtouch.js", "utf8"),
].join("\n\n");
const shell = {
  runtime: runtime.outputFiles[0].text,
  css: await readFile("src/style.css", "utf8"),
  worker: worker.outputFiles[0].text,
  licenses,
};
await mkdir("public", { recursive: true });
await writeFile("public/portable-template.html", makePortableHTML(shell, null));
if (process.argv.includes("--demo")) {
  const asset = async (path, type) => ({
    type,
    base64: (await readFile(path)).toString("base64"),
  });
  const song = JSON.parse(await readFile("public/demo/song.json", "utf8"));
  const data = {
    version: 1,
    song,
    pdf: await asset("public/demo/score.pdf", "application/pdf"),
    audio: await asset("public/demo/audio.mp3", "audio/mpeg"),
    pages: await Promise.all(
      [1, 2, 3].map((n) => asset(`public/demo/page-${n}.png`, "image/png")),
    ),
  };
  await mkdir("exports", { recursive: true });
  const output = "exports/바람과 언덕의 발라드-드럼연습.html";
  const html = makePortableHTML(shell, data);
  await writeFile(output, html);
  console.log(
    `${output}: ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MiB`,
  );
}
console.log("Portable template built; no runtime network dependencies.");
