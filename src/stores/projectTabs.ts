import { writable } from "svelte/store";

export type TabsType = "project" | "rewards" | "budget" | "updates" | "community";

const initialActiveTab = "project";

export let activeTab = writable<TabsType>(initialActiveTab);