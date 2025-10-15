<script>
    export let href;
    export let extraClasses = "";
</script>

<a
    {href}
    class="text-purple-tint hover:text-soft-purple focus:ring-soft-purple focus:ring-offset-secondary rounded-sm transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none {extraClasses}"
>
    <slot />
</a>
