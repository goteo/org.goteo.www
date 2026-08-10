<!--
Search Filters Container Component
Main container that composes all filter subcomponents
Implements responsive layout matching Figma design with collapsible mobile behavior
Integrated with searchStore for state management and URL synchronization
-->
<script lang="ts">
    import { onMount } from "svelte";

    import CategoryFilter from "./CategoryFilter.svelte";
    import SearchButton from "./SearchButton.svelte";
    import SearchInput from "./SearchInput.svelte";
    import StatusFilter from "./StatusFilter.svelte";
    import TerritoryFilter from "./TerritoryFilter.svelte";
    import { t } from "../../i18n/store";
    import { searchStore, searchFilters, type SearchFilters } from "../../stores/searchStore";
    import FilterIcon from "../icons/filters/FilterIcon.svelte";
    import Button from "../library/buttons/Button.svelte";

    interface Props {
        initialFilters?: SearchFilters;
    }

    let { initialFilters }: Props = $props();

    // Filter visibility (collapsed by default on all devices)
    let filtersOpen = $state(false);

    // Initialize locale and filters when component mounts
    onMount(() => {
        // Initialize with server-provided filters if available (without triggering search)
        if (initialFilters) {
            searchStore.initializeFilters(initialFilters);
        }
    });

    // Debounce auto-applied searches so typing in the search input
    // doesn't fire one API request per keystroke
    let autoSearchTimeout: ReturnType<typeof setTimeout>;

    // Handle filter updates using searchStore and auto-apply the search
    function updateFilters(newFilters: Partial<typeof $searchFilters>) {
        searchStore.updateFilters(newFilters);
        clearTimeout(autoSearchTimeout);
        autoSearchTimeout = setTimeout(() => searchStore.searchWithApi(), 400);
    }

    function handleSearch() {
        clearTimeout(autoSearchTimeout);
        searchStore.searchWithApi();
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
        <Button
            kind="ghost"
            onclick={toggleFilters}
            class="w-full justify-center min-[500px]:w-auto"
        >
            <FilterIcon width="16" height="16" class="mr-2" />
            {filtersOpen ? $t("pages.search.filters.close") : $t("pages.search.filters.show")}
        </Button>
    </div>

    <!-- Expanded filters section (collapsed by default).-->
    {#if filtersOpen}
        <div class="flex flex-col gap-4 lg:gap-6">
            <!-- Status + territory filters -->
            <div class="flex flex-col items-start gap-6 lg:flex-row">
                <div class="w-full">
                    <h3 class="font-body mb-2 text-base font-bold text-black">
                        {$t("pages.search.filters.status.label")}
                    </h3>
                    <StatusFilter
                        statuses={$searchFilters["status[]"] || []}
                        onStatusesChange={(statuses) => updateFilters({ "status[]": statuses })}
                    />
                </div>
                <div class="w-full">
                    <h3 class="font-body mb-2 text-base font-bold text-black">
                        {$t("pages.search.filters.territoryLabel")}
                    </h3>
                    <TerritoryFilter
                        selectedTerritory={{
                            countries: $searchFilters["territory.country[]"] || [],
                            subLvl1: $searchFilters["territory.subLvl1[]"] || [],
                            subLvl2: $searchFilters["territory.subLvl2[]"] || [],
                        }}
                        onTerritoryChange={(territories) =>
                            updateFilters({
                                "territory.country[]": territories.countries,
                                "territory.subLvl1[]": territories.subLvl1,
                                "territory.subLvl2[]": territories.subLvl2,
                            })}
                    />
                </div>
            </div>

            <!-- Category filters -->
            <div class="w-full">
                <CategoryFilter
                    selectedCategories={$searchFilters["categories[]"] || []}
                    onCategoryChange={(categories) => updateFilters({ "categories[]": categories })}
                />
            </div>
        </div>
    {/if}
</div>
