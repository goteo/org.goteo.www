<script lang="ts">
    import { onMount } from "svelte";

    import ChargesTable, { type ChargeSortKey, type ExtendedCharge } from "./ChargesTable.svelte";
    import CreateChargeModal from "./CreateChargeModal.svelte";
    import Button from "../../library/buttons/Button.svelte";
    import Dashboard from "../AdminDashboard.svelte";
    import { session } from "../../../auth/store";
    import { t } from "../../../i18n/store";
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
    } from "../../../openapi/client/index.ts";
    import {
        apiGatewayChargesGetCollectionUrl,
        apiProjectsGetCollectionUrl,
        apiTipjarsGetCollectionUrl,
        apiUsersGetCollectionUrl,
    } from "../../../openapi/client/paths.gen";
    import { useAdminTableState } from "../../../utils/adminTableState.svelte";
    import { formatCurrency } from "../../../utils/currencies";
    import { getDisplayNameFromAccounting } from "../../../utils/displayNameFromAccounting";
    import { extractId } from "../../../utils/extractId";
    import { toCollectionItems } from "../../../utils/hydra";
    import {
        parseQueryFilters,
        splitOrderParams,
        syncQueryFiltersToUrl,
    } from "../../../utils/queryParams";
    import { isEnabled, tipjarId } from "../../../utils/tipping";

    const initialParams =
        typeof window !== "undefined"
            ? splitOrderParams(
                  parseQueryFilters(window.location.search, {
                      exclude: ["page", "itemsPerPage"],
                  }),
              )
            : { filters: {}, order: {} };

    const sortFieldMap: Record<ChargeSortKey, string> = {
        "date-asc": "dateCreated",
        "date-desc": "dateCreated",
        "amount-asc": "money.amount",
        "amount-desc": "money.amount",
        "status-asc": "status",
        "status-desc": "status",
    };

    const initialSort = ((Object.keys(sortFieldMap) as ChargeSortKey[]).find(
        (key) =>
            initialParams.order[sortFieldMap[key]] === "asc" ||
            initialParams.order[sortFieldMap[key]] === "desc",
    ) ?? "date-desc") as ChargeSortKey;

    const table = useAdminTableState<ChargeSortKey>(initialSort);

    let filters: ApiGatewayChargesGetCollectionData["query"] = $state(initialParams.filters);

    let paymentGatewayById = $state<Map<string, string>>(new Map());

    let createOpen = $state(false);
    let createSubmitting = $state(false);

    let charges = $state<ExtendedCharge[]>([]);
    let accountingsMap = $state<Map<string, Accounting>>(new Map());
    let ownersMap = $state<Map<string, User | Project | Tipjar>>(new Map());
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
        const query: ApiGatewayChargesGetCollectionData["query"] = {
            page,
            itemsPerPage,
            ...filters,
        };

        const sortField = sortFieldMap[table.selectedSort];
        if (sortField) {
            const direction = table.selectedSort.endsWith("-asc") ? "asc" : "desc";
            (query as any)[`order[${sortField}]`] = direction;
        }

        return query;
    }

    function getCollectionTotalItems(collection: unknown): number {
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

    const OWNER_HANDLERS = [
        { prefix: apiUsersGetCollectionUrl, fetcher: fetchUser },
        { prefix: apiProjectsGetCollectionUrl, fetcher: fetchProject },
        { prefix: apiTipjarsGetCollectionUrl, fetcher: fetchTipjar },
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

    async function loadCharges(
        filters: ApiGatewayChargesGetCollectionData["query"],
    ): Promise<
        | [ExtendedCharge[], Map<string, Accounting>, Map<string, User | Project | Tipjar>]
        | undefined
    > {
        table.isLoading = true;
        let chargesArr: ExtendedCharge[] = [];

        const checkouts: Map<string, GatewayCheckout | undefined> = new Map();
        const accountings: Map<string, Accounting> = new Map<string, Accounting>();
        const owners: Map<string, User | Project | Tipjar> = new Map();

        try {
            const query = buildChargesQuery(filters, table.currentPage, table.itemsPerPage);

            const headers: Record<string, string> = Object.assign(
                { Accept: "application/ld+json" },
                ($session?.token.asHttpHeaders as Record<string, string>) ?? {},
            );

            const { data: collection, error } = await apiGatewayChargesGetCollection({
                baseUrl: "/api/relay",
                query: query as any,
                headers,
            });

            if (error) {
                console.error("Failed to fetch gateway charges:", error);
                return;
            }

            const loadedCharges = toCollectionItems<GatewayCharge>(collection);
            table.totalItems = getCollectionTotalItems(collection);

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
                    paymentGateway: checkout?.gateway,
                    platformLinks: checkout?.links ?? [],
                    trackingCodes: checkout?.trackings ?? [],
                };
            });
        } finally {
            table.isLoading = false;
            table.isFirstLoad = false;
            return [chargesArr, accountings, owners];
        }
    }

    function addChargesMetadata(charges: ExtendedCharge[]) {
        for (const charge of charges) {
            const targetAcc = accountingsMap.get(charge.target ?? "") as Accounting | undefined;
            const originAcc = accountingsMap.get(charge.checkoutOrigin ?? "") as
                Accounting | undefined;

            const targetName = getDisplayNameFromAccounting(targetAcc, ownersMap);
            const originName = getDisplayNameFromAccounting(originAcc, ownersMap);

            charge.targetDisplayName = typeof targetName === "undefined" ? "—" : targetName;
            charge.originDisplayName = typeof originName === "undefined" ? "—" : originName;
        }
    }

    async function handleApplyFilters(newFilters: ApiGatewayChargesGetCollectionData["query"]) {
        filters = { ...newFilters };
        table.currentPage = 1;
    }

    const reloadCharges = async () => {
        charges = [];
        const chargesData = await loadCharges(filters);
        if (chargesData === undefined) return;

        charges = chargesData[0] ? chargesData[0] : [];
        accountingsMap = chargesData[1];
        ownersMap = chargesData[2];
        addChargesMetadata(charges);
    };

    $effect(() => {
        reloadCharges();
    });

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
        const sortField = sortFieldMap[table.selectedSort];
        const direction = table.selectedSort.endsWith("-asc") ? "asc" : "desc";

        syncQueryFiltersToUrl(
            filters ?? ({} as Record<string, unknown>),
            sortField ? { [sortField]: direction } : undefined,
        );
    });

    let chargeSlides = $derived([
        { title: $t("domain.charges.totalizers.selected"), amount: selectedProjectsCount },
        { title: $t("domain.charges.totalizers.totalTips"), amount: totalTips },
    ]);

    function handleSelectTarget(accounting: string): void {
        handleApplyFilters({ target: accounting });
    }

    onMount(async () => {
        const { data: paymentGateways } = await apiGatewaysGetCollection();

        const map = new Map<string, string>();
        for (const g of paymentGateways ?? []) {
            if (g.id) map.set(String(g.id), g.name ?? "");
        }
        paymentGatewayById = map;

        loadTotalTips();
    });
