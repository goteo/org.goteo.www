type CookieSameSite = "Strict" | "Lax" | "None";

export interface CookieOptions {
    maxAge?: number;
    path?: string;
    sameSite?: CookieSameSite;
}

const DEFAULT_OPTIONS: Required<CookieOptions> = {
    maxAge: 31536000,
    path: "/",
    sameSite: "Strict",
};

export function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;

    const target = `${encodeURIComponent(name)}=`;
    const cookies = document.cookie ? document.cookie.split("; ") : [];

    for (const cookie of cookies) {
        if (cookie.startsWith(target)) {
            return decodeURIComponent(cookie.slice(target.length));
        }
    }

    return null;
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof document === "undefined") return;

    const { maxAge, path, sameSite } = { ...DEFAULT_OPTIONS, ...options };

    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite}`;
}

export function deleteCookie(name: string, options: Pick<CookieOptions, "path"> = {}): void {
    if (typeof document === "undefined") return;

    const path = options.path ?? DEFAULT_OPTIONS.path;

    document.cookie = `${encodeURIComponent(name)}=; Path=${path}; Max-Age=0; SameSite=${DEFAULT_OPTIONS.sameSite}`;
}
