<!--
Client-Side Search Results Component
Manages real-time filtering of campaigns without page reloads
-->
<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "../../i18n/store";
    import {
        searchStore,
        searchFilters,
        hasActiveFilters,
        searchError,
        searchResults,
        isSearching,
        hasSearchResults,
        hasActualSearchResults,
        hasInitialResults,
        isEmpty,
        resultCount,
    } from "../../stores/searchStore";
    import { transformProjectToCampaign } from "../../utils/projectTransform";
    import LoadingSpinner from "./LoadingSpinner.svelte";
    import SearchPagination from "./SearchPagination.svelte";
    import SearchErrorAlert from "./SearchErrorAlert.svelte";
    import CampaignCard from "../home/CampaignCard.svelte";

    import type { Project } from "../../openapi/client/types.gen";

    interface Props {
        initialProjects: Project[];
        ariaLiveRegion?: "polite" | "assertive" | "off";
        initialFilters?: {
            query?: string;
            statusFilter?: string;
            categories?: string[];
        };
        hasInitialSearch?: boolean;
    }

    let {
        initialProjects = [],
        ariaLiveRegion = "polite",
        initialFilters,
        hasInitialSearch = false,
    }: Props = $props();

    // Local state
    let isInitialized = false;
    let previousFiltersJson = "";

    // Transform projects to campaigns for display
    const campaigns = $derived($searchResults.map(transformProjectToCampaign));

    // Update URL without causing navigation
    function updateUrlWithoutNavigation() {
        if (typeof window === "undefined") return;

        const url = new URL(window.location.href);
        const params = new URLSearchParams();

        const filters = $searchFilters;

        // Add search parameters to URL
        if (filters.query) params.set("q", filters.query);
        if (filters.statusFilter) params.set("status", filters.statusFilter);
        if (filters.categories.length > 0) params.set("categories", filters.categories.join(","));

        // Update URL using History API to avoid navigation
        const newUrl = `${url.pathname}${params.toString() ? "?" + params.toString() : ""}`;
        window.history.replaceState({}, "", newUrl);
    }

    // Clear all filters
    function clearAllFilters() {
        searchStore.clearFilters();
        searchStore.clearResults();

        // Clear URL parameters
        window.history.replaceState({}, "", window.location.pathname);
    }

    // Error handling functions
    function retrySearch() {
        // Retry the current search by manually triggering API search
        searchStore.searchWithApi(false);
    }

    // Initialize with URL parameters on mount
    onMount(() => {
        // Initialize from server-side data
        if (initialFilters && hasInitialSearch) {
            // Initialize store with server-side filters first
            searchStore.initializeFilters({
                query: initialFilters.query || "",
                statusFilter: initialFilters.statusFilter || "",
                categories: initialFilters.categories || [],
            });

            // Trigger API search with the URL parameters
            setTimeout(() => {
                searchStore.searchWithApi(true);
            }, 100);
        } else if (initialProjects.length > 0) {
            // Show initial projects without marking as searched
            searchStore.setInitialResults(initialProjects, initialProjects.length);
        }

        // Store the initial filters state to detect actual changes
        const filters = $searchFilters;
        previousFiltersJson = JSON.stringify(filters);

        // Mark as initialized to enable URL updates for future changes
        isInitialized = true;
    });

    // Update URL when filters change (but don't trigger search)
    $effect(() => {
        // Skip if we haven't mounted yet or not initialized
        if (typeof window === "undefined" || !isInitialized) return;

        // Check if filters actually changed (not just initial render)
        const filters = $searchFilters;
        const currentFiltersJson = JSON.stringify(filters);

        if (currentFiltersJson !== previousFiltersJson) {
            previousFiltersJson = currentFiltersJson;
            // Only update URL, don't trigger search
            setTimeout(() => updateUrlWithoutNavigation(), 100);
        }
    });

    // Generate accessibility announcement
    $effect(() => {
        if ($hasActualSearchResults && !$isSearching) {
            const announcement = $t("search.accessibility.resultsFound", {
                count: $resultCount,
            });

            // Announce to screen readers
            const announcer = document.getElementById("search-announcer");
            if (announcer) {
                announcer.textContent = announcement;
            }
        }
    });
</script>

<!-- Screen reader announcements -->
<div
    id="search-announcer"
    class="sr-only"
    aria-live={ariaLiveRegion}
    aria-atomic="true"
    data-testid="search-announcer"
></div>

<!-- Search Results Container -->
<div class="search-results-container">
    <!-- Results Count and Clear Button -->
    {#if $hasActiveFilters}
        <div class="mb-6 flex items-center justify-between">
            <p class="text-secondary text-lg" data-testid="result-count">
                {$hasActualSearchResults ? $t("search.results.found", { count: $resultCount }) : ""}
            </p>
            <button
                onclick={clearAllFilters}
                class="text-primary hover:text-tertiary clear-filters-main text-sm font-semibold transition-colors"
                data-testid="clear-filters-btn"
            >
                {$t("search.filters.clear")}
            </button>
        </div>
    {:else if $hasActualSearchResults}
        <div class="mb-6">
            <p class="text-secondary text-lg" data-testid="result-count">
                {$t("search.results.found", { count: $resultCount })}
            </p>
        </div>
    {:else if $hasInitialResults}
        <div class="mb-6">
            <p class="text-secondary text-lg" data-testid="initial-result-count">
                {$t("search.showing_top_results", { count: $resultCount })}
            </p>
        </div>
    {/if}

    <!-- Error Alert -->
    {#if $searchError}
        <div class="mb-6">
            <SearchErrorAlert error={$searchError} onRetry={retrySearch} showRetry={true} />
        </div>
    {/if}

    <!-- Search Results Wrapper -->
    <div data-testid="search-results">
        <!-- Loading State -->
        {#if $isSearching}
            <div class="loading-spinner py-12 text-center" data-testid="loading-spinner">
                <LoadingSpinner />
            </div>
        {:else if campaigns.length > 0}
            <!-- Results Grid -->
            <div class="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {#each campaigns as campaign}
                    <!-- Render campaign cards using the Svelte CampaignCard component -->
                    <div class="campaign-card-wrapper" data-campaign-id={campaign.id}>
                        <CampaignCard size={campaign.size} {campaign} />
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <!-- Pagination Controls -->
    {#if $hasActualSearchResults && !$isSearching}
        <div class="mt-8">
            <SearchPagination showSummary={true} class="search-pagination" />
        </div>
    {/if}

    {#if $isEmpty && !$isSearching}
        <!-- Empty State -->
        <div class="py-12 text-center" data-testid="search-empty">
            <div class="mb-4">
                <svg
                    class="mx-auto h-16 w-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>
            <h3 class="mb-2 text-xl font-semibold text-gray-900">
                {$t("search.empty.title")}
            </h3>
            <p class="mb-6 text-gray-600">
                {$t("search.empty.description")}
            </p>
            <button
                onclick={clearAllFilters}
                class="bg-primary text-tertiary rounded-full px-6 py-2 font-semibold transition-opacity hover:opacity-90"
            >
                {$t("search.results.empty.clearFilters")}
            </button>
        </div>
    {/if}

    {#if !$hasSearchResults && !$isEmpty && !$isSearching}
        <!-- Initial State - No data available -->
        <div class="py-12 text-center">
            <h3 class="mb-2 text-xl font-semibold text-gray-900">
                {$t("search.initial.title")}
            </h3>
            <p class="text-gray-600">{$t("search.initial.description")}</p>
        </div>
    {/if}
</div>

<style>
    /* Screen reader only class */
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
</style>
