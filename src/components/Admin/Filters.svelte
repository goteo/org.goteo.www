<script lang="ts">
    import FiltersIcon from "../../svgs/FiltersIcon.svelte";
    import ActiveFilterIcon from "../../svgs/ActiveFilterIcon.svelte";
    import Search from "./Search.svelte";
    import { apiGatewaysGetCollection } from "../../openapi/client/index";
    import { t } from "../../i18n/store";
    import { onMount } from "svelte";

    let { onApplyFilters } = $props();
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

        paymentMethodOptions = (paymentGateways ?? []).map((g) => [
            g.name!,
            $t(`contributions.filters.paymentMethod.options.${g.name}`),
        ]);

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
            paymentMethod: selectedPaymentMethod,
            chargeStatus: selectedChargeStatus,
            rangeAmount: selectedRangeAmount,
            from: dateFrom
                ? new Date(new Date(dateFrom).getTime() - 24 * 60 * 60 * 1000).toISOString()
                : undefined,
            to: dateTo
                ? new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000).toISOString()
                : undefined,
        });
    }
</script>

<div
    class="flex flex-col gap-10 rounded-[40px] border border-[#E6E5F7] px-8 pt-6 pb-8 shadow-[0px_1px_3px_0px_#0000001A]"
>
    <div class=" flex items-center justify-between gap-4">
        <Search />
        <button
            type="button"
            onclick={() => (showFilters = !showFilters)}
            class="border-tertiary text-tertiary relative inline-flex cursor-pointer items-center gap-2 rounded-3xl border px-6 py-4 font-bold text-nowrap"
        >
            <span class="relative">
                <FiltersIcon />
                {#if selectedPaymentMethod || selectedChargeStatus || selectedRangeAmount || dateFrom || dateTo}
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

    {#if showFilters}
        <form onsubmit={handleSubmit} class="flex flex-col gap-6">
            <div class="grid grid-cols-3 gap-4">
                <!-- <select
            class="border-tertiary w-full rounded-lg border p-4"
            bind:value={selectedPaymentMethod}
        > -->
                <select
                    class="border-tertiary w-full cursor-not-allowed rounded-lg border p-4 disabled:opacity-50"
                    disabled
                >
                    <option value="" disabled selected
                        >{$t("contributions.filters.paymentMethod.title")}</option
                    >
                    {#each paymentMethodOptions as [value, label]}
                        <option {value}>{label}</option>
                    {/each}
                </select>

                <select
                    class="border-tertiary w-full cursor-not-allowed rounded-lg border p-4 disabled:opacity-50"
                    disabled
                >
                    <option disabled selected>Estado de Aporte</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                    <option value="option4">Option 4</option>
                </select>

                <select
                    class="border-tertiary w-full rounded-lg border p-4"
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
                    class="border-tertiary w-full rounded-lg border p-4"
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
                        class="border-tertiary w-full rounded-lg border p-4 pt-4"
                    />
                </div>

                <div class="relative">
                    <label for="dateTo" class="absolute top-0.5 left-4 text-[12px] text-gray-500">
                        {$t("contributions.filters.dateRange.endDate")}
                    </label>
                    <input
                        id="dateTo"
                        type="date"
                        class="border-tertiary w-full rounded-lg border p-4 pt-4"
                        bind:value={dateTo}
                        onclick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                    />
                </div>
            </div>

            <div class="col-span-3 flex justify-end">
                <button
                    type="submit"
                    class="bg-primary text-tertiary cursor-pointer rounded-3xl px-6 py-4 text-base font-bold"
                >
                    {$t("contributions.filters.btns.apply")}
                </button>
            </div>
        </form>
    {/if}
</div>
