<script>
    import Slider from "./Slider.svelte";
    import Filters from "./Filters.svelte";
    import Table from "./Table.svelte";

    /* TODO: Add data to slider and set locales */
    const slides = [
        { title: "Total aportes:", amount: "250,95€" },
        { title: "Total Tips:", amount: "250,96€" },
        { title: "Total comisiones:", amount: "250,97€" },
        { title: "Pasar a operativa:", amount: "250,98€" },
        { title: "Slide 5", amount: "250,99€" },
    ];

    let filters = $state({ paymentMethod: "", chargeStatus: "", rangeAmount: "" });
    function applyFilters(newFilters) {
        filters = { ...filters, ...newFilters };
    }

    $inspect(filters);
</script>

<Slider {slides} />
<Filters onApplyFilters={applyFilters} />
<Table {filters} />
