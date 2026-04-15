<script module lang="ts">
    export type ActionableState = "accionable" | "accionando" | "accionado";
</script>

<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";

    const sizeStyles = {
        md: "px-8 py-4 rounded-[24px]",
        sm: "px-4 py-2 rounded-[16px]",
    };

    const kindStyles = {
        primary: "bg-primary",
        secondary: "bg-variant1",
        ghost: "inset-ring-1 inset-ring-secondary",
        invert: "",
    };

    interface Props extends Omit<HTMLButtonAttributes, "class" | "onclick"> {
        children: Snippet;
        actionedChildren?: Snippet;
        class?: ClassNameValue;
        size?: keyof typeof sizeStyles;
        kind?: keyof typeof kindStyles;
        action: () => Promise<void>;
        state?: ActionableState;
        /* Time from conform to reset*/
        autoreset?: number;
    }

    let {
        children,
        actionedChildren,
        type = "button",
        class: classes = "",
        size = "md",
        kind = "primary",
        action,
        autoreset,
        state = $bindable("accionable"),
        ...rest
    }: Props = $props();

    async function handleClick() {
        if (state !== "accionable") return;
        state = "accionando";
        try {
            await action();
        } finally {
            state = "accionado";
            if (autoreset !== undefined) {
                setTimeout(() => (state = "accionable"), autoreset);
            }
        }
    }

    export function reset() {
        state = "accionable";
    }
</script>

<button
    {type}
    disabled={state !== "accionable"}
    onclick={handleClick}
    class={twMerge(
        "text-secondary disabled:bg-grey flex w-auto items-center justify-center gap-2 font-bold transition hover:cursor-pointer",
        sizeStyles[size],
        kindStyles[kind],
        classes,
    )}
    {...rest}
>
    {#if state === "accionando"}
        <span class="spinner"></span>
    {:else if state === "accionado"}
        {#if actionedChildren}
            {@render actionedChildren()}
        {:else}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.25em"
                height="1.25em"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        {/if}
    {:else}
        {@render children()}
    {/if}
</button>

<style>
    .spinner {
        width: 1.25em;
        height: 1.25em;
        border: 2px solid currentColor;
        border-bottom-color: transparent;
        border-radius: 50%;
        display: inline-block;
        box-sizing: border-box;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
