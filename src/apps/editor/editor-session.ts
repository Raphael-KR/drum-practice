import { projectRequest } from "./score-project-client";
import { unpackSong } from "../../platform/storage/record-serialization";
import type { LocalProjectHead } from "../../model/score-project";
import type { PackedRecord } from "../../model/serialized-record";
import { mediaIdentity } from "../../modules/audio/media";
import { createDialog } from "../../shared/ui/dialog-ui";
import {
  EditHistory,
  retainRevision,
  snapshot,
  type EditSnapshot,
  type EditorForm,
} from "../../model/edit-history";
import { formatDate, t as i18nText } from "../../shared/i18n/i18n";
import type { RecordData } from "../../model/record";
import { prepareLyricCorrectionSave } from "./lyric-correction-save";
import { appendLyricCorrectionHistory } from "./lyric-correction-history";
export interface SessionHost {
  get: () => RecordData | undefined;
  pending: () => boolean;
  form: () => EditorForm;
  restoreForm: (f: EditorForm) => void;
  apply: (s: EditSnapshot) => void;
  flush: () => void;
  persist: (confirmed?: RecordData) => Promise<void>;
  error: (e: unknown) => void;
}
export function editorSession(host: SessionHost) {
  const dialog = document.getElementById("editor-dialog")!;
  let history: EditHistory | undefined,
    pendingWrite: ReturnType<typeof setTimeout> | undefined;
  let committing = false;
  const status = document.createElement("small");
  status.id = "edit-draft-status";
  status.setAttribute("role", "status");
  const controls = document.createElement("div");
  controls.className = "editor-history-tools";
  controls.append(status);
  const button = (name: string, label: string, run: () => unknown) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.setAttribute("aria-label", name);
    b.title = name;
    b.onclick = () => {
      try {
        Promise.resolve(run()).catch(host.error);
      } catch (e) {
        host.error(e);
      }
    };
    controls.append(b);
    return b;
  };
  const undo = button(i18nText("editor-session.message028"), "↶", () =>
      move(false),
    ),
    redo = button(i18nText("editor-session.message029"), "↷", () => move(true));
  button(i18nText("editor-session.message030"), "◴", showVersions).id =
    "edit-revisions";
  button(i18nText("editor-session.message031"), "✓", () => commit()).id =
    "edit-commit";
  document.getElementById("editor-controls")!.append(controls);
  const versions = createDialog(
    "edit-versions-dialog",
    i18nText("editor-session.message030"),
    "management-dialog",
  );
  function dirty() {
    const r = host.get();
    return (
      !!history &&
      !!r &&
      (!!r.localDraftChanges || history.changed(r) || host.pending())
    );
  }
  function refresh() {
    status.textContent = dirty()
      ? i18nText("editor-session.message037")
      : i18nText("editor-session.message038");
    undo.disabled = !history?.undoStack.length;
    redo.disabled = !history?.redoStack.length;
  }
  function capture() {
    const r = host.get();
    if (!r || !history) return;
    r.editDraft = dirty()
      ? { ...snapshot(r), form: host.form(), savedAt: new Date().toISOString() }
      : undefined;
  }
  function schedule() {
    if (!history || committing) return;
    capture();
    refresh();
    clearTimeout(pendingWrite);
    pendingWrite = setTimeout(() => {
      void host
        .persist()
        .then(() => {
          status.textContent = dirty()
            ? i18nText("editor-session.message039")
            : i18nText("editor-session.message038");
        })
        .catch((e) => {
          status.textContent = i18nText("editor-session.message040");
          host.error(e);
        });
    }, 180);
  }
  function begin() {
    const r = host.get();
    if (history && r?.song.id !== history.base.song.id) history = undefined;
    if (!r || history) return;
    history = new EditHistory(r);
    const draft = r.editDraft;
    if (draft) {
      if (confirm(i18nText("editor-session.message041"))) {
        host.apply(draft);
        if (draft.form) host.restoreForm(draft.form);
      } else {
        delete r.editDraft;
        void host.persist().catch(host.error);
      }
    }
    refresh();
  }
  function before() {
    const r = host.get();
    if (history && r) history.push(r);
  }
  function move(forward: boolean) {
    const r = host.get();
    if (!history || !r || committing) return;
    host.flush();
    const s = forward ? history.redo(r) : history.undo(r);
    if (s) {
      host.apply(s);
      schedule();
    }
  }
  async function commit() {
    clearTimeout(pendingWrite);
    const r = host.get();
    if (!r || !history || committing) return;
    host.flush();
    const oldRevisions = r.revisions,
      oldDraft = r.editDraft,
      oldCorrections = r.lyricCorrections,
      oldDelivery = r.lyricCorrectionDelivery;
    const oldFileChanges = r.localDraftChanges;
    const previous = history;
    committing = true;
    // Async hashing/storage must not mix this save with another edit or close.
    const wasInert = dialog.inert;
    dialog.inert = true;
    try {
      await prepareLyricCorrectionSave(r, previous.base);
      if (previous.changed(r))
        r.revisions = retainRevision(r.revisions, previous.base);
      delete r.editDraft;
      delete r.localDraftChanges;
      history = undefined;
      await host.persist(r);
      history = new EditHistory(r);
      refresh();
    } catch (e) {
      history = previous;
      r.revisions = oldRevisions;
      r.editDraft = oldDraft;
      r.lyricCorrections = oldCorrections;
      r.lyricCorrectionDelivery = oldDelivery;
      r.localDraftChanges = oldFileChanges;
      throw e;
    } finally {
      dialog.inert = wasInert;
      committing = false;
    }
  }
  dialog.addEventListener("input", schedule);
  dialog.addEventListener("change", schedule);
  dialog.addEventListener("keydown", (e) => {
    if (
      !(e.metaKey || e.ctrlKey) ||
      e.key.toLowerCase() !== "z" ||
      ["INPUT", "TEXTAREA", "SELECT"].includes((e.target as Element).tagName)
    )
      return;
    e.preventDefault();
    try {
      move(e.shiftKey);
    } catch (err) {
      host.error(err);
    }
  });
  async function showVersions() {
    const r = host.get();
    if (!r) return;
    for (const child of [...versions.children])
      if (!child.classList.contains("dialoghead")) child.remove();
    appendLyricCorrectionHistory(versions, r);
    let count = r.revisions?.length ?? 0;
    if (r.localProject) {
      const history = await projectRequest<LocalProjectHead[]>(
        `/${encodeURIComponent(r.song.id)}/history`,
      );
      if (host.get() !== r) return;
      count += history.length;
      for (const head of history) {
        const button = document.createElement("button");
        button.className = "management-row";
        button.textContent = `${formatDate(new Date(head.savedAt))} · ${head.author} · ${head.revision.slice(0, 8)}`;
        button.onclick = () =>
          void (async () => {
            if (!confirm(i18nText("editor-session.message045"))) return;
            const saved = await projectRequest<{ record: PackedRecord }>(
              `/${encodeURIComponent(r.song.id)}/save/${head.revision}`,
            );
            if (host.get() !== r) return;
            const previous = unpackSong(saved.record);
            // Restore music as an editable draft only when its original media is unchanged.
            const [oldMedia, currentMedia] = await Promise.all([
              mediaIdentity(previous.pdf, previous.audio),
              mediaIdentity(r.pdf, r.audio),
            ]);
            if (
              oldMedia.pdf !== currentMedia.pdf ||
              oldMedia.audio !== currentMedia.audio
            )
              throw Error(i18nText("editorWork.historyAssets"));
            if (host.get() !== r || committing) return;
            host.flush();
            before();
            host.apply(snapshot(previous));
            schedule();
            versions.close();
          })().catch(host.error);
        versions.append(button);
      }
    }
    for (const v of [...(r.revisions || [])].reverse()) {
      const b = document.createElement("button");
      b.className = "management-row";
      b.textContent =
        formatDate(new Date(v.savedAt)) + i18nText("editor-session.message043");
      b.onclick = () => {
        if (
          v.song.pdfName !== r.song.pdfName ||
          v.song.audioName !== r.song.audioName
        ) {
          host.error(Error(i18nText("editor-session.message044")));
          return;
        }
        if (!confirm(i18nText("editor-session.message045"))) return;
        host.flush();
        r.revisions = retainRevision(r.revisions, r);
        before();
        host.apply(v);
        schedule();
        versions.close();
        status.textContent = i18nText("editor-session.message046");
      };
      versions.append(b);
    }
    if (!count) {
      const p = document.createElement("p");
      p.textContent = i18nText("editor-session.message047");
      versions.append(p);
    }
    versions.showModal();
  }
  return {
    reset: () => {
      clearTimeout(pendingWrite);
      history = undefined;
    },
    begin,
    before,
    changed: schedule,
    active: () => !!history,
    saving: () => committing,
    dirty,
    commit,
    forStorage: (): RecordData | undefined => {
      const r = host.get();
      if (!r || !history) return r;
      if (r.song.id !== history.base.song.id) {
        history = undefined;
        return r;
      }
      capture();
      return {
        ...r,
        ...history.base,
        song: { ...history.base.song, settings: r.song.settings },
        editDraft: r.editDraft,
      };
    },
  };
}
