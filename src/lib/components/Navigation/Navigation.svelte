<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Search } from "lucide-svelte";
  import { categories } from "$lib/constants/categories";
  import { _ } from "svelte-i18n";
</script>

<nav class="border-b px-10 py-6">
  <div class="mx-auto flex gap-6 overflow-x-auto">
    <div class="relative min-w-52">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="search" placeholder={$_('navigation.search')} class="pl-9 bg-secondary rounded-2xl" />
    </div>
    {#each categories as category}
      <Button variant="ghost" class="whitespace-nowrap">{$_(category.translationKey)}</Button>
    {/each}
  </div>
</nav>
