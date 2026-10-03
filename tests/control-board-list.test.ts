// @vitest-environment jsdom
import { it, expect } from "vitest";
import { paginateControlBoardList } from "../src/control-board-list";
it("pages all saved items and clamps the page after deletion without duplicating controls", () => {
  document.body.innerHTML = '<div><div id="list"><span>A</span><span>B</span><span>C</span></div></div>';
  const list = document.querySelector<HTMLElement>("#list")!;
  paginateControlBoardList(list);
  const next = () => document.querySelectorAll<HTMLButtonElement>(".control-board-pages button")[1].click();
  next(); next();
  expect((list.children[2] as HTMLElement).hidden).toBe(false);
  expect(document.querySelectorAll<HTMLButtonElement>(".control-board-pages button")[1].disabled).toBe(true);
  list.lastElementChild!.remove();
  paginateControlBoardList(list);
  expect((list.children[1] as HTMLElement).hidden).toBe(false);
  expect(document.querySelectorAll(".control-board-pages")).toHaveLength(1);
});
