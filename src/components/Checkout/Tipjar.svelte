<script lang="ts">
    import { cart } from "../../stores/cart";
    import { get } from "svelte/store";
    import { getUnit } from "../../utils/currencies";

    let value = 3;
    let previousValue = value;
    let initialized = false;

    const createDonationItem = (amount: number) => ({
        title: "Donación Platoniq",
        amount: Math.round(amount * getUnit("EUR")),
        quantity: 1,
        image: "",
        owner: "Platoniq",
    });

    cart.subscribe(($cart) => {
        if (!initialized) {
            const item = $cart.items.find((i) => i.owner === "Platoniq");
            if (item) {
                value = item.amount / getUnit("EUR");
                previousValue = value;
            }
            initialized = true;
        }
    });

    $: if (initialized && !isNaN(value) && value >= 0 && value !== previousValue) {
        previousValue = value;
        const $cart = get(cart);
        const key = $cart.items.find((i) => i.owner === "Platoniq")?.key;

        if (value > 0) {
            cart.addItem(createDonationItem(value));
        } else if (key) {
            cart.removeItem(key);
        }
    }
</script>

<div class="flex w-auto flex-col gap-4">
    <div class="flex flex-col gap-6">
        <h2 class="text-secondary text-2xl font-bold">
            Quiero contribuir con la fundación Platoniq
        </h2>
        <input
            class="w-full rounded border border-gray-300 p-2"
            type="number"
            bind:value
            min="0"
            step="any"
            placeholder="Ingrese monto libre"
        />
    </div>

    <div>
        <div class="flex items-center gap-2">
            <input
                type="checkbox"
                id="donation-checkbox"
                class="focus:bg-primary h-6 w-6 rounded border-gray-300 text-blue-600"
            />
            <label for="donation-checkbox" class=" text-[#575757]">
                Contribuir por una sociedad más ética y colaborativa
            </label>
        </div>
    </div>
</div>
