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

    interface CustomTerritory extends Territory {
        rawQuery?: string;
    }

    interface Props {
        locale?: string;
        initialFilters?: {
            query?: string;
            statusFilter?: string;
            categories?: string[];
            territory?: CustomTerritory;
        };
    }

    let { locale, initialFilters }: Props = $props();
    let filtersOpen = $state(false);

    onMount(() => {
        if (locale) setLocale(locale);

        if (initialFilters) {
            searchStore.updateFilters({
                query: initialFilters.query || "",
                statusFilter: initialFilters.statusFilter || "",
                categories: initialFilters.categories || [],
                territory: initialFilters.territory || null,
            });
        }
    });

    // Translation keys
    const statusOptions = [
        { value: "all", translationKey: "domain.search.filters.status.all" },
        { value: "in_campaign", translationKey: "domain.search.filters.status.funding" },
        { value: "in_funding", translationKey: "domain.search.filters.status.successful" },
        { value: "funded", translationKey: "domain.search.filters.status.completed" },
    ];

    function toggleFilters() {
        filtersOpen = !filtersOpen;
    }

    function handleSearch() {
        searchStore.searchWithApi();
    }

    function updateFilters(updates: any) {
        searchStore.updateFilters(updates);
    }

    function handleTerritoryChange(territory: Territory | null) {
        updateFilters({ territory });
        handleSearch();
    }
</script>

<div
    class="border-grey mx-auto flex w-full flex-col gap-6 rounded-3xl border bg-white px-4 py-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] lg:gap-10 lg:rounded-4xl lg:px-8 lg:py-6"
    data-testid="search-filters"
>
    <!-- filter button -->
    <div
        class="flex flex-col gap-3 min-[500px]:flex-row min-[500px]:items-center min-[500px]:gap-4 lg:gap-16"
    >
        <div class="flex flex-1 flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div class="min-w-0 flex-1">
                <SearchInput
                    value={$searchFilters.query}
                    oninput={(e: any) => updateFilters({ query: e.target.value })}
                />
            </div>
            <SearchButton variant="secondary" onclick={handleSearch}
                >{$t("search.button")}</SearchButton
            >
        </div>

        <SearchButton
            variant="ghost"
            onclick={toggleFilters}
            data-testid="toggle-filters"
            aria-expanded={filtersOpen}
            class="w-full justify-center min-[500px]:w-auto"
        >
            <FilterIcon width="16" height="16" class="mr-2" />
            {filtersOpen ? $t("search.closeFilters") : $t("search.showFilters")}
        </SearchButton>
    </div>

    <!-- filters section -->
    {#if filtersOpen}
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div class="w-full">
                <FilterDropdown
                    options={statusOptions}
                    placeholder={$t("filters.campaignStatus")}
                    selectedValue={$searchFilters.statusFilter}
                    onSelect={(value) => updateFilters({ statusFilter: value })}
                />
            </div>
            <div class="w-full">
                <TerritoryInputFilter
                    label=""
                    placeholder={$t("filters.location")}
                    onTerritoryDetected={(data) => handleTerritoryChange(data.territory || null)}
                />
            </div>
        </div>
        <div class="w-full">
            <CategoryFilter
                selectedCategories={$searchFilters.categories}
                onCategoryChange={(categories) => updateFilters({ categories })}
            />
        </div>
        <!-- Footer -->
        <div
            class="flex flex-col items-stretch gap-3 min-[500px]:flex-row min-[500px]:items-center min-[500px]:justify-end"
        >
            <SearchButton variant="primary" onclick={handleSearch}
                >{$t("search.applyFilters")}</SearchButton
            >
            <SearchButton variant="ghost" onclick={toggleFilters} class="w-full min-[500px]:w-auto">
                {$t("search.closeFilters")}
            </SearchButton>
        </div>
    {/if}
</div>
