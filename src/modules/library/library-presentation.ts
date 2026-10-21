import type { ScoreCatalogEntry } from "./score-catalog";
import { readTitleOrder } from "./song-title";
import { RETIRED_SCORE_ID } from "../../platform/storage/score-database";
import { escapeHTML } from "../../shared/ui/html";
import { t } from "../../shared/i18n/i18n";
import { icon } from "../../shared/ui/icon-svg";
import { setIconButton } from "../../shared/ui/icon-button";
const FAVORITES_KEY = "drum-practice:favorite-scores";

/** Common card structure. Each host supplies only its action controls. */
export function libraryCardHTML(entry: ScoreCatalogEntry, actions = "") {
  return `<article class="practice-card" data-score-id="${escapeHTML(entry.id)}"><div class="practice-card-title"><h3>${escapeHTML(entry.record?.song.title ?? entry.bundled!.title)}</h3><p>${escapeHTML(entry.record?.song.artist || "")}</p></div><div class="practice-card-actions">${actions}</div></article>`;
}

export function syncCardTitleOrder(heading: Element) {
  const title = heading.querySelector("h3");
  const artist = heading.querySelector("p");
  if (title && artist)
    heading.prepend(readTitleOrder() === "artist-first" ? artist : title);
}
/** Shared ordering, title presentation and favorites; no score data is mutated. */
export function libraryPresentation(
  catalog: ScoreCatalogEntry[],
  sectionLists: HTMLElement[],
  favoriteList: HTMLElement,
  report: (error: unknown) => void,
) {
  const categories = new Map(
    catalog.map((entry) => [entry.id, entry.category]),
  );
  const listFor = (id: string) =>
    sectionLists[
      categories.get(id) === "basic"
        ? 0
        : categories.get(id) === "audio"
          ? 2
          : 1
    ];
  let favorites = new Set<string>();
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "[]",
    );
    if (Array.isArray(stored)) {
      favorites = new Set(
        stored.filter(
          (id): id is string =>
            typeof id === "string" && id !== RETIRED_SCORE_ID,
        ),
      );
      if (stored.includes(RETIRED_SCORE_ID))
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    }
  } catch {
    /* Invalid or unavailable preferences leave the score list usable. */
  }
  const sortFavorites = () => {
    const cards = [favoriteList, ...sectionLists].flatMap((list) =>
      Array.from(list.children),
    ) as HTMLElement[];
    cards.sort(
      (a, b) => Number(a.dataset.libraryOrder) - Number(b.dataset.libraryOrder),
    );
    for (const card of cards) {
      const id = card.dataset.scoreId!;
      (favorites.has(id) ? favoriteList : listFor(id)).append(card);
    }
    favoriteList.hidden = !favoriteList.childElementCount;
    for (const list of sectionLists)
      list.closest<HTMLElement>("section")!.hidden = !list.childElementCount;
  };
  const appendCard = (id: string, card: HTMLElement) => {
    card.dataset.scoreId = id;
    card.dataset.libraryOrder = String(
      catalog.findIndex((entry) => entry.id === id),
    );
    const heading = card.querySelector(".practice-card-title");
    if (heading) syncCardTitleOrder(heading);
    card.querySelectorAll<HTMLElement>("h3, p").forEach((text) => {
      text.title = text.textContent || "";
    });
    const favorite = document.createElement("button");
    favorite.type = "button";
    favorite.className = "library-favorite";
    const refreshFavorite = () => {
      setIconButton(
        favorite,
        icon("star"),
        t(favorites.has(id) ? "library.removeFavorite" : "library.addFavorite"),
      );
      favorite.setAttribute("aria-pressed", String(favorites.has(id)));
    };
    refreshFavorite();
    favorite.onclick = () => {
      const next = new Set(favorites);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
        favorites = next;
        refreshFavorite();
        sortFavorites();
        favorite.focus({ preventScroll: true });
      } catch (error) {
        report(error);
      }
    };
    card.prepend(favorite);
    listFor(id).append(card);
  };
  return { appendCard, sortFavorites };
}
