import { writable, derived } from "svelte/store";

import { isSupportedLocale, type Locale } from "./locales/index";
import { useTranslations } from "./utils";

const pathLang = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "es";
const initialLocale: Locale = pathLang === "en" ? "en" : "es";

export const locale = writable<Locale>(initialLocale);

export const t = derived(locale, ($locale) => useTranslations($locale));

export function setLocale(newLang: string) {
    if (isSupportedLocale(newLang)) {
        locale.set(newLang as Locale);
    }
}
