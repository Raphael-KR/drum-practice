import { t } from "./i18n";
import { createConfirmationDialog } from "./dialog-ui";

/** The filename is text, never HTML. Close and Escape are cancellation. */
export function confirmDuplicateAudio(filename: string): Promise<boolean> {
  return new Promise(resolve => {
    const dialog = createConfirmationDialog({
      id: "audio-duplicate-dialog",
      label: t("audioPractice.duplicateTitle"),
      title: filename,
      message: t("audioPractice.duplicateConfirm"),
      actions: [
        { answer: "yes", label: t("audioPractice.duplicateYes"), className: "primary" },
        { answer: "no", label: t("audioPractice.duplicateNo") },
      ],
    });
    dialog.querySelectorAll<HTMLButtonElement>("[data-answer]").forEach(button => {
      button.onclick = () => dialog.close(button.dataset.answer);
    });
    dialog.addEventListener("close", () => {
      const accepted = dialog.returnValue === "yes";
      dialog.remove();
      resolve(accepted);
    }, { once: true });
    dialog.showModal();
    dialog.focus();
  });
}
