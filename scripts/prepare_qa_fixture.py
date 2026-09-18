"""Independent public-domain synthetic score/audio for browser input QA."""
from pathlib import Path
import math, struct, wave
from reportlab.pdfgen import canvas
out = Path('docs/experiments/independent-fixture')
out.mkdir(exist_ok=True)
c = canvas.Canvas(str(out / 'score.pdf'), pagesize=(612, 792))
c.drawString(40, 750, 'Independent drum practice fixture - 100 BPM - 4/4')
for row, top in enumerate((650, 440)):
    for line in range(5):
        y = top - line * 8
        c.line(42, y, 570, y)
    for bar in range(5):
        x = 42 + bar * 132
        c.line(x, top, x, top - 32)
    for bar in range(4):
        c.drawString(48 + bar * 132, top + 30, str(row * 4 + bar + 1))
        for beat in range(4):
            x = 60 + bar * 132 + beat * 28
            c.ellipse(x - 3, top - 27, x + 3, top - 23, fill=1)
            c.line(x + 3, top - 25, x + 3, top + 10)
c.save()
sr=16000
with wave.open(str(out / 'audio.wav'), 'wb') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(sr)
    data = bytearray()
    for n in range(round(19.2 * sr)):
        t=n/sr; local=t%0.6; beat=int(t/0.6)
        sample=math.sin(2*math.pi*(880 if beat%4==0 else 440)*local)*math.exp(-local*70)*0.5 if local<0.08 else 0
        data.extend(struct.pack('<h', round(sample*32767)))
    f.writeframes(data)
print(out)
