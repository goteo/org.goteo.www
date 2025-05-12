<script lang="ts">
    import { t } from "../../i18n/store";
    export let items: number;
    export let total: number;
    export let currentPage: number = 1;
    export let totalPages: number = 1;
    export let onPageChange: (page: number) => void;

    function goToPage(page: number) {
        if (page < 1 || page > totalPages) return;
        onPageChange?.(page);
    }
</script>

<section class="flex flex-row items-center justify-between">
    <nav class="flex items-center gap-1">
        <button
            on:click={() => goToPage(1)}
            class="rounded border px-2 py-1 disabled:opacity-40"
            disabled={currentPage === 1}
        >
            «
        </button>

        <button
            on:click={() => goToPage(currentPage - 1)}
            class="rounded border px-2 py-1 disabled:opacity-40"
            disabled={currentPage === 1}
        >
            ‹
        </button>

        {#each Array(totalPages) as _, i}
            {#if i + 1 <= 3 || i + 1 === currentPage}
                <button
                    on:click={() => goToPage(i + 1)}
                    class="rounded border px-3 py-1 text-sm font-medium
                 {currentPage === i + 1 ? 'bg-purple-800 text-white' : 'hover:bg-gray-200'}"
                >
                    {i + 1}
                </button>
            {/if}
        {/each}

        <button
            on:click={() => goToPage(currentPage + 1)}
            class="rounded border px-2 py-1 disabled:opacity-40"
            disabled={currentPage === totalPages}
        >
            ›
        </button>

        <button
            on:click={() => goToPage(totalPages)}
            class="rounded border px-2 py-1 disabled:opacity-40"
            disabled={currentPage === totalPages}
        >
            »
        </button>
    </nav>
    <span class="text-sm font-bold text-[#575757]">
        {@html $t("contributions.pagination.showing", { items, total }, { allowHTML: true })}
    </span>
</section>
