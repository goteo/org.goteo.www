import { defineMiddleware } from "astro:middleware";

import { checkAuth } from "./firewall";
import { getLanguage, isStatelessRequest } from "./utils";
import { getSession } from "../auth/session";
import { useTranslations } from "../i18n/utils";

import type { Locale } from "../i18n/locales/index";
import type { APIContext } from "astro";

export const onRequest = defineMiddleware(async (context: APIContext, next) => {
    const auth = await checkAuth(context);
    switch (auth.type) {
        case "ok":
            break;
        case "basic-auth":
            return auth.response;
        case "unauthorized":
            return context.rewrite("/401");
        case "forbidden":
            return context.rewrite("/403");
    }

    if (isStatelessRequest(context)) {
        return next();
    }

    try {
        const lang = getLanguage(context) as Locale;
        const session = await getSession(context.cookies);

        //throw new Error(lang);
        context.locals.lang = lang;
        context.locals.t = useTranslations(lang);
        context.locals.session = session;
    } catch (e) {
        if (e instanceof Response) {
            return e;
        }
        throw e;
    }

    return next();
});
