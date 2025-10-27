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
    <div class="text-secondary basis-5/12 text-4xl font-bold">
        {$t("project.tabs.budget.chart-title")}
    </div>

    <div
        class="bg-chart-background flex basis-7/12 flex-col gap-10 rounded-3xl px-6 pt-10 pb-6 shadow-sm"
    >
        <BudgetBar {project} {accounting} />
        <LegendBudgetBar {project} />
    </div>
</div>
