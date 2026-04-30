<script lang="ts">
    import { derived } from "svelte/store";

    import WarningIcon from "../../components/icons/Warning.svelte";
    import { t } from "../../i18n/store";
    import { cart } from "../../stores/cart";
    import { formatCurrency } from "../../utils/currencies";
    import CollapsibleBox from "../CollapsibleBox.svelte";

    export let hasError: boolean;
    export let amount: number | undefined;
    export let currency: string;
    export let accountingIdPlatoniq: number;
    export let defaultTipjarName: string | undefined = undefined;

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

<div class="flex w-full flex-col gap-6">
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
            <hr class="bg-secondary h-px border-none" />
            <div>
                {#if $donations > 0}
                    <span>
                        <strong>{formatCurrency($donations, currency)}</strong>
                        {$t("checkout.summary.donations")}
                    </span>
                {/if}
                {#if $donations > 0 && $foundation > 0}
                    <span>+</span>
                {/if}
                {#if $foundation > 0}
                    <span>
                        <strong>
                            {formatCurrency($foundation, currency)}
                        </strong>
                        {$t("checkout.summary.foundation")}
                        {defaultTipjarName}
                    </span>
                {/if}
            </div>
        {/snippet}
    </CollapsibleBox>
</div>
