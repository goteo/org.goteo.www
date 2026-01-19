<script lang="ts">
    import Slider from "./Slider.svelte";
    import Filters from "./Filters.svelte";
    import Table from "./Table.svelte";
    import Categories from "./Categories.svelte";
    import FiltersTags from "./FiltersTags.svelte";
    import { t } from "../../i18n/store";
    import ExportCsv from "./ExportCsv.svelte";
    import type { ApiGatewayChargesGetCollectionData } from "../../openapi/client";
    
    const slides = [
        { title: $t("admin.projects.totalizers.selectedCampaigns"), amount: "432" },
        { title: $t("admin.charges.totalizers.totalCharges"), amount: "250,98€" },
        { title: $t("admin.charges.totalizers.totalTips"), amount: "250,96€" },
        { title: $t("admin.charges.totalizers.totalFees"), amount: "250,97€" },
    ];

    const categories = [
        { title: "Donaciones", amount: 125050 },
        { title: "Recurrentes", amount: 98075 },
        { title: "Tips", amount: 43020 },
        { title: "Comisiones", amount: 15000 },
    ];

    let filters: ApiGatewayChargesGetCollectionData["query"] = $state({});

    function handleApplyFilters(newFilters: ApiGatewayChargesGetCollectionData["query"]) {
        filters = { ...filters, ...newFilters };
    }
</script>

<div class="flex flex-col gap-10">
    <Filters {filters} onApplyFilters={handleApplyFilters} />
    <div class="flex flex-col">
        <div class="mb-8 flex justify-between">
            <FiltersTags
                onCloseFilter={handleApplyFilters}
                title={$t("admin.charges.lastContributions")}
                {filters}
            />
            <ExportCsv {filters} />
        </div>
        <Categories {categories} />
        <Slider {slides} />
    </div>
</div>
<Table {filters} />
