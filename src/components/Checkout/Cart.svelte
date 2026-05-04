<script lang="ts">
    import CartItem from "./CartItem.svelte";
    import Tipjar from "./Tipjar.svelte";
    import { cart, cartByRecipient } from "../../stores/cart";
    import * as tipping from "../../utils/tipping";

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

    function getItems() {
        let items = Object.entries($cartByRecipient);

        if (tipping.isEnabled) {
            items = items.filter((item) => item[0] !== tipping.tipjarIri);
        }

        return items;
    }
</script>

<div class="flex flex-col gap-10">
    {#each getItems() as [target, items]}
        <div class="flex flex-col gap-6">
            <h2 class="text-2xl font-bold text-black">
                {items[0].recipientDisplayName}
            </h2>

            {#each items as item (item.key)}
                <CartItem
                    {item}
                    onIncrement={() => increment(item)}
                    onDecrement={() => decrement(item)}
                    onRemove={() => remove(item)}
                />
            {/each}
        </div>
    {/each}
</div>

{#if tipping.isEnabled}
    <Tipjar />
{/if}
