<script lang="ts">
    import {
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";

    import Pagination from "./Pagination.svelte";
    import { t } from "../../i18n/store";
    import Loader from "../library/feedback/Loader.svelte";

    import type { SortOption } from "../../stores/chargesPaginationAndSort";
    import type { Snippet } from "svelte";

    export interface DataTableHeader {
        key: string;
        sortable?: boolean;
        sortKey?: string;
        class?: string;
    }

    interface Props {
        headers: DataTableHeader[];
        rows: any[];
        isLoading: boolean;
        emptyMessage: string;
        sortOptions?: SortOption[];
        selectedSort?: string;
        sortLabel?: string;
        onSort?: (sortKey: string) => void;
        onHeaderSort?: (field: string) => void;
        currentPage?: number;
        totalItems?: number;
        itemsPerPage?: number;
        itemsPerPageOptions?: number[];
        itemsPerPageLabel?: string;
        paginationPrefix?: string;
        onPageChange?: (page: number) => void;
        onItemsPerPageChange?: (value: number) => void;
        children: Snippet<[row: any, index: number]>;
    }

    let {
        headers,
        rows,
        isLoading,
        emptyMessage,
        sortOptions,
        selectedSort,
        sortLabel,
        onSort,
        onHeaderSort,
        currentPage,
        totalItems,
        itemsPerPage,
        itemsPerPageOptions,
        itemsPerPageLabel,
        paginationPrefix,
        onPageChange,
        onItemsPerPageChange,
        children,
    }: Props = $props();

    const currentSort = $derived(sortOptions?.find((o) => o.key === selectedSort) ?? null);

    function getSortIndicator(header: DataTableHeader): string {
        if (!header.sortable) return "";
        if (!currentSort) return "↕";
        const field = header.sortKey ?? header.key;
        if (currentSort.field === field) {
            return currentSort.direction === "asc" ? "▲" : "▼";
        }
        return "↕";
    }

    const hasSort = $derived(!!sortOptions && sortOptions.length > 0 && !!onSort);
    const hasPagination = $derived(
        currentPage !== undefined && totalItems !== undefined && !!onPageChange,
    );
    const hasItemsPerPage = $derived(
        !!itemsPerPageLabel && !!onItemsPerPageChange && !!itemsPerPageOptions,
    );
</script>

{#if hasSort}
    <div class="flex justify-between">
        <div class="flex flex-row items-center gap-2">
            <p class="text-content font-bold">
                {$t(sortLabel ?? "")}
            </p>
            <select
                value={selectedSort}
                onchange={(e) => onSort?.(e.currentTarget.value)}
                class="border-secondary text-secondary min-w-50 rounded-sm py-1"
                disabled={isLoading}
            >
                {#each sortOptions! as option}
                    <option value={option.key}>{$t(option.label)}</option>
                {/each}
            </select>
        </div>

        {#if hasItemsPerPage}
            <div class="flex flex-row items-center gap-2">
                <p class="text-content font-bold">{$t(itemsPerPageLabel!)}</p>
                <select
                    value={itemsPerPage}
                    onchange={(e) => onItemsPerPageChange?.(Number(e.currentTarget.value))}
                    class="border-secondary text-secondary rounded-sm py-1"
                    disabled={isLoading}
                >
                    {#each itemsPerPageOptions! as option}
                        <option value={option}>{option}</option>
                    {/each}
                </select>
            </div>
        {/if}
    </div>
{/if}

<div class="overflow-x-auto">
    <Table class="w-full table-fixed border-separate border-spacing-y-2">
        <TableHead>
            {#each headers as header, i}
                <TableHeadCell
                    class="bg-black p-4 text-base text-white first:rounded-l-lg last:rounded-r-lg {header.sortable
                        ? 'hover:bg-opacity-80 cursor-pointer select-none'
                        : ''} {header.class ?? ''}"
                    onclick={() => header.sortable && onHeaderSort?.(header.sortKey ?? header.key)}
                >
                    <div class="flex items-center justify-between">
                        <span class="normal-case">{$t(header.key)}</span>
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
            {#if isLoading}
                <TableBodyRow>
                    <TableBodyCell colspan={headers.length}>
                        <div class="flex justify-center py-6">
                            <Loader />
                        </div>
                    </TableBodyCell>
                </TableBodyRow>
            {:else if rows.length === 0}
                <TableBodyRow>
                    <TableBodyCell colspan={headers.length} class="text-center">
                        {$t(emptyMessage)}
                    </TableBodyCell>
                </TableBodyRow>
            {:else}
                {#each rows as row, index}
                    <TableBodyRow
                        class="border-variant1 hover:bg-purple-soft text-content border bg-white transition-colors"
                    >
                        {@render children(row, index)}
                    </TableBodyRow>
                {/each}
            {/if}
        </TableBody>
    </Table>
</div>

{#if hasPagination}
    <Pagination
        {currentPage}
        {totalItems}
        {itemsPerPage}
        i18nPrefix={paginationPrefix}
        {onPageChange}
    />
{/if}
