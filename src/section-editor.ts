import { readSectionShortcuts, type SectionShortcut } from "./section-shortcuts";
import { escapeHTML as esc } from "./html";
import type { Song } from "./model";

/** Change rehearsal directions only; notes, voices, timing and other directions survive. */
export function writeSections(xml: string, sections: SectionShortcut[], measureCount: number, partId?: string) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror") || doc.documentElement.localName !== "score-partwise")
    throw Error("편집할 MusicXML 악보가 없습니다.");
  const parts = [...doc.querySelectorAll("score-partwise > part")];
  const part = parts.find(p => p.id === partId) ?? parts.find(p => p.id !== "DrumPracticeLyrics") ?? parts[0];
  if (!part) throw Error("섹션을 표시할 악보 파트를 찾을 수 없습니다.");
  const measures = [...part.children].filter(e => e.localName === "measure");
  const seen = new Set<number>();
  for (const section of sections) {
    if (!section.name.trim()) throw Error("섹션 이름을 입력하세요.");
    if (!Number.isInteger(section.measureIndex) || section.measureIndex < 0 || section.measureIndex >= measureCount || !measures[section.measureIndex])
      throw Error("악보 범위 안의 시작 마디를 입력하세요.");
    if (seen.has(section.measureIndex)) throw Error("같은 시작 마디에는 섹션을 하나만 지정하세요.");
    seen.add(section.measureIndex);
  }
  for (const mark of doc.querySelectorAll("direction-type > rehearsal")) {
    const type = mark.parentElement!, direction = type.parentElement!;
    mark.remove();
    if (!type.children.length) type.remove();
    if (!direction.querySelector("direction-type") && !direction.querySelector("sound")) direction.remove();
  }
  for (const section of [...sections].sort((a,b)=>a.measureIndex-b.measureIndex)) {
    const measure = measures[section.measureIndex];
    const direction = doc.createElementNS(doc.documentElement.namespaceURI, "direction");
    direction.setAttribute("placement", "above");
    const type = doc.createElementNS(doc.documentElement.namespaceURI, "direction-type");
    const mark = doc.createElementNS(doc.documentElement.namespaceURI, "rehearsal");
    mark.textContent = section.name.trim();
    type.append(mark); direction.append(type);
    const firstMusic = [...measure.children].find(e => !["print", "attributes"].includes(e.localName));
    measure.insertBefore(direction, firstMusic ?? null);
  }
  return new XMLSerializer().serializeToString(doc);
}

export function mountSectionEditor(root: HTMLElement, host: {
  song(): Song | undefined;
  xml(): string | undefined;
  apply(sections: SectionShortcut[]): Promise<void>;
}) {
  root.innerHTML = '<div class="section-editor-heading"><div><h3>섹션</h3><p>시작 마디와 이름을 편집합니다. 바로가기는 악보 순서대로 앞의 8개를 표시합니다.</p></div><button type="button" id="section-add">섹션 추가</button></div><table class="section-editor-table"><thead><tr><th>시작 마디</th><th>섹션 이름</th><th>삭제</th></tr></thead><tbody></tbody></table><div class="form-footer"><span role="status" id="section-status"></span><button type="button" id="section-reset">변경 취소</button><button type="button" id="section-apply" class="primary">섹션 적용</button></div>';
  const body = root.querySelector("tbody")!;
  let working = false;
  const status = root.querySelector<HTMLElement>("#section-status")!;
  function row(section: SectionShortcut) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><input type="number" min="1" max="${host.song()?.measures.length ?? 1}" value="${section.measureIndex+1}" aria-label="섹션 시작 마디"></td><td><input type="text" value="${esc(section.name)}" aria-label="섹션 이름" placeholder="예: 후렴1"></td><td><button type="button" aria-label="섹션 삭제">삭제</button></td>`;
    tr.querySelector("button")!.onclick = () => tr.remove();
    body.append(tr);
  }
  function refresh() {
    if (working) return;
    body.replaceChildren();
    readSectionShortcuts(host.xml() ?? "").forEach(row);
    const enabled = !!host.xml();
    root.querySelectorAll<HTMLButtonElement>("button").forEach(b=>b.disabled=!enabled);
    status.textContent = enabled ? "" : "악보를 열면 섹션을 편집할 수 있습니다.";
  }
  root.querySelector<HTMLButtonElement>("#section-add")!.onclick = () => {
    row({name:"",measureIndex:0});
    body.lastElementChild?.querySelector("input")?.focus();
  };
  root.querySelector<HTMLButtonElement>("#section-reset")!.onclick = refresh;
  root.querySelector<HTMLButtonElement>("#section-apply")!.onclick = async () => {
    const sections = [...body.rows].map(tr=>({
      measureIndex:Number(tr.querySelector<HTMLInputElement>('input[type=number]')!.value)-1,
      name:tr.querySelector<HTMLInputElement>('input[type=text]')!.value.trim(),
    }));
    working = true;
    root.querySelectorAll<HTMLInputElement|HTMLButtonElement>("input,button").forEach(e=>e.disabled=true);
    status.textContent = "악보에 반영 중…";
    try { await host.apply(sections); working=false; refresh(); status.textContent="반영했습니다. 상단 저장으로 확정하세요."; }
    catch(e) { status.textContent = e instanceof Error ? e.message : String(e); }
    finally { working=false; root.querySelectorAll<HTMLInputElement|HTMLButtonElement>("input,button").forEach(e=>e.disabled=false); }
  };
  refresh();
  return {refresh};
}
