<script lang="ts">
    import BudgetBar from "./BudgetBar.svelte";
    import LegendBudgetBar from "./LegendBudgetBar.svelte";
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";
    import type { Project, AccountingBalance } from "../../openapi/client/index";

    let { project, accountingBalance } = $props<{
        project: Project;
        accountingBalance: AccountingBalance;
    }>();
</script>

<div class="flex flex-col gap-6 lg:flex-row">
    <div class="text-tertiary basis-1/3 text-[40px] leading-[1.1] font-bold">
        {$t("project.tabs.budget.chart-title")}
    </div>

    <div class="flex basis-2/3 flex-col gap-8 rounded-xl bg-[#f1efff] p-6">
        <div class="text-tertiary flex flex-col gap-4">
            <div class="flex flex-row gap-2">
                {$t("project.tabs.budget.minimum")}:
                <span>
                    <p class="font-bold">
                        {formatCurrency(
                            project.budget.minimum.money.amount,
                            project.budget.minimum.money.currency,
                        )}
                    </p>
                </span>
            </div>
            <BudgetBar {project} {accountingBalance} budgetAmount={"minimum"} />
        </div>

        <div class="text-tertiary flex flex-col gap-4">
            <div class="flex flex-row gap-2">
                {$t("project.tabs.budget.optimal")}:
                <span>
                    <p class="font-bold">
                        {formatCurrency(
                            project.budget.optimum.money.amount,
                            project.budget.optimum.money.currency,
                        )}
                    </p>
                </span>
            </div>
            <BudgetBar {project} {accountingBalance} budgetAmount={"optimum"} />
        </div>
        <LegendBudgetBar />
    </div>
</div>
