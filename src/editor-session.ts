import { createDialog } from "./dialog-ui";
import {
  EditHistory,
  retainRevision,
  snapshot,
  type EditSnapshot,
  type EditorForm,
} from "./edit-history";
import { formatDate, t as i18nText } from "./i18n";
import type { RecordData } from "./storage";
export interface SessionHost {
  get: () => RecordData | undefined;
  pending: () => boolean;
  form: () => EditorForm;
  restoreForm: (f: EditorForm) => void;
  apply: (s: EditSnapshot) => void;
  flush: () => void;
  persist: () => Promise<void>;
  error: (e: unknown) => void;
}
export function editorSession(host: SessionHost) {
  const dialog = document.getElementById("editor-dialog") as HTMLDialogElement;
  let history: EditHistory | undefined,
    pendingWrite: ReturnType<typeof setTimeout> | undefined;
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
  button(i18nText("editor-session.message031"), "✓", () => commit(false)).id =
    "edit-commit";
  dialog.querySelector(".editor-tabs")!.after(controls);
  const confirmDialog = document.createElement("dialog");
  confirmDialog.id = "edit-exit-dialog";
  confirmDialog.className = "compact-dialog";
  confirmDialog.innerHTML =
    "<h2>" +
    i18nText("editor-session.message032") +
    "</h2><p>" +
    i18nText("editor-session.message033") +
    '</p><div class="form-footer"><button data-answer="discard" class="danger">' +
    i18nText("editor-session.message034") +
    '</button><button data-answer="continue" autofocus>' +
    i18nText("editor-session.message035") +
    '</button><button data-answer="save" class="primary">' +
    i18nText("editor-session.message036") +
    "</button></div>";
  document.body.append(confirmDialog);
  const versions = createDialog(
    "edit-versions-dialog",
    i18nText("editor-session.message030"),
    "management-dialog",
  );
  function dirty() {
    const r = host.get();
    return !!history && !!r && (history.changed(r) || host.pending());
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
    if (!history) return;
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
    if (!history || !r) return;
    host.flush();
    const s = forward ? history.redo(r) : history.undo(r);
    if (s) {
      host.apply(s);
      schedule();
    }
  }
  async function commit(close: boolean) {
    clearTimeout(pendingWrite);
    const r = host.get();
    if (!r || !history) return;
    host.flush();
    const oldRevisions = r.revisions,
      oldDraft = r.editDraft;
    const previous = history;
    if (history.changed(r))
      r.revisions = retainRevision(r.revisions, history.base);
    delete r.editDraft;
    history = undefined;
    try {
      await host.persist();
      history = new EditHistory(r);
      refresh();
      if (close) {
        history = undefined;
        dialog.close();
      }
    } catch (e) {
      history = previous;
      r.revisions = oldRevisions;
      r.editDraft = oldDraft;
      throw e;
    }
  }
  async function discard() {
    const r = host.get();
    if (!r || !history) return;
    const previous = history;
    host.apply(history.base);
    delete host.get()!.editDraft;
    history = undefined;
    try {
      await host.persist();
      dialog.close();
    } catch (e) {
      history = previous;
      throw e;
    }
  }
  function exit() {
    clearTimeout(pendingWrite);
    if (!history || !dirty()) {
      history = undefined;
      dialog.close();
      return;
    }
    capture();
    void host.persist().catch(host.error);
    confirmDialog.showModal();
  }
  dialog.querySelector<HTMLButtonElement>(
    '[data-close="editor-dialog"]',
  )!.onclick = exit;
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    exit();
  });
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
  confirmDialog.querySelectorAll<HTMLButtonElement>("[data-answer]").forEach(
    (b) =>
      (b.onclick = () => {
        const answer = b.dataset.answer;
        if (answer === "continue") {
          confirmDialog.close();
          return;
        }
        b.disabled = true;
        void (answer === "save" ? commit(true) : discard())
          .then(() => confirmDialog.close())
          .catch(host.error)
          .finally(() => (b.disabled = false));
      }),
  );
  function showVersions() {
    const r = host.get();
    if (!r) return;
    for (const child of [...versions.children])
      if (!child.classList.contains("dialoghead")) child.remove();
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
    if (!r.revisions?.length) {
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
