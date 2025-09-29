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
            timeFilter?: string;
            statusFilter?: string;
            locationFilter?: string;
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
                timeFilter: initialFilters.timeFilter || "",
                statusFilter: initialFilters.statusFilter || "",
                locationFilter: initialFilters.locationFilter || "",
                categories: initialFilters.categories || [],
            });
        }
    });

    // Dropdown options
    const timeOptions = [
        { value: "all", label: "Cualquier momento", translationKey: "filters.time.all" },
        { value: "week", label: "Última semana", translationKey: "filters.time.week" },
        { value: "month", label: "Último mes", translationKey: "filters.time.month" },
        { value: "year", label: "Último año", translationKey: "filters.time.year" },
    ];

    const statusOptions = [
        { value: "all", label: "Todos los estados", translationKey: "filters.status.all" },
        { value: "funding", label: "En financiación", translationKey: "filters.status.funding" },
        { value: "successful", label: "Exitosas", translationKey: "filters.status.successful" },
        { value: "completed", label: "Completadas", translationKey: "filters.status.completed" },
    ];

    const locationOptions = [
        {
            value: "all",
            label: "Cualquier ubicación",
            translationKey: "filters.locationOptions.all",
        },
        { value: "spain", label: "España", translationKey: "filters.locationOptions.spain" },
        { value: "europe", label: "Europa", translationKey: "filters.locationOptions.europe" },
        { value: "global", label: "Global", translationKey: "filters.locationOptions.global" },
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
        <!-- Dropdown filters -->
        <div class=" grid grid-cols-1 gap-4 md:grid-cols-3">
            <FilterDropdown
                options={timeOptions}
                placeholder={$t("filters.timePeriod")}
                selectedValue={$searchFilters.timeFilter}
                onSelect={(value) => updateFilters({ timeFilter: value })}
                data-testid="time-filter"
            />

            <FilterDropdown
                options={statusOptions}
                placeholder={$t("filters.campaignStatus")}
                selectedValue={$searchFilters.statusFilter}
                onSelect={(value) => updateFilters({ statusFilter: value })}
                data-testid="status-filter"
            />

            <FilterDropdown
                options={locationOptions}
                placeholder={$t("filters.location")}
                selectedValue={$searchFilters.locationFilter}
                onSelect={(value) => updateFilters({ locationFilter: value })}
                data-testid="location-filter"
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
