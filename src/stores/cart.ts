import murmur from "murmurhash-js";
import { writable, derived } from "svelte/store";

import type { GatewayCharge, ProjectReward } from "../openapi/client";

export interface CartItem extends GatewayCharge {
    key: string;
    kind: "free" | "reward" | "tip";
    quantity: number;

    /**
     * `target` references the Accounting that will receive the money\
     * `recipient` references the owner of that Accounting
     */
    recipient: string;

    /**
     * Items of kind "reward" must have an associated ProjectReward
     */
    reward?: ProjectReward;
}

type CartStore = {
    items: Record<string, CartItem>;
};

type GenerateKeyOptions = {
    target: GatewayCharge["target"];
    title: GatewayCharge["title"];
    description?: GatewayCharge["description"];
    dateCreated?: GatewayCharge["dateCreated"];
};

const isBrowser = typeof window !== "undefined";

function generateKey(args: GenerateKeyOptions): string {
    return murmur
        .murmur3(`${args.target}-${args.title}${args.description}-${args.dateCreated}`)
        .toString(16);
}

function loadInitialCart(): CartStore {
    const fresh = { items: {} };

    if (!isBrowser) return fresh;

    try {
        const stored = localStorage.getItem("cart");
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.warn("⚠️ Error loading cart from localStorage:", e);
    }

    localStorage.setItem("cart", JSON.stringify(fresh));
    return fresh;
}

function createCartStore() {
    const { subscribe, set, update } = writable<CartStore>(loadInitialCart());

    subscribe((cart) => {
        try {
            localStorage.setItem("cart", JSON.stringify(cart));
        } catch (e) {
            console.error("Error to save cart to localStorage:", e);
        }
    });

    return {
        subscribe,

        addItem: (item: Omit<CartItem, "key">) =>
            update((cart) => {
                const key = generateKey({ ...item });
                const items = { ...cart.items };

                if (item.quantity === 0) {
                    delete items[key];
                    return { items };
                }

                if (items[key]) {
                    items[key] = {
                        ...items[key],
                        quantity: item.quantity ?? 1,
                    };
                } else {
                    items[key] = { ...item, key };
                }

                return { items };
            }),

        removeItem: (key: string) =>
            update((cart) => {
                const items = { ...cart.items };
                delete items[key];
                return { items };
            }),

        updateQuantity: (key: string, quantity: number) =>
            update((cart) => {
                const items = { ...cart.items };

                if (quantity <= 0) {
                    delete items[key];
                } else if (items[key]) {
                    items[key] = { ...items[key], quantity };
                }

                return { items };
            }),

        clear: () => {
            set({ items: {} });
            localStorage.removeItem("cart");
        },

        clearTarget: (target: string) =>
            update((cart) => {
                const items = Object.fromEntries(
                    Object.entries(cart.items).filter((item) => item[1].target !== target),
                );

                return { items };
            }),
    };
}

export const cart = createCartStore();

export const cartCount = derived(cart, ($cart) =>
    Object.values($cart.items).reduce((total, item) => total + item.quantity, 0),
);

export const cartAmount = derived(cart, ($cart) =>
    Object.values($cart.items).reduce(
        (total, item) => total + item.money.amount * item.quantity,
        0,
    ),
);

export const cartByTarget = derived(cart, ($cart) => {
    const grouped: Record<string, CartItem[]> = {};

    for (const item of Object.values($cart.items)) {
        if (item.target != null) {
            grouped[item.target] ??= [];
            grouped[item.target].push(item);
        }
    }

    return grouped;
});
