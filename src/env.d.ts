/// <reference types="astro/client" />

declare namespace App {
    interface Locals {
        lang: import("./i18n/locales/index").Locale;
        t: ReturnType<typeof import("./i18n/utils").useTranslations>;
        session: import("./auth/types").Session | undefined;
    }
}
