<script lang="ts">
    import { derived } from "svelte/store";

    import WarningIcon from "../../components/icons/Warning.svelte";
    import { t } from "../../i18n/store";
    import { apiTipjarsGetCollectionUrl } from "../../openapi/client/paths.gen";
    import { cart, cartAmount } from "../../stores/cart";
    import { formatCurrency } from "../../utils/currencies";
    import CollapsibleBox from "../CollapsibleBox.svelte";
    import { tipjarId } from "../../utils/tipping";

    export let hasError: boolean;
    export let amount: number | undefined;

    let summaryRef;

    const totalTips = derived(cart, ($cart) =>
        Object.values($cart.items)
            .filter((item) => item.recipient.startsWith(apiTipjarsGetCollectionUrl))
            .reduce((sum, item) => sum + item.money.amount * item.quantity, 0),
    );
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
                {formatCurrency(amount ?? $cartAmount)}
            </p>
        {/snippet}

        {#snippet content()}
            <hr class="bg-secondary h-px border-none" />
            <div>
                {#if $cartAmount > 0}
                    <span>
                        <strong>{formatCurrency($cartAmount)}</strong>
                        {$t("checkout.summary.donations")}
                    </span>
                {/if}
                {#if $cartAmount > 0 && $totalTips > 0}
                    <span>+</span>
                {/if}
                {#if $totalTips > 0}
                    <span>
                        <strong>
                            {formatCurrency($totalTips)}
                        </strong>
                    </span>
                {/if}
            </div>
        {/snippet}
    </CollapsibleBox>
</div>
