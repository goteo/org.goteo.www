<script lang="ts">
    import { Modal } from "flowbite-svelte";
    import { untrack } from "svelte";

    import DeleteModal from "./DeleteModal.svelte";
    import { t } from "../../../i18n/store";
    import { defaultCurrency, getUnit } from "../../../utils/currencies";
    import Button from "../../library/buttons/Button.svelte";
    import Select from "../../library/inputs/Select.svelte";
    import TextArea from "../../library/inputs/TextArea.svelte";
    import TextInput from "../../library/inputs/TextInput.svelte";

    import type { ProjectBudgetItem } from "../../../openapi/client";

    let {
        open = $bindable(false),
        showToast = $bindable(false),
        budgetItem,
        onSave,
        onDelete,
    }: {
        open: boolean;
        showToast: boolean;
        budgetItem: ProjectBudgetItem | null;
        onSave: (data: ProjectBudgetItem | null) => void;
        onDelete?: (deadline: "minimum" | "optimum") => void;
    } = $props();

    let selectedBudgetTitle = $state(untrack(() => budgetItem?.title ?? ""));
    let selectedBudgetType: "infrastructure" | "material" | "task" | undefined = $state(
        untrack(() => budgetItem?.type),
    );
    let amount = $state(
        untrack(() =>
            budgetItem?.money.amount
                ? budgetItem.money.amount / getUnit(budgetItem.money.currency)
                : 0,
        ),
    );
    let selectedBudgetDeadline: "minimum" | "optimum" | undefined = $state(
        untrack(() => budgetItem?.deadline),
    );
    let selectedBudgetDescription = $state(untrack(() => budgetItem?.description ?? ""));

    let openDeleteModal = $state(false);

    $effect(() => {
        if (open) {
            selectedBudgetTitle = budgetItem?.title ?? "";
            selectedBudgetType = budgetItem?.type;
            amount = budgetItem?.money.amount
                ? budgetItem.money.amount / getUnit(budgetItem.money.currency)
                : 0;
            selectedBudgetDeadline = budgetItem?.deadline;
            selectedBudgetDescription = budgetItem?.description ?? "";
        }
    });

    const isFormValid = $derived(
        selectedBudgetTitle.trim() !== "" &&
            !!selectedBudgetType &&
            Number(amount) > 0 &&
            !!selectedBudgetDeadline &&
            selectedBudgetDescription.trim() !== "",
    );

    let titleTouched = $state(false);
    let typeTouched = $state(false);
    let amountTouched = $state(false);
    let deadlineTouched = $state(false);
    let descriptionTouched = $state(false);

    const titleError = $derived(
        titleTouched && selectedBudgetTitle.trim() === ""
            ? $t("pages.project.edit.budget.validation.title")
            : undefined,
    );
    const typeError = $derived(
        typeTouched && !selectedBudgetType
            ? $t("pages.project.edit.budget.validation.type")
            : undefined,
    );
    const amountError = $derived(
        amountTouched && Number(amount) <= 0
            ? $t("pages.project.edit.budget.validation.amount")
            : undefined,
    );
    const deadlineError = $derived(
        deadlineTouched && !selectedBudgetDeadline
            ? $t("pages.project.edit.budget.validation.class")
            : undefined,
    );
    const descriptionError = $derived(
        descriptionTouched && selectedBudgetDescription.trim() === ""
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
    class="fixed top-1/2 left-1/2 mx-2 flex w-full max-w-225 -translate-x-1/2 -translate-y-1/2 flex-col gap-8 rounded-3xl bg-white p-6 shadow-lg backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px] sm:mx-4 lg:mx-0"
    headerClass="md:p-0 p-0 flex-col gap-4 justify-start items-start"
    bodyClass="md:p-0 p-0"
    footerClass="md:p-0 p-0 flex items-center justify-end gap-4"
>
    {#snippet header()}
        <h2 class="text-xl font-bold text-black">
            {$t("pages.project.edit.budget.modal.title")}
        </h2>
        <p class="text-content line-clamp-1 overflow-hidden text-base font-normal text-ellipsis">
            {$t("pages.project.edit.budget.modal.description")}
        </p>
    {/snippet}
    <div class="flex flex-col gap-4 pt-2">
        <TextInput
            bind:value={selectedBudgetTitle}
            labelText={$t("pages.project.edit.budget.modal.placeholders.title")}
            placeholder={$t("pages.project.edit.budget.modal.placeholders.title")}
            error={titleError}
            onBlur={() => (titleTouched = true)}
        />
        <Select
            bind:value={selectedBudgetType as string}
            labelText={$t("pages.project.edit.budget.modal.placeholders.type")}
            error={typeError}
            onBlur={() => (typeTouched = true)}
        >
            <option value="">{$t("pages.project.edit.budget.modal.placeholders.type")}</option>
            <option value="infrastructure">{$t("domain.project.budget.type.infrastructure")}</option
            >
            <option value="material">{$t("domain.project.budget.type.material")}</option>
            <option value="task">{$t("domain.project.budget.type.task")}</option>
        </Select>
        <div class="flex gap-4">
            <div class="w-1/2">
                <TextInput
                    bind:value={amount}
                    type="number"
                    labelText={$t("pages.project.edit.budget.modal.placeholders.moneyAmount")}
                    placeholder={$t("pages.project.edit.budget.modal.placeholders.moneyAmount")}
                    error={amountError}
                    onBlur={() => (amountTouched = true)}
                />
            </div>
            <div class="w-1/2">
                <Select
                    bind:value={selectedBudgetDeadline as string}
                    labelText={$t("pages.project.edit.budget.modal.placeholders.deadline")}
                    error={deadlineError}
                    onBlur={() => (deadlineTouched = true)}
                >
                    <option value=""
                        >{$t("pages.project.edit.budget.modal.placeholders.deadline")}</option
                    >
                    <option value="minimum">{$t("domain.project.budget.minimum")}</option>
                    <option value="optimum">{$t("domain.project.budget.optimum")}</option>
                </Select>
            </div>
        </div>
        <TextArea
            bind:value={selectedBudgetDescription}
            labelText={$t("pages.project.edit.budget.modal.placeholders.description")}
            placeholder={$t("pages.project.edit.budget.modal.placeholders.description")}
            rows={5}
            error={descriptionError}
            onBlur={() => (descriptionTouched = true)}
        />
    </div>

    {#snippet footer()}
        {#if budgetItem !== null && onDelete}
            <Button kind="secondary" onclick={() => (openDeleteModal = true)} class="w-fit">
                {$t("common.remove")}
            </Button>
            <DeleteModal
                variant="budget"
                bind:open={openDeleteModal}
                onclick={() => handleDeleteClick()}
            />
        {/if}
        <Button onclick={() => handleSaveOrCreate()} disabled={!isFormValid} class="w-fit">
            {$t("common.continue")}
        </Button>
    {/snippet}
</Modal>
