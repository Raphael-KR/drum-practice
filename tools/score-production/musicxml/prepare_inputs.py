"""Preserve inputs and optionally render source PDF pages for a fresh run.

This renders the supplied PDF for review; it does not create an output PDF.
"""
import argparse
import json
import shutil
import subprocess
from pathlib import Path
from common.artifacts import sha, require_equal


def prepare(pdf, audio, out, dpi=None):
    out.mkdir(parents=True, exist_ok=False)
    report = {'pdf':str(pdf.resolve()), 'pdf_sha256':sha(pdf)}
    target=out/'source.pdf'
    shutil.copyfile(pdf,target)
    require_equal(sha(target),report['pdf_sha256'],'PDF copy digest')
    if audio is not None:
        target=out/('source'+audio.suffix)
        report.update(audio=str(audio.resolve()),audio_sha256=sha(audio))
        shutil.copyfile(audio,target)
        require_equal(sha(target),report['audio_sha256'],'Audio copy digest')
        report['audioInfo']=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(audio)]))
    if dpi is not None:
        subprocess.run(['pdftoppm','-png','-r',str(dpi),str(pdf),str(out/'source-poppler')],check=True)
    report['copies']={p.name:sha(p) for p in out.iterdir() if p.is_file()}
    (out/'provenance.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    return report


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pdf',type=Path,required=True)
    parser.add_argument('--audio',type=Path)
    parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('--raster-dpi',type=int)
    args=parser.parse_args()
    prepare(args.pdf,args.audio,args.out,args.raster_dpi)
