import type { Song } from "./model";
export interface SectionShortcut { name: string; measureIndex: number }
/** Rehearsal marks are score metadata, never inferred from user markers. */
export function readSectionShortcuts(xml: string): SectionShortcut[] {
  if (!xml) return [];
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) return [];
  const sections = new Map<number, string[]>();
  for (const part of doc.querySelectorAll("score-partwise > part")) {
    [...part.children].filter(node => node.localName === "measure").forEach((measure, index) => {
      for (const rehearsal of measure.querySelectorAll("direction-type > rehearsal")) {
        const name = rehearsal.textContent?.trim();
        if (!name) continue;
        const names = sections.get(index) ?? [];
        if (!names.includes(name)) names.push(name);
        sections.set(index, names);
      }
    });
  }
  return [...sections].sort(([a], [b]) => a - b)
    .map(([measureIndex, names]) => ({measureIndex, name: names.join(" · ")}));
}
export function sectionShortcutSlots(sections: SectionShortcut[], song: Song) {
  const valid = sections.filter(section => !!song.measures[section.measureIndex]).slice(0, 9);
  return Array.from({length: 9}, (_, index) => valid[index]);
}
