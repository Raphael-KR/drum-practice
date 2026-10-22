"""Deterministic MIDI and sampled event schedule; tempo is an input."""
import struct
from fractions import Fraction


def vlq(n):
    if not isinstance(n, int) or not 0 <= n <= 0x0fffffff:
        raise ValueError(f'MIDI delta out of range: actual={n}')
    data=[n&127];n>>=7
    while n:
        data.insert(0,128|(n&127));n>>=7
    return bytes(data)


def midi(events, total_quarters, *, bpm, beats=4, denominator=4, ppq=480, velocity=76, channel=9):
    if bpm <= 0 or denominator <= 0 or denominator & (denominator-1):
        raise ValueError(f'Invalid MIDI tempo/meter: bpm={bpm}, meter={beats}/{denominator}')
    micros=round(60_000_000/bpm)
    stream=bytearray(b'\0\xff\x51\x03'+micros.to_bytes(3,'big')+b'\0\xff\x58\x04'+bytes([beats,denominator.bit_length()-1,24,8]))
    last=0
    for tick,on,key in sorted(events,key=lambda e:(e[0],e[1],e[2])):
        stream+=vlq(tick-last)+bytes([(0x90 if on else 0x80)|channel,key,velocity if on else 0]);last=tick
    end=Fraction(total_quarters)*ppq
    if end.denominator != 1:
        raise ValueError(f'MIDI end is not an integral tick: actual={end}')
    stream+=vlq(int(end)-last)+b'\xff\x2f\0'
    return b'MThd'+struct.pack('>IHHH',6,0,1,ppq)+b'MTrk'+struct.pack('>I',len(stream))+stream


def schedule(bars, instruments, *, bpm, first, sample_rate, units_per_quarter=4,
             quarters_per_measure=4, velocity=76, channel=9, ppq=480):
    sampled=[];ticks=[]
    for i,bar in enumerate(bars):
        for event in bar['events']:
            start=i*quarters_per_measure*units_per_quarter+event['offsetUnits']
            key=instruments[event['instrument']][3]
            for on,u in [(True,start),(False,start+event['durationUnits'])]:
                tick=Fraction(u)*ppq/units_per_quarter
                if tick.denominator != 1:
                    raise ValueError(f'Event not representable at ppq={ppq}: measure={i+1}, units={u}')
                ticks.append((int(tick),on,key))
                sampled.append({'on':on,'note':key,'velocity':velocity if on else 0,'channel':channel,
                                'frame':round((first+u/units_per_quarter*60/bpm)*sample_rate),'measure':i+1})
    sampled.sort(key=lambda e:(e['frame'],e['on'],e['note']))
    return sampled,ticks
