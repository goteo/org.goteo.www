<script lang="ts">
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
    import { formatCurrency } from "../../utils/currencies";

    let canvas: HTMLCanvasElement;

    import type { Project } from "../../openapi/client/index";

    let { project } = $props<{
        project: Project;
    }>();

    const amountMinimum = formatCurrency(
        project.budget.minimum.money.amount,
        project.budget.minimum.money.currency,
    );

    const amountOptimum = formatCurrency(
        project.budget.optimum.money.amount,
        project.budget.optimum.money.currency,
    );

    const amountTask = formatCurrency(
        project.budget.minimum.task.amount,
        project.budget.minimum.task.currency,
    );

    const amountMaterial = formatCurrency(
        project.budget.minimum.material.amount,
        project.budget.minimum.material.currency,
    );

    const amountInfra = formatCurrency(
        project.budget.minimum.infra.amount,
        project.budget.minimum.infra.currency,
    );

    onMount(() => {
        new Chart(canvas, {
            type: "bar",
            data: {
                labels: [""],
                datasets: [
                    {
                        label: "Infraestructura",
                        data: [amountInfra],
                        backgroundColor: "#462949",
                        stack: "stack-0",
                        borderRadius: 8,
                    },
                    {
                        label: "Material",
                        data: [amountMaterial],
                        backgroundColor: "#E94668",
                        stack: "stack-0",
                        borderRadius: 8,
                    },
                    {
                        label: "Tarea",
                        data: [amountTask],
                        backgroundColor: "#99FFCC",
                        stack: "stack-0",
                        borderRadius: 8,
                    },
                ],
            },
            options: {
                maintainAspectRatio: false,
                indexAxis: "y",
                responsive: true,
                layout: {
                    padding: 0,
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        mode: "nearest",
                        intersect: false,
                    },
                },
                scales: {
                    x: {
                        stacked: true,
                        beginAtZero: true,
                        max: amountOptimum,
                        // grid: {
                        //     display: false,
                        // },
                        // ticks: {
                        //     display: false,
                        // },
                        // border: {
                        //     display: false,
                        // },
                    },
                    y: {
                        stacked: true,
                        // grid: {
                        //     display: false,
                        // },
                        // ticks: {
                        //     display: false,
                        // },
                        // border: {
                        //     display: false,
                        // },
                    },
                },
            },
        });
    });
</script>

<div class="relative h-[100px] w-full overflow-hidden rounded-lg">
    <canvas bind:this={canvas}></canvas>
</div>
