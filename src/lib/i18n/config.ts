import type { LocaleConfig, SupportedLocale } from "./types";

export const config: LocaleConfig = {
    supportedLocales: ["en", "es", "ca", "fr", "de"],
    defaultLocale: "en",
    availableLocales: ["en", "es"], // locales with actual translations
};

export function isValidLocale(locale: string): locale is SupportedLocale {
    return config.supportedLocales.includes(locale as SupportedLocale);
}

export function hasTranslations(locale: SupportedLocale): boolean {
    return config.availableLocales.includes(locale);
}
