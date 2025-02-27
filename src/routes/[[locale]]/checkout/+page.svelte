<script lang="ts">
  import { cart, totalAmount } from "$lib/stores/cart";
  import { Button } from "$lib/components/ui/button";
</script>

<main class="p-8 max-w-xl mx-auto">
  <h1 class="text-3xl font-bold mb-4">Checkout</h1>

  {#if $cart.items.length === 0}
    <p>Your cart is empty.</p>
  {:else}
    <!-- List cart items -->
    <ul class="space-y-4">
      {#each $cart.items as item}
        <li class="flex items-center gap-4 border p-4 rounded">
          <img src={item.image} alt={item.name} class="w-16 h-16 object-cover" />
          <div class="flex-1">
            <p class="font-semibold">{item.name}</p>
            <p class="flex items-center gap-2">
              Quantity:
              <button on:click={() => cart.updateQuantity(item.id, item.type, Math.max(item.quantity - 1, 1))} class="px-2 py-1 border rounded">-</button>
              <span>{item.quantity}</span>
              <button on:click={() => cart.updateQuantity(item.id, item.type, item.quantity + 1)} class="px-2 py-1 border rounded">+</button>
              <button on:click={() => cart.removeItem(item.id, item.type)} class="px-2 py-1 border rounded text-red-600 ml-4">🗑️</button>
            </p>
            <p>Price: {item.amount}€</p>
          </div>
        </li>
      {/each}
    </ul>

    <!-- Display total -->
    <div class="mt-6 font-bold text-xl">
      Total: {$totalAmount}€
    </div>

    <!-- Confirm order button -->
    <div class="mt-8">
      <Button variant="default" size="lg">Confirm Order</Button>
    </div>
  {/if}
</main>
