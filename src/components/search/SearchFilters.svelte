<!--
Search Filters Container Component
Main container that composes all filter subcomponents
Implements responsive layout matching Figma design with collapsible mobile behavior
Integrated with searchStore for state management and URL synchronization
-->
<script lang="ts">
    import { onMount } from "svelte";

    import CategoryFilter from "./CategoryFilter.svelte";
    import FilterDropdown from "./FilterDropdown.svelte";
    import SearchButton from "./SearchButton.svelte";
    import SearchInput from "./SearchInput.svelte";
    import TerritoryFilter from "./TerritoryFilter.svelte";
    import { t } from "../../i18n/store";
    import { searchStore, searchFilters, type SearchFilters } from "../../stores/searchStore";
    import FilterIcon from "../icons/filters/FilterIcon.svelte";

    interface Props {
        initialFilters?: SearchFilters;
    }

    let { initialFilters }: Props = $props();

    // Filter visibility (collapsed by default on all devices)
    let filtersOpen = $state(true);

    // Initialize locale and filters when component mounts
    onMount(() => {
        // Initialize with server-provided filters if available (without triggering search)
        if (initialFilters) {
            searchStore.initializeFilters(initialFilters);
        }
    });

    // Dropdown options - use translation keys for labels
    const statusOptions = [
        { value: "all", translationKey: "domain.project.status.all" },
        // API status values - pass directly to backend
        { value: "in_campaign", translationKey: "domain.project.status.funding" }, // Actively raising funds
        { value: "in_funding", translationKey: "domain.project.status.successful" }, // Successfully raised, receiving funds
        { value: "funded", translationKey: "domain.project.status.completed" }, // Completed funding process
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

    function toggleFilters() {
        filtersOpen = !filtersOpen;
    }
</script>

<div
    class="border-grey mx-auto flex w-80 flex-col gap-4 rounded-3xl border bg-white px-4 py-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] min-[500px]:mx-auto min-[500px]:w-auto min-[500px]:max-w-6xl lg:gap-6 lg:rounded-4xl lg:px-6 lg:py-5"
    data-testid="search-filters"
>
    <div
        class="flex flex-col gap-3 min-[500px]:flex-row min-[500px]:items-center min-[500px]:gap-6"
    >
        <!-- Search section with input and button -->
        <div class="flex flex-1 flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
            <!-- Search input -->
            <div class="min-w-0 flex-1">
                <SearchInput
                    value={$searchFilters.title}
                    onSearch={(title) => updateFilters({ title })}
                    onEnter={handleSearch}
                    onClear={handleSearch}
                    placeholder={$t("domain.search.bar.placeholder")}
                    data-testid="search-input"
                />
            </div>

            <!-- Search button -->
            <SearchButton
                variant="secondary"
                onclick={handleSearch}
                data-testid="search-btn"
                class="w-full shrink-0 sm:w-auto"
            >
                {$t("pages.search.input.button")}
            </SearchButton>
        </div>

        <!-- Filter toggle button - full width on mobile, auto on desktop -->
        <SearchButton
            variant="ghost"
            onclick={toggleFilters}
            data-testid="toggle-filters"
            aria-expanded={filtersOpen}
            class="w-full justify-center min-[500px]:w-auto"
        >
            <FilterIcon width="16" height="16" class="mr-2" />
            {filtersOpen ? $t("pages.search.filters.close") : $t("pages.search.filters.show")}
        </SearchButton>
    </div>

    <!-- Expanded filters section (collapsed by default) -->
    {#if filtersOpen}
        <!-- Status filter dropdown -->
        <div class="flex flex-col gap-6 lg:flex-row">
            <FilterDropdown
                options={statusOptions}
                placeholder={$t("pages.search.filters.status.label")}
                selectedValue={$searchFilters.status}
                onSelect={(value) => updateFilters({ status: value })}
                data-testid="status-filter"
            />
            <TerritoryFilter />
        </div>

        <!-- Category filters -->
        <div class="w-full">
            <CategoryFilter
                selectedCategories={$searchFilters["categories[]"] || []}
                onCategoryChange={(categories) => updateFilters({ "categories[]": categories })}
                data-testid="category-filter"
            />
        </div>

        <!-- Action buttons -->
        <div
            class="flex flex-col items-stretch gap-3 min-[500px]:flex-row min-[500px]:items-center min-[500px]:justify-end"
        >
            <!-- Apply filters button -->
            <SearchButton
                variant="primary"
                onclick={handleApplyFilters}
                data-testid="apply-filters-btn"
                class="w-full min-[500px]:w-auto"
            >
                {$t("pages.search.filters.apply")}
            </SearchButton>
        </div>
    {/if}
</div>
