<!--
Simple Search Pagination Component
Basic numbered pagination for search results
-->
<script lang="ts">
    import {
        searchStore,
        currentPage,
        totalPages,
        hasNextPage,
        hasPrevPage,
        paginationInfo,
    } from "../../stores/searchStore";
    import { t } from "../../i18n/store";

    interface Props {
        maxVisiblePages?: number;
        showSummary?: boolean;
        class?: string;
    }

    let { maxVisiblePages = 5, showSummary = true, class: className = "" }: Props = $props();

    // Generate page numbers to display
    function getVisiblePages(current: number, total: number, maxVisible: number) {
        if (total <= maxVisible) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        const half = Math.floor(maxVisible / 2);
        let start = Math.max(1, current - half);
        let end = Math.min(total, start + maxVisible - 1);

        if (end === total) {
            start = Math.max(1, end - maxVisible + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    const visiblePages = $derived(getVisiblePages($currentPage, $totalPages, maxVisiblePages));

    function goToPage(page: number) {
        searchStore.goToPage(page);
    }

    function goToPrevious() {
        searchStore.loadPreviousPage();
    }

    function goToNext() {
        searchStore.loadNextPage();
    }
</script>

{#if $totalPages > 1}
    <nav class="flex flex-col gap-4 {className}" aria-label="Search results pagination">
        <!-- Summary -->
        {#if showSummary}
            <div class="text-center text-sm text-gray-600">
                {$t(
                    "search.pagination.summary",
                    `Page ${$currentPage} of ${$totalPages} (${$paginationInfo.totalCount} results)`,
                    {
                        current: $currentPage,
                        total: $totalPages,
                        count: $paginationInfo.totalCount,
                    },
                )}
            </div>
        {/if}

        <!-- Pagination Controls -->
        <div class="flex items-center justify-center gap-2">
            <!-- Previous Button -->
            <button
                onclick={goToPrevious}
                disabled={!$hasPrevPage}
                class="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous page"
            >
                <svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                {$t("search.pagination.previous", "Previous")}
            </button>

            <!-- Page Numbers -->
            <div class="flex items-center gap-1">
                {#each visiblePages as page}
                    <button
                        onclick={() => goToPage(page)}
                        class="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium {page ===
                        $currentPage
                            ? 'border border-blue-600 bg-blue-600 text-white'
                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
                        aria-label={page === $currentPage
                            ? `Current page ${page}`
                            : `Go to page ${page}`}
                        aria-current={page === $currentPage ? "page" : undefined}
                    >
                        {page}
                    </button>
                {/each}
            </div>

            <!-- Next Button -->
            <button
                onclick={goToNext}
                disabled={!$hasNextPage}
                class="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next page"
            >
                {$t("search.pagination.next", "Next")}
                <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>
        </div>
    </nav>
{/if}
