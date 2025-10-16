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
        searchError,
        searchResults,
        isSearching,
        hasSearchResults,
        hasActualSearchResults,
        isEmpty,
        resultCount,
        hasNextPage,
    } from "../../stores/searchStore";
    import { transformProjectToCampaign } from "../../utils/projectTransform";
    import LoadingSpinner from "./LoadingSpinner.svelte";
    import LoadMoreButton from "./LoadMoreButton.svelte";
    import SearchErrorAlert from "./SearchErrorAlert.svelte";
    import CampaignCard from "../home/CampaignCard.svelte";

    import type { Project } from "../../openapi/client/types.gen";
    import type { Campaign } from "../../types/campaign";

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
    let previousResultsJson = "";
    let campaigns = $state<Campaign[]>([]);
    let isTransforming = $state(false);

    // Transform projects to campaigns asynchronously
    // Only transform when results actually change (not on every keystroke)
    $effect(() => {
        const projects = $searchResults;
        const currentResultsJson = JSON.stringify(projects.map((p) => p.id));

        // Skip transformation if results haven't changed
        if (currentResultsJson === previousResultsJson) {
            return;
        }

        previousResultsJson = currentResultsJson;

        async function transformProjects() {
            isTransforming = true;
            try {
                const transformed = await Promise.all(
                    projects.map((project) => transformProjectToCampaign(project)),
                );
                campaigns = transformed;
            } catch (error) {
                console.error("Failed to transform projects:", error);
                campaigns = [];
            } finally {
                isTransforming = false;
            }
        }

        transformProjects();
    });

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

        // Trigger search to get default results
        setTimeout(() => {
            searchStore.searchWithApi(true);
        }, 100);
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
        } else {
            // No URL params and no initial projects - fetch default results client-side
            setTimeout(() => {
                searchStore.searchWithApi(true);
            }, 100);
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
    <!-- Error Alert -->
    {#if $searchError}
        <div class="mb-6">
            <SearchErrorAlert error={$searchError} onRetry={retrySearch} showRetry={true} />
        </div>
    {/if}

    <!-- Search Results Wrapper -->
    <div data-testid="search-results">
        <!-- Initial Loading State (only when no results exist yet) -->
        {#if ($isSearching || isTransforming) && campaigns.length === 0}
            <div class="loading-spinner py-12 text-center" data-testid="loading-spinner">
                <LoadingSpinner />
            </div>
        {/if}

        <!-- Results Grid (keep visible during load more) -->
        {#if campaigns.length > 0}
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

    <!-- Load More Button (show even while loading, button handles loading state) -->
    {#if $hasActualSearchResults && !isTransforming}
        <div class="mt-8">
            <LoadMoreButton
                onLoadMore={() => searchStore.loadMoreResults()}
                isLoading={$isSearching}
                hasMore={$hasNextPage}
                loadedCount={$searchResults.length}
            />
        </div>
    {/if}

    {#if $isEmpty && !$isSearching && !isTransforming}
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

    {#if !$hasSearchResults && !$isEmpty && !$isSearching && !isTransforming}
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
