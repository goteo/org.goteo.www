import { defineMiddleware } from "astro:middleware";

import { getLanguage, handleProtectedRoutes, isLanguageExemptPath } from "./utils";
import { useTranslations } from "../i18n/utils";

import type { Locale } from "../i18n/locales/index";
import type { APIContext } from "astro";

function checkBasicAuth(context: APIContext): Response | null {
    const activeBasicAuth = import.meta.env.ACTIVE_BASIC_AUTH;

    if (!activeBasicAuth || activeBasicAuth !== "true") {
        return null;
    }

    const username = import.meta.env.BASIC_AUTH_USERNAME;
    const password = import.meta.env.BASIC_AUTH_PASSWORD;

    const authorization = context.request.headers.get("authorization");

    if (!authorization || !authorization.startsWith("Basic ")) {
        return new Response("Authentication required", {
            status: 401,
            headers: {
                "WWW-Authenticate": 'Basic realm="Protected Area"',
            },
        });
    }

    const base64Credentials = authorization.slice(6);
    const credentials = atob(base64Credentials);
    const [providedUsername, providedPassword] = credentials.split(":");

    if (providedUsername !== username || providedPassword !== password) {
        return new Response("Authentication failed", {
            status: 401,
            headers: {
                "WWW-Authenticate": 'Basic realm="Protected Area"',
            },
        });
    }

    return null;
}

export const onRequest = defineMiddleware(async (context: APIContext, next) => {
    const authResponse = checkBasicAuth(context);
    if (authResponse) {
        return authResponse;
    }

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
