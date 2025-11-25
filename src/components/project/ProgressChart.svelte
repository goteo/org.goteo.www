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
        Accounting,
        ApiAccountingBalancePointsGetCollectionData,
        Project,
    } from "../../openapi/client/index";
    import { formatCurrency } from "../../utils/currencies";
    import { t } from "../../i18n/store";

    export let accounting: Accounting;
    export let project: Project;
    export let balancePoints: ApiAccountingBalancePointsGetCollectionData;

    function formatAmount(amount: number | null | undefined): number {
        return +formatCurrency(amount ?? 0, accounting.balance?.currency, {
            asLocaleString: false,
        });
    }

    let received = formatAmount(accounting.balance?.amount);
    let minimal = formatAmount(project.budget?.minimum?.money?.amount);
    let optimal = formatAmount(project.budget?.optimum?.money?.amount);

    let canvas: HTMLCanvasElement | null = null;
    const marginDays = 4;

    let data: { x: number; y: number }[] = [];
    let sortedBalancePoints: any[] = [];
    let firstDateMs: number | null = null;
    let lastDay = 0;

    if (Array.isArray(balancePoints) && balancePoints.length > 0) {
        sortedBalancePoints = [...balancePoints].sort(
            (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
        );

        firstDateMs = new Date(sortedBalancePoints[0].start).getTime();

        data = sortedBalancePoints.map((point) => {
            const pointMs = new Date(point.start).getTime();
            const daysSinceFirst = Math.round((pointMs - firstDateMs!) / 86400000);
            return { x: daysSinceFirst + marginDays, y: formatAmount(point.balance.amount) };
        });

        const lastDateMs = new Date(
            sortedBalancePoints[sortedBalancePoints.length - 1].start,
        ).getTime();
        lastDay = Math.round((lastDateMs - firstDateMs) / 86400000) + marginDays;

        for (let i = marginDays - 1; i >= 0; i--) {
            data.unshift({ x: i, y: 0 });
        }
    } else {
        for (let i = marginDays - 1; i >= 0; i--) {
            data.unshift({ x: i, y: 0 });
        }
        firstDateMs = null;
        lastDay = marginDays;
    }

    let maxValue = Math.max(minimal, optimal, received) * 1.05;

    const hasSecondRound = project.deadline == "optimum";

    let secondRoundStartDay = -1;
    if (hasSecondRound && firstDateMs !== null) {
        const minimumDate = new Date(project.calendar!.minimum!).getTime();
        const diffDays = Math.round((minimumDate - firstDateMs) / 86400000);
        if (diffDays >= 0) {
            secondRoundStartDay = diffDays + marginDays;
        }
    }

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
            id: "guidelines",
            afterDatasetDraw(chart) {
                const {
                    ctx,
                    chartArea: { top, left, right, bottom },
                    scales: { y, x },
                } = chart;
                ctx.save();

                const drawHorizontal = (value: any) => {
                    const yPos = y.getPixelForValue(value);
                    ctx.beginPath();
                    ctx.moveTo(left, yPos);
                    ctx.lineTo(right, yPos);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "#000";
                    ctx.setLineDash([2, 3]);
                    ctx.stroke();
                };

                drawHorizontal(minimal);
                drawHorizontal(optimal);

                if (hasSecondRound && secondRoundStartDay !== -1) {
                    const xPos = x.getPixelForValue(secondRoundStartDay);
                    const color = "#462949";

                    const badgeWidth = 76;
                    const badgeHeight = 26;
                    const badgeY = top + 8;
                    const badgeX = xPos - badgeWidth / 2;

                    ctx.fillStyle = color;
                    if (typeof ctx.roundRect === "function") {
                        ctx.beginPath();
                        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 6);
                        ctx.fill();
                    } else {
                        ctx.beginPath();
                        ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
                    }

                    ctx.font = "12px sans-serif";
                    ctx.fillStyle = "#fff";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText($t("budget.chart.secondRound"), xPos, badgeY + badgeHeight / 2);

                    const lineStartY = badgeY + badgeHeight + 4;
                    ctx.beginPath();
                    ctx.moveTo(xPos, lineStartY);
                    ctx.lineTo(xPos, bottom);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = color;
                    ctx.setLineDash([]);
                    ctx.stroke();

                    const pointY = lineStartY + 4;
                    ctx.beginPath();
                    ctx.arc(xPos, pointY, 4, 0, 2 * Math.PI);
                    ctx.fillStyle = color;
                    ctx.fill();
                }

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
                        borderColor: "#59E9D3",
                        backgroundColor: "#59E9D3",
                        borderWidth: 1,
                        fill: "start",
                        tension: 0.25,
                        pointRadius: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: "linear",
                        display: false,
                        beginAtZero: true,
                        min: 0,
                        max:
                            hasSecondRound && secondRoundStartDay > lastDay
                                ? secondRoundStartDay + 5
                                : lastDay,
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
                                const dataIndex = items[0].dataIndex;
                                const bpIndex = dataIndex - marginDays;
                                const point = sortedBalancePoints[bpIndex];
                                return point
                                    ? new Date(point.start).toLocaleDateString()
                                    : $t("budget.chart.start");
                            },
                        },
                    },
                },
            },
        });
    });
</script>

<div class="relative h-full w-full overflow-hidden rounded-3xl border border-gray-100 bg-white">
    <canvas bind:this={canvas} class="h-full w-full"></canvas>
</div>
