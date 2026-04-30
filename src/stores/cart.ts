import murmur from "murmurhash-js";
import { writable, derived } from "svelte/store";

import type { GatewayCharge } from "../openapi/client";

export interface CartItem extends GatewayCharge {
    key: string;
    quantity: number;
}

type CartStore = {
    items: CartItem[];
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
    if (!isBrowser) return { items: [] };

    try {
        const stored = localStorage.getItem("cart");
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.warn("⚠️ Error loading cart from localStorage:", e);
    }

    const fresh = { items: [] };
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
                const existingIndex = cart.items.findIndex((i) => i.key === key);
                const updatedItems = [...cart.items];

                if (existingIndex >= 0) {
                    if (item.quantity === 0) {
                        return {
                            items: updatedItems.filter((_, index) => index !== existingIndex),
                        };
                    }

                    updatedItems[existingIndex] = {
                        ...updatedItems[existingIndex],
                        quantity: item.quantity ?? 1,
                    };
                } else {
                    if (item.quantity === 0) {
                        return { items: updatedItems };
                    }

                    updatedItems.push({ ...item, key });
                }

                return { items: updatedItems };
            }),

        removeItem: (key: string) =>
            update((cart) => ({
                items: cart.items.filter((i) => i.key !== key),
            })),

        updateQuantity: (key: string, quantity: number) =>
            update((cart) => ({
                items:
                    quantity <= 0
                        ? cart.items.filter((item) => item.key !== key)
                        : cart.items.map((item) => {
                            if (item.key !== key) {
                                return item;
                            }

                            return { ...item, quantity };
                        }),
            })),

        clear: () => {
            set({ items: [] });
            localStorage.removeItem("cart");
        },

        clearTarget: (target: string) =>
            update((cart) => ({
                items: cart.items.filter((item) => item.target !== target),
            })),
    };
}

export const cart = createCartStore();

export const itemCount = derived(cart, ($cart) =>
    $cart.items.reduce((total, item) => total + item.quantity, 0),
);

export const totalAmount = derived(cart, ($cart) =>
    $cart.items.reduce((total, item) => total + item.money.amount * item.quantity, 0),
);

export const itemsByProject = derived(cart, ($cart) => {
    const grouped: Record<string, CartItem[]> = {};

    for (const item of $cart.items) {
        if (item.target != null) {
            grouped[item.target] ??= [];
            grouped[item.target].push(item);
        }
    }

    return grouped;
});
