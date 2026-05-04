<script lang="ts">
    import { onMount } from "svelte";

    import { t } from "../../i18n/store";
    import { apiTipjarsIdGet } from "../../openapi/client";
    import { cart, cartByRecipient, type CartItem } from "../../stores/cart";
    import { getUnit } from "../../utils/currencies";
    import * as tipping from "../../utils/tipping";

    let amount = $state(tipping.defaultAmount / getUnit());
    let hasError = $state(false);

    let isChecked = $state(tipping.defaultChecked);

    onMount(() => {
        toggleTip();
    });

    function getMoney(amount: number) {
        return {
            amount,
            currency: import.meta.env.PUBLIC_DEFAULT_CURRENCY,
        };
    }

    async function getTip(): Promise<Omit<CartItem, "key">> {
        if ($cartByRecipient[tipping.tipjarIri]) {
            return $cartByRecipient[tipping.tipjarIri][0];
        }

        const { data: tipjar } = await apiTipjarsIdGet({ path: { id: tipping.tipjarId } });

        return {
            kind: "tip",
            type: "single",
            quantity: 1,
            title: $t("domain.tipping.title"),
            money: getMoney(tipping.defaultAmount),
            recipient: tipping.tipjarIri,
            recipientDisplayName: tipjar?.name!,
            target: tipjar?.accounting!,
        };
    }

    async function setTip(amount: number) {
        const tip = await getTip();

        cart.addItem({
            ...tip,
            money: getMoney(amount),
        });
    }

    function handleAmountChange(amount: number) {
        if (amount <= 0) {
            hasError = true;
            return;
        }

        hasError = false;

        setTip(amount * getUnit());
    }

    function toggleTip() {
        if (!isChecked) {
            if ($cartByRecipient[tipping.tipjarIri].length < 1) {
                return;
            }

            const tip = $cartByRecipient[tipping.tipjarIri][0];
            cart.removeItem(tip.key);
        } else {
            setTip(amount * getUnit());
        }
    }
</script>

<div class="flex w-auto flex-col gap-4">
    <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-bold text-black">
            {$t("checkout.tipjar.community")}
        </h2>

        <input
            class="w-full rounded border border-gray-300 p-2
			transition focus:border-blue-500 focus:outline-none
			disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
            type="number"
            min="1"
            bind:value={amount}
            oninput={(e) => handleAmountChange(+e.currentTarget.value)}
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
                bind:checked={isChecked}
                onchange={(e) => toggleTip()}
            />
            <label for="donation-checkbox" class="text-secondary">
                {$t("checkout.tipjar.checkboxLabel")}
            </label>
        </div>
    </div>
</div>
