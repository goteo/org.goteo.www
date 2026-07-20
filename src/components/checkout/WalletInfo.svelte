<script lang="ts">
    import { derived } from "svelte/store";

    import { t } from "../../i18n/store";
    import { cart } from "../../stores/cart";
    import { getDefaultCurrency } from "../../utils/consts";
    import { formatCurrency } from "../../utils/currencies";
    import { multiplyMoney, sumMoney, subtractMoney } from "../../utils/money";

    const total = derived(cart, ($cart) => {
        const items = Object.values($cart?.items ?? {});
        if (items.length === 0) return { amount: 0, currency: getDefaultCurrency() };
        return sumMoney(items.map((item) => multiplyMoney(item.money, item.quantity)));
    });

    export let accounting;
</script>

<div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div class="text-center sm:text-left">
        <span class="block text-sm text-gray-600">{$t("pages.checkout.wallet.currentBalance")}</span
        >
        <p class="text-secondary text-double font-bold">
            {formatCurrency(accounting.balance)}
        </p>
    </div>

    <div class="text-center sm:text-left">
        <span class="block text-sm text-gray-600">{$t("pages.checkout.wallet.amountToUse")} </span>
        <p id="cart-total" class="text-double font-bold text-red-500">
            {formatCurrency($total)}
        </p>
    </div>

    <div class="text-center sm:text-left">
        <span class="block text-sm text-gray-600"
            >{$t("pages.checkout.wallet.remainingBalance")}
        </span>
        <p id="cart-difference" class="text-secondary text-double font-bold">
            {formatCurrency(subtractMoney(accounting.balance, $total))}
        </p>
    </div>
</div>
