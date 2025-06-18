<script lang="ts">
    import BudgetBar from "./BudgetBar.svelte";
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";
    import type { Project } from "../../openapi/client/index";

    let { project } = $props<{
        project: Project;
    }>();
</script>

<div class="flex flex-row gap-6">
    <div class="text-tertiary basis-2/5 text-[40px] leading-[1.1] font-bold">
        {$t("project.tabs.budget.chart-title")}
    </div>

    <div class="flex basis-3/5 flex-col gap-8 rounded-xl bg-[#f1efff] p-6">
        <div class="text-tertiary flex flex-col gap-4">
            <div class="flex flex-row gap-2">
                {$t("project.tabs.budget.minimum")}:
                <span>
                    <p class="font-bold">
                        {formatCurrency(
                            project.budget.minimum.money.amount,
                            project.budget.minimum.money.currency,
                            {
                                showSymbol: true,
                            },
                        )}
                    </p>
                </span>
            </div>
            <BudgetBar {project} budgetAmount={"minimum"} />
        </div>

        <div class="text-tertiary flex flex-col gap-4">
            <div class="flex flex-row gap-2">
                {$t("project.tabs.budget.optimal")}:
                <span>
                    <p class="font-bold">
                        {formatCurrency(
                            project.budget.optimum.money.amount,
                            project.budget.optimum.money.currency,
                            {
                                showSymbol: true,
                            },
                        )}
                    </p>
                </span>
            </div>
            <BudgetBar {project} budgetAmount={"optimum"} />
        </div>
    </div>
</div>
