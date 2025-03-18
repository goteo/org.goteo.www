/// <reference types="astro/client" />
import type { Locale } from "../i18n/locales/index";
import type { useTranslations } from "./i18n/utils";

declare global {
    namespace App {
        interface Locals {
            lang: import("./i18n/store").Locale;
            t: ReturnType<typeof import("./i18n/ui").useTranslations>;
        }
    }
}
