import argparse, json
from pathlib import Path
import verovio

p = argparse.ArgumentParser()
p.add_argument("input", type=Path)
p.add_argument("--out", type=Path, required=True)
a = p.parse_args()
a.out.mkdir(parents=True, exist_ok=True)
v = verovio.toolkit()
v.setOptions(
    {
        "inputFrom": "musicxml",
        "breaks": "encoded",
        "pageWidth": 2100,
        "pageHeight": 2970,
        "scale": 45,
        "adjustPageHeight": True,
        "header": "none",
        "footer": "none",
        "svgViewBox": True,
    }
)
assert v.loadFile(str(a.input))
for page in range(1, v.getPageCount() + 1):
    path = a.out / f"page-{page}.svg"
    svg = v.renderToSVG(page).replace(
        'font-family="Times, serif"', 'font-family="YuMincho, serif"'
    )
    svg = svg.replace(
        '<tspan font-size="405px">サビ</tspan>', '<tspan font-size="280px">サビ</tspan>'
    )
    path.write_text(svg)
    try:
        import cairosvg

        cairosvg.svg2png(
            url=str(path),
            write_to=str(path.with_suffix(".png")),
            scale=2,
            background_color="white",
        )
    except (ImportError, OSError) as e:
        print("PNG unavailable:", e)
(a.out / "render.json").write_text(
    json.dumps(
        {
            "verovio": v.getVersion(),
            "pages": v.getPageCount(),
            "log": v.getLog(),
            "text_font": "YuMincho (SVG text family only; Japanese rehearsal label fitted to existing box; music glyph paths unchanged)",
        },
        indent=2,
    )
)
print(a.out, v.getPageCount())
