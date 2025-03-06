import { browser } from "$app/environment";
import { init, register, getLocaleFromNavigator } from "svelte-i18n";
import { config, hasTranslations } from "./config";
import type { SupportedLocale } from "./types";

let initializationPromise: Promise<void> | null = null;

// Pre-register all available locales
config.availableLocales.forEach((locale) => {
    register(locale, () => import(`./locales/${locale}.json`).then((module) => module.default));
});

export function getBrowserLocale(): SupportedLocale | null {
    if (!browser) return null;
    const navigatorLocale = getLocaleFromNavigator()?.split("-")[0] as SupportedLocale;
    return hasTranslations(navigatorLocale) ? navigatorLocale : null;
}

export async function initI18n() {
    if (initializationPromise) return initializationPromise;

    initializationPromise = (async () => {
        const initLocale = browser
            ? getBrowserLocale() || config.defaultLocale
            : config.defaultLocale;

        init({
            fallbackLocale: config.defaultLocale,
            initialLocale: initLocale,
        });
    })();

    return initializationPromise;
}

// Remove loadLocaleData as it's no longer needed
export * from "./config";
export { config, isValidLocale, hasTranslations } from "./config";
export type { LocaleConfig, SupportedLocale } from "./types";

export const locales: Record<string, { label: string }> = {
    en: { label: "English" },
    es: { label: "Español" },
    ca: { label: "Català" },
};
