"""Approved exercise mapping snapshot; source glyph interpretation stays per song."""
import json
from .artifacts import PROFILES
INSTRUMENTS = {k:tuple(v) for k,v in json.loads((PROFILES/'exercise-instruments.json').read_text()).items()}
