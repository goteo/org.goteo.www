<!--
Client-Side Search Results Component
Manages real-time filtering of campaigns without page reloads
-->
<script lang="ts">
    import { onMount } from "svelte";

    import LoadingSpinner from "./LoadingSpinner.svelte";
    import LoadMoreButton from "./LoadMoreButton.svelte";
    import SearchErrorAlert from "./SearchErrorAlert.svelte";
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
    import CampaignCard from "../home/CampaignCard.svelte";
    import SearchIcon from "../icons/actions/Search.svelte";
    import Button from "../library/buttons/Button.svelte";
    import Grid from "../library/layout/Grid.svelte";

    import type { Project } from "../../openapi/client/types.gen";
    import type { Campaign } from "../../types/campaign";

    interface Props {
        initialProjects: Project[];
        ariaLiveRegion?: "polite" | "assertive" | "off";
        initialFilters?: {
            title?: string;
            status?: string;
            "categories[]"?: string[];
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

        searchStore.updateUrl();
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
                title: initialFilters.title || "",
                status: initialFilters.status || "",
                "categories[]": initialFilters["categories[]"] || [],
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
            const announcement = $t("pages.search.accessibility.resultsFound", {
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
            <Grid class="auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {#each campaigns as campaign}
                    <!-- Render campaign cards using the Svelte CampaignCard component -->
                    <div class="campaign-card-wrapper" data-campaign-id={campaign.id}>
                        <CampaignCard size={campaign.size!} {campaign} />
                    </div>
                {/each}
            </Grid>
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
        <div class="flex flex-col items-center py-12 text-center" data-testid="search-empty">
            <SearchIcon class="mb-4 h-16 w-16 text-gray-400" />
            <h3 class="mb-2 text-xl font-semibold text-gray-900">
                {$t("pages.search.empty.title")}
            </h3>
            <p class="mb-6 text-gray-600">
                {$t("pages.search.empty.description")}
            </p>
            <Button onclick={clearAllFilters}>
                {$t("pages.search.empty.clearFilters")}
            </Button>
        </div>
    {/if}

    {#if !$hasSearchResults && !$isEmpty && !$isSearching && !isTransforming}
        <!-- Initial State - No data available -->
        <div class="py-12 text-center">
            <h3 class="mb-2 text-xl font-semibold text-gray-900">
                {$t("pages.search.initial.title")}
            </h3>
            <p class="text-gray-600">{$t("pages.search.initial.description")}</p>
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
