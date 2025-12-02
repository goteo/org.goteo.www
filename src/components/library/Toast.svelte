<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";
    import ErrorIcon from "../../svgs/ErrorIcon.svelte";
    import SuccessIcon from "../../svgs/SuccessIcon.svelte";
    import NotificationIcon from "../../svgs/NotificationIcon.svelte";
    import WarningIcon from "../../svgs/WarningIcon.svelte";
    import { innerWidth } from "svelte/reactivity/window";

    let {
        variant = "error",
        button,
        link,
        class: classes = "",
        children,
    }: {
        variant?: keyof typeof variantStyles;
        button?: () => any;
        link?: () => any;
        class?: ClassNameValue;
        children: any;
    } = $props();

    let showToast = $state(true);
    let deviceWidth = $state(innerWidth);

    const variantStyles = {
        error: "border-tertiary bg-semantic-error",
        success: "border-primary bg-semantic-success",
        notification: "border-variant3 bg-semantic-notification",
        warning: "border-variant4 bg-semantic-warning",
    };

    $effect(() => {
        const handleResize = () => {
            deviceWidth = innerWidth;
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    });
</script>

<div
    class={twMerge(
        `flex min-w-[327px] items-center justify-between rounded-lg border p-6 @max-sm:gap-4`,
        classes,
        variantStyles[variant],
        showToast ? "opacity-100" : "hidden opacity-0",
    )}
>
    {#if deviceWidth > 640}
        <div class="flex items-center justify-center gap-4">
            {#if variantStyles[variant] === variantStyles.error}
                <ErrorIcon class="size-6" />
            {:else if variantStyles[variant] === variantStyles.success}
                <SuccessIcon class="size-6" />
            {:else if variantStyles[variant] === variantStyles.notification}
                <NotificationIcon class="size-6" />
            {:else if variantStyles[variant] === variantStyles.warning}
                <WarningIcon className="size-6" />
            {/if}
            {#if children}
                <div class="text-center">
                    {@render children()}
                </div>
            {/if}
        </div>
        <div class="flex items-center gap-4">
            {@render button?.()}
            {@render link?.()}
            <button onclick={() => (showToast = false)} aria-label="Close Toast" class="p-1">
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
    {:else}
        
    {/if}
</div>
