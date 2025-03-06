<script lang="ts">
    import { Tabs as TabsPrimitive } from "bits-ui";
    import { cn } from "$lib/utils.js";

    type $$Props = TabsPrimitive.ListProps;

    let className: $$Props["class"] = undefined;
    export { className as class };
</script>

<TabsPrimitive.List
    class={cn(
        "inline-flex items-center justify-center gap-8 rounded-md bg-background px-8 text-primary-foreground",
        className,
    )}
    {...$$restProps}
>
    <slot />
</TabsPrimitive.List>
