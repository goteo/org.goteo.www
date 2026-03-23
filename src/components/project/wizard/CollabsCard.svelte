<script lang="ts">
    import CollabsModal from "./CollabsModal.svelte";
    import { t } from "../../../i18n/store";
    import { renderMarkdown } from "../../../utils/renderMarkdown";
    import Button from "../../library/Button.svelte";

    import type { Project, ProjectCollaboration } from "../../../openapi/client";

    let {
        open = $bindable(false),
        project,
        collab = $bindable(),
        onEdit,
        onSave,
        onDelete,
        selectedCollab,
    }: {
        open: boolean;
        project: Project;
        collab: ProjectCollaboration;
        onEdit: () => void;
        onSave: (data: any) => Promise<void>;
        onDelete: (id: number | undefined) => Promise<void>;
        selectedCollab: ProjectCollaboration | null;
    } = $props();
</script>

<div
    class="border-grey flex min-h-148.75 basis-1/3 flex-col items-center justify-between gap-2 rounded-4xl border bg-[#FFF] p-6 shadow-[0px_1px_3px_0px_#0000001A] md:gap-4"
>
    <div class="flex flex-col">
        <h3 class="text-secondary line-clamp-2 w-full text-left text-2xl font-bold">
            {collab.title}
        </h3>

        {#if collab.description}
            <div class="marked-content line-clamp-7 text-sm whitespace-pre-line text-gray-800">
                {#await renderMarkdown(collab.description ?? "") then description}
                    {@html description}
                {/await}
            </div>
        {/if}
    </div>

    <Button kind="secondary" class="w-full" onclick={onEdit}>
        {$t("reward.edit")}
    </Button>
</div>

<CollabsModal bind:open collab={selectedCollab} {project} {onSave} {onDelete} />
