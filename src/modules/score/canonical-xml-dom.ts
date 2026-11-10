// Small DOM operations shared by canonical metadata and lyric voice serialization.
export const xmlChildren = (e: Element, name: string) =>
  Array.from(e.children).filter((c) => c.localName === name);
export const xmlChild = (e: Element, name: string) => xmlChildren(e, name)[0];
export function xmlAdd(
  parent: Element,
  name: string,
  text?: string | number,
  attrs: Record<string, string> = {},
) {
  const e = parent.ownerDocument.createElement(name);
  if (text !== undefined) e.textContent = String(text);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  parent.append(e);
  return e;
}
