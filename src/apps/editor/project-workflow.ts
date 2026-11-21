import type { RecordData } from "../../model/record";
import type { LocalProjectHead, ProjectWork } from "../../model/score-project";
import { t, formatDate } from "../../shared/i18n/i18n";
import { icon } from "../../shared/ui/icon-svg";
import { setIconButton } from "../../shared/ui/icon-button";
import {
  observeProject,
  projectRecord,
  projectRequest,
  readProject,
} from "./score-project-client";

interface Host {
  record(): RecordData | undefined;
  dirty(): boolean;
  blocked(): boolean;
  persist(): Promise<void>;
  activate(record: RecordData, alreadySaved: boolean): Promise<void>;
  error(error: unknown): void;
}

/** A request announces the shared project, not an exported copy or an implicit save confirmation. */
export function installProjectWorkflow(h: Host) {
  const controls = document.getElementById("editor-controls")!;
  const panel = document.getElementById("project-work")!;
  const folder = document.createElement("button");
  folder.id = "project-folder";
  setIconButton(folder, icon("folder"), t("editorWork.folder"));
  const request = document.createElement("button");
  request.textContent = t("editorWork.request");
  const refresh = document.createElement("button");
  refresh.textContent = t("editorWork.refresh");
  const status = document.createElement("small");
  status.setAttribute("role", "status");
  controls.append(folder, request, refresh, status);
  let dispose: (() => void) | undefined,
    generation = 0;
  let latest: LocalProjectHead | undefined;
  let difference = "";
  let reading = false;
  const run = async (button: HTMLButtonElement, work: () => Promise<void>) => {
    if (button.disabled) return;
    button.disabled = true;
    try {
      await work();
    } catch (error) {
      h.error(error);
    } finally {
      button.disabled = false;
    }
  };
  folder.onclick = () =>
    void run(folder, async () => {
      const r = h.record();
      if (r)
        await projectRequest(`/${encodeURIComponent(r.song.id)}/folder`, {});
    });
  request.onclick = () =>
    void run(request, async () => {
      const r = h.record();
      if (!r) return;
      await h.persist();
      const work = await projectRequest<ProjectWork>(
        `/${encodeURIComponent(r.song.id)}/request`,
        {},
      );
      if (h.record() !== r) return;
      render(work);
      const receipt = work.entries.at(-1);
      status.textContent = t(
        receipt?.delivery === "accepted"
          ? "editorWork.accepted"
          : "editorWork.notDelivered",
      );
    });
  async function reload(confirmed = false) {
    const r = h.record();
    if (!r || reading || h.blocked()) return;
    reading = true;
    try {
      // Preserve the current draft before loading another confirmed save.
      await h.persist();
      const view = await readProject(r.song.id);
      if (h.record() !== r) return;
      latest = view.head;
      const next = projectRecord({ ...view, draft: undefined });
      const ids = new Set(
        [...r.song.lyrics, ...next.song.lyrics].map((l) => l.id),
      );
      difference = t("editorWork.saveDifference", {
        lyrics: [...ids].filter(
          (id) =>
            JSON.stringify(r.song.lyrics.find((l) => l.id === id)) !==
            JSON.stringify(next.song.lyrics.find((l) => l.id === id)),
        ).length,
        metadata: (
          [
            "title",
            "originalTitle",
            "artist",
            "composer",
            "lyricist",
            "bpm",
            "firstBeat",
          ] as const
        ).filter((key) => r.song[key] !== next.song[key]).length,
        measures:
          new Set([...r.song.measures, ...next.song.measures].map((m) => m.id))
            .size -
          r.song.measures.filter(
            (m) =>
              JSON.stringify(m) ===
              JSON.stringify(next.song.measures.find((n) => n.id === m.id)),
          ).length,
      });
      render(view.work);
      if (!confirmed && (h.dirty() || r.editDraft)) {
        status.textContent = t("editorWork.draftPreserved");
        return;
      }
      next.localDraft = view.draft && {
        id: view.draft.id,
        base: view.draft.base,
      };
      await h.activate(next, true);
    } finally {
      reading = false;
    }
  }
  refresh.onclick = () => void run(refresh, () => reload());
  function render(work: ProjectWork) {
    // SSE notifications must not discard an answer being typed.
    const answers = new Map(
      Array.from(
        panel.querySelectorAll<HTMLTextAreaElement>("[data-question]"),
        (el) => [el.dataset.question!, el.value],
      ),
    );
    panel.replaceChildren();
    const current = h.record()?.localProject;
    if (latest && latest.revision !== current?.revision) {
      const message = document.createElement("p");
      message.textContent = t("editorWork.newSave", {
        date: formatDate(new Date(latest.savedAt)),
      });
      if (difference)
        message.append(document.createTextNode(`\n${difference}`));
      const load = document.createElement("button");
      load.textContent = t("editorWork.loadConfirmed");
      load.onclick = () => void run(load, () => reload(true));
      panel.append(message, load);
    }
    for (const entry of work.entries.slice(-30)) {
      const row = document.createElement("article");
      const caption = document.createElement("small");
      caption.textContent = `${formatDate(new Date(entry.at))} · ${t(entry.author === "editor" ? "editorWork.user" : "editorWork.producer")}`;
      const text = document.createElement("p");
      text.textContent =
        entry.kind === "request"
          ? t(
              entry.delivery === "accepted"
                ? "editorWork.accepted"
                : "editorWork.notDelivered",
            )
          : entry.text;
      row.append(caption, text);
      if (
        entry.kind === "question" &&
        !work.entries.some(
          (answer) =>
            answer.questionId === entry.id && answer.kind === "answer",
        )
      ) {
        const answer = document.createElement("textarea");
        answer.dataset.question = entry.id;
        answer.setAttribute("aria-label", entry.text);
        answer.value = answers.get(entry.id) ?? "";
        const send = document.createElement("button");
        send.textContent = t("editorWork.answer");
        send.onclick = () =>
          void run(send, async () => {
            const r = h.record();
            if (!r || !answer.value.trim()) return;
            const result = await projectRequest<ProjectWork>(
              `/${encodeURIComponent(r.song.id)}/answer`,
              { questionId: entry.id, text: answer.value },
            );
            if (h.record() === r) render(result);
          });
        row.append(answer, send);
      }
      panel.append(row);
    }
  }
  function close() {
    generation++;
    dispose?.();
    dispose = undefined;
    panel.replaceChildren();
    latest = undefined;
    difference = "";
  }
  return {
    close,
    open(record: RecordData) {
      close();
      const token = generation;
      status.textContent = "";
      dispose = observeProject(record.song.id, (value) => {
        if (token !== generation || h.record() !== record) return;
        latest = value.head;
        render(value.work);
        if (!h.blocked() && latest?.revision !== record.localProject?.revision)
          void reload().catch(h.error);
      });
    },
  };
}
