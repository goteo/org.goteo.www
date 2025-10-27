<script>
    import { twMerge } from "tailwind-merge";

    let { href, class: customClass = "", children } = $props();

    const defaultClasses =
        "text-purple-tint hover:text-soft-purple focus:ring-soft-purple focus:ring-offset-secondary rounded-sm transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none";
</script>

<a {href} class={twMerge(defaultClasses, customClass)}>
    {@render children()}
</a>
