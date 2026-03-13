<script lang="ts">
    import CategoryTag from "./CategoryTag.svelte";
    import TerritoryTag from "./TerritoryTag.svelte";

    import type { Project } from "../openapi/client";

    export let project: Project;

    function parseCategoryIri(category: string) {
        return category.split("/")[3];
    }
</script>

<div class="flex w-auto gap-2">
    {#each project.categories as category}
        <CategoryTag category={parseCategoryIri(category)} />
    {/each}
    <TerritoryTag territory={project.territory} />
</div>
