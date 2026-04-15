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

    interface Props extends Omit<HTMLButtonAttributes, "class"> {
        children: Snippet;
        class?: ClassNameValue;
        size?: keyof typeof sizeStyles;
        kind?: keyof typeof kindStyles;
    }

    let {
        children,
        type = "button",
        disabled = false,
        class: classes = "",
        size = "md",
        kind = "primary",
        ...rest
    }: Props = $props();
</script>

<button
    {type}
    {disabled}
    class={twMerge(
        "text-secondary disabled:bg-grey flex w-auto items-center justify-center gap-2 font-[700] transition hover:cursor-pointer",
        sizeStyles[size],
        kindStyles[kind],
        classes,
    )}
    {...rest}
>
    {@render children()}
</button>
