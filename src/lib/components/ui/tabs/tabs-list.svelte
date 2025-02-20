<script lang="ts">
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	type $$Props = TabsPrimitive.ListProps;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<TabsPrimitive.List
	class={cn(
		"bg-background text-primary-foreground inline-flex items-center justify-center rounded-md px-8 gap-8",
		className
	)}
	{...$$restProps}
>
	<slot />
</TabsPrimitive.List>
