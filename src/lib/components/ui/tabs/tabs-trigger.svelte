<script lang="ts">
    import { Tabs as TabsPrimitive } from "bits-ui";
    import { cn } from "$lib/utils.js";

    type $$Props = TabsPrimitive.TriggerProps;
    type $$Events = TabsPrimitive.TriggerEvents;

    let className: $$Props["class"] = undefined;
    export let value: $$Props["value"];
    export { className as class };
</script>

<TabsPrimitive.Trigger
    class={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-t-lg border border-b-0 border-input px-6 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground",
        className,
    )}
    {value}
    {...$$restProps}
    on:click
>
    <slot />
</TabsPrimitive.Trigger>
