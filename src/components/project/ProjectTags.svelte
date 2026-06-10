<script lang="ts">
    import CategoryTag from "../library/CategoryTag.svelte";
    import TerritoryTag from "../library/TerritoryTag.svelte";

    import type { Project } from "../../openapi/client";

    export let project: Project;
</script>

<div class="flex w-auto gap-2">
    {#each project.categories as category}
        <CategoryTag iri={category} />
    {/each}
    <TerritoryTag territory={project.territory} />
</div>
