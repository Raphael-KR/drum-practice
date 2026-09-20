import {
  EditHistory,
  snapshot,
  retainRevision,
  type EditSnapshot,
  type EditorForm,
} from "./edit-history";
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
  const undo = button("되돌리기 (⌘Z)", "↶", () => move(false)),
    redo = button("다시 실행 (⇧⌘Z)", "↷", () => move(true));
  button("이전 저장본", "◴", showVersions).id = "edit-revisions";
  button("변경 저장", "✓", () => commit(false)).id = "edit-commit";
  dialog.querySelector(".editor-tabs")!.after(controls);
  const confirmDialog = document.createElement("dialog");
  confirmDialog.id = "edit-exit-dialog";
  confirmDialog.innerHTML =
    '<h2>변경 내용을 저장할까요?</h2><p>편집 내용은 별도 초안으로 임시저장됩니다.</p><div class="flex"><button data-answer="discard">변경 버리기</button><button data-answer="continue">계속 편집</button><button data-answer="save" class="primary">저장</button></div>';
  document.body.append(confirmDialog);
  const versions = document.createElement("dialog");
  versions.id = "edit-versions-dialog";
  document.body.append(versions);
  function dirty() {
    const r = host.get();
    return !!history && !!r && (history.changed(r) || host.pending());
  }
  function refresh() {
    status.textContent = dirty() ? "변경 있음 · 임시저장 중" : "저장된 상태";
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
          status.textContent = dirty() ? "임시저장됨" : "저장된 상태";
        })
        .catch((e) => {
          status.textContent = "임시저장 실패";
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
      if (
        confirm("이 곡에 저장하지 않은 초안이 있습니다. 이어서 편집할까요?")
      ) {
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
    versions.replaceChildren();
    const h = document.createElement("h2");
    h.textContent = "이전 저장본";
    const close = document.createElement("button");
    close.textContent = "×";
    close.setAttribute("aria-label", "닫기");
    close.onclick = () => versions.close();
    versions.append(h, close);
    for (const v of [...(r.revisions || [])].reverse()) {
      const b = document.createElement("button");
      b.className = "management-row";
      b.textContent = new Date(v.savedAt).toLocaleString("ko-KR") + " · 복원";
      b.onclick = () => {
        if (
          v.song.pdfName !== r.song.pdfName ||
          v.song.audioName !== r.song.audioName
        ) {
          host.error(
            Error(
              "이 저장본은 교체 전 파일을 사용합니다. 해당 파일이 포함된 전체 백업으로 복원하세요.",
            ),
          );
          return;
        }
        if (
          !confirm(
            "현재 편집 내용을 저장 이력에 보존하고 선택한 저장본으로 복원할까요?",
          )
        )
          return;
        host.flush();
        r.revisions = retainRevision(r.revisions, r);
        before();
        host.apply(v);
        schedule();
        versions.close();
        status.textContent = "복원됨 · 저장하면 확정됩니다.";
      };
      versions.append(b);
    }
    if (!r.revisions?.length) {
      const p = document.createElement("p");
      p.textContent = "아직 이전 저장본이 없습니다.";
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
