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
    import { client } from "../../openapi/client/client.gen.ts";

    import {
        apiUsersIdGetUrl,
        apiProjectsIdOrSlugGetUrl,
        apiAccountingsIdGetUrl,
        apiGatewayCheckoutsIdGetUrl,
        apiGatewayChargesGetCollectionUrl,
    } from "../../../src/openapi/client/paths.gen";

    import type {
        GatewayCharge,
        Tracking,
        Link,
        Accounting,
        User,
        Project,
        GatewayCheckout,
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

    async function fetchAccounting(id: string | null, token: string) {
        if (!id) return;
        const url = client.buildUrl({
            url: apiAccountingsIdGetUrl,
            path: { id },
        });
        return fetchWithPersistentCache<Accounting>(url, token);
    }

    async function fetchUser(id: string | null, token: string) {
        if (!id) return;
        const url = client.buildUrl({
            url: apiUsersIdGetUrl,
            path: { id },
        });
        return fetchWithPersistentCache<User>(url, token);
    }

    async function fetchProject(idOrSlug: string | null, token: string) {
        if (!idOrSlug) return;
        const url = client.buildUrl({
            url: apiProjectsIdOrSlugGetUrl,
            path: { idOrSlug },
        });
        return fetchWithPersistentCache<Project>(url, token);
    }

    async function fetchCheckout(id: string | null, token: string) {
        if (!id) return;
        const url = client.buildUrl({
            url: apiGatewayCheckoutsIdGetUrl,
            path: { id },
        });
        return fetchWithPersistentCache<GatewayCheckout>(url, token);
    }

    function getOwnerFromAccounting(
        accounting: Accounting | undefined,
        users: Map<string, User>,
        projects: Map<string, Project>,
    ): string {
        if (!accounting?.owner) return "—";

        const id = extractId(accounting.owner);
        if (!id) return "—";

        if (accounting.owner.startsWith("/v4/users/")) {
            return users.get(id)?.displayName ?? "—";
        }

        if (accounting.owner.startsWith("/v4/projects/")) {
            return projects.get(id)?.title ?? "—";
        }

        return "—";
    }

    const API_CACHE_NAME = "charges-cache";

    async function fetchWithPersistentCache<T>(url: string, token: string): Promise<T> {
        const cache = await caches.open(API_CACHE_NAME);

        const cached = await cache.match(url);
        if (cached) return cached.json();

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/ld+json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        await cache.put(url, response.clone());
        return response.json();
    }

    // function buildChargesQuery(
    //     filters: ApiGatewayChargesGetCollectionData["query"],
    //     page: number,
    //     itemsPerPage: number,
    // ) {
    //     if (!filters) return {};
    //     const sort = sortOptions.find((option) => option.key === selectedSort);

    //     const query: Record<string, any> = {
    //         page: page,
    //         itemsPerPage: itemsPerPage,
    //         pagination: true,
    //         ...filters,
    //     };

    //     if (sort) {
    //         query.order = { [sort.field]: sort.direction };
    //     }

    //     if (filters.status && filters.status !== "all") {
    //         query.status = filters.status;
    //     }

    //     if (filters["money.amount[gte]"]) {
    //         query["money.amount[gte]"] = filters["money.amount[gte]"];
    //     }

    //     if (filters["money.amount[between]"]) {
    //         query["money.amount[between]"] = filters["money.amount[between]"];
    //     }

    //     if (filters.target) {
    //         query.target = filters.target;
    //     }
    // }

    const chargesPageCache = new Map<string, ExtendedCharge[]>();
    let largestLoaded = 0;

    async function loadCharges(filters: any) {
        isLoading = true;

        try {
            const token = getAccessToken();
            if (!token) return;

            const query: Record<string, string> = {
                filters,
                page: String(currentPage),
                itemsPerPage: String(itemsPerPage),
            };

            const collection = await fetchWithPersistentCache<
                GatewayChargesCollection<GatewayCharge>
            >(
                client.buildUrl({
                    url: apiGatewayChargesGetCollectionUrl,
                    query,
                }),
                token,
            );

            console.log("Fetched charges collection:", collection);

            const loadedCharges = collection.member ?? [];
            totalItems = collection.totalItems ?? 0;

            const checkoutIds = new Set<string>();
            const accountingIds = new Set<string>();

            for (const charge of loadedCharges) {
                const checkoutId = extractId(charge.checkout);
                const targetId = extractId(charge.target);
                if (checkoutId) checkoutIds.add(checkoutId);
                if (targetId) accountingIds.add(targetId);
            }

            const checkoutIdList = [...checkoutIds];
            const checkouts = await Promise.all(
                checkoutIdList.map((id) => fetchCheckout(id, token)),
            );

            const checkoutById = new Map<string, GatewayCheckout>();
            checkoutIdList.forEach((id, i) => {
                const checkout = checkouts[i];
                if (checkout) checkoutById.set(id, checkout);
            });

            for (const checkout of checkouts) {
                const originId = extractId(checkout?.origin);
                if (originId) accountingIds.add(originId);
            }

            const accountingIdList = [...accountingIds];
            const accountings = await Promise.all(
                accountingIdList.map((id) => fetchAccounting(id, token)),
            );

            const accountingById = new Map<string, Accounting>();
            accountingIdList.forEach((id, i) => {
                const acc = accountings[i];
                if (acc) accountingById.set(id, acc);
            });

            const userIds = new Set<string>();
            const projectIds = new Set<string>();

            for (const acc of accountings) {
                const ownerId = extractId(acc?.owner);
                if (!ownerId) continue;

                if (acc?.owner?.startsWith("/v4/users/")) userIds.add(ownerId);
                if (acc?.owner?.startsWith("/v4/projects/")) projectIds.add(ownerId);
            }

            const userIdList = [...userIds];
            const projectIdList = [...projectIds];

            const [users, projects] = await Promise.all([
                Promise.all(userIdList.map((id) => fetchUser(id, token))),
                Promise.all(projectIdList.map((id) => fetchProject(id, token))),
            ]);

            const userById = new Map<string, User>();
            userIdList.forEach((id, i) => {
                const user = users[i];
                if (user) userById.set(id, user);
            });

            const projectById = new Map<string, Project>();
            projectIdList.forEach((id, i) => {
                const project = projects[i];
                if (project) projectById.set(id, project);
            });

            charges = loadedCharges.map((charge): ExtendedCharge => {
                const checkout = checkoutById.get(extractId(charge.checkout) ?? "");
                const targetAcc = accountingById.get(extractId(charge.target) ?? "");
                const originAcc = accountingById.get(extractId(checkout?.origin) ?? "");

                return {
                    ...charge,
                    targetDisplayName: getOwnerFromAccounting(targetAcc, userById, projectById),
                    originDisplayName: getOwnerFromAccounting(originAcc, userById, projectById),
                    paymentMethod: extractId(checkout?.gateway) ?? "—",
                    refundToWallet: checkout?.refund
                        ? $t(`contributions.table.rows.refund.${checkout.refund}`)
                        : "—",
                    platformLinks: checkout?.links ?? [],
                    trackingCodes: checkout?.trackings ?? [],
                };
            });
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

    let { filters } = $props<{ filters: ApiGatewayChargesGetCollectionData["query"] }>();

    $effect(() => {
        charges = [];
        loadCharges(filters);
    });
</script>

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
    <TableHead class="bg-tertiary">
        {#each tableHeaders as header}
            <TableHeadCell
                class="py-4 text-base whitespace-nowrap text-white first:rounded-l-md last:rounded-r-md
                       {header.sortable ? 'hover:bg-opacity-80 cursor-pointer select-none' : ''}"
                onclick={() => handleHeaderClick(header)}
            >
                <div class="flex items-center justify-between">
                    <span>{$t(header.name)}</span>
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
                        : 'bg-white'} border-variant1 hover:bg-soft-purple] border transition-colors"
                >
                    <TableBodyCell
                        class="border-variant1 truncate rounded-l-md border-t border-b border-l "
                        >{charge.targetDisplayName}</TableBodyCell
                    >
                    {#if charge.money.amount && charge.money.currency}
                        <TableBodyCell class="border-variant1 border-t border-b">
                            {formatCurrency(charge.money.amount, charge.money.currency)}
                        </TableBodyCell>
                    {:else}
                        <TableBodyCell class="border-variant1 border-t border-b">—</TableBodyCell>
                    {/if}
                    <TableBodyCell class="border-variant1 truncate border-t border-b"
                        >{charge.originDisplayName}</TableBodyCell
                    >
                    <TableBodyCell class="border-variant1 border-t border-b">
                        {$t(`contributions.table.rows.payments.${charge.paymentMethod}`)}
                    </TableBodyCell>
                    <TableBodyCell class="border-variant1 border-t border-b">
                        {getDate(charge.dateCreated).date}
                        <p
                            class="text-secondary max-w-[180px] cursor-pointer truncate text-[12px] whitespace-nowrap underline"
                            title={charge.trackingCodes[0]?.value || "—"}
                        >
                            {charge.trackingCodes[0]?.value || "—"}
                        </p>
                    </TableBodyCell>
                    <TableBodyCell class="border-variant1 border-t border-b">
                        <button
                            class="border-tertiary text-tertiary flex items-center gap-1 rounded border px-3 py-1 text-base font-medium"
                        >
                            {$t(`contributions.table.rows.status.${charge.status}`)}
                        </button>
                    </TableBodyCell>

                    <TableBodyCell class="border-variant1 rounded-r-md border-t border-r border-b"
                        >{charge.refundToWallet}</TableBodyCell
                    >
                </TableBodyRow>
                {#if openRow === i}
                    <TableBodyRow>
                        <TableBodyCell
                            colspan={tableHeaders.length}
                            class="border-variant1 bg-soft-purple] rounded-lg border shadow-[0px_1px_3px_0px_#0000001A]"
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
