<script lang="ts">
    import { t } from "../../i18n/store";

    let { items, total, currentPage = $bindable(1), isLoading } = $props();
    const totalPages = $derived(() => Math.ceil(total / items));

    function goToPage(page: number) {
        if (page < 1 || page > totalPages()) return;
        currentPage = page;
    }

    function getVisiblePages(): (number | string)[] {
        const total = totalPages();
        const pages: (number | string)[] = [];

        if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
            return pages;
        }

        const result: (number | string)[] = [];

        if (currentPage <= 4) {
            result.push(1, 2, 3, 4, "…", total - 1, total);
            return result.slice(0, 7);
        }

        if (currentPage >= total - 3) {
            result.push(1, 2, "…", total - 3, total - 2, total - 1, total);
            return result.slice(-7);
        }

        result.push(1, "…", currentPage - 1, currentPage, currentPage + 1, "…", total);
        return result;
    }
</script>

<section class="flex flex-row items-center justify-between">
    <nav class="flex items-center gap-1">
        <button
            onclick={() => goToPage(1)}
            class="w-[40px] rounded border border-[#5757573D] py-1 text-center disabled:opacity-40
"
            disabled={currentPage === 1}>«</button
        >
        <button
            onclick={() => goToPage(currentPage - 1)}
            class="w-[40px] rounded border border-[#5757573D] py-1 text-center disabled:opacity-40"
            disabled={currentPage === 1}>‹</button
        >

        {#each getVisiblePages() as page}
            {#if page === "..."}
                <span class="text-tertiary w-[40px] border-[#5757573D] text-center">…</span>
            {:else}
                <button
                    onclick={() => typeof page === "number" && goToPage(page)}
                    class="w-[40px] rounded border border-[#5757573D] py-1 text-center text-sm font-medium"
                    class:bg-tertiary={currentPage === page}
                    class:text-primary={currentPage === page}
                    class:text-tertiary={currentPage !== page}
                    class:hover:bg-gray-200={currentPage !== page}
                >
                    {page}
                </button>
            {/if}
        {/each}

        <button
            onclick={() => goToPage(currentPage + 1)}
            class="w-[40px] rounded border border-[#5757573D] py-1 text-center disabled:opacity-40"
            disabled={currentPage === totalPages()}>›</button
        >
        <button
            onclick={() => goToPage(totalPages())}
            class="w-[40px] rounded border border-[#5757573D] py-1 text-center disabled:opacity-40"
            disabled={currentPage === totalPages()}>»</button
        >
    </nav>

    {#if total > 0}
        <span class="text-sm font-bold text-[#575757]">
            {@html $t("contributions.pagination.showing", { items, total }, { allowHTML: true })}
        </span>
    {:else if total === 0 && !isLoading}
        <span class="text-sm font-bold text-[#575757]">
            {@html $t("contributions.pagination.noResults")}
        </span>
    {:else}
        <span class="text-sm font-bold text-[#575757]">
            {@html $t("contributions.pagination.unloaded")}
        </span>
    {/if}
</section>
