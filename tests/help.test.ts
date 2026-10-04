// @vitest-environment jsdom
import { it, expect, vi, beforeEach } from "vitest";
import { installHelp } from "../src/help";
beforeEach(() => {
  document.body.innerHTML =
    '<main id="app"><section id="practice"><div id="stage"></div><div class="transport"></div><div id="playback-drawer"></div></section><dialog id="settings-dialog"><div class="dialoghead">Settings</div><section>Fields</section></dialog></main>';
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 200, height: 100 },
  ] as unknown as DOMRectList);
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
});
it("opens useful playback help, without a footer or placeholder, and restores focus", () => {
  const root = document.querySelector<HTMLElement>("#app")!;
  installHelp(root);
  installHelp(root);
  expect(root.querySelectorAll("#app-help-button")).toHaveLength(1);
  root.querySelector<HTMLButtonElement>("#app-help-button")!.click();
  const d = root.querySelector<HTMLDialogElement>("#app-help-dialog")!;
  expect(d.textContent).toContain("두 번 탭");
  expect(d.textContent).toContain("Space");
  expect(d.querySelectorAll(".help-cards section")).toHaveLength(3);
  expect(d.querySelector<HTMLElement>(".help-pages")!.hidden).toBe(true);
  d.close();
  expect(document.activeElement?.id).toBe("app-help-button");
  expect(root.querySelector("#app-help-dialog")).toBeNull();
});
it("keeps the main help visible in its header while settings or the reader is open", async () => {
  const root = document.querySelector<HTMLElement>("#app")!;
  root.insertAdjacentHTML('afterbegin','<header><div class="actions"></div></header>');
  root.insertAdjacentHTML('beforeend','<dialog class="score-reader-dialog"><div class="dialoghead"></div></dialog>');
  installHelp(root);
  await Promise.resolve();
  const button=root.querySelector<HTMLButtonElement>('#app-help-button')!;
  for (const modal of root.querySelectorAll<HTMLDialogElement>('dialog')) {
    modal.showModal(); await Promise.resolve();
    expect(button.parentElement).toBe(root.querySelector('header .actions'));
    expect(button.hidden).toBe(false);
    expect(modal.querySelector('#app-help-button')).toBeNull();
    modal.close(); await Promise.resolve();
    expect(button.parentElement).toBe(root.querySelector('header .actions'));
  }
});
it("keeps playback help on one page on small screens", () => {
  vi.stubGlobal("innerWidth", 390);
  const root = document.querySelector<HTMLElement>("#app")!;
  installHelp(root);
  root.querySelector<HTMLButtonElement>("#app-help-button")!.click();
  const d = root.querySelector<HTMLDialogElement>("#app-help-dialog")!;
  expect(d.querySelectorAll(".help-cards section")).toHaveLength(3);
  expect(d.querySelector<HTMLElement>(".help-pages")!.hidden).toBe(true);
  expect(d.querySelectorAll(".help-cards li")).toHaveLength(10);
  d.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
  expect(d.querySelectorAll(".help-cards section")).toHaveLength(3);
  d.close();
  vi.unstubAllGlobals();
});
it("includes all approved legend entries independently of contextual controls", () => {
  const root = document.querySelector<HTMLElement>("#app")!;
  root.innerHTML = "<section>Library</section>";
  installHelp(root);
  root.querySelector<HTMLButtonElement>("#app-help-button")!.click();
  expect(
    root.querySelector("#app-help-dialog .help-content .help-legend"),
  ).toBeNull();
  root.querySelector<HTMLButtonElement>(".help-legend-button")!.click();
  const legend = root.querySelector<HTMLElement>(
    "#app-legend-dialog .help-legend",
  )!;
  expect(legend.querySelectorAll("dt")).toHaveLength(27);
  const text = legend.textContent!;
  for (const name of [
    "크래시",
    "하이햇 반열림",
    "하이햇 열기",
    "하이햇 닫기",
    "오픈 하이햇",
    "스네어 버즈 롤",
    "왼발 베이스",
    "손 지시",
  ])
    expect(text).toContain(name);
  expect(legend.querySelectorAll("svg")).toHaveLength(2);
  for (const svg of legend.querySelectorAll("svg")) {
    expect(svg.querySelectorAll("text.name")).toHaveLength(27);
  }
  const landscape = Array.from(legend.querySelectorAll(".legend-landscape text.name"), e => e.textContent);
  const portrait = Array.from(legend.querySelectorAll(".legend-portrait text.name"), e => e.textContent);
  expect(portrait).toEqual(landscape);
  const ids = Array.from(legend.querySelectorAll("[id]"), e => e.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(legend.querySelectorAll("feDisplacementMap")).toHaveLength(2);
  expect(legend.querySelectorAll("g[filter] text")).toHaveLength(0);
  expect(root.querySelector("#app-legend-dialog h2")).toBeNull();
  expect(text).toContain("위 첫째 덧줄의 ×. 원이 없습니다.");
});

it("returns from legend to the unchanged help and restores focus", () => {
  const root = document.querySelector<HTMLElement>("#app")!;
  installHelp(root);
  root.querySelector<HTMLButtonElement>("#app-help-button")!.click();
  const help = root.querySelector<HTMLDialogElement>("#app-help-dialog")!;
  const before = help.querySelector(".help-content")!.innerHTML;
  const button = help.querySelector<HTMLButtonElement>(".help-legend-button")!;
  button.click();
  const legend = root.querySelector<HTMLDialogElement>("#app-legend-dialog")!;
  expect(legend.open).toBe(true);
  legend.close();
  expect(help.open).toBe(true);
  expect(help.querySelector(".help-content")!.innerHTML).toBe(before);
  expect(document.activeElement).toBe(button);
  button.click();
  help.close();
  expect(root.querySelector("#app-legend-dialog")).toBeNull();
});

it("closes the headerless legend by clicking the illustration or empty space", () => {
  const root = document.querySelector<HTMLElement>("#app")!;
  installHelp(root);
  root.querySelector<HTMLButtonElement>("#app-help-button")!.click();
  const opener = root.querySelector<HTMLButtonElement>(".help-legend-button")!;
  for (const target of ["svg text.name", null]) {
    opener.click();
    const modal = root.querySelector<HTMLDialogElement>("#app-legend-dialog")!;
    expect(modal.querySelector(".dialoghead")).toBeNull();
    (target ? modal.querySelector(target)! : modal).dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
    expect(root.querySelector("#app-legend-dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
    expect(
      root.querySelector<HTMLDialogElement>("#app-help-dialog")!.open,
    ).toBe(true);
  }
});
