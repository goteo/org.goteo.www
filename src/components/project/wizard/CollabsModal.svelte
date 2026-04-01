<script lang="ts">
    import { Modal } from "flowbite-svelte";

    import { t } from "../../../i18n/store";
    import Button from "../../library/Button.svelte";

    import { validationErrors, type WizardCollaboration } from "../../../stores/wizard-state";
    import type { ClassNameValue } from "tailwind-merge";
    import Toast from "../../library/Toast.svelte";
    import DeleteModal from "./DeleteModal.svelte";

    let {
        open = $bindable(false),
        showToast = $bindable(false),
        collab,
        onSave,
        onDelete,
    }: {
        open: boolean;
        showToast: boolean;
        collab: WizardCollaboration | null;
        onSave: (data: WizardCollaboration | null) => void;
        onDelete?: () => void;
    } = $props();

    let title = $state(collab?.title ?? "");
    let description = $state(collab?.description ?? "");
    let openDeleteModal = $state(false);

    const INPUTS_CLASSES: ClassNameValue =
        "border-secondary text-content items-center rounded-lg border bg-white p-4 text-base font-normal placeholder:opacity-48 focus:ring-0";

    function handleSaveOrCreate() {
        onSave({ title, description });
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
    class="fixed top-1/2 left-1/2 mx-2 flex w-full max-w-225 -translate-x-1/2 -translate-y-1/2 flex-col gap-8 rounded-3xl bg-white p-6 shadow-lg backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px] sm:mx-4 lg:mx-0"
    headerClass="md:p-0 p-0 flex-col gap-4 justify-start items-start"
    bodyClass="md:p-0 p-0"
    footerClass="md:p-0 p-0 flex items-center justify-end gap-4"
>
    {#if Object.keys($validationErrors).length === 1}
        {@const validationError = Object.values($validationErrors)}
        <Toast class="absolute z-999 self-end" variant="error" bind:showToast>
            {validationError}
        </Toast>
    {:else if Object.keys($validationErrors).length >= 2}
        <Toast class="absolute z-999 self-end" variant="error" bind:showToast>
            {$t("wizard.validation.budget.missing-requiered-fields")}
        </Toast>
    {/if}
    {#snippet header()}
        <h2 class="text-xl font-bold text-black">
            {$t(`wizard.collaborations.modal.title`)}
        </h2>
        <p class="text-content line-clamp-1 overflow-hidden text-base font-normal text-ellipsis">
            {$t(`wizard.collaborations.modal.description`)}
        </p>
    {/snippet}
    <div class="flex flex-col gap-4">
        <input
            type="text"
            placeholder={$t("wizard.collaborations.modal.placeholders.title")}
            bind:value={title}
            class={INPUTS_CLASSES}
        />
        <textarea
            placeholder={$t("wizard.collaborations.modal.placeholders.description")}
            bind:value={description}
            class={`h-32 resize-none ${INPUTS_CLASSES}`}
        ></textarea>
    </div>

    {#snippet footer()}
        {#if collab !== null && onDelete}
            <Button kind="secondary" onclick={() => (openDeleteModal = true)} class="w-fit">
                {$t(`wizard.collaborations.modal.btns.delete`)}
            </Button>
            <DeleteModal
                variant="collaborations"
                bind:open={openDeleteModal}
                onclick={() => handleDeleteClick()}
            />
        {/if}
        <Button onclick={() => handleSaveOrCreate()} class="w-fit">
            {$t(`wizard.collaborations.modal.btns.continue`)}
        </Button>
    {/snippet}
</Modal>
