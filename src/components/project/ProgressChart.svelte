<script>
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

    export let obtenido = 4000000; // Monto obtenido (puede superar el óptimo)
    export let optimo = 999999; // Meta óptima
    export let minimo = 500000; // Meta mínima
    export let diasTotales = 10; // Número de días

    let canvas;

    // Generar etiquetas para el número de días
    let dias = Array.from({ length: diasTotales }, (_, i) => `Día ${i + 1}`);

    // Calcular progresión acumulativa hasta `obtenido`
    let incrementoDiario = obtenido / diasTotales;
    let dataPoints = dias.map((_, i) => ((incrementoDiario * (i + 1)) / optimo) * 100);

    // Determinar si se supera el óptimo
    let extra = obtenido > optimo ? (obtenido / optimo) * 100 : null;

    // Calcular valores de referencia
    let minValue = Math.round((minimo / optimo) * 100);
    let optimoValue = 100;
    let maxValue = extra ? extra : optimoValue; // Ajustar máximo en el eje Y, pero sin eliminar mínimo

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

        new Chart(canvas, {
            type: "line",
            data: {
                labels: dias,
                datasets: [
                    {
                        label: "Progreso acumulativo",
                        data: dataPoints,
                        borderColor: "rgba(94, 234, 212, 1)",
                        backgroundColor: "rgba(94, 234, 212, 0.2)",
                        borderWidth: 2,
                        fill: "start",
                        tension: 0.4,
                        pointRadius: 3,
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
                        title: {
                            display: false,
                            text: "Días",
                        },
                        grid: {
                            display: false,
                        },
                    },
                    y: {
                        display: false,
                        title: {
                            display: false,
                            text: "Progreso",
                        },
                        min: 0,
                        max: maxValue, // Ajusta dinámicamente si se pasa el óptimo
                        ticks: {
                            callback: function (value) {
                                const roundedValue = Math.round(value);
                                if (roundedValue === 0) return "0";
                                if (roundedValue === minValue) return `Mínimo (${minimo})`;
                                if (roundedValue === optimoValue) return `Óptimo (${optimo})`;
                                if (extra && roundedValue === Math.round(extra))
                                    return `Extra (${obtenido})`;
                                return "";
                            },
                        },
                        grid: {
                            drawTicks: true,
                            drawBorder: false,
                            color: function (context) {
                                const roundedValue = Math.round(context.tick.value);
                                if (
                                    roundedValue === 0 ||
                                    roundedValue === minValue ||
                                    roundedValue === optimoValue ||
                                    (extra && roundedValue === Math.round(extra))
                                ) {
                                    return "rgba(0, 0, 0, 0.3)"; // Líneas dashed para los valores clave
                                }
                                return "rgba(0, 0, 0, 0)";
                            },
                            borderDash: function (context) {
                                const roundedValue = Math.round(context.tick.value);
                                if (
                                    roundedValue === 0 ||
                                    roundedValue === minValue ||
                                    roundedValue === optimoValue ||
                                    (extra && roundedValue === Math.round(extra))
                                ) {
                                    return [5, 5]; // Línea dashed
                                }
                                return [];
                            },
                        },
                    },
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (tooltipItem) => `${tooltipItem.raw.toFixed(2)}%`,
                        },
                    },
                },
                elements: {
                    line: {
                        borderWidth: 2,
                    },
                },
            },
        });
    });
</script>

<div class="chart-container">
    <canvas bind:this={canvas}></canvas>
</div>

<style>
    .chart-container {
        width: 100%;
        height: 200px;
        position: relative;
        border-radius: 10px;
        overflow: hidden;
        background: white;
    }
</style>
