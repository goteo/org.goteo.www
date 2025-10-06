/// <reference types="astro/client" />
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { useTranslations } from "./i18n/utils";
import type { Locale } from "../i18n/locales/index";

declare global {
    namespace App {
        interface Locals {
            lang: import("./i18n/store").Locale;
            t: ReturnType<typeof import("./i18n/ui").useTranslations>;
        }
    }
}
