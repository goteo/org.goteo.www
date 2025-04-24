import { writable, derived } from "svelte/store";

export type CartItem = {
    key: string;
    title: string;
    amount: number;
    quantity: number;
    image?: string;
    project?: number;
    target: string;
    claimed?: number;
    currency: string;
};

type CartStore = {
    items: CartItem[];
};

const isBrowser = typeof window !== "undefined";

function generateKey({
    title,
    accountingId,
    position,
}: {
    title: string;
    accountingId: string;
    position: number;
}) {
    const normalizedTitle = title.trim().toLowerCase();
    const prefix = normalizedTitle === "donación libre" ? "O" : "R";
    const finalKey = `${accountingId}-${prefix}-${position}`;

    return {
        key: finalKey,
    };
}

function loadInitialCart(): CartStore {
    if (!isBrowser) return { items: [] };

    try {
        const stored = localStorage.getItem("cart");
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.warn("⚠️ Error al leer localStorage:", e);
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
                console.error("❌ Error guardando en localStorage:", e);
            }
        });
    }

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
                        accountingId: item.target,
                        position,
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
