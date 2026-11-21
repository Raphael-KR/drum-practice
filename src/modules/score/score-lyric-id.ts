/** Canonical identity travels with the native SVG label, independently of its text or geometry. */
export function lyricSVGClass(id: string) {
  return (
    "score-lyric-" +
    Array.from(new TextEncoder().encode(id), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("")
  );
}
