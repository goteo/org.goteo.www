import { writable, derived, get } from "svelte/store";

import { projectsService } from "../services/projectsService";

import type { Project } from "../openapi/client/types.gen";

export interface SearchFilters {
    query: string;
    statusFilter: string;
    categories: string[];
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

    // If we have URL parameters, mark as having searched
    const hasUrlFilters =
        state.filters.query || state.filters.statusFilter || state.filters.categories.length > 0;

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
                const hasPrevPage = currentState.currentPage > 1;

                update((state) => ({
                    ...state,
                    results: response.projects,
                    totalCount: response.totalCount,
                    hasNextPage: response.hasNextPage,
                    hasPrevPage,
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
            }));
        },

        // Initialize filters (for SSR hydration)
        initializeFilters: (newFilters: Partial<SearchFilters>) => {
            update((state) => ({
                ...state,
                filters: { ...state.filters, ...newFilters },
            }));
        },

        // Set search results
        setResults: (results: Project[], totalCount: number = results.length) =>
            update((state) => ({
                ...state,
                results,
                totalCount,
                isLoading: false,
                hasError: false,
                errorMessage: "",
                hasSearched: true,
                lastSearchTime: Date.now(),
            })),

        // Set initial results without marking as searched (for SSR data)
        setInitialResults: (results: Project[], totalCount: number = results.length) => {
            return update((state) => ({
                ...state,
                results,
                totalCount,
                isLoading: false,
                hasError: false,
                errorMessage: "",
                hasSearched: false,
                lastSearchTime: Date.now(),
            }));
        },

        // Set loading state
        setLoading: (isLoading: boolean) =>
            update((state) => ({
                ...state,
                isLoading,
                hasError: false,
                errorMessage: "",
            })),

        // Set error state
        setError: (errorMessage: string) =>
            update((state) => ({
                ...state,
                isLoading: false,
                hasError: true,
                errorMessage,
            })),

        // Clear search results
        clearResults: () =>
            update((state) => ({
                ...state,
                results: [],
                totalCount: 0,
                hasSearched: false,
                hasError: false,
                errorMessage: "",
            })),

        // Clear all filters
        clearFilters: () =>
            update((state) => ({
                ...state,
                filters: {
                    query: "",
                    statusFilter: "",
                    categories: [],
                },
            })),

        // Reset to initial state
        reset: () => set(getInitialState()),

        // Update URL parameters to reflect current filters
        updateUrl: () => {
            if (!isBrowser) return;

            const state = get(searchStore);
            const urlParams = new URLSearchParams();

            if (state.filters.query) {
                urlParams.set("q", state.filters.query);
            }
            if (state.filters.statusFilter) {
                urlParams.set("status", state.filters.statusFilter);
            }
            if (state.filters.categories.length > 0) {
                urlParams.set("categories", state.filters.categories.join(","));
            }

            const newUrl = urlParams.toString()
                ? `${window.location.pathname}?${urlParams.toString()}`
                : window.location.pathname;

            // Use replaceState to avoid adding to browser history on every filter change
            window.history.replaceState({}, "", newUrl);
        },

        // Initialize store with server-provided data
        initializeFromServer: (
            filters: SearchFilters,
            results: Project[],
            totalCount: number,
            pagination?: {
                currentPage: number;
                hasNext: boolean;
                hasPrev: boolean;
            },
        ) =>
            update((state) => ({
                ...state,
                filters,
                results,
                totalCount,
                currentPage: pagination?.currentPage || 1,
                hasNextPage: pagination?.hasNext || false,
                hasPrevPage: pagination?.hasPrev || false,
                hasSearched:
                    totalCount > 0 ||
                    !!(filters.query || filters.statusFilter || filters.categories.length > 0),
                isLoading: false,
                hasError: false,
                errorMessage: "",
                lastSearchTime: Date.now(),
            })),

        // Search with API (manual trigger)
        searchWithApi: async (resetPage = true) => {
            if (resetPage) {
                update((state) => ({
                    ...state,
                    currentPage: 1,
                }));
            }

            // Get the updated state AFTER resetting the page
            const currentState = get(store);
            await performSearch(currentState.filters);
        },

        // Load next page
        loadNextPage: async () => {
            const currentState = get(store);
            if (!currentState.hasNextPage || currentState.isLoading) return;

            update((state) => ({
                ...state,
                currentPage: state.currentPage + 1,
            }));

            await store.searchWithApi(false);
        },

        // Load previous page
        loadPreviousPage: async () => {
            const currentState = get(store);
            if (
                !currentState.hasPrevPage ||
                currentState.isLoading ||
                currentState.currentPage <= 1
            )
                return;

            update((state) => ({
                ...state,
                currentPage: state.currentPage - 1,
            }));

            await store.searchWithApi(false);
        },

        // Go to specific page
        goToPage: async (page: number) => {
            const currentState = get(store);
            if (page < 1 || currentState.isLoading) return;

            update((state) => ({
                ...state,
                currentPage: page,
            }));

            await store.searchWithApi(false);
        },

        // Cancel current API request
        cancelRequest: () => {
            update((state) => {
                if (state.currentAbortController) {
                    state.currentAbortController.abort();
                }
                return {
                    ...state,
                    isLoading: false,
                    currentAbortController: undefined,
                };
            });
        },

        // Load more results (accumulative pagination)
        loadMoreResults: async () => {
            const currentState = get(store);
            if (!currentState.hasNextPage || currentState.isLoading) return;

            try {
                // Increment page before fetching
                update((state) => ({
                    ...state,
                    currentPage: state.currentPage + 1,
                }));

                const nextPageState = get(store);

                // Cancel previous request if exists
                if (nextPageState.currentAbortController) {
                    nextPageState.currentAbortController.abort();
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

                const response = await projectsService.searchProjects(nextPageState.filters, {
                    page: nextPageState.currentPage,
                    limit: nextPageState.itemsPerPage,
                    abortSignal: abortController.signal,
                });

                // Check if request wasn't cancelled
                if (!abortController.signal.aborted) {
                    const hasPrevPage = nextPageState.currentPage > 1;

                    update((state) => ({
                        ...state,
                        // Append new results to existing results
                        results: [...state.results, ...response.projects],
                        totalCount: response.totalCount,
                        hasNextPage: response.hasNextPage,
                        hasPrevPage,
                        isLoading: false,
                        hasSearched: true,
                        lastSearchTime: Date.now(),
                        currentAbortController: undefined,
                    }));
                }
            } catch (error) {
                // Only set error if request wasn't cancelled
                // Keep existing results on error
                if (!(error instanceof Error) || error.name !== "AbortError") {
                    update((state) => ({
                        ...state,
                        isLoading: false,
                        hasError: true,
                        errorMessage:
                            error instanceof Error ? error.message : "Failed to load more results",
                        currentAbortController: undefined,
                        // Revert page increment on error
                        currentPage: state.currentPage - 1,
                    }));
                }
            }
        },
    };

    return store;
}

