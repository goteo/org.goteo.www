export type SupportedLocale = "en" | "es" | "ca" | "fr" | "de";

export interface LocaleConfig {
    supportedLocales: SupportedLocale[];
    defaultLocale: SupportedLocale;
    availableLocales: SupportedLocale[];
}
