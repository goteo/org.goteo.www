<script lang="ts">
    import { t } from "../../i18n/store";
    import { cart } from "../../stores/cart";
    import { derived } from "svelte/store";
    import { formatCurrency } from "../../utils/currencies";

    const total = derived(cart, ($cart) => {
        if (!$cart?.items) return 0;
        return $cart.items.reduce((sum, item) => sum + item.amount * item.quantity, 0);
    });

    export let accountingBalance;
    export let defaultCurrency;
</script>

<div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div class="text-center sm:text-left">
        <span class="block text-sm text-gray-600"
            >{$t("payment.wallet-confirmation.currentBalance")}</span
        >
        <p class="text-[32px] font-bold text-[#462949]">
            {formatCurrency(accountingBalance.amount, accountingBalance.currency, {
                showSymbol: true,
            })}
        </p>
    </div>

    <div class="text-center sm:text-left">
        <span class="block text-sm text-gray-600"
            >{$t("payment.wallet-confirmation.amountToUse")}
        </span>
        <p id="cart-total" class="text-[32px] font-bold text-red-500">
            {formatCurrency($total, defaultCurrency, { showSymbol: true })}
        </p>
    </div>

    <div class="text-center sm:text-left">
        <span class="block text-sm text-gray-600"
            >{$t("payment.wallet-confirmation.remainingBalance")}
        </span>
        <p id="cart-difference" class="text-[32px] font-bold text-[#462949]">
            {formatCurrency(accountingBalance.amount - $total, accountingBalance.currency, {
                showSymbol: true,
            })}
        </p>
    </div>
</div>
