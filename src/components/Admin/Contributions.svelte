<script lang="ts">
    import Slider from "./Slider.svelte";
    import Filters from "./Filters.svelte";
    import Table from "./Table.svelte";
    import Categories from "./Categories.svelte";
    import FiltersTags from "./FiltersTags.svelte";
    import { t } from "../../i18n/store";
    import ExportCsv from "./ExportCsv.svelte";
    import type { ApiGatewayChargesGetCollectionData } from "../../openapi/client";

    /* TODO: Add data to slider and set locales */
    const slides = [
        { title: "Total aportes:", amount: "250,95€" },
        { title: "Total Tips:", amount: "250,96€" },
        { title: "Total comisiones:", amount: "250,97€" },
        { title: "Pasar a operativa:", amount: "250,98€" },
        { title: "Slide 5", amount: "250,99€" },
    ];

    let filters: ApiGatewayChargesGetCollectionData["query"] = $state({});

    function handleApplyFilters(newFilters: ApiGatewayChargesGetCollectionData["query"]) {
        filters = { ...filters, ...newFilters };
    }
</script>

<div>
    <Filters {filters} onApplyFilters={handleApplyFilters} currentTarget={filters?.target} />
    <div>
        <div>
            <FiltersTags onCloseFilter={handleApplyFilters} title={$t("admin.charges.lastContributions")} {filters} />
            <!-- TODO: Move "Export .csv" button to this component (from Filters.svelte) -->
            <ExportCsv />
        </div>
        <!-- TODO: Implement Categories component -->
        <Categories />
        <Slider {slides} />
    </div>
</div>
<Table {filters} />
