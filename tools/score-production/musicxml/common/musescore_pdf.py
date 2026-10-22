"""Calibrated MuseScore vector geometry, without song-specific interpretation.

Only the supplied source profile defines supported glyphs and line metrics.
Rhythm is decoded from stems, horizontal beams, flags and explicit rests;
horizontal spacing never determines note duration.
"""
from collections import Counter
from fractions import Fraction


def origin_y(page, char):
    return page.height - char['matrix'][5]


def staff_geometry(pdf, profile):
    systems = []
    number = 1
    for page_number, page in enumerate(pdf.pages, 1):
        staff_lines = [line for line in page.lines
                       if line['width'] > 15 and line['height'] < .01
                       and abs(line['linewidth'] - profile['staff_linewidth']) < .01]
        ys = sorted({round(line['top'], 4) for line in staff_lines})
        if len(ys) % 5:
            raise ValueError('Incomplete five-line staff')
        for index in range(0, len(ys), 5):
            top = ys[index]
            spacing = (ys[index + 4] - top) / 4
            if any(abs(ys[index + j] - top - j * spacing) > .01 for j in range(5)):
                raise ValueError('Uneven staff spacing')
            left = min(line['x0'] for line in staff_lines if abs(line['top'] - top) < .01)
            right = max(line['x1'] for line in staff_lines if abs(line['top'] - top) < .01)
            first_event = min(char['x0'] for char in page.chars
                              if char['text'] in profile['heads'] | profile['rests']
                              and top - 3 * spacing < origin_y(page, char) < top + 5 * spacing)
            verticals = [line for line in page.lines
                         if line['width'] < .01 and line['x0'] > first_event
                         and abs(line['top'] - (top - profile['staff_linewidth'] / 2)) < .03
                         and abs(line['height'] - (4 * spacing + profile['staff_linewidth'])) < .03]
            edges = [left]
            stroke_groups = []
            for line in sorted(verticals, key=lambda line: line['x0']):
                if stroke_groups and line['x0'] - stroke_groups[-1][-1]['x0'] < spacing:
                    stroke_groups[-1].append(line)
                else:
                    stroke_groups.append([line])
            edges += [group[-1]['x0'] for group in stroke_groups]
            if abs(edges[-1] - right) > spacing:
                raise ValueError('Missing closing measure boundary')
            # Printed system numbers independently guard bar counting, including
            # an indented, two-measure system and beginning-repeat strokes.
            labels = sorted({(round(c['x0'], 4), c['text']) for c in page.chars
                             if profile['music_font'] not in c['fontname']
                             and c['text'].isdigit() and left - 2 <= c['x0'] <= left + 12
                             and top - 20 < origin_y(page, c) < top - 5})
            label = ''.join(text for _, text in labels)
            if label and int(label) != number:
                raise ValueError(f'Printed system {label}, counted {number}')
            systems.append(dict(page=page_number, start=number, staff=top,
                                spacing=spacing, edges=edges, pageWidth=page.width,
                                pageHeight=page.height, printed_number=label or None))
            number += len(edges) - 1
    return systems


def extract_measure(page, system, left, right, number, profile):
    top, spacing = system['staff'], system['spacing']
    chars = [char for char in page.chars if profile['music_font'] in char['fontname']
             and left <= char['x0'] < right - .3
             and top - 7 * spacing < origin_y(page, char) < top + 5 * spacing]
    stems = [line for line in page.lines if line['width'] < .01
             and abs(line['linewidth'] - profile['stem_linewidth']) < .01
             and left < line['x0'] < right
             and top - 7 * spacing < line['top'] < top + 5 * spacing]
    beams = [rect for rect in page.rects if rect['fill'] and left < rect['x0'] < right
             and top - 7 * spacing < rect['top'] < top + 5 * spacing
             and rect['width'] > 2 and abs(rect['height'] - spacing / 2) < .03]
    events, issues = [], []
    for char in chars:
        glyph, y = char['text'], origin_y(page, char)
        if glyph in profile['rests']:
            rest = profile['rests'][glyph]
            events.append(dict(x=char['x0'], duration=rest['duration'], rest=True,
                               measureRest=rest.get('measure', False), heads=[], beams=[],
                               restGlyph=glyph, restY=y, type=rest['type']))
            continue
        if glyph not in profile['heads']:
            continue
        spec = profile['heads'][glyph]
        pos = round((y - top) / (spacing / 2))
        matches = [line for line in stems
                   if abs(line['x0'] - char['x0'] - spec['stem_offset']) < .13
                   and line['top'] - .3 < y < line['bottom'] + spacing * .6]
        if len(matches) != 1:
            issues.append(f'Stem {glyph}/{pos}@{char["x0"]:.3f}: {len(matches)}')
            continue
        stem = matches[0]
        head = dict(pos=pos, glyph=glyph, x=char['x0'], y=y)
        event = next((event for event in events if event.get('stem') == stem['x0']), None)
        if event:
            event['heads'].append(head)
            continue
        hits = [dict(x0=round(rect['x0'], 4), x1=round(rect['x1'], 4), top=round(rect['top'], 4))
                for rect in beams if rect['x0'] - .4 <= stem['x0'] <= rect['x1'] + .4
                and -spacing * .3 < rect['top'] - stem['top'] < 2 * spacing]
        flags = [profile['flags'][flag['text']] for flag in chars
                 if flag['text'] in profile['flags']
                 and abs(flag['x0'] - stem['x0']) < .4
                 and abs(origin_y(page, flag) - stem['top']) < 1]
        if len(flags) > 1 or (hits and flags):
            issues.append(f'Ambiguous flag/beam at {stem["x0"]:.3f}')
        level = len(hits) or (flags[0] if flags else 0)
        events.append(dict(x=stem['x0'], stem=stem['x0'], stemDirection='up',
                           duration=1 / 2 ** level, heads=[head], beams=hits,
                           flag=bool(flags), type={0:'quarter', 1:'eighth', 2:'16th', 3:'32nd'}.get(level)))
    events.sort(key=lambda event: event['x'])
    cursor = Fraction(0)
    for event in events:
        event['onset'] = float(cursor)
        cursor += Fraction(event['duration']).limit_denominator(96)
        event['heads'].sort(key=lambda head: head['pos'])
    if cursor != profile['beats_per_measure']:
        issues.append(f'Duration {cursor} != {profile["beats_per_measure"]}')
    for char in chars:
        if char['text'] in profile['techniques']:
            event = min(events, key=lambda event: abs(event['x'] - char['x0']))
            event.setdefault('techniques', []).append(profile['techniques'][char['text']])
            event.setdefault('sourceTechniques', []).append(dict(glyph=char['text'],
                                                               x=char['x0'], y=origin_y(page, char)))
        elif char['text'] not in profile['heads'] | profile['rests'] | profile['flags'] and char['text'] not in profile['non_rhythm_glyphs']:
            issues.append(f'Unsupported glyph U+{ord(char["text"]):04X} at {char["x0"]:.3f}')
    source_heads = Counter((c['text'], round(c['x0'], 4), round(origin_y(page, c), 4))
                           for c in chars if c['text'] in profile['heads'])
    output_heads = Counter((head['glyph'], round(head['x'], 4), round(head['y'], 4))
                           for event in events for head in event['heads'])
    if source_heads != output_heads:
        issues.append('Source head coverage mismatch')
    return dict(number=number, page=system['page'], system=system['start'], staff=top,
                spacing=spacing, bounds=[left, top-7*spacing, right, top+7*spacing],
                events=events, issues=issues,
                raw=[dict(glyph=c['text'], x=c['x0'], y=origin_y(page, c)) for c in chars])
