import { defineMiddleware } from "astro:middleware";

import { detectLocale, handleProtectedRoutes, isLanguageExemptPath } from "./utils";
import { languagesList } from "../i18n/locales/index";
import { useTranslations } from "../i18n/utils";

import type { Locale } from "../i18n/locales/index";
import type { APIContext } from "astro";

export const onRequest = defineMiddleware(async (context: APIContext, next) => {
    const pathParts = context.url.pathname.split("/").filter(Boolean);

    const maybeLang = pathParts[0];

    const validLangs = Object.keys(languagesList);

    if (isLanguageExemptPath(maybeLang)) {
        return next();
    }

    try {
        const lang = detectLocale(context, maybeLang, validLangs) as Locale;
        context.locals.lang = lang;
        context.locals.t = useTranslations(lang);

        const redirectPath = handleProtectedRoutes(context, lang, pathParts);
        if (redirectPath) {
            return context.redirect(redirectPath, 302);
        }
    } catch (e) {
        if (e instanceof Response) {
            return e;
        }
        throw e;
    }

    return next();
});
