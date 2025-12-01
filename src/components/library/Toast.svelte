<script lang="ts">
    import { twMerge } from "tailwind-merge";

    let {
        variant = "error",
        iconSrc,
        children,
    }: {
        variant?: keyof typeof variantStyles;
        iconSrc?: string;
        children: any;
    } = $props();

    const variantStyles = {
        error: "border-tertiary bg-semantic-error",
        success: "border-primary bg-semantic-success",
        notification: "border-variant3 bg-semantic-notification",
        warning: "border-variant4 bg-semantic-warning",
    };

    function closeToast() {
        // Implement toast close functionality here
    }
</script>

<div class={twMerge("flex items-center justify-between border", variantStyles[variant])}>
    <div class="max-w-md min-w-[20rem] rounded-lg py-6 text-white shadow-lg">
        {#if iconSrc}
            <img src={iconSrc} alt="" class="absolute top-4 left-4 h-6 w-6" />
        {/if}
        {@render children()}
    </div>
    <button onclick={closeToast} aria-label="Close">
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
