<script lang="ts">
    import { onMount } from "svelte";
    import {
        Chart,
        LineController,
        LinearScale,
        CategoryScale,
        PointElement,
        LineElement,
        Filler,
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

    function formatAmount(amount: number | null | undefined): number {
        return +formatCurrency(amount ?? 0, balance.balance?.currency, { asLocaleString: false });
    }

    let received = formatAmount(balance.balance?.amount);
    let minimal = formatAmount(project.budget?.minimum?.money?.amount);
    let optimal = formatAmount(project.budget?.optimum?.money?.amount);

    let canvas: HTMLCanvasElement | null = null;
    let data = Array.isArray(balancePoints)
        ? balancePoints.map((point, i) => {
              return {
                  x: i,
                  y: formatAmount(point.balance.amount),
              };
          })
        : [];

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
            CategoryScale,
            PointElement,
            LineElement,
            Filler,
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
                datasets: [
                    {
                        data,
                        borderColor: "rgba(94, 234, 212, 1)",
                        backgroundColor: "rgba(94, 234, 212, 0.2)",
                        borderWidth: 1,
                        fill: "start",
                        pointRadius: 1,
                        tension: 0.25,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: "linear",
                        display: true,
                        beginAtZero: true,
                        max: data.length - 1,
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
                            title: (items) => {
                                // @ts-ignore
                                const point = balancePoints[items[0].dataIndex];

                                return new Date(point.start).toLocaleDateString();
                            },
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
