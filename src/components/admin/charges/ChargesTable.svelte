<script lang="ts" module>
    import type { DataTableHeader, SortOption } from "../../library/tables/DataTable.svelte";
    import type { GatewayCharge, Link, Tracking } from "../../../openapi/client/index.ts";

    export type ExtendedCharge = GatewayCharge & {
        targetDisplayName?: string;
        originDisplayName?: string;
        checkoutOrigin?: string;
        paymentGateway?: string;
        platformLinks?: Link[];
        trackingCodes?: Tracking[];
        concept?: string;
    };

    export type ChargeSortKey =
        "date-asc" | "date-desc" | "amount-asc" | "amount-desc" | "status-asc" | "status-desc";

    export const CHARGE_ITEMS_PER_PAGE_LABEL = "pages.admin.charges.filters.itemsPerPage.title";

    export const chargeSortOptions: SortOption[] = [
        {
            key: "date-desc",
            field: "dateCreated",
            direction: "desc",
            label: "pages.admin.charges.filters.order.options.date-desc",
        },
        {
            key: "date-asc",
            field: "dateCreated",
            direction: "asc",
            label: "pages.admin.charges.filters.order.options.date-asc",
        },
        {
            key: "amount-desc",
            field: "money.amount",
            direction: "desc",
            label: "pages.admin.charges.filters.order.options.amount-desc",
        },
        {
            key: "amount-asc",
            field: "money.amount",
            direction: "asc",
            label: "pages.admin.charges.filters.order.options.amount-asc",
        },
        {
            key: "status-asc",
            field: "status",
            direction: "asc",
            label: "pages.admin.charges.filters.order.options.status-asc",
        },
        {
            key: "status-desc",
            field: "status",
            direction: "desc",
            label: "pages.admin.charges.filters.order.options.status-desc",
        },
    ];

    export const chargeTableHeaders: DataTableHeader[] = [
        { key: "pages.admin.charges.headers.target" },
        { key: "pages.admin.charges.headers.amount", sortable: true, sortKey: "amount" },
        { key: "pages.admin.charges.headers.origin" },
        { key: "pages.admin.charges.headers.paymentGateway" },
        { key: "pages.admin.charges.headers.date", sortable: true, sortKey: "date" },
        { key: "pages.admin.charges.headers.status", sortable: true, sortKey: "status" },
        { key: "", class: "w-12" },
    ];
</script>

<script lang="ts">
    import { TableBodyCell } from "flowbite-svelte";

    import ChargesDetailsRow from "./ChargesDetailsRow.svelte";
    import DataTable from "../../library/tables/DataTable.svelte";
    import { t } from "../../../i18n/store";
    import { ADMIN_ITEMS_PER_PAGE_OPTIONS } from "../../../utils/adminTable";
    import { formatCurrency } from "../../../utils/currencies";
    import Chevron from "../../icons/navigation/Chevron.svelte";

    let {
        charges = [],
        currentPage = 1,
        totalItems = 0,
        itemsPerPage = ADMIN_ITEMS_PER_PAGE_OPTIONS[0],
        isLoading = false,
        selectedSort = $bindable<ChargeSortKey>("date-desc"),
        paymentGatewayById = new Map<string, string>(),
        onPageChange,
        onItemsPerPageChange,
        onSortChange,
    }: {
        charges: ExtendedCharge[] | undefined;
        currentPage: number;
        totalItems: number;
        itemsPerPage: number;
        isLoading: boolean;
        selectedSort: ChargeSortKey;
        paymentGatewayById?: Map<string, string>;
        onPageChange?: (page: number) => void;
        onItemsPerPageChange?: (perPage: number) => void;
        onSortChange?: (sort: ChargeSortKey) => void;
    } = $props();

    let openRow = $state<number | null>(null);

    function toggleRow(_row: ExtendedCharge, index: number): void {
        openRow = openRow === index ? null : index;
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
        const second = String(d.getSeconds()).padStart(2, "0");

        return {
            date: `${year}-${month}-${day}`,
            time: `${hour}:${minute}:${second}h`,
            fulltime: `${year}-${month}-${day} ${hour}:${minute}:${second}`,
        };
    }

    function resolvePaymentGatewayLabel(raw: string | null | undefined): string {
        if (!raw) return "—";
        const id = raw.includes("/") ? (raw.split("/").filter(Boolean)[2] ?? raw) : raw;
        return paymentGatewayById.get(id) ?? raw;
    }

    function handleHeaderSort(field: string): void {
        const fieldMap: Record<string, string> = {
            amount: "money.amount",
            date: "dateCreated",
            status: "status",
        };

        const targetField = fieldMap[field] ?? field;

        const opt = chargeSortOptions.find((o) => o.key === selectedSort);
        const sameField = opt?.field === targetField;
        const newDirection = sameField && opt?.direction === "asc" ? "desc" : "asc";

        const newKey = chargeSortOptions.find(
            (o) => o.field === targetField && o.direction === newDirection,
        )?.key as ChargeSortKey | undefined;

        if (newKey) onSortChange?.(newKey);
    }
