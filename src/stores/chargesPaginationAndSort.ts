import { writable } from "svelte/store";

export const itemsPerPage = writable(10);
export const currentPage = writable(1);
export const totalItems = writable(0);
export const isLoading = writable(false);

export type SortOption = {
    key: string;
    field: string;
    direction: "asc" | "desc";
    label: string;
};

export const sortOptions: SortOption[] = [
    {
        key: "date-desc",
        field: "dateCreated",
        direction: "desc",
        label: "contributions.filters.order.options.date-desc",
    },
    {
        key: "date-asc",
        field: "dateCreated",
        direction: "asc",
        label: "contributions.filters.order.options.date-asc",
    },
    {
        key: "amount-desc",
        field: "money.amount",
        direction: "desc",
        label: "contributions.filters.order.options.amount-desc",
    },
    {
        key: "amount-asc",
        field: "money.amount",
        direction: "asc",
        label: "contributions.filters.order.options.amount-asc",
    },
    {
        key: "status-desc",
        field: "status",
        direction: "desc",
        label: "contributions.filters.order.options.status-desc",
    },
    {
        key: "status-asc",
        field: "status",
        direction: "asc",
        label: "contributions.filters.order.options.status-asc",
    },
];