<script lang="ts">
    import type { ProjectBudgetItem, Project } from "../../openapi/client/index";
    import { t } from "../../i18n/store";

    let { project } = $props<{
        project: Project;
    }>();

    const typeBudget = {
        infrastructure: "var(--color-secondary)",
        material: "var(--color-tertiary)",
        task: "var(--color-variant)",
    } as const satisfies Record<ProjectBudgetItem["type"], string>;

    const legendEntries = Object.entries(typeBudget) as [ProjectBudgetItem["type"], string][];

    const formatAmount = (amount: number) => {
        return (amount / 100).toLocaleString("es-ES", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            useGrouping: true,
        });
    };

    const minimumTotal = project.budget?.minimum?.money?.amount ?? 0;
    const optimumTotal = project.budget?.optimum?.money?.amount ?? 0;
    const totalBudget = minimumTotal + optimumTotal;
</script>

<div class="flex flex-row flex-wrap items-center justify-between gap-6 pt-10">
    <div class="text-sm">
        <span class="text-gray-600">Total: </span>
        <span class="text-base font-black">{formatAmount(totalBudget)}€</span>
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
