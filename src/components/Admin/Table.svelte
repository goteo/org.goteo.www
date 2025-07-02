<script lang="ts">
    import {
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";

    import Loader from "../../svgs/Loader.svelte";
    import Pagination from "./Pagination.svelte";

    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";
    import { extractId } from "../../utils/extractId";
    import {
        apiGatewayChargesGetCollection,
        apiAccountingsIdGet,
        apiUsersIdGet,
        apiGatewayCheckoutsIdGet,
        apiProjectsIdOrSlugGet,
    } from "../../../src/openapi/client/index.ts";
    import type {
        GatewayCharge,
        Tracking,
        Link,
        ApiAccountingsIdGetData,
        Accounting,
        ApiProjectsIdOrSlugGetData,
        ApiUsersIdGetData,
    } from "../../../src/openapi/client/index.ts";
    import DetailsRow from "./DetailsRow.svelte";
    import { client } from "../../openapi/client/client.gen.ts";
    import {
        apiAccountingsIdGetUrl,
        apiProjectsIdOrSlugGetUrl,
        apiUsersIdGetUrl,
    } from "../../openapi/client/paths.gen.ts";
    import { getBaseUrl } from "../../utils/consts.ts";
    type ExtendedCharge = GatewayCharge & {
        targetDisplayName: string;
        originDisplayName: string;
        paymentMethod: string;
        refundToWallet: string;
        platformLinks: Link[];
        trackingCodes: Tracking[];
    };

    type GatewayChargesCollection<T> = {
        member: T[];
        totalItems: number;
    };

    const tableHeaders = [
        { name: "contributions.table.headers.target" },
        { name: "contributions.table.headers.amount" },
        { name: "contributions.table.headers.origin" },
        { name: "contributions.table.headers.paymentMethod" },
        { name: "contributions.table.headers.date" },
        { name: "contributions.table.headers.chargeStatus" },
        { name: "contributions.table.headers.refundToWallet" },
    ];

    let openRow = $state<number | null>(null);
    let charges = $state<ExtendedCharge[]>([]);
    let itemsPerPage = $state("10");
    let currentPage = $state(1);
    let isLoading = $state(false);
    let isFirstLoad = $state(true);
    let totalItems = $state(0);
    let lastItemsPerPage = $state(10);
    let lastItemsPerPageSnapshot = 10;

    const toggleRow = (i: number) => {
        openRow = openRow === i ? null : i;
    };

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

    const chargesCache = new Map<string, ExtendedCharge[]>();
    let largestLoaded = 0;

    async function loadCharges(filters: {
        chargeStatus: string;
        rangeAmount: string;
        from?: string;
        to?: string;
        paymentMethod: string;
        target?: string;
    }) {
        const current = Number(itemsPerPage);
        const isPageChange = current === lastItemsPerPageSnapshot;

        isLoading = true;

        if (isPageChange) {
            charges = [];
            openRow = null;
        }

        lastItemsPerPageSnapshot = current;

        try {
            const token = getAccessToken();
            if (!token) {
                console.error("Token not found in cookies");
                return;
            }

            const headers = { Authorization: `Bearer ${token}` };
            const currentCount = Number(itemsPerPage);
            const cacheKey = JSON.stringify({
                page: currentPage,
                itemsPerPage: currentCount,
                filters,
            });
            const baseKey = JSON.stringify({ page: 1, itemsPerPage: largestLoaded });

            if (chargesCache.has(cacheKey)) {
                charges = chargesCache.get(cacheKey)!;
                return;
            }

            if (currentPage === 1 && currentCount < largestLoaded && chargesCache.has(baseKey)) {
                charges = chargesCache.get(baseKey)!.slice(0, currentCount);
                return;
            }

            const query: Record<string, any> = {
                page: currentPage,
                itemsPerPage: currentCount,
                pagination: true,
                ...(filters.chargeStatus &&
                    filters.chargeStatus !== "all" && { status: filters.chargeStatus }),
                ...(filters.rangeAmount &&
                    filters.rangeAmount !== "all" &&
                    (filters.rangeAmount.includes("..")
                        ? { "money.amount[between]": filters.rangeAmount }
                        : { "money.amount[gte]": filters.rangeAmount })),
                ...(filters.from && { "dateCreated[strictly_after]": filters.from }),
                ...(filters.to && { "dateCreated[strictly_before]": filters.to }),
                ...(filters.paymentMethod &&
                    filters.paymentMethod !== "all" && {
                        "checkout.gateway": `/v4/gateways/${filters.paymentMethod}`,
                    }),
                ...(filters.target && {
                    target: filters.target,
                }),
            };

            const { data } = await apiGatewayChargesGetCollection({
                headers: {
                    ...headers,
                    Accept: "application/ld+json",
                },
                query,
            });

            if (!data) {
                console.error("No data received from API");
                return;
            }

            const chargesResult = data as unknown as GatewayChargesCollection<GatewayCharge>;
            const loadedCharges = chargesResult.member ?? [];
            totalItems = chargesResult.totalItems ?? 0;

            const getCached = async (
                iri: string,
                resolver: CallableFunction,
            ): Promise<any | null> => {
                const resCache = await caches.open("loadCharges");
                const cachedRes = await resCache.match(iri);

                if (cachedRes) return await cachedRes.json();

                const { data } = await resolver();

                resCache.add(iri);

                return data;
            };

            const getCachedAccounting = async (id: string | null): Promise<Accounting | null> => {
                if (!id) return null;

                const accountingIri = client.buildUrl<ApiAccountingsIdGetData>({
                    path: { id: id },
                    baseUrl: getBaseUrl(),
                    url: apiAccountingsIdGetUrl,
                });

                return await getCached(accountingIri, () =>
                    apiAccountingsIdGet({ path: { id }, headers }),
                );
            };

            const getCachedProject = async (id: string | null) => {
                if (!id) return null;

                const projectIri = client.buildUrl<ApiProjectsIdOrSlugGetData>({
                    path: { idOrSlug: id },
                    baseUrl: getBaseUrl(),
                    url: apiProjectsIdOrSlugGetUrl,
                });

                return await getCached(projectIri, () =>
                    apiProjectsIdOrSlugGet({
                        path: { idOrSlug: id },
                        headers,
                    }),
                );
            };

            const getCachedUser = async (id: string | null) => {
                if (!id) return null;

                const userIri = client.buildUrl<ApiUsersIdGetData>({
                    path: { id: id },
                    baseUrl: getBaseUrl(),
                    url: apiUsersIdGetUrl,
                });

                return await getCached(userIri, () => apiUsersIdGet({ path: { id }, headers }));
            };

            const checkoutCache = new Map<string, any>();
            const getCachedCheckout = async (id: string | null) => {
                if (!id) return null;
                if (checkoutCache.has(id)) return checkoutCache.get(id);
                const { data } = await apiGatewayCheckoutsIdGet({ path: { id }, headers });
                checkoutCache.set(id, data);
                return data;
            };

            charges = await Promise.all(
                loadedCharges.map(async (charge): Promise<ExtendedCharge> => {
                    try {
                        const targetId = extractId(charge.target);
                        const checkoutId = extractId(charge.checkout);

                        const [accounting, checkout] = await Promise.all([
                            getCachedAccounting(targetId),
                            getCachedCheckout(checkoutId),
                        ]);

                        const projectId = extractId(accounting?.owner);
                        const project = projectId ? await getCachedProject(projectId) : null;

                        const originAccountingId = extractId(checkout?.origin);
                        const originAccounting = await getCachedAccounting(originAccountingId);

                        const [targetDisplayName, originDisplayName] = await Promise.all([
                            getUserDisplayName(accounting, getCachedUser, getCachedProject),
                            getUserDisplayName(originAccounting, getCachedUser, getCachedProject),
                        ]);

                        return {
                            ...charge,
                            targetDisplayName,
                            originDisplayName,
                            paymentMethod: extractId(checkout?.gateway) ?? "—",
                            refundToWallet: checkout?.refund
                                ? $t(`contributions.table.rows.refund.${checkout.refund}`)
                                : "—",
                            platformLinks: checkout?.links ?? [
                                { href: "-", rel: "—", method: "—" },
                            ],
                            trackingCodes: checkout?.trackings ?? [{ title: "—", value: "—" }],
                        };
                    } catch (error) {
                        console.warn("Error loading charge", error);
                        return {
                            ...charge,
                            targetDisplayName: "—",
                            originDisplayName: "—",
                            paymentMethod: "—",
                            refundToWallet: "—",
                            platformLinks: [{ href: "-", rel: "—", method: "—" }],
                            trackingCodes: [{ title: "—", value: "—" }],
                        };
                    }
                }),
            );

            chargesCache.set(cacheKey, charges);

            if (currentPage === 1 && currentCount > largestLoaded) {
                largestLoaded = currentCount;
                const newBaseKey = JSON.stringify({ page: 1, itemsPerPage: currentCount });
                chargesCache.set(newBaseKey, charges);
            }
        } catch (err) {
            console.error("Error loading charges", err);
        } finally {
            lastItemsPerPage = Number(itemsPerPage);
            isLoading = false;
            if (isFirstLoad) isFirstLoad = false;
        }
    }

    async function getUserDisplayName(
        resource: any,
        getCachedUser: (id: string | null) => Promise<any>,
        getCachedProject: (id: string | null) => Promise<any>,
    ): Promise<string> {
        if (!resource?.owner) return "—";

        const ownerId = extractId(resource.owner);

        if (resource.owner.startsWith("/v4/projects/")) {
            const project = await getCachedProject(ownerId);

            return project.title;
        }

        if (resource.owner.startsWith("/v4/users/")) {
            return (await getCachedUser(ownerId))?.displayName ?? "—";
        }

        return "—";
    }

    function getDate(chargeDate: string | null | undefined): {
        date: string;
        time: string;
        fulltime: string;
    } {
        if (!chargeDate) {
            return { date: "—", time: "—", fulltime: "—" };
        }

        const d = new Date(chargeDate);
        if (isNaN(d.getTime())) {
            return { date: "—", time: "—", fulltime: "—" };
        }

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hour = String(d.getHours()).padStart(2, "0");
        const minute = String(d.getMinutes()).padStart(2, "0");

        return {
            date: `${year}-${month}-${day}`,
            time: `${hour}:${minute}h`,
            fulltime: `${year}-${month}-${day} ${hour}:${minute}`,
        };
    }

    let { filters } = $props<{
        filters: {
            paymentMethod: string;
            chargeStatus: string;
            rangeAmount: string;
            from?: string;
            to?: string;
            target?: string;
        };
    }>();

    $effect(() => {
        const { chargeStatus, rangeAmount, from, to, paymentMethod, target } = filters;
        charges = [];

        loadCharges({ chargeStatus, rangeAmount, from, to, paymentMethod, target });
    });
</script>

<div class="flex justify-between">
    <div class="flex flex-row items-center gap-2">
        <p class="font-bold text-[#575757]">
            {$t("contributions.filters.order.title")}
        </p>
        <select name="data" id="date" class="border-tertiary text-tertiary rounded-sm py-1">
            <option value="date">{$t("contributions.filters.order.options.date-desc")}</option>
        </select>
    </div>

    <div class="flex flex-row items-center gap-2">
        <p class="font-bold text-[#575757]">
            {$t("contributions.filters.itemsPerPage.title")}
        </p>
        <select
            name="itemsPerPage"
            id="itemsPerPage"
            class="border-tertiary text-tertiary rounded-sm py-1"
            bind:value={itemsPerPage}
            disabled={isLoading}
        >
            {#each Object.entries($t("contributions.filters.itemsPerPage.options")) as [value, label]}
                <option {value}>{label}</option>
            {/each}
        </select>
    </div>
</div>

<Table class="w-full border-separate border-spacing-y-2">
    <TableHead class="bg-secondary">
        {#each tableHeaders as { name }}
            <TableHeadCell
                class="py-4 text-base whitespace-nowrap 
                       text-[#FBFBFB] first:rounded-l-md last:rounded-r-md"
            >
                {$t(name)}
            </TableHeadCell>
        {/each}
    </TableHead>

    <TableBody class="text-base">
        {#if isFirstLoad}
            <TableBodyRow>
                <TableBodyCell colspan={tableHeaders.length}>
                    <div class="flex justify-center py-6">
                        <Loader />
                    </div>
                </TableBodyCell>
            </TableBodyRow>
        {:else if charges.length === 0 && !isLoading}
            <TableBodyRow>
                <TableBodyCell colspan={tableHeaders.length} class="text-center">
                    {$t("contributions.table.rows.noData")}
                </TableBodyCell>
            </TableBodyRow>
        {:else}
            {#each charges as charge, i}
                <TableBodyRow
                    onclick={() => toggleRow(i)}
                    class="{openRow === i
                        ? 'bg-[#FAF9FF]'
                        : 'bg-white'} border border-[#e6e5f7] transition-colors hover:bg-[#FAF9FF]"
                >
                    <TableBodyCell
                        class="truncate rounded-l-md border-t border-b border-l border-[#E6E5F7] "
                        >{charge.targetDisplayName}</TableBodyCell
                    >
                    {#if charge.money.amount && charge.money.currency}
                        <TableBodyCell class="border-t border-b border-[#E6E5F7]">
                            {formatCurrency(charge.money.amount, charge.money.currency, {
                                showSymbol: true,
                            })}
                        </TableBodyCell>
                    {:else}
                        <TableBodyCell class="border-t border-b border-[#E6E5F7]">—</TableBodyCell>
                    {/if}
                    <TableBodyCell class="truncate border-t border-b border-[#E6E5F7]"
                        >{charge.originDisplayName}</TableBodyCell
                    >
                    <TableBodyCell class="border-t border-b border-[#E6E5F7]">
                        {$t(`contributions.table.rows.payments.${charge.paymentMethod}`)}
                    </TableBodyCell>
                    <TableBodyCell class="border-t border-b border-[#E6E5F7]">
                        {getDate(charge.dateCreated).date}
                        <p
                            class="text-tertiary max-w-[180px] cursor-pointer truncate text-[12px] whitespace-nowrap underline"
                            title={charge.trackingCodes[0]?.value || "—"}
                        >
                            {charge.trackingCodes[0]?.value || "—"}
                        </p>
                    </TableBodyCell>
                    <TableBodyCell class="border-t border-b border-[#E6E5F7]">
                        <button
                            class="border-secondary text-secondary flex items-center gap-1 rounded border px-3 py-1 text-base font-medium"
                        >
                            {$t(`contributions.table.rows.status.${charge.status}`)}
                        </button>
                    </TableBodyCell>

                    <TableBodyCell class="rounded-r-md border-t border-r border-b border-[#E6E5F7]"
                        >{charge.refundToWallet}</TableBodyCell
                    >
                </TableBodyRow>
                {#if openRow === i}
                    <TableBodyRow>
                        <TableBodyCell
                            colspan={tableHeaders.length}
                            class="rounded-lg border border-[#E6E5F7] bg-[#FAF9FF] shadow-[0px_1px_3px_0px_#0000001A]"
                        >
                            <DetailsRow
                                platformLinks={charge.platformLinks}
                                trackingCodes={charge.trackingCodes}
                                dataTimeCreated={getDate(charge.dateCreated)}
                                dataTimeUpdated={getDate(charge.dateUpdated)}
                                id={charge.id ? String(charge.id) : "-"}
                                refundToWallet={charge.refundToWallet}
                            />
                        </TableBodyCell>
                    </TableBodyRow>
                {/if}
            {/each}

            {#if isLoading}
                <TableBodyRow>
                    <TableBodyCell colspan={tableHeaders.length}>
                        <div class="flex justify-center py-4">
                            <Loader />
                        </div>
                    </TableBodyCell>
                </TableBodyRow>
            {/if}
        {/if}
    </TableBody>
</Table>

<Pagination bind:currentPage items={Number(itemsPerPage)} total={totalItems} {isLoading} />
