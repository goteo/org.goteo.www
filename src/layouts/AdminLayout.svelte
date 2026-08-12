<script lang="ts">
    import type { Snippet } from "svelte";

    import ExportCsv from "../components/admin/ExportCsv.svelte";
    import Filters from "../components/admin/Filters.svelte";
    import FiltersTags from "../components/admin/FiltersTags.svelte";
    import Slider from "../components/admin/Slider.svelte";

    import type { FilterResource } from "../utils/filterComposer";

    interface FiltersConfig {
        resource: FilterResource;
        filters: any;
        onApplyFilters: (filters: any) => Promise<void> | void;
        searchPlaceholder?: string;
        onSelectTarget?: (accounting: string) => void;
        onSelectProject?: (project: any) => void;
        onSelectUser?: (user: any) => void;
    }

    interface FilterTagsConfig {
        title: string;
        filters: any;
        onCloseFilter: (filters: any) => void;
        resource: FilterResource;
        accountingsMap?: Map<string, any>;
        ownersMap?: Map<string, any>;
    }

    interface CsvConfig {
        endpoint: string;
        filenamePrefix: string;
        queryParams: any;
        totalItems: number;
    }

    interface SliderConfig {
        slides: { title: string; amount: number | string }[];
        isLoading: boolean;
    }

    let {
        title,
        description,
        filters,
        filterTags,
        csv,
        slider,
        children,
    }: {
        title: string;
        description?: string;
        filters: FiltersConfig;
        filterTags: FilterTagsConfig;
        csv: CsvConfig;
        slider: SliderConfig;
        children?: Snippet;
    } = $props();
</script>

<div class="wrapper">
    <div class="flex w-full flex-col gap-10 py-10">
        <header class="flex flex-col gap-4">
            <h2 class="text-[2.5rem]/12 font-bold tracking-[0%] text-black">
                {title}
            </h2>
            {#if description}
                <p class="text-content">{description}</p>
            {/if}
        </header>

        <Filters
            resource={filters.resource}
            filters={filters.filters}
            onApplyFilters={filters.onApplyFilters}
            searchPlaceholder={filters.searchPlaceholder}
            onSelectTarget={filters.onSelectTarget}
            onSelectProject={filters.onSelectProject}
            onSelectUser={filters.onSelectUser}
        />

        <div class="flex flex-col">
            <div class="mb-8 flex flex-wrap justify-between gap-4">
                <FiltersTags
                    title={filterTags.title}
                    filters={filterTags.filters}
                    onCloseFilter={filterTags.onCloseFilter}
                    resource={filterTags.resource}
                    accountingsMap={filterTags.accountingsMap}
                    ownersMap={filterTags.ownersMap}
                />
                <ExportCsv
                    endpoint={csv.endpoint}
                    queryParams={csv.queryParams}
                    filenamePrefix={csv.filenamePrefix}
                    totalItems={csv.totalItems}
                />
            </div>
            <Slider slides={slider.slides} isLoading={slider.isLoading} />
        </div>

        {@render children?.()}
    </div>
</div>
