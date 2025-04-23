<script lang="ts">
    import { cart } from "../../stores/cart";
    import { get } from "svelte/store";
    import { getUnit, formatCurrency } from "../../utils/currencies";
    import { t } from "../../i18n/store";
    import type { CartItem } from "../../stores/cart";

    export let defaultCurrency: string;
    export let accountingIdPlatoniq: string;

    let value = 3;
    let rawInput = "3";
    let isChecked = false;
    let isFocused = false;
    let hasError = false;
    let initialized = false;

    const createDonationItem = (amount: number): Omit<CartItem, "key"> => ({
        title: "Donación Platoniq",
        amount: Math.round(amount * getUnit(defaultCurrency)),
        quantity: 1,
        image: "",
        target: "Platoniq",
        accountingId: accountingIdPlatoniq,
        currency: defaultCurrency,
    });

    cart.subscribe(($cart) => {
        if (!initialized) {
            const item = $cart.items.find((i) => i.target === "Platoniq");
            if (item) {
                value = item.amount / getUnit(defaultCurrency);
                isChecked = true;
            } else {
                value = 3;
                isChecked = false;
            }
            rawInput = formatCurrency(value * getUnit(defaultCurrency), defaultCurrency, {
                showSymbol: true,
            });
            initialized = true;
        }
    });

    function handleFocus() {
        isFocused = true;
        rawInput = value.toString();
        hasError = false;
    }

    function handleBlur() {
        isFocused = false;

        const parsed = parseFloat(rawInput.replace(/[^\d.,]/g, "").replace(",", "."));
        value = isNaN(parsed) ? 0 : parsed;

        if (!value || value <= 0) {
            hasError = true;
            return;
        }

        hasError = false;
        rawInput = formatCurrency(value * getUnit(defaultCurrency), defaultCurrency, {
            showSymbol: true,
        });

        const $cart = get(cart);
        const key = $cart.items.find((i) => i.target === "Platoniq")?.key;
        if (key) cart.removeItem(key);
        cart.addItem(createDonationItem(value));
    }

    $: if (initialized && !isChecked) {
        hasError = false;
        const $cart = get(cart);
        const key = $cart.items.find((i) => i.target === "Platoniq")?.key;
        if (key) cart.removeItem(key);
    }

    $: if (initialized && isChecked && !isFocused && value > 0 && !hasError) {
        const $cart = get(cart);
        const exists = $cart.items.some((i) => i.target === "Platoniq");
        if (!exists) {
            cart.addItem(createDonationItem(value));
        }
    }
</script>

<div class="flex w-auto flex-col gap-4">
    <div class="flex flex-col gap-2">
        <h2 class="text-secondary text-2xl font-bold">
            {$t("checkout.tipjar.community")}
        </h2>

        <input
            class="w-full rounded border border-gray-300 p-2
		transition focus:border-blue-500 focus:outline-none
		disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
            type="text"
            bind:value={rawInput}
            on:focus={handleFocus}
            on:blur={handleBlur}
            placeholder="Ingrese monto libre"
            disabled={!isChecked}
            class:border-red-500={hasError}
            class:ring-red-200={hasError}
            class:ring-2={hasError}
        />
        {#if hasError}
            <p class="text-sm text-red-600">
                {$t("checkout.tipjar.error.invalidAmount")}
            </p>
        {/if}
    </div>

    <div>
        <div class="flex items-center gap-2">
            <input
                id="donation-checkbox"
                type="checkbox"
                class="accent-primary h-6 w-6 rounded"
                bind:checked={isChecked}
            />
            <label for="donation-checkbox" class="text-tertiary">
                {$t("checkout.tipjar.checkboxLabel")}
            </label>
        </div>
    </div>
</div>
