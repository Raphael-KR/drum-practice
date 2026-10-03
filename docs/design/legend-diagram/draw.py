"""Build the 27-entry legend concept from approved positions and Bravura outlines."""
import json, html, sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
root=Path(__file__).resolve().parents[3]
labels=json.loads((root/'src/locales/ko.json').read_text())
font=TTFont(sys.argv[1]); glyphs=font.getGlyphSet(); cmap=font.getBestCmap()
def glyph(cp,x,y,size=40):
    pen=SVGPathPen(glyphs);glyphs[cmap[cp]].draw(pen)
    return f'<path d="{pen.getCommands()}" transform="translate({x} {y}) scale({size/font["head"].unitsPerEm} {-size/font["head"].unitsPerEm})" fill="#142136"/>'
# y=70 is fifth line; one staff space is 10 units.
cols=[['closed','open','ride','bell','crash','china','splash','cowbell','hhSplash'],['snare','tom1','tom2','tom3','tom4','tom5','rightkick','leftkick','pedal'],['opening','closing','half','cross','ghost','choked','doubles','buzz','sticking']]
ys=dict(closed=65,open=65,ride=70,bell=70,crash=60,china=60,splash=60,cowbell=60,hhSplash=115,snare=85,tom1=75,tom2=80,tom3=90,tom4=95,tom5=100,rightkick=105,leftkick=110,pedal=115,opening=65,closing=65,half=65,cross=85,ghost=85,choked=60,doubles=85,buzz=85,sticking=85)
heads={'closed':0xE0A9,'open':0xE0B3,'ride':0xE0A9,'bell':0xE0BE,'crash':0xE0A9,'china':0xE0B3,'splash':0xE0DD,'cowbell':0xE0BE,'hhSplash':0xE0B3,'pedal':0xE0A9,'opening':0xE0A9,'closing':0xE0A9,'half':0xE0A9,'cross':0xE0A9,'choked':0xE0A9}
short={'closed':'제5칸 · 닫힌 하이햇','open':'제5칸 · 원 안의 ×','ride':'제5선 · ×','bell':'제5선 · 채운 삼각형','crash':'위 첫째 덧줄 · ×, 원 없음','china':'위 첫째 덧줄 · 원 안의 ×','splash':'위 첫째 덧줄 · 빈 마름모','cowbell':'위 첫째 덧줄 · 채운 삼각형','hhSplash':'아래 첫째 덧칸 · 원 안의 ×','snare':'제3칸','tom1':'제4칸','tom2':'제4선','tom3':'제3선','tom4':'제2칸 · 같은 악기의 두 이름','tom5':'제2선','rightkick':'제1칸 · 싱글 킥 기본 위치','leftkick':'제1선 · 더블 킥에서 추가','pedal':'아래 첫째 덧칸 · ×','opening':'음표 위 ○ · 하이햇을 열기','closing':'음표 위 ＋ · 하이햇을 닫기','half':'음표 위 ⊕ · 반쯤 열어 연주','cross':'제3칸 × · 림 클릭','ghost':'음표머리의 괄호 · 약하게 연주','choked':'× 위 점 · 타격 후 소리를 끊기','doubles':'기둥의 세 빗금 · 더블 스트로크','buzz':'스틱을 튀겨 만든 지속음','sticking':'각 타격 위 R / L · 오른손 / 왼손'}
s=['<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1360" viewBox="0 0 1800 1360">','<rect width="1800" height="1360" fill="#f4f7fc"/>','<style>text{font-family:"Apple SD Gothic Neo","Noto Sans CJK KR",sans-serif;fill:#24344c}.name{font-size:21px;font-weight:700}.desc{font-size:16px;fill:#53657e}</style>']
for c,ids in enumerate(cols):
    x=24+c*592
    s.append(f'<rect x="{x}" y="16" width="568" height="1328" rx="18" fill="white"/>')
    s.append(f'<text x="{x+22}" y="53" font-size="23" font-weight="700">{["하이햇 · 심벌","드럼 · 킥","주법 · 손 지시"][c]}</text>')
    for r,id in enumerate(ids):
        s.append(f'<g transform="translate({x+16} {63+r*141})">')
        s.append('<path d="M0 136H536" stroke="#e8edf5"/>')
        for y in range(70,111,10):s.append(f'<path d="M6 {y}H143" stroke="#8693a6" stroke-width="0.85"/>')
        y=ys[id];nx=57
        if y==60:s.append('<path d="M49 60H82" stroke="#53657e"/>')
        s.append(glyph(heads.get(id,0xE0A4),nx,y))
        s.append(f'<path d="M{nx+11} {y}V{y-33}" stroke="#142136" stroke-width="1.1"/>')
        anchor=(nx+12,y-4)
        if id in ['opening','closing','half']:
            cp={'opening':0xE614,'closing':0xE5E5,'half':0xE7F6}[id]
            # Dedicated half-open glyph. Open/close instructional symbols.
            if id=='half': s.append(glyph(cp,nx+1,27,52))
            elif id=='opening':s.append(f'<circle cx="{nx+6}" cy="21" r="5" fill="none" stroke="#142136" stroke-width="1.3"/>')
            else:s.append(f'<path d="M{nx+1} 21h10m-5 -5v10" stroke="#142136" stroke-width="1.3"/>')
            anchor=(nx+13,21)
        if id=='ghost':s.append(f'<text x="{nx-6}" y="{y+5}" font-size="21">(</text><text x="{nx+13}" y="{y+5}" font-size="21">)</text>')
        if id=='choked':s.append(f'<circle cx="{nx+6}" cy="18" r="2.7" fill="#142136"/>');anchor=(nx+12,18)
        if id in ['doubles','buzz']:
            s.append(glyph(0xE222 if id=='doubles' else 0xE22A,nx+11,y-19));anchor=(nx+20,y-20)
        if id=='sticking':
            s.append(glyph(0xE0A4,105,y));s.append(f'<path d="M116 {y}V{y-33}" stroke="#142136" stroke-width="1.1"/>')
            s.append('<text x="56" y="38" font-size="17" font-weight="700">R</text><text x="104" y="38" font-size="17" font-weight="700">L</text>');anchor=(118,33)
        ax,ay=anchor
        s.append(f'<path d="M{ax+5} {ay}H153L171 51H190" fill="none" stroke="#648dca" stroke-width="1.1"/><circle cx="{ax+5}" cy="{ay}" r="2" fill="#648dca"/>')
        name=labels['help.legend.'+id+'.name']
        s.append(f'<text class="name" x="196" y="49">{html.escape(name)}</text><text class="desc" x="196" y="76">{html.escape(short[id])}</text></g>')
s.append('</svg>')
(root/'docs/design/legend-diagram/common-legend.svg').write_text('\n'.join(s))
