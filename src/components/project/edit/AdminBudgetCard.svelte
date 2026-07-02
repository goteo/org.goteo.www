<script lang="ts">
    import BudgetModal from "./BudgetModal.svelte";
    import CreateCard from "./CreateCard.svelte";
    import DeleteModal from "./DeleteModal.svelte";
    import { t } from "../../../i18n/store";
    import { apiProjectsGetCollectionUrl } from "../../../openapi/client/paths.gen";
    import {
        addBudgetItem,
        deleteBudgetItem,
        updateBudgetItem,
        validationErrors,
    } from "../../../stores/drafts/projectDraft";
    import { budgetTypeClasses } from "../../../utils/budgetColors";
    import { formatCurrency } from "../../../utils/currencies";
    import Close from "../../icons/navigation/Close.svelte";
    import Button from "../../library/buttons/Button.svelte";

    import type { Project, ProjectBudgetItem } from "../../../openapi/client";

    let {
        project,
        item,
        index,
        loading = $bindable(false),
        isCreateCard = false,
        defaultDeadline,
        hasMinimumItems = true,
        disabled = false,
        disabledMessage = "",
    }: {
        project: Project;
        item: ProjectBudgetItem | null;
        index?: number;
        loading: boolean;
        isCreateCard?: boolean;
        defaultDeadline?: "minimum" | "optimum";
        hasMinimumItems?: boolean;
        disabled?: boolean;
        disabledMessage?: string;
    } = $props();

    let openModal = $state(false);
    let openDeleteModal = $state(false);
    let showModalErrorToast = $state(false);

    function handleSaveBudgetItem(data: ProjectBudgetItem | null) {
        if (!data) return;

        if (!hasMinimumItems && data.deadline === "optimum") {
            validationErrors.set({
                minimumRequired: "pages.project.edit.budget.validation.minimumRequiredFirst",
            });
            showModalErrorToast = true;
            return;
        }

        const projectIri = apiProjectsGetCollectionUrl + "/" + (project.slug ?? project.id);
        const budgetItem = {
            ...data,
            project: item?.project ?? projectIri,
        };
        let errors;

        if (index !== undefined) {
            errors = updateBudgetItem(index, budgetItem, item?.deadline);
        } else {
            errors = addBudgetItem(budgetItem);
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

    function handleDeleteBudgetItem(deadline: "minimum" | "optimum" | undefined) {
        if (index === undefined || !deadline) return;

        deleteBudgetItem(index, deadline);
        openModal = false;
        openDeleteModal = false;
        validationErrors.set({});
    }
</script>

{#if isCreateCard}
    <CreateCard
        title={defaultDeadline
            ? $t(`pages.project.edit.budget.add.${defaultDeadline}.title`)
            : $t("pages.project.edit.budget.add.title")}
        description={defaultDeadline
            ? $t(`pages.project.edit.budget.add.${defaultDeadline}.description`)
            : $t("pages.project.edit.budget.add.description")}
        variant="budget"
        {project}
        onSave={handleSaveBudgetItem}
        onclick={() => (openModal = true)}
        bind:open={openModal}
        bind:showToast={showModalErrorToast}
        {defaultDeadline}
        {disabled}
        {disabledMessage}
    />
{:else if item}
    <div
        class="border-grey relative flex w-full flex-col justify-between gap-4 rounded-4xl border bg-white p-6 font-bold shadow-sm"
    >
        <button
            type="button"
            aria-label={$t("common.delete")}
            class="text-secondary absolute top-6 right-6 cursor-pointer transition-transform hover:scale-110"
            onclick={() => (openDeleteModal = true)}
        >
            <Close class="size-5" />
        </button>
        <div class="flex flex-col gap-4">
            <div class="flex items-center gap-2">
                <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {item.deadline ===
                    'minimum'
                        ? 'bg-secondary text-white'
                        : 'border-secondary text-secondary border'}"
                >
                    {item.deadline === "minimum"
                        ? $t("domain.project.budget.minimum")
                        : $t("domain.project.budget.optimum")}
                </span>
            </div>
            <h2 class="text-secondary line-clamp-1 text-2xl">{item.title}</h2>
            <p class="text-content line-clamp-3 font-normal">
                {item.description}
            </p>
        </div>
        <div class="mt-auto flex flex-row items-center justify-between">
            <p class="text-2xl text-black">
                {formatCurrency(item.money.amount, item.money.currency)}
            </p>
            <div class="flex items-center gap-2">
                <div
                    class="inline-block h-2.5 w-5 rounded-lg {budgetTypeClasses[
                        item.type as ProjectBudgetItem['type']
                    ]}"
                ></div>
                <span class="text-content text-sm">
                    {$t(`domain.project.budget.type.${item.type}`)}
                </span>
            </div>
        </div>

        <Button kind="secondary" class="w-full" onclick={() => (openModal = true)}>
            {$t("common.edit")}
        </Button>

        <BudgetModal
            budgetItem={item}
            bind:showToast={showModalErrorToast}
            bind:open={openModal}
            onSave={handleSaveBudgetItem}
            onDelete={handleDeleteBudgetItem}
        />
        <DeleteModal
            variant="budget"
            bind:open={openDeleteModal}
            onclick={() => handleDeleteBudgetItem(item.deadline)}
        />
    </div>
{/if}
