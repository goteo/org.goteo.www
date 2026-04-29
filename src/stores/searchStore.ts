import { writable, derived, get } from "svelte/store";

import { projectsService } from "../services/projectsService";

import type { Project, Territory } from "../openapi/client/types.gen";

export interface SearchFilters {
    query: string;
    statusFilter: string;
    categories: string[];
    territory?: Territory | null;
}

export interface SearchState {
    filters: SearchFilters;
    results: Project[];
    isLoading: boolean;
    hasError: boolean;
    errorMessage: string;
    totalCount: number;
    hasSearched: boolean;
    lastSearchTime: number;
    // Pagination state
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    currentAbortController?: AbortController;
}

// Browser check for SSR safety
const isBrowser = typeof window !== "undefined";

// Initialize search state
function getInitialState(): SearchState {
    return {
        filters: {
            query: "",
            statusFilter: "",
            categories: [],
            territory: null,
        },
        results: [],
        isLoading: false,
        hasError: false,
        errorMessage: "",
        totalCount: 0,
        hasSearched: false,
        lastSearchTime: 0,
        // Pagination state
        currentPage: 1,
        itemsPerPage: 20,
        hasNextPage: false,
        hasPrevPage: false,
        currentAbortController: undefined,
    };
}

// Load initial state from URL parameters if available
function loadInitialState(): SearchState {
    if (!isBrowser) return getInitialState();

    const state = getInitialState();
    const urlParams = new URLSearchParams(window.location.search);

    // Initialize filters from URL parameters
    state.filters.query = urlParams.get("q") || "";
    state.filters.statusFilter = urlParams.get("status") || "";

    const categories = urlParams.get("categories");
    if (categories) {
        state.filters.categories = categories.split(",").filter(Boolean);
    }

    const country = urlParams.get("country");
    if (country) {
        state.filters.territory = {
            country,
            subLvl1: urlParams.get("subLvl1") || undefined,
            subLvl2: urlParams.get("subLvl2") || undefined,
        };
    }
    const hasUrlFilters =
        state.filters.query ||
        state.filters.statusFilter ||
        state.filters.categories.length > 0 ||
        state.filters.territory;

    if (hasUrlFilters) {
        state.hasSearched = true;
    }

    return state;
}

function createSearchStore() {
    const { subscribe, set, update } = writable<SearchState>(loadInitialState());

    // Direct search function - executes immediately when called
    const performSearch = async (filters: SearchFilters) => {
        try {
            const currentState = get(store);

            // Cancel previous request if exists
            if (currentState.currentAbortController) {
                currentState.currentAbortController.abort();
            }

            // Create new abort controller
            const abortController = new AbortController();

            update((state) => ({
                ...state,
                isLoading: true,
                hasError: false,
                errorMessage: "",
                currentAbortController: abortController,
            }));

            const response = await projectsService.searchProjects(filters, {
                page: currentState.currentPage,
                limit: currentState.itemsPerPage,
                abortSignal: abortController.signal,
            });

            // Check if request wasn't cancelled
            if (!abortController.signal.aborted) {
                update((state) => ({
                    ...state,
                    results: response.projects,
                    totalCount: response.totalCount,
                    hasNextPage: response.hasNextPage,
                    hasPrevPage: currentState.currentPage > 1,
                    isLoading: false,
                    hasSearched: true,
                    lastSearchTime: Date.now(),
                    currentAbortController: undefined,
                }));
            }
        } catch (error) {
            // Only set error if request wasn't cancelled
            if (!(error instanceof Error) || error.name !== "AbortError") {
                update((state) => ({
                    ...state,
                    isLoading: false,
                    hasError: true,
                    errorMessage: error instanceof Error ? error.message : "Search failed",
                    currentAbortController: undefined,
                }));
            }
        }
    };

    const store = {
        subscribe,

        // Update filters without triggering search
        updateFilters: (newFilters: Partial<SearchFilters>) => {
            update((state) => ({
                ...state,
                filters: { ...state.filters, ...newFilters },
                currentPage: 1,
            }));
        },

        updateUrl: () => {
            if (!isBrowser) return;

            const state = get(searchStore);
            const urlParams = new URLSearchParams();

            if (state.filters.query) urlParams.set("q", state.filters.query);
            if (state.filters.statusFilter) urlParams.set("status", state.filters.statusFilter);
            if (state.filters.categories.length > 0) {
                urlParams.set("categories", state.filters.categories.join(","));
            }

            if (state.filters.territory) {
                urlParams.set("country", String(state.filters.territory.country));

                if (state.filters.territory.subLvl1) {
                    urlParams.set("subLvl1", String(state.filters.territory.subLvl1));
                }

                if (state.filters.territory.subLvl2) {
                    urlParams.set("subLvl2", String(state.filters.territory.subLvl2));
                }
            }

            const newUrl = urlParams.toString()
                ? `${window.location.pathname}?${urlParams.toString()}`
                : window.location.pathname;

            window.history.replaceState({}, "", newUrl);
        },

        initializeFromServer: (
            filters: SearchFilters,
            results: Project[],
            totalCount: number,
            pagination?: any,
        ) =>
            update((state) => ({
                ...state,
                filters,
                results,
                totalCount,
                currentPage: pagination?.currentPage || 1,
                hasNextPage: pagination?.hasNext || false,
                hasPrevPage: pagination?.hasPrev || false,
                hasSearched: totalCount > 0 || !!(filters.query || filters.territory), // CAMBIO: Check de territorio
                isLoading: false,
                lastSearchTime: Date.now(),
            })),

        searchWithApi: async (resetPage = true) => {
            if (resetPage) update((s) => ({ ...s, currentPage: 1 }));
            const currentState = get(searchStore);
            await performSearch(currentState.filters);
        },

        loadMoreResults: async () => {
            const currentState = get(searchStore);
            if (!currentState.hasNextPage || currentState.isLoading) return;

            update((s) => ({ ...s, currentPage: s.currentPage + 1 }));
            const nextState = get(searchStore);

            await performSearch(nextState.filters);
        },

        clearFilters: () =>
            update((s) => ({
                ...s,
                filters: getInitialState().filters,
            })),

        reset: () => set(getInitialState()),
    };

    return store;
}

export const searchStore = createSearchStore();

export const hasActiveFilters = derived(searchStore, ($s) => {
    return !!(
        $s.filters.query ||
        $s.filters.statusFilter ||
        $s.filters.categories.length > 0 ||
        $s.filters.territory
    );
});

export const searchFilters = derived(searchStore, ($searchStore) => $searchStore.filters);
export const searchResults = derived(searchStore, ($s) => $s.results);
export const isSearching = derived(searchStore, ($s) => $s.isLoading);
export const resultCount = derived(searchStore, ($s) => $s.totalCount);
