<script lang="ts">
    import {
        apiGatewaysGetCollection,
        type ApiGatewayChargesGetCollectionData,
    } from "../../openapi/client";
    import { onMount } from "svelte";
    import { t } from "../../i18n/store";
    import Categories from "./Categories.svelte";
    import ExportCsv from "./ExportCsv.svelte";
    import Filters from "./Filters.svelte";
    import FiltersTags from "./FiltersTags.svelte";
    import Slider from "./Slider.svelte";
    import Table from "./Table.svelte";

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
    let paymentMethodOptions = $state<[string, string][]>([]);
    let chargeStatusOptions = $state<[string, string][]>([]);
    let rangeAmountOptions = $state<[string, string][]>([]);

    function handleApplyFilters(newFilters: ApiGatewayChargesGetCollectionData["query"]) {
        filters = { ...filters, ...newFilters };
    }

    onMount(async () => {
        const { data: paymentGateways } = await apiGatewaysGetCollection();

        paymentMethodOptions = [
            ["all", $t("contributions.filters.paymentMethod.options.all")],
            ...(paymentGateways ?? []).map((g): [string, string] => [
                g.name!,
                $t(`contributions.filters.paymentMethod.options.${g.name}`),
            ]),
        ];

        chargeStatusOptions = Object.entries($t("contributions.filters.chargeStatus.options"));
        rangeAmountOptions = Object.entries($t("contributions.filters.rangeAmount.options")).sort(
            ([a], [b]) => {
                const parseMin = (val: string) =>
                    val.includes("..") ? parseInt(val.split("..")[0]) : parseInt(val);
                if (a === "all") return -1;
                if (b === "all") return 1;
                return parseMin(a) - parseMin(b);
            },
        );

        console.log(paymentMethodOptions);
    });
</script>

<div class="flex flex-col gap-10">
    <Filters
        {filters}
        {paymentMethodOptions}
        {chargeStatusOptions}
        {rangeAmountOptions}
        onApplyFilters={handleApplyFilters}
    />
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
