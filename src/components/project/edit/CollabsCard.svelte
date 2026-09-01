<script lang="ts">
    import CollabsModal from "./CollabsModal.svelte";
    import CreateCard from "./CreateCard.svelte";
    import { t } from "../../../i18n/store";
    import {
        addCollaboration,
        deleteCollaboration,
        updateCollaboration,
        validationErrors,
    } from "../../../stores/drafts/projectDraft";
    import { renderMarkdown } from "../../../utils/renderMarkdown";
    import Close from "../../icons/navigation/Close.svelte";
    import Button from "../../library/buttons/Button.svelte";
    import DeleteModal from "../../library/feedback/DeleteModal.svelte";
    import Title from "../../library/typography/Title.svelte";

    import type { Project, ProjectCollaboration } from "../../../openapi/client";

    let {
        project,
        collab,
        index,
        loading = $bindable(false),
        isCreateCard = false,
    }: {
        project: Project;
        collab: ProjectCollaboration | null;
        index?: number;
        loading: boolean;
        isCreateCard?: boolean;
    } = $props();

    let openModal = $state(false);
    let openDeleteModal = $state(false);
    let showModalErrorToast = $state(false);

    function handleSaveCollab(data: ProjectCollaboration | null) {
        if (!data) return;
        let errors;

        if (index !== undefined) {
            errors = updateCollaboration(index, data);
        } else {
            errors = addCollaboration(data);
        }

        if (errors === undefined) {
            errors = {};
        }

        if (Object.keys(errors).length > 0) {
            validationErrors.set(errors);
            showModalErrorToast = true;
            return;
        }

        validationErrors.set({});
        openModal = false;
    }

    function handleDeleteCollab() {
        if (index === undefined) return;

        deleteCollaboration(index);
        openModal = false;
        openDeleteModal = false;
        validationErrors.set({});
    }
</script>

{#if isCreateCard}
    <CreateCard
        {project}
        title={$t("pages.project.edit.collaborations.add.title")}
        description={$t("pages.project.edit.collaborations.add.description")}
        variant="collab"
        onSave={handleSaveCollab}
        onclick={() => (openModal = true)}
        bind:open={openModal}
        bind:showToast={showModalErrorToast}
    />
{:else if collab}
    <div
        class="border-grey relative flex basis-1/3 flex-col justify-between gap-2 rounded-4xl border bg-[#FFF] p-6 shadow-[0px_1px_3px_0px_#0000001A] md:gap-4"
    >
        <button
            type="button"
            aria-label={$t("common.delete")}
            class="text-secondary absolute top-6 right-6 cursor-pointer transition-transform hover:scale-110"
            onclick={() => (openDeleteModal = true)}
        >
            <Close class="size-5" />
        </button>
        <div class="flex flex-col">
            <Title
                level={3}
                variant="subsection"
                color="secondary"
                truncate={2}
                class="w-full text-left"
            >
                {collab.title}
            </Title>

            {#if collab.description}
                <div class="marked-content line-clamp-7 text-sm whitespace-pre-line text-gray-800">
                    {#await renderMarkdown(collab.description ?? "") then description}
                        {@html description}
                    {/await}
                </div>
            {/if}
        </div>

        <Button kind="secondary" class="w-full" onclick={() => (openModal = true)}>
            {$t("common.edit")}
        </Button>

        <CollabsModal
            bind:open={openModal}
            bind:showToast={showModalErrorToast}
            {project}
            {collab}
            onSave={handleSaveCollab}
            onDelete={handleDeleteCollab}
        />
        <DeleteModal
            title={$t("pages.project.edit.collaborations.deleteModal.title")}
            description={$t("pages.project.edit.collaborations.deleteModal.description")}
            bind:open={openDeleteModal}
            onclick={handleDeleteCollab}
        />
    </div>
{/if}
