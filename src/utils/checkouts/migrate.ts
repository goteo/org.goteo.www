const LEGACY_STORAGE_KEY = "cart";

/**
 * Discards the checkout the previous `localStorage` store left behind.
 *
 * The blob is dropped rather than carried over. It has no owner recorded in it, and the
 * session is not yet known when this runs — `/api/session` is fetched after hydration, so an
 * empty session store means "anonymous" and "still loading" alike. Moving it into the guest
 * record would therefore hand it to whoever signs in next, which on a shared browser is not
 * necessarily the person who filled it.
 *
 * The cost is one lost checkout per browser, the once. The old store re-seeded the key on
 * every page load, so removing it unconditionally is what stops it coming back. Never throws.
 */
export function dropLegacyCart(): void {
    if (typeof window === "undefined") return;

    try {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
        // Storage can be unavailable (private mode, blocked cookies); nothing to clean up then.
    }
}
