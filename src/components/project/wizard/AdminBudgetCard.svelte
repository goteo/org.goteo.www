<script lang="ts">
    import { t } from "../../../i18n/store";
    import { formatCurrency } from "../../../utils/currencies";
    import Button from "../../library/Button.svelte";
    import WizardModal from "./WizardModal.svelte";

    import type { Project, ProjectBudgetItem } from "../../../openapi/client";

    let {
        item,
        project,
        onSave,
        onDelete,
        onEdit,
        selectedBudgetItem,
        openModal = $bindable(false),
    }: {
        item: ProjectBudgetItem;
        project: Project;
        onSave: (data: ProjectBudgetItem | null) => Promise<void>;
        onDelete: (
            itemId: number | undefined,
            type: "minimum" | "optimum" | undefined,
        ) => Promise<void>;
        onEdit: () => void;
        selectedBudgetItem: ProjectBudgetItem | null;
        openModal: boolean;
    } = $props();

    const typeBudget: Record<ProjectBudgetItem["type"], string> = {
        task: "#99FFCC",
        infrastructure: "#462949",
        material: "#E94668",
    };
</script>

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

    <Button kind="secondary" class="w-full" onclick={onEdit}>
        {#snippet children()}
            {$t("wizard.budget.editBtn")}
        {/snippet}
    </Button>

    <WizardModal
        budgetItem={selectedBudgetItem}
        bind:open={openModal!}
        project={project!}
        {onSave}
        {onDelete}
    />
</div>
