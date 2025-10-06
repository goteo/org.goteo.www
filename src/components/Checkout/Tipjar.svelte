<script lang="ts">
    import { onMount } from "svelte";
    import { cart } from "../../stores/cart";
    import { get } from "svelte/store";
    import { getUnit, formatCurrency } from "../../utils/currencies";
    import { t } from "../../i18n/store";
    import type { CartItem } from "../../stores/cart";

    export let defaultCurrency: string;
    export let accountingIdPlatoniq: number;

    let value = 3;
    let rawInput = "3";
    let isChecked = true;
    let isFocused = false;
    let hasError = false;
    let initialized = false;

    const createDonationItem = (amount: number): Omit<CartItem, "key"> => ({
        title: "Donación Platoniq",
        amount: Math.round(amount * getUnit(defaultCurrency)),
        quantity: 1,
        image: "",
        target: accountingIdPlatoniq,
        currency: defaultCurrency,
    });

    function toggleDonation(checked: boolean) {
        const $cart = get(cart);
        const existing = $cart.items.find((i) => i.target === accountingIdPlatoniq);
        if (checked) {
            if (!existing && value > 0 && !hasError) {
                cart.addItem(createDonationItem(value));
            }
        } else {
            if (existing) {
                cart.removeItem(existing.key);
            }
        }
    }

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
        rawInput = formatCurrency(value * getUnit(defaultCurrency), defaultCurrency);

        const $cart = get(cart);
        const existing = $cart.items.find((i) => i.target === accountingIdPlatoniq);
        if (existing) {
            cart.removeItem(existing.key);
            cart.addItem(createDonationItem(value));
        }
    }

    onMount(() => {
        const $cart = get(cart);
        const item = $cart.items.find((i) => i.target === accountingIdPlatoniq);

        if (item) {
            value = item.amount / getUnit(defaultCurrency);
            rawInput = formatCurrency(item.amount, defaultCurrency);
        } else {
            cart.addItem(createDonationItem(value));
            rawInput = formatCurrency(value * getUnit(defaultCurrency), defaultCurrency);
        }

        initialized = true;
    });
</script>

<div class="flex w-auto flex-col gap-4">
    <div class="flex flex-col gap-2">
        <h2 class="text-tertiary text-2xl font-bold">
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
            placeholder={$t("checkout.tipjar.input")}
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
                checked={isChecked}
                on:change={(e) => {
                    isChecked = e.currentTarget.checked;
                    toggleDonation(isChecked);
                }}
            />
            <label for="donation-checkbox" class="text-secondary">
                {$t("checkout.tipjar.checkboxLabel")}
            </label>
        </div>
    </div>
</div>
