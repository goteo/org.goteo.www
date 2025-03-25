import { defineMiddleware } from "astro:middleware";

import { languagesList } from "../i18n/locales/index";
import { useTranslations } from "../i18n/utils";

import type { Locale } from "../i18n/locales/index";
import type { APIContext } from "astro";

export const onRequest = defineMiddleware((context: APIContext, next) => {
    const { pathname } = new URL(context.request.url);
    const pathParts = pathname.split("/").filter(Boolean);

    if (pathParts.length < 1) {
        return context.redirect("/es/", 302);
    }

    const langSegment = pathParts[0];
    const validLangs = Object.keys(languagesList);

    if (!validLangs.includes(langSegment)) {
        return context.redirect("/es/404", 302);
    }

    const lang: Locale = langSegment as Locale;
    const t = useTranslations(lang);

    context.locals.lang = lang;
    context.locals.t = t;

    return next();
});
