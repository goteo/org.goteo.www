<script lang="ts">
    import BudgetModal from "./BudgetModal.svelte";
    import CreateCard from "./CreateCard.svelte";
    import { t } from "../../../i18n/store";
    import {
        addBudgetItem,
        deleteBudgetItem,
        updateBudgetItem,
        validationErrors,
    } from "../../../stores/wizard-state";
    import { formatCurrency } from "../../../utils/currencies";
    import Button from "../../library/Button.svelte";

    import type { ProjectBudgetItem } from "../../../openapi/client";

    let {
        item,
        index,
        loading = $bindable(false),
        isCreateCard = false,
    }: {
        item: ProjectBudgetItem | null;
        index?: number;
        loading: boolean;
        isCreateCard?: boolean;
    } = $props();

    let openModal = $state(false);
    let showModalErrorToast = $state(false);

    const typeBudget: Record<ProjectBudgetItem["type"], string> = {
        task: "#99FFCC",
        infrastructure: "#462949",
        material: "#E94668",
    };

    function handleSaveBudgetItem(data: ProjectBudgetItem | null) {
        if (!data) return;
        let errors;

        if (index !== undefined) {
            errors = updateBudgetItem(index, data);
        } else {
            errors = addBudgetItem(data);
        }

        if (errors === undefined) {
            errors = {};
        }

        if (Object.keys(errors).length > 0) {
            validationErrors.set(errors!);
            showModalErrorToast = true;
            return;
        }

        validationErrors.set({});
        openModal = false;
    }

    function handleDeleteBudgetItem(deadline: "minimum" | "optimum" | undefined) {
        if (!index || !deadline) return;

        deleteBudgetItem(index, deadline);
        openModal = false;
    }
</script>

{#if isCreateCard}
    <CreateCard
        title={$t("wizard.budget.createCard.optimum.title")}
        description={$t("wizard.budget.createCard.optimum.description")}
        variant="budget"
        onSave={handleSaveBudgetItem}
        onclick={() => (openModal = true)}
        bind:open={openModal}
    />
{:else if item}
    <div
        class="border-grey flex w-full flex-col justify-between gap-4 rounded-4xl border bg-white p-6 font-bold shadow-sm"
    >
        <div class="flex flex-col gap-4">
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
                    class="inline-block h-2.5 w-5 rounded-lg"
                    style={`background-color: ${typeBudget[item.type as ProjectBudgetItem["type"]]}`}
                ></div>
                <span class="text-content text-sm">{$t(`budget.${item.type}`)}</span>
            </div>
        </div>

        <Button kind="secondary" class="w-full" onclick={() => (openModal = true)}>
            {$t("wizard.budget.editBtn")}
        </Button>

        <BudgetModal
            budgetItem={item}
            bind:showToast={showModalErrorToast}
            bind:open={openModal}
            onSave={handleSaveBudgetItem}
            onDelete={handleDeleteBudgetItem}
        />
    </div>
{/if}
