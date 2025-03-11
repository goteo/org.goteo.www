<script lang="ts">
    import { page } from "$app/state";
    import Navigation from "$lib/components/Navigation";

    console.debug("/[[locale]]/projects/[projectId]", page.data);
</script>

<Navigation />
<main class="m-8 mx-auto flex max-w-7xl flex-col gap-8">
    <slot />
</main>
