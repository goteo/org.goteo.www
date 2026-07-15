<script lang="ts">
    import { t } from "../../i18n/store";
    import FiltersIcon from "../icons/filters/Filters.svelte";
    import Button from "../library/buttons/Button.svelte";
    import Search from "../library/inputs/Search.svelte";

    import type { ApiProjectsGetCollectionData } from "../../openapi/client/types.gen";

    type ProjectsQuery = Partial<ApiProjectsGetCollectionData["query"]>;

    let { filters, onSearch, onApplyFilters } = $props<{
        filters?: ProjectsQuery;
        onSearch?: (value: string) => void;
        onApplyFilters?: (filters: ProjectsQuery) => void;
    }>();

    let showFilters = $state(false);
    let searchValue = $state("");
    let searchError = $derived(searchValue.length > 0 && searchValue.length < 4);
    let campaignStatus = $state("");
    let projectStatus = $state("");
    let dateFrom = $state("");
    let dateTo = $state("");

    const CAMPAIGN_STATUS_MAP: Record<string, string[]> = {
        active: ["in_campaign"],
        completed: ["funding.paid"],
        failed: ["campaign.failed"],
    };

    // Debounce auto-applied changes so typing in the search input
    // doesn't fire one API request per keystroke
    let autoApplyTimeout: ReturnType<typeof setTimeout>;

    function handleSearch() {
        if (searchError) return;
        clearTimeout(autoApplyTimeout);
        onSearch?.(searchValue);
    }

    function scheduleSearch() {
        clearTimeout(autoApplyTimeout);
        autoApplyTimeout = setTimeout(() => {
            if (searchError) return;
            onSearch?.(searchValue);
        }, 400);
    }

    function normalizeStatus(value: string): string {
        return value.replace(/_/g, ".");
    }

    $effect(() => {
        searchValue = typeof filters?.title === "string" ? filters.title : "";

        const statusFilter = filters?.status;
        const statusValues: string[] = [
            ...(typeof statusFilter === "string" ? [statusFilter] : (statusFilter ?? [])),
            ...(filters?.["status[]"] ?? []),
        ];

        let nextCampaignStatus = "";
        let nextProjectStatus = "";
        for (const status of statusValues) {
            const campaignKey = Object.keys(CAMPAIGN_STATUS_MAP).find((key) =>
                CAMPAIGN_STATUS_MAP[key].includes(status),
            );
            if (campaignKey && !nextCampaignStatus) {
                nextCampaignStatus = campaignKey;
            } else {
                nextProjectStatus = status.replace(/\./g, "_");
            }
        }
        campaignStatus = nextCampaignStatus;
        projectStatus = nextProjectStatus;

        dateFrom = filters?.["dateCreated[after]"]?.slice(0, 10) ?? "";
        dateTo = filters?.["dateCreated[before]"]?.slice(0, 10) ?? "";
    });

    function buildFilters(): ProjectsQuery {
        const filters: ProjectsQuery = {};
        const statusValues: string[] = [];

        if (campaignStatus) {
            const mapped = CAMPAIGN_STATUS_MAP[campaignStatus];
            if (mapped) statusValues.push(...mapped);
        }
        if (projectStatus) {
            statusValues.push(normalizeStatus(projectStatus));
        }

        if (statusValues.length === 1) {
            filters["status"] = statusValues[0];
        } else if (statusValues.length > 1) {
            filters["status[]"] = statusValues;
        }

        if (dateFrom) filters["dateCreated[after]"] = new Date(dateFrom).toISOString();
        if (dateTo) filters["dateCreated[before]"] = new Date(dateTo).toISOString();

        return filters;
    }

    function scheduleApply() {
        clearTimeout(autoApplyTimeout);
        autoApplyTimeout = setTimeout(() => onApplyFilters?.(buildFilters()), 400);
    }

    function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        clearTimeout(autoApplyTimeout);
        onApplyFilters?.(buildFilters());
    }
