import { writable } from "svelte/store";

interface ProjectDraft {
    title: string;
    subtitle: string;
    categories: string[];
    budget: number;
    release: Date;
}

export const draft = writable<ProjectDraft>({
    title: "",
    subtitle: "",
    categories: [""],
    budget: 0,
    release: new Date()
});
