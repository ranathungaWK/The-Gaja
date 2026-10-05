import "server-only";
import { cookies } from "next/headers";
import { getDictionary, isLocale, LOCALE_COOKIE, type Locale } from "./index";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : "en";
}

export async function getT() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
