<script lang="ts">
  import { page } from "$app/state";
  import Navigation from "$lib/components/Navigation";

  console.debug("/[[locale]]/projects/[projectId]", page.data);
</script>

<Navigation />
<main class="max-w-7xl mx-auto flex flex-col gap-8 m-8">
  <slot />
</main>
