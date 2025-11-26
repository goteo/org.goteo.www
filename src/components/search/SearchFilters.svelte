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
    import Dropdown from "../library/Dropdown.svelte";

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
        { value: "all", text: $t("filters.status.all") },
        { value: "in_campaign", text: $t("filters.status.funding") },
        { value: "in_funding", text: $t("filters.status.successful") },
        { value: "funded", text: $t("filters.status.completed") },
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
    class="mx-auto flex w-80 flex-col gap-6 rounded-[24px] border border-[#f3f3ef] bg-[#fbfbfb] px-4 py-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] min-[500px]:mx-0 min-[500px]:w-auto lg:gap-10 lg:rounded-[32px] lg:px-8 lg:py-6"
    data-testid="search-filters"
>
    <div
        class="flex flex-col gap-3 min-[500px]:flex-row min-[500px]:items-center min-[500px]:gap-16"
    >
        <!-- Search section with input and button -->
        <div class="flex flex-1 flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
            <!-- Search input -->
            <div class="min-w-0 flex-1">
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
            <SearchButton
                variant="secondary"
                onclick={handleSearch}
                data-testid="search-btn"
                class="w-full shrink-0 sm:w-auto"
            >
                {$t("search.searchButton")}
            </SearchButton>
        </div>

        <!-- Filter toggle button - full width on mobile, auto on desktop -->
        {#if !filtersOpen}
            <SearchButton
                variant="ghost"
                onclick={toggleFilters}
                data-testid="toggle-filters"
                aria-expanded={filtersOpen}
                class="w-full justify-center min-[500px]:w-auto"
            >
                <FilterIcon width="16" height="16" class="mr-2" />
                {$t("search.showFilters")}
            </SearchButton>
        {/if}
    </div>

    <!-- Expanded filters section (collapsed by default) -->
    {#if filtersOpen}
        <!-- Status filter dropdown -->
        <div class="w-full lg:max-w-sm">
            <Dropdown options={statusOptions} />
        </div>

        <!-- Category filters -->
        <div class="w-full">
            <CategoryFilter
                selectedCategories={$searchFilters.categories}
                onCategoryChange={(categories) => updateFilters({ categories })}
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
                {$t("search.applyFilters")}
            </SearchButton>

            <!-- Close filters button -->
            <SearchButton
                variant="ghost"
                onclick={toggleFilters}
                data-testid="close-filters-btn"
                class="w-full min-[500px]:w-auto"
            >
                <FilterIcon width="16" height="16" class="mr-2" />
                {$t("search.closeFilters")}
            </SearchButton>
        </div>
    {/if}
</div>
