import { icon } from "../../shared/ui/icon-svg";
import { createDialog } from "../../shared/ui/dialog-ui";
import { fullScoreSurface, prepareFullScore } from "./full-score-view";
import { t } from "../../shared/i18n/i18n";
import type { Song } from "../../model/model";
import { displayPage } from "./score-pages";

interface Options {
  root: HTMLElement;
  controls: HTMLElement;
  song: Song;
  canonicalXML?: string;
  scores: { song: Song; pages: Blob[] }[];
  fail(error: unknown): void;
}
/** Read PDF pages or a continuous SVG; prepare the shared full-score layout lazily. */
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
    b.title = label;
    const badge = document.createElement("span");
    badge.className = "score-reader-action-icon";
    badge.innerHTML = icon(
      id === "runtime-full-svg"
        ? "library"
        : id === "runtime-full-pdf"
          ? "document"
          : "text",
    );
    const text = document.createElement("span");
    text.className = "score-reader-action-label";
    text.textContent = label;
    const arrow = document.createElement("span");
    arrow.className = "score-reader-action-arrow";
    arrow.innerHTML = icon("chevron");
    b.append(badge, text, arrow);
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
        const pages = svg
          ? (
              await prepareFullScore(
                options.song,
                options.canonicalXML,
                score.song.scorePartId,
              )
            ).pages
          : score.pages;
        if (disposed || generation !== current) return;
        const fragment = document.createDocumentFragment();
        for (const [index, page] of pages.entries()) {
          const decoded = await displayPage(page);
          if (disposed || generation !== current) return;
          const url = URL.createObjectURL(decoded);
          prepared.push(url);
          const surface = svg
            ? fullScoreSurface({
                url,
                alt: label,
              })
            : document.createElement("div");
          surface.classList.add("score-reader-surface");
          if (!svg) {
            const figure = document.createElement("figure");
            const caption = document.createElement("figcaption");
            caption.textContent = t("score-management.message505", {
              value1: index + 1,
              value2: pages.length,
            });
            const image = document.createElement("img");
            image.src = url;
            image.alt = `${label} · ${index + 1}`;
            surface.append(image);
            figure.append(caption, surface);
            fragment.append(figure);
          } else fragment.append(surface);
        }
        if (disposed || generation !== current) return;
        urls = prepared.splice(0);
        body.replaceChildren(fragment);
        title(label);
        dialog.showModal();
        body.scrollTop = 0;
      } finally {
        prepared.forEach((url) => URL.revokeObjectURL(url));
        if (!disposed) buttons.forEach((b) => (b.disabled = false));
      }
    });
  }
  if (
    options.song.lyricText ||
    options.song.measureLyrics?.length ||
    options.song.lyrics?.length
  ) {
    const label = t("score-management.message487");
    button("runtime-full-lyrics", label, () => {
      release();
      title(label);
      const lyrics = document.createElement("p");
      lyrics.className = "score-reader-lyrics";
      lyrics.textContent =
        options.song.lyricText ||
        (options.song.measureLyrics?.length
          ? options.song.measures
              .flatMap((m) =>
                options.song
                  .measureLyrics!.filter((l) => l.measureId === m.id)
                  .map((l) => l.text),
              )
              .join("\n")
          : options.song.lyrics.map((l) => l.text).join(" "));
      body.append(lyrics);
      dialog.showModal();
      body.scrollTop = 0;
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
