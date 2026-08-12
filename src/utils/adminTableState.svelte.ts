import { getCookie, setCookie } from "./cookies";
import {
    ADMIN_ITEMS_PER_PAGE_COOKIE,
    DEFAULT_ITEMS_PER_PAGE,
    isValidItemsPerPage,
    type AdminItemsPerPage,
} from "./adminTable";

function getInitialItemsPerPage(): AdminItemsPerPage {
    if (typeof document === "undefined") return DEFAULT_ITEMS_PER_PAGE;

    const raw = getCookie(ADMIN_ITEMS_PER_PAGE_COOKIE);
    if (!raw) return DEFAULT_ITEMS_PER_PAGE;

    const parsed = Number(raw);
    return isValidItemsPerPage(parsed) ? parsed : DEFAULT_ITEMS_PER_PAGE;
}

export function useAdminTableState<T extends string>(initialSort: T) {
    let currentPage = $state(1);
    let itemsPerPage = $state<AdminItemsPerPage>(getInitialItemsPerPage());
    let selectedSort = $state<T>(initialSort);
    let isLoading = $state(false);
    let isFirstLoad = $state(true);
    let totalItems = $state(0);

    return {
        get currentPage() {
            return currentPage;
        },
        set currentPage(v: number) {
            currentPage = v;
        },
        get itemsPerPage() {
            return itemsPerPage;
        },
        set itemsPerPage(v: AdminItemsPerPage) {
            itemsPerPage = v;
        },
        get selectedSort() {
            return selectedSort;
        },
        set selectedSort(v: T) {
            selectedSort = v;
        },
        get isLoading() {
            return isLoading;
        },
        set isLoading(v: boolean) {
            isLoading = v;
        },
        get isFirstLoad() {
            return isFirstLoad;
        },
        set isFirstLoad(v: boolean) {
            isFirstLoad = v;
        },
        get totalItems() {
            return totalItems;
        },
        set totalItems(v: number) {
            totalItems = v;
        },
        handlePageChange(page: number) {
            currentPage = page;
        },
        handleItemsPerPageChange(perPage: number) {
            if (isValidItemsPerPage(perPage)) {
                itemsPerPage = perPage;
                setCookie(ADMIN_ITEMS_PER_PAGE_COOKIE, String(perPage));
                currentPage = 1;
            }
        },
        handleSortChange(sort: T) {
            selectedSort = sort;
            currentPage = 1;
        },
    };
}
