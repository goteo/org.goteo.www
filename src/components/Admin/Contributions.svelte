<script lang="ts">
    import {
        apiGatewaysGetCollection,
        type Accounting,
        type ApiGatewayChargesGetCollectionData,
        type GatewayCharge,
        type GatewayCheckout,
        type Project,
        type Tipjar,
        type User,
    } from "../../openapi/client/index.ts";
    import { onMount } from "svelte";
    import { t } from "../../i18n/store";
    import Categories from "./Categories.svelte";
    import ExportCsv from "./ExportCsv.svelte";
    import Filters from "./Filters.svelte";
    import FiltersTags from "./FiltersTags.svelte";
    import Slider from "./Slider.svelte";
    import Table, { type ExtendedCharge } from "./Table.svelte";
    import { apiGatewayChargesGetCollectionUrl } from "../../openapi/client/paths.gen";
    import { client } from "../../openapi/client/client.gen";
    import { fetchCheckout, fetchWithPersistentCache } from "../../utils/cachedFetch";
    import { extractId } from "../../utils/extractId";

    type GatewayChargesCollection<T> = {
        member: T[];
        totalItems: number;
    };

    const slides = [
        { title: $t("admin.projects.totalizers.selectedCampaigns"), amount: "432" },
        { title: $t("admin.charges.totalizers.totalCharges"), amount: "250,98€" },
        { title: $t("admin.charges.totalizers.totalTips"), amount: "250,96€" },
        { title: $t("admin.charges.totalizers.totalFees"), amount: "250,97€" },
    ];

    let filters: ApiGatewayChargesGetCollectionData["query"] = $state({});

    let paymentMethodOptions = $state<[string, string][]>([]);
    let chargeStatusOptions = $state<[string, string][]>([]);
    let rangeAmountOptions = $state<[string, string][]>([]);

    let charges = $state<ExtendedCharge[]>([]);
    let isLoading = $state(false);
    let isFirstLoad = $state(true);
    let currentPage = $state(1);
    let itemsPerPage = $state(25);
    let totalItems = $state(0);

    function getAccessToken(): string | null {
        const match = document.cookie.match(/(?:^|;\s*)access-token=([^;]*)/);
        if (!match) return null;

        try {
            const decoded = decodeURIComponent(match[1]);
            const parsed = JSON.parse(decoded);
            return parsed?.token ?? null;
        } catch {
            return null;
        }
    }

    const API_CACHE_NAME = "charges-cache";

    async function loadCharges(filters: ApiGatewayChargesGetCollectionData["query"]) {
        let chargesArr: ExtendedCharge[] = [];
        isLoading = true;

        try {
            const token = getAccessToken();
            if (!token) return;

            const query = {
                ...filters,
                page: currentPage,
                itemsPerPage: Number(itemsPerPage),
            };

            const collection = await fetchWithPersistentCache<
                GatewayChargesCollection<GatewayCharge>
            >(
                client.buildUrl({
                    url: apiGatewayChargesGetCollectionUrl,
                    query,
                }),
                token,
                API_CACHE_NAME,
            );

            const loadedCharges = collection.member ?? [];
            totalItems = collection.totalItems ?? 0;

            const checkouts: Map<string, GatewayCheckout | undefined> = new Map();
            const accountings: Map<string, Accounting> = new Map<string, Accounting>();
            const owners: Map<string, User | Project | Tipjar> = new Map();

            for (const charge of loadedCharges) {
                const checkoutIri = charge.checkout;
                const targetAccountingIri = charge.target;

                if (checkoutIri && !checkouts.has(checkoutIri)) {
                    checkouts.set(
                        checkoutIri,
                        await Promise.resolve(fetchCheckout(checkoutIri, token, API_CACHE_NAME)),
                    );

                    const originAccountingIri = checkouts.get(checkoutIri)?.origin;

                    if (originAccountingIri && !accountings.has(originAccountingIri)) {
                        await preloadAccountingData(
                            originAccountingIri,
                            token,
                            accountings,
                            owners,
                        );
                    }
                }

                if (targetAccountingIri && !accountings.has(targetAccountingIri)) {
                    await preloadAccountingData(targetAccountingIri, token, accountings, owners);
                }
            }

            let hasConcept = false;

            chargesArr = loadedCharges.map((charge): ExtendedCharge => {
                const checkout = checkouts.get(charge.checkout ?? "");
                const targetAcc = accountings.get(charge.target ?? "") as Accounting | undefined;
                const originAcc = accountings.get(checkout?.origin ?? "") as Accounting | undefined;

                const targetName = getDisplayNameFromAccounting(targetAcc, owners);
                const originName = getDisplayNameFromAccounting(originAcc, owners);

                hasConcept = false;

                if (targetName === originName) hasConcept = true;

                return {
                    ...charge,
                    targetDisplayName: typeof targetName === "undefined" ? "—" : targetName,
                    originDisplayName: typeof originName === "undefined" ? "—" : originName,
                    paymentMethod: extractId(checkout?.gateway) ?? "—",
                    refundToWallet: checkout?.refund
                        ? $t(`contributions.table.rows.refund.${checkout.refund}`)
                        : "—",
                    platformLinks: checkout?.links ?? [],
                    trackingCodes: checkout?.trackings ?? [],
                    concept: hasConcept && charge.title ? charge.title : "",
                };
            });
        } finally {
            isLoading = false;
            isFirstLoad = false;
            return chargesArr;
        }
    }

    const reloadCharges = async () => {
        charges = [];
        charges = await loadCharges(filters)!;
    };

    $effect(() => {
        reloadCharges();
    });

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
        <Categories {paymentMethodOptions} />
        <Slider {slides} />
    </div>
</div>
<Table
    {filters}
    {charges}
    {itemsPerPage}
    {currentPage}
    {isLoading}
    {isFirstLoad}
    {totalItems}
    {API_CACHE_NAME}
/>
