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
    import TerritoryInputFilter from "./TerritoryInputFilter.svelte";
    import { t, setLocale } from "../../i18n/store";
    import { searchStore, searchFilters } from "../../stores/searchStore";
    import FilterIcon from "../../svgs/FilterIcon.svelte";

    import type { Territory } from "../../openapi/client";

    interface Props {
        locale?: string;
        initialFilters?: {
            query?: string;
            statusFilter?: string;
            categories?: string[];
            territory?: {
                country?: string | null;
                subLvl1?: string | null;
                subLvl2?: string | null;
                rawQuery?: string;
            };
        };
    }

    let { locale = "es", initialFilters }: Props = $props();

    // Filter visibility (collapsed by default on all devices)
    let filtersOpen = $state(false);

    // Initialize locale and filters when component mounts
    onMount(() => {
        setLocale(locale);

        // Initialize with server-provided filters if available
        if (initialFilters) {
            searchStore.initializeFilters({
                query: initialFilters.query || "",
                statusFilter: initialFilters.statusFilter || "",
                categories: initialFilters.categories || [],
                territory: {
                    country: initialFilters.territory?.country || null,
                    subLvl1: initialFilters.territory?.subLvl1 || null,
                    subLvl2: initialFilters.territory?.subLvl2 || null,
                },
            });
        }
    });

    // Dropdown options - use translation keys for labels
    const statusOptions = [
        { value: "all", translationKey: "filters.status.all" },
        { value: "in_campaign", translationKey: "filters.status.funding" },
        { value: "in_funding", translationKey: "filters.status.successful" },
        { value: "funded", translationKey: "filters.status.completed" },
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

    // Handler for the structured territory data from TerritoryInputFilter
    function handleTerritoryChange(territory: Territory | null) {
        if (territory) {
            updateFilters({ territory });
            searchStore.searchWithApi();
        } else {
            updateFilters({ territory: null });
            searchStore.searchWithApi();
        }
    }
</script>

<div
    class="border-grey mx-auto flex w-full flex-col gap-6 rounded-3xl border bg-white px-4 py-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] min-[500px]:mx-0 min-[500px]:w-auto lg:gap-10 lg:rounded-4xl lg:px-8 lg:py-6"
    data-testid="search-filters"
>
    <div
        class="flex flex-col gap-3 min-[500px]:flex-row min-[500px]:items-center min-[500px]:gap-4 lg:gap-16"
    >
        <div class="flex flex-1 flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
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

            <SearchButton
                variant="secondary"
                onclick={handleSearch}
                data-testid="search-btn"
                class="w-full shrink-0 sm:w-auto"
            >
                {$t("search.searchButton")}
            </SearchButton>
        </div>

        <SearchButton
            variant="ghost"
            onclick={toggleFilters}
            data-testid="toggle-filters"
            aria-expanded={filtersOpen}
            class="hover:bg-grey w-full justify-center rounded-xl border border-[#e5e5e0] bg-transparent px-4 py-2 transition-colors min-[500px]:w-auto"
        >
            <FilterIcon width="16" height="16" class="mr-2 text-gray-600" />
            {filtersOpen ? $t("search.closeFilters") : $t("search.showFilters")}
        </SearchButton>
    </div>

    {#if filtersOpen}
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div class="w-full">
                <FilterDropdown
                    options={statusOptions}
                    placeholder={$t("filters.campaignStatus")}
                    selectedValue={$searchFilters.statusFilter}
                    onSelect={(value) => updateFilters({ statusFilter: value })}
                    data-testid="status-filter"
                />
            </div>

            <div class="w-full">
                <TerritoryInputFilter
                    label=""
                    placeholder={$t("filters.location")}
                    onTerritoryDetected={(data) => {
                        if (data.territory) {
                            handleTerritoryChange(data.territory);
                        } else {
                            updateFilters({ territory: null });
                        }
                    }}
                />
            </div>
        </div>

        <div class="w-full">
            <CategoryFilter
                selectedCategories={$searchFilters.categories}
                onCategoryChange={(categories) => updateFilters({ categories })}
                data-testid="category-filter"
            />
        </div>

        <div
            class="flex flex-col items-stretch gap-3 min-[500px]:flex-row min-[500px]:items-center min-[500px]:justify-end"
        >
            <SearchButton
                variant="primary"
                onclick={handleApplyFilters}
                data-testid="apply-filters-btn"
                class="w-full min-[500px]:w-auto"
            >
                {$t("search.applyFilters")}
            </SearchButton>
        </div>
    {/if}
</div>
