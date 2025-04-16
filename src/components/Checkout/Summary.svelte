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

<div class="flex flex-col gap-6 px-6 pt-6 pb-0">
    <div>
        <h2 class="text-[32px] font-semibold text-[#462949]">
            {$t("checkout.summary.total.title")}
        </h2>
        <p class="text-[56px] leading-tight font-bold text-[#462949]">
            {formatCurrency($total, "EUR", { showSymbol: true })}
        </p>
    </div>

    <hr class="bg-[#462949]" />

    <div>
        <p class="text-[#575757]">
            <strong>{formatCurrency($donations, "EUR", { showSymbol: true })}</strong>
            {$t("checkout.summary.resume.donationsPrefix")} +
            <strong>{formatCurrency($foundation, "EUR", { showSymbol: true })}</strong>
            {$t("checkout.summary.resume.foundationPrefix")}
        </p>
    </div>
</div>
