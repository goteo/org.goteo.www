<!--
Loading Spinner Component
Reusable loading indicator for search operations
Follows accessibility best practices with proper ARIA attributes
-->
<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        size?: "sm" | "md" | "lg";
        color?: string;
    }

    let { size = "md", color = "currentColor", class: className = "", ...props }: Props = $props();

    // Size mappings
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
    };
</script>

<div
    class={`inline-block animate-spin ${sizeClasses[size]} ${className}`}
    role="status"
    aria-label="Loading..."
    data-testid="loading-spinner"
    {...props}
>
    <svg class="h-full w-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="2"
            stroke-opacity="0.25"
        />
        <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-2a8 8 0 0 0-8-8V2z" />
    </svg>
    <span class="sr-only">Loading...</span>
</div>

<style>
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
