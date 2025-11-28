import { persistentStore } from "./persistentStore";

export type TabsType = "project" | "rewards" | "budget" | "updates" | "community";

const initialActiveTab = "project";

export let activeTab = persistentStore<TabsType>("activeTab", initialActiveTab);

export function resetActiveTab() {
    activeTab.set(initialActiveTab);
}