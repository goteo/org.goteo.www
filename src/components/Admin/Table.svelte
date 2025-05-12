<script lang="ts">
    import RejectedIcon from "./../../svgs/RejectedIcon.svelte";
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
        apiProjectsIdGet,
        apiUsersIdGet,
        apiGatewayCheckoutsIdGet,
    } from "../../../src/openapi/client/index.ts";
    import type { GatewayCharge } from "../../../src/openapi/client/index.ts";
    import DetailsRow from "./DetailsRow.svelte";

    type ExtendedCharge = GatewayCharge & {
        targetDisplayName: string;
        originDisplayName: string;
        projectStatus: string;
        paymentMethod: string;
        refundToWallet: string;
        platformLink: string;
        trackingCode: string;
    };

    const tableHeaders = [
        { name: "contributions.table.headers.target" },
        { name: "contributions.table.headers.amount" },
        { name: "contributions.table.headers.origin" },
        { name: "contributions.table.headers.paymentMethod" },
        { name: "contributions.table.headers.date" },
        { name: "contributions.table.headers.statusProject" },
        { name: "contributions.table.headers.refundToWallet" },
    ];

    let openRow = $state<number | null>(null);
    let details = $state<ExtendedCharge | undefined>(undefined);
    let charges = $state<ExtendedCharge[]>([]);
    let itemsPerPage = $state("10");
    let currentPage = $state(1);
    let isLoading = $state(false);
    let isFirstLoad = $state(true);

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

    async function loadCharges() {
        isLoading = true;

        try {
            const token = getAccessToken();
            if (!token) {
                console.error("Token not found in cookies");
                return;
            }

            const headers = { Authorization: `Bearer ${token}` };
            const currentCount = Number(itemsPerPage);
            const cacheKey = JSON.stringify({ page: currentPage, itemsPerPage: currentCount });
            const baseKey = JSON.stringify({ page: 1, itemsPerPage: largestLoaded });

            if (chargesCache.has(cacheKey)) {
                charges = chargesCache.get(cacheKey)!;
                return;
            }

            if (currentPage === 1 && currentCount < largestLoaded && chargesCache.has(baseKey)) {
                charges = chargesCache.get(baseKey)!.slice(0, currentCount);
                return;
            }

            const { data: loadedCharges = [] } = await apiGatewayChargesGetCollection({
                headers,
                query: {
                    page: currentPage,
                    itemsPerPage: currentCount,
                },
            });

            const accountingCache = new Map<string, any>();
            const checkoutCache = new Map<string, any>();
            const projectCache = new Map<string, any>();
            const userCache = new Map<string, any>();

            const getCachedAccounting = async (id: string | null) => {
                if (!id) return null;
                if (accountingCache.has(id)) return accountingCache.get(id);
                const { data } = await apiAccountingsIdGet({ path: { id }, headers });
                accountingCache.set(id, data);
                return data;
            };

            const getCachedProject = async (id: string | null) => {
                if (!id) return null;
                if (projectCache.has(id)) return projectCache.get(id);
                const { data } = await apiProjectsIdGet({ path: { id }, headers });
                projectCache.set(id, data);
                return data;
            };

            const getCachedUser = async (id: string | null) => {
                if (!id) return null;
                if (userCache.has(id)) return userCache.get(id);
                const { data } = await apiUsersIdGet({ path: { id }, headers });
                userCache.set(id, data);
                return data;
            };

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
                            projectStatus: project?.status ?? "—",
                            paymentMethod: extractId(checkout?.gateway) ?? "—",
                            refundToWallet: checkout?.refund
                                ? $t(`contributions.table.rows.refund.${checkout.refund}`)
                                : "—",
                            platformLink: checkout?.links[0].href ?? "—",
                            trackingCode: checkout?.trackings[0].value ?? "—",
                        };
                    } catch (error) {
                        console.warn("Error loading charge", error);
                        return {
                            ...charge,
                            targetDisplayName: "—",
                            originDisplayName: "—",
                            projectStatus: "—",
                            paymentMethod: "—",
                            refundToWallet: "—",
                            platformLink: "—",
                            trackingCode: "—",
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
            const userId = extractId(project?.owner);
            return (await getCachedUser(userId))?.displayName ?? "—";
        }

        if (resource.owner.startsWith("/v4/users/")) {
            return (await getCachedUser(ownerId))?.displayName ?? "—";
        }

        return "—";
    }

    $effect(() => {
        loadCharges();
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
    <TableHead class="bg-secondary py-4">
        {#each tableHeaders as { name }}
            <TableHeadCell
                class="text-base whitespace-nowrap text-[#FBFBFB] 
                       first:rounded-l-md last:rounded-r-md"
            >
                {$t(name)}
            </TableHeadCell>
        {/each}
    </TableHead>

    <TableBody>
        {#if isFirstLoad}
            <TableBodyRow>
                <TableBodyCell colspan={tableHeaders.length}>
                    <div class="flex justify-center py-6">
                        <Loader />
                    </div>
                </TableBodyCell>
            </TableBodyRow>
        {:else}
            {#each charges as charge, i}
                <TableBodyRow
                    onclick={() => toggleRow(i)}
                    class="{openRow === i
                        ? 'bg-[#FAF9FF]'
                        : 'bg-white'} border border-[#e6e5f7] transition-colors hover:bg-[##FAF9FF]"
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
                    <TableBodyCell class="border-t border-b border-[#E6E5F7]">-</TableBodyCell>
                    <TableBodyCell class="border-t border-b border-[#E6E5F7]">
                        <button
                            class="
                            flex items-center gap-1 rounded border px-3 py-1 text-sm font-medium
                            {charge.projectStatus ===
                            $t('contributions.table.rows.if-status-is.rejected')
                                ? 'border-[#E94668] text-[#E94668]'
                                : charge.projectStatus === 'pending'
                                  ? 'border-secondary text-secondary'
                                  : 'border-secondary text-secondary'}
                          "
                        >
                            {#if charge.projectStatus === $t("contributions.table.rows.if-status-is.rejected")}
                                <RejectedIcon />
                            {/if}
                            {$t(`contributions.table.rows.status.${charge.projectStatus}`)}
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
                                platformLink={charge.platformLink}
                                trackingCode={charge.trackingCode}
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

<Pagination onPageChange={(page) => (currentPage = page)} items={Number(itemsPerPage)} total={50} />
