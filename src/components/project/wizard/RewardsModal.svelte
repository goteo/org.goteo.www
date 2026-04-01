<script lang="ts">
    import { Modal } from "flowbite-svelte";

    import RewardItemsSelector from "./RewardItemsSelector.svelte";
    import { t } from "../../../i18n/store";
    import { defaultCurrency } from "../../../utils/currencies";
    import FileUpload from "../../FileUpload.svelte";
    import Button from "../../library/Button.svelte";

    import { validationErrors, type WizardReward } from "../../../stores/wizard-state";
    import type { ClassNameValue } from "tailwind-merge";
    import Toast from "../../library/Toast.svelte";
    import DeleteModal from "./DeleteModal.svelte";

    let {
        open = $bindable(false),
        showToast = $bindable(false),
        reward,
        onSave,
        onDelete,
    }: {
        open: boolean;
        showToast: boolean;
        reward: WizardReward | null;
        onSave: (data: WizardReward | null) => void;
        onDelete?: () => void;
    } = $props();

    let title = $state(reward?.title ?? "");
    let description = $state(reward?.description ?? "");

    let moneyAmount = $state(reward?.money.amount ? reward.money.amount / 100 : 0);
    let rewardCount = $state(reward?.unitsTotal ?? 1);
    let unlimited = $state(reward?.isFinite ?? false);
    let files = $state<File[]>([]);

    let openDeleteModal = $state(false);

    const INPUTS_CLASSES: ClassNameValue =
        "border-secondary text-content items-center rounded-lg border bg-white p-4 text-base font-normal placeholder:opacity-48 focus:ring-0";

    function handleSaveOrCreate() {
        onSave({
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
            {$t(`wizard.rewards.modal.title`)}
        </h2>
        <p class="text-content line-clamp-1 overflow-hidden text-base font-normal text-ellipsis">
            {$t(`wizard.rewards.modal.description`)}
        </p>
    {/snippet}
    <div class="flex flex-col gap-4">
        <input
            type="text"
            placeholder={$t("wizard.rewards.modal.placeholders.title")}
            class={INPUTS_CLASSES}
            bind:value={title}
        />
        <textarea
            bind:value={description}
            placeholder={$t("wizard.rewards.modal.placeholders.description")}
            class={`h-32 resize-none ${INPUTS_CLASSES}`}
        ></textarea>
        <input
            bind:value={moneyAmount}
            type="number"
            placeholder={$t("wizard.rewards.modal.placeholders.moneyAmount")}
            class={INPUTS_CLASSES}
        />
        <div class="flex flex-col gap-6">
            <FileUpload bind:files />
            <RewardItemsSelector bind:value={rewardCount} bind:unlimited />
        </div>
    </div>

    {#snippet footer()}
        {#if reward !== null && onDelete}
            <Button kind="secondary" onclick={() => (openDeleteModal = true)} class="w-fit">
                {$t(`wizard.rewards.modal.btns.delete`)}
            </Button>
            <DeleteModal
                variant="rewards"
                bind:open={openDeleteModal}
                onclick={() => handleDeleteClick()}
            />
        {/if}
        <Button onclick={() => handleSaveOrCreate()} class="w-fit">
            {$t(`wizard.rewards.modal.btns.continue`)}
        </Button>
    {/snippet}
</Modal>
