<script lang="ts">
    import { Modal } from "flowbite-svelte";
    import { untrack } from "svelte";

    import { t } from "../../../i18n/store";
    import { validationErrors } from "../../../stores/drafts/projectDraft";
    import { defaultCurrency, getUnit } from "../../../utils/currencies";
    import { toUnitsNumber } from "../../../utils/money";
    import Button from "../../library/buttons/Button.svelte";
    import DeleteModal from "../../library/feedback/DeleteModal.svelte";
    import Toast from "../../library/feedback/Toast.svelte";
    import Select from "../../library/inputs/Select.svelte";
    import TextArea from "../../library/inputs/TextArea.svelte";
    import TextInput from "../../library/inputs/TextInput.svelte";
    import Title from "../../library/typography/Title.svelte";

    import type { ProjectBudgetItem } from "../../../openapi/client";

    let {
        open = $bindable(false),
        showToast = $bindable(false),
        budgetItem,
        defaultDeadline,
        onSave,
        onDelete,
    }: {
        open: boolean;
        showToast: boolean;
        budgetItem: ProjectBudgetItem | null;
        defaultDeadline?: "minimum" | "optimum";
        onSave: (data: ProjectBudgetItem | null) => void;
        onDelete?: (deadline: "minimum" | "optimum") => void;
    } = $props();

    let selectedBudgetTitle = $state(untrack(() => budgetItem?.title ?? ""));
    let selectedBudgetType: "infrastructure" | "material" | "task" | undefined = $state(
        untrack(() => budgetItem?.type),
    );
    let amount = $state(untrack(() => (budgetItem?.money ? toUnitsNumber(budgetItem.money) : 0)));
    let selectedBudgetDeadline: "minimum" | "optimum" | undefined = $state(
        untrack(() => budgetItem?.deadline || defaultDeadline),
    );
    let selectedBudgetDescription = $state(untrack(() => budgetItem?.description ?? ""));

    let openDeleteModal = $state(false);

    const isFormValid = $derived(
        selectedBudgetTitle.trim() !== "" &&
            !!selectedBudgetType &&
            Number(amount) > 0 &&
            !!selectedBudgetDeadline &&
            selectedBudgetDescription.trim() !== "",
    );

    let formTouched = $state(false);

    const titleError = $derived(
        formTouched && selectedBudgetTitle.trim() === ""
            ? $t("pages.project.edit.budget.validation.title")
            : undefined,
    );
    const typeError = $derived(
        formTouched && !selectedBudgetType
            ? $t("pages.project.edit.budget.validation.type")
            : undefined,
    );
    const amountError = $derived(
        formTouched && Number(amount) <= 0
            ? $t("pages.project.edit.budget.validation.amount")
            : undefined,
    );
    const descriptionError = $derived(
        formTouched && selectedBudgetDescription.trim() === ""
            ? $t("pages.project.edit.budget.validation.description")
            : undefined,
    );

    function handleSaveOrCreate() {
        onSave({
            title: selectedBudgetTitle,
            description: selectedBudgetDescription,
            deadline: selectedBudgetDeadline!,
            money: {
                amount: Number(amount) * getUnit(defaultCurrency()),
                currency: defaultCurrency(),
            },
            type: selectedBudgetType!,
        });
    }

    function handleDeleteClick() {
        if (budgetItem) {
            onDelete?.(budgetItem.deadline);
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
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
            }
        }}
        role="dialog"
        aria-label={$t("pages.project.edit.budget.modal.title")}
        tabindex="-1"
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
            {$t("pages.project.edit.budget.modal.title")}
        </Title>
        <p class="text-content line-clamp-1 overflow-hidden text-base font-normal text-ellipsis">
            {$t("pages.project.edit.budget.modal.description")}
        </p>
        <div class="flex flex-col gap-4 pt-2">
            <TextInput
                bind:value={selectedBudgetTitle}
                labelText={$t("pages.project.edit.budget.modal.placeholders.title")}
                placeholder={$t("pages.project.edit.budget.modal.placeholders.title")}
                error={titleError}
                onBlur={() => (formTouched = true)}
            />
            <Select
                bind:value={selectedBudgetType as string}
                labelText={$t("pages.project.edit.budget.modal.placeholders.type")}
                error={typeError}
                onBlur={() => (formTouched = true)}
            >
                <option value="">{$t("pages.project.edit.budget.modal.placeholders.type")}</option>
                <option value="infrastructure"
                    >{$t("domain.project.budget.type.infrastructure")}</option
                >
                <option value="material">{$t("domain.project.budget.type.material")}</option>
                <option value="task">{$t("domain.project.budget.type.task")}</option>
            </Select>
            <TextInput
                bind:value={amount}
                type="number"
                labelText={$t("pages.project.edit.budget.modal.placeholders.moneyAmount")}
                placeholder={$t("pages.project.edit.budget.modal.placeholders.moneyAmount")}
                error={amountError}
            />
            <TextArea
                bind:value={selectedBudgetDescription}
                labelText={$t("pages.project.edit.budget.modal.placeholders.description")}
                placeholder={$t("pages.project.edit.budget.modal.placeholders.description")}
                rows={5}
                error={descriptionError}
                onBlur={() => (formTouched = true)}
            />
        </div>
        <div class="flex items-center justify-end gap-4">
            {#if budgetItem !== null && onDelete}
                <Button kind="secondary" onclick={() => (openDeleteModal = true)} class="w-fit">
                    {$t("common.remove")}
                </Button>
                <DeleteModal
                    title={$t("pages.project.edit.budget.deleteModal.title")}
                    description={$t("pages.project.edit.budget.deleteModal.description")}
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
