<script lang="ts">
    import type { Project, Accounting } from "../../openapi/client/index";
    import { onMount, tick } from "svelte";
    import { t } from "../../i18n/store";

    let {
        project,
        accounting,
    }: {
        project: Project;
        accounting: Accounting;
    } = $props();

    const typeBudget = {
        task: "var(--color-variant)",
        infrastructure: "var(--color-secondary)",
        material: "var(--color-tertiary)",
    } as const;

    const minimumTotal = project.budget?.minimum?.money?.amount ?? 0;
    const optimumTotal = project.budget?.optimum?.money?.amount ?? 0;
    const totalBudget = minimumTotal + optimumTotal;
    const balanceAmount = accounting.balance?.amount ?? 0;

    const minInfra = project.budget?.minimum?.infra?.amount ?? 0;
    const minMaterial = project.budget?.minimum?.material?.amount ?? 0;
    const minTask = project.budget?.minimum?.task?.amount ?? 0;

    const optInfra = project.budget?.optimum?.infra?.amount ?? 0;
    const optMaterial = project.budget?.optimum?.material?.amount ?? 0;
    const optTask = project.budget?.optimum?.task?.amount ?? 0;

    const dividerWidthPct = 1.5;

    const leftSectionWidth =
        totalBudget > 0 ? (minimumTotal / totalBudget) * 100 - dividerWidthPct / 2 : 0;
    const rightSectionWidth =
        totalBudget > 0 ? (optimumTotal / totalBudget) * 100 - dividerWidthPct / 2 : 0;
    const rightSectionStart = leftSectionWidth + dividerWidthPct;

    const minInfraPctLocal = minimumTotal > 0 ? (minInfra / minimumTotal) * 100 : 0;
    const minMaterialPctLocal =
        minimumTotal > 0 ? ((minInfra + minMaterial) / minimumTotal) * 100 : 0;
    const minTaskPctLocal = 100;

    const optInfraPctLocal = optimumTotal > 0 ? (optInfra / optimumTotal) * 100 : 0;
    const optMaterialPctLocal =
        optimumTotal > 0 ? ((optInfra + optMaterial) / optimumTotal) * 100 : 0;
    const optTaskPctLocal = 100;

    const balancePct = totalBudget > 0 ? Math.min((balanceAmount / totalBudget) * 100, 100) : 0;

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

    const formatAmount = (amount: number) => {
        return (amount / 100).toLocaleString("es-ES", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            useGrouping: true,
        });
    };
</script>

<div class="space-y-3">
    <div class="relative h-16 w-full">
        <div
            class="absolute transition-all duration-700 ease-out"
            style="left: {animValues.balance}%; top: 2rem;"
        >
            <div class="ml-4 flex items-center gap-2 text-sm font-medium">
                <span class="text-gray-600">
                    Vamos por <span class="text-base font-black"
                        >{formatAmount(balanceAmount)}€</span
                    >
                </span>
            </div>
        </div>

        <div
            class="absolute z-50 transition-all duration-700 ease-out"
            style="left: {animValues.balance}%; transform: translateX(-50%); top: 3rem;"
        >
            <div class="bg-secondary border-secondary h-7 border-r-2 border-solid"></div>
            <div class="h-16 border-r-2 border-solid border-white bg-white"></div>
            <div
                class="bg-secondary absolute top-0 right-0 h-3 w-3 translate-x-1/2 -translate-y-1/2 rounded-full"
            ></div>
        </div>
    </div>

    <div class="relative h-16 w-full">
        <div
            class="absolute top-0 left-0 h-full overflow-hidden rounded-xl"
            style="width: {leftSectionWidth}%;"
        >
            {#if minInfra > 0}
                <div
                    class="absolute top-0 left-0 z-30 h-full rounded-xl transition-all duration-700 ease-out"
                    style="width: {animValues.minInfra}%; background-color: {typeBudget.infrastructure};"
                ></div>
            {/if}

            {#if minMaterial > 0}
                <div
                    class="absolute top-0 left-0 z-20 h-full rounded-xl transition-all duration-700 ease-out"
                    style="width: {animValues.minMaterial}%; background-color: {typeBudget.material};"
                ></div>
            {/if}

            {#if minTask > 0}
                <div
                    class="absolute top-0 left-0 z-10 h-full rounded-xl transition-all duration-700 ease-out"
                    style="width: {animValues.minTask}%; background-color: {typeBudget.task};"
                ></div>
            {/if}
        </div>

        <div
            class="absolute top-0 bottom-0 z-40"
            style="left: {leftSectionWidth}%; width: {dividerWidthPct}%; background-color: var(--color-divider);"
        ></div>

        <div
            class="absolute top-0 h-full overflow-hidden rounded-xl"
            style="left: {rightSectionStart}%; width: {rightSectionWidth}%;"
        >
            {#if optInfra > 0}
                <div
                    class="absolute top-0 left-0 z-30 h-full rounded-xl transition-all duration-700 ease-out"
                    style="width: {animValues.optInfra}%; background-color: {typeBudget.infrastructure};"
                ></div>
            {/if}

            {#if optMaterial > 0}
                <div
                    class="absolute top-0 left-0 z-20 h-full rounded-xl transition-all duration-700 ease-out"
                    style="width: {animValues.optMaterial}%; background-color: {typeBudget.material};"
                ></div>
            {/if}

            {#if optTask > 0}
                <div
                    class="absolute top-0 left-0 z-10 h-full rounded-xl transition-all duration-700 ease-out"
                    style="width: {animValues.optTask}%; background-color: {typeBudget.task};"
                ></div>
            {/if}
        </div>
    </div>

    <div class="relative text-sm">
        <div class="absolute left-0" style="width: {leftSectionWidth}%">
            <span class="text-gray-600">{$t("project.tabs.budget.minimum")}:</span>
            <span class="text-base font-black">{formatAmount(minimumTotal)}€</span>
        </div>
        <div class="absolute" style="left: {rightSectionStart}%; width: {rightSectionWidth}%">
            <span class="text-gray-600">{$t("project.tabs.budget.optimal")}:</span>
            <span class="text-base font-black">{formatAmount(optimumTotal)}€</span>
        </div>
    </div>
</div>
