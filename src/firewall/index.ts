import { ACL, type ControlItem } from "./access-control";
import { isSupportedLocale } from "../i18n/locales";

const regexCache = new Map<string, RegExp>();

function normalizePath(pathname: string): string {
    const path = pathname.replace(/\/+$/, "");

    const segments = path.split("/").filter(Boolean);

    if (segments.length > 0 && isSupportedLocale(segments[0])) {
        segments.shift();
    }

    return "/" + segments.join("/");
}

function isRegexPath(path: string): boolean {
    return /[.*+?^${}()|[\]\\]/.test(path);
}

function getRegex(path: string): RegExp {
    if (!regexCache.has(path)) {
        regexCache.set(path, new RegExp(`^${path}$`));
    }

    return regexCache.get(path)!;
}

/**
 * Checks if a pathname matches a given path.
 * @param pathname The pathname to check, e.g. "/admin/dashboard"
 * @param path The path to match against, which can be an exact path (e.g. "/admin") or a regex pattern (e.g. "/admin/.*")
 * @returns True if the pathname matches the path, false otherwise
 */
function matchesPath(pathname: string, path: string): boolean {
    // Exact match
    if (pathname === path) {
        return true;
    }

    // Dynamic regex route
    if (isRegexPath(path)) {
        return getRegex(path).test(pathname);
    }

    // Nested routes
    return pathname.startsWith(path + "/");
}

export function getMatchingACL(pathname: string): ControlItem | null {
    const normalized = normalizePath(pathname);

    for (const item of ACL) {
        if (matchesPath(normalized, item.path)) {
            return item;
        }
    }

    return null;
}

export function isAuthorized(control: ControlItem, roles: string[]): boolean {
    return control.roles.some((role) => roles.includes(role));
}