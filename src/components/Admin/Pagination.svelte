<script lang="ts">
    import { t } from "../../i18n/store";
    import { isLoading, itemsPerPage, totalItems, currentPage } from "../../stores/chargesPagination";

    const totalPages = $derived(() => Math.ceil($totalItems / $itemsPerPage));

    function goToPage(page: number) {
        if (page < 1 || page > totalPages()) return;
        $currentPage = page;
    }

    function getVisiblePages(): (number | string)[] {
        const total = totalPages();
        const pages: (number | string)[] = [];

        if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
            return pages;
        }

        const result: (number | string)[] = [];

        if ($currentPage <= 4) {
            result.push(1, 2, 3, 4, "…", total - 1, total);
            return result.slice(0, 7);
        }

        if ($currentPage >= total - 3) {
            result.push(1, 2, "…", total - 3, total - 2, total - 1, total);
            return result.slice(-7);
        }

        result.push(1, "…", $currentPage - 1, $currentPage, $currentPage + 1, "…", total);
        return result;
    }
</script>

<section class="flex flex-row items-center justify-between">
    <nav class="flex items-center gap-1">
        <button
            onclick={() => goToPage(1)}
            class="border-content w-10 rounded border py-1 text-center disabled:opacity-40
"
            disabled={$currentPage === 1}>«</button
        >
        <button
            onclick={() => goToPage($currentPage - 1)}
            class="border-content w-10 rounded border py-1 text-center disabled:opacity-40"
            disabled={$currentPage === 1}>‹</button
        >

        {#each getVisiblePages() as page}
            {#if page === "..."}
                <span class="text-secondary border-content w-10 text-center">…</span>
            {:else}
                <button
                    onclick={() => typeof page === "number" && goToPage(page)}
                    class="border-content w-10 rounded border py-1 text-center text-sm font-medium"
                    class:bg-secondary={$currentPage === page}
                    class:text-primary={$currentPage === page}
                    class:text-secondary={$currentPage !== page}
                    class:hover:bg-gray-200={$currentPage !== page}
                >
                    {page}
                </button>
            {/if}
        {/each}

        <button
            onclick={() => goToPage($currentPage + 1)}
            class="border-content w-10 rounded border py-1 text-center disabled:opacity-40"
            disabled={$currentPage === totalPages()}>›</button
        >
        <button
            onclick={() => goToPage(totalPages())}
            class="border-content w-10 rounded border py-1 text-center disabled:opacity-40"
            disabled={$currentPage === totalPages()}>»</button
        >
    </nav>

    {#if $totalItems > 0}
        <span class="text-content text-sm font-bold">
            {@html $t("contributions.pagination.showing", { items: $itemsPerPage, total: $totalItems }, { allowHTML: true })}
        </span>
    {:else if $totalItems === 0 && !$isLoading}
        <span class="text-content text-sm font-bold">
            {@html $t("contributions.pagination.noResults")}
        </span>
    {:else}
        <span class="text-content text-sm font-bold">
            {@html $t("contributions.pagination.unloaded")}
        </span>
    {/if}
</section>
