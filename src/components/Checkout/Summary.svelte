<script lang="ts">
    import { cart } from "../../stores/cart";
    import { derived } from "svelte/store";

    const total = derived(cart, ($cart) =>
        $cart.items.reduce((sum, item) => sum + item.amount * item.quantity, 0),
    );

    const foundation = derived(cart, ($cart) =>
        $cart.items
            .filter((item) => item.owner?.toLowerCase() === "platoniq")
            .reduce((sum, item) => sum + item.amount * item.quantity, 0),
    );

    const donations = derived([total, foundation], ([$total, $foundation]) => $total - $foundation);

    function format(amount: number): string {
        return `${amount / 100}€`;
    }
</script>

<div class="rounded-xl border border-purple-200 bg-white p-6 text-purple-900">
    <h2 class="mb-2 text-lg font-semibold">Total que vas a donar:</h2>
    <p class="mb-2 text-3xl leading-tight font-bold">
        {$total / 100}€
    </p>
    <hr class="my-2 border-purple-200" />
    <p class="text-sm text-purple-900">
        <strong>{format($donations)}</strong> de donaciones + <strong>{format($foundation)}</strong>
        de aporte a la fundación
    </p>
</div>
