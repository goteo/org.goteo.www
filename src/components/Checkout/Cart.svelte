<script lang="ts">
    import CartItem from "./CartItem.svelte";
    import Tipjar from "./Tipjar.svelte";
    import { t } from "../../i18n/store";
    import { cart } from "../../stores/cart";
    import { derived } from "svelte/store";

    const items = derived(cart, ($cart) => $cart.items);

    const groupedByOwner = derived(items, ($items) =>
        $items.reduce(
            (acc, item) => {
                const key = item.owner || "Donación Libre";
                if (key.toLowerCase().trim() === "platoniq") return acc;

                if (!acc[key]) acc[key] = [];
                acc[key].push(item);
                return acc;
            },
            {} as Record<string, typeof $items>,
        ),
    );

    function increment(item: { key: string; quantity: number }) {
        cart.updateQuantity(item.key, item.quantity + 1);
    }

    function decrement(item: { key: string; quantity: number }) {
        if (item.quantity > 1) {
            cart.updateQuantity(item.key, item.quantity - 1);
        }
    }

    function remove(item: { key: string }) {
        cart.removeItem(item.key);
    }

    async function redirectToPayment() {
        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const languages = ["es", "en", "ca", "eu", "gl", "fr", "de"];
        const currentLang = languages.includes(pathParts[0]) ? pathParts[0] : "es";

        const newPath = `/${currentLang}/payment`;
        window.location.href = newPath;
    }
</script>

{#if $groupedByOwner}
    {#each Object.entries($groupedByOwner) as [owner, items]}
        <h2 class="mt-6 mb-2 text-xl font-bold">
            {owner === "Donación Libre" ? "Donación Libre" : `${$t("project.owner")} ${owner}`}
        </h2>
        {#each items as item (item.key)}
            <CartItem
                {item}
                onIncrement={() => increment(item)}
                onDecrement={() => decrement(item)}
                onRemove={() => remove(item)}
            />
        {/each}
    {/each}
{/if}

<Tipjar />

<button
    on:click={redirectToPayment}
    class="mt-4 rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
>
    Continuar
</button>
