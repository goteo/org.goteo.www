import { writable, derived } from "svelte/store";

import { apiProjectRewardsIdGetUrl } from "../openapi/client/paths.gen";
import { getDefaultCurrency } from "../utils/consts";
import { multiplyMoney, sumMoney } from "../utils/money";

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
    recipientDisplayName: string;

    /**
     * Items of kind "reward" must have an associated ProjectReward
     */
    reward?: ProjectReward;
}

type CartState = {
    items: Record<string, CartItem>;
};

export interface CartStore {
    subscribe: (run: (value: CartState) => void) => () => void;

    addItem: (item: Omit<CartItem, "key">) => void;
    removeItem: (key: string) => void;
    updateQuantity: (key: string, quantity: number) => void;

    clear: () => void;
    clearTarget: (target: string) => void;
}

const isBrowser = typeof window !== "undefined";

function generateKey(item: Omit<CartItem, "key">): string {
    const base = `${item.kind}:${item.recipient}`;
    if (item.kind === "reward" && item.reward?.id != null) {
        return `${base};reward:${apiProjectRewardsIdGetUrl.replace("{id}", String(item.reward.id))}`;
    }
    return base;
}

export function parseKey(key: string): {
    kind: string;
    recipient: string;
    extra: { kind: string; recipient: string }[];
} {
    const segments = key.split(";");
    const colonIdx = segments[0].indexOf(":");
    const kind = segments[0].slice(0, colonIdx);
    const recipient = segments[0].slice(colonIdx + 1);
    const extra = segments.slice(1).map((s) => {
        const idx = s.indexOf(":");
        return { kind: s.slice(0, idx), recipient: s.slice(idx + 1) };
    });
    return { kind, recipient, extra };
}

function loadInitialCart(): CartState {
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

function createCartStore(): CartStore {
    const { subscribe, set, update } = writable<CartState>(loadInitialCart());

    subscribe((cart) => {
        try {
            if (!isBrowser) return;

            localStorage.setItem("cart", JSON.stringify(cart));
        } catch (e) {
            console.error("Error to save cart to localStorage:", e);
        }
    });

    return {
        subscribe,

        addItem: (item: Omit<CartItem, "key">) =>
            update((cart) => {
                const key = generateKey(item);
                const items = { ...cart.items };

                if (item.quantity === 0) {
                    delete items[key];
                    return { items };
                }

                items[key] = { ...item, key } as CartItem;

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

export const cartAmount = derived(cart, ($cart) => {
    const items = Object.values($cart.items);
    if (items.length === 0) return { amount: 0, currency: getDefaultCurrency() };
    return sumMoney(items.map((item) => multiplyMoney(item.money, item.quantity)));
});

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

export const cartByRecipient = derived(cart, ($cart) => {
    const grouped: Record<string, CartItem[]> = {};

    for (const item of Object.values($cart.items)) {
        const { recipient } = parseKey(item.key);
        grouped[recipient] ??= [];
        grouped[recipient].push(item);
    }

    return grouped;
});
