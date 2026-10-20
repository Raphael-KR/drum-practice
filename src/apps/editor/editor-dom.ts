export const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
export const val = (id: string) => $(id) as HTMLInputElement;
export const num = (id: string) => Number(val(id).value);
