import { writable, derived } from "svelte/store";

import { isSupportedLocale, type Locale } from "./locales/index";
import { useTranslations } from "./utils";
import { getDefaultLanguage } from "../utils/consts";

function detectLocale(): Locale {
    if (typeof window !== "undefined") {
        const cookies = document.cookie.split("; ").reduce(
            (prev, current) => {
                const [name, ...value] = current.split("=");
                prev[name] = value.join("=");
                return prev;
            },
            {} as Record<string, string>,
        );

        const cookieLang = cookies["preferred-lang"];

        if (cookieLang && isSupportedLocale(cookieLang)) {
            return cookieLang as Locale;
        }

        const path = window.location.pathname.split("/")[1];

        if (isSupportedLocale(path)) {
            return path as Locale;
        }
    }

    return getDefaultLanguage() as Locale;
}

const initialLocale = detectLocale();

export const locale = writable<Locale>(initialLocale);

export const t = derived(locale, ($locale) => useTranslations($locale));

export function setLocale(newLang: string) {
    if (!isSupportedLocale(newLang)) {
        return;
    }

    locale.set(newLang as Locale);

    document.cookie = `preferred-lang=${newLang}; path=/; max-age=${60 * 60 * 24 * 365}`;

    const pathParts = window.location.pathname.split("/").filter(Boolean);

    if (pathParts.length > 0 && isSupportedLocale(pathParts[0])) {
        pathParts[0] = newLang;
    } else {
        pathParts.unshift(newLang);
    }

    window.location.href =
        "/" + pathParts.join("/") + window.location.search + window.location.hash;
}
