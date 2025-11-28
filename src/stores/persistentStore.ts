import { writable } from "svelte/store";

export function persistentStore<T>(key: string, initial: T) {
    const browser = typeof window !== "undefined";

    const startValue = browser
        ? JSON.parse(localStorage.getItem(key) ?? "null") ?? initial
        : initial;

    const store = writable<T>(startValue);

    if (browser) {
        store.subscribe(value => {
            localStorage.setItem(key, JSON.stringify(value));
        });
    }

    return store;
}