import { languagesList } from "../i18n/locales/index";

import type { APIContext } from "astro";

const defaultLang = import.meta.env.PUBLIC_LANGUAGE_DEFAULT;
if (!defaultLang) {
    throw new Error("PUBLIC_LANGUAGE_DEFAULT is not defined in env");
}

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

export function getUserLanguagePreference(context: APIContext): string[] {
    const maybeLang = context.url.pathname.replace(/^\/+/, "").split("/")[0];
    if (maybeLang) return [maybeLang];

    const acceptLangHeader = context.request.headers.get("accept-language") || "";
    const preferredFromHeader = parseAcceptLanguageHeader(acceptLangHeader);

    if (preferredFromHeader?.length > 0) {
        return preferredFromHeader.map((lang) => lang.code);
    }

    const cookieLang = context.cookies.get("preferred-lang")?.value;
    if (cookieLang) return [cookieLang];

    return [];
}

export function getLanguage(context: APIContext): string {
    const userPreferredLangs = getUserLanguagePreference(context);
    if (!userPreferredLangs) return defaultLang;

    const validLangs = Object.keys(languagesList);

    for (const lang of userPreferredLangs) {
        if (validLangs.includes(lang)) {
            context.cookies.set("preferred-lang", lang, {
                path: "/",
                httpOnly: false,
                maxAge: 60 * 60 * 24 * 365,
            });
            //throw new Error(lang);
            return lang;
        }
    }

    return defaultLang;
}

// export function detectLocale(context: APIContext): string {
//     const validLangs = Object.keys(languagesList);
//     const maybeLang = context.url.pathname.replace(/^\/+/, "").split("/")[0];

//     if (maybeLang && validLangs.includes(maybeLang)) {
//         context.cookies.set("preferred-lang", maybeLang, {
//             path: "/",
//             httpOnly: false,
//             maxAge: 60 * 60 * 24 * 365,
//         });
//         return maybeLang;
//     }

//     const acceptLangHeader = context.request.headers.get("accept-language") || "";
//     const preferredLang = parseAcceptLanguageHeader(acceptLangHeader);

//     if (preferredLang && preferredLang !== defaultLang) {
//         const newUrl = buildRedirectUrl(preferredLang, context.url.pathname);
//         throw context.redirect(newUrl, 302);
//     }

//     const preferredLangCookie = context.cookies.get("preferred-lang")?.value;

//     if (preferredLangCookie && validLangs.includes(preferredLangCookie)) {
//         if (preferredLangCookie !== defaultLang) {
//             const newUrl = buildRedirectUrl(preferredLangCookie, context.url.pathname);
//             throw context.redirect(newUrl, 302);
//         }
//         return defaultLang;
//     }

//     context.cookies.set("preferred-lang", defaultLang, {
//         path: "/",
//         httpOnly: false,
//         maxAge: 60 * 60 * 24 * 365, // 1 año
//     });

//     return defaultLang;
// }

/**
 * Protects routes based on access token presence.
 */
export function handleProtectedRoutes(context: APIContext, lang: string): string | null {
    const accessToken = context.cookies.get("access-token")?.value;
    const pathParts = context.url.pathname.replace(/^\/+/, "").split("/");
    const pathAfterLang = lang === defaultLang ? pathParts : pathParts.slice(1);
    const nextSegment = pathAfterLang[0];

    if (accessToken && (nextSegment === "login" || nextSegment === "register")) {
        return lang === defaultLang ? `/` : `/${lang}/`;
    }

    const protectedRoutes = ["payment"];
    const isProtected = protectedRoutes.some((route) => pathAfterLang.includes(route));

    if (!accessToken && isProtected) {
        return lang === defaultLang ? `/login` : `/${lang}/login`;
    }

    return null;
}

/**
 * Checks if the path is exempt from language detection (e.g., _actions, api).
 */
export function isLanguageExemptPath(context: APIContext): boolean {
    const firstSegment = context.url.pathname.replace(/^\/+/, "").split("/")[0];
    const exemptRoutes = ["_actions", "api"];
    return exemptRoutes.includes(firstSegment);
}

/**
 * Detects the user's preferred locale from the Accept-Language HTTP header.
 */
export function parseAcceptLanguageHeader(header: string): { code: string; q: number }[] {
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
