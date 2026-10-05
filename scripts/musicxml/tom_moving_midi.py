"""Export the reviewed single-voice tom exercise to Standard MIDI File 1.

Uses stdlib only. MusicXML remains authoritative for engraving and R/L.
The MIDI starts at the score's first beat; the WAV has a separate leading .25s.
"""
import argparse
import json
import struct
from fractions import Fraction
from pathlib import Path
from xml.etree import ElementTree as E

PPQ = 480

def vlq(value):
    if not 0 <= value <= 0x0fffffff:raise ValueError('Invalid MIDI delta time')
    data=[value & 127]
    while value >> 7:
        value >>= 7;data.insert(0,(value & 127)|128)
    return bytes(data)

def meta(kind,data):
    return bytes([255,kind])+vlq(len(data))+data

def track(events,end):
    result=bytearray();previous=0
    for tick,priority,data in sorted(events,key=lambda item:(item[0],item[1])):
        result+=vlq(tick-previous)+data;previous=tick
    result+=vlq(end-previous)+b'\xff\x2f\x00'
    return b'MTrk'+struct.pack('>I',len(result))+result

def export(xml):
    root=E.fromstring(xml);part=root.find('part[@id="P1"]')
    if part is None:raise ValueError('Expected reviewed P1 drum part')
    bpm=Fraction(part.find('.//sound').get('tempo'))
    tempo=round(60_000_000/bpm)
    instruments={m.get('id'):int(m.findtext('midi-unpitched'))-1 for m in root.findall('part-list/score-part[@id="P1"]/midi-instrument')}
    assert set(instruments.values())=={50,47,43}
    conductor=[(0,0,meta(3,b'Tom Moving Practice')),(0,1,meta(0x51,tempo.to_bytes(3,'big'))),(0,2,meta(0x58,bytes([4,2,24,8])))];notes=[]
    cursor=0;divisions=None;count=0
    for m in part.findall('measure'):
        if m.find('attributes/divisions') is not None:divisions=int(m.findtext('attributes/divisions'))
        if m.find('attributes/time') is not None:assert (m.findtext('attributes/time/beats'),m.findtext('attributes/time/beat-type'))==('4','4')
        assert not any(m.find(tag) is not None for tag in ['backup','forward']), 'This exporter supports the reviewed single voice only'
        marker=m.findtext('direction/direction-type/rehearsal')
        if marker:conductor.append((cursor,3,meta(6,marker.encode('utf-8'))))
        start=cursor
        for n in m.findall('note'):
            assert all(n.find(tag) is None for tag in ['chord','grace','tie','rest']), 'Unexpected event type'
            duration=Fraction(int(n.findtext('duration'))*PPQ,divisions)
            assert duration.denominator==1 and duration>0
            pitch=instruments[n.find('instrument').get('id')]
            assert n.findtext('voice','1')=='1' and n.find('unpitched') is not None
            notes.extend([(cursor,1,bytes([0x99,pitch,76])),(cursor+int(duration),0,bytes([0x89,pitch,0]))])
            cursor+=int(duration);count+=1
        assert cursor-start==4*PPQ
    assert len(part.findall('measure'))==16 and count==192 and cursor==64*PPQ
    data=b'MThd'+struct.pack('>IHHH',6,1,2,PPQ)+track(conductor,cursor)+track([(0,-1,meta(3,b'GM Toms - Channel 10'))]+notes,cursor)
    return data,{'format':1,'tracks':2,'ticksPerQuarter':PPQ,'bpm':float(bpm),'measures':16,'noteOns':count,'endTicks':cursor,'scoreDurationSeconds':float(cursor/PPQ*60/bpm),'firstNoteSeconds':0,'WAVOffsetSeconds':.25,'MIDIChannel':10,'MIDIPitches':sorted(instruments.values()),'sticking':'MusicXML only; MIDI has no standard R/L notation'}

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--xml',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args()
    data,audit=export(a.xml.read_bytes());a.out.parent.mkdir(parents=True,exist_ok=True)
    with a.out.open('xb') as f:f.write(data)
    print(json.dumps(audit,ensure_ascii=False,indent=2))
