<script lang="ts">
    import type { ProjectBudgetItem, Project } from "../../openapi/client/index";
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";

    let { project } = $props<{
        project: Project;
    }>();

    const typeBudget = {
        infrastructure: "var(--color-secondary)",
        material: "var(--color-tertiary)",
        task: "var(--color-variant2)",
    } as const satisfies Record<ProjectBudgetItem["type"], string>;

    const legendEntries = Object.entries(typeBudget) as [ProjectBudgetItem["type"], string][];

    const minimumTotal = project.budget?.minimum?.money?.amount ?? 0;
    const optimumTotal = project.budget?.optimum?.money?.amount ?? 0;
    const totalBudget = minimumTotal + optimumTotal;
</script>

<div class="flex flex-row flex-wrap items-center justify-between gap-6">
    <div class="text-sm">
        <span class="text-gray-600">{$t("project.tabs.budget.total")}:</span>
        <span class="text-base font-black">{formatCurrency(totalBudget)}</span>
    </div>

    <div class="flex flex-row flex-wrap gap-6">
        {#each legendEntries as [key, color]}
            <div class="flex flex-row items-center gap-2">
                <div class="h-4 w-6 rounded-sm" style="background-color: {color};"></div>
                <span class="text-sm capitalize">{$t(`project.tabs.budget.typeBudget.${key}`)}</span
                >
            </div>
        {/each}
    </div>
</div>
