import { isSupportedLocale } from "../i18n/locales/index";

import type { APIContext } from "astro";

const PREFERRED_LANGUAGE_COOKIE = "preferred-lang";

/**
 * Builds a clean redirect URL by combining the language code and pathname.
 */
export function buildRedirectUrl(lang: string, pathname: string): string {
    const cleanPath = pathname.replace(/^\/+|\/+$/g, "");

    return `/${lang}${cleanPath ? `/${cleanPath}` : ""}`;
}

/**
 * Detects the appropriate locale based on URL, Accept-Language header, or cookie.
 * Always ensures the preferred-lang cookie is synchronized.
 */
export function getUserLangPreferences(context: APIContext): string[] {
    const langInPath = parsePathLang(context.url.pathname);
    if (langInPath) return [langInPath];

    const langInCookie = context.cookies.get(PREFERRED_LANGUAGE_COOKIE)?.value;
    if (langInCookie) return [langInCookie];

    const langsInHeader = parseAcceptLanguageHeader(context.request.headers.get("accept-language"));
    if (langsInHeader?.length > 0) {
        return langsInHeader.map((lang) => lang.code);
    }

    return [];
}

export function getLanguage(context: APIContext): string {
    const defaultLang = import.meta.env.PUBLIC_DEFAULT_LANGUAGE;
    const userPreferredLangs = getUserLangPreferences(context);

    if (userPreferredLangs.length < 1) {
        return defaultLang;
    }

    for (const lang of userPreferredLangs) {
        if (isSupportedLocale(lang)) {
            context.cookies.set(PREFERRED_LANGUAGE_COOKIE, lang, {
                path: "/",
                httpOnly: false,
                maxAge: 60 * 60 * 24 * 365,
            });

            return lang;
        }
    }

    return defaultLang;
}

/**
 * Checks if the request is to an stateless path (e.g, api).
 */
export function isStatelessRequest(context: APIContext): boolean {
    const firstSegment = context.url.pathname.split("/")[1];
    const exemptRoutes = ["api"];

    return exemptRoutes.includes(firstSegment);
}

/**
 * Detects the user's preferred locale from the Accept-Language HTTP header.
 * @returns A sorted list of the locales from the header
 */
export function parseAcceptLanguageHeader(header: string | null): { code: string; q: number }[] {
    if (!header) return [];

    const languages = header.split(",").map((lang) => {
        const [code, qValue] = lang.trim().split(";q=");

        return {
            code: code.toLowerCase().split("-")[0],
            q: qValue ? parseFloat(qValue) : 1.0,
        };
    });

    return languages.sort((a, b) => b.q - a.q);
}

export function parsePathLang(path: string): string | null {
    const firstSegment = path.split("/")[1];

    if (isSupportedLocale(firstSegment)) {
        return firstSegment;
    }

    return null;
}
