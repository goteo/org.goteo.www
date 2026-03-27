<script lang="ts">
    import CollabsModal from "./CollabsModal.svelte";
    import { t } from "../../../i18n/store";
    import { renderMarkdown } from "../../../utils/renderMarkdown";
    import Button from "../../library/Button.svelte";

    import type { Project } from "../../../openapi/client";
    import CreateCard from "./CreateCard.svelte";
    import {
        addCollaboration,
        deleteCollaboration,
        updateCollaboration,
        validationErrors,
        type WizardCollaboration,
    } from "../../../stores/wizard-state";

    let {
        collab,
        index,
        project,
        loading = $bindable(false),
        isCreateCard = false,
    }: {
        collab: WizardCollaboration | null;
        index?: number;
        project: Project;
        loading: boolean;
        isCreateCard?: boolean;
    } = $props();

    let openModal = $state(false);

    function handleSaveCollab(data: WizardCollaboration | null) {
        if (!data) return;

        let errors;

        if (index !== undefined) {
            errors = updateCollaboration(index, data);
        } else {
            errors = addCollaboration(data);
        }

        if (Object.keys(errors).length > 0) {
            validationErrors.set(errors);
            return;
        }

        validationErrors.set({});
        openModal = false;
    }

    function handleDeleteCollab() {
        if (!index) return;

        loading = true;

        try {
            deleteCollaboration(index);
        } finally {
            loading = false;
            openModal = false;
        }
    }
</script>

{#if isCreateCard}
    <CreateCard
        title={$t("wizard.collaborations.createCard.title")}
        description={$t("wizard.collaborations.createCard.description")}
        variant="collab"
        onSave={handleSaveCollab}
        onclick={() => (openModal = true)}
        bind:open={openModal}
        {project}
    />
{:else if collab}
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

        <Button kind="secondary" class="w-full" onclick={() => (openModal = true)}>
            {$t("reward.edit")}
        </Button>
    </div>

    <CollabsModal
        bind:open={openModal}
        {collab}
        onSave={handleSaveCollab}
        onDelete={handleDeleteCollab}
    />
{/if}
