export interface LyricGroupSource {
  id: string;
  text: string;
  /** Continuous, unscaled score X; row boundaries do not restart this coordinate. */
  x: number;
  /** Musical time in quarter notes from the score start. */
  start: number;
  end: number;
}
export interface LyricGroup extends LyricGroupSource {
  /** Production evidence only; do not serialize this into the canonical score. */
  sourceIds: string[];
}
/** Retain spelling and explicit hyphens; add a word separator only where needed. */
export function joinLyricText(left: string, right: string) {
  if (!left || !right) return left + right;
  const joined =
    /[\s-]$/u.test(left) ||
    /^\s/u.test(right) ||
    (/[\p{Script=Hangul}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]$/u.test(
      left,
    ) &&
      /^[\p{Script=Hangul}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(
        right,
      ));
  return left + (joined ? "" : " ") + right;
}
/** Group actual overlapping source text boxes, without reserving extra width.
 * Expanded group text is not fed back into collision detection: following groups
 * and line ends remain as authored until an actual case calls for a decision.
 */
export function groupLyrics(
  sources: readonly LyricGroupSource[],
  textWidth: (text: string) => number,
): LyricGroup[] {
  const result: LyricGroup[] = [];
  let right = -Infinity;
  for (const source of [...sources].sort((a, b) => a.start - b.start)) {
    const width = textWidth(source.text);
    if (
      ![source.x, source.start, source.end, width].every(Number.isFinite) ||
      width < 0
    )
      throw new Error(
        `Invalid lyric group input: id=${source.id}, x=${source.x}, start=${source.start}, end=${source.end}, width=${width}`,
      );
    const previous = result.at(-1);
    if (previous && source.x < right) {
      previous.text = joinLyricText(previous.text, source.text);
      previous.end = Math.max(previous.end, source.end);
      previous.sourceIds.push(source.id);
      right = Math.max(right, source.x + width);
    } else {
      result.push({ ...source, sourceIds: [source.id] });
      right = source.x + width;
    }
  }
  return result;
}