// Create the main search store
export const searchStore = createSearchStore();

// Derived stores for computed values
export const searchFilters = derived(searchStore, ($searchStore) => $searchStore.filters);

export const searchResults = derived(searchStore, ($searchStore) => $searchStore.results);

export const isSearching = derived(searchStore, ($searchStore) => $searchStore.isLoading);

export const searchError = derived(searchStore, ($searchStore) =>
    $searchStore.hasError ? $searchStore.errorMessage : null,
);

export const hasSearchResults = derived(
    searchStore,
    ($searchStore) => $searchStore.results.length > 0,
);

export const hasActualSearchResults = derived(
    searchStore,
    ($searchStore) => $searchStore.hasSearched && $searchStore.results.length > 0,
);

export const hasInitialResults = derived(
    searchStore,
    ($searchStore) => !$searchStore.hasSearched && $searchStore.results.length > 0,
);

export const isEmpty = derived(
    searchStore,
    ($searchStore) => $searchStore.hasSearched && $searchStore.results.length === 0,
);

export const resultCount = derived(searchStore, ($searchStore) => $searchStore.totalCount);

// Derived store to check if any filters are active
export const hasActiveFilters = derived(searchStore, ($searchStore) => {
    const { filters } = $searchStore;
    return !!(filters.query || filters.statusFilter || filters.categories.length > 0);
});

// Pagination derived stores
export const currentPage = derived(searchStore, ($searchStore) => $searchStore.currentPage);

export const hasNextPage = derived(searchStore, ($searchStore) => $searchStore.hasNextPage);

export const hasPrevPage = derived(searchStore, ($searchStore) => $searchStore.hasPrevPage);

// Pagination info derived store
export const paginationInfo = derived(searchStore, ($searchStore) => ({
    currentPage: $searchStore.currentPage,
    totalCount: $searchStore.totalCount,
    hasNext: $searchStore.hasNextPage,
    hasPrev: $searchStore.hasPrevPage,
    isLoading: $searchStore.isLoading,
}));
