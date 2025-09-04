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
        AccountingBalance,
        ApiAccountingBalancePointsGetCollectionData,
        Project,
    } from "../../openapi/client/index";
    import { formatCurrency } from "../../utils/currencies";

    export let balance: AccountingBalance;
    export let project: Project;
    export let balancePoints: ApiAccountingBalancePointsGetCollectionData;

    let received = +formatCurrency(balance.balance?.amount ?? 0);
    let minimal = +formatCurrency(project.budget?.minimum?.money?.amount ?? 0);
    let optimal = +formatCurrency(project.budget?.optimum?.money?.amount ?? 0);

    let canvas: HTMLCanvasElement | null = null;
    let labels = Array.isArray(balancePoints)
        ? balancePoints.map((point, i) => {
              const date = new Date(point.start);
              return date.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
              });
          })
        : [];

    let progressData: number[] = [];
    for (const point of Array.isArray(balancePoints) ? balancePoints : []) {
        progressData.push(+formatCurrency(point.balance.amount));
    }

    let maxValue = minimal;

    if (received > minimal) {
        maxValue = optimal;
    }

    if (received > optimal) {
        maxValue = received;
    }

    maxValue = maxValue + maxValue / 20;

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
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = color;
                    ctx.setLineDash([2, 3]);
                    ctx.stroke();
                };

                drawLine(minimal, "text-black");
                drawLine(optimal, "text-black");

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
                        data: progressData,
                        borderColor: "rgba(94, 234, 212, 1)",
                        backgroundColor: "rgba(94, 234, 212, 0.2)",
                        borderWidth: 1,
                        fill: "start",
                        pointRadius: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                },
            },
        });
    });
</script>

<div class="relative h-[200px] w-full overflow-hidden rounded-lg bg-white">
    <canvas bind:this={canvas}></canvas>
</div>
