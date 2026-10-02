import { createDialog } from "./dialog-ui";
import { fullScoreLabels } from "./full-score-labels";
import { t } from "./i18n";
import type { Song } from "./model";
import { displayPage } from "./score-pages";

interface Options {
  root: HTMLElement;
  controls: HTMLElement;
  song: Song;
  scores: { song: Song; pages: Blob[] }[];
  fail(error: unknown): void;
}
/** Read completed pages directly. This viewer has no engraving or authoring dependencies. */
export function installScoreReader(options: Options) {
  const dialog = createDialog(
    "runtime-score-reader",
    "",
    "score-reader-dialog",
    options.root,
  );
  const body = document.createElement("div");
  body.className = "score-reader-pages";
  dialog.append(body);
  let generation = 0,
    disposed = false,
    urls: string[] = [];
  const release = () => {
    generation++;
    urls.splice(0).forEach((url) => URL.revokeObjectURL(url));
    body.replaceChildren();
  };
  dialog.addEventListener("close", () => {
    if (!dialog.open) release();
  });
  function title(text: string) {
    dialog.querySelector("h2")!.textContent = text;
    dialog.setAttribute("aria-label", text);
  }
  const buttons: HTMLButtonElement[] = [];
  function button(id: string, label: string, run: () => void | Promise<void>) {
    const b = document.createElement("button");
    b.id = id;
    b.type = "button";
    b.textContent = label;
    b.className = "score-reader-action";
    b.onclick = () => {
      Promise.resolve().then(run).catch(options.fail);
    };
    options.controls.append(b);
    buttons.push(b);
  }
  for (const score of options.scores) {
    if (!score.pages.length) continue;
    const svg = score.song.scoreFormat === "musicxml";
    const label = t(svg ? "score-management.message503" : "main.message206");
    button(svg ? "runtime-full-svg" : "runtime-full-pdf", label, async () => {
      release();
      const current = generation;
      const prepared: string[] = [];
      buttons.forEach((b) => (b.disabled = true));
      try {
        const fragment = document.createDocumentFragment();
        for (const [index, page] of score.pages.entries()) {
          const decoded = await displayPage(page);
          if (disposed || generation !== current) return;
          const url = URL.createObjectURL(decoded);
          prepared.push(url);
          const figure = document.createElement("figure");
          const caption = document.createElement("figcaption");
          caption.textContent = t("score-management.message505", {
            value1: index + 1,
            value2: score.pages.length,
          });
          const surface = document.createElement("div");
          surface.className = "score-reader-surface";
          const image = document.createElement("img");
          image.src = url;
          image.alt = `${label} · ${index + 1}`;
          surface.append(image);
          if (svg)
            for (const position of fullScoreLabels(await decoded.text())) {
              const number = document.createElement("span");
              number.className = "score-reader-measure";
              number.textContent = position.label;
              number.setAttribute(
                "aria-label",
                t("marker-slots.message378", { value1: position.label }),
              );
              number.style.left = `${position.left}%`;
              number.style.top = `${position.top}%`;
              surface.append(number);
            }
          figure.append(caption, surface);
          fragment.append(figure);
        }
        if (disposed || generation !== current) return;
        urls = prepared.splice(0);
        body.replaceChildren(fragment);
        title(label);
        dialog.showModal();
        dialog.scrollTop = 0;
      } finally {
        prepared.forEach((url) => URL.revokeObjectURL(url));
        if (!disposed) buttons.forEach((b) => (b.disabled = false));
      }
    });
  }
  if (options.song.lyricText || options.song.measureLyrics?.length || options.song.lyrics?.length) {
    const label = t("score-management.message487");
    button("runtime-full-lyrics", label, () => {
      release();
      title(label);
      const lyrics = document.createElement("p");
      lyrics.className = "score-reader-lyrics";
      lyrics.textContent =
        options.song.lyricText ||
        (options.song.measureLyrics?.length
          ? options.song.measures.flatMap(m => options.song.measureLyrics!.filter(l => l.measureId === m.id).map(l => l.text)).join("\n")
          : options.song.lyrics.map((l) => l.text).join(" "));
      body.append(lyrics);
      dialog.showModal();
      dialog.scrollTop = 0;
    });
  }
  return {
    dispose() {
      disposed = true;
      release();
      buttons.forEach((b) => b.remove());
      dialog.remove();
    },
  };
}
