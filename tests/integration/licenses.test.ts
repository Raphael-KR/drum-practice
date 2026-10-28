// @vitest-environment jsdom
import { expect, it } from "vitest";
import { licenseSection } from "../../src/shared/ui/licenses";
import notices from "../../src/generated/third-party.generated.json";
it("shows installed versions and full offline notices, never treating notices as HTML", () => {
  const section = licenseSection();
  for (const name of [
    "soundtouchjs",
    "opensheetmusicdisplay",
    "pdfjs-dist",
    "jszip",
    "vexflow",
  ]) {
    const entry = notices.entries.find((e) => e.name === name)!;
    expect(entry.text.length).toBeGreaterThan(200);
    const displayName = name === "pdfjs-dist" ? "PDF.js" : name;
    expect(section.textContent).toContain(`${displayName} ${entry.version}`);
  }
  expect(section.querySelectorAll("pre")).toHaveLength(notices.entries.length);
  expect(section.querySelector("script")).toBeNull();
  expect(notices.soundtouchSource).toContain("SoundTouch");
});
