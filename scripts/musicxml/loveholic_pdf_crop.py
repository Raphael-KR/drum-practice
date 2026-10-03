"""Source-bound evidence for display-only Loveholic percussion-clef cropping.

Never changes the PDF, MusicXML, package or saved regions. The receiver must
match the complete original region fingerprint before applying a boundary.
"""
import argparse
import hashlib
import json
import math
import zipfile
from pathlib import Path

import pdfplumber
from PIL import Image, ImageDraw

from loveholic import PDF_SHA256, geometry, origin_y


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def review(folder, output):
    if output.exists():
        raise ValueError("Use a fresh evidence directory; existing results are preserved")
    pdf_path = folder / "source.pdf"
    package_path = folder / "Loveholic.drumscore"
    before = {name: digest(folder / name) for name in
              ["source.pdf", "source.mp3", "Loveholic-final.musicxml", "Loveholic.drumscore"]}
    if before["source.pdf"] != PDF_SHA256:
        raise ValueError("Unreviewed PDF")
    with zipfile.ZipFile(package_path) as archive:
        if archive.testzip() is not None:
            raise ValueError("Package CRC failed")
        manifest = json.loads(archive.read("manifest.json"))
        variants = [v for v in manifest["otherScores"] if v["format"] == "pdf"]
        if len(variants) != 1:
            raise ValueError("Ambiguous PDF variant")
        variant = variants[0]
        if hashlib.sha256(archive.read(variant["source"]["path"])).hexdigest() != PDF_SHA256:
            raise ValueError("Package PDF differs")
    bars = json.loads((folder / "extracted.json").read_text())
    vertical = json.loads((folder / "pdf-crop-systems.json").read_text())
    regions = variant["regions"]
    if len(regions) != len(bars) or len(regions) != 123:
        raise ValueError("Incomplete PDF region manifest")
    output.mkdir(parents=True)
    records = []
    thumbnails = []
    with pdfplumber.open(pdf_path) as pdf:
        systems = geometry(pdf)  # Independently re-read the current source PDF.
        pages = [Image.open(folder / f"source-poppler-{i}.png").convert("L")
                 for i in range(1, len(pdf.pages) + 1)]
        for system in systems:
            page = pdf.pages[system["page"] - 1]
            crop = next(c for c in vertical if c["page"] == system["page"]
                        and c["system"] == system["start"])
            bar = bars[system["start"] - 1]
            region = regions[system["start"] - 1]
            expected = dict(id=f"loveholic-pdf-r{system['start']}",
                            page=system["page"] - 1,
                            x=system["edges"][0] / page.width,
                            y=crop["top"] / page.height,
                            w=(system["edges"][1] - system["edges"][0]) / page.width,
                            h=(crop["bottom"] - crop["top"]) / page.height)
            if any(region[k] != v for k, v in expected.items()):
                raise ValueError(f"Package crop changed at system {system['start']}")
            clefs = [c for c in page.chars if c["text"] == "/" and "Opus" in c["fontname"]
                     and system["edges"][0] <= c["x0"] < system["edges"][1]
                     and abs(origin_y(page, c) - system["staff"] - 3 * system["spacing"]) < .2]
            if len(clefs) != 1:
                raise ValueError("Expected one source percussion-clef glyph")
            clef = clefs[0]
            protected = [c for c in page.chars if "Opus" in c["fontname"]
                         and c is not clef and clef["x1"] < c["x0"] < system["edges"][1]
                         and system["staff"] - 35 < origin_y(page, c) < system["staff"] + 28]
            nearest = min(c["x0"] for c in protected)
            left = (clef["x1"] + nearest) / 2
            if not clef["x1"] < left < nearest:
                raise ValueError("No safe horizontal boundary")
            if any(h["x"] <= left for e in bar["events"] for h in e["heads"]):
                raise ValueError("First note clipped")
            # Source vertical barlines are PDF line objects, not the clef text.
            lines = [l for l in page.lines if l["width"] < .01
                     and abs(l["top"] - system["staff"]) < .4
                     and abs(l["bottom"] - system["staff"] - 4 * system["spacing"]) < .4
                     and system["edges"][0] <= l["x0"] <= system["edges"][1]]
            if any(l["x0"] < left for l in lines):
                raise ValueError("Actual barline would be removed")
            raster = pages[system["page"] - 1]
            sx, sy = raster.width / page.width, raster.height / page.height
            # Check that the selected boundary passes through empty ink between
            # clef and first musical symbol. Staff lines themselves continue.
            boundary_px = round(left * sx)
            scan_ys = [y for y in range(math.ceil(system["staff"] * sy),
                                       math.floor((system["staff"] + 4 * system["spacing"]) * sy))
                       if all(abs(y - (system["staff"] + n * system["spacing"]) * sy) > 2
                              for n in range(5))]
            if any(raster.getpixel((x, y)) < 180 for x in range(boundary_px - 1, boundary_px + 2)
                   for y in scan_ys):
                raise ValueError("Boundary crosses non-staff ink")
            cut_x = left / page.width
            fraction = (cut_x - region["x"]) / region["w"]
            transformed = [(x - fraction) / (1 - fraction) for x in region["beatXs"]]
            if min(transformed) < 0:
                raise ValueError("Beat anchor would be clipped")
            for old, new in zip(region["beatXs"], transformed):
                assert abs(region["x"] + old * region["w"] -
                           (cut_x + new * (region["w"] - cut_x + region["x"]))) < 1e-12
            records.append(dict(system=system["start"],
                                sourceRegion={k: region[k] for k in ["id", "page", "x", "y", "w", "h"]},
                                left=cut_x, leftPt=left, pageWidthPt=page.width,
                                clefBoundsPt=[clef["x0"], clef["x1"]],
                                nearestProtectedGlyph={"text": min(protected, key=lambda c:c["x0"])["text"], "xPt":nearest},
                                firstNoteXPt=min(h["x"] for e in bar["events"] for h in e["heads"]),
                                transformedBeatXs=transformed,
                                checks="clef removed; first note/time signature/actual barlines preserved; beat page coordinates unchanged; raster boundary clear"))
            image = raster.crop((int((clef["x0"]-8)*sx), int((system["staff"]-12)*sy),
                                 int((nearest+20)*sx), int((system["staff"]+27)*sy))).convert("RGB")
            draw = ImageDraw.Draw(image)
            x = boundary_px - int((clef["x0"]-8)*sx)
            draw.line((x,0,x,image.height), fill="blue", width=2)
            image.thumbnail((250,140))
            thumbnails.append((system["start"], image))
    after = {name: digest(folder / name) for name in before}
    if before != after:
        raise ValueError("Source artifact changed during review")
    result = dict(status="PASS", sourcePDFSHA256=PDF_SHA256,
                  packageSHA256=before["Loveholic.drumscore"],
                  preservedSHA256=before, units="normalized original PDF page, zero-based page index",
                  application="PDF display only, exact sourceRegion fingerprint match required",
                  originalRegions=regions, crops=records,
                  systemsChecked=len(records), musicalDataChanged=False)
    (output / "loveholic-pdf-display-crops.json").write_text(json.dumps(result,ensure_ascii=False,indent=2))
    sheet = Image.new("RGB", (1040, math.ceil(len(thumbnails)/4)*170), "white")
    draw = ImageDraw.Draw(sheet)
    for index, (number, thumb) in enumerate(thumbnails):
        x,y=(index%4)*260,(index//4)*170
        draw.text((x+5,y+2),f"System {number}: blue = crop boundary",fill="black")
        sheet.paste(thumb,(x+5,y+22))
    sheet.save(output / "clef-boundary-contact-sheet.png")
    print(json.dumps(dict(status=result["status"],systems=len(records),regions=len(regions),
                          firstLeftPt=records[0]["leftPt"],otherLeftPt=records[1]["leftPt"],
                          preserved=before==after),indent=2))


if __name__ == "__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dir",type=Path,required=True)
    parser.add_argument("--out",type=Path,required=True)
    args=parser.parse_args()
    review(args.dir,args.out)
