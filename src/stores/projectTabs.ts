import { writable } from "svelte/store";

export type TabsType = "project" | "rewards" | "budget" | "updates" | "community" | undefined;

const initialActiveTab = "project";

function createActiveTabStore() {
    const browser = typeof window !== "undefined";
    let initial: TabsType = initialActiveTab;

    if (browser) {
        const saved = sessionStorage.getItem("activeTab");
        if (saved) initial = saved as TabsType;
    }

    const store = writable<TabsType>(initial);

    if (browser) {
        store.subscribe((value) => {
            sessionStorage.setItem("activeTab", value);
        });
    }

    return store;
}

export const activeTab = createActiveTabStore();

export function resetActiveTab() {
    activeTab.set(initialActiveTab);
}