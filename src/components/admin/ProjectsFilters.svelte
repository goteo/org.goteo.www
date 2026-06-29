<script lang="ts">
    import { t } from "../../i18n/store";
    import FiltersIcon from "../icons/Filters.svelte";
    import Button from "../library/Button.svelte";
    import Search from "../library/Search.svelte";

    let showFilters = $state(false);
    let searchValue = $state("");
    let searchError = $derived(searchValue.length > 0 && searchValue.length < 4);
</script>

<div
    class="border-variant1 relative flex flex-col gap-10 rounded-[40px] border px-8 pt-6 pb-8 shadow-[0px_1px_3px_0px_#0000001A]"
>
    <div class="flex items-center gap-4">
        <div class="flex w-full flex-col gap-1">
            <Search
                bind:value={searchValue}
                placeholder={$t("admin.projects.filters.search.placeholder")}
                onclear={() => (searchValue = "")}
                class="bg-white {searchError ? 'border-tertiary' : ''}"
            />
            {#if searchError}
                <p class="text-tertiary pl-4 text-sm">
                    {$t("admin.projects.filters.search.minLength")}
                </p>
            {/if}
        </div>

        <Button kind="secondary" size="md" class="shrink-0">
            {$t("admin.projects.filters.search.btn")}
        </Button>

        <Button
            kind="ghost"
            size="md"
            onclick={() => (showFilters = !showFilters)}
            class="shrink-0 text-nowrap"
        >
            <FiltersIcon />
            {#if showFilters}
                {$t("admin.projects.filters.btns.closeFilters")}
            {:else}
                {$t("admin.projects.filters.btns.openFilters")}
            {/if}
        </Button>
    </div>

    {#if showFilters}
        <form class="flex flex-col gap-6">
            <div class="grid grid-cols-4 gap-4">
                <div class="relative">
                    <label
                        for="campaignStatus"
                        class="text-content absolute top-0.5 left-4 text-xs"
                    >
                        {$t("admin.projects.filters.campaignStatus.title")}
                    </label>
                    <select
                        id="campaignStatus"
                        class="border-secondary w-full rounded-lg border p-4 pt-6"
                    >
                        <option value=""></option>
                        {#each Object.entries($t("admin.projects.filters.campaignStatus.options")) as [value, label]}
                            <option {value}>{label}</option>
                        {/each}
                    </select>
                </div>

                <div class="relative">
                    <label for="projectStatus" class="text-content absolute top-0.5 left-4 text-xs">
                        {$t("admin.projects.filters.status.title")}
                    </label>
                    <select
                        id="projectStatus"
                        class="border-secondary w-full rounded-lg border p-4 pt-6"
                    >
                        <option value=""></option>
                        {#each Object.entries($t("admin.projects.filters.status.options")) as [value, label]}
                            <option {value}>{label}</option>
                        {/each}
                    </select>
                </div>

                <div class="relative">
                    <label for="dateFrom" class="text-content absolute top-0.5 left-4 text-xs">
                        {$t("admin.projects.filters.dateRange.initDate")}
                    </label>
                    <input
                        id="dateFrom"
                        type="date"
                        onclick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                        class="border-secondary w-full rounded-lg border p-4 pt-6"
                    />
                </div>

                <div class="relative">
                    <label for="dateTo" class="text-content absolute top-0.5 left-4 text-xs">
                        {$t("admin.projects.filters.dateRange.endDate")}
                    </label>
                    <input
                        id="dateTo"
                        type="date"
                        onclick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                        class="border-secondary w-full rounded-lg border p-4 pt-6"
                    />
                </div>
            </div>

            <div class="flex justify-end">
                <Button kind="primary" type="submit">
                    {$t("admin.projects.filters.btns.apply")}
                </Button>
            </div>
        </form>
    {/if}
</div>
