<script lang="ts">
    import type { Project, ProjectBudgetItem, Accounting } from "../../openapi/client/index";
    import { onMount, tick } from "svelte";

    let { project, budgetAmount, accounting } = $props<{
        project: Project;
        accounting: Accounting;
        budgetAmount: "minimum" | "optimum";
    }>();

    const typeBudget: Record<ProjectBudgetItem["type"], string> = {
        task: "#99FFCC",
        infrastructure: "#462949",
        material: "#E94668",
    };

    const optimumTotal = project.budget.optimum.money.amount;

    const amountTask = project.budget[budgetAmount].task.amount;
    const amountMaterial = project.budget[budgetAmount].material.amount;
    const amountInfra = project.budget[budgetAmount].infra.amount;
    const balanceAmount = accounting.balance.amount;

    let widthInfra = $state(0);
    let widthMaterial = $state(0);
    let widthTask = $state(0);

    const pctInfra = (amountInfra / optimumTotal) * 100;
    const pctMaterial = (amountMaterial / optimumTotal) * 100;
    const pctTask = (amountTask / optimumTotal) * 100;
    const pctBalance = Math.min((balanceAmount / optimumTotal) * 100, 100);

    onMount(async () => {
        await tick();
        widthInfra = Math.min(pctInfra, 100);
        widthMaterial = Math.min(pctInfra + pctMaterial, 100);
        widthTask = Math.min(pctInfra + pctMaterial + pctTask, 100);
    });
</script>

<div class="relative h-12 w-full">
    <div
        class="absolute top-0 left-0 z-30 h-full rounded-lg transition-all duration-700 ease-out"
        style="width: {widthInfra}%; background-color: {typeBudget.infrastructure};"
    ></div>
    <div
        class="absolute top-0 left-0 z-20 h-full rounded-lg transition-all duration-700 ease-out"
        style="width: {widthMaterial}%; background-color: {typeBudget.material};"
    ></div>
    <div
        class="absolute top-0 left-0 z-10 h-full rounded-lg transition-all duration-700 ease-out"
        style="width: {widthTask}%; background-color: {typeBudget.task};"
    ></div>
    <div
        class="absolute left-0 z-40 h-15"
        class:top-0={budgetAmount !== "optimum"}
        class:bottom-0={budgetAmount === "optimum"}
        style="width: {pctBalance}%;"
    >
        <div class="h-full w-full border-r border-dashed border-r-white"></div>

        <span
            class="bg-tertiary absolute right-0 h-2 w-2 translate-x-1/2 rounded-full"
            class:top-0={budgetAmount === "optimum"}
            class:bottom-0={budgetAmount !== "optimum"}
        ></span>
    </div>
</div>
