import { db } from "./db";

import type { StoredCheckout } from "../../stores/checkoutsStore";

const isBrowser = typeof window !== "undefined";

/**
 * IndexedDB stores via structured clone, which throws DataCloneError on
 * Svelte 5 $state proxies (e.g. items built from $bindable props).
 * A JSON round-trip strips proxies down to plain clonable objects.
 */
function toPlain<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

export const checkoutRepo = {
    async create(record: StoredCheckout) {
        if (!isBrowser) return record;

        await db.checkouts.put(toPlain({ ...record, updatedAt: Date.now() }));
        return record;
    },

    async get(key: string) {
        if (!isBrowser) return undefined;

        return db.checkouts.get(key);
    },

    async update(key: string, data: Partial<StoredCheckout>) {
        if (!isBrowser) return;

        const existing = await db.checkouts.get(key);

        await db.checkouts.put(
            toPlain({
                key,
                items: {},
                ...existing,
                ...data,
                updatedAt: Date.now(),
            }),
        );
    },

    async remove(key: string) {
        if (!isBrowser) return;

        await db.checkouts.delete(key);
    },
};
