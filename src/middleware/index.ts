import { defineMiddleware } from "astro:middleware";

import { checkAuth } from "./firewall";
import { getLanguage, getUserLangPreferences, persistLanguage } from "./utils";
import { getSession } from "../auth/session";
import { useTranslations } from "../i18n/utils";

import type { Locale } from "../i18n/locales/index";
import type { APIContext } from "astro";

export const onRequest = defineMiddleware(async (context: APIContext, next) => {
    const auth = await checkAuth(context);
    switch (auth.type) {
        case "basic-auth":
            return auth.response;
        case "unauthorized":
            return context.rewrite("/login");
        case "forbidden":
            return context.rewrite("/403");
    }

    let storedLanguage: boolean | undefined;

    try {
        const lang = getLanguage(context) as Locale;
        const langs = getUserLangPreferences(context);

        // Only remember a language the visitor actually asked for, never the fallback.
        storedLanguage = langs.includes(lang) && persistLanguage(context, lang);

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

    const response = await next();

    /**
     * Which routes may be cached is declared in `astro.config.mjs`, but whether this
     * particular response may be stored is only known once it has been built. A signed-in
     * visitor or a queued `Set-Cookie` both mean the response belongs to one person, and
     * the edge would replay it to everyone else requesting the same URL.
     *
     * Cookies queued through `context.cookies` are written onto the response after
     * middleware returns, so they cannot be detected by reading its headers — hence the
     * explicit flag alongside the header check, which covers cookies set directly on a
     * Response by a route.
     *
     * Only successful responses are worth storing. A redirect or a 404 usually means the
     * resource is missing for now, and holding onto it would keep serving that answer
     * long after the resource exists.
     */
    if (
        !response.ok ||
        context.locals.session ||
        storedLanguage ||
        response.headers.has("set-cookie")
    ) {
        context.cache.set(false);
    }

    return response;
});
