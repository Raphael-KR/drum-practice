import { parsers } from "prettier/plugins/markdown";

// Reuse the installed Markdown parser: fenced examples and inline code are not links.
// This also handles reference links, setext headings and destinations with parentheses.
export async function markdownDocument(source) {
  const ast = await parsers.markdown.parse(source, {});
  const anchors = new Set();
  const headings = [];
  const links = [];
  const usedSlugs = new Set();
  const explicitAnchors = [];

  function text(node) {
    if (node.type === "html") return "";
    if (node.children) return node.children.map(text).join("");
    return node.value ?? node.alt ?? "";
  }

  function visit(node) {
    if (node.type === "heading") {
      const title = text(node);
      const base = title
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\p{M}\-_ ]/gu, "")
        .replace(/ /g, "-");
      let id = base;
      let suffix = 0;
      while (usedSlugs.has(id)) id = `${base}-${++suffix}`;
      usedSlugs.add(id);
      anchors.add(id);
      headings.push({ id, title, position: node.position });
    }
    if (["link", "image", "definition"].includes(node.type)) {
      links.push({
        url: node.url,
        line: node.position.start.line,
        position: node.position,
      });
    }
    if (node.type === "html") {
      // Only actual tags, not commented-out HTML, provide explicit destinations.
      const html = node.value.replace(/<!--[\s\S]*?-->/g, "");
      for (const tag of html.matchAll(/<([a-z][\w-]*)\b([^<>]*)>/gi)) {
        for (const attr of tag[2].matchAll(
          /(?:^|\s)(id|name|href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
        )) {
          const value = attr[2] ?? attr[3] ?? attr[4];
          const name = attr[1].toLowerCase();
          if (
            name === "id" ||
            (name === "name" && tag[1].toLowerCase() === "a")
          ) {
            anchors.add(value);
            explicitAnchors.push({ id: value, position: node.position });
          } else if (name === "href" && tag[1].toLowerCase() === "a") {
            links.push({
              url: value,
              line: node.position.start.line,
              position: node.position,
            });
          }
        }
      }
    }
    for (const child of node.children ?? []) visit(child);
  }

  visit(ast);
  return { anchors, headings, explicitAnchors, links };
}
