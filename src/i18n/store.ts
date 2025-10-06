import { writable, derived } from "svelte/store";

import { isSupportedLocale, type Locale } from "./locales/index";
import { useTranslations } from "./utils";
import { getDefaultLanguage } from "../utils/consts";

function detectLocale(): Locale {
    if (typeof window !== "undefined") {
        const path = window.location.pathname.split("/")[1];

        if (isSupportedLocale(path)) {
            return path as Locale;
        }
    }

    if (typeof navigator !== "undefined" && navigator.language) {
        const localeFromNavigator = navigator.language.split("-")[0];

        if (isSupportedLocale(navigator.language)) {
            return localeFromNavigator as Locale;
        }
    }

    return getDefaultLanguage() as Locale;
}

const initialLocale = detectLocale();

export const locale = writable<Locale>(initialLocale);

export const t = derived(locale, ($locale) => useTranslations($locale));

export function setLocale(newLang: string) {
    if (isSupportedLocale(newLang)) {
        locale.set(newLang as Locale);
    }
}
