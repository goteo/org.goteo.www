<script lang="ts">
    import { Modal } from "flowbite-svelte";

    import DeleteModal from "./DeleteModal.svelte";
    import { t } from "../../../i18n/store";
    import { validationErrors } from "../../../stores/wizard-state";
    import { defaultCurrency } from "../../../utils/currencies";
    import Button from "../../library/Button.svelte";
    import Toast from "../../library/Toast.svelte";

    import type { ProjectBudgetItem } from "../../../openapi/client";
    import type { ClassNameValue } from "tailwind-merge";

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

    let selectedBudgetTitle = $state(budgetItem?.title ?? "");
    let selectedBudgetType: "infrastructure" | "material" | "task" | undefined = $state(
        budgetItem?.type,
    );
    let amount = $state(budgetItem?.money.amount ? budgetItem.money.amount / 100 : 0);
    let selectedBudgetDeadline: "minimum" | "optimum" | undefined = $state(budgetItem?.deadline);
    let selectedBudgetDescription = $state(budgetItem?.description ?? "");

    let openDeleteModal = $state(false);

    const INPUTS_CLASSES: ClassNameValue =
        "border-secondary text-content items-center rounded-lg border bg-white p-4 text-base font-normal placeholder:opacity-48 focus:ring-0";

    function handleSaveOrCreate() {
        onSave({
            title: selectedBudgetTitle,
            description: selectedBudgetDescription,
            deadline: selectedBudgetDeadline!,
            money: {
                amount: amount * 100,
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
        <Toast class="absolute z-999 self-end" variant="error" bind:showToast>
            {$t("system.validation.missingRequiredFields")}
        </Toast>
    {/if}
    {#snippet header()}
        <h2 class="text-xl font-bold text-black">
            {$t("pages.project.edit.budget.modal.title")}
        </h2>
        <p class="text-content line-clamp-1 overflow-hidden text-base font-normal text-ellipsis">
            {$t("pages.project.edit.budget.modal.description")}
        </p>
    {/snippet}
    <div class="flex flex-col gap-4">
        <input
            bind:value={selectedBudgetTitle}
            type="text"
            placeholder={$t("pages.project.edit.budget.modal.placeholders.title")}
            class={INPUTS_CLASSES}
        />
        <select
            bind:value={selectedBudgetType}
            aria-label={$t("pages.project.edit.budget.modal.placeholders.title")}
            title={$t("pages.project.edit.budget.modal.placeholders.title")}
            class={`${INPUTS_CLASSES} `}
            required
        >
            <option value="" selected={!budgetItem?.type ? true : false}
                >{$t("pages.project.edit.budget.modal.placeholders.type")}</option
            >
            <option value="infrastructure">
                {$t("domain.project.budget.type.infrastructure")}
            </option>
            <option value="material">{$t("domain.project.budget.type.material")}</option>
            <option value="task">{$t("domain.project.budget.type.task")}</option>
        </select>
        <div class="flex gap-4">
            <input
                type="number"
                placeholder={$t("pages.project.edit.budget.modal.placeholders.moneyAmount")}
                class={`${INPUTS_CLASSES} w-[50%]`}
                bind:value={amount}
            />
            <select
                bind:value={selectedBudgetDeadline}
                aria-label={$t("pages.project.edit.budget.modal.placeholders.deadline")}
                title={$t("pages.project.edit.budget.modal.placeholders.deadline")}
                class={`${INPUTS_CLASSES} w-[50%]`}
            >
                <option value="" selected={!budgetItem?.deadline ? true : false}>
                    {$t("pages.project.edit.budget.modal.placeholders.deadline")}
                </option>
                <option
                    selected={budgetItem?.deadline && budgetItem?.deadline === "minimum"
                        ? true
                        : false}
                    value="minimum"
                >
                    {$t("domain.project.budget.minimum")}
                </option>
                <option
                    selected={budgetItem?.deadline && budgetItem?.deadline === "optimum"
                        ? true
                        : false}
                    value="optimum"
                >
                    {$t("domain.project.budget.optimum")}
                </option>
            </select>
        </div>
        <textarea
            bind:value={selectedBudgetDescription}
            placeholder={$t("pages.project.edit.budget.modal.placeholders.description")}
            class={`${INPUTS_CLASSES} h-60 resize-none `}>{budgetItem?.description ?? ""}</textarea
        >
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
        <Button onclick={() => handleSaveOrCreate()} class="w-fit">
            {$t("common.continue")}
        </Button>
    {/snippet}
</Modal>