</script>

<div
    class="border-variant1 relative flex flex-col gap-10 rounded-[40px] border px-8 pt-6 pb-8 shadow-[0px_1px_3px_0px_#0000001A]"
>
    <div class="flex items-center gap-4">
        <div class="flex w-full flex-col gap-1">
            <Search
                bind:value={searchValue}
                placeholder={$t("pages.admin.projects.filters.search.placeholder")}
                onclear={() => {
                    searchValue = "";
                    clearTimeout(autoApplyTimeout);
                    onSearch?.("");
                }}
                oninput={scheduleSearch}
                onsubmit={handleSearch}
                class="bg-white {searchError ? 'border-tertiary' : ''}"
            />
            {#if searchError}
                <p class="text-tertiary pl-4 text-sm">
                    {$t("pages.admin.projects.filters.search.minLength")}
                </p>
            {/if}
        </div>

        <Button kind="secondary" size="md" class="shrink-0" onclick={handleSearch}>
            {$t("pages.admin.projects.filters.search.btn")}
        </Button>

        <Button
            kind="ghost"
            size="md"
            onclick={() => (showFilters = !showFilters)}
            class="shrink-0 text-nowrap"
        >
            <FiltersIcon />
            {#if showFilters}
                {$t("pages.admin.projects.filters.btns.closeFilters")}
            {:else}
                {$t("pages.admin.projects.filters.btns.openFilters")}
            {/if}
        </Button>
    </div>

    {#if showFilters}
        <form class="flex flex-col gap-6" onsubmit={handleSubmit}>
            <div class="grid grid-cols-4 gap-4">
                <div class="relative">
                    <label
                        for="campaignStatus"
                        class="text-content absolute top-0.5 left-4 text-xs"
                    >
                        {$t("pages.admin.projects.filters.campaignStatus.title")}
                    </label>
                    <select
                        id="campaignStatus"
                        class="border-secondary w-full rounded-lg border p-4 pt-6"
                        bind:value={campaignStatus}
                        onchange={scheduleApply}
                    >
                        <option value=""></option>
                        {#each Object.entries($t("pages.admin.projects.filters.campaignStatus.options")) as [value, label]}
                            <option {value}>{label}</option>
                        {/each}
                    </select>
                </div>

                <div class="relative">
                    <label for="projectStatus" class="text-content absolute top-0.5 left-4 text-xs">
                        {$t("pages.admin.projects.filters.status.title")}
                    </label>
                    <select
                        id="projectStatus"
                        class="border-secondary w-full rounded-lg border p-4 pt-6"
                        bind:value={projectStatus}
                        onchange={scheduleApply}
                    >
                        <option value=""></option>
                        {#each Object.entries($t("pages.admin.projects.filters.status.options")) as [value, label]}
                            <option {value}>{label}</option>
                        {/each}
                    </select>
                </div>

                <div class="relative">
                    <label for="dateFrom" class="text-content absolute top-0.5 left-4 text-xs">
                        {$t("pages.admin.projects.filters.dateRange.initDate")}
                    </label>
                    <input
                        id="dateFrom"
                        type="date"
                        bind:value={dateFrom}
                        onchange={scheduleApply}
                        onclick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                        class="border-secondary w-full rounded-lg border p-4 pt-6"
                    />
                </div>

                <div class="relative">
                    <label for="dateTo" class="text-content absolute top-0.5 left-4 text-xs">
                        {$t("pages.admin.projects.filters.dateRange.endDate")}
                    </label>
                    <input
                        id="dateTo"
                        type="date"
                        bind:value={dateTo}
                        onchange={scheduleApply}
                        onclick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                        class="border-secondary w-full rounded-lg border p-4 pt-6"
                    />
                </div>
            </div>

            <div class="flex justify-end">
                <Button kind="primary" type="submit">
                    {$t("pages.admin.projects.filters.btns.apply")}
                </Button>
            </div>
        </form>
    {/if}
</div>
