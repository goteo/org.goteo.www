import { defineMiddleware } from "astro:middleware";

import { getLanguage, handleProtectedRoutes, isLanguageExemptPath } from "./utils";
import { useTranslations } from "../i18n/utils";

import type { Locale } from "../i18n/locales/index";
import type { APIContext } from "astro";

export const onRequest = defineMiddleware(async (context: APIContext, next) => {
    if (isLanguageExemptPath(context)) {
        return next();
    }

    try {
        const lang = getLanguage(context) as Locale;

        //throw new Error(lang);
        context.locals.lang = lang;
        context.locals.t = useTranslations(lang);

        const redirectPath = handleProtectedRoutes(context, lang);
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
