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
    const cleanPath = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
    return `/${lang}${cleanPath ? `/${cleanPath}` : ""}`;
}

/**
 * Detects the appropriate locale based on URL, Accept-Language header, or cookie.
 * Always ensures the preferred-lang cookie is synchronized.
 */
export function detectLocale(context: APIContext): string {
    const validLangs = Object.keys(languagesList);
    const maybeLang = context.url.pathname.replace(/^\/+/, "").split("/")[0];

    if (maybeLang && validLangs.includes(maybeLang)) {
        context.cookies.set("preferred-lang", maybeLang, {
            path: "/",
            httpOnly: false,
            maxAge: 60 * 60 * 24 * 365,
        });
        return maybeLang;
    }

    const acceptLangHeader = context.request.headers.get("accept-language") || "";
    const preferredLang = detectPreferredLocale(acceptLangHeader, validLangs);

    if (preferredLang && preferredLang !== defaultLang) {
        const newUrl = buildRedirectUrl(preferredLang, context.url.pathname);
        throw context.redirect(newUrl, 302);
    }

    const preferredLangCookie = context.cookies.get("preferred-lang")?.value;

    if (preferredLangCookie && validLangs.includes(preferredLangCookie)) {
        if (preferredLangCookie !== defaultLang) {
            const newUrl = buildRedirectUrl(preferredLangCookie, context.url.pathname);
            throw context.redirect(newUrl, 302);
        }
        return defaultLang;
    }

    context.cookies.set("preferred-lang", defaultLang, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 365, // 1 año
    });

    return defaultLang;
}

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
export function detectPreferredLocale(header: string, supportedLocales: string[]): string | null {
    if (!header) return null;

    const languages = header.split(",").map((lang) => {
        const [langCode, qValue] = lang.trim().split(";q=");
        return {
            lang: langCode.toLowerCase(),
            q: qValue ? parseFloat(qValue) : 1.0,
        };
    });

    languages.sort((a, b) => b.q - a.q);

    for (const { lang } of languages) {
        if (supportedLocales.includes(lang)) {
            return lang;
        }
        const baseLang = lang.split("-")[0];
        if (supportedLocales.includes(baseLang)) {
            return baseLang;
        }
    }

    return null;
}
