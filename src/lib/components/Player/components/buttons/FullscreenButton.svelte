<script lang="ts">
    import type { TooltipPlacement } from "vidstack";

    import Tooltip from "../Tooltip.svelte";

    export let tooltipPlacement: TooltipPlacement;
</script>

<Tooltip placement={tooltipPlacement}>
    <media-fullscreen-button
        class="group relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset ring-media-focus hover:bg-white/20 aria-hidden:hidden data-[focus]:ring-4"
        slot="trigger"
    >
        <media-icon class="h-8 w-8 media-fullscreen:hidden" type="fullscreen" />
        <media-icon class="hidden h-8 w-8 media-fullscreen:block" type="fullscreen-exit" />
    </media-fullscreen-button>

    <svelte:fragment slot="content">
        <span class="media-fullscreen:hidden">Enter Fullscreen</span>
        <span class="hidden media-fullscreen:block">Exit Fullscreen</span>
    </svelte:fragment>
</Tooltip>
