<script lang="ts">
    import { t } from "../../../i18n/store";
    import Chevron from "../../icons/navigation/Chevron.svelte";
    import PaginationFirst from "../../icons/PaginationFirst.svelte";
    import PaginationLast from "../../icons/PaginationLast.svelte";
    import PaginationNavButton from "../buttons/PaginationNavButton.svelte";

    let {
        currentPage: currentPageProp = 1,
        totalItems: totalItemsProp = 0,
        itemsPerPage: itemsPerPageProp = 10,
        isLoading = false,
        onPageChange,
        i18nPrefix = "common.pagination",
    } = $props<{
        currentPage?: number;
        totalItems?: number;
        itemsPerPage?: number;
        isLoading?: boolean;
        onPageChange?: (page: number) => void;
        i18nPrefix?: string;
    }>();

    const totalPages = $derived(Math.max(1, Math.ceil(totalItemsProp / itemsPerPageProp)));
    const page = $derived(Math.min(Math.max(1, currentPageProp), totalPages));
    const shownItems = $derived(
        Math.min(itemsPerPageProp, totalItemsProp - (page - 1) * itemsPerPageProp),
    );

    function goToPage(p: number) {
        if (p < 1 || p > totalPages) return;
        if (p === page) return;
        onPageChange?.(p);
    }

    interface VisiblePage {
        key: string;
        kind: "page" | "ellipsis";
        value: number;
    }

    function getVisiblePages(): VisiblePage[] {
        const tp = totalPages;
        const pages: VisiblePage[] = [];

        if (tp <= 7) {
            for (let i = 1; i <= tp; i++) pages.push({ key: `p-${i}`, kind: "page", value: i });
            return pages;
        }

        const window = 1;

        const first = 1;
        const last = tp;

        pages.push({ key: `p-${first}`, kind: "page", value: first });

        const left = page - window;
        const right = page + window;

        if (left > 2) pages.push({ key: "e-left", kind: "ellipsis", value: 0 });

        const start = Math.max(2, left);
        const end = Math.min(tp - 1, right);

        for (let i = start; i <= end; i++) pages.push({ key: `p-${i}`, kind: "page", value: i });

        if (right < tp - 1) pages.push({ key: "e-right", kind: "ellipsis", value: 0 });

        if (last !== first) pages.push({ key: `p-${last}`, kind: "page", value: last });

        return pages;
    }
</script>

<section class="flex items-center justify-between">
    <div class="overflow-x-auto">
        <nav class="flex w-max items-center gap-1" aria-label="pagination">
            <PaginationNavButton
                onClick={() => goToPage(1)}
                disabled={page === 1}
                ariaLabel="first page"
            >
                <PaginationFirst class="text-content" />
            </PaginationNavButton>
            <PaginationNavButton
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                ariaLabel="previous page"
            >
                <Chevron direction="left" width="16" height="16" class="text-content" />
            </PaginationNavButton>

            {#each getVisiblePages() as p (p.key)}
                {#if p.kind === "ellipsis"}
                    <span class="text-content w-10 shrink-0 text-center">…</span>
                {:else}
                    <button
                        onclick={() => goToPage(p.value)}
                        aria-current={page === p.value ? "page" : undefined}
                        aria-label="page {p.value}"
                        class="flex h-10 w-fit min-w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border px-2 text-sm font-medium"
                        class:bg-secondary={page === p.value}
                        class:text-primary={page === p.value}
                        class:border-secondary={page === p.value}
                        class:text-secondary={page !== p.value}
                        class:border-content={page !== p.value}
                        class:hover:bg-gray-100={page !== p.value}
                    >
                        {p.value}
                    </button>
                {/if}
            {/each}

            <PaginationNavButton
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                ariaLabel="next page"
            >
                <Chevron direction="right" width="16" height="16" class="text-content" />
            </PaginationNavButton>
            <PaginationNavButton
                onClick={() => goToPage(totalPages)}
                disabled={page === totalPages}
                ariaLabel="last page"
            >
                <PaginationLast class="text-content" />
            </PaginationNavButton>
        </nav>
    </div>
    {#if totalItemsProp > 0}
        <span class="text-content text-sm font-bold">
            {$t(`${i18nPrefix}.showing`, {
                items: shownItems,
                total: totalItemsProp,
            })}
        </span>
    {:else if totalItemsProp === 0 && !isLoading}
        <span class="text-content text-sm font-bold">
            {$t(`${i18nPrefix}.noResults`)}
        </span>
    {:else}
        <span class="text-content text-sm font-bold">
            {$t(`${i18nPrefix}.unloaded`)}
        </span>
    {/if}
</section>
