<script lang="ts">
    import BudgetChart from "./BudgetChart.svelte";
    import type { Project } from "../../openapi/client/index";
    const { project } = $props<{ project: Project }>();
    import { t } from "../../i18n/store";
</script>

<div class="flex flex-row gap-6">
    <div class="text-tertiary basis-1/4 text-[40px] leading-[1.1] font-bold">
        {$t("project.tabs.budget.chart-title")}
    </div>
    <div class="basis-3/4">
        <BudgetChart />
    </div>
</div>
