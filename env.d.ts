/// <reference types="astro/client" />

declare global {
    namespace App {
        interface Locals {
            lang: import("./i18n/store").Locale;
            t: ReturnType<typeof import("./i18n/ui").useTranslations>;
        }
    }
}
