import { writable, derived } from "svelte/store";
import { get } from "svelte/store";

import { t } from "../i18n/store";

export type CartItem = {
    key: string;
    title: string;
    amount: number;
    quantity: number;
    image?: string;
    project?: number;
    target: number;
    claimed?: number;
    currency: string;
};

type CartStore = {
    items: CartItem[];
};

const isBrowser = typeof window !== "undefined";

type GenerateKeyOptions = {
    title: string;
    target: number;
    position: number;
    freeDonationTitle: string;
};

function generateKey({ title, target, position, freeDonationTitle }: GenerateKeyOptions) {
    const normalize = (str: string) => str.trim().toLowerCase();

    const isFreeDonation = normalize(title) === normalize(freeDonationTitle);
    const prefix = isFreeDonation ? "O" : "R";
    const finalKey = `${target}-${prefix}-${position}`;

    return { key: finalKey };
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

    if (isBrowser) {
        subscribe((cart) => {
            try {
                localStorage.setItem("cart", JSON.stringify(cart));
            } catch (e) {
                console.error("❌ Error to save cart to localStorage:", e);
            }
        });
    }

    const translations = get(t);
    const freeDonationTitle = translations("checkout.cart.freeDonation.title");

    return {
        subscribe,

        addItem: (item: Omit<CartItem, "key">) =>
            update((cart) => {
                const existingIndex = cart.items.findIndex(
                    (i) => i.target === item.target && i.title === item.title,
                );

                const updatedItems = [...cart.items];

                if (existingIndex >= 0) {
                    updatedItems[existingIndex] = {
                        ...updatedItems[existingIndex],
                        quantity: updatedItems[existingIndex].quantity + (item.quantity ?? 1),
                    };
                } else {
                    const position = cart.items.length;
                    const { key } = generateKey({
                        title: item.title,
                        target: item.target,
                        position,
                        freeDonationTitle,
                    });
                    updatedItems.push({ ...item, key });
                }

                return { items: updatedItems };
            }),

        removeItem: (key: string) =>
            update((cart) => {
                const filteredItems = cart.items.filter((i) => i.key !== key);
                if (filteredItems.length === cart.items.length) return cart;
                return { items: filteredItems };
            }),

        updateQuantity: (key: string, quantity: number) =>
            update((cart) => {
                if (quantity <= 0) {
                    return {
                        items: cart.items.filter((item) => item.key !== key),
                    };
                }

                const updatedItems = cart.items.map((item) =>
                    item.key === key && item.quantity !== quantity ? { ...item, quantity } : item,
                );

                return { items: updatedItems };
            }),

        clear: () => set({ items: [] }),
    };
}

export const cart = createCartStore();

export const itemCount = derived(cart, ($cart) =>
    $cart.items.reduce((total, item) => total + item.quantity, 0),
);

export const totalAmount = derived(cart, ($cart) =>
    $cart.items.reduce((total, item) => total + item.amount * item.quantity, 0),
);

export const itemsByProject = derived(cart, ($cart) => {
    const grouped: Record<number, CartItem[]> = {};

    for (const item of $cart.items) {
        if (item.project == null) continue;

        if (!grouped[item.project]) {
            grouped[item.project] = [];
        }

        grouped[item.project].push(item);
    }

    return grouped;
});
