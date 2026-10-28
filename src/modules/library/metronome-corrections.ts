import type { MetronomeCorrection } from "../../model/metronome";
import { t } from "../../shared/i18n/i18n";

/** Per read/restore operation: one user notice, with bounded diagnostic details. */
export function createMetronomeCorrectionNotice() {
  const corrections: MetronomeCorrection[] = [];
  let reported = false;
  return {
    collect: (items: MetronomeCorrection[]) => {
      corrections.push(...items);
    },
    message() {
      if (!corrections.length || reported) return "";
      console.warn("Normalized metronome settings", {
        count: corrections.length,
        corrections: corrections.slice(0, 10),
      });
      reported = true;
      return t("metronome.corrected");
    },
  };
}
