<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "$lib/components/ui/card";
    import { cart, itemCount, totalAmount } from "$lib/stores/cart";
    import { goto } from "$app/navigation";
    import CheckoutSummary from "$lib/components/CheckoutSummary";
</script>

<div class="container mx-auto max-w-6xl p-4">
    <!-- Back button header -->
    <div class="mb-4">
        <Button variant="outline" size="sm" on:click={() => window.history.back()}>Back</Button>
    </div>

    <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
        <!-- Left Column: Payment Options -->
        <div>
            <h1 class="mb-4 text-3xl font-bold">Choose Payment Method</h1>
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
            <h1 class="mb-4 text-3xl font-bold">Order Summary</h1>
            <CheckoutSummary
                confirmAction={() => {
                    cart.clear();
                    goto("/confirmation");
                }}
            />
        </div>
    </div>
</div>
