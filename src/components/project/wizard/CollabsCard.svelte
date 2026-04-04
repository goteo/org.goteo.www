<script lang="ts">
    import CollabsModal from "./CollabsModal.svelte";
    import CreateCard from "./CreateCard.svelte";
    import { t } from "../../../i18n/store";
    import {
        addCollaboration,
        deleteCollaboration,
        updateCollaboration,
        validationErrors,
        type WizardCollaboration,
    } from "../../../stores/wizard-state";
    import { renderMarkdown } from "../../../utils/renderMarkdown";
    import Button from "../../library/Button.svelte";

    let {
        collab,
        index,
        loading = $bindable(false),
        isCreateCard = false,
    }: {
        collab: WizardCollaboration | null;
        index?: number;
        loading: boolean;
        isCreateCard?: boolean;
    } = $props();

    let openModal = $state(false);
    let showModalErrorToast = $state(false);

    function handleSaveCollab(data: WizardCollaboration | null) {
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
        validationErrors.set({});
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
        bind:showToast={showModalErrorToast}
    />
{:else if collab}
    <div
        class="border-grey flex basis-1/3 flex-col justify-between gap-2 rounded-4xl border bg-[#FFF] p-6 shadow-[0px_1px_3px_0px_#0000001A] md:gap-4"
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
            {$t("pages.project.edit.collaborations.edit")}
        </Button>

        <CollabsModal
            bind:open={openModal}
            bind:showToast={showModalErrorToast}
            {collab}
            onSave={handleSaveCollab}
            onDelete={handleDeleteCollab}
        />
    </div>
{/if}
