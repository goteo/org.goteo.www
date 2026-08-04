import { checkoutRepo } from "./repository";

import type { CheckoutItem } from "../../stores/checkoutsStore";

const LEGACY_STORAGE_KEY = "cart";
const GUEST_KEY = "user:guest";

/**
 * One-time migration of the legacy localStorage cart blob into the guest
 * IndexedDB record. The old store re-seeded the "cart" key on every page
 * load, so the key is removed unconditionally — even on unparseable data —
 * to guarantee the migration runs at most once per browser. Never throws.
 */
export async function migrateLegacyCart(): Promise<void> {
    if (typeof window === "undefined") return;

    let raw: string | null = null;
    try {
        raw = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (raw === null) return;

        localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
        return;
    }

    try {
        const parsed = JSON.parse(raw) as { items?: Record<string, CheckoutItem> };
        const legacyItems = Object.fromEntries(
            Object.entries(parsed?.items ?? {}).filter(
                ([key, item]) =>
                    typeof key === "string" &&
                    item != null &&
                    typeof item.quantity === "number" &&
                    item.quantity > 0,
            ),
        );

        if (Object.keys(legacyItems).length === 0) return;

        // An existing guest record is newer than the legacy blob — it wins on conflicts
        const existing = await checkoutRepo.get(GUEST_KEY);
        await checkoutRepo.update(GUEST_KEY, {
            items: { ...legacyItems, ...existing?.items },
        });
    } catch (e) {
        console.warn("⚠️ Error migrating legacy cart from localStorage:", e);
    }
}
