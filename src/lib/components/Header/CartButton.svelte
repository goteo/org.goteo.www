<script lang="ts">
    import { goto } from "$app/navigation";
    import { itemCount } from "$lib/stores/cart";
    import { Button } from "$lib/components/ui/button";
    import Bag from "./bag.svg";
</script>

<div class="relative">
    <Button
        variant="ghost"
        size="icon"
        class="h-10 w-10"
        on:click={() => goto("/checkout")}
        aria-label="Shopping cart"
    >
        <img src={Bag} alt="Shopping cart" />
    </Button>

    {#if $itemCount > 0}
        <span
            class="absolute -right-1 -top-1 flex h-5 min-w-[1.2rem] items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground"
        >
            {$itemCount}
        </span>
    {/if}
</div>
