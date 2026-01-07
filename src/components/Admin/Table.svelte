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
    import DetailsRow from "./DetailsRow.svelte";

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
        Accounting,
        ApiProjectsIdOrSlugGetData,
        ApiUsersIdGetData,
        ApiGatewayChargesGetCollectionData,
    } from "../../../src/openapi/client/index.ts";

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

    type SortOption = {
        key: string;
        field: string;
        direction: "asc" | "desc";
        label: string;
    };

    const sortOptions: SortOption[] = [
        {
            key: "date-desc",
            field: "dateCreated",
            direction: "desc",
            label: "contributions.filters.order.options.date-desc",
        },
        {
            key: "date-asc",
            field: "dateCreated",
            direction: "asc",
            label: "contributions.filters.order.options.date-asc",
        },
        {
            key: "amount-desc",
            field: "money.amount",
            direction: "desc",
            label: "contributions.filters.order.options.amount-desc",
        },
        {
            key: "amount-asc",
            field: "money.amount",
            direction: "asc",
            label: "contributions.filters.order.options.amount-asc",
        },
        {
            key: "status-desc",
            field: "status",
            direction: "desc",
            label: "contributions.filters.order.options.status-desc",
        },
        {
            key: "status-asc",
            field: "status",
            direction: "asc",
            label: "contributions.filters.order.options.status-asc",
        },
    ];

    let selectedSort = $state("date-desc");

    const tableHeaders = [
        { name: "contributions.table.headers.target", sortable: false },
        { name: "contributions.table.headers.amount", sortable: true, sortKey: "amount" },
        { name: "contributions.table.headers.origin", sortable: false },
        { name: "contributions.table.headers.paymentMethod", sortable: false },
        { name: "contributions.table.headers.date", sortable: true, sortKey: "date" },
        { name: "contributions.table.headers.chargeStatus", sortable: true, sortKey: "status" },
        { name: "contributions.table.headers.refundToWallet", sortable: false },
        { name: "", sortable: false }, // For the empty expand/collapse button at the end of the table
    ];

    let openRow = $state<number | null>(null);
    let charges = $state<ExtendedCharge[]>([]);
    let itemsPerPage = $state("10");
    let currentPage = $state(1);
    let isLoading = $state(false);
    let isFirstLoad = $state(true);
    let totalItems = $state(0);
    let lastItemsPerPageSnapshot = 10;

    const toggleRow = (i: number) => {
        openRow = openRow === i ? null : i;
    };

    const accountingMap = new Map<string, Accounting>();
    const userMap = new Map<string, ApiUsersIdGetData>();
    const projectMap = new Map<string, ApiProjectsIdOrSlugGetData>();
    const checkoutMap = new Map<string, any>();

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

    function handleHeaderClick(header: any) {
        if (!header.sortable) return;

        const currentSortOption = sortOptions.find((option) => option.key === selectedSort);
        const isCurrentField =
            currentSortOption?.field === `money.${header.sortKey}` ||
            currentSortOption?.field === header.sortKey ||
            (header.sortKey === "date" && currentSortOption?.field === "dateCreated");

        if (isCurrentField) {
            const newDirection = currentSortOption?.direction === "asc" ? "desc" : "asc";
            const newSortKey = sortOptions.find(
                (option) =>
                    (option.field === currentSortOption?.field ||
                        (header.sortKey === "amount" && option.field === "money.amount") ||
                        (header.sortKey === "date" && option.field === "dateCreated")) &&
                    option.direction === newDirection,
            )?.key;

            if (newSortKey) {
                selectedSort = newSortKey;
            }
        } else {
            let targetField = header.sortKey;
            if (header.sortKey === "amount") targetField = "money.amount";
            if (header.sortKey === "date") targetField = "dateCreated";

            const newSortKey = sortOptions.find(
                (option) => option.field === targetField && option.direction === "desc",
            )?.key;

            if (newSortKey) {
                selectedSort = newSortKey;
            }
        }
    }

    function getSortIndicator(header: any): string {
        if (!header.sortable) return "";

        const currentSortOption = sortOptions.find((option) => option.key === selectedSort);
        if (!currentSortOption) return "↕️";

        const isCurrentField =
            currentSortOption?.field === header.sortKey ||
            (header.sortKey === "amount" && currentSortOption?.field === "money.amount") ||
            (header.sortKey === "date" && currentSortOption?.field === "dateCreated");

        if (isCurrentField) {
            return currentSortOption.direction === "asc" ? "▲" : "▼";
        }

        return "↕️";
    }

    async function resolveWithCache(
        id: string | null,
        cache: Map<string, any>,
        resolver: (id: string) => Promise<any>,
    ): Promise<any> {
        if (id === null) return null;
        if (cache.has(id)) return cache.get(id)!;

        const data = await resolver(id);
        cache.set(id, data);
        return data;
    }

    function resolveAccounting(id: string | null, headers: any) {
        return resolveWithCache(id, accountingMap, async (id) => {
            const { data } = await apiAccountingsIdGet({ path: { id }, headers });
            return data;
        });
    }

    function resolveUser(id: string | null, headers: any) {
        return resolveWithCache(id, userMap, async (id) => {
            const { data } = await apiUsersIdGet({ path: { id }, headers });
            return data;
        });
    }

    function resolveProject(id: string | null, headers: any) {
        return resolveWithCache(id, projectMap, async (id) => {
            const { data } = await apiProjectsIdOrSlugGet({
                path: { idOrSlug: id },
                headers,
            });
            return data;
        });
    }

    function resolveCheckout(id: string | null, headers: any) {
        return resolveWithCache(id, checkoutMap, async (id) => {
            const { data } = await apiGatewayCheckoutsIdGet({ path: { id }, headers });
            return data;
        });
    }

    function getDisplayNameFromAccounting(accounting?: Accounting): string {
        if (!accounting?.owner) return "—";

        const ownerId = extractId(accounting?.owner);
        if (!ownerId) return "—";

        if (accounting.owner.startsWith("/v4/users/")) {
            return userMap.get(ownerId)?.displayName ?? "—";
        }

        if (accounting.owner.startsWith("/v4/projects/")) {
            return projectMap.get(ownerId)?.title ?? "—";
        }

        return "—";
    }

    const chargesPageCache = new Map<string, ExtendedCharge[]>();
    let largestLoaded = 0;

    async function loadCharges(filters: any) {
        isLoading = true;

        const currentCount = Number(itemsPerPage);

        const pageCacheKey = JSON.stringify({
            page: currentPage,
            itemsPerPage: currentCount,
            filters,
        });

        if (chargesPageCache.has(pageCacheKey)) {
            charges = chargesPageCache.get(pageCacheKey)!;
            lastItemsPerPageSnapshot = currentCount;
            isLoading = false;
            return;
        }

        if (currentPage === 1 && currentCount < largestLoaded) {
            const baseKey = JSON.stringify({
                page: 1,
                itemsPerPage: largestLoaded,
                filters,
            });

            if (chargesPageCache.has(baseKey)) {
                charges = chargesPageCache.get(baseKey)!.slice(0, currentCount);
                lastItemsPerPageSnapshot = currentCount;
                isLoading = false;
                return;
            }
        }

        try {
            const token = getAccessToken();
            if (!token) return;

            const headers = { Authorization: `Bearer ${token}` };

            const { data } = await apiGatewayChargesGetCollection({
                headers: { ...headers, Accept: "application/ld+json" },
                query: {
                    page: currentPage,
                    itemsPerPage: Number(itemsPerPage),
                },
            });

            const collection = data as unknown as GatewayChargesCollection<GatewayCharge>;

            const loadedCharges: GatewayCharge[] = collection.member ?? [];
            totalItems = collection.totalItems ?? 0;

            const accountingIds = new Set<string>();
            const checkoutIds = new Set<string>();

            for (const charge of loadedCharges) {
                const targetId = extractId(charge.target);
                const checkoutId = extractId(charge.checkout);
                if (targetId) accountingIds.add(targetId);
                if (checkoutId) checkoutIds.add(checkoutId);
            }

            await Promise.all([...checkoutIds].map((id) => resolveCheckout(id, headers)));

            for (const checkout of checkoutMap.values()) {
                const originId = extractId(checkout?.origin);
                if (originId) accountingIds.add(originId);
            }

            await Promise.all([...accountingIds].map((id) => resolveAccounting(id, headers)));

            const userIds = new Set<string>();
            const projectIds = new Set<string>();

            for (const accounting of accountingMap.values()) {
                const ownerId = extractId(accounting.owner);
                if (!ownerId) continue;

                if (accounting.owner?.startsWith("/v4/users/")) {
                    userIds.add(ownerId);
                }

                if (accounting.owner?.startsWith("/v4/projects/")) {
                    projectIds.add(ownerId);
                }
            }

            await Promise.all([
                ...[...userIds].map((id) => resolveUser(id, headers)),
                ...[...projectIds].map((id) => resolveProject(id, headers)),
            ]);

            charges = loadedCharges.map((charge): ExtendedCharge => {
                const checkoutId = extractId(charge.checkout);
                const checkout = checkoutId ? checkoutMap.get(checkoutId) : undefined;

                const targetId = extractId(charge.target);
                const targetAcc = targetId ? accountingMap.get(targetId) : undefined;

                const originId = extractId(checkout?.origin);
                const originAcc = originId ? accountingMap.get(originId) : undefined;

                return {
                    ...charge,
                    targetDisplayName: getDisplayNameFromAccounting(targetAcc),
                    originDisplayName: getDisplayNameFromAccounting(originAcc),
                    paymentMethod: extractId(checkout?.gateway) ?? "—",
                    refundToWallet: checkout?.refund
                        ? $t(`contributions.table.rows.refund.${checkout.refund}`)
                        : "—",
                    platformLinks: checkout?.links ?? [{ href: "-", rel: "—", method: "—" }],
                    trackingCodes: checkout?.trackings ?? [{ title: "—", value: "—" }],
                };
            });

            chargesPageCache.set(pageCacheKey, charges);

            if (currentPage === 1 && currentCount > largestLoaded) {
                largestLoaded = currentCount;

                const baseKey = JSON.stringify({
                    page: 1,
                    itemsPerPage: currentCount,
                    filters,
                });

                chargesPageCache.set(baseKey, charges);
            }

            lastItemsPerPageSnapshot = currentCount;
        } finally {
            isLoading = false;
            isFirstLoad = false;
        }
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

    let { filters } = $props<{ filters: any }>();

    $effect(() => {
        charges = [];
        loadCharges(filters);
    });
</script>

<div class="flex flex-col gap-6">
    <div class="flex flex-col gap-4">
        <div class="flex justify-between">
            <div class="flex flex-row items-center gap-2">
                <p class="text-content font-bold">
                    {$t("contributions.filters.order.title")}
                </p>
                <select
                    bind:value={selectedSort}
                    class="border-secondary text-secondary min-w-[200px] rounded-sm py-1"
                    disabled={isLoading}
                >
                    {#each sortOptions as option}
                        <option value={option.key}>{$t(option.label)}</option>
                    {/each}
                </select>
            </div>

            <div class="flex flex-row items-center gap-2">
                <p class="text-content font-bold">
                    {$t("contributions.filters.itemsPerPage.title")}
                </p>
                <select
                    name="itemsPerPage"
                    id="itemsPerPage"
                    class="border-secondary text-secondary rounded-sm py-1"
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
            <TableHead>
                {#each tableHeaders as header}
                    <TableHeadCell
                        class="bg-black p-4 text-base whitespace-nowrap text-white first:rounded-l-lg last:rounded-r-lg
                       {header.sortable ? 'hover:bg-opacity-80 cursor-pointer select-none' : ''}"
                        onclick={() => handleHeaderClick(header)}
                    >
                        <div
                            class="flex items-center justify-between {header.name ===
                            'contributions.table.headers.chargeStatus'
                                ? 'justify-center'
                                : ''}"
                        >
                            <span class="normal-case">{$t(header.name)}</span>
                            {#if header.sortable}
                                <span class="ml-2 text-sm opacity-70">
                                    {getSortIndicator(header)}
                                </span>
                            {/if}
                        </div>
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
                                ? 'bg-soft-purple]'
                                : 'bg-white'} border-variant1 hover:bg-soft-purple] text-content border transition-colors"
                        >
                            <TableBodyCell
                                class="border-variant1 truncate rounded-l-md border-t border-b border-l p-4"
                                >{charge.targetDisplayName}</TableBodyCell
                            >
                            {#if charge.money.amount && charge.money.currency}
                                <TableBodyCell class="border-variant1 border-t border-b p-4">
                                    {formatCurrency(charge.money.amount, charge.money.currency)}
                                </TableBodyCell>
                            {:else}
                                <TableBodyCell class="border-variant1 border-t border-b p-4"
                                    >—</TableBodyCell
                                >
                            {/if}
                            <TableBodyCell class="border-variant1 truncate border-t border-b p-4"
                                >{charge.originDisplayName}</TableBodyCell
                            >
                            <TableBodyCell class="border-variant1 border-t border-b p-4">
                                {$t(`contributions.table.rows.payments.${charge.paymentMethod}`)}
                            </TableBodyCell>
                            <TableBodyCell class="border-variant1 border-t border-b p-4">
                                {getDate(charge.dateCreated).date}
                                <p
                                    class="text-secondary max-w-[180px] cursor-pointer truncate text-[12px] whitespace-nowrap underline"
                                    title={charge.trackingCodes[0]?.value || "—"}
                                >
                                    {charge.trackingCodes[0]?.value || "—"}
                                </p>
                            </TableBodyCell>
                            <TableBodyCell class="border-variant1 border-t border-b p-4">
                                <div class="flex justify-center">
                                    <button
                                        class="flex items-center gap-1 rounded border border-black px-3 py-1 text-base font-medium text-black"
                                    >
                                        {$t(`contributions.table.rows.status.${charge.status}`)}
                                    </button>
                                </div>
                            </TableBodyCell>

                            <TableBodyCell class="border-variant1 border-t border-b p-4"
                                >{charge.refundToWallet}</TableBodyCell
                            >
                            <TableBodyCell
                                class="border-variant1 rounded-r-md border-t border-r border-b p-4"
                                ><svg
                                    class={openRow === i
                                        ? "rotate-180 transform transition-transform"
                                        : "transition-transform"}
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M4.5 8.25L12 15.75L19.5 8.25"
                                        stroke="#3D3D3D"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg></TableBodyCell
                            >
                        </TableBodyRow>
                        {#if openRow === i}
                            <TableBodyRow>
                                <TableBodyCell
                                    colspan={tableHeaders.length}
                                    class="border-variant1 bg-soft-purple rounded-lg border py-10 shadow-[0px_1px_3px_0px_#0000001A]"
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
    </div>

    <Pagination bind:currentPage items={Number(itemsPerPage)} total={totalItems} {isLoading} />
</div>
