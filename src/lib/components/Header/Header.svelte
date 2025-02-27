<script lang="ts">
  import { Menu, CircleUserRound } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { itemCount } from "$lib/stores/cart";
  import { goto } from "$app/navigation"; // added navigation helper
  import Logo from "./Logo.svg";
  import Bag from "./bag.svg";
</script>

<header class="bg-primary px-10 py-6">
  <div class="mx-auto flex items-center justify-between">
    <img src={Logo} alt="Goteo Logo" width={100} height={32} class="h-8 w-auto" />
    <div class="flex items-center gap-4">
      <Button variant="ghost" class="text-primary-foreground text-base">
        <CircleUserRound strokeWidth={1} class="h-10 w-10 mr-2" /> Hola Richard
      </Button>
      <div class="relative">
        <Button variant="ghost" size="icon" class="h-10 w-10" on:click={() => goto('/checkout')}>
          <img src={Bag} alt="Bag" />
        </Button>
        {#if $itemCount > 0}
          <span class="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs min-w-[1.2rem] h-5 rounded-full flex items-center justify-center font-medium">
            {$itemCount}
          </span>
        {/if}
      </div>
      <Button variant="ghost" size="icon" class="h-10 w-10 bg-primary-foreground text-primary">
        <Menu />
      </Button>
    </div>
  </div>
</header>
