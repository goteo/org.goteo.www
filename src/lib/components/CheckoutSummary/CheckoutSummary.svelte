<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "$lib/components/ui/card";
    import { goto } from "$app/navigation";
    import { cart, totalAmount } from "$lib/stores/cart";

    export let confirmAction: () => void = () => goto("/payment");
</script>

<Card class="p-4">
    <CardHeader>
        <CardTitle class="text-xl font-bold">Summary</CardTitle>
    </CardHeader>
    <CardContent>
        <!-- Compute total items dynamically -->
        <p class="text-lg">
            Total Items: {$cart.items.reduce((acc, item) => acc + item.quantity, 0)}
        </p>
        <p class="mt-4 text-2xl font-bold">
            Total: {$totalAmount}€
        </p>
    </CardContent>
    <CardFooter>
        <Button variant="default" size="lg" class="w-full" on:click={confirmAction}>Next</Button>
    </CardFooter>
</Card>
