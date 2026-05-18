import { ACL, type ControlItem } from "./access-control";
import { isSupportedLocale } from "../i18n/locales";

function normalizePath(pathname: string): string {
    const path = pathname.replace(/\/+$/, "");

    const segments = path.split("/").filter(Boolean);

    if (segments.length > 0 && isSupportedLocale(segments[0])) {
        segments.shift();
    }

    return "/" + segments.join("/");
}

function matchesPath(pathname: string, basePath: string): boolean {
    return pathname === basePath || pathname.startsWith(basePath + "/");
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
