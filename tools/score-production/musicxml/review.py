"""Build a local side-by-side review artifact without opening a browser."""

import argparse, html, json
from pathlib import Path
import pdfplumber

p = argparse.ArgumentParser()
p.add_argument("--pdf", type=Path, required=True)
p.add_argument("--out", type=Path, required=True)
a = p.parse_args()
ir = json.loads((a.out / "extracted.json").read_text())
audit = json.loads((a.out / "audit.json").read_text())
with pdfplumber.open(a.pdf) as pdf:
    for i, page in enumerate(pdf.pages, 1):
        page.to_image(resolution=160).original.save(a.out / f"source-{i}.png")
    for n in (7, 9, 12, 72, 84, 100):
        b = ir[n - 1]
        l, t, r, bt = b["bounds"]
        staff = b["staff"]
        top = max(t, staff - 39)
        bottom = min(bt, staff + 48)
        pdf.pages[b["page"] - 1].crop((l, top, r, bottom)).to_image(
            resolution=300
        ).original.save(a.out / f"source-bar-{n}.png")
rows = []
for b in audit["measure_audit"]:
    rows.append(
        f"<tr><td>{b['measure']}</td><td>{b['source_heads']}</td><td>{html.escape(b['review'])}</td><td>{html.escape('; '.join(b['decisions']+b['uncertainty']) or '없음')}</td></tr>"
    )
text = """<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Real Paradis MusicXML 원본 대조</title><style>body{font:16px/1.6 system-ui;margin:30px auto;max-width:1600px;padding:0 18px;color:#222}h1{font-size:28px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}figure{margin:0}img{width:100%;border:1px solid #ddd}figcaption{font-weight:600}table{border-collapse:collapse;width:100%;font-size:13px}td,th{border:1px solid #ccc;padding:7px;vertical-align:top}.notice{background:#fff4d5;padding:16px}a{color:#1459a6}@media(max-width:800px){.pair{grid-template-columns:1fr}}</style><h1>風と丘のバラード — MusicXML 변환 후보</h1><p class="notice">110마디 구조 검사 PASS. 완성 악보로 확정한 결과는 아닙니다. 악기명은 원본 범례가 없는 상태에서 관례로 매핑했습니다. 7마디의 장식음 재생 시점·트레몰로 실제 타격 간격은 원본에 지정되어 있지 않습니다. 대표 9·12·84마디는 수동 리듬 대조를 했으며, 나머지는 구조 검사와 전체 페이지 대조를 했습니다.</p><p><a href="real-paradis-110-candidate.musicxml">전체 MusicXML</a> · <a href="representatives.musicxml">대표 마디 MusicXML</a> · <a href="audit.json">마디별 검사·불확실성</a> · <a href="provenance.json">입력 해시</a></p><p>4/4, 84마디만 5/4, 94 BPM. 1–4마디 다중마디쉼표, 6개 반복마디의 실제 이벤트 확장, 72·100마디 6연음, 7마디 장식음·트레몰로·붙임줄 포함. 3쪽과 시스템 분할은 유지합니다. 반복기호 폭·회수 표기, 음표 머리의 모양, 빔 기울기, 표제/Intro 표시 등은 원본과 다릅니다. 픽셀 동일성을 주장하지 않습니다.</p><h2>대표 마디 재렌더링</h2><img src="representatives-render/page-1.png" alt="9,12,84마디 MusicXML 렌더"><div class="pair">"""
for n in (9, 12, 84, 7, 72, 100):
    text += f'<figure><figcaption>원본 {n}마디</figcaption><img src="source-bar-{n}.png" alt="원본 {n}마디"></figure>'
text += "</div>"
for page in (1, 2, 3):
    text += f'<h2>{page}쪽 전체 대조</h2><div class="pair"><figure><figcaption>원본 PDF</figcaption><img src="source-{page}.png" alt="원본 {page}쪽"></figure><figure><figcaption>MusicXML → Verovio 6.3</figcaption><img src="full-render/page-{page}.png" alt="변환 {page}쪽"></figure></div>'
text += (
    "<h2>마디별 검증 범위와 미확정 사항</h2><table><tr><th>마디</th><th>복원 음표 머리 수</th><th>검토 수준</th><th>예외 처리 / 미확정</th></tr>"
    + "".join(rows)
    + "</table></html>"
)
(a.out / "review.html").write_text(text)
print(a.out / "review.html")
