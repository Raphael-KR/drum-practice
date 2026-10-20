/** Compressed storage cache; only decoded SVG becomes an image URL. */
export const SVG_GZIP = "application/vnd.drum-practice.svg+gzip";
export async function compressSVG(svg: string): Promise<Blob> {
  const data = new Blob([svg], { type: "image/svg+xml" });
  const bytes = await new Response(
    data.stream().pipeThrough(new CompressionStream("gzip")),
  ).arrayBuffer();
  return new Blob([bytes], { type: SVG_GZIP });
}
export async function displayPage(page: Blob): Promise<Blob> {
  if (page.type === SVG_GZIP) {
    const bytes = await new Response(
      page.stream().pipeThrough(new DecompressionStream("gzip")),
    ).arrayBuffer();
    return new Blob([bytes], { type: "image/svg+xml" });
  }
  return new Blob([await page.arrayBuffer()], { type: page.type });
}
export const pageExtension = (page: Blob) =>
  page.type === SVG_GZIP
    ? "svg.gz"
    : page.type === "image/svg+xml"
      ? "svg"
      : "png";
