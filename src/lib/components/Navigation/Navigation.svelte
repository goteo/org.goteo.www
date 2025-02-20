<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Search } from "lucide-svelte";
</script>

<nav class="border-b px-10 py-6">
  <div class="mx-auto flex gap-6 overflow-x-auto">
    <div class="relative max-w-52 w-full">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="search" placeholder="Busca tu campaña" class="pl-9 bg-secondary rounded-2xl" />
    </div>
    <Button variant="ghost" class="whitespace-nowrap">Solidario</Button>
  </div>
</nav>
