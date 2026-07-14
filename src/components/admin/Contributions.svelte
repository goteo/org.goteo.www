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
    import { client } from "../../openapi/client/client.gen";
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
        type ApiProjectsGetCollectionData,
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
    import { apiProjectsGetCollection } from "../../openapi/client/sdk.gen";
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
    import { isEnabled, tipjarId } from "../../utils/tipping";

    const initialSearchQuery =
        typeof window !== "undefined"
            ? (new URLSearchParams(window.location.search).get("search") ?? undefined)
            : undefined;

    let filters: ApiGatewayChargesGetCollectionData["query"] = $state({});
    let pendingSearch = $state(!!initialSearchQuery);

    let paymentMethodOptions = $state<[string, string][]>([]);
    let chargeStatusOptions = $state<[string, string][]>([]);
    let rangeAmountOptions = $state<[string, string][]>([]);

    let charges = $state<ExtendedCharge[] | undefined>([]);
    let accountingsMap = $state<Map<string, Accounting>>(new Map());
    let ownersMap = $state<Map<string, User | Project | Tipjar>>(new Map());
    let isFirstLoad = $state(true);
    let selectedSort = $state("date-desc");
    let totalTips = $state<string>("—");
    let selectedProjectsCount = $state<number | string>("—");

    async function loadTotalTips() {
        if (!isEnabled || !$session) return;
        const headers = $session.token.asHttpHeaders;

        const { data: tipjar } = await apiTipjarsIdGet({ path: { id: tipjarId }, headers });
        const accountingId = tipjar?.accounting ? extractId(tipjar.accounting) : null;
        if (!accountingId) return;

        const { data: accounting } = await apiAccountingsIdGet({
            path: { id: accountingId },
            headers,
        });
        if (accounting?.balance) {
            totalTips = formatCurrency(accounting.balance.amount, accounting.balance.currency);
        }
    }

    // Preferred source: the /v4/gateway_charges/stats aggregate (may not be deployed yet).
    // Fallback: scan the filtered collection page by page (same approach as ExportCsv)
    // and deduplicate targets — only viable for small result sets, hence the cap.
    // Results are cached per filter set for the session.
    const CHARGES_SCAN_PAGE_SIZE = 100;
    const CHARGES_SCAN_CONCURRENCY = 3;
    const MAX_SCANNABLE_CHARGES = 2000;
    const PROJECTS_LOOKUP_CHUNK_SIZE = 50;
    const projectsCountCache = new Map<string, number>();
    let projectsCountRequestId = 0;

    async function fetchDistinctProjectsFromStats(
        chargeFilters: ApiGatewayChargesGetCollectionData["query"],
        headers: HeadersInit,
    ): Promise<number | null> {
        try {
            const { data, response } = await client.get({
                url: "/v4/gateway_charges/stats",
                query: chargeFilters as Record<string, unknown>,
                headers,
            });
            if (!response.ok || !data || typeof data !== "object") return null;

            const count = (data as Record<string, unknown>).distinctProjectCount;
            return typeof count === "number" ? count : null;
        } catch {
            return null;
        }
    }

    async function loadSelectedProjectsCount(
        chargeFilters: ApiGatewayChargesGetCollectionData["query"],
    ) {
        const requestId = ++projectsCountRequestId;
        const cacheKey = JSON.stringify(chargeFilters ?? {});
        const cached = projectsCountCache.get(cacheKey);
        if (cached !== undefined) {
            selectedProjectsCount = cached;
            return;
        }

        selectedProjectsCount = "—";

        const headers = {
            Accept: "application/ld+json",
            ...($session?.token.asHttpHeaders ?? {}),
        };

        const fetchChargesPage = async (page: number) => {
            const { data, error } = await apiGatewayChargesGetCollection({
                query: { ...chargeFilters, page, itemsPerPage: CHARGES_SCAN_PAGE_SIZE },
                headers,
            });
            if (error) throw error;
            return data;
        };

        try {
            const statsCount = await fetchDistinctProjectsFromStats(chargeFilters, headers);
            if (requestId !== projectsCountRequestId) return;
            if (statsCount !== null) {
                projectsCountCache.set(cacheKey, statsCount);
                selectedProjectsCount = statsCount;
                return;
            }

            const targets = new Set<string>();
            const collectTargets = (collection: unknown) => {
                for (const charge of toCollectionItems<GatewayCharge>(collection)) {
                    if (charge.target) targets.add(charge.target);
                }
            };

            const firstPage = await fetchChargesPage(1);
            collectTargets(firstPage);

            // With a single target filter every charge shares it: page 1 is enough.
            if (!chargeFilters?.target) {
                const totalCharges = getCollectionTotalItems(firstPage);

                // Without the stats endpoint, big result sets would take minutes to
                // scan and hammer the API — leave the card empty instead.
                if (totalCharges > MAX_SCANNABLE_CHARGES) return;

                const totalPages = Math.ceil(totalCharges / CHARGES_SCAN_PAGE_SIZE);

                for (let page = 2; page <= totalPages; page += CHARGES_SCAN_CONCURRENCY) {
                    if (requestId !== projectsCountRequestId) return;

                    const batch = [];
                    for (
                        let p = page;
                        p < page + CHARGES_SCAN_CONCURRENCY && p <= totalPages;
                        p++
                    ) {
                        batch.push(fetchChargesPage(p));
                    }
                    (await Promise.all(batch)).forEach(collectTargets);
                }
            }

            if (requestId !== projectsCountRequestId) return;

            // Targets can also be user or tipjar accountings; keep only projects.
            const targetList = [...targets];
            let projectCount = 0;

            for (let i = 0; i < targetList.length; i += PROJECTS_LOOKUP_CHUNK_SIZE) {
                const query: ApiProjectsGetCollectionData["query"] = {
                    "accounting[]": targetList.slice(i, i + PROJECTS_LOOKUP_CHUNK_SIZE),
                    itemsPerPage: 1,
                };
                const { data, error } = await apiProjectsGetCollection({
                    query,
                    headers: { Accept: "application/ld+json" },
                });
                if (error) throw error;
                projectCount += getCollectionTotalItems(data);
            }

            if (requestId !== projectsCountRequestId) return;

            projectsCountCache.set(cacheKey, projectCount);
            selectedProjectsCount = projectCount;
        } catch (error) {
            console.error("Failed to count projects for filtered charges:", error);
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

            const headers = {
                Accept: "application/ld+json",
                ...($session?.token.asHttpHeaders ?? {}),
            };

            const {
                data: collection,
                response,
                error,
            } = await apiGatewayChargesGetCollection({
                query,
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
        $currentPage = 1;
    }

    $effect(() => {
        if (!pendingSearch) return;
        if (!initialSearchQuery || initialSearchQuery.length < 4) {
            pendingSearch = false;
            return;
        }

        const doResolve = async () => {
            const { data } = await apiProjectsGetCollection({
                query: { title: initialSearchQuery },
                headers: { Accept: "application/ld+json" },
            });
            const projects = toCollectionItems<Project>(data);
            const found = projects[0];
            if (found?.accounting) {
                filters = { target: found.accounting };
            }
            pendingSearch = false;
        };
        doResolve();
    });

    const reloadCharges = async () => {
        charges = [];
        const chargesData = await loadCharges(filters);
        if (chargesData === undefined) return;

        charges = chargesData[0] ? chargesData[0] : [];
        accountingsMap = chargesData[1];
        ownersMap = chargesData[2];
    };

    $effect(() => {
        if (pendingSearch) return;
        reloadCharges();
    });

    // Plain (non-reactive) bookkeeping: avoids re-triggering the effect below on write.
    let prevProjectsCountKey: string | undefined;

    $effect(() => {
        if (pendingSearch) return;
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
        { title: $t("domain.charges.totalizers.totalCharges"), amount: "—" },
        { title: $t("domain.charges.totalizers.totalTips"), amount: totalTips },
        { title: $t("domain.charges.totalizers.totalFees"), amount: "—" },
    ]);

    onMount(async () => {
        const { data: paymentGateways } = await apiGatewaysGetCollection();

        paymentMethodOptions = [
            ["all", $t("pages.admin.charges.filters.paymentMethod.options.all")],
            ...(paymentGateways ?? []).map((g): [string, string] => [g.id!, g.name]),
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

        loadTotalTips();
    });
</script>

<div class="flex flex-col gap-10">
    <Filters
        {filters}
        {paymentMethodOptions}
        {chargeStatusOptions}
        {rangeAmountOptions}
        {initialSearchQuery}
        onApplyFilters={handleApplyFilters}
    />
    <div class="flex flex-col">
        <div class="mb-8 flex justify-between">
            <FiltersTags
                onCloseFilter={handleApplyFilters}
                title={$t("domain.charges.lastContributions")}
                {filters}
                {accountingsMap}
                {ownersMap}
            />
            <ExportCsv {filters} />
        </div>
        <Categories {paymentMethodOptions} />
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
