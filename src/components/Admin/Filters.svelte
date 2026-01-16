<script lang="ts">
    import FiltersIcon from "../../svgs/FiltersIcon.svelte";
    import ActiveFilterIcon from "../../svgs/ActiveFilterIcon.svelte";
    import Search from "./Search.svelte";
    import { apiGatewaysGetCollection } from "../../openapi/client/index";
    import { type ApiGatewayChargesGetCollectionData } from "../../openapi/client/index";
    import { t } from "../../i18n/store";
    import { onMount } from "svelte";

    let { filters, onApplyFilters } = $props<{
        filters: ApiGatewayChargesGetCollectionData["query"];
        onApplyFilters: (filters: any) => void;
    }>();

    let showFilters = $state(false);

    let selectedPaymentMethod = $state("");
    let selectedChargeStatus = $state("");
    let selectedRangeAmount = $state("");
    let dateFrom = $state("");
    let dateTo = $state("");

    let paymentMethodOptions = $state<[string, string][]>([]);
    let chargeStatusOptions = $state<[string, string][]>([]);
    let rangeAmountOptions = $state<[string, string][]>([]);

    onMount(async () => {
        const { data: paymentGateways } = await apiGatewaysGetCollection();

        paymentMethodOptions = [
            ["all", $t("contributions.filters.paymentMethod.options.all")],
            ...(paymentGateways ?? []).map((g): [string, string] => [
                g.name!,
                $t(`contributions.filters.paymentMethod.options.${g.name}`),
            ]),
        ];

        chargeStatusOptions = Object.entries($t("contributions.filters.chargeStatus.options"));
        rangeAmountOptions = Object.entries($t("contributions.filters.rangeAmount.options")).sort(
            ([a], [b]) => {
                const parseMin = (val: string) =>
                    val.includes("..") ? parseInt(val.split("..")[0]) : parseInt(val);
                if (a === "all") return -1;
                if (b === "all") return 1;
                return parseMin(a) - parseMin(b);
            },
        );
    });

    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
            alert($t("contributions.filters.dateRange.errors.invalidRange"));
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
        <Search onSelectTarget={handleSelectTarget} />

        <div class="flex items-center gap-3">
            <button
                type="button"
                onclick={() => (showFilters = !showFilters)}
                class="border-secondary text-secondary relative inline-flex cursor-pointer items-center gap-2 rounded-3xl border px-6 py-4 font-bold text-nowrap"
            >
                <span class="relative">
                    <FiltersIcon />
                    {#if selectedPaymentMethod !== "" || selectedChargeStatus !== "" || selectedRangeAmount !== "" || dateFrom !== "" || dateTo !== ""}
                        <span class="absolute -top-1 -right-1">
                            <ActiveFilterIcon />
                        </span>
                    {/if}
                </span>
                {#if showFilters}
                    {$t("contributions.filters.btns.closeFilters")}
                {:else}
                    {$t("contributions.filters.btns.openFilters")}
                {/if}
            </button>
        </div>
    </div>

    {#if showFilters}
        <form onsubmit={handleSubmit} class="flex flex-col gap-6">
            <div class="grid grid-cols-3 gap-4">
                <select
                    class="border-secondary w-full rounded-lg border p-4"
                    bind:value={selectedPaymentMethod}
                >
                    <option value="" disabled selected
                        >{$t("contributions.filters.paymentMethod.title")}</option
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
                        >{$t("contributions.filters.chargeStatus.title")}</option
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
                        >{$t("contributions.filters.rangeAmount.title")}</option
                    >
                    {#each rangeAmountOptions as [value, label]}
                        <option {value}>{label}</option>
                    {/each}
                </select>

                <div class="relative">
                    <label for="dateFrom" class="absolute top-0.5 left-4 text-[12px] text-gray-500">
                        {$t("contributions.filters.dateRange.initDate")}
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
                    <label for="dateTo" class="absolute top-0.5 left-4 text-[12px] text-gray-500">
                        {$t("contributions.filters.dateRange.endDate")}
                    </label>
                    <input
                        id="dateTo"
                        type="date"
                        class="border-secondary w-full rounded-lg border p-4 pt-4"
                        bind:value={dateTo}
                        onclick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                    />
                </div>
            </div>

            <div class="col-span-3 flex justify-end">
                <button
                    type="submit"
                    class="bg-primary text-secondary cursor-pointer rounded-3xl px-6 py-4 text-base font-bold"
                >
                    {$t("contributions.filters.btns.apply")}
                </button>
            </div>
        </form>
    {/if}
</div>
