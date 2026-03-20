<script lang="ts">
    import { t } from "../../i18n/store";
    import type { ProjectBudgetItem } from "../../openapi/client";
    import { formatCurrency } from "../../utils/currencies";

    let {
        item,
    }: {
        item: ProjectBudgetItem;
    } = $props();

    const typeBudget: Record<ProjectBudgetItem["type"], string> = {
        task: "#99FFCC",
        infrastructure: "#462949",
        material: "#E94668",
    };
</script>

<div
    class="border-grey flex w-full flex-col justify-between gap-6 rounded-4xl border bg-white p-6 font-bold shadow-sm"
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
</div>
