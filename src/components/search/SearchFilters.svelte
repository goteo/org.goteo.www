<!--
Search Filters Container Component
Main container that composes all filter subcomponents
Implements responsive layout matching Figma design with collapsible mobile behavior
Integrated with searchStore for state management and URL synchronization
-->
<script lang="ts">
    import { onMount } from "svelte";
    import { t, setLocale } from "../../i18n/store";
    import { searchStore, searchFilters, hasActiveFilters } from "../../stores/searchStore";
    import SearchInput from "./SearchInput.svelte";
    import FilterDropdown from "./FilterDropdown.svelte";
    import CategoryFilter from "./CategoryFilter.svelte";
    import SearchButton from "./SearchButton.svelte";
    import FilterIcon from "../../svgs/FilterIcon.svelte";

    interface Props {
        locale?: string;
        initialFilters?: {
            query?: string;
            statusFilter?: string;
            categories?: string[];
        };
    }

    let { locale = "es", initialFilters }: Props = $props();

    // Filter visibility (collapsed by default on all devices)
    let filtersOpen = $state(false);

    // Initialize locale and filters when component mounts
    onMount(() => {
        setLocale(locale);

        // Initialize with server-provided filters if available (without triggering search)
        if (initialFilters) {
            searchStore.initializeFilters({
                query: initialFilters.query || "",
                statusFilter: initialFilters.statusFilter || "",
                categories: initialFilters.categories || [],
            });
        }
    });

    // Dropdown options - use translation keys for labels
    const statusOptions = [
        { value: "all", translationKey: "filters.status.all" },
        // API status values - pass directly to backend
        { value: "in_campaign", translationKey: "filters.status.funding" }, // Actively raising funds
        { value: "in_funding", translationKey: "filters.status.successful" }, // Successfully raised, receiving funds
        { value: "funded", translationKey: "filters.status.completed" }, // Completed funding process
    ];

    // Handle filter updates using searchStore
    function updateFilters(newFilters: Partial<typeof $searchFilters>) {
        searchStore.updateFilters(newFilters);
    }

    function handleSearch() {
        searchStore.searchWithApi();
    }

    function handleApplyFilters() {
        searchStore.searchWithApi();
        filtersOpen = false;
    }

    function handleClearFilters() {
        searchStore.clearFilters();
        searchStore.clearResults();
        // Trigger search to get default results
        searchStore.searchWithApi(true);
    }

    function toggleFilters() {
        filtersOpen = !filtersOpen;
    }
</script>

<!-- Main search filters container - Figma design layout -->
<div
    class="flex flex-col gap-10 rounded-[32px] border border-[#f3f3ef] bg-[#fbfbfb] px-8 py-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]"
    data-testid="search-filters"
>
    <div class="flex items-center gap-16">
        <!-- Search section with input and button -->
        <div class="flex flex-1 items-center gap-4">
            <!-- Search input -->
            <div class="flex-1">
                <SearchInput
                    value={$searchFilters.query}
                    onSearch={(query) => updateFilters({ query })}
                    onEnter={handleSearch}
                    onClear={handleSearch}
                    placeholder={$t("search.placeholder")}
                    data-testid="search-input"
                />
            </div>

            <!-- Search button -->
            <SearchButton variant="secondary" onclick={handleSearch} data-testid="search-btn">
                {$t("search.searchButton")}
            </SearchButton>
        </div>

        <!-- Filter toggle button -->
        <SearchButton
            variant="ghost"
            onclick={toggleFilters}
            data-testid="toggle-filters"
            aria-expanded={filtersOpen}
        >
            <FilterIcon width="16" height="16" class="mr-2" />
            {$t("search.showFilters")}
        </SearchButton>
    </div>

    <!-- Expanded filters section (collapsed by default) -->
    {#if filtersOpen}
        <!-- Status filter dropdown -->
        <div class="max-w-sm">
            <FilterDropdown
                options={statusOptions}
                placeholder={$t("filters.campaignStatus")}
                selectedValue={$searchFilters.statusFilter}
                onSelect={(value) => updateFilters({ statusFilter: value })}
                data-testid="status-filter"
            />
        </div>

        <!-- Category filters -->
        <div class="">
            <CategoryFilter
                selectedCategories={$searchFilters.categories}
                onCategoryChange={(categories) => updateFilters({ categories })}
                data-testid="category-filter"
            />
        </div>

        <!-- Apply filters and clear buttons -->
        <div class="flex items-center justify-between">
            <!-- Clear filters button (only show if filters are active) -->
            {#if $hasActiveFilters}
                <SearchButton
                    variant="ghost"
                    onclick={handleClearFilters}
                    data-testid="clear-filters-btn"
                >
                    {$t("search.clearFilters")}
                </SearchButton>
            {:else}
                <div></div>
            {/if}

            <SearchButton
                variant="primary"
                onclick={handleApplyFilters}
                data-testid="apply-filters-btn"
            >
                {$t("search.applyFilters")}
            </SearchButton>
        </div>
    {/if}
</div>
