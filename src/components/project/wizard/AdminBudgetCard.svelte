<script lang="ts">
    import BudgetModal from "./BudgetModal.svelte";
    import CreateCard from "./CreateCard.svelte";
    import { t } from "../../../i18n/store";
    import { formatCurrency } from "../../../utils/currencies";
    import Button from "../../library/Button.svelte";

    import type { Project, ProjectBudgetItem } from "../../../openapi/client";
    import {
        addBudgetItem,
        deleteBudgetItem,
        updateBudgetItem,
    } from "../../../stores/wizard-state";

    let {
        item,
        index,
        project,
        loading = $bindable(false),
        isCreateCard = false,
    }: {
        item: ProjectBudgetItem | null;
        index?: number;
        project: Project;
        loading: boolean;
        isCreateCard?: boolean;
    } = $props();

    let openModal = $state(false);

    const typeBudget: Record<ProjectBudgetItem["type"], string> = {
        task: "#99FFCC",
        infrastructure: "#462949",
        material: "#E94668",
    };

    function handleSaveBudgetItem(data: ProjectBudgetItem | null) {
        if (!data) return;
        loading = true;

        try {
            const deadline = data.deadline as "minimum" | "optimum";

            if (item && index !== undefined) {
                // UPDATE
                updateBudgetItem(index, deadline, data);
            } else {
                // CREATE
                addBudgetItem(deadline, data);
            }
        } finally {
            loading = false;
            openModal = false;
        }
    }

    function handleDeleteBudgetItem(deadline: "minimum" | "optimum" | undefined) {
        if (!index || !deadline) return;

        loading = true;

        try {
            deleteBudgetItem(index, deadline);
        } finally {
            loading = false;
            openModal = false;
            item = null;
        }
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
        {project}
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
            bind:open={openModal}
            {project}
            onSave={handleSaveBudgetItem}
            onDelete={handleDeleteBudgetItem}
        />
    </div>
{/if}
