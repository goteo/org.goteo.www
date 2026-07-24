<script lang="ts">
    import { onMount, tick } from "svelte";

    import { t } from "../../i18n/store";
    import { budgetTypeColors } from "../../utils/budgetColors";
    import { formatCurrency } from "../../utils/currencies";

    import type { Money, Project, Accounting } from "../../openapi/client/index";

    let {
        project,
        accounting,
    }: {
        project: Project;
        accounting: Accounting;
    } = $props();

    const minimumMoney: Money | undefined = $derived(project.budget?.minimum?.money);
    const optimumMoney: Money | undefined = $derived(project.budget?.optimum?.money);
    const balanceMoney: Money | undefined = $derived(accounting.balance);

    const minimumTotal = $derived(minimumMoney?.amount ?? 0);
    const optimumTotal = $derived(optimumMoney?.amount ?? 0);
    const totalBudget = $derived(minimumTotal + optimumTotal);
    const balanceAmount = $derived(balanceMoney?.amount ?? 0);

    const minInfraMoney: Money | undefined = $derived(project.budget?.minimum?.infra);
    const minMaterialMoney: Money | undefined = $derived(project.budget?.minimum?.material);
    const minTaskMoney: Money | undefined = $derived(project.budget?.minimum?.task);

    const optInfraMoney: Money | undefined = $derived(project.budget?.optimum?.infra);
    const optMaterialMoney: Money | undefined = $derived(project.budget?.optimum?.material);
    const optTaskMoney: Money | undefined = $derived(project.budget?.optimum?.task);

    const minInfra = $derived(minInfraMoney?.amount ?? 0);
    const minMaterial = $derived(minMaterialMoney?.amount ?? 0);
    const minTask = $derived(minTaskMoney?.amount ?? 0);

    const optInfra = $derived(optInfraMoney?.amount ?? 0);
    const optMaterial = $derived(optMaterialMoney?.amount ?? 0);
    const optTask = $derived(optTaskMoney?.amount ?? 0);

    const dividerWidthPct = 1.5;

    const leftSectionWidth = $derived(
        Math.round(totalBudget > 0 ? (minimumTotal / totalBudget) * 100 - dividerWidthPct / 2 : 0),
    );
    const rightSectionWidth = $derived(
        Math.round(totalBudget > 0 ? (optimumTotal / totalBudget) * 100 - dividerWidthPct / 2 : 0),
    );
    const rightSectionStart = $derived(leftSectionWidth + dividerWidthPct);

    const minInfraPctLocal = $derived(minimumTotal > 0 ? (minInfra / minimumTotal) * 100 : 0);
    const minMaterialPctLocal = $derived(
        minimumTotal > 0 ? ((minInfra + minMaterial) / minimumTotal) * 100 : 0,
    );
    const minTaskPctLocal = 100;

    const optInfraPctLocal = $derived(optimumTotal > 0 ? (optInfra / optimumTotal) * 100 : 0);
    const optMaterialPctLocal = $derived(
        optimumTotal > 0 ? ((optInfra + optMaterial) / optimumTotal) * 100 : 0,
    );
    const optTaskPctLocal = 100;

    const balancePct = $derived(
        totalBudget > 0 ? Math.min((balanceAmount / totalBudget) * 100, 100) : 0,
    );
    const flipLabel = $derived(balancePct > 60);

    let animValues = $state({
        minInfra: 0,
        minMaterial: 0,
        minTask: 0,
        optInfra: 0,
        optMaterial: 0,
        optTask: 0,
        balance: 0,
    });

    onMount(async () => {
        await tick();
        animValues = {
            minInfra: minInfraPctLocal,
            minMaterial: minMaterialPctLocal,
            minTask: minTaskPctLocal,
            optInfra: optInfraPctLocal,
            optMaterial: optMaterialPctLocal,
            optTask: optTaskPctLocal,
            balance: balancePct,
        };
    });
</script>

<div class="space-y-3">
    <div class="relative h-8 w-full">
        <div
            class="absolute transition-all duration-700 ease-out"
            style="left: {animValues.balance}%; {flipLabel
                ? 'transform: translateX(-100%);'
                : ''}; top: -0.15rem;"
        >
            <div
                class="text-secondary flex items-center gap-2 text-base {flipLabel
                    ? 'mr-4'
                    : 'ml-4'}"
            >
                <span>{$t("pages.project.view.tabs.budget.raised")}:</span>
                <span class="font-bold">{formatCurrency(balanceMoney)}</span>
            </div>
        </div>

        <div
            class="absolute z-50 flex flex-col items-center transition-all duration-700 ease-out"
            style="left: {animValues.balance}%; transform: translateX(-50%); top: 0.25rem;"
        >
            <div class="bg-secondary h-3 w-3 rounded-full"></div>
            <div class="bg-secondary h-7 w-0.5"></div>
            <div class="h-12 w-0.5 bg-white"></div>
        </div>
    </div>

    <div class="relative h-12 w-full">
        <div
            class="absolute top-0 left-0 h-full overflow-hidden rounded-xl"
            style="width: {leftSectionWidth}%;"
        >
            {#if minInfra > 0}
                <div
                    class="absolute top-0 left-0 z-30 h-full rounded-xl transition-all duration-700 ease-out"
                    style="width: {animValues.minInfra}%; background-color: {budgetTypeColors.infrastructure};"
                ></div>
            {/if}

            {#if minMaterial > 0}
                <div
                    class="absolute top-0 left-0 z-20 h-full rounded-xl transition-all duration-700 ease-out"
                    style="width: {animValues.minMaterial}%; background-color: {budgetTypeColors.material};"
                ></div>
            {/if}

            {#if minTask > 0}
                <div
                    class="absolute top-0 left-0 z-10 h-full rounded-xl transition-all duration-700 ease-out"
                    style="width: {animValues.minTask}%; background-color: {budgetTypeColors.task};"
                ></div>
            {/if}
        </div>

        <div
            class="absolute top-0 bottom-0 z-40"
            style="left: {leftSectionWidth}%; width: {dividerWidthPct}%;"
        ></div>

        <div
            class="absolute top-0 h-full overflow-hidden rounded-xl"
            style="left: {rightSectionStart}%; width: {rightSectionWidth}%;"
        >
            {#if optInfra > 0}
                <div
                    class="absolute top-0 left-0 z-30 h-full rounded-xl transition-all duration-700 ease-out"
                    style="width: {animValues.optInfra}%; background-color: {budgetTypeColors.infrastructure};"
                ></div>
            {/if}

            {#if optMaterial > 0}
                <div
                    class="absolute top-0 left-0 z-20 h-full rounded-xl transition-all duration-700 ease-out"
                    style="width: {animValues.optMaterial}%; background-color: {budgetTypeColors.material};"
                ></div>
            {/if}

            {#if optTask > 0}
                <div
                    class="absolute top-0 left-0 z-10 h-full rounded-xl transition-all duration-700 ease-out"
                    style="width: {animValues.optTask}%; background-color: {budgetTypeColors.task};"
                ></div>
            {/if}
        </div>
    </div>

    <div class="flex gap-2">
        <div class="text-secondary min-w-fit text-base" style="width: {leftSectionWidth}%">
            <span>{$t("pages.project.view.tabs.budget.minimum")}:</span>
            <span class="font-bold">{formatCurrency(minimumMoney)}</span>
        </div>
        <div class="text-secondary flex-none text-base">
            <span>{$t("pages.project.view.tabs.budget.optimal")}:</span>
            <span class="font-bold">{formatCurrency(optimumMoney)}</span>
        </div>
    </div>
</div>
