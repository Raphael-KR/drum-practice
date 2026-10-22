"""File identity and reviewed configuration; no song interpretation."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
PROFILES = Path(__file__).resolve().parent.parent / 'profiles'


def sha(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for block in iter(lambda: stream.read(8 * 1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def profile(name):
    return json.loads((PROFILES / 'songs.json').read_text())[name]


def require_equal(actual, expected, context):
    if actual != expected:
        raise ValueError(f'{context}: expected={expected!r}, actual={actual!r}')
