import { writeThirdParty } from "./third-party.mjs";
await writeThirdParty();
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
const format = await build({
  entryPoints: ["src/playback-export.ts"],
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
  target: "es2022",
});
const { makePlaybackHTML, packCombinedPlayback } = await import(
  "data:text/javascript;base64," +
    Buffer.from(format.outputFiles[0].text).toString("base64")
);
const licenses = [
  "Drum Practice Web portable export. Includes SoundTouchJS 0.3.0 (LGPL-2.1).",
  "SoundTouchJS source: https://github.com/cutterbl/SoundTouchJS/tree/v0.3.0",
  await readFile("node_modules/soundtouchjs/LICENSE", "utf8"),
  "SoundTouchJS source included below for the bundled library:",
  await readFile("node_modules/soundtouchjs/dist/soundtouch.js", "utf8"),
].join("\n\n");

await mkdir("public", { recursive: true });
for (const kind of ["combined"]) {
  let runtimeMessageKeys = null;
  const options = {
    entryPoints: ["src/portable-player.ts"],
    plugins: [{
      name: "playback-ui-catalog",
      setup(bundler) {
        bundler.onLoad({filter: /locales[\\/]ko\.json$/}, async ({path}) => {
          const messages = JSON.parse(await readFile(path, "utf8"));
          const selected = Object.fromEntries(Object.entries(messages).filter(([key]) => runtimeMessageKeys?.has(key)));
          return {contents:JSON.stringify(selected), loader:"json"};
        });
        bundler.onLoad({filter: /ui-catalog\.json$/}, async ({path}) => {
          const catalog = JSON.parse(await readFile(path, "utf8"));
          // Export only definitions used by playback; management names stay in the app.
          catalog.components = catalog.components.filter(item => item.selectors.portable)
            .map(item => ({...item, selectors: {...item.selectors, web: ""}}));
          return {contents: JSON.stringify(catalog), loader: "json"};
        });
      },
    }],
    bundle: true,
    write: false,
    minify: true,
    metafile: true,
    format: "iife",
    platform: "browser",
    target: "es2022",
    legalComments: "inline",
    define: {
      "import.meta.url": '"file:///portable.html"',
    },
  };
  // Probe the tree-shaken runtime without message contents, then retain only surviving keys.
  const probe = await build(options);
  const allMessages = JSON.parse(await readFile("src/locales/ko.json", "utf8"));
  runtimeMessageKeys = new Set(Object.keys(allMessages).filter(key => probe.outputFiles[0].text.includes(JSON.stringify(key))));
  const runtime = await build(options);
  await writeFile(`docs/experiments/html-playback/${kind}-i18n-keys.json`, JSON.stringify([...runtimeMessageKeys],null,2));
  const inputs = Object.keys(runtime.metafile.inputs);
  const forbidden = inputs.filter((p) =>
    /src\/(main|workspace|score-management|storage|library-backup|canonical-xml|musicxml|pdf|editor-session|edit-history)\.ts$|node_modules\/(opensheetmusicdisplay|pdfjs-dist|jszip)\//.test(
      p,
    ),
  );
  if (forbidden.length)
    throw Error("Excluded modules bundled: " + forbidden.join(", "));
  const shell = {
    runtime: runtime.outputFiles[0].text,
    css:
      (await readFile("src/playback-base.css", "utf8")) +
      (await readFile("src/portable-player.css", "utf8")) +
      (await readFile("src/playback-ui.css", "utf8")) +
      (await readFile("src/help.css", "utf8")),
    worker: worker.outputFiles[0].text,
    licenses: licenses + "\n\n" + JSON.parse(await readFile("src/third-party.generated.json","utf8")).entries.filter(e => ["opensheetmusicdisplay","vexflow","Bravura pictHalfOpen1 glyph"].includes(e.name) || e.name.startsWith("PDF.js") || e.name === "pdfjs-dist").map(e=>`${e.name} ${e.version}\n${e.text}`).join("\n\n"),
  };
  await writeFile(
    `public/portable-${kind}.html`,
    makePlaybackHTML(shell, null),
  );
  await mkdir("docs/experiments/html-playback", { recursive: true });
  await writeFile(
    `docs/experiments/html-playback/${kind}-metafile.json`,
    JSON.stringify(runtime.metafile, null, 2),
  );
  if (kind === "combined") {
    await writeFile(
      "public/portable-template.html",
      makePlaybackHTML(shell, null),
    );
    if (process.argv.includes("--demo")) {
      const song = JSON.parse(await readFile("public/demo/song.json", "utf8"));
      const record = {
        song,
        pdf: new Blob([]),
        audio: new Blob([await readFile("public/demo/audio.mp3")], {
          type: "audio/mpeg",
        }),
        pages: await Promise.all(
          [1, 2, 3].map(
            async (n) =>
              new Blob([await readFile(`public/demo/page-${n}.png`)], {
                type: "image/png",
              }),
          ),
        ),
      };
      const data = await packCombinedPlayback(record);
      await mkdir("exports", { recursive: true });
      await writeFile(
        "exports/바람과 언덕의 발라드-드럼연습.html",
        makePlaybackHTML(shell, data),
      );
    }
  }
  console.log(
    `${kind}: ${Buffer.byteLength(makePlaybackHTML(shell, null))} bytes`,
  );
}
