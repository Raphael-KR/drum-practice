"""Read exact MusicXML lyric starts; inspect only, never move syllables."""

from collections import defaultdict
from fractions import Fraction as F
import json


def lyric_onsets(root):
    """Count text-bearing syllables, not empty extend continuations or source vocals.

    Canonical v1/v2 identifies its lyric part. Without a manifest, inspect native
    lyric parts except the archived DrumPracticeVocalSource. Absolute quarter
    positions include meter changes, pickups and bar boundaries.
    """
    data = None
    for field in root.findall("identification/miscellaneous/miscellaneous-field"):
        if field.get("name") in ("drum-practice:score:v1", "drum-practice:score:v2"):
            data = json.loads(field.text)
    part_id = data.get("partId") if data else None
    if data and data["version"] == 1:
        part_id = "DrumPracticeLyrics"
    identities = {}
    for item in (data or {}).get("lyrics", []):
        key = item.get("noteId") if data["version"] == 2 else item.get("voice")
        identities[key] = item["id"]
    rows = []
    for part in root.findall("part"):
        if part.get("id") == "DrumPracticeVocalSource":
            continue
        if part_id and part.get("id") != part_id:
            continue
        div, meter, absolute = None, None, F(0)
        active = {}
        for mi, measure in enumerate(part.findall("measure")):
            cursor, extent, last = F(0), F(0), {}
            for node in measure:
                if node.tag == "attributes":
                    if node.find("divisions") is not None:
                        div = F(node.findtext("divisions"))
                    time = node.find("time")
                    if time is not None and time.find("beats") is not None:
                        meter = sum(
                            (
                                sum(F(v) for v in a.text.split("+")) * 4 / F(b.text)
                                for a, b in zip(
                                    time.findall("beats"), time.findall("beat-type")
                                )
                            ),
                            F(0),
                        )
                elif node.tag in ("backup", "forward", "note"):
                    if div is None or div <= 0:
                        raise ValueError(
                            f"Invalid divisions: part={part.get('id')}, measure={measure.get('number')}, actual={div}"
                        )
                    duration = F(node.findtext("duration", "0")) / div
                    if node.tag in ("backup", "forward"):
                        cursor += duration if node.tag == "forward" else -duration
                        if cursor < 0:
                            raise ValueError(
                                f"Negative cursor: measure={measure.get('number')}, actual={cursor}"
                            )
                        continue
                    voice = node.findtext("voice", "1")
                    if node.find("chord") is not None:
                        if voice not in last:
                            raise ValueError(
                                f"Chord without voice anchor: measure={measure.get('number')}, voice={voice}"
                            )
                        onset = last[voice]
                    else:
                        onset = cursor
                        last[voice] = onset
                        if node.find("grace") is None:
                            cursor += duration
                    extent = max(extent, onset + duration)
                    for lyric in node.findall("lyric"):
                        texts = lyric.findall("text")
                        verse = lyric.get("name") or lyric.get("number")
                        lane = (voice, verse)
                        if not texts:
                            if lyric.find("extend") is not None and lane in active:
                                prior = active[lane]
                                prior["durationQuarters"] = str(
                                    absolute
                                    + onset
                                    + duration
                                    - F(prior["absoluteQuarter"])
                                )
                            continue
                        text = "".join("".join(t.itertext()) for t in texts)
                        if not text.strip():
                            continue
                        identity = identities.get(
                            node.get("id") if data and data["version"] == 2 else voice
                        )
                        rows.append(
                            dict(
                                id=identity,
                                noteId=node.get("id"),
                                partId=part.get("id"),
                                measure=measure.get("number"),
                                measureIndex=mi,
                                voice=voice,
                                text=text,
                                quarterOffset=str(onset),
                                absoluteQuarter=str(absolute + onset),
                                durationQuarters=str(duration),
                                verse=verse,
                            )
                        )
                        active[lane] = rows[-1]
            length = (
                extent
                if measure.get("implicit") == "yes"
                else meter if meter is not None else extent
            )
            if length < 0:
                raise ValueError(
                    f"Invalid measure length: measure={measure.get('number')}, actual={length}"
                )
            absolute += length
    return rows


def onset_duplicates(rows):
    groups = defaultdict(list)
    for row in rows:
        groups[F(row["absoluteQuarter"])].append(row)
    return [
        dict(absoluteQuarter=str(time), syllables=items)
        for time, items in sorted(groups.items())
        if len(items) > 1
    ]


def audit_lyric_onsets(root):
    rows = lyric_onsets(root)
    duplicates = onset_duplicates(rows)
    off_grid_starts = [
        row for row in rows if (F(row["quarterOffset"]) * 16).denominator != 1
    ]
    off_grid_durations = [
        row for row in rows if (F(row["durationQuarters"]) * 16).denominator != 1
    ]
    status = (
        "DUPLICATE_ONSETS"
        if duplicates
        else "GRID_REVIEW" if off_grid_starts or off_grid_durations else "PASS"
    )
    return dict(
        status=status,
        syllables=len(rows),
        duplicateGroups=len(duplicates),
        duplicatePairs=sum(
            len(g["syllables"]) * (len(g["syllables"]) - 1) // 2 for g in duplicates
        ),
        duplicates=duplicates,
        grid64=dict(
            quarterStep="1/16",
            quartersPerWhole=4,
            slotsPerWhole=64,
            offGridStarts=off_grid_starts,
            offGridDurations=off_grid_durations,
        ),
    )
