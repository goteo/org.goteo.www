import { writable, derived } from "svelte/store";
import { useTranslations } from "./utils";
import type { Locale } from "./locales/index";

const pathLang = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "es";
const initialLocale: Locale = pathLang === "en" ? "en" : "es";

export const locale = writable<Locale>(initialLocale);

export const t = derived(locale, ($locale) => useTranslations($locale));

export function setLocale(newLang: Locale) {
    locale.set(newLang);
}
