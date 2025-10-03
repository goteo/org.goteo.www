import { writable, derived, get } from "svelte/store";

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
    const prefix = normalize(title) === normalize(freeDonationTitle) ? "O" : "R";
    return { key: `${target}-${prefix}-${position}` };
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
                console.error("Error to save cart to localStorage:", e);
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
                    if (item.quantity === 0) {
                        return {
                            items: updatedItems.filter((_, index) => index !== existingIndex),
                        };
                    }

                    updatedItems[existingIndex] = {
                        ...updatedItems[existingIndex],
                        quantity: item.quantity ?? 1,
                        amount: item.amount,
                    };
                } else {
                    if (item.quantity === 0) {
                        return { items: updatedItems };
                    }

                    const position = updatedItems.length;
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
            update((cart) => ({
                items: cart.items.filter((i) => i.key !== key),
            })),

        updateQuantity: (key: string, quantity: number) =>
            update((cart) => ({
                items:
                    quantity <= 0
                        ? cart.items.filter((item) => item.key !== key)
                        : cart.items.map((item) =>
                              item.key === key && item.quantity !== quantity
                                  ? { ...item, quantity }
                                  : item,
                          ),
            })),

        clear: () => {
            set({ items: [] });
            if (isBrowser) {
                localStorage.removeItem("cart");
            }
        },

        clearProject: (projectId: number) =>
            update((cart) => ({
                items: cart.items.filter((item) => item.project !== projectId),
            })),
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
        if (item.project != null) {
            grouped[item.project] ??= [];
            grouped[item.project].push(item);
        }
    }
    return grouped;
});
