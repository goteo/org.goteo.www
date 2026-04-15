<script lang="ts">
    import { twJoin } from "tailwind-merge";

    import { t } from "../../i18n/store";
    import { cart } from "../../stores/cart";
    import WarningIcon from "../../svgs/WarningIcon.svelte";
    import { formatCurrency } from "../../utils/currencies";
    import CollapsibleBox from "../CollapsibleBox.svelte";

    interface Props {
        amount?: number;
        hasError?: boolean;
    }

    let { amount, hasError }: Props = $props();

    const total = $derived($cart.items.reduce((sum, item) => sum + item.amount * item.quantity, 0));

    const foundation = $derived(
        $cart.items
            .filter((item) => item.target === import.meta.env.PUBLIC_PLATONIQ_ACCOUNTING_ID)
            .reduce((sum, item) => sum + item.amount * item.quantity, 0),
    );

    const donations = $derived(total - foundation);
</script>

<div class="flex flex-col gap-6 px-0 pt-0 pb-0 lg:px-6 lg:pt-6 lg:pb-0">
    <CollapsibleBox
        detailsId="checkout-details"
        isInitiallyCollapsed={false}
        buttonTextShow={$t("checkout.summary.show_details")}
        buttonTextHide={$t("checkout.summary.hide_details")}
    >
        {#snippet header()}
            <h2
                class={twJoin(
                    "flex items-center gap-2 text-base font-semibold lg:text-[32px]",
                    hasError ? "text-tertiary" : "text-secondary",
                )}
            >
                {#if hasError}
                    <span class="h-6 w-6">
                        <WarningIcon />
                    </span>
                {/if}
                {$t("checkout.summary.total.title")}
            </h2>
            <p
                class={twJoin(
                    "text-[32px] leading-tight font-bold lg:text-[56px]",
                    hasError ? "text-tertiary" : "text-secondary",
                )}
            >
                {formatCurrency(amount ?? total)}
            </p>
        {/snippet}

        {#snippet content()}
            {#if donations > 0}
                <div class="flex flex-col gap-2">
                    <div class="flex justify-between text-sm">
                        <span>{$t("checkout.summary.donations")}</span>
                        <span>{formatCurrency(donations)}</span>
                    </div>
                </div>
            {/if}

            {#if foundation > 0}
                <div class="flex flex-col gap-2">
                    <div class="flex justify-between text-sm">
                        <span>{$t("checkout.summary.foundation")}</span>
                        <span>{formatCurrency(foundation)}</span>
                    </div>
                </div>
            {/if}
        {/snippet}
    </CollapsibleBox>
</div>
