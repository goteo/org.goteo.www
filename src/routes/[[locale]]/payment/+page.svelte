<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "$lib/components/ui/card";
  import { cart, itemCount, totalAmount } from "$lib/stores/cart";
  import { goto } from "$app/navigation";
</script>

<div class="container mx-auto max-w-6xl p-4">
  <!-- Back button header -->
  <div class="mb-4">
    <Button variant="outline" size="sm" on:click={() => window.history.back()}>Back</Button>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <!-- Left Column: Payment Options -->
    <div>
      <h1 class="text-3xl font-bold mb-4">Choose Payment Method</h1>
      <div class="grid grid-cols-1 gap-4">
        <Card class="cursor-pointer">
          <CardContent>
            <h2 class="text-xl font-semibold">GOTEO</h2>
            <!-- ...existing payment details... -->
          </CardContent>
        </Card>
        <Card class="cursor-pointer">
          <CardContent>
            <h2 class="text-xl font-semibold">Credit Card</h2>
            <!-- ...existing payment details... -->
          </CardContent>
        </Card>
        <Card class="cursor-pointer">
          <CardContent>
            <h2 class="text-xl font-semibold">PayPal</h2>
            <!-- ...existing payment details... -->
          </CardContent>
        </Card>
        <Card class="cursor-pointer">
          <CardContent>
            <h2 class="text-xl font-semibold">Stripe</h2>
            <!-- ...existing payment details... -->
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Right Column: Order Summary -->
    <div>
      <h1 class="text-3xl font-bold mb-4">Order Summary</h1>
      <Card class="p-4">
        <CardContent>
          <!-- List each cart item -->
          {#each $cart.items as item}
            <div class="flex justify-between mb-2">
              <span>{item.name} x {item.quantity}</span>
              <span>{item.amount * item.quantity}€</span>
            </div>
          {/each}
          <!-- Totals -->
          <p class="text-lg mt-4">Total Items: {$itemCount}</p>
          <p class="text-2xl font-bold mt-2">Total: €{$totalAmount}</p>
        </CardContent>
        <CardFooter>
          <Button variant="default" size="lg" class="w-full" on:click={() => {
            cart.clear();
            goto('/confirmation'); // ensure this route exists or update accordingly
          }}>
            Confirm Payment
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</div>
