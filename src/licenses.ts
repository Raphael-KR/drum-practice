import { download } from "./download";
import { t as i18nText } from "./i18n";
import notices from "./third-party.generated.json";
/** Offline notices: never inject third-party license text as markup. */
export function licenseSection() {
  const section = document.createElement("details");
  section.className = "settings-group license-section";
  const heading = document.createElement("summary");
  heading.textContent = i18nText("licenses.message083");
  section.append(heading);
  const intro = document.createElement("p");
  intro.className = "subtle";
  intro.textContent = i18nText("licenses.message084");
  section.append(intro);
  for (const entry of notices.entries) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = `${entry.name} ${entry.version} · ${entry.license}`;
    details.append(summary);
    if (entry.url) {
      const link = document.createElement("a");
      link.href = entry.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = i18nText("licenses.message085");
      details.append(link);
    }
    const pre = document.createElement("pre");
    pre.textContent = entry.text;
    details.append(pre);
    section.append(details);
  }
  const link = document.createElement("a");
  link.href = "#";
  link.textContent = i18nText("licenses.message086");
  link.download = "soundtouch-0.3.0.js";
  link.onclick = (e) => {
    e.preventDefault();
    download(
      new Blob([notices.soundtouchSource], { type: "text/javascript" }),
      link.download,
    );
  };
  section.append(link);
  return section;
}
