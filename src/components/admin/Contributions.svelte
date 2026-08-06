<script lang="ts">
    import { onMount } from "svelte";

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
        apiGatewayChargestotalsGetCollection,
        apiGatewayCheckoutsIdGet,
        apiGatewaysGetCollection,
        apiProjectsIdOrSlugGet,
        apiTipjarsIdGet,
        apiUsersIdOrHandleGet,
        type Accounting,
        type ApiGatewayChargesGetCollectionData,
        type ApiGatewayChargestotalsGetCollectionData,
        type GatewayCharge,
        type GatewayCheckout,
        type Project,
        type Tipjar,
        type User,
    } from "../../openapi/client/index.ts";
    import {
        apiGatewayChargesGetCollectionUrl,
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
    import { formatCurrency } from "../../utils/currencies";
    import { extractId } from "../../utils/extractId";
    import { toCollectionItems } from "../../utils/hydra";
    import {
        parseQueryFilters,
        splitOrderParams,
        syncQueryFiltersToUrl,
    } from "../../utils/queryParams";
    import { isEnabled, tipjarId } from "../../utils/tipping";

    const initialParams =
        typeof window !== "undefined"
            ? splitOrderParams(
                  parseQueryFilters(window.location.search, {
                      exclude: ["page", "itemsPerPage"],
                  }),
              )
            : { filters: {}, order: {} };

    const initialSort = sortOptions.find(
        (option) => initialParams.order[option.field] === option.direction,
    );

    let filters: ApiGatewayChargesGetCollectionData["query"] = $state(initialParams.filters);

    let paymentMethodOptions = $state<[string, string][]>([]);

    let charges = $state<ExtendedCharge[] | undefined>([]);
    let accountingsMap = $state<Map<string, Accounting>>(new Map());
    let ownersMap = $state<Map<string, User | Project | Tipjar>>(new Map());
    let isFirstLoad = $state(true);
    let selectedSort = $state(initialSort?.key ?? "date-desc");
    let totalTips = $state<string>("—");
    let selectedProjectsCount = $state<number | string>("—");

    async function loadTotalTips() {
        if (!isEnabled || !$session) return;

        const { data: tipjar } = await apiTipjarsIdGet({
            baseUrl: "/api/relay",
            path: { id: tipjarId },
        });
        const accountingId = tipjar?.accounting ? extractId(tipjar.accounting) : null;
        if (!accountingId) return;

        const { data: accounting } = await apiAccountingsIdGet({
            baseUrl: "/api/relay",
            path: { id: accountingId },
        });
        if (accounting?.balance) {
            totalTips = formatCurrency(accounting.balance.amount, accounting.balance.currency);
        }
    }

    // Distinct count of Projects targeted by the charges matching the current filters.
    // Served by the /v4/gateway_charges/totals aggregate (same filters as the collection).
    let projectsCountRequestId = 0;

    async function loadSelectedProjectsCount(
        chargeFilters: ApiGatewayChargesGetCollectionData["query"],
    ) {
        const requestId = ++projectsCountRequestId;
        selectedProjectsCount = "—";

        const headers: Record<string, string> = Object.assign(
            { Accept: "application/ld+json" },
            ($session?.token.asHttpHeaders as Record<string, string>) ?? {},
        );

        const { data, error } = await apiGatewayChargestotalsGetCollection({
            baseUrl: "/api/relay",
            query: chargeFilters as ApiGatewayChargestotalsGetCollectionData["query"],
            headers,
        });

        if (requestId !== projectsCountRequestId) return;

        if (error || data?.projects === undefined) {
            console.error("Failed to load selected projects count:", error);
            return;
        }

        selectedProjectsCount = data.projects;
    }

    function buildChargesQuery(
        filters: ApiGatewayChargesGetCollectionData["query"],
        page: number,
        itemsPerPage: number,
    ): ApiGatewayChargesGetCollectionData["query"] {
        const sort = sortOptions.find((option) => option.key === selectedSort);

        const query: ApiGatewayChargesGetCollectionData["query"] = {
            page,
            itemsPerPage,
            ...filters,
        };

        if (sort) {
            (query as any)[`order[${sort.field}]`] = sort.direction;
        }

        return query;
    }

    function getCollectionTotalItems(collection: unknown, response?: Response): number {
        if (Array.isArray(collection)) {
            return collection.length;
        }
        if (!collection || typeof collection !== "object") return 0;

        const record = collection as Record<string, unknown>;
        const totalItems = record.totalItems ?? record["hydra:totalItems"];

        return typeof totalItems === "number"
            ? totalItems
            : toCollectionItems<GatewayCharge>(collection).length;
    }

    async function fetchCheckout(iri: string | undefined, headers?: Record<string, string>) {
        const id = extractId(iri);
        if (!id) return;

        const { data, error } = await apiGatewayCheckoutsIdGet({
            baseUrl: "/api/relay",
            path: { id },
            headers,
        });

        if (error) {
            console.error(`Failed to fetch checkout ${iri}:`, error);
            return;
        }

        return data;
    }

    async function fetchAccounting(iri: string | undefined, headers?: Record<string, string>) {
        const id = extractId(iri);
        if (!id) return;

        const { data, error } = await apiAccountingsIdGet({
            baseUrl: "/api/relay",
            path: { id },
            headers,
        });

        if (error) {
            console.error(`Failed to fetch accounting ${iri}:`, error);
            return;
        }

        return data;
    }

    async function fetchUser(iri: string | undefined, headers?: Record<string, string>) {
        const idOrHandle = extractId(iri);
        if (!idOrHandle) return;

        const { data, error } = await apiUsersIdOrHandleGet({
            baseUrl: "/api/relay",
            path: { idOrHandle },
            headers,
        });

        if (error) {
            console.error(`Failed to fetch user ${iri}:`, error);
            return;
        }

        return data;
    }

    async function fetchProject(iri: string | undefined, headers?: Record<string, string>) {
        const idOrSlug = extractId(iri);
        if (!idOrSlug) return;

        const { data, error } = await apiProjectsIdOrSlugGet({
            baseUrl: "/api/relay",
            path: { idOrSlug },
            headers,
        });

        if (error) {
            console.error(`Failed to fetch project ${iri}:`, error);
            return;
        }

        return data;
    }

    async function fetchTipjar(iri: string | undefined, headers?: Record<string, string>) {
        const id = extractId(iri);
        if (!id) return;

        const { data, error } = await apiTipjarsIdGet({
            baseUrl: "/api/relay",
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

            const headers: Record<string, string> = Object.assign(
                { Accept: "application/ld+json" },
                ($session?.token.asHttpHeaders as Record<string, string>) ?? {},
            );

            const {
                data: collection,
                response,
                error,
            } = await apiGatewayChargesGetCollection({
                baseUrl: "/api/relay",
                query: query as any,
                headers,
            });

            if (error) {
                console.error("Failed to fetch gateway charges:", error);
                return;
            }

            const loadedCharges = toCollectionItems<GatewayCharge>(collection);
            $totalItems = getCollectionTotalItems(collection, response);

            for (const charge of loadedCharges) {
                const checkoutIri = charge.checkout;
                const targetAccountingIri = charge.target;

                if (checkoutIri && !checkouts.has(checkoutIri)) {
                    checkouts.set(checkoutIri, await fetchCheckout(checkoutIri, headers));

                    const originAccountingIri = checkouts.get(checkoutIri)?.origin;

                    if (originAccountingIri && !accountings.has(originAccountingIri)) {
                        await preloadAccountingData(
                            originAccountingIri,
                            accountings,
                            owners,
                            headers,
                        );
                    }
                }

                if (targetAccountingIri && !accountings.has(targetAccountingIri)) {
                    await preloadAccountingData(targetAccountingIri, accountings, owners, headers);
                }
            }

            chargesArr = loadedCharges.map((charge): ExtendedCharge => {
                const checkout = checkouts.get(charge.checkout ?? "");

                return {
                    ...charge,
                    checkoutOrigin: checkout?.origin ?? "—",
                    paymentMethod: checkout?.gateway,
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
        owners: Map<string, User | Project | Tipjar>,
        headers?: Record<string, string>,
    ) {
        if (owners.has(ownerIri)) return;

        const handler = OWNER_HANDLERS.find(({ prefix }) => ownerIri.startsWith(prefix));

        if (!handler) return;

        const entity = await handler.fetcher(ownerIri, headers);
        if (entity) owners.set(ownerIri, entity);
    }

    async function preloadAccountingData(
        accountingIri: string | null,
        accountings: Map<string, Accounting>,
        owners: Map<string, User | Project | Tipjar>,
        headers?: Record<string, string>,
    ) {
        if (!accountingIri || accountings.has(accountingIri)) return;

        const accounting = await fetchAccounting(accountingIri, headers);
        if (!accounting) return;

        accountings.set(accountingIri, accounting);

        const ownerIri = accounting.owner;
        if (!ownerIri) return;

        await resolveOwner(ownerIri, owners, headers);
    }

    function handleApplyFilters(newFilters: ApiGatewayChargesGetCollectionData["query"]) {
        filters = { ...newFilters };
        $currentPage = 1;
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

    // Plain (non-reactive) bookkeeping: avoids re-triggering the effect below on write.
    let prevProjectsCountKey: string | undefined;

    $effect(() => {
        const currentFilters = Object.fromEntries(
            Object.entries(filters ?? {}).filter(
                ([, value]) => value !== undefined && value !== "",
            ),
        ) as ApiGatewayChargesGetCollectionData["query"];
        const key = JSON.stringify(currentFilters);

        if (key === prevProjectsCountKey) return;

        prevProjectsCountKey = key;
        loadSelectedProjectsCount(currentFilters);
    });

    $effect(() => {
        const sort = sortOptions.find((option) => option.key === selectedSort);

        syncQueryFiltersToUrl(
            filters ?? ({} as Record<string, unknown>),
            sort ? { [sort.field]: sort.direction } : undefined,
        );
    });

    let prevItemsPerPage = $state($itemsPerPage);

    $effect(() => {
        const current = $itemsPerPage;
        if (current !== prevItemsPerPage) {
            prevItemsPerPage = current;
            $currentPage = 1;
        }
    });

    let chargeSlides = $derived([
        { title: $t("domain.charges.totalizers.selected"), amount: selectedProjectsCount },
        //{ title: $t("domain.charges.totalizers.totalCharges"), amount: "—" },
        { title: $t("domain.charges.totalizers.totalTips"), amount: totalTips },
        //{ title: $t("domain.charges.totalizers.totalFees"), amount: "—" },
    ]);

    function handleSelectTarget(accounting: string): void {
        handleApplyFilters({ target: accounting });
    }

    onMount(async () => {
        const { data: paymentGateways } = await apiGatewaysGetCollection();

        paymentMethodOptions = [
            ["all", $t("pages.admin.charges.filters.paymentMethod.options.all")],
            ...(paymentGateways ?? []).map((g): [string, string] => [g.id!, g.name ?? ""]),
        ];

        loadTotalTips();
    });
</script>

<div class="flex flex-col gap-10">
    <Filters
        resource="gateway_charges"
        {filters}
        onApplyFilters={handleApplyFilters}
        onSelectTarget={handleSelectTarget}
    />
    <div class="flex flex-col">
        <div class="mb-8 flex justify-between">
            <FiltersTags
                onCloseFilter={handleApplyFilters}
                title={$t("pages.admin.charges.lastContributions")}
                {filters}
                {accountingsMap}
                {ownersMap}
                resource="gateway_charges"
            />
            <ExportCsv
                endpoint={apiGatewayChargesGetCollectionUrl}
                queryParams={filters}
                filenamePrefix="gateway-charges"
                totalItems={$totalItems}
            />
        </div>
        <Slider slides={chargeSlides} isLoading={$isLoading} />
    </div>
</div>
<Table
    {filters}
    {charges}
    {accountingsMap}
    {ownersMap}
    {isFirstLoad}
    bind:selectedSort
    onSortChange={(value) => {
        selectedSort = value;
        $currentPage = 1;
    }}
/>
