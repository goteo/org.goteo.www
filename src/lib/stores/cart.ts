import { writable, derived } from "svelte/store";
import { browser } from "$app/environment";

export interface CartItem {
    id: string;
    type: "reward" | "donation";
    name: string;
    amount: number;
    quantity: number;
    image?: string;
    project?: number; // added property for grouping items by project
}

interface CartStore {
    items: CartItem[];
}

// Initialize from localStorage if available, otherwise empty cart
const initialCart: CartStore = browser
    ? JSON.parse(localStorage.getItem("cart") || '{"items":[]}')
    : { items: [] };

function createCartStore() {
    const { subscribe, set, update } = writable<CartStore>(initialCart);

    // Save to localStorage whenever the store changes
    if (browser) {
        subscribe((cart) => {
            localStorage.setItem("cart", JSON.stringify(cart));
        });
    }

    return {
        subscribe,

        // Add an item to the cart
        addItem: (item: CartItem) =>
            update((cart) => {
                const existingItemIndex = cart.items.findIndex(
                    (i) => i.id === item.id && i.type === item.type,
                );

                if (existingItemIndex >= 0) {
                    // Update quantity if item exists
                    cart.items[existingItemIndex].quantity += item.quantity;
                } else {
                    // Add new item
                    cart.items.push(item);
                }

                return cart;
            }),

        // Remove an item from the cart
        removeItem: (id: string, type: "reward" | "donation") =>
            update((cart) => {
                cart.items = cart.items.filter((i) => !(i.id === id && i.type === type));
                return cart;
            }),

        // Update item quantity
        updateQuantity: (id: string, type: "reward" | "donation", quantity: number) =>
            update((cart) => {
                const item = cart.items.find((i) => i.id === id && i.type === type);
                if (item) {
                    item.quantity = quantity;
                }
                return cart;
            }),

        // Clear the cart
        clear: () => set({ items: [] }),
    };
}

export const cart = createCartStore();

// Derived stores for convenient access
export const itemCount = derived(cart, ($cart) =>
    $cart.items.reduce((total, item) => total + item.quantity, 0),
);

export const totalAmount = derived(cart, ($cart) =>
    $cart.items.reduce((total, item) => total + item.amount * item.quantity, 0),
);
