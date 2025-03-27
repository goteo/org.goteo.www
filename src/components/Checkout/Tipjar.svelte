<script lang="ts">
    import { cart } from "../../stores/cart";
    import { get } from "svelte/store";

    let value = 3;
    let previousValue = value;
    let initialized = false;

    const createDonationItem = (amount: number) => ({
        title: "Donación Platoniq",
        amount: Math.round(amount * 100),
        quantity: 1,
        image: "",
        owner: "Platoniq",
    });

    // Una única suscripción reactiva
    cart.subscribe(($cart) => {
        if (!initialized) {
            const item = $cart.items.find((i) => i.owner === "Platoniq");
            if (item) {
                value = item.amount / 100;
                previousValue = value;
            }
            initialized = true;
        }
    });

    // Reacción controlada
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

<div class="w-auto">
    <h2 class="mt-6 mb-2 text-xl font-bold">Quiero contribuir con la fundación Platoniq</h2>
    <input
        class="w-full rounded border border-gray-300 p-2"
        type="number"
        bind:value
        min="0"
        step="any"
        placeholder="Ingrese monto libre"
    />
</div>