</script>

<Dashboard
    title={$t("pages.admin.charges.title")}
    description={$t("pages.admin.charges.description")}
    filters={{
        resource: "gateway_charges",
        filters: filters,
        onApplyFilters: handleApplyFilters,
        onSelectTarget: handleSelectTarget,
    }}
    filterTags={{
        title: $t("pages.admin.charges.lastContributions"),
        filters: filters,
        onCloseFilter: handleApplyFilters,
        resource: "gateway_charges",
        accountingsMap: accountingsMap,
        ownersMap: ownersMap,
    }}
    csv={{
        endpoint: apiGatewayChargesGetCollectionUrl,
        filenamePrefix: "gateway-charges",
        queryParams: filters,
        totalItems: table.totalItems,
    }}
    slider={{
        slides: chargeSlides,
        isLoading: table.isLoading,
    }}
>
    {#snippet actions()}
        <Button
            kind="primary"
            size="md"
            onclick={() => (createOpen = true)}
            disabled={createSubmitting}
        >
            {$t("pages.admin.charges.create.trigger")}
        </Button>
    {/snippet}
    <ChargesTable
        {charges}
        currentPage={table.currentPage}
        itemsPerPage={table.itemsPerPage}
        selectedSort={table.selectedSort}
        totalItems={table.totalItems}
        isLoading={table.isLoading}
        {paymentGatewayById}
        onPageChange={table.handlePageChange}
        onItemsPerPageChange={table.handleItemsPerPageChange}
        onSortChange={table.handleSortChange}
    />
</Dashboard>

<CreateChargeModal
    bind:open={createOpen}
    bind:submitting={createSubmitting}
    onCreated={reloadCharges}
/>
