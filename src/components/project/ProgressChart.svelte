<script lang="ts">
    import { onMount } from "svelte";
    import {
        Chart,
        LineController,
        LinearScale,
        PointElement,
        LineElement,
        Filler,
        CategoryScale,
        Tooltip,
    } from "chart.js";
    import type {
        Accounting,
        ApiAccountingBalancePointsGetCollectionData,
        Project,
    } from "../../openapi/client/index";

    export let accounting: Accounting;
    export let project: Project;
    export let balancePoints: ApiAccountingBalancePointsGetCollectionData;

    let received = accounting.balance?.amount ?? 0;
    let optimal = project.budget?.optimum?.money?.amount ?? 0;

    let canvas: HTMLCanvasElement | null = null;
    let labels = Array.isArray(balancePoints)
        ? balancePoints.map((point, i) => {
              const date = new Date(point.start);
              return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
          })
        : [];

    let progressData: number[] = [];
    let cumulative = 0;

    for (const point of Array.isArray(balancePoints) ? balancePoints : []) {
        cumulative += point.balance.amount;
        const percentage = optimal ? (cumulative / optimal) * 100 : 0;
        progressData.push(percentage);
    }

    let extraPercentage = received > optimal ? (received / optimal) * 100 : null;
    let optimalValue = 100;
    let maxValue = extraPercentage ?? optimalValue;
    let y25 = Math.round(maxValue * 0.25);
    let y75 = Math.round(maxValue * 0.75);

    onMount(() => {
        Chart.register(
            LineController,
            LinearScale,
            PointElement,
            LineElement,
            Filler,
            CategoryScale,
            Tooltip,
        );

        Chart.register({
            id: "twoSectionLines",
            beforeDraw(chart) {
                const {
                    ctx,
                    chartArea: { left, right },
                    scales: { y },
                } = chart;
                ctx.save();

                const drawLine = (value: number, color: string) => {
                    const yPos = y.getPixelForValue(value);
                    ctx.beginPath();
                    ctx.moveTo(left, yPos);
                    ctx.lineTo(right, yPos);
                    ctx.lineWidth = 0.25;
                    ctx.strokeStyle = color;
                    ctx.setLineDash([1, 4]);
                    ctx.stroke();
                };

                drawLine(y25, "text-black");
                drawLine(y75, "text-black");

                ctx.restore();
            },
        });

        if (!canvas) return;

        new Chart(canvas, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "Cumulative progress",
                        data: progressData,
                        borderColor: "rgba(94, 234, 212, 1)",
                        backgroundColor: "rgba(94, 234, 212, 0.2)",
                        borderWidth: 1,
                        fill: "start",
                        tension: 0.4,
                        pointRadius: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: 10,
                },
                scales: {
                    x: {
                        display: false,
                        grid: { display: false },
                    },
                    y: {
                        display: false,
                        min: 0,
                        max: maxValue,
                    },
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (tooltipItem) => `${(tooltipItem.raw as number).toFixed(2)}%`,
                        },
                    },
                },
            },
        });
    });
</script>

<div class="relative h-[200px] w-full overflow-hidden rounded-lg bg-white">
    <canvas bind:this={canvas}></canvas>
</div>
