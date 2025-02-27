<script lang="ts">
  import { cart, totalAmount } from "$lib/stores/cart";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "$lib/components/ui/card";
  import { goto } from "$app/navigation";  // added import for navigation

  // Group cart items by project property (if exists, otherwise group under "Others")
  $: groupedItems = $cart.items.reduce((acc, item) => {
    const project = item.project || "Others";
    if (!acc[project]) {
      acc[project] = [];
    }
    acc[project].push(item);
    return acc;
  }, {} as Record<string, typeof $cart.items>);
</script>

<div class="container mx-auto max-w-5xl p-4">
  <!-- Header -->
  <div class="flex flex-col gap-4 mb-8">
    <div>
      <Button variant="outline" size="sm" on:click={() => window.history.back()}>Back</Button>
    </div>
    <h1 class="text-3xl font-bold">Checkout</h1>
  </div>

  <!-- Content -->
  {#if $cart.items.length === 0}
    <p>Your cart is empty.</p>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Left: List cart items grouped by project as cards -->
      <div class="space-y-4">
        {#each Object.entries(groupedItems) as [project, items]}
          <h2 class="text-xl font-bold">{project}</h2>
          <div class="space-y-4">
            {#each items as item}
              <Card class="flex items-center gap-4 p-4">
                <img src={item.image} alt={item.name} class="w-16 h-16 object-cover" />
                <div class="flex-1">
                  <CardTitle class="font-semibold">{item.name}</CardTitle>
                  <div class="flex items-center gap-2">
                    Quantity:
                    <button on:click={() => cart.updateQuantity(item.id, item.type, Math.max(item.quantity - 1, 1))} class="px-2 py-1 border rounded">-</button>
                    <span>{item.quantity}</span>
                    <button on:click={() => cart.updateQuantity(item.id, item.type, item.quantity + 1)} class="px-2 py-1 border rounded">+</button>
                    <button on:click={() => cart.removeItem(item.id, item.type)} class="px-2 py-1 border rounded text-red-600 ml-4">🗑️</button>
                  </div>
                  <p>Price: {item.amount}€</p>
                </div>
              </Card>
            {/each}
          </div>
        {/each}
      </div>

      <!-- Right: Summary wrapped in a Card -->
      <Card class="p-4 h-full">
        <CardHeader>
          <CardTitle class="text-xl font-bold">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-lg">Total Items: {$cart.items.reduce((acc, item) => acc + item.quantity, 0)}</p>
          <p class="text-2xl font-bold mt-4">Total: {$totalAmount}€</p>
        </CardContent>
        <CardFooter>
          <Button variant="default" size="lg" class="w-full" on:click={() => goto('/payment')}>
            Confirm Order
          </Button>
        </CardFooter>
      </Card>
    </div>
  {/if}
</div>
