<script lang="ts">
    import { Modal } from "flowbite-svelte";
    import { untrack } from "svelte";

    import DeleteModal from "./DeleteModal.svelte";
    import RewardItemsSelector from "./RewardItemsSelector.svelte";
    import { t } from "../../../i18n/store";
    import { client } from "../../../openapi/client/client.gen";
    import { apiProjectsIdOrSlugGetUrl } from "../../../openapi/client/paths.gen";
    import { validationErrors } from "../../../stores/drafts/projectDraft";
    import { getUnit } from "../../../utils/currencies";
    import { toUnitsNumber } from "../../../utils/money";
    import Button from "../../library/buttons/Button.svelte";
    import Toast from "../../library/feedback/Toast.svelte";
    import FileUpload from "../../library/inputs/FileUpload.svelte";
    import TextArea from "../../library/inputs/TextArea.svelte";
    import TextInput from "../../library/inputs/TextInput.svelte";

    import type { Project, ProjectReward } from "../../../openapi/client";
    import type { UploadedFile } from "../../../stores/drafts/projectDraft";

    let {
        open = $bindable(false),
        showToast = $bindable(false),
        project,
        reward,
        existingFiles = [],
        onSave,
        onDelete,
    }: {
        open: boolean;
        showToast: boolean;
        project: Project;
        reward: ProjectReward | null;
        existingFiles?: UploadedFile[];
        onSave: (data: ProjectReward | null, files: UploadedFile[]) => void;
        onDelete?: () => void;
    } = $props();

    let title = $state(untrack(() => reward?.title ?? ""));
    let description = $state(untrack(() => reward?.description ?? ""));

    let moneyAmount = $state(
        untrack(() => (reward?.money.amount ? toUnitsNumber(reward.money) : 0)),
    );
    let rewardCount = $state(untrack(() => reward?.unitsTotal ?? 1));
    let unlimited = $state(untrack(() => (!reward?.isFinite ? true : false)));
    let files = $state<UploadedFile[]>(untrack(() => existingFiles));

    let openDeleteModal = $state(false);

    let formTouched = $state(false);

    const isFormValid = $derived(
        title.trim() !== "" && description.trim() !== "" && moneyAmount > 0,
    );

    const titleError = $derived(
        formTouched && title.trim() === ""
            ? $t("pages.project.edit.rewards.modal.validation.title")
            : undefined,
    );
    const descriptionError = $derived(
        formTouched && description.trim() === ""
            ? $t("pages.project.edit.rewards.modal.validation.description")
            : undefined,
    );
    const moneyError = $derived(
        formTouched && moneyAmount <= 0
            ? $t("pages.project.edit.rewards.modal.validation.amount")
            : undefined,
    );

    function handleSaveOrCreate() {
        const projectIri = client.buildUrl({
            url: apiProjectsIdOrSlugGetUrl,
            path: { idOrSlug: project.slug },
        });

        onSave(
            {
                project: projectIri,
                title,
                description,
                money: {
                    amount: Math.round(moneyAmount * getUnit(reward!.money?.currency)),
                    currency: reward!.money.currency,
                },
                isFinite: unlimited ? false : true,
                unitsTotal: unlimited ? null : rewardCount,
            },
            files,
        );
    }

    function handleDeleteClick() {
        if (reward) {
            onDelete?.();
            openDeleteModal = false;
            open = false;
        }
    }
</script>

<Modal
    bind:open
    closeBtnClass="top-7 end-7 cursor-pointer bg-transparent text-secondary hover:bg-transparent hover:text-secondary hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
    class="fixed top-1/2 left-1/2 mx-2 flex w-full max-w-225 -translate-x-1/2 -translate-y-1/2 bg-transparent backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px] sm:mx-4 lg:mx-0"
    bodyClass="p-0"
>
    <div
        class="flex flex-col gap-8 rounded-3xl bg-white p-6 shadow-lg"
        role="presentation"
        onclick={(e) => e.stopPropagation()}
    >
        {#if Object.keys($validationErrors).length === 1}
            {#each Object.values($validationErrors) as validationError}
                <Toast class="absolute z-999 self-center" variant="error" bind:showToast>
                    {$t(validationError)}
                </Toast>
            {/each}
        {:else if Object.keys($validationErrors).length >= 2}
            <Toast class="absolute z-999 self-center" variant="error" bind:showToast>
                {$t("system.validation.missingRequiredFields")}
            </Toast>
        {/if}
        <h2 class="text-xl font-bold text-black">
            {$t("pages.project.edit.rewards.modal.title")}
        </h2>
        <p class="text-content line-clamp-1 overflow-hidden text-base font-normal text-ellipsis">
            {$t("pages.project.edit.rewards.modal.description")}
        </p>
        <div class="flex flex-col gap-4 pt-2">
            <TextInput
                bind:value={title}
                labelText={$t("pages.project.edit.rewards.modal.placeholders.title")}
                placeholder={$t("pages.project.edit.rewards.modal.placeholders.title")}
                error={titleError}
                onBlur={() => (formTouched = true)}
            />
            <TextArea
                id="reward-description"
                bind:value={description}
                labelText={$t("pages.project.edit.rewards.modal.placeholders.description")}
                placeholder={$t("pages.project.edit.rewards.modal.placeholders.description")}
                rows={5}
                error={descriptionError}
                onBlur={() => (formTouched = true)}
            />
            <TextInput
                bind:value={moneyAmount}
                type="number"
                labelText={$t("pages.project.edit.rewards.modal.placeholders.moneyAmount")}
                placeholder={$t("pages.project.edit.rewards.modal.placeholders.moneyAmount")}
                error={moneyError}
                onBlur={() => (formTouched = true)}
            />
            <div class="flex flex-col gap-6">
                <FileUpload bind:files />
                <RewardItemsSelector bind:value={rewardCount} bind:unlimited />
            </div>
        </div>
        <div class="flex items-center justify-end gap-4">
            {#if reward !== null && onDelete}
                <Button kind="secondary" onclick={() => (openDeleteModal = true)} class="w-fit">
                    {$t("common.remove")}
                </Button>
                <DeleteModal
                    variant="rewards"
                    bind:open={openDeleteModal}
                    onclick={() => handleDeleteClick()}
                />
            {/if}
            <Button onclick={() => handleSaveOrCreate()} disabled={!isFormValid} class="w-fit">
                {$t("common.continue")}
            </Button>
        </div>
    </div>
</Modal>
