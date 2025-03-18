import { defineMiddleware } from "astro:middleware";

import { useTranslations } from "../i18n/utils";

import type { Locale } from "../i18n/locales/index";
import type { APIContext } from "astro";

export const onRequest = defineMiddleware((context: APIContext, next) => {
    const pathParts = new URL(context.request.url).pathname.split("/");
    const lang: Locale = pathParts[1] === "en" ? "en" : "es";

    const t = useTranslations(lang);

    context.locals.lang = lang;
    context.locals.t = t;

    return next();
});
