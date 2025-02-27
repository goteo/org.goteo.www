<script lang="ts">
  import { Menu, CircleUserRound } from "lucide-svelte";
  import { page } from "$app/state";

  import { goto } from "$app/navigation";
  import { itemCount } from "$lib/stores/cart";
  import { Button } from "$lib/components/ui/button";

  import Logo from "./Logo.svg";
  import Bag from "./bag.svg";

  console.debug("Header", page.data);
</script>

<header class="bg-primary px-10 py-6">
  <div class="mx-auto flex items-center justify-between">
    <a href="/" class="flex items-center focus:outline-none">
      <img src={Logo} alt="Goteo Logo" width={100} height={32} class="h-8 w-auto" />
    </a>
    <div class="flex items-center gap-4">
      {#if page.data.user}
        <div class="flex items-center">
          <Button variant="ghost" class="text-primary-foreground text-base">
            <CircleUserRound strokeWidth={1} class="h-10 w-10 mr-2" /> Hola {page.data.user.username}
          </Button>
          <form action="?/logout" method="POST">
            <Button type="submit" variant="ghost" class="text-primary-foreground text-base">Logout</Button>
          </form>
        </div>
      {:else}
        <Button variant="ghost" class="text-primary-foreground text-base" on:click={() => goto("/login")}>
          <CircleUserRound strokeWidth={1} class="h-10 w-10 mr-2" /> Login
        </Button>
      {/if}
      <div class="relative">
        <Button variant="ghost" size="icon" class="h-10 w-10" on:click={() => goto("/checkout")}>
          <img src={Bag} alt="Bag" />
        </Button>
        {#if $itemCount > 0}
          <span
            class="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs min-w-[1.2rem] h-5 rounded-full flex items-center justify-center font-medium"
          >
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
