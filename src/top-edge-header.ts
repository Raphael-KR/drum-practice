/** Keep Safari's initially sampled top-edge element connected across screen changes. */
export function renderKeepingTopHeader(root: HTMLElement, html: string) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const previous = root.querySelector<HTMLElement>(":scope > header");
  const next = template.content.querySelector<HTMLElement>(":scope > header")
    ?? Array.from(template.content.children).find((node) => node.tagName === "HEADER");
  if (!previous) {
    root.replaceChildren(template.content);
    return;
  }
  for (const attribute of Array.from(previous.attributes)) previous.removeAttribute(attribute.name);
  if (next) {
    for (const attribute of Array.from(next.attributes)) previous.setAttribute(attribute.name, attribute.value);
    previous.replaceChildren(...Array.from(next.childNodes));
    next.remove();
  } else previous.replaceChildren();
  // Never detach the sampled header, even briefly during synchronous rendering.
  for (const node of Array.from(root.childNodes)) if (node !== previous) node.remove();
  root.append(template.content);
}
