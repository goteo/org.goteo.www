<script lang="ts">
    import BudgetBar from "./BudgetBar.svelte";
    import LegendBudgetBar from "./LegendBudgetBar.svelte";
    import { t } from "../../i18n/store";
    import type { Project, Accounting } from "../../openapi/client/index";

    let { project, accounting } = $props<{
        project: Project;
        accounting: Accounting;
    }>();
</script>

<div class="flex flex-col gap-6 lg:flex-row">
    <div class="text-secondary basis-1/3 text-3xl font-bold">
        {$t("project.tabs.budget.chart-title")}
    </div>

    <div
        class="bg-chart-background flex basis-2/3 flex-col gap-10 rounded-3xl px-6 pt-10 pb-6 shadow-sm"
    >
        <BudgetBar {project} {accounting} />
        <LegendBudgetBar {project} />
    </div>
</div>
