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
    import {
        apiGatewayChargesGetCollectionUrl,
        apiProjectsGetCollectionUrl,
        apiTipjarsGetCollectionUrl,
        apiUsersGetCollectionUrl,
    } from "../../openapi/client/paths.gen";
    import { client } from "../../openapi/client/client.gen";
    import {
        fetchAccounting,
        fetchCheckout,
        fetchProject,
        fetchTipjar,
        fetchUser,
        fetchWithPersistentCache,
    } from "../../utils/cachedFetch";
    import { extractId } from "../../utils/extractId";
    import {
        isLoading,
        itemsPerPage,
        totalItems,
        currentPage,
        sortOptions,
    } from "../../stores/chargesPaginationAndSort.ts";

    type GatewayChargesCollection<T> = {
        member: T[];
        totalItems: number;
    };

    const API_CACHE_NAME = "charges-cache";

    let filters: ApiGatewayChargesGetCollectionData["query"] = $state({});

    let paymentMethodOptions = $state<[string, string][]>([]);
    let chargeStatusOptions = $state<[string, string][]>([]);
    let rangeAmountOptions = $state<[string, string][]>([]);

    let charges = $state<ExtendedCharge[] | undefined>([]);
    let accountingsMap = $state<Map<string, Accounting>>(new Map());
    let ownersMap = $state<Map<string, User | Project | Tipjar>>(new Map());
    let isFirstLoad = $state(true);
    let selectedSort = $state("date-desc");

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

    function buildChargesQuery(
        filters: ApiGatewayChargesGetCollectionData["query"],
        page: number,
        itemsPerPage: number,
    ) {
        const sort = sortOptions.find((option) => option.key === selectedSort);

        const query: Record<string, any> = {
            page,
            itemsPerPage,
            ...filters,
        };

        if (sort) {
            query[`order[${sort.field}]`] = sort.direction;
        }

        return query;
    }

    async function loadCharges(
        filters: ApiGatewayChargesGetCollectionData["query"],
    ): Promise<
        | [ExtendedCharge[], Map<string, Accounting>, Map<string, User | Project | Tipjar>]
        | undefined
    > {
        $isLoading = true;
        let chargesArr: ExtendedCharge[] = [];

        const checkouts: Map<string, GatewayCheckout | undefined> = new Map();
        const accountings: Map<string, Accounting> = new Map<string, Accounting>();
        const owners: Map<string, User | Project | Tipjar> = new Map();

        try {
            const token = getAccessToken();
            if (!token) return;

            let page = $currentPage;
            let items = Number($itemsPerPage);

            const query = buildChargesQuery(filters, page, items);

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
            $totalItems = collection.totalItems ?? 0;

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

            chargesArr = loadedCharges.map((charge): ExtendedCharge => {
                const checkout = checkouts.get(charge.checkout ?? "");

                return {
                    ...charge,
                    checkoutOrigin: checkout?.origin ?? "—",
                    paymentMethod: extractId(checkout?.gateway) ?? "—",
                    refundToWallet: checkout?.refund
                        ? $t(`contributions.table.rows.refund.${checkout.refund}`)
                        : "—",
                    platformLinks: checkout?.links ?? [],
                    trackingCodes: checkout?.trackings ?? [],
                };
            });
        } finally {
            $isLoading = false;
            isFirstLoad = false;
            return [chargesArr, accountings, owners];
        }
    }

    const OWNER_HANDLERS = [
        {
            prefix: apiUsersGetCollectionUrl,
            fetcher: fetchUser,
        },
        {
            prefix: apiProjectsGetCollectionUrl,
            fetcher: fetchProject,
        },
        {
            prefix: apiTipjarsGetCollectionUrl,
            fetcher: fetchTipjar,
        },
    ];

    async function resolveOwner(
        ownerIri: string,
        token: string,
        owners: Map<string, User | Project | Tipjar>,
    ) {
        if (owners.has(ownerIri)) return;

        const handler = OWNER_HANDLERS.find(({ prefix }) => ownerIri.startsWith(prefix));

        if (!handler) return;

        const entity = await handler.fetcher(ownerIri, token, API_CACHE_NAME);
        if (entity) owners.set(ownerIri, entity);
    }

    async function preloadAccountingData(
        accountingIri: string | null,
        token: string,
        accountings: Map<string, Accounting>,
        owners: Map<string, User | Project | Tipjar>,
    ) {
        if (!accountingIri || accountings.has(accountingIri)) return;

        const accounting = await fetchAccounting(accountingIri, token, API_CACHE_NAME);
        if (!accounting) return;

        accountings.set(accountingIri, accounting);

        const ownerIri = accounting.owner;
        if (!ownerIri) return;

        await resolveOwner(ownerIri, token, owners);
    }

    function handleApplyFilters(newFilters: ApiGatewayChargesGetCollectionData["query"]) {
        filters = { ...filters, ...newFilters };
    }

    const reloadCharges = async () => {
        charges = [];
        const chargesData = await loadCharges(filters);
        if (chargesData === undefined) return;

        charges = chargesData[0] ? chargesData[0] : [];
        accountingsMap = chargesData[1];
        ownersMap = chargesData[2];
    };

    $effect(() => {
        reloadCharges();
    });

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
        <Slider />
    </div>
</div>
<Table
    {filters}
    {charges}
    {accountingsMap}
    {ownersMap}
    {isFirstLoad}
    bind:selectedSort
    onSortChange={(value) => (selectedSort = value)}
/>
