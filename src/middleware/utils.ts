import type { APIContext } from "astro";

const defaultLang = import.meta.env.PUBLIC_LANGUAGE_DEFAULT || "es";

/**
 * Builds a clean redirect URL by combining the language code and pathname.
 * Ensures no double slashes.
 *
 * @param {string} lang - The selected language (e.g., "en", "es", "ca").
 * @param {string} pathname - The current request pathname.
 * @returns {string} - A safe redirect URL.
 */
export function buildRedirectUrl(lang: string, pathname: string): string {
    const cleanPath = pathname === "/" ? "" : pathname;
    const newUrl = `/${lang}${cleanPath}`;
    return newUrl;
}

/**
 * Detects the appropriate locale based on URL, cookie or Accept-Language header.
 * Redirects if needed.
 */
export function detectLocale(
    context: APIContext,
    maybeLang: string | undefined,
    validLangs: string[],
): string {
    if (maybeLang && validLangs.includes(maybeLang)) {
        return maybeLang;
    }

    const preferredLangCookie = context.cookies.get("preferred-lang")?.value;

    if (preferredLangCookie && validLangs.includes(preferredLangCookie)) {
        if (preferredLangCookie !== defaultLang) {
            const newUrl = buildRedirectUrl(preferredLangCookie, context.url.pathname);
            throw context.redirect(newUrl, 302);
        }
        return defaultLang;
    }

    const acceptLangHeader = context.request.headers.get("accept-language") || "";

    const preferredLang = detectPreferredLocale(acceptLangHeader, validLangs);

    if (preferredLang && preferredLang !== defaultLang) {
        const newUrl = buildRedirectUrl(preferredLang, context.url.pathname);
        throw context.redirect(newUrl, 302);
    }

    return defaultLang;
}

/**
 * Protects routes based on access token presence.
 */
export function handleProtectedRoutes(
    context: APIContext,
    lang: string,
    pathParts: string[],
): string | null {
    const accessToken = context.cookies.get("access-token")?.value;
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
export function isLanguageExemptPath(maybeLang: string | undefined): boolean {
    const exemptRoutes = ["_actions", "api"];
    return maybeLang ? exemptRoutes.includes(maybeLang) : false;
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
