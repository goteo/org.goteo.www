import { defineMiddleware } from "astro:middleware";

import { languagesList } from "../i18n/locales/index";
import { useTranslations } from "../i18n/utils";

import type { Locale } from "../i18n/locales/index";
import type { APIContext } from "astro";

export const onRequest = defineMiddleware((context: APIContext, next) => {
    const url = new URL(context.request.url);
    const pathParts = url.pathname.split("/").filter(Boolean);

    if (pathParts[0] === "_actions") {
        return next();
    }

    const validLangs = Object.keys(languagesList);
    const maybeLang = pathParts[0];
    const defaultLang = "es";

    if (!maybeLang) {
        return context.redirect(`/${defaultLang}${url.pathname}`, 302);
    }

    if (!validLangs.includes(maybeLang)) {
        return context.redirect(`/${defaultLang}/404`, 302);
    }

    const lang = maybeLang as Locale;
    context.locals.lang = lang;
    context.locals.t = useTranslations(lang);

    const accessToken = context.cookies.get("access-token")?.value;

    const nextSegment = pathParts[1];
    if (accessToken && (nextSegment === "login" || nextSegment === "register")) {
        return context.redirect(`/${lang}/`, 302);
    }

    const protectedRoutes = ["payment"];

    if (!accessToken && protectedRoutes.includes(nextSegment)) {
        return context.redirect(`/${lang}/login`, 302);
    }

    return next();
});
