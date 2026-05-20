<script lang="ts">
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";

    import type { ProjectBudgetItem } from "../../openapi/client";

    let {
        item,
        openModal = $bindable(false),
        selectedItem = $bindable<ProjectBudgetItem | null>(null),
    }: {
        item: ProjectBudgetItem;
        openModal?: boolean;
        selectedItem?: ProjectBudgetItem | null;
    } = $props();

    const typeBudget: Record<ProjectBudgetItem["type"], string> = {
        task: "bg-variant2",
        infrastructure: "bg-secondary",
        material: "bg-tertiary",
    };
</script>

<div
    class="border-grey flex w-full cursor-pointer flex-col justify-between gap-6 rounded-4xl border bg-white p-6 font-bold shadow-sm"
    onclick={() => { selectedItem = item; openModal = true; }}
    role="button"
    tabindex="0"
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { selectedItem = item; openModal = true; } }}
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
                class="inline-block h-2.5 w-5 rounded-lg {typeBudget[item.type as ProjectBudgetItem['type']]}"
            ></div>
            <span class="text-content text-sm">
                {$t(`domain.project.budget.type.${item.type}`)}
            </span>
        </div>
    </div>
</div>
