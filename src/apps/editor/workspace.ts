import appVersions from "../../app-versions.json";
import buildInfo from "../../generated/build-info.generated.json";
import { showAppBuildLabel } from "../../shared/ui/app-build-label";
import { t } from "../../shared/i18n/i18n";
import { zoomFieldHTML } from "../../modules/playback/playback-forms";
import { mountPlaybackShell } from "../../modules/playback/playback-shell";

/** Authoring composes the shared score and transport without practice-only panels. */
export function arrangeWorkspace() {
  const el = (id: string) => document.getElementById(id)!;
  el("app").classList.add("authoring-workspace");
  mountPlaybackShell(el("app"), {
    authoring: true,
    ids: {
      title: "song-title",
      tempo: "original-tempo",
      rewind: "goto",
      rewindButton: "jump",
      position: "copy-position",
      progress: "progress-percent",
    },
  });
  const header = document.createElement("div");
  header.id = "editor-view-controls";
  header.innerHTML = `<div class="row-view-toggle segmented-control" role="group" aria-label="${t("main.message108")}">${(["ribbon", "rows", "compare"] as const).map((view, i) => `<button type="button" data-row-view="${view}">${t((["main.message109", "main.message110", "main.message111"] as const)[i])}</button>`).join("")}</div><select id="view" hidden><option value="ribbon"></option><option value="rows"></option><option value="compare"></option></select><div id="editor-full-scores"></div>${zoomFieldHTML()}`;
  el("app").querySelector("header")!.append(header);
  showAppBuildLabel(el("app"), appVersions.editor.version, buildInfo.source);
  el("practice").querySelector(".statusline")!.append(el("error-notice"));
  el("copy-position").classList.add("review-position");
  el("practice").querySelector(".statusline")!.append(el("copy-position"));
  const controls = document.createElement("div");
  controls.id = "editor-controls";
  controls.className = "editor-controls";
  controls.innerHTML = `<label class="editor-grid">${t("editorWork.grid")}<select id="lyric-grid">${[8, 16, 32, 64].map((n) => `<option value="${n}"${n === 64 ? " selected" : ""}>${t("editorWork.gridValue", { value: n })}</option>`).join("")}</select></label>`;
  el("practice").querySelector(".transport-right")!.append(controls);
  el("practice").append(el("editor-dialog"));
}
export function openEditorDialog(child: HTMLDialogElement) {
  child.showModal();
}
