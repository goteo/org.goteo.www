/// <reference types="astro/client" />

declare namespace App {
    interface Locals {
        lang: import("./src/i18n/locales/index").Locale;
        t: ReturnType<typeof import("./src/i18n/utils").useTranslations>;
        session: import("./src/auth/types").Session | undefined;
    }
}
