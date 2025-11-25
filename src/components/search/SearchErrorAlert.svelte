<!--
Simple Search Error Alert Component
Displays basic error messages with retry functionality
-->
<script lang="ts">
    import { t } from "../../i18n/store";

    interface Props {
        error?: string | null;
        onRetry?: () => void;
        showRetry?: boolean;
    }

    let { error = null, onRetry, showRetry = true }: Props = $props();

    function handleRetry() {
        onRetry?.();
    }
</script>

{#if error}
    <div
        class="rounded-lg border border-red-200 bg-red-50 p-4"
        role="alert"
        aria-live="polite"
        data-testid="search-error-alert"
    >
        <div class="flex items-start gap-3">
            <!-- Error Icon -->
            <svg
                class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>

            <!-- Error Content -->
            <div class="min-w-0 flex-1">
                <h3 class="text-sm font-medium text-red-800">
                    {$t("search.error.title", "Search Error")}
                </h3>
                <p class="mt-1 text-sm text-red-700">
                    {error}
                </p>

                <!-- Retry Button -->
                {#if showRetry && onRetry}
                    <button
                        type="button"
                        onclick={handleRetry}
                        class="text-white mt-3 inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold transition-colors hover:bg-red-500"
                        data-testid="error-retry-btn"
                    >
                        <svg
                            class="mr-2 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        {$t("search.error.retry", "Try Again")}
                    </button>
                {/if}
            </div>
        </div>
    </div>
{/if}
