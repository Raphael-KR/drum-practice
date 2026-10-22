"""Read the identified I.O.I source; emit source geometry and musical events."""
import argparse
from collections import Counter
import json
from pathlib import Path

import pdfplumber
from common.artifacts import PROFILES, sha
from common.musescore_pdf import extract_measure, staff_geometry


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--pdf', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--systems', help='Comma-separated printed starts for representative evaluation')
    args = parser.parse_args()
    profile = json.loads((PROFILES / 'ioi-suddenly-source.json').read_text())
    if sha(args.pdf) != profile['pdf_sha256']:
        raise ValueError('Wrong I.O.I source PDF')
    selected = {int(value) for value in args.systems.split(',')} if args.systems else None
    with pdfplumber.open(args.pdf) as pdf:
        systems = staff_geometry(pdf, profile)
        if [system['start'] for system in systems] != profile['system_starts']:
            raise ValueError('Source layout differs from independently read system starts')
        bars = [extract_measure(pdf.pages[system['page']-1], system, left, right,
                                system['start']+offset, profile)
                for system in systems if selected is None or system['start'] in selected
                for offset, (left, right) in enumerate(zip(system['edges'], system['edges'][1:]))]
    args.out.mkdir(parents=True, exist_ok=False)
    (args.out / 'geometry.json').write_text(json.dumps(systems, ensure_ascii=False, indent=2))
    (args.out / 'extracted.json').write_text(json.dumps(bars, ensure_ascii=False, indent=2))
    counts = Counter(f'U+{ord(head["glyph"]):04X}:{head["pos"]}'
                     for bar in bars for event in bar['events'] for head in event['heads'])
    report = dict(pdf_sha256=profile['pdf_sha256'], systems=len(systems), measures=len(bars),
                  source_measures=profile['source_measures'], representative_systems=sorted(selected) if selected else None,
                  events=sum(len(bar['events']) for bar in bars), head_positions=dict(counts),
                  heads=sum(counts.values()), rests=sum(bool(event.get('rest')) for bar in bars for event in bar['events']),
                  issues=[dict(number=bar['number'], issues=bar['issues']) for bar in bars if bar['issues']])
    (args.out / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if report['issues']:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
