<script lang="ts">
    import { cart } from "../../stores/cart";
    import { derived } from "svelte/store";
    import { formatCurrency } from "../../utils/currencies";
    import { t } from "../../i18n/store";

    const total = derived(cart, ($cart) =>
        $cart.items.reduce((sum, item) => sum + item.amount * item.quantity, 0),
    );

    const foundation = derived(cart, ($cart) =>
        $cart.items
            .filter((item) => item.owner?.toLowerCase() === "platoniq")
            .reduce((sum, item) => sum + item.amount * item.quantity, 0),
    );

    const donations = derived([total, foundation], ([$total, $foundation]) => $total - $foundation);
</script>

<div class="rounded-xl border border-purple-200 bg-white p-6 text-purple-900">
    <h2 class="mb-2 text-lg font-semibold">{$t("checkout.summary.total.title")}</h2>
    <p class="mb-2 text-3xl leading-tight font-bold">
        {formatCurrency($total, "EUR", { showSymbol: true })}
    </p>
    <hr class="my-2 border-purple-200" />
    <p class="text-sm text-purple-900">
        <strong>{formatCurrency($donations, "EUR", { showSymbol: true })}</strong> de donaciones +
        <strong>{formatCurrency($foundation, "EUR", { showSymbol: true })}</strong>
        de aporte a la fundación
    </p>
    <p>{$t("checkout.summary.deduct")}</p>
</div>
