<script lang="ts">
    import { onMount } from "svelte";

    import Categories from "./Categories.svelte";
    import ExportCsv from "./ExportCsv.svelte";
    import Filters from "./Filters.svelte";
    import FiltersTags from "./FiltersTags.svelte";
    import Slider from "./Slider.svelte";
    import Table, { type ExtendedCharge } from "./Table.svelte";
    import { session } from "../../auth/store";
    import { t } from "../../i18n/store";
    import {
        apiAccountingsIdGet,
        apiGatewayChargesGetCollection,
        apiGatewayCheckoutsIdGet,
        apiGatewaysGetCollection,
        apiProjectsIdOrSlugGet,
        apiTipjarsIdGet,
        apiUsersIdOrHandleGet,
        type Accounting,
        type ApiGatewayChargesGetCollectionData,
        type GatewayCharge,
        type GatewayCheckout,
        type Project,
        type Tipjar,
        type User,
    } from "../../openapi/client/index.ts";
    import {
        apiProjectsGetCollectionUrl,
        apiTipjarsGetCollectionUrl,
        apiUsersGetCollectionUrl,
    } from "../../openapi/client/paths.gen";
    import {
        isLoading,
        itemsPerPage,
        totalItems,
        currentPage,
        sortOptions,
    } from "../../stores/chargesPaginationAndSort.ts";
    import { extractId } from "../../utils/extractId";
    import { toCollectionItems } from "../../utils/hydra";

    let filters: ApiGatewayChargesGetCollectionData["query"] = $state({});

    let paymentMethodOptions = $state<[string, string][]>([]);
    let chargeStatusOptions = $state<[string, string][]>([]);
    let rangeAmountOptions = $state<[string, string][]>([]);

    let charges = $state<ExtendedCharge[] | undefined>([]);
    let accountingsMap = $state<Map<string, Accounting>>(new Map());
    let ownersMap = $state<Map<string, User | Project | Tipjar>>(new Map());
    let isFirstLoad = $state(true);
    let selectedSort = $state("date-desc");

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

    function getCollectionTotalItems(collection: unknown): number {
        if (Array.isArray(collection)) return collection.length;
        if (!collection || typeof collection !== "object") return 0;

        const record = collection as Record<string, unknown>;
        const totalItems = record.totalItems ?? record["hydra:totalItems"];

        return typeof totalItems === "number"
            ? totalItems
            : toCollectionItems<GatewayCharge>(collection).length;
    }

    async function fetchCheckout(iri: string | undefined, headers: HeadersInit | undefined) {
        const id = extractId(iri);
        if (!id) return;

        const { data, error } = await apiGatewayCheckoutsIdGet({
            path: { id },
            headers,
        });

        if (error) {
            console.error(`Failed to fetch checkout ${iri}:`, error);
            return;
        }

        return data;
    }

    async function fetchAccounting(iri: string | undefined, headers: HeadersInit | undefined) {
        const id = extractId(iri);
        if (!id) return;

        const { data, error } = await apiAccountingsIdGet({
            path: { id },
            headers,
        });

        if (error) {
            console.error(`Failed to fetch accounting ${iri}:`, error);
            return;
        }

        return data;
    }

    async function fetchUser(iri: string | undefined, headers: HeadersInit | undefined) {
        const idOrHandle = extractId(iri);
        if (!idOrHandle) return;

        const { data, error } = await apiUsersIdOrHandleGet({
            path: { idOrHandle },
            headers,
        });

        if (error) {
            console.error(`Failed to fetch user ${iri}:`, error);
            return;
        }

        return data;
    }

    async function fetchProject(iri: string | undefined, headers: HeadersInit | undefined) {
        const idOrSlug = extractId(iri);
        if (!idOrSlug) return;

        const { data, error } = await apiProjectsIdOrSlugGet({
            path: { idOrSlug },
            headers,
        });

        if (error) {
            console.error(`Failed to fetch project ${iri}:`, error);
            return;
        }

        return data;
    }

    async function fetchTipjar(iri: string | undefined, headers: HeadersInit | undefined) {
        const id = extractId(iri);
        if (!id) return;

        const { data, error } = await apiTipjarsIdGet({
            path: { id },
            headers,
        });

        if (error) {
            console.error(`Failed to fetch tipjar ${iri}:`, error);
            return;
        }

        return data;
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
            let page = $currentPage;
            let items = Number($itemsPerPage);

            const query = buildChargesQuery(filters, page, items);
            const headers = $session?.token.asHttpHeaders as HeadersInit | undefined;

            const { data: collection, error } = await apiGatewayChargesGetCollection({
                query,
                headers,
            });

            if (error) {
                console.error("Failed to fetch gateway charges:", error);
                return;
            }

            const loadedCharges = toCollectionItems<GatewayCharge>(collection);
            $totalItems = getCollectionTotalItems(collection);

            for (const charge of loadedCharges) {
                const checkoutIri = charge.checkout;
                const targetAccountingIri = charge.target;

                if (checkoutIri && !checkouts.has(checkoutIri)) {
                    checkouts.set(checkoutIri, await fetchCheckout(checkoutIri, headers));

                    const originAccountingIri = checkouts.get(checkoutIri)?.origin;

                    if (originAccountingIri && !accountings.has(originAccountingIri)) {
                        await preloadAccountingData(
                            originAccountingIri,
                            headers,
                            accountings,
                            owners,
                        );
                    }
                }

                if (targetAccountingIri && !accountings.has(targetAccountingIri)) {
                    await preloadAccountingData(targetAccountingIri, headers, accountings, owners);
                }
            }

            chargesArr = loadedCharges.map((charge): ExtendedCharge => {
                const checkout = checkouts.get(charge.checkout ?? "");

                return {
                    ...charge,
                    checkoutOrigin: checkout?.origin ?? "—",
                    paymentMethod: extractId(checkout?.gateway) ?? "—",
                    refundToWallet: checkout?.refund
                        ? $t(`domain.charges.refund.${checkout.refund}`)
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
        headers: HeadersInit | undefined,
        owners: Map<string, User | Project | Tipjar>,
    ) {
        if (owners.has(ownerIri)) return;

        const handler = OWNER_HANDLERS.find(({ prefix }) => ownerIri.startsWith(prefix));

        if (!handler) return;

        const entity = await handler.fetcher(ownerIri, headers);
        if (entity) owners.set(ownerIri, entity);
    }

    async function preloadAccountingData(
        accountingIri: string | null,
        headers: HeadersInit | undefined,
        accountings: Map<string, Accounting>,
        owners: Map<string, User | Project | Tipjar>,
    ) {
        if (!accountingIri || accountings.has(accountingIri)) return;

        const accounting = await fetchAccounting(accountingIri, headers);
        if (!accounting) return;

        accountings.set(accountingIri, accounting);

        const ownerIri = accounting.owner;
        if (!ownerIri) return;

        await resolveOwner(ownerIri, headers, owners);
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
            ["all", $t("pages.admin.charges.filters.paymentMethod.options.all")],
            ...(paymentGateways ?? []).map((g): [string, string] => [
                g.name!,
                $t(`pages.admin.charges.filters.paymentMethod.options.${g.name}`),
            ]),
        ];

        chargeStatusOptions = Object.entries(
            $t("pages.admin.charges.filters.chargeStatus.options"),
        );
        rangeAmountOptions = Object.entries(
            $t("pages.admin.charges.filters.rangeAmount.options"),
        ).sort(([a], [b]) => {
            const parseMin = (val: string) =>
                val.includes("..") ? parseInt(val.split("..")[0]) : parseInt(val);
            if (a === "all") return -1;
            if (b === "all") return 1;
            return parseMin(a) - parseMin(b);
        });
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
                title={$t("pages.admin.charges.lastContributions")}
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
