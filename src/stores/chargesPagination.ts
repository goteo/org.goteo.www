import { writable } from "svelte/store";

export const itemsPerPage = writable(10);
export const currentPage = writable(1);
export const totalItems = writable(0);
export const isLoading = writable(false);
