import { t } from "./i18n";
import { createDialog } from "./dialog-ui";
import {
  validAudioAnalysis,
  type AudioAnalysis,
} from "./audio-analysis-contract";
import "./analysis-review.css";
const path = "/api/local-analysis-review";
interface Candidate {
  sha256: string;
  title: string;
  artist: string;
  bpm: number;
  source: string;
}
interface Summary {
  csrf: string;
  remoteAvailable: boolean;
  rows: Candidate[];
}
async function read<T>(suffix: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path + suffix, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw Error(t("review.failed"));
  return response.json();
}
export async function installAnalysisReview(button: HTMLButtonElement) {
  let summary: Summary | undefined;
  const label = () => {
    button.textContent = t("review.count", {
      count: String(summary!.rows.length).padStart(2, "0"),
    });
    if (!summary!.remoteAvailable)
      button.textContent += ` · ${t("review.remoteUnavailable")}`;
  };
  const refresh = async () => {
    button.setAttribute("aria-busy", "true");
    try {
      summary = await read<Summary>("/summary");
      label();
    } catch {
      summary = undefined;
      button.textContent = t("review.unavailable");
    } finally {
      button.removeAttribute("aria-busy");
    }
  };
  button.onclick = async () => {
    const dialog = createDialog(
      "analysis-review-dialog",
      t("review.title"),
      "tool-dialog analysis-review-dialog",
      document.body,
    );
    const body = document.createElement("section");
    body.className = "tool-body analysis-review-body";
    const hint = document.createElement("p");
    hint.textContent = t("review.hint");
    const status = document.createElement("p");
    status.setAttribute("role", "status");
    const reload = document.createElement("button");
    reload.textContent = t("review.refresh");
    reload.title = t("review.refresh");
    const list = document.createElement("div");
    list.className = "analysis-review-list";
    const form = document.createElement("div");
    form.className = "analysis-review-form";
    body.append(hint, reload, status, list, form);
    dialog.append(body);
    dialog.showModal();
    dialog.addEventListener(
      "close",
      () => {
        dialog.remove();
        void refresh();
      },
      { once: true },
    );
    let selection = 0;
    const render = () => {
      selection++;
      list.replaceChildren();
      status.textContent = summary?.remoteAvailable
        ? ""
        : t("review.remoteUnavailableHint");
      if (!summary?.rows.length) {
        const empty = document.createElement("p");
        empty.textContent = t("review.empty");
        list.append(empty);
        return;
      }
      for (const row of summary.rows) {
        const select = document.createElement("button");
        select.textContent = `${row.title || row.sha256.slice(0, 12)} · ${row.artist} · ${row.bpm} BPM`;
        select.title = select.textContent;
        select.onclick = async () => {
          const selected = ++selection;
          form.replaceChildren();
          status.textContent = t("review.loading");
          try {
            const item = await read<{ value: AudioAnalysis; revision: string }>(
              `/item?hash=${row.sha256}`,
            );
            if (selected !== selection) return;
            if (!validAudioAnalysis(item.value, row.sha256)) throw Error();
            const hash = document.createElement("p");
            hash.className = "analysis-review-hash";
            hash.textContent = `SHA-256: ${row.sha256}`;
            form.append(hash);
            const inputs = new Map<string, HTMLInputElement>();
            for (const key of [
              "title",
              "artist",
              "bpm",
              "firstBeat",
              "beats",
              "denominator",
            ] as const) {
              const label = document.createElement("label");
              label.textContent = t(
                key === "title" ? "review.titleField" : `review.${key}`,
              );
              const input = document.createElement("input");
              input.type =
                key === "title" || key === "artist" ? "text" : "number";
              if (input.type === "text") input.maxLength = 300;
              else input.step = "any";
              input.value = String(item.value[key]);
              label.append(input);
              form.append(label);
              inputs.set(key, input);
            }
            const details = document.createElement("details");
            const heading = document.createElement("summary");
            heading.textContent = t("review.beatTimes");
            const times = document.createElement("textarea");
            times.rows = 6;
            times.value = JSON.stringify(item.value.beatTimes ?? []);
            times.maxLength = 256 * 1024;
            times.setAttribute("aria-label", t("review.beatTimes"));
            details.append(heading, times);
            form.append(details);
            const checkLabel = document.createElement("label");
            checkLabel.className = "analysis-review-check";
            const check = document.createElement("input");
            check.type = "checkbox";
            checkLabel.append(
              check,
              document.createTextNode(t("review.confirm")),
            );
            form.append(checkLabel);
            const actions = document.createElement("div");
            actions.className = "actions";
            const approve = document.createElement("button");
            approve.textContent = t("review.approve");
            approve.title = t("review.approve");
            approve.disabled = true;
            approve.className = "primary";
            check.onchange = () => {
              approve.disabled = !check.checked;
            };
            const reject = document.createElement("button");
            reject.textContent = t("review.reject");
            reject.title = t("review.reject");
            const decide = async (approved: boolean) => {
              approve.disabled = reject.disabled = true;
              try {
                const value = {
                  ...item.value,
                  title: inputs.get("title")!.value,
                  artist: inputs.get("artist")!.value,
                };
                for (const key of [
                  "bpm",
                  "firstBeat",
                  "beats",
                  "denominator",
                ] as const)
                  value[key] = Number(inputs.get(key)!.value);
                if (approved) {
                  const beats: unknown = JSON.parse(times.value);
                  if (!Array.isArray(beats)) throw Error(t("review.invalid"));
                  if (beats.length) value.beatTimes = beats;
                  else delete value.beatTimes;
                }
                if (approved && !validAudioAnalysis(value, row.sha256))
                  throw Error(t("review.invalid"));
                const result = await read<{ cleanupPending: boolean }>(
                  `/${approved ? "approve" : "reject"}?hash=${row.sha256}`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "X-Review-CSRF": summary!.csrf,
                    },
                    body: JSON.stringify({
                      value,
                      revision: item.revision,
                      reviewed: check.checked,
                    }),
                  },
                );
                summary!.rows = summary!.rows.filter(
                  (candidate) => candidate.sha256 !== row.sha256,
                );
                form.replaceChildren();
                render();
                status.textContent = t(
                  approved ? "review.approved" : "review.rejected",
                );
                if (result.cleanupPending)
                  status.textContent += ` ${t("review.cleanupPending")}`;
                label();
              } catch (error) {
                status.textContent =
                  error instanceof Error ? error.message : t("review.failed");
              } finally {
                approve.disabled = !check.checked;
                reject.disabled = false;
              }
            };
            approve.onclick = () => void decide(true);
            reject.onclick = () => void decide(false);
            actions.append(approve, reject);
            form.append(actions);
            status.textContent = "";
          } catch {
            status.textContent = t("review.failed");
          }
        };
        list.append(select);
      }
    };
    reload.onclick = async () => {
      reload.disabled = true;
      await refresh();
      form.replaceChildren();
      render();
      reload.disabled = false;
    };
    if (!summary) await refresh();
    render();
  };
  await refresh();
}
