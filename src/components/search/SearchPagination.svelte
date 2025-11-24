<!--
Simple Search Pagination Component
Previous/Next navigation for search results
-->
<script lang="ts">
    import { searchStore, currentPage, hasNextPage, hasPrevPage } from "../../stores/searchStore";
    import { t } from "../../i18n/store";

    interface Props {
        maxVisiblePages?: number;
        showSummary?: boolean;
        class?: string;
    }

    let { showSummary = true, class: className = "" }: Props = $props();

    function goToPrevious() {
        searchStore.loadPreviousPage();
    }

    function goToNext() {
        searchStore.loadNextPage();
    }
</script>

{#if $hasPrevPage || $hasNextPage}
    <nav class="flex flex-col gap-4 {className}" aria-label="Search results pagination">
        <!-- Summary -->
        {#if showSummary}
            <div class="text-center text-sm text-gray-600">
                {$t("search.pagination.page", { page: $currentPage })}
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
                {$t("search.pagination.previous")}
            </button>

            <!-- Current Page Indicator -->
            <div
                class="inline-flex items-center rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700"
            >
                {$t("search.pagination.currentPage", { page: $currentPage })}
            </div>

            <!-- Next Button -->
            <button
                onclick={goToNext}
                disabled={!$hasNextPage}
                class="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next page"
            >
                {$t("search.pagination.next")}
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
