<script lang="ts">
    import type { TooltipPlacement } from "vidstack";

    import Tooltip from "../Tooltip.svelte";

    export let tooltipPlacement: TooltipPlacement;
</script>

<Tooltip placement={tooltipPlacement}>
    <media-caption-button
        class="group relative mr-0.5 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset ring-media-focus hover:bg-white/20 aria-hidden:hidden data-[focus]:ring-4"
        slot="trigger"
    >
        <media-icon class="hidden h-8 w-8 media-captions:block" type="closed-captions-on" />
        <media-icon class="h-8 w-8 media-captions:hidden" type="closed-captions" />
    </media-caption-button>

    <svelte:fragment slot="content">
        <span class="hidden media-captions:block">Closed-Captions Off</span>
        <span class="media-captions:hidden">Closed-Captions On</span>
    </svelte:fragment>
</Tooltip>
