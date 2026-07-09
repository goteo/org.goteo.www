<script lang="ts">
    import Search from "./Search.svelte";
    import Bullet from "../../components/icons/Bullet.svelte";
    import { t } from "../../i18n/store";
    import { type ApiGatewayChargesGetCollectionData } from "../../openapi/client/index";
    import FiltersIcon from "../icons/filters/Filters.svelte";
    import Button from "../library/buttons/Button.svelte";
    import DateInput from "../library/inputs/DateInput.svelte";
    import Grid from "../library/layout/Grid.svelte";

    let {
        filters,
        onApplyFilters,
        paymentMethodOptions,
        chargeStatusOptions,
        rangeAmountOptions,
        initialSearchQuery = "",
    } = $props<{
        filters: ApiGatewayChargesGetCollectionData["query"];
        onApplyFilters: (filters: any) => void;
        paymentMethodOptions: [string, string][];
        chargeStatusOptions: [string, string][];
        rangeAmountOptions: [string, string][];
        initialSearchQuery?: string;
    }>();

    let showFilters = $state(false);

    let selectedPaymentMethod = $state("");
    let selectedChargeStatus = $state("");
    let selectedRangeAmount = $state("");
    let dateFrom = $state("");
    let dateTo = $state("");

    // Debounce auto-applied filter changes so they don't fire one API request per change
    let autoApplyTimeout: ReturnType<typeof setTimeout>;

    function hasInvalidDateRange() {
        return Boolean(dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo));
    }

    function applyFilters() {
        onApplyFilters({
            ...filters,
            "checkout.gateway": selectedPaymentMethod || undefined,
            status: selectedChargeStatus || undefined,
            "money.amount[gte]": selectedRangeAmount || undefined,
            "dateCreated[after]": dateFrom
                ? new Date(new Date(dateFrom).getTime()).toISOString()
                : undefined,
            "dateCreated[before]": dateTo
                ? new Date(new Date(dateTo).getTime()).toISOString()
                : undefined,
        });
    }

    // Auto-apply filter changes; skip silently while the date range is incomplete/invalid
    function scheduleApply() {
        clearTimeout(autoApplyTimeout);
        autoApplyTimeout = setTimeout(() => {
            if (hasInvalidDateRange()) return;
            applyFilters();
        }, 400);
    }

    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        clearTimeout(autoApplyTimeout);
        if (hasInvalidDateRange()) {
            alert($t("pages.admin.charges.filters.dateRange.errors.invalidRange"));
            return;
        }
        applyFilters();
    }

    function handleSelectTarget(accounting: string) {
        onApplyFilters({ target: accounting });
    }

    $effect(() => {
        if (typeof filters["checkout.gateway"] === "undefined") selectedPaymentMethod = "";
        if (typeof filters.status === "undefined") selectedChargeStatus = "";
        if (typeof filters["money.amount[gte]"] === "undefined") selectedRangeAmount = "";
        if (typeof filters["money.amount[between]"] === "undefined") selectedRangeAmount = "";

        if (typeof filters["dateCreated[after]"] === "undefined") dateFrom = "";
        if (typeof filters["dateCreated[before]"] === "undefined") dateTo = "";
    });
</script>

<div
    class="border-variant1 relative flex flex-col gap-10 rounded-[40px] border px-8 pt-6 pb-8 shadow-[0px_1px_3px_0px_#0000001A]"
>
    <div class=" flex items-center justify-between gap-4">
        <Search onSelectTarget={handleSelectTarget} initialQuery={initialSearchQuery} />

        <div class="flex items-center gap-3">
            <Button
                type="button"
                kind="ghost"
                onclick={() => (showFilters = !showFilters)}
                class="relative text-nowrap"
            >
                <span class="relative">
                    <FiltersIcon />
                    {#if selectedPaymentMethod !== "" || selectedChargeStatus !== "" || selectedRangeAmount !== "" || dateFrom !== "" || dateTo !== ""}
                        <span class="absolute -top-1 -right-1">
                            <Bullet />
                        </span>
                    {/if}
                </span>
                {#if showFilters}
                    {$t("pages.admin.charges.filters.btns.closeFilters")}
                {:else}
                    {$t("pages.admin.charges.filters.btns.openFilters")}
                {/if}
            </Button>
        </div>
    </div>

    {#if showFilters}
        <form onsubmit={handleSubmit} class="flex flex-col gap-6">
            <Grid class="grid-cols-3 gap-4">
                <select
                    class="border-secondary w-full rounded-lg border p-4"
                    bind:value={selectedPaymentMethod}
                    onchange={scheduleApply}
                >
                    <option value="" disabled selected
                        >{$t("pages.admin.charges.filters.paymentMethod.title")}</option
                    >
                    {#each paymentMethodOptions as [value, label]}
                        <option {value}>{label}</option>
                    {/each}
                </select>

                <select
                    class="border-secondary w-full rounded-lg border p-4"
                    bind:value={selectedChargeStatus}
                    onchange={scheduleApply}
                >
                    <option value="" disabled
                        >{$t("pages.admin.charges.filters.chargeStatus.title")}</option
                    >
                    {#each chargeStatusOptions as [value, label]}
                        <option {value}>{label}</option>
                    {/each}
                </select>

                <select
                    class="border-secondary w-full rounded-lg border p-4"
                    bind:value={selectedRangeAmount}
                    onchange={scheduleApply}
                >
                    <option value="" disabled
                        >{$t("pages.admin.charges.filters.rangeAmount.title")}</option
                    >
                    {#each rangeAmountOptions as [value, label]}
                        <option {value}>{label}</option>
                    {/each}
                </select>

                <DateInput
                    id="dateFrom"
                    labelText={$t("pages.admin.charges.filters.dateRange.initDate")}
                    value={dateFrom ? new Date(dateFrom) : new Date(NaN)}
                    onInput={(date) => {
                        dateFrom = date;
                        scheduleApply();
                    }}
                />

                <DateInput
                    id="dateTo"
                    labelText={$t("pages.admin.charges.filters.dateRange.endDate")}
                    value={dateTo ? new Date(dateTo) : new Date(NaN)}
                    onInput={(date) => {
                        dateTo = date;
                        scheduleApply();
                    }}
                />
            </Grid>

            <div class="col-span-3 flex justify-end">
                <Button type="submit" kind="primary">
                    {$t("pages.admin.charges.filters.btns.apply")}
                </Button>
            </div>
        </form>
    {/if}
</div>
