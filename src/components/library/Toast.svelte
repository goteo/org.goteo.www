<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";
    import ErrorIcon from "../../svgs/ErrorIcon.svelte";
    import SuccessIcon from "../../svgs/SuccessIcon.svelte";
    import NotificationIcon from "../../svgs/NotificationIcon.svelte";
    import WarningIcon from "../../svgs/WarningIcon.svelte";
    import type { Snippet } from "svelte";

    let {
        variant = "error",
        button,
        link,
        class: classes = "",
        children,
    }: {
        variant?: keyof typeof variantStyles;
        button?: () => Snippet;
        link?: () => Snippet;
        class?: ClassNameValue;
        children: any;
    } = $props();

    let showToast = $state(true);

    const variantStyles = {
        error: "border-tertiary bg-semantic-error",
        success: "border-primary bg-semantic-success",
        notification: "border-variant3 bg-semantic-notification",
        warning: "border-variant4 bg-semantic-warning",
    };
</script>

{#if showToast}
    <div
        class={twMerge(
            "flex max-w-[1360px] min-w-[327px] items-start gap-4 self-center rounded-lg border p-6 sm:items-center sm:justify-between",
            variantStyles[variant],
            classes,
        )}
    >
        <div class="flex items-start justify-center gap-4 sm:items-center">
            {#if variant === "error"}
                <ErrorIcon class="size-5 shrink-0 sm:size-6" />
            {:else if variant === "success"}
                <SuccessIcon class="size-5 shrink-0 sm:size-6" />
            {:else if variant === "notification"}
                <NotificationIcon class="size-5 shrink-0 sm:size-6" />
            {:else if variant === "warning"}
                <WarningIcon className="size-5 sm:size-6 shrink-0" />
            {/if}
            {#if children}
                <p class="text-sm leading-6 font-normal text-[#000]">
                    {@render children()}
                </p>
            {/if}
        </div>
        <div class="flex items-start gap-4 sm:items-center">
            {#if button || link}
                <div class="hidden sm:flex">
                    {@render button?.()}
                    {@render link?.()}
                </div>
            {/if}
            <button
                onclick={() => (showToast = false)}
                aria-label="Close toast"
                class="flex h-6 w-6 cursor-pointer items-center justify-center"
            >
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M0.21967 0.21967C0.512563 -0.0732233 0.987437 -0.0732233 1.28033 0.21967L7.5 6.43934L13.7197 0.21967C14.0126 -0.0732233 14.4874 -0.0732233 14.7803 0.21967C15.0732 0.512563 15.0732 0.987437 14.7803 1.28033L8.56066 7.5L14.7803 13.7197C15.0732 14.0126 15.0732 14.4874 14.7803 14.7803C14.4874 15.0732 14.0126 15.0732 13.7197 14.7803L7.5 8.56066L1.28033 14.7803C0.987437 15.0732 0.512563 15.0732 0.21967 14.7803C-0.0732233 14.4874 -0.0732233 14.0126 0.21967 13.7197L6.43934 7.5L0.21967 1.28033C-0.0732233 0.987437 -0.0732233 0.512563 0.21967 0.21967Z"
                        fill="#462949"
                    />
                </svg>
            </button>
        </div>
        {#if button || link}
            <div class="mt-6 flex items-center justify-center sm:hidden">
                {@render button?.()}
                {@render link?.()}
            </div>
        {/if}
    </div>
{/if}
