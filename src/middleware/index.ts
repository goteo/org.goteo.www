import { defineMiddleware } from "astro:middleware";

import { checkAuth } from "./firewall";
import { getLanguage, getUserLangPreferences, parsePathLang } from "./utils";
import { getSession } from "../auth/session";
import { useTranslations } from "../i18n/utils";

import type { Locale } from "../i18n/locales/index";
import type { APIContext } from "astro";

export const onRequest = defineMiddleware(async (context: APIContext, next) => {
    const defaultLang = import.meta.env.PUBLIC_DEFAULT_LANGUAGE;
    const pathLang = parsePathLang(context.url.pathname);
    const locale = pathLang ?? defaultLang;

    const auth = await checkAuth(context);
    switch (auth.type) {
        case "basic-auth":
            return auth.response;
        case "unauthorized":
            return context.rewrite(`/${locale}/login`);
        case "forbidden":
            return context.rewrite("/403");
    }

    try {
        const lang = getLanguage(context) as Locale;
        const langs = getUserLangPreferences(context);

        context.locals.lang = lang;
        context.locals.langs = langs;
        context.locals.t = useTranslations(lang);
        context.locals.session = await getSession(context.cookies);
    } catch (e) {
        if (e instanceof Response) {
            return e;
        }
        throw e;
    }

    return next();
});
