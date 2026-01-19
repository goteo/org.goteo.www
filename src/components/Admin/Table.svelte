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

    import {
        apiTipjarsGetCollectionUrl,
        apiUsersGetCollectionUrl,
        apiProjectsGetCollectionUrl,
    } from "../../../src/openapi/client/paths.gen";

    import type {
        Accounting,
        User,
        Project,
        ApiGatewayChargesGetCollectionData,
        Tipjar,
        GatewayCharge,
        Link,
        Tracking,
    } from "../../../src/openapi/client/index.ts";

    import {
        fetchAccounting,
        fetchProject,
        fetchTipjar,
        fetchUser,
    } from "../../utils/cachedFetch.ts";

    export type ExtendedCharge = GatewayCharge & {
        targetDisplayName: string;
        originDisplayName: string;
        paymentMethod: string;
        refundToWallet: string;
        platformLinks: Link[];
        trackingCodes: Tracking[];
        concept: string;
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

    const toggleRow = (i: number) => {
        openRow = openRow === i ? null : i;
    };

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

    // function buildChargesQuery(
    //     filters: ApiGatewayChargesGetCollectionData["query"],
    //     page: number,
    //     itemsPerPage: number,
    // ) {
    //     const sort = sortOptions.find((option) => option.key === selectedSort);

    //     const query: Record<string, ApiGatewayChargesGetCollectionData["query"]> = {
    //         page,
    //         itemsPerPage,
    //         pagination: true,
    //         ...filters,
    //     };

    //     if (sort) {
    //         query[`${sort.field}`] = sort.direction;
    //     }

    //     return query;
    // }

    function getDisplayNameFromAccounting(
        accounting: Accounting | undefined,
        owners: Map<string, User | Project | Tipjar>,
    ): string | undefined {
        const ownerIri = accounting?.owner;
        if (!ownerIri) return undefined;

        const owner = owners.get(ownerIri);
        if (!owner) return undefined;

        switch (ownerIri.split("/").slice(0, -1).join("/")) {
            case apiUsersGetCollectionUrl:
                return (owner as User).displayName ?? undefined;
                break;
            case apiProjectsGetCollectionUrl:
                return (owner as Project).title ?? undefined;
                break;
            case apiTipjarsGetCollectionUrl:
                return (owner as Tipjar).name ?? undefined;
                break;
        }

        return undefined;
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
        if (!ownerIri) {
            return;
        }

        if (ownerIri.startsWith(apiUsersGetCollectionUrl) && !owners.has(ownerIri)) {
            const user = await fetchUser(ownerIri, token, API_CACHE_NAME);
            if (user) owners.set(ownerIri, user);
        } else if (ownerIri.startsWith(apiProjectsGetCollectionUrl) && !owners.has(ownerIri)) {
            const project = await fetchProject(ownerIri, token, API_CACHE_NAME);
            if (project) owners.set(ownerIri, project);
        } else if (ownerIri.startsWith(apiTipjarsGetCollectionUrl) && !owners.has(ownerIri)) {
            const tipjar = await fetchTipjar(ownerIri, token, API_CACHE_NAME);
            if (tipjar) owners.set(ownerIri, tipjar);
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

    let {
        filters,
        charges,
        itemsPerPage,
        currentPage,
        isLoading,
        isFirstLoad,
        totalItems,
        API_CACHE_NAME,
    } = $props<{
        filters: ApiGatewayChargesGetCollectionData["query"];
        charges: ExtendedCharge[];
        itemsPerPage: number;
        currentPage: number;
        isLoading: boolean;
        isFirstLoad: boolean;
        totalItems: number;
        API_CACHE_NAME: string;
    }>();

    const reloadParams = $derived(() => ({
        filters,
        currentPage,
        itemsPerPage,
        selectedSort,
    }));

    $effect(() => {
        reloadParams();
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
                                        concept={charge.concept}
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
