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
it("moves entry into the active modal and does not show playback shortcuts there", async () => {
  const root = document.querySelector<HTMLElement>("#app")!;
  installHelp(root);
  const settings = root.querySelector<HTMLDialogElement>("#settings-dialog")!;
  settings.showModal();
  await Promise.resolve();
  expect(settings.querySelector(".dialoghead #app-help-button")).not.toBeNull();
  settings.querySelector<HTMLButtonElement>("#app-help-button")!.click();
  const d = root.querySelector<HTMLDialogElement>("#app-help-dialog")!;
  expect(d.textContent).toContain("예비박");
  expect(d.textContent).not.toContain("Space");
  d.close();
  expect(settings.open).toBe(true);
  expect(document.activeElement?.id).toBe("app-help-button");
});
it("paginates small screens and supports keyboard navigation", () => {
  vi.stubGlobal("innerWidth", 390);
  const root = document.querySelector<HTMLElement>("#app")!;
  installHelp(root);
  root.querySelector<HTMLButtonElement>("#app-help-button")!.click();
  const d = root.querySelector<HTMLDialogElement>("#app-help-dialog")!;
  expect(d.querySelectorAll(".help-cards section")).toHaveLength(1);
  expect(d.querySelector(".help-pages")!.textContent).toContain("1 / 3");
  d.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
  expect(d.querySelector(".help-pages")!.textContent).toContain("2 / 3");
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
  expect(legend.querySelectorAll("svg text.name")).toHaveLength(27);
  expect(legend.querySelectorAll("feDisplacementMap")).toHaveLength(1);
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
