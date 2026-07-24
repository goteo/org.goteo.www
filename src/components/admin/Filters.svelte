<script lang="ts">
    import { t } from "../../i18n/store";
    import FilterComposer from "../library/filters/FilterComposer.svelte";
    import FiltersIcon from "../icons/filters/Filters.svelte";
    import Bullet from "../icons/Bullet.svelte";
    import Button from "../library/buttons/Button.svelte";
    import Search from "../library/inputs/Search.svelte";
    import AdminSearch from "./Search.svelte";

    import type { FilterResource } from "../../utils/filterComposer";

    let {
        resource,
        filters,
        onApplyFilters,
        searchPlaceholder,
        onSearch,
        onSelectTarget,
    } = $props<{
        resource: FilterResource;
        filters: any;
        onApplyFilters: (filters: any) => void;
        searchPlaceholder?: string;
        onSearch?: (value: string) => void;
        onSelectTarget?: (accounting: string) => void;
    }>();

    let showFilterComposer = $state(false);
    let composerParams = $state<Record<string, string | string[]>>({});
    let previousComposerKeys = $state<string[]>([]);
    let previousComposerParams = $state("");

    function handleComposerParamsChange(params: Record<string, string | string[]>) {
        composerParams = params;
    }

    function applyComposerFilters() {
        const result = { ...filters };
        const allComposerKeys = new Set([
            ...previousComposerKeys,
            ...Object.keys(composerParams),
        ]);

        for (const key of allComposerKeys) {
            result[key] = undefined;
        }
        for (const [key, value] of Object.entries(composerParams)) {
            result[key] = value;
        }

        previousComposerKeys = Object.keys(composerParams);

        onApplyFilters(result);
    }

    function hasActiveFilters() {
        if (!filters) return false;
        const keys = Object.keys(filters);
        return keys.some((k) => filters[k] !== undefined && filters[k] !== "");
    }

    let autoApplyTimeout: ReturnType<typeof setTimeout>;

    function scheduleApply() {
        clearTimeout(autoApplyTimeout);
        autoApplyTimeout = setTimeout(applyComposerFilters, 400);
    }

    $effect(() => {
        const serialized = JSON.stringify(composerParams);
        if (previousComposerParams && serialized !== previousComposerParams) {
            scheduleApply();
        }
        previousComposerParams = serialized;
    });
</script>

<div
    class="border-variant1 relative flex flex-col gap-6 rounded-[40px] border p-8 shadow-[0px_1px_3px_0px_#0000001A]"
>
    <div class="flex items-center gap-4">
        {#if onSelectTarget}
            <AdminSearch {onSelectTarget} />
        {:else if searchPlaceholder && onSearch}
            <Search
                placeholder={searchPlaceholder}
                onsubmit={onSearch}
                class="flex-1"
            />
        {/if}

        <Button
            type="button"
            kind="ghost"
            onclick={() => (showFilterComposer = !showFilterComposer)}
            class="shrink-0 text-nowrap"
        >
            <span class="relative">
                <FiltersIcon />
                {#if hasActiveFilters()}
                    <span class="absolute -top-1 -right-1">
                        <Bullet />
                    </span>
                {/if}
            </span>
            {#if showFilterComposer}
                {$t("pages.admin.filter.btns.closeFilters")}
            {:else}
                {$t("pages.admin.filter.btns.openFilters")}
            {/if}
        </Button>
    </div>

    {#if showFilterComposer}
        <div class="flex flex-col gap-4">
            <FilterComposer
                {resource}
                onParamsChange={handleComposerParamsChange}
            />

            <div class="flex justify-end">
                <Button type="button" kind="primary" onclick={applyComposerFilters}>
                    {$t("pages.admin.filter.btns.apply")}
                </Button>
            </div>
        </div>
    {/if}
</div>
