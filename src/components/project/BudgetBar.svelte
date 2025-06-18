<script lang="ts">
    import type { Project } from "../../openapi/client/index";
    import { onMount, tick } from "svelte";

    let { project, budgetAmount } = $props<{
        project: Project;
        budgetAmount: "minimum" | "optimum";
    }>();

    const optimumTotal = project.budget.optimum.money.amount;

    const amountTask = project.budget[budgetAmount].task.amount;
    const amountMaterial = project.budget[budgetAmount].material.amount;
    const amountInfra = project.budget[budgetAmount].infra.amount;

    let widthInfra = $state(0);
    let widthMaterial = $state(0);
    let widthTask = $state(0);

    const pctInfra = (amountInfra / optimumTotal) * 100;
    const pctMaterial = (amountMaterial / optimumTotal) * 100;
    const pctTask = (amountTask / optimumTotal) * 100;

    onMount(async () => {
        await tick();
        widthInfra = pctInfra;
        widthMaterial = pctInfra + pctMaterial;
        widthTask = pctInfra + pctMaterial + pctTask;
    });
</script>

<div class="relative h-12 w-full">
    <div
        class="absolute top-0 left-0 z-30 h-full rounded-lg bg-[#462949] transition-all duration-700 ease-out"
        style="width: {widthInfra}%"
    ></div>
    <div
        class="absolute top-0 left-0 z-20 h-full rounded-lg bg-[#E94668] transition-all duration-700 ease-out"
        style="width: {widthMaterial}%"
    ></div>
    <div
        class="absolute top-0 left-0 z-10 h-full rounded-lg bg-[#99FFCC] transition-all duration-700 ease-out"
        style="width: {widthTask}%"
    ></div>
</div>
