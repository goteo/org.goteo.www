import { Dexie, type EntityTable } from "dexie";

import type { StoredCheckout } from "../../stores/checkoutsStore";

export const db = new Dexie("goteo-checkouts") as Dexie & {
    checkouts: EntityTable<StoredCheckout, "key">;
};

db.version(1).stores({
    checkouts: "key",
});
