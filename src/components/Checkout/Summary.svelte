<script lang="ts">
    import WarningIcon from "../../svgs/WarningIcon.svelte";
    import CollapsibleBox from "../CollapsibleBox.svelte";
    import { cart } from "../../stores/cart";
    import { derived } from "svelte/store";
    import { formatCurrency } from "../../utils/currencies";
    import { t } from "../../i18n/store";

    export let hasError: boolean;
    export let amount: number | undefined;
    export let currency: string;
    export let accountingIdPlatoniq: number;

    let summaryRef;

    const total = derived(cart, ($cart) =>
        $cart.items.reduce((sum, item) => sum + item.amount * item.quantity, 0),
    );

    const foundation = derived(cart, ($cart) =>
        $cart.items
            .filter((item) => item.target === accountingIdPlatoniq)
            .reduce((sum, item) => sum + item.amount * item.quantity, 0),
    );

    const donations = derived([total, foundation], ([$total, $foundation]) => $total - $foundation);
</script>

<div class="flex flex-col gap-6 px-0 pt-0 pb-0 lg:px-6 lg:pt-6 lg:pb-0" bind:this={summaryRef}>
    <CollapsibleBox
        detailsId="checkout-details"
        isInitiallyCollapsed={false}
        buttonTextShow={$t("checkout.summary.show_details")}
        buttonTextHide={$t("checkout.summary.hide_details")}
    >
        {#snippet header()}
            <h2
                class={`flex items-center gap-2 text-base font-semibold lg:text-[32px] ${hasError ? "text-tertiary" : "text-secondary"}`}
            >
                {#if hasError}
                    <span class="h-6 w-6">
                        <WarningIcon />
                    </span>
                {/if}
                {$t("checkout.summary.total.title")}
            </h2>
            <p
                class={`text-[32px] leading-tight font-bold lg:text-[56px] ${hasError ? "text-tertiary" : "text-secondary"}`}
            >
                {formatCurrency(amount ?? $total, currency)}
            </p>
        {/snippet}

        {#snippet content()}
            {#if $donations > 0}
                <div class="flex flex-col gap-2">
                    <div class="flex justify-between text-sm">
                        <span>{$t("checkout.summary.donations")}</span>
                        <span>{formatCurrency($donations, currency)}</span>
                    </div>
                </div>
            {/if}

            {#if $foundation > 0}
                <div class="flex flex-col gap-2">
                    <div class="flex justify-between text-sm">
                        <span>{$t("checkout.summary.foundation")}</span>
                        <span>{formatCurrency($foundation, currency)}</span>
                    </div>
                </div>
            {/if}
        {/snippet}
    </CollapsibleBox>
</div>
