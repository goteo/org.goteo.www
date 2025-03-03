<script lang="ts">
  import { Menu, CircleUserRound } from "lucide-svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import Logo from "./Logo.svg";

  import UserMenu from "./UserMenu.svelte";
  import CartButton from "./CartButton.svelte";
</script>

<header class="bg-primary px-4 sm:px-6 lg:px-10 py-4 sm:py-6">
  <div class="mx-auto flex items-center justify-between">
    <!-- Logo and site navigation -->
    <a href="/" class="flex items-center focus:outline-none">
      <img src={Logo} alt="Goteo Logo" width={100} height={32} class="h-8 w-auto" />
    </a>

    <!-- Navigation and user controls -->
    <div class="flex items-center gap-2 sm:gap-4">
      <!-- User section: show different UI based on login status -->
      <UserMenu user={page.data.user} />

      <!-- Shopping cart button with item count -->
      <CartButton />

      <!-- Mobile menu button -->
      <Button variant="ghost" size="icon" class="h-10 w-10 bg-primary-foreground text-primary">
        <Menu />
      </Button>
    </div>
  </div>
</header>
