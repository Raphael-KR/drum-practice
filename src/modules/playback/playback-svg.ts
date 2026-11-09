const placeholder = "drum-svg-text:";

/** Decode only plain XML character data; unusual XML stays on the native path. */
function plainText(text: string): string | undefined {
  if (text.includes("]]>") || /&(?!amp;|lt;|gt;|quot;|apos;)/.test(text))
    return;
  for (const [character] of text.matchAll(/[\p{Cc}\p{Cs}\uFFFE\uFFFF]/gu))
    if (character !== "\t" && character !== "\n") return;
  const entities: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
  };
  return text.replace(
    /&(amp|lt|gt|quot|apos);/g,
    (_, name: string) => entities[name],
  );
}

/**
 * Parse markup once without tokenizing megabytes of font CSS/timeline JSON.
 * Restore every character before callers inspect the document. This is a text
 * transport optimization, never a font allowlist or a replacement for validation.
 */
export function parsePlaybackSVG(source: string): Document {
  const parse = (text: string) =>
    new DOMParser().parseFromString(text, "image/svg+xml");
  // Declarations, CDATA and comments may change where character data occurs.
  if (source.includes("<!") || source.includes(placeholder))
    return parse(source);
  const texts = new Map<string, string>();
  const markup = source.replace(
    /(<(style|metadata) data-(?:score-font|ribbon-timeline)="[^"]*">)([^<]*)(<\/\2>)/g,
    (
      whole: string,
      open: string,
      _tag: string,
      body: string,
      close: string,
    ) => {
      if (body.length < 16_384) return whole;
      const text = plainText(body);
      if (text === undefined) return whole;
      const token = `${placeholder}${texts.size}`;
      texts.set(token, text);
      return open + token + close;
    },
  );
  const doc = parse(markup);
  if (!texts.size) return doc;
  if (!doc.querySelector("parsererror")) {
    const elements = new Map<string, Element>();
    for (const node of doc.querySelectorAll(
      "style[data-score-font],metadata[data-ribbon-timeline]",
    )) {
      const token = node.textContent || "";
      if (!node.childElementCount && texts.has(token)) {
        if (elements.has(token)) return parse(source);
        elements.set(token, node);
      }
    }
    if (elements.size === texts.size) {
      for (const [token, text] of texts)
        elements.get(token)!.textContent = text;
      return doc;
    }
  }
  // Preserve native parsing/error semantics if the expected text nodes differ.
  return parse(source);
}
