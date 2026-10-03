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

rows=[['closed','open','ride','bell','crash','china','splash','cowbell'],['snare','tom1','tom2','tom3','tom4','tom5','rightkick','leftkick'],['pedal','hhSplash','opening','closing','half'],['cross','ghost','choked','doubles','buzz','sticking']]
names={'rightkick':'오른발 베이스','leftkick':'왼발 베이스','tom4':'탐 4 / 플로어 탐','cross':'크로스 스틱','doubles':'더블 스트로크','buzz':'버즈 롤'}
short.update({'closed':'제5칸 · 닫힌 하이햇','crash':'위 첫째 덧줄 · ×','tom4':'제2칸','rightkick':'제1칸 · 싱글 킥','leftkick':'제1선 · 더블 킥','cross':'제3칸 × · 림 클릭','ghost':'괄호 · 약하게 연주','choked':'× 위 점 · 소리를 끊기','doubles':'기둥의 세 빗금','buzz':'스틱을 튀겨 만든 지속음','sticking':'R 오른손 · L 왼손'})
s=['<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1040" viewBox="0 0 1800 1040" class="score-legend-illustration" role="img" aria-label="악보 공통 범례">', '<defs>\n <filter id="legend-liquid-refraction" x="-10%" y="-20%" width="120%" height="140%" color-interpolation-filters="sRGB">\n  <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="7" result="noise"/>\n  <feGaussianBlur in="noise" stdDeviation="8" result="blurredNoise"/>\n  <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="40" xChannelSelector="R" yChannelSelector="G"/>\n </filter>\n <linearGradient id="legend-glass" x2="0.85" y2="1">\n  <stop stop-color="#ffffff" stop-opacity="0.76"/>\n  <stop offset="0.46" stop-color="#f3f8ff" stop-opacity="0.43"/>\n  <stop offset="1" stop-color="#ffffff" stop-opacity="0.66"/>\n </linearGradient>\n <linearGradient id="legend-rim" x2="0.4" y2="1">\n  <stop stop-color="#ffffff" stop-opacity="0.95"/>\n  <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.22"/>\n  <stop offset="1" stop-color="#9baeca" stop-opacity="0.45"/>\n </linearGradient>\n <radialGradient id="legend-blue"><stop stop-color="#75b7ff" stop-opacity="0.36"/><stop offset="1" stop-color="#75b7ff" stop-opacity="0"/></radialGradient>\n <radialGradient id="legend-lilac"><stop stop-color="#b3a0ed" stop-opacity="0.26"/><stop offset="1" stop-color="#b3a0ed" stop-opacity="0"/></radialGradient>\n</defs>\n<style>.score-legend-illustration text{font-family:"Apple SD Gothic Neo","Noto Sans CJK KR",sans-serif;fill:#24344c}.score-legend-illustration .name{font-size:28px;font-weight:700}.score-legend-illustration .desc{font-size:22px;fill:#435773}@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.score-legend-illustration .glass-colour{display:none}.score-legend-illustration .glass-pane{fill:#f4f7fc;fill-opacity:1}}</style>']

for r,ids in enumerate(rows):
    top=16+r*256
    s.append(f'''<g transform="translate(0 {top})">
      <defs><clipPath id="glass-row-{r}"><rect x="20" width="1760" height="244" rx="22"/></clipPath></defs>
      <rect x="23" y="7" width="1754" height="242" rx="22" fill="#718ba8" fill-opacity="0.12"/>
      <rect x="21" y="4" width="1758" height="242" rx="22" fill="#bdd0e4" fill-opacity="0.32" stroke="#91a9c2" stroke-opacity="0.28" stroke-width="1.5"/>
      <g clip-path="url(#glass-row-{r})">
        <g class="glass-colour" filter="url(#legend-liquid-refraction)">
          <ellipse cx="{300+r*285}" cy="65" rx="570" ry="260" fill="url(#legend-blue)"/>
          <ellipse cx="{1430-r*210}" cy="240" rx="520" ry="250" fill="url(#legend-lilac)"/>
        </g>
        <rect class="glass-pane" x="20" width="1760" height="244" rx="22" fill="url(#legend-glass)"/>
      </g>
      <rect x="21" y="1" width="1758" height="242" rx="21" fill="none" stroke="url(#legend-rim)" stroke-width="3"/>
      <rect x="24" y="4" width="1752" height="234" rx="18" fill="none" stroke="#ffffff" stroke-opacity="0.48" stroke-width="1"/>
      <path d="M43 2H1757" stroke="#ffffff" stroke-opacity="0.85" stroke-width="2" stroke-linecap="round"/>
      <path d="M43 241H1757" stroke="#7c98b5" stroke-opacity="0.25" stroke-width="2" stroke-linecap="round"/>
    ''')
    s.append(f'<text x="44" y="25" font-size="24" font-weight="700" fill="#49688b">{["하이햇 · 심벌","드럼 · 킥","하이햇 주법","기타 주법"][r]}</text>')
    for line in range(70,111,10):
        s.append(f'<path d="M48 {line*1.25}H1752" stroke="#94a1b3" stroke-width="0.85"/>')
    width=1680/len(ids)
    for i,id in enumerate(ids):
        cx=60+(i+0.5)*width
        offset=81 if id=='sticking' else 63
        s.append(f'<g transform="translate({cx-offset*1.25} 0) scale(1.25)">')
        y=ys[id];nx=57
        s.append(f'<g transform="translate({offset} {y}) scale(1.3) translate({-offset} {-y})">')
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
        s.append('</g></g>')
        name=names.get(id,labels['help.legend.'+id+'.name'])
        desc = short[id].split(' · ') if len(ids) == 8 else [short[id]]
        s.append(f'<text class="name" text-anchor="middle" x="{cx}" y="183">{html.escape(name)}</text>')
        for line, text in enumerate(desc):
            s.append(f'<text class="desc" text-anchor="middle" x="{cx}" y="{211+24*line}">{html.escape(text)}</text>')
    s.append('</g>')
s.append('</svg>')
assert len([id for row in rows for id in row]) == 27
assert len(set(id for row in rows for id in row)) == 27
(root/'docs/design/legend-diagram/common-legend-four-staves.svg').write_text('\n'.join(s))

(root/"src/vendor/score-legend-svg.ts").write_text("// Generated by docs/design/legend-diagram/draw-four-staves.py; Bravura: OFL.\nexport const scoreLegendSVG = " + json.dumps("\n".join(s), ensure_ascii=False) + ";\n")
