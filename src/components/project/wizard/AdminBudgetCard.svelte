<script lang="ts">
    import BudgetModal from "./BudgetModal.svelte";
    import CreateCard from "./CreateCard.svelte";
    import { t } from "../../../i18n/store";
    import { formatCurrency } from "../../../utils/currencies";
    import Button from "../../library/Button.svelte";

    import type { Project, ProjectBudgetItem } from "../../../openapi/client";

    let {
        item,
        index,
        project,
        minBudgetItems = $bindable(),
        optBudgetItems = $bindable(),
        loading = $bindable(false),
        openModal = $bindable(false),
        isCreateCard = false,
    }: {
        item: ProjectBudgetItem | null;
        index?: number;
        project: Project;
        minBudgetItems: ProjectBudgetItem[];
        optBudgetItems: ProjectBudgetItem[];
        loading: boolean;
        openModal: boolean;
        isCreateCard?: boolean;
    } = $props();

    const typeBudget: Record<ProjectBudgetItem["type"], string> = {
        task: "#99FFCC",
        infrastructure: "#462949",
        material: "#E94668",
    };

    async function handleSaveBudgetItem(data: ProjectBudgetItem | null) {
        if (!data) return;
        loading = true;

        try {
            if (item?.id && index) {
                if (data.deadline === "minimum") minBudgetItems[index] = data;
                else if (data.deadline === "optimum") optBudgetItems[index] = data;
            } else if (data) {
                if (data.deadline === "minimum") minBudgetItems = [...minBudgetItems, data];
                else if (data.deadline === "optimum") optBudgetItems = [...optBudgetItems, data];
            }
        } finally {
            loading = false;
            openModal = false;
            item = null;
        }
    }

    async function handleDeleteBudgetItem(
        itemId: number | undefined,
        type: "minimum" | "optimum" | undefined,
    ) {
        if (!itemId || !type) return;
        loading = true;

        try {
            if (type === "minimum") {
                minBudgetItems = minBudgetItems.filter((minItem) => minItem.id !== itemId);
            } else if (type === "optimum") {
                optBudgetItems = optBudgetItems.filter((optItem) => optItem.id !== itemId);
            }
        } finally {
            loading = false;
            openModal = false;
            item = null;
        }
    }

    function openCreate() {
        item = null;
        openModal = true;
    }

    function openEdit(budgetItem: ProjectBudgetItem) {
        item = budgetItem;
        openModal = true;
    }
</script>

{#if isCreateCard}
    <CreateCard
        title={$t("wizard.budget.createCard.optimum.title")}
        description={$t("wizard.budget.createCard.optimum.description")}
        variant="budget"
        onSave={handleSaveBudgetItem}
        onclick={openCreate}
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

        <Button kind="secondary" class="w-full" onclick={() => openEdit}>
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
