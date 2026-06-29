<script lang="ts">
    import { t } from "../../i18n/store";
    import {
        isLoading,
        itemsPerPage as storeItemsPerPage,
        totalItems as storeTotalItems,
        currentPage as storeCurrentPage,
    } from "../../stores/chargesPaginationAndSort";
    import Chevron from "../icons/Chevron.svelte";
    import PaginationFirst from "../icons/PaginationFirst.svelte";
    import PaginationLast from "../icons/PaginationLast.svelte";

    let {
        currentPage: currentPageProp,
        totalItems: totalItemsProp,
        itemsPerPage: itemsPerPageProp,
        onPageChange,
    } = $props<{
        currentPage?: number;
        totalItems?: number;
        itemsPerPage?: number;
        onPageChange?: (page: number) => void;
    }>();

    let page = $derived(currentPageProp ?? $storeCurrentPage);
    let total = $derived(totalItemsProp ?? $storeTotalItems);
    let perPage = $derived(itemsPerPageProp ?? $storeItemsPerPage);

    const totalPages = $derived(() => Math.ceil(total / perPage));

    function goToPage(p: number) {
        if (p < 1 || p > totalPages()) return;
        if (onPageChange) {
            onPageChange(p);
        } else {
            $storeCurrentPage = p;
        }
    }

    function getVisiblePages(): (number | string)[] {
        const tp = totalPages();
        const pages: (number | string)[] = [];

        if (tp <= 7) {
            for (let i = 1; i <= tp; i++) pages.push(i);
            return pages;
        }

        const result: (number | string)[] = [];

        if (page <= 4) {
            result.push(1, 2, 3, 4, "…", tp - 1, tp);
            return result.slice(0, 7);
        }

        if (page >= tp - 3) {
            result.push(1, 2, "…", tp - 3, tp - 2, tp - 1, tp);
            return result.slice(-7);
        }

        result.push(1, "…", page - 1, page, page + 1, "…", tp);
        return result;
    }
</script>

<section class="flex flex-row items-center justify-between">
    <nav class="flex items-center gap-1">
        <button
            onclick={() => goToPage(1)}
            class="border-content flex h-10 w-10 items-center justify-center rounded-lg border disabled:opacity-40"
            disabled={page === 1}
        >
            <PaginationFirst class="text-content" />
        </button>
        <button
            onclick={() => goToPage(page - 1)}
            class="border-content flex h-10 w-10 items-center justify-center rounded-lg border disabled:opacity-40"
            disabled={page === 1}
        >
            <Chevron direction="left" width="16" height="16" class="text-content" />
        </button>

        {#each getVisiblePages() as p}
            {#if p === "…"}
                <span class="text-content w-10 text-center">…</span>
            {:else}
                <button
                    onclick={() => typeof p === "number" && goToPage(p)}
                    class="flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium"
                    class:bg-secondary={page === p}
                    class:text-primary={page === p}
                    class:border-secondary={page === p}
                    class:text-secondary={page !== p}
                    class:border-content={page !== p}
                    class:hover:bg-gray-100={page !== p}
                >
                    {p}
                </button>
            {/if}
        {/each}

        <button
            onclick={() => goToPage(page + 1)}
            class="border-content flex h-10 w-10 items-center justify-center rounded-lg border disabled:opacity-40"
            disabled={page === totalPages()}
        >
            <Chevron direction="right" width="16" height="16" class="text-content" />
        </button>
        <button
            onclick={() => goToPage(totalPages())}
            class="border-content flex h-10 w-10 items-center justify-center rounded-lg border disabled:opacity-40"
            disabled={page === totalPages()}
        >
            <PaginationLast class="text-content" />
        </button>
    </nav>

    {#if total > 0}
        <span class="text-content text-sm font-bold">
            {@html $t(
                "pages.admin.charges.pagination.showing",
                { items: perPage, total },
                { allowHTML: true },
            )}
        </span>
    {:else if total === 0 && !$isLoading}
        <span class="text-content text-sm font-bold">
            {@html $t("pages.admin.charges.pagination.noResults")}
        </span>
    {:else}
        <span class="text-content text-sm font-bold">
            {@html $t("pages.admin.charges.pagination.unloaded")}
        </span>
    {/if}
</section>
