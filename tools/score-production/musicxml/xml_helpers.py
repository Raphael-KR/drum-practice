"""Small shared MusicXML builder; contains no exercise composition."""
from lxml import etree as E

def add(parent, tag, text=None, **attrs):
    el = E.SubElement(parent, tag, **{k.replace('_', '-'): str(v) for k, v in attrs.items()})
    if text is not None:
        el.text = str(text)
    return el
