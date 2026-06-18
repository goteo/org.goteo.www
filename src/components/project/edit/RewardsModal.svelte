<script lang="ts">
    import { Modal } from "flowbite-svelte";

    import DeleteModal from "./DeleteModal.svelte";
    import RewardItemsSelector from "./RewardItemsSelector.svelte";
    import { t } from "../../../i18n/store";
    import { apiProjectsGetCollectionUrl } from "../../../openapi/client/paths.gen";
    import { validationErrors } from "../../../stores/drafts/projectDraft";
    import { defaultCurrency } from "../../../utils/currencies";
    import FileUpload from "../../FileUpload.svelte";
    import Button from "../../library/Button.svelte";
    import TextArea from "../../library/TextArea.svelte";
    import TextInput from "../../library/TextInput.svelte";
    import Toast from "../../library/Toast.svelte";

    import type { Project, ProjectReward } from "../../../openapi/client";

    let {
        open = $bindable(false),
        showToast = $bindable(false),
        project,
        reward,
        onSave,
        onDelete,
    }: {
        open: boolean;
        showToast: boolean;
        project: Project;
        reward: ProjectReward | null;
        onSave: (data: ProjectReward | null) => void;
        onDelete?: () => void;
    } = $props();

    let title = $state(reward?.title ?? "");
    let description = $state(reward?.description ?? "");

    let moneyAmount = $state(reward?.money.amount ? reward.money.amount / 100 : 0);
    let rewardCount = $state(reward?.unitsTotal ?? 1);
    let unlimited = $state(!reward?.isFinite ? true : false);
    let files = $state<File[]>([]);

    let openDeleteModal = $state(false);

    let titleTouched = $state(false);
    let descriptionTouched = $state(false);
    let moneyTouched = $state(false);

    const isFormValid = $derived(
        title.trim() !== "" && description.trim() !== "" && moneyAmount > 0,
    );

    const titleError = $derived(
        titleTouched && title.trim() === ""
            ? $t("pages.project.edit.rewards.modal.validation.title")
            : undefined,
    );
    const descriptionError = $derived(descriptionTouched && description.trim() === "" ? $t("pages.project.edit.rewards.modal.validation.description") : undefined);
    const moneyError = $derived(
        moneyTouched && moneyAmount <= 0
            ? $t("pages.project.edit.rewards.modal.validation.amount")
            : undefined,
    );

    function handleSaveOrCreate() {
        const projectIri = apiProjectsGetCollectionUrl + "/" + (project.slug ?? project.id);

        onSave({
            project: projectIri,
            title,
            description,
            money: {
                amount: moneyAmount * 100,
                currency: defaultCurrency(),
            },
            isFinite: unlimited ? false : true,
            unitsTotal: unlimited ? null : rewardCount,
        });
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
    onclose={() => validationErrors.set({})}
    closeBtnClass="top-7 end-7 cursor-pointer bg-transparent text-secondary hover:bg-transparent hover:text-secondary hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
    class="fixed top-1/2 left-1/2 mx-2 flex w-full max-w-225 -translate-x-1/2 -translate-y-1/2 flex-col gap-8 rounded-3xl bg-white p-6 shadow-lg backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px] sm:mx-4 lg:mx-0"
    headerClass="md:p-0 p-0 flex-col gap-4 justify-start items-start"
    bodyClass="md:p-0 p-0"
    footerClass="md:p-0 p-0 flex items-center justify-end gap-4"
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
    {#snippet header()}
        <h2 class="text-xl font-bold text-black">
            {$t("pages.project.edit.rewards.modal.title")}
        </h2>
        <p class="text-content line-clamp-1 overflow-hidden text-base font-normal text-ellipsis">
            {$t("pages.project.edit.rewards.modal.description")}
        </p>
    {/snippet}
    <div class="flex flex-col gap-4 pt-2">
        <TextInput
            bind:value={title}
            labelText={$t("pages.project.edit.rewards.modal.placeholders.title")}
            placeholder={$t("pages.project.edit.rewards.modal.placeholders.title")}
            error={titleError}
            onBlur={() => (titleTouched = true)}
        />
        <TextArea
            id="reward-description"
            bind:value={description}
            labelText={$t("pages.project.edit.rewards.modal.placeholders.description")}
            placeholder={$t("pages.project.edit.rewards.modal.placeholders.description")}
            rows={5}
            error={descriptionError}
            onBlur={() => (descriptionTouched = true)}
        />
        <TextInput
            bind:value={moneyAmount}
            type="number"
            labelText={$t("pages.project.edit.rewards.modal.placeholders.moneyAmount")}
            placeholder={$t("pages.project.edit.rewards.modal.placeholders.moneyAmount")}
            error={moneyError}
            onBlur={() => (moneyTouched = true)}
        />
        <div class="flex flex-col gap-6">
            <FileUpload bind:files />
            <RewardItemsSelector bind:value={rewardCount} bind:unlimited />
        </div>
    </div>

    {#snippet footer()}
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
    {/snippet}
</Modal>
