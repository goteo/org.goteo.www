import { writable, derived } from "svelte/store";

export interface CartItem {
    key: string;
    title: string;
    amount: number;
    quantity: number;
    image?: string;
    project?: number;
    owner?: string;
}

interface CartStore {
    items: CartItem[];
}

function generateKey(item: Omit<CartItem, "key">): string {
    const base = `${item.title}-${item.project ?? "none"}-${item.owner ?? "none"}`;
    return base.toLowerCase().replace(/\s+/g, "_");
}

const defaultDonation = {
    title: "Donación Platoniq",
    amount: 300,
    quantity: 1,
    image: "",
    owner: "Platoniq",
};

const defaultItem = { ...defaultDonation, key: generateKey(defaultDonation) };

const isBrowser = typeof window !== "undefined";

function loadInitialCart(): CartStore {
    if (!isBrowser) return { items: [defaultItem] };

    try {
        const stored = localStorage.getItem("cart");
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.warn("⚠️ Error al leer localStorage:", e);
    }

    // Primera carga si no hay nada
    const fresh = { items: [defaultItem] };
    localStorage.setItem("cart", JSON.stringify(fresh));
    return fresh;
}

function createCartStore() {
    const { subscribe, set, update } = writable<CartStore>(loadInitialCart());

    // Guardar en localStorage en cada cambio
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
                const key = generateKey(item);
                const index = cart.items.findIndex((i) => i.key === key);
                const updatedItems = [...cart.items];

                if (index >= 0) {
                    updatedItems[index] = {
                        ...updatedItems[index],
                        quantity: item.quantity ?? updatedItems[index].quantity,
                        amount: item.amount,
                    };
                } else {
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
