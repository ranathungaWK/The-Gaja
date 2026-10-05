import { dictionaries, type Dictionary, type Locale } from "./dictionaries";

export type { Dictionary, Locale };
export { LOCALES } from "./dictionaries";

export const LOCALE_COOKIE = "lang";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "si";
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Replace `{name}` placeholders in a dictionary string. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}
