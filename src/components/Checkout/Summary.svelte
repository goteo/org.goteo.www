<script lang="ts">
    import WarningIcon from "../../svgs/WarningIcon.svelte";
    import Button from "../library/Button.svelte";
    import { cart } from "../../stores/cart";
    import { derived } from "svelte/store";
    import { formatCurrency } from "../../utils/currencies";
    import { t } from "../../i18n/store";
    import { createEventDispatcher } from "svelte";

    export let hasError: boolean;
    export let amount: number | undefined;
    export let currency: string;
    export let accountingIdPlatoniq: number;

    let isCollapsed = false;
    let summaryRef;
    const dispatch = createEventDispatcher();

    const total = derived(cart, ($cart) =>
        $cart.items.reduce((sum, item) => sum + item.amount * item.quantity, 0),
    );

    const foundation = derived(cart, ($cart) =>
        $cart.items
            .filter((item) => item.target === accountingIdPlatoniq)
            .reduce((sum, item) => sum + item.amount * item.quantity, 0),
    );

    const donations = derived([total, foundation], ([$total, $foundation]) => $total - $foundation);

    function toggleCollapse() {
        isCollapsed = !isCollapsed;

        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            const detailsElement = document.getElementById("checkout-details");
            if (detailsElement) {
                if (isCollapsed) {
                    detailsElement.style.display = "none";
                } else {
                    detailsElement.style.display = "block";
                }
            }
        }
    }
</script>

<div class="flex flex-col gap-6 px-0 pt-0 pb-0 lg:px-6 lg:pt-6 lg:pb-0" bind:this={summaryRef}>
    <div class="flex items-start justify-between">
        <div>
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
        </div>
        <div class="lg:hidden">
            <Button 
                kind="invert" 
                onclick={toggleCollapse} 
                class="text-sm px-2 py-1"
            >
                {isCollapsed
                    ? $t("checkout.summary.show_details")
                    : $t("checkout.summary.hide_details")}
            </Button>
        </div>
    </div>

    {#if !isCollapsed}
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
    {/if}
</div>
