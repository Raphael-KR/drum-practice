import { xmlAdd, xmlChild, xmlChildren } from "./canonical-xml-dom";

/** Project titles onto the disposable XML copy and return whether to draw a subtitle. */
export function prepareEngravingTitles(document: Document): boolean {
  const root = document.documentElement;
  let work = xmlChild(root, "work");
  const original = (work && xmlChild(work, "work-title")?.textContent) || "";
  let movement = xmlChild(root, "movement-title");
  const displayField = root.querySelector(
    ':scope > identification > miscellaneous > miscellaneous-field[name="drum-practice:display-title"]',
  )?.textContent;
  const display = [displayField, movement?.textContent].find((text) =>
    text?.trim(),
  );
  const comparison = (text: string) => text.trim().normalize("NFC");
  const subtitle =
    display && comparison(original) !== comparison(display) ? original : "";

  // OSMD reads work-title as the title and movement-title as the subtitle.
  // Keep the original strings: normalization is only for the comparison above.
  if (!work)
    work = root.insertBefore(document.createElement("work"), root.firstChild);
  const title = xmlChild(work, "work-title") || xmlAdd(work, "work-title");
  title.textContent = display || original;
  if (subtitle.trim()) {
    if (!movement)
      movement = root.insertBefore(
        document.createElement("movement-title"),
        (xmlChild(root, "movement-number") || work).nextSibling,
      );
    movement.textContent = subtitle;
  } else movement?.remove();

  // OSMD also appends work-number to the subtitle; it is not a title.
  xmlChild(work, "work-number")?.remove();
  // Page credits must not override or restore the projected title/subtitle.
  for (const credit of xmlChildren(root, "credit"))
    if (
      xmlChildren(credit, "credit-type").some((type) =>
        ["title", "subtitle"].includes(type.textContent?.trim() || ""),
      )
    )
      credit.remove();
  return !!subtitle.trim();
}
