<script lang="ts">
    import BookmarkIcon from "../svgs/BookmarkIcon.svelte";
    import { t } from "../i18n/store";
    import type { Project } from "../openapi/client";
    import TerritoryTag from "./TerritoryTag.svelte";

    export let lang: string;
    export let project: Project;
</script>

<div class="flex w-auto gap-2">
    <div class="flex items-center gap-2 rounded-sm border border-black px-2 py-1">
        <BookmarkIcon />
        {$t(`categories.${project.category}`)}
    </div>
    <TerritoryTag territory={project.territory} />
</div>
