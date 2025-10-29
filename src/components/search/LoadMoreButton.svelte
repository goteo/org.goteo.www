<!--
Load More Button Component
Allows accumulative pagination for search results
-->
<script lang="ts">
    import { t } from "../../i18n/store";
    import LoadingSpinner from "./LoadingSpinner.svelte";
    import Button from "../library/Button.svelte";

    interface Props {
        onLoadMore: () => void | Promise<void>;
        isLoading: boolean;
        hasMore: boolean;
        loadedCount: number;
        disabled?: boolean;
    }

    let {
        onLoadMore,
        isLoading = false,
        hasMore = true,
        loadedCount = 0,
        disabled = false,
    }: Props = $props();

    // Track when new results are loaded for accessibility announcements
    let previousLoadedCount = $state(loadedCount);
    let justLoaded = $state(false);
    let newResultsCount = $state(0);

    $effect(() => {
        if (loadedCount > previousLoadedCount && !isLoading) {
            justLoaded = true;
            newResultsCount = loadedCount - previousLoadedCount;
            previousLoadedCount = loadedCount;

            // Reset announcement after screen reader has time to read it
            setTimeout(() => {
                justLoaded = false;
            }, 3000);
        }
    });

    async function handleClick() {
        await onLoadMore();
    }
</script>

<!-- Load More Button -->
{#if hasMore}
    <div class="flex flex-col items-center gap-4">
        <Button
            onclick={handleClick}
            disabled={isLoading || disabled}
            aria-busy={isLoading}
            aria-label={isLoading ? $t("search.loadMore.loading") : $t("search.loadMore.button")}
            kind="primary"
            size="md"
        >
            {#if isLoading}
                <span class="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>{$t("search.loadMore.loading")}</span>
                </span>
            {:else}
                <span>{$t("search.loadMore.button")}</span>
            {/if}
        </Button>

        <!-- Results count indicator -->
        <p class="text-secondary text-sm">
            {$t("search.results.showing", { count: loadedCount })}
        </p>
    </div>

    <!-- Screen reader announcement for new results -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
        {#if justLoaded}
            {$t("search.loadMore.announcement", {
                count: newResultsCount,
                loaded: loadedCount,
            })}
        {/if}
    </div>
{/if}

<style>
    /* Screen reader only class */
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
</style>
