/** Browser app preferences. Portable builds substitute document-lifetime memory. */
export function readPreference(key: string): string | null { return localStorage.getItem(key); }
export function writePreference(key: string, value: string): void { localStorage.setItem(key, value); }
