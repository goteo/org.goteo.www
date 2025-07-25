import { languagesList } from "../i18n/locales/index";
import { getDefaultLanguage } from "../utils/consts";

import type { APIContext } from "astro";

const defaultLang = getDefaultLanguage();
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
export function getUserLangPreferences(context: APIContext): string[] {
    const preferredFromPath = parsePathLang(context.url.pathname);
    if (preferredFromPath) return [preferredFromPath];

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
    const userPreferredLangs = getUserLangPreferences(context);
    if (!userPreferredLangs) return defaultLang;

    const validLangs = Object.keys(languagesList);
    for (const lang of userPreferredLangs) {
        if (validLangs.includes(lang)) {
            context.cookies.set("preferred-lang", lang, {
                path: "/",
                httpOnly: false,
                maxAge: 60 * 60 * 24 * 365,
            });

            return lang;
        }
    }

    return defaultLang;
}

export function handleProtectedRoutes(context: APIContext, lang: string): string | null {
    const pathname = context.url.pathname;
    if (pathname === "/favicon.ico") return null;

    const accessToken = context.cookies.get("access-token")?.value;
    const pathParts = pathname.replace(/^\/+/, "").split("/");

    const langFromPath = parsePathLang(pathname);
    const isLangInPath = langFromPath !== null;
    const currentLang = langFromPath ?? lang;
    const pathAfterLang = isLangInPath ? pathParts.slice(1) : pathParts;
    const nextSegment = pathAfterLang[0] ?? "";

    if (accessToken && (nextSegment === "login" || nextSegment === "register")) {
        return isLangInPath ? `/${currentLang}/payment` : `/payment`;
    }

    const protectedRoutes = ["payment", "admin"];
    const isProtected = protectedRoutes.includes(nextSegment);

    if (!accessToken && isProtected) {
        return isLangInPath ? `/${currentLang}/login` : `/login`;
    }

    if (nextSegment === "admin") {
        try {
            const token = JSON.parse(accessToken || "{}");

            if (!token.isAdmin) {
                return isLangInPath ? `/${currentLang}/login` : `/login`;
            }
        } catch {
            return isLangInPath ? `/${currentLang}/login` : `/login`;
        }
    }

    return null;
}

/**
 * Checks if the path is exempt from language detection (e.g., _actions, api).
 */
export function isLanguageExemptPath(context: APIContext): boolean {
    const firstSegment = context.url.pathname.split("/")[1];
    const exemptRoutes = ["api"];

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

export function parsePathLang(path: string): string | null {
    const firstSegment = path.split("/")[1];

    if (Object.keys(languagesList).includes(firstSegment)) {
        return firstSegment;
    }

    return null;
}
