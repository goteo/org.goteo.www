<script lang="ts">
    import WarningIcon from "../../svgs/WarningIcon.svelte";
    import { cart } from "../../stores/cart";
    import { derived } from "svelte/store";
    import { formatCurrency } from "../../utils/currencies";
    import { t } from "../../i18n/store";

    export let hasError: boolean;
    export let amount: number | undefined;
    export let currency: string;
    export let accountingIdPlatoniq: number;

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

<div class="flex flex-col gap-6 px-6 pt-6 pb-0">
    <div>
        <h2
            class={`flex items-center gap-2 text-[32px] font-semibold ${hasError ? "text-tertiary" : "text-secondary"}`}
        >
            {#if hasError}
                <span class="h-6 w-6">
                    <WarningIcon />
                </span>
            {/if}
            {$t("checkout.summary.total.title")}
        </h2>
        <p
            class={`text-[56px] leading-tight font-bold ${hasError ? "text-tertiary" : "text-secondary"}`}
        >
            {formatCurrency(amount ?? $total, currency)}
        </p>
    </div>
    <hr class="bg-secondary" />
</div>
