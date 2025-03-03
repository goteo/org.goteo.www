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
      class="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs min-w-[1.2rem] h-5 rounded-full flex items-center justify-center font-medium"
    >
      {$itemCount}
    </span>
  {/if}
</div>
