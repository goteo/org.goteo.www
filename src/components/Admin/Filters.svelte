<script lang="ts">
    import { apiGatewaysGetCollection } from "../../openapi/client/index";
    import { t } from "../../i18n/store";
    import { onMount } from "svelte";

    let { onApplyFilters } = $props();

    let selectedPaymentMethod = $state("");
    let selectedChargeStatus = $state("");
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
        rangeAmountOptions = Object.entries($t("contributions.filters.rangeAmount.options"));
    });

    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        onApplyFilters({
            paymentMethod: selectedPaymentMethod,
            chargeStatus: selectedChargeStatus,
            from: dateFrom,
            to: dateTo,
        });
    }
</script>

<button>Filtros</button>

<form onsubmit={handleSubmit}>
    <div class="grid grid-cols-3 gap-4">
        <select
            class="border-tertiary w-full rounded-lg border p-4"
            bind:value={selectedPaymentMethod}
        >
            <option value="" disabled>{$t("contributions.filters.paymentMethod.title")}</option>
            {#each paymentMethodOptions as [value, label]}
                <option {value}>{label}</option>
            {/each}
        </select>

        <select class="border-tertiary w-full rounded-lg border p-4">
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
            <option value="" disabled>{$t("contributions.filters.chargeStatus.title")}</option>
            {#each chargeStatusOptions as [value, label]}
                <option {value}>{label}</option>
            {/each}
        </select>

        <select
            class="border-tertiary w-full rounded-lg border p-4"
            bind:value={selectedChargeStatus}
        >
            <option value="" disabled>{$t("contributions.filters.rangeAmount.title")}</option>
            {#each rangeAmountOptions as [value, label]}
                <option {value}>{label}</option>
            {/each}
        </select>

        <input
            type="date"
            class="border-tertiary w-full rounded-lg border p-4"
            bind:value={dateFrom}
        />

        <input
            type="date"
            class="border-tertiary w-full rounded-lg border p-4"
            bind:value={dateTo}
        />
    </div>

    <button type="submit" class="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
        >{$t("apply")}</button
    >
</form>