</script>

<DataTable
    headers={chargeTableHeaders}
    rows={charges ?? []}
    {isLoading}
    emptyMessage="pages.admin.charges.noData"
    {currentPage}
    {totalItems}
    {itemsPerPage}
    paginationPrefix="common.pagination"
    sortOptions={chargeSortOptions}
    {selectedSort}
    sortLabel="pages.admin.charges.filters.order.title"
    itemsPerPageLabel={CHARGE_ITEMS_PER_PAGE_LABEL}
    itemsPerPageOptions={[...ADMIN_ITEMS_PER_PAGE_OPTIONS]}
    {onPageChange}
    {onItemsPerPageChange}
    onSort={(k) => onSortChange?.(k as ChargeSortKey)}
    onHeaderSort={handleHeaderSort}
    onRowClick={toggleRow}
    bind:expandedRowIndex={openRow}
>
    {#snippet children(charge, i)}
        <TableBodyCell
            class="border-variant1 max-w-80 truncate rounded-l-md border-t border-b border-l p-4"
        >
            {charge.targetDisplayName}
        </TableBodyCell>
        <TableBodyCell class="border-variant1 border-t border-b p-4">
            {charge.money.amount && charge.money.currency
                ? formatCurrency(charge.money.amount, charge.money.currency)
                : "—"}
        </TableBodyCell>
        <TableBodyCell class="border-variant1 truncate border-t border-b p-4">
            {charge.originDisplayName}
        </TableBodyCell>
        <TableBodyCell class="border-variant1 border-t border-b p-4">
            {resolvePaymentGatewayLabel(charge.paymentGateway)}
        </TableBodyCell>
        <TableBodyCell class="border-variant1 border-t border-b">
            {getDate(charge.dateCreated).date}
            <p
                class="text-secondary decoration-secondary/64 max-w-25 cursor-pointer truncate text-xs/4 whitespace-nowrap underline opacity-64"
                title={charge.trackingCodes?.[0]?.value || "—"}
            >
                {charge.trackingCodes?.[0]?.value || "—"}
            </p>
        </TableBodyCell>
        <TableBodyCell class="border-variant1 border-t border-b p-4">
            <div class="flex justify-center">
                <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                    {$t(`domain.charges.status.${charge.status}`)}
                </span>
            </div>
        </TableBodyCell>
        <TableBodyCell
            class="border-variant1 text-content rounded-r-md border-t border-r border-b p-4 text-sm"
        >
            <Chevron
                direction={openRow === i ? "up" : "down"}
                width="20"
                height="20"
                class="mx-auto"
            />
        </TableBodyCell>
    {/snippet}
    {#snippet details(charge)}
        <ChargesDetailsRow {charge} />
    {/snippet}
</DataTable>
