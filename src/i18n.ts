import korean from "./locales/ko.json";
export type MessageKey = keyof typeof korean;
export const locale = "ko-KR";
/** Text-only messages. Markup and escaping remain the caller's responsibility. */
export function t(
  key: MessageKey,
  values: Record<string, unknown> = {},
): string {
  const text: string = korean[key];
  if (text === undefined) throw new Error(`Unknown translation key: ${key}`);
  return text.replace(/\{([a-zA-Z_$][\w$]*)\}/g, (token, name) => {
    if (!Object.hasOwn(values, name))
      throw new Error(`Missing translation value ${name}: ${key}`);
    const value = values[name];
    return typeof value === "number"
      ? formatNumber(value, { useGrouping: false, maximumFractionDigits: 20 })
      : String(value);
  });
}
const numberFormats = new Map<string, Intl.NumberFormat>();
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  const key = JSON.stringify(options || {});
  let formatter = numberFormats.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormats.set(key, formatter);
  }
  return formatter.format(value);
}
export function formatDate(
  value: Date | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(value).toLocaleString(locale, options);
}

export function formatTime(
  value: Date | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(value).toLocaleTimeString(locale, options);
}
