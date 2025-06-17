<script lang="ts">
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";

    let canvas: HTMLCanvasElement;

    onMount(() => {
        new Chart(canvas, {
            type: "bar",
            data: {
                labels: ["Mínimo: 100.000€", "Óptimo: 150.000€"],
                datasets: [
                    {
                        label: "Infraestructura",
                        data: [40, 60],
                        backgroundColor: "#462949",
                        stack: "stack-0",
                        borderRadius: 8,
                    },
                    {
                        label: "Material",
                        data: [30, 40],
                        backgroundColor: "#E94668",
                        stack: "stack-0",
                        borderRadius: 8,
                    },
                    {
                        label: "Tarea",
                        data: [30, 50],
                        backgroundColor: "#99FFCC",
                        stack: "stack-0",
                        borderRadius: 8,
                    },
                ],
            },
            options: {
                indexAxis: "y",
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            usePointStyle: true,
                        },
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
                        max: 150,
                        grid: {
                            display: false,
                        },
                        ticks: {
                            display: false,
                        },
                        border: {
                            display: false,
                        },
                    },
                    y: {
                        stacked: true,
                        grid: {
                            display: false,
                        },
                        ticks: {
                            display: false,
                        },
                        border: {
                            display: false,
                        },
                    },
                },
            },
        });
    });
</script>

<canvas bind:this={canvas}></canvas>
