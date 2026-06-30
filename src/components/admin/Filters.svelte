<script lang="ts">
    import Search from "./Search.svelte";
    import Bullet from "../../components/icons/Bullet.svelte";
    import { t } from "../../i18n/store";
    import { type ApiGatewayChargesGetCollectionData } from "../../openapi/client/index";
    import FiltersIcon from "../icons/filters/Filters.svelte";
    import Button from "../library/buttons/Button.svelte";
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

    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
            alert($t("pages.admin.charges.filters.dateRange.errors.invalidRange"));
            return;
        }

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
                >
                    <option value="" disabled
                        >{$t("pages.admin.charges.filters.rangeAmount.title")}</option
                    >
                    {#each rangeAmountOptions as [value, label]}
                        <option {value}>{label}</option>
                    {/each}
                </select>

                <div class="relative">
                    <label for="dateFrom" class="absolute top-0.5 left-4 text-xs text-gray-500">
                        {$t("pages.admin.charges.filters.dateRange.initDate")}
                    </label>
                    <input
                        id="dateFrom"
                        type="date"
                        bind:value={dateFrom}
                        onclick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                        class="border-secondary w-full rounded-lg border p-4 pt-4"
                    />
                </div>

                <div class="relative">
                    <label for="dateTo" class="absolute top-0.5 left-4 text-xs text-gray-500">
                        {$t("pages.admin.charges.filters.dateRange.endDate")}
                    </label>
                    <input
                        id="dateTo"
                        type="date"
                        class="border-secondary w-full rounded-lg border p-4 pt-4"
                        bind:value={dateTo}
                        onclick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                    />
                </div>
            </Grid>

            <div class="col-span-3 flex justify-end">
                <Button type="submit" kind="primary">
                    {$t("pages.admin.charges.filters.btns.apply")}
                </Button>
            </div>
        </form>
    {/if}
</div>
