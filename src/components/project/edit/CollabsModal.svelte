<script lang="ts">
    import { Modal } from "flowbite-svelte";

    import DeleteModal from "./DeleteModal.svelte";
    import { t } from "../../../i18n/store";
    import { apiProjectsGetCollectionUrl } from "../../../openapi/client/paths.gen";
    import { validationErrors } from "../../../stores/drafts/projectDraft";
    import Button from "../../library/buttons/Button.svelte";
    import Toast from "../../library/feedback/Toast.svelte";
    import Title from "../../library/typography/Title.svelte";

    import type { Project, ProjectCollaboration } from "../../../openapi/client";
    import type { ClassNameValue } from "tailwind-merge";

    let {
        open = $bindable(false),
        showToast = $bindable(false),
        project,
        collab,
        onSave,
        onDelete,
    }: {
        open: boolean;
        showToast: boolean;
        project: Project;
        collab: ProjectCollaboration | null;
        onSave: (data: ProjectCollaboration | null) => void;
        onDelete?: () => void;
    } = $props();

    let title = $state(collab?.title ?? "");
    let description = $state(collab?.description ?? "");
    let openDeleteModal = $state(false);

    const INPUTS_CLASSES: ClassNameValue =
        "border-secondary text-content items-center rounded-lg border bg-white p-4 text-base font-normal placeholder:opacity-48 focus:ring-0";

    function handleSaveOrCreate() {
        const projectIri = apiProjectsGetCollectionUrl + "/" + (project.slug ?? project.id);

        onSave({ project: projectIri, title, description, isFulfilled: false });
    }

    function handleDeleteClick() {
        if (collab) {
            onDelete?.();
            openDeleteModal = false;
            open = false;
        }
    }
</script>

<Modal
    bind:open
    onclose={() => validationErrors.set({})}
    closeBtnClass="top-7 end-7 cursor-pointer bg-transparent text-secondary hover:bg-transparent hover:text-secondary hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
    class="fixed top-1/2 left-1/2 mx-2 flex w-full max-w-225 -translate-x-1/2 -translate-y-1/2 bg-transparent backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px] sm:mx-4 lg:mx-0"
    bodyClass="p-0"
>
    <div
        class="flex flex-col gap-8 rounded-3xl bg-white p-6 shadow-lg"
        onclick={(e) => e.stopPropagation()}
    >
        {#if Object.keys($validationErrors).length === 1}
            {#each Object.values($validationErrors) as validationError}
                <Toast class="absolute z-999 self-center" variant="error" bind:showToast>
                    {$t(validationError)}
                </Toast>
            {/each}
        {:else if Object.keys($validationErrors).length >= 2}
            <Toast class="absolute z-999 self-end" variant="error" bind:showToast>
                {$t("system.validation.missingRequiredFields")}
            </Toast>
        {/if}
        <Title level={2} variant="subsection">
            {$t("pages.project.edit.collaborations.modal.title")}
        </Title>
        <p class="text-content line-clamp-1 overflow-hidden text-base font-normal text-ellipsis">
            {$t("pages.project.edit.collaborations.modal.description")}
        </p>
        <div class="flex flex-col gap-4">
            <input
                type="text"
                placeholder={$t("pages.project.edit.collaborations.modal.placeholders.title")}
                bind:value={title}
                class={INPUTS_CLASSES}
            />
            <textarea
                placeholder={$t("pages.project.edit.collaborations.modal.placeholders.description")}
                bind:value={description}
                class={`h-32 resize-none ${INPUTS_CLASSES}`}></textarea>
        </div>
        <div class="flex items-center justify-end gap-4">
            {#if collab !== null && onDelete}
                <Button kind="secondary" onclick={() => (openDeleteModal = true)} class="w-fit">
                    {$t("common.remove")}
                </Button>
                <DeleteModal
                    variant="collaborations"
                    bind:open={openDeleteModal}
                    onclick={() => handleDeleteClick()}
                />
            {/if}
            <Button onclick={() => handleSaveOrCreate()} class="w-fit">
                {$t("common.continue")}
            </Button>
        </div>
    </div>
</Modal>
