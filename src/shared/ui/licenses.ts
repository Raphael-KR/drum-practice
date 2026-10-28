import { download } from "../../platform/browser/download";
import { t as i18nText, type MessageKey } from "../i18n/i18n";
import notices from "../../generated/third-party.generated.json";

type LicenseEntry = (typeof notices.entries)[number];
const pdfjsComponentLabels: Partial<Record<string, MessageKey>> = {
  "PDF.js cmaps/LICENSE": "licenses.pdfjsCmaps",
  "PDF.js iccs/LICENSE": "licenses.pdfjsIccs",
  "PDF.js standard_fonts/LICENSE_FOXIT": "licenses.pdfjsFoxit",
  "PDF.js standard_fonts/LICENSE_LIBERATION": "licenses.pdfjsLiberation",
  "PDF.js wasm/LICENSE_JBIG2": "licenses.pdfjsJbig2",
  "PDF.js wasm/LICENSE_OPENJPEG": "licenses.pdfjsOpenjpeg",
  "PDF.js wasm/LICENSE_PDFJS_JBIG2": "licenses.pdfjsJbig2Bindings",
  "PDF.js wasm/LICENSE_PDFJS_OPENJPEG": "licenses.pdfjsOpenjpegBindings",
  "PDF.js wasm/LICENSE_PDFJS_QCMS": "licenses.pdfjsQcmsBindings",
  "PDF.js wasm/LICENSE_QCMS": "licenses.pdfjsQcms",
};

function disclosure(title: string) {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = title;
  details.append(summary);
  return details;
}

function licenseDetails(
  entry: LicenseEntry,
  title = `${entry.name} ${entry.version} · ${entry.license}`,
) {
  const details = disclosure(title);
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
  if (entry.name === "soundtouchjs") {
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
    details.append(link);
  }
  return details;
}

/** Offline notices: never inject third-party license text as markup. */
export function licenseSection() {
  const section = disclosure(i18nText("licenses.message083"));
  section.className = "settings-group license-section";
  const intro = document.createElement("p");
  intro.className = "subtle";
  intro.textContent = i18nText("licenses.message084");
  section.append(intro);
  const pdfjs = notices.entries.find((entry) => entry.name === "pdfjs-dist");
  const pdfjsComponents = notices.entries.filter((entry) =>
    entry.name.startsWith("PDF.js "),
  );
  for (const entry of notices.entries) {
    if (pdfjs && pdfjsComponents.includes(entry)) continue;
    if (entry === pdfjs) {
      const group = disclosure(
        i18nText("licenses.pdfjsGroup", { version: entry.version }),
      );
      group.append(
        licenseDetails(
          entry,
          i18nText("licenses.pdfjsCore", { license: entry.license }),
        ),
      );
      for (const component of pdfjsComponents) {
        const label = pdfjsComponentLabels[component.name];
        group.append(
          licenseDetails(component, label ? i18nText(label) : component.name),
        );
      }
      section.append(group);
    } else {
      section.append(licenseDetails(entry));
    }
  }
  return section;
}
