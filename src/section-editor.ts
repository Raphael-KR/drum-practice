import { t } from "./i18n";
import { readSectionShortcuts, type SectionShortcut } from "./section-shortcuts";
import { escapeHTML as esc } from "./html";
import type { Song } from "./model";

/** Change rehearsal directions only; notes, voices, timing and other directions survive. */
export function writeSections(xml: string, sections: SectionShortcut[], measureCount: number, partId?: string) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror") || doc.documentElement.localName !== "score-partwise")
    throw Error(t("sectionEditor.copy1"));
  const parts = [...doc.querySelectorAll("score-partwise > part")];
  const part = parts.find(p => p.id === partId) ?? parts.find(p => p.id !== "DrumPracticeLyrics") ?? parts[0];
  if (!part) throw Error(t("sectionEditor.copy2"));
  const measures = [...part.children].filter(e => e.localName === "measure");
  const seen = new Set<number>();
  for (const section of sections) {
    if (!section.name.trim()) throw Error(t("sectionEditor.copy3"));
    if (!Number.isInteger(section.measureIndex) || section.measureIndex < 0 || section.measureIndex >= measureCount || !measures[section.measureIndex])
      throw Error(t("sectionEditor.copy4"));
    if (seen.has(section.measureIndex)) throw Error(t("sectionEditor.copy5"));
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
  root.innerHTML = `<div class="section-editor-heading"><div><h3>${t("sectionEditor.copy6")}</h3><p>${t("sectionEditor.copy7")}</p></div><button type="button" id="section-add">${t("sectionEditor.copy8")}</button></div><table class="section-editor-table"><thead><tr><th>${t("sectionEditor.copy9")}</th><th>${t("sectionEditor.copy10")}</th><th>${t("sectionEditor.copy11")}</th></tr></thead><tbody></tbody></table><div class="form-footer"><span role="status" id="section-status"></span><button type="button" id="section-reset">${t("sectionEditor.copy12")}</button><button type="button" id="section-apply" class="primary">${t("sectionEditor.copy13")}</button></div>`;
  const body = root.querySelector("tbody")!;
  let working = false;
  const status = root.querySelector<HTMLElement>("#section-status")!;
  function row(section: SectionShortcut) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><input type="number" min="1" max="${host.song()?.measures.length ?? 1}" value="${section.measureIndex+1}" aria-label="${t("sectionEditor.copy14")}"></td><td><input type="text" value="${esc(section.name)}" aria-label="${t("sectionEditor.copy15")}" placeholder="${t("sectionEditor.copy16")}"></td><td><button type="button" aria-label="${t("sectionEditor.copy17")}">${t("sectionEditor.copy18")}</button></td>`;
    tr.querySelector("button")!.onclick = () => tr.remove();
    body.append(tr);
  }
  function refresh() {
    if (working) return;
    body.replaceChildren();
    readSectionShortcuts(host.xml() ?? "").forEach(row);
    const enabled = !!host.xml();
    root.querySelectorAll<HTMLButtonElement>("button").forEach(b=>b.disabled=!enabled);
    status.textContent = enabled ? "" : t("sectionEditor.copy19");
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
    status.textContent = t("sectionEditor.copy20");
    try { await host.apply(sections); working=false; refresh(); status.textContent=t("sectionEditor.copy21"); }
    catch(e) { status.textContent = e instanceof Error ? e.message : String(e); }
    finally { working=false; root.querySelectorAll<HTMLInputElement|HTMLButtonElement>("input,button").forEach(e=>e.disabled=false); }
  };
  refresh();
  return {refresh};
}
