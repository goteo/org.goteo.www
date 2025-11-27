import { writable } from "svelte/store";

export type Tabs = "project" | "rewards" | "budget" | "updates" | "community";

const initialActiveTab = "project";

export let activeTab = writable<Tabs>(initialActiveTab);